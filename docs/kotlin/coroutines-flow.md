<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 流)

流 (Flow) 代表可以异步产生的连续数值流。
与返回单个值的挂起函数不同，您可以使用流随着时间的推移处理多个连续值。

您可以使用流来创建 *流流水线*，用于渐进式加载数据、响应事件流以及建模订阅式 API。

流流水线是涉及以下角色的操作序列：

* **发射器 (Emitter)**：产生数值。
* **中间操作符 (Intermediate operator)（可选）**：从流中消耗数值，对其应用操作，并返回另一个流。
* **收集器 (Collector)**：从流中消耗数值。

这是一个展示这些流水线角色如何协同工作的简单示例：

```kotlin
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun main() {
    // 发射器产生数值
    flowOf(0x4B, 0x6F, 0x74, 0x6C, 0x69, 0x6E)
        // 中间操作符消耗数值，
        // 应用操作，并返回另一个流
        .map { value -> value.toChar() }
        // 收集器消耗转换后的数值
        .collect { updatedValue ->
            println("Say '$updatedValue'!")
        }
}
//sampleEnd
```
{kotlin-runnable="true"}

在流中，数值从发射器移向收集器，从 *上游 (upstream)* 移向 *下游 (downstream)*。
中间操作符收集上游流，对其数值应用操作，并返回一个新的下游流。
该下游流可以成为下一个收集器的上游流。

![流的组成部分：发射器、中间操作符（可选）、收集器。数值从上游移动到下游。](flow-upstream-downstream.svg){width=700}

Kotlin 提供以下流类型：

