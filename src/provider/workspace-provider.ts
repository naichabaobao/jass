import * as vscode from "vscode";


/*
vscode.workspace.onDidChangeTextDocument(e => {
  console.log(e.contentChanges)
  console.log(vscode.workspace.getWorkspaceFolder(e.document.uri))
  console.log(vscode.workspace.workspaceFile)
  console.log(vscode.workspace.findFiles(vscode.workspace.workspaceFile?.toString() ?? ""))
});

vscode.comments.createCommentController("jass", "我的comment").createCommentThread
*/
/*
vscode.workspace.registerTextDocumentContentProvider("jass", new class ContentProvider implements vscode.TextDocumentContentProvider {
  onDidChange?: vscode.Event<vscode.Uri> | undefined;

  provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
    return `
    

    
    `
  }

} ());*/