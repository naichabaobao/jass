import * as vscode from "vscode";
import * as vjass_ast from "../jass/parser-vjass";


/**
 * 将原生函数转换为 VS Code 补全项
 * @param native 原生函数节点
 * @returns VS Code 补全项
 */
export function nativeToItem(native: vjass_ast.Native): vscode.CompletionItem {
  const functionName = native.name?.getText() ?? "(unnamed)";
  const item = new vscode.CompletionItem(functionName, vscode.CompletionItemKind.Function);

  
  
  // 设置详细描述（显示参数和返回值）
  if (native.takes && native.returns) {
    const takesText = native.takes.length > 0 
      ? native.takes.map(take => `${take.name?.getText()}: ${take.type?.getText()}`).join(', ')
      : 'nothing';
    const returnsText = native.returns.getText();
    item.detail = `${functionName}(${takesText}) → ${returnsText}`;
  }
  
  // 设置文档说明（Markdown 格式）
  if (native.takes && native.returns) {
    const takesText = native.takes.length > 0 
      ? native.takes.map(take => `- \`${take.name?.getText()}\`: ${take.type?.getText()}`).join('\n')
      : '- 无参数';
    const returnsText = native.returns.getText();
    
    // 获取描述文本
    const descriptionText = native.description && native.description.length > 0
      ? native.description.map(desc => {
          if (typeof desc === 'string') {
            return desc;
          }
          if (desc && typeof desc === 'object' && 'getText' in desc) {
            return (desc as any).getText?.() || String(desc);
          }
          return String(desc);
        }).join(' ')
      : '原生函数';
    
    item.documentation = new vscode.MarkdownString()
      .appendCodeblock(native.to_string())
      .appendMarkdown(`
## 🔧 ${functionName}

**类型**: 原生函数  
**返回值**: \`${returnsText}\`

### 📝 参数
${takesText}

### 📖 说明
${descriptionText}

---
*此函数由 JASS 引擎提供*
    `.trim());
  }
  
  // 设置排序优先级（原生函数优先级较高）
  item.sortText = `0_${functionName}`;
  
  // 设置插入文本（智能括号）
  if (native.takes && native.takes.length > 0) {
    // 有参数时，插入函数名和括号，光标定位在括号内
    item.insertText = new vscode.SnippetString(`${functionName}($1)`);
  } else {
    // 无参数时，直接插入函数名和括号
    item.insertText = `${functionName}()`;
  }
  
  // 设置标签（用于过滤和分类）
  // item.tags = [vscode.CompletionItemTag.Deprecated]; // 原生函数不应该标记为废弃
  
  return item;
}

/**
 * 将函数转换为 VS Code 补全项
 * @param func 函数节点
 * @returns VS Code 补全项
 */
export function functionToItem(func: vjass_ast.Func | vjass_ast.zinc.Func): vscode.CompletionItem {
  const functionName = func.name?.getText() ?? "(unnamed)";
  const item = new vscode.CompletionItem(functionName, vscode.CompletionItemKind.Function);
  
  // 设置详细描述（显示参数和返回值）
  if (func.takes && func.returns) {
    const takesText = func.takes.length > 0 
      ? func.takes.map(take => `${take.name?.getText()}: ${take.type?.getText()}`).join(', ')
      : 'nothing';
    const returnsText = func.returns.getText();
    item.detail = `${functionName}(${takesText}) → ${returnsText}`;
  }
  
  // 设置文档说明（Markdown 格式）
  if (func.takes && func.returns) {
    const takesText = func.takes.length > 0 
      ? func.takes.map(take => `- \`${take.name?.getText()}\`: ${take.type?.getText()}`).join('\n')
      : '- 无参数';
    const returnsText = func.returns.getText();
    
    // 获取描述文本
    const descriptionText = func.description && func.description.length > 0
      ? func.description.map(desc => {
          if (typeof desc === 'string') {
            return desc;
          }
          if (desc && typeof desc === 'object' && 'getText' in desc) {
            return (desc as any).getText?.() || String(desc);
          }
          return String(desc);
        }).join(' ')
      : '用户自定义函数';
    
    // 判断函数类型
    const functionType = func instanceof vjass_ast.zinc.Func ? 'Zinc 函数' : 'JASS 函数';
    
    item.documentation = new vscode.MarkdownString()
      .appendCodeblock(func.to_string())
      .appendMarkdown(`
## ⚡ ${functionName}

**类型**: ${functionType}  
**返回值**: \`${returnsText}\`

### 📝 参数
${takesText}

### 📖 说明
${descriptionText}

### 📍 位置
${func.start ? `第 ${func.start.line + 1} 行` : '未知位置'}

---
*此函数由用户定义*
    `.trim());
  }
  
  // 设置排序优先级（用户函数优先级中等）
  item.sortText = `1_${functionName}`;
  
  // 设置插入文本（智能括号）
  if (func.takes && func.takes.length > 0) {
    // 有参数时，插入函数名和括号，光标定位在括号内
    item.insertText = new vscode.SnippetString(`${functionName}($1)`);
  } else {
    // 无参数时，直接插入函数名和括号
    item.insertText = `${functionName}()`;
  }
  
  // 设置标签（用于过滤和分类）
  // 用户函数不需要特殊标签
  
  return item;
}

