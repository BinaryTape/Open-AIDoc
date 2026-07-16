<!--- TEST_NAME FlowGuideTest --> 
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 非同步 Flow)

暫停函式可以非同步地傳回單個值，但我們該如何傳回多個非同步計算的值呢？這就是 Kotlin Flow 出場的地方。

## 表示多個值

在 Kotlin 中可以使用 [集合][collections] 來表示多個值。例如，我們可以有一個 `simple` 函式，它傳回一個包含三個數字的 [List]，然後使用 [forEach] 將它們全部列印出來：

```kotlin
fun simple(): `List<Int>` = listOf(1, 2, 3)
 
fun main() {
    simple().forEach { value -> println(value) } 
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-01.kt -->
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-01.kt) 獲取完整程式碼。
>
{style="note"}

這段程式碼的輸出為：

```text
1
2
3
```

<!--- TEST -->

### Sequence

如果我們正在使用某些耗費 CPU 的阻塞程式碼來計算數字（每次計算花費 100 ms），那麼我們可以使用 [Sequence] 來表示這些數字：

```kotlin
fun simple(): Sequence<Int> = sequence { // sequence 建置器
    for (i in 1..3) {
        Thread.sleep(100) // 模擬我們正在計算
        yield(i) // 產生下一個值
    }
}

fun main() {
    simple().forEach { value -> println(value) } 
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-02.kt -->
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-02.kt) 獲取完整程式碼。
>
{style="note"}

這段程式碼輸出的數字相同，但在列印每個數字之前會等待 100 ms。

<!--- TEST 
1
2
3
-->

### 暫停函式

然而，這種計算會阻塞執行該程式碼的主執行緒。當這些值是由非同步程式碼計算時，我們可以用 `suspend` 修飾符標記 `simple` 函式，這樣它就可以在不阻塞的情況下執行工作，並將結果作為列表傳回：

```kotlin
import kotlinx.coroutines.*                 
                           
//sampleStart
suspend fun simple(): `List<Int>` {
    delay(1000) // 模擬我們正在這裡執行某些非同步操作
    return listOf(1, 2, 3)
}

fun main() = runBlocking<Unit> {
    simple().forEach { value -> println(value) } 
}
//sampleEnd
```  
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-03.kt -->
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-03.kt) 獲取完整程式碼。
>
{style="note"}

這段程式碼在等待一秒後會列印數字。

<!--- TEST 
1
2
3
-->

### Flow

使用 `List<Int>` 結果型別意味著我們只能一次傳回所有值。為了表示非同步計算的值流，我們可以使用 [`Flow<Int>`][Flow] 型別，就像針對同步計算的值使用 `Sequence<Int>` 型別一樣：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart               
fun simple(): Flow<Int> = flow { // flow 建置器
    for (i in 1..3) {
        delay(100) // 模擬我們正在這裡執行某些有用的操作
        emit(i) // 發射下一個值
    }
}

fun main() = runBlocking<Unit> {
    // 啟動一個並發協程來檢查主執行緒是否被阻塞
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
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-04.kt) 獲取完整程式碼。
>
{style="note"}

這段程式碼在不阻塞主執行緒的情況下，在列印每個數字之前等待 100 ms。這可以透過在主執行緒中執行的獨立協程每隔 100 ms 列印一次「I'm not blocked」來驗證：

```text
I'm not blocked 1
1
I'm not blocked 2
2
I'm not blocked 3
3
```

<!--- TEST -->

請注意前面範例中與 [Flow] 程式碼的以下不同之處：

* [Flow] 型別的建置器函式稱為 [flow][_flow]。
* `flow { ... }` 建置器區塊內的程式碼可以暫停。
* `simple` 函式不再標記有 `suspend` 修飾符。   
* 使用 [emit][FlowCollector.emit] 函式從 Flow 中「發射」值。
* 使用 [collect][collect] 函式從 Flow 中「收集」值。  

> 我們可以在 `simple` 的 `flow { ... }` 內容中將 [delay] 替換為 `Thread.sleep`，並觀察到在這種情況下主執行緒會被阻塞。
>
{style="note"}

## Flow 是冷的

Flow 是類似於 Sequence 的「冷（cold）」流 &mdash; [flow][_flow] 建置器內部的程式碼在 Flow 被收集之前不會執行。這在以下範例中變得顯而易見：

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
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-05.kt) 獲取完整程式碼。
>
{style="note"}

列印結果：

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
 
這是 `simple` 函式（傳回 Flow）未標記 `suspend` 修飾符的一個關鍵原因。`simple()` 呼叫本身會迅速傳回且不等待任何內容。Flow 每次被收集時都會重新開始，這就是為什麼我們每次再次呼叫 `collect` 時都會看到「Flow started」的原因。

## Flow 取消基礎

