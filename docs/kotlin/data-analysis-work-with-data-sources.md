[//]: # (title: 从文件中检索数据)
<web-summary>了解如何使用 Kotlin DataFrame 从文件中加载数据，包括 CSV、JSON、SQL、Excel 和 Apache Arrow 文件。</web-summary>

[Kotlin DataFrame 库](https://kotlin.github.io/dataframe/home.html)使你能够处理非结构化和结构化数据。
对于数据转换，你可以使用诸如 [`.add()`](https://kotlin.github.io/dataframe/adddf.html)、[`.split()`](https://kotlin.github.io/dataframe/split.html)、
[`.convert()`](https://kotlin.github.io/dataframe/convert.html) 和 [`.parse()`](https://kotlin.github.io/dataframe/parse.html) 等方法。
此外，该工具包还支持从各种结构化文件格式中检索和操作数据，
包括 CSV、JSON、XLS、Parquet 和 Apache Arrow。
请在 [DataFrame 文档](https://kotlin.github.io/dataframe/data-sources.html)中查看所有受支持的格式。

在本指南中，你可以通过多个示例学习如何检索、提炼和处理数据。

## 开始之前 {id="before-you-start"}

> 从 IntelliJ IDEA 2026.2 开始，Kotlin Notebook 将不再随 IDE 一同捆绑，JetBrains 也将不再提供官方支持。
> 源代码将继续在 [GitHub](https://github.com/Kotlin/kotlin-notebook) 上提供。
>
> 详细了解请参阅[博客文章](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)。
>
{style="note"}

要遵循本教程：

1. 选择 **File** | **New** | **Kotlin Notebook**。
2. 导入 Kotlin DataFrame：

   ```kotlin
   %use dataframe
   ```

   在运行任何其他代码单元之前，先运行包含 `%use dataframe` 行的代码单元，
   以确保 DataFrame 库及其 API 在 notebook 中可用。

要遵循本教程，你也可以将 DataFrame 作为 [Gradle](https://kotlin.github.io/dataframe/setupgradle.html) 或 [Maven](https://kotlin.github.io/dataframe/setupmaven.html) 依赖项使用。

## 检索数据 {id="retrieve-data"}

要从文件中检索数据，
请使用 `DataFrame.read()` 函数：

```kotlin
val movies = DataFrame.read("movies.csv")
```

`DataFrame.read()` 函数会根据文件扩展名和内容检测输入格式。

你还可以传递额外的实参来控制 DataFrame 库读取输入数据的方式。
例如，以下代码为 CSV 文件指定了一个自定义分隔符（`;`）：

```kotlin
val movies = DataFrame.read("movies.csv", delimiter = ';')
```

> 有关其他文件格式和各种读取函数的完整概述，请参阅
> [Kotlin DataFrame 库文档](https://kotlin.github.io/dataframe/read.html)。
> 
{style="tip"}

## 显示数据 {id="display-data"}

获取数据后，你可以将其显示出来。最简单的方法是将数据存储在变量中，然后返回它：

```kotlin
val jsonDf = DataFrame.read("jsonFile.json")
jsonDf
```

此代码会将文件中的数据显示为交互式表格：

![显示数据](display-data.png){width=700}

你可以使用此视图检查值、查看列名，并轻松了解数据集的状态。

## 检查数据结构 {id="inspect-data-structure"}

要深入了解数据的结构或架构，请对 DataFrame 变量使用
[`.schema()`](https://kotlin.github.io/dataframe/schema.html) 函数。

例如，运行 `jsonDf.schema()` 可以列出 JSON 数据集中每一列的类型：

![架构示例](schema-data-analysis.png){width=700}

你还可以使用自动补全功能。它允许你快速访问和操作 DataFrame 的属性。加载数据后，只需输入 DataFrame 变量并后接一个英文句点（`.`），即可查看可用列及其类型的列表。

![可用属性](auto-completion-data-analysis.png){width=700}

## 提炼数据 {id="refine-data"}

Kotlin DataFrame 提供了各种用于提炼数据集的操作。
例如，[分组](https://kotlin.github.io/dataframe/group.html)、
[筛选](https://kotlin.github.io/dataframe/filter.html)、[更新](https://kotlin.github.io/dataframe/update.html)或
[添加新列](https://kotlin.github.io/dataframe/add.html)。这些函数对于数据分析至关重要，
使你能够有效地组织、清洗和转换数据。

例如，我们来看看 `movies.csv` 数据集。它将电影标题和发行年份存储在同一个单元格中。目标是提炼该数据集以便于分析：

1. **加载数据**

   使用 `.read()` 函数将文件加载到 `DataFrame` 中：

   ```kotlin
   val movies = DataFrame.read("movies.csv")
   ```

2. **添加列** 

   要从 `title` 列提取发行年份，请添加一个新的 `year` 列：

   ```kotlin
   val moviesWithYear = movies
       .add("year") { 
           "\\d{4}".toRegex()
               .findAll(title)
               .lastOrNull()
               ?.value
               ?.toInt()
               ?: -1
       }
   
   moviesWithYear
   ```

3. **更新值**

   要从电影标题中移除发行年份，请更新 `title` 列：

   ```kotlin
   val moviesTitle = moviesWithYear
       .update("title") {
           "\\s*\\(\\d{4}\\)\\s*$".toRegex().replace(title, "") 
   }
   
   moviesTitle
   ```

   该代码将电影标题保留在一列中，并将发行年份移动到另一列。

4. **筛选行**

   要专注于特定数据，请使用 `.filter()` 函数。例如，要仅保留 1986 年之后上映的电影，请运行：

   ```kotlin
   val newMovies = moviesTitle.filter { 
       year >= 1996 
   }
   
   newMovies
   ```

5. **移除列**

   要移除不需要的列，请使用 `.remove()` 函数：

   ```kotlin
   val refinedMovies = newMovies.remove { 
       movieID 
   }
   
   refinedMovies
   ```

作为对比，以下是提炼前的数据集：

![原始数据集](original-dataset.png){width=700}

提炼后的数据集：

![数据提炼结果](refined-data.png){width=700}

> 有关其他用例和详细示例，请参阅 [Kotlin Dataframe 示例](https://github.com/Kotlin/dataframe/tree/master/examples)。
> 
{style="tip"}

## 导出数据 {id="export-data"}

提炼数据后，你可以轻松地将其导出。

你可以为此利用各种 [`.write()`](https://kotlin.github.io/dataframe/write.html) 函数。它支持保存为多种格式，
包括 CSV、JSON、XLS、XLSX、Apache Arrow，甚至是 HTML 表格。
请在 [DataFrame 文档](https://kotlin.github.io/dataframe/data-sources.html)中查看所有受支持的格式。
这对于共享你的研究成果、创建报告或提供数据以供进一步分析特别有用。

例如，让我们将结果保存为：

* 使用 [`.writeJson()`](https://kotlin.github.io/dataframe/write.html#writing-to-json) 函数保存为 JSON 文件：

  ```kotlin
  refinedMovies.writeJson("movies.json")
  ```
* 使用 [`.writeCsv()`](https://kotlin.github.io/dataframe/write.html#writing-to-csv) 函数保存为 CSV 文件： 

  ```kotlin
  refinedMovies.writeCsv("movies.csv")
  ```

* 使用 `.writeArrorIPC()` 和 `.writeArrorFeather()` 函数保存为 [Apache Arrow 文件](https://kotlin.github.io/dataframe/write.html#writing-to-apache-arrow-formats)：

  ```kotlin
  refinedMovies.writeArrowIPC("movies.arrow")
  refinedMovies.writeArrowFeather("movies.feather")
  ```

你还可以使用 [`.toStandaloneHTML()`](https://kotlin.github.io/dataframe/tohtml.html) 函数在浏览器中打开独立的 HTML 表格：

```kotlin
refinedMoviesDf
    .toStandaloneHTML(DisplayConfiguration(rowsLimit = null))
    .openInBrowser()
```

## 下一步 {id="what-s-next"}

* 使用 [Kandy 库](https://kotlin.github.io/kandy/examples.html)探索数据可视化
* 在[使用 Kandy 进行数据可视化](data-analysis-visualization.md)中查找关于数据可视化的更多信息
* 有关 Kotlin 中可用于数据科学与分析的工具和资源的全面概述，请参阅[用于数据分析的 Kotlin 和 Java 库](data-analysis-libraries.md)