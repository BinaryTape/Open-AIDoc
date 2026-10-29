<!--- TEST_NAME ChannelsGuideTest -->
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: チャネル)

Deferred（遅延）値は、コルーチン間で単一の値を転送するための便利な方法を提供します。
チャネル（Channels）は、値のストリームを転送する方法を提供します。

## チャネルの基本 {id="channel-basics"}

[Channel] は概念的には `BlockingQueue` と非常によく似ています。一つの大きな違いは、ブロックする `put` 操作の代わりに中断する [send][SendChannel.send] があり、ブロックする `take` 操作の代わりに中断する [receive][ReceiveChannel.receive] があることです。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking {
//sampleStart
    val channel = Channel<Int>()
    launch {
        // ここではCPU負荷の高い計算や非同期ロジックが実行される可能性がありますが、
        // 今回は単に5つの平方数を送信します。
        for (x in 1..5) channel.send(x * x)
    }
    // ここで受信した5つの整数を出力します：
    repeat(5) { println(channel.receive()) }
    println("Done!")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-01.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-01.kt) から入手できます。
>
{style="note"}

このコードの出力は次の通りです：

```text
1
4
9
16
25
Done!
```

<!--- TEST -->

## チャネルのクローズと反復処理 {id="closing-and-iteration-over-channels"}

キューとは異なり、チャネルは閉じることができます。これは、これ以上要素が送られてこないことを示すためです。
受信側では、チャネルから要素を受け取るために通常の `for` ループを使用すると便利です。

概念的には、[close][SendChannel.close] は特別な「クローズトークン」をチャネルに送信するようなものです。
このクローズトークンを受信するとすぐに反復（iteration）が停止するため、クローズ前に送信されたすべての要素が受信されることが保証されます。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking {
//sampleStart
    val channel = Channel<Int>()
    launch {
        for (x in 1..5) channel.send(x * x)
        channel.close() // 送信が完了したことを知らせる
    }
    // ここでは `for` ループを使用して受信した値を出力します（チャネルが閉じられるまで）
    for (y in channel) println(y)
    println("Done!")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-02.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-02.kt) から入手できます。
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

## チャネルプロデューサーの構築 {id="building-channel-producers"}

コルーチンが一連の要素を生成するパターンは非常に一般的です。
これは、並行処理コードでよく見られる「プロデューサー・コンシューマー（producer-consumer）」パターンの一部です。
このようなプロデューサーを、チャネルをパラメータとして受け取る関数に抽象化することもできますが、これは「結果は関数から返されるべきである」という常識に反します。

プロデューサー側でこれを正しく行うための便利なコルーチンビルダー [produce] と、コンシューマー側の `for` ループを置き換える拡張関数 [consumeEach] があります。

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
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-03.kt) から入手できます。
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

## パイプライン {id="pipelines"}

パイプラインは、一つのコルーチンが値の（場合によっては無限の）ストリームを生成するパターンです：

```kotlin
fun CoroutineScope.produceNumbers() = produce<Int> {
    var x = 1
    while (true) send(x++) // 1から始まる無限の整数ストリーム
}
```

そして、別のコルーチン（または複数のコルーチン）がそのストリームを消費し、何らかの処理を行い、別の結果を生成します。
以下の例では、数値は単に2乗されます：

```kotlin
fun CoroutineScope.square(numbers: ReceiveChannel<Int>): ReceiveChannel<Int> = produce {
    for (x in numbers) send(x * x)
}
```

メインのコードでパイプライン全体を起動し、接続します：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking {
//sampleStart
    val numbers = produceNumbers() // 1からの整数を生成
    val squares = square(numbers) // 整数を2乗する
    repeat(5) {
        println(squares.receive()) // 最初の5つを出力
    }
    println("Done!") // 完了
    coroutineContext.cancelChildren() // 子コルーチンをキャンセル
//sampleEnd
}

fun CoroutineScope.produceNumbers() = produce<Int> {
    var x = 1
    while (true) send(x++) // 1から始まる無限の整数ストリーム
}

fun CoroutineScope.square(numbers: ReceiveChannel<Int>): ReceiveChannel<Int> = produce {
    for (x in numbers) send(x * x)
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-04.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-04.kt) から入手できます。
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

