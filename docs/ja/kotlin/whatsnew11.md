[//]: # (title: Kotlin 1.1 の新機能)

<web-summary>新しい言語機能、Kotlin/JVM および JS のアップデート、Gradle と Maven に対するビルドツールサポートなどを網羅した Kotlin 1.1 のリリースノートをご覧ください。</web-summary>

_リリース日: 2016年2月15日_

## 目次 {id="table-of-contents"}

* [コルーチン](#coroutines-experimental)
* [その他の言語機能](#other-language-features)
* [標準ライブラリ](#standard-library)
* [JVM バックエンド](#jvm-backend)
* [JavaScript バックエンド](#javascript-backend)

> Kotlin のリリースサイクルに関する詳細については、[Kotlin リリースプロセス](releases.md)を参照してください。
>
{style="tip"}

## JavaScript {id="javascript"}

Kotlin 1.1 以降、JavaScript ターゲットは実験的（experimental）とはみなされなくなりました。すべての言語機能がサポートされており、フロントエンド開発環境と統合するための多くの新しいツールが用意されています。変更点の詳細なリストについては、[以下](#javascript-backend)を参照してください。

## コルーチン（実験的機能） {id="coroutines-experimental"}

Kotlin 1.1 の主要な新機能は*コルーチン（coroutines）*であり、`async`/`await` や `yield`、その他同様のプログラミングパターンのサポートが導入されました。Kotlin の設計における重要な特徴は、コルーチンの実行に関する実装が言語仕様ではなくライブラリ側の一部となっている点です。そのため、特定のプログラミングパラダイムや並行処理ライブラリに縛られることがありません。

コルーチンは実質的に、中断（suspend）して後から再開（resume）できる軽量スレッドです。
コルーチンは_[中断関数 (suspending functions)](coroutines-basics.md)_を通じてサポートされています。このような関数の呼び出しはコルーチンを中断させる可能性があり、新しいコルーチンを開始するには通常、匿名の中断関数（すなわちサスペンディングラムダ）を使用します。

外部ライブラリ [kotlinx.coroutines](https://github.com/kotlin/kotlinx.coroutines) で実装されている `async`/`await` を見てみましょう。

```kotlin
// バックグラウンドのスレッドプールでコードを実行する
fun asyncOverlay() = async(CommonPool) {
    // 2つの非同期操作を開始
    val original = asyncLoadImage("original")
    val overlay = asyncLoadImage("overlay")
    // 両方の結果に対してオーバーレイを適用
    applyOverlay(original.await(), overlay.await())
}

// UIコンテキストで新しいコルーチンを起動する
launch(UI) {
    // 非同期オーバーレイの完了を待機
    val image = asyncOverlay().await()
    // UIに画像を表示
    showImage(image)
}
```

ここでは `async { ... }` がコルーチンを開始し、`await()` を使用すると、待機対象の操作が実行されている間コルーチンの実行が中断され、待機対象の操作が完了したときに（場合によっては別のスレッド上で）再開されます。

標準ライブラリでは、`yield` および `yieldAll` 関数を用いた*遅延生成シーケンス (lazily generated sequences)* をサポートするためにコルーチンを使用しています。このようなシーケンスでは、シーケンスの要素を返すコードブロックが、各要素が取得された後に中断され、次の要素が要求されたときに再開されます。以下に例を示します。

```kotlin
import kotlin.coroutines.experimental.*

fun main(args: Array<String>) {
    val seq = buildSequence {
      for (i in 1..5) {
          // i の2乗を yield
          yield(i * i)
      }
      // 範囲を yield
      yieldAll(26..28)
    }

    // シーケンスを出力
    println(seq.toList())
}
```

上記のコードを実行して結果を確認してみてください。自由に変更して再度実行することも可能です。

詳細については、[コルーチンのドキュメント](coroutines-overview.md)および[チュートリアル](coroutines-and-channels.md)を参照してください。

コルーチンは現在**実験的機能 (experimental feature)** とみなされており、Kotlin チームは最終的な 1.1 リリース以降におけるこの機能の後方互換性を保証していない点にご注意ください。

## その他の言語機能 {id="other-language-features"}

### 型エイリアス {id="type-aliases"}

型エイリアス (Type alias) を使用すると、既存の型に対して別の名前を定義できます。これは、コレクションなどのジェネリック型や関数型において最も役立ちます。以下に例を示します。

```kotlin
//sampleStart
typealias OscarWinners = Map<String, String>

fun countLaLaLand(oscarWinners: OscarWinners) =
        oscarWinners.count { it.value.contains("La La Land") }

// 型名（元の型と型エイリアス）は交換可能であることに注意してください:
fun checkLaLaLandIsTheBestMovie(oscarWinners: Map<String, String>) =
        oscarWinners["Best picture"] == "La La Land"
//sampleEnd

fun oscarWinners(): OscarWinners {
    return mapOf(
            "Best song" to "City of Stars (La La Land)",
            "Best actress" to "Emma Stone (La La Land)",
            "Best picture" to "Moonlight" /* ... */)
}

fun main(args: Array<String>) {
    val oscarWinners = oscarWinners()

    val laLaLandAwards = countLaLaLand(oscarWinners)
    println("LaLaLandAwards = $laLaLandAwards (in our small example), but actually it's 6.")

    val laLaLandIsTheBestMovie = checkLaLaLandIsTheBestMovie(oscarWinners)
    println("LaLaLandIsTheBestMovie = $laLaLandIsTheBestMovie")
}
```
{kotlin-runnable="true"}

詳細については、[型エイリアスのドキュメント](type-aliases.md)および [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/type-aliases.md) を参照してください。

### バインドされた呼び出し可能参照 {id="bound-callable-references"}

`::` 演算子を使用して、特定のオブジェクトインスタンスのメソッドやプロパティを指す[メンバー参照](lambdas.md#function-references)を取得できるようになりました。以前はこれをラムダでしか表現できませんでした。以下に例を示します。

```kotlin
//sampleStart
val numberRegex = "\\d+".toRegex()
val numbers = listOf("abc", "123", "456").filter(numberRegex::matches)
//sampleEnd

fun main(args: Array<String>) {
    println("Result is $numbers")
}
```
{kotlin-runnable="true"}

詳細については、[ドキュメント](reflection.md)および [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/bound-callable-references.md) を参照してください。

### Sealed クラスとデータクラス {id="sealed-and-data-classes"}

Kotlin 1.1 では、Kotlin 1.0 に存在していた sealed クラスおよびデータクラスに関する制限の一部が解除されました。
トップレベルの sealed クラスのサブクラスを、その sealed クラスのネストされたクラスとしてだけでなく、同じファイル内のトップレベルでも定義できるようになりました。
また、データクラスが他のクラスを継承できるようになりました。
これを利用して、式（expression）クラスの階層を分かりやすくすっきりと定義できます。

```kotlin
//sampleStart
sealed class Expr

data class Const(val number: Double) : Expr()
data class Sum(val e1: Expr, val e2: Expr) : Expr()
object NotANumber : Expr()

fun eval(expr: Expr): Double = when (expr) {
    is Const -> expr.number
    is Sum -> eval(expr.e1) + eval(expr.e2)
    NotANumber -> Double.NaN
}
val e = eval(Sum(Const(1.0), Const(2.0)))
//sampleEnd

fun main(args: Array<String>) {
    println("e is $e") // 3.0
}
```
{kotlin-runnable="true"}

詳細については、[sealed クラスのドキュメント](sealed-classes.md)や、[sealed クラス](https://github.com/Kotlin/KEEP/blob/master/proposals/sealed-class-inheritance.md)および[データクラス](https://github.com/Kotlin/KEEP/blob/master/proposals/data-class-inheritance.md)に関する KEEP を参照してください。

### ラムダでの分解宣言 {id="destructuring-in-lambdas"}

[分解宣言 (destructuring declaration)](destructuring-declarations.md) の構文を使用して、ラムダに渡された引数をアンパックできるようになりました。以下に例を示します。

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val map = mapOf(1 to "one", 2 to "two")
    // 従来
    println(map.mapValues { entry ->
      val (key, value) = entry
      "$key -> $value!"
    })
    // 1.1以降
    println(map.mapValues { (key, value) -> "$key -> $value!" })
//sampleEnd
}
```
{kotlin-runnable="true"}

詳細については、[分解宣言のドキュメント](destructuring-declarations.md)および [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/destructuring-in-parameters.md) を参照してください。

### 未使用パラメーターのためのアンダースコア {id="underscores-for-unused-parameters"}

複数のパラメーターを持つラムダにおいて、使用しないパラメーターの名前を `_` 文字に置き換えることができます。

```kotlin
fun main(args: Array<String>) {
    val map = mapOf(1 to "one", 2 to "two")

//sampleStart
    map.forEach { _, value -> println("$value!") }
//sampleEnd
}
```
{kotlin-runnable="true"}

これは[分解宣言](destructuring-declarations.md)でも機能します。

```kotlin
data class Result(val value: Any, val status: String)

fun getResult() = Result(42, "ok").also { println("getResult() returns $it") }

fun main(args: Array<String>) {
//sampleStart
    val (_, status) = getResult()
//sampleEnd
    println("status is '$status'")
}
```
{kotlin-runnable="true"}

詳細については、[KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/underscore-for-unused-parameters.md) を参照してください。

### 数値リテラル内のアンダースコア {id="underscores-in-numeric-literals"}

Java 8 と同様に、Kotlin でも数値リテラル内でアンダースコアを使用して桁を区切ることができるようになりました。

```kotlin
//sampleStart
val oneMillion = 1_000_000
val hexBytes = 0xFF_EC_DE_5E
val bytes = 0b11010010_01101001_10010100_10010010
//sampleEnd

fun main(args: Array<String>) {
    println(oneMillion)
    println(hexBytes.toString(16))
    println(bytes.toString(2))
}
```
{kotlin-runnable="true"}

詳細については、[KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/underscores-in-numeric-literals.md) を参照してください。

### プロパティのより短い構文 {id="shorter-syntax-for-properties"}

ゲッターが式本体（expression body）として定義されているプロパティでは、プロパティの型を省略できるようになりました。

```kotlin
//sampleStart
    data class Person(val name: String, val age: Int) {
    val isAdult get() = age >= 20 // プロパティの型は 'Boolean' と推論される
}
//sampleEnd
fun main(args: Array<String>) {
    val akari = Person("Akari", 26)
    println("$akari.isAdult = ${akari.isAdult}")
}
```
{kotlin-runnable="true"}

### インラインプロパティアクセサ {id="inline-property-accessors"}

バッキングフィールドを持たないプロパティの場合、プロパティアクセサに `inline` 修飾子を付けられるようになりました。このようなアクセサは、[インライン関数](inline-functions.md)と同じ方法でコンパイルされます。

```kotlin
//sampleStart
public val <T> List<T>.lastIndex: Int
    inline get() = this.size - 1
//sampleEnd

fun main(args: Array<String>) {
    val list = listOf('a', 'b')
    // ゲッターがインライン展開される
    println("Last index of $list is ${list.lastIndex}")
}
```
{kotlin-runnable="true"}

プロパティ全体に `inline` を指定することもでき、その場合は両方のアクセサに修飾子が適用されます。

詳細については、[インライン関数のドキュメント](inline-functions.md#inline-properties)および [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/inline-properties.md) を参照してください。

### ローカル委譲プロパティ {id="local-delegated-properties"}

ローカル変数でも[委譲プロパティ](delegated-properties.md)の構文を使用できるようになりました。
考えられる用途の1つとして、遅延評価されるローカル変数の定義が挙げられます。

```kotlin
import java.util.Random

fun needAnswer() = Random().nextBoolean()

fun main(args: Array<String>) {
//sampleStart
    val answer by lazy {
        println("Calculating the answer...")
        42
    }
    if (needAnswer()) {                     // ランダムな値を返す
        println("The answer is $answer.")   // この時点で answer が計算される
    }
    else {
        println("Sometimes no answer is the answer...")
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

詳細については、[KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/local-delegated-properties.md) を参照してください。

### 委譲プロパティバインディングのインターセプト {id="interception-of-delegated-property-binding"}

[委譲プロパティ](delegated-properties.md)において、`provideDelegate` 演算子を使用してプロパティへのデリゲートのバインディングをインターセプトできるようになりました。
例えば、バインディングの前にプロパティ名を検証したい場合は、次のように記述できます。

```kotlin
class ResourceLoader<T>(id: ResourceID<T>) {
    operator fun provideDelegate(thisRef: MyUI, prop: KProperty<*>): ReadOnlyProperty<MyUI, T> {
        checkProperty(thisRef, prop.name)
        ... // プロパティの生成
    }

    private fun checkProperty(thisRef: MyUI, name: String) { ... }
}

fun <T> bindResource(id: ResourceID<T>): ResourceLoader<T> { ... }

class MyUI {
    val image by bindResource(ResourceID.image_id)
    val text by bindResource(ResourceID.text_id)
}
```

`MyUI` インスタンスの作成時に各プロパティに対して `provideDelegate` メソッドが呼び出され、必要な検証をその場で実行できます。

詳細については、[委譲プロパティのドキュメント](delegated-properties.md)を参照してください。

### ジェネリックな enum 値アクセス {id="generic-enum-value-access"}

enum クラスの値をジェネリックな方法で列挙できるようになりました。

```kotlin
//sampleStart
enum class RGB { RED, GREEN, BLUE }

inline fun <reified T : Enum<T>> printAllValues() {
    print(enumValues<T>().joinToString { it.name })
}
//sampleEnd

fun main(args: Array<String>) {
    printAllValues<RGB>() // RED, GREEN, BLUE を出力
}
```
{kotlin-runnable="true"}

### DSL における暗黙のレシーバーのスコープ制御 {id="scope-control-for-implicit-receivers-in-dsls"}

[`@DslMarker`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-dsl-marker/index.html) アノテーションを使用すると、DSL コンテキストにおいて外側のスコープからのレシーバーの使用を制限できます。
典型的な [HTML ビルダーの例](type-safe-builders.md)を考えてみましょう。

```kotlin
table {
    tr {
        td { + "Text" }
    }
}
```

Kotlin 1.0 では、`td` に渡されたラムダ内のコードは、`table`、`tr`、`td` に渡された3つの暗黙のレシーバーすべてにアクセスできました。これにより、そのコンテキストでは意味をなさないメソッドを呼び出すことができてしまいました（例えば、`td` の中で `tr` を呼び出して、`<td>` の中に `<tr>` タグを配置するなど）。

Kotlin 1.1 ではこれを制限できるため、`td` に渡されたラムダ内では、`td` の暗黙のレシーバーで定義されたメソッドのみが利用可能になります。これを行うには、`@DslMarker` メタアノテーションでマークされた独自のアノテーションを定義し、それをタグクラスの基底クラスに適用します。

詳細については、[型安全なビルダーのドキュメント](type-safe-builders.md)および [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/scope-control-for-implicit-receivers.md) を参照してください。

### rem 演算子 {id="rem-operator"}

`mod` 演算子は非推奨となり、代わりに `rem` が使用されるようになりました。背景については [この課題 (Issue)](https://youtrack.jetbrains.com/issue/KT-14650) を参照してください。

## 標準ライブラリ {id="standard-library"}

### 文字列から数値への変換 {id="string-to-number-conversions"}

String クラスに、無効な数値に対して例外をスローせずに数値へ変換するための新しい拡張関数群が追加されました:
`String.toIntOrNull(): Int?`、`String.toDoubleOrNull(): Double?` など。

```kotlin
val port = System.getenv("PORT")?.toIntOrNull() ?: 80
```

また、`Int.toString()`、`String.toInt()`、`String.toIntOrNull()` などの整数変換関数には、変換の基数（2〜36）を指定できる `radix` パラメーターを持つオーバーロードがそれぞれ追加されました。

### onEach() {id="oneach"}

`onEach` は、コレクションやシーケンスに対する小さくても便利な拡張関数であり、一連の操作チェーンの中で各要素に対して（副作用を伴う可能性のある）何らかのアクションを実行できるようにします。
Iterable では `forEach` のように動作しますが、その Iterable インスタンス自身をそのまま返します。また、シーケンスでは、要素が反復処理される際に指定されたアクションを遅延評価で適用するラッパーシーケンスを返します。

```kotlin
inputDir.walk()
        .filter { it.isFile && it.name.endsWith(".txt") }
        .onEach { println("Moving $it to $outputDir") }
        .forEach { moveFile(it, File(outputDir, it.toRelativeString(inputDir))) }
```

### also()、takeIf()、takeUnless() {id="also-takeif-and-takeunless"}

これらは、任意のレシーバーに適用できる3つの汎用拡張関数です。
 
`also` は `apply` に似ています。レシーバーを受け取り、それに対して何らかのアクションを実行し、そのレシーバーを返します。
違いは、`apply` の内側のブロックではレシーバーが `this` として参照できるのに対し、`also` の内側のブロックでは `it` として参照できる点です（必要に応じて別の名前を付けることもできます）。
これは、外側スコープの `this` をシャドウイング（覆い隠すこと）したくない場合に便利です。

```kotlin
class Block {
    lateinit var content: String
}

//sampleStart
fun Block.copy() = Block().also {
    it.content = this.content
}
//sampleEnd

// 代わりに 'apply' を使用した場合
fun Block.copy1() = Block().apply {
    this.content = this@copy1.content
}

fun main(args: Array<String>) {
    val block = Block().apply { content = "content" }
    val copy = block.copy()
    println("Testing the content was copied:")
    println(block.content == copy.content)
}
```
{kotlin-runnable="true"}

`takeIf` は、単一の値に対する `filter` のようなものです。レシーバーが述語（predicate）を満たしているかどうかをチェックし、満たしていればレシーバーを、満たしていなければ `null` を返します。
Elvis 演算子 (`?:`) や早期リターンと組み合わせることで、次のような構文を書くことができます。

```kotlin
val outDirFile = File(outputDir.path).takeIf { it.exists() } ?: return false
// 存在する outDirFile を使って何らかの処理を行う
```

```kotlin
fun main(args: Array<String>) {
    val input = "Kotlin"
    val keyword = "in"

//sampleStart
    val index = input.indexOf(keyword).takeIf { it >= 0 } ?: error("keyword not found")
    // 入力文字列内でキーワードが見つかった場合、そのインデックスを使って何らかの処理を行う
//sampleEnd
    
    println("'$keyword' was found in '$input'")
    println(input)
    println(" ".repeat(index) + "^")
}
```
{kotlin-runnable="true"}

`takeUnless` は `takeIf` と同様ですが、反転した述語を取ります。述語を_満たさない_場合にレシーバーを返し、満たす場合は `null` を返します。したがって、上記の例の1つは `takeUnless` を使用して次のように書き換えることができます。

```kotlin
val index = input.indexOf(keyword).takeUnless { it < 0 } ?: error("keyword not found")
```

また、ラムダの代わりに呼び出し可能参照がある場合にも便利に使用できます。

```kotlin
private fun testTakeUnless(string: String) {
//sampleStart
    val result = string.takeUnless(String::isEmpty)
//sampleEnd

    println("string = \"$string\"; result = \"$result\"")
}

fun main(args: Array<String>) {
    testTakeUnless("")
    testTakeUnless("abc")
}
```
{kotlin-runnable="true"}

### groupingBy() {id="groupingby"}

この API は、コレクションをキーによってグループ化し、各グループを同時に畳み込む（fold）ために使用できます。例えば、各文字で始まる単語の数を数えるのに使用できます。

```kotlin
fun main(args: Array<String>) {
    val words = "one two three four five six seven eight nine ten".split(' ')
//sampleStart
    val frequencies = words.groupingBy { it.first() }.eachCount()
//sampleEnd
    println("Counting first letters: $frequencies.")

    // 'groupBy' と 'mapValues' を使用する別のアプローチでは中間マップが作成されますが、
    // 'groupingBy' によるアプローチではその場でカウントが行われます。
    val groupBy = words.groupBy { it.first() }.mapValues { (_, list) -> list.size }
    println("Comparing the result with using 'groupBy': ${groupBy == frequencies}.")
}
```
{kotlin-runnable="true"}

### Map.toMap() および Map.toMutableMap() {id="map-tomap-and-map-tomutablemap"}

これらの関数は、マップを簡単にコピーするために使用できます。

```kotlin
class ImmutablePropertyBag(map: Map<String, Any>) {
    private val mapCopy = map.toMap()
}
```

### Map.minus(key) {id="map-minus-key"}

`plus` 演算子は、読み取り専用マップにキーと値のペアを追加して新しいマップを生成する方法を提供しますが、その逆を行うシンプルな方法はありませんでした。マップからキーを削除するには、`Map.filter()` や `Map.filterKeys()` のような直感的ではない方法に頼る必要がありました。
`minus` 演算子がこのギャップを埋めます。単一のキー、キーのコレクション、キーのシーケンス、キーの配列を削除するための4つのオーバーロードが利用可能です。

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val map = mapOf("key" to 42)
    val emptyMap = map - "key"
//sampleEnd
    
    println("map: $map")
    println("emptyMap: $emptyMap")
}
```
{kotlin-runnable="true"}

### minOf() および maxOf() {id="minof-and-maxof"}

これらの関数は、与えられた2つまたは3つの値のうち、最小値および最大値を見つけるために使用できます。ここで値はプリミティブな数値型または `Comparable` オブジェクトです。自身が比較可能でないオブジェクトを比較したい場合のために、追加の `Comparator` インスタンスを受け取るオーバーロードも各関数に用意されています。

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val list1 = listOf("a", "b")
    val list2 = listOf("x", "y", "z")
    val minSize = minOf(list1.size, list2.size)
    val longestList = maxOf(list1, list2, compareBy { it.size })
//sampleEnd
    
    println("minSize = $minSize")
    println("longestList = $longestList")
}
```
{kotlin-runnable="true"}

### 配列風の List 生成関数 {id="array-like-list-instantiation-functions"}

`Array` コンストラクタと同様に、`List` および `MutableList` のインスタンスを作成し、ラムダを呼び出して各要素を初期化する関数が追加されました。

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val squares = List(10) { index -> index * index }
    val mutable = MutableList(10) { 0 }
//sampleEnd

    println("squares: $squares")
    println("mutable: $mutable")
}
```
{kotlin-runnable="true"}

### Map.getValue() {id="map-getvalue"}

この `Map` に対する拡張関数は、指定されたキーに対応する既存の値を返すか、どのキーが見つからなかったかを示す例外をスローします。
マップが `withDefault` を使って生成されたものである場合、この関数は例外をスローする代わりにデフォルト値を返します。

```kotlin
fun main(args: Array<String>) {
//sampleStart    
    val map = mapOf("key" to 42)
    // null非許容の Int 値 42 を返す
    val value: Int = map.getValue("key")

    val mapWithDefault = map.withDefault { k -> k.length }
    // 4 を返す
    val value2 = mapWithDefault.getValue("key2")

    // map.getValue("anotherKey") // <- これは NoSuchElementException をスローする
//sampleEnd
    
    println("value is $value")
    println("value2 is $value2")
}
```
{kotlin-runnable="true"}

### 抽象コレクション {id="abstract-collections"}

これらの抽象クラスは、Kotlin のコレクションクラスを実装する際の基底クラスとして使用できます。
読み取り専用コレクションを実装するためのクラスとして `AbstractCollection`、`AbstractList`、`AbstractSet`、`AbstractMap` があり、可変（mutable）コレクション用には `AbstractMutableCollection`、`AbstractMutableList`、`AbstractMutableSet`、`AbstractMutableMap` があります。
JVM 上では、これら抽象可変コレクションは機能の大部分を JDK の抽象コレクションから継承しています。

### 配列操作関数 {id="array-manipulation-functions"}

標準ライブラリに、配列に対する要素ごとの操作を行う一連の関数が提供されるようになりました: 比較（`contentEquals` および `contentDeepEquals`）、ハッシュコード計算（`contentHashCode` および `contentDeepHashCode`）、文字列への変換（`contentToString` および `contentDeepToString`）。これらは JVM（`java.util.Arrays` の対応する関数のエイリアスとして動作）と JS（Kotlin 標準ライブラリ内で実装を提供）の両方でサポートされています。

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val array = arrayOf("a", "b", "c")
    println(array.toString())  // JVM 実装: 型とハッシュの意味不明な文字列
    println(array.contentToString())  // リストとして綺麗にフォーマットされる
//sampleEnd
}
```
{kotlin-runnable="true"}

## JVM バックエンド {id="jvm-backend"}

### Java 8 バイトコードサポート {id="java-8-bytecode-support"}

Kotlin に Java 8 バイトコードを生成するオプションが追加されました（`-jvm-target 1.8` コマンドラインオプション、または Maven/Gradle の対応するオプション）。現時点ではバイトコードのセマンティクスは変更されませんが（特に、インターフェース内のデフォルトメソッドやラムダは Kotlin 1.0 とまったく同様に生成されます）、今後さらなる活用を予定しています。

### Java 8 標準ライブラリサポート {id="java-8-standard-library-support"}

Java 7 および 8 で追加された新しい JDK API をサポートする標準ライブラリの個別バージョンが提供されるようになりました。
新しい API へのアクセスが必要な場合は、標準の `kotlin-stdlib` の代わりに `kotlin-stdlib-jre7` および `kotlin-stdlib-jre8` Maven アーティファクトを使用してください。
これらのアーティファクトは `kotlin-stdlib` の上にある小さな拡張であり、推移的依存関係として `kotlin-stdlib` をプロジェクトに取り込みます。

### バイトコード内のパラメーター名 {id="parameter-names-in-the-bytecode"}

Kotlin はバイトコード内にパラメーター名を保持することをサポートするようになりました。これは `-java-parameters` コマンドラインオプションを使用して有効にできます。

### 定数のインライン化 {id="constant-inlining"}

コンパイラは、`const val` プロパティの値をそれが使用されている箇所にインライン展開するようになりました。

### 可変クロージャ変数 {id="mutable-closure-variables"}

ラムダ内で可変クロージャ変数をキャプチャするために使用されるボックスクラスに volatile フィールドが含まれなくなりました。この変更によりパフォーマンスが向上しますが、まれな使用シナリオにおいて新たな競合状態（race conditions）が発生する可能性があります。これが影響する場合は、変数へのアクセスに対して独自の同期処理を提供する必要があります。

### javax.script のサポート {id="javax-script-support"}

Kotlin は [javax.script API](https://docs.oracle.com/javase/8/docs/api/javax/script/package-summary.html) (JSR-223) と統合されました。
この API を使用すると、実行時にコードスニペットを評価できます。

```kotlin
val engine = ScriptEngineManager().getEngineByExtension("kts")!!
engine.eval("val x = 3")
println(engine.eval("x + 2"))  // 5 を出力
```

この API を使用したより大きなサンプルプロジェクトについては、[こちら](https://github.com/JetBrains/kotlin/tree/1.1.0/libraries/examples/kotlin-jsr223-local-example)を参照してください。

### kotlin.reflect.full {id="kotlin-reflect-full"}

[Java 9 サポートへの準備](https://blog.jetbrains.com/kotlin/2017/01/kotlin-1-1-whats-coming-in-the-standard-library/)として、`kotlin-reflect.jar` ライブラリ内の拡張関数およびプロパティが `kotlin.reflect.full` パッケージに移動されました。古いパッケージ（`kotlin.reflect`）の名称は非推奨となり、Kotlin 1.2 で削除される予定です。なお、コアのリフレクションインターフェース（`KClass` など）は `kotlin-reflect` ではなく Kotlin 標準ライブラリの一部であるため、この移動の影響を受けません。

## JavaScript バックエンド {id="javascript-backend"}

### 統合された標準ライブラリ {id="unified-standard-library"}

JavaScript にコンパイルされたコードから、Kotlin 標準ライブラリのより多くの部分を使用できるようになりました。
特に、コレクション（`ArrayList`、`HashMap` など）、例外（`IllegalArgumentException` など）、その他の重要クラス（`StringBuilder`、`Comparator`）などの主要なクラスが `kotlin` パッケージ配下に定義されるようになりました。JVM 上では、これらの名前は対応する JDK クラスの型エイリアスとなり、JS 上では Kotlin 標準ライブラリ内で実装されます。

### より優れたコード生成 {id="better-code-generation"}

JavaScript バックエンドはより静的チェックが可能なコードを生成するようになり、minifier やオプティマイザ、linter などの JS コード処理ツールとの親和性が向上しました。

### external 修飾子 {id="the-external-modifier"}

JavaScript で実装されたクラスに Kotlin から型安全な方法でアクセスする必要がある場合、`external` 修飾子を使用して Kotlin の宣言を記述できます（Kotlin 1.0 では、代わりに `@native` アノテーションが使用されていました）。
JVM ターゲットとは異なり、JS ターゲットではクラスやプロパティに external 修飾子を使用することが許可されています。
例えば、DOM の `Node` クラスは次のように宣言できます。

```kotlin
external class Node {
    val firstChild: Node

    fun appendChild(child: Node): Node

    fun removeChild(child: Node): Node

    // その他
}
```

### インポート処理の改善 {id="improved-import-handling"}

JavaScript モジュールからインポートすべき宣言を、より正確に記述できるようになりました。
外部宣言に `@JsModule("<module-name>")` アノテーションを追加すると、コンパイル時にモジュールシステム（CommonJS または AMD のいずれか）へ適切にインポートされます。例えば、CommonJS では `require(...)` 関数を介して宣言がインポートされます。
さらに、宣言をモジュールとしてもグローバルな JavaScript オブジェクトとしてもインポートしたい場合は、`@JsNonModule` アノテーションを使用できます。

例えば、JQuery を Kotlin モジュールにインポートする方法は以下の通りです。

```kotlin
external interface JQuery {
    fun toggle(duration: Int = definedExternally): JQuery
    fun click(handler: (Event) -> Unit): JQuery
}

@JsModule("jquery")
@JsNonModule
@JsName("$")
external fun jquery(selector: String): JQuery
```

この場合、JQuery は `jquery` という名前のモジュールとしてインポートされます。あるいは、Kotlin コンパイラがどのモジュールシステムを使用するように設定されているかに応じて、`$` オブジェクトとして使用することもできます。

これらの宣言は、アプリケーション内で次のように使用できます。

```kotlin
fun main(args: Array<String>) {
    jquery(".toggle-button").click {
        jquery(".toggle-panel").toggle(300)
    }
}
```