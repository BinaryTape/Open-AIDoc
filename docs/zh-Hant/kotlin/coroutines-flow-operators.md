<!--- TEST_NAME FlowGuideTest --> 
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: Flow 運算子)

> 我們目前正在修訂此頁面。如需最新的 Flow 指南，請從 [Flow 總覽](coroutines-flow.md)開始。
>
{style="note"}

Flow 可以使用運算子進行轉換，就像您轉換集合 (Collection) 和序列 (Sequence) 一樣。
中間運算子 (Intermediate operators) 會套用於上游 Flow 並傳回下游 Flow。
這些運算子是冷的 (Cold)。呼叫此類運算子本身並不是暫停函式。它運作迅速，會傳回一個新的已轉換 Flow 的定義。

基礎運算子具有常見的名稱，例如 [map] 和 [filter]。
這些運算子與序列的一個重要區別是，運算子內部的程式碼區塊可以呼叫暫停函式。

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
    (1..3).asFlow() // 請求的 Flow
        .map { request -> performRequest(request) }
        .collect { response -> println(response) }
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-01.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-01.kt)獲取完整程式碼。
>
{style="note"}

它會產生以下三行，每行在上一行出現一秒後顯示：

```text                                                                    
response 1
response 2
response 3
```

<!--- TEST -->

### Transform 運算子

在 Flow 轉換運算子中，最通用的一個稱為 [transform]。它可以用於模擬簡單的轉換（如 [map] 和 [filter]），也可以實作更複雜的轉換。
使用 `transform` 運算子，我們可以 [emit][FlowCollector.emit] 任意次數的任意值。

例如，使用 `transform` 我們可以在執行耗時的非同步請求之前發出一個字串，然後緊接著發出回應：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

suspend fun performRequest(request: Int): String {
    delay(1000) // 模擬耗時的非同步工作
    return "response $request"
}

fun main() = runBlocking<Unit> {
//sampleStart
    (1..3).asFlow() // 請求的 Flow
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
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-02.kt)獲取完整程式碼。
>
{style="note"}

此程式碼的輸出為：

```text
Making request 1
response 1
Making request 2
response 2
Making request 3
response 3
```

<!--- TEST -->

### 限額運算子

像 [take] 這樣的限額中間運算子，在達到對應限制時會取消 Flow 的執行。協同程式中的取消總是透過拋出例外來執行，以便所有資源管理功能（如 `try { ... } finally { ... }` 區塊）在取消時能正常運作：

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
<!--- KNIT example-flow-03.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-03.kt)獲取完整程式碼。
>
{style="note"}

此程式碼的輸出清楚顯示 `numbers()` 函式中的 `flow { ... }` 內容在發出第二個數字後停止執行：

```text       
1
2
Finally in numbers
```

<!--- TEST -->

## 終端 Flow 運算子

Flow 上的終端運算子是啟動 Flow 收集的 *暫停函式*。[collect] 運算子是最基礎的一個，但還有其他終端運算子可以讓操作更簡單：

* 轉換為各種集合，例如 [toList] 和 [toSet]。
* 獲取 [first] 值以及確保 Flow 僅發出 [single] 值的運算子。
* 使用 [reduce] 和 [fold] 將 Flow 歸約為一個值。

例如：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> {
//sampleStart         
    val sum = (1..5).asFlow()
        .map { it * it } // 1 到 5 數字的平方                           
        .reduce { a, b -> a + b } // 加總（終端運算子）
    println(sum)
//sampleEnd     
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-04.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-04.kt)獲取完整程式碼。
>
{style="note"}

印出單個數字：

```text
55
```

<!--- TEST -->

## 緩衝 (Buffering)

從收集 Flow 所需的總時間來看，在不同的協同程式中執行 Flow 的不同部分是有幫助的，特別是在涉及耗時的非同步操作時。例如，考慮一個情況：`simple` Flow 的發出速度很慢，產生一個元素需要 100 ms；而收集器也很慢，處理一個元素需要 300 ms。讓我們看看收集這樣一個包含三個數字的 Flow 需要多長時間：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.system.*

