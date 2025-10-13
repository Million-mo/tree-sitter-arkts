// ArkUI组件和修饰符测试用例
// 测试各种基础组件及其修饰符链

@Component
struct ComponentModifierTest {
  @State imageOpacity: number = 1.0;
  @State textSize: number = 16;
  @State isChecked: boolean = false;
  @State sliderValue: number = 50;
  @State inputText: string = '';

  build() {
    Scroll() {
      Column({ space: 15 }) {
        // Text组件修饰符测试
        Text('文本组件测试')
          .fontSize(this.textSize)
          .fontWeight(FontWeight.Bold)
          .fontColor(Color.Blue)
          .textAlign(TextAlign.Center)
          .lineHeight(24)
          .letterSpacing(1)
          .textDecoration({ 
            type: TextDecorationType.Underline, 
            color: Color.Red 
          })
          .width('100%')
          .height(60)
          .backgroundColor(Color.Yellow)
          .borderRadius(8)
          .border({ 
            width: 2, 
            color: Color.Green, 
            style: BorderStyle.Dashed 
          })
          .padding({ left: 10, right: 10, top: 5, bottom: 5 })
          .margin({ top: 10, bottom: 10 })

        // Image组件修饰符测试
        Image($r('app.media.icon'))
          .width(100)
          .height(100)
          .objectFit(ImageFit.Cover)
          .borderRadius(50)
          .opacity(this.imageOpacity)
          .shadow({ 
            radius: 10, 
            color: Color.Gray, 
            offsetX: 5, 
            offsetY: 5 
          })
          .onClick(() => {
            this.imageOpacity = this.imageOpacity === 1.0 ? 0.5 : 1.0
          })

        // Button组件修饰符测试
        Button('按钮测试', { type: ButtonType.Capsule, stateEffect: true })
          .width(200)
          .height(40)
          .backgroundColor(Color.Orange)
          .fontColor(Color.White)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .borderRadius(20)
          .shadow({ radius: 5, color: Color.Black, offsetY: 2 })
          .onClick(() => {
            this.textSize = this.textSize === 16 ? 20 : 16
          })

        // TextInput组件修饰符测试
        TextInput({ 
          placeholder: '请输入文本', 
          text: this.inputText 
        })
          .width('100%')
          .height(50)
          .fontSize(16)
          .fontColor(Color.Black)
          .backgroundColor(Color.White)
          .borderRadius(8)
          .border({ 
            width: 1, 
            color: Color.Gray 
          })
          .padding({ left: 15, right: 15 })
          .placeholderColor(Color.Gray)
          .placeholderFont({ 
            size: 14, 
            weight: FontWeight.Normal 
          })
          .caretColor(Color.Blue)
          .maxLength(100)
          .onChange((value: string) => {
            this.inputText = value
          })
          .onSubmit((enterKey: EnterKeyType) => {
            console.log('输入提交:', this.inputText)
          })

        // Checkbox组件修饰符测试
        Row() {
          Checkbox({ name: 'checkbox1', group: 'checkboxGroup' })
            .select(this.isChecked)
            .selectedColor(Color.Blue)
            .unselectedColor(Color.Gray)
            .mark({ 
              strokeColor: Color.White, 
              size: 16, 
              strokeWidth: 2 
            })
            .onChange((value: boolean) => {
              this.isChecked = value
            })
          
          Text('同意用户协议')
            .fontSize(14)
            .fontColor(Color.Black)
            .margin({ left: 8 })
        }
        .width('100%')
        .alignItems(VerticalAlign.Center)

        // Slider组件修饰符测试
        Column() {
          Text(`滑块值: ${this.sliderValue}`)
            .fontSize(14)
            .margin({ bottom: 10 })
          
          Slider({
            value: this.sliderValue,
            min: 0,
            max: 100,
            step: 1,
            style: SliderStyle.OutSet
          })
            .blockColor(Color.Blue)
            .trackColor(Color.Gray)
            .selectedColor(Color.Orange)
            .showSteps(true)
            .showTips(true)
            .trackThickness(8)
            .onChange((value: number, mode: SliderChangeMode) => {
              this.sliderValue = value
            })
        }
        .width('100%')
        .alignItems(HorizontalAlign.Start)

        // Progress组件修饰符测试
        Progress({ 
          value: this.sliderValue, 
          total: 100, 
          type: ProgressType.Linear 
        })
          .width('100%')
          .height(10)
          .color(Color.Blue)
          .backgroundColor(Color.Gray)
          .borderRadius(5)

        // Radio组件修饰符测试
        Column() {
          Text('选择选项:')
            .fontSize(14)
            .margin({ bottom: 10 })
          
          Row() {
            Radio({ value: 'option1', group: 'radioGroup' })
              .checked(true)
              .radioStyle({ 
                checkedBackgroundColor: Color.Blue,
                uncheckedBorderColor: Color.Gray
              })
            Text('选项1')
              .fontSize(14)
              .margin({ left: 8, right: 20 })
            
            Radio({ value: 'option2', group: 'radioGroup' })
              .radioStyle({ 
                checkedBackgroundColor: Color.Green,
                uncheckedBorderColor: Color.Gray
              })
            Text('选项2')
              .fontSize(14)
              .margin({ left: 8 })
          }
          .width('100%')
          .alignItems(VerticalAlign.Center)
        }
        .width('100%')
        .alignItems(HorizontalAlign.Start)

        // 复合修饰符测试
        Text('复合修饰符测试')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor(Color.White)
          .textAlign(TextAlign.Center)
          .width('100%')
          .height(50)
          .backgroundColor(Color.Red)
          .borderRadius(25)
          .border({ 
            width: 3, 
            color: Color.Yellow, 
            style: BorderStyle.Solid 
          })
          .shadow({ 
            radius: 8, 
            color: Color.Black, 
            offsetX: 0, 
            offsetY: 4 
          })
          .padding(10)
          .margin(15)
          .opacity(0.9)
          .scale({ x: 1.0, y: 1.0 })
          .rotate({ x: 0, y: 0, z: 1, angle: 0 })
          .translate({ x: 0, y: 0 })
          .onClick(() => {
            console.log('复合修饰符按钮点击')
          })
      }
      .width('100%')
      .padding(20)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F0F0F0')
  }
}