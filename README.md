# ArkTS Tree-sitter 解析器

这是一个为华为ArkTS语言开发的Tree-sitter语法解析器，支持ArkTS语言的完整语法特性，包括装饰器、组件化语法、状态管理等核心特性。

## 🎯 解析能力持续提升

我们的 ArkTS 解析器在真实项目中的表现持续改进！在 [hmosworld](https://gitee.com/hamosapience/hmosworld) 大型生产项目的验证中，**解析成功率从 30% 显著提升至 46.29%**（175个文件，81个成功解析）。这一进步得益于对**自动分号插入(ASI)机制**的完善支持和**错误恢复能力**的增强，充分证明了本项目在处理实际代码复杂性方面的不断进化。

## 特性支持

### ✅ 已实现特性
- 基础TypeScript语法兼容
- 装饰器语法（@Component、@State、@Prop、@Link等）
- struct组件定义
- build()方法和UI描述语法
- 导入/导出声明
- 接口和类型定义
- 基础表达式和语句

### 🚧 开发中特性
- 完整的UI组件调用语法
- ForEach循环语法
- 条件渲染语法
- 高级装饰器支持（@Builder、@Styles等）
- 错误恢复机制优化

### 📋 计划实现特性
- 模块系统扩展
- 泛型语法完整支持
- 性能优化
- 更多语言绑定

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