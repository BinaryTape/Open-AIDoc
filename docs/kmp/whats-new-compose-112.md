[//]: # (title: Compose Multiplatform 1.12.2 最新变化)

以下是本次功能版本的核心亮点：

 * [Web 端自动字体回退](#automatic-font-fallback)
 * [Compose Hot Reload 中面向 AI 智能体的 MCP 服务器](#mcp-server-for-ai-agents-in-compose-hot-reload)
 * [桌面端 Window 和 Dialog API v2](#window-and-dialog-api-v2)

您可以在 [GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.12.0) 上查看此版本的完整变更列表。
有关具体组件版本的详细信息，请参阅[依赖项](#dependencies)部分。

## 破坏性变更与弃用 {id="breaking-changes-and-deprecations"}

用于管理应用主题的 `LocalSystemTheme` 属性已被弃用。
该属性暂时保留在 `@InternalComposeUiApi` 注解下可用，并将在未来的版本中被替换。

## 跨平台 {id="across-platforms"}

### Skia 更新至 Milestone 150 {id="skia-updated-to-milestone-150"}

Compose Multiplatform 通过 Skiko 使用的 Skia 版本已更新至 Milestone 150。

在 Compose Multiplatform 1.11 中使用的前一个版本是 Milestone 144。
您可以在[版本说明](https://skia.googlesource.com/skia/+/refs/heads/chrome/m150/RELEASE_NOTES.md)中查看这些版本之间的变更。

此次更新还解决了在 iOS 上针对已自带 Skia 库的应用（例如基于 Chromium 的应用）的重复符号冲突问题。

## iOS {id="ios"}

### 提升惰性布局（lazy layout）滚动性能 {id="improved-lazy-layout-scrolling-performance"}

Compose Multiplatform for iOS 现在为惰性布局提供了更出色的滚动性能。
列表项的停用（deactivation）操作在绘制阶段之外执行，使绘制阶段能够更快完成，从而实现更流畅的滚动体验。

## Web {id="web"}

### 自动字体回退 {id="automatic-font-fallback"}
<primary-label ref="Experimental"/>

此前，应用已加载字体未覆盖的字符会显示为替换字形（□，即常说的“豆腐块 / tofu”）。

现在，Compose Multiplatform for Web 在渲染过程中遇到未解析的字符时，会按需自动下载所需的 Noto 字体子集。
字体下载完成后，Compose 会对受影响的文本进行重组（recompose）。
请注意，在请求到所需字体之前，可能会短暂出现豆腐块。

## 桌面端 {id="desktop"}

### Compose Hot Reload 中面向 AI 智能体的 MCP 服务器 {id="mcp-server-for-ai-agents-in-compose-hot-reload"}
<primary-label ref="Experimental"/>

Compose Hot Reload 现附带一个实验性的 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 服务器，允许 AI 编码智能体直接与正在运行的 Compose 应用程序进行交互。

在此之前，当 AI 智能体编辑 Compose 代码时，没有可靠的方法来验证结果：智能体无法确认热重载是否成功，看不到渲染出的 UI，也无法读取运行时日志或异常。借助 MCP 服务器，智能体可以触发重载、截取屏幕截图、检查语义树、模拟点击与输入，并读取应用程序日志，完全无需人工干预。

有关 AI 智能体可用的完整 MCP 工具列表以及如何连接，请参阅[面向 AI 智能体的 MCP 服务器](compose-hot-reload.md#mcp-server-for-ai-agents)。

### Window 和 Dialog API v2 {id="window-and-dialog-api-v2"}
<primary-label ref="Experimental"/>

我们在桌面端为 `WindowState` 和 `DialogState` 引入了全新的实验性 v2 API，解决了现有 API 的诸多限制。
v2 API 位于 `androidx.compose.ui.window.v2` 子包中。

v2 API 让您可以更好地控制窗口和对话框的放置位置与尺寸。您可以：
* 选择窗口显示的屏幕
* 提供自定义的位置和尺寸调整逻辑，包括基于内容固有尺寸（intrinsic size）的逻辑
* 设置最小和最大窗口尺寸
* 相对于父窗口定位对话框

v2 API 还明确指出了窗口状态变化的异步特性，将请求的状态与实际状态分离开来。

例如，要在屏幕中央打开一个固定大小的窗口：

```kotlin
import androidx.compose.material.Text
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.application
import androidx.compose.ui.window.v2.Window
import androidx.compose.ui.window.v2.WindowBoundsProvider
import androidx.compose.ui.window.v2.WindowPositionProvider
import androidx.compose.ui.window.v2.WindowSizeProvider
import androidx.compose.ui.window.v2.rememberWindowState

@OptIn(ExperimentalComposeUiApi::class)
fun main() = application {
    val windowState = rememberWindowState(
        initialBoundsProvider = WindowBoundsProvider(
            positionProvider = WindowPositionProvider.CenteredOnScreen,
            sizeProvider = WindowSizeProvider.Fixed(DpSize(400.dp, 200.dp))
        )
    )

    Window(
        onCloseRequest = ::exitApplication,
        state = windowState,
    ) {
        Text("Hello, World!", fontSize = 48.sp)
    }
}
```

v2 API 还支持了以往无法实现的场景，例如根据内容大小来调整窗口大小，同时在窗口变大时仍然允许内容展开（通过 `fillMaxSize()` 等修饰符）。
有关详细信息，请参阅 [Window 和 Dialog API v2](compose-desktop-top-level-windows-management.md#window-and-dialog-api-v2) 文档页面。

## 依赖项 {id="dependencies"}

| 库 | Maven 坐标 | 基于 Jetpack 版本 |
|---|---|---|
| Runtime | `org.jetbrains.compose.runtime:runtime*:1.12.2` | [Runtime 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.12.1) |
| UI | `org.jetbrains.compose.ui:ui*:1.12.2` | [UI 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.12.1) |
| Foundation | `org.jetbrains.compose.foundation:foundation*:1.12.2` | [Foundation 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.12.1) |
| Material | `org.jetbrains.compose.material:material*:1.12.2` | [Material 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-material#1.12.1) |
| Material3 | `org.jetbrains.compose.material3:material3*:1.12.0-alpha03` | [Material3 1.5.0-alpha22](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.5.0-alpha22) |
| Material3 Adaptive | `org.jetbrains.compose.material3.adaptive:adaptive*:1.3.0` | [Material3 Adaptive 1.3.0](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.3.0) |
| Lifecycle | `org.jetbrains.androidx.lifecycle:lifecycle-*:2.11.0` | [Lifecycle 2.11.0](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.11.0) |
| Navigation | `org.jetbrains.androidx.navigation:navigation-*:2.10.0-rc01` | [Navigation 2.10.0](https://developer.android.com/jetpack/androidx/releases/navigation#2.10.0) |
| Navigation3 | `org.jetbrains.androidx.navigation3:navigation3-*:1.2.0-rc01` | [Navigation3 1.2.0](https://developer.android.com/jetpack/androidx/releases/navigation3#1.2.0) |
| Navigation Event | `org.jetbrains.androidx.navigationevent:navigationevent-compose:1.1.0` | [Navigation Event 1.1.1](https://developer.android.com/jetpack/androidx/releases/navigationevent#1.1.1) |
| Savedstate | `org.jetbrains.androidx.savedstate:savedstate*:1.4.0` | [Savedstate 1.4.0](https://developer.android.com/jetpack/androidx/releases/savedstate#1.4.0) |
| WindowManager Core | `org.jetbrains.androidx.window:window-core:1.5.1` | [WindowManager 1.5.1](https://developer.android.com/jetpack/androidx/releases/window#1.5.1) |