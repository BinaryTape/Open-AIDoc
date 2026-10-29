<!--- TEST_NAME ChannelsGuideTest -->
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 通道)

延迟值提供了一种在协程之间传输单个值的便捷方式。
通道（Channel）则提供了一种传输值流的方法。

## 通道基础 {id="channel-basics"}

一个 [Channel] 在概念上非常类似于 `BlockingQueue`。它们之间的一个关键区别是，
通道具有挂起的 [send][SendChannel.send] 而不是阻塞的 `put` 操作，
以及挂起的 [receive][ReceiveChannel.receive] 而不是阻塞的 `take` 操作。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking {
//sampleStart
    val channel = Channel<Int>()
    launch {
        // 这可能是耗费 CPU 的大量计算或异步逻辑，
        // 我们只需发送五个平方数
        for (x in 1..5) channel.send(x * x)
    }
    // 在这里我们打印五个接收到的整数：
    repeat(5) { println(channel.receive()) }
    println("Done!")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-01.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-01.kt)获取完整代码。
>
{style="note"}

这段代码的输出是：

```text
1
4
9
16
25
Done!
```

<!--- TEST -->

## 关闭通道与迭代通道 {id="closing-and-iteration-over-channels"}

与队列不同，通道可以被关闭，以表示没有更多元素到来了。
在接收端，使用常规的 `for` 循环从通道中接收元素是非常方便的。

从概念上讲，[close][SendChannel.close] 类似于向通道发送一个特殊的关闭令牌。
一旦接收到这个关闭令牌，迭代就会停止，因此可以保证
在关闭之前发送的所有元素都能被接收到：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking {
//sampleStart
    val channel = Channel<Int>()
    launch {
        for (x in 1..5) channel.send(x * x)
        channel.close() // 我们发送完了
    }
    // 在这里我们使用 `for` 循环打印接收到的值（直到通道关闭）
    for (y in channel) println(y)
    println("Done!")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-02.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-02.kt)获取完整代码。
>
{style="note"}

<!--- TEST 
1
4
9
16
25
Done!
-->

## 构建通道生产者 {id="building-channel-producers"}

协程生成元素序列的模式非常常见。
这是并发代码中经常出现的“生产者-消费者”模式的一部分。
您可以将这样的生产者抽象为一个将通道作为形参的函数，但这违背了
结果应从函数中返回的常识。

有一个名为 [produce] 的便捷协程构建器，可以轻松地在生产者端正确完成此操作，
还有一个扩展函数 [consumeEach]，它可以在消费者端替换 `for` 循环：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

//sampleStart
fun CoroutineScope.produceSquares(): ReceiveChannel<Int> = produce {
    for (x in 1..5) send(x * x)
}

fun main() = runBlocking {
    val squares = produceSquares()
    squares.consumeEach { println(it) }
    println("Done!")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-03.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-03.kt)获取完整代码。
>
{style="note"}

<!--- TEST 
1
4
9
16
25
Done!
-->

## 流水线 {id="pipelines"}

流水线（Pipeline）是一种模式，其中一个协程正在产生（可能是无穷的）值流：

```kotlin
fun CoroutineScope.produceNumbers() = produce<Int> {
    var x = 1
    while (true) send(x++) // 从 1 开始的无限整数流
}
```

而另一个或多个协程正在消费该流，进行一些处理，并产生其他结果。
在下面的示例中，数字只是被平方了：

```kotlin
fun CoroutineScope.square(numbers: ReceiveChannel<Int>): ReceiveChannel<Int> = produce {
    for (x in numbers) send(x * x)
}
```

主代码启动并连接整个流水线：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking {
//sampleStart
    val numbers = produceNumbers() // 从 1 开始产生整数
    val squares = square(numbers) // 对整数求平方
    repeat(5) {
        println(squares.receive()) // 打印前五个
    }
    println("Done!") // 我们完成了
    coroutineContext.cancelChildren() // 取消子协程
//sampleEnd
}

fun CoroutineScope.produceNumbers() = produce<Int> {
    var x = 1
    while (true) send(x++) // 从 1 开始的无限整数流
}

fun CoroutineScope.square(numbers: ReceiveChannel<Int>): ReceiveChannel<Int> = produce {
    for (x in numbers) send(x * x)
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-04.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-04.kt)获取完整代码。
>
{style="note"}

<!--- TEST 
1
4
9
16
25
Done!
-->

