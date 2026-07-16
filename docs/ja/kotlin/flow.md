<!--- TEST_NAME FlowGuideTest --> 
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 非同期Flow)

サスペンディング関数は非同期に単一の値を返しますが、非同期に計算された複数の値を返すにはどうすればよいでしょうか？ここでKotlin Flow（フロー）の出番です。

## 複数の値の表現

Kotlinでは、[collections] を使用して複数の値を表現できます。
例えば、3つの数値の [List] を返す `simple` 関数を用意し、[forEach] を使用してそれらすべてを出力できます。

```kotlin
fun simple(): `List<Int>` = listOf(1, 2, 3)
 
fun main() {
    simple().forEach { value -> println(value) } 
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-01.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-01.kt) から入手できます。
>
{style="note"}

このコードの出力は以下の通りです：

```text
1
2
3
```

<!--- TEST -->

### シーケンス (Sequences)

CPUを消費するブロッキングなコードで数値を計算している場合（各計算に100msかかるとします）、[Sequence] を使用して数値を表現できます。

```kotlin
fun simple(): Sequence<Int> = sequence { // sequence ビルダー
    for (i in 1..3) {
        Thread.sleep(100) // 計算しているふり
        yield(i) // 次の値を生成
    }
}

fun main() {
    simple().forEach { value -> println(value) } 
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-02.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-02.kt) から入手できます。
>
{style="note"}

このコードも同じ数値を出力しますが、各数値を出力する前に100ms待機します。

<!--- TEST 
1
2
3
-->

### サスペンディング関数 (Suspending functions)

しかし、この計算はコードを実行しているメインスレッドをブロックします。
これらの値が非同期コードによって計算される場合、`simple` 関数に `suspend` 修飾子を付けることで、ブロッキングせずに作業を実行し、結果をリストとして返すことができます。

```kotlin
import kotlinx.coroutines.*                 
                           
//sampleStart
suspend fun simple(): `List<Int>` {
    delay(1000) // ここで何か非同期なことをしているふり
    return listOf(1, 2, 3)
}

fun main() = runBlocking<Unit> {
    simple().forEach { value -> println(value) } 
}
//sampleEnd
```  
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-03.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-03.kt) から入手できます。
>
{style="note"}

このコードは1秒待機した後に数値を出力します。

<!--- TEST 
1
2
3
-->

### Flow

結果型に `List<Int>` を使用すると、すべての値を一度にしか返せないことを意味します。
非同期に計算される値のストリームを表現するには、同期的に計算される値に `Sequence<Int>` 型を使用するのと同じように、[`Flow<Int>`][Flow] 型を使用できます。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart               
fun simple(): Flow<Int> = flow { // flow ビルダー
    for (i in 1..3) {
        delay(100) // 何か役立つことをしているふり
        emit(i) // 次の値をエミット（送出）
    }
}

fun main() = runBlocking<Unit> {
    // メインスレッドがブロックされているか確認するために、並行コルーチンを起動
    launch {
        for (k in 1..3) {
            println("I'm not blocked $k")
            delay(100)
        }
    }
    // Flowをコレクト（収集）
    simple().collect { value -> println(value) } 
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-04.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-04.kt) から入手できます。
>
{style="note"}

このコードは、メインスレッドをブロックすることなく、各数値を印刷する前に100ms待機します。これは、メインスレッドで実行されている別のコルーチンから100msごとに "I'm not blocked" と出力されることで確認できます。

```text
I'm not blocked 1
1
I'm not blocked 2
2
I'm not blocked 3
3
```

<!--- TEST -->

以前の例のコードと [Flow] を使ったコードの以下の違いに注目してください。

* [Flow] 型のビルダー関数は [flow][_flow] と呼ばれます。
* `flow { ... }` ビルダーブロック内のコードはサスペンド（中断）できます。
* `simple` 関数には、もはや `suspend` 修飾子が付いていません。
* 値は [emit][FlowCollector.emit] 関数を使用してFlowから*エミット（送出）*されます。
* 値は [collect][collect] 関数を使用してFlowから*コレクト（収集）*されます。

> `simple` の `flow { ... }` のボディ内で [delay] を `Thread.sleep` に置き換えると、この場合にメインスレッドがブロックされることが確認できます。
>
{style="note"}

## Flowはコールド (Flows are cold)

Flowはシーケンスと同様に*コールド（Cold）*なストリームです。つまり、[flow][_flow] ビルダー内のコードは、Flowがコレクト（収集）されるまで実行されません。これは次の例で明確になります。

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
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-05.kt) から入手できます。
>
{style="note"}

出力結果は以下の通りです：

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
 
これが `simple` 関数（Flowを返す関数）に `suspend` 修飾子が付いていない主な理由です。
`simple()` の呼び出し自体はすぐに戻り、何も待ちません。Flowはコレクトされるたびに新しく開始されます。そのため、`collect` を再度呼び出すたびに "Flow started" と表示されるのです。

## Flowキャンセルの基本

Flowは、コルーチンの一般的な協調的キャンセルに従います。通常通り、Flowの収集（collection）は、Flowがキャンセル可能なサスペンディング関数（[delay] など）でサスペンドしているときにキャンセルできます。
次の例は、[withTimeoutOrNull] ブロックで実行されているときにタイムアウトでFlowがキャンセルされ、そのコードの実行が停止する様子を示しています。

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
    withTimeoutOrNull(250) { // 250ms後にタイムアウト
        simple().collect { value -> println(value) } 
    }
    println("Done")
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-06.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-06.kt) から入手できます。
>
{style="note"}

