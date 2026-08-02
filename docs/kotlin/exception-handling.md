<!--- TEST_NAME ExceptionsGuideTest -->
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 协程异常处理)

本节涵盖了异常处理以及因异常而导致的取消。
我们已经知道，已取消的协程会在挂起点抛出 [CancellationException]，并且协程机制会忽略该异常。在这里，我们将探讨如果在取消过程中抛出异常，或者同一个协程的多个子协程抛出异常会发生什么。

## 异常传播

协程构建器有两种形式：自动传播异常（[launch]）或向用户公开异常（[async] 和 [produce]）。
当这些构建器被用于创建一个*根*协程（即不是另一个协程的*子协程*）时，前者将异常视为**未捕获的异常**，类似于 Java 的 `Thread.uncaughtExceptionHandler`；而后者则依赖用户来消耗最终的异常，例如通过 [await][Deferred.await] 或 [receive][ReceiveChannel.receive]（[produce] 和 [receive][ReceiveChannel.receive] 在[通道](https://github.com/Kotlin/kotlinx.coroutines/blob/master/docs/channels.md)章节中介绍）。

可以通过一个使用 [GlobalScope] 创建根协程的简单示例来演示：

> [GlobalScope] 是一个微妙的 API，可能会以意想不到的方式产生负面影响。为整个应用程序创建一个根协程是 `GlobalScope` 极少数合理的用法之一，因此你必须使用 `@OptIn(DelicateCoroutinesApi::class)` 显式选择启用 `GlobalScope`。
>
{style="note"}

```kotlin
import kotlinx.coroutines.*

//sampleStart
@OptIn(DelicateCoroutinesApi::class)
fun main() = runBlocking {
    val job = GlobalScope.launch { // 使用 launch 的根协程
        println("Throwing exception from launch")
        throw IndexOutOfBoundsException() // 将由 Thread.defaultUncaughtExceptionHandler 打印到控制台
    }
    job.join()
    println("Joined failed job")
    val deferred = GlobalScope.async { // 使用 async 的根协程
        println("Throwing exception from async")
        throw ArithmeticException() // 什么都不会打印，依赖用户调用 await
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
> 你可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-exceptions-01.kt)获取完整代码。
>
{style="note"}

此代码的输出为（配合 [调试](https://github.com/Kotlin/kotlinx.coroutines/blob/master/docs/coroutine-context-and-dispatchers.md#debugging-coroutines-and-threads)）：

```text
Throwing exception from launch
Exception in thread "DefaultDispatcher-worker-1 @coroutine#2" java.lang.IndexOutOfBoundsException
Joined failed job
Throwing exception from async
Caught ArithmeticException
```

<!--- TEST EXCEPTION-->

## CoroutineExceptionHandler

可以自定义将**未捕获的异常**打印到控制台的默认行为。
根协程上的 [CoroutineExceptionHandler] 上下文元素可以作为该根协程及其所有子协程的通用 `catch` 块，在其中进行自定义异常处理。
它类似于 [`Thread.uncaughtExceptionHandler`](https://docs.oracle.com/javase/8/docs/api/java/lang/Thread.html#setUncaughtExceptionHandler-java.lang.Thread.UncaughtExceptionHandler-)。
你无法从 `CoroutineExceptionHandler` 的异常中恢复。当处理程序被调用时，协程已经带着对应的异常完成了。通常，处理程序用于记录异常、显示某种错误消息、终止和/或重新启动应用程序。

`CoroutineExceptionHandler` 仅在**未捕获的异常**（未以任何其他方式处理的异常）上被调用。
特别是，所有*子*协程（在另一个 [Job] 的上下文中创建的协程）都会将其异常的处理委托给其父协程，父协程也会委托给它的父协程，依此类推直到根协程，因此安装在它们上下文中的 `CoroutineExceptionHandler` 永远不会被使用。
除此之外，[async] 构建器始终会捕获所有异常并将其表示在生成的 [Deferred] 对象中，因此它的 `CoroutineExceptionHandler` 也没有效果。

> 在监督作用域内运行的协程不会将异常传播到其父协程，并且不受此规则限制。本文后续的[监督](#supervision)章节提供了更多细节。
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
    val job = GlobalScope.launch(handler) { // 根协程，在 GlobalScope 中运行
        throw AssertionError()
    }
    val deferred = GlobalScope.async(handler) { // 也是根协程，但使用 async 而非 launch
        throw ArithmeticException() // 什么都不会打印，依赖用户调用 deferred.await()
    }
    joinAll(job, deferred)
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-exceptions-02.kt -->
> 你可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-exceptions-02.kt)获取完整代码。
>
{style="note"}

此代码的输出为：

```text
CoroutineExceptionHandler got java.lang.AssertionError
```

<!--- TEST-->

## 取消与异常

取消与异常密切相关。协程在内部使用 `CancellationException` 进行取消，这些异常会被所有处理程序忽略，因此它们应仅用作补充调试信息的来源，可以通过 `catch` 块获取。
当使用 [Job.cancel] 取消协程时，它会终止，但不会取消其父协程。

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
> 你可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-exceptions-03.kt)获取完整代码。
>
{style="note"}

此代码的输出为：

```text
Cancelling child
Child is cancelled
Parent is not cancelled
```

<!--- TEST-->

如果协程遇到 `CancellationException` 以外的异常，它会带着该异常取消其父协程。
这种行为无法被重写，用于为[结构化并发](https://github.com/Kotlin/kotlinx.coroutines/blob/master/docs/composing-suspending-functions.md#structured-concurrency-with-async)提供稳定的协程层次结构。
[CoroutineExceptionHandler] 的实现不用于子协程。

> 在这些示例中，[CoroutineExceptionHandler] 总是安装在 [GlobalScope] 中创建的协程上。在主 [runBlocking] 的作用域内启动的协程安装异常处理程序是没有意义的，因为尽管安装了处理程序，当其子协程因异常完成时，主协程总是会被取消。
>
{style="note"}

原始异常仅在父协程的所有子协程都终止时才由父协程处理，如下例所示。

```kotlin
import kotlinx.coroutines.*

@OptIn(DelicateCoroutinesApi::class)
fun main() = runBlocking {
//sampleStart
    val handler = CoroutineExceptionHandler { _, exception -> 
        println("CoroutineExceptionHandler got $exception") 
    }
    val job = GlobalScope.launch(handler) {
        launch { // 第一个子协程
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
        launch { // 第二个子协程
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
> 你可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-exceptions-04.kt)获取完整代码。
>
{style="note"}

此代码的输出为：

```text
Second child throws an exception
Children are cancelled, but exception is not handled until all children terminate
The first child finished its non cancellable block
CoroutineExceptionHandler got java.lang.ArithmeticException
```

<!--- TEST-->

## 异常聚合

当一个协程的多个子协程因异常失败时，通用规则是“首个异常获胜”，因此首个异常会被处理。
在第一个异常之后发生的所有其他异常都将作为被抑制的异常附加到第一个异常上。

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
                delay(Long.MAX_VALUE) // 当另一个兄弟协程因 IOException 失败时，它将被取消
            } finally {
                throw ArithmeticException() // 第二个异常
            }
        }
        launch {
            delay(100)
            throw IOException() // 第一个异常
        }
        delay(Long.MAX_VALUE)
    }
    job.join()  
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-exceptions-05.kt -->
> 你可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-exceptions-05.kt)获取完整代码。
>
{style="note"}

