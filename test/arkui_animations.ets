// ArkUI动画和转场效果测试用例
// 测试各种动画API和转场特效

@Component
struct AnimationTest {
  @State rotateAngle: number = 0;
  @State scaleValue: number = 1;
  @State translateX: number = 0;
  @State translateY: number = 0;
  @State opacity: number = 1;
  @State isVisible: boolean = true;
  @State backgroundColor: Color = Color.Blue;

  build() {
    Column({ space: 20 }) {
      Text('ArkUI动画测试')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .textAlign(TextAlign.Center)
        .width('100%')

      // 基础动画测试
      Text('基础动画')
        .fontSize(18)
        .fontWeight(FontWeight.Bold)

      // 旋转动画
      Button('旋转动画')
        .width(120)
        .height(40)
        .backgroundColor(Color.Red)
        .rotate({ x: 0, y: 0, z: 1, angle: this.rotateAngle })
        .animation({
          duration: 1000,
          curve: Curve.EaseInOut,
          iterations: 1,
          playMode: PlayMode.Normal
        })
        .onClick(() => {
          this.rotateAngle += 360
        })

      // 缩放动画
      Button('缩放动画')
        .width(120)
        .height(40)
        .backgroundColor(Color.Green)
        .scale({ x: this.scaleValue, y: this.scaleValue })
        .animation({
          duration: 800,
          curve: Curve.Elastic,
          iterations: 1,
          playMode: PlayMode.Alternate
        })
        .onClick(() => {
          this.scaleValue = this.scaleValue === 1 ? 1.5 : 1
        })

      // 位移动画
      Button('位移动画')
        .width(120)
        .height(40)
        .backgroundColor(Color.Orange)
        .translate({ x: this.translateX, y: this.translateY })
        .animation({
          duration: 600,
          curve: Curve.Linear,
          iterations: 1,
          playMode: PlayMode.Normal
        })
        .onClick(() => {
          this.translateX = this.translateX === 0 ? 100 : 0
          this.translateY = this.translateY === 0 ? 50 : 0
        })

      // 透明度动画
      Button('透明度动画')
        .width(120)
        .height(40) 
        .backgroundColor(Color.Purple)
        .opacity(this.opacity)
        .animation({
          duration: 1000,
          curve: Curve.EaseOut,
          iterations: 1,
          playMode: PlayMode.Normal
        })
        .onClick(() => {
          this.opacity = this.opacity === 1 ? 0.3 : 1
        })

      // 显示隐藏动画
      Column() {
        if (this.isVisible) {
          Text('可见性切换')
            .fontSize(16)
            .fontColor(Color.White)
            .backgroundColor(Color.Pink)
            .padding(10)
            .borderRadius(8)
            .transition({
              type: TransitionType.Insert,
              opacity: 0,
              translate: { x: 0, y: -50 }
            })
            .transition({
              type: TransitionType.Delete,
              opacity: 0,
              translate: { x: 0, y: 50 }
            })
        }
        
        Button('切换显示')
          .width(120)
          .height(40)
          .backgroundColor(Color.Gray)
          .margin({ top: 10 })
          .onClick(() => {
            animateTo({
              duration: 500,
              curve: Curve.EaseInOut
            }, () => {
              this.isVisible = !this.isVisible
            })
          })
      }

      // 组合动画测试
      Text('组合动画')
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .margin({ top: 20 })

      Button('组合动画')
        .width(150)
        .height(50)
        .backgroundColor(this.backgroundColor)
        .fontColor(Color.White)
        .borderRadius(25)
        .scale({ x: this.scaleValue, y: this.scaleValue })
        .rotate({ x: 0, y: 0, z: 1, angle: this.rotateAngle })
        .opacity(this.opacity)
        .animation({
          duration: 1200,
          curve: Curve.Friction,
          iterations: 1,
          playMode: PlayMode.Normal,
          delay: 100
        })
        .onClick(() => {
          // 使用animateTo实现复杂动画
          animateTo({
            duration: 1000,
            curve: Curve.EaseInOut,
            iterations: 1,
            playMode: PlayMode.Normal,
            onFinish: () => {
              console.log('动画完成')
            }
          }, () => {
            this.rotateAngle += 180
            this.scaleValue = this.scaleValue === 1 ? 1.2 : 1
            this.backgroundColor = this.backgroundColor === Color.Blue ? Color.Red : Color.Blue
          })
        })

      // 关键帧动画测试
      Text('关键帧动画')
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .margin({ top: 20 })

      Row() {
        Text('🚀')
          .fontSize(30)
          .translate({ x: this.translateX * 2, y: 0 })
          .animation({
            duration: 2000,
            curve: Curve.FastOutSlowIn,
            iterations: -1, // 无限循环
            playMode: PlayMode.Alternate
          })
      }
      .width('100%')
      .height(50)
      .justifyContent(FlexAlign.Start)
      .alignItems(VerticalAlign.Center)
      .onAppear(() => {
        // 自动启动动画
        this.translateX = 200
      })

      // 弹簧动画测试
      Button('弹簧动画')
        .width(140)
        .height(45)
        .backgroundColor(Color.Cyan)
        .scale({ x: this.scaleValue, y: this.scaleValue })
        .animation({
          duration: 800,
          curve: Curve.Spring,
          iterations: 1,
          playMode: PlayMode.Normal
        })
        .onClick(() => {
          this.scaleValue = this.scaleValue === 1 ? 0.8 : 1
        })

      // 路径动画测试（模拟）
      Text('路径动画')
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .margin({ top: 20 })

      Stack() {
        Text('⭐')
          .fontSize(20)
          .translate({ 
            x: Math.cos(this.rotateAngle * Math.PI / 180) * 50,
            y: Math.sin(this.rotateAngle * Math.PI / 180) * 50
          })
          .animation({
            duration: 3000,
            curve: Curve.Linear,
            iterations: -1,
            playMode: PlayMode.Normal
          })
      }
      .width(120)
      .height(120)
      .backgroundColor(Color.Yellow)
      .borderRadius(60)
      .onAppear(() => {
        // 圆形路径动画
        setInterval(() => {
          this.rotateAngle += 1
        }, 50)
      })
    }
    .width('100%')
    .height('100%')
    .padding(20)
    .backgroundColor('#F8F8F8')
  }
}