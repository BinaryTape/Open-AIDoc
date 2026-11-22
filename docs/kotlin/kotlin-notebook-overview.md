[//]: # (title: Kotlin Notebook)
<web-summary>在 IntelliJ IDEA 中创建和编辑交互式 Kotlin 笔记本，以运行代码、可视化数据、构建创意原型并分享结果。</web-summary>

> 从 IntelliJ IDEA 2026.2 开始，Kotlin Notebook 将不再捆绑在 IDE 中，也不再由 JetBrains 官方支持。
> 源代码仍将在 [GitHub](https://github.com/Kotlin/kotlin-notebook) 上提供。
>
> 在[博文](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)中了解详情。
>
{style="note"}

Kotlin Notebook 提供了一个交互式环境来创建和编辑笔记本，充分发挥 Kotlin 功能的全部潜力。

笔记本是一种交互式文档，您可以在其中将可执行的 Kotlin 代码与文本、结果及可视化内容结合起来。
您可以将其视为 Kotlin REPL 的扩展，它能够将代码组织到单元格中，使用 Markdown 编写文档，并在生成输出的代码旁立即显示结果（从文本到绘图图表）。

准备好迎接无缝的编码体验，在 IntelliJ IDEA 生态系统中开发和实验 Kotlin 代码，接收即时输出，并集成代码、视觉呈现和文本。

![Kotlin Notebook](data-analysis-notebook.gif){width=700}

Kotlin Notebook 插件附带[多种功能](https://www.jetbrains.com/help/idea/kotlin-notebook.html)以促进您的开发流程，例如： 

* 在单元格内访问 API
* 只需点击几下即可导入和导出文件
* 使用 REPL 命令快速探索项目
* 获得丰富的输出格式
* 通过注解或类似 Gradle 的语法直观地管理依赖项
* 用单行代码导入各种库，甚至向项目中添加新库
* 借助错误消息和回溯信息获取调试洞察

Kotlin Notebook 基于我们的 [Kotlin Kernel for Jupyter Notebooks](https://github.com/Kotlin/kotlin-jupyter?tab=readme-ov-file#kotlin-kernel-for-ipythonjupyter)，使其易于与其他 Kotlin 笔记本解决方案集成。
在没有兼容性问题的情况下，您可以轻松地在 Kotlin Notebook、[Datalore](https://datalore.jetbrains.com/) 和 [Kotlin-Jupyter Notebook](https://github.com/Kotlin/kotlin-jupyter) 之间共享工作成果。

借助这些功能，您可以着手处理从简单的代码实验到全面的数据项目等广泛任务。

## 数据分析与可视化 {id="data-analytics-and-visualization"}

无论您是在进行初步的数据探索，还是在完成一个端到端的数据分析项目，Kotlin Notebook 都有适合您的工具。

在 Kotlin Notebook 中，您可以直观地集成各种[库](data-analysis-libraries.md)，以便在获取操作即时输出的同时检索、转换、绘制和建模数据。

对于与分析相关的任务，[Kotlin DataFrame](https://kotlin.github.io/dataframe/overview.html) 库提供了强大的解决方案。该库有助于加载、创建、筛选和清洗结构化数据。

Kotlin DataFrame 还支持与 SQL 数据库的无缝连接，并在 IDE 中直接从不同的数据源读取数据，包括 CSV、JSON 和 TXT。
请在 [DataFrame 文档](https://kotlin.github.io/dataframe/data-sources.html)中查看所有支持的格式。

[Kandy](https://kotlin.github.io/kandy/welcome.html) 是一个开源 Kotlin 库，允许您创建各种类型的图表。
Kandy 惯用、可读且类型安全的特性使您能够有效地可视化数据并获取有价值的洞察。

![data-analytics-and-visualization](data-analysis-kandy-example.png){width=700}

## 原型设计 {id="prototyping"}

Kotlin Notebook 提供了一个交互式环境，用于在小代码块中运行代码并实时查看结果。
这种动手实践的方法可以在原型设计阶段实现快速实验与迭代。

在 Kotlin Notebook 的帮助下，您可以在构思阶段尽早测试解决方案的概念。此外，Kotlin Notebook 同时支持协作和可复现的工作，有助于新想法的生成与评估。

![kotlin-notebook-prototyping](kotlin-notebook-prototyping.png){width=700}

## 后端开发 {id="backend-development"}

Kotlin Notebook 提供了在单元格内调用 API 以及使用 OpenAPI 等协议的能力。它与外部服务和 API 进行交互的能力使其在某些后端开发场景中非常有用，例如直接在笔记本环境中检索信息和读取 JSON 文件。

![kotlin-notebook-backend-development](kotlin-notebook-backend-development.png){width=700}

## 代码文档 {id="code-documentation"}

在 Kotlin Notebook 中，您可以在代码单元格内包含内联注释和文本注解，以提供与代码片段相关的其他上下文、解释和说明。

您还可以在 Markdown 单元格中编写文本，这些单元格支持丰富的格式设置选项，例如标题、列表、链接、图片等。
要渲染 Markdown 单元格并查看带有格式的文本，只需像运行代码单元格一样运行它即可。

![kotlin-notebook-documenting](kotlin-notebook-documentation.png){width=700}

## 共享代码与输出 {id="sharing-code-and-outputs"}

鉴于 Kotlin Notebook 遵循通用的 Jupyter 格式，因此可以在不同的笔记本之间共享代码和输出。
您可以使用任何 Jupyter 客户端（例如 [Jupyter Notebook](https://jupyter.org/) 或 [Jupyter Lab](https://jupyterlab.readthedocs.io/en/latest/)）打开、编辑和运行 Kotlin Notebook。 

您还可以通过与任何笔记本 Web 查看器共享 `.ipynb` 笔记本文件来分发您的工作成果。其中一个选择是原生支持渲染此格式的 [GitHub](https://github.com/)。另一个选择是 [JetBrains 的 Datalore](https://datalore.jetbrains.com/) 平台，该平台有助于共享、运行和编辑笔记本，并提供定时运行笔记本等高级功能。 

![kotlin-notebook-sharing-datalore](kotlin-notebook-sharing-datalore.png){width=700}

或者，您可以将当前笔记本作为 [GitHub Gist](https://gist.github.com/) 快速共享。
点击工具栏上的 **Create Gist** 按钮。 

![notebook-github-gist](notebook-github-gist.png){width=400}

IntelliJ IDEA 会将您的笔记本导出到您 GitHub 帐户上的 Gist，并提供一个用于共享、查看和下载笔记本的 URL。 

Gist 以 JSON 格式保留了来自笔记本的所有代码、输出和 Markdown，GitHub 可以对其进行渲染以供预览。 

## 后续步骤 {id="what-s-next"}

* [了解 Kotlin Notebook 的用法与关键特性。](https://www.jetbrains.com/help/idea/kotlin-notebook.html)
* [试用 Kotlin Notebook。](get-started-with-kotlin-notebooks.md)
* [深入了解用于数据分析的 Kotlin。](data-analysis-overview.md)