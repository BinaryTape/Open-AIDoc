<!--- TEST_NAME SelectGuideTest --> 
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: Select 表達式 (實驗性))

Select 表達式使得同時等待多個暫停函式並 _select_（選擇）第一個可用的結果成為可能。

> Select 表達式是 `kotlinx.coroutines` 的一個實驗性功能。它們的 API 預計會在 `kotlinx.coroutines` 程式庫未來的更新中發生變化，且可能包含破壞性變更。
>
{style="note"}

## 從通道中選擇 {id="selecting-from-channels"}

讓我們有兩個字串生產者：`fizz` 與 `buzz`。`fizz` 每 500 ms 產生一個 "Fizz" 字串：

```kotlin
fun CoroutineScope.fizz() = produce<String> {
    while (true) { // 每 500 ms 傳送一次 "Fizz"
        delay(500)
        send("Fizz")
    }
}
```

而 `buzz` 每 1000 ms 產生一個 "Buzz!" 字串：

```kotlin
fun CoroutineScope.buzz() = produce<String> {
    while (true) { // 每 1000 ms 傳送一次 "Buzz!"
        delay(1000)
        send("Buzz!")
    }
}
```

使用 [receive][ReceiveChannel.receive] 暫停函式，我們可以從其中一個通道或另一個通道接收。但 [select] 表達式允許我們使用其 [onReceive][ReceiveChannel.onReceive] 子句同時從 _兩者_ 接收：

```kotlin
suspend fun selectFizzBuzz(fizz: ReceiveChannel<String>, buzz: ReceiveChannel<String>) {
    select<Unit> { // <Unit> 表示此 select 表達式不產生任何結果 
        fizz.onReceive { value ->  // 這是第一個 select 子句
            println("fizz -> '$value'")
        }
        buzz.onReceive { value ->  // 這是第二個 select 子句
            println("buzz -> '$value'")
        }
    }
}
```

讓我們執行它七次：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*
import kotlinx.coroutines.selects.*

fun CoroutineScope.fizz() = produce<String> {
    while (true) { // 每 500 ms 傳送一次 "Fizz"
        delay(500)
        send("Fizz")
    }
}

fun CoroutineScope.buzz() = produce<String> {
    while (true) { // 每 1000 ms 傳送一次 "Buzz!"
        delay(1000)
        send("Buzz!")
    }
}

suspend fun selectFizzBuzz(fizz: ReceiveChannel<String>, buzz: ReceiveChannel<String>) {
    select<Unit> { // <Unit> 表示此 select 表達式不產生任何結果 
        fizz.onReceive { value ->  // 這是第一個 select 子句
            println("fizz -> '$value'")
        }
        buzz.onReceive { value ->  // 這是第二個 select 子句
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
    coroutineContext.cancelChildren() // 取消 fizz 與 buzz 協同程式
//sampleEnd        
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-select-01.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-select-01.kt)獲取完整程式碼。
>
{style="note"}

這段程式碼的結果是： 

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

## 關閉時的選擇 {id="selecting-on-close"}

當通道關閉時，`select` 中的 [onReceive][ReceiveChannel.onReceive] 子句會失敗，導致對應的 `select` 拋出例外。我們可以使用 [onReceiveCatching][ReceiveChannel.onReceiveCatching] 子句在通道關閉時執行特定操作。以下範例還展示了 `select` 是一個表達式，它會回傳其所選子句的結果：

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

讓我們將其與產生四次 "Hello" 字串的通道 `a` 以及產生四次 "World" 的通道 `b` 一起使用：

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
    repeat(8) { // 列印前八個結果
        println(selectAorB(a, b))
    }
    coroutineContext.cancelChildren()  
//sampleEnd      
}    
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-select-02.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-select-02.kt)獲取完整程式碼。
>
{style="note"}

這段程式碼的結果非常有趣，因此我們將更詳細地分析它：

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

從中可以得出幾個觀察結果。

首先，`select` 是 _偏向於 (biased)_ 第一個子句的。當多個子句同時可選時，會選擇其中的第一個。在這裡，兩個通道都在不斷產生字串，因此作為 select 中第一個子句的 `a` 通道獲勝。然而，因為我們使用的是無緩衝通道，`a` 在呼叫 [send][SendChannel.send] 時會不時被暫停，這也給了 `b` 傳送的機會。

第二個觀察結果是，當通道已經關閉時，[onReceiveCatching][ReceiveChannel.onReceiveCatching] 會立即被選中。

## 選擇傳送 {id="selecting-to-send"}

Select 表達式具有 [onSend][SendChannel.onSend] 子句，將其與選擇的偏向性質結合使用會非常有益。

讓我們編寫一個整數生產者的範例，當其主要通道上的消費者跟不上時，它會將值傳送到 `side`（側）通道：

```kotlin
fun CoroutineScope.produceNumbers(side: SendChannel<Int>) = produce<Int> {
    for (num in 1..10) { // 產生從 1 到 10 的 10 個數字
        delay(100) // 每 100 ms
        select<Unit> {
            onSend(num) {} // 傳送到主要通道
            side.onSend(num) {} // 或傳送到側通道     
        }
    }
}
```

消費者的速度將會相當慢，處理每個數字需要 250 ms：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*
import kotlinx.coroutines.selects.*

