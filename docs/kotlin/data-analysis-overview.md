[//]: # (title: 用于数据分析的 Kotlin)
[//]: # (description: 了解如何将 Kotlin 与 Kotlin DataFrame 和 Kandy 结合使用，以进行数据检索、转换、分析和可视化。)

探索和分析数据可能不是你每天都会做的工作，但作为一名软件开发工程师，这是一项必须掌握的关键技能。 

让我们想一想数据分析起关键作用的软件开发职责：例如，在调试时分析集合的实际内容、挖掘内存转储或数据库，或者在处理 REST API 时接收包含大量数据的数据，等等。

借助 Kotlin 的探索性数据分析 (EDA) 工具，例如 [Kotlin DataFrame](#kotlin-dataframe) 和 [Kandy](#kandy)，你可以使用一套丰富的功能来提升分析技能，并在不同的场景中为你提供支持：

* **加载、转换各种格式的数据并使其可视化：** 使用我们的 Kotlin EDA 工具，你可以执行过滤、排序和聚合数据等任务。我们的工具可以在 IDE 中直接无缝读取各种数据源的数据，包括 CSV、JSON、SQL 数据库或 Parquet 文件。请参阅 [DataFrame 文档](https://kotlin.github.io/dataframe/data-sources.html)中所有支持的格式。

    Kandy 是我们的绘图工具，它允许你创建各种图表，以便从数据集中获取洞察并使其可视化。

* **高效分析存储在关系型数据库中的数据：** Kotlin DataFrame 与数据库无缝集成，并提供类似于 SQL 查询的功能。你可以直接从各种数据库中检索、操作数据并使其可视化。

* **从 Web API 获取并分析实时和动态数据集：** EDA 工具的灵活性允许通过 OpenAPI 等协议与外部 API 集成。此功能可帮助你从 Web API 获取数据，然后根据需要对数据进行清理和转换。

## Kotlin DataFrame

[Kotlin DataFrame](https://kotlin.github.io/dataframe/overview.html) 库允许你在 Kotlin 项目中操作结构化数据。从数据创建和清理到深度分析和特征工程，该库都能满足你的需求。

借助 Kotlin DataFrame 库，你可以处理不同的文件格式，包括 CSV、JSON、XLS 和 XLSX。该库还通过连接 SQL 数据库或 API 的能力简化了数据检索过程。请参阅 [DataFrame 文档](https://kotlin.github.io/dataframe/data-sources.html)中所有支持的格式。

![Kotlin DataFrame](data-analysis-dataframe-example.png){width=700}

## Kandy

[Kandy](https://kotlin.github.io/kandy/welcome.html) 是一个开源 Kotlin 库，它提供了一个强大且灵活的 DSL，用于绘制各种类型的图表。该库是一个简单、惯用、可读且类型安全的工具，用于使数据可视化。你还可以轻松地结合使用 Kandy 和 Kotlin DataFrame 库来完成不同的数据相关任务。

![Kandy](data-analysis-kandy-example.png){width=700}

## 下一步

* [使用 Kotlin DataFrame 库检索和转换数据](data-analysis-work-with-data-sources.md)
* [使用 Kandy 库使数据可视化](data-analysis-visualization.md)
* [详细了解用于数据分析的 Kotlin 和 Java 库](data-analysis-libraries.md)