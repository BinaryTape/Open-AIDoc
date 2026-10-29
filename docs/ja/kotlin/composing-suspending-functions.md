<!--- TEST_NAME ComposingGuideTest -->
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 中断関数の構成)

このセクションでは、中断関数（suspending functions）を構成するためのさまざまなアプローチについて説明します。

## デフォルトで逐次実行 {id="sequential-by-default"}

リモートサービスの呼び出しや計算など、何か役立つことを行う2つの中断関数がどこかで定義されていると仮定します。ここではそれらが役立つものであると仮定しますが、実際にはこの例のためにそれぞれが1秒間遅延するだけのものです：

```kotlin
suspend fun doSomethingUsefulOne(): Int {
    delay(1000L) // ここで何か役立つことをしているふりをします
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // ここでも何か役立つことをしているふりをします
    return 29
}
```

これらを *逐次的*（sequentially）に呼び出す必要がある場合、つまり最初に `doSomethingUsefulOne` を呼び出し、*その後に* `doSomethingUsefulTwo` を呼び出して、それらの結果の合計を計算するにはどうすればよいでしょうか？実務では、最初の関数の結果を使用して2番目の関数を呼び出す必要があるかどうかを判断したり、呼び出し方を決定したりする場合にこれを行います。

コルーチン内のコードは、通常のコードと同様にデフォルトで *逐次的* であるため、通常の逐次呼び出しを使用します。以下の例は、両方の中断関数を実行するのにかかる合計時間を計測することで、それを示しています：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

fun main() = runBlocking<Unit> {
//sampleStart
    val time = measureTimeMillis {
        val one = doSomethingUsefulOne()
        val two = doSomethingUsefulTwo()
        println("The answer is ${one + two}")
    }
    println("Completed in $time ms")
//sampleEnd    
}

suspend fun doSomethingUsefulOne(): Int {
    delay(1000L) // ここで何か役立つことをしているふりをします
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // ここでも何か役立つことをしているふりをします
    return 29
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-compose-01.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-compose-01.kt) から入手できます。
>
{style="note"}

次のような出力が得られます：

```text
The answer is 42
Completed in 2017 ms
```

<!--- TEST ARBITRARY_TIME -->

## async を使用した並行実行 {id="concurrent-using-async"}

もし `doSomethingUsefulOne` と `doSomethingUsefulTwo` の呼び出しの間に依存関係がなく、両方を *並行して*（concurrently）行うことで、より早く答えを得たい場合はどうすればよいでしょうか？ここで [async] が役に立ちます。

概念的には、[async] は [launch] と同じです。これは、他のすべてのコルーチンと並行して動作する軽量なスレッドである独立したコルーチンを開始します。違いは、`launch` は [Job] を返し、結果の値を保持しないのに対し、`async` は [Deferred]（後で結果を提供することを約束する、軽量で非ブロッキングな future）を返すことです。Deferred 値に対して `.await()` を使用することで最終的な結果を取得できますが、`Deferred` は `Job` でもあるため、必要に応じてキャンセルすることもできます。

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

fun main() = runBlocking<Unit> {
//sampleStart
    val time = measureTimeMillis {
        val one = async { doSomethingUsefulOne() }
        val two = async { doSomethingUsefulTwo() }
        println("The answer is ${one.await() + two.await()}")
    }
    println("Completed in $time ms")
//sampleEnd    
}

suspend fun doSomethingUsefulOne(): Int {
    delay(1000L) // ここで何か役立つことをしているふりをします
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // ここでも何か役立つことをしているふりをします
    return 29
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-compose-02.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-compose-02.kt) から入手できます。
>
{style="note"}

次のような出力が得られます：

```text
The answer is 42
Completed in 1017 ms
```

<!--- TEST ARBITRARY_TIME -->

2つのコルーチンが並行して実行されるため、2倍速くなります。コルーチンによる並行実行は常に明示的であることに注意してください。

## 遅延開始される async {id="lazily-started-async"}

オプションとして、[async] の `start` パラメータを [CoroutineStart.LAZY] に設定することで、遅延実行（lazy）にすることができます。このモードでは、[await][Deferred.await] によって結果が必要とされたとき、またはその `Job` の [start][Job.start] 関数が呼び出されたときにのみコルーチンを開始します。次の例を実行してください：

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

