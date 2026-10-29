<!--- TEST_NAME SelectGuideTest --> 
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: Select 表达式（实验性）)

Select 表达式可以同时等待多个挂起函数，并选择第一个可用的结果。

> Select 表达式是 `kotlinx.coroutines` 的实验性功能。它们的 API 预计会在 `kotlinx.coroutines` 库即将到来的更新中发生演变，并可能包含破坏性更改。
>
{style="note"}

## 从通道中选择 {id="selecting-from-channels"}

假设我们有两个字符串生产者：`fizz` 和 `buzz`。`fizz` 每 500 毫秒生成一个 "Fizz" 字符串：

```kotlin
fun CoroutineScope.fizz() = produce<String> {
    while (true) { // 每 500 毫秒发送一个 "Fizz"
        delay(500)
        send("Fizz")
    }
}
```

而 `buzz` 每 1000 毫秒生成一个 "Buzz!" 字符串：

```kotlin
fun CoroutineScope.buzz() = produce<String> {
    while (true) { // 每 1000 毫秒发送一个 "Buzz!"
        delay(1000)
        send("Buzz!")
    }
}
```

使用 [receive][ReceiveChannel.receive] 挂起函数，我们可以从其中一个通道接收，也可以从另一个接收。但 [select] 表达式允许我们使用其 [onReceive][ReceiveChannel.onReceive] 子句同时从两者接收：

```kotlin
suspend fun selectFizzBuzz(fizz: ReceiveChannel<String>, buzz: ReceiveChannel<String>) {
    select<Unit> { // <Unit> 表示该 select 表达式不产生任何结果 
        fizz.onReceive { value ->  // 这是第一个 select 子句
            println("fizz -> '$value'")
        }
        buzz.onReceive { value ->  // 这是第二个 select 子句
            println("buzz -> '$value'")
        }
    }
}
```

让我们运行它七次：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*
import kotlinx.coroutines.selects.*

fun CoroutineScope.fizz() = produce<String> {
    while (true) { // 每 500 毫秒发送一个 "Fizz"
        delay(500)
        send("Fizz")
    }
}

fun CoroutineScope.buzz() = produce<String> {
    while (true) { // 每 1000 毫秒发送一个 "Buzz!"
        delay(1000)
        send("Buzz!")
    }
}

suspend fun selectFizzBuzz(fizz: ReceiveChannel<String>, buzz: ReceiveChannel<String>) {
    select<Unit> { // <Unit> 表示该 select 表达式不产生任何结果 
        fizz.onReceive { value ->  // 这是第一个 select 子句
            println("fizz -> '$value'")
        }
        buzz.onReceive { value ->  // 这是第二个 select 子句
            println("buzz -> '$value'")
        }
    }
}

fun main() = runBlocking<Unit> {
//sampleStart
    val fizz = fizz()
    val buzz = buzz()
    repeat(7) {
        selectFizzBuzz(fizz, buzz)
    }
    coroutineContext.cancelChildren() // 取消 fizz 和 buzz 协程
//sampleEnd        
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-select-01.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-select-01.kt)获取完整代码。
>
{style="note"}

这段代码的结果是： 

```text
fizz -> 'Fizz'
buzz -> 'Buzz!'
fizz -> 'Fizz'
fizz -> 'Fizz'
buzz -> 'Buzz!'
fizz -> 'Fizz'
fizz -> 'Fizz'
```

<!--- TEST -->

## 在通道关闭时选择 {id="selecting-on-close"}

当通道关闭时，`select` 中的 [onReceive][ReceiveChannel.onReceive] 子句会失败，导致相应的 `select` 抛出异常。我们可以使用 [onReceiveCatching][ReceiveChannel.onReceiveCatching] 子句在通道关闭时执行特定操作。以下示例还展示了 `select` 是一个表达式，它会返回其所选子句的结果：

```kotlin
suspend fun selectAorB(a: ReceiveChannel<String>, b: ReceiveChannel<String>): String =
    select<String> {
        a.onReceiveCatching { it ->
            val value = it.getOrNull()
            if (value != null) {
                "a -> '$value'"
            } else {
                "Channel 'a' is closed"
            }
        }
        b.onReceiveCatching { it ->
            val value = it.getOrNull()
            if (value != null) {
                "b -> '$value'"
            } else {
                "Channel 'b' is closed"
            }
        }
    }
```

让我们将其用于通道 `a`（生成四次 "Hello" 字符串）和通道 `b`（生成四次 "World" 字符串）：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*
import kotlinx.coroutines.selects.*

