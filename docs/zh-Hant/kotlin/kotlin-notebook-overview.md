[//]: # (title: Kotlin Notebook)
[//]: # (description: 在 IntelliJ IDEA 中建立與編輯互動式 Kotlin notebook，以執行程式碼、視覺化資料、原型設計想法並分享結果。)

> 從 IntelliJ IDEA 2026.2 開始，Kotlin Notebook 將不再隨 IDE 隨附，JetBrains 也將不再正式提供支援。
> 原始碼將繼續保留在 [GitHub](https://github.com/Kotlin/kotlin-notebook) 上。
>
> 若要進一步了解，請參閱 [部落格文章](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)。
>
{style="note"}

Kotlin Notebook 提供了一個互動式環境來建立和編輯 notebook，充分發揮 Kotlin 的所有潛能。

Notebook 是一種互動式文件，您可以在其中將可執行的 Kotlin 程式碼與文字、結果和視覺化內容結合在一起。
您可以將其視為 Kotlin REPL 的延伸，具備將程式碼整理成程式碼資料格、使用 Markdown 編寫文件，並在產生程式碼的旁邊立即顯示輸出（從文字到圖表）的能力。

準備好享受無縫的編碼體驗，您可以在 IntelliJ IDEA 生態系統中開發和實驗 Kotlin 程式碼、接收即時輸出，並整合程式碼、視覺效果和文字。

![Kotlin Notebook](data-analysis-notebook.gif){width=700}

Kotlin Notebook 外掛程式配備了[各種功能](https://www.jetbrains.com/help/idea/kotlin-notebook.html)來提升您的開發流程，例如： 

* 在程式碼資料格中存取 API
* 點擊幾下即可匯入和匯出檔案
* 使用 REPL 指令快速探索專案
* 獲得豐富的輸出格式
* 使用註解或類似 Gradle 的語法直觀地管理相依性
* 僅需一行程式碼即可匯入各種程式庫，甚至為您的專案新增程式庫
* 透過錯誤訊息和追蹤獲得偵錯洞察

Kotlin Notebook 基於我們的 [Kotlin Kernel for Jupyter Notebooks](https://github.com/Kotlin/kotlin-jupyter?tab=readme-ov-file#kotlin-kernel-for-ipythonjupyter)，使其易於與其他 Kotlin notebook 解決方案整合。
在沒有相容性問題的情況下，您可以毫不費力地在 Kotlin Notebook、[Datalore](https://datalore.jetbrains.com/) 和 [Kotlin-Jupyter Notebook](https://github.com/Kotlin/kotlin-jupyter) 之間分享您的工作。

憑藉這些功能，您可以執行各種任務，從簡單的程式碼實驗到全面的數據專案。

## 資料分析與視覺化

無論您是進行初步資料探索還是完成端到端資料分析專案，Kotlin Notebook 都有適合您的工具。

在 Kotlin Notebook 中，您可以直觀地整合[程式庫](data-analysis-libraries.md)，讓您擷取、轉換、繪製和建模資料，同時獲得操作的即時輸出。

對於分析相關任務，[Kotlin DataFrame](https://kotlin.github.io/dataframe/overview.html) 程式庫提供了強大的解決方案。此程式庫有助於載入、建立、篩選和清理結構化資料。

Kotlin DataFrame 還支援與 SQL 資料庫的無縫連接，並能直接在 IDE 中讀取來自不同資料來源的資料，包括 CSV、JSON 和 TXT。 
請參閱 [DataFrame 文件](https://kotlin.github.io/dataframe/data-sources.html)以了解所有支援的格式。

[Kandy](https://kotlin.github.io/kandy/welcome.html) 是一個開源 Kotlin 程式庫，可讓您建立各種類型的圖表。
Kandy 的慣用法、易讀且型別安全的特性讓您可以有效地視覺化資料並獲得寶貴的洞察。

![data-analytics-and-visualization](data-analysis-kandy-example.png){width=700}

## 原型設計

Kotlin Notebook 提供了一個互動式環境，可以用小區塊執行程式碼並即時查看結果。 
這種動手操作的方法能夠在原型設計階段進行快速的實驗和迭代。

在 Kotlin Notebook 的幫助下，您可以在構思階段早期測試解決方案的概念。此外，Kotlin Notebook 支援協作和可重現的工作，能夠產生和評估新想法。

![kotlin-notebook-prototyping](kotlin-notebook-prototyping.png){width=700}

## 後端開發

Kotlin Notebook 提供了在程式碼資料格中呼叫 API 以及使用 OpenAPI 等協定的能力。它與外部服務和 API 互動的能力，使其在某些後端開發情境中非常有用，例如直接在您的 notebook 環境中擷取資訊和讀取 JSON 檔案。

![kotlin-notebook-backend-development](kotlin-notebook-backend-development.png){width=700}

## 程式碼文件

在 Kotlin Notebook 中，您可以在程式碼資料格中包含內嵌註解和文字註解，以提供與程式碼片段相關的額外上下文、說明和指示。

您也可以在 Markdown 程式碼資料格中編寫文字，這些資料格支援豐富的格式選項，如標題、清單、連結、圖片等。 
要渲染 Markdown 程式碼資料格並查看格式化後的文字，只需像執行程式碼資料格一樣執行它即可。

![kotlin-notebook-documenting](kotlin-notebook-documentation.png){width=700}

## 分享程式碼與輸出

鑑於 Kotlin Notebook 遵循通用的 Jupyter 格式，您可以在不同的 notebook 之間分享程式碼和輸出。
您可以使用任何 Jupyter 用戶端（如 [Jupyter Notebook](https://jupyter.org/) 或 [Jupyter Lab](https://jupyterlab.readthedocs.io/en/latest/)）開啟、編輯和執行您的 Kotlin Notebook。 

您還可以透過與任何 notebook Web 檢視器分享 `.ipynb` notebook 檔案來發佈您的工作。其中一個選擇是 [GitHub](https://github.com/)，它原生支援渲染此格式。另一個選擇是 [JetBrains 的 Datalore](https://datalore.jetbrains.com/) 平台，它具有排程執行 notebook 等進階功能，便於分享、執行和編輯 notebook。 

![kotlin-notebook-sharing-datalore](kotlin-notebook-sharing-datalore.png){width=700}

或者，您可以快速將目前的 notebook 分享為 [GitHub 程式片段 (gist)](https://gist.github.com/)。 
點擊工具列上的 **Create Gist** 按鈕。 

![notebook-github-gist](notebook-github-gist.png){width=400}

IntelliJ IDEA 會將您的 notebook 匯出到您的 GitHub 帳戶中的 Gist，並提供一個 URL 用於分享、檢視和下載 notebook。 

Gist 以 JSON 格式保留 notebook 中的所有程式碼、輸出和 Markdown，GitHub 可以對其進行預覽渲染。 

## 下一步

* [瞭解 Kotlin Notebook 的用法與主要功能。](https://www.jetbrains.com/help/idea/kotlin-notebook.html)
* [嘗試使用 Kotlin Notebook。](get-started-with-kotlin-notebooks.md)
* [深入了解用於資料分析的 Kotlin。](data-analysis-overview.md)