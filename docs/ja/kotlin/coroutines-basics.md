<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: コルーチンの基本)

複数のタスクを同時に実行するアプリケーションを作成するために（この概念を「並行処理（concurrency）」と呼びます）、Kotlinは「コルーチン（coroutines）」を使用します。コルーチンとは、並行処理を行うコードを明確でシーケンシャル（逐次的）なスタイルで記述できるようにする、中断可能な計算（suspendable computation）のことです。
コルーチンは他のコルーチンと並行して実行でき、状況によっては並列（parallel）に実行することも可能です。

JVMおよびKotlin/Nativeにおいて、コルーチンのようなすべての並行処理コードは、オペレーティングシステムによって管理される「スレッド（threads）」上で実行されます。
コルーチンは、スレッドをブロックする代わりに、自身の実行を「中断（suspend）」することができます。
これにより、あるコルーチンがデータの到着を待っている間に実行を中断し、別のコルーチンを同じスレッド上で実行させることができるため、リソースを効果的に活用できます。

![Comparing parallel and concurrent threads](parallelism-and-concurrency.svg){width="700"}

コルーチンとスレッドの違いについての詳細は、[コルーチンとJVMスレッドの比較](#comparing-coroutines-and-jvm-threads)を参照してください。

## 中断関数 (Suspending functions)

コルーチンの最も基本的な構成要素は「中断関数（suspending function）」です。
これにより、実行中の操作を一時停止（ポーズ）させ、コードの構造に影響を与えることなく後で再開させることができます。

中断関数を宣言するには、`suspend` キーワードを使用します。

```kotlin
suspend fun greet() {
    println("Hello world from a suspending function")
}
```

中断関数は、他の中断関数からしか呼び出すことができません。
Kotlinアプリケーションのプログラミングの実行起点（エントリーポイント）で中断関数を呼び出すには、`main()` 関数に `suspend` キーワードを付与します。

```kotlin
suspend fun main() {
    showUserInfo()
}

suspend fun showUserInfo() {
    println("Loading user...")
    greet()
    println("User: John Smith")
}

suspend fun greet() {
    println("Hello world from a suspending function")
}
```
{kotlin-runnable="true"}

この例ではまだ並行処理を使用していませんが、関数に `suspend` キーワードを付けることで、他の中断関数を呼び出したり、内部で並行処理コードを実行したりできるようになります。

`suspend` キーワードは Kotlin 言語のコア部分ですが、コルーチンの機能の多くは [`kotlinx.coroutines`](https://github.com/Kotlin/kotlinx.coroutines) ライブラリを通じて提供されています。

## プロジェクトに kotlinx.coroutines ライブラリを追加する

プロジェクトに `kotlinx.coroutines` ライブラリを含めるには、使用しているビルドツールに基づいて、対応する依存関係の設定を追加してください。

<tabs group="build-tool">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts
repositories {
    mavenCentral()
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle
repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
}
```
</tab>

<tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<project>
    <dependencies>
        <dependency>
            <groupId>org.jetbrains.kotlinx</groupId>
            <artifactId>kotlinx-coroutines-core</artifactId>
            <version>%coroutinesVersion%</version>
        </dependency>
    </dependencies>
    ...
</project>
```

</tab>
</tabs>

## 初めてのコルーチンを作成する

> このページの例では、コルーチンビルダー関数である `CoroutineScope.launch()` や `CoroutineScope.async()` に対して、明示的な `this` 式を使用しています。
> これらのコルーチンビルダーは `CoroutineScope` の[拡張関数](extensions.md)であり、`this` 式はレシーバーとしての現在の `CoroutineScope` を参照します。
>
> 実践的な例については、[コルーチンスコープからコルーチンビルダーを抽出する](#extract-coroutine-builders-from-the-coroutine-scope)を参照してください。
>
{style="note"}

Kotlin でコルーチンを作成するには、以下のものが必要です。

* [中断関数](#suspending-functions)。
* それを実行するための[コルーチンスコープ](#coroutine-scope-and-structured-concurrency)（例：`withContext()` 関数内など）。
* それを開始するための `CoroutineScope.launch()` のような[コルーチンビルダー](#coroutine-builder-functions)。
* どのスレッドを使用するかを制御する[ディスパッチャ](#coroutine-dispatchers)。

マルチスレッド環境で複数のコルーチンを使用する例を見てみましょう。

1. `kotlinx.coroutines` ライブラリをインポートします。

    ```kotlin
    import kotlinx.coroutines.*
    ```

2. 一時停止して再開できる関数に `suspend` キーワードを付けます。

    ```kotlin
    suspend fun greet() {
        println("The greet() on the thread: ${Thread.currentThread().name}")
    }
    
    suspend fun main() {}
    ```

    > 一部のプロジェクトでは `main()` 関数に `suspend` を付けることができますが、既存のコードと統合する場合やフレームワークを使用している場合は不可能な場合があります。
    > その場合は、フレームワークのドキュメントを確認して、中断関数の呼び出しをサポートしているか確認してください。
    > サポートされていない場合は、[`runBlocking()`](#runblocking) を使用して、現在のスレッドをブロックすることでそれらを呼び出します。
    > 
    {style="note"}

3. データの取得やデータベースへの書き込みなど、中断を伴うタスクをシミュレートするために [`delay()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/delay.html#) 関数を追加します。

    ```kotlin
    suspend fun greet() {
        println("The greet() on the thread: ${Thread.currentThread().name}")
        delay(1000L)
    }
   ```

    <!-- > ミリ秒を使用する代わりに、`delay(1.seconds)` のように期間を表現するには、Kotlin 標準ライブラリの [`kotlin.time.Duration`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/-duration/) を使用してください。
    >
    {style="tip"} -->

4. 共有スレッドプール上で実行される、マルチスレッド並行処理コードのエントリーポイントを定義するために [`withContext(Dispatchers.Default)`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-context.html#) を使用します。

    ```kotlin
    suspend fun main() {
        withContext(Dispatchers.Default) {
            // ここにコルーチンビルダーを追加します
        }
    }
    ```

   > 中断関数である `withContext()` は通常、[コンテキストの切り替え](coroutine-context-and-dispatchers.md#jumping-between-threads)に使用されますが、この例では並行処理コードのための非ブロック的なエントリーポイントも定義しています。
   > これはマルチスレッド実行のための共有スレッドプールでコードを実行するために [`Dispatchers.Default` ディスパッチャ](#coroutine-dispatchers)を使用します。
   > デフォルトでは、このプールは実行時に利用可能な CPU コア数と同じ数（最小 2 つ）までのスレッドを使用します。
   > 
   > `withContext()` ブロック内で起動されたコルーチンは同じコルーチンスコープを共有し、これにより[構造化された並行性（structured concurrency）](#coroutine-scope-and-structured-concurrency)が保証されます。
   > 
   {style="note"}

5. コルーチンを開始するために、[`CoroutineScope.launch()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html) のような[コルーチンビルダー関数](#coroutine-builder-functions)を使用します。

    ```kotlin
    suspend fun main() {
        withContext(Dispatchers.Default) { // this: CoroutineScope
            // CoroutineScope.launch() を使用してスコープ内でコルーチンを開始します
            this.launch { greet() }
            println("The withContext() on the thread: ${Thread.currentThread().name}")
        }
    }
    ```

6. これらの要素を組み合わせて、共有スレッドプール上で複数のコルーチンを同時に実行します。

    ```kotlin
    // コルーチンライブラリをインポート
    import kotlinx.coroutines.*

    // 秒単位で期間を表現するために kotlin.time.Duration をインポート
    import kotlin.time.Duration.Companion.seconds

    // 中断関数を定義
    suspend fun greet() {
        println("The greet() on the thread: ${Thread.currentThread().name}")
        // 1秒間中断し、スレッドを解放する
        delay(1.seconds) 
        // delay() 関数はここでは中断を伴う API 呼び出しをシミュレートしています
        // ネットワークリクエストなどの中断を伴う API 呼び出しをここに追加できます
    }

    suspend fun main() {
        // このブロック内のコードを共有スレッドプール上で実行する
        withContext(Dispatchers.Default) { // this: CoroutineScope
            this.launch() {
                greet()
            }
   
            // 別のコルーチンを開始
            this.launch() {
                println("The CoroutineScope.launch() on the thread: ${Thread.currentThread().name}")
                delay(1.seconds)
                // delay 関数はここでは中断を伴う API 呼び出しをシミュレートしています
                // ネットワークリクエストなどの中断を伴う API 呼び出しをここに追加できます
            }
    
            println("The withContext() on the thread: ${Thread.currentThread().name}")
        }
    }
    ```
    {kotlin-runnable="true"}

この例を何度か実行してみてください。
OS がスレッドの実行タイミングを決定するため、実行するたびに出力順序やスレッド名が変わる可能性があることに気づくでしょう。

> コードの出力結果で、スレッド名の隣にコルーチン名を表示して詳細情報を確認することができます。
> これを行うには、ビルドツールまたは IDE の実行構成で `-Dkotlinx.coroutines.debug` VM オプションを渡します。
>
> 詳細は [コルーチンのデバッグ](https://github.com/Kotlin/kotlinx.coroutines/blob/master/docs/topics/debugging.md) を参照してください。
>
{style="tip"}

## コルーチンスコープと構造化された並行性

アプリケーションで多くのコルーチンを実行する場合、それらをグループとして管理する方法が必要になります。
Kotlin のコルーチンは、この構造を提供するために「構造化された並行性（structured concurrency）」と呼ばれる原則に基づいています。

この原則に従うと、コルーチンはライフサイクルがリンクされた親タスクと子タスクのツリー階層を形成します。
コルーチンのライフサイクルとは、作成から完了、失敗、またはキャンセルまでの状態のシーケンスです。

親コルーチンは、その子が完了するのを待ってから終了します。
親コルーチンが失敗したりキャンセルされたりすると、そのすべての子コルーチンも再帰的にキャンセルされます。
このようにコルーチンを接続し続けることで、キャンセルやエラー処理が予測可能で安全なものになります。

構造化された並行性を維持するために、新しいコルーチンは、それらのライフサイクルを定義および管理する [`CoroutineScope`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/) 内でのみ開始できます。
`CoroutineScope` には、ディスパッチャやその他の実行プロパティを定義する「コルーチンコンテキスト」が含まれています。
あるコルーチンの内部で別のコルーチンを開始すると、それは自動的に親スコープの子になります。

`CoroutineScope` に対して `CoroutineScope.launch()` などの[コルーチンビルダー関数](#coroutine-builder-functions)を呼び出すと、そのスコープに関連付けられたコルーチンの子コルーチンが開始されます。
ビルダーのブロック内では、[レシーバー](lambdas.md#function-literals-with-receiver)はネストされた `CoroutineScope` になるため、そこで開始したすべてのコルーチンはその子になります。

### `coroutineScope()` 関数でコルーチンスコープを作成する

現在のコルーチンコンテキストを使用して新しいコルーチンスコープを作成するには、[`coroutineScope()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/coroutine-scope.html) 関数を使用します。
この関数は、コルーチンサブツリーのルートコルーチンを作成します。
それはブロック内で開始されたコルーチンの直接の親であり、それらが開始したすべてのコルーチンの間接的な親になります。
`coroutineScope()` は中断を伴うブロックを実行し、そのブロックとそこで開始されたすべてのコルーチンが完了するまで待機します。

例を示します。

```kotlin
// 秒単位で期間を表現するために kotlin.time.Duration をインポート
import kotlin.time.Duration.Companion.seconds

import kotlinx.coroutines.*

// コルーチンコンテキストでディスパッチャが指定されていない場合、
// CoroutineScope.launch() は Dispatchers.Default を使用します
//sampleStart
suspend fun main() {
    // コルーチンサブツリーのルート
    coroutineScope { // this: CoroutineScope
        this.launch {
            this.launch {
                delay(2.seconds)
                println("Child of the enclosing coroutine completed")
            }
            println("Child coroutine 1 completed")
        }
        this.launch {
            delay(1.seconds)
            println("Child coroutine 2 completed")
        }
    }
    // coroutineScope 内のすべての子が完了した後にのみ実行される
    println("Coroutine scope completed")
}
//sampleEnd
```
{kotlin-runnable="true"}

この例では[ディスパッチャ](#coroutine-dispatchers)が指定されていないため、`coroutineScope()` ブロック内の `CoroutineScope.launch()` ビルダー関数は現在のコンテキストを継承します。
そのコンテキストに指定されたディスパッチャがない場合、`CoroutineScope.launch()` は共有スレッドプール上で実行される `Dispatchers.Default` を使用します。

### コルーチンスコープからコルーチンビルダーを抽出する

場合によっては、[`CoroutineScope.launch()`](#coroutinescope-launch) などのコルーチンビルダーの呼び出しを別の関数に抽出したいことがあります。

次の例を考えてみましょう。

```kotlin
suspend fun main() {
    coroutineScope { // this: CoroutineScope
        // CoroutineScope がレシーバーである CoroutineScope.launch() を呼び出す
        this.launch { println("1") }
        this.launch { println("2") }
    } 
}
```

> `this.launch` は、明示的な `this` 式を使わずに `launch` と書くこともできます。
> これらの例では、それが `CoroutineScope` の拡張関数であることを強調するために明示的な `this` 式を使用しています。
>
> Kotlin におけるレシーバー付きラムダの仕組みについての詳細は、[レシーバー付き関数リテラル](lambdas.md#function-literals-with-receiver)を参照してください。
>
{style="tip"}

`coroutineScope()` 関数は `CoroutineScope` レシーバーを持つラムダを受け取ります。
このラムダの内部では、暗黙のレシーバーが `CoroutineScope` であるため、`CoroutineScope.launch()` や [`CoroutineScope.async()`](#coroutinescope-async) のようなビルダー関数は、そのレシーバーに対する[拡張関数](extensions.md#extension-functions)として解決されます。

コルーチンビルダーを別の関数に抽出する場合、その関数は `CoroutineScope` レシーバーを宣言する必要があります。そうしないとコンパイルエラーが発生します。

```kotlin
import kotlinx.coroutines.*
//sampleStart
suspend fun main() {
    coroutineScope {
        launchAll()
    }
}

fun CoroutineScope.launchAll() { // this: CoroutineScope
    // CoroutineScope に対して .launch() を呼び出す
    this.launch { println("1") }
    this.launch { println("2") } 
}
//sampleEnd
/* -- レシーバーとして CoroutineScope を宣言せずに launch を呼び出すとコンパイルエラーになります --

fun launchAll() {
    // コンパイルエラー: this が定義されていません
    this.launch { println("1") }
    this.launch { println("2") }
}
 */
```
{kotlin-runnable="true"}

この例では、`launchAll()` 関数は `suspend` キーワードを必要としません。なぜなら、現在の `CoroutineScope` 内でコルーチンを開始し、すぐに復帰するだけだからです。関数が戻る前に一時停止し、その後再開することが理にかなっている場合にのみ、関数に `suspend` を付けてください。

## コルーチンビルダー関数

コルーチンビルダー関数とは、実行するコルーチンを定義する `suspend` [ラムダ](lambdas.md)を受け取る関数のことです。
以下にいくつかの例を挙げます。

* [`CoroutineScope.launch()`](#coroutinescope-launch)
* [`CoroutineScope.async()`](#coroutinescope-async)
* [`runBlocking()`](#runblocking)
* [`withContext()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-context.html)
* [`coroutineScope()`](#create-a-coroutine-scope-with-the-coroutinescope-function)

コルーチンビルダー関数を実行するには `CoroutineScope` が必要です。
これは既存のスコープであっても、`coroutineScope()`、[`runBlocking()`](#runblocking)、または [`withContext()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-context.html#) のようなヘルパー関数で作成したものであっても構いません。
各ビルダーは、コルーチンがどのように開始され、その結果とどのように対話するかを定義します。

### `CoroutineScope.launch()`

[`CoroutineScope.launch()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html#) コルーチンビルダー関数は、`CoroutineScope` の拡張関数です。
これは既存の[コルーチンスコープ](#coroutine-scope-and-structured-concurrency)内で、スコープの残りの部分をブロックすることなく新しいコルーチンを開始します。

結果が必要ない場合や、結果を待ちたくない場合に、他の作業と並行してタスクを実行するために `CoroutineScope.launch()` を使用します。

```kotlin
// ミリ秒単位での期間表現を可能にするために kotlin.time.Duration をインポート
import kotlin.time.Duration.Companion.milliseconds

import kotlinx.coroutines.*

suspend fun main() {
    withContext(Dispatchers.Default) {
        performBackgroundWork()
    }
}

//sampleStart
suspend fun performBackgroundWork() = coroutineScope { // this: CoroutineScope
    // スコープをブロックせずに実行されるコルーチンを開始する
    this.launch {
        // バックグラウンド作業をシミュレートするために中断する
        delay(100.milliseconds)
        println("Sending notification in background")
    }

    // 前のコルーチンが中断している間、メインのコルーチンは継続する
    println("Scope continues")
}
//sampleEnd
```
{kotlin-runnable="true"}

この例を実行すると、`main()` 関数が `CoroutineScope.launch()` によってブロックされず、コルーチンがバックグラウンドで動作している間も他のコードを実行し続けることがわかります。

> `CoroutineScope.launch()` 関数は [`Job`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/) ハンドルを返します。
> このハンドルを使用して、開始されたコルーチンが完了するのを待機できます。
> 詳細は [キャンセルとタイムアウト](coroutines-cancellation.md#cancel-coroutines) を参照してください。
> 
{style="tip"}

### `CoroutineScope.async()`

[`CoroutineScope.async()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html) コルーチンビルダー関数は、`CoroutineScope` の拡張関数です。
これは既存の[コルーチンスコープ](#coroutine-scope-and-structured-concurrency)内で並行計算を開始し、最終的な結果を表す [`Deferred`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-deferred/) ハンドルを返します。
結果の準備ができるまでコードを中断するには、`.await()` 関数を使用します。

```kotlin
// ミリ秒単位での期間表現を可能にするために kotlin.time.Duration をインポート
import kotlin.time.Duration.Companion.milliseconds

import kotlinx.coroutines.*

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) { // this: CoroutineScope
    // 1ページ目のダウンロードを開始
    val firstPage = this.async {
        delay(50.milliseconds)
        "First page"
    }

    // 2ページ目のダウンロードを並行して開始
    val secondPage = this.async {
        delay(100.milliseconds)
        "Second page"
    }

    // 両方の結果を待ち、それらを比較する
    val pagesAreEqual = firstPage.await() == secondPage.await()
    println("Pages are equal: $pagesAreEqual")
}
//sampleEnd
```
{kotlin-runnable="true"}

### `runBlocking()`

[`runBlocking()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/run-blocking.html) コルーチンビルダー関数は、コルーチンスコープを作成し、そのスコープ内で開始されたコルーチンが終了するまで現在の[スレッド](#comparing-coroutines-and-jvm-threads)をブロックします。

`runBlocking()` は、非中断コードから中断コードを呼び出すための他の手段がない場合にのみ使用してください。

```kotlin
import kotlin.time.Duration.Companion.milliseconds
import kotlinx.coroutines.*

// 変更できないサードパーティのインターフェース
interface Repository {
    fun readItem(): Int
}

object MyRepository : Repository {
    override fun readItem(): Int {
        // 中断関数へのブリッジ
        return runBlocking {
            myReadItem()
        }
    }
}

suspend fun myReadItem(): Int {
    delay(100.milliseconds)
    return 4
}
```

## コルーチンディスパッチャ

[_コルーチンディスパッチャ（coroutine dispatcher）_](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/#) は、コルーチンが実行に使用するスレッドまたはスレッドプールを制御します。
コルーチンは常に単一のスレッドに関連付けられているわけではありません。
ディスパッチャによっては、あるスレッドで一時停止し、別のスレッドで再開することができます。
これにより、コルーチンごとに個別のスレッドを割り当てることなく、多くのコルーチンを同時に実行できます。

> コルーチンが異なるスレッドで中断および再開される可能性があるとしても、
> コルーチンが中断される前に書き込まれた値は、再開されたときに同じコルーチン内で引き続き利用可能であることが保証されています。
>
{style="tip"}

ディスパッチャは[コルーチンスコープ](#coroutine-scope-and-structured-concurrency)と連携して、コルーチンがいつ、どこで実行されるかを定義します。
コルーチンスコープがコルーチンのライフサイクルを制御するのに対し、ディスパッチャは実行に使用されるスレッドを制御します。

> すべてのコルーチンに対してディスパッチャを指定する必要はありません。
> デフォルトでは、コルーチンは親スコープからディスパッチャを継承します。
> 異なるコンテキストでコルーチンを実行するためにディスパッチャを指定することができます。
> 
> コルーチンコンテキストにディスパッチャが含まれていない場合、コルーチンビルダーは `Dispatchers.Default` を使用します。
>
{style="note"}

`kotlinx.coroutines` ライブラリには、さまざまなユースケースに対応する異なるディスパッチャが含まれています。
例えば、[`Dispatchers.Default`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-default.html) は共有スレッドプール上でコルーチンを実行し、メインスレッドとは別にバックグラウンドで作業を行います。これはデータ処理などの CPU 負荷の高い操作に理想的な選択肢です。

`CoroutineScope.launch()` のようなコルーチンビルダーにディスパッチャを指定するには、引数として渡します。

```kotlin
suspend fun runWithDispatcher() = coroutineScope { // this: CoroutineScope
    this.launch(Dispatchers.Default) {
        println("Running on ${Thread.currentThread().name}")
    }
}
```

あるいは、`withContext()` ブロックを使用して、その中のすべてのコードを指定されたディスパッチャ上で実行することもできます。

```kotlin
// ミリ秒単位での期間表現を可能にするために kotlin.time.Duration をインポート
import kotlin.time.Duration.Companion.milliseconds

import kotlinx.coroutines.*

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) { // this: CoroutineScope
    println("Running withContext block on ${Thread.currentThread().name}")

    val one = this.async {
        println("First calculation starting on ${Thread.currentThread().name}")
        val sum = (1L..500_000L).sum()
        delay(200L)
        println("First calculation done on ${Thread.currentThread().name}")
        sum
    }

    val two = this.async {
        println("Second calculation starting on ${Thread.currentThread().name}")
        val sum = (500_001L..1_000_000L).sum()
        println("Second calculation done on ${Thread.currentThread().name}")
        sum
    }

    // 両方の計算を待ち、結果を出力する
    println("Combined total: ${one.await() + two.await()}")
}
//sampleEnd
```
{kotlin-runnable="true"}

コルーチンディスパッチャとその用途（[`Dispatchers.IO`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-i-o.html) や [`Dispatchers.Main`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-main.html) などの他のディスパッチャを含む）についての詳細は、[コルーチンコンテキストとディスパッチャ](coroutine-context-and-dispatchers.md)を参照してください。

## コルーチンとJVMスレッドの比較

コルーチンは JVM 上のスレッドのようにコードを並行して実行する中断可能な計算ですが、内部の仕組みは異なります。

「スレッド（thread）」はオペレーティングシステムによって管理されます。スレッドは複数の CPU コア上でタスクを並列に実行でき、JVM における並行処理の標準的なアプローチです。
スレッドを作成すると、オペレーティングシステムはそのスタック用のメモリを割り当て、カーネルを使用してスレッド間の切り替えを行います。
これによりスレッドは強力になりますが、リソースを大量に消費します。
通常、各スレッドは数メガバイトのメモリを必要とし、一般的に JVM が一度に処理できるのは数千スレッドまでです。

一方で、コルーチンは特定のスレッドに縛られません。
あるスレッドで中断し、別のスレッドで再開できるため、多くのコルーチンが同じスレッドプールを共有できます。
コルーチンが中断しても、スレッドはブロックされず、他のタスクを実行するために自由な状態になります。
これによりコルーチンはスレッドよりもはるかに軽量になり、システムリソースを使い果たすことなく、1つのプロセスで数百万のコルーチンを実行することが可能になります。

![Comparing coroutines and threads](coroutines-and-threads.svg){width="700"}

50,000 個のコルーチンがそれぞれ 5 秒間待機した後にドット (`.`) を出力する例を見てみましょう。

```kotlin
import kotlin.time.Duration.Companion.seconds
import kotlinx.coroutines.*

suspend fun main() {
    withContext(Dispatchers.Default) {
        // それぞれ 5 秒間待機し、ドットを出力する 50,000 個のコルーチンを開始する
        printPeriods()
    }
}

//sampleStart
suspend fun printPeriods() = coroutineScope { // this: CoroutineScope
    // それぞれ 5 秒間待機し、ドットを出力する 50,000 個のコルーチンを開始する
    repeat(50_000) {
        this.launch {
            delay(5.seconds)
            print(".")
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

今度は、JVM スレッドを使用した同じ例を見てみましょう。

```kotlin
import kotlin.concurrent.thread

fun main() {
    repeat(50_000) {
        thread {
            Thread.sleep(5000L)
            print(".")
        }
    }
}
```
{kotlin-runnable="true" validate="false"}

このバージョンを実行すると、各スレッドが独自のメモリスタックを必要とするため、はるかに多くのメモリを消費します。
50,000 個のスレッドの場合、最大で 100 GB に達する可能性がありますが、同じ数のコルーチンでは約 500 MB で済みます。

オペレーティングシステム、JDK バージョン、および設定によっては、JVM スレッド版はメモリ不足エラー（out-of-memory error）をスローしたり、一度に実行するスレッドが多すぎるのを避けるためにスレッドの作成を遅くしたりすることがあります。

## 次のステップ

* 中断関数の組み合わせについての詳細は、[中断関数の構成](composing-suspending-functions.md) をご覧ください。
* コルーチンのキャンセル方法とタイムアウトの処理については、[キャンセルとタイムアウト](coroutines-cancellation.md) をご覧ください。
* コルーチンの実行とスレッド管理についての詳細は、[コルーチンコンテキストとディスパッチャ](coroutine-context-and-dispatchers.md) をご覧ください。
* 非同期に計算された複数の値を返す方法については、[非同期フロー](coroutines-flow.md) をご覧ください。