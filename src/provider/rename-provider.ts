import * as vscode from 'vscode';


class RenameProvider implements vscode.RenameProvider {

  provideRenameEdits(document: vscode.TextDocument, position: vscode.Position, newName: string, token: vscode.CancellationToken): vscode.ProviderResult<vscode.WorkspaceEdit> {
    
    console.log(newName);
    const range = document.getWordRangeAtPosition(position);

    const workspaceEdit= new vscode.WorkspaceEdit();

    // workspaceEdit.insert(document.uri, position, newName);
    if(range) {
      workspaceEdit.replace(document.uri, range, newName);
    }

    return workspaceEdit;
  }
  
}

vscode.languages.registerRenameProvider("jass", new RenameProvider);



