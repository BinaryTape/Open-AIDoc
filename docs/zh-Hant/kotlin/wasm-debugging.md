[//]: # (title: 偵錯 Kotlin/Wasm 程式碼)

<primary-label ref="beta"/> 

本教學示範如何使用 IntelliJ IDEA 和瀏覽器來偵錯使用 Kotlin/Wasm 建置的 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) 應用程式。

## 開始之前 {id="before-you-start"}

1. [設定 Kotlin Multiplatform 開發環境](https://kotlinlang.org/docs/multiplatform/quickstart.html#set-up-the-environment)。
2. 按照指示[建立目標為 Kotlin/Wasm 的 Kotlin Multiplatform 專案](wasm-get-started.md#create-a-project)。

> 若要在 IntelliJ IDEA 中偵錯 Kotlin/Wasm 程式碼，您必須安裝 JavaScript Debugger 外掛程式。[查看更多關於此外掛程式的資訊以及安裝方式。](https://www.jetbrains.com/help/idea/debugging-javascript-in-chrome.html#ws_js_debugging_chrome_before_you_start)
>
{style="note"}

## 在 IntelliJ IDEA 中偵錯 {id="debug-in-intellij-idea"}

您建立的 Kotlin Multiplatform 專案包含一個由 Kotlin/Wasm 驅動的 Compose Multiplatform 應用程式。您可以在 IntelliJ IDEA 中開箱即用地偵錯此應用程式，無需額外配置。

1. 在 IntelliJ IDEA 中，開啟要偵錯的 Kotlin 檔案。在本教學中，我們將使用 Kotlin Multiplatform 專案中以下目錄的 `Greeting.kt` 檔案：

   `WasmDemo/composeApp/src/wasmJsMain/kotlin/wasm.project.demo.wasmdemo`

2. 點擊行號以在要檢查的程式碼上設定中斷點。

   ![設定中斷點](wasm-breakpoints-intellij.png){width=650}

3. 在运行配置清單中，選取 **composeApp[wasmJs]**。
4. 點擊畫面頂端的偵錯圖示，在偵錯模式下執行程式碼。

   ![在偵錯模式下執行](wasm-debug-run-configurations.png){width=600}

   應用程式啟動後，會在新的瀏覽器視窗中開啟。

   ![在瀏覽器中開啟 Compose 應用程式](wasm-composeapp-browser.png){width=600}

   同時，IntelliJ IDEA 中會自動開啟 **Debug** 面板。

   ![Compose 應用程式偵錯工具](wasm-debug-pane.png){width=600}

### 檢查您的應用程式 {id="inspect-your-application"}

> 如果您正在[在瀏覽器中偵錯](#debug-in-your-browser)，也可以按照相同的步驟來檢查您的應用程式。
>
{style="note"}

1. 在應用程式的瀏覽器視窗中，點擊 **Click me!** 按鈕與應用程式互動。此操作會觸發程式碼執行，且當執行到達中斷點時，偵錯工具會暫停。

2. 在偵錯窗格中，使用偵錯控制按鈕來檢查變數以及中斷點處的程式碼執行：
    * ![單步越過](wasm-debug-step-over.png){width=30}{type="joined"} 單步越過：執行當前行並暫停在下一行。
    * ![單步進入](wasm-debug-step-into.png){width=30}{type="joined"} 單步進入：深入調查函式內部。
    * ![步出](wasm-debug-step-out.png){width=30}{type="joined"} 步出：執行程式碼直到退出當前函式。

3. 查看 **Threads & Variables** 窗格。它可以幫助您追蹤函式呼叫的順序並精確定位任何錯誤的位置。

   ![查看 Threads & Variables](wasm-debug-panes-intellij.png){width=700}

4. 修改您的程式碼並重新執行應用程式，以驗證其運作方式。
5. 完成偵錯後，點擊帶有中斷點的行號以移除中斷點。

## 在瀏覽器中偵錯 {id="debug-in-your-browser"}

您也可以在瀏覽器中偵錯此 Compose Multiplatform 應用程式，無需額外配置。

當您執行開發 Gradle 任務（`*DevRun`）時，Kotlin 會自動將原始碼檔案提供給瀏覽器，讓您可以設定中斷點、檢查變數並單步執行 Kotlin 程式碼。

在瀏覽器中提供 Kotlin/Wasm 專案原始碼的配置現在已包含在 Kotlin Gradle 外掛程式中。如果您之前將此配置新增至 `build.gradle.kts` 檔案中，應將其移除以避免衝突。

> 本教學使用 Chrome 瀏覽器，但您應該也可以在其他瀏覽器中執行這些步驟。如需詳細資訊，請參閱[瀏覽器版本](wasm-configuration.md#browser-versions)。
>
{style="tip"}

1. 按照指示[執行 Compose Multiplatform 應用程式](wasm-get-started.md#run-the-application)。

2. 在應用程式的瀏覽器視窗中按一下右鍵，並選取 **檢查** (Inspect) 操作以開啟開發者工具。或者，您也可以使用 **F12** 快速鍵，或選取 **檢視** | **開發人員** | **開發人員工具** (View | Developer | Developer Tools)。

3. 切換至 **Sources** 標籤頁並選取要偵錯的 Kotlin 檔案。在本教學中，我們將使用 `Greeting.kt` 檔案。

4. 點擊行號以在要檢查的程式碼上設定中斷點。只有數字顏色較深的行才能設定中斷點——在此範例中為 4、7、8 和 9。

   ![設定中斷點](wasm-breakpoints-browser.png){width=700}

5. 檢查您的應用程式，方式與[在 IntelliJ IDEA 中偵錯](#inspect-your-application)類似。

    在瀏覽器中偵錯時，用於追蹤函式呼叫順序並精確定位錯誤的窗格為 **Scope** 和 **Call Stack**。

   ![查看呼叫堆疊](wasm-debug-scope.png){width=450}

### 使用自訂格式化程序 {id="use-custom-formatters"}

在瀏覽器中偵錯 Kotlin/Wasm 程式碼時，自訂格式化程序有助於以更友善且易於理解的方式顯示和定位變數值。

自訂格式化程序在 Kotlin/Wasm 開發組建中已預設啟用，但您仍需確保瀏覽器的開發者工具中已啟用自訂格式化程序：

* 在 Chrome DevTools 中，於 **Settings | Preferences | Console** 找到 **Custom formatters** 核取方塊：

  ![在 Chrome 中啟用自訂格式化程序](wasm-custom-formatters-chrome.png){width=400}

* 在 Firefox DevTools 中，於 **Settings | Advanced settings** 找到 **Enable custom formatters** 核取方塊：

  ![在 Firefox 中啟用自訂格式化程序](wasm-custom-formatters-firefox.png){width=400}

此功能使用 [custom formatters API](https://firefox-source-docs.mozilla.org/devtools-user/custom_formatters/index.html)，並受 Firefox 和基於 Chromium 的瀏覽器支援。

鑑於自訂格式化程序預設僅適用於 Kotlin/Wasm 開發組建，如果您想在正式組建中使用它們，則需要調整 Gradle 配置。請將以下編譯器選項新增至 `wasmJs {}` 區塊：

```kotlin
// build.gradle.kts
kotlin {
    wasmJs {
        // ...

        compilerOptions {
            freeCompilerArgs.add("-Xwasm-debugger-custom-formatters")
        }
    }
}
```

## 提供回饋 {id="leave-feedback"}

我們非常歡迎您針對偵錯體驗提供任何回饋！

* ![Slack](slack.svg){width=25}{type="joined"} Slack：[取得 Slack 邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)，並在我們的 [#webassembly](https://kotlinlang.slack.com/archives/CDFP59223) 頻道中直接向開發人員提供回饋。
* 在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-56492) 中提供您的回饋。

## 下一步？ {id="what-s-next"}

* 在這部 [YouTube 影片](https://www.youtube.com/watch?v=t3FUWfJWrjU&t=2703s)中觀看 Kotlin/Wasm 偵錯的實際操作示範。
* 嘗試更多 Kotlin/Wasm 範例：
  * [KotlinConf 應用程式](https://github.com/JetBrains/kotlinconf-app)
  * [Compose 圖片檢視器](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/imageviewer)
  * [Node.js 範例](https://github.com/Kotlin/kotlin-wasm-nodejs-template)
  * [WASI 範例](https://github.com/Kotlin/kotlin-wasm-wasi-template)
  * [Compose 範例](https://github.com/Kotlin/kotlin-wasm-compose-template)