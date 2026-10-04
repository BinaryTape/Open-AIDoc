[//]: # (title: iOS 遷移指南)

本頁面將引導你了解將專案中的 Compose Multiplatform 程式庫升級至較新版本（從 1.7.0 開始）時的 iOS 相關注意事項。

## 從 Compose Multiplatform 1.6.11 到 1.7.0 {id="compose-multiplatform-1-6-11-to-1-7-0"}

### 移除了 UIKitView 與 UIKitViewController 中的 background 參數 {id="removed-background-parameter-in-uikitview-and-uikitviewcontroller"}

已棄用的 `UIKitView` 與 `UIKitViewController` API 包含 `background` 參數，而新的 API 則沒有。
該參數被認為是冗餘的並已被移除：

* 若你需要為新執行個體設定互通檢視（interop view）背景，可以使用 `factory` 參數來完成。
* 若你需要背景是可更新的，請將對應程式碼放入 `update` Lambda 中。

### 輕觸或手勢可能無法如預期運作 {id="touches-or-gestures-may-stop-working-as-expected"}

新的預設[輕觸行為](compose-ios-touch.md)使用延遲來判斷該觸碰是要傳給互通檢視，還是傳給該檢視的 Compose 容器：使用者必須保持靜止至少 150 ms，互通檢視才會接收到該觸碰。

如果你需要 Compose Multiplatform 像以往一樣處理輕觸，請考慮使用新的實驗性 `UIKitInteropProperties` 建構函式。
它具有 `interactionMode` 參數，你可以將其設定為 `UIKitInteropInteractionMode.NonCooperative`，以讓 Compose 直接將輕觸傳遞給互通檢視。

該建構函式被標記為實驗性，是因為我們最終希望僅透過單一布林旗標來描述互通檢視的互動性。
在 `interactionMode` 參數中明確描述的行為，未來極有可能會以自動推導的方式處理。

### accessibilityEnabled 已被 isNativeAccessibilityEnabled 取代，且預設為關閉 {id="accessibilityenabled-replaced-by-isnativeaccessibilityenabled-and-turned-off-by-default"}

舊版 `UIKitView` 與 `UIKitViewController` 建構函式中的 `accessibilityEnabled` 參數已被移動並重新命名，改為作為 `UIKitInteropProperties.isNativeAccessibilityEnabled` 屬性提供。
它預設也被設定為 `false`。

`isNativeAccessibilityEnabled` 屬性會使合併後的 Compose 子樹帶有原生無障礙解析（accessibility resolution）。
因此，除非你需要互通檢視具備豐富的無障礙功能（例如網頁檢視 web views），否則不建議將其設為 true。

關於此屬性及其預設值背後的設計考量，請參閱 [`UIKitInteropProperties` 類別的程式碼內部文件](https://github.com/JetBrains/compose-multiplatform-core/blob/jb-main/compose/ui/ui/src/uikitMain/kotlin/androidx/compose/ui/viewinterop/UIKitInteropProperties.uikit.kt)。

### 移除了 onResize 參數 {id="onresize-parameter-removed"}

舊版 `UIKitView` 與 `UIKitViewController` 建構函式的 `onResize` 參數會根據 `rect` 引數設定自訂 frame，但不會影響 Compose 本身的版面配置，因此使用起來並不直覺。
此外，`onResize` 參數的預設實作需要正確設定互通檢視的 frame，並包含一些關於正確裁剪（clipping）檢視的實作細節。

在沒有 `onResize` 的情況下該如何處理：

* 若你需要對互通檢視的 frame 變更做出反應，你可以：
    * 覆寫互通 `UIView` 的 [`layoutSubviews`](https://developer.apple.com/documentation/uikit/uiview/1622482-layoutsubviews)，
    * 覆寫互通 `UIViewController` 的 [`viewDidLayoutSubviews`](https://developer.apple.com/documentation/uikit/uiviewcontroller/1621398-viewdidlayoutsubviews)，
    * 或是將 `onGloballyPositioned` 新增至 `Modifier` 鏈中。
* 若你需要設定互通檢視的 frame，請使用對應的 Compose 修飾符：`size`、`fillMaxSize` 等。

### 部分 onReset 使用模式已失效 {id="some-onreset-usage-patterns-were-invalidated"}

搭配 `remember { UIView() }` 使用非 null 的 `onReset` Lambda 是不正確的。

請參考以下程式碼：

```kotlin
val view = remember { UIView() }

UIKitView(factory = { view }, onReset = { /* ... */ })
```

當 `UIKitView` 進入組合（composition）時，只會呼叫 `factory` 或 `onReset` 其中之一，絕不會兩者都呼叫。
因此，若 `onReset` 不為 null，被 remember 的 `view` 可能會與畫面上顯示的不同：
可組合項可以脫離組合，並留下一個檢視執行個體；該執行個體會在 `onReset` 中重設後被重複使用，而不是使用 `factory` 分配一個新的執行個體。

為了避免此類錯誤，請勿在建構函式中指定 `onReset` 的值。
你可能會需要根據發出該檢視的函式進入組合時的上下文，從互通檢視內部執行回呼：
在此情況下，請考慮在 `onReset` 時使用 `update` 將回呼儲存在檢視內部。