[//]: # (title: 使用 Kandy 進行資料視覺化)
[//]: # (description: 了解如何透過建立折線圖、點狀圖和長條圖，使用 Kandy 和 Kotlin DataFrame 進行資料視覺化。)

Kotlin 為強大且靈活的資料視覺化提供了一站式解決方案，在深入研究複雜模型之前，提供了一種直觀的方式來呈現和探索資料。

本教學示範如何使用 IntelliJ IDEA 配合 [Kandy](https://kotlin.github.io/kandy/welcome.html) 和 [Kotlin DataFrame](https://kotlin.github.io/dataframe/home.html) 程式庫來建立不同的圖表類型。

## 開始之前

> 從 IntelliJ IDEA 2026.2 開始，Kotlin Notebook 將不再隨 IDE 內建，JetBrains 也不再官方支援。
> 原始碼將繼續保留在 [GitHub](https://github.com/Kotlin/kotlin-notebook) 上。
>
> 若要了解更多資訊，請參閱[部落格文章](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)。
>
{style="note"}

若要按照本教學進行操作：

1. 選取 **File** | **New** | **Kotlin Notebook**。
2. 在您的 notebook 中，匯入 [Kandy](https://kotlin.github.io/kandy/welcome.html) 和 [Kotlin DataFrame](https://kotlin.github.io/dataframe/home.html)：

   ```kotlin
   %use kandy
   %use dataframe
   ```

   在執行任何其他程式碼資料格之前，請先執行包含 `%use dataframe` 行的程式碼資料格，以確保 DataFrame 程式庫及其 API 在 notebook 中可用。

若要按照本教學操作，您也可以將 DataFrame 作為 [Gradle](https://kotlin.github.io/dataframe/setupgradle.html) 或 [Maven](https://kotlin.github.io/dataframe/setupmaven.html) 相依性使用。

## 建立 DataFrame

首先，讓我們建立一個包含要視覺化資料的 DataFrame。此 DataFrame 儲存了柏林、馬德里和卡拉卡斯三個城市模擬的每月平均氣溫：

```kotlin
// months 變數儲存包含一年 12 個月的列表
val months = listOf(
    "January", "February",
    "March", "April", "May",
    "June", "July", "August",
    "September", "October", "November",
    "December"
)
// tempBerlin、tempMadrid 和 tempCaracas 變數分別儲存
// 每個城市的每月氣溫值列表
val tempBerlin =
    listOf(-0.5, 0.0, 4.8, 9.0, 14.3, 17.5, 19.2, 18.9, 14.5, 9.7, 4.7, 1.0)
val tempMadrid =
    listOf(6.3, 7.9, 11.2, 12.9, 16.7, 21.1, 24.7, 24.2, 20.3, 15.4, 9.9, 6.6)
val tempCaracas =
    listOf(27.5, 28.9, 29.6, 30.9, 31.7, 35.1, 33.8, 32.2, 31.3, 29.4, 28.9, 27.6)
```

現在讓我們建立一個新變數 (`df`)，並使用 [`dataFrameOf()`](https://kotlin.github.io/dataframe/createdataframe.html#dataframeof) 函式來產生一個包含三欄（Month、Temperature 和 City）的 DataFrame：

```kotlin
val df = dataFrameOf(
    "Month" to months + months + months,
    "Temperature" to tempBerlin + tempMadrid + tempCaracas,
    "City" to List(12) { "Berlin" } + List(12) { "Madrid" } + List(12) { "Caracas" }
)
```
若要預覽資料，請使用 [`.head()`](https://kotlin.github.io/dataframe/head.html) 函式：

```kotlin
df.head(4) // 傳回前四列
```

在我們的資料集中，前四列儲存了柏林從一月到四月的氣溫：

![DataFrame 探索](visualization-dataframe-temperature.png){width=600}

> 存取欄位記錄有不同的選項，這可以幫助您在同時使用 Kandy 和 Kotlin DataFrame 程式庫時提高型別安全性。
> 若要了解更多資訊，請參閱[存取 API](https://kotlin.github.io/dataframe/apilevels.html)。
>
{style="tip"}

## 建立折線圖

讓我們使用上一節中的 `df` DataFrame 建立折線圖：

1. 呼叫 Kandy 程式庫中的 `.plot()` 函式。 
2. 套用 `line()` 圖層。 
3. 將 `Month` 和 `Temperature` 欄位分別對應到 `X` 軸和 `Y` 軸。
4. （選填）自訂顏色和大小。

```kotlin
df.plot {
   line {
      x(Month)
      y(Temperature)

      color(City) {
         scale = categorical(
            "Berlin" to Color.hex("#6F4E37"),
            "Madrid" to Color.hex("#C2D4AB"),
            "Caracas" to Color.hex("#B5651D")
         )
      }
      width = 1.5
   }
   layout {
      size = 1000 to 450
   }
}
```

這是結果：

![折線圖](visualization-line-chart.svg){width=600}

## 建立點狀圖

現在，讓我們在點狀（散佈）圖中視覺化 `df` DataFrame：

1. 呼叫 Kandy 程式庫中的 `.plot()` 函式。 
2. 套用 `points()` 圖層。 
3. 將 `Month` 和 `Temperature` 欄位分別對應到 `X` 軸和 `Y` 軸。
4. （選填）自訂顏色、軸標籤、點大小和圖表標題。

```kotlin
df.plot {
   points {
      x(Month) {
         axis.name = "Month"
      }
      y(Temperature) {
         axis.name = "Temperature"
      }

      color(City) {
         scale = categorical(
            "Berlin" to Color.hex("#6F4E37"),
            "Madrid" to Color.hex("#C2D4AB"),
            "Caracas" to Color.hex("#B5651D")
         )
      }
      size = 5.5
   }
   layout {
      title = "Temperature per month"
   }
}

```

這是結果：

![點狀圖](visualization-points-chart.svg){width=600}

## 建立長條圖

最後，讓我們為每個城市建立一個長條圖：

1. 使用 `.groupBy()` 函式依 `City` 欄位對 DataFrame 進行分組。 
2. 呼叫 Kandy 程式庫中的 `plot()` 函式。 
3. 套用 `bars()` 圖層。
4. （選填）新增圖表標題，自訂顏色。

```kotlin
df.groupBy { City }.plot {
    bars {
        x(Month)
        y(Temperature)
        
        fillColor(City) {
            scale = categorical(
                "Berlin" to Color.hex("#6F4E37"),
                "Madrid" to Color.hex("#C2D4AB"),
                "Caracas" to Color.hex("#B5651D")
            )
        }
    }
    layout.title {
       title = "Temperature per month"
    }
}
```

這是結果：

![長條圖](visualization-bar-chart.svg){width=600}

## 下一步

* 在 [Kandy 程式庫文件](https://kotlin.github.io/kandy/examples.html)中探索更多圖表範例
* 在 [Lets-Plot 程式庫文件](lets-plot.md)中探索更多進階繪圖選項
* 在 [Kotlin DataFrame 程式庫文件](https://kotlin.github.io/dataframe/info.html)中尋找有關建立、探索和管理 DataFrame 的其他資訊