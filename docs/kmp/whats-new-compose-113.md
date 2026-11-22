[//]: # (title: Compose Multiplatform %org.jetbrains.compose-eap% 的最新变化)

以下是此 EAP 版本的重点内容：

* [SwiftUI 与 UIKit 中基于内容调整 Compose Multiplatform 视图大小](#content-based-sizing-for-compose-multiplatform-views-in-swiftui-and-uikit)
* [在 iOS 上保存和自动填充密码](#saving-and-autofilling-passwords)
* [WebGL 互操作](#webgl-interop)
* [通过 AppCDS 和 AOT 选项实现更快的桌面端启动](#faster-desktop-startup-with-appcds-or-aot)

您可以在 [GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.13.0-beta01) 上查看此版本的完整变更列表。

有关特定组件版本的详细信息，请参阅[依赖项](#dependencies)部分。
关于此版本中包含的 AndroidX Compose 运行时版本的变更，请参阅 [`androidx.compose.runtime` 发行说明](https://developer.android.com/jetpack/androidx/releases/compose-runtime#version_113_2)。

## 跨平台 {id="across-platforms"}

在以往的 Compose Multiplatform 版本中处于[实验性](supported-platforms.md#general-kotlin-stability-levels)阶段的多项功能现已[稳定](supported-platforms.md#general-kotlin-stability-levels)。
您不再需要显式选择启用（opt-in）即可使用它们：

* 在 iOS 上创建 `ComposeUIView()` 并通过 `ComposeUIViewportConfiguration` 对其进行配置。
* [使用 `ComposeViewportConfiguration` 为 Web 端配置 `ComposeViewport()`](compose-css-styles.md)。
* [使用 `preload` API 为 Web 端预加载资源](compose-web-resources.md#preload-resources-using-the-compose-multiplatform-preload-api)。

## iOS {id="ios"}

### SwiftUI 与 UIKit 中基于内容调整 Compose Multiplatform 视图大小 {id="content-based-sizing-for-compose-multiplatform-views-in-swiftui-and-uikit"}

嵌入在 SwiftUI 或 UIKit 布局中的 Compose Multiplatform 视图现在可以根据可用空间报告首选大小（preferred size）。
原生容器可以使用此大小来自适应 Compose 内容，例如在保持宽度固定的同时调整视图的高度，反之亦然。

Compose Multiplatform 视图默认使用 `PreferredSizeReportingStrategy.SizeThatFits`。
在 UIKit 中，无需进行额外的尺寸配置。

在 SwiftUI 中，运行 iOS 16 或更高版本的设备建议保留此默认设置。
对于运行较低 iOS 版本的 SwiftUI，请使用 `PreferredSizeReportingStrategy.IntrinsicContentSize` 并手动提供尺寸建议。

有关设置说明和示例，请参阅：

* [SwiftUI 中基于内容调整大小](compose-swiftui-integration.md#size-compose-views-to-fit-their-content)
* [UIKit 中基于内容调整大小](compose-uikit-integration.md#size-compose-views-to-fit-their-content)

### 保存和自动填充密码 {id="saving-and-autofilling-passwords"}
<primary-label ref="Experimental"/>

在 iOS 上，Compose Multiplatform 现在可以显示原生提示来保存登录凭据并自动填充 Compose 文本字段。
请将用户名和密码字段同时保留在屏幕上，以便 iOS 将该表单识别为登录表单。

要配置这些字段，请在 iOS 源集（source set）中使用 `PlatformImeOptions`。
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

Compose Multiplatform 现在提供了用于渲染 [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) 纹理的实验性 API。
`WebGLRenderTarget` 公开了一个 Compose `Painter`，可在其他 Compose UI 元素旁边显示 WebGL 图形。

使用 `rememberWebGLRenderTarget()` 创建目标，使用 `render {}` 在其上绘制，并在 `Image` 中显示其 `painter`。
例如，以下代码段在带有 `@OptIn(ExperimentalComposeUiApi::class)` 注解的可组合项内渲染一个蓝色纹理：

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

对于更高级的用例，`target` 还允许直接访问底层的 WebGL 渲染上下文。

### Web 上的系统窗口 Inset {id="system-window-insets-on-web"}
<primary-label ref="Experimental"/>

Web 端 Compose Multiplatform 现在通过标准 `WindowInsets` API 支持系统窗口 inset。
您的 UI 可以在实现边到边（edge-to-edge）绘制的同时兼顾安全区（safe areas），包括屏幕缺口和屏幕软键盘。

要启用此功能，请在 `ComposeViewport` 配置中将 `enableBrowserWindowInsets` 设置为 `true`。
使用标准 inset 修饰符即可调整布局：

```kotlin
ComposeViewport(configure = { enableBrowserWindowInsets = true }) {
    Box(Modifier.fillMaxSize().safeDrawingPadding()) {
        Text("Content within the safe drawing area")
    }
}
```

您还可以通过 `WindowInsets.safeDrawing` 和 `WindowInsets.ime` 等 API 直接访问这些 inset。

如需边到边渲染，请在页面的 viewport `meta` 标签中添加 `viewport-fit=cover`：

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

> 如果缺少 `viewport-fit=cover`，浏览器会应用安全区内边距并报告为零的安全区 inset。
> 若在未添加此设置的情况下启用了浏览器窗口 inset，Compose Multiplatform 将输出警告日志。

### Web 上可配置的字体回退 {id="configurable-font-fallback-on-web"}

在上一版本中，我们针对应用程序字体未覆盖的字符引入了[自动字体回退](compose-web-resources.md#automatic-font-fallback)。
此版本允许您自选回退字体的来源，或直接禁用自动下载。

默认情况下，Compose Multiplatform 会从 [Google Fonts](https://fonts.gstatic.com/s/) 下载回退字体。
如需使用其他来源，请在窗口配置中设置 `fontFallbackUrl`：

```kotlin
createComposeWindow(
    configure = { fontFallbackUrl = "https://custom.fonts.com" }
) {
    BasicText("გამარჯობა")
}
```

如需禁用自动字体回退，请将 `fontFallbackUrl` 设置为 `null`：

```kotlin
createComposeWindow(
    configure = { fontFallbackUrl = null }
) {
    BasicText("გამარჯობა")
}
```

## Desktop {id="desktop"}

### 借助 AppCDS 或 AOT 加快桌面端启动 {id="faster-desktop-startup-with-appcds-or-aot"}

Compose Multiplatform 现已支持针对桌面应用程序的 [应用程序类数据共享 (AppCDS)](https://openjdk.org/jeps/310) 与 [预先编译 (AOT) 缓存](https://openjdk.org/jeps/514)。这两种选项均通过归档文件来减少启动时间。

在一个小型 Demo 应用程序的基准测试中，预构建的 AOT 缓存显著缩短了冷启动时间：

* 在 macOS (M1 Ultra) 上，从 2017 ms 缩减至 424 ms —— 提速 4.8 倍。
* 在 Windows (Dell Precision 5690) 上，从 1356 ms 缩减至 650 ms —— 提速 2.1 倍。

这些测试测量了从启动进程到显示窗口所经历的时间。
实际结果取决于具体的应用程序和环境。
对于 AOT 启动优化，建议使用最新的 [JetBrains Runtime (JBR) 25](https://github.com/JetBrains/JetBrainsRuntime) 版本。

要启用这些启动选项，请在 `build.gradle.kts` 文件中配置 `aot {}` 代码块：

```kotlin
compose.desktop {
    application {
        aot {
            mode = AotMode.AotPrebuild
        }
    }
}
```

请根据您的 JDK 版本和打包需求选择模式：

| 模式 | 最低 JDK | 行为 |
|------------------|-------------|------------------------------------------------------------------------------------------------|
| `None` | — | 默认值，不进行启动优化。 |
| `AppCdsAuto` | 19 | 在用户的首次会话结束时创建 AppCDS 归档，从而加快后续启动速度。 |
| `AppCdsPrebuild` | 21 | 在打包前创建 AppCDS 归档，从首次启动起即加快启动速度。 |
| `AotPrebuild` | 25 | 在打包前创建 AOT 缓存，同时提升链接性能和 JIT 预热速度。 |

两种预构建模式均会在打包过程中运行您的应用程序以生成归档。
在此缓存生成运行期间，插件会将 `compose.aot.training-run` 系统属性设置为 `true`。

请注意，由于应用程序中包含了归档文件，预构建模式会增加可分发包的体积。

### macOS 和 Windows 上更平滑的窗口大小调整 {id="smoother-window-resizing-on-macos-and-windows"}

在 macOS 上使用 Metal 或在 Windows 上使用 DirectX 时，Compose Multiplatform 现在支持更平滑的交互式窗口大小调整。
渲染将与窗口大小调整保持同步，从而减少卡顿并防止窗口边缘出现白色条带。

要启用此行为，请在显示任何窗口之前将对应渲染器的系统属性设置为 `true`。
可通过 `System.setProperty()` 或 JVM 的 `-D` 参数进行设置：

* 使用 Metal 的 macOS：`skiko.rendering.macos.metalSynchronousLiveResize`
* 使用 DirectX 的 Windows：`skiko.rendering.windows.direct3DSynchronousLiveResize`

该功能要求 Compose 内容填满整个窗口。

## 依赖项 {id="dependencies"}

| 库 | Maven 坐标 | 基于 Jetpack 版本 |
|--------------------|------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Runtime | `org.jetbrains.compose.runtime:runtime*:1.13.0-rc01` | [Runtime 1.13.0-rc01](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.13.0-rc01) |
| UI | `org.jetbrains.compose.ui:ui*:1.13.0-rc01` | [UI 1.13.0-rc01](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.13.0-rc01) |
| Foundation | `org.jetbrains.compose.foundation:foundation*:1.13.0-rc01` | [Foundation 1.13.0-rc01](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.13.0-rc01) |
| Material | `org.jetbrains.compose.material:material*:1.13.0-rc01` | [Material 1.13.0-rc01](https://developer.android.com/jetpack/androidx/releases/compose-material#1.13.0-rc01) |
| Material3 | `org.jetbrains.compose.material3:material3*:1.13.0-rc01` | [Material3 1.5.0-rc01](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.5.0-rc01) |
| Material3 Adaptive | `org.jetbrains.compose.material3.adaptive:adaptive*:1.4.0-alpha01` | [Material3 Adaptive 1.4.0-alpha03](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.4.0-alpha03) |
| Lifecycle | `org.jetbrains.androidx.lifecycle:lifecycle-*:2.11.0` | [Lifecycle 2.11.0](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.11.0) |
| Navigation | `org.jetbrains.androidx.navigation:navigation-*:2.10.0` | [Navigation 2.10.0](https://developer.android.com/jetpack/androidx/releases/navigation#2.10.0) |
| Navigation3 | `org.jetbrains.androidx.navigation3:navigation3-*:1.2.0` | [Navigation3 1.2.0](https://developer.android.com/jetpack/androidx/releases/navigation3#1.2.0) |
| Navigation Event | `org.jetbrains.androidx.navigationevent:navigationevent-compose:1.1.0` | [Navigation Event 1.1.1](https://developer.android.com/jetpack/androidx/releases/navigationevent#1.1.1) |
| Savedstate | `org.jetbrains.androidx.savedstate:savedstate*:1.4.0` | [Savedstate 1.4.0](https://developer.android.com/jetpack/androidx/releases/savedstate#1.4.0) |
| WindowManager Core | `org.jetbrains.androidx.window:window-core:1.5.1` | [WindowManager 1.5.1](https://developer.android.com/jetpack/androidx/releases/window#1.5.1) |