suspend fun selectAorB(a: ReceiveChannel<String>, b: ReceiveChannel<String>): String =
    select<String> {
        a.onReceiveCatching { it ->
            val value = it.getOrNull()
            if (value != null) {
                "a -> '$value'"
            } else {
                "Channel 'a' is closed"
            }
        }
        b.onReceiveCatching { it ->
            val value = it.getOrNull()
            if (value != null) {
                "b -> '$value'"
            } else {
                "Channel 'b' is closed"
            }
        }
    }
    
fun main() = runBlocking<Unit> {
//sampleStart
    val a = produce<String> {
        repeat(4) { send("Hello $it") }
    }
    val b = produce<String> {
        repeat(4) { send("World $it") }
    }
    repeat(8) { // 打印前八个结果
        println(selectAorB(a, b))
    }
    coroutineContext.cancelChildren()  
//sampleEnd      
}    
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-select-02.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-select-02.kt)获取完整代码。
>
{style="note"}

这段代码的结果非常有趣，我们将对其进行更详细的分析：

```text
a -> 'Hello 0'
a -> 'Hello 1'
b -> 'World 0'
a -> 'Hello 2'
a -> 'Hello 3'
b -> 'World 1'
Channel 'a' is closed
Channel 'a' is closed
```

<!--- TEST -->

我们可以从中观察到几点。 

首先，`select` 偏向于第一个子句。当多个子句同时可被选择时，其中的第一个会被选中。在这里，两个通道都在不断地生成字符串，因此作为 select 中第一个子句的 `a` 通道获胜。但是，因为我们使用的是无缓冲通道，`a` 在调用其 [send][SendChannel.send] 时会不时被挂起，从而也给了 `b` 发送的机会。

第二个观察结果是，当通道已经关闭时，[onReceiveCatching][ReceiveChannel.onReceiveCatching] 会被立即选中。

## 选择发送 {id="selecting-to-send"}

Select 表达式具有 [onSend][SendChannel.onSend] 子句，将其与选择的偏向性结合使用会大有裨益。

让我们编写一个整数生产者的示例，当其主通道上的消费者跟不上速度时，它会将其值发送到 `side` 通道：

```kotlin
fun CoroutineScope.produceNumbers(side: SendChannel<Int>) = produce<Int> {
    for (num in 1..10) { // 生成 10 个数字（从 1 到 10）
        delay(100) // 每 100 毫秒
        select<Unit> {
            onSend(num) {} // 发送到主通道
            side.onSend(num) {} // 或者发送到 side 通道     
        }
    }
}
```

消费者将非常缓慢，处理每个数字需要 250 毫秒：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*
import kotlinx.coroutines.selects.*

fun CoroutineScope.produceNumbers(side: SendChannel<Int>) = produce<Int> {
    for (num in 1..10) { // 生成 10 个数字（从 1 到 10）
        delay(100) // 每 100 毫秒
        select<Unit> {
            onSend(num) {} // 发送到主通道
            side.onSend(num) {} // 或者发送到 side 通道     
        }
    }
}

fun main() = runBlocking<Unit> {
//sampleStart
    val side = Channel<Int>() // 分配 side 通道
    launch { // 这是 side 通道的一个非常快速的消费者
        side.consumeEach { println("Side channel has $it") }
    }
    produceNumbers(side).consumeEach { 
        println("Consuming $it")
        delay(250) // 让我们妥善消化消费的数字，不要着急
    }
    println("Done consuming")
    coroutineContext.cancelChildren()  
//sampleEnd      
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-select-03.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-select-03.kt)获取完整代码。
>
{style="note"}
  
让我们看看会发生什么：
 
```text
Consuming 1
Side channel has 2
Side channel has 3
Consuming 4
Side channel has 5
Side channel has 6
Consuming 7
Side channel has 8
Side channel has 9
Consuming 10
Done consuming
```

<!--- TEST -->

## 选择延迟值 {id="selecting-deferred-values"}

可以使用 [onAwait][Deferred.onAwait] 子句来选择延迟值。让我们从一个在随机延迟后返回延迟字符串值的异步函数开始：

```kotlin
fun CoroutineScope.asyncString(time: Int) = async {
    delay(time.toLong())
    "Waited for $time ms"
}
```

让我们以随机延迟启动十几个这样的函数。

```kotlin
fun CoroutineScope.asyncStringsList(): List<Deferred<String>> {
    val random = Random(3)
    return List(12) { asyncString(random.nextInt(1000)) }
}
```

现在 main 函数等待其中第一个完成，并统计仍处于活跃状态的延迟值数量。请注意，我们在这里利用了 `select` 表达式是一个 Kotlin DSL 的事实，因此我们可以使用任意代码为其提供子句。在本例中，我们遍历延迟值列表，为每个延迟值提供 `onAwait` 子句。

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.selects.*
import java.util.*
    
fun CoroutineScope.asyncString(time: Int) = async {
    delay(time.toLong())
    "Waited for $time ms"
}

