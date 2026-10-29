<!--- TEST_NAME DispatcherGuideTest -->
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 协程上下文与调度器)

协程始终在某些上下文中执行，这些上下文由 Kotlin 标准库中定义的 [CoroutineContext](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.coroutines/-coroutine-context/) 类型的值表示。

协程上下文是一组各种元素的集合。 主要元素是协程的 [Job]（我们之前见过的）及其调度器（本节将介绍）。

## 调度器与线程 {id="dispatchers-and-threads"}

协程上下文包含一个 *协程调度器*（参见 [CoroutineDispatcher]），它决定了相关协程在哪个或哪些线程中执行。 协程调度器可以将协程的执行限制在特定线程中，将其分派到线程池中，或者让其不受限地运行。

所有协程构建器（如 [launch] 和 [async]）都接受一个可选的 [CoroutineContext](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.coroutines/-coroutine-context/) 参数，该参数可用于为新协程显式指定调度器和其他上下文元素。

尝试以下示例：

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
//sampleStart
    launch { // 父级上下文，即 main runBlocking 协程
        println("main runBlocking      : I'm working in thread ${Thread.currentThread().name}")
    }
    launch(Dispatchers.Unconfined) { // 不受限——将工作在主线程中
        println("Unconfined            : I'm working in thread ${Thread.currentThread().name}")
    }
    launch(Dispatchers.Default) { // 将被分派到 DefaultDispatcher 
        println("Default               : I'm working in thread ${Thread.currentThread().name}")
    }
    launch(newSingleThreadContext("MyOwnThread")) { // 将获得其自己的新线程
        println("newSingleThreadContext: I'm working in thread ${Thread.currentThread().name}")
    }
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-01.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-01.kt)获取完整代码。
>
{style="note"}

它产生以下输出（顺序可能不同）：

```text
Unconfined            : I'm working in thread main
Default               : I'm working in thread DefaultDispatcher-worker-1
newSingleThreadContext: I'm working in thread MyOwnThread
main runBlocking      : I'm working in thread main
```

<!--- TEST LINES_START_UNORDERED -->

当 `launch { ... }` 不带参数使用时，它会从启动它的 [CoroutineScope] 继承上下文（以及调度器）。 在这种情况下，它继承了在 `main` 线程中运行的 `main` `runBlocking` 协程的上下文。

[Dispatchers.Unconfined] 是一个特殊的调度器，它看起来也在 `main` 线程中运行，但实际上，它是稍后会解释的一种不同机制。

当作用域中没有显式指定其他调度器时，将使用默认调度器。 它由 [Dispatchers.Default] 表示，并使用共享的后台线程池。
  
[newSingleThreadContext] 为协程运行创建一个线程。 专用线程是一种非常昂贵的资源。 在实际应用中，当不再需要时，必须使用 [close][ExecutorCoroutineDispatcher.close] 函数将其释放，或者将其存储在顶级变量中并在整个应用中重用。

## 非受限调度器 vs 受限调度器 {id="unconfined-vs-confined-dispatcher"}
 
[Dispatchers.Unconfined] 协程调度器在调用者线程中启动协程，但仅持续到第一个挂起点。 在挂起之后，它在完全由调用的挂起函数决定的线程中恢复协程。 非受限调度器适用于既不消耗 CPU 时间，也不更新限制在特定线程中的任何共享数据（如 UI）的协程。

另一方面，调度器默认从外部 [CoroutineScope] 继承。 特别是，[runBlocking] 协程的默认调度器受限于调用者线程，因此继承它具有将执行限制在该线程的效果，并具有可预测的 FIFO 调度。

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
//sampleStart
    launch(Dispatchers.Unconfined) { // 不受限——将工作在主线程中
        println("Unconfined      : I'm working in thread ${Thread.currentThread().name}")
        delay(500)
        println("Unconfined      : After delay in thread ${Thread.currentThread().name}")
    }
    launch { // 父级上下文，即 main runBlocking 协程
        println("main runBlocking: I'm working in thread ${Thread.currentThread().name}")
        delay(1000)
        println("main runBlocking: After delay in thread ${Thread.currentThread().name}")
    }
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-02.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-02.kt)获取完整代码。
>
{style="note"}

