// UI语句边界测试
@Component
struct UIStatementTest {
  build() {
    // 完整的组件语句 - 包含组件调用和所有修饰符
    Text('Hello World')
      .fontSize(24)
      .fontWeight(FontWeight.Bold)
      .margin({ top: 10 })
    
    // 完整的布局语句 - 包含布局容器、子组件和修饰符
    Column() {
      Text('Title')
        .fontSize(20)
      Button('Click Me')
        .onClick(() => {
          console.log('clicked')
        })
    }
    .width('100%')
    .padding(16)
    
    // UI条件语句
    if (true) {
      Text('Conditional Text')
        .fontSize(16)
    }
  }
}