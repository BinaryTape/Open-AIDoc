[//]: # (title: Compose Multiplatform 1.9.3 的最新变化)

以下是此功能版本的亮点：

* [@Preview 注解的参数](#parameters-for-the-preview-annotation)
* [可自定义的阴影](#customizable-shadows)
* [新的上下文菜单 API](#new-context-menu-api)
* [Material 3 Expressive 主题](#material-3-expressive-theme)
* [iOS 上的帧率配置](#frame-rate-configuration)
* [Compose Multiplatform for web 进入 Beta 阶段](#compose-multiplatform-for-web-in-beta)
* [Web 目标的无障碍支持](#accessibility-support)
* [用于嵌入 HTML 内容的新 API](#new-api-for-embedding-html-content)

请在 [GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.9.0) 上查看此版本的完整更改列表。

## 依赖项

* Gradle 插件 `org.jetbrains.compose` 版本为 1.9.3。基于 Jetpack Compose 库：
   * [Runtime 1.9.4](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.9.4)
   * [UI 1.9.4](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.9.4)
   * [Foundation 1.9.4](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.9.4)
   * [Material 1.9.4](https://developer.android.com/jetpack/androidx/releases/compose-material#1.9.4)
   * [Material3 1.4.0](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.4.0)

* Compose Material3 库 `org.jetbrains.compose.material3:1.9.0`。基于 [Jetpack Material3 1.4.0](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.4.0)。
  得益于 Compose Multiplatform 和 Material3 的[解耦版本](#decoupled-material3-versioning)，您可以为项目选择更早期的预发布版本。
* Compose Material3 Adaptive 库 `org.jetbrains.compose.material3.adaptive:adaptive*:1.2.0`。基于 [Jetpack Material3 Adaptive 1.2.0](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.2.0)
* Lifecycle 库 `org.jetbrains.androidx.lifecycle:lifecycle-*:2.9.6`。基于 [Jetpack Lifecycle 2.9.4](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.9.4)
* Navigation 库 `org.jetbrains.androidx.navigation:navigation-*:2.9.1`。基于 [Jetpack Navigation 2.9.4](https://developer.android.com/jetpack/androidx/releases/navigation#2.9.4)
* Savedstate 库 `org.jetbrains.androidx.savedstate:savedstate:1.3.6`。基于 [Jetpack Savedstate 1.3.3](https://developer.android.com/jetpack/androidx/releases/savedstate#1.3.3)
* WindowManager Core 库 `org.jetbrains.androidx.window:window-core:1.4.0`。基于 [Jetpack WindowManager 1.4.0](https://developer.android.com/jetpack/androidx/releases/window#1.4.0)

## 跨平台

### @Preview 注解的参数

Compose Multiplatform 中的 `@Preview` 注解现在包含额外的参数，用于配置 `@Composable` 函数在设计时预览中的呈现方式：

* `name`：预览的显示名称。
* `group`：预览的分组名称，支持对相关预览进行逻辑组织和选择性显示。
* `widthDp`：最大宽度（单位为 dp）。
* `heightDp`：最大高度（单位为 dp）。
* `locale`：应用程序的当前区域性。
* `showBackground`：一个标志，用于对预览应用默认背景颜色。
* `backgroundColor`：一个 32 位 ARGB 颜色整数，用于定义预览的背景颜色。

这些新的预览参数在 IntelliJ IDEA 和 Android Studio 中均可被识别并正常工作。

### 可自定义的阴影

在 Compose Multiplatform 1.9.0 中，我们引入了可自定义的阴影，采用了 Jetpack Compose 的新阴影基元和 API。除了之前支持的 `shadow` 修饰符外，您现在可以使用新的 API 创建更高级且更灵活的阴影效果。

有两个新的基元可用于创建不同类型的阴影：
`DropShadowPainter()` 和 `InnerShadowPainter()`。

要将这些新阴影应用于 UI 组件，请使用 `dropShadow` 或 `innerShadow` 修饰符配置阴影效果：

<list columns="2">
   <li><code-block lang="kotlin" code="        Box(&#10;            Modifier.size(120.dp)&#10;                .dropShadow(&#10;                    RectangleShape,&#10;                    DropShadow(12.dp)&#10;                )&#10;                .background(Color.White)&#10;        )&#10;        Box(&#10;            Modifier.size(120.dp)&#10;                .innerShadow(&#10;                    RectangleShape,&#10;                    InnerShadow(12.dp)&#10;                )&#10;        )"></code-block></li>
   <li><img src="compose-advanced-shadows.png" type="inline" alt="Customizable shadows" width="200"/></li>
</list>

您可以绘制任何形状和颜色的阴影，甚至可以将阴影几何图形用作遮罩来创建内部渐变填充阴影：

<img src="compose-expressive-shadows.png" alt="Expressive shadows" width="244"/>

有关详情，请参阅[阴影 API 参考](https://developer.android.com/reference/kotlin/androidx/compose/ui/graphics/shadow/package-summary.html)。

### 新的上下文菜单 API

我们采用了 Jetpack Compose 的新 API，用于在 `SelectionContainer` 和 `BasicTextField` 中自定义上下文菜单。iOS 和 web 的实现已完成，而 desktop 端已提供初步支持。

<list columns="2">
   <li><img src="compose_basic_text_field.png" type="inline" alt="Context menu for BasicTextField" width="420"/></li>
   <li><img src="compose_selection_container.png" type="inline" alt="Context menu for SelectionContainer" width="440"/></li>
</list>

要启用此新 API，请在应用程序入口点使用以下设置：

```kotlin
ComposeFoundationFlags.isNewContextMenuEnabled = true
```

有关详情，请参阅[上下文菜单 API 参考](https://developer.android.com/reference/kotlin/androidx/compose/foundation/text/contextmenu/data/package-summary)。

### Material 3 Expressive 主题
<primary-label ref="Experimental"/>

Compose Multiplatform 现在支持 Material 3 库中实验性的 [`MaterialExpressiveTheme`](https://developer.android.com/reference/kotlin/androidx/compose/material3/package-summary?hl=en#MaterialExpressiveTheme(androidx.compose.material3.ColorScheme,androidx.compose.material3.MotionScheme,androidx.compose.material3.Shapes,androidx.compose.material3.Typography,kotlin.Function0))。Expressive 主题设置允许您自定义 Material Design 应用，以获得更具个性化的体验。

>为了与 Jetpack Material3 [1.4.0-beta01 版本](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.4.0-beta01)保持一致，
>所有标记有 `ExperimentalMaterial3ExpressiveApi` 和 `ExperimentalMaterial3ComponentOverrideApi` 的公开 API 都已被移除。
>
>如果您想使用这些实验性功能，需要显式包含 Alpha 版 Material3。
{style="note"}

要使用 Expressive 主题：

1. 包含 Material 3 的实验版本：

    ```kotlin
    implementation("org.jetbrains.compose.material3:material3:1.9.0-alpha04")
    ```

2. 使用 `MaterialExpressiveTheme()` 函数配置 UI 元素的整体主题。
   此函数需要 `@OptIn(ExperimentalMaterial3ExpressiveApi::class)` 注解，并允许您指定
   `colorScheme`、`motionScheme`、`shapes` 和 `typography`。

随后，Material 组件，例如 [`Button()`](https://kotlinlang.org/api/compose-multiplatform/material3/androidx.compose.material3/-button.html)
和 [`Checkbox()`](https://kotlinlang.org/api/compose-multiplatform/material3/androidx.compose.material3/-checkbox.html)，
将自动使用您提供的值。

<img src="compose_expressive_theme.animated.gif" alt="Material 3 Expressive" width="250" preview-src="compose_expressive_theme.png"/>

### `androidx.compose.runtime:runtime` 中的多平台目标

为了提升 Compose Multiplatform 与 Jetpack Compose 的一致性，我们已在 `androidx.compose.runtime:runtime` 构件中直接添加了对所有目标的支持。

`org.jetbrains.compose.runtime:runtime` 构件保持完全兼容，现在充当别名。

### 带有 `suspend` lambda 的 `runComposeUiTest()`

`runComposeUiTest()` 函数现在接受 `suspend` lambda，允许您使用诸如 `awaitIdle()` 之类的挂起函数。

新 API 保证在所有受支持的平台上正确执行测试，包括对 web 环境的正确异步处理：

* 对于 JVM 和原生目标，`runComposeUiTest()` 的功能类似于 `runBlocking()`，但会跳过延迟。
* 对于 web 目标 (Wasm 和 JS)，它返回一个 `Promise` 并在跳过延迟的情况下执行测试体。

## iOS

### 帧率配置

Compose Multiplatform for iOS 现在支持配置渲染可组合项的首选帧率。如果动画出现卡顿，您可能希望提高帧率。另一方面，如果动画缓慢或静态，您可能更倾向于以较低的帧率运行它以降低功耗。

您可以按如下方式设置首选帧率类别：

```kotlin
Modifier.preferredFrameRate(FrameRateCategory.High)
```

或者，如果您需要可组合项的特定帧率，可以使用非负数定义首选帧率（单位为每秒帧数）：

```kotlin
Modifier.preferredFrameRate(30f)
```

如果您在同一个 `@Composable` 树中多次应用 `preferredFrameRate`，将应用指定的最高值。
然而，设备的硬件可能会限制支持的帧率，通常最高为 120 Hz。

### IME 选项

Compose Multiplatform 1.9.0 引入了对文本输入组件的 iOS 特定 IME 自定义支持。您现在可以使用 `PlatformImeOptions` 直接在文本字段组件中配置原生 UIKit 文本输入特性，例如键盘类型、自动更正和 return 键行为：

```kotlin
BasicTextField(
    value = "",
    onValueChange = {},
    keyboardOptions = KeyboardOptions(
        platformImeOptions = PlatformImeOptions {
            keyboardType(UIKeyboardTypeEmailAddress)
        }
    )
)
```

## Web

### Compose Multiplatform for web 进入 Beta 阶段

Compose Multiplatform for web 现已进入 Beta 阶段，这是尝试它的绝佳时机。请查看[我们的博客文章](https://blog.jetbrains.com/kotlin/2025/09/compose-multiplatform-1-9-0-compose-for-web-beta/)以了解达成此里程碑所取得的进展。

在我们努力迈向稳定版本的过程中，我们的路线图包括：

* 在移动端浏览器中实现对拖放功能的支持。
* 改进无障碍支持。
* 解决与 `TextField` 组件相关的问题。

### 无障碍支持

Compose Multiplatform 现在为 web 目标提供初步的无障碍支持。此版本使屏幕阅读器能够访问描述标签，并允许用户在无障碍导航模式下导航和点击按钮。

在此版本中，以下功能尚不支持：

* 带有滚动和滑块的互操作和容器视图的无障碍功能。
* 遍历索引。

您可以定义组件的[语义属性](compose-accessibility.md#semantic-properties)以向无障碍服务提供各种细节，例如组件的文本描述、功能类型、当前状态或唯一标识符。

例如，通过在可组合项上设置 `Modifier.semantics { heading() }`，您可以通知无障碍服务该元素充当标题，类似于文档中的章节或子章节标题。随后，屏幕阅读器可以使用此信息进行内容导航，允许用户直接在标题之间跳转。

```kotlin
Text(
    text = "This is heading", 
    modifier = Modifier.semantics { heading() }
)
```

无障碍支持现在默认启用，但您可以随时通过调整 `isA11YEnabled` 来禁用它：

```kotlin
ComposeViewport(
    viewportContainer = document.body!!,
    configure = { isA11YEnabled = false }
) {
    Text("Hello, Compose Multiplatform for web")
}
```

### 用于嵌入 HTML 内容的新 API

通过新的 `WebElementView()` 可组合函数，您可以将 HTML 元素无缝集成到您的 Web 应用程序中。

嵌入的 HTML 元素会根据您 Compose 代码中定义的尺寸覆盖画布区域。它会拦截该区域内的输入事件，从而防止 Compose Multiplatform 接收这些事件。

以下是使用 `WebElementView()` 创建并嵌入一个 HTML 元素的示例，该元素在您的 Compose 应用程序中显示交互式地图视图：

```kotlin
private val ttOSM =
    "https://www.openstreetmap.org/export/embed.html?bbox=4.890965223312379%2C52.33722052818563%2C4.893990755081177%2C52.33860862450587&amp;layer=mapnik"

@Composable
fun Map() {
    Box(
        modifier = Modifier.fillMaxWidth().fillMaxHeight()
    ) {
        WebElementView(
            factory = {
                (document.createElement("iframe")
                        as HTMLIFrameElement)
                    .apply { src = ttOSM }
            },
            modifier = Modifier.fillMaxSize(),
            update = { iframe -> iframe.src = iframe.src }
        )
    }
}
```

请注意，您只能在 `ComposeViewport` 入口点使用此函数，因为 `CanvasBasedWindow` 已被弃用。

### 用于绑定到导航图的简化 API

Compose Multiplatform 引入了一个新 API，用于将浏览器的导航状态绑定到 `NavController`：

```kotlin
suspend fun NavController.bindToBrowserNavigation()
```

新函数消除了直接与 `window` API 交互的需求，从而简化了 Kotlin/Wasm 和 Kotlin/JS 源集。

之前使用的 `Window.bindToNavigation()` 函数已被弃用，取而代之的是新的 `NavController.bindToBrowserNavigation()` 函数。

之前：

```kotlin
LaunchedEffect(Unit) {
    // 直接与 window 对象交互
    window.bindToNavigation(navController)
}
```

之后：

```kotlin
LaunchedEffect(Unit) {
    // 隐式访问 window 对象
    navController.bindToBrowserNavigation()
}
```

## Desktop

### 在显示前配置窗口

Compose Multiplatform 现在包含新的 `SwingFrame()` 和 `SwingDialog()` 可组合项。它们与现有的 `Window()` 和 `DialogWindow()` 函数类似，但包含一个 `init` 代码块。

以前，您无法设置某些必须在显示前配置的窗口属性。新的 `init` 代码块会在您的窗口或对话框出现在屏幕上之前执行，允许您配置诸如 `java.awt.Window.setType` 之类的属性或添加需要尽早准备就绪的事件侦听器。

我们建议仅对窗口或对话框可见后无法更改的属性使用 `init` 代码块。对于所有其他配置，请继续使用 `LaunchedEffect(window)` 模式，以确保您的代码保持兼容并能在未来的更新中正确运行。

## Gradle 插件

### 解耦的 Material3 版本控制

Material3 库的版本和稳定级别不再需要与 Compose Multiplatform Gradle 插件保持一致。`compose.material3` DSL 别名引用了 Jetpack Compose 稳定版本中的 Material3 1.9.0，但您可以为项目选择预发布版本。

如果您想使用支持 Expressive 设计的 Material3 版本，请将 `build.gradle.kts` 中的 Material 3 依赖项替换为以下内容：

```kotlin
implementation("org.jetbrains.compose.material3:material3:1.9.0-alpha04")
```

### 统一的 Web 分发

新的 `composeCompatibilityBrowserDistribution` Gradle 任务将 Kotlin/JS 和 Kotlin/Wasm 分发包合并为一个包。这允许 Wasm 应用程序在浏览器不支持现代 Wasm 功能时回退到 JS 目标。

### 支持 AGP 9.0.0

Compose Multiplatform 引入了对 Android Gradle 插件 (AGP) 9.0.0 版本的支持。为了兼容新的 AGP 版本，请确保您升级到 Compose Multiplatform 1.9.3 或 1.10.0。

为了让更新过程在长期内更加顺畅，我们建议将您的项目结构更改为使用专用的 Android 应用程序模块。