fun main() = runBlocking<Unit> {
//sampleStart
    val time = measureTimeMillis {
        val one = async(start = CoroutineStart.LAZY) { doSomethingUsefulOne() }
        val two = async(start = CoroutineStart.LAZY) { doSomethingUsefulTwo() }
        // 何らかの計算
        one.start() // 1つ目を開始
        two.start() // 2つ目を開始
        println("The answer is ${one.await() + two.await()}")
    }
    println("Completed in $time ms")
//sampleEnd    
}

suspend fun doSomethingUsefulOne(): Int {
    delay(1000L) // ここで何か役立つことをしているふりをします
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // ここでも何か役立つことをしているふりをします
    return 29
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-compose-03.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-compose-03.kt) から入手できます。
>
{style="note"}

次のような出力が得られます：

```text
The answer is 42
Completed in 1017 ms
```

<!--- TEST ARBITRARY_TIME -->

ここでは、2つのコルーチンは前の例のように定義されていますが実行はされず、いつ実行を開始するかは [start][Job.start] を呼び出すことでプログラマに委ねられます。まず `one` を開始し、次に `two` を開始し、それから個々のコルーチンが終了するのを待ちます。

個々のコルーチンに対して最初に [start][Job.start] を呼び出さずに `println` 内で [await][Deferred.await] を呼び出すと、[await][Deferred.await] がコルーチンの実行を開始して終了を待機するため、逐次的な動作になってしまうことに注意してください。これは遅延実行の意図したユースケースではありません。`async(start = CoroutineStart.LAZY)` のユースケースは、値の計算に中断関数が含まれる場合に、標準の [lazy](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/lazy.html) 関数の代わりとして使用することです。

## async スタイルな関数 {id="async-style-functions"}

> この async 関数を使用したプログラミングスタイルは、他のプログラミング言語で一般的なスタイルであるため、説明のためにのみここに記載しています。Kotlin のコルーチンでこのスタイルを使用することは、以下で説明する理由により **強く非推奨** です。
>
{style="note"}

構造化された並行性（structured concurrency）を回避するために [GlobalScope] 参照を使用し、[async] コルーチンビルダーを使用して `doSomethingUsefulOne` と `doSomethingUsefulTwo` を *非同期に* 呼び出す async スタイルの関数を定義できます。このような関数には、非同期計算を開始するだけであり、結果を得るには結果の Deferred 値を使用する必要があることを強調するために、名前の末尾に「...Async」を付けます。

> [GlobalScope] は、思わぬ落とし穴があるデリケートな API です。その一つは以下で説明します。そのため、`@OptIn(DelicateCoroutinesApi::class)` を使用して `GlobalScope` の使用を明示的にオプトインする必要があります。
>
{style="note"}

```kotlin
// somethingUsefulOneAsync の戻り値の型は Deferred<Int> です
@OptIn(DelicateCoroutinesApi::class)
fun somethingUsefulOneAsync() = GlobalScope.async {
    doSomethingUsefulOne()
}

// somethingUsefulTwoAsync の戻り値の型は Deferred<Int> です
@OptIn(DelicateCoroutinesApi::class)
fun somethingUsefulTwoAsync() = GlobalScope.async {
    doSomethingUsefulTwo()
}
```

これらの `xxxAsync` 関数は *中断* 関数（suspending functions）では**ない**ことに注意してください。これらはどこからでも使用できます。しかし、これらを使用するということは、呼び出し元のコードとそれらのアクションが非同期（ここでは *並行* を意味します）に実行されることを常に含意します。
 
以下の例は、コルーチンの外での使用方法を示しています：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

//sampleStart
// この例では main の右側に `runBlocking` がないことに注意してください
fun main() {
    val time = measureTimeMillis {
        // 非同期アクションはコルーチンの外で開始できます
        val one = somethingUsefulOneAsync()
        val two = somethingUsefulTwoAsync()
        // しかし、結果を待つには中断するかブロックするかのどちらかが必要です。
        // ここでは `runBlocking { ... }` を使用して、結果を待つ間メインスレッドをブロックします
        runBlocking {
            println("The answer is ${one.await() + two.await()}")
        }
    }
    println("Completed in $time ms")
}
//sampleEnd

@OptIn(DelicateCoroutinesApi::class)
fun somethingUsefulOneAsync() = GlobalScope.async {
    doSomethingUsefulOne()
}

