// 完整的ArkTS测试文件
import { Component, Entry, State, Prop } from '@ohos.arkui'

@Component
export struct CustomButton {
  @Prop text: string = 'Button'
  @State isPressed: boolean = false
  
  build() {
    Button(this.text)
      .backgroundColor(this.isPressed ? Color.Gray : Color.Blue)
      .onClick(() => {
        this.isPressed = !this.isPressed
      })
  }
}

@Entry
@Component
struct MainPage {
  @State private message: string = 'Hello ArkTS!'
  @State private counter: number = 0
  
  // 使用@Builder装饰器的自定义构建函数
  @Builder
  buildHeader() {
    Row() {
      Text(this.message)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin({ bottom: 16 })
    }
  }
  
  build() {
    Column({ space: 20 }) {
      this.buildHeader()
      
      Text(`Counter: ${this.counter}`)
        .fontSize(18)
      
      Row({ space: 10 }) {
        CustomButton({ text: 'Increment' })
          .onClick(() => this.counter++)
        
        CustomButton({ text: 'Decrement' })
          .onClick(() => this.counter--)
      }
      
      if (this.counter > 10) {
        Text('Counter is high!')
          .fontColor(Color.Red)
      }
    }
    .width('100%')
    .height('100%')
    .padding(16)
  }
}