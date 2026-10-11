/*
 * Jass 插件静态文件更新工具
 * 纯 Win32 C 程序，静态链接，无需额外运行库
 *
 * Release 版本下载源: https://raw.githubusercontent.com/naichabaobao/jass/master/static/
 * Debug   版本下载源: https://raw.githubusercontent.com/jzy-chitong56/jass/master/static/
 *
 * Debug 版本额外特性：弹框中显示可复制的运行日志
 *
 * 注意：本工具刻意不使用 swprintf/vswprintf 格式化宽字符串，
 *       因为 MinGW 的实现对 %ls 支持不稳定，会导致宽字符串被截断为单字符。
 *       所有字符串拼接均使用 wcscpy_s / wcscat_s，日志使用自定义格式化器。
 */

#include <windows.h>
#include <winhttp.h>
#include <shellapi.h>
#include <stdio.h>
#include <string.h>
#include <stdarg.h>

#pragma comment(lib, "winhttp.lib")
#pragma comment(lib, "user32.lib")
#pragma comment(lib, "kernel32.lib")
#pragma comment(lib, "shell32.lib")

/* ---------- 需要更新的文件列表 ---------- */
static const wchar_t *g_files[] = {
    L"AIScripts.ai",
    L"Cheats.j",
    L"DzAPI.j",
    L"InitCheats.j",
    L"blizzard.j",
    L"common.ai",
    L"common.j",
    L"numbers.jass",
    L"presets.jass",
    L"strings.jass",
    L"war3map.j",
};
static const int g_fileCount = (int)(sizeof(g_files) / sizeof(g_files[0]));

/* ---------- 下载源配置 ---------- */
#ifdef JASS_DEBUG
#define GITHUB_USER L"jzy-chitong56"
#else
#define GITHUB_USER L"naichabaobao"
#endif

#define GITHUB_REPO   L"jass"
#define GITHUB_BRANCH L"master"
#define GITHUB_SUBDIR L"static"
#define GITHUB_REPO_URL L"https://github.com/jzy-chitong56/jass"

/* ---------- 错误原因 ---------- */
typedef enum {
    ERR_NONE = 0,
    ERR_PLUGIN_NOT_FOUND,
    ERR_DOWNLOAD_FAILED,
    ERR_WRITE_FAILED,
    ERR_REPLACE_FAILED,
} UpdateError;

/* ---------- 自定义宽字符串格式化（不依赖 vswprintf） ----------
 * 支持的格式说明符：
 *   %%    字面百分号
 *   %s    窄字符串 (char*)  —— 按单字节逐字符转为宽字符
 *   %ls   宽字符串 (wchar_t*)
 *   %d    int
 *   %ld   long
 *   %u    unsigned int
 *   %lu   unsigned long
 */
static int WStrFromInt(long long val, wchar_t *buf, int bufSize)
{
    wchar_t tmp[32];
    int i = 0;
    int neg = 0;
    unsigned long long uval;

    if (val < 0) {
        neg = 1;
        uval = (unsigned long long)(-(val + 1)) + 1ULL;
    } else {
        uval = (unsigned long long)val;
    }

    if (uval == 0) {
        tmp[i++] = L'0';
    } else {
        while (uval > 0) {
            tmp[i++] = L'0' + (wchar_t)(uval % 10);
            uval /= 10;
        }
    }

    int len = 0;
    if (neg && len < bufSize - 1) buf[len++] = L'-';
    while (i > 0 && len < bufSize - 1) {
        buf[len++] = tmp[--i];
    }
    buf[len] = 0;
    return len;
}

static int WStrFromUInt(unsigned long long val, wchar_t *buf, int bufSize)
{
    wchar_t tmp[32];
    int i = 0;

    if (val == 0) {
        tmp[i++] = L'0';
    } else {
        while (val > 0) {
            tmp[i++] = L'0' + (wchar_t)(val % 10);
            val /= 10;
        }
    }

    int len = 0;
    while (i > 0 && len < bufSize - 1) {
        buf[len++] = tmp[--i];
    }
    buf[len] = 0;
    return len;
}

