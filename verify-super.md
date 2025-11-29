# Super 语句实现验证

## 文档要求（vjass.docs.txt 第1736-1770行）

### 语法
- `call super.xx()` - 在子结构的方法中调用父方法
- super 关键字后必须跟着 `.methodName()`

### 文档示例
```jass
struct Parent
stub method xx takes nothing returns nothing
call BJDebugMsg("Parent")
endmethod
endstruct
struct ChildA extends Parent
method xx takes nothing returns nothing
call BJDebugMsg("- Child A -")
call super.xx()
endmethod
endstruct
```

## 实现检查

### ✅ 已实现的功能
1. ✅ SuperExpression 类已添加
2. ✅ parsePrimaryExpression 中支持 super 关键字
3. ✅ 支持 `super.methodName()` 调用语法
4. ✅ 在 Identifier 分支之前检查 super（避免冲突）
5. ✅ parseCallExpressionWithCallee 支持 Expression 类型（包括 BinaryExpression）

### 测试结果
所有 5 个测试用例通过：
- ✅ 基本 super 调用（文档示例）
- ✅ super 调用带参数的方法
- ✅ super 调用返回值的父方法
- ✅ 多层继承中的 super 调用
- ✅ super 在静态方法中（解析测试）

## 结论
Super 语句的实现符合 vJASS 文档要求，所有功能已实现并通过测试。

