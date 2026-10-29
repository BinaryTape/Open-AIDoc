<!--- TEST_NAME SelectGuideTest --> 
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: Select式（実験的）)

Select式を用いると、複数のサスペンド関数を同時に待機し、最初に利用可能になったものを選択（_select_）することが可能になります。

> Select式は `kotlinx.coroutines` の実験的な機能です。今後の `kotlinx.coroutines` ライブラリのアップデートで、破壊的な変更を伴うAPIの進化が予想されます。
>
{style="note"}

## チャンネルからの選択（Selecting from channels） {id="selecting-from-channels"}

2つの文字列プロデューサー `fizz` と `buzz` があるとしましょう。`fizz` は500ミリ秒ごとに "Fizz" という文字列を生成します：

```kotlin
fun CoroutineScope.fizz() = produce<String> {
    while (true) { // 500ミリ秒ごとに "Fizz" を送信
        delay(500)
        send("Fizz")
    }
}
```

そして `buzz` は1000ミリ秒ごとに "Buzz!" という文字列を生成します：

```kotlin
fun CoroutineScope.buzz() = produce<String> {
    while (true) { // 1000ミリ秒ごとに "Buzz!" を送信
        delay(1000)
        send("Buzz!")
    }
}
```

[receive][ReceiveChannel.receive] サスペンド関数を使用すると、一方のチャンネルかもう一方のチャンネルの*どちらか*から受信できます。しかし、[select] 式を使用すると、[onReceive][ReceiveChannel.onReceive] 節（clause）を用いて両方のチャンネルから同時に受信することができます：

```kotlin
suspend fun selectFizzBuzz(fizz: ReceiveChannel<String>, buzz: ReceiveChannel<String>) {
    select<Unit> { // <Unit> は、この select 式が結果を生成しないことを意味します 
        fizz.onReceive { value ->  // これが1番目の select 節です
            println("fizz -> '$value'")
        }
        buzz.onReceive { value ->  // これが2番目の select 節です
            println("buzz -> '$value'")
        }
    }
}
```

これを7回実行してみましょう：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*
import kotlinx.coroutines.selects.*

fun CoroutineScope.fizz() = produce<String> {
    while (true) { // 500ミリ秒ごとに "Fizz" を送信
        delay(500)
        send("Fizz")
    }
}

fun CoroutineScope.buzz() = produce<String> {
    while (true) { // 1000ミリ秒ごとに "Buzz!" を送信
        delay(1000)
        send("Buzz!")
    }
}

suspend fun selectFizzBuzz(fizz: ReceiveChannel<String>, buzz: ReceiveChannel<String>) {
    select<Unit> { // <Unit> は、この select 式が結果を生成しないことを意味します 
        fizz.onReceive { value ->  // これが1番目の select 節です
            println("fizz -> '$value'")
        }
        buzz.onReceive { value ->  // これが2番目の select 節です
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
    coroutineContext.cancelChildren() // fizz と buzz のコルーチンをキャンセル
//sampleEnd        
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-select-01.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-select-01.kt) から入手できます。
>
{style="note"}

このコードの結果は以下のようになります：

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

## クローズ時の選択（Selecting on close） {id="selecting-on-close"}

チャンネルがクローズされている場合、`select` 内の [onReceive][ReceiveChannel.onReceive] 節は失敗し、対応する `select` は例外をスローします。チャンネルがクローズされたときに特定のアクションを実行するには、[onReceiveCatching][ReceiveChannel.onReceiveCatching] 節を使用できます。次の例は、`select` が選択された節の結果を返す式であることも示しています：

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

これを、"Hello" という文字列を4回生成するチャンネル `a` と、"World" を4回生成するチャンネル `b` で使用してみましょう：

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
    repeat(8) { // 最初の8件の結果を出力
        println(selectAorB(a, b))
    }
    coroutineContext.cancelChildren()  
//sampleEnd      
}    
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-select-02.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-select-02.kt) から入手できます。
>
{style="note"}

このコードの結果は非常に興味深いものです。詳しく分析してみましょう：

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

ここからいくつかの観察ができます。

まず、`select` は最初の節に対して**バイアス**があります（優先されます）。複数の節が同時に選択可能な場合、それらの中で最初のものが選択されます。ここでは、両方のチャンネルが常に文字列を生成しているため、`select` 内の最初の節であるチャンネル `a` が勝ちます。しかし、バッファなしチャンネルを使用しているため、`a` は [send][SendChannel.send] の呼び出しで時々サスペンドされ、`b` にも送信のチャンスが与えられます。

2つ目の観察は、チャンネルが既にクローズされている場合、[onReceiveCatching][ReceiveChannel.onReceiveCatching] が即座に選択されることです。

## 送信の選択（Selecting to send） {id="selecting-to-send"}

Select式には [onSend][SendChannel.onSend] 節があり、これを選択のバイアス特性と組み合わせることで非常に有効に活用できます。

メインチャンネルの消費者が処理に追いつかない場合に、値を `side`（サイド）チャンネルに送信する、整数のプロデューサーの例を書いてみましょう：

```kotlin
fun CoroutineScope.produceNumbers(side: SendChannel<Int>) = produce<Int> {
    for (num in 1..10) { // 1から10までの10個の数値を生成
        delay(100) // 100ミリ秒ごと
        select<Unit> {
            onSend(num) {} // メインチャンネルに送信
            side.onSend(num) {} // またはサイドチャンネルに送信     
        }
    }
}
```

消費者はかなり遅く、各数値の処理に250ミリ秒かかるとします：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*
import kotlinx.coroutines.selects.*

