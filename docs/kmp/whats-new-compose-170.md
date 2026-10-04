[//]: # (title: Compose Multiplatform 1.7.3 最新变化)

以下是本次功能发布的主要亮点：

* [类型安全 Navigation](#type-safe-navigation)
* [共享元素转场](#shared-element-transitions)
* [多平台资源打包到 Android assets](#resources-packed-into-android-assets)
* [自定义资源目录](#custom-resource-directories)
* [支持多平台测试资源](#support-for-multiplatform-test-resources)
* [改进 iOS 上的触摸互操作](#new-default-behavior-for-processing-touch-in-ios-native-elements)
* [Material3 `adaptive` 和 `material3-window-size-class` 现已进入通用代码](#material3-adaptive-adaptive)
* [桌面端已实现拖放](#drag-and-drop)
* [桌面端采用 `BasicTextField`](#basictextfield-renamed-from-basictextfield2-adopted-on-desktop)

如需查看此版本的完整变更列表，请参阅 [GitHub 页面](https://github.com/JetBrains/compose-multiplatform/blob/master/CHANGELOG.md#170-october-2024)。

## 依赖项 {id="dependencies"}

* Gradle 插件 `org.jetbrains.compose`，版本 1.7.3。基于 Jetpack Compose 库：
  * [Runtime 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.7.5)
  * [UI 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.7.5)
  * [Foundation 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.7.5)
  * [Material 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-material#1.7.5)
  * [Material3 1.3.1](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.3.1)
* Lifecycle 库 `org.jetbrains.androidx.lifecycle:lifecycle-*:2.8.3`。基于 [Jetpack Lifecycle 2.8.5](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.8.5)。
* Navigation 库 `org.jetbrains.androidx.navigation:navigation-*:2.8.0-alpha10`。基于 [Jetpack Navigation 2.8.0](https://developer.android.com/jetpack/androidx/releases/navigation#2.8.0)。
* Material3 Adaptive 库 `org.jetbrains.compose.material3.adaptive:adaptive-*:1.0.0`。基于 [Jetpack Material3 Adaptive 1.0.0](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.0.0)。

## 破坏性变更 {id="breaking-changes"}

### 最低 AGP 版本提升至 8.1.0 {id="minimum-agp-version-raised-to-8-1-0"}

Compose Multiplatform 1.7.0 所使用的 Jetpack Compose 1.7.0 和 Lifecycle 2.8.0 均不支持 AGP 7。
因此，当您更新到 Compose Multiplatform 1.7.3 时，可能也需要升级您的 AGP 依赖项。

> Android Studio 中新实现的 Android 可组合项预览[需要较新的 AGP 版本之一](#resources-packed-into-android-assets)。
>
{style="note"}

### 弃用 Java 资源 API，推荐使用多平台资源库 {id="java-resources-api-is-deprecated-in-favor-of-the-multiplatform-resource-library"}

在此版本中，我们显式弃用了 `compose.ui` 软件包中提供的 Java 资源 API：
`painterResource()`、`loadImageBitmap()`、`loadSvgPainter()` 和 `loadXmlImageVector()` 函数，以及
`ClassLoaderResourceLoader` 类及其依赖的相关函数。

建议迁移到[多平台资源库](compose-multiplatform-resources.md)。
虽然您仍可在 Compose Multiplatform 中使用 Java 资源，但无法享受到框架提供的扩展功能：生成的访问器、多模块支持、本地化等。

如果您仍需访问 Java 资源，可以复制[拉取请求中建议的实现方式](https://github.com/JetBrains/compose-multiplatform-core/pull/1457)，
以确保升级到 Compose Multiplatform 1.7.3 后代码仍能正常工作，并尽可能切换到多平台资源。

### 处理 iOS 原生元素触摸的新默认行为 {id="new-default-behavior-for-processing-touch-in-ios-native-elements"}

在 1.7.3 之前，Compose Multiplatform 无法对落在互操作 UI 视图中的触摸事件做出响应，因此
互操作视图会完全处理这些触摸序列。

Compose Multiplatform 1.7.3 实现了更完善的互操作触摸序列处理逻辑。
默认情况下，初始触摸之后现在会有一段延迟，这有助于父级可组合项了解触摸序列是否旨在与原生视图进行交互，并做出相应反应。

有关更多信息，请参阅[本页 iOS 部分](#ios-touch-interop)的说明
或阅读[该功能的相关文档](compose-ios-touch.md)。

### 在 iOS 上必须禁用最小帧持续时间 {id="disabling-minimum-frame-duration-on-ios-is-mandatory"}

开发者常常忽略关于高刷新率屏幕的打印警告，导致用户无法在其支持 120 Hz 的设备上体验流畅的动画。
现在我们对该检查进行了强制执行。如果在 `Info.plist` 文件中缺少 `CADisableMinimumFrameDurationOnPhone` 属性或将其设置为 `false`，
使用 Compose Multiplatform 构建的应用现在将会崩溃。

您可以通过将 `ComposeUIViewControllerConfiguration.enforceStrictPlistSanityCheck` 属性设置为 `false` 来禁用此行为。

### 桌面端已弃用 Modifier.onExternalDrag {id="deprecated-modifier-onexternaldrag-on-desktop"}

实验性的 `Modifier.onExternalDrag` 及相关 API 已被弃用，取而代之的是全新的 `Modifier.dragAndDropTarget`。
`DragData` 接口已移至 `compose.ui.draganddrop` 软件包中。

如果您在 Compose Multiplatform 1.7.0 中使用已弃用的 API，将会遇到弃用错误。
在 1.8.0 中，`onExternalDrag` 修饰符将被彻底移除。

## 跨平台 {id="across-platforms"}

### 共享元素转场 {id="shared-element-transitions"}

Compose Multiplatform 现在提供了一套 API，用于在共享一致元素的可组合项之间实现无缝转场。
这些转场在导航中通常非常实用，有助于用户跟踪 UI 中变化的轨迹。

有关该 API 的深入探讨，请参阅 [Jetpack Compose 文档](https://developer.android.com/develop/ui/compose/animation/shared-elements)。

### 类型安全 Navigation {id="type-safe-navigation"}

Compose Multiplatform 采用了 Jetpack Compose 沿导航路由传递对象的类型安全方法。
Navigation 2.8.0 中的全新 API 允许 Compose 为您的导航图提供编译时安全性。
这些 API 达成了与基于 XML 导航的 [Safe Args](https://developer.android.com/guide/navigation/use-graph/pass-data#Safe-args) 插件相同的效果。

有关详细信息，请参阅 [Google 关于 Navigation Compose 中类型安全的文档](https://developer.android.com/guide/navigation/design/type-safety)。

### 多平台资源 {id="multiplatform-resources"}

#### 多平台资源打包到 Android assets {id="resources-packed-into-android-assets"}

所有多平台资源现在都会打包到 Android assets 中。这使得 Android Studio 能够为 Android 源集中的 Compose Multiplatform 可组合项生成预览。

> Android Studio 预览仅适用于 Android 源集中的可组合项。
> 同时还需要较新的 AGP 版本之一：8.5.2、8.6.0-rc01 或 8.7.0-alpha04。
>
{style="note"}

这也使得 Android 上的 WebView 和媒体播放器组件可以直接访问多平台资源，
因为可以通过简单的路径访问资源，例如 `Res.getUri(“files/index.html”)`。

下面是一个显示资源 HTML 页面（带有指向资源图片的链接）的 Android 可组合项示例：

```kotlin
// androidMain/kotlin/com/example/webview/App.kt
@OptIn(ExperimentalResourceApi::class)
@Composable
@Preview
fun App() {
    MaterialTheme {
        val uri = Res.getUri("files/webview/index.html")

        // Adding a WebView inside AndroidView with layout as full screen.
        AndroidView(factory = {
            WebView(it).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
            }
        }, update = {
            it.loadUrl(uri)
        })
    }
}
```
{initial-collapse-state="collapsed" collapsible="true"  collapsed-title="AndroidView(factory = { WebView(it).apply"}

该示例配合如下简单的 HTML 文件运行：

```html
<html>
<header>
    <title>
        Cat Resource
    </title>
</header>
<body>
    <img src="cat.jpg">
</body>
</html>
```
{initial-collapse-state="collapsed" collapsible="true"  collapsed-title="<title>Cat Resource</title>"}

本例中的两个资源文件均位于 `commonMain` 源集中：

![composeResources 目录的文件结构](compose-resources-android-webview.png){width="230"}

#### 自定义资源目录 {id="custom-resource-directories"}

借助配置 DSL 中的新 `customDirectory` 设置，您可以将[自定义目录与特定源集相关联](compose-multiplatform-resources-setup.md#custom-resource-directories)。这样一来，您就可以将下载的文件用作资源等。

#### 多平台字体缓存 {id="multiplatform-font-cache"}

Compose Multiplatform 将 Android 的字体缓存功能引入到了其他平台，
消除了对 `Font` 资源的重复字节读取。

#### 支持多平台测试资源 {id="support-for-multiplatform-test-resources"}

资源库现在支持在项目中使用测试资源，这意味着您可以：

* 将资源添加到测试源集中。
* 使用仅在对应源集中可用的生成访问器。
* 仅在测试运行时将测试资源打包到应用中。

#### 资源映射至字符串 ID 以便访问 {id="resources-mapped-to-string-ids-for-easy-access"}

每种类型的资源都会与其文件名进行映射。例如，您可以使用 `Res.allDrawableResources` 属性
获取所有 `drawable` 资源的映射，并通过传入其字符串 ID 来访问所需的资源：

```kotlin
Image(painterResource(Res.allDrawableResources["compose_multiplatform"]!!), null)
```

#### 用于将字节数组转换为 ImageBitmap 或 ImageVector 的函数 {id="functions-for-converting-byte-arrays-into-imagebitmap-or-imagevector"}

新增了用于将 `ByteArray` 转换为图像资源的函数：

* `decodeToImageBitmap()` 可将 JPEG、PNG、BMP 或 WEBP 文件转换为 `ImageBitmap` 对象。
* `decodeToImageVector()` 可将 XML 矢量文件转换为 `ImageVector` 对象。
* `decodeToSvgPainter()` 可将 SVG 文件转换为 `Painter` 对象。该函数在 Android 上不可用。

有关详细信息，请参阅[文档](compose-multiplatform-resources-usage.md#convert-byte-arrays-into-images)。

### 新增通用模块 {id="new-common-modules"}

#### material3.adaptive:adaptive* {id="material3-adaptive-adaptive"}

Material3 adaptive 模块现在已可在 Compose Multiplatform 的通用代码中使用。
如需使用它们，请显式将对应的依赖项添加到模块 `build.gradle.kts` 文件的通用源集中：

```kotlin
commonMain.dependencies {
    implementation("org.jetbrains.compose.material3.adaptive:adaptive:1.0.0-alpha03")
    implementation("org.jetbrains.compose.material3.adaptive:adaptive-layout:1.0.0-alpha03")
    implementation("org.jetbrains.compose.material3.adaptive:adaptive-navigation:1.0.0-alpha03")
}
```

#### material3.material3-adaptive-navigation-suite {id="material3-material3-adaptive-navigation-suite"}

在使用 Compose [构建自适应导航](https://developer.android.com/develop/ui/compose/layouts/adaptive/build-adaptive-navigation)时所需的 Material3 adaptive navigation suite，现在已可在 Compose Multiplatform 的通用代码中使用。
如需使用它，请显式将依赖项添加到模块 `build.gradle.kts` 文件的通用源集中：

```kotlin
commonMain.dependencies {
    implementation(compose.material3AdaptiveNavigationSuite)
}
```

#### material3:material3-window-size-class {id="material3-material3-window-size-class"}

如需使用 [`WindowSizeClass`](https://developer.android.com/reference/kotlin/androidx/compose/material3/windowsizeclass/package-summary) 类，
请显式将 `material3-window-size-class` 依赖项添加到模块 `build.gradle.kts` 文件的通用源集中：

```kotlin
commonMain.dependencies {
    implementation("org.jetbrains.compose.material3:material3-window-size-class:1.7.3")
}
```

`calculateWindowSizeClass()` 函数目前在通用代码中尚不可用。
但是，您可以在平台专用代码中导入并调用它，例如：

```kotlin
// desktopMain/kotlin/main.kt
import androidx.compose.material3.windowsizeclass.calculateWindowSizeClass

// ...

val size = calculateWindowSizeClass()
```

#### material-navigation {id="material-navigation"}

除了 Compose Multiplatform Navigation 之外，`material-navigation` 库现在也可在通用代码中使用。
如需使用它，请在模块的 `build.gradle.kts` 文件的通用源集中添加以下显式依赖项：

```kotlin
commonMain.dependencies {
    implementation("org.jetbrains.androidx.navigation:navigation-compose:2.8.0-alpha10")
    implementation("org.jetbrains.compose.material:material-navigation:1.7.0-beta02")
}
```

### Skia 已更新至 Milestone 126 {id="skia-updated-to-milestone-126"}

Compose Multiplatform 通过 [Skiko](https://github.com/JetBrains/skiko) 使用的 Skia 版本已更新至 Milestone 126。

之前使用的 Skia 版本为 Milestone 116。您可以在[发布说明](https://skia.googlesource.com/skia/+/refs/heads/main/RELEASE_NOTES.md#milestone-126)中查看这些版本之间的变更。

### GraphicsLayer – 全新绘制 API {id="graphicslayer-a-new-drawing-api"}

Jetpack Compose 1.7.0 中新增的绘制层现已在 Compose Multiplatform 中可用。

与 `Modifier.graphicsLayer` 不同，全新的 `GraphicsLayer` 类允许您在任意位置渲染可组合内容。
当需要在不同场景中渲染动画内容时，它非常实用。

有关更详细的说明和示例，请参阅[参考文档](https://developer.android.com/reference/kotlin/androidx/compose/ui/graphics/layer/GraphicsLayer)。

### LocalLifecycleOwner 从 Compose UI 中移出 {id="locallifecycleowner-moved-out-of-compose-ui"}

`LocalLifecycleOwner` 类已从 Compose UI 软件包移至 Lifecycle 软件包。

此项变更允许您脱离 Compose UI 独立访问该类并调用其基于 Compose 的辅助 API。
但请记住，如果没有 Compose UI 绑定，`LocalLifecycleOwner` 实例将无法与平台集成，因此也没有平台特定事件可供侦听。

## iOS {id="ios"}

### 改进 Compose Multiplatform 与原生 iOS 之间的触摸互操作 {id="ios-touch-interop"}

此版本改进了 iOS 互操作视图的触摸处理。
Compose Multiplatform 现在会尝试检测触摸是针对互操作视图还是应由 Compose 处理。
这使得处理发生在 Compose Multiplatform 应用内 UIKit 或 SwiftUI 区域中的触摸事件成为可能。

默认情况下，Compose Multiplatform 会将向互操作视图传递触摸事件的时间延迟 150 ms：

* 如果在此时间范围内发生了超出距离阈值的移动，
    父级可组合项将拦截该触摸序列，且不会将其转发给互操作视图。
* 如果没有明显的移动，Compose 将不再处理该触摸序列的后续部分，
    而是完全由互操作视图处理。

此行为与原生 [`UIScrollView`](https://developer.apple.com/documentation/uikit/uiscrollview) 的工作机制一致。
它有助于避免触摸序列在互操作视图中启动时被拦截、而 Compose Multiplatform 毫无处理机会的情况。否则这可能会导致糟糕的用户体验。
例如，设想在惰性列表等可滚动上下文中使用了一个大型互操作视频播放器。
当屏幕的大部分区域被视频占据，且视频在 Compose Multiplatform 未感知的情况下拦截了所有触摸时，滚动列表就会变得非常棘手。

### 原生性能改进 {id="native-performance-improvements"}

借助 Kotlin 2.0.20，Kotlin/Native 团队在使 iOS 上的 Compose 应用运行得更快、更流畅方面取得了长足进展。
Compose Multiplatform 1.7.3 版本充分利用了这些优化，并引入了来自 Jetpack Compose 1.7.0 的性能改进。

将 Compose Multiplatform 1.6.11（搭配 Kotlin 2.0.0）与 Compose Multiplatform 1.7.3（搭配 Kotlin 2.0.20）进行对比时，我们在各方面都看到了更出色的结果：

* *LazyGrid* 基准测试模拟了最贴近实际使用场景的 `LazyVerticalGrid` 滚动，其平均运行速度提升了 **~9%**。
    它还显著减少了掉帧数量，掉帧通常会让用户感到 UI 响应变差。
    您可以亲自体验一下：使用 Compose Multiplatform 打造的 iOS 应用应该会流畅得多。
* *VisualEffects* 基准测试渲染了大量随机放置的组件，运行速度提升了 **3.6** 倍：
    每 1000 帧的平均 CPU 时间从 8.8 秒缩短至 2.4 秒。
* *AnimatedVisibility* 可组合项为显示和隐藏图像添加动画效果，渲染速度提升了 **~6%**。

最重要的是，Kotlin 2.0.20 在垃圾回收器中引入了对[并发标记的实验性支持](https://kotlinlang.org/docs/whatsnew2020.html#concurrent-marking-in-garbage-collector)。启用并发标记可以缩短垃圾回收暂停时间，并在所有基准测试中带来更显著的提升。

您可以在 Compose Multiplatform 仓库中查看这些 Compose 专用基准测试的代码：

* [Kotlin/Native 性能基准测试](https://github.com/JetBrains/compose-multiplatform/tree/master/benchmarks/kn-performance)
* [Kotlin/JVM 与 Kotlin/Native 基准测试](https://github.com/JetBrains/compose-multiplatform/tree/master/benchmarks/ios/jvm-vs-kotlin-native)

## 桌面端 {id="desktop"}

### 拖放 {id="drag-and-drop"}

拖放机制现已在 Compose Multiplatform 桌面端中实现，用户可以通过该机制将内容拖入或拖出 Compose 应用程序。
要指定拖放的潜在源与目标，请使用 `dragAndDropSource` 和 `dragAndDropTarget` 修饰符。

> 尽管这些修饰符已在通用代码中提供，但目前仅在桌面端和 Android 源集中有效。
> 敬请期待后续版本。
> 
{style="note"}

有关常见用例，请参阅 Jetpack Compose 文档中的[专篇指南](https://developer.android.com/develop/ui/compose/touch-input/user-interactions/drag-and-drop)。

### 桌面端采用从 BasicTextField2 更名而来的 BasicTextField {id="basictextfield-renamed-from-basictextfield2-adopted-on-desktop"}

Jetpack Compose 已将 `BasicTextField2` 组件稳定化，并将其重命名为 `BasicTextField`。
在此版本中，Compose Multiplatform 已针对桌面端目标引入了这一变更，并计划在 1.7.0 稳定版中覆盖 iOS。

全新的 `BasicTextField`：

* 允许您更可靠地管理状态。
* 提供了新的 `TextFieldBuffer` API，用于以编程方式更改文本字段内容。
* 包含了用于视觉转换和样式设置的若干新 API。
* 提供对 `UndoState` 的访问能力，能够返回到文本字段的先前状态。

### ComposePanel 的渲染设置 {id="render-settings-for-composepanel"}

通过在 `ComposePanel` 构造函数中指定新的 `RenderSettings.isVsyncEnabled` 参数，您可以提示后端渲染实现禁用垂直同步。
这可以减少输入与 UI 变化之间的视觉延迟，但也可能导致画面撕裂。

默认行为保持不变：`ComposePanel` 会尝试将可绘制对象的呈现与垂直同步（VSync）进行同步。

## Web {id="web"}

### skiko.js 对 Kotlin/Wasm 应用程序而言已是多余的 {id="skiko-js-is-redundant-for-kotlin-wasm-applications"}

对于使用 Compose Multiplatform 构建的 Kotlin/Wasm 应用程序，`skiko.js` 文件现在已是多余的。
您可以从 `index.html` 文件中将其移除，从而提高应用的加载速度。
在未来的版本中，`skiko.js` 将从 Kotlin/Wasm 分发包中彻底移除。

> 直到 Compose Multiplatform 1.9.0 之前，`skiko.js` 文件对于 Kotlin/JS 应用程序仍然是必需的。
> 有关该变更的发生时间，请参阅 [Compose Multiplatform 1.9.3 最新变化](whats-new-compose-190.md#skiko-js-is-no-longer-needed)。
{style="note"}