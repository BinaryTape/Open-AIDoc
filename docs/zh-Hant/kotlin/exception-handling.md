<!--- TEST_NAME ExceptionsGuideTest -->
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 協程例外處理)

本節涵蓋例外處理以及因例外而起的取消。
我們已經知道，已取消的協程會在懸掛點 (suspension points) 拋出 [CancellationException]，且該例外會被協程機制忽略。這裡我們來看看如果在取消期間拋出例外，或是同一個協程的多個子協程拋出例外會發生什麼事。

## 例外傳播 (Exception propagation)

協程產生器 (Coroutine builders) 分為兩類：自動傳播例外 ([launch]) 或向使用者公開例外 ([async] 與 [produce])。
當這些產生器用於建立一個 *根 (root)* 協程（即不是另一個協程的 *子* 協程）時，前者將例外視為 **未捕獲 (uncaught)** 例外，類似於 Java 的 `Thread.uncaughtExceptionHandler`；而後者則依賴使用者來取用最終的例外，例如透過 [await][Deferred.await] 或 [receive][ReceiveChannel.receive]（[produce] 與 [receive][ReceiveChannel.receive] 在 [通道 (Channels)](https://github.com/Kotlin/kotlinx.coroutines/blob/master/docs/channels.md) 章節中介紹）。

這可以透過一個使用 [GlobalScope] 建立根協程的簡單範例來示範：

> [GlobalScope] 是一個微妙的 API，可能會以非預期的方式產生負面影響。為整個應用程式建立根協程是 `GlobalScope` 少數合法的用法之一，因此你必須使用 `@OptIn(DelicateCoroutinesApi::class)` 明確選擇加入使用 `GlobalScope`。
>
{style="note"}

```kotlin
import kotlinx.coroutines.*

//sampleStart
@OptIn(DelicateCoroutinesApi::class)
fun main() = runBlocking {
    val job = GlobalScope.launch { // 使用 launch 的根協程
        println("Throwing exception from launch")
        throw IndexOutOfBoundsException() // 將由 Thread.defaultUncaughtExceptionHandler 列印到主控台
    }
    job.join()
    println("Joined failed job")
    val deferred = GlobalScope.async { // 使用 async 的根協程
        println("Throwing exception from async")
        throw ArithmeticException() // 不會列印任何內容，依賴使用者呼叫 await
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
> 你可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-exceptions-01.kt)取得完整程式碼。
>
{style="note"}

此程式碼的輸出為（搭配 [偵錯 (debug)](https://github.com/Kotlin/kotlinx.coroutines/blob/master/docs/coroutine-context-and-dispatchers.md#debugging-coroutines-and-threads)）：

```text
Throwing exception from launch
Exception in thread "DefaultDispatcher-worker-1 @coroutine#2" java.lang.IndexOutOfBoundsException
Joined failed job
Throwing exception from async
Caught ArithmeticException
```

<!--- TEST EXCEPTION-->

## CoroutineExceptionHandler

可以自訂將 **未捕獲** 例外列印到主控台的預設行為。
*根* 協程上的 [CoroutineExceptionHandler] 上下文元素可用於此根協程及其所有子協程的通用 `catch` 區塊，並在其中進行自訂例外處理。
它類似於 [`Thread.uncaughtExceptionHandler`](https://docs.oracle.com/javase/8/docs/api/java/lang/Thread.html#setUncaughtExceptionHandler-java.lang.Thread.UncaughtExceptionHandler-)。
你無法在 `CoroutineExceptionHandler` 中從例外中恢復。當處理常式被呼叫時，協程已經帶著對應的例外完成了。通常，處理常式用於記錄例外、顯示某種錯誤訊息、終止及/或重啟應用程式。

`CoroutineExceptionHandler` 僅在 **未捕獲** 例外（即未以任何其他方式處理的例外）上被叫用。
特別是，所有 *子* 協程（在另一個 [Job] 的上下文中建立的協程）都會將其例外的處理委派給其父協程，父協程也會委派給其父協程，依此類推直到根協程，因此安裝在它們上下文中的 `CoroutineExceptionHandler` 永遠不會被使用。 
此外， [async] 產生器總是會捕獲所有例外並將其呈現在產生的 [Deferred] 物件中，因此它的 `CoroutineExceptionHandler` 也沒有作用。

> 在監督作用域 (supervision scope) 中執行的協程不會將例外傳播給其父協程，因此不受此規則約束。本文後續的 [監督 (Supervision)](#supervision) 章節提供了更多細節。
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
    val job = GlobalScope.launch(handler) { // 根協程，在 GlobalScope 中執行
        throw AssertionError()
    }
    val deferred = GlobalScope.async(handler) { // 同樣是根協程，但使用 async 而非 launch
        throw ArithmeticException() // 不會列印任何內容，依賴使用者呼叫 deferred.await()
    }
    joinAll(job, deferred)
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-exceptions-02.kt -->
> 你可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-exceptions-02.kt)取得完整程式碼。
>
{style="note"}

此程式碼的輸出為：

```text
CoroutineExceptionHandler got java.lang.AssertionError
```

<!--- TEST-->

## 取消與例外 (Cancellation and exceptions)

取消與例外密切相關。協程內部使用 `CancellationException` 進行取消，這些例外會被所有處理常式忽略，因此它們應僅作為額外偵錯資訊的來源（可透過 `catch` 區塊取得）。
當使用 [Job.cancel] 取消協程時，它會終止，但不會取消其父協程。

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
> 你可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-exceptions-03.kt)取得完整程式碼。
>
{style="note"}

此程式碼的輸出為：

```text
Cancelling child
Child is cancelled
Parent is not cancelled
```

<!--- TEST-->

如果協程遇到 `CancellationException` 以外的例外，它會使用該例外取消其父協程。 
此行為無法被覆寫，並用於為 [結構化並行 (structured concurrency)](https://github.com/Kotlin/kotlinx.coroutines/blob/master/docs/composing-suspending-functions.md#structured-concurrency-with-async) 提供穩定的協程階層結構。
子協程不使用 [CoroutineExceptionHandler] 實作。

> 在這些範例中， [CoroutineExceptionHandler] 總是安裝在於 [GlobalScope] 中建立的協程上。將例外處理常式安裝在於主 [runBlocking] 作用域中啟動的協程上是沒有意義的，因為儘管安裝了處理常式，但當其子協程因例外完成時，主協程總是被取消。
>
{style="note"}

原始例外僅在父協程的所有子協程都終止後，才會由父協程處理，如下列範例所示。

```kotlin
import kotlinx.coroutines.*

@OptIn(DelicateCoroutinesApi::class)
fun main() = runBlocking {
//sampleStart
    val handler = CoroutineExceptionHandler { _, exception -> 
        println("CoroutineExceptionHandler got $exception") 
    }
    val job = GlobalScope.launch(handler) {
        launch { // 第一個子協程
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
        launch { // 第二個子協程
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
> 你可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-exceptions-04.kt)取得完整程式碼。
>
{style="note"}

此程式碼的輸出為：

```text
Second child throws an exception
Children are cancelled, but exception is not handled until all children terminate
The first child finished its non cancellable block
CoroutineExceptionHandler got java.lang.ArithmeticException
```

<!--- TEST-->

## 例外聚合 (Exceptions aggregation)

當一個協程的多個子協程因例外失敗時，一般規則是「第一個例外獲勝」，因此第一個例外會被處理。
第一個例外之後發生的所有額外例外都會作為被抑制 (suppressed) 的例外附加到第一個例外上。 

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
                delay(Long.MAX_VALUE) // 當另一個同級協程因 IOException 失敗時，它會被取消
            } finally {
                throw ArithmeticException() // 第二個例外
            }
        }
        launch {
            delay(100)
            throw IOException() // 第一個例外
        }
        delay(Long.MAX_VALUE)
    }
    job.join()  
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-exceptions-05.kt -->
> 你可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-exceptions-05.kt)取得完整程式碼。
>
{style="note"}