static void FormatWide(wchar_t *buf, size_t bufSize, const wchar_t *fmt, va_list args)
{
    size_t pos = 0;
    buf[0] = 0;

    while (*fmt && pos < bufSize - 1) {
        if (*fmt != L'%') {
            buf[pos++] = *fmt++;
            buf[pos] = 0;
            continue;
        }
        fmt++; /* skip '%' */

        if (*fmt == L'%') {
            buf[pos++] = L'%';
            buf[pos] = 0;
            fmt++;
            continue;
        }

        /* 长度修饰符 l */
        int isLong = 0;
        if (*fmt == L'l') {
            isLong = 1;
            fmt++;
        }

        wchar_t spec = *fmt;
        fmt++;

        switch (spec) {
        case L's': {
            if (isLong) {
                const wchar_t *s = va_arg(args, const wchar_t *);
                if (s) {
                    while (*s && pos < bufSize - 1) {
                        buf[pos++] = *s++;
                    }
                    buf[pos] = 0;
                }
            } else {
                const char *s = va_arg(args, const char *);
                if (s) {
                    while (*s && pos < bufSize - 1) {
                        buf[pos++] = (wchar_t)(unsigned char)*s++;
                    }
                    buf[pos] = 0;
                }
            }
            break;
        }
        case L'd': {
            long long val = isLong ? (long long)va_arg(args, long)
                                   : (long long)va_arg(args, int);
            wchar_t tmp[32];
            int n = WStrFromInt(val, tmp, 32);
            for (int k = 0; k < n && pos < bufSize - 1; k++) {
                buf[pos++] = tmp[k];
            }
            buf[pos] = 0;
            break;
        }
        case L'u': {
            unsigned long long val = isLong
                ? (unsigned long long)va_arg(args, unsigned long)
                : (unsigned long long)va_arg(args, unsigned int);
            wchar_t tmp[32];
            int n = WStrFromUInt(val, tmp, 32);
            for (int k = 0; k < n && pos < bufSize - 1; k++) {
                buf[pos++] = tmp[k];
            }
            buf[pos] = 0;
            break;
        }
        default:
            /* 未知说明符，原样输出 */
            if (pos < bufSize - 1) {
                buf[pos++] = spec;
                buf[pos] = 0;
            }
            break;
        }
    }
    buf[bufSize - 1] = 0;
}

/* ---------- 便捷拼接宏 ---------- */
#define WBUF_INIT(buf, size)        do { (buf)[0] = 0; } while (0)
#define WBUF_APPEND(buf, size, str) wcscat_s((buf), (size), (str))

/* ---------- 运行日志（所有版本均启用，方便用户反馈问题） ---------- */
static wchar_t g_logBuf[32768];
static int g_logLen = 0;

static void Log(const wchar_t *fmt, ...)
{
    va_list args;
    va_start(args, fmt);
    wchar_t line[2048];
    FormatWide(line, 2048, fmt, args);
    va_end(args);

    int n = (int)wcslen(line);
    if (n <= 0) return;
    if (g_logLen + n + 2 < (int)(sizeof(g_logBuf) / sizeof(wchar_t))) {
        memcpy(g_logBuf + g_logLen, line, n * sizeof(wchar_t));
        g_logLen += n;
        g_logBuf[g_logLen++] = L'\r';
        g_logBuf[g_logLen++] = L'\n';
        g_logBuf[g_logLen] = 0;
    }
}

static void ClearLog(void)
{
    g_logLen = 0;
    g_logBuf[0] = 0;
}

/* ---------- 自定义弹窗 ---------- */
static HWND g_msgBoxHwnd = NULL;
static volatile BOOL g_msgBoxClosed = FALSE;

static LRESULT CALLBACK MsgBoxWndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam)
{
    switch (msg) {
    case WM_COMMAND:
        if (LOWORD(wParam) == 1001 && HIWORD(wParam) == BN_CLICKED) {
            g_msgBoxClosed = TRUE;
            DestroyWindow(hwnd);
            return 0;
        }
        break;
    case WM_CLOSE:
        g_msgBoxClosed = TRUE;
        DestroyWindow(hwnd);
        return 0;
    case WM_DESTROY:
        g_msgBoxClosed = TRUE;
        break;
    }
    return DefWindowProcW(hwnd, msg, wParam, lParam);
}

