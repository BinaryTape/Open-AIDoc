<!--- TEST_NAME DispatcherGuideTest -->
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: コルーチンコンテキストとディスパッチャ)

コルーチンは常に、Kotlin標準ライブラリで定義されている
[CoroutineContext](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.coroutines/-coroutine-context/)
型の値によって表される何らかのコンテキストの中で実行されます。

コルーチンコンテキストは様々な要素の集合です。主な要素は、これまで見てきたコルーチンの [Job] と、本セクションで扱うディスパッチャです。

## ディスパッチャとスレッド {id="dispatchers-and-threads"}

コルーチンコンテキストには、対応するコルーチンの実行にどのスレッド（または複数のスレッド）を使用するかを決定する *コルーチンディスパッチャ*（[CoroutineDispatcher] を参照）が含まれています。コルーチンディスパッチャは、コルーチンの実行を特定のスレッドに限定したり、スレッドプールにディスパッチしたり、特定の制限なしに実行（unconfined）させたりすることができます。

[launch] や [async] などのすべてのコルーチンビルダーは、新しいコルーチンのディスパッチャやその他のコンテキスト要素を明示的に指定するために使用できる、任意の
[CoroutineContext](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.coroutines/-coroutine-context/)
パラメータを受け取ります。

以下の例を試してみましょう。

```kotlin
import kotlinx.coroutines.*

//sampleStart
fun main() = runBlocking<Unit> {
    launch { // 親である main runBlocking コルーチンのコンテキスト
        println("main runBlocking      : I'm working in thread ${Thread.currentThread().name}")
    }
    launch(Dispatchers.Unconfined) { // 限定されない -- main スレッドで動作する
        println("Unconfined            : I'm working in thread ${Thread.currentThread().name}")
    }
    launch(Dispatchers.Default) { // DefaultDispatcher にディスパッチされる
        println("Default               : I'm working in thread ${Thread.currentThread().name}")
    }
    launch(newSingleThreadContext("MyOwnThread")) { // 独自の新しいスレッドを取得する
        println("newSingleThreadContext: I'm working in thread ${Thread.currentThread().name}")
    }
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-01.kt -->
> 完全なコードは[ここ](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-01.kt)から取得できます。
>
{style="note"}

次のような出力が生成されます（順序は異なる場合があります）：

```text
Unconfined            : I'm working in thread main
Default               : I'm working in thread DefaultDispatcher-worker-1
newSingleThreadContext: I'm working in thread MyOwnThread
main runBlocking      : I'm working in thread main
```

<!--- TEST LINES_START_UNORDERED -->

パラメータなしで `launch { ... }` を使用すると、起動元となる [CoroutineScope] からコンテキスト（したがってディスパッチャ）を継承します。この場合、`main` スレッドで実行されるメインの `runBlocking` コルーチンのコンテキストを継承します。

[Dispatchers.Unconfined] は、一見 `main` スレッドで実行されているように見える特殊なディスパッチャですが、実際には後で説明する異なるメカニズムです。

デフォルトのディスパッチャは、スコープ内で他のディスパッチャが明示的に指定されていない場合に使用されます。[Dispatchers.Default] によって表され、バックグラウンドの共有スレッドプールを使用します。
  
[newSingleThreadContext] は、コルーチンが実行されるためのスレッドを作成します。専用スレッドは非常にコストの高いリソースです。実際のアプリケーションでは、不要になったときに [close][ExecutorCoroutineDispatcher.close] 関数を使用して解放するか、トップレベル変数に保持してアプリケーション全体で再利用する必要があります。

## Unconfined vs confined ディスパッチャ {id="unconfined-vs-confined-dispatcher"}
 
[Dispatchers.Unconfined] コルーチンディスパッチャは、呼び出し元のスレッドでコルーチンを開始しますが、最初のサスペンドポイント（中断点）までしかそのスレッドで実行されません。中断後、呼び出されたサスペンド関数によって完全に決定されたスレッドでコルーチンが再開されます。Unconfined ディスパッチャは、CPU時間を消費せず、特定のスレッドに限定された共有データ（UIなど）を更新しないコルーチンに適しています。

一方、ディスパッチャはデフォルトで外側の [CoroutineScope] から継承されます。特に [runBlocking] コルーチンのデフォルトディスパッチャは呼び出し側のスレッドに限定されているため、これを継承すると予測可能なFIFOスケジューリングでこのスレッドに実行を限定する効果があります。

```kotlin
import kotlinx.coroutines.*

