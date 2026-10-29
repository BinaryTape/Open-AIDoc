<!--- TEST_NAME SharedStateGuideTest -->
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 共有される可変状態と並行性)

コルーチンは、[Dispatchers.Default] のようなマルチスレッドディスパッチャを使用して並列に実行できます。これにより、通常の並列処理におけるあらゆる問題が発生します。主な問題は、**共有される可変状態（shared mutable state）**へのアクセスの同期です。
コルーチンの世界におけるこの問題への解決策の中には、マルチスレッドの世界での解決策に似たものもありますが、コルーチン特有のものもあります。

## 問題点 {id="the-problem"}

100個のコルーチンを起動し、それぞれが同じアクションを1000回実行するようにしてみましょう。
また、後で比較するために、それらの完了時間も測定します：

```kotlin
suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 起動するコルーチンの数
    val k = 1000 // 各コルーチンがアクションを繰り返す回数
    val time = measureTimeMillis {
        coroutineScope { // コルーチンのスコープ
            repeat(n) {
                launch {
                    repeat(k) { action() }
                }
            }
        }
    }
    println("Completed ${n * k} actions in $time ms")    
}
```

まずは、マルチスレッドの [Dispatchers.Default] を使用して、共有された可変変数をインクリメントする非常にシンプルなアクションから始めます。

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*    

suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 起動するコルーチンの数
    val k = 1000 // 各コルーチンがアクションを繰り返す回数
    val time = measureTimeMillis {
        coroutineScope { // コルーチンのスコープ
            repeat(n) {
                launch {
                    repeat(k) { action() }
                }
            }
        }
    }
    println("Completed ${n * k} actions in $time ms")    
}

//sampleStart
var counter = 0

fun main() = runBlocking {
    withContext(Dispatchers.Default) {
        massiveRun {
            counter++
        }
    }
    println("Counter = $counter")
}
//sampleEnd    
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-sync-01.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-sync-01.kt) から入手できます。
>
{style="note"}

<!--- TEST LINES_START
Completed 100000 actions in
Counter =
-->

最後に何が出力されるでしょうか？ 「Counter = 100000」と出力されることはまずありません。なぜなら、100個のコルーチンが、何の同期もなしに複数のスレッドから同時に `counter` をインクリメントしているからです。

## Volatile は役に立ちません {id="volatiles-are-of-no-help"}

変数を `volatile` にすれば並行性の問題が解決するというよくある誤解があります。試してみましょう：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 起動するコルーチンの数
    val k = 1000 // 各コルーチンがアクションを繰り返す回数
    val time = measureTimeMillis {
        coroutineScope { // コルーチンのスコープ
            repeat(n) {
                launch {
                    repeat(k) { action() }
                }
            }
        }
    }
    println("Completed ${n * k} actions in $time ms")    
}

//sampleStart
@Volatile // Kotlinでは `volatile` はアノテーションです 
var counter = 0

fun main() = runBlocking {
    withContext(Dispatchers.Default) {
        massiveRun {
            counter++
        }
    }
    println("Counter = $counter")
}
//sampleEnd    
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-sync-02.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-sync-02.kt) から入手できます。
>
{style="note"}

<!--- TEST LINES_START
Completed 100000 actions in
Counter =
-->

このコードは動作が遅くなりますが、それでも最後に必ずしも「Counter = 100000」が得られるわけではありません。なぜなら、volatile 変数は対応する変数への線形化可能（linearizable、これは「アトミック」を意味する技術用語です）な読み書きを保証しますが、より大きなアクション（今回の場合はインクリメント）の原子性は提供しないからです。

## スレッドセーフなデータ構造 {id="thread-safe-data-structures"}

スレッドとコルーチンの両方で機能する一般的な解決策は、共有状態に対して実行する必要がある操作に必要なすべての同期を提供する、スレッドセーフ（別名：同期済み、線形化可能、またはアトミック）なデータ構造を使用することです。
単純なカウンタの場合、アトミックな `incrementAndGet` 操作を持つ `AtomicInteger` クラスを使用できます。

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import java.util.concurrent.atomic.*
import kotlin.system.*

suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 起動するコルーチンの数
    val k = 1000 // 各コルーチンがアクションを繰り返す回数
    val time = measureTimeMillis {
        coroutineScope { // コルーチンのスコープ
            repeat(n) {
                launch {
                    repeat(k) { action() }
                }
            }
        }
    }
    println("Completed ${n * k} actions in $time ms")    
}

//sampleStart
val counter = AtomicInteger()

fun main() = runBlocking {
    withContext(Dispatchers.Default) {
        massiveRun {
            counter.incrementAndGet()
        }
    }
    println("Counter = $counter")
}
//sampleEnd    
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-sync-03.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-sync-03.kt) から入手できます。
>
{style="note"}

<!--- TEST ARBITRARY_TIME
Completed 100000 actions in xxx ms
Counter = 100000
-->

これは、この特定の問題に対して最も速い解決策です。これは、プレーンなカウンタ、コレクション、キュー、およびその他の標準的なデータ構造と、それらに対する基本的な操作に対して機能します。しかし、複雑な状態や、すぐに使えるスレッドセーフな実装がない複雑な操作に拡張するのは容易ではありません。

## スレッド閉じ込め（きめ細かな粒度） {id="thread-confinement-fine-grained"}