static void ShowCustomMsgBox(const wchar_t *title, const wchar_t *message, const wchar_t *btnText)
{
    HWND hwndOwner = GetDesktopWindow();
    HINSTANCE hInst = (HINSTANCE)GetWindowLongPtrW(hwndOwner, GWLP_HINSTANCE);

    static BOOL classRegistered = FALSE;
    if (!classRegistered) {
        WNDCLASSW wc = {0};
        wc.lpfnWndProc = MsgBoxWndProc;
        wc.hInstance = hInst;
        wc.lpszClassName = L"JassMsgBox";
        wc.hCursor = LoadCursor(NULL, IDC_ARROW);
        wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
        RegisterClassW(&wc);
        classRegistered = TRUE;
    }

    g_msgBoxClosed = FALSE;

    /* 所有版本均使用带日志的大弹窗，方便用户反馈问题 */
    int dlgW = 560, dlgH = 440;

    HWND dlg = CreateWindowExW(
        WS_EX_DLGMODALFRAME | WS_EX_TOPMOST,
        L"JassMsgBox", title,
        WS_POPUP | WS_CAPTION | WS_SYSMENU,
        CW_USEDEFAULT, CW_USEDEFAULT, dlgW, dlgH,
        hwndOwner, NULL, hInst, NULL);
    if (!dlg) {
        MessageBoxW(hwndOwner, message, title, MB_OK | MB_ICONINFORMATION);
        return;
    }
    g_msgBoxHwnd = dlg;

    /* 提示文本 */
    CreateWindowExW(0, L"STATIC", message,
        WS_CHILD | WS_VISIBLE | SS_LEFT,
        20, 15, dlgW - 40, 30, dlg, NULL, hInst, NULL);

    /* 日志标签 */
    CreateWindowExW(0, L"STATIC", L"运行日志（可选中复制反馈）：",
        WS_CHILD | WS_VISIBLE | SS_LEFT,
        20, 50, dlgW - 40, 20, dlg, NULL, hInst, NULL);

    /* 可复制的多行只读日志编辑框 */
    HWND hLog = CreateWindowExW(WS_EX_CLIENTEDGE, L"EDIT", g_logBuf,
        WS_CHILD | WS_VISIBLE | WS_VSCROLL | ES_MULTILINE | ES_READONLY | ES_AUTOVSCROLL,
        20, 70, dlgW - 40, dlgH - 140, dlg, NULL, hInst, NULL);
    HFONT hLogFont = (HFONT)GetStockObject(ANSI_FIXED_FONT);
    SendMessageW(hLog, WM_SETFONT, (WPARAM)hLogFont, TRUE);

    int btnY = dlgH - 70;

    /* 按钮 */
    HWND hBtn = CreateWindowExW(0, L"BUTTON", btnText,
        WS_CHILD | WS_VISIBLE | BS_DEFPUSHBUTTON,
        (dlgW - 120) / 2, btnY, 120, 32, dlg, (HMENU)1001, hInst, NULL);
    HFONT hFont = (HFONT)GetStockObject(DEFAULT_GUI_FONT);
    SendMessageW(hBtn, WM_SETFONT, (WPARAM)hFont, TRUE);

    /* 居中 */
    RECT rcOwner, rcDlg;
    GetWindowRect(hwndOwner, &rcOwner);
    GetWindowRect(dlg, &rcDlg);
    int x = rcOwner.left + ((rcOwner.right - rcOwner.left) - (rcDlg.right - rcDlg.left)) / 2;
    int y = rcOwner.top + ((rcOwner.bottom - rcOwner.top) - (rcDlg.bottom - rcDlg.top)) / 2;
    SetWindowPos(dlg, NULL, x, y, 0, 0, SWP_NOSIZE | SWP_NOZORDER);

    EnableWindow(hwndOwner, FALSE);
    ShowWindow(dlg, SW_SHOW);
    UpdateWindow(dlg);

    MSG msg;
    while (!g_msgBoxClosed && GetMessageW(&msg, NULL, 0, 0) > 0) {
        if (!IsWindow(dlg) || !IsDialogMessageW(dlg, &msg)) {
            TranslateMessage(&msg);
            DispatchMessageW(&msg);
        }
        if (g_msgBoxClosed) break;
    }

    EnableWindow(hwndOwner, TRUE);
    SetForegroundWindow(hwndOwner);
    g_msgBoxHwnd = NULL;
}

