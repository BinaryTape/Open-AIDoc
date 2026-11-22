[//]: # (title: 從檔案擷取資料)
<web-summary>了解如何使用 Kotlin DataFrame 從檔案載入資料，包括 CSV、JSON、SQL、Excel 和 Apache Arrow 檔案。</web-summary>

[Kotlin DataFrame 程式庫](https://kotlin.github.io/dataframe/home.html)讓你能處理非結構化與結構化資料。
進行資料轉換時，你可以使用如 [`.add()`](https://kotlin.github.io/dataframe/adddf.html)、[`.split()`](https://kotlin.github.io/dataframe/split.html)、[`.convert()`](https://kotlin.github.io/dataframe/convert.html) 以及 [`.parse()`](https://kotlin.github.io/dataframe/parse.html) 等方法。
此外，這個工具集還能從各種結構化檔案格式中擷取與操作資料，包括 CSV、JSON、XLS、Parquet 和 Apache Arrow。
請參閱 [DataFrame 文件](https://kotlin.github.io/dataframe/data-sources.html)以查看所有支援的格式。

在本指南中，你可以透過多個範例學習如何擷取、整理與處理資料。

## 開始之前 {id="before-you-start"}

> 自 IntelliJ IDEA 2026.2 起，Kotlin Notebook 將不再隨 IDE 隨附提供，亦不再由 JetBrains 正式支援。
> 原始碼仍可在 [GitHub](https://github.com/Kotlin/kotlin-notebook) 上取得。
>
> 請在[部落格文章](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)中了解更多資訊。
>
{style="note"}

若要按照本教學進行操作：

1. 選取 **File** | **New** | **Kotlin Notebook**。
2. 匯入 Kotlin DataFrame：

   ```kotlin
   %use dataframe
   ```

   在執行任何其他程式碼資料格之前，請先執行包含 `%use dataframe` 的程式碼資料格，以確保 DataFrame 程式庫及其 API 在 Notebook 中可用。

若要按照本教學操作，你也可以將 DataFrame 作為 [Gradle](https://kotlin.github.io/dataframe/setupgradle.html) 或 [Maven](https://kotlin.github.io/dataframe/setupmaven.html) 相依項使用。

## 擷取資料 {id="retrieve-data"}

若要從檔案擷取資料，請使用 `DataFrame.read()` 函式：

```kotlin
val movies = DataFrame.read("movies.csv")
```

`DataFrame.read()` 函式會根據副檔名與內容偵測輸入格式。

你也可以傳入額外引數來控制 DataFrame 程式庫讀取輸入資料的方式。
例如，以下程式碼為 CSV 檔案指定了自訂分隔符號（`;`）：

```kotlin
val movies = DataFrame.read("movies.csv", delimiter = ';')
```

> 若要全面了解其他檔案格式和各種讀取函式，請參閱 [Kotlin DataFrame 程式庫文件](https://kotlin.github.io/dataframe/read.html)。
> 
{style="tip"}

## 顯示資料 {id="display-data"}

取得資料後，即可將其顯示。最簡單的方法是將資料儲存在變數中，然後傳回該變數：

```kotlin
val jsonDf = DataFrame.read("jsonFile.json")
jsonDf
```

此程式碼會將檔案中的資料顯示為互動式表格：

![顯示資料](display-data.png){width=700}

你可以使用此檢視來檢查值、檢驗欄名稱，並輕鬆了解資料集的狀態。

## 檢查資料結構 {id="inspect-data-structure"}

若要深入了解資料的結構或架構，請在 DataFrame 變數上使用 [`.schema()`](https://kotlin.github.io/dataframe/schema.html) 函式。

例如，執行 `jsonDf.schema()` 可列出 JSON 資料集中每個欄的型別：

![結構描述範例](schema-data-analysis.png){width=700}

你也可以使用自動補全功能。它讓你能快速存取與操作 DataFrame 的屬性。載入資料後，只需鍵入 DataFrame 變數並接著輸入句號（`.`），即可查看可用欄及其型別的清單。

![可用屬性](auto-completion-data-analysis.png){width=700}

## 整理資料 {id="refine-data"}

Kotlin DataFrame 提供了多種用於整理資料集的操作。例如[分組](https://kotlin.github.io/dataframe/group.html)、[篩選](https://kotlin.github.io/dataframe/filter.html)、[更新](https://kotlin.github.io/dataframe/update.html)或[新增欄](https://kotlin.github.io/dataframe/add.html)。這些函式對於資料分析至關重要，能讓你有效地組織、清理與轉換資料。

例如，我們來看看 `movies.csv` 資料集。它將電影標題與上映年份儲存在同一個儲存格中。目標是整理這個資料集以利於進行分析：

1. **載入資料**

   使用 `.read()` 函式將檔案載入到 `DataFrame` 中：

   ```kotlin
   val movies = DataFrame.read("movies.csv")
   ```

2. **新增欄** 

   若要從 `title` 欄中擷取上映年份，請新增一個 `year` 欄：

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

   若要從電影標題中移除上映年份，請更新 `title` 欄：

   ```kotlin
   val moviesTitle = moviesWithYear
       .update("title") {
           "\\s*\\(\\d{4}\\)\\s*$".toRegex().replace(title, "") 
   }
   
   moviesTitle
   ```

   該程式碼將電影標題保留在一個欄中，並將上映年份移至另一個欄。

4. **篩選資料列**

   若要聚焦於特定資料，請使用 `.filter()` 函式。例如，若要僅保留 1986 年之後上映的電影，請執行：

   ```kotlin
   val newMovies = moviesTitle.filter { 
       year >= 1996 
   }
   
   newMovies
   ```

5. **移除欄**

   若要移除不需要的欄，請使用 `.remove()` 函式：

   ```kotlin
   val refinedMovies = newMovies.remove { 
       movieID 
   }
   
   refinedMovies
   ```

為了進行比較，以下是整理前的資料集：

![原始資料集](original-dataset.png){width=700}

整理後的資料集：

![資料整理結果](refined-data.png){width=700}

> 若要了解其他使用案例與詳細範例，請參閱 [Examples of Kotlin Dataframe](https://github.com/Kotlin/dataframe/tree/master/examples)。
> 
{style="tip"}

## 匯出資料 {id="export-data"}

整理資料後，你可以輕鬆地匯出資料。

為此，你可以使用各種 [`.write()`](https://kotlin.github.io/dataframe/write.html) 函式。它支援儲存為多種格式，包括 CSV、JSON、XLS、XLSX、Apache Arrow 甚至是 HTML 表格。請參閱 [DataFrame 文件](https://kotlin.github.io/dataframe/data-sources.html)以查看所有支援的格式。這對於分享分析發現、建立報告或提供資料以進行進一步分析特別有用。

例如，我們將結果儲存為：

* 使用 [`.writeJson()`](https://kotlin.github.io/dataframe/write.html#writing-to-json) 函式儲存為 JSON 檔案：

  ```kotlin
  refinedMovies.writeJson("movies.json")
  ```
* 使用 [`.writeCsv()`](https://kotlin.github.io/dataframe/write.html#writing-to-csv) 函式儲存為 CSV 檔案：

  ```kotlin
  refinedMovies.writeCsv("movies.csv")
  ```

* 使用 `.writeArrorIPC()` 和 `.writeArrorFeather()` 函式儲存為 [Apache Arrow 檔案](https://kotlin.github.io/dataframe/write.html#writing-to-apache-arrow-formats)：

  ```kotlin
  refinedMovies.writeArrowIPC("movies.arrow")
  refinedMovies.writeArrowFeather("movies.feather")
  ```

你還可以使用 [`.toStandaloneHTML()`](https://kotlin.github.io/dataframe/tohtml.html) 函式在瀏覽器中開啟獨立的 HTML 表格：

```kotlin
refinedMoviesDf
    .toStandaloneHTML(DisplayConfiguration(rowsLimit = null))
    .openInBrowser()
```

## 後續步驟 {id="what-s-next"}

* 使用 [Kandy 程式庫](https://kotlin.github.io/kandy/examples.html)探索資料視覺化
* 在[使用 Kandy 進行資料視覺化](data-analysis-visualization.md)中尋找有關資料視覺化的更多資訊
* 若要深入了解 Kotlin 中可用於資料科學與分析的工具和資源，請參閱[用於資料分析的 Kotlin 和 Java 程式庫](data-analysis-libraries.md)