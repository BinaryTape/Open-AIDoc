<!--- TEST_NAME ComposingGuideTest -->
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 組合掛起函式)

本節涵蓋了組合掛起函式的各種方法。

## 預設為順序執行 {id="sequential-by-default"}

假設我們有兩個在別處定義的掛起函式，它們執行一些有用的操作，例如某種遠端服務呼叫或計算。我們假裝它們是有用的，但實際上在本範例中，每個函式只是延遲了一秒鐘：

```kotlin
suspend fun doSomethingUsefulOne(): Int {
    delay(1000L) // 假設我們在此處執行一些有用的操作
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // 假設我們在此處也執行一些有用的操作
    return 29
}
```

如果我們需要它們被 _依序_（sequentially）叫用 &mdash; 先執行 `doSomethingUsefulOne` _然後_ 執行 `doSomethingUsefulTwo`，並計算它們結果的總和，我們該怎麼做？
在實務中，如果我們需要根據第一個函式的結果來決定是否需要叫用第二個函式，或者決定如何叫用它，我們就會這樣做。

我們使用正常的順序叫用，因為協同程式中的程式碼與普通程式碼一樣，預設是 _順序執行_ 的。以下範例透過測量執行這兩個掛起函式所需的總時間來演示這一點：

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
    delay(1000L) // 假設我們在此處執行一些有用的操作
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // 假設我們在此處也執行一些有用的操作
    return 29
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-compose-01.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-compose-01.kt)獲取完整程式碼。
>
{style="note"}

它會產生類似這樣的輸出：

```text
The answer is 42
Completed in 2017 ms
```

<!--- TEST ARBITRARY_TIME -->

## 使用 async 進行並行 {id="concurrent-using-async"}

如果 `doSomethingUsefulOne` 和 `doSomethingUsefulTwo` 的叫用之間沒有相依性，且我們希望透過 _並行_（concurrently）執行這兩者來更快獲得答案，該怎麼辦？這就是 [async] 可以提供協助的地方。

從概念上講，[async] 就像 [launch]。它啟動一個獨立的協同程式，這是一個輕量級執行緒，可與所有其他協同程式並行運作。不同之處在於 `launch` 回傳一個 [Job]，且不帶有任何結果值，而 `async` 回傳一個 [Deferred] &mdash; 一個輕量級的非阻塞 future，代表了稍後提供結果的承諾。您可以對 deferred 值使用 `.await()` 來獲取其最終結果，但 `Deferred` 也是一個 `Job`，因此您可以根據需要取消它。

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
    delay(1000L) // 假設我們在此處執行一些有用的操作
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // 假設我們在此處也執行一些有用的操作
    return 29
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-compose-02.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-compose-02.kt)獲取完整程式碼。
>
{style="note"}

它會產生類似這樣的輸出：

```text
The answer is 42
Completed in 1017 ms
```

<!--- TEST ARBITRARY_TIME -->

這快了兩倍，因為這兩個協同程式是並行執行的。
請注意，協同程式的並行執行始終是顯式的。

## 延遲啟動的 async {id="lazily-started-async"}

（選用）透過將 `start` 參數設定為 [CoroutineStart.LAZY]，可以使 [async] 變為延遲執行。在此模式下，它僅在 [await][Deferred.await] 需要其結果時，或者叫用了其 `Job` 的 [start][Job.start] 函式時，才會啟動協同程式。執行以下範例：

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

fun main() = runBlocking<Unit> {
//sampleStart
    val time = measureTimeMillis {
        val one = async(start = CoroutineStart.LAZY) { doSomethingUsefulOne() }
        val two = async(start = CoroutineStart.LAZY) { doSomethingUsefulTwo() }
        // 一些計算
        one.start() // 啟動第一個
        two.start() // 啟動第二個
        println("The answer is ${one.await() + two.await()}")
    }
    println("Completed in $time ms")
//sampleEnd    
}

suspend fun doSomethingUsefulOne(): Int {
    delay(1000L) // 假設我們在此處執行一些有用的操作
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // 假設我們在此處也執行一些有用的操作
    return 29
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-compose-03.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-compose-03.kt)獲取完整程式碼。
>
{style="note"}

它會產生類似這樣的輸出：

```text
The answer is 42
Completed in 1017 ms
```

<!--- TEST ARBITRARY_TIME -->

因此，這裡定義了兩個協同程式，但與前一個範例不同，它們並未立即執行，而是由程式設計師透過呼叫 [start][Job.start] 來控制具體何時開始執行。我們首先啟動 `one`，然後啟動 `two`，最後等待各個協同程式完成。

請注意，如果我們只是在 `println` 中呼叫 [await][Deferred.await]，而沒有先對各個協同程式呼叫 [start][Job.start]，這將導致順序行為，因為 [await][Deferred.await] 會啟動協同程式執行並等待其完成，這並非延遲啟動（laziness）的預期使用案例。
`async(start = CoroutineStart.LAZY)` 的使用案例是在計算值涉及掛起函式時，作為標準 [lazy](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/lazy.html) 函式的替代方案。

