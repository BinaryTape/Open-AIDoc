<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 协程基础)

为了创建能够同时执行多个任务的应用程序（这一概念被称为并发），Kotlin 使用了**协程**。协程是一种可挂起的计算，它允许你以清晰、顺序的风格编写并发代码。协程可以与其他协程并发运行，甚至可能并行运行。

在 JVM 和 Kotlin/Native 上，所有并发代码（如协程）都运行在由操作系统管理的**线程**上。协程可以挂起其执行，而不是阻塞线程。这允许一个协程在等待某些数据到达时挂起，而另一个协程在同一个线程上运行，从而确保资源的高效利用。

![比较并行与并发线程](parallelism-and-concurrency.svg){width="700"}

有关协程与线程之间区别的更多信息，请参阅[比较协程与 JVM 线程](#comparing-coroutines-and-jvm-threads)。

## 挂起函数

协程最基本的构建块是**挂起函数**。它允许正在运行的操作暂停并在稍后恢复，而不会影响代码的结构。

要声明挂起函数，请使用 `suspend` 关键字：

```kotlin
suspend fun greet() {
    println("Hello world from a suspending function")
}
```

你只能从另一个挂起函数中调用挂起函数。要在 Kotlin 应用程序的入口点调用挂起函数，请使用 `suspend` 关键字标记 `main()` 函数：

```kotlin
suspend fun main() {
    showUserInfo()
}

suspend fun showUserInfo() {
    println("Loading user...")
    greet()
    println("User: John Smith")
}

suspend fun greet() {
    println("Hello world from a suspending function")
}
```
{kotlin-runnable="true"}

这个示例尚未涉及并发，但通过使用 `suspend` 关键字标记函数，你可以让它们调用其他挂起函数并在内部运行并发代码。

虽然 `suspend` 关键字是 Kotlin 核心语言的一部分，但大多数协程功能都是通过 [`kotlinx.coroutines`](https://github.com/Kotlin/kotlinx.coroutines) 库提供的。

## 在项目中添加 kotlinx.coroutines 库

要在项目中包含 `kotlinx.coroutines` 库，请根据你的构建工具添加相应的依赖项配置：

<tabs group="build-tool">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts
repositories {
    mavenCentral()
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle
repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
}
```
</tab>

<tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<project>
    <dependencies>
        <dependency>
            <groupId>org.jetbrains.kotlinx</groupId>
            <artifactId>kotlinx-coroutines-core</artifactId>
            <version>%coroutinesVersion%</version>
        </dependency>
    </dependencies>
    ...
</project>
```

</tab>
</tabs>

## 创建你的第一个协程

> 此页面上的示例在协程构建器函数 `CoroutineScope.launch()` 和 `CoroutineScope.async()` 中使用了显式的 `this` 表达式。这些协程构建器是 `CoroutineScope` 上的[扩展函数](extensions.md)，`this` 表达式引用当前的 `CoroutineScope` 作为接收者。
>
> 有关实际示例，请参阅[从协程作用域中提取协程构建器](#extract-coroutine-builders-from-the-coroutine-scope)。
>
{style="note"}

要在 Kotlin 中创建协程，你需要以下内容：

* 一个[挂起函数](#suspending-functions)。
* 一个可以运行协程的[协程作用域](#coroutine-scope-and-structured-concurrency)，例如在 `withContext()` 函数内部。
* 一个[协程构建器](#coroutine-builder-functions)（如 `CoroutineScope.launch()`）来启动它。
* 一个[调度器](#coroutine-dispatchers)来控制它使用哪些线程。

让我们看一个在多线程环境中使用多个协程的示例：

1. 导入 `kotlinx.coroutines` 库：

    ```kotlin
    import kotlinx.coroutines.*
    ```

2. 使用 `suspend` 关键字标记可以暂停和恢复的函数：

    ```kotlin
    suspend fun greet() {
        println("线程上的 greet()：${Thread.currentThread().name}")
    }
    
    suspend fun main() {}
    ```

    > 虽然你可以在某些项目中将 `main()` 函数标记为 `suspend`，但在与现有代码集成或使用框架时可能无法这样做。在这种情况下，请检查框架文档以查看其是否支持调用挂起函数。如果不支持，请使用 [`runBlocking()`](#runblocking) 通过阻塞当前线程来调用它们。
    > 
    {style="note"}

3. 添加 [`delay()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/delay.html#) 函数来模拟挂起任务，例如获取数据或写入数据库：

    ```kotlin
    suspend fun greet() {
        println("线程上的 greet()：${Thread.currentThread().name}")
        delay(1000L)
    }
   ```

    <!-- > 使用 Kotlin 标准库中的 [`kotlin.time.Duration`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/-duration/) 来表达时长（如 `delay(1.seconds)`），而不是使用毫秒。
    >
    {style="tip"} -->

4. 使用 [`withContext(Dispatchers.Default)`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-context.html#) 为在共享线程池上运行的多线程并发代码定义入口点：

    ```kotlin
    suspend fun main() {
        withContext(Dispatchers.Default) {
            // 在此处添加协程构建器
        }
    }
    ```

   > 挂起函数 `withContext()` 通常用于[上下文切换](coroutine-context-and-dispatchers.md#jumping-between-threads)，但在本示例中，它还为并发代码定义了一个非阻塞入口点。它使用 [`Dispatchers.Default` 调度器](#coroutine-dispatchers)在共享线程池上运行代码，以进行多线程执行。默认情况下，此线程池在运行时最多使用与可用 CPU 核心数相同的线程，且至少包含两个线程。
   > 
   > 在 `withContext()` 块内启动的协程共享同一个协程作用域，这确保了[结构化并发](#coroutine-scope-and-structured-concurrency)。
   > 
   {style="note"}

5. 使用 [协程构建器函数](#coroutine-builder-functions)（如 [`CoroutineScope.launch()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html)）来启动协程：

    ```kotlin
    suspend fun main() {
        withContext(Dispatchers.Default) { // this: CoroutineScope
            // 使用 CoroutineScope.launch() 在作用域内启动协程
            this.launch { greet() }
            println("线程上的 withContext()：${Thread.currentThread().name}")
        }
    }
    ```

6. 将这些部分组合起来，在共享线程池上同时运行多个协程：

    ```kotlin
    // 导入协程库
    import kotlinx.coroutines.*

    // 导入 kotlin.time.Duration 以秒为单位表示时长
    import kotlin.time.Duration.Companion.seconds

    // 定义挂起函数
    suspend fun greet() {
        println("线程上的 greet()：${Thread.currentThread().name}")
        // 挂起 1 秒并释放线程
        delay(1.seconds) 
        // 这里的 delay() 函数模拟了一个挂起 API 调用
        // 你可以在此处添加挂起 API 调用，例如网络请求
    }

    suspend fun main() {
        // 在共享线程池上运行此块内的代码
        withContext(Dispatchers.Default) { // this: CoroutineScope
            this.launch() {
                greet()
            }
   
            // 启动另一个协程
            this.launch() {
                println("线程上的 CoroutineScope.launch()：${Thread.currentThread().name}")
                delay(1.seconds)
                // 这里的 delay 函数模拟了一个挂起 API 调用
                // 你可以在此处添加挂起 API 调用，例如网络请求
            }
    
            println("线程上的 withContext()：${Thread.currentThread().name}")
        }
    }
    ```
    {kotlin-runnable="true"}

尝试多次运行该示例。你可能会发现，每次运行程序时输出顺序和线程名称都可能发生变化，因为操作系统决定了线程的运行时间。

> 你可以在代码输出中的线程名称旁显示协程名称，以获取额外信息。为此，请在构建工具或 IDE 运行配置中传递 `-Dkotlinx.coroutines.debug` VM 选项。
>
> 有关更多信息，请参阅[调试协程](https://github.com/Kotlin/kotlinx.coroutines/blob/master/docs/topics/debugging.md)。
>
{style="tip"}

## 协程作用域与结构化并发

当你在应用程序中运行许多协程时，需要一种将它们作为组进行管理的方法。Kotlin 协程依赖于一个称为**结构化并发**的原则来提供这种结构。

根据这一原则，协程形成了一个父子任务树层次结构，并关联了生命周期。协程的生命周期是从创建到完成、失败或取消的一系列状态。

父协程会等待其子协程完成后再结束。如果父协程失败或被取消，其所有子协程也会被递归取消。通过这种方式保持协程的连接，使得取消操作和错误处理变得可预测且安全。

为了维护结构化并发，新的协程只能在定义并管理其生命周期的 [`CoroutineScope`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/) 中启动。`CoroutineScope` 包含**协程上下文**，后者定义了调度器和其他执行属性。当你在另一个协程内部启动协程时，它会自动成为其父作用域的子协程。

在 `CoroutineScope` 上调用[协程构建器函数](#coroutine-builder-functions)（如 `CoroutineScope.launch()`）会启动一个与该作用域关联的协程的子协程。在构建器的代码块内部，[接收者](lambdas.md#function-literals-with-receiver)是一个嵌套的 `CoroutineScope`，因此你在其中启动的任何协程都会成为其子协程。

### 使用 `coroutineScope()` 函数创建协程作用域

要使用当前的协程上下文创建一个新的协程作用域，请使用 [`coroutineScope()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/coroutine-scope.html) 函数。此函数会创建一个协程子树的根协程。它是该代码块内启动的协程的直接父级，也是这些协程所启动的任何协程的间接父级。`coroutineScope()` 执行挂起块并等待该块及其中启动的所有协程完成。

示例如下：

```kotlin
// 导入 kotlin.time.Duration 以秒为单位表示时长
import kotlin.time.Duration.Companion.seconds

import kotlinx.coroutines.*

// 如果协程上下文未指定调度器，
// CoroutineScope.launch() 将使用 Dispatchers.Default
//sampleStart
suspend fun main() {
    // 协程子树的根
    coroutineScope { // this: CoroutineScope
        this.launch {
            this.launch {
                delay(2.seconds)
                println("封闭协程的子协程已完成")
            }
            println("子协程 1 已完成")
        }
        this.launch {
            delay(1.seconds)
            println("子协程 2 已完成")
        }
    }
    // 仅在 coroutineScope 中的所有子协程都完成后运行
    println("协程作用域已完成")
}
//sampleEnd
```
{kotlin-runnable="true"}

由于本示例中未指定[调度器](#coroutine-dispatchers)，`coroutineScope()` 块中的 `CoroutineScope.launch()` 构建器函数会继承当前上下文。如果该上下文没有指定的调度器，`CoroutineScope.launch()` 将使用在共享线程池上运行的 `Dispatchers.Default`。

### 从协程作用域中提取协程构建器

在某些情况下，你可能希望将协程构建器调用（如 [`CoroutineScope.launch()`](#coroutinescope-launch)）提取到单独的函数中。

考虑以下示例：

```kotlin
suspend fun main() {
    coroutineScope { // this: CoroutineScope
        // 在以 CoroutineScope 为接收者的地方调用 CoroutineScope.launch()
        this.launch { println("1") }
        this.launch { println("2") }
    } 
}
```

> 你也可以省略显式的 `this` 表达式，直接将 `this.launch` 写为 `launch`。这些示例使用显式的 `this` 表达式是为了强调它是 `CoroutineScope` 上的扩展函数。
>
> 有关 Kotlin 中带接收者的 lambda 如何工作的更多信息，请参阅[带接收者的函数字面量](lambdas.md#function-literals-with-receiver)。
>
{style="tip"}

`coroutineScope()` 函数接受一个带有 `CoroutineScope` 接收者的 lambda。在此 lambda 内部，隐式接收者是一个 `CoroutineScope`，因此诸如 `CoroutineScope.launch()` 和 [`CoroutineScope.async()`](#coroutinescope-async) 之类的构建器函数会被解析为该接收者上的[扩展函数](extensions.md#extension-functions)。

要将协程构建器提取到另一个函数中，该函数必须声明一个 `CoroutineScope` 接收者，否则会发生编译错误：

```kotlin
import kotlinx.coroutines.*
//sampleStart
suspend fun main() {
    coroutineScope {
        launchAll()
    }
}

fun CoroutineScope.launchAll() { // this: CoroutineScope
    // 在 CoroutineScope 上调用 .launch()
    this.launch { println("1") }
    this.launch { println("2") } 
}
//sampleEnd
/* -- 在未将 CoroutineScope 声明为接收者的情况下调用 launch 会导致编译错误 --

fun launchAll() {
    // 编译错误：未定义 this
    this.launch { println("1") }
    this.launch { println("2") }
}
 */
```
{kotlin-runnable="true"}

在此示例中，`launchAll()` 函数不需要 `suspend` 关键字，因为它仅在当前 `CoroutineScope` 中启动协程，然后立即返回。仅当函数在返回前需要暂停和恢复时，才应将其标记为 `suspend`。

## 协程构建器函数

协程构建器函数是一种接受 `suspend` [lambda](lambdas.md) 并定义要运行的协程的函数。以下是一些示例：

* [`CoroutineScope.launch()`](#coroutinescope-launch)
* [`CoroutineScope.async()`](#coroutinescope-async)
* [`runBlocking()`](#runblocking)
* [`withContext()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-context.html)
* [`coroutineScope()`](#create-a-coroutine-scope-with-the-coroutinescope-function)

协程构建器函数需要在一个 `CoroutineScope` 中运行。这可以是一个现有的作用域，或者是你使用诸如 `coroutineScope()`、[`runBlocking()`](#runblocking) 或 [`withContext()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-context.html#) 等辅助函数创建的作用域。每个构建器都定义了协程如何启动以及你如何与其结果进行交互。

### `CoroutineScope.launch()`

[`CoroutineScope.launch()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html#) 协程构建器函数是 `CoroutineScope` 上的扩展函数。它在一个现有的[协程作用域](#coroutine-scope-and-structured-concurrency)内部启动一个新协程，而不会阻塞该作用域的其余部分。

当你不需要结果或者不想等待结果时，可以使用 `CoroutineScope.launch()` 来让任务与其他工作并行运行：

```kotlin
// 导入 kotlin.time.Duration 以允许用毫秒表示时长
import kotlin.time.Duration.Companion.milliseconds

import kotlinx.coroutines.*

suspend fun main() {
    withContext(Dispatchers.Default) {
        performBackgroundWork()
    }
}

//sampleStart
suspend fun performBackgroundWork() = coroutineScope { // this: CoroutineScope
    // 启动一个不会阻塞作用域运行的协程
    this.launch {
        // 挂起以模拟后台工作
        delay(100.milliseconds)
        println("Sending notification in background")
    }

    // 主协程在之前的协程挂起时继续执行
    println("Scope continues")
}
//sampleEnd
```
{kotlin-runnable="true"}

运行此示例后，你可以看到 `main()` 函数不会被 `CoroutineScope.launch()` 阻塞，并且在协程于后台工作时会继续运行其他代码。

> `CoroutineScope.launch()` 函数返回一个 [`Job`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/) 句柄。使用此句柄可以等待启动的协程完成。有关更多信息，请参阅[取消与超时](coroutines-cancellation.md#cancel-coroutines)。
> 
{style="tip"}

### `CoroutineScope.async()`

[`CoroutineScope.async()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html) 协程构建器函数是 `CoroutineScope` 上的扩展函数。它在现有的[协程作用域](#coroutine-scope-and-structured-concurrency)内启动一个并发计算，并返回一个表示最终结果的 [`Deferred`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-deferred/) 句柄。使用 `.await()` 函数可以挂起代码，直到结果准备就绪：

```kotlin
// 导入 kotlin.time.Duration 以允许用毫秒表示时长
import kotlin.time.Duration.Companion.milliseconds

import kotlinx.coroutines.*

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) { // this: CoroutineScope
    // 开始下载第一页
    val firstPage = this.async {
        delay(50.milliseconds)
        "First page"
    }

    // 并行开始下载第二页
    val secondPage = this.async {
        delay(100.milliseconds)
        "Second page"
    }

    // 等待两个结果并进行比较
    val pagesAreEqual = firstPage.await() == secondPage.await()
    println("Pages are equal: $pagesAreEqual")
}
//sampleEnd
```
{kotlin-runnable="true"}

### `runBlocking()`

[`runBlocking()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/run-blocking.html) 协程构建器函数会创建一个协程作用域，并阻塞当前[线程](#comparing-coroutines-and-jvm-threads)，直到在该作用域内启动的协程完成。

仅当没有其他选项可以从非挂起代码中调用挂起代码时，才使用 `runBlocking()`：

```kotlin
import kotlin.time.Duration.Companion.milliseconds
import kotlinx.coroutines.*

// 你无法更改的第三方接口
interface Repository {
    fun readItem(): Int
}

object MyRepository : Repository {
    override fun readItem(): Int {
        // 桥接到挂起函数
        return runBlocking {
            myReadItem()
        }
    }
}

suspend fun myReadItem(): Int {
    delay(100.milliseconds)
    return 4
}
```

## 协程调度器

[**协程调度器**](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/#)控制协程在执行时使用哪个线程或线程池。协程并不总是绑定到单个线程。根据调度器的不同，它们可以在一个线程上暂停并在另一个线程上恢复。这允许你在不为每个协程分配单独线程的情况下同时运行许多协程。

> 即使协程可以在不同的线程上挂起和恢复，但在协程挂起之前写入的值仍保证在恢复后的同一协程中可用。
>
{style="tip"}

调度器与[协程作用域](#coroutine-scope-and-structured-concurrency)协同工作，定义协程运行的时间和地点。协程作用域控制协程的生命周期，而调度器控制执行所使用的线程。

> 你不必为每个协程指定调度器。默认情况下，协程会从其父作用域继承调度器。你可以指定一个调度器，使协程在不同的上下文中运行。
> 
> 如果协程上下文中不包含调度器，协程构建器将使用 `Dispatchers.Default`。
>
{style="note"}

`kotlinx.coroutines` 库包含了适用于不同场景的不同调度器。例如，[`Dispatchers.Default`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-default.html) 在共享线程池上运行协程，在后台执行工作，并与主线程分离。这使其成为数据处理等 CPU 密集型操作的理想选择。

要为 `CoroutineScope.launch()` 等协程构建器指定调度器，请将其作为参数传递：

```kotlin
suspend fun runWithDispatcher() = coroutineScope { // this: CoroutineScope
    this.launch(Dispatchers.Default) {
        println("Running on ${Thread.currentThread().name}")
    }
}
```

或者，你可以使用 `withContext()` 块在指定的调度器上运行其中的所有代码：

```kotlin
// 导入 kotlin.time.Duration 以允许用毫秒表示时长
import kotlin.time.Duration.Companion.milliseconds

import kotlinx.coroutines.*

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) { // this: CoroutineScope
    println("Running withContext block on ${Thread.currentThread().name}")

    val one = this.async {
        println("First calculation starting on ${Thread.currentThread().name}")
        val sum = (1L..500_000L).sum()
        delay(200L)
        println("First calculation done on ${Thread.currentThread().name}")
        sum
    }

    val two = this.async {
        println("Second calculation starting on ${Thread.currentThread().name}")
        val sum = (500_001L..1_000_000L).sum()
        println("Second calculation done on ${Thread.currentThread().name}")
        sum
    }

    // 等待两个计算并打印结果
    println("Combined total: ${one.await() + two.await()}")
}
//sampleEnd
```
{kotlin-runnable="true"}

要详细了解协程调度器及其用途，包括 [`Dispatchers.IO`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-i-o.html) 和 [`Dispatchers.Main`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-main.html) 等其他调度器，请参阅[协程上下文与调度器](coroutine-context-and-dispatchers.md)。

## 比较协程与 JVM 线程

虽然协程是可挂起的计算，可以像 JVM 上的线程一样并发运行代码，但它们在底层的运作方式不同。

**线程**由操作系统管理。线程可以在多个 CPU 核心上并行运行任务，代表了 JVM 上并发的标准方法。当你创建一个线程时，操作系统会为其栈分配内存，并使用内核在线程之间进行切换。这使得线程虽然强大，但也非常消耗资源。每个线程通常需要几 MB 的内存，且通常 JVM 一次只能处理几千个线程。

另一方面，协程不绑定到特定线程。它可以在一个线程上挂起并在另一个线程上恢复，因此许多协程可以共享同一个线程池。当协程挂起时，线程不会被阻塞，可以自由运行其他任务。这使得协程比线程轻量得多，并允许在一个进程中运行数百万个协程而不会耗尽系统资源。

![比较协程与线程](coroutines-and-threads.svg){width="700"}

让我们看一个例子，其中 50,000 个协程各自等待 5 秒，然后打印一个点号 (`.`)：

```kotlin
import kotlin.time.Duration.Companion.seconds
import kotlinx.coroutines.*

suspend fun main() {
    withContext(Dispatchers.Default) {
        // 启动 50,000 个协程，每个协程等待 5 秒，然后打印一个点
        printPeriods()
    }
}

//sampleStart
suspend fun printPeriods() = coroutineScope { // this: CoroutineScope
    // 启动 50,000 个协程，每个协程等待 5 秒，然后打印一个点
    repeat(50_000) {
        this.launch {
            delay(5.seconds)
            print(".")
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

现在让我们看一个使用 JVM 线程的相同示例：

```kotlin
import kotlin.concurrent.thread

fun main() {
    repeat(50_000) {
        thread {
            Thread.sleep(5000L)
            print(".")
        }
    }
}
```
{kotlin-runnable="true" validate="false"}

运行这个版本会消耗更多的内存，因为每个线程都需要自己的内存栈。对于 50,000 个线程，其消耗可能高达 100 GB，而相同数量的协程仅需约 500 MB。

根据你的操作系统、JDK 版本和设置，JVM 线程版本可能会抛出内存不足错误，或者为了避免同时运行过多线程而降低线程创建速度。

## 下一步

* 在[组合挂起函数](composing-suspending-functions.md)中了解更多关于组合挂起函数的内容。
* 在[取消与超时](coroutines-cancellation.md)中学习如何取消协程以及处理超时。
* 在[协程上下文与调度器](coroutine-context-and-dispatchers.md)中深入研究协程执行和线程管理。
* 在[异步流](coroutines-flow.md)中学习如何返回多个异步计算出的值。