// 真实ArkTS应用代码集成测试

import { router } from '@kit.ArkUI';

@Entry
@Component
struct MainPage {
  @State private currentIndex: number = 0;
  @State private todoItems: TodoItem[] = [];
  @State private inputText: string = '';
  @State private isLoading: boolean = false;

  aboutToAppear() {
    this.loadTodoItems()
  }

  async loadTodoItems() {
    this.isLoading = true
    try {
      // 模拟异步数据加载
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.todoItems = [
        { id: 1, text: '学习ArkTS', completed: false },
        { id: 2, text: '开发应用', completed: true },
        { id: 3, text: '发布应用', completed: false }
      ]
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      this.isLoading = false
    }
  }

  @Builder
  buildTodoItem(item: TodoItem, index: number) {
    Row() {
      Checkbox({ name: 'checkbox', group: 'checkboxGroup' })
        .select(item.completed)
        .selectedColor(Color.Blue)
        .onChange((value: boolean) => {
          this.todoItems[index].completed = value
        })

      Text(item.text)
        .fontSize(16)
        .fontColor(item.completed ? Color.Gray : Color.Black)
        .decoration({ type: item.completed ? TextDecorationType.LineThrough : TextDecorationType.None })
        .flexGrow(1)
        .margin({ left: 12 })

      Button({ type: ButtonType.Circle, stateEffect: true }) {
        Image($r('app.media.ic_delete'))
          .width(16)
          .height(16)
      }
      .width(32)
      .height(32)
      .backgroundColor(Color.Red)
      .onClick(() => {
        this.deleteTodoItem(index)
      })
    }
    .width('100%')
    .padding({ left: 16, right: 16, top: 8, bottom: 8 })
    .backgroundColor(Color.White)
    .borderRadius(8)
    .margin({ bottom: 8 })
  }

  @Builder
  buildTabContent(title: string, content: string) {
    Column() {
      Text(title)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin({ bottom: 16 })

      Text(content)
        .fontSize(14)
        .fontColor(Color.Gray)
        .textAlign(TextAlign.Center)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .alignItems(HorizontalAlign.Center)
  }

  @Styles
  inputStyles() {
    .width('100%')
    .height(40)
    .padding({ left: 12, right: 12 })
    .backgroundColor(Color.White)
    .borderRadius(8)
    .border({ width: 1, color: Color.Gray, style: BorderStyle.Solid })
  }

  @Styles
  cardStyles() {
    .backgroundColor(Color.White)
    .borderRadius(12)
    .padding(16)
    .margin({ top: 8, bottom: 8, left: 16, right: 16 })
    .shadow({ radius: 8, color: '#1F000000', offsetX: 0, offsetY: 2 })
  }

  @Extend(Text)
  fancyText(fontSize: number, color: ResourceColor) {
    .fontSize(fontSize)
    .fontColor(color)
    .fontWeight(FontWeight.Bold)
  }

  private addTodoItem() {
    if (this.inputText.trim().length > 0) {
      const newItem: TodoItem = {
        id: Date.now(),
        text: this.inputText.trim(),
        completed: false
      }
      this.todoItems.push(newItem)
      this.inputText = ''
    }
  }

  private deleteTodoItem(index: number) {
    this.todoItems.splice(index, 1)
  }

  private navigateToDetail(item: TodoItem) {
    router.pushUrl({
      url: 'pages/DetailPage',
      params: { todoItem: item }
    })
  }

  build() {
    Column() {
      // 标题栏
      Row() {
        Text('我的待办')
          .fancyText(24, Color.Black)
          .flexGrow(1)

        Button('设置')
          .fontSize(14)
          .backgroundColor(Color.Blue)
          .borderRadius(16)
          .onClick(() => {
            // 跳转到设置页面
          })
      }
      .width('100%')
      .height(56)
      .padding({ left: 16, right: 16 })
      .backgroundColor(Color.White)

      if (this.isLoading) {
        Column() {
          LoadingProgress()
            .width(48)
            .height(48)
            .margin({ bottom: 16 })

          Text('加载中...')
            .fontSize(14)
            .fontColor(Color.Gray)
        }
        .width('100%')
        .height(200)
        .justifyContent(FlexAlign.Center)
        .alignItems(HorizontalAlign.Center)
      } else {
        // 输入区域
        Column() {
          Row() {
            TextInput({ placeholder: '请输入待办事项', text: this.inputText })
              .inputStyles()
              .flexGrow(1)
              .onChange((value: string) => {
                this.inputText = value
              })
              .onSubmit(() => {
                this.addTodoItem()
              })

            Button('添加')
              .fontSize(14)
              .backgroundColor(Color.Blue)
              .borderRadius(8)
              .margin({ left: 8 })
              .onClick(() => {
                this.addTodoItem()
              })
          }
          .width('100%')
        }
        .cardStyles()

        // 待办列表
        Column() {
          if (this.todoItems.length === 0) {
            Column() {
              Image($r('app.media.ic_empty'))
                .width(64)
                .height(64)
                .margin({ bottom: 16 })

              Text('暂无待办事项')
                .fontSize(16)
                .fontColor(Color.Gray)
            }
            .width('100%')
            .height(200)
            .justifyContent(FlexAlign.Center)
            .alignItems(HorizontalAlign.Center)
          } else {
            List() {
              ForEach(this.todoItems, (item: TodoItem, index: number) => {
                ListItem() {
                  this.buildTodoItem(item, index)
                }
                .onClick(() => {
                  this.navigateToDetail(item)
                })
              }, (item: TodoItem) => item.id.toString())
            }
            .layoutWeight(1)
            .width('100%')
            .divider({ strokeWidth: 1, color: Color.Gray, startMargin: 16, endMargin: 16 })
          }
        }
        .cardStyles()
        .layoutWeight(1)
      }

      // 底部标签栏
      Tabs({ barPosition: BarPosition.End, index: this.currentIndex }) {
        TabContent() {
          this.buildTabContent('首页', '这是首页内容')
        }
        .tabBar(this.buildTabBar('首页', $r('app.media.ic_home'), 0))

        TabContent() {
          this.buildTabContent('分类', '这是分类内容')
        }
        .tabBar(this.buildTabBar('分类', $r('app.media.ic_category'), 1))

        TabContent() {
          this.buildTabContent('我的', '这是个人中心')
        }
        .tabBar(this.buildTabBar('我的', $r('app.media.ic_profile'), 2))
      }
      .width('100%')
      .height(200)
      .onChange((index: number) => {
        this.currentIndex = index
      })
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')
  }

  @Builder
  buildTabBar(title: string, icon: Resource, index: number) {
    Column() {
      Image(icon)
        .width(24)
        .height(24)
        .margin({ bottom: 4 })
        .fillColor(this.currentIndex === index ? Color.Blue : Color.Gray)

      Text(title)
        .fontSize(12)
        .fontColor(this.currentIndex === index ? Color.Blue : Color.Gray)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .alignItems(HorizontalAlign.Center)
  }
}

// 数据模型
interface TodoItem {
  id: number
  text: string
  completed: boolean
}

// 全局状态管理
@Observed
class AppState {
  public todos: TodoItem[] = []
  
  addTodo(text: string) {
    this.todos.push({
      id: Date.now(),
      text: text,
      completed: false
    })
  }
  
  toggleTodo(id: number) {
    const todo = this.todos.find(item => item.id === id)
    if (todo) {
      todo.completed = !todo.completed
    }
  }
  
  deleteTodo(id: number) {
    const index = this.todos.findIndex(item => item.id === id)
    if (index > -1) {
      this.todos.splice(index, 1)
    }
  }
}

export { AppState, TodoItem }