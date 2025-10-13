// ArkUI事件处理和数据绑定测试用例
// 测试各种事件回调、手势识别、数据绑定等

import { promptAction } from '@kit.ArkUI'

// 事件数据模型
@Observed
class EventData {
  clickCount: number = 0
  lastEventType: string = ''
  lastEventTime: string = ''
  gestureInfo: string = ''
  
  updateEvent(type: string) {
    this.lastEventType = type
    this.lastEventTime = new Date().toLocaleTimeString()
    if (type === 'click') {
      this.clickCount++
    }
  }
}

// 主事件测试组件
@Component
struct EventHandlingTest {
  @State eventData: EventData = new EventData()
  @State currentValue: number = 0
  @State inputText: string = ''
  @State selectedColor: Color = Color.Blue
  @State dragOffset: Position = { x: 0, y: 0 }
  @State scaleValue: number = 1
  @State rotateAngle: number = 0

  // 基础点击事件处理
  private handleBasicClick(eventType: string) {
    this.eventData.updateEvent(eventType)
    console.log(`事件触发: ${eventType}`)
  }

  // 长按事件处理
  private handleLongPress() {
    this.eventData.updateEvent('longpress')
    promptAction.showToast({
      message: '长按事件触发',
      duration: 2000
    })
  }

  // 双击事件处理
  private handleDoubleClick() {
    this.eventData.updateEvent('doubleclick')
    this.selectedColor = this.selectedColor === Color.Blue ? Color.Red : Color.Blue
  }

  // 拖拽事件处理
  private handleDrag(event: DragEvent) {
    this.dragOffset.x = event.getX()
    this.dragOffset.y = event.getY()
    this.eventData.gestureInfo = `拖拽位置: (${Math.round(this.dragOffset.x)}, ${Math.round(this.dragOffset.y)})`
  }

  // 手势事件处理
  private handlePinchGesture(event: GestureEvent) {
    if (event.scale) {
      this.scaleValue = event.scale
      this.eventData.gestureInfo = `缩放倍数: ${this.scaleValue.toFixed(2)}`
    }
  }

  private handleRotateGesture(event: GestureEvent) {
    if (event.angle) {
      this.rotateAngle = event.angle
      this.eventData.gestureInfo = `旋转角度: ${this.rotateAngle.toFixed(1)}°`
    }
  }

  build() {
    Scroll() {
      Column({ space: 15 }) {
        // 标题和事件状态显示
        Text('ArkUI事件处理测试')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .textAlign(TextAlign.Center)
          .width('100%')

        // 事件状态显示卡片
        Column() {
          Text('事件状态')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .margin({ bottom: 10 })

          Text(`点击次数: ${this.eventData.clickCount}`)
            .fontSize(14)
            .margin({ bottom: 5 })

          Text(`最后事件: ${this.eventData.lastEventType}`)
            .fontSize(14)
            .margin({ bottom: 5 })

          Text(`事件时间: ${this.eventData.lastEventTime}`)
            .fontSize(14)
            .margin({ bottom: 5 })

          Text(`手势信息: ${this.eventData.gestureInfo}`)
            .fontSize(14)
            .fontColor(Color.Blue)
        }
        .width('100%')
        .padding(15)
        .backgroundColor('#f0f0f0')
        .borderRadius(8)

        // 基础点击事件测试
        Text('基础点击事件')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)

        Row() {
          Button('单击')
            .backgroundColor(Color.Blue)
            .onClick(() => {
              this.handleBasicClick('click')
            })

          Button('双击')
            .backgroundColor(Color.Green)
            .gesture(
              TapGesture({ count: 2 })
                .onAction(() => {
                  this.handleDoubleClick()
                })
            )

          Button('长按')
            .backgroundColor(Color.Orange)
            .gesture(
              LongPressGesture({ repeat: true })
                .onAction(() => {
                  this.handleLongPress()
                })
            )
        }
        .width('100%')
        .justifyContent(FlexAlign.SpaceEvenly)

        // 鼠标事件测试
        Text('鼠标事件')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)

        Text('鼠标交互区域')
          .fontSize(16)
          .textAlign(TextAlign.Center)
          .width(200)
          .height(80)
          .backgroundColor(this.selectedColor)
          .fontColor(Color.White)
          .borderRadius(8)
          .alignSelf(ItemAlign.Center)
          .onMouse((event: MouseEvent) => {
            if (event.action === MouseAction.Press) {
              this.eventData.updateEvent('mousedown')
            } else if (event.action === MouseAction.Release) {
              this.eventData.updateEvent('mouseup')
            }
          })
          .onHover((isHover: boolean) => {
            if (isHover) {
              this.eventData.updateEvent('mouseenter')
            } else {
              this.eventData.updateEvent('mouseleave')
            }
          })

        // 触摸事件测试
        Text('触摸事件')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)

        Text('触摸区域')
          .fontSize(16)
          .textAlign(TextAlign.Center)
          .width(200)
          .height(80)
          .backgroundColor(Color.Purple)
          .fontColor(Color.White)
          .borderRadius(8)
          .alignSelf(ItemAlign.Center)
          .onTouch((event: TouchEvent) => {
            if (event.type === TouchType.Down) {
              this.eventData.updateEvent('touchdown')
            } else if (event.type === TouchType.Up) {
              this.eventData.updateEvent('touchup')
            } else if (event.type === TouchType.Move) {
              this.eventData.updateEvent('touchmove')
            }
          })

