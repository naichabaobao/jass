// import * as path from "path";
// import * as vscode from "vscode";
// import { JassConfigJson, PluginDefaultConfig } from "./config/config";

// class Path {
//     public static readonly workspaceFolder = vscode.workspace.workspaceFolders![0].uri.fsPath;

//     private innerPath: string;
//     public constructor(anyPath: string) {
//         if (!path.isAbsolute(anyPath)) {
//             anyPath = path.resolve(Path.workspaceFolder, anyPath);
//         }
//         this.innerPath = anyPath;
//     }

//     public equels(filePath: Path):boolean {
//         return false;
//     }

//     public static InvariablePaths: Path[] = [];
//   }
  
//   () => {
//     const includes = JassConfigJson.includes;
//     const excludes = JassConfigJson.excludes;
//     if (includes) {
//         includes.forEach(includePath => {
//             Path.InvariablePaths.push(new Path(includePath));
//         });
//         if (excludes) {
    
//         }
//     }
//   };

//   new Path("./1.j");

