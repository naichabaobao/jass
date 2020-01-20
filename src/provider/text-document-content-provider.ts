import * as vscode from 'vscode';
import { commonJFilePath, blizzardJFilePath, commonAiFilePath, DzAPIJFilePath } from '../main/path';
import {
  commonJContent,
  blizzardJContent,
  commonAiContent,
  dzApiJContent,
} from '../main/file';
import { language } from '../main/constant';

const commonJFileUri = vscode.Uri.file(commonJFilePath);
const blizzardJFileUri = vscode.Uri.file(blizzardJFilePath);
const commonAiFileUri = vscode.Uri.file(commonAiFilePath);
const DzAPIJFileUri = vscode.Uri.file(DzAPIJFilePath);

class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {

  // onDidChange?: vscode.Event<vscode.Uri> | undefined;  
  
  provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
    console.log(uri);
    if(uri.fsPath == commonJFileUri.fsPath){
      return commonJContent();
    }else if(uri.fsPath == blizzardJFileUri.fsPath){
      return blizzardJContent();
    }else if(uri.fsPath == commonAiFileUri.fsPath){
      return commonAiContent();
    }else if(uri.fsPath == DzAPIJFileUri.fsPath){
      return dzApiJContent();
    }else {
      return null;
    }
  }

}

vscode.workspace.registerTextDocumentContentProvider("jass", new TextDocumentContentProvider);

vscode.workspace.openTextDocument(commonJFileUri);
