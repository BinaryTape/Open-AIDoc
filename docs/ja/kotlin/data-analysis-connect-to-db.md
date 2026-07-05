[//]: # (title: データベースへの接続とデータの取得)
[//]: # (description: SQLデータベースへの接続、テーブルスキーマの検査、Kotlin DataFrameを使用したデータ取得の方法について説明します。)

[Kotlin DataFrameライブラリ](https://kotlin.github.io/dataframe/home.html)は、最も一般的なSQLデータベースをサポートしています：

* [DuckDB](https://kotlin.github.io/dataframe/duckdb.html)
* [H2](https://kotlin.github.io/dataframe/h2.html)
* [MariaDB](https://kotlin.github.io/dataframe/mariadb.html)
* [Microsoft SQL Server](https://kotlin.github.io/dataframe/microsoft-sql-server.html)
* [MySQL](https://kotlin.github.io/dataframe/mysql.html)
* [PostgreSQL](https://kotlin.github.io/dataframe/postgresql.html)
* [SQLite](https://kotlin.github.io/dataframe/sqlite.html)

[GitHubにあるKotlin DataFrame SQLの例](https://github.com/zaleslaw/KotlinDataFrame-SQL-Examples/tree/master/src/main/kotlin)を参照してください。

## 始める前に

> IntelliJ IDEA 2026.2以降、Kotlin NotebookはIDEに同梱されなくなり、JetBrainsによる公式サポートも終了します。
> ソースコードは引き続き[GitHub](https://github.com/Kotlin/kotlin-notebook)で利用可能です。
>
> 詳細は[ブログ記事](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)を参照してください。
>
{style="note"}

このチュートリアルに従うには：

1. **File** | **New** | **Kotlin Notebook**を選択します。
2. Notebookの最初のセルで、使用するデータベースのJDBC（Java Database Connectivity）ドライバの依存関係を追加します。

   例えば、MariaDBデータベースに接続するには、以下を追加します：

   ```kotlin 
   USE {
      dependencies("org.mariadb.jdbc:mariadb-java-client:$version")
   }
   ```
3. Kotlin DataFrameをインポートします：

   ```kotlin
   %use dataframe
   ```

   DataFrameライブラリとそのAPIをNotebookで利用できるようにするため、他のどのコードセルよりも先に`%use dataframe`の行を含むコードセルを実行してください。

このチュートリアルに従うために、DataFrameを[Gradle](https://kotlin.github.io/dataframe/setupgradle.html)または[Maven](https://kotlin.github.io/dataframe/setupmaven.html)の依存関係として使用することもできます。

## データベースへの接続

データベースに接続するには、`DbConnectionConfig()`関数を使用して接続設定を作成します。

1. 以下の機能をインポートします：

   ```kotlin
   import org.jetbrains.kotlinx.dataframe.io.DbConnectionConfig
   import org.jetbrains.kotlinx.dataframe.schema.DataFrameSchema
   ```

2. `DbConnectionConfig()`関数を使用して、接続パラメータ（URL、ユーザー名、パスワード）を定義します：

   ```kotlin
   val URL = "YOUR_URL"
   val USER_NAME = "YOUR_USERNAME"
   val PASSWORD = "YOUR_PASSWORD"
   
   val dbConfig = DbConnectionConfig(URL, USER_NAME, PASSWORD)
   ```

> SQLデータベースへの接続の詳細については、[Kotlin DataFrameドキュメントの「Read from SQL databases」](https://kotlin.github.io/dataframe/readsqldatabases.html)を参照してください。
>
{style="tip"}

## データベーススキーマの検査

データを読み込む前に、データベーススキーマを検査して、どのようなテーブルがあり、どのような列が含まれているかを把握します。スキーマを確認することで、どのテーブルをDataFrameに読み込むかを決定できます。

データベース内のすべてのユーザー作成テーブルのスキーマを取得するには、`DataFrameSchema.readAllSqlTables()`関数を使用します：

```kotlin
val dataSchemas = DataFrameSchema.readAllSqlTables(dbConfig)

dataSchemas.forEach { (tableName, schema) ->
    println("---Schema for table: $tableName---")
    println(schema)
    println()
}
```

## データの読み込み

データベーススキーマを検査してデータを選択したら、そのデータをDataFrameに読み込みます。

Kotlin DataFrameは、データベースからデータを読み込むための2つの方法を提供しています：

* テーブルから直接データを読み込む。
* カスタムSQLクエリの結果を読み込む。

どちらのアプローチも、Kotlin Notebookで検査、変換、分析が可能なDataFrameを返します。

### テーブルからデータを読み込む

テーブルからデータを読み込むには、[`DataFrame.readSqlTable()`](https://kotlin.github.io/dataframe/readsqldatabases.html#reading-specific-tables)関数を使用します。

以下の例では、`movies`テーブルから最初の100行を読み込みます：

```kotlin
val moviesDf = DataFrame.readSqlTable(
    dbConfig = dbConfig,
    tableName = "movies",
    limit = 100
)

moviesDf
```

### SQLクエリでデータを読み込む

データベースに対して特定のSQLクエリを実行するには、[`DataFrame.readSqlQuery()`](https://kotlin.github.io/dataframe/readsqldatabases.html#executing-sql-queries)関数を使用します。
このアプローチは、特定の列の読み込み、テーブルの結合、行のフィルタリング、またはデータベース内でのデータの集計が必要な場合に便利です。

クエンティン・タランティーノが監督した映画に関する特定のデータセットを取得してみましょう。
このクエリは映画の詳細を選択し、各映画のジャンルを結合します：

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

## データの処理

データベースをDataFrameに読み込んだ後、DataFrameの操作を使用して取得したデータを処理できます。

例えば、前のセクションのデータを操作してみましょう。以下のコードは：
1. [`.fillNA()`](https://kotlin.github.io/dataframe/fill.html#fillna)関数を使用して`year`列の欠損値を置き換えます。
2. [`.convert()`](https://kotlin.github.io/dataframe/convert.html)関数を使用して列を`Int`に変換します。
3. [`.filter()`](https://kotlin.github.io/dataframe/filter.html)関数を使用して、2000年以降に公開された映画のみを保持します。

```kotlin
val filteredTarantinoMovies = tarantinoMoviesDf
    .fillNA { year }.with { 0 }
    .convert { year }.toInt()
    .filter { year > 2000 }

filteredTarantinoMovies
```

## データの分析

[DataFrameライブラリ](https://kotlin.github.io/dataframe/home.html)を使用して、データのグループ化、ソート、集計を行い、データ内のパターンを発見し理解することができます。

例えば、`actors`テーブルからアクターデータを読み込み、最も一般的なアクターの名前（first name）の上位20個を見つけてみましょう：

```kotlin
// actorsテーブルからデータを抽出
val actorDf = DataFrame.readSqlTable(dbConfig, "actors", 10000)
val top20ActorNames = actorDf
   // first_name列でデータをグループ化
   .groupBy { first_name }
   
   // 各ユニークな名前の出現回数をカウント
   .count()
   
    // カウントの降順で結果をソート
   .sortByDesc("count")
    
   // 分析のために上位20個の最も頻繁な名前を選択
   .take(20)
```

## 次のステップ

* [Kandyライブラリ](https://kotlin.github.io/kandy/examples.html)を使用したデータの可視化を試す
* [Kandyを使用したデータの可視化](data-analysis-visualization.md)でデータの可視化に関する追加情報を見つける
* Kotlinでのデータサイエンスと分析に利用可能なツールとリソースの広範な概要については、[データ分析用のKotlinおよびJavaライブラリ](data-analysis-libraries.md)を参照してください