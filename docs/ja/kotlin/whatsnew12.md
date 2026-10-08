[//]: # (title: Kotlin 1.2 の新機能)

<web-summary>新しい言語機能、Kotlin マルチプラットフォーム、JVM、JS の更新、Gradle および Maven のビルドツールサポートを網羅した Kotlin 1.2 のリリースノートをご覧ください。</web-summary>

_リリース日: 2017年11月28日_

## 目次 {id="table-of-contents"}

* [マルチプラットフォームプロジェクト](#multiplatform-projects-experimental)
* [その他の言語機能](#other-language-features)
* [標準ライブラリ](#standard-library)
* [JVM バックエンド](#jvm-backend)
* [JavaScript バックエンド](#javascript-backend)

> Kotlin のリリースサイクルに関する情報は、[Kotlin のリリースプロセス](releases.md)を参照してください。
>
{style="tip"}

## マルチプラットフォームプロジェクト（実験的機能） {id="multiplatform-projects-experimental"}

マルチプラットフォームプロジェクトは、Kotlin 1.2 における新しい**実験的**な機能です。これにより、Kotlin がサポートするターゲットプラットフォーム（JVM、JavaScript、および将来的には Native）間でコードを再利用できるようになります。マルチプラットフォームプロジェクトには、以下の 3 種類のモジュールがあります。

* *共通 (common)* モジュール：特定のプラットフォームに依存しないコード、およびプラットフォーム依存の API の実装を持たない宣言を含みます。
* *プラットフォーム (platform)* モジュール：特定のプラットフォーム向けに、共通モジュール内のプラットフォーム依存の宣言の実装、およびその他のプラットフォーム依存のコードを含みます。
* 正規のモジュール：特定のプラットフォームをターゲットとし、プラットフォームモジュールの依存先となるか、あるいはプラットフォームモジュールに依存します。

特定のプラットフォーム向けにマルチプラットフォームプロジェクトをコンパイルすると、共通部分とプラットフォーム固有部分の両方のコードが生成されます。

マルチプラットフォームプロジェクトのサポートにおける主要な機能は、*期待 (expected)* 宣言と *実体 (actual)* 宣言を通じて、共通コードからプラットフォーム固有部分への依存を表現できることです。*期待 (expected)* 宣言は、API（クラス、インターフェース、アノテーション、トップレベル宣言など）を指定します。*実体 (actual)* 宣言は、その API のプラットフォーム依存の実装、または外部ライブラリにある既存の API 実装を参照する型エイリアス（type alias）のいずれかです。以下に例を示します。

共通コード：

```kotlin
// 期待されるプラットフォーム固有の API:
expect fun hello(world: String): String

fun greet() {
    // 期待される API の使用:
    val greeting = hello("multiplatform world")
    println(greeting)
}

expect class URL(spec: String) {
    open fun getHost(): String
    open fun getPath(): String
}
```

JVM プラットフォームコード：

```kotlin
actual fun hello(world: String): String =
    "Hello, $world, on the JVM platform!"

// 既存のプラットフォーム固有の実装を使用:
actual typealias URL = java.net.URL
```

詳細およびマルチプラットフォームプロジェクトをビルドする手順については、[マルチプラットフォームプログラミングのドキュメント](https://kotlinlang.org/docs/multiplatform/get-started.html)を参照してください。

## その他の言語機能 {id="other-language-features"}

### アノテーションでの配列リテラル {id="array-literals-in-annotations"}

Kotlin 1.2 以降、アノテーションの配列引数は、`arrayOf` 関数の代わりに新しい配列リテラル構文を使用して渡すことができます。

```kotlin
@CacheConfig(cacheNames = ["books", "default"])
public class BookRepositoryImpl {
    // ...
}
```

配列リテラル構文はアノテーションの引数に限定されています。

### トップレベルプロパティとローカル変数での lateinit {id="lateinit-top-level-properties-and-local-variables"}

`lateinit` 修飾子がトップレベルプロパティとローカル変数でも使用できるようになりました。後者は、例えば、あるオブジェクトのコンストラクタ引数として渡されるラムダが、後で定義される別のオブジェクトを参照する必要がある場合などに使用できます。

```kotlin
class Node<T>(val value: T, val next: () -> Node<T>)

fun main(args: Array<String>) {
    // 3つのノードによる循環:
    lateinit var third: Node<Int>

    val second = Node(2, next = { third })
    val first = Node(1, next = { second })

    third = Node(3, next = { first })

    val nodes = generateSequence(first) { it.next() }
    println("Values in the cycle: ${nodes.take(7).joinToString { it.value.toString() }}, ...")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### lateinit 変数が初期化されているかの確認 {id="check-whether-a-lateinit-var-is-initialized"}

プロパティ参照に対して `isInitialized` を使用することで、`lateinit` 変数が初期化されているかどうかを確認できるようになりました。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### デフォルトの関数パラメータを持つインライン関数 {id="inline-functions-with-default-functional-parameters"}

インライン関数のインライン化される関数パラメータに対して、デフォルト値を設定できるようになりました。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 明示的なキャストからの情報が型推論に使用される {id="information-from-explicit-casts-is-used-for-type-inference"}

Kotlin コンパイラは、型キャストからの情報を型推論に使用できるようになりました。型パラメータ `T` を返すジェネリックメソッドを呼び出し、その戻り値を特定の型 `Foo` にキャストしている場合、コンパイラはその呼び出しにおける `T` が型 `Foo` にバインドされる必要があることを理解します。

これは Android 開発者にとって特に重要です。コンパイラが Android API レベル 26 におけるジェネリックな `findViewById` 呼び出しを正しく解析できるようになったためです。

```kotlin
val button = findViewById(R.id.button) as Button
```

### スマートキャストの改善 {id="smart-cast-improvements"}

変数にセーフコール式の結果が代入され、その変数が null チェックされた場合、スマートキャストがセーフコールのレシーバに対しても適用されるようになりました。

```kotlin
fun countFirst(s: Any): Int {
//sampleStart
    val firstChar = (s as? CharSequence)?.firstOrNull()
    if (firstChar != null)
    return s.count { it == firstChar } // s: Any が CharSequence にスマートキャストされる

    val firstItem = (s as? Iterable<*>)?.firstOrNull()
    if (firstItem != null)
    return s.count { it == firstItem } // s: Any が Iterable<*> にスマートキャストされる
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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

また、ラムダ内でのスマートキャストが、ラムダの作成前にのみ変更されるローカル変数に対しても許可されるようになりました。

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val flag = args.size == 0
    var x: String? = null
    if (flag) x = "Yahoo!"

    run {
        if (x != null) {
            println(x.length) // x が String にスマートキャストされる
        }
    }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### this::foo の短縮形としての ::foo のサポート {id="support-for-foo-as-a-shorthand-for-this-foo"}

`this` のメンバに対する束縛された呼び出し可能参照（bound callable reference）を、明示的なレシーバなしで書けるようになりました（`this::foo` の代わりに `::foo`）。これにより、外部レシーバのメンバを参照するラムダ内などで、呼び出し可能参照がより便利に使用できるようになります。

### 破壊的変更: try ブロック後の健全なスマートキャスト {id="breaking-change-sound-smart-casts-after-try-blocks"}

以前の Kotlin では、`try` ブロック内で行われた代入をブロック後のスマートキャストに使用していましたが、これは型安全および null 安全を損ない、実行時の失敗を招く可能性がありました。このリリースではこの問題が修正され、スマートキャストがより厳格になりましたが、そのようなスマートキャストに依存していた一部のコードは動作しなくなります。

以前のスマートキャストの挙動に戻すには、コンパイラ引数としてフォールバックフラグ `-Xlegacy-smart-cast-after-try` を渡してください。このフラグは Kotlin 1.3 で非推奨になる予定です。

### 非推奨: copy をオーバーライドするデータクラス {id="deprecation-data-classes-overriding-copy"}

既存の同シグネチャの `copy` 関数を持つ型から派生したデータクラスにおいて、生成された `copy` 実装がスーパータイプのデフォルト値を使用してしまい直感に反する挙動をしたり、スーパータイプにデフォルト引数がない場合に実行時に失敗したりする問題がありました。

`copy` の競合を引き起こす継承は、Kotlin 1.2 で警告付きの非推奨となり、Kotlin 1.3 ではエラーになります。

### 非推奨: 列挙型エントリ内のネストした型 {id="deprecation-nested-types-in-enum-entries"}

列挙型（enum）エントリ内において、`inner class` ではないネストした型を定義することは、初期化ロジックの問題により非推奨となりました。これは Kotlin 1.2 で警告を発生させ、Kotlin 1.3 でエラーになります。

### 非推奨: vararg に対する単一の名前付き引数 {id="deprecation-single-named-argument-for-vararg"}

アノテーションでの配列リテラルとの整合性を保つため、可変長引数（vararg）パラメータに対して名前付きの形式で単一の項目を渡すこと（`foo(items = i)`）が非推奨となりました。対応する配列ファクトリ関数とともにスプレッド演算子を使用してください。

```kotlin
foo(items = *arrayOf(1))
```

このような場合に冗長な配列生成を削除する最適化が行われており、パフォーマンスの低下は防止されています。単一引数の形式は Kotlin 1.2 で警告を生成し、Kotlin 1.3 で廃止される予定です。

### 非推奨: Throwable を継承するジェネリッククラスの内部クラス {id="deprecation-inner-classes-of-generic-classes-extending-throwable"}

`Throwable` を継承するジェネリック型の内部クラス（inner class）は、throw-catch シナリオにおいて型安全性を損なう可能性があるため非推奨となりました。Kotlin 1.2 で警告、Kotlin 1.3 でエラーになります。

### 非推奨: 読み取り専用プロパティのバッキングフィールドの変更 {id="deprecation-mutating-backing-field-of-a-read-only-property"}

カスタムゲッター内で `field = ...` と代入することで読み取り専用プロパティのバッキングフィールドを変更することは非推奨となりました。Kotlin 1.2 で警告、Kotlin 1.3 でエラーになります。

## 標準ライブラリ {id="standard-library"}

### Kotlin 標準ライブラリのアーティファクトと分割パッケージ {id="kotlin-standard-library-artifacts-and-split-packages"}

Kotlin 標準ライブラリは Java 9 モジュールシステムと完全に互換性を持つようになりました。Java 9 では分割パッケージ（複数の jar ファイルが同じパッケージ内のクラスを宣言すること）が禁止されています。これに対応するため、従来の `kotlin-stdlib-jre7` および `kotlin-stdlib-jre8` を置き換える新しいアーティファクト `kotlin-stdlib-jdk7` および `kotlin-stdlib-jdk8` が導入されました。

新しいアーティファクト内の宣言は、Kotlin からは見れば同じパッケージ名で見えますが、Java からは異なるパッケージ名になります。したがって、新しいアーティファクトに切り替えても、ソースコードの変更は必要ありません。

新しいモジュールシステムとの互換性を確保するためのもう一つの変更として、`kotlin-reflect` ライブラリから `kotlin.reflect` パッケージ内の非推奨の宣言を削除しました。これらを使用していた場合は、Kotlin 1.1 からサポートされている `kotlin.reflect.full` パッケージ内の宣言に切り替える必要があります。

### windowed, chunked, zipWithNext {id="windowed-chunked-zipwithnext"}

`Iterable<T>`、`Sequence<T>`、および `CharSequence` の新しい拡張機能により、バッファリングやバッチ処理（`chunked`）、スライディングウィンドウや移動平均の計算（`windowed`）、および連続する項目のペアの処理（`zipWithNext`）といったユースケースがカバーされます。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### fill, replaceAll, shuffle/shuffled {id="fill-replaceall-shuffle-shuffled"}

リストを操作するための拡張関数のセットが追加されました。`MutableList` 用に `fill`、`replaceAll`、`shuffle` が、読み取り専用の `List` 用に `shuffled` が追加されています。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### kotlin-stdlib での数学演算 {id="math-operations-in-kotlin-stdlib"}

長年の要望に応え、Kotlin 1.2 では JVM と JS で共通の数学演算用 API である `kotlin.math` が追加されました。これには以下が含まれます。

* 定数: `PI` および `E`
* 三角関数: `cos`, `sin`, `tan` およびその逆関数: `acos`, `asin`, `atan`, `atan2`
* 双曲線関数: `cosh`, `sinh`, `tanh` およびその逆関数: `acosh`, `asinh`, `atanh`
* べき乗: `pow`（拡張関数）, `sqrt`, `hypot`, `exp`, `expm1`
* 対数: `log`, `log2`, `log10`, `ln`, `ln1p`
* 丸め:
    * `ceil`, `floor`, `truncate`, `round`（最近接偶数への丸め）関数
    * `roundToInt`, `roundToLong`（整数への丸め）拡張関数
* 符号と絶対値:
    * `abs` および `sign` 関数
    * `absoluteValue` および `sign` 拡張プロパティ
    * `withSign` 拡張関数
* 2つの値の `max` および `min`
* バイナリ表現:
    * `ulp` 拡張プロパティ
    * `nextUp`, `nextDown`, `nextTowards` 拡張関数
    * `toBits`, `toRawBits`, `Double.fromBits`（これらは `kotlin` パッケージにあります）

同じ関数セット（定数を除く）が `Float` 引数に対しても利用可能です。

### BigInteger および BigDecimal 用の演算子と変換 {id="operators-and-conversions-for-biginteger-and-bigdecimal"}

Kotlin 1.2 では、`BigInteger` および `BigDecimal` を操作したり、他の数値型からこれらを作成したりするための関数セットが導入されました。これには以下が含まれます。

* `Int` および `Long` 用の `toBigInteger`
* `Int`, `Long`, `Float`, `Double`, および `BigInteger` 用の `toBigDecimal`
* 算術演算子およびビット演算子関数:
    * 二項演算子 `+`, `-`, `*`, `/`, `%` および中置関数 `and`, `or`, `xor`, `shl`, `shr`
    * 単項演算子 `-`, `++`, `--` および関数 `inv`

### 浮動小数点数とビット表現の相互変換 {id="floating-point-to-bits-conversions"}

`Double` および `Float` をビット表現と相互に変換するための新しい関数が追加されました。

* `toBits` および `toRawBits`：`Double` に対しては `Long` を、`Float` に対しては `Int` を返します
* `Double.fromBits` および `Float.fromBits`：ビット表現から浮動小数点数を作成します

### Regex がシリアライズ可能に {id="regex-is-now-serializable"}

`kotlin.text.Regex` クラスが `Serializable` になり、シリアライズ可能な階層で使用できるようになりました。

### Closeable.use が利用可能な場合に Throwable.addSuppressed を呼び出す {id="closeable-use-calls-throwable-addsuppressed-if-available"}

`Closeable.use` 関数は、リソースのクローズ中に例外が発生し、かつ既に別の例外がスローされている場合、`Throwable.addSuppressed` を呼び出すようになりました。

この挙動を有効にするには、依存関係に `kotlin-stdlib-jdk7` を含める必要があります。

## JVM バックエンド {id="jvm-backend"}

### コンストラクタ呼び出しの正規化 {id="constructor-calls-normalization"}

バージョン 1.0 以来、Kotlin は try-catch 式やインライン関数呼び出しなどの複雑な制御フローを含む式をサポートしてきました。このようなコードは Java 仮想マシン仕様に準拠した有効なものです。しかし残念なことに、一部のバイトコード処理ツールは、コンストラクタ呼び出しの引数にそのような式が含まれている場合、正しく処理できないことがあります。

このようなツールのユーザー向けに、コンパイラがそのような構造に対してより Java に近いバイトコードを生成するように指示するコマンドラインコンパイラオプション (`-Xnormalize-constructor-calls=MODE`) を追加しました。ここで `MODE` は以下のいずれかです。

* `disable` (デフォルト) – Kotlin 1.0 および 1.1 と同じ方法でバイトコードを生成します。
* `enable` – コンストラクタ呼び出しに対して Java に近いバイトコードを生成します。これにより、クラスがロードおよび初期化される順序が変わる可能性があります。
* `preserve-class-initialization` – コンストラクタ呼び出しに対して Java に近いバイトコードを生成し、クラス初期化の順序が維持されるようにします。これはアプリケーション全体のパフォーマンスに影響を与える可能性があるため、複数のクラス間で共有され、クラス初期化時に更新される複雑な状態がある場合にのみ使用してください。

「手動」の回避策は、制御フローを含む部分式の値を、呼び出し引数の中で直接評価するのではなく、変数に格納することです。これは `-Xnormalize-constructor-calls=enable` と同様の効果があります。

### Java デフォルトメソッドの呼び出し {id="java-default-method-calls"}

Kotlin 1.2 より前は、JVM 1.6 をターゲットにしている際に Java のデフォルトメソッドをオーバーライドするインターフェースメンバが super 呼び出しを行うと、警告 `Super calls to Java default methods are deprecated in JVM target 1.6. Recompile with '-jvm-target 1.8'` が生成されていました。Kotlin 1.2 ではこれが**エラー**となり、そのようなコードは JVM ターゲット 1.8 でコンパイルする必要があります。

### 破壊的変更: プラットフォーム型における x.equals(null) の一貫した挙動 {id="breaking-change-consistent-behavior-of-x-equals-null-for-platform-types"}

Java プリミティブにマップされるプラットフォーム型 (`Int!`, `Boolean!`, `Short!`, `Long!`, `Float!`, `Double!`, `Char!`) に対して `x.equals(null)` を呼び出した際、`x` が null の場合に誤って `true` を返していました。Kotlin 1.2 以降、プラットフォーム型の null 値に対して `x.equals(...)` を呼び出すと **NPE がスローされます** (ただし `x == ...` はスローされません)。

1.2 未満の挙動に戻すには、コンパイラにフラグ `-Xno-exception-on-explicit-equals-for-boxed-null` を渡してください。

### 破壊的変更: インライン化された拡張レシーバを介したプラットフォーム null のエスケープの修正 {id="breaking-change-fix-for-platform-null-escaping-through-an-inlined-extension-receiver"}

プラットフォーム型の null 値に対して呼び出されたインライン拡張関数が、レシーバの null チェックを行っておらず、結果として null が他のコードにエスケープすることを許容していました。Kotlin 1.2 では、呼び出し側でこのチェックを強制し、レシーバが null の場合は例外をスローするようにしました。

以前の挙動に切り替えるには、コンパイラにフォールバックフラグ `-Xno-receiver-assertions` を渡してください。

## JavaScript バックエンド {id="javascript-backend"}

### TypedArray サポートがデフォルトで有効に {id="typedarrays-support-enabled-by-default"}

Kotlin のプリミティブ配列（`IntArray`, `DoubleArray` など）を [JavaScript の TypedArray](https://developer.mozilla.org/ja/docs/Web/JavaScript/Typed_arrays) に変換する JS TypedArray サポートは、以前はオプトイン機能でしたが、デフォルトで有効になりました。

## ツール {id="tools"}

### 警告をエラーとして扱う {id="warnings-as-errors"}

コンパイラに、すべての警告をエラーとして扱うオプションが追加されました。コマンドラインで `-Werror` を使用するか、以下の Gradle スニペットを使用してください。

```groovy
compileKotlin {
    kotlinOptions.allWarningsAsErrors = true
}
```
