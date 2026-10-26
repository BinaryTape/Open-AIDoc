[//]: # (title: Compose Multiplatform %org.jetbrains.compose-eap% 的最新变化)

以下是此 EAP 版本的重点更新：

* [在 SwiftUI 和 UIKit 中基于内容的 Compose Multiplatform 视图尺寸自适应](#content-based-sizing-for-compose-multiplatform-views-in-swiftui-and-uikit)
* [在 iOS 上保存和自动填充密码](#saving-and-autofilling-passwords)
* [WebGL 互操作](#webgl-interop)
* [利用 AppCDS 和 AOT 选项加速桌面端启动](#faster-desktop-startup-with-appcds-or-aot)

你可以在 [GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.13.0-beta01) 上查看此版本的完整变更列表。
有关特定组件版本的详细信息，请参阅[依赖项](#dependencies)部分。

## 跨平台 {id="across-platforms"}

在之前的 Compose Multiplatform 版本中处于实验性（Experimental）阶段的几项功能现已稳定。
你不再需要选择加入（opt in）即可使用它们：

* 在 iOS 上创建 `ComposeUIView()` 并使用 `ComposeUIViewportConfiguration` 进行配置。
* [使用 `ComposeViewportConfiguration` 为 Web 端配置 `ComposeViewport()`](compose-css-styles.md)。
* [使用 `preload` API 为 Web 端预加载资源](compose-web-resources.md#preload-resources-using-the-compose-multiplatform-preload-api)。

## iOS {id="ios"}

### 在 SwiftUI 和 UIKit 中基于内容的 Compose Multiplatform 视图尺寸自适应 {id="content-based-sizing-for-compose-multiplatform-views-in-swiftui-and-uikit"}

嵌入在 SwiftUI 或 UIKit 中的 Compose Multiplatform 视图现在可以根据可用的父级空间上报首选尺寸。
原生容器可以使用此尺寸来适配 Compose 内容，例如在保持视图宽度固定的同时调整其高度。

在 iOS 16 及更高版本上，Compose Multiplatform 视图默认使用 `PreferredSizeReportingStrategy.SizeThatFits`，
因此无需额外的尺寸配置。

在 Kotlin 端创建 Compose 视图：

```kotlin
val view = ComposeUIView {
    Text("Hello from Compose")
}
```

然后，在 SwiftUI 的 `UIViewRepresentable` 包装器中，将建议尺寸传递给 `sizeThatFits()`。
对于 SwiftUI 未指定的维度，请使用 `UIView.noIntrinsicMetric`：

```swift
@available(iOS 16.0, *)
func sizeThatFits(
    _ proposal: ProposedViewSize,
    uiView: UIView,
    context: Context
) -> CGSize? {
    uiView.sizeThatFits(
        CGSize(
            width: proposal.width ?? UIView.noIntrinsicMetric,
            height: proposal.height ?? UIView.noIntrinsicMetric
        )
    )
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="func sizeThatFits( _ proposal: ProposedViewSize, uiView: UIView, "}

在 UIKit 中，在 Auto Layout 设置了 Compose Multiplatform 视图的宽度之后，
使用 `sizeThatFits()` 获取其首选高度并更新其高度约束：

```swift
let preferredSize = uiView.sizeThatFits(
    CGSize(
        width: uiView.bounds.width,
        height: UIView.noIntrinsicMetric
    )
)
heightConstraint.constant = preferredSize.height
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="let preferredSize = uiView.sizeThatFits("}

### 保存和自动填充密码 {id="saving-and-autofilling-passwords"}
<primary-label ref="Experimental"/>

在 iOS 上，Compose Multiplatform 现在可以显示原生提示以保存登录凭据并自动填充 Compose 文本字段。
请将用户名和密码字段同时保留在屏幕上，以便 iOS 可以将该表单识别为登录表单。

要配置这些字段，请在 iOS 源集中使用 `PlatformImeOptions`。
为用户名设置 `textContentType(UITextContentTypeUsername)`，并为密码设置 `isSecureTextEntry(true)`。
例如，在带有 `@OptIn(ExperimentalComposeUiApi::class)` 注解的可组合项内：

```kotlin
var username by remember { mutableStateOf("") }
var password by remember { mutableStateOf("") }

Column {
    TextField(
        value = username,
        onValueChange = { username = it },
        keyboardOptions = KeyboardOptions(
            keyboardType = KeyboardType.Email,
            platformImeOptions = PlatformImeOptions {
                textContentType(UITextContentTypeUsername)
            }
        )
    )

    TextField(
        value = password,
        onValueChange = { password = it },
        visualTransformation = PasswordVisualTransformation(),
        keyboardOptions = KeyboardOptions(
            keyboardType = KeyboardType.Password,
            platformImeOptions = PlatformImeOptions {
                isSecureTextEntry(true)
            }
        )
    )
}
```

## Web {id="web"}

### WebGL 互操作 {id="webgl-interop"}
<primary-label ref="Experimental"/>

Compose Multiplatform 现在提供了用于渲染 [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) 纹理的实验性 API。
`WebGLRenderTarget` 提供了一个 Compose `Painter`，可以与其他 Compose UI 元素一起显示 WebGL 图形。

使用 `rememberWebGLRenderTarget()` 创建目标，使用 `render {}` 向其中绘制，并在 `Image` 中显示其 `painter`。
例如，以下代码片段在带有 `@OptIn(ExperimentalComposeUiApi::class)` 的可组合项中渲染蓝色纹理：

```kotlin
val target = rememberWebGLRenderTarget(IntSize(64, 64))

if (target != null) {
    LaunchedEffect(target) {
        target.render {
            with(target.webGLContext) {
                disable(WebGLRenderingContext.SCISSOR_TEST)
                clearColor(0.15f, 0.55f, 1f, 1f)
                clear(WebGLRenderingContext.COLOR_BUFFER_BIT)
            }
        }
    }

    Image(
        painter = target.painter,
        contentDescription = "A blue WebGL texture",
        modifier = Modifier.size(200.dp),
    )
}
```

对于更高级的用例，`target` 还允许访问底层 WebGL 渲染上下文。

### Web 上的系统窗口边距 {id="system-window-insets-on-web"}
<primary-label ref="Experimental"/>

Compose Multiplatform for Web 现在通过标准 `WindowInsets` API 支持系统窗口边距（System window insets）。
你的 UI 可以在实现边到边（edge-to-edge）绘制的同时兼顾安全区域，包括屏幕刘海/挖孔和屏幕软键盘。

要启用此功能，请在 `ComposeViewport` 配置中将 `enableBrowserWindowInsets` 设置为 `true`。
使用标准 inset 修饰符调整布局：

```kotlin
ComposeViewport(configure = { enableBrowserWindowInsets = true }) {
    Box(Modifier.fillMaxSize().safeDrawingPadding()) {
        Text("Content within the safe drawing area")
    }
}
```

你还可以直接通过 `WindowInsets.safeDrawing` 和 `WindowInsets.ime` 等 API 访问这些边距。

若要实现边到边渲染，请在页面的视口 `meta` 标记中添加 `viewport-fit=cover`：

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

> 如果没有 `viewport-fit=cover`，浏览器会应用安全区域内边距并报告为零的安全区域边距。
> 如果在没有此设置的情况下启用了浏览器窗口边距，Compose Multiplatform 将记录一条警告日志。

### Web 上的可配置字体回退 {id="configurable-font-fallback-on-web"}

在上一版本中，我们针对应用程序字体未涵盖的字符引入了[自动字体回退](compose-web-resources.md#automatic-font-fallback)。
此版本允许你选择回退字体的来源或禁用自动下载。

默认情况下，Compose Multiplatform 从 [Google Fonts](https://fonts.gstatic.com/s/) 下载回退字体。
要使用其他来源，请在窗口配置中设置 `fontFallbackUrl`：

```kotlin
createComposeWindow(
    configure = { fontFallbackUrl = "https://custom.fonts.com" }
) {
    BasicText("გამარჯობა")
}
```

要禁用自动字体回退，请将 `fontFallbackUrl` 设置为 `null`：

```kotlin
createComposeWindow(
    configure = { fontFallbackUrl = null }
) {
    BasicText("გამარჯობა")
}
```

## 桌面端 {id="desktop"}

### 利用 AppCDS 或 AOT 加速桌面端启动 {id="faster-desktop-startup-with-appcds-or-aot"}

Compose Multiplatform 现在为桌面应用程序支持 [Application Class-Data Sharing (AppCDS)](https://openjdk.org/jeps/310) 和 
[Ahead-of-Time (AOT) 缓存](https://openjdk.org/jeps/514)。
这两种选项都使用归档文件来缩短启动时间。

在小型演示应用程序的基准测试中，预构建的 AOT 缓存显著缩短了冷启动时间：

* 在 macOS（M1 Ultra）上，从 2017 ms 减少到 424 ms — 快了 4.8 倍。
* 在 Windows（Dell Precision 5690）上，从 1356 ms 减少到 650 ms — 快了 2.1 倍。

这些测试覆盖了从启动进程到显示窗口的时间。
具体结果取决于应用程序和运行环境。
对于 AOT 启动优化，我们推荐使用最新的 [JetBrains Runtime (JBR) 25](https://github.com/JetBrains/JetBrainsRuntime) 版本。

要启用这些启动选项，请在 `build.gradle.kts` 文件中配置 `aot {}` 块：

```kotlin
compose.desktop {
    application {
        aot {
            mode = AotMode.AotPrebuild
        }
    }
}
```

根据你的 JDK 版本和打包需求选择合适的模式：

| 模式             | 最低 JDK | 行为                                                                                       |
|------------------|-------------|------------------------------------------------------------------------------------------------|
| `None`           | —           | 默认，不进行启动优化。                                                             |
| `AppCdsAuto`     | 19          | 在用户的第一次会话结束时创建 AppCDS 归档，从而加速后续启动。 |
| `AppCdsPrebuild` | 21          | 在打包之前创建 AppCDS 归档，从而从首次启动开始实现加速。         |
| `AotPrebuild`    | 25          | 在打包之前创建 AOT 缓存，同时改善链接和 JIT 预热。                  |

两种预构建模式都会在打包期间运行你的应用程序以创建归档。
在此缓存生成运行期间，插件会将 `compose.aot.training-run` 系统属性设置为 `true`。

请注意，预构建模式会增加可分发文件的大小，因为应用程序中包含了归档文件。

### macOS 和 Windows 上更平滑的窗口大小调整 {id="smoother-window-resizing-on-macos-and-windows"}

Compose Multiplatform 现在在 macOS 上使用 Metal 或在 Windows 上使用 DirectX 时支持更平滑的交互式窗口大小调整。
渲染与窗口大小调整保持同步，从而减少卡顿并防止沿窗口边缘出现白条。

要启用此行为，请在显示任何窗口之前将对应渲染器的系统属性设置为 `true`。
可以使用 `System.setProperty()` 或 JVM `-D` 标志进行设置：

* macOS（使用 Metal）：`skiko.rendering.macos.metalSynchronousLiveResize`
* Windows（使用 DirectX）：`skiko.rendering.windows.direct3DSynchronousLiveResize`

该功能要求 Compose 内容填满整个窗口。

## 依赖项 {id="dependencies"}

| 库            | Maven 坐标                                                      | 基于 Jetpack 版本                                                                                                             |
|--------------------|------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Runtime            | `org.jetbrains.compose.runtime:runtime*:1.13.0-beta01`                 | [Runtime 1.13.0-beta01](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.13.0-beta01)                       |
| UI                 | `org.jetbrains.compose.ui:ui*:1.13.0-beta01`                           | [UI 1.13.0-beta01](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.13.0-beta01)                                 |
| Foundation         | `org.jetbrains.compose.foundation:foundation*:1.13.0-beta01`           | [Foundation 1.13.0-beta01](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.13.0-beta01)                 |
| Material           | `org.jetbrains.compose.material:material*:1.13.0-beta01`               | [Material 1.13.0-beta01](https://developer.android.com/jetpack/androidx/releases/compose-material#1.13.0-beta01)                     |
| Material3          | `org.jetbrains.compose.material3:material3*:1.13.0-beta01`             | [Material3 1.5.0-beta01](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.5.0-beta01)                     |
| Material3 Adaptive | `org.jetbrains.compose.material3.adaptive:adaptive*:1.4.0-alpha01`     | [Material3 Adaptive 1.4.0-alpha03](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.4.0-alpha03) |
| Lifecycle          | `org.jetbrains.androidx.lifecycle:lifecycle-*:2.11.0`                  | [Lifecycle 2.11.0](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.11.0)                                         |
| Navigation         | `org.jetbrains.androidx.navigation:navigation-*:2.10.0`                | [Navigation 2.10.0](https://developer.android.com/jetpack/androidx/releases/navigation#2.10.0)                                       |
| Navigation3        | `org.jetbrains.androidx.navigation3:navigation3-*:1.2.0`               | [Navigation3 1.2.0](https://developer.android.com/jetpack/androidx/releases/navigation3#1.2.0)                                       |
| Navigation Event   | `org.jetbrains.androidx.navigationevent:navigationevent-compose:1.1.0` | [Navigation Event 1.1.1](https://developer.android.com/jetpack/androidx/releases/navigationevent#1.1.1)                              |
| Savedstate         | `org.jetbrains.androidx.savedstate:savedstate*:1.4.0`                  | [Savedstate 1.4.0](https://developer.android.com/jetpack/androidx/releases/savedstate#1.4.0)                                         |
| WindowManager Core | `org.jetbrains.androidx.window:window-core:1.5.1`                      | [WindowManager 1.5.1](https://developer.android.com/jetpack/androidx/releases/window#1.5.1)                                          |