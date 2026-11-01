[//]: # (title: 関数)

Kotlin で関数を宣言するには:
* `fun` キーワードを使用します。
* 括弧 `()` 内にパラメータを指定します。
* 必要に応じて[戻り値の型](#return-types)を含めます。

例:

```kotlin
//sampleStart
// 'double' は関数名
// 'x' は Int 型のパラメータ
// 期待される戻り値も Int 型
fun double(x: Int): Int {
    return 2 * x
}
//sampleEnd

fun main() {
    println(double(5))
    // 10
}
```
{kotlin-runnable="true" validate="false" id="kotlin-function-double"}

## 関数の使用法 {id="function-usage"}

関数は標準的なアプローチで呼び出されます:

```kotlin
val result = double(2)
```

[メンバ関数](classes.md)や[拡張関数](extensions.md#extension-functions)を呼び出すには、ピリオド `.` を使用します:

```kotlin
// Stream クラスのインスタンスを作成し、read() を呼び出す
Stream().read()
```

### パラメータ {id="parameters"}

関数のパラメータはパスカル記法 `name: Type` で宣言します。
パラメータはカンマで区切る必要があり、各パラメータには明示的に型を指定しなければなりません:

```kotlin
fun powerOf(number: Int, exponent: Int): Int { /*...*/ }
```

オブジェクトを関数に渡すと、コンパイラはそのオブジェクトへの参照のコピーを渡します。
コピーされた参照は同じオブジェクトを指すため、関数はそのオブジェクトの変更可能な状態（mutable state）を変更できます。

関数のパラメータは関数本体の内部では読み取り専用（暗黙的に `val` として宣言）であるため、再代入することはできません:

```kotlin
class Counter(var value: Int)

fun reset(counter: Counter) {
    counter.value = 0    // 許可: オブジェクトを変更
    counter = Counter(0) // エラー: 'val' は再代入不可
}
```

関数パラメータを宣言する際、[末尾のカンマ](coding-conventions.md#trailing-commas)（trailing comma）を使用できます:

```kotlin
fun powerOf(
    number: Int,
    exponent: Int, // 末尾のカンマ
) { /*...*/ }
```

末尾のカンマはリファクタリングやコードの保守に役立ちます。
どのパラメータが最後になるかを気にすることなく、宣言内のパラメータを移動できます。

> Kotlin の関数は、他の関数をパラメータとして受け取ったり、引数として渡したりすることができます。
> 詳細については、[](lambdas.md) を参照してください。
> 
{style="note"}

### デフォルト値を持つパラメータ {id="parameters-with-default-values"}

関数のパラメータにデフォルト値を指定することで、そのパラメータをオプション（省略可能）にできます。
Kotlin は、そのパラメータに対応する引数を渡さずに関数を呼び出した場合、デフォルト値を使用します。
デフォルト値を持つパラメータは、_オプションパラメータ_（optional parameters）とも呼ばれます。

妥当なデフォルト値を持つパラメータをスキップできるようにするためだけに異なるバージョンの関数を宣言する必要がなくなるため、オプションパラメータは複数のオーバーロードの必要性を減らします。

パラメータ宣言に `=` を追加してデフォルト値を設定します:

```kotlin
fun read(
    b: ByteArray,
    // 'off' のデフォルト値は 0
    off: Int = 0,
    // 'len' のデフォルト値は
    // 'b' 配列のサイズとして計算される
    len: Int = b.size,
) { /*...*/ }
```

デフォルト値を持つパラメータを、デフォルト値を持たないパラメータの**前**に宣言した場合、[引数名を指定](#named-arguments)することによってのみデフォルト値を使用できます:

```kotlin
fun greeting(
    userId: Int = 0,
    message: String,
) { /*...*/ }

fun main() {
    // 'userId' のデフォルト値として 0 を使用
    greeting(message = "Hello!")
    
    // エラー: パラメータ 'message' に値が渡されていません
    greeting("Hello!")
}
```
{kotlin-runnable="true" validate="false" id="default-before-ordinary"}

[末尾のラムダ](lambdas.md#passing-trailing-lambdas)はこのルールの例外です。最後のパラメータは渡された関数に対応していなければならないためです:

```kotlin
fun main () {
//sampleStart    
fun greeting(
    userId: Int = 0,
    message: () -> Unit,
)
{ println(userId)
  message() }
    
// 'userId' のデフォルト値を使用
greeting() { println ("Hello!") }
// 0
// Hello!
//sampleEnd
}
```
{kotlin-runnable="true" id="default-before-trailing-lambda"}

[オーバーライドされたメソッド](inheritance.md#overriding-methods)は、常にベースメソッドのデフォルトパラメータ値を使用します。
デフォルトパラメータ値を持つメソッドをオーバーライドする場合、シグネチャからデフォルトパラメータ値を省略する必要があります:

```kotlin
open class Shape {
    open fun draw(width: Int = 10, height: Int = 5) { /*...*/ }
}

class Rectangle : Shape() {
    // ここでデフォルト値を指定することは許可されていませんが、
    // この関数もデフォルトで 'width' に 10 を、'height' に 5 を
    // 使用します。
    override fun draw(width: Int, height: Int) { /*...*/ }
}
```

#### デフォルト値としての非定数式 {id="non-constant-expressions-as-default-values"}

パラメータには定数ではないデフォルト値を割り当てることができます。
たとえば、この例の `len` パラメータのように、関数の呼び出し結果や他の引数の値を使用した計算結果をデフォルト値にすることができます:

```kotlin
fun read(
    b: ByteArray,
    off: Int = 0,
    len: Int = b.size,
) { /*...*/ }
```

他のパラメータの値を参照するパラメータは、順序の後ろの方で宣言する必要があります。
この例では、`len` は `b` の後に宣言されなければなりません。

一般に、任意の式をパラメータのデフォルト値として割り当てることができます。
ただし、デフォルト値が評価されるのは、関数が対応するパラメータ**なし**で呼び出され、デフォルト値を割り当てる必要がある場合のみです。
たとえば、次の関数は `print` パラメータなしで呼び出された場合にのみ行を出力します:

```kotlin
fun main() {
//sampleStart
    fun read(
        b: Int,
        print: Unit? = println("No argument passed for 'print'")
    ) { println(b) }
    
    // "No argument passed for 'print'" を出力した後に "1" を出力
    read(1)
    // "1" のみを出力
    read(1, null)
    //sampleEnd
}
```
{kotlin-runnable="true" id="non-constant-default"}

関数宣言の最後のパラメータが関数型である場合、対応する[ラムダ](lambdas.md#lambda-expression-syntax)引数は名前付き引数として渡すか、[括弧の外](lambdas.md#passing-trailing-lambdas)に渡すことができます:

```kotlin
fun main() {
    //sampleStart
    fun log(
        level: Int = 0,
        code:  Int = 1,
        action: () -> Unit,
    ) { println (level)
        println (code)
        action() }
    
    // 'level' に 1 を渡し、'code' にはデフォルト値 1 を使用
    log(1) { println("Connection established") }
    
    // 'level' に 0、'code' に 1 という両方のデフォルト値を使用
    log(action = { println("Connection established") })
    
    // 前の呼び出しと同等で、両方のデフォルト値を使用
    log { println("Connection established") }
    //sampleEnd
}
```
{kotlin-runnable="true" id="lambda-outside-parentheses"}

### 名前付き引数 {id="named-arguments"}

関数を呼び出す際、1つ以上の引数に名前を付けることができます。
これは、関数呼び出しに多数の引数がある場合に役立ちます。
そのような場合、特に値が `null` やブール値であると、引数と値を関連付けるのが難しくなります。

関数呼び出しで名前付き引数を使用する場合、任意の順序で指定できます。

デフォルト値を持つ 4 つの引数を持つ `reformat()` 関数を考えてみましょう:

```kotlin
fun reformat(
    str: String,
    normalizeCase: Boolean = true,
    upperCaseFirstLetter: Boolean = true,
    divideByCamelHumps: Boolean = false,
    wordSeparator: Char = ' ',
) { /*...*/ }
```

この関数を呼び出す際、一部の引数に名前を付けることができます:

```kotlin
reformat(
    "String!",
    normalizeCase = false,
    upperCaseFirstLetter = false,
    divideByCamelHumps = true,
    '_'
)
```

デフォルト値を持つ引数をすべてスキップできます:

```kotlin
reformat("This is a long String!")
```

デフォルト値を持つ引数をすべて省略するのではなく、_一部_ だけをスキップすることもできます。
ただし、最初にスキップした引数の後は、以降のすべての引数に名前を付ける必要があります:

```kotlin
reformat(
    "This is a short String!",
    upperCaseFirstLetter = false,
    wordSeparator = '_'
)
```

対応する引数に名前を付けることで、[可変長引数](#variable-number-of-arguments-varargs)（`vararg`）を渡すことができます。
この例では配列を渡しています:

```kotlin
fun mergeStrings(vararg strings: String) { /*...*/ }

mergeStrings(strings = arrayOf("a", "b", "c"))
```

<!-- Rationale for named arguments interaction with varargs is here https://youtrack.jetbrains.com/issue/KT-52505#focus=Comments-27-6147916.0-0 -->

> JVM 上で Java 関数を呼び出す場合、Java バイトコードが関数のパラメータ名を常に保持しているとは限らないため、名前付き引数の構文は使用できません。
>
{style="note"}

### 戻り値の型 {id="return-types"}

ブロック本体を持つ関数（波括弧 `{}` 内に命令を記述する形式）を宣言する場合は、常に戻り値の型を明示的に指定する必要があります。唯一の例外は関数が `Unit` を返す場合で、[その場合は戻り値の型の指定は省略可能です](#unit-returning-functions)。

Kotlin はブロック本体を持つ関数の戻り値の型を推論しません。制御フローが複雑になる可能性があり、読み手にとっても、時にはコンパイラにとっても戻り値の型が不明瞭になるためです。ただし、[単一式関数](#single-expression-functions)では戻り値の型を指定しなくても、Kotlin がそれを推論できます。

Kotlin の関数は単一の値を返しますが、その値に複数のデータを含めることができます。これらの値を表現する方法については、[複数の値を返す](#return-multiple-values)を参照してください。

#### 複数の値を返す {id="return-multiple-values"}

明確に異なる意味を持つ複数の関連する値を返す必要がある場合は、その関数でしか使用しない場合であっても、[データクラス](data-classes.md)を宣言してください:

```kotlin
data class OrderSummary(
    val subtotal: Double,
    val tax: Double,
)

fun calculateOrderSummary(prices: List<Double>): OrderSummary {
    val subtotal = prices.sum()
    val tax = subtotal * 0.2
    return OrderSummary(subtotal, tax)
}

fun main() {
    val summary = calculateOrderSummary(listOf(12.50, 8.00, 4.50))

    println(summary.subtotal)
    // 25.0
    println(summary.tax)
    // 5.0
}
```
{kotlin-runnable="true" id="return-multiple-values-data-class"}

データクラスは、異なる意味を持つ複数の値を返す必要がある場合に適しています。返される値が同種のものであり、グループとして扱いたい場合は、代わりにコレクションを返すことを検討してください:

```kotlin
data class Person(val name: String)

val friendGroups = listOf(
    listOf(Person("Alice"), Person("Bob")),
    listOf(Person("Charlie"), Person("Diana"), Person("Eve")),
    listOf(Person("Frank"))
)

fun findLargestGroupOfFriends(): List<Person> {
    return friendGroups.maxByOrNull { it.size } ?: emptyList()
}

fun main() {
    val largestGroup = findLargestGroupOfFriends()

    println(largestGroup.map { it.name })
    // [Charlie, Diana, Eve]
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.4" id="return-multiple-values-list"}

固定された数の値を返す必要がある場合は、標準ライブラリの [`Pair`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-pair/) または [`Triple`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-triple/) データクラスを使用することもできます。ただし、それらのプロパティには `first`、`second`、`third` といった汎用的な名前が付けられているため、結果が理解しにくくなることがあります。

たとえば、`calculateOrderTotals()` 関数は `Pair` を返しますが、それぞれの `Double` が何を表しているのか明確ではありません:

```kotlin
fun calculateOrderTotals(prices: List<Double>): Pair<Double, Double> {
    val subtotal = prices.sum()
    val tax = subtotal * 0.2
    return Pair(subtotal, tax)
}

fun main() {
    val totals = calculateOrderTotals(listOf(12.50, 8.00, 4.50))

    // 'first' は何を意味するのか？
    println(totals.first)
    // 25.0
  
    // 'second' は何を意味するのか？
    println(totals.second)
    // 5.0
}
```
{kotlin-runnable="true" id="return-multiple-values-pair"}

明確に異なる意味を持つ結果については、[`OrderSummary` データクラスの例](#return-multiple-values)で示したように、わかりやすいプロパティ名を持つデータクラスを推奨します。

### 単一式関数 {id="single-expression-functions"}

関数の本体が単一の式で構成されている場合、波括弧を省略して `=` 記号の後に本体を指定できます:

```kotlin
fun double(x: Int): Int = x * 2
```

ほとんどの場合、[戻り値の型](#return-types)を明示的に宣言する必要はありません:

```kotlin
// コンパイラは関数が Int を返すと推論する
fun double(x: Int) = x * 2
```

単一の式から戻り値の型を推論する際、コンパイラが問題に直面することがあります。
そのような場合は、戻り値の型を明示的に追加する必要があります。
たとえば、再帰的または相互再帰的（互いに呼び出し合う）な関数や、`fun empty() = null` のような型のない式を持つ関数には、常に戻り値の型が必要です。

推論された戻り値の型を使用する場合は、コンパイラが意図したほど有用ではない型を推論する可能性があるため、実際の結果を必ず確認してください。
上記の例で、`double()` 関数に `Int` ではなく `Number` を返させたい場合は、明示的に宣言する必要があります。

式本体の内部で `return` 文を使用する場合は、戻り値の型を明示的に指定する必要があります:

```kotlin
fun getDisplayNameOrDefault(userId: String?): String =
    getDisplayName(userId ?: return "default")
```

### Unit を返す関数 {id="unit-returning-functions"}

関数がブロック本体を持ち、明示的な戻り値の型がない場合、コンパイラはその戻り値の型を `Unit` と推論します。

`Unit` は、同じく `Unit` と呼ばれる1つの値のみを持つ型です。この値は[オブジェクト](object-declarations.md)であるため、単一の `Unit` インスタンスしか存在しません。
他のプログラミング言語の `void` とは異なり、`Unit` は実際の型であり、コードが必要とする場合はその値を使用できます。
これにより、結果を生成する関数とアクションのみを実行する関数が同じ型モデルに適合します。どちらも値を返し、関数型で表現したりジェネリック API で使用したりできます。

関数の宣言で `Unit` を指定したり、その値を明示的に返したりする必要はありません。ただし、`() -> Unit` のように関数型の一部である場合は `Unit` を指定する必要があります。たとえば、`Unit` を返さずに `printHello()` 関数を宣言してみましょう:

```kotlin
// 関数型パラメータ ('action') の宣言には
// 明示的な戻り値の型が依然として必要
fun printHello(name: String?, action: () -> Unit) {
    if (name != null)
        println("Hello $name")
    else
        println("Hi there!")

    action()
}

fun main() {
    printHello("Kodee") {
        println("This runs after the greeting.")
        // Hello Kodee
        // This runs after the greeting.
    }

    printHello(null) {
        println("No name provided, but action still runs.")
        // Hi there!
        // No name provided, but action still runs.
    }
}
```
{kotlin-runnable="true" validate="false" id="return-unit-implicit"}

これは、戻り値の型と値を明示的に指定する次のより冗長な宣言と同等です:

```kotlin
//sampleStart
// `() -> Unit` 関数型では `Unit` が必要ですが、
// `printHello()` の戻り値の型として `: Unit` を宣言するのは任意です
fun printHello(name: String?, action: () -> Unit): Unit {
    if (name != null)
        println("Hello $name")
    else
        println("Hi there!")

    action()
    // `Unit` 値を明示的に返すのは任意です
    return Unit
}
//sampleEnd
fun main() {
    printHello("Kodee") {
        println("This action runs when a name is given.")
        // Hello Kodee
        // This action runs when a name is given.
    }
    printHello(null) {
        println("This action runs when no name is provided.")
        // Hi there!
        // This action runs when no name is provided.
    }
}
```
{kotlin-runnable="true" validate="false" id="return-unit-explicit"}

### 可変長引数 (varargs) {id="variable-number-of-arguments-varargs"}

関数に可変個の引数を渡すには、そのパラメータの1つ（通常は最後のパラメータ）に `vararg` 修飾子を付けます。
関数内では、型 `T` の `vararg` パラメータを `T` の配列として使用できます:

```kotlin
fun <T> asList(vararg ts: T): List<T> {
    val result = ArrayList<T>()
    for (t in ts) // ts は Array
        result.add(t)
    return result
}
```

その後、関数に可変個の引数を渡すことができます:

```kotlin
fun <T> asList(vararg ts: T): List<T> {
    val result = ArrayList<T>()
    for (t in ts) // ts は Array
        result.add(t)
    return result
}

fun main() {
    //sampleStart
    val list = asList(1, 2, 3)
    println(list)
    // [1, 2, 3]
    //sampleEnd
}
```
{kotlin-runnable="true" validate="false" id="varargs-aslist"}

`vararg` として指定できるパラメータは1つだけです。
`vararg` パラメータをパラメータリストの最後以外の場所に宣言した場合、それ以降のパラメータの値は名前付き引数を使用して渡す必要があります。
パラメータが関数型である場合は、括弧の外にラムダを配置してその値を渡すこともできます。

`vararg` 関数を呼び出すときは、`asList(1, 2, 3)` の例のように個別に引数を渡すことができます。
すでに配列があり、その内容を `vararg` パラメータとして（またはその一部として）関数に渡したい場合は、配列名の前に `*` を付ける[スプレッド演算子](arrays.md#pass-variable-number-of-arguments-to-a-function)を使用します:

```kotlin
fun <T> asList(vararg ts: T): List<T> {
    val result = ArrayList<T>()
    for (t in ts)
        result.add(t)
    return result
}

fun main() {
    //sampleStart
    val a = arrayOf(1, 2, 3)

    // 関数は配列 [-1, 0, 1, 2, 3, 4] を受け取る
    list = asList(-1, 0, *a, 4)

    println(list)
    // [-1, 0, 1, 2, 3, 4]
    //sampleEnd
}
```
{kotlin-runnable="true" validate="false" id="varargs-aslist-with-array"}

[プリミティブ型の配列](arrays.md#primitive-type-arrays)を `vararg` として渡したい場合は、[`.toTypedArray()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/to-typed-array.html) 関数を使用して通常の（型付けされた）配列に変換する必要があります:

```kotlin
// 'a' は IntArray であり、プリミティブ型の配列
val a = intArrayOf(1, 2, 3)
val list = asList(-1, 0, *a.toTypedArray(), 4)
```

### 中置記法 (Infix notation) {id="infix-notation"}

`infix` キーワードを使用すると、括弧やピリオドなしで呼び出せる関数を宣言できます。
これにより、コード内のシンプルな関数呼び出しを読みやすくすることができます。

```kotlin
infix fun Int.shl(x: Int): Int { /*...*/ }

// 一般的な表記法を使用して関数を呼び出す
1.shl(2)

// 中置記法を使用して関数を呼び出す
1 shl 2
```

中置関数（infix function）は、次の要件を満たす必要があります:

* クラスのメンバ関数または[拡張関数](extensions.md)である必要があります。
* パラメータが1つだけでなければなりません。
* そのパラメータは[可変長引数を受け付けてはならず](#variable-number-of-arguments-varargs)（`vararg` 不可）、[デフォルト値](#parameters-with-default-values)を持っていてはなりません。

> 中置関数の呼び出しは、算術演算子、型キャスト、および `rangeTo` 演算子よりも優先順位が低くなります。
> 次の式はそれぞれ等価です:
> * `1 shl 2 + 3` は `1 shl (2 + 3)` と等価
> * `0 until n * 2` は `0 until (n * 2)` と等価
> * `xs union ys as Set<*>` は `xs union (ys as Set<*>)` と等価
>
> 一方で、中置関数呼び出しの優先順位は、ブール演算子 `&&` および `||`、`is` チェックや `in` チェック、その他のいくつかの演算子よりも高くなります。以下の式もそれぞれ等価です:
> * `a && b xor c` は `a && (b xor c)` と等価
> * `a xor b in c` は `(a xor b) in c` と等価
>
{style="note"}

中置関数では、常にレシーバとパラメータの両方を指定する必要があることに注意してください。
中置記法を使用して現在のレシーバに対してメソッドを呼び出す場合は、明示的に `this` を使用します。
これにより、あいまいさのない構文解析が保証されます。

```kotlin
class MyStringCollection {
    val items = mutableListOf<String>()

    infix fun add(s: String) {
        println("Adding: $s")
        items += s
    }

    fun build() {
        add("first")      // 正しい: 通常の関数呼び出し
        this add "second" // 正しい: 明示的なレシーバを持つ中置呼び出し
        // add "third"    // コンパイルエラー: 明示的なレシーバが必要
    }

    fun printAll() = println("Items = $items")
}

fun main() {
    val myStrings = MyStringCollection()
    // リストに "first" と "second" を追加
    myStrings.build()
      
    myStrings.printAll()
    // Adding: first
    // Adding: second
    // Items = [first, second]
}
```
{kotlin-runnable="true" id="infix-notation-example"}

## 関数のスコープ {id="function-scope"}

Kotlin の関数はファイルのトップレベルで宣言できます。つまり、関数を保持するためだけのクラスを作成する必要はありません。
関数は_メンバ関数_や_拡張関数_としてローカルに宣言することもできます。

### ローカル関数 {id="local-functions"}

Kotlin はローカル関数（他の関数内部で宣言された関数）をサポートしています。
たとえば、次のコードは指定されたグラフに対する深さ優先探索（DFS）アルゴリズムを実装しています。
外側の `dfs()` 関数の内部にあるローカルの `dfs()` 関数により、実装を隠蔽し、再帰呼び出しを処理しています:

```kotlin
class Person(val name: String) {
    val friends = mutableListOf<Person>()
}
class SocialGraph(val people: List<Person>)
//sampleStart
fun dfs(graph: SocialGraph) {
    fun dfs(current: Person, visited: MutableSet<Person>) {
        if (!visited.add(current)) return
        println("Visited ${current.name}")
        for (friend in current.friends)
            dfs(friend, visited)
    }
    dfs(graph.people[0], HashSet())
}
//sampleEnd
fun main() {
    val alice = Person("Alice")
    val bob = Person("Bob")
    val charlie = Person("Charlie")
    alice.friends += bob
    bob.friends += charlie
    charlie.friends += alice
    val network = SocialGraph(listOf(alice, bob, charlie))
    dfs(network)
}
```
{kotlin-runnable="true" id="local-functions-dfs"}

ローカル関数は、外側の関数のローカル変数（クロージャ）にアクセスできます。
上記の場合、`visited` 関数パラメータをローカル変数にすることができます:

```kotlin
class Person(val name: String) {
    val friends = mutableListOf<Person>()
}
class SocialGraph(val people: List<Person>)
//sampleStart
fun dfs(graph: SocialGraph) {
    val visited = HashSet<Person>()
    fun dfs(current: Person) {
        if (!visited.add(current)) return
        println("Visited ${current.name}")
        for (friend in current.friends)
            dfs(friend)
    }
    dfs(graph.people[0])
}
//sampleEnd
fun main() {
    val alice = Person("Alice")
    val bob = Person("Bob")
    val charlie = Person("Charlie")
    alice.friends += bob
    bob.friends += charlie
    charlie.friends += alice
    val network = SocialGraph(listOf(alice, bob, charlie))
    dfs(network)
}
```
{kotlin-runnable="true" id="local-functions-dfs-with-local-variable"}

### メンバ関数 {id="member-functions"}

メンバ関数とは、クラスまたはオブジェクトの内部で定義された関数です:

```kotlin
class Sample {
    fun foo() { print("Foo") }
}
```

メンバ関数を呼び出すには、インスタンスまたはオブジェクト名を書き、その後に `.` を追加して関数名を書きます:

```kotlin
// Stream クラスのインスタンスを作成し、read() を呼び出す
Stream().read()
```

クラスとメンバのオーバーライドの詳細については、[クラス](classes.md)および[継承](classes.md#inheritance)を参照してください。

## ジェネリック関数 {id="generic-functions"}

関数名の手前に山括弧 `<>` を使用することで、関数にジェネリックパラメータを指定できます:

```kotlin
fun <T> singletonList(item: T): List<T> { /*...*/ }
```

ジェネリック関数の詳細については、[ジェネリクス](generics.md)を参照してください。

## 末尾再帰関数 {id="tail-recursive-functions"}

Kotlin は[末尾再帰](https://ja.wikipedia.org/wiki/%E6%9C%AB%E5%B0%BE%E5%91%BC%E5%87%BA%E3%81%97)（tail recursion）として知られる関数型プログラミングのスタイルをサポートしています。
通常ループを使用するアルゴリズムの一部では、スタックオーバーフローのリスクなしに代わりに再帰関数を使用できます。
関数に `tailrec` 修飾子が付けられ、必要な形式的条件を満たしている場合、コンパイラは再帰を最適化して取り除き、代わりに高速で効率的なループベースのバージョンを残します:

```kotlin
import kotlin.math.cos
import kotlin.math.abs

// 任意の「十分な」精度
val eps = 1E-10

tailrec fun findFixPoint(x: Double = 1.0): Double =
    if (abs(x - cos(x)) < eps) x else findFixPoint(cos(x))
```

このコードは、コサインの不動点（数学定数）を計算します。
この関数は、結果が変わらなくなるまで `1.0` から開始して `cos()` を繰り返し呼び出し、指定された `eps` の精度で `0.7390851332151611` という結果を生成します。
このコードは、より伝統的な以下のスタイルと同等です:

```kotlin
import kotlin.math.cos
import kotlin.math.abs

// 任意の「十分な」精度
val eps = 1E-10

private fun findFixPoint(): Double {
    var x = 1.0
    while (true) {
        val y = cos(x)
        if (abs(x - y) < eps) return x
        x = cos(x)
    }
}
```

関数に `tailrec` 修飾子を適用できるのは、その関数が最後の操作として自分自身を呼び出す場合のみです。
再帰呼び出しの後にさらにコードがある場合、[`try`/`catch`/`finally` ブロック](exceptions.md#handle-exceptions-using-try-catch-blocks)の内部にある場合、または関数が [`open`](inheritance.md) である場合は、末尾再帰を使用できません。

**関連項目**:
* [インライン関数](inline-functions.md)
* [拡張関数](extensions.md)
* [高階関数とラムダ](lambdas.md)