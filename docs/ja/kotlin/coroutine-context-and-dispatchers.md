<!--- TEST_NAME DispatcherGuideTest -->
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: コルーチンコンテキストとディスパッチャ)

コルーチンは常に、Kotlin標準ライブラリで定義されている 
[CoroutineContext](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.coroutines/-coroutine-context/) 
型の値で表される何らかのコンテキスト内で実行されます。

コルーチンコンテキストは、さまざまな要素のセットです。主な要素は、以前に見たコルーチンの [Job] と、このセクションで説明するディスパッチャです。

## ディスパッチャとスレッド {id="dispatchers-and-threads"}

コルーチンコンテキストには、対応するコルーチンが実行に使用するスレッド（または複数のスレッド）を決定する *コルーチンディスパッチャ*（[CoroutineDispatcher] を参照）が含まれます。コルーチンディスパッチャは、コルーチンの実行を特定の物理スレッドに限定したり、スレッドプールにディスパッチしたり、あるいは限定せずに実行したりすることができます。

[launch] や [async] などのすべてのコルーチンビルダーは、オプションの 
[CoroutineContext](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.coroutines/-coroutine-context/) 
パラメータを受け取ることができ、これを使用して新しいコルーチンのディスパッチャやその他のコンテキスト要素を明示的に指定できます。

次の例を試してみてください：

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
//sampleStart
    launch { // 親のコンテキスト、つまりメインの runBlocking コルーチンを継承します
        println("main runBlocking      : I'm working in thread ${Thread.currentThread().name}")
    }
    launch(Dispatchers.Unconfined) { // 限定されない -- メインスレッドで動作します
        println("Unconfined            : I'm working in thread ${Thread.currentThread().name}")
    }
    launch(Dispatchers.Default) { // DefaultDispatcher にディスパッチされます
        println("Default               : I'm working in thread ${Thread.currentThread().name}")
    }
    launch(newSingleThreadContext("MyOwnThread")) { // 独自の新しいスレッドを取得します
        println("newSingleThreadContext: I'm working in thread ${Thread.currentThread().name}")
    }
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-01.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-01.kt) から入手できます。
>
{style="note"}

次のような出力が得られます（順序は異なる場合があります）：

```text
Unconfined            : I'm working in thread main
Default               : I'm working in thread DefaultDispatcher-worker-1
newSingleThreadContext: I'm working in thread MyOwnThread
main runBlocking      : I'm working in thread main
```

<!--- TEST LINES_START_UNORDERED -->

パラメータなしで `launch { ... }` を使用すると、それが起動された [CoroutineScope] からコンテキスト（したがってディスパッチャ）を継承します。この場合、`main` スレッドで実行されているメインの `runBlocking` コルーチンのコンテキストを継承します。

[Dispatchers.Unconfined] は、同じく `main` スレッドで実行されているように見える特別なディスパッチャですが、実際には後述する異なるメカニズムです。

デフォルトのディスパッチャは、スコープ内で他のディスパッチャが明示的に指定されていない場合に使用されます。これは [Dispatchers.Default] によって表され、共有されたバックグラウンドスレッドプールを使用します。

[newSingleThreadContext] は、コルーチンが実行されるためのスレッドを作成します。専用のスレッドは非常に高価なリソースです。実際のアプリケーションでは、不要になったときに [close][ExecutorCoroutineDispatcher.close] 関数を使用して解放するか、トップレベルの変数に保持してアプリケーション全体で再利用する必要があります。

## 非限定ディスパッチャ vs 限定ディスパッチャ {id="unconfined-vs-confined-dispatcher"}

[Dispatchers.Unconfined] コルーチンディスパッチャは、呼び出し元のスレッドでコルーチンを開始しますが、それは最初の懸架（サスペンション）ポイントまでです。中断された後は、呼び出された中断関数によって完全に決定されるスレッドでコルーチンを再開します。非限定ディスパッチャは、CPU時間を消費せず、特定の物理スレッドに限定された共有データ（UIなど）を更新しないコルーチンに適しています。

