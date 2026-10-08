[//]: # (title: 高階関数とラムダ)

Kotlinの関数は[ファーストクラス（第一級）](https://en.wikipedia.org/wiki/First-class_function)です。これは、関数を変数やデータ構造に保存したり、引数として渡したり、他の[高階関数](#higher-order-functions)から戻り値として返したりできることを意味します。関数ではない他の値に対して可能な操作は、関数に対しても同様に行うことができます。

これを容易にするために、静的型付けプログラミング言語であるKotlinは、関数を表すための一連の[関数型](#function-types)を使用し、[ラムダ式](#lambda-expressions-and-anonymous-functions)などの特殊な言語構造を提供しています。

## 高階関数 {id="higher-order-functions"}

高階関数（Higher-order function）とは、関数をパラメータとして受け取るか、または関数を戻り値として返す関数のことです。

高階関数の良い例は、コレクションにおける[関数型プログラミングのイディオムである `fold`](https://en.wikipedia.org/wiki/Fold_(higher-order_function)) です。これは初期のアキュムレータ（累積値）と結合用関数を受け取り、現在のアキュムレータ値と各コレクション要素を順次結合してアキュムレータ値を毎回置き換えていくことで、最終的な戻り値を構築します。

```kotlin
fun <T, R> Collection<T>.fold(
    initial: R, 
    combine: (acc: R, nextElement: T) -> R
): R {
    var accumulator: R = initial
    for (element: T in this) {
        accumulator = combine(accumulator, element)
    }
    return accumulator
}
```

上記のコードでは、パラメータ `combine` は `(R, T) -> R` という[関数型](#function-types)を持っています。したがって、これは `R` 型と `T` 型の2つの引数を取り、`R` 型の値を返す関数を受け入れます。この関数は `for` ループの中で[呼び出され](#invoking-a-function-type-instance)、その戻り値が `accumulator` に代入されます。

`fold` を呼び出すには、引数として[関数型のインスタンス](#instantiating-a-function-type)を渡す必要があります。高階関数の呼び出し場所では、ラムダ式（[詳細は後述](#lambda-expressions-and-anonymous-functions)）がこの目的で広く使用されます。

```kotlin
fun main() {
    //sampleStart
    val items = listOf(1, 2, 3, 4, 5)
    
    // ラムダは中括弧で囲まれたコードブロックです。
    items.fold(0, { 
        // ラムダにパラメータがある場合、最初にパラメータを書き、その後に '->' を続けます。
        acc: Int, i: Int -> 
        print("acc = $acc, i = $i, ") 
        val result = acc + i
        println("result = $result")
        // ラムダ内の最後の式が戻り値と見なされます：
        result
    })
    
    // パラメータの型が推論可能な場合、ラムダの型指定は省略可能です：
    val joinedToString = items.fold("Elements:", { acc, i -> acc + " " + i })
    
    // 関数参照を高階関数の呼び出しに使用することもできます：
    val product = items.fold(1, Int::times)
    //sampleEnd
    println("joinedToString = $joinedToString")
    println("product = $product")
}
```
{kotlin-runnable="true"}

## 関数型 {id="function-types"}

Kotlinは、関数を扱う宣言のために `(Int) -> String` のような関数型（Function types）を使用します： `val onClick: () -> Unit = ...`

これらの型には、関数のシグネチャ（パラメータと戻り値）に対応する特別な記法があります。

* すべての関数型は、括弧で囲まれたパラメータ型のリストと戻り値の型を持ちます： `(A, B) -> C` は、`A` と `B` 型の2つの引数を取り、`C` 型の値を返す関数を表す型です。パラメータ型のリストは、`() -> A` のように空の場合もあります。[`Unit` 戻り値の型](functions.md#unit-returning-functions)を省略することはできません。

* 関数型はオプションで追加の *レシーバー*（receiver）型を持つことができます。これは記法の中でドットの前に指定されます：型 `A.(B) -> C` は、レシーバーオブジェクト `A` に対して呼び出され、パラメータ `B` を取り、値 `C` を返す関数を表します。[レシーバー付き関数リテラル](#function-literals-with-receiver)は、これらの型とともに頻繁に使用されます。

* [中断関数（Suspending functions）](coroutines-basics.md)は、特別な種類の関数型に属します。記法の中に `suspend` 修飾子を持ちます（例： `suspend () -> Unit` や `suspend A.(B) -> C`）。

関数型の記法には、オプションで関数パラメータの名前を含めることができます： `(x: Int, y: Int) -> Point`。これらの名前は、パラメータの意味をドキュメント化するために使用できます。

関数型を [null 許容（nullable）](null-safety.md#nullable-types-and-non-nullable-types)にするには、以下のように括弧を使用します： `((Int, Int) -> Int)?`。

関数型を組み合わせて記述することもできます： `(Int) -> ((Int) -> Unit)`。

> 矢印の記法は右結合です。`(Int) -> (Int) -> Unit` は前の例と等価ですが、 `((Int) -> (Int)) -> Unit` とは異なります。
>
{style="note"}

[型エイリアス（type alias）](type-aliases.md)を使用して、関数型に別の名前を付けることもできます。

```kotlin
typealias ClickHandler = (Button, ClickEvent) -> Unit
```

### 関数型のインスタンス化 {id="instantiating-a-function-type"}

関数型のインスタンスを取得する方法はいくつかあります。

* 関数リテラル内のコードブロックを、以下のいずれかの形式で使用する：
    * [ラムダ式](#lambda-expressions-and-anonymous-functions): `{ a, b -> a + b }`
    * [匿名関数](#anonymous-functions): `fun(s: String): Int { return s.toIntOrNull() ?: 0 }`

  [レシーバー付き関数リテラル](#function-literals-with-receiver)は、レシーバー付き関数型の値として使用できます。

* 既存の宣言に対する呼び出し可能参照（callable reference）を使用する：
    * トップレベル、ローカル、メンバー、または拡張[関数](reflection.md#function-references): `::isOdd`, `String::toInt`
    * トップレベル、メンバー、または拡張[プロパティ](reflection.md#property-references): `List<Int>::size`
    * [コンストラクタ](reflection.md#constructor-references): `::Regex`

  これらには、特定のインスタンスのメンバーを指す[バインドされた呼び出し可能参照](reflection.md#bound-function-and-property-references)（例： `foo::toString`）も含まれます。

* 関数型をインターフェースとして実装するカスタムクラスのインスタンスを使用する：

```kotlin
class IntTransformer: (Int) -> Int {
    override operator fun invoke(x: Int): Int = TODO()
}

val intFunction: (Int) -> Int = IntTransformer()
```

十分な情報がある場合、コンパイラは変数の関数型を推論できます：

```kotlin
val a = { i: Int -> i + 1 } // 推論される型は (Int) -> Int
```

レシーバーを持つ関数型と持たない関数型の *非リテラル* 値は相互に交換可能です。そのため、レシーバーを最初のパラメータの代わりにしたり、その逆にしたりできます。例えば、`(A, B) -> C` 型の値は、`A.(B) -> C` 型が期待される場所に渡したり代入したりすることができ、その逆も可能です。

```kotlin
fun main() {
    //sampleStart
    val repeatFun: String.(Int) -> String = { times -> this.repeat(times) }
    val twoParameters: (String, Int) -> String = repeatFun // OK
    
    fun runTransformation(f: (String, Int) -> String): String {
        return f("hello", 3)
    }
    val result = runTransformation(repeatFun) // OK
    //sampleEnd
    println("result = $result")
}
```
{kotlin-runnable="true"}

> 変数が拡張関数への参照で初期化されている場合でも、デフォルトではレシーバーなしの関数型が推論されます。
> それを変更したい場合は、変数の型を明示的に指定してください。
>
{style="note"}

### 関数型インスタンスの呼び出し {id="invoking-a-function-type-instance"}

関数型の値は、その [`invoke(...)` 演算子](operator-overloading.md#invoke-operator)を使用して呼び出すことができます： `f.invoke(x)` または単に `f(x)`。

値がレシーバー型を持つ場合、レシーバーオブジェクトを最初の引数として渡す必要があります。
レシーバー付き関数型の値を呼び出すもう一つの方法は、その値が[拡張関数](extensions.md)であるかのように、レシーバーオブジェクトを先頭に付けることです： `1.foo(2)`。

例：

```kotlin
fun main() {
    //sampleStart
    val stringPlus: (String, String) -> String = String::plus
    val intPlus: Int.(Int) -> Int = Int::plus
    
    println(stringPlus.invoke("<-", "->"))
    println(stringPlus("Hello, ", "world!"))
    
    println(intPlus.invoke(1, 1))
    println(intPlus(1, 2))
    println(2.intPlus(3)) // 拡張関数のような呼び出し
    //sampleEnd
}
```
{kotlin-runnable="true"}

### インライン関数 {id="inline-functions"}

高階関数において、柔軟な制御フローを提供する[インライン関数](inline-functions.md)を使用することが有益な場合があります。

## ラムダ式と匿名関数 {id="lambda-expressions-and-anonymous-functions"}

ラムダ式と匿名関数は *関数リテラル* です。関数リテラルとは、宣言されるのではなく、式として即座に渡される関数のことです。以下の例を考えてみましょう。

```kotlin
max(strings, { a, b -> a.length < b.length })
```

関数 `max` は高階関数です。第2引数として関数の値を受け取るためです。この第2引数は、それ自体が関数である式であり、関数リテラルと呼ばれます。これは以下の名前付き関数と同等です。

```kotlin
fun compare(a: String, b: String): Boolean = a.length < b.length
```

`suspend` キーワードを使用して、*中断ラムダ式（suspending lambda expression）* を作成することもできます。
中断ラムダは `suspend () -> Unit` という関数型を持ち、他の中断関数を呼び出すことができます。

```kotlin
val suspendingTask = suspend { doSuspendingWork() }
```

### ラムダ式の構文 {id="lambda-expression-syntax"}

ラムダ式の完全な構文形式は以下の通りです。

```kotlin
val sum: (Int, Int) -> Int = { x: Int, y: Int -> x + y }
```

* ラムダ式は常に中括弧（curly braces）で囲まれます。
* 完全な構文形式では、パラメータ宣言は中括弧内で行われ、オプションで型注釈を付けることができます。
* ボディ（本体）は `->` の後に続きます。
* 推論されたラムダの戻り値の型が `Unit` でない場合、ラムダボディ内の最後（あるいは唯一）の式が戻り値として扱われます。

オプションの注釈をすべて取り除くと、以下のようになります。

```kotlin
val sum = { x: Int, y: Int -> x + y }
```

### 末尾のラムダを渡す {id="passing-trailing-lambdas"}

Kotlinの慣習として、関数の最後のパラメータが関数である場合、引数として渡されるラムダ式を括弧の外側に配置することができます。

```kotlin
val product = items.fold(1) { acc, e -> acc * e }
```

このような構文は、*末尾のラムダ（trailing lambda）* としても知られています。

ラムダがその呼び出しにおいて唯一の引数である場合、括弧を完全に省略することもできます。

```kotlin
run { println("...") }
```

### it: 単一パラメータの暗黙の名前 {id="it-implicit-name-of-a-single-parameter"}

ラムダ式がパラメータを1つしか持たないことは非常によくあります。

コンパイラがパラメータなしのシグネチャを解析できる場合、パラメータを宣言する必要はなく、`->` を省略できます。パラメータは `it` という名前で暗黙的に宣言されます。

```kotlin
ints.filter { it > 0 } // このリテラルは '(it: Int) -> Boolean' 型です
```

### ラムダ式からの戻り値 {id="returning-a-value-from-a-lambda-expression"}

[修飾付き return](returns.md#return-to-labels) 構文を使用して、ラムダから明示的に値を返すことができます。
そうでない場合は、最後の式の値が暗黙的に返されます。

したがって、以下の2つのスニペットは同等です。

```kotlin
ints.filter {
    val shouldFilter = it > 0
    shouldFilter
}

ints.filter {
    val shouldFilter = it > 0
    return@filter shouldFilter
}
```

この慣習は、[ラムダ式を括弧の外に渡す](#passing-trailing-lambdas)ことと相まって、[LINQ スタイル](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/linq/)のコードを可能にします。

```kotlin
strings.filter { it.length == 5 }.sortedBy { it }.map { it.uppercase() }
```

### 未使用変数のためのアンダースコア {id="underscore-for-unused-variables"}

ラムダのパラメータが使用されない場合は、名前の代わりにアンダースコアを置くことができます。

```kotlin
map.forEach { (_, value) -> println("$value!") }
```

### ラムダでの分解 {id="destructuring-in-lambdas"}

ラムダでの分解（デストラクチャリング）については、[分解宣言](destructuring-declarations.md#destructuring-in-lambdas)の一部として説明されています。

### 匿名関数 {id="anonymous-functions"}

上記のラムダ式構文には、関数の戻り値の型を指定する機能が欠けています。ほとんどの場合、戻り値の型は自動的に推論できるため、これは不要です。しかし、明示的に指定する必要がある場合は、代替の構文である *匿名関数（anonymous function）* を使用できます。

```kotlin
fun(x: Int, y: Int): Int = x + y
```

匿名関数は、名前が省略されている点を除けば、通常の関数宣言と非常によく似ています。そのボディは、式（上記のように）またはブロックのいずれかになります。

```kotlin
fun(x: Int, y: Int): Int {
    return x + y
}
```

パラメータと戻り値の型は、通常の関数と同じ方法で指定されますが、コンテキストから推論できる場合はパラメータの型を省略できます。

```kotlin
ints.filter(fun(item) = item > 0)
```

匿名関数の戻り値の型の推論は、通常の関数と同様に機能します。式をボディに持つ匿名関数の戻り値の型は自動的に推論されますが、ブロックをボディに持つ匿名関数の場合は明示的に指定する必要があります（または `Unit` と見なされます）。

> 匿名関数をパラメータとして渡す場合は、括弧の中に配置してください。関数を括弧の外に出すことができる簡略構文は、ラムダ式にのみ機能します。
>
{style="note"}

ラムダ式と匿名関数のもう一つの違いは、[非ローカルリターン（non-local returns）](inline-functions.md#returns)の動作です。ラベルのない `return` ステートメントは、常に `fun` キーワードで宣言された関数から戻ります。これは、ラムダ式内の `return` は囲んでいる関数から戻るのに対し、匿名関数内の `return` は匿名関数自体から戻ることを意味します。

### クロージャ {id="closures"}

ラムダ式や匿名関数（ならびに[ローカル関数](functions.md#local-functions)や[オブジェクト式](object-declarations.md#object-expressions)）は、その *クロージャ*（外側のスコープで宣言された変数を含む）にアクセスできます。クロージャにキャプチャされた変数は、ラムダ内で変更可能です。

```kotlin
var sum = 0
ints.filter { it > 0 }.forEach {
    sum += it
}
print(sum)
```

### レシーバー付き関数リテラル {id="function-literals-with-receiver"}

`A.(B) -> C` のようなレシーバー付き[関数型](#function-types)は、特別な形式の関数リテラル、すなわち「レシーバー付き関数リテラル」を使用してインスタンス化できます。

前述のように、Kotlinは *レシーバーオブジェクト* を提供しながら、レシーバー付き関数型の[インスタンスを呼び出す](#invoking-a-function-type-instance)機能を提供しています。

関数リテラルのボディ内では、呼び出しに渡されたレシーバーオブジェクトは暗黙の `this` になります。そのため、追加の修飾子なしでそのレシーバーオブジェクトのメンバーにアクセスしたり、[`this` 式](this-expressions.md)を使用してレシーバーオブジェクトにアクセスしたりできます。

この動作は[拡張関数](extensions.md)に似ており、拡張関数も関数ボディ内でレシーバーオブジェクトのメンバーにアクセスすることを可能にします。

以下は、レシーバーオブジェクトに対して `plus` が呼び出されている、型を伴うレシーバー付き関数リテラルの例です。

```kotlin
val sum: Int.(Int) -> Int = { other -> plus(other) }
```

匿名関数の構文では、関数リテラルのレシーバー型を直接指定できます。これは、レシーバー付き関数型の変数を宣言し、後で使用する必要がある場合に便利です。

```kotlin
val sum = fun Int.(other: Int): Int = this + other
```

レシーバー型がコンテキストから推論できる場合、ラムダ式をレシーバー付き関数リテラルとして使用できます。その使用法の最も重要な例の一つが [型安全なビルダー](type-safe-builders.md) です。

```kotlin
class HTML {
    fun body() { ... }
}

fun html(init: HTML.() -> Unit): HTML {
    val html = HTML()  // レシーバーオブジェクトを作成
    html.init()        // レシーバーオブジェクトをラムダに渡す
    return html
}

html {       // レシーバー付きラムダがここから始まる
    body()   // レシーバーオブジェクトのメソッドを呼び出し
}
```
