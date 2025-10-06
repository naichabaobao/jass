import * as vscode from "vscode";
import { GlobalContext, JassDetail, ASTNodeTypeChecker } from "../jass/parser-vjass";
import { Position } from "../jass/loc";

/**
 * 可见性类型枚举
 */
enum Visibility {
    PUBLIC = "public",
    PRIVATE = "private"
}

/**
 * 访问上下文接口
 */
interface AccessContext {
    document: vscode.TextDocument;
    position: vscode.Position;
    currentStruct?: any;
    currentFunction?: any;
    currentMethod?: any;
}

/**
 * 可见性检查工具类
 */
class VisibilityChecker {
    /**
     * 检查节点是否可访问
     */
    static isAccessible(node: any, context: AccessContext): boolean {
        if (!node.visible) {
            return true; // 默认公开
        }
        
        const visibility = node.visible.getText();
        
        switch (visibility) {
            case Visibility.PUBLIC:
                return true;
            case Visibility.PRIVATE:
                return this.isInSameScope(node, context);
            default:
                return true;
        }
    }
    
    /**
     * 检查是否在同一作用域内（私有访问）
     */
    private static isInSameScope(node: any, context: AccessContext): boolean {
        if (!context.currentStruct) {
            return false;
        }
        
        // 检查节点是否属于当前结构体
        return this.belongsToStruct(node, context.currentStruct);
    }
    
    
    /**
     * 检查节点是否属于指定结构体
     */
    private static belongsToStruct(node: any, struct: any): boolean {
        // 检查节点是否在结构体内部
        if (node.start && struct.start && struct.end) {
            return node.start.line >= struct.start.line && 
                   node.start.line <= struct.end.line;
        }
        return false;
    }
    
    
    /**
     * 获取可见性字符串
     */
    static getVisibilityString(node: any): string {
        if (!node.visible) {
            return Visibility.PUBLIC;
        }
        return node.visible.getText();
    }
    
    /**
     * 检查是否为私有
     */
    static isPrivate(node: any): boolean {
        return node.visible && node.visible.getText() === Visibility.PRIVATE;
    }
    
    /**
     * 检查是否为公有
     */
    static isPublic(node: any): boolean {
        return !node.visible || node.visible.getText() === Visibility.PUBLIC;
    }
}



export class AutoHoverProvider implements vscode.HoverProvider {

    provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
        const doc = GlobalContext.get(document.uri.fsPath);
        if (!doc) {
            return null;
        }

