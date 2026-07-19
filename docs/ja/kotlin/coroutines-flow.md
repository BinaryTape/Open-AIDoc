<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: フロー)

フロー（Flow）は、非同期に生成可能な値のシーケンシャルなストリームを表します。
1つの値を返すサスペンド関数（Suspending function）とは異なり、フローを使用すると、時間の経過とともに複数の値を順番に処理できます。

フローを使用して、データを段階的にロードしたり、イベントストリームに反応したり、サブスクリプション形式のAPIをモデリングしたりする「フローパイプライン（Flow pipelines）」を作成できます。

フローパイプラインは、以下の役割を含む一連の操作（オペレーション）で構成されます。

*   **エミッター (Emitter)**: 値を生成します。
*   **中間演算子 (Intermediate operators) (任意)**: フローから値を受け取り、それらに演算を適用して、別のフローを返します。
*   **コレクター (Collector)**: フローから値を受け取ります。

これらのパイプラインの役割がどのように連携するかを示す簡単な例を以下に示します。

```kotlin
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun main() {
    // エミッターが値を生成する
    flowOf(0x4B, 0x6F, 0x74, 0x6C, 0x69, 0x6E)
        // 中間演算子が値を受け取り、
        // 演算を適用して、別のフローを返す
        .map { value -> value.toChar() }
        // コレクターが変換された値を受け取る
        .collect { updatedValue ->
            println("Say '$updatedValue'!")
        }
}
//sampleEnd
```
{kotlin-runnable="true"}

フロー内では、値はエミッターからコレクターに向かって、*アップストリーム（上流）*から*ダウンストリーム（下流）*へと移動します。
中間演算子はアップストリームのフローをコレクトし、その値に演算を適用して、新しいダウンストリームのフローを返します。
そのダウンストリームのフローは、次のコレクターにとってのアップストリームのフローになります。

![フローの各部：エミッター、中間演算子（任意）、コレクター。値はアップストリームからダウンストリームへ移動する。](flow-upstream-downstream.svg){width=700}

Kotlinは以下のフロータイプを提供します。

