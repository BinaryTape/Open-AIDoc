<!--- TEST_NAME FlowGuideTest --> 
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: Flow 运算符)

> 我们目前正在修订此页面。有关流的最新指南，请从 [Flow 概览](coroutines-flow.md)开始。
>
{style="note"}

流可以使用运算符进行转换，就像转换集合与序列一样。
中间运算符应用于上游流，并返回下游流。
这些运算符是冷的（cold）。调用此类运算符本身并不是挂起函数。它运行迅速，返回一个新的转换流的定义。

基础运算符具有熟悉的名称，例如 [map] 与 [filter]。
这些运算符与序列的一个重要区别是，这些运算符内部的代码块可以调用挂起函数。

例如，一个传入请求的流可以使用 [map] 运算符映射到其结果，即使执行请求是一个由挂起函数实现的耗时操作：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart           
suspend fun performRequest(request: Int): String {
    delay(1000) // 模仿耗时的异步工作
    return "response $request"
}

fun main() = runBlocking<Unit> {
    (1..3).asFlow() // 一个请求流
        .map { request -> performRequest(request) }
        .collect { response -> println(response) }
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-01.kt -->
> 您可以从[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-01.kt)获取完整代码。
>
{style="note"}

它产生以下三行，每一行都在前一行出现一秒后显示：

```text                                                                    
response 1
response 2
response 3
```

<!--- TEST -->

### Transform 运算符

在流转换运算符中，最通用的一类被称为 [transform]。它可以用来模仿简单的转换，如 [map] 和 [filter]，也可以实现更复杂的转换。
使用 `transform` 运算符，我们可以 [发射 (emit)][FlowCollector.emit] 任意值任意次数。

例如，使用 `transform` 我们可以在执行耗时异步请求之前发射一个字符串，并在其后跟随响应：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

suspend fun performRequest(request: Int): String {
    delay(1000) // 模仿耗时的异步工作
    return "response $request"
}

fun main() = runBlocking<Unit> {
//sampleStart
    (1..3).asFlow() // 一个请求流
        .transform { request ->
            emit("Making request $request") 
            emit(performRequest(request)) 
        }
        .collect { response -> println(response) }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-02.kt -->
> 您可以从[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-02.kt)获取完整代码。
>
{style="note"}

此代码的输出为：

```text
Making request 1
response 1
Making request 2
response 2
Making request 3
response 3
```

<!--- TEST -->

### 限制大小的运算符

限制大小的中间运算符（如 [take]）在达到相应限制时取消流的执行。协程中的取消总是通过抛出异常来执行的，这样所有的资源管理函数（如 `try { ... } finally { ... }` 代码块）在取消的情况下都能正常运作：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
fun numbers(): Flow<Int> = flow {
    try {                          
        emit(1)
        emit(2) 
        println("This line will not execute")
        emit(3)    
    } finally {
        println("Finally in numbers")
    }
}

fun main() = runBlocking<Unit> {
    numbers() 
        .take(2) // 只获取前两个
        .collect { value -> println(value) }
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-03.kt -->
> 您可以从[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-03.kt)获取完整代码。
>
{style="note"}

此代码的输出清楚地表明，`numbers()` 函数中 `flow { ... }` 体的执行在发射第二个数字后停止了：

```text       
1
2
Finally in numbers
```

<!--- TEST -->

## 终端流运算符

流上的终端运算符是启动流收集的 *挂起函数*。[collect] 运算符是最基础的一个，但还有其他终端运算符，可以使操作更简单：

* 转换为各种集合，如 [toList] 与 [toSet]。
* 获取 [第一个 (first)] 值并确保流发射 [单个 (single)] 值的运算符。
* 使用 [reduce] 与 [fold] 将流归约为一个值。

例如：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> { 
//sampleStart         
    val sum = (1..5).asFlow()
        .map { it * it } // 1 到 5 的平方                           
        .reduce { a, b -> a + b } // 求和（终端运算符）
    println(sum)
//sampleEnd     
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-04.kt -->
> 您可以从[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-04.kt)获取完整代码。
>
{style="note"}

打印单个数字：

```text
55
```

<!--- TEST -->

## 缓冲

从收集流所需的总时间角度来看，在不同的协程中运行流的不同部分是有帮助的，特别是涉及耗时的异步操作时。例如，考虑一种情况，`simple` 流的发射很慢，产生一个元素需要 100 ms；而收集器也很慢，处理一个元素需要 300 ms。让我们看看收集这样一个包含三个数字的流需要多长时间：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.system.*

//sampleStart
fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100) // 假设我们正在异步等待 100 ms
        emit(i) // 发射下一个值
    }
}

fun main() = runBlocking<Unit> { 
    val time = measureTimeMillis {
        simple().collect { value -> 
            delay(300) // 假设我们正在处理它 300 ms
            println(value) 
        } 
    }   
    println("Collected in $time ms")
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-05.kt -->
> 您可以从[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-05.kt)获取完整代码。
>
{style="note"}

它会产生类似这样的结果，整个收集过程大约耗时 1200 ms（三个数字，每个 400 ms）：

```text
1
2
3
Collected in 1220 ms
```

<!--- TEST ARBITRARY_TIME -->

我们可以在流上使用 [buffer] 运算符，以并发方式运行 `simple` 流的发射代码和收集代码，而不是顺序运行它们：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.system.*

fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100) // 假设我们正在异步等待 100 ms
        emit(i) // 发射下一个值
    }
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val time = measureTimeMillis {
        simple()
            .buffer() // 缓冲发射，不等待
            .collect { value -> 
                delay(300) // 假设我们正在处理它 300 ms
                println(value) 
            } 
    }   
    println("Collected in $time ms")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-06.kt -->