`simple` 関数のFlowによって2つの数値のみがエミットされ、以下の出力が生成されることに注目してください。

```text
Emitting 1
1
Emitting 2
2
Done
```

<!--- TEST -->

詳細については、[Flowのキャンセルチェック](#flowのキャンセルチェック) セクションを参照してください。

## Flowビルダー

前の例の `flow { ... }` ビルダーは最も基本的なものです。Flowを宣言するための他のビルダーもあります。

* [flowOf] ビルダーは、固定された値のセットをエミットするFlowを定義します。
* `.asFlow()` 拡張関数を使用して、さまざまなコレクションやシーケンスをFlowに変換できます。

例えば、Flowから1から3までの数値を出力するスニペットは次のように書き換えることができます。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> {
//sampleStart
    // 整数範囲をFlowに変換
    (1..3).asFlow().collect { value -> println(value) }
//sampleEnd 
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-07.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-07.kt) から入手できます。
>
{style="note"}

<!--- TEST
1
2
3
-->

## 中間Flow演算子

Flowは、コレクションやシーケンスを変換するのと同じ方法で、演算子を使用して変換できます。
中間演算子は上流（upstream）のFlowに適用され、下流（downstream）のFlowを返します。
これらの演算子はFlowと同様にコールドです。このような演算子の呼び出し自体はサスペンディング関数ではありません。
すぐに動作し、新しく変換されたFlowの定義を返します。

基本演算子には、[map] や [filter] のようにおなじみの名前が付いています。
シーケンスとの重要な違いは、これらの演算子内のコードブロックがサスペンディング関数を呼び出せることです。

例えば、リクエストを実行することがサスペンディング関数によって実装された長時間実行されるオペレーションである場合でも、[map] 演算子を使用して、入ってくるリクエストのFlowをその結果にマッピングできます。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart           
suspend fun performRequest(request: Int): String {
    delay(1000) // 長時間実行される非同期作業を模倣
    return "response $request"
}

fun main() = runBlocking<Unit> {
    (1..3).asFlow() // リクエストのFlow
        .map { request -> performRequest(request) }
        .collect { response -> println(response) }
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-08.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-08.kt) から入手できます。
>
{style="note"}

これにより、1秒ごとに1行ずつ、次の3行が表示されます。

```text                                                                    
response 1
response 2
response 3
```

<!--- TEST -->

### transform 演算子

Flow変換演算子の中で、最も汎用的なものは [transform] と呼ばれます。これは [map] や [filter] のような単純な変換を模倣したり、より複雑な変換を実装したりするために使用できます。
`transform` 演算子を使用すると、任意の値を任意の回数 [emit][FlowCollector.emit] できます。

例えば、`transform` を使用して、長時間実行される非同期リクエストを実行する前に文字列をエミットし、その後にレスポンスを続けることができます。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

suspend fun performRequest(request: Int): String {
    delay(1000) // 長時間実行される非同期作業を模倣
    return "response $request"
}

fun main() = runBlocking<Unit> {
//sampleStart
    (1..3).asFlow() // リクエストのFlow
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
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-09.kt) から入手できます。
>
{style="note"}

このコードの出力は以下の通りです：

```text
Making request 1
response 1
Making request 2
response 2
Making request 3
response 3
```

<!--- TEST -->

### サイズ制限演算子

[take] のようなサイズ制限中間演算子は、対応する制限に達するとFlowの実行をキャンセルします。コルーチンのキャンセルは常に例外をスローすることによって実行されるため、キャンセルの場合でもすべてのリソース管理関数（`try { ... } finally { ... }` ブロックなど）が正常に動作します。

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
        .take(2) // 最初の2つだけを取得
        .collect { value -> println(value) }
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-10.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-10.kt) から入手できます。
>
{style="note"}

このコードの出力は、2番目の数値をエミットした後に `numbers()` 関数の `flow { ... }` ボディの実行が停止したことを明確に示しています。

```text       
1
2
Finally in numbers
```

<!--- TEST -->

## 終端Flow演算子

Flowにおける終端演算子（Terminal operators）は、Flowの収集を開始する*サスペンディング関数*です。
[collect] 演算子は最も基本的なものですが、他にも便利な終端演算子があります。

* [toList] や [toSet] などの各種コレクションへの変換。
* [first] 値を取得する演算子や、Flowが [single] 値のみをエミットすることを保証する演算子。
* [reduce] や [fold] を使用してFlowを1つの値に集約（Reduce）する演算子。

例：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> {
//sampleStart         
    val sum = (1..5).asFlow()
        .map { it * it } // 1から5までの数値の2乗                           
        .reduce { a, b -> a + b } // それらを合計する（終端演算子）
    println(sum)
//sampleEnd     
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-11.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-11.kt) から入手できます。
>
{style="note"}

単一の数値が出力されます：

```text
55
```

<!--- TEST -->

## Flowはシーケンシャル (Flows are sequential)

