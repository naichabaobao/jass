import * as fs from 'fs';
import * as path from 'path';

import * as vscode from 'vscode';
import { Options } from './options';
import { Global, parse } from '../jass/parser-vjass';


export function jass_config_json_path() {
	const jass_config_json_path = path.resolve(vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : "/", "jass.config.json");

	return jass_config_json_path;
}
export function jass_config_json_excludes() {
	const config_path = jass_config_json_path()
	const exclude_paths:string[] = [];
	if (fs.existsSync(config_path)) {
		const config_content = fs.readFileSync(config_path, {encoding: "utf-8"});
		try {
			const config_json = JSON.parse(config_content);
			const excludes = config_json["excludes"];
			if (Array.isArray(excludes)) {
				excludes.forEach(exclude_path => {
					if (typeof exclude_path == "string") {
						if (path.isAbsolute(exclude_path)) {
							exclude_paths.push(exclude_path);
						} else {
							exclude_paths.push(path.resolve(path.parse(config_path).dir, exclude_path));
						}
					}
				});
			}
		} catch (error) {
			
		}
	}

	return exclude_paths;
}
let excludes = jass_config_json_excludes();
vscode.workspace.onDidChangeConfiguration((event) => {
	excludes = jass_config_json_excludes();

	excludes.forEach(file_path => {
		Global.delete(file_path);
	});
});


function is_not_in_excludes(p: string) {
	const compare_path = (p1:string, p2: string) => {
		const p1_parsed = path.parse(p1);
		const p2_parsed = path.parse(p2);

		return p1_parsed.dir == p2_parsed.dir && p1_parsed.base == p2_parsed.base;
	};
	const match = (p: string) => {
		return excludes.findIndex(e => {
			return compare_path(e, p);
		}) == -1;
	};

	return match(p);
}

export function include_paths() {
	const work_paths = Options.workspaces.filter(p => {
		return is_not_in_excludes(p);
	});
	return work_paths;
}



vscode.workspace.onDidChangeTextDocument((event:vscode.TextDocumentChangeEvent) => {
	// const document = event.document;
	if (is_not_in_excludes(event.document.uri.fsPath)) {
		parse(event.document.uri.fsPath, event.document.getText());
		
	}
	
});

vscode.workspace.onDidSaveTextDocument((document) => {
	if (is_not_in_excludes(document.uri.fsPath)) {
		// parse(document.uri.fsPath, document.getText());
	}
});

vscode.workspace.onDidDeleteFiles((event) => {
	event.files.forEach(uri => {
		Global.delete(uri.fsPath);
	});
});

vscode.workspace.onDidRenameFiles((event) => {
	event.files.forEach((uri) => {
		Global.delete(uri.oldUri.fsPath);
		parse(uri.newUri.fsPath);
	});
});

(() => {
	console.time("init all file parse");
	Options.staticPaths.forEach(file_path => {
		const p = path.parse(file_path);
		if (p.ext == ".j" || p.ext == ".jass" || p.ext == ".ai") {
			parse(file_path);
		}
	});
	console.log("include_paths()" + include_paths());
	
	include_paths().forEach(file_path => {
		const p = path.parse(file_path);
		if (p.ext == ".j" || p.ext == ".jass" || p.ext == ".ai") {
			parse(file_path);
		}
	});
	console.timeEnd("init all file parse");
})();