> 您可以从[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-06.kt)获取完整代码。
>
{style="note"}

它产生相同的数字，但速度更快，因为我们有效地创建了一个处理流水线，只需为第一个数字等待 100 ms，然后每个数字仅花费 300 ms 来处理。这样运行大约需要 1000 ms：

```text
1
2
3
Collected in 1071 ms
```                    

<!--- TEST ARBITRARY_TIME -->

> 请注意，当 [flowOn] 运算符必须更改 [CoroutineDispatcher] 时，它会使用相同的缓冲机制，但这里我们显式请求缓冲而不更改执行上下文。
>
{style="note"}

### 合并

当流表示操作的部分结果或操作状态更新时，可能不需要处理每个值，而只需处理最近的值。在这种情况下，当收集器处理太慢时，可以使用 [conflate] 运算符跳过中间值。基于前面的示例：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.system.*

fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100) // 假设我们正在异步等待 100 ms
        emit(i) // 发射下一个值
    }
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val time = measureTimeMillis {
        simple()
            .conflate() // 合并发射，不处理每一个
            .collect { value -> 
                delay(300) // 假设我们正在处理它 300 ms
                println(value) 
            } 
    }   
    println("Collected in $time ms")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-07.kt -->
> 您可以从[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-07.kt)获取完整代码。
>
{style="note"}

我们看到，当第一个数字仍在处理时，第二个和第三个数字已经产生了，因此第二个数字被 *合并*（conflated）了，只有最近的一个（第三个）被递送给了收集器：

```text
1
3
Collected in 758 ms
```             

<!--- TEST ARBITRARY_TIME -->

### 处理最新值

合并（Conflation）是加速处理的一种方法。它通过丢弃发射的值来实现。另一种方法是取消缓慢的收集器，并在每次发射新值时重新启动它。有一系列 `xxxLatest` 运算符，它们执行与 `xxx` 运算符相同的基本逻辑，但在有新值时会取消其块中的代码。让我们尝试在前面的示例中将 [conflate] 更改为 [collectLatest]：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.system.*

fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100) // 假设我们正在异步等待 100 ms
        emit(i) // 发射下一个值
    }
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val time = measureTimeMillis {
        simple()
            .collectLatest { value -> // 取消并在最新值上重启
                println("Collecting $value") 
                delay(300) // 假设我们正在处理它 300 ms
                println("Done $value") 
            } 
    }   
    println("Collected in $time ms")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-08.kt -->
