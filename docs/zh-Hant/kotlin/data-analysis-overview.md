[//]: # (title: 用於資料分析的 Kotlin)
<web-summary>了解如何使用 Kotlin 搭配 Kotlin DataFrame 和 Kandy 進行資料分析，以檢索、轉換、分析和視覺化資料。</web-summary>

探索與分析資料或許不是你每天都會做的事，但這卻是身為軟體開發人員所必備的關鍵技能。

讓我們想想法資料分析至關重要的軟體開發工作情境：例如在偵錯時分析集合內部實際的內容、深入研究記憶體傾印或資料庫，或者在處理 REST API 時接收包含大量資料的 JSON 檔案等。

透過 Kotlin 的探索性資料分析 (EDA) 工具，例如 [Kotlin DataFrame](#kotlin-dataframe) 和 [Kandy](#kandy)，你將擁有豐富的功能來提升分析技能，並在各種情境中為你提供支援：

* **載入、轉換與視覺化各種格式的資料：** 藉助我們的 Kotlin EDA 工具，你可以執行篩選、排序和彙總資料等任務。我們的工具能順暢地直接在 IDE 中讀取來自不同資料來源的資料，例如 CSV、JSON、SQL 資料庫或 Parquet 檔案。
請在 [DataFrame 文件](https://kotlin.github.io/dataframe/data-sources.html) 中查看所有支援的格式。

    我們的繪圖工具 Kandy 可讓你建立多種圖表，以視覺化資料集並從中獲取洞察。

* **高效分析儲存在關聯式資料庫中的資料：** Kotlin DataFrame 能與資料庫緊密整合，並提供類似 SQL 查詢的功能。你可以直接從各種資料庫檢索、操作和視覺化資料。

* **從 Web API 擷取並分析即時與動態資料集：** EDA 工具的靈活性允許透過 OpenAPI 等協定與外部 API 整合。此功能可協助你從 Web API 擷取資料，接著根據自身需求清理與轉換資料。

## Kotlin DataFrame {id="kotlin-dataframe"}

[Kotlin DataFrame](https://kotlin.github.io/dataframe/overview.html) 程式庫讓你在 Kotlin 專案中操作結構化資料。從資料建立和清理，到深度分析與特徵工程，這個程式庫都能滿足你的需求。

使用 Kotlin DataFrame 程式庫，你可以處理包含 CSV、JSON、XLS 和 XLSX 在內的不同檔案格式。該程式庫還具備連線到 SQL 資料庫或 API 的能力，使資料檢索過程更加輕鬆。
請在 [DataFrame 文件](https://kotlin.github.io/dataframe/data-sources.html) 中查看所有支援的格式。

![Kotlin DataFrame](data-analysis-dataframe-example.png){width=700}

## Kandy {id="kandy"}

[Kandy](https://kotlin.github.io/kandy/welcome.html) 是一個開源的 Kotlin 程式庫，提供了強大且靈活的 DSL，用於繪製各種類型的圖表。這個程式庫是一個簡潔、符合慣用法、具可讀性且型別安全的資料視覺化工具。你還可以輕鬆將 Kandy 與 Kotlin DataFrame 結合使用，以完成各種與資料相關的任務。

![Kandy](data-analysis-kandy-example.png){width=700}

## 後續步驟 {id="what-s-next"}

* [使用 Kotlin DataFrame 程式庫檢索與轉換資料](data-analysis-work-with-data-sources.md)
* [使用 Kandy 程式庫視覺化資料](data-analysis-visualization.md)
* [進一步了解用於資料分析的 Kotlin 與 Java 程式庫](data-analysis-libraries.md)