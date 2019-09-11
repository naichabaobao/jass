const vscode = require('vscode');
const fs = require('fs')
const path = require('path')

const W3mfileSystemProvider = {
  /**
		 * An event to signal that a resource has been created, changed, or deleted. This
		 * event should fire for resources that are being [watched](#FileSystemProvider.watch)
		 * by clients of this provider.
     * new vscode.Event<vscode.FileChangeEvent[]>(),
		 */
  onDidChangeFile: null,

  /**
   * Subscribe to events in the file or folder denoted by `uri`.
   *
   * The editor will call this function for files and folders. In the latter case, the
   * options differ from defaults, e.g. what files/folders to exclude from watching
   * and if subfolders, sub-subfolder, etc. should be watched (`recursive`).
   *
   * @param {vscode.Uri} uri The uri of the file to be watched.
   * @param {{ recursive: boolean; excludes: string[] }} options Configures the watch.
   * @returns {vscode.Disposable} A disposable that tells the provider to stop watching the `uri`.
   */
  watch(uri, options) {
    return null;
  },

  /**
   * Retrieve metadata about a file.
   *
   * Note that the metadata for symbolic links should be the metadata of the file they refer to.
   * Still, the [SymbolicLink](#FileType.SymbolicLink)-type must be used in addition to the actual type, e.g.
   * `FileType.SymbolicLink | FileType.Directory`.
   *
   * @param {vscode.Uri} uri The uri of the file to retrieve metadata about.
   * @return {vscode.FileStat} The file metadata about the file.
   * @throws {vscode.Thenable<vscode.FileStat>} [`FileNotFound`](#FileSystemError.FileNotFound) when `uri` doesn't exist.
   */
  stat(uri) {
    let stat = fs.statSync(path.resolve(uri.toString()))

    return {
      type: stat.isFile ? vscode.FileType.File : stat.isDirectory ? vscode.FileType.Directory : vscode.FileType.Unknown,
      /**
       * The creation timestamp in milliseconds elapsed since January 1, 1970 00:00:00 UTC.
       */
      ctime: stat.ctime.getTime(),
      /**
       * The modification timestamp in milliseconds elapsed since January 1, 1970 00:00:00 UTC.
       */
      mtime: stat.mtime.getTime(),
      /**
       * The size in bytes.
       */
      size: stat.size
    }
  },

  /**
   * Retrieve all entries of a [directory](#FileType.Directory).
   *
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
   * Delete a file.
   *
   * @param {vscode.Uri} uri The resource that is to be deleted.
   * @param {{ recursive: boolean }} options Defines if deletion of folders is recursive.
   * @throws {vscode.Thenable<void>} [`FileNotFound`](#FileSystemError.FileNotFound) when `uri` doesn't exist.
   * @throws {vscode.Thenable<void>} [`NoPermissions`](#FileSystemError.NoPermissions) when permissions aren't sufficient.
   */
  delete(uri, options) { },

  /**
   * Rename a file or folder.
   *
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
   * Copy files or folders. Implementing this function is optional but it will speedup
   * the copy operation.
   *
   * @param {vscode.Uri} source The existing file.
   * @param {vscode.Uri} destination The destination location.
   * @param {{ overwrite: boolean }} options Defines if existing files should be overwritten.
   * @throws {vscode.Thenable<void>} [`FileNotFound`](#FileSystemError.FileNotFound) when `source` doesn't exist.
   * @throws {vscode.Thenable<void>} [`FileNotFound`](#FileSystemError.FileNotFound) when parent of `destination` doesn't exist, e.g. no mkdirp-logic required.
   * @throws [`FileExists`](#FileSystemError.FileExists) when `destination` exists and when the `overwrite` option is not `true`.
   * @throws [`NoPermissions`](#FileSystemError.NoPermissions) when permissions aren't sufficient.
   */
  copy(source, destination, options) { },
}

export default W3mfileSystemProvider;