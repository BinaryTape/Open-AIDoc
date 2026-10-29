<!--- TEST_NAME ChannelsGuideTest -->
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: Channel)

`Deferred` 值提供了在協同程式之間傳輸單個值的便利方式。Channel 則提供了傳輸值流（stream of values）的方式。

## Channel 基礎 {id="channel-basics"}

[Channel] 在概念上非常類似於 `BlockingQueue`。一個關鍵的區別是，它具有暫停式的 [send][SendChannel.send] 操作來代替阻塞式的 `put`，以及具有暫停式的 [receive][ReceiveChannel.receive] 操作來代替阻塞式的 `take`。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking {
//sampleStart
    val channel = Channel<Int>()
    launch {
        // 這可能是耗費 CPU 的大量運算或非同步邏輯，
        // 我們在此僅傳送 5 個平方值
        for (x in 1..5) channel.send(x * x)
    }
    // 在這裡我們列印接收到的 5 個整數：
    repeat(5) { println(channel.receive()) }
    println("Done!")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-01.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-01.kt)取得完整程式碼。
>
{style="note"}

這段程式碼的輸出為：

```text
1
4
9
16
25
Done!
```

<!--- TEST -->

## 關閉與迭代 Channel {id="closing-and-iteration-over-channels"}

與隊列（queue）不同，Channel 可以被關閉，以表示不再有元素進入。在接收端，使用一般的 `for` 迴圈從 Channel 中接收元素非常方便。
 
從概念上講，[close][SendChannel.close] 就像向 Channel 傳送了一個特殊的關閉標記。一旦接收到這個關閉標記，迭代就會停止，因此可以保證在關閉之前傳送的所有元素都能被接收到：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking {
//sampleStart
    val channel = Channel<Int>()
    launch {
        for (x in 1..5) channel.send(x * x)
        channel.close() // 我們傳送完了
    }
    // 在這裡我們使用 `for` 迴圈列印接收到的值（直到 Channel 關閉）
    for (y in channel) println(y)
    println("Done!")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-02.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-02.kt)取得完整程式碼。
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

## 建置 Channel 生產者 {id="building-channel-producers"}

協同程式產生元素序列的模式相當常見。這是並行（concurrent）程式碼中經常出現的「生產者-消費者（producer-consumer）」模式的一部分。您可以將這樣的生產者抽象化為一個將 Channel 作為參數的函式，但這與「結果應從函式回傳」的常識相悖。

有一個名為 [produce] 的便利協同程式建置器，可以輕鬆地在生產端正確完成這項工作，還有一個擴充函式 [consumeEach]，它在消費端取代了 `for` 迴圈：

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
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-03.kt)取得完整程式碼。
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

## 管線 (Pipelines) {id="pipelines"}

管線（pipeline）是一種模式，其中一個協同程式正在產生（可能是無限的）值流：

```kotlin
fun CoroutineScope.produceNumbers() = produce<Int> {
    var x = 1
    while (true) send(x++) // 從 1 開始的無限整數流
}
```

而另一個或多個協同程式則消費該流，進行一些處理，並產生其他結果。在下面的範例中，數字僅被平方處理：

```kotlin
fun CoroutineScope.square(numbers: ReceiveChannel<Int>): ReceiveChannel<Int> = produce {
    for (x in numbers) send(x * x)
}
```

主程式碼啟動並連接整條管線：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking {
//sampleStart
    val numbers = produceNumbers() // 從 1 開始產生整數
    val squares = square(numbers) // 對整數求平方
    repeat(5) {
        println(squares.receive()) // 列印前五個
    }
    println("Done!") // 我們完成了
    coroutineContext.cancelChildren() // 取消子協同程式
//sampleEnd
}

fun CoroutineScope.produceNumbers() = produce<Int> {
    var x = 1
    while (true) send(x++) // 從 1 開始的無限整數流
}

fun CoroutineScope.square(numbers: ReceiveChannel<Int>): ReceiveChannel<Int> = produce {
    for (x in numbers) send(x * x)
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-04.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-04.kt)取得完整程式碼。
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

