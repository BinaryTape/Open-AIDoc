[//]: # (title: 用于数据分析的 Kotlin)

探索和分析数据可能不是你每天都会做的工作，但作为一名软件开发工程师，这是一项必须掌握的关键技能。

让我们想一想数据分析起关键作用的软件开发职责：例如，在调试时分析集合的实际内容、挖掘内存转储或数据库，或者在处理 REST API 时接收包含大量数据的 JSON 文件。

借助 Kotlin 的探索性数据分析 (EDA) 工具，例如 [Kotlin Notebook](#notebooks)、[Kotlin DataFrame](#kotlin-dataframe) 和 [Kandy](#kandy)，你可以使用一套丰富的功能来提升分析技能，并在不同的场景中为你提供支持：

* **加载、转换各种格式的数据并使其可视化：** 使用我们的 Kotlin EDA 工具，你可以执行过滤、排序和聚合数据等任务。我们的工具可以在 IDE 中直接无缝读取各种文件格式的数据，包括 CSV、JSON 和 TXT。

    Kandy 是我们的绘图工具，它允许你创建各种图表，以便从数据集中获取洞察并使其可视化。

* **高效分析存储在关系型数据库中的数据：** Kotlin DataFrame 与数据库无缝集成，并提供类似于 SQL 查询的功能。你可以直接从各种数据库中检索、操作数据并使其可视化。

* **从 web API 获取并分析实时和动态数据集：** EDA 工具的灵活性允许通过 OpenAPI 等协议与外部 API 集成。此功能可帮助你从 web API 获取数据，然后根据需要对数据进行清理和转换。

想要尝试我们的 Kotlin 数据分析工具吗？

<a href="get-started-with-kotlin-notebooks.md"><img src="kotlin-notebooks-button.svg" width="600" alt="Get started with Kotlin Notebook" style="block"/></a>

我们的 Kotlin 数据分析工具让你能够从始至终顺畅地处理数据。在我们的 Kotlin Notebook 中，通过简单的拖放功能即可毫不费力地检索数据。只需几行代码即可对其进行清理、转换和可视化。此外，只需点击几下即可导出输出的图表。

![Kotlin Notebook](data-analysis-notebook.gif){width=700}

## 笔记本 (Notebook)

**笔记本 (notebook)** 是一种交互式文档，你可以在其中将可执行的 Kotlin 代码与文本、可视化效果和结果混合在一起。可以将其视为 Kotlin REPL 的扩展，它能够将代码组织成**代码单元**，使用 Markdown 编写文档，并立即在生成代码的旁边显示输出（从文本到图表）。

Kotlin 提供了不同的笔记本解决方案，例如 [Kotlin Notebook](#kotlin-notebook)、[Datalore](#kotlin-notebooks-in-datalore) 和 [带有 Kotlin 内核的 Jupyter Notebook](#jupyter-notebook-with-kotlin-kernel)，为数据检索、转换、探索、建模等提供了便捷的功能。这些 Kotlin 笔记本解决方案均基于我们的 [Kotlin 内核 (Kotlin Kernel)](https://github.com/Kotlin/kotlin-jupyter)。

你可以在 Kotlin Notebook、Datalore 和带有 Kotlin 内核的 Jupyter Notebook 之间无缝共享代码。在其中一个 Kotlin 笔记本中创建项目，即可在另一个笔记本中继续工作，无需担心兼容性问题。

受益于我们功能强大的 Kotlin 笔记本及其使用 Kotlin 编码的优势。Kotlin 与这些笔记本集成，可帮助你管理数据并与同事分享发现，同时建立你的机器学习和数据科学技能。

了解我们不同 Kotlin 笔记本解决方案的功能，并选择最符合你项目要求的方案。

![Kotlin Notebook](kotlin-notebook.png){width=700}

### Kotlin Notebook

[Kotlin Notebook](kotlin-notebook-overview.md) 是 IntelliJ IDEA 的一款插件，允许你使用 Kotlin 创建笔记本。它通过所有通用的 IDE 功能提供我们的 IDE 体验，提供实时代码洞察和项目集成。

### Datalore 中的 Kotlin 笔记本

借助 [Datalore](https://datalore.jetbrains.com/)，你可以开箱即用地在浏览器中使用 Kotlin，无需额外安装。你还可以共享笔记本并远程运行它们，与其他 Kotlin 笔记本实时协作，在编写代码时获得智能编码辅助，并通过交互式或静态报告导出结果。

### 带有 Kotlin 内核的 Jupyter Notebook

[Jupyter Notebook](https://jupyter.org/) 是一款开源 Web 应用程序，允许你创建和共享包含代码、可视化效果和 Markdown 文本的文档。[Kotlin-Jupyter](https://github.com/Kotlin/kotlin-jupyter) 是一个开源项目，它为 Jupyter Notebook 带来了 Kotlin 支持，以便在 Jupyter 环境中发挥 Kotlin 的力量。

## Kotlin DataFrame

[Kotlin DataFrame](https://kotlin.github.io/dataframe/overview.html) 库允许你在 Kotlin 项目中操作结构化数据。从数据创建和清理到深度分析和特征工程，该库都能满足你的需求。

借助 Kotlin DataFrame 库，你可以处理不同的文件格式，包括 CSV、JSON、XLS 和 XLSX。该库还通过连接 SQL 数据库或 API 的能力简化了数据检索过程。

![Kotlin DataFrame](data-analysis-dataframe-example.png){width=700}

## Kandy

[Kandy](https://kotlin.github.io/kandy/welcome.html) 是一个开源 Kotlin 库，它提供了一个强大且灵活的 DSL，用于绘制各种类型的图表。该库是一个简单、惯用、可读且类型安全的工具，用于使数据可视化。

Kandy 与 Kotlin Notebook、Datalore 和带有 Kotlin 内核的 Jupyter Notebook 无缝集成。你还可以轻松地结合使用 Kandy 和 Kotlin DataFrame 库来完成不同的数据相关任务。

![Kandy](data-analysis-kandy-example.png){width=700}

## 下一步

* [Kotlin Notebook 快速入门](get-started-with-kotlin-notebooks.md)
* [使用 Kotlin DataFrame 库检索和转换数据](data-analysis-work-with-data-sources.md)
* [使用 Kandy 库使数据可视化](data-analysis-visualization.md)
* [详细了解用于数据分析的 Kotlin 和 Java 库](data-analysis-libraries.md)