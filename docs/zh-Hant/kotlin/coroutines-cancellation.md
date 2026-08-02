<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 取消與逾時)

取消（Cancellation）讓您可以在協同程式完成之前請求停止它。
它會停止不再需要的任務，例如當協同程式仍在執行時，使用者關閉了視窗或在使用者介面中切換了頁面。

您可以使用取消來提早釋放資源，並防止協同程式在物件被處置（disposal）後繼續存取它們。
您也可以使用它來停止執行重複性工作的長時間執行協同程式，例如：

* 發送心跳訊號（heartbeats）。
* 執行排程任務。
* 更新狀態以反映最新讀取值，例如在時鐘 UI 中。

取消是透過 [`Job`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/) handle 運作的，它代表了協同程式的生命週期及其父子關係。
`Job` 允許您檢查協同程式是否處於啟動狀態，並允許您按照 [結構化並行](coroutines-basics.md#coroutine-scope-and-structured-concurrency) 的定義，將其及其子協同程式一併取消。

## 取消協同程式

當對協同程式的 `Job` handle 呼叫 [`cancel()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/cancel.html) 函式時，該協同程式就會被取消。
[協同程式建置器函式](coroutines-basics.md#coroutine-builder-functions)（如
[`.launch()`](coroutines-basics.md#coroutinescope-launch)）會傳回 `Job`。而 [`.async()`](coroutines-basics.md#coroutinescope-async)
函式則會傳回 [`Deferred`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-deferred/)，它實作了 `Job` 並支援相同的取消行為。

您可以手動呼叫 `cancel()` 函式，也可以在父協同程式被取消時，透過取消傳遞（cancellation propagation）自動觸發。

當協同程式被取消時，它會在下一次檢查取消狀態時拋出 [`CancellationException`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-cancellation-exception/)。
`kotlinx.coroutines` 程式庫中的掛起函式（例如 `delay()` 函式）在掛起時都會檢查取消狀態。

您可以使用 [`awaitCancellation()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/await-cancellation.html) 函式來掛起協同程式，直到它被取消。
這相當於呼叫 `delay(Duration.INFINITE)`。

> 如需了解協同程式如何以及何時檢查取消的詳細資訊，請參閱 [掛起點與取消](#suspension-points-and-cancellation)。
>
{style="tip"}

以下是手動取消協同程式的範例：

```kotlin
import kotlinx.coroutines.*

suspend fun main() {
//sampleStart
withContext(Dispatchers.Default) {
    // 用作協同程式已開始執行的訊號
    val childStarted = CompletableDeferred<Unit>()
    
    val childJob: Job = launch {
        println("The coroutine has started")

        // 完成 CompletableDeferred，
        // 發出協同程式已開始執行的訊號
        childStarted.complete(Unit)
        try {
            // 無限期掛起
            // 除非協同程式被取消，否則此呼叫永遠不會傳回
            awaitCancellation()
        } catch (e: CancellationException) {
            println("The coroutine was canceled: $e")
          
            // 務必重新拋出取消例外！
            throw e
        }
        println("This line will never be executed")
    }
  
    // 在取消協同程式之前等待其啟動
    childStarted.await()

    // 取消協同程式，
    // 因此 awaitCancellation() 會拋出 CancellationException
    childJob.cancel()
}
// 協同程式建置器（如 withContext() 或 coroutineScope()）
// 會等待所有子協同程式完成，
// 即使子協同程式已被取消
println("All coroutines have completed")
//sampleEnd
}
```
{kotlin-runnable="true" id="manual-cancellation-example"}

在此範例中，[`CompletableDeferred`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-completable-deferred/) 被用作協同程式已開始執行的訊號。
當協同程式開始執行時會呼叫 `complete()`，而 `await()` 僅在該 `CompletableDeferred` 完成後才會傳回。
取消協同程式並不一定需要此檢查，這裡包含它是為了確保協同程式在被取消之前已經啟動並印出訊息，從而使範例具備 [可重現的] 特性。

由於 `Deferred` 實作了 `Job`，因此對於透過 `async()` 協同程式建置器函式建立的協同程式，取消方式也是相同的：

```kotlin
val deferred = async { /* ... */ }
deferred.cancel()
```

> 擷取 `CancellationException` 可能會中斷取消傳遞。
> 如果您必須擷取它，請將其重新拋出，以便讓取消能正確地在協同程式階層中傳遞。
>
> 如需更多資訊，請參閱 [協同程式例外處理](exception-handling.md#cancellation-and-exceptions)。
>
{style="warning"}

### 取消傳遞

[結構化並行](coroutines-basics.md#coroutine-scope-and-structured-concurrency) 確保取消一個協同程式同時也會取消其所有子協同程式。
這可以防止子協同程式在父協同程式被取消後繼續執行任務。

範例如下：

```kotlin
import kotlinx.coroutines.*

suspend fun main() {
    withContext(Dispatchers.Default) {
//sampleStart
// 用作子協同程式已啟動的訊號
val childrenLaunched = CompletableDeferred<Unit>()

// 啟動兩個子協同程式
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
    // 完成 CompletableDeferred，
    // 發出子協同程式已啟動的訊號
    childrenLaunched.complete(Unit)
}
// 等待父協同程式發出已啟動
// 所有子協同程式的訊號
childrenLaunched.await()

// 取消父協同程式，這會取消其所有子協同程式
parentJob.cancel()
//sampleEnd
    }
}
```
{kotlin-runnable="true" id="cancellation-propagation-example"}

在此範例中，每個子協同程式都使用了 [`finally` 區塊](exceptions.md#the-finally-block)，因此當協同程式被取消時，其中的程式碼會執行。
在這裡，`CompletableDeferred` 發出子協同程式在被取消前已啟動的訊號，但不保證它們已經開始執行。
如果它們先被取消，則不會印出任何內容。

## 讓協同程式對取消做出反應 {id="cancellation-is-cooperative"}

在 Kotlin 中，協同程式的取消是 *協作式（cooperative）* 的。
協同程式只有在透過 [掛起](#suspension-points-and-cancellation) 或 [明確檢查取消狀態](#check-for-cancellation-explicitly) 進行協作時，才會對取消做出反應。

在本節中，您可以了解如何加入 [掛起點](#suspension-points-and-cancellation)（例如呼叫 [yield()](#the-yield-suspending-function) 函式），讓協同程式能對取消做出反應。

### 掛起點與取消

當協同程式被取消時，它會繼續執行，直到到達程式碼中可能掛起的位置，也稱為 *掛起點（suspension point）*。
如果協同程式在該處掛起，掛起函式會檢查它是否已被取消。
如果是，協同程式將停止並拋出 `CancellationException`。

呼叫 `suspend` 函式即為一個掛起點，但它並不總是會掛起。
例如，當等待 `Deferred` 結果時，只有在該 `Deferred` 尚未完成時，協同程式才會掛起。

以下是使用常見掛起函式的範例，這些函式會進行掛起，使協同程式能在被取消時進行檢查並停止：

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
            // 掛起直到被取消
            awaitCancellation()
        },
        launch {
            // 掛起直到被取消
            delay(Duration.INFINITE)
        },
        launch {
            val channel = Channel<Int>()
            // 掛起以等待一個永遠不會發送的值
            channel.receive()
        },
        launch {
            val deferred = CompletableDeferred<Int>()
            // 掛起以等待一個永遠不會完成的值
            deferred.await()
        },
        launch {
            val mutex = Mutex(locked = true)
            // 掛起以等待一個無限期保持鎖定狀態的 mutex
            mutex.lock()
        }
    )
    
    // 給予子協同程式啟動與掛起的時間
    delay(100.milliseconds)
    
    // 取消所有子協同程式
    childJobs.forEach { it.cancel() }
}
println("All child jobs completed!")
//sampleEnd
}
```
{kotlin-runnable="true" id="suspension-points-example"}

> `kotlinx.coroutines` 程式庫中的所有掛起函式都配合取消機制，因為它們內部使用了 [`suspendCancellableCoroutine()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/suspend-cancellable-coroutine.html)，該函式會在協同程式掛起時檢查取消狀態。
> 相較之下，使用 [`suspendCoroutine()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/suspend-coroutine.html) 的自訂掛起函式則不會對取消做出反應。
>
{style="tip"}

### `yield()` 掛起函式

如果協同程式不掛起，則在它完成之前，其他協同程式無法在同一個執行緒上執行。
因此，不掛起的協同程式會在該執行緒上循序執行。
如果協同程式長時間不掛起，它在被取消時也不會停止。

在 CPU 密集型計算或其他長時間執行且不掛起的程式碼中，請定期呼叫 [`yield()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/yield.html) 函式。
此函式會釋放目前執行緒，並讓其他協同程式有機會在上面執行。
它還能確保協同程式定期檢查取消狀態。如果協同程式被取消，`yield()` 函式會拋出 `CancellationException`。

![不含檢查、包含 `ensureActive()` 或 `isActive` 以及包含 `yield()` 的協同程式取消處理比較](yield-and-cancellation.svg)

範例如下：

```kotlin
import kotlinx.coroutines.*

fun main() {
//sampleStart
// runBlocking 使用目前執行緒來執行所有協同程式
runBlocking {
    val coroutineCount = 5
    repeat(coroutineCount) { coroutineIndex ->
        launch {
            val id = coroutineIndex + 1
            repeat(5) { iterationIndex ->
                val iteration = iterationIndex + 1
                // 暫時掛起以讓其他協同程式有機會執行
                // 若沒有這行，協同程式將循序執行
                yield()
                // 印出協同程式索引與疊代次數
                println("$id * $iteration = ${id * iteration}")
            }
        }
    }
}
//sampleEnd
}
```
{kotlin-runnable="true" id="yield-example"}

在此範例中，每個協同程式都使用 `yield()` 讓其他協同程式在疊代之間執行。

### 明確檢查取消狀態

您可以明確地檢查取消狀態，這讓長時間執行的程式碼能在不掛起的情況下對取消做出反應。
長時間執行且不掛起的協同程式可能會阻止同執行緒上的其他協同程式執行，直到它完成。
除非這種行為是您使用案例中有意為之，否則請改用 [`yield()`](#the-yield-suspending-function) 函式。

根據使用的 API，檢查會回傳布林值或拋出例外：

* 當協同程式被取消時，[`isActive`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/is-active.html) 屬性會傳回 `false`。
* 當協同程式被取消時，[`ensureActive()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/ensure-active.html) 函式會拋出 `CancellationException`。

### 當協同程式取消時中斷阻塞程式碼

在 JVM 上，某些阻塞函式（例如 `Thread.sleep()` 或 `BlockingQueue.take()`）會阻塞目前執行緒。
這些阻塞函式是可以被中斷的，這會使它們提早停止。
然而，當您從協同程式呼叫它們時，取消並不會中斷執行緒。

若要在取消協同程式時中斷執行緒，請將阻塞程式碼包裝在 [`runInterruptible()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/run-interruptible.html) 函式中：

```kotlin
import kotlinx.coroutines.*

suspend fun main() {
//sampleStart
withContext(Dispatchers.Default) {
    val childStarted = CompletableDeferred<Unit>()
    val childJob = launch {
        try {
            // 取消會觸發執行緒中斷
            runInterruptible {
                childStarted.complete(Unit)
                try {
                    // 阻塞目前執行緒很長一段時間
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

    // 取消協同程式並中斷執行 Thread.sleep() 的執行緒
    childJob.cancel()
}
//sampleEnd
}
```
{kotlin-runnable="true" id="interrupt-cancellation-example"}

## 在取消協同程式時安全地處理數值

當掛起的協同程式被取消時，它會以 `CancellationException` 恢復執行，而不是傳回任何值，即使這些值已經可用。
這種行為稱為 *立即取消（prompt cancellation）*。
它能防止您的程式碼在已取消的協同程式作用域中繼續執行，例如更新一個已經關閉的畫面。

範例如下：

```kotlin
// 定義一個使用 UI 執行緒的協同程式作用域
class ScreenWithButtons(private val scope: CoroutineScope) {
    fun loadAndUpdateButtons(filename: String) {
        scope.launch {
            // withContext() 在進入區塊前和區塊傳回後都會檢查取消狀態
            val buttonNames = withContext(Dispatchers.IO) {
                // 這是一個不會對取消做出反應的阻塞呼叫
                readLines(filename)
            }
            
            // 呼叫 updateUi() 是安全的
            // 因為如果協同程式被取消，withContext() 就不會傳回，
            // 且在此呼叫之前，UI 執行緒上執行的程式碼都無法處置按鈕
            updateUi(buttonNames)
        }
    }

    // 僅從 UI 執行緒呼叫此函式，因為它會存取按鈕
    // 如果在按鈕處置後呼叫，則會拋出例外
    private fun updateUi(buttonNames: List<String>) {
        // 更新指定名稱按鈕的占位程式碼
    }

    // 僅從 UI 執行緒呼叫此函式
    fun leaveScreen() {
        // 離開畫面時取消作用域
        // 您將無法再更新 UI
        scope.cancel()
    }
}

// UI 控制器程式碼
setHandler(Event.ScreenClosed) {
    // 在 UI 執行緒上執行
    screenWithButtons.leaveScreen()
    buttons.dispose()
}
```

在此範例中，`withContext(Dispatchers.IO)` 配合取消機制，如果 `leaveScreen()` 函式在 `withContext(Dispatchers.IO)` 傳回按鈕名稱之前取消了協同程式，則可防止 `updateUi()` 執行。

雖然立即取消可以防止在數值失效後使用它們，但它也可能在重要數值仍在使用時停止您的程式碼，這可能會導致該數值丟失。
當協同程式接收到一個值（例如 `AutoCloseable` 資源），但在到達關閉該資源的程式碼部分之前就被取消時，就會發生這種情況。
為了防止這種情況，請將清理邏輯保留在保證即使接收數值的協同程式被取消也能執行的位置。

範例如下：

```kotlin
import java.nio.file.*
import java.nio.charset.*
import kotlinx.coroutines.*
import java.io.*

// 使用在 UI 執行緒上執行協同程式的作用域
class ScreenWithFileContents(private val scope: CoroutineScope) {
    fun displayFile(path: Path) {
        scope.launch {
            // 將 reader 儲存在變數中，以便 finally 區塊可以關閉它
            var reader: BufferedReader? = null
            
            try {
                withContext(Dispatchers.IO) {
                    reader = Files.newBufferedReader(
                        path, Charset.forName("US-ASCII")
                    )
                }
                // 在 withContext() 完成後使用儲存的 reader
                updateUi(reader!!)
            } finally {
                // 確保即使協同程式被取消，reader 也會被關閉
                reader?.close()
            }
        }
    }

    private suspend fun updateUi(reader: BufferedReader) {
        // 顯示檔案內容
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
        // 向 UI 新增一行的占位程式碼
    }

    // 僅能從 UI 執行緒呼叫
    fun leaveScreen() {
        // 取消作用域並防止其協同程式更新 UI
        scope.cancel()
    }
}
```

在此範例中，將 `BufferedReader` 儲存在變數中並在 `finally` 區塊中關閉，可確保即使協同程式被取消也能釋放資源。

### 執行不可取消的區塊

您可以防止取消影響協同程式的某些部分。
為此，請將 [`NonCancellable`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-non-cancellable/) 作為引數傳遞給 `withContext()` 協同程式建置器函式。

> 避免將 `NonCancellable` 與 `.launch()` 或 `.async()` 等其他協同程式建置器搭配使用。這樣做會破壞父子關係，進而干擾結構化並行。
>
{style="warning"}

當您需要確保某些操作（例如使用掛起式 `close()` 函式關閉資源）即使在協同程式完成前被取消也能完成時，`NonCancellable` 非常有用。

範例如下：

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
                    // 若不使用 withContext(NonCancellable)，
                    // 由於協同程式已取消，此函式將無法完成
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

## 逾時

逾時（Timeout）允許您在指定的時間長度後自動取消協同程式。
您可以用它來停止執行時間過長的操作。

例如，如果從伺服器下載圖片的請求逾時，您可以重試或改用本機快取。

若要指定逾時，請使用帶有 `Duration` 的 [`withTimeoutOrNull()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-timeout-or-null.html) 函式：

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

如果超過了指定的 `Duration`，`withTimeoutOrNull()` 會傳回 `null`。