> 所有建立協同程式的函式都被定義為 [CoroutineScope] 的擴充，以便我們可以依靠[結構化並行](composing-suspending-functions.md#structured-concurrency-with-async)來確保應用程式中不會有殘留的全域協同程式。
>
{style="note"}

## 使用管線產生質數 {id="prime-numbers-with-pipeline"}

讓我們以一個使用協同程式管線產生質數的範例，將管線發揮到極致。我們從一個無限的數字序列開始。

```kotlin
fun CoroutineScope.numbersFrom(start: Int) = produce<Int> {
    var x = start
    while (true) send(x++) // 從 start 開始的無限整數流
}
```

接下來的管線階段會過濾傳入的數字流，移除所有能被給定質數整除的數字：

```kotlin
fun CoroutineScope.filter(numbers: ReceiveChannel<Int>, prime: Int) = produce<Int> {
    for (x in numbers) if (x % prime != 0) send(x)
}
```

現在，我們透過從 2 開始一個數字流，從當前 Channel 獲取一個質數，並為找到的每個質數啟動新的管線階段，來構建我們的管線：
 
```
numbersFrom(2) -> filter(2) -> filter(3) -> filter(5) -> filter(7) ... 
```
 
以下範例在主執行緒的上下文中執行整個管線，並列印前十個質數。由於所有的協同程式都在主 [runBlocking] 協同程式的作用域中啟動，我們不必顯式維護所有已啟動協同程式的清單。我們使用 [cancelChildren][kotlin.coroutines.CoroutineContext.cancelChildren] 擴充函式在列印完前十個質數後取消所有子協同程式。

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
    coroutineContext.cancelChildren() // 取消所有子項以讓 main 結束
//sampleEnd    
}

fun CoroutineScope.numbersFrom(start: Int) = produce<Int> {
    var x = start
    while (true) send(x++) // 從 start 開始的無限整數流
}

fun CoroutineScope.filter(numbers: ReceiveChannel<Int>, prime: Int) = produce<Int> {
    for (x in numbers) if (x % prime != 0) send(x)
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-05.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-05.kt)取得完整程式碼。
>
{style="note"}

這段程式碼的輸出為：

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

