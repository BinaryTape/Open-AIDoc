[//]: # (title: Compose Multiplatform 1.12.2 新功能)

以下是本次功能發布的重點摘要：

 * [適用於 Web 的自動字型備援 (font fallback)](#automatic-font-fallback)
 * [Compose Hot Reload 中適用於 AI Agent 的 MCP 伺服器](#mcp-server-for-ai-agents-in-compose-hot-reload)
 * [適用於桌面的 Window 與 Dialog API v2](#window-and-dialog-api-v2)

您可以在 [GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.12.0) 上找到此版本的完整變更清單。
有關特定組件版本的詳細資訊，請參閱[相依性](#dependencies)小節。

## 破壞性變更與棄用 {id="breaking-changes-and-deprecations"}

用於管理應用程式佈景主題的 `LocalSystemTheme` 屬性已被棄用。
它目前暫時以 `@InternalComposeUiApi` 註解的形式提供，
並將在未來的版本中被取代。

## 跨平台 {id="across-platforms"}

### Skia 更新至 Milestone 150 {id="skia-updated-to-milestone-150"}

Compose Multiplatform 透過 Skiko 使用的 Skia 版本已更新至 Milestone 150。

在 Compose Multiplatform 1.11 中使用的先前版本為 Milestone 144。
您可以在[版本說明](https://skia.googlesource.com/skia/+/refs/heads/chrome/m150/RELEASE_NOTES.md)中查看這些版本之間的變更。

此更新也解決了在 iOS 上，對於已經搭售自身 Skia 程式庫的應用程式（例如以 Chromium 為基礎的應用程式）所產生的重複符號衝突。

## iOS {id="ios"}

### 改進的延遲版面配置捲動效能 {id="improved-lazy-layout-scrolling-performance"}

適用於 iOS 的 Compose Multiplatform 現在為延遲版面配置（lazy layouts）提供了更佳的捲動效能。
清單項目的停用操作會在繪製階段之外執行，使繪製階段能夠更快完成，
進而帶來更流暢的捲動體驗。

## Web {id="web"}

### 自動字型備援 {id="automatic-font-fallback"}
<primary-label ref="Experimental"/>

在此之前，應用程式載入的字型中未涵蓋的字元會顯示為替換字符（□，俗稱「豆腐塊 (tofu)」）。

適用於 Web 的 Compose Multiplatform 現在會在轉譯過程中遇到未解析的字元時，
視需求自動下載所需的 Noto 字型子集。
字型下載完成後，Compose 會重新重組受影響的文字。
請注意，在取得所需字型之前，可能會短暫出現豆腐塊。

## 桌面 {id="desktop"}

### Compose Hot Reload 中適用於 AI Agent 的 MCP 伺服器 {id="mcp-server-for-ai-agents-in-compose-hot-reload"}
<primary-label ref="Experimental"/>

Compose Hot Reload 現在隨附一個實驗性的 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 伺服器，
讓 AI 編碼 Agent 能夠直接與正在執行的 Compose 應用程式互動。

在此之前，當 AI Agent 編輯 Compose 程式碼時，沒有可靠的方法來驗證結果：Agent 無法
確認熱重載（hot reload）是否成功、無法看到轉譯後的 UI，也無法讀取執行時期日誌或
例外狀況。透過 MCP 伺服器，Agent 可以觸發重載、擷取螢幕截圖、檢查
語意樹、模擬點擊與輸入，並讀取應用程式日誌，而無需您手動介入。

有關 AI Agent 可用的完整 MCP 工具清單以及如何連線的詳細資訊，請參閱
[適用於 AI Agent 的 MCP 伺服器](compose-hot-reload.md#mcp-server-for-ai-agents)。

### Window 與 Dialog API v2 {id="window-and-dialog-api-v2"}
<primary-label ref="Experimental"/>

我們在桌面上為 `WindowState` 和 `DialogState` 引入了全新的實驗性 v2 API，
解決了現有 API 的若干限制。
v2 API 可在 `androidx.compose.ui.window.v2` 子套件中使用。

v2 API 讓您能更精細地控制視窗與對話方塊的放置位置與大小。您可以：
* 選擇視窗顯示的螢幕
* 提供自訂的定位與大小調整邏輯，包括以內容固有大小（intrinsic size）為基礎的邏輯
* 設定視窗大小的最小值與最大值
* 相對於父視窗定位對話方塊

v2 API 也將視窗狀態變更的非同步本質明確化，將請求的狀態與實際狀態分開。

例如，若要開啟一個置中於螢幕且大小固定的視窗：

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

v2 API 還解鎖了以往無法實現的情境，例如將視窗調整為符合其
內容的大小，同時在視窗變大時仍然允許內容展開（透過如 `fillMaxSize()` 等修飾符）。
詳情請參閱 [Window 與 Dialog API v2](compose-desktop-top-level-windows-management.md#window-and-dialog-api-v2) 文件頁面。

## 相依性 {id="dependencies"}

| 程式庫 | Maven 座標 | 基於 Jetpack 版本 |
|--------------------|------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| Runtime            | `org.jetbrains.compose.runtime:runtime*:1.12.2`                        | [Runtime 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.12.1)                     |
| UI                 | `org.jetbrains.compose.ui:ui*:1.12.2`                                  | [UI 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.12.1)                               |
| Foundation         | `org.jetbrains.compose.foundation:foundation*:1.12.2`                  | [Foundation 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.12.1)               |
| Material           | `org.jetbrains.compose.material:material*:1.12.2`                      | [Material 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-material#1.12.1)                   |
| Material3          | `org.jetbrains.compose.material3:material3*:1.12.0-alpha03`            | [Material3 1.5.0-alpha22](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.5.0-alpha22)   |
| Material3 Adaptive | `org.jetbrains.compose.material3.adaptive:adaptive*:1.3.0`             | [Material3 Adaptive 1.3.0](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.3.0) |
| Lifecycle          | `org.jetbrains.androidx.lifecycle:lifecycle-*:2.11.0`                  | [Lifecycle 2.11.0](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.11.0)                         |
| Navigation         | `org.jetbrains.androidx.navigation:navigation-*:2.10.0-rc01`           | [Navigation 2.10.0](https://developer.android.com/jetpack/androidx/releases/navigation#2.10.0)                       |
| Navigation3        | `org.jetbrains.androidx.navigation3:navigation3-*:1.2.0-rc01`          | [Navigation3 1.2.0](https://developer.android.com/jetpack/androidx/releases/navigation3#1.2.0)                       |
| Navigation Event   | `org.jetbrains.androidx.navigationevent:navigationevent-compose:1.1.0` | [Navigation Event 1.1.1](https://developer.android.com/jetpack/androidx/releases/navigationevent#1.1.1)              |
| Savedstate         | `org.jetbrains.androidx.savedstate:savedstate*:1.4.0`                  | [Savedstate 1.4.0](https://developer.android.com/jetpack/androidx/releases/savedstate#1.4.0)                         |
| WindowManager Core | `org.jetbrains.androidx.window:window-core:1.5.1`                      | [WindowManager 1.5.1](https://developer.android.com/jetpack/androidx/releases/window#1.5.1)                          |