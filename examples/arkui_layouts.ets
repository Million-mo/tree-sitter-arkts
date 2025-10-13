// ArkUI布局组件测试用例
// 测试各种布局容器的声明式语法

@Component
struct LayoutTest {
  @State items: string[] = ['Item 1', 'Item 2', 'Item 3'];
  @State selectedIndex: number = 0;

  build() {
    Column({ space: 10 }) {
      // 标题栏
      Text('布局测试')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .textAlign(TextAlign.Center)
        .width('100%')
        .margin({ bottom: 20 })

      // Row布局测试
      Row({ space: 8 }) {
        Button('按钮1')
          .flexGrow(1)
          .backgroundColor(Color.Blue)
        Button('按钮2')
          .flexGrow(1)  
          .backgroundColor(Color.Green)
        Button('按钮3')
          .flexGrow(1)
          .backgroundColor(Color.Red)
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceEvenly)

      // Stack布局测试
      Stack({ alignContent: Alignment.BottomEnd }) {
        Image($r('app.media.background'))
          .width(200)
          .height(150)
          .borderRadius(10)

        Text('叠加文本')
          .fontSize(14)
          .fontColor(Color.White)
          .backgroundColor(Color.Black)
          .padding(8)
          .borderRadius(4)
          .margin({ right: 10, bottom: 10 })
      }
      .width(200)
      .height(150)

      // Flex布局测试
      Flex({ 
        direction: FlexDirection.Row, 
        wrap: FlexWrap.Wrap,
        justifyContent: FlexAlign.SpaceBetween,
        alignItems: ItemAlign.Center
      }) {
        ForEach(this.items, (item: string, index: number) => {
          Text(`${item}`)
            .fontSize(12)
            .padding(8)
            .backgroundColor(index === this.selectedIndex ? Color.Orange : Color.Gray)
            .borderRadius(4)
            .onClick(() => {
              this.selectedIndex = index
            })
        }, (item: string) => item)
      }
      .width('100%')
      .height(60)

      // Grid布局测试
      Grid() {
        ForEach([1, 2, 3, 4, 5, 6], (num: number) => {
          GridItem() {
            Text(`${num}`)
              .fontSize(16)
              .textAlign(TextAlign.Center)
              .width('100%')
              .height(50)
              .backgroundColor(Color.Pink)
              .borderRadius(8)
          }
        }, (num: number) => num.toString())
      }
      .columnsTemplate('1fr 1fr 1fr')
      .rowsTemplate('1fr 1fr')
      .rowsGap(10)
      .columnsGap(10)
      .width('100%')
      .height(120)

      // List布局测试
      List({ space: 5 }) {
        ForEach(this.items, (item: string, index: number) => {
          ListItem() {
            Row() {
              Text(`${index + 1}. ${item}`)
                .fontSize(16)
                .flexGrow(1)
              
              Button('删除')
                .fontSize(12)
                .backgroundColor(Color.Red)
                .onClick(() => {
                  this.items.splice(index, 1)
                })
            }
            .width('100%')
            .padding(10)
            .backgroundColor(Color.White)
            .borderRadius(8)
          }
        }, (item: string, index: number) => `${index}_${item}`)
      }
      .width('100%')
      .layoutWeight(1)
      .backgroundColor(Color.Gray)
      .borderRadius(10)
      .padding(10)
    }
    .width('100%')
    .height('100%')
    .padding(16)
    .backgroundColor('#F5F5F5')
  }
}