此代码的输出为：

```text
CoroutineExceptionHandler got java.io.IOException with suppressed [java.lang.ArithmeticException]
```

<!--- TEST-->

> 请注意，此机制目前仅在 Java 1.7+ 版本上运行。JS 和 Native 的限制是暂时的，未来将会取消。
>
{style="note"}

取消异常是透明的，默认情况下会被解包：

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
        val innerJob = launch { // 这整个协程栈都将被取消
            launch {
                launch {
                    throw IOException() // 原始异常
                }
            }
        }
        try {
            innerJob.join()
        } catch (e: CancellationException) {
            println("Rethrowing CancellationException with original cause")
            throw e // 重新抛出取消异常，但原始的 IOException 仍会到达处理程序
        }
    }
    job.join()
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-exceptions-06.kt -->
> 你可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-exceptions-06.kt)获取完整代码。
>
{style="note"}

此代码的输出为：

```text
Rethrowing CancellationException with original cause
CoroutineExceptionHandler got java.io.IOException
```

<!--- TEST-->

## 监督

正如我们之前研究过的，故障是双向关系，会在整个协程层次结构中传播。让我们来看看需要单向故障传播的情况。

这种需求的一个典型例子是在其作用域内定义了作业的 UI 组件。如果任何 UI 的子任务失败了，并不总是需要取消（实际上是杀掉）整个 UI 组件；但如果 UI 组件被销毁了（且其作业被取消），那么就有必要取消所有子作业，因为它们的结果已不再需要。

