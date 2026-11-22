[//]: # (title: Compose Multiplatform %org.jetbrains.compose-eap% 的新功能)

以下是此 EAP 版本的重點特色：

* [在 SwiftUI 和 UIKit 中依據內容調整 Compose Multiplatform 視圖大小](#content-based-sizing-for-compose-multiplatform-views-in-swiftui-and-uikit)
* [在 iOS 上儲存與自動填入密碼](#saving-and-autofilling-passwords)
* [WebGL 互通性](#webgl-interop)
* [透過 AppCDS 與 AOT 選項實現更快的桌面應用程式啟動](#faster-desktop-startup-with-appcds-or-aot)

您可以在 [GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.13.0-beta01) 上找到此版本的完整變更清單。

有關特定元件版本的詳細資訊，請參閱[相依性](#dependencies)小節。
關於此版本中包含的 AndroidX Compose runtime 版本的變更，請參閱 [`androidx.compose.runtime` 版本資訊](https://developer.android.com/jetpack/androidx/releases/compose-runtime#version_113_2)。

## 跨平台 {id="across-platforms"}

在之前的 Compose Multiplatform 版本中處於[實驗性 (Experimental)](supported-platforms.md#general-kotlin-stability-levels) 狀態的幾項功能，現在已轉為[穩定版 (Stable)](supported-platforms.md#general-kotlin-stability-levels)。
您不再需要明確選擇啟用即可使用它們：

* 在 iOS 上建立 `ComposeUIView()` 並使用 `ComposeUIViewportConfiguration` 對其進行配置。
* [使用 `ComposeViewportConfiguration` 為 Web 配置 `ComposeViewport()`](compose-css-styles.md)。
* [使用 `preload` API 為 Web 預先載入資源](compose-web-resources.md#preload-resources-using-the-compose-multiplatform-preload-api)。

## iOS {id="ios"}

### 在 SwiftUI 和 UIKit 中依據內容調整 Compose Multiplatform 視圖大小 {id="content-based-sizing-for-compose-multiplatform-views-in-swiftui-and-uikit"}

嵌入在 SwiftUI 或 UIKit 版面配置中的 Compose Multiplatform 視圖現在可以根據可用空間回報偏好大小。
原生容器可以使用此大小來容納 Compose 內容，例如：
在保持寬度固定的同時調整視圖的高度，反之亦然。

Compose Multiplatform 視圖預設使用 `PreferredSizeReportingStrategy.SizeThatFits`。
在 UIKit 中，您不需要額外的大小配置。

在 SwiftUI 中，於執行 iOS 16 或更新版本的裝置上保留此預設值即可。
若是在較早的 iOS 版本上執行 SwiftUI，請使用 `PreferredSizeReportingStrategy.IntrinsicContentSize`
並手動提供尺寸提議 (sizing proposals)。

如需設定說明與範例，請參閱：

* [SwiftUI 中依據內容調整大小](compose-swiftui-integration.md#size-compose-views-to-fit-their-content)
* [UIKit 中依據內容調整大小](compose-uikit-integration.md#size-compose-views-to-fit-their-content)

### 儲存與自動填入密碼 {id="saving-and-autofilling-passwords"}
<primary-label ref="Experimental"/>

在 iOS 上，Compose Multiplatform 現在可以顯示原生提示以儲存登入憑據，並自動填入 Compose 文字欄位。
請確保使用者名稱和密碼欄位都保留在螢幕上，以便 iOS 將該表單辨識為登入表單。

若要配置這些欄位，請在您的 iOS 原始碼集中使用 `PlatformImeOptions`。
為使用者名稱設定 `textContentType(UITextContentTypeUsername)`，並為密碼設定 `isSecureTextEntry(true)`。
例如，在帶有 `@OptIn(ExperimentalComposeUiApi::class)` 註解的 composable 內：

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
`WebGLRenderTarget` 公開了一個 Compose `Painter`，可以與其他 Compose UI 元素並排顯示 WebGL 圖形。

使用 `rememberWebGLRenderTarget()` 建立目標，透過 `render {}` 在其上進行繪製，並在 `Image` 中顯示其 `painter`。
例如，此程式碼片段在帶有 `@OptIn(ExperimentalComposeUiApi::class)` 的 composable 內轉譯藍色紋理：

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

對於更進階的使用案例，`target` 也提供了存取底層 WebGL 轉譯上下文的功能。

### Web 上的系統視窗邊襯區 (Window Insets) {id="system-window-insets-on-web"}
<primary-label ref="Experimental"/>

Web 版 Compose Multiplatform 現在透過標準的 `WindowInsets` API 支援系統視窗邊襯區 (window insets)。
您的 UI 可以在遵守安全區域（包括螢幕凹口和螢幕鍵盤）的同時實現全螢幕延伸顯示 (edge-to-edge)。

若要啟用此功能，請在 `ComposeViewport` 配置中將 `enableBrowserWindowInsets` 設定為 `true`。
使用標準的邊襯區修飾符來調整版面配置：

```kotlin
ComposeViewport(configure = { enableBrowserWindowInsets = true }) {
    Box(Modifier.fillMaxSize().safeDrawingPadding()) {
        Text("Content within the safe drawing area")
    }
}
```

您也可以直接透過 `WindowInsets.safeDrawing` 和 `WindowInsets.ime` 等 API 存取邊襯區。

為了實現全螢幕延伸顯示 (edge-to-edge) 轉譯，請將 `viewport-fit=cover` 新增至頁面的 viewport `meta` 標籤中：

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

> 如果沒有 `viewport-fit=cover`，瀏覽器會套用安全區域邊框間距並回報零安全區域邊襯區。
> 如果在未進行此設定的情況下啟用了瀏覽器視窗邊襯區，Compose Multiplatform 將記錄警告訊息。

### Web 上可配置的字型備援 {id="configurable-font-fallback-on-web"}

在之前的版本中，我們針對應用程式字型未涵蓋的字元導入了[自動字型備援 (automatic font fallback)](compose-web-resources.md#automatic-font-fallback)。
此版本可讓您選擇備援字型的來源或停用自動下載。

預設情況下，Compose Multiplatform 會從 [Google Fonts](https://fonts.gstatic.com/s/) 下載備援字型。
若要使用不同的來源，請在視窗配置中設定 `fontFallbackUrl`：

```kotlin
createComposeWindow(
    configure = { fontFallbackUrl = "https://custom.fonts.com" }
) {
    BasicText("გამარჯობა")
}
```

若要停用自動字型備援，請將 `fontFallbackUrl` 設定為 `null`：

```kotlin
createComposeWindow(
    configure = { fontFallbackUrl = null }
) {
    BasicText("გამარჯობა")
}
```

## 桌面 (Desktop) {id="desktop"}

### 透過 AppCDS 或 AOT 實現更快的桌面啟動速度 {id="faster-desktop-startup-with-appcds-or-aot"}

Compose Multiplatform 現在針對桌面應用程式支援[應用程式類別資料共用 (Application Class-Data Sharing, AppCDS)](https://openjdk.org/jeps/310) 和
[預先編譯 (Ahead-of-Time, AOT) 快取](https://openjdk.org/jeps/514)。兩種選項都透過封存檔來縮短啟動時間。

在小型示範應用程式的效能基準測試中，預先建立的 AOT 快取縮短了冷啟動時間：

* 在 macOS (M1 Ultra) 上，從 2017 ms 縮短至 424 ms — 快了 4.8 倍。
* 在 Windows (Dell Precision 5690) 上，從 1356 ms 縮短至 650 ms — 快了 2.1 倍。

這些測量涵蓋了從啟動處理程序到顯示視窗的時間。
結果取決於具體應用程式和環境。
對於 AOT 啟動最佳化，我們建議使用最新的 [JetBrains Runtime (JBR) 25](https://github.com/JetBrains/JetBrainsRuntime) 版本。

若要啟用這些啟動選項，請在您的 `build.gradle.kts` 檔案中配置 `aot {}` 區塊：

```kotlin
compose.desktop {
    application {
        aot {
            mode = AotMode.AotPrebuild
        }
    }
}
```

根據您的 JDK 版本和打包需求選擇模式：

| 模式             | 最低 JDK | 行為                                                                                           |
|------------------|----------|------------------------------------------------------------------------------------------------|
| `None`           | —        | 預設值，無啟動最佳化。                                                                         |
| `AppCdsAuto`     | 19       | 在使用者的第一個工作階段結束時建立 AppCDS 封存檔，從而加速後續的啟動。                           |
| `AppCdsPrebuild` | 21       | 在打包之前建立 AppCDS 封存檔，從第一次啟動開始即加速啟動速度。                                 |
| `AotPrebuild`    | 25       | 在打包之前建立 AOT 快取，同時改善連結 (linking) 和 JIT 熱身 (warmup)。                         |

這兩種預先建置 (prebuild) 模式都會在打包期間執行您的應用程式以建立封存檔。
在此快取產生執行期間，外掛程式會將 `compose.aot.training-run` 系統屬性設定為 `true`。

請注意，預先建置模式會增加可散發套件的大小，因為應用程式中包含這些封存檔。

### macOS 和 Windows 上更平滑的視窗大小調整 {id="smoother-window-resizing-on-macos-and-windows"}

在 macOS 上使用 Metal 或在 Windows 上使用 DirectX 時，Compose Multiplatform 現在支援更平滑的互動式視窗大小調整。
轉譯與視窗大小調整保持同步，減少了卡頓現象，並防止視窗邊緣出現白條。

若要啟用此行為，請在顯示任何視窗之前將轉譯器的系統屬性設定為 `true`。
可以使用 `System.setProperty()` 或 JVM `-D` 旗標進行設定：

* 使用 Metal 的 macOS：`skiko.rendering.macos.metalSynchronousLiveResize`
* 使用 DirectX 的 Windows：`skiko.rendering.windows.direct3DSynchronousLiveResize`

此功能需要 Compose 內容填滿整個視窗。

## 相依性 {id="dependencies"}

| 程式庫             | Maven 座標                                                             | 基於 Jetpack 版本                                                                                                                    |
|--------------------|------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Runtime            | `org.jetbrains.compose.runtime:runtime*:1.13.0-rc01`                   | [Runtime 1.13.0-rc01](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.13.0-rc01)                           |
| UI                 | `org.jetbrains.compose.ui:ui*:1.13.0-rc01`                             | [UI 1.13.0-rc01](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.13.0-rc01)                                     |
| Foundation         | `org.jetbrains.compose.foundation:foundation*:1.13.0-rc01`             | [Foundation 1.13.0-rc01](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.13.0-rc01)                     |
| Material           | `org.jetbrains.compose.material:material*:1.13.0-rc01`                 | [Material 1.13.0-rc01](https://developer.android.com/jetpack/androidx/releases/compose-material#1.13.0-rc01)                         |
| Material3          | `org.jetbrains.compose.material3:material3*:1.13.0-rc01`               | [Material3 1.5.0-rc01](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.5.0-rc01)                         |
| Material3 Adaptive | `org.jetbrains.compose.material3.adaptive:adaptive*:1.4.0-alpha01`     | [Material3 Adaptive 1.4.0-alpha03](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.4.0-alpha03) |
| Lifecycle          | `org.jetbrains.androidx.lifecycle:lifecycle-*:2.11.0`                  | [Lifecycle 2.11.0](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.11.0)                                         |
| Navigation         | `org.jetbrains.androidx.navigation:navigation-*:2.10.0`                | [Navigation 2.10.0](https://developer.android.com/jetpack/androidx/releases/navigation#2.10.0)                                       |
| Navigation3        | `org.jetbrains.androidx.navigation3:navigation3-*:1.2.0`               | [Navigation3 1.2.0](https://developer.android.com/jetpack/androidx/releases/navigation3#1.2.0)                                       |
| Navigation Event   | `org.jetbrains.androidx.navigationevent:navigationevent-compose:1.1.0` | [Navigation Event 1.1.1](https://developer.android.com/jetpack/androidx/releases/navigationevent#1.1.1)                              |
| Savedstate         | `org.jetbrains.androidx.savedstate:savedstate*:1.4.0`                  | [Savedstate 1.4.0](https://developer.android.com/jetpack/androidx/releases/savedstate#1.4.0)                                         |
| WindowManager Core | `org.jetbrains.androidx.window:window-core:1.5.1`                      | [WindowManager 1.5.1](https://developer.android.com/jetpack/androidx/releases/window#1.5.1)                                          |