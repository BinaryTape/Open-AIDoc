[//]: # (title: 関数)

Kotlin で関数を宣言するには：
* `fun` キーワードを使用します。
* パラメータを括弧 `()` の中に指定します。
* 必要に応じて[戻り値の型](#戻り値の型)を含めます。

例：

```kotlin
//sampleStart
// 'double' は関数の名前です
// 'x' は Int 型のパラメータです
// 期待される戻り値も Int 型です
fun double(x: Int): Int {
    return 2 * x
}
//sampleEnd

fun main() {
    println(double(5))
    // 10
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false" id="kotlin-function-double"}

## 関数の使用

関数は標準的な方法で呼び出されます：

```kotlin
val result = double(2)
```

[メンバ関数](classes.md)や[拡張関数](extensions.md#extension-functions)を呼び出すには、ピリオド `.` を使用します：

```kotlin
// Stream クラスのインスタンスを作成し、read() を呼び出す
Stream().read()
```

### パラメータ

関数パラメータは、パスカル記法（`name: Type`）を使用して宣言します。
パラメータはカンマで区切り、各パラメータには明示的に型を指定する必要があります：

```kotlin
fun powerOf(number: Int, exponent: Int): Int { /*...*/ }
```

関数の本体内では、受け取った引数は読み取り専用です（暗黙的に `val` として宣言されます）：

```kotlin
fun powerOf(number: Int, exponent: Int): Int {
    number = 2 // エラー: 'val' は再代入できません。
}
```

関数パラメータを宣言する際、[末尾のカンマ](coding-conventions.md#trailing-commas)を使用できます：

```kotlin
fun powerOf(
    number: Int,
    exponent: Int, // 末尾のカンマ
) { /*...*/ }
```

末尾のカンマは、リファクタリングやコードのメンテナンスに役立ちます。宣言内でパラメータを移動させる際に、どれが最後になるかを気にする必要がなくなります。

> Kotlin の関数は、他の関数をパラメータとして受け取ったり、引数として渡したりすることができます。
> 詳細については、[](lambdas.md) を参照してください。
> 
{style="note"}

### デフォルト値を持つパラメータ {id="parameters-with-default-values"}

パラメータにデフォルト値を指定することで、関数のパラメータをオプション（任意）にすることができます。
Kotlin は、そのパラメータに対応する引数を指定せずに関数を呼び出した場合に、デフォルト値を使用します。
デフォルト値を持つパラメータは、*オプショナルパラメータ*とも呼ばれます。

妥当なデフォルト値がある場合に、単にパラメータを省略できるようにするためだけに異なるバージョンの関数を宣言する必要がなくなるため、オプショナルパラメータはオーバーロードの必要性を減らします。

デフォルト値を設定するには、パラメータ宣言に `=` を追加します：

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

デフォルト値を持つパラメータを、デフォルト値を持たないパラメータの**前**に宣言した場合、デフォルト値を使用するには[名前付き引数](#名前付き引数)を使用するしかありません：

```kotlin
fun greeting(
    userId: Int = 0,
    message: String,
) { /*...*/ }

fun main() {
    // 'userId' にデフォルト値の 0 を使用
    greeting(message = "Hello!")
    
    // エラー: パラメータ 'userId' に値が渡されていません
    greeting("Hello!")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false" id="default-before-ordinary"}

[末尾のラムダ](lambdas.md#passing-trailing-lambdas)はこの規則の例外です。最後のパラメータが渡された関数に対応していなければならないためです：

```kotlin
fun main () {
//sampleStart    
fun greeting(
    userId: Int = 0,
    message: () -> Unit,
)
{ println(userId)
  message() }
    
// 'userId' にデフォルト値を使用
greeting() { println ("Hello!") }
// 0
// Hello!
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="default-before-trailing-lambda"}

[メソッドのオーバーライド](inheritance.md#overriding-methods)では、常に基本メソッドのデフォルトパラメータ値が使用されます。
デフォルトパラメータ値を持つメソッドをオーバーライドする場合、シグネチャからデフォルトパラメータ値を省略する必要があります：

```kotlin
open class Shape {
    open fun draw(width: Int = 10, height: Int = 5) { /*...*/ }
}

class Rectangle : Shape() {
    // ここでデフォルト値を指定することは許可されませんが、
    // この関数もデフォルトで 'width' に 10、'height' に 5 を使用します。
    override fun draw(width: Int, height: Int) { /*...*/ }
}
```

#### デフォルト値としての定数ではない式

パラメータに定数ではないデフォルト値を割り当てることができます。
例えば、この例の `len` パラメータのように、デフォルト値を関数呼び出しの結果や他の引数の値を使用した計算の結果にすることができます：

```kotlin
fun read(
    b: ByteArray,
    off: Int = 0,
    len: Int = b.size,
) { /*...*/ }
```

他のパラメータの値を参照するパラメータは、順序として後に宣言する必要があります。
この例では、`len` は `b` の後に宣言される必要があります。

一般に、パラメータのデフォルト値として任意の式を割り当てることができます。
ただし、デフォルト値は、対応するパラメータ**なし**で関数が呼び出され、デフォルト値を割り当てる必要がある場合にのみ評価されます。
例えば、この関数は `print` パラメータなしで呼び出された場合にのみ、1行出力します：

```kotlin
fun main() {
//sampleStart
    fun read(
        b: Int,
        print: Unit? = println("No argument passed for 'print'")
    ) { println(b) }
    
    // "No argument passed for 'print'" を出力し、次に "1" を出力
    read(1)
    // "1" のみを出力
    read(1, null)
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="non-constant-default"}

関数宣言の最後のパラメータが関数型である場合、対応する[ラムダ](lambdas.md#lambda-expression-syntax)引数を名前付き引数として、または[括弧の外](lambdas.md#passing-trailing-lambdas)に渡すことができます：

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
    
    // 'level' に 1 を渡し、'code' にはデフォルト値の 1 を使用
    log(1) { println("Connection established") }
    
    // 'level' に 0、'code' に 1 という両方のデフォルト値を使用
    log(action = { println("Connection established") })
    
    // 前の呼び出しと同等、両方のデフォルト値を使用
    log { println("Connection established") }
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="lambda-outside-parentheses"}

### 名前付き引数

関数を呼び出す際、1つ以上の引数に名前を付けることができます。
これは、関数呼び出しに多くの引数がある場合に役立ちます。
そのような場合、特に値が `null` や boolean 値であると、値と引数を結び付けるのが難しくなります。

関数呼び出しで名前付き引数を使用する場合、任意の順序で並べることができます。

4つのデフォルト値付き引数を持つ `reformat()` 関数を考えてみましょう：

```kotlin
fun reformat(
    str: String,
    normalizeCase: Boolean = true,
    upperCaseFirstLetter: Boolean = true,
    divideByCamelHumps: Boolean = false,
    wordSeparator: Char = ' ',
) { /*...*/ }
```

この関数を呼び出す際、一部の引数に名前を付けることができます：

```kotlin
reformat(
    "String!",
    normalizeCase = false,
    upperCaseFirstLetter = false,
    divideByCamelHumps = true,
    '_'
)
```

デフォルト値を持つすべての引数を省略できます：

```kotlin
reformat("This is a long String!")
```

すべてを省略するのではなく、デフォルト値を持つ引数の*一部*だけを省略することもできます。
ただし、最初に省略した引数の後は、後続のすべての引数に名前を付ける必要があります：

```kotlin
reformat(
    "This is a short String!",
    upperCaseFirstLetter = false,
    wordSeparator = '_'
)
```

対応する引数名を指定することで、[可変長引数](#可変長引数-varargs) (`vararg`) を渡すことができます。
この例では、配列を渡しています：

```kotlin
fun mergeStrings(vararg strings: String) { /*...*/ }

mergeStrings(strings = arrayOf("a", "b", "c"))
```

<!-- Rationale for named arguments interaction with varargs is here https://youtrack.jetbrains.com/issue/KT-52505#focus=Comments-27-6147916.0-0 -->

> JVM 上で Java 関数を呼び出す場合、名前付き引数の構文は使用できません。Java のバイトコードは常に型パラメータの名前を保持しているわけではないためです。
>
{style="note"}

### 戻り値の型

ブロック本体（波括弧 `{}` 内に命令を記述する形式）を持つ関数を宣言する場合、常に明示的に戻り値の型を指定する必要があります。
唯一の例外は、`Unit` を返す場合です。[その場合、戻り値の型の指定は任意です](#unitを返す関数)。

Kotlin はブロック本体を持つ関数の戻り値の型を推論しません。
そのような関数の制御フローは複雑になる可能性があり、読み手にとっても、時にはコンパイラにとっても戻り値の型が不明確になるためです。
ただし、[単一式関数](#単一式関数)の場合は、戻り値の型を指定しなくても Kotlin が推論できます。

### 単一式関数

関数の本体が単一の式で構成されている場合、波括弧を省略し、`=` 記号の後に本体を指定できます：

```kotlin
fun double(x: Int): Int = x * 2
```

ほとんどの場合、[戻り値の型](#戻り値の型)を明示的に宣言する必要はありません：

```kotlin
// コンパイラは関数が Int を返すと推論します
fun double(x: Int) = x * 2
```

単一の式から戻り値の型を推論する際、コンパイラが問題に直面することがあります。
そのような場合は、戻り値の型を明示的に追加する必要があります。
例えば、再帰的または相互再帰的（お互いに呼び出し合う）な関数や、`fun empty() = null` のような型のない式を持つ関数は、常に戻り値の型が必要です。

推論された戻り値の型を使用する場合は、コンパイラが期待よりも抽象的な型を推論する可能性があるため、実際の結果を確認するようにしてください。
上記の例で、`double()` 関数が `Int` ではなく `Number` を返すようにしたい場合は、明示的に宣言する必要があります。

### Unit を返す関数

関数がブロック本体（波括弧 `{}` 内の命令）を持ち、有用な値を返さない場合、コンパイラはその戻り値の型が `Unit` であると見なします。
`Unit` は、`Unit` と呼ばれる値を 1 つだけ持つ型です。

関数型のパラメータを除いて、戻り値の型として `Unit` を指定する必要はありません。
また、明示的に `Unit` を返す必要もありません。

例えば、`Unit` を返さずに `printHello()` 関数を宣言できます：

```kotlin
// 関数型パラメータ ('action') の宣言には依然として
// 明示的な戻り値の型が必要です
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
    }
    // Hello Kodee
    // This runs after the greeting.

    printHello(null) {
        println("No name provided, but action still runs.")
    }
    // No name provided, but action still runs
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false" id="return-unit-implicit"}

これは、以下の冗長な宣言と同等です：

```kotlin
//sampleStart
fun printHello(name: String?, action: () -> Unit): Unit {
    if (name != null)
        println("Hello $name")
    else
        println("Hi there!")

    action()
    return Unit
}
//sampleEnd
fun main() {
    printHello("Kodee") {
        println("This runs after the greeting.")
    }
    // Hello Kodee
    // This runs after the greeting.

    printHello(null) {
        println("No name provided, but action still runs.")
    }
    // No name provided, but action still runs
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false" id="return-unit-explicit"}

関数の戻り値の型が明示的に指定されている場合は、式本体の中で `return` 文を使用できます：

```kotlin
fun getDisplayNameOrDefault(userId: String?): String =
    getDisplayName(userId ?: return "default")
```

### 可変長引数 (varargs)

関数に可変の数の引数を渡すには、パラメータの1つ（通常は最後）に `vararg` 修飾子を付けます。
関数内では、型 `T` の `vararg` パラメータを `T` の配列として使用できます：

```kotlin
fun <T> asList(vararg ts: T): `List<T>` {
    val result = ArrayList<T>()
    for (t in ts) // ts は Array です
        result.add(t)
    return result
}
```

その後、関数に可変の数の引数を渡すことができます：

```kotlin
fun <T> asList(vararg ts: T): `List<T>` {
    val result = ArrayList<T>()
    for (t in ts) // ts は Array です
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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false" id="varargs-aslist"}

`vararg` としてマークできるパラメータは1つだけです。
パラメータリストの最後以外で `vararg` パラメータを宣言した場合は、それ以降のパラメータには名前付き引数を使用して値を渡す必要があります。
パラメータが関数型である場合は、括弧の外にラムダを置くことで値を渡すこともできます。

`vararg` 関数を呼び出す際、`asList(1, 2, 3)` の例のように、引数を個別に渡すことができます。
すでに配列を持っていて、その内容を `vararg` パラメータとして、またはその一部として関数に渡したい場合は、配列名の前に `*` を付ける[スプレッド演算子](arrays.md#関数に可変引数を渡す)を使用します：

```kotlin
fun <T> asList(vararg ts: T): `List<T>` {
    val result = ArrayList<T>()
    for (t in ts)
        result.add(t)
    return result
}

fun main() {
    //sampleStart
    val a = arrayOf(1, 2, 3)

    // 関数は配列 [-1, 0, 1, 2, 3, 4] を受け取ります
    list = asList(-1, 0, *a, 4)

    println(list)
    // [-1, 0, 1, 2, 3, 4]
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false" id="varargs-aslist-with-array"}

[プリミティブ型の配列](arrays.md#プリミティブ型の配列)を `vararg` として渡したい場合は、[`.toTypedArray()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/to-typed-array.html) 関数を使用して、通常の（型付き）配列に変換する必要があります：

```kotlin
// 'a' は IntArray（プリミティブ型配列）です
val a = intArrayOf(1, 2, 3)
val list = asList(-1, 0, *a.toTypedArray(), 4)
```

### 中置表記法 (Infix notation)

`infix` キーワードを使用すると、括弧やピリオドを使わずに呼び出せる関数を宣言できます。
これにより、コード内の単純な関数呼び出しが読みやすくなります。

```kotlin
infix fun Int.shl(x: Int): Int { /*...*/ }

// 一般的な表記法を使用した呼び出し
1.shl(2)

// 中置表記法を使用した呼び出し
1 shl 2
```

中置関数（Infix functions）は以下の要件を満たす必要があります：

* クラスのメンバ関数または[拡張関数](extensions.md)であること。
* パラメータが1つだけであること。
* そのパラメータが[可変長引数](#可変長引数-varargs) (`vararg`) を受け入れず、[デフォルト値](#デフォルト値を持つパラメータ)を持たないこと。

> 中置関数呼び出しの優先順位は、算術演算子、型キャスト、および `rangeTo` 演算子よりも低くなります。
> 以下の式はそれぞれ同等です：
> * `1 shl 2 + 3` は `1 shl (2 + 3)` と同等
> * `0 until n * 2` は `0 until (n * 2)` と同等
> * `xs union ys as Set<*>` は `xs union (ys as Set<*>)` と同等
>
> 一方で、中置関数呼び出しの優先順位は、論理演算子 `&&` および `||`、`is` チェック、`in` チェック、およびその他のいくつかの演算子よりも高くなります。以下の式も同等です：
> * `a && b xor c` は `a && (b xor c)` と同等
> * `a xor b in c` は `(a xor b) in c` と同等
>
{style="note"}

中置関数では、常にレシーバとパラメータの両方を指定する必要があることに注意してください。
現在のレシーバに対して中置表記を使用してメソッドを呼び出す場合は、明示的に `this` を使用してください。
これにより、解析の曖昧さがなくなります。

```kotlin
class MyStringCollection {
    val items = mutableListOf<String>()

    infix fun add(s: String) {
        println("Adding: $s")
        items += s
    }

    fun build() {
        add("first")      // 正解：通常の関数呼び出し
        this add "second" // 正解：明示的なレシーバを伴う中置呼び出し
        // add "third"    // コンパイラエラー：明示的なレシーバが必要
    }

    fun printAll() = println("Items = $items")
}

fun main() {
    val myStrings = MyStringCollection()
    // リストに "first" と "second" を2回追加
    myStrings.build()
      
    myStrings.printAll()
    // Adding: first
    // Adding: second
    // Items = [first, second]
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="infix-notation-example"}

## 関数のスコープ

Kotlin の関数はファイル内のトップレベルで宣言できます。つまり、関数を保持するためにクラスを作成する必要はありません。
また、関数は*メンバ関数*や*拡張関数*として、あるいはローカルに宣言することもできます。

### ローカル関数

Kotlin は、他の関数の中で宣言される関数であるローカル関数をサポートしています。
例えば、以下のコードは与えられたグラフの深さ優先探索（DFS）アルゴリズムを実装しています。
外側の `dfs()` 関数内にあるローカルな `dfs()` 関数を使用して、実装を隠蔽し、再帰呼び出しを処理しています：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="local-functions-dfs"}

ローカル関数は、外側の関数のローカル変数（クロージャ）にアクセスできます。
上記のケースでは、`visited` 関数パラメータをローカル変数にすることができます：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="local-functions-dfs-with-local-variable"}

### メンバ関数

メンバ関数とは、クラスまたはオブジェクトの中で定義された関数です：

```kotlin
class Sample {
    fun foo() { print("Foo") }
}
```

メンバ関数を呼び出すには、インスタンス名またはオブジェクト名の後に `.` を付け、関数名を書きます：

```kotlin
// Stream クラスのインスタンスを作成し、read() を呼び出す
Stream().read()
```

クラスとメンバのオーバーライドの詳細については、[クラス](classes.md)と[継承](classes.md#継承)を参照してください。

## ジェネリック関数

関数の名前の前に山括弧 `<>` を使用して、関数のジェネリックパラメータを指定できます：

```kotlin
fun <T> singletonList(item: T): `List<T>` { /*...*/ }
```

ジェネリック関数の詳細については、[ジェネリクス](generics.md)を参照してください。

## 末尾再帰関数

Kotlin は、[末尾再帰](https://ja.wikipedia.org/wiki/%E6%9C%AB%E5%B0%BE%E5%86%8D%E5%B1%B0)（tail recursion）として知られる関数型プログラミングのスタイルをサポートしています。
通常ループを使用するようなアルゴリズムの場合、スタックオーバーフローのリスクなしに再帰関数を使用できます。
関数が `tailrec` 修飾子でマークされ、必要な形式的条件を満たしている場合、コンパイラは再帰を最適化し、高速で効率的なループベースのバージョンに置き換えます：

```kotlin
import kotlin.math.cos
import kotlin.math.abs

// 任意の「十分な」精度
val eps = 1E-10

tailrec fun findFixPoint(x: Double = 1.0): Double =
    if (abs(x - cos(x)) < eps) x else findFixPoint(cos(x))
```

このコードは、余弦の不動点（数学定数）を計算します。
指定された `eps` 精度に対して結果が変わらなくなるまで、`1.0` から始めて繰り返し `cos()` を呼び出し、結果として `0.7390851332151611` を生成します。
このコードは、より伝統的なスタイルの以下のコードと同等です：

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

`tailrec` 修飾子は、関数がその最後の操作として自分自身を呼び出す場合にのみ適用できます。
再帰呼び出しの後にさらにコードがある場合や、[`try`/`catch`/`finally` ブロック](exceptions.md#try-catch-ブロックを使用して例外を処理する)内、または関数が [open](inheritance.md) である場合には、末尾再帰を使用することはできません。

**関連項目**:
* [インライン関数](inline-functions.md)
* [拡張関数](extensions.md)
* [高階関数とラムダ](lambdas.md)