此程式碼的輸出為：

```text
CoroutineExceptionHandler got java.io.IOException with suppressed [java.lang.ArithmeticException]
```

<!--- TEST-->

> 請注意，此機制目前僅在 Java 1.7+ 版本上運作。 
> JS 和 Native 的限制是暫時的，未來將會解除。
>
{style="note"}

取消例外是透明的，且預設會被解包 (unwrapped)：

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
        val innerJob = launch { // 這整個協程堆疊都將被取消
            launch {
                launch {
                    throw IOException() // 原始例外
                }
            }
        }
        try {
            innerJob.join()
        } catch (e: CancellationException) {
            println("Rethrowing CancellationException with original cause")
            throw e // 重新拋出取消例外，但原始的 IOException 仍會到達處理常式  
        }
    }
    job.join()
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-exceptions-06.kt -->
> 你可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-exceptions-06.kt)取得完整程式碼。
>
{style="note"}

此程式碼的輸出為：

```text
Rethrowing CancellationException with original cause
CoroutineExceptionHandler got java.io.IOException
```

<!--- TEST-->

## 監督 (Supervision)

如前所述，取消是一種在整個協程階層中傳播的雙向關係。讓我們來看看需要單向取消傳播的情況。 

這種需求的一個好例子是其作用域中定義了 Job 的 UI 元件。如果 UI 的任何子任務失敗，並不總是需要取消（實際上是終止）整個 UI 元件；但如果 UI 元件被銷毀（且其 Job 被取消），則必須取消所有子 Job，因為它們的結果已不再需要。