一方で、ディスパッチャはデフォルトで外部の [CoroutineScope] から継承されます。特に [runBlocking] コルーチンのデフォルトディスパッチャは、呼び出し元のスレッドに限定（コンファイン）されるため、これを継承すると、予測可能な FIFO スケジューリングでそのスレッドに実行が限定される効果があります。

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
//sampleStart
    launch(Dispatchers.Unconfined) { // 限定されない -- メインスレッドで動作します
        println("Unconfined      : I'm working in thread ${Thread.currentThread().name}")
        delay(500)
        println("Unconfined      : After delay in thread ${Thread.currentThread().name}")
    }
    launch { // 親のコンテキスト、つまりメインの runBlocking コルーチンを継承します
        println("main runBlocking: I'm working in thread ${Thread.currentThread().name}")
        delay(1000)
        println("main runBlocking: After delay in thread ${Thread.currentThread().name}")
    }
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-02.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-02.kt) から入手できます。
>
{style="note"}

出力：

```text
Unconfined      : I'm working in thread main
main runBlocking: I'm working in thread main
Unconfined      : After delay in thread kotlinx.coroutines.DefaultExecutor
main runBlocking: After delay in thread main
```

<!--- TEST LINES_START -->

このように、`runBlocking {...}` から継承されたコンテキストを持つコルーチンは `main` スレッドで実行を続けますが、非限定（Unconfined）のものは [delay] 関数が使用しているデフォルトのエグゼキュータースレッドで再開されます。

> 非限定ディスパッチャは、コルーチン内の一部の操作をすぐに実行する必要があるため、後で実行するためのディスパッチが必要ない、あるいは望ましくない副作用を生むような特定の特殊なケースで役立つ高度なメカニズムです。非限定ディスパッチャは、一般的なコードでは使用すべきではありません。
>
{style="note"}

## コルーチンとスレッドのデバッグ {id="debugging-coroutines-and-threads"}

コルーチンはあるスレッドで中断し、別のスレッドで再開することができます。シングルスレッドのディスパッチャであっても、特別なツールがなければ、コルーチンが「いつ」「どこで」「何を」していたのかを把握するのは難しい場合があります。

### IntelliJ IDEA でのデバッグ {id="debugging-with-idea"}

Kotlin プラグインのコルーチンデバッガーは、IntelliJ IDEA でのコルーチンのデバッグを簡素化します。

> デバッグは、`kotlinx-coroutines-core` のバージョン 1.3.8 以降で動作します。
>
{style="note"}

**Debug** ツールウィンドウには **Coroutines** タブがあります。このタブでは、現在実行中のコルーチンと中断されたコルーチンの両方の情報を確認できます。コルーチンは、実行されているディスパッチャごとにグループ化されています。

![コルーチンのデバッグ](coroutine-idea-debugging-1.png){width=700}

コルーチンデバッガーを使用すると、以下のことが可能です：
* 各コルーチンの状態を確認する。
* 実行中および中断されたコルーチンの両方について、ローカル変数およびキャプチャされた変数の値を確認する。
* コルーチンの完全な作成スタック、およびコルーチン内のコールスタックを確認する。スタックには、標準のデバッグでは失われてしまうような変数値を含むすべてのフレームが含まれます。
* 各コルーチンの状態とそのスタックを含む完全なレポートを取得する。取得するには、**Coroutines** タブ内を右クリックし、**Get Coroutines Dump** をクリックします。

コルーチンのデバッグを開始するには、ブレークポイントを設定し、デバッグモードでアプリケーションを実行するだけです。

