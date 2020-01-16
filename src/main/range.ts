import * as vscode from 'vscode';

class Range {
  private _range: vscode.Range = new vscode.Range(0, 0, 0, 0);

  
  public get range() : vscode.Range {
    return this._range;
  }
  
  public set start(start : vscode.Position) {
    this._range = this._range.with(start,this._range.end.isBefore(start) ? start : this._range.end);
  }

  public set end(end : vscode.Position) {
    this._range = this._range.with(this._range.start , end);
  }
}

export {
  Range
};