fun CoroutineScope.produceNumbers(side: SendChannel<Int>) = produce<Int> {
    for (num in 1..10) { // 1から10までの10個の数値を生成
        delay(100) // 100ミリ秒ごと
        select<Unit> {
            onSend(num) {} // メインチャンネルに送信
            side.onSend(num) {} // またはサイドチャンネルに送信     
        }
    }
}

fun main() = runBlocking<Unit> {
//sampleStart
    val side = Channel<Int>() // サイドチャンネルを割り当て
    launch { // これはサイドチャンネルのための非常に高速な消費者です
        side.consumeEach { println("Side channel has $it") }
    }
    produceNumbers(side).consumeEach { 
        println("Consuming $it")
        delay(250) // 消費した数値を適切に消化しましょう、急がないで
    }
    println("Done consuming")
    coroutineContext.cancelChildren()  
//sampleEnd      
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-select-03.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-select-03.kt) から入手できます。
>
{style="note"}
  
では、何が起こるか見てみましょう：
 
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

## Deferred値の選択（Selecting deferred values） {id="selecting-deferred-values"}

Deferred（遅延）値は、[onAwait][Deferred.onAwait] 節を使用して選択できます。
ランダムな遅延の後に deferred な文字列値を返す非同期関数から始めましょう：

```kotlin
fun CoroutineScope.asyncString(time: Int) = async {
    delay(time.toLong())
    "Waited for $time ms"
}
```

これらをランダムな遅延で1ダース（12個）開始してみます。

```kotlin
fun CoroutineScope.asyncStringsList(): List<Deferred<String>> {
    val random = Random(3)
    return List(12) { asyncString(random.nextInt(1000)) }
}
```

さて、メイン関数はそれらのうち最初のものが完了するのを待機し、まだアクティブな deferred 値の数をカウントします。ここで、`select` 式が Kotlin DSL であるという事実を利用していることに注目してください。そのため、任意のコードを使用して節を提供できます。このケースでは、deferred 値のリストを反復処理して、各 deferred 値に対して `onAwait` 節を提供しています。

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
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-select-04.kt) から入手できます。
>
{style="note"}

出力は以下のようになります：

```text
Deferred 4 produced answer 'Waited for 128 ms'
11 coroutines are still active
```

<!--- TEST -->

## Deferred値のチャンネルを切り替える（Switch over a channel of deferred values） {id="switch-over-a-channel-of-deferred-values"}

Deferred な文字列値のチャンネルを消費し、受信した各 deferred 値を待機するチャンネルプロデューサー関数を書いてみましょう。ただし、次の deferred 値が送られてくるか、チャンネルがクローズされるまでしか待機しません。この例では、同じ `select` 内で [onReceiveCatching][ReceiveChannel.onReceiveCatching] と [onAwait][Deferred.onAwait] 節を組み合わせています：

```kotlin
fun CoroutineScope.switchMapDeferreds(input: ReceiveChannel<Deferred<String>>) = produce<String> {
    var current = input.receive() // 最初に受信した deferred 値から開始
    while (isActive) { // キャンセル/クローズされるまでループ
        val next = select<Deferred<String>?> { // この select から次の deferred 値または null を返す
            input.onReceiveCatching { update ->
                update.getOrNull()
            }
            current.onAwait { value ->
                send(value) // 現在の deferred が生成した値を送信
                input.receiveCatching().getOrNull() // そして入力チャンネルから次の deferred を取得
            }
        }
        if (next == null) {
            println("Channel was closed")
            break // ループを抜ける
        } else {
            current = next
        }
    }
}
```

これをテストするために、指定された時間の後に指定された文字列を解決する単純な非同期関数を使用します：

```kotlin
fun CoroutineScope.asyncString(str: String, time: Long) = async {
    delay(time)
    str
}
```

メイン関数は単に `switchMapDeferreds` の結果を出力するためのコルーチンを起動し、そこにいくつかのテストデータを送信します：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*
import kotlinx.coroutines.selects.*
    
fun CoroutineScope.switchMapDeferreds(input: ReceiveChannel<Deferred<String>>) = produce<String> {
    var current = input.receive() // 最初に受信した deferred 値から開始
    while (isActive) { // キャンセル/クローズされるまでループ
        val next = select<Deferred<String>?> { // この select から次の deferred 値または null を返す
            input.onReceiveCatching { update ->
                update.getOrNull()
            }
            current.onAwait { value ->
                send(value) // 現在の deferred が生成した値を送信
                input.receiveCatching().getOrNull() // そして入力チャンネルから次の deferred を取得
            }
        }
        if (next == null) {
            println("Channel was closed")
            break // ループを抜ける
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
    val chan = Channel<Deferred<String>>() // テスト用チャンネル
    launch { // 出力用コルーチンを起動
        for (s in switchMapDeferreds(chan)) 
            println(s) // 受信した各文字列を出力
    }
    chan.send(asyncString("BEGIN", 100))
    delay(200) // "BEGIN" が生成されるのに十分な時間
    chan.send(asyncString("Slow", 500))
    delay(100) // slow が生成されるには不十分な時間
    chan.send(asyncString("Replace", 100))
    delay(500) // 最後の一つを送る前に時間を与える
    chan.send(asyncString("END", 500))
    delay(1000) // 処理のための時間を与える
    chan.close() // チャンネルをクローズ... 
    delay(500) // そして終了まで少し待機
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-select-05.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-select-05.kt) から入手できます。
>
{style="note"}

このコードの結果：

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