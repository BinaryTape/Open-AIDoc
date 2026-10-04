[//]: # (title: iOS 迁移指南)

本页面将引导你了解在项目中将 Compose Multiplatform 库升级到较新版本（从 1.7.0 开始）时，与 iOS 相关的注意事项。

## Compose Multiplatform 1.6.11 到 1.7.0 {id="compose-multiplatform-1-6-11-to-1-7-0"}

### 移除了 UIKitView 和 UIKitViewController 中的 background 形参 {id="removed-background-parameter-in-uikitview-and-uikitviewcontroller"}

已弃用的 `UIKitView` 和 `UIKitViewController` API 包含 `background` 形参，而新的 API 则没有。该形参被视为冗余并已移除：

* 如果你需要为新实例设置互操作视图的背景，可以使用 `factory` 形参来实现。
* 如果你需要背景可更新，请将相应代码放入 `update` lambda 中。

### 触摸或手势可能无法按预期工作 {id="touches-or-gestures-may-stop-working-as-expected"}

全新的默认[触摸行为](compose-ios-touch.md)通过延迟来确定触摸是针对互操作视图还是针对该视图的 Compose 容器：用户必须保持静止至少 150 ms，互操作视图才会接收到该触摸。

如果你需要 Compose Multiplatform 像以前一样处理触摸，请考虑使用新的实验性 `UIKitInteropProperties` 构造函数。
它具有 `interactionMode` 形参，你可以将其设置为 `UIKitInteropInteractionMode.NonCooperative`，以使 Compose 直接将触摸传递给互操作视图。

该构造函数被标记为实验性，因为我们的最终目标是用单个布尔标记来描述互操作视图的可交互性。
在 `interactionMode` 形参中显式描述的行为在未来很有可能会自动推导。

### accessibilityEnabled 已被 isNativeAccessibilityEnabled 取代，且默认关闭 {id="accessibilityenabled-replaced-by-isnativeaccessibilityenabled-and-turned-off-by-default"}

旧 `UIKitView` 和 `UIKitViewController` 构造函数的 `accessibilityEnabled` 形参已被移动并重命名，作为 `UIKitInteropProperties.isNativeAccessibilityEnabled` 属性提供。
它在默认情况下也被设置为 `false`。

`isNativeAccessibilityEnabled` 属性会通过原生无障碍解析影响合并的 Compose 子树。
因此，除非你需要互操作视图具备丰富的无障碍功能（例如 Web 视图），否则不建议将其设置为 true。

有关此属性及其默认值背后的设计考量，请参阅 [`UIKitInteropProperties` 类的代码内文档](https://github.com/JetBrains/compose-multiplatform-core/blob/jb-main/compose/ui/ui/src/uikitMain/kotlin/androidx/compose/ui/viewinterop/UIKitInteropProperties.uikit.kt)。

### 移除了 onResize 形参 {id="onresize-parameter-removed"}

旧 `UIKitView` 和 `UIKitViewController` 构造函数的 `onResize` 形参会根据 `rect` 实参设置自定义 frame，但不会影响 Compose 布局本身，因此使用起来不够直观。
最重要的是，`onResize` 形参的默认实现需要正确设置互操作视图的 frame，并且包含了一些关于正确裁剪视图的实现细节。

如何在没有 `onResize` 的情况下进行适配：

* 如果你需要对互操作视图的 frame 变化做出响应，你可以：
    * 重写互操作 `UIView` 的 [`layoutSubviews`](https://developer.apple.com/documentation/uikit/uiview/1622482-layoutsubviews)，
    * 重写互操作 `UIViewController` 的 [`viewDidLayoutSubviews`](https://developer.apple.com/documentation/uikit/uiviewcontroller/1621398-viewdidlayoutsubviews)，
    * 或者在 `Modifier` 链中添加 `onGloballyPositioned`。
* 如果你需要设置互操作视图的 frame，请使用对应的 Compose 修饰符：`size`、`fillMaxSize` 等。

### 某些 onReset 使用模式已失效 {id="some-onreset-usage-patterns-were-invalidated"}

将非 null 的 `onReset` lambda 与 `remember { UIView() }` 配合使用是不正确的。

请看以下代码：

```kotlin
val view = remember { UIView() }

UIKitView(factory = { view }, onReset = { /* ... */ })
```

当 `UIKitView` 进入组合时，只会调用 `factory` 或 `onReset` 其中的一个，绝不会两者都调用。
因此，如果 `onReset` 不为 null，通过 `remember` 记住的 `view` 可能与屏幕上显示的视图不一致：
可组合项离开组合时可能会遗留一个视图实例，该实例将在 `onReset` 中重置后被复用，而不是使用 `factory` 分配新实例。

为了避免此类错误，请勿在构造函数中指定 `onReset` 的值。
你可能需要根据发出该视图的函数进入组合时的上下文，从互操作视图内部执行回调：
在此情况下，可考虑在 `onReset` 时使用 `update` 将回调存储在视图内部。