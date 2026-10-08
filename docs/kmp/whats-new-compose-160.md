[//]: # (title: Compose Multiplatform 1.6.0 最新变化)

以下是 Compose Multiplatform 1.6.0 版本的亮点：

* [重大更新](#breaking-changes)
* [全新且改进的资源 API](#improved-resources-api-all-platforms)
* [对 iOS 辅助功能的初步支持](#accessibility-support)
* [适用于所有平台的 UI 测试 API](#ui-testing-api-experimental-all-platforms)
* [弹出窗口、对话框和下拉菜单的独立平台视图](#separate-platform-views-for-popups-dialogs-and-dropdowns-ios-desktop)
* [合并了 Jetpack Compose 和 Material 3 的更改](#changes-from-jetpack-compose-and-material-3-all-platforms)
* [稳定版框架中的 Kotlin/Wasm 构件](#kotlin-wasm-artifacts-available-in-stable-versions-of-the-framework)
* [已知问题：缺失依赖项](#known-issues-missing-dependencies)

## 依赖项 {id="dependencies"}

此版本的 Compose Multiplatform 基于以下 Jetpack Compose 库：

* [Compiler 1.5.8](https://developer.android.com/jetpack/androidx/releases/compose-compiler#1.5.8)
* [Runtime 1.6.1](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.6.1)
* [UI 1.6.1](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.6.1)
* [Foundation 1.6.1](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.6.1)
* [Material 1.6.1](https://developer.android.com/jetpack/androidx/releases/compose-material#1.6.1)
* [Material3 1.2.0](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.2.0)

## 重大更新 {id="breaking-changes"}

### 默认剪切设置了 lineHeight 的文本内边距 {id="padding-for-text-with-lineheight-set-trimmed-by-default"}

随着对 [LineHeightStyle.Trim](https://developer.android.com/reference/kotlin/androidx/compose/ui/text/style/LineHeightStyle.Trim) 支持的加入，
Compose Multiplatform 在剪切文本内边距的方式上与 Android 保持一致。
详情请参阅 [拉取请求](https://github.com/JetBrains/compose-multiplatform-core/pull/897)。

这与 [1.6.0-alpha01 版本](https://developer.android.com/jetpack/androidx/releases/compose-material#1.6.0-alpha01) 中 `compose.material` 的更改一致：
* 在 Android 上，`includeFontPadding` 参数默认变为 `false`。
  要深入了解此更改，请参阅[关于在 Compose Multiplatform 中不实现此标志的讨论](https://github.com/JetBrains/compose-multiplatform/issues/2477#issuecomment-1825716543)。
* 默认行高样式已更改为 `Trim.None` 和 `Alignment.Center`。Compose Multiplatform 现在支持
  `LineHeightStyle.Trim` 并将 `Trim.None` 作为默认值。
* 已在 `Typography` 的 `TextStyle` 中添加了显式的 `lineHeight`，这导致了[下一个重大更新](#using-fontsize-in-materialtheme-requires-lineheight)。

### 在 MaterialTheme 中使用 fontSize 需要 lineHeight {id="using-fontsize-in-materialtheme-requires-lineheight"}

> 这仅影响 `material` 组件。`material3` 已经有了这一限制。
>
{style="note"}

如果在 `MaterialTheme` 中为 `Text` 组件设置了 `fontSize` 属性但不包含 `lineHeight`，则实际行高将不会被修改以匹配字体。现在，每次设置相应的 `fontSize` 时，必须显式指定 `lineHeight` 属性。

Jetpack Compose 现在[建议](https://issuetracker.google.com/issues/321872412)不要直接设置字体大小：

> 为了支持非标准文本大小，我们鼓励用户遵循 Material 设计系统并使用不同的 [类型层级 (type scale)](https://m2.material.io/design/typography/the-type-system.html#type-scale)，
> 而不是直接更改字体大小。或者，用户可以像这样重写行高：
> `style = LocalTextStyle.current.copy(lineHeight = TextUnit.Unspecified)`，或者完全创建一个自定义 `Typography`。
>
{style="tip"}

### 资源组织的新方法 {id="new-approach-to-resource-organization"}

如果你一直在 Compose Multiplatform 1.6.0 的预览版中使用资源 API，请熟悉
[当前版本的文档](compose-multiplatform-resources.md)：1.6.0-beta01 更改了资源文件在项目文件夹中的存储方式，以便项目代码可以使用它们。

## 跨平台 {id="across-platforms"}

### 改进的资源 API（所有平台） {id="improved-resources-api-all-platforms"}

全新的实验性 API 添加了对字符串和字体的支持，并允许你更轻松地在公共 Kotlin 代码中共享和访问资源：

* 资源可以根据其设计的特定设置或约束进行组织，支持：
  * 区域性 (Locales)
  * 图像分辨率
  * 深色和浅色主题
* Compose Multiplatform 现在为每个项目生成一个 `Res` 对象，以提供直接的资源访问。

要详细了解资源限定符以及新资源 API 的深入概述，
请参阅[图像和资源](compose-multiplatform-resources.md)。

### UI 测试 API（实验性，所有平台） {id="ui-testing-api-experimental-all-platforms"}

用于 Compose Multiplatform UI 测试的实验性 API 此前已在桌面端和 Android 上可用，现在已支持所有平台。你可以编写并运行公共测试，以验证应用程序 UI 在框架支持的各个平台上的行为。该 API 使用与 Jetpack Compose 相同的查找器、断言、操作和匹配器。

> 仅桌面项目支持基于 JUnit 的测试。
>
{style="note"}

有关设置说明和测试示例，请参阅[测试 Compose Multiplatform UI](compose-test.md)。

### 合并了 Jetpack Compose 和 Material 3 的更改（所有平台） {id="changes-from-jetpack-compose-and-material-3-all-platforms"}

#### Jetpack Compose 1.6.1 {id="jetpack-compose-1-6-1"}

合并 Jetpack Compose 的最新版本对所有平台的性能都有积极影响。详情请参阅
[Android 开发者博客上的公告](https://android-developers.googleblog.com/2024/01/whats-new-in-jetpack-compose-january-24-release.html)。

此版本的其他显著功能：
* 默认字体内边距的更改仅对 Android 目标生效。但是，请务必考虑到
  此更改的一个[副作用](#using-fontsize-in-materialtheme-requires-lineheight)。
* Compose Multiplatform 的其他目标已支持鼠标选择。在 1.6.0 中，这也包括了 Android。

尚未移植到 Compose Multiplatform 的 Jetpack Compose 功能：
* [BasicTextField2](https://github.com/JetBrains/compose-multiplatform/issues/4218)
* [对非线性字体缩放的支持](https://github.com/JetBrains/compose-multiplatform/issues/4305)
* [MultiParagraph.fillBoundingBoxes](https://github.com/JetBrains/compose-multiplatform/issues/4236)
* [多平台拖放](https://github.com/JetBrains/compose-multiplatform/issues/4235)。目前仅在 Android 上运行。在桌面端，你可以使用现有的 API `Modifier.onExternalDrag`。

JetBrains 团队正在致力于在 Compose Multiplatform 的未来版本中采用这些功能。

#### Compose Material 3 1.2.0 {id="compose-material-3-1-2-0"}

版本亮点：
* 新的实验性组件 `Segmented Button`（分段按钮），支持单选和多选。
* 扩展了颜色集，提供更多表面选项，以便更轻松地在 UI 中强调信息。
  * 实现说明：`ColorScheme` 对象现在是不可变的。如果你的代码目前直接修改 `ColorScheme` 中的颜色，
    你现在需要使用 [copy](https://developer.android.com/reference/kotlin/androidx/compose/material3/ColorScheme#copy(androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color)) 方法来更改颜色。
  * 现在有几种表面颜色和表面容器选项，而不是单一的表面值，以实现更灵活的颜色管理。

有关 Material 3 更改的更多详细信息，请参阅 [Material Design 博客上的发布帖子](https://material.io/blog/material-3-compose-1-2)。

### 弹出窗口、对话框和下拉菜单的独立平台视图（iOS、桌面端） {id="separate-platform-views-for-popups-dialogs-and-dropdowns-ios-desktop"}

有时，弹出元素（例如工具提示和下拉菜单）不应受初始可组合画布或应用窗口的限制，这一点很重要。如果可组合视图没有占据全屏但需要弹出警报对话框，这一点尤其重要。在 1.6.0 中，有一种方法可以可靠地实现这一点。

请注意，弹出窗口和对话框仍然无法在其自身范围之外绘制任何内容（例如，最顶层容器的阴影）。

#### iOS（稳定版） {id="ios-stable"}

在 iOS 上，该功能默认开启。
要切换回旧行为，请将 `platformLayers` 参数设置为 `false`：

```kotlin
ComposeUIViewController(
    configure = {
        platformLayers = false
    }
) {
    // 你的 Compose 代码
}
```

#### 桌面端（实验性） {id="desktop-experimental"}

要在桌面端使用该功能，请设置 `compose.layers.type` 系统属性。支持的值：
* `WINDOW`：用于将 `Popup` 和 `Dialog` 组件创建为独立的无装饰窗口。
* `COMPONENT`：用于在同一窗口中将 `Popup` 或 `Dialog` 创建为独立的 Swing 组件。它仅适用于离屏渲染，且 `compose.swing.render.on.graphics` 设置为 `true`（请参阅 1.5.0 Compose Multiplatform 版本说明中的 [增强的 Swing 互操作](https://blog.jetbrains.com/kotlin/2023/08/compose-multiplatform-1-5-0-release/#enhanced-swing-interop) 部分）。注意，离屏渲染仅适用于 `ComposePanel` 组件，不适用于全窗口应用程序。

使用 `COMPONENT` 属性的代码示例：

```kotlin
@OptIn(ExperimentalComposeUiApi::class)
fun main() = SwingUtilities.invokeLater {
    System.setProperty("compose.swing.render.on.graphics", "true")
    System.setProperty("compose.layers.type", "COMPONENT")

    val window = JFrame()
    window.defaultCloseOperation = WindowConstants.EXIT_ON_CLOSE

    val contentPane = JLayeredPane()
    contentPane.layout = null

    val composePanel = ComposePanel()
    composePanel.setBounds(200, 200, 200, 200)
    composePanel.setContent {
      ComposeContent()
    }
    composePanel.windowContainer = contentPane  // 为对话框使用全窗口
    contentPane.add(composePanel)

    window.contentPane.add(contentPane)
    window.setSize(800, 600)
    window.isVisible = true
  }

@Composable
fun ComposeContent() {
    Box(Modifier.fillMaxSize().background(Color.Green)) {
        Dialog(onDismissRequest = {}) {
            Box(Modifier.size(100.dp).background(Color.Yellow))
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true"  collapsed-title="val window = JFrame()"}

`Dialog`（黄色）被完整绘制，不受父级 `ComposePanel`（绿色）范围的限制：

![父面板范围之外的对话框](compose-desktop-separate-dialog.png){width=700}

### 对文本装饰线样式的支持（iOS、桌面端、Web） {id="support-for-text-decoration-line-styles-ios-desktop-web"}

Compose Multiplatform 现在允许使用 `PlatformTextStyle` 类为文本设置下划线样式。

> 该类在公共源集中不可用，需要在特定于平台的代码中使用。
>
{style="warning"}

设置点状下划线样式的示例：

```kotlin
Text(
  "Hello, Compose",
  style = TextStyle(
    textDecoration = TextDecoration.Underline,
    platformStyle = PlatformTextStyle (
      textDecorationLineStyle = TextDecorationLineStyle.Dotted
    )
  )
)
```

你可以使用实线、双倍宽度实线、点线、虚线和波浪线样式。请在 [源代码](https://github.com/JetBrains/compose-multiplatform-core/blob/jb-main/compose/ui/ui-text/src/skikoMain/kotlin/androidx/compose/ui/text/TextDecorationLineStyle.kt#L21) 中查看所有可用选项。

### 访问系统中安装的字体（iOS、桌面端、Web） {id="accessing-fonts-installed-on-the-system-ios-desktop-web"}

你现在可以从 Compose Multiplatform 应用访问系统中安装的字体：使用 `SystemFont` 类加载具有适当字体样式和字重 (font weights) 的字体：

```kotlin
import androidx.compose.ui.text.platform.SystemFont

FontFamily(SystemFont("Menlo", weight = 700))
FontFamily(SystemFont("Times New Roman", FontWeight.Bold))
FontFamily(SystemFont("Webdings"))
```

在桌面端，你可以使用 `FontFamily` 函数，仅通过指定字体族名称来加载所有可能的字体样式（有关详尽示例，请参阅 [代码示例](https://github.com/JetBrains/compose-multiplatform-core/blob/release/1.6.0/compose/desktop/desktop/samples/src/jvmMain/kotlin/androidx/compose/desktop/examples/fonts/Fonts.jvm.kt)）：

```kotlin
FontFamily("Menlo")
```

## iOS {id="ios"}

### 辅助功能支持 {id="accessibility-support"}

适用于 iOS 的 Compose Multiplatform 现在允许残障人士以与原生 iOS UI 相同水平的舒适度与 Compose UI 进行交互：

* 屏幕阅读器和 VoiceOver 可以访问 Compose UI 的内容。
* Compose UI 支持与原生 UI 相同的导航和交互手势。

这也意味着你可以使 Compose Multiplatform 语义数据对辅助功能服务和 XCTest 框架可用。

有关实现和自定义 API 的详细信息，请参阅 [对 iOS 辅助功能的支持](compose-ios-accessibility.md)。

### 更改可组合视图的不透明度 {id="changing-opacity-for-composable-view"}

`ComposeUIViewController` 类现在多了一个配置选项，可以将视图背景的不透明度更改为透明。

> 透明背景会产生额外的混合步骤，从而对性能产生负面影响。
>
{style="note"}

```kotlin
val appController = ComposeUIViewController(configure = {
      this.opaque = false
}) {
    App()
}
```

透明背景可以帮你实现的示例：

![Compose opaque = false 演示](compose-opaque-property.png){width=700}

### 通过双击和三击在 SelectionContainer 中选择文本 {id="selecting-text-in-selectioncontainer-by-double-and-triple-tap"}

以前，适用于 iOS 的 Compose Multiplatform 仅允许用户在文本输入字段中使用多次点击来选择文本。现在，双击和三击手势也适用于选择 `SelectionContainer` 内部 `Text` 组件中显示的文本。

### 与 UIViewController 的互操作 {id="interop-with-uiviewcontroller"}

某些未实现为 `UIView` 的原生 API（例如 `UITabBarController` 或 `UINavigationController`）无法使用 [现有的互操作机制](compose-uikit-integration.md) 嵌入到 Compose Multiplatform UI 中。

现在，Compose Multiplatform 实现了 `UIKitViewController` 函数，允许你在 Compose UI 中嵌入原生 iOS 视图控制器。

### 文本字段中长按/单次点击实现的原生文本光标行为 {id="native-like-caret-behavior-by-long-single-taps-in-text-fields"}

Compose Multiplatform 现在更接近 iOS 原生的文本字段文本光标行为：
* 在文本字段中单次点击后文本光标的位置确定得更加精确。
* 在文本字段中长按并拖动会导致移动光标，而不是像在 Android 上那样进入选择模式。

## 桌面端 {id="desktop"}

### 改进互操作混合的实验性支持 {id="experimental-support-of-improved-interop-blending"}

过去，使用 `SwingPanel` 包装器实现的互操作视图始终是矩形的，并且始终处于前景，位于任何 Compose Multiplatform 组件之上。这使得任何弹出元素（下拉菜单、浮窗通知）都难以使用。通过新的实现，此问题已得到解决，你现在可以在以下用例中依赖 Swing：

* 剪裁 (Clipping)。你不再受限于矩形形状：剪裁和阴影修饰符现在可以与 SwingPanel 正常协作。

    ```kotlin
    // 启用实验性混合所需的标志 
    System.setProperty("compose.interop.blending", "true")
  
    SwingPanel(
        modifier = Modifier.clip(RoundedCornerShape(6.dp))
        //...
    )
    ```
  
  你可以在左侧看到没有此功能的 `JButton` 被剪裁的方式，在右侧看到实验性混合的效果：

  ![使用 SwingPanel 正确剪裁](compose-swingpanel-clipping.png)
* 重叠 (Overlapping)。可以在 `SwingPanel` 之上绘制任何 Compose Multiplatform 内容，并像往常一样与其交互。在这里，“Snackbar”位于带有可点击 **OK** 按钮的 Swing 面板之上：

  ![使用 SwingPanel 正确重叠](compose-swingpanel-overlapping.png)

请参阅 [拉取请求说明](https://github.com/JetBrains/compose-multiplatform-core/pull/915) 中的已知限制和更多详情。

## Web {id="web"}

### 稳定版框架中提供的 Kotlin/Wasm 构件 {id="kotlin-wasm-artifacts-available-in-stable-versions-of-the-framework"}

Compose Multiplatform 稳定版现在支持 Kotlin/Wasm 目标。切换到 1.6.0 后，你无需在依赖项列表中指定特定 `dev-wasm` 版本的 `compose-ui` 库。

> 要构建具有 Wasm 目标的 Compose Multiplatform 项目，你需要使用 Kotlin 1.9.22 及更高版本。
>
{style="warning"}

## 已知问题：缺失依赖项 {id="known-issues-missing-dependencies"}

在默认的项目配置中，可能会缺失几个库：

* `org.jetbrains.compose.annotation-internal:annotation` 或 `org.jetbrains.compose.collection-internal:collection`

  如果某个库依赖于 Compose Multiplatform 1.6.0-beta02（该版本与 1.6.0 二进制不兼容），则这些库可能会缺失。要查出是哪个库，请运行以下命令（将 `shared` 替换为你的主模块名称）：

  ```shell
  ./gradlew shared:dependencies
  ```

  将该库降级到依赖于 Compose Multiplatform 1.5.12 的版本，或要求库作者将其升级到 Compose Multiplatform 1.6.0。

* `androidx.annotation:annotation:...` 或 `androidx.collection:collection:...`

  Compose Multiplatform 1.6.0 依赖于仅在 Google Maven 仓库中可用的 [collection](https://developer.android.com/jetpack/androidx/releases/collection) 和 [annotation](https://developer.android.com/jetpack/androidx/releases/annotation) 库。

  要使此仓库对你的项目可用，请在该模块的 `build.gradle.kts` 文件中添加以下行：

  ```kotlin
  repositories {
      //...
      google()
  }
  ```