        // 获取当前位置的单词
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return null;
        }
        
        const key = document.getText(wordRange);
        if (!key) {
            return null;
        }

        // 创建访问上下文
        const accessContext: AccessContext = {
            document,
            position,
            currentStruct: this.findCurrentStruct(doc, position),
            currentFunction: this.findCurrentFunction(doc, position),
            currentMethod: this.findCurrentMethod(doc, position)
        };

        // 创建主要的 hover 对象，用于收集所有内容
        const hoverContents: vscode.MarkdownString[] = [];
        let hasContent = false;

        // 查找匹配的 natives
        const natives = GlobalContext.get_natives_by_name(key);
        natives.forEach(native => {
            hoverContents.push(this.createNativeHoverContent(native));
            hasContent = true;
        });

        // 获取所有函数类型（包括functions和methods）
        const functionSet = GlobalContext.get_func_by_name(key);
        
        // 分离functions和methods
        const functions = functionSet.filter((item: any) => item.name && item.name.getText() === key && this.isFunction(item));
        const methods = functionSet.filter((item: any) => item.name && item.name.getText() === key && this.isMethod(item));

        // 添加functions
        functions.forEach(func => {
            hoverContents.push(this.createFunctionHoverContent(func));
            hasContent = true;
        });

        // 添加methods（使用可见性检查）
        methods.forEach(method => {
            if (VisibilityChecker.isAccessible(method, accessContext)) {
                hoverContents.push(this.createMethodHoverContent(method, accessContext));
                hasContent = true;
            }
        });

        // 查找匹配的 structs
        const matchedStructs = GlobalContext.get_structs_by_name(key);
        matchedStructs.forEach(struct => {
            hoverContents.push(this.createStructHoverContent(struct));
            hasContent = true;
        });

        // 获取所有结构体，用于 super 关键字处理
        const allStructs = GlobalContext.get_structs();

        // 查找匹配的全局变量
        const globalVariables = GlobalContext.get_global_variables_by_name(key);
        globalVariables.forEach(globalVar => {
            hoverContents.push(this.createGlobalVariableHoverContent(globalVar));
            hasContent = true;
        });

        // 查找匹配的类型
        const types = GlobalContext.get_types();
        const matchedTypes = types.filter(type => type.name && type.name.getText() === key);
        matchedTypes.forEach(type => {
            hoverContents.push(this.createTypeHoverContent(type));
            hasContent = true;
        });

        // 查找匹配的接口
        const interfaces = GlobalContext.get_interfaces();
        const matchedInterfaces = interfaces.filter(interface_ => interface_.name && interface_.name.getText() === key);
        matchedInterfaces.forEach(interface_ => {
            hoverContents.push(this.createInterfaceHoverContent(interface_));
            hasContent = true;
        });

        // 查找匹配的模块
        const modules = GlobalContext.get_modules();
        const matchedModules = modules.filter(module => module.name && module.name.getText() === key);
        matchedModules.forEach(module => {
            hoverContents.push(this.createModuleHoverContent(module));
            hasContent = true;
        });

        // 查找匹配的成员（使用可见性检查）
        const globalMembers = GlobalContext.get_global_variables();
        const matchedMembers = globalMembers.filter((member: any) => member.name && member.name.getText() === key && this.isMember(member));
        matchedMembers.forEach(member => {
            if (VisibilityChecker.isAccessible(member, accessContext)) {
                hoverContents.push(this.createMemberHoverContent(member, accessContext));
                hasContent = true;
            }
        });

        // 查找匹配的委托
        const delegates = GlobalContext.get_delegates();
        const matchedDelegates = delegates.filter((delegate: any) => delegate.name && delegate.name.getText() === key);
        matchedDelegates.forEach(delegate => {
            hoverContents.push(this.createDelegateHoverContent(delegate));
            hasContent = true;
        });

        const pos = new Position(position.line, position.character);

        // 查找结构体内部的特殊关键字和成员
        doc.acceptStruct(struct => {
            if (struct.contains(pos)) {
                if (key === "this") {
                    hoverContents.push(this.createStructHoverContent(struct));
                    hasContent = true;
                }
                if (key === "thistype") {
                    hoverContents.push(this.createStructHoverContent(struct));
                    hasContent = true;
                    
                }
                if (key === "super") {
                    const parentStructs = allStructs.filter(s => s.name && struct.extends?.map((x: any) => x.getText())?.includes(s.name.getText()));
                    parentStructs.forEach(s => {
                        hoverContents.push(this.createStructHoverContent(s));
                        hasContent = true;
                    });
                }
                
                // 查找结构体内部的私有方法和成员（使用可见性检查）
                doc.acceptMethodFromNode(struct, method => {
                    if (VisibilityChecker.isPrivate(method) && method.name && method.name.getText() === key) {
                        if (VisibilityChecker.isAccessible(method, accessContext)) {
                            hoverContents.push(this.createMethodHoverContent(method, accessContext));
                            hasContent = true;
                        }
                    }
                });
                doc.acceptMemberFromNode(struct, member => {
                    if (VisibilityChecker.isPrivate(member) && member.name && member.name.getText() === key) {
                        if (VisibilityChecker.isAccessible(member, accessContext)) {
                            hoverContents.push(this.createMemberHoverContent(member, accessContext));
                            hasContent = true;
                        }
                    }
                });
                doc.acceptDelegateFromNode(struct, delegate => {
                    if (VisibilityChecker.isPrivate(delegate) && delegate.name && delegate.name.getText() === key) {
                        if (VisibilityChecker.isAccessible(delegate, accessContext)) {
                            hoverContents.push(this.createDelegateHoverContent(delegate));
                            hasContent = true;
                        }
                    }
                });
            }
        });

        // 查找当前文档中的局部变量和参数
        doc.acceptFunc(func => {
            if (func.contains(pos)) {
                doc.acceptLocalFromNode(func, local => {
                    if (local.name && local.name.getText() === key) {
                        hoverContents.push(this.createLocalVariableHoverContent(local));
                        hasContent = true;
                    }
                });
                if (func.takes) {
                    func.takes.forEach(take => {
                        if (take.name && take.name.getText() === key) {
                            hoverContents.push(this.createLocalVariableHoverContent(take));
                            hasContent = true;
                        }
                    });
                }
            }
        });
        
        doc.acceptMethod(method => {
            if (method.contains(pos)) {
                doc.acceptLocalFromNode(method, local => {
                    if (local.name && local.name.getText() === key) {
                        hoverContents.push(this.createLocalVariableHoverContent(local));
                        hasContent = true;
                    }
                });
                if (method.takes) {
                    method.takes.forEach(take => {
                        if (take.name && take.name.getText() === key) {
                            hoverContents.push(this.createLocalVariableHoverContent(take));
                            hasContent = true;
                        }
                    });
                }
            }
        });

        // 如果有内容，返回收集到的所有内容
        if (hasContent) {
            return new vscode.Hover(hoverContents, wordRange);
        }

        return null;
    }

    /**
     * 创建 Native 的 Hover 内容
     */
    private createNativeHover(native: any, range: vscode.Range): vscode.Hover {
        const ms = new vscode.MarkdownString();
        
        // 设置标题
        ms.appendMarkdown(`## Native: \`${native.name ? native.name.getText() : "(unknown)"}\``);
        ms.appendText("\n\n");
        
        // 添加函数签名
        ms.appendCodeblock(native.to_string(), "jass");
        ms.appendText("\n");
        
        // 添加文件路径信息
        if (native.document && native.document.filePath) {
            ms.appendMarkdown(`\`${native.document.filePath}\``);
            ms.appendText("\n\n");
        }
        
        // 添加废弃标记
        if (native.is_deprecated) {
            ms.appendMarkdown(`***@deprecated***`);
            ms.appendText("\n");
        }
        
        // 添加描述
        if (native.description && native.description.length > 0) {
            native.description.forEach((desc: string) => {
                ms.appendMarkdown(desc);
                ms.appendText("\n");
            });
        }
        
        // 添加参数描述
        if (native.takes && native.takes.length > 0) {
            native.takes.forEach((take: any) => {
                const desc = take.desciprtion;
                if (desc && desc.content) {
                    ms.appendMarkdown(`${desc.name}: ${desc.content}`);
                    ms.appendText("\n");
                }
            });
        }
        
        return new vscode.Hover(ms, range);
    }

    /**
     * 创建 Native 的 Hover 内容（仅返回 MarkdownString）
     */
    private createNativeHoverContent(native: any): vscode.MarkdownString {
        const ms = new vscode.MarkdownString();
        
        // 设置标题
        ms.appendMarkdown(`## Native: \`${native.name ? native.name.getText() : "(unknown)"}\``);
        ms.appendText("\n\n");
        
        // 添加函数签名
        ms.appendCodeblock(native.to_string(), "jass");
        ms.appendText("\n");
        
        // 添加文件路径信息
        if (native.document && native.document.filePath) {
            ms.appendMarkdown(`\`${native.document.filePath}\``);
            ms.appendText("\n\n");
        }
        
        // 添加废弃标记
        if (native.is_deprecated) {
            ms.appendMarkdown(`***@deprecated***`);
            ms.appendText("\n");
        }
        
        // 添加描述
        if (native.description && native.description.length > 0) {
            native.description.forEach((desc: string) => {
                ms.appendMarkdown(desc);
                ms.appendText("\n");
            });
        }
        
        // 添加参数描述
        if (native.takes && native.takes.length > 0) {
            native.takes.forEach((take: any) => {
                const desc = take.desciprtion;
                if (desc && desc.content) {
                    ms.appendMarkdown(`${desc.name}: ${desc.content}`);
                    ms.appendText("\n");
                }
            });
        }
        
        return ms;
    }

    /**
     * 创建 Function 的 Hover 内容
     */
    private createFunctionHover(func: any, range: vscode.Range): vscode.Hover {
        const ms = new vscode.MarkdownString();
        
        // 设置标题
        ms.appendMarkdown(`## Function: \`${func.name ? func.name.getText() : "(unknown)"}\``);
        ms.appendText("\n\n");
        
        // 添加函数签名
        ms.appendCodeblock(func.to_string(), "jass");
        ms.appendText("\n");
        
        // 添加文件路径信息
        if (func.document && func.document.filePath) {
            ms.appendMarkdown(`\`${func.document.filePath}\``);
            ms.appendText("\n\n");
        }
        
        // 添加废弃标记
        if (func.is_deprecated) {
            ms.appendMarkdown(`***@deprecated***`);
            ms.appendText("\n");
        }
        
        // 添加描述
        if (func.description && func.description.length > 0) {
            func.description.forEach((desc: string) => {
                ms.appendMarkdown(desc);
                ms.appendText("\n");
            });
        }
        
        // 添加参数描述
        if (func.takes && func.takes.length > 0) {
            func.takes.forEach((take: any) => {
                const desc = take.desciprtion;
                if (desc && desc.content) {
                    ms.appendMarkdown(`${desc.name}: ${desc.content}`);
                    ms.appendText("\n");
                }
            });
        }
        
        return new vscode.Hover(ms, range);
    }

    /**
     * 创建 Function 的 Hover 内容（仅返回 MarkdownString）
     */
    private createFunctionHoverContent(func: any): vscode.MarkdownString {
        const ms = new vscode.MarkdownString();
        
        // 设置标题
        ms.appendMarkdown(`## Function: \`${func.name ? func.name.getText() : "(unknown)"}\``);
        ms.appendText("\n\n");
        
        // 添加函数签名
        ms.appendCodeblock(func.to_string(), "jass");
        ms.appendText("\n");
        
        // 添加文件路径信息
        if (func.document && func.document.filePath) {
            ms.appendMarkdown(`\`${func.document.filePath}\``);
            ms.appendText("\n\n");
        }
        
        // 添加废弃标记
        if (func.is_deprecated) {
            ms.appendMarkdown(`***@deprecated***`);
            ms.appendText("\n");
        }
        
        // 添加描述
        if (func.description && func.description.length > 0) {
            func.description.forEach((desc: string) => {
                ms.appendMarkdown(desc);
                ms.appendText("\n");
            });
        }
        
        // 添加参数描述
        if (func.takes && func.takes.length > 0) {
            func.takes.forEach((take: any) => {
                const desc = take.desciprtion;
                if (desc && desc.content) {
                    ms.appendMarkdown(`${desc.name}: ${desc.content}`);
                    ms.appendText("\n");
                }
            });
        }
        
        return ms;
    }

    /**
     * 创建 Struct 的 Hover 内容
     */
    private createStructHover(struct: any, range: vscode.Range): vscode.Hover {
        const ms = new vscode.MarkdownString();
        
        // 设置标题
        ms.appendMarkdown(`## Struct: \`${struct.name ? struct.name.getText() : "(unknown)"}\``);
        ms.appendText("\n\n");
        
        // 添加结构体定义
        if (struct.to_string) {
            ms.appendCodeblock(struct.to_string(), "jass");
            ms.appendText("\n");
        }
        
        // 添加文件路径信息
        if (struct.document && struct.document.filePath) {
            ms.appendMarkdown(`\`${struct.document.filePath}\``);
            ms.appendText("\n\n");
        }
        
        // 添加描述
        if (struct.description && struct.description.length > 0) {
            struct.description.forEach((desc: string) => {
                ms.appendMarkdown(desc);
                ms.appendText("\n");
            });
        }
        
        return new vscode.Hover(ms, range);
    }

    /**
     * 创建 Struct 的 Hover 内容（仅返回 MarkdownString）
     */
    private createStructHoverContent(struct: any): vscode.MarkdownString {
        const ms = new vscode.MarkdownString();
        
        // 设置标题
        ms.appendMarkdown(`## Struct: \`${struct.name ? struct.name.getText() : "(unknown)"}\``);
        ms.appendText("\n\n");
        
        // 添加结构体定义
        if (struct.to_string) {
            ms.appendCodeblock(struct.to_string(), "jass");
            ms.appendText("\n");
        }
        
        // 添加文件路径信息
        if (struct.document && struct.document.filePath) {
            ms.appendMarkdown(`\`${struct.document.filePath}\``);
            ms.appendText("\n\n");
        }
        
        // 添加描述
        if (struct.description && struct.description.length > 0) {
            struct.description.forEach((desc: string) => {
                ms.appendMarkdown(desc);
                ms.appendText("\n");
            });
        }
        
        return ms;
    }

    /**
     * 创建全局变量的 Hover 内容
     */
    private createGlobalVariableHover(globalVar: any, range: vscode.Range): vscode.Hover {
        const ms = new vscode.MarkdownString();
        
        // 设置标题
        ms.appendMarkdown(`## Global Variable: \`${globalVar.name ? globalVar.name.getText() : "(unknown)"}\``);
        ms.appendText("\n\n");
        
        // 添加变量定义
        if (globalVar.to_string) {
            ms.appendCodeblock(globalVar.to_string(), "jass");
            ms.appendText("\n");
        } else if (globalVar.type) {
            // 如果没有 to_string 方法，构建简单的定义
            const varName = globalVar.name ? globalVar.name.getText() : "unknown";
            const varType = globalVar.type.getText();
            ms.appendCodeblock(`global ${varType} ${varName}`, "jass");
            ms.appendText("\n");
        }
        
        // 添加文件路径信息
        if (globalVar.document && globalVar.document.filePath) {
            ms.appendMarkdown(`\`${globalVar.document.filePath}\``);
            ms.appendText("\n\n");
        }
        
        // 添加描述
        if (globalVar.description && globalVar.description.length > 0) {
            globalVar.description.forEach((desc: string) => {
                ms.appendMarkdown(desc);
                ms.appendText("\n");
            });
        }
        
        return new vscode.Hover(ms, range);
    }

    /**
     * 创建类型的 Hover 内容
     */
    private createTypeHover(type: any, range: vscode.Range): vscode.Hover {
        const ms = new vscode.MarkdownString();
        const typeName = type.name ? type.name.getText() : "(unknown)";
        
        // 设置标题
        ms.appendMarkdown(`## Type: \`${typeName}\``);
        ms.appendText("\n\n");
        
        // 添加类型信息
        ms.appendCodeblock(type.to_string(), "jass");
        ms.appendText("\n\n");
        
        // 添加文件路径信息
        if (type.document && type.document.filePath) {
            ms.appendMarkdown(`\`${type.document.filePath}\``);
            ms.appendText("\n\n");
        }
        
        // 添加继承信息
        if (type.extends && type.extends.getText()) {
            ms.appendMarkdown(`extends \`${type.extends.getText()}\``);
            ms.appendText("\n\n");
        }
        
        // 添加基本类型描述
        const typeDescriptions: { [key: string]: string } = {
            'key': "唯一的整数常量",
            'integer': '整数类型，范围 -2147483648 到 2147483647',
            'real': '浮点数类型，范围 -3.4e38 到 3.4e38',
            'boolean': '布尔类型，true 或 false',
            'string': '字符串类型',
            'nothing': '空类型，表示无返回值',
            'handle': '句柄类型，所有对象的基础类型',
            'unit': '单位类型',
            'player': '玩家类型',
            'location': '位置类型',
            'rect': '矩形区域类型',
            'trigger': '触发器类型',
            'event': '事件类型',
            'condition': '条件类型',
            'action': '动作类型',
            'timer': '计时器类型',
            'group': '单位组类型',
            'force': '玩家组类型',
            'effect': '特效类型',
            'sound': '声音类型',
            'image': '图像类型',
            'ubersplat': '地面特效类型',
            'item': '物品类型',
            'widget': '控件类型',
            'destructable': '可破坏物类型',
            'ability': '技能类型',
            'buff': '状态类型',
            'dialog': '对话框类型',
            'button': '按钮类型',
            'quest': '任务类型',
            'questitem': '任务物品类型',
            'defeatcondition': '失败条件类型',
            'timerdialog': '计时器对话框类型',
            'leaderboard': '排行榜类型',
            'multiboard': '多面板类型',
            'trackable': '可追踪类型',
            'gamecache': '游戏缓存类型',
            'texttag': '文本标签类型',
            'lightning': '闪电类型',
            'weathereffect': '天气效果类型',
            'sprite': '精灵类型',
            'fogmodifier': '迷雾修改器类型',
            'fogstate': '迷雾状态类型',
            'region': '区域类型',
            'camerasetup': '摄像机设置类型',
            'boolexpr': '布尔表达式类型',
            'code': '代码类型',
            'triggercondition': '触发器条件类型',
            'triggeraction': '触发器动作类型'
        };
        
        if (typeDescriptions[typeName]) {
            ms.appendMarkdown(typeDescriptions[typeName]);
        }
        
        return new vscode.Hover(ms, range);
    }

    /**
     * 创建接口的 Hover 内容
     */
    private createInterfaceHover(interface_: any, range: vscode.Range): vscode.Hover {
        const ms = new vscode.MarkdownString();
        
        // 设置标题
        ms.appendMarkdown(`## Interface: \`${interface_.name ? interface_.name.getText() : "(unknown)"}\``);
        ms.appendText("\n\n");
        
        // 添加接口定义
        if (interface_.to_string) {
            ms.appendCodeblock(interface_.to_string(), "jass");
            ms.appendText("\n");
        } else {
            // 构建接口定义
            const interfaceName = interface_.name ? interface_.name.getText() : "unknown";
            let interfaceDef = `interface ${interfaceName}`;
            if (interface_.extends && interface_.extends.getText()) {
                interfaceDef += ` extends ${interface_.extends.getText()}`;
            }
            ms.appendCodeblock(interfaceDef, "jass");
            ms.appendText("\n");
        }
        
        // 添加文件路径信息
        if (interface_.document && interface_.document.filePath) {
            ms.appendMarkdown(`\`${interface_.document.filePath}\``);
            ms.appendText("\n\n");
        }
        
        // 添加描述
        if (interface_.description && interface_.description.length > 0) {
            interface_.description.forEach((desc: string) => {
                ms.appendMarkdown(desc);
                ms.appendText("\n");
            });
        }
        
        return new vscode.Hover(ms, range);
    }

    /**
     * 创建模块的 Hover 内容
     */
    private createModuleHover(module: any, range: vscode.Range): vscode.Hover {
        const ms = new vscode.MarkdownString();
        
        // 设置标题
        ms.appendMarkdown(`## Module: \`${module.name ? module.name.getText() : "(unknown)"}\``);
        ms.appendText("\n\n");
        
        // 添加模块定义
        if (module.to_string) {
            ms.appendCodeblock(module.to_string(), "jass");
            ms.appendText("\n");
        } else {
            // 构建模块定义
            const moduleName = module.name ? module.name.getText() : "unknown";
            ms.appendCodeblock(`module ${moduleName}`, "jass");
            ms.appendText("\n");
        }
        
        // 添加文件路径信息
        if (module.document && module.document.filePath) {
            ms.appendMarkdown(`\`${module.document.filePath}\``);
            ms.appendText("\n\n");
        }
        
        // 添加描述
        if (module.description && module.description.length > 0) {
            module.description.forEach((desc: string) => {
                ms.appendMarkdown(desc);
                ms.appendText("\n");
            });
        }
        
        return new vscode.Hover(ms, range);
    }

    /**
     * 创建方法的 Hover 内容
     */
    private createMethodHover(method: any, range: vscode.Range): vscode.Hover {
        const ms = new vscode.MarkdownString();
        
        // 设置标题
        ms.appendMarkdown(`## Method: \`${method.name ? method.name.getText() : "(unknown)"}\``);
        ms.appendText("\n\n");
        
        // 添加方法定义
        if (method.to_string) {
            ms.appendCodeblock(method.to_string(), "jass");
            ms.appendText("\n");
        } else {
            // 构建方法定义
            const methodName = method.name ? method.name.getText() : "unknown";
            const visible = method.visible ? method.visible.getText() + " " : "";
            const modifier = method.modifier ? method.modifier.getText() + " " : "";
            const takes = method.takes && method.takes.length > 0 
                ? method.takes.map((take: any) => take.to_string()).join(",") 
                : "nothing";
            const returns = method.returns ? method.returns.getText() : "nothing";
            
            ms.appendCodeblock(`${visible}${modifier}method ${methodName} takes ${takes} returns ${returns}`, "jass");
            ms.appendText("\n");
        }
        
        // 添加文件路径信息
        if (method.document && method.document.filePath) {
            ms.appendMarkdown(`\`${method.document.filePath}\``);
            ms.appendText("\n\n");
        }
        
        // 添加可见性信息
        if (method.visible) {
            const visibility = method.visible.getText();
            ms.appendMarkdown(`${visibility} method`);
            ms.appendText("\n\n");
        }
        
        // 添加废弃标记
        if (method.is_deprecated) {
            ms.appendMarkdown(`***@deprecated***`);
            ms.appendText("\n");
        }
        
        // 添加描述
        if (method.description && method.description.length > 0) {
            method.description.forEach((desc: string) => {
                ms.appendMarkdown(desc);
                ms.appendText("\n");
            });
        }
        
        // 添加参数描述
        if (method.takes && method.takes.length > 0) {
            method.takes.forEach((take: any) => {
                const desc = take.desciprtion;
                if (desc && desc.content) {
                    ms.appendMarkdown(`${desc.name}: ${desc.content}`);
                    ms.appendText("\n");
                }
            });
        }
        
        return new vscode.Hover(ms, range);
    }

    /**
     * 创建成员的 Hover 内容
     */
    private createMemberHover(member: any, range: vscode.Range): vscode.Hover {
        const ms = new vscode.MarkdownString();
        
        // 设置标题
        ms.appendMarkdown(`## Member: \`${member.name ? member.name.getText() : "(unknown)"}\``);
        ms.appendText("\n\n");
        
        // 添加成员定义
        if (member.to_string) {
            ms.appendCodeblock(member.to_string(), "jass");
            ms.appendText("\n");
        } else if (member.type) {
            // 构建成员定义
            const memberName = member.name ? member.name.getText() : "unknown";
            const memberType = member.type.getText();
            const visible = member.visible ? member.visible.getText() + " " : "";
            const modifier = member.modifier ? member.modifier.getText() + " " : "";
            
            ms.appendCodeblock(`${visible}${modifier}${memberType} ${memberName}`, "jass");
            ms.appendText("\n");
        }
        
        // 添加文件路径信息
        if (member.document && member.document.filePath) {
            ms.appendMarkdown(`\`${member.document.filePath}\``);
            ms.appendText("\n\n");
        }
        
        // 添加可见性信息
        if (member.visible) {
            const visibility = member.visible.getText();
            ms.appendMarkdown(`${visibility} member`);
            ms.appendText("\n\n");
        }
        
        // 添加类型信息
        if (member.type) {
            ms.appendMarkdown(`type: \`${member.type.getText()}\``);
            ms.appendText("\n\n");
        }
        
        // 添加描述
        if (member.description && member.description.length > 0) {
            member.description.forEach((desc: string) => {
                ms.appendMarkdown(desc);
                ms.appendText("\n");
            });
        }
        
        return new vscode.Hover(ms, range);
    }

    /**
     * 在作用域内查找局部变量和参数
     */
    private findLocalVariableInScope(document: any, position: vscode.Position, name: string): any {
        let foundLocal: any = null;
        let currentScope: any = null;
        
        // 首先找到当前光标所在的函数或方法
        currentScope = this.findCurrentFunctionOrMethod(document, position);
        if (!currentScope) {
            return null;
        }
        
        // 在找到的函数/方法中查找参数
        if (currentScope.takes && currentScope.takes.length > 0) {
            for (const take of currentScope.takes) {
                if (take.name && take.name.getText() === name) {
                    return take;
                }
            }
        }
        
        // 在找到的函数/方法中查找局部变量
        // 使用 visitor 模式查找局部变量
        document.accept({
            visitLocal: (node: any) => {
                // 检查局部变量是否在当前作用域内
                if (node.name && node.name.getText() === name && 
                    this.isNodeInScope(node, currentScope)) {
                    foundLocal = node;
                }
            }
        });
        
        return foundLocal;
    }

    /**
     * 查找当前光标所在的函数或方法
     */
    private findCurrentFunctionOrMethod(document: any, position: vscode.Position): any {
        let currentFunction: any = null;
        
        document.accept({
            visitFunc: (node: any) => {
                if (this.isPositionInNode(position, node)) {
                    currentFunction = node;
                }
            },
            visitMethod: (node: any) => {
                if (this.isPositionInNode(position, node)) {
                    currentFunction = node;
                }
            }
        });
        
        return currentFunction;
    }

    /**
     * 检查节点是否在指定作用域内
     */
    private isNodeInScope(node: any, scope: any): boolean {
        if (!node.start || !scope.start || !scope.end) {
            return false;
        }
        
        const nodeStart = new vscode.Position(node.start.line, node.start.position);
        const scopeStart = new vscode.Position(scope.start.line, scope.start.position);
        const scopeEnd = new vscode.Position(scope.end.line, scope.end.position);
        
        return nodeStart.isAfterOrEqual(scopeStart) && nodeStart.isBeforeOrEqual(scopeEnd);
    }

    /**
     * 创建局部变量或参数的 Hover 内容
     */
    private createLocalVariableHover(localVar: any, range: vscode.Range): vscode.Hover {
        const ms = new vscode.MarkdownString();
        
        // 判断是参数还是局部变量
        const isParameter = this.isParameter(localVar);
        const variableType = isParameter ? "Parameter" : "Local Variable";
        
        // 设置标题
        ms.appendMarkdown(`## ${variableType}: \`${localVar.name ? localVar.name.getText() : "(unknown)"}\``);
        ms.appendText("\n\n");
        
        // 添加变量定义
        if (localVar.to_string) {
            ms.appendCodeblock(localVar.to_string(), "jass");
            ms.appendText("\n");
        } else if (localVar.type) {
            // 构建变量定义
            const varName = localVar.name ? localVar.name.getText() : "unknown";
            const varType = localVar.type.getText();
            const keyword = isParameter ? "parameter" : "local";
            ms.appendCodeblock(`${keyword} ${varType} ${varName}`, "jass");
            ms.appendText("\n");
        }
        
        // 添加文件路径信息
        if (localVar.document && localVar.document.filePath) {
            ms.appendMarkdown(`\`${localVar.document.filePath}\``);
            ms.appendText("\n\n");
        }
        
        // 如果是参数，添加参数描述
        if (isParameter && localVar.desciprtion && localVar.desciprtion.content) {
            ms.appendMarkdown(localVar.desciprtion.content);
            ms.appendText("\n\n");
        }
        
        // 添加描述
        if (localVar.description && localVar.description.length > 0) {
            localVar.description.forEach((desc: string) => {
                ms.appendMarkdown(desc);
                ms.appendText("\n");
            });
        }
        
        return new vscode.Hover(ms, range);
    }

    /**
     * 判断是否是参数
     */
    private isParameter(node: any): boolean {
        // 检查是否有 takes 相关的属性，或者检查父节点类型
        return node.desciprtion !== undefined || 
               (node.parent && node.parent.takes && node.parent.takes.includes(node));
    }

    /**
     * 判断是否是方法
     */
    private isMethod(node: any): boolean {
        // 使用新的类型检查工具，避免instanceof继承问题
        return ASTNodeTypeChecker.isAnyMethod(node);
    }

    /**
     * 判断是否是函数
     */
    private isFunction(node: any): boolean {
        // 使用新的类型检查工具，避免instanceof继承问题
        return ASTNodeTypeChecker.isFunc(node) || ASTNodeTypeChecker.isNative(node) || ASTNodeTypeChecker.isZincFunc(node);
    }

    /**
     * 判断是否是成员
     */
    private isMember(node: any): boolean {
        // 检查是否是成员变量
        return node.constructor && node.constructor.name === 'Member' ||
               (node.hasOwnProperty('type') && !node.hasOwnProperty('takes'));
    }

    /**
     * 创建全局变量的 Hover 内容（仅返回 MarkdownString）
     */
    private createGlobalVariableHoverContent(globalVar: any): vscode.MarkdownString {
        const ms = new vscode.MarkdownString();
        
        // 设置标题
        ms.appendMarkdown(`## Global Variable: \`${globalVar.name ? globalVar.name.getText() : "(unknown)"}\``);
        ms.appendText("\n\n");
        
        // 添加变量定义
        if (globalVar.to_string) {
            ms.appendCodeblock(globalVar.to_string(), "jass");
            ms.appendText("\n");
        } else if (globalVar.type) {
            // 如果没有 to_string 方法，构建简单的定义
            const varName = globalVar.name ? globalVar.name.getText() : "unknown";
            const varType = globalVar.type.getText();
            ms.appendCodeblock(`global ${varType} ${varName}`, "jass");
            ms.appendText("\n");
        }
        
        // 添加文件路径信息
        if (globalVar.document && globalVar.document.filePath) {
            ms.appendMarkdown(`\`${globalVar.document.filePath}\``);
            ms.appendText("\n\n");
        }
        
        // 添加描述
        if (globalVar.description && globalVar.description.length > 0) {
            globalVar.description.forEach((desc: string) => {
                ms.appendMarkdown(desc);
                ms.appendText("\n");
            });
        }
        
        return ms;
    }

    /**
     * 创建类型的 Hover 内容（仅返回 MarkdownString）
     */
    private createTypeHoverContent(type: any): vscode.MarkdownString {
        const ms = new vscode.MarkdownString();
        const typeName = type.name ? type.name.getText() : "(unknown)";
        
        // 设置标题
        ms.appendMarkdown(`## Type: \`${typeName}\``);
        ms.appendText("\n\n");
        
        // 添加类型信息
        ms.appendCodeblock(type.to_string(), "jass");
        ms.appendText("\n\n");
        
        // 添加文件路径信息
        if (type.document && type.document.filePath) {
            ms.appendMarkdown(`\`${type.document.filePath}\``);
            ms.appendText("\n\n");
        }
        
        // 添加继承信息
        if (type.extends && type.extends.getText()) {
            ms.appendMarkdown(`extends \`${type.extends.getText()}\``);
            ms.appendText("\n\n");
        }
        
        // 添加基本类型描述
        const typeDescriptions: { [key: string]: string } = {
            'integer': '整数类型，范围 -2147483648 到 2147483647',
            'real': '浮点数类型，范围 -3.4e38 到 3.4e38',
            'boolean': '布尔类型，true 或 false',
            'string': '字符串类型',
            'nothing': '空类型，表示无返回值',
            'handle': '句柄类型，所有对象的基础类型'
        };
        
        if (typeDescriptions[typeName]) {
            ms.appendMarkdown(typeDescriptions[typeName]);
        }
        
        return ms;
    }

    /**
     * 创建接口的 Hover 内容（仅返回 MarkdownString）
     */
    private createInterfaceHoverContent(interface_: any): vscode.MarkdownString {
        const ms = new vscode.MarkdownString();
        
        // 设置标题
        ms.appendMarkdown(`## Interface: \`${interface_.name ? interface_.name.getText() : "(unknown)"}\``);
        ms.appendText("\n\n");
        
        // 添加接口定义
        if (interface_.to_string) {
            ms.appendCodeblock(interface_.to_string(), "jass");
            ms.appendText("\n");
        } else {
            // 构建接口定义
            const interfaceName = interface_.name ? interface_.name.getText() : "unknown";
            let interfaceDef = `interface ${interfaceName}`;
            if (interface_.extends && interface_.extends.getText()) {
                interfaceDef += ` extends ${interface_.extends.getText()}`;
            }
            ms.appendCodeblock(interfaceDef, "jass");
            ms.appendText("\n");
        }
        
        // 添加文件路径信息
        if (interface_.document && interface_.document.filePath) {
            ms.appendMarkdown(`\`${interface_.document.filePath}\``);
            ms.appendText("\n\n");
        }
        
        // 添加描述
        if (interface_.description && interface_.description.length > 0) {
            interface_.description.forEach((desc: string) => {
                ms.appendMarkdown(desc);
                ms.appendText("\n");
            });
        }
        
        return ms;
    }

    /**
     * 创建模块的 Hover 内容（仅返回 MarkdownString）
     */
    private createModuleHoverContent(module: any): vscode.MarkdownString {
        const ms = new vscode.MarkdownString();
        
        // 设置标题
        ms.appendMarkdown(`## Module: \`${module.name ? module.name.getText() : "(unknown)"}\``);
        ms.appendText("\n\n");
        
        // 添加模块定义
        if (module.to_string) {
            ms.appendCodeblock(module.to_string(), "jass");
            ms.appendText("\n");
        } else {
            // 构建模块定义
            const moduleName = module.name ? module.name.getText() : "unknown";
            ms.appendCodeblock(`module ${moduleName}`, "jass");
            ms.appendText("\n");
        }
        
        // 添加文件路径信息
        if (module.document && module.document.filePath) {
            ms.appendMarkdown(`\`${module.document.filePath}\``);
            ms.appendText("\n\n");
        }
        
        // 添加描述
        if (module.description && module.description.length > 0) {
            module.description.forEach((desc: string) => {
                ms.appendMarkdown(desc);
                ms.appendText("\n");
            });
        }
        
        return ms;
    }

    /**
     * 创建方法的 Hover 内容（仅返回 MarkdownString）
     */
    private createMethodHoverContent(method: any, accessContext?: AccessContext): vscode.MarkdownString {
        const ms = new vscode.MarkdownString();
        
        // 设置标题
        ms.appendMarkdown(`## Method: \`${method.name ? method.name.getText() : "(unknown)"}\``);
        ms.appendText("\n\n");
        
        // 添加方法定义
        if (method.to_string) {
            ms.appendCodeblock(method.to_string(), "jass");
            ms.appendText("\n");
        } else {
            // 构建方法定义
            const methodName = method.name ? method.name.getText() : "unknown";
            const visible = method.visible ? method.visible.getText() + " " : "";
            const modifier = method.modifier ? method.modifier.getText() + " " : "";
            const takes = method.takes && method.takes.length > 0 
                ? method.takes.map((take: any) => take.to_string()).join(",") 
                : "nothing";
            const returns = method.returns ? method.returns.getText() : "nothing";
            
            ms.appendCodeblock(`${visible}${modifier}method ${methodName} takes ${takes} returns ${returns}`, "jass");
            ms.appendText("\n");
        }
        
        // 添加文件路径信息
        if (method.document && method.document.filePath) {
            ms.appendMarkdown(`\`${method.document.filePath}\``);
            ms.appendText("\n\n");
        }
        
        // 添加可见性信息
        if (method.visible) {
            const visibility = method.visible.getText();
            ms.appendMarkdown(`${visibility} method`);
            ms.appendText("\n\n");
        }
        
        // 添加废弃标记
        if (method.is_deprecated) {
            ms.appendMarkdown(`***@deprecated***`);
            ms.appendText("\n");
        }
        
        // 添加描述
        if (method.description && method.description.length > 0) {
            method.description.forEach((desc: string) => {
                ms.appendMarkdown(desc);
                ms.appendText("\n");
            });
        }
        
        // 添加参数描述
        if (method.takes && method.takes.length > 0) {
            method.takes.forEach((take: any) => {
                const desc = take.desciprtion;
                if (desc && desc.content) {
                    ms.appendMarkdown(`${desc.name}: ${desc.content}`);
                    ms.appendText("\n");
                }
            });
        }
        
        return ms;
    }

    /**
     * 创建成员的 Hover 内容（仅返回 MarkdownString）
     */
    private createMemberHoverContent(member: any, accessContext?: AccessContext): vscode.MarkdownString {
        const ms = new vscode.MarkdownString();
        
        // 设置标题
        ms.appendMarkdown(`## Member: \`${member.name ? member.name.getText() : "(unknown)"}\``);
        ms.appendText("\n\n");
        
        // 添加成员定义
        if (member.to_string) {
            ms.appendCodeblock(member.to_string(), "jass");
            ms.appendText("\n");
        } else if (member.type) {
            // 构建成员定义
            const memberName = member.name ? member.name.getText() : "unknown";
            const memberType = member.type.getText();
            const visible = member.visible ? member.visible.getText() + " " : "";
            const modifier = member.modifier ? member.modifier.getText() + " " : "";
            
            ms.appendCodeblock(`${visible}${modifier}${memberType} ${memberName}`, "jass");
            ms.appendText("\n");
        }
        
        // 添加文件路径信息
        if (member.document && member.document.filePath) {
            ms.appendMarkdown(`\`${member.document.filePath}\``);
            ms.appendText("\n\n");
        }
        
        // 添加可见性信息
        if (member.visible) {
            const visibility = member.visible.getText();
            ms.appendMarkdown(`${visibility} member`);
            ms.appendText("\n\n");
        }
        
        // 添加类型信息
        if (member.type) {
            ms.appendMarkdown(`type: \`${member.type.getText()}\``);
            ms.appendText("\n\n");
        }
        
        // 添加描述
        if (member.description && member.description.length > 0) {
            member.description.forEach((desc: string) => {
                ms.appendMarkdown(desc);
                ms.appendText("\n");
            });
        }
        
        return ms;
    }

    /**
     * 创建局部变量的 Hover 内容（仅返回 MarkdownString）
     */
    private createLocalVariableHoverContent(localVar: any): vscode.MarkdownString {
        const ms = new vscode.MarkdownString();
        
        // 判断是参数还是局部变量
        const isParameter = this.isParameter(localVar);
        const variableType = isParameter ? "Parameter" : "Local Variable";
        
        // 设置标题
        ms.appendMarkdown(`## ${variableType}: \`${localVar.name ? localVar.name.getText() : "(unknown)"}\``);
        ms.appendText("\n\n");
        
        // 添加变量定义
        if (localVar.to_string) {
            ms.appendCodeblock(localVar.to_string(), "jass");
            ms.appendText("\n");
        } else if (localVar.type) {
            // 构建变量定义
            const varName = localVar.name ? localVar.name.getText() : "unknown";
            const varType = localVar.type.getText();
            const keyword = isParameter ? "parameter" : "local";
            ms.appendCodeblock(`${keyword} ${varType} ${varName}`, "jass");
            ms.appendText("\n");
        }
        
        // 添加文件路径信息
        if (localVar.document && localVar.document.filePath) {
            ms.appendMarkdown(`\`${localVar.document.filePath}\``);
            ms.appendText("\n\n");
        }
        
        // 如果是参数，添加参数描述
        if (isParameter && localVar.desciprtion && localVar.desciprtion.content) {
            ms.appendMarkdown(localVar.desciprtion.content);
            ms.appendText("\n\n");
        }
        
        // 添加描述
        if (localVar.description && localVar.description.length > 0) {
            localVar.description.forEach((desc: string) => {
                ms.appendMarkdown(desc);
                ms.appendText("\n");
            });
        }
        
        return ms;
    }

    /**
     * 创建委托的 Hover 内容（仅返回 MarkdownString）
     */
    private createDelegateHoverContent(delegate: any): vscode.MarkdownString {
        const ms = new vscode.MarkdownString();
        
        // 设置标题
        ms.appendMarkdown(`## Delegate: \`${delegate.name ? delegate.name.getText() : "(unknown)"}\``);
        ms.appendText("\n\n");
        
        // 添加委托定义
        if (delegate.to_string) {
            ms.appendCodeblock(delegate.to_string(), "jass");
            ms.appendText("\n");
        } else {
            // 构建委托定义
            const delegateName = delegate.name ? delegate.name.getText() : "unknown";
            const delegateType = delegate.delegateType ? delegate.delegateType.getText() : "unknown";
            const visible = delegate.visible ? delegate.visible.getText() + " " : "";
            const optional = delegate.optional ? delegate.optional.getText() + " " : "";
            
            ms.appendCodeblock(`delegate ${visible}${optional}${delegateType} ${delegateName}`, "jass");
            ms.appendText("\n");
        }
        
        // 添加文件路径信息
        if (delegate.document && delegate.document.filePath) {
            ms.appendMarkdown(`\`${delegate.document.filePath}\``);
            ms.appendText("\n\n");
        }
        
        // 添加可见性信息
        if (delegate.visible) {
            const visibility = delegate.visible.getText();
            ms.appendMarkdown(`${visibility} delegate`);
            ms.appendText("\n\n");
        }
        
        // 添加委托类型信息
        if (delegate.delegateType) {
            ms.appendMarkdown(`委托到: \`${delegate.delegateType.getText()}\``);
            ms.appendText("\n\n");
        }
        
        // 添加可选信息
        if (delegate.optional) {
            ms.appendMarkdown(`**可选委托** - 可能为 null`);
            ms.appendText("\n\n");
        }
        
        // 添加描述
        if (delegate.description && delegate.description.length > 0) {
            delegate.description.forEach((desc: string) => {
                ms.appendMarkdown(desc);
                ms.appendText("\n");
            });
        }
        
        return ms;
    }

    /**
     * 查找当前光标所在的结构体
     */
    private findCurrentStruct(doc: any, position: vscode.Position): any {
        let currentStruct: any = null;
        
        doc.acceptStruct((struct: any) => {
            if (this.isPositionInNode(position, struct)) {
                currentStruct = struct;
            }
        });
        
        return currentStruct;
    }

    /**
     * 查找当前光标所在的函数
     */
    private findCurrentFunction(doc: any, position: vscode.Position): any {
        let currentFunction: any = null;
        
        doc.acceptFunc((func: any) => {
            if (this.isPositionInNode(position, func)) {
                currentFunction = func;
            }
        });
        
        return currentFunction;
    }

    /**
     * 查找当前光标所在的方法
     */
    private findCurrentMethod(doc: any, position: vscode.Position): any {
        let currentMethod: any = null;
        
        doc.acceptMethod((method: any) => {
            if (this.isPositionInNode(position, method)) {
                currentMethod = method;
            }
        });
        
        return currentMethod;
    }

    /**
     * 检查位置是否在节点范围内
     */
    private isPositionInNode(position: vscode.Position, node: any): boolean {
        if (!node.start || !node.end) {
            return false;
        }
        
        const nodeStart = new vscode.Position(node.start.line, node.start.position);
        const nodeEnd = new vscode.Position(node.end.line, node.end.position);
        
        return position.isAfterOrEqual(nodeStart) && position.isBeforeOrEqual(nodeEnd);
    }
}

