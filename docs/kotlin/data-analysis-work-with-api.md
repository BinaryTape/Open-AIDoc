[//]: # (title: 从 Web 源和 API 检索数据)

使用 [Kotlin DataFrame 库](https://kotlin.github.io/dataframe/home.html)，您可以访问和操作来自各种 Web 源及 API 的数据。它还协助重构这些数据，以进行全面的分析和可视化。

浏览 [GitHub 上的 DataFrame 示例](https://github.com/Kotlin/dataframe/tree/master/examples/projects)。

## 开始之前

> 从 IntelliJ IDEA 2026.2 开始，Kotlin Notebook 将不再与 IDE 捆绑，也不再由 JetBrains 提供官方支持。
> 源代码将继续在 [GitHub](https://github.com/Kotlin/kotlin-notebook) 上可用。
>
> 详细了解[博客文章](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)中的内容。
>
{style="note"}

创建一个新的 Kotlin Notebook：

1. 选择 **File** | **New** | **Kotlin Notebook**。

2. 通过运行以下命令导入 Kotlin DataFrame 库：

   ```kotlin
   %use dataframe
   ```
要跟随本教程，您还可以将 DataFrame 作为 [Gradle](https://kotlin.github.io/dataframe/setupgradle.html) 或 [Maven](https://kotlin.github.io/dataframe/setupmaven.html) 依赖项使用。

## 从 API 获取数据

使用 Kotlin DataFrame 库从 API 获取数据是通过 [`.read()`](https://kotlin.github.io/dataframe/read.html) 函数实现的，这与[从文件检索数据](data-analysis-work-with-data-sources.md#retrieve-data)（如 CSV 或 JSON）类似。然而，在处理基于 Web 的源时，您可能需要额外的格式设置，以将原始 API 数据转换为结构化格式。

让我们来看一个从 [YouTube Data API](https://console.cloud.google.com/apis/library/youtube.googleapis.com) 获取数据的示例：

1. 在新的代码单元格中安全地添加您的 API 密钥，这是对 YouTube Data API 请求进行身份验证所必需的。您可以从[凭据选项卡](https://console.cloud.google.com/apis/credentials)获取您的 API 密钥：

   ```kotlin
   val apiKey = "YOUR-API_KEY"
   ```

2. 创建一个 `load` 函数，该函数接收一个字符串路径，并使用 DataFrame 的 `.read()` 函数从 YouTube Data API 获取数据：

   ```kotlin
   fun load(path: String): AnyRow = DataRow.read("https://www.googleapis.com/youtube/v3/$path&key=$apiKey")
   ```

3. 将获取的数据整理成行，并通过 `nextPageToken` 处理 YouTube API 的分页。这可确保您收集跨多个页面的数据：

   ```kotlin
   fun load(path: String, maxPages: Int): AnyFrame {
       // 初始化一个可变列表以存储数据行。
       val rows = mutableListOf<AnyRow>()

       // 设置用于数据加载的初始页面路径。
       var pagePath = path
       do {
           // 从当前页面路径加载数据。
           val row = load(pagePath)
           // 将加载的数据作为一行添加到列表中。
           rows.add(row)

           // 检索下一页的令牌（如果可用）。
           val next = row.getValueOrNull<String>("nextPageToken")
           // 更新下一轮迭代的页面路径，包括新的令牌。
           pagePath = path + "&pageToken=" + next

           // 继续加载页面，直到没有下一页。
       } while (next != null && rows.size < maxPages) 

       // 串联并以 DataFrame 形式返回所有加载的行。
       return rows.concat() 
   }
   ```

4. 使用先前定义的 `load()` 函数在新的代码单元格中获取数据并创建 DataFrame。本例获取了与 Kotlin 相关的视频数据，每页最多 50 个结果，最多获取 5 页。结果存储在 `df` 变量中：

   ```kotlin
   val df = load("search?q=kotlin&maxResults=50&part=snippet", 5)
   df
   ```

5. 最后，从 DataFrame 中提取并串联项目：

   ```kotlin
   val items = df.items.concat()
   items
   ```

## 清理与提炼数据

清理与提炼数据是准备分析数据集的关键步骤。[Kotlin DataFrame 库](https://kotlin.github.io/dataframe/home.html)为这些任务提供了强大的功能。[`move`](https://kotlin.github.io/dataframe/move.html)、[`concat`](https://kotlin.github.io/dataframe/concatdf.html)、[`select`](https://kotlin.github.io/dataframe/select.html)、[`parse`](https://kotlin.github.io/dataframe/parse.html) 和 [`join`](https://kotlin.github.io/dataframe/join.html) 等方法在组织和转换数据方面发挥着重要作用。

让我们探讨一个示例，其中的数据已经[使用 YouTube 的数据 API 获取](#fetch-data-from-an-api)。目标是清理并重构数据集，为深入分析做准备：

1. 您可以从重新组织和清理数据开始。这包括将某些列移至新标题下，并移除不必要的列以确保清晰：

   ```kotlin
   val videos = items.dropNulls { id.videoId }
       .select { id.videoId named "id" and snippet }
       .distinct()
   videos
   ```

2. 从清理后的数据中分块获取 ID，并加载相应的视频统计信息。这涉及将数据分解为较小的批次并获取额外详情：

   ```kotlin
   val statPages = clean.id.chunked(50).map {
       val ids = it.joinToString("%2C")
       load("videos?part=statistics&id=$ids")
   }
   statPages
   ```

3. 串联获取的统计信息并选择相关列：

   ```kotlin
   val stats = statPages.items.concat().select { id and statistics.all() }.parse()
   stats
   ```

4. 将现有的清理数据与新获取的统计信息进行连接。这会将两组数据合并为一个全面的 DataFrame：

   ```kotlin
   val joined = clean.join(stats)
   joined
   ```

此示例演示了如何使用 Kotlin DataFrame 的各种函数来清理、重组和增强您的数据集。每一步都旨在提炼数据，使其更适合[深入分析](#analyze-data-in-kotlin-notebook)。

## 在 Kotlin Notebook 中分析数据

在成功使用 [Kotlin DataFrame 库](https://kotlin.github.io/dataframe/home.html)的功能[获取](#fetch-data-from-an-api)并[清理和提炼数据](#clean-and-refine-data)后，下一步是分析准备好的数据集，以提取有意义的洞察。

诸如用于数据分类的 [`groupBy`](https://kotlin.github.io/dataframe/groupby.html)、用于[摘要统计](https://kotlin.github.io/dataframe/summarystatistics.html)的 [`sum`](https://kotlin.github.io/dataframe/sum.html) 和 [`maxBy`](https://kotlin.github.io/dataframe/maxby.html)，以及用于数据排序的 [`sortBy`](https://kotlin.github.io/dataframe/sortby.html) 等方法特别有用。这些工具允许您高效地执行复杂的数据分析任务。

让我们看一个示例，使用 `groupBy` 按频道对视频进行分类，使用 `sum` 计算每个类别的总观看次数，并使用 `maxBy` 查找每个组中最新或观看次数最多的视频：

1. 通过设置引用简化对特定列的访问：

   ```kotlin
   val view by column<Int>()
   ```

2. 使用 `groupBy` 方法按 `channel` 列对数据进行分组并进行排序。

   ```kotlin
   val channels = joined.groupBy { channel }.sortByCount()
   ```

在生成的表格中，您可以交互式地探索数据。点击频道对应行的 `group` 字段会展开该行，以显示有关该频道视频的更多详情。

![展开行以显示更多细节](results-of-expanding-group-data-analysis.png){width=700}

您可以点击左下角的表格图标返回到分组后的数据集。

![点击左下角的表格图标返回](return-to-grouped-dataset.png){width=700}

3. 使用 `aggregate`、`sum`、`maxBy` 和 `flatten` 创建一个 DataFrame，总结每个频道的总观看次数以及其最新或观看次数最多的视频的详情：

   ```kotlin
   val aggregated = channels.aggregate {
       viewCount.sum() into view
   
       val last = maxBy { publishedAt }
       last.title into "last title"
       last.publishedAt into "time"
       last.viewCount into "viewCount"
       // 按观看次数降序排列 DataFrame 并将其转换为扁平结构。
   }.sortByDesc(view).flatten()
   aggregated
   ```

分析结果：

![分析结果](kotlin-analysis.png){width=700}

有关更多高级技术，请参阅 [Kotlin DataFrame 文档](https://kotlin.github.io/dataframe/home.html)。

## 下一步

* 使用 [Kandy 库](https://kotlin.github.io/kandy/examples.html)探索数据可视化
* 在[使用 Kandy 进行数据可视化](data-analysis-visualization.md)中查找有关数据可视化的其他信息
* 有关 Kotlin 中可用于数据科学和分析的工具和资源的广泛概述，请参阅[用于数据分析的 Kotlin 和 Java 库](data-analysis-libraries.md)