fun CoroutineScope.asyncStringsList(): List<Deferred<String>> {
    val random = Random(3)
    return List(12) { asyncString(random.nextInt(1000)) }
}

fun main() = runBlocking<Unit> {
//sampleStart
    val list = asyncStringsList()
    val result = select<String> {
        list.withIndex().forEach { (index, deferred) ->
            deferred.onAwait { answer ->
                "Deferred $index produced answer '$answer'"
            }
        }
    }
    println(result)
    val countActive = list.count { it.isActive }
    println("$countActive coroutines are still active")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-select-04.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-select-04.kt)获取完整代码。
>
{style="note"}

输出为：

```text
Deferred 4 produced answer 'Waited for 128 ms'
11 coroutines are still active
```

<!--- TEST -->

## 在延迟值通道上切换 {id="switch-over-a-channel-of-deferred-values"}

让我们编写一个通道生产者函数，它消费一个延迟字符串值通道，等待接收到的每个延迟值，但仅持续到下一个延迟值到来或通道关闭为止。这个示例将 [onReceiveCatching][ReceiveChannel.onReceiveCatching] 和 [onAwait][Deferred.onAwait] 子句放在同一个 `select` 中：

```kotlin
fun CoroutineScope.switchMapDeferreds(input: ReceiveChannel<Deferred<String>>) = produce<String> {
    var current = input.receive() // 从第一个接收到的延迟值开始
    while (isActive) { // 只要未被取消/关闭就循环
        val next = select<Deferred<String>?> { // 从此 select 返回下一个延迟值或 null
            input.onReceiveCatching { update ->
                update.getOrNull()
            }
            current.onAwait { value ->
                send(value) // 发送当前延迟值产生的值
                input.receiveCatching().getOrNull() // 并从输入通道使用下一个延迟值
            }
        }
        if (next == null) {
            println("Channel was closed")
            break // 跳出循环
        } else {
            current = next
        }
    }
}
```

为了测试它，我们将使用一个简单的异步函数，它在指定时间后解析为指定的字符串：

```kotlin
fun CoroutineScope.asyncString(str: String, time: Long) = async {
    delay(time)
    str
}
```

main 函数只是启动一个协程来打印 `switchMapDeferreds` 的结果，并向其发送一些测试数据：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*
import kotlinx.coroutines.selects.*
    
fun CoroutineScope.switchMapDeferreds(input: ReceiveChannel<Deferred<String>>) = produce<String> {
    var current = input.receive() // 从第一个接收到的延迟值开始
    while (isActive) { // 只要未被取消/关闭就循环
        val next = select<Deferred<String>?> { // 从此 select 返回下一个延迟值或 null
            input.onReceiveCatching { update ->
                update.getOrNull()
            }
            current.onAwait { value ->
                send(value) // 发送当前延迟值产生的值
                input.receiveCatching().getOrNull() // 并从输入通道使用下一个延迟值
            }
        }
        if (next == null) {
            println("Channel was closed")
            break // 跳出循环
        } else {
            current = next
        }
    }
}

fun CoroutineScope.asyncString(str: String, time: Long) = async {
    delay(time)
    str
}

fun main() = runBlocking<Unit> {
//sampleStart
    val chan = Channel<Deferred<String>>() // 测试用的通道
    launch { // 启动打印协程
        for (s in switchMapDeferreds(chan)) 
            println(s) // 打印每个接收到的字符串
    }
    chan.send(asyncString("BEGIN", 100))
    delay(200) // 足够产生 "BEGIN" 的时间
    chan.send(asyncString("Slow", 500))
    delay(100) // 不足以产生 slow 的时间
    chan.send(asyncString("Replace", 100))
    delay(500) // 在最后一个之前给它一些时间
    chan.send(asyncString("END", 500))
    delay(1000) // 给它一些处理时间
    chan.close() // 关闭通道... 
    delay(500) // 并等待一段时间让其结束
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-select-05.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-select-05.kt)获取完整代码。
>
{style="note"}

这段代码的结果：

```text
BEGIN
Replace
END
Channel was closed
```

<!--- TEST -->

<!--- MODULE kotlinx-coroutines-core -->
<!--- INDEX kotlinx.coroutines -->

[Deferred.onAwait]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-deferred/on-await.html

<!--- INDEX kotlinx.coroutines.channels -->

[ReceiveChannel.receive]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-receive-channel/receive.html
[ReceiveChannel.onReceive]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-receive-channel/on-receive.html
[ReceiveChannel.onReceiveCatching]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-receive-channel/on-receive-catching.html
[SendChannel.send]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-send-channel/send.html
[SendChannel.onSend]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-send-channel/on-send.html

<!--- INDEX kotlinx.coroutines.selects -->

[select]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.selects/select.html

<!--- END -->