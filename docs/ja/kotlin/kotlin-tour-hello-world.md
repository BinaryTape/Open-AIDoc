[//]: # (title: Hello world)

<no-index/>

以下は「Hello, world!」を出力するシンプルなプログラムです：

```kotlin
fun main() {
    println("Hello, world!")
    // Hello, world!
}
```
{kotlin-runnable="true" id="hello-world-kotlin"}

Kotlinでは:

* `fun` は関数を宣言するために使用します
* `main()` 関数はプログラムの開始地点です
* 関数の本体は波括弧 `{}` の中に記述します
* [`println()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/println.html) および [`print()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/print.html) 関数は、引数を標準出力に出力します

関数とは、特定のタスクを実行する一連の命令のまとまりです。一度関数を作成すれば、そのタスクを実行する必要があるときにいつでも再利用でき、命令を何度も書き直す必要がなくなります。関数については、後の章で詳しく説明します。それまでは、すべてのサンプルで `main()` 関数を使用します。

## 変数 {id="variables"}

すべてのプログラムは何らかのデータを保存する必要があり、変数はまさにその役割を果たします。Kotlinでは、以下を宣言できます：

* `val` による読み取り専用変数
* `var` による可変変数

> 読み取り専用変数には、一度値を代入すると変更できません。
>
{style="note"}

値を代入するには、代入演算子 `=` を使用します。

例：

```kotlin
fun main() { 
//sampleStart
    val popcorn = 5    // ポップコーンが5個
    val hotdog = 7     // ホットドッグが7個
    var customers = 10 // 列に10人の客がいる
    
    // 何人かの客が列を離れる
    customers = 8
    println(customers)
    // 8
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-variables"}

> 変数は、プログラムの先頭で `main()` 関数の外側に宣言することもできます。このように宣言された変数は、**トップレベル**で宣言されたと言います。
> 
{style="tip"}

`customers` は可変変数のため、宣言後に値を再代入できます。

> デフォルトではすべての変数を読み取り専用（`val`）として宣言することをお勧めします。可変変数（`var`）は本当に必要な場合にのみ使用してください。そうすることで、変更されるべきでないものを誤って変更してしまうリスクを減らすことができます。
> 
{style="note"}

## 文字列テンプレート {id="string-templates"}

変数の内容を標準出力に出力する方法を知っておくと便利です。これは**文字列テンプレート**（string templates）を使って行うことができます。テンプレート式を使用すると、変数やその他のオブジェクトに格納されたデータにアクセスし、それらを文字列に変換できます。
文字列の値は、二重引用符 `"` で囲まれた一連の文字です。テンプレート式は常にドル記号 `$` で始まります。

テンプレート式内でコードの一部を評価するには、ドル記号 `$` の後に波括弧 `{}` を置き、その中にコードを記述します。

例：

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
{kotlin-runnable="true" id="kotlin-tour-string-templates"}

詳細については、[文字列テンプレート](strings.md#string-templates)を参照してください。

変数に対して型が宣言されていないことにお気づきかもしれません。Kotlinが型（`Int`）を自動的に推論したためです。このツアーでは、[次の章](kotlin-tour-basic-types.md)でKotlinのさまざまな基本型とその宣言方法について説明します。

## 練習問題 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true">
<def title="文字列テンプレートを使用して文を出力する" id="hello-world-exercise-1">

プログラムが `"Mary is 20 years old"` を標準出力に出力するようにコードを完成させてください：

```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    // ここにコードを書いてください
}
```
{validate="false" kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/HelloWorldTest.kt" id="kotlin-tour-hello-world-exercise"}

```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    println("$name is $age years old")
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/HelloWorldTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-hello-world-solution"}

</def>
</deflist>

<seealso></seealso>

<list id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-basic-types.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>