//sampleStart
fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100) // 模擬非同步等待 100 ms
        emit(i) // 發出下一個值
    }
}

fun main() = runBlocking<Unit> { 
    val time = measureTimeMillis {
        simple().collect { value -> 
            delay(300) // 模擬處理過程耗時 300 ms
            println(value) 
        } 
    }   
    println("Collected in $time ms")
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-05.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-05.kt)獲取完整程式碼。
>
{style="note"}

它會產生類似以下的結果，整個收集過程大約需要 1200 ms（三個數字，每個 400 ms）：

```text
1
2
3
Collected in 1220 ms
```

<!--- TEST ARBITRARY_TIME -->

我們可以在 Flow 上使用 [buffer] 運算子，讓 `simple` Flow 的發出程式碼與收集程式碼並行執行，而不是順序執行：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.system.*

fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100) // 模擬非同步等待 100 ms
        emit(i) // 發出下一個值
    }
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val time = measureTimeMillis {
        simple()
            .buffer() // 緩衝發出的值，不等待
            .collect { value -> 
                delay(300) // 模擬處理過程耗時 300 ms
                println(value) 
            } 
    }   
    println("Collected in $time ms")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-06.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-06.kt)獲取完整程式碼。
>
{style="note"}

它產生相同的數字，但速度更快，因為我們有效地建立了一個處理管線 (Pipeline)，只需為第一個數字等待 100 ms，然後處理每個數字只需花費 300 ms。這樣執行大約需要 1000 ms：

```text
1
2
3
Collected in 1071 ms
```                    

<!--- TEST ARBITRARY_TIME -->

> 請注意，當 [flowOn] 運算子必須更改 [CoroutineDispatcher] 時，它會使用相同的緩衝機制，但這裡我們是在不更改執行上下文的情況下明確要求緩衝。
>
{style="note"}

### 合併 (Conflation)

當 Flow 表示操作的局部結果或操作狀態更新時，可能不需要處理每個值，而是只需處理最近的值。在這種情況下，當收集器處理速度太慢而無法處理所有值時，可以使用 [conflate] 運算子來跳過中間值。以前面的範例為基礎：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.system.*

fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100) // 模擬非同步等待 100 ms
        emit(i) // 發出下一個值
    }
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val time = measureTimeMillis {
        simple()
            .conflate() // 合併發出的值，不處理每一個
            .collect { value -> 
                delay(300) // 模擬處理過程耗時 300 ms
                println(value) 
            } 
    }   
    println("Collected in $time ms")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-07.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-07.kt)獲取完整程式碼。
>
{style="note"}

我們看到當第一個數字仍在處理中時，第二個和第三個數字已經產生了，因此第二個數字被 *合併 (Conflated)*，只有最近的（第三個）被傳遞給收集器：

```text
1
3
Collected in 758 ms
```             

<!--- TEST ARBITRARY_TIME -->

### 處理最新值

當發送端和收集端都很慢時，合併是加速處理的一種方式。它是透過捨棄發出的值來實現的。另一種方式是取消慢速收集器，並在每次發出新值時重新啟動它。有一系列 `xxxLatest` 運算子執行與 `xxx` 運算子相同的核心邏輯，但在新值出現時會取消其區塊中的程式碼。讓我們嘗試在前面的範例中將 [conflate] 更改為 [collectLatest]：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.system.*

fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100) // 模擬非同步等待 100 ms
        emit(i) // 發出下一個值
    }
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val time = measureTimeMillis {
        simple()
            .collectLatest { value -> // 在獲得最新值時取消並重啟
                println("Collecting $value") 
                delay(300) // 模擬處理過程耗時 300 ms
                println("Done $value") 
            } 
    }   
    println("Collected in $time ms")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-08.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-08.kt)獲取完整程式碼。
>
{style="note"}

