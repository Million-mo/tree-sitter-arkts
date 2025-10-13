// 状态管理测试用例
@Component  
struct StateComponent {
  @State count: number = 0
  @Prop message: string = 'test'
  @Link value: string

  build() {
    Column() {
      Text(this.message)
      Button('Click')
        .onClick(() => {
          this.count++
        })
    }
  }
}