fun CoroutineScope.produceNumbers(side: SendChannel<Int>) = produce<Int> {
    for (num in 1..10) { // 產生從 1 到 10 的 10 個數字
        delay(100) // 每 100 ms
        select<Unit> {
            onSend(num) {} // 傳送到主要通道
            side.onSend(num) {} // 或傳送到側通道     
        }
    }
}

fun main() = runBlocking<Unit> {
//sampleStart
    val side = Channel<Int>() // 分配側通道
    launch { // 這是一個非常快速的側通道消費者
        side.consumeEach { println("Side channel has $it") }
    }
    produceNumbers(side).consumeEach { 
        println("Consuming $it")
        delay(250) // 讓我們妥善消化消費的數字，不要著急
    }
    println("Done consuming")
    coroutineContext.cancelChildren()  
//sampleEnd      
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-select-03.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-select-03.kt)獲取完整程式碼。
>
{style="note"}
  
讓我們看看發生了什麼：
 
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

## 選擇 Deferred 值 {id="selecting-deferred-values"}

可以使用 [onAwait][Deferred.onAwait] 子句來選擇 Deferred 值。讓我們從一個 async 函式開始，它在隨機延遲後傳回一個 Deferred 字串值：

```kotlin
fun CoroutineScope.asyncString(time: Int) = async {
    delay(time.toLong())
    "Waited for $time ms"
}
```

讓我們以隨機延遲啟動其中的十幾個。

```kotlin
fun CoroutineScope.asyncStringsList(): List<Deferred<String>> {
    val random = Random(3)
    return List(12) { asyncString(random.nextInt(1000)) }
}
```

現在主函式等待其中第一個完成，並計算仍處於活動狀態的 Deferred 值數量。請注意，我們在這裡利用了 `select` 表達式是 Kotlin DSL 的事實，因此我們可以使用任意程式碼為其提供子句。在這種情況下，我們遍歷 Deferred 值列表，為每個 Deferred 值提供 `onAwait` 子句。

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
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-select-04.kt)獲取完整程式碼。
>
{style="note"}

輸出為：

```text
Deferred 4 produced answer 'Waited for 128 ms'
11 coroutines are still active
```

<!--- TEST -->

## 切換 Deferred 值的通道 {id="switch-over-a-channel-of-deferred-values"}

讓我們編寫一個通道生產者函式，它消費一個包含 Deferred 字串值的通道，等待每個接收到的 Deferred 值，但僅持續到下一個 Deferred 值到來或通道關閉為止。此範例將 [onReceiveCatching][ReceiveChannel.onReceiveCatching] 與 [onAwait][Deferred.onAwait] 子句放在同一個 `select` 中：

```kotlin
fun CoroutineScope.switchMapDeferreds(input: ReceiveChannel<Deferred<String>>) = produce<String> {
    var current = input.receive() // 從第一個接收到的 Deferred 值開始
    while (isActive) { // 當未被取消/關閉時循環
        val next = select<Deferred<String>?> { // 從此 select 傳回下一個 Deferred 值或 null
            input.onReceiveCatching { update ->
                update.getOrNull()
            }
            current.onAwait { value ->
                send(value) // 傳送當前 Deferred 產生的值
                input.receiveCatching().getOrNull() // 並使用來自輸入通道的下一個 Deferred
            }
        }
        if (next == null) {
            println("Channel was closed")
            break // 跳出循環
        } else {
            current = next
        }
    }
}
```

為了測試它，我們將使用一個簡單的 async 函式，它在指定時間後解析為指定的字串：

```kotlin
fun CoroutineScope.asyncString(str: String, time: Long) = async {
    delay(time)
    str
}
```

主函式只是啟動一個協同程式來列印 `switchMapDeferreds` 的結果，並向其傳送一些測試資料：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*
import kotlinx.coroutines.selects.*
    
fun CoroutineScope.switchMapDeferreds(input: ReceiveChannel<Deferred<String>>) = produce<String> {
    var current = input.receive() // 從第一個接收到的 Deferred 值開始
    while (isActive) { // 當未被取消/關閉時循環
        val next = select<Deferred<String>?> { // 從此 select 傳回下一個 Deferred 值或 null
            input.onReceiveCatching { update ->
                update.getOrNull()
            }
            current.onAwait { value ->
                send(value) // 傳送當前 Deferred 產生的值
                input.receiveCatching().getOrNull() // 並使用來自輸入通道的下一個 Deferred
            }
        }
        if (next == null) {
            println("Channel was closed")
            break // 跳出循環
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
    val chan = Channel<Deferred<String>>() // 用於測試的通道
    launch { // 啟動列印協同程式
        for (s in switchMapDeferreds(chan)) 
            println(s) // 列印每個接收到的字串
    }
    chan.send(asyncString("BEGIN", 100))
    delay(200) // 足夠時間讓 "BEGIN" 產生
    chan.send(asyncString("Slow", 500))
    delay(100) // 不足以產生 "Slow"
    chan.send(asyncString("Replace", 100))
    delay(500) // 在最後一個之前給它一點時間
    chan.send(asyncString("END", 500))
    delay(1000) // 給它時間處理
    chan.close() // 關閉通道... 
    delay(500) // 並等待一段時間讓它完成
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-select-05.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-select-05.kt)獲取完整程式碼。
>
{style="note"}

這段程式碼的結果：

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