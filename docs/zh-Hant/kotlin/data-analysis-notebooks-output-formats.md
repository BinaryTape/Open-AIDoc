[//]: # (title: Kotlin Notebook 支援的輸出格式)

> 從 IntelliJ IDEA 2026.2 開始，Kotlin Notebook 將不再與 IDE 隨附，也不再由 JetBrains 正式支援。
> 原始碼將繼續保留在 [GitHub](https://github.com/Kotlin/kotlin-notebook) 上。
>
> 若要了解更多，請參閱 [部落格文章](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)。
>
{style="note"}

[Kotlin Notebook](kotlin-notebook-overview.md) 支援多種輸出類型，包括文字、HTML 和影像。藉助外部程式庫，您可以擴充輸出選項，並使用圖表、試算表等將資料視覺化。

每個輸出都是一個 JSON 物件，將 [Jupyter MIME 型別](https://jupyterlab.readthedocs.io/en/latest/user/file_formats.html) 對應到某些資料。Kotlin Notebook 會從此對應中選擇在其他型別中具有最高優先級的受支援 MIME 型別，並按如下方式渲染：

* [文字](#texts) 使用 `text/plain` MIME 型別。
* [BufferedImage 類別](#buffered-images) 使用對應到 Base64 字串的 `image/png` MIME 型別。
* [Image 類別](#loaded-images) 以及 [LaTeX 格式](#math-formulas-and-equations) 使用內部包含 `img` 標籤的 `text/html` MIME 型別。
* [Kotlin DataFrame 表格](#data-frames) 和 [Kandy 繪圖](#charts) 使用其內部的 MIME 型別，這些型別由靜態 HTML 或影像支援。這樣，您就可以在 GitHub 上顯示它們。

您可以手動設定對應，例如，將 Markdown 用作資料格輸出：

```kotlin
MimeTypedResult(
    mapOf(
        "text/plain" to "123",
        "text/markdown" to "# HEADER",
        //other mime:value pairs
    )
)
```

要顯示任何類型的輸出，請使用 `DISPLAY()` 函式。它還能組合多個輸出：

```kotlin
DISPLAY(HTML("<h2>Gaussian distribution</h2>"))
DISPLAY(LATEX("f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} \\cdot e^{-\\frac{(x - \\mu)^2}{2\\sigma^2}}"))

val experimentX = experimentData.map { it.key }
val experimentY = experimentData.map { it.value }

DISPLAY(plot {
    bars {
        x(experimentX)
        y(experimentY)
    }
})
```

![高斯分佈的不同輸出](gaussian-distribution-output.png){width=700}

## 文字 (Texts)

### 純文字 (Plain text)

最簡單的輸出類型是純文字。它用於列印陳述式、變數值或程式碼中任何基於文字的輸出：

```kotlin
val a1: Int = 1
val a2: Int = 2
var a3: Int? = a1 + a2

"My answer is $a3"
```

![純文字程式碼輸出](plain-text-output.png){width=300}

* 如果資料格的結果無法被 [渲染](https://github.com/Kotlin/kotlin-jupyter?tab=readme-ov-file#rendering) 並顯示為任何輸出類型，它將使用 `toString()` 函式列印為純文字。
* 如果您的程式碼包含錯誤，Kotlin Notebook 會顯示錯誤訊息和回溯 (traceback)，為偵錯提供分析。

### 豐富文字 (Rich text)

選擇 Markdown 類型的資料格以使用豐富文字。這樣，您就可以使用 Markdown 和 HTML 標記來格式化內容，使用清單、表格、字型樣式、程式碼區塊等。HTML 可以包含 CSS 樣式和 JavaScript。

```none
## Line magics

| Spell                              | Description                                                                                                      | Example                                                                               |
|------------------------------------|------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------|
| <code>%use</code>                  | Injects code for supported libraries: artifact resolution, default imports, initialization code, type renderers. | <code>%use klaxon(5.5), lets-plot</code>                                              |                                         
| <code>%trackClasspath</code>       | Logs any changes of current classpath. Useful for debugging artifact resolution failures.                        | <code>%trackClasspath [on |off]</code>                                                |
| <code>%trackExecution</code>       | Logs pieces of code that are going to be executed. Useful for debugging of libraries support.                    | <code>%trackExecution [all|generated|off]</code>                                      |          
| <code>%useLatestDescriptors</code> | Use latest versions of library descriptors available. By default, bundled descriptors are used.                  | <code>%useLatestDescriptors [on|off]</code>                                           |
| <code>%output</code>               | Output capturing settings.                                                                                       | <code>%output --max-cell-size=1000 --no-stdout --max-time=100 --max-buffer=400</code> |
| <code>%logLevel</code>             | Set logging level.                                                                                               | <code>%logLevel [off|error|warn|info|debug]</code>                                    |

<ul><li><a href="https://github.com/Kotlin/kotlin-jupyter/blob/master/docs/magics.md">進一步了解關於 line magics 的詳細資訊</a>。</li>
<li><a href="https://github.com/Kotlin/kotlin-jupyter/blob/master/docs/magics.md">查看受支援程式庫的完整清單</a>。</li></ul>
```

![Markdown 資料格中的豐富文字](markdown-cells-output.png){width=700}

## HTML

Kotlin Notebook 可以直接渲染 HTML，執行指令碼甚至嵌入網站：

```none
HTML("""
<p>Counter: <span id="ctr">0</span> <button onclick="inc()">Increment</button></p>
<script>
    function inc() {
        let counter = document.getElementById("ctr")
        counter.innerHTML = parseInt(counter.innerHTML) + 1;
}
</script>
""")
```

![使用 HTML 指令碼](direct-html-output.png){width=300}

> 在檔案頂部將您的筆記本標示為 **受信任 (Trusted)** 以執行指令碼。
>
{style="note"}

## 影像 (Images)

藉助 Kotlin Notebook，您可以顯示來自檔案的影像、產生的圖形或任何其他視覺媒體。靜態影像可以按 `.png`、`jpeg` 和 `.svg` 等格式顯示。

### 緩衝影像 (Buffered images)

預設情況下，您可以使用 `BufferedImage` 類別來顯示影像：

```kotlin
import java.awt.Color
import java.awt.image.BufferedImage

val width = 300
val height = width

val image = BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB)

val graphics = image.createGraphics()
graphics.background = Color.BLACK
graphics.clearRect(0, 0, width, height)
graphics.setRenderingHint(
    java.awt.RenderingHints.KEY_ANTIALIASING,
    java.awt.RenderingHints.VALUE_ANTIALIAS_ON
)
graphics.color = Color.WHITE
graphics.fillRect(width / 10, height * 8 / 10, width * 10 / 20, height / 10)
graphics.dispose()
```

![使用預設 BufferedImage 顯示影像](bufferedimage-output.png){width=400}

### 已載入影像 (Loaded images)

藉助 `lib-ext` 程式庫，您可以擴充標準的 Jupyter 功能並顯示從網路載入的影像：

```none
%use lib-ext(0.11.0-398)
```

```kotlin
Image("https://kotlinlang.org/docs/images/kotlin-logo.png", embed = false).withWidth(300)
```

![使用外部影像連結](external-images-output.png){width=400}

### 嵌入影像 (Embedded images)

從網路載入影像的一個缺點是，如果連結失效或失去網路連線，影像就會消失。為了避免這種情況，請使用嵌入影像，例如：

```kotlin
val kotlinMascot = Image("https://blog.jetbrains.com/wp-content/uploads/2023/04/DSGN-16174-Blog-post-banner-and-promo-materials-for-post-about-Kotlin-mascot_3.png", embed = true).withWidth(400)
kotlinMascot
```

![使用嵌入影像](embedded-images-output.png){width=400}

## 數學公式與方程式 (Math formulas and equations)

您可以利用 LaTeX 格式渲染數學公式和方程式，這是一種在學術界廣泛使用的排版系統：

1. 將擴充 Jupyter 核心功能的 `lib-ext` 程式庫新增到您的筆記本中：

   ```none
   %use lib-ext(0.11.0-398)
   ```

2. 在新資料格中執行您的公式：

   ```none
   LATEX("c^2 = a^2 + b^2 - 2 a b \\cos\\alpha")
   ```

   ![使用 LaTeX 渲染數學公式](latex-output.png){width=300}

## 資料框 (Data frames)

藉助 Kotlin Notebook，您可以使用資料框 (data frame) 將結構化資料視覺化：

1. 將 [Kotlin DataFrame](https://kotlin.github.io/dataframe/home.html) 程式庫新增到您的筆記本中：

   ```none
   %use dataframe
   ```

2. 建立資料框並在新資料格中執行它：

   ```kotlin
   val months = listOf(
       "January", "February",
       "March", "April", "May",
       "June", "July", "August",
       "September", "October", "November",
       "December"
   )

   // 不同產品和月份的銷售資料：
   val salesLaptop = listOf(120, 130, 150, 180, 200, 220, 240, 230, 210, 190, 160, 140)
   val salesSmartphone = listOf(90, 100, 110, 130, 150, 170, 190, 180, 160, 140, 120, 100)
   val salesTablet = listOf(60, 70, 80, 90, 100, 110, 120, 110, 100, 90, 80, 70)
    
   // 包含月份 (Month)、銷售額 (Sales) 和產品 (Product) 欄位的資料框
   val dfSales = dataFrameOf(
       "Month" to months + months + months,
       "Sales" to salesLaptop + salesSmartphone + salesTablet,
       "Product" to List(12) { "Laptop" } + List(12) { "Smartphone" } + List(12) { "Tablet" },
   )
   ```

   該資料框使用 `dataFrameOf()` 函式，並包含在 12 個月期間銷售的產品（筆記型電腦、智慧型手機和平板電腦）數量。

3. 探索資料框中的資料，例如尋找銷售額最高的產品和月份：

   ```none
   dfSales.maxBy("Sales")
   ```

   ![使用資料框將資料視覺化](dataframe-output.png){width=500}

4. 您也可以將資料框匯出為 CSV 檔案：

   ```kotlin
   // 將您的資料匯出為 CSV 格式
   dfSales.writeCSV("sales-stats.csv")
   ```

## 圖表 (Charts)

您可以直接在 Kotlin Notebook 中建立各種圖表，將資料視覺化：

1. 將 [Kandy](https://kotlin.github.io/kandy/welcome.html) 繪圖程式庫新增到您的筆記本中：

   ```none
   %use kandy
   ```

2. 使用相同的資料框並在新資料格中執行 `plot()` 函式：

   ```kotlin
   val salesPlot = dfSales.groupBy { Product }.plot {
       bars {
           // 存取用於 X 軸和 Y 軸的資料框欄位
           x(Month)
           y(Sales)
           // 存取用於類別的資料框欄位，並為這些類別設定顏色
           fillColor(Product) {
               scale = categorical(
                   "Laptop" to Color.PURPLE,
                   "Smartphone" to Color.ORANGE,
                   "Tablet" to Color.GREEN
               )
               legend.name = "Product types"
           }
       }
       // 自訂圖表的外觀
       layout.size = 1000 to 450
       layout.title = "Yearly Gadget Sales Results"
   }

   salesPlot
   ```

   ![使用 Kandy 渲染視覺化資料](kandy-output.png){width=700}

3. 您也可以按 `.png`、`jpeg`、`.html` 或 `.svg` 格式匯出繪圖：

   ```kotlin
   // 指定圖表檔案的輸出格式：
   salesPlot.save("sales-chart.svg")
   ```

## 接下來的內容

* [使用 DataFrame 和 Kandy 程式庫將資料視覺化](data-analysis-visualization.md)
* [進一步了解在 Kotlin Notebook 中渲染和顯示豐富輸出](https://www.jetbrains.com/help/idea/kotlin-notebook.html#render-rich-output)
* [從 CSV 和 JSON 檔案擷取資料](data-analysis-work-with-data-sources.md)
* [查看推薦程式庫清單](data-analysis-libraries.md)