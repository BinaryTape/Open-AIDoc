[//]: # (title: Kotlin 資料分析)
[//]: # (description: 了解如何結合 Kotlin DataFrame 與 Kandy 使用 Kotlin 進行資料分析，以檢索、轉換、分析與視覺化資料。)

探索與分析資料可能不是您每天都會做的事，但這是身為軟體開發人員所必須具備的一項關鍵技能。

讓我們思考一下資料分析在軟體開發職責中扮演關鍵角色的情況：例如在偵錯時分析集合內部的實際內容、挖掘記憶體傾印或資料庫，或是在處理 REST API 時收到包含大量資料的 JSON 檔案等等。

藉由 Kotlin 的探索性資料分析 (EDA) 工具，例如 [Kotlin DataFrame](#kotlin-dataframe) 以及 [Kandy](#kandy)，您擁有一套豐富的功能來增強分析技能，並在不同情境下提供支援：

* **載入、轉換與視覺化各種格式的資料：** 透過我們的 Kotlin EDA 工具，您可以執行篩選、排序與聚合資料等任務。我們的工具可以從各種資料來源（包括 CSV、JSON、SQL 資料庫或 Parquet 檔案）直接在 IDE 中無縫讀取資料。
請參閱 [DataFrame 文件](https://kotlin.github.io/dataframe/data-sources.html) 以了解所有支援的格式。

    Kandy 是我們的繪圖工具，可讓您建立各式各樣的圖表，以視覺化方式從資料集中獲取洞察。

* **高效分析儲存在關聯式資料庫中的資料：** Kotlin DataFrame 與資料庫無縫整合，並提供類似 SQL 查詢的功能。您可以直接從各種資料庫中檢索、操作與視覺化資料。

* **從 Web API 獲取並分析即時與動態資料集：** EDA 工具的靈活性允許透過 OpenAPI 等協定與外部 API 整合。此功能可協助您從 Web API 獲取資料，接著根據需求清理與轉換資料。

## Kotlin DataFrame

[Kotlin DataFrame](https://kotlin.github.io/dataframe/overview.html) 程式庫可讓您在 Kotlin 專案中操作結構化資料。從資料建立與清理，到深入分析與特徵工程，此程式庫都能滿足您的需求。

藉由 Kotlin DataFrame 程式庫，您可以處理不同的檔案格式，包括 CSV、JSON、XLS 與 XLSX。此程式庫還能與 SQL 資料庫或 API 連接，促進資料檢索過程。
請參閱 [DataFrame 文件](https://kotlin.github.io/dataframe/data-sources.html) 以了解所有支援的格式。

![Kotlin DataFrame](data-analysis-dataframe-example.png){width=700}

## Kandy

[Kandy](https://kotlin.github.io/kandy/welcome.html) 是一個開源 Kotlin 程式庫，提供強大且靈活的 DSL，用於繪製各種類型的圖表。此程式庫是一個簡單、慣用、易讀且型別安全的工具，用於視覺化資料。您還可以輕鬆地將 Kandy 與 Kotlin DataFrame 結合使用，以完成不同的資料相關任務。

![Kandy](data-analysis-kandy-example.png){width=700}

## 下一步

* [使用 Kotlin DataFrame 程式庫檢索與轉換資料](data-analysis-work-with-data-sources.md)
* [使用 Kandy 程式庫視覺化資料](data-analysis-visualization.md)
* [進一步了解用於資料分析的 Kotlin 與 Java 程式庫](data-analysis-libraries.md)