コルーチンのデバッグに関する詳細は、[チュートリアル](https://kotlinlang.org/docs/tutorials/coroutines/debug-coroutines-with-idea.html) を参照してください。

### ログを使用したデバッグ {id="debugging-using-logging"}

コルーチンデバッガーを使わずにスレッドを使用するアプリケーションをデバッグするもう一つの方法は、各ログステートメントでログファイルにスレッド名を出力することです。この機能は、ロギングフレームワークによって広くサポートされています。コルーチンを使用する場合、スレッド名だけでは十分なコンテキストが得られないため、`kotlinx.coroutines` にはそれを容易にするためのデバッグ機能が含まれています。

`-Dkotlinx.coroutines.debug` JVM オプションを指定して、次のコードを実行してください：

```kotlin
import kotlinx.coroutines.*

fun log(msg: String) = println("[${Thread.currentThread().name}] $msg")

fun main() = runBlocking<Unit> {
//sampleStart
    val a = async {
        log("I'm computing a piece of the answer")
        6
    }
    val b = async {
        log("I'm computing another piece of the answer")
        7
    }
    log("The answer is ${a.await() * b.await()}")
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-03.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-03.kt) から入手できます。
>
{style="note"}

ここには3つのコルーチンがあります。`runBlocking` 内のメインコルーチン（#1）と、遅延値 `a`（#2）および `b`（#3）を計算する2つのコルーチンです。これらはすべて `runBlocking` のコンテキストで実行されており、メインスレッドに限定されています。このコードの出力は次のようになります：

```text
[main @coroutine#2] I'm computing a piece of the answer
[main @coroutine#3] I'm computing another piece of the answer
[main @coroutine#1] The answer is 42
```

<!--- TEST FLEXIBLE_THREAD -->

`log` 関数は角括弧内にスレッド名を出力しますが、デバッグモードがオンの場合、`main` スレッドの名前に現在実行中のコルーチンの識別子が追加されているのがわかります。この識別子は、デバッグモードがオンのときに、作成されたすべてのコルーチンに連続して割り当てられます。

> デバッグモードは、JVM が `-ea` オプションで実行されたときにもオンになります。デバッグ機能の詳細については、[DEBUG_PROPERTY_NAME] プロパティのドキュメントを参照してください。
>
{style="note"}

## スレッド間のジャンプ {id="jumping-between-threads"}

`-Dkotlinx.coroutines.debug` JVM オプションを指定して、次のコードを実行してください（[デバッグ](#debugging-coroutines-and-threads) を参照）：

```kotlin
import kotlinx.coroutines.*

fun log(msg: String) = println("[${Thread.currentThread().name}] $msg")

fun main() {
    newSingleThreadContext("Ctx1").use { ctx1 ->
        newSingleThreadContext("Ctx2").use { ctx2 ->
            runBlocking(ctx1) {
                log("Started in ctx1")
                withContext(ctx2) {
                    log("Working in ctx2")
                }
                log("Back to ctx1")
            }
        }
    }
}
```
<!--- KNIT example-context-04.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-04.kt) から入手できます。
>
{style="note"}

上記の例は、コルーチンの使用における新しい手法を示しています。

1つ目の手法は、特定のコンテキストを指定して [runBlocking] を使用する方法です。
2つ目の手法は、[withContext] を呼び出すことです。これは現在のコルーチンを中断し、新しいコンテキストに切り替える場合があります（新しいコンテキストが既存のものと異なる場合）。具体的には、別の [CoroutineDispatcher] を指定すると、追加のディスパッチが必要になります。ブロックは新しいディスパッチャ上でスケジュールされ、終了すると実行は元のディスパッチャに戻ります。

その結果、上記のコードの出力は次のようになります：

```text
[Ctx1 @coroutine#1] Started in ctx1
[Ctx2 @coroutine#1] Working in ctx2
[Ctx1 @coroutine#1] Back to ctx1
```

<!--- TEST -->

上記の例では、Kotlin 標準ライブラリの `use` 関数を使用して、[newSingleThreadContext] で作成されたスレッドリソースが不要になったときに適切に解放されるようにしています。

## コンテキスト内の Job {id="job-in-the-context"}

コルーチンの [Job] はそのコンテキストの一部であり、`coroutineContext[Job]` 式を使用してコンテキストから取得できます：

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
//sampleStart
    println("My job is ${coroutineContext[Job]}")
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-05.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-05.kt) から入手できます。
> 
{style="note"}

[デバッグモード](#debugging-coroutines-and-threads) では、次のように出力されます：

```
My job is "coroutine#1":BlockingCoroutine{Active}@6d311334
```

<!--- TEST lines.size == 1 && lines[0].startsWith("My job is \"coroutine#1\":BlockingCoroutine{Active}@") -->

[CoroutineScope] の [isActive] は、`coroutineContext[Job]?.isActive == true` の便利なショートカットに過ぎないことに注意してください。

## コルーチンの子 {id="children-of-a-coroutine"}

あるコルーチンが別のコルーチンの [CoroutineScope] で起動されると、[CoroutineScope.coroutineContext] を介してそのコンテキストを継承し、新しいコルーチンの [Job] は親コルーチンのジョブの *子* になります。親コルーチンがキャンセルされると、そのすべての子も再帰的にキャンセルされます。

しかし、この親子関係は、次の2つの方法のいずれかで明示的にオーバーライドできます：

1. コルーチンを起動するときに別のスコープを明示的に指定した場合（例えば `GlobalScope.launch`）、親スコープから `Job` を継承しません。
2. 新しいコルーチンのコンテキストとして別の `Job` オブジェクトを渡した場合（下の例を参照）、それは親スコープの `Job` をオーバーライドします。

どちらの場合も、起動されたコルーチンはそれが起動されたスコープに紐付けられず、独立して動作します。

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
//sampleStart
    // 何らかの着信リクエストを処理するためにコルーチンを起動します
    val request = launch {
        // 2つの他のジョブを生成します
        launch(Job()) { 
            println("job1: I run in my own Job and execute independently!")
            delay(1000)
            println("job1: I am not affected by cancellation of the request")
        }
        // もう一方は親のコンテキストを継承します
        launch {
            delay(100)
            println("job2: I am a child of the request coroutine")
            delay(1000)
            println("job2: I will not execute this line if my parent request is cancelled")
        }
    }
    delay(500)
    request.cancel() // リクエストの処理をキャンセルします
    println("main: Who has survived request cancellation?")
    delay(1000) // 何が起こるか確認するためにメインスレッドを1秒遅らせます
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-06.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-06.kt) から入手できます。
>
{style="note"}

このコードの出力は次のようになります：

```text
job1: I run in my own Job and execute independently!
job2: I am a child of the request coroutine
main: Who has survived request cancellation?
job1: I am not affected by cancellation of the request
```

<!--- TEST -->

## 親の責任 {id="parental-responsibilities"}

親コルーチンは常に、そのすべての子の完了を待ちます。親は起動したすべての子を明示的に追跡する必要はなく、最後にそれらを待つために [Job.join] を使用する必要もありません。

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
//sampleStart
    // 何らかの着信リクエストを処理するためにコルーチンを起動します
    val request = launch {
        repeat(3) { i -> // 数個の子ジョブを起動します
            launch  {
                delay((i + 1) * 200L) // 200ms, 400ms, 600ms の可変遅延
                println("Coroutine $i is done")
            }
        }
        println("request: I'm done and I don't explicitly join my children that are still active")
    }
    request.join() // すべての子を含むリクエストの完了を待ちます
    println("Now processing of the request is complete")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-07.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-07.kt) から入手できます。
>
{style="note"}

結果は次のようになります：

```text
request: I'm done and I don't explicitly join my children that are still active
Coroutine 0 is done
Coroutine 1 is done
Coroutine 2 is done
Now processing of the request is complete
```

<!--- TEST -->

## デバッグのためのコルーチンの命名 {id="naming-coroutines-for-debugging"}

自動的に割り当てられる ID は、コルーチンが頻繁にログを出力し、同じコルーチンからのログ記録を関連付けるだけでよい場合には適しています。しかし、コルーチンが特定のリクエストの処理や特定のバックグラウンドタスクの実行に紐付けられている場合は、デバッグのために明示的に名前を付ける方が良いでしょう。[CoroutineName] コンテキスト要素は、スレッド名と同じ目的を果たします。これは、[デバッグモード](#debugging-coroutines-and-threads) がオンのときに、このコルーチンを実行しているスレッド名に含まれます。

次の例はこの概念を示しています：

```kotlin
import kotlinx.coroutines.*

fun log(msg: String) = println("[${Thread.currentThread().name}] $msg")

fun main() = runBlocking(CoroutineName("main")) {
//sampleStart
    log("Started main coroutine")
    // 2つのバックグラウンド計算を実行します
    val v1 = async(CoroutineName("v1coroutine")) {
        delay(500)
        log("Computing v1")
        6
    }
    val v2 = async(CoroutineName("v2coroutine")) {
        delay(1000)
        log("Computing v2")
        7
    }
    log("The answer for v1 * v2 = ${v1.await() * v2.await()}")
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-08.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-08.kt) から入手できます。
>
{style="note"}

`-Dkotlinx.coroutines.debug` JVM オプションを使用して出力される内容は、以下のようになります：

```text
[main @main#1] Started main coroutine
[main @v1coroutine#2] Computing v1
[main @v2coroutine#3] Computing v2
[main @main#1] The answer for v1 * v2 = 42
```

<!--- TEST FLEXIBLE_THREAD -->

## コンテキスト要素の組み合わせ {id="combining-context-elements"}

時には、コルーチンコンテキストに対して複数の要素を定義する必要があります。そのために `+` 演算子を使用できます。例えば、明示的に指定されたディスパッチャと明示的に指定された名前を同時に指定してコルーチンを起動できます：

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
//sampleStart
    launch(Dispatchers.Default + CoroutineName("test")) {
        println("I'm working in thread ${Thread.currentThread().name}")
    }
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-09.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-09.kt) から入手できます。
>
{style="note"}

`-Dkotlinx.coroutines.debug` JVM オプションを使用したこのコードの出力は次のようになります：

```text
I'm working in thread DefaultDispatcher-worker-1 @test#2
```

<!--- TEST FLEXIBLE_THREAD -->

## コルーチンスコープ {id="coroutine-scope"}

コンテキスト、子、ジョブに関する知識をまとめましょう。アプリケーションにライフサイクルを持つオブジェクトがあるが、そのオブジェクト自体がコルーチンではない場合を想定します。例えば、Android アプリケーションを作成しており、Android アクティビティのコンテキストでさまざまなコルーチンを起動して、データの取得や更新、アニメーションなどの非同期操作を実行しているとします。これらのコルーチンは、メモリリークを避けるためにアクティビティが破棄されるときにキャンセルされなければなりません。

もちろん、コンテキストとジョブを個別に操作して、アクティビティとそのコルーチンのライフサイクルを紐付けることもできますが、`kotlinx.coroutines` はそれをカプセル化した抽象化として [CoroutineScope] を提供しています。すべてのコルーチンビルダーがその拡張として宣言されているため、コルーチンスコープにはすでに慣れているはずです。

アクティビティのライフサイクルに紐付いた [CoroutineScope] のインスタンスを作成することで、コルーチンのライフサイクルを管理します。`CoroutineScope` インスタンスは、[CoroutineScope()] または [MainScope()] ファクトリ関数によって作成できます。前者は汎用的なスコープを作成し、後者は UI アプリケーション用のスコープを作成して [Dispatchers.Main] をデフォルトのディスパッチャとして使用します：

```kotlin
class Activity {
    private val mainScope = MainScope()
    
    fun destroy() {
        mainScope.cancel()
    }
    // つづく ...
```

これで、定義された `mainScope` を使用して、この `Activity` のスコープ内でコルーチンを起動できます。デモとして、異なる時間だけ遅延する10個のコルーチンを起動します：

```kotlin
    // Activity クラスのつづき
    fun doSomething() {
        // デモのために、それぞれ異なる時間動作する10個のコルーチンを起動します
        repeat(10) { i ->
            mainScope.launch {
                delay((i + 1) * 200L) // 200ms, 400ms, ... などの可変遅延
                println("Coroutine $i is done")
            }
        }
    }
} // Activity クラス終了
``` 

メイン関数でアクティビティを作成し、テスト用の `doSomething` 関数を呼び出し、500ms 後にアクティビティを破棄します。これにより、`doSomething` から起動されたすべてのコルーチンがキャンセルされます。アクティビティの破棄後は、もう少し待機してもメッセージが出力されなくなることから、それが確認できます。

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*

class Activity {
    private val mainScope = CoroutineScope(Dispatchers.Default) // テスト目的で Default を使用します
    
    fun destroy() {
        mainScope.cancel()
    }

    fun doSomething() {
        // デモのために、それぞれ異なる時間動作する10個のコルーチンを起動します
        repeat(10) { i ->
            mainScope.launch {
                delay((i + 1) * 200L) // 200ms, 400ms, ... などの可変遅延
                println("Coroutine $i is done")
            }
        }
    }
} // Activity クラス終了

fun main() = runBlocking<Unit> {
//sampleStart
    val activity = Activity()
    activity.doSomething() // テスト関数を実行
    println("Launched coroutines")
    delay(500L) // 0.5秒待機
    println("Destroying activity!")
    activity.destroy() // すべてのコルーチンをキャンセル
    delay(1000) // 動作していないことを視覚的に確認
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-10.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-10.kt) から入手できます。
>
{style="note"}

この例の出力は次のようになります：

```text
Launched coroutines
Coroutine 0 is done
Coroutine 1 is done
Destroying activity!
```

<!--- TEST -->

見てわかる通り、最初の2つのコルーチンだけがメッセージを出力し、残りは `Activity.destroy()` 内の単一の [`mainScope.cancel()`][CoroutineScope.cancel] 呼び出しによってキャンセルされました。

> Android では、ライフサイクルを持つすべてのエンティティにおいて、コルーチンスコープのファーストパーティサポートがあることに注意してください。[対応するドキュメント](https://developer.android.com/topic/libraries/architecture/coroutines#lifecyclescope) を参照してください。
>
{style="note"}

### スレッドローカルデータ {id="thread-local-data"}

時には、スレッドローカルなデータをコルーチンに渡したり、コルーチン間で受け渡したりできると便利な場合があります。しかし、コルーチンは特定のスレッドに拘束されないため、これを手動で行うとボイラープレートコードが多くなりがちです。

[`ThreadLocal`](https://docs.oracle.com/javase/8/docs/api/java/lang/ThreadLocal.html) の場合、[asContextElement] 拡張関数が助けになります。これは、指定された `ThreadLocal` の値を保持し、コルーチンがコンテキストを切り替えるたびにそれを復元する追加のコンテキスト要素を作成します。

実際に動作を確認するのは簡単です：

```kotlin
import kotlinx.coroutines.*

val threadLocal = ThreadLocal<String?>() // スレッドローカル変数を宣言

fun main() = runBlocking<Unit> {
//sampleStart
    threadLocal.set("main")
    println("Pre-main, current thread: ${Thread.currentThread()}, thread local value: '${threadLocal.get()}'")
    val job = launch(Dispatchers.Default + threadLocal.asContextElement(value = "launch")) {
        println("Launch start, current thread: ${Thread.currentThread()}, thread local value: '${threadLocal.get()}'")
        yield()
        println("After yield, current thread: ${Thread.currentThread()}, thread local value: '${threadLocal.get()}'")
    }
    job.join()
    println("Post-main, current thread: ${Thread.currentThread()}, thread local value: '${threadLocal.get()}'")
//sampleEnd    
}
```  
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-11.kt -->
> 完全なコードは [こちら](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-11.kt) から入手できます。
>
{style="note"}

この例では、[Dispatchers.Default] を使用してバックグラウンドスレッドプールで新しいコルーチンを起動しています。そのため、スレッドプールの異なるスレッドで動作しますが、コルーチンがどのスレッドで実行されていても、`threadLocal.asContextElement(value = "launch")` を使用して指定したスレッドローカル変数の値を保持し続けます。
したがって、（[デバッグ](#debugging-coroutines-and-threads) ありの）出力は次のようになります：

```text
Pre-main, current thread: Thread[main @coroutine#1,5,main], thread local value: 'main'
Launch start, current thread: Thread[DefaultDispatcher-worker-1 @coroutine#2,5,main], thread local value: 'launch'
After yield, current thread: Thread[DefaultDispatcher-worker-2 @coroutine#2,5,main], thread local value: 'launch'
Post-main, current thread: Thread[main @coroutine#1,5,main], thread local value: 'main'
```

<!--- TEST FLEXIBLE_THREAD -->

対応するコンテキスト要素の設定を忘れがちです。コルーチンを実行しているスレッドが異なる場合、コルーチンからアクセスされたスレッドローカル変数は予期しない値を持つ可能性があります。このような状況を避けるために、[ensurePresent] メソッドを使用して、不適切な使用に対してフェイルファスト（即座に失敗）させることが推奨されます。

`ThreadLocal` は第一級のサポートを受けており、`kotlinx.coroutines` が提供するあらゆるプリミティブと共に使用できます。ただし、1つの重要な制限があります。スレッドローカルが変更されたとき、新しい値はコルーチンの呼び出し元に伝播されません（コンテキスト要素がすべての `ThreadLocal` オブジェクトへのアクセスを追跡できないため）。また、更新された値は次の中断時に失われます。コルーチン内でスレッドローカルの値を更新するには [withContext] を使用してください。詳細は [asContextElement] を参照してください。

あるいは、`class Counter(var i: Int)` のようなミュータブルなボックスに値を格納し、それをスレッドローカル変数に格納することも可能です。ただし、この場合、このミュータブルなボックス内の変数に対する潜在的な同時修正の同期は、すべて開発者の責任となります。

高度な使用法（例：MDC ロギング、トランザクションコンテキスト、または内部でデータ受け渡しにスレッドローカルを使用するその他のライブラリとの統合）については、実装すべき [ThreadContextElement] インターフェースのドキュメントを参照してください。

<!--- MODULE kotlinx-coroutines-core -->
<!--- INDEX kotlinx.coroutines -->

[Job]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/index.html
[CoroutineDispatcher]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-dispatcher/index.html
[launch]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html
[async]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html
[CoroutineScope]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/index.html
[Dispatchers.Unconfined]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-unconfined.html
[Dispatchers.Default]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-default.html
[newSingleThreadContext]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/new-single-thread-context.html
[ExecutorCoroutineDispatcher.close]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-executor-coroutine-dispatcher/close.html
[runBlocking]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/run-blocking.html
[delay]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/delay.html
[DEBUG_PROPERTY_NAME]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-d-e-b-u-g_-p-r-o-p-e-r-t-y_-n-a-m-e.html
[withContext]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-context.html
[isActive]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/is-active.html
[CoroutineScope.coroutineContext]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/coroutine-context.html
[Job.join]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/join.html
[CoroutineName]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-name/index.html
[CoroutineScope()]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope.html
[MainScope()]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-main-scope.html
[Dispatchers.Main]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-main.html
[CoroutineScope.cancel]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/cancel.html
[asContextElement]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/as-context-element.html
[ensurePresent]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/ensure-present.html
[ThreadContextElement]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-thread-context-element/index.html

<!--- END -->