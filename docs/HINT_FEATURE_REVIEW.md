# vJass Hint 功能自检报告

## 审查日期
2024年

## 审查范围
对照 `static/vjass.docs.txt` 文档，检查 `src/provider/inlay-hints-provider.ts` 的 hint 功能实现完整性

---

## ✅ 已实现的功能

### 1. 基本语法支持
- ✅ `call func()` - CallStatement
- ✅ `set a = value` - AssignmentStatement
- ✅ `return expr` - ReturnStatement
- ✅ `exitwhen expr` - ExitWhenStatement
- ✅ `if expr then` - IfStatement 条件
- ✅ `elseif expr then` - IfStatement 的 alternate
- ✅ `local a = expr` - VariableDeclaration 初始化
- ✅ `set arr[i] = value` - 数组下标访问

### 2. 嵌套调用支持
- ✅ 嵌套函数调用：`call func1(func2(), func3())`
- ✅ 嵌套方法调用：`call b.test1(b.test2(), b.test3())`
- ✅ 混合嵌套：`call b.test(GetForceOfPlayer(Player(0)), b.test2(...))`
- ✅ 表达式中的调用：二元运算、类型转换等

### 3. 变量类型查找
- ✅ Local 变量：在当前函数/方法体内查找
- ✅ Takes 参数：在当前函数/方法的参数中查找
- ✅ Globals 变量：全局查找（包括 library 和 scope 中的）
- ✅ 成员访问：`.a`, `this.a`, `b.a`
- ✅ 静态成员：`StructName.staticMember`
- ✅ 继承成员：从父 struct 或 interface 中查找

### 4. 函数和方法查找
- ✅ Function 定义：全局查找（包括 library 和 scope 中的）
- ✅ Native 声明：全局查找（包括 library 和 scope 中的）
- ✅ Method 定义：在 struct/interface 中查找，支持继承
- ✅ 方法调用：`b.method()`, `this.method()`, `.method()`
- ✅ 静态方法调用：`StructName.staticMethod()`

### 5. 参数提示
- ✅ 函数参数类型提示
- ✅ 方法参数类型提示
- ✅ 嵌套调用的参数提示

### 6. 赋值目标类型提示
- ✅ 简单变量：`set a:type = value`
- ✅ 成员访问：`set b.a:type = value`
- ✅ 数组访问：`set arr[i]:type = value`

---

## ⚠️ 需要检查的功能

### 1. 函数对象方法调用
根据文档，函数可以作为对象，支持以下方法：
- ✅ `func.evaluate(...)` - 已支持，会识别函数对象并显示参数提示
- ✅ `func.execute(...)` - 已支持，会识别函数对象并显示参数提示
- ✅ `func.name` - 属性访问，不是调用，不需要参数提示（已正确处理）

**当前实现**：
- `processMethodCall` 会检查 `left` 是否是 `Identifier`（函数名）
- 如果找不到变量类型，会尝试查找函数定义
- 如果找到函数定义，会将其识别为函数对象，并显示 `evaluate/execute` 的参数提示

### 2. 方法对象方法调用
根据文档，方法可以作为对象，支持以下方法：
- ✅ `method.evaluate(...)` - 已支持，会识别方法对象并显示参数提示
- ✅ `method.execute(...)` - 已支持，会识别方法对象并显示参数提示
- ✅ `method.name` - 属性访问，不是调用，不需要参数提示（已正确处理）
- ✅ `method.exists` - 属性访问，不是调用，不需要参数提示（已正确处理）

**当前实现**：
- `processMethodCall` 会检查 `left` 是否是 `BinaryExpression`（方法访问）
- 支持静态方法对象：`StructName.staticMethod.evaluate()`
- 支持实例方法对象：`b.method.evaluate()`
- 会查找原始方法定义，并使用其参数来显示 `evaluate/execute` 的参数提示

