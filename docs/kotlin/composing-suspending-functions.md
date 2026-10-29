<!--- TEST_NAME ComposingGuideTest -->
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 组合挂起函数)

本节涵盖了组合挂起函数的各种方法。

## 默认顺序执行 {id="sequential-by-default"}

假设我们有两个在别处定义的挂起函数，它们执行一些有用的操作，比如某种远程服务调用或计算。我们暂且假定它们是有用的，但实际上在这个示例中，每个函数只是为了演示目的而延迟一秒钟：

```kotlin
suspend fun doSomethingUsefulOne(): Int {
    delay(1000L) // 假设我们在这里做了一些有用的工作
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // 假设我们在这里也做了一些有用的工作
    return 29
}
```

如果我们要求它们**顺序**执行——先执行 `doSomethingUsefulOne` *然后*执行 `doSomethingUsefulTwo`，并计算它们结果的和，该怎么办？在实践中，如果我们根据第一个函数的结果来决定是否需要调用第二个函数，或者决定如何调用它，我们就会这样做。

我们使用普通的顺序调用，因为协程中的代码与普通代码一样，默认是**顺序**执行的。下面的示例通过测量执行两个挂起函数所需的总时间来演示这一点：

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
    delay(1000L) // 假设我们在这里做了一些有用的工作
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // 假设我们在这里也做了一些有用的工作
    return 29
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-compose-01.kt -->
> 你可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-compose-01.kt)获取完整代码。
>
{style="note"}

它的输出类似于：

```text
The answer is 42
Completed in 2017 ms
```

<!--- TEST ARBITRARY_TIME -->

## 使用 async 并发 {id="concurrent-using-async"}

如果 `doSomethingUsefulOne` 和 `doSomethingUsefulTwo` 的调用之间没有依赖关系，并且我们希望通过同时**并发**执行两者来更快地获得答案，该怎么办？这就是 [async] 大显身手的地方。

从概念上讲， [async] 就和 [launch] 一样。它启动一个单独的协程，这是一个轻量级线程，与其他所有协程并发工作。区别在于 `launch` 返回一个 [Job] 并且不携带任何结果值，而 `async` 返回一个 [Deferred] —— 一个轻量级的非阻塞 **future**，代表了一个在稍后提供结果的承诺。你可以对一个延迟值使用 `.await()` 来获得其最终结果，但 `Deferred` 也是一个 `Job`，所以如果需要，你可以取消它。

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
    delay(1000L) // 假设我们在这里做了一些有用的工作
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // 假设我们在这里也做了一些有用的工作
    return 29
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-compose-02.kt -->
> 你可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-compose-02.kt)获取完整代码。
>
{style="note"}

它的输出类似于：

```text
The answer is 42
Completed in 1017 ms
```

<!--- TEST ARBITRARY_TIME -->

这快了两倍，因为两个协程并发执行。请注意，协程的并发总是显式的。

## 惰性启动的 async {id="lazily-started-async"}

可选地，可以通过将 [async] 的 `start` 参数设置为 [CoroutineStart.LAZY] 来使其变为惰性。在这种模式下，只有当其结果被 [await][Deferred.await] 请求时，或者其 `Job` 的 [start][Job.start] 函数被调用时，它才会启动协程。运行以下示例：

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

fun main() = runBlocking<Unit> {
//sampleStart
    val time = measureTimeMillis {
        val one = async(start = CoroutineStart.LAZY) { doSomethingUsefulOne() }
        val two = async(start = CoroutineStart.LAZY) { doSomethingUsefulTwo() }
        // 一些计算
        one.start() // 启动第一个
        two.start() // 启动第二个
        println("The answer is ${one.await() + two.await()}")
    }
    println("Completed in $time ms")
//sampleEnd    
}

suspend fun doSomethingUsefulOne(): Int {
    delay(1000L) // 假设我们在这里做了一些有用的工作
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // 假设我们在这里也做了一些有用的工作
    return 29
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-compose-03.kt -->
> 你可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-compose-03.kt)获取完整代码。
>
{style="note"}

它的输出类似于：

```text
The answer is 42
Completed in 1017 ms
```

<!--- TEST ARBITRARY_TIME -->

因此，这里定义了两个协程，但没有像前面的示例那样立即执行，而是由程序员通过调用 [start][Job.start] 来控制确切的启动时间。我们先启动 `one`，然后启动 `two`，最后等待各个协程完成。

请注意，如果我们只是在 `println` 中调用 [await][Deferred.await]，而没有先在各个协程上调用 [start][Job.start]，这将导致顺序执行的行为，因为 [await][Deferred.await] 会启动协程执行并等待其完成，这并不是惰性启动的预期用例。 `async(start = CoroutineStart.LAZY)` 的用例是在计算值涉及挂起函数时，替代标准的 [lazy](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/lazy.html) 函数。