        // 拖拽事件测试
        Text('拖拽事件')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)

        Text('拖拽我')
          .fontSize(16)
          .textAlign(TextAlign.Center)
          .width(120)
          .height(60)
          .backgroundColor(Color.Red)
          .fontColor(Color.White)
          .borderRadius(8)
          .translate({ x: this.dragOffset.x / 10, y: this.dragOffset.y / 10 })
          .animation({
            duration: 200,
            curve: Curve.Linear
          })
          .gesture(
            PanGesture()
              .onActionStart((event: GestureEvent) => {
                this.eventData.updateEvent('dragstart')
              })
              .onActionUpdate((event: GestureEvent) => {
                this.dragOffset.x = event.offsetX
                this.dragOffset.y = event.offsetY
                this.eventData.gestureInfo = `拖拽偏移: (${Math.round(this.dragOffset.x)}, ${Math.round(this.dragOffset.y)})`
              })
              .onActionEnd(() => {
                this.eventData.updateEvent('dragend')
              })
          )

        // 手势识别测试
        Text('手势识别')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)

        Text('🎯')
          .fontSize(60)
          .textAlign(TextAlign.Center)
          .width(150)
          .height(150)
          .backgroundColor('#ffe6e6')
          .borderRadius(75)
          .alignSelf(ItemAlign.Center)
          .scale({ x: this.scaleValue, y: this.scaleValue })
          .rotate({ angle: this.rotateAngle })
          .animation({
            duration: 100,
            curve: Curve.Linear
          })
          .parallelGesture(
            PinchGesture()
              .onActionUpdate((event: GestureEvent) => {
                this.handlePinchGesture(event)
              })
          )
          .parallelGesture(
            RotationGesture()
              .onActionUpdate((event: GestureEvent) => {
                this.handleRotateGesture(event)
              })
          )
          .gesture(
            SwipeGesture({ direction: SwipeDirection.All })
              .onAction((event: GestureEvent) => {
                this.eventData.updateEvent('swipe')
                this.eventData.gestureInfo = `滑动方向: ${event.angle}°`
              })
          )

        // 表单控件事件测试
        Text('表单控件事件')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)

        Column() {
          TextInput({ 
            placeholder: '输入文本触发事件', 
            text: this.inputText 
          })
            .width('100%')
            .margin({ bottom: 10 })
            .onChange((value: string) => {
              this.inputText = value
              this.eventData.updateEvent('textchange')
            })
            .onFocus(() => {
              this.eventData.updateEvent('focus')
            })
            .onBlur(() => {
              this.eventData.updateEvent('blur')
            })
            .onSubmit(() => {
              this.eventData.updateEvent('submit')
            })

          Slider({
            value: this.currentValue,
            min: 0,
            max: 100,
            step: 1
          })
            .width('100%')
            .margin({ bottom: 10 })
            .onChange((value: number, mode: SliderChangeMode) => {
              this.currentValue = value
              this.eventData.updateEvent('slidechange')
              this.eventData.gestureInfo = `滑块值: ${value}`
            })

          Toggle({ 
            type: ToggleType.Switch, 
            isOn: false 
          })
            .onChange((isOn: boolean) => {
              this.eventData.updateEvent('togglechange')
              this.eventData.gestureInfo = `开关状态: ${isOn ? '开' : '关'}`
            })

          Button('重置所有状态')
            .width('100%')
            .backgroundColor(Color.Gray)
            .margin({ top: 15 })
            .onClick(() => {
              this.eventData = new EventData()
              this.currentValue = 0
              this.inputText = ''
              this.selectedColor = Color.Blue
              this.dragOffset = { x: 0, y: 0 }
              this.scaleValue = 1
              this.rotateAngle = 0
            })
        }
        .width('100%')
        .padding(15)
        .backgroundColor(Color.White)
        .borderRadius(8)

        // 键盘事件测试
        Text('键盘事件')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)

        TextArea({ 
          placeholder: '在此输入以测试键盘事件...',
          text: this.inputText
        })
          .width('100%')
          .height(100)
          .backgroundColor(Color.White)
          .borderRadius(8)
          .padding(10)
          .onChange((value: string) => {
            this.inputText = value
          })
          .onKeyEvent((event: KeyEvent) => {
            if (event.type === KeyType.Down) {
              this.eventData.updateEvent('keydown')
              this.eventData.gestureInfo = `按键: ${event.keyCode}`
            }
          })

        // 焦点事件测试
        Text('焦点事件')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)

        Row() {
          Button('焦点1')
            .backgroundColor(Color.Cyan)
            .focusable(true)
            .onFocus(() => {
              this.eventData.updateEvent('button1_focus')
            })
            .onBlur(() => {
              this.eventData.updateEvent('button1_blur')
            })

          Button('焦点2')
            .backgroundColor(Color.Pink)
            .focusable(true)
            .onFocus(() => {
              this.eventData.updateEvent('button2_focus')
            })
            .onBlur(() => {
              this.eventData.updateEvent('button2_blur')
            })
        }
        .width('100%')
        .justifyContent(FlexAlign.SpaceEvenly)

        // 组合手势测试
        Text('组合手势')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)

        Text('👋')
          .fontSize(50)
          .textAlign(TextAlign.Center)
          .width(120)
          .height(120)
          .backgroundColor('#e6f3ff')
          .borderRadius(60)
          .alignSelf(ItemAlign.Center)
          .priorityGesture(
            GestureGroup(GestureMode.Parallel,
              TapGesture({ count: 2 })
                .onAction(() => {
                  this.eventData.updateEvent('doubletap')
                  this.selectedColor = Color.Random
                }),
              LongPressGesture({ repeat: false, duration: 500 })
                .onAction(() => {
                  this.eventData.updateEvent('longpress_combined')
                })
            )
          )
      }
      .width('100%')
      .padding(20)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#f8f8f8')
  }
}