[//]: # (title: Compose Multiplatform 1.9.3 的新功能)

以下是此功能版本的主要特點：

* [`@Preview` 註解的參數](#parameters-for-the-preview-annotation)
* [可自訂陰影](#customizable-shadows)
* [新的操作功能表 API](#new-context-menu-api)
* [Material 3 Expressive 佈景主題](#material-3-expressive-theme)
* [iOS 上的畫面更新率配置](#frame-rate-configuration)
* [Compose Multiplatform for Web 進入 Beta 階段](#compose-multiplatform-for-web-in-beta)
* [Web 目標的輔助功能支援](#accessibility-support)
* [Kotlin/JS 不再需要 skiko.js](#skiko-js-is-no-longer-needed)
* [用於內嵌 HTML 內容的新 API](#new-api-for-embedding-html-content)

請參閱 [GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.9.0) 以了解此版本的完整變更清單。

## 相依性

* Gradle 外掛程式 `org.jetbrains.compose` 版本為 1.9.3。基於 Jetpack Compose 程式庫：
   * [Runtime 1.9.4](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.9.4)
   * [UI 1.9.4](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.9.4)
   * [Foundation 1.9.4](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.9.4)
   * [Material 1.9.4](https://developer.android.com/jetpack/androidx/releases/compose-material#1.9.4)
   * [Material3 1.4.0](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.4.0)

* Compose Material3 程式庫 `org.jetbrains.compose.material3:1.9.0`。基於 [Jetpack Material3 1.4.0](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.4.0)。
  受益於 Compose Multiplatform 與 Material3 的[解耦版本](#decoupled-material3-versioning)，您可以為專案選擇較新的預覽版本。
* Compose Material3 Adaptive 程式庫 `org.jetbrains.compose.material3.adaptive:adaptive*:1.2.0`。基於 [Jetpack Material3 Adaptive 1.2.0](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.2.0)
* Lifecycle 程式庫 `org.jetbrains.androidx.lifecycle:lifecycle-*:2.9.6`。基於 [Jetpack Lifecycle 2.9.4](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.9.4)
* Navigation 程式庫 `org.jetbrains.androidx.navigation:navigation-*:2.9.1`。基於 [Jetpack Navigation 2.9.4](https://developer.android.com/jetpack/androidx/releases/navigation#2.9.4)
* Savedstate 程式庫 `org.jetbrains.androidx.savedstate:savedstate:1.3.6`。基於 [Jetpack Savedstate 1.3.3](https://developer.android.com/jetpack/androidx/releases/savedstate#1.3.3)
* WindowManager Core 程式庫 `org.jetbrains.androidx.window:window-core:1.4.0`。基於 [Jetpack WindowManager 1.4.0](https://developer.android.com/jetpack/androidx/releases/window#1.4.0)

## 跨平台

### `@Preview` 註解的參數

Compose Multiplatform 中的 `@Preview` 註解現在包含額外參數，用於配置 `@Composable` 函式在設計時預覽中的渲染方式：

* `name`：預覽的顯示名稱。
* `group`：預覽的群組名稱，可實現相關預覽的邏輯組織和選擇性顯示。
* `widthDp`：最大寬度（以 dp 為單位）。
* `heightDp`：最大高度（以 dp 為單位）。
* `locale`：應用程式的當前區域設定。
* `showBackground`：為預覽套用預設背景顏色的標記。
* `backgroundColor`：定義預覽背景顏色的 32 位元 ARGB 顏色整數。

這些新的預覽參數在 IntelliJ IDEA 和 Android Studio 中均可識別並運作。

### 可自訂陰影

在 Compose Multiplatform 1.9.0 中，我們引入了可自訂陰影，採用了 Jetpack Compose 的新陰影基本圖元和 API。除了先前支援的 `shadow` 修飾符外，您現在可以使用新 API 建立更進階且靈活的陰影效果。

有兩個新的基本圖元可用於建立不同類型的陰影：
`DropShadowPainter()` 和 `InnerShadowPainter()`。

若要將這些新陰影套用於 UI 元件，請使用 `dropShadow` 或 `innerShadow` 修飾符配置陰影效果：

<list columns="2">
   <li><code-block lang="kotlin" code="        Box(&#10;            Modifier.size(120.dp)&#10;                .dropShadow(&#10;                    RectangleShape,&#10;                    DropShadow(12.dp)&#10;                )&#10;                .background(Color.White)&#10;        )&#10;        Box(&#10;            Modifier.size(120.dp)&#10;                .innerShadow(&#10;                    RectangleShape,&#10;                    InnerShadow(12.dp)&#10;                )&#10;        )"/></li>
   <li><img src="compose-advanced-shadows.png" type="inline" alt="可自訂陰影" width="200"/></li>
</list>

您可以繪製任何形狀和顏色的陰影，甚至可以使用陰影幾何形狀作為遮罩來建立內部漸層填滿陰影：

<img src="compose-expressive-shadows.png" alt="富有表現力的陰影" width="244"/>

如需詳細資訊，請參閱 [shadow API 參考文件](https://developer.android.com/reference/kotlin/androidx/compose/ui/graphics/shadow/package-summary.html)。

### 新的操作功能表 API

我們採用了 Jetpack Compose 的新 API，用於在 `SelectionContainer` 和 `BasicTextField` 中自訂操作功能表。iOS 和 Web 的實作已完成，而桌面端則提供初始支援。

<list columns="2">
   <li><img src="compose_basic_text_field.png" type="inline" alt="BasicTextField 的操作功能表" width="420"/></li>
   <li><img src="compose_selection_container.png" type="inline" alt="SelectionContainer 的操作功能表" width="440"/></li>
</list>

若要啟用此新 API，請在應用程式進入點使用以下設定：

```kotlin
ComposeFoundationFlags.isNewContextMenuEnabled = true
```

如需詳細資訊，請參閱 [操作功能表 API 參考文件](https://developer.android.com/reference/kotlin/androidx/compose/foundation/text/contextmenu/data/package-summary)。

### Material 3 Expressive 佈景主題
<primary-label ref="Experimental"/>

Compose Multiplatform 現在支援 Material 3 程式庫中的實驗性 [`MaterialExpressiveTheme`](https://developer.android.com/reference/kotlin/androidx/compose/material3/package-summary?hl=en#MaterialExpressiveTheme(androidx.compose.material3.ColorScheme,androidx.compose.material3.MotionScheme,androidx.compose.material3.Shapes,androidx.compose.material3.Typography,kotlin.Function0))。Expressive 主題設定允許您自訂 Material Design 應用程式，以獲得更具個人化的體驗。

> 為了與 Jetpack Material3 [1.4.0-beta01 版本](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.4.0-beta01)保持一致，
> 所有標記為 `ExperimentalMaterial3ExpressiveApi` 和 `ExperimentalMaterial3ComponentOverrideApi` 的公開 API 均已移除。
>
> 如果您想使用這些實驗性功能，需要明確包含 Alpha 版本的 Material3。
{style="note"}

若要使用 Expressive 佈景主題：

1. 包含 Material 3 的實驗版本：

    ```kotlin
    implementation("org.jetbrains.compose.material3:material3:1.9.0-alpha04")
    ```

2. 使用 `MaterialExpressiveTheme()` 函式配置 UI 元素的整體佈景主題。
   此函式需要 `@OptIn(ExperimentalMaterial3ExpressiveApi::class)` 選擇性加入，並允許您指定
   `colorScheme`、`motionScheme`、`shapes` 和 `typography`。

接著，Material 元件（例如 [`Button()`](https://kotlinlang.org/api/compose-multiplatform/material3/androidx.compose.material3/-button.html)
和 [`Checkbox()`](https://kotlinlang.org/api/compose-multiplatform/material3/androidx.compose.material3/-checkbox.html)）
將自動使用您提供的值。

<img src="compose_expressive_theme.animated.gif" alt="Material 3 Expressive" width="250" preview-src="compose_expressive_theme.png"/>

### `androidx.compose.runtime:runtime` 中的多平台目標

為了提高 Compose Multiplatform 與 Jetpack Compose 的一致性，我們已將所有目標的支援直接新增至 `androidx.compose.runtime:runtime` 構件中。

`org.jetbrains.compose.runtime:runtime` 構件仍保持完全相容，現在作為別名使用。

### 帶有 `suspend` lambda 的 `runComposeUiTest()`

`runComposeUiTest()` 函式現在接受 `suspend` lambda，允許您使用 `awaitIdle()` 等掛起函式。

新 API 保證在所有支援的平台上正確執行測試，包括對 Web 環境的適當非同步處理：

* 對於 JVM 和原生目標，`runComposeUiTest()` 的運作方式類似於 `runBlocking()`，但會跳過延遲。
* 對於 Web 目標（Wasm 和 JS），它會傳回 `Promise` 並在跳過延遲的情況下執行測試主體。

## iOS

### 畫面更新率配置

Compose Multiplatform for iOS 現在支援配置用於渲染 Composable 的偏好畫面更新率。
如果動畫出現卡頓，您可能需要提高畫面更新率。另一方面，如果動畫較慢或為靜態，您可能偏好以較低的畫面更新率執行，以降低功耗。

您可以按如下方式設定偏好的畫面更新率類別：

```kotlin
Modifier.preferredFrameRate(FrameRateCategory.High)
```

或者，如果您需要 Composable 的特定畫面更新率，可以使用非負數定義偏好的每秒幀數：

```kotlin
Modifier.preferredFrameRate(30f)
```

如果在同一個 `@Composable` 樹中多次套用 `preferredFrameRate`，將套用最高指定值。
但是，裝置的硬體可能會限制支援的畫面更新率，通常最高可達 120 Hz。

### IME 選項

Compose Multiplatform 1.9.0 引入了對文字輸入元件的 iOS 特定 IME 自訂支援。
您現在可以使用 `PlatformImeOptions` 在文字欄位元件中直接配置原生 UIKit 文字輸入特性，例如鍵盤類型、自動修正和換行鍵行為：

```kotlin
BasicTextField(
    value = "",
    onValueChange = {},
    keyboardOptions = KeyboardOptions(
        platformImeOptions = PlatformImeOptions {
            keyboardType(UIKeyboardTypeEmailAddress)
        }
    )
)
```

## Web

### Compose Multiplatform for Web 進入 Beta 階段

Compose Multiplatform for Web 現已進入 Beta 階段，這是在線試用的絕佳時機。
請查看[我們的部落格文章](https://blog.jetbrains.com/kotlin/2025/09/compose-multiplatform-1-9-0-compose-for-web-beta/)以了解達成此里程碑的進展。

在我們邁向穩定版本的過程中，我們的藍圖包括：

* 實作行動瀏覽器中的拖放功能支援。
* 改進輔助功能支援。
* 解決與 `TextField` 元件相關的問題。

### 輔助功能支援

Compose Multiplatform 現在為 Web 目標提供初始輔助功能支援。此版本使螢幕閱讀器能夠存取描述標籤，並允許使用者在輔助導覽模式中瀏覽和點擊按鈕。

在此版本中，尚不支援以下功能：

* 具有捲軸和滑桿的互通與容器檢視的輔助功能。
* 遍歷索引。

您可以定義元件的[語意屬性](compose-accessibility.md#semantic-properties)以向輔助功能服務提供各種詳細資訊，例如元件的文字描述、功能類型、當前狀態或唯一識別碼。

例如，透過在 Composable 上設定 `Modifier.semantics { heading() }`，您可以通知輔助功能服務此元素作為標題，類似於文件中的章節或小節標題。螢幕閱讀器隨後可以使用此資訊進行內容導覽，允許使用者直接在標題之間跳轉。

```kotlin
Text(
    text = "這是標題", 
    modifier = Modifier.semantics { heading() }
)
```

輔助功能支援現在預設啟用，但您可以隨時透過調整 `isA11YEnabled` 來停用它：

```kotlin
ComposeViewport(
    viewportContainer = document.body!!,
    configure = { isA11YEnabled = false }
) {
    Text("Hello, Compose Multiplatform for web")
}
```

### 不再需要 skiko.js

自 Compose Multiplatform 1.7.0 起，對於 Kotlin/Wasm 應用程式來說 `skiko.js` 已經是冗餘的。
從此版本開始，對於 Kotlin/JS 也是如此：Skiko 的 Web 執行階段現在作為 ES 模組發布，並直接封裝到您應用程式編譯後的 JavaScript 中，因此不再需要為任何一個 Web 目標單獨提供 `skiko.js` 指令碼。

您可以從 `index.html` 檔案中移除 `<script src="skiko.js">` 標籤。

### 用於內嵌 HTML 內容的新 API

透過新的 `WebElementView()` Composable 函式，您可以將 HTML 元素無縫整合到 Web 應用程式中。

內嵌的 HTML 元素會根據 Compose 程式碼中定義的大小覆蓋在畫布區域上。它會攔截該區域內的輸入事件，防止這些事件被 Compose Multiplatform 接收。

以下是使用 `WebElementView()` 建立並內嵌 HTML 元素的範例，該元素在 Compose 應用程式中顯示互動式地圖檢視：

```kotlin
private val ttOSM =
    "https://www.openstreetmap.org/export/embed.html?bbox=4.890965223312379%2C52.33722052818563%2C4.893990755081177%2C52.33860862450587&amp;layer=mapnik"

@Composable
fun Map() {
    Box(
        modifier = Modifier.fillMaxWidth().fillMaxHeight()
    ) {
        WebElementView(
            factory = {
                (document.createElement("iframe")
                        as HTMLIFrameElement)
                    .apply { src = ttOSM }
            },
            modifier = Modifier.fillMaxSize(),
            update = { iframe -> iframe.src = iframe.src }
        )
    }
}
```

請注意，您只能將此函式與 `ComposeViewport` 進入點一起使用，因為 `CanvasBasedWindow` 已遭棄用。

### 用於繫結到導覽圖的簡化 API

Compose Multiplatform 引入了新的 API，用於將瀏覽器的導覽狀態繫結到 `NavController`：

```kotlin
suspend fun NavController.bindToBrowserNavigation()
```

新函式消除了直接與 `window` API 互動的需求，簡化了 Kotlin/Wasm 和 Kotlin/JS 的原始碼集。

先前使用的 `Window.bindToNavigation()` 函式已遭棄用，改用新的 `NavController.bindToBrowserNavigation()` 函式。

之前：

```kotlin
LaunchedEffect(Unit) {
    // 直接與 window 物件互動
    window.bindToNavigation(navController)
}
```

之後：

```kotlin
LaunchedEffect(Unit) {
    // 隱式存取 window 物件
    navController.bindToBrowserNavigation()
}
```

## 桌面端

### 在顯示前配置視窗

Compose Multiplatform 現在包含新的 `SwingFrame()` 和 `SwingDialog()` Composable。
它們與現有的 `Window()` and `DialogWindow()` 函式類似，但包含一個 `init` 區塊。

先前，您無法設定某些必須在顯示前配置的視窗屬性。
新的 `init` 區塊會在您的視窗或對話方塊出現在螢幕上之前執行，允許您配置諸如 `java.awt.Window.setType` 之類的屬性，或新增需要提早準備好的事件接聽程式。

我們建議僅對視窗或對話方塊可見後無法更改的屬性使用 `init` 區塊。
對於所有其他配置，請繼續使用 `LaunchedEffect(window)` 模式，以確保您的程式碼保持相容並在未來的更新中正確運作。

## Gradle 外掛程式

### 解耦的 Material3 版本控制

Material3 程式庫與 Compose Multiplatform Gradle 外掛程式的版本和穩定水準不再需要保持一致。`compose.material3` DSL 別名引用來自 Jetpack Compose 穩定版本的 Material3 1.9.0，但您可以為專案選擇預覽版本。

如果您想使用具有 Expressive 設計支援的 Material3 版本，請將 `build.gradle.kts` 中的 Material 3 相依性替換為以下內容：

```kotlin
implementation("org.jetbrains.compose.material3:material3:1.9.0-alpha04")
```

### 統一的 Web 發行

新的 `composeCompatibilityBrowserDistribution` Gradle 任務將 Kotlin/JS 和 Kotlin/Wasm 發行版合併為單一封裝。
這允許 Wasm 應用程式在瀏覽器不支援現代 Wasm 功能時回退到 JS 目標。

### 支援 AGP 9.0.0

Compose Multiplatform 引入了對 Android Gradle 外掛程式 (AGP) 9.0.0 版本的支援。
為了與新 AGP 版本相容，請確保升級到 Compose Multiplatform 1.9.3 或 1.10.0。

為了讓長期更新過程更順暢，
我們建議更改專案結構以使用專用的 Android 應用程式模組。