[//]: # (title: Compose Multiplatform 1.12.1 有哪些新變化)

以下是此功能版本的亮點：

 * [Web 版自動字型回退](#automatic-font-fallback)
 * [Compose Hot Reload 中適用於 AI 代理的 MCP 伺服器](#mcp-server-for-ai-agents-in-compose-hot-reload)
 * [Desktop 版 Window 與對話方塊 API v2](#window-and-dialog-api-v2)

您可以在 [GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.12.0) 上找到此版本的完整變更清單。
有關特定組件版本的詳細資訊，請參閱 [相依性](#dependencies) 章節。

## 重大變更與棄用 {id="breaking-changes-and-deprecations"}

用於管理應用程式主題的 `LocalSystemTheme` 屬性已被棄用。
該屬性暫時仍在 `@InternalComposeUiApi` 註解下可用，並將在未來的版本中被取代。

## 跨平台 {id="across-platforms"}

### Skia 更新至 Milestone 150 {id="skia-updated-to-milestone-150"}

透過 Skiko，Compose Multiplatform 使用的 Skia 版本已更新至 Milestone 150。

Compose Multiplatform 1.11 使用的前一個版本為 Milestone 144。
您可以在 [版本說明](https://skia.googlesource.com/skia/+/refs/heads/chrome/m150/RELEASE_NOTES.md) 中查看這些版本之間的變更。

此更新還解決了 iOS 上已封裝其專屬 Skia 程式庫的應用程式（例如基於 Chromium 的應用程式）之重複符號衝突。

## iOS {id="ios"}

### 改進延遲佈局的捲動效能 {id="improved-lazy-layout-scrolling-performance"}

iOS 版 Compose Multiplatform 現在為延遲佈局提供了改進的捲動效能。
清單項目的停用操作是在繪製階段之外執行的，這使得繪製階段能夠更快完成，進而實現更平滑的捲動。

## Web {id="web"}

### 自動字型回退 {id="automatic-font-fallback"}
<primary-label ref="Experimental"/>

以前，應用程式載入的字型未涵蓋的字元會顯示為替換字元（□，稱為「tofu」）。

Web 版 Compose Multiplatform 現在會在轉譯過程中遇到未解決的字元時，根據需求自動下載所需的 Noto 字型子集。
字型下載後，Compose 會重組受影響的文字。
請注意，在取得所需的字型之前，tofu 可能會短暫出現。

## Desktop {id="desktop"}

### Compose Hot Reload 中適用於 AI 代理的 MCP 伺服器 {id="mcp-server-for-ai-agents-in-compose-hot-reload"}
<primary-label ref="Experimental"/>

Compose Hot Reload 現在附帶一個實驗性的 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 伺服器，可讓 AI 編碼代理直接與執行中的 Compose 應用程式互動。

到目前為止，當 AI 代理編輯 Compose 程式碼時，沒有可靠的方法來驗證結果：代理無法確認熱重載是否成功，無法看到轉譯後的 UI，也無法讀取執行時記錄或例外狀況。透過 MCP 伺服器，代理可以觸發重載、擷取螢幕截圖、檢查語義樹、模擬點擊與輸入，並讀取應用程式記錄，而無需您手動介入。

有關 AI 代理可用的 MCP 工具完整清單以及如何連接，請參閱 [適用於 AI 代理的 MCP 伺服器](compose-hot-reload.md#mcp-server-for-ai-agents)。

### Window 與對話方塊 API v2 {id="window-and-dialog-api-v2"}
<primary-label ref="Experimental"/>

我們為 Desktop 版的 `WindowState` 與 `DialogState` 推出了新的實驗性 v2 API，解決了現有 API 的多項限制。
v2 API 可在 `androidx.compose.ui.window.v2` 子套件中使用。

v2 API 讓您能更精確地控制視窗與對話方塊的放置與大小。您可以：
* 選擇視窗顯示的螢幕
* 提供自訂的定位與大小調整邏輯，包括基於內容固有尺寸 (intrinsic size) 的邏輯
* 設定視窗的最小與最大尺寸
* 相對於父視窗定位對話方塊

v2 API 還使視窗狀態變更的非同步特性變得明確，將請求狀態與實際狀態分開。

例如，若要在螢幕中央開啟一個固定大小的視窗：

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

v2 API 還解鎖了以前無法實現的場景，例如根據內容大小調整視窗尺寸，同時在視窗較大時仍允許內容擴展（透過 `fillMaxSize()` 等修飾符）。
詳情請參閱 [Window 與對話方塊 API v2](compose-desktop-top-level-windows-management.md#window-and-dialog-api-v2) 文件頁面。

## 相依性 {id="dependencies"}

| 程式庫 | Maven 座標 | 基於 Jetpack 版本 |
|--------------------|------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| Runtime            | `org.jetbrains.compose.runtime:runtime*:1.12.1`                        | [Runtime 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.12.1)                     |
| UI                 | `org.jetbrains.compose.ui:ui*:1.12.1`                                  | [UI 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.12.1)                               |
| Foundation         | `org.jetbrains.compose.foundation:foundation*:1.12.1`                  | [Foundation 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.12.1)               |
| Material           | `org.jetbrains.compose.material:material*:1.12.1`                      | [Material 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-material#1.12.1)                   |
| Material3          | `org.jetbrains.compose.material3:material3*:1.12.0-alpha03`            | [Material3 1.5.0-alpha22](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.5.0-alpha22)   |
| Material3 Adaptive | `org.jetbrains.compose.material3.adaptive:adaptive*:1.3.0-rc01`        | [Material3 Adaptive 1.3.0](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.3.0) |
| Lifecycle          | `org.jetbrains.androidx.lifecycle:lifecycle-*:2.11.0`                  | [Lifecycle 2.11.0](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.11.0)                         |
| Navigation         | `org.jetbrains.androidx.navigation:navigation-*:2.10.0-beta01`         | [Navigation 2.10.0](https://developer.android.com/jetpack/androidx/releases/navigation#2.10.0)                       |
| Navigation3        | `org.jetbrains.androidx.navigation3:navigation3-*:1.1.2`               | [Navigation3 1.1.7](https://developer.android.com/jetpack/androidx/releases/navigation3#1.1.7)                       |
| Navigation Event   | `org.jetbrains.androidx.navigationevent:navigationevent-compose:1.1.0` | [Navigation Event 1.1.1](https://developer.android.com/jetpack/androidx/releases/navigationevent#1.1.1)              |
| Savedstate         | `org.jetbrains.androidx.savedstate:savedstate*:1.4.0`                  | [Savedstate 1.4.0](https://developer.android.com/jetpack/androidx/releases/savedstate#1.4.0)                         |
| WindowManager Core | `org.jetbrains.androidx.window:window-core:1.5.1`                      | [WindowManager 1.5.1](https://developer.android.com/jetpack/androidx/releases/window#1.5.1)                          |