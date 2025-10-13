const test = require('node:test');
const assert = require('node:assert');
const Parser = require('tree-sitter');

// 尝试加载模块，如果失败则跳过测试
let ArkTS;
try {
  ArkTS = require('tree-sitter-arkts');
} catch (error) {
  console.log('跳过Node.js绑定测试: tree-sitter-arkts未编译');
  process.exit(0);
}

test('ArkTS语言绑定基础测试', () => {
  const parser = new Parser();
  parser.setLanguage(ArkTS);
  
  // 测试基础组件解析
  const basicCode = `
    @Component
    struct TestComponent {
      @State count: number = 0
      
      build() {
        Text('Hello')
      }
    }
  `;
  
  const tree = parser.parse(basicCode);
  const root = tree.rootNode;
  
  assert.strictEqual(root.type, 'source_file');
  assert.ok(root.childCount > 0);
  
  // 检查是否有组件声明
  const componentNode = root.children.find(child => child.type === 'component_declaration');
  assert.ok(componentNode, '应该找到组件声明节点');
});

test('装饰器解析测试', () => {
  const parser = new Parser();
  parser.setLanguage(ArkTS);
  
  const decoratorCode = `
    @Component
    struct DecoratorTest {
      @State private count: number = 0
      @Prop title: string
      @Link shared: boolean
    }
  `;
  
  const tree = parser.parse(decoratorCode);
  const root = tree.rootNode;
  
  // 查找装饰器节点
  function findNodes(node, type) {
    let nodes = [];
    if (node.type === type) {
      nodes.push(node);
    }
    for (let child of node.children) {
      nodes = nodes.concat(findNodes(child, type));
    }
    return nodes;
  }
  
  const decorators = findNodes(root, 'decorator');
  assert.ok(decorators.length >= 3, `应该找到至少3个装饰器，实际找到${decorators.length}个`);
});

test('状态管理语法测试', () => {
  const parser = new Parser();
  parser.setLanguage(ArkTS);
  
  const stateCode = `
    @Component
    struct StateTest {
      @State items: string[] = ['item1', 'item2']
      
      build() {
        Column() {
          ForEach(this.items, (item: string) => {
            Text(item)
          })
        }
      }
    }
  `;
  
  const tree = parser.parse(stateCode);
  assert.ok(!tree.rootNode.hasError(), '代码应该无语法错误');
});

test('错误恢复测试', () => {
  const parser = new Parser();
  parser.setLanguage(ArkTS);
  
  // 故意包含语法错误的代码
  const errorCode = `
    @Component
    struct ErrorTest {
      @State count: number = 0  // 缺失分号
      @Prop title: string = 'test'
      
      build() {
        Text('Hello'  // 缺失闭合括号
      }
    }
  `;
  
  const tree = parser.parse(errorCode);
  // 即使有错误，解析器也应该能够恢复并解析部分内容
  assert.ok(tree.rootNode.childCount > 0, '解析器应该能够恢复并解析部分内容');
});

test('性能基准测试', () => {
  const parser = new Parser();
  parser.setLanguage(ArkTS);
  
  // 生成较大的测试代码
  let largeCode = '';
  for (let i = 0; i < 100; i++) {
    largeCode += `
      @Component
      struct Component${i} {
        @State count${i}: number = ${i}
        @Prop title${i}: string = 'Component ${i}'
        
        build() {
          Column() {
            Text(this.title${i})
            Button('Click ${i}')
              .onClick(() => {
                this.count${i}++
              })
          }
        }
      }
    `;
  }
  
  const startTime = Date.now();
  const tree = parser.parse(largeCode);
  const endTime = Date.now();
  
  const parseTime = endTime - startTime;
  const codeSize = Buffer.byteLength(largeCode, 'utf8');
  const parseSpeed = codeSize / parseTime; // bytes/ms
  
  console.log(`解析性能: ${parseSpeed.toFixed(2)} bytes/ms (${parseTime}ms for ${codeSize} bytes)`);
  
  // 性能应该合理（至少100 bytes/ms）
  assert.ok(parseSpeed > 100, `解析速度应该 > 100 bytes/ms，实际: ${parseSpeed.toFixed(2)} bytes/ms`);
});

test('增量解析测试', () => {
  const parser = new Parser();
  parser.setLanguage(ArkTS);
  
  const originalCode = `
    @Component
    struct IncrementalTest {
      @State count: number = 0
      
      build() {
        Text('Original')
      }
    }
  `;
  
  const tree1 = parser.parse(originalCode);
  
  // 修改代码
  const modifiedCode = originalCode.replace('Original', 'Modified');
  
  const startTime = Date.now();
  const tree2 = parser.parse(modifiedCode, tree1);
  const endTime = Date.now();
  
  const incrementalTime = endTime - startTime;
  console.log(`增量解析时间: ${incrementalTime}ms`);
  
  // 增量解析应该很快（< 50ms）
  assert.ok(incrementalTime < 50, `增量解析应该 < 50ms，实际: ${incrementalTime}ms`);
  assert.ok(!tree2.rootNode.hasError(), '增量解析结果应该无错误');
});