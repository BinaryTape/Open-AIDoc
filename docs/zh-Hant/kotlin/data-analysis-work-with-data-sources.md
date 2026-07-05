[//]: # (title: 從檔案獲取資料)
[//]: # (description: 了解如何使用 Kotlin DataFrame 從檔案載入資料，包含 CSV、JSON、SQL、Excel 與 Apache Arrow 檔案。)

[Kotlin DataFrame 程式庫](https://kotlin.github.io/dataframe/home.html)讓您能夠處理非結構化與結構化資料。
對於資料轉換，您可以使用 [`.add()`](https://kotlin.github.io/dataframe/adddf.html)、[`.split()`](https://kotlin.github.io/dataframe/split.html)、[`.convert()`](https://kotlin.github.io/dataframe/convert.html) 以及 [`.parse()`](https://kotlin.github.io/dataframe/parse.html) 等方法。 
此外，此工具集還能獲取與操作來自各種結構化檔案格式的資料，包括 CSV、JSON、XLS、Parquet 和 Apache Arrow。 
請參閱 [DataFrame 文件](https://kotlin.github.io/dataframe/data-sources.html)以了解所有支援的格式。

在本指南中，您可以透過多個範例學習如何獲取、調整與處理資料。

## 開始之前

> 自 IntelliJ IDEA 2026.2 開始，Kotlin Notebook 將不再隨 IDE 隨附，也不再由 JetBrains 正式支援。
> 原始碼將繼續在 [GitHub](https://github.com/Kotlin/kotlin-notebook) 上提供。
>
> 在[部落格文章](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)中進一步了解。
>
{style="note"}

若要進行本教學：

1. 選取 **File** | **New** | **Kotlin Notebook**。
2. 匯入 Kotlin DataFrame：

   ```kotlin
   %use dataframe
   ```

   請在執行任何其他程式碼資料格之前，先執行包含 `%use dataframe` 這一行的程式碼資料格，以確保 DataFrame 程式庫及其 API 在筆記本中可用。

若要進行本教學，您也可以將 DataFrame 作為 [Gradle](https://kotlin.github.io/dataframe/setupgradle.html) 或 [Maven](https://kotlin.github.io/dataframe/setupmaven.html) 相依性使用。

## 獲取資料

若要將檔案中的資料獲取到您的 Kotlin Notebook 中，請使用 `DataFrame.read()` 函式：

```kotlin
val movies = DataFrame.read("movies.csv")
```

`DataFrame.read()` 函式會根據檔案副檔名和內容自動偵測輸入格式。

您還可以傳遞額外的引數來控制 DataFrame 程式庫讀取輸入資料的方式。
例如，以下程式碼為 CSV 檔案指定了自訂的分隔符號 (`;`)：

```kotlin
val movies = DataFrame.read("movies.csv", delimiter = ';')
```

> 如需其他檔案格式的全面概覽以及各種讀取函式，請參閱 [Kotlin DataFrame 程式庫文件](https://kotlin.github.io/dataframe/read.html)。
> 
{style="tip"}

## 顯示資料

一旦您獲取了資料，就可以將其顯示出來。最簡單的方法是將資料儲存在變數中，然後將其傳回：

```kotlin
val jsonDf = DataFrame.read("jsonFile.json")
jsonDf
```

這段程式碼會將檔案中的資料顯示為互動式表格：

![顯示資料](display-data.png){width=700}

您可以使用此檢視來檢查值、確認欄位名稱，並輕鬆了解資料集的狀態。

## 檢查資料結構

若要深入了解資料的結構或架構，請對您的 DataFrame 變數套用 [`.schema()`](https://kotlin.github.io/dataframe/schema.html) 函式。 

例如，執行 `jsonDf.schema()` 來列出您 JSON 資料集中每個欄位的型別：

![架構範例](schema-data-analysis.png){width=700}

您還可以使用自動補全功能。它讓您能快速存取並操作 DataFrame 的屬性。載入資料後，只需輸入 DataFrame 變數後接一個點號 (`.`)，即可查看可用欄位及其型別的清單。

![可用屬性](auto-completion-data-analysis.png){width=700}

## 調整資料

Kotlin DataFrame 提供了各種調整資料集的操作。 
例如：[群組](https://kotlin.github.io/dataframe/group.html)、[篩選](https://kotlin.github.io/dataframe/filter.html)、[更新](https://kotlin.github.io/dataframe/update.html)或[新增新欄位](https://kotlin.github.io/dataframe/add.html)。這些函式對於資料分析至關重要，讓您能有效地組織、清理與轉換資料。

例如，讓我們看看 `movies.csv` 資料集。它在同一個資料格中儲存了電影標題和上映年份。目標是調整此資料集以便於分析：

1. **載入資料**

   使用 `.read()` 函式將檔案載入到 `DataFrame` 中：

   ```kotlin
   val movies = DataFrame.read("movies.csv")
   ```

2. **新增欄位** 

   若要從 `title` 欄位中提取上映年份，請新增一個新的 `year` 欄位：

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

   若要從電影標題中移除上映年份，請更新 `title` 欄位：

   ```kotlin
   val moviesTitle = moviesWithYear
       .update("title") {
           "\\s*\\(\\d{4}\\)\\s*$".toRegex().replace(title, "") 
   }
   
   moviesTitle
   ```

   這段程式碼會將電影標題保留在一個欄位，並將上映年份移至另一個欄位。

4. **篩選資料列**

   若要專注於特定資料，請使用 `.filter()` 函式。例如，若要僅保留 1986 年之後上映的電影，請執行：

   ```kotlin
   val newMovies = moviesTitle.filter { 
       year >= 1996 
   }
   
   newMovies
   ```

5. **移除欄位**

   若要移除不需要的欄位，請使用 `.remove()` 函式：

   ```kotlin
   val refinedMovies = newMovies.remove { 
       movieID 
   }
   
   refinedMovies
   ```

作為對照，這是調整前的資料集：

![原始資料集](original-dataset.png){width=700}

調整後的資料集：

![資料調整結果](refined-data.png){width=700}

> 如需更多使用案例與詳細範例，請參閱 [Kotlin Dataframe 範例](https://github.com/Kotlin/dataframe/tree/master/examples)。
> 
{style="tip"}

## 匯出資料

在調整資料後，您可以輕鬆地匯出處理後的資料。

您可以為此目的利用各種 [`.write()`](https://kotlin.github.io/dataframe/write.html) 函式。它支援儲存為多種格式，包括 CSV、JSON、XLS、XLSX、Apache Arrow，甚至是 HTML 表格。 
請參閱 [DataFrame 文件](https://kotlin.github.io/dataframe/data-sources.html)以了解所有支援的格式。
這對於分享您的發現、建立報告或讓您的資料可用於進一步分析特別有用。

例如，讓我們將結果儲存為：

* 使用 [`.writeJson()`](https://kotlin.github.io/dataframe/write.html#writing-to-json) 函式的 JSON 檔案：

  ```kotlin
  refinedMovies.writeJson("movies.json")
  ```
* 使用 [`.writeCsv()`](https://kotlin.github.io/dataframe/write.html#writing-to-csv) 函式的 CSV 檔案： 

  ```kotlin
  refinedMovies.writeCsv("movies.csv")
  ```

* 使用 `.writeArrorIPC()` 和 `.writeArrorFeather()` 函式的 [Apache Arrow 檔案](https://kotlin.github.io/dataframe/write.html#writing-to-apache-arrow-formats)：

  ```kotlin
  refinedMovies.writeArrowIPC("movies.arrow")
  refinedMovies.writeArrowFeather("movies.feather")
  ```

您還可以使用 [`.toStandaloneHTML()`](https://kotlin.github.io/dataframe/tohtml.html) 函式在瀏覽器中開啟獨立的 HTML 表格：

```kotlin
refinedMoviesDf
    .toStandaloneHTML(DisplayConfiguration(rowsLimit = null))
    .openInBrowser()
```

## 接續步驟

* 使用 [Kandy 程式庫](https://kotlin.github.io/kandy/examples.html)探索資料視覺化
* 在[使用 Kandy 進行資料視覺化](data-analysis-visualization.md)中尋找有關資料視覺化的更多資訊
* 如需 Kotlin 中可用於資料科學與分析之工具與資源的廣泛概覽，請參閱 [Kotlin 與 Java 資料分析程式庫](data-analysis-libraries.md)