*   [**コールドフロー (Cold flows)**](#cold-flows): コレクトされたときに値の生成を開始します。各コレクターは、フローの新しい独立した実行をトリガーします。
*   [**ホットフロー (Hot flows)**](#hot-flows): コレクターとは無関係に値をエミット（放出）し、すべてのコレクターと同一の値のストリームを共有します。

> Kotlinのフローをテストするには、[Turbineライブラリ](https://github.com/cashapp/turbine)を使用できます。
> これにより、ユニットテストにおいて、完了や失敗のケースを含むフローのエミッションの収集とアサートが簡素化されます。
> 
{style="tip"}

## コールドフロー

[Sequence（シーケンス）](sequences.md)と同様に、コールドフローは遅延（Lazy）評価されます。

コールドフローのビルダーのコードブロックは、コレクターがそれをコレクトするまで実行されません。
新しいコレクターが現れるたびに、フローの新しい実行が開始されます。

### コールドフローの作成

コールドフローを作成するには、[`flow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow.html) ビルダー関数を使用します。
そのブロック内で、[`emit()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow-collector/emit.html) 関数を使用してコレクターに値をエミットします。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
fun main() {
    // フローを作成する
    val pageFlow = flow {
        for (page in 1..3) {
            println("Loading page $page...")

            // ロードされた各ページをエミットする
            emit("Page $page")
        }
    }
    println("Creating a cold flow doesn't run it!")
}
//sampleEnd
```
{kotlin-runnable="true"}

この例では、`flow()` ビルダー関数は [`Flow<T>`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow/) を返しますが、そのブロックの実行は開始されません。
コールドフローはレシピのようなものです。値の生成方法を定義しますが、値を生成し始めるのは、それを[コレクトした](#collect-a-cold-flow)ときだけです。

以下の関数を使用してコールドフローを作成することもできます。

*   [`flowOf()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow-of.html): 指定された値からフローを作成します。
*   [`.asFlow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/as-flow.html): 範囲（Range）などの既存のイテラブルをフローに変換します。

例を以下に示します。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() {
    // 指定された値からフローを作成する
    val predefinedPageFlow = flowOf("Page 1", "Page 2", "Page 3")
    // 範囲からフローを作成する
    val generatedPageFlow = (1..3).asFlow()
}
```

### コールドフローのコレクト

コールドフローをコレクトするには、[`collect()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/collect.html) 関数を使用します。これにより、アップストリームのフローからのエミッションがトリガーされます。
`collect()` にラムダを渡すと、エミットされた各値を受け取ることができます。

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
        // エミットされた各ページを受け取るラムダでフローをコレクトする
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

`collect()` を呼び出すたびに、コールドフロー全体が最初から実行されます。
複数のコレクターが同じコールドフローをコレクトする場合、各コレクターは独自のコレクションをトリガーします。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
suspend fun main() {
    val pageFlow = flow {
        // 現在のコルーチンの名前を読み取る
        val coroutineName = currentCoroutineContext()[CoroutineName]?.name

        println("Starting emissions in $coroutineName")
        for (page in 1..3) {
            println("Loading page $page in $coroutineName")
            emit("Page $page")
        }
        println("Done emitting in $coroutineName")
    }

    withContext(Dispatchers.Default) {
        // 各ページをゆっくり処理するコレクターを起動する
        launch(CoroutineName("a slow coroutine")) {
            pageFlow.collect {
                println("Processing $it slowly")
                delay(100.milliseconds)
                println("Done processing $it slowly")
            }
        }

        // 各ページを素早く処理するコレクターを起動する
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

この例では、[`CoroutineName`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-name/) を使用して各コルーチンに名前を付けています。
`CoroutineName` は[デバッグ](coroutine-context-and-dispatchers.md#naming-coroutines-for-debugging)に使用できます。ここでは、どのコレクターが各コレクションを実行しているかを示すのに役立ちます。

### 中間フロー演算子

中間演算子はアップストリームのフローに演算を適用し、新しいダウンストリームのフローを返します。
これらは「コールド」であるため、返されたフローは、アップストリームのフローがホットであったとしても、コレクトされるまで値の処理を開始しません。

[kotlinx.coroutines](https://github.com/Kotlin/kotlinx.coroutines) ライブラリは、フローの変換や処理のための[幅広い中間フロー演算子](coroutines-flow-operators.md)を提供しています。
組み込みの演算子では提供されていない動作が必要な場合は、独自のカスタム演算子を定義することもできます。

以下は、エミットされた各値に変換を適用する、簡略化されたカスタム [`.map()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map.html) 演算子の例です。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
// デフォルトの .map() 演算子の簡略化されたカスタム実装
fun <T, R> Flow<T>.myMap(transform: suspend (value: T) -> R): Flow<R> = flow {
    // アップストリームのフローから値をコレクトする
    this@myMap.collect { value ->
        // コレクトされた各値を変換して結果をエミットする
        emit(transform(value))
    }
}

suspend fun main() {
    // フローを作成し、カスタム map 演算子を適用して、変換された値をコレクトする
    flowOf(1, 2, 3).myMap { 2 * it }.collect {
        println("Collecting $it")
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

#### フロービルダー内でのサスペンド関数の呼び出し

シーケンスとは異なり、`flow()` ビルダー関数内ではサスペンド関数を呼び出すことができます。

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

ただし、`flow()` ビルダー関数は、実行されているのと同じコルーチンコンテキストから値をエミットしなければなりません。
そのブロック内で `emit()` を呼び出す別のコルーチンを開始することはできず、`withContext()` でコルーチンコンテキストを変更することもできません。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun main() {
    // これは例外で失敗します！
    flow {
        // withContext() でコルーチンコンテキストを変更しようとしている
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

この制限は `flow()` ビルダー関数に適用されます。

アップストリームのフローを別のコルーチンコンテキストで実行する必要がある場合は、[`.flowOn()` 演算子を使用して変更](#change-the-coroutine-context-of-a-cold-flow-with-flowon)できます。

あるいは、[`channelFlow()`](#emit-values-concurrently-with-channelflow) を使用して、複数のコルーチンから値をエミットすることもできます。

#### `.flowOn()` によるコールドフローのコルーチンコンテキストの変更

デフォルトでは、コールドフローはコレクターと同じコルーチンコンテキストで実行されます。

フローを別のコルーチンコンテキストで実行したい場合は、[`.flowOn()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow-on.html) 演算子を使用します。
この演算子は *コンテキストを保持（Context-preserving）* します。
ダウンストリームのフローを呼び出し元のコンテキストに維持したまま、アップストリームのフローのコルーチンコンテキストのみを変更します。

以下は、あるコルーチンコンテキストで値をエミットし、別のコンテキストでそれらをコレクトするコールドフローの例です。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default + CoroutineName("downstream")) {
        flow {
            val coroutineName = currentCoroutineContext()[CoroutineName]?.name

            // .flowOn() で適用されたコルーチンコンテキストでエミットする
            println("Emitting '1' in $coroutineName")
            // Emitting '1' in upstream
            emit(1)

        // アップストリームフローのコルーチンコンテキストを変更する
        }.flowOn(Dispatchers.IO + CoroutineName("upstream"))
            .collect {
            val coroutineName = currentCoroutineContext()[CoroutineName]?.name

            // 呼び出し元のコルーチンコンテキストでコレクトする
            println("Collecting '$it' in $coroutineName")
            // Collecting '1' in downstream
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

### フローにおける例外処理

エミッターとコレクターの両方が例外をスローする可能性があります。

フローのコレクション中に例外を処理しない場合、その例外はコレクターからアップストリームへと伝播し、`collect()` 関数の呼び出し元にスローされます。

このような例外は、`collect()` 関数を `try-catch` ブロックで囲むことで処理できます。例えば：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

class MyFlowException(message: String) : Exception(message)

//sampleStart
suspend fun main() {
    val myFlow = flow {
        try {
            // emit() 関数は collect() に渡されたラムダを呼び出す
            emit('a')
        } catch (e: MyFlowException) {
            println("Collector threw $e")

            // ダウンストリームの例外を再スローする
            throw e
        }
    }
    // フローのコレクションを try-catch で囲む
    try {
        myFlow.collect {
            // collect() ラムダから例外をスローする
            throw MyFlowException("Can't process '$it'!")
        }
    } catch (e: MyFlowException) {
        println("Flow collection failed with $e")
        // 呼び出し元に例外を再スローする
        throw e
    }
}
//sampleEnd
```
{kotlin-runnable="true" validate="false"}

この例では、コレクターが `emit()` 関数から値を受け取ったときに例外をスローします。
`flow()` ビルダー関数はこのダウンストリームの例外をキャッチします。

フロービルダー関数内でコレクターによってスローされた例外をキャッチした場合は、それを再スローしてください。
これにより、例外の透過性（Exception transparency）が維持され、`collect()` の呼び出し元が例外を処理できるようになります。

#### アップストリームの例外を処理するための `.catch()` 演算子の使用

例外がコレクターに到達する前に処理するには、[`.catch()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/catch.html) 演算子を使用します。

`.catch()` 演算子を使用してアップストリームフローからの例外を処理できます。例えば、`emit()` 関数を使用してダウンストリームにフォールバック値をエミットすることができます。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun main() {
    flow {
        emit("a")
        emit("b")

        // アップストリームのフローから例外をスローする
        throw UnsupportedOperationException(
            "I am tired of listing letters"
        )
    }.catch { upstreamException ->
        println("Upstream completed with $upstreamException!")

        // ダウンストリームにフォールバック値をエミットする
        emit("Upstream terminated with an exception!")
    }.collect {
        println("Got '$it'")
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

この例では、アップストリームのフローが例外をスローする前に値をエミットします。
`.catch()` 演算子が例外を処理し、フォールバック値として `"Upstream terminated with an exception!"` をエミットします。

通常の動作中にフローが何らかの例外をスローすることが予想される場合は、回復可能な例外を `.catch()` で処理し、予期しない例外は再スローしてください。

以下は、フローがデータをロードし、その進行状況を報告する例です。

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
        // 予想される例外を処理する
        emit(LoadingState.Failed)
    } else {
        // 予期しない例外を再スローし、collect() がそれらで失敗するようにする
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

この例では、ロードが予想される例外で失敗した場合、`.catch()` 演算子は `emit()` 関数を使用してフォールバック状態をエミットします。
予期しない例外については、`.catch()` 演算子内で再スローします。
これにより、`collect()` 関数の呼び出し元は、フローが処理しない例外を受け取ることができます。

`.catch()` 演算子は、コレクターによってスローされた例外を処理しません。
`collect()` に渡されたラムダが例外をスローする場合は、`collect()` 関数の周囲を `try-catch` ブロックで処理してください。

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

                // ダウンストリームの例外を再スローする
                throw e
            }
        }
    }.catch { e ->
        // 例外がダウンストリームで発生するため、これは実行されない
        println("Upstream threw an exception: $e")
    }

    try {
        myFlow.collect {
            require(!it.isDigit()) { "Digits are not allowed!" }
        }
    } catch (e: IllegalArgumentException) {
        // collect() ラムダからの例外を処理する
        println("Flow collection failed with $e")
    }
}
```
{kotlin-runnable="true"}

`collect()` ラムダは `.catch()` の後に実行されるため、`.catch()` を使用してそこからスローされる例外を処理することはできません。
エミットされる各値に対して実行されるコードからの例外を `.catch()` で処理するには、そのコードを `.catch()` の前の [.onEach()](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-each.html) に配置します。

`.onEach()` 演算子は、各値がダウンストリームにエミットされる前にそのラムダを実行します。
`.catch()` が `.onEach()` からの例外を処理した場合、フローは完了し、次の値はエミットされません。

例を以下に示します。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds

suspend fun main() {
    flowOf('a', 'o', '5', 'c')
        // 各値がダウンストリームにエミットされる前に実行される
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

この例では、`.onEach()` 演算子は `.catch()` よりもアップストリームで実行されるため、`require()` チェックが `'5'` で失敗したときに `.catch()` 演算子が例外を処理します。

#### 例外後のアップストリームフローの再開

ネットワーク接続が切断されたリクエストなど、一部の操作は一時的に失敗することがあります。
このような場合、[`.retry()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/retry.html) 演算子を使用して、例外の後にアップストリームのフローを再開できます。

`.retry()` 演算子は例外を受け取り、そのラムダが `true` を返したときに、指定された試行回数までコレクションを再開します。
例えば、`.retry(3)` は、最初の試行が失敗した後に最大3回アップストリームフローを再試行します。

ラムダが `false` を返すと、`.retry()` は再試行を停止し、例外を再スローします。

> 再試行ロジックをより細かく制御するには、[`.retryWhen()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/retry-when.html) 演算子を使用します。
> `.retry()` と同様に例外を受け取りますが、現在の試行回数も受け取り、再試行する前に値をエミットすることもできます。
>
{style="note"}

以下は、`IOException` の後にロードを最大3回再試行する例です。

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
        // これは予想されるエラー
        // 再試行する前に1秒待機する
        delay(1.seconds)
        true
    } else {
        // 再試行を停止し、予期しない例外を再スローする
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

### フローのキャンセル

フローのキャンセルは、リクエストがタイムアウトした場合など、結果が不要になったときにコレクションを停止します。

フローのコレクションは、`collect()` 関数を呼び出すコルーチンに関連付けられています。
そのコルーチンがキャンセルされるとコレクションが停止し、アップストリームのフローもキャンセルされます。

フローのコレクションをキャンセルするには、コレクトしているコルーチンの `Job` に対して `cancel()` 関数を呼び出します。

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

        // フローをコレクトしているコルーチンをキャンセルする
        job.cancel()
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

コレクターは、コレクトしているコルーチンをアクティブに保ったまま、アップストリームのフローをキャンセルすることもできます。
これを行うには、コレクターから `CancellationException` をスローします。

[`.take()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/take.html) 演算子はこの動作を利用して、固定数の値の後にコレクションを停止します。
例えば、`.take(3)` はアップストリームのフローから最初の3つの値だけをコレクトし、その後キャンセルします。

以下は、簡略化されたバージョンの `.take()` 演算子を使用する例です。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
// デフォルトの .take() 演算子の簡略化されたバージョンを定義する
fun <T> Flow<T>.myTake(count: Int): Flow<T> = flow {
    require(count > 0)
    val cancellationException = CancellationException()
    var elementsRemaining = count
    try {
        this@myTake.collect {
            emit(it)
            --elementsRemaining
            if (elementsRemaining == 0) {
                // 要求された数の値の後にアップストリームのフローをキャンセルする
                throw cancellationException
            }
        }
    } catch (e: Throwable) {
        if (e === cancellationException) {
            // アップストリームのフローのキャンセルに使用された CancellationException を処理する
            // .myTake() で設定された数値の後にフローを完了させる
        } else {
            // 予期しない例外を再スローする
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

この例では、`.myTake()` 関数は要求されたすべての値がエミットされるまで、アップストリームのフローから値をエミットします。
その後、アップストリームのフローをキャンセルするために `CancellationException` をスローします。

### `channelFlow()` による並列な値のエミット

`flow()` ビルダー関数は、単一のコルーチンから値をエミットするフローに対してシンプルで効率的です。
複数のコルーチンから同じフローに並列に値をエミットしたい場合は、[`channelFlow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/channel-flow.html) ビルダー関数を使用します。
これは、複数のソースからデータをロードするなど、結果を段階的に報告する並列作業に使用できます。

`channelFlow()` ビルダー関数は、[チャネル（Channel）](channels.md)を使用して複数のコルーチンから値を送信するコールドフローを作成します。
ビルダー内では、値を生成するために `emit()` 関数の代わりに [`send()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-send-channel/send.html) 関数を使用します。

以下は、`channelFlow()` を使用して2つのフローを並列にコレクトし、簡略化されたバージョンの [`.merge()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/merge.html) 演算子でそれらの値を再エミットする例です。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
// デフォルトの .merge() 演算子の簡略化されたバージョンを定義する
fun <T> Flow<T>.myMerge(other: Flow<T>): Flow<T> = channelFlow {
    // CoroutineScope と SendChannel がここでレシーバーとして利用可能
    // レシーバーフローをコレクトするコルーチンを起動する
    launch {
        // レシーバーフローをコレクトする
        this@myMerge.collect {
            send(it)
        }
    }
    launch {
        // もう一方のフローをコレクトするコルーチンを起動する
        other.collect {
            // SendChannel.send を呼び出す
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

`channelFlow()` ビルダー関数はバッファ付きチャネルを使用するため、バッファがいっぱいになるまでプロデューサーはコレクターに先んじて値を送信できます。
デフォルトでは、バッファは最大64個の値を保持できます。
バッファがいっぱいになると、バッファに空きスペースができるまでプロデューサーはサスペンド（中断）します。

[`.buffer()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/buffer.html) 演算子を使用してバッファ容量を変更できます。
例えば、`.buffer(12)` はプロデューサーがコレクターより最大12個多く値を送信できるようにし、`.buffer(0)` はバッファを削除するため、各値はコレクターが受け取れる状態になって初めて送信されます。

例を以下に示します。

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

    // デフォルトのバッファ容量を使用する
    oneHundredNumbers.collect {
        println("Processing $it")
        delay(10.milliseconds)
    }
  
    // バッファを削除し、送信と処理が最初から交互に行われるようにする
    oneHundredNumbers.buffer(0).collect {
        println("Processing $it")
        delay(10.milliseconds)
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

この例では、`oneHundredNumbers` フローはデフォルトのバッファ容量を使用し、`oneHundredNumbers.buffer(0)` フローはバッファを持ちません。

デフォルトのバッファ容量では、プロデューサーはバッファがいっぱいになるまで素早く値を送信します。
その後、`send()` はバッファに空きができるまでサスペンドするため、`Sending`（送信）メッセージと `Processing`（処理）メッセージが交互に現れ始めます。

`.buffer(0)` では、各 `send()` 呼び出しはコレクターが値を受け取れるまで待機するため、`Sending` と `Processing` は最初から交互に行われます。

## ホットフロー

ホットフローは、コレクターとは無関係に値をエミットする共有ストリームです。
アクティブなコレクターがない場合でも値をエミットし続け、複数のコレクターが新しい実行を開始するのではなく、すでにアクティブなストリームから同じエミッションをコレクトできます。

ホットフローのコレクターは *サブスクライバー（Subscriber）* と呼ばれます。

チャットメッセージ、ユーザーのアクション、UIの状態の変化など、アプリケーションの複数の部分が同じ更新ストリームに反応する必要がある場合にホットフローを使用できます。

Kotlinは2つのホットフロータイプを提供しています。

* [`SharedFlow`](#create-a-sharedflow): 複数のサブスクライバーに値をブロードキャストします。メッセージや通知など、時間の経過とともに発生するイベントをブロードキャストする必要がある場合に使用します。
* [`StateFlow`](#create-a-stateflow): 最新の状態値を常に保持する特別な `SharedFlow` です。UI状態など、時間の経過とともに変化する状態を表す必要がある場合に使用します。

### `SharedFlow` の作成

[`SharedFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/) は、時間の経過とともに発生するエミットされた値をサブスクライバーにブロードキャストするホットフローです。

[`MutableSharedFlow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-mutable-shared-flow.html) 関数を使用して `SharedFlow` を作成できます。

`MutableSharedFlow` は、値をエミットするための関数を公開しています。これを直接公開すると、クラス外のコードがフローに値をエミットできるようになります。

これを防ぐには、ミュータブルなフローをプライベートな[バッキングプロパティ（Backing property）](properties.md#backing-properties)に保存し、[`.asSharedFlow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/as-shared-flow.html) 関数を使用して読み取り専用の `SharedFlow` を公開します。
サブスクライバーに値をエミットするには、`MutableSharedFlow` に対して `emit()` 関数を使用します。

```kotlin
data class Message(
    val senderId: Int,
    val time: Instant,
    val text: String,
)

class Chatroom {
    // SharedFlow をプライベートなバッキングプロパティに保存する
    private val _messages = MutableSharedFlow<Message>()

    // 読み取り専用の SharedFlow をサブスクライバーに公開する
    val messages: SharedFlow<Message>
        get() = _messages.asSharedFlow()

    suspend fun sendMessageToEveryone(message: Message) {
        // サブスクライバーにメッセージをエミットする
        _messages.emit(message)
    }
}
```

コールドフローと同様に、`collect()` 関数を使用して `SharedFlow` から値をコレクトできます。

また、すでにエミットされた値を新しいサブスクライバーに即座に「リプレイ（再送）」するように `SharedFlow` を構成することもできます。
リプレイキャッシュは小さな履歴バッファのように機能し、固定数の過去のエミッションを保存します。

新しいサブスクライバーが受け取る過去のエミッションの数を設定するには、`MutableSharedFlow()` の `replay` パラメータを使用します。

```kotlin
// サブスクライブ時に新しいサブスクライバーが受け取る、エミット済みのメッセージ数を設定する
const val MESSAGES_TO_REMEMBER = 10

class Chatroom {
    private val _messages = MutableSharedFlow<Message>(

        // 設定された量の最後にエミットされたメッセージを新しいサブスクライバーにリプレイする
        replay = MESSAGES_TO_REMEMBER
    )

    val messages: SharedFlow<Message>
        get() = _messages.asSharedFlow()

    suspend fun sendMessageToEveryone(message: Message) {
        // messages フローのサブスクライバーにメッセージをエミットする 
        _messages.emit(message)
    }
}
```

ホットフローのコレクションはそれ自体では完了しないため、不要になったときに[コレクトしているコルーチンをキャンセル](#cancel-hot-flows)する必要があります。

> ホットフローには、クローズ（Close）やキャンセル（Cancel）の操作はありません。
> コレクションをキャンセルすると、対応するサブスクライバーによるコレクトが停止するだけです。
> 新しいエミッションを停止するには、ホットフローの値を生成しているコルーチンまたはスコープをキャンセルしてください。
>
{style="note"}

`SharedFlow` を使用してチャットルームをモデリングする例を見てみましょう。この例では、アクティブなサブスクライバーに新しい各メッセージを送信し、後から参加したサブスクライバーに最近のメッセージをリプレイします。

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

// サブスクライブ時に新しいサブスクライバーが受け取る、エミット済みのメッセージ数を設定する
const val MESSAGES_TO_REMEMBER = 10

class Chatroom {
    // SharedFlow をプライベートなバッキングプロパティに保存する
    private val _messages = MutableSharedFlow<Message>(

        // 設定された量の最後にエミットされたメッセージを新しいサブスクライバーにリプレイする
        replay = MESSAGES_TO_REMEMBER
    )

    // 読み取り専用 of SharedFlow をサブスクライバーに公開する
    val messages: SharedFlow<Message>
        get() = _messages.asSharedFlow()

    // サブスクライバーにメッセージをエミットする
    suspend fun sendMessageToEveryone(message: Message) {
        _messages.emit(message)
    }
}

suspend fun main() {
    val nUsers = 3
    val chatroom = Chatroom()
    withContext(Dispatchers.Default) {
        // 各ユーザーのメッセージリーダーを開始する
        val messageReaders = List(nUsers) { userId ->
            // メッセージがエミットされる前にコレクションを開始する
            launch(start = CoroutineStart.UNDISPATCHED) {
                chatroom.messages.collect { message ->
                    println("User $userId received $message")
                }
            }
        }
        // 各ユーザーから挨拶を送信する
        repeat(nUsers) { userId ->
            chatroom.sendMessageToEveryone(
                Message(
                    userId,
                    Clock.System.now(),
                    "Hello from $userId!"
                )
            )
        }
        // チャットのための十分な時間を確保するために遅延させる
        delay(100.milliseconds)
        // SharedFlow のコレクションはそれ自体で終了しないため、リーダーをキャンセルする
        messageReaders.forEach { it.cancel() }
    }

}
```
{kotlin-runnable="true"}

この例では、[`CoroutineStart.UNDISPATCHED`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-start/-u-n-d-i-s-p-a-t-c-h-e-d/) を使用して各コレクション用コルーチンを即座に開始しています。

これにより、各コルーチンが `collect()` に到達し、`messages` をサブスクライブし、`sendMessageToEveryone()` がメッセージをエミットする前にサスペンドされることが保証されます。これがないと、リプレイキャッシュが小さすぎる場合、コレクション用コルーチンの開始が遅れて初期のエミッションを逃す可能性があります。

#### ホットフローを公開するための明示的なバッキングフィールドの使用
<primary-label ref="experimental-opt-in"/>

[明示的なバッキングフィールド (Explicit backing fields)](whatsnew23.md#explicit-backing-fields) を使用して、クラス内にミュータブルなバッキングフィールドを維持しながら、読み取り専用の `SharedFlow` を公開することができます。

明示的なバッキングフィールドは、`field` 宣言で実装タイプを定義します。
クラス内では、コンパイラがプロパティをバッキングフィールドのタイプにスマートキャストするため、個別のプライベートバッキングプロパティなしで `emit()` 関数を呼び出すことができます。

> 明示的なバッキングフィールドは、`.asSharedFlow()` が提供するような読み取り専用のラッパーを作成しません。
> 公開されたフローがダウンキャストされることが懸念されない場合にのみ、このパターンを使用してください。
> 
{style="warning"}

例を以下に示します。

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
    // ミュータブルなバッキングフィールドを持つ読み取り専用の SharedFlow を公開する
    val messages: SharedFlow<Message>
        field = MutableSharedFlow<Message>(
            replay = MESSAGES_TO_REMEMBER
        )

    suspend fun sendMessageToEveryone(message: Message) {
        // Chatroom 内のミュータブルなバッキングフィールドを通じてエミットする
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

### `StateFlow` の作成

[`StateFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-state-flow/) は、単一の状態値を保持し、その値が新しいものに置き換わったときに更新をエミットするホットフローです。
新しいサブスクライバーはコレクトを開始するとすぐに現在の値を受け取り、その後は状態が更新されるたびに新しい値を受け取ります。

`StateFlow` を使用して、ロードの進行状況、UIの状態、オブジェクトの状態など、時間の経過とともに変化する状態を表すことができます。

`StateFlow` を作成するには、初期値を指定して [`MutableStateFlow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-mutable-state-flow.html) 関数を使用します。

```kotlin
// 初期値として LoadingState.Started を持つ MutableStateFlow を作成する
val result = MutableStateFlow<LoadingState>(LoadingState.Started)
```

現在の状態を設定するには、[`value`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-mutable-state-flow/value.html) プロパティを使用します。

```kotlin
fun loadBlob(url: String): StateFlow<LoadingState> {
    val result = MutableStateFlow<LoadingState>(LoadingState.Started)

    DownloadManager.startLoading(
        url,
        onPercentageLoaded = { percentage ->
            // 現在の状態を最新の進捗状況で置き換える
            result.value = LoadingState.Percentage(percentage)
        },
        onCompletion = {
            // 現在の状態を完了状態に置き換える
            result.value = LoadingState.Done
        },
        onFailure = {
            // 現在の状態を失敗状態に置き換える
            result.value = LoadingState.Failed
        }
    )
}
```

> `value` の設定はスレッドセーフであり、現在の状態を置き換えますが、以前の値に基づいて `value` を更新することはアトミックではありません。
> 新しい状態が前の状態に依存する場合は、代わりに `.update()` を使用してください。
>
{style="note"}

`MutableSharedFlow` と同様に、`MutableStateFlow` も更新をエミットするためのAPIを公開しています。これを直接公開すると、それを受け取ったコードは `MutableStateFlow` にダウンキャストすることで状態を更新できてしまいます。

これを防ぐには、[`.asStateFlow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/as-state-flow.html) 関数を使用して、ミュータブルなフローを読み取り専用の `StateFlow` として公開します。

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

    // ロード状態を読み取り専用の StateFlow として公開する
    return result.asStateFlow()
}
```

以下は、コールバックベースのAPIからロードの進捗を報告するために `StateFlow` を使用する例です。

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
    // 初期ロード状態を持つ MutableStateFlow を作成する
    val result = MutableStateFlow<LoadingState>(LoadingState.Started)
    DownloadManager.startLoading(
        url,
        onPercentageLoaded = { percentage ->
            // 現在の状態を最新の進捗状況で置き換える
            result.value = LoadingState.Percentage(percentage)
        },
        onCompletion = {
            // 現在の状態を完了状態に置き換える
            result.value = LoadingState.Done
        },
        onFailure = {
            // 現在の状態を失敗状態に置き換える
            result.value = LoadingState.Failed
        }
    )
    // ロード状態を読み取り専用の StateFlow として公開する
    return result.asStateFlow()
}

// データを非同期にダウンロードするコールバックベースの API を定義する
object DownloadManager {
    // url のロードを非同期に開始する
    fun startLoading(
        url: String,
        onPercentageLoaded: (Int) -> Unit,
        onCompletion: () -> Unit,
        onFailure: (Throwable) -> Unit
    ) {
        // この例を自己完結させるために、説明目的でのみ GlobalScope を使用しています
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
                // 進捗更新を待機
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

> この例では、コールバックベースのAPIを短く保つためだけに [`GlobalScope`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-global-scope/) を使用しています。
> 実際のアプリケーションでは、この例の `startLoading()` のような作業を開始する関数に `CoroutineScope` を渡し、そのスコープ内でコルーチンを起動して、呼び出し元が不要になったときに作業をキャンセルできるようにしてください。
>
{style="note"}

`StateFlow` はホットフローであるため、コレクションは自動的に完了しません。
この例では、`.takeWhile()` 演算子を使用して、ロードが終端状態に達したときにコレクションを停止しています。

`StateFlow` は、新しい値が現在の値と異なる場合にのみ更新をエミットします。

> `StateFlow` にミュータブル（可変）なオブジェクトを保存することは避けてください。
> オブジェクト自体を変更しても現在の値は置き換えられないため、サブスクライバーは更新を受け取りません。
> 
{style="warning"}

現在の状態から新しい状態を計算することで `StateFlow` を更新することもできます。
これらの更新には [`.update()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/update.html) 関数を使用します。
`.update()` 関数は値をアトミックに更新するため、複数のコルーチンが同じ `MutableStateFlow` を更新する場合に役立ちます。

> 共有された値を更新するだけでよく、時間の経過に伴う状態の変化を観察する必要がない場合は、[`AtomicInt`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/-atomic-int/) や [`AtomicReference`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/-atomic-reference/) などの Kotlin Atomics API を使用してください。
>
{style="note"}

以下は、「いいね」の数が `StateFlow` に保存され、新しい各状態が前の状態から計算される例です。

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
    // 現在の「いいね」の数を StateFlow として保存する
    private val _numberOfLikes = MutableStateFlow<Int>(
        // 初期「いいね」数を設定
        0
    )

    // 現在の「いいね」数を持つ読み取り専用の StateFlow を公開する
    val numberOfLikes: StateFlow<Int>
        get() = _numberOfLikes.asStateFlow()

    // 「いいね」を追加する
    fun like() {
        // 並列およびマルチスレッドの呼び出しに対して、アトミックに「いいね」の数を増やす
        _numberOfLikes.update { it + 1 }
    }
}

suspend fun drawUpdatedNumberOfLikes(likes: Int) {
    // 最新の「いいね」の数を表示する
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
        // 投稿を「いいね」するユーザーをシミュレートする
        coroutineScope {
            repeat(10) {
                launch {
                    delay(Random.nextInt(100).milliseconds)
                    post.like()
                }
            }
        }
        // すべてのシミュレートされたユーザーが終了した後にコレクションをキャンセルする
        notifyingJob.cancelAndJoin()
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

この例では、`.update()` 関数がアトミックに「いいね」の数を増やします。
これにより、複数のコルーチンが同時に `like()` 関数を呼び出したときの更新漏れを防ぎます。

#### 蓄積された状態を `StateFlow` に保存する

最新のエミットされた値だけでなく、過去のすべてのエミッションの結果をサブスクライバーに受け取ってほしい場合があります。

例えば、チャットルームはメッセージ履歴を単一の状態値として保持できます。
新しいユーザーがチャットルームに参加すると、まず現在のメッセージ履歴を受け取ります。
その後、新しいメッセージが到着したときに更新を受け取り続けます。

この動作は `StateFlow` でモデリングできます。

これを行うには、`SharedFlow<Message>` で各チャットメッセージを個別のイベントとしてブロードキャストする代わりに、`StateFlow<List<Message>>` でメッセージ履歴全体を現在の値として保存します。

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
    // 完全なメッセージ履歴を保存する
    private val _messageHistory = MutableStateFlow<List<Message>>(emptyList())

    // 現在のメッセージ履歴を持つ読み取り専用の StateFlow を公開する
    val messageHistory: StateFlow<List<Message>>
        get() = _messageHistory.asStateFlow()

    // messageHistory フローのすべてのサブスクライバーにメッセージを送信する
    suspend fun sendMessageToEveryone(message: Message) {
        // 新しいメッセージを現在の履歴にアトミックに追加する
        _messageHistory.update {
            it + message
        }
    }
}

suspend fun main() {
    val nUsers = 3
    val chatroom = Chatroom()
    withContext(Dispatchers.Default) {
        // 各ユーザーのメッセージリーダーを開始する
        val messageReaders = List(nUsers) { userId ->
            launch(start = CoroutineStart.UNDISPATCHED) {
                chatroom.messageHistory.collect { currentHistory ->
                    println("User $userId sees the history as $currentHistory")
                }
            }
        }
        // 各ユーザーから挨拶を送信する
        repeat(nUsers) { userId ->
            chatroom.sendMessageToEveryone(
                Message(
                    userId,
                    Clock.System.now(),
                    "Hello from $userId!"
                )
            )
        }
        // ユーザーが更新を受け取るのに十分な時間を確保するために遅延させる
        delay(100.milliseconds)
        // StateFlow のコレクションはそれ自体で終了しないため、リーダーをキャンセルする
        messageReaders.forEach { it.cancel() }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

この例では、`messageHistory` は過去のメッセージの完全なリストを現在の状態として保存します。
新しいメッセージが送信されると、`.update()` 関数が以前の履歴から新しいリストを作成し、新しいメッセージをアトミックに追加します。

> イミュータブル（不変）なコレクションを、新しいコレクションを作成することで更新する場合、コレクションが大きくなるにつれて時間がかかるようになります。
> [実験的](components-stability.md#stability-levels-explained) な [`kotlinx.collections.immutable`](https://github.com/Kotlin/kotlinx.collections.immutable) ライブラリを使用して永続的なコレクションを作成し、イミュータブルなコレクションの更新をより効率的に行うことができます。
>
{style="tip"}

`messageHistory` は `StateFlow` であるため、サブスクライバーはコレクトを開始したときに現在のメッセージ履歴を受け取ります。
その後、メッセージが送信されるたびにチャット履歴が変更され、新しいリストを受け取ります。

### コールドフローをホットフローに変換する

コールドフローは、コレクターごとに個別にアップストリームの操作を実行します。
複数のサブスクライバーが同じアップストリームのコレクションからのエミッションを必要とする場合、コールドフローをホットフローに変換して、そのコレクションをサブスクライバー間で共有できます。

以下の `.shareIn()` の簡略化されたバージョンは、コールドフローを一度だけコレクトし、その値を `MutableSharedFlow` にエミットして、読み取り専用の `SharedFlow` として公開することで、このアイデアを示しています。

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

この例では、`simpleShareIn()` は指定されたスコープ内で新しいコルーチンを開始します。
アップストリームのフローからのコレクトを停止するには、コレクト用コルーチンを実行している[スコープをキャンセル](#cancel-hot-flows)します。

アップストリームのフローが例外をスローすると、このコレクション用コルーチンは失敗します。
コレクト用コルーチンが失敗する前に[アップストリームの例外を処理](#handle-exceptions-in-hot-flows)するには、フローを共有する前に `.catch()` や `.retry()` などの演算子を使用してください。

組み込みの [`.shareIn()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/share-in.html) 関数は、自分で `MutableSharedFlow` を作成することなく、このパターンを提供します。
また、アップストリームのコレクションがいつ開始および停止するか、新しいサブスクライバーが過去のエミッションをいくつ受け取るかを制御するオプションも追加されています。

組み込みの `.shareIn()` 関数を使用するには、以下の引数を指定します。

* アップストリームのフローがコレクトされるコルーチンスコープ。
* アップストリームのコレクションがいつ開始および停止するかを制御する [`SharingStarted`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-sharing-started/) 戦略。
   例えば、[`SharingStarted.Eagerly`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-sharing-started/-companion/-eagerly.html) は、サブスクライバーが現れる前に、提供されたスコープで即座にアップストリームのコレクションを開始します。
* 新しいサブスクライバーが受け取る過去のエミッションの数を制御する、オプションの `replay` 値。

`.shareIn()` 関数は提供されたコルーチンスコープでアップストリームのフローをコレクトし、そのエミッションをサブスクライバーにブロードキャストします。

以下は、`.shareIn()` がコールドフローをホットフローに変換し、シリアライズされたチャットメッセージを複数のサブスクライバー間で共有する例です。

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
    // メッセージフローを保存する
    private val _messages = MutableSharedFlow<Message>()

    // エミットされたメッセージを持つ読み取り専用の SharedFlow を公開する
    // 新しいサブスクライバーはエミット済みのメッセージを受け取らない
    val messages: SharedFlow<Message>
        get() = _messages.asSharedFlow()
  
    // messageHistory フローのすべてのサブスクライバーにメッセージを送信する
    suspend fun sendMessageToEveryone(message: Message) {
        _messages.emit(message)
    }
}

suspend fun main() {
    val nUsers = 3
    val chatroom = Chatroom()
    withContext(Dispatchers.Default) {
        // 現在実行中のコルーチンの子スコープを作成する
        val derivedFlowsScope = CoroutineScope(
            currentCoroutineContext() + Job(currentCoroutineContext()[Job])
        )
        // サブスクライバー間でシリアライズされたメッセージを共有する
        val serializedMessages: SharedFlow<String> =
            chatroom
                .messages
                .map {
                    // 共有フローのために、各メッセージを一度だけシリアライズする
                    "senderId: ${it.senderId}, time: ${it.time}, text: " +
                        Base64.Default.encode(it.text.encodeToByteArray())
                }
                .shareIn(
                    // このスコープで共有用コルーチンを開始する
                    // .map() を含むアップストリームフローはそのコルーチンで実行される
                    derivedFlowsScope,

                    // 最初のサブスクライバーが現れる前に、即座にアップストリームフローのコレクトを開始する
                    SharingStarted.Eagerly,

                    // 過去のシリアライズされたメッセージを新しいサブスクライバーにリプレイしない
                    replay = 0,
                )

        // 各ユーザーのメッセージリーダーを開始する
        val messageReaders = List(nUsers) { userId ->
            launch(start = CoroutineStart.UNDISPATCHED) {
                serializedMessages.collect { serializedMessage ->
                    println("User $userId observes the message $serializedMessage")
                }
            }
        }
        // 各ユーザーから挨拶を送信する
        repeat(nUsers) { userId ->
            chatroom.sendMessageToEveryone(
                Message(
                    userId,
                    Clock.System.now(),
                    "Hello from $userId!"
                )
            )
        }
        // ユーザーが更新を受け取るのに十分な時間を確保するために遅延させる
        delay(100.milliseconds)
        // SharedFlow のコレクションはそれ自体で終了しないため、リーダーをキャンセルする
        messageReaders.forEach { it.cancel() }
        // 派生したホットフローを実行しているスコープをキャンセルする
        derivedFlowsScope.cancel()
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

この例では、[`.map()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map.html) 演算子が各メッセージをシリアライズするコールドフローを作成します。
`.shareIn()` 関数がない場合、各コレクターはそのシリアライズを個別に実行します。
`.shareIn()` 関数は1つのアップストリームコレクションを共有するため、各メッセージは一度だけシリアライズされ、その後すべてのサブスクライバーと共有されます。

`SharingStarted.Eagerly` はアップストリームのコレクションを即座に開始するため、派生したホットフローは `.shareIn()` が呼び出されるとすぐに `chatroom.messages` のコレクトを開始します。

同様に、コールドフローを `StateFlow` に変換するには、[`.stateIn()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/state-in.html) 関数を使用します。

`.shareIn()` とは異なり、`StateFlow` は常に現在の値を持っている必要があるため、`.stateIn()` は初期値を必要とします。

例えば：

```kotlin
val lastUpdateFlow: StateFlow<Instant?> =
    chatroom
        .messageHistory
        .map { currentHistory -> currentHistory.lastOrNull()?.time }
        .stateIn(
            // このスコープで共有用コルーチンを開始する
            // .map() を含むアップストリームフローはそのコルーチンで実行される
            derivedFlowsScope,

            // 最初のサブスクライバーが現れたときにコレクトを開始し、
            // 最後のサブスクライバーがいなくなったときに停止する
            SharingStarted.WhileSubscribed(),
            // 最初のアップストリームエミッションの前の初期状態を設定する
            null,
        )
```

### ホットフローのキャンセル

ホットフローは、サブスクライバーがキャンセルされても停止しません。

ホットフローをコレクトしているコルーチンをキャンセルしても、そのサブスクライバーがキャンセルされるだけです。
ホットフローは他のサブスクライバーに値をエミットし続けることができ、それらの値を生成しているコルーチンも実行し続けることができます。

ホットフロー自体にはキャンセルの操作はありません。
ホットフローをキャンセルするには、その値を生成しているコルーチンまたはスコープをキャンセルしてください。

`.shareIn()` または `.stateIn()` 拡張関数で作成されたホットフローは、共有用コルーチンがキャンセルされるまでアップストリームのフローをコレクトし続けます。
アップストリームのフローからのコレクトを停止するには、共有用コルーチンを実行しているスコープをキャンセルしてください。

> [`SharingStarted.WhileSubscribed()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-sharing-started/-companion/-while-subscribed.html) を使用すると、サブスクライバーがいないときにアップストリームのコレクションを自動的に停止することもできます。
> 
{style="tip"}

以下は、`.stateIn()` に渡されたスコープをキャンセルすることで、派生したホットフローが新しい値のコレクトを停止する例です。

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
    // メッセージ履歴を保存する
    private val _messageHistory = MutableStateFlow<List<Message>>(emptyList())

    // 現在のメッセージ履歴を持つ読み取り専用の StateFlow を公開する
    val messageHistory: StateFlow<List<Message>>
        get() = _messageHistory.asStateFlow()

    // messageHistory フローのすべてのサブスクライバーにメッセージを送信する
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
        // 現在実行中のコルーチンの子スコープを作成する
        val derivedFlowsScope = CoroutineScope(
            currentCoroutineContext() + Job(currentCoroutineContext()[Job])
        )
        val totalMessages = chatroom.messageHistory
            .map { currentHistory ->
                currentHistory.size
            }.onEach {
                println("There are currently $it messages")
            }.stateIn(
                // このスコープで共有用コルーチンを開始する
                derivedFlowsScope
            )
        // messageHistory を更新
        chatroom.sendMessageToEveryone(
            Message(0, Clock.System.now(), "We are shutting down soon!")
        )
        delay(100.milliseconds)
        // 派生したホットフローを実行しているスコープをキャンセルする
        derivedFlowsScope.cancel()
        // messageHistory を更新するが、totalMessages は更新を受け取らなくなる
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

この例では、`derivedFlowsScope.cancel()` 関数を呼び出すと、`totalMessages` は `messageHistory` からの更新のコレクトを停止します。

`sendMessageToEveryone()` 関数を呼び出したコルーチンはキャンセルされていないため、依然として `messageHistory` を更新します。
その結果、`totalMessages.value` は最後にコレクトされたサイズを保持し、`chatroom.messageHistory.value.size` は実際のメッセージ数を表示します。

### ホットフローにおける例外処理

[コールドフロー](#handle-exceptions-in-flows)では、`.catch()` などの演算子を使用して最初に対処しない限り、アップストリームの例外は `collect()` の呼び出し元に伝播します。

ホットフローは、プロデューサーからサブスクライバーに例外を伝播しません。
`MutableSharedFlow` にエミットしたり `MutableStateFlow` を更新したりするコードが例外をスローする場合は、そのコードを実行しているコルーチンで例外を処理してください。
サブスクライバーがコレクト中に例外をスローした場合は、コレクトしているコルーチンで処理してください。

`.shareIn()` または `.stateIn()` 拡張関数で作成されたホットフローは、共有用コルーチンでアップストリームのフローをコレクトします。
アップストリームのフローが例外をスローすると、その例外により共有用コルーチンがキャンセルされます。

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

失敗後に[アップストリームのコレクションを再開](#restart-the-upstream-flow-after-an-exception)することができます。
そのためには、`.shareIn()` または `.stateIn()` の前に `.retry()` 演算子を配置します。

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
                // 回復可能な失敗の後にアップストリームのフローを再開する
                .retry(retries = 5)
                .stateIn(
                    // このスコープで共有用コルーチンを開始する
                    this@launch
                )

            stateFlow.collect {
                println("Observed $it")

                // コレクションと共有用コルーチンをキャンセルする
                this@launch.cancel()
            }
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

この例では、フローは値をエミットするまでに5回失敗します。
`.retry()` が `.stateIn()` よりも前に実行されるため、失敗が共有用コルーチンに達する前に各アップストリームの失敗を処理します。

アップストリームのフローが `10` をエミットした後、コレクトしているコルーチンがその値を受け取り、自身をキャンセルします。
同じコルーチンが共有用コルーチンの親でもあるため、これにより派生したホットフローも停止します。