/**
 * 将全局变量转换为 VS Code 补全项
 * @param globalVariable 全局变量节点
 * @returns VS Code 补全项
 */
export function globalVariableToItem(globalVariable: vjass_ast.GlobalVariable | vjass_ast.zinc.Member): vscode.CompletionItem {
  const variableName = globalVariable.name?.getText() ?? "(unnamed)";
  const item = new vscode.CompletionItem(variableName, vscode.CompletionItemKind.Variable);
  
  // 设置详细描述（显示变量类型）
  if (globalVariable.type) {
    const typeText = globalVariable.type.getText();
    item.detail = `${variableName}: ${typeText}`;
  }
  
  // 设置文档说明（Markdown 格式）
  if (globalVariable.type) {
    const typeText = globalVariable.type.getText();
    
    // 获取描述文本
    const descriptionText = globalVariable.description && globalVariable.description.length > 0
      ? globalVariable.description.map(desc => {
          if (typeof desc === 'string') {
            return desc;
          }
          if (desc && typeof desc === 'object' && 'getText' in desc) {
            return (desc as any).getText?.() || String(desc);
          }
          return String(desc);
        }).join(' ')
      : '全局变量';
    
    // 判断变量类型
    const variableType = globalVariable instanceof vjass_ast.zinc.Member ? 'Zinc 全局变量' : 'JASS 全局变量';
    
    item.documentation = new vscode.MarkdownString()
      .appendCodeblock(globalVariable.to_string())
      .appendMarkdown(`
## 🌐 ${variableName}

**类型**: ${variableType}  
**数据类型**: \`${typeText}\`

### 📖 说明
${descriptionText}

### 📍 位置
${globalVariable.start ? `第 ${globalVariable.start.line + 1} 行` : '未知位置'}

---
*此变量为全局变量*
    `.trim());
  }
  
  // 设置排序优先级（全局变量优先级较低）
  item.sortText = `2_${variableName}`;
  
  // 设置插入文本（直接插入变量名）
  item.insertText = variableName;
  
  // 设置标签（用于过滤和分类）
  // 全局变量不需要特殊标签
  
  return item;
}

/**
 * 将关键字转换为 VS Code 补全项
 * @param keyword 关键字字符串
 * @returns VS Code 补全项
 */
export function keyworldToItem(keyword: string): vscode.CompletionItem {
  const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
  
  // 设置详细描述
  item.detail = `关键字: ${keyword}`;
  
  // 设置文档说明（Markdown 格式）
  item.documentation = new vscode.MarkdownString(`
## 🔑 ${keyword}

**类型**: JASS 关键字

### 📖 说明
这是 JASS 语言的内置关键字，用于控制程序流程、定义类型或执行特定操作。

### 💡 用法
根据关键字类型，可以用于：
- 控制流语句 (if, else, endif, loop, exitwhen, endloop)
- 类型定义 (integer, real, string, boolean, code, handle)
- 函数声明 (function, endfunction, takes, returns)
- 变量声明 (local, set, call)
- 其他语言特性

---
*此关键字由 JASS 语言提供*
  `.trim());
  
  // 设置排序优先级（关键字优先级最低）
  item.sortText = `9_${keyword}`;
  
  // 设置插入文本（直接插入关键字）
  item.insertText = keyword;
  
  return item;
}

/**
 * 将类型转换为 VS Code 补全项
 * @param type 类型节点
 * @returns VS Code 补全项
 */
export function typeToItem(type: vjass_ast.Type): vscode.CompletionItem {
  const typeName = type.name?.getText() ?? "(unnamed)";
  const item = new vscode.CompletionItem(typeName, vscode.CompletionItemKind.Class);
  
  // 设置详细描述
  item.detail = `类型: ${typeName}`;
  
  // 设置文档说明（Markdown 格式）
  item.documentation = new vscode.MarkdownString()
    .appendCodeblock(type.to_string())
    .appendMarkdown(`
## 🏷️ ${typeName}

**类型**: JASS 类型定义

### 📖 说明
这是 JASS 语言中的类型定义，用于创建自定义数据类型。

### 📍 位置
${type.start ? `第 ${type.start.line + 1} 行` : '未知位置'}

### 💡 用法
类型定义用于：
- 创建自定义数据结构
- 定义对象属性
- 类型检查和转换
- 代码组织和模块化

---
*此类型由用户定义*
  `.trim());
  
  // 设置排序优先级（类型优先级中等）
  item.sortText = `3_${typeName}`;
  
  // 设置插入文本（直接插入类型名）
  item.insertText = typeName;
  
  return item;
}
