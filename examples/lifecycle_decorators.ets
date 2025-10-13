// ArkUI生命周期和装饰器测试用例
// 测试各种生命周期回调和高级装饰器

import { router } from '@kit.ArkUI'

// 存储链接装饰器测试
class StorageData {
  static readonly THEME_KEY: string = 'app_theme';
  static readonly USER_SETTINGS_KEY: string = 'user_settings';
  static readonly LAST_PAGE_KEY: string = 'last_page';
}

// 用户设置数据模型
@Observed
class UserSettings {
  username: string = '';
  email: string = '';
  notifications: boolean = true;
  autoSave: boolean = false;
  
  constructor(username: string = '', email: string = '') {
    this.username = username;
    this.email = email;
  }
}

// 主应用入口组件
@Entry
@Component
struct LifecycleApp {
  @StorageLink(StorageData.THEME_KEY) appTheme: string = 'light';
  @StorageLink(StorageData.USER_SETTINGS_KEY) userSettings: UserSettings = new UserSettings();
  @StorageLink(StorageData.LAST_PAGE_KEY) lastPage: string = 'home';
  
  aboutToAppear() {
    console.log('LifecycleApp: aboutToAppear - 组件即将出现')
    // 初始化应用级别的数据
    this.initializeApp()
  }
  
  aboutToDisappear() {
    console.log('LifecycleApp: aboutToDisappear - 组件即将消失')
    // 保存应用状态
    this.saveAppState()
  }
  
  onPageShow() {
    console.log('LifecycleApp: onPageShow - 页面显示')
  }
  
  onPageHide() {
    console.log('LifecycleApp: onPageHide - 页面隐藏')
  }
  
  onBackPress(): boolean {
    console.log('LifecycleApp: onBackPress - 返回按键处理');
    return false; // 允许返回
  }
  
  private initializeApp() {
    console.log('初始化应用数据...')
    // 模拟从持久化存储加载数据
  }
  
  private saveAppState() {
    console.log('保存应用状态...')
    // 模拟保存应用状态到持久化存储
  }

  build() {
    Column() {
      // 主题切换控制
      ThemeSwitcher()
      
      // 主要内容区域
      MainContent({ 
        currentPage: this.lastPage,
        onPageChange: (page: string) => {
          this.lastPage = page
        }
      })
      
      // 设置面板
      SettingsPanel()
    }
    .width('100%')
    .height('100%')
    .backgroundColor(this.appTheme === 'dark' ? '#1a1a1a' : '#ffffff')
  }
}

// 主题切换组件
@Component
struct ThemeSwitcher {
  @StorageLink(StorageData.THEME_KEY) theme: string = 'light';
  @State isAnimating: boolean = false;
  
  aboutToAppear() {
    console.log('ThemeSwitcher: aboutToAppear')
  }
  
  aboutToDisappear() {
    console.log('ThemeSwitcher: aboutToDisappear')
  }

  build() {
    Row() {
      Text('主题模式')
        .fontSize(16)
        .fontColor(this.theme === 'dark' ? Color.White : Color.Black)
        .flexGrow(1)
      
      Button(this.theme === 'light' ? '🌙' : '☀️')
        .backgroundColor(Color.Transparent)
        .fontSize(24)
        .rotate({ angle: this.isAnimating ? 180 : 0 })
        .animation({
          duration: 500,
          curve: Curve.EaseInOut
        })
        .onClick(() => {
          this.isAnimating = true
          setTimeout(() => {
            this.theme = this.theme === 'light' ? 'dark' : 'light'
            this.isAnimating = false
          }, 250)
        })
    }
    .width('100%')
    .padding(16)
    .backgroundColor(this.theme === 'dark' ? '#2a2a2a' : '#f0f0f0')
    .borderRadius(8)
    .margin(16)
  }
}

// 主要内容组件
@Component
struct MainContent {
  @Prop currentPage: string;
  @State @Watch('onPageDataChange') pageData: string = [];
  @State isLoading: boolean = false;
  
  onPageDataChange() {
    console.log('页面数据发生变化:', this.pageData.length)
    // 可以在这里处理数据变化的副作用
  }
  
  aboutToAppear() {
    console.log('MainContent: aboutToAppear')
    this.loadPageData()
  }
  
  onDidBuild() {
    console.log('MainContent: onDidBuild - 组件构建完成')
  }
  
  private async loadPageData() {
    this.isLoading = true
    console.log(`加载页面数据: ${this.currentPage}`)
    
    // 模拟异步数据加载
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    this.pageData = [
      `${this.currentPage} - 数据1`,
      `${this.currentPage} - 数据2`, 
      `${this.currentPage} - 数据3`
    ]
    
    this.isLoading = false
  }

  @Builder
  pageContentBuilder() {
    if (this.isLoading) {
      Column() {
        LoadingProgress()
          .width(40)
          .height(40)
          .margin({ bottom: 16 })
        
        Text('加载中...')
          .fontSize(14)
          .fontColor(Color.Gray)
      }
      .width('100%')
      .height(200)
      .justifyContent(FlexAlign.Center)
    } else {
      List() {
        ForEach(this.pageData, (item: string, index: number) => {
          ListItem() {
            DataItem({ data: item, index: index })
          }
        }, (item: string) => item)
      }
      .width('100%')
      .layoutWeight(1)
    }
  }

