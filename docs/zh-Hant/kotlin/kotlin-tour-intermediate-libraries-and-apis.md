[//]: # (title: 程式庫與 API)

<no-index/>

為了充分發揮 Kotlin 的優勢，請使用現有的程式庫與 API，這樣您就能將更多時間花在編寫程式碼上，而不是浪費時間在重複造輪子。

程式庫負責散佈可重用的程式碼，能簡化常見的任務。在程式庫中，會有套件與物件來對相關的類別、函式及工具進行分組。程式庫將 API (應用程式編程介面) 公開為一組函式、類別或屬性，供開發人員在自己的程式碼中使用。

![Kotlin 程式庫與 API](kotlin-library-diagram.svg){width=600}

讓我們來探索 Kotlin 可以實現的功能。

## 標準函式庫

Kotlin 擁有標準函式庫 (standard library)，提供必要的型別、函式、集合與工具，讓您的程式碼更加簡潔且具表現力。標準函式庫的大部分內容（[`kotlin` 套件](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/)中的所有內容）在任何 Kotlin 檔案中都是隨插即用的，無需明確匯入：

```kotlin
fun main() {
    val text = "emosewa si niltoK"
    
   // 使用標準函式庫中的 reversed() 函式
    val reversedText = text.reversed()

    // 使用標準函式庫中的 print() 函式
    print(reversedText)
    // Kotlin is awesome
}
```
{kotlin-runnable="true" id="kotlin-tour-libraries-stdlib"}

然而，標準函式庫的某些部分需要先匯入才能在程式碼中使用。例如，如果您想使用標準函式庫的時間測量功能，則需要匯入 [`kotlin.time` 套件](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/)。

在檔案頂部，加入 `import` 關鍵字，後接您需要的套件：

```kotlin
import kotlin.time.*
```

星號 `*` 是萬用字元匯入，會告訴 Kotlin 匯入該套件中的所有內容。您不能將星號 `*` 用於伴生物件 (companion object)。相反地，您需要明確宣告想要使用的伴生物件成員。

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

* 匯入 `Duration` 類別，以及其伴生物件中的 `hours` 和 `minutes` 擴充屬性。
* 使用 `minutes` 屬性將 `30` 轉換為 30 分鐘的 `Duration`。
* 使用 `hours` 屬性將 `0.5` 轉換為 30 分鐘的 `Duration`。
* 檢查兩個持續時間是否相等並列印結果。

### 在開發前先搜尋

在您決定編寫自己的程式碼之前，請先查看標準函式庫，看看您要找的功能是否已經存在。以下是標準函式庫已經為您提供多種類別、函式與屬性的領域清單：

* [集合 (Collections)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/)
* [序列 (Sequences)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.sequences/)
* [字串操作](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/)
* [時間管理](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/)

若要進一步了解標準函式庫中的其他內容，請瀏覽其 [API 參考文件](https://kotlinlang.org/api/core/kotlin-stdlib/)。

## Kotlin 程式庫

標準函式庫涵蓋了許多常見的使用案例，但仍有一些情況未涉及。幸運的是， Kotlin 團隊和社群其他成員開發了各式各樣的程式庫來補充標準函式庫。例如，[`kotlinx-datetime`](https://kotlinlang.org/api/kotlinx-datetime/) 能協助您在不同平台間管理時間。

您可以在我們的[搜尋平台](https://klibs.io/)上找到有用的程式庫。若要使用它們，您需要執行額外的步驟，例如新增相依性或外掛程式。每個程式庫都有一個 GitHub 儲存庫，其中包含如何將其包含在您的 Kotlin 專案中的說明。

新增程式庫後，您就可以匯入其中的任何套件。以下是匯入 `kotlinx-datetime` 套件以查詢紐約目前時間的範例：

```kotlin
import kotlinx.datetime.*

fun main() {
    val now = Clock.System.now() // 獲取目前瞬時時間
    println("Current instant: $now")

    val zone = TimeZone.of("America/New_York")
    val localDateTime = now.toLocalDateTime(zone)
    println("Local date-time in NY: $localDateTime")
}
```
{kotlin-runnable="true" id="kotlin-tour-libraries-datetime"}

此範例：

* 匯入 `kotlinx.datetime` 套件。
* 使用 `Clock.System.now()` 函式建立包含目前時間的 `Instant` 類別實例，並將結果指派給 `now` 變數。
* 列印目前時間。
* 使用 `TimeZone.of()` 函式查詢紐約的時區，並將結果指派給 `zone` 變數。
* 在包含目前時間的實例上呼叫 `.toLocalDateTime()` 函式，並以紐約時區作為引數。
* 將結果指派給 `localDateTime` 變數。
* 列印針對紐約時區調整後的時間。

> 若要詳細探索此範例中使用的函式與類別，請參閱 [API 參考文件](https://kotlinlang.org/api/kotlinx-datetime/kotlinx-datetime/kotlinx.datetime/)。
>
{style="tip"}

## 選擇性加入 API

程式庫作者可能會將某些 API 標記為需要選擇性加入 (opt-in)，然後您才能在程式碼中使用它們。他們通常會在 API 仍在開發中且未來可能會變更時執行此操作。如果您沒有選擇性加入，您會看到如下的警告或錯誤：

```text
This declaration needs opt-in. Its usage should be marked with '@...' or '@OptIn(...)'
```

若要選擇性加入，請編寫 `@OptIn`，後接包含類別名稱（該類別用於對 API 進行分類）的圓括號，並在名稱後加上兩個冒號 `::` 和 `class`。

例如，標準函式庫中的 `uintArrayOf()` 函式屬於 `@ExperimentalUnsignedTypes`，如 [API 參考文件](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/to-u-int-array.html)中所示：

```kotlin
@ExperimentalUnsignedTypes
inline fun uintArrayOf(vararg elements: UInt): UIntArray
```

在您的程式碼中，選擇性加入看起來像：

```kotlin
@OptIn(ExperimentalUnsignedTypes::class)
```

以下是一個選擇性加入使用 `uintArrayOf()` 函式來建立無符號整數陣列並修改其中一個元素的範例：

```kotlin
@OptIn(ExperimentalUnsignedTypes::class)
fun main() {
    // 建立一個無符號整數陣列
    val unsignedArray: UIntArray = uintArrayOf(1u, 2u, 3u, 4u, 5u)

    // 修改一個元素
    unsignedArray[2] = 42u
    println("Updated array: ${unsignedArray.joinToString()}")
    // Updated array: 1, 2, 42, 4, 5
}
```
{kotlin-runnable="true" id="kotlin-tour-libraries-apis"}

這是最簡單的選擇性加入方式，但還有其他方法。若要了解更多，請參閱[選擇性加入需求](opt-in-requirements.md)。

## 練習 {completion-point="true"}

### 練習 1 {initial-collapse-state="collapsed" collapsible="true" id="libraries-exercise-1"}

您正在開發一款財務應用程式，幫助使用者計算其投資的未來價值。計算複利的公式為：

<math>A = P \times (1 + \displaystyle\frac{r}{n})^{nt}</math>

其中：

* `A` 是計息後累積的金額（本金 + 利息）。
* `P` 是本金金額（初始投資）。
* `r` 是年利率（十進制）。
* `n` 是每年複利計息的次數。
* `t` 是資金投資的時間（以年為單位）。

更新程式碼以執行以下操作：

1. 從 [`kotlin.math` 套件](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.math/)匯入必要的函式。
2. 為 `calculateCompoundInterest()` 函式新增主體，以計算套用複利後的最終金額。

|--|--|

```kotlin
// 在此處編寫您的程式碼

fun calculateCompoundInterest(P: Double, r: Double, n: Int, t: Int): Double {
    // 在此處編寫您的程式碼
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

|---|---|
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-libraries-solution-1"}

### 練習 2 {initial-collapse-state="collapsed" collapsible="true" id="libraries-exercise-2"}

您想要測量程式中執行多個資料處理任務所需的時間。更新程式碼，從 [`kotlin.time`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/) 套件加入正確的匯入陳述式與函式：

|---|---|

```kotlin
// 在此處編寫您的程式碼

fun main() {
    val timeTaken = /* 在此處編寫您的程式碼 */ {
        // 模擬一些資料處理
        val data = List(1000) { it * 2 }
        val filteredData = data.filter { it % 3 == 0 }

        // 模擬處理過濾後的資料
        val processedData = filteredData.map { it / 2 }
        println("Processed data")
    }

    println("Time taken: $timeTaken") // 例如 16 ms
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-libraries-exercise-2"}

|---|---|
```kotlin
import kotlin.time.measureTime

fun main() {
    val timeTaken = measureTime {
        // 模擬一些資料處理
        val data = List(1000) { it * 2 }
        val filteredData = data.filter { it % 3 == 0 }

        // 模擬處理過濾後的資料
        val processedData = filteredData.map { it / 2 }
        println("Processed data")
    }

    println("Time taken: $timeTaken") // 例如 16 ms
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-libraries-solution-2"}

### 練習 3 {initial-collapse-state="collapsed" collapsible="true" id="properties-exercise-3"}

最新版本的 Kotlin 標準函式庫中有一項新功能。您想嘗試一下，但它需要選擇性加入。該功能屬於 [`@ExperimentalStdlibApi`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-experimental-stdlib-api/)。在您的程式碼中，選擇性加入應該長什麼樣？

|---|---|
```kotlin
@OptIn(ExperimentalStdlibApi::class)
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-libraries-solution-3"}

## 下一步？

恭喜！您已完成中階導覽！您願意[分享您的意見回饋](https://surveys.hotjar.com/bf4ce865-99ce-4fc1-b107-e9b16bc31592)嗎？

作為下一步，請查看我們針對熱門 Kotlin 應用程式的教學：

* [使用 Spring Boot 與 Kotlin 建立後端應用程式](jvm-create-project-with-spring-boot.md)
* 從頭開始為 Android 與 iOS 建立跨平台應用程式，並且：
    * [在保持 UI 原生的同時共用商務邏輯](https://kotlinlang.org/docs/multiplatform/multiplatform-create-first-app.html)
    * [共用商務邏輯與 UI](https://kotlinlang.org/docs/multiplatform/compose-multiplatform-create-first-app.html)

<seealso></seealso>

<list id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-null-safety.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
</list>