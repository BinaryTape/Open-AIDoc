[//]: # (title: 偵錯 Kotlin/JS 程式碼)

JavaScript 原始碼對應檔 (source maps) 提供了由束裝工具或縮減器產生的縮減程式碼與開發人員編寫的實際原始碼之間的對應關係。透過這種方式，原始碼對應檔能在程式碼執行期間支援偵錯功能。

Kotlin Multiplatform Gradle 外掛程式會自動為專案組建產生原始碼對應檔，無需任何額外配置即可使用。

## 在瀏覽器中偵錯

大多數現代瀏覽器都提供可檢查頁面內容並偵錯其中執行之程式碼的工具。請參閱瀏覽器的說明文件了解更多詳細資訊。

要在瀏覽器中偵錯 Kotlin/JS：

1. 藉由呼叫可用的 *run* Gradle 任務來執行專案，例如 `jsBrowserDevelopmentRun`。
   [進一步了解執行 Kotlin/JS](running-kotlin-js.md#run-the-browser-target)。
2. 在瀏覽器中導航至該頁面並啟動其開發者工具（例如透過點擊右鍵並選取 **檢查** 操作）。了解如何在熱門瀏覽器中 [尋找開發者工具](https://balsamiq.com/support/faqs/browserconsole/)。
3. 如果您的程式正在將資訊記錄到主控台，請導航至 **主控台** 索引標籤以查看此輸出。根據您的瀏覽器，這些記錄可以參照其來源的 Kotlin 原始碼檔案和行號：

![Chrome DevTools console](devtools-console.png){width="600"}

4. 點擊右側的檔案參照以導航至對應的程式碼行。
   或者，您可以手動切換到 **Sources** 索引標籤，並在檔案樹中找到您需要的檔案。導航至 Kotlin 檔案會向您顯示一般的 Kotlin 程式碼（而非縮減後的 JavaScript）：

![Debugging in Chrome DevTools](devtools-sources.png){width="600"}

現在您可以開始偵錯程式。透過點擊其中一個行號來設定中斷點。
開發者工具甚至支援在陳述式內設定中斷點。與一般的 JavaScript 程式碼一樣，任何設定的中斷點在頁面重新載入後都會保留。這也使得偵錯在首次載入指令碼時執行的 Kotlin `main()` 方法成為可能。

## 在 IDE 中偵錯

具備 Ultimate 訂閱的 [IntelliJ IDEA](https://www.jetbrains.com/idea/) 提供了一套強大的工具，用於在開發期間偵錯程式碼。

要在 IntelliJ IDEA 中偵錯 Kotlin/JS，您需要一個 **JavaScript Debug** 配置。若要新增此類偵錯配置：

1. 前往 **Run | Edit Configurations**。
2. 點擊 **+** 並選取 **JavaScript Debug**。
3. 指定配置 **名稱** 並提供專案執行的 **URL**（預設為 `http://localhost:8080`）。

![JavaScript debug configuration](debug-config.png){width=700}

4. 儲存配置。

若要了解更多，請參閱 [設定 JavaScript 偵錯配置](https://www.jetbrains.com/help/idea/configuring-javascript-debugger.html)。

現在您已準備好偵錯您的專案！

1. 藉由呼叫可用的 *run* Gradle 任務來執行專案，例如 `jsBrowserDevelopmentRun`。
   [進一步了解執行 Kotlin/JS](running-kotlin-js.md#run-the-browser-target)。
2. 透過執行您先前建立的 JavaScript 偵錯配置來啟動偵錯工作階段：

![JavaScript debug configuration](debug-config-run.png){width=700}

3. 您可以在 IntelliJ IDEA 的 **Debug** 視窗中查看程式的主控台輸出。輸出項目會參照其來源的 Kotlin 原始碼檔案和行號：

![JavaScript debug output in the IDE](ide-console-output.png){width=700}

4. 點擊右側的檔案參照以導航至對應的程式碼行。

現在您可以開始使用 IDE 提供的整套工具來偵錯程式：中斷點、單步執行、運算式求值等。進一步了解 [在 IntelliJ IDEA 中偵錯](https://www.jetbrains.com/help/idea/debugging-javascript-in-chrome.html)。

> 由於 IntelliJ IDEA 中目前 JavaScript 偵錯工具的限制，您可能需要重新執行 JavaScript 偵錯，才能讓執行在中斷點處停止。
>
{style="note"}

## 在 Node.js 中偵錯

如果您的專案目標是 Node.js，您可以在此執行環境中對其進行偵錯。

若要偵錯以 Node.js 為目標的 Kotlin/JS 應用程式：

1. 透過執行 `build` Gradle 任務來組建專案。
2. 在專案目錄下的 `build/js/packages/your-module/kotlin/` 目錄中找到 Node.js 的結果 `.js` 檔案。
3. 按照 [Node.js 偵錯指南](https://nodejs.org/en/docs/guides/debugging-getting-started/#jetbrains-webstorm-2017-1-and-other-jetbrains-ides) 中的說明在 Node.js 中進行偵錯。

## 下一步？

既然您已了解如何啟動 Kotlin/JS 專案的偵錯工作階段，請學習如何高效地使用偵錯工具：

* 了解如何 [在 Google Chrome 中偵錯 JavaScript](https://developer.chrome.com/docs/devtools/javascript/)
* 熟悉 [IntelliJ IDEA JavaScript 偵錯工具](https://www.jetbrains.com/help/idea/debugging-javascript-in-chrome.html)
* 了解如何 [在 Node.js 中偵錯](https://nodejs.org/en/docs/guides/debugging-getting-started/)。

## 如果您遇到任何問題

如果您在偵錯 Kotlin/JS 時遇到任何問題，請將其回報至我們的問題追蹤器 [YouTrack](https://kotl.in/issue)