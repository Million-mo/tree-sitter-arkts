// ArkTS 测试代码
import { Component } from '@ohos.arkui';

@Component
struct HelloWorld {
  @State message: string = 'Hello, ArkTS!';
  @Prop count: number = 0;

  build() {
    Column() {
      Text(this.message)
        .fontSize(16)
        .fontWeight(FontWeight.Bold)
      
      Button('Click Me')
        .onClick(() => {
          this.count++
        })
      
      if (this.count > 0) {
        Text(`Clicked ${this.count} times`)
      }
    }
    .width('100%')
    .height('100%')
  }
}


@Component
struct MyComponent {
  @State count: number = 0;

  build() {
    Text(`Count: ${this.count}`)
  }
}