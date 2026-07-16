<!--- TEST_NAME FlowGuideTest --> 
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 异步流)

一个挂起函数可以异步地返回单个值，但我们如何返回多个异步计算的值呢？这就是 Kotlin Flow 的用武之地。

## 表示多个值

在 Kotlin 中可以使用 [collections] 来表示多个值。
例如，我们可以编写一个 `simple` 函数，它返回一个包含三个数字的 [List]，然后使用 [forEach] 将它们全部打印出来：

```kotlin
fun simple(): `List<Int>` = listOf(1, 2, 3)
 
fun main() {
    simple().forEach { value -> println(value) } 
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-01.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-01.kt)获取完整代码。
>
{style="note"}

这段代码输出：

```text
1
2
3
```

<!--- TEST -->

### 序列

如果我们正在使用某些消耗 CPU 的阻塞代码计算数字（每次计算耗时 100 ms），那么我们可以使用 [Sequence] 来表示这些数字：

```kotlin
fun simple(): Sequence<Int> = sequence { // sequence 构建器
    for (i in 1..3) {
        Thread.sleep(100) // 假装我们在进行计算
        yield(i) // 产生下一个值
    }
}

fun main() {
    simple().forEach { value -> println(value) } 
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-02.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-02.kt)获取完整代码。
>
{style="note"}

这段代码输出相同的数字，但在打印每个数字之前都会等待 100 ms。

<!--- TEST 
1
2
3
-->

### 挂起函数

然而，这种计算会阻塞运行代码的主线程。
当这些值由异步代码计算时，我们可以为 `simple` 函数标记 `suspend` 修饰符，
这样它就可以在不阻塞的情况下执行工作并以列表形式返回结果：

```kotlin
import kotlinx.coroutines.*                 
                           
//sampleStart
suspend fun simple(): `List<Int>` {
    delay(1000) // 假装我们在进行异步操作
    return listOf(1, 2, 3)
}

fun main() = runBlocking<Unit> {
    simple().forEach { value -> println(value) } 
}
//sampleEnd
```  
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-03.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-03.kt)获取完整代码。
>
{style="note"}

这段代码在等待一秒钟后打印数字。

<!--- TEST 
1
2
3
-->

### Flow

使用 `List<Int>` 结果类型意味着我们只能一次性返回所有值。为了表示正在异步计算的值流，我们可以使用 [`Flow<Int>`][Flow] 类型，就像我们将 `Sequence<Int>` 类型用于同步计算的值一样：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart               
fun simple(): Flow<Int> = flow { // flow 构建器
    for (i in 1..3) {
        delay(100) // 假装我们在做一些有用的事情
        emit(i) // 发射下一个值
    }
}

fun main() = runBlocking<Unit> {
    // 启动一个并发协程来检查主线程是否被阻塞
    launch {
        for (k in 1..3) {
            println("I'm not blocked $k")
            delay(100)
        }
    }
    // 收集 flow
    simple().collect { value -> println(value) } 
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-04.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-04.kt)获取完整代码。
>
{style="note"}

这段代码在打印每个数字前等待 100 ms，且不会阻塞主线程。通过在主线程运行的另一个独立协程中每 100 ms 打印一次 "I'm not blocked" 验证了这一点：

```text
I'm not blocked 1
1
I'm not blocked 2
2
I'm not blocked 3
3
```

<!--- TEST -->

请注意前面示例中使用 [Flow] 的代码有以下不同之处：

* [Flow] 类型的构建器函数名为 [flow][_flow]。
* `flow { ... }` 构建器块中的代码可以挂起。
* `simple` 函数不再标记有 `suspend` 修饰符。
* 值使用 [emit][FlowCollector.emit] 函数从 flow 中*发射*。
* 值使用 [collect][collect] 函数从 flow 中*收集*。

> 我们可以在 `simple` 的 `flow { ... }` 体中将 [delay] 替换为 `Thread.sleep`，在这种情况下可以看到主线程被阻塞了。
>
{style="note"}

## Flow 是冷的

Flow 是类似于序列的*冷*流 &mdash; [flow][_flow] 构建器中的代码在 flow 被收集之前不会运行。这在以下示例中变得很清楚：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart      
fun simple(): Flow<Int> = flow { 
    println("Flow started")
    for (i in 1..3) {
        delay(100)
        emit(i)
    }
}