/**
 * 智能完成提供器 - 明确区分 private 和 public 成员
 */
export class SmartCompletionProvider implements vscode.CompletionItemProvider {
    
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        const doc = GlobalContext.get(document.uri.fsPath);
        if (!doc) {
            return [];
        }

        // 创建访问上下文
        const accessContext: AccessContext = {
            document,
            position,
            currentStruct: this.findCurrentStruct(doc, position),
            currentFunction: this.findCurrentFunction(doc, position),
            currentMethod: this.findCurrentMethod(doc, position)
        };

        const completionItems: vscode.CompletionItem[] = [];

        // 添加 natives
        const natives = GlobalContext.get_natives();
        natives.forEach((native: any) => {
            if (native.name) {
                const item = new vscode.CompletionItem(native.name.getText(), vscode.CompletionItemKind.Function);
                item.detail = "Native";
                item.documentation = native.to_string();
                completionItems.push(item);
            }
        });

        // 添加 functions
        const functions = GlobalContext.get_functions();
        functions.forEach((func: any) => {
            if (func.name) {
                const item = new vscode.CompletionItem(func.name.getText(), vscode.CompletionItemKind.Function);
                item.detail = "Function";
                item.documentation = func.to_string();
                completionItems.push(item);
            }
        });

        // 添加 methods（使用可见性检查）
        const functionSet = GlobalContext.get_native_and_func_and_method_by_name("");
        const methods = functionSet.filter((item: any) => this.isMethod(item));
        methods.forEach((method: any) => {
            if (method.name && VisibilityChecker.isAccessible(method, accessContext)) {
                const item = new vscode.CompletionItem(method.name.getText(), vscode.CompletionItemKind.Method);
                const visibility = VisibilityChecker.getVisibilityString(method);
                item.detail = `Method (${visibility})`;
                item.documentation = method.to_string();
                completionItems.push(item);
            }
        });