另一個例子是衍生多個子 Job 的伺服器處理程序，它需要 *監督* 它們的執行、追蹤它們的失敗，並且只重啟失敗的 Job。

### 監督 Job (Supervision job)

[SupervisorJob][SupervisorJob()] 可用於這些目的。 
它類似於一般的 [Job][Job()]，唯一的例外是取消僅向**下**傳播。這可以透過下列範例輕鬆示範：

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
//sampleStart
    val supervisor = SupervisorJob()
    with(CoroutineScope(coroutineContext + supervisor)) {
        // 啟動第一個子協程 —— 在此範例中忽略其例外（實務上請勿這樣做！）
        val firstChild = launch(CoroutineExceptionHandler { _, _ ->  }) {
            println("The first child is failing")
            throw AssertionError("The first child is cancelled")
        }
        // 啟動第二個子協程
        val secondChild = launch {
            firstChild.join()
            // 第一個子協程的取消不會傳播給第二個子協程
            println("The first child is cancelled: ${firstChild.isCancelled}, but the second one is still active")
            try {
                delay(Long.MAX_VALUE)
            } finally {
                // 但監督者的取消會傳播
                println("The second child is cancelled because the supervisor was cancelled")
            }
        }
        // 等待第一個子協程失敗並完成
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
> 你可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-supervision-01.kt)取得完整程式碼。
>
{style="note"}

此程式碼的輸出為：

```text
The first child is failing
The first child is cancelled: true, but the second one is still active
Cancelling the supervisor
The second child is cancelled because the supervisor was cancelled
```

<!--- TEST-->

### 監督作用域 (Supervision scope)

我們可以使用 [supervisorScope][_supervisorScope] 來代替 [coroutineScope][_coroutineScope] 進行 *限定作用域* 的並行。它僅向一個方向傳播取消，並且只有在自身失敗時才會取消所有子協程。它也會像 [coroutineScope][_coroutineScope] 一樣，在完成前等待所有子協程。

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
            // 透過 yield 給予子協程執行並列印的機會 
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
> 你可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-supervision-02.kt)取得完整程式碼。
>
{style="note"}

此程式碼的輸出為：

```text
The child is sleeping
Throwing an exception from the scope
The child is cancelled
Caught an assertion error
```

<!--- TEST-->

#### 監督協程中的例外 (Exceptions in supervised coroutines)

常規 Job 與監督 Job (supervisor jobs) 之間的另一個關鍵區別是例外處理。
每個子協程都應透過例外處理機制自行處理其例外。
這種區別源於子協程的失敗不會傳播給父協程。
這意味著直接在 [supervisorScope][_supervisorScope] 內啟動的協程 *確實* 會以與根協程相同的方式使用安裝在其作用域中的 [CoroutineExceptionHandler]（詳見 [CoroutineExceptionHandler](#coroutineexceptionhandler) 章節）。 

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
> 你可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-supervision-03.kt)取得完整程式碼。
>
{style="note"}

此程式碼的輸出為：

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