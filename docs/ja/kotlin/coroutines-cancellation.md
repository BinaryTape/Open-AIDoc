<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: キャンセルとタイムアウト)

キャンセル（Cancellation）を使用すると、コルーチンが完了する前に停止をリクエストできます。
これは、ユーザーがウィンドウを閉じたり、ユーザーインターフェースで別の画面に移動したりした際に、コルーチンがまだ実行中である場合など、不要になった作業を停止します。

キャンセルを使用することで、リソースを早期に解放したり、破棄された後のオブジェクトにコルーチンがアクセスするのを防いだりできます。
また、以下のような、繰り返しの作業を行う長時間実行のコルーチンを停止するためにも使用できます。

* ハートビートの送信。
* スケジュールされたタスクの実行。
* 時計のUIなど、最新の読み取り値を反映するための状態更新。

キャンセルは、コルーチンのライフサイクルと親子関係を表す [`Job`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/) ハンドルを介して機能します。
`Job` を使用すると、[構造化された並行性（structured concurrency）](coroutines-basics.md#coroutine-scope-and-structured-concurrency)で定義されているように、コルーチンがアクティブかどうかを確認したり、コルーチンとその子をキャンセルしたりできます。

## コルーチンのキャンセル

コルーチンは、その `Job` ハンドルに対して [`cancel()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/cancel.html) 関数が呼び出されるとキャンセルされます。
[`.launch()`](coroutines-basics.md#coroutinescope-launch) などの [コルーチン・ビルダー関数](coroutines-basics.md#coroutine-builder-functions) は `Job` を返します。[`.async()`](coroutines-basics.md#coroutinescope-async) 関数は [`Deferred`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-deferred/) を返します。これは `Job` を実装しており、同じキャンセル動作をサポートします。

`cancel()` 関数は手動で呼び出すこともできますが、親コルーチンがキャンセルされたときにキャンセルの伝搬（propagation）を通じて自動的に呼び出されることもあります。

コルーチンがキャンセルされると、次にキャンセルを確認したときに [`CancellationException`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-cancellation-exception/) をスローします。
`delay()` 関数など、`kotlinx.coroutines` ライブラリ内の中断関数（suspending functions）は、中断時にキャンセルを確認します。

[`awaitCancellation()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/await-cancellation.html) 関数を使用すると、キャンセルされるまでコルーチンを中断できます。
これは `delay(Duration.INFINITE)` を呼び出すのと同等です。

> コルーチンがいつ、どのようにキャンセルを確認するかについての詳細は、[中断ポイントとキャンセル](#suspension-points-and-cancellation)を参照してください。
>
{style="tip"}

以下は、コルーチンを手動でキャンセルする例です。

```kotlin
import kotlinx.coroutines.*

suspend fun main() {
//sampleStart
withContext(Dispatchers.Default) {
    // コルーチンが実行を開始した合図として使用されます
    val childStarted = CompletableDeferred<Unit>()
    
    val childJob: Job = launch {
        println("The coroutine has started")

        // CompletableDeferred を完了させ、
        // コルーチンが実行を開始したことを知らせます
        childStarted.complete(Unit)
        try {
            // 無期限に中断します
            // この呼び出しは、コルーチンがキャンセルされない限り戻りません
            awaitCancellation()
        } catch (e: CancellationException) {
            println("The coroutine was canceled: $e")
          
            // キャンセル例外は常に再スローしてください！
            throw e
        }
        println("This line will never be executed")
    }
  
    // キャンセルする前にコルーチンの開始を待ちます
    childStarted.await()

    // コルーチンをキャンセルします。
    // これにより awaitCancellation() は CancellationException をスローします
    childJob.cancel()
}
// withContext() や coroutineScope() などのコルーチン・ビルダーは、
// 子がキャンセルされた場合でも、すべての子コルーチンが完了するのを待ちます
println("All coroutines have completed")
//sampleEnd
}
```
{kotlin-runnable="true" id="manual-cancellation-example"}

この例では、[`CompletableDeferred`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-completable-deferred/) がコルーチンの実行開始の合図として使われています。
コルーチンは実行を開始すると `complete()` を呼び出し、`await()` はその `CompletableDeferred` が完了したときのみ戻ります。
コルーチンをキャンセルするためにこのチェックが必須なわけではありません。
ここでは、コルーチンが確実に開始され、キャンセルされる前にメッセージを出力することを保証し、例を再現可能にするために含まれています。

`Deferred` は `Job` を実装しているため、`async()` コルーチン・ビルダー関数で作成されたコルーチンでもキャンセルは同様に機能します。

```kotlin
val deferred = async { /* ... */ }
deferred.cancel()
```

> `CancellationException` をキャッチすると、キャンセルの伝搬が途切れる可能性があります。
> キャッチする必要がある場合は、キャンセルの伝搬がコルーチンの階層構造を通じて正しく行われるよう、再スローしてください。
>
> 詳細は、[コルーチンの例外処理](exception-handling.md#cancellation-and-exceptions)を参照してください。
>
{style="warning"}

### キャンセルの伝搬

[構造化された並行性](coroutines-basics.md#coroutine-scope-and-structured-concurrency)により、コルーチンをキャンセルするとそのすべての子もキャンセルされることが保証されます。
これにより、親コルーチンがキャンセルされた後に子コルーチンが作業を継続することを防ぎます。

以下に例を示します。

```kotlin
import kotlinx.coroutines.*

suspend fun main() {
    withContext(Dispatchers.Default) {
//sampleStart
// 子コルーチンが起動された合図として使用されます
val childrenLaunched = CompletableDeferred<Unit>()

// 2つの子コルーチンを起動します
val parentJob = launch {
    launch {
        println("Child coroutine 1 has started running")
        try {
            awaitCancellation()
        } finally {
            println("Child coroutine 1 has been canceled")
        }
    }
    launch {
        println("Child coroutine 2 has started running")
        try {
            awaitCancellation()
        } finally {
            println("Child coroutine 2 has been canceled")
        }
    }
    // CompletableDeferred を完了させ、
    // 子コルーチンが起動されたことを知らせます
    childrenLaunched.complete(Unit)
}
// 親コルーチンがすべての子を起動したという
// 合図を送るのを待ちます
childrenLaunched.await()

// 親コルーチンをキャンセルします。これによりすべての子もキャンセルされます
parentJob.cancel()
//sampleEnd
    }
}
```
{kotlin-runnable="true" id="cancellation-propagation-example"}

この例では、各子コルーチンが [`finally` ブロック](exceptions.md#the-finally-block) を使用しているため、コルーチンがキャンセルされたときにその中のコードが実行されます。
ここでは `CompletableDeferred` が、子コルーチンがキャンセルされる前に起動されたことを知らせていますが、実行が開始されたことまでは保証しません。
実行される前にキャンセルされた場合、何も出力されません。

## キャンセルに反応するコルーチンを作成する {id="cancellation-is-cooperative"}

Kotlin では、コルーチンのキャンセルは *協調的（cooperative）* です。
コルーチンがキャンセルに反応するのは、[中断](#suspension-points-and-cancellation)したり[明示的にキャンセルを確認](#check-for-cancellation-explicitly)したりして協力した場合のみです。

このセクションでは、[yield()](#the-yield-suspending-function) 関数の呼び出しなど、中断ポイントを追加することでコルーチンをキャンセルに反応させる方法について学びます。

### 中断ポイントとキャンセル

コルーチンがキャンセルされた場合、コード内の中断可能な箇所、つまり *中断ポイント（suspension point）* に到達するまで実行を継続します。
そこでコルーチンが中断する場合、その中断関数は自身がキャンセルされたかどうかを確認します。
キャンセルされていた場合、コルーチンは停止し、`CancellationException` をスローします。

`suspend` 関数の呼び出しは中断ポイントですが、常に中断するとは限りません。
例えば、`Deferred` の結果を待機する場合、その `Deferred` がまだ完了していない場合にのみコルーチンは中断します。

以下は、一般的な中断関数を使用した例です。これらの中断関数は実際に中断を行うため、コルーチンがキャンセルされた際の中断および停止を可能にします。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.channels.Channel
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration

suspend fun main() {
//sampleStart
withContext(Dispatchers.Default) {
    val childJobs = listOf(
        launch {
            // キャンセルされるまで中断
            awaitCancellation()
        },
        launch {
            // キャンセルされるまで中断
            delay(Duration.INFINITE)
        },
        launch {
            val channel = Channel<Int>()
            // 送信されない値を待っている間中断
            channel.receive()
        },
        launch {
            val deferred = CompletableDeferred<Int>()
            // 完了しない値を待っている間中断
            deferred.await()
        },
        launch {
            val mutex = Mutex(locked = true)
            // 無期限にロックされたままのミューテックスを待っている間中断
            mutex.lock()
        }
    )
    
    // 子コルーチンが開始して中断するための時間を与えます
    delay(100.milliseconds)
    
    // すべての子コルーチンをキャンセル
    childJobs.forEach { it.cancel() }
}
println("All child jobs completed!")
//sampleEnd
}
```
{kotlin-runnable="true" id="suspension-points-example"}

> `kotlinx.coroutines` ライブラリ内にあるすべての中断関数は、内部で [`suspendCancellableCoroutine()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/suspend-cancellable-coroutine.html) を使用しており、コルーチンの中断時にキャンセルを確認するため、キャンセルと協調します。
> 対照的に、[`suspendCoroutine()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/suspend-coroutine.html) を使用するカスタム中断関数はキャンセルに反応しません。
>
{style="tip"}

### `yield()` 中断関数

コルーチンが中断しない場合、そのコルーチンが完了するまで、同じスレッドで他のコルーチンを実行することはできません。
その結果、中断しないコルーチンはそのスレッド上で順次実行されることになります。
また、長時間中断しないコルーチンは、キャンセルされても停止しません。

CPU負荷の高い計算や、中断せずに長時間実行されるその他のコードでは、定期的に [`yield()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/yield.html) 関数を呼び出してください。
この関数は現在のスレッドを解放し、他のコルーチンがそのスレッドで実行される機会を与えます。
また、コルーチンが定期的にキャンセルを確認することも保証します。コルーチンがキャンセルされている場合、`yield()` 関数は `CancellationException` をスローします。

![チェックなし、ensureActive() または isActive を使用、yield() を使用した場合のコルーチンキャンセル処理の比較](yield-and-cancellation.svg)

以下に例を示します。

```kotlin
import kotlinx.coroutines.*

fun main() {
//sampleStart
// runBlocking は現在のスレッドを使用してすべてのコルーチンを実行します
runBlocking {
    val coroutineCount = 5
    repeat(coroutineCount) { coroutineIndex ->
        launch {
            val id = coroutineIndex + 1
            repeat(5) { iterationIndex ->
                val iteration = iterationIndex + 1
                // 一時的に中断して他のコルーチンに実行の機会を与える
                // これがないと、コルーチンは順次実行されます
                yield()
                // コルーチン番号と反復回数を出力
                println("$id * $iteration = ${id * iteration}")
            }
        }
    }
}
//sampleEnd
}
```
{kotlin-runnable="true" id="yield-example"}

この例では、各コルーチンが `yield()` を使用して、各反復の間に他のコルーチンが実行されるようにしています。

### 明示的にキャンセルを確認する

キャンセルを明示的に確認することができ、これにより長時間実行されるコードが中断することなくキャンセルに反応できるようになります。
中断しない長時間実行のコルーチンは、完了するまで同じスレッド上の他のコルーチンの実行を妨げる可能性があります。
その動作がユースケースにおいて意図的なものでない限り、代わりに [`yield()`](#the-yield-suspending-function) 関数を使用してください。

API によっては、確認結果として Boolean 値を返すか、例外をスローします。

* [`isActive`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/is-active.html) プロパティは、コルーチンがキャンセルされると `false` を返します。
* [`ensureActive()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/ensure-active.html) 関数は、コルーチンがキャンセルされると `CancellationException` をスローします。

### コルーチンがキャンセルされたときにブロックするコードを中断（interrupt）する

JVM では、`Thread.sleep()` や `BlockingQueue.take()` などの一部のブロック関数が現在のスレッドをブロックすることがあります。
これらのブロック関数は中断（interrupt）することができ、それにより途中で停止させることができます。
しかし、コルーチンからこれらを呼び出した場合、キャンセルによってスレッドが中断されることはありません。

コルーチンをキャンセルするときにスレッドを中断するには、ブロックするコードを [`runInterruptible()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/run-interruptible.html) 関数でラップします。

```kotlin
import kotlinx.coroutines.*

suspend fun main() {
//sampleStart
withContext(Dispatchers.Default) {
    val childStarted = CompletableDeferred<Unit>()
    val childJob = launch {
        try {
            // キャンセルによりスレッドの中断がトリガーされます
            runInterruptible {
                childStarted.complete(Unit)
                try {
                    // 現在のスレッドを非常に長い時間ブロックします
                    Thread.sleep(Long.MAX_VALUE)
                } catch (e: InterruptedException) {
                    println("Thread interrupted (Java): $e")
                    throw e
                }
            }
        } catch (e: CancellationException) {
            println("Coroutine canceled (Kotlin): $e")
            throw e
        }
    }
    childStarted.await()

    // コルーチンをキャンセルし、Thread.sleep() を実行しているスレッドを中断します
    childJob.cancel()
}
//sampleEnd
}
```
{kotlin-runnable="true" id="interrupt-cancellation-example"}

## コルーチンキャンセル時の値を安全に処理する

中断されたコルーチンがキャンセルされると、値がすでに利用可能であっても、値を返さずに `CancellationException` で再開されます。
この動作は *即時キャンセル（prompt cancellation）* と呼ばれます。
これにより、すでに閉じられた画面を更新するなど、キャンセルされたコルーチンのスコープ内でコードが継続されるのを防ぎます。

以下に例を示します。

```kotlin
// UIスレッドを使用するコルーチンスコープを定義
class ScreenWithButtons(private val scope: CoroutineScope) {
    fun loadAndUpdateButtons(filename: String) {
        scope.launch {
            // withContext() はブロックに入る前と
            // ブロックから戻った後にキャンセルを確認します
            val buttonNames = withContext(Dispatchers.IO) {
                // これはキャンセルに反応しないブロックする呼び出しです
                readLines(filename)
            }
            
            // updateUi() を呼び出すのは安全です。
            // なぜなら、コルーチンがキャンセルされている場合 withContext() は値を返さず、
            // また、UIスレッドで実行されているコードはこの呼び出しの前に
            // ボタンを破棄（dispose）できないためです
            updateUi(buttonNames)
        }
    }

    // ボタンにアクセスするため、UIスレッドからのみこの関数を呼び出してください
    // ボタンが破棄された後に呼び出されると例外をスローします
    private fun updateUi(buttonNames: List<String>) {
        // 指定された名前でボタンを更新するプレースホルダーコード
    }

    // UIスレッドからのみこの関数を呼び出してください
    fun leaveScreen() {
        // 画面を離れる際にスコープをキャンセルします
        // これ以上UIを更新することはできなくなります
        scope.cancel()
    }
}

// UIコントローラーのコード
setHandler(Event.ScreenClosed) {
    // UIスレッドで実行されます
    screenWithButtons.leaveScreen()
    buttons.dispose()
}
```

この例では、`withContext(Dispatchers.IO)` はキャンセルと協調し、`withContext(Dispatchers.IO)` がボタン名を返す前に `leaveScreen()` 関数がコルーチンをキャンセルした場合、`updateUi()` が実行されるのを防ぎます。

即時キャンセルは、値が無効になった後にそれを使用することを防ぎますが、重要な値がまだ使用中であるときにコードを停止させ、その結果として値が失われる原因にもなり得ます。
これは、コルーチンが `AutoCloseable` リソースなどの値を受け取ったものの、それを閉じるコード部分に到達する前にキャンセルされた場合に発生する可能性があります。
これを防ぐには、値を処理するコルーチンがキャンセルされた場合でも確実に実行される場所にクリーンアップ・ロジックを記述してください。

以下に例を示します。

```kotlin
import java.nio.file.*
import java.nio.charset.*
import kotlinx.coroutines.*
import java.io.*

// UIスレッドでコルーチンを実行するスコープを使用
class ScreenWithFileContents(private val scope: CoroutineScope) {
    fun displayFile(path: Path) {
        scope.launch {
            // finally ブロックで閉じることができるよう、readerを変数に保存
            var reader: BufferedReader? = null
            
            try {
                withContext(Dispatchers.IO) {
                    reader = Files.newBufferedReader(
                        path, Charset.forName("US-ASCII")
                    )
                }
                // withContext() 完了後に保存された reader を使用
                updateUi(reader!!)
            } finally {
                // コルーチンがキャンセルされた場合でも reader が閉じられるようにします
                reader?.close()
            }
        }
    }

    private suspend fun updateUi(reader: BufferedReader) {
        // ファイルの内容を表示
        while (true) {
            val line = withContext(Dispatchers.IO) {
                reader.readLine()
            }
            if (line == null)
                break
            addOneLineToUi(line)
        }
    }

    private fun addOneLineToUi(line: String) {
        // UIに1行追加するコードのプレースホルダー
    }

    // UIスレッドからのみ呼び出し可能
    fun leaveScreen() {
        // スコープをキャンセルし、そのコルーチンがUIを更新するのを防ぎます
        scope.cancel()
    }
}
```

この例では、`BufferedReader` を変数に保存し、`finally` ブロックで閉じることで、コルーチンがキャンセルされた場合でもリソースが解放されることを保証しています。

### キャンセル不可なブロックを実行する

コルーチンの特定の箇所にキャンセルが影響しないようにすることができます。
それには、`withContext()` コルーチン・ビルダー関数の引数として [`NonCancellable`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-non-cancellable/) を渡します。

> `.launch()` や `.async()` などの他のコルーチン・ビルダーで `NonCancellable` を使用することは避けてください。親子関係を断ち切ることになり、構造化された並行性が乱れます。
>
{style="warning"}

`NonCancellable` は、中断を伴う `close()` 関数でリソースを閉じる場合など、コルーチンが終了前にキャンセルされたとしても特定の操作を確実に完了させる必要がある場合に便利です。

以下に例を示します。

```kotlin
import kotlinx.coroutines.*
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
val serviceStarted = CompletableDeferred<Unit>()

fun startService() {
    println("Starting the service...")
    serviceStarted.complete(Unit)
}

suspend fun shutdownServiceAndWait() {
    println("Shutting down...")
    delay(100.milliseconds)
    println("Successfully shut down!")
}

suspend fun main() {
    withContext(Dispatchers.Default) {
        val childJob = launch {
            startService()
            try {
                awaitCancellation()
            } finally {
                withContext(NonCancellable) {
                    // withContext(NonCancellable) がない場合、
                    // コルーチンがキャンセルされているため、この関数は完了しません
                    shutdownServiceAndWait()
                }
            }
        }
        serviceStarted.await()
        childJob.cancel()
    }
    println("Exiting the program")
}
//sampleEnd
```
{kotlin-runnable="true" id="noncancellable-blocks-example"}

## タイムアウト

タイムアウトを使用すると、指定した時間の経過後にコルーチンを自動的にキャンセルできます。
時間がかかりすぎる操作を停止するために使用できます。

例えば、サーバーから画像をダウンロードするリクエストがタイムアウトした場合、再試行したりローカルキャッシュにフォールバックしたりできます。

タイムアウトを指定するには、[`withTimeoutOrNull()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-timeout-or-null.html) 関数に `Duration` を指定して使用します。

```kotlin
import kotlinx.coroutines.*
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
suspend fun slowOperation(): String {
    try {
        delay(300.milliseconds)
        return "A"
    } catch (e: CancellationException) {
        println("The slow operation has been canceled: $e")
        throw e
    }
}

suspend fun fastOperation(): String {
    try {
        delay(15.milliseconds)
        return "B"
    } catch (e: CancellationException) {
        println("The fast operation has been canceled: $e")
        throw e
    }
}

suspend fun main() {
    withContext(Dispatchers.Default) {
        val slow = withTimeoutOrNull(100.milliseconds) {
            slowOperation()
        }
        println("The slow operation finished with $slow")
        val fast = withTimeoutOrNull(100.milliseconds) {
            fastOperation()
        }
        println("The fast operation finished with $fast")
    }
}
//sampleEnd
```
{kotlin-runnable="true" id="timeout-example"}

タイムアウトが指定された `Duration` を超えた場合、`withTimeoutOrNull()` は `null` を返します。