const vscode = require('vscode');

const type = require("./type")
const colorProvider = require("./colorProvider")
const codeItemProvider = require("./codeItemProvider")
const triggreCharacters = require("./triggreCharacters")
const functionItemProvider = require("./functionItemProvider")
const hoverProvider = require("./hoverProvider")
const documentForrmatProvider = require("./documentForrmatProvider")
const w3mfileProvider = require("./w3m-file-provider")

const fs = require("fs")
const path = require("path")

/**
 * 语言名称
 */
const language = "jass"
/**
 * 错误集合
 */
var diagnosticCollection = null

const didSaveTextDocumentHandle = function (document) { }

/**
 * 
 * @param {vscode.ExtensionContext} context 
 */
function activate(context) {
  vscode.languages.registerCompletionItemProvider(language, functionItemProvider, ...triggreCharacters.w);
  vscode.languages.registerCompletionItemProvider(language, codeItemProvider, ...triggreCharacters.c);
  vscode.languages.registerHoverProvider(language, hoverProvider);
  vscode.languages.registerColorProvider(language, colorProvider);
  vscode.languages.registerDocumentFormattingEditProvider(language, documentForrmatProvider);

  // 错误提示
  if (diagnosticCollection == null)
    diagnosticCollection = vscode.languages.createDiagnosticCollection(language);
  vscode.workspace.onDidSaveTextDocument(textDocment => {
    // 暂时不提供
    // var documentContent = textDocment.getText()
    // documentContent.match(/a/g)
    // var diagnostic = new vscode.Diagnostic(new vscode.Range(new vscode.Position(1, 1), new vscode.Position(1, 6)), "哈哈哈", vscode.DiagnosticSeverity.Error)
    // diagnosticCollection.set(textDocment.uri, [diagnostic])
  })

  // const panel = vscode.window.createWebviewPanel(
  //   'catCoding',
  //   'Cat Coding',
  //   vscode.ViewColumn.One,
  //   {
  //     enableScripts: true
  //   }
  // );

  // // 设置HTML内容
  // let template = vscode.Uri.file(path.join(context.extensionPath, 'src/resources/template', 'index.html'));
  // let html = template.with({ scheme: 'file' });

  // panel.webview.html = fs.readFileSync(html.fsPath).toString()
  vscode.workspace.registerFileSystemProvider("file", {
    onDidChangeFile: null,
    watch: (uri, options) => {
      return null;
    },
    /**
     * @param {vscode.Uri} uri The uri of the file to retrieve metadata about.
     * @return {vscode.FileStat} The file metadata about the file.
     * @throws {vscode.Thenable<vscode.FileStat>} [`FileNotFound`](#FileSystemError.FileNotFound) when `uri` doesn't exist.
     */
    stat(uri) {
      let stat = fs.statSync(path.resolve(uri.toString()))
      return {
        type: stat.isFile ? vscode.FileType.File : stat.isDirectory ? vscode.FileType.Directory : vscode.FileType.Unknown,
        ctime: stat.ctime.getTime(),
        mtime: stat.mtime.getTime(),
        size: stat.size
      }
    },
    /**
     * @param {vscode.Uri} uri The uri of the folder.
     * @return {[string, vscode.FileType][]} An array of name/type-tuples or a thenable that resolves to such.
     * @throws {vscode.Thenable<vscode.FileStat>} [`FileNotFound`](#FileSystemError.FileNotFound) when `uri` doesn't exist.
     */
    readDirectory(uri) {
      return []
    },
    /**
     * Create a new directory (Note, that new files are created via `write`-calls).
     *
     * @param {vscode.Uri} uri The uri of the new folder.
     * @throws {vscode.Thenable<void>} [`FileNotFound`](#FileSystemError.FileNotFound) when the parent of `uri` doesn't exist, e.g. no mkdirp-logic required.
     * @throws {vscode.Thenable<void>} [`FileExists`](#FileSystemError.FileExists) when `uri` already exists.
     * @throws {vscode.Thenable<void>} [`NoPermissions`](#FileSystemError.NoPermissions) when permissions aren't sufficient.
     */
    createDirectory(uri) { },

    /**
     * Read the entire contents of a file.
     *
     * @param {vscode.Uri} uri The uri of the file.
     * @return {Uint8Array} An array of bytes or a thenable that resolves to such.
     * @throws {Thenable<Uint8Array>} [`FileNotFound`](#FileSystemError.FileNotFound) when `uri` doesn't exist.
     */
    readFile(uri) {
      console.log("read")
      return fs.readFileSync(uri.toString());
    },

    /**
     * Write data to a file, replacing its entire contents.
     *
     * @param {vscode.Uri} uri The uri of the file.
     * @param {Uint8Array} content The new content of the file.
     * @param {{ create: boolean, overwrite: boolean }} options Defines if missing files should or must be created.
     * @throws [`FileNotFound`](#FileSystemError.FileNotFound) when `uri` doesn't exist and `create` is not set.
     * @throws [`FileNotFound`](#FileSystemError.FileNotFound) when the parent of `uri` doesn't exist and `create` is set, e.g. no mkdirp-logic required.
     * @throws {vscode.Thenable<void>} [`FileExists`](#FileSystemError.FileExists) when `uri` already exists, `create` is set but `overwrite` is not set.
     * @throws {vscode.Thenable<void>} [`NoPermissions`](#FileSystemError.NoPermissions) when permissions aren't sufficient.
     */
    writeFile(uri, content, options) { },

    /**
     * @param {vscode.Uri} uri The resource that is to be deleted.
     * @param {{ recursive: boolean }} options Defines if deletion of folders is recursive.
     * @throws {vscode.Thenable<void>} [`FileNotFound`](#FileSystemError.FileNotFound) when `uri` doesn't exist.
     * @throws {vscode.Thenable<void>} [`NoPermissions`](#FileSystemError.NoPermissions) when permissions aren't sufficient.
     */
    delete(uri, options) { },

    /**
     * @param {vscode.Uri} oldUri The existing file.
     * @param {vscode.Uri} newUri The new location.
     * @param {{ overwrite: boolean }} options Defines if existing files should be overwritten.
     * @throws {vscode.Thenable<void>} [`FileNotFound`](#FileSystemError.FileNotFound) when `oldUri` doesn't exist.
     * @throws {vscode.Thenable<void>} [`FileNotFound`](#FileSystemError.FileNotFound) when parent of `newUri` doesn't exist, e.g. no mkdirp-logic required.
     * @throws [`FileExists`](#FileSystemError.FileExists) when `newUri` exists and when the `overwrite` option is not `true`.
     * @throws [`NoPermissions`](#FileSystemError.NoPermissions) when permissions aren't sufficient.
     */
    rename(oldUri, newUri, options) { },

    /**
     * @param {vscode.Uri} source The existing file.
     * @param {vscode.Uri} destination The destination location.
     * @param {{ overwrite: boolean }} options Defines if existing files should be overwritten.
     * @throws {vscode.Thenable<void>} [`FileNotFound`](#FileSystemError.FileNotFound) when `source` doesn't exist.
     * @throws {vscode.Thenable<void>} [`FileNotFound`](#FileSystemError.FileNotFound) when parent of `destination` doesn't exist, e.g. no mkdirp-logic required.
     * @throws [`FileExists`](#FileSystemError.FileExists) when `destination` exists and when the `overwrite` option is not `true`.
     * @throws [`NoPermissions`](#FileSystemError.NoPermissions) when permissions aren't sufficient.
     */
    copy(source, destination, options) { },
  }, { isCaseSensitive: false, isReadonly: false });
}

exports.activate = activate;
function deactivate() { }
module.exports = {
  activate,
  deactivate
}