        // 添加 members（使用可见性检查）
        const globalMembers = GlobalContext.get_global_variables();
        const members = globalMembers.filter((member: any) => this.isMember(member));
        members.forEach((member: any) => {
            if (member.name && VisibilityChecker.isAccessible(member, accessContext)) {
                const item = new vscode.CompletionItem(member.name.getText(), vscode.CompletionItemKind.Field);
                const visibility = VisibilityChecker.getVisibilityString(member);
                item.detail = `Member (${visibility})`;
                item.documentation = member.to_string();
                completionItems.push(item);
            }
        });

        // 添加 structs
        const structs = GlobalContext.get_structs();
        structs.forEach(struct => {
            if (struct.name) {
                const item = new vscode.CompletionItem(struct.name.getText(), vscode.CompletionItemKind.Class);
                item.detail = "Struct";
                item.documentation = struct.to_string();
                completionItems.push(item);
            }
        });

        // 添加 interfaces
        const interfaces = GlobalContext.get_interfaces();
        interfaces.forEach(interface_ => {
            if (interface_.name) {
                const item = new vscode.CompletionItem(interface_.name.getText(), vscode.CompletionItemKind.Interface);
                item.detail = "Interface";
                item.documentation = interface_.to_string();
                completionItems.push(item);
            }
        });

