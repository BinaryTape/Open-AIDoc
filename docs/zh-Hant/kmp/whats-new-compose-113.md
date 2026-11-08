[//]: # (title: Compose Multiplatform %org.jetbrains.compose-eap% 的新功能)

以下是本次 EAP 版本的主要亮點：

* [SwiftUI 與 UIKit 中的 Compose Multiplatform 視圖支援依內容大小調整尺寸](#content-based-sizing-for-compose-multiplatform-views-in-swiftui-and-uikit)
* [iOS 上的密碼儲存與自動填入](#saving-and-autofilling-passwords)
* [WebGL 互通性](#webgl-interop)
* [透過 AppCDS 與 AOT 選項實現更快速的桌面端啟動](#faster-desktop-startup-with-appcds-or-aot)

你可以在 [GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.13.0-beta01) 上找到此版本的完整變更清單。

有關特定組件版本的詳細資訊，請參閱[相依性](#dependencies)小節。
關於此版本中包含的 AndroidX Compose 執行階段版本的變更，請參閱 [`androidx.compose.runtime` 版本資訊](https://developer.android.com/jetpack/androidx/releases/compose-runtime#version_113_2)。

## 跨平台 {id="across-platforms"}

在先前的 Compose Multiplatform 版本中處於 Experimental 狀態的數個功能，現在已轉為 Stable。
你不再需要 opt in 即可使用它們：

* 在 iOS 上建立 `ComposeUIView()` 並使用 `ComposeUIViewportConfiguration` 進行配置。
* [使用 `ComposeViewportConfiguration` 為 Web 配置 `ComposeViewport()`](compose-css-styles.md)。
* [使用 `preload` API 預先載入 Web 資源](compose-web-resources.md#preload-resources-using-the-compose-multiplatform-preload-api)。

## iOS {id="ios"}

### SwiftUI 與 UIKit 中的 Compose Multiplatform 視圖支援依內容大小調整尺寸 {id="content-based-sizing-for-compose-multiplatform-views-in-swiftui-and-uikit"}

內嵌在 SwiftUI 或 UIKit 中的 Compose Multiplatform 視圖現在可以根據可用的父層空間回報偏好大小（preferred size）。
原生容器可以使用此大小來適應 Compose 內容，例如：在保持寬度固定的同時調整視圖的高度。

在 iOS 16 及更高版本上，Compose Multiplatform 視圖預設使用 `PreferredSizeReportingStrategy.SizeThatFits`，
因此不需要額外的大小調整配置。

在 Kotlin 端建立 Compose 視圖：

```kotlin
val view = ComposeUIView {
    Text("Hello from Compose")
}
```

接著，在 SwiftUI 的 `UIViewRepresentable` 包裝函式中，將尺寸提案傳遞給 `sizeThatFits()`。
對於 SwiftUI 未指定尺寸的維度，請使用 `UIView.noIntrinsicMetric`：

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

在 UIKit 中，當 Auto Layout 設定好 Compose Multiplatform 視圖的寬度後，
使用 `sizeThatFits()` 取得其偏好高度並更新其高度條件約束（constraint）：

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

### 儲存與自動填入密碼 {id="saving-and-autofilling-passwords"}
<primary-label ref="Experimental"/>

在 iOS 上，Compose Multiplatform 現在可以顯示原生提示以儲存登入憑據並自動填入 Compose 文字欄位。
請讓使用者名稱和密碼欄位同時保留在螢幕上，以便 iOS 將該表單識別為登入表單。

若要配置這些欄位，請在你的 iOS 原始碼集中使用 `PlatformImeOptions`。
為使用者名稱設定 `textContentType(UITextContentTypeUsername)`，並為密碼設定 `isSecureTextEntry(true)`。
例如，在標註了 `@OptIn(ExperimentalComposeUiApi::class)` 的可組合項（composable）內部：

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

### WebGL 互通性 {id="webgl-interop"}
<primary-label ref="Experimental"/>

Compose Multiplatform 現在提供了用於轉譯 [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) 紋理的實驗性 API。
`WebGLRenderTarget` 公開了一個 Compose `Painter`，可在其他 Compose UI 元素旁顯示 WebGL 圖形。

使用 `rememberWebGLRenderTarget()` 建立目標，使用 `render {}` 向其中繪製，並將其 `painter` 顯示在 `Image` 中。
例如，此程式碼片段在帶有 `@OptIn(ExperimentalComposeUiApi::class)` 的可組合項內轉譯一個藍色紋理：

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

對於更進階的使用案例，`target` 還提供了對底層 WebGL 轉譯上下文的存取權。

### Web 上的系統視窗邊襯區 (Window Insets) {id="system-window-insets-on-web"}
<primary-label ref="Experimental"/>

Web 版 Compose Multiplatform 現在透過標準的 `WindowInsets` API 支援系統視窗邊襯區。
你的 UI 可以在遵循安全區域（包括螢幕凹口/瀏海與螢幕鍵盤）的同時實現邊到邊（edge-to-edge）繪製。

若要啟用此功能，請在你的 `ComposeViewport` 配置中將 `enableBrowserWindowInsets` 設定為 `true`。
使用標準的邊襯區修飾符（modifier）來調整版面配置：

```kotlin
ComposeViewport(configure = { enableBrowserWindowInsets = true }) {
    Box(Modifier.fillMaxSize().safeDrawingPadding()) {
        Text("Content within the safe drawing area")
    }
}
```

你也可以透過 `WindowInsets.safeDrawing` 和 `WindowInsets.ime` 等 API 直接存取邊襯區。

如需進行邊到邊轉譯，請在網頁的視口 `meta` 標籤中新增 `viewport-fit=cover`：

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

> 如果沒有 `viewport-fit=cover`，瀏覽器會套用安全區域邊距（padding）並回報零安全區域邊襯區。
> 如果在沒有此設定的情況下啟用了瀏覽器視窗邊襯區，Compose Multiplatform 將記錄警告。

### Web 上可配置的字型後備方案 (Font Fallback) {id="configurable-font-fallback-on-web"}

在先前的版本中，我們針對應用程式未涵蓋的字元引進了[自動字型後備方案](compose-web-resources.md#automatic-font-fallback)。
此版本可讓你選擇後備字型的來源或停用自動下載。

預設情況下，Compose Multiplatform 會從 [Google Fonts](https://fonts.gstatic.com/s/) 下載後備字型。
若要使用不同的來源，請在視窗配置中設定 `fontFallbackUrl`：

```kotlin
createComposeWindow(
    configure = { fontFallbackUrl = "https://custom.fonts.com" }
) {
    BasicText("გამარჯობა")
}
```

若要停用自動字型後備功能，請將 `fontFallbackUrl` 設為 `null`：

```kotlin
createComposeWindow(
    configure = { fontFallbackUrl = null }
) {
    BasicText("გამარჯობა")
}
```

## 桌面端 {id="desktop"}

### 透過 AppCDS 或 AOT 實現更快速的桌面端啟動 {id="faster-desktop-startup-with-appcds-or-aot"}

Compose Multiplatform 現在支援在桌面應用程式中使用 [Application Class-Data Sharing (AppCDS)](https://openjdk.org/jeps/310) 與 
[Ahead-of-Time (AOT) 快取](https://openjdk.org/jeps/514)。
這兩種選項都使用封存檔來減少啟動時間。

在小型示範應用程式的效能基準測試中，預先建置的 AOT 快取縮短了冷啟動時間：

* 在 macOS (M1 Ultra) 上，從 2017 ms 縮短至 424 ms — 快了 4.8 倍。
* 在 Windows (Dell Precision 5690) 上，從 1356 ms 縮短至 650 ms — 快了 2.1 倍。

這些測量涵蓋了從啟動處理程序到顯示視窗的時間。
結果取決於具體應用程式與環境。
對於 AOT 啟動最佳化，我們建議使用最新的 [JetBrains Runtime (JBR) 25](https://github.com/JetBrains/JetBrainsRuntime) 版本。

若要啟用這些啟動選項，請在 `build.gradle.kts` 檔案中配置 `aot {}` 區塊：

```kotlin
compose.desktop {
    application {
        aot {
            mode = AotMode.AotPrebuild
        }
    }
}
```

根據你的 JDK 版本和打包需求選擇模式：

| 模式 | 最低 JDK | 行為 |
|---|---|---|
| `None` | — | 預設，無啟動最佳化。 |
| `AppCdsAuto` | 19 | 在使用者的第一個工作階段結束時建立 AppCDS 封存檔，加快後續啟動速度。 |
| `AppCdsPrebuild` | 21 | 在打包前建立 AppCDS 封存檔，從第一次啟動起即加速。 |
| `AotPrebuild` | 25 | 在打包前建立 AOT 快取，同時改善連結與 JIT 預熱。 |

兩種預先建置（prebuild）模式都會在打包期間執行你的應用程式以建立封存檔。
在此快取產生執行期間，外掛程式會將 `compose.aot.training-run` 系統屬性設定為 `true`。

請注意，預先建置模式會增加可發行套件的大小，因為應用程式中包含了封存檔。

### macOS 與 Windows 上更流暢的視窗大小調整 {id="smoother-window-resizing-on-macos-and-windows"}

Compose Multiplatform 現在支援在 macOS 上使用 Metal 或在 Windows 上使用 DirectX 時，實現更流暢的互動式視窗大小調整。
轉譯與視窗大小調整保持同步，減少卡頓並防止沿視窗邊緣出現白條。

若要啟用此行為，請在顯示任何視窗之前將轉譯器的系統屬性設定為 `true`。
可以使用 `System.setProperty()` 或 JVM `-D` 旗標進行設定：

* 使用 Metal 的 macOS：`skiko.rendering.macos.metalSynchronousLiveResize`
* 使用 DirectX 的 Windows：`skiko.rendering.windows.direct3DSynchronousLiveResize`

此功能需要 Compose 內容填滿整個視窗。

## 相依性 {id="dependencies"}

| 程式庫 | Maven 座標 | 基於 Jetpack 版本 |
|---|---|---|
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