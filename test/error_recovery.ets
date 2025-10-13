// 语法错误恢复测试用例

// 1. 缺失分号的属性声明
@Component
struct ErrorTest1 {
  @State count: number = 0  // 缺失分号
  @Prop title: string = 'Test'
  
  build() {
    Text(this.title)
  }
}

// 2. 不完整的组件调用
@Component
struct ErrorTest2 {
  build() {
    Column() {
      Text('Hello'  // 缺失闭合括号
      Button('Click')
    }
  }
}

// 3. 装饰器拼写错误
@Compnent  // 错误的装饰器名称
struct ErrorTest3 {
  build() {
    Text('Test')
  }
}

// 4. 不完整的build方法
@Component
struct ErrorTest4 {
  build(  // 缺失闭合括号和方法体
  
  // 解析器应该在这里恢复
  onPageShow() {
    console.log('Page shown')
  }
}

// 5. 嵌套错误
@Component
struct ErrorTest5 {
  build() {
    Column() {
      if (true {  // 缺失闭合括号
        Text('True')
      }
      
      // 解析器应该能够恢复并继续解析
      Button('OK')
    }
  }
}