//sampleStart
fun main() = runBlocking<Unit> {
    launch(Dispatchers.Unconfined) { // 限定されない -- main スレッドで動作する
        println("Unconfined      : I'm working in thread ${Thread.currentThread().name}")
        delay(500)
        println("Unconfined      : After delay in thread ${Thread.currentThread().name}")
    }
    launch { // 親である main runBlocking コルーチンのコンテキスト
        println("main runBlocking: I'm working in thread ${Thread.currentThread().name}")
        delay(1000)
        println("main runBlocking: After delay in thread ${Thread.currentThread().name}")
    }
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-02.kt -->
> 完全なコードは[ここ](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-02.kt)から取得できます。
>
{style="note"}

以下の出力が生成されます：
 
```text
Unconfined      : I'm working in thread main
main runBlocking: I'm working in thread main
Unconfined      : After delay in thread kotlinx.coroutines.DefaultExecutor
main runBlocking: After delay in thread main
```

<!--- TEST LINES_START -->
 
このように、`runBlocking {...}` からコンテキストを継承したコルーチンは `main` スレッドで実行を継続しますが、unconfined なコルーチンは [delay] 関数が使用しているデフォルトのエグゼキュータースレッドで再開されます。

> Unconfined ディスパッチャは高度なメカニズムであり、コルーチン内の一部の操作をすぐに実行する必要があるため、後で実行するためにコルーチンをディスパッチすることが不要であったり、望ましくない副作用を生み出したりする特定の特殊なケース（コーナーケース）で役立ちます。Unconfined ディスパッチャは一般的なコードでは使用すべきではありません。
>
{style="note"}

## コルーチンとスレッドのデバッグ {id="debugging-coroutines-and-threads"}

コルーチンはあるスレッドで中断し、別のスレッドで再開することができます。専用のツールがない場合、シングルスレッドのディスパッチャであっても、コルーチンが「何を、どこで、いつ」行っていたのかを把握するのは難しい場合があります。

### IDEA を使用したデバッグ {id="debugging-with-idea"}

Kotlin プラグインのコルーチンデバッガー（Coroutine Debugger）を使用すると、IntelliJ IDEA でのコルーチンのデバッグが簡単になります。

> デバッグは `kotlinx-coroutines-core` のバージョン 1.3.8 以降で動作します。
>
{style="note"}

**Debug** ツールウィンドウには **Coroutines** タブがあります。このタブでは、現在実行中のコルーチンとサスペンド（中断）中のコルーチンの両方に関する情報を確認できます。コルーチンは、実行されているディスパッチャごとにグループ化されます。

![コルーチンのデバッグ](coroutine-idea-debugging-1.png){width=700}

コルーチンデバッガーを使用すると、以下のことが可能です：
* 各コルーチンの状態を確認する。
* 実行中およびサスペンド中の両方のコルーチンについて、ローカル変数およびキャプチャされた変数の値を確認する。
* 完全なコルーチン生成スタックと、コルーチン内部のコールスタックを確認する。スタックには変数値を含むすべてのフレームが含まれ、通常のデバッグでは失われるような情報も保持されます。
* 各コルーチンの状態とそのスタックを含む完全なレポートを取得する。取得するには、**Coroutines** タブ内を右クリックし、**Get Coroutines Dump** をクリックします。

コルーチンのデバッグを開始するには、ブレークポイントを設定してアプリケーションをデバッグモードで実行するだけです。

コルーチンのデバッグに関する詳細は、[チュートリアル](https://kotlinlang.org/docs/tutorials/coroutines/debug-coroutines-with-idea.html)を参照してください。

### ロギングを使用したデバッグ {id="debugging-using-logging"}

Coroutine Debugger を使用せずにスレッドを使ったアプリケーションをデバッグするもう 1 つのアプローチは、各ログステートメントでログファイルにスレッド名を出力することです。この機能は、ロギングフレームワークで一般的にサポートされています。コルーチンを使用する場合、スレッド名だけではあまり多くのコンテキストが得られないため、`kotlinx.coroutines` にはこれを容易にするデバッグ機能が含まれています。

`-Dkotlinx.coroutines.debug` JVM オプションを付けて以下のコードを実行してください：

```kotlin
import kotlinx.coroutines.*

fun log(msg: String) = println("[${Thread.currentThread().name}] $msg")

//sampleStart
fun main() = runBlocking<Unit> {
    val a = async {
        log("I'm computing a piece of the answer")
        6
    }
    val b = async {
        log("I'm computing another piece of the answer")
        7
    }
    log("The answer is ${a.await() * b.await()}")
}
//sampleEnd    
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-03.kt -->
> 完全なコードは[ここ](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-03.kt)から取得できます。
>
{style="note"}

ここには 3 つのコルーチンがあります。`runBlocking` の内部にあるメインコルーチン（#1）と、遅延値（deferred value）`a`（#2）および `b`（#3）を計算する 2 つのコルーチンです。これらはすべて `runBlocking` のコンテキストで実行され、main スレッドに限定されています。このコードの出力は次のようになります：

```text
[main @coroutine#2] I'm computing a piece of the answer
[main @coroutine#3] I'm computing another piece of the answer
[main @coroutine#1] The answer is 42
```

<!--- TEST FLEXIBLE_THREAD -->

`log` 関数は角括弧内にスレッド名を出力しており、それが `main` スレッドであり、現在実行中のコルーチンの識別子が付加されていることが確認できます。この識別子は、デバッグモードがオンの場合、作成されたすべてのコルーチンに連番で割り当てられます。

> デバッグモードは、JVM を `-ea` オプションで実行したときにもオンになります。
> デバッグ機能の詳細については、[DEBUG_PROPERTY_NAME] プロパティのドキュメントを参照してください。
>
{style="note"}

## スレッド間の移動 {id="jumping-between-threads"}

`-Dkotlinx.coroutines.debug` JVM オプションを付けて以下のコードを実行してください（[デバッグ](#debugging-coroutines-and-threads)を参照）：

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
> 完全なコードは[ここ](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-04.kt)から取得できます。
>
{style="note"}

上記の例は、コルーチンの使用における新しいテクニックを示しています。

最初のテクニックは、指定されたコンテキストで [runBlocking] を使用する方法を示しています。
2 番目のテクニックは、現在のコルーチンを中断して新しいコンテキストに切り替える可能性のある [withContext] の呼び出しを含んでいます（新しいコンテキストが既存のコンテキストと異なる場合）。
具体的には、異なる [CoroutineDispatcher] を指定すると、追加のディスパッチが必要になります。ブロックは新しいディスパッチャ上でスケジュールされ、終了すると実行は元のディスパッチャに戻ります。

結果として、上記のコードの出力は次のようになります：

```text
[Ctx1 @coroutine#1] Started in ctx1
[Ctx2 @coroutine#1] Working in ctx2
[Ctx1 @coroutine#1] Back to ctx1
```

<!--- TEST -->

上記の例では、Kotlin 標準ライブラリの `use` 関数を使用して、不要になった [newSingleThreadContext] によって作成されたスレッドリソースを適切に解放しています。

## コンテキスト内の Job {id="job-in-the-context"}

コルーチンの [Job] はそのコンテキストの一部であり、`coroutineContext[Job]` という式を使用してコンテキストから取得できます。

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
> 完全なコードは[ここ](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-05.kt)から取得できます。
> 
{style="note"}

[デバッグモード](#debugging-coroutines-and-threads)では、以下のような出力が得られます：

```
My job is "coroutine#1":BlockingCoroutine{Active}@6d311334
```

<!--- TEST lines.size == 1 && lines[0].startsWith("My job is \"coroutine#1\":BlockingCoroutine{Active}@") -->

[CoroutineScope] の [isActive] は、単に `coroutineContext[Job]?.isActive == true` の便利なショートカットであることに注意してください。

## コルーチンの子（Children） {id="children-of-a-coroutine"}

あるコルーチンが別のコルーチンの [CoroutineScope] 内で起動されると、[CoroutineScope.coroutineContext] を介してそのコンテキストを継承し、新しいコルーチンの [Job] は親コルーチンの Job の *子（child）* になります。親コルーチンがキャンセルされると、そのすべての子も再帰的にキャンセルされます。

ただし、この親子関係は、次の 2 つの方法のいずれかで明示的にオーバーライドできます：

1. コルーチンを起動する際に別のスコープが明示的に指定された場合（例えば `GlobalScope.launch`）、親スコープから `Job` を継承しません。
2. 新しいコルーチンのコンテキストとして別の `Job` オブジェクトが渡された場合（以下の例に示すように）、親スコープの `Job` をオーバーライドします。
   
どちらの場合も、起動されたコルーチンはそれが起動されたスコープに縛られず、独立して動作します。

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
//sampleStart
    // 何らかの受信リクエストを処理するためにコルーチンを起動する
    val request = launch {
        // 他に2つのジョブを生成する
        launch(Job()) { 
            println("job1: I run in my own Job and execute independently!")
            delay(1000)
            println("job1: I am not affected by cancellation of the request")
        }
        // もう一方は親のコンテキストを継承する
        launch {
            delay(100)
            println("job2: I am a child of the request coroutine")
            delay(1000)
            println("job2: I will not execute this line if my parent request is cancelled")
        }
    }
    delay(500)
    request.cancel() // リクエストの処理をキャンセルする
    println("main: Who has survived request cancellation?")
    delay(1000) // 何が起こるかを確認するために main スレッドを1秒遅延させる
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-06.kt -->
> 完全なコードは[ここ](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-06.kt)から取得できます。
>
{style="note"}

このコードの出力は次のとおりです：

```text
job1: I run in my own Job and execute independently!
job2: I am a child of the request coroutine
main: Who has survived request cancellation?
job1: I am not affected by cancellation of the request
```

<!--- TEST -->

## 親の責務 {id="parental-responsibilities"}

親コルーチンは、常にすべての子の完了を待ちます。親は起動したすべての子を明示的に追跡する必要はなく、最後にそれらを待つために [Job.join] を使用する必要もありません。

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
//sampleStart
    // 何らかの受信リクエストを処理するためにコルーチンを起動する
    val request = launch {
        repeat(3) { i -> // いくつかの子ジョブを起動する
            launch  {
                delay((i + 1) * 200L) // 200ms、400ms、600ms と異なる遅延
                println("Coroutine $i is done")
            }
        }
        println("request: I'm done and I don't explicitly join my children that are still active")
    }
    request.join() // すべての子を含むリクエストの完了を待つ
    println("Now processing of the request is complete")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-07.kt -->
> 完全なコードは[ここ](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-07.kt)から取得できます。
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

自動的に割り当てられる ID は、コルーチンが頻繁にログを出力し、同じコルーチンからのログレコードを相互に関連付けるだけでよい場合には便利です。しかし、コルーチンが特定のリクエストの処理に関連付けられている場合や、特定のバックグラウンドタスクを実行している場合は、デバッグのために明示的に名前を付ける方が適しています。[CoroutineName] コンテキスト要素は、スレッド名と同じ目的を果たします。[デバッグモード](#debugging-coroutines-and-threads)がオンになっている場合、このコルーチンを実行しているスレッド名に含まれます。

次の例はこの概念を示しています：

```kotlin
import kotlinx.coroutines.*

fun log(msg: String) = println("[${Thread.currentThread().name}] $msg")

fun main() = runBlocking(CoroutineName("main")) {
//sampleStart
    log("Started main coroutine")
    // 2つのバックグラウンド値計算を実行する
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
> 完全なコードは[ここ](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-08.kt)から取得できます。
>
{style="note"}

`-Dkotlinx.coroutines.debug` JVM オプションを付けて実行したときに生成される出力は、以下のようになります：
 
```text
[main @main#1] Started main coroutine
[main @v1coroutine#2] Computing v1
[main @v2coroutine#3] Computing v2
[main @main#1] The answer for v1 * v2 = 42
```

<!--- TEST FLEXIBLE_THREAD -->

## コンテキスト要素の結合 {id="combining-context-elements"}

コルーチンコンテキストに対して複数の要素を定義する必要がある場合があります。その場合は `+` 演算子を使用できます。例えば、明示的に指定されたディスパッチャと明示的に指定された名前を同時に持つコルーチンを起動できます：

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
> 完全なコードは[ここ](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-09.kt)から取得できます。
>
{style="note"}

`-Dkotlinx.coroutines.debug` JVM オプションを付けたこのコードの出力は次のとおりです：

```text
I'm working in thread DefaultDispatcher-worker-1 @test#2
```

<!--- TEST FLEXIBLE_THREAD -->

## コルーチンスコープ {id="coroutine-scope"}

コンテキスト、子、ジョブに関する知識をまとめてみましょう。
アプリケーションにライフサイクルを持つオブジェクトがあるものの、そのオブジェクト自体はコルーチンではないと仮定します。例えば、Android アプリケーションを作成しており、データの取得や更新、アニメーションの実行などの非同期処理を行うために、Android Activity のコンテキストで様々なコルーチンを起動しているとします。これらのコルーチンは、メモリリークを避けるために Activity が破棄されたときにキャンセルされる必要があります。もちろん、Activity とそのコルーチンのライフサイクルを結びつけるために手動でコンテキストやジョブを操作することもできますが、`kotlinx.coroutines` はそれをカプセル化した抽象化である [CoroutineScope] を提供しています。すべてのコルーチンビルダーはその拡張として宣言されているため、コルーチンスコープにはすでになじみがあるはずです。

Activity のライフサイクルに紐づく [CoroutineScope] のインスタンスを作成することで、コルーチンのライフサイクルを管理します。`CoroutineScope` インスタンスは、[CoroutineScope()] または [MainScope()] ファクトリ関数によって作成できます。前者は汎用的なスコープを作成し、後者は UI アプリケーション用のスコープを作成してデフォルトのディスパッチャとして [Dispatchers.Main] を使用します：

```kotlin
class Activity {
    private val mainScope = MainScope()
    
    fun destroy() {
        mainScope.cancel()
    }
    // つづく ...
```

これで、定義した `mainScope` を使用して、この `Activity` のスコープ内でコルーチンを起動できます。デモのために、異なる時間遅延する 10 個のコルーチンを起動します：

```kotlin
    // class Activity の続き
    fun doSomething() {
        // デモのために10個のコルーチンを起動し、それぞれ異なる時間動作させる
        repeat(10) { i ->
            mainScope.launch {
                delay((i + 1) * 200L) // 200ms、400ms、... などの異なる遅延
                println("Coroutine $i is done")
            }
        }
    }
} // class Activity の終了
``` 

main 関数で Activity を作成し、テスト用の `doSomething` 関数を呼び出し、500ms 後に Activity を破棄します。これにより、`doSomething` から起動されたすべてのコルーチンがキャンセルされます。Activity の破棄後は、もう少し待ってもメッセージが出力されなくなることから、それが確認できます。

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*

class Activity {
    private val mainScope = CoroutineScope(Dispatchers.Default) // テスト目的で Default を使用
    
    fun destroy() {
        mainScope.cancel()
    }

    fun doSomething() {
        // デモのために10個のコルーチンを起動し、それぞれ異なる時間動作させる
        repeat(10) { i ->
            mainScope.launch {
                delay((i + 1) * 200L) // 200ms、400ms、... などの異なる遅延
                println("Coroutine $i is done")
            }
        }
    }
} // class Activity の終了

fun main() = runBlocking<Unit> {
//sampleStart
    val activity = Activity()
    activity.doSomething() // テスト関数を実行
    println("Launched coroutines")
    delay(500L) // 0.5秒遅延
    println("Destroying activity!")
    activity.destroy() // すべてのコルーチンをキャンセル
    delay(1000) // コルーチンが動いていないことを視覚的に確認
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-10.kt -->
> 完全なコードは[ここ](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-10.kt)から取得できます。
>
{style="note"}

この例の出力は次のとおりです：

```text
Launched coroutines
Coroutine 0 is done
Coroutine 1 is done
Destroying activity!
```

<!--- TEST -->

ご覧のとおり、最初の 2 つのコルーチンだけがメッセージを出力し、残りは `Activity.destroy()` 内の単一の [`mainScope.cancel()`][CoroutineScope.cancel] の呼び出しによってキャンセルされます。

> Android には、ライフサイクルを持つすべてのエンティティにおいてコルーチンスコープのファーストパーティサポートがあることに注意してください。[対応するドキュメント](https://developer.android.com/topic/libraries/architecture/coroutines#lifecyclescope)を参照してください。
>
{style="note"}

### スレッドローカルデータ {id="thread-local-data"}

コルーチンに対して、あるいはコルーチン間で何らかのスレッドローカルデータを渡すことができると便利な場合があります。しかし、コルーチンは特定のスレッドにバインドされていないため、これを手動で行うとボイラープレートにつながりやすくなります。

[`ThreadLocal`](https://docs.oracle.com/javase/8/docs/api/java/lang/ThreadLocal.html) のために、[asContextElement] 拡張関数が救済手段として用意されています。これは、指定された `ThreadLocal` の値を保持し、コルーチンがコンテキストを切り替えるたびにそれを復元する追加のコンテキスト要素を作成します。

実際の動作を簡単に確認できます：

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
> 完全なコードは[ここ](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-11.kt)から取得できます。
>
{style="note"}

この例では、[Dispatchers.Default] を使用してバックグラウンドスレッドプールで新しいコルーチンを起動しているため、スレッドプール内の異なるスレッドで動作しますが、コルーチンがどのスレッドで実行されていても、`threadLocal.asContextElement(value = "launch")` を使用して指定したスレッドローカル変数の値を保持しています。
したがって、出力（[デバッグ](#debugging-coroutines-and-threads)あり）は次のようになります：

```text
Pre-main, current thread: Thread[main @coroutine#1,5,main], thread local value: 'main'
Launch start, current thread: Thread[DefaultDispatcher-worker-1 @coroutine#2,5,main], thread local value: 'launch'
After yield, current thread: Thread[DefaultDispatcher-worker-2 @coroutine#2,5,main], thread local value: 'launch'
Post-main, current thread: Thread[main @coroutine#1,5,main], thread local value: 'main'
```

<!--- TEST FLEXIBLE_THREAD -->

対応するコンテキスト要素の設定を忘れてしまいがちです。その場合、コルーチンを実行しているスレッドが異なると、コルーチンからアクセスされたスレッドローカル変数が予期しない値を持つ可能性があります。このような状況を回避するには、[ensurePresent] メソッドを使用して不適切な使用に対してフェイルファスト（即座に失敗）させることが推奨されます。

`ThreadLocal` はファーストクラスのサポートを備えており、`kotlinx.coroutines` が提供するあらゆるプリミティブで使用できます。ただし、1 つの重要な制限があります。スレッドローカルが変更された場合、新しい値はコルーチンの呼び出し元に伝播されず（コンテキスト要素がすべての `ThreadLocal` オブジェクトへのアクセスを追跡することはできないため）、更新された値は次の中断時に失われます。コルーチン内でスレッドローカルの値を更新するには [withContext] を使用してください。詳細については [asContextElement] を参照してください。

あるいは、`class Counter(var i: Int)` のような可変のボックスに値を格納し、それをスレッドローカル変数に格納することもできます。ただし、この場合、この可変ボックス内の変数に対する潜在的な並行変更を同期する全責任は開発者にあります。

ロギング MDC との統合、トランザクションコンテキスト、あるいはデータ受け渡しの内部でスレッドローカルを使用するその他のライブラリなど、高度な使用法については、実装すべき [ThreadContextElement] インターフェースのドキュメントを参照してください。

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