複数のFlowを操作する特別な演算子が使用されない限り、Flowの個々の収集は順次（シーケンシャルに）実行されます。収集は、終端演算子を呼び出すコルーチン内で直接動作します。デフォルトでは新しいコルーチンは起動されません。
エミットされた各値は、上流から下流までのすべての中間演算子によって処理され、その後に終端演算子に渡されます。

偶数をフィルタリングして文字列にマッピングする次の例を見てください。

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
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-12.kt) から入手できます。
>
{style="note"}

出力結果：

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

## Flowコンテキスト

Flowの収集は、常に呼び出し元のコルーチンのコンテキストで行われます。例えば、`simple` というFlowがある場合、次のコードは `simple` Flowの実装詳細に関係なく、このコードの作成者によって指定されたコンテキストで実行されます。

```kotlin
withContext(context) {
    simple().collect { value ->
        println(value) // 指定されたコンテキストで実行される 
    }
}
```

<!--- CLEAR -->

Flowのこのプロパティは、*コンテキスト保存（Context preservation）*と呼ばれます。

したがって、デフォルトでは、`flow { ... }` ビルダー内のコードは、対応するFlowのコレクター（収集者）によって提供されるコンテキストで実行されます。例えば、呼び出されたスレッドを出力し、3つの数値をエミットする `simple` 関数の実装を考えてみましょう。

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
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-13.kt) から入手できます。
>
{style="note"}

このコードを実行すると以下のように出力されます。

```text  
[main @coroutine#1] Started simple flow
[main @coroutine#1] Collected 1
[main @coroutine#1] Collected 2
[main @coroutine#1] Collected 3
```

<!--- TEST FLEXIBLE_THREAD -->

`simple().collect` はメインスレッドから呼び出されるため、`simple` のFlowのボディもメインスレッドで呼び出されます。これは、実行コンテキストを気にせず、呼び出し元をブロックしない、高速に動作するコードや非同期コードにとって最適なデフォルト設定です。

### withContext を使用する際のよくある落とし穴

しかし、長時間実行されるCPU消費型のコードは [Dispatchers.Default] のコンテキストで実行する必要があるかもしれませんし、UIを更新するコードは [Dispatchers.Main] のコンテキストで実行する必要があるかもしれません。通常、Kotlinコルーチンを使用したコードでは [withContext] を使用してコンテキストを変更しますが、`flow { ... }` ビルダー内のコードはコンテキスト保存プロパティを尊重する必要があり、異なるコンテキストから [emit][FlowCollector.emit] することは許可されていません。

次のコードを実行してみてください。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
                      
//sampleStart
fun simple(): Flow<Int> = flow {
    // Flowビルダー内でCPU消費型コードのコンテキストを変更する「誤った」方法
    kotlinx.coroutines.withContext(Dispatchers.Default) {
        for (i in 1..3) {
            Thread.sleep(100) // CPUを消費する方法で計算しているふり
            emit(i) // 次の値をエミット
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
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-14.kt) から入手できます。
>
{style="note"}

このコードは以下の例外を生成します。

```text
Exception in thread "main" java.lang.IllegalStateException: Flow invariant is violated:
		Flow was collected in [CoroutineId(1), "coroutine#1":BlockingCoroutine{Active}@5511c7f8, BlockingEventLoop@2eac3323],
		but emission happened in [CoroutineId(1), "coroutine#1":DispatchedCoroutine{Active}@2dae0000, Dispatchers.Default].
		Please refer to 'flow' documentation or use 'flowOn' instead
	at ...
``` 

<!--- TEST EXCEPTION -->

### flowOn 演算子
   
例外メッセージは、Flowのエミッションのコンテキストを変更するために使用すべき [flowOn] 関数に言及しています。Flowのコンテキストを変更する正しい方法は、以下の例に示されています。この例では、すべてがどのように機能するかを示すために、対応するスレッドの名前も出力しています。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun log(msg: String) = println("[${Thread.currentThread().name}] $msg")
           
//sampleStart
fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        Thread.sleep(100) // CPUを消費する方法で計算しているふり
        log("Emitting $i")
        emit(i) // 次の値をエミット
    }
}.flowOn(Dispatchers.Default) // Flowビルダー内のCPU消費型コードのコンテキストを変更する「正しい」方法

fun main() = runBlocking<Unit> {
    simple().collect { value ->
        log("Collected $value") 
    } 
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-15.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-15.kt) から入手できます。
>
{style="note"}
  
`flow { ... }` がバックグラウンドスレッドで動作し、収集（collection）がメインスレッドで行われていることに注目してください。

```text
[DefaultDispatcher-worker-1 @coroutine#2] Emitting 1
[main @coroutine#1] Collected 1
[DefaultDispatcher-worker-1 @coroutine#2] Emitting 2
[main @coroutine#1] Collected 2
[DefaultDispatcher-worker-1 @coroutine#2] Emitting 3
[main @coroutine#1] Collected 3
```

<!--- TEST FLEXIBLE_THREAD -->

ここで観察すべきもう一つの点は、[flowOn] 演算子がFlowのデフォルトのシーケンシャルな性質を変更したことです。現在、収集はあるコルーチン（"coroutine#1"）で行われ、エミッションは収集コルーチンと並行して別のスレッドで実行されている別のコルーチン（"coroutine#2"）で行われています。[flowOn] 演算子は、コンテキスト内の [CoroutineDispatcher] を変更する必要がある場合に、上流のFlowのために別のコルーチンを作成します。