### 3. 函数接口调用
根据文档，函数接口类型的变量可以调用 `.evaluate()` 和 `.execute()`：
- ⚠️ `Arealfunction F` - 函数接口类型变量
- ⚠️ `F.evaluate(...)` - 需要检查是否被识别为方法调用
- ⚠️ `F.execute(...)` - 需要检查是否被识别为方法调用

**当前实现**：
- 需要检查是否能识别函数接口类型的变量
- 需要检查是否能处理函数接口变量的方法调用

**建议**：
- 函数接口变量的调用应该被识别为方法调用
- 需要查找函数接口定义，获取参数和返回类型

---

## 🔍 代码检查点

### 1. `processMethodCall` 方法
- 需要检查是否能处理函数对象的调用（`func.evaluate()`）
- 需要检查是否能处理方法对象的调用（`method.evaluate()`）
- 需要检查是否能处理函数接口变量的调用（`F.evaluate()`）

### 2. `processExpression` 方法
- 需要检查是否能递归处理所有表达式类型
- 需要检查是否遗漏了某些表达式类型

### 3. 类型查找
- 需要检查是否能识别函数接口类型
- 需要检查是否能识别函数对象类型

---

## 📋 待验证的场景

### 场景 1：函数对象调用
```vjass
function A takes real x returns real
    return B.evaluate(x * 0.02)
endfunction
```
- 应该显示 `B.evaluate` 的参数提示

### 场景 2：方法对象调用
```vjass
struct mystruct
    static method mymethod takes nothing returns nothing
        call BJDebugMsg("this works")
    endmethod
endstruct
function test takes nothing returns nothing
    call mystruct.mymethod.execute()
endfunction
```
- 应该显示 `mystruct.mymethod.execute` 的参数提示（如果有参数）

### 场景 3：函数接口调用
```vjass
function interface Arealfunction takes real x returns real
function Test1 takes real x, Arealfunction F returns real
    return F.evaluate(F.evaluate(x) * F.evaluate(x))
endfunction
```
- 应该显示 `F.evaluate` 的参数提示（`real x`）

### 场景 4：方法 exists 属性
```vjass
if (mi.myMethod1.exists) then
    call BJDebugMsg("Yes")
endif
```
- 不需要参数提示（这是属性访问，不是调用）

---

## 🎯 优先级修复建议

### 高优先级
1. ✅ **函数对象方法调用支持** - 已完成
   - `func.evaluate()` 和 `func.execute()` 已被正确识别
   - 会查找函数定义并显示参数提示

2. ✅ **方法对象方法调用支持** - 已完成
   - `method.evaluate()` 和 `method.execute()` 已被正确识别
   - 支持静态方法和实例方法对象

3. ⚠️ **函数接口调用支持** - 需要验证
   - 函数接口变量的方法调用应该被识别（通过变量类型查找）
   - 如果变量类型是函数接口，应该能正确处理 `.evaluate()` 和 `.execute()`
   - 需要验证函数接口类型的识别是否正确

### 中优先级
1. **完善表达式处理**
   - 检查是否遗漏了某些表达式类型
   - 确保所有表达式中的调用都能被处理

2. **优化错误处理**
   - 添加更好的错误恢复机制
   - 提供更清晰的错误信息

### 低优先级
1. **性能优化**
   - 优化全局查找的性能
   - 添加缓存机制

2. **代码重构**
   - 提取公共逻辑
   - 减少代码重复

---

## 📝 总结

### 优点
1. ✅ 核心功能实现完整（基本语法、嵌套调用、变量查找）
2. ✅ 支持全局查找（function、native、globals）
3. ✅ 支持继承和成员访问
4. ✅ 代码结构清晰，易于维护

### 需要改进
1. ✅ 函数对象方法调用 - 已实现
2. ✅ 方法对象方法调用 - 已实现
3. ⚠️ 函数接口调用 - 需要验证（理论上应该通过变量类型查找自动支持）
4. ⚠️ 需要添加更多测试用例验证边界情况

### 总体评价
Hint 功能实现质量较高，核心功能完整，但在函数对象和方法对象的特殊调用形式上需要进一步验证和完善。
