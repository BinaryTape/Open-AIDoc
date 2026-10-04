[//]: # (title: 程式庫與 API)

<no-index/>

為了充分發揮 Kotlin 的優勢，請使用現有的程式庫和 API，這樣你就可以將更多時間花在編寫程式碼上，減少重新造輪子的時間。

程式庫分發可重複使用的程式碼，以簡化常見任務。在程式庫中，有將相關類別、函式和公用程式分組的套件與物件。程式庫將 API（應用程式開發介面，Application Programming Interfaces）公開為一組函式、類別或屬性，開發人員可以在其程式碼中使用。

![Kotlin libraries and APIs](kotlin-library-diagram.svg){width=600}

讓我們來探索 Kotlin 能做到什麼。

## 標準程式庫 {id="the-standard-library"}

Kotlin 擁有一個標準程式庫，提供基本的型別、函式、集合和公用程式，使你的程式碼更加簡潔且富有表現力。標準程式庫的大部分內容（[`kotlin` 套件](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/)中的所有內容）都可以直接在任何 Kotlin 檔案中使用，而無需明確匯入：

```kotlin
fun main() {
    val text = "emosewa si niltoK"
    
   // 使用標準程式庫中的 reversed() 函式
    val reversedText = text.reversed()

    // 使用標準程式庫中的 print() 函式
    print(reversedText)
    // Kotlin is awesome
}
```
{kotlin-runnable="true" id="kotlin-tour-libraries-stdlib"}

然而，標準程式庫的某些部分需要先匯入才能在程式碼中使用。例如，如果你想使用標準程式庫的時間測量功能，則需要匯入 [`kotlin.time` 套件](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/)。

在檔案頂部，加入 `import` 關鍵字，後接你需要的套件：

```kotlin
import kotlin.time.*
```

星號 `*` 是一種萬用字元匯入，它告訴 Kotlin 匯入該套件中的所有內容。你不能對伴生物件使用星號 `*`。相反地，你必須明確宣告要使用的伴生物件成員。

例如：

```kotlin
import kotlin.time.Duration
import kotlin.time.Duration.Companion.hours
import kotlin.time.Duration.Companion.minutes

fun main() {
    val thirtyMinutes: Duration = 30.minutes
    val halfHour: Duration = 0.5.hours
    println(thirtyMinutes == halfHour)
    // true
}
```
{kotlin-runnable="true" id="kotlin-tour-libraries-time"}

此範例：

* 匯入 `Duration` 類別以及來自其伴生物件的 `hours` 和 `minutes` 擴充屬性。
* 使用 `minutes` 屬性將 `30` 轉換為 30 分鐘的 `Duration`。
* 使用 `hours` 屬性將 `0.5` 轉換為 30 分鐘的 `Duration`。
* 檢查兩個持續時間是否相等並印出結果。

### 動手寫之前先搜尋 {id="search-before-you-build"}

在決定自己編寫程式碼之前，請先檢查標準程式庫，查看你需要的內容是否已經存在。以下列出標準程式庫已為你提供許多類別、函式和屬性的領域：

* [集合 (Collections)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/)
* [序列 (Sequences)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.sequences/)
* [字串操作 (String manipulation)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/)
* [時間管理 (Time management)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/)

若要進一步了解標準程式庫中的其他內容，請探索其 [API 參考文件](https://kotlinlang.org/api/core/kotlin-stdlib/)。

## Kotlin 程式庫 {id="kotlin-libraries"}

標準程式庫涵蓋了許多常見的使用案例，但也有一些它沒有涵蓋的情況。幸運的是，Kotlin 團隊和社群的其他成員開發了廣泛的程式庫來補充標準程式庫。例如，[`kotlinx-datetime`](https://kotlinlang.org/api/kotlinx-datetime/) 可協助你跨不同平台管理時間。

你可以在我們的[搜尋平台](https://klibs.io/)上找到好用的程式庫。要使用它們，你需要採取額外的步驟，例如新增相依性或外掛程式。每個程式庫都有一個 GitHub 存儲庫，其中包含如何將其納入 Kotlin 專案的說明。

新增程式庫後，你就可以匯入其中的任何套件。以下範例示範如何匯入 `kotlinx-datetime` 套件以查詢紐約的目前時間：

```kotlin
import kotlinx.datetime.*

fun main() {
    val now = Clock.System.now() // 取得當前時刻
    println("Current instant: $now")

    val zone = TimeZone.of("America/New_York")
    val localDateTime = now.toLocalDateTime(zone)
    println("Local date-time in NY: $localDateTime")
}
```
{kotlin-runnable="true" id="kotlin-tour-libraries-datetime"}

此範例：

* 匯入 `kotlinx.datetime` 套件。
* 使用 `Clock.System.now()` 函式建立包含目前時間的 `Instant` 類別執行個體，並將結果指派給 `now` 變數。
* 印出目前時間。
* 使用 `TimeZone.of()` 函式尋找紐約的時區，並將結果指派給 `zone` 變數。
* 在包含目前時間的執行個體上呼叫 `.toLocalDateTime()` 函式，並傳入紐約時區作為引數。
* 將結果指派給 `localDateTime` 變數。
* 印出針對紐約時區調整後的時間。

> 若要更詳細地探索此範例所使用的函式和類別，請參閱 [API 參考文件](https://kotlinlang.org/api/kotlinx-datetime/kotlinx-datetime/kotlinx.datetime/)。
>
{style="tip"}

## 選擇加入 API (Opt-in) {id="opt-in-to-apis"}

程式庫作者可能會將某些 API 標記為需要選擇加入（opt-in），然後你才能在程式碼中使用它們。當 API 仍在開發中且未來可能會變更時，作者通常會這麼做。如果你沒有選擇加入，將會看到如下的警告或錯誤：

```text
This declaration needs opt-in. Its usage should be marked with '@...' or '@OptIn(...)'
```

若要選擇加入，請編寫 `@OptIn`，後面加上圓括號，括號內包含對該 API 進行分類的類別名稱，並在後方附加兩個冒號 `::` 與 `class`。

例如，標準程式庫中的 `uintArrayOf()` 函式歸屬於 `@ExperimentalUnsignedTypes`，如 [API 參考文件](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/to-u-int-array.html)中所示：

```kotlin
@ExperimentalUnsignedTypes
inline fun uintArrayOf(vararg elements: UInt): UIntArray
```

在你的程式碼中，選擇加入的寫法如下：

```kotlin
@OptIn(ExperimentalUnsignedTypes::class)
```

以下範例示範選擇加入以使用 `uintArrayOf()` 函式建立無符號整數陣列，並修改其中的一個元素：

```kotlin
@OptIn(ExperimentalUnsignedTypes::class)
fun main() {
    // 建立無符號整數陣列
    val unsignedArray: UIntArray = uintArrayOf(1u, 2u, 3u, 4u, 5u)

    // 修改元素
    unsignedArray[2] = 42u
    println("Updated array: ${unsignedArray.joinToString()}")
    // Updated array: 1, 2, 42, 4, 5
}
```
{kotlin-runnable="true" id="kotlin-tour-libraries-apis"}

這是選擇加入最簡單的方式，但還有其他方法。若要了解更多，請參閱[選擇加入需求 (Opt-in requirements)](opt-in-requirements.md)。

## 練習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="計算複利" id="libraries-exercise-1">

你正在開發一個金融應用程式，協助使用者計算其投資的未來價值。計算複利的公式為：

<math>A = P \times (1 + \displaystyle\frac{r}{n})^{nt}</math>

其中：

* `A` 是計息後累積的金額（本金 + 利息）。
* `P` 是本金金額（初始投資額）。
* `r` 是年利率（小數）。
* `n` 是每年複利的次數。
* `t` 是投資時間（以年為單位）。

更新程式碼以完成以下項目：

1. 從 [`kotlin.math` 套件](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.math/)匯入所需的函式。
2. 為 `calculateCompoundInterest()` 函式新增函式主體，以計算套用複利後的最終金額。

```kotlin
// 在此處編寫你的程式碼

fun calculateCompoundInterest(P: Double, r: Double, n: Int, t: Int): Double {
    // 在此處編寫你的程式碼
}

fun main() {
    val principal = 1000.0
    val rate = 0.05
    val timesCompounded = 4
    val years = 5
    val amount = calculateCompoundInterest(principal, rate, timesCompounded, years)
    println("The accumulated amount is: $amount")
    // The accumulated amount is: 1282.0372317085844
}

```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-libraries-exercise-1"}

```kotlin
import kotlin.math.*

fun calculateCompoundInterest(P: Double, r: Double, n: Int, t: Int): Double {
    return P * (1 + r / n).pow(n * t)
}

fun main() {
    val principal = 1000.0
    val rate = 0.05
    val timesCompounded = 4
    val years = 5
    val amount = calculateCompoundInterest(principal, rate, timesCompounded, years)
    println("The accumulated amount is: $amount")
    // The accumulated amount is: 1282.0372317085844
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="參考解答" id="kotlin-tour-libraries-solution-1"}

</def>
<def title="測量資料處理所需的時間" id="libraries-exercise-2">

你想要測量在程式中執行多個資料處理任務所需的時間。更新程式碼，加入正確的匯入陳述式以及來自 [`kotlin.time`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/) 套件的函式：

```kotlin
// 在此處編寫你的程式碼

fun main() {
    val timeTaken = /* 在此處編寫你的程式碼 */ {
        // 模擬一些資料處理
        val data = List(1000) { it * 2 }
        val filteredData = data.filter { it % 3 == 0 }

        // 模擬處理篩選後的資料
        val processedData = filteredData.map { it / 2 }
        println("Processed data")
    }

    println("Time taken: $timeTaken") // 例如：16 ms
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-libraries-exercise-2"}

```kotlin
import kotlin.time.measureTime

fun main() {
    val timeTaken = measureTime {
        // 模擬一些資料處理
        val data = List(1000) { it * 2 }
        val filteredData = data.filter { it % 3 == 0 }

        // 模擬處理篩選後的資料
        val processedData = filteredData.map { it / 2 }
        println("Processed data")
    }

    println("Time taken: $timeTaken") // 例如：16 ms
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="參考解答" id="kotlin-tour-libraries-solution-2"}

</def>
<def title="選擇加入實驗性 API" id="libraries-exercise-3">

在最新的 Kotlin 版本中，標準程式庫提供了一項新功能。你想嘗試使用它，但它需要選擇加入。該功能歸屬於 [`@ExperimentalStdlibApi`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-experimental-stdlib-api/)。在你的程式碼中，選擇加入的寫法應該是什麼樣子？

```kotlin
@OptIn(ExperimentalStdlibApi::class)
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="參考解答" id="kotlin-tour-libraries-solution-3"}

</def>
</deflist>

## 下一步是什麼？ {id="what-s-next"}

恭喜！你已完成了中級導覽！你願意[分享你的回饋](https://surveys.hotjar.com/bf4ce865-99ce-4fc1-b107-e9b16bc31592)來談談你的體驗嗎？

接下來，請查看我們熱門 Kotlin 應用程式的教學：

<p></p> <!-- workaround for MRK057: Paragraph can only contain inline elements -->
<panels columns="2" id="kotlin-tour-whats-next">
    <panel>
        <title>後端 Kotlin 開發</title>
        <p>使用 Spring Boot 和 Kotlin 建立後端應用程式。</p>
        <a href="jvm-create-project-with-spring-boot.md" as="button" icon="arrow-right" icon-position="right" id="kotlin-tour-backend-tutorial">開始</a>
    </panel>
    <panel>
        <title>Kotlin Multiplatform</title>
        <p>從頭開始建立跨平台應用程式，並共享商業邏輯與 UI。</p>
        <a href="https://kotlinlang.org/docs/multiplatform/compose-multiplatform-create-first-app.html" as="button" icon="arrow-right" icon-position="right" id="kotlin-tour-cmp-tutorial">開始</a>
    </panel>
</panels>

<seealso></seealso>

<list id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-null-safety.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
</list>