产生输出：
 
```text
Unconfined      : I'm working in thread main
main runBlocking: I'm working in thread main
Unconfined      : After delay in thread kotlinx.coroutines.DefaultExecutor
main runBlocking: After delay in thread main
```

<!--- TEST LINES_START -->
 
因此，继承自 `runBlocking {...}` 上下文的协程继续在 `main` 线程中执行，而受非受限调度器的协程则在 [delay] 函数使用的默认执行器线程中恢复。

> 非受限调度器是一种高级机制，在某些边缘情况下可能会有所帮助，即不需要为以后执行分派协程，或者由于协程中的某些操作必须立即执行而产生不良副作用。 非受限调度器不应在一般代码中使用。
>
{style="note"}

## 调试协程与线程 {id="debugging-coroutines-and-threads"}

协程可以在一个线程上挂起并在另一个线程上恢复。 如果没有专门的工具，即使使用单线程调度器，也可能很难弄清楚协程在何时、何地、正在做什么。

### 使用 IDEA 调试 {id="debugging-with-idea"}

Kotlin 插件的协程调试器简化了在 IntelliJ IDEA 中调试协程的过程。

> 调试适用于 1.3.8 或更高版本的 `kotlinx-coroutines-core`。
>
{style="note"}

**Debug**（调试）工具窗口包含 **Coroutines**（协程）选项卡。 在此选项卡中，您可以找到有关当前正在运行和已挂起的协程的信息。 协程按其运行所在的调度器进行分组。

![调试协程](coroutine-idea-debugging-1.png){width=700}

通过协程调试器，您可以：
* 检查每个协程的状态。
* 查看运行中和挂起协程的局部变量和捕获变量的值。
* 查看完整的协程创建堆栈，以及协程内部的调用堆栈。 堆栈包含所有带有变量值的帧，甚至是那些在标准调试期间会丢失的帧。
* 获取包含每个协程状态及其堆栈的完整报告。 要获取它，请在 **Coroutines** 选项卡内右键点击，然后点击 **Get Coroutines Dump**。

要开始协程调试，您只需要设置断点并以调试模式运行应用。

