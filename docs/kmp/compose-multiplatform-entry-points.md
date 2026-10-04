[//]: # (title: 原生应用程序入口点)

虽然 Compose Multiplatform UI 完全可以在通用代码中实现，
但实际的应用程序都是从原生入口点启动的。
您可以在这些入口点中改变应用的特定于平台的行为。

例如，在[由 KMP IDE 向导生成的基础项目](quickstart.md)中，
UI 的基础是通用代码中的 `App()` 函数。
随后会在各个平台上调用此函数：

* 在 Android 上，该调用由 activity 管理。
* 在 iOS 上，由视图控制器管理。
* 在桌面端，由窗口管理。
* 在 Web 端，由容器管理。

> 在这些示例中，`App()` 函数不接受任何形参。
> 在较大的应用程序中，通常会将形参传递给特定于平台的依赖项。
> 这些依赖项可以手动提供，也可以使用 SQL 注入库传递。
>
{style="tip"}

## 在 Android 上 {id="on-android"}

对于 Android，该调用是在名为 `MainActivity` 的 [Android activity](https://developer.android.com/guide/components/activities/intro-activities) 中的 `setContent()` lambda 内部进行的：

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        setContent {
            // 调用通用的 App() composable
            App()
        }
    }
}
```

Compose Multiplatform 提供了对所有 Jetpack Compose API 的访问权限，
但[其中某些 API 仅适用于 Android 应用](compose-android-only-components.md)。

## 在 iOS 上 {id="on-ios"}

对于 iOS，通用的 `App()` composable 是在一个[视图控制器](https://developer.apple.com/documentation/uikit/view_controllers)中调用的，
该控制器扮演着与 Android 上的 activity 相同的角色：

```kotlin
fun MainViewController() = ComposeUIViewController { App() }
```

iOS 视图控制器和 Android activity 都只是简单地调用通用代码中的 `App()` composable。

有关 Compose Multiplatform 与 iOS UI 框架集成的更多信息，
请参阅[与 SwiftUI 框架集成](compose-swiftui-integration.md)以及[与 UIKit 框架集成](compose-uikit-integration.md)。

## 在桌面端 {id="on-desktop"}

在桌面端，Compose Multiplatform 会构建到 JVM 应用中。
对通用 `App()` composable 的调用是在 `main()` 函数中进行的，
并包装在 `application()`（或 `singleWindowApplication()`）调用中：

```kotlin
fun main() = application {
    Window(
        onCloseRequest = ::exitApplication,
        title = "ComposeDemo"
    ) {
        App()
    }
}
```

通常，在 `application()` 函数内，您可以创建一个 `Window`，指定其属性，
并通过 `onCloseRequest` 回调定义关闭窗口时执行的操作。
在默认项目中，整个应用程序都会关闭（`::exitApplication`）。

与 Android 和 iOS 一样，`App()` composable 负责整个 UI 布局。

详细了解[桌面端特有的 Compose Multiplatform 组件](compose-desktop-components.md)以及 [Swing 互操作性](compose-desktop-swing-interoperability.md)。

## 在 Web 端 {id="on-web"}

Web 应用程序的代码位于默认项目的 `webApp` 模块中，
它在 `main.kt` 文件的 `main()` 函数中调用通用的 `App()` composable：

```kotlin
// Web API 处于实验阶段，需要选择启用 (opt-in)
@OptIn(ExperimentalComposeUiApi::class)
fun main() {
    // 为 Web 应用设置 Compose 环境
    ComposeViewport {
        // 生成 UI 布局
        App()
    }
}
```

有关 Web 入口点的更多信息，请参阅[设置视口](compose-css-styles.md)。

## 获取帮助 {id="get-help"}

* **Kotlin Slack**：获取帮助并参与有关 KMP 和 Compose Multiplatform 的讨论。
  申请[邀请](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)并加入
  [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU)
  和 [#compose](https://kotlinlang.slack.com/archives/CJLTWPH7S) 频道。
* **Kotlin 问题跟踪器**：[报告新问题](https://youtrack.jetbrains.com/newIssue?project=KT)。