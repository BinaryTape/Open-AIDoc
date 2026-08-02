<!--- TEST_NAME ExceptionsGuideTest -->
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: コルーチンの例外処理)

このセクションでは、例外処理と例外によるキャンセルについて説明します。
キャンセルされたコルーチンは、サスペンションポイント（中断点）で [CancellationException] をスローすること、およびそれがコルーチンの仕組みによって無視されることは、すでに知っています。ここでは、キャンセル中に例外がスローされた場合や、同じコルーチンの複数の子が例外をスローした場合に何が起こるかを見ていきます。

## 例外の伝播

コルーチンビルダーには、例外を自動的に伝播するもの（[launch]）と、ユーザーに公開するもの（[async] および [produce]）の2つの種類があります。
これらのビルダーが、他のコルーチンの「子」ではない「ルート」コルーチンを作成するために使用される場合、前者のビルダー（launch）は、Java の `Thread.uncaughtExceptionHandler` と同様に、例外を**未キャッチ（uncaught）**の例外として扱います。一方、後者（async/produce）は、ユーザーが最終的な例外を消費することに依存しています（例えば、[await][Deferred.await] や [receive][ReceiveChannel.receive] を介して行われます。[produce] と [receive][ReceiveChannel.receive] については [チャネル](https://github.com/Kotlin/kotlinx.coroutines/blob/master/docs/channels.md) のセクションで説明します）。

これは、[GlobalScope] を使用してルートコルーチンを作成する簡単な例で示すことができます。

> [GlobalScope] は、複雑な方法で裏目に出る可能性がある繊細なAPIです。アプリケーション全体のためのルートコルーチンを作成することは、`GlobalScope` の数少ない正当な用途の1つですが、`GlobalScope` を使用するには `@OptIn(DelicateCoroutinesApi::class)` を使用して明示的にオプトインする必要があります。
>
{style="note"}

```kotlin
import kotlinx.coroutines.*

//sampleStart
@OptIn(DelicateCoroutinesApi::class)
fun main() = runBlocking {
    val job = GlobalScope.launch { // launch によるルートコルーチン
        println("Throwing exception from launch")
        throw IndexOutOfBoundsException() // Thread.defaultUncaughtExceptionHandler によってコンソールに表示されます
    }
    job.join()
    println("Joined failed job")
    val deferred = GlobalScope.async { // async によるルートコルーチン
        println("Throwing exception from async")
        throw ArithmeticException() // 何も表示されず、ユーザーが await を呼び出すのを待ちます
    }
    try {
        deferred.await()
        println("Unreached")
    } catch (e: ArithmeticException) {
        println("Caught ArithmeticException")
    }
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-exceptions-01.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-exceptions-01.kt) から入手できます。
>
{style="note"}

このコードの出力は次のようになります（[デバッグ](https://github.com/Kotlin/kotlinx.coroutines/blob/master/docs/coroutine-context-and-dispatchers.md#debugging-coroutines-and-threads)を使用した場合）。

```text
Throwing exception from launch
Exception in thread "DefaultDispatcher-worker-1 @coroutine#2" java.lang.IndexOutOfBoundsException
Joined failed job
Throwing exception from async
Caught ArithmeticException
```

<!--- TEST EXCEPTION-->

## CoroutineExceptionHandler

**未キャッチ**の例外をコンソールに表示するデフォルトの動作をカスタマイズすることが可能です。
ルートコルーチンの [CoroutineExceptionHandler] コンテキスト要素は、そのルートコルーチンと、カスタム例外処理が行われる可能性のあるすべての子コルーチンに対する汎用的な `catch` ブロックとして使用できます。
これは [`Thread.uncaughtExceptionHandler`](https://docs.oracle.com/javase/8/docs/api/java/lang/Thread.html#setUncaughtExceptionHandler-java.lang.Thread.UncaughtExceptionHandler-) に似ています。
`CoroutineExceptionHandler` 内で例外から回復することはできません。ハンドラーが呼び出されたとき、コルーチンはすでに対応する例外を伴って完了しています。通常、ハンドラーは例外のログ記録、エラーメッセージの表示、アプリケーションの終了、または再起動に使用されます。

`CoroutineExceptionHandler` は、**未キャッチ**の例外（他の方法で処理されなかった例外）に対してのみ呼び出されます。
特に、すべての「子」コルーチン（他の [Job] のコンテキストで作成されたコルーチン）は、例外の処理を親コルーチンに委譲し、その親もまたその親へと委譲し、最終的にルートまで続きます。そのため、それらのコンテキストに設定された `CoroutineExceptionHandler` が使用されることはありません。
それに加えて、[async] ビルダーは常にすべての例外をキャッチし、それを結果の [Deferred] オブジェクトに表すため、その `CoroutineExceptionHandler` も効果がありません。

> スーパービジョンスコープ（supervision scope）で実行されているコルーチンは、例外を親に伝播せず、このルールの対象外となります。詳細については、このドキュメントの後の [スーパービジョン](#supervision) セクションで説明します。
>
{style="note"}  

```kotlin
import kotlinx.coroutines.*

@OptIn(DelicateCoroutinesApi::class)
fun main() = runBlocking {
//sampleStart
    val handler = CoroutineExceptionHandler { _, exception -> 
        println("CoroutineExceptionHandler got $exception") 
    }
    val job = GlobalScope.launch(handler) { // GlobalScope で動作するルートコルーチン
        throw AssertionError()
    }
    val deferred = GlobalScope.async(handler) { // これもルートだが launch ではなく async
        throw ArithmeticException() // 何も表示されず、ユーザーが deferred.await() を呼び出すのを待ちます
    }
    joinAll(job, deferred)
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-exceptions-02.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-exceptions-02.kt) から入手できます。
>
{style="note"}

このコードの出力は次のとおりです。

```text
CoroutineExceptionHandler got java.lang.AssertionError
```

<!--- TEST-->

## キャンセルと例外

キャンセルは例外と密接に関係しています。コルーチンは内部的にキャンセルのために `CancellationException` を使用しており、これらの例外はすべてのハンドラーによって無視されます。したがって、これらは `catch` ブロックで取得できる追加のデバッグ情報のソースとしてのみ使用されるべきです。
[Job.cancel] を使用してコルーチンがキャンセルされた場合、そのコルーチンは終了しますが、その親はキャンセルされません。

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
//sampleStart
    val job = launch {
        val child = launch {
            try {
                delay(Long.MAX_VALUE)
            } finally {
                println("Child is cancelled")
            }
        }
        yield()
        println("Cancelling child")
        child.cancel()
        child.join()
        yield()
        println("Parent is not cancelled")
    }
    job.join()
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-exceptions-03.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-exceptions-03.kt) から入手できます。
>
{style="note"}

