@Component
struct HelloWorld {
  @State message: string = 'Hello World'
  
  build() {
    Column() {
      Text(this.message)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
    }
  }
}

@Entry
@Component
struct MainApp {
  build() {
    Column() {
      HelloWorld()
    }
  }
}