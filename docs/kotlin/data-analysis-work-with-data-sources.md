[//]: # (title: 从文件获取数据)
[//]: # (description: 了解如何使用 Kotlin DataFrame 从文件加载数据，包括 CSV、JSON、SQL、Excel 和 Apache Arrow 文件。)

[Kotlin DataFrame 库](https://kotlin.github.io/dataframe/home.html)使您能够处理非结构化和结构化数据。
对于数据转换，您可以使用 [`.add()`](https://kotlin.github.io/dataframe/adddf.html)、[`.split()`](https://kotlin.github.io/dataframe/split.html)、[`.convert()`](https://kotlin.github.io/dataframe/convert.html) 和 [`.parse()`](https://kotlin.github.io/dataframe/parse.html) 等方法。
此外，该工具集还支持从各种结构化文件格式中获取和操作数据，包括 CSV、JSON、XLS、Parquet 和 Apache Arrow。
请参阅 [DataFrame 文档](https://kotlin.github.io/dataframe/data-sources.html)查看所有支持的格式。

在本指南中，您可以通过多个示例学习如何获取、精炼和处理数据。

## 开始之前

> 从 IntelliJ IDEA 2026.2 开始，Kotlin Notebook 将不再与 IDE 捆绑，也不再由 JetBrains 官方支持。
> 源代码仍可在 [GitHub](https://github.com/Kotlin/kotlin-notebook) 上获得。
>
> 详细了解[博客文章](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)。
>
{style="note"}

要按照本教程操作：

1. 选择 **File** | **New** | **Kotlin Notebook**。
2. 导入 Kotlin DataFrame：

   ```kotlin
   %use dataframe
   ```

   在运行任何其他代码单元之前，请先运行包含 `%use dataframe` 行的代码单元，以确保 DataFrame 库及其 API 在笔记本中可用。

要按照教程操作，您还可以将 DataFrame 作为 [Gradle](https://kotlin.github.io/dataframe/setupgradle.html) 或 [Maven](https://kotlin.github.io/dataframe/setupmaven.html) 依赖项使用。

## 获取数据

要从文件获取数据，请使用 `DataFrame.read()` 函数：

```kotlin
val movies = DataFrame.read("movies.csv")
```

`DataFrame.read()` 函数会根据文件扩展名和内容自动检测输入格式。

您还可以传递其他实参来控制 DataFrame 库读取输入数据的方式。例如，以下代码为 CSV 文件指定了自定义分隔符 (`;`)：

```kotlin
val movies = DataFrame.read("movies.csv", delimiter = ';')
```

> 有关其他文件格式的全面概览以及各种读取函数的详细信息，请参阅 [Kotlin DataFrame 库文档](https://kotlin.github.io/dataframe/read.html)。
> 
{style="tip"}

## 显示数据

一旦拥有数据，您就可以将其显示出来。最简单的方法是将数据存储在变量中，然后将其返回：

```kotlin
val jsonDf = DataFrame.read("jsonFile.json")
jsonDf
```

此代码将文件中的数据显示为交互式表格：

![显示数据](display-data.png){width=700}

您可以使用此视图来检查值、查看列名，并轻松了解数据集的状态。

## 检查数据结构

要深入了解数据的结构或架构，请对 DataFrame 变量调用 [`.schema()`](https://kotlin.github.io/dataframe/schema.html) 函数。

例如，运行 `jsonDf.schema()` 会列出 JSON 数据集中每一列的类型：

![架构示例](schema-data-analysis.png){width=700}

您还可以使用自动补全功能。它可以让您快速访问和操作 DataFrame 的属性。加载数据后，只需输入 DataFrame 变量名后跟一个点 (`.`)，即可查看可用列及其类型的列表。

![可用属性](auto-completion-data-analysis.png){width=700}

## 精炼数据

Kotlin DataFrame 提供了用于精炼数据集的各种操作。例如，[分组](https://kotlin.github.io/dataframe/group.html)、[筛选](https://kotlin.github.io/dataframe/filter.html)、[更新](https://kotlin.github.io/dataframe/update.html)或[添加新列](https://kotlin.github.io/dataframe/add.html)。这些函数对于数据分析至关重要，让您可以有效地组织、清洗和转换数据。

例如，让我们看看 `movies.csv` 数据集。它在同一个单元格中存储了电影标题和发行年份。目标是精炼此数据集以便于分析：

1. **加载数据**

   使用 `.read()` 函数将文件加载到 `DataFrame` 中：

   ```kotlin
   val movies = DataFrame.read("movies.csv")
   ```

2. **添加列** 

   要从 `title` 列中提取发行年份，请添加一个新的 `year` 列：

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

   这段代码将电影标题保留在一列中，并将发行年份移动到另一列。

4. **筛选行**

   要专注于特定数据，请使用 `.filter()` 函数。例如，要仅保留 1986 年以后发行的电影，请运行：

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

作为对比，以下是精炼前的数据集：

![原始数据集](original-dataset.png){width=700}

精炼后的数据集：

![数据精炼结果](refined-data.png){width=700}

> 有关更多用例和详细示例，请参阅 [Kotlin Dataframe 示例](https://github.com/Kotlin/dataframe/tree/master/examples)。
> 
{style="tip"}

## 导出数据

在精炼数据后，您可以轻松导出处理后的数据。

您可以为此使用各种 [`.write()`](https://kotlin.github.io/dataframe/write.html) 函数。它支持保存为多种格式，包括 CSV、JSON、XLS、XLSX、Apache Arrow，甚至是 HTML 表格。请参阅 [DataFrame 文档](https://kotlin.github.io/dataframe/data-sources.html)查看所有支持的格式。这对于分享您的发现、创建报告或使数据可用于进一步分析特别有用。

例如，我们将结果保存为：

* 使用 [`.writeJson()`](https://kotlin.github.io/dataframe/write.html#writing-to-json) 函数保存为 JSON 文件：

  ```kotlin
  refinedMovies.writeJson("movies.json")
  ```
* 使用 [`.writeCsv()`](https://kotlin.github.io/dataframe/write.html#writing-to-csv) 函数保存为 CSV 文件： 

  ```kotlin
  refinedMovies.writeCsv("movies.csv")
  ```

* 使用 `.writeArrowIPC()` 和 `.writeArrowFeather()` 函数保存为 [Apache Arrow 文件](https://kotlin.github.io/dataframe/write.html#writing-to-apache-arrow-formats)：

  ```kotlin
  refinedMovies.writeArrowIPC("movies.arrow")
  refinedMovies.writeArrowFeather("movies.feather")
  ```

您还可以使用 [`.toStandaloneHTML()`](https://kotlin.github.io/dataframe/tohtml.html) 函数在浏览器中打开独立的 HTML 表格：

```kotlin
refinedMoviesDf
    .toStandaloneHTML(DisplayConfiguration(rowsLimit = null))
    .openInBrowser()
```

## 下一步

* 探索使用 [Kandy 库](https://kotlin.github.io/kandy/examples.html)进行数据可视化
* 在[在 Kotlin Notebook 中使用 Kandy 进行数据可视化](data-analysis-visualization.md)中查找有关数据可视化的更多信息
* 有关 Kotlin 中可用于数据科学和分析的工具和资源的广泛概览，请参阅[用于数据分析的 Kotlin 和 Java 库](data-analysis-libraries.md)