// 简化的ArkUI基础测试用例
// 专门测试当前tree-sitter-arkts支持的语法特性

@Component
struct BasicArkUITest {
  @State count: number = 0;
  @State message: string = 'Hello ArkUI';
  @Prop title: string = 'Test';

  build() {
    Column() {
      Text(this.title)
        .fontSize(20)
        .fontColor(Color.Blue)
      
      Text(this.message)
        .fontSize(16)
      
      Button('Click Me')
        .onClick(() => {
          this.count++
        })
      
      Text(`Count: ${this.count}`)
        .fontSize(14)
        .fontColor(Color.Red)
      
      if (this.count > 0) {
        Text('Counter is greater than 0')
          .fontSize(12)
      }
    }
    .width('100%')
    .height('100%')
    .padding(20)
  }
}