Flow 遵循協程的一般協作式取消。通常情況下，當 Flow 在可取消的暫停函式（如 [delay]）中暫停時，Flow 收集可以被取消。以下範例顯示了當在 [withTimeoutOrNull] 區塊中執行時，Flow 如何在逾時後被取消並停止執行其程式碼：

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
    withTimeoutOrNull(250) { // 在 250 ms 後逾時 
        simple().collect { value -> println(value) } 
    }
    println("Done")
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-06.kt -->
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-06.kt) 獲取完整程式碼。
>
{style="note"}

請注意 `simple` 函式中的 Flow 僅發射了兩個數字，產生以下輸出：

```text
Emitting 1
1
Emitting 2
2
Done
```

<!--- TEST -->

有關詳細資訊，請參閱 [Flow 取消檢查](#flow-cancellation-checks) 章節。

## Flow 建置器

前面範例中的 `flow { ... }` 建置器是最基礎的一個。還有其他建置器可以宣告 Flow：

* [flowOf] 建置器定義了一個發射固定值集的 Flow。
* 各種集合與 Sequence 可以使用 `.asFlow()` 擴充函式轉換為 Flow。

例如，將 Flow 中列印數字 1 到 3 的程式碼片段可以改寫如下：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> {
//sampleStart
    // 將整數範圍轉換為 flow
    (1..3).asFlow().collect { value -> println(value) }
//sampleEnd 
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-07.kt -->
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-07.kt) 獲取完整程式碼。
>
{style="note"}

<!--- TEST
1
2
3
-->

## 中間 Flow 運算子

可以使用運算子對 Flow 進行轉換，就像您轉換集合與 Sequence 一樣。中間運算子應用於上游 Flow 並傳回下游 Flow。這些運算子是冷的，就像 Flow 一樣。對此類運算子的呼叫本身並非暫停函式。它工作迅速，傳回一個新轉換後的 Flow 定義。

基礎運算子具有熟悉的名稱，如 [map] 與 [filter]。這些運算子與 Sequence 的一個重要區別在於，這些運算子內部的程式碼區塊可以呼叫暫停函式。

例如，傳入請求的 Flow 可以使用 [map] 運算子對應到其結果，即使執行請求是由暫停函式實作的耗時操作：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart           
suspend fun performRequest(request: Int): String {
    delay(1000) // 模擬耗時的非同步工作
    return "response $request"
}

fun main() = runBlocking<Unit> {
    (1..3).asFlow() // 一個請求 flow
        .map { request -> performRequest(request) }
        .collect { response -> println(response) }
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-08.kt -->
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-08.kt) 獲取完整程式碼。
>
{style="note"}

它產生以下三行，每行都在前一行的一秒後出現：

```text                                                                    
response 1
response 2
response 3
```

<!--- TEST -->

### Transform 運算子

在 Flow 轉換運算子中，最通用的一個稱為 [transform]。它可以用於模仿簡單的轉換（如 [map] 與 [filter]），也可以實作更複雜的轉換。使用 `transform` 運算子，我們可以 [發射][FlowCollector.emit] 任意數量的任意值。

例如，使用 `transform` 我們可以在執行耗時的非同步請求之前發射一個字串，然後緊隨其後發射回應：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

suspend fun performRequest(request: Int): String {
    delay(1000) // 模擬耗時的非同步工作
    return "response $request"
}

fun main() = runBlocking<Unit> {
//sampleStart
    (1..3).asFlow() // 一個請求 flow
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
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-09.kt) 獲取完整程式碼。
>
{style="note"}

這段程式碼的輸出為：

```text
Making request 1
response 1
Making request 2
response 2
Making request 3
response 3
```

<!--- TEST -->

### 限制大小的運算子

限制大小的中間運算子（如 [take]）在達到相應限制時會取消 Flow 的執行。協程中的取消始終透過拋出例外來執行，因此所有資源管理函式（如 `try { ... } finally { ... }` 區塊）在取消的情況下都能正常運作：

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
        .take(2) // 僅取前兩個
        .collect { value -> println(value) }
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-10.kt -->
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-10.kt) 獲取完整程式碼。
>
{style="note"}

這段程式碼的輸出清楚地顯示，`numbers()` 函式中的 `flow { ... }` 主體執行在發射第二個數字後停止了：

```text       
1
2
Finally in numbers
```

<!--- TEST -->

## 終端 Flow 運算子

Flow 上的終端運算子是啟動 Flow 收集的 _暫停函式_。[collect] 運算子是最基礎的一個，但還有其他終端運算子可以使其更簡單：

* 轉換為各種集合，如 [toList] 與 [toSet]。
* 獲取 [第一個][first] 值以及確保 Flow 只發射 [單個][single] 值的運算子。
* 使用 [reduce] 與 [fold] 將 Flow 歸納為一個值。

例如：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> {
//sampleStart         
    val sum = (1..5).asFlow()
        .map { it * it } // 1 到 5 數字的平方                           
        .reduce { a, b -> a + b } // 將它們相加（終端運算子）
    println(sum)
//sampleEnd     
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-11.kt -->
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-11.kt) 獲取完整程式碼。
>
{style="note"}

列印單個數字：

```text
55
```

<!--- TEST -->

## Flow 是循序的

