// 状态管理高级功能测试
@Component
struct StateManagementTest {
  @State count: number = 0;
  @State private name: string = 'Test';
  @Link shared: boolean;
  @Prop title: string;
  
  @State @Watch('onItemsChange') items: string[] = []
  
  // Watch回调函数
  onItemsChange() {
    console.log('Items changed:', this.items.length)
  }

  // 使用状态绑定
  @Builder
  itemBuilder(item: string) {
    Row() {
      Text(item)
      Button('Delete')
        .onClick(() => {
          let index = this.items.indexOf(item)
          if (index > -1) {
            this.items.splice(index, 1)
          }
        })
    }
  }

  build() {
    Column() {
      Text($r('app.string.title'))
      Text(`Count: ${this.count}`)
      Text(`Name: ${this.name}`)
      
      Button('Increment')
        .onClick(() => {
          this.count++
        })
      
      Button('Add Item')
        .onClick(() => {
          this.items.push(`Item ${this.count}`)
        })
        
      ForEach(this.items, (item: string) => {
        this.itemBuilder(item)
      }, (item: string) => item)
      
      if (this.shared) {
        Text('Shared state is true')
      }
    }
  }
}