/* ---------- 网络下载 ---------- */
static BYTE *DownloadFile(const wchar_t *fileName, DWORD *outSize)
{
    HINTERNET hSession = NULL, hConnect = NULL, hRequest = NULL;
    BYTE *result = NULL;
    DWORD totalSize = 0;
    DWORD cap = 65536;
    BYTE *buf = (BYTE *)malloc(cap);
    if (!buf) {
        Log(L"[下载] 内存分配失败: %ls", fileName);
        return NULL;
    }

    /* 构造 URL 路径（不使用 swprintf，直接拼接）
     * 完整格式: /<user>/<repo>/<branch>/<subdir>/<file>
     */
    wchar_t urlPath[512];
    WBUF_INIT(urlPath, 512);
    WBUF_APPEND(urlPath, 512, L"/");
    WBUF_APPEND(urlPath, 512, GITHUB_USER);
    WBUF_APPEND(urlPath, 512, L"/");
    WBUF_APPEND(urlPath, 512, GITHUB_REPO);
    WBUF_APPEND(urlPath, 512, L"/");
    WBUF_APPEND(urlPath, 512, GITHUB_BRANCH);
    WBUF_APPEND(urlPath, 512, L"/");
    WBUF_APPEND(urlPath, 512, GITHUB_SUBDIR);
    WBUF_APPEND(urlPath, 512, L"/");
    WBUF_APPEND(urlPath, 512, fileName);

    /* 构造完整 URL 仅用于日志显示 */
    wchar_t fullUrl[512];
    WBUF_INIT(fullUrl, 512);
    WBUF_APPEND(fullUrl, 512, L"https://raw.githubusercontent.com");
    WBUF_APPEND(fullUrl, 512, urlPath);
    Log(L"[下载] 请求: %ls", fullUrl);

    hSession = WinHttpOpen(L"JassUpdater/1.0",
        WINHTTP_ACCESS_TYPE_DEFAULT_PROXY,
        WINHTTP_NO_PROXY_NAME, WINHTTP_NO_PROXY_BYPASS, 0);
    if (!hSession) { Log(L"[下载] WinHttpOpen 失败"); goto done; }

    hConnect = WinHttpConnect(hSession, L"raw.githubusercontent.com",
        INTERNET_DEFAULT_HTTPS_PORT, 0);
    if (!hConnect) { Log(L"[下载] WinHttpConnect 失败"); goto done; }

    hRequest = WinHttpOpenRequest(hConnect, L"GET", urlPath,
        NULL, WINHTTP_NO_REFERER, WINHTTP_DEFAULT_ACCEPT_TYPES, WINHTTP_FLAG_SECURE);
    if (!hRequest) { Log(L"[下载] WinHttpOpenRequest 失败"); goto done; }

    if (!WinHttpSendRequest(hRequest, WINHTTP_NO_ADDITIONAL_HEADERS, 0,
        WINHTTP_NO_REQUEST_DATA, 0, 0, 0)) {
        Log(L"[下载] WinHttpSendRequest 失败, err=%lu", GetLastError());
        goto done;
    }

    if (!WinHttpReceiveResponse(hRequest, NULL)) {
        Log(L"[下载] WinHttpReceiveResponse 失败, err=%lu", GetLastError());
        goto done;
    }

    DWORD statusCode = 0, sz = sizeof(statusCode);
    if (!WinHttpQueryHeaders(hRequest,
        WINHTTP_QUERY_STATUS_CODE | WINHTTP_QUERY_FLAG_NUMBER,
        NULL, &statusCode, &sz, NULL)) {
        Log(L"[下载] 获取状态码失败, err=%lu", GetLastError());
        goto done;
    }
    Log(L"[下载] HTTP 状态码: %lu", statusCode);
    if (statusCode != 200) goto done;

    for (;;) {
        DWORD avail = 0;
        if (!WinHttpQueryDataAvailable(hRequest, &avail) || avail == 0) break;
        if (totalSize + avail > cap) {
            while (totalSize + avail > cap) cap *= 2;
            BYTE *nb = (BYTE *)realloc(buf, cap);
            if (!nb) { Log(L"[下载] 内存扩容失败"); goto done; }
            buf = nb;
        }
        DWORD read = 0;
        if (!WinHttpReadData(hRequest, buf + totalSize, avail, &read) || read == 0) break;
        totalSize += read;
    }

    Log(L"[下载] 完成 %ls, %lu 字节", fileName, totalSize);

    if (totalSize > 0) {
        result = buf;
        *outSize = totalSize;
        buf = NULL;
    }

done:
    if (hRequest) WinHttpCloseHandle(hRequest);
    if (hConnect) WinHttpCloseHandle(hConnect);
    if (hSession) WinHttpCloseHandle(hSession);
    free(buf);
    return result;
}