> 您可以从[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-08.kt)获取完整代码。
>
{style="note"}

由于 [collectLatest] 的体耗时 300 ms，但每 100 ms 就会发射新值，我们看到该块对每个值都运行了，但仅对最后一个值完成：

```text 
Collecting 1
Collecting 2
Collecting 3
Done 3
Collected in 741 ms
``` 

<!--- TEST ARBITRARY_TIME -->

## 组合多个流

有多种方法可以组合多个流。

### Zip

就像 Kotlin 标准库中的 [Sequence.zip] 扩展函数一样，流也有一个 [zip] 运算符，用于组合两个流的相应值：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> { 
//sampleStart                                                                           
    val nums = (1..3).asFlow() // 数字 1..3
    val strs = flowOf("one", "two", "three") // 字符串 
    nums.zip(strs) { a, b -> "$a -> $b" } // 组合成单个字符串
        .collect { println(it) } // 收集并打印
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-09.kt -->
> 您可以从[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-09.kt)获取完整代码。
>
{style="note"}

此示例打印：

```text
1 -> one
2 -> two
3 -> three
```

<!--- TEST -->

### Combine

当流表示变量或操作的最新值时（另请参阅关于[合并](#合并)的相关部分），可能需要执行取决于相应流最新值的计算，并在任何上游流发射值时重新计算。相应的系列运算符被称为 [combine]。

例如，如果上例中的数字每 300 ms 更新一次，但字符串每 400 ms 更新一次，那么使用 [zip] 运算符拉链它们仍将产生相同的结果，尽管结果每 400 ms 打印一次：

> 在此示例中，我们使用 [onEach] 中间运算符来延迟每个元素，并使发射示例流的代码更具声明性且更短。
>
{style="note"}

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> { 
//sampleStart                                                                           
    val nums = (1..3).asFlow().onEach { delay(300) } // 每 300 ms 发射数字 1..3
    val strs = flowOf("one", "two", "three").onEach { delay(400) } // 每 400 ms 发射字符串
    val startTime = System.currentTimeMillis() // 记录开始时间 
    nums.zip(strs) { a, b -> "$a -> $b" } // 使用 "zip" 组合单个字符串
        .collect { value -> // 收集并打印 
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-10.kt -->
> 您可以从[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-10.kt)获取完整代码。
>
{style="note"}

<!--- TEST ARBITRARY_TIME
1 -> one at 437 ms from start
2 -> two at 837 ms from start
3 -> three at 1243 ms from start
-->

然而，当这里使用 [combine] 运算符代替 [zip] 时：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> { 
//sampleStart                                                                           
    val nums = (1..3).asFlow().onEach { delay(300) } // 每 300 ms 发射数字 1..3
    val strs = flowOf("one", "two", "three").onEach { delay(400) } // 每 400 ms 发射字符串          
    val startTime = System.currentTimeMillis() // 记录开始时间 
    nums.combine(strs) { a, b -> "$a -> $b" } // 使用 "combine" 组合单个字符串
        .collect { value -> // 收集并打印 
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-11.kt -->
> 您可以从[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-11.kt)获取完整代码。
>
{style="note"}

我们得到了截然不同的输出，其中每当 `nums` 或 `strs` 流发射时都会打印一行：

```text 
1 -> one at 452 ms from start
2 -> one at 651 ms from start
2 -> two at 854 ms from start
3 -> two at 952 ms from start
3 -> three at 1256 ms from start
```

<!--- TEST ARBITRARY_TIME -->

## 展平流

流表示异步接收的值序列，因此很容易遇到每个值触发对另一个值序列请求的情况。例如，我们可以有以下函数，它返回一个间隔 500 ms 的两个字符串的流：

```kotlin
fun requestFlow(i: Int): Flow<String> = flow {
    emit("$i: First") 
    delay(500) // 等待 500 ms
    emit("$i: Second")    
}
```

<!--- CLEAR -->

现在，如果我们有一个包含三个整数的流，并对其中每一个调用 `requestFlow`，如下所示：

```kotlin
(1..3).asFlow().map { requestFlow(it) }
```

<!--- CLEAR -->

那么我们将得到一个流的流 (`Flow<Flow<String>>`)，需要将其 *展平*（flattened）为单个流以进行进一步处理。集合与序列为此提供了 [flatten][Sequence.flatten] 与 [flatMap][Sequence.flatMap] 运算符。然而，由于流的异步性质，它们需要不同的展平 *模式*，因此，流上存在一系列展平运算符。

### flatMapConcat

流的流的连接由 [flatMapConcat] 与 [flattenConcat] 运算符提供。它们是相应序列运算符最直接的类似物。如以下示例所示，它们在开始收集下一个流之前等待内部流完成：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun requestFlow(i: Int): Flow<String> = flow {
    emit("$i: First") 
    delay(500) // 等待 500 ms
    emit("$i: Second")    
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val startTime = System.currentTimeMillis() // 记录开始时间 
    (1..3).asFlow().onEach { delay(100) } // 每 100 ms 发射一个数字 
        .flatMapConcat { requestFlow(it) }                                                                           
        .collect { value -> // 收集并打印 
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-12.kt -->
> 您可以从[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-12.kt)获取完整代码。
>
{style="note"}

在输出中可以清楚地看到 [flatMapConcat] 的顺序性质：

```text                      
1: First at 121 ms from start
1: Second at 622 ms from start
2: First at 727 ms from start
2: Second at 1227 ms from start
3: First at 1328 ms from start
3: Second at 1829 ms from start
```

<!--- TEST ARBITRARY_TIME -->

### flatMapMerge

另一种展平操作是并发收集所有传入流并将其值合并为单个流，以便尽快发射值。它由 [flatMapMerge] 与 [flattenMerge] 运算符实现。它们都接受一个可选的 `concurrency` 参数，用于限制同时收集的并发流的数量（默认情况下等于 [DEFAULT_CONCURRENCY]）。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun requestFlow(i: Int): Flow<String> = flow {
    emit("$i: First") 
    delay(500) // 等待 500 ms
    emit("$i: Second")    
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val startTime = System.currentTimeMillis() // 记录开始时间 
    (1..3).asFlow().onEach { delay(100) } // 每 100 ms 发射一个数字 
        .flatMapMerge { requestFlow(it) }                                                                           
        .collect { value -> // 收集并打印 
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-13.kt -->
> 您可以从[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-13.kt)获取完整代码。
>
{style="note"}

[flatMapMerge] 的并发性质显而易见：

```text                      
1: First at 136 ms from start
2: First at 231 ms from start
3: First at 333 ms from start
1: Second at 639 ms from start
2: Second at 732 ms from start
3: Second at 833 ms from start
```                                               

<!--- TEST ARBITRARY_TIME -->

> 请注意，[flatMapMerge] 顺序地调用其代码块（在此示例中为 `{ requestFlow(it) }`），但并发地收集结果流，这等同于先执行顺序的 `map { requestFlow(it) }`，然后对结果调用 [flattenMerge]。
>
{style="note"}

### flatMapLatest

与 ["处理最新值"](#处理最新值) 章节中描述的 [collectLatest] 运算符类似，流也有相应的 "Latest" 展平模式，即一旦发射新流，就会取消前一个流的收集。它由 [flatMapLatest] 运算符实现。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun requestFlow(i: Int): Flow<String> = flow {
    emit("$i: First") 
    delay(500) // 等待 500 ms
    emit("$i: Second")    
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val startTime = System.currentTimeMillis() // 记录开始时间 
    (1..3).asFlow().onEach { delay(100) } // 每 100 ms 发射一个数字 
        .flatMapLatest { requestFlow(it) }                                                                           
        .collect { value -> // 收集并打印 
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-14.kt -->
> 您可以从[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-14.kt)获取完整代码。
>
{style="note"}

此示例的输出很好地演示了 [flatMapLatest] 的工作方式：

```text                      
1: First at 142 ms from start
2: First at 322 ms from start
3: First at 425 ms from start
3: Second at 931 ms from start
```                                               

<!--- TEST ARBITRARY_TIME -->

> 请注意，当接收到新值时，[flatMapLatest] 会取消其块（在此示例中为 `{ requestFlow(it) }`）中的所有代码。在这个特定的示例中，它没有任何区别，因为对 `requestFlow` 本身的调用很快、非挂起且无法被取消。但是，如果我们在 `requestFlow` 中使用像 `delay` 这样的挂起函数，输出的区别就会显现出来。
>
{style="note"}

## 流完成

当流收集完成（正常或异常）时，可能需要执行一个操作。正如您可能已经注意到的，这可以通过两种方式完成：命令式或声明式。

### 命令式 finally 块

除了 `try`/`catch` 之外，收集器还可以在 `collect` 完成后使用 `finally` 块执行操作。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
fun simple(): Flow<Int> = (1..3).asFlow()

fun main() = runBlocking<Unit> {
    try {
        simple().collect { value -> println(value) }
    } finally {
        println("Done")
    }
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-15.kt -->
> 您可以从[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-15.kt)获取完整代码。
>
{style="note"}

此代码打印由 `simple` 流产生的三个数字，随后是一个 "Done" 字符串：

```text
1
2
3
Done
```

<!--- TEST  -->

### 声明式处理

对于声明式方法，流具有 [onCompletion] 中间运算符，该运算符在流完全收集后被调用。

上一个示例可以使用 [onCompletion] 运算符重写，并产生相同的输出：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun simple(): Flow<Int> = (1..3).asFlow()

fun main() = runBlocking<Unit> {
//sampleStart
    simple()
        .onCompletion { println("Done") }
        .collect { value -> println(value) }
//sampleEnd
}            
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-16.kt -->
> 您可以从[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-16.kt)获取完整代码。
>
{style="note"}

<!--- TEST 
1
2
3
Done
-->

[onCompletion] 的核心优势是 lambda 的可空 `Throwable` 参数，该参数可用于确定流收集是正常完成还是异常完成。在以下示例中，`simple` 流在发射数字 1 后抛出一个异常：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
fun simple(): Flow<Int> = flow {
    emit(1)
    throw RuntimeException()
}

fun main() = runBlocking<Unit> {
    simple()
        .onCompletion { cause -> if (cause != null) println("Flow completed exceptionally") }
        .catch { cause -> println("Caught exception") }
        .collect { value -> println(value) }
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-17.kt -->
> 您可以从[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-17.kt)获取完整代码。
>
{style="note"}

正如您所预料的，它打印：

```text
1
Flow completed exceptionally
Caught exception
```

<!--- TEST -->

与 [catch] 运算符不同，[onCompletion] 不处理异常。正如我们在上面的示例代码中看到的，异常仍会向下游传递。它将被递送给进一步的 `onCompletion` 运算符，并可以使用 `catch` 运算符处理。

### 成功完成

与 [catch] 运算符的另一个区别是，[onCompletion] 能看到所有异常，并且仅在端上游流成功完成（没有取消或失败）时接收 `null` 异常。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
fun simple(): Flow<Int> = (1..3).asFlow()

fun main() = runBlocking<Unit> {
    simple()
        .onCompletion { cause -> println("Flow completed with $cause") }
        .collect { value ->
            check(value <= 1) { "Collected $value" }                 
            println(value) 
        }
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-18.kt -->
> 您可以从[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-18.kt)获取完整代码。
>
{style="note"}

我们可以看到完成原因是其非空的，因为流因下游异常而中止：

```text 
1
Flow completed with java.lang.IllegalStateException: Collected 2
Exception in thread "main" java.lang.IllegalStateException: Collected 2
```

<!--- TEST EXCEPTION -->

## 启动流

很容易使用流来表示来自某些源的异步事件。在这种情况下，我们需要一个类似于 `addEventListener` 函数的类似物，它注册一段代码对传入事件做出反应并继续后续工作。[onEach] 运算符可以担当此角色。然而，`onEach` 是一个中间运算符。我们还需要一个终端运算符来收集流。否则，仅调用 `onEach` 是没有效果的。

如果在 `onEach` 之后使用 [collect] 终端运算符，那么其后的代码将等待流被收集完毕：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
// 模仿事件流
fun events(): Flow<Int> = (1..3).asFlow().onEach { delay(100) }

fun main() = runBlocking<Unit> {
    events()
        .onEach { event -> println("Event: $event") }
        .collect() // <--- 收集流会等待
    println("Done")
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-19.kt -->
> 您可以从[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-19.kt)获取完整代码。
>
{style="note"}

正如您所看到的，它打印：

```text 
Event: 1
Event: 2
Event: 3
Done
```    

<!--- TEST -->

[launchIn] 终端运算符在这里派上用场。通过将 `collect` 替换为 `launchIn`，我们可以在单独的协程中启动流的收集，从而使后续代码的执行立即继续：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 模仿事件流
fun events(): Flow<Int> = (1..3).asFlow().onEach { delay(100) }

//sampleStart
fun main() = runBlocking<Unit> {
    events()
        .onEach { event -> println("Event: $event") }
        .launchIn(this) // <--- 在单独的协程中启动流的收集
    println("Done")
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-20.kt -->
> 您可以从[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-20.kt)获取完整代码。
>
{style="note"}

它打印：

```text          
Done
Event: 1
Event: 2
Event: 3
```    

<!--- TEST -->

`launchIn` 的必需参数必须指定一个 [CoroutineScope]，在该作用域中启动用于收集流的协程。在上述示例中，此作用域来自 [runBlocking] 协程构建器，因此当流在运行时，此 [runBlocking] 作用域会等待其子协程完成，并防止 main 函数返回并终止此示例。

在实际应用中，作用域将来自具有有限生命周期的实体。一旦该实体的生命周期终止，相应的作用域就会被取消，从而取消相应流的收集。通过这种方式，`onEach { ... }.launchIn(scope)` 对的作用就像 `addEventListener`。然而，不需要相应的 `removeEventListener` 函数，因为取消和结构化并发为此目的服务。

请注意，[launchIn] 还会返回一个 [Job]，该作业可用于仅 [取消][Job.cancel] 相应的流收集协程，而无需取消整个作用域，或者对其进行 [join][Job.join]。

<!-- stdlib references -->

[collections]: https://kotlinlang.org/docs/reference/collections-overview.html
[List]: https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/
[forEach]: https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/for-each.html
[Sequence]: https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/
[Sequence.zip]: https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/zip.html
[Sequence.flatten]: https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/flatten.html
[Sequence.flatMap]: https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/flat-map.html
[exceptions]: https://kotlinlang.org/docs/reference/exceptions.html

<!--- MODULE kotlinx-coroutines-core -->
<!--- INDEX kotlinx.coroutines -->

[CoroutineDispatcher]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-dispatcher/index.html
[CoroutineScope]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/index.html
[runBlocking]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/run-blocking.html
[Job]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/index.html
[Job.cancel]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/cancel.html
[Job.join]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/join.html

<!--- INDEX kotlinx.coroutines.flow -->

[map]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map.html
[filter]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/filter.html
[transform]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/transform.html
[FlowCollector.emit]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow-collector/emit.html
[take]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/take.html
[collect]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/collect.html
[toList]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/to-list.html
[toSet]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/to-set.html
[first]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/first.html
[single]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/single.html
[reduce]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/reduce.html
[fold]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/fold.html
[buffer]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/buffer.html
[flowOn]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow-on.html
[conflate]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/conflate.html
[collectLatest]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/collect-latest.html
[zip]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/zip.html
[combine]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/combine.html
[onEach]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-each.html
[flatMapConcat]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flat-map-concat.html
[flattenConcat]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flatten-concat.html
[flatMapMerge]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flat-map-merge.html
[flattenMerge]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flatten-merge.html
[DEFAULT_CONCURRENCY]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-d-e-f-a-u-l-t_-c-o-n-c-u-r-r-e-n-c-y.html
[flatMapLatest]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flat-map-latest.html
[onCompletion]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-completion.html
[catch]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/catch.html
[launchIn]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/launch-in.html

<!--- END -->