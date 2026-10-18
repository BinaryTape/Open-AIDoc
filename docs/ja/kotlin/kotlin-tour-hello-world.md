[//]: # (title: Hello world)

<no-index/>

以下は "Hello, world!" を出力するシンプルなプログラムです:

```kotlin
fun main() {
    println("Hello, world!")
    // Hello, world!
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="hello-world-kotlin"}

Kotlin において:

* `fun` は関数を宣言するために使用されます
* `main()` 関数はプログラムの実行が開始される場所です
* 関数の本体は波括弧 `{}` 内に記述します
* [`println()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/println.html) および [`print()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/print.html) 関数は、引数を標準出力に出力します

関数とは、特定のタスクを実行する一連の命令です。一度関数を作成すれば、同じ命令を何度も書き直すことなく、そのタスクを実行する必要があるときにいつでも呼び出すことができます。関数についての詳細は後の章で詳しく説明します。それまでは、すべてのサンプルで `main()` 関数を使用します。

## 変数 {id="variables"}

すべてのプログラムはデータを保持できる必要があり、変数はまさにそのために役立ちます。Kotlin では、以下を宣言できます:

* `val` による読み取り専用変数
* `var` による変更可能変数

> 読み取り専用変数は、一度値を代入すると変更できません。
>
{style="note"}

値を代入するには、代入演算子 `=` を使用します。

例:

```kotlin
fun main() { 
//sampleStart
    val popcorn = 5    // ポップコーンが5箱あります
    val hotdog = 7     // ホットドッグが7個あります
    var customers = 10 // 列に10人の客が並んでいます
    
    // 何人かの客が列から離れます
    customers = 8
    println(customers)
    // 8
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-variables"}

> 変数は、プログラムの先頭にある `main()` 関数の外側でも宣言できます。このように宣言された変数は、**トップレベル**で宣言されたと呼ばれます。
> 
{style="tip"}

`customers` は変更可能変数であるため、宣言後に値を再代入できます。

> デフォルトでは、すべての変数を読み取り専用（`val`）として宣言することをお勧めします。変更可能変数（`var`）は、本当に必要な場合にのみ使用してください。そうすることで、変更されるべきでないものを誤って変更してしまうリスクを減らすことができます。
> 
{style="note"}

## 文字列テンプレート {id="string-templates"}

変数の内容を標準出力に出力する方法を知っておくと便利です。これは**文字列テンプレート**（string templates）を使って行うことができます。
テンプレート式を使用すると、変数やその他のオブジェクトに格納されているデータにアクセスし、それらを文字列に変換できます。
文字列の値は、ダブルクォーテーション `"` で囲まれた文字列です。テンプレート式は常にドル記号 `$` で始まります。

テンプレート式内でコード片を評価するには、ドル記号 `$` の後ろにコードを波括弧 `{}` で囲んで配置します。

例:

```kotlin
fun main() { 
//sampleStart
    val customers = 10
    println("There are $customers customers")
    // There are 10 customers
    
    println("There are ${customers + 1} customers")
    // There are 11 customers
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-string-templates"}

詳細については、[文字列テンプレート](strings.md#string-templates)を参照してください。

変数に対して型が宣言されていないことにお気づきかもしれません。Kotlin が自動的に型を推論しました（この場合は `Int`）。このツアーでは、[次の章](kotlin-tour-basic-types.md)で Kotlin のさまざまな基本型とその宣言方法について説明します。

## 演習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true">
<def title="文字列テンプレートを使用して文を出力する" id="hello-world-exercise-1">

プログラムが標準出力に `"Mary is 20 years old"` と出力するようにコードを完成させてください:

```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    // ここにコードを記述してください
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-hello-world-exercise"}

```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    println("$name is $age years old")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-hello-world-solution"}

</def>
</deflist>

<seealso></seealso>

<list id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-basic-types.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>