<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 플로우 연산자)

플로우 연산자를 사용하면 플로우 파이프라인에서 값을 변환하고 처리할 수 있습니다.
Kotlin은 크게 두 가지 종류의 플로우 연산자를 제공합니다:

* [**중간 연산자(Intermediate operators)**](#intermediate-operators)는 업스트림 플로우에서 값을 소비하고 연산을 적용하여 새로운 다운스트림 플로우를 반환합니다.
* [**종단 연산자(Terminal operators)**](#terminal-operators)는 업스트림 플로우를 수집하여 플로우 파이프라인의 실행을 트리거합니다. 결과를 반환할 수도 있습니다.

[`kotlinx.coroutines`](https://github.com/Kotlin/kotlinx.coroutines) 라이브러리는 광범위한 플로우 연산자를 제공하지만, 기본 제공 연산자가 제공하지 않는 동작이 필요한 경우 커스텀 연산자를 직접 정의할 수도 있습니다.

> 아래 섹션들에는 해당 내장 연산자와 함께 커스텀 구현 예제가 포함되어 있습니다.
>
{style="tip"}

## 중간 연산자

중간 연산자는 업스트림 플로우의 값을 소비하는 새로운 다운스트림 플로우를 반환합니다.
최종 결과를 수집하기 전에 여러 중간 연산자를 체이닝하여 플로우 파이프라인을 구축할 수 있습니다.

중간 연산자는 목적에 따라 다음과 같은 카테고리로 분류할 수 있습니다:

* [**변환 연산자(Transforming operators)**](#transforming-operators): 값을 다운스트림으로 방출하기 전에 변환합니다.
* [**필터링 및 크기 제한 연산자(Filtering and size-limiting operators)**](#filtering-and-size-limiting-operators): 어떤 업스트림 값이 다운스트림으로 계속 흐를지 제어합니다.
* [**동시 처리 연산자(Concurrent processing operators)**](#concurrent-processing-operators): 방출이 수집과 별개로 실행되도록 합니다.
* [**합성 연산자(Combining operators)**](#combining-operators): 여러 업스트림 플로우에서 값을 수집하여 하나의 다운스트림 플로우로 방출합니다.
* [**생명 주기 연산자(Lifecycle operators)**](#lifecycle-operators): 수집 시작 또는 업스트림 플로우 완료와 같이 플로우 수집 중 발생하는 특정 이벤트에 대응하여 동작을 실행합니다.

### 변환 연산자

변환 연산자는 업스트림 플로우에서 방출된 값을 변환합니다.
값을 다른 타입으로 변환하거나, 값을 건너뛰거나, 다운스트림으로 추가 값을 방출하는 데 사용할 수 있습니다.

> 변환 연산자는 일시 중단 람다를 받으므로, 각 방출된 값을 처리하는 동안 람다 내부에서 일시 중단 함수를 호출할 수 있습니다.
> 플로우 파이프라인이 동시성을 도입하는 연산자를 사용하지 않는 한, 값들은 여전히 순차적으로 처리됩니다.
>
{style="note"}

[`.transform()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/transform.html) 연산자는 [`.map()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map.html)이나 [`.filter()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/filter.html)와 같은 더 구체적인 변환 연산자의 기초로 사용할 수 있는 일반적인 변환 연산자입니다.

다음은 `.transform()` 연산자를 사용하여 각 업스트림 값을 해당 값의 크기만큼 반복해서 방출하는 예제입니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 기본 .transform() 연산자를 단순화한 커스텀 구현
inline fun <T, R> Flow<T>.myTransform(
    // 값을 다운스트림으로 방출할 수 있는 일시 중단 람다를 받습니다.
    crossinline transform: suspend FlowCollector<R>.(value: T) -> Unit
): Flow<R> = flow {
    // 업스트림 플로우에서 값을 수집합니다.
    this@myTransform.collect { value ->
        // 변환을 적용하고 다운스트림 플로우로 값을 방출합니다.
        this@flow.transform(value)
    }
}

// 기본 .transform() 연산자를 사용합니다.
suspend fun main() = withContext(Dispatchers.Default) {
    val flow = (0..4).asFlow().transform { value ->
        // 각 값을 해당 값의 크기만큼 방출합니다.
        repeat(value) {
            emit(value)
        }
    }
    println(flow.toList())
    // [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
}
```
{kotlin-runnable="true"}

[`.map()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map.html) 연산자를 사용하면 각 업스트림 값을 하나의 다운스트림 값으로 변환할 수 있습니다.

다음은 `.map()`을 사용하여 각 값에 4를 곱하는 예제입니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 기본 .map() 연산자를 단순화한 커스텀 구현
inline fun <T, R> Flow<T>.myMap(
    crossinline transform: suspend (value: T) -> R
): Flow<R> = transform { value ->
    emit(transform(value))
}

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    // 각 업스트림 값에 4를 곱합니다.
    val flow = (0..4).asFlow().map { it * 4 }
    println(flow.toList())
    // [0, 4, 8, 12, 16]
}
//sampleEnd
```
{kotlin-runnable="true"}

조건에 맞는 업스트림 값만 방출하려면 [`.filter()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/filter.html) 연산자를 사용하세요.

다음은 `3`으로 나누었을 때 나머지가 `1`인 값만 방출하는 예제입니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 기본 .filter() 연산자를 단순화한 커스텀 구현
inline fun <T> Flow<T>.myFilter(
    crossinline predicate: suspend (value: T) -> Boolean
): Flow<T> = transform { value ->
    // 조건에 맞는 값만 방출합니다.
    if (predicate(value))
        emit(value)
}

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    // 3으로 나누었을 때 나머지가 1인 값만 방출합니다.
    val flow = (0..10).asFlow().filter { it % 3 == 1 }
    println(flow.toList())
    // [1, 4, 7, 10]
}
//sampleEnd
```
{kotlin-runnable="true"}

어떤 연산자들은 값을 변환하면서 조건에 맞는 결과만 방출함으로써 `.map()`과 `.filter()`의 동작을 결합할 수 있습니다.

예를 들어, [`.mapNotNull()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map-not-null.html)을 사용하면 각 업스트림 값을 변환하고 null이 아닌 결과만 방출할 수 있습니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 기본 .mapNotNull() 연산자를 단순화한 커스텀 구현
inline fun <T, R: Any> Flow<T>.myMapNotNull(
    crossinline transform: suspend (value: T) -> R?
): Flow<R> = transform { value ->
    transform(value)?.let { transformed ->
        emit(transformed)
    }
}

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    // 각 문자열을 Double로 변환하고 변환할 수 없는 값은 건너뜁니다.
    val flow = flowOf("1.2", "10", "11", "error", "0.000")
        .mapNotNull { it.toDoubleOrNull() }
    
    println(flow.toList())
    // [1.2, 10.0, 11.0, 0.0]
}
//sampleEnd
```
{kotlin-runnable="true"}

### 필터링 및 크기 제한 연산자

필터링 및 크기 제한 연산자는 플로우에서 어떤 값이 다운스트림으로 계속 흐를지 제어합니다.
반복되는 연속 값을 제거하거나, 플로우 시작 부분의 값을 건너뛰거나, 지정된 개수의 값을 받은 후 수집을 취소하는 데 사용할 수 있습니다.

반복되는 연속 값을 무시하려면 [`.distinctUntilChanged()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/distinct-until-changed.html) 연산자를 사용하세요.
이 연산자는 이전에 방출된 값과 다를 때만 값을 방출합니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 기본 .distinctUntilChanged() 연산자를 단순화한 커스텀 버전
fun <T> Flow<T>.myDistinctUntilChanged(): Flow<T> = flow {
    var lastEmitted: Any? = Any() // 자기 자신하고만 같은 값
    this@myDistinctUntilChanged.collect { value ->
        if (lastEmitted != value) {
            this@flow.emit(value)
            lastEmitted = value
        }
    }
}

suspend fun main() = withContext(Dispatchers.Default) {
    // 업스트림 플로우에서 반복되는 연속 값을 제거합니다.
    val flow = flowOf(1, 2, 3, 3, 3, 4, 5, 5, 1).distinctUntilChanged()
    println(flow.toList())
    // [1, 2, 3, 4, 5, 1]
}

```
{kotlin-runnable="true"}

[`.drop()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/drop.html) 연산자를 사용하여 업스트림 플로우에서 방출된 처음 몇 개의 값을 건너뛸 수 있습니다.
예를 들어, `.drop(2)`는 처음 두 값을 건너뛰고 나머지 값을 다운스트림으로 방출합니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 기본 .drop() 연산자를 단순화한 커스텀 버전
fun <T> Flow<T>.myDrop(count: Int): Flow<T> = flow {
    require(count >= 0)
    var elementsAlreadyDropped = 0
    this@myDrop.collect { value ->
        if (elementsAlreadyDropped == count) {
            this@flow.emit(value)
        } else {
            ++elementsAlreadyDropped
        }
    }
}

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    // 업스트림 플로우에서 처음 두 값을 건너뜁니다.
    val flow = flowOf(1, 2, 3, 4, 5).drop(2)
    println(flow.toList())
    // [3, 4, 5]
}
//sampleEnd
```
{kotlin-runnable="true"}

정해진 개수의 값을 받은 후 수집을 취소하려면 [`.take()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/take.html) 연산자를 사용하세요.
다음은 `.take()` 연산자를 사용하여 처음 세 개의 값만 수집하는 예제입니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds

// 기본 .take() 연산자를 단순화한 커스텀 버전
fun <T> Flow<T>.myTake(count: Int): Flow<T> = flow {
    require(count > 0)
    val cancellationException = CancellationException()
    var elementsRemaining = count
    try {
        this@myTake.collect {
            emit(it)
            --elementsRemaining
            if (elementsRemaining == 0) {
                // 요청한 개수의 값을 받은 후 업스트림 플로우를 취소합니다.
                throw cancellationException
            }
        }
    } catch (e: Throwable) {
        if (e === cancellationException) {
            // 업스트림 플로우를 취소하는 데 사용된 CancellationException을 처리합니다.
            // .myTake()에서 설정한 개수만큼 완료된 후 플로우를 종료합니다.
        } else {
            // 예기치 않은 예외는 다시 던집니다.
            throw e
        }
    }
}

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    // 업스트림 플로우에서 처음 세 개의 값만 수집합니다.
    val flow = (0..1000).asFlow().take(3)

    println(flow.toList())
    // [0, 1, 2]
}
//sampleEnd
```
{kotlin-runnable="true"}

### 동시 처리 연산자

기본적으로 플로우 파이프라인은 값을 순차적으로 처리합니다.
업스트림 플로우가 값을 방출하면, 다음 값이 방출되기 전에 수집기가 이를 처리합니다.

업스트림 플로우를 다운스트림 수집과 동시에 실행하려면 동시 처리 연산자를 사용하여 버퍼를 도입하세요.
버퍼는 업스트림 플로우가 방출했지만 수집기가 아직 처리하지 않은 값을 저장합니다.

이러한 버퍼를 도입하는 연산자 중 하나는 [`.buffer()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/buffer.html) 연산자입니다.
이 연산자를 사용하면 버퍼 용량과 버퍼가 가득 찼을 때의 동작을 설정할 수 있습니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    flow {
        repeat(10) {
            emit(it)
            println("Emitted $it!")
        }
    }
        // 업스트림 플로우가 수집기보다 최대 4개 더 많은 값을 방출할 수 있게 합니다.
        .buffer(4)
        .collect {
            println("Processed $it!")
            delay(20.milliseconds)
        }
}
//sampleEnd
```
{kotlin-runnable="true"}

수집기가 업스트림 플로우보다 느릴 때, 파이프라인은 수집기가 아직 처리하지 못한 값들을 처리할 방법이 필요합니다.

기본적으로 수집기는 업스트림 플로우에 *백프레셔(backpressure)*를 적용합니다.
이 전략을 사용하면 버퍼가 가득 찼을 때 업스트림 플로우가 일시 중단되고, 수집기가 공간을 확보하면 다시 재개됩니다.

업스트림 플로우를 일시 중단하는 대신 값을 버리려면 [`onBufferOverflow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-buffer-overflow/) 파라미터를 설정하세요:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    flow {
        repeat(10) {
            emit(it)
            println("Emitted $it!")
        }
    }
        // 오버플로우 동작을 적용하기 전까지 최대 4개의 값을 저장합니다.
        // 버퍼가 가득 차면 가장 오래된 버퍼링된 값을 버립니다.
        .buffer(4, onBufferOverflow = BufferOverflow.DROP_OLDEST)
        .collect { value ->
            println("Processed $value!")
            delay(20.milliseconds)
        }
}
//sampleEnd
```
{kotlin-runnable="true"}

`buffer(1, onBufferOverflow = BufferOverflow.DROP_OLDEST)`의 축약형인 [`.conflate()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/conflate.html) 연산자를 사용할 수도 있습니다.
이전 값을 수집하는 동안 방출된 값들을 건너뛰고 최신 값만 처리하고 싶을 때 사용하세요:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    flow {
        repeat(10) {
            emit(it)
            println("Emitted $it!")
        }
    }.conflate().collect {
        println("Processed $it!")
        delay(20.milliseconds)
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

`.conflate()` 연산자는 수집기가 어떤 버퍼링된 값을 처리할지에만 영향을 줍니다.
이미 시작된 처리를 취소하지는 않습니다.
그렇게 하려면 대신 [`collectLatest()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/collect-latest.html)를 사용하세요.

위의 예제들에서 `.buffer()`와 `.conflate()` 연산자는 코루틴 컨텍스트를 변경하지 않고 별도의 코루틴에서 업스트림 플로우를 동시에 실행합니다.

업스트림 플로우를 다른 코루틴 컨텍스트에서 실행하려면 [`.flowOn()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow-on.html) 연산자를 사용하세요.
만약 디스패처가 변경되면, `.flowOn()`은 별도의 코루틴에서 업스트림 플로우를 수집하고 업스트림 방출과 다운스트림 수집 사이에 버퍼를 사용합니다.

다음은 `.flowOn()`을 사용하여 `Dispatchers.IO`에서 업스트림 플로우를 실행하는 단순화된 예제입니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    flow {
        repeat(10) {
            emit(it)
        }
        println("Finished emitting!")
    }.flowOn(Dispatchers.IO).collect {
        println("Received $it!")
        delay(10.milliseconds)
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

이 예제에서 `.flowOn()` 연산자는 동시 업스트림 처리를 도입할 수 있지만, 버퍼 동작이 명시적으로 구성되지는 않았습니다.

업스트림 플로우의 코루틴 컨텍스트와 버퍼 동작을 모두 구성하려면 `.flowOn()`을 `.buffer()` 또는 `.conflate()`와 결합하세요.
이러한 연산자들을 함께 사용하면 연산자들이 *연산자 융합(operator fusion)*을 수행하고 단일 버퍼를 공유하게 됩니다.

다음은 `Dispatchers.IO`에서 업스트림 플로우를 실행하기 위해 `.flowOn(Dispatchers.IO)`를 사용하고, 최신 버퍼링된 값을 유지하기 위해 `.conflate()`를 사용하는 예제입니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.Random
import kotlin.time.Duration.Companion.milliseconds
import kotlin.math.round

//sampleStart
fun awaitSensorSignal(): SensorSignal {
    Thread.sleep(10)
    val reading =
        round(Random.nextDouble(25.0, 100.0) * 100.0)/100.0
    println("Measured $reading as the temperature")
    return SensorSignal(temperatureCelsius = reading)
}

data class SensorSignal(
    val temperatureCelsius: Double
)

suspend fun sendLatestTemperature(temperatureCelsius: Double) {
    println("Starting to send $temperatureCelsius...")
    delay(50.milliseconds)
    println("Sent $temperatureCelsius.")
}

suspend fun main() = withContext(Dispatchers.Default) {
    val smartHomeTemperatureFlow = flow {
        while (true) {
            val signal = awaitSensorSignal()
            emit(signal.temperatureCelsius)
            println("Emitted $signal")
        }
    }
        // Dispatchers.IO에서 업스트림 플로우를 실행합니다.
        .flowOn(Dispatchers.IO)
        // 최신 버퍼링된 값을 유지하고 이전 값들은 버립니다.
        .conflate()
        // 업스트림 플로우에서 처음 두 개의 값만 수집합니다.
        .take(2)
        .collect { temperature ->
            println("Received $temperature!")
            sendLatestTemperature(temperature)
        }
}
//sampleEnd
```
{kotlin-runnable="true"}

### 합성 연산자

합성 연산자는 여러 업스트림 플로우의 값을 소비하여 하나의 다운스트림 플로우를 반환합니다.
수집기가 두 개 이상의 플로우에서 오는 값을 필요로 할 때 사용합니다.

두 업스트림 플로우의 값을 쌍으로 맞추려면 [`.zip()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/zip.html) 연산자를 사용하세요.
이 연산자는 각 플로우의 첫 번째 값들을 결합하고, 그다음 두 번째 값들을 결합하는 방식으로 작동합니다.
결과 플로우는 업스트림 플로우 중 하나가 완료되는 즉시 완료됩니다.

예제는 다음과 같습니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.Random
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    // 100밀리초마다 티커 값을 방출합니다.
    val tickerFlow = flow {
        while (true) {
            emit(Unit)
            delay(100.milliseconds)
        }
    }

    val start = TimeSource.Monotonic.markNow()
    tickerFlow
        // 각 티커 방출을 다음 숫자와 결합합니다.
        .zip(flowOf(1, 2, 3)) { _, value ->
            value
        }.collect {
            println("${start.elapsedNow()}: received $it")
        }
}
//sampleEnd
```
{kotlin-runnable="true"}

여러 플로우의 최신 값을 결합하려면 [`.combine()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/combine.html) 연산자를 사용하세요.
어느 업스트림 플로우라도 값을 방출하면, 각 업스트림 플로우의 최신 값을 사용하여 새 값을 방출합니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

//sampleStart
enum class Theme {
    Dark,
    Light,
}

data class UiState(
    val messages: List<String>,
    val theme: Theme,
)

val messagesFlow = MutableStateFlow(
    listOf(
        "Hello!",
        "Is anyone here?",
    )
)

val themeFlow = MutableStateFlow(
    Theme.Light
)

// 두 업스트림 플로우의 최신 값을 결합합니다.
val uiStateFlow = combine(messagesFlow, themeFlow) { messages, theme ->
    UiState(messages, theme)
}

suspend fun main() {
    withContext(Dispatchers.Default) {
        // 첫 번째 업데이트가 발생하기 전에 구독하기 위해 UNDISPATCHED를 사용합니다.
        val uiUpdateJob = launch(start = CoroutineStart.UNDISPATCHED) {
            uiStateFlow.collect {
                // UI를 그립니다.
                println(it)
            }
        }
        messagesFlow.update { messages -> messages + "I'll be back!" }
        delay(100.milliseconds)
        
        themeFlow.value = Theme.Dark
        delay(100.milliseconds)
        
        uiUpdateJob.cancel()
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

이 예제에서 `combine()`은 `messagesFlow`와 `themeFlow`의 최신 값으로 `uiStateFlow`를 생성합니다.
두 업스트림 플로우 중 하나를 업데이트하면 최신 메시지와 테마를 포함하는 새로운 `UiState`가 방출됩니다.

여러 플로우의 값을 동시에 수집하여 하나의 다운스트림 플로우로 방출하려면 [`.merge()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/merge.html) 연산자를 사용하세요:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

//sampleStart
interface UiEvent

class ClickEvent: UiEvent

class RightClickEvent: UiEvent

suspend fun main() {
    withContext(Dispatchers.Default) {

        val clickFlow = MutableSharedFlow<ClickEvent>()
        val rightClickFlow = MutableSharedFlow<RightClickEvent>()

        coroutineScope {
            // 첫 번째 업데이트가 발생하기 전에 구독하기 위해 UNDISPATCHED를 사용합니다.
            val collectJob = launch(start = CoroutineStart.UNDISPATCHED) {

                // 두 업스트림 플로우를 동시에 수집하고 그 값을 다운스트림으로 방출합니다.
                merge(clickFlow, rightClickFlow).collect {
                    println("Observed an event: $it")
                }
            }
            clickFlow.emit(ClickEvent())
            delay(100.milliseconds)
            
            clickFlow.emit(ClickEvent())
            delay(100.milliseconds)
            
            rightClickFlow.emit(RightClickEvent())
            delay(100.milliseconds)
            
            collectJob.cancel()
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

### 생명 주기 연산자

생명 주기 연산자는 플로우 수집 중 특정 시점에 실행되는 일시 중단 람다를 받습니다.
플로우가 수집되기 전, 각 값이 방출되기 전, 수집이 완료된 후, 또는 플로우가 아무런 값도 방출하지 않고 완료될 때 실행될 로직을 배치하는 데 사용할 수 있습니다.

[`.onStart()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-start.html) 연산자는 업스트림 플로우가 수집되기 전에 람다를 실행합니다.
각 값이 방출되기 전에 실행되어야 하는 코드는 [`.onEach()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-each.html)를 사용하세요.

> `.onStart()`와 유사하게, 핫 플로우(hot flow)의 경우 구독자가 플로우 수집을 시작한 후, 어떤 값이 방출되기 전에 코드를 실행하려면 [`.onSubscription()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-subscription.html)을 사용할 수 있습니다.
>
{style="note"}

다음은 수집이 시작되기 전과 각 값이 다운스트림으로 방출되기 전에 메시지를 출력하기 위해 이 연산자들을 사용하는 예제입니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

// 기본 .onStart() 연산자를 단순화한 커스텀 버전
fun <T> Flow<T>.myOnStart(
    action: suspend FlowCollector<T>.() -> Unit
): Flow<T> = flow {
    this@flow.action()
    this@myOnStart.collect(this@flow)
}

suspend fun main() {
    withContext(Dispatchers.Default) {
        flowOf("Page 1", "Page 2", "Page 3").onStart {
            println("Processing pages!")
        }.onEach {
            println("Emitted $it")
        }.collect {
            println("Collected $it")
        }
    }
}
```
{kotlin-runnable="true"}

수집이 완료된 후 코드를 실행하려면 [`.onCompletion()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-completion.html) 연산자를 사용하세요.
이 연산자의 람다는 업스트림 플로우가 성공적으로 완료되었을 때 다운스트림으로 추가 값을 방출할 수 있습니다. 예를 들면 다음과 같습니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

// 기본 .onCompletion() 연산자를 단순화한 커스텀 버전
fun <T> Flow<T>.myOnCompletion(
    action: suspend FlowCollector<T>.(cause: Throwable?) -> Unit
): Flow<T> = flow {
    var exception: Throwable? = null
    try {
        this@myOnCompletion.collect(this@flow)
    } catch (e: Throwable) {
        // `action`을 실행하되, `action`에서 `emit`을 호출하면 그 안에서 `e`를 던집니다.
        FlowCollector<T> { throw e }.action(e)
        throw e
    }
    this@flow.action(null)
}

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default) {
        flowOf("Page 1", "Page 2", "Page 3").onCompletion {
            println("Almost done...")
            // 업스트림 플로우가 완료된 후 추가 값을 방출합니다.
            emit("Last Page!")
        }.collect {
            println("Collected $it")
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

업스트림 플로우가 아무런 값도 방출하지 않고 완료되었을 때 코드를 실행하려면 [`.onEmpty()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-empty.html) 연산자를 사용하세요:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

// 기본 .onEmpty() 연산자를 단순화한 커스텀 버전
fun <T> Flow<T>.myOnEmpty(
    action: suspend FlowCollector<T>.() -> Unit
): Flow<T> = flow {
    var emittedSomething = false
    this@myOnEmpty.collect { value ->
        emittedSomething = true
        this@flow.emit(value)
    }
    if (!emittedSomething) {
        action()
    }
}

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default) {
        flowOf("Page 1", "Page 2", "Page 3").onEmpty {
            // 업스트림 플로우가 값을 방출하므로 아무것도 출력되지 않습니다.
            println("No pages to load!")
        }.collect()
        flowOf<Int>().onEmpty {
            println("No pages to load!")
            // No pages to load!
        }.collect()
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

## 종단 연산자

종단 연산자는 플로우를 수집합니다.
방출된 값을 소비하거나, 수집된 값을 기반으로 결과를 반환하거나, [특정 `CoroutineScope`에서 플로우를 수집](#특정-coroutinescope에서-플로우-수집하기)하는 데 사용할 수 있습니다.

플로우를 수집하려면 [`collect()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/collect.html) 연산자를 사용하세요.
`collect()`에 람다를 전달하면 각 방출된 값을 전달받습니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default) {
        flowOf(1, 2, 3).collect {
            println("Collected $it!")
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

람다 없이 `collect()`를 호출할 수도 있습니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default) {
        flowOf(1, 2, 3).onEach {
            println("Collected $it!")
        }.collect()
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

플로우를 수집하되 새로운 값이 방출될 때 완료되지 않은 작업을 취소하고 싶다면 [`collectLatest()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/collect-latest.html) 연산자를 사용하세요:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default) {
        flow {
            println("Emitting Page 1")
            emit("Page 1")
            delay(50.milliseconds)
            println("Emitting Page 2 in quick succession")
            emit("Page 2")
            delay(200.milliseconds)
            println("Emitting Page 3")
            emit("Page 3")
        }.flowOn(Dispatchers.IO).collectLatest {
            println("Starting to process $it!")
            try {
                delay(100.milliseconds)
            } catch (e: CancellationException) {
                println("Canceled processing $it.")
                throw e
            }
            println("Done processing!")
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

일부 종단 연산자는 플로우를 수집하고 수집된 값을 기반으로 결과를 반환합니다.
예를 들어, [`.first()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/first.html) 연산자를 사용하여 첫 번째 방출된 값을 반환하고 수집을 취소할 수 있습니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

suspend fun main() { 
    withContext(Dispatchers.Default) {
        val firstValue = flowOf(1, 2, 3).first()

        println(firstValue)
        // 1
    }
}
```
{kotlin-runnable="true"}

[`.toList()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/to-list.html) 또는 [`.toSet()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/to-set.html) 연산자를 사용하여 방출된 값들을 컬렉션으로 수집할 수 있습니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 기본 .toList() 연산자를 단순화한 커스텀 구현
suspend fun <T> Flow<T>.myToList(): List<T> = buildList {
    this@myToList.collect { value ->
        // 각 방출된 값을 결과 리스트에 추가합니다.
        add(value)
    }
}

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default) {
        val list = flowOf(1, 2, 3).toList()
        println(list)
        // [1, 2, 3]

        val set = flowOf(1, 2, 2, 3).toSet()
        println(set)
        // [1, 2, 3]
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

방출된 값들을 결합하여 하나의 결과로 만들려면 [`.reduce()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/reduce.html) 또는 [`.fold()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/fold.html) 연산자를 사용하세요.
`.fold()` 연산자는 사용자가 제공한 값을 시작 값으로 사용하며, `.reduce()` 연산자는 첫 번째 방출된 값을 시작 값으로 사용합니다.

예제는 다음과 같습니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default) {
        // 첫 번째 방출된 값을 시작 값으로 사용합니다.
        val reduced = flowOf(1, 2, 3).reduce { accumulator, value ->
            accumulator + value
        }

        // 제공된 시작 값으로 시작합니다.
        val folded = flowOf(1, 2, 3).fold(2) { accumulator, value ->
            accumulator + value
        }

        println(reduced)
        // 6

        println(folded)
        // 8
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

### 특정 `CoroutineScope`에서 플로우 수집하기

화면이나 수명이 긴 다른 객체가 플로우의 값을 필요로 할 때, 해당 객체의 `CoroutineScope`에서 수집기를 시작하세요.
이렇게 하면 객체가 파괴될 때 해당 객체의 `CoroutineScope`를 취소함으로써 수집도 함께 취소되도록 보장할 수 있습니다.

특정 `CoroutineScope`에서 플로우를 수집하려면 [`.launchIn()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/launch-in.html) 종단 연산자를 사용하세요.
이 연산자는 수집용 코루틴의 `Job`을 반환합니다.

다음은 화면이 `StateFlow`에서 값을 수집하고, 화면이 닫힐 때 수집용 코루틴을 중단하는 예제입니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

// 기본 .launchIn() 연산자를 단순화한 커스텀 버전
fun <T> Flow<T>.myLaunchIn(scope: CoroutineScope): Job = scope.launch {
    this@myLaunchIn.collect()
}

//sampleStart
data class Coordinate(val x: Int, val y: Int)

class MyScreen(val scope: CoroutineScope) {
    private val _mousePosition =
        MutableStateFlow<Coordinate>(Coordinate(0, 0))
    val mousePosition get() = _mousePosition.asStateFlow()

    init {
        // 화면의 CoroutineScope에서 StateFlow 수집을 시작합니다.
        mousePosition.onEach {
            updateStatusBar()
        }.launchIn(scope)
    }

    fun moveMouse(newCoordinate: Coordinate) {
        _mousePosition.value = newCoordinate
    }

    private fun updateStatusBar() {
        println("Mouse is at ${_mousePosition.value}")
    }
}

suspend fun main() {
    withContext(Dispatchers.Default) {
        val childScope = CoroutineScope(
            currentCoroutineContext() + Job(currentCoroutineContext()[Job])
        )
        val screen = MyScreen(childScope)
        delay(100.milliseconds)
        
        screen.moveMouse(Coordinate(10, 15))
        delay(100.milliseconds)
        
        screen.moveMouse(Coordinate(1, 3))
        delay(100.milliseconds)
        
        childScope.cancel()
    }
}
//sampleEnd
```
{kotlin-runnable="true"}