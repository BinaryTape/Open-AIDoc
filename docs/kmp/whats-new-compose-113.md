[//]: # (title: Compose Multiplatform %org.jetbrains.compose-eap% 的最新变化)

以下是此 EAP 版本的亮点：

* [在 SwiftUI 和 UIKit 中基于内容调整 Compose Multiplatform 视图大小](#content-based-sizing-for-compose-multiplatform-views-in-swiftui-and-uikit)
* [在 iOS 上保存和自动填充密码](#saving-and-autofilling-passwords)
* [WebGL 互操作](#webgl-interop)
* [借助 AppCDS 和 AOT 选项实现更快的桌面端启动](#faster-desktop-startup-with-appcds-or-aot)

您可以在 [GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.13.0-beta01) 上查看此版本的完整变更列表。

有关特定组件版本的详细信息，请参阅[依赖项](#dependencies)部分。
有关此版本中包含的 AndroidX Compose 运行时版本的变更，请参阅 [`androidx.compose.runtime` 版本说明](https://developer.android.com/jetpack/androidx/releases/compose-runtime#version_113_2)。

## 跨平台 {id="across-platforms"}

在之前的 Compose Multiplatform 版本中处于 Experimental 状态的几项功能现已变为 Stable。
您无需再主动选择启用（opt-in）即可使用它们：

* 在 iOS 上创建 `ComposeUIView()` 并使用 `ComposeUIViewportConfiguration` 进行配置。
* [使用 `ComposeViewportConfiguration` 为 Web 端配置 `ComposeViewport()`](compose-css-styles.md)。
* [使用 `preload` API 为 Web 端预加载资源](compose-web-resources.md#preload-resources-using-the-compose-multiplatform-preload-api)。

## iOS {id="ios"}

### 在 SwiftUI 和 UIKit 中基于内容调整 Compose Multiplatform 视图大小 {id="content-based-sizing-for-compose-multiplatform-views-in-swiftui-and-uikit"}

嵌入在 SwiftUI 或 UIKit 布局中的 Compose Multiplatform 视图现在可以根据可用空间报告首选大小。
原生容器可以使用此大小来适应 Compose 内容，例如，
在保持宽度固定的同时调整视图的高度，反之亦然。

Compose Multiplatform 视图默认使用 `PreferredSizeReportingStrategy.SizeThatFits`。
在 UIKit 中，您无需进行额外的尺寸调整配置。

在 SwiftUI 中，对于运行 iOS 16 或更高版本的设备，请保留此默认设置。
对于更低 iOS 版本上的 SwiftUI，请使用 `PreferredSizeReportingStrategy.IntrinsicContentSize`
并手动提供尺寸建议方案。

有关设置说明和示例，请参阅：

* [SwiftUI 中基于内容调整大小](compose-swiftui-integration.md#size-compose-views-to-fit-their-content)
* [UIKit 中基于内容调整大小](compose-uikit-integration.md#size-compose-views-to-fit-their-content)

### 保存和自动填充密码 {id="saving-and-autofilling-passwords"}
<primary-label ref="Experimental"/>

在 iOS 上，Compose Multiplatform 现在可以显示原生提示来保存登录凭据并自动填充 Compose 文本字段。
请将用户名和密码字段同时保留在屏幕上，以便 iOS 可以将该表单识别为登录表单。

要配置这些字段，请在您的 iOS 源集中使用 `PlatformImeOptions`。
为用户名设置 `textContentType(UITextContentTypeUsername)`，为密码设置 `isSecureTextEntry(true)`。
例如，在带有 `@OptIn(ExperimentalComposeUiApi::class)` 注解的可组合项中：

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

Compose Multiplatform 现在提供了一个用于渲染 [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) 纹理的实验性 API。
`WebGLRenderTarget` 公开了一个 Compose `Painter`，可以与其他 Compose UI 元素一起显示 WebGL 图形。

使用 `rememberWebGLRenderTarget()` 创建目标，使用 `render {}` 绘制内容，并在 `Image` 中显示其 `painter`。
例如，以下代码段在带有 `@OptIn(ExperimentalComposeUiApi::class)` 注解的可组合项内部渲染了一个蓝色纹理：

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

对于更高级的用例，`target` 还提供了对底层 WebGL 渲染上下文的访问权限。

### Web 上的系统窗口内边距（Window Insets） {id="system-window-insets-on-web"}
<primary-label ref="Experimental"/>

Web 端的 Compose Multiplatform 现在通过标准 `WindowInsets` API 支持系统窗口内边距。
您的 UI 可以实现全屏边到边（edge-to-edge）绘制，同时兼顾安全区域，包括刘海屏和屏幕键盘。

要启用此功能，请在 `ComposeViewport` 配置中将 `enableBrowserWindowInsets` 设置为 `true`。
使用标准 inset 修饰符调整布局：

```kotlin
ComposeViewport(configure = { enableBrowserWindowInsets = true }) {
    Box(Modifier.fillMaxSize().safeDrawingPadding()) {
        Text("Content within the safe drawing area")
    }
}
```

您还可以直接通过 `WindowInsets.safeDrawing` 和 `WindowInsets.ime` 等 API 访问这些内边距。

若要实现边到边渲染，请将 `viewport-fit=cover` 添加到页面的视口 `meta` 标签中：

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

> 如果没有 `viewport-fit=cover`，浏览器会应用安全区域内边距并报告零安全区域内边距。
> 如果在未进行此设置的情况下启用了浏览器窗口内边距，Compose Multiplatform 将记录一条警告日志。

### Web 上可配置的回退字体 {id="configurable-font-fallback-on-web"}

在上一版本中，我们为应用程序字体未涵盖的字符引入了[自动回退字体](compose-web-resources.md#automatic-font-fallback)。
此版本允许您选择回退字体的来源或禁用自动下载。

默认情况下，Compose Multiplatform 从 [Google Fonts](https://fonts.gstatic.com/s/) 下载回退字体。
若要使用其他来源，请在窗口配置中设置 `fontFallbackUrl`：

```kotlin
createComposeWindow(
    configure = { fontFallbackUrl = "https://custom.fonts.com" }
) {
    BasicText("გამარჯობა")
}
```

若要禁用自动回退字体，请将 `fontFallbackUrl` 设置为 `null`：

```kotlin
createComposeWindow(
    configure = { fontFallbackUrl = null }
) {
    BasicText("გამარჯობა")
}
```

## 桌面端 {id="desktop"}

### 借助 AppCDS 或 AOT 实现更快的桌面端启动 {id="faster-desktop-startup-with-appcds-or-aot"}

Compose Multiplatform 现在为桌面端应用程序支持 [应用程序类数据共享（AppCDS）](https://openjdk.org/jeps/310) 和 
[提前（AOT）缓存](https://openjdk.org/jeps/514)。这两种方式都使用归档文件来缩短启动时间。

在小型演示应用程序的基准测试中，预构建的 AOT 缓存减少了冷启动时间：

* 在 macOS（M1 Ultra）上，从 2017 ms 缩减至 424 ms — 快了 4.8 倍。
* 在 Windows（Dell Precision 5690）上，从 1356 ms 缩减至 650 ms — 快了 2.1 倍。

这些测试指标覆盖了从启动进程到显示窗口的时间。
具体结果取决于应用程序和运行环境。
为了实现 AOT 启动优化，我们建议使用最新的 [JetBrains Runtime (JBR) 25](https://github.com/JetBrains/JetBrainsRuntime) 版本。

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

根据您的 JDK 版本和打包需求选择模式：

| 模式 | 最低 JDK | 行为 |
|------------------|-------------|------------------------------------------------------------------------------------------------|
| `None` | — | 默认值，不进行启动优化。 |
| `AppCdsAuto` | 19 | 在用户的第一个会话结束时创建 AppCDS 归档，从而加速后续启动。 |
| `AppCdsPrebuild` | 21 | 在打包前创建 AppCDS 归档，从首次启动即可提速。 |
| `AotPrebuild` | 25 | 在打包前创建 AOT 缓存，同时改善链接和 JIT 预热。 |

两种预构建模式都会在打包期间运行应用程序以创建归档。
在此缓存生成运行期间，插件会将 `compose.aot.training-run` 系统属性设置为 `true`。

请注意，由于应用程序包含了这些归档文件，预构建模式会增加可分发包的大小。

### macOS 和 Windows 上更流畅的窗口调整大小体验 {id="smoother-window-resizing-on-macos-and-windows"}

Compose Multiplatform 现在在使用 macOS 上的 Metal 或 Windows 上的 DirectX 时，支持更流畅的交互式窗口大小调整。
渲染与窗口大小调整保持同步，从而减少卡顿并防止窗口边缘出现白条。

若要启用此行为，请在显示任何窗口之前将对应渲染器的系统属性设置为 `true`。
可以使用 `System.setProperty()` 或 JVM `-D` 标志进行设置：

* 采用 Metal 的 macOS：`skiko.rendering.macos.metalSynchronousLiveResize`
* 采用 DirectX 的 Windows：`skiko.rendering.windows.direct3DSynchronousLiveResize`

该功能要求 Compose 内容填满整个窗口。

## 依赖项 {id="dependencies"}

| 库 | Maven 坐标 | 基于的 Jetpack 版本 |
|--------------------|------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Runtime | `org.jetbrains.compose.runtime:runtime*:1.13.0-beta02` | [Runtime 1.13.0-beta02](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.13.0-beta02) |
| UI | `org.jetbrains.compose.ui:ui*:1.13.0-beta02` | [UI 1.13.0-beta02](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.13.0-beta02) |
| Foundation | `org.jetbrains.compose.foundation:foundation*:1.13.0-beta02` | [Foundation 1.13.0-beta02](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.13.0-beta02) |
| Material | `org.jetbrains.compose.material:material*:1.13.0-beta02` | [Material 1.13.0-beta02](https://developer.android.com/jetpack/androidx/releases/compose-material#1.13.0-beta02) |
| Material3 | `org.jetbrains.compose.material3:material3*:1.13.0-beta02` | [Material3 1.5.0-beta02](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.5.0-beta02) |
| Material3 Adaptive | `org.jetbrains.compose.material3.adaptive:adaptive*:1.4.0-alpha01` | [Material3 Adaptive 1.4.0-alpha03](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.4.0-alpha03) |
| Lifecycle | `org.jetbrains.androidx.lifecycle:lifecycle-*:2.11.0` | [Lifecycle 2.11.0](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.11.0) |
| Navigation | `org.jetbrains.androidx.navigation:navigation-*:2.10.0` | [Navigation 2.10.0](https://developer.android.com/jetpack/androidx/releases/navigation#2.10.0) |
| Navigation3 | `org.jetbrains.androidx.navigation3:navigation3-*:1.2.0` | [Navigation3 1.2.0](https://developer.android.com/jetpack/androidx/releases/navigation3#1.2.0) |
| Navigation Event | `org.jetbrains.androidx.navigationevent:navigationevent-compose:1.1.0` | [Navigation Event 1.1.1](https://developer.android.com/jetpack/androidx/releases/navigationevent#1.1.1) |
| Savedstate | `org.jetbrains.androidx.savedstate:savedstate*:1.4.0` | [Savedstate 1.4.0](https://developer.android.com/jetpack/androidx/releases/savedstate#1.4.0) |
| WindowManager Core | `org.jetbrains.androidx.window:window-core:1.5.1` | [WindowManager 1.5.1](https://developer.android.com/jetpack/androidx/releases/window#1.5.1) |