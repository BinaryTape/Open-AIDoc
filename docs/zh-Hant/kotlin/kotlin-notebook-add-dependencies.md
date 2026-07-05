[//]: # (title: 為您的 Kotlin Notebook 新增相依性)

> 從 IntelliJ IDEA 2026.2 開始，Kotlin Notebook 將不再隨 IDE 隨附，JetBrains 也不再官方支援。
> 原始碼將繼續保留於 [GitHub](https://github.com/Kotlin/kotlin-notebook)。
>
> 欲了解更多資訊，請參閱 [部落格文章](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)。
>
{style="note"}

<tldr>
   <p>這是 <strong>Kotlin Notebook 快速入門</strong> 教學的第三部分。在繼續之前，請確保您已完成先前的步驟。</p>
   <p><img src="icon-1-done.svg" width="20" alt="第一步"/> <a href="kotlin-notebook-set-up-env.md">設定環境</a><br/>
      <img src="icon-2-done.svg" width="20" alt="第二步"/> <a href="kotlin-notebook-create.md">建立 Kotlin Notebook</a><br/>
      <img src="icon-3.svg" width="20" alt="第三步"/> <strong>為 Kotlin Notebook 新增相依性</strong><br/>
  </p>
</tldr>

您已經建立了第一個 [Kotlin Notebook](kotlin-notebook-overview.md)！現在讓我們學習如何新增程式庫的相依性，這對於解鎖進階功能至關重要。

> Kotlin 標準函式庫可以開箱即用，因此您不需要匯入它。
> 
{style="note"}

您可以透過在任何程式碼資料格中使用 Gradle 風格的語法指定其座標，從 Maven 存儲庫載入任何程式庫。
然而，Kotlin Notebook 提供了一種簡化方法，以 [`%use` 陳述式](https://www.jetbrains.com/help/idea/kotlin-notebook.html#import-libraries) 的形式載入熱門程式庫：

```kotlin
// 將 libraryName 替換為您要新增的程式庫相依性
%use libraryName
// 如果需要，請指定版本
%use libraryName(version)
// 新增 v= 以觸發自動補全
%use libraryName(v=version)
// 範例：kotlinx.datetime:0.7.1
%use datetime(v=0.7.1)
```

您也可以使用 Kotlin Notebook 中的自動補全功能來快速存取可用的程式庫：

![Kotlin Notebook 中的自動補全功能](autocompletion-feature-notebook.png){width=700}

> Kotlin Notebook 擁有一組整合的程式庫，可用於執行從深度學習到 HTTP 網路等各種任務。
> 請參閱 [匯入支援的程式庫](https://www.jetbrains.com/help/idea/kotlin-notebook.html#import-libraries)。
> 
> 您也可以新增並使用尚未整合到 Kotlin Notebook 中的程式庫。請參閱 [整合新程式庫](https://www.jetbrains.com/help/idea/kotlin-notebook.html#integrate-new-libraries)。
>
{style="note"}

## 為您的 Kotlin Notebook 新增 Kotlin DataFrame 和 Kandy 程式庫

讓我們為您的 Kotlin Notebook 新增兩個熱門的 Kotlin 程式庫相依性：
* [Kotlin DataFrame 程式庫](https://kotlin.github.io/dataframe/home.html) 讓您能夠在 Kotlin 專案中操作資料。
您可以使用它從 [API](data-analysis-work-with-api.md)、[SQL 資料庫](data-analysis-connect-to-db.md) 以及 [各種檔案格式](data-analysis-work-with-data-sources.md)（如 CSV 或 JSON）擷取資料。
* [Kandy 程式庫](https://kotlin.github.io/kandy/welcome.html) 提供了一個強大且靈活的 DSL，用於 [建立圖表](data-analysis-visualization.md)。

若要新增這些程式庫：

1. 點擊 **Add Code Cell** 以建立新的程式碼資料格。
2. 在程式碼資料格中輸入以下程式碼：

    ```kotlin
    // 確保使用最新可用的程式庫版本
    %useLatestDescriptors
    
    // 匯入 Kotlin DataFrame 程式庫
    %use dataframe
    
    // 匯入 Kotlin Kandy 程式庫
    %use kandy
    ```

3. 執行程式碼資料格。

   執行 `%use` 陳述式時，它會下載程式庫相依性並將預設匯入新增至您的 Notebook。

   > 在執行任何其他依賴該程式庫的程式碼資料格之前，請確保先執行包含 `%use libraryName` 行的程式碼資料格。
   >
   {style="note"}

4. 若要使用 Kotlin DataFrame 程式庫從 CSV 檔案匯入資料，請在新的程式碼資料格中使用 `.read()` 函式：

    ```kotlin
    // 透過從 "netflix_titles.csv" 檔案匯入資料來建立 DataFrame。
    val rawDf = DataFrame.read("netflix_titles.csv")
    
    // 顯示原始 DataFrame 資料
    rawDf
    ```

   > 您可以從 [Kotlin DataFrame 範例 GitHub 存儲庫](https://github.com/Kotlin/dataframe/blob/master/examples/notebooks/netflix/netflix_titles.csv) 下載此範例 CSV。
   > 將其新增至您的專案目錄。
   >
   {style="tip"}

   ![使用 DataFrame 顯示資料](add-dataframe-dependency.png){width=700}

5. 在新的程式碼資料格中，使用 `.plot` 方法來以視覺化方式呈現 DataFrame 中電視節目 (TV Shows) 和電影 (Movies) 的分佈：

    ```kotlin
    rawDf
        // 計算名為 "type" 的欄位中每個唯一值出現的次數
        .valueCounts(sort = false) { type }
        // 在指定顏色的條形圖中呈現資料
        .plot {
            bars {
                x(type)
                y("count")
                fillColor(type) {
                    scale = categorical(range = listOf(Color.hex("#00BCD4"), Color.hex("#009688")))
                }
            }
    
            // 配置圖表配置並設定標題
            layout {
                title = "Count of TV Shows and Movies"
                size = 900 to 550
            }
        }
    ```

生成的圖表：

![使用 Kandy 程式庫進行視覺化](kandy-library.png){width=700}

恭喜您在 Kotlin Notebook 中成功新增並利用了這些程式庫！
這只是您可以使用 Kotlin Notebook 及其 [支援的程式庫](data-analysis-libraries.md) 實現的功能之一。

## 下一步

* 學習如何 [分享您的 Kotlin Notebook](kotlin-notebook-share.md)
* 參閱有關 [為您的 Kotlin Notebook 新增相依性](https://www.jetbrains.com/help/idea/kotlin-notebook.html#add-dependencies) 的更多詳細資訊
* 如需使用 Kotlin DataFrame 程式庫的更廣泛指南，請參閱 [從檔案擷取資料](data-analysis-work-with-data-sources.md)
* 如需 Kotlin 資料科學與分析可用工具和資源的廣泛概覽，請參閱 [用於資料分析的 Kotlin 和 Java 程式庫](data-analysis-libraries.md)