## バッファリング (Buffering)

Flowの異なる部分を異なるコルーチンで実行することは、特に長時間実行される非同期オペレーションが含まれる場合に、Flowの収集にかかる全体の時間の観点から役立つことがあります。例えば、`simple` Flowによるエミッションが遅く、1つの要素を生成するのに100msかかり、コレクターも遅く、要素を処理するのに300msかかる場合を考えてみましょう。3つの数値を持つそのようなFlowを収集するのにどれくらいの時間がかかるか見てみましょう。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.system.*

//sampleStart
fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100) // 非同期に100ms待機しているふり
        emit(i) // 次の値をエミット
    }
}

fun main() = runBlocking<Unit> { 
    val time = measureTimeMillis {
        simple().collect { value -> 
            delay(300) // 300ms間処理しているふり
            println(value) 
        } 
    }   
    println("Collected in $time ms")
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-16.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-16.kt) から入手できます。
>
{style="note"}

収集全体で約1200ms（3つの数値、各400ms）かかり、次のような結果になります。

```text
1
2
3
Collected in 1220 ms
```

<!--- TEST ARBITRARY_TIME -->

Flowで [buffer] 演算子を使用すると、`simple` Flowのエミットコードを収集コードと並行して実行でき、順次実行されるのを避けることができます。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.system.*

fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100) // 非同期に100ms待機しているふり
        emit(i) // 次の値をエミット
    }
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val time = measureTimeMillis {
        simple()
            .buffer() // エミッションをバッファリングし、待機しない
            .collect { value -> 
                delay(300) // 300ms間処理しているふり
                println(value) 
            } 
    }   
    println("Collected in $time ms")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-17.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-17.kt) から入手できます。
>
{style="note"}

処理パイプラインを効果的に作成したため、最初の数値に対して100ms待機し、各数値の処理に300ms費やすだけで済むようになり、同じ数値をより速く生成します。このようにすると、実行に約1000msかかります。

```text
1
2
3
Collected in 1071 ms
```                    

<!--- TEST ARBITRARY_TIME -->

> [flowOn] 演算子は [CoroutineDispatcher] を変更する必要があるときに同じバッファリングメカニズムを使用しますが、ここでは実行コンテキストを変更せずに明示的にバッファリングを要求しています。
>
{style="note"}

### 合流 (Conflation)

Flowがオペレーションの中間結果やオペレーションのステータス更新を表す場合、各値を処理する必要はなく、最新の値のみを処理すればよい場合があります。この場合、コレクターが処理するには遅すぎる場合に中間値をスキップするために [conflate] 演算子を使用できます。前の例をベースにしてみましょう。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.system.*

fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100) // 非同期に100ms待機しているふり
        emit(i) // 次の値をエミット
    }
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val time = measureTimeMillis {
        simple()
            .conflate() // エミッションを合流させ、すべてを処理しない
            .collect { value -> 
                delay(300) // 300ms間処理しているふり
                println(value) 
            } 
    }   
    println("Collected in $time ms")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-18.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-18.kt) から入手できます。
>
{style="note"}

最初の数値がまだ処理されている間に2番目と3番目がすでに生成されていたため、2番目が*合流（conflated）*され、最新のもの（3番目）のみがコレクターに配信されたことがわかります。

```text
1
3
Collected in 758 ms
```             

<!--- TEST ARBITRARY_TIME -->

### 最新値の処理 (Processing the latest value)

合流（Conflation）は、エミッターとコレクターの両方が遅い場合に処理を高速化する1つの方法です。これはエミットされた値をドロップすることで行われます。もう1つの方法は、新しい値がエミットされるたびに遅いコレクターをキャンセルして再起動することです。`xxxLatest` 演算子のファミリーがあり、`xxx` 演算子と同じ基本的なロジックを実行しますが、新しい値が来るとそのブロック内のコードをキャンセルします。前の例で [conflate] を [collectLatest] に変更してみましょう。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.system.*

fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100) // 非同期に100ms待機しているふり
        emit(i) // 次の値をエミット
    }
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val time = measureTimeMillis {
        simple()
            .collectLatest { value -> // 最新の値でキャンセル＆再起動
                println("Collecting $value") 
                delay(300) // 300ms間処理しているふり
                println("Done $value") 
            } 
    }   
    println("Collected in $time ms")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-19.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-19.kt) から入手できます。
>
{style="note"}
 
[collectLatest] のボディには300msかかりますが、新しい値は100msごとにエミットされるため、ブロックはすべての値に対して実行されますが、完了するのは最後の値だけであることがわかります。

```text 
Collecting 1
Collecting 2
Collecting 3
Done 3
Collected in 741 ms
``` 

<!--- TEST ARBITRARY_TIME -->

## 複数のFlowの合成

複数のFlowを合成する方法はたくさんあります。

### Zip

Kotlin標準ライブラリの [Sequence.zip] 拡張関数と同様に、Flowには2つのFlowの対応する値を組み合わせる [zip] 演算子があります。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> { 
//sampleStart                                                                           
    val nums = (1..3).asFlow() // 数値 1..3
    val strs = flowOf("one", "two", "three") // 文字列 
    nums.zip(strs) { a, b -> "$a -> $b" } // 単一の文字列を合成
        .collect { println(it) } // コレクトして出力
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-20.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-20.kt) から入手できます。
>
{style="note"}

