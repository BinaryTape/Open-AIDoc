[//]: # (title: Compose Multiplatform 1.10.3 的新功能)

以下是此功能版本的主要特點：

 * [統一的 `@Preview` 註解](#unified-preview-annotation)
 * [支援 Navigation 3](#support-for-navigation-3)
 * [內建 Compose Hot Reload](#compose-hot-reload-integration)

您可以在 [GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.10.0) 上找到此版本的完整變更清單。
有關特定元件版本的詳細資訊，請參閱 [相依性](#dependencies) 章節。

## 重大變更與棄用

### 棄用的相依性別名

Compose Multiplatform Gradle 外掛程式支援的相依性別名（如 `compose.ui` 等）在 1.10.0-beta01 版本中已棄用。
我們建議您在版本目錄 (version catalogs) 中新增直接的程式庫參考。
對應的棄用通知中會提供具體的參考建議。

此項變更應能讓 Compose Multiplatform 程式庫的相依性管理變得更加透明。
在未來，我們希望能為 Compose Multiplatform 提供 BOM，以簡化相容版本的設定。

### 棄用的 `PredictiveBackHandler()`

Compose Multiplatform 中引入了 `PredictiveBackHandler()` 函式，旨在將 Android 原生的返回導覽手勢帶到其他平台。
隨著 Navigation 3 的發佈，舊有的實作已被棄用，取而代之的是新的 [Navigation Event](https://developer.android.com/jetpack/androidx/releases/navigationevent) 程式庫及其 API。
具體而言，您現在不應再使用 `PredictiveBackHandler()` 函式，而應使用包裝了更通用的 `NavigationEventHandler()` 實作的新 `NavigationBackHandler()` 函式。

最簡單的遷移示範如下：

<compare type="top-bottom">
    <code-block lang="kotlin" code="         PredictiveBackHandler(enabled = true) { progress -&gt;&#10;            try {&#10;                progress.collect { event -&gt;&#10;                    // 製作返回手勢進度的動畫&#10;                }&#10;                // 處理已完成的返回手勢&#10;            } catch(e: Exception) {&#10;                // 處理已取消的返回手勢&#10;            }&#10;        }"></code-block>
    <code-block lang="kotlin" code="        // 使用空狀態作為虛設常式以滿足必要的引數&#10;        val navState = rememberNavigationEventState(NavigationEventInfo.None)&#10;        NavigationBackHandler(&#10;            state = navState,&#10;            isBackEnabled = true,&#10;            onBackCancelled = {&#10;                // 處理已取消的返回手勢&#10;            },&#10;            onBackCompleted = {&#10;              // 處理已完成的返回手勢&#10;            }&#10;        )&#10;        LaunchedEffect(navState.transitionState) {&#10;            val transitionState = navState.transitionState&#10;            if (transitionState is NavigationEventTransitionState.InProgress) {&#10;                val progress = transitionState.latestEvent.progress&#10;                // 製作返回手勢進度的動畫&#10;            }&#10;        }"></code-block>
</compare>

說明：

* `state` 參數是必填的：`NavigationEventInfo` 旨在持有關於 UI 狀態的內容資訊。
  如果您目前沒有任何資訊需要儲存，可以使用 `NavigationEventInfo.None` 作為虛設常式。
* `onBack` 參數已拆分為 `onBackCancelled` 與 `onBackCompleted`，因此您不需要單獨追蹤已取消的手勢。
* `NavigationEventState.transitionState` 屬性有助於追蹤物理手勢的進度。

有關實作詳情，請參閱 [Navigation Event API 參考資料中的 NavigationEventHandler 頁面](https://developer.android.com/reference/kotlin/androidx/navigationevent/NavigationEventHandler)。

### 最低 Kotlin 版本提升

如果您的專案包含原生 (native) 或 Web 目標，最新功能需要升級至 Kotlin 2.2.20。

## 跨平台

### 統一的 `@Preview` 註解

我們統一了各平台的預覽方式。
您現在可以在 `commonMain` 原始碼集中使用 `androidx.compose.ui.tooling.preview.Preview` 註解。

所有其他註解，例如 `org.jetbrains.compose.ui.tooling.preview.Preview` 以及桌面版專用的 `androidx.compose.desktop.ui.tooling.preview.Preview`，均已棄用。

### 自動調整大小的互通檢視 (interop views)

Compose Multiplatform 現在支援桌面版與 iOS 上原生互通元素的自動大小調整。
這些元素現在可以根據其內容調整佈局，
不再需要手動計算精確大小或預先指定固定尺寸。

* 在桌面版上，`SwingPanel` 會根據嵌入組件的最小、首選與最大尺寸自動調整其大小。
* 在 iOS 上，UIKit 互通檢視現在支援根據檢視的合適大小 (intrinsic content size) 進行縮放。
  這讓 SwiftUI 檢視（透過 `UIHostingController`）以及不依賴 `NSLayoutConstraints` 的基本 `UIView` 子類別能夠正確地進行包裝。

### 穩定的 `Popup` 與 `Dialog` 屬性

`DialogProperties` 中的以下屬性已提升為穩定版，不再是實驗功能：
`usePlatformInsets`、`useSoftwareKeyboardInset` 與 `scrimColor`。

同樣地，`PopupProperties` 中的 `usePlatformDefaultWidth` 與 `usePlatformInsets` 屬性也已提升為穩定版。

不帶 `PopupProperties` 參數的 `Popup` 多載函式，其棄用級別已更改為 `ERROR`，以強制使用更新後的 API。

### Skia 更新至 Milestone 138

Compose Multiplatform 透過 Skiko 使用的 Skia 版本已更新至 Milestone 138。

先前使用的 Skia 版本為 Milestone 132。
您可以在 [版本說明](https://skia.googlesource.com/skia/+/refs/heads/chrome/m138/RELEASE_NOTES.md) 中查看這些版本之間的變更。

### 支援 Navigation 3
<primary-label ref="Experimental"/>

Navigation 3 是專為 Compose 設計的新型導覽程式庫。
透過 Navigation 3，您可以完全控制返回堆疊 (back stack)，
導覽至目的地或從中返回就像在清單中新增或移除項目一樣簡單。
您可以在 [Navigation 3 文件](https://developer.android.com/guide/navigation/navigation-3) 以及發佈 [部落格文章](https://android-developers.googleblog.com/2025/05/announcing-jetpack-navigation-3-for-compose.html) 中閱讀新的指導原則與決策。

Compose Multiplatform 1.10.0-beta01 為在非 Android 目標上使用新的導覽 API 提供 Alpha 支援。
發佈的多平台構件為：

* Navigation 3 UI 程式庫：`org.jetbrains.androidx.navigation3:navigation3-ui`
* Navigation 3 的 ViewModel：`org.jetbrains.androidx.lifecycle:lifecycle-viewmodel-navigation3`
* Navigation 3 的 Material 3 自適應佈局：`org.jetbrains.compose.material3.adaptive:adaptive-navigation3`

您可以在從原始 Android 儲存庫鏡像而來的 [nav3-recipes](https://github.com/terrakok/nav3-recipes) 範例中，找到多平台 Navigation 3 實作的範例。

一些平台特定的實作詳情：

* 在 iOS 上，您現在可以使用 [EndEdgePanGestureBehavior](https://github.com/JetBrains/compose-multiplatform-core/pull/2519) 選項（預設為 `Disabled`）來管理端點邊緣 [平移手勢 (pan gestures)](https://developer.apple.com/documentation/uikit/handling-pan-gestures) 的導覽。
  這裡的「端點邊緣 (End edge)」在 LTR 介面中是指螢幕右側邊緣，在 RTL 介面中是指左側邊緣。
  起始邊緣 (Start edge) 與端點邊緣相對，且一律繫結至返回手勢。
* 在 Web 應用程式中，現在在桌面瀏覽器中按下 **Esc** 鍵會將使用者帶回上一個畫面
  （並關閉對話方塊、快顯視窗以及某些小工具，如 Material 3 的 `SearchBar`），
  就像在桌面應用程式中一樣。
* 對 [瀏覽器歷程導覽](compose-navigation-routing.md#support-for-browser-navigation-in-web-apps) 與在網址列使用目的地的支援，將不會擴展至 Compose Multiplatform 1.10 的 Navigation 3。
  這已推遲到多平台程式庫的後續版本。

## iOS

### 視窗邊距 (Window insets)

Compose Multiplatform 現在支援 `WindowInsetsRulers`，
其提供了根據視窗邊距（如狀態列、導覽列或螢幕鍵盤）定位 UI 元素並調整其大小的功能。

這種管理視窗邊距的新方法使用單一實作來檢索平台特定的視窗邊距數據。
這意味著 `WindowInsets` 與 `WindowInsetsRulers` 都使用共同的機制來一致地管理邊距。

> 先前，`WindowInsets.Companion.captionBar` 未被標記為 `@Composable`。
> 我們新增了 `@Composable` 特性，以使其行為在各平台間保持一致。
> 
{style="note"}

### 改進的 IME 配置

繼 [1.9.0 中引入](whats-new-compose-190.md#ime-options) 的 iOS 特定 IME 自訂功能後，
此版本新增了用於透過 `PlatformImeOptions` 配置文字輸入檢視的新 API。

這些新 API 允許在欄位取得焦點並觸發 IME 時自訂輸入介面：

 * `UIResponder.inputView` 指定一個自訂輸入檢視來取代預設的系統鍵盤。
 * `UIResponder.inputAccessoryView` 定義一個自訂附屬檢視，在 IME 啟動時附加到系統鍵盤或自訂的 `inputView` 上。

### 互通檢視的重疊配置 (Overlay placement)
<primary-label ref="Experimental"/>

您現在可以使用實驗性的 `placedAsOverlay` 旗標，將 `UIKitView` 與 `UIKitViewController` 檢視放置在 Compose UI 之上。
此旗標允許互通檢視支援透明背景與原生著色器效果。

若要將互通檢視呈現為重疊 (overlay)，請使用 `@OptIn(ExperimentalComposeUiApi::class)` 註解，
並在 `UIKitInteropProperties` 中將 `placedAsOverlay` 參數設定為 `true`：

```kotlin
UIKitViewController(
    modifier = modifier,
    update = {},
    factory = { factory.createNativeMap() },
    properties = UIKitInteropProperties(placedAsOverlay = true)
)
```

請記住，此配置會將檢視呈現於 Compose UI 層之上；
因此，它將在視覺上覆蓋位於同一區域的任何其他可組合項 (composables)。

## Web

### 資源快取
<primary-label ref="Experimental"/>

Compose Multiplatform 現在使用 [Web Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
來快取靜態資產與字串資源的成功回應。
這種方法避免了與瀏覽器預設快取相關的延遲，
瀏覽器預設快取會透過重複的 HTTP 請求來驗證儲存的內容，在低頻寬連線上可能會特別緩慢。
快取會在每次啟動應用程式或重新整理頁面時清除，以確保資源與應用程式的當前狀態保持一致。

如需更多詳情，請參閱 [提取要求 (pull request)](https://github.com/JetBrains/compose-multiplatform/pull/5379)
以及 [快取 Web 資源](compose-web-resources.md#caching-web-resources) 文件。

## 桌面版

### Compose Hot Reload 整合

Compose Hot Reload 外掛程式現在已與 Compose Multiplatform Gradle 外掛程式內建在一起。
您不再需要單獨配置 Hot Reload 外掛程式，
因為它在針對桌面版的 Compose Multiplatform 專案中預設為啟用。

這對於明確宣告 Compose Hot Reload 外掛程式的專案意味著：

 * 您可以安全地移除該宣告，以便使用 Compose Multiplatform Gradle 外掛程式提供的版本。
 * If you choose to keep a specific version declaration, that version will be used instead of the bundled one.
 * 如果您選擇保留特定的版本宣告，則會使用該版本而非內建版本。

內建的 Compose Hot Reload Gradle 外掛程式要求的最低 Kotlin 版本為 2.1.20。
如果偵測到較舊版本的 Kotlin，熱重載功能將會被停用。

## Gradle

### 支援 AGP 9.0.0

Compose Multiplatform 引入了對 Android Gradle 外掛程式 (AGP) 9.0.0 版本的支援。
為了與新的 AGP 版本相容，請確保您升級至 Compose Multiplatform 1.9.3 或 1.10.0。

為了讓長期的更新過程更加順暢，
我們建議將您的專案結構更改為使用專用的 Android 應用程式模組。

## 相依性

| 程式庫 | Maven 座標 | 基於 Jetpack 版本 |
|--------------------|------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Runtime | `org.jetbrains.compose.runtime:runtime*:1.10.3` | [Runtime 1.10.5](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.10.5) |
| UI | `org.jetbrains.compose.ui:ui*:1.10.3` | [UI 1.10.5](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.10.5) |
| Foundation | `org.jetbrains.compose.foundation:foundation*:1.10.3` | [Foundation 1.10.5](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.10.5) |
| Material | `org.jetbrains.compose.material:material*:1.10.3` | [Material 1.10.5](https://developer.android.com/jetpack/androidx/releases/compose-material#1.10.5) |
| Material3 | `org.jetbrains.compose.material3:material3*:1.10.0-alpha05` | [Material3 1.5.0-alpha08](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.5.0-alpha08) |
| Material3 Adaptive | `org.jetbrains.compose.material3.adaptive:adaptive*:1.3.0-alpha02` | [Material3 Adaptive 1.3.0-alpha03](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.3.0-alpha03) |
| Lifecycle | `org.jetbrains.androidx.lifecycle:lifecycle-*:2.10.0` | [Lifecycle 2.10.0](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.10.0) |
| Navigation | `org.jetbrains.androidx.navigation:navigation-*:2.9.2` | [Navigation 2.9.7](https://developer.android.com/jetpack/androidx/releases/navigation#2.9.7) |
| Navigation3 | `org.jetbrains.androidx.navigation3:navigation3-*:1.0.0-alpha06` | [Navigation3 1.0.0](https://developer.android.com/jetpack/androidx/releases/navigation3#1.0.0) |
| Navigation Event | `org.jetbrains.androidx.navigationevent:navigationevent-compose:1.0.1` | [Navigation Event 1.0.2](https://developer.android.com/jetpack/androidx/releases/navigationevent#1.0.2) |
| Savedstate | `org.jetbrains.androidx.savedstate:savedstate*:1.4.0` | [Savedstate 1.4.0](https://developer.android.com/jetpack/androidx/releases/savedstate#1.4.0) |
| WindowManager Core | `org.jetbrains.androidx.window:window-core:1.5.1` | [WindowManager 1.5.1](https://developer.android.com/jetpack/androidx/releases/window#1.5.1) |