/* ---------- 不区分大小写的宽字符串前缀匹配 ---------- */
static BOOL wcsStartsWithCI(const wchar_t *str, const wchar_t *prefix)
{
    while (*prefix) {
        wchar_t a = *str, b = *prefix;
        if (a >= L'A' && a <= L'Z') a += 32;
        if (b >= L'A' && b <= L'Z') b += 32;
        if (a != b) return FALSE;
        str++;
        prefix++;
    }
    return TRUE;
}

/* ---------- 在指定用户目录下查找 jass 插件 ---------- */
static void ScanUserProfile(const wchar_t *profileDir, wchar_t outList[][MAX_PATH],
                            int maxCount, int *count)
{
    const wchar_t *vscodeDirs[] = { L".vscode", L".vscode-insiders" };

    for (int v = 0; v < 2; v++) {
        wchar_t extPath[MAX_PATH];
        WBUF_INIT(extPath, MAX_PATH);
        WBUF_APPEND(extPath, MAX_PATH, profileDir);
        WBUF_APPEND(extPath, MAX_PATH, L"\\");
        WBUF_APPEND(extPath, MAX_PATH, vscodeDirs[v]);
        WBUF_APPEND(extPath, MAX_PATH, L"\\extensions\\*");
        Log(L"[扫描] %ls", extPath);

        WIN32_FIND_DATAW fdExt;
        HANDLE hExt = FindFirstFileW(extPath, &fdExt);
        if (hExt == INVALID_HANDLE_VALUE) {
            Log(L"[扫描] 未找到: %ls", extPath);
            continue;
        }

        do {
            if (!(fdExt.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY)) continue;

            wchar_t staticPath[MAX_PATH];
            WBUF_INIT(staticPath, MAX_PATH);
            WBUF_APPEND(staticPath, MAX_PATH, profileDir);
            WBUF_APPEND(staticPath, MAX_PATH, L"\\");
            WBUF_APPEND(staticPath, MAX_PATH, vscodeDirs[v]);
            WBUF_APPEND(staticPath, MAX_PATH, L"\\extensions\\");
            WBUF_APPEND(staticPath, MAX_PATH, fdExt.cFileName);
            WBUF_APPEND(staticPath, MAX_PATH, L"\\static");

            DWORD attr = GetFileAttributesW(staticPath);
            if (attr == INVALID_FILE_ATTRIBUTES || !(attr & FILE_ATTRIBUTE_DIRECTORY)) {
                continue;
            }

            Log(L"[扫描] 发现插件目录: %ls", fdExt.cFileName);

            BOOL isJass = wcsStartsWithCI(fdExt.cFileName, L"jass.");
            if (!isJass) {
                wchar_t testFile[MAX_PATH];
                WBUF_INIT(testFile, MAX_PATH);
                WBUF_APPEND(testFile, MAX_PATH, staticPath);
                WBUF_APPEND(testFile, MAX_PATH, L"\\common.j");
                if (GetFileAttributesW(testFile) != INVALID_FILE_ATTRIBUTES) {
                    isJass = TRUE;
                    Log(L"[扫描] 通过 common.j 匹配命中");
                } else {
                    WBUF_INIT(testFile, MAX_PATH);
                    WBUF_APPEND(testFile, MAX_PATH, staticPath);
                    WBUF_APPEND(testFile, MAX_PATH, L"\\war3map.j");
                    if (GetFileAttributesW(testFile) != INVALID_FILE_ATTRIBUTES) {
                        isJass = TRUE;
                        Log(L"[扫描] 通过 war3map.j 匹配命中");
                    }
                }
            }

            if (isJass && *count < maxCount) {
                wcscpy_s(outList[*count], MAX_PATH, staticPath);
                (*count)++;
                Log(L"[扫描] 命中: %ls", staticPath);
            }
        } while (FindNextFileW(hExt, &fdExt));
        FindClose(hExt);
    }
}

