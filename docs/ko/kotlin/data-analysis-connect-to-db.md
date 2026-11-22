[//]: # (title: 데이터베이스 연결 및 데이터 조회)
<web-summary>Kotlin DataFrame을 사용하여 SQL 데이터베이스에 연결하고, 테이블 스키마를 검사하며, 데이터를 조회하는 방법을 알아봅니다.</web-summary>

[Kotlin DataFrame 라이브러리](https://kotlin.github.io/dataframe/home.html)는 다음과 같이 가장 널리 사용되는 SQL 데이터베이스를 지원합니다:

* [DuckDB](https://kotlin.github.io/dataframe/duckdb.html)
* [H2](https://kotlin.github.io/dataframe/h2.html)
* [MariaDB](https://kotlin.github.io/dataframe/mariadb.html)
* [Microsoft SQL Server](https://kotlin.github.io/dataframe/microsoft-sql-server.html)
* [MySQL](https://kotlin.github.io/dataframe/mysql.html)
* [PostgreSQL](https://kotlin.github.io/dataframe/postgresql.html)
* [SQLite](https://kotlin.github.io/dataframe/sqlite.html)

[GitHub의 Kotlin DataFrame SQL 예제](https://github.com/zaleslaw/KotlinDataFrame-SQL-Examples/tree/master/src/main/kotlin)를 살펴보세요.

## 시작하기 전에 {id="before-you-start"}

> IntelliJ IDEA 2026.2부터는 Kotlin Notebook이 더 이상 IDE에 번들로 제공되지 않으며 JetBrains에서 공식적으로 지원하지 않습니다.
> 소스 코드는 계속해서 [GitHub](https://github.com/Kotlin/kotlin-notebook)에서 제공됩니다.
>
> 자세한 내용은 [블로그 게시물](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)을 참고하세요.
>
{style="note"}

이 튜토리얼을 진행하려면 다음을 따르세요:

1. **File** | **New** | **Kotlin Notebook**을 선택합니다.
2. 노트북의 첫 번째 셀에 사용할 데이터베이스의 JDBC(Java Database Connectivity) 드라이버 종속성을 추가합니다.

   예를 들어 MariaDB 데이터베이스에 연결하려면 다음을 추가합니다:

   ```kotlin 
   USE {
      dependencies("org.mariadb.jdbc:mariadb-java-client:$version")
   }
   ```
3. Kotlin DataFrame을 가져옵니다:

   ```kotlin
   %use dataframe
   ```

   노트북에서 DataFrame 라이브러리와 해당 API를 사용할 수 있도록 다른 어떤 코드 셀보다 먼저 `%use dataframe` 줄이 있는 코드 셀을 실행하세요.

이 튜토리얼은 DataFrame을 [Gradle](https://kotlin.github.io/dataframe/setupgradle.html) 또는 [Maven](https://kotlin.github.io/dataframe/setupmaven.html) 종속성으로 추가하여 진행할 수도 있습니다.

## 데이터베이스 연결 {id="connect-to-a-database"}

데이터베이스에 연결하려면 `DbConnectionConfig()` 함수를 사용하여 연결 구성을 생성합니다:

1. 다음 기능을 import합니다:

   ```kotlin
   import org.jetbrains.kotlinx.dataframe.io.DbConnectionConfig
   import org.jetbrains.kotlinx.dataframe.schema.DataFrameSchema
   ```

2. `DbConnectionConfig()` 함수를 사용하여 연결 매개변수(URL, 사용자 이름, 비밀번호)를 정의합니다:

   ```kotlin
   val URL = "YOUR_URL"
   val USER_NAME = "YOUR_USERNAME"
   val PASSWORD = "YOUR_PASSWORD"
   
   val dbConfig = DbConnectionConfig(URL, USER_NAME, PASSWORD)
   ```

> SQL 데이터베이스 연결에 대한 자세한 내용은 [Kotlin DataFrame 문서의 SQL 데이터베이스에서 읽기(Read from SQL databases)](https://kotlin.github.io/dataframe/readsqldatabases.html)를 참고하세요.
>
{style="tip"}

## 데이터베이스 스키마 검사 {id="inspect-database-schema"}

데이터를 로드하기 전에 데이터베이스 스키마를 검사하여 어떤 테이블이 있고 어떤 열(column)이 포함되어 있는지 확인하세요. 이 스키마를 확인하여 어떤 테이블을 DataFrame으로 로드할지 결정할 수 있습니다.

데이터베이스 내 모든 사용자 생성 테이블의 스키마를 조회하려면 `DataFrameSchema.readAllSqlTables()` 함수를 사용합니다:

```kotlin
val dataSchemas = DataFrameSchema.readAllSqlTables(dbConfig)

dataSchemas.forEach { (tableName, schema) ->
    println("---Schema for table: $tableName---")
    println(schema)
    println()
}
```

## 데이터 로드 {id="load-data"}

데이터베이스 스키마를 검사하고 데이터를 선택했다면, 데이터를 DataFrame으로 로드합니다.

Kotlin DataFrame은 데이터베이스에서 데이터를 로드하는 두 가지 방법을 제공합니다:

* 테이블에서 직접 데이터 로드.
* 사용자 정의 SQL 쿼리의 결과 로드.

두 방식 모두 검사, 변환 및 분석할 수 있는 DataFrame을 반환합니다.

### 테이블에서 데이터 로드 {id="load-data-from-a-table"}

테이블에서 데이터를 로드하려면 [`DataFrame.readSqlTable()`](https://kotlin.github.io/dataframe/readsqldatabases.html#reading-specific-tables) 함수를 사용합니다.

다음 예제는 `movies` 테이블에서 처음 100개 행을 로드합니다:

```kotlin
val moviesDf = DataFrame.readSqlTable(
    dbConfig = dbConfig,
    tableName = "movies",
    limit = 100
)

moviesDf
```

### SQL 쿼리로 데이터 로드 {id="load-data-with-an-sql-query"}

데이터베이스에서 특정 SQL 쿼리를 실행하려면 [`DataFrame.readSqlQuery()`](https://kotlin.github.io/dataframe/readsqldatabases.html#executing-sql-queries) 함수를 사용합니다.
이 방법은 특정 열만 로드하거나, 테이블을 조인하거나, 행을 필터링하거나, 데이터베이스 내에서 데이터를 집계해야 할 때 유용합니다.

쿠엔틴 타란티노(Quentin Tarantino) 감독이 연출한 영화와 관련된 특정 데이터셋을 조회해 보겠습니다.
이 쿼리는 영화 세부 정보를 선택하고 각 영화의 장르를 결합합니다:

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

## 데이터 처리 {id="process-data"}

데이터베이스 데이터를 DataFrame으로 로드한 후에는 DataFrame 연산을 사용하여 조회한 데이터를 처리할 수 있습니다.

예를 들어 이전 섹션의 데이터를 조작해 보겠습니다. 다음 코드는:
1. [`.fillNA()`](https://kotlin.github.io/dataframe/fill.html#fillna) 함수를 사용하여 `year` 열의 결측값(missing values)을 대체합니다.
2. [`.convert()`](https://kotlin.github.io/dataframe/convert.html) 함수를 사용하여 해당 열을 `Int`로 변환합니다.
3. [`.filter()`](https://kotlin.github.io/dataframe/filter.html) 함수를 사용하여 2000년 이후에 개봉한 영화만 유지합니다.

```kotlin
val filteredTarantinoMovies = tarantinoMoviesDf
    .fillNA { year }.with { 0 }
    .convert { year }.toInt()
    .filter { year > 2000 }

filteredTarantinoMovies
```

## 데이터 분석 {id="analyze-data"}

[DataFrame 라이브러리](https://kotlin.github.io/dataframe/home.html)를 사용하여 데이터를 그룹화하고, 정렬하고, 집계하여 데이터 속 패턴을 발견하고 파악할 수 있습니다.

예를 들어 `actors` 테이블에서 배우 데이터를 읽고 가장 흔한 이름(first name) 20개를 찾아보겠습니다:

```kotlin
// actors 테이블에서 데이터 추출
val actorDf = DataFrame.readSqlTable(dbConfig, "actors", 10000)
val top20ActorNames = actorDf
   // first_name 열을 기준으로 데이터 그룹화
   .groupBy { first_name }
   
   // 각 고유한 이름의 등장 횟수 계산
   .count()
   
   // 개수를 기준으로 내림차순 정렬
   .sortByDesc("count")
    
   // 분석을 위해 빈도가 가장 높은 상위 20개 이름 선택
   .take(20)
```

## 다음 단계 {id="what-s-next"}

* [Kandy 라이브러리](https://kotlin.github.io/kandy/examples.html)를 사용한 데이터 시각화 살펴보기
* [Kandy를 사용한 데이터 시각화](data-analysis-visualization.md)에서 데이터 시각화에 대한 추가 정보 확인하기
* Kotlin에서 데이터 과학 및 분석에 사용할 수 있는 도구와 리소스에 대한 포괄적인 개요는 [데이터 분석을 위한 Kotlin 및 Java 라이브러리](data-analysis-libraries.md)를 참고하세요.