* [**冷流 (Cold flow)**](#cold-flows)：在收集时开始产生数值。每个收集器都会触发流的一次新的、独立的执行。
* [**热流 (Hot flow)**](#hot-flows)：独立于收集器发射数值，并与所有收集器共享相同的数值流。

> 您可以使用 [Turbine 库](https://github.com/cashapp/turbine) 来测试 Kotlin 流。
> 它简化了在单元测试中收集和断言流发射内容的过程，包括完成和失败的情况。
> 
{style="tip"}

## 冷流

与 [序列 (sequence)](sequences.md) 一样，冷流也是惰性的。

冷流构建器的代码块直到被收集器收集时才会运行。
每个新的收集器都会启动流的一次新执行。

### 创建冷流

要创建冷流，请使用 [`flow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow.html) 构建器函数。
在其代码块内，使用 [`emit()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow-collector/emit.html) 函数向收集器发射数值：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
fun main() {
    // 创建一个流
    val pageFlow = flow {
        for (page in 1..3) {
            println("Loading page $page...")

            // 在加载每页时发射它
            emit("Page $page")
        }
    }
    println("Creating a cold flow doesn't run it!")
}
//sampleEnd
```
{kotlin-runnable="true"}

在此示例中，`flow()` 构建器函数返回一个 [`Flow<T>`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow/)，但它不会开始执行其代码块。
冷流就像食谱：它定义了如何产生数值，但只有在您 [收集它](#collect-a-cold-flow) 时才会开始产生数值。

您还可以使用以下函数创建冷流：

* [`flowOf()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow-of.html)：从提供的数值创建流。
* [`.asFlow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/as-flow.html)：将现有的可迭代对象（如区间）转换为流。

示例如下：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() {
    // 从提供的数值创建流
    val predefinedPageFlow = flowOf("Page 1", "Page 2", "Page 3")
    // 从区间创建流
    val generatedPageFlow = (1..3).asFlow()
}
```

### 收集冷流

要收集冷流，请使用 [`collect()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/collect.html) 函数，它会触发来自上游流的发射。
如果您向 `collect()` 传递一个 lambda，它会接收每个发射的数值：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default) {
        val pageFlow = flow {
            for (page in 1..3) {
                println("Loading page $page...")
                emit("Page $page")
            }
        }
        // 使用一个接收每个发射页面的 lambda 收集流
        pageFlow.collect { page ->
            println("Processing $page...")
            delay(100.milliseconds)
            println("Done processing $page.")
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

每次调用 `collect()` 都会从头开始运行整个冷流。
如果多个收集器收集同一个冷流，每个收集器都会触发其自己的收集操作：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
suspend fun main() {
    val pageFlow = flow {
        // 读取当前协程的名称
        val coroutineName = currentCoroutineContext()[CoroutineName]?.name

        println("Starting emissions in $coroutineName")
        for (page in 1..3) {
            println("Loading page $page in $coroutineName")
            emit("Page $page")
        }
        println("Done emitting in $coroutineName")
    }

    withContext(Dispatchers.Default) {
        // 启动一个缓慢处理每个页面的收集器
        launch(CoroutineName("a slow coroutine")) {
            pageFlow.collect {
                println("Processing $it slowly")
                delay(100.milliseconds)
                println("Done processing $it slowly")
            }
        }

        // 启动一个快速处理每个页面的收集器
        launch(CoroutineName("a fast coroutine")) {
            pageFlow.collect {
                println("Processing $it quickly")
                delay(10.milliseconds)
                println("Done processing $it quickly")
            }
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

在此示例中，[`CoroutineName`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-name/) 为每个协程添加了一个名称。
您可以将 `CoroutineName` 用于 [调试](coroutine-context-and-dispatchers.md#naming-coroutines-for-debugging)。在这里，它有助于显示哪个收集器运行了哪次收集操作。

### 中间流操作符

中间操作符对上游流应用操作并返回一个新的下游流。
它们是冷的，因此即使上游流是热的，返回的流在被收集之前也不会开始处理数值。

[kotlinx.coroutines](https://github.com/Kotlin/kotlinx.coroutines) 库提供了 [广泛的中间流操作符](coroutines-flow-operators.md) 用于转换和处理流。
当您需要的行为内置操作符未提供时，您也可以自己定义自定义操作符。

这是一个简化的自定义 [`.map()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map.html) 操作符示例，它对每个发射的数值应用转换：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
// 默认 .map() 操作符的简化自定义实现
fun <T, R> Flow<T>.myMap(transform: suspend (value: T) -> R): Flow<R> = flow {
    // 从上游流收集数值
    this@myMap.collect { value ->
        // 转换每个收集到的数值并发射结果
        emit(transform(value))
    }
}

suspend fun main() {
    // 创建一个流，应用自定义 map 操作符，并收集转换后的数值
    flowOf(1, 2, 3).myMap { 2 * it }.collect {
        println("Collecting $it")
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

#### 在流构建器内调用挂起函数

与序列不同，您可以在 `flow()` 构建器函数内部调用挂起函数：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun loadPage(): Int {
    delay(100)
    return 3
}

suspend fun main() {
    flow {
        emit(loadPage())
    }.collect {
        println(it)
        // 3
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

但是，`flow()` 构建器函数必须从其运行所在的同一个协程上下文中发射数值。
您不能启动另一个在其代码块中调用 `emit()` 的协程，也不能使用 `withContext()` 更改协程上下文：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun main() {
    // 运行此代码会抛出异常！
    flow {
        // 使用 withContext() 更改协程上下文
        withContext(Dispatchers.IO) {
            emit('a')
        }
    }.collect { 
        println("This never prints")
    }
}
//sampleEnd
```
{kotlin-runnable="true" validate="false"}

此限制适用于 `flow()` 构建器函数。

如果您需要上游流在不同的协程上下文中运行，可以使用 [`.flowOn()` 操作符进行更改](#change-the-coroutine-context-of-a-cold-flow-with-flowon)。

或者，您可以使用 [`channelFlow()`](#emit-values-concurrently-with-channelflow) 从多个协程并发发射数值。

#### 使用 `.flowOn()` 更改冷流的协程上下文

默认情况下，冷流在与收集器相同的协程上下文中运行。

如果您希望流在不同的协程上下文中运行，请使用 [`.flowOn()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow-on.html) 操作符。
该操作符是 *上下文保持 (context-preserving)* 的。
它仅更改上游流的协程上下文，同时将下游流保持在调用者的上下文中。

这是一个冷流在一个协程上下文中发射数值并在另一个上下文中收集数值的示例：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default + CoroutineName("downstream")) {
        flow {
            val coroutineName = currentCoroutineContext()[CoroutineName]?.name

            // 在使用 .flowOn() 应用的协程上下文中发射
            println("Emitting '1' in $coroutineName")
            // Emitting '1' in upstream
            emit(1)

        // 更改上游流的协程上下文
        }.flowOn(Dispatchers.IO + CoroutineName("upstream"))
            .collect {
            val coroutineName = currentCoroutineContext()[CoroutineName]?.name

            // 在调用者的协程上下文中收集
            println("Collecting '$it' in $coroutineName")
            // Collecting '1' in downstream
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

### 处理流中的异常

发射器和收集器都可以抛出异常。

如果您在流收集过程中不处理异常，它会从收集器向上传播到上游，并抛给 `collect()` 函数的调用者。

您可以通过将 `collect()` 函数包装在 `try-catch` 块中来处理此类异常，例如：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

class MyFlowException(message: String) : Exception(message)

//sampleStart
suspend fun main() {
    val myFlow = flow {
        try {
            // emit() 函数调用传递给 collect() 的 lambda
            emit('a')
        } catch (e: MyFlowException) {
            println("Collector threw $e")

            // 重新抛出下游异常
            throw e
        }
    }
    // 将流收集操作包装在 try-catch 中
    try {
        myFlow.collect {
            // 从 collect() lambda 抛出异常
            throw MyFlowException("Can't process '$it'!")
        }
    } catch (e: MyFlowException) {
        println("Flow collection failed with $e")
        // 将异常重新抛给调用者
        throw e
    }
}
//sampleEnd
```
{kotlin-runnable="true" validate="false"}

在此示例中，收集器在接收到来自 `emit()` 函数的值时抛出一个异常。
`flow()` 构建器函数捕获了这个下游异常。

当您在流构建器函数内部捕获由收集器抛出的异常时，请重新抛出它。
这保持了异常透明性，并让 `collect()` 的调用者处理该异常。

#### 使用 `.catch()` 操作符处理上游异常

要在异常到达收集器之前处理它们，请使用 [`.catch()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/catch.html) 操作符。

您可以使用 `.catch()` 操作符处理来自上游流的异常，例如通过使用 `emit()` 函数向下游发射回退值：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun main() {
    flow {
        emit("a")
        emit("b")

        // 从上游流抛出一个异常
        throw UnsupportedOperationException(
            "I am tired of listing letters"
        )
    }.catch { upstreamException ->
        println("Upstream completed with $upstreamException!")

        // 向下游发射回退值
        emit("Upstream terminated with an exception!")
    }.collect {
        println("Got '$it'")
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

在此示例中，上游流在抛出异常之前发射了数值。
`.catch()` 操作符处理该异常并发射 `"Upstream terminated with an exception!"` 作为回退值。

当预期流在正常操作期间会抛出某些异常时，请在 `.catch()` 中处理可恢复的异常，并重新抛出任何意外的异常。

这是一个流加载数据并报告进度的示例：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
sealed interface LoadingState {
    sealed interface Terminal: LoadingState
    object Started: LoadingState
    data class Percentage(val percents: Int): LoadingState
    object Failed: Terminal
    object Done: Terminal
}

fun loadBlob(url: String) = flow {
    emit(LoadingState.Started)

    val failureChancePerStep = 1 - java.lang.Math.pow(0.99, 10.0)

    repeat(10) { step ->
        if (Random.nextDouble() < failureChancePerStep)
            throw IOException("Failed to load!")
        emit(LoadingState.Percentage((step + 1) * 10))
        delay(10.milliseconds)
    }
    emit(LoadingState.Done)
}.catch { e ->
    println("Loading data failed with $e")
    if (e is IOException) {
        // 处理预期的异常
        emit(LoadingState.Failed)
    } else {
        // 重新抛出意外异常，因此 collect() 会因它们而失败
        throw e
    }
}

suspend fun main() {
    loadBlob("https://example.com/").collect {
        println("Got '$it'")
    }
}
//sampleEnd
```
{kotlin-runnable="true" validate="false"}

在此示例中，如果加载失败并出现预期异常，`.catch()` 操作符使用 `emit()` 函数发射回退状态。
对于意外异常，请在 `.catch()` 操作符中重新抛出它们。
这让 `collect()` 函数的调用者接收流不处理的异常。

`.catch()` 操作符不处理由收集器抛出的异常。
如果传递给 `collect()` 的 lambda 抛出异常，请在 `collect()` 函数周围使用 `try-catch` 块处理它：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

suspend fun main() {
    val myFlow = flow {
        for (char in listOf('a', 'o', '5', 'c')) {
            try {
                emit(char)
            } catch (e: IllegalArgumentException) {
                println("Collector doesn't support character '$char': $e")

                // 重新抛出下游异常
                throw e
            }
        }
    }.catch { e ->
        // 不会运行，因为异常发生在下游
        println("Upstream threw an exception: $e")
    }

    try {
        myFlow.collect {
            require(!it.isDigit()) { "Digits are not allowed!" }
        }
    } catch (e: IllegalArgumentException) {
        // 处理来自 collect() lambda 的异常
        println("Flow collection failed with $e")
    }
}
```
{kotlin-runnable="true"}

由于 `collect()` lambda 在 `.catch()` 之后运行，您不能使用 `.catch()` 处理从中抛出的异常。
要使用 `.catch()` 处理为每个发射值运行的代码中的异常，请将该代码放在 [.onEach()](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-each.html) 中，且位于 `.catch()` 之前。

`.onEach()` 操作符在每个数值发射到下游之前运行其 lambda。
如果 `.catch()` 处理了来自 `.onEach()` 的异常，流将完成且不会发射下一个数值：

示例如下：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds

suspend fun main() {
    flowOf('a', 'o', '5', 'c')
        // 在每个值发射到下游之前运行
        .onEach {
            require(!it.isDigit()) { "Digits are not allowed!" }
            println("Got '$it'")
        }
        .catch { e ->
            println("Caught an exception: $e")
        }
        .collect()
}
```
{kotlin-runnable="true"}

在此示例中，`.onEach()` 操作符位于 `.catch()` 的上游，因此当 `'5'` 的 `require()` 检查失败时，`.catch()` 操作符会处理该异常。

#### 异常发生后重启上游流

某些操作可能会暂时失败，例如丢失连接的网络请求。
对于这些情况，您可以使用 [`.retry()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/retry.html) 操作符在发生异常后重启上游流。

`.retry()` 操作符接收一个异常，并在其 lambda 返回 `true` 时重启收集，最多重试指定的次数。
例如，`.retry(3)` 在第一次尝试失败后最多重试上游流三次。

如果 lambda 返回 `false`，`.retry()` 将停止重试并重新抛出异常。

> 要对重试逻辑进行更多控制，请使用 [`.retryWhen()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/retry-when.html) 操作符。
> 与 `.retry()` 类似，它接收异常，但它也接收当前的尝试次数，并可以在重试之前发射数值。
>
{style="note"}

这是一个在发生 `IOException` 后最多重试加载三次的示例：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds

//sampleStart
sealed interface LoadingState {
    sealed interface Terminal: LoadingState
    object Started: LoadingState
    data class Percentage(val percents: Int): LoadingState
    object Failed: Terminal
    object Done: Terminal
}

fun loadBlob(url: String) = flow {
    emit(LoadingState.Started)

    val failureChancePerStep = 1 - java.lang.Math.pow(0.99, 10.0)

    repeat(10) { step ->
        if (Random.nextDouble() < failureChancePerStep)
            throw IOException("Failed to load!")
        emit(LoadingState.Percentage((step + 1) * 10))
        delay(10.milliseconds)
    }
    emit(LoadingState.Done)
}.retry(3) { e ->
    if (e is IOException) {
        // 这是一个预期的错误
        // 在重试之前等待一秒钟
        delay(1.seconds)
        true
    } else {
        // 停止重试并重新抛出意外异常
        false
    }
}

suspend fun main() {
    loadBlob("https://example.org/").collect {
        println("Got $it")
    }
}
//sampleEnd
```
{kotlin-runnable="true" validate="false"}

### 流取消

当不再需要结果（例如请求超时）时，流取消操作会停止收集。

流收集与调用 `collect()` 函数的协程绑定。
当该协程被取消时，收集停止，上游流也会被取消。

要取消流收集，请在收集协程的 `Job` 上调用 `cancel()` 函数：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
val myFlow = flow {
    var i = 0
    try {
        while (true) {
            println("Emitting $i")
            emit(i)
            println("Emitted $i")
            ++i
            delay(10.milliseconds)
        }
    } catch (e: Throwable) {
        println("Upstream finished with $e")
        throw e
    }
}

suspend fun main() {
    coroutineScope {
        val job = launch {
            try {
                myFlow.collect {
                    println("Processing $it")
                    delay(5.milliseconds)
                }
            } catch (e: Throwable) {
                println("Collection finished with $e")
                throw e
            }
        }
        delay(100.milliseconds)

        // 取消收集流的协程
        job.cancel()
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

收集器也可以在收集协程保持活跃状态时取消上游流。
为此，请从收集器抛出 `CancellationException`。

[`.take()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/take.html) 操作符使用此行为在固定数量的数值后停止收集。
例如，`.take(3)` 仅从上游流收集前三个数值，然后取消它。

这是一个使用 `.take()` 操作符简化版本的示例：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
// 定义默认 .take() 操作符的简化版本
fun <T> Flow<T>.myTake(count: Int): Flow<T> = flow {
    require(count > 0)
    val cancellationException = CancellationException()
    var elementsRemaining = count
    try {
        this@myTake.collect {
            emit(it)
            --elementsRemaining
            if (elementsRemaining == 0) {
                // 在达到要求的数值数量后取消上游流
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

suspend fun main() {
    (0..1000).asFlow().myTake(3).collect {
        println("Got $it")
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

在此示例中，`.myTake()` 函数从上游流发射数值，直到发射了所有请求的数值。
然后它抛出一个 `CancellationException` 来取消上游流。

### 使用 `channelFlow()` 并发发射数值

对于从一个协程发射数值的流，`flow()` 构建器函数简单且高效。
如果您想从多个协程并发发射数值到同一个流中，请使用 [`channelFlow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/channel-flow.html) 构建器函数。
您可以将其用于逐步报告结果的并发工作，例如从多个源加载数据。

`channelFlow()` 构建器函数创建一个冷流，该流使用 [通道 (channel)](channels.md) 从多个协程发送数值。
在构建器内部，使用 [`send()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-send-channel/send.html) 函数而不是 `emit()` 函数来产生数值。

这是一个使用 `channelFlow()` 并发收集两个流并使用 [`.merge()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/merge.html) 操作符的简化版本重新发射它们的数值的示例：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
// 定义默认 .merge() 操作符的简化版本
fun <T> Flow<T>.myMerge(other: Flow<T>): Flow<T> = channelFlow {
    // CoroutineScope 和 SendChannel 在此处作为接收者可用
    // 启动一个收集接收者流的协程
    launch {
        // 收集接收者流
        this@myMerge.collect {
            send(it)
        }
    }
    launch {
        // 启动一个收集另一个流的协程
        other.collect {
            // 调用 SendChannel.send
            send(it)
        }
    }
}

suspend fun main() {
    val flow1 = (0..3).asFlow().onEach { delay(20.milliseconds) }
    val flow2 = (6..9).asFlow().onEach { delay(50.milliseconds) }
    flow1.myMerge(flow2).collect { println(it) }
}
//sampleEnd
```
{kotlin-runnable="true"}

`channelFlow()` 构建器函数使用缓冲通道，允许生产者在收集器之前发送数值，直到缓冲区填满。
默认情况下，缓冲区最多可容纳 64 个数值。
当缓冲区填满时，生产者将挂起，直到缓冲区有空闲空间。

您可以使用 [`.buffer()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/buffer.html) 操作符更改缓冲区容量。
例如，`.buffer(12)` 让生产者在收集器之前最多发送 12 个数值，而 `.buffer(0)` 则移除缓冲区，因此只有在收集器可以接收时才会发送每个数值。

示例如下：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
suspend fun main() {
    val oneHundredNumbers = channelFlow {
        repeat(100) {
            println("Sending $it")
            send(it)
        }
    }

    // 使用默认缓冲区容量
    oneHundredNumbers.collect {
        println("Processing $it")
        delay(10.milliseconds)
    }
  
    // 移除缓冲区，使发送和处理从一开始就交替进行
    oneHundredNumbers.buffer(0).collect {
        println("Processing $it")
        delay(10.milliseconds)
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

在此示例中，`oneHundredNumbers` 流使用默认缓冲区容量，而 `oneHundredNumbers.buffer(0)` 流没有缓冲区。

使用默认缓冲区容量时，生产者会快速发送数值，直到缓冲区变满。
之后，`send()` 会挂起，直到缓冲区有空闲空间，因此 `Sending` 和 `Processing` 消息开始交替出现。

使用 `.buffer(0)` 时，每个 `send()` 调用都会等待，直到收集器可以接收该数值，因此 `Sending` 和 `Processing` 从一开始就交替进行。

## 热流

热流是共享流，它们独立于收集器发射数值。
即使没有活跃的收集器，它们也会持续发射数值，并且多个收集器可以从已经活跃的流中收集相同的发射内容，而不是启动新的执行。

热流的收集器被称为 *订阅者*。

当应用程序的多个部分需要对相同的更新流做出反应时，您可以使用热流，例如传入的聊天消息、用户操作或 UI 状态更改。

Kotlin 提供两种热流类型：

* [`SharedFlow`](#create-a-sharedflow)：向多个订阅者广播数值。当您需要广播随时间发生的事件（如消息或通知）时，请使用它。
* [`StateFlow`](#create-a-stateflow)：是一种专门的 `SharedFlow`，它始终持有最新的状态值。当您需要表示随时间变化的状态（如 UI 状态）时，请使用它。

### 创建 `SharedFlow`

[`SharedFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/) 是一种热流，它向其订阅者广播随时间发生的发射值。

您可以使用 [`MutableSharedFlow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-mutable-shared-flow.html) 函数创建一个 `SharedFlow`。

`MutableSharedFlow` 暴露了用于发射数值的函数。如果您直接暴露它，类外部的代码也可以向流中发射数值。

为了防止这种情况，请将可变流存储在私有 [支持属性 (backing property)](properties.md#backing-properties) 中，并使用 [`.asSharedFlow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/as-shared-flow.html) 函数暴露一个只读的 `SharedFlow`。
要向订阅者发射数值，请在 `MutableSharedFlow` 上使用 `emit()` 函数：

```kotlin
data class Message(
    val senderId: Int,
    val time: Instant,
    val text: String,
)

class Chatroom {
    // 将 SharedFlow 存储在私有支持属性中
    private val _messages = MutableSharedFlow<Message>()

    // 向订阅者暴露只读 SharedFlow
    val messages: SharedFlow<Message>
        get() = _messages.asSharedFlow()

    suspend fun sendMessageToEveryone(message: Message) {
        // 向订阅者发射消息
        _messages.emit(message)
    }
}
```

就像冷流一样，您可以使用 `collect()` 函数从 `SharedFlow` 中收集数值。

您还可以配置 `SharedFlow` 以立即向新订阅者重播已经发射的数值。
重播缓存的工作方式类似于一个小型的历史缓冲区，存储固定数量的先前发射内容。

要设置新订阅者接收多少个先前的发射内容，请在 `MutableSharedFlow()` 中使用 `replay` 参数：

```kotlin
// 设置新订阅者在订阅时接收的已经发射消息的数量
const val MESSAGES_TO_REMEMBER = 10

class Chatroom {
    private val _messages = MutableSharedFlow<Message>(

        // 向新订阅者重播设定数量的最后发射的消息
        replay = MESSAGES_TO_REMEMBER
    )

    val messages: SharedFlow<Message>
        get() = _messages.asSharedFlow()

    suspend fun sendMessageToEveryone(message: Message) {
        // 向 messages 流的订阅者发射消息 
        _messages.emit(message)
    }
}
```

收集热流本身不会完成，因此当您不再需要收集协程时，必须将其 [取消](#cancel-hot-flows)。

> 热流没有关闭或取消操作。
> 取消收集仅停止相应的订阅者进行收集。
> 要停止新的发射，请取消产生热流数值的协程或作用域。
>
{style="note"}

让我们来看一个使用 `SharedFlow` 建模聊天室的示例，它会将每条新消息发送给活跃的订阅者，并向稍后加入的订阅者重播最近的消息：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.*

data class Message(
    val senderId: Int,
    val time: Instant,
    val text: String,
)

// 设置新订阅者在订阅时接收的已经发射消息的数量
const val MESSAGES_TO_REMEMBER = 10

class Chatroom {
    // 将 SharedFlow 存储在私有支持属性中
    private val _messages = MutableSharedFlow<Message>(

        // 向新订阅者重播设定数量的最后发射的消息
        replay = MESSAGES_TO_REMEMBER
    )

    // 向订阅者暴露只读 SharedFlow
    val messages: SharedFlow<Message>
        get() = _messages.asSharedFlow()

    // 向订阅者发射消息
    suspend fun sendMessageToEveryone(message: Message) {
        _messages.emit(message)
    }
}

suspend fun main() {
    val nUsers = 3
    val chatroom = Chatroom()
    withContext(Dispatchers.Default) {
        // 为每个用户启动一个消息读取器
        val messageReaders = List(nUsers) { userId ->
            // 在发射消息之前开始收集
            launch(start = CoroutineStart.UNDISPATCHED) {
                chatroom.messages.collect { message ->
                    println("User $userId received $message")
                }
            }
        }
        // 发送每个用户的问候语
        repeat(nUsers) { userId ->
            chatroom.sendMessageToEveryone(
                Message(
                    userId,
                    Clock.System.now(),
                    "Hello from $userId!"
                )
            )
        }
        // 延迟以确保人们有足够的时间聊天
        delay(100.milliseconds)
        // 取消读取器，因为 SharedFlow 收集不会自动结束
        messageReaders.forEach { it.cancel() }
    }

}
```
{kotlin-runnable="true"}

在此示例中，[`CoroutineStart.UNDISPATCHED`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-start/-u-n-d-i-s-p-a-t-c-h-e-d/) 会立即启动每个收集协程。

这确保了每个协程在 `sendMessageToEveryone()` 发射消息之前都能到达 `collect()`，订阅 `messages` 并挂起。
如果没有它，如果重播缓存太小，收集协程可能会在稍后启动并错过较早的发射内容。

#### 使用显式支持字段暴露热流
<primary-label ref="experimental-opt-in"/>

您可以使用 [显式支持字段 (explicit backing fields)](whatsnew23.md#explicit-backing-fields) 来暴露只读的 `SharedFlow`，同时在类内部保持一个可变的支持字段。

显式支持字段在 `field` 声明中定义实现类型。
在类内部，编译器会将该属性智能转换为支持字段类型，因此您可以在没有单独私有支持属性的情况下调用 `emit()` 函数。

> 显式支持字段不会创建 `.asSharedFlow()` 提供的只读包装器。
> 仅当不担心暴露的流被向下转型时，才使用此模式。
> 
{style="warning"}

示例如下：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Clock
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.ExperimentalTime
import kotlin.time.Instant
        
data class Message(
    val senderId: Int,
    val time: Instant,
    val text: String,
)

const val MESSAGES_TO_REMEMBER = 10

//sampleStart
class Chatroom {
    // 暴露一个带有可变支持字段的只读 SharedFlow
    val messages: SharedFlow<Message>
        field = MutableSharedFlow<Message>(
            replay = MESSAGES_TO_REMEMBER
        )

    suspend fun sendMessageToEveryone(message: Message) {
        // 通过 Chatroom 内部的可变支持字段进行发射
        messages.emit(message)
    }
}
//sampleEnd

suspend fun main() {
    val nUsers = 3
    val chatroom = Chatroom()

    withContext(Dispatchers.Default) {
        val messageReaders = List(nUsers) { userId ->
            launch(start = CoroutineStart.UNDISPATCHED) {
                chatroom.messages.collect { message ->
                    println("User $userId received $message")
                }
            }
        }

        repeat(nUsers) { userId ->
            chatroom.sendMessageToEveryone(
                Message(
                    senderId = userId,
                    time = Clock.System.now(),
                    text = "Hello from $userId!"
                )
            )
        }

        delay(100.milliseconds)
        messageReaders.forEach { it.cancel() }
    }
}
```
{kotlin-runnable="true"}

### 创建 `StateFlow`

[`StateFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-state-flow/) 是一种热流，它存储单个状态值，并在该值被新值替换时发射更新。
新订阅者一旦开始收集就会收到当前值，然后在每次状态更新时收到新值。

您可以使用 `StateFlow` 来表示随时间变化的状态，例如加载进度、UI 状态或对象的状态。

要创建 `StateFlow`，请使用带有初始值的 [`MutableStateFlow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-mutable-state-flow.html) 函数：

```kotlin
// 创建一个以 LoadingState.Started 作为初始值的 MutableStateFlow
val result = MutableStateFlow<LoadingState>(LoadingState.Started)
```

要设置当前状态，请使用 [`value`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-mutable-state-flow/value.html) 属性：

```kotlin
fun loadBlob(url: String): StateFlow<LoadingState> {
    val result = MutableStateFlow<LoadingState>(LoadingState.Started)

    DownloadManager.startLoading(
        url,
        onPercentageLoaded = { percentage ->
            // 用最新进度替换当前状态
            result.value = LoadingState.Percentage(percentage)
        },
        onCompletion = {
            // 用完成状态替换当前状态
            result.value = LoadingState.Done
        },
        onFailure = {
            // 用失败状态替换当前状态
            result.value = LoadingState.Failed
        }
    )
}
```

> 设置 `value` 是线程安全的并会替换当前状态，但基于其先前值更新 `value` 并不是原子的。
> 当新状态依赖于先前状态时，请改用 `.update()`。
>
{style="note"}

类似于 `MutableSharedFlow`，`MutableStateFlow` 暴露了用于发射更新的 API。
如果您直接暴露它，任何接收到它的代码都可以通过将其向下转型为 `MutableStateFlow` 来更新状态。

为了防止这种情况，请使用 [`.asStateFlow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/as-state-flow.html) 函数将可变流暴露为只读的 `StateFlow`：

```kotlin
fun loadBlob(url: String): StateFlow<LoadingState> {
    val result = MutableStateFlow<LoadingState>(LoadingState.Started)

    DownloadManager.startLoading(
        url,
        onPercentageLoaded = { percentage ->
            result.value = LoadingState.Percentage(percentage)
        },
        onCompletion = {
            result.value = LoadingState.Done
        },
        onFailure = {
            result.value = LoadingState.Failed
        }
    )

    // 将加载状态暴露为只读 StateFlow
    return result.asStateFlow()
}
```

这是一个使用 `StateFlow` 从基于回调的 API 报告加载进度的示例：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds
import kotlin.io.encoding.*
import java.io.IOException
import kotlin.random.Random

//sampleStart
sealed interface LoadingState {
    sealed interface Terminal: LoadingState
    object Started: LoadingState
    data class Percentage(val percents: Int): LoadingState
    object Failed: Terminal
    object Done: Terminal
}

fun loadBlob(url: String): StateFlow<LoadingState> {
    // 创建一个带有初始加载状态的可变 StateFlow
    val result = MutableStateFlow<LoadingState>(LoadingState.Started)
    DownloadManager.startLoading(
        url,
        onPercentageLoaded = { percentage ->
            // 用最新进度替换当前状态
            result.value = LoadingState.Percentage(percentage)
        },
        onCompletion = {
            // 用完成状态替换当前状态
            result.value = LoadingState.Done
        },
        onFailure = {
            // 用失败状态替换当前状态
            result.value = LoadingState.Failed
        }
    )
    // 将加载状态暴露为只读 StateFlow
    return result.asStateFlow()
}

// 定义一个异步下载数据的基于回调的 API
object DownloadManager {
    // 开始异步加载 url
    fun startLoading(
        url: String,
        onPercentageLoaded: (Int) -> Unit,
        onCompletion: () -> Unit,
        onFailure: (Throwable) -> Unit
    ) {
        // 此处仅出于说明目的使用 GlobalScope，
        // 以保持此示例自包含
        GlobalScope.launch {
            val failureChancePerStep = 1 - java.lang.Math.pow(0.99, 10.0)

            repeat(10) { step ->
                if (Random.nextDouble() < failureChancePerStep) {
                    onFailure(IOException("Failed to load!"))
                    return@launch
                }
                onPercentageLoaded((step + 1) * 10)
                delay(10.milliseconds)
            }
            onCompletion()
        }
    }
}

suspend fun main() {
    loadBlob("https://example.com/").onEach { state ->
        when (state) {
            is LoadingState.Started -> {
                // 等待进度更新
            }
            is LoadingState.Percentage ->
                println("Loaded ${state.percents}...")
            is LoadingState.Failed ->
                println("Loading failed.")
            is LoadingState.Done ->
                println("Finished loading!")
        }
    }.takeWhile { it !is LoadingState.Terminal }.collect()
}
//sampleEnd
```
{kotlin-runnable="true"}

> 此示例仅为了保持基于回调的 API 简洁而使用 [`GlobalScope`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-global-scope/)。
> 在您自己的应用程序中，请向启动工作的函数（例如此示例中的 `startLoading()`）传递一个 `CoroutineScope`，并在该作用域中启动协程，以便调用者在不再需要工作时可以取消工作。
>
{style="note"}

由于 `StateFlow` 是一种热流，收集不会自行完成。
在此示例中，当加载达到终态时，`.takeWhile()` 操作符会停止收集。

仅当新值与当前值不同时，`StateFlow` 才会发射更新。

> 避免在 `StateFlow` 中存储可变对象。
> 改变对象本身并不会替换当前值，因此收集器不会收到更新。
> 
{style="warning"}

您还可以通过从当前状态计算新状态来更新 `StateFlow`。
对这些更新使用 [`.update()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/update.html) 函数。
`.update()` 函数以原子方式更新值，这在多个协程更新同一个 `MutableStateFlow` 时很有帮助。

> 如果您只需要更新共享值，而不需要观察随时间变化的状态更改，请使用 Kotlin 原子 (Atomics) API，例如 [`AtomicInt`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/-atomic-int/) 或 [`AtomicReference`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/-atomic-reference/)。
>
{style="note"}

这是一个点赞数存储在 `StateFlow` 中的示例，每个新状态都从先前状态计算得出：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds
import kotlin.io.encoding.*
import java.io.IOException
import kotlin.random.Random

//sampleStart
class Post(val id: Long) {
    // 将当前点赞数存储为 StateFlow
    private val _numberOfLikes = MutableStateFlow<Int>(
        // 设置初始点赞数
        0
    )

    // 暴露一个包含当前点赞数的只读 StateFlow
    val numberOfLikes: StateFlow<Int>
        get() = _numberOfLikes.asStateFlow()

    // 添加一个点赞
    fun like() {
        // 为并发和多线程调用原子地增加点赞数
        _numberOfLikes.update { it + 1 }
    }
}

suspend fun drawUpdatedNumberOfLikes(likes: Int) {
    // 显示最新的点赞数
    println("${Clock.System.now()}: the number of likes is $likes")
}

suspend fun main() {
    withContext(Dispatchers.Default) {
        val post = Post(15)
        val notifyingJob = launch {
            post.numberOfLikes.collect {
                drawUpdatedNumberOfLikes(it)
            }
        }
        // 模拟点赞帖子的用户
        coroutineScope {
            repeat(10) {
                launch {
                    delay(Random.nextInt(100).milliseconds)
                    post.like()
                }
            }
        }
        // 在所有模拟用户完成后取消收集
        notifyingJob.cancelAndJoin()
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

在此示例中，`.update()` 函数原子地增加点赞数。
这可以防止多个协程同时调用 `like()` 函数时丢失更新。

#### 在 `StateFlow` 中存储累积状态

有时您可能希望订阅者接收所有先前发射的结果，而不仅仅是最后发射的值。

例如，聊天室可以将消息历史记录保留为单个状态值。
当新用户加入聊天室时，他们首先收到当前的聊天记录。
然后，当新消息到达时，他们继续接收更新。

您可以使用 `StateFlow` 来建模这种行为。

为此，请将完整的消息历史记录作为当前值存储在 `StateFlow<List<Message>>` 中，而不是使用 `SharedFlow<Message>` 将每条聊天消息作为单独事件进行广播：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds
import kotlin.io.encoding.*
import java.io.IOException
import kotlin.random.Random

//sampleStart
data class Message(
    val senderId: Int,
    val time: Instant,
    val text: String,
)

class Chatroom {
    // 存储完整的消息历史记录
    private val _messageHistory = MutableStateFlow<List<Message>>(emptyList())

    // 暴露一个包含当前消息历史记录的只读 StateFlow
    val messageHistory: StateFlow<List<Message>>
        get() = _messageHistory.asStateFlow()

    // 向 messageHistory 流的所有订阅者发送消息
    suspend fun sendMessageToEveryone(message: Message) {
        // 将新消息原子地添加到当前历史记录中
        _messageHistory.update {
            it + message
        }
    }
}

suspend fun main() {
    val nUsers = 3
    val chatroom = Chatroom()
    withContext(Dispatchers.Default) {
        // 为每个用户启动一个消息读取器
        val messageReaders = List(nUsers) { userId ->
            launch(start = CoroutineStart.UNDISPATCHED) {
                chatroom.messageHistory.collect { currentHistory ->
                    println("User $userId sees the history as $currentHistory")
                }
            }
        }
        // 发送每个用户的问候语
        repeat(nUsers) { userId ->
            chatroom.sendMessageToEveryone(
                Message(
                    userId,
                    Clock.System.now(),
                    "Hello from $userId!"
                )
            )
        }
        // 延迟以确保用户有足够时间接收更新
        delay(100.milliseconds)
        // 取消读取器，因为 StateFlow 收集不会自动结束
        messageReaders.forEach { it.cancel() }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

在此示例中，`messageHistory` 将完整的前序消息列表存储为当前状态。
当发送新消息时，`.update()` 函数从先前历史记录创建一个新列表并原子地添加新消息。

> 随着集合规模的扩大，通过创建新集合来更新不可变集合可能会花费更多时间。
> 您可以使用 [实验性](components-stability.md#stability-levels-explained) [`kotlinx.collections.immutable`](https://github.com/Kotlin/kotlinx.collections.immutable) 库创建持久化集合，从而提高不可变集合更新的效率。
>
{style="tip"}

由于 `messageHistory` 是一个 `StateFlow`，订阅者在开始收集时会收到当前的消息历史记录。
在那之后，每次发送消息（这会改变聊天记录）时，他们都会收到一个新列表。

### 将冷流转换为热流

冷流会为每个收集器单独运行其上游操作。
当多个订阅者需要来自同一个上游收集的发射内容时，您可以将冷流转换为热流，从而与其订阅者共享该收集操作。

以下 `simpleShareIn()` 的简化版本展示了这个想法：收集一次冷流，将其数值发射到 `MutableSharedFlow` 中，并将其暴露为只读的 `SharedFlow`：

```kotlin
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.*

fun <T> Flow<T>.simpleShareIn(scope: CoroutineScope): SharedFlow<T> {
    val sharedFlow = MutableSharedFlow<T>()
    scope.launch {
        this@simpleShareIn.collect {
            sharedFlow.emit(it)
        }
    }
    return sharedFlow.asSharedFlow()
}

suspend fun main() { 
    
}
```

在此示例中，`simpleShareIn()` 在提供的工作作用域中启动一个新协程。
要停止从上游流收集，请 [取消](#cancel-hot-flows) 运行该收集协程的作用域。

如果上游流抛出异常，此收集协程将失败。
在共享流之前使用诸如 `.catch()` 或 `.retry()` 之类的操作符，以便在收集协程失败之前 [处理上游异常](#handle-exceptions-in-hot-flows)。

内置的 [`.shareIn()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/share-in.html) 函数提供了这种模式，而无需您自己创建 `MutableSharedFlow`。
它还增加了控制上游收集何时开始和停止，以及新订阅者接收多少先前发射内容的选项。

要使用内置的 `.shareIn()` 函数，请提供以下参数：

* 收集上游流的协程作用域。
* 控制上游收集何时开始和停止的 [`SharingStarted`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-sharing-started/) 策略。
   例如，[`SharingStarted.Eagerly`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-sharing-started/-companion/-eagerly.html) 会在提供的作用域中立即开始上游收集，直到任何订阅者开始收集之前。
* 可选的 `replay` 值，控制新订阅者接收多少个先前的发射内容。

`.shareIn()` 函数在提供的协程作用域内收集上游流，并将其发射内容广播给订阅者。

这是一个 `.shareIn()` 将冷流转换为热流的示例，该热流与多个订阅者共享序列化的聊天消息：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds
import kotlin.io.encoding.*
import java.io.IOException
import kotlin.random.Random

//sampleStart
data class Message(
    val senderId: Int,
    val time: Instant,
    val text: String,
)

class Chatroom {
    // 存储消息流
    private val _messages = MutableSharedFlow<Message>()

    // 暴露一个只读的 SharedFlow 及其发射的消息
    // 新订阅者不会收到已经发射的消息
    val messages: SharedFlow<Message>
        get() = _messages.asSharedFlow()
  
    // 向 messages 流的所有订阅者发送消息
    suspend fun sendMessageToEveryone(message: Message) {
        _messages.emit(message)
    }
}

suspend fun main() {
    val nUsers = 3
    val chatroom = Chatroom()
    withContext(Dispatchers.Default) {
        // 创建当前运行协程的子作用域
        val derivedFlowsScope = CoroutineScope(
            currentCoroutineContext() + Job(currentCoroutineContext()[Job])
        )
        // 在订阅者之间共享序列化的消息
        val serializedMessages: SharedFlow<String> =
            chatroom
                .messages
                .map {
                    // 为共享流对每条消息进行一次序列化
                    "senderId: ${it.senderId}, time: ${it.time}, text: " +
                        Base64.Default.encode(it.text.encodeToByteArray())
                }
                .shareIn(
                    // 在此作用域中启动共享协程。
                    // 上游流（包括 .map()）在该协程中运行
                    derivedFlowsScope,

                    // 在第一个订阅者出现之前，立即开始收集上游流
                    SharingStarted.Eagerly,

                    // 不向新订阅者重播先前的序列化消息
                    replay = 0,
                )

        // 为每个用户启动一个消息读取器
        val messageReaders = List(nUsers) { userId ->
            launch(start = CoroutineStart.UNDISPATCHED) {
                serializedMessages.collect { serializedMessage ->
                    println("User $userId observes the message $serializedMessage")
                }
            }
        }
        // 发送每个用户的问候语
        repeat(nUsers) { userId ->
            chatroom.sendMessageToEveryone(
                Message(
                    userId,
                    Clock.System.now(),
                    "Hello from $userId!"
                )
            )
        }
        // 延迟以确保用户有足够时间接收更新
        delay(100.milliseconds)
        // 取消读取器，因为 SharedFlow 收集不会自动结束
        messageReaders.forEach { it.cancel() }
        // 取消运行派生热流的作用域
        derivedFlowsScope.cancel()
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

在此示例中，[`.map()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map.html) 操作符创建了一个序列化每条消息的冷流。
如果没有 `.shareIn()` 函数，每个收集器都会单独运行该序列化操作。
`.shareIn()` 函数共享一个上游收集操作，因此每条消息只需序列化一次，然后共享给所有订阅者。

因为 `SharingStarted.Eagerly` 会立即开始上游收集，派生的热流会在调用 `.shareIn()` 后立即开始收集 `chatroom.messages`。

类似地，要将冷流转换为 `StateFlow`，请使用 [`.stateIn()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/state-in.html) 函数。

与 `.shareIn()` 不同，`.stateIn()` 需要一个初始值，因为 `StateFlow` 必须始终有一个当前值。

例如：

```kotlin
val lastUpdateFlow: StateFlow<Instant?> =
    chatroom
        .messageHistory
        .map { currentHistory -> currentHistory.lastOrNull()?.time }
        .stateIn(
            // 在此作用域中启动共享协程
            // 上游流（包括 .map()）在该协程中运行
            derivedFlowsScope,

            // 在第一个订阅者出现时开始收集
            // 并在最后一个订阅者消失时停止
            SharingStarted.WhileSubscribed(),
            // 在第一次上游发射之前设置初始状态
            null,
        )
```

### 取消热流

当订阅者被取消时，热流不会停止。

当您取消收集热流的协程时，您只取消了该订阅者。
热流仍然可以向其他订阅者发射数值，并且产生这些数值的协程可以继续运行。

热流本身没有取消操作。要取消热流，请取消产生其数值的协程或作用域。

使用 `.shareIn()` 或 `.stateIn()` 扩展函数创建的热流将继续收集上游流，直到共享协程被取消。
要停止从上游流收集，请取消运行共享协程的作用域。

> 您还可以使用 [`SharingStarted.WhileSubscribed()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-sharing-started/-companion/-while-subscribed.html) 在没有订阅者时自动停止上游收集。
> 
{style="tip"}

这是一个取消传递给 `.stateIn()` 的作用域从而停止派生热流收集新值的示例：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds
import kotlin.io.encoding.*
import java.io.IOException
import kotlin.random.Random

data class Message(
    val senderId: Int,
    val time: Instant,
    val text: String,
)

class Chatroom {
    // 存储消息历史记录
    private val _messageHistory = MutableStateFlow<List<Message>>(emptyList())

    // 暴露一个包含当前消息历史记录的只读 StateFlow
    val messageHistory: StateFlow<List<Message>>
        get() = _messageHistory.asStateFlow()

    // 向 messageHistory 流的所有订阅者发送消息
    suspend fun sendMessageToEveryone(message: Message) {
        _messageHistory.update {
            it + message
        }
    }
}

//sampleStart
suspend fun main() {
    val chatroom = Chatroom()
    withContext(Dispatchers.Default) {
        // 创建当前运行协程的子作用域
        val derivedFlowsScope = CoroutineScope(
            currentCoroutineContext() + Job(currentCoroutineContext()[Job])
        )
        val totalMessages = chatroom.messageHistory
            .map { currentHistory ->
                currentHistory.size
            }.onEach {
                println("There are currently $it messages")
            }.stateIn(
                // 在此作用域中启动共享协程
                derivedFlowsScope
            )
        // 更新 messageHistory
        chatroom.sendMessageToEveryone(
            Message(0, Clock.System.now(), "We are shutting down soon!")
        )
        delay(100.milliseconds)
        // 取消运行派生热流的作用域
        derivedFlowsScope.cancel()
        // 更新 messageHistory，但 totalMessages 不再收到更新
        chatroom.sendMessageToEveryone(
            Message(0, Clock.System.now(), "We have shut down.")
        )
        println("Last collected history size: ${totalMessages.value}")
        println("Actual history size: ${chatroom.messageHistory.value.size}")
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

在此示例中，当您调用 `derivedFlowsScope.cancel()` 函数时，`totalMessages` 停止从 `messageHistory` 收集更新。

`sendMessageToEveryone()` 函数仍然更新 `messageHistory`，因为调用它的协程没有被取消。
结果，`totalMessages.value` 保持最后收集的大小，而 `chatroom.messageHistory.value.size` 显示实际的消息数量。

### 处理热流中的异常

在 [冷流](#handle-exceptions-in-flows) 中，除非您使用 `.catch()` 等操作符先处理上游异常，否则异常会传播给 `collect()` 的调用者。

热流不会将异常从生产者传播给订阅者。
如果发射到 `MutableSharedFlow` 或更新 `MutableStateFlow` 的代码抛出异常，请在运行该代码的协程中处理它。
如果订阅者在收集时抛出异常，请在收集协程中处理它。

使用 `.shareIn()` 或 `.stateIn()` 扩展函数创建的热流在共享协程中从上游流收集数据。
如果上游流抛出异常，该异常会取消共享协程：

```kotlin
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.*

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default) {
        launch {
            flow<Int> {
                error("An upstream failure")
            }.stateIn(
                this@launch
            )
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true" validate="false"}

您可以在失败后 [重启上游收集](#restart-the-upstream-flow-after-an-exception)。
为此，请将 `.retry()` 操作符放在 `.shareIn()` 或 `.stateIn()` 之前：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
suspend fun main() {
    coroutineScope {
        launch {
            var currentAttempt = 0

            val stateFlow = flow {
                delay(10.milliseconds)

                if (currentAttempt++ < 5) {
                    println("An error happened!")
                    error("An upstream failure")
                } else {
                    println("Success.")
                    emit(10)
                }
            }
                // 在可恢复失败后重启上游流
                .retry(retries = 5)
                .stateIn(
                    // 在此作用域中启动共享协程
                    this@launch
                )

            stateFlow.collect {
                println("Observed $it")

                // 取消收集和共享协程
                this@launch.cancel()
            }
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

在此示例中，流在发射数值之前失败了五次。
由于 `.retry()` 在 `.stateIn()` 之前运行，它会在失败到达共享协程之前处理每次上游失败。

在上游流发射 `10` 后，收集协程接收该数值并取消自身。
由于同一个协程也是共享协程的父级，这会停止派生的热流。