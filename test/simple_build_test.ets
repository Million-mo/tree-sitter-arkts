@Component
struct SimpleTest {
  build() {
    Text('Hello')
      .fontSize(16)
    
    Column() {
      Text('Inside')
    }
    .width('100%')
  }
}