除非使用了操作多個 Flow 的特殊運算子，否則 Flow 的每次單獨收集都是循序執行的。收集直接在呼叫終端運算子的協程中工作。預設情況下不啟動新的協程。每個發射的值都會由從上游到下游的所有中間運算子進行處理，然後在之後傳遞給終端運算子。

請看以下範例，該範例過濾偶數並將其對應為字串：

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
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-12.kt) 獲取完整程式碼。
>
{style="note"}

產生：

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

Flow 的收集始終發生在呼叫協程的上下文中。例如，如果有個 `simple` Flow，那麼以下程式碼將在該程式碼作者指定的上下文中執行，而不論 `simple` Flow 的實作細節如何：

```kotlin
withContext(context) {
    simple().collect { value ->
        println(value) // 在指定的上下文中執行 
    }
}
```

<!--- CLEAR -->

Flow 的這種特性稱為 _上下文保留（context preservation）_。

因此，預設情況下，`flow { ... }` 建置器中的程式碼在對應 Flow 的收集器提供的上下文中執行。例如，考慮 `simple` 函式的實作，它列印被呼叫時所在的執行緒並發射三個數字：

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
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-13.kt) 獲取完整程式碼。
>
{style="note"}

執行這段程式碼產生：

```text  
[main @coroutine#1] Started simple flow
[main @coroutine#1] Collected 1
[main @coroutine#1] Collected 2
[main @coroutine#1] Collected 3
```

<!--- TEST FLEXIBLE_THREAD -->

由於 `simple().collect` 是從主執行緒呼叫的，因此 `simple` 的 Flow 主體也在主執行緒中呼叫。這對於不在乎執行上下文且不阻塞呼叫者的快速執行或非同步程式碼來說，是完美的預設設定。

### 使用 withContext 時常見的陷阱

然而，長時間運行的 CPU 消耗型程式碼可能需要在 [Dispatchers.Default] 上下文中執行，而 UI 更新程式碼可能需要在 [Dispatchers.Main] 上下文中執行。通常，在搭配 Kotlin 協程使用時會使用 [withContext] 來更改程式碼中的上下文，但 `flow { ... }` 建置器中的程式碼必須遵守上下文保留屬性，且不允許從不同的上下文中 [發射][FlowCollector.emit] 值。

嘗試執行以下程式碼：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
                      
//sampleStart
fun simple(): Flow<Int> = flow {
    // 在 flow 建置器中更改 CPU 消耗型程式碼上下文的錯誤方式
    kotlinx.coroutines.withContext(Dispatchers.Default) {
        for (i in 1..3) {
            Thread.sleep(100) // 模擬我們正以消耗 CPU 的方式進行計算
            emit(i) // 發射下一個值
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
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-14.kt) 獲取完整程式碼。
>
{style="note"}

這段程式碼會產生以下例外：

```text
Exception in thread "main" java.lang.IllegalStateException: Flow invariant is violated:
		Flow was collected in [CoroutineId(1), "coroutine#1":BlockingCoroutine{Active}@5511c7f8, BlockingEventLoop@2eac3323],
		but emission happened in [CoroutineId(1), "coroutine#1":DispatchedCoroutine{Active}@2dae0000, Dispatchers.Default].
		Please refer to 'flow' documentation or use 'flowOn' instead
	at ...
``` 

<!--- TEST EXCEPTION -->

### flowOn 運算子
   
該例外提到了應使用 [flowOn] 函式來更改 Flow 發射的上下文。更改 Flow 上下文的正確方式如下例所示，該範例還列印了對應執行緒的名稱以顯示其運作方式：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun log(msg: String) = println("[${Thread.currentThread().name}] $msg")
           
//sampleStart
fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        Thread.sleep(100) // 模擬我們正以消耗 CPU 的方式進行計算
        log("Emitting $i")
        emit(i) // 發射下一個值
    }
}.flowOn(Dispatchers.Default) // 在 flow 建置器中更改 CPU 消耗型程式碼上下文的正確方式

fun main() = runBlocking<Unit> {
    simple().collect { value ->
        log("Collected $value") 
    } 
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-15.kt -->
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-15.kt) 獲取完整程式碼。
>
{style="note"}
  
請注意 `flow { ... }` 是如何在背景執行緒中工作的，而收集則發生在主執行緒中：

```text
[DefaultDispatcher-worker-1 @coroutine#2] Emitting 1
[main @coroutine#1] Collected 1
[DefaultDispatcher-worker-1 @coroutine#2] Emitting 2
[main @coroutine#1] Collected 2
[DefaultDispatcher-worker-1 @coroutine#2] Emitting 3
[main @coroutine#1] Collected 3
```

<!--- TEST FLEXIBLE_THREAD -->

這裡要觀察的另一點是 [flowOn] 運算子更改了 Flow 預設的循序性質。現在收集發生在一個協程（"coroutine#1"）中，而發射發生在另一個與收集協程併發執行的協程（"coroutine#2"）中，後者在另一個執行緒中運行。當 [flowOn] 運算子必須更改其上下文中的 [CoroutineDispatcher] 時，它會為上游 Flow 建立另一個協程。