## Async 風格的函式 {id="async-style-functions"}

> 此處提供使用 async 函式的程式設計風格僅用於說明，因為這在其他程式語言中是一種流行的風格。強烈**不建議**在 Kotlin 協同程式中使用此風格，原因如下所述。
>
{style="note"}

我們可以定義 async 風格的函式，使用 [async] 協同程式產生器來 _非同步地_ 叫用 `doSomethingUsefulOne` 和 `doSomethingUsefulTwo`，並使用 [GlobalScope] 參照來脫離結構化並行。
我們為這類函式命名時加上 "...Async" 後綴，以強調它們僅啟動非同步計算，且需要使用產生的 deferred 值來獲取結果。

> [GlobalScope] 是一個精細的 API，可能會以非顯而易見的方式產生負面影響，其中之一將在下文說明，因此您必須使用 `@OptIn(DelicateCoroutinesApi::class)` 顯式選擇使用 `GlobalScope`。
>
{style="note"}

```kotlin
// somethingUsefulOneAsync 的回傳型別為 Deferred<Int>
@OptIn(DelicateCoroutinesApi::class)
fun somethingUsefulOneAsync() = GlobalScope.async {
    doSomethingUsefulOne()
}

// somethingUsefulTwoAsync 的回傳型別為 Deferred<Int>
@OptIn(DelicateCoroutinesApi::class)
fun somethingUsefulTwoAsync() = GlobalScope.async {
    doSomethingUsefulTwo()
}
```

請注意，這些 `xxxAsync` 函式**不是** _掛起_ 函式。它們可以在任何地方使用。然而，使用它們始終意味著它們的操作與叫用程式碼之間是非同步（在此指並行）執行的。
 
以下範例顯示了它們在協同程式之外的使用：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

//sampleStart
// 請注意，此範例中 main 的右側沒有 `runBlocking`
fun main() {
    val time = measureTimeMillis {
        // 我們可以在協同程式之外發起非同步操作
        val one = somethingUsefulOneAsync()
        val two = somethingUsefulTwoAsync()
        // 但等待結果必須涉及掛起或阻塞。
        // 在這裡，我們使用 `runBlocking { ... }` 來阻塞主執行緒以等待結果
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
    delay(1000L) // 假設我們在此處執行一些有用的操作
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // 假設我們在此處也執行一些有用的操作
    return 29
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-compose-04.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-compose-04.kt)獲取完整程式碼。
>
{style="note"}

<!--- TEST ARBITRARY_TIME
The answer is 42
Completed in 1085 ms
-->

思考一下，如果在 `val one = somethingUsefulOneAsync()` 這一行與 `one.await()` 運算式之間，程式碼中出現了一些邏輯錯誤，程式拋出了例外，且程式正在執行的操作中止了。
通常情況下，全域錯誤處理器可以擷取此例外，為開發人員記錄並回報錯誤，但程式在其他方面可以繼續執行其他操作。然而，在這裡，儘管啟動它的操作已經中止，`somethingUsefulOneAsync` 仍然在背景執行。這種問題在結構化並行中不會發生，如下一節所示。

## 使用 async 的結構化並行 {id="structured-concurrency-with-async"}

讓我們將[使用 async 進行並行](#concurrent-using-async)範例重構為一個函式，該函式並行執行 `doSomethingUsefulOne` 和 `doSomethingUsefulTwo` 並回傳它們的組合結果。
由於 [async] 是 [CoroutineScope] 擴充，我們將使用 [coroutineScope][_coroutineScope] 函式來提供必要的範圍：

```kotlin
suspend fun concurrentSum(): Int = coroutineScope {
    val one = async { doSomethingUsefulOne() }
    val two = async { doSomethingUsefulTwo() }
    one.await() + two.await()
}
```

這樣，如果 `concurrentSum` 函式的程式碼內部發生錯誤並拋出例外，則在其範圍內啟動的所有協同程式都將被取消。

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
    delay(1000L) // 假設我們在此處執行一些有用的操作
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // 假設我們在此處也執行一些有用的操作
    return 29
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-compose-05.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-compose-05.kt)獲取完整程式碼。
>
{style="note"}

從上述 `main` 函式的輸出可以明顯看出，這兩個操作仍然是並行執行的：

```text
The answer is 42
Completed in 1017 ms
```

<!--- TEST ARBITRARY_TIME -->

取消（Cancellation）始終透過協同程式階層結構傳遞：

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
            delay(Long.MAX_VALUE) // 模擬非常長的計算
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
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-compose-06.kt)獲取完整程式碼。
>
{style="note"}

請注意，當其中一個子項（即 `two`）失敗時，第一個 `async` 及其等待中的父項都會被取消：
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