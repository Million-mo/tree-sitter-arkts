// 复杂组件化语法测试
@Component
struct ComplexComponent {
  @State items: string[] = ['Item1', 'Item2', 'Item3'];
  @Prop title: string = 'Default Title';

  build() {
    Column() {
      Text(this.title)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin({ top: 10, bottom: 5 })
      
      Row() {
        Button('Add')
          .onClick(() => {
            this.items.push('New Item')
          })
        
        Button('Clear')
          .onClick(() => {
            this.items = []
          })
      }
      .justifyContent(FlexAlign.SpaceEvenly)
      .width('100%')
      
      List() {
        ForEach(this.items, (item: string, index: number) => {
          ListItem() {
            Text(item)
              .fontSize(16)
              .padding(10)
          }
          .backgroundColor(index % 2 === 0 ? Color.Gray : Color.White)
        }, (item: string) => item)
      }
      .layoutWeight(1)
      .width('100%')
      
      if (this.items.length === 0) {
        Text('No items available')
          .fontSize(14)
          .fontColor(Color.Gray)
      }
    }
    .width('100%')
    .height('100%')
    .padding(16)
  }
}