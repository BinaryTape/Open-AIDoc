[//]: # (title: Compose Multiplatform 1.10.3 最新变化)

以下是此功能版本的高亮内容：

 * [统一的 `@Preview` 注解](#unified-preview-annotation)
 * [支持 Navigation 3](#support-for-navigation-3)
 * [捆绑的 Compose Hot Reload](#compose-hot-reload-integration)

您可以在 [GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.10.0) 上找到此版本的完整变更列表。
有关特定组件版本的详细信息，请参阅 [依赖项](#dependencies) 部分。

## 破坏性变更与弃用

### 已弃用的依赖项别名

Compose Multiplatform Gradle 插件（`compose.ui` 等）支持的依赖项别名在 1.10.0-beta01 版本中已弃用。
我们鼓励您在版本目录（version catalogs）中添加直接的库引用。
相应的弃用通知中提供了具体的参考建议。

这一变化应该会让 Compose Multiplatform 库的依赖管理变得更加透明。
未来，我们希望为 Compose Multiplatform 提供一个 BOM，以简化兼容版本的设置。

### 已弃用的 `PredictiveBackHandler()`

Compose Multiplatform 中引入了 `PredictiveBackHandler()` 函数，旨在将原生 Android 的预测性返回导航手势引入其他平台。
随着 Navigation 3 的发布，旧的实现已被弃用，取而代之的是新的 [Navigation Event](https://developer.android.com/jetpack/androidx/releases/navigationevent) 库及其 API。
具体而言，您现在应该使用包装了更通用的 `NavigationEventHandler()` 实现的新 `NavigationBackHandler()` 函数，而不是使用 `PredictiveBackHandler()` 函数。

最简单的迁移示例如下：

<compare type="top-bottom">
    <code-block lang="kotlin" code="         PredictiveBackHandler(enabled = true) { progress -&gt;&#10;            try {&#10;                progress.collect { event -&gt;&#10;                    // 制作返回手势进度的动画&#10;                }&#10;                // 处理已完成的返回手势&#10;            } catch(e: Exception) {&#10;                // 处理已取消的返回手势&#10;            }&#10;        }"></code-block>
    <code-block lang="kotlin" code="        // 使用空状态作为存根以满足所需的实参&#10;        val navState = rememberNavigationEventState(NavigationEventInfo.None)&#10;        NavigationBackHandler(&#10;            state = navState,&#10;            isBackEnabled = true,&#10;            onBackCancelled = {&#10;                // 处理已取消的返回手势&#10;            },&#10;            onBackCompleted = {&#10;              // 处理已完成的返回手势&#10;            }&#10;        )&#10;        LaunchedEffect(navState.transitionState) {&#10;            val transitionState = navState.transitionState&#10;            if (transitionState is NavigationEventTransitionState.InProgress) {&#10;                val progress = transitionState.latestEvent.progress&#10;                // 制作返回手势进度的动画&#10;            }&#10;        }"></code-block>
</compare>

说明：

* `state` 参数是强制性的：`NavigationEventInfo` 旨在保存有关 UI 状态的上下文信息。
  如果您目前没有任何要存储的信息，可以使用 `NavigationEventInfo.None` 作为存根。
* `onBack` 参数已被拆分为 `onBackCancelled` 和 `onBackCompleted`，因此您无需单独跟踪取消的手势。
* `NavigationEventState.transitionState` 属性有助于跟踪物理手势的进度。

有关实现的详细信息，请参阅 [Navigation Event API 参考中的 NavigationEventHandler 页面](https://developer.android.com/reference/kotlin/androidx/navigationevent/NavigationEventHandler)。

### 提高了最低 Kotlin 版本要求

如果您的项目包含原生或 Web 目标，最新的功能需要升级到 Kotlin 2.2.20。

## 跨平台

### 统一的 `@Preview` 注解

我们统一了各平台的预览方法。
您现在可以在 `commonMain` 源集中使用 `androidx.compose.ui.tooling.preview.Preview` 注解。

所有其他注解，例如 `org.jetbrains.compose.ui.tooling.preview.Preview` 以及特定于桌面端的 `androidx.compose.desktop.ui.tooling.preview.Preview`，均已弃用。

### 自动调整互操作视图的大小

Compose Multiplatform 现在支持在桌面端和 iOS 端自动调整原生互操作元素的大小。
这些元素现在可以根据其内容调整布局，从而无需手动计算精确大小并提前指定固定维度。

* 在桌面端，`SwingPanel` 会根据嵌入组件的最小、首选和最大尺寸自动调整其大小。
* 在 iOS 端，UIKit 互操作视图现在支持根据视图的拟合大小（固有内容大小）进行调整。
  这实现了对 SwiftUI 视图（通过 `UIHostingController`）以及不依赖于 `NSLayoutConstraints` 的基本 `UIView` 子类的正确包装。

### 稳定的 `Popup` 和 `Dialog` 属性

`DialogProperties` 中的以下属性已提升为稳定版本，不再是实验性的：
`usePlatformInsets`、`useSoftwareKeyboardInset` 和 `scrimColor`。

同样，`PopupProperties` 中的 `usePlatformDefaultWidth` 和 `usePlatformInsets` 属性也已提升为稳定版本。

不带 `PopupProperties` 参数的 `Popup` 重载的弃用级别已更改为 `ERROR`，以强制使用更新后的 API。

### Skia 已更新至 Milestone 138

通过 Skiko，Compose Multiplatform 使用的 Skia 版本已更新至 Milestone 138。

之前使用的 Skia 版本是 Milestone 132。
您可以在 [发行说明](https://skia.googlesource.com/skia/+/refs/heads/chrome/m138/RELEASE_NOTES.md) 中查看这些版本之间的变更。

### 支持 Navigation 3
<primary-label ref="Experimental"/>

Navigation 3 是一个专为配合 Compose 工作而设计的新导航库。
通过 Navigation 3，您可以完全控制返回栈，并且导航到目的地或从目的地返回就像从列表中添加和删除项目一样简单。
您可以阅读 [Navigation 3 文档](https://developer.android.com/guide/navigation/navigation-3) 以及发布 [博客文章](https://android-developers.googleblog.com/2025/05/announcing-jetpack-navigation-3-for-compose.html) 来了解新的指导原则和决策。

Compose Multiplatform 1.10.0-beta01 为在非 Android 目标上使用新的导航 API 提供了 Alpha 支持。
发布的跨平台构件有：

* Navigation 3 UI 库：`org.jetbrains.androidx.navigation3:navigation3-ui`
* 用于 Navigation 3 的 ViewModel：`org.jetbrains.androidx.lifecycle:lifecycle-viewmodel-navigation3`
* 用于 Navigation 3 的 Material 3 自适应布局：`org.jetbrains.compose.material3.adaptive:adaptive-navigation3`

您可以在从原始 Android 仓库镜像的 [nav3-recipes](https://github.com/terrakok/nav3-recipes) 示例中找到跨平台 Navigation 3 实现的示例。

一些特定于平台的实现细节：

* 在 iOS 端，您现在可以使用 [EndEdgePanGestureBehavior](https://github.com/JetBrains/compose-multiplatform-core/pull/2519) 选项（默认 `Disabled`）来管理终端边缘 [平移手势](https://developer.apple.com/documentation/uikit/handling-pan-gestures) 的导航。
  这里的“终端边缘”是指 LTR 界面中的屏幕右边缘和 RTL 界面中的左边缘。
  起始边缘与终端边缘相反，始终绑定到返回手势。
* 在 Web 应用中，在桌面浏览器中按 **Esc** 键现在会将用户返回到上一个屏幕（并关闭对话框、弹出窗口和某些微件，如 Material 3 的 `SearchBar`），就像在桌面端应用中一样。
* 对 [浏览器历史记录导航](compose-navigation-routing.md#support-for-browser-navigation-in-web-apps) 以及在地址栏中使用目的地的支持将不会随 Compose Multiplatform 1.10 扩展到 Navigation 3。
  这已被推迟到跨平台库的后续版本中。

## iOS

### 窗口内边距 (Window insets)

Compose Multiplatform 现在支持 `WindowInsetsRulers`，它提供了根据窗口内边距（如状态栏、导航栏或屏幕键盘）定位 UI 元素并调整其大小的功能。

这种管理窗口内边距的新方法使用单一实现来检索特定于平台的窗口内边距数据。
这意味着 `WindowInsets` 和 `WindowInsetsRulers` 都使用通用的机制来一致地管理内边距。

> 以前，`WindowInsets.Companion.captionBar` 未标记为 `@Composable`。
> 我们添加了 `@Composable` 特性以使其在各平台上的行为保持一致。
> 
{style="note"}

### 改进的 IME 配置

继 [1.9.0 中引入](whats-new-compose-190.md#ime-options) 的特定于 iOS 的 IME 自定义之后，此版本添加了用于配置带有 `PlatformImeOptions` 的文本输入视图的新 API。

这些新 API 允许在字段获取焦点并触发 IME 时自定义输入界面：

 * `UIResponder.inputView` 指定一个自定义输入视图来替换默认的系统键盘。
 * `UIResponder.inputAccessoryView` 定义一个自定义辅助视图，该视图在 IME 激活时附加到系统键盘或自定义 `inputView` 后挂载。

### 互操作视图的叠加层放置
<primary-label ref="Experimental"/>

您现在可以使用实验性的 `placedAsOverlay` 标志将 `UIKitView` 和 `UIKitViewController` 视图放置在 Compose UI 之上。
该标志允许互操作视图支持透明背景和原生着色器效果。

要将互操作视图渲染为叠加层，请使用 `@OptIn(ExperimentalComposeUiApi::class)` 注解，并在 `UIKitInteropProperties` 中将 `placedAsOverlay` 参数设置为 `true`：

```kotlin
UIKitViewController(
    modifier = modifier,
    update = {},
    factory = { factory.createNativeMap() },
    properties = UIKitInteropProperties(placedAsOverlay = true)
)
```

请记住，此配置会将视图渲染在 Compose UI 层之上；因此，它在视觉上会覆盖位于同一区域的任何其他可组合项。

## Web

### 资源缓存
<primary-label ref="Experimental"/>

Compose Multiplatform 现在使用 [Web Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache) 来缓存静态资产和字符串资源的成功响应。
这种方法避免了与浏览器默认缓存相关的延迟，浏览器默认缓存通过重复的 HTTP 请求来验证存储的内容，并且在低带宽连接上可能特别慢。
缓存在每次应用启动或页面刷新时都会被清除，以确保资源与应用程序的当前状态保持一致。

有关更多详细信息，请参阅 [拉取请求](https://github.com/JetBrains/compose-multiplatform/pull/5379) 和 [缓存 Web 资源](compose-web-resources.md#caching-web-resources) 文档。

## 桌面端

### Compose Hot Reload 集成

Compose Hot Reload 插件现在与 Compose Multiplatform Gradle 插件捆绑在一起。
您不再需要单独配置 Hot Reload 插件，因为它在针对桌面端的 Compose Multiplatform 项目中默认启用。

对于明确声明了 Compose Hot Reload 插件的项目，这意味着：

 * 您可以安全地移除该声明，以便使用 Compose Multiplatform Gradle 插件提供的版本。
 * 如果您选择保留特定的版本声明，则将使用该版本而不是捆绑的版本。

捆绑的 Compose Hot Reload Gradle 插件的最低 Kotlin 版本为 2.1.20。
如果检测到较旧版本的 Kotlin，热重载功能将被禁用。

## Gradle

### 支持 AGP 9.0.0

Compose Multiplatform 引入了对 Android Gradle 插件 (AGP) 9.0.0 版本的支持。
为了与新的 AGP 版本兼容，请确保升级到 Compose Multiplatform 1.9.3 或 1.10.0。

为了让更新过程在长期内更加顺畅，我们建议将您的项目结构更改为使用专用的 Android 应用程序模块。

## 依赖项

| 库 | Maven 坐标 | 基于 Jetpack 版本 |
|--------------------|------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Runtime | `org.jetbrains.compose.runtime:runtime*:1.10.3` | [Runtime 1.10.5](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.10.5) |
| UI | `org.jetbrains.compose.ui:ui*:1.10.3` | [UI 1.10.5](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.10.5) |
| Foundation | `org.jetbrains.compose.foundation:foundation*:1.10.3` | [Foundation 1.10.5](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.10.5) |
| Material | `org.jetbrains.compose.material:material*:1.10.3` | [Material 1.10.5](https://developer.android.com/jetpack/androidx/releases/compose-material#1.10.5) |
| Material3 | `org.jetbrains.compose.material3:material3*:1.10.0-alpha05` | [Material3 1.5.0-alpha08](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.5.0-alpha08) |
| Material3 Adaptive | `org.jetbrains.compose.material3.adaptive:adaptive*:1.3.0-alpha02` | [Material3 Adaptive 1.3.0-alpha03](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.3.0-alpha03) |
| Lifecycle | `org.jetbrains.androidx.lifecycle:lifecycle-*:2.10.0` | [Lifecycle 2.10.0](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.10.0) |
| Navigation | `org.jetbrains.androidx.navigation:navigation-*:2.9.2` | [Navigation 2.9.7](https://developer.android.com/jetpack/androidx/releases/navigation#2.9.7) |
| Navigation3 | `org.jetbrains.androidx.navigation3:navigation3-*:1.0.0-alpha06` | [Navigation3 1.0.0](https://developer.android.com/jetpack/androidx/releases/navigation3#1.0.0) |
| Navigation Event | `org.jetbrains.androidx.navigationevent:navigationevent-compose:1.0.1` | [Navigation Event 1.0.2](https://developer.android.com/jetpack/androidx/releases/navigationevent#1.0.2) |
| Savedstate | `org.jetbrains.androidx.savedstate:savedstate*:1.4.0` | [Savedstate 1.4.0](https://developer.android.com/jetpack/androidx/releases/savedstate#1.4.0) |
| WindowManager Core | `org.jetbrains.androidx.window:window-core:1.5.1` | [WindowManager 1.5.1](https://developer.android.com/jetpack/androidx/releases/window#1.5.1) |