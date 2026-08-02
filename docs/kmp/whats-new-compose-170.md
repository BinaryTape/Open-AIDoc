[//]: # (title: Compose Multiplatform 1.7.3 最新变化)

以下是本次功能发布的亮点：

* [类型安全导航](#type-safe-navigation)
* [共享元素过渡](#shared-element-transitions)
* [封装到 Android 资产 (assets) 中的多平台资源](#resources-packed-into-android-assets)
* [自定义资源目录](#custom-resource-directories)
* [支持多平台测试资源](#support-for-multiplatform-test-resources)
* [改进 iOS 上的轻触互操作性](#new-default-behavior-for-processing-touch-in-ios-native-elements)
* [Material3 `adaptive` 和 `material3-window-size-class` 现已进入公共代码](#material3-adaptive-adaptive)
* [桌面端已实现拖放](#drag-and-drop)
* [桌面端已采用 `BasicTextField`](#basictextfield-renamed-from-basictextfield2-adopted-on-desktop)

请在 [GitHub 上](https://github.com/JetBrains/compose-multiplatform/blob/master/CHANGELOG.md#170-october-2024)查看此版本的完整更改列表。

## 依赖项

* Gradle 插件 `org.jetbrains.compose`，版本 1.7.3。基于 Jetpack Compose 库：
  * [Runtime 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.7.5)
  * [UI 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.7.5)
  * [Foundation 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.7.5)
  * [Material 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-material#1.7.5)
  * [Material3 1.3.1](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.3.1)
* Lifecycle 库 `org.jetbrains.androidx.lifecycle:lifecycle-*:2.8.3`。基于 [Jetpack Lifecycle 2.8.5](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.8.5)。
* Navigation 库 `org.jetbrains.androidx.navigation:navigation-*:2.8.0-alpha10`。基于 [Jetpack Navigation 2.8.0](https://developer.android.com/jetpack/androidx/releases/navigation#2.8.0)。
* Material3 Adaptive 库 `org.jetbrains.compose.material3.adaptive:adaptive-*:1.0.0`。基于 [Jetpack Material3 Adaptive 1.0.0](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.0.0)

## 破坏性变更

### 最低 AGP 版本提升至 8.1.0

Compose Multiplatform 1.7.0 使用的 Jetpack Compose 1.7.0 和 Lifecycle 2.8.0 都不支持 AGP 7。
因此，当您更新到 Compose Multiplatform 1.7.3 时，可能也必须升级您的 AGP 依赖项。

> Android Studio 中新实现的 Android 可组合项预览[需要最新版本的 AGP 之一](#resources-packed-into-android-assets)。
>
{style="note"}

### Java 资源 API 已弃用，取而代之的是多平台资源库

<!-- TODO additional copy editing -->

在此版本中，我们明确弃用了 `compose.ui` 软件包中提供的 Java 资源 API：
`painterResource()`、`loadImageBitmap()`、`loadSvgPainter()` 和 `loadXmlImageVector()` 函数，以及
`ClassLoaderResourceLoader` 类和依赖它的函数。

请考虑迁移到[多平台资源库](compose-multiplatform-resources.md)。
虽然您可以在 Compose Multiplatform 中使用 Java 资源，但它们无法受益于框架提供的扩展功能：生成的访问器、多模块支持、本地化等。

如果您仍需访问 Java 资源，可以复制[拉取请求中建议的实现](https://github.com/JetBrains/compose-multiplatform-core/pull/1457)，
以确保您的代码在升级到 Compose Multiplatform 1.7.3 并尽可能切换到多平台资源后仍能正常工作。

### iOS 原生元素中轻触处理的新默认行为

在 1.7.3 之前，Compose Multiplatform 无法响应落在互操作 UI 视图中的轻触事件，因此
互操作视图会完全处理这些轻触序列。

Compose Multiplatform 1.7.3 实现了更复杂的逻辑来处理互操作轻触序列。
默认情况下，初始轻触后现在会有延迟，这有助于父级可组合项了解轻触序列是否旨在与原生视图交互，并据此做出反应。

有关更多信息，请参阅[本页面的 iOS 部分](#ios-touch-interop)中的说明
或阅读[此功能的文档](compose-ios-touch.md)。

### 必须禁用 iOS 上的最小帧时长

开发者经常忽略关于高刷新率显示屏的打印警告，
导致用户在支持 120 Hz 的设备上无法获得流畅的动画体验。
我们现在严格执行此检查。如果 `Info.plist` 文件中的 `CADisableMinimumFrameDurationOnPhone` 属性缺失或设置为 `false`，
则使用 Compose Multiplatform 构建的应用现在将会崩溃。

您可以通过将 `ComposeUIViewControllerConfiguration.enforceStrictPlistSanityCheck` 属性设置为 `false` 来禁用此行为。

### 桌面端弃用 Modifier.onExternalDrag

<!-- TODO additional copy editing -->

实验性的 `Modifier.onExternalDrag` 及相关 API 已弃用，取而代之的是新的 `Modifier.dragAndDropTarget`。
`DragData` 接口已移至 `compose.ui.draganddrop` 软件包。

如果您在 Compose Multiplatform 1.7.0 中使用已弃用的 API，将会遇到弃用错误。
在 1.8.0 中，`onExternalDrag` 修饰符将被彻底移除。

## 跨平台功能

### 共享元素过渡

Compose Multiplatform 现在提供了一个 API，用于在共享一致元素的各可组合项之间进行无缝过渡。
这些过渡在导航中通常非常有用，可以帮助用户跟踪 UI 的变化轨迹。

有关该 API 的深入了解，请参阅 [Jetpack Compose 文档](https://developer.android.com/develop/ui/compose/animation/shared-elements)。

### 类型安全导航

Compose Multiplatform 采用了 Jetpack Compose 的类型安全方法来沿导航路由传递对象。
Navigation 2.8.0 中的新 API 允许 Compose 为您的导航图提供编译时安全。
这些 API 实现了与基于 XML 导航的 [Safe Args](https://developer.android.com/guide/navigation/use-graph/pass-data#Safe-args) 插件相同的结果。

有关详细信息，请参阅 [Google 关于 Navigation Compose 中类型安全的文档](https://developer.android.com/guide/navigation/design/type-safety)。

### 多平台资源

#### 封装到 Android 资产 (assets) 中的多平台资源

所有多平台资源现在都封装在 Android 资产 (assets) 中。这允许 Android Studio 在 Android 源集中为 Compose Multiplatform 可组合项生成预览。

> Android Studio 预览仅适用于 Android 源集中的可组合项。
> 它们还需要最新版本的 AGP 之一：8.5.2、8.6.0-rc01 或 8.7.0-alpha04。
>
{style="note"}

这也提供了从 Android 上的 WebView 和媒体播放器组件直接访问多平台资源的能力，
因为可以通过简单的路径访问资源，例如 `Res.getUri(“files/index.html”)`。

下面是一个 Android 可组合项的示例，它显示一个包含资源图像链接的资源 HTML 页面：

```kotlin
// androidMain/kotlin/com/example/webview/App.kt
@OptIn(ExperimentalResourceApi::class)
@Composable
@Preview
fun App() {
    MaterialTheme {
        val uri = Res.getUri("files/webview/index.html")

        // 在 AndroidView 中添加 WebView，布局设置为全屏。
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

该示例适用于此简单的 HTML 文件：

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

此示例中的两个资源文件都位于 `commonMain` 源集中：

![composeResources 目录的文件结构](compose-resources-android-webview.png){width="230"}

#### 自定义资源目录

通过配置 DSL 中新的 `customDirectory` 设置，您可以将[自定义目录与特定源集相关联](compose-multiplatform-resources-setup.md#custom-resource-directories)。
例如，这使得将下载的文件用作资源成为可能。

#### 多平台字体缓存

Compose Multiplatform 将 Android 的字体缓存功能引入其他平台，
消除了对 `Font` 资源的过度字节读取。

#### 支持多平台测试资源

资源库现在支持在项目中使用测试资源，这意味着您可以：

* 向测试源集添加资源。
* 使用仅在相应源集中可用的生成访问器。
* 仅为测试运行将测试资源封装到应用中。

#### 通过字符串 ID 映射资源以方便访问

每种类型的资源都与其文件名进行了映射。例如，您可以使用 `Res.allDrawableResources` 属性
获取所有 `drawable` 资源的映射，并通过传递其字符串 ID 来访问所需的资源：

```kotlin
Image(painterResource(Res.allDrawableResources["compose_multiplatform"]!!), null)
```

#### 将字节数组转换为 ImageBitmap 或 ImageVector 的函数

新增了几个将 `ByteArray` 转换为图像资源的函数：

* `decodeToImageBitmap()` 将 JPEG、PNG、BMP 或 WEBP 文件转换为 `ImageBitmap` 对象。
* `decodeToImageVector()` 将 XML 矢量文件转换为 `ImageVector` 对象。
* `decodeToSvgPainter()` 将 SVG 文件转换为 `Painter` 对象。此函数在 Android 上不可用。

有关详细信息，请参阅[文档](compose-multiplatform-resources-usage.md#convert-byte-arrays-into-images)。

### 新的公共模块

#### material3.adaptive:adaptive*

Material3 自适应模块现在可通过 Compose Multiplatform 在公共代码中使用。
要使用它们，请在模块的 `build.gradle.kts` 文件的公共源集中明确添加相应的依赖项：

```kotlin
commonMain.dependencies {
    implementation("org.jetbrains.compose.material3.adaptive:adaptive:1.0.0-alpha03")
    implementation("org.jetbrains.compose.material3.adaptive:adaptive-layout:1.0.0-alpha03")
    implementation("org.jetbrains.compose.material3.adaptive:adaptive-navigation:1.0.0-alpha03")
}
```

#### material3.material3-adaptive-navigation-suite

使用 Compose [构建自适应导航](https://developer.android.com/develop/ui/compose/layouts/adaptive/build-adaptive-navigation)所需的 Material3 自适应导航套件，
现在可通过 Compose Multiplatform 在公共代码中使用。
要使用它，请在模块的 `build.gradle.kts` 文件的公共源集中明确添加依赖项：

```kotlin
commonMain.dependencies {
    implementation(compose.material3AdaptiveNavigationSuite)
}
```

#### material3:material3-window-size-class

要使用 [`WindowSizeClass`](https://developer.android.com/reference/kotlin/androidx/compose/material3/windowsizeclass/package-summary) 类，请在模块的 `build.gradle.kts` 文件的公共源集中明确添加 `material3-window-size-class` 依赖项：

```kotlin
commonMain.dependencies {
    implementation("org.jetbrains.compose.material3:material3-window-size-class:1.7.3")
}
```

`calculateWindowSizeClass()` 函数在公共代码中尚不可用。
但是，您可以在平台特定代码中导入并调用它，例如：

```kotlin
// desktopMain/kotlin/main.kt
import androidx.compose.material3.windowsizeclass.calculateWindowSizeClass

// ...

val size = calculateWindowSizeClass()
```

#### material-navigation

除了 Compose Multiplatform Navigation 之外，`material-navigation` 库也可在公共代码中使用。
要使用它，请在模块的 `build.gradle.kts` 文件的公共源集中添加以下明确依赖项：

```kotlin
commonMain.dependencies {
    implementation("org.jetbrains.androidx.navigation:navigation-compose:2.8.0-alpha10")
    implementation("org.jetbrains.compose.material:material-navigation:1.7.0-beta02")
}
```

### Skia 更新至里程碑 (Milestone) 126

Compose Multiplatform 通过 [Skiko](https://github.com/JetBrains/skiko) 使用的 Skia 版本已更新至里程碑 126。

之前使用的 Skia 版本是里程碑 116。您可以在[发布说明](https://skia.googlesource.com/skia/+/refs/heads/main/RELEASE_NOTES.md#milestone-126)中查看这些版本之间所做的更改。

### GraphicsLayer – 新的绘图 API

Jetpack Compose 1.7.0 中新增的绘图层现在可以在 Compose Multiplatform 中使用。

与 `Modifier.graphicsLayer` 不同，新的 `GraphicsLayer` 类允许您在任何地方渲染可组合内容。
它在需要在不同场景中渲染动画内容的情况下非常有用。

有关更详细的描述和示例，请参阅[参考文档](https://developer.android.com/reference/kotlin/androidx/compose/ui/graphics/layer/GraphicsLayer)。

### LocalLifecycleOwner 已从 Compose UI 中移出

`LocalLifecycleOwner` 类已从 Compose UI 软件包移至 Lifecycle 软件包。

此更改允许您独立于 Compose UI 访问该类并调用其基于 Compose 的辅助 API。
但请记住，如果没有 Compose UI 绑定，`LocalLifecycleOwner` 实例将没有平台集成，因此没有可供侦听的平台特定事件。

## iOS

### 改进了 Compose Multiplatform 与原生 iOS 之间的轻触互操作性 {id="ios-touch-interop"}

此版本改进了 iOS 互操作视图的轻触处理。
Compose Multiplatform 现在尝试检测轻触是针对互操作视图还是应由 Compose 处理。
这使得处理发生在 Compose Multiplatform 应用内部 UIKit 或 SwiftUI 区域中的轻触事件成为可能。

默认情况下，Compose Multiplatform 将向互操作视图传递轻触事件的时间延迟 150 ms：

* 如果在此时间范围内发生了超过距离阈值的移动，
    父级可组合项将拦截该轻触序列，并且不会将其转发给互操作视图。
* 如果没有明显的移动，Compose 将不处理轻触序列的其余部分，
    而是由互操作视图单独处理。

此行为与原生 [`UIScrollView`](https://developer.apple.com/documentation/uikit/uiscrollview) 的工作方式一致。
它有助于防止起始于互操作视图的轻触序列在 Compose Multiplatform 没机会处理的情况下被拦截。这可能会导致令人沮丧的用户体验。
例如，想象一个在可滚动上下文（如延迟列表）中使用的型互操作视频播放器。
当屏幕的大部分被一个拦截所有轻触而 Compose Multiplatform 却不知情的视频占据时，滚动列表会非常困难。

### 原生性能改进

<!-- TODO additional copy editing -->

在 Kotlin 2.0.20 中，Kotlin/Native 团队在使 iOS 上的 Compose 应用运行得更快更流畅方面取得了长足进步。
Compose Multiplatform 1.7.3 版本利用了这些优化，并带来了来自 Jetpack Compose 1.7.0 的性能改进。

将 Compose Multiplatform 1.6.11 与 Kotlin 2.0.0 配对，与 Compose Multiplatform 1.7.3 与 Kotlin 2.0.20 配对进行比较时，我们看到了全面的更好结果：

* *LazyGrid* 基准测试模拟 `LazyVerticalGrid` 滚动（最接近现实生活中的用例），平均运行速度快约 **9%**。
    它还显示丢帧数量显著减少，丢帧通常会使用户感觉 UI 响应较慢。
    您可以亲自尝试：使用 Compose Multiplatform 为 iOS 制作的应用应该会感觉流畅得多。
* *VisualEffects* 基准测试渲染大量随机放置的组件，运行速度快 **3.6** 倍：
    每 1000 帧的平均 CPU 时间从 8.8 秒减少到 2.4 秒。
* *AnimatedVisibility* 可组合项为显示和隐藏图像设置动画，渲染速度提高约 **6%**。

最重要的是，Kotlin 2.0.20 在垃圾回收器中引入了实验性的[对并发标记的支持](https://kotlinlang.org/docs/whatsnew2020.html#concurrent-marking-in-garbage-collector)。启用并发标记可缩短垃圾回收器暂停时间，并为所有基准测试带来更大的改进。

您可以在 Compose Multiplatform 仓库中查看这些针对 Compose 的基准测试代码：

* [Kotlin/Native 性能基准测试](https://github.com/JetBrains/compose-multiplatform/tree/master/benchmarks/kn-performance)
* [Kotlin/JVM 与 Kotlin/Native 基准测试](https://github.com/JetBrains/compose-multiplatform/tree/master/benchmarks/ios/jvm-vs-kotlin-native)

## 桌面端

### 拖放

拖放机制已在桌面端的 Compose Multiplatform 中实现，该机制允许用户将内容拖入或拖出您的 Compose 应用程序。
要指定拖放的潜在源和目标，请使用 `dragAndDropSource` 和 `dragAndDropTarget` 修饰符。

> 虽然这些修饰符在公共代码中可用，但目前它们仅在桌面端和 Android 源集中有效。
> 请关注未来的发布。
> 
{style="note"}

有关常见用例，请参阅 Jetpack Compose 文档中的[专题文章](https://developer.android.com/develop/ui/compose/touch-input/user-interactions/drag-and-drop)。

### 从 BasicTextField2 重命名的 BasicTextField，已在桌面端采用

Jetpack Compose 已使 `BasicTextField2` 组件稳定并将其重命名为 `BasicTextField`。
在此版本中，Compose Multiplatform 已针对桌面端目标采用了此更改，并计划在稳定的 1.7.0 版本中也覆盖 iOS。

新的 `BasicTextField`：

* 允许您更可靠地管理状态。
* 提供新的 `TextFieldBuffer` API，用于以编程方式更改文本字段内容。
* 包含多个用于视觉变换和样式设置的新 API。
* 提供对 `UndoState` 的访问，能够返回到字段之前的状态。

### ComposePanel 的渲染设置

通过在 `ComposePanel` 构造函数中指定新的 `RenderSettings.isVsyncEnabled` 参数，您可以提示后端渲染实现禁用垂直同步。
这可以减少输入与 UI 变化之间的视觉延迟，但也可能导致画面撕裂。

默认行为保持不变：`ComposePanel` 尝试将可绘制对象的呈现与垂直同步 (VSync) 同步。

## Web

### skiko.js 对于 Kotlin/Wasm 应用程序是冗余的

<!-- TODO additional copy editing -->

对于使用 Compose Multiplatform 构建的 Kotlin/Wasm 应用程序，`skiko.js` 文件现在是冗余的。
您可以将其从 `index.html` 文件中移除，从而缩短应用的加载时间。
`skiko.js` 将在未来的版本中从 Kotlin/Wasm 发行版中完全移除。

> 对于 Kotlin/JS 应用程序，直到 Compose Multiplatform 1.9.0，`skiko.js` 文件仍然是必需的。
> 有关此情况何时发生变化，请参阅 [Compose Multiplatform 1.9.3 最新变化](whats-new-compose-190.md#skiko-js-is-no-longer-needed)。
{style="note"}