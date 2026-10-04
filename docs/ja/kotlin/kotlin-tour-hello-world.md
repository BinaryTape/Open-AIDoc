[//]: # (title: Hello world)

<no-index/>

以下は、「Hello, world!」を出力するシンプルなプログラムです。

```kotlin
fun main() {
    println("Hello, world!")
    // Hello, world!
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="hello-world-kotlin"}

Kotlinにおいて：

* `fun` は関数を宣言するために使用されます
* `main()` 関数はプログラムの開始地点です
* 関数の本体（ボディ）は波括弧 `{}` の中に記述します
* [`println()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/println.html) および [`print()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/print.html) 関数は、引数を標準出力に出力します

関数とは、特定のタスクを実行する一連の命令です。一度関数を作成すれば、命令を何度も書き直すことなく、そのタスクを実行する必要があるときはいつでも再利用できます。関数については、後の章で詳しく説明します。それまでは、すべての例で `main()` 関数を使用します。

## 変数 {id="variables"}

すべてのプログラムはデータを保存できる必要があり、変数はまさにそのために役立ちます。Kotlinでは、以下を宣言できます。

* `val` を使用した読み取り専用変数
* `var` を使用した変更可能な変数

> 読み取り専用変数は、一度値を設定すると変更できません。
>
{style="note"}

値を代入するには、代入演算子 `=` を使用します。

例：

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

> 変数はプログラムの先頭で、`main()` 関数の外側に宣言することもできます。このように宣言された変数は、**トップレベル**で宣言されたと呼ばれます。
> 
{style="tip"}

`customers` は変更可能な変数であるため、宣言後に値を再代入できます。

> すべての変数はデフォルトで読み取り専用（`val`）として宣言することをお勧めします。変更可能な変数（`var`）は、本当に必要な場合にのみ使用してください。そうすることで、変更するべきではない値を誤って変更してしまうリスクを減らすことができます。
> 
{style="note"}

## 文字列テンプレート {id="string-templates"}

変数の内容を標準出力に出力する方法を知っておくと便利です。これは**文字列テンプレート**（string templates）を使って行うことができます。
テンプレート式を使用すると、変数やその他のオブジェクトに格納されたデータにアクセスし、それらを文字列に変換できます。
文字列の値は、二重引用符 `"` で囲まれた文字の並びです。テンプレート式は常にドル記号 `$` で始まります。

テンプレート式内でコードを評価するには、ドル記号 `$` の後の波括弧 `{}` 内にコードを配置します。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-string-templates"}

詳細については、[文字列テンプレート](strings.md#string-templates)を参照してください。

変数に対して型が宣言されていないことにお気づきかもしれません。Kotlinが自動的に型を推論したためです（ここでは `Int`）。このツアーでは、[次の章](kotlin-tour-basic-types.md)でKotlinのさまざまな基本型とその宣言方法について説明します。

## 演習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true">
<def title="文字列テンプレートを使って文を出力する">

プログラムが標準出力に `"Mary is 20 years old"` と出力するように、コードを完成させてください。

```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    // ここにコードを書いてください
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