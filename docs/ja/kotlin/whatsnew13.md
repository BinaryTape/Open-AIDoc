[//]: # (title: Kotlin 1.3 の新機能)

<web-summary>新しい言語機能、Kotlin Multiplatform、JVM、Native、JS のアップデート、Gradle および Maven のビルドツールサポートを網羅した Kotlin 1.3 のリリースノートをお読みください。</web-summary>

_リリース日: 2018年10月29日_

> Kotlin のリリースサイクルに関する情報は、[Kotlin のリリースプロセス](releases.md)を参照してください。
>
{style="tip"}

## コルーチンの正式リリース {id="coroutines-release"}

長期間にわたる広範な実戦テストを経て、コルーチンがついに正式リリースされました！これは、Kotlin 1.3 から言語サポートおよび API が[完全に安定（Stable）](components-stability.md)したことを意味します。新しくなった[コルーチンの概要](coroutines-overview.md)ページをぜひご覧ください。

Kotlin 1.3 では、suspend 関数に対する呼び出し可能参照（callable references）と、リフレクション API におけるコルーチンのサポートが導入されました。

## Kotlin/Native {id="kotlin-native"}

Kotlin 1.3 では、引き続き Native ターゲットの改善と洗練が進められています。詳細は [Kotlin/Native の概要](native-overview.md)を参照してください。

## マルチプラットフォームプロジェクト {id="multiplatform-projects"}

1.3 では、表現力と柔軟性を向上させ、共通コードの共有をより容易にするために、マルチプラットフォームプロジェクトのモデルを完全に再構築しました。また、Kotlin/Native もターゲットの1つとしてサポートされるようになりました！

旧モデルとの主な違いは以下のとおりです：

  * 旧モデルでは、共通コードとプラットフォーム固有のコードを別々のモジュールに配置し、`expectedBy` 依存関係でリンクする必要がありました。新モデルでは、共通コードとプラットフォーム固有コードを同じモジュールの異なるソースルートに配置するため、プロジェクトの設定が簡単になりました。
  * サポートされているさまざまなプラットフォーム向けに、多数の[プリセットプラットフォーム設定](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#targets)が用意されました。
  * [依存関係の設定](https://kotlinlang.org/docs/multiplatform/multiplatform-add-dependencies.html)が変更され、依存関係はソースルートごとに個別に指定するようになりました。
  * プラットフォームの任意のサブセット間でソースセットを共有できるようになりました（例えば、JS、Android、iOS をターゲットとするモジュールにおいて、Android と iOS の間でのみ共有されるソースセットを持つことができます）。
  * [マルチプラットフォームライブラリの公開](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-lib-setup.html)がサポートされました。

詳細については、[マルチプラットフォームプログラミングのドキュメント](https://kotlinlang.org/docs/multiplatform/get-started.html)を参照してください。

## コントラクト（Contracts） {id="contracts"}

Kotlin コンパイラは、警告の表示やボイラープレートの削減のために広範な静的解析を行います。最も顕著な機能の1つがスマートキャスト（行われた型チェックに基づいて自動的にキャストを実行する機能）です：

```kotlin
fun foo(s: String?) {
    if (s != null) s.length // コンパイラは自動的に 's' を 'String' にキャストします
}
```

しかし、これらのチェックが別の関数に抽出されると、スマートキャストは即座にすべて機能しなくなってしまいます：

```kotlin
fun String?.isNotNull(): Boolean = this != null

fun foo(s: String?) {
    if (s.isNotNull()) s.length // スマートキャストが効かない :(
}
```

このようなケースでの動作を改善するため、Kotlin 1.3 では*コントラクト（contracts）*と呼ばれる実験的機能が導入されました。

*コントラクト*を使用すると、関数が自身の振る舞いをコンパイラが理解できる形で明示的に記述できます。現在、大きく分けて2つのケースがサポートされています：

* 関数の呼び出し結果と渡された引数の値との関係を宣言することによる、スマートキャスト解析の改善：

```kotlin
fun require(condition: Boolean) {
    // これはコンパイラに対して次のように伝える構文形式です：
    // 「この関数が正常に戻った場合、渡された 'condition' は true である」
    contract { returns() implies condition }
    if (!condition) throw IllegalArgumentException(...)
}

fun foo(s: String?) {
    require(s is String)
    // ここで s は 'String' にスマートキャストされます。
    // そうでなければ 'require' が例外をスローしているはずだからです
}
```

* 高階関数が存在する場合における変数初期化解析の改善：

```kotlin
fun synchronize(lock: Any?, block: () -> Unit) {
    // コンパイラに対して次のように伝えます：
    // 「この関数はここで直ちに、かつ正確に1回だけ 'block' を呼び出す」
    contract { callsInPlace(block, EXACTLY_ONCE) }
}

fun foo() {
    val x: Int
    synchronize(lock) {
        x = 42 // 'synchronize' に渡されたラムダが正確に1回呼び出されることを
               // コンパイラが認識しているため、再代入エラーは報告されません
    }
    println(x) // ラムダが確実に呼び出されて初期化が行われることを
               // コンパイラが認識しているため、ここで 'x' は初期化済みとみなされます
}
```

### 標準ライブラリ（stdlib）におけるコントラクト {id="contracts-in-stdlib"}

`stdlib` はすでにコントラクトを活用しており、上記の解析改善の恩恵を受けています。コントラクトのこの部分は**安定（Stable）**しているため、追加のオプトインなしで今すぐ改善された解析のメリットを享受できます：

```kotlin
//sampleStart
fun bar(x: String?) {
    if (!x.isNullOrEmpty()) {
        println("length of '$x' is ${x.length}") // やった！not-null へのスマートキャストです！
    }
}
//sampleEnd
fun main() {
    bar(null)
    bar("42")
}
```
{kotlin-runnable="true"}

### カスタムコントラクト {id="custom-contracts"}

独自の関数に対してコントラクトを宣言することも可能ですが、現在の構文は初期プロトタイプの段階であり、将来変更される可能性が非常に高いため、この機能は**実験的（Experimental）**です。また、現在の Kotlin コンパイラはコントラクトの正当性を検証しないため、正確で健全なコントラクトを記述する責任はプログラマーにあることに注意してください。

カスタムコントラクトは、DSL スコープを提供する `contract` stdlib 関数の呼び出しによって導入します：

```kotlin
fun String?.isNullOrEmpty(): Boolean {
    contract {
        returns(false) implies (this@isNullOrEmpty != null)
    }
    return this == null || isEmpty()
}
```

構文の詳細や互換性に関する注意事項については、[KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/kotlin-contracts.md) を参照してください。

## when の対象を変数にキャプチャ {id="capturing-when-subject-in-a-variable"}

Kotlin 1.3 では、`when` の対象（subject）を変数にキャプチャできるようになりました：

```kotlin
fun Request.getBody() =
        when (val response = executeRequest()) {
            is Success -> response.body
            is HttpError -> throw HttpException(response.status)
        }
```

`when` の直前でこの変数を抽出することは以前から可能でしたが、`when` 内の `val` はそのスコープが `when` のボディ内に適切に制限されるため、名前空間の汚染を防ぐことができます。[詳細なドキュメントは、こちらの `when` に関する説明を参照してください](control-flow.md#when-expressions-and-statements)。

## インターフェースのコンパニオンにおける @JvmStatic と @JvmField {id="jvmstatic-and-jvmfield-in-companions-of-interfaces"}

Kotlin 1.3 では、インターフェースの `companion` オブジェクトのメンバーに `@JvmStatic` および `@JvmField` アノテーションを付加できるようになりました。クラスファイル内では、そのようなメンバーは対応するインターフェースへと引き上げられ（lift）、`static` としてマークされます。

例えば、次の Kotlin コードは：

```kotlin
interface Foo {
    companion object {
        @JvmField
        val answer: Int = 42

        @JvmStatic
        fun sayHello() {
            println("Hello, world!")
        }
    }
}
```

以下の Java コードと同等になります：

```java
interface Foo {
    public static int answer = 42;
    public static void sayHello() {
        // ...
    }
}
```

## アノテーションクラス内のネストされた宣言 {id="nested-declarations-in-annotation-classes"}

Kotlin 1.3 では、アノテーション内にネストされたクラス、インターフェース、オブジェクト、コンパニオンを持つことができるようになりました：

```kotlin
annotation class Foo {
    enum class Direction { UP, DOWN, LEFT, RIGHT }
    
    annotation class Bar

    companion object {
        fun foo(): Int = 42
        val bar: Int = 42
    }
}
```

## 引数なしの main {id="parameterless-main"}

慣例として、Kotlin プログラムのエントリポイントは `main(args: Array<String>)` のようなシグネチャを持つ関数であり、`args` はプログラムに渡されるコマンドライン引数を表します。しかし、すべてのアプリケーションがコマンドライン引数をサポートしているわけではないため、このパラメータは結局使われないことがよくありました。

Kotlin 1.3 では、パラメータを取らないよりシンプルな形式の `main` が導入されました。これにより、Kotlin の "Hello, World" は19文字短くなりました！

```kotlin
fun main() {
    println("Hello, world!")
}
```
{kotlin-runnable="true"}

## 大きなアリティ（arity）を持つ関数 {id="functions-with-big-arity"}

Kotlin では、関数型は異なる数のパラメータを受け取るジェネリッククラスとして表されます：`Function0<R>`、`Function1<P0, R>`、`Function2<P0, P1, R>`、... このアプローチの問題は、このリストが有限であり、現在は `Function22` で終わっているという点です。

Kotlin 1.3 ではこの制限が緩和され、より大きなアリティ（引数の数）を持つ関数のサポートが追加されました：

```kotlin
fun trueEnterpriseComesToKotlin(block: (Any, Any, ... /* さらに42個 */, Any) -> Any) {
    block(Any(), Any(), ..., Any())
}
```

## プログレッシブモード（Progressive mode） {id="progressive-mode"}

Kotlin は、コードの安定性と後方互換性を非常に重視しています。Kotlin の互換性ポリシーでは、破壊的変更（以前は問題なくコンパイルできていたコードがコンパイルできなくなるような変更など）はメジャーリリース（**1.2**、**1.3** など）でのみ導入できると定められています。

私たちは、重要なコンパイラのバグ修正が即座に適用され、コードがより安全かつ正確になるような、はるかに速いサイクルを活用したいユーザーが多くいると考えています。そこで Kotlin 1.3 では、コンパイラに `-progressive` 引数を渡すことで有効にできる*プログレッシブ（progressive）*コンパイラモードを導入しました。

プログレッシブモードでは、言語セマンティクスのいくつかの修正が即座に適用されます。これらの修正にはすべて、2つの重要な特性があります：

* 古いコンパイラとのソースコードの後方互換性を維持します。つまり、プログレッシブコンパイラでコンパイル可能なすべてのコードは、非プログレッシブコンパイラでも問題なくコンパイルできます。
* ある意味でコードを*より安全*にするだけです（例: 健全でない一部のスマートキャストの禁止、生成されるコードの挙動をより予測可能／安定したものに変更するなど）。

プログレッシブモードを有効にすると一部のコードの書き換えが必要になる場合がありますが、それほど多くはないはずです。プログレッシブの下で有効化されるすべての修正は慎重に選別、レビューされており、ツールによる移行支援も提供されます。プログレッシブモードは、最新の言語バージョンに迅速にアップデートされる、アクティブにメンテナンスされているコードベースにとって優れた選択肢になると期待しています。

## インラインクラス（Inline classes） {id="inline-classes"}

>インラインクラスは [Alpha](components-stability.md) です。将来、互換性のない変更が行われ、手動での移行が必要になる可能性があります。
> [YouTrack](https://youtrack.jetbrains.com/issues/KT) でのフィードバックをお待ちしています。
> 詳細は[リファレンス](inline-classes.md)を参照してください。
>
{style="warning"}

Kotlin 1.3 では、新しい種類の宣言である `inline class` が導入されました。インラインクラスは通常のクラスの制限版と見なすことができ、特にインラインクラスには正確に1つのプロパティのみを持たせる必要があります：

```kotlin
inline class Name(val s: String)
```

Kotlin コンパイラはこの制限を利用して、インラインクラスのランタイム表現を積極的に最適化し、可能な場合はそのインスタンスを基礎となるプロパティの値に置き換えることで、コンストラクタの呼び出しをなくし、GC の負荷を減らし、その他の最適化を可能にします：

```kotlin
inline class Name(val s: String)
//sampleStart
fun main() {
    // 次の行ではコンストラクタの呼び出しは発生せず、
    // ランタイムにおいて 'name' は単なる文字列 "Kotlin" を保持します
    val name = Name("Kotlin")
    println(name.s) 
}
//sampleEnd
```
{kotlin-runnable="true"}

詳細はインラインクラスの[リファレンス](inline-classes.md)を参照してください。

## 符号なし整数（Unsigned integers） {id="unsigned-integers"}

> 符号なし整数は [Beta](components-stability.md) です。
> その実装はほぼ安定していますが、将来的には移行手順が必要になる可能性があります。
> 必要な変更が最小限で済むよう最善を尽くします。
>
{style="warning"}

Kotlin 1.3 では符号なし整数型が導入されました：

* `kotlin.UByte`: 符号なし8ビット整数、範囲は 0 〜 255
* `kotlin.UShort`: 符号なし16ビット整数、範囲は 0 〜 65535
* `kotlin.UInt`: 符号なし32ビット整数、範囲は 0 〜 2^32 - 1
* `kotlin.ULong`: 符号なし64ビット整数、範囲は 0 〜 2^64 - 1

符号付き型の機能のほとんどは、符号なしの対応する型でもサポートされています：

```kotlin
fun main() {
//sampleStart
// リテラル接尾辞を使用して符号なし型を定義できます
val uint = 42u 
val ulong = 42uL
val ubyte: UByte = 255u

// stdlib の拡張機能を使用して、符号付き型と符号なし型を相互に変換できます:
val int = uint.toInt()
val byte = ubyte.toByte()
val ulong2 = byte.toULong()

// 符号なし型も同様の演算子をサポートしています:
val x = 20u + 22u
val y = 1u shl 8
val z = "128".toUByte()
val range = 1u..5u
//sampleEnd
println("ubyte: $ubyte, byte: $byte, ulong2: $ulong2")
println("x: $x, y: $y, z: $z, range: $range")
}
```
{kotlin-runnable="true"}

詳細は[リファレンス](unsigned-integer-types.md)を参照してください。

## @JvmDefault {id="jvmdefault"}

>`@JvmDefault` は[実験的（Experimental）](components-stability.md)です。予告なく削除または変更される可能性があります。
> 評価目的でのみ使用してください。[YouTrack](https://youtrack.jetbrains.com/issues/KT) でのフィードバックをお待ちしています。
>
{style="warning"}

Kotlin は、インターフェース内のデフォルトメソッドが許可されていない Java 6 や Java 7 を含む、幅広い Java バージョンをターゲットにしています。利便性のために Kotlin コンパイラはその制限を回避（ワークアラウンド）しますが、このワークアラウンドは Java 8 で導入された `default` メソッドとの互換性がありません。

これは Java との相互運用性において問題となる可能性があるため、Kotlin 1.3 では `@JvmDefault` アノテーションが導入されました。このアノテーションが付けられたメソッドは、JVM 向けに `default` メソッドとして生成されます：

```kotlin
interface Foo {
    // 'default' メソッドとして生成されます
    @JvmDefault
    fun foo(): Int = 42
}
```

> 警告！API に `@JvmDefault` を付けると、バイナリ互換性に重大な影響を及ぼします。本番環境で `@JvmDefault` を使用する前に、必ず[リファレンスページ](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-default/index.html)をよくお読みください。
>
{style="warning"}

## 標準ライブラリ（Standard library） {id="standard-library"}

### マルチプラットフォーム対応の random {id="multiplatform-random"}

Kotlin 1.3 より前は、すべてのプラットフォームで乱数を生成する統一された方法がなく、JVM 上の `java.util.Random` のようなプラットフォーム固有のソリューションに頼る必要がありました。今回のリリースでは、すべてのプラットフォームで利用可能なクラス `kotlin.random.Random` を導入することでこの問題を解決しました：

```kotlin
import kotlin.random.Random

fun main() {
//sampleStart
    val number = Random.nextInt(42)  // number は [0, limit) の範囲になります
    println(number)
//sampleEnd
}
```
{kotlin-runnable="true"}

### isNullOrEmpty および orEmpty 拡張 {id="isnullorempty-and-orempty-extensions"}

一部の型に対する `isNullOrEmpty` および `orEmpty` 拡張は、すでに stdlib に存在していました。1つ目はレシーバが `null` または空の場合に `true` を返し、2つ目はレシーバが `null` の場合に空のインスタンスへとフォールバックします。Kotlin 1.3 では、コレクション、マップ、およびオブジェクトの配列に対しても同様の拡張が提供されるようになりました。

### 既存の2つの配列間での要素のコピー {id="copy-elements-between-two-existing-arrays"}

符号なし配列を含む既存の配列型向けの `array.copyInto(targetArray, targetOffset, startIndex, endIndex)` 関数により、純粋な Kotlin での配列ベースのコンテナの実装が容易になりました。

```kotlin
fun main() {
//sampleStart
    val sourceArr = arrayOf("k", "o", "t", "l", "i", "n")
    val targetArr = sourceArr.copyInto(arrayOfNulls<String>(6), 3, startIndex = 3, endIndex = 6)
    println(targetArr.contentToString())
    
    sourceArr.copyInto(targetArr, startIndex = 0, endIndex = 3)
    println(targetArr.contentToString())
//sampleEnd
}
```
{kotlin-runnable="true"}

### associateWith {id="associatewith"}

キーのリストがあり、それらの各キーを特定の値に関連付けてマップを構築したいという状況は非常によくあります。以前も `associate { it to getValue(it) }` 関数で行うことができましたが、より効率的でわかりやすい代替手段として `keys.associateWith { getValue(it) }` を導入しました。

```kotlin
fun main() {
//sampleStart
    val keys = 'a'..'f'
    val map = keys.associateWith { it.toString().repeat(5).capitalize() }
    map.forEach { println(it) }
//sampleEnd
}
```

### ifEmpty および ifBlank 関数 {id="ifempty-and-ifblank-functions"}

コレクション、マップ、オブジェクト配列、文字シーケンス、およびシーケンスに `ifEmpty` 関数が追加されました。これにより、レシーバが空の場合に、レシーバの代わりに使用されるフォールバック値を指定できるようになります：

```kotlin
fun main() {
//sampleStart
    fun printAllUppercase(data: List<String>) {
        val result = data
        .filter { it.all { c -> c.isUpperCase() } }
            .ifEmpty { listOf("<no uppercase>") }
        result.forEach { println(it) }
    }
    
    printAllUppercase(listOf("foo", "Bar"))
    printAllUppercase(listOf("FOO", "BAR"))
//sampleEnd
}
```
{kotlin-runnable="true"}

さらに、文字シーケンスと文字列には `ifBlank` 拡張も用意されており、これは `ifEmpty` と同様に機能しますが、空であることの代わりに文字列がすべて空白文字であるかどうかをチェックします。

```kotlin
fun main() {
//sampleStart
    val s = "    \n"
    println(s.ifBlank { "<blank>" })
    println(s.ifBlank { null })
//sampleEnd
}
```
{kotlin-runnable="true"}

### リフレクションにおける sealed クラス {id="sealed-classes-in-reflection"}

`sealed` クラスのすべての直接のサブタイプを列挙するために使用できる新しい API、`KClass.sealedSubclasses` が `kotlin-reflect` に追加されました。

### その他の小さな変更 {id="smaller-changes"}

* `Boolean` 型にコンパニオンが追加されました。
* `null` に対して 0 を返す `Any?.hashCode()` 拡張。
* `Char` が `MIN_VALUE` および `MAX_VALUE` 定数を提供するようになりました。
* プリミティブ型のコンパニオンにおける `SIZE_BYTES` および `SIZE_BITS` 定数。

## ツール {id="tooling"}

### IDE におけるコードスタイルサポート {id="code-style-support-in-ide"}

Kotlin 1.3 では、IntelliJ IDEA において[推奨されるコードスタイル](coding-conventions.md)のサポートが導入されました。移行のガイドラインについては、[こちらのページ](code-style-migration-guide.md)を確認してください。

### kotlinx.serialization {id="kotlinx-serialization"}

[kotlinx.serialization](https://github.com/Kotlin/kotlinx.serialization) は、Kotlin におけるオブジェクトのシリアライズ／デシリアライズのマルチプラットフォームサポートを提供するライブラリです。以前は別個のプロジェクトでしたが、Kotlin 1.3 からは他のコンパイラプラグインと同等に Kotlin コンパイラの配布物に同梱されるようになりました。主な違いは、使用している Kotlin IDE プラグインのバージョンと Serialization IDE プラグインの互換性を手動で気にする必要がなくなった点です。Kotlin IDE プラグインにあらかじめシリアライゼーションが含まれるようになりました！

詳細は[こちら](https://github.com/Kotlin/kotlinx.serialization#current-project-status)を参照してください。

> kotlinx.serialization は Kotlin コンパイラの配布物に同梱されるようになりましたが、Kotlin 1.3 においては依然として実験的機能とみなされています。
>
{style="warning"}

### スクリプティングのアップデート {id="scripting-update"}

>スクリプティングは[実験的（Experimental）](components-stability.md)です。予告なく削除または変更される可能性があります。
> 評価目的でのみ使用してください。[YouTrack](https://youtrack.jetbrains.com/issues/KT) でのフィードバックをお待ちしています。
>
{style="warning"}

Kotlin 1.3 ではスクリプティング API の進化と改善が継続されており、外部プロパティの追加や、静的または動的な依存関係の提供など、スクリプトのカスタマイズに関する実験的サポートが導入されています。

詳細については、[KEEP-75](https://github.com/Kotlin/KEEP/blob/master/proposals/scripting-support.md) を参照してください。

### スクラッチファイルのサポート {id="scratches-support"}

Kotlin 1.3 では、実行可能な Kotlin *スクラッチファイル（scratch files）*のサポートが導入されました。*スクラッチファイル*とは、エディタ内で直接実行して評価結果を確認できる、.kts 拡張子を持つ Kotlin スクリプトファイルです。

詳細については、一般的な[スクラッチに関するドキュメント](https://www.jetbrains.com/help/idea/scratches.html)を参照してください。