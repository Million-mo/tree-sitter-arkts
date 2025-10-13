// ArkUI自定义组件和Builder测试用例
// 测试@Builder、@Styles、@Extend装饰器的各种用法

// 全局Builder函数
@Builder
function GlobalHeaderBuilder(title: string, subtitle: string) {
  Column() {
    Text(title)
      .fontSize(24)
      .fontWeight(FontWeight.Bold)
      .fontColor(Color.White)
      .textAlign(TextAlign.Center)
    
    if (subtitle) {
      Text(subtitle)
        .fontSize(14)
        .fontColor(Color.Gray)
        .textAlign(TextAlign.Center)
        .margin({ top: 5 })
    }
  }
  .width('100%')
  .padding(20)
  .backgroundColor(Color.Blue)
}

// 全局Styles函数
@Styles
function cardStyles() {
  .backgroundColor(Color.White)
  .borderRadius(12)
  .padding(16)
  .margin(8)
  .shadow({ 
    radius: 8, 
    color: '#20000000', 
    offsetX: 0, 
    offsetY: 2 
  })
}

@Styles
function buttonStyles() {
  .width(120)
  .height(40)
  .borderRadius(20)
  .fontColor(Color.White)
  .fontSize(14)
  .fontWeight(FontWeight.Bold)
}

// 全局Extend函数
@Extend(Text)
function fancyText(size: number, color: ResourceColor, weight: FontWeight) {
  .fontSize(size)
  .fontColor(color)
  .fontWeight(weight)
  .textAlign(TextAlign.Center)
  .padding(8)
  .borderRadius(4)
}

@Extend(Button)
function gradientButton(startColor: ResourceColor, endColor: ResourceColor) {
  .width(150)
  .height(45)
  .borderRadius(22)
  .fontColor(Color.White)
  .linearGradient({
    direction: GradientDirection.Right,
    colors: [[startColor, 0.0], [endColor, 1.0]]
  })
}

// 主组件
@Component
struct CustomBuilderTest {
  @State currentTab: number = 0
  @State itemList: string[] = ['项目1', '项目2', '项目3']
  @State selectedItems: boolean[] = [false, false, false]

  // 本地Builder方法 - 简单Builder
  @Builder
  simpleCardBuilder(title: string, content: string) {
    Column() {
      Text(title)
        .fancyText(16, Color.Black, FontWeight.Bold)
        .width('100%')
        .backgroundColor('#f0f0f0')
        .margin({ bottom: 8 })
      
      Text(content)
        .fontSize(14)
        .fontColor(Color.Gray)
        .textAlign(TextAlign.Start)
        .width('100%')
    }
    .cardStyles()
    .alignItems(HorizontalAlign.Start)
  }

  // 本地Builder方法 - 带参数的复杂Builder
  @Builder
  listItemBuilder(item: string, index: number, isSelected: boolean) {
    Row() {
      Checkbox({ name: `checkbox_${index}`, group: 'itemGroup' })
        .select(isSelected)
        .selectedColor(Color.Blue)
        .onChange((value: boolean) => {
          this.selectedItems[index] = value
        })
      
      Text(item)
        .fontSize(16)
        .flexGrow(1)
        .margin({ left: 12 })
        .fontColor(isSelected ? Color.Blue : Color.Black)
      
      Button('编辑')
        .fontSize(12)
        .backgroundColor(Color.Orange)
        .width(60)
        .height(30)
        .onClick(() => {
          console.log(`编辑项目: ${item}`)
        })
    }
    .width('100%')
    .padding(12)
    .backgroundColor(isSelected ? '#e6f3ff' : Color.White)
    .borderRadius(8)
    .border({ 
      width: isSelected ? 2 : 1, 
      color: isSelected ? Color.Blue : Color.Gray 
    })
    .margin({ bottom: 8 })
    .alignItems(VerticalAlign.Center)
  }

  // 本地Builder方法 - 标签页Builder
  @Builder
  tabBuilder(title: string, index: number, icon: string) {
    Column() {
      Text(icon)
        .fontSize(20)
        .margin({ bottom: 4 })
      
      Text(title)
        .fontSize(12)
        .fontColor(this.currentTab === index ? Color.Blue : Color.Gray)
    }
    .width(80)
    .height(60)
    .justifyContent(FlexAlign.Center)
    .backgroundColor(this.currentTab === index ? '#e6f3ff' : Color.Transparent)
    .borderRadius(8)
    .onClick(() => {
      this.currentTab = index
    })
  }

