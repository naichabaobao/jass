// import * as FileManager from "./provider/file-manager"


async function boot() {
    await import("./provider/data-enter");
    // await import ("./provider/file-manager");
    await import("./provider/data");
    await import("./provider/document-formatting-edit-provider");
    await import("./provider/folding-range-provider");
    await import("./provider/document-color-provider");
    await import("./provider/completion-provider");
    await import("./provider/lua-completion-provider");
    await import("./provider/hover-provider");
    await import("./provider/signature-help-provider");
    await import("./provider/definition-provider");
    await import("./provider/diagnostic-provider");
    await import("./provider/rename-provider");
    await import("./provider/outline-provider");
    await import("./provider/document-semantic-tokens-provider");

    await import("./provider/reverse-lookup-document-symbol-provider");
}

export {
    boot
};