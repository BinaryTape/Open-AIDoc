<!--- TEST_NAME SharedStateGuideTest -->
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 共享可变状态与并发)

协程可以使用像 [Dispatchers.Default] 这样的多线程调度器并行执行。这带来了所有常见的并行问题。主要问题便是对**共享可变状态**访问的同步。
协程领域中针对此问题的一些解决方案与多线程世界中的解决方案类似，但其他方案则是独一无二的。

## 问题 {id="the-problem"}

让我们启动 100 个协程，每个协程都执行 1000 次相同的操作。
我们还将测量它们的完成时间以便后续比较：

```kotlin
suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 要启动的协程数量
    val k = 1000 // 每个协程重复执行操作的次数
    val time = measureTimeMillis {
        coroutineScope { // 协程的作用域 
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

我们从一个非常简单的操作开始，使用多线程 [Dispatchers.Default] 增加一个共享可变变量。

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*    

suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 要启动的协程数量
    val k = 1000 // 每个协程重复执行操作的次数
    val time = measureTimeMillis {
        coroutineScope { // 协程的作用域 
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
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-sync-01.kt)获取完整代码。
>
{style="note"}

<!--- TEST LINES_START
Completed 100000 actions in
Counter =
-->

最后打印出什么？打印出 "Counter = 100000" 的可能性极小，因为 100 个协程在没有进行任何同步的情况下，从多个线程并发地增加 `counter`。

## Volatile 无济于事 {id="volatiles-are-of-no-help"}

有一种常见的误解认为将变量设为 `volatile` 可以解决并发问题。让我们试一试：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 要启动的协程数量
    val k = 1000 // 每个协程重复执行操作的次数
    val time = measureTimeMillis {
        coroutineScope { // 协程的作用域 
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
@Volatile // 在 Kotlin 中 `volatile` 是一个注解 
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
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-sync-02.kt)获取完整代码。
>
{style="note"}

<!--- TEST LINES_START
Completed 100000 actions in
Counter =
-->

这段代码运行速度较慢，但最后我们仍然不总能得到 "Counter = 100000"，因为 `volatile` 变量保证了对相应变量的线性化（这是“原子性”的技术术语）读写，但对于较大的操作（在我们的例子中是增加操作）并不提供原子性。

## 线程安全的数据结构 {id="thread-safe-data-structures"}

适用于线程和协程的通用解决方案是使用线程安全（又称同步、线性化或原子）的数据结构，它为需要在共享状态上执行的相关操作提供所有必要的同步。
对于一个简单的计数器，我们可以使用具有原子 `incrementAndGet` 操作的 `AtomicInteger` 类：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import java.util.concurrent.atomic.*
import kotlin.system.*

suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 要启动的协程数量
    val k = 1000 // 每个协程重复执行操作的次数
    val time = measureTimeMillis {
        coroutineScope { // 协程的作用域 
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
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-sync-03.kt)获取完整代码。
>
{style="note"}

<!--- TEST ARBITRARY_TIME
Completed 100000 actions in xxx ms
Counter = 100000
-->

这是解决这个特定问题的最快方案。它适用于普通计数器、集合、队列以及其他标准数据结构及其基本操作。然而，它并不容易扩展到复杂的状态或没有现成线程安全实现的复杂操作。 

## 细粒度线程局限 {id="thread-confinement-fine-grained"}

**线程局限**是处理共享可变状态问题的一种方法，即对特定共享状态的所有访问都局限在单个线程中。它通常用于 UI 应用程序，其中所有 UI 状态都局限在单个事件分发/应用程序线程中。通过使用单线程上下文，可以很容易地在协程中应用它。 

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 要启动的协程数量
    val k = 1000 // 每个协程重复执行操作的次数
    val time = measureTimeMillis {
        coroutineScope { // 协程的作用域 
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
            // 将每次增加操作局限在单线程上下文中
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
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-sync-04.kt)获取完整代码。
>
{style="note"}

<!--- TEST ARBITRARY_TIME
Completed 100000 actions in xxx ms
Counter = 100000
-->

这段代码运行得非常慢，因为它执行了**细粒度**的线程局限。每个单独的增加操作都通过 [withContext(counterContext)][withContext] 代码块从多线程 [Dispatchers.Default] 上下文切换到单线程上下文。

## 粗粒度线程局限 {id="thread-confinement-coarse-grained"}

在实践中，线程局限通常是大块进行的，例如，更新状态的大块业务逻辑被局限在单个线程中。下面的示例就是这样做的，首先在单线程上下文中运行每个协程。

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 要启动的协程数量
    val k = 1000 // 每个协程重复执行操作的次数
    val time = measureTimeMillis {
        coroutineScope { // 协程的作用域 
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
    // 将一切局限在单线程上下文中
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
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-sync-05.kt)获取完整代码。
>
{style="note"}

<!--- TEST ARBITRARY_TIME
Completed 100000 actions in xxx ms
Counter = 100000
-->

现在这段代码运行快得多，并产生了正确的结果。

## 互斥 {id="mutual-exclusion"}

互斥解决方案是使用绝不并发执行的**临界区**来保护共享状态的所有修改。在阻塞世界中，通常会使用 `synchronized` 或 `ReentrantLock`。协程的替代方案称为 [Mutex]。它具有 [lock][Mutex.lock] 和 [unlock][Mutex.unlock] 函数来界定临界区。关键区别在于 `Mutex.lock()` 是一个挂起函数。它不会阻塞线程。

此外还有 [withLock] 扩展函数，可以方便地表示 `mutex.lock(); try { ... } finally { mutex.unlock() }` 模式：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.sync.*
import kotlin.system.*

suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 要启动的协程数量
    val k = 1000 // 每个协程重复执行操作的次数
    val time = measureTimeMillis {
        coroutineScope { // 协程的作用域 
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
            // 使用锁保护每次增加操作
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
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-sync-06.kt)获取完整代码。
>
{style="note"}

<!--- TEST ARBITRARY_TIME
Completed 100000 actions in xxx ms
Counter = 100000
-->

这个示例中的锁定是细粒度的，因此要付出代价。然而，对于某些必须定期修改某些共享状态，但又没有自然线程局限到该状态的情况，它是一个不错的选择。

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