// 修饰符链测试 - 简化版本
@Component
struct ModifierTest {
  build() {
    // 这应该是一个complete_component_statement，包含text_component + modifier_chain
    Text('Hello')
      .fontSize(16)
      .fontColor(Color.Red)
    
    // 这应该是一个complete_layout_statement，包含layout_container + modifier_chain  
    Column() {
      Text('Inside Column')
    }
    .width('100%')
    .height(200)
  }
}