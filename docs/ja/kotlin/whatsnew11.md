[//]: # (title: Kotlin 1.1 の新機能)

<web-summary>新しい言語機能、Kotlin/JVM および JS へのアップデート、Gradle および Maven のビルドツールサポートを網羅した Kotlin 1.1 リリースノートをご覧ください。</web-summary>

_リリース日: 2017年2月15日_

## 目次 {id="table-of-contents"}

* [コルーチン](#coroutines-experimental)
* [その他の言語機能](#other-language-features)
* [標準ライブラリ](#standard-library)
* [JVM バックエンド](#jvm-backend)
* [JavaScript バックエンド](#javascript-backend)

> Kotlinのリリースサイクルに関する情報は、[Kotlinのリリースプロセス](releases.md)を参照してください。
>
{style="tip"}

## JavaScript {id="javascript"}

Kotlin 1.1 より、JavaScript ターゲットは実験的（experimental）と見なされなくなりました。すべての言語機能がサポートされ、フロントエンド開発環境と統合するための新しいツールが多数追加されました。変更点の詳細なリストについては、[以下](#javascript-backend)を参照してください。

## コルーチン（実験的） {id="coroutines-experimental"}

Kotlin 1.1 の主要な新機能は*コルーチン*であり、`async`/`await`、`yield`、および類似のプログラミングパターンのサポートをもたらします。Kotlin の設計における大きな特徴は、コルーチンの実行実装が言語自体ではなくライブラリの一部として提供されている点です。そのため、特定のプログラミングパラダイムや並行処理ライブラリに縛られることがありません。

コルーチンは実質的に、中断（suspend）して後から再開（resume）できる軽量スレッドです。
コルーチンは *[サスペンディング関数 (suspending functions)](coroutines-basics.md)* を通じてサポートされます。
このような関数の呼び出しはコルーチンを中断する可能性があり、新しいコルーチンを開始するには通常、無名のサスペンディング関数（すなわちサスペンディングラムダ）を使用します。

外部ライブラリである [kotlinx.coroutines](https://github.com/kotlin/kotlinx.coroutines) で実装されている `async`/`await` を見てみましょう：

```kotlin
// バックグラウンドのスレッドプールでコードを実行する
fun asyncOverlay() = async(CommonPool) {
    // 2つの非同期操作を開始する
    val original = asyncLoadImage("original")
    val overlay = asyncLoadImage("overlay")
    // そして両方の結果にオーバーレイを適用する
    applyOverlay(original.await(), overlay.await())
}

// UI コンテキストで新しいコルーチンを起動する
launch(UI) {
    // 非同期オーバーレイの完了を待機する
    val image = asyncOverlay().await()
    // そしてUIに表示する
    showImage(image)
}
```

ここでは、`async { ... }` がコルーチンを開始し、`await()` を使用すると、待機対象の操作が実行されている間コルーチンの実行が中断され、待機対象の操作が完了すると（場合によっては別のスレッドで）再開されます。

標準ライブラリでは、`yield` 関数および `yieldAll` 関数による*遅延生成シーケンス (lazily generated sequences)* をサポートするためにコルーチンを使用しています。
このようなシーケンスでは、シーケンスの要素を返すコードブロックは各要素が取得された後に中断され、次の要素が要求されたときに再開されます。以下に例を示します：

```kotlin
import kotlin.coroutines.experimental.*

fun main(args: Array<String>) {
    val seq = buildSequence {
      for (i in 1..5) {
          // i の2乗を yield する
          yield(i * i)
      }
      // 範囲を yield する
      yieldAll(26..28)
    }

    // シーケンスを出力する
    println(seq.toList())
}
```

上記のコードを実行して結果を確認してみてください。自由に編集して再度実行することもできます！

詳細については、[コルーチンのドキュメント](coroutines-overview.md)および[チュートリアル](coroutines-and-channels.md)を参照してください。

コルーチンは現在**実験的機能**とみなされており、Kotlin チームは 1.1 の正式リリース以降におけるこの機能の後方互換性を保証していない点にご注意ください。

## その他の言語機能 {id="other-language-features"}

### 型エイリアス（Type aliases） {id="type-aliases"}

型エイリアスを使用すると、既存の型に対して別名を定義できます。
これは、コレクションのようなジェネリック型や関数型に対して特に役立ちます。
以下に例を示します：

```kotlin
//sampleStart
typealias OscarWinners = Map<String, String>

fun countLaLaLand(oscarWinners: OscarWinners) =
        oscarWinners.count { it.value.contains("La La Land") }

// 元の型名と型エイリアスは相互に置き換え可能である点に注意してください：
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

### バインドされた呼び出し可能参照（Bound callable references） {id="bound-callable-references"}

特定のオブジェクトインスタンスのメソッドやプロパティを指す[メンバー参照](lambdas.md#function-references)を取得するために、`::` 演算子が使用できるようになりました。以前はこれを表現するにはラムダを使用するしかありませんでした。
以下に例を示します：

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

### sealed クラスとデータクラス {id="sealed-and-data-classes"}

Kotlin 1.1 では、Kotlin 1.0 に存在していた sealed クラスとデータクラスに関するいくつかの制限が緩和されました。
トップレベルの sealed クラスのサブクラスを、sealed クラスのネストされたクラスとしてだけでなく、同じファイルのトップレベルで定義できるようになりました。
また、データクラスが他のクラスを継承できるようになりました。
これを利用して、式のクラス階層を綺麗かつ明確に定義できます：

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

詳細については、[sealed クラスのドキュメント](sealed-classes.md)、または [sealed class](https://github.com/Kotlin/KEEP/blob/master/proposals/sealed-class-inheritance.md) と [data class](https://github.com/Kotlin/KEEP/blob/master/proposals/data-class-inheritance.md) に関する KEEP を参照してください。

### ラムダでの分解宣言（Destructuring in lambdas） {id="destructuring-in-lambdas"}

ラムダに渡された引数をアンパックするために、[分解宣言](destructuring-declarations.md)の構文が使用できるようになりました。
以下に例を示します：

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val map = mapOf(1 to "one", 2 to "two")
    // 従来
    println(map.mapValues { entry ->
      val (key, value) = entry
      "$key -> $value!"
    })
    // 1.1 以降
    println(map.mapValues { (key, value) -> "$key -> $value!" })
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

詳細については、[分解宣言のドキュメント](destructuring-declarations.md)および [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/destructuring-in-parameters.md) を参照してください。

### 未使用パラメータに対するアンダースコア {id="underscores-for-unused-parameters"}

複数のパラメータを持つラムダで、使用しないパラメータの名前を `_` 文字に置き換えることができます：

```kotlin
fun main(args: Array<String>) {
    val map = mapOf(1 to "one", 2 to "two")

//sampleStart
    map.forEach { _, value -> println("$value!") }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

これは[分解宣言](destructuring-declarations.md)でも機能します：

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

### 数値リテラル内のアンダースコア {id="underscores-in-numeric-literals"}

Java 8 と同様に、Kotlin でも桁区切りとして数値リテラル内でアンダースコアを使用できるようになりました：

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

### プロパティのより短い構文 {id="shorter-syntax-for-properties"}

ゲッターが式形式の本体（expression body）で定義されているプロパティでは、プロパティの型を省略できるようになりました：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### インラインプロパティアクセサ {id="inline-property-accessors"}

バッキングフィールドを持たないプロパティの場合、プロパティアクセサに `inline` 修飾子を付けられるようになりました。
このようなアクセサは、[インライン関数](inline-functions.md)と同じようにコンパイルされます。

```kotlin
//sampleStart
public val <T> List<T>.lastIndex: Int
    inline get() = this.size - 1
//sampleEnd

fun main(args: Array<String>) {
    val list = listOf('a', 'b')
    // ゲッターはインライン展開されます
    println("Last index of $list is ${list.lastIndex}")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

プロパティ全体を `inline` としてマークすることもできます。その場合、修飾子は両方のアクセサに適用されます。

詳細については、[インライン関数のドキュメント](inline-functions.md#inline-properties)および [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/inline-properties.md) を参照してください。

### ローカルデリゲートプロパティ {id="local-delegated-properties"}

ローカル変数で[委譲プロパティ (delegated property)](delegated-properties.md)の構文を使用できるようになりました。
用途の1つとして、遅延評価されるローカル変数の定義が挙げられます：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

詳細については、[KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/local-delegated-properties.md) を参照してください。

### 委譲プロパティバインディングのインターセプト {id="interception-of-delegated-property-binding"}

[委譲プロパティ](delegated-properties.md)において、`provideDelegate` 演算子を使用してデリゲートとプロパティのバインディングをインターセプトできるようになりました。
例えば、バインドする前にプロパティ名をチェックしたい場合、以下のように記述できます：

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

`MyUI` インスタンスの作成時に各プロパティに対して `provideDelegate` メソッドが呼び出され、必要な検証をその場で実行できます。

詳細については、[委譲プロパティのドキュメント](delegated-properties.md)を参照してください。

### ジェネリックな enum 値へのアクセス {id="generic-enum-value-access"}

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### DSL における暗黙のレシーバのスコープ制御 {id="scope-control-for-implicit-receivers-in-dsls"}

[`@DslMarker`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-dsl-marker/index.html) アノテーションにより、DSL コンテキストで外部スコープからのレシーバの使用を制限できます。
代表的な [HTML ビルダーの例](type-safe-builders.md)を考えてみましょう：

```kotlin
table {
    tr {
        td { + "Text" }
    }
}
```

Kotlin 1.0 では、`td` に渡されたラムダ内のコードから、`table`、`tr`、`td` に渡された3つの暗黙のレシーバすべてにアクセスできました。これにより、そのコンテキストでは意味をなさないメソッド（例えば `td` 内で `tr` を呼び出して `<td>` の中に `<tr>` タグを配置するなど）の呼び出しが可能になっていました。

Kotlin 1.1 ではこれを制限できるため、`td` に渡されたラムダ内では、`td` の暗黙のレシーバで定義されたメソッドのみが利用可能になります。これを行うには、`@DslMarker` メタアノテーションでマークされた独自のアノテーションを定義し、それをタグクラスのベースクラスに適用します。

詳細については、[型安全ビルダーのドキュメント](type-safe-builders.md)および [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/scope-control-for-implicit-receivers.md) を参照してください。

### rem 演算子 {id="rem-operator"}

`mod` 演算子は非推奨（deprecated）となり、代わりに `rem` が使用されるようになりました。この動機については[こちらの課題](https://youtrack.jetbrains.com/issue/KT-14650)を参照してください。

## 標準ライブラリ {id="standard-library"}

### 文字列から数値への変換 {id="string-to-number-conversions"}

String クラスに、無効な数値に対して例外をスローせずに数値へ変換する新しい拡張関数が多数追加されました：
`String.toIntOrNull(): Int?`、`String.toDoubleOrNull(): Double?` など。

```kotlin
val port = System.getenv("PORT")?.toIntOrNull() ?: 80
```

また、`Int.toString()`、`String.toInt()`、`String.toIntOrNull()` などの整数変換関数には、基数を指定できる `radix` パラメータを持つオーバーロード（2から36まで）が追加されました。

### onEach() {id="oneach"}

`onEach` は、コレクションやシーケンスに対する小さくても便利な拡張関数であり、一連の操作チェーンの中で各要素に対して（副作用を伴う可能性のある）処理を実行できるようにします。
iterable では `forEach` のように動作しますが、その iterable インスタンス自身を後続の処理に返します。シーケンスでは、要素が反復処理される際に指定されたアクションを遅延適用するラッパーシーケンスを返します。

```kotlin
inputDir.walk()
        .filter { it.isFile && it.name.endsWith(".txt") }
        .onEach { println("Moving $it to $outputDir") }
        .forEach { moveFile(it, File(outputDir, it.toRelativeString(inputDir))) }
```

### also()、takeIf()、および takeUnless() {id="also-takeif-and-takeunless"}

これらは、任意のレシーバに適用できる3つの汎用拡張関数です。
 
`also` は `apply` に似ています。レシーバを受け取り、それに対して何らかのアクションを実行し、そのレシーバを返します。
違いは、`apply` 内のブロックではレシーバが `this` として利用可能であるのに対し、`also` 内のブロックでは `it` として利用可能である点です（必要に応じて別の名前を付けることもできます）。
これは、外側のスコープの `this` をシャドウイング（隠蔽）したくない場合に便利です：

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

`takeIf` は単一の値に対する `filter` のようなものです。レシーバが述語（predicate）を満たしているかどうかをチェックし、満たしていればそのレシーバを、満たしていなければ `null` を返します。
エルビス演算子（?:）や早期リターンと組み合わせることで、以下のような構文を書くことができます：

```kotlin
val outDirFile = File(outputDir.path).takeIf { it.exists() } ?: return false
// 既存の outDirFile を使って何かを行う
```

```kotlin
fun main(args: Array<String>) {
    val input = "Kotlin"
    val keyword = "in"

//sampleStart
    val index = input.indexOf(keyword).takeIf { it >= 0 } ?: error("keyword not found")
    // 入力文字列内にキーワードが見つかったとして、その index を使って何かを行う
//sampleEnd
    
    println("'$keyword' was found in '$input'")
    println(input)
    println(" ".repeat(index) + "^")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

`takeUnless` は `takeIf` と同じですが、述語が反転します。述語を_満たさない_場合にレシーバを返し、そうでない場合は `null` を返します。したがって、上記の例の1つは `takeUnless` を使用して次のように書き直すことができます：

```kotlin
val index = input.indexOf(keyword).takeUnless { it < 0 } ?: error("keyword not found")
```

また、ラムダの代わりに呼び出し可能参照がある場合にも便利に使用できます：

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

この API は、コレクションをキーでグループ化し、各グループを同時に畳み込む（fold する）ために使用できます。例えば、各文字で始まる単語の数を数えるのに使用できます：

```kotlin
fun main(args: Array<String>) {
    val words = "one two three four five six seven eight nine ten".split(' ')
//sampleStart
    val frequencies = words.groupingBy { it.first() }.eachCount()
//sampleEnd
    println("Counting first letters: $frequencies.")

    // 'groupBy' と 'mapValues' を使用する別のアプローチでは中間マップが作成されますが、
    // 'groupingBy' のアプローチではその場でカウントされます。
    val groupBy = words.groupBy { it.first() }.mapValues { (_, list) -> list.size }
    println("Comparing the result with using 'groupBy': ${groupBy == frequencies}.")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### Map.toMap() および Map.toMutableMap() {id="map-tomap-and-map-tomutablemap"}

これらの関数は、マップを簡単にコピーするために使用できます：

```kotlin
class ImmutablePropertyBag(map: Map<String, Any>) {
    private val mapCopy = map.toMap()
}
```

### Map.minus(key) {id="map-minus-key"}

`plus` 演算子は、読み取り専用マップにキーと値のペアを追加して新しいマップを生成する方法を提供しますが、逆の操作を行う簡単な方法はありませんでした。マップからキーを削除するには、`Map.filter()` や `Map.filterKeys()` のような直感的ではない方法に頼る必要がありました。
`minus` 演算子がこのギャップを埋めるようになりました。単一のキー、キーのコレクション、キーのシーケンス、およびキーの配列を削除するための4つのオーバーロードが利用可能です。

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

### minOf() および maxOf() {id="minof-and-maxof"}

これらの関数は、与えられた2つまたは3つの値の中で最小のものおよび最大のものを見つけるために使用できます。値はプリミティブな数値または `Comparable` オブジェクトです。自身が比較可能でないオブジェクトを比較したい場合のために、追加の `Comparator` インスタンスを受け取るオーバーロードも各関数に用意されています。

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

### 配列風の List 生成関数 {id="array-like-list-instantiation-functions"}

`Array` コンストラクタと同様に、`List` および `MutableList` のインスタンスを作成し、ラムダを呼び出して各要素を初期化する関数が追加されました：

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

この `Map` の拡張関数は、指定されたキーに対応する既存の値を返すか、どのキーが見つからなかったかを示す例外をスローします。
マップが `withDefault` で生成された場合、この関数は例外をスローする代わりにデフォルト値を返します。

```kotlin
fun main(args: Array<String>) {
//sampleStart    
    val map = mapOf("key" to 42)
    // null 非許容の Int 値 42 を返す
    val value: Int = map.getValue("key")

    val mapWithDefault = map.withDefault { k -> k.length }
    // 4 を返す
    val value2 = mapWithDefault.getValue("key2")

    // map.getValue("anotherKey") // <- これは NoSuchElementException をスローします
//sampleEnd
    
    println("value is $value")
    println("value2 is $value2")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 抽象コレクション（Abstract collections） {id="abstract-collections"}

これらの抽象クラスは、Kotlin コレクションクラスを実装する際のベースクラスとして使用できます。
読み取り専用コレクションの実装用には `AbstractCollection`、`AbstractList`、`AbstractSet`、`AbstractMap` があり、ミュータブルコレクション用には `AbstractMutableCollection`、`AbstractMutableList`、`AbstractMutableSet`、`AbstractMutableMap` があります。
JVM では、これらの抽象ミュータブルコレクションはその機能のほとんどを JDK の抽象コレクションから継承しています。

### 配列操作関数 {id="array-manipulation-functions"}

標準ライブラリに、配列に対する要素ごとの操作を行う関数群が提供されるようになりました：比較（`contentEquals` および `contentDeepEquals`）、ハッシュコードの計算（`contentHashCode` および `contentDeepHashCode`）、文字列への変換（`contentToString` および `contentDeepToString`）。これらは JVM（`java.util.Arrays` の対応する関数のエイリアスとして機能）と JS（Kotlin 標準ライブラリで実装を提供）の両方でサポートされています。

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val array = arrayOf("a", "b", "c")
    println(array.toString())  // JVM 実装: 型とハッシュの意味不明な文字列
    println(array.contentToString())  // リストとして綺麗にフォーマットされる
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## JVM バックエンド {id="jvm-backend"}

### Java 8 バイトコードのサポート {id="java-8-bytecode-support"}

Kotlin は Java 8 バイトコードを生成するオプション（`-jvm-target 1.8` コマンドラインオプションまたは Maven/Gradle の対応するオプション）を持つようになりました。現時点ではバイトコードのセマンティクスは変更されませんが（特に、インターフェースのデフォルトメソッドやラムダは Kotlin 1.0 とまったく同じように生成されます）、今後はこれをさらに活用していく予定です。

### Java 8 標準ライブラリのサポート {id="java-8-standard-library-support"}

Java 7 および 8 で追加された新しい JDK API をサポートする標準ライブラリの別バージョンが提供されるようになりました。
新しい API へのアクセスが必要な場合は、標準の `kotlin-stdlib` の代わりに `kotlin-stdlib-jre7` および `kotlin-stdlib-jre8` Maven アーティファクトを使用してください。
これらのアーティファクトは `kotlin-stdlib` の上にある小さな拡張であり、推移的依存関係として `kotlin-stdlib` をプロジェクトに取り込みます。

### バイトコード内のパラメータ名 {id="parameter-names-in-the-bytecode"}

Kotlin はバイトコード内にパラメータ名を格納することをサポートするようになりました。これは `-java-parameters` コマンドラインオプションを使用して有効にできます。

### 定数のインライン化 {id="constant-inlining"}

コンパイラは、`const val` プロパティの値をそれが使用されている場所にインライン化するようになりました。

### ミュータブルなクロージャ変数 {id="mutable-closure-variables"}

ラムダでミュータブルなクロージャ変数をキャプチャするために使用されるボックスクラスに、volatile フィールドが含まれなくなりました。この変更によりパフォーマンスが向上しますが、稀な使用シナリオで新たな競合状態が発生する可能性があります。この影響を受ける場合は、変数へのアクセスに対して独自の同期処理を提供する必要があります。

### javax.script のサポート {id="javax-script-support"}

Kotlin は [javax.script API](https://docs.oracle.com/javase/8/docs/api/javax/script/package-summary.html) (JSR-223) と統合されました。
この API を使用すると、実行時にコードスニペットを評価できます：

```kotlin
val engine = ScriptEngineManager().getEngineByExtension("kts")!!
engine.eval("val x = 3")
println(engine.eval("x + 2"))  // 5 を出力
```

この API を使用したより大きなサンプルプロジェクトについては、[こちら](https://github.com/JetBrains/kotlin/tree/1.1.0/libraries/examples/kotlin-jsr223-local-example)を参照してください。

### kotlin.reflect.full {id="kotlin-reflect-full"}

[Java 9 サポートへの準備](https://blog.jetbrains.com/kotlin/2017/01/kotlin-1-1-whats-coming-in-the-standard-library/)として、`kotlin-reflect.jar` ライブラリの拡張関数とプロパティは `kotlin.reflect.full` パッケージに移動されました。古いパッケージ（`kotlin.reflect`）内の名前は非推奨となり、Kotlin 1.2 で削除される予定です。コアのリフレクションインターフェース（`KClass` など）は `kotlin-reflect` ではなく Kotlin 標準ライブラリの一部であるため、この移動の影響を受けないことに注意してください。

## JavaScript バックエンド {id="javascript-backend"}

### 統合された標準ライブラリ {id="unified-standard-library"}

Kotlin 標準ライブラリのはるかに大きな部分が、JavaScript にコンパイルされるコードから使用できるようになりました。
特に、コレクション（`ArrayList`、`HashMap` など）、例外（`IllegalArgumentException` など）、その他いくつか（`StringBuilder`、`Comparator`）などの主要なクラスが `kotlin` パッケージ配下に定義されるようになりました。JVM ではこれらの名前は対応する JDK クラスの型エイリアスであり、JS ではこれらのクラスは Kotlin 標準ライブラリ内で実装されています。

### より優れたコード生成 {id="better-code-generation"}

JavaScript バックエンドは、より静的チェックが可能なコードを生成するようになり、minifier、optimizer、linter などの JS コード処理ツールとの親和性が向上しました。

### external 修飾子 {id="the-external-modifier"}

JavaScript で実装されたクラスに Kotlin から型安全にアクセスする必要がある場合は、`external` 修飾子を使用して Kotlin の宣言を記述できます（Kotlin 1.0 では、代わりに `@native` アノテーションが使用されていました）。
JVM ターゲットとは異なり、JS ターゲットではクラスやプロパティで external 修飾子を使用できます。
例えば、DOM の `Node` クラスは以下のように宣言できます：

```kotlin
external class Node {
    val firstChild: Node

    fun appendChild(child: Node): Node

    fun removeChild(child: Node): Node

    // その他
}
```

### インポート処理の改善 {id="improved-import-handling"}

JavaScript モジュールからインポートする必要がある宣言を、より正確に記述できるようになりました。
external 宣言に `@JsModule("<module-name>")` アノテーションを追加すると、コンパイル中にモジュールシステム（CommonJS または AMD）へ適切にインポートされます。例えば、CommonJS では宣言は `require(...)` 関数を介してインポートされます。
さらに、宣言をモジュールまたはグローバル JavaScript オブジェクトのいずれかとしてインポートしたい場合は、`@JsNonModule` アノテーションを使用できます。

例えば、以下のようにして jQuery を Kotlin モジュールにインポートできます：

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

この場合、jQuery は `jquery` という名前のモジュールとしてインポートされます。あるいは、Kotlin コンパイラが使用するように設定されているモジュールシステムに応じて、`$` オブジェクトとして使用することもできます。

アプリケーション内でこれらの宣言を次のように使用できます：

```kotlin
fun main(args: Array<String>) {
    jquery(".toggle-button").click {
        jquery(".toggle-panel").toggle(300)
    }
}
```