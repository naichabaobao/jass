import * as vscode from 'vscode'

class W3mFileProvider implements vscode.FileSystemProvider {
  onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]>;  watch(uri: vscode.Uri, options: { recursive: boolean; excludes: string[]; }): vscode.Disposable;
  watch(uri: vscode.Uri, options: { recursive: boolean; excludes: string[]; }): vscode.Disposable {
    throw new Error("Method not implemented.");
  }
  stat(uri: vscode.Uri): vscode.FileStat | Thenable<vscode.FileStat> {
    throw new Error("Method not implemented.");
  }
  readDirectory(uri: vscode.Uri): [string, vscode.FileType][] | Thenable<[string, vscode.FileType][]> {
    throw new Error("Method not implemented.");
  }
  createDirectory(uri: vscode.Uri): void | Thenable<void> {
    throw new Error("Method not implemented.");
  }
  readFile(uri: vscode.Uri): Uint8Array | Thenable<Uint8Array> {
    throw new Error("Method not implemented.");
  }
  writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean; }): void | Thenable<void> {
    throw new Error("Method not implemented.");
  }
  delete(uri: vscode.Uri, options: { recursive: boolean; }): void | Thenable<void> {
    throw new Error("Method not implemented.");
  }
  rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean; }): void | Thenable<void> {
    throw new Error("Method not implemented.");
  }
  copy?(source: vscode.Uri, destination: vscode.Uri, options: { overwrite: boolean; }): void | Thenable<void> {
    throw new Error("Method not implemented.");
  }

}

export default W3mFileProvider;