[//]: # (title: Compose Multiplatform 中的最新变化 %org.jetbrains.compose-eap%)

以下是此抢先体验计划 (EAP) 版本的亮点：

 * [适用于 Web 的自动字体回退](#automatic-font-fallback)
 * [Compose Hot Reload 中适用于 AI 代理的 MCP 服务器](#mcp-server-for-ai-agents-in-compose-hot-reload)

您可以在 [GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.12.0-beta01) 上找到此版本的完整变更列表。
有关特定组件版本的详细信息，请参阅[依赖项](#dependencies)部分。

## 跨平台

### Skia 已更新至 Milestone 150

Compose Multiplatform 通过 Skiko 使用的 Skia 版本已更新至 Milestone 150。

在 Compose Multiplatform 1.11 中使用的上一个版本是 Milestone 144。
您可以在[发行说明](https://skia.googlesource.com/skia/+/refs/heads/chrome/m150/RELEASE_NOTES.md)中查看这些版本之间的变更。

此更新还解决了 iOS 上已经捆绑了自有 Skia 库的应用（例如基于 Chromium 的应用）的重复符号冲突。

## iOS

### 改进了延迟布局的滚动性能

适用于 iOS 的 Compose Multiplatform 现在为延迟布局提供了更佳的滚动性能。
列表项停用在绘制阶段之外执行，使绘制阶段能够更快完成，从而实现更平滑的滚动。

## Web

### 自动字体回退
<primary-label ref="Experimental"/>

此前，应用加载的字体未涵盖的字符会被显示为替换字形（□，即“豆腐块”/“tofu”）。

现在，当渲染过程中遇到未解析的字符时，适用于 Web 的 Compose Multiplatform 会根据需要自动下载所需的 Noto 字体子集。
下载字体后，Compose 会对受影响的文本进行重组。
请注意，在获取到所需的字体之前，“豆腐块”可能会短暂出现。

## 桌面端

### Compose Hot Reload 中适用于 AI 代理的 MCP 服务器
<primary-label ref="Experimental"/>

Compose Hot Reload 现在附带了一个实验性的 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 服务器，允许 AI 编码代理直接与运行中的 Compose 应用程序进行交互。

在此之前，当 AI 代理编辑 Compose 代码时，没有可靠的方法来验证结果：代理无法确认热重载是否成功，无法看到渲染后的 UI，也无法读取运行时日志或异常。通过 MCP 服务器，代理可以触发重载、拍摄屏幕截图、检查语义树、模拟点击和输入，以及读取应用程序日志，而无需您的人工干预。

有关 AI 代理可用的 MCP 工具完整列表以及如何连接它的信息，请参阅 [AI 代理的 MCP 服务器](compose-hot-reload.md#mcp-server-for-ai-agents)。

## 依赖项

| 库 | Maven 坐标 | 基于 Jetpack 版本 |
|--------------------|------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| Runtime | `org.jetbrains.compose.runtime:runtime*:1.12.0-beta03` | [Runtime 1.12.0-beta02](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.12.0-beta02) |
| UI | `org.jetbrains.compose.ui:ui*:1.12.0-beta03` | [UI 1.12.0-beta02](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.12.0-beta02) |
| Foundation | `org.jetbrains.compose.foundation:foundation*:1.12.0-beta03` | [Foundation 1.12.0-beta02](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.12.0-beta02) |
| Material | `org.jetbrains.compose.material:material*:1.12.0-beta03` | [Material 1.12.0-beta02](https://developer.android.com/jetpack/androidx/releases/compose-material#1.12.0-beta02) |
| Material3 | `org.jetbrains.compose.material3:material3*:1.12.0-alpha03` | [Material3 1.5.0-alpha22](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.5.0-alpha22) |
| Material3 Adaptive | `org.jetbrains.compose.material3.adaptive:adaptive*:1.3.0-beta02` | [Material3 Adaptive 1.3.0-beta02](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.3.0-beta02) |
| Lifecycle | `org.jetbrains.androidx.lifecycle:lifecycle-*:2.11.0` | [Lifecycle 2.11.0](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.11.0) |
| Navigation | `org.jetbrains.androidx.navigation:navigation-*:2.10.0-alpha02` | [Navigation 2.10.0-alpha05](https://developer.android.com/jetpack/androidx/releases/navigation#2.10.0-alpha05) |
| Navigation3 | `org.jetbrains.androidx.navigation3:navigation3-*:1.2.0-alpha02` | [Navigation3 1.2.0-alpha04](https://developer.android.com/jetpack/androidx/releases/navigation3#1.2.0-alpha04) |
| Navigation Event | `org.jetbrains.androidx.navigationevent:navigationevent-compose:1.1.0` | [Navigation Event 1.1.1](https://developer.android.com/jetpack/androidx/releases/navigationevent#1.1.1) |
| Savedstate | `org.jetbrains.androidx.savedstate:savedstate*:1.4.0` | [Savedstate 1.4.0](https://developer.android.com/jetpack/androidx/releases/savedstate#1.4.0) |
| WindowManager Core | `org.jetbrains.androidx.window:window-core:1.5.1` | [WindowManager 1.5.1](https://developer.android.com/jetpack/androidx/releases/window#1.5.1) |