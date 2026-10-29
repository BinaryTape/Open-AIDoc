[//]: # (title: 時間測量)

Kotlin 標準函式庫提供了以不同單位計算和測量時間的工具。
準確的時間測量對於以下活動至關重要：
  * 管理執行緒或程序
  * 收集統計數據
  * 偵測逾時
  * 偵錯

預設情況下，時間是使用單調時間源 (monotonic time source) 測量的，但也可以配置其他時間源。
如需更多資訊，請參閱[建立時間源](#create-time-source)。

## 計算 duration {id="calculate-duration"}

為了表示一段時間，標準函式庫提供了 [`Duration`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) 類別。`Duration` 可以使用 [`DurationUnit`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration-unit/) 列舉類別中的以下單位表示：
  * `NANOSECONDS`
  * `MICROSECONDS`
  * `MILLISECONDS`
  * `SECONDS`
  * `MINUTES`
  * `HOURS`
  * `DAYS`

`Duration` 可以是正數、負數、零、正無窮大或負無窮大。

### 建立 duration {id="create-duration"}

若要建立 `Duration`，請使用適用於 `Int`、`Long` 和 `Double` 型別的[擴充屬性](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/#companion-object-properties)：`nanoseconds`、`microseconds`、`milliseconds`、`seconds`、`minutes`、`hours` 和 `days`。

> 天 (Days) 指的是 24 小時的時段。它們不是行事曆天。
>
{style="tip"}

例如：

```kotlin
import kotlin.time.*
import kotlin.time.Duration.Companion.nanoseconds
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds
import kotlin.time.Duration.Companion.minutes
import kotlin.time.Duration.Companion.days

fun main() {
//sampleStart
    val fiveHundredMilliseconds: Duration = 500.milliseconds
    val zeroSeconds: Duration = 0.seconds
    val tenMinutes: Duration = 10.minutes
    val negativeNanosecond: Duration = (-1).nanoseconds
    val infiniteDays: Duration = Double.POSITIVE_INFINITY.days
    val negativeInfiniteDays: Duration = Double.NEGATIVE_INFINITY.days

    println(fiveHundredMilliseconds) // 500ms
    println(zeroSeconds)             // 0s
    println(tenMinutes)              // 10m
    println(negativeNanosecond)      // -1ns
    println(infiniteDays)            // Infinity
    println(negativeInfiniteDays)    // -Infinity
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-time-create-duration"}

你也可以對 `Duration` 物件進行基本的算術運算：

```kotlin
import kotlin.time.*
import kotlin.time.Duration.Companion.seconds

fun main() {
//sampleStart
    val fiveSeconds: Duration = 5.seconds
    val thirtySeconds: Duration = 30.seconds

    println(fiveSeconds + thirtySeconds)
    // 35s
    println(thirtySeconds - fiveSeconds)
    // 25s
    println(fiveSeconds * 2)
    // 10s
    println(thirtySeconds / 2)
    // 15s
    println(thirtySeconds / fiveSeconds)
    // 6.0
    println(-thirtySeconds)
    // -30s
    println((-thirtySeconds).absoluteValue)
    // 30s
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-time-create-duration-arithmetic"}

### 取得字串表示形式 {id="get-string-representation"}

取得 `Duration` 的字串表示形式很有用，以便進行列印、序列化、傳輸或儲存。

若要取得字串表示形式，請使用 `.toString()` 函式。預設情況下，時間會使用顯示的每個單位回報。例如：`1h 0m 45.677s` 或 `-(6d 5h 5m 28.284s)`。

若要設定輸出，請使用 `.toString()` 函式，並將所需的 `DurationUnit` 和小數位數作為函式參數傳入：

```kotlin
import kotlin.time.Duration
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.DurationUnit

fun main() {
//sampleStart
    // 以秒為單位列印，保留 2 位小數
    println(5887.milliseconds.toString(DurationUnit.SECONDS, 2))
    // 5.89s
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-time-string-representation"}

若要取得[符合 ISO-8601 標準](https://en.wikipedia.org/wiki/ISO_8601)的字串，請使用 [`toIsoString()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/to-iso-string.html) 函式：

```kotlin
import kotlin.time.Duration.Companion.seconds

fun main() {
//sampleStart
    println(86420.seconds.toIsoString()) // PT24H0M20S
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-time-iso-string-representation"}

### 轉換 duration {id="convert-duration"}

若要將 `Duration` 轉換為不同的 `DurationUnit`，請使用以下屬性：
* `inWholeNanoseconds`
* `inWholeMicroseconds`
* `inWholeSeconds`
* `inWholeMinutes`
* `inWholeHours`
* `inWholeDays`

例如：

```kotlin
import kotlin.time.Duration
import kotlin.time.Duration.Companion.minutes

fun main() {
//sampleStart
    val thirtyMinutes: Duration = 30.minutes
    println(thirtyMinutes.inWholeSeconds)
    // 1800
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-time-convert-duration"}

或者，你可以在以下擴充函式中使用所需的 `DurationUnit` 作為函式參數：
* `.toInt()`
* `.toDouble()`
* `.toLong()`

例如：

```kotlin
import kotlin.time.Duration.Companion.seconds
import kotlin.time.DurationUnit

fun main() {
//sampleStart
    println(270.seconds.toDouble(DurationUnit.MINUTES))
    // 4.5
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-time-convert-duration-extension"}

### 比較 duration {id="compare-duration"}

若要檢查 `Duration` 物件是否相等，請使用相等運算子 (`==`)：

```kotlin
import kotlin.time.Duration
import kotlin.time.Duration.Companion.hours
import kotlin.time.Duration.Companion.minutes

fun main() {
//sampleStart
    val thirtyMinutes: Duration = 30.minutes
    val halfHour: Duration = 0.5.hours
    println(thirtyMinutes == halfHour)
    // true
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-time-equality-duration"}

若要比較 `Duration` 物件，請使用比較運算子 (`<`、`>`)：

```kotlin
import kotlin.time.Duration.Companion.microseconds
import kotlin.time.Duration.Companion.nanoseconds

fun main() {
//sampleStart
    println(3000.microseconds < 25000.nanoseconds)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-time-compare-duration"}

### 將 duration 分解為組件 {id="break-duration-into-components"}

若要將 `Duration` 分解為其時間組件並執行進一步的操作，請使用 [`toComponents()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/to-components.html) 函式的多載版本。將所需的操作作為函式或 Lambda 運算式作為函式參數加入。

例如：

```kotlin
import kotlin.time.Duration
import kotlin.time.Duration.Companion.minutes

fun main() {
//sampleStart
    val thirtyMinutes: Duration = 30.minutes
    println(thirtyMinutes.toComponents { hours, minutes, _, _ -> "${hours}h:${minutes}m" })
    // 0h:30m
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-time-duration-components"}

在此範例中，Lambda 運算式將 `hours` 和 `minutes` 作為函式參數，並對未使用的 `seconds` 和 `nanoseconds` 參數使用底線 (`_`)。該運算式使用[字串範本](strings.md#string-templates)回傳一個串接字串，以取得所需的 `hours` 和 `minutes` 輸出格式。

## 測量時間 {id="measure-time"}

為了追蹤時間的流逝，標準函式庫提供的工具讓你可以輕鬆地：
* 以所需的單位測量執行某些程式碼所需的時間。
* 標記時間點。
* 比較與相減兩個時間點。
* 檢查自特定時間點以來已過去的時間。
* 檢查目前時間是否已超過特定時間點。

### 測量程式碼執行時間 {id="measure-code-execution-time"}

若要測量執行程式碼區塊所需的時間，請使用 [`measureTime`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/measure-time.html) 內嵌函式：

```kotlin
import kotlin.time.measureTime

fun main() {
//sampleStart
    val timeTaken = measureTime {
        Thread.sleep(100)
    }
    println(timeTaken) // 例如 103 ms
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-time-measure-time"}

若要測量執行程式碼區塊所需的時間 **並** 回傳該程式碼區塊的值，請使用內嵌函式 [`measureTimedValue`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/measure-time.html)。

例如：

```kotlin
import kotlin.time.measureTimedValue

fun main() {
//sampleStart
    val (value, timeTaken) = measureTimedValue {
        Thread.sleep(100)
        42
    }
    println(value)     // 42
    println(timeTaken) // 例如 103 ms
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-time-measure-timed-value"}

預設情況下，這兩個函式都使用單調時間源。

### 標記時間點 {id="mark-moments-in-time"}

若要標記特定時間點，請使用 [`TimeSource`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-source/) 介面和 [`markNow()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-source/mark-now.html) 函式來建立 [`TimeMark`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-mark/)：

```kotlin
import kotlin.time.*

fun main() {
   val timeSource = TimeSource.Monotonic
   val mark = timeSource.markNow()
}
```

### 測量時間差異 {id="measure-differences-in-time"}

若要測量來自同一時間源的 `TimeMark` 物件之間的差異，請使用減法運算子 (`-`)。

若要比較來自同一時間源的 `TimeMark` 物件，請使用比較運算子 (`<`、`>`)。

例如：

```kotlin
import kotlin.time.*

fun main() {
//sampleStart
   val timeSource = TimeSource.Monotonic
   val mark1 = timeSource.markNow()
   Thread.sleep(500) // 睡眠 0.5 秒。
   val mark2 = timeSource.markNow()

   repeat(4) { n ->
       val mark3 = timeSource.markNow()
       val elapsed1 = mark3 - mark1
       val elapsed2 = mark3 - mark2

       println("測量 1.${n + 1}: elapsed1=$elapsed1, elapsed2=$elapsed2, diff=${elapsed1 - elapsed2}")
   }
   
   println(mark2 > mark1) // 這是 true，因為 mark2 是比 mark1 更晚擷取的。
   // true
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-time-measure-difference"}

若要檢查截止日期是否已過或是否已達到逾時，請使用 [`hasPassedNow()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-mark/has-passed-now.html) 和 [`hasNotPassedNow()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-mark/has-not-passed-now.html) 擴充函式：

```kotlin
import kotlin.time.*
import kotlin.time.Duration.Companion.seconds

fun main() {
//sampleStart
   val timeSource = TimeSource.Monotonic
   val mark1 = timeSource.markNow()
   val fiveSeconds: Duration = 5.seconds
   val mark2 = mark1 + fiveSeconds

   // 目前還沒到 5 秒
   println(mark2.hasPassedNow())
   // false
  
   // 等待 6 秒
   Thread.sleep(6000)
   println(mark2.hasPassedNow())
   // true

//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-time-deadline=passed"}

## 時間源 (Time sources) {id="time-sources"}

預設情況下，時間是使用單調時間源測量的。單調時間源僅會向前推進，且不受時區變動等因素影響。單調時間的另一種選擇是經過的真實時間，也稱為掛鐘時間 (wall-clock time)。經過的真實時間是相對於另一個時間點測量的。

### 各平台的預設時間源 {id="default-time-sources-per-platform"}

此表格說明了每個平台的預設單調時間源：

| 平台 | 來源 |
|---------------------|---|
| Kotlin/JVM          | `System.nanoTime()`|
| Kotlin/JS (Node.js) | `process.hrtime()`|
| Kotlin/JS (browser) | `window.performance.now()` 或 `Date.now()`|
| Kotlin/Native       | `std::chrono::high_resolution_clock` 或 `std::chrono::steady_clock`|

### 建立時間源 {id="create-time-source"}

在某些情況下，你可能想要使用不同的時間源。例如在 Android 中，`System.nanoTime()` 僅在裝置處於活動狀態時計算時間。當裝置進入深度睡眠時，它會失去對時間的追蹤。若要在裝置處於深度睡眠時追蹤時間，你可以建立一個使用 [`SystemClock.elapsedRealtimeNanos()`](https://developer.android.com/reference/android/os/SystemClock#elapsedRealtimeNanos()) 的時間源：

```kotlin
object RealtimeMonotonicTimeSource : AbstractLongTimeSource(DurationUnit.NANOSECONDS) {
    override fun read(): Long = SystemClock.elapsedRealtimeNanos()
}
```

然後你可以使用你的時間源進行時間測量：

```kotlin
fun main() {
    val elapsed: Duration = RealtimeMonotonicTimeSource.measureTime {
        Thread.sleep(100)
    }
    println(elapsed) // 例如 103 ms
}
```
{validate="false"}

如需有關 `kotlin.time` 套件的更多資訊，請參閱我們的[標準函式庫 API 參考](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/)。