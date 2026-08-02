[//]: # (title: Compose Multiplatform 1.7.3 新功能)

以下是此功能版本的亮點：

* [型別安全導覽](#type-safe-navigation)
* [共享元素過渡](#shared-element-transitions)
* [封裝於 Android 資產 (assets) 的多平台資源](#resources-packed-into-android-assets)
* [自訂資源目錄](#custom-resource-directories)
* [支援多平台測試資源](#support-for-multiplatform-test-resources)
* [改進 iOS 上的觸控互操作性](#new-default-behavior-for-processing-touch-in-ios-native-elements)
* [Material3 `adaptive` 與 `material3-window-size-class` 現已包含於通用程式碼中](#material3-adaptive-adaptive)
* [桌面端實作了拖放功能](#drag-and-drop)
* [`BasicTextField` 已於桌面端採用](#basictextfield-renamed-from-basictextfield2-adopted-on-desktop)

請在 [GitHub 上](https://github.com/JetBrains/compose-multiplatform/blob/master/CHANGELOG.md#170-october-2024)查看此版本的完整變更列表。

## 相依性

* Gradle 外掛程式 `org.jetbrains.compose`，版本 1.7.3。基於 Jetpack Compose 程式庫：
  * [Runtime 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.7.5)
  * [UI 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.7.5)
  * [Foundation 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.7.5)
  * [Material 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-material#1.7.5)
  * [Material3 1.3.1](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.3.1)
* Lifecycle 程式庫 `org.jetbrains.androidx.lifecycle:lifecycle-*:2.8.3`。基於 [Jetpack Lifecycle 2.8.5](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.8.5)。
* Navigation 程式庫 `org.jetbrains.androidx.navigation:navigation-*:2.8.0-alpha10`。基於 [Jetpack Navigation 2.8.0](https://developer.android.com/jetpack/androidx/releases/navigation#2.8.0)。
* Material3 Adaptive 程式庫 `org.jetbrains.compose.material3.adaptive:adaptive-*:1.0.0`。基於 [Jetpack Material3 Adaptive 1.0.0](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.0.0)

## 重大變更

### 最底 AGP 版本提升至 8.1.0

Compose Multiplatform 1.7.0 所使用的 Jetpack Compose 1.7.0 與 Lifecycle 2.8.0 均不支援 AGP 7。
因此，當您更新至 Compose Multiplatform 1.7.3 時，可能也需要升級您的 AGP 相依性。

> Android Studio 中新實作的 Android composable 預覽[需要最新版本的 AGP 之一](#resources-packed-into-android-assets)。
>
{style="note"}

### Java 資源 API 已棄用，建議改用多平台資源程式庫

在此版本中，我們明確棄用了 `compose.ui` 套件中提供的 Java 資源 API：
`painterResource()`、`loadImageBitmap()`、`loadSvgPainter()` 與 `loadXmlImageVector()` 函式，以及
`ClassLoaderResourceLoader` 類別與依賴它的函式。

請考慮遷移至[多平台資源程式庫](compose-multiplatform-resources.md)。
雖然您可以在 Compose Multiplatform 中使用 Java 資源，但它們無法受益於架構提供的擴展功能：產生的存取器、多模組支援、在地化等。

如果您仍需存取 Java 資源，您可以參考[拉取請求 (PR) 中建議的實作方式](https://github.com/JetBrains/compose-multiplatform-core/pull/1457)，
以確保您的程式碼在升級到 Compose Multiplatform 1.7.3 並盡可能切換到多平台資源後仍能正常運作。

### iOS 原生元素處理觸控的新預設行為

在 1.7.3 之前，Compose Multiplatform 無法回應落在互通 UI 檢視中的觸控事件，因此
互通檢視會完全處理這些觸控序列。

Compose Multiplatform 1.7.3 實作了更精細的邏輯來處理互通觸控序列。
預設情況下，初始觸控後現在會有一段延遲，這有助於父級 composable 判斷
該觸控序列是否旨在與原生檢視互動，並做出相應反應。

欲了解更多資訊，請參閱[本頁面的 iOS 章節](#ios-touch-interop)中的說明，
或閱讀[此功能的說明文件](compose-ios-touch.md)。

### 必須停用 iOS 上的最小影格持續時間

開發人員經常沒注意到關於高更新率顯示器的列印警告，
導致使用者無法在支援 120 Hz 的裝置上體驗流暢的動畫。
我們現在正嚴格執行此項檢查。如果 `Info.plist` 檔案中缺少 `CADisableMinimumFrameDurationOnPhone` 屬性或將其設置為 `false`，
使用 Compose Multiplatform 建置的應用程式現在將會當機。

您可以透過將 `ComposeUIViewControllerConfiguration.enforceStrictPlistSanityCheck` 屬性設置為 `false` 來停用此行為。

### 桌面端棄用 Modifier.onExternalDrag

實驗性的 `Modifier.onExternalDrag` 及相關 API 已棄用，改用新的 `Modifier.dragAndDropTarget`。
`DragData` 介面已移至 `compose.ui.draganddrop` 套件中。

如果您在 Compose Multiplatform 1.7.0 中使用已棄用的 API，將會遇到棄用錯誤。
在 1.8.0 中，`onExternalDrag` 修飾符將被完全移除。

## 跨平台

### 共享元素過渡

Compose Multiplatform 現在提供了一個 API，用於在具有一致元素的 composable 之間進行無縫過渡。
這些過渡在導覽中通常非常有用，能幫助使用者追蹤 UI 變更的軌跡。

如需深入瞭解該 API，請參閱 [Jetpack Compose 文件](https://developer.android.com/develop/ui/compose/animation/shared-elements)。

### 型別安全導覽

Compose Multiplatform 已採用 Jetpack Compose 的型別安全方法，用於沿導覽路徑傳遞物件。
Navigation 2.8.0 中的新 API 允許 Compose 為您的導覽圖提供編譯期安全性。
這些 API 達成了與 XML 導覽中的 [Safe Args](https://developer.android.com/guide/navigation/use-graph/pass-data#Safe-args) 外掛程式相同的效果。

詳情請參閱 [Google 關於 Navigation Compose 中型別安全的文件](https://developer.android.com/guide/navigation/design/type-safety)。

### 多平台資源

#### 資源封裝於 Android 資產 (assets)

所有多平台資源現在都封裝在 Android 資產 (assets) 中。這使得 Android Studio 能夠為 Android 原始碼集中的 Compose Multiplatform composable 產生預覽。

> Android Studio 預覽僅適用於 Android 原始碼集中的 composable。
> 它們還需要最新版本的 AGP 之一：8.5.2、8.6.0-rc01 或 8.7.0-alpha04。
>
{style="note"}

這也讓 Android 上的 WebView 和媒體播放器組件可以直接存取多平台資源，
因為資源可以透過簡單的路徑到達，例如 `Res.getUri(“files/index.html”)`。

以下是一個 Android composable 範例，它顯示一個包含資源圖像連結的資源 HTML 頁面：

```kotlin
// androidMain/kotlin/com/example/webview/App.kt
@OptIn(ExperimentalResourceApi::class)
@Composable
@Preview
fun App() {
    MaterialTheme {
        val uri = Res.getUri("files/webview/index.html")

        // 在 AndroidView 中加入 WebView，並將配置設為全螢幕。
        AndroidView(factory = {
            WebView(it).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
            }
        }, update = {
            it.loadUrl(uri)
        })
    }
}
```
{initial-collapse-state="collapsed" collapsible="true"  collapsed-title="AndroidView(factory = { WebView(it).apply"}

此範例搭配此簡單的 HTML 檔案運作：

```html
<html>
<header>
    <title>
        Cat Resource
    </title>
</header>
<body>
    <img src="cat.jpg">
</body>
</html>
```
{initial-collapse-state="collapsed" collapsible="true"  collapsed-title="<title>Cat Resource</title>"}

此範例中的兩個資源檔案都位於 `commonMain` 原始碼集中：

![composeResources 目錄的檔案結構](compose-resources-android-webview.png){width="230"}

#### 自訂資源目錄

透過配置 DSL 中新的 `customDirectory` 設定，您可以將[自訂目錄關聯](compose-multiplatform-resources-setup.md#custom-resource-directories)至特定的原始碼
集。例如，這使得將下載的檔案作為資源使用成為可能。

#### 多平台字型快取

Compose Multiplatform 將 Android 的字型快取功能引入其他平台，
消除了對 `Font` 資源過度的位元組讀取。

#### 支援多平台測試資源

資源程式庫現在支援在專案中使用測試資源，這意味著您可以：

* 將資源加入測試原始碼集。
* 使用僅在相應原始碼集中可用的產生存取器。
* 僅針對測試執行將測試資源封裝到應用程式中。

#### 資源映射至字串 ID 以方便存取

每種類型的資源都與其檔名進行映射。例如，您可以使用 `Res.allDrawableResources` 屬性
來獲取所有 `drawable` 資源的映射，並透過傳遞其字串 ID 來存取必要的資源：

```kotlin
Image(painterResource(Res.allDrawableResources["compose_multiplatform"]!!), null)
```

#### 將位元組陣列轉換為 ImageBitmap 或 ImageVector 的函式

現在有新的函式可用於將 `ByteArray` 轉換為影像資源：

* `decodeToImageBitmap()` 將 JPEG、PNG、BMP 或 WEBP 檔案轉換為 `ImageBitmap` 物件。
* `decodeToImageVector()` 將 XML 向量檔案轉換為 `ImageVector` 物件。
* `decodeToSvgPainter()` 將 SVG 檔案轉換為 `Painter` 物件。此函式在 Android 上不可用。

詳情請參閱[說明文件](compose-multiplatform-resources-usage.md#convert-byte-arrays-into-images)。

### 新的通用模組

#### material3.adaptive:adaptive*

Material3 adaptive 模組現在可以在 Compose Multiplatform 的通用程式碼中使用。
要使用它們，請在模組的 `build.gradle.kts` 檔案中將相應的相依性明確加入通用原始碼集：

```kotlin
commonMain.dependencies {
    implementation("org.jetbrains.compose.material3.adaptive:adaptive:1.0.0-alpha03")
    implementation("org.jetbrains.compose.material3.adaptive:adaptive-layout:1.0.0-alpha03")
    implementation("org.jetbrains.compose.material3.adaptive:adaptive-navigation:1.0.0-alpha03")
}
```

#### material3.material3-adaptive-navigation-suite

Material3 adaptive navigation suite（使用 Compose [建置自適應導覽](https://developer.android.com/develop/ui/compose/layouts/adaptive/build-adaptive-navigation)所需）已可在 Compose Multiplatform 的通用程式碼中使用。
要使用它，請在模組的 `build.gradle.kts` 檔案中將相依性明確加入通用原始碼集：

```kotlin
commonMain.dependencies {
    implementation(compose.material3AdaptiveNavigationSuite)
}
```

#### material3:material3-window-size-class

要使用 [`WindowSizeClass`](https://developer.android.com/reference/kotlin/androidx/compose/material3/windowsizeclass/package-summary) 類別，請在模組的 `build.gradle.kts` 檔案中將 `material3-window-size-class` 相依性明確加入通用原始碼集：

```kotlin
commonMain.dependencies {
    implementation("org.jetbrains.compose.material3:material3-window-size-class:1.7.3")
}
```

`calculateWindowSizeClass()` 函式在通用程式碼中尚不可用。
然而，您可以在平台特定的程式碼中匯入並呼叫它，例如：

```kotlin
// desktopMain/kotlin/main.kt
import androidx.compose.material3.windowsizeclass.calculateWindowSizeClass

// ...

val size = calculateWindowSizeClass()
```

#### material-navigation

除 Compose Multiplatform Navigation 外，`material-navigation` 程式庫也已可在通用程式碼中使用。
要使用它，請在模組的 `build.gradle.kts` 檔案中將以下明確相依性加入通用原始碼集：

```kotlin
commonMain.dependencies {
    implementation("org.jetbrains.androidx.navigation:navigation-compose:2.8.0-alpha10")
    implementation("org.jetbrains.compose.material:material-navigation:1.7.0-beta02")
}
```

### Skia 更新至 Milestone 126

Compose Multiplatform 透過 [Skiko](https://github.com/JetBrains/skiko) 所使用的 Skia 版本已更新至 Milestone 126。

先前使用的 Skia 版本為 Milestone 116。您可以在[版本說明](https://skia.googlesource.com/skia/+/refs/heads/main/RELEASE_NOTES.md#milestone-126)中查看這些版本之間的變更。

### GraphicsLayer – 新的繪圖 API

Jetpack Compose 1.7.0 中新增的新繪圖層現在已可在 Compose Multiplatform 中使用。

與 `Modifier.graphicsLayer` 不同，新的 `GraphicsLayer` 類別允許您在任何地方渲染 Composable 內容。
這在預期將動畫內容渲染於不同場景的情況下非常有用。

如需更詳細的說明與範例，請參閱[參考文件](https://developer.android.com/reference/kotlin/androidx/compose/ui/graphics/layer/GraphicsLayer)。

### LocalLifecycleOwner 移出 Compose UI

`LocalLifecycleOwner` 類別已從 Compose UI 套件移至 Lifecycle 套件。

此變更允許您獨立於 Compose UI 存取該類別並呼叫其基於 Compose 的輔助 API。
但請記住，在沒有 Compose UI 綁定的情況下，`LocalLifecycleOwner` 執行個體將沒有平台整合，因此也沒有可接聽的平台特定事件。

## iOS

### 改進 Compose Multiplatform 與原生 iOS 之間的觸控互操作性 {id="ios-touch-interop"}

此版本改進了 iOS 互通檢視的觸控處理。
Compose Multiplatform 現在會嘗試偵測觸控是針對互通檢視還是應由 Compose 處理。
這使得在您的 Compose Multiplatform 應用程式中處理 UIKit 或 SwiftUI 區域內的觸控事件成為可能。

預設情況下，Compose Multiplatform 會將傳輸觸控事件至互通檢視的時間延遲 150 ms：

* 如果在此時間範圍內移動超過距離閾值，
    父級 composable 將攔截該觸控序列，且其不會被轉發至互通檢視。
* 如果沒有明顯移動，Compose 將不處理其餘觸控序列，
    而是由互通檢視單獨處理。

此行為與原生 [`UIScrollView`](https://developer.apple.com/documentation/uikit/uiscrollview) 的運作方式一致。
它有助於防止發生在互通檢視中開始的觸控序列被攔截，而 Compose Multiplatform 卻沒有機會處理它的情況。這可能會導致令人沮喪的使用者體驗。
例如，想像一個在可滾動內容（如 lazy list）中使用的大型互通影片播放器。
當螢幕大部分被影片佔據，且影片在 Compose Multiplatform 不知情的情況下攔截了所有觸控時，滾動列表會變得很困難。

### 原生效能改進

隨著 Kotlin 2.0.20 的推出，Kotlin/Native 團隊在提升 Compose 應用程式在 iOS 上的運行速度與流暢度方面取得了重大進展。
Compose Multiplatform 1.7.3 版本利用了這些最佳化，並帶來了來自 Jetpack Compose 1.7.0 的效能改進。

將 Compose Multiplatform 1.6.11（搭配 Kotlin 2.0.0）與 Compose Multiplatform 1.7.3（搭配 Kotlin 2.0.20）相比，我們在各方面都看到了更好的結果：

* *LazyGrid* 效能基準測試模擬了 `LazyVerticalGrid` 滾動（最接近現實生活的使用案例），平均執行速度快了 **約 9%**。
    它還顯示出掉影格數量顯著減少，這通常會讓使用者感覺 UI 回應速度較慢。
    請親自嘗試：使用 Compose Multiplatform 開發的 iOS 應用程式應該會感覺流暢得多。
* *VisualEffects* 效能基準測試渲染了大量隨機放置的組件，執行速度快了 **3.6** 倍：
    每 1000 影格的平均 CPU 時間從 8.8 秒減少到 2.4 秒。
* *AnimatedVisibility* composable 為顯示和隱藏影像製作動畫，顯示渲染速度提升了 **約 6%**。

最重要的是，Kotlin 2.0.20 在垃圾收集器中引入了實驗性的[並行標記支援](https://kotlinlang.org/docs/whatsnew2020.html#concurrent-marking-in-garbage-collector)。啟用並行標記可縮短垃圾收集器的停頓時間，並為所有效能基準測試帶來更大的改進。

您可以在 Compose Multiplatform 存儲庫中查看這些 Compose 特定效能基準測試的程式碼：

* [Kotlin/Native 效能基準測試](https://github.com/JetBrains/compose-multiplatform/tree/master/benchmarks/kn-performance)
* [Kotlin/JVM 與 Kotlin/Native 效能基準測試](https://github.com/JetBrains/compose-multiplatform/tree/master/benchmarks/ios/jvm-vs-kotlin-native)

## 桌面端

### 拖放

桌面端的 Compose Multiplatform 已實作拖放機制，允許使用者將內容拖入或拖出您的 Compose 應用程式。
要指定拖放的潛在來源與目的地，請使用 `dragAndDropSource` 和 `dragAndDropTarget` 修飾符。

> 雖然這些修飾符在通用程式碼中可用，但目前僅在桌面與 Android 原始碼集中運作。
> 敬請期待未來的版本。
> 
{style="note"}

常見使用案例請參閱 Jetpack Compose 文件中的[專題文章](https://developer.android.com/develop/ui/compose/touch-input/user-interactions/drag-and-drop)。

### BasicTextField（原名 BasicTextField2）已於桌面端採用

Jetpack Compose 已將 `BasicTextField2` 組件設為穩定版並更名為 `BasicTextField`。
在此版本中，Compose Multiplatform 已在桌面端目標採用此變更，並計劃在穩定的 1.7.0 版本中涵蓋 iOS。

新的 `BasicTextField`：

* 允許您更可靠地管理狀態。
* 提供新的 `TextFieldBuffer` API 以透過程式設計方式更改文字欄位內容。
* 包含數個用於視覺轉換與樣式設定的新 API。
* 提供對 `UndoState` 的存取，並具有返回欄位先前狀態的能力。

### ComposePanel 的渲染設定

透過在 `ComposePanel` 建構函式中指定新的 `RenderSettings.isVsyncEnabled` 參數，您可以提示後端渲染實作停用垂直同步。
這可以減少輸入與 UI 變更之間的視覺延遲，但也可能導致畫面撕裂。

預設行為保持不變：`ComposePanel` 會嘗試同步可繪製內容的顯示與 VSync。

## Web

### skiko.js 對於 Kotlin/Wasm 應用程式已是多餘的

對於使用 Compose Multiplatform 建置的 Kotlin/Wasm 應用程式，`skiko.js` 檔案現在已是多餘的。
您可以將其從 `index.html` 檔案中移除，並縮短應用程式的載入時間。
`skiko.js` 將在未來的版本中從 Kotlin/Wasm 發行版中完全移除。

> `skiko.js` 檔案對於 Kotlin/JS 應用程式仍是必要的，直到 Compose Multiplatform 1.9.0 為止。
> 請參閱 [Compose Multiplatform 1.9.3 新功能](whats-new-compose-190.md#skiko-js-is-no-longer-needed)以了解變更的時間點。
{style="note"}