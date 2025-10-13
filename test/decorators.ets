// 装饰器测试用例
@Component
struct DecoratorTest {
  @State private counter: number = 0
  @Prop public title: string
  @Link shared: boolean

  @Builder
  customBuilder() {
    Text('Custom')
  }

  @Styles  
  customStyles() {
    .width(100)
    .height(50)
  }

  build() {
    Row() {
      this.customBuilder()
    }
    .customStyles()
  }
}