「スレッド閉じ込め（Thread confinement）」は、特定の共有状態へのすべてのアクセスを単一のスレッドに限定するという、共有される可変状態の問題へのアプローチです。これは通常、すべての UI 状態が単一のイベントディスパッチ/アプリケーションスレッドに限定される UI アプリケーションで使用されます。コルーチンでは、単一スレッドのコンテキストを使用することで簡単に適用できます。

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 起動するコルーチンの数
    val k = 1000 // 各コルーチンがアクションを繰り返す回数
    val time = measureTimeMillis {
        coroutineScope { // コルーチンのスコープ
            repeat(n) {
                launch {
                    repeat(k) { action() }
                }
            }
        }
    }
    println("Completed ${n * k} actions in $time ms")    
}

//sampleStart
val counterContext = newSingleThreadContext("CounterContext")
var counter = 0

fun main() = runBlocking {
    withContext(Dispatchers.Default) {
        massiveRun {
            // 個々のインクリメントを単一スレッドのコンテキストに閉じ込める
            withContext(counterContext) {
                counter++
            }
        }
    }
    println("Counter = $counter")
}
//sampleEnd      
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-sync-04.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-sync-04.kt) から入手できます。
>
{style="note"}

<!--- TEST ARBITRARY_TIME
Completed 100000 actions in xxx ms
Counter = 100000
-->

このコードは非常に低速で動作します。なぜなら、「きめ細かな（fine-grained）」スレッド閉じ込めを行っているからです。個々のインクリメントごとに、[withContext(counterContext)][withContext] ブロックを使用して、マルチスレッドの [Dispatchers.Default] コンテキストから単一スレッドのコンテキストへの切り替えが発生します。

## スレッド閉じ込め（大きな粒度） {id="thread-confinement-coarse-grained"}

実際には、スレッド閉じ込めは大きな塊で行われます。例えば、状態を更新するビジネスロジックの大きな断片を単一のスレッドに閉じ込めます。次の例では、最初から各コルーチンを単一スレッドのコンテキストで実行することで、そのようにしています。

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 起動するコルーチンの数
    val k = 1000 // 各コルーチンがアクションを繰り返す回数
    val time = measureTimeMillis {
        coroutineScope { // コルーチンのスコープ
            repeat(n) {
                launch {
                    repeat(k) { action() }
                }
            }
        }
    }
    println("Completed ${n * k} actions in $time ms")    
}

//sampleStart
val counterContext = newSingleThreadContext("CounterContext")
var counter = 0

fun main() = runBlocking {
    // すべてを単一スレッドのコンテキストに閉じ込める
    withContext(counterContext) {
        massiveRun {
            counter++
        }
    }
    println("Counter = $counter")
}
//sampleEnd     
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-sync-05.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-sync-05.kt) から入手できます。
>
{style="note"}

<!--- TEST ARBITRARY_TIME
Completed 100000 actions in xxx ms
Counter = 100000
-->

今度ははるかに速く動作し、正しい結果が得られます。

## 相互排他 {id="mutual-exclusion"}

この問題に対する相互排他（Mutual exclusion）の解決策は、共有状態のすべての変更を、決して同時に実行されない「クリティカルセクション」で保護することです。ブロッキングの世界では、通常そのために `synchronized` や `ReentrantLock` を使用します。
コルーチンの代替案は [Mutex] と呼ばれます。これにはクリティカルセクションを区切るための [lock][Mutex.lock] 関数と [unlock][Mutex.unlock] 関数があります。主な違いは、`Mutex.lock()` は中断関数（suspending function）であるということです。これはスレッドをブロックしません。

また、`mutex.lock(); try { ... } finally { mutex.unlock() }` パターンを便利に表現する [withLock] 拡張関数もあります：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.sync.*
import kotlin.system.*

suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 起動するコルーチンの数
    val k = 1000 // 各コルーチンがアクションを繰り返す回数
    val time = measureTimeMillis {
        coroutineScope { // コルーチンのスコープ
            repeat(n) {
                launch {
                    repeat(k) { action() }
                }
            }
        }
    }
    println("Completed ${n * k} actions in $time ms")    
}

//sampleStart
val mutex = Mutex()
var counter = 0

fun main() = runBlocking {
    withContext(Dispatchers.Default) {
        massiveRun {
            // 各インクリメントをロックで保護する
            mutex.withLock {
                counter++
            }
        }
    }
    println("Counter = $counter")
}
//sampleEnd    
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-sync-06.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-sync-06.kt) から入手できます。
>
{style="note"}

<!--- TEST ARBITRARY_TIME
Completed 100000 actions in xxx ms
Counter = 100000
-->

この例のロックはきめ細かなものなので、コストがかかります。しかし、ある共有状態を定期的に変更する必要があるものの、その状態が閉じ込められる自然なスレッドが存在しないような状況では、良い選択肢となります。

<!--- MODULE kotlinx-coroutines-core -->
<!--- INDEX kotlinx.coroutines -->

[Dispatchers.Default]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-default.html
[withContext]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-context.html

<!--- INDEX kotlinx.coroutines.sync -->

[Mutex]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.sync/-mutex/index.html
[Mutex.lock]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.sync/-mutex/lock.html
[Mutex.unlock]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.sync/-mutex/unlock.html
[withLock]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.sync/with-lock.html

<!--- END -->