## 緩衝

從整體收集 Flow 所需時間的角度來看，在不同的協程中執行 Flow 的不同部分會很有幫助，特別是涉及長時間運行的非同步操作時。例如，考慮一種情況，`simple` Flow 的發射很慢，需要 100 ms 才能產生一個元素；而收集器也很慢，需要 300 ms 才能處理一個元素。讓我們看看收集這樣一個具有三個數字的 Flow 需要多長時間：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.system.*

//sampleStart
fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100) // 模擬我們非同步地等待了 100 ms
        emit(i) // 發射下一個值
    }
}

fun main() = runBlocking<Unit> { 
    val time = measureTimeMillis {
        simple().collect { value -> 
            delay(300) // 模擬我們處理了 300 ms
            println(value) 
        } 
    }   
    println("Collected in $time ms")
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-16.kt -->
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-16.kt) 獲取完整程式碼。
>
{style="note"}

它產生的結果大約如下，整個收集大約花費 1200 ms（三個數字，每個 400 ms）：

```text
1
2
3
Collected in 1220 ms
```

<!--- TEST ARBITRARY_TIME -->

我們可以在 Flow 上使用 [buffer] 運算子，以併發方式執行 `simple` Flow 的發射程式碼與收集程式碼，而不是循序執行：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.system.*

fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100) // 模擬我們非同步地等待了 100 ms
        emit(i) // 發射下一個值
    }
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val time = measureTimeMillis {
        simple()
            .buffer() // 緩衝發射的值，不要等待
            .collect { value -> 
                delay(300) // 模擬我們處理了 300 ms
                println(value) 
            } 
    }   
    println("Collected in $time ms")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-17.kt -->
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-17.kt) 獲取完整程式碼。
>
{style="note"}

它以更快的速度產生相同的數字，因為我們有效地建立了一個處理管線，只需為第一個數字等待 100 ms，然後僅需花費 300 ms 來處理每個數字。這樣一來，運行大約需要 1000 ms：

```text
1
2
3
Collected in 1071 ms
```                    

<!--- TEST ARBITRARY_TIME -->

> 請注意，當 [flowOn] 運算子必須更改 [CoroutineDispatcher] 時，它會使用相同的緩衝機制，但在這裡我們是明確請求緩衝而不更改執行上下文。
>
{style="note"}

### 合併（Conflation）

當 Flow 表示操作的局部結果或操作狀態更新時，可能不需要處理每個值，而只需處理最近的值。在這種情況下，當收集器處理速度太慢時，可以使用 [conflate] 運算子跳過中間值。延續前面的範例：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.system.*

fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100) // 模擬我們非同步地等待了 100 ms
        emit(i) // 發射下一個值
    }
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val time = measureTimeMillis {
        simple()
            .conflate() // 合併發射的值，不處理每一個
            .collect { value -> 
                delay(300) // 模擬我們處理了 300 ms
                println(value) 
            } 
    }   
    println("Collected in $time ms")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-18.kt -->
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-18.kt) 獲取完整程式碼。
>
{style="note"}

我們看到，當第一個數字仍在處理時，第二個與第三個數字已經產生了，因此第二個被「合併」了，只有最近的一個（第三個）被遞送給了收集器：

```text
1
3
Collected in 758 ms
```             

<!--- TEST ARBITRARY_TIME -->

### 處理最新值

當發射器與收集器都很慢時，合併是加速處理的一種方式。它透過丟棄發射的值來實現。另一種方式是取消緩慢的收集器，並在每次發射新值時重新啟動它。有一組 `xxxLatest` 運算子執行與 `xxx` 運算子相同的核心邏輯，但在新值產生時取消其區塊中的程式碼。讓我們嘗試在前面的範例中將 [conflate] 更改為 [collectLatest]：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.system.*

fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100) // 模擬我們非同步地等待了 100 ms
        emit(i) // 發射下一個值
    }
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val time = measureTimeMillis {
        simple()
            .collectLatest { value -> // 對最新值取消並重啟
                println("Collecting $value") 
                delay(300) // 模擬我們處理了 300 ms
                println("Done $value") 
            } 
    }   
    println("Collected in $time ms")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-19.kt -->
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-19.kt) 獲取完整程式碼。
>
{style="note"}
 
由於 [collectLatest] 的主體需要 300 ms，但每 100 ms 就會發射新值，我們看到該區塊針對每個值都會執行，但僅對最後一個值完成：

```text 
Collecting 1
Collecting 2
Collecting 3
Done 3
Collected in 741 ms
``` 

<!--- TEST ARBITRARY_TIME -->

## 組合多個 Flow

組合多個 Flow 有很多種方式。

### Zip

就像 Kotlin 標準函式庫中的 [Sequence.zip] 擴充函式一樣，Flow 也有一個 [zip] 運算子，用於組合兩個 Flow 的對應值：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> { 
//sampleStart                                                                           
    val nums = (1..3).asFlow() // 數字 1..3
    val strs = flowOf("one", "two", "three") // 字串 
    nums.zip(strs) { a, b -> "$a -> $b" } // 組合成單個字串
        .collect { println(it) } // 收集並列印
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-20.kt -->
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-20.kt) 獲取完整程式碼。
>
{style="note"}

