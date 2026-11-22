[//]: # (title: 파일에서 데이터 가져오기)
<web-summary>CSV, JSON, SQL, Excel, Apache Arrow 파일을 포함하여 Kotlin DataFrame을 사용해 파일에서 데이터를 로드하는 방법을 알아봅니다.</web-summary>

[Kotlin DataFrame 라이브러리](https://kotlin.github.io/dataframe/home.html)를 사용하면 비정형 데이터와 정형 데이터 모두를 다룰 수 있습니다.
데이터 변환을 위해 [`.add()`](https://kotlin.github.io/dataframe/adddf.html), [`.split()`](https://kotlin.github.io/dataframe/split.html), [`.convert()`](https://kotlin.github.io/dataframe/convert.html), [`.parse()`](https://kotlin.github.io/dataframe/parse.html)와 같은 메서드를 사용할 수 있습니다.
또한 이 도구 모음을 통해 CSV, JSON, XLS, Parquet, Apache Arrow 등 다양한 정형 파일 형식에서 데이터를 가져오고 조작할 수 있습니다.
지원되는 모든 형식은 [DataFrame 문서](https://kotlin.github.io/dataframe/data-sources.html)에서 확인할 수 있습니다.

이 가이드에서는 여러 예제를 통해 데이터를 가져오고, 정제하고, 처리하는 방법을 알아봅니다.

## 시작하기 전에 {id="before-you-start"}

> IntelliJ IDEA 2026.2부터 Kotlin Notebook은 더 이상 IDE에 번들로 제공되지 않으며 JetBrains에서 공식적으로 지원하지 않습니다.
> 소스 코드는 [GitHub](https://github.com/Kotlin/kotlin-notebook)에서 계속 확인할 수 있습니다.
>
> 자세한 내용은 [블로그 게시물](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)을 참조하세요.
>
{style="note"}

이 튜토리얼을 따라 하려면 다음 단계를 진행하세요.

1. **File** | **New** | **Kotlin Notebook**을 선택합니다.
2. Kotlin DataFrame을 임포트합니다.

   ```kotlin
   %use dataframe
   ```

   노트북에서 DataFrame 라이브러리와 관련 API를 사용할 수 있도록 다른 코드 셀보다 먼저 `%use dataframe` 라인이 포함된 코드 셀을 실행하세요.

이 튜토리얼은 DataFrame을 [Gradle](https://kotlin.github.io/dataframe/setupgradle.html) 또는 [Maven](https://kotlin.github.io/dataframe/setupmaven.html) 종속성으로 추가하여 진행할 수도 있습니다.

## 데이터 가져오기 {id="retrieve-data"}

파일에서 데이터를 가져오려면 `DataFrame.read()` 함수를 사용합니다.

```kotlin
val movies = DataFrame.read("movies.csv")
```

`DataFrame.read()` 함수는 파일 확장자와 내용을 기반으로 입력 형식을 감지합니다.

DataFrame 라이브러리가 입력 데이터를 읽는 방식을 제어하기 위해 추가 인수를 전달할 수도 있습니다.
예를 들어, 다음 코드는 CSV 파일에 대해 사용자 지정 구분 기호(`;`)를 지정합니다.

```kotlin
val movies = DataFrame.read("movies.csv", delimiter = ';')
```

> 추가 파일 형식 및 다양한 읽기 함수에 대한 종합적인 개요는 [Kotlin DataFrame 라이브러리 문서](https://kotlin.github.io/dataframe/read.html)를 참조하세요.
> 
{style="tip"}

## 데이터 표시하기 {id="display-data"}

데이터를 가져온 후에는 화면에 표시할 수 있습니다. 가장 쉬운 방법은 데이터를 변수에 저장한 다음 해당 변수를 반환하는 것입니다.

```kotlin
val jsonDf = DataFrame.read("jsonFile.json")
jsonDf
```

이 코드는 파일의 데이터를 인터랙티브 테이블 형태로 표시합니다.

![Display data](display-data.png){width=700}

이 뷰를 사용하여 값을 검사하고, 열(column) 이름을 확인하며, 데이터 세트의 상태를 쉽게 파악할 수 있습니다.

## 데이터 구조 검사하기 {id="inspect-data-structure"}

데이터의 구조나 스키마를 파악하려면 DataFrame 변수에 [`.schema()`](https://kotlin.github.io/dataframe/schema.html) 함수를 사용하세요.

예를 들어, `jsonDf.schema()`를 실행하면 JSON 데이터 세트에 있는 각 열의 유형이 나열됩니다.

![Schema example](schema-data-analysis.png){width=700}

자동 완성 기능을 사용할 수도 있습니다. 이 기능을 통해 DataFrame의 속성에 빠르게 접근하고 조작할 수 있습니다. 데이터를 로드한 후 DataFrame 변수 뒤에 마침표(`.`)를 입력하기만 하면 사용 가능한 열 목록과 해당 유형을 확인할 수 있습니다.

![Available properties](auto-completion-data-analysis.png){width=700}

## 데이터 정제하기 {id="refine-data"}

Kotlin DataFrame은 데이터 세트를 정제하기 위한 다양한 연산을 제공합니다.
예를 들어 [그룹화(grouping)](https://kotlin.github.io/dataframe/group.html), [필터링(filtering)](https://kotlin.github.io/dataframe/filter.html), [업데이트(updating)](https://kotlin.github.io/dataframe/update.html), [새 열 추가(adding new columns)](https://kotlin.github.io/dataframe/add.html) 등이 있습니다. 이러한 함수는 데이터를 효과적으로 구성, 정리 및 변환할 수 있도록 해주므로 데이터 분석에 필수적입니다.

예를 들어 `movies.csv` 데이터 세트를 살펴보겠습니다. 이 데이터 세트는 영화 제목과 개봉 연도를 동일한 셀에 저장하고 있습니다. 분석을 더 쉽게 하기 위해 이 데이터 세트를 정제하는 것이 목표입니다.

1. **데이터 로드**

   `.read()` 함수를 사용하여 파일을 `DataFrame`으로 로드합니다.

   ```kotlin
   val movies = DataFrame.read("movies.csv")
   ```

2. **열 추가** 

   `title` 열에서 개봉 연도를 추출하기 위해 새로운 `year` 열을 추가합니다.

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

3. **값 업데이트**

   영화 제목에서 개봉 연도를 제거하기 위해 `title` 열을 업데이트합니다.

   ```kotlin
   val moviesTitle = moviesWithYear
       .update("title") {
           "\\s*\\(\\d{4}\\)\\s*$".toRegex().replace(title, "") 
   }
   
   moviesTitle
   ```

   이 코드는 영화 제목을 한 열에 유지하고 개봉 연도를 다른 열로 분리합니다.

4. **행 필터링**

   특정 데이터에 집중하려면 `.filter()` 함수를 사용합니다. 예를 들어 1986년 이후에 개봉한 영화만 유지하려면 다음과 같이 실행합니다.

   ```kotlin
   val newMovies = moviesTitle.filter { 
       year >= 1996 
   }
   
   newMovies
   ```

5. **열 제거**

   필요하지 않은 열을 제거하려면 `.remove()` 함수를 사용합니다.

   ```kotlin
   val refinedMovies = newMovies.remove { 
       movieID 
   }
   
   refinedMovies
   ```

비교를 위해 정제 전의 데이터 세트는 다음과 같습니다.

![Original dataset](original-dataset.png){width=700}

정제 후의 데이터 세트입니다.

![Data refinement result](refined-data.png){width=700}

> 추가 사용 사례와 자세한 예제는 [Kotlin Dataframe 예제](https://github.com/Kotlin/dataframe/tree/master/examples)를 참조하세요.
> 
{style="tip"}

## 데이터 내보내기 {id="export-data"}

데이터를 정제한 후에는 쉽게 내보낼 수 있습니다.

이를 위해 다양한 [`.write()`](https://kotlin.github.io/dataframe/write.html) 함수를 활용할 수 있습니다. CSV, JSON, XLS, XLSX, Apache Arrow 및 HTML 테이블을 포함한 여러 형식으로의 저장을 지원합니다.
지원되는 모든 형식은 [DataFrame 문서](https://kotlin.github.io/dataframe/data-sources.html)에서 확인할 수 있습니다.
이는 결과를 공유하거나, 보고서를 작성하거나, 추가 분석을 위해 데이터를 제공하는 데 특히 유용합니다.

예를 들어, 결과를 다음과 같이 저장해 보겠습니다.

* [`.writeJson()`](https://kotlin.github.io/dataframe/write.html#writing-to-json) 함수를 사용하는 JSON 파일:

  ```kotlin
  refinedMovies.writeJson("movies.json")
  ```
* [`.writeCsv()`](https://kotlin.github.io/dataframe/write.html#writing-to-csv) 함수를 사용하는 CSV 파일: 

  ```kotlin
  refinedMovies.writeCsv("movies.csv")
  ```

* `.writeArrorIPC()` 및 `.writeArrorFeather()` 함수를 사용하는 [Apache Arrow 파일](https://kotlin.github.io/dataframe/write.html#writing-to-apache-arrow-formats):

  ```kotlin
  refinedMovies.writeArrowIPC("movies.arrow")
  refinedMovies.writeArrowFeather("movies.feather")
  ```

[`.toStandaloneHTML()`](https://kotlin.github.io/dataframe/tohtml.html) 함수를 사용하여 브라우저에서 독립형 HTML 테이블로 열 수도 있습니다.

```kotlin
refinedMoviesDf
    .toStandaloneHTML(DisplayConfiguration(rowsLimit = null))
    .openInBrowser()
```

## 다음 단계 {id="what-s-next"}

* [Kandy 라이브러리](https://kotlin.github.io/kandy/examples.html)를 사용하여 데이터 시각화 살펴보기
* [Kandy를 사용한 데이터 시각화](data-analysis-visualization.md)에서 데이터 시각화에 대한 추가 정보 확인하기
* Kotlin 기반 데이터 과학 및 분석을 위한 도구와 리소스에 대한 폭넓은 개요는 [데이터 분석을 위한 Kotlin 및 Java 라이브러리](data-analysis-libraries.md)를 참조하세요.