<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: Flow)

Flow 代表可以非同步產生的連續數值串流。
與回傳單一數值的 suspending function 不同，您可以使用 Flow 隨時間處理多個連續數值。

您可以使用 Flow 來建立 *Flow 管線 (flow pipelines)*，以漸進方式載入資料、回應事件串流以及建立訂閱樣式的 API 模型。

Flow 管線是一系列的運作過程，包含以下角色：

* **發送器 (Emitter)**：產生數值。
* **中間運算子 (Intermediate operators)（選用）**：從 Flow 取用數值，對其套用操作，並回傳另一個 Flow。
* **收集器 (Collector)**：從 Flow 取用數值。

以下是一個簡單範例，展示這些管線角色如何協作：

```kotlin
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun main() {
    // 發送器產生數值
    flowOf(0x4B, 0x6F, 0x74, 0x6C, 0x69, 0x6E)
        // 中間運算子取用數值，
        // 套用操作，並回傳另一個 Flow
        .map { value -> value.toChar() }
        // 收集器取用轉換後的數值
        .collect { updatedValue ->
            println("Say '$updatedValue'!")
        }
}
//sampleEnd
```
{kotlin-runnable="true"}

在 Flow 中，數值從發送器移向收集器，也就是從 *上游 (upstream)* 移向 *下游 (downstream)*。
中間運算子收集上游 Flow，對其數值套用操作，並回傳新的下游 Flow。
該下游 Flow 可以成為下一個收集器的上游 Flow。

![Flow 的組成：發送器、中間運算子（選用）、收集器。數值由上游向下游移動。](flow-upstream-downstream.svg){width=700}

Kotlin 提供以下 Flow 類型：

