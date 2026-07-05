[//]: # (title: Kotlin Notebook)
[//]: # (description: 在 IntelliJ IDEA 中创建和编辑交互式 Kotlin 笔记本，以运行代码、可视化数据、原型设计构思并共享结果。)

> 从 IntelliJ IDEA 2026.2 开始，Kotlin Notebook 将不再与 IDE 捆绑，也不再由 JetBrains 官方支持。
> 源代码仍可在 [GitHub](https://github.com/Kotlin/kotlin-notebook) 上获取。
>
> 欲了解更多信息，请参阅[博客文章](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)。
>
{style="note"}

Kotlin Notebook 提供了一个交互式环境来创建和编辑笔记本，充分利用了 Kotlin 的全部潜力。

笔记本是一个交互式文档，您可以在其中将可执行 Kotlin 代码与文本、结果和可视化内容混合在一起。
您可以将其视为扩展了以下功能的 Kotlin REPL：能够将代码组织到单元格中、使用 Markdown 编写文档，并紧挨着生成代码立即显示输出（从文本到图表）。

准备好享受无缝编码体验吧，您可以在 IntelliJ IDEA 生态系统中开发和试验 Kotlin 代码、接收即时输出，并将代码、视觉效果和文本集成在一起。

![Kotlin Notebook](data-analysis-notebook.gif){width=700}

Kotlin Notebook 插件附带了[各种功能](https://www.jetbrains.com/help/idea/kotlin-notebook.html)以提升您的开发过程，例如： 

* 在单元格内访问 API
* 只需点击几下即可导入和导出文件
* 使用 REPL 命令快速探索项目
* 获取丰富的输出格式集
* 采用注解或类 Gradle 语法直观地管理依赖项
* 通过单行代码导入各种库，甚至可以向项目中添加新库
* 通过错误消息和回溯获取调试洞察

Kotlin Notebook 基于我们的 [Jupyter Notebook 的 Kotlin 内核](https://github.com/Kotlin/kotlin-jupyter?tab=readme-ov-file#kotlin-kernel-for-ipythonjupyter)，使其易于与其他 Kotlin 笔记本解决方案集成。
无需担心兼容性问题，您可以毫不费力地在 Kotlin Notebook、[Datalore](https://datalore.jetbrains.com/) 和 [Kotlin-Jupyter Notebook](https://github.com/Kotlin/kotlin-jupyter) 之间共享您的工作。

凭借这些功能，您可以开展广泛的任务，从简单的代码试验到全面的数据项目。

## 数据分析与可视化

无论您是在进行初步的数据探索，还是在完成端到端的数据分析项目，Kotlin Notebook 都能为您提供合适的工具。

在 Kotlin Notebook 中，您可以直观地集成[库](data-analysis-libraries.md)，以便检索、转换、绘制和建模数据，同时获得操作的即时输出。

对于分析相关的任务，[Kotlin DataFrame](https://kotlin.github.io/dataframe/overview.html) 库提供了强大的解决方案。该库方便了结构化数据的加载、创建、筛选和清理。

Kotlin DataFrame 还支持与 SQL 数据库的无缝连接，并能直接在 IDE 中读取来自不同数据源的数据，包括 CSV、JSON 和 TXT。请在 [DataFrame 文档](https://kotlin.github.io/dataframe/data-sources.html)中查看所有支持的格式。

[Kandy](https://kotlin.github.io/kandy/welcome.html) 是一个开源 Kotlin 库，允许您创建各种类型的图表。
Kandy 惯用、易读且类型安全的特性让您可以有效地可视化数据并获得宝贵的洞察。

![data-analytics-and-visualization](data-analysis-kandy-example.png){width=700}

## 原型设计

Kotlin Notebook 提供了一个交互式环境，可以按小块运行代码并实时查看结果。 
这种动手实践的方法可以在原型设计阶段实现快速的实验和迭代。

借助 Kotlin Notebook，您可以在构思阶段的早期测试解决方案的概念。此外，Kotlin Notebook 支持协作式和可复现的工作，从而能够生成和评估新想法。

![kotlin-notebook-prototyping](kotlin-notebook-prototyping.png){width=700}

## 后端开发

Kotlin Notebook 提供了在单元格内调用 API 以及使用 OpenAPI 等协议的能力。它与外部服务和 API 交互的能力使其适用于某些后端开发场景，例如直接在您的笔记本环境中检索信息和读取 JSON 文件。

![kotlin-notebook-backend-development](kotlin-notebook-backend-development.png){width=700}

## 代码文档

在 Kotlin Notebook 中，您可以在代码单元中包含内联注释和文本注解，以提供与代码片段相关的其他上下文、解释和说明。

您还可以在 Markdown 单元格中编写文本，这些单元格支持丰富的格式选项，如标题、列表、链接、图片等。 
要渲染 Markdown 单元格并查看格式化后的文本，只需像运行代码单元一样运行它即可。

![kotlin-notebook-documenting](kotlin-notebook-documentation.png){width=700}

## 共享代码和输出

鉴于 Kotlin Notebook 遵循通用 Jupyter 格式，因此可以在不同的笔记本之间共享您的代码和输出。
您可以使用任何 Jupyter 客户端（例如 [Jupyter Notebook](https://jupyter.org/) 或 [Jupyter Lab](https://jupyterlab.readthedocs.io/en/latest/)）打开、编辑和运行您的 Kotlin Notebook。 

您还可以通过与任何笔记本 Web 查看器共享 `.ipynb` 笔记本文件来分发您的工作。一种选择是 [GitHub](https://github.com/)，它原生支持渲染此格式。另一种选择是 JetBrains 的 [Datalore](https://datalore.jetbrains.com/) 平台，它提供共享、运行和编辑笔记本的功能，并具备如定期笔记本运行等高级功能。 

![kotlin-notebook-sharing-datalore](kotlin-notebook-sharing-datalore.png){width=700}

或者，您可以将当前的笔记本快速共享为 [GitHub 代码片段 (gist)](https://gist.github.com/)。 
点击工具栏上的 **Create Gist** 按钮。 

![notebook-github-gist](notebook-github-gist.png){width=400}

IntelliJ IDEA 会将您的笔记本导出到您 GitHub 帐户中的代码片段 (gist)，并提供一个用于共享、查看和下载该笔记本的 URL。 

代码片段 (gist) 以 JSON 格式保留笔记本中的所有代码、输出和 Markdown，GitHub 可以对其进行渲染以供预览。 

## 后续步骤

* [了解 Kotlin Notebook 的用法和主要功能。](https://www.jetbrains.com/help/idea/kotlin-notebook.html)
* [试用 Kotlin Notebook。](get-started-with-kotlin-notebooks.md)
* [深入了解用于数据分析的 Kotlin。](data-analysis-overview.md)