この例の出力は以下の通りです：

```text
1 -> one
2 -> two
3 -> three
```
 
<!--- TEST -->

### Combine

Flowが変数やオペレーションの最新値を表す場合（[合流](#合流) に関する関連セクションも参照）、対応するFlowの最新値に依存する計算を実行し、上流のFlowのいずれかが値をエミットするたびに再計算する必要があるかもしれません。対応する演算子ファミリーは [combine] と呼ばれます。

例えば、前の例の数値が300msごとに更新され、文字列が400msごとに更新される場合、[zip] 演算子を使用してそれらをジップしても同じ結果が得られますが、結果は400msごとに出力されます。

> この例では、各要素を遅延させ、サンプルFlowをエミットするコードをより宣言的かつ短くするために、[onEach] 中間演算子を使用しています。
>
{style="note"}

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> { 
//sampleStart                                                                           
    val nums = (1..3).asFlow().onEach { delay(300) } // 300msごとに数値 1..3
    val strs = flowOf("one", "two", "three").onEach { delay(400) } // 400msごとに文字列
    val startTime = System.currentTimeMillis() // 開始時間を記録 
    nums.zip(strs) { a, b -> "$a -> $b" } // "zip" で単一の文字列を合成
        .collect { value -> // コレクトして出力 
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-21.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-21.kt) から入手できます。
>
{style="note"}

<!--- TEST ARBITRARY_TIME
1 -> one at 437 ms from start
2 -> two at 837 ms from start
3 -> three at 1243 ms from start
-->

しかし、ここで [zip] の代わりに [combine] 演算子を使用すると、次のようになります。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> { 
//sampleStart                                                                           
    val nums = (1..3).asFlow().onEach { delay(300) } // 300msごとに数値 1..3
    val strs = flowOf("one", "two", "three").onEach { delay(400) } // 400msごとに文字列          
    val startTime = System.currentTimeMillis() // 開始時間を記録 
    nums.combine(strs) { a, b -> "$a -> $b" } // "combine" で単一の文字列を合成
        .collect { value -> // コレクトして出力 
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-22.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-22.kt) から入手できます。
>
{style="note"}

`nums` または `strs` Flowのいずれかからエミッションがあるたびに1行出力される、まったく異なる出力が得られます。

```text 
1 -> one at 452 ms from start
2 -> one at 651 ms from start
2 -> two at 854 ms from start
3 -> two at 952 ms from start
3 -> three at 1256 ms from start
```

<!--- TEST ARBITRARY_TIME -->

## Flowのフラット化 (Flattening flows)

Flowは非同期に受信される値のシーケンスを表すため、各値が別の値のシーケンスに対するリクエストをトリガーする状況になりがちです。例えば、500ms間隔で2つの文字列のFlowを返す次の関数があるとします。

```kotlin
fun requestFlow(i: Int): Flow<String> = flow {
    emit("$i: First") 
    delay(500) // 500ms待機
    emit("$i: Second")    
}
```

<!--- CLEAR -->

ここで、3つの整数のFlowがあり、それらの各々に対して `requestFlow` を呼び出すとします。

```kotlin
(1..3).asFlow().map { requestFlow(it) }
```

<!--- CLEAR -->

その結果、さらなる処理のために単一のFlowに*フラット化*する必要があるFlowのFlow（`Flow<Flow<String>>`）が出来上がります。コレクションやシーケンスには、このための [flatten][Sequence.flatten] と [flatMap][Sequence.flatMap] 演算子があります。しかし、Flowの非同期な性質により、フラット化には異なる*モード*が必要となるため、Flowにはフラット化演算子のファミリーが存在します。

### flatMapConcat

FlowのFlowの連結は、[flatMapConcat] および [flattenConcat] 演算子によって提供されます。これらは、対応するシーケンス演算子の最も直接的な類似物です。次の例が示すように、これらは次のFlowの収集を開始する前に、内部Flowが完了するのを待ちます。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun requestFlow(i: Int): Flow<String> = flow {
    emit("$i: First") 
    delay(500) // 500ms待機
    emit("$i: Second")    
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val startTime = System.currentTimeMillis() // 開始時間を記録 
    (1..3).asFlow().onEach { delay(100) } // 100msごとに数値をエミット 
        .flatMapConcat { requestFlow(it) }                                                                           
        .collect { value -> // コレクトして出力 
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-23.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-23.kt) から入手できます。
>
{style="note"}

[flatMapConcat] のシーケンシャルな性質が出力にはっきりと現れています。

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

別のフラット化オペレーションは、すべての入力Flowを並行して収集し、それらの値を単一のFlowにマージして、値ができるだけ早くエミットされるようにすることです。
これは [flatMapMerge] および [flattenMerge] 演算子によって実装されます。これらは両方とも、同時に収集される並列Flowの数を制限するオプションの `concurrency` パラメータを受け取ります（デフォルトでは [DEFAULT_CONCURRENCY] と等しい）。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun requestFlow(i: Int): Flow<String> = flow {
    emit("$i: First") 
    delay(500) // 500ms待機
    emit("$i: Second")    
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val startTime = System.currentTimeMillis() // 開始時間を記録 
    (1..3).asFlow().onEach { delay(100) } // 100msごとに数値 
        .flatMapMerge { requestFlow(it) }                                                                           
        .collect { value -> // コレクトして出力 
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-24.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-24.kt) から入手できます。
>
{style="note"}

[flatMapMerge] の並行性は明らかです。

```text                      
1: First at 136 ms from start
2: First at 231 ms from start
3: First at 333 ms from start
1: Second at 639 ms from start
2: Second at 732 ms from start
3: Second at 833 ms from start
```                                               

<!--- TEST ARBITRARY_TIME -->

> [flatMapMerge] はそのコードブロック（この例では `{ requestFlow(it) }`）を順次呼び出しますが、結果のFlowは並行して収集することに注意してください。これは、最初に順次 `map { requestFlow(it) }` を実行し、その結果に対して [flattenMerge] を呼び出すのと同等です。
>
{style="note"}

### flatMapLatest   

["最新値の処理"](#最新値の処理) セクションで説明した [collectLatest] 演算子と同様に、新しいFlowがエミットされるとすぐに前のFlowの収集がキャンセルされる、対応する "Latest" フラット化モードがあります。これは [flatMapLatest] 演算子によって実装されます。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun requestFlow(i: Int): Flow<String> = flow {
    emit("$i: First") 
    delay(500) // 500ms待機
    emit("$i: Second")    
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val startTime = System.currentTimeMillis() // 開始時間を記録 
    (1..3).asFlow().onEach { delay(100) } // 100msごとに数値 
        .flatMapLatest { requestFlow(it) }                                                                           
        .collect { value -> // コレクトして出力 
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-25.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-25.kt) から入手できます。
>
{style="note"}

この例の出力は、[flatMapLatest] がどのように機能するかを示す良いデモンストレーションです。

```text                      
1: First at 142 ms from start
2: First at 322 ms from start
3: First at 425 ms from start
3: Second at 931 ms from start
```                                               

<!--- TEST ARBITRARY_TIME -->
  
> [flatMapLatest] は、新しい値が受信されるとそのブロック内のすべてのコード（この例では `{ requestFlow(it) }`）をキャンセルすることに注意してください。
> この特定の例では、`requestFlow` 自体の呼び出しが高速で、サスペンドせず、キャンセルできないため、違いはありません。しかし、`requestFlow` で `delay` のようなサスペンディング関数を使用していた場合、出力に違いが現れます。
>
{style="note"}

## Flowの例外

エミッターまたは演算子内のコードが例外をスローすると、Flowの収集は例外で終了することがあります。これらの例外を処理する方法はいくつかあります。

### コレクターの try と catch

コレクターは Kotlin の [`try/catch`][exceptions] ブロックを使用して例外を処理できます。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        println("Emitting $i")
        emit(i) // 次の値をエミット
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
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-26.kt) から入手できます。
>
{style="note"}

このコードは [collect] 終端演算子での例外を正常にキャッチし、その後は値がエミットされないことがわかります。

```text 
Emitting 1
1
Emitting 2
2
Caught java.lang.IllegalStateException: Collected 2
```

<!--- TEST -->

### すべてがキャッチされる

前の例は、実際にはエミッター、または中間演算子や終端演算子で発生するあらゆる例外をキャッチします。
例えば、エミットされた値が文字列に [マップ][map] されるようにコードを変更し、その対応するコードが例外を生成するようにしてみましょう。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
fun simple(): Flow<String> = 
    flow {
        for (i in 1..3) {
            println("Emitting $i")
            emit(i) // 次の値をエミット
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
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-27.kt) から入手できます。
>
{style="note"}

この例外もキャッチされ、収集は停止します。

```text 
Emitting 1
string 1
Emitting 2
Caught java.lang.IllegalStateException: Crashed on 2
```

<!--- TEST -->

## 例外の透明性 (Exception transparency)

しかし、エミッターのコードはどうすればその例外処理動作をカプセル化できるでしょうか？

Flowは*例外に対して透明（Transparent to exceptions）*でなければならず、`flow { ... }` ビルダー内の `try/catch` ブロックの中から値を [エミット][FlowCollector.emit] することは、例外の透明性の違反です。これにより、例外をスローするコレクターが、前の例のように常に `try/catch` を使用して例外をキャッチできることが保証されます。

エミッターは [catch] 演算子を使用でき、これはこの例外の透明性を維持し、その例外処理のカプセル化を可能にします。`catch` 演算子のボディは例外を分析し、どの例外がキャッチされたかに応じて異なる方法で対応できます。

* `throw` を使用して例外を再スローできます。
* [catch] のボディから [emit][FlowCollector.emit] を使用して、例外を値のエミッションに変えることができます。
* 例外を無視したり、ログに記録したり、他のコードで処理したりできます。

例えば、例外をキャッチしたときにテキストをエミットしてみましょう。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun simple(): Flow<String> = 
    flow {
        for (i in 1..3) {
            println("Emitting $i")
            emit(i) // 次の値をエミット
        }
    }
    .map { value ->
        check(value <= 1) { "Crashed on $value" }                 
        "string $value"
    }

fun main() = runBlocking<Unit> {
//sampleStart
    simple()
        .catch { e -> emit("Caught $e") } // 例外時にエミット
        .collect { value -> println(value) }
//sampleEnd
}            
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-28.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-28.kt) から入手できます。
>
{style="note"} 
 
コードの周りに `try/catch` がなくなりましたが、例の出力は同じです。

<!--- TEST  
Emitting 1
string 1
Emitting 2
Caught java.lang.IllegalStateException: Crashed on 2
-->

### 透明なキャッチ

[catch] 中間演算子は、例外の透明性を尊重し、上流（upstream）の例外（`catch` より上のすべての演算子からの例外であり、それより下の例外ではない）のみをキャッチします。
`collect { ... }`（`catch` より下に配置）内のブロックが例外をスローした場合、それはエスケープされます。

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
        .catch { e -> println("Caught $e") } // 下流の例外はキャッチしない
        .collect { value ->
            check(value <= 1) { "Collected $value" }                 
            println(value) 
        }
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-29.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-29.kt) から入手できます。
>
{style="note"}
 
`catch` 演算子があるにもかかわらず、"Caught ..." メッセージは印刷されません。

```text  
Emitting 1
1
Emitting 2
Exception in thread "main" java.lang.IllegalStateException: Collected 2
	at ...
```

<!--- TEST EXCEPTION -->

### 宣言的なキャッチ

[catch] 演算子の宣言的な性質と、すべての例外を処理したいという要望を組み合わせるには、[collect] 演算子のボディを [onEach] に移動し、それを `catch` 演算子の前に置くことができます。このFlowの収集は、パラメータなしの `collect()` の呼び出しによってトリガーされる必要があります。

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
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-30.kt) から入手できます。
>
{style="note"} 
 
これで "Caught ..." メッセージが表示されるようになり、`try/catch` ブロックを明示的に使用せずにすべての例外をキャッチできるようになりました。

```text 
Emitting 1
1
Emitting 2
Caught java.lang.IllegalStateException: Collected 2
```

<!--- TEST EXCEPTION -->

## Flowの完了

Flowの収集が完了すると（正常終了または例外終了）、アクションを実行する必要がある場合があります。
すでにお気づきかもしれませんが、これは命令的または宣言的な2つの方法で行うことができます。

### 命令的な finally ブロック

`try`/`catch` に加えて、コレクターは `finally` ブロックを使用して、`collect` 完了時にアクションを実行することもできます。

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
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-31.kt) から入手できます。
>
{style="note"} 

このコードは、`simple` Flowによって生成された3つの数値に続いて、"Done" という文字列を出力します。

```text
1
2
3
Done
```

<!--- TEST  -->

### 宣言的なハンドリング

宣言的なアプローチでは、Flowに [onCompletion] 中間演算子があり、これはFlowが完全に収集されたときに呼び出されます。

前の例は [onCompletion] 演算子を使用して書き換えることができ、同じ出力を生成します。

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
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-32.kt) から入手できます。
>
{style="note"} 

<!--- TEST 
1
2
3
Done
-->

[onCompletion] の主な利点は、ラムダの Nullable な `Throwable` パラメータであり、これを使用してFlowの収集が正常に完了したか、例外的に完了したかを判断できることです。次の例では、`simple` Flowは数値1をエミットした後に例外をスローします。

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
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-33.kt) から入手できます。
>
{style="note"}

