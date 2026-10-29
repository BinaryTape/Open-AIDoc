[//]: # (title: K2コンパイラ移行ガイド)

Kotlin言語とエコシステムが進化し続けるにつれ、Kotlinコンパイラも同様に進化してきました。その最初のステップは、ロジックを共有し、異なるプラットフォームのターゲットに対するコード生成を簡素化する、新しいJVMおよびJS IR（中間表現）バックエンドの導入でした。そして現在、進化の次のステージとして、K2として知られる新しいフロントエンドが登場しました。

![Kotlin K2コンパイラのアーキテクチャ](k2-compiler-architecture.svg){width=700}

K2コンパイラの登場により、Kotlinのフロントエンドは完全に書き直され、新しく、より効率的なアーキテクチャを備えるようになりました。新しいコンパイラがもたらす根本的な変更は、より多くのセマンティック情報を含む、1つの統合されたデータ構造を使用することです。このフロントエンドは、意味解析、呼び出し解決（Call resolution）、型推論（Type inference）を実行する役割を担っています。

新しいアーキテクチャと強化されたデータ構造により、K2コンパイラは以下のメリットを提供します。

* **呼び出し解決と型推論の改善**：コンパイラの動作がより一貫したものになり、コードをより深く理解できるようになります。
* **新しい言語機能のためのシンタックスシュガーの導入が容易に**：将来的に新しい機能が導入される際、より簡潔で読みやすいコードを使用できるようになります。
* **コンパイル時間の高速化**：コンパイル時間が[大幅に短縮](#performance-improvements)される可能性があります。
* **IDEパフォーマンスの強化**：IntelliJ IDEAとAndroid StudioはKotlinコードの解析にK2コンパイラを使用し、安定性の向上とパフォーマンスの改善を提供します。詳細については、[IDEでのサポート](#support-in-ides)を参照してください。

このガイドでは、以下の内容について説明します。

* 新しいK2コンパイラの利点。
* 移行中に遭遇する可能性のある変更点と、それに応じてコードを適応させる方法。
* 以前のバージョンにロールバックする方法。

> 新しいK2コンパイラは、2.0.0からデフォルトで有効になっています。Kotlin 2.0.0で提供される新機能および新しいK2コンパイラの詳細については、[Kotlin 2.0.0の新機能](whatsnew20.md)を参照してください。
>
{style="note"}

## パフォーマンスの向上 {id="performance-improvements"}

K2コンパイラのパフォーマンスを評価するために、2つのオープンソースプロジェクト [Anki-Android](https://github.com/ankidroid/Anki-Android) と [Exposed](https://github.com/JetBrains/Exposed) でパフォーマンス・テストを実施しました。その結果、以下のような主要なパフォーマンス向上が確認されました。

* K2コンパイラは、コンパイル速度を最大94%向上させます。例えば、Anki-Androidプロジェクトでは、クリーンビルドの時間がKotlin 1.9.23の57.7秒から、Kotlin 2.0.0では29.7秒に短縮されました。
* 初期化フェーズは、K2コンパイラによって最大488%高速化されます。例えば、Anki-Androidプロジェクトでは、増分ビルドの初期化フェーズがKotlin 1.9.23の0.126秒から、Kotlin 2.0.0ではわずか0.022秒に短縮されました。
* Kotlin K2コンパイラは、以前のコンパイラと比較して、解析フェーズが最大376%高速です。例えば、Anki-Androidプロジェクトでは、増分ビルドの解析時間がKotlin 1.9.23の0.581秒から、Kotlin 2.0.0ではわずか0.122秒に短縮されました。

これらの改善の詳細や、K2コンパイラのパフォーマンスをどのように分析したかについては、[ブログ記事](https://blog.jetbrains.com/kotlin/2024/04/k2-compiler-performance-benchmarks-and-how-to-measure-them-on-your-projects/)を参照してください。

## 言語機能の改善 {id="language-feature-improvements"}

Kotlin K2コンパイラは、[スマートキャスト](#smart-casts)および[Kotlinマルチプラットフォーム](#kotlin-multiplatform)に関連する言語機能を改善しています。

### スマートキャスト {id="smart-casts"}

Kotlinコンパイラは、特定の場合にオブジェクトを型に自動的にキャストできるため、明示的に指定する手間を省くことができます。これは[スマートキャスト](typecasts.md#smart-casts)と呼ばれます。Kotlin K2コンパイラは、以前よりもさらに多くのシナリオでスマートキャストを実行できるようになりました。

Kotlin 2.0.0では、以下の領域でスマートキャストに関する改善を行いました。

* [ローカル変数と以降のスコープ](#local-variables-and-further-scopes)
* [論理or演算子を使用した型チェック](#type-checks-with-the-logical-or-operator)
* [インライン関数](#inline-functions)
* [関数型を持つプロパティ](#properties-with-function-types)
* [例外処理](#exception-handling)
* [インクリメントおよびデクリメント演算子](#increment-and-decrement-operators)

#### ローカル変数と以降のスコープ {id="local-variables-and-further-scopes"}

以前は、変数が `if` 条件内で `null` でないと評価された場合、その変数はスマートキャストされていました。この変数に関する情報は、`if` ブロックのスコープ内でさらに共有されていました。

しかし、`if` 条件の**外**で変数を宣言した場合、`if` 条件内ではその変数に関する情報が利用できず、スマートキャストを行うことができませんでした。この動作は、`when` 式や `while` ループでも見られました。

Kotlin 2.0.0からは、`if`、`when`、または `while` 条件で使用する前に変数を宣言した場合、コンパイラによって収集されたその変数に関する情報は、対応するブロック内でスマートキャストのためにアクセス可能になります。

これは、ブール条件を変数に抽出したい場合などに便利です。変数に意味のある名前を付けることで、コードの可読性が向上し、後でその変数を再利用できるようになります。例：

```kotlin
class Cat {
    fun purr() {
        println("Purr purr")
    }
}

fun petAnimal(animal: Any) {
    val isCat = animal is Cat
    if (isCat) {
        // Kotlin 2.0.0では、コンパイラはisCatに関する情報に
        // アクセスできるため、animalがCat型にスマートキャストされた
        // ことを認識します。
        // したがって、purr()関数を呼び出すことができます。
        // Kotlin 1.9.20では、コンパイラはスマートキャストを
        // 認識しないため、purr()関数の呼び出しはエラーになります。
        animal.purr()
    }
}

fun main(){
    val kitty = Cat()
    petAnimal(kitty)
    // Purr purr
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-smart-casts-k2-local-variables" validate="false"}

#### 論理or演算子を使用した型チェック {id="type-checks-with-the-logical-or-operator"}

Kotlin 2.0.0では、オブジェクトの型チェックを `or` 演算子（`||`）で組み合わせた場合、それらの最も近い共通のスーパータイプ（Closest common supertype）にスマートキャストされます。この変更以前は、常に `Any` 型にスマートキャストされていました。

そのため、以前はプロパティにアクセスしたり関数を呼び出したりする前に、その後で手動でオブジェクトの型をチェックする必要がありました。例：

```kotlin
interface Status {
    fun signal() {}
}

interface Ok : Status
interface Postponed : Status
interface Declined : Status

fun signalCheck(signalStatus: Any) {
    if (signalStatus is Postponed || signalStatus is Declined) {
        // signalStatusは共通のスーパータイプであるStatusにスマートキャストされます
        signalStatus.signal()
        // Kotlin 2.0.0より前では、signalStatusはAny型に
        // スマートキャストされるため、signal()関数の呼び出しは
        // Unresolved referenceエラーを引き起こしていました。
        // signal()関数は、別の型チェックの後にのみ正常に呼び出すことができました：
        
        // check(signalStatus is Status)
        // signalStatus.signal()
    }
}
```

> 共通のスーパータイプは、[ユニオン型（Union type）](https://en.wikipedia.org/wiki/Union_type)の**近似**です。ユニオン型は[現在Kotlinではサポートされていません](https://youtrack.jetbrains.com/issue/KT-13108/Denotable-union-and-intersection-types)。
>
{style="note"}

#### インライン関数 {id="inline-functions"}

Kotlin 2.0.0では、K2コンパイラはインライン関数を異なった方法で処理し、他のコンパイラ分析と組み合わせて、スマートキャストが安全かどうかを判断できるようになりました。

具体的には、インライン関数は暗黙的な [`callsInPlace`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.contracts/-contract-builder/calls-in-place.html) コントラクトを持つものとして扱われるようになりました。これは、インライン関数に渡されるラムダ関数がその場で呼び出されることを意味します。ラムダ関数がその場で呼び出されるため、コンパイラはラムダ関数がその関数本体内に含まれる変数の参照をリークさせないことを認識できます。

コンパイラはこの知識を他のコンパイラ分析と共に使用して、キャプチャされた変数のいずれかをスマートキャストするのが安全かどうかを決定します。例：

```kotlin
interface Processor {
    fun process()
}

inline fun inlineAction(f: () -> Unit) = f()

fun nextProcessor(): Processor? = null

fun runProcessor(): Processor? {
    var processor: Processor? = null
    inlineAction {
        // Kotlin 2.0.0では、コンパイラはprocessorがローカル変数であり、
        // inlineAction()がインライン関数であることを認識しているため、
        // processorへの参照がリークすることはありません。
        // したがって、processorをスマートキャストしても安全です。
      
        // processorがnullでない場合、processorはスマートキャストされます
        if (processor != null) {
            // コンパイラはprocessorがnullでないことを認識しているため、
            // セーフコールは不要です
            processor.process()

            // Kotlin 1.9.20では、セーフコールを実行する必要があります：
            // processor?.process()
        }

        processor = nextProcessor()
    }

    return processor
}
```

#### 関数型を持つプロパティ {id="properties-with-function-types"}

以前のバージョンのKotlinには、関数型を持つクラスプロパティがスマートキャストされないというバグがありました。Kotlin 2.0.0とK2コンパイラではこの動作を修正しました。例：

```kotlin
class Holder(val provider: (() -> Unit)?) {
    fun process() {
        // Kotlin 2.0.0では、providerがnullでない場合、
        // スマートキャストされます
        if (provider != null) {
            // コンパイラはproviderがnullでないことを認識しています
            provider()

            // 1.9.20では、コンパイラはproviderがnullでないことを
            // 認識しないため、エラーが発生します：
            // Reference has a nullable type '(() -> Unit)?', use explicit '?.invoke()' to make a function-like call instead
        }
    }
}
```

この変更は、`invoke` 演算子をオーバーロードした場合にも適用されます。例：

```kotlin
interface Provider {
    operator fun invoke()
}

interface Processor : () -> String

class Holder(val provider: Provider?, val processor: Processor?) {
    fun process() {
        if (provider != null) {
            provider() 
            // 1.9.20では、コンパイラはエラーを発生させます： 
            // Reference has a nullable type 'Provider?', use explicit '?.invoke()' to make a function-like call instead
        }
    }
}
```

#### 例外処理 {id="exception-handling"}

Kotlin 2.0.0では、スマートキャスト情報を `catch` および `finally` ブロックに渡すことができるよう例外処理を改善しました。この変更により、コンパイラがオブジェクトが null 許容型であるかどうかを追跡するため、コードがより安全になります。例：

```kotlin
//sampleStart
fun testString() {
    var stringInput: String? = null
    // stringInputはString型にスマートキャストされます
    stringInput = ""
    try {
        // コンパイラはstringInputがnullでないことを認識しています
        println(stringInput.length)
        // 0

        // コンパイラはstringInputの以前のスマートキャスト情報を破棄します。
        // ここでstringInputはString?型になります。
        stringInput = null

        // 例外を発生させる
        if (2 > 1) throw Exception()
        stringInput = ""
    } catch (exception: Exception) {
        // Kotlin 2.0.0では、コンパイラはstringInputが
        // nullになり得ることを認識しているため、stringInputはnull許容のままです。
        println(stringInput?.length)
        // null

        // Kotlin 1.9.20では、コンパイラはセーフコールは不要であると
        // 言いますが、これは誤りです。
    }
}
//sampleEnd
fun main() {
    testString()
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-smart-casts-k2-exception-handling"}

#### インクリメントおよびデクリメント演算子 {id="increment-and-decrement-operators"}

Kotlin 2.0.0より前、コンパイラはインクリメントまたはデクリメント演算子を使用した後にオブジェクトの型が変わる可能性があることを理解していませんでした。コンパイラがオブジェクト의型を正確に追跡できなかったため、コードで未解決の参照エラーが発生することがありました。Kotlin 2.0.0では、これが修正されました。

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

    // unknownObjectがTauインターフェースを継承しているかチェック
    // 注：unknownObjectがRhoとTauの両方のインターフェースを
    // 継承している可能性もあります。
    if (unknownObject is Tau) {

        // インターフェースRhoからオーバーロードされたinc()演算子を使用します。
        // Kotlin 2.0.0では、unknownObjectの型はSigmaにスマートキャストされます。
        ++unknownObject

        // Kotlin 2.0.0では、コンパイラはunknownObjectがSigma型であることを
        // 認識しているため、sigma()関数を正常に呼び出すことができます。
        unknownObject.sigma()

        // Kotlin 1.9.20では、コンパイラはinc()が呼び出されたときに
        // スマートキャストを実行しないため、コンパイラは依然として
        // unknownObjectがTau型であると考えます。sigma()関数を呼び出すと
        // コンパイルエラーが発生します。
        
        // Kotlin 2.0.0では、コンパイラはunknownObjectがSigma型であることを
        // 認識しているため、tau()関数を呼び出すとコンパイルエラーが発生します。
        unknownObject.tau()
        // Unresolved reference 'tau'

        // Kotlin 1.9.20では、コンパイラが誤ってunknownObjectがTau型であると
        // 考えるため、tau()関数を呼び出すことができますが、
        // ClassCastExceptionが発生します。
    }
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-smart-casts-k2-increment-decrement-operators" validate="false"}

### Kotlinマルチプラットフォーム {id="kotlin-multiplatform"}

K2コンパイラには、以下の領域でKotlinマルチプラットフォームに関連する改善があります。

* [コンパイル中の共通ソースとプラットフォームソースの分離](#separation-of-common-and-platform-sources-during-compilation)
* [expected宣言とactual宣言の異なる可視性レベル](#different-visibility-levels-of-expected-and-actual-declarations)

#### コンパイル中の共通ソースとプラットフォームソースの分離 {id="separation-of-common-and-platform-sources-during-compilation"}

以前は、Kotlinコンパイラの設計上、コンパイル時に共通（common）ソースセットとプラットフォーム（platform）ソースセットを分離しておくことができませんでした。その結果、共通コードがプラットフォームコードにアクセスできてしまい、プラットフォーム間で異なる動作が発生することがありました。さらに、共通コードからのいくつかのコンパイラ設定や依存関係がプラットフォームコードに漏れ出すこともありました。

Kotlin 2.0.0では、新しいKotlin K2コンパイラの実装にコンパイルスキームの再設計が含まれ、共通ソースセットとプラットフォームソースセットが厳密に分離されるようになりました。この変更は、[expectedおよびactual関数](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html#expected-and-actual-functions)を使用する場合に最も顕著になります。以前は、共通コードでの関数呼び出しが、プラットフォームコード内の関数として解決される可能性がありました。例：

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
// JavaScriptプラットフォームにはfoo()関数のオーバーロードはありません
```

</td>
</tr>
</table>

この例では、共通コードは実行されるプラットフォームに応じて異なる動作をします。

* JVMプラットフォームでは、共通コードで `foo()` 関数を呼び出すと、プラットフォームコードの `foo()` 関数が `platform foo` として呼び出されます。
* JavaScriptプラットフォームでは、プラットフォームコードにそのような関数が存在しないため、共通コードで `foo()` 関数を呼び出すと、共通コードの `foo()` 関数が `common foo` として呼び出されます。

Kotlin 2.0.0では、共通コードはプラットフォームコードにアクセスできないため、両方のプラットフォームで `foo()` 関数は共通コード内の `foo()` 関数、すなわち `common foo` として正常に解決されます。

プラットフォーム間の動作の一貫性の向上に加えて、IntelliJ IDEAまたはAndroid Studioとコンパイラの間で動作が矛盾していたケースの修正にも力を入れました。例えば、[expectedおよびactualクラス](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html#expected-and-actual-classes)を使用した場合、以前は以下のようになっていました。

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
    // 2.0.0より前では、IDE限定のエラーが発生します
    Identity().confirmIdentity()
    // RESOLUTION_TO_CLASSIFIER : Expected class Identity has no default constructor.
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

この例では、expectedクラス `Identity` にデフォルトコンストラクタがないため、共通コードで正常に呼び出すことはできません。以前は、IDEによってのみエラーが報告されていましたが、JVM上ではコードは正常にコンパイルされていました。しかし、現在はコンパイラが正しくエラーを報告します。

```none
Expected class 'expect class Identity : Any' does not have default constructor
```

##### 解決動作が変わらない場合 {id="when-resolution-behavior-doesn-t-change"}

新しいコンパイルスキームへの移行はまだ進行中であるため、同じソースセット内にない関数を呼び出す場合の解決動作は以前と同じです。この違いは、主に共通コードでマルチプラットフォームライブラリのオーバーロードを使用する場合に気づくでしょう。

異なるシグネチャを持つ2つの `whichFun()` 関数を持つライブラリがあると仮定します。

```kotlin
// ライブラリの例

// MODULE: common
fun whichFun(x: Any) = println("common function") 

// MODULE: JVM
fun whichFun(x: Int) = println("platform function")
```

共通コードで `whichFun()` 関数を呼び出すと、ライブラリ内で最も関連性の高い引数型を持つ関数が解決されます。

```kotlin
// JVMターゲットに例のライブラリを使用するプロジェクト

// MODULE: common
fun main(){
    whichFun(2) 
    // platform function
}
```

比較として、同じソースセット内で `whichFun()` のオーバーロードを宣言した場合、コードがプラットフォーム固有のバージョンにアクセスできないため、共通コードからの関数が解決されます。

```kotlin
// 例のライブラリは使用しない

// MODULE: common
fun whichFun(x: Any) = println("common function") 

fun main(){
    whichFun(2) 
    // common function
}

// MODULE: JVM
fun whichFun(x: Int) = println("platform function")
```

マルチプラットフォームライブラリと同様に、`commonTest` モジュールは別のソースセットにあるため、依然としてプラットフォーム固有のコードにアクセスできます。したがって、`commonTest` モジュールでの関数呼び出しの解決は、古いコンパイルスキームと同じ動作を示します。

将来的に、これらの残りのケースも新しいコンパイルスキームとより一貫したものになる予定です。

#### expected宣言とactual宣言の異なる可視性レベル {id="different-visibility-levels-of-expected-and-actual-declarations"}

Kotlin 2.0.0より前は、Kotlinマルチプラットフォームプロジェクトで[expected宣言とactual宣言](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)を使用する場合、それらは同じ[可視性レベル](visibility-modifiers.md)である必要がありました。Kotlin 2.0.0では、actual宣言がexpected宣言よりも**寛容（より公開されている）**である場合に限り、異なる可視性レベルもサポートされるようになりました。例：

```kotlin
expect internal class Attribute // 可視性はinternal
actual class Attribute          // 可視性はデフォルトでpublic、
                                // これはより寛容です
```

同様に、actual宣言で[型エイリアス（Type alias）](type-aliases.md)を使用している場合、**基になる型（Underlying type）**の可視性は、expected宣言と同じか、それよりも寛容である必要があります。例：

```kotlin
expect internal class Attribute                 // 可視性はinternal
internal actual typealias Attribute = Expanded

class Expanded                                  // 可視性はデフォルトでpublic、
                                                // これはより寛容です
```

## Kotlin K2コンパイラを有効にする方法 {id="how-to-enable-the-kotlin-k2-compiler"}

Kotlin 2.0.0以降、Kotlin K2コンパイラはデフォルトで有効になっています。

Kotlinのバージョンをアップグレードするには、[Gradle](gradle-configure-project.md#apply-the-plugin) または [Maven](maven-configure-project.md) のビルドスクリプトでバージョンを2.0.0以降のリリースに変更してください。

### GradleでKotlinビルドレポートを使用する {id="use-kotlin-build-reports-with-gradle"}

Kotlin[ビルドレポート](gradle-compilation-and-caches.md#build-reports)は、Kotlinコンパイラタスクの異なるコンパイルフェーズに費やされた時間、使用されたコンパイラとKotlinのバージョン、およびコンパイルが増分であったかどうかに関する情報を提供します。これらのビルドレポートは、ビルドパフォーマンスの評価に役立ちます。これらはすべてのGradleタスクのパフォーマンスの概要を提供するため、[Gradleビルドスキャン](https://scans.gradle.com/)よりもKotlinコンパイルパイプラインに関するより多くの洞察を提供します。

#### ビルドレポートを有効にする方法 {id="how-to-enable-build-reports"}

ビルドレポートを有効にするには、`gradle.properties` ファイルにビルドレポートの出力保存先を宣言します。

```none
kotlin.build.report.output=file
```

出力には以下の値とその組み合わせが使用可能です。

| オプション | 説明 |
|---|---|
| `file` | ビルドレポートを人間が読める形式でローカルファイルに保存します。デフォルトは `${project_folder}/build/reports/kotlin-build/${project_name}-timestamp.txt` です。 |
| `single_file` | ビルドレポートをオブジェクトの形式で指定されたローカルファイルに保存します。 |
| `build_scan` | ビルドレポートを[ビルドスキャン](https://scans.gradle.com/)の `custom values` セクションに保存します。Gradle Enterpriseプラグインはカスタム値の数と長さを制限していることに注意してください。大規模なプロジェクトでは、一部の値が失われる可能性があります。 |
| `http` | HTTP(S)を使用してビルドレポートを投稿します。POSTメソッドはメトリクスをJSON形式で送信します。送信されるデータの現在のバージョンは、[Kotlinリポジトリ](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-plugin/src/common/kotlin/org/jetbrains/kotlin/gradle/report/data/GradleCompileStatisticsData.kt)で確認できます。HTTPエンドポイントのサンプルは、[こちらのブログ記事](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/?_gl=1*1a7pghy*_ga*MTcxMjc1NzE5Ny4xNjY1NDAzNjkz*_ga_9J976DJZ68*MTcxNTA3NjA2NS4zNzcuMS4xNzE1MDc2MDc5LjQ2LjAuMA..&_ga=2.265800911.1124071296.1714976764-1712757197.1665403693#enable_build_reports) にあります。 |
| `json` | ビルドレポートをJSON形式でローカルファイルに保存します。ビルドレポートの場所は `kotlin.build.report.json.directory` で設定します。デフォルトの名前は `${project_name}-build-<date-time>-<index>.json` です。 |

ビルドレポートで可能なことの詳細については、[ビルドレポート](gradle-compilation-and-caches.md#build-reports)を参照してください。

## IDEでのサポート {id="support-in-ides"}

IntelliJ IDEAとAndroid StudioはどちらもK2コンパイラを完全にサポートしており、デフォルトでこれを使用してコード解析、コード補完、およびハイライトを改善します。何も設定する必要はありません。最新バージョンにアップデートして、その利点を確認してください。

## Kotlin PlaygroundでKotlin K2コンパイラを試す {id="try-the-kotlin-k2-compiler-in-the-kotlin-playground"}

Kotlin PlaygroundはKotlin 2.0.0以降のリリースをサポートしています。[ぜひチェックしてみてください！](https://pl.kotl.in/czuoQprce)

## 以前のコンパイラにロールバックする方法 {id="how-to-roll-back-to-the-previous-compiler"}

Kotlin 2.0.0–2.3.21で以前のコンパイラを使用するには、以下のいずれかを行います。

* `build.gradle.kts` ファイルで、[言語バージョンを1.9に設定](gradle-compiler-options.md#example-of-setting-languageversion)します。

  または
* コンパイラオプション `-language-version 1.9` を使用します。

Kotlin 2.4.0以降は、以前のコンパイラにロールバックすることはできません。

## 変更点 {id="changes"}

新しいフロントエンドの導入により、Kotlinコンパイラはいくつかの変更を受けました。まず、コードに影響を与える最も重要な修正点を挙げ、何が変わったのか、そして今後のベストプラクティスについて説明します。さらに詳しく知りたい場合は、読み進めやすいようにこれらの変更を[分野別](#per-subject-area)にまとめています。

このセクションでは、以下の変更点について説明します。

* [バッキングフィールドを持つopenプロパティの即時初期化](#immediate-initialization-of-open-properties-with-backing-fields)
* [投影されたレシーバーでの合成セッターの非推奨化](#deprecated-synthetics-setter-on-a-projected-receiver)
* [アクセス不能なジェネリック型の使用禁止](#forbidden-use-of-inaccessible-generic-types)
* [同じ名前のKotlinプロパティとJavaフィールドの一貫した解決順序](#consistent-resolution-order-of-kotlin-properties-and-java-fields-with-the-same-name)
* [Javaプリミティブ配列の null 安全性の向上](#improved-null-safety-for-java-primitive-arrays)
* [expectedクラス内の抽象メンバに対するより厳格なルール](#stricter-rules-for-abstract-members-in-expected-classes)

### バッキングフィールドを持つopenプロパティの即時初期化 {id="immediate-initialization-of-open-properties-with-backing-fields"}

**何が変わったのか？**

Kotlin 2.0では、バッキングフィールドを持つすべての `open` プロパティを即座に初期化する必要があります。そうしないと、コンパイルエラーが発生します。以前は、`open var` プロパティのみが即時の初期化を必要としていましたが、現在はバッキングフィールドを持つ `open val` プロパティにも適用されます。

```kotlin
open class Base {
    open val a: Int
    open var b: Int
    
    init {
        // Kotlin 2.0以降ではエラーになりますが、以前は正常にコンパイルされていました
        this.a = 1 // エラー: open val must have initializer
        // 常にエラー
        this.b = 1 // エラー: open var must have initializer
    }
}

class Derived : Base() {
    override val a: Int = 2
    override var b = 2
}
```

この変更により、コンパイラの動作がより予測しやすくなります。`open val` プロパティがカスタムセッターを持つ `var` プロパティによってオーバーライドされる例を考えてみましょう。

カスタムセッターが使用される場合、バッキングフィールドを初期化したいのか、セッターを呼び出したいのかが不明確になるため、遅延初期化は混乱を招く可能性があります。以前は、セッターを呼び出したい場合、古いコンパイラはセッターがその後にバッキングフィールドを初期化することを保証できませんでした。

**現在のベストプラクティスは？**

バッキングフィールドを持つopenプロパティは常に初期化することをお勧めします。この習慣は効率的であり、エラーも少なくなると考えています。

ただし、プロパティを即座に初期化したくない場合は、以下のようにします。

* プロパティを `final` にする。
* 遅延初期化を可能にするプライベートなバッキングプロパティを使用する。

詳細については、[YouTrackの対応する課題](https://youtrack.jetbrains.com/issue/KT-57555)を参照してください。

### 投影されたレシーバーでの合成セッターの非推奨化 {id="deprecated-synthetics-setter-on-a-projected-receiver"}

**何が変わったのか？**

Javaクラスの合成セッター（Synthetic setter）を使用して、クラスの投影された型（Projected type）と矛盾する型を割り当てようとすると、エラーが発生します。

`getFoo()` および `setFoo()` メソッドを含む `Container` という名前のJavaクラスがあるとします。

```java
public class Container<E> {
    public E getFoo() {
        return null;
    }
    public void setFoo(E foo) {}
}
```

次のようなKotlinコードがあり、`Container` クラスのインスタンスが投影された型を持っている場合、`setFoo()` メソッドを使用すると常にエラーが発生します。しかし、Kotlin 2.0.0からのみ、合成プロパティ `foo` もエラーを発生させるようになります。

```kotlin
fun exampleFunction(starProjected: Container<*>, inProjected: Container<in Number>, sampleString: String) {
    starProjected.setFoo(sampleString)
    // Kotlin 1.0からエラー

    // 合成セッター `foo` は `setFoo()` メソッドに解決されます
    starProjected.foo = sampleString
    // Kotlin 2.0.0からエラー

    inProjected.setFoo(sampleString)
    // Kotlin 1.0からエラー

    // 合成セッター `foo` は `setFoo()` メソッドに解決されます
    inProjected.foo = sampleString
    // Kotlin 2.0.0からエラー
}
```

**現在のベストプラクティスは？**

この変更によってコードにエラーが生じる場合は、型宣言の構成を再考することをお勧めします。型投影を使用する必要がないか、あるいはコードから代入を削除する必要があるかもしれません。

詳細については、[YouTrackの対応する課題](https://youtrack.jetbrains.com/issue/KT-54309)を参照してください。

### アクセス不能なジェネリック型の使用禁止 {id="forbidden-use-of-inaccessible-generic-types"}

**何が変わったのか？**

K2コンパイラの新しいアーキテクチャにより、アクセス不能なジェネリック型の処理方法を変更しました。一般的に、アクセス不能なジェネリック型に依存すべきではありません。なぜなら、これはプロジェクトのビルド設定に誤りがあることを示しており、コンパイラがコンパイルに必要な情報にアクセスできなくなっているからです。Kotlin 2.0.0では、アクセス不能なジェネリック型を使用して関数リテラルを宣言したり呼び出したりすること、またアクセス不能なジェネリック型引数を持つジェネリック型を使用することはできません。この制限は、コードの後半でコンパイラエラーが発生するのを防ぐのに役立ちます。

例えば、あるモジュールでジェネリッククラスを宣言したとします。

```kotlin
// モジュール1
class Node<V>(val value: V)
```

別のモジュール（モジュール2）にモジュール1への依存関係が設定されている場合、コードは `Node<V>` クラスにアクセスし、関数型の中で型として使用できます。

```kotlin
// モジュール2
fun execute(func: (Node<Int>) -> Unit) {}
// 関数は正常にコンパイルされます
```

しかし、プロジェクトの設定が誤っており、モジュール2にのみ依存する第3のモジュール（モジュール3）がある場合、Kotlinコンパイラはモジュール3のコンパイル時に**モジュール1**の `Node<V>` クラスにアクセスできません。Kotlin 2.0.0では、`Node<V>` 型を使用するモジュール3内のラムダや匿名関数はエラーとなり、回避可能なコンパイラエラー、クラッシュ、実行時の例外を未然に防ぎます。

```kotlin
// モジュール3
fun test() {
    // 暗黙のラムダパラメータ（it）の型がアクセス不能なNodeに解決されるため、
    // Kotlin 2.0.0ではエラーが発生します
    execute {}

    // 未使用のラムダパラメータ（_）の型がアクセス不能なNodeに解決されるため、
    // Kotlin 2.0.0ではエラーが発生します
    execute { _ -> }

    // 未使用の匿名関数パラメータ（_）の型がアクセス不能なNodeに解決されるため、
    // Kotlin 2.0.0ではエラーが発生します
    execute(fun (_) {})
}
```

アクセス不能なジェネリック型の値パラメータを含む関数リテラルがエラーを発生させることに加えて、型がアクセス不能なジェネリック型引数を持っている場合にもエラーが発生します。

例えば、モジュール1に同じジェネリッククラスの宣言があるとします。モジュール2では、別のジェネリッククラス `Container<C>` を宣言します。さらに、モジュール2で、型引数としてジェネリッククラス `Node<V>` を使用する `Container<C>` を使う関数を宣言します。

<table>
   <tr>
       <td>モジュール1</td>
       <td>モジュール2</td>
   </tr>
   <tr>
<td>

```kotlin
// モジュール1
class Node<V>(val value: V)
```

</td>
<td>

```kotlin
// モジュール2
class Container<C>(vararg val content: C)

// ジェネリッククラス型を持ち、
// ジェネリッククラス型引数も持つ関数
fun produce(): Container<Node<Int>> = Container(Node(42))
fun consume(arg: Container<Node<Int>>) {}
```

</td>
</tr>
</table>

これらの関数をモジュール3で呼び出そうとすると、ジェネリッククラス `Node<V>` がモジュール3からアクセス不能であるため、Kotlin 2.0.0でエラーが発生します。

```kotlin
// モジュール3
fun test() {
    // ジェネリッククラスNode<V>がアクセス不能であるため、
    // Kotlin 2.0.0ではエラーが発生します
    consume(produce())
}
```

将来のリリースでは、アクセス不能な型の使用全般を非推奨にし続ける予定です。Kotlin 2.0.0では、非ジェネリック型を含む、アクセス不能な型を使用するいくつかのシナリオに対して警告を追加することから始めています。

例えば、前の例と同じモジュール構成で、ジェネリッククラス `Node<V>` を非ジェネリッククラス `IntNode` に変更し、すべての関数をモジュール2で宣言します。

<table>
   <tr>
       <td>モジュール1</td>
       <td>モジュール2</td>
   </tr>
   <tr>
<td>

```kotlin
// モジュール1
class IntNode(val value: Int)
```

</td>
<td>

```kotlin
// モジュール2
// `IntNode`型を持つラムダパラメータを含む関数 
fun execute(func: (IntNode) -> Unit) {}

class Container<C>(vararg val content: C)

// 型引数として`IntNode`を持つ
// ジェネリッククラス型の関数
fun produce(): Container<IntNode> = Container(IntNode(42))
fun consume(arg: Container<IntNode>) {}
```

</td>
</tr>
</table>

モジュール3でこれらの関数を呼び出すと、いくつかの警告が発生します。

```kotlin
// モジュール3
fun test() {
    // クラスIntNodeがアクセス不能であるため、
    // Kotlin 2.0.0では警告が発生します。

    execute {}
    // Class 'IntNode' of the parameter 'it' is inaccessible.

    execute { _ -> }
    execute(fun (_) {})
    // Class 'IntNode' of the parameter '_' is inaccessible.

    // 将来のKotlinリリースで、IntNodeがアクセス不能である
    // ことに対する警告が発生するようになります。
    consume(produce())
}
```

**現在のベストプラクティスは？**

アクセス不能なジェネリック型の新しい警告に遭遇した場合、ビルドシステムの構成に問題がある可能性が高いです。ビルドスクリプトと構成を確認することをお勧めします。

最後の手段として、モジュール3からモジュール1への直接的な依存関係を設定することもできます。あるいは、同じモジュール内で型にアクセスできるようにコードを修正することもできます。

詳細については、[YouTrackの対応する課題](https://youtrack.jetbrains.com/issue/KT-64474)を参照してください。

### 同じ名前のKotlinプロパティとJavaフィールドの一貫した解決順序 {id="consistent-resolution-order-of-kotlin-properties-and-java-fields-with-the-same-name"}

**何が変わったのか？**

Kotlin 2.0.0より前、互いに継承し合い、同じ名前のKotlinプロパティとJavaフィールドを含むJavaクラスとKotlinクラスを扱っていた場合、重複した名前の解決動作に一貫性がありませんでした。また、IntelliJ IDEAとコンパイラの間で動作が矛盾していました。Kotlin 2.0.0のための新しい解決動作を開発する際、ユーザーへの影響を最小限に抑えることを目指しました。

例えば、Javaクラス `Base` があるとします。

```java
public class Base {
    public String a = "a";

    public String b = "b";
}
```

前述の `Base` クラスを継承するKotlinクラス `Derived` もあるとします。

```kotlin
class Derived : Base() {
    val a = "aa"

    // カスタムget()関数を宣言
    val b get() = "bb"
}

fun main() {
    // Derived.aを解決
    println(a)
    // aa

    // Base.bを解決
    println(b)
    // b
}
```

Kotlin 2.0.0より前では、`a` は `Derived` Kotlinクラス内のKotlinプロパティに解決されますが、`b` は `Base` Javaクラス内のJavaフィールドに解決されます。

Kotlin 2.0.0では、この例の解決動作が一貫したものになり、同じ名前のJavaフィールドよりもKotlinプロパティが優先されるようになります。現在、`b` は `Derived.b` に解決されます。

> Kotlin 2.0.0より前では、IntelliJ IDEAを使用して `a` の宣言や使用箇所に移動しようとすると、Kotlinプロパティに移動すべきところを誤ってJavaフィールドに移動していました。
> 
> Kotlin 2.0.0からは、IntelliJ IDEAはコンパイラと同じ場所に正しく移動します。
>
{style="note"}

一般的なルールは、サブクラスが優先されるということです。前の例では、`Derived` が `Base` Javaクラスのサブクラスであるため、`Derived` クラスのKotlinプロパティ `a` が解決されることでこれを示しています。

継承が逆になり、JavaクラスがKotlinクラスを継承している場合、サブクラス内のJavaフィールドが、同じ名前を持つKotlinプロパティよりも優先されます。

この例を考えてみましょう。

<table>
   <tr>
       <td>Kotlin</td>
       <td>Java</td>
   </tr>
   <tr>
<td>

```kotlin
open class Base {
    val a = "aa"
}
```

</td>
<td>

```java
public class Derived extends Base {
    public String a = "a";
}
```

</td>
</tr>
</table>

この場合、次のコードでは：

```kotlin
fun main() {
    // Derived.aを解決
    println(a)
    // a
}
```

**現在のベストプラクティスは？**

この変更がコードに影響を与える場合は、重複した名前を使用する必要が本当にあるかどうかを検討してください。JavaクラスまたはKotlinクラスに同じ名前のフィールドまたはプロパティを持たせ、それぞれが他方を継承するようにしたい場合は、サブクラスのフィールドまたはプロパティが優先されることに注意してください。

詳細については、[YouTrackの対応する課題](https://youtrack.jetbrains.com/issue/KT-55017)を参照してください。

### Javaプリミティブ配列の null 安全性の向上 {id="improved-null-safety-for-java-primitive-arrays"}

**何が変わったのか？**

Kotlin 2.0.0から、コンパイラはKotlinにインポートされたJavaプリミティブ配列のnull許容性を正しく推論するようになりました。現在、Javaプリミティブ配列で使用されている `TYPE_USE` アノテーションからのネイティブなnull許容性を保持し、それらの値がアノテーションに従って使用されていない場合にエラーを生成します。

通常、`@Nullable` および `@NotNull` アノテーションを持つJava型がKotlinから呼び出されると、適切なネイティブnull許容性が付与されます。

```java
interface DataService {
    @NotNull ResultContainer<@Nullable String> fetchData();
}
```
```kotlin
val dataService: DataService = ... 
dataService.fetchData() // -> ResultContainer<String?>
```

以前は、Javaプリミティブ配列がKotlinにインポートされた際、すべての `TYPE_USE` アノテーションが失われ、プラットフォームnull許容性（Platform nullability）となり、安全でないコードになる可能性がありました。

```java
interface DataProvider {
    int @Nullable [] fetchData();
}
```

```kotlin
val dataService: DataProvider = ...
dataService.fetchData() // -> IntArray .. IntArray?
// アノテーションによれば `dataService.fetchData()` は `null` になる可能性があるにもかかわらず、エラーは発生しません
// これにより NullPointerException が発生する可能性があります
dataService.fetchData()[0]
```
この問題は、宣言自体のアノテーションには影響せず、`TYPE_USE` アノテーションにのみ影響していたことに注意してください。

**現在のベストプラクティスは？**

Kotlin 2.0.0では、Javaプリミティブ配列の null 安全性がKotlinの標準となったため、それらを使用している場合は新しい警告やエラーがないかコードを確認してください。

* 明示的なnullチェックなしで `@Nullable` なJavaプリミティブ配列を使用したり、null非許容のプリミティブ配列を期待するJavaメソッドに `null` を渡そうとしたりするコードは、コンパイルに失敗するようになります。
* `@NotNull` なプリミティブ配列をnullチェックと共に使用すると、"Unnecessary safe call"（不要なセーフコール）や "Comparison with null always false"（nullとの比較は常に偽）といった警告が表示されるようになります。

詳細については、[YouTrack의対応する課題](https://youtrack.jetbrains.com/issue/KT-54521)を参照してください。

### expectedクラス内の抽象メンバに対するより厳格なルール {id="stricter-rules-for-abstract-members-in-expected-classes"}

> expectedクラスおよびactualクラスは[ベータ版](components-stability.md#stability-levels-explained)です。これらはほぼ安定していますが、将来的に移行手順を実行する必要があるかもしれません。弊社では、お客様が行う必要のあるさらなる変更を最小限に抑えるよう最善を尽くします。
>
{style="warning"}

**何が変わったのか？**

K2コンパイラによるコンパイル中の共通ソースとプラットフォームソースの分離に伴い、expectedクラス内の抽象メンバに対してより厳格なルールを導入しました。

以前のコンパイラでは、expectedの非抽象クラスが、[関数をオーバーライド](inheritance.md#overriding-rules)することなく抽象関数を継承することが可能でした。コンパイラが共通コードとプラットフォームコードの両方に同時にアクセスできたため、コンパイラは抽象関数に対応するオーバーライドと定義がactualクラスにあるかどうかを確認できました。

現在は共通ソースとプラットフォームソースが別々にコンパイルされるため、コンパイラがその関数が抽象ではないことを認識できるように、継承された関数はexpectedクラスで明示的にオーバーライドされる必要があります。そうしないと、コンパイラは `ABSTRACT_MEMBER_NOT_IMPLEMENTED` エラーを報告します。

例えば、共通ソースセットで `listFiles()` という抽象関数を持つ `FileSystem` という抽象クラスを宣言したとします。プラットフォームソースセットでは、actual宣言の一部として `listFiles()` 関数を定義します。

共通コードに、`FileSystem` クラスを継承する `PlatformFileSystem` という名前のexpectedの非抽象クラスがある場合、`PlatformFileSystem` クラスは抽象関数 `listFiles()` を継承します。しかし、Kotlinでは非抽象クラス内に抽象関数を持たせることはできません。`listFiles()` 関数を非抽象にするには、`abstract` キーワードなしでオーバーライドとして宣言する必要があります。

<table>
   <tr>
       <td>共通コード</td>
       <td>プラットフォームコード</td>
   </tr>
   <tr>
<td>

```kotlin
abstract class FileSystem {
    abstract fun listFiles()
}
expect open class PlatformFileSystem() : FileSystem {
    // Kotlin 2.0.0では、明示的なオーバーライドが必要です
    expect override fun listFiles()
    // Kotlin 2.0.0より前では、オーバーライドは不要でした
}
```

</td>
<td>

```kotlin
actual open class PlatformFileSystem : FileSystem {
    actual override fun listFiles() {}
}
```

</td>
</tr>
</table>

**現在のベストプラクティスは？**

expectedの非抽象クラスで抽象関数を継承している場合は、非抽象のオーバーライドを追加してください。

詳細については、[YouTrackの対応する課題](https://youtrack.jetbrains.com/issue/KT-59739/K2-MPP-reports-ABSTRACTMEMBERNOTIMPLEMENTED-for-inheritor-in-common-code-when-the-implementation-is-located-in-the-actual) を参照してください。

### 分野別 {id="per-subject-area"}

これらの分野別リストには、コードに影響を与える可能性は低いものの、詳細を確認するための関連するYouTrack課題へのリンクが含まれています。課題IDの隣にアスタリスク（*）が付いている変更は、セクションの冒頭で説明されています。

#### 型推論 {initial-collapse-state="collapsed" collapsible="true" id="type-inference"}

| 課題 ID | タイトル |
|-----------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| [KT-64189](https://youtrack.jetbrains.com/issue/KT-64189) | 型が明示的に Normal である場合、プロパティ参照のコンパイル済み関数シグネチャにおける型が正しくない |
| [KT-47986](https://youtrack.jetbrains.com/issue/KT-47986) | ビルダー推論コンテキストにおいて、型変数を上限（upper bound）へ暗黙的に推論することを禁止する |
| [KT-59275](https://youtrack.jetbrains.com/issue/KT-59275) | K2: 配列リテラル内のジェネリックアノテーション呼び出しに明示的な型引数を要求する |
| [KT-53752](https://youtrack.jetbrains.com/issue/KT-53752) | 交差型（intersection type）に対するサブタイピングチェックの漏れ |
| [KT-59138](https://youtrack.jetbrains.com/issue/KT-59138) | Kotlin における Java 型パラメータに基づく型のデフォルト表現を変更 |
| [KT-57178](https://youtrack.jetbrains.com/issue/KT-57178) | 前置インクリメントの推論される型を、inc() 演算子の戻り値型ではなくゲッターの戻り値型を返すように変更 |
| [KT-57609](https://youtrack.jetbrains.com/issue/KT-57609) | K2: 反変（contravariant）パラメータに対する @UnsafeVariance の存在への依存を停止 |
| [KT-57620](https://youtrack.jetbrains.com/issue/KT-57620) | K2: raw 型に対して subsumed メンバへの解決を禁止 |
| [KT-64641](https://youtrack.jetbrains.com/issue/KT-64641) | K2: 拡張関数パラメータを持つ呼び出し可能オブジェクトへの参照の型を正しく推論 |
| [KT-57011](https://youtrack.jetbrains.com/issue/KT-57011) | 指定された場合、分解変数の実際の型を明示的な型と一致させる |
| [KT-38895](https://youtrack.jetbrains.com/issue/KT-38895) | K2: フィックス：整数リテラルのオーバーフローに関する不整合な動作 |
| [KT-54862](https://youtrack.jetbrains.com/issue/KT-54862) | 匿名型が型引数から匿名関数を介して公開される可能性がある |
| [KT-22379](https://youtrack.jetbrains.com/issue/KT-22379) | break を伴う while ループの条件が、不適切なスマートキャストを生成する可能性がある |
| [KT-62507](https://youtrack.jetbrains.com/issue/KT-62507) | K2: expect/actual トップレベルプロパティに対する共通コードでのスマートキャストを禁止 |
| [KT-65750](https://youtrack.jetbrains.com/issue/KT-65750) | 戻り値の型を変更するインクリメントおよびプラス演算子がスマートキャストに影響を与える必要がある |
| [KT-65349](https://youtrack.jetbrains.com/issue/KT-65349) | [LC] K2: 変数型を明示的に指定すると、K1 で動作していたいくつかのケースで束縛スマートキャストが壊れる |

#### ジェネリクス {initial-collapse-state="collapsed" collapsible="true" id="generics"}

| 課題 ID | タイトル |
|------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| [KT-54309](https://youtrack.jetbrains.com/issue/KT-54309)* | [投影されたレシーバーでの合成セッターの使用を非推奨化](#deprecated-synthetics-setter-on-a-projected-receiver) |
| [KT-57600](https://youtrack.jetbrains.com/issue/KT-57600) | raw 型パラメータを持つ Java メソッドを、ジェネリック型パラメータでオーバーライドすることを禁止 |
| [KT-54663](https://youtrack.jetbrains.com/issue/KT-54663) | null 許容の可能性がある型パラメータを `in` 投影された DNN パラメータに渡すことを禁止 |
| [KT-54066](https://youtrack.jetbrains.com/issue/KT-54066) | typealias コンストラクタにおける上限（upper bound）違反を非推奨化 |
| [KT-49404](https://youtrack.jetbrains.com/issue/KT-49404) | Java クラスに基づく反変キャプチャ型の型の不健全性を修正 |
| [KT-61718](https://youtrack.jetbrains.com/issue/KT-61718) | 自己上限（self upper bounds）とキャプチャ型を持つ不健全なコードを禁止 |
| [KT-61749](https://youtrack.jetbrains.com/issue/KT-61749) | ジェネリック外部クラスのジェネリック内部クラスにおける不健全な境界違反を禁止 |
| [KT-62923](https://youtrack.jetbrains.com/issue/KT-62923) | K2: 内部クラスの外部スーパータイプの投影に対して PROJECTION_IN_IMMEDIATE_ARGUMENT_TO_SUPERTYPE を導入 |
| [KT-63243](https://youtrack.jetbrains.com/issue/KT-63243) | 別のスーパータイプから追加の特化された実装を持つプリミティブのコレクションを継承する際に MANY_IMPL_MEMBER_NOT_IMPLEMENTED を報告 |
| [KT-60305](https://youtrack.jetbrains.com/issue/KT-60305) | K2: 展開された型に変異修飾子（variance modifiers）を持つ型エイリアスでのコンストラクタ呼び出しと継承を禁止 |
| [KT-64965](https://youtrack.jetbrains.com/issue/KT-64965) | 自己上限を持つキャプチャ型の不適切な処理によって生じる型の穴を修正 |
| [KT-64966](https://youtrack.jetbrains.com/issue/KT-64966) | ジェネリックパラメータに対して誤った型を持つジェネリック委譲コンストラクタ呼び出しを禁止 |
| [KT-65712](https://youtrack.jetbrains.com/issue/KT-65712) | 上限がキャプチャ型である場合の欠落した上限違反を報告 |

#### 解決（Resolution） {initial-collapse-state="collapsed" collapsible="true" id="resolution"}

| 課題 ID | タイトル |
|------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [KT-55017](https://youtrack.jetbrains.com/issue/KT-55017)* | [Java フィールドを持つベースクラスとのオーバーロード解決中に、派生クラスの Kotlin プロパティを選択](#consistent-resolution-order-of-kotlin-properties-and-java-fields-with-the-same-name) |
| [KT-58260](https://youtrack.jetbrains.com/issue/KT-58260) | invoke 規約が期待される脱糖（desugaring）と一貫して動作するようにする |
| [KT-62866](https://youtrack.jetbrains.com/issue/KT-62866) | K2: コンパニオンオブジェクトが静的スコープよりも優先される場合の修飾子解決の動作を変更 |
| [KT-57750](https://youtrack.jetbrains.com/issue/KT-57750) | 型を解決する際、同じ名前のクラスがスターインポートされている場合に曖昧さエラーを報告 |
| [KT-63558](https://youtrack.jetbrains.com/issue/KT-63558) | K2: COMPATIBILITY_WARNING 周辺の解決を移行 |
| [KT-51194](https://youtrack.jetbrains.com/issue/KT-51194) | 依存関係クラスが同じ依存関係の 2 つの異なるバージョンに含まれている場合の偽陰性 CONFLICTING_INHERITED_MEMBERS |
| [KT-37592](https://youtrack.jetbrains.com/issue/KT-37592) | レシーバーを持つ関数型のプロパティ invoke が拡張関数の invoke よりも優先される |
| [KT-51666](https://youtrack.jetbrains.com/issue/KT-51666) | 修飾された this: 型で修飾された this ケースを導入/優先順位付け |
| [KT-54166](https://youtrack.jetbrains.com/issue/KT-54166) | クラスパスにおける完全修飾名（FQ name）の競合が発生した場合の未指定の動作を確認 |
| [KT-64431](https://youtrack.jetbrains.com/issue/KT-64431) | K2: インポートにおける修飾子として型エイリアスを使用することを禁止 |
| [KT-56520](https://youtrack.jetbrains.com/issue/KT-56520) | K1/K2: 低いレベルで曖昧さがある型参照に対する解決タワーの誤った動作 |

#### 可視性 {initial-collapse-state="collapsed" collapsible="true" id="visibility"}

| 課題 ID | タイトル |
|-------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| [KT-64474](https://youtrack.jetbrains.com/issue/KT-64474/)* | [アクセス不能な型の使用を未指定の動作として宣言](#forbidden-use-of-inaccessible-generic-types) |
| [KT-55179](https://youtrack.jetbrains.com/issue/KT-55179) | internal インライン関数からプライベートクラスのコンパニオンオブジェクトメンバを呼び出す際の偽陰性 PRIVATE_CLASS_MEMBER_FROM_INLINE |
| [KT-58042](https://youtrack.jetbrains.com/issue/KT-58042) | オーバーライドされた宣言が可視であっても、同等のゲッターが不可視であれば合成プロパティを不可視にする |
| [KT-64255](https://youtrack.jetbrains.com/issue/KT-64255) | 別のモジュールの派生クラスから internal セッターにアクセスすることを禁止 |
| [KT-33917](https://youtrack.jetbrains.com/issue/KT-33917) | プライベートインライン関数から匿名型を公開することを禁止 |
| [KT-54997](https://youtrack.jetbrains.com/issue/KT-54997) | パブリック API インライン関数からの暗黙的な非パブリック API アクセスを禁止 |
| [KT-56310](https://youtrack.jetbrains.com/issue/KT-56310) | スマートキャストが protected メンバの可視性に影響を与えないようにする |
| [KT-65494](https://youtrack.jetbrains.com/issue/KT-65494) | パブリックインライン関数から、見落とされていたプライベート演算子関数へのアクセスを禁止 |
| [KT-65004](https://youtrack.jetbrains.com/issue/KT-65004) | K1: protected val をオーバーライドする var のセッターが public として生成される |
| [KT-64972](https://youtrack.jetbrains.com/issue/KT-64972) | Kotlin/Native のリンク時においてプライベートメンバによるオーバーライドを禁止 |

#### アノテーション {initial-collapse-state="collapsed" collapsible="true" id="annotations"}

| 課題 ID | タイトル |
|-----------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| [KT-58723](https://youtrack.jetbrains.com/issue/KT-58723) | EXPRESSION ターゲットを持たないアノテーションで文（statement）を修飾することを禁止 |
| [KT-49930](https://youtrack.jetbrains.com/issue/KT-49930) | \`REPEATED_ANNOTATION\` チェック中に括弧式を無視する |
| [KT-57422](https://youtrack.jetbrains.com/issue/KT-57422) | K2: プロパティゲッターに対する使用部位 'get' ターゲットアノテーションの使用を禁止 |
| [KT-46483](https://youtrack.jetbrains.com/issue/KT-46483) | where 句内の型パラメータに対するアノテーションを禁止 |
| [KT-64299](https://youtrack.jetbrains.com/issue/KT-64299) | コンパニオンオブジェクト上のアノテーションの解決においてコンパニオンスコープが無視される |
| [KT-64654](https://youtrack.jetbrains.com/issue/KT-64654) | K2: ユーザー指定のアノテーションとコンパイラが要求するアノテーションの間に曖昧さを導入 |
| [KT-64527](https://youtrack.jetbrains.com/issue/KT-64527) | 列挙型の値に対するアノテーションを列挙値クラスにコピーしないようにする |
| [KT-63389](https://youtrack.jetbrains.com/issue/KT-63389) | K2: \`()?\` でラップされた型に対する互換性のないアノテーションに対して \`WRONG_ANNOTATION_TARGET\` が報告される |
| [KT-63388](https://youtrack.jetbrains.com/issue/KT-63388) | K2: \`WRONG_ANNOTATION_TARGET\` が報告される catch パラメータ型の型アノテーションに対して |

#### null 安全性 {initial-collapse-state="collapsed" collapsible="true" id="null-safety"}

| 課題 ID | タイトル |
|------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| [KT-54521](https://youtrack.jetbrains.com/issue/KT-54521)* | [Java で Nullable とアノテーションされた配列型の安全でない使用を非推奨化](#improved-null-safety-for-java-primitive-arrays) |
| [KT-41034](https://youtrack.jetbrains.com/issue/KT-41034) | K2: セーフコールと規約演算子の組み合わせに対する評価セマンティクスを変更 |
| [KT-50850](https://youtrack.jetbrains.com/issue/KT-50850) | スーパータイプの順序が継承された関数の null 許容性パラメータを定義する |
| [KT-53982](https://youtrack.jetbrains.com/issue/KT-53982) | パブリックシグネチャでローカル型を近似する際、null 許容性を保持する |
| [KT-62998](https://youtrack.jetbrains.com/issue/KT-62998) | 安全でない代入のセレクタとして、null 許容型を null 非許容の Java フィールドに代入することを禁止 |
| [KT-63209](https://youtrack.jetbrains.com/issue/KT-63209) | 警告レベルの Java 型に対するエラーレベルの null 許容引数の欠落したエラーを報告 |

#### Java 相互運用性 {initial-collapse-state="collapsed" collapsible="true" id="java-interoperability"}

| 課題 ID | タイトル |
|-----------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| [KT-53061](https://youtrack.jetbrains.com/issue/KT-53061) | ソース内で同じ完全修飾名（FQ name）を持つ Java および Kotlin クラスを禁止 |
| [KT-49882](https://youtrack.jetbrains.com/issue/KT-49882) | Java コレクションを継承したクラスが、スーパータイプの順序に応じて矛盾した動作をする |
| [KT-66324](https://youtrack.jetbrains.com/issue/KT-66324) | K2: Kotlin のプライベートクラスを Java クラスが継承した場合の未指定の動作 |
| [KT-66220](https://youtrack.jetbrains.com/issue/KT-66220) | Java の可変長引数メソッドをインライン関数に渡すと、実行時にただの配列ではなく配列の配列になる |
| [KT-66204](https://youtrack.jetbrains.com/issue/KT-66204) | K-J-K 階層における internal メンバのオーバーライドを許可 |

#### プロパティ {initial-collapse-state="collapsed" collapsible="true" id="properties"}

| 課題 ID | タイトル |
|------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| [KT-57555](https://youtrack.jetbrains.com/issue/KT-57555)* | [[LC] バッキングフィールドを持つ open プロパティの遅延初期化を禁止](#immediate-initialization-of-open-properties-with-backing-fields) |
| [KT-58589](https://youtrack.jetbrains.com/issue/KT-58589) | 基本コンストラクタが存在しない場合やクラスがローカルな場合に、欠落した MUST_BE_INITIALIZED を非推奨化 |
| [KT-64295](https://youtrack.jetbrains.com/issue/KT-64295) | プロパティに対する潜在的な invoke 呼び出しが発生した場合の再帰的解決を禁止 |
| [KT-57290](https://youtrack.jetbrains.com/issue/KT-57290) | ベースクラスが別のモジュールにある場合、不可視の派生クラスからのベースクラスプロパティに対するスマートキャストを非推奨化 |
| [KT-62661](https://youtrack.jetbrains.com/issue/KT-62661) | K2: データクラスのプロパティに対する OPT_IN_USAGE_ERROR の漏れ |

#### 制御フロー {initial-collapse-state="collapsed" collapsible="true" id="control-flow"}

| 課題 ID | タイトル |
|-----------------------------------------------------------|--------------------------------------------------------------------------------------------|
| [KT-56408](https://youtrack.jetbrains.com/issue/KT-56408) | K1 と K2 の間におけるクラス初期化ブロック内の CFA（制御フロー解析）ルールの不整合 |
| [KT-57871](https://youtrack.jetbrains.com/issue/KT-57871) | 括弧内の else ブランチのない if 条件文における K1/K2 の不整合 |
| [KT-42995](https://youtrack.jetbrains.com/issue/KT-42995) | スコープ関数内での初期化を伴う try/catch ブロックにおける偽陰性 "VAL_REASSIGNMENT" |
| [KT-65724](https://youtrack.jetbrains.com/issue/KT-65724) | try ブロックから catch および finally ブロックへのデータフロー情報の伝播 |

#### 列挙型クラス {initial-collapse-state="collapsed" collapsible="true" id="enum-classes"}

| 課題 ID | タイトル |
|-----------------------------------------------------------|----------------------------------------------------------------------------------------------|
| [KT-57608](https://youtrack.jetbrains.com/issue/KT-57608) | 列挙型エントリの初期化中に列挙型クラスのコンパニオンオブジェクトへのアクセスを禁止 |
| [KT-34372](https://youtrack.jetbrains.com/issue/KT-34372) | 列挙型クラスにおける仮想インラインメソッドの欠落したエラーを報告 |
| [KT-52802](https://youtrack.jetbrains.com/issue/KT-52802) | プロパティ/フィールドと列挙型エントリの間の解決の曖昧さを報告 |
| [KT-47310](https://youtrack.jetbrains.com/issue/KT-47310) | コンパニオンプロパティが列挙型エントリよりも優先される場合の修飾子解決の動作を変更 |

#### 関数型（SAM）インターフェース {initial-collapse-state="collapsed" collapsible="true" id="functional-sam-interfaces"}

| 課題 ID | タイトル |
|-----------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| [KT-52628](https://youtrack.jetbrains.com/issue/KT-52628) | アノテーションなしで OptIn を必要とする SAM コンストラクタの使用を非推奨化 |
| [KT-57014](https://youtrack.jetbrains.com/issue/KT-57014) | JDK 関数インターフェースの SAM コンストラクタに対して、ラムダから誤った null 許容性を持つ値を返すことを禁止 |
| [KT-64342](https://youtrack.jetbrains.com/issue/KT-64342) | 呼び出し可能参照のパラメータ型の SAM 変換が CCE（ClassCastException）を引き起こす |

#### コンパニオンオブジェクト {initial-collapse-state="collapsed" collapsible="true" id="companion-object"}

| 課題 ID | タイトル |
|-----------------------------------------------------------|--------------------------------------------------------------------------|
| [KT-54316](https://youtrack.jetbrains.com/issue/KT-54316) | コンパニオンオブジェクトのメンバへの呼び出し外の参照が、無効なシグネチャを持つ |
| [KT-47313](https://youtrack.jetbrains.com/issue/KT-47313) | V がコンパニオンを持つ場合の (V)::foo 参照解決の変更 |

#### その他 {initial-collapse-state="collapsed" collapsible="true" id="miscellaneous"}

| 課題 ID | タイトル |
|------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| [KT-59739](https://youtrack.jetbrains.com/issue/KT-59739)* | [実装が actual 側にある場合、共通コードの継承クラスに対して K2/MPP が [ABSTRACT_MEMBER_NOT_IMPLEMENTED] を報告する](#expectedクラス内の抽象メンバに対するより厳格なルール) |
| [KT-49015](https://youtrack.jetbrains.com/issue/KT-49015) | 修飾された this: 潜在的なラベルの競合が発生した場合の動作変更 |
| [KT-56545](https://youtrack.jetbrains.com/issue/KT-56545) | Java サブクラスで偶然重複したオーバーロードが発生した場合の、JVM バックエンドにおける誤った関数のマングリングを修正 |
| [KT-62019](https://youtrack.jetbrains.com/issue/KT-62019) | [LC issue] 文（statement）の位置における suspend マーク付きの匿名関数宣言を禁止 |
| [KT-55111](https://youtrack.jetbrains.com/issue/KT-55111) | OptIn: マーカー下でのデフォルト引数（デフォルト値を持つパラメータ）を伴うコンストラクタ呼び出しを禁止 |
| [KT-61182](https://youtrack.jetbrains.com/issue/KT-61182) | 変数上の式 + invoke 解決に対して、Unit 変換が誤って許可されていた問題を修正 |
| [KT-55199](https://youtrack.jetbrains.com/issue/KT-55199) | 適応を伴う呼び出し可能参照を KFunction へ昇格させることを禁止 |
| [KT-65776](https://youtrack.jetbrains.com/issue/KT-65776) | [LC] K2 が \`false && ...\` および \`false &VerticalLine;&VerticalLine; ...\` を壊す問題を修正 |
| [KT-65682](https://youtrack.jetbrains.com/issue/KT-65682) | [LC] \`header\`/\`impl\` キーワードを非推奨化 |
| [KT-45375](https://youtrack.jetbrains.com/issue/KT-45375) | デフォルトですべての Kotlin ラムダを invokedynamic + LambdaMetafactory を介して生成 |

## Kotlin リリースとの互換性 {id="compatibility-with-kotlin-releases"}

以下の Kotlin リリースは、新しい K2 コンパイラをサポートしています。

| Kotlin リリース | 安定性レベル |
|-----------------------|-----------------|
| 2.0.0–%kotlinVersion% | 安定版（Stable） |
| 1.9.20–1.9.25 | ベータ版（Beta） |
| 1.9.0–1.9.10 | JVM はベータ版 |
| 1.7.0–1.8.22 | アルファ版（Alpha） |

## Kotlin ライブラリとの互換性 {id="compatibility-with-kotlin-libraries"}

Kotlin/JVM を使用している場合、K2 コンパイラは任意のバージョンの Kotlin でコンパイルされたライブラリと動作します。

Kotlin マルチプラットフォームを使用している場合、K2 コンパイラは Kotlin バージョン 1.9.20 以降でコンパイルされたライブラリと動作することが保証されています。

## コンパイラプラグインのサポート {id="compiler-plugins-support"}

現在、Kotlin K2 コンパイラは以下の Kotlin コンパイラプラグインをサポートしています。

* [`all-open`](all-open-plugin.md)
* [AtomicFU](https://github.com/Kotlin/kotlinx-atomicfu)
* [`jvm-abi-gen`](https://github.com/JetBrains/kotlin/tree/master/plugins/jvm-abi-gen)
* [`js-plain-objects`](https://github.com/JetBrains/kotlin/tree/master/plugins/js-plain-objects)
* [kapt](whatsnew1920.md#preview-kapt-compiler-plugin-with-k2)
* [Lombok](lombok.md)
* [`no-arg`](no-arg-plugin.md)
* [Parcelize](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.plugin.parcelize)
* [Power-assert](power-assert.md)
* [SAM with receiver](sam-with-receiver-plugin.md)
* [Serialization](serialization.md)

さらに、Kotlin K2 コンパイラは以下もサポートしています。

* [Jetpack Compose](https://developer.android.com/jetpack/compose) 1.5.0 コンパイラプラグイン以降のバージョン。
* [Kotlin Symbol Processing (KSP)](ksp-overview.md) は [KSP2](https://android-developers.googleblog.com/2023/12/ksp2-preview-kotlin-k2-standalone.html) 以降でサポート。

> 他のコンパイラプラグインを使用している場合は、それらのドキュメントを確認して、K2 と互換性があるかどうかを確かめてください。
>
{style="tip"}

### カスタムコンパイラプラグインのアップグレード {id="upgrade-your-custom-compiler-plugins"}

> カスタムコンパイラプラグインは、[試験的（Experimental）](components-stability.md#stability-levels-explained) なプラグイン API を使用しています。そのため、API はいつでも変更される可能性があり、後方互換性は保証されません。
>
{style="warning"}

アップグレードプロセスは、お使いのカスタムプラグインのタイプに応じて 2 つのパスがあります。

#### バックエンド限定のコンパイラプラグイン {id="backend-only-compiler-plugins"}

プラグインが `IrGenerationExtension` 拡張ポイントのみを実装している場合、プロセスは他の新しいコンパイラリリースの場合と同じです。使用している API に変更がないか確認し、必要に応じて変更を加えてください。

#### バックエンドおよびフロントエンドのコンパイラプラグイン {id="backend-and-frontend-compiler-plugins"}

プラグインがフロントエンド関連の拡張ポイントを使用している場合は、新しい K2 コンパイラ API を使用してプラグインを書き直す必要があります。新しい API の概要については、[FIR Plugin API](https://github.com/JetBrains/kotlin/blob/master/docs/fir/fir-plugins.md) を参照してください。

> カスタムコンパイラプラグインのアップグレードについて質問がある場合は、Slack の [#compiler](https://kotlinlang.slack.com/archives/C7L3JB43G) チャネルに参加してください。可能な限りお手伝いさせていただきます。
>
{style="note"}

## 新しい K2 コンパイラに関するフィードバックをお寄せください {id="share-your-feedback-on-the-new-k2-compiler"}

皆様からのフィードバックをお待ちしております！

* 新しい K2 コンパイラへの移行で直面した問題は、[弊社の課題トラッカー](https://youtrack.jetbrains.com/newIssue?project=KT&summary=K2+release+migration+issue&description=Describe+the+problem+you+encountered+here.&c=tag+k2-release-migration) に報告してください。
* [「Send usage statistics」（使用統計を送信する）オプションを有効にする](https://www.jetbrains.com/help/idea/settings-usage-statistics.html) ことで、JetBrains が K2 の使用に関する匿名データを収集することを許可してください。