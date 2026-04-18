import * as vscode from 'vscode';
import { DataEnterManager } from './data-enter-manager';
import { ZincBlockHelper } from './zinc-block-parser';

/**
 * 仅负责「JASS/vJass 关键字 → 文档 Webview」的转到定义，与普通符号跳转解耦。
 * 由配置 `jass.keywordDefinition` 控制是否注册；默认关闭。
 */
export class KeywordDefinitionProvider implements vscode.DefinitionProvider {
    constructor(private readonly dataEnterManager: DataEnterManager) {}

    private getKeywordDocName(symbolName: string): string | null {
        const keyword = symbolName.toLowerCase();
        const docMap: Record<string, string> = {
            function: 'function.html',
            endfunction: 'endfunction.html',
            constant: 'constant.html',
            native: 'native.html',
            local: 'local.html',
            type: 'type.html',
            set: 'set.html',
            call: 'call.html',
            takes: 'takes.html',
            returns: 'returns.html',
            extends: 'extends.html',
            array: 'array.html',
            if: 'if.html',
            else: 'else.html',
            elseif: 'elseif.html',
            endif: 'endif.html',
            then: 'then.html',
            loop: 'loop.html',
            endloop: 'endloop.html',
            exitwhen: 'exitwhen.html',
            return: 'return.html',
            and: 'and.html',
            or: 'or.html',
            not: 'not.html',
            globals: 'globals.html',
            endglobals: 'endglobals.html',
            library: 'library.html',
            initializer: 'initializer.html',
            needs: 'needs.html',
            uses: 'uses.html',
            requires: 'requires.html',
            endlibrary: 'endlibrary.html',
            scope: 'scope.html',
            endscope: 'endscope.html',
            private: 'private.html',
            public: 'public.html',
            static: 'static.html',
            interface: 'interface.html',
            endinterface: 'endinterface.html',
            implement: 'implement.html',
            struct: 'struct.html',
            endstruct: 'endstruct.html',
            method: 'method.html',
            endmethod: 'endmethod.html',
            delegate: 'delegate.html',
            operator: 'operator.html',
            debug: 'debug.html',
            module: 'module.html',
            endmodule: 'endmodule.html',
            optional: 'optional.html',
            stub: 'stub.html',
            key: 'key.html',
            thistype: 'thistype.html',
            oninit: 'oninit.html',
            ondestroy: 'ondestroy.html',
            hook: 'hook.html',
            defaults: 'defaults.html',
            execute: 'execute.html',
            create: 'create.html',
            destroy: 'destroy.html',
            size: 'size.html',
            name: 'name.html',
            allocate: 'allocate.html',
            deallocate: 'deallocate.html'
        };
        return docMap[keyword] || null;
    }

    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken
    ): Promise<vscode.Definition | vscode.LocationLink[] | null | undefined> {
        const enabled = vscode.workspace.getConfiguration('jass').get<boolean>('keywordDefinition', false);
        if (!enabled) {
            return null;
        }

        // //! zinc 块内语法与 JASS 关键字文档不完全对应，避免抢普通符号跳转
        const zincBlockInfo = ZincBlockHelper.findZincBlock(document, position, this.dataEnterManager);
        if (zincBlockInfo?.program) {
            return null;
        }

        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return null;
        }

        const symbolName = document.getText(wordRange);
        if (!symbolName) {
            return null;
        }

        const keywordDocName = this.getKeywordDocName(symbolName);
        if (!keywordDocName) {
            return null;
        }

        await vscode.commands.executeCommand('jass.openKeywordDocWebview', keywordDocName);
        return null;
    }
}
