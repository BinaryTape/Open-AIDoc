[//]: # (title: Kotlin 1.1 の新機能)

<web-summary>新機能、Kotlin/JVM および JS への更新、Gradle と Maven のビルドツールサポートを含む Kotlin 1.1 のリリースノートをご覧ください。</web-summary>

_リリース: 2016年2月15日_

## 目次 {id="table-of-contents"}

* [コルーチン](#coroutines-experimental)
* [その他の言語機能](#other-language-features)
* [標準ライブラリ](#standard-library)
* [JVM バックエンド](#jvm-backend)
* [JavaScript バックエンド](#javascript-backend)

> Kotlin のリリースサイクルについては、[Kotlin のリリースプロセス](releases.md)をご覧ください。
>
{style="tip"}

## JavaScript {id="javascript"}

Kotlin 1.1 から、JavaScript ターゲットは実験的とはみなされなくなりました。すべての言語機能がサポートされており、フロントエンド開発環境と統合するための新しいツールが多数用意されています。変更の詳細なリストについては、[以下](#javascript-backend)をご覧ください。

## コルーチン（実験的） {id="coroutines-experimental"}

Kotlin 1.1 の主要な新機能は *コルーチン (coroutines)* です。これにより、`async`/`await`、`yield`、および同様のプログラミングパターンのサポートがもたらされます。Kotlin の設計の鍵となる特徴は、コルーチン実行の実装が言語ではなくライブラリの一部であることです。そのため、特定のプログラミングパラダイムや並行処理ライブラリに縛られることはありません。

コルーチンは事実上、中断して後で再開できる軽量なスレッドです。コルーチンは、*[中断関数 (suspending functions)](coroutines-basics.md)* を通じてサポートされます。このような関数の呼び出しはコルーチンを中断させる可能性があり、新しいコルーチンを開始するには通常、匿名の中断関数（すなわち、中断ラムダ）を使用します。

外部ライブラリである [kotlinx.coroutines](https://github.com/kotlin/kotlinx.coroutines) で実装されている `async`/`await` を見てみましょう：

```kotlin
// バックグラウンドのスレッドプールでコードを実行します
fun asyncOverlay() = async(CommonPool) {
    // 2つの非同期操作を開始します
    val original = asyncLoadImage("original")
    val overlay = asyncLoadImage("overlay")
    // そして、両方の結果にオーバーレイを適用します
    applyOverlay(original.await(), overlay.await())
}

// UI コンテキストで新しいコルーチンを起動します
launch(UI) {
    // 非同期オーバーレイが完了するのを待ちます
    val image = asyncOverlay().await()
    // そして UI に表示します
    showImage(image)
}
```

ここで `async { ... }` はコルーチンを開始し、`await()` を使用すると、待機中の操作が実行されている間コルーチンの実行が中断され、待機中の操作が完了したときに実行が再開されます（場合によっては別のスレッドで）。

標準ライブラリはコルーチンを使用して、`yield` および `yieldAll` 関数による *遅延生成シーケンス (lazily generated sequences)* をサポートしています。このようなシーケンスでは、シーケンスの要素を返すコードブロックは、各要素が取得された後に中断され、次の要素が要求されたときに再開されます。例を次に示します：

```kotlin
import kotlin.coroutines.experimental.*

fun main(args: Array<String>) {
    val seq = buildSequence {
      for (i in 1..5) {
          // i の 2 乗を産出（yield）します
          yield(i * i)
      }
      // 範囲を産出します
      yieldAll(26..28)
    }

    // シーケンスをプリントします
    println(seq.toList())
}
```

上記のコードを実行して結果を確認してください。自由に変更して再度実行してみてください！

詳細については、[コルーチンのドキュメント](coroutines-overview.md)および[チュートリアル](coroutines-and-channels.md)を参照してください。

なお、コルーチンは現在 **実験的な機能 (experimental feature)** とみなされています。つまり、Kotlin チームは 1.1 の最終リリース後、この機能のバックワード互換性を維持することを約束していません。

## その他の言語機能 {id="other-language-features"}

### 型エイリアス {id="type-aliases"}

型エイリアス (type alias) を使用すると、既存の型に別の名前を定義できます。これは、コレクションのようなジェネリック型や関数型に最も役立ちます。例を次に示します：

```kotlin
//sampleStart
typealias OscarWinners = Map<String, String>

fun countLaLaLand(oscarWinners: OscarWinners) =
        oscarWinners.count { it.value.contains("La La Land") }

// 型名（元の型と型エイリアス）が交換可能であることに注意してください：
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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

詳細については、[型エイリアスのドキュメント](type-aliases.md)および [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/type-aliases.md) を参照してください。

### 束縛リファレンス {id="bound-callable-references"}

`::` 演算子を使用して、特定のオブジェクトインスタンスのメソッドやプロパティを指す [メンバリファレンス](reflection.md#function-references) (member reference) を取得できるようになりました。以前は、これはラムダでしか表現できませんでした。例を次に示します：

```kotlin
//sampleStart
val numberRegex = "\\d+".toRegex()
val numbers = listOf("abc", "123", "456").filter(numberRegex::matches)
//sampleEnd

fun main(args: Array<String>) {
    println("Result is $numbers")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

詳細については、[ドキュメント](reflection.md)および [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/bound-callable-references.md) を参照してください。

### シールドクラスとデータクラス {id="sealed-and-data-classes"}

Kotlin 1.1 では、Kotlin 1.0 にあったシールドクラスとデータクラスに関するいくつかの制限が解除されました。トップレベルのシールドクラスのサブクラスを、シールドクラスのネストされたクラスとしてだけでなく、同じファイル内のトップレベルで定義できるようになりました。また、データクラスが他のクラスを継承できるようになりました。これを使用して、式クラスの階層をきれいかつ簡潔に定義できます。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

詳細については、[シールドクラスのドキュメント](sealed-classes.md)、または [シールドクラス](https://github.com/Kotlin/KEEP/blob/master/proposals/sealed-class-inheritance.md) と [データクラス](https://github.com/Kotlin/KEEP/blob/master/proposals/data-class-inheritance.md) に関する KEEP を参照してください。

### ラムダでの分解宣言 {id="destructuring-in-lambdas"}

ラムダに渡された引数をアンパックするために、[分解宣言 (destructuring declaration)](destructuring-declarations.md) の構文を使用できるようになりました。例を次に示します：

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val map = mapOf(1 to "one", 2 to "two")
    // 以前
    println(map.mapValues { entry ->
      val (key, value) = entry
      "$key -> $value!"
    })
    // 現在
    println(map.mapValues { (key, value) -> "$key -> $value!" })
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

詳細については、[分解宣言のドキュメント](destructuring-declarations.md)および [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/destructuring-in-parameters.md) を参照してください。

### 未使用パラメータのアンダースコア {id="underscores-for-unused-parameters"}

複数のパラメータを持つラムダの場合、使用しないパラメータの名前を `_` 文字に置き換えることができます：

```kotlin
fun main(args: Array<String>) {
    val map = mapOf(1 to "one", 2 to "two")

//sampleStart
    map.forEach { _, value -> println("$value!") }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

これは [分解宣言](destructuring-declarations.md) でも機能します：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

詳細については、[KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/underscore-for-unused-parameters.md) を参照してください。

### 数値リテラルのアンダースコア {id="underscores-in-numeric-literals"}

Java 8 と同様に、Kotlin でも数値リテラル内でアンダースコアを使用して桁のグループを区切ることができるようになりました。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

詳細については、[KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/underscores-in-numeric-literals.md) を参照してください。

### プロパティの短縮構文 {id="shorter-syntax-for-properties"}

ゲッターが式本体として定義されているプロパティの場合、プロパティの型を省略できるようになりました：

```kotlin
//sampleStart
    data class Person(val name: String, val age: Int) {
    val isAdult get() = age >= 20 // プロパティの型は 'Boolean' と推論されます
}
//sampleEnd
fun main(args: Array<String>) {
    val akari = Person("Akari", 26)
    println("$akari.isAdult = ${akari.isAdult}")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### インラインプロパティアクセサ {id="inline-property-accessors"}

プロパティにバッキングフィールド (backing field) がない場合、プロパティアクセサを `inline` 修飾子でマークできるようになりました。このようなアクセサは、[インライン関数](inline-functions.md)と同じ方法でコンパイルされます。

```kotlin
//sampleStart
public val <T> List<T>.lastIndex: Int
    inline get() = this.size - 1
//sampleEnd

fun main(args: Array<String>) {
    val list = listOf('a', 'b')
    // ゲッターがインライン化されます
    println("Last index of $list is ${list.lastIndex}")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

プロパティ全体を `inline` としてマークすることもできます。その場合、修飾子は両方のアクセサに適用されます。

詳細については、[インライン関数のドキュメント](inline-functions.md#inline-properties)および [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/inline-properties.md) を参照してください。

### ローカル委譲プロパティ {id="local-delegated-properties"}

ローカル変数で [委譲プロパティ (delegated property)](delegated-properties.md) 構文を使用できるようになりました。考えられる用途の 1 つは、遅延評価されるローカル変数の定義です。

```kotlin
import java.util.Random

fun needAnswer() = Random().nextBoolean()

fun main(args: Array<String>) {
//sampleStart
    val answer by lazy {
        println("Calculating the answer...")
        42
    }
    if (needAnswer()) {                     // ランダムな値を返します
        println("The answer is $answer.")   // この時点で answer が計算されます
    }
    else {
        println("Sometimes no answer is the answer...")
    }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

詳細については、[KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/local-delegated-properties.md) を参照してください。

### 委譲プロパティ束縛のインターセプト {id="interception-of-delegated-property-binding"}

[委譲プロパティ](delegated-properties.md) について、`provideDelegate` 演算子を使用して、デリゲートからプロパティへの束縛をインターセプトできるようになりました。
たとえば、束縛前にプロパティ名をチェックしたい場合は、次のように記述できます。

```kotlin
class ResourceLoader<T>(id: ResourceID<T>) {
    operator fun provideDelegate(thisRef: MyUI, prop: KProperty<*>): ReadOnlyProperty<MyUI, T> {
        checkProperty(thisRef, prop.name)
        ... // プロパティの作成
    }

    private fun checkProperty(thisRef: MyUI, name: String) { ... }
}

fun <T> bindResource(id: ResourceID<T>): ResourceLoader<T> { ... }

class MyUI {
    val image by bindResource(ResourceID.image_id)
    val text by bindResource(ResourceID.text_id)
}
```

`provideDelegate` メソッドは `MyUI` インスタンスの作成中に各プロパティに対して呼び出され、必要な検証をすぐに行うことができます。

詳細については、[委譲プロパティのドキュメント](delegated-properties.md)を参照してください。

### ジェネリックな列挙型値へのアクセス {id="generic-enum-value-access"}

列挙型クラスの値をジェネリックな方法で列挙できるようになりました。

```kotlin
//sampleStart
enum class RGB { RED, GREEN, BLUE }

inline fun <reified T : Enum<T>> printAllValues() {
    print(enumValues<T>().joinToString { it.name })
}
//sampleEnd

fun main(args: Array<String>) {
    printAllValues<RGB>() // RED, GREEN, BLUE とプリントされます
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### DSL における暗黙的レシーバーのスコープ制御 {id="scope-control-for-implicit-receivers-in-dsls"}

[`@DslMarker`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-dsl-marker/index.html) アノテーションを使用すると、DSL コンテキストにおいて外部スコープからのレシーバーの使用を制限できます。
標準的な [HTML ビルダーの例](type-safe-builders.md)を考えてみましょう。

```kotlin
table {
    tr {
        td { + "Text" }
    }
}
```

Kotlin 1.0 では、`td` に渡されるラムダ内のコードは、`table`、`tr`、および `td` に渡される 3 つの暗黙的レシーバーにアクセスできます。これにより、コンテキストにおいて意味をなさないメソッドを呼び出すことができてしまいます。たとえば、`td` 内で `tr` を呼び出し、`<td>` 内に `<tr>` タグを配置することなどが可能です。

Kotlin 1.1 ではこれを制限できるため、`td` に渡されるラムダ内では `td` の暗黙的レシーバーに定義されたメソッドのみが利用可能になります。これは、`@DslMarker` メタアノテーションでマークされた独自のアノテーションを定義し、それをタグクラスのベースクラスに適用することで行います。

詳細については、[型安全ビルダーのドキュメント](type-safe-builders.md)および [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/scope-control-for-implicit-receivers.md) を参照してください。

### rem 演算子 {id="rem-operator"}

`mod` 演算子が非推奨となり、代わりに `rem` が使用されるようになりました。その理由については [この Issue](https://youtrack.jetbrains.com/issue/KT-14650) を参照してください。

## 標準ライブラリ {id="standard-library"}

### 文字列から数値への変換 {id="string-to-number-conversions"}

String クラスに、無効な数値に対して例外をスローせずに数値に変換するための新しい拡張機能が多数追加されました：
`String.toIntOrNull(): Int?`、`String.toDoubleOrNull(): Double?` など。

```kotlin
val port = System.getenv("PORT")?.toIntOrNull() ?: 80
```

また、`Int.toString()`、`String.toInt()`、`String.toIntOrNull()` などの整数変換関数には、変換の基数（2 から 36）を指定できる `radix` パラメータを持つオーバーロードが追加されました。

### onEach() {id="oneach"}

`onEach` はコレクションやシーケンスのための、小さくても便利な拡張関数です。一連の操作の中で、コレクション/シーケンスの各要素に対して副作用のあるアクションなどを実行できます。
Iterable では `forEach` のように動作しますが、Iterable インスタンス自体も返します。シーケンスでは、要素が反復処理される際に指定されたアクションを遅延適用する、ラッピングされたシーケンスを返します。

```kotlin
inputDir.walk()
        .filter { it.isFile && it.name.endsWith(".txt") }
        .onEach { println("Moving $it to $outputDir") }
        .forEach { moveFile(it, File(outputDir, it.toRelativeString(inputDir))) }
```

### also(), takeIf(), および takeUnless() {id="also-takeif-and-takeunless"}

これらは、あらゆるレシーバーに適用可能な 3 つの汎用拡張関数です。

`also` は `apply` に似ています。レシーバーを受け取り、それに対してアクションを実行し、そのレシーバーを返します。
違いは、`apply` 内のブロックではレシーバーは `this` として利用可能ですが、`also` 内のブロックでは `it` として利用可能である点です（必要に応じて別の名前を付けることもできます）。
これは、外部スコープの `this` をシャドウイングしたくない場合に便利です：

```kotlin
class Block {
    lateinit var content: String
}

//sampleStart
fun Block.copy() = Block().also {
    it.content = this.content
}
//sampleEnd

// 代わりに 'apply' を使用する場合
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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

`takeIf` は単一の値に対する `filter` のようなものです。レシーバーが述語を満たすかどうかをチェックし、満たす場合はレシーバーを返し、満たさない場合は `null` を返します。
エルビス演算子 (?:) や早期リターンと組み合わせることで、次のような構文を書くことができます：

```kotlin
val outDirFile = File(outputDir.path).takeIf { it.exists() } ?: return false
// 存在する outDirFile を使用して何かを行う
```

```kotlin
fun main(args: Array<String>) {
    val input = "Kotlin"
    val keyword = "in"

//sampleStart
    val index = input.indexOf(keyword).takeIf { it >= 0 } ?: error("keyword not found")
    // 見つかった場合、入力文字列内のキーワードのインデックスを使用して何かを行う
//sampleEnd
    
    println("'$keyword' was found in '$input'")
    println(input)
    println(" ".repeat(index) + "^")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

`takeUnless` は `takeIf` と同じですが、反転した述語を取ります。述語を *満たさない* 場合にレシーバーを返し、そうでない場合は `null` を返します。そのため、上記の例の 1 つは `takeUnless` を使用して次のように書き換えることができます：

```kotlin
val index = input.indexOf(keyword).takeUnless { it < 0 } ?: error("keyword not found")
```

ラムダの代わりに呼び出し可能リファレンスがある場合にも便利です。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### groupingBy() {id="groupingby"}

この API は、コレクションをキーでグループ化し、各グループを同時にフォールド (fold) するために使用できます。たとえば、各文字で始まる単語の数をカウントするために使用できます。

```kotlin
fun main(args: Array<String>) {
    val words = "one two three four five six seven eight nine ten".split(' ')
//sampleStart
    val frequencies = words.groupingBy { it.first() }.eachCount()
//sampleEnd
    println("Counting first letters: $frequencies.")

    // 'groupBy' と 'mapValues' を使用する代替の方法では中間マップが作成されますが、
    // 'groupingBy' の方法ではオンザフライでカウントされます。
    val groupBy = words.groupBy { it.first() }.mapValues { (_, list) -> list.size }
    println("Comparing the result with using 'groupBy': ${groupBy == frequencies}.")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### Map.toMap() および Map.toMutableMap() {id="map-tomap-and-map-tomutablemap"}

これらの関数は、マップの簡単なコピーに使用できます：

```kotlin
class ImmutablePropertyBag(map: Map<String, Any>) {
    private val mapCopy = map.toMap()
}
```

### Map.minus(key) {id="map-minus-key"}

演算子 `plus` は、読み取り専用マップにキーと値のペアを追加して新しいマップを作成する方法を提供しますが、その逆を行う簡単な方法はありませんでした。マップからキーを削除するには、`Map.filter()` や `Map.filterKeys()` のような、あまり直感的ではない方法に頼る必要がありました。
現在では演算子 `minus` がこのギャップを埋めています。単一のキー、キーのコレクション、キーのシーケンス、およびキーの配列を削除するための 4 つのオーバーロードが用意されています。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### minOf() and maxOf() {id="minof-and-maxof"}

これらの関数は、与えられた 2 つまたは 3 つの値のうち最小および最大のものを探すために使用できます。値はプリミティブな数値、または `Comparable` オブジェクトです。自身が Comparable ではないオブジェクトを比較したい場合のために、追加の `Comparator` インスタンスを受け取る各関数のオーバーロードも用意されています。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 配列ライクな List インスタンス生成関数 {id="array-like-list-instantiation-functions"}

`Array` コンストラクタと同様に、`List` および `MutableList` インスタンスを作成し、ラムダを呼び出すことで各要素を初期化する関数が追加されました。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### Map.getValue() {id="map-getvalue"}

`Map` に対するこの拡張機能は、指定されたキーに対応する既存の値を返します。キーが見つからない場合は、どのキーが見つからなかったかを明記した例外をスローします。
マップが `withDefault` で生成された場合、この関数は例外をスローする代わりにデフォルト値を返します。

```kotlin
fun main(args: Array<String>) {
//sampleStart    
    val map = mapOf("key" to 42)
    // null 非許容の Int 値 42 を返します
    val value: Int = map.getValue("key")

    val mapWithDefault = map.withDefault { k -> k.length }
    // 4 を返します
    val value2 = mapWithDefault.getValue("key2")

    // map.getValue("anotherKey") // <- これは NoSuchElementException をスローします
//sampleEnd
    
    println("value is $value")
    println("value2 is $value2")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 抽象コレクション {id="abstract-collections"}

これらの抽象クラスは、Kotlin コレクションクラスを実装する際のベースクラスとして使用できます。
読み取り専用コレクションの実装には `AbstractCollection`、`AbstractList`、`AbstractSet`、`AbstractMap` があり、ミュータブル（可変）コレクションには `AbstractMutableCollection`、`AbstractMutableList`、`AbstractMutableSet`、`AbstractMutableMap` があります。
JVM では、これらの抽象ミュータブルコレクションはその機能のほとんどを JDK の抽象コレクションから継承しています。

### 配列操作関数 {id="array-manipulation-functions"}

標準ライブラリに、配列に対する要素ごとの操作を行うための一連の関数が提供されるようになりました。比較（`contentEquals` および `contentDeepEquals`）、ハッシュコードの計算（`contentHashCode` および `contentDeepHashCode`）、および文字列への変換（`contentToString` および `contentDeepToString`）です。これらは JVM（`java.util.Arrays` の対応する関数のエイリアスとして機能）と JS（Kotlin 標準ライブラリに実装が提供）の両方でサポートされています。

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val array = arrayOf("a", "b", "c")
    println(array.toString())  // JVM 実装: 型とハッシュの意味不明な文字列
    println(array.contentToString())  // リストとして綺麗にフォーマットされます
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## JVM バックエンド {id="jvm-backend"}

### Java 8 バイトコードのサポート {id="java-8-bytecode-support"}

Kotlin で Java 8 バイトコードを生成するオプションが追加されました（`-jvm-target 1.8` コマンドラインオプション、または Maven/Gradle の対応するオプション）。現時点では、これによりバイトコードのセマンティクスが変わることはありません（特に、インターフェースのデフォルトメソッドやラムダは Kotlin 1.0 とまったく同じように生成されます）が、将来的にはこれをさらに活用する予定です。

### Java 8 標準ライブラリのサポート {id="java-8-standard-library-support"}

Java 7 および 8 で追加された新しい JDK API をサポートする標準ライブラリの個別バージョンが用意されました。
新しい API へのアクセスが必要な場合は、標準の `kotlin-stdlib` の代わりに、`kotlin-stdlib-jre7` および `kotlin-stdlib-jre8` という maven アーティファクトを使用してください。
これらのアーティファクトは `kotlin-stdlib` 上の小さな拡張であり、推移的依存関係としてプロジェクトに `kotlin-stdlib` を取り込みます。

### バイトコード内のパラメータ名 {id="parameter-names-in-the-bytecode"}

Kotlin でバイトコード内にパラメータ名を保存できるようになりました。これは `-java-parameters` コマンドラインオプションを使用して有効にできます。

### 定数のインライン化 {id="constant-inlining"}

コンパイラは、`const val` プロパティの値を、それらが使用されている場所にインライン化するようになりました。

### 可変なクロージャ変数 {id="mutable-closure-variables"}

ラムダ内で可変なクロージャ変数をキャプチャするために使用されるボックスクラスに、volatile フィールドがなくなりました。この変更によりパフォーマンスが向上しますが、まれな使用シナリオにおいて新しい競合状態が発生する可能性があります。この影響を受ける場合は、変数へのアクセスに対して独自の同期を提供する必要があります。

### javax.script のサポート {id="javax-script-support"}

Kotlin が [javax.script API](https://docs.oracle.com/javase/8/docs/api/javax/script/package-summary.html) (JSR-223) と統合されました。この API により、実行時にコードスニペットを評価できます：

```kotlin
val engine = ScriptEngineManager().getEngineByExtension("kts")!!
engine.eval("val x = 3")
println(engine.eval("x + 2"))  // 5 と出力されます
```

この API を使用したより大きなサンプルプロジェクトについては、[こちら](https://github.com/JetBrains/kotlin/tree/1.1.0/libraries/examples/kotlin-jsr223-local-example)を参照してください。

### kotlin.reflect.full {id="kotlin-reflect-full"}

[Java 9 サポートの準備](https://blog.jetbrains.com/kotlin/2017/01/kotlin-1-1-whats-coming-in-the-standard-library/)として、`kotlin-reflect.jar` ライブラリ内の拡張関数とプロパティが `kotlin.reflect.full` パッケージに移動されました。古いパッケージ (`kotlin.reflect`) の名前は非推奨となり、Kotlin 1.2 で削除される予定です。コアのリフレクションインターフェース（`KClass` など）は `kotlin-reflect` ではなく Kotlin 標準ライブラリの一部であり、この移動の影響を受けないことに注意してください。

## JavaScript バックエンド {id="javascript-backend"}

### 統合された標準ライブラリ {id="unified-standard-library"}

Kotlin 標準ライブラリのより多くの部分が、JavaScript にコンパイルされたコードから使用できるようになりました。
特に、コレクション (`ArrayList`, `HashMap` など)、例外 (`IllegalArgumentException` など)、およびその他のいくつか (`StringBuilder`, `Comparator`) の主要なクラスが `kotlin` パッケージの下に定義されるようになりました。JVM では、これらの名前は対応する JDK クラスの型エイリアスであり、JS ではこれらのクラスは Kotlin 標準ライブラリに実装されています。

### より優れたコード生成 {id="better-code-generation"}

JavaScript バックエンドが、より静的にチェック可能なコードを生成するようになりました。これにより、ミニファイア (minifiers)、オプティマイザ (optimisers)、リンター (linters) などの JS コード処理ツールとの親和性が高まりました。

### external 修飾子 {id="the-external-modifier"}

JavaScript で実装されたクラスに Kotlin から型安全な方法でアクセスする必要がある場合、`external` 修飾子を使用して Kotlin 宣言を記述できます。（Kotlin 1.0 では、代わりに `@native` アノテーションが使用されていました。）
JVM ターゲットとは異なり、JS ターゲットではクラスやプロパティに external 修飾子を使用できます。
たとえば、DOM の `Node` クラスを宣言する方法は次のとおりです：

```kotlin
external class Node {
    val firstChild: Node

    fun appendChild(child: Node): Node

    fun removeChild(child: Node): Node

    // その他
}
```

### インポート処理の改善 {id="improved-import-handling"}

JavaScript モジュールからインポートすべき宣言をより正確に記述できるようになりました。
外部宣言に `@JsModule("<module-name>")` アノテーションを追加すると、コンパイル中にモジュールシステム（CommonJS または AMD のいずれか）に適切にインポートされます。たとえば CommonJS では、宣言は `require(...)` 関数を介してインポートされます。
さらに、宣言をモジュールとしてインポートするか、グローバル JavaScript オブジェクトとしてインポートするかを選択できるようにしたい場合は、`@JsNonModule` アノテーションを使用できます。

たとえば、JQuery を Kotlin モジュールにインポートする方法は次のとおりです：

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

この場合、JQuery は `jquery` という名前のモジュールとしてインポートされます。あるいは、Kotlin コンパイラがどのモジュールシステムを使用するように設定されているかに応じて、$-オブジェクトとして使用することもできます。

これらの宣言をアプリケーションで次のように使用できます：

```kotlin
fun main(args: Array<String>) {
    jquery(".toggle-button").click {
        jquery(".toggle-panel").toggle(300)
    }
}
```
