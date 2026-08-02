<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: Flow 運算子)

Flow 運算子讓您可以轉換並處理 Flow 管線中的值。
Kotlin 提供兩類主要的 Flow 運算子：

* [**中間運算子 (Intermediate operators)**](#intermediate-operators) 會傳回一個新的下游 Flow，其取用來自上游 Flow 的值並對其套用操作。
* [**終端運算子 (Terminal operators)**](#terminal-operators) 透過收集上游 Flow 來觸發 Flow 管線的執行。它們也可能傳回一個結果。

雖然 [`kotlinx.coroutines`](https://github.com/Kotlin/kotlinx.coroutines) 程式庫提供了廣泛的 Flow 運算子，
但當您需要內建運算子未提供的行為時，也可以自訂運算子。

> 以下章節包含自訂實作以及對應內建運算子的範例。
>
{style="tip"}

## 中間運算子

中間運算子會傳回一個新的下游 Flow，其取用來自上游 Flow 的值。
在收集最終結果之前，您可以串接多個中間運算子來建立一個 Flow 管線。

中間運算子可以依用途分為以下類別：

* [**轉換運算子 (Transforming operators)**](#transforming-operators) 在向下游發出值之前對其進行轉換。
* [**篩選與大小限制運算子 (Filtering and size-limiting operators)**](#filtering-and-size-limiting-operators) 控制哪些上游的值能繼續流向下游。
* [**並行處理運算子 (Concurrent processing operators)**](#concurrent-processing-operators) 讓發出值與收集值能分別執行。
* [**組合運算子 (Combining operators)**](#combining-operators) 收集來自多個上游 Flow 的值，並將其發出至單個下游 Flow。
* [**生命週期運算子 (Lifecycle operators)**](#lifecycle-operators) 針對 Flow 收集期間的特定事件執行操作，例如當收集開始或上游 Flow 完成時。

### 轉換運算子

轉換運算子會轉換上游 Flow 發出的值。
您可以使用它們將值轉換為另一種類型、跳過某些值，或向下游發出額外的值。

> 轉換運算子接受暫停 Lambda，因此其 Lambda 在處理每個發出的值時可以呼叫暫停函式。
> 它們仍會按順序處理值，除非 Flow 管線使用了引入並行的運算子。
>
{style="note"}

[`.transform()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/transform.html) 運算子是一個通用的轉換運算子，您可以將其作為更具體轉換運算子的基礎，例如 [`.map()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map.html) 和 [`.filter()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/filter.html)。

以下範例使用 `.transform()` 運算子，按其數值發出對應次數的每個上游值：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 預設 .transform() 運算子的簡化自訂實作
inline fun <T, R> Flow<T>.myTransform(
    // 接受一個可以向下游發出值的暫停 Lambda
    crossinline transform: suspend FlowCollector<R>.(value: T) -> Unit
): Flow<R> = flow {
    // 收集來自上游 Flow 的值
    this@myTransform.collect { value ->
        // 套用轉換並將值發出到下游 Flow
        this@flow.transform(value)
    }
}

// 使用預設的 .transform() 運算子
suspend fun main() = withContext(Dispatchers.Default) {
    val flow = (0..4).asFlow().transform { value ->
        // 按其數值發出對應次數的每個值
        repeat(value) {
            emit(value)
        }
    }
    println(flow.toList())
    // [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
}
```
{kotlin-runnable="true"}

您可以使用 [`.map()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map.html) 運算子將每個上游值轉換為一個下游值。

以下範例使用 `.map()` 將每個值乘以 4：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 預設 .map() 運算子的簡化自訂實作
inline fun <T, R> Flow<T>.myMap(
    crossinline transform: suspend (value: T) -> R
): Flow<R> = transform { value ->
    emit(transform(value))
}

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    // 將每個上游值乘以 4
    val flow = (0..4).asFlow().map { it * 4 }
    println(flow.toList())
    // [0, 4, 8, 12, 16]
}
//sampleEnd
```
{kotlin-runnable="true"}

若要僅發出符合條件的上游值，請使用 [`.filter()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/filter.html) 運算子。

以下範例僅發出除以 `3` 餘數為 `1` 的值：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 預設 .filter() 運算子的簡化自訂實作
inline fun <T> Flow<T>.myFilter(
    crossinline predicate: suspend (value: T) -> Boolean
): Flow<T> = transform { value ->
    // 僅發出符合條件的值
    if (predicate(value))
        emit(value)
}

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    // 僅發出除以 3 餘數為 1 的值
    val flow = (0..10).asFlow().filter { it % 3 == 1 }
    println(flow.toList())
    // [1, 4, 7, 10]
}
//sampleEnd
```
{kotlin-runnable="true"}

某些運算子可以結合其他轉換運算子的行為（如 `.map()` 和 `.filter()`），透過轉換值並僅發出符合條件的結果。

例如，使用 [`.mapNotNull()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map-not-null.html) 轉換每個上游值，並僅發出非 null 的結果：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 預設 .mapNotNull() 運算子的簡化自訂實作
inline fun <T, R: Any> Flow<T>.myMapNotNull(
    crossinline transform: suspend (value: T) -> R?
): Flow<R> = transform { value ->
    transform(value)?.let { transformed ->
        emit(transformed)
    }
}

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    // 將每個字串轉換為 Double 並跳過無法轉換的值
    val flow = flowOf("1.2", "10", "11", "error", "0.000")
        .mapNotNull { it.toDoubleOrNull() }
    
    println(flow.toList())
    // [1.2, 10.0, 11.0, 0.0]
}
//sampleEnd
```
{kotlin-runnable="true"}

### 篩選與大小限制運算子

篩選與大小限制運算子控制哪些值能從 Flow 繼續流向下游。
您可以使用它們移除連續重複的值、跳過 Flow 開頭的值，或在達到指定數量的值後取消收集。

若要忽略連續重複的值，請使用 [`.distinctUntilChanged()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/distinct-until-changed.html) 運算子。
它僅在值與前一個發出的值不同時才發出該值：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 預設 .distinctUntilChanged() 運算子的簡化自訂版本
fun <T> Flow<T>.myDistinctUntilChanged(): Flow<T> = flow {
    var lastEmitted: Any? = Any() // 一個僅等於其自身的值
    this@myDistinctUntilChanged.collect { value ->
        if (lastEmitted != value) {
            this@flow.emit(value)
            lastEmitted = value
        }
    }
}

suspend fun main() = withContext(Dispatchers.Default) {
    // 移除上游 Flow 中連續重複的值
    val flow = flowOf(1, 2, 3, 3, 3, 4, 5, 5, 1).distinctUntilChanged()
    println(flow.toList())
    // [1, 2, 3, 4, 5, 1]
}

```
{kotlin-runnable="true"}

您可以使用 [`.drop()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/drop.html) 運算子跳過上游 Flow 發出的前幾個值。
例如，`.drop(2)` 會跳過前兩個值，並將剩餘的值發出到下游：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 預設 .drop() 運算子的簡化自訂版本
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
    // 跳過上游 Flow 的前兩個值
    val flow = flowOf(1, 2, 3, 4, 5).drop(2)
    println(flow.toList())
    // [3, 4, 5]
}
//sampleEnd
```
{kotlin-runnable="true"}

若要在收集固定數量的值後取消收集，請使用 [`.take()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/take.html) 運算子。
以下範例使用 `.take()` 運算子僅收集前三個值：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds

// 預設 .take() 運算子的簡化自訂版本
fun <T> Flow<T>.myTake(count: Int): Flow<T> = flow {
    require(count > 0)
    val cancellationException = CancellationException()
    var elementsRemaining = count
    try {
        this@myTake.collect {
            emit(it)
            --elementsRemaining
            if (elementsRemaining == 0) {
                // 在達到要求的值數量後取消上游 Flow
                throw cancellationException
            }
        }
    } catch (e: Throwable) {
        if (e === cancellationException) {
            // 處理用於取消上游 Flow 的 CancellationException
            // 在 .myTake() 設定的值數量後完成 Flow
        } else {
            // 重新拋出非預期的例外
            throw e
        }
    }
}

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    // 僅收集上游 Flow 的前三個值
    val flow = (0..1000).asFlow().take(3)

    println(flow.toList())
    // [0, 1, 2]
}
//sampleEnd
```
{kotlin-runnable="true"}

### 並行處理運算子

預設情況下，Flow 管線會按順序處理值。
上游 Flow 發出一個值，收集器先對其進行處理，然後才發出下一個值。

若要讓上游 Flow 與下游收集並行執行，請使用並行處理運算子來引入緩衝。
緩衝區會儲存上游 Flow 已發出但收集器尚未處理的值。

其中一個引入此緩衝區的運算子是 [`.buffer()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/buffer.html) 運算子。
它讓您可以設定緩衝容量以及當緩衝區滿時的操作，例如：

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
        // 讓上游 Flow 最多可領先收集器發出四個值
        .buffer(4)
        .collect {
            println("Processed $it!")
            delay(20.milliseconds)
        }
}
//sampleEnd
```
{kotlin-runnable="true"}

當收集器的速度慢於上游 Flow 時，管線需要一種方式來處理收集器尚未處理的值。

預設情況下，收集器會對上游 Flow 套用 *反壓 (Backpressure)*。
在這種策略下，當緩衝區滿時，上游 Flow 會暫停，並在收集器釋出空間時恢復。

若要捨棄值而不是暫停上游 Flow，請設定 [`onBufferOverflow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-buffer-overflow/) 參數：

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
        // 在套用溢出行為前最多儲存四個值
        // 當緩衝區滿時，捨棄最舊的緩衝值
        .buffer(4, onBufferOverflow = BufferOverflow.DROP_OLDEST)
        .collect { value ->
            println("Processed $value!")
            delay(20.milliseconds)
        }
}
//sampleEnd
```
{kotlin-runnable="true"}

您也可以使用 [`.conflate()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/conflate.html) 運算子，它是 `buffer(1, onBufferOverflow = BufferOverflow.DROP_OLDEST)` 的簡寫。
當您只想處理最新值，並跳過在前一個值收集期間發出的值時，可以使用它：

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

`.conflate()` 運算子僅影響收集器處理哪些緩衝值。
它不會取消已經開始的處理過程。
若要取消已開始的處理，請改用 [`collectLatest()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/collect-latest.html)。

在先前的範例中，`.buffer()` 和 `.conflate()` 運算子會在單獨的協同程式中並行執行上游 Flow，且不改變其協同程式上下文。

若要在不同的協同程式上下文中執行上游 Flow，請使用 [`.flowOn()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow-on.html) 運算子。
如果這改變了調度器，`.flowOn()` 會在單獨的協同程式中收集上游 Flow，並在上游發出與下游收集之間使用緩衝。

以下是一個簡化範例，使用 `.flowOn()` 在 `Dispatchers.IO` 中執行上游 Flow：

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

在此範例中，`.flowOn()` 運算子可以引入並行的上游處理，但未明確設定緩衝行為。

若要同時設定上游 Flow 的協同程式上下文與緩衝行為，請將 `.flowOn()` 與 `.buffer()` 或 `.conflate()` 結合使用。
當您同時使用這些運算子時，運算子會執行 *運算子融合 (Operator fusion)* 並共享單個緩衝區。

以下範例使用 `.flowOn(Dispatchers.IO)` 在 `Dispatchers.IO` 中執行上游 Flow，並使用 `.conflate()` 保留最新的緩衝值：

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
        // 在 Dispatchers.IO 中執行上游 Flow
        .flowOn(Dispatchers.IO)
        // 保留最新的緩衝值並捨棄舊值
        .conflate()
        // 從上游 Flow 收集前兩個值
        .take(2)
        .collect { temperature ->
            println("Received $temperature!")
            sendLatestTemperature(temperature)
        }
}
//sampleEnd
```
{kotlin-runnable="true"}

### 組合運算子

組合運算子取用來自多個上游 Flow 的值，並傳回單個下游 Flow。
當收集器需要來自多個 Flow 的值時，請使用這些運算子。

若要配對兩個上游 Flow 的值，請使用 [`.zip()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/zip.html) 運算子。
它會結合每個 Flow 的第一個值，然後結合每個 Flow 的第二個值，依此類推。
產生的 Flow 會在其中一個上游 Flow 完成時立即完成。

以下是一個範例：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.Random
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    // 每 100 毫秒發出一個單元值
    val tickerFlow = flow {
        while (true) {
            emit(Unit)
            delay(100.milliseconds)
        }
    }

    val start = TimeSource.Monotonic.markNow()
    tickerFlow
        // 將每個計時器的發出與下一個數字結合
        .zip(flowOf(1, 2, 3)) { _, value ->
            value
        }.collect {
            println("${start.elapsedNow()}: received $it")
        }
}
//sampleEnd
```
{kotlin-runnable="true"}

若要結合多個 Flow 的最新值，請使用 [`.combine()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/combine.html) 運算子。
每當任何一個上游 Flow 發出值時，它都會使用每個上游 Flow 的最新值發出一個新值：

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

// 結合兩個上游 Flow 的最新值
val uiStateFlow = combine(messagesFlow, themeFlow) { messages, theme ->
    UiState(messages, theme)
}

suspend fun main() {
    withContext(Dispatchers.Default) {
        // 使用 UNDISPATCHED 以在第一次更新發生前進行訂閱
        val uiUpdateJob = launch(start = CoroutineStart.UNDISPATCHED) {
            uiStateFlow.collect {
                // 繪製 UI
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

在此範例中，`combine()` 使用來自 `messagesFlow` 和 `themeFlow` 的最新值建立了 `uiStateFlow`。
更新任何一個上游 Flow 都會發出一個帶有最新訊息與佈景主題的新 `UiState`。

如果您想要並行收集多個 Flow 的值並將其值發出到單個下游 Flow 中，請使用 [`.merge()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/merge.html) 運算子：

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
            // 使用 UNDISPATCHED 以在第一次更新發生前進行訂閱
            val collectJob = launch(start = CoroutineStart.UNDISPATCHED) {

                // 並行收集兩個上游 Flow 並將其值發出到下游
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

### 生命週期運算子

生命週期運算子接受在 Flow 收集期間的特定點執行的暫停 Lambda。
您可以使用它們在 Flow 被收集前、每個值被發出前、收集完成後，或者當 Flow 在未發出任何值的情況下完成時放置邏輯。

[`.onStart()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-start.html) 運算子在上游 Flow 被收集之前執行其 Lambda。
對於需要在每個值發出之前執行的程式碼，請使用 [`.onEach()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-each.html)。

> 與 `.onStart()` 類似，對於熱 Flow，您可以使用 [`.onSubscription()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-subscription.html) 在訂閱者開始收集 Flow 之後、但在其收集到任何發出的值之前執行程式碼。
>
{style="note"}

以下範例使用這些運算子在收集開始前以及每個值發出到下游之前印出訊息：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

// 預設 .onStart() 運算子的簡化自訂版本
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

若要在收集完成後執行程式碼，請使用 [`.onCompletion()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-completion.html) 運算子。
其 Lambda 可以在上游 Flow 成功完成時向下游發出值，例如：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

// 預設 .onCompletion() 運算子的簡化自訂版本
fun <T> Flow<T>.myOnCompletion(
    action: suspend FlowCollector<T>.(cause: Throwable?) -> Unit
): Flow<T> = flow {
    var exception: Throwable? = null
    try {
        this@myOnCompletion.collect(this@flow)
    } catch (e: Throwable) {
        // 執行 `action`，但如果 `action` 呼叫 `emit`，則從中拋出 `e`
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
            // 在上游 Flow 完成後發出一個額外的值
            emit("Last Page!")
        }.collect {
            println("Collected $it")
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

若要在上游 Flow 完成且未發出任何值時執行程式碼，請使用 [`.onEmpty()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-empty.html) 運算子：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

// 預設 .onEmpty() 運算子的簡化自訂版本
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
            // 不會印出任何內容，因為上游 Flow 有發出值
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

## 終端運算子

終端運算子收集 Flow。
您可以使用它們來取用發出的值、根據收集的值傳回結果，或[在特定的 `CoroutineScope` 中收集 Flow](#在特定的-coroutinescope-中收集-flow)。

若要收集 Flow，請使用 [`collect()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/collect.html) 運算子。
如果您將 Lambda 傳遞給 `collect()`，它會接收每個發出的值：

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

您也可以在不帶 Lambda 的情況下呼叫 `collect()`：

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

如果您想要收集 Flow，但要在發出新值時取消未完成的工作，請使用 [`collectLatest()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/collect-latest.html) 運算子：

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

某些終端運算子收集 Flow 並根據收集的值傳回結果。
例如，您可以使用 [`.first()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/first.html) 運算子傳回第一個發出的值，然後取消收集：

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

您可以使用 [`.toList()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/to-list.html) 或 [`.toSet()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/to-set.html) 運算子將發出的值收集到集合中：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 預設 .toList() 運算子的簡化自訂實作
suspend fun <T> Flow<T>.myToList(): List<T> = buildList {
    this@myToList.collect { value ->
        // 將每個發出的值新增到結果清單中
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

若要將發出的值組合成單個結果，請使用 [`.reduce()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/reduce.html) 或 [`.fold()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/fold.html) 運算子。
`.fold()` 運算子使用您提供的值作為起始值，而 `.reduce()` 運算子則改為使用第一個發出的值作為起始值。

以下是一個範例：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default) {
        // 使用第一個發出的值作為起始值
        val reduced = flowOf(1, 2, 3).reduce { accumulator, value ->
            accumulator + value
        }

        // 從提供的起始值開始
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

### 在特定的 `CoroutineScope` 中收集 Flow

當畫面或另一個長效物件需要來自 Flow 的值時，請在該物件的 `CoroutineScope` 中啟動收集器。
這可確保當物件被銷毀時，取消該物件的 `CoroutineScope` 同時也會取消收集。

若要在特定的 `CoroutineScope` 中收集 Flow，請使用 [`.launchIn()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/launch-in.html) 終端運算子。
此運算子會傳回收集協同程式的 `Job`。

以下範例中，畫面從 `StateFlow` 收集值，並在畫面關閉時停止收集協同程式：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

// 預設 .launchIn() 運算子的簡化自訂版本
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
        // 在畫面的 CoroutineScope 中開始收集 StateFlow
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