予想通り、以下のように出力されます。

```text
1
Flow completed exceptionally
Caught exception
```

<!--- TEST -->

[onCompletion] 演算子は [catch] とは異なり、例外を処理しません。上記のコード例からわかるように、例外は依然として下流に流れます。それはさらなる `onCompletion` 演算子に配信され、`catch` 演算子で処理されることができます。

### 正常完了

[catch] 演算子とのもう一つの違いは、[onCompletion] がすべての例外を認識し、上流のFlowが（キャンセルや失敗なしに）正常に完了した場合にのみ `null` 例外を受け取ることです。

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
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-34.kt) から入手できます。
>
{style="note"}

下流の例外のためにFlowが中止されたため、完了の原因が null ではないことがわかります。

```text 
1
Flow completed with java.lang.IllegalStateException: Collected 2
Exception in thread "main" java.lang.IllegalStateException: Collected 2
```

<!--- TEST EXCEPTION -->

## 命令的 vs 宣言的

Flowを収集し、その完了と例外を命令的および宣言的の両方の方法で処理する方法を学びました。
ここで当然の疑問は、どのアプローチが好ましく、なぜなのかということです。
ライブラリとしては、特定のアプローチを推奨することはありません。両方のオプションが有効であり、自身の好みやコードスタイルに応じて選択されるべきだと考えています。