> 所有创建协程的函数都被定义为 [CoroutineScope] 的扩展，
> 这样我们就可以依靠[结构化并发](composing-suspending-functions.md#structured-concurrency-with-async)来确保
> 应用程序中不会有残留的全局协程。
>
{style="note"}

## 使用流水线生成素数 {id="prime-numbers-with-pipeline"}

让我们通过一个使用协程流水线生成素数的示例将流水线运用到极致。我们从无限的数字序列开始。

```kotlin
fun CoroutineScope.numbersFrom(start: Int) = produce<Int> {
    var x = start
    while (true) send(x++) // 从 start 开始的无限整数流
}
```

接下来的流水线阶段过滤输入的数字流，移除所有可以被给定素数整除的数字：

```kotlin
fun CoroutineScope.filter(numbers: ReceiveChannel<Int>, prime: Int) = produce<Int> {
    for (x in numbers) if (x % prime != 0) send(x)
}
```

现在我们通过从 2 开始数字流，从当前通道中取出一个素数，
并为找到的每个素数启动新的流水线阶段来构建流水线：
 
```
numbersFrom(2) -> filter(2) -> filter(3) -> filter(5) -> filter(7) ... 
```
 
以下示例打印前十个素数，并在主线程上下文中运行整个流水线。
由于所有协程都是在主 [runBlocking] 协程的作用域中启动的，
我们不必显式维护所有已启动协程的列表。
在打印完前十个素数后，我们使用 [cancelChildren][kotlin.coroutines.CoroutineContext.cancelChildren] 
扩展函数取消所有子协程。

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking {
//sampleStart
    var cur = numbersFrom(2)
    repeat(10) {
        val prime = cur.receive()
        println(prime)
        cur = filter(cur, prime)
    }
    coroutineContext.cancelChildren() // 取消所有子协程以让主协程结束
//sampleEnd    
}

fun CoroutineScope.numbersFrom(start: Int) = produce<Int> {
    var x = start
    while (true) send(x++) // 从 start 开始的无限整数流
}

fun CoroutineScope.filter(numbers: ReceiveChannel<Int>, prime: Int) = produce<Int> {
    for (x in numbers) if (x % prime != 0) send(x)
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-05.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-05.kt)获取完整代码。
>
{style="note"}

这段代码的输出是：

```text
2
3
5
7
11
13
17
19
23
29
```

<!--- TEST -->

请注意，您可以使用标准库中的 [`iterator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/iterator.html) 
协程构建器构建相同的流水线。
将 `produce` 替换为 `iterator`，`send` 替换为 `yield`，`receive` 替换为 `next`，
`ReceiveChannel` 替换为 `Iterator`，并去掉协程作用域。您也不再需要 `runBlocking`。
然而，如上所示使用通道的流水线的好处是，如果您在 [Dispatchers.Default] 上下文中运行它，
它实际上可以使用多个 CPU 核心。

无论如何，这都是一种极其不切实际的寻找素数的方法。在实践中，流水线确实涉及一些
其他挂起调用（如对远程服务的异步调用），并且这些流水线不能使用 `sequence`/`iterator` 构建，
因为它们不允许任意挂起，而不像 `produce` 那样是完全异步的。
 
## 扇出 {id="fan-out"}

多个协程可以从同一个通道接收，在它们之间分配工作。
让我们从一个定期产生整数的生产者协程开始（每秒产生十个数字）：

```kotlin
fun CoroutineScope.produceNumbers() = produce<Int> {
    var x = 1 // 从 1 开始
    while (true) {
        send(x++) // 产生下一个
        delay(100) // 等待 0.1 s
    }
}
```

然后我们可以有几个处理器协程。在这个例子中，它们只是打印它们的 ID 和接收到的数字：

```kotlin
fun CoroutineScope.launchProcessor(id: Int, channel: ReceiveChannel<Int>) = launch {
    for (msg in channel) {
        println("Processor #$id received $msg")
    }    
}
```

现在让我们启动五个处理器，让它们工作将近一秒钟。看看会发生什么：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking<Unit> {
//sampleStart
    val producer = produceNumbers()
    repeat(5) { launchProcessor(it, producer) }
    delay(950)
    producer.cancel() // 取消生产者协程，从而杀死它们所有
//sampleEnd
}

fun CoroutineScope.produceNumbers() = produce<Int> {
    var x = 1 // 从 1 开始
    while (true) {
        send(x++) // 产生下一个
        delay(100) // 等待 0.1 s
    }
}

fun CoroutineScope.launchProcessor(id: Int, channel: ReceiveChannel<Int>) = launch {
    for (msg in channel) {
        println("Processor #$id received $msg")
    }    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-06.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-06.kt)获取完整代码。
>
{style="note"}

输出将类似于以下内容，尽管接收每个特定整数的处理器 ID 可能会有所不同：

```text
Processor #2 received 1
Processor #4 received 2
Processor #0 received 3
Processor #1 received 4
Processor #3 received 5
Processor #2 received 6
Processor #4 received 7
Processor #0 received 8
Processor #1 received 9
Processor #3 received 10
```

<!--- TEST lines.size == 10 && lines.withIndex().all { (i, line) -> line.startsWith("Processor #") && line.endsWith(" received ${i + 1}") } -->

请注意，取消生产者协程会关闭其通道，从而最终终止处理器协程正在进行的通道迭代。

另外，请注意我们在 `launchProcessor` 代码中如何通过 `for` 循环显式迭代通道以执行扇出。
与 `consumeEach` 不同，这个 `for` 循环模式在多个协程中使用是完全安全的。如果其中一个处理器协程失败，
其他协程仍将处理该通道，而通过 `consumeEach` 编写的处理器无论是在正常完成还是异常完成时，
始终会消费（取消）底层通道。

## 扇入 {id="fan-in"}

多个协程可以发送到同一个通道。
例如，让我们有一个字符串通道，以及一个在指定的延迟后反复向该通道发送指定字符串的挂起函数：

```kotlin
suspend fun sendString(channel: SendChannel<String>, s: String, time: Long) {
    while (true) {
        delay(time)
        channel.send(s)
    }
}
```

现在，让我们看看如果我们启动几个发送字符串的协程会发生什么（在这个例子中，
我们在主线程上下文中将它们作为主协程的子协程启动）：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking {
//sampleStart
    val channel = Channel<String>()
    launch { sendString(channel, "foo", 200L) }
    launch { sendString(channel, "BAR!", 500L) }
    repeat(6) { // 接收前六个
        println(channel.receive())
    }
    coroutineContext.cancelChildren() // 取消所有子协程以让主协程结束
//sampleEnd
}

suspend fun sendString(channel: SendChannel<String>, s: String, time: Long) {
    while (true) {
        delay(time)
        channel.send(s)
    }
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-07.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-07.kt).
>
{style="note"}

输出是：

```text
foo
foo
BAR!
foo
foo
BAR!
```

<!--- TEST -->

## 缓冲通道 {id="buffered-channels"}

到目前为止显示的通道都没有缓冲区。无缓冲通道在发送者和接收者相遇（即汇合点/rendezvous）时传输元素。
如果先调用发送，则它会挂起直到调用接收；如果先调用接收，它会挂起直到调用发送。

[Channel()] 工厂函数和 [produce] 构建器都带有一个可选的 `capacity` 形参来指定“缓冲区大小”。
缓冲区允许发送者在挂起之前发送多个元素，类似于具有指定容量的 `BlockingQueue`（当缓冲区满时阻塞）。

请观察以下代码的行为：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking<Unit> {
//sampleStart
    val channel = Channel<Int>(4) // 创建缓冲通道
    val sender = launch { // 启动发送者协程
        repeat(10) {
            println("Sending $it") // 在发送每个元素之前打印
            channel.send(it) // 当缓冲区满时将挂起
        }
    }
    // 不接收任何东西……只是等待……
    delay(1000)
    sender.cancel() // 取消发送者协程
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-08.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-08.kt)获取完整代码。
>
{style="note"}

使用容量为 *4* 的缓冲通道，它打印了“sending” *5* 次：

```text
Sending 0
Sending 1
Sending 2
Sending 3
Sending 4
```

<!--- TEST -->

前四个元素被添加到缓冲区中，发送者在尝试发送第五个元素时挂起。

## 通道是公平的 {id="channels-are-fair"}

对于来自多个协程的调用顺序，通道的发送和接收操作是“公平”的。
它们按照先进先出的顺序提供服务，例如，第一个调用 `receive` 的协程将获得该元素。
在以下示例中，两个协程 “ping” 和 “pong” 正在从共享的 “table” 通道接收 “ball” 对象。 

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

//sampleStart
data class Ball(var hits: Int)

fun main() = runBlocking {
    val table = Channel<Ball>() // 共享的 table
    launch { player("ping", table) }
    launch { player("pong", table) }
    table.send(Ball(0)) // 击球
    delay(1000) // 等待 1 秒
    coroutineContext.cancelChildren() // 游戏结束，取消它们
}

suspend fun player(name: String, table: Channel<Ball>) {
    for (ball in table) { // 在循环中接收球
        ball.hits++
        println("$name $ball")
        delay(300) // 等待一会
        table.send(ball) // 将球发回去
    }
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-09.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-09.kt)获取完整代码。
>
{style="note"}

“ping” 协程先启动，所以它是第一个接收球的。即使 “ping” 协程在将球发回 table 后立即再次开始接收，
球也会被 “pong” 协程接收，因为它已经在等待了：

```text
ping Ball(hits=1)
pong Ball(hits=2)
ping Ball(hits=3)
pong Ball(hits=4)
```

<!--- TEST -->

请注意，由于所使用的执行器的性质，通道有时可能会产生看起来不公平的执行。
有关详情，请参阅[此问题](https://github.com/Kotlin/kotlinx.coroutines/issues/111)。

## 滴答通道 {id="ticker-channels"}

滴答通道（Ticker channel）是一种特殊的汇合通道，每当自上次从此通道消费后经过给定的延迟，它就会产生一个 `Unit`。
虽然它作为单独的组件看起来没什么用，但它是一个有用的构建块，用于创建复杂的基于时间的 [produce] 流水线，
以及执行窗口化和其他与时间相关的处理的运算符。
滴答通道可以在 [select] 中使用，以执行 “on tick” 操作。

要创建此类通道，请使用工厂方法 [ticker]。 
要表示不再需要更多元素，请对其使用 [ReceiveChannel.cancel] 方法。

现在让我们看看它在实践中是如何工作的：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

//sampleStart
fun main() = runBlocking<Unit> {
    val tickerChannel = ticker(delayMillis = 200, initialDelayMillis = 0) // 创建一个滴答通道
    var nextElement = withTimeoutOrNull(1) { tickerChannel.receive() }
    println("Initial element is available immediately: $nextElement") // 无初始延迟

    nextElement = withTimeoutOrNull(100) { tickerChannel.receive() } // 所有后续元素都有 200ms 延迟
    println("Next element is not ready in 100 ms: $nextElement")

    nextElement = withTimeoutOrNull(120) { tickerChannel.receive() }
    println("Next element is ready in 200 ms: $nextElement")

    // 模拟消费者的大量消耗延迟
    println("Consumer pauses for 300ms")
    delay(300)
    // 下一个元素立即可以获取
    nextElement = withTimeoutOrNull(1) { tickerChannel.receive() }
    println("Next element is available immediately after large consumer delay: $nextElement")
    // 注意，`receive` 调用之间的暂停已被考虑在内，下一个元素到达得更快
    nextElement = withTimeoutOrNull(120) { tickerChannel.receive() }
    println("Next element is ready in 100ms after consumer pause in 300ms: $nextElement")

    tickerChannel.cancel() // 表示不再需要更多元素
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-10.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-10.kt)获取完整代码。
>
{style="note"}

它打印出以下行：

```text
Initial element is available immediately: kotlin.Unit
Next element is not ready in 100 ms: null
Next element is ready in 200 ms: kotlin.Unit
Consumer pauses for 300ms
Next element is available immediately after large consumer delay: kotlin.Unit
Next element is ready in 100ms after consumer pause in 300ms: kotlin.Unit
```

<!--- TEST -->

请注意， [ticker] 能够感知可能的消费者暂停，并且默认情况下，如果发生暂停，它会调整下一个生成的元素的延迟，
试图保持固定的生成元素速率。
 
（可选地），可以指定一个等于 [TickerMode.FIXED_DELAY] 的 `mode` 形参，以保持元素之间固定的延迟。

<!--- MODULE kotlinx-coroutines-core -->
<!--- INDEX kotlinx.coroutines -->

[CoroutineScope]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/index.html
[runBlocking]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/run-blocking.html
[kotlin.coroutines.CoroutineContext.cancelChildren]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/cancel-children.html
[Dispatchers.Default]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-default.html

<!--- INDEX kotlinx.coroutines.channels -->

[Channel]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-channel/index.html
[SendChannel.send]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-send-channel/send.html
[ReceiveChannel.receive]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-receive-channel/receive.html
[SendChannel.close]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-send-channel/close.html
[produce]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/produce.html
[consumeEach]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/consume-each.html
[Channel()]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-channel.html
[ticker]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/ticker.html
[ReceiveChannel.cancel]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-receive-channel/cancel.html
[TickerMode.FIXED_DELAY]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-ticker-mode/-f-i-x-e-d_-d-e-l-a-y/index.html

<!--- INDEX kotlinx.coroutines.selects -->

[select]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.selects/select.html

<!--- END -->