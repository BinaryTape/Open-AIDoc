[//]: # (title: 時間の計測)

Kotlin標準ライブラリには、さまざまな単位で時間を計算および計測するためのツールが用意されています。
正確な時間計測は、次のような処理において重要です：
  * スレッドやプロセスの管理
  * 統計の収集
  * タイムアウトの検出
  * デバッグ

デフォルトでは、時間は単調増加タイムソース（monotonic time source）を使用して計測されますが、他のタイムソースを設定することもできます。
詳細については、[タイムソースの作成](#create-time-source)を参照してください。

## Duration（期間）の計算 {id="calculate-duration"}

時間の長さを表すために、標準ライブラリには [`Duration`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/)
クラスが用意されています。`Duration` は、[`DurationUnit`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration-unit/)
列挙型クラスの以下の単位で表現できます：
  * `NANOSECONDS`
  * `MICROSECONDS`
  * `MILLISECONDS`
  * `SECONDS`
  * `MINUTES`
  * `HOURS`
  * `DAYS`

`Duration` は、正、負、ゼロ、正の無限大、または負の無限大のいずれかの値をとることができます。

### Durationの作成 {id="create-duration"}

`Duration` を作成するには、`Int`、`Long`、および `Double` 型で利用可能な[拡張プロパティ](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/#companion-object-properties)である `nanoseconds`、`microseconds`、`milliseconds`、`seconds`、`minutes`、`hours`、`days` を使用します。

> Days（日）は24時間の期間を指します。カレンダー上の日数ではありません。
>
{style="tip"}

例：

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

また、`Duration` オブジェクト同士で基本的な算術演算を行うこともできます：

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

### 文字列表現の取得 {id="get-string-representation"}

`Duration` の文字列表現を取得できると、出力、シリアライズ、転送、保存を行う際に便利です。

文字列表現を取得するには、`.toString()` 関数を使用します。デフォルトでは、含まれる各単位を使用して時間が報告されます。例えば、`1h 0m 45.677s` や `-(6d 5h 5m 28.284s)` のようになります。

出力を設定するには、`.toString()` 関数の引数に希望する `DurationUnit` と小数点以下の桁数を指定します：

```kotlin
import kotlin.time.Duration
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.DurationUnit

fun main() {
//sampleStart
    // 小数点以下2桁の秒単位で出力
    println(5887.milliseconds.toString(DurationUnit.SECONDS, 2))
    // 5.89s
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-time-string-representation"}

[ISO-8601準拠](https://en.wikipedia.org/wiki/ISO_8601)の文字列を取得するには、[`toIsoString()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/to-iso-string.html)
関数を使用します：

```kotlin
import kotlin.time.Duration.Companion.seconds

fun main() {
//sampleStart
    println(86420.seconds.toIsoString()) // PT24H0M20S
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-time-iso-string-representation"}

### Durationの変換 {id="convert-duration"}

`Duration` を別の `DurationUnit` に変換するには、以下のプロパティを使用します：
* `inWholeNanoseconds`
* `inWholeMicroseconds`
* `inWholeSeconds`
* `inWholeMinutes`
* `inWholeHours`
* `inWholeDays`

例：

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

あるいは、以下の拡張関数の引数として希望の `DurationUnit` を指定することもできます：
* `.toInt()`
* `.toDouble()`
* `.toLong()`

例：

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

### Durationの比較 {id="compare-duration"}

`Duration` オブジェクトが等しいかどうかを確認するには、等価演算子（`==`）を使用します：

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

`Duration` オブジェクト同士を比較するには、比較演算子（`<`、`>`）を使用します：

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

### Durationをコンポーネントに分解する {id="break-duration-into-components"}

`Duration` を時間の構成要素に分解してさらに処理を行うには、[`toComponents()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/to-components.html) 関数のオーバーロードを使用します。関数のパラメータとして、実行したい処理を関数またはラムダ式として指定します。

例：

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

この例では、ラムダ式に `hours` と `minutes` のパラメータがあり、未使用の `seconds` と `nanoseconds` パラメータにはアンダースコア（`_`）を使用しています。この式は、[文字列テンプレート](strings.md#string-templates)を使用して `hours` と `minutes` を希望の出力形式に連結した文字列を返します。

## 時間の計測 {id="measure-time"}

時間の経過を追跡するために、標準ライブラリには以下を簡単に行うためのツールが用意されています：
* 任意の時間単位でコードの実行にかかる時間を計測する。
* 特定の時点をマークする。
* 2つの時点を比較および減算する。
* 特定の時点からどれだけの時間が経過したかを確認する。
* 現在時刻が特定の時点を過ぎているかどうかを確認する。

### コード実行時間の計測 {id="measure-code-execution-time"}

コードブロックの実行にかかる時間を計測するには、[`measureTime`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/measure-time.html)
インライン関数を使用します：

```kotlin
import kotlin.time.measureTime

fun main() {
//sampleStart
    val timeTaken = measureTime {
        Thread.sleep(100)
    }
    println(timeTaken) // 例: 103 ms
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-time-measure-time"}

コードブロックの実行にかかる時間を計測し、**かつ**そのコードブロックの戻り値も取得したい場合は、インライン関数 [`measureTimedValue`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/measure-time.html) を使用します。

例：

```kotlin
import kotlin.time.measureTimedValue

fun main() {
//sampleStart
    val (value, timeTaken) = measureTimedValue {
        Thread.sleep(100)
        42
    }
    println(value)     // 42
    println(timeTaken) // 例: 103 ms
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-time-measure-timed-value"}

デフォルトでは、どちらの関数も単調増加タイムソースを使用します。

### 特定の時点をマークする {id="mark-moments-in-time"}

特定の時点をマークするには、[`TimeSource`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-source/)
インターフェースと [`markNow()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-source/mark-now.html) 関数を使用して、[`TimeMark`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-mark/)
を作成します：

```kotlin
import kotlin.time.*

fun main() {
   val timeSource = TimeSource.Monotonic
   val mark = timeSource.markNow()
}
```

### 時間の差を計測する {id="measure-differences-in-time"}

同じタイムソースから取得した `TimeMark` オブジェクト間の差を計測するには、減算演算子（`-`）を使用します。

同じタイムソースから取得した `TimeMark` オブジェクト同士を比較するには、比較演算子（`<`、`>`）を使用します。

例：

```kotlin
import kotlin.time.*

fun main() {
//sampleStart
   val timeSource = TimeSource.Monotonic
   val mark1 = timeSource.markNow()
   Thread.sleep(500) // 0.5秒スリープ
   val mark2 = timeSource.markNow()

   repeat(4) { n ->
       val mark3 = timeSource.markNow()
       val elapsed1 = mark3 - mark1
       val elapsed2 = mark3 - mark2

       println("Measurement 1.${n + 1}: elapsed1=$elapsed1, elapsed2=$elapsed2, diff=${elapsed1 - elapsed2}")
   }
   
   println(mark2 > mark1) // mark2はmark1より後に取得されたため、これはtrueになります。
   // true
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-time-measure-difference"}

期限が過ぎたか、またはタイムアウトに達したかを確認するには、[`hasPassedNow()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-mark/has-passed-now.html)
および [`hasNotPassedNow()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-mark/has-not-passed-now.html) 
拡張関数を使用します：

```kotlin
import kotlin.time.*
import kotlin.time.Duration.Companion.seconds

fun main() {
//sampleStart
   val timeSource = TimeSource.Monotonic
   val mark1 = timeSource.markNow()
   val fiveSeconds: Duration = 5.seconds
   val mark2 = mark1 + fiveSeconds

   // まだ5秒経過していない
   println(mark2.hasPassedNow())
   // false
  
   // 6秒待機
   Thread.sleep(6000)
   println(mark2.hasPassedNow())
   // true

//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-time-deadline=passed"}

## タイムソース {id="time-sources"}

デフォルトでは、時間は単調増加タイムソース（monotonic time source）を使用して計測されます。単調増加タイムソースは前方にしか進まず、タイムゾーンの変更などの影響を受けません。単調増加時間の代替となるのが経過実時間（ウォールクロック時間とも呼ばれます）です。経過実時間は、別の時点からの相対的な時間として計測されます。

### プラットフォームごとのデフォルトのタイムソース {id="default-time-sources-per-platform"}

以下の表は、各プラットフォームにおける単調増加時間のデフォルトのソースを示しています：

| プラットフォーム    | ソース                                                              |
|---------------------|---------------------------------------------------------------------|
| Kotlin/JVM          | `System.nanoTime()`                                                 |
| Kotlin/JS (Node.js) | `process.hrtime()`                                                  |
| Kotlin/JS (ブラウザ)| `window.performance.now()` または `Date.now()`                      |
| Kotlin/Native       | `std::chrono::high_resolution_clock` または `std::chrono::steady_clock` |

### タイムソースの作成 {id="create-time-source"}

別のタイムソースを使用したいケースもあります。例えば、Androidでは `System.nanoTime()` はデバイスがアクティブな間のみ時間をカウントします。デバイスがディープスリープに入ると時間の追跡が失われます。デバイスがディープスリープ中も時間を追跡するには、[`SystemClock.elapsedRealtimeNanos()`](https://developer.android.com/reference/android/os/SystemClock#elapsedRealtimeNanos()) を使用するタイムソースを作成できます：

```kotlin
object RealtimeMonotonicTimeSource : AbstractLongTimeSource(DurationUnit.NANOSECONDS) {
    override fun read(): Long = SystemClock.elapsedRealtimeNanos()
}
```

作成したタイムソースは、時間計測に使用できます：

```kotlin
fun main() {
    val elapsed: Duration = RealtimeMonotonicTimeSource.measureTime {
        Thread.sleep(100)
    }
    println(elapsed) // 例: 103 ms
}
```
{validate="false"}

`kotlin.time` パッケージの詳細については、[標準ライブラリ API リファレンス](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/)を参照してください。