由於 [collectLatest] 的主體需要 300 ms，但每 100 ms 就會發出新值，我們看到該區塊針對每個值都在執行，但僅對最後一個值完成：

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

就像 Kotlin 標準函式庫中的 [Sequence.zip] 擴充函式一樣，Flow 具有 [zip] 運算子，用於組合兩個 Flow 的對應值：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> { 
//sampleStart                                                                           
    val nums = (1..3).asFlow() // 數字 1..3
    val strs = flowOf("one", "two", "three") // 字串 
    nums.zip(strs) { a, b -> "$a -> $b" } // 組合成單個字串
        .collect { println(it) } // 收集並印出
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-09.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-09.kt)獲取完整程式碼。
>
{style="note"}

此範例印出：

```text
1 -> one
2 -> two
3 -> three
```

<!--- TEST -->

### Combine

當 Flow 表示變數或操作的最新值時（另請參閱關於 [合併](#合併) 的相關章節），可能需要執行依賴於對應 Flow 最新值的計算，並在任何上游 Flow 發出值時重新計算。對應的運算子系列稱為 [combine]。

例如，如果上一個範例中的數字每 300 ms 更新一次，但字串每 400 ms 更新一次，那麼使用 [zip] 運算子對它們進行 zip 操作仍會產生相同的結果，儘管結果是每 400 ms 印出一次：

> 我們在此範例中使用 [onEach] 中間運算子來延遲每個元素，並使發出範例 Flow 的程式碼更具宣告性且更短。
>
{style="note"}

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> { 
//sampleStart                                                                           
    val nums = (1..3).asFlow().onEach { delay(300) } // 每 300 ms 發出數字 1..3
    val strs = flowOf("one", "two", "three").onEach { delay(400) } // 每 400 ms 發出字串
    val startTime = System.currentTimeMillis() // 記錄開始時間 
    nums.zip(strs) { a, b -> "$a -> $b" } // 使用 "zip" 組合成單個字串
        .collect { value -> // 收集並印出 
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-10.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-10.kt)獲取完整程式碼。
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
    val nums = (1..3).asFlow().onEach { delay(300) } // 每 300 ms 發出數字 1..3
    val strs = flowOf("one", "two", "three").onEach { delay(400) } // 每 400 ms 發出字串          
    val startTime = System.currentTimeMillis() // 記錄開始時間 
    nums.combine(strs) { a, b -> "$a -> $b" } // 使用 "combine" 組合成單個字串
        .collect { value -> // 收集並印出 
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-11.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-11.kt)獲取完整程式碼。
>
{style="note"}

我們得到了截然不同的輸出，每當 `nums` 或 `strs` Flow 中有發出值時，都會印出一行：

```text 
1 -> one at 452 ms from start
2 -> one at 651 ms from start
2 -> two at 854 ms from start
3 -> two at 952 ms from start
3 -> three at 1256 ms from start
```

<!--- TEST ARBITRARY_TIME -->

## 展平 (Flattening) Flow

Flow 表示非同步接收的數值序列，因此很容易遇到每個值觸發對另一個數值序列請求的情況。例如，我們可以有以下函式，它傳回間隔 500 ms 的兩個字串組成的 Flow：

```kotlin
fun requestFlow(i: Int): Flow<String> = flow {
    emit("$i: First") 
    delay(500) // 等待 500 ms
    emit("$i: Second")    
}
```

<!--- CLEAR -->

現在如果我們有一個由三個整數組成的 Flow，並像這樣對其中的每一個呼叫 `requestFlow`：

```kotlin
(1..3).asFlow().map { requestFlow(it) }
```

<!--- CLEAR -->

那麼我們最終會得到一個由 Flow 組成的 Flow (`Flow<Flow<String>>`)，它需要被 *展平 (Flattened)* 為單個 Flow 以進行進一步處理。集合和序列對此有 [flatten][Sequence.flatten] 和 [flatMap][Sequence.flatMap] 運算子。然而，由於 Flow 的非同步特性，它們需要不同的展平 *模式*，因此存在一系列展平 Flow 的運算子。

### flatMapConcat

Flow 集合的連接由 [flatMapConcat] 和 [flattenConcat] 運算子提供。它們與對應序列運算子的類比最為直接。它們會等待內部 Flow 完成，然後才開始收集下一個，如下例所示：

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
    (1..3).asFlow().onEach { delay(100) } // 每 100 ms 發出一個數字 
        .flatMapConcat { requestFlow(it) }                                                                           
        .collect { value -> // 收集並印出 
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-12.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-12.kt)獲取完整程式碼。
>
{style="note"}

[flatMapConcat] 的順序特性在輸出中清晰可見：

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

另一種展平操作是並行收集所有傳入的 Flow 並將它們的值合併到單個 Flow 中，以便儘快發出值。它是由 [flatMapMerge] 和 [flattenMerge] 運算子實作的。它們都接受一個選用的 `concurrency` 參數，用於限制同時收集的並行 Flow 數量（預設等於 [DEFAULT_CONCURRENCY]）。

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
        .collect { value -> // 收集並印出 
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-13.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-13.kt)獲取完整程式碼。
>
{style="note"}

[flatMapMerge] 的並行特性很明顯：

```text                      
1: First at 136 ms from start
2: First at 231 ms from start
3: First at 333 ms from start
1: Second at 639 ms from start
2: Second at 732 ms from start
3: Second at 833 ms from start
```                                               

<!--- TEST ARBITRARY_TIME -->

> 請注意，[flatMapMerge] 會依序呼叫其程式碼區塊（本例中為 `{ requestFlow(it) }`），但並行收集產生的 Flow，這相當於先執行順序 [map] `{ requestFlow(it) }` 然後對結果呼叫 [flattenMerge]。
>
{style="note"}

### flatMapLatest

與 ["處理最新值"](#處理最新值) 章節中描述的 [collectLatest] 運算子類似，存在對應的 "Latest" 展平模式，一旦發出新的 Flow，就會取消對上一個 Flow 的收集。它是由 [flatMapLatest] 運算子實作的。

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
        .collect { value -> // 收集並印出 
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-14.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-14.kt)獲取完整程式碼。
>
{style="note"}

此範例中的輸出很好地演示了 [flatMapLatest] 的工作方式：

```text                      
1: First at 142 ms from start
2: First at 322 ms from start
3: First at 425 ms from start
3: Second at 931 ms from start
```                                               

<!--- TEST ARBITRARY_TIME -->

> 請注意，當接收到新值時，[flatMapLatest] 會取消其區塊中的所有程式碼（本例中為 `{ requestFlow(it) }`）。
> 在這個特定範例中沒有區別，因為對 `requestFlow` 的呼叫本身很快，不是暫停的，且無法取消。但是，如果我們要在 `requestFlow` 中使用像 `delay` 這樣的暫停函式，輸出中的差異就會顯現。
>
{style="note"}

## Flow 完成

當 Flow 收集完成（正常或異常）時，可能需要執行一項操作。
您可能已經注意到，這可以透過兩種方式完成：命令式或宣告式。

### 命令式 finally 區塊

除了 `try`/`catch` 之外，收集器還可以使用 `finally` 區塊在 `collect` 完成後執行操作。

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
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-15.kt)獲取完整程式碼。
>
{style="note"}

此程式碼印出由 `simple` Flow 產生的三個數字，後跟一個 "Done" 字串：

```text
1
2
3
Done
```

<!--- TEST  -->

### 宣告式處理

對於宣告式方法，Flow 具有 [onCompletion] 中間運算子，當 Flow 完全收集後，該運算子會被叫用。

上一個範例可以使用 [onCompletion] 運算子改寫，並產生相同的輸出：

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
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-16.kt)獲取完整程式碼。
>
{style="note"}

<!--- TEST 
1
2
3
Done
-->

[onCompletion] 的主要優點是 Lambda 的可為 null 的 `Throwable` 參數，可用於確定 Flow 收集是正常完成還是異常完成。在以下範例中，`simple` Flow 在發出數字 1 後拋出例外：

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
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-17.kt)獲取完整程式碼。
>
{style="note"}