@OptIn(DelicateCoroutinesApi::class)
fun somethingUsefulTwoAsync() = GlobalScope.async {
    doSomethingUsefulTwo()
}

suspend fun doSomethingUsefulOne(): Int {
    delay(1000L) // ここで何か役立つことをしているふりをします
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // ここでも何か役立つことをしているふりをします
    return 29
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-compose-04.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-compose-04.kt) から入手できます。
>
{style="note"}

<!--- TEST ARBITRARY_TIME
The answer is 42
Completed in 1085 ms
-->

もし `val one = somethingUsefulOneAsync()` の行と `one.await()` 式の間にコードの論理エラーがあり、プログラムが例外をスローして実行中の操作が中断された場合に何が起こるか考えてみてください。通常、グローバルなエラーハンドラーがこの例外をキャッチし、ログを記録して開発者にエラーを報告できますが、プログラムは他の操作を続行できます。しかし、ここでは、それを開始した操作が中断されたにもかかわらず、`somethingUsefulOneAsync` はバックグラウンドで実行されたままになります。この問題は、次のセクションで示すように、構造化された並行性を使用すれば発生しません。

## async を使用した構造化された並行性 {id="structured-concurrency-with-async"}

[async を使用した並行実行](#concurrent-using-async) の例を、`doSomethingUsefulOne` と `doSomethingUsefulTwo` を並行して実行し、その結果を合計して返す関数にリファクタリングしてみましょう。[async] は [CoroutineScope] の拡張関数であるため、[coroutineScope][_coroutineScope] 関数を使用して必要なスコープを提供します：

```kotlin
suspend fun concurrentSum(): Int = coroutineScope {
    val one = async { doSomethingUsefulOne() }
    val two = async { doSomethingUsefulTwo() }
    one.await() + two.await()
}
```

このようにすれば、`concurrentSum` 関数のコード内で何か問題が発生して例外がスローされた場合、そのスコープ内で開始されたすべてのコルーチンがキャンセルされます。

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

fun main() = runBlocking<Unit> {
//sampleStart
    val time = measureTimeMillis {
        println("The answer is ${concurrentSum()}")
    }
    println("Completed in $time ms")
//sampleEnd    
}

suspend fun concurrentSum(): Int = coroutineScope {
    val one = async { doSomethingUsefulOne() }
    val two = async { doSomethingUsefulTwo() }
    one.await() + two.await()
}

suspend fun doSomethingUsefulOne(): Int {
    delay(1000L) // ここで何か役立つことをしているふりをします
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // ここでも何か役立つことをしているふりをします
    return 29
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-compose-05.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-compose-05.kt) から入手できます。
>
{style="note"}

上記の `main` 関数の出力から明らかなように、依然として両方の操作は並行して実行されます： 

```text
The answer is 42
Completed in 1017 ms
```

<!--- TEST ARBITRARY_TIME -->

キャンセルは常にコルーチンの階層を通じて伝播されます：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
    try {
        failedConcurrentSum()
    } catch(e: ArithmeticException) {
        println("Computation failed with ArithmeticException")
    }
}

suspend fun failedConcurrentSum(): Int = coroutineScope {
    val one = async<Int> { 
        try {
            delay(Long.MAX_VALUE) // 非常に長い計算をエミュレートします
            42
        } finally {
            println("First child was cancelled")
        }
    }
    val two = async<Int> { 
        println("Second child throws an exception")
        throw ArithmeticException()
    }
    one.await() + two.await()
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-compose-06.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-compose-06.kt) から入手できます。
>
{style="note"}

子のうちの1つ（具体的には `two`）が失敗したときに、最初の `async` と待機中の親の両方がどのようにキャンセルされるかに注目してください：
```text
Second child throws an exception
First child was cancelled
Computation failed with ArithmeticException
```

<!--- TEST -->

<!--- MODULE kotlinx-coroutines-core -->
<!--- INDEX kotlinx.coroutines -->

[async]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html
[launch]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html
[Job]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/index.html
[Deferred]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-deferred/index.html
[CoroutineStart.LAZY]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-start/-l-a-z-y/index.html
[Deferred.await]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-deferred/await.html
[Job.start]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/start.html
[GlobalScope]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-global-scope/index.html
[CoroutineScope]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/index.html
[_coroutineScope]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/coroutine-scope.html

<!--- END -->