另一个例子是服务器进程，它衍生出多个子作业，并需要*监督*它们的执行，跟踪它们的失败，并且仅重启失败的那部分。

### 监督作业

[SupervisorJob][SupervisorJob()] 可用于这些目的。
它类似于常规的 [Job][Job()]，唯一的区别是子协程的失败或取消不会向上传播给监督者作业，也不会传播给它的其他子协程。通过以下示例可以轻松演示：

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
//sampleStart
    val supervisor = SupervisorJob()
    with(CoroutineScope(coroutineContext + supervisor)) {
        // 启动第一个子协程 -- 在此示例中忽略其异常（实际操作中请勿模仿！）
        val firstChild = launch(CoroutineExceptionHandler { _, _ ->  }) {
            println("The first child is failing")
            throw AssertionError("The first child is cancelled")
        }
        // 启动第二个子协程
        val secondChild = launch {
            firstChild.join()
            // 第一个子协程的取消不会传播到第二个子协程
            println("The first child is cancelled: ${firstChild.isCancelled}, but the second one is still active")
            try {
                delay(Long.MAX_VALUE)
            } finally {
                // 但监督者的取消会传播
                println("The second child is cancelled because the supervisor was cancelled")
            }
        }
        // 等待第一个子协程失败并完成
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
> 你可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-supervision-01.kt)获取完整代码。
>
{style="note"}

此代码的输出为：

```text
The first child is failing
The first child is cancelled: true, but the second one is still active
Cancelling the supervisor
The second child is cancelled because the supervisor was cancelled
```

<!--- TEST-->

### 监督作用域

我们可以使用 [supervisorScope][_supervisorScope] 代替 [coroutineScope][_coroutineScope] 来进行*作用域内*的并发。它仅在一个方向上传播取消，且仅在自身失败时才取消所有子协程。它也会像 [coroutineScope][_coroutineScope] 一样，在完成前等待所有子协程。

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
            // 使用 yield 给子协程执行并打印的机会
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
> 你可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-supervision-02.kt)获取完整代码。
>
{style="note"}

此代码的输出为：

```text
The child is sleeping
Throwing an exception from the scope
The child is cancelled
Caught an assertion error
```

<!--- TEST-->

#### 监督协程中的异常

常规作业和监督作业之间的另一个关键区别是异常处理。
每个子协程都应该通过异常处理机制自行处理其异常。
这种差异源于子协程的失败不会传播给父协程这一事实。
这意味着直接在 [supervisorScope][_supervisorScope] 内启动的协程*确实*会使用安装在其作用域内的 [CoroutineExceptionHandler]，其方式与根协程相同（详见 [CoroutineExceptionHandler](#coroutineexceptionhandler) 章节）。

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
> 你可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-supervision-03.kt)获取完整代码。
>
{style="note"}

此代码的输出为：

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