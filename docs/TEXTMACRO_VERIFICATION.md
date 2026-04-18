# TextMacro 系统验证清单

## ✅ 已完成的组件

### 1. TextMacroRegistry（单例）✅
- [x] 单例模式实现
- [x] 宏注册和查找功能
- [x] 按文件管理宏
- [x] 统计信息功能
- [x] 文件路径：`src/vjass/text-macro-registry.ts`

### 2. TextMacroCollector（收集器）✅
- [x] 从文件内容提取 textmacro
- [x] 语法验证
- [x] 参数验证
- [x] 自动注册到注册表
- [x] 文件路径：`src/vjass/text-macro-collector.ts`

### 3. TextMacroExpander（展开器）✅
- [x] 宏展开功能
- [x] 参数替换（$PARAM$）
- [x] 可选宏支持
- [x] 错误处理
- [x] 文件路径：`src/vjass/text-macro-expander.ts`

### 4. DataEnterManager 集成✅
- [x] 两阶段解析流程
- [x] 收集阶段实现
- [x] 文件更新时更新注册表
- [x] 文件删除时移除注册表
- [x] 文件重命名时更新路径
- [x] 文件路径：`src/provider/data-enter-manager.ts`

### 5. Parser 集成✅
- [x] 构造函数支持 TextMacroExpander
- [x] parseRunTextMacro 展开宏
- [x] 展开后的代码解析
- [x] 错误合并
- [x] 文件路径：`src/vjass/parser.ts`

### 6. AST 节点✅
- [x] TextMacroStatement 类
- [x] RunTextMacroStatement 类
- [x] 导出到 ast.ts
- [x] 文件路径：`src/vjass/ast.ts`

### 7. 词法解析器✅
- [x] 识别 //! 为 TextMacroDirective
- [x] 文件路径：`src/vjass/lexer.ts`

## 🔍 验证要点

### 位置正确性验证

1. **导入路径检查** ✅
   - DataEnterManager 正确导入所有 TextMacro 组件
   - Parser 正确导入 TextMacroExpander
   - 所有组件之间的依赖关系正确

2. **初始化顺序** ✅
   - DataEnterManager 构造函数中初始化 TextMacro 组件
   - 两阶段解析顺序正确

3. **文件扫描范围** ✅
   - 收集阶段扫描：标准库、static目录、工作区目录
   - 解析阶段处理：标准库、static目录、工作区文件

### 功能验证

1. **多文件 textmacro** ✅
   - 注册表支持多文件
   - 文件更新时正确更新注册表
   - 文件删除时正确移除

2. **runtextmacro 展开** ✅
   - 解析时自动展开
   - 参数替换正确
   - 可选宏处理正确

3. **错误处理** ✅
   - 宏不存在错误
   - 参数不匹配错误
   - 语法错误

## 🐛 调试建议

### 调试输出

在以下位置添加 console.log 进行调试：

1. **TextMacroRegistry.register()**: 输出注册的宏信息
2. **TextMacroCollector.collectFromFile()**: 输出收集到的宏
3. **TextMacroExpander.expand()**: 输出展开前后的代码
4. **Parser.parseRunTextMacro()**: 输出展开过程

### 常见问题排查

1. **宏找不到**
   - 检查是否在收集阶段正确注册
   - 检查宏名称大小写
   - 检查文件是否被正确扫描

2. **参数替换不正确**
   - 检查参数数量是否匹配
   - 检查宏体中的参数名格式（$PARAM$）

3. **展开后的代码解析错误**
   - 检查展开后的代码语法
   - 检查位置信息是否正确

## 📝 测试用例

参考 `src/vjass/text-macro-test.ts` 中的测试用例。

## 🚀 下一步

1. 在实际项目中测试
2. 验证多文件场景
3. 验证文件更新场景
4. 优化性能（如果需要）