本範例列印：

```text
1 -> one
2 -> two
3 -> three
```
 
<!--- TEST -->

### Combine

當 Flow 表示變數或操作的最新值時（另請參閱關於 [合併](#conflation) 的相關章節），可能需要執行依賴於對應 Flow 最新值的計算，並在任何上游 Flow 發射值時重新計算。對應的運算子系列稱為 [combine]。

例如，如果上一個範例中的數字每 300 ms 更新一次，但字串每 400 ms 更新一次，使用 [zip] 運算子進行組合仍將產生相同的結果，儘管結果每 400 ms 列印一次：

> 我們在範例中使用 [onEach] 中間運算子來延遲每個元素，並使發射範例 Flow 的程式碼更具宣告性且更簡潔。
>
{style="note"}

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> { 
//sampleStart                                                                           
    val nums = (1..3).asFlow().onEach { delay(300) } // 每 300 ms 發射數字 1..3
    val strs = flowOf("one", "two", "three").onEach { delay(400) } // 每 400 ms 發射字串
    val startTime = System.currentTimeMillis() // 記錄開始時間 
    nums.zip(strs) { a, b -> "$a -> $b" } // 使用 "zip" 組合成單個字串
        .collect { value -> // 收集並列印 
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-21.kt -->
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-21.kt) 獲取完整程式碼。
>
{style="note"}

<!--- TEST ARBITRARY_TIME
1 -> one at 437 ms from start
2 -> two at 837 ms from start
3 -> three at 1243 ms from start
-->

然而，當在這裡使用 [combine] 運算子代替 [zip] 時：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> { 
//sampleStart                                                                           
    val nums = (1..3).asFlow().onEach { delay(300) } // 每 300 ms 發射數字 1..3
    val strs = flowOf("one", "two", "three").onEach { delay(400) } // 每 400 ms 發射字串          
    val startTime = System.currentTimeMillis() // 記錄開始時間 
    nums.combine(strs) { a, b -> "$a -> $b" } // 使用 "combine" 組合成單個字串
        .collect { value -> // 收集並列印 
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-22.kt -->
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-22.kt) 獲取完整程式碼。
>
{style="note"}

我們得到相當不同的輸出，在 `nums` 或 `strs` Flow 的每次發射時都會列印一行：

```text 
1 -> one at 452 ms from start
2 -> one at 651 ms from start
2 -> two at 854 ms from start
3 -> two at 952 ms from start
3 -> three at 1256 ms from start
```

<!--- TEST ARBITRARY_TIME -->

## 展平（Flattening）Flow

Flow 表示非同步接收的值序列，因此很容易遇到每個值都會觸發對另一個值序列請求的情況。例如，我們可以有以下函式，它傳回兩個間隔 500 ms 的字串 Flow：

```kotlin
fun requestFlow(i: Int): Flow<String> = flow {
    emit("$i: First") 
    delay(500) // 等待 500 ms
    emit("$i: Second")    
}
```

<!--- CLEAR -->

現在，如果我們有一個包含三個整數的 Flow，並對其中的每個整數呼叫 `requestFlow`，如下所示：

```kotlin
(1..3).asFlow().map { requestFlow(it) }
```

<!--- CLEAR -->

那麼我們最終會得到一個「Flow 的 Flow」（`Flow<Flow<String>>`），需要將其「展平」為單個 Flow 以進行進一步處理。集合與 Sequence 具有 [flatten][Sequence.flatten] 與 [flatMap][Sequence.flatMap] 運算子來實現這一點。然而，由於 Flow 的非同步特性，它們需要不同的展平「模式」，因此 Flow 上存在一系列展平運算子。

### flatMapConcat

Flow 的 Flow 串接由 [flatMapConcat] 與 [flattenConcat] 運算子提供。它們是對應 Sequence 運算子最直接的類比。如下例所示，它們會等待內部 Flow 完成後再開始收集下一個 Flow：

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
    val startTime = System.currentTimeMillis() // 記錄開始時間 
    (1..3).asFlow().onEach { delay(100) } // 每 100 ms 發射一個數字 
        .flatMapConcat { requestFlow(it) }                                                                           
        .collect { value -> // 收集並列印 
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-23.kt -->
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-23.kt) 獲取完整程式碼。
>
{style="note"}

[flatMapConcat] 的循序性質在輸出中清晰可見：

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

另一種展平操作是併發收集所有傳入的 Flow 並將它們的值合併為單個 Flow，以便儘快發射值。它由 [flatMapMerge] 與 [flattenMerge] 運算子實作。它們都接受一個選用的 `concurrency` 參數，該參數限制同時收集的併發 Flow 數量（預設等於 [DEFAULT_CONCURRENCY]）。

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
    val startTime = System.currentTimeMillis() // 記錄開始時間 
    (1..3).asFlow().onEach { delay(100) } // 每 100 ms 一個數字 
        .flatMapMerge { requestFlow(it) }                                                                           
        .collect { value -> // 收集並列印 
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-24.kt -->
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-24.kt) 獲取完整程式碼。
>
{style="note"}

[flatMapMerge] 的併發特性顯而易見：

```text                      
1: First at 136 ms from start
2: First at 231 ms from start
3: First at 333 ms from start
1: Second at 639 ms from start
2: Second at 732 ms from start
3: Second at 833 ms from start
```                                               

<!--- TEST ARBITRARY_TIME -->

> 請注意，[flatMapMerge] 循序地呼叫其程式碼區塊（本例中為 `{ requestFlow(it) }`），但併發地收集生成的 Flow，這相當於先執行循序的 `map { requestFlow(it) }`，然後對結果呼叫 [flattenMerge]。
>
{style="note"}

### flatMapLatest   

與「[處理最新值](#processing-the-latest-value)」章節中描述的 [collectLatest] 運算子類似，還有一種對應的「Latest」展平模式，即一旦發射新 Flow，就會取消對上一個 Flow 的收集。它由 [flatMapLatest] 運算子實作。

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
    val startTime = System.currentTimeMillis() // 記錄開始時間 
    (1..3).asFlow().onEach { delay(100) } // 每 100 ms 一個數字 
        .flatMapLatest { requestFlow(it) }                                                                           
        .collect { value -> // 收集並列印 
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-25.kt -->
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-25.kt) 獲取完整程式碼。
>
{style="note"}

本範例的輸出很好地展示了 [flatMapLatest] 的運作方式：

```text                      
1: First at 142 ms from start
2: First at 322 ms from start
3: First at 425 ms from start
3: Second at 931 ms from start
```                                               

<!--- TEST ARBITRARY_TIME -->
  
> 請注意，當收到新值時，[flatMapLatest] 會取消其區塊中的所有程式碼（本例中為 `{ requestFlow(it) }`）。在本例中這沒有差別，因為對 `requestFlow` 的呼叫本身很快、非暫停且無法取消。然而，如果我們在 `requestFlow` 中使用像 `delay` 這樣的暫停函式，輸出的差異就會顯現出來。
>
{style="note"}

## Flow 例外

當發射器或運算子內部的程式碼拋出例外時，Flow 收集可以以例外結束。處理這些例外有幾種方式。

### 收集器 try 與 catch

收集器可以使用 Kotlin 的 [`try/catch`][exceptions] 區塊來處理例外：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        println("Emitting $i")
        emit(i) // 發射下一個值
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
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-26.kt) 獲取完整程式碼。
>
{style="note"}

這段程式碼在 [collect] 終端運算子中成功捕捉到了例外，並且如我們所見，之後不再發射任何值：

```text 
Emitting 1
1
Emitting 2
2
Caught java.lang.IllegalStateException: Collected 2
```

<!--- TEST -->

### 一切皆可捕捉

前面的範例實際上捕捉到了發射器或任何中間或終端運算子中發生的任何例外。例如，讓我們更改程式碼，以便將發射的值 [對應][map] 為字串，但對應程式碼產生了例外：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
fun simple(): Flow<String> = 
    flow {
        for (i in 1..3) {
            println("Emitting $i")
            emit(i) // 發射下一個值
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
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-27.kt) 獲取完整程式碼。
>
{style="note"}

此例外仍被捕捉，且收集已停止：

```text 
Emitting 1
string 1
Emitting 2
Caught java.lang.IllegalStateException: Crashed on 2
```

<!--- TEST -->

## 例外透明性

但是發射器的程式碼如何封裝其例外處理行為呢？

Flow 必須是「對例外透明（transparent to exceptions）」的，在 `flow { ... }` 建置器的 `try/catch` 區塊內 [發射][FlowCollector.emit] 值是違反例外透明性的。這保證了拋出例外的收集器始終可以像前面的範例一樣使用 `try/catch` 來捕捉它。

發射器可以使用 [catch] 運算子，該運算子保留了這種例外透明性並允許封裝其例外處理。`catch` 運算子的主體可以分析例外，並根據捕捉到的例外以不同方式做出反應：

* 可以使用 `throw` 重新拋出例外。
* 可以使用 [catch] 主體中的 [emit][FlowCollector.emit] 將例外轉換為值發射。
* 例外可以被忽略、記錄或由某些其他程式碼處理。

例如，讓我們在捕捉到例外時發射文字：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun simple(): Flow<String> = 
    flow {
        for (i in 1..3) {
            println("Emitting $i")
            emit(i) // 發射下一個值
        }
    }
    .map { value ->
        check(value <= 1) { "Crashed on $value" }                 
        "string $value"
    }

fun main() = runBlocking<Unit> {
//sampleStart
    simple()
        .catch { e -> emit("Caught $e") } // 例外時發射
        .collect { value -> println(value) }
//sampleEnd
}            
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-28.kt -->
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-28.kt) 獲取完整程式碼。
>
{style="note"} 
 
儘管我們不再在程式碼周圍使用 `try/catch`，但範例的輸出是相同的。

<!--- TEST  
Emitting 1
string 1
Emitting 2
Caught java.lang.IllegalStateException: Crashed on 2
-->

### 透明捕捉

中間運算子 [catch] 遵循例外透明性，僅捕捉上游例外（即 `catch` 上方所有運算子的例外，而非下方的）。如果 `collect { ... }`（位於 `catch` 下方）中的區塊拋出例外，則它會溢出：

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
        .catch { e -> println("Caught $e") } // 不會捕捉下游例外
        .collect { value ->
            check(value <= 1) { "Collected $value" }                 
            println(value) 
        }
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-29.kt -->
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-29.kt) 獲取完整程式碼。
>
{style="note"}
 
儘管有 `catch` 運算子，但並未列印「Caught ...」訊息：

```text  
Emitting 1
1
Emitting 2
Exception in thread "main" java.lang.IllegalStateException: Collected 2
	at ...
```

<!--- TEST EXCEPTION -->

### 宣告式捕捉

我們可以將 [catch] 運算子的宣告式性質與處理所有例外的願望結合起來，方法是將 [collect] 運算子的主體移動到 [onEach] 中，並將其放在 `catch` 運算子之前。此 Flow 的收集必須透過呼叫不帶參數的 `collect()` 來觸發：

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
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-30.kt) 獲取完整程式碼。
>
{style="note"} 
 
現在我們可以看到列印了「Caught ...」訊息，因此我們可以不顯式地使用 `try/catch` 區塊來捕捉所有例外：

```text 
Emitting 1
1
Emitting 2
Caught java.lang.IllegalStateException: Collected 2
```

<!--- TEST EXCEPTION -->

## Flow 完成

當 Flow 收集完成（正常或異常）時，它可能需要執行一項操作。正如您可能已經注意到的，這可以透過兩種方式完成：命令式或宣告式。

### 命令式 finally 區塊

除了 `try`/`catch` 之外，收集器還可以使用 `finally` 區塊在 `collect` 完成時執行操作。

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
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-31.kt) 獲取完整程式碼。
>
{style="note"} 

