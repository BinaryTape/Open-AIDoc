<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: Flowオペレーター)

Flowオペレーターを使用すると、Flowパイプライン内の値を変換および処理できます。
Kotlinは、主に2種類のFlowオペレーターを提供しています：

* [**中間オペレーター（Intermediate operators）**](#intermediate-operators)は、上流（upstream）のFlowからの値を消費して操作を適用し、新しい下流（downstream）のFlowを返します。
* [**終端オペレーター（Terminal operators）**](#terminal-operators)は、上流のFlowを収集（collect）することで、Flowパイプラインの実行をトリガーします。これらは結果を返す場合もあります。

[`kotlinx.coroutines`](https://github.com/Kotlin/kotlinx.coroutines) ライブラリは幅広いFlowオペレーターを提供していますが、組み込みのオペレーターでは提供されていない動作が必要な場合には、カスタムオペレーターを定義することもできます。

> 以下のセクションでは、対応する組み込みオペレーターと並行して、カスタム実装の例を紹介します。
>
{style="tip"}

## 中間オペレーター

中間オペレーターは、上流のFlowからの値を消費する新しい下流のFlowを返します。
最終的な結果を収集する前に、いくつかの中間オペレーターを連鎖させてFlowパイプラインを構築できます。

中間オペレーターは、その目的に応じて以下のカテゴリに分類できます：

* [**変換オペレーター**](#transforming-operators)（Transforming operators）：値を下流に放出する前に変換します。
* [**フィルタリングおよびサイズ制限オペレーター**](#filtering-and-size-limiting-operators)（Filtering and size-limiting operators）：どの上流の値を下流に継続させるかを制御します。
* [**並行処理オペレーター**](#concurrent-processing-operators)（Concurrent processing operators）：放出と収集を別々に実行できるようにします。
* [**合成オペレーター**](#combining-operators)（Combining operators）：複数の上流のFlowから値を収集し、1つの下流のFlowに放出します。
* [**ライフサイクルオペレーター**](#lifecycle-operators)（Lifecycle operators）：収集の開始時や上流のFlowの完了時など、Flow収集中の特定のイベントに応じてアクションを実行します。

### 変換オペレーター

変換オペレーターは、上流のFlowから放出された値を変換します。
値を別の型に変換したり、値をスキップしたり、追加の値を下流に放出したりするために使用できます。

> 変換オペレーターは中断ラムダ（suspending lambdas）を受け取るため、放出された各値を処理する際に、そのラムダ内で中断関数を呼び出すことができます。
> Flowパイプラインが並行性を導入するオペレーターを使用していない限り、値は依然として逐次的に処理されます。
>
{style="note"}

[`.transform()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/transform.html) オペレーターは汎用的な変換オペレーターであり、[`.map()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map.html) や [`.filter()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/filter.html) のような、より具体的な変換オペレーターの基礎として使用できます。

以下は、`.transform()` オペレーターを使用して、各上流の値をその値と同じ回数だけ放出する例です：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// デフォルトの .transform() オペレーターを簡略化したカスタム実装
inline fun <T, R> Flow<T>.myTransform(
    // 下流に値を放出できる中断ラムダを受け取る
    crossinline transform: suspend FlowCollector<R>.(value: T) -> Unit
): Flow<R> = flow {
    // 上流のFlowから値を収集する
    this@myTransform.collect { value ->
        // 変換を適用し、下流のFlowに値を放出する
        this@flow.transform(value)
    }
}

// デフォルトの .transform() オペレーターを使用
suspend fun main() = withContext(Dispatchers.Default) {
    val flow = (0..4).asFlow().transform { value ->
        // 各値をその値と同じ回数だけ放出する
        repeat(value) {
            emit(value)
        }
    }
    println(flow.toList())
    // [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
}
```
{kotlin-runnable="true"}

[`.map()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map.html) オペレーターを使用すると、各上流の値を1つの下流の値に変換できます。

以下は、`.map()` を使用して各値を4倍にする例です：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// デフォルトの .map() オペレーターを簡略化したカスタム実装
inline fun <T, R> Flow<T>.myMap(
    crossinline transform: suspend (value: T) -> R
): Flow<R> = transform { value ->
    emit(transform(value))
}

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    // 各上流の値を4倍にする
    val flow = (0..4).asFlow().map { it * 4 }
    println(flow.toList())
    // [0, 4, 8, 12, 16]
}
//sampleEnd
```
{kotlin-runnable="true"}

条件に一致する上流の値のみを放出するには、[`.filter()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/filter.html) オペレーターを使用します。

以下は、`3` で割った余りが `1` になる値を放出する例です：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// デフォルトの .filter() オペレーターを簡略化したカスタム実装
inline fun <T> Flow<T>.myFilter(
    crossinline predicate: suspend (value: T) -> Boolean
): Flow<T> = transform { value ->
    // 条件に一致する値のみを放出する
    if (predicate(value))
        emit(value)
}

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    // 3で割った余りが1になる値のみを放出する
    val flow = (0..10).asFlow().filter { it % 3 == 1 }
    println(flow.toList())
    // [1, 4, 7, 10]
}
//sampleEnd
```
{kotlin-runnable="true"}

一部のオペレーターは、`.map()` と `.filter()` のような他の変換オペレーターの動作を組み合わせることができます。例えば、値を変換し、条件に一致する結果のみを放出するといった具合です。

例えば、[`.mapNotNull()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map-not-null.html) を使用すると、各上流の値を変換し、非null（non-null）の結果のみを放出できます：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// デフォルトの .mapNotNull() オペレーターを簡略化したカスタム実装
inline fun <T, R: Any> Flow<T>.myMapNotNull(
    crossinline transform: suspend (value: T) -> R?
): Flow<R> = transform { value ->
    transform(value)?.let { transformed ->
        emit(transformed)
    }
}

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    // 各文字列をDoubleに変換し、変換できない値はスキップする
    val flow = flowOf("1.2", "10", "11", "error", "0.000")
        .mapNotNull { it.toDoubleOrNull() }
    
    println(flow.toList())
    // [1.2, 10.0, 11.0, 0.0]
}
//sampleEnd
```
{kotlin-runnable="true"}

### フィルタリングおよびサイズ制限オペレーター

フィルタリングおよびサイズ制限オペレーターは、Flowからどの値が下流に継続するかを制御します。
連続した重複値の削除、Flowの開始部分の値をスキップ、または指定した数の値の後に収集をキャンセルするために使用できます。

連続した重複値を無視するには、[`.distinctUntilChanged()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/distinct-until-changed.html) オペレーターを使用します。
これは、直前に放出された値と異なる場合にのみ値を放出します：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// デフォルトの .distinctUntilChanged() オペレーターを簡略化したカスタム版
fun <T> Flow<T>.myDistinctUntilChanged(): Flow<T> = flow {
    var lastEmitted: Any? = Any() // 自分自身にのみ等しい値
    this@myDistinctUntilChanged.collect { value ->
        if (lastEmitted != value) {
            this@flow.emit(value)
            lastEmitted = value
        }
    }
}

suspend fun main() = withContext(Dispatchers.Default) {
    // 上流のFlowから連続した重複値を取り除く
    val flow = flowOf(1, 2, 3, 3, 3, 4, 5, 5, 1).distinctUntilChanged()
    println(flow.toList())
    // [1, 2, 3, 4, 5, 1]
}

```
{kotlin-runnable="true"}

[`.drop()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/drop.html) オペレーターを使用すると、上流のFlowから放出された最初の数個の値をスキップできます。
例えば、`.drop(2)` は最初の2つの値をスキップし、残りの値を下流に放出します：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// デフォルトの .drop() オペレーターを簡略化したカスタム版
fun <T> Flow<T>.myDrop(count: Int): Flow<T> = flow {
    require(count >= 0)
    var elementsAlreadyDropped = 0
    this@myDrop.collect { value ->
        if (elementsAlreadyDropped == count) {
            this@flow.emit(value)
        } else {
            ++elementsAlreadyDropped
        }
    }
}

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    // 上流のFlowから最初の2つの値をスキップする    
    val flow = flowOf(1, 2, 3, 4, 5).drop(2)
    println(flow.toList())
    // [3, 4, 5]
}
//sampleEnd
```
{kotlin-runnable="true"}

一定数の値の後に収集をキャンセルするには、[`.take()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/take.html) オペレーターを使用します。
以下は、`.take()` オペレーターを使用して最初の3つの値のみを収集する例です：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds

// デフォルトの .take() オペレーターを簡略化したカスタム版
fun <T> Flow<T>.myTake(count: Int): Flow<T> = flow {
    require(count > 0)
    val cancellationException = CancellationException()
    var elementsRemaining = count
    try {
        this@myTake.collect {
            emit(it)
            --elementsRemaining
            if (elementsRemaining == 0) {
                // 要求された数の値の後に上流のFlowをキャンセルする
                throw cancellationException
            }
        }
    } catch (e: Throwable) {
        if (e === cancellationException) {
            // 上流のFlowをキャンセルするために使用したCancellationExceptionを処理する
            // .myTake() で設定された数値の後にFlowを完了させる
        } else {
            // 予期しない例外を再スローする
            throw e
        }
    }
}

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    // 上流のFlowから最初の3つの値のみを収集する
    val flow = (0..1000).asFlow().take(3)

    println(flow.toList())
    // [0, 1, 2]
}
//sampleEnd
```
{kotlin-runnable="true"}

### 並行処理オペレーター

デフォルトでは、Flowパイプラインは値を逐次的に処理します。
上流のFlowが値を放出し、収集側（collector）がそれを処理してから、次の値が放出されます。

上流のFlowを下流の収集と並行して実行するには、バッファを導入する並行処理オペレーターを使用します。
バッファは、上流のFlowが放出したものの、収集側がまだ処理していない値を格納します。

このバッファを導入するオペレーターの1つが [`.buffer()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/buffer.html) オペレーターです。
これを使用すると、バッファ容量やバッファがいっぱいになったときの動作を設定できます。例：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    flow {
        repeat(10) {
            emit(it)
            println("Emitted $it!")
        }
    }
        // 上流のFlowが収集側より先に最大4つの値を放出できるようにする
        .buffer(4)
        .collect {
            println("Processed $it!")
            delay(20.milliseconds)
        }
}
//sampleEnd
```
{kotlin-runnable="true"}

収集側が上流のFlowよりも遅い場合、パイプラインには、収集側がまだ処理していない値を処理する方法が必要になります。

デフォルトでは、収集側は上流のFlowに対して *バックプレッシャー（backpressure）* を適用します。
この戦略では、バッファがいっぱいになると上流のFlowは中断し、収集側がスペースを空けると再開します。

上流のFlowを中断させる代わりに値を破棄するには、[`onBufferOverflow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.channels/-buffer-overflow/) パラメータを設定します：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    flow {
        repeat(10) {
            emit(it)
            println("Emitted $it!")
        }
    }
        // オーバーフロー動作を適用する前に最大4つの値を保存する
        // バッファがいっぱいになったときに最も古いバッファ値を破棄する
        .buffer(4, onBufferOverflow = BufferOverflow.DROP_OLDEST)
        .collect { value ->
            println("Processed $value!")
            delay(20.milliseconds)
        }
}
//sampleEnd
```
{kotlin-runnable="true"}

また、[`.conflate()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/conflate.html) オペレーターを使用することもできます。これは `buffer(1, onBufferOverflow = BufferOverflow.DROP_OLDEST)` の短縮形です。
最新の値のみを処理し、前の値が収集されている間に放出された値をスキップしたい場合に使用します。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    flow {
        repeat(10) {
            emit(it)
            println("Emitted $it!")
        }
    }.conflate().collect {
        println("Processed $it!")
        delay(20.milliseconds)
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

`.conflate()` オペレーターは、収集側がどのバッファ値を処理するかにのみ影響します。
すでに開始されている処理をキャンセルすることはありません。
それを実現するには、代わりに [`collectLatest()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/collect-latest.html) を使用してください。

これまでの例では、`.buffer()` および `.conflate()` オペレーターは、コルーチンコンテキストを変更せずに、別のコルーチンで上流のFlowを並行して実行しています。

上流のFlowを別のコルーチンコンテキストで実行するには、[`.flowOn()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow-on.html) オペレーターを使用します。
これによりディスパッチャーが変更される場合、`.flowOn()` は上流のFlowを別のコルーチンで収集し、上流の放出と下流の収集の間にバッファを使用します。

以下は、`.flowOn()` を使用して上流のFlowを `Dispatchers.IO` で実行する簡略化された例です：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    flow {
        repeat(10) {
            emit(it)
        }
        println("Finished emitting!")
    }.flowOn(Dispatchers.IO).collect {
        println("Received $it!")
        delay(10.milliseconds)
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

この例では、`.flowOn()` オペレーターによって上流の並行処理が導入される可能性がありますが、バッファの動作は明示的に設定されていません。

上流のFlowのコルーチンコンテキストとバッファ動作の両方を設定するには、`.flowOn()` を `.buffer()` または `.conflate()` と組み合わせます。
これらのオペレーターを併用すると、オペレーターは *演算子融合（operator fusion）* を行い、単一のバッファを共有します。

以下は、`.flowOn(Dispatchers.IO)` を使用して上流のFlowを `Dispatchers.IO` で実行し、`.conflate()` を使用して最新のバッファ値を保持する例です：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.Random
import kotlin.time.Duration.Companion.milliseconds
import kotlin.math.round

//sampleStart
fun awaitSensorSignal(): SensorSignal {
    Thread.sleep(10)
    val reading =
        round(Random.nextDouble(25.0, 100.0) * 100.0)/100.0
    println("Measured $reading as the temperature")
    return SensorSignal(temperatureCelsius = reading)
}

data class SensorSignal(
    val temperatureCelsius: Double
)

suspend fun sendLatestTemperature(temperatureCelsius: Double) {
    println("Starting to send $temperatureCelsius...")
    delay(50.milliseconds)
    println("Sent $temperatureCelsius.")
}

suspend fun main() = withContext(Dispatchers.Default) {
    val smartHomeTemperatureFlow = flow {
        while (true) {
            val signal = awaitSensorSignal()
            emit(signal.temperatureCelsius)
            println("Emitted $signal")
        }
    }
        // 上流のFlowをDispatchers.IOで実行
        .flowOn(Dispatchers.IO)
        // 最新のバッファ値を保持し、古い値を破棄する
        .conflate()
        // 上流のFlowから最初の2つの値を取得する
        .take(2)
        .collect { temperature ->
            println("Received $temperature!")
            sendLatestTemperature(temperature)
        }
}
//sampleEnd
```
{kotlin-runnable="true"}

### 合成オペレーター

合成オペレーターは、複数の上流のFlowから値を消費し、単一の下流のFlowを返します。
収集側が複数のFlowからの値を必要とする場合に使用します。

2つの上流のFlowからの値をペアにするには、[`.zip()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/zip.html) オペレーターを使用します。
これは各Flowからの最初の値を組み合わせ、次に各Flowからの2番目の値を組み合わせる、というように処理します。
結果のFlowは、上流のFlowのいずれかが完了するとすぐに完了します。

例を示します：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.Random
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) {
    // 100ミリ秒ごとにティッカー値を放出する
    val tickerFlow = flow {
        while (true) {
            emit(Unit)
            delay(100.milliseconds)
        }
    }

    val start = TimeSource.Monotonic.markNow()
    tickerFlow
        // 各ティッカーの放出を次の数値と組み合わせる
        .zip(flowOf(1, 2, 3)) { _, value ->
            value
        }.collect {
            println("${start.elapsedNow()}: received $it")
        }
}
//sampleEnd
```
{kotlin-runnable="true"}

複数のFlowからの最新の値を組み合わせるには、[`.combine()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/combine.html) オペレーターを使用します。
これは、いずれかの上流のFlowが値を放出するたびに、各上流のFlowからの最新の値を使用して新しい値を放出します：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

//sampleStart
enum class Theme {
    Dark,
    Light,
}

data class UiState(
    val messages: List<String>,
    val theme: Theme,
)

val messagesFlow = MutableStateFlow(
    listOf(
        "Hello!",
        "Is anyone here?",
    )
)

val themeFlow = MutableStateFlow(
    Theme.Light
)

// 両方の上流Flowからの最新値を合成する
val uiStateFlow = combine(messagesFlow, themeFlow) { messages, theme ->
    UiState(messages, theme)
}

suspend fun main() {
    withContext(Dispatchers.Default) {
        // 最初の更新が発生する前にサブスクライブするためにUNDISPATCHEDを使用
        val uiUpdateJob = launch(start = CoroutineStart.UNDISPATCHED) {
            uiStateFlow.collect {
                // UIを描画
                println(it)
            }
        }
        messagesFlow.update { messages -> messages + "I'll be back!" }
        delay(100.milliseconds)
        
        themeFlow.value = Theme.Dark
        delay(100.milliseconds)
        
        uiUpdateJob.cancel()
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

この例では、`combine()` は `messagesFlow` と `themeFlow` の最新値から `uiStateFlow` を作成します。
いずれかの上流のFlowを更新すると、最新のメッセージとテーマを含む新しい `UiState` が放出されます。

複数のFlowから値を並行して収集し、それらの値を1つの下流のFlowに放出したい場合は、[`.merge()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/merge.html) オペレーターを使用します：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

//sampleStart
interface UiEvent

class ClickEvent: UiEvent

class RightClickEvent: UiEvent

suspend fun main() {
    withContext(Dispatchers.Default) {

        val clickFlow = MutableSharedFlow<ClickEvent>()
        val rightClickFlow = MutableSharedFlow<RightClickEvent>()

        coroutineScope {
            // 最初の更新が発生する前にサブスクライブするためにUNDISPATCHEDを使用
            val collectJob = launch(start = CoroutineStart.UNDISPATCHED) {

                // 両方の上流Flowを並行して収集し、それらの値を下流に放出する
                merge(clickFlow, rightClickFlow).collect {
                    println("Observed an event: $it")
                }
            }
            clickFlow.emit(ClickEvent())
            delay(100.milliseconds)
            
            clickFlow.emit(ClickEvent())
            delay(100.milliseconds)
            
            rightClickFlow.emit(RightClickEvent())
            delay(100.milliseconds)
            
            collectJob.cancel()
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

### ライフサイクルオペレーター

ライフサイクルオペレーターは、Flowの収集中の特定の時点で実行される中断ラムダを受け取ります。
Flowが収集される前、各値が放出される前、収集が完了した後、またはFlowが値を放出せずに完了したときにロジックを配置するために使用できます。

[`.onStart()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-start.html) オペレーターは、上流のFlowが収集される前にそのラムダを実行します。
放出される各値の前に実行する必要があるコードについては、[`.onEach()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-each.html) を使用してください。

> `.onStart()` と同様に、ホット（hot）Flowに対しては [`.onSubscription()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-subscription.html) を使用することで、購読者がFlowの収集を開始した後、かつ放出された値を収集する前にコードを実行できます。
>
{style="note"}

以下は、収集が始まる前と各値が下流に放出される前にメッセージを表示するためにこれらのオペレーターを使用する例です：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

// デフォルトの .onStart() オペレーターを簡略化したカスタム版
fun <T> Flow<T>.myOnStart(
    action: suspend FlowCollector<T>.() -> Unit
): Flow<T> = flow {
    this@flow.action()
    this@myOnStart.collect(this@flow)
}

suspend fun main() {
    withContext(Dispatchers.Default) {
        flowOf("Page 1", "Page 2", "Page 3").onStart {
            println("Processing pages!")
        }.onEach {
            println("Emitted $it")
        }.collect {
            println("Collected $it")
        }
    }
}
```
{kotlin-runnable="true"}

収集が完了した後にコードを実行するには、[`.onCompletion()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-completion.html) オペレーターを使用します。
そのラムダは、上流のFlowが正常に完了したときに下流に値を放出することができます。例：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

// デフォルトの .onCompletion() オペレーターを簡略化したカスタム版
fun <T> Flow<T>.myOnCompletion(
    action: suspend FlowCollector<T>.(cause: Throwable?) -> Unit
): Flow<T> = flow {
    var exception: Throwable? = null
    try {
        this@myOnCompletion.collect(this@flow)
    } catch (e: Throwable) {
        // `action` を実行するが、もし `action` が `emit` を呼び出す場合はそこから `e` をスローする
        FlowCollector<T> { throw e }.action(e)
        throw e
    }
    this@flow.action(null)
}

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default) {
        flowOf("Page 1", "Page 2", "Page 3").onCompletion {
            println("Almost done...")
            // 上流のFlowが完了した後に、追加の値を放出する
            emit("Last Page!")
        }.collect {
            println("Collected $it")
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

上流のFlowが値を放出せずに完了したときにコードを実行するには、[`.onEmpty()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-empty.html) オペレーターを使用します：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

// デフォルトの .onEmpty() オペレーターを簡略化したカスタム版
fun <T> Flow<T>.myOnEmpty(
    action: suspend FlowCollector<T>.() -> Unit
): Flow<T> = flow {
    var emittedSomething = false
    this@myOnEmpty.collect { value ->
        emittedSomething = true
        this@flow.emit(value)
    }
    if (!emittedSomething) {
        action()
    }
}

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default) {
        flowOf("Page 1", "Page 2", "Page 3").onEmpty {
            // 上流のFlowが値を放出するため、何も出力されない
            println("No pages to load!")
        }.collect()
        flowOf<Int>().onEmpty {
            println("No pages to load!")
            // No pages to load!
        }.collect()
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

## 終端オペレーター

終端オペレーターはFlowを収集します。
放出された値を消費したり、収集された値に基づいて結果を返したり、[特定の `CoroutineScope` でFlowを収集](#特定の-coroutinescope-でflowを起動する)したりするために使用できます。

Flowを収集するには、[`collect()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/collect.html) オペレーターを使用します。
`collect()` にラムダを渡すと、放出された各値を受け取ります：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default) {
        flowOf(1, 2, 3).collect {
            println("Collected $it!")
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

ラムダなしで `collect()` を呼び出すこともできます：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default) {
        flowOf(1, 2, 3).onEach {
            println("Collected $it!")
        }.collect()
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

Flowを収集しつつ、新しい値が放出されたときに未完了の作業をキャンセルしたい場合は、[`collectLatest()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/collect-latest.html) オペレーターを使用します：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default) {
        flow {
            println("Emitting Page 1")
            emit("Page 1")
            delay(50.milliseconds)
            println("Emitting Page 2 in quick succession")
            emit("Page 2")
            delay(200.milliseconds)
            println("Emitting Page 3")
            emit("Page 3")
        }.flowOn(Dispatchers.IO).collectLatest {
            println("Starting to process $it!")
            try {
                delay(100.milliseconds)
            } catch (e: CancellationException) {
                println("Canceled processing $it.")
                throw e
            }
            println("Done processing!")
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

一部の終端オペレーターは、Flowを収集し、収集された値に基づいて結果を返します。
例えば、[`.first()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/first.html) オペレーターを使用して、最初に放出された値を返し、その後収集をキャンセルすることができます：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

suspend fun main() { 
    withContext(Dispatchers.Default) {
        val firstValue = flowOf(1, 2, 3).first()

        println(firstValue)
        // 1
    }
}
```
{kotlin-runnable="true"}

[`.toList()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/to-list.html) または [`.toSet()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/to-set.html) オペレーターを使用して、放出された値をコレクションに収集できます：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// デフォルトの .toList() オペレーターを簡略化したカスタム実装
suspend fun <T> Flow<T>.myToList(): List<T> = buildList {
    this@myToList.collect { value ->
        // 放出された各値を結果リストに追加する
        add(value)
    }
}

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default) {
        val list = flowOf(1, 2, 3).toList()
        println(list)
        // [1, 2, 3]

        val set = flowOf(1, 2, 2, 3).toSet()
        println(set)
        // [1, 2, 3]
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

放出された値を単一の結果にまとめるには、[`.reduce()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/reduce.html) または [`.fold()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/fold.html) オペレーターを使用します。
`.fold()` オペレーターは指定した値を初期値として使用し、`.reduce()` オペレーターは代わりに最初に放出された値を初期値として使用します。

例を示します：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default) {
        // 最初に放出された値を初期値として使用する
        val reduced = flowOf(1, 2, 3).reduce { accumulator, value ->
            accumulator + value
        }

        // 指定された初期値から開始する
        val folded = flowOf(1, 2, 3).fold(2) { accumulator, value ->
            accumulator + value
        }

        println(reduced)
        // 6

        println(folded)
        // 8
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

### 特定の `CoroutineScope` でFlowを起動する

画面や他の長寿命オブジェクトがFlowからの値を必要とする場合は、そのオブジェクトの `CoroutineScope` で収集側を開始します。
これにより、オブジェクトが破棄されたときにオブジェクトの `CoroutineScope` をキャンセルすることで、収集も確実にキャンセルされるようになります。

特定の `CoroutineScope` でFlowを収集するには、[`.launchIn()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/launch-in.html) 終端オペレーターを使用します。
このオペレーターは、収集を行うコルーチンの `Job` を返します。

以下は、画面が `StateFlow` から値を収集し、画面が閉じたときに収集コルーチンを停止する例です：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

// デフォルトの .launchIn() オペレーターを簡略化したカスタム版
fun <T> Flow<T>.myLaunchIn(scope: CoroutineScope): Job = scope.launch {
    this@myLaunchIn.collect()
}

//sampleStart
data class Coordinate(val x: Int, val y: Int)

class MyScreen(val scope: CoroutineScope) {
    private val _mousePosition =
        MutableStateFlow<Coordinate>(Coordinate(0, 0))
    val mousePosition get() = _mousePosition.asStateFlow()

    init {
        // 画面のCoroutineScopeでStateFlowの収集を開始する
        mousePosition.onEach {
            updateStatusBar()
        }.launchIn(scope)
    }

    fun moveMouse(newCoordinate: Coordinate) {
        _mousePosition.value = newCoordinate
    }

    private fun updateStatusBar() {
        println("Mouse is at ${_mousePosition.value}")
    }
}

suspend fun main() {
    withContext(Dispatchers.Default) {
        val childScope = CoroutineScope(
            currentCoroutineContext() + Job(currentCoroutineContext()[Job])
        )
        val screen = MyScreen(childScope)
        delay(100.milliseconds)
        
        screen.moveMouse(Coordinate(10, 15))
        delay(100.milliseconds)
        
        screen.moveMouse(Coordinate(1, 3))
        delay(100.milliseconds)
        
        childScope.cancel()
    }
}
//sampleEnd
```
{kotlin-runnable="true"}