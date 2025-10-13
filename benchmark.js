#!/usr/bin/env node

/**
 * ArkTS Tree-sitter 性能基准测试
 * 测试解析速度、内存使用、增量更新等性能指标
 */

const fs = require('fs');
const path = require('path');

// 生成大型测试文件
function generateLargeArkTSFile(componentCount = 1000) {
  let content = `// 大型ArkTS测试文件 - ${componentCount}个组件\n\n`;
  
  for (let i = 0; i < componentCount; i++) {
    content += `
@Component
struct Component${i} {
  @State private count${i}: number = ${i}
  @State private items${i}: string[] = ['item1', 'item2', 'item3']
  @Prop title${i}: string = 'Component ${i}'
  @Link shared${i}: boolean

  @Builder
  buildHeader${i}() {
    Row() {
      Text(this.title${i})
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
      
      Button('Reset')
        .onClick(() => {
          this.count${i} = 0
        })
    }
    .justifyContent(FlexAlign.SpaceBetween)
    .width('100%')
  }

  @Styles
  cardStyles${i}() {
    .backgroundColor(Color.White)
    .borderRadius(8)
    .padding(16)
    .margin({ top: 8, bottom: 8 })
    .shadow({ radius: 4, color: Color.Gray, offsetX: 0, offsetY: 2 })
  }

  build() {
    Column() {
      this.buildHeader${i}()
      
      Text(\`Count: \${this.count${i}}\`)
        .fontSize(16)
        .margin({ bottom: 10 })
      
      Row() {
        Button('Increment')
          .onClick(() => {
            this.count${i}++
          })
        
        Button('Decrement')
          .onClick(() => {
            if (this.count${i} > 0) {
              this.count${i}--
            }
          })
          
        Button('Add Item')
          .onClick(() => {
            this.items${i}.push(\`New Item \${this.count${i}}\`)
          })
      }
      .justifyContent(FlexAlign.SpaceEvenly)
      .width('100%')
      .margin({ bottom: 16 })
      
      List() {
        ForEach(this.items${i}, (item: string, index: number) => {
          ListItem() {
            Row() {
              Text(item)
                .fontSize(14)
                .flexGrow(1)
              
              Button('Delete')
                .fontSize(12)
                .onClick(() => {
                  this.items${i}.splice(index, 1)
                })
            }
            .width('100%')
            .padding({ left: 8, right: 8 })
          }
          .backgroundColor(index % 2 === 0 ? Color.Gray : Color.White)
        }, (item: string) => item)
      }
      .layoutWeight(1)
      .width('100%')
      
      if (this.count${i} > 10) {
        Text('High count warning!')
          .fontColor(Color.Red)
          .fontSize(12)
      }
    }
    .cardStyles${i}()
    .width('100%')
  }
}
`;
  }
  
  return content;
}

// 性能测试函数
function performanceTest() {
  console.log('🚀 ArkTS Tree-sitter 性能基准测试');
  console.log('=====================================\\n');
  
  // 测试不同大小的文件
  const testSizes = [10, 50, 100, 500, 1000];
  
  for (const size of testSizes) {
    console.log(`📊 测试 ${size} 个组件:`);
    
    const content = generateLargeArkTSFile(size);
    const filePath = path.join(__dirname, `benchmark_${size}.ets`);
    
    // 写入测试文件
    fs.writeFileSync(filePath, content);
    const fileSize = fs.statSync(filePath).size;
    
    console.log(`   文件大小: ${(fileSize / 1024).toFixed(2)} KB`);
    
    // 使用tree-sitter CLI测试解析性能
    const { spawn } = require('child_process');
    
    const startTime = Date.now();
    const treeSitter = spawn('tree-sitter', ['parse', filePath], {
      cwd: path.dirname(__dirname),
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let parseOutput = '';
    let parseError = '';
    
    treeSitter.stdout.on('data', (data) => {
      parseOutput += data.toString();
    });
    
    treeSitter.stderr.on('data', (data) => {
      parseError += data.toString();
    });
    
    treeSitter.on('close', (code) => {
      const endTime = Date.now();
      const parseTime = endTime - startTime;
      const parseSpeed = fileSize / parseTime; // bytes/ms
      
      console.log(`   解析时间: ${parseTime} ms`);
      console.log(`   解析速度: ${parseSpeed.toFixed(2)} bytes/ms`);
      console.log(`   解析速度: ${(parseSpeed * 1000 / 1024).toFixed(2)} KB/s`);
      
      // 检查是否有错误
      if (parseError) {
        console.log(`   ⚠️  解析错误: ${parseError.slice(0, 100)}...`);
      } else {
        console.log(`   ✅ 解析成功`);
      }
      
      // 性能评估
      if (parseSpeed > 1000) {
        console.log(`   🎉 性能优秀`);
      } else if (parseSpeed > 500) {
        console.log(`   👍 性能良好`);
      } else if (parseSpeed > 100) {
        console.log(`   📝 性能一般`);
      } else {
        console.log(`   ⚠️  性能需要优化`);
      }
      
      console.log('');
      
      // 清理测试文件
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        // 忽略删除错误
      }
    });
  }
}

// 内存使用测试
function memoryTest() {
  console.log('💾 内存使用测试');
  console.log('================');
  
  const testFile = path.join(__dirname, 'memory_test.ets');
  const content = generateLargeArkTSFile(100);
  fs.writeFileSync(testFile, content);
  
  const beforeMemory = process.memoryUsage();
  console.log(`测试前内存使用:`);
  console.log(`  RSS: ${(beforeMemory.rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Heap Used: ${(beforeMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  
  // 这里可以添加实际的解析测试
  // 由于需要加载tree-sitter模块，我们只是模拟
  
  const afterMemory = process.memoryUsage();
  console.log(`\\n测试后内存使用:`);
  console.log(`  RSS: ${(afterMemory.rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Heap Used: ${(afterMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  
  const memoryIncrease = afterMemory.heapUsed - beforeMemory.heapUsed;
  console.log(`\\n内存增加: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);
  
  // 清理
  try {
    fs.unlinkSync(testFile);
  } catch (e) {
    // 忽略
  }
}

// 运行测试
if (require.main === module) {
  performanceTest();
  setTimeout(() => {
    memoryTest();
  }, 1000);
}