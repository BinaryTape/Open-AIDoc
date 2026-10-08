[//]: # (title: 支援的版本與配置)

<primary-label ref="beta"/> 

本頁提供關於 [WebAssembly 提案](https://webassembly.org/roadmap/)、支援的瀏覽器以及使用 Kotlin/Wasm 進行高效開發的建議配置詳細資訊。

## 瀏覽器版本 {id="browser-versions"}

Kotlin/Wasm 依賴最新的 WebAssembly 提案，例如 [垃圾收集 (WasmGC)](#garbage-collection-proposal) 和 [例外處理](#exception-handling-proposal)，以便在 WebAssembly 中引入改進與新功能。

為了確保這些功能正常運作，請提供支援最新提案的環境。請檢查您的瀏覽器版本是否預設支援新的 WasmGC，或是您是否需要對環境進行變更。

### Chrome {id="chrome"}

* **119 或更高版本：**

  預設即可運作。

* **較舊版本：**

  > 若要在較舊的瀏覽器中執行應用程式，您需要使用 1.9.20 之前的 Kotlin 版本。
  >
  {style="note"}

  1. 在瀏覽器中前往 `chrome://flags/#enable-webassembly-garbage-collection`。
  2. 啟用 **WebAssembly Garbage Collection**。
  3. 重啟瀏覽器。

### 基於 Chromium 的瀏覽器 {id="chromium-based"}

包括以 Chromium 為核心的瀏覽器，例如 Edge、Brave、Opera 或 Samsung Internet。

* **119 或更高版本：**

  預設即可運作。

* **較舊版本：**

   > 若要在較舊的瀏覽器中執行應用程式，您需要使用 1.9.20 之前的 Kotlin 版本。
   >
   {style="note"}

  使用 `--js-flags=--experimental-wasm-gc` 命令列引數執行應用程式。

### Firefox {id="firefox"}

* **120 或更高版本：**

  預設即可運作。

* **119 版本：**

  1. 在瀏覽器中前往 `about:config`。
  2. 啟用 `javascript.options.wasm_gc` 選項。
  3. 重新整理頁面。

### Safari/WebKit {id="safari-webkit"}

* **18.2 或更高版本：**

  預設即可運作。

* **較舊版本：**

   不支援。

> Safari 18.2 可用於 iOS 18.2、iPadOS 18.2、visionOS 2.2、macOS 15.2、macOS Sonoma 以及 macOS Ventura。
> 在 iOS 和 iPadOS 上，Safari 18.2 與作業系統捆綁。若要取得該版本，請將您的裝置更新至 18.2 或更高版本。
>
> 欲了解更多資訊，請參閱 [Safari 版本說明](https://developer.apple.com/documentation/safari-release-notes/safari-18_2-release-notes#Overview)。
>
{style="note"}

## Wasm 提案支援 {id="wasm-proposals-support"}

Kotlin/Wasm 的改進基於 [WebAssembly 提案](https://webassembly.org/roadmap/)。您可以在此處找到關於 WebAssembly 垃圾收集和（舊版）例外處理提案支援的詳細資訊。 

### 垃圾收集提案 {id="garbage-collection-proposal"}

自 Kotlin 1.9.20 起，Kotlin 工具鏈使用最新版本的 [Wasm 垃圾收集](https://github.com/WebAssembly/gc) (WasmGC) 提案。 

因此，我們強烈建議您將 Wasm 專案更新至最新版本的 Kotlin。我們也建議您在 Wasm 環境中使用最新版本的瀏覽器。

### 例外處理提案 {id="exception-handling-proposal"}

Kotlin 工具鏈同時支援 [舊版](https://github.com/WebAssembly/exception-handling/blob/master/proposals/exception-handling/legacy/Exceptions.md) 與 [新版](https://github.com/WebAssembly/exception-handling/blob/main/proposals/exception-handling/Exceptions.md) 的例外處理提案。這使得 Kotlin 產生的 Wasm 二進制檔案能在更廣泛的環境中執行。

[`wasmJs` 目標](wasm-overview.md#kotlin-wasm-and-compose-multiplatform) 預設使用舊版例外處理提案。若要為 `wasmJs` 目標啟用新版例外處理提案，請使用 `-Xwasm-use-new-exception-proposal` 編譯器選項。

相比之下，[`wasmWasi` 目標](wasm-overview.md#kotlin-wasm-and-wasi) 預設使用新版提案，以確保與現代 WebAssembly 執行時環境有更好的相容性。若要切換到舊版提案，請使用 `-Xwasm-use-new-exception-proposal=false` 編譯器選項。

對於 `wasmWasi` 目標，採用新版例外處理提案是安全的。以此環境為目標的應用程式通常執行在多樣性較低的執行時環境中（通常在單個特定的虛擬機上執行），且該環境通常由使用者控制，從而降低了相容性問題的風險。

> 透過我們的 [Kotlin/Wasm 範例](https://github.com/Kotlin/kotlin-wasm-examples#readme) 進一步了解設定專案、使用相依性以及其他任務。
>
{style="tip"}

## 使用預設匯入 {id="use-default-import"}

[將 Kotlin/Wasm 程式碼匯入 Javascript](wasm-js-interop.md) 已從預設匯出 (default exports) 轉向具名匯出 (named exports)。

如果您仍想使用預設匯入 (default import)，請產生一個新的 JavaScript 包裝函式模組。建立一個包含以下片段的 `.mjs` 檔案：

```Javascript
// 指定主 .mjs 檔案的路徑
import * as moduleExports from "./wasm-test.mjs";

export { moduleExports as default };
```

您可以將新的 `.mjs` 檔案放在資源資料夾中，它會在組建過程中自動放置在主 `.mjs` 檔案旁邊。

您也可以將 `.mjs` 檔案放在自訂位置。在這種情況下，您需要手動將其移動到主 `.mjs` 檔案旁邊，或調整匯入陳述式中的路徑以匹配其位置。

## Kotlin/Wasm 累加編譯 {id="kotlin-wasm-incremental-compilation"}

Kotlin/Wasm 目標支援累加編譯，這使編譯器能夠僅重新編譯與最近變更相關的檔案。這有助於縮短編譯時間。

Wasm 目標的累加編譯預設為啟用。若要停用它，請將以下行新增到專案的 `local.properties` 或 `gradle.properties` 檔案中：

```text
kotlin.incremental.wasm=false
```

## 完全限定類名中的診斷 {id="diagnostics-in-fully-qualified-class-names"}

在 Kotlin/Wasm 上，編譯器預設不會在產生的二進制檔中儲存類別的完全限定名稱 (FQNs)，以避免增加應用程式的大小。

因此，除非您明確啟用完全限定名稱功能，否則當您在 Kotlin/Wasm 專案中呼叫 `KClass::qualifiedName` 屬性時，編譯器會回報錯誤。

此診斷預設為啟用，且會自動回報錯誤。若要停用診斷並允許在 Kotlin/Wasm 中使用 `qualifiedName`，請透過在 `build.gradle.kts` 檔案中新增以下選項，指示編譯器儲存所有類別的完全限定名稱：

```kotlin
// build.gradle.kts
kotlin {
   wasmJs {
       ...
       compilerOptions {
           freeCompilerArgs.add("-Xwasm-kclass-fqn")
       }
   }
}
```

請記住，啟用此選項會增加應用程式的大小。

### 完全限定名稱 {id="fully-qualified-names"}

在 Kotlin/Wasm 目標上，完全限定名稱 (FQNs) 在執行時無需任何額外配置即可使用。這意味著 `KClass.qualifiedName` 屬性預設為啟用。

使用 FQNs 可改進程式碼從 JVM 到 Wasm 目標的可移植性，並透過顯示完整限定名稱使執行時錯誤更具資訊性。

## 陣列越界存取與 trap {id="array-out-of-bounds-access-and-traps"}

在 Kotlin/Wasm 中，使用超出範圍的索引存取陣列會觸發 WebAssembly trap，而不是一般的 Kotlin 例外。Trap 會立即停止目前的執行堆疊。

在 JavaScript 環境中執行時，這些 trap 會顯示為 `WebAssembly.RuntimeError`，並可以在 JavaScript 端被擷取。

在連結可執行檔時，您可以透過在命令列中使用以下編譯器選項，來避免 Kotlin/Wasm 環境中的此類 trap：

```
-Xwasm-enable-array-range-checks
```

或者將其新增到 Gradle 組建檔案的 `compilerOptions {}` 區塊中：

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xwasm-enable-array-range-checks")
    }
}
```

啟用該編譯器選項後，將拋出 `IndexOutOfBoundsException` 而不是觸發 trap。 

請參閱此 [YouTrack 問題](https://youtrack.jetbrains.com/issue/KT-73452/K-Wasm-turning-on-range-checks-by-default) 以了解更多詳細資訊並分享您的回饋。

## 實驗性註解 {id="experimental-annotations"}

Kotlin/Wasm 為一般的 WebAssembly 互通性提供了數個實驗性註解。

[`@WasmImport`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.wasm/-wasm-import/) 和 [`@WasmExport`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.wasm/-wasm-export/) 分別讓您能夠呼叫在 Kotlin/Wasm 模組之外定義的函式，以及將 Kotlin 函式公開給主機或其他 Wasm 模組。

由於這些機制仍在演進中，所有註解都被標記為實驗性。您必須明確 [選擇加入才能使用它們](opt-in-requirements.md)，且其設計或行為可能會在未來的 Kotlin 版本中發生變化。

## 偵錯期間的重新載入 {id="reloads-during-debugging"}

在 [現代瀏覽器](#browser-versions) 中 [偵錯](wasm-debugging.md) 您的應用程式是開箱即用的。當您執行開發用 Gradle 任務 (`*DevRun`) 時，Kotlin 會自動將原始碼檔案提供給瀏覽器。

然而，預設提供原始碼可能會導致 [在 Kotlin 編譯和打包完成之前，應用程式在瀏覽器中重複重新載入](https://youtrack.jetbrains.com/issue/KT-80582/Multiple-reloads-when-using-webpack-dev-server-after-2.2.20-Beta2#focus=Comments-27-12596427.0-0)。作為規避措施，請調整您的 webpack 配置以忽略 Kotlin 原始碼檔案，並停用對所提供的靜態檔案的監控。在專案根目錄的 `webpack.config.d` 目錄中新增一個包含以下內容的 `.js` 檔案：

```kotlin
config.watchOptions = config.watchOptions || {
    ignored: ["**/*.kt", "**/node_modules"]
}

if (config.devServer) {
    config.devServer.static = config.devServer.static.map(file => {
        if (typeof file === "string") {
            return {
                directory: file,
                watch: false,
            }
        } else {
            return file
        }
    })
}
```