在[教程](https://kotlinlang.org/docs/tutorials/coroutines/debug-coroutines-with-idea.html)中详细了解协程调试。

### 使用日志调试 {id="debugging-using-logging"}

在没有协程调试器的情况下调试带有线程的应用的另一种方法是在每个日志语句中打印日志文件中的线程名称。 此功能受到日志框架的普遍支持。 使用协程时，仅靠线程名称并不能提供太多上下文，因此 `kotlinx.coroutines` 包含了调试功能以使其更加轻松。 

使用 `-Dkotlinx.coroutines.debug` JVM 选项运行以下代码：

```kotlin
import kotlinx.coroutines.*

fun log(msg: String) = println("[${Thread.currentThread().name}] $msg")

fun main() = runBlocking<Unit> {
//sampleStart
    val a = async {
        log("I'm computing a piece of the answer")
        6
    }
    val b = async {
        log("I'm computing another piece of the answer")
        7
    }
    log("The answer is ${a.await() * b.await()}")
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-03.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-03.kt)获取完整代码。
>
{style="note"}

这里有三个协程。 `runBlocking` 内部的主协程 (#1)，以及计算延迟值 `a` (#2) 和 `b` (#3) 的两个协程。
它们都在 `runBlocking` 的上下文中执行，并受限于主线程。
这段代码的输出是：

```text
[main @coroutine#2] I'm computing a piece of the answer
[main @coroutine#3] I'm computing another piece of the answer
[main @coroutine#1] The answer is 42
```

<!--- TEST FLEXIBLE_THREAD -->

`log` 函数在方括号中打印线程的名称，您可以看到它是 `main` 线程，后面附加了当前正在执行的协程的标识符。 当调试模式开启时，此标识符会连续分配给所有创建的协程。

> 当 JVM 以 `-ea` 选项运行时，调试模式也会开启。
> 您可以在 [DEBUG_PROPERTY_NAME] 属性的文档中详细了解调试设施。
>
{style="note"}

## 线程间跳转 {id="jumping-between-threads"}

使用 `-Dkotlinx.coroutines.debug` JVM 选项运行以下代码（参见[调试](#debugging-coroutines-and-threads)）：

```kotlin
import kotlinx.coroutines.*

fun log(msg: String) = println("[${Thread.currentThread().name}] $msg")

fun main() {
    newSingleThreadContext("Ctx1").use { ctx1 ->
        newSingleThreadContext("Ctx2").use { ctx2 ->
            runBlocking(ctx1) {
                log("Started in ctx1")
                withContext(ctx2) {
                    log("Working in ctx2")
                }
                log("Back to ctx1")
            }
        }
    }
}
```
<!--- KNIT example-context-04.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-04.kt)获取完整代码。
>
{style="note"}

上面的示例演示了协程使用中的新技术。

第一项技术展示了如何使用带有指定上下文的 [runBlocking]。
第二项技术涉及调用 [withContext]，它可能会挂起当前协程并切换到新上下文——前提是新上下文与现有上下文不同。 具体来说，如果您指定了一个不同的 [CoroutineDispatcher]，则需要额外的分派：代码块被调度在新调度器上，一旦运行结束，执行将返回到原始调度器。

因此，上述代码的输出为：

```text
[Ctx1 @coroutine#1] Started in ctx1
[Ctx2 @coroutine#1] Working in ctx2
[Ctx1 @coroutine#1] Back to ctx1
```

<!--- TEST -->

上面的示例使用了 Kotlin 标准库中的 `use` 函数，以便在不再需要时正确释放由 [newSingleThreadContext] 创建的线程资源。

## 上下文中的作业 {id="job-in-the-context"}

协程的 [Job] 是其上下文的一部分，可以使用 `coroutineContext[Job]` 表达式从中检索它：

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
//sampleStart
    println("My job is ${coroutineContext[Job]}")
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-05.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-05.kt)获取完整代码。
> 
{style="note"}

在[调试模式](#debugging-coroutines-and-threads)下，它的输出如下：

```
My job is "coroutine#1":BlockingCoroutine{Active}@6d311334
```

<!--- TEST lines.size == 1 && lines[0].startsWith("My job is \"coroutine#1\":BlockingCoroutine{Active}@") -->

请注意，[CoroutineScope] 中的 [isActive] 只是 `coroutineContext[Job]?.isActive == true` 的一种便捷快捷方式。

## 协程的子协程 {id="children-of-a-coroutine"}

当一个协程在另一个协程的 [CoroutineScope] 中启动时，它通过 [CoroutineScope.coroutineContext] 继承其上下文，并且新协程的 [Job] 成为父协程作业的一个 *子作业*。 当父协程被取消时，其所有子协程也会被递归地取消。

然而，这种父子关系可以通过以下两种方式之一显式覆盖：

1. 当启动协程时显式指定了不同的作用域（例如 `GlobalScope.launch`），它不会从父作用域继承 `Job`。
2. 当将不同的 `Job` 对象作为新协程的上下文传入时（如下面示例所示），它会覆盖父作用域的 `Job`。
   
在上述两种情况下，启动的协程都与其启动所在的作用域无关，并独立运行。

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
//sampleStart
    // 启动一个协程来处理某种传入请求
    val request = launch {
        // 它派生了另外两个作业
        launch(Job()) { 
            println("job1: I run in my own Job and execute independently!")
            delay(1000)
            println("job1: I am not affected by cancellation of the request")
        }
        // 而另一个继承父级上下文
        launch {
            delay(100)
            println("job2: I am a child of the request coroutine")
            delay(1000)
            println("job2: I will not execute this line if my parent request is cancelled")
        }
    }
    delay(500)
    request.cancel() // 取消请求的处理
    println("main: Who has survived request cancellation?")
    delay(1000) // 将主线程延迟一秒钟以查看发生了什么
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-06.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-06.kt)获取完整代码。
>
{style="note"}

这段代码的输出是：

```text
job1: I run in my own Job and execute independently!
job2: I am a child of the request coroutine
main: Who has survived request cancellation?
job1: I am not affected by cancellation of the request
```

<!--- TEST -->

## 父级的责任 {id="parental-responsibilities"}

父协程始终等待其所有子协程完成。 父协程不必显式跟踪它启动的所有子协程，也不必在结束时使用 [Job.join] 来等待它们：

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
//sampleStart
    // 启动一个协程来处理某种传入请求
    val request = launch {
        repeat(3) { i -> // 启动几个子作业
            launch  {
                delay((i + 1) * 200L) // 变量延迟 200ms, 400ms, 600ms
                println("Coroutine $i is done")
            }
        }
        println("request: I'm done and I don't explicitly join my children that are still active")
    }
    request.join() // 等待请求完成，包括其所有子协程
    println("Now processing of the request is complete")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-07.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-07.kt)获取完整代码。
>
{style="note"}

结果将是：

```text
request: I'm done and I don't explicitly join my children that are still active
Coroutine 0 is done
Coroutine 1 is done
Coroutine 2 is done
Now processing of the request is complete
```

<!--- TEST -->

## 为调试命名协程 {id="naming-coroutines-for-debugging"}

当协程经常打印日志，而您只需要关联来自同一协程的日志记录时，自动分配的 ID 非常有用。 但是，当协程与特定请求的处理相关联或执行某些特定的后台任务时，为了调试目的，最好显式地对其命名。 [CoroutineName] 上下文元素的作用与线程名称相同。 当[调试模式](#debugging-coroutines-and-threads)开启时，它会包含在执行此协程的线程名称中。

以下示例演示了这一概念：

```kotlin
import kotlinx.coroutines.*

fun log(msg: String) = println("[${Thread.currentThread().name}] $msg")

fun main() = runBlocking(CoroutineName("main")) {
//sampleStart
    log("Started main coroutine")
    // 运行两个后台数值计算
    val v1 = async(CoroutineName("v1coroutine")) {
        delay(500)
        log("Computing v1")
        6
    }
    val v2 = async(CoroutineName("v2coroutine")) {
        delay(1000)
        log("Computing v2")
        7
    }
    log("The answer for v1 * v2 = ${v1.await() * v2.await()}")
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-08.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-08.kt)获取完整代码。
>
{style="note"}

在带有 `-Dkotlinx.coroutines.debug` JVM 选项的情况下产生的输出类似于：
 
```text
[main @main#1] Started main coroutine
[main @v1coroutine#2] Computing v1
[main @v2coroutine#3] Computing v2
[main @main#1] The answer for v1 * v2 = 42
```

<!--- TEST FLEXIBLE_THREAD -->

## 组合上下文元素 {id="combining-context-elements"}

有时我们需要为一个协程上下文定义多个元素。 我们对此可以使用 `+` 运算符。 例如，我们可以同时启动一个带有显式指定调度器和显式指定名称的协程： 

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
//sampleStart
    launch(Dispatchers.Default + CoroutineName("test")) {
        println("I'm working in thread ${Thread.currentThread().name}")
    }
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-09.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-09.kt)获取完整代码。
>
{style="note"}

使用 `-Dkotlinx.coroutines.debug` JVM 选项运行此代码的输出为： 

```text
I'm working in thread DefaultDispatcher-worker-1 @test#2
```

<!--- TEST FLEXIBLE_THREAD -->

## 协程作用域 {id="coroutine-scope"}

让我们将关于上下文、子协程和作业的知识结合起来。 假设我们的应用有一个具有生命周期的对象，但该对象不是协程。 例如，我们正在编写一个 Android 应用，并在 Android activity 的上下文中启动各种协程，以执行异步操作来获取和更新数据、制作动画等。 当 activity 被销毁时，这些协程必须被取消以避免内存泄漏。

当然，我们可以手动操作上下文和作业来关联 activity 及其协程的生命周期，但 `kotlinx.coroutines` 提供了一个封装该操作的抽象：[CoroutineScope]。 您应该已经熟悉协程作用域了，因为所有协程构建器都被声明为它的扩展函数。

我们通过创建一个与 activity 的生命周期绑定的 [CoroutineScope] 实例来管理协程的生命周期。 `CoroutineScope` 实例可以通过 [CoroutineScope()] 或 [MainScope()] 工厂函数创建。 前者创建一个通用作用域，而后者为 UI 应用创建一个作用域，并使用 [Dispatchers.Main] 作为默认调度器：

```kotlin
class Activity {
    private val mainScope = MainScope()
    
    fun destroy() {
        mainScope.cancel()
    }
    // 未完待续 ...
```

现在，我们可以使用定义的 `mainScope` 在此 `Activity` 的作用域内启动协程。 为了演示，我们启动了十个延迟时间不同的协程：

```kotlin
    // class Activity 继续
    fun doSomething() {
        // 启动十个协程用于演示，每个协程工作时间不同
        repeat(10) { i ->
            mainScope.launch {
                delay((i + 1) * 200L) // 变量延迟 200ms, 400ms, ... 等
                println("Coroutine $i is done")
            }
        }
    }
} // class Activity 结束
``` 

在我们的主函数中，我们创建 activity，调用测试 `doSomething` 函数，并在 500ms 后销毁 activity。 这将取消所有从 `doSomething` 启动的协程。 我们可以看到这一点，因为在销毁 activity 之后，即使我们再等待一会儿，也不会再打印任何消息。

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*

class Activity {
    private val mainScope = CoroutineScope(Dispatchers.Default) // 出于测试目的使用 Default
    
    fun destroy() {
        mainScope.cancel()
    }

    fun doSomething() {
        // 启动十个协程用于演示，每个协程工作时间不同
        repeat(10) { i ->
            mainScope.launch {
                delay((i + 1) * 200L) // 变量延迟 200ms, 400ms, ... 等
                println("Coroutine $i is done")
            }
        }
    }
} // class Activity 结束

fun main() = runBlocking<Unit> {
//sampleStart
    val activity = Activity()
    activity.doSomething() // 运行测试函数
    println("Launched coroutines")
    delay(500L) // 延迟半秒钟
    println("Destroying activity!")
    activity.destroy() // 取消所有协程
    delay(1000) // 视觉确认它们不再工作
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-10.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-10.kt)获取完整代码。
>
{style="note"}

该示例的输出为：

```text
Launched coroutines
Coroutine 0 is done
Coroutine 1 is done
Destroying activity!
```

<!--- TEST -->

如您所见，只有前两个协程打印了消息，其他协程均在 `Activity.destroy()` 中通过单次调用 [`mainScope.cancel()`][CoroutineScope.cancel] 被取消。

> 请注意，Android 在所有具有生命周期的实体中都对协程作用域提供了一方支持。 参见[相应的文档](https://developer.android.com/topic/libraries/architecture/coroutines#lifecyclescope)。
>
{style="note"}

### 线程局部数据 {id="thread-local-data"}

有时，能够在协程之间或向协程传递一些线程局部数据是很方便的。 但是，由于它们不绑定到任何特定的线程，如果手动执行此操作，可能会导致模板代码。

对于 [`ThreadLocal`](https://docs.oracle.com/javase/8/docs/api/java/lang/ThreadLocal.html)，[asContextElement] 扩展函数在这里大显身手。 它创建了一个额外的上下文元素，用于保存给定的 `ThreadLocal` 值，并在协程每次切换上下文时将其恢复。

在实际操作中很容易演示它：

```kotlin
import kotlinx.coroutines.*

val threadLocal = ThreadLocal<String?>() // 声明线程局部变量

fun main() = runBlocking<Unit> {
//sampleStart
    threadLocal.set("main")
    println("Pre-main, current thread: ${Thread.currentThread()}, thread local value: '${threadLocal.get()}'")
    val job = launch(Dispatchers.Default + threadLocal.asContextElement(value = "launch")) {
        println("Launch start, current thread: ${Thread.currentThread()}, thread local value: '${threadLocal.get()}'")
        yield()
        println("After yield, current thread: ${Thread.currentThread()}, thread local value: '${threadLocal.get()}'")
    }
    job.join()
    println("Post-main, current thread: ${Thread.currentThread()}, thread local value: '${threadLocal.get()}'")
//sampleEnd    
}
```  
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-11.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-11.kt)获取完整代码。
>
{style="note"}

在此示例中，我们使用 [Dispatchers.Default] 在后台线程池中启动一个新协程，因此它在线程池中的不同线程上工作，但它仍然具有我们使用 `threadLocal.asContextElement(value = "launch")` 指定的线程局部变量的值，无论协程在哪个线程上执行。
因此，输出（带有[调试](#debugging-coroutines-and-threads)）为：

```text
Pre-main, current thread: Thread[main @coroutine#1,5,main], thread local value: 'main'
Launch start, current thread: Thread[DefaultDispatcher-worker-1 @coroutine#2,5,main], thread local value: 'launch'
After yield, current thread: Thread[DefaultDispatcher-worker-2 @coroutine#2,5,main], thread local value: 'launch'
Post-main, current thread: Thread[main @coroutine#1,5,main], thread local value: 'main'
```

<!--- TEST FLEXIBLE_THREAD -->

很容易忘记设置相应的上下文元素。 如果运行协程的线程不同，则从协程访问的线程局部变量可能会具有意外的值。 为了避免这种情况，建议使用 [ensurePresent] 方法，并在不当使用时快速失败。

`ThreadLocal` 具有一等支持，可以与 `kotlinx.coroutines` 提供的任何原语一起使用。 但是，它有一个关键限制：当线程局部变量发生变化时，新值不会传播到协程调用者（因为上下文元素无法跟踪所有 `ThreadLocal` 对象访问），并且更新的值在下次挂起时会丢失。 使用 [withContext] 来更新协程中线程局部变量的值，详见 [asContextElement]。

或者，值可以存储在可变包装器（如 `class Counter(var i: Int)`）中，而该包装器反过来存储在线程局部变量中。 然而，在这种情况下，您完全有责任同步对此可变包装器中变量的潜在并发修改。

对于高级用法，例如为了与日志记录 MDC、事务上下文或内部使用线程局部变量传递数据的任何其他库集成，请参见应实现的 [ThreadContextElement] 接口的文档。 

<!--- MODULE kotlinx-coroutines-core -->
<!--- INDEX kotlinx.coroutines -->

[Job]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/index.html
[CoroutineDispatcher]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-dispatcher/index.html
[launch]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html
[async]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html
[CoroutineScope]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/index.html
[Dispatchers.Unconfined]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-unconfined.html
[Dispatchers.Default]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-default.html
[newSingleThreadContext]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/new-single-thread-context.html
[ExecutorCoroutineDispatcher.close]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-executor-coroutine-dispatcher/close.html
[runBlocking]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/run-blocking.html
[delay]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/delay.html
[DEBUG_PROPERTY_NAME]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-d-e-b-u-g_-p-r-o-p-e-r-t-y_-n-a-m-e.html
[withContext]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-context.html
[isActive]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/is-active.html
[CoroutineScope.coroutineContext]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/coroutine-context.html
[Job.join]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/join.html
[CoroutineName]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-name/index.html
[CoroutineScope()]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope.html
[MainScope()]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-main-scope.html
[Dispatchers.Main]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-main.html
[CoroutineScope.cancel]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/cancel.html
[asContextElement]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/as-context-element.html
[ensurePresent]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/ensure-present.html
[ThreadContextElement]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-thread-context-element/index.html

<!--- END -->