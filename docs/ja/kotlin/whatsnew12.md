[//]: # (title: Kotlin 1.2 の新機能)

<web-summary>新しい言語機能、Kotlin Multiplatform、JVM、JS のアップデート、Gradle や Maven のビルドツールサポートなどを網羅した Kotlin 1.2 リリースノートをお読みください。</web-summary>

_リリース: 2017年11月28日_

## 目次 {id="table-of-contents"}

* [マルチプラットフォームプロジェクト](#multiplatform-projects-experimental)
* [その他の言語機能](#other-language-features)
* [標準ライブラリ](#standard-library)
* [JVM バックエンド](#jvm-backend)
* [JavaScript バックエンド](#javascript-backend)

> Kotlin のリリースサイクルに関する詳細については、[Kotlin のリリースプロセス](releases.md)を参照してください。
>
{style="tip"}

## マルチプラットフォームプロジェクト（実験的機能） {id="multiplatform-projects-experimental"}

マルチプラットフォームプロジェクト（Multiplatform projects）は Kotlin 1.2 における新しい**実験的**機能であり、Kotlin がサポートするターゲットプラットフォーム（JVM、JavaScript、そして将来的には Native）間でコードを再利用できるようにします。マルチプラットフォームプロジェクトには、以下の3種類のリモジュールが存在します:

* *共通（common）*モジュール: プラットフォームに依存しないコードや、プラットフォーム固有 API の実装を持たない宣言が含まれます。
* *プラットフォーム（platform）*モジュール: 共通モジュールにあるプラットフォーム依存の宣言に対する特定プラットフォーム向けの実装や、その他のプラットフォーム依存コードが含まれます。
* 通常のモジュール: 特定のプラットフォームをターゲットとし、プラットフォームモジュールの依存先となることも、プラットフォームモジュールに依存することもできます。

特定のプラットフォーム向けにマルチプラットフォームプロジェクトをコンパイルすると、共通部分とプラットフォーム固有部分の両方のコードが生成されます。

マルチプラットフォームプロジェクトサポートの重要な機能は、*expected* 宣言と *actual* 宣言を通じて、共通コードからプラットフォーム固有部分への依存関係を表現できる点です。*expected* 宣言は API（クラス、インターフェース、アノテーション、トップレベル宣言など）を定義します。*actual* 宣言は、その API のプラットフォーム固有の実装か、外部ライブラリにある既存の実装を参照する型エイリアス（type alias）のいずれかになります。以下に例を示します:

共通コード側:

```kotlin
// expected なプラットフォーム固有 API:
expect fun hello(world: String): String

fun greet() {
    // expected API の使用:
    val greeting = hello("multiplatform world")
    println(greeting)
}

expect class URL(spec: String) {
    open fun getHost(): String
    open fun getPath(): String
}
```

JVM プラットフォームコード側:

```kotlin
actual fun hello(world: String): String =
    "Hello, $world, on the JVM platform!"

// 既存のプラットフォーム固有の実装を使用:
actual typealias URL = java.net.URL
```

マルチプラットフォームプロジェクトの構築手順や詳細については、[マルチプラットフォームプログラミングのドキュメント](https://kotlinlang.org/docs/multiplatform/get-started.html)を参照してください。

## その他の言語機能 {id="other-language-features"}

### アノテーションでの配列リテラル {id="array-literals-in-annotations"}

Kotlin 1.2 以降、アノテーションの配列引数を `arrayOf` 関数の代わりに新しい配列リテラル構文で渡せるようになりました:

```kotlin
@CacheConfig(cacheNames = ["books", "default"])
public class BookRepositoryImpl {
    // ...
}
```

配列リテラル構文は、アノテーションの引数にのみ限定されています。

### トップレベルプロパティとローカル変数での lateinit {id="lateinit-top-level-properties-and-local-variables"}

`lateinit` 修飾子がトップレベルプロパティやローカル変数でも使用できるようになりました。ローカル変数の `lateinit` は、たとえばコンストラクタ引数としてオブジェクトに渡されるラムダが、後から定義される別のオブジェクトを参照している場合などに役立ちます:

```kotlin
class Node<T>(val value: T, val next: () -> Node<T>)

fun main(args: Array<String>) {
    // 3つのノードによる循環参照:
    lateinit var third: Node<Int>

    val second = Node(2, next = { third })
    val first = Node(1, next = { second })

    third = Node(3, next = { first })

    val nodes = generateSequence(first) { it.next() }
    println("Values in the cycle: ${nodes.take(7).joinToString { it.value.toString() }}, ...")
}
```
{kotlin-runnable="true"}

### lateinit var が初期化されているかの確認 {id="check-whether-a-lateinit-var-is-initialized"}

プロパティ参照の `isInitialized` を使用して、`lateinit var` が初期化されているかどうかを確認できるようになりました:

```kotlin
class Foo {
    lateinit var lateinitVar: String

    fun initializationLogic() {
//sampleStart
        println("isInitialized before assignment: " + this::lateinitVar.isInitialized)
        lateinitVar = "value"
        println("isInitialized after assignment: " + this::lateinitVar.isInitialized)
//sampleEnd
    }
}

fun main(args: Array<String>) {
	Foo().initializationLogic()
}
```
{kotlin-runnable="true"}

### デフォルト関数パラメータを持つインライン関数 {id="inline-functions-with-default-functional-parameters"}

インライン関数で、インライン化される関数パラメータにデフォルト値を持たせることができるようになりました:

```kotlin
//sampleStart
inline fun <E> Iterable<E>.strings(transform: (E) -> String = { it.toString() }) =
    map { transform(it) }

val defaultStrings = listOf(1, 2, 3).strings()
val customStrings = listOf(1, 2, 3).strings { "($it)" } 
//sampleEnd

fun main(args: Array<String>) {
    println("defaultStrings = $defaultStrings")
    println("customStrings = $customStrings")
}
```
{kotlin-runnable="true"}

### 明示的なキャストからの情報を型推論に使用 {id="information-from-explicit-casts-is-used-for-type-inference"}

Kotlin コンパイラが、型キャストの情報を型推論に利用できるようになりました。型パラメータ `T` を返すジェネリックメソッドを呼び出し、その戻り値を特定の型 `Foo` にキャストしている場合、コンパイラはこの呼び出しにおける `T` が `Foo` 型に束縛される必要があると理解するようになりました。

これは Android 開発者にとって特に重要です。Android API レベル 26 のジェネリックな `findViewById` 呼び出しをコンパイラが正しく解析できるようになります:

```kotlin
val button = findViewById(R.id.button) as Button
```

### スマートキャストの改善 {id="smart-cast-improvements"}

安全呼び出し式から変数に代入され、null チェックが行われた場合、安全呼び出しのレシーバに対してもスマートキャストが適用されるようになりました:

```kotlin
fun countFirst(s: Any): Int {
//sampleStart
    val firstChar = (s as? CharSequence)?.firstOrNull()
    if (firstChar != null)
    return s.count { it == firstChar } // s: Any は CharSequence にスマートキャストされる

    val firstItem = (s as? Iterable<*>)?.firstOrNull()
    if (firstItem != null)
    return s.count { it == firstItem } // s: Any は Iterable<*> にスマートキャストされる
//sampleEnd
    return -1
}

fun main(args: Array<String>) {
  val string = "abacaba"
  val countInString = countFirst(string)
  println("called on \"$string\": $countInString")

  val list = listOf(1, 2, 3, 1, 2)
  val countInList = countFirst(list)
  println("called on $list: $countInList")
}
```
{kotlin-runnable="true"}

また、ラムダの前でのみ変更されるローカル変数に対して、ラムダ内でのスマートキャストが許可されるようになりました:

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val flag = args.size == 0
    var x: String? = null
    if (flag) x = "Yahoo!"

    run {
        if (x != null) {
            println(x.length) // x は String にスマートキャストされる
        }
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

### this::foo の短縮形としての ::foo のサポート {id="support-for-foo-as-a-shorthand-for-this-foo"}

`this` のメンバーに対する束縛呼び出し可能参照（bound callable reference）を、明示的なレシーバなしで `this::foo` の代わりに `::foo` と記述できるようになりました。これにより、外側のレシーバのメンバーを参照するラムダ内でも、呼び出し可能参照がより便利に使用できるようになります。

### 破壊的変更: try ブロック後の厳密なスマートキャスト {id="breaking-change-sound-smart-casts-after-try-blocks"}

以前の Kotlin では、`try` ブロック内で行われた代入をブロック後のスマートキャストに使用していましたが、これにより型安全性や null 安全性が損なわれ、実行時エラーにつながる可能性がありました。今回のリリースではこの問題が修正され、スマートキャストがより厳格になりましたが、そのようなスマートキャストに依存していた一部のコードは動作しなくなります。

古いスマートキャストの動作に戻すには、コンパイラ引数としてフォールバックフラグ `-Xlegacy-smart-cast-after-try` を渡してください。このフラグは Kotlin 1.3 で非推奨になります。

### 非推奨化: copy をオーバーライドするデータクラス {id="deprecation-data-classes-overriding-copy"}

データクラスが、同一のシグネチャを持つ `copy` 関数をすでに持っている型から派生した場合、データクラス用に生成された `copy` の実装がスーパータイプのデフォルト値を使用して直感に反する挙動を引き起こしたり、スーパータイプにデフォルトパラメータがない場合に実行時エラーとなったりしていました。

このような `copy` の衝突を引き起こす継承は、Kotlin 1.2 では警告付きで非推奨となり、Kotlin 1.3 ではエラーになります。

### 非推奨化: enum エントリ内のネストした型 {id="deprecation-nested-types-in-enum-entries"}

初期化ロジックの問題により、enum エントリ内部で `inner class` ではないネストした型を定義することが非推奨となりました。これは Kotlin 1.2 では警告となり、Kotlin 1.3 ではエラーになります。

### 非推奨化: vararg に対する単一の名前付き引数 {id="deprecation-single-named-argument-for-vararg"}

アノテーションの配列リテラルとの一貫性を保つため、vararg パラメータに対して名前付き引数の形式（`foo(items = i)`）で単一の要素を渡すことが非推奨となりました。対応する配列ファクトリ関数とともにスプレッド演算子（`*`）を使用してください:

```kotlin
foo(items = *arrayOf(1))
```

このようなケースでは余分な配列生成を省く最適化が行われるため、パフォーマンスの低下は防がれます。単一引数の形式は Kotlin 1.2 で警告が出され、Kotlin 1.3 で廃止される予定です。

### 非推奨化: Throwable を継承するジェネリッククラスのインナークラス {id="deprecation-inner-classes-of-generic-classes-extending-throwable"}

`Throwable` を継承するジェネリック型のインナークラスは、throw-catch のシナリオで型安全性を損なう恐れがあるため非推奨となりました。Kotlin 1.2 で警告、Kotlin 1.3 でエラーとなります。

### 非推奨化: 読み取り専用プロパティのバッキングフィールドの変更 {id="deprecation-mutating-backing-field-of-a-read-only-property"}

カスタムゲッター内で `field = ...` と代入して読み取り専用プロパティのバッキングフィールドを変更することは非推奨となりました。Kotlin 1.2 で警告、Kotlin 1.3 でエラーとなります。

## 標準ライブラリ {id="standard-library"}

### Kotlin 標準ライブラリのアーティファクトと分割パッケージ {id="kotlin-standard-library-artifacts-and-split-packages"}

Kotlin 標準ライブラリが、Java 9 のモジュールシステム（分割パッケージ（split packages: 複数の jar ファイルが同じパッケージ内のクラスを宣言すること）を禁止）と完全に互換性を持つようになりました。これをサポートするため、古い `kotlin-stdlib-jre7` と `kotlin-stdlib-jre8` を置き換える新しいアーティファクト `kotlin-stdlib-jdk7` と `kotlin-stdlib-jdk8` が導入されました。

新しいアーティファクトの宣言は、Kotlin の観点からは同じパッケージ名で見えますが、Java からは異なるパッケージ名になります。そのため、新しいアーティファクトに切り替えてもソースコードの変更は必要ありません。

新しいモジュールシステムとの互換性を確保するためのもう1つの変更として、`kotlin-reflect` ライブラリの `kotlin.reflect` パッケージから非推奨の宣言が削除されました。これらを使用していた場合は、Kotlin 1.1 からサポートされている `kotlin.reflect.full` パッケージの宣言に切り替える必要があります。

### windowed、chunked、zipWithNext {id="windowed-chunked-zipwithnext"}

`Iterable<T>`、`Sequence<T>`、`CharSequence` の新しい拡張関数により、バッファリングやバッチ処理（`chunked`）、スライディングウィンドウや移動平均の計算（`windowed`）、連続する要素のペア処理（`zipWithNext`）などのユースケースに対応できるようになりました:

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val items = (1..9).map { it * it }

    val chunkedIntoLists = items.chunked(4)
    val points3d = items.chunked(3) { (x, y, z) -> Triple(x, y, z) }
    val windowed = items.windowed(4)
    val slidingAverage = items.windowed(4) { it.average() }
    val pairwiseDifferences = items.zipWithNext { a, b -> b - a }
//sampleEnd

    println("items: $items\n")

    println("chunked into lists: $chunkedIntoLists")
    println("3D points: $points3d")
    println("windowed by 4: $windowed")
    println("sliding average by 4: $slidingAverage")
    println("pairwise differences: $pairwiseDifferences")
}
```
{kotlin-runnable="true"}

### fill、replaceAll、shuffle/shuffled {id="fill-replaceall-shuffle-shuffled"}

リスト操作用の拡張関数セットが追加されました。`MutableList` 向けには `fill`、`replaceAll`、`shuffle` が、読み取り専用の `List` 向けには `shuffled` が提供されます:

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val items = (1..5).toMutableList()
    
    items.shuffle()
    println("Shuffled items: $items")
    
    items.replaceAll { it * 2 }
    println("Items doubled: $items")
    
    items.fill(5)
    println("Items filled with 5: $items")
//sampleEnd
}
```
{kotlin-runnable="true"}

### kotlin-stdlib における数学演算 {id="math-operations-in-kotlin-stdlib"}

長年の要望に応え、Kotlin 1.2 では JVM と JS で共通の数学演算用 API `kotlin.math` が追加されました。以下のものが含まれます:

* 定数: `PI`、`E`
* 三角関数: `cos`、`sin`、`tan`、およびそれらの逆関数: `acos`、`asin`、`atan`、`atan2`
* 双曲線関数: `cosh`、`sinh`、`tanh`、およびそれらの逆関数: `acosh`、`asinh`、`atanh`
* べき乗・指数関数: `pow`（拡張関数）、`sqrt`、`hypot`、`exp`、`expm1`
* 対数関数: `log`、`log2`、`log10`、`ln`、`ln1p`
* 丸め処理:
    * `ceil`、`floor`、`truncate`、`round`（最近接偶数への丸め）関数
    * `roundToInt`、`roundToLong`（最近接整数への丸め）拡張関数
* 符号と絶対値:
    * `abs`、`sign` 関数
    * `absoluteValue`、`sign` 拡張プロパティ
    * `withSign` 拡張関数
* 2つの値の `max` および `min`
* バイナリ表現:
    * `ulp` 拡張プロパティ
    * `nextUp`、`nextDown`、`nextTowards` 拡張関数
    * `toBits`、`toRawBits`、`Double.fromBits`（これらは `kotlin` パッケージ内にあります）

同じ関数セット（定数を除く）が `Float` 引数に対しても利用可能です。

### BigInteger および BigDecimal の演算子と変換 {id="operators-and-conversions-for-biginteger-and-bigdecimal"}

Kotlin 1.2 では、`BigInteger` と `BigDecimal` を操作したり、他の数値型から生成したりするための関数セットが導入されました:

* `Int` および `Long` 用の `toBigInteger`
* `Int`、`Long`、`Float`、`Double`、および `BigInteger` 用の `toBigDecimal`
* 算術演算子およびビット演算子関数:
    * 二項演算子 `+`、`-`、`*`、`/`、`%` および中置関数 `and`、`or`、`xor`、`shl`、`shr`
    * 単項演算子 `-`、`++`、`--`、および関数 `inv`

### 浮動小数点数からビット表現への変換 {id="floating-point-to-bits-conversions"}

`Double` および `Float` とそのビット表現の間で相互変換を行うための新しい関数が追加されました:

* `toBits` および `toRawBits`: `Double` に対し `Long` を、`Float` に対し `Int` を返します
* `Double.fromBits` および `Float.fromBits`: ビット表現から浮動小数点数を生成します

### Regex がシリアライズ可能に {id="regex-is-now-serializable"}

`kotlin.text.Regex` クラスが `Serializable` となり、シリアライズ可能な階層構造の中で使用できるようになりました。

### Closeable.use は利用可能な場合に Throwable.addSuppressed を呼び出す {id="closeable-use-calls-throwable-addsuppressed-if-available"}

`Closeable.use` 関数は、他の例外の発生後にリソースをクローズする際にも例外がスローされた場合、`Throwable.addSuppressed` を呼び出すようになりました。

この動作を有効にするには、依存関係に `kotlin-stdlib-jdk7` を含める必要があります。

## JVM バックエンド {id="jvm-backend"}

### コンストラクタ呼び出しの正規化 {id="constructor-calls-normalization"}

バージョン 1.0 以来、Kotlin は try-catch 式やインライン関数呼び出しなど、複雑な制御フローを持つ式をサポートしてきました。このようなコードは Java 仮想マシン仕様に準拠しています。しかし残念ながら、一部のバイトコード処理ツールは、コンストラクタ呼び出しの引数にそのような式が存在する場合に適切に処理できないことがあります。

このようなバイトコード処理ツールを使用しているユーザーの負担を軽減するため、コンパイラに対してそうした構文向けにより Java らしいバイトコードを生成するよう指示するコマンドラインコンパイラオプション（`-Xnormalize-constructor-calls=MODE`）を追加しました。ここで `MODE` には以下のいずれかを指定します:

* `disable`（デフォルト）– Kotlin 1.0 および 1.1 と同様の方法でバイトコードを生成します。
* `enable` – コンストラクタ呼び出しに対して Java らしいバイトコードを生成します。これにより、クラスがロードおよび初期化される順序が変わる可能性があります。
* `preserve-class-initialization` – コンストラクタ呼び出しに対して Java らしいバイトコードを生成しつつ、クラスの初期化順序が維持されるようにします。これによりアプリケーション全体のパフォーマンスに影響を与える可能性があるため、複数のクラス間で共有されクラス初期化時に更新されるような複雑な状態がある場合にのみ使用してください。

「手動」での回避策としては、制御フローを伴う部分式の値を呼び出し引数の中で直接評価するのではなく、一旦変数に保存することです。これは `-Xnormalize-constructor-calls=enable` と同様の動作になります。

### Java デフォルトメソッドの呼び出し {id="java-default-method-calls"}

Kotlin 1.2 より前では、JVM 1.6 をターゲットとしている際に Java デフォルトメソッドをオーバーライドするインターフェースメンバーからの super 呼び出しを行うと、`Super calls to Java default methods are deprecated in JVM target 1.6. Recompile with '-jvm-target 1.8'` という警告が出力されていました。Kotlin 1.2 からはこれが**エラー**となり、そのようなコードは JVM ターゲット 1.8 でコンパイルすることが必須となります。

### 破壊的変更: プラットフォーム型における x.equals(null) の一貫した挙動 {id="breaking-change-consistent-behavior-of-x-equals-null-for-platform-types"}

Java のプリミティブ型にマッピングされるプラットフォーム型（`Int!`、`Boolean!`、`Short!`、`Long!`、`Float!`、`Double!`、`Char!`）において、`x` が null のときに `x.equals(null)` を呼び出すと誤って `true` が返されていました。Kotlin 1.2 以降、プラットフォーム型の null 値に対して `x.equals(...)` を呼び出すと **NPE（NullPointerException）がスローされます**（ただし `x == ...` ではスローされません）。

1.2 以前の挙動に戻すには、コンパイラにフラグ `-Xno-exception-on-explicit-equals-for-boxed-null` を渡してください。

### 破壊的変更: インライン拡張レシーバを経由したプラットフォーム型の null 漏れの修正 {id="breaking-change-fix-for-platform-null-escaping-through-an-inlined-extension-receiver"}

プラットフォーム型の null 値に対してインライン拡張関数を呼び出した際、レシーバの null チェックが行われず、null が他のコードに漏れ出す可能性がありました。Kotlin 1.2 では呼び出し元でこのチェックが強制され、レシーバが null の場合は例外がスローされるようになります。

古い挙動に戻すには、コンパイラにフォールバックフラグ `-Xno-receiver-assertions` を渡してください。

## JavaScript バックエンド {id="javascript-backend"}

### TypedArrays サポートがデフォルトで有効に {id="typedarrays-support-enabled-by-default"}

Kotlin のプリミティブ配列（`IntArray` や `DoubleArray` など）を [JavaScript の型付き配列（Typed Arrays）](https://developer.mozilla.org/ja/docs/Web/JavaScript/Typed_arrays) に変換する JS 型付き配列サポートは、以前はオプトイン機能でしたが、デフォルトで有効になりました。

## ツール {id="tools"}

### 警告をエラーとして扱う（Warnings as errors） {id="warnings-as-errors"}

すべての警告をエラーとして扱うコンパイラオプションが提供されるようになりました。コマンドラインで `-Werror` を使用するか、以下の Gradle スニペットを使用してください:

```groovy
compileKotlin {
    kotlinOptions.allWarningsAsErrors = true
}
```