這段程式碼列印 `simple` Flow 產生的三個數字，後跟一個「Done」字串：

```text
1
2
3
Done
```

<!--- TEST  -->

### 宣告式處理

對於宣告式方法，Flow 具有 [onCompletion] 中間運算子，該運算子在 Flow 完全收集後被呼叫。

前面的範例可以使用 [onCompletion] 運算子重寫，並產生相同的輸出：

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
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-32.kt) 獲取完整程式碼。
>
{style="note"} 

<!--- TEST 
1
2
3
Done
-->

[onCompletion] 的主要優勢是 Lambda 的可為 null 的 `Throwable` 參數，它可用於判斷 Flow 收集是正常完成還是異常完成。在以下範例中，`simple` Flow 在發射數字 1 後拋出一個例外：

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
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-33.kt) 獲取完整程式碼。
>
{style="note"}

如您所料，它列印：

```text
1
Flow completed exceptionally
Caught exception
```

<!--- TEST -->

[onCompletion] 運算子與 [catch] 不同，它不處理例外。正如我們從上面的範例程式碼中所看到的，例外仍然會流向下游。它將被遞送給進一步的 `onCompletion` 運算子，並可以使用 `catch` 運算子進行處理。

### 成功完成

與 [catch] 運算子的另一個區別是，[onCompletion] 能看到所有例外，並且僅在上游 Flow 成功完成（沒有取消或失敗）時才接收到 `null` 例外。

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
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-34.kt) 獲取完整程式碼。
>
{style="note"}

