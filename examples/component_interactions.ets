// 组件交互和事件处理测试用例

@Component
struct ComponentInteractionsTest {
  @State inputText: string = '';
  @State sliderValue: number = 50;
  @State isToggled: boolean = false;
  @State selectedRadio: string = 'option1';

  build() {
    Scroll() {
      Column() {
        Text('Component Interactions Test')
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .margin({ bottom: 20 })

        // TextInput测试
        Column() {
          Text('Text Input:')
            .fontSize(16)
            .margin({ bottom: 8 })
          
          TextInput({ placeholder: 'Enter text here', text: this.inputText })
            .width('100%')
            .onChange((value: string) => {
              this.inputText = value
            })
            .margin({ bottom: 8 })
          
          Text(`Input value: ${this.inputText}`)
            .fontSize(14)
            .fontColor(Color.Gray)
        }
        .width('100%')
        .margin({ bottom: 20 })

        // Slider测试
        Column() {
          Text('Slider:')
            .fontSize(16)
            .margin({ bottom: 8 })
          
          Slider({
            value: this.sliderValue,
            min: 0,
            max: 100,
            step: 1
          })
            .width('100%')
            .onChange((value: number) => {
              this.sliderValue = value
            })
            .margin({ bottom: 8 })
          
          Text(`Slider value: ${this.sliderValue}`)
            .fontSize(14)
            .fontColor(Color.Gray)
        }
        .width('100%')
        .margin({ bottom: 20 })

        // Toggle测试
        Row() {
          Text('Toggle:')
            .fontSize(16)
            .flexGrow(1)
          
          Toggle({ type: ToggleType.Switch, isOn: this.isToggled })
            .onChange((isOn: boolean) => {
              this.isToggled = isOn
            })
        }
        .width('100%')
        .alignItems(VerticalAlign.Center)
        .margin({ bottom: 8 })

        Text(`Toggle state: ${this.isToggled ? 'ON' : 'OFF'}`)
          .fontSize(14)
          .fontColor(Color.Gray)
          .margin({ bottom: 20 })

        // Radio按钮测试
        Column() {
          Text('Radio Buttons:')
            .fontSize(16)
            .margin({ bottom: 8 })
          
          Column() {
            Row() {
              Radio({ value: 'option1', group: 'radioGroup' })
                .checked(this.selectedRadio === 'option1')
                .onChange((isChecked: boolean) => {
                  if (isChecked) {
                    this.selectedRadio = 'option1'
                  }
                })
              Text('Option 1')
                .fontSize(14)
                .margin({ left: 8 })
            }
            .width('100%')
            .alignItems(VerticalAlign.Center)
            .margin({ bottom: 8 })

            Row() {
              Radio({ value: 'option2', group: 'radioGroup' })
                .checked(this.selectedRadio === 'option2')
                .onChange((isChecked: boolean) => {
                  if (isChecked) {
                    this.selectedRadio = 'option2'
                  }
                })
              Text('Option 2')
                .fontSize(14)
                .margin({ left: 8 })
            }
            .width('100%')
            .alignItems(VerticalAlign.Center)
            .margin({ bottom: 8 })
          }
          .alignItems(HorizontalAlign.Start)
          
          Text(`Selected: ${this.selectedRadio}`)
            .fontSize(14)
            .fontColor(Color.Gray)
        }
        .width('100%')
        .margin({ bottom: 20 })

        // Button点击测试
        Column() {
          Text('Button Actions:')
            .fontSize(16)
            .margin({ bottom: 8 })
          
          Row() {
            Button('Reset All')
              .backgroundColor(Color.Orange)
              .onClick(() => {
                this.inputText = ''
                this.sliderValue = 50
                this.isToggled = false
                this.selectedRadio = 'option1'
              })
            
            Button('Set Random')
              .backgroundColor(Color.Blue)
              .margin({ left: 10 })
              .onClick(() => {
                this.inputText = 'Random Text'
                this.sliderValue = Math.floor(Math.random() * 100)
                this.isToggled = Math.random() > 0.5
                this.selectedRadio = Math.random() > 0.5 ? 'option1' : 'option2'
              })
          }
          .width('100%')
          .justifyContent(FlexAlign.SpaceEvenly)
        }
        .width('100%')
      }
      .width('100%')
      .padding(20)
    }
    .width('100%')
    .height('100%')
  }
}