> コルーチンを作成するすべての関数は [CoroutineScope] の拡張として定義されているため、[構造化された並行性 (structured concurrency)](composing-suspending-functions.md#structured-concurrency-with-async) を利用して、アプリケーション内にグローバルなコルーチンが残らないようにすることができます。
>
{style="note"}

## パイプラインで素数を求める {id="prime-numbers-with-pipeline"}

コルーチンのパイプラインを使用して素数を生成する例で、パイプラインを極限まで活用してみましょう。
まずは無限の数列から始めます。

```kotlin
fun CoroutineScope.numbersFrom(start: Int) = produce<Int> {
    var x = start
    while (true) send(x++) // startから始まる無限の整数ストリーム
}
```

次のパイプラインステージでは、送られてくる数値のストリームをフィルタリングし、指定された素数で割り切れるすべての数値を取り除きます：

```kotlin
fun CoroutineScope.filter(numbers: ReceiveChannel<Int>, prime: Int) = produce<Int> {
    for (x in numbers) if (x % prime != 0) send(x)
}
```

これで、2から始まる数値のストリームを開始し、現在のチャネルから素数を取り出し、見つかった素数ごとに新しいパイプラインステージを起動することで、パイプラインを構築します：
 
```
numbersFrom(2) -> filter(2) -> filter(3) -> filter(5) -> filter(7) ... 
```
 
以下の例は、メインスレッドのコンテキストでパイプライン全体を実行し、最初の10個の素数を出力します。
すべてのコルーチンはメインの [runBlocking] コルーチンのスコープで起動されるため、開始したすべてのコルーチンの明示的なリストを保持する必要はありません。
最初の10個の素数を出力した後、[cancelChildren][kotlin.coroutines.CoroutineContext.cancelChildren] 拡張関数を使用してすべての子コルーチンをキャンセルします。

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
    coroutineContext.cancelChildren() // メインを終了させるためにすべての子をキャンセル
//sampleEnd    
}

fun CoroutineScope.numbersFrom(start: Int) = produce<Int> {
    var x = start
    while (true) send(x++) // startから始まる無限の整数ストリーム
}

fun CoroutineScope.filter(numbers: ReceiveChannel<Int>, prime: Int) = produce<Int> {
    for (x in numbers) if (x % prime != 0) send(x)
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-05.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-05.kt) から入手できます。
>
{style="note"}

このコードの出力は次の通りです：

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

