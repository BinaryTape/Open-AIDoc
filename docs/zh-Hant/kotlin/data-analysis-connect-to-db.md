[//]: # (title: 連線至資料庫並擷取資料)
<web-summary>了解如何使用 Kotlin DataFrame 連線至 SQL 資料庫、檢查資料表架構以及擷取資料。</web-summary>

[Kotlin DataFrame 程式庫](https://kotlin.github.io/dataframe/home.html) 提供對最常見 SQL 資料庫的支援：

* [DuckDB](https://kotlin.github.io/dataframe/duckdb.html)
* [H2](https://kotlin.github.io/dataframe/h2.html)
* [MariaDB](https://kotlin.github.io/dataframe/mariadb.html)
* [Microsoft SQL Server](https://kotlin.github.io/dataframe/microsoft-sql-server.html)
* [MySQL](https://kotlin.github.io/dataframe/mysql.html)
* [PostgreSQL](https://kotlin.github.io/dataframe/postgresql.html)
* [SQLite](https://kotlin.github.io/dataframe/sqlite.html)

探索 [GitHub 上的 Kotlin DataFrame SQL 範例](https://github.com/zaleslaw/KotlinDataFrame-SQL-Examples/tree/master/src/main/kotlin)。

## 開始之前 {id="before-you-start"}

> 自 IntelliJ IDEA 2026.2 起，Kotlin Notebook 將不再隨 IDE 搭售，JetBrains 也不再提供官方支援。
> 原始碼仍可在 [GitHub](https://github.com/Kotlin/kotlin-notebook) 上取得。
>
> 請在[部落格文章](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)中了解更多資訊。
>
{style="note"}

若要依循本教學進行：

1. 選取 **File** | **New** | **Kotlin Notebook**。
2. 在筆記本的第一個儲存格中，為你的資料庫新增 Java 資料庫連線 (JDBC) 驅動程式相依性。

   例如，若要連線至 MariaDB 資料庫，請新增：

   ```kotlin 
   USE {
      dependencies("org.mariadb.jdbc:mariadb-java-client:$version")
   }
   ```
3. 匯入 Kotlin DataFrame：

   ```kotlin
   %use dataframe
   ```

   請在執行任何其他程式碼資料格之前先執行包含 `%use dataframe` 行的程式碼資料格，以確保 DataFrame 程式庫及其 API 在筆記本中可用。

若要依循本教學，你也可以將 DataFrame 作為 [Gradle](https://kotlin.github.io/dataframe/setupgradle.html) 或 [Maven](https://kotlin.github.io/dataframe/setupmaven.html) 相依性使用。

## 連線至資料庫 {id="connect-to-a-database"}

若要連線至資料庫，請使用 `DbConnectionConfig()` 函式建立連線配置：

1. 匯入以下功能：

   ```kotlin
   import org.jetbrains.kotlinx.dataframe.io.DbConnectionConfig
   import org.jetbrains.kotlinx.dataframe.schema.DataFrameSchema
   ```

2. 使用 `DbConnectionConfig()` 函式定義連線參數（URL、使用者名稱、密碼）：

   ```kotlin
   val URL = "YOUR_URL"
   val USER_NAME = "YOUR_USERNAME"
   val PASSWORD = "YOUR_PASSWORD"
   
   val dbConfig = DbConnectionConfig(URL, USER_NAME, PASSWORD)
   ```

> 有關連線至 SQL 資料庫的更多資訊，請參閱 [Kotlin DataFrame 文件中的從 SQL 資料庫讀取 (Read from SQL databases)](https://kotlin.github.io/dataframe/readsqldatabases.html)。
>
{style="tip"}

## 檢查資料庫架構 {id="inspect-database-schema"}

在載入資料之前，請檢查資料庫架構以了解擁有哪些資料表以及它們包含哪些資料欄。你可以使用這些架構來決定要將哪個資料表載入至 DataFrame 中。

若要擷取資料庫中所有使用者建立之資料表的架構，請使用 `DataFrameSchema.readAllSqlTables()` 函式：

```kotlin
val dataSchemas = DataFrameSchema.readAllSqlTables(dbConfig)

dataSchemas.forEach { (tableName, schema) ->
    println("---Schema for table: $tableName---")
    println(schema)
    println()
}
```

## 載入資料 {id="load-data"}

在檢查資料庫架構並選取資料後，將資料載入至 DataFrame。

Kotlin DataFrame 提供兩種從資料庫載入資料的方式：

* 直接從資料表載入資料。
* 載入自訂 SQL 查詢的結果。

兩種方式都會傳回一個 DataFrame，供你檢查、轉換及分析。

### 從資料表載入資料 {id="load-data-from-a-table"}

若要從資料表載入資料，請使用 [`DataFrame.readSqlTable()`](https://kotlin.github.io/dataframe/readsqldatabases.html#reading-specific-tables) 函式。

以下範例會從 `movies` 資料表載入前 100 列：

```kotlin
val moviesDf = DataFrame.readSqlTable(
    dbConfig = dbConfig,
    tableName = "movies",
    limit = 100
)

moviesDf
```

### 使用 SQL 查詢載入資料 {id="load-data-with-an-sql-query"}

若要在資料庫上執行特定的 SQL 查詢，請使用 [`DataFrame.readSqlQuery()`](https://kotlin.github.io/dataframe/readsqldatabases.html#executing-sql-queries) 函式。
當你需要載入特定欄位、聯結資料表、篩選列或在資料庫中彙總資料時，此方法非常實用。

讓我們擷取與昆汀·塔倫提諾 (Quentin Tarantino) 執導之電影相關的特定資料集。
此查詢會選取電影詳細資料，並合併每部電影的類型：

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

## 處理資料 {id="process-data"}

將資料庫載入至 DataFrame 後，你可以使用 DataFrame 操作來處理擷取到的資料。

例如，讓我們處理上一節中的資料。以下程式碼：
1. 使用 [`.fillNA()`](https://kotlin.github.io/dataframe/fill.html#fillna) 函式取代 `year` 欄位中的遺漏值。
2. 使用 [`.convert()`](https://kotlin.github.io/dataframe/convert.html) 函式將該欄位轉換為 `Int`。
3. 使用 [`.filter()`](https://kotlin.github.io/dataframe/filter.html) 函式僅保留 2000 年之後上映的電影。

```kotlin
val filteredTarantinoMovies = tarantinoMoviesDf
    .fillNA { year }.with { 0 }
    .convert { year }.toInt()
    .filter { year > 2000 }

filteredTarantinoMovies
```

## 分析資料 {id="analyze-data"}

使用 [DataFrame 程式庫](https://kotlin.github.io/dataframe/home.html) 對資料進行分組、排序和彙總，以便發現並理解資料中的模式。

例如，讓我們從 `actors` 資料表讀取演員資料，並找出 20 個最常見的名字：

```kotlin
// 從 actors 資料表擷取資料
val actorDf = DataFrame.readSqlTable(dbConfig, "actors", 10000)
val top20ActorNames = actorDf
   // 依 first_name 欄位對資料進行分組
   .groupBy { first_name }
   
   // 計算每個不重複名字的出現次數
   .count()
   
   // 依出現次數降冪排序結果
   .sortByDesc("count")
    
   // 選取出現頻率最高的前 20 個名字進行分析。
   .take(20)
```

## 後續步驟 {id="what-s-next"}

* 使用 [Kandy 程式庫](https://kotlin.github.io/kandy/examples.html) 探索資料視覺化
* 在[使用 Kandy 進行資料視覺化](data-analysis-visualization.md)中尋找有關資料視覺化的其他資訊
* 如需 Kotlin 中可用於資料科學與分析的工具和資源的完整概覽，請參閱[用於資料分析的 Kotlin 和 Java 程式庫](data-analysis-libraries.md)