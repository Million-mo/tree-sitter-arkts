@Component
struct TestComponent {
  build() {
    Column() {
      Text('Hello')
    }
    .width('100%')
    .height('100%')
  }
}