標準ライブラリの [`iterator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/iterator.html) コルーチンビルダーを使用しても、同じパイプラインを構築できることに注意してください。
`produce` を `iterator` に、`send` を `yield` に、`receive` を `next` に、`ReceiveChannel` を `Iterator` に置き換え、コルーチンスコープを取り除きます。`runBlocking` も不要になります。
しかし、上記のようにチャネルを使用するパイプラインの利点は、[Dispatchers.Default] コンテキストで実行すれば実際に複数のCPUコアを使用できることです。

いずれにせよ、これは素数を見つける方法としては極めて非効率的です。実際には、パイプラインには他の中断の呼び出し（リモートサービスへの非同期呼び出しなど）が含まれます。
これらのパイプラインは、`produce` とは異なり、任意の中断を許可しない `sequence`/`iterator` を使用して構築することはできません。
 
## ファンアウト (Fan-out) {id="fan-out"}

複数のコルーチンが同じチャネルから受信し、作業を自分たちの間で分散させることができます。
まずは、定期的に整数を生成するプロデューサーコルーチン（1秒間に10個の数値）から始めましょう。

```kotlin
fun CoroutineScope.produceNumbers() = produce<Int> {
    var x = 1 // 1から開始
    while (true) {
        send(x++) // 次を生成
        delay(100) // 0.1秒待機
    }
}
```

次に、複数のプロセッサーコルーチンを用意します。この例では、自身のIDと受信した数値を単に出力します。

```kotlin
fun CoroutineScope.launchProcessor(id: Int, channel: ReceiveChannel<Int>) = launch {
    for (msg in channel) {
        println("Processor #$id received $msg")
    }    
}
```

では、5つのプロセッサーを起動し、約1秒間動作させてみましょう。何が起こるか確認してください。

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking<Unit> {
//sampleStart
    val producer = produceNumbers()
    repeat(5) { launchProcessor(it, producer) }
    delay(950)
    producer.cancel() // プロデューサーコルーチンをキャンセルし、すべてを終了させる
//sampleEnd
}

fun CoroutineScope.produceNumbers() = produce<Int> {
    var x = 1 // 1から開始
    while (true) {
        send(x++) // 次を生成
        delay(100) // 0.1秒待機
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
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-06.kt) から入手できます。
>
{style="note"}

出力は以下のようになります。ただし、特定の整数を受信するプロセッサーIDは異なる可能性があります。

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

プロデューサーコルーチンをキャンセルするとそのチャネルが閉じられるため、最終的にプロセッサーコルーチンが行っているチャネルの反復処理が終了することに注意してください。

また、`launchProcessor` のコードで、ファンアウトを実行するために `for` ループを使って明示的にチャネルを反復処理していることにも注目してください。
`consumeEach` とは異なり、この `for` ループのパターンは複数のコルーチンから使用しても完全に安全です。
もしプロセッサーコルーチンの1つが失敗しても、他のコルーチンは引き続きチャネルを処理し続けますが、`consumeEach` で書かれたプロセッサーは、正常終了か異常終了かにかかわらず、常に背後のチャネルを消費（キャンセル）してしまいます。

## ファンイン (Fan-in) {id="fan-in"}

複数のコルーチンが同じチャネルに送信することもできます。
例えば、文字列のチャネルがあり、指定された文字列を指定された遅延で繰り返しチャネルに送信する中断関数があるとします。

```kotlin
suspend fun sendString(channel: SendChannel<String>, s: String, time: Long) {
    while (true) {
        delay(time)
        channel.send(s)
    }
}
```

では、文字列を送信するコルーチンをいくつか起動すると何が起こるか見てみましょう（この例では、メインコルーチンの子としてメインスレッドのコンテキストで起動します）。

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking {
//sampleStart
    val channel = Channel<String>()
    launch { sendString(channel, "foo", 200L) }
    launch { sendString(channel, "BAR!", 500L) }
    repeat(6) { // 最初の6つを受信
        println(channel.receive())
    }
    coroutineContext.cancelChildren() // メインを終了させるためにすべての子をキャンセル
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
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-07.kt) から入手できます。
>
{style="note"}

出力は次の通りです：

```text
foo
foo
BAR!
foo
foo
BAR!
```

<!--- TEST -->

## バッファ付きチャネル {id="buffered-channels"}

これまでに紹介したチャネルにはバッファがありませんでした。
バッファなしのチャネルは、送信者と受信者が出会ったとき（ランデブー: rendezvous とも呼ばれます）に要素を転送します。
先に `send` が呼び出されると、`receive` が呼び出されるまで中断されます。逆に先に `receive` が呼び出されると、`send` が呼び出されるまで中断されます。

[Channel()] ファクトリ関数と [produce] ビルダーは、*バッファサイズ*を指定するためのオプションの `capacity` パラメータを受け取ります。
バッファを使用すると、送信者は中断する前に複数の要素を送信できます。これは、指定された容量を持つ `BlockingQueue` がバッファが満杯のときにブロックするのと同様です。

以下のコードの挙動を確認してください：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking<Unit> {
//sampleStart
    val channel = Channel<Int>(4) // バッファ付きチャネルを作成
    val sender = launch { // 送信者コルーチンを起動
        repeat(10) {
            println("Sending $it") // 各要素を送信する前に出力
            channel.send(it) // バッファが満杯になると中断する
        }
    }
    // 何も受信せず... ただ待つ....
    delay(1000)
    sender.cancel() // 送信者コルーチンをキャンセル
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-08.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-08.kt) から入手できます。
>
{style="note"}

容量が *4* のバッファ付きチャネルを使用して、"Sending" を *5回* 出力します：

```text
Sending 0
Sending 1
Sending 2
Sending 3
Sending 4
```

<!--- TEST -->

最初の4つの要素はバッファに追加され、5つ目を送信しようとしたときに送信者が中断されます。

## チャネルは公平である {id="channels-are-fair"}

チャネルへの送信および受信操作は、複数のコルーチンからの呼び出し順序に関して「公平（fair）」です。
これらは先入れ先出し（FIFO）の順序で処理されます。例えば、最初に `receive` を呼び出したコルーチンが要素を取得します。
以下の例では、2つのコルーチン "ping" と "pong" が、共有された "table" チャネルから "ball" オブジェクトを受信しています。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

//sampleStart
data class Ball(var hits: Int)

fun main() = runBlocking {
    val table = Channel<Ball>() // 共有テーブル
    launch { player("ping", table) }
    launch { player("pong", table) }
    table.send(Ball(0)) // ボールを出す（サーブ）
    delay(1000) // 1秒待機
    coroutineContext.cancelChildren() // ゲーム終了、キャンセルする
}

suspend fun player(name: String, table: Channel<Ball>) {
    for (ball in table) { // ループでボールを受信
        ball.hits++
        println("$name $ball")
        delay(300) // 少し待つ
        table.send(ball) // ボールを打ち返す
    }
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-09.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-09.kt) から入手できます。
>
{style="note"}

"ping" コルーチンが最初に開始されるため、最初にボールを受け取るのは "ping" です。
"ping" コルーチンは、テーブルにボールを打ち返した後すぐに再びボールを受け取ろうとしますが、ボールは "pong" コルーチンによって受け取られます。なぜなら、"pong" はすでにそれを待っていたからです。

```text
ping Ball(hits=1)
pong Ball(hits=2)
ping Ball(hits=3)
pong Ball(hits=4)
```

<!--- TEST -->

使用しているエクゼキューター（executor）の性質により、チャネルが公平でないように見える実行結果になることが稀にあることに注意してください。詳細は [こちらのイシュー](https://github.com/Kotlin/kotlinx.coroutines/issues/111) を参照してください。

## ティッカーチャネル (Ticker channels) {id="ticker-channels"}

ティッカーチャネル（Ticker channel）は、チャネルから最後に消費されてから指定された遅延時間が経過するたびに `Unit` を生成する特別なランデブーチャネルです。
単独では役に立たないように見えるかもしれませんが、ウィンドウ処理やその他の時間依存の処理を行う複雑な [produce] パイプラインやオペレーターを作成するための便利な構成要素です。
ティッカーチャネルは [select] 内で「オンチック（on tick）」アクションを実行するために使用できます。

このようなチャネルを作成するには、ファクトリメソッド [ticker] を使用します。
これ以上要素が必要ないことを示すには、チャネルに対して [ReceiveChannel.cancel] メソッドを使用します。

では、実際にどのように動作するか見てみましょう：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

//sampleStart
fun main() = runBlocking<Unit> {
    val tickerChannel = ticker(delayMillis = 200, initialDelayMillis = 0) // ティッカーチャネルを作成
    var nextElement = withTimeoutOrNull(1) { tickerChannel.receive() }
    println("Initial element is available immediately: $nextElement") // 最初の遅延はなし

    nextElement = withTimeoutOrNull(100) { tickerChannel.receive() } // 以降の要素はすべて200msの遅延
    println("Next element is not ready in 100 ms: $nextElement")

    nextElement = withTimeoutOrNull(120) { tickerChannel.receive() }
    println("Next element is ready in 200 ms: $nextElement")

    // 消費側の大きな遅延をエミュレート
    println("Consumer pauses for 300ms")
    delay(300)
    // 次の要素はすぐに利用可能
    nextElement = withTimeoutOrNull(1) { tickerChannel.receive() }
    println("Next element is available immediately after large consumer delay: $nextElement")
    // receiveの呼び出し間のポーズが考慮され、次の要素がより速く到着することに注目
    nextElement = withTimeoutOrNull(120) { tickerChannel.receive() }
    println("Next element is ready in 100ms after consumer pause in 300ms: $nextElement")

    tickerChannel.cancel() // これ以上の要素は不要であることを示す
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-10.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-10.kt) から入手できます。
>
{style="note"}

以下の内容が出力されます：

```text
Initial element is available immediately: kotlin.Unit
Next element is not ready in 100 ms: null
Next element is ready in 200 ms: kotlin.Unit
Consumer pauses for 300ms
Next element is available immediately after large consumer delay: kotlin.Unit
Next element is ready in 100ms after consumer pause in 300ms: kotlin.Unit
```

<!--- TEST -->

[ticker] は、消費側のポーズが発生する可能性を考慮しており、デフォルトではポーズが発生した場合に次に生成される要素の遅延を調整し、固定レートで要素を生成し続けようとすることに注意してください。

オプションとして、要素間の固定の遅延を維持するために [TickerMode.FIXED_DELAY] を `mode` パラメータとして指定することもできます。

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