## Flowの起動 (Launching flow)

Flowを使用して、何らかのソースから送られてくる非同期イベントを表現するのは簡単です。
この場合、入ってくるイベントに対する反応とともにコードを登録し、さらなる作業を継続する `addEventListener` 関数の類似物が必要です。[onEach] 演算子はこの役割を果たすことができます。
しかし、`onEach` は中間演算子です。Flowを収集するには終端演算子も必要です。
そうでなければ、`onEach` を呼び出すだけでは効果がありません。
 
`onEach` の後に [collect] 終端演算子を使用すると、その後のコードはFlowが収集されるまで待機します。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
// イベントのFlowを模倣
fun events(): Flow<Int> = (1..3).asFlow().onEach { delay(100) }

fun main() = runBlocking<Unit> {
    events()
        .onEach { event -> println("Event: $event") }
        .collect() // <--- Flowの収集を待機
    println("Done")
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-35.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-35.kt) から入手できます。
>
{style="note"} 
  
ご存知の通り、以下のように出力されます。

```text 
Event: 1
Event: 2
Event: 3
Done
```    

<!--- TEST -->
 
ここで便利なのが [launchIn] 終端演算子です。`collect` を `launchIn` に置き換えることで、Flowの収集を別のコルーチンで起動できるため、後続のコードの実行をすぐに継続できます。

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// イベントのFlowを模倣
fun events(): Flow<Int> = (1..3).asFlow().onEach { delay(100) }

