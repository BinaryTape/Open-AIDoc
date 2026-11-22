[//]: # (title: Kotlin Notebook)
<web-summary>在 IntelliJ IDEA 中建立並編輯互動式 Kotlin 筆記本，以執行程式碼、視覺化呈現資料、進行構想原型設計並分享成果。</web-summary>

> 自 IntelliJ IDEA 2026.2 起，Kotlin Notebook 將不再隨附於 IDE 中，JetBrains 也將不再提供官方支援。
> 原始碼仍可在 [GitHub](https://github.com/Kotlin/kotlin-notebook) 上取得。
>
> 詳情請參閱[部落格文章](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)。
>
{style="note"}

Kotlin Notebook 提供了一個互動式環境來建立與編輯筆記本，充分發揮 Kotlin 的強大功能。

筆記本是一種互動式文件，你可以在其中將可執行的 Kotlin 程式碼與文字、執行結果以及視覺化圖表結合在一起。
可以將它視為一個延伸擴充的 Kotlin REPL，讓你能夠將程式碼組織到儲存格中，使用 Markdown 撰寫說明文件，並在產生結果的程式碼旁立即顯示輸出（從純文字到圖表）。

準備好享受流暢的編碼體驗，在 IntelliJ IDEA 生態系統中開發並實驗 Kotlin 程式碼、獲得即時輸出，並整合程式碼、視覺效果與文字。

![Kotlin Notebook](data-analysis-notebook.gif){width=700}

Kotlin Notebook 外掛程式隨附[多種功能](https://www.jetbrains.com/help/idea/kotlin-notebook.html)，可大幅提升你的開發流程效率，例如：

* 在儲存格內存取 API
* 點擊幾下即可匯入與匯出檔案
* 使用 REPL 指令進行快速專案探索
* 獲得豐富多樣的輸出格式
* 透過註解或類似 Gradle 的語法直觀地管理相依性
* 僅需一行程式碼即可匯入各種程式庫，甚至為專案新增程式庫
* 透過錯誤訊息與追蹤回溯獲得用於偵錯的洞察

Kotlin Notebook 基於我們的 [Jupyter Notebook Kotlin Kernel](https://github.com/Kotlin/kotlin-jupyter?tab=readme-ov-file#kotlin-kernel-for-ipythonjupyter) 建置，因此能輕鬆與其他 Kotlin 筆記本解決方案整合。
在沒有相容性問題的情況下，你可以毫不費力地在 Kotlin Notebook、[Datalore](https://datalore.jetbrains.com/) 以及 [Kotlin-Jupyter Notebook](https://github.com/Kotlin/kotlin-jupyter) 之間分享你的工作成果。

憑藉這些功能，你可以著手進行廣泛的任務，從簡單的程式碼實驗到全面的資料專案皆可涵蓋。

## 資料分析與視覺化 {id="data-analytics-and-visualization"}

無論你是在進行初步的資料探索，還是完成一個端到端的資料分析專案，Kotlin Notebook 都能為你提供合適的工具。

在 Kotlin Notebook 中，你可以直觀地整合各類[程式庫](data-analysis-libraries.md)，在取得操作即時輸出的同時，擷取、轉換、繪製並建立資料模型。

針對分析相關的任務，[Kotlin DataFrame](https://kotlin.github.io/dataframe/overview.html) 程式庫提供了強大的解決方案。此程式庫有助於載入、建立、篩選與清理結構化資料。

Kotlin DataFrame 還支援與 SQL 資料庫無縫連線，並直接在 IDE 中讀取來自不同資料來源的資料，包括 CSV、JSON 和 TXT。
如需查看所有支援的格式，請參閱 [DataFrame 文件](https://kotlin.github.io/dataframe/data-sources.html)。

[Kandy](https://kotlin.github.io/kandy/welcome.html) 是一個開源的 Kotlin 程式庫，可讓你建立各種類型的圖表。
Kandy 具備慣用語法、易讀性以及型別安全的特性，讓你能夠有效地將資料視覺化並獲得寶貴的洞察。

![data-analytics-and-visualization](data-analysis-kandy-example.png){width=700}

## 原型設計 {id="prototyping"}

Kotlin Notebook 提供了一個互動式環境，可將程式碼分成小塊區塊執行並即時檢視結果。
這種實作方式使得在原型設計階段能夠進行快速的實驗與迭代。

藉由 Kotlin Notebook 的協助，你可以在構想發想階段儘早測試解決方案的概念。此外，Kotlin Notebook 支援協作與可重現的工作流程，有助於激發並評估新的構想。

![kotlin-notebook-prototyping](kotlin-notebook-prototyping.png){width=700}

## 後端開發 {id="backend-development"}

Kotlin Notebook 提供在儲存格內呼叫 API 以及使用 OpenAPI 等協定的能力。它與外部服務及 API 互動的功能，使其在某些後端開發情境中非常實用，例如直接在筆記本環境中擷取資訊與讀取 JSON 檔案。

![kotlin-notebook-backend-development](kotlin-notebook-backend-development.png){width=700}

## 程式碼文件化 {id="code-documentation"}

在 Kotlin Notebook 中，你可以在程式碼儲存格內加入內嵌註解與文字註解，為相關的程式碼片段提供額外的上下文、說明與操作指示。

你也可以在 Markdown 儲存格中撰寫文字，這些儲存格支援豐富的格式設定選項，例如標題、清單、連結、圖片等。
若要轉譯 Markdown 儲存格並檢視格式化後的文字，只需像執行程式碼儲存格一樣執行它即可。

![kotlin-notebook-documenting](kotlin-notebook-documentation.png){width=700}

## 分享程式碼與輸出結果 {id="sharing-code-and-outputs"}

由於 Kotlin Notebook 遵循通用的 Jupyter 格式，因此可以在不同的筆記本之間分享程式碼與輸出成果。
你可以使用任何 Jupyter 用戶端（例如 [Jupyter Notebook](https://jupyter.org/) 或 [Jupyter Lab](https://jupyterlab.readthedocs.io/en/latest/)）開啟、編輯與執行你的 Kotlin Notebook。

你也可以透過與任何筆記本 Web 檢視器分享 `.ipynb` 筆記本檔案來發佈你的作品。其中一個選擇是 [GitHub](https://github.com/)，它原生支援轉譯此格式。另一個選擇是 [JetBrains 的 Datalore](https://datalore.jetbrains.com/) 平台，該平台具備筆記本排程執行等進階功能，便於分享、執行與編輯筆記本。

![kotlin-notebook-sharing-datalore](kotlin-notebook-sharing-datalore.png){width=700}

此外，你還可以快速將目前的筆記本以 [GitHub Gist](https://gist.github.com/) 的形式分享。
點擊工具列上的 **Create Gist** 按鈕。

![notebook-github-gist](notebook-github-gist.png){width=400}

IntelliJ IDEA 會將你的筆記本匯出至你的 GitHub 帳戶下的 Gist，並提供一個可用於分享、檢視與下載該筆記本的 URL。

Gist 會以 JSON 格式保留筆記本中的所有程式碼、輸出與 Markdown，GitHub 可對其進行轉譯以供預覽。

## 後續步驟 {id="what-s-next"}

* [了解 Kotlin Notebook 的用法與主要功能。](https://www.jetbrains.com/help/idea/kotlin-notebook.html)
* [立即試用 Kotlin Notebook。](get-started-with-kotlin-notebooks.md)
* [深入探索 Kotlin 資料分析。](data-analysis-overview.md)