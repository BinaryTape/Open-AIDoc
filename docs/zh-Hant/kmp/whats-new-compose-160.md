[//]: # (title: Compose Multiplatform 1.6.0 新功能)

以下是 Compose Multiplatform 1.6.0 版本的主要亮點：

* [重大變更](#breaking-changes)
* [全新且改進的資源 API](#improved-resources-api-all-platforms)
* [iOS 輔助功能的基本支援](#accessibility-support)
* [適用於所有平台的 UI 測試 API](#ui-testing-api-experimental-all-platforms)
* [適用於快顯視窗、對話方塊和下拉式選單的獨立平台檢視](#separate-platform-views-for-popups-dialogs-and-dropdowns-ios-desktop)。
* [合併來自 Jetpack Compose 和 Material 3 的變更](#changes-from-jetpack-compose-and-material-3-all-platforms)
* [穩定版本中的 Kotlin/Wasm 構件](#kotlin-wasm-artifacts-available-in-stable-versions-of-the-framework)
* [已知問題：缺少相依性](#known-issues-missing-dependencies)

## 相依性 {id="dependencies"}

此版本的 Compose Multiplatform 基於以下 Jetpack Compose 程式庫：

* [Compiler 1.5.8](https://developer.android.com/jetpack/androidx/releases/compose-compiler#1.5.8)
* [Runtime 1.6.1](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.6.1)
* [UI 1.6.1](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.6.1)
* [Foundation 1.6.1](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.6.1)
* [Material 1.6.1](https://developer.android.com/jetpack/androidx/releases/compose-material#1.6.1)
* [Material3 1.2.0](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.2.0)

## 重大變更 {id="breaking-changes"}

### 預設裁切設定了 lineHeight 的文字內距 {id="padding-for-text-with-lineheight-set-trimmed-by-default"}

隨著對 [LineHeightStyle.Trim](https://developer.android.com/reference/kotlin/androidx/compose/ui/text/style/LineHeightStyle.Trim) 支援的加入，
Compose Multiplatform 在文字內距 (padding) 裁切方式上與 Android 保持一致。
詳情請參閱 [提取要求](https://github.com/JetBrains/compose-multiplatform-core/pull/897)。

這與 [1.6.0-alpha01 版本](https://developer.android.com/jetpack/androidx/releases/compose-material#1.6.0-alpha01) 中的 `compose.material` 變更一致：
* 在 Android 上，`includeFontPadding` 參數預設變為 `false`。
  若要深入了解此變更，請參閱[關於在 Compose Multiplatform 中不實作此標記的討論](https://github.com/JetBrains/compose-multiplatform/issues/2477#issuecomment-1825716543)。
* 預設的行高樣式已更改為 `Trim.None` 和 `Alignment.Center`。Compose Multiplatform 現在支援
  `LineHeightStyle.Trim` 並將 `Trim.None` 作為預設值實作。
* 在 `Typography` 的 `TextStyle` 中加入了明確的 `lineHeight`，這導致了[下一個重大變更](#using-fontsize-in-materialtheme-requires-lineheight)。

### 在 MaterialTheme 中使用 fontSize 時需要 lineHeight {id="using-fontsize-in-materialtheme-requires-lineheight"}

> 這僅影響 `material` 組件。`material3` 已經有此限制。
>
{style="note"}

如果您在 `MaterialTheme` 中為 `Text` 組件設定了 `fontSize` 屬性但未包含 `lineHeight`，則實際行高將不會被修改以符合字型。現在，每次設定對應的 `fontSize` 時，您都必須明確指定 `lineHeight` 屬性。

Jetpack Compose 現在[建議](https://issuetracker.google.com/issues/321872412)不要直接設定字型大小：

> 為了支援非標準文字大小，我們鼓勵使用者遵循 Material 設計系統並使用不同的 [類型量表 (type scale)](https://m2.material.io/design/typography/the-type-system.html#type-scale)，
> 而不是直接更改字型大小。或者，使用者可以像這樣覆寫行高：
> `style = LocalTextStyle.current.copy(lineHeight = TextUnit.Unspecified)`，或者完全建立自訂的 `Typography`。
>
{style="tip"}

### 資源組織的新方法 {id="new-approach-to-resource-organization"}

如果您一直在 Compose Multiplatform 1.6.0 的預覽版本中使用資源 API，請熟悉
[目前版本的說明文件](compose-multiplatform-resources.md)：1.6.0-beta01 更改了資源檔案在專案資料夾中的儲存方式，以便專案程式碼可以存取。

## 跨平台 {id="across-platforms"}

### 改進的資源 API（所有平台） {id="improved-resources-api-all-platforms"}

新的實驗性 API 加入了對字串和字型的支援，並讓您能在通用 Kotlin 中更舒適地共享和存取資源：

* 資源可以根據其設計的特定設定或約束進行組織，支援：
  * 地區設定 (Locales)
  * 圖片解析度
  * 深色和淺色佈景主題
* Compose Multiplatform 現在會為每個專案產生一個 `Res` 物件，以提供直截了當的資源存取。

若要進一步了解資源限定詞，以及新資源 API 的更深入概述，
請參閱[圖片與資源](compose-multiplatform-resources.md)。

### UI 測試 API（實驗性，所有平台） {id="ui-testing-api-experimental-all-platforms"}

Compose Multiplatform 的 UI 測試實驗性 API（先前已在桌面和 Android 上提供）現在支援所有平台。您可以編寫並執行通用測試，以驗證您的應用程式 UI 在該架構支援的各個平台上的行為。此 API 使用與 Jetpack Compose 相同的尋找器、斷言、操作和比對器。

> 僅在桌面專案中支援基於 JUnit 的測試。
>
{style="note"}

有關設定說明和測試範例，請參閱[測試 Compose Multiplatform UI](compose-test.md)。

### 來自 Jetpack Compose 和 Material 3 的變更（所有平台） {id="changes-from-jetpack-compose-and-material-3-all-platforms"}

#### Jetpack Compose 1.6.1 {id="jetpack-compose-1-6-1"}

合併 Jetpack Compose 的最新版本對所有平台的效能都有正面影響。詳情請參閱
[Android 開發者部落格上的公告](https://android-developers.googleblog.com/2024/01/whats-new-in-jetpack-compose-january-24-release.html)。

此版本的其他顯著功能：
* 預設字型內距的變更僅對 Android 目標生效。但是，請務必考慮到
  此變更的[副作用](#using-fontsize-in-materialtheme-requires-lineheight)。
* Compose Multiplatform 已在其他目標上支援滑鼠選取。在 1.6.0 中，這也包含了 Android。

尚未移植到 Compose Multiplatform 的 Jetpack Compose 功能：
* [BasicTextField2](https://github.com/JetBrains/compose-multiplatform/issues/4218)
* [支援非線性字型縮放](https://github.com/JetBrains/compose-multiplatform/issues/4305)
* [MultiParagraph.fillBoundingBoxes](https://github.com/JetBrains/compose-multiplatform/issues/4236)
* [多平台拖放](https://github.com/JetBrains/compose-multiplatform/issues/4235)。目前僅在 Android 上運作。在桌面上，您可以使用現有的 API `Modifier.onExternalDrag`。

JetBrains 團隊正在努力在未來的 Compose Multiplatform 版本中採用這些功能。

#### Compose Material 3 1.2.0 {id="compose-material-3-1-2-0"}

版本亮點：
* 新的實驗性組件 `Segmented Button`，具有單選和多選功能。
* 擴充了顏色集，提供更多表面選項，以便更輕鬆地在 UI 中強調資訊。
  * 實作注意事項：`ColorScheme` 物件現在是不可變的。如果您的程式碼目前直接修改 `ColorScheme` 中的顏色，
    您現在需要使用 [copy](https://developer.android.com/reference/kotlin/androidx/compose/material3/ColorScheme#copy(androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color)) 方法來更改顏色。
  * 現在提供多種表面顏色和表面容器選項，而不是單一的表面值，以實現更靈活的顏色管理。

有關 Material 3 變更的更多詳細資訊，請參閱 [Material Design 部落格上的發佈文章](https://material.io/blog/material-3-compose-1-2)。

### 快顯視窗、對話方塊和下拉式功能表的獨立平台檢視（iOS、桌面） {id="separate-platform-views-for-popups-dialogs-and-dropdowns-ios-desktop"}

有時，快顯元素（例如工具提示和下拉式功能表）不被初始 Composable 畫布或應用程式視窗限制是很重要的。如果 Composable 檢視不佔滿全螢幕但需要產生警示對話方塊，這點就顯得尤為重要。在 1.6.0 中，有一種方法可以可靠地實現這一點。

請注意，快顯視窗和對話方塊仍然無法在其自身邊界之外繪製任何內容（例如，最頂層容器的陰影）。

#### iOS（穩定版） {id="ios-stable"}

在 iOS 上，此功能預設為啟用。
若要切換回舊行為，請將 `platformLayers` 參數設定為 `false`：

```kotlin
ComposeUIViewController(
    configure = {
        platformLayers = false
    }
) {
    // 您的 Compose 程式碼
}
```

#### 桌面（實驗性） {id="desktop-experimental"}

若要在桌面上使用此功能，請設定 `compose.layers.type`
系統屬性。支援的值：
* `WINDOW`：將 `Popup` 和 `Dialog` 組件建立為獨立的無裝飾視窗。
* `COMPONENT`：在同一視窗中將 `Popup` 或 `Dialog` 建立為獨立的 Swing 組件。它僅適用於離屏渲染，且 `compose.swing.render.on.graphics` 必須設定為 `true`（請參閱 1.5.0 Compose Multiplatform 版本說明中的 [增強型 Swing 互通](https://blog.jetbrains.com/kotlin/2023/08/compose-multiplatform-1-5-0-release/#enhanced-swing-interop)
  部分）。請注意，離屏渲染僅適用於 `ComposePanel` 組件，不適用於全視窗應用程式。

使用 `COMPONENT` 屬性的程式碼範例：

```kotlin
@OptIn(ExperimentalComposeUiApi::class)
fun main() = SwingUtilities.invokeLater {
    System.setProperty("compose.swing.render.on.graphics", "true")
    System.setProperty("compose.layers.type", "COMPONENT")

    val window = JFrame()
    window.defaultCloseOperation = WindowConstants.EXIT_ON_CLOSE

    val contentPane = JLayeredPane()
    contentPane.layout = null

    val composePanel = ComposePanel()
    composePanel.setBounds(200, 200, 200, 200)
    composePanel.setContent {
      ComposeContent()
    }
    composePanel.windowContainer = contentPane  // 將整個視窗用於對話方塊
    contentPane.add(composePanel)

    window.contentPane.add(contentPane)
    window.setSize(800, 600)
    window.isVisible = true
  }

@Composable
fun ComposeContent() {
    Box(Modifier.fillMaxSize().background(Color.Green)) {
        Dialog(onDismissRequest = {}) {
            Box(Modifier.size(100.dp).background(Color.Yellow))
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true"  collapsed-title="val window = JFrame()"}

`Dialog`（黃色）被完整繪製，不論父級 `ComposePanel`（綠色）的邊界為何：

![父面板邊界外的對話方塊](compose-desktop-separate-dialog.png){width=700}

### 文字裝飾線樣式支援（iOS、桌面、Web） {id="support-for-text-decoration-line-styles-ios-desktop-web"}

Compose Multiplatform 現在允許使用 `PlatformTextStyle` 類別為文字設定底線樣式。

> 該類別在通用原始碼集中不可用，需要在平台特定程式碼中使用。
>
{style="warning"}

設定虛線底線樣式的範例：

```kotlin
Text(
  "Hello, Compose",
  style = TextStyle(
    textDecoration = TextDecoration.Underline,
    platformStyle = PlatformTextStyle (
      textDecorationLineStyle = TextDecorationLineStyle.Dotted
    )
  )
)
```

您可以使用實線、雙倍寬度實線、點線、虛線和波浪線樣式。請在
[原始碼](https://github.com/JetBrains/compose-multiplatform-core/blob/jb-main/compose/ui/ui-text/src/skikoMain/kotlin/androidx/compose/ui/text/TextDecorationLineStyle.kt#L21)中查看所有可用選項。

### 存取系統上安裝的字型（iOS、桌面、Web） {id="accessing-fonts-installed-on-the-system-ios-desktop-web"}

您現在可以從 Compose Multiplatform 應用程式存取系統上安裝的字型：使用 `SystemFont` 類別載入具有適當字型樣式和字型粗細的字型：

```kotlin
import androidx.compose.ui.text.platform.SystemFont

FontFamily(SystemFont("Menlo", weight = 700))
FontFamily(SystemFont("Times New Roman", FontWeight.Bold))
FontFamily(SystemFont("Webdings"))
```

在桌面上，您可以透過僅指定字型系列名稱來使用 `FontFamily` 函式載入所有可能的字型樣式
（詳細範例請參閱 [程式碼範例](https://github.com/JetBrains/compose-multiplatform-core/blob/release/1.6.0/compose/desktop/desktop/samples/src/jvmMain/kotlin/androidx/compose/desktop/examples/fonts/Fonts.jvm.kt)）：

```kotlin
FontFamily("Menlo")
```

## iOS {id="ios"}

### 輔助功能支援 {id="accessibility-support"}

適用於 iOS 的 Compose Multiplatform 現在允許身心障礙人士以與原生 iOS UI 相同的舒適度與 Compose UI 進行互動：

* 螢幕閱讀器和 VoiceOver 可以存取 Compose UI 的內容。
* Compose UI 支援與原生 UI 相同的導覽與互動手勢。

這也意味著您可以將 Compose Multiplatform 語義資料提供給輔助功能服務和 XCTest 框架。

有關實作和自訂 API 的詳細資訊，請參閱 [iOS 輔助功能支援](compose-ios-accessibility.md)。

### 變更 Composable 檢視的透明度 {id="changing-opacity-for-composable-view"}

`ComposeUIViewController` 類別現在多了一個配置選項，可以將檢視背景的透明度更改為透明。

> 透明背景會導致額外的混合步驟，從而對效能產生負面影響。
>
{style="note"}

```kotlin
val appController = ComposeUIViewController(configure = {
      this.opaque = false
}) {
    App()
}
```

透明背景可以幫助您實現的範例：

![Compose opaque = false 演示](compose-opaque-property.png){width=700}

### 透過按兩下或連按三下選取 SelectionContainer 中的文字 {id="selecting-text-in-selectioncontainer-by-double-and-triple-tap"}

以前，適用於 iOS 的 Compose Multiplatform 僅允許使用者在文字輸入欄位中透過多次點擊選取文字。現在，按兩下和連按三下手勢也適用於選取 `SelectionContainer` 內部 `Text` 組件中顯示的文字。

### 與 UIViewController 互通 {id="interop-with-uiviewcontroller"}

某些未實作為 `UIView` 的原生 API（例如 `UITabBarController` 或 `UINavigationController`）無法使用 [現有的互通機制](compose-uikit-integration.md) 嵌入到 Compose Multiplatform UI 中。

現在，Compose Multiplatform 實作了 `UIKitViewController` 函式，允許您在 Compose UI 中嵌入原生 iOS 檢視控制器。

### 文字欄位中透過長按/單擊實現類似原生的插入符號行為 {id="native-like-caret-behavior-by-long-single-taps-in-text-fields"}

Compose Multiplatform 現在更接近 iOS 原生的文字欄位插入符號 (caret) 行為：
* 單擊文字欄位後，插入符號的位置確定更加精確。
* 在文字欄位中長按並拖動會導致游標移動，而不是像 Android 那樣進入選取模式。

## 桌面 {id="desktop"}

### 改進互通混合的實驗性支援 {id="experimental-support-of-improved-interop-blending"}

過去，使用 `SwingPanel` 包裝函式實作的互通檢視始終是矩形的，並且始終位於前景，處於任何 Compose Multiplatform 組件之上。這使得任何快顯元素（下拉式功能表、浮動通知）的使用都具有挑戰性。透過新的實作，此問題已得到解決，您現在可以在以下使用案例中依賴 Swing：

* 裁剪 (Clipping)。您不再受限於矩形形狀：裁剪和陰影修飾符現在可以在 SwingPanel 上正常運作。

    ```kotlin
    // 啟用實驗性混合所需的標記
    System.setProperty("compose.interop.blending", "true")
  
    SwingPanel(
        modifier = Modifier.clip(RoundedCornerShape(6.dp))
        //...
    )
    ```
  
  您可以在左側看到沒有此功能的 `JButton` 裁剪方式，以及右側的實驗性混合效果：

  ![使用 SwingPanel 正確裁剪](compose-swingpanel-clipping.png)
* 重疊 (Overlapping)。現在可以在 `SwingPanel` 之上繪製任何 Compose Multiplatform 內容，並像往常一樣與其進行互動。
  在這裡，「Snackbar」位於帶有可點擊 **OK** 按鈕的 Swing 面板之上：

  ![使用 SwingPanel 正確重疊](compose-swingpanel-overlapping.png)

請參閱[提取要求的說明](https://github.com/JetBrains/compose-multiplatform-core/pull/915)中的已知限制和其他詳細資訊。

## Web {id="web"}

### 框架穩定版本中提供 Kotlin/Wasm 構件 {id="kotlin-wasm-artifacts-available-in-stable-versions-of-the-framework"}

Compose Multiplatform 的穩定版本現在支援 Kotlin/Wasm 目標。在您切換到 1.6.0 後，您不需要在相依性清單中指定特定的 `dev-wasm` 版本的 `compose-ui` 程式庫。

> 若要建置具有 Wasm 目標的 Compose Multiplatform 專案，您需要使用 Kotlin 1.9.22 及更高版本。
>
{style="warning"}

## 已知問題：缺少相依性 {id="known-issues-missing-dependencies"}

在預設專案配置下，可能會缺少幾個程式庫：

* `org.jetbrains.compose.annotation-internal:annotation` 或 `org.jetbrains.compose.collection-internal:collection`

  如果某個程式庫依賴於與 1.6.0 二進位不相容的 Compose Multiplatform 1.6.0-beta02，則它們可能會缺失。
  要找出是哪個程式庫，請執行此指令（將 `shared` 替換為您的主模組名稱）：

  ```shell
  ./gradlew shared:dependencies
  ```

  將該程式庫降級到依賴於 Compose Multiplatform 1.5.12 的版本，或要求程式庫作者將其升級到 Compose Multiplatform 1.6.0。

* `androidx.annotation:annotation:...` 或 `androidx.collection:collection:...`

  Compose Multiplatform 1.6.0 依賴於 [collection](https://developer.android.com/jetpack/androidx/releases/collection)
  和 [annotation](https://developer.android.com/jetpack/androidx/releases/annotation) 程式庫，這些程式庫僅在 Google Maven 存儲庫中提供。

  若要讓您的專案可以使用此存儲庫，請在模組的 `build.gradle.kts` 檔案中加入以下行：

  ```kotlin
  repositories {
      //...
      google()
  }
  ```
