// 装饰器基础测试用例

@Component
struct DecoratorsBasicTest {
  @State counter: number = 0;
  @Prop title: string = 'Default Title';
  @Link shared: boolean;

  @Builder
  customButton(text: string) {
    Button(text)
      .backgroundColor(Color.Blue)
      .fontColor(Color.White)
  }

  @Styles
  cardStyle() {
    .backgroundColor(Color.White)
    .borderRadius(8)
    .padding(16)
    .margin(8)
  }

  build() {
    Column() {
      Text(this.title)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
      
      this.customButton('Custom Button')
        .onClick(() => {
          this.counter++
        })

      Text(`Counter: ${this.counter}`)
        .cardStyle()
      
      if (this.shared) {
        Text('Shared state is true')
          .fontSize(14)
          .fontColor(Color.Green)
      }
    }
    .width('100%')
    .height('100%')
    .cardStyle()
  }
}