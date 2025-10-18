# ArkTS Tree-sitter 解析器

这是一个为华为ArkTS语言开发的Tree-sitter语法解析器，支持ArkTS语言的完整语法特性，包括装饰器、组件化语法、状态管理等核心特性。

## 🎯 解析能力持续提升

我们的 ArkTS 解析器在真实项目中的表现持续改进！在 [hmosworld](https://gitee.com/hamosapience/hmosworld) 大型生产项目的验证中，**解析成功率从最初的 30% 跃升至最新的 61.71%**（175个文件中108个成功解析），实现了翻倍提升！

### 近期重大突破

**v0.1.5 版本更新**（2025-10-18）：
- ✅ **完整泛型支持**：支持泛型类、函数、接口及复杂类型参数
- ✅ **装饰器函数扩展**：支持 `@Builder`、`@Styles`、`@Extend` 装饰器函数及导出声明
- ✅ **控制流完善**：支持 `try/catch/finally`、`for/while/break/continue` 等控制流语句
- ✅ **枚举声明**：完整支持 `enum` 声明及其导出语法
- ✅ **高级表达式**：支持函数表达式、箭头函数、nullish合并操作符(`??`)、可选链(`?.`)
- ✅ **ASI兼容性优化**：完善自动分号插入(ASI)机制，提升错误恢复能力
- ✅ **布局容器扩展**：支持 `GridRow`、`GridCol` 等响应式布局组件

这一进步充分证明了本项目在处理实际代码复杂性方面的不断进化，已经能够支持大部分生产环境中的 ArkTS 代码。

## 特性支持

### ✅ 已实现特性

**核心语法**
- ✅ 完整 TypeScript 语法兼容
- ✅ 装饰器语法（`@Component`、`@State`、`@Prop`、`@Link`、`@Builder`、`@Styles`、`@Extend` 等）
- ✅ struct 组件定义与方法
- ✅ `build()` 方法和 UI 描述语法
- ✅ 泛型支持（类、函数、接口、类型参数）
- ✅ 枚举声明（`enum`）

**类型系统**
- ✅ 接口和类型定义
- ✅ 类型注解与函数类型
- ✅ 类型断言（`as`）
- ✅ 对象类型（支持逗号/分号分隔符）

**表达式与操作符**
- ✅ 箭头函数与函数表达式
- ✅ 异步表达式（`await`）
- ✅ Nullish 合并操作符（`??`）
- ✅ 可选链操作符（`?.`）
- ✅ 修饰符链表达式（`.modifier()`）

**控制流**
- ✅ `try/catch/finally/throw` 异常处理
- ✅ `for/while/do-while` 循环
- ✅ `break/continue` 控制语句
- ✅ `if/else` 条件分支

**UI 组件**
- ✅ 基础组件（`Text`、`Button`、`Image` 等）
- ✅ 容器组件（`Column`、`Row`、`Stack`、`Flex` 等）
- ✅ 响应式布局（`GridRow`、`GridCol`）
- ✅ `ForEach` 循环渲染
- ✅ 条件渲染

**模块系统**
- ✅ 导入/导出声明
- ✅ 装饰器函数导出（`export @Builder function`）
- ✅ 默认导出（`export default interface/type/enum`）

### 🚧 开发中特性
- 更多 UI 组件变体支持
- 性能优化与增量解析
- 语法高亮查询优化

### 📋 计划实现特性
- 完整的语言服务器协议（LSP）集成
- 更多语言绑定（C#、Java）
- 代码格式化支持

## 安装使用

### Node.js

```bash
npm install tree-sitter-arkts-open
```

```javascript
const Parser = require('tree-sitter');
const ArkTS = require('tree-sitter-arkts');

const parser = new Parser();
parser.setLanguage(ArkTS);

const sourceCode = `
@Component
struct HelloWorld {
  @State message: string = 'Hello'
  
  build() {
    Text(this.message)
  }
}
`;

const tree = parser.parse(sourceCode);
console.log(tree.rootNode.toString());
```

### Python

```bash
pip install tree-sitter-arkts-open
```

```python
import tree_sitter_arkts as arkts
from tree_sitter import Language, Parser

ARKTS_LANGUAGE = Language(arkts.language())
parser = Parser(ARKTS_LANGUAGE)

source_code = '''
@Component  
struct MyComponent {
  build() {
    Text('Hello ArkTS')
  }
}
'''

tree = parser.parse(bytes(source_code, 'utf8'))
print(tree.root_node)
```

## 语法支持示例

### 组件定义
```arkts
@Component
struct MyComponent {
  @State count: number = 0;
  @Prop title: string = 'Default';
  
  build() {
    Column() {
      Text(this.title)
      Button('Click')
        .onClick(() => {
          this.count++
        })
    }
  }
}
```

### 状态管理
```arkts
@Component
struct StateExample {
  @State private items: string[] = [];
  @Link shared: boolean;
  
  build() {
    List() {
      ForEach(this.items, (item: string) => {
        ListItem() {
          Text(item)
        }
      })
    }
  }
}
```

## 开发

### 构建解析器
```bash
tree-sitter generate
```

### 测试
```bash
tree-sitter test
```

### 解析文件
```bash
tree-sitter parse example.ets
```

## 语言绑定

本解析器支持多种编程语言绑定：

- **Node.js**: `bindings/node/`
- **Python**: `bindings/python/`
- **Rust**: `bindings/rust/`
- **Go**: `bindings/go/`
- **Swift**: `bindings/swift/`

## 贡献

欢迎提交Issues和Pull Requests！

### 开发环境
- Tree-sitter CLI 0.25.3+
- Node.js 18+
- 支持的构建工具链

### 测试用例
测试用例位于 `test/` 目录，包含：
- 基础组件语法测试
- 装饰器语法测试  
- 状态管理语法测试
- 错误恢复测试

## 许可证

MIT License

## 相关链接

- [ArkTS官方文档](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-get-started-0000001504769321-V3)
- [Tree-sitter官网](https://tree-sitter.github.io/)
- [项目仓库](https://github.com/million-mo/arkts_language_server)