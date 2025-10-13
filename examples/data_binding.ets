// ArkUI数据绑定测试用例
// 测试双向绑定、状态同步、数据流等

// 数据绑定测试的数据模型
@Observed
class FormData {
  username: string = ''
  password: string = ''
  email: string = ''
  age: number = 18
  isSubscribed: boolean = false
  selectedOption: string = 'option1'
  preferences: string[] = []
  
  validate(): boolean {
    return this.username.length > 0 && 
           this.password.length >= 6 && 
           this.email.includes('@')
  }
  
  reset() {
    this.username = ''
    this.password = ''
    this.email = ''
    this.age = 18
    this.isSubscribed = false
    this.selectedOption = 'option1'
    this.preferences = []
  }
}

// 父组件 - 数据绑定演示
@Entry
@Component
struct DataBindingDemo {
  @State formData: FormData = new FormData();
  @Provide('globalTheme') theme: string = 'light';
  @Provide('globalCounter') counter: number = 0;

  build() {
    Scroll() {
      Column({ space: 20 }) {
        Text('数据绑定测试')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .textAlign(TextAlign.Center)
          .width('100%')

        // 双向绑定表单
        TwoWayBindingForm({ formData: this.formData })

        // 状态提升示例
        StateElevationDemo()

        // 跨组件数据共享
        DataSharingDemo()

        // 数据同步验证
        DataValidationPanel({ formData: this.formData })
      }
      .width('100%')
      .padding(20)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#f5f5f5')
  }
}

// 双向绑定表单组件
@Component
struct TwoWayBindingForm {
  @ObjectLink formData: FormData;
  @State showPassword: boolean = false;

  @Builder
  formFieldBuilder(label: string, content: () => void) {
    Column() {
      Row() {
        Text(label)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .width(80)
          .textAlign(TextAlign.Start)
        
        Column() {
          content()
        }
        .flexGrow(1)
      }
      .width('100%')
      .alignItems(VerticalAlign.Center)
    }
    .width('100%')
    .margin({ bottom: 15 })
  }

  build() {
    Column() {
      Text('双向数据绑定表单')
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .margin({ bottom: 20 })

      // 用户名双向绑定
      this.formFieldBuilder('用户名:', () => {
        TextInput({ 
          placeholder: '请输入用户名',
          text: $$this.formData.username
        })
          .width('100%')
          .backgroundColor(Color.White)
          .borderRadius(6)
      })

      // 密码双向绑定
      this.formFieldBuilder('密码:', () => {
        Row() {
          TextInput({ 
            placeholder: '请输入密码',
            text: $$this.formData.password
          })
            .type(this.showPassword ? InputType.Normal : InputType.Password)
            .width('100%')
            .backgroundColor(Color.White)
            .borderRadius(6)
            .flexGrow(1)
          
          Button(this.showPassword ? '隐藏' : '显示')
            .fontSize(12)
            .backgroundColor(Color.Gray)
            .margin({ left: 8 })
            .onClick(() => {
              this.showPassword = !this.showPassword
            })
        }
        .width('100%')
      })

      // 邮箱双向绑定
      this.formFieldBuilder('邮箱:', () => {
        TextInput({ 
          placeholder: '请输入邮箱',
          text: $$this.formData.email
        })
          .width('100%')
          .backgroundColor(Color.White)
          .borderRadius(6)
      })

      // 年龄滑块双向绑定
      this.formFieldBuilder('年龄:', () => {
        Column() {
          Row() {
            Slider({
              value: $$this.formData.age,
              min: 1,
              max: 120,
              step: 1
            })
              .flexGrow(1)
              .trackColor(Color.Gray)
              .selectedColor(Color.Blue)
            
            Text(`${this.formData.age}岁`)
              .fontSize(14)
              .width(50)
              .textAlign(TextAlign.End)
          }
          .width('100%')
          .alignItems(VerticalAlign.Center)
        }
      })

      // 开关双向绑定
      this.formFieldBuilder('订阅:', () => {
        Toggle({ 
          type: ToggleType.Switch, 
          isOn: $$this.formData.isSubscribed 
        })
          .selectedColor(Color.Blue)
      })

      // 单选按钮双向绑定
      this.formFieldBuilder('选项:', () => {
        Column() {
          ['option1', 'option2', 'option3'].map((option: string, index: number) => {
            Row() {
              Radio({ 
                value: option, 
                group: 'optionGroup' 
              })
                .checked(this.formData.selectedOption === option)
                .onChange((isChecked: boolean) => {
                  if (isChecked) {
                    this.formData.selectedOption = option
                  }
                })
              
              Text(`选项 ${index + 1}`)
                .fontSize(14)
                .margin({ left: 8 })
            }
            .width('100%')
            .margin({ bottom: 8 })
            .alignItems(VerticalAlign.Center)
          })
        }
        .alignItems(HorizontalAlign.Start)
      })

      // 多选框双向绑定
      this.formFieldBuilder('偏好:', () => {
        Column() {
          ['音乐', '电影', '阅读', '运动'].map((pref: string) => {
            Row() {
              Checkbox({ 
                name: pref, 
                group: 'preferences' 
              })
                .select(this.formData.preferences.includes(pref))
                .onChange((value: boolean) => {
                  if (value) {
                    if (!this.formData.preferences.includes(pref)) {
                      this.formData.preferences.push(pref)
                    }
                  } else {
                    const index = this.formData.preferences.indexOf(pref)
                    if (index > -1) {
                      this.formData.preferences.splice(index, 1)
                    }
                  }
                })
              
              Text(pref)
                .fontSize(14)
                .margin({ left: 8 })
            }
            .width('100%')
            .margin({ bottom: 8 })
            .alignItems(VerticalAlign.Center)
          })
        }
        .alignItems(HorizontalAlign.Start)
      })

      // 操作按钮
      Row() {
        Button('重置表单')
          .backgroundColor(Color.Orange)
          .flexGrow(1)
          .onClick(() => {
            this.formData.reset()
          })
        
        Button('提交')
          .backgroundColor(this.formData.validate() ? Color.Green : Color.Gray)
          .flexGrow(1)
          .margin({ left: 10 })
          .enabled(this.formData.validate())
          .onClick(() => {
            console.log('表单提交:', JSON.stringify(this.formData))
          })
      }
      .width('100%')
      .margin({ top: 20 })
    }
    .width('100%')
    .padding(20)
    .backgroundColor(Color.White)
    .borderRadius(12)
  }
}

// 状态提升演示组件
@Component
struct StateElevationDemo {
  @State sharedValue: number = 50;
  @State @Watch('onColorChange') selectedColor: Color = Color.Blue;
  