如您所料，它印出：

```text
1
Flow completed exceptionally
Caught exception
```

<!--- TEST -->

[onCompletion] 運算子與 [catch] 不同，它不處理例外。從上面的範例程式碼可以看出，例外仍會向下游流動。它將被遞送給進一步的 `onCompletion` 運算子，並可以使用 `catch` 運算子處理。

### 成功完成

與 [catch] 運算子的另一個區別是，[onCompletion] 可以看到所有例外，並且僅在游 Flow 成功完成（無取消或失敗）時接收 `null` 例外。

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
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-18.kt)獲取完整程式碼。
>
{style="note"}

我們可以看到完成原因並非為 null，因為 Flow 由於下游例外而中止：

```text 
1
Flow completed with java.lang.IllegalStateException: Collected 2
Exception in thread "main" java.lang.IllegalStateException: Collected 2
```

<!--- TEST EXCEPTION -->

## 啟動 Flow

使用 Flow 表示來自某些來源的非同步事件非常容易。在這種情況下，我們需要一個類似於 `addEventListener` 函式的機制，該函式向傳入事件註冊一段程式碼反應並繼續進一步工作。[onEach] 運算子可以擔當此角色。
然而，`onEach` 是一個中間運算子。我們還需要一個終端運算子來收集 Flow。否則，僅呼叫 `onEach` 沒有任何效果。

