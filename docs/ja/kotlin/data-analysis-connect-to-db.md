[//]: # (title: データベースへの接続とデータの取得)
<web-summary>Kotlin DataFrame を使用して SQL データベースに接続し、テーブルスキーマを調査し、データを取得する方法を学びます。</web-summary>

[Kotlin DataFrame ライブラリ](https://kotlin.github.io/dataframe/home.html)は、最も一般的な以下の SQL データベースをサポートしています：

* [DuckDB](https://kotlin.github.io/dataframe/duckdb.html)
* [H2](https://kotlin.github.io/dataframe/h2.html)
* [MariaDB](https://kotlin.github.io/dataframe/mariadb.html)
* [Microsoft SQL Server](https://kotlin.github.io/dataframe/microsoft-sql-server.html)
* [MySQL](https://kotlin.github.io/dataframe/mysql.html)
* [PostgreSQL](https://kotlin.github.io/dataframe/postgresql.html)
* [SQLite](https://kotlin.github.io/dataframe/sqlite.html)

GitHub 上の [Kotlin DataFrame SQL Examples](https://github.com/zaleslaw/KotlinDataFrame-SQL-Examples/tree/master/src/main/kotlin) も確認してください。

## 始める前に {id="before-you-start"}

> IntelliJ IDEA 2026.2 以降、Kotlin Notebook は IDE にバンドルされなくなり、JetBrains による公式サポートも終了します。
> ソースコードは引き続き [GitHub](https://github.com/Kotlin/kotlin-notebook) で利用可能です。
>
> 詳細については[ブログ記事](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)を参照してください。
>
{style="note"}

このチュートリアルを進めるには：

1. **File** | **New** | **Kotlin Notebook** を選択します。
2. ノートブックの最初のセルに、使用するデータベース用の Java Database Connectivity (JDBC) ドライバの依存関係を追加します。

   例えば、MariaDB データベースに接続するには、次のように追加します：

   ```kotlin 
   USE {
      dependencies("org.mariadb.jdbc:mariadb-java-client:$version")
   }
   ```
3. Kotlin DataFrame をインポートします：

   ```kotlin
   %use dataframe
   ```

   ノートブックで DataFrame ライブラリとその API を確実に利用できるようにするため、他のコードセルよりも前に `%use dataframe` の行を含むコードセルを実行してください。

チュートリアルを進めるにあたり、[Gradle](https://kotlin.github.io/dataframe/setupgradle.html) または [Maven](https://kotlin.github.io/dataframe/setupmaven.html) の依存関係として DataFrame を使用することもできます。

## データベースへの接続 {id="connect-to-a-database"}

データベースに接続するには、`DbConnectionConfig()` 関数を使用して接続設定を作成します：

1. 以下の機能をインポートします：

   ```kotlin
   import org.jetbrains.kotlinx.dataframe.io.DbConnectionConfig
   import org.jetbrains.kotlinx.dataframe.schema.DataFrameSchema
   ```

2. `DbConnectionConfig()` 関数を使用して接続パラメータ（URL、ユーザー名、パスワード）を定義します：

   ```kotlin
   val URL = "YOUR_URL"
   val USER_NAME = "YOUR_USERNAME"
   val PASSWORD = "YOUR_PASSWORD"
   
   val dbConfig = DbConnectionConfig(URL, USER_NAME, PASSWORD)
   ```

> SQL データベースへの接続に関する詳細については、Kotlin DataFrame ドキュメントの [Read from SQL databases](https://kotlin.github.io/dataframe/readsqldatabases.html) を参照してください。
>
{style="tip"}

## データベーススキーマの調査 {id="inspect-database-schema"}

データを読み込む前に、どのようなテーブルがあり、どのようなカラムが含まれているかを把握するために、データベーススキーマを調査します。このスキーマを参考にして、どのテーブルを DataFrame に読み込むかを決定できます。

データベース内のユーザーが作成したすべてのテーブルのスキーマを取得するには、`DataFrameSchema.readAllSqlTables()` 関数を使用します：

```kotlin
val dataSchemas = DataFrameSchema.readAllSqlTables(dbConfig)

dataSchemas.forEach { (tableName, schema) ->
    println("---Schema for table: $tableName---")
    println(schema)
    println()
}
```

## データの読み込み {id="load-data"}

データベーススキーマを調査してデータを選択したら、そのデータを DataFrame に読み込みます。

Kotlin DataFrame は、データベースからデータを読み込むための 2 つの方法を提供しています：

* テーブルから直接データを読み込む。
* カスタム SQL クエリの結果を読み込む。

どちらのアプローチでも、調査、変換、分析が可能な DataFrame が返されます。

### テーブルからのデータ読み込み {id="load-data-from-a-table"}

テーブルからデータを読み込むには、[`DataFrame.readSqlTable()`](https://kotlin.github.io/dataframe/readsqldatabases.html#reading-specific-tables) 関数を使用します。

以下の例では、`movies` テーブルから最初の 100 行を読み込みます：

```kotlin
val moviesDf = DataFrame.readSqlTable(
    dbConfig = dbConfig,
    tableName = "movies",
    limit = 100
)

moviesDf
```

### SQL クエリによるデータの読み込み {id="load-data-with-an-sql-query"}

データベースに対して特定の SQL クエリを実行するには、[`DataFrame.readSqlQuery()`](https://kotlin.github.io/dataframe/readsqldatabases.html#executing-sql-queries) 関数を使用します。
このアプローチは、特定のカラムの読み込み、テーブルの結合、行のフィルタリング、またはデータベース内でのデータの集約が必要な場合に便利です。

クエンティン・タランティーノ監督の映画に関連する特定のデータセットを取得してみましょう。
このクエリは映画の詳細を選択し、映画ごとにジャンルを結合します：

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

## データの処理 {id="process-data"}

データベースから DataFrame にデータを読み込んだ後は、DataFrame の操作を使用して取得したデータを処理できます。

例えば、前のセクションのデータを操作してみましょう。以下のコードは：
1. [`.fillNA()`](https://kotlin.github.io/dataframe/fill.html#fillna) 関数を使用して、`year` カラムの欠損値を置換します。
2. [`.convert()`](https://kotlin.github.io/dataframe/convert.html) 関数を使用して、カラムを `Int` に変換します。
3. [`.filter()`](https://kotlin.github.io/dataframe/filter.html) 関数を使用して、2000 年以降に公開された映画のみを保持します。

```kotlin
val filteredTarantinoMovies = tarantinoMoviesDf
    .fillNA { year }.with { 0 }
    .convert { year }.toInt()
    .filter { year > 2000 }

filteredTarantinoMovies
```

## データの分析 {id="analyze-data"}

[DataFrame ライブラリ](https://kotlin.github.io/dataframe/home.html)を使用してデータのグループ化、ソート、集約を行い、データ内のパターンを発見して理解することができます。

例えば、`actors` テーブルから俳優のデータを読み込み、最も一般的な上位 20 個の名（first name）を見つけてみましょう：

```kotlin
// actors テーブルからデータを抽出
val actorDf = DataFrame.readSqlTable(dbConfig, "actors", 10000)
val top20ActorNames = actorDf
   // first_name カラムでデータをグループ化
   .groupBy { first_name }
   
   // 一意な各名（first name）の出現回数をカウント
   .count()
   
    // カウントの降順で結果をソート
   .sortByDesc("count")
    
   // 分析用に最も頻度の高い上位 20 件を選択
   .take(20)
```

## 次のステップ {id="what-s-next"}

* [Kandy ライブラリ](https://kotlin.github.io/kandy/examples.html)を使用したデータの可視化を試す
* データ可視化の詳細については、[Kandy によるデータ可視化](data-analysis-visualization.md)を参照してください
* Kotlin でのデータサイエンスおよびデータ分析に利用可能なツールやリソースの包括的な概要については、[データ分析のための Kotlin および Java ライブラリ](data-analysis-libraries.md)を参照してください