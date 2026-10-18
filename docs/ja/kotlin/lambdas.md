[//]: # (title: 高階関数とラムダ)

Kotlinの関数は[第一級（ファーストクラス）](https://en.wikipedia.org/wiki/First-class_function)です。つまり、関数を変数やデータ構造に格納したり、他の[高階関数](#higher-order-functions)への引数として渡したり、そこから戻り値として返したりすることができます。関数に対しては、他の非関数値で可能なあらゆる操作を実行できます。

これを容易にするため、静的型付けプログラミング言語であるKotlinは、関数を表現するために一連の[関数型](#function-types)を使用し、[ラムダ式](#lambda-expressions-and-anonymous-functions)などの特化された言語構造を提供しています。

## 高階関数 {id="higher-order-functions"}

高階関数とは、関数をパラメータとして受け取るか、関数を返す関数のことです。

高階関数の良い例は、コレクションに対する[関数型プログラミングのイディオム `fold`](https://en.wikipedia.org/wiki/Fold_(higher-order_function))です。これは初期アキュムレータ値と結合関数を受け取り、現在のアキュムレータ値とコレクションの各要素を順次結合して、その都度アキュムレータ値を置き換えることで戻り値を構築します。

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

上記のコードにおいて、パラメータ `combine` は[関数型](#function-types) `(R, T) -> R` を持っているため、型 `R` と `T` の2つの引数を受け取って型 `R` の値を返す関数を受け入れます。
これは `for` ループの内部で[呼び出され](#invoking-a-function-type-instance)、その戻り値が `accumulator` に代入されます。

`fold` を呼び出すには、引数として[関数型のインスタンス](#instantiating-a-function-type)を渡す必要があります。高階関数の呼び出し側では、この目的のためにラムダ式（[以下で詳細に説明します](#lambda-expressions-and-anonymous-functions)）が広く使用されます。

```kotlin
fun main() {
    //sampleStart
    val items = listOf(1, 2, 3, 4, 5)
    
    // ラムダは中括弧（波括弧）で囲まれたコードブロックです。
    items.fold(0, { 
        // ラムダにパラメータがある場合は最初に記述され、その後に '->' が続きます
        acc: Int, i: Int -> 
        print("acc = $acc, i = $i, ") 
        val result = acc + i
        println("result = $result")
        // ラムダ内の最後の式が戻り値とみなされます:
        result
    })
    
    // 推論可能な場合、ラムダのパラメータ型は省略可能です:
    val joinedToString = items.fold("Elements:", { acc, i -> acc + " " + i })
    
    // 関数参照も高階関数の呼び出しに使用できます:
    val product = items.fold(1, Int::times)
    //sampleEnd
    println("joinedToString = $joinedToString")
    println("product = $product")
}
```
{kotlin-runnable="true"}

## 関数型 {id="function-types"}

Kotlinでは、関数を扱う宣言のために `(Int) -> String` のような関数型を使用します（例: `val onClick: () -> Unit = ...`）。

これらの型には、関数のシグネチャ（パラメータと戻り値）に対応する特別な表記法があります。

* すべての関数型には、括弧で囲まれたパラメータ型のリストと戻り値の型があります。`(A, B) -> C` は、型 `A` と `B` の2つの引数を受け取り、型 `C` の値を返す関数を表す型を表します。パラメータ型のリストは、`() -> A` のように空でもかまいません。[`Unit` 戻り値型](functions.md#unit-returning-functions)を省略することはできません。

* 関数型には、オプションで追加の*レシーバ*型を持たせることができます。これは表記内のドットの前に指定されます。型 `A.(B) -> C` は、レシーバオブジェクト `A` に対してパラメータ `B` を渡して呼び出すことができ、値 `C` を返す関数を表します。[レシーバ付き関数リテラル](#function-literals-with-receiver)は、これらの型とともに頻繁に使用されます。

* [サスペンド関数](coroutines-basics.md)は、表記に *suspend* 修飾子を持つ特殊な関数型に属します（例: `suspend () -> Unit` や `suspend A.(B) -> C`）。

関数型の表記には、オプションで関数パラメータの名前を含めることができます（例: `(x: Int, y: Int) -> Point`）。これらの名前は、パラメータの意味をドキュメント化するために使用できます。

関数型が[null許容（nullable）](null-safety.md#nullable-types-and-non-nullable-types)であることを指定するには、次のように括弧を使用します。
`((Int, Int) -> Int)?`

関数型は括弧を使用して組み合わせることもできます: `(Int) -> ((Int) -> Unit)`

> 矢印の表記は右結合です。`(Int) -> (Int) -> Unit` は前の例と等価ですが、`((Int) -> (Int)) -> Unit` とは等しくありません。
>
{style="note"}

[型エイリアス](type-aliases.md)を使用して、関数型に別名をつけることもできます。

```kotlin
typealias ClickHandler = (Button, ClickEvent) -> Unit
```

### 関数型のインスタンス化 {id="instantiating-a-function-type"}

関数型のインスタンスを取得する方法はいくつかあります。

* 関数リテラル内のコードブロックを使用する（以下のいずれかの形式）:
    * [ラムダ式](#lambda-expressions-and-anonymous-functions): `{ a, b -> a + b }`
    * [匿名関数](#anonymous-functions): `fun(s: String): Int { return s.toIntOrNull() ?: 0 }`

  [レシーバ付き関数リテラル](#function-literals-with-receiver)は、レシーバ付き関数型の値として使用できます。

* 既存の宣言に対するコーラブル参照（callable reference）を使用する:
    * トップレベル、ローカル、メンバー、または拡張[関数](#function-references): `::isOdd`、`String::toInt`
    * トップレベル、メンバー、または拡張[プロパティ](#property-references): `List<Int>::size`
    * [コンストラクタ](#constructor-references): `::Regex`

  これらには、特定のインスタンスのメンバーを指す[バインドされたコーラブル参照](#bound-and-unbound-references)も含まれます: `foo::toString`

* 関数型をインターフェースとして実装するカスタムクラスのインスタンスを使用する:

```kotlin
class IntTransformer: (Int) -> Int {
    override operator fun invoke(x: Int): Int = TODO()
}

val intFunction: (Int) -> Int = IntTransformer()
```

十分な情報があれば、コンパイラは変数の関数型を推論できます。

```kotlin
val a = { i: Int -> i + 1 } // 推論される型は (Int) -> Int です
```

レシーバを持つ関数型と持たない関数型の*リテラルではない*値は交換可能です。そのため、レシーバが第1パラメータの代わりになることができ、その逆も同様です。たとえば、型 `A.(B) -> C` の値が期待される場所に型 `(A, B) -> C` の値を渡したり代入したりすることができ、その逆も可能です。

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

> 変数が拡張関数への参照で初期化されている場合でも、デフォルトではレシーバのない関数型が推論されます。
> これを変更するには、変数の型を明示的に指定してください。
>
{style="note"}

### 関数型インスタンスの呼び出し {id="invoking-a-function-type-instance"}

関数型の値は、その [`invoke(...)` 演算子](operator-overloading.md#invoke-operator)を使用して呼び出すことができます: `f.invoke(x)` または単に `f(x)`。

値がレシーバ型を持つ場合、レシーバオブジェクトを第1引数として渡す必要があります。
レシーバ付き関数型の値を呼び出すもう1つの方法は、その値があたかも[拡張関数](extensions.md)であるかのように、レシーバオブジェクトを先頭に付加することです: `1.foo(2)`。

例:

```kotlin
fun main() {
    //sampleStart
    val stringPlus: (String, String) -> String = String::plus
    val intPlus: Int.(Int) -> Int = Int::plus
    
    println(stringPlus.invoke("<-", "->"))
    println(stringPlus("Hello, ", "world!"))
    
    println(intPlus.invoke(1, 1))
    println(intPlus(1, 2))
    println(2.intPlus(3)) // 拡張関数のスタイルの呼び出し
    //sampleEnd
}
```
{kotlin-runnable="true"}

### インライン関数 {id="inline-functions"}

高階関数には柔軟な制御フローを提供する[インライン関数](inline-functions.md)を使用することが有益な場合があります。

## コーラブル参照 {id="callable-reference"}

コーラブル参照を使用すると、関数、プロパティ、またはコンストラクタを即座に呼び出したりアクセスしたりすることなく参照できます。
参照を変数に保存したり、別の関数に渡したり、後で呼び出したりすることができます。

コーラブル参照を作成するには、`::` 演算子を使用します。

```kotlin
fun isOdd(number: Int) = number % 2 != 0

fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)

    // isOdd() への参照を渡す
    println(numbers.filter(::isOdd))
    // [1, 3, 5]
}
```
{kotlin-runnable="true"}

コーラブル参照オブジェクトは、`KFunction` や `KProperty` などの[リフレクション](reflection.md)インターフェースを実装しています。

### 関数参照 {id="function-references"}

既存の関数を値として渡したり保存したりするには、関数参照を使用します。トップレベルまたはローカルの名前付き関数を参照するには、`::functionName` を使用します。

```kotlin
fun calculateLength(text: String) = text.length

fun main() {
    val length: (String) -> Int = ::calculateLength

    println(length("Kotlin"))
    // 6
    println(::calculateLength.name)
    // calculateLength
}
```
{kotlin-runnable="true"}

関数参照は、パラメータの数に応じて [`KFunction<out R>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-function/) サブタイプのいずれかに属します（例: `KFunction3<T1, T2, T3, R>`）。

複数の関数が同じ名前を持つ場合、コンパイラは期待される関数型を使用して、一致するオーバーロードを選択します。

```kotlin
fun parse(value: String) = "String: $value"
fun parse(value: Int) = "Int: $value"

fun main() {
    val parseString: (String) -> String = ::parse
    val parseInt: (Int) -> String = ::parse

    println(parseString("Kotlin"))
    // String: Kotlin
    println(parseInt(22))
    // Int: 22
}
```
{kotlin-runnable="true"}

### プロパティ参照 {id="property-references"}

静的にチェックされたプロパティアクセサを渡す必要がある場合は、プロパティ参照を使用します。たとえば、別の関数がその参照を使用して、読み取りまたは更新する値を選択できます。

プロパティ参照を作成するには、`::` 演算子を使用します。参照を関数として呼び出すか、`get()` 関数を使用することで、プロパティを読み取ることができます。可変プロパティの参照には `set()` も用意されています。

```kotlin
var greeting = "Hello"

class User(var name: String)

fun main() {
    // トップレベルプロパティ参照
    // レシーバは不要
    println(::greeting.get())
    // Hello

    ::greeting.set("Hi")
    println(greeting)
    // Hi

    val user = User("Jane")

    // バインドされていないメンバープロパティ参照
    // User レシーバを明示的に渡す
    val unboundName = User::name
    println(unboundName.get(user))
    // Jane

    unboundName.set(user, "Jane Doe")
    println(user.name)
    // Jane Doe

    // バインドされたメンバープロパティ参照
    // user レシーバをキャプチャする
    val boundName = user::name

    println(boundName.get())
    // Jane Doe

    boundName.set("Jane Smith")
    println(user.name)
    // Jane Smith
}
```
{kotlin-runnable="true"}

プロパティ参照型は、必要なレシーバの数を示します。

* [`KProperty0<V>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-property0/) はレシーバを必要としません。これには、トップレベルプロパティやオブジェクトにバインドされたプロパティが含まれます。
* [`KProperty1<T, V>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-property1/) は1つのレシーバを必要とします。
* [`KProperty2<D, E, V>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-property2/) は2つのレシーバを必要とし、メンバー拡張プロパティを表します（1つは包含クラス用のレシーバ、もう1つは拡張される型用のレシーバ）。

可変プロパティには、対応する [`KMutableProperty0`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-mutable-property0/)、[`KMutableProperty1`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-mutable-property1/)、[`KMutableProperty2`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-mutable-property2/) 型があります。
通常、コンパイラが参照からこれらの型を推論するため、明示的に記述する必要はありません。

> 実行時にプロパティを動的に調べるには、[Kotlin リフレクション](reflection.md)を使用してください。
>
{style="tip"}

### コンストラクタ参照 {id="constructor-references"}

APIがファクトリを必要とし、既存のコンストラクタがすでに必要なパラメータと戻り値の型を持っている場合は、コンストラクタ参照を使用します。コンストラクタ参照により、APIは関数値を介して新しいインスタンスを作成できます。

コンストラクタへの参照を作成するには、`::ClassName` を使用します。

```kotlin
data class User(val name: String, val age: Int)

fun createUser(factory: (String, Int) -> User): User =
    factory("Jane Doe", 22)

fun main() {
    val user = createUser(::User)
    println(user)
    // User(name=Jane Doe, age=22)
}
```
{kotlin-runnable="true"}

コンストラクタへのコーラブル参照は、パラメータ数に応じて [`KFunction<out R>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-function/) サブタイプのいずれかとして型付けされます。

### バインドされた参照とバインドされていない参照 {id="bound-and-unbound-references"}

メンバーへの参照は、*バインド*（bound）されている場合と*バインドされていない*（unbound）場合があります。

* バインドされた参照は特定のインスタンスをキャプチャし、関数の宣言された引数のみを必要とします。すべての呼び出しで同じオブジェクトを使用する必要がある場合に使用します。
* バインドされていない参照はインスタンスに関連付けられていないため、その関数型にはレシーバが含まれます。呼び出し元がオブジェクトを提供する必要がある場合に使用します。

```kotlin
class User(val name: String) {
    fun hasName(prefix: String) = name.startsWith(prefix)
}

fun main() {
    // バインドされていない参照の最初のパラメータは User レシーバです
    val unbound: (User, String) -> Boolean = User::hasName
    println(unbound(User("Jane"), "Ja"))
    // true

    val jane = User("Jane")

    // 参照は jane をレシーバとしてキャプチャします
    val bound: (String) -> Boolean = jane::hasName
    println(bound("Doe"))
    // false
}
```
{kotlin-runnable="true"}

拡張関数も同じルールに従います。たとえば、`String::isBlank` はバインドされておらず、`String` レシーバを必要とします。`"Kotlin"::isBlank` はバインドされており、パラメータを取りません。

## ラムダ式と匿名関数 {id="lambda-expressions-and-anonymous-functions"}

ラムダ式と匿名関数は*関数リテラル*です。関数リテラルとは、明示的に宣言されず、式として直接渡される関数のことです。次の例を考えてみましょう。

```kotlin
max(strings, { a, b -> a.length < b.length })
```

関数 `max` は、第2引数として関数値を受け取るため高階関数です。この第2引数は、それ自体が関数である式（関数リテラルと呼ばれます）であり、次の名前付き関数と同等です。

```kotlin
fun compare(a: String, b: String): Boolean = a.length < b.length
```

`suspend` キーワードを使用して、*サスペンディングラムダ式*（suspending lambda expression）を作成することもできます。
サスペンディングラムダは関数型 `suspend () -> Unit` を持ち、他のサスペンド関数を呼び出すことができます。

```kotlin
val suspendingTask = suspend { doSuspendingWork() }
```

### ラムダ式の構文 {id="lambda-expression-syntax"}

ラムダ式の完全な構文形式は次のとおりです。

```kotlin
val sum: (Int, Int) -> Int = { x: Int, y: Int -> x + y }
```

* ラムダ式は常に中括弧（波括弧）で囲まれます。
* 完全な構文形式におけるパラメータ宣言は中括弧の内側に配置され、オプションで型アノテーションを付けることができます。
* ボディ（本体）は `->` の後に続きます。
* ラムダの推論された戻り値の型が `Unit` でない場合、ラムダ本体内の最後（または単一）の式が戻り値として扱われます。

オプションのアノテーションをすべて省略すると、残りは次のようになります。

```kotlin
val sum = { x: Int, y: Int -> x + y }
```

### 末尾のラムダの受け渡し {id="passing-trailing-lambdas"}

Kotlinの慣例では、関数の最後のパラメータが関数である場合、対応する引数として渡されるラムダ式を括弧の外側に配置できます。

```kotlin
val product = items.fold(1) { acc, e -> acc * e }
```

このような構文は、*末尾のラムダ（trailing lambda）*としても知られています。

その呼び出しにおいてラムダが唯一の引数である場合、括弧を完全に省略できます。

```kotlin
run { println("...") }
```

### it: 単一パラメータの暗黙的な名前 {id="it-implicit-name-of-a-single-parameter"}

ラムダ式がパラメータを1つしか持たないことは非常によくあります。

コンパイラがパラメータなしでシグネチャを解析できる場合、パラメータを宣言する必要はなく、`->` も省略できます。パラメータは暗黙的に `it` という名前で宣言されます。

```kotlin
ints.filter { it > 0 } // このリテラルは '(it: Int) -> Boolean' 型です
```

### ラムダ式からの値の返却 {id="returning-a-value-from-a-lambda-expression"}

[修飾付き return（qualified return）](returns.md#return-to-labels) 構文を使用すると、ラムダから明示的に値を返すことができます。そうでない場合は、最後の式の値が暗黙的に返されます。

したがって、次の2つのコードスニペットは等価です。

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

この慣例と[ラムダ式を括弧の外側に渡すこと](#passing-trailing-lambdas)により、[LINQスタイル](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/linq/)のコードを記述できます。

```kotlin
strings.filter { it.length == 5 }.sortedBy { it }.map { it.uppercase() }
```

### 未使用の変数に対するアンダースコア {id="underscore-for-unused-variables"}

ラムダのパラメータが使用されていない場合は、その名前の代わりにアンダースコアを配置できます。

```kotlin
map.forEach { (_, value) -> println("$value!") }
```

### ラムダでの分解 {id="destructuring-in-lambdas"}

ラムダでの分解は、[分解宣言（destructuring declarations）](destructuring-declarations.md#destructuring-in-lambdas)の一部として説明されています。

### 匿名関数 {id="anonymous-functions"}

上記のラムダ式の構文には、関数の戻り値の型を指定する機能が欠けています。ほとんどの場合、戻り値の型は自動的に推論できるため、これは不要です。ただし、明示的に指定する必要がある場合は、代替構文である*匿名関数*を使用できます。

```kotlin
fun(x: Int, y: Int): Int = x + y
```

匿名関数は、名前が省略されている点を除けば、通常の関数宣言と非常によく似ています。その本体は、式（上記参照）またはブロックのいずれかになります。

```kotlin
fun(x: Int, y: Int): Int {
    return x + y
}
```

パラメータと戻り値の型は、通常の関数と同じ方法で指定されます。ただし、コンテキストからパラメータ型が推論できる場合は、パラメータ型を省略できます。

```kotlin
ints.filter(fun(item) = item > 0)
```

匿名関数の戻り値型の推論は、通常の関数とまったく同じように機能します。式本体を持つ匿名関数の場合、戻り値の型は自動的に推論されますが、ブロック本体を持つ匿名関数の場合は、明示的に指定する必要があります（または `Unit` とみなされます）。

> 匿名関数をパラメータとして渡す場合は、括弧の内側に配置してください。関数を括弧の外側に残すことができる省略構文は、ラムダ式でのみ機能します。
>
{style="note"}

ラムダ式と匿名関数のもう1つの違いは、[ノンローカルリターン（non-local returns）](inline-functions.md#returns)の動作です。ラベルのない `return` 文は、常に `fun` キーワードで宣言された関数から戻ります。つまり、ラムダ式内の `return` はそれを囲む外側の関数から戻りますが、匿名関数内の `return` は匿名関数自体から戻ります。

### クロージャ {id="closures"}

ラムダ式または匿名関数（および[ローカル関数](functions.md#local-functions)や[オブジェクト式](object-declarations.md#object-expressions)）は、外部スコープで宣言された変数を含むその*クロージャ*にアクセスできます。クロージャでキャプチャされた変数は、ラムダ内で変更できます。

```kotlin
var sum = 0
ints.filter { it > 0 }.forEach {
    sum += it
}
print(sum)
```

### レシーバ付き関数リテラル {id="function-literals-with-receiver"}

`A.(B) -> C` などのレシーバ付き[関数型](#function-types)は、特殊な形式の関数リテラルである「レシーバ付き関数リテラル」を使用してインスタンス化できます。

上述のとおり、Kotlinでは*レシーバオブジェクト*を提供しながら、レシーバ付き関数型の[インスタンスを呼び出す](#invoking-a-function-type-instance)機能を提供しています。

関数リテラルの本体内部では、呼び出しに渡されたレシーバオブジェクトが*暗黙的な* `this` になるため、追加の修飾子なしでそのレシーバオブジェクトのメンバーにアクセスしたり、[`this` 式](this-expressions.md)を使用してレシーバオブジェクトにアクセスしたりできます。

この動作は[拡張関数](extensions.md)と似ており、拡張関数でも関数本体の内部でレシーバオブジェクトのメンバーにアクセスできます。

以下は、レシーバ付き関数リテラルとその型の例であり、レシーバオブジェクトに対して `plus` が呼び出されています。

```kotlin
val sum: Int.(Int) -> Int = { other -> plus(other) }
```

匿名関数の構文を使用すると、関数リテラルのレシーバ型を直接指定できます。これは、レシーバ付き関数型の変数を宣言し、後でそれを使用する必要がある場合に役立ちます。

```kotlin
val sum = fun Int.(other: Int): Int = this + other
```

コンテキストからレシーバ型を推論できる場合、ラムダ式をレシーバ付き関数リテラルとして使用できます。その使用法の最も重要な例の1つが、[型安全ビルダー](type-safe-builders.md)です。

```kotlin
class HTML {
    fun body() { ... }
}

fun html(init: HTML.() -> Unit): HTML {
    val html = HTML()  // レシーバオブジェクトを作成
    html.init()        // レシーバオブジェクトをラムダに渡す
    return html
}

html {       // レシーバ付きラムダがここから始まる
    body()   // レシーバオブジェクトのメソッドを呼び出す
}
```