如果在 `onEach` 之後使用 [collect] 終端運算子，那麼其後的程式碼將等待直到 Flow 被收集完成：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
// 模擬事件 Flow
fun events(): Flow<Int> = (1..3).asFlow().onEach { delay(100) }

fun main() = runBlocking<Unit> {
    events()
        .onEach { event -> println("Event: $event") }
        .collect() // <--- 收集 Flow 會造成等待
    println("Done")
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-19.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-19.kt)獲取完整程式碼。
>
{style="note"}

如您所見，它印出：

```text 
Event: 1
Event: 2
Event: 3
Done
```    

<!--- TEST -->

[launchIn] 終端運算子在此派上用場。透過將 `collect` 替換為 `launchIn`，我們可以在單獨的協同程式中啟動 Flow 的收集，以便進一步程式碼的執行立即繼續：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 模擬事件 Flow
fun events(): Flow<Int> = (1..3).asFlow().onEach { delay(100) }

//sampleStart
fun main() = runBlocking<Unit> {
    events()
        .onEach { event -> println("Event: $event") }
        .launchIn(this) // <--- 在單獨的協同程式中啟動 Flow
    println("Done")
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-20.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-20.kt)獲取完整程式碼。
>
{style="note"}

它印出：

```text          
Done
Event: 1
Event: 2
Event: 3
```    

<!--- TEST -->

`launchIn` 所需的參數必須指定一個 [CoroutineScope]，用於啟動收集 Flow 的協同程式。在上述範例中，此範圍來自 [runBlocking] 協同程式產生器，因此當 Flow 執行時，此 [runBlocking] 範圍會等待其子協同程式完成，並防止主函式返回並終止此範例。

在實際應用中，範圍將來自具有有限生命週期的實體。一旦該實體的生命週期終止，對應的範圍就會被取消，從而取消對應 Flow 的收集。透過這種方式，`onEach { ... }.launchIn(scope)` 這對組合的工作原理就像 `addEventListener`。然而，不需要對應的 `removeEventListener` 函式，因為取消操作和結構化並行 (Structured Concurrency) 發揮了這個作用。

請注意，[launchIn] 也會傳回一個 [Job]，該工作可用於僅[取消][Job.cancel]對應的 Flow 收集協同程式，而不取消整個範圍，或對其進行 [join][Job.join]。

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