        // 添加 modules
        const modules = GlobalContext.get_modules();
        modules.forEach(module => {
            if (module.name) {
                const item = new vscode.CompletionItem(module.name.getText(), vscode.CompletionItemKind.Module);
                item.detail = "Module";
                item.documentation = module.to_string();
                completionItems.push(item);
            }
        });

        // 添加全局变量
        const globalVariables = GlobalContext.get_global_variables();
        globalVariables.forEach(globalVar => {
            if (globalVar.name) {
                const item = new vscode.CompletionItem(globalVar.name.getText(), vscode.CompletionItemKind.Variable);
                item.detail = "Global Variable";
                item.documentation = globalVar.to_string();
                completionItems.push(item);
            }
        });

        // 添加局部变量和参数（在当前作用域内）
        this.addLocalVariables(completionItems, doc, accessContext);

        return completionItems;
    }

    /**
     * 添加局部变量和参数
     */
    private addLocalVariables(completionItems: vscode.CompletionItem[], doc: any, accessContext: AccessContext): void {
        if (!accessContext.currentFunction && !accessContext.currentMethod) {
            return;
        }

        const currentScope = accessContext.currentFunction || accessContext.currentMethod;
        
        // 添加参数
        if (currentScope.takes && currentScope.takes.length > 0) {
            currentScope.takes.forEach((take: any) => {
                if (take.name) {
                    const item = new vscode.CompletionItem(take.name.getText(), vscode.CompletionItemKind.Variable);
                    item.detail = "Parameter";
                    item.documentation = take.to_string();
                    completionItems.push(item);
                }
            });
        }

        // 添加局部变量
        doc.acceptLocalFromNode(currentScope, (local: any) => {
            if (local.name) {
                const item = new vscode.CompletionItem(local.name.getText(), vscode.CompletionItemKind.Variable);
                item.detail = "Local Variable";
                item.documentation = local.to_string();
                completionItems.push(item);
            }
        });
    }

    /**
     * 查找当前光标所在的结构体
     */
    private findCurrentStruct(doc: any, position: vscode.Position): any {
        let currentStruct: any = null;
        
        doc.acceptStruct((struct: any) => {
            if (this.isPositionInNode(position, struct)) {
                currentStruct = struct;
            }
        });
        
        return currentStruct;
    }

    /**
     * 查找当前光标所在的函数
     */
    private findCurrentFunction(doc: any, position: vscode.Position): any {
        let currentFunction: any = null;
        
        doc.acceptFunc((func: any) => {
            if (this.isPositionInNode(position, func)) {
                currentFunction = func;
            }
        });
        
        return currentFunction;
    }

    /**
     * 查找当前光标所在的方法
     */
    private findCurrentMethod(doc: any, position: vscode.Position): any {
        let currentMethod: any = null;
        
        doc.acceptMethod((method: any) => {
            if (this.isPositionInNode(position, method)) {
                currentMethod = method;
            }
        });
        
        return currentMethod;
    }

    /**
     * 检查位置是否在节点范围内
     */
    private isPositionInNode(position: vscode.Position, node: any): boolean {
        if (!node.start || !node.end) {
            return false;
        }
        
        const nodeStart = new vscode.Position(node.start.line, node.start.position);
        const nodeEnd = new vscode.Position(node.end.line, node.end.position);
        
        return position.isAfterOrEqual(nodeStart) && position.isBeforeOrEqual(nodeEnd);
    }

    /**
     * 判断是否是方法
     */
    private isMethod(node: any): boolean {
        // 使用新的类型检查工具，避免instanceof继承问题
        return ASTNodeTypeChecker.isAnyMethod(node);
    }

    /**
     * 判断是否是成员
     */
    private isMember(node: any): boolean {
        // 检查是否是成员变量
        return node.constructor && node.constructor.name === 'Member' ||
               (node.hasOwnProperty('type') && !node.hasOwnProperty('takes'));
    }
}

