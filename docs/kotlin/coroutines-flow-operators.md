<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: Flow 运算符)

Flow 运算符允许您在 Flow 流水线中转换和处理值。
Kotlin 提供了两种主要的 Flow 运算符：

* [**中间运算符**](#intermediate-operators) 返回一个新的下游流，该流消费来自上游流的值并对它们应用操作。
* [**终端运算符**](#terminal-operators) 通过收集上游流来触发 Flow 流水线的执行。它们也可能返回一个结果。

虽然 [`kotlinx.coroutines`](https://github.com/Kotlin/kotlinx.coroutines) 库提供了广泛的 Flow 运算符，
但当您需要内置运算符未提供的行为时，也可以定义自定义运算符。

> 以下部分包含了自定义实现与相应内置运算符的示例。
>
{style="tip"}

## 中间运算符

中间运算符返回一个新的下游流，用于消费来自上游流的值。
您可以链接多个中间运算符，在收集最终结果之前构建一个 Flow 流水线。

中间运算符按用途可以分为以下类别：

* [**转换运算符**](#transforming-operators) 在将值发射到下游之前对其进行转换。
* [**过滤与限制大小的运算符**](#filtering-and-size-limiting-operators) 控制哪些上游值可以继续传递到下游。
* [**并发处理运算符**](#concurrent-processing-operators) 让发射与收集分别运行。
* [**组合运算符**](#combining-operators) 从多个上游流收集值并将其发射到同一个下游流中。
* [**生命周期运算符**](#lifecycle-operators) 针对流收集期间的特定事件（例如收集开始或上游流完成时）运行操作。

### 转换运算符

转换运算符对上游流发射的值进行转换。
您可以使用它们将值转换为另一种类型、跳过某些值或向下游发射额外的值。

> 转换运算符接受挂起 lambda 表达式，因此它们的 lambda 在处理每个发射的值时可以调用挂起函数。
> 除非 Flow 流水线使用了引入并发的运算符，否则它们仍然按顺序处理值。
>
{style="note"}

[`.transform()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/transform.html) 运算符是一个通用的转换运算符，您可以将其作为更具体的转换运算符（如 [`.map()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map.html) 和 [`.filter()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/filter.html)）的基础。

以下示例使用 `.transform()` 运算符，根据上游值的数值发射对应次数的该值：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 默认 .transform() 运算符的简化自定义实现
inline fun <T, R> Flow<T>.myTransform(
    // 接受一个可以向下游发射值的挂起 lambda 表达式
    crossinline transform: suspend FlowCollector<R>.(value: T) -> Unit
): Flow<R> = flow {
    // 收集来自上游流的值
    this@myTransform.collect { value ->
        // 应用转换并将值发射到下游流
        this@flow.transform(value)
    }
}

// 使用默认的 .transform() 运算符
suspend fun main() = withContext(Dispatchers.Default) {
    val flow = (0..4).asFlow().transform { value ->
        // 根据值的大小发射对应次数的值
        repeat(value) {
            emit(value)
        }
    }
    println(flow.toList())
    // [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
}
```
{kotlin-runnable="true"}

您可以使用 [`.map()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map.html) 运算符将每个上游值转换为一个下游值。

以下示例使用 `.map()` 将每个值乘以 4：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 默认 .map() 运算符的简化自定义实现
inline fun <T, R> Flow<T>.myMap(
    crossinline transform: suspend (value: T) -> R
): Flow<R> = transform { value ->
    emit(transform(value))
}

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    // 将每个上游值乘以 4
    val flow = (0..4).asFlow().map { it * 4 }
    println(flow.toList())
    // [0, 4, 8, 12, 16]
}
//sampleEnd
```
{kotlin-runnable="true"}

若要仅发射符合条件的上游值，请使用 [`.filter()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/filter.html) 运算符。

以下示例发射除以 `3` 余数为 `1` 的值：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 默认 .filter() 运算符的简化自定义实现
inline fun <T> Flow<T>.myFilter(
    crossinline predicate: suspend (value: T) -> Boolean
): Flow<T> = transform { value ->
    // 仅发射符合条件的值
    if (predicate(value))
        emit(value)
}

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    // 仅发射除以 3 余数为 1 的值
    val flow = (0..10).asFlow().filter { it % 3 == 1 }
    println(flow.toList())
    // [1, 4, 7, 10]
}
//sampleEnd
```
{kotlin-runnable="true"}

某些运算符可以结合其他转换运算符（如 `.map()` 和 `.filter()`）的行为，通过转换值并仅发射符合结果的项。

例如，使用 [`.mapNotNull()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map-not-null.html) 来转换每个上游值并仅发射非 null 结果：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 默认 .mapNotNull() 运算符的简化自定义实现
inline fun <T, R: Any> Flow<T>.myMapNotNull(
    crossinline transform: suspend (value: T) -> R?
): Flow<R> = transform { value ->
    transform(value)?.let { transformed ->
        emit(transformed)
    }
}

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    // 将每个字符串转换为 Double 并跳过无法转换的值
    val flow = flowOf("1.2", "10", "11", "error", "0.000")
        .mapNotNull { it.toDoubleOrNull() }
    
    println(flow.toList())
    // [1.2, 10.0, 11.0, 0.0]
}
//sampleEnd
```
{kotlin-runnable="true"}

### 过滤与限制大小的运算符

过滤与限制大小的运算符控制哪些值可以从流中继续传递到下游。
您可以使用它们来移除连续的重复值、跳过流开头的某些值，或者在收到指定数量的值后取消收集。

若要忽略连续的重复值，请使用 [`.distinctUntilChanged()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/distinct-until-changed.html) 运算符。
它仅在值与前一个发射的值不同时才发射该值：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 默认 .distinctUntilChanged() 运算符的简化自定义版本
fun <T> Flow<T>.myDistinctUntilChanged(): Flow<T> = flow {
    var lastEmitted: Any? = Any() // 一个仅等于自身的值
    this@myDistinctUntilChanged.collect { value ->
        if (lastEmitted != value) {
            this@flow.emit(value)
            lastEmitted = value
        }
    }
}

suspend fun main() = withContext(Dispatchers.Default) {
    // 移除上游流中连续重复的值
    val flow = flowOf(1, 2, 3, 3, 3, 4, 5, 5, 1).distinctUntilChanged()
    println(flow.toList())
    // [1, 2, 3, 4, 5, 1]
}

```
{kotlin-runnable="true"}

您可以使用 [`.drop()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/drop.html) 运算符来跳过上游流发射的前几个值。
例如，`.drop(2)` 跳过前两个值并将剩余的值发射到下游：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 默认 .drop() 运算符的简化自定义版本
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
    // 跳过上游流的前两个值    
    val flow = flowOf(1, 2, 3, 4, 5).drop(2)
    println(flow.toList())
    // [3, 4, 5]
}
//sampleEnd
```
{kotlin-runnable="true"}

要在获得固定数量的值后取消收集，请使用 [`.take()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/take.html) 运算符。
以下示例使用 `.take()` 运算符仅收集前三个值：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds

// 默认 .take() 运算符的简化自定义版本
fun <T> Flow<T>.myTake(count: Int): Flow<T> = flow {
    require(count > 0)
    val cancellationException = CancellationException()
    var elementsRemaining = count
    try {
        this@myTake.collect {
            emit(it)
            --elementsRemaining
            if (elementsRemaining == 0) {
                // 在达到要求的数值后取消上游流
                throw cancellationException
            }
        }
    } catch (e: Throwable) {
        if (e === cancellationException) {
            // 处理用于取消上游流的 CancellationException
            // 在 .myTake() 中设置的数量后完成流
        } else {
            // 重新抛出意外异常
            throw e
        }
    }
}

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    // 仅从上游流收集前三个值
    val flow = (0..1000).asFlow().take(3)

    println(flow.toList())
    // [0, 1, 2]
}
//sampleEnd
```
{kotlin-runnable="true"}

### 并发处理运算符

默认情况下，Flow 流水线按顺序处理值。
上游流发射一个值，收集器处理完该值后，才会发射下一个值。

若要让上游流与下游收集并发运行，请使用并发处理运算符引入缓冲（buffer）。
缓冲存储了上游流已经发射但收集器尚未处理的值。

[`.buffer()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/buffer.html) 运算符就是一种引入此类缓冲的运算符。
它允许您配置缓冲容量以及缓冲满时的处理方式，例如：

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
        // 允许上游流比收集器提前发射最多四个值
        .buffer(4)
        .collect {
            println("Processed $it!")
            delay(20.milliseconds)
        }
}
//sampleEnd
```
{kotlin-runnable="true"}

当收集器慢于上游流时，流水线需要一种方法来处理收集器尚未处理的值。

默认情况下，收集器会对上游流施加 *背压*（backpressure）。
在这种策略下，当缓冲满时上游流会挂起，并在收集器释放空间后恢复。

若要丢弃值而不是挂起上游流，请设置 [`onBufferOverflow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-buffer-overflow/) 参数：

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
        // 在应用溢出行为之前最多存储四个值
        // 当缓冲满时丢弃最旧的缓冲值
        .buffer(4, onBufferOverflow = BufferOverflow.DROP_OLDEST)
        .collect { value ->
            println("Processed $value!")
            delay(20.milliseconds)
        }
}
//sampleEnd
```
{kotlin-runnable="true"}

您还可以使用 [`.conflate()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/conflate.html) 运算符，它是 `buffer(1, onBufferOverflow = BufferOverflow.DROP_OLDEST)` 的简写。
当您只想处理最新值，跳过在处理前一个值期间发射的值时，可以使用它：

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

`.conflate()` 运算符仅影响收集器处理哪些缓冲值。
它不会取消已经开始的处理。
若要实现此目的，请改用 [`collectLatest()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/collect-latest.html)。

在前面的示例中，`.buffer()` 和 `.conflate()` 运算符在单独的协程中并发运行上游流，而不更改其协程上下文。

要在不同的协程上下文中运行上游流，请使用 [`.flowOn()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow-on.html) 运算符。
如果这更改了调度器，`.flowOn()` 会在单独的协程中收集上游流，并在上游发射与下游收集之间使用缓冲。

以下是一个简化的示例，使用 `.flowOn()` 在 `Dispatchers.IO` 中运行上游流：

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

在此示例中，`.flowOn()` 运算符可以引入并发上游处理，但未显式配置缓冲行为。

要同时配置上游流的协程上下文和缓冲行为，请将 `.flowOn()` 与 `.buffer()` 或 `.conflate()` 结合使用。
当您一起使用这些运算符时，它们会执行 *运算符融合*（operator fusion）并共享单个缓冲。

以下示例使用 `.flowOn(Dispatchers.IO)` 在 `Dispatchers.IO` 中运行上游流，并使用 `.conflate()` 保留最新的缓冲值：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.Random
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource
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
        // 在 Dispatchers.IO 中运行上游流
        .flowOn(Dispatchers.IO)
        // 保留最新的缓冲值并丢弃旧值
        .conflate()
        // 从上游流收集前两个值
        .take(2)
        .collect { temperature ->
            println("Received $temperature!")
            sendLatestTemperature(temperature)
        }
}
//sampleEnd
```
{kotlin-runnable="true"}

### 组合运算符

组合运算符消费来自多个上游流的值并返回单个下游流。
当收集器需要来自多个流的值时，可以使用它们。

若要配对来自两个上游流的值，请使用 [`.zip()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/zip.html) 运算符。
它将每个流的第一个值组合在一起，然后是每个流的第二个值，依此类推。
只要其中一个上游流完成，结果流就会完成。

示例如下：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.Random
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    // 每 100 毫秒发射一个 ticker 值
    val tickerFlow = flow {
        while (true) {
            emit(Unit)
            delay(100.milliseconds)
        }
    }

    val start = TimeSource.Monotonic.markNow()
    tickerFlow
        // 将每次 ticker 发射与下一个数字组合
        .zip(flowOf(1, 2, 3)) { _, value ->
            value
        }.collect {
            println("${start.elapsedNow()}: received $it")
        }
}
//sampleEnd
```
{kotlin-runnable="true"}

若要组合来自多个流的最新值，请使用 [`.combine()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/combine.html) 运算符。
当任何上游流发射值时，它都会使用来自每个上游流的最新值发射一个新值：

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

// 组合来自两个上游流的最新值
val uiStateFlow = combine(messagesFlow, themeFlow) { messages, theme ->
    UiState(messages, theme)
}

suspend fun main() {
    withContext(Dispatchers.Default) {
        // 使用 UNDISPATCHED 在第一次更新发生前进行订阅
        val uiUpdateJob = launch(start = CoroutineStart.UNDISPATCHED) {
            uiStateFlow.collect {
                // 绘制 UI
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

在此示例中，`combine()` 通过 `messagesFlow` 和 `themeFlow` 的最新值创建了 `uiStateFlow`。
更新任一上游流都会发射一个带有最新消息和主题的新 `UiState`。

如果您想并发地从多个流收集值并将它们的值发射到同一个下游流中，请使用 [`.merge()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/merge.html) 运算符：

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
            // 使用 UNDISPATCHED 在第一次更新发生前进行订阅
            val collectJob = launch(start = CoroutineStart.UNDISPATCHED) {

                // 并发收集两个上游流并将它们的值发射到下游
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

### 生命周期运算符

生命周期运算符接受一个挂起 lambda 表达式，该表达式在流收集期间的特定时间点运行。
您可以使用它们在收集流之前、每个值发射之前、收集完成后，或者在流完成且未发射任何值时放置逻辑。

[`.onStart()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-start.html) 运算符在收集上游流之前运行其 lambda。
对于需要在每个发射的值之前运行的代码，请使用 [`.onEach()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-each.html)。

> 与 `.onStart()` 类似，对于热流，您可以使用 [`.onSubscription()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-subscription.html) 在订阅者开始收集流之后、但在收集任何发射的值之前运行代码。
>
{style="note"}

以下示例使用这些运算符在收集开始之前以及每个值向下游发射之前打印消息：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

// 默认 .onStart() 运算符的简化自定义版本
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

要在收集完成后运行代码，请使用 [`.onCompletion()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-completion.html) 运算符。
其 lambda 在上游流成功完成后可以向下游发射值，例如：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

// 默认 .onCompletion() 运算符的简化自定义版本
fun <T> Flow<T>.myOnCompletion(
    action: suspend FlowCollector<T>.(cause: Throwable?) -> Unit
): Flow<T> = flow {
    var exception: Throwable? = null
    try {
        this@myOnCompletion.collect(this@flow)
    } catch (e: Throwable) {
        // 运行 `action`，但如果 `action` 调用了 `emit`，则从中抛出 `e`
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
            // 在上游流完成后发射一个额外的值
            emit("Last Page!")
        }.collect {
            println("Collected $it")
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

若要在上游流完成且未发射任何值时运行代码，请使用 [`.onEmpty()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-empty.html) 运算符：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

// 默认 .onEmpty() 运算符的简化自定义版本
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
            // 不会打印任何内容，因为上游流发射了值
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

## 终端运算符

终端运算符用于收集流。
您可以使用它们来消费发射的值、根据收集到的值返回结果，或者[在特定的 `CoroutineScope` 中收集流](#collect-a-flow-in-a-specific-coroutinescope)。

要收集流，请使用 [`collect()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/collect.html) 运算符。
如果您向 `collect()` 传递一个 lambda 表达式，它将接收每个发射的值：

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

您也可以在不带 lambda 的情况下调用 `collect()`：

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

如果您想收集流，但在发射新值时取消未完成的工作，请使用 [`collectLatest()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/collect-latest.html) 运算符：

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

一些终端运算符会收集流并根据收集到的值返回一个结果。
例如，您可以使用 [`.first()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/first.html) 运算符返回第一个发射的值并随后取消收集：

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

您可以使用 [`.toList()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/to-list.html) 或 [`.toSet()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/to-set.html) 运算符将发射的值收集到一个集合中：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 默认 .toList() 运算符的简化自定义实现
suspend fun <T> Flow<T>.myToList(): List<T> = buildList {
    this@myToList.collect { value ->
        // 将每个发射的值添加到结果列表中
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

若要将发射的值组合成单个结果，请使用 [`.reduce()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/reduce.html) 或 [`.fold()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/fold.html) 运算符。
`.fold()` 运算符使用您提供的值作为其起始值，而 `.reduce()` 运算符则使用第一个发射的值作为起始值。

示例如下：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default) {
        // 使用第一个发射的值作为起始值
        val reduced = flowOf(1, 2, 3).reduce { accumulator, value ->
            accumulator + value
        }

        // 从提供的起始值开始
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

### 在特定的 `CoroutineScope` 中收集流

当屏幕或其他长生命周期对象需要来自流的值时，请在该对象的 `CoroutineScope` 中启动收集器。
这可以确保当该对象被销毁时，取消该对象的 `CoroutineScope` 也会同时取消收集。

若要在特定的 `CoroutineScope` 中收集流，请使用 [`.launchIn()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/launch-in.html) 终端运算符。
此运算符返回收集协程的 `Job`。

以下是一个示例，其中屏幕从 `StateFlow` 收集值，并在屏幕关闭时停止收集协程：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

// 默认 .launchIn() 运算符的简化自定义版本
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
        // 在屏幕的 CoroutineScope 中开始收集 StateFlow
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