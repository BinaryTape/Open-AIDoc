[//]: # (title: 基本構文の概要)

これは基本的な構文要素と例をまとめたものです。各セクションの最後には、関連するトピックの詳細な説明へのリンクがあります。

また、JetBrains Academy による無料の [Kotlin Core トラック](https://hyperskill.org/tracks?category=4&utm_source=jbkotlin_hs&utm_medium=referral&utm_campaign=kotlinlang-docs&utm_content=button_1&utm_term=22.03.23) で、Kotlin の基礎をすべて学ぶこともできます。

## パッケージの定義とインポート {id="package-definition-and-imports"}

パッケージの指定は、ソースファイルの先頭に記述する必要があります。

```kotlin
package my.demo

import kotlin.text.*

// ...
```

ディレクトリとパッケージを一致させる必要はありません。ソースファイルはファイルシステム内の任意の場所に配置できます。

詳細は [パッケージ](packages.md) を参照してください。

## プログラムのエントリポイント {id="program-entry-point"}

Kotlin アプリケーションのエントリポイントは `main` 関数です。

```kotlin
fun main() {
    println("Hello world!")
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-hello-world"}

`main` のもう1つの形式は、可変個の `String` 引数を受け取ります。

```kotlin
fun main(args: Array<String>) {
    println(args.contentToString())
}
```
{kotlin-runnable="true"}

## 標準出力への出力 {id="print-to-the-standard-output"}

`print` は引数を標準出力に出力します。

```kotlin
fun main() {
//sampleStart
    print("Hello ")
    print("world!")
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-print"}

`println` は引数を出力して改行を追加するため、次に出力する内容は次の行に表示されます。

```kotlin
fun main() {
//sampleStart
    println("Hello world!")
    println(42)
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-println"}

## 標準入力からの読み込み {id="read-from-the-standard-input"}

`readln()` 関数は標準入力から読み取ります。この関数は、ユーザーが入力した行全体を文字列として読み取ります。

`println()`、`readln()`、`print()` 関数を組み合わせて使用することで、ユーザーに入力を促し、入力内容を表示するメッセージを出力できます。

```kotlin
// 入力を促すメッセージを出力
println("Enter any word: ")

// ユーザー入力を読み取って保存（例: Happiness）
val yourWord = readln()

// 入力内容を含むメッセージを出力
print("You entered the word: ")
print(yourWord)
// You entered the word: Happiness
```

詳細については、[標準入力の読み込み](read-standard-input.md) を参照してください。

## 関数 {id="functions"}

2つの `Int` 型パラメータと `Int` 型の戻り値を持つ関数：

```kotlin
//sampleStart
fun sum(a: Int, b: Int): Int {
    return a + b
}
//sampleEnd

fun main() {
    print("sum of 3 and 5 is ")
    println(sum(3, 5))
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-return-int"}

関数本体を式にすることもできます。その場合、戻り値の型は推論されます。

```kotlin
//sampleStart
fun sum(a: Int, b: Int) = a + b
//sampleEnd

fun main() {
    println("sum of 19 and 23 is ${sum(19, 23)}")
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-function-expression"}

意味のある値を返さない関数：

```kotlin
//sampleStart
fun printSum(a: Int, b: Int): Unit {
    println("sum of $a and $b is ${a + b}")
}
//sampleEnd

fun main() {
    printSum(-1, 8)
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-return-unit"}

`Unit` 戻り値の型は省略可能です。

```kotlin
//sampleStart
fun printSum(a: Int, b: Int) {
    println("sum of $a and $b is ${a + b}")
}
//sampleEnd

fun main() {
    printSum(-1, 8)
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-function-omit-unit"}

詳細は [関数](functions.md) を参照してください。

## 変数 {id="variables"}

Kotlin では、`val` または `var` のキーワードで始まり、その後に変数名を続けて変数を宣言します。

一度だけ値が代入される変数を宣言するには、`val` キーワードを使用します。これらはイミュータブル（不変）な読み取り専用のローカル変数であり、初期化後に別の値を再代入することはできません。

```kotlin
fun main() {
//sampleStart
    // 変数 x を宣言し、値 5 で初期化
    val x: Int = 5
    // 5
//sampleEnd
    println(x)
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-val"}

再代入可能な変数を宣言するには、`var` キーワードを使用します。これらはミュータブル（可変）な変数であり、初期化後に値を変更できます。

```kotlin
fun main() {
//sampleStart
    // 変数 x を宣言し、値 5 で初期化
    var x: Int = 5
    // 変数 x に新しい値 6 を再代入
    x += 1
    // 6
//sampleEnd
    println(x)
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-var"}

Kotlin は型推論をサポートしており、宣言された変数のデータ型を自動的に識別します。変数を宣言する際、変数名の後の型指定を省略できます。

```kotlin
fun main() {
//sampleStart
    // 値 5 で変数 x を宣言（`Int` 型が推論される）
    val x = 5
    // 5
//sampleEnd
    println(x)
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-inference"}

変数は初期化した後にのみ使用できます。宣言と同時に変数を初期化することも、まず変数を宣言して後から初期化することも可能です。後者の場合は、データ型を指定する必要があります。

```kotlin
fun main() {
//sampleStart
    // 宣言と同時に変数 x を初期化（型指定は不要）
    val x = 5
    // 初期化せずに変数 c を宣言（型指定が必要）
    val c: Int
    // 宣言後に変数 c を初期化
    c = 3
    // 5 
    // 3
//sampleEnd
    println(x)
    println(c)
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-initialize"}

トップレベルで変数を宣言することもできます。

```kotlin
//sampleStart
val PI = 3.14
var x = 0

fun incrementX() {
    x += 1
}
// x = 0; PI = 3.14
// incrementX()
// x = 1; PI = 3.14
//sampleEnd

fun main() {
    println("x = $x; PI = $PI")
    incrementX()
    println("incrementX()")
    println("x = $x; PI = $PI")
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-variable-top-level"}

プロパティの宣言に関する詳細は、[プロパティ](properties.md) を参照してください。

## クラスとインスタンスの作成 {id="creating-classes-and-instances"}

クラスを定義するには、`class` キーワードを使用します。
```kotlin
class Shape
```

クラスのプロパティは、その宣言または本体に記述できます。

```kotlin
class Rectangle(val height: Double, val length: Double) {
    val perimeter = (height + length) * 2 
}
```

クラス宣言にリストされたパラメータを持つデフォルトコンストラクタは、自動的に利用可能になります。

```kotlin
class Rectangle(val height: Double, val length: Double) {
    val perimeter = (height + length) * 2 
}
fun main() {
    val rectangle = Rectangle(5.0, 2.0)
    println("The perimeter is ${rectangle.perimeter}")
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-class-constructor"}

クラス間の継承はコロン（`:`）で宣言します。クラスはデフォルトで `final` です。クラスを継承可能にするには、`open` としてマークします。

```kotlin
open class Shape

class Rectangle(val height: Double, val length: Double): Shape() {
    val perimeter = (height + length) * 2 
}
```

コンストラクタと継承の詳細については、[クラス](classes.md) および [オブジェクトとインスタンス](object-declarations.md) を参照してください。

## コメント {id="comments"}

最近の多くの言語と同様に、Kotlin は単一行（行末）コメントと複数行（ブロック）コメントをサポートしています。

```kotlin
// これは行末コメントです

/* これは複数行にわたる
   ブロックコメントです。 */
```

Kotlin のブロックコメントはネスト（入れ子）にすることができます。

```kotlin
/* コメントはここから始まり
/* ネストされたコメントを含み *​/  
ここで終わります。 */
```

ドキュメントコメントの構文に関する情報は、[Kotlin コードのドキュメント化](kotlin-doc.md) を参照してください。

## 文字列テンプレート {id="string-templates"}

```kotlin
fun main() {
//sampleStart
    var a = 1
    // テンプレート内の単純な名前:
    val s1 = "a is $a" 
    
    a = 2
    // テンプレート内の任意の式:
    val s2 = "${s1.replace("is", "was")}, but now is $a"
//sampleEnd
    println(s2)
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-string-templates"}

詳細は [文字列テンプレート](strings.md#string-templates) を参照してください。

## 条件式 {id="conditional-expressions"}

```kotlin
//sampleStart
fun maxOf(a: Int, b: Int): Int {
    if (a > b) {
        return a
    } else {
        return b
    }
}
//sampleEnd

fun main() {
    println("max of 0 and 42 is ${maxOf(0, 42)}")
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-conditional-expressions"}

Kotlin では、`if` を式として使用することもできます。

```kotlin
//sampleStart
fun maxOf(a: Int, b: Int) = if (a > b) a else b
//sampleEnd

fun main() {
    println("max of 0 and 42 is ${maxOf(0, 42)}")
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-if-expression"}

詳細は [`if` 式](control-flow.md#if-expression) を参照してください。

## for ループ {id="for-loop"}

```kotlin
fun main() {
//sampleStart
    val items = listOf("apple", "banana", "kiwifruit")
    for (item in items) {
        println(item)
    }
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-for-loop"}

または:

```kotlin
fun main() {
//sampleStart
    val items = listOf("apple", "banana", "kiwifruit")
    for (index in items.indices) {
        println("item at $index is ${items[index]}")
    }
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-for-loop-indices"}

詳細は [for ループ](control-flow.md#for-loops) を参照してください。

## while ループ {id="while-loop"}

```kotlin
fun main() {
//sampleStart
    val items = listOf("apple", "banana", "kiwifruit")
    var index = 0
    while (index < items.size) {
        println("item at $index is ${items[index]}")
        index++
    }
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-while-loop"}

詳細は [while ループ](control-flow.md#while-loops) を参照してください。

## when 式 {id="when-expression"}

```kotlin
//sampleStart
fun describe(obj: Any): String =
    when (obj) {
        1          -> "One"
        "Hello"    -> "Greeting"
        is Long    -> "Long"
        !is String -> "Not a string"
        else       -> "Unknown"
    }
//sampleEnd

fun main() {
    println(describe(1))
    println(describe("Hello"))
    println(describe(1000L))
    println(describe(2))
    println(describe("other"))
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-when-expression"}

詳細は [when 式と文](control-flow.md#when-expressions-and-statements) を参照してください。

## 範囲（Range） {id="ranges"}

`in` 演算子を使用して、数値が範囲内にあるかどうかをチェックします。

```kotlin
fun main() {
//sampleStart
    val x = 10
    val y = 9
    if (x in 1..y+1) {
        println("fits in range")
    }
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-range-in"}

数値が範囲外にあるかどうかをチェックします。

```kotlin
fun main() {
//sampleStart
    val list = listOf("a", "b", "c")
    
    if (-1 !in 0..list.lastIndex) {
        println("-1 is out of range")
    }
    if (list.size !in list.indices) {
        println("list size is out of valid list indices range, too")
    }
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-out-of-range"}

範囲を反復処理します。

```kotlin
fun main() {
//sampleStart
    for (x in 1..5) {
        print(x)
    }
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-iterate-range"}

または数列（Progression）を反復処理します。

```kotlin
fun main() {
//sampleStart
    for (x in 1..10 step 2) {
        print(x)
    }
    println()
    for (x in 9 downTo 0 step 3) {
        print(x)
    }
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-iterate-progression"}

詳細は [範囲と数列](ranges.md) を参照してください。

## コレクション {id="collections"}

コレクションを反復処理します。

```kotlin
fun main() {
    val items = listOf("apple", "banana", "kiwifruit")
//sampleStart
    for (item in items) {
        println(item)
    }
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-iterate-collection"}

`in` 演算子を使用して、コレクションにオブジェクトが含まれているかどうかをチェックします。

```kotlin
fun main() {
    val items = setOf("apple", "banana", "kiwifruit")
//sampleStart
    when {
        "orange" in items -> println("juicy")
        "apple" in items -> println("apple is fine too")
    }
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-collection-in"}

[ラムダ式](lambdas.md) を使用して、コレクションのフィルタリングやマッピングを行います。

```kotlin
fun main() {
//sampleStart
    val fruits = listOf("banana", "avocado", "apple", "kiwifruit")
    fruits
      .filter { it.startsWith("a") }
      .sortedBy { it }
      .map { it.uppercase() }
      .forEach { println(it) }
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-collection-filter-map"}

詳細は [コレクションの概要](collections-overview.md) を参照してください。

## null 許容値と null チェック {id="nullable-values-and-null-checks"}

`null` 値の可能性がある場合は、参照を明示的に null 許容（nullable）としてマークする必要があります。null 許容型の名前の末尾には `?` が付きます（例: `Int?`）。

`str` が整数を保持していない場合に `null` を返します。

```kotlin
fun parseInt(str: String): Int? {
    return str.toIntOrNull()
}
```

null 許容値を返す関数の使用例：

```kotlin
fun parseInt(str: String): Int? {
    return str.toIntOrNull()
}

//sampleStart
fun printProduct(arg1: String, arg2: String) {
    val x = parseInt(arg1)
    val y = parseInt(arg2)

    // null を保持している可能性があるため、`x * y` を使用するとエラーになります。
    if (x != null && y != null) {
        // null チェックの後、x と y は自動的に非 null 型にキャストされます
        println(x * y)
    }
    else {
        println("'$arg1' or '$arg2' is not a number")
    }    
}
//sampleEnd

fun main() {
    printProduct("6", "7")
    printProduct("a", "7")
    printProduct("a", "b")
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-function-nullable-value"}

または:

```kotlin
fun parseInt(str: String): Int? {
    return str.toIntOrNull()
}

fun printProduct(arg1: String, arg2: String) {
    val x = parseInt(arg1)
    val y = parseInt(arg2)
    
//sampleStart
    // ...
    if (x == null) {
        println("Wrong number format in arg1: '$arg1'")
        return
    }
    if (y == null) {
        println("Wrong number format in arg2: '$arg2'")
        return
    }

    // null チェックの後、x と y は自動的に非 null 型にキャストされます
    println(x * y)
//sampleEnd
}

fun main() {
    printProduct("6", "7")
    printProduct("a", "7")
    printProduct("99", "b")
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-function-null-check"}

詳細は [null 安全（Null-safety）](null-safety.md) を参照してください。

## 型チェックと自動キャスト {id="type-checks-and-automatic-casts"}

`is` 演算子は、式が特定の型のインスタンスであるかどうかをチェックします。
不変なローカル変数またはプロパティが特定の型としてチェックされている場合、明示的にキャストする必要はありません。

```kotlin
//sampleStart
fun getStringLength(obj: Any): Int? {
    if (obj is String) {
        // このブランチ内では `obj` は自動的に `String` にキャストされます
        return obj.length
    }

    // 型チェックされたブランチの外では、`obj` は依然として `Any` 型のままです
    return null
}
//sampleEnd

fun main() {
    fun printLength(obj: Any) {
        println("Getting the length of '$obj'. Result: ${getStringLength(obj) ?: "Error: The object is not a string"} ")
    }
    printLength("Incomprehensibilities")
    printLength(1000)
    printLength(listOf(Any()))
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-is-operator"}

または:

```kotlin
//sampleStart
fun getStringLength(obj: Any): Int? {
    if (obj !is String) return null

    // このブランチ内では `obj` は自動的に `String` にキャストされます
    return obj.length
}
//sampleEnd

fun main() {
    fun printLength(obj: Any) {
        println("Getting the length of '$obj'. Result: ${getStringLength(obj) ?: "Error: The object is not a string"} ")
    }
    printLength("Incomprehensibilities")
    printLength(1000)
    printLength(listOf(Any()))
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-is-operator-expression"}

さらには以下のようにも記述できます。

```kotlin
//sampleStart
fun getStringLength(obj: Any): Int? {
    // `&&` の右辺では `obj` は自動的に `String` にキャストされます
    if (obj is String && obj.length >= 0) {
        return obj.length
    }

    return null
}
//sampleEnd

fun main() {
    fun printLength(obj: Any) {
        println("Getting the length of '$obj'. Result: ${getStringLength(obj) ?: "Error: The object is not a string"} ")
    }
    printLength("Incomprehensibilities")
    printLength("")
    printLength(1000)
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-is-operator-logic"}

詳細は [クラス](classes.md) および [型キャスト](typecasts.md) を参照してください。