  // 本地Builder方法 - 动态内容Builder
  @Builder
  dynamicContentBuilder() {
    Column() {
      if (this.currentTab === 0) {
        // 首页内容
        this.simpleCardBuilder('欢迎使用', '这是首页的内容区域')
        
        Row() {
          Button('主要操作')
            .gradientButton(Color.Blue, Color.Purple)
          
          Button('次要操作')
            .buttonStyles()
            .backgroundColor(Color.Gray)
        }
        .width('100%')
        .justifyContent(FlexAlign.SpaceEvenly)
        .margin({ top: 20 })
        
      } else if (this.currentTab === 1) {
        // 列表内容
        Text('项目列表')
          .fancyText(18, Color.Black, FontWeight.Bold)
          .width('100%')
          .margin({ bottom: 15 })
        
        ForEach(this.itemList, (item: string, index: number) => {
          this.listItemBuilder(item, index, this.selectedItems[index])
        }, (item: string, index: number) => `${index}_${item}`)
        
        Row() {
          Button('全选')
            .buttonStyles()
            .backgroundColor(Color.Green)
            .onClick(() => {
              this.selectedItems = this.selectedItems.map(() => true)
            })
          
          Button('取消全选')
            .buttonStyles()
            .backgroundColor(Color.Red)
            .onClick(() => {
              this.selectedItems = this.selectedItems.map(() => false)
            })
        }
        .width('100%')
        .justifyContent(FlexAlign.SpaceEvenly)
        .margin({ top: 15 })
        
      } else {
        // 设置内容
        this.simpleCardBuilder('设置选项', '这里是应用的各种设置')
        
        Column() {
          this.settingItemBuilder('通知设置', '管理应用通知', true)
          this.settingItemBuilder('隐私设置', '保护您的隐私', false)
          this.settingItemBuilder('账户设置', '管理您的账户', true)
        }
        .width('100%')
      }
    }
    .width('100%')
    .alignItems(HorizontalAlign.Start)
  }

  // 本地Builder方法 - 设置项Builder
  @Builder
  settingItemBuilder(title: string, description: string, hasSwitch: boolean) {
    Row() {
      Column() {
        Text(title)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .textAlign(TextAlign.Start)
        
        Text(description)
          .fontSize(12)
          .fontColor(Color.Gray)
          .textAlign(TextAlign.Start)
          .margin({ top: 2 })
      }
      .flexGrow(1)
      .alignItems(HorizontalAlign.Start)
      
      if (hasSwitch) {
        Toggle({ type: ToggleType.Switch, isOn: false })
          .selectedColor(Color.Blue)
          .switchPointColor(Color.White)
      } else {
        Text('>')
          .fontSize(16)
          .fontColor(Color.Gray)
      }
    }
    .width('100%')
    .padding(15)
    .backgroundColor(Color.White)
    .borderRadius(8)
    .margin({ bottom: 8 })
    .alignItems(VerticalAlign.Center)
  }

  // 本地Styles方法
  @Styles
  tabBarStyles() {
    .width('100%')
    .height(70)
    .backgroundColor(Color.White)
    .border({ 
      width: { top: 1 }, 
      color: Color.Gray 
    })
  }

  build() {
    Column() {
      // 使用全局Builder
      GlobalHeaderBuilder('自定义组件测试', 'Builder、Styles、Extend示例')
      
      // 主内容区域
      Column() {
        this.dynamicContentBuilder()
      }
      .width('100%')
      .layoutWeight(1)
      .padding(15)
      .backgroundColor('#f5f5f5')
      
      // 底部标签栏
      Row() {
        this.tabBuilder('首页', 0, '🏠')
        this.tabBuilder('列表', 1, '📋')
        this.tabBuilder('设置', 2, '⚙️')
      }
      .tabBarStyles()
      .justifyContent(FlexAlign.SpaceEvenly)
      .alignItems(VerticalAlign.Center)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#f8f8f8')
  }
}

// 可复用的自定义组件，演示@Builder的高级用法
@Component
struct ReusableCard {
  @Prop title: string = ''
  @Prop subtitle: string = ''
  @Prop showActions: boolean = true
  @Builder customContent: () => void = this.defaultContent

  @Builder
  defaultContent() {
    Text('默认内容')
      .fontSize(14)
      .fontColor(Color.Gray)
  }

  @Builder
  actionButtons() {
    Row() {
      Button('确认')
        .buttonStyles()
        .backgroundColor(Color.Green)
      
      Button('取消')
        .buttonStyles()
        .backgroundColor(Color.Red)
        .margin({ left: 10 })
    }
    .width('100%')
    .justifyContent(FlexAlign.End)
    .margin({ top: 15 })
  }

  build() {
    Column() {
      // 标题区域
      if (this.title) {
        Text(this.title)
          .fancyText(18, Color.Black, FontWeight.Bold)
          .width('100%')
        
        if (this.subtitle) {
          Text(this.subtitle)
            .fontSize(12)
            .fontColor(Color.Gray)
            .width('100%')
            .textAlign(TextAlign.Start)
            .margin({ top: 4 })
        }
        
        Divider()
          .height(1)
          .color(Color.Gray)
          .margin({ top: 10, bottom: 10 })
      }
      
      // 自定义内容区域
      this.customContent()
      
      // 操作按钮区域
      if (this.showActions) {
        this.actionButtons()
      }
    }
    .cardStyles()
    .alignItems(HorizontalAlign.Start)
  }
}