我們可以看到完成原因不是 null，因為 Flow 由於下游例外而中止了：

```text 
1
Flow completed with java.lang.IllegalStateException: Collected 2
Exception in thread "main" java.lang.IllegalStateException: Collected 2
```

<!--- TEST EXCEPTION -->

## 命令式對比宣告式

現在我們知道如何以命令式與宣告式兩種方式收集 Flow 並處理其完成與例外。這裡自然會問，哪種方法更好，為什麼？作為一個函式庫，我們不提倡任何特定的方法，並相信這兩種選擇都是有效的，應該根據您自己的偏好與編碼風格進行選擇。

## 啟動 Flow

使用 Flow 來表示來自某個來源的非同步事件非常容易。在這種情況下，我們需要一個類似於 `addEventListener` 函式的類比，該函式為傳入事件註冊一段反應程式碼並繼續後續工作。[onEach] 運算子可以擔當此角色。然而，`onEach` 是一個中間運算子。我們還需要一個終端運算子來收集 Flow。否則，僅僅呼叫 `onEach` 是沒有效果的。
 
如果在 `onEach` 之後使用 [collect] 終端運算子，那麼其後的程式碼將等待 Flow 被收集：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
// 模擬一個事件 flow
fun events(): Flow<Int> = (1..3).asFlow().onEach { delay(100) }

