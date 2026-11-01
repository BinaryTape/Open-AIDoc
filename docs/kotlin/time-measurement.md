[//]: # (title: 时间测量)

Kotlin 标准库提供了以不同单位计算和测量时间的工具。
准确的时间测量对于以下活动非常重要：
  * 管理线程或进程
  * 收集统计信息
  * 检测超时
  * 调试

默认情况下，时间使用单调时间源测量，但也可以配置其他时间源。
要了解更多信息，请参阅[创建时间源](#create-time-source)。

## 计算持续时间 {id="calculate-duration"}

为了表示一段时间，标准库提供了 [`Duration`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/)
类。`Duration` 可以用 [`DurationUnit`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration-unit/)
枚举类中的以下单位来表示：
  * `NANOSECONDS`
  * `MICROSECONDS`
  * `MILLISECONDS`
  * `SECONDS`
  * `MINUTES`
  * `HOURS`
  * `DAYS`

`Duration` 可以是正数、负数、零、正无穷大或负无穷大。

### 创建持续时间 {id="create-duration"}

要创建 `Duration`，请使用可用于 `Int`、`Long` 和 `Double` 类型的[扩展属性](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/#companion-object-properties)：`nanoseconds`、`microseconds`、`milliseconds`、`seconds`、`minutes`、
`hours` 和 `days`。

> 天（Day）是指 24 小时的周期，并非日历日。
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
{kotlin-runnable="true" id="kotlin-time-create-duration"}

你还可以对 `Duration` 对象执行基本算术运算：

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
{kotlin-runnable="true" id="kotlin-time-create-duration-arithmetic"}

### 获取字符串表示 {id="get-string-representation"}

获取 `Duration` 的字符串表示会很有用，这样你就可以对其进行打印、序列化、传输或存储。

要获取字符串表示，请使用 `.toString()` 函数。默认情况下，时间会按其中包含的每个单位进行报告。例如：`1h 0m 45.677s` 或 `-(6d 5h 5m 28.284s)`

要配置输出，可以使用带有期望的 `DurationUnit` 和小数位数作为函数参数的 `.toString()` 函数：

```kotlin
import kotlin.time.Duration
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.DurationUnit

fun main() {
//sampleStart
    // 以秒为单位打印，保留 2 位小数
    println(5887.milliseconds.toString(DurationUnit.SECONDS, 2))
    // 5.89s
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-time-string-representation"}

要获取兼容 [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601) 的字符串，请使用 [`toIsoString()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/to-iso-string.html)
函数：

```kotlin
import kotlin.time.Duration.Companion.seconds

fun main() {
//sampleStart
    println(86420.seconds.toIsoString()) // PT24H0M20S
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-time-iso-string-representation"}

### 转换持续时间 {id="convert-duration"}

要将 `Duration` 转换为不同的 `DurationUnit`，请使用以下属性：
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
{kotlin-runnable="true" id="kotlin-time-convert-duration"}

或者，你可以在以下扩展函数中使用所需的 `DurationUnit` 作为函数参数：
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
{kotlin-runnable="true" id="kotlin-time-convert-duration-extension"}

### 比较持续时间 {id="compare-duration"}

要检查 `Duration` 对象是否相等，请使用相等运算符（`==`）：

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
{kotlin-runnable="true" id="kotlin-time-equality-duration"}

要比较 `Duration` 对象，请使用比较运算符（`<`、`>`）：

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
{kotlin-runnable="true" id="kotlin-time-compare-duration"}

### 将持续时间分解为各个组成部分 {id="break-duration-into-components"}

要将 `Duration` 分解为其时间组成部分并执行进一步操作，请使用
[`toComponents()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/to-components.html) 函数的重载。
将所需的操作作为函数或 lambda表达式 作为函数参数传入。

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
{kotlin-runnable="true" id="kotlin-time-duration-components"}

在此示例中，lambda表达式将 `hours` 和 `minutes` 作为函数参数，未使用的 `seconds` 和 `nanoseconds` 形参则使用下划线（`_`）。该表达式使用[字符串模板](strings.md#string-templates)返回拼接后的字符串，以获得期望的 `hours` 和 `minutes` 输出格式。

## 测量时间 {id="measure-time"}

为了跟踪时间的流逝，标准库提供了各种工具，以便你可以轻松地：
* 以所需的时间单位测量执行某些代码所花费的时间。
* 标记某个时间点。
* 比较两个时间点并计算差值。
* 检查自特定时间点以来已经过去了多少时间。
* 检查当前时间是否已超过特定时间点。

### 测量代码执行时间 {id="measure-code-execution-time"}

要测量执行代码块所需的时间，请使用 [`measureTime`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/measure-time.html)
内联函数：

```kotlin
import kotlin.time.measureTime

fun main() {
//sampleStart
    val timeTaken = measureTime {
        Thread.sleep(100)
    }
    println(timeTaken) // e.g. 103 ms
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-time-measure-time"}

要测量执行代码块所需的时间**并**返回该代码块的值，请使用内联函数 [`measureTimedValue`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/measure-time.html)。

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
    println(timeTaken) // e.g. 103 ms
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-time-measure-timed-value"}

默认情况下，这两个函数都使用单调时间源。

### 标记时间点 {id="mark-moments-in-time"}

要标记特定的时间点，请使用 [`TimeSource`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-source/)
接口和 [`markNow()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-source/mark-now.html) 函数
来创建 [`TimeMark`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-mark/)：

```kotlin
import kotlin.time.*

fun main() {
   val timeSource = TimeSource.Monotonic
   val mark = timeSource.markNow()
}
```

### 测量时间差 {id="measure-differences-in-time"}

要测量来自同一时间源的 `TimeMark` 对象之间的差异，请使用减法运算符（`-`）。

要比较来自同一时间源的 `TimeMark` 对象，请使用比较运算符（`<`、`>`）。

例如：

```kotlin
import kotlin.time.*

fun main() {
//sampleStart
   val timeSource = TimeSource.Monotonic
   val mark1 = timeSource.markNow()
   Thread.sleep(500) // 休眠 0.5 秒。
   val mark2 = timeSource.markNow()

   repeat(4) { n ->
       val mark3 = timeSource.markNow()
       val elapsed1 = mark3 - mark1
       val elapsed2 = mark3 - mark2

       println("Measurement 1.${n + 1}: elapsed1=$elapsed1, elapsed2=$elapsed2, diff=${elapsed1 - elapsed2}")
   }
   
   println(mark2 > mark1) // 这为 true，因为 mark2 是在 mark1 之后捕获的。
   // true
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-time-measure-difference"}

要检查截止时间是否已过或是否已超时，请使用 [`hasPassedNow()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-mark/has-passed-now.html)
和 [`hasNotPassedNow()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-mark/has-not-passed-now.html) 
扩展函数：

```kotlin
import kotlin.time.*
import kotlin.time.Duration.Companion.seconds

fun main() {
//sampleStart
   val timeSource = TimeSource.Monotonic
   val mark1 = timeSource.markNow()
   val fiveSeconds: Duration = 5.seconds
   val mark2 = mark1 + fiveSeconds

   // 此时尚未达到 5 秒
   println(mark2.hasPassedNow())
   // false
  
   // 等待 6 秒
   Thread.sleep(6000)
   println(mark2.hasPassedNow())
   // true

//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-time-deadline=passed"}

## 时间源 {id="time-sources"}

默认情况下，时间使用单调时间源测量。单调时间源只会向前单向递增，不受时区等变化的影响。单调时间的一种替代方案是经过的真实时间（elapsed real time），也称为挂钟时间（wall-clock time）。经过的真实时间是相对于另一个时间点进行测量的。

### 各平台默认的时间源 {id="default-time-sources-per-platform"}

下表说明了各个平台单调时间的默认来源：

| 平台                  | 来源                                                                |
|---------------------|-------------------------------------------------------------------|
| Kotlin/JVM          | `System.nanoTime()`                                               |
| Kotlin/JS (Node.js) | `process.hrtime()`                                                |
| Kotlin/JS (browser) | `window.performance.now()` 或 `Date.now()`                         |
| Kotlin/Native       | `std::chrono::high_resolution_clock` 或 `std::chrono::steady_clock` |

### 创建时间源 {id="create-time-source"}

在某些情况下，你可能希望使用不同的时间源。例如，在 Android 中，`System.nanoTime()` 仅在设备处于活动状态时计时。当设备进入深度睡眠时，它将无法跟踪时间。为了在设备处于深度睡眠时仍能跟踪时间，你可以创建一个使用 [`SystemClock.elapsedRealtimeNanos()`](https://developer.android.com/reference/android/os/SystemClock#elapsedRealtimeNanos()) 的时间源：

```kotlin
object RealtimeMonotonicTimeSource : AbstractLongTimeSource(DurationUnit.NANOSECONDS) {
    override fun read(): Long = SystemClock.elapsedRealtimeNanos()
}
```

然后，你可以使用该时间源来进行时间测量：

```kotlin
fun main() {
    val elapsed: Duration = RealtimeMonotonicTimeSource.measureTime {
        Thread.sleep(100)
    }
    println(elapsed) // e.g. 103 ms
}
```
{validate="false"}

有关 `kotlin.time` 软件包的更多信息，请参阅我们的[标准库 API 参考](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/)。