請注意，您可以使用標準庫中的 [`iterator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/iterator.html) 協同程式建置器來建置相同的管線。將 `produce` 替換為 `iterator`，`send` 替換為 `yield`，`receive` 替換為 `next`，`ReceiveChannel` 替換為 `Iterator`，並去掉協同程式作用域。您也不再需要 `runBlocking`。然而，如上所示使用 Channel 的管線好處是，如果您在 [Dispatchers.Default] 上下文中執行它，它實際上可以使用多個 CPU 核心。

無論如何，這是一種極其不切實際的尋找質數的方法。在實踐中，管線確實涉及其他一些暫停呼叫（如對遠端服務的非同步呼叫），而這些管線無法使用 `sequence`/`iterator` 建置，因為它們不允許任意暫停，而不像 `produce` 是完全非同步的。
 
## 扇出 (Fan-out) {id="fan-out"}

多個協同程式可以從同一個 Channel 接收資料，從而在它們之間分配工作。讓我們從一個定期產生整數的生產者協同程式開始（每秒十個數字）：

```kotlin
fun CoroutineScope.produceNumbers() = produce<Int> {
    var x = 1 // 從 1 開始
    while (true) {
        send(x++) // 產生下一個
        delay(100) // 等待 0.1 s
    }
}
```

接著我們可以有多個處理器協同程式。在這個範例中，它們僅列印自己的 ID 和接收到的數字：

```kotlin
fun CoroutineScope.launchProcessor(id: Int, channel: ReceiveChannel<Int>) = launch {
    for (msg in channel) {
        println("Processor #$id received $msg")
    }    
}
```

現在讓我們啟動五個處理器，並讓它們運作將近一秒。看看會發生什麼：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking<Unit> {
//sampleStart
    val producer = produceNumbers()
    repeat(5) { launchProcessor(it, producer) }
    delay(950)
    producer.cancel() // 取消生產者協同程式並因此終止它們全部
//sampleEnd
}

fun CoroutineScope.produceNumbers() = produce<Int> {
    var x = 1 // 從 1 開始
    while (true) {
        send(x++) // 產生下一個
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
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-06.kt)取得完整程式碼。
>
{style="note"}

輸出將類似於以下內容，儘管接收每個特定整數的處理器 ID 可能會有所不同：

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

請注意，取消生產者協同程式會關閉其 Channel，從而最終終止處理器協同程式正在對 Channel 進行的迭代。

此外，請注意我們如何在 `launchProcessor` 程式碼中使用 `for` 迴圈顯式迭代 Channel 以執行扇出。與 `consumeEach` 不同，這種 `for` 迴圈模式在多個協同程式中使用是完全安全的。如果其中一個處理器協同程式失敗，其他處理器仍會處理該 Channel，而透過 `consumeEach` 編寫的處理器在正常或異常完成時總是會消費（取消）底層 Channel。

## 扇入 (Fan-in) {id="fan-in"}

多個協同程式可以向同一個 Channel 傳送資料。例如，讓我們有一個字串 Channel，以及一個暫停函式，該函式以指定的延遲重複向此 Channel 傳送指定的字串：

```kotlin
suspend fun sendString(channel: SendChannel<String>, s: String, time: Long) {
    while (true) {
        delay(time)
        channel.send(s)
    }
}
```

現在，讓我們看看如果我們啟動幾個傳送字串的協同程式會發生什麼（在這個範例中，我們在主執行緒的上下文中啟動它們，作為主協同程式的子項）：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking {
//sampleStart
    val channel = Channel<String>()
    launch { sendString(channel, "foo", 200L) }
    launch { sendString(channel, "BAR!", 500L) }
    repeat(6) { // 接收前六個
        println(channel.receive())
    }
    coroutineContext.cancelChildren() // 取消所有子項以讓 main 結束
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
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-07.kt)取得完整程式碼。
>
{style="note"}

輸出為：

```text
foo
foo
BAR!
foo
foo
BAR!
```

<!--- TEST -->

## 具緩衝區的 Channel {id="buffered-channels"}

目前為止展示的 Channel 都沒有緩衝區。無緩衝的 Channel 在傳送者與接收者會合（rendezvous）時傳輸元素。如果先呼叫了傳送，則它會被暫停直到呼叫接收；如果先呼叫了接收，它會被暫停直到呼叫傳送。

[Channel()] 工廠函式和 [produce] 建置器都接受一個可選的 `capacity` 參數來指定「緩衝區大小」。緩衝區允許傳送者在暫停之前傳送多個元素，類似於指定容量的 `BlockingQueue`，後者會在緩衝區滿時阻塞。

看看以下程式碼的行為：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking<Unit> {
//sampleStart
    val channel = Channel<Int>(4) // 建立具緩衝區的 Channel
    val sender = launch { // 啟動傳送者協同程式
        repeat(10) {
            println("Sending $it") // 在傳送每個元素前列印
            channel.send(it) // 當緩衝區滿時將會暫停
        }
    }
    // 不接收任何東西……只是等待……
    delay(1000)
    sender.cancel() // 取消傳送者協同程式
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-08.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-08.kt)取得完整程式碼。
>
{style="note"}

使用容量為 4 的具緩衝區 Channel，它會列印「Sending」五次：

```text
Sending 0
Sending 1
Sending 2
Sending 3
Sending 4
```

<!--- TEST -->

前四個元素被加入緩衝區，傳送者在嘗試傳送第五個元素時暫停。

## Channel 是公平的 {id="channels-are-fair"}

對於從多個協同程式呼叫的順序，Channel 的傳送和接收操作是「公平」的。它們按照先進先出的順序提供服務，例如，第一個呼叫 `receive` 的協同程式會獲得元素。在以下範例中，兩個協同程式「ping」和「pong」正從共享的「table」Channel 接收「ball」物件。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

//sampleStart
data class Ball(var hits: Int)

fun main() = runBlocking {
    val table = Channel<Ball>() // 共享桌子
    launch { player("ping", table) }
    launch { player("pong", table) }
    table.send(Ball(0)) // 發球
    delay(1000) // 延遲 1 秒
    coroutineContext.cancelChildren() // 遊戲結束，取消它們
}

suspend fun player(name: String, table: Channel<Ball>) {
    for (ball in table) { // 在迴圈中接收球
        ball.hits++
        println("$name $ball")
        delay(300) // 等待一下
        table.send(ball) // 把球傳回去
    }
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-09.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-09.kt)取得完整程式碼。
>
{style="note"}

「ping」協同程式先啟動，因此它是第一個接收球的。儘管「ping」協同程式在將球傳回桌子後立即再次開始接收球，但球還是被「pong」協同程式接收了，因為它已經在等待了：

```text
ping Ball(hits=1)
pong Ball(hits=2)
ping Ball(hits=3)
pong Ball(hits=4)
```

<!--- TEST -->

請注意，有時由於所使用的執行器性質，Channel 可能會產生看起來不公平的執行。詳情請參閱[此問題](https://github.com/Kotlin/kotlinx.coroutines/issues/111)。

## Ticker Channel {id="ticker-channels"}

Ticker Channel 是一種特殊的會合 Channel，每當自上次消費以來經過給定的延遲時，它就會產生一個 `Unit`。雖然它單獨看起來可能沒什麼用，但它是一個有用的建構區塊，可以用來建立複雜的、基於時間的 [produce] 管線，以及執行視窗化和其他與時間相關處理的運算子。Ticker Channel 可以用在 [select] 中來執行「每跳動一次（on tick）」的操作。

要建立此類 Channel，請使用工廠方法 [ticker]。為了指示不再需要進一步的元素，請對其使用 [ReceiveChannel.cancel] 方法。

現在讓我們看看它在實踐中是如何運作的：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

//sampleStart
fun main() = runBlocking<Unit> {
    val tickerChannel = ticker(delayMillis = 200, initialDelayMillis = 0) // 建立一個 ticker channel
    var nextElement = withTimeoutOrNull(1) { tickerChannel.receive() }
    println("Initial element is available immediately: $nextElement") // 無初始延遲

    nextElement = withTimeoutOrNull(100) { tickerChannel.receive() } // 所有後續元素都有 200 ms 延遲
    println("Next element is not ready in 100 ms: $nextElement")

    nextElement = withTimeoutOrNull(120) { tickerChannel.receive() }
    println("Next element is ready in 200 ms: $nextElement")

    // 模擬較大的消費延遲
    println("Consumer pauses for 300ms")
    delay(300)
    // 下一個元素立即準備就緒
    nextElement = withTimeoutOrNull(1) { tickerChannel.receive() }
    println("Next element is available immediately after large consumer delay: $nextElement")
    // 請注意，`receive` 呼叫之間的暫停會被考慮在內，下一個元素的到達速度會更快
    nextElement = withTimeoutOrNull(120) { tickerChannel.receive() }
    println("Next element is ready in 100ms after consumer pause in 300ms: $nextElement")

    tickerChannel.cancel() // 指示不再需要元素
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-10.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-10.kt)取得完整程式碼。
>
{style="note"}

它會列印以下內容：

```text
Initial element is available immediately: kotlin.Unit
Next element is not ready in 100 ms: null
Next element is ready in 200 ms: kotlin.Unit
Consumer pauses for 300ms
Next element is available immediately after large consumer delay: kotlin.Unit
Next element is ready in 100ms after consumer pause in 300ms: kotlin.Unit
```

<!--- TEST -->

請注意，[ticker] 會察覺到可能的消費者暫停，並且預設情況下，如果發生暫停，它會調整下一個產生的元素延遲，試圖維持固定的元素產生速率。
 
可選地，可以指定 `mode` 參數等於 [TickerMode.FIXED_DELAY]，以維持元素之間固定的延遲。

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