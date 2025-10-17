# ASI (自动分号插入) 兼容性说明

## 问题背景

在使用 tree-sitter-arkts 解析器时，你可能会遇到以下情况：

```typescript
// 情况 1：有分号（标准写法）
const obj = { a: 1, b: 2 };
doSomething();

// 情况 2：无分号（真实代码中常见）
const obj = { a: 1, b: 2 }
doSomething()
```

**问题**：tree-sitter 解析器对"情况 2"会报 `MISSING ";"` 错误，但 ArkTS 编译器能正常编译。

## 为什么会出现这种差异？

### Tree-sitter 解析器
- **定位**：语法分析工具，用于代码高亮、代码格式化、AST 分析等
- **策略**：严格遵循 TypeScript 语法规范
- **行为**：缺少分号 → 产生 ERROR 节点

### ArkTS 编译器
- **定位**：代码编译器，将代码编译成可执行程序
- **策略**：支持 ASI (Automatic Semicolon Insertion)
- **行为**：缺少分号 → 自动插入分号 → 编译成功

## 解决方案

### ✅ 推荐：使用验证工具的 ASI 兼容模式（默认）

本项目提供的 `validate_simple.js` 工具已经实现了智能验证：

```bash
# ASI 兼容模式（默认，与编译器行为一致）
node validate_simple.js ./examples

# 严格模式（分号必须）
node validate_simple.js ./examples --strict
```

**验证逻辑**：
```
没有 ERROR                  → ✅ 通过
只有 MISSING ";" 错误       → ✅ 通过（ASI 兼容）
其他 ERROR                  → ❌ 失败
```

### 验证模式对比

| 模式 | 有分号 | 无分号 | 其他错误 | 适用场景 |
|------|-------|-------|----------|---------|
| **ASI 兼容**（默认） | ✅ | ✅ | ❌ | 真实项目验证 |
| **严格模式** | ✅ | ❌ | ❌ | 代码规范检查 |

## 代码规范建议

虽然 ArkTS 编译器支持省略分号，但**强烈建议始终添加分号**：

### ✅ 推荐写法
```typescript
const wantAgentInfo: wantAgent.WantAgentInfo = {
  wants: [...],
  operationType: wantAgent.OperationType.START_ABILITIES,
  requestCode: 0
};  // ← 必须有分号

wantAgent.getWantAgent(wantAgentInfo).then((agent) => {
  this.session?.setLaunchAbility(agent);
});
```

### ❌ 避免写法
```typescript
const wantAgentInfo: wantAgent.WantAgentInfo = {
  wants: [...],
  operationType: wantAgent.OperationType.START_ABILITIES,
  requestCode: 0
}  // ← 缺少分号

wantAgent.getWantAgent(wantAgentInfo).then((agent) => {
  this.session?.setLaunchAbility(agent);
})
```

### 为什么要加分号？

1. **代码规范性** - 符合 TypeScript/JavaScript 最佳实践
2. **避免歧义** - 某些边界情况 ASI 可能产生意外行为
3. **工具兼容性** - 保证 linter、formatter、tree-sitter 等工具正常工作
4. **团队协作** - 统一代码风格，提高可读性

## ASI 陷阱示例

虽然 ASI 大部分时候能正常工作，但也有陷阱：

```typescript
// 陷阱 1：return 语句
function getData() {
  return    // ← ASI 在这里插入分号！
  {
    name: 'test'
  }
}
// 返回值是 undefined，而不是对象！

// 正确写法
function getData() {
  return {
    name: 'test'
  }
}

// 陷阱 2：数组访问
const a = b
[0].toString()
// 可能被解析为：b[0].toString()

// 正确写法
const a = b;
[0].toString();
```

## 总结

| 层面 | 是否报错 | 建议 |
|------|---------|------|
| **编译** | ✅ 不报错（ASI） | 能编译不代表规范 |
| **验证（默认）** | ✅ 不报错 | 与编译器一致 |
| **验证（严格）** | ❌ 报错 | 强制规范 |
| **最佳实践** | - | **始终加分号** |

## 相关文件

- 验证工具：[`validate_simple.js`](./validate_simple.js)
- 语法定义：[`grammar.js`](./grammar.js)
- 测试用例：[`test/test_grammar_4.ets`](./test/test_grammar_4.ets)
