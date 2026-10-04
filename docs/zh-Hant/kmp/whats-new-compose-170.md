[//]: # (title: Compose Multiplatform 1.7.3 的新功能)

以下是此功能版本的重要亮點：

* [型別安全的 Navigation](#type-safe-navigation)
* [共享元素轉場](#shared-element-transitions)
* [打包至 Android 資產的多平台資源](#resources-packed-into-android-assets)
* [自訂資源目錄](#custom-resource-directories)
* [支援多平台測試資源](#support-for-multiplatform-test-resources)
* [改善 iOS 上的觸控互通](#new-default-behavior-for-processing-touch-in-ios-native-elements)
* [Material3 `adaptive` 與 `material3-window-size-class` 現已進入通用程式碼](#material3-adaptive-adaptive)
* [桌面端實作拖放功能](#drag-and-drop)
* [桌面端採用 `BasicTextField`](#basictextfield-renamed-from-basictextfield2-adopted-on-desktop)

在 [GitHub](https://github.com/JetBrains/compose-multiplatform/blob/master/CHANGELOG.md#170-october-2024) 上查看此版本的完整變更清單。

## 相依性 {id="dependencies"}

* Gradle 外掛程式 `org.jetbrains.compose`，版本 1.7.3。基於 Jetpack Compose 程式庫：
  * [Runtime 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.7.5)
  * [UI 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.7.5)
  * [Foundation 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.7.5)
  * [Material 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-material#1.7.5)
  * [Material3 1.3.1](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.3.1)
* Lifecycle 程式庫 `org.jetbrains.androidx.lifecycle:lifecycle-*:2.8.3`。基於 [Jetpack Lifecycle 2.8.5](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.8.5)。
* Navigation 程式庫 `org.jetbrains.androidx.navigation:navigation-*:2.8.0-alpha10`。基於 [Jetpack Navigation 2.8.0](https://developer.android.com/jetpack/androidx/releases/navigation#2.8.0)。
* Material3 Adaptive 程式庫 `org.jetbrains.compose.material3.adaptive:adaptive-*:1.0.0`。基於 [Jetpack Material3 Adaptive 1.0.0](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.0.0)。

## 重大變更 {id="breaking-changes"}

### 最低 AGP 版本提升至 8.1.0 {id="minimum-agp-version-raised-to-8-1-0"}

Compose Multiplatform 1.7.0 所使用的 Jetpack Compose 1.7.0 與 Lifecycle 2.8.0 均不支援 AGP 7。
因此，當你更新至 Compose Multiplatform 1.7.3 時，可能也必須升級你的 AGP 相依性。

> Android Studio 中新實作的 Android composable 預覽[需要最新版本之一的 AGP](#resources-packed-into-android-assets)。
>
{style="note"}

### 棄用 Java 資源 API，改用多平台資源庫 {id="java-resources-api-is-deprecated-in-favor-of-the-multiplatform-resource-library"}

在此版本中，我們明確棄用了 `compose.ui` 套件中提供的 Java 資源 API：
`painterResource()`、`loadImageBitmap()`、`loadSvgPainter()` 與 `loadXmlImageVector()` 函式，以及
`ClassLoaderResourceLoader` 類別和依賴它的函式。

建議改用[多平台資源庫](compose-multiplatform-resources.md)。
雖然你可以在 Compose Multiplatform 中使用 Java 資源，但它們無法享受架構提供的延伸功能：產生的存取子、多模組支援、在地化等。

如果你仍必須存取 Java 資源，可以複製[提取要求中建議的實作方式](https://github.com/JetBrains/compose-multiplatform-core/pull/1457)，
以確保程式碼在升級到 Compose Multiplatform 1.7.3 後仍能運作，並在可行的地方切換到多平台資源。

### 處理 iOS 原生元素觸控的新預設行為 {id="new-default-behavior-for-processing-touch-in-ios-native-elements"}

在 1.7.3 之前，Compose Multiplatform 無法回應落在互通 UI 檢視中的觸控事件，因此
互通檢視會完全處理這些觸控序列。

Compose Multiplatform 1.7.3 實作了更精細的邏輯來處理互通觸控序列。
預設情況下，在初次觸控後會有延遲，這有助於父層 composable 了解該觸控序列是否旨在與原生檢視互動，並做出相應的反應。

如需更多資訊，請參閱[本頁面的 iOS 章節](#ios-touch-interop)中的說明，
或閱讀[此功能的文件](compose-ios-touch.md)。

### iOS 上必須停用最小畫面時間 {id="disabling-minimum-frame-duration-on-ios-is-mandatory"}

開發者往往沒有注意到針對高更新率顯示器輸出的警告，導致使用者無法在支援 120 Hz 的裝置上享受流暢的動畫。
我們現在嚴格執行此項檢查。如果 `Info.plist` 檔案中的 `CADisableMinimumFrameDurationOnPhone` 屬性不存在或設定為 `false`，使用 Compose Multiplatform 建置的應用程式將會崩潰。

你可以透過將 `ComposeUIViewControllerConfiguration.enforceStrictPlistSanityCheck` 屬性設定為 `false` 來停用此行為。

### 桌面端棄用 Modifier.onExternalDrag {id="deprecated-modifier-onexternaldrag-on-desktop"}

實驗性的 `Modifier.onExternalDrag` 及相關 API 已被棄用，改用新的 `Modifier.dragAndDropTarget`。
`DragData` 介面已移至 `compose.ui.draganddrop` 套件中。

如果你在 Compose Multiplatform 1.7.0 中使用已棄用的 API，將會遇到棄用錯誤。
在 1.8.0 中，`onExternalDrag` 修飾符將被完全移除。

## 跨平台 {id="across-platforms"}

### 共享元素轉場 {id="shared-element-transitions"}

Compose Multiplatform 現已提供 API，用於在共享一致元素的 composable 之間實現無縫轉場。
這些轉場在導覽中非常有用，可協助使用者追蹤 UI 變化的軌跡。

若要深入了解該 API，請參閱 [Jetpack Compose 文件](https://developer.android.com/develop/ui/compose/animation/shared-elements)。

### 型別安全的 Navigation {id="type-safe-navigation"}

Compose Multiplatform 採用了 Jetpack Compose 沿導覽路徑傳遞物件的型別安全方法。
Navigation 2.8.0 中的新 API 允許 Compose 為你的導覽圖提供編譯期安全。
這些 API 達到了與基於 XML 導覽的 [Safe Args](https://developer.android.com/guide/navigation/use-graph/pass-data#Safe-args) 外掛程式相同的效果。

詳細資訊請參閱 [Google 關於 Navigation Compose 中型別安全性的說明文件](https://developer.android.com/guide/navigation/design/type-safety)。

### 多平台資源 {id="multiplatform-resources"}

#### 打包至 Android 資產的資源 {id="resources-packed-into-android-assets"}

所有多平台資源現在都會打包至 Android 資產中。這使得 Android Studio 能夠為 Android 原始碼集中的 Compose Multiplatform composable 產生預覽。

> Android Studio 預覽僅適用於 Android 原始碼集中的 composable。
> 它們還需要最新版本的 AGP 之一：8.5.2、8.6.0-rc01 或 8.7.0-alpha04。
>
{style="note"}

這也提供了從 Android 上的 WebView 和媒體播放器組件直接存取多平台資源的功能，
因為資源可以透過簡單的路徑存取，例如 `Res.getUri(“files/index.html”)`。

以下是一個 Android composable 的範例，它顯示了一個帶有資源圖片連結的資源 HTML 頁面：

```kotlin
// androidMain/kotlin/com/example/webview/App.kt
@OptIn(ExperimentalResourceApi::class)
@Composable
@Preview
fun App() {
    MaterialTheme {
        val uri = Res.getUri("files/webview/index.html")

        // Adding a WebView inside AndroidView with layout as full screen.
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

該範例適用於這個簡單的 HTML 檔案：

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

此範例中的兩個資源檔案均位於 `commonMain` 原始碼集中：

![composeResources 目錄的檔案結構](compose-resources-android-webview.png){width="230"}

#### 自訂資源目錄 {id="custom-resource-directories"}

透過組態 DSL 中的新 `customDirectory` 設定，你可以[將自訂目錄關聯](compose-multiplatform-resources-setup.md#custom-resource-directories)到特定原始碼集。這使得將下載的檔案作為資源使用成為可能。

#### 多平台字型快取 {id="multiplatform-font-cache"}

Compose Multiplatform 將 Android 的字型快取功能引進其他平台，
消除了對 `Font` 資源過多的位元組讀取。

#### 支援多平台測試資源 {id="support-for-multiplatform-test-resources"}

資源庫現在支援在專案中使用測試資源，這表示你可以：

* 將資源新增至測試原始碼集中。
* 使用僅在對應原始碼集中可用的產生存取子。
* 僅在測試執行時將測試資源打包到應用程式中。

#### 資源對應至字串 ID 以便於存取 {id="resources-mapped-to-string-ids-for-easy-access"}

每種類型的資源都會與其檔案名稱進行對應。例如，你可以使用 `Res.allDrawableResources` 屬性取得所有 `drawable` 資源的 Map，並透過傳入字串 ID 來存取所需的資源：

```kotlin
Image(painterResource(Res.allDrawableResources["compose_multiplatform"]!!), null)
```

#### 將位元組陣列轉換為 ImageBitmap 或 ImageVector 的函式 {id="functions-for-converting-byte-arrays-into-imagebitmap-or-imagevector"}

新增了用於將 `ByteArray` 轉換為圖片資源的函式：

* `decodeToImageBitmap()` 將 JPEG、PNG、BMP 或 WEBP 檔案轉換為 `ImageBitmap` 物件。
* `decodeToImageVector()` 將 XML 向量檔案轉換為 `ImageVector` 物件。
* `decodeToSvgPainter()` 將 SVG 檔案轉換為 `Painter` 物件。此函式在 Android 上無法使用。

詳細資訊請參閱[說明文件](compose-multiplatform-resources-usage.md#convert-byte-arrays-into-images)。

### 新的通用模組 {id="new-common-modules"}

#### material3.adaptive:adaptive* {id="material3-adaptive-adaptive"}

Material3 adaptive 模組現已可在 Compose Multiplatform 的通用程式碼中使用。
若要使用它們，請在模組的 `build.gradle.kts` 檔案中明確將對應相依性新增至通用原始碼集：

```kotlin
commonMain.dependencies {
    implementation("org.jetbrains.compose.material3.adaptive:adaptive:1.0.0-alpha03")
    implementation("org.jetbrains.compose.material3.adaptive:adaptive-layout:1.0.0-alpha03")
    implementation("org.jetbrains.compose.material3.adaptive:adaptive-navigation:1.0.0-alpha03")
}
```

#### material3.material3-adaptive-navigation-suite {id="material3-material3-adaptive-navigation-suite"}

用於使用 Compose [建構自動調適導覽](https://developer.android.com/develop/ui/compose/layouts/adaptive/build-adaptive-navigation)所需的 Material3 adaptive navigation suite，現已可在 Compose Multiplatform 的通用程式碼中使用。
若要使用它，請在模組的 `build.gradle.kts` 檔案中明確將相依性新增至通用原始碼集：

```kotlin
commonMain.dependencies {
    implementation(compose.material3AdaptiveNavigationSuite)
}
```

#### material3:material3-window-size-class {id="material3-material3-window-size-class"}

若要使用 [`WindowSizeClass`](https://developer.android.com/reference/kotlin/androidx/compose/material3/windowsizeclass/package-summary) 類別，請在模組的 `build.gradle.kts` 檔案中明確將 `material3-window-size-class` 相依性新增至通用原始碼集：

```kotlin
commonMain.dependencies {
    implementation("org.jetbrains.compose.material3:material3-window-size-class:1.7.3")
}
```

`calculateWindowSizeClass()` 函式目前尚未在通用程式碼中提供。
不過，你可以在平台特定程式碼中匯入並呼叫它，例如：

```kotlin
// desktopMain/kotlin/main.kt
import androidx.compose.material3.windowsizeclass.calculateWindowSizeClass

// ...

val size = calculateWindowSizeClass()
```

#### material-navigation {id="material-navigation"}

除了 Compose Multiplatform Navigation 之外，`material-navigation` 程式庫現已可在通用程式碼中使用。
若要使用它，請在模組的 `build.gradle.kts` 檔案中將以下明確相依性新增至通用原始碼集：

```kotlin
commonMain.dependencies {
    implementation("org.jetbrains.androidx.navigation:navigation-compose:2.8.0-alpha10")
    implementation("org.jetbrains.compose.material:material-navigation:1.7.0-beta02")
}
```

### Skia 更新至 Milestone 126 {id="skia-updated-to-milestone-126"}

Compose Multiplatform 透過 [Skiko](https://github.com/JetBrains/skiko) 使用的 Skia 版本已更新至 Milestone 126。

先前使用的 Skia 版本為 Milestone 116。你可以在[版本資訊](https://skia.googlesource.com/skia/+/refs/heads/main/RELEASE_NOTES.md#milestone-126)中查看這些版本之間的變更。

### GraphicsLayer – 全新的繪圖 API {id="graphicslayer-a-new-drawing-api"}

Jetpack Compose 1.7.0 中新增的繪圖圖層現在也可在 Compose Multiplatform 中使用。

與 `Modifier.graphicsLayer` 不同，新的 `GraphicsLayer` 類別允許你在任何位置轉譯 Composable 內容。
當需要在不同場景中轉譯動畫內容時，這非常有用。

如需更詳細的說明與範例，請參閱[參考文件](https://developer.android.com/reference/kotlin/androidx/compose/ui/graphics/layer/GraphicsLayer)。

### LocalLifecycleOwner 移出 Compose UI {id="locallifecycleowner-moved-out-of-compose-ui"}

`LocalLifecycleOwner` 類別已從 Compose UI 套件移至 Lifecycle 套件。

此變更允許你存取該類別並呼叫其基於 Compose 的輔助 API，而無須依賴 Compose UI。
但請記住，在沒有 Compose UI 繫結的情況下，`LocalLifecycleOwner` 執行個體將沒有平台整合，因此也沒有平台特定的事件可供監聽。

## iOS {id="ios"}

### 改善 Compose Multiplatform 與原生 iOS 之間的觸控互通 {id="ios-touch-interop"}

此版本改善了 iOS 互通檢視的觸控處理。
Compose Multiplatform 現在會嘗試偵測觸控是針對互通檢視還是應由 Compose 處理。
這使得在 Compose Multiplatform 應用程式內的 UIKit 或 SwiftUI 區域中發生的觸控事件能夠被處理。

預設情況下，Compose Multiplatform 會將觸控事件傳輸至互通檢視的時間延遲 150 ms：

* 如果在此時間範圍內移動超過距離閾值，父層 composable 將攔截觸控序列，且不會轉發給互通檢視。
* 如果沒有明顯的移動，Compose 將不會處理其餘的觸控序列，而是完全由互通檢視處理。

此行為與原生 [`UIScrollView`](https://developer.apple.com/documentation/uikit/uiscrollview) 的運作方式一致。
它有助於避免觸控序列在互通檢視中開始時就被截獲，而 Compose Multiplatform 完全沒有機會處理的情況。這可能會導致令人沮喪的使用者體驗。
例如，想像在延遲清單（lazy list）等可捲動環境中使用大型互通影片播放器；當螢幕大部分區域被影片佔據，且影片在 Compose Multiplatform 未察覺的情況下攔截所有觸控時，要捲動清單就會變得很困難。

### 原生效能改進 {id="native-performance-improvements"}

隨著 Kotlin 2.0.20 的推出，Kotlin/Native 團隊在提升 iOS 上的 Compose 應用程式效能與流暢度方面取得了重大進展。
Compose Multiplatform 1.7.3 版本利用了這些最佳化，並帶來了 Jetpack Compose 1.7.0 的效能改進。

將 Compose Multiplatform 1.6.11 搭配 Kotlin 2.0.0 與 Compose Multiplatform 1.7.3 搭配 Kotlin 2.0.20 進行比較時，我們在各方面都看到了更好的成果：

* *LazyGrid* 效能基準測試模擬了最接近實際使用案例的 `LazyVerticalGrid` 捲動，平均執行速度提升約 **9%**。
    它還顯著減少了掉格的數量，掉格通常會讓使用者感覺 UI 反應變慢。
    親自體驗看看吧：使用 Compose Multiplatform 開發的 iOS 應用程式應該會感覺流暢許多。
* *VisualEffects* 效能基準測試轉譯了大量隨機放置的組建，其運作速度快了 **3.6** 倍：
    每 1000 幀的平均 CPU 時間從 8.8 秒降至 2.4 秒。
* *AnimatedVisibility* composable 模擬了圖片顯示和隱藏的動畫，轉譯速度提升了約 **6%**。

最重要的是，Kotlin 2.0.20 在垃圾收集器中引入了實驗性的[並行標記支援](https://kotlinlang.org/docs/whatsnew2020.html#concurrent-marking-in-garbage-collector)。啟用並行標記可縮短垃圾收集器的暫停時間，並使所有效能基準測試獲得更大幅度的改進。

你可以在 Compose Multiplatform 存儲庫中查看這些 Compose 專屬效能基準測試的程式碼：

* [Kotlin/Native 效能基準測試](https://github.com/JetBrains/compose-multiplatform/tree/master/benchmarks/kn-performance)
* [Kotlin/JVM 對比 Kotlin/Native 效能基準測試](https://github.com/JetBrains/compose-multiplatform/tree/master/benchmarks/ios/jvm-vs-kotlin-native)

## 桌面端 {id="desktop"}

### 拖放 {id="drag-and-drop"}

Compose Multiplatform 桌面端現已實作拖放機制，使用者可以將內容拖入或拖出 Compose 應用程式。
若要指定拖放的潛在來源與目的地，請使用 `dragAndDropSource` 與 `dragAndDropTarget` 修飾符。

> 雖然這些修飾符在通用程式碼中可用，但目前僅適用於桌面端和 Android 原始碼集。
> 請持續關注未來的版本。
> 
{style="note"}

有關常見的使用案例，請參閱 Jetpack Compose 文件中的[專題文章](https://developer.android.com/develop/ui/compose/touch-input/user-interactions/drag-and-drop)。

### 桌面端採用 BasicTextField（原名為 BasicTextField2） {id="basictextfield-renamed-from-basictextfield2-adopted-on-desktop"}

Jetpack Compose 已將 `BasicTextField2` 組建設為穩定版並更名為 `BasicTextField`。
在此版本中，Compose Multiplatform 已針對桌面端目標採用此變更，並計劃在穩定的 1.7.0 版本中也涵蓋 iOS。

新的 `BasicTextField`：

* 允許你更可靠地管理狀態。
* 提供新的 `TextFieldBuffer` API，用於以程式設計方式變更文字欄位內容。
* 包含數個用於視覺轉換與樣式設定的新 API。
* 提供對 `UndoState` 的存取，具備返回該欄位先前狀態的能力。

### ComposePanel 的轉譯設定 {id="render-settings-for-composepanel"}

透過在 `ComposePanel` 建構函式中指定新的 `RenderSettings.isVsyncEnabled` 參數，你可以向後端轉譯實作提示停用垂直同步。
這可以減少輸入與 UI 變更之間的視覺延遲，但也可能導致畫面撕裂。

預設行為保持不變：`ComposePanel` 會嘗試將 drawable 呈現與 VSync 同步。

## Web {id="web"}

### skiko.js 在 Kotlin/Wasm 應用程式中已是冗餘的 {id="skiko-js-is-redundant-for-kotlin-wasm-applications"}

使用 Compose Multiplatform 建置的 Kotlin/Wasm 應用程式不再需要 `skiko.js` 檔案（已是冗餘的）。
你可以從 `index.html` 檔案中將其移除，以改善應用程式的載入時間。
在未來的版本中，`skiko.js` 將從 Kotlin/Wasm 發行版本中徹底移除。

> 在 Compose Multiplatform 1.9.0 之前，Kotlin/JS 應用程式仍需要 `skiko.js` 檔案。
> 關於何時變更，請參閱 [Compose Multiplatform 1.9.3 的新功能](whats-new-compose-190.md#skiko-js-is-no-longer-needed)。
{style="note"}