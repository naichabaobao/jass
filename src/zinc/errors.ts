export class ZincError {
  public fileName:string|null = null;
  public message:string|null = null;

  public startLine = 0;
  public startPosition = 0;
  public endLine = 0;
  public endPosition = 0;

}