* [**冷 Flow (Cold flows)**](#cold-flows)：在被收集時才開始產生數值。每次收集都會觸發一次新的、獨立的 Flow 執行。
* [**熱 Flow (Hot flows)**](#hot-flows)：發送數值的過程獨立於收集器之外，並與所有收集器共享同一個數值串流。

> 您可以使用 [Turbine 程式庫](https://github.com/cashapp/turbine) 來測試 Kotlin Flow。
> 它簡化了單元測試中收集與斷言 Flow 發送內容的過程，包括完成與失敗的情況。
> 
{style="tip"}

## 冷 Flow

如同 [sequence](sequences.md)，冷 Flow 是延遲執行的 (lazy)。

冷 Flow 建立器 (builder) 的程式碼區塊直到有收集器收集它時才會執行。每次新的收集都會啟動一次新的 Flow 執行。

### 建立冷 Flow

要建立冷 Flow，請使用 [`flow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow.html) 建立器函式。在其區塊內，使用 [`emit()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow-collector/emit.html) 函式向收集器發送數值：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
fun main() {
    // 建立一個 Flow
    val pageFlow = flow {
        for (page in 1..3) {
            println("Loading page $page...")

            // 在載入每個頁面時發送它
            emit("Page $page")
        }
    }
    println("Creating a cold flow doesn't run it!")
}
//sampleEnd
```
{kotlin-runnable="true"}

在此範例中，`flow()` 建立器函式回傳一個 [`Flow<T>`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow/)，但不會開始執行其區塊。冷 Flow 就像一份食譜：它定義了如何產生數值，但只有當您 [收集它](#collect-a-cold-flow) 時才會開始產生數值。

您還可以使用以下函式建立冷 Flow：

* [`flowOf()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow-of.html)：從提供的數值中建立 Flow。
* [`.asFlow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/as-flow.html)：將現有的可迭代物件（例如範圍 range）轉換為 Flow。

以下是一個範例：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() {
    // 從提供的數值建立 Flow
    val predefinedPageFlow = flowOf("Page 1", "Page 2", "Page 3")
    // 從範圍建立 Flow
    val generatedPageFlow = (1..3).asFlow()
}
```

### 收集冷 Flow

要收集冷 Flow，請使用 [`collect()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/collect.html) 函式，這會觸發上游 Flow 的發送。如果您向 `collect()` 傳遞一個 Lambda，它將接收每個發送出的值：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default) {
        val pageFlow = flow {
            for (page in 1..3) {
                println("Loading page $page...")
                emit("Page $page")
            }
        }
        // 使用接收每個發送頁面的 Lambda 收集 Flow
        pageFlow.collect { page ->
            println("Processing $page...")
            delay(100.milliseconds)
            println("Done processing $page.")
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

每次呼叫 `collect()` 都會從頭開始執行整個冷 Flow。如果多個收集器收集同一個 cold flow，每個收集器都會觸發其專屬的收集過程：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
suspend fun main() {
    val pageFlow = flow {
        // 讀取目前協同程式的名稱
        val coroutineName = currentCoroutineContext()[CoroutineName]?.name

        println("Starting emissions in $coroutineName")
        for (page in 1..3) {
            println("Loading page $page in $coroutineName")
            emit("Page $page")
        }
        println("Done emitting in $coroutineName")
    }

    withContext(Dispatchers.Default) {
        // 啟動一個緩慢處理每個頁面的收集器
        launch(CoroutineName("a slow coroutine")) {
            pageFlow.collect {
                println("Processing $it slowly")
                delay(100.milliseconds)
                println("Done processing $it slowly")
            }
        }

        // 啟動一個快速處理每個頁面的收集器
        launch(CoroutineName("a fast coroutine")) {
            pageFlow.collect {
                println("Processing $it quickly")
                delay(10.milliseconds)
                println("Done processing $it quickly")
            }
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

在此範例中，[`CoroutineName`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-name/) 為每個協同程式新增了名稱。您可以使用 `CoroutineName` 進行 [偵錯](coroutine-context-and-dispatchers.md#naming-coroutines-for-debugging)。在這裡，它有助於顯示哪個收集器執行了哪次收集。

### 中間 Flow 運算子

中間運算子對上游 Flow 套用操作並回傳新的下游 Flow。它們是冷執行的，因此即使上游 Flow 是熱的，回傳的 Flow 只有在被收集時才會開始處理數值。

[kotlinx.coroutines](https://github.com/Kotlin/kotlinx.coroutines) 程式庫提供了 [多樣化的中間 Flow 運算子](coroutines-flow-operators.md)，用於轉換和處理 Flow。當內建運算子無法提供所需行為時，您也可以自行定義自訂運算子。

以下是一個簡化的自訂 [`.map()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map.html) 運算子範例，它對每個發送出的值套用轉換：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
// 預設 .map() 運算子的簡化自訂實作
fun <T, R> Flow<T>.myMap(transform: suspend (value: T) -> R): Flow<R> = flow {
    // 從上游 Flow 收集數值
    this@myMap.collect { value ->
        // 轉換每個收集到的值並發送結果
        emit(transform(value))
    }
}

suspend fun main() {
    // 建立 Flow，套用自訂 map 運算子，並收集轉換後的數值
    flowOf(1, 2, 3).myMap { 2 * it }.collect {
        println("Collecting $it")
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

#### 在 Flow 建立器中呼叫 suspending function

與 sequence 不同，您可以在 `flow()` 建立器函式中呼叫 suspending function：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun loadPage(): Int {
    delay(100)
    return 3
}

suspend fun main() {
    flow {
        emit(loadPage())
    }.collect {
        println(it)
        // 3
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

然而，`flow()` 建立器函式必須從其執行的同一個協同程式內文中發送數值。您不能啟動另一個協同程式並在其區塊內呼叫 `emit()`，也不能使用 `withContext()` 更改協同程式內文：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun main() {
    // 這會失敗並拋出例外！
    flow {
        // 使用 withContext() 更改協同程式內文
        withContext(Dispatchers.IO) {
            emit('a')
        }
    }.collect { 
        println("This never prints")
    }
}
//sampleEnd
```
{kotlin-runnable="true" validate="false"}

此限制僅適用於 `flow()` 建立器函式。

如果您需要上游 Flow 在不同的協同程式內文中執行，可以使用 [`.flowOn()` 運算子來更改它](#change-the-coroutine-context-of-a-cold-flow-with-flowon)。

或者，您可以使用 [`channelFlow()`](#emit-values-concurrently-with-channelflow) 來從多個協同程式發送數值。

#### 使用 `.flowOn()` 更改冷 Flow 的協同程式內文

預設情況下，冷 Flow 會在與收集器相同的協同程式內文中執行。

如果您希望 Flow 在不同的協同程式內文中執行，請使用 [`.flowOn()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow-on.html) 運算子。此運算子是 *內文保留的 (context-preserving)*。它僅更改上游 Flow 的協同程式內文，同時將下游 Flow 保持在呼叫者的內文中。

以下是一個冷 Flow 的範例，它在一個協同程式內文中發送數值，並在另一個內文中收集數值：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default + CoroutineName("downstream")) {
        flow {
            val coroutineName = currentCoroutineContext()[CoroutineName]?.name

            // 在使用 .flowOn() 套用的協同程式內文中發送
            println("Emitting '1' in $coroutineName")
            // Emitting '1' in upstream
            emit(1)

        // 更改上游 Flow 的協同程式內文
        }.flowOn(Dispatchers.IO + CoroutineName("upstream"))
            .collect {
            val coroutineName = currentCoroutineContext()[CoroutineName]?.name

            // 在呼叫者的協同程式內文中收集
            println("Collecting '$it' in $coroutineName")
            // Collecting '1' in downstream
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

### 處理 Flow 中的例外

發送器與收集器都可能拋出例外。

如果您在 Flow 收集過程中沒有處理例外，它會從收集器向上游傳播，並拋給 `collect()` 函式的呼叫者。

您可以透過將 `collect()` 函式包裹在 `try-catch` 區塊中來處理此類例外，例如：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

class MyFlowException(message: String) : Exception(message)

//sampleStart
suspend fun main() {
    val myFlow = flow {
        try {
            // emit() 函式會呼叫傳遞給 collect() 的 Lambda
            emit('a')
        } catch (e: MyFlowException) {
            println("Collector threw $e")

            // 重新拋出下游例外
            throw e
        }
    }
    // 將 Flow 收集包裹在 try-catch 中
    try {
        myFlow.collect {
            // 從 collect() Lambda 拋出例外
            throw MyFlowException("Can't process '$it'!")
        }
    } catch (e: MyFlowException) {
        println("Flow collection failed with $e")
        // 向呼叫者重新拋出例外
        throw e
    }
}
//sampleEnd
```
{kotlin-runnable="true" validate="false"}

在此範例中，收集器在接收到來自 `emit()` 函式的數值時拋出例外。`flow()` 建立器函式捕獲了此下游例外。

當您在 Flow 建立器函式中捕獲到收集器拋出的例外時，請重新拋出它。這能維持例外透明性，並讓 `collect()` 的呼叫者能夠處理該例外。

#### 使用 `.catch()` 運算子處理上游例外

要在例外到達收集器之前對其進行處理，請使用 [`.catch()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/catch.html) 運算子。

您可以使用 `.catch()` 運算子來處理來自上游 Flow 的例外，例如使用 `emit()` 函式向下游發送一個備援值 (fallback value)：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun main() {
    flow {
        emit("a")
        emit("b")

        // 從上游 Flow 拋出例外
        throw UnsupportedOperationException(
            "I am tired of listing letters"
        )
    }.catch { upstreamException ->
        println("Upstream completed with $upstreamException!")

        // 向下游發送備援值
        emit("Upstream terminated with an exception!")
    }.collect {
        println("Got '$it'")
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

在此範例中，上游 Flow 在拋出例外前已發送了一些數值。`.catch()` 運算子處理了該例外並發送 `"Upstream terminated with an exception!"` 作為備援值。

當預期 Flow 在正常運作期間可能拋出某些例外時，請在 `.catch()` 中處理可恢復的例外，並重新拋出任何非預期的例外。

以下是一個 Flow 載入資料並回報其進度的範例：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
sealed interface LoadingState {
    sealed interface Terminal: LoadingState
    object Started: LoadingState
    data class Percentage(val percents: Int): LoadingState
    object Failed: Terminal
    object Done: Terminal
}

fun loadBlob(url: String) = flow {
    emit(LoadingState.Started)

    val failureChancePerStep = 1 - java.lang.Math.pow(0.99, 10.0)

    repeat(10) { step ->
        if (Random.nextDouble() < failureChancePerStep)
            throw IOException("Failed to load!")
        emit(LoadingState.Percentage((step + 1) * 10))
        delay(10.milliseconds)
    }
    emit(LoadingState.Done)
}.catch { e ->
    println("Loading data failed with $e")
    if (e is IOException) {
        // 處理預期中的例外
        emit(LoadingState.Failed)
    } else {
        // 重新拋出非預期例外，讓 collect() 因其失敗
        throw e
    }
}

suspend fun main() {
    loadBlob("https://example.com/").collect {
        println("Got '$it'")
    }
}
//sampleEnd
```
{kotlin-runnable="true" validate="false"}

在此範例中，如果載入因預期中的例外而失敗，`.catch()` 運算子會使用 `emit()` 函式發送備援狀態。對於非預期的例外，則在 `.catch()` 運算子中重新拋出。這讓 `collect()` 函式的呼叫者能夠接收到 Flow 未處理的例外。

`.catch()` 運算子不會處理收集器拋出的例外。如果傳遞給 `collect()` 的 Lambda 拋出例外，請使用圍繞 `collect()` 函式的 `try-catch` 區塊來處理它：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

suspend fun main() {
    val myFlow = flow {
        for (char in listOf('a', 'o', '5', 'c')) {
            try {
                emit(char)
            } catch (e: IllegalArgumentException) {
                println("Collector doesn't support character '$char': $e")

                // 重新拋出下游例外
                throw e
            }
        }
    }.catch { e ->
        // 不會執行，因為例外發生在下游
        println("Upstream threw an exception: $e")
    }

    try {
        myFlow.collect {
            require(!it.isDigit()) { "Digits are not allowed!" }
        }
    } catch (e: IllegalArgumentException) {
        // 處理來自 collect() Lambda 的例外
        println("Flow collection failed with $e")
    }
}
```
{kotlin-runnable="true"}

由於 `collect()` Lambda 在 `.catch()` 之後執行，因此您無法使用 `.catch()` 來處理其中拋出的例外。若要使用 `.catch()` 處理針對每個發送出的數值執行的程式碼，請將該程式碼置於 `.catch()` 之前的 [.onEach()](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-each.html) 中。

`.onEach()` 運算子會在每個數值發送向下游之前執行其 Lambda。如果 `.catch()` 處理了來自 `.onEach()` 的例外，Flow 將完成且不會發送下一個數值：

範例如下：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds

suspend fun main() {
    flowOf('a', 'o', '5', 'c')
        // 在每個數值向下游發送之前執行
        .onEach {
            require(!it.isDigit()) { "Digits are not allowed!" }
            println("Got '$it'")
        }
        .catch { e ->
            println("Caught an exception: $e")
        }
        .collect()
}
```
{kotlin-runnable="true"}

在此範例中，`.onEach()` 運算子位於 `.catch()` 的上游，因此當 `require()` 檢查對 `'5'` 失敗時，`.catch()` 運算子會處理該例外。

#### 在例外發生後重新啟動上游 Flow

某些操作可能會暫時失敗，例如失去連線的網路請求。對於這些情況，您可以使用 [`.retry()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/retry.html) 運算子在發生例外後重新啟動上游 Flow。

`.retry()` 運算子接收一個例外，並在其 Lambda 回傳 `true` 時重新啟動收集過程，最多重試指定的次數。例如，`.retry(3)` 在第一次嘗試失敗後，最多會重試上游 Flow 三次。

如果 Lambda 回傳 `false`，`.retry()` 會停止重試並重新拋出例外。

> 若要對重試邏輯進行更多控制，請使用 [`.retryWhen()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/retry-when.html) 運算子。
> 與 `.retry()` 相同，它會接收例外，但還會接收目前的重試次數，並能在重試前發送數值。
>
{style="note"}

以下範例在發生 `IOException` 後最多重試載入三次：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds

//sampleStart
sealed interface LoadingState {
    sealed interface Terminal: LoadingState
    object Started: LoadingState
    data class Percentage(val percents: Int): LoadingState
    object Failed: Terminal
    object Done: Terminal
}

fun loadBlob(url: String) = flow {
    emit(LoadingState.Started)

    val failureChancePerStep = 1 - java.lang.Math.pow(0.99, 10.0)

    repeat(10) { step ->
        if (Random.nextDouble() < failureChancePerStep)
            throw IOException("Failed to load!")
        emit(LoadingState.Percentage((step + 1) * 10))
        delay(10.milliseconds)
    }
    emit(LoadingState.Done)
}.retry(3) { e ->
    if (e is IOException) {
        // 這是預期中的錯誤
        // 在重試前等待一秒
        delay(1.seconds)
        true
    } else {
        // 停止重試並重新拋出非預期例外
        false
    }
}

suspend fun main() {
    loadBlob("https://example.org/").collect {
        println("Got $it")
    }
}
//sampleEnd
```
{kotlin-runnable="true" validate="false"}

### Flow 取消

當不再需要結果時（例如請求逾時），Flow 的取消會停止收集過程。

Flow 的收集與呼叫 `collect()` 函式的協同程式綁定。當該協同程式被取消時，收集會停止，上游 Flow 也會隨之取消。

要取消 Flow 收集，請在收集協同程式的 `Job` 上呼叫 `cancel()` 函式：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
val myFlow = flow {
    var i = 0
    try {
        while (true) {
            println("Emitting $i")
            emit(i)
            println("Emitted $i")
            ++i
            delay(10.milliseconds)
        }
    } catch (e: Throwable) {
        println("Upstream finished with $e")
        throw e
    }
}

suspend fun main() {
    coroutineScope {
        val job = launch {
            try {
                myFlow.collect {
                    println("Processing $it")
                    delay(5.milliseconds)
                }
            } catch (e: Throwable) {
                println("Collection finished with $e")
                throw e
            }
        }
        delay(100.milliseconds)

        // 取消收集 Flow 的協同程式
        job.cancel()
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

收集器也可以在收集協同程式保持活動狀態的情況下取消上游 Flow。為此，請從收集器中拋出 `CancellationException`。

[`.take()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/take.html) 運算子利用此行為在收集到固定數量的數值後停止收集。例如，`.take(3)` 僅收集上游 Flow 的前三個值，然後將其取消。

以下範例使用了簡化版本的 `.take()` 運算子：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
// 定義預設 .take() 運算子的簡化版本
fun <T> Flow<T>.myTake(count: Int): Flow<T> = flow {
    require(count > 0)
    val cancellationException = CancellationException()
    var elementsRemaining = count
    try {
        this@myTake.collect {
            emit(it)
            --elementsRemaining
            if (elementsRemaining == 0) {
                // 在發送完請求數量的數值後取消上游 Flow
                throw cancellationException
            }
        }
    } catch (e: Throwable) {
        if (e === cancellationException) {
            // 處理用於取消上游 Flow 的 CancellationException
            // 在 .myTake() 設定的數值數量發送完後完成 Flow
        } else {
            // 重新拋出非預期例外
            throw e
        }
    }
}

suspend fun main() {
    (0..1000).asFlow().myTake(3).collect {
        println("Got $it")
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

在此範例中，`.myTake()` 函式會從上游 Flow 發送數值，直到所有要求的數值都發送完畢。然後拋出 `CancellationException` 以取消上游 Flow。

### 使用 `channelFlow()` 並行發送數值

對於從單個協同程式發送數值的 Flow，`flow()` 建立器函式既簡單又高效。如果您想從多個協同程式並行地向同一個 Flow 發送數值，請使用 [`channelFlow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/channel-flow.html) 建立器函式。它可以用於漸進式回報結果的並行工作，例如從多個來源載入資料。

`channelFlow()` 建立器函式會建立一個冷 Flow，並使用[通道](channels.md)來從多個協同程式傳送數值。在建立器內部，請使用 [`send()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-send-channel/send.html) 函式而非 `emit()` 函式來產生數值。

以下範例使用 `channelFlow()` 同時收集兩個 Flow，並使用簡化版本的 [`.merge()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/merge.html) 運算子重新發送它們的值：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
// 定義預設 .merge() 運算子的簡化版本
fun <T> Flow<T>.myMerge(other: Flow<T>): Flow<T> = channelFlow {
    // 這裡可以使用 CoroutineScope 和 SendChannel 作為接收器
    // 啟動一個收集接收器 Flow 的協同程式
    launch {
        // 收集接收器 Flow
        this@myMerge.collect {
            send(it)
        }
    }
    launch {
        // 啟動一個收集另一個 Flow 的協同程式
        other.collect {
            // 呼叫 SendChannel.send
            send(it)
        }
    }
}

suspend fun main() {
    val flow1 = (0..3).asFlow().onEach { delay(20.milliseconds) }
    val flow2 = (6..9).asFlow().onEach { delay(50.milliseconds) }
    flow1.myMerge(flow2).collect { println(it) }
}
//sampleEnd
```
{kotlin-runnable="true"}

`channelFlow()` 建立器函式使用緩衝通道，允許生產者在緩衝區填滿前超前收集器傳送數值。預設情況下，緩衝區最多可容納 64 個數值。當緩衝區滿時，生產者會掛起直到緩衝區有空間。

您可以使用 [`.buffer()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/buffer.html) 運算子更改緩衝容量。例如，`.buffer(12)` 讓生產者最多可比收集器超前傳送 12 個數值，而 `.buffer(0)` 則移除緩衝，因此每個數值僅在收集器能夠接收時才會傳送。

範例如下：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
suspend fun main() {
    val oneHundredNumbers = channelFlow {
        repeat(100) {
            println("Sending $it")
            send(it)
        }
    }

    // 使用預設緩衝容量
    oneHundredNumbers.collect {
        println("Processing $it")
        delay(10.milliseconds)
    }
  
    // 移除緩衝，使傳送與處理從一開始就交替進行
    oneHundredNumbers.buffer(0).collect {
        println("Processing $it")
        delay(10.milliseconds)
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

在此範例中，`oneHundredNumbers` Flow 使用預設緩衝容量，而 `oneHundredNumbers.buffer(0)` Flow 則沒有緩衝。

使用預設緩衝容量時，生產者會迅速傳送數值直至緩衝區滿。之後，`send()` 會掛起直至緩衝區有空間，因此 `Sending` 與 `Processing` 訊息開始交替出現。

使用 `.buffer(0)` 時，每次 `send()` 呼叫都會等待收集器接收數值，因此 `Sending` 與 `Processing` 從一開始就交替進行。

## 熱 Flow

熱 Flow 是共享的串流，發送數值的過程獨立於收集器之外。即使沒有活動中的收集器，它們也會持續發送數值，且多個收集器可以從現有的活動串流中收集相同的發送內容，而不是啟動新的執行。

熱 Flow 的收集器稱為 *訂閱者 (subscriber)*。

當應用程式的多個部分需要對同一個更新串流做出回應時，您可以使用熱 Flow，例如傳入的聊天訊息、使用者操作或 UI 狀態變更。

Kotlin 提供兩種熱 Flow 類型：

* [`SharedFlow`](#create-a-sharedflow) 向多個訂閱者廣播數值。當您需要廣播隨時間發生的事件（如訊息或通知）時，請使用它。
* [`StateFlow`](#create-a-stateflow) 是一種專門的 `SharedFlow`，始終持有最新的狀態值。當您需要表示隨時間變化的狀態（如 UI 狀態）時，請使用它。

### 建立 `SharedFlow`

[`SharedFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/) 是一種熱 Flow，它向訂閱者廣播隨時間發生的發送數值。

您可以使用 [`MutableSharedFlow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-mutable-shared-flow.html) 函式建立 `SharedFlow`。

`MutableSharedFlow` 公開了用於發送數值的函式。如果您直接公開它，類別外部的程式碼也能向 Flow 發送數值。

為了防止這種情況，請將可變 Flow 存儲在私有 [支援屬性 (backing property)](properties.md#backing-properties) 中，並透過 [`.asSharedFlow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/as-shared-flow.html) 函式公開一個唯讀的 `SharedFlow`。若要向訂閱者發送數值，請對 `MutableSharedFlow` 使用 `emit()` 函式：

```kotlin
data class Message(
    val senderId: Int,
    val time: Instant,
    val text: String,
)

class Chatroom {
    // 將 SharedFlow 存儲在私有支援屬性中
    private val _messages = MutableSharedFlow<Message>()

    // 向訂閱者公開唯讀的 SharedFlow
    val messages: SharedFlow<Message>
        get() = _messages.asSharedFlow()

    suspend fun sendMessageToEveryone(message: Message) {
        // 向訂閱者發送訊息
        _messages.emit(message)
    }
}
```

就像冷 Flow 一樣，您可以使用 `collect()` 函式從 `SharedFlow` 收集數值。

您也可以將 `SharedFlow` 設定為立即向新訂閱者重播 (replay) 已發送出的數值。重播快取 (replay cache) 就像一個小型的歷程緩衝區，存儲固定數量的先前發送內容。

若要設定新訂閱者接收多少個先前的發送內容，請使用 `MutableSharedFlow()` 中的 `replay` 參數：

```kotlin
// 設定新訂閱者在訂閱時接收多少個已發送的訊息
const val MESSAGES_TO_REMEMBER = 10

class Chatroom {
    private val _messages = MutableSharedFlow<Message>(

        // 向新訂閱者重播設定數量的最後發送訊息
        replay = MESSAGES_TO_REMEMBER
    )

    val messages: SharedFlow<Message>
        get() = _messages.asSharedFlow()

    suspend fun sendMessageToEveryone(message: Message) {
        // 向 messages Flow 的訂閱者發送訊息 
        _messages.emit(message)
    }
}
```

收集熱 Flow 本身不會自行完成，因此當您不再需要它們時，必須 [取消收集協同程式](#cancel-hot-flows)。

> 熱 Flow 沒有關閉或取消的操作。取消收集僅會停止對應的訂閱者收集。要停止新的發送，請取消產生熱 Flow 數值的協同程式或作用域。
>
{style="note"}

讓我們看一個使用 `SharedFlow` 建立聊天室模型的範例，它會向活動中的訂閱者傳送每條新訊息，並向隨後加入的訂閱者重播最近的訊息：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.*

data class Message(
    val senderId: Int,
    val time: Instant,
    val text: String,
)

// 設定新訂閱者在訂閱時接收多少個已發送的訊息
const val MESSAGES_TO_REMEMBER = 10

class Chatroom {
    // 將 SharedFlow 存儲在私有支援屬性中
    private val _messages = MutableSharedFlow<Message>(

        // 向新訂閱者重播設定數量的最後發送訊息
        replay = MESSAGES_TO_REMEMBER
    )

    // 向訂閱者公開唯讀的 SharedFlow
    val messages: SharedFlow<Message>
        get() = _messages.asSharedFlow()

    // 向訂閱者發送訊息
    suspend fun sendMessageToEveryone(message: Message) {
        _messages.emit(message)
    }
}

suspend fun main() {
    val nUsers = 3
    val chatroom = Chatroom()
    withContext(Dispatchers.Default) {
        // 為每個使用者啟動一個訊息讀取器
        val messageReaders = List(nUsers) { userId ->
            // 在訊息發送前啟動收集
            launch(start = CoroutineStart.UNDISPATCHED) {
                chatroom.messages.collect { message ->
                    println("User $userId received $message")
                }
            }
        }
        // 從每個使用者發送問候語
        repeat(nUsers) { userId ->
            chatroom.sendMessageToEveryone(
                Message(
                    userId,
                    Clock.System.now(),
                    "Hello from $userId!"
                )
            )
        }
        // 延遲以確保人們有足夠的時間聊天
        delay(100.milliseconds)
        // 取消讀取器，因為 SharedFlow 收集不會自行結束
        messageReaders.forEach { it.cancel() }
    }

}
```
{kotlin-runnable="true"}

在此範例中，[`CoroutineStart.UNDISPATCHED`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-start/-u-n-d-i-s-p-a-t-c-h-e-d/) 會立即啟動每個收集協同程式。

這確保了每個協同程式都能到達 `collect()`，訂閱 `messages`，並在 `sendMessageToEveryone()` 發送訊息之前掛起。如果沒有它，當重播快取太小時，收集協同程式可能會啟動較晚而錯過早期的發送內容。

#### 使用顯式支援欄位公開熱 Flow
<primary-label ref="experimental-opt-in"/>

您可以使用 [顯式支援欄位 (explicit backing fields)](whatsnew23.md#explicit-backing-fields) 來公開唯讀的 `SharedFlow`，同時在類別內部保持可變的支援欄位。

顯式支援欄位在 `field` 宣告中定義實作類型。在類別內部，編譯器會將屬性智慧轉型 (smart cast) 為支援欄位類型，因此您可以直接呼叫 `emit()` 函式，而不需要額外的私有支援屬性。

> 顯式支援欄位不會建立 `.asSharedFlow()` 所提供的唯讀包裝。僅在不擔心公開的 Flow 被向下轉型時才使用此模式。
> 
{style="warning"}

範例如下：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Clock
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.ExperimentalTime
import kotlin.time.Instant
        
data class Message(
    val senderId: Int,
    val time: Instant,
    val text: String,
)

const val MESSAGES_TO_REMEMBER = 10

//sampleStart
class Chatroom {
    // 使用可變支援欄位公開唯讀的 SharedFlow
    val messages: SharedFlow<Message>
        field = MutableSharedFlow<Message>(
            replay = MESSAGES_TO_REMEMBER
        )

    suspend fun sendMessageToEveryone(message: Message) {
        // 透過 Chatroom 內部的可變支援欄位發送
        messages.emit(message)
    }
}
//sampleEnd

suspend fun main() {
    val nUsers = 3
    val chatroom = Chatroom()

    withContext(Dispatchers.Default) {
        val messageReaders = List(nUsers) { userId ->
            launch(start = CoroutineStart.UNDISPATCHED) {
                chatroom.messages.collect { message ->
                    println("User $userId received $message")
                }
            }
        }

        repeat(nUsers) { userId ->
            chatroom.sendMessageToEveryone(
                Message(
                    senderId = userId,
                    time = Clock.System.now(),
                    text = "Hello from $userId!"
                )
            )
        }

        delay(100.milliseconds)
        messageReaders.forEach { it.cancel() }
    }
}
```
{kotlin-runnable="true"}

### 建立 `StateFlow`

[`StateFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-state-flow/) 是一種熱 Flow，它存儲單個狀態值，並在該值被新值替換時發送更新。新訂閱者在開始收集時會立即收到當前值，隨後在每次狀態更新時收到新值。

您可以使用 `StateFlow` 來表示隨時間變化的狀態，例如載入進度、UI 狀態或物件的狀態。

要建立 `StateFlow`，請使用帶有初始值的 [`MutableStateFlow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-mutable-state-flow.html) 函式：

```kotlin
// 以 LoadingState.Started 作為初始值建立 MutableStateFlow
val result = MutableStateFlow<LoadingState>(LoadingState.Started)
```

要設定當前狀態，請使用 [`value`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-mutable-state-flow/value.html) 屬性：

```kotlin
fun loadBlob(url: String): StateFlow<LoadingState> {
    val result = MutableStateFlow<LoadingState>(LoadingState.Started)

    DownloadManager.startLoading(
        url,
        onPercentageLoaded = { percentage ->
            // 將當前狀態替換為最新進度
            result.value = LoadingState.Percentage(percentage)
        },
        onCompletion = {
            // 將當前狀態替換為完成狀態
            result.value = LoadingState.Done
        },
        onFailure = {
            // 將當前狀態替換為失敗狀態
            result.value = LoadingState.Failed
        }
    )
}
```

> 設定 `value` 是執行緒安全的且會替換當前狀態，但基於先前值更新 `value` 並非原子操作。當新狀態取決於先前狀態時，請改用 `.update()`。
>
{style="note"}

與 `MutableSharedFlow` 類似，`MutableStateFlow` 公開了用於發送更新的 API。如果您直接公開它，任何接收到它的程式碼都可以透過將其向下轉型為 `MutableStateFlow` 來更新狀態。

為了防止這種情況，請使用 [`.asStateFlow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/as-state-flow.html) 函式將可變 Flow 作為唯讀的 `StateFlow` 公開：

```kotlin
fun loadBlob(url: String): StateFlow<LoadingState> {
    val result = MutableStateFlow<LoadingState>(LoadingState.Started)

    DownloadManager.startLoading(
        url,
        onPercentageLoaded = { percentage ->
            result.value = LoadingState.Percentage(percentage)
        },
        onCompletion = {
            result.value = LoadingState.Done
        },
        onFailure = {
            result.value = LoadingState.Failed
        }
    )

    // 將載入狀態作為唯讀的 StateFlow 公開
    return result.asStateFlow()
}
```

以下是一個使用 `StateFlow` 從基於回呼 (callback) 的 API 回報載入進度的範例：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds
import kotlin.io.encoding.*
import java.io.IOException
import kotlin.random.Random

//sampleStart
sealed interface LoadingState {
    sealed interface Terminal: LoadingState
    object Started: LoadingState
    data class Percentage(val percents: Int): LoadingState
    object Failed: Terminal
    object Done: Terminal
}

fun loadBlob(url: String): StateFlow<LoadingState> {
    // 以初始載入狀態建立可變的 StateFlow
    val result = MutableStateFlow<LoadingState>(LoadingState.Started)
    DownloadManager.startLoading(
        url,
        onPercentageLoaded = { percentage ->
            // 將當前狀態替換為最新進度
            result.value = LoadingState.Percentage(percentage)
        },
        onCompletion = {
            // 將當前狀態替換為完成狀態
            result.value = LoadingState.Done
        },
        onFailure = {
            // 將當前狀態替換為失敗狀態
            result.value = LoadingState.Failed
        }
    )
    // 將載入狀態作為唯讀的 StateFlow 公開
    return result.asStateFlow()
}

// 定義一個非同步下載資料的基於回呼的 API
object DownloadManager {
    // 開始非同步載入 url
    fun startLoading(
        url: String,
        onPercentageLoaded: (Int) -> Unit,
        onCompletion: () -> Unit,
        onFailure: (Throwable) -> Unit
    ) {
        // 此處使用 GlobalScope 僅用於說明目的，
        // 以保持此範例的自包含性
        GlobalScope.launch {
            val failureChancePerStep = 1 - java.lang.Math.pow(0.99, 10.0)

            repeat(10) { step ->
                if (Random.nextDouble() < failureChancePerStep) {
                    onFailure(IOException("Failed to load!"))
                    return@launch
                }
                onPercentageLoaded((step + 1) * 10)
                delay(10.milliseconds)
            }
            onCompletion()
        }
    }
}

suspend fun main() {
    loadBlob("https://example.com/").onEach { state ->
        when (state) {
            is LoadingState.Started -> {
                // 等待進度更新
            }
            is LoadingState.Percentage ->
                println("Loaded ${state.percents}...")
            is LoadingState.Failed ->
                println("Loading failed.")
            is LoadingState.Done ->
                println("Finished loading!")
        }
    }.takeWhile { it !is LoadingState.Terminal }.collect()
}
//sampleEnd
```
{kotlin-runnable="true"}

> 此範例使用 [`GlobalScope`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-global-scope/) 僅是為了簡化回呼式 API。在您自己的應用程式中，請將 `CoroutineScope` 傳遞給啟動任務的函式（如本例中的 `startLoading()`），並在該作用域中啟動協同程式，以便呼叫者在不再需要時可以取消任務。
>
{style="note"}

由於 `StateFlow` 是熱 Flow，收集不會自動完成。在此範例中，`.takeWhile()` 運算子在載入到達終端狀態時停止收集。

`StateFlow` 僅在新值與當前值不同時才會發送更新。

> 避免在 `StateFlow` 中存儲可變物件。變更物件本身不會替換當前值，因此收集器不會收到更新。
> 
{style="warning"}

您還可以透過從當前狀態計算新狀態來更新 `StateFlow`。請使用 [`.update()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/update.html) 函式進行此類更新。`.update()` 函式會原子化地更新值，這在多個協同程式同時更新同一個 `MutableStateFlow` 時非常有幫助。

> 如果您只需要更新共享值而不需要隨時間觀察狀態變化，請使用 Kotlin Atomics API，例如 [`AtomicInt`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/-atomic-int/) 或 [`AtomicReference`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/-atomic-reference/)。
>
{style="note"}

以下範例將按讚數存儲在 `StateFlow` 中，並根據前一個狀態計算每個新狀態：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds
import kotlin.io.encoding.*
import java.io.IOException
import kotlin.random.Random

//sampleStart
class Post(val id: Long) {
    // 以 StateFlow 形式存儲當前按讚數
    private val _numberOfLikes = MutableStateFlow<Int>(
        // 設定初始按讚數
        0
    )

    // 公開一個帶有當前按讚數的唯讀 StateFlow
    val numberOfLikes: StateFlow<Int>
        get() = _numberOfLikes.asStateFlow()

    // 按讚
    fun like() {
        // 原子化地遞增按讚數，以應對並行與多執行緒呼叫
        _numberOfLikes.update { it + 1 }
    }
}

suspend fun drawUpdatedNumberOfLikes(likes: Int) {
    // 顯示最新的按讚數
    println("${Clock.System.now()}: the number of likes is $likes")
}

suspend fun main() {
    withContext(Dispatchers.Default) {
        val post = Post(15)
        val notifyingJob = launch {
            post.numberOfLikes.collect {
                drawUpdatedNumberOfLikes(it)
            }
        }
        // 模擬按讚的使用者
        coroutineScope {
            repeat(10) {
                launch {
                    delay(Random.nextInt(100).milliseconds)
                    post.like()
                }
            }
        }
        // 在所有模擬使用者完成後取消收集
        notifyingJob.cancelAndJoin()
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

在此範例中，`.update()` 函式原子化地遞增按讚數。這能防止多個協同程式同時呼叫 `like()` 函式時發生更新遺失。

#### 在 `StateFlow` 中存儲累計狀態

有時您可能希望訂閱者收到所有先前發送內容的結果，而不僅僅是最新發送的值。

例如，聊天室可以將其訊息歷程記錄保持為單個狀態值。當新使用者加入聊天室時，他們會先收到當前的訊息歷程，然後在有新訊息到達時繼續接收更新。

您可以使用 `StateFlow` 來建立這種行為的模型。

為此，請使用 `StateFlow<List<Message>>` 將完整的訊息歷程存儲為當前值，而不是使用 `SharedFlow<Message>` 將每條聊天訊息作為單獨的事件廣播：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds
import kotlin.io.encoding.*
import java.io.IOException
import kotlin.random.Random

//sampleStart
data class Message(
    val senderId: Int,
    val time: Instant,
    val text: String,
)

class Chatroom {
    // 存儲完整的訊息歷程
    private val _messageHistory = MutableStateFlow<List<Message>>(emptyList())

    // 公開一個帶有當前訊息歷程的唯讀 StateFlow
    val messageHistory: StateFlow<List<Message>>
        get() = _messageHistory.asStateFlow()

    // 向 messageHistory Flow 的所有訂閱者傳送訊息
    suspend fun sendMessageToEveryone(message: Message) {
        // 原子化地將新訊息添加到當前歷程中
        _messageHistory.update {
            it + message
        }
    }
}

suspend fun main() {
    val nUsers = 3
    val chatroom = Chatroom()
    withContext(Dispatchers.Default) {
        // 為每個使用者啟動一個訊息讀取器
        val messageReaders = List(nUsers) { userId ->
            launch(start = CoroutineStart.UNDISPATCHED) {
                chatroom.messageHistory.collect { currentHistory ->
                    println("User $userId sees the history as $currentHistory")
                }
            }
        }
        // 從每個使用者發送問候語
        repeat(nUsers) { userId ->
            chatroom.sendMessageToEveryone(
                Message(
                    userId,
                    Clock.System.now(),
                    "Hello from $userId!"
                )
            )
        }
        // 延遲以確保使用者有足夠的時間接收更新
        delay(100.milliseconds)
        // 取消讀取器，因為 StateFlow 收集不會自行結束
        messageReaders.forEach { it.cancel() }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

在此範例中，`messageHistory` 將完整的先前訊息列表存儲為當前狀態。當傳送新訊息時，`.update()` 函式會從先前的歷程中建立一個新列表，並原子化地添加新訊息。

> 隨著集合增長，透過建立新集合來更新不可變集合可能會花費更多時間。您可以使用[實驗性 (Experimental)](components-stability.md#stability-levels-explained) [`kotlinx.collections.immutable`](https://github.com/Kotlin/kotlinx.collections.immutable) 程式庫建立持久化集合，以使不可變集合的更新更有效率。
>
{style="tip"}

由於 `messageHistory` 是 `StateFlow`，訂閱者在開始收集時會收到當前的訊息歷程。之後，每當訊息傳送並導致聊天歷程變更時，他們都會收到一個新列表。

### 將冷 Flow 轉換為熱 Flow

冷 Flow 會為每個收集器分別執行其上游操作。當多個訂閱者需要來自同一個上游收集的發送內容時，您可以將冷 Flow 轉換為與訂閱者共享該收集的熱 Flow。

以下簡化版的 `.shareIn()` 展示了此想法：它僅收集一次冷 Flow，將其值發送到一個 `MutableSharedFlow` 中，並將其作為唯讀的 `SharedFlow` 公開：

```kotlin
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.*

fun <T> Flow<T>.simpleShareIn(scope: CoroutineScope): SharedFlow<T> {
    val sharedFlow = MutableSharedFlow<T>()
    scope.launch {
        this@simpleShareIn.collect {
            sharedFlow.emit(it)
        }
    }
    return sharedFlow.asSharedFlow()
}

suspend fun main() { 
    
}
```

在此範例中，`simpleShareIn()` 在提供的作用域中啟動了一個新的協同程式。若要停止從上游 Flow 收集，請[取消執行該收集協同程式的作用域](#cancel-hot-flows)。

如果上游 Flow 拋出例外，此收集協同程式將會失敗。在共享 Flow 之前，請使用 `.catch()` 或 `.retry()` 等運算子在收集協同程式失敗前 [處理上游例外](#handle-exceptions-in-hot-flows)。

內建的 [`.shareIn()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/share-in.html) 函式提供了這種模式，且不需要您自行建立 `MutableSharedFlow` 自身。它還提供了控制上游收集何時開始和停止，以及新訂閱者接收多少個先前發送內容的選項。

要使用內建的 `.shareIn()` 函式，請提供以下引數：

* 收集上游 Flow 的協同程式作用域。
* [`SharingStarted`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-sharing-started/) 策略，控制上游收集何時開始和停止。
   例如，[`SharingStarted.Eagerly`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-sharing-started/-companion/-eagerly.html) 會在提供的作用域中立即開始上游收集，而不需要等待任何訂閱者。
* 選用的 `replay` 值，控制新訂閱者接收多少個先前的發送內容。

`.shareIn()` 函式在提供的協同程式作用域中收集上游 Flow，並將其發送內容廣播給訂閱者。

以下是一個範例，其中 `.shareIn()` 將冷 Flow 轉換為熱 Flow，與多個訂閱者共享序列化後的聊天訊息：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds
import kotlin.io.encoding.*
import java.io.IOException
import kotlin.random.Random

//sampleStart
data class Message(
    val senderId: Int,
    val time: Instant,
    val text: String,
)

class Chatroom {
    // 存儲訊息 Flow
    private val _messages = MutableSharedFlow<Message>()

    // 公開帶有發送訊息的唯讀 SharedFlow
    // 新訂閱者不會收到已發送的訊息
    val messages: SharedFlow<Message>
        get() = _messages.asSharedFlow()
  
    // 向 messages Flow 的所有訂閱者傳送訊息
    suspend fun sendMessageToEveryone(message: Message) {
        _messages.emit(message)
    }
}

suspend fun main() {
    val nUsers = 3
    val chatroom = Chatroom()
    withContext(Dispatchers.Default) {
        // 建立目前執行中協同程式的子作用域
        val derivedFlowsScope = CoroutineScope(
            currentCoroutineContext() + Job(currentCoroutineContext()[Job])
        )
        // 在訂閱者之間共享序列化訊息
        val serializedMessages: SharedFlow<String> =
            chatroom
                .messages
                .map {
                    // 為共享 Flow 僅序列化每條訊息一次
                    "senderId: ${it.senderId}, time: ${it.time}, text: " +
                        Base64.Default.encode(it.text.encodeToByteArray())
                }
                .shareIn(
                    // 在此作用域中啟動共享協同程式。
                    // 上游 Flow（包括 .map()）在該協同程式中執行
                    derivedFlowsScope,

                    // 立即開始收集上游 Flow，
                    // 在第一個訂閱者出現之前
                    SharingStarted.Eagerly,

                    // 不向新訂閱者重播先前的序列化訊息
                    replay = 0,
                )

        // 為每個使用者啟動一個訊息讀取器
        val messageReaders = List(nUsers) { userId ->
            launch(start = CoroutineStart.UNDISPATCHED) {
                serializedMessages.collect { serializedMessage ->
                    println("User $userId observes the message $serializedMessage")
                }
            }
        }
        // 從每個使用者發送問候語
        repeat(nUsers) { userId ->
            chatroom.sendMessageToEveryone(
                Message(
                    userId,
                    Clock.System.now(),
                    "Hello from $userId!"
                )
            )
        }
        // 延遲以確保使用者有足夠的時間接收更新
        delay(100.milliseconds)
        // 取召讀取器，因為 SharedFlow 收集不會自行結束
        messageReaders.forEach { it.cancel() }
        // 取消執行衍生熱 Flow 的作用域
        derivedFlowsScope.cancel()
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

在此範例中，[`.map()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map.html) 運算子建立了一個序列化每條訊息的冷 Flow。若不使用 `.shareIn()` 函式，每個收集器都會分別執行該序列化。使用 `.shareIn()` 函式則共享一個上游收集，因此每條訊息僅被序列化一次，隨後與所有訂閱者共享。

因為 `SharingStarted.Eagerly` 會立即開始上游收集，所以一旦呼叫 `.shareIn()`，衍生的熱 Flow 就會開始收集 `chatroom.messages`。

同樣地，要將冷 Flow 轉換為 `StateFlow`，請使用 [`.stateIn()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/state-in.html) 函式。

與 `.shareIn()` 不同，`.stateIn()` 需要一個初始值，因為 `StateFlow` 必須始終持有一個當前值。

例如：

```kotlin
val lastUpdateFlow: StateFlow<Instant?> =
    chatroom
        .messageHistory
        .map { currentHistory -> currentHistory.lastOrNull()?.time }
        .stateIn(
            // 在此作用域中啟動共享協同程式
            // 上游 Flow（包括 .map()）在該協同程式中執行
            derivedFlowsScope,

            // 在第一個訂閱者出現時開始收集，
            // 並在最後一個訂閱者消失時停止
            SharingStarted.WhileSubscribed(),
            // 在第一個上游發送前設定初始狀態
            null,
        )
```

### 取消熱 Flow

當訂閱者被取消時，熱 Flow 不會停止。

當您取消收集熱 Flow 的協同程式時，僅取消了該訂閱者。熱 Flow 仍可以向其他訂閱者發送數值，且產生這些數值的協同程式可以繼續執行。

熱 Flow 本身沒有取消操作。若要取消熱 Flow，請取消為其產生數值的協同程式或作用域。

使用 `.shareIn()` 或 `.stateIn()` 擴充函式建立的熱 Flow 會持續收集上游 Flow，直到共享協同程式被取消。要停止從上游 Flow 收集，請取消執行該共享協同程式的作用域。

> 您也可以使用 [`SharingStarted.WhileSubscribed()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-sharing-started/-companion/-while-subscribed.html) 在沒有訂閱者時自動停止上游收集。
> 
{style="tip"}

以下範例展示了取消傳遞給 `.stateIn()` 的作用域後，衍生的熱 Flow 停止收集新值的情形：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds
import kotlin.io.encoding.*
import java.io.IOException
import kotlin.random.Random

data class Message(
    val senderId: Int,
    val time: Instant,
    val text: String,
)

class Chatroom {
    // 存儲訊息歷程
    private val _messageHistory = MutableStateFlow<List<Message>>(emptyList())

    // 公開一個帶有當前訊息歷程的唯讀 StateFlow
    val messageHistory: StateFlow<List<Message>>
        get() = _messageHistory.asStateFlow()

    // 向 messageHistory Flow 的所有訂閱者傳送訊息
    suspend fun sendMessageToEveryone(message: Message) {
        _messageHistory.update {
            it + message
        }
    }
}

//sampleStart
suspend fun main() {
    val chatroom = Chatroom()
    withContext(Dispatchers.Default) {
        // 建立目前執行中協同程式的子作用域
        val derivedFlowsScope = CoroutineScope(
            currentCoroutineContext() + Job(currentCoroutineContext()[Job])
        )
        val totalMessages = chatroom.messageHistory
            .map { currentHistory ->
                currentHistory.size
            }.onEach {
                println("There are currently $it messages")
            }.stateIn(
                // 在此作用域中啟動共享協同程式
                derivedFlowsScope
            )
        // 更新 messageHistory
        chatroom.sendMessageToEveryone(
            Message(0, Clock.System.now(), "We are shutting down soon!")
        )
        delay(100.milliseconds)
        // 取消執行衍生熱 Flow 的作用域
        derivedFlowsScope.cancel()
        // 更新 messageHistory，但 totalMessages 不再接收更新
        chatroom.sendMessageToEveryone(
            Message(0, Clock.System.now(), "We have shut down.")
        )
        println("Last collected history size: ${totalMessages.value}")
        println("Actual history size: ${chatroom.messageHistory.value.size}")
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

在此範例中，當您呼叫 `derivedFlowsScope.cancel()` 函式時，`totalMessages` 會停止從 `messageHistory` 收集更新。

`sendMessageToEveryone()` 函式仍會更新 `messageHistory`，因為呼叫它的協同程式並未被取消。因此，`totalMessages.value` 保持最後收集到的數量，而 `chatroom.messageHistory.value.size` 則顯示實際的訊息數量。

### 處理熱 Flow 中的例外

在 [冷 Flow](#handle-exceptions-in-flows) 中，除非您先使用 `.catch()` 等運算子處理上游例外，否則例外會傳遞給 `collect()` 的呼叫者。

熱 Flow 不會將例外從生產者傳播給訂閱者。如果發送到 `MutableSharedFlow` 或更新 `MutableStateFlow` 的程式碼拋出例外，請在執行該程式碼的協同程式中處理它。如果訂閱者在收集時拋出例外，請在收集協同程式中處理它。

使用 `.shareIn()` 或 `.stateIn()` 擴充函式建立的熱 Flow 會在共享協同程式中收集上游 Flow。如果上游 Flow 拋出例外，該例外會取消共享協同程式：

```kotlin
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.*

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default) {
        launch {
            flow<Int> {
                error("An upstream failure")
            }.stateIn(
                this@launch
            )
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true" validate="false"}

您可以在失敗後 [重新啟動上游收集](#restart-the-upstream-flow-after-an-exception)。為此，請將 `.retry()` 運算子置於 `.shareIn()` 或 `.stateIn()` 之前：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
suspend fun main() {
    coroutineScope {
        launch {
            var currentAttempt = 0

            val stateFlow = flow {
                delay(10.milliseconds)

                if (currentAttempt++ < 5) {
                    println("An error happened!")
                    error("An upstream failure")
                } else {
                    println("Success.")
                    emit(10)
                }
            }
                // 在可恢復的失敗後重新啟動上游 Flow
                .retry(retries = 5)
                .stateIn(
                    // 在此作用域中啟動共享協同程式
                    this@launch
                )

            stateFlow.collect {
                println("Observed $it")

                // 取消收集與共享協同程式
                this@launch.cancel()
            }
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

在此範例中，Flow 在發送數值前失敗了五次。由於 `.retry()` 位於 `.stateIn()` 之前，它在失敗到達共享協同程式之前處理了每次上游失敗。

當上游 Flow 發送 `10` 後，收集協同程式接收該值並取消自身。由於該協同程式也是共享協同程式的父項，因此這會停止衍生的熱 Flow。