/* ---------- 收集所有用户目录 ---------- */
static int CollectUserDirs(wchar_t dirs[][MAX_PATH], int maxCount)
{
    int count = 0;
    wchar_t seen[64][MAX_PATH];
    int seenCount = 0;

    #define ADD_DIR(p) do { \
        int _i; \
        for (_i = 0; _i < seenCount; _i++) { \
            if (_wcsicmp(seen[_i], (p)) == 0) break; \
        } \
        if (_i == seenCount && seenCount < 64) { \
            wcscpy_s(seen[seenCount++], MAX_PATH, (p)); \
        } \
    } while (0)

    /* 1. USERPROFILE 环境变量 */
    wchar_t userProfile[MAX_PATH];
    if (GetEnvironmentVariableW(L"USERPROFILE", userProfile, MAX_PATH) > 0) {
        Log(L"[用户目录] USERPROFILE=%ls", userProfile);
        ADD_DIR(userProfile);
    } else {
        Log(L"[用户目录] USERPROFILE 环境变量未找到");
    }

    /* 2. SystemDrive + \Users */
    wchar_t sysDrive[MAX_PATH];
    if (GetEnvironmentVariableW(L"SystemDrive", sysDrive, MAX_PATH) > 0) {
        Log(L"[用户目录] SystemDrive=%ls", sysDrive);
        wchar_t usersPath[MAX_PATH];
        WBUF_INIT(usersPath, MAX_PATH);
        WBUF_APPEND(usersPath, MAX_PATH, sysDrive);
        WBUF_APPEND(usersPath, MAX_PATH, L"\\Users");

        WIN32_FIND_DATAW fd;
        wchar_t searchPath[MAX_PATH];
        WBUF_INIT(searchPath, MAX_PATH);
        WBUF_APPEND(searchPath, MAX_PATH, usersPath);
        WBUF_APPEND(searchPath, MAX_PATH, L"\\*");
        HANDLE hFind = FindFirstFileW(searchPath, &fd);
        if (hFind != INVALID_HANDLE_VALUE) {
            do {
                if (!(fd.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY)) continue;
                if (wcscmp(fd.cFileName, L".") == 0 || wcscmp(fd.cFileName, L"..") == 0) continue;
                wchar_t full[MAX_PATH];
                WBUF_INIT(full, MAX_PATH);
                WBUF_APPEND(full, MAX_PATH, usersPath);
                WBUF_APPEND(full, MAX_PATH, L"\\");
                WBUF_APPEND(full, MAX_PATH, fd.cFileName);
                Log(L"[用户目录] 发现: %ls", full);
                ADD_DIR(full);
            } while (FindNextFileW(hFind, &fd));
            FindClose(hFind);
        } else {
            Log(L"[用户目录] 无法枚举: %ls", searchPath);
        }
    } else {
        Log(L"[用户目录] SystemDrive 环境变量未找到");
    }

    /* 3. GetWindowsDirectoryW 推导系统盘 */
    wchar_t winDir[MAX_PATH];
    if (GetWindowsDirectoryW(winDir, MAX_PATH)) {
        Log(L"[用户目录] WindowsDir=%ls", winDir);
        wchar_t drive[4] = { winDir[0], L':', L'\\', 0 };
        wchar_t usersPath[MAX_PATH];
        WBUF_INIT(usersPath, MAX_PATH);
        WBUF_APPEND(usersPath, MAX_PATH, drive);
        WBUF_APPEND(usersPath, MAX_PATH, L"Users");

        WIN32_FIND_DATAW fd;
        wchar_t searchPath[MAX_PATH];
        WBUF_INIT(searchPath, MAX_PATH);
        WBUF_APPEND(searchPath, MAX_PATH, usersPath);
        WBUF_APPEND(searchPath, MAX_PATH, L"\\*");
        HANDLE hFind = FindFirstFileW(searchPath, &fd);
        if (hFind != INVALID_HANDLE_VALUE) {
            do {
                if (!(fd.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY)) continue;
                if (wcscmp(fd.cFileName, L".") == 0 || wcscmp(fd.cFileName, L"..") == 0) continue;
                wchar_t full[MAX_PATH];
                WBUF_INIT(full, MAX_PATH);
                WBUF_APPEND(full, MAX_PATH, usersPath);
                WBUF_APPEND(full, MAX_PATH, L"\\");
                WBUF_APPEND(full, MAX_PATH, fd.cFileName);
                ADD_DIR(full);
            } while (FindNextFileW(hFind, &fd));
            FindClose(hFind);
        }
    }

    /* 4. 兜底 C:\Users */
    {
        const wchar_t *cUsers = L"C:\\Users";
        WIN32_FIND_DATAW fd;
        wchar_t searchPath[MAX_PATH];
        WBUF_INIT(searchPath, MAX_PATH);
        WBUF_APPEND(searchPath, MAX_PATH, cUsers);
        WBUF_APPEND(searchPath, MAX_PATH, L"\\*");
        HANDLE hFind = FindFirstFileW(searchPath, &fd);
        if (hFind != INVALID_HANDLE_VALUE) {
            do {
                if (!(fd.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY)) continue;
                if (wcscmp(fd.cFileName, L".") == 0 || wcscmp(fd.cFileName, L"..") == 0) continue;
                wchar_t full[MAX_PATH];
                WBUF_INIT(full, MAX_PATH);
                WBUF_APPEND(full, MAX_PATH, cUsers);
                WBUF_APPEND(full, MAX_PATH, L"\\");
                WBUF_APPEND(full, MAX_PATH, fd.cFileName);
                ADD_DIR(full);
            } while (FindNextFileW(hFind, &fd));
            FindClose(hFind);
        }
    }

    #undef ADD_DIR

    Log(L"[用户目录] 共收集 %d 个用户目录", seenCount);
    for (int i = 0; i < seenCount && count < maxCount; i++) {
        wcscpy_s(dirs[count++], MAX_PATH, seen[i]);
    }
    return count;
}

