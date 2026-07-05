[//]: # (title: 向您的 Kotlin Notebook 添加依赖项)

> 从 IntelliJ IDEA 2026.2 开始，Kotlin Notebook 将不再随 IDE 捆绑，也不再由 JetBrains 官方支持。
> 源代码仍可在 [GitHub](https://github.com/Kotlin/kotlin-notebook) 上获取。
>
> 请在[博客文章](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)中了解更多信息。
>
{style="note"}

<tldr>
   <p>这是<strong> Kotlin Notebook 入门</strong>教程的第三部分。在继续之前，请确保您已完成之前的步骤。</p>
   <p><img src="icon-1-done.svg" width="20" alt="第一步"/> <a href="kotlin-notebook-set-up-env.md">设置环境</a><br/>
      <img src="icon-2-done.svg" width="20" alt="第二步"/> <a href="kotlin-notebook-create.md">创建 Kotlin Notebook</a><br/>
      <img src="icon-3.svg" width="20" alt="第三步"/> <strong>向 Kotlin Notebook 添加依赖项</strong><br/>
  </p>
</tldr>

您已经创建了您的第一个 [Kotlin Notebook](kotlin-notebook-overview.md)！现在让我们学习如何添加库的依赖项，这是解锁高级功能的必要步骤。

> Kotlin 标准库可以开箱即用，因此您无需导入它。
> 
{style="note"}

您可以通过在任何代码单元中使用 Gradle 风格语法指定 Maven 仓库中任何库的坐标来加载它。
不过，Kotlin Notebook 提供了一种简化的方法，通过 [`%use` 语句](https://www.jetbrains.com/help/idea/kotlin-notebook.html#import-libraries)来加载常用库：

```kotlin
// 将 libraryName 替换为您要添加的库依赖项
%use libraryName
// 如果需要，指定版本
%use libraryName(version)
// 添加 v= 以触发自动补全
%use libraryName(v=version)
// 示例：kotlinx.datetime:0.7.1
%use datetime(v=0.7.1)
```

您还可以使用 Kotlin Notebook 中的自动补全功能快速访问可用库：

![Kotlin Notebook 中的自动补全功能](autocompletion-feature-notebook.png){width=700}

> Kotlin Notebook 拥有一系列集成库，可用于执行从深度学习到 HTTP 网络等各种任务。
> 请参阅[导入支持的库](https://www.jetbrains.com/help/idea/kotlin-notebook.html#import-libraries)。
> 
> 您还可以添加并使用尚未集成到 Kotlin Notebook 中的库。请参阅[集成新库](https://www.jetbrains.com/help/idea/kotlin-notebook.html#integrate-new-libraries)。
>
{style="note"}

## 向您的 Kotlin Notebook 添加 Kotlin DataFrame 和 Kandy 库

让我们向您的 Kotlin Notebook 添加两个流行的 Kotlin 库依赖项：
* [Kotlin DataFrame 库](https://kotlin.github.io/dataframe/home.html) 让您能够在 Kotlin 项目中强大地操作数据帧。
您可以使用它从 [API](data-analysis-work-with-api.md)、[SQL 数据库](data-analysis-connect-to-db.md)以及 CSV 或 JSON 等[各种文件格式](data-analysis-work-with-data-sources.md)中检索数据。
* [Kandy 库](https://kotlin.github.io/kandy/welcome.html) 提供了一个强大且灵活的 DSL，用于[创建图表](data-analysis-visualization.md)。

要添加这些库：

1. 点击 **Add Code Cell** 创建一个新的代码单元。
2. 在代码单元中输入以下代码：

    ```kotlin
    // 确保使用最新的可用库版本
    %useLatestDescriptors
    
    // 导入 Kotlin DataFrame 库
    %use dataframe
    
    // 导入 Kotlin Kandy 库
    %use kandy
    ```

3. 运行代码单元。

   当执行 `%use` 语句时，它会下载库依赖项并将默认导入项添加到您的 notebook 中。

   > 请确保在运行任何依赖于该库的其他代码单元之前，先运行包含 `%use libraryName` 行的代码单元。
   >
   {style="note"}

4. 要使用 Kotlin DataFrame 库从 CSV 文件导入数据，请在新的代码单元中使用 `.read()` 函数：

    ```kotlin
    // 通过从 "netflix_titles.csv" 文件导入数据来创建数据帧。
    val rawDf = DataFrame.read("netflix_titles.csv")
    
    // 显示原始数据帧数据
    rawDf
    ```

   > 您可以从 [Kotlin DataFrame 示例 GitHub 仓库](https://github.com/Kotlin/dataframe/blob/master/examples/notebooks/netflix/netflix_titles.csv)下载此示例 CSV 文件。
   > 将其添加到您的项目目录中。
   >
   {style="tip"}

   ![使用数据帧显示数据](add-dataframe-dependency.png){width=700}

5. 在新的代码单元中，使用 `.plot` 方法直观地展示数据帧中电视节目 (TV shows) 和电影 (Movies) 的分布情况：

    ```kotlin
    rawDf
        // 统计名为 "type" 的列中每个唯一值出现的次数
        .valueCounts(sort = false) { type }
        // 在条形图中可视化数据并指定颜色
        .plot {
            bars {
                x(type)
                y("count")
                fillColor(type) {
                    scale = categorical(range = listOf(Color.hex("#00BCD4"), Color.hex("#009688")))
                }
            }
    
            // 配置图表布局并设置标题
            layout {
                title = "Count of TV Shows and Movies"
                size = 900 to 550
            }
        }
    ```

生成的图表：

![使用 Kandy 库进行可视化](kandy-library.png){width=700}

恭喜您已成功在 Kotlin Notebook 中添加并利用了这些库！
这只是您使用 Kotlin Notebook 及其[支持的库](data-analysis-libraries.md)所能实现的功能的冰山一角。

## 下一步

* 了解如何[共享您的 Kotlin Notebook](kotlin-notebook-share.md)
* 查看关于[向您的 Kotlin Notebook 添加依赖项](https://www.jetbrains.com/help/idea/kotlin-notebook.html#add-dependencies)的更多详情
* 有关使用 Kotlin DataFrame 库的更详尽指南，请参阅[从文件中检索数据](data-analysis-work-with-data-sources.md)
* 有关 Kotlin 中可用于数据科学和分析的工具和资源的广泛概述，请参阅[用于数据分析的 Kotlin 和 Java 库](data-analysis-libraries.md)