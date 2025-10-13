// 布局容器测试用例

@Component  
struct LayoutContainersTest {
  @State items: string[] = ['Item1', 'Item2', 'Item3']

  build() {
    Column() {
      // Row布局测试
      Row() {
        Button('Button1')
          .backgroundColor(Color.Blue)
        Button('Button2') 
          .backgroundColor(Color.Green)
        Button('Button3')
          .backgroundColor(Color.Red)
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceEvenly)
      
      // Stack布局测试
      Stack() {
        Text('Background')
          .fontSize(20)
          .fontColor(Color.Gray)
        Text('Foreground')
          .fontSize(16)
          .fontColor(Color.Black)
      }
      .width(200)
      .height(100)
      
      // Flex布局测试
      Flex() {
        Text('Flex Item 1')
          .flexGrow(1)
        Text('Flex Item 2')
          .flexGrow(2)
      }
      .width('100%')
      .height(50)
      
      // Grid布局测试
      Grid() {
        GridItem() {
          Text('Grid 1')
        }
        GridItem() {
          Text('Grid 2')
        }
        GridItem() {
          Text('Grid 3')
        }
        GridItem() {
          Text('Grid 4')
        }
      }
      .columnsTemplate('1fr 1fr')
      .rowsTemplate('1fr 1fr')
      .width('100%')
      .height(120)
      
      // List布局测试
      List() {
        ForEach(this.items, (item: string) => {
          ListItem() {
            Text(item)
              .padding(10)
          }
        }, (item: string) => item)
      }
      .width('100%')
      .layoutWeight(1)
    }
    .width('100%')
    .height('100%')
    .padding(16)
  }
}