  build() {
    Column() {
      // 页面导航
      Row() {
        ['home', 'profile', 'settings'].forEach((page: string) => {
          Button(page)
            .fontSize(14)
            .backgroundColor(this.currentPage === page ? Color.Blue : Color.Gray)
            .fontColor(Color.White)
            .borderRadius(16)
            .padding({ left: 16, right: 16, top: 8, bottom: 8 })
            .margin({ right: 8 })
            .onClick(() => {
              if (this.currentPage !== page) {
                this.onPageChange(page)
                this.loadPageData()
              }
            })
        })
      }
      .width('100%')
      .padding(16)
      .justifyContent(FlexAlign.Start)
      
      // 页面内容
      this.pageContentBuilder()
    }
    .width('100%')
    .layoutWeight(1)
  }
}

// 数据项组件
@Component
struct DataItem {
  @Prop data: string;
  @Prop index: number;
  @State isVisible: boolean = false;
  
  aboutToAppear() {
    console.log(`DataItem ${this.index}: aboutToAppear`)
    // 添加延迟动画效果
    setTimeout(() => {
      this.isVisible = true
    }, this.index * 100)
  }
  
  aboutToDisappear() {
    console.log(`DataItem ${this.index}: aboutToDisappear`)
  }
  
  onVisibleAreaChange(isVisible: boolean, currentRatio: number) {
    console.log(`DataItem ${this.index}: 可见性变化 - ${isVisible}, 比例: ${currentRatio}`)
  }

  build() {
    Row() {
      Text(`${this.index + 1}`)
        .fontSize(16)
        .fontWeight(FontWeight.Bold)
        .width(30)
        .textAlign(TextAlign.Center)
        .backgroundColor(Color.Blue)
        .fontColor(Color.White)
        .borderRadius(15)
        .margin({ right: 12 })
      
      Text(this.data)
        .fontSize(14)
        .flexGrow(1)
        .fontColor(Color.Black)
    }
    .width('100%')
    .padding(12)
    .backgroundColor(Color.White)
    .borderRadius(8)
    .margin({ horizontal: 16, vertical: 4 })
    .opacity(this.isVisible ? 1 : 0)
    .translate({ x: this.isVisible ? 0 : 50 })
    .animation({
      duration: 300,
      curve: Curve.EaseOut
    })
    .onVisibleAreaChange([0.0, 1.0], (isVisible: boolean, currentRatio: number) => {
      this.onVisibleAreaChange(isVisible, currentRatio)
    })
  }
}

// 设置面板组件
@Component
struct SettingsPanel {
  @StorageLink(StorageData.USER_SETTINGS_KEY) settings: UserSettings = new UserSettings();
  @LocalStorageLink('panelExpanded') @Watch('onPanelStateChange') isExpanded: boolean = false;
  @State inputUsername: string = '';
  @State inputEmail: string = '';
  
  onPanelStateChange() {
    console.log('设置面板状态变化:', this.isExpanded ? '展开' : '收起')
  }
  
  aboutToAppear() {
    console.log('SettingsPanel: aboutToAppear')
    this.inputUsername = this.settings.username
    this.inputEmail = this.settings.email
  }
  
  private saveSettings() {
    this.settings.username = this.inputUsername
    this.settings.email = this.inputEmail
    console.log('设置已保存:', this.settings)
  }

  @Builder
  settingFormBuilder() {
    Column() {
      TextInput({ 
        placeholder: '用户名', 
        text: this.inputUsername 
      })
        .width('100%')
        .margin({ bottom: 8 })
        .onChange((value: string) => {
          this.inputUsername = value
        })
      
      TextInput({ 
        placeholder: '邮箱', 
        text: this.inputEmail 
      })
        .width('100%')
        .margin({ bottom: 8 })
        .onChange((value: string) => {
          this.inputEmail = value
        })
      
      Row() {
        Text('推送通知')
          .fontSize(14)
          .flexGrow(1)
        
        Toggle({ 
          type: ToggleType.Switch, 
          isOn: this.settings.notifications 
        })
          .selectedColor(Color.Blue)
          .onChange((isOn: boolean) => {
            this.settings.notifications = isOn
          })
      }
      .width('100%')
      .alignItems(VerticalAlign.Center)
      .margin({ bottom: 8 })
      
      Row() {
        Text('自动保存')
          .fontSize(14)
          .flexGrow(1)
        
        Toggle({ 
          type: ToggleType.Switch, 
          isOn: this.settings.autoSave 
        })
          .selectedColor(Color.Green)
          .onChange((isOn: boolean) => {
            this.settings.autoSave = isOn
          })
      }
      .width('100%')
      .alignItems(VerticalAlign.Center)
      .margin({ bottom: 16 })
      
      Button('保存设置')
        .width('100%')
        .backgroundColor(Color.Orange)
        .onClick(() => {
          this.saveSettings()
        })
    }
    .width('100%')
    .padding(16)
  }

  build() {
    Column() {
      // 面板标题
      Row() {
        Text('用户设置')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .flexGrow(1)
        
        Button(this.isExpanded ? '▲' : '▼')
          .backgroundColor(Color.Transparent)
          .fontSize(12)
          .onClick(() => {
            animateTo({
              duration: 300,
              curve: Curve.EaseInOut
            }, () => {
              this.isExpanded = !this.isExpanded
            })
          })
      }
      .width('100%')
      .padding(16)
      .backgroundColor('#e0e0e0')
      .onClick(() => {
        this.isExpanded = !this.isExpanded
      })
      
      // 可展开的设置表单
      if (this.isExpanded) {
        this.settingFormBuilder()
      }
    }
    .width('100%')
    .backgroundColor(Color.White)
    .borderRadius(8)
    .margin(16)
    .clipContent()
  }
}