/* ---------- 查找插件 static 目录 ---------- */
static int FindPluginStaticDirs(wchar_t outList[][MAX_PATH], int maxCount)
{
    int count = 0;
    wchar_t userDirs[64][MAX_PATH];
    int userCount = CollectUserDirs(userDirs, 64);

    for (int i = 0; i < userCount; i++) {
        ScanUserProfile(userDirs[i], outList, maxCount, &count);
    }

    Log(L"[结果] 找到 %d 个插件 static 目录", count);
    return count;
}

/* ---------- 执行更新 ---------- */
static UpdateError DoUpdate(void)
{
    ClearLog();
    Log(L"==== Jass 更新工具 调试日志 ====");

    wchar_t dirs[64][MAX_PATH];
    int dirCount = FindPluginStaticDirs(dirs, 64);
    if (dirCount <= 0) {
        Log(L"[错误] 未找到任何插件目录");
        return ERR_PLUGIN_NOT_FOUND;
    }

    for (int d = 0; d < dirCount; d++) {
        Log(L"[更新] 处理目录: %ls", dirs[d]);
        for (int f = 0; f < g_fileCount; f++) {
            DWORD dataSize = 0;
            BYTE *data = DownloadFile(g_files[f], &dataSize);
            if (!data || dataSize == 0) {
                free(data);
                Log(L"[错误] 下载失败: %ls", g_files[f]);
                return ERR_DOWNLOAD_FAILED;
            }

            wchar_t fullPath[MAX_PATH];
            WBUF_INIT(fullPath, MAX_PATH);
            WBUF_APPEND(fullPath, MAX_PATH, dirs[d]);
            WBUF_APPEND(fullPath, MAX_PATH, L"\\");
            WBUF_APPEND(fullPath, MAX_PATH, g_files[f]);

            HANDLE hFile = CreateFileW(fullPath, GENERIC_WRITE, 0, NULL,
                CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
            if (hFile == INVALID_HANDLE_VALUE) {
                free(data);
                DWORD err = GetLastError();
                Log(L"[错误] 创建文件失败 %ls, err=%lu", fullPath, err);
                if (err == ERROR_ACCESS_DENIED || err == ERROR_SHARING_VIOLATION ||
                    err == ERROR_LOCK_VIOLATION) {
                    return ERR_REPLACE_FAILED;
                }
                return ERR_WRITE_FAILED;
            }

            DWORD written = 0;
            BOOL ok = WriteFile(hFile, data, dataSize, &written, NULL);
            CloseHandle(hFile);
            free(data);

            if (!ok || written != dataSize) {
                Log(L"[错误] 写入失败 %ls", fullPath);
                return ERR_WRITE_FAILED;
            }
            Log(L"[更新] 已写入: %ls (%lu 字节)", g_files[f], dataSize);
        }
    }

    Log(L"[完成] 全部更新成功");
    return ERR_NONE;
}

/* ---------- 主窗口 ---------- */
static HWND g_hBtn = NULL;
static HWND g_hLink = NULL;
static HBRUSH g_hLinkBrush = NULL;

static LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam)
{
    switch (msg) {
    case WM_CREATE: {
        g_hBtn = CreateWindowExW(0, L"BUTTON", L"开始更新",
            WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
            60, 25, 160, 40, hwnd, (HMENU)100, NULL, NULL);
        HFONT hFont = CreateFontW(18, 0, 0, 0, FW_BOLD, FALSE, FALSE, FALSE,
            DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS,
            DEFAULT_QUALITY, DEFAULT_PITCH | FF_SWISS, L"Microsoft YaHei");
        SendMessageW(g_hBtn, WM_SETFONT, (WPARAM)hFont, TRUE);

        /* "查看源码" 文本链接（非按钮样式） */
        g_hLink = CreateWindowExW(0, L"STATIC", L"查看源码",
            WS_CHILD | WS_VISIBLE | SS_NOTIFY | SS_CENTER,
            100, 80, 80, 20, hwnd, (HMENU)200, NULL, NULL);
        HFONT hLinkFont = CreateFontW(14, 0, 0, 0, FW_NORMAL, FALSE, TRUE, FALSE,
            DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS,
            DEFAULT_QUALITY, DEFAULT_PITCH | FF_SWISS, L"Microsoft YaHei");
        SendMessageW(g_hLink, WM_SETFONT, (WPARAM)hLinkFont, TRUE);

        g_hLinkBrush = (HBRUSH)GetStockObject(HOLLOW_BRUSH);
        break;
    }
    case WM_COMMAND:
        if (LOWORD(wParam) == 100 && HIWORD(wParam) == BN_CLICKED) {
            EnableWindow(g_hBtn, FALSE);
            UpdateError err = DoUpdate();
            EnableWindow(g_hBtn, TRUE);

            if (err == ERR_NONE) {
                ShowCustomMsgBox(L"更新成功", L"所有插件静态文件已更新完毕！", L"请关闭程序");
            } else {
                const wchar_t *reason = L"未知错误";
                switch (err) {
                case ERR_PLUGIN_NOT_FOUND:
                    reason = L"找不到插件，可能未安装";
                    break;
                case ERR_DOWNLOAD_FAILED:
                    reason = L"下载文件失败，请检查网络后重试";
                    break;
                case ERR_WRITE_FAILED:
                    reason = L"文件写入失败，请检查插件目录是否受到系统文件保护，请关闭保护后重试";
                    break;
                case ERR_REPLACE_FAILED:
                    reason = L"替换文件失败";
                    break;
                default:
                    break;
                }
                ShowCustomMsgBox(L"更新失败", reason, L"确定");
            }
        } else if (LOWORD(wParam) == 200 && HIWORD(wParam) == STN_CLICKED) {
            /* 点击"查看源码"，打开 GitHub 仓库 */
            ShellExecuteW(NULL, L"open", GITHUB_REPO_URL, NULL, NULL, SW_SHOWNORMAL);
        }
        break;
    case WM_CTLCOLORSTATIC: {
        HDC hdc = (HDC)wParam;
        if ((HWND)lParam == g_hLink) {
            SetTextColor(hdc, RGB(0, 102, 204));
            SetBkMode(hdc, TRANSPARENT);
            return (LRESULT)g_hLinkBrush;
        }
        break;
    }
    case WM_SETCURSOR:
        if ((HWND)wParam == g_hLink) {
            SetCursor(LoadCursor(NULL, IDC_HAND));
            return TRUE;
        }
        break;
    case WM_DESTROY:
        PostQuitMessage(0);
        break;
    default:
        return DefWindowProcW(hwnd, msg, wParam, lParam);
    }
    return 0;
}

int WINAPI WinMain(HINSTANCE hInst, HINSTANCE hPrev, LPSTR lpCmd, int nShow)
{
    (void)hPrev; (void)lpCmd;

    WNDCLASSW wc = {0};
    wc.lpfnWndProc = WndProc;
    wc.hInstance = hInst;
    wc.lpszClassName = L"JassUpdaterWnd";
    wc.hCursor = LoadCursor(NULL, IDC_ARROW);
    wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    RegisterClassW(&wc);

    HWND hwnd = CreateWindowExW(0, L"JassUpdaterWnd", L"家猫 Jass 插件函数库更新工具 V1.0",
        WS_OVERLAPPEDWINDOW & ~WS_THICKFRAME & ~WS_MAXIMIZEBOX,
        CW_USEDEFAULT, CW_USEDEFAULT, 300, 155,
        NULL, NULL, hInst, NULL);

    ShowWindow(hwnd, nShow);
    UpdateWindow(hwnd);

    MSG msg;
    while (GetMessageW(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessageW(&msg);
    }
    return (int)msg.wParam;
}
