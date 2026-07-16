[//]: # (title: Kotlin 2.0.0 の新機能)

<web-summary>新しい言語機能、Kotlin Multiplatform、JVM、Native、JS、Wasm のアップデート、および Gradle と Maven のビルドツールサポートを網羅した Kotlin 2.0.0 リリースノートをご覧ください。</web-summary>

_[リリース日: 2024年5月21日](releases.md#release-history)_

Kotlin 2.0.0 がリリースされ、[新しい Kotlin K2 コンパイラ](#kotlin-k2-compiler)が Stable（安定版）になりました！さらに、以下のようなハイライトがあります。

* [新しい Compose コンパイラ Gradle プラグイン](#new-compose-compiler-gradle-plugin)
* [invokedynamic を使用したラムダ関数の生成](#generation-of-lambda-functions-using-invokedynamic)
* [kotlinx-metadata-jvm ライブラリが Stable に](#the-kotlinx-metadata-jvm-library-is-stable)
* [Apple プラットフォームにおける signpost を使用した Kotlin/Native の GC パフォーマンス監視](#monitoring-gc-performance-with-signposts-on-apple-platforms)
* [Objective-C メソッドとの競合の解決（Kotlin/Native）](#resolving-conflicts-with-objective-c-methods)
* [Kotlin/Wasm における名前付きエクスポートのサポート](#support-for-named-export)
* [Kotlin/Wasm の @JsExport 関数における符号なしプリミティブ型のサポート](#support-for-unsigned-primitive-types-in-functions-with-jsexport)
* [Binaryen を使用したデフォルトのプロダクションビルド最適化](#optimized-production-builds-by-default-using-binaryen)
* [マルチプラットフォームプロジェクトのコンパイラオプション用の新しい Gradle DSL](#new-gradle-dsl-for-compiler-options-in-multiplatform-projects)
* [enum class の values ジェネリック関数の Stable な代替](#stable-replacement-of-the-enum-class-values-generic-function)
* [AutoCloseable インターフェースの Stable 化](#stable-autocloseable-interface)

Kotlin 2.0 は JetBrains チームにとって大きな節目となります。このリリースは KotlinConf 2024 の中心的なトピックでした。エキサイティングなアップデートの発表や、Kotlin 言語に関する最近の取り組みについて語られたオープニングキーノートをぜひご覧ください。

<video src="https://www.youtube.com/v/Ar73Axsz2YA" title="KotlinConf'24 - Keynote"/>

> Kotlin のリリースサイクルに関する情報は、[Kotlin のリリースプロセス](releases.md)を参照してください。
>
{style="tip"}

## IDE サポート

Kotlin 2.0.0 をサポートする Kotlin プラグインは、最新の IntelliJ IDEA および Android Studio にバンドルされています。
IDE の Kotlin プラグインを更新する必要はありません。
ビルドスクリプトで [Kotlin バージョンを 2.0.0 に変更](releases.md#update-to-a-new-kotlin-version) するだけで利用可能です。

* IntelliJ IDEA による Kotlin K2 コンパイラのサポートの詳細については、[IDE でのサポート](#support-in-ides)を参照してください。
* IntelliJ IDEA による Kotlin サポートの全般的な詳細については、[Kotlin のリリース](releases.md#ide-support)を参照してください。

## Kotlin K2 コンパイラ

K2 コンパイラへの道のりは長いものでしたが、ついに JetBrains チームはその安定化（stabilization）を発表します。
Kotlin 2.0.0 では、新しい Kotlin K2 コンパイラがデフォルトで使用され、JVM、Native、Wasm、JS のすべてのターゲットプラットフォームで [Stable](components-stability.md)（安定）となりました。新しいコンパイラは、大幅なパフォーマンスの向上をもたらし、新しい言語機能の開発を加速させ、Kotlin がサポートするすべてのプラットフォームを統合し、マルチプラットフォームプロジェクトにより優れたアーキテクチャを提供します。

JetBrains チームは、選定されたユーザープロジェクトおよび内部プロジェクトから 1,000 万行のコードを正常にコンパイルすることで、新コンパイラの品質を保証しました。安定化プロセスには 18,000 人の開発者が参加し、合計 80,000 のプロジェクトで新しい K2 コンパイラをテストし、発見された問題を報告しました。

新コンパイラへの移行プロセスをできるだけスムーズにするために、[K2 コンパイラ移行ガイド](k2-compiler-migration-guide.md)を作成しました。
このガイドでは、コンパイラの多くの利点について説明し、遭遇する可能性のある変更点を示し、必要に応じて以前のバージョンにロールバックする方法を記述しています。

[ブログ記事](https://blog.jetbrains.com/kotlin/2024/04/k2-compiler-performance-benchmarks-and-how-to-measure-them-on-your-projects/)では、さまざまなプロジェクトにおける K2 コンパイラのパフォーマンスを調査しました。K2 コンパイラの実際のパフォーマンスデータや、自身のプロジェクトでパフォーマンスベンチマークを収集する方法を確認したい場合は、ぜひチェックしてください。

また、KotlinConf 2024 でのリード言語デザイナー Michail Zarečenskij による、Kotlin の機能の進化と K2 コンパイラに関する講演も視聴できます。

<video src="https://www.youtube.com/v/tAGJ5zJXJ7w" title="Kotlin Language Features in 2.0 and Beyond"/>

### 現在の K2 コンパイラの制限事項

Gradle プロジェクトで K2 を有効にする場合、8.3 未満の Gradle バージョンを使用しているプロジェクトでは、以下のケースで制限が生じる可能性があります。

* `buildSrc` からのソースコードのコンパイル。
* インクルードされたビルド（included builds）における Gradle プラグインのコンパイル。
* 8.3 未満の Gradle バージョンのプロジェクトで使用される、その他の Gradle プラグインのコンパイル。
* Gradle プラグインの依存関係のビルド。

上記の問題が発生した場合は、以下の手順で対処できます。

* `buildSrc`、すべての Gradle プラグイン、およびその依存関係に対して言語バージョンを設定する：

  ```kotlin
  kotlin {
      compilerOptions {
          languageVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_1_9)
          apiVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_1_9)
      }
  }
  ```

  > 特定のタスクに対して言語バージョンや API バージョンを設定した場合、それらの値は `compilerOptions` 拡張で設定された値を上書きします。その場合、言語バージョンと API バージョンは 1.9 以下である必要があります。
  >
  {style="note"}

* プロジェクトの Gradle バージョンを 8.3 以降に更新する。

### スマートキャストの改善

Kotlin コンパイラは、特定のケースにおいてオブジェクトを自動的に特定の型にキャストすることができ、明示的なキャストの手間を省くことができます。これは[スマートキャスト](typecasts.md#smart-casts)と呼ばれます。
Kotlin K2 コンパイラでは、以前よりもさらに多くのシナリオでスマートキャストが実行されるようになりました。

Kotlin 2.0.0 では、以下の領域でスマートキャストに関連する改善が行われました。

* [ローカル変数と以降のスコープ](#local-variables-and-further-scopes)
* [論理 or 演算子による型チェック](#type-checks-with-logical-or-operator)
* [インライン関数](#inline-functions)
* [関数型のプロパティ](#properties-with-function-types)
* [例外処理](#exception-handling)
* [インクリメントおよびデクリメント演算子](#increment-and-decrement-operators)

#### ローカル変数と以降のスコープ

以前は、変数が `if` 条件内で `null` ではないと評価された場合、その変数はスマートキャストされました。その変数に関する情報は、`if` ブロックのスコープ内で以降も共有されていました。

しかし、変数を `if` 条件の **外側** で宣言した場合、`if` 条件内ではその変数に関する情報が利用できず、スマートキャストできませんでした。この動作は `when` 式や `while` ループでも見られました。

Kotlin 2.0.0 からは、変数を `if`、`when`、または `while` 条件で使用する前に宣言していれば、コンパイラによって収集された変数に関する情報が、対応するブロック内でのスマートキャストに利用可能になります。

これは、ブール条件を変数に抽出したい場合などに便利です。変数に意味のある名前を付けることで、コードの可読性が向上し、後でその変数を再利用することが可能になります。例：

```kotlin
class Cat {
    fun purr() {
        println("Purr purr")
    }
}

fun petAnimal(animal: Any) {
    val isCat = animal is Cat
    if (isCat) {
        // Kotlin 2.0.0 では、コンパイラは isCat に関する情報に
        // アクセスできるため、animal が Cat 型にスマートキャスト
        // されたことを知っています。
        // そのため、purr() 関数を呼び出すことができます。
        // Kotlin 1.9.20 では、コンパイラはスマートキャストを
        // 認識しないため、purr() 関数の呼び出しはエラーになります。
        animal.purr()
    }
}

fun main() {
    val kitty = Cat()
    petAnimal(kitty)
    // Purr purr
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-smart-casts-k2-local-variables" validate="false"}

#### 論理 or 演算子による型チェック

Kotlin 2.0.0 では、オブジェクトの型チェックを `or` 演算子（`||`）で組み合わせた場合、それらの最も近い共通のスーパータイプ（closest common supertype）へのスマートキャストが行われます。この変更以前は、常に `Any` 型にスマートキャストされていました。

そのため、プロパティにアクセスしたり関数を呼び出したりする前に、その後で手動でオブジェクトの型をチェックする必要がありました。例：

```kotlin
interface Status {
    fun signal() {}
}

interface Ok : Status
interface Postponed : Status
interface Declined : Status

fun signalCheck(signalStatus: Any) {
    if (signalStatus is Postponed || signalStatus is Declined) {
        // signalStatus は共通のスーパータイプ Status にスマートキャストされる
        signalStatus.signal()
        // Kotlin 2.0.0 より前では、signalStatus は Any 型に
        // スマートキャストされていたため、signal() 関数の呼び出しは
        // Unresolved reference エラーを引き起こしていました。
        // signal() 関数は、別の型チェックを行った後にのみ
        // 呼び出すことができました：

        // check(signalStatus is Status)
        // signalStatus.signal()
    }
}
```

> 共通のスーパータイプは、共用体型（union type）の **近似** です。Kotlin では[共用体型](https://en.wikipedia.org/wiki/Union_type)はサポートされていません。
>
{style="note"}

#### インライン関数

Kotlin 2.0.0 では、K2 コンパイラはインライン関数を従来とは異なる方法で扱い、他のコンパイラ解析と組み合わせて、スマートキャストが安全かどうかを判断できるようになりました。

具体的には、インライン関数は暗黙的な [`callsInPlace`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.contracts/-contract-builder/calls-in-place.html) コントラクトを持つものとして扱われるようになりました。これは、インライン関数に渡されたラムダ関数がその場で呼び出されることを意味します。ラムダ関数がその場で呼び出されるため、コンパイラはラムダ関数がその関数本体に含まれる変数への参照をリーク（漏洩）させることがないことを認識できます。

コンパイラはこの知識を他の解析結果と共に使用して、キャプチャされた変数をスマートキャストしても安全かどうかを判断します。例：

```kotlin
interface Processor {
    fun process()
}

inline fun inlineAction(f: () -> Unit) = f()

fun nextProcessor(): Processor? = null

fun runProcessor(): Processor? {
    var processor: Processor? = null
    inlineAction {
        // Kotlin 2.0.0 では、コンパイラは processor がローカル変数であり、
        // inlineAction() がインライン関数であることを知っているため、
        // processor への参照がリークすることはありません。
        // したがって、processor をスマートキャストしても安全です。

        // processor が null でない場合、processor はスマートキャストされる
        if (processor != null) {
            // コンパイラは processor が null でないことを知っているため、
            // セーフコール（?.）は不要です
            processor.process()

            // Kotlin 1.9.20 では、セーフコールを行う必要があります：
            // processor?.process()
        }

        processor = nextProcessor()
    }

    return processor
}
```

#### 関数型のプロパティ

以前のバージョンの Kotlin には、関数型を持つクラスプロパティがスマートキャストされないというバグがありました。Kotlin 2.0.0 および K2 コンパイラでこの動作を修正しました。例：

```kotlin
class Holder(val provider: (() -> Unit)?) {
    fun process() {
        // Kotlin 2.0.0 では、provider が null でない場合、
        // provider はスマートキャストされます
        if (provider != null) {
            // コンパイラは provider が null でないことを知っています
            provider()

            // 1.9.20 では、コンパイラは provider が null でないことを
            // 認識しないため、エラーになります：
            // Reference has a nullable type '(() -> Unit)?', use explicit '?.invoke()' to make a function-like call instead
        }
    }
}
```

この変更は、`invoke` 演算子をオーバーロードしている場合にも適用されます。例：

```kotlin
interface Provider {
    operator fun invoke()
}

interface Processor : () -> String

class Holder(val provider: Provider?, val processor: Processor?) {
    fun process() {
        if (provider != null) {
            provider()
            // 1.9.20 では、コンパイラはエラーを発生させます：
            // Reference has a nullable type 'Provider?' use explicit '?.invoke()' to make a function-like call instead
        }
    }
}
```

#### 例外処理

Kotlin 2.0.0 では、スマートキャスト情報を `catch` および `finally` ブロックに引き継げるように例外処理の改善を行いました。この変更により、コンパイラがオブジェクトが null 許容型であるかどうかを追跡し続けるため、コードがより安全になります。例：

```kotlin
//sampleStart
fun testString() {
    var stringInput: String? = null
    // stringInput は String 型にスマートキャストされる
    stringInput = ""
    try {
        // コンパイラは stringInput が null でないことを知っている
        println(stringInput.length)
        // 0

        // コンパイラは stringInput に関する以前のスマートキャスト情報を破棄する。
        // これで stringInput は String? 型になる。
        stringInput = null

        // 例外を発生させる
        if (2 > 1) throw Exception()
        stringInput = ""
    } catch (exception: Exception) {
        // Kotlin 2.0.0 では、コンパイラは stringInput が null に
        // なり得ることを知っているため、stringInput は null 許容のまま。
        println(stringInput?.length)
        // null

        // Kotlin 1.9.20 では、コンパイラはセーフコールは不要であると
        // 言いますが、これは誤りです。
    }
}

//sampleEnd
fun main() {
    testString()
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-smart-casts-k2-exception-handling"}

#### インクリメントおよびデクリメント演算子

Kotlin 2.0.0 より前では、コンパイラはインクリメントまたはデクリメント演算子を使用した後にオブジェクトの型が変わる可能性があることを理解していませんでした。コンパイラがオブジェクトの型を正確に追跡できなかったため、コードで未解決の参照エラーが発生することがありました。Kotlin 2.0.0 では、これが修正されました。

```kotlin
interface Rho {
    operator fun inc(): Sigma = TODO()
}

interface Sigma : Rho {
    fun sigma() = Unit
}

interface Tau {
    fun tau() = Unit
}

fun main(input: Rho) {
    var unknownObject: Rho = input

    // unknownObject が Tau インターフェースを継承しているかチェック
    // 注：unknownObject が Rho と Tau の両方を継承している可能性もある。
    if (unknownObject is Tau) {

        // インターフェース Rho のオーバーロードされた inc() 演算子を使用。
        // Kotlin 2.0.0 では、unknownObject の型は Sigma に
        // スマートキャストされる。
        ++unknownObject

        // Kotlin 2.0.0 では、コンパイラは unknownObject が Sigma 型を
        // 持つことを知っているため、sigma() 関数を正常に呼び出せる。
        unknownObject.sigma()

        // Kotlin 1.9.20 では、コンパイラは inc() が呼び出されたときに
        // スマートキャストを実行しないため、コンパイラは依然として
        // unknownObject が Tau 型であると考える。sigma() 関数の呼び出しは
        // コンパイルエラーになる。
        
        // Kotlin 2.0.0 では、コンパイラは unknownObject が Sigma 型を
        // 持つことを知っているため、tau() 関数の呼び出しはコンパイルエラーになる。
        unknownObject.tau()
        // Unresolved reference 'tau'

        // Kotlin 1.9.20 では、コンパイラが誤って unknownObject が
        // Tau 型であると考えるため、tau() 関数を呼び出せるが、
        // ClassCastException が発生する。
    }
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-smart-casts-k2-increment-decrement-operators" validate="false"}

### Kotlin Multiplatform の改善

Kotlin 2.0.0 では、K2 コンパイラにおける Kotlin Multiplatform 関連の改善が以下の領域で行われました。

* [コンパイル時における共通ソースとプラットフォームソースの分離](#separation-of-common-and-platform-sources-during-compilation)
* [expected 宣言と actual 宣言における異なる可視性レベル](#different-visibility-levels-of-expected-and-actual-declarations)

#### コンパイル時における共通ソースとプラットフォームソースの分離

以前の Kotlin コンパイラの設計では、コンパイル時に共通ソースセットとプラットフォームソースセットを分離しておくことができませんでした。その結果、共通コードがプラットフォームコードにアクセスできてしまい、プラットフォーム間で動作が異なる原因となっていました。さらに、共通コードからのいくつかのコンパイラ設定や依存関係がプラットフォームコードに漏洩していました。

Kotlin 2.0.0 では、新しい Kotlin K2 コンパイラの実装において、共通ソースセットとプラットフォームソースセットを厳密に分離するためのコンパイルスキームの再設計が行われました。この変更は、[expected 関数と actual 関数](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html#expected-and-actual-functions)を使用する場合に最も顕著に現れます。以前は、共通コード内での関数呼び出しがプラットフォームコード内の関数に解決されることがありました。例：

<table>
   <tr>
       <td>共通コード</td>
       <td>プラットフォームコード</td>
   </tr>
   <tr>
<td>

```kotlin
fun foo(x: Any) = println("common foo")

fun exampleFunction() {
    foo(42)
}
```

</td>
<td>

```kotlin
// JVM
fun foo(x: Int) = println("platform foo")

// JavaScript
// JavaScript プラットフォームには 
// foo() 関数のオーバーロードはない
```

</td>
</tr>
</table>

この例では、実行されるプラットフォームに応じて共通コードの動作が異なっていました。

* JVM プラットフォームでは、共通コードで `foo()` 関数を呼び出すと、プラットフォームコードの `foo()` 関数が解決され、`platform foo` と出力されます。
* JavaScript プラットフォームでは、プラットフォームコードにそのような関数が存在しないため、共通コードで `foo()` 関数を呼び出すと、共通コードの `foo()` 関数が解決され、`common foo` と出力されます。

Kotlin 2.0.0 では、共通コードはプラットフォームコードにアクセスできないため、両方のプラットフォームで `foo()` 関数は共通コードの `foo()` 関数に正常に解決され、`common foo` と出力されます。

プラットフォーム間での動作の一貫性の向上に加えて、IntelliJ IDEA や Android Studio とコンパイラの間で動作が矛盾していたケースの修正にも努めました。例えば、[expected クラスと actual クラス](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html#expected-and-actual-classes)を使用した場合、以下のことが起こっていました。

<table>
   <tr>
       <td>共通コード</td>
       <td>プラットフォームコード</td>
   </tr>
   <tr>
<td>

```kotlin
expect class Identity {
    fun confirmIdentity(): String
}

fun common() {
    // 2.0.0 より前では、
    // IDE 限定のエラーが発生していた
    Identity().confirmIdentity()
    // RESOLUTION_TO_CLASSIFIER : Expected class
    // Identity has no default constructor.
}
```

</td>
<td>

```kotlin
actual class Identity {
    actual fun confirmIdentity() = "expect class fun: jvm"
}
```

</td>
</tr>
</table>

この例では、expected クラス `Identity` にはデフォルトコンストラクタがないため、共通コードで正常に呼び出すことはできません。以前は IDE によってのみエラーが報告されていましたが、JVM 上ではコードが正常にコンパイルされていました。しかし現在では、コンパイラが正しくエラーを報告します。

```none
Expected class 'expect class Identity : Any' does not have default constructor
```

##### 解決の振る舞いが変わらない場合

新しいコンパイルスキームへの移行はまだ進行中であるため、同じソースセット内にない関数を呼び出す場合、解決の振る舞いは以前と同じです。この違いは、主に共通コードでマルチプラットフォームライブラリのオーバーロードを使用する場合に気づくでしょう。

異なるシグネチャを持つ 2 つの `whichFun()` 関数を持つライブラリがあるとします。

```kotlin
// ライブラリの例

// MODULE: common
fun whichFun(x: Any) = println("common function")

// MODULE: JVM
fun whichFun(x: Int) = println("platform function")
```

共通コードで `whichFun()` 関数を呼び出すと、ライブラリ内で最も関連性の高い引数型を持つ関数が解決されます。

```kotlin
// JVM ターゲットに対して例のライブラリを使用するプロジェクト

// MODULE: common
fun main() {
    whichFun(2)
    // platform function
}
```

比較として、同じソースセット内で `whichFun()` のオーバーロードを宣言した場合、コードがプラットフォーム固有のバージョンにアクセスできないため、共通コードの関数が解決されます。

```kotlin
// 例のライブラリは使用されていない

// MODULE: common
fun whichFun(x: Any) = println("common function")

fun main() {
    whichFun(2)
    // common function
}

// MODULE: JVM
fun whichFun(x: Int) = println("platform function")
```

マルチプラットフォームライブラリと同様に、`commonTest` モジュールは別のソースセットにあるため、プラットフォーム固有のコードに依然としてアクセスできます。したがって、`commonTest` モジュールにおける関数呼び出しの解決は、古いコンパイルスキームと同じ動作を示します。

将来的には、これらの残りのケースも新しいコンパイルスキームとより一貫性のあるものになる予定です。

#### expected 宣言と actual 宣言における異なる可視性レベル

Kotlin 2.0.0 より前では、Kotlin Multiplatform プロジェクトで [expected 宣言と actual 宣言](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)を使用する場合、それらは同じ[可視性レベル](visibility-modifiers.md)である必要がありました。
Kotlin 2.0.0 では、actual 宣言が expected 宣言よりも **寛容（more permissive）** である場合に限り、異なる可視性レベルをサポートするようになりました。例：

```kotlin
expect internal class Attribute // 可視性は internal
actual class Attribute          // デフォルトで public、
                                // これは internal より寛容
```

同様に、actual 宣言で[型エイリアス](type-aliases.md)を使用している場合、**基になる型**の可視性は、expected 宣言と同じかそれ以上に寛容である必要があります。例：

```kotlin
expect internal class Attribute                 // 可視性は internal
internal actual typealias Attribute = Expanded

class Expanded                                  // デフォルトで public、
                                                // これは internal より寛容
```

### コンパイラプラグインのサポート

現在、Kotlin K2 コンパイラは以下の Kotlin コンパイラプラグインをサポートしています。

* [`all-open`](all-open-plugin.md)
* [AtomicFU](https://github.com/Kotlin/kotlinx-atomicfu)
* [`jvm-abi-gen`](https://github.com/JetBrains/kotlin/tree/master/plugins/jvm-abi-gen)
* [`js-plain-objects`](https://github.com/JetBrains/kotlin/tree/master/plugins/js-plain-objects)
* [kapt](whatsnew1920.md#preview-kapt-compiler-plugin-with-k2)
* [Lombok](lombok.md)
* [`no-arg`](no-arg-plugin.md)
* [Parcelize](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.plugin.parcelize)
* [SAM with receiver](sam-with-receiver-plugin.md)
* [serialization](serialization.md)
* [Power-assert](power-assert.md)

さらに、Kotlin K2 コンパイラは以下をサポートしています。

* [Jetpack Compose](https://developer.android.com/jetpack/compose) コンパイラプラグイン 2.0.0。[Kotlin リポジトリに移動](https://android-developers.googleblog.com/2024/04/jetpack-compose-compiler-moving-to-kotlin-repository.html)されました。
* [Kotlin Symbol Processing (KSP) プラグイン](ksp-overview.md)。[KSP2](https://android-developers.googleblog.com/2023/12/ksp2-preview-kotlin-k2-standalone.html) 以降。

> 他のコンパイラプラグインを使用している場合は、それらのドキュメントで K2 との互換性を確認してください。
>
{style="tip"}

### 実験的な Kotlin Power-assert コンパイラプラグイン

> Kotlin Power-assert プラグインは [Experimental](components-stability.md#stability-levels-explained)（実験的）です。
> いつでも変更される可能性があります。
>
{style="warning"}

Kotlin 2.0.0 では、実験的な Power-assert コンパイラプラグインが導入されました。このプラグインは、失敗メッセージにコンテキスト情報を含めることでテストの作成体験を向上させ、デバッグをより簡単かつ効率的にします。

開発者は効果的なテストを書くために、しばしば複雑なアサーションライブラリを必要とします。Power-assert プラグインは、アサーション式の途中経過の値を含む失敗メッセージを自動生成することで、このプロセスを簡素化します。これにより、開発者はテストが失敗した理由を迅速に理解できます。

テストでアサーションが失敗すると、改善されたエラーメッセージにアサーション内のすべての変数とサブ式の値が表示され、条件のどの部分が失敗の原因となったかが明確になります。これは、複数の条件がチェックされる複雑なアサーションにおいて特に有用です。

プロジェクトでプラグインを有効にするには、`build.gradle(.kts)` ファイルで設定します。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform") version "2.0.0"
    kotlin("plugin.power-assert") version "2.0.0"
}

powerAssert {
    functions = listOf("kotlin.assert", "kotlin.test.assertTrue")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '2.0.0'
    id 'org.jetbrains.kotlin.plugin.power-assert' version '2.0.0'
}

powerAssert {
    functions = ["kotlin.assert", "kotlin.test.assertTrue"]
}
```

</tab>
</tabs>

詳細は、[ドキュメントの Kotlin Power-assert プラグイン](power-assert.md)を参照してください。

### Kotlin K2 コンパイラを有効にする方法

Kotlin 2.0.0 以降、Kotlin K2 コンパイラはデフォルトで有効になっています。追加のアクションは不要です。

### Kotlin Playground で Kotlin K2 コンパイラを試す

Kotlin Playground は 2.0.0 リリースをサポートしています。[ぜひチェックしてください！](https://pl.kotl.in/czuoQprce)

### IDE でのサポート

デフォルトでは、IntelliJ IDEA と Android Studio は依然としてコード解析、コード補完、ハイライト、その他の IDE 関連機能に以前のコンパイラを使用しています。IDE で完全な Kotlin 2.0 体験を得るには、K2 モードを有効にしてください。

IDE の **Settings** | **Languages & Frameworks** | **Kotlin** で **Enable K2 mode** オプションを選択してください。IDE は K2 モードを使用してコードを解析します。

![K2 モードを有効にする](k2-mode.png){width=200}

K2 モードを有効にした後、コンパイラの動作変更により IDE の解析結果に違いが生じる場合があります。新しい K2 コンパイラが以前のものとどのように異なるかについては、[移行ガイド](k2-compiler-migration-guide.md)を参照してください。

* K2 モードの詳細は、[ブログ記事](https://blog.jetbrains.com/idea/2024/11/k2-mode-becomes-stable/)をご覧ください。
* K2 モードに関するフィードバックを積極的に募集しています。[パブリック Slack チャンネル](https://kotlinlang.slack.com/archives/C0B8H786P)で意見を共有してください。

### 新しい K2 コンパイラへのフィードバックをお願いします

皆様からのフィードバックをお待ちしております！

* 新しい K2 コンパイラで直面した問題は、[弊社の課題トラッカー](https://kotl.in/issue)に報告してください。
* [「Send usage statistics」（使用統計を送信する）オプションを有効](https://www.jetbrains.com/help/idea/settings-usage-statistics.html)にして、JetBrains が K2 の使用に関する匿名データを収集できるようにしてください。

## Kotlin/JVM

バージョン 2.0.0 以降、コンパイラは Java 22 バイトコードを含むクラスを生成できるようになりました。
また、このバージョンでは以下の変更も行われています。

* [invokedynamic を使用したラムダ関数の生成](#generation-of-lambda-functions-using-invokedynamic)
* [kotlinx-metadata-jvm ライブラリが Stable に](#the-kotlinx-metadata-jvm-library-is-stable)

### invokedynamic を使用したラムダ関数の生成

Kotlin 2.0.0 では、`invokedynamic` を使用してラムダ関数を生成する新しいデフォルト方法が導入されました。この変更により、従来の匿名クラス生成と比較して、アプリケーションのバイナリサイズが削減されます。

最初のバージョン以来、Kotlin はラムダを匿名クラスとして生成してきました。しかし、[Kotlin 1.5.0](whatsnew15.md#lambdas-via-invokedynamic) 以降、`-Xlambdas=indy` コンパイラオプションを使用することで `invokedynamic` による生成が可能になりました。Kotlin 2.0.0 では、`invokedynamic` がラムダ生成のデフォルト方法となりました。この方法はより軽量なバイナリを生成し、Kotlin を JVM の最適化に合わせることで、JVM パフォーマンスの継続的かつ将来的な改善の恩恵をアプリケーションが受けられるようにします。

現在、通常のラムダコンパイルと比較して、以下の 3 つの制限があります。

* `invokedynamic` にコンパイルされたラムダはシリアライズできません。
* 実験的な [`reflect()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.jvm/reflect.html) API は、`invokedynamic` によって生成されたラムダをサポートしていません。
* そのようなラムダに対して `.toString()` を呼び出すと、可読性の低い文字列表現が生成されます。

```kotlin
fun main() {
    println({})

    // Kotlin 1.9.24 とリフレクションを使用した場合：
    // () -> kotlin.Unit
    
    // Kotlin 2.0.0 では以下を返す：
    // FileKt$Lambda$13/0x00007f88a0004608@506e1b77
}
```

レガシーなラムダ関数生成動作を維持するには、以下のいずれかを行います。

* 特定のラムダに `@JvmSerializableLambda` をアノテーションする。
* コンパイラオプション `-Xlambdas=class` を使用して、モジュール内のすべてのラムダをレガシーな方法で生成する。

### kotlinx-metadata-jvm ライブラリが Stable に

Kotlin 2.0.0 では、`kotlinx-metadata-jvm` ライブラリが [Stable](components-stability.md#stability-levels-explained) になりました。ライブラリが `kotlin` パッケージと座標に変更されたため、現在は `kotlin-metadata-jvm`（"x" なし）として提供されています。

以前、`kotlinx-metadata-jvm` ライブラリは独自のパブリッシュスキームとバージョンを持っていました。今後は、Kotlin のリリースサイクルの一環として `kotlin-metadata-jvm` のアップデートを構築・公開し、Kotlin 標準ライブラリと同じ後方互換性を保証します。

`kotlin-metadata-jvm` ライブラリは、Kotlin/JVM コンパイラによって生成されたバイナリファイルのメタデータを読み取り、変更するための API を提供します。

<!-- `kotlinx-metadata-jvm` ライブラリの詳細は、[ドキュメント](kotlin-metadata-jvm.md)を参照してください。 -->

## Kotlin/Native

このバージョンでは、以下の変更が行われています。

* [signpost を使用した GC パフォーマンスの監視](#monitoring-gc-performance-with-signposts-on-apple-platforms)
* [Objective-C メソッドとの競合の解決](#resolving-conflicts-with-objective-c-methods)
* [Kotlin/Native におけるコンパイラ引数のログレベルの変更](#changed-log-level-for-compiler-arguments)
* [Kotlin/Native への標準ライブラリおよびプラットフォームの依存関係の明示的な追加](#explicitly-added-standard-library-and-platform-dependencies-to-kotlin-native)
* [Gradle 構成キャッシュにおけるタスクエラー](#tasks-error-in-gradle-configuration-cache)

### Apple プラットフォームにおける signpost を使用した GC パフォーマンス監視

以前は、Kotlin/Native のガベージコレクタ（GC）のパフォーマンスを監視するにはログを確認するしかありませんでした。しかし、これらのログは iOS アプリのパフォーマンス調査に人気のツールキットである Xcode Instruments と統合されていませんでした。

Kotlin 2.0.0 以降、GC は Instruments で利用可能な signpost を使用してポーズ（一時停止）を報告します。signpost を使用するとアプリ内でカスタムログを記録できるため、iOS アプリのパフォーマンスをデバッグする際に、GC のポーズがアプリケーションのフリーズに対応しているかどうかを確認できるようになりました。

詳細は、[ドキュメントの GC パフォーマンス分析](native-memory-manager.md#monitor-gc-performance)を参照してください。

### Objective-C メソッドとの競合の解決

Objective-C のメソッドは、名前は異なりますが引数の数と型が同じである場合があります。例えば、[`locationManager:didEnterRegion:`](https://developer.apple.com/documentation/corelocation/cllocationmanagerdelegate/1423560-locationmanager?language=objc) と [`locationManager:didExitRegion:`](https://developer.apple.com/documentation/corelocation/cllocationmanagerdelegate/1423630-locationmanager?language=objc) です。Kotlin では、これらのメソッドは同じシグネチャを持つため、これらを使用しようとすると conflicting overloads（オーバーロードの競合）エラーが発生します。

以前は、このコンパイルエラーを避けるために手動で conflicting overloads を抑制する必要がありました。Objective-C との Kotlin 相互運用性を向上させるために、Kotlin 2.0.0 では新しい `@ObjCSignatureOverride` アノテーションが導入されました。

このアノテーションは、Objective-C クラスから継承された、引数の型は同じで引数名が異なる複数の関数がある場合に、競合するオーバーロードを無視するよう Kotlin コンパイラに指示します。

このアノテーションを適用することは、一般的なエラー抑制よりも安全です。このアノテーションは、サポートおよびテストされている Objective-C メソッドのオーバーライドの場合にのみ使用できますが、一般的な抑制は重要なエラーを隠してしまい、知らぬ間に壊れたコードを生む可能性があります。

### コンパイラ引数のログレベルの変更

本リリースでは、`compile`、`link`、`cinterop` などの Kotlin/Native Gradle タスクにおけるコンパイラ引数のログレベルが `info` から `debug` に変更されました。

デフォルト値が `debug` になったことで、ログレベルは他の Gradle コンパイルタスクと一貫性を保ち、すべてのコンパイラ引数を含む詳細なデバッグ情報が提供されるようになります。

### Kotlin/Native への標準ライブラリおよびプラットフォームの依存関係の明示的な追加

以前は、Kotlin/Native コンパイラが標準ライブラリとプラットフォームの依存関係を暗黙的に解決していたため、Kotlin ターゲット間で Kotlin Gradle プラグインの動作に矛盾が生じていました。

今後は、各 Kotlin/Native Gradle コンパイルにおいて、`compileDependencyFiles` [コンパイルパラメータ](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#compilation-parameters)を介して、標準ライブラリとプラットフォームの依存関係をコンパイル時のライブラリパスに明示的に含めるようになります。

### Gradle 構成キャッシュにおけるタスクエラー

Kotlin 2.0.0 以降、以下のようなメッセージを伴う構成キャッシュエラーに遭遇することがあります。
`invocation of Task.project at execution time is unsupported`

このエラーは、`NativeDistributionCommonizerTask` や `KotlinNativeCompile` などのタスクで発生します。

しかし、これは誤検出のエラーです。根本的な原因は、`publish*` タスクのように、Gradle 構成キャッシュと互換性のないタスクが存在することです。

エラーメッセージが別の根本原因を示唆しているため、この不一致はすぐには明らかにならないかもしれません。

正確な原因がエラーレポートに明記されていないため、[Gradle チームはレポートを修正するためにこの問題にすでに取り組んでいます](https://github.com/gradle/gradle/issues/21290)。

## Kotlin/Wasm

Kotlin 2.0.0 では、パフォーマンスと JavaScript との相互運用性が向上しました。

* [Binaryen を使用したデフォルトのプロダクションビルド最適化](#optimized-production-builds-by-default-using-binaryen)
* [名前付きエクスポートのサポート](#support-for-named-export)
* [符号なしプリミティブ型の @JsExport サポート](#support-for-unsigned-primitive-types-in-functions-with-jsexport)
* [Kotlin/Wasm における TypeScript 宣言ファイルの生成](#generation-of-typescript-declaration-files-in-kotlin-wasm)
* [JavaScript 例外のキャッチのサポート](#support-for-catching-javascript-exceptions)
* [新しい例外処理プロポーザルがオプションとしてサポート](#new-exception-handling-proposal-is-now-supported-as-an-option)
* [`withWasm()` 関数が JS と WASI バリアントに分割](#the-withwasm-function-is-split-into-js-and-wasi-variants)

### Binaryen を使用したデフォルトのプロダクションビルド最適化

Kotlin/Wasm ツールチェーンは、以前の手動セットアップのアプローチとは異なり、すべてのプロジェクトのプロダクションコンパイル時に [Binaryen](https://github.com/WebAssembly/binaryen) ツールを適用するようになりました。弊社の見積もりでは、これによりランタイムパフォーマンスが向上し、プロジェクトのバイナリサイズが削減されます。

> この変更はプロダクション（本番）コンパイルにのみ影響します。開発用コンパイルプロセスは変更されません。
>
{style="note"}

### 名前付きエクスポートのサポート

以前は、Kotlin/Wasm からエクスポートされたすべての宣言は、デフォルトエクスポート（default export）を使用して JavaScript にインポートされていました。

```javascript
//JavaScript:
import Module from "./index.mjs"

Module.add()
```

今後は、`@JsExport` とマークされた各 Kotlin 宣言を名前でインポートできます。

```kotlin
// Kotlin:
@JsExport
fun add(a: Int, b: Int) = a + b
```

```javascript
//JavaScript:
import { add } from "./index.mjs"
```

名前付きエクスポートにより、Kotlin モジュールと JavaScript モジュール間でのコード共有が容易になります。可読性が向上し、モジュール間の依存関係の管理に役立ちます。

### @JsExport 関数における符号なしプリミティブ型のサポート

Kotlin 2.0.0 以降、外部宣言や、Kotlin/Wasm 関数を JavaScript コードで利用可能にする `@JsExport` アノテーションが付いた関数内で[符号なしプリミティブ型](unsigned-integer-types.md)を使用できるようになりました。

これにより、[符号なしプリミティブ](unsigned-integer-types.md)をエクスポートされた宣言や外部宣言内で直接使用することを妨げていた以前の制限が緩和されます。符号なしプリミティブを戻り値やパラメータ型として持つ関数をエクスポートしたり、符号なしプリミティブを返したり受け取ったりする外部宣言を利用したりできるようになりました。

Kotlin/Wasm と JavaScript の相互運用性の詳細は、[ドキュメント](wasm-js-interop.md#use-javascript-code-in-kotlin)を参照してください。

### Kotlin/Wasm における TypeScript 宣言ファイルの生成

> Kotlin/Wasm における TypeScript 宣言ファイルの生成は [Experimental](components-stability.md#stability-levels-explained)（実験的）です。
> いつでも削除または変更される可能性があります。
>
{style="warning"}

Kotlin 2.0.0 では、Kotlin/Wasm コンパイラは Kotlin コード内の `@JsExport` 宣言から TypeScript 定義を生成できるようになりました。これらの定義は、IDE や JavaScript ツールでコードの自動補完や型チェックを提供するために使用でき、JavaScript への Kotlin コードの組み込みを容易にします。

Kotlin/Wasm コンパイラは、`@JsExport` とマークされた[トップレベル関数](wasm-js-interop.md#functions-with-the-jsexport-annotation)を収集し、自動的に `.d.ts` ファイルに TypeScript 定義を生成します。

TypeScript 定義を生成するには、`build.gradle(.kts)` ファイルの `wasmJs {}` ブロックに `generateTypeScriptDefinitions()` 関数を追加します。

```kotlin
kotlin {
    wasmJs {
        binaries.executable()
        browser {
        }
        generateTypeScriptDefinitions()
    }
}
```

### JavaScript 例外のキャッチのサポート

以前は、Kotlin/Wasm コードで JavaScript の例外をキャッチできなかったため、プログラムの JavaScript 側から発生するエラーの処理が困難でした。

Kotlin 2.0.0 では、Kotlin/Wasm 内で JavaScript の例外をキャッチする機能を実装しました。この実装により、`try-catch` ブロックで `Throwable` や `JsException` などの特定の型を使用して、これらのエラーを適切に処理できるようになります。

さらに、例外に関係なくコードを実行するのに役立つ `finally` ブロックも正しく動作します。JavaScript 例外のキャッチのサポートを導入する一方で、コールスタックなどの JavaScript 例外が発生した際の追加情報は提供されません。ただし、[これらの実装については現在取り組んでいます](https://youtrack.jetbrains.com/issue/KT-68185/WasmJs-Attach-js-exception-object-to-JsException)。

### 新しい例外処理プロポーザルがオプションとしてサポート

本リリースでは、Kotlin/Wasm 内で WebAssembly の新しいバージョンの[例外処理プロポーザル](https://github.com/WebAssembly/exception-handling/blob/main/proposals/exception-handling/Exceptions.md)のサポートを導入します。

このアップデートにより、新しいプロポーザルが Kotlin の要件に適合するようになり、最新バージョンのプロポーザルのみをサポートする仮想マシン上で Kotlin/Wasm を使用できるようになります。

デフォルトではオフになっている `-Xwasm-use-new-exception-proposal` コンパイラオプションを使用して、新しい例外処理プロポーザルを有効にしてください。

### withWasm() 関数が JS と WASI バリアントに分割

以前の階層テンプレートで Wasm ターゲットを提供していた `withWasm()` 関数は非推奨となり、特化した `withWasmJs()` と `withWasmWasi()` 関数に置き換わりました。

これにより、ツリー定義内の異なるグループ間で WASI と JS ターゲットを分けることができるようになります。

## Kotlin/JS

その他の変更に加えて、このバージョンでは現代的な JS コンパイルが Kotlin に導入され、ES2015 標準のより多くの機能がサポートされます。

* [新しいコンパイルターゲット](#new-compilation-target)
* [ES2015 ジェネレータとしての suspend 関数](#suspend-functions-as-es2015-generators)
* [main 関数への引数の受け渡し](#passing-arguments-to-the-main-function)
* [Kotlin/JS プロジェクトのファイルごとのコンパイル](#per-file-compilation-for-kotlin-js-projects)
* [コレクションの相互運用性の向上](#improved-collection-interoperability)
* [createInstance() のサポート](#support-for-createinstance)
* [型安全なプレーン JavaScript オブジェクトのサポート](#support-for-type-safe-plain-javascript-objects)
* [npm パッケージマネージャーのサポート](#support-for-npm-package-manager)
* [コンパイルタスクの変更](#changes-to-compilation-tasks)
* [レガシーな Kotlin/JS JAR アーティファクトの廃止](#discontinuing-legacy-kotlin-js-jar-artifacts)

### 新しいコンパイルターゲット

Kotlin 2.0.0 では、Kotlin/JS に新しいコンパイルターゲット `es2015` を追加しました。これは、Kotlin でサポートされているすべての ES2015 機能を一度に有効にする新しい方法です。

`build.gradle(.kts)` ファイルで以下のように設定できます。

```kotlin
kotlin {
    js {
        compilerOptions {
            target.set("es2015")
        }
    }
}
```

新しいターゲットは、[ES クラスとモジュール](whatsnew19.md#experimental-support-for-es2015-classes-and-modules)および新しくサポートされた [ES ジェネレータ](#suspend-functions-as-es2015-generators)を自動的に有効にします。

### ES2015 ジェネレータとしての suspend 関数

本リリースでは、[suspend 関数](composing-suspending-functions.md)をコンパイルするための ES2015 ジェネレータの [Experimental](components-stability.md#stability-levels-explained)（実験的）サポートを導入しました。

ステートマシンの代わりにジェネレータを使用することで、プロジェクトの最終的なバンドルサイズが改善されます。例えば、JetBrains チームは、ES2015 ジェネレータを使用することで Space プロジェクトのバンドルサイズを 20% 削減することに成功しました。

[ES2015 (ECMAScript 2015, ES6) の詳細は公式ドキュメントを参照してください](https://262.ecma-international.org/6.0/)。

### main 関数への引数の受け渡し

Kotlin 2.0.0 以降、`main()` 関数の `args` のソースを指定できるようになりました。この機能により、コマンドラインの操作や引数の受け渡しが容易になります。

これを行うには、`js {}` ブロック内に、文字列の配列を返す新しい `passAsArgumentToMainFunction()` 関数を定義します。

```kotlin
kotlin {
    js {
        binary.executable()
        passAsArgumentToMainFunction("Deno.args")
    }
}
```

この関数はランタイムで実行されます。JavaScript の式を受け取り、それを `main()` 関数の呼び出し時の引数 `args: Array<String>` として使用します。

また、Node.js ランタイムを使用している場合は、特別なエイリアスを利用できます。これにより、毎回手動で追加する代わりに、一度に `process.argv` を `args` パラメータに渡すことができます。

```kotlin
kotlin {
    js {
        binary.executable()
        nodejs {
            passProcessArgvToMainFunction()
        }
    }
}
```

### Kotlin/JS プロジェクトのファイルごとのコンパイル

Kotlin 2.0.0 では、Kotlin/JS プロジェクトの出力に関する新しい粒度のオプションが導入されました。各 Kotlin ファイルに対して 1 つの JavaScript ファイルを生成する、ファイルごとのコンパイルを設定できるようになりました。これにより、最終的なバンドルサイズの大幅な最適化とプログラムのロード時間の短縮に役立ちます。

以前は、出力オプションは 2 つしかありませんでした。Kotlin/JS コンパイラは、プロジェクト全体に対して単一の `.js` ファイルを生成することができましたが、このファイルは非常に大きくなり、使いにくい場合がありました。プロジェクトの関数を使用したいときは常に、JavaScript ファイル全体を依存関係として含める必要がありました。あるいは、プロジェクトモジュールごとに個別の `.js` ファイルをコンパイルするように設定することもでき、これが現在もデフォルトのオプションです。

モジュールファイルも大きくなりすぎる可能性があるため、Kotlin 2.0.0 では、各 Kotlin ファイルにつき 1 つ（ファイルにエクスポートされた宣言が含まれている場合は 2 つ）の JavaScript ファイルを生成する、より詳細な出力を追加しました。ファイルごとのコンパイルモードを有効にするには：

1. ECMAScript モジュールをサポートするために、[`useEsModules()`](whatsnew19.md#experimental-support-for-es2015-classes-and-modules) 関数をビルドファイルに追加します。

   ```kotlin
   // build.gradle.kts
   kotlin {
       js(IR) {
           useEsModules() // ES2015 モジュールを有効化
           browser()
       }
   }
   ```

   このために、新しい `es2015` [コンパイルターゲット](#new-compilation-target)を使用することもできます。

2. `-Xir-per-file` コンパイラオプションを適用するか、`gradle.properties` ファイルを以下のように更新します。

   ```none
   # gradle.properties
   kotlin.js.ir.output.granularity=per-file // `per-module` がデフォルト
   ```

### コレクションの相互運用性の向上

Kotlin 2.0.0 以降、シグネチャ内に Kotlin コレクション型を持つ宣言を JavaScript（および TypeScript）にエクスポートできるようになりました。これは `Set`、`Map`、`List` の各コレクション型と、それらに対応するミュータブルな型に適用されます。

JavaScript で Kotlin コレクションを使用するには、まず必要な宣言を [`@JsExport`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-js-export/) アノテーションでマークします。

```kotlin
// Kotlin
@JsExport
data class User(
    val name: String,
    val friends: `List<User>` = emptyList()
)

@JsExport
val me = User(
    name = "Me",
    friends = listOf(User(name = "Kodee"))
)
```

その後、JavaScript から通常の JavaScript 配列として利用できます。

```javascript
// JavaScript
import { User, me, KtList } from "my-module"

const allMyFriendNames = me.friends
    .asJsReadonlyArrayView()
    .map(x => x.name) // ['Kodee']
```

> 残念ながら、JavaScript から Kotlin コレクションを作成することはまだできません。この機能は Kotlin 2.0.20 で追加される予定です。
>
{style="note"}

### createInstance() のサポート

Kotlin 2.0.0 以降、Kotlin/JS ターゲットから [`createInstance()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.full/create-instance.html) 関数を使用できるようになりました。以前は JVM 上でのみ利用可能でした。

[KClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/) インターフェースのこの関数は、指定されたクラスの新しいインスタンスを作成します。これは、Kotlin クラスへのランタイム参照を取得する際に役立ちます。

### 型安全なプレーン JavaScript オブジェクトのサポート

> `js-plain-objects` プラグインは [Experimental](components-stability.md#stability-levels-explained)（実験的）です。
> いつでも削除または変更される可能性があります。`js-plain-objects` プラグインは K2 コンパイラ **のみ** をサポートします。
>
{style="warning"}

JavaScript API との連携を容易にするために、Kotlin 2.0.0 では型安全なプレーン JavaScript オブジェクトを作成するために使用できる新しいプラグイン [`js-plain-objects`](https://github.com/JetBrains/kotlin/tree/master/plugins/js-plain-objects) を提供します。プラグインは、コード内で `@JsPlainObject` アノテーションが付いた[外部インターフェース](wasm-js-interop.md#external-interfaces)をチェックし、以下を追加します。

* コンストラクタとして使用できる、コンパニオンオブジェクト内のインライン `invoke` 演算子関数。
* 一部のプロパティを調整しながらオブジェクトのコピーを作成するために使用できる `.copy()` 関数。

例：

```kotlin
import kotlinx.js.JsPlainObject

@JsPlainObject
external interface User {
    var name: String
    val age: Int
    val email: String?
}

fun main() {
    // JavaScript オブジェクトを作成
    val user = User(name = "Name", age = 10)
    // オブジェクトをコピーし、email を追加
    val copy = user.copy(age = 11, email = "some@user.com")

    println(JSON.stringify(user))
    // { "name": "Name", "age": 10 }
    println(JSON.stringify(copy))
    // { "name": "Name", "age": 11, "email": "some@user.com" }
}
```

このアプローチで作成された JavaScript オブジェクトは、実行時にしかエラーを確認できないのではなく、コンパイル時にエラーを確認したり、IDE でハイライトされたりするため、より安全です。

JavaScript オブジェクトの形状を記述するために外部インターフェースを使用し、JavaScript API と対話するために `fetch()` 関数を使用するこの例を考えてみましょう。

```kotlin
import kotlinx.js.JsPlainObject

@JsPlainObject
external interface FetchOptions {
    val body: String?
    val method: String
}

// Window.fetch のラッパー
suspend fun fetch(url: String, options: FetchOptions? = null) = TODO("ここにカスタム動作を追加")

// "metod" は method として認識されないため、コンパイルエラーが発生
fetch("https://google.com", options = FetchOptions(metod = "POST"))
// method が必須であるため、コンパイルエラーが発生
fetch("https://google.com", options = FetchOptions(body = "SOME STRING")) 
```

比較として、JavaScript オブジェクトを作成するために代わりに `js()` 関数を使用した場合、エラーは実行時にしか見つからないか、まったく発生しません。

```kotlin
suspend fun fetch(url: String, options: FetchOptions? = null) = TODO("ここにカスタム動作を追加")

// エラーは発生しない。"metod" は認識されないため、間違ったメソッド (GET) が使用される。
fetch("https://google.com", options = js("{ metod: 'POST' }"))

// デフォルトでは GET メソッドが使用される。body が存在してはならないため、実行時エラーが発生する。
fetch("https://google.com", options = js("{ body: 'SOME STRING' }"))
// TypeError: Window.fetch: HEAD or GET Request cannot have a body
```

`js-plain-objects` プラグインを使用するには、`build.gradle(.kts)` ファイルに以下を追加します。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("plugin.js-plain-objects") version "2.0.0"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.plugin.js-plain-objects" version "2.0.0"
}
```

</tab>
</tabs>

### npm パッケージマネージャーのサポート

以前は、Kotlin Multiplatform Gradle プラグインが npm 依存関係をダウンロードおよびインストールするために [Yarn](https://yarnpkg.com/lang/en/) をパッケージマネージャーとして使用することしかできませんでした。Kotlin 2.0.0 からは、代わりに [npm](https://www.npmjs.com/) をパッケージマネージャーとして使用できます。npm をパッケージマネージャーとして使用することで、セットアップ中に管理するツールを 1 つ減らすことができます。

後方互換性のために、引き続き Yarn がデフォルトのパッケージマネージャーとなります。npm をパッケージマネージャーとして使用するには、`gradle.properties` ファイルに以下のプロパティを設定します。

```kotlin
kotlin.js.yarn = false
```

### コンパイルタスクの変更

以前は、`webpack` タスクと `distributeResources` コンパイルタスクの両方が同じディレクトリをターゲットにしていました。さらに、`distribution` タスクも出力ディレクトリとして `dist` を宣言していました。これにより出力が重複し、コンパイル警告が発生していました。

そこで、Kotlin 2.0.0 以降、以下の変更を実装しました。

* `webpack` タスクは別のフォルダをターゲットにするようになりました。
* `distributeResources` タスクは完全に削除されました。
* `distribution` タスクは `Copy` 型になり、`dist` フォルダをターゲットにするようになりました。

### レガシーな Kotlin/JS JAR アーティファクトの廃止

Kotlin 2.0.0 以降、Kotlin 配布物には拡張子が `.jar` のレガシーな Kotlin/JS アーティファクトが含まれなくなりました。レガシーアーティファクトはサポートされていない古い Kotlin/JS コンパイラで使用されていましたが、`klib` 形式を使用する IR コンパイラでは不要です。

## Gradle の改善

Kotlin 2.0.0 は、Gradle 6.8.3 から 8.5 までと完全な互換性があります。最新の Gradle リリースまでのバージョンも使用できますが、その場合は非推奨の警告が表示されたり、一部の新しい Gradle 機能が動作しなかったりする可能性があることに注意してください。

このバージョンでは、以下の変更が行われています。

* [マルチプラットフォームプロジェクトのコンパイラオプション用の新しい Gradle DSL](#new-gradle-dsl-for-compiler-options-in-multiplatform-projects)
* [新しい Compose コンパイラ Gradle プラグイン](#new-compose-compiler-gradle-plugin)
* [JVM および Android 公開ライブラリを区別するための新しい属性](#new-attribute-to-distinguish-jvm-and-android-published-libraries)
* [Kotlin/Native における CInteropProcess の Gradle 依存関係処理の改善](#improved-gradle-dependency-handling-for-cinteropprocess-in-kotlin-native)
* [Gradle における可視性の変更](#visibility-changes-in-gradle)
* [Gradle プロジェクトにおける Kotlin データ用の新しいディレクトリ](#new-directory-for-kotlin-data-in-gradle-projects)
* [必要に応じた Kotlin/Native コンパイラのダウンロード](#kotlin-native-compiler-downloaded-when-needed)
* [コンパイラオプション定義の古い方法の非推奨化](#deprecated-old-ways-of-defining-compiler-options)
* [最小サポート AGP バージョンの引き上げ](#bumped-minimum-supported-agp-version)
* [最新の言語バージョンを試すための新しい Gradle プロパティ](#new-gradle-property-for-trying-the-latest-language-version)
* [ビルドレポート用の新しい JSON 出力形式](#new-json-output-format-for-build-reports)
* [kapt 構成がスーパー構成からアノテーションプロセッサを継承](#kapt-configurations-inherit-annotation-processors-from-superconfigurations)
* [Kotlin Gradle プラグインが非推奨の Gradle コンベンションを使用しなくなった](#kotlin-gradle-plugin-no-longer-uses-deprecated-gradle-conventions)

### マルチプラットフォームプロジェクトのコンパイラオプション用の新しい Gradle DSL

> この機能は [Experimental](components-stability.md#stability-levels-explained)（実験的）です。いつでも削除または変更される可能性があります。評価目的でのみ使用してください。[YouTrack](https://kotl.in/issue) でのフィードバックをお待ちしております。
>
{style="warning"}

Kotlin 2.0.0 より前では、Gradle を使用したマルチプラットフォームプロジェクトでのコンパイラオプションの設定は、タスク、コンパイル、またはソースセットごとといった低レベルでしか行えませんでした。プロジェクト全体でより一般的にコンパイラオプションを設定しやすくするために、Kotlin 2.0.0 には新しい Gradle DSL が導入されています。

この新しい DSL を使用すると、すべてのターゲットおよび `commonMain` などの共有ソースセットに対する拡張レベル、および特定のターゲットに対するターゲットレベルでコンパイラオプションを設定できます。

```kotlin
kotlin {
    compilerOptions {
        // すべてのターゲットおよび共有ソースセットのデフォルトとして使用される、
        // 拡張レベルの共通コンパイラオプション
        allWarningsAsErrors.set(true)
    }
    jvm {
        compilerOptions {
            // このターゲット内のすべてのコンパイルのデフォルトとして使用される、
            // ターゲットレベルの JVM コンパイラオプション
            noJdk.set(true)
        }
    }
}
```

プロジェクト全体の構成は、3 つのレイヤーで構成されるようになりました。最上位は拡張レベル、次がターゲットレベル、そして最下位がコンパイルユニット（通常はコンパイルタスク）です。

![Kotlin コンパイラオプションのレベル](compiler-options-levels.svg){width=700}

上位レベルの設定は、下位レベルのコンベンション（デフォルト）として使用されます。

* 拡張レベルのコンパイラオプションの値は、`commonMain`、`nativeMain`、`commonTest` などの共有ソースセットを含むターゲットコンパイラオプションのデフォルトとなります。
* ターゲットレベルのコンパイラオプションの値は、`compileKotlinJvm` や `compileTestKotlinJvm` タスクなどのコンパイルユニット（タスク）コンパイラオプションのデフォルトとして使用されます。

一方で、下位レベルで行われた構成は、上位レベルの関連設定を上書きします。

* タスクレベルのコンパイラオプションは、ターゲットまたは拡張レベルの関連構成を上書きします。
* ターゲットレベルのコンパイラオプションは、拡張レベルの関連構成を上書きします。

プロジェクトを構成する際は、コンパイラオプションを設定する一部の古い方法が[非推奨](#deprecated-old-ways-of-defining-compiler-options)になったことに注意してください。

この DSL をコンパイラオプション設定の推奨アプローチにする予定ですので、マルチプラットフォームプロジェクトで新しい DSL を試して、[YouTrack](https://kotl.in/issue) にフィードバックをお寄せください。

### 新しい Compose コンパイラ Gradle プラグイン

コンポーザブルを Kotlin コードに変換する Jetpack Compose コンパイラが、Kotlin リポジトリに統合されました。これにより、Compose コンパイラが常に Kotlin と同時にリリースされるようになるため、Compose プロジェクトの Kotlin 2.0.0 への移行が容易になります。また、Compose コンパイラのバージョンも 2.0.0 に引き上げられます。

プロジェクトで新しい Compose コンパイラを使用するには、`build.gradle(.kts)` ファイルに `org.jetbrains.kotlin.plugin.compose` Gradle プラグインを適用し、そのバージョンを Kotlin 2.0.0 と等しく設定します。

この変更の詳細は、[Compose コンパイラ](https://kotlinlang.org/docs/multiplatform/compose-compiler.html)のドキュメントを参照してください。

### JVM および Android 公開ライブラリを区別するための新しい属性

Kotlin 2.0.0 以降、[`org.gradle.jvm.environment`](https://docs.gradle.org/current/userguide/variant_attributes.html#sub:jvm_default_attributes) Gradle 属性がすべての Kotlin バリアントでデフォルトで公開されます。

この属性は、Kotlin Multiplatform ライブラリの JVM バリアントと Android バリアントを区別するのに役立ちます。これは、特定のライブラリバリアントが特定の JVM 環境に適していることを示します。ターゲット環境は "android"、"standard-jvm"、または "no-jvm" になります。

この属性を公開することで、Java 限定プロジェクトなどの非マルチプラットフォームクライアントからも、JVM および Android ターゲットを持つ Kotlin Multiplatform ライブラリをより堅牢に利用できるようになります。

必要に応じて、属性の公開を無効にできます。その場合は、`gradle.properties` ファイルに以下の Gradle オプションを追加します。

```none
kotlin.publishJvmEnvironmentAttribute=false
```

### Kotlin/Native における CInteropProcess の Gradle 依存関係処理の改善

本リリースでは、Kotlin/Native プロジェクトにおける Gradle タスクの依存関係管理を改善するため、`defFile` プロパティの処理を強化しました。

このアップデート以前は、`defFile` プロパティがまだ実行されていない別のタスクの出力として指定されている場合、Gradle ビルドが失敗することがありました。この問題の回避策として、このタスクへの依存関係を追加する必要がありました。

```kotlin
kotlin {
    macosArm64("native") {
        compilations.getByName("main") {
            cinterops {
                val cinterop by creating {
                    defFileProperty.set(createDefFileTask.flatMap { it.defFile.asFile })
                    project.tasks.named(interopProcessingTaskName).configure {
                        dependsOn(createDefFileTask)
                    }
                }
            }
        }
    }
}
```

これを修正するために、`definitionFile` という新しい `RegularFileProperty` プロパティが導入されました。現在、Gradle はビルドプロセスの後半で接続されたタスクが実行された後に、`definitionFile` プロパティの存在を遅延検証します。この新しいアプローチにより、追加の依存関係が不要になります。

`CInteropProcess` タスクと `CInteropSettings` クラスは、`defFile` および `defFileProperty` の代わりに `definitionFile` プロパティを使用します。

<tabs group ="build-script">
<tab id="kotlin" title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    macosArm64("native") {
        compilations.getByName("main") {
            cinterops {
                val cinterop by creating {
                    definitionFile.set(project.file("def-file.def"))
                }
            }
        }
    }
}
```

</tab>
<tab id="groovy" title="Groovy" group-key="groovy">

```groovy
kotlin {
    macosArm64("native") {
        compilations.main {
            cinterops {
                cinterop {
                    definitionFile.set(project.file("def-file.def"))
                }
            }
        }
    }
}
```

</tab>
</tabs>

> `defFile` および `defFileProperty` パラメータは非推奨となりました。
>
{style="warning"}

### Gradle における可視性の変更

> この変更は Kotlin DSL ユーザーにのみ影響します。
>
{style="note"}

Kotlin 2.0.0 では、ビルドスクリプトの制御と安全性を高めるために Kotlin Gradle プラグインを変更しました。以前は、特定の DSL コンテキストを対象とした一部の Kotlin DSL 関数やプロパティが、意図せず他の DSL コンテキストに漏洩していました。この漏洩により、間違ったコンパイラオプションの使用、設定の重複適用、その他の誤設定を招く可能性がありました。

```kotlin
kotlin {
    // ターゲット DSL は kotlin{} 拡張 DSL で定義された
    // メソッドやプロパティにアクセスできませんでした
    jvm {
        // コンパイル DSL は kotlin{} 拡張 DSL および 
        // Kotlin jvm{} ターゲット DSL で定義された
        // メソッドやプロパティにアクセスできませんでした
        compilations.configureEach {
            // コンパイルタスク DSL は kotlin{} 拡張、Kotlin jvm{}
            // ターゲット、または Kotlin コンパイル DSL で定義された
            // メソッドやプロパティにアクセスできませんでした
            compileTaskProvider.configure {
                // 例えば：
                explicitApi()
                // kotlin{} 拡張 DSL で定義されているためエラー
                mavenPublication {}
                // Kotlin jvm{} ターゲット DSL で定義されているためエラー
                defaultSourceSet {}
                // Kotlin コンパイル DSL で定義されているためエラー
            }
        }
    }
}
```

この問題を解決するために、`@KotlinGradlePluginDsl` アノテーションを追加し、Kotlin Gradle プラグインの DSL 関数やプロパティが、意図しないレベルで公開されるのを防ぐようにしました。以下のレベルが互いに分離されています。

* Kotlin 拡張
* Kotlin ターゲット
* Kotlin コンパイル
* Kotlin コンパイルタスク

最も一般的なケースについては、ビルドスクリプトが正しく構成されていない場合に、修正方法の提案を含むコンパイラ警告を追加しました。例：

```kotlin
kotlin {
    jvm {
        sourceSets.getByName("jvmMain").dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core-jvm:1.7.3")
        }
    }
}
```

この場合、`sourceSets` に対する警告メッセージは以下のようになります。

```none
[DEPRECATION] 'sourceSets: NamedDomainObjectContainer<KotlinSourceSet>' is deprecated.Accessing 'sourceSets' container on the Kotlin target level DSL is deprecated. Consider configuring 'sourceSets' on the Kotlin extension level.
```

この変更に関するフィードバックをお待ちしております！[#gradle Slack チャンネル](https://kotlinlang.slack.com/archives/C19FD9681)で Kotlin 開発者に直接コメントをお寄せください。[Slack 招待はこちら](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)。

### Gradle プロジェクトにおける Kotlin データ用の新しいディレクトリ

> `.kotlin` ディレクトリをバージョン管理にコミットしないでください。
> 例えば、Git を使用している場合は、プロジェクトの `.gitignore` ファイルに `.kotlin` を追加してください。
>
{style="warning"}

Kotlin 1.8.20 では、Kotlin Gradle プラグインはデータを Gradle プロジェクトキャッシュディレクトリ（`<project-root-directory>/.gradle/kotlin`）に保存するように切り替えられました。しかし、`.gradle` ディレクトリは Gradle 専用に予約されており、将来性がありません。

これを解決するため、Kotlin 2.0.0 以降、デフォルトで Kotlin データを `<project-root-directory>/.kotlin` に保存するようにします。後方互換性のために、一部のデータは引き続き `.gradle/kotlin` ディレクトリに保存されます。

構成可能な新しい Gradle プロパティは以下の通りです。

| Gradle プロパティ                                     | 説明                                                                                                        |
|-----------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| `kotlin.project.persistent.dir`                     | プロジェクトレベルのデータが保存される場所を構成します。デフォルト：`<project-root-directory>/.kotlin`       |
| `kotlin.project.persistent.dir.gradle.disableWrite` | Kotlin データの `.gradle` ディレクトリへの書き込みを無効にするかどうかを制御するブール値。デフォルト：`false` |

これらのプロパティを有効にするには、プロジェクトの `gradle.properties` ファイルに追加してください。

### 必要に応じた Kotlin/Native コンパイラのダウンロード

Kotlin 2.0.0 より前では、マルチプラットフォームプロジェクトの Gradle ビルドスクリプトに [Kotlin/Native ターゲット](native-target-support.md)が構成されている場合、Gradle は常に [構成フェーズ](https://docs.gradle.org/current/userguide/build_lifecycle.html#sec:configuration) で Kotlin/Native コンパイラをダウンロードしていました。

これは、[実行フェーズ](https://docs.gradle.org/current/userguide/build_lifecycle.html#sec:execution) で Kotlin/Native ターゲットのコードをコンパイルするタスクが実行される予定がない場合でも発生していました。このように Kotlin/Native コンパイラをダウンロードすることは、プロジェクトの JVM または JavaScript コードのみをチェックしたいユーザー（例えば、CI プロセスの一環としてテストやチェックを行う場合など）にとって特に非効率的でした。

Kotlin 2.0.0 では、Kotlin Gradle プラグインにおいてこの動作を変更し、Kotlin/Native コンパイラが [実行フェーズ](https://docs.gradle.org/current/userguide/build_lifecycle.html#sec:execution) で、かつ Kotlin/Native ターゲットのコンパイルがリクエストされた **場合にのみ** ダウンロードされるようにしました。

同様に、Kotlin/Native コンパイラの依存関係も、コンパイラの一部としてではなく、実行フェーズでダウンロードされるようになりました。

新しい動作で問題が発生した場合は、`gradle.properties` ファイルに以下の Gradle プロパティを追加することで、一時的に以前の動作に戻すことができます。

```none
kotlin.native.toolchain.enabled=false
```

Kotlin 1.9.20-Beta 以降、Kotlin/Native 配布物は CDN に加えて [Maven Central](https://repo.maven.apache.org/maven2/org/jetbrains/kotlin/kotlin-native-prebuilt/) にも公開されています。

これにより、Kotlin が必要なアーティファクトを探してダウンロードする方法を変更することができました。デフォルトでは、CDN の代わりに、プロジェクトの `repositories {}` ブロックで指定した Maven リポジトリが使用されます。

この動作は、`gradle.properties` ファイルで以下の Gradle プロパティを設定することで、一時的に元に戻すことができます。

```none
kotlin.native.distribution.downloadFromMaven=false
```

問題がある場合は、弊社の課題トラッカー [YouTrack](https://kotl.in/issue) に報告してください。デフォルトの動作を変更するこれらの Gradle プロパティは両方とも一時的なものであり、将来のリリースで削除される予定です。

### コンパイラオプション定義の古い方法の非推奨化

本リリースでは、コンパイラオプションの設定方法を引き続き洗練させています。これにより、異なる方法間の曖昧さを解消し、プロジェクト構成をよりシンプルにするはずです。

Kotlin 2.0.0 以降、以下のコンパイラオプションを指定するための DSL は非推奨となりました。

* すべての Kotlin コンパイルタスクを実装する `KotlinCompile` インターフェースの `kotlinOptions` DSL。代わりに `KotlinCompilationTask<CompilerOptions>` を使用してください。
* `KotlinCompilation` インターフェースの `HasCompilerOptions` 型を持つ `compilerOptions` プロパティ。この DSL は他の DSL と矛盾しており、`KotlinCompilation.compileTaskProvider` コンパイルタスク内の `compilerOptions` と同じ `KotlinCommonCompilerOptions` オブジェクトを構成していたため、混乱を招いていました。

  代わりに、Kotlin コンパイルタスクの `compilerOptions` プロパティを使用することをお勧めします。

  ```kotlin
  kotlinCompilation.compileTaskProvider.configure {
      compilerOptions { ... }
  }
  ```

  例：

  ```kotlin
  kotlin {
      js(IR) {
          compilations.all {
              compileTaskProvider.configure {
                  compilerOptions.freeCompilerArgs.add("-Xir-minimized-member-names=false")
              }
          }
      }
  }
  ```

* `KotlinCompilation` インターフェースの `kotlinOptions` DSL。
* `KotlinNativeArtifactConfig` インターフェース、`KotlinNativeLink` クラス、および `KotlinNativeLinkArtifactTask` クラスの `kotlinOptions` DSL。代わりに `toolOptions` DSL を使用してください。
* `KotlinJsDce` インターフェースの `dceOptions` DSL。代わりに `toolOptions` DSL を使用してください。

Kotlin Gradle プラグインでのコンパイラオプションの指定方法の詳細は、[オプションの定義方法](gradle-compiler-options.md#how-to-define-options)を参照してください。

### 最小サポート AGP バージョンの引き上げ

Kotlin 2.0.0 以降、サポートされる Android Gradle プラグインの最小バージョンは 7.1.3 となりました。

### 最新の言語バージョンを試すための新しい Gradle プロパティ

Kotlin 2.0.0 より前は、新しい K2 コンパイラを試すために `kotlin.experimental.tryK2` という Gradle プロパティがありました。Kotlin 2.0.0 で K2 コンパイラがデフォルトで有効になったため、このプロパティを、プロジェクトで最新の言語バージョンを試すために使用できる新しい形式 `kotlin.experimental.tryNext` に進化させることにしました。`gradle.properties` ファイルでこのプロパティを使用すると、Kotlin Gradle プラグインは、使用している Kotlin バージョンのデフォルト値よりも 1 つ上の言語バージョンに引き上げます。例えば、Kotlin 2.0.0 ではデフォルトの言語バージョンは 2.0 なので、このプロパティは言語バージョン 2.1 を構成します。

この新しい Gradle プロパティは、以前の `kotlin.experimental.tryK2` と同様のメトリクスを [ビルドレポート](gradle-compilation-and-caches.md#build-reports) に出力します。構成された言語バージョンが出力に含まれます。例：

```none
##### 'kotlin.experimental.tryNext' results #####
:app:compileKotlin: 2.1 language version
:lib:compileKotlin: 2.1 language version
##### 100% (2/2) tasks have been compiled with Kotlin 2.1 #####
```

ビルドレポートを有効にする方法とその内容の詳細は、[ビルドレポート](gradle-compilation-and-caches.md#build-reports)を参照してください。

### ビルドレポート用の新しい JSON 出力形式

Kotlin 1.7.0 では、コンパイラのパフォーマンスを追跡しやすくするためにビルドレポートを導入しました。時間の経過とともに、パフォーマンス問題の調査時により詳細で役立つ情報を提供できるよう、より多くのメトリクスを追加してきました。以前は、ローカルファイルの出力形式は `*.txt` 形式のみでした。Kotlin 2.0.0 では、他のツールを使用した分析をさらに容易にするために、JSON 出力形式をサポートしました。

ビルドレポートに JSON 出力形式を構成するには、`gradle.properties` ファイルに以下のプロパティを宣言します。

```none
kotlin.build.report.output=json

// ビルドレポートを保存するディレクトリ
kotlin.build.report.json.directory=my/directory/path
```

あるいは、以下のコマンドを実行します。

```shell
./gradlew assemble -Pkotlin.build.report.output=json -Pkotlin.build.report.json.directory="my/directory/path"
``` 

構成されると、Gradle は指定したディレクトリに `${project_name}-date-time-<sequence_number>.json` という名前でビルドレポートを生成します。

以下は、ビルドメトリクスと集計メトリクスを含む、JSON 出力形式のビルドレポートのスニペット例です。

```json
"buildOperationRecord": [
    {
     "path": ":lib:compileKotlin",
      "classFqName": "org.jetbrains.kotlin.gradle.tasks.KotlinCompile_Decorated",
      "startTimeMs": 1714730820601,
      "totalTimeMs": 2724,
      "buildMetrics": {
        "buildTimes": {
          "buildTimesNs": {
            "CLEAR_OUTPUT": 713417,
            "SHRINK_AND_SAVE_CURRENT_CLASSPATH_SNAPSHOT_AFTER_COMPILATION": 19699333,
            "IR_TRANSLATION": 281000000,
            "NON_INCREMENTAL_LOAD_CURRENT_CLASSPATH_SNAPSHOT": 14088042,
            "CALCULATE_OUTPUT_SIZE": 1301500,
            "GRADLE_TASK": 2724000000,
            "COMPILER_INITIALIZATION": 263000000,
            "IR_GENERATION": 74000000,
...
          }
        }
...
 "aggregatedMetrics": {
    "buildTimes": {
      "buildTimesNs": {
        "CLEAR_OUTPUT": 782667,
        "SHRINK_AND_SAVE_CURRENT_CLASSPATH_SNAPSHOT_AFTER_COMPILATION": 22031833,
        "IR_TRANSLATION": 333000000,
        "NON_INCREMENTAL_LOAD_CURRENT_CLASSPATH_SNAPSHOT": 14890292,
        "CALCULATE_OUTPUT_SIZE": 2370750,
        "GRADLE_TASK": 3234000000,
        "COMPILER_INITIALIZATION": 292000000,
        "IR_GENERATION": 89000000,
...
      }
    }
```

### kapt 構成がスーパー構成からアノテーションプロセッサを継承

Kotlin 2.0.0 より前では、別の Gradle 構成で共通のアノテーションプロセッサセットを定義し、サブプロジェクトの kapt 固有の構成でこの構成を拡張しようとすると、kapt はアノテーションプロセッサを見つけられず、アノテーション処理をスキップしていました。Kotlin 2.0.0 では、kapt はアノテーションプロセッサに対する間接的な依存関係があることを正常に検出できます。

例として、[Dagger](https://dagger.dev/) を使用するサブプロジェクトの場合、`build.gradle(.kts)` ファイルで以下の構成を使用します。

```kotlin
val commonAnnotationProcessors by configurations.creating
configurations.named("kapt") { extendsFrom(commonAnnotationProcessors) }

dependencies {
    implementation("com.google.dagger:dagger:2.48.1")
    commonAnnotationProcessors("com.google.dagger:dagger-compiler:2.48.1")
}
```

この例では、`commonAnnotationProcessors` Gradle 構成は、すべてのプロジェクトで使用したいアノテーション処理用の共通構成です。[`extendsFrom()`](https://docs.gradle.org/current/dsl/org.gradle.api.artifacts.Configuration.html#org.gradle.api.artifacts.Configuration:extendsFrom) メソッドを使用して、`commonAnnotationProcessors` をスーパー構成（superconfiguration）として追加します。kapt は、`commonAnnotationProcessors` Gradle 構成が Dagger アノテーションプロセッサに依存していることを認識します。したがって、kapt はアノテーション処理の構成に Dagger アノテーションプロセッサを含めます。

[実装](https://github.com/JetBrains/kotlin/pull/5198)を担当してくださった Christoph Loy 氏に感謝します。

### Kotlin Gradle プラグインが非推奨の Gradle コンベンションを使用しなくなった

Kotlin 2.0.0 より前では、Gradle 8.2 以上を使用している場合、Kotlin Gradle プラグインが Gradle 8.2 で非推奨となった Gradle コンベンションを誤って使用していました。これにより、Gradle がビルドの非推奨を報告していました。Kotlin 2.0.0 では、Gradle 8.2 以上を使用している場合にこれらの非推奨警告が発生しないように、Kotlin Gradle プラグインが更新されました。

## 標準ライブラリ

本リリースでは、Kotlin 標準ライブラリの安定性がさらに向上し、既存のさらに多くの関数がすべてのプラットフォームで共通（common）になりました。

* [enum class の values ジェネリック関数の Stable な代替](#stable-replacement-of-the-enum-class-values-generic-function)
* [AutoCloseable インターフェースの Stable 化](#stable-autocloseable-interface)
* [共通の protected プロパティ AbstractMutableList.modCount](#common-protected-property-abstractmutablelist-modcount)
* [共通の protected 関数 AbstractMutableList.removeRange](#common-protected-function-abstractmutablelist-removerange)
* [共通の String.toCharArray(destination)](#common-string-tochararray-destination-function)

### enum class の values ジェネリック関数の Stable な代替

Kotlin 2.0.0 では、`enumEntries<T>()` 関数が [Stable](components-stability.md#stability-levels-explained) になりました。
`enumEntries<T>()` 関数は、ジェネリックな `enumValues<T>()` 関数の代替となるものです。新しい関数は、指定された列挙型 `T` のすべての列挙エントリのリストを返します。列挙クラスの `entries` プロパティは以前に導入され、合成された `values()` 関数の代替として安定化されました。`entries` プロパティの詳細は、[What's new in Kotlin 1.8.20](whatsnew1820.md#a-modern-and-performant-replacement-of-the-enum-class-values-function) を参照してください。

> `enumValues<T>()` 関数も引き続きサポートされますが、パフォーマンスへの影響が少ない `enumEntries<T>()` 関数の使用をお勧めします。`enumValues<T>()` を呼び出すたびに新しい配列が作成されますが、`enumEntries<T>()` を呼び出すたびに同じリストが返されるため、はるかに効率的です。
>
{style="tip"}

例：

```kotlin
enum class RGB { RED, GREEN, BLUE }

inline fun <reified T : Enum<T>> printAllValues() {
    print(enumEntries<T>().joinToString { it.name })
}

printAllValues<RGB>()
// RED, GREEN, BLUE
```

### AutoCloseable インターフェースの Stable 化

Kotlin 2.0.0 では、共通の [`AutoCloseable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-auto-closeable/) インターフェースが [Stable](components-stability.md#stability-levels-explained) になりました。これにより、リソースを簡単に閉じることができ、いくつかの便利な関数が含まれています。

* `use()` 拡張関数。選択したリソースに対して指定されたブロック関数を実行し、例外がスローされたかどうかにかかわらず、リソースを正しく閉じます。
* `AutoCloseable()` コンストラクタ関数。`AutoCloseable` インターフェースのインスタンスを作成します。

以下の例では、`XMLWriter` インターフェースを定義し、それを実装するリソースがあると想定します。例えば、このリソースはファイルを開き、XML コンテンツを書き込み、そして閉じるクラスなどです。

```kotlin
interface XMLWriter {
    fun document(encoding: String, version: String, content: XMLWriter.() -> Unit)
    fun element(name: String, content: XMLWriter.() -> Unit)
    fun attribute(name: String, value: String)
    fun text(value: String)

    fun flushAndClose()
}

fun writeBooksTo(writer: XMLWriter) {
    val autoCloseable = AutoCloseable { writer.flushAndClose() }
    autoCloseable.use {
        writer.document(encoding = "UTF-8", version = "1.0") {
            element("bookstore") {
                element("book") {
                    attribute("category", "fiction")
                    element("title") { text("Harry Potter and the Prisoner of Azkaban") }
                    element("author") { text("J. K. Rowling") }
                    element("year") { text("1999") }
                    element("price") { text("29.99") }
                }
                element("book") {
                    attribute("category", "programming")
                    element("title") { text("Kotlin in Action") }
                    element("author") { text("Dmitry Jemerov") }
                    element("author") { text("Svetlana Isakova") }
                    element("year") { text("2017") }
                    element("price") { text("25.19") }
                }
            }
        }
    }
}
```

### 共通の protected プロパティ AbstractMutableList.modCount

本リリースでは、`AbstractMutableList` インターフェースの [`modCount`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-mutable-list/mod-count.html) `protected` プロパティが共通（common）になりました。以前は、`modCount` プロパティは各プラットフォームで利用可能でしたが、共通ターゲットでは利用できませんでした。今後は、`AbstractMutableList` のカスタム実装を作成し、共通コードでこのプロパティにアクセスできるようになります。

このプロパティは、コレクションに加えられた構造的な変更の回数を追跡します。これには、コレクションのサイズを変更する操作や、進行中のイテレーションが誤った結果を返す原因となるようなリストの変更が含まれます。

カスタムリストを実装する際に、`modCount` プロパティを使用して同時変更（concurrent modification）を登録・検出できます。

### 共通の protected 関数 AbstractMutableList.removeRange

本リリースでは、`AbstractMutableList` インターフェースの [`removeRange()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-mutable-list/remove-range.html) `protected` 関数が共通（common）になりました。以前は、各プラットフォームで利用可能でしたが、共通ターゲットでは利用できませんでした。今後は、`AbstractMutableList` のカスタム実装を作成し、共通コードでこの関数をオーバーライドできるようになります。

この関数は、指定された範囲に従ってリストから要素を削除します。この関数をオーバーライドすることで、カスタム実装を活用し、リスト操作のパフォーマンスを向上させることができます。

### 共通の String.toCharArray(destination) 関数

本リリースでは、共通の [`String.toCharArray(destination)`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-char-array.html) 関数が導入されました。以前は JVM 上でのみ利用可能でした。

既存の [`String.toCharArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-char-array.html) 関数と比較してみましょう。既存の関数は、指定された文字列の文字を含む新しい `CharArray` を作成します。一方、新しい共通の `String.toCharArray(destination)` 関数は、`String` の文字を既存の出力先 `CharArray` に移動します。これは、すでにデータを格納するためのバッファがある場合に便利です。

```kotlin
fun main() {
    val myString = "Kotlin is awesome!"
    val destinationArray = CharArray(myString.length)

    // 文字列を変換して destinationArray に格納する：
    myString.toCharArray(destinationArray)

    for (char in destinationArray) {
        print("$char ")
        // K o t l i n   i s   a w e s o m e ! 
    }
}
```
{kotlin-runnable="true"}

## Kotlin 2.0.0 のインストール

IntelliJ IDEA 2023.3 および Android Studio Iguana (2023.2.1) Canary 15 以降、Kotlin プラグインは IDE に含まれるバンドルプラグインとして配布されています。つまり、JetBrains Marketplace からプラグインをインストールすることはできなくなりました。

新しい Kotlin バージョンにアップデートするには、ビルドスクリプトで [Kotlin バージョンを 2.0.0 に変更](releases.md#update-to-a-new-kotlin-version)してください。