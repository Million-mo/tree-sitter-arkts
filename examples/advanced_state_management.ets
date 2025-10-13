// ArkUI高级状态管理测试用例
// 测试@State、@Prop、@Link、@Provide、@Consume、@ObjectLink等

// 数据模型类
@Observed
class User {
  name: string = ''
  age: number = 0
  email: string = ''
  
  constructor(name: string, age: number, email: string) {
    this.name = name
    this.age = age
    this.email = email
  }
}

@Observed
class AppState {
  users: User[] = []
  currentUser: User | null = null
  theme: 'light' | 'dark' = 'light'
  
  addUser(user: User) {
    this.users.push(user)
  }
  
  removeUser(index: number) {
    this.users.splice(index, 1)
  }
}

// 主应用组件
@Entry
@Component
struct AdvancedStateApp {
  @State appState: AppState = new AppState()
  @Provide('theme') theme: string = 'light'
  @Provide('userCount') userCount: number = 0

  aboutToAppear() {
    // 初始化数据
    this.appState.addUser(new User('张三', 25, 'zhangsan@example.com'))
    this.appState.addUser(new User('李四', 30, 'lisi@example.com'))
    this.userCount = this.appState.users.length
  }

  build() {
    Column() {
      // 主题切换
      ThemeController({ 
        currentTheme: this.theme,
        onThemeChange: (newTheme: string) => {
          this.theme = newTheme
        }
      })

      // 用户列表
      UserList({ 
        appState: this.appState,
        onUserCountChange: (count: number) => {
          this.userCount = count
        }
      })

      // 用户统计
      UserStats()
    }
    .width('100%')
    .height('100%')
    .backgroundColor(this.theme === 'dark' ? Color.Black : Color.White)
  }
}

// 主题控制器组件
@Component
struct ThemeController {
  @Prop currentTheme: string
  onThemeChange: (theme: string) => void = () => {}

  build() {
    Row() {
      Text('主题设置')
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .flexGrow(1)
      
      Button(this.currentTheme === 'light' ? '🌙' : '☀️')
        .backgroundColor(Color.Transparent)
        .fontSize(20)
        .onClick(() => {
          const newTheme = this.currentTheme === 'light' ? 'dark' : 'light'
          this.onThemeChange(newTheme)
        })
    }
    .width('100%')
    .padding(15)
    .backgroundColor(this.currentTheme === 'dark' ? '#333' : '#f5f5f5')
  }
}

// 用户列表组件
@Component
struct UserList {
  @ObjectLink appState: AppState
  onUserCountChange: (count: number) => void = () => {}
  @State @Watch('onNewUserChange') newUserName: string = ''
  @State newUserAge: number = 18
  @State newUserEmail: string = ''

  onNewUserChange() {
    console.log('新用户名称变化:', this.newUserName)
  }

  private addNewUser() {
    if (this.newUserName.trim() && this.newUserEmail.trim()) {
      const newUser = new User(this.newUserName, this.newUserAge, this.newUserEmail)
      this.appState.addUser(newUser)
      this.onUserCountChange(this.appState.users.length)
      
      // 清空输入
      this.newUserName = ''
      this.newUserAge = 18
      this.newUserEmail = ''
    }
  }

  @Builder
  userItemBuilder(user: User, index: number) {
    UserItem({ 
      user: user, 
      index: index,
      onDelete: () => {
        this.appState.removeUser(index)
        this.onUserCountChange(this.appState.users.length)
      }
    })
  }

  build() {
    Column() {
      // 添加用户表单
      Column() {
        Text('添加新用户')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .margin({ bottom: 10 })

        TextInput({ placeholder: '姓名', text: this.newUserName })
          .width('100%')
          .margin({ bottom: 8 })
          .onChange((value: string) => {
            this.newUserName = value
          })

        Row() {
          Text('年龄:')
            .fontSize(14)
            .width(50)
          
          Slider({
            value: this.newUserAge,
            min: 1,
            max: 100,
            step: 1
          })
            .flexGrow(1)
            .onChange((value: number) => {
              this.newUserAge = value
            })
          
          Text(`${this.newUserAge}`)
            .fontSize(14)
            .width(40)
            .textAlign(TextAlign.End)
        }
        .width('100%')
        .alignItems(VerticalAlign.Center)
        .margin({ bottom: 8 })

        TextInput({ placeholder: '邮箱', text: this.newUserEmail })
          .width('100%')
          .margin({ bottom: 10 })
          .onChange((value: string) => {
            this.newUserEmail = value
          })

        Button('添加用户')
          .width('100%')
          .backgroundColor(Color.Blue)
          .onClick(() => {
            this.addNewUser()
          })
      }
      .width('100%')
      .padding(15)
      .backgroundColor('#f0f0f0')
      .borderRadius(8)
      .margin({ bottom: 15 })

      // 用户列表
      Text('用户列表')
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .margin({ bottom: 10 })

      List() {
        ForEach(this.appState.users, (user: User, index: number) => {
          ListItem() {
            this.userItemBuilder(user, index)
          }
        }, (user: User, index: number) => `${index}_${user.name}`)
      }
      .width('100%')
      .layoutWeight(1)
    }
    .width('100%')
    .padding(15)
  }
}

// 用户项组件
@Component
struct UserItem {
  @ObjectLink user: User
  @Prop index: number
  onDelete: () => void = () => {}
  @State isEditing: boolean = false
  @State editName: string = ''
  
  aboutToAppear() {
    this.editName = this.user.name
  }

  build() {
    Row() {
      Column() {
        if (this.isEditing) {
          TextInput({ text: this.editName })
            .fontSize(16)
            .flexGrow(1)
            .onChange((value: string) => {
              this.editName = value
            })
            .onSubmit(() => {
              this.user.name = this.editName
              this.isEditing = false
            })
        } else {
          Text(this.user.name)
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
        }
        
        Text(`年龄: ${this.user.age}, 邮箱: ${this.user.email}`)
          .fontSize(12)
          .fontColor(Color.Gray)
          .margin({ top: 2 })
      }
      .flexGrow(1)
      .alignItems(HorizontalAlign.Start)

      Row() {
        Button(this.isEditing ? '保存' : '编辑')
          .fontSize(12)
          .backgroundColor(this.isEditing ? Color.Green : Color.Orange)
          .onClick(() => {
            if (this.isEditing) {
              this.user.name = this.editName
            }
            this.isEditing = !this.isEditing
          })

        Button('删除')
          .fontSize(12)
          .backgroundColor(Color.Red)
          .margin({ left: 8 })
          .onClick(() => {
            this.onDelete()
          })
      }
    }
    .width('100%')
    .padding(10)
    .backgroundColor(Color.White)
    .borderRadius(8)
    .margin({ bottom: 8 })
    .alignItems(VerticalAlign.Center)
  }
}

// 用户统计组件（使用@Consume获取全局状态）
@Component
struct UserStats {
  @Consume('theme') theme: string
  @Consume('userCount') userCount: number

  build() {
    Row() {
      Text('用户统计')
        .fontSize(16)
        .fontWeight(FontWeight.Bold)
        .flexGrow(1)
      
      Text(`总计: ${this.userCount} 人`)
        .fontSize(14)
        .fontColor(this.theme === 'dark' ? Color.White : Color.Black)
    }
    .width('100%')
    .padding(15)
    .backgroundColor(this.theme === 'dark' ? '#444' : '#e0e0e0')
    .borderRadius(8)
    .margin(15)
  }
}