//sampleStart
fun main() = runBlocking<Unit> {
    events()
        .onEach { event -> println("Event: $event") }
        .launchIn(this) // <--- Flowを別のコルーチンで起動
    println("Done")
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-36.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-36.kt) から入手できます。
>
{style="note"} 
  
出力結果：

```text          
Done
Event: 1
Event: 2
Event: 3
```    

<!--- TEST -->

`launchIn` に必要なパラメータは、Flowを収集するコルーチンが起動される [CoroutineScope] を指定する必要があります。上の例では、このスコープは [runBlocking] コルーチンビルダーから提供されているため、Flowが実行されている間、この [runBlocking] スコープはその子コルーチンの完了を待ち、メイン関数が戻ってこの例が終了するのを防ぎます。

実際のアプリケーションでは、スコープは寿命が限られたエンティティから提供されます。そのエンティティの寿命が終了すると、対応するスコープがキャンセルされ、対応するFlowの収集もキャンセルされます。このようにして、`onEach { ... }.launchIn(scope)` のペアは `addEventListener` のように機能します。しかし、キャンセルと構造化された並行性がこの目的を果たすため、対応する `removeEventListener` 関数は必要ありません。

[launchIn] も [Job] を返します。これを使用して、スコープ全体をキャンセルすることなく、対応するFlow収集コルーチンのみを [キャンセル][Job.cancel] したり、[join][Job.join] したりできます。

### Flowのキャンセルチェック

便宜上、[flow][_flow] ビルダーは、エミットされた各値に対してキャンセルのための追加の [ensureActive] チェックを実行します。
これは、`flow { ... }` からエミットするビジーループがキャンセル可能であることを意味します。

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
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-37.kt) から入手できます。
>
{style="note"}

数値3までしか得られず、数値4をエミットしようとした後に [CancellationException] が発生します。

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

しかし、他のほとんどのFlow演算子は、パフォーマンス上の理由から、自前で追加のキャンセルチェックを行いません。
例えば、[IntRange.asFlow] 拡張を使用して同じビジーループを作成し、どこでもサスペンドしない場合、キャンセルのチェックは行われません。

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
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-38.kt) から入手できます。
>
{style="note"}

1から5までのすべての数値が収集され、`runBlocking` から戻る直前にのみキャンセルが検出されます。

```text
1
2
3
4
5
Exception in thread "main" kotlinx.coroutines.JobCancellationException: BlockingCoroutine was cancelled; job="coroutine#1":BlockingCoroutine{Cancelled}@3327bd23
```

<!--- TEST EXCEPTION -->

#### ビジーなFlowをキャンセル可能にする 

コルーチンを含むビジーループがある場合は、明示的にキャンセルをチェックする必要があります。
`.onEach { currentCoroutineContext().ensureActive() }` を追加することもできますが、そのための [cancellable] 演算子が用意されています。

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
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-39.kt) から入手できます。
>
{style="note"}

`cancellable` 演算子を使用すると、1から3までの数値のみが収集されます。

```text
1
2
3
Exception in thread "main" kotlinx.coroutines.JobCancellationException: BlockingCoroutine was cancelled; job="coroutine#1":BlockingCoroutine{Cancelled}@5ec0a365
```

<!--- TEST EXCEPTION -->

## Flowとリアクティブストリーム

[Reactive Streams](https://www.reactive-streams.org/) や、RxJava やプロジェクト Reactor などのリアクティブフレームワークに精通している人にとって、Flow の設計は非常になじみ深いものに見えるかもしれません。

実際、その設計はリアクティブストリームとそのさまざまな実装に触発されました。しかし、Flow の主な目標は、できるだけシンプルな設計にし、Kotlin とサスペンドに適しており、構造化された並行性を尊重することです。リアクティブの先駆者たちとその多大な努力なしには、この目標を達成することは不可能だったでしょう。詳細なストーリーは、[Reactive Streams and Kotlin Flows](https://medium.com/@elizarov/reactive-streams-and-kotlin-flows-bfd12772cda4) の記事で読むことができます。

異なりはしますが、概念的には Flow *は* リアクティブストリームであり、リアクティブ（仕様および TCK 準拠）な Publisher に変換したり、その逆に変換したりすることが可能です。
このようなコンバータは `kotlinx.coroutines` によって標準で提供されており、対応するリアクティブモジュール（Reactive Streams 用の `kotlinx-coroutines-reactive`、Project Reactor 用の `kotlinx-coroutines-reactor`、RxJava2/RxJava3 用の `kotlinx-coroutines-rx2`/`kotlinx-coroutines-rx3`）に見つけることができます。
統合モジュールには、`Flow` との相互変換、Reactor の `Context` との統合、およびさまざまなリアクティブエンティティを操作するためのサスペンドに適した方法が含まれています。
 
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