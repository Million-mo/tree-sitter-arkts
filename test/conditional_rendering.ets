// ForEach和条件渲染测试用例

@Component
struct ConditionalRenderingTest {
  @State numbers: number[] = [1, 2, 3, 4, 5];
  @State showDetails: boolean = false;
  @State selectedIndex: number = -1;

  build() {
    Column() {
      Text('Conditional Rendering Test')
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .margin({ bottom: 20 })

      Button('Toggle Details')
        .onClick(() => {
          this.showDetails = !this.showDetails
        })
        .margin({ bottom: 10 })

      if (this.showDetails) {
        Text('Details are now visible')
          .fontSize(14)
          .fontColor(Color.Blue)
          .margin({ bottom: 10 })
      }

      Text('Number List:')
        .fontSize(16)
        .margin({ bottom: 10 })

      List() {
        ForEach(this.numbers, (num: number, index: number) => {
          ListItem() {
            Row() {
              Text(`Number: ${num}`)
                .fontSize(14)
                .flexGrow(1)
              
              if (index === this.selectedIndex) {
                Text('Selected')
                  .fontSize(12)
                  .fontColor(Color.Red)
              }
              
              Button('Select')
                .fontSize(12)
                .onClick(() => {
                  this.selectedIndex = index
                })
            }
            .width('100%')
            .padding(8)
            .backgroundColor(index === this.selectedIndex ? Color.Yellow : Color.White)
            .borderRadius(4)
          }
        }, (num: number, index: number) => `${index}_${num}`)
      }
      .width('100%')
      .layoutWeight(1)

      if (this.selectedIndex >= 0) {
        Text(`Selected number: ${this.numbers[this.selectedIndex]}`)
          .fontSize(14)
          .fontColor(Color.Green)
          .margin({ top: 10 })
      }
    }
    .width('100%')
    .height('100%')
    .padding(16)
  }
}