## async 风格的函数 {id="async-style-functions"}

> 这种带有 async 函数的编程风格在这里仅用于说明，因为它是其他编程语言中流行的一种风格。出于下文所述的原因，**强烈建议不要**在 Kotlin 协程中使用此风格。
>
{style="note"}

我们可以定义 async 风格的函数，使用 [async] 协程构建器并配合 [GlobalScope] 引用来脱离结构化并发，从而**异步地**调用 `doSomethingUsefulOne` 和 `doSomethingUsefulTwo`。我们为此类函数加上 "...Async" 后缀，以突出它们仅启动异步计算，并且需要使用生成的延迟值来获取结果的事实。

> [GlobalScope] 是一个微妙的 API，可能会以不容易察觉的方式产生负面影响，其中一个原因将在下文解释，因此你必须使用 `@OptIn(DelicateCoroutinesApi::class)` 显式选择开启 `GlobalScope`。
>
{style="note"}

```kotlin
// somethingUsefulOneAsync 的结果类型是 Deferred<Int>
@OptIn(DelicateCoroutinesApi::class)
fun somethingUsefulOneAsync() = GlobalScope.async {
    doSomethingUsefulOne()
}

// somethingUsefulTwoAsync 的结果类型是 Deferred<Int>
@OptIn(DelicateCoroutinesApi::class)
fun somethingUsefulTwoAsync() = GlobalScope.async {
    doSomethingUsefulTwo()
}
```

注意，这些 `xxxAsync` 函数**不是**挂起函数。它们可以在任何地方使用。然而，使用它们总是意味着它们的操作与调用代码是异步（这里指并发）执行的。
 
下面的示例展示了它们在协程之外的使用：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

//sampleStart
// 请注意，在本示例中，main 的右侧没有 `runBlocking`
fun main() {
    val time = measureTimeMillis {
        // 我们可以在协程之外启动异步操作
        val one = somethingUsefulOneAsync()
        val two = somethingUsefulTwoAsync()
        // 但等待结果必须涉及挂起或阻塞。
        // 这里我们使用 `runBlocking { ... }` 在等待结果时阻塞主线程
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
    delay(1000L) // 假设我们在这里做了一些有用的工作
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // 假设我们在这里也做了一些有用的工作
    return 29
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-compose-04.kt -->
> 你可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-compose-04.kt)获取完整代码。
>
{style="note"}

<!--- TEST ARBITRARY_TIME
The answer is 42
Completed in 1085 ms
-->

考虑一下，如果在 `val one = somethingUsefulOneAsync()` 这一行和 `one.await()` 表达式之间，代码中存在逻辑错误，程序抛出了异常，并且程序正在执行的操作中止了。通常，全局错误处理程序可以捕获此异常，为开发者记录并报告错误，但程序原本可以继续执行其他操作。然而，在这里，即使启动它的操作已经中止，`somethingUsefulOneAsync` 仍会在后台运行。如下节所示，结构化并发不会出现此问题。

## 使用 async 的结构化并发 {id="structured-concurrency-with-async"}

让我们将[使用 async 并发](#concurrent-using-async)示例重构为一个函数，该函数并发运行 `doSomethingUsefulOne` 和 `doSomethingUsefulTwo` 并返回它们的组合结果。由于 [async] 是 [CoroutineScope] 的扩展，我们将使用 [coroutineScope][_coroutineScope] 函数来提供必要的作用域：

```kotlin
suspend fun concurrentSum(): Int = coroutineScope {
    val one = async { doSomethingUsefulOne() }
    val two = async { doSomethingUsefulTwo() }
    one.await() + two.await()
}
```

这样，如果 `concurrentSum` 函数内部的代码出了问题并抛出异常，那么在其作用域内启动的所有协程都将被取消。

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
    delay(1000L) // 假设我们在这里做了一些有用的工作
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // 假设我们在这里也做了一些有用的工作
    return 29
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-compose-05.kt -->
> 你可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-compose-05.kt)获取完整代码。
>
{style="note"}

我们仍然拥有两个操作的并发执行，这从上述 `main` 函数的输出中可以明显看出：

```text
The answer is 42
Completed in 1017 ms
```

<!--- TEST ARBITRARY_TIME -->

取消总是通过协程层次结构传播：

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
            delay(Long.MAX_VALUE) // 模拟耗时很长的计算
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
> 你可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-compose-06.kt)获取完整代码。
>
{style="note"}

请注意，由于其中一个子协程（即 `two`）失败，第一个 `async` 以及等待中的父协程是如何都被取消的：
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