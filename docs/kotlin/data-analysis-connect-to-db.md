[//]: # (title: 连接数据库并获取数据)
[//]: # (description: 了解如何连接到 SQL 数据库、检查表架构，并使用 Kotlin DataFrame 获取数据。)

[Kotlin DataFrame 库](https://kotlin.github.io/dataframe/home.html)为最常见的 SQL 数据库提供支持：

* [DuckDB](https://kotlin.github.io/dataframe/duckdb.html)
* [H2](https://kotlin.github.io/dataframe/h2.html)
* [MariaDB](https://kotlin.github.io/dataframe/mariadb.html)
* [Microsoft SQL Server](https://kotlin.github.io/dataframe/microsoft-sql-server.html)
* [MySQL](https://kotlin.github.io/dataframe/mysql.html)
* [PostgreSQL](https://kotlin.github.io/dataframe/postgresql.html)
* [SQLite](https://kotlin.github.io/dataframe/sqlite.html)

探索 [GitHub 上的 Kotlin DataFrame SQL 示例](https://github.com/zaleslaw/KotlinDataFrame-SQL-Examples/tree/master/src/main/kotlin)。

## 开始之前

> 从 IntelliJ IDEA 2026.2 开始，Kotlin Notebook 将不再与 IDE 捆绑，也不再由 JetBrains 官方支持。
> 源代码将继续在 [GitHub](https://github.com/Kotlin/kotlin-notebook) 上提供。
>
> 在[博客文章](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)中了解更多信息。
>
{style="note"}

要学习本教程，请执行以下操作：

1. 选择 **File** | **New** | **Kotlin Notebook**。
2. 在 Notebook 的第一个单元格中为您的数据库添加 Java Database Connectivity (JDBC) 驱动程序依赖项。

   例如，要连接到 MariaDB 数据库，请添加：

   ```kotlin 
   USE {
      dependencies("org.mariadb.jdbc:mariadb-java-client:$version")
   }
   ```
3. 导入 Kotlin DataFrame：

   ```kotlin
   %use dataframe
   ```

   在运行任何其他代码单元之前，先运行包含 `%use dataframe` 行的代码单元，以确保 DataFrame 库及其 API 在 Notebook 中可用。

要学习本教程，您还可以将 DataFrame 作为 [Gradle](https://kotlin.github.io/dataframe/setupgradle.html) 或 [Maven](https://kotlin.github.io/dataframe/setupmaven.html) 依赖项使用。

## 连接数据库

要连接到数据库，请使用 `DbConnectionConfig()` 函数创建连接配置：

1. 导入以下功能：

   ```kotlin
   import org.jetbrains.kotlinx.dataframe.io.DbConnectionConfig
   import org.jetbrains.kotlinx.dataframe.schema.DataFrameSchema
   ```

2. 使用 `DbConnectionConfig()` 函数定义连接参数（URL、用户名、密码）：

   ```kotlin
   val URL = "YOUR_URL"
   val USER_NAME = "YOUR_USERNAME"
   val PASSWORD = "YOUR_PASSWORD"
   
   val dbConfig = DbConnectionConfig(URL, USER_NAME, PASSWORD)
   ```

> 有关连接 SQL 数据库的更多信息，请参阅 [Kotlin DataFrame 文档中的从 SQL 数据库读取](https://kotlin.github.io/dataframe/readsqldatabases.html)。
>
{style="tip"}

## 检查数据库架构

在加载数据之前，请检查数据库架构以了解您拥有哪些表以及它们包含哪些列。您可以使用这些架构来决定将哪个表加载到 DataFrame 中。

要获取数据库中所有用户创建表的架构，请使用 `DataFrameSchema.readAllSqlTables()` 函数：

```kotlin
val dataSchemas = DataFrameSchema.readAllSqlTables(dbConfig)

dataSchemas.forEach { (tableName, schema) ->
    println("---Schema for table: $tableName---")
    println(schema)
    println()
}
```

## 加载数据

在检查数据库架构并选择数据后，将数据加载到 DataFrame 中。

Kotlin DataFrame 提供了两种从数据库加载数据的方法：

* 直接从表加载数据。
* 加载自定义 SQL 查询的结果。

这两种方法都会返回一个 DataFrame，您可以在其中对其进行检查、转换和分析。

### 从表加载数据

要从表加载数据，请使用 [`DataFrame.readSqlTable()`](https://kotlin.github.io/dataframe/readsqldatabases.html#reading-specific-tables) 函数。

以下示例从 `movies` 表中加载前 100 行：

```kotlin
val moviesDf = DataFrame.readSqlTable(
    dbConfig = dbConfig,
    tableName = "movies",
    limit = 100
)

moviesDf
```

### 使用 SQL 查询加载数据

要对数据库执行特定的 SQL 查询，请使用 [`DataFrame.readSqlQuery()`](https://kotlin.github.io/dataframe/readsqldatabases.html#executing-sql-queries) 函数。当您需要加载特定列、连接表、筛选行或在数据库中聚合数据时，此方法非常有用。

让我们获取一个与 Quentin Tarantino 导演的电影相关的特定数据集。此查询选择电影详细信息并合并每部电影的类型：

```kotlin
val TARANTINO_FILMS_SQL_QUERY = """
    SELECT name, year, rank, GROUP_CONCAT(genre) as "genres"
    FROM movies JOIN movies_directors ON movie_id = movies.id
    JOIN directors ON directors.id=director_id LEFT JOIN movies_genres ON movies.id = movies_genres.movie_id
    WHERE directors.first_name = "Quentin" AND directors.last_name = "Tarantino"
    GROUP BY name, year, rank
    ORDER BY year
    """

val tarantinoMoviesDf = DataFrame.readSqlQuery(dbConfig, TARANTINO_FILMS_SQL_QUERY)

tarantinoMoviesDf
```

## 处理数据

将数据库加载到 DataFrame 后，您可以使用 DataFrame 操作来处理获取的数据。

例如，让我们操作上一节中的数据。以下代码：
1. 使用 [`.fillNA()`](https://kotlin.github.io/dataframe/fill.html#fillna) 函数替换 `year` 列中的缺失值。
2. 使用 [`.convert()`](https://kotlin.github.io/dataframe/convert.html) 函数将该列转换为 `Int`。
3. 使用 [`.filter()`](https://kotlin.github.io/dataframe/filter.html) 函数仅保留 2000 年以后上映的电影。

```kotlin
val filteredTarantinoMovies = tarantinoMoviesDf
    .fillNA { year }.with { 0 }
    .convert { year }.toInt()
    .filter { year > 2000 }

filteredTarantinoMovies
```

## 分析数据

使用 [DataFrame 库](https://kotlin.github.io/dataframe/home.html)对数据进行分组、排序和聚合，以便您可以发现并理解数据中的模式。

例如，让我们从 `actors` 表中读取演员数据并找出 20 个最常见的名字：

```kotlin
// 从 actors 表中提取数据
val actorDf = DataFrame.readSqlTable(dbConfig, "actors", 10000)
val top20ActorNames = actorDf
   // 按 first_name 列对数据进行分组
   .groupBy { first_name }
   
   // 计算每个唯一名字的出现次数
   .count()
   
    // 按计数降序对结果进行排序
   .sortByDesc("count")
    
   // 选择出现频率最高的前 20 个名字进行分析。
   .take(20)
```

## 下一步

* 使用 [Kandy 库](https://kotlin.github.io/kandy/examples.html)探索数据可视化
* 在[使用 Kandy 进行数据可视化](data-analysis-visualization.md)中查找有关数据可视化的更多信息
* 有关 Kotlin 中可用于数据科学和分析的工具和资源的广泛概述，请参阅[用于数据分析的 Kotlin 和 Java 库](data-analysis-libraries.md)