export class SpecialHoverProvider implements vscode.HoverProvider {


  
    provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
        if (!vscode.workspace.getConfiguration("jass").get<boolean>("literal")) {
            return;
        }
      const key = document.getText(document.getWordRangeAtPosition(position));
      // /(?:'(?:\da-zA-Z)+')|(?:".+")|(?:\d+)|(?:.+)/
  
      console.log(key, "hover");
      
      const fsPath = document.uri.fsPath;
      // parseContent(fsPath, document.getText());
  
      const hovers: vscode.MarkdownString[] = [];
      GlobalContext.keys.forEach(k => {
          const program = GlobalContext.get(k);
          if (program) {
            if (program.is_special) {
              const value_node = program.program;
              if (value_node) {
                value_node.children.forEach(x => {
                  
                  if (x instanceof JassDetail) {
                    if (x.match_key(key)) {
                      const ms = new vscode.MarkdownString();
                      ms.baseUri = vscode.Uri.file(x.document.filePath);
                      ms.appendMarkdown(`**>_${x.document.filePath}**`);
                      ms.appendText("\n");
                      if (x.is_deprecated) {
                        ms.appendMarkdown(`---***${x.label}***---`);
                      } else {
                        ms.appendMarkdown(`***${x.label}***`);
                      }
                      ms.appendText("\n");
                      ms.appendCodeblock(x.label);
                      x.description.forEach(desc => {
                        ms.appendMarkdown(desc);
                        ms.appendText("\n");
                      });
                    
                      hovers.push(ms);
                    }
                  }
                });
              }
            }
          }
        });
  
      return new vscode.Hover([...hovers]);
    }
  
}