fun main() = runBlocking<Unit> {
    events()
        .onEach { event -> println("Event: $event") }
        .collect() // <--- 收集 flow 會等待
    println("Done")
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-35.kt -->
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-35.kt) 獲取完整程式碼。
>
{style="note"} 
  
如您所見，它列印：

```text 
Event: 1
Event: 2
Event: 3
Done
```    

<!--- TEST -->
 
[launchIn] 終端運算子在這裡派上了用場。透過將 `collect` 替換為 `launchIn`，我們可以在單獨的協程中啟動 Flow 的收集，以便後續程式碼的執行立即繼續：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 模擬一個事件 flow
fun events(): Flow<Int> = (1..3).asFlow().onEach { delay(100) }

//sampleStart
fun main() = runBlocking<Unit> {
    events()
        .onEach { event -> println("Event: $event") }
        .launchIn(this) // <--- 在單獨的協程中啟動 flow
    println("Done")
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-36.kt -->
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-36.kt) 獲取完整程式碼。
>
{style="note"} 
  
它列印：

```text          
Done
Event: 1
Event: 2
Event: 3
```    

<!--- TEST -->

`launchIn` 所需的參數必須指定一個 [CoroutineScope]，在其中啟動用於收集 Flow 的協程。在上面的範例中，此作用域來自 [runBlocking] 協程建置器，因此在 Flow 運行期間，此 [runBlocking] 作用域會等待其子協程完成，並防止主函式返回並終止此範例。

在實際應用中，作用域將來自生命週期有限的實體。一旦該實體的生命週期終止，對應的作用域就會被取消，從而取消對應 Flow 的收集。這樣，`onEach { ... }.launchIn(scope)` 對就其作用方式而言類似於 `addEventListener`。然而，由於取消與結構化併發服務於此目的，因此不需要對應的 `removeEventListener` 函式。

請注意，[launchIn] 也會傳回一個 [Job]，該 Job 可僅用於 [取消][Job.cancel] 對應的 Flow 收集協程，而無需取消整個作用域，或將其 [加入][Job.join]。

### Flow 取消檢查

為了方便起見，[flow][_flow] 建置器會對發射的每個值執行額外的 [ensureActive] 取消檢查。這意味著從 `flow { ... }` 發射的繁忙迴圈是可取消的：

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
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-37.kt) 獲取完整程式碼。
>
{style="note"}

我們只得到了 3 之前的數字，並在嘗試發射數字 4 後收到了 [CancellationException]：

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

然而，出於效能原因，大多數其他 Flow 運算子不會自行執行額外的取消檢查。例如，如果您使用 [IntRange.asFlow] 擴充來撰寫相同的繁忙迴圈且不進行任何暫停，那麼就沒有取消檢查：

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
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-38.kt) 獲取完整程式碼。
>
{style="note"}

收集了從 1 到 5 的所有數字，並且僅在從 `runBlocking` 返回之前偵測到了取消：

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

如果您在使用協程時有一個繁忙迴圈，則必須明確檢查取消。您可以加入 `.onEach { currentCoroutineContext().ensureActive() }`，但提供了一個現成的 [cancellable] 運算子來執行此操作：

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
> 您可以從 [這裡](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-39.kt) 獲取完整程式碼。
>
{style="note"}

使用 `cancellable` 運算子後，僅收集了 1 到 3 的數字：

```text
1
2
3
Exception in thread "main" kotlinx.coroutines.JobCancellationException: BlockingCoroutine was cancelled; job="coroutine#1":BlockingCoroutine{Cancelled}@5ec0a365
```

<!--- TEST EXCEPTION -->

## Flow 與 Reactive Streams

對於那些熟悉 [Reactive Streams](https://www.reactive-streams.org/) 或諸如 RxJava 與 Project Reactor 之類的響應式框架的人來說，Flow 的設計可能看起來非常熟悉。

事實上，其設計靈感來自 Reactive Streams 及其各種實作。但 Flow 的主要目標是擁有儘可能簡單的設計，並對 Kotlin 與暫停友好，且尊重結構化併發。如果沒有響應式先驅及其巨大貢獻，實現這一目標是不可能的。您可以在 [Reactive Streams and Kotlin Flows](https://medium.com/@elizarov/reactive-streams-and-kotlin-flows-bfd12772cda4) 文章中閱讀完整的故事。

雖然有所不同，但從概念上講，Flow *就是* 一個響應式串流，可以將其轉換為（符合規範與 TCK 的）響應式 Publisher，反之亦然。此類轉換器由 `kotlinx.coroutines` 開箱即用地提供，並可在對應的響應式模組中找到（`kotlinx-coroutines-reactive` 用於 Reactive Streams，`kotlinx-coroutines-reactor` 用於 Project Reactor，以及 `kotlinx-coroutines-rx2`/`kotlinx-coroutines-rx3` 用於 RxJava2/RxJava3）。整合模組包括與 `Flow` 之間的雙向轉換、與 Reactor 的 `Context` 的整合，以及處理各種響應式實體的暫停友好型方式。
 
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