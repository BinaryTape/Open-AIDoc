[//]: # (title: 原生應用程式入口點)

雖然 Compose Multiplatform UI 可以完全在共用程式碼中實作，
但實際的應用程式是從原生入口點啟動的。
這些入口點是你可以修改應用程式特定平台行為的地方。

例如，在[由 KMP IDE 精靈產生的基本專案](quickstart.md)中，
UI 的基礎是共用程式碼中的 `App()` 函式。
然後在各個平台上呼叫此函式：

* 在 Android 上，該呼叫由 activity 管理。
* 在 iOS 上，由 view controller 管理。
* 在桌面上，由視窗管理。
* 在 Web 上，由容器管理。

> 在這些範例中，`App()` 函式不接受任何參數。
> 在較大型的應用程式中，你通常會將參數傳遞給特定平台的相依性。
> 這些相依性可以手動提供，或是使用相依注入程式庫傳遞。
>
{style="tip"}

## 在 Android 上 {id="on-android"}

對於 Android，該呼叫是從名為 `MainActivity` 的 [Android activity](https://developer.android.com/guide/components/activities/intro-activities) 中的 `setContent()` Lambda 內部進行的：

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        setContent {
            // 呼叫共用的 App() composable
            App()
        }
    }
}
```

Compose Multiplatform 提供了對所有 Jetpack Compose API 的存取權，
但[其中某些 API 僅適用於 Android 應用程式](compose-android-only-components.md)。

## 在 iOS 上 {id="on-ios"}

對於 iOS，共用的 `App()` composable 是在 [view controller](https://developer.apple.com/documentation/uikit/view_controllers) 內呼叫的，
其扮演著與 Android 上的 activity 相同的角色：

```kotlin
fun MainViewController() = ComposeUIViewController { App() }
```

iOS 的 view controller 和 Android 的 activity 都只是單純叫用共用程式碼中的 `App()` composable。

如需進一步了解 Compose Multiplatform 與 iOS UI 架構的整合，
請參閱[與 SwiftUI 架構整合](compose-swiftui-integration.md)以及[與 UIKit 架構整合](compose-uikit-integration.md)。

## 在桌面上 {id="on-desktop"}

在桌面上，Compose Multiplatform 被建置到 JVM 應用程式中。
對共用 `App()` composable 的呼叫是在 `main()` 函式中進行的，
並封裝在 `application()`（或 `singleWindowApplication()`）呼叫中：

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

通常，在 `application()` 函式內部，你會建立一個 `Window`、指定其屬性，
並使用 `onCloseRequest` 回呼來定義關閉視窗時發生的行為。
在預設專案中，整個應用程式會關閉（`::exitApplication`）。

與 Android 和 iOS 一樣，`App()` composable 負責整個 UI 配置。

進一步了解[桌面專用的 Compose Multiplatform 元件](compose-desktop-components.md)
與 [Swing 互通性](compose-desktop-swing-interoperability.md)。

## 在 Web 上 {id="on-web"}

Web 應用程式（其程式碼位於預設專案的 `webApp` 模組中）
會從 `main.kt` 檔案中的 `main()` 函式呼叫共用的 `App()` composable：

```kotlin
// Web API 為實驗性功能，需要選擇加入 (opt-in)
@OptIn(ExperimentalComposeUiApi::class)
fun main() {
    // 為 Web 應用程式設定 Compose 環境
    ComposeViewport {
        // 產生 UI 配置
        App()
    }
}
```

如需進一步了解 Web 入口點，請參閱[設定視區 (viewport)](compose-css-styles.md)。

## 取得協助 {id="get-help"}

* **Kotlin Slack**：取得協助並參與關於 KMP 和 Compose Multiplatform 的討論。
  申請[邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)並加入
  [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU)
  與 [#compose](https://kotlinlang.slack.com/archives/CJLTWPH7S) 頻道。
* **Kotlin 問題追蹤器**：[回報新問題](https://youtrack.jetbrains.com/newIssue?project=KT)。