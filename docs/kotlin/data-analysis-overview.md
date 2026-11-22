[//]: # (title: 用于数据分析的 Kotlin)
<web-summary>了解如何通过 Kotlin DataFrame 和 Kandy 使用 Kotlin 进行数据分析，以检索、转换、分析并可视化数据。</web-summary>

探索和分析数据可能并不是你每天都要做的事情，但作为一名软件开发者，这是一项至关重要的技能。

让我们想一想数据分析发挥关键作用的一些软件开发职责：在调试时分析集合中的实际内容、深入分析内存转储或数据库，或者在处理 REST API 时接收包含大量数据的 JSON 文件，诸如此类。

借助 Kotlin 的探索性数据分析 (EDA) 工具（如 [Kotlin DataFrame](#kotlin-dataframe) 和 [Kandy](#kandy)），你将拥有丰富的功能来提升你的分析技能，并在不同场景下为你提供支持：

* **加载、转换和可视化各种格式的数据：**借助我们的 Kotlin EDA 工具，你可以执行诸如过滤、排序和聚合数据等任务。我们的工具可以在 IDE 中无缝读取来自不同数据源的数据，例如 CSV、JSON、SQL 数据库或 Parquet 文件。请在 [DataFrame 文档](https://kotlin.github.io/dataframe/data-sources.html) 中查看所有支持的格式。

    Kandy 是我们的绘图工具，可让你创建各种图表，以可视化数据集并从中获取洞察。

* **高效分析存储在关系型数据库中的数据：**Kotlin DataFrame 与数据库无缝集成，并提供类似于 SQL 查询的功能。你可以直接从各种数据库中检索、操作和可视化数据。

* **从 Web API 获取并分析实时和动态数据集：**EDA 工具的灵活性允许通过诸如 OpenAPI 等协议与外部 API 集成。此功能有助于你从 Web API 获取数据，然后根据需要清洗和转换数据。

## Kotlin DataFrame {id="kotlin-dataframe"}

[Kotlin DataFrame](https://kotlin.github.io/dataframe/overview.html) 库可让你在 Kotlin 项目中操作结构化数据。从数据创建与清洗，到深入分析和特征工程，该库均能满足你的需求。

借助 Kotlin DataFrame 库，你可以处理不同的文件格式，包括 CSV、JSON、XLS 和 XLSX。该库还能够连接到 SQL 数据库或 API，从而简化数据检索流程。
请在 [DataFrame 文档](https://kotlin.github.io/dataframe/data-sources.html) 中查看所有支持的格式。

![Kotlin DataFrame](data-analysis-dataframe-example.png){width=700}

## Kandy {id="kandy"}

[Kandy](https://kotlin.github.io/kandy/welcome.html) 是一个开源的 Kotlin 库，它提供了一个强大且灵活的 DSL，用于绘制各种类型的图表。该库是一个简单、符合语言习惯、易读且类型安全的数据可视化工具。你还可以轻松地将 Kandy 与 Kotlin DataFrame 结合使用，以完成不同的数据相关任务。

![Kandy](data-analysis-kandy-example.png){width=700}

## 后续步骤 {id="what-s-next"}

* [使用 Kotlin DataFrame 库检索和转换数据](data-analysis-work-with-data-sources.md)
* [使用 Kandy 库可视化数据](data-analysis-visualization.md)
* [详细了解用于数据分析的 Kotlin 和 Java 库](data-analysis-libraries.md)