このコードの出力は次のとおりです。

```text
Cancelling child
Child is cancelled
Parent is not cancelled
```

<!--- TEST-->

コルーチンが `CancellationException` 以外の例外に遭遇した場合、その例外で親をキャンセルします。
この動作はオーバーライドできず、[構造化されたコンカレンシー（structured concurrency）](https://github.com/Kotlin/kotlinx.coroutines/blob/master/docs/composing-suspending-functions.md#structured-concurrency-with-async) のための安定したコルーチン階層を提供するために使用されます。
子コルーチンにおいて、[CoroutineExceptionHandler] の実装は使用されません。

> これらの例では、[CoroutineExceptionHandler] は常に [GlobalScope] で作成されたコルーチンに設定されています。メインの [runBlocking] のスコープ内で起動されたコルーチンに例外ハンドラーを設定しても意味がありません。なぜなら、ハンドラーが設定されていても、その子が例外で完了するとメインコルーチンは常にキャンセルされるからです。
>
{style="note"}

元の例外は、そのすべての子が終了したときにのみ親によって処理されます。これは次の例で示されます。

```kotlin
import kotlinx.coroutines.*

@OptIn(DelicateCoroutinesApi::class)
fun main() = runBlocking {
//sampleStart
    val handler = CoroutineExceptionHandler { _, exception -> 
        println("CoroutineExceptionHandler got $exception") 
    }
    val job = GlobalScope.launch(handler) {
        launch { // 1番目の子
            try {
                delay(Long.MAX_VALUE)
            } finally {
                withContext(NonCancellable) {
                    println("Children are cancelled, but exception is not handled until all children terminate")
                    delay(100)
                    println("The first child finished its non cancellable block")
                }
            }
        }
        launch { // 2番目の子
            delay(10)
            println("Second child throws an exception")
            throw ArithmeticException()
        }
    }
    job.join()
//sampleEnd 
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-exceptions-04.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-exceptions-04.kt) から入手できます。
>
{style="note"}

このコードの出力は次のとおりです。

```text
Second child throws an exception
Children are cancelled, but exception is not handled until all children terminate
The first child finished its non cancellable block
CoroutineExceptionHandler got java.lang.ArithmeticException
```

<!--- TEST-->

## 例外の集約

コルーチンの複数の子が例外で失敗した場合、一般的なルールは「最初の例外が勝つ」であり、最初の例外が処理されます。
最初の例外の後に発生したすべての追加の例外は、抑制された例外（suppressed exceptions）として最初の例外に添付されます。

<!--- INCLUDE
import kotlinx.coroutines.exceptions.*
-->

```kotlin
import kotlinx.coroutines.*
import java.io.*

@OptIn(DelicateCoroutinesApi::class)
fun main() = runBlocking {
    val handler = CoroutineExceptionHandler { _, exception ->
        println("CoroutineExceptionHandler got $exception with suppressed ${exception.suppressed.contentToString()}")
    }
    val job = GlobalScope.launch(handler) {
        launch {
            try {
                delay(Long.MAX_VALUE) // 他の兄弟が IOException で失敗したときにキャンセルされます
            } finally {
                throw ArithmeticException() // 2番目の例外
            }
        }
        launch {
            delay(100)
            throw IOException() // 最初の例外
        }
        delay(Long.MAX_VALUE)
    }
    job.join()  
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-exceptions-05.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-exceptions-05.kt) から入手できます。
>
{style="note"}

このコードの出力は次のとおりです。

```text
CoroutineExceptionHandler got java.io.IOException with suppressed [java.lang.ArithmeticException]
```

<!--- TEST-->

> このメカニズムは現在、Java バージョン 1.7 以上でのみ機能することに注意してください。
> JS および Native の制限は一時的なものであり、将来的に解除される予定です。
>
{style="note"}

キャンセル例外（Cancellation exceptions）は透過的であり、デフォルトでアンラップされます。

```kotlin
import kotlinx.coroutines.*
import java.io.*

@OptIn(DelicateCoroutinesApi::class)
fun main() = runBlocking {
//sampleStart
    val handler = CoroutineExceptionHandler { _, exception ->
        println("CoroutineExceptionHandler got $exception")
    }
    val job = GlobalScope.launch(handler) {
        val innerJob = launch { // このスタック内のすべてのコルーチンがキャンセルされます
            launch {
                launch {
                    throw IOException() // 元の例外
                }
            }
        }
        try {
            innerJob.join()
        } catch (e: CancellationException) {
            println("Rethrowing CancellationException with original cause")
            throw e // キャンセル例外が再スローされますが、元の IOException はハンドラーに届きます
        }
    }
    job.join()
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-exceptions-06.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-exceptions-06.kt) から入手できます。
>
{style="note"}

このコードの出力は次のとおりです。

```text
Rethrowing CancellationException with original cause
CoroutineExceptionHandler got java.io.IOException
```

<!--- TEST-->

## スーパービジョン (Supervision)

以前に学んだように、キャンセルはコルーチン階層全体を伝播する双方向の関係です。次に、単方向のキャンセルが必要な場合を見てみましょう。

そのような要件の良い例は、そのスコープ内でジョブが定義されている UI コンポーネントです。UI の子タスクのいずれかが失敗したとしても、UI コンポーネント全体をキャンセルする（事実上破棄する）必要が常にあるわけではありません。しかし、UI コンポーネントが破棄された（そしてそのジョブがキャンセルされた）場合は、その結果が不要になるため、すべての子ジョブをキャンセルする必要があります。

別の例は、複数の子ジョブを生成し、それらの実行を「監視（supervise）」し、それらの失敗を追跡して、失敗したものだけを再起動する必要があるサーバープロセスです。

### スーパービジョンジョブ (Supervision job)

この目的には [SupervisorJob][SupervisorJob()] を使用できます。
これは通常の [Job][Job()] に似ていますが、キャンセルが下方向にのみ伝播するという点だけが異なります。これは、次の例を使用して簡単に示すことができます。

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
//sampleStart
    val supervisor = SupervisorJob()
    with(CoroutineScope(coroutineContext + supervisor)) {
        // 最初の子を起動 -- この例ではその例外を無視します（実際にはこれを行わないでください！）
        val firstChild = launch(CoroutineExceptionHandler { _, _ ->  }) {
            println("The first child is failing")
            throw AssertionError("The first child is cancelled")
        }
        // 2番目の子を起動
        val secondChild = launch {
            firstChild.join()
            // 最初の子のキャンセルは2番目の子には伝播されません
            println("The first child is cancelled: ${firstChild.isCancelled}, but the second one is still active")
            try {
                delay(Long.MAX_VALUE)
            } finally {
                // しかし、スーパービジョンのキャンセルは伝播されます
                println("The second child is cancelled because the supervisor was cancelled")
            }
        }
        // 最初の子が失敗して完了するまで待ちます
        firstChild.join()
        println("Cancelling the supervisor")
        supervisor.cancel()
        secondChild.join()
    }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-supervision-01.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-supervision-01.kt) から入手できます。
>
{style="note"}

このコードの出力は次のとおりです。

```text
The first child is failing
The first child is cancelled: true, but the second one is still active
Cancelling the supervisor
The second child is cancelled because the supervisor was cancelled
```

<!--- TEST-->

### スーパービジョンスコープ (Supervision scope)

スコープを限定した（scoped）並行性のために、[coroutineScope][_coroutineScope] の代わりに [supervisorScope][_supervisorScope] を使用できます。これは、キャンセルを一方方向にのみ伝播し、自身が失敗した場合にのみすべての子をキャンセルします。また、[coroutineScope][_coroutineScope] と同様に、完了する前にすべての子を待ちます。

```kotlin
import kotlin.coroutines.*
import kotlinx.coroutines.*

fun main() = runBlocking {
//sampleStart
    try {
        supervisorScope {
            val child = launch {
                try {
                    println("The child is sleeping")
                    delay(Long.MAX_VALUE)
                } finally {
                    println("The child is cancelled")
                }
            }
            // yield を使用して子に実行と表示の機会を与えます 
            yield()
            println("Throwing an exception from the scope")
            throw AssertionError()
        }
    } catch(e: AssertionError) {
        println("Caught an assertion error")
    }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-supervision-02.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-supervision-02.kt) から入手できます。
>
{style="note"}

このコードの出力は次のとおりです。

```text
The child is sleeping
Throwing an exception from the scope
The child is cancelled
Caught an assertion error
```

<!--- TEST-->

#### 監視対象コルーチンの例外

通常のジョブとスーパービジョンジョブのもう1つの重要な違いは、例外処理です。
すべての子は、例外処理メカニズムを介して自ら例外を処理する必要があります。
この違いは、子の失敗が親に伝播しないという事実に由来します。
これは、[supervisorScope][_supervisorScope] 内で直接起動されたコルーチンが、ルートコルーチンと同じ方法で、そのスコープにインストールされた [CoroutineExceptionHandler] を使用することを意味します
（詳細は [CoroutineExceptionHandler](#coroutineexceptionhandler) セクションを参照してください）。

```kotlin
import kotlin.coroutines.*
import kotlinx.coroutines.*

fun main() = runBlocking {
//sampleStart
    val handler = CoroutineExceptionHandler { _, exception -> 
        println("CoroutineExceptionHandler got $exception") 
    }
    supervisorScope {
        val child = launch(handler) {
            println("The child throws an exception")
            throw AssertionError()
        }
        println("The scope is completing")
    }
    println("The scope is completed")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-supervision-03.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-supervision-03.kt) から入手できます。
>
{style="note"}

このコード의出力は次のとおりです。

```text
The scope is completing
The child throws an exception
CoroutineExceptionHandler got java.lang.AssertionError
The scope is completed
```

<!--- TEST-->

<!--- MODULE kotlinx-coroutines-core -->
<!--- INDEX kotlinx.coroutines -->

[CancellationException]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-cancellation-exception/index.html
[launch]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html
[async]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html
[Deferred.await]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-deferred/await.html
[GlobalScope]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-global-scope/index.html
[CoroutineExceptionHandler]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-exception-handler/index.html
[Job]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/index.html
[Deferred]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-deferred/index.html
[Job.cancel]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/cancel.html
[runBlocking]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/run-blocking.html
[SupervisorJob()]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-supervisor-job.html
[Job()]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job.html
[_coroutineScope]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/coroutine-scope.html
[_supervisorScope]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/supervisor-scope.html

<!--- INDEX kotlinx.coroutines.channels -->

[produce]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/produce.html
[ReceiveChannel.receive]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-receive-channel/receive.html

<!--- END -->