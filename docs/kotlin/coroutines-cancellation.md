<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 取消与超时)

取消操作允许您在协程完成之前请求停止它。
它可以停止不再需要的工作，例如当用户关闭窗口或在协程仍在运行时离开用户界面。

您可以使用取消操作来提前释放资源，并防止协程在对象销毁后继续访问它们。
您还可以使用它来停止执行重复工作的长时间运行的协程，例如：

*   发送心跳。
*   运行计划任务。
*   更新状态以反映最新的读取值，例如在时钟 UI 中。

取消操作通过 [`Job`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/) 句柄进行，该句柄表示协程的生命周期及其父子关系。
`Job` 允许您检查协程是否处于活跃状态，并允许您按照[结构化并发](coroutines-basics.md#coroutine-scope-and-structured-concurrency)的定义取消该协程及其所有子协程。

## 取消协程

当在协程的 `Job` 句柄上调用 [`cancel()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/cancel.html) 函数时，该协程将被取消。
[协程构建器函数](coroutines-basics.md#coroutine-builder-functions)（例如 [`.launch()`](coroutines-basics.md#coroutinescope-launch)）会返回一个 `Job`。[`.async()`](coroutines-basics.md#coroutinescope-async) 函数返回一个 [`Deferred`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-deferred/)，它实现了 `Job` 并支持相同的取消行为。

您可以手动调用 `cancel()` 函数，也可以在父协程被取消时通过取消传播自动调用。

当协程被取消时，它会在下一次检查取消时抛出 [`CancellationException`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-cancellation-exception/)。
`kotlinx.coroutines` 库中的挂起函数（例如 `delay()` 函数）在挂起时会检查取消。

您可以使用 [`awaitCancellation()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/await-cancellation.html) 函数来挂起协程，直到它被取消。
这相当于调用 `delay(Duration.INFINITE)`。

> 有关协程如何以及何时检查取消的更多信息，请参阅[挂起点与取消](#suspension-points-and-cancellation)。
>
{style="tip"}

以下是手动取消协程的示例：

```kotlin
import kotlinx.coroutines.*

suspend fun main() {
//sampleStart
withContext(Dispatchers.Default) {
    // 用于表示协程已开始运行的信号
    val childStarted = CompletableDeferred<Unit>()
    
    val childJob: Job = launch {
        println("The coroutine has started")

        // 完成 CompletableDeferred，
        // 表示协程已开始运行
        childStarted.complete(Unit)
        try {
            // 无限期挂起
            // 除非协程被取消，否则此调用永远不会返回
            awaitCancellation()
        } catch (e: CancellationException) {
            println("The coroutine was canceled: $e")
          
            // 务必重新抛出取消异常！
            throw e
        }
        println("This line will never be executed")
    }
  
    // 在取消协程之前等待其启动
    childStarted.await()

    // 取消协程，
    // 因此 awaitCancellation() 会抛出 CancellationException
    childJob.cancel()
}
// 协程构建器（如 withContext() 或 coroutineScope()）
// 会等待所有子协程完成，
// 即使子协程已被取消
println("All coroutines have completed")
//sampleEnd
}
```
{kotlin-runnable="true" id="manual-cancellation-example"}

在此示例中，[`CompletableDeferred`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-completable-deferred/) 被用作协程已开始运行的信号。
协程在开始执行时调用 `complete()`，而 `await()` 仅在该 `CompletableDeferred` 完成后才会返回。
取消协程并不一定需要这种检查。
这里包含它是为了确保协程在被取消之前已经启动并打印了消息，从而使示例具有可复现性。

由于 `Deferred` 实现了 `Job`，因此对于通过 `async()` 协程构建器函数创建的协程，取消操作的工作方式相同：

```kotlin
val deferred = async { /* ... */ }
deferred.cancel()
```

> 捕获 `CancellationException` 可能会破坏取消传播。
> 如果必须捕获它，请将其重新抛出，以使取消操作能通过协程层次结构正确传播。
>
> 有关更多信息，请参阅[协程异常处理](exception-handling.md#cancellation-and-exceptions)。
>
{style="warning"}

### 取消传播

[结构化并发](coroutines-basics.md#coroutine-scope-and-structured-concurrency)确保取消一个协程也会取消其所有的子协程。
这可以防止子协程在父协程被取消后继续工作。

示例如下：

```kotlin
import kotlinx.coroutines.*

suspend fun main() {
    withContext(Dispatchers.Default) {
//sampleStart
// 用于表示子协程已启动的信号
val childrenLaunched = CompletableDeferred<Unit>()

// 启动两个子协程
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
    // 表示子协程已启动
    childrenLaunched.complete(Unit)
}
// 等待父协程发出其已启动
// 所有子协程的信号
childrenLaunched.await()

// 取消父协程，这将取消其所有子协程
parentJob.cancel()
//sampleEnd
    }
}
```
{kotlin-runnable="true" id="cancellation-propagation-example"}

在此示例中，每个子协程都使用了一个 [`finally` 块](exceptions.md#the-finally-block)，因此当协程被取消时，其中的代码会运行。
这里，`CompletableDeferred` 发出子协程在被取消之前已启动的信号，但这并不保证它们已经开始运行。
如果它们先被取消，则不会打印任何内容。

## 使协程响应取消 {id="cancellation-is-cooperative"}

在 Kotlin 中，协程取消是 *协作式的*。
协程只有在通过[挂起](#suspension-points-and-cancellation)或[显式检查取消](#check-for-cancellation-explicitly)进行协作时，才会对取消操作做出响应。

在本节中，您可以了解添加[挂起点](#suspension-points-and-cancellation)（例如调用 [yield()](#the-yield-suspending-function) 函数）如何让协程响应取消。

### 挂起点与取消

当协程被取消时，它会继续运行，直到到达代码中可能发生挂起的点，也称为 *挂起点*。
如果协程在该处挂起，挂起函数会检查它是否已被取消。
如果是，协程将停止并抛出 `CancellationException`。

调用 `suspend` 函数即为一个挂起点，但它并不总是会发生挂起。
例如，在等待 `Deferred` 结果时，只有在该 `Deferred` 尚未完成时，协程才会挂起。

以下示例使用了常见的挂起函数，这些函数会发生挂起，从而使协程在被取消时能够检查并停止：

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
            // 挂起直到被取消
            awaitCancellation()
        },
        launch {
            // 挂起直到被取消
            delay(Duration.INFINITE)
        },
        launch {
            val channel = Channel<Int>()
            // 在等待永远不会发送的值时挂起
            channel.receive()
        },
        launch {
            val deferred = CompletableDeferred<Int>()
            // 在等待永远不会完成的值时挂起
            deferred.await()
        },
        launch {
            val mutex = Mutex(locked = true)
            // 在等待无限期保持锁定状态的互斥锁时挂起
            mutex.lock()
        }
    )
    
    // 给子协程启动和挂起的时间
    delay(100.milliseconds)
    
    // 取消所有子协程
    childJobs.forEach { it.cancel() }
}
println("All child jobs completed!")
//sampleEnd
}
```
{kotlin-runnable="true" id="suspension-points-example"}

> `kotlinx.coroutines` 库中的所有挂起函数都会协作响应取消，因为它们内部使用了 [`suspendCancellableCoroutine()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/suspend-cancellable-coroutine.html)，该函数会在协程挂起时检查取消。
> 相比之下，使用 [`suspendCoroutine()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/suspend-coroutine.html) 的自定义挂起函数不会响应取消。
>
{style="tip"}

### `yield()` 挂起函数

如果一个协程不挂起，其他协程就无法在同一个线程上运行，直到它完成。
因此，不挂起的协程在该线程上按顺序运行。
如果一个协程长时间不挂起，它在被取消时也不会停止。

在 CPU 密集型计算和其他长时间运行且不挂起的代码中，请定期调用 [`yield()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/yield.html) 函数。
该函数会释放当前线程，并让其他协程有机会在其上运行。
它还确保协程定期检查取消。如果协程被取消，`yield()` 函数会抛出 `CancellationException`。

![比较不带检查、带有 `ensureActive()` 或 `isActive` 以及带有 `yield()` 的协程取消处理情况](yield-and-cancellation.svg)

示例如下：

```kotlin
import kotlinx.coroutines.*

fun main() {
//sampleStart
// runBlocking 使用当前线程运行所有协程
runBlocking {
    val coroutineCount = 5
    repeat(coroutineCount) { coroutineIndex ->
        launch {
            val id = coroutineIndex + 1
            repeat(5) { iterationIndex ->
                val iteration = iterationIndex + 1
                // 暂时挂起以给其他协程运行的机会
                // 如果没有这个，协程将按顺序运行
                yield()
                // 打印协程索引和迭代索引
                println("$id * $iteration = ${id * iteration}")
            }
        }
    }
}
//sampleEnd
}
```
{kotlin-runnable="true" id="yield-example"}

在此示例中，每个协程都使用 `yield()` 以在迭代之间让其他协程运行。

### 显式检查取消

您可以显式检查取消，这让长时间运行的代码可以在不挂起的情况下响应取消。
不挂起的长时间运行的协程可能会阻止同一线程上的其他协程运行，直到它完成。
除非这种行为是您的用例有意为之，否则请改用 [`yield()`](#the-yield-suspending-function) 函数。

根据 API 的不同，检查要么返回布尔值，要么抛出异常：

*   [`isActive`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/is-active.html) 属性在协程被取消时返回 `false`。
*   [`ensureActive()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/ensure-active.html) 函数在协程被取消时抛出 `CancellationException`。

### 在取消协程时中断阻塞代码

在 JVM 上，某些阻塞函数（例如 `Thread.sleep()` 或 `BlockingQueue.take()`）会阻塞当前线程。
这些阻塞函数可以被中断，从而使它们提前停止。
然而，当您从协程中调用它们时，取消操作并不会中断线程。

要在取消协程时中断线程，请将阻塞代码包装在 [`runInterruptible()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/run-interruptible.html) 函数中：

```kotlin
import kotlinx.coroutines.*

suspend fun main() {
//sampleStart
withContext(Dispatchers.Default) {
    val childStarted = CompletableDeferred<Unit>()
    val childJob = launch {
        try {
            // 取消操作会触发线程中断
            runInterruptible {
                childStarted.complete(Unit)
                try {
                    // 阻塞当前线程很长时间
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

    // 取消协程并中断执行 Thread.sleep() 的线程
    childJob.cancel()
}
//sampleEnd
}
```
{kotlin-runnable="true" id="interrupt-cancellation-example"}

## 取消协程时安全地处理值

当一个挂起的协程被取消时，它会抛出 `CancellationException` 并恢复运行，而不是返回任何值，即使这些值已经可用。
这种行为被称为 *即时取消*。
它可以防止您的代码在已取消的协程作用域内继续运行，例如更新一个已经关闭的屏幕。

示例如下：

```kotlin
// 定义一个使用 UI 线程的协程作用域
class ScreenWithButtons(private val scope: CoroutineScope) {
    fun loadAndUpdateButtons(filename: String) {
        scope.launch {
            // withContext() 在进入代码块之前
            // 以及代码块返回之后都会检查取消
            val buttonNames = withContext(Dispatchers.IO) {
                // 这是一个不响应取消的阻塞调用
                readLines(filename)
            }
            
            // 调用 updateUi() 是安全的
            // 因为如果协程被取消，withContext() 就不会返回，
            // 并且在调用之前，UI 线程上运行的代码无法销毁按钮
            updateUi(buttonNames)
        }
    }

    // 仅从 UI 线程调用此函数，因为它会访问按钮
    // 如果在按钮销毁后调用则抛出异常
    private fun updateUi(buttonNames: List<String>) {
        // 更新指定名称按钮的占位代码
    }

    // 仅从 UI 线程调用此函数
    fun leaveScreen() {
        // 离开屏幕时取消作用域
        // 您将无法再更新 UI
        scope.cancel()
    }
}

// UI 控制器代码
setHandler(Event.ScreenClosed) {
    // 在 UI 线程上运行
    screenWithButtons.leaveScreen()
    buttons.dispose()
}
```

在此示例中，`withContext(Dispatchers.IO)` 协作响应取消，如果 `leaveScreen()` 函数在 `withContext(Dispatchers.IO)` 返回按钮名称之前取消了协程，则可以防止 `updateUi()` 运行。

虽然即时取消可以防止在值不再有效后继续使用它们，但它也可能在重要值仍在使用时停止您的代码，这可能会导致该值的丢失。
当协程接收到一个值（例如 `AutoCloseable` 资源），但在到达关闭该资源的代码部分之前被取消时，就会发生这种情况。
为了防止这种情况，请将清理逻辑放在即便接收值的协程被取消也保证能运行的地方。

示例如下：

```kotlin
import java.nio.file.*
import java.nio.charset.*
import kotlinx.coroutines.*
import java.io.*

// 使用一个在 UI 线程上运行其协程的作用域
class ScreenWithFileContents(private val scope: CoroutineScope) {
    fun displayFile(path: Path) {
        scope.launch {
            // 将 reader 存储在变量中，以便 finally 块可以关闭它
            var reader: BufferedReader? = null
            
            try {
                withContext(Dispatchers.IO) {
                    reader = Files.newBufferedReader(
                        path, Charset.forName("US-ASCII")
                    )
                }
                // 在 withContext() 完成后使用存储的 reader
                updateUi(reader!!)
            } finally {
                // 确保即使协程被取消，reader 也能关闭
                reader?.close()
            }
        }
    }

    private suspend fun updateUi(reader: BufferedReader) {
        // 显示文件内容
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
        // 将一行内容添加到 UI 的占位代码
    }

    // 仅能从 UI 线程调用
    fun leaveScreen() {
        // 取消作用域并防止其协程更新 UI
        scope.cancel()
    }
}
```

在此示例中，将 `BufferedReader` 存储在变量中并在 `finally` 块中关闭它，可确保即使协程被取消也能释放资源。

### 运行不可取消的代码块

您可以防止取消操作影响协程的某些部分。
为此，请将 [`NonCancellable`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-non-cancellable/) 作为参数传递给 `withContext()` 协程构建器函数。

> 避免将 `NonCancellable` 与 `.launch()` 或 `.async()` 等其他协程构建器一起使用。这样做会破坏父子关系，从而破坏结构化并发。
>
{style="warning"}

当您需要确保某些操作（例如使用挂起的 `close()` 函数关闭资源）即使协程在完成前被取消也能顺利执行时，`NonCancellable` 非常有用。

示例如下：

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
                    // 如果没有 withContext(NonCancellable)，
                    // 此函数将因为协程已取消而无法完成
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

## 超时

超时允许您在指定持续时间后自动取消协程。
您可以使用它来停止耗时过长的操作。

例如，如果从服务器下载图片的请求超时，您可以重试或回退到本地缓存。

要指定超时，请将带有 `Duration` 的 [`withTimeoutOrNull()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-timeout-or-null.html) 函数配合使用：

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

如果超时超过了指定的 `Duration`，`withTimeoutOrNull()` 将返回 `null`。