[//]: # (title: 시간 측정)

Kotlin 표준 라이브러리는 다양한 단위로 시간을 계산하고 측정할 수 있는 도구를 제공합니다.
정확한 시간 측정은 다음과 같은 작업에 중요합니다:
  * 스레드 또는 프로세스 관리
  * 통계 수집
  * 타임아웃 감지
  * 디버깅

기본적으로 시간은 단조 시간 소스(monotonic time source)를 사용하여 측정되지만, 다른 시간 소스를 구성할 수도 있습니다.
자세한 내용은 [시간 소스 생성](#create-time-source)을 참조하세요.

## 기간(Duration) 계산 {id="calculate-duration"}

시간의 양을 나타내기 위해 표준 라이브러리에는 [`Duration`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) 클래스가 있습니다. `Duration`은 [`DurationUnit`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration-unit/) 열거형 클래스(enum class)의 다음 단위로 표현될 수 있습니다:
  * `NANOSECONDS` (나노초)
  * `MICROSECONDS` (마이크로초)
  * `MILLISECONDS` (밀리초)
  * `SECONDS` (초)
  * `MINUTES` (분)
  * `HOURS` (시간)
  * `DAYS` (일)

`Duration`은 양수, 음수, 0, 양의 무한대 또는 음의 무한대일 수 있습니다.

### 기간 생성 {id="create-duration"}

`Duration`을 생성하려면 `Int`, `Long`, `Double` 타입에 대해 제공되는 [확장 프로퍼티](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/#companion-object-properties)인 `nanoseconds`, `microseconds`, `milliseconds`, `seconds`, `minutes`, `hours`, `days`를 사용하세요.

> 여기서 `Days`는 24시간의 기간을 의미합니다. 달력상의 날짜(calendar days)가 아닙니다.
>
{style="tip"}

예를 들어:

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

`Duration` 객체로 기본적인 산술 연산을 수행할 수도 있습니다:

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

### 문자열 표현 가져오기 {id="get-string-representation"}

`Duration`을 출력, 직렬화, 전송 또는 저장하기 위해 문자열 표현을 갖는 것이 유용할 수 있습니다.

문자열 표현을 얻으려면 `.toString()` 함수를 사용하세요. 기본적으로 시간은 존재하는 각 단위를 사용하여 보고됩니다. 예를 들어: `1h 0m 45.677s` 또는 `-(6d 5h 5m 28.284s)`

출력을 구성하려면 원하는 `DurationUnit`과 소수점 자릿수를 함수 파라미터로 전달하여 `.toString()` 함수를 사용하세요:

```kotlin
import kotlin.time.Duration
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.DurationUnit

fun main() {
//sampleStart
    // 소수점 2자리까지 초 단위로 출력
    println(5887.milliseconds.toString(DurationUnit.SECONDS, 2))
    // 5.89s
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-time-string-representation"}

[ISO-8601 호환](https://en.wikipedia.org/wiki/ISO_8601) 문자열을 얻으려면 [`toIsoString()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/to-iso-string.html) 함수를 사용하세요:

```kotlin
import kotlin.time.Duration.Companion.seconds

fun main() {
//sampleStart
    println(86420.seconds.toIsoString()) // PT24H0M20S
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-time-iso-string-representation"}

### 기간 변환 {id="convert-duration"}

`Duration`을 다른 `DurationUnit`으로 변환하려면 다음 프로퍼티들을 사용하세요:
* `inWholeNanoseconds`
* `inWholeMicroseconds`
* `inWholeSeconds`
* `inWholeMinutes`
* `inWholeHours`
* `inWholeDays`

예를 들어:

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

또는 다음 확장 함수에서 원하는 `DurationUnit`을 함수 파라미터로 사용할 수 있습니다:
* `.toInt()`
* `.toDouble()`
* `.toLong()`

예를 들어:

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

### 기간 비교 {id="compare-duration"}

`Duration` 객체가 서로 같은지 확인하려면 동등 연산자(`==`)를 사용하세요:

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

`Duration` 객체를 비교하려면 비교 연산자(`<`, `>`)를 사용하세요:

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

### 기간을 구성 요소로 분해하기 {id="break-duration-into-components"}

`Duration`을 시간 구성 요소로 분해하고 추가 작업을 수행하려면 [`toComponents()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/to-components.html) 함수의 오버로드를 사용하세요. 원하는 작업을 함수 또는 람다 표현식 형태로 함수 파라미터에 추가합니다.

예를 들어:

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

이 예제에서 람다 표현식은 `hours`와 `minutes`를 함수 파라미터로 사용하며, 사용하지 않는 `seconds`와 `nanoseconds` 파라미터에는 밑줄(`_`)을 사용합니다. 이 표현식은 [문자열 템플릿](strings.md#string-templates)을 사용하여 `hours`와 `minutes`로 구성된 원하는 출력 형식의 문자열을 반환합니다.

## 시간 측정 {id="measure-time"}

시간의 흐름을 추적하기 위해 표준 라이브러리는 다음과 같은 작업을 쉽게 수행할 수 있는 도구를 제공합니다:
* 원하는 시간 단위로 특정 코드의 실행 시간을 측정합니다.
* 특정 시점을 표시합니다.
* 두 시점 사이를 비교하고 뺍니다.
* 특정 시점으로부터 시간이 얼마나 지났는지 확인합니다.
* 현재 시간이 특정 시점을 지났는지 확인합니다.

### 코드 실행 시간 측정 {id="measure-code-execution-time"}

코드 블록을 실행하는 데 걸리는 시간을 측정하려면 [`measureTime`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/measure-time.html) 인라인 함수를 사용하세요:

```kotlin
import kotlin.time.measureTime

fun main() {
//sampleStart
    val timeTaken = measureTime {
        Thread.sleep(100)
    }
    println(timeTaken) // 예: 103 ms
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-time-measure-time"}

코드 블록을 실행하는 데 걸리는 시간을 측정**하고** 코드 블록의 결과값을 반환하려면 [`measureTimedValue`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/measure-time.html) 인라인 함수를 사용하세요.

예를 들어:

```kotlin
import kotlin.time.measureTimedValue

fun main() {
//sampleStart
    val (value, timeTaken) = measureTimedValue {
        Thread.sleep(100)
        42
    }
    println(value)     // 42
    println(timeTaken) // 예: 103 ms
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-time-measure-timed-value"}

기본적으로 두 함수 모두 단조 시간 소스를 사용합니다.

### 시점 표시하기 {id="mark-moments-in-time"}

특정 시점을 표시하려면 [`TimeSource`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-source/) 인터페이스와 [`markNow()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-source/mark-now.html) 함수를 사용하여 [`TimeMark`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-mark/)를 생성하세요:

```kotlin
import kotlin.time.*

fun main() {
   val timeSource = TimeSource.Monotonic
   val mark = timeSource.markNow()
}
```

### 시간 차이 측정하기 {id="measure-differences-in-time"}

동일한 시간 소스에서 생성된 `TimeMark` 객체 간의 차이를 측정하려면 빼기 연산자(`-`)를 사용하세요.

동일한 시간 소스에서 생성된 `TimeMark` 객체를 비교하려면 비교 연산자(`<`, `>`)를 사용하세요.

예를 들어:

```kotlin
import kotlin.time.*

fun main() {
//sampleStart
   val timeSource = TimeSource.Monotonic
   val mark1 = timeSource.markNow()
   Thread.sleep(500) // 0.5초 동안 대기
   val mark2 = timeSource.markNow()

   repeat(4) { n ->
       val mark3 = timeSource.markNow()
       val elapsed1 = mark3 - mark1
       val elapsed2 = mark3 - mark2

       println("Measurement 1.${n + 1}: elapsed1=$elapsed1, elapsed2=$elapsed2, diff=${elapsed1 - elapsed2}")
   }
   
   println(mark2 > mark1) // mark2가 mark1보다 나중에 캡처되었으므로 true입니다.
   // true
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-time-measure-difference"}

마감 시간이 지났는지 또는 타임아웃에 도달했는지 확인하려면 [`hasPassedNow()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-mark/has-passed-now.html) 및 [`hasNotPassedNow()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-mark/has-not-passed-now.html) 확장 함수를 사용하세요:

```kotlin
import kotlin.time.*
import kotlin.time.Duration.Companion.seconds

fun main() {
//sampleStart
   val timeSource = TimeSource.Monotonic
   val mark1 = timeSource.markNow()
   val fiveSeconds: Duration = 5.seconds
   val mark2 = mark1 + fiveSeconds

   // 아직 5초가 지나지 않음
   println(mark2.hasPassedNow())
   // false
  
   // 6초 대기
   Thread.sleep(6000)
   println(mark2.hasPassedNow())
   // true

//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-time-deadline=passed"}

## 시간 소스 (Time sources) {id="time-sources"}

기본적으로 시간은 단조 시간 소스를 사용하여 측정됩니다. 단조 시간 소스는 앞으로만 진행되며 타임존과 같은 변화의 영향을 받지 않습니다. 단조 시간의 대안은 벽시계 시간(wall-clock time)으로도 알려진 경과 리얼 타임(elapsed real time)입니다. 경과 리얼 타임은 다른 시점과 상대적으로 측정됩니다.

### 플랫폼별 기본 시간 소스 {id="default-time-sources-per-platform"}

이 표는 각 플랫폼에 대한 단조 시간의 기본 소스를 설명합니다:

| 플랫폼 | 소스 |
|---------------------|---------------------------------------------------------------------|
| Kotlin/JVM | `System.nanoTime()` |
| Kotlin/JS (Node.js) | `process.hrtime()` |
| Kotlin/JS (browser) | `window.performance.now()` 또는 `Date.now()` |
| Kotlin/Native | `std::chrono::high_resolution_clock` 또는 `std::chrono::steady_clock` |

### 시간 소스 생성 {id="create-time-source"}

다른 시간 소스를 사용하고 싶은 경우가 있을 수 있습니다. 예를 들어 Android에서 `System.nanoTime()`은 장치가 활성 상태일 때만 시간을 계산합니다. 장치가 딥 슬립(deep sleep) 상태로 들어가면 시간 추적을 놓치게 됩니다. 장치가 딥 슬립 상태인 동안에도 시간을 추적하려면 [`SystemClock.elapsedRealtimeNanos()`](https://developer.android.com/reference/android/os/SystemClock#elapsedRealtimeNanos())를 사용하는 시간 소스를 생성할 수 있습니다:

```kotlin
object RealtimeMonotonicTimeSource : AbstractLongTimeSource(DurationUnit.NANOSECONDS) {
    override fun read(): Long = SystemClock.elapsedRealtimeNanos()
}
```

그런 다음 이 시간 소스를 사용하여 시간을 측정할 수 있습니다:

```kotlin
fun main() {
    val elapsed: Duration = RealtimeMonotonicTimeSource.measureTime {
        Thread.sleep(100)
    }
    println(elapsed) // 예: 103 ms
}
```
{validate="false"}

`kotlin.time` 패키지에 대한 자세한 내용은 [표준 라이브러리 API 레퍼런스](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/)를 참조하세요.