fun main() = runBlocking<Unit> {
    println("Calling simple function...")
    val flow = simple()
    println("Calling collect...")
    flow.collect { value -> println(value) } 
    println("Calling collect again...")
    flow.collect { value -> println(value) } 
}
//sampleEnd
```  
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-05.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-05.kt)获取完整代码。
>
{style="note"}

打印结果如下：

```text
Calling simple function...
Calling collect...
Flow started
1
2
3
Calling collect again...
Flow started
1
2
3
```

<!--- TEST -->
 
这是 `simple` 函数（返回 flow）不带 `suspend` 修饰符的一个关键原因。
`simple()` 调用本身会迅速返回并且不等待任何事情。Flow 在每次收集时都会重新开始，这就是为什么我们每次再次调用 `collect` 时都会看到 "Flow started"。

## Flow 取消基础

Flow 遵循协程的常规协作式取消。通常，当 flow 在可取消的挂起函数（如 [delay]）中挂起时，flow 收集可以被取消。
以下示例展示了当 flow 在 [withTimeoutOrNull] 块中运行时，如何因超时而被取消并停止执行其代码：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart           
fun simple(): Flow<Int> = flow { 
    for (i in 1..3) {
        delay(100)          
        println("Emitting $i")
        emit(i)
    }
}

fun main() = runBlocking<Unit> {
    withTimeoutOrNull(250) { // 在 250 ms 后超时 
        simple().collect { value -> println(value) } 
    }
    println("Done")
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-06.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-06.kt)获取完整代码。
>
{style="note"}

请注意 `simple` 函数中的 flow 仅发射了两个数字，产生以下输出：

```text
Emitting 1
1
Emitting 2
2
Done
```

<!--- TEST -->

更多详情请参阅 [Flow 取消检查](#flow-cancellation-checks)部分。

## Flow 构建器

前面示例中的 `flow { ... }` 构建器是最基础的一个。还有其他构建器可以声明 Flow：

* [flowOf] 构建器定义了一个发射固定值集的 Flow。
* 各种集合和序列可以使用 `.asFlow()` 扩展函数转换为 Flow。

例如，打印从 Flow 发射的数字 1 到 3 的代码段可以改写如下：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> {
//sampleStart
    // 将整数范围转换为 Flow
    (1..3).asFlow().collect { value -> println(value) }
//sampleEnd 
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-07.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-07.kt)获取完整代码。
>
{style="note"}

<!--- TEST
1
2
3
-->

## 中间流操作符

可以使用操作符对 Flow 进行转换，就像转换集合和序列一样。
中间操作符应用于上游 Flow 并返回下游 Flow。
这些操作符也是冷的，就像 Flow 一样。调用此类操作符本身并不是挂起函数。它运行迅速，并返回一个新转换后的 Flow 的定义。

基础操作符有着熟悉的名称，如 [map] 和 [filter]。
这些操作符与序列的一个重要区别在于，这些操作符内部的代码块可以调用挂起函数。

例如，一个传入请求的流可以使用 [map] 操作符映射到其结果，即使执行请求是一个由挂起函数实现的长运行操作：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart           
suspend fun performRequest(request: Int): String {
    delay(1000) // 模仿长运行异步工作
    return "response $request"
}

fun main() = runBlocking<Unit> {
    (1..3).asFlow() // 请求流
        .map { request -> performRequest(request) }
        .collect { response -> println(response) }
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-08.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-08.kt)获取完整代码。
>
{style="note"}

它产生以下三行，每一行都在前一行出现一秒钟后出现：

```text                                                                    
response 1
response 2
response 3
```

<!--- TEST -->

### Transform 操作符

在 Flow 转换操作符中，最通用的一种称为 [transform]。它可以用来模仿简单的转换，如 [map] 和 [filter]，也可以实现更复杂的转换。
使用 `transform` 操作符，我们可以 [发射][FlowCollector.emit] 任意数量的任意值。

例如，使用 `transform` 我们可以在执行长运行异步请求之前发射一个字符串，并紧随其后发射响应：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

suspend fun performRequest(request: Int): String {
    delay(1000) // 模仿长运行异步工作
    return "response $request"
}

fun main() = runBlocking<Unit> {
//sampleStart
    (1..3).asFlow() // 请求流
        .transform { request ->
            emit("Making request $request") 
            emit(performRequest(request)) 
        }
        .collect { response -> println(response) }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-09.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-09.kt)获取完整代码。
>
{style="note"}

该代码的输出为：

```text
Making request 1
response 1
Making request 2
response 2
Making request 3
response 3
```

<!--- TEST -->

### 限制大小的操作符

诸如 [take] 之类的限制大小的中间操作符会在达到相应限制时取消 Flow 的执行。协程中的取消总是通过抛出异常来执行的，这样所有的资源管理函数（如 `try { ... } finally { ... }` 块）在取消的情况下都能正常运行：

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
        .take(2) // 仅取前两个
        .collect { value -> println(value) }
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-10.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-10.kt)获取完整代码。
>
{style="note"}

该代码的输出清楚地显示，`numbers()` 函数中 `flow { ... }` 体的执行在发射第二个数字后停止了：

```text       
1
2
Finally in numbers
```

<!--- TEST -->

## 终端流操作符

Flow 上的终端操作符是启动 Flow 收集的*挂起函数*。
[collect] 操作符是最基础的一个，但还有其他终端操作符，可以使操作更简便：

* 转换为各种集合，如 [toList] 和 [toSet]。
* 获取 [first] 值以及确保 Flow 仅发射 [single] 值的操作符。
* 使用 [reduce] 和 [fold] 将 Flow 归约为一个值。

例如：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> {
//sampleStart         
    val sum = (1..5).asFlow()
        .map { it * it } // 1 到 5 数字的平方                           
        .reduce { a, b -> a + b } // 求和（终端操作符）
    println(sum)
//sampleEnd     
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-11.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-11.kt)获取完整代码。
>
{style="note"}

打印单个数字：

```text
55
```

<!--- TEST -->

## Flow 是顺序执行的

除非使用了操作多个 Flow 的特殊操作符，否则 Flow 的每个单独收集都是顺序执行的。收集直接在调用终端操作符的协程中运行。默认情况下不会启动新的协程。每个发射的值都会由从上游到下游的所有中间操作符处理，然后交付给终端操作符。

查看以下过滤偶数并将其映射为字符串的示例：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> {
//sampleStart         
    (1..5).asFlow()
        .filter {
            println("Filter $it")
            it % 2 == 0              
        }              
        .map { 
            println("Map $it")
            "string $it"
        }.collect { 
            println("Collect $it")
        }    
//sampleEnd                  
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-12.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-12.kt)获取完整代码。
>
{style="note"}

产出：

```text
Filter 1
Filter 2
Map 2
Collect string 2
Filter 3
Filter 4
Map 4
Collect string 4
Filter 5
```

<!--- TEST -->

## Flow 上下文

Flow 的收集总是发生在调用协程的上下文中。例如，如果有一个 `simple` Flow，那么以下代码运行在由该代码作者指定的上下文中，而不管 `simple` Flow 的实现细节如何：

```kotlin
withContext(context) {
    simple().collect { value ->
        println(value) // 在指定的上下文中运行 
    }
}
```

<!--- CLEAR -->

Flow 的这种属性称为*上下文保存 (context preservation)*。

因此，默认情况下，`flow { ... }` 构建器中的代码运行在由该 Flow 收集器提供的上下文中。例如，考虑 `simple` 函数的一个实现，它打印调用它的线程并发射三个数字：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun log(msg: String) = println("[${Thread.currentThread().name}] $msg")
           
//sampleStart
fun simple(): Flow<Int> = flow {
    log("Started simple flow")
    for (i in 1..3) {
        emit(i)
    }
}  

fun main() = runBlocking<Unit> {
    simple().collect { value -> log("Collected $value") } 
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-13.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-13.kt)获取完整代码。
>
{style="note"}

运行此代码将产生：

```text  
[main @coroutine#1] Started simple flow
[main @coroutine#1] Collected 1
[main @coroutine#1] Collected 2
[main @coroutine#1] Collected 3
```

<!--- TEST FLEXIBLE_THREAD -->

由于 `simple().collect` 是从主线程调用的，因此 `simple` Flow 的体也是在主线程中调用的。
对于不关心执行上下文且不阻塞调用者的快速运行代码或异步代码，这是完美的默认行为。

### 使用 withContext 时的常见误区

然而，长运行的消耗 CPU 的代码可能需要在 [Dispatchers.Default] 上下文中执行，而更新 UI 的代码可能需要在 [Dispatchers.Main] 上下文中执行。通常，在 Kotlin 协程中会使用 [withContext] 来更改上下文，但 `flow { ... }` 构建器中的代码必须遵守上下文保存属性，并且不允许从不同的上下文中进行 [发射][FlowCollector.emit]。

尝试运行以下代码：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
                      
//sampleStart
fun simple(): Flow<Int> = flow {
    // 为 flow 构建器中消耗 CPU 的代码更改上下文的错误方法
    kotlinx.coroutines.withContext(Dispatchers.Default) {
        for (i in 1..3) {
            Thread.sleep(100) // 假装我们以消耗 CPU 的方式进行计算
            emit(i) // 发射下一个值
        }
    }
}

fun main() = runBlocking<Unit> {
    simple().collect { value -> println(value) } 
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-14.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-14.kt)获取完整代码。
>
{style="note"}

这段代码会产生以下异常：

```text
Exception in thread "main" java.lang.IllegalStateException: Flow invariant is violated:
		Flow was collected in [CoroutineId(1), "coroutine#1":BlockingCoroutine{Active}@5511c7f8, BlockingEventLoop@2eac3323],
		but emission happened in [CoroutineId(1), "coroutine#1":DispatchedCoroutine{Active}@2dae0000, Dispatchers.Default].
		Please refer to 'flow' documentation or use 'flowOn' instead
	at ...
``` 

<!--- TEST EXCEPTION -->

### flowOn 操作符
   
该异常指出了应使用 [flowOn] 函数来更改 Flow 发射的上下文。更改 Flow 上下文的正确方法如下例所示，该例还打印了相应线程的名称，以展示其工作原理：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun log(msg: String) = println("[${Thread.currentThread().name}] $msg")
           
//sampleStart
fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        Thread.sleep(100) // 假装我们以消耗 CPU 的方式进行计算
        log("Emitting $i")
        emit(i) // 发射下一个值
    }
}.flowOn(Dispatchers.Default) // 为 flow 构建器中消耗 CPU 的代码更改上下文的正解

fun main() = runBlocking<Unit> {
    simple().collect { value ->
        log("Collected $value") 
    } 
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-15.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-15.kt)获取完整代码。
>
{style="note"}
  
请注意 `flow { ... }` 是如何在后台线程中工作的，而收集则发生在主线程中：

```text
[DefaultDispatcher-worker-1 @coroutine#2] Emitting 1
[main @coroutine#1] Collected 1
[DefaultDispatcher-worker-1 @coroutine#2] Emitting 2
[main @coroutine#1] Collected 2
[DefaultDispatcher-worker-1 @coroutine#2] Emitting 3
[main @coroutine#1] Collected 3
```

<!--- TEST FLEXIBLE_THREAD -->

这里观察到的另一点是，[flowOn] 操作符更改了 Flow 默认的顺序执行性质。现在收集发生在一个协程 ("coroutine#1") 中，而发射发生在另一个协程 ("coroutine#2") 中，后者在另一个线程中与收集协程并发运行。当 [flowOn] 操作符必须在其上下文中更改 [CoroutineDispatcher] 时，它会为上游 Flow 创建另一个协程。

## 缓冲

在不同的协程中运行 Flow 的不同部分，从收集 Flow 所花费的总时间来看是有帮助的，特别是当涉及长运行的异步操作时。例如，考虑这样一种情况：`simple` Flow 的发射很慢，产生一个元素需要 100 ms；而收集器也很慢，处理一个元素需要 300 ms。让我们看看收集这样一个包含三个数字的 Flow 需要多长时间：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.system.*

//sampleStart
fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100) // 假装我们异步等待了 100 ms
        emit(i) // 发射下一个值
    }
}

fun main() = runBlocking<Unit> { 
    val time = measureTimeMillis {
        simple().collect { value -> 
            delay(300) // 假装我们处理了 300 ms
            println(value) 
        } 
    }   
    println("Collected in $time ms")
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-16.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-16.kt)获取完整代码。
>
{style="note"}

它产生的结果如下，整个收集耗时约 1200 ms (三个数字，每个约 400 ms)：

```text
1
2
3
Collected in 1220 ms
```

<!--- TEST ARBITRARY_TIME -->

我们可以在 Flow 上使用 [buffer] 操作符，使 `simple` Flow 的发射代码与收集代码并发运行，而不是顺序运行：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.system.*

fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100) // 假装我们异步等待了 100 ms
        emit(i) // 发射下一个值
    }
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val time = measureTimeMillis {
        simple()
            .buffer() // 缓冲发射物，无需等待
            .collect { value -> 
                delay(300) // 假装我们处理了 300 ms
                println(value) 
            } 
    }   
    println("Collected in $time ms")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-17.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-17.kt)获取完整代码。
>
{style="note"}

它以更快的速度产生相同的数字，因为我们实际上创建了一个处理流水线，只需为第一个数字等待 100 ms，然后每个数字仅需花费 300 ms 来处理。这样运行耗时约为 1000 ms：

```text
1
2
3
Collected in 1071 ms
```                    

<!--- TEST ARBITRARY_TIME -->

> 请注意，当 [flowOn] 操作符必须更改 [CoroutineDispatcher] 时，它使用相同的缓冲机制，但在这里我们显式请求缓冲而不更改执行上下文。
>
{style="note"}

### 合并为空 (Conflation)

当 Flow 表示操作的部分结果或操作状态更新时，可能不需要处理每个值，而是只需处理最近的值。在这种情况下，当收集器处理速度太慢而无法处理所有值时，可以使用 [conflate] 操作符跳过中间值。基于前面的示例：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.system.*

fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100) // 假装我们异步等待了 100 ms
        emit(i) // 发射下一个值
    }
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val time = measureTimeMillis {
        simple()
            .conflate() // 合并发射物，不处理每一个
            .collect { value -> 
                delay(300) // 假装我们处理了 300 ms
                println(value) 
            } 
    }   
    println("Collected in $time ms")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-18.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-18.kt)获取完整代码。
>
{style="note"}

我们看到，当第一个数字仍在处理时，第二个和第三个数字已经产生了，因此第二个数字被*合并为空*，只有最近的一个 (第三个) 被交付给了收集器：

```text
1
3
Collected in 758 ms
```             

<!--- TEST ARBITRARY_TIME -->

### 处理最新值

合并 (Conflation) 是加快处理的一种方法。它通过丢弃发射的值来实现。另一种方法是取消慢速收集器，并在每次发射新值时重新启动它。有一族 `xxxLatest` 操作符执行与 `xxx` 操作符相同的基本逻辑，但在新值产生时取消其块中的代码。让我们尝试在前面的示例中将 [conflate] 更改为 [collectLatest]：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.system.*

fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100) // 假装我们异步等待了 100 ms
        emit(i) // 发射下一个值
    }
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val time = measureTimeMillis {
        simple()
            .collectLatest { value -> // 在最新值产生时取消并重启
                println("Collecting $value") 
                delay(300) // 假装我们处理了 300 ms
                println("Done $value") 
            } 
    }   
    println("Collected in $time ms")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-19.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-19.kt)获取完整代码。
>
{style="note"}
 
由于 [collectLatest] 的体耗时 300 ms，但每 100 ms 就会发射新值，我们看到该块对每个值都运行了，但只为最后一个值完成了执行：

```text 
Collecting 1
Collecting 2
Collecting 3
Done 3
Collected in 741 ms
``` 

<!--- TEST ARBITRARY_TIME -->

## 组合多个 Flow

有多种方式可以组合多个 Flow。

### Zip

就像 Kotlin 标准库中的 [Sequence.zip] 扩展函数一样，Flow 有一个 [zip] 操作符，用于组合两个 Flow 的对应值：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> { 
//sampleStart                                                                           
    val nums = (1..3).asFlow() // 数字 1..3
    val strs = flowOf("one", "two", "three") // 字符串 
    nums.zip(strs) { a, b -> "$a -> $b" } // 组合为单个字符串
        .collect { println(it) } // 收集并打印
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-20.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-20.kt)获取完整代码。
>
{style="note"}

该示例打印：

```text
1 -> one
2 -> two
3 -> three
```
 
<!--- TEST -->

### Combine

当 Flow 表示变量或操作的最新值时 (另请参阅[合并为空](#conflation)的相关章节)，可能需要执行依赖于对应 Flow 最新值的计算，并在任何上游 Flow 发射值时重新计算。对应的操作符族称为 [combine]。

例如，如果上例中的数字每 300 ms 更新一次，而字符串每 400 ms 更新一次，那么使用 [zip] 操作符进行组合仍将产生相同的结果，尽管结果每 400 ms 打印一次：

> 我们在此示例中使用 [onEach] 中间操作符来延迟每个元素，并使发射样本 Flow 的代码更加声明式且更短。
>
{style="note"}

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> { 
//sampleStart                                                                           
    val nums = (1..3).asFlow().onEach { delay(300) } // 每 300 ms 数字 1..3
    val strs = flowOf("one", "two", "three").onEach { delay(400) } // 每 400 ms 字符串
    val startTime = System.currentTimeMillis() // 记录开始时间 
    nums.zip(strs) { a, b -> "$a -> $b" } // 使用 "zip" 组合单个字符串
        .collect { value -> // 收集并打印 
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-21.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-21.kt)获取完整代码。
>
{style="note"}

<!--- TEST ARBITRARY_TIME
1 -> one at 437 ms from start
2 -> two at 837 ms from start
3 -> three at 1243 ms from start
-->

然而，在这里使用 [combine] 操作符代替 [zip] 时：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> { 
//sampleStart                                                                           
    val nums = (1..3).asFlow().onEach { delay(300) } // 每 300 ms 数字 1..3
    val strs = flowOf("one", "two", "three").onEach { delay(400) } // 每 400 ms 字符串          
    val startTime = System.currentTimeMillis() // 记录开始时间 
    nums.combine(strs) { a, b -> "$a -> $b" } // 使用 "combine" 组合单个字符串
        .collect { value -> // 收集并打印 
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-22.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-22.kt)获取完整代码。
>
{style="note"}

我们得到了完全不同的输出，其中每当 `nums` 或 `strs` Flow 中有发射时都会打印一行：

```text 
1 -> one at 452 ms from start
2 -> one at 651 ms from start
2 -> two at 854 ms from start
3 -> two at 952 ms from start
3 -> three at 1256 ms from start
```

<!--- TEST ARBITRARY_TIME -->

## 展平流

Flow 表示异步接收的值序列，因此很容易遇到每个值都触发对另一个值序列请求的情况。例如，我们可以有以下函数，它以 500 ms 的间隔返回包含两个字符串的 Flow：

```kotlin
fun requestFlow(i: Int): Flow<String> = flow {
    emit("$i: First") 
    delay(500) // 等待 500 ms
    emit("$i: Second")    
}
```

<!--- CLEAR -->

现在，如果我们有一个包含三个整数的 Flow，并对其中每一个调用 `requestFlow`，如下所示：

```kotlin
(1..3).asFlow().map { requestFlow(it) }
```

<!--- CLEAR -->

那么我们将得到一个 Flow 的 Flow (`Flow<Flow<String>>`)，需要将其*展平*为单个 Flow 以进行进一步处理。集合和序列为此提供了 [flatten][Sequence.flatten] 和 [flatMap][Sequence.flatMap] 操作符。然而，由于 Flow 的异步性，它们需要不同的展平*模式*，因此 Flow 上存在一族展平操作符。

### flatMapConcat

Flow 的 Flow 的串接由 [flatMapConcat] 和 [flattenConcat] 操作符提供。它们是对应序列操作符最直接的类似物。如以下示例所示，它们会等待内部 Flow 完成后再开始收集下一个：

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
<!--- KNIT example-flow-23.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-23.kt)获取完整代码。
>
{style="note"}

[flatMapConcat] 的顺序执行特性在输出中清晰可见：

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

另一种展平操作是并发收集所有传入的 Flow，并将它们的值合并为单个 Flow，以便尽快发射值。
它由 [flatMapMerge] 和 [flattenMerge] 操作符实现。它们都接受一个可选的 `concurrency` 参数，用于限制同时收集的并发 Flow 数量 (默认等于 [DEFAULT_CONCURRENCY])。

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
    (1..3).asFlow().onEach { delay(100) } // 每 100 ms 一个数字 
        .flatMapMerge { requestFlow(it) }                                                                           
        .collect { value -> // 收集并打印 
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-24.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-24.kt)获取完整代码。
>
{style="note"}

[flatMapMerge] 的并发性质是显而易见的：

```text                      
1: First at 136 ms from start
2: First at 231 ms from start
3: First at 333 ms from start
1: Second at 639 ms from start
2: Second at 732 ms from start
3: Second at 833 ms from start
```                                               

<!--- TEST ARBITRARY_TIME -->

> 请注意，[flatMapMerge] 会顺序调用其代码块 (在此示例中为 `{ requestFlow(it) }`)，但并发收集生成的 Flow，这相当于先执行顺序的 `map { requestFlow(it) }`，然后对结果调用 [flattenMerge]。
>
{style="note"}

### flatMapLatest   

与 ["处理最新值"](#processing-the-latest-value) 章节中描述的 [collectLatest] 操作符类似，存在对应的 "Latest" 展平模式，一旦发射新 Flow，就会取消前一个 Flow 的收集。它由 [flatMapLatest] 操作符实现。

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
    (1..3).asFlow().onEach { delay(100) } // 每 100 ms 一个数字 
        .flatMapLatest { requestFlow(it) }                                                                           
        .collect { value -> // 收集并打印 
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-25.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-25.kt)获取完整代码。
>
{style="note"}

本例中的输出很好地演示了 [flatMapLatest] 的工作方式：

```text                      
1: First at 142 ms from start
2: First at 322 ms from start
3: First at 425 ms from start
3: Second at 931 ms from start
```                                               

<!--- TEST ARBITRARY_TIME -->
  
> 请注意，当接收到新值时，[flatMapLatest] 会取消其块中的所有代码 (在此示例中为 `{ requestFlow(it) }`)。
> 在这个特定示例中，这没有区别，因为 `requestFlow` 本身的调用很快、非挂起，并且无法被取消。但是，如果我们要在 `requestFlow` 中使用诸如 `delay` 之类的挂起函数，输出中的差异将是可见的。
>
{style="note"}

## Flow 异常

当发射器或操作符内部的代码抛出异常时，Flow 收集可能会以异常结束。有几种方法可以处理这些异常。

### 收集器 try 与 catch

收集器可以使用 Kotlin 的 [`try/catch`][exceptions] 块来处理异常： 

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        println("Emitting $i")
        emit(i) // 发射下一个值
    }
}

fun main() = runBlocking<Unit> {
    try {
        simple().collect { value ->         
            println(value)
            check(value <= 1) { "Collected $value" }
        }
    } catch (e: Throwable) {
        println("Caught $e")
    } 
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-26.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-26.kt)获取完整代码。
>
{style="note"}

这段代码成功捕获了 [collect] 终端操作符中的异常，而且正如我们所见，在那之后不再发射任何值：

```text 
Emitting 1
1
Emitting 2
2
Caught java.lang.IllegalStateException: Collected 2
```

<!--- TEST -->

### 一切都被捕获

前面的示例实际上捕获了发射器中或任何中间或终端操作符中发生的任何异常。
例如，让我们更改代码，使发射的值被 [映射][map] 为字符串，但相应的代码产生了一个异常：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
fun simple(): Flow<String> = 
    flow {
        for (i in 1..3) {
            println("Emitting $i")
            emit(i) // 发射下一个值
        }
    }
    .map { value ->
        check(value <= 1) { "Crashed on $value" }                 
        "string $value"
    }

fun main() = runBlocking<Unit> {
    try {
        simple().collect { value -> println(value) }
    } catch (e: Throwable) {
        println("Caught $e")
    } 
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-27.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-27.kt)获取完整代码。
>
{style="note"}

此异常仍被捕获，并且收集停止：

```text 
Emitting 1
string 1
Emitting 2
Caught java.lang.IllegalStateException: Crashed on 2
```

<!--- TEST -->

## 异常透明性

但是，发射器的代码如何封装其异常处理行为呢？

Flow 必须*对异常透明*，而在 `flow { ... }` 构建器中的 `try/catch` 块内部 [发射][FlowCollector.emit] 值是违反异常透明性的。这保证了抛出异常的收集器始终可以使用 `try/catch` 捕获它，如前面的示例所示。

发射器可以使用 [catch] 操作符，该操作符保留了这种异常透明性并允许封装其异常处理。`catch` 操作符的体可以分析异常，并根据捕获到的异常以不同方式做出反应：

* 可以使用 `throw` 重新抛出异常。
* 可以使用 [catch] 体内的 [发射][FlowCollector.emit] 将异常转换为值的发射。
* 异常可以被忽略、记录或由其他代码处理。

例如，让我们在捕获异常时发射文本：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun simple(): Flow<String> = 
    flow {
        for (i in 1..3) {
            println("Emitting $i")
            emit(i) // 发射下一个值
        }
    }
    .map { value ->
        check(value <= 1) { "Crashed on $value" }                 
        "string $value"
    }

fun main() = runBlocking<Unit> {
//sampleStart
    simple()
        .catch { e -> emit("Caught $e") } // 异常时发射
        .collect { value -> println(value) }
//sampleEnd
}            
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-28.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-28.kt)获取完整代码。
>
{style="note"} 
 
示例的输出是相同的，即使我们不再在代码周围使用 `try/catch`。

<!--- TEST  
Emitting 1
string 1
Emitting 2
Caught java.lang.IllegalStateException: Crashed on 2
-->

### 透明捕获

[catch] 中间操作符遵循异常透明性，仅捕获上游异常 (即来自 `catch` 之上所有操作符的异常，但不包括之下的异常)。如果 `collect { ... }` 中的块 (位于 `catch` 之下) 抛出异常，则它会逃逸：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        println("Emitting $i")
        emit(i)
    }
}

fun main() = runBlocking<Unit> {
    simple()
        .catch { e -> println("Caught $e") } // 不捕获下游异常
        .collect { value ->
            check(value <= 1) { "Collected $value" }                 
            println(value) 
        }
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-29.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-29.kt)获取完整代码。
>
{style="note"}
 
尽管有 `catch` 操作符，但并未打印 "Caught ..." 消息： 

```text  
Emitting 1
1
Emitting 2
Exception in thread "main" java.lang.IllegalStateException: Collected 2
	at ...
```

<!--- TEST EXCEPTION -->

### 声明式捕获

我们可以通过将 [collect] 操作符的体移动到 [onEach] 中并将其置于 `catch` 操作符之前，将 [catch] 操作符的声明式性质与处理所有异常的愿望结合起来。必须通过调用不带参数的 `collect()` 来触发此 Flow 的收集：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        println("Emitting $i")
        emit(i)
    }
}

fun main() = runBlocking<Unit> {
//sampleStart
    simple()
        .onEach { value ->
            check(value <= 1) { "Collected $value" }                 
            println(value) 
        }
        .catch { e -> println("Caught $e") }
        .collect()
//sampleEnd
}            
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-30.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-30.kt)获取完整代码。
>
{style="note"} 
 
现在我们可以看到打印了 "Caught ..." 消息，因此我们可以捕获所有异常，而无需显式使用 `try/catch` 块： 

```text 
Emitting 1
1
Emitting 2
Caught java.lang.IllegalStateException: Collected 2
```

<!--- TEST EXCEPTION -->

## Flow 完成

当 Flow 收集完成 (正常或异常) 时，可能需要执行一个操作。 
正如您可能已经注意到的，这可以通过两种方式完成：命令式或声明式。

### 命令式 finally 块

除了 `try`/`catch` 之外，收集器还可以使用 `finally` 块在 `collect` 完成时执行操作。

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
<!--- KNIT example-flow-31.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-31.kt)获取完整代码。
>
{style="note"} 

这段代码打印 `simple` Flow 产生的三个数字，随后是 "Done" 字符串：

```text
1
2
3
Done
```

<!--- TEST  -->

### 声明式处理

对于声明式方法，Flow 具有 [onCompletion] 中间操作符，它在 Flow 完全收集完毕时被调用。

可以使用 [onCompletion] 操作符重写前面的示例，并产生相同的输出：

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
<!--- KNIT example-flow-32.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-32.kt)获取完整代码。
>
{style="note"} 

<!--- TEST 
1
2
3
Done
-->

[onCompletion] 的主要优势是 lambda 的可空 `Throwable` 参数，该参数可用于确定 Flow 收集是正常完成还是异常完成。在以下示例中，`simple` Flow 在发射数字 1 后抛出了异常：

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
<!--- KNIT example-flow-33.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-33.kt)获取完整代码。
>
{style="note"}

如您所料，它打印：

```text
1
Flow completed exceptionally
Caught exception
```

<!--- TEST -->

[onCompletion] 操作符与 [catch] 不同，它不处理异常。正如我们从上面的示例代码中所见，异常仍然会向下游流动。它将被交付给进一步的 `onCompletion` 操作符，并可以用 `catch` 操作符处理。

### 成功完成

与 [catch] 操作符的另一个区别是，[onCompletion] 能看到所有异常，并且仅在上游 Flow 成功完成 (没有取消或失败) 时才接收到 `null` 异常。

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
<!--- KNIT example-flow-34.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-34.kt)获取完整代码。
>
{style="note"}

我们可以看到完成原因是其不为 null，因为 Flow 由于下游异常而中止了：

```text 
1
Flow completed with java.lang.IllegalStateException: Collected 2
Exception in thread "main" java.lang.IllegalStateException: Collected 2
```

<!--- TEST EXCEPTION -->

## 命令式 vs 声明式

现在我们知道如何以命令式和声明式两种方式收集 Flow，并处理其完成和异常。
一个自然的问题是：哪种方法更受推崇，为什么？
作为一个库，我们不倡导任何特定的方法，并相信这两个选项都是有效的，应根据您自己的偏好和编码风格进行选择。 

## 启动 Flow

使用 Flow 表示来自某些源的异步事件非常容易。
在这种情况下，我们需要类似于 `addEventListener` 的函数，它注册一段代码对传入事件做出反应并继续后续工作。[onEach] 操作符可以承担这个角色。 
然而，`onEach` 是一个中间操作符。我们还需要一个终端操作符来收集 Flow。否则，仅调用 `onEach` 是没有效果的。
 
如果在 `onEach` 之后使用 [collect] 终端操作符，那么其后的代码将等待直到 Flow 被收集完成：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
// 模仿一个事件流
fun events(): Flow<Int> = (1..3).asFlow().onEach { delay(100) }

fun main() = runBlocking<Unit> {
    events()
        .onEach { event -> println("Event: $event") }
        .collect() // <--- 收集 flow 处会等待
    println("Done")
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-35.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-35.kt)获取完整代码。
>
{style="note"} 
  
如您所见，它打印：

```text 
Event: 1
Event: 2
Event: 3
Done
```    

<!--- TEST -->
 
[launchIn] 终端操作符在这里派上了用场。通过将 `collect` 替换为 `launchIn`，我们可以在单独的协程中启动 Flow 的收集，从而立即继续执行后续代码：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 模仿一个事件流
fun events(): Flow<Int> = (1..3).asFlow().onEach { delay(100) }

//sampleStart
fun main() = runBlocking<Unit> {
    events()
        .onEach { event -> println("Event: $event") }
        .launchIn(this) // <--- 在单独的协程中启动 flow
    println("Done")
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-36.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-36.kt)获取完整代码。
>
{style="note"} 
  
打印结果如下：

```text          
Done
Event: 1
Event: 2
Event: 3
```    

<!--- TEST -->

`launchIn` 的必需参数必须指定一个 [CoroutineScope]，用于启动收集 Flow 的协程。在上述示例中，此作用域来自 [runBlocking] 协程构建器，因此当 Flow 正在运行时，此 [runBlocking] 作用域会等待其子协程完成，并防止 main 函数返回并终止此示例。 

在实际应用中，作用域将来自一个生命周期受限的实体。一旦该实体的生命周期终止，相应的作用域就会被取消，从而取消对应 Flow 的收集。通过这种方式，`onEach { ... }.launchIn(scope)` 对的工作方式就像 `addEventListener`。然而，不需要对应的 `removeEventListener` 函数，因为取消和结构化并发起到了这个作用。

请注意，[launchIn] 还会返回一个 [Job]，它可以用于仅 [取消][Job.cancel] 相应的 Flow 收集协程，而不取消整个作用域，或者用于 [等待][Job.join] 它。

### Flow 取消检查

为了方便起见，[flow][_flow] 构建器会对每个发射的值执行额外的 [ensureActive] 取消检查。这意味着从 `flow { ... }` 发射的繁忙循环是可取消的：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart           
fun foo(): Flow<Int> = flow { 
    for (i in 1..5) {
        println("Emitting $i") 
        emit(i) 
    }
}

fun main() = runBlocking<Unit> {
    foo().collect { value -> 
        if (value == 3) cancel()  
        println(value)
    } 
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-37.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-37.kt)获取完整代码。
>
{style="note"}

我们只得到了直到 3 的数字，并在尝试发射数字 4 后得到了一个 [CancellationException]：

```text 
Emitting 1
1
Emitting 2
2
Emitting 3
3
Emitting 4
Exception in thread "main" kotlinx.coroutines.JobCancellationException: BlockingCoroutine was cancelled; job="coroutine#1":BlockingCoroutine{Cancelled}@6d7b4f4c
```

<!--- TEST EXCEPTION -->

然而，出于性能考虑，大多数其他 Flow 操作符自身不会执行额外的取消检查。 
例如，如果您使用 [IntRange.asFlow] 扩展来编写相同的繁忙循环并且不在任何地方挂起，那么就不会进行取消检查：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart           
fun main() = runBlocking<Unit> {
    (1..5).asFlow().collect { value -> 
        if (value == 3) cancel()  
        println(value)
    } 
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-38.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-38.kt)获取完整代码。
>
{style="note"}

从 1 到 5 的所有数字都被收集了，只有在从 `runBlocking` 返回之前才检测到取消：

```text
1
2
3
4
5
Exception in thread "main" kotlinx.coroutines.JobCancellationException: BlockingCoroutine was cancelled; job="coroutine#1":BlockingCoroutine{Cancelled}@3327bd23
```

<!--- TEST EXCEPTION -->

#### 使繁忙的 Flow 可取消 

如果您在使用协程的繁忙循环，则必须显式检查取消。
您可以添加 `.onEach { currentCoroutineContext().ensureActive() }`，但提供了一个现成的 [cancellable] 操作符来执行此操作：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart           
fun main() = runBlocking<Unit> {
    (1..5).asFlow().cancellable().collect { value -> 
        if (value == 3) cancel()  
        println(value)
    } 
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-39.kt -->
> 您可以在[此处](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-39.kt)获取完整代码。
>
{style="note"}

使用 `cancellable` 操作符，仅收集了从 1 到 3 的数字：

```text
1
2
3
Exception in thread "main" kotlinx.coroutines.JobCancellationException: BlockingCoroutine was cancelled; job="coroutine#1":BlockingCoroutine{Cancelled}@5ec0a365
```

<!--- TEST EXCEPTION -->

## Flow 与响应式流

对于那些熟悉 [Reactive Streams](https://www.reactive-streams.org/) 或响应式框架 (如 RxJava 和 project Reactor) 的人来说，Flow 的设计可能看起来非常熟悉。

事实上，它的设计灵感来自 Reactive Streams 及其各种实现。但 Flow 的主要目标是拥有尽可能简单的设计，对 Kotlin 和挂起友好，并尊重结构化并发。如果没有响应式先驱及其巨大工作，实现这一目标是不可能的。您可以在 [Reactive Streams and Kotlin Flows](https://medium.com/@elizarov/reactive-streams-and-kotlin-flows-bfd12772cda4) 一文中阅读完整故事。

虽然在概念上有所不同，但 Flow *是*响应式流，可以将它转换为符合响应式 (规范和 TCK 兼容) 的 Publisher，反之亦然。
此类转换器由 `kotlinx.coroutines` 开箱即用提供，可以在相应的响应式模块中找到 (`kotlinx-coroutines-reactive` 对应 Reactive Streams，`kotlinx-coroutines-reactor` 对应 Project Reactor，`kotlinx-coroutines-rx2`/`kotlinx-coroutines-rx3` 对应 RxJava2/RxJava3)。
集成模块包括与 `Flow` 之间的相互转换、与 Reactor 的 `Context` 集成，以及以挂起友好的方式处理各种响应式实体。
 
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

[delay]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/delay.html
[withTimeoutOrNull]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-timeout-or-null.html
[Dispatchers.Default]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-default.html
[Dispatchers.Main]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-main.html
[withContext]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-context.html
[CoroutineDispatcher]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-dispatcher/index.html
[CoroutineScope]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/index.html
[runBlocking]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/run-blocking.html
[Job]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/index.html
[Job.cancel]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/cancel.html
[Job.join]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/join.html
[ensureActive]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/ensure-active.html
[CancellationException]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-cancellation-exception/index.html

<!--- INDEX kotlinx.coroutines.flow -->

[Flow]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow/index.html
[_flow]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow.html
[FlowCollector.emit]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow-collector/emit.html
[collect]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/collect.html
[flowOf]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow-of.html
[map]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map.html
[filter]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/filter.html
[transform]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/transform.html
[take]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/take.html
[toList]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/to-list.html
[toSet]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/to-set.html
[first]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/first.html
[single]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/single.html
[reduce]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/reduce.html
[fold]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/fold.html
[flowOn]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow-on.html
[buffer]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/buffer.html
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
[catch]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/catch.html
[onCompletion]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-completion.html
[launchIn]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/launch-in.html
[IntRange.asFlow]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/as-flow.html
[cancellable]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/cancellable.html

<!--- END -->