  onColorChange() {
    console.log('颜色状态变化:', this.selectedColor)
  }

  build() {
    Column() {
      Text('状态提升示例')
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .margin({ bottom: 15 })

      Text('共享数值状态')
        .fontSize(16)
        .margin({ bottom: 10 })

      // 父组件控制滑块
      Slider({
        value: this.sharedValue,
        min: 0,
        max: 100,
        step: 1
      })
        .width('100%')
        .margin({ bottom: 15 })
        .onChange((value: number) => {
          this.sharedValue = value
        })

      // 子组件显示和使用共享状态
      Row() {
        ChildDisplayComponent({ 
          value: this.sharedValue,
          color: this.selectedColor,
          onColorChange: (newColor: Color) => {
            this.selectedColor = newColor
          }
        })
        
        ChildControlComponent({ 
          value: this.sharedValue,
          onValueChange: (newValue: number) => {
            this.sharedValue = newValue
          }
        })
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceBetween)
    }
    .width('100%')
    .padding(20)
    .backgroundColor(Color.White)
    .borderRadius(12)
  }
}

// 子组件 - 显示共享状态
@Component
struct ChildDisplayComponent {
  @Prop value: number;
  @Prop color: Color;
  onColorChange: (color: Color) => void = () => {};

  build() {
    Column() {
      Text('显示组件')
        .fontSize(14)
        .fontWeight(FontWeight.Bold)
        .margin({ bottom: 10 })

      Circle()
        .width(60)
        .height(60)
        .fill(this.color)
        .opacity(this.value / 100)

      Text(`数值: ${this.value}`)
        .fontSize(12)
        .margin({ top: 8, bottom: 8 })

      Button('换色')
        .fontSize(12)
        .backgroundColor(Color.Purple)
        .onClick(() => {
          const colors = [Color.Red, Color.Green, Color.Blue, Color.Orange, Color.Pink]
          const randomColor = colors[Math.floor(Math.random() * colors.length)]
          this.onColorChange(randomColor)
        })
    }
    .width(120)
    .padding(10)
    .backgroundColor('#f0f0f0')
    .borderRadius(8)
  }
}

// 子组件 - 控制共享状态
@Component
struct ChildControlComponent {
  @Prop value: number;
  onValueChange: (value: number) => void = () => {};

  build() {
    Column() {
      Text('控制组件')
        .fontSize(14)
        .fontWeight(FontWeight.Bold)
        .margin({ bottom: 10 })

      Progress({ 
        value: this.value, 
        total: 100, 
        type: ProgressType.Ring 
      })
        .width(60)
        .height(60)
        .color(Color.Blue)

      Text(`${this.value}%`)
        .fontSize(12)
        .margin({ top: 8, bottom: 8 })

      Row() {
        Button('-')
          .fontSize(12)
          .backgroundColor(Color.Red)
          .width(30)
          .onClick(() => {
            this.onValueChange(Math.max(0, this.value - 10))
          })

        Button('+')
          .fontSize(12)
          .backgroundColor(Color.Green)
          .width(30)
          .margin({ left: 5 })
          .onClick(() => {
            this.onValueChange(Math.min(100, this.value + 10))
          })
      }
    }
    .width(120)
    .padding(10)
    .backgroundColor('#f0f0f0')
    .borderRadius(8)
  }
}

// 跨组件数据共享演示
@Component
struct DataSharingDemo {
  @Consume('globalTheme') theme: string
  @Consume('globalCounter') counter: number

  build() {
    Column() {
      Text('跨组件数据共享')
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .margin({ bottom: 15 })

      Text(`全局主题: ${this.theme}`)
        .fontSize(14)
        .margin({ bottom: 8 })

      Text(`全局计数器: ${this.counter}`)
        .fontSize(14)
        .margin({ bottom: 15 })

      // 嵌套的消费组件
      NestedConsumerComponent()
    }
    .width('100%')
    .padding(20)
    .backgroundColor(this.theme === 'dark' ? '#333' : Color.White)
    .borderRadius(12)
  }
}

// 嵌套的消费者组件
@Component
struct NestedConsumerComponent {
  @Consume('globalTheme') theme: string
  @Consume('globalCounter') counter: number

  build() {
    Row() {
      Text('嵌套组件也能访问全局状态')
        .fontSize(12)
        .fontColor(this.theme === 'dark' ? Color.White : Color.Black)
        .flexGrow(1)

      Text(`${this.counter}`)
        .fontSize(16)
        .fontWeight(FontWeight.Bold)
        .fontColor(Color.Blue)
    }
    .width('100%')
    .padding(10)
    .backgroundColor(this.theme === 'dark' ? '#444' : '#f0f0f0')
    .borderRadius(6)
  }
}

// 数据验证面板
@Component
struct DataValidationPanel {
  @ObjectLink formData: FormData
  @State validationResults: string[] = []

  private validateForm() {
    this.validationResults = []
    
    if (this.formData.username.length === 0) {
      this.validationResults.push('用户名不能为空')
    }
    
    if (this.formData.password.length < 6) {
      this.validationResults.push('密码长度至少6位')
    }
    
    if (!this.formData.email.includes('@')) {
      this.validationResults.push('邮箱格式不正确')
    }
    
    if (this.formData.age < 18) {
      this.validationResults.push('年龄必须大于18岁')
    }
  }

  build() {
    Column() {
      Row() {
        Text('数据验证')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .flexGrow(1)
        
        Button('验证')
          .fontSize(14)
          .backgroundColor(Color.Blue)
          .onClick(() => {
            this.validateForm()
          })
      }
      .width('100%')
      .margin({ bottom: 15 })

      if (this.validationResults.length > 0) {
        Column() {
          ForEach(this.validationResults, (result: string) => {
            Text(`• ${result}`)
              .fontSize(14)
              .fontColor(Color.Red)
              .textAlign(TextAlign.Start)
              .width('100%')
              .margin({ bottom: 5 })
          }, (result: string) => result)
        }
        .width('100%')
        .padding(10)
        .backgroundColor('#ffe6e6')
        .borderRadius(6)
      } else if (this.validationResults.length === 0 && this.formData.validate()) {
        Text('✓ 表单验证通过')
          .fontSize(14)
          .fontColor(Color.Green)
          .width('100%')
          .padding(10)
          .backgroundColor('#e6ffe6')
          .borderRadius(6)
          .textAlign(TextAlign.Center)
      }

      // 实时数据预览
      Text('实时数据预览')
        .fontSize(16)
        .fontWeight(FontWeight.Bold)
        .margin({ top: 20, bottom: 10 })

      Text(JSON.stringify(this.formData, null, 2))
        .fontSize(12)
        .fontFamily('monospace')
        .width('100%')
        .padding(10)
        .backgroundColor('#f8f8f8')
        .borderRadius(6)
        .maxLines(10)
        .textOverflow({ overflow: TextOverflow.Ellipsis })
    }
    .width('100%')
    .padding(20)
    .backgroundColor(Color.White)
    .borderRadius(12)
  }
}