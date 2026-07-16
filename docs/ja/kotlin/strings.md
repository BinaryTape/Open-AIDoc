[//]: # (title: 文字列)

Kotlinの文字列は [`String`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/) 型で表されます。

> JVMでは、UTF-16エンコーディングの `String` 型オブジェクトは、1文字あたり約2バイトを使用します。
> 
{style="note"}

一般に、文字列の値はダブルクォート（`"`）で囲まれた文字のシーケンスです。

```kotlin
val str = "abcd 123"
```

文字列の要素は文字（character）であり、インデックス操作 `s[i]` でアクセスできます。
これらの文字は `for` ループで反復処理できます。

```kotlin
fun main() {
    val str = "abcd" 
//sampleStart
    for (c in str) {
        println(c)
    }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

文字列は不変（immutable）です。一度文字列を初期化すると、その値を変更したり、新しい値を代入したりすることはできません。
文字列を変換するすべての操作は、元の文字列は変更せずに、その結果を新しい `String` オブジェクトとして返します。

```kotlin
fun main() {
//sampleStart
    val str = "abcd"
   
    // 新しい String オブジェクトを作成して出力します
    println(str.uppercase())
    // ABCD
   
    // 元の文字列はそのままです
    println(str) 
    // abcd
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

文字列を連結するには、`+` 演算子を使用します。これは、式の最初の要素が文字列である限り、文字列と他の型の値を連結する場合にも機能します。

```kotlin
fun main() {
//sampleStart
    val s = "abc" + 1
    println(s + "def")
    // abc1def    
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

> ほとんどの場合、文字列の連結よりも[文字列テンプレート](#文字列テンプレート)や[マルチライン文字列](#マルチライン文字列)を使用するのが好ましいです。
> 
{style="note"}

## 文字列リテラル

Kotlinには2種類の文字列リテラルがあります。

* [エスケープ文字列](#エスケープ文字列)
* [マルチライン文字列](#マルチライン文字列)

### エスケープ文字列

*エスケープ文字列*は、エスケープされた文字を含むことができます。
エスケープ文字列の例は以下の通りです。

```kotlin
val s = "Hello, world!
"
```

エスケープは、慣習的な方法であるバックスラッシュ（`\`）を使用して行われます。
サポートされているエスケープシーケンスの一覧については、[文字（Characters）](characters.md)のページを参照してください。

### マルチライン文字列

*マルチライン文字列*は、改行や任意のテキストを含むことができます。これはトリプルクォート（`"""`）で囲まれ、エスケープを含まず、改行やその他の任意の文字を含むことができます。

```kotlin
val text = """
    for (c in "foo")
        print(c)
    """
```

マルチライン文字列から先頭の空白を削除するには、[`trimMargin()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/trim-margin.html) 関数を使用します。

```kotlin
val text = """
    |Tell me and I forget.
    |Teach me and I remember.
    |Involve me and I learn.
    |(Benjamin Franklin)
    """.trimMargin()
```

デフォルトでは、パイプ記号 `|` がマージン接頭辞として使用されますが、別の文字を選択して `trimMargin(">")` のようにパラメータとして渡すこともできます。

## 文字列テンプレート

文字列リテラルには*テンプレート式*を含めることができます。これは評価されるコードの一部であり、その結果が文字列に連結されます。
テンプレート式が処理されるとき、Kotlinは自動的に式の全体の結果に対して `.toString()` 関数を呼び出し、文字列に変換します。テンプレート式はドル記号（`$`）で始まり、変数名で構成されます。

```kotlin
fun main() {
//sampleStart
    val i = 10
    println("i = $i") 
    // i = 10
    
    val letters = listOf("a","b","c","d","e")
    println("Letters: $letters") 
    // Letters: [a, b, c, d, e]

//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

または、中括弧内の式で構成されます。

```kotlin
fun main() {
//sampleStart
    val s = "abc"
    println("$s.length is ${s.length}") 
    // abc.length is 3
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

テンプレートは、マルチライン文字列とエスケープ文字列の両方で使用できます。ただし、マルチライン文字列はバックスラッシュによるエスケープをサポートしていません。
マルチライン文字列内で、[識別子](https://kotlinlang.org/grammar/#identifiers)の先頭に使用可能な記号の前にドル記号をリテラルとして挿入するには、次の構文を使用します。

```kotlin
val price = """
${'$'}9.99
"""
```

> 文字列内での `${'$'}` シーケンスを避けるために、実験的な[マルチドル文字列補間（multi-dollar string interpolation）機能](#マルチドル文字列補間)を使用できます。
>
{style="note"}

### マルチドル文字列補間

マルチドル文字列補間を使用すると、補間をトリガーするために必要な連続したドル記号の数を指定できます。
補間とは、変数や式を文字列に直接埋め込むプロセスです。

1行の文字列については[リテラルをエスケープ](#エスケープ文字列)できますが、Kotlinのマルチライン文字列はバックスラッシュによるエスケープをサポートしていません。
ドル記号（`$`）をリテラル文字として含めるには、文字列補間を防ぐために `${'$'}` 構文を使用する必要があります。
この方法は、特に文字列に複数のドル記号が含まれている場合、コードを読みにくくする可能性があります。

マルチドル文字列補間は、1行の文字列とマルチライン文字列の両方でドル記号をリテラル文字として扱えるようにすることで、これを簡素化します。
例えば：

```kotlin
val `KClass<*>`.jsonSchema : String
    get() = $"""
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "$id": "https://example.com/product.schema.json",
      "$dynamicAnchor": "meta",
      "title": "${simpleName ?: qualifiedName ?: "unknown"}",
      "type": "object"
    }
    """
```

ここで、`$` プレフィックスは、文字列補間をトリガーするために2つの連続したドル記号が必要であることを指定しています。
単一のドル記号はリテラル文字のままとなります。

補間をトリガーするドル記号の数は調整可能です。
例えば、3つの連続したドル記号（`$$` プレフィックス）を使用すると、`$$$` で補間を有効にしつつ、`$` と `$$` をリテラルとして残すことができます。

```kotlin
val productName = "carrot"
val requestedData =
    $$"""{
      "currency": "$",
      "enteredAmount": "42.45 $",
      "$serviceField": "none",
      "product": "$$productName"
    }
    """

println(requestedData)
//{
//    "currency": "$",
//    "enteredAmount": "42.45 $",
//    "$serviceField": "none",
//    "product": "carrot"
//}
```

ここでは、`$$` プレフィックスにより、エスケープのための `${'$'}` 構文を必要とせずに、文字列に `$` を含めることができます。

マルチドル文字列補間は、単一のドル記号による補間を使用している既存のコードには影響しません。
これまで通り単一の `$` を使用し、文字列内でリテラルのドル記号を扱う必要がある場合にマルチドル記号を適用することができます。

## 文字列の書式設定

> `String.format()` 関数による文字列の書式設定（string formatting）は、Kotlin/JVMでのみ利用可能です。
>
{style="note"}

特定の要件に合わせて文字列を書式設定するには、[`String.format()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/format.html) 関数を使用します。

`String.format()` 関数は、書式文字列と1つ以上の引数を受け取ります。書式文字列には、特定の引数に対する1つのプレースホルダー（`%` で示される）が含まれ、その後に書式指定子が続きます。
書式指定子は、対応する引数のための書式設定命令であり、フラグ、幅、精度、および変換タイプで構成されます。これら書式指定子が合わさって、出力のフォーマットを形作ります。一般的な書式指定子には、整数の場合の `%d`、浮動小数点数の場合の `%f`、文字列の場合の `%s` などがあります。また、`argument_index$` 構文を使用して、書式文字列内で同じ引数を異なる形式で複数回参照することもできます。

> 書式指定子の詳細な理解と広範なリストについては、[JavaのFormatterクラスのドキュメント](https://docs.oracle.com/javase/8/docs/api/java/util/Formatter.html#summary)を参照してください。
>
{style="note"}

例を見てみましょう：

```kotlin
fun main() { 
//sampleStart
    // 整数を書式設定し、先頭にゼロを追加して7文字の長さにします
    val integerNumber = String.format("%07d", 31416)
    println(integerNumber)
    // 0031416

    // 浮動小数点数を、+記号を表示し小数点以下4桁まで表示するように書式設定します
    val floatNumber = String.format("%+.4f", 3.141592)
    println(floatNumber)
    // +3.1416

    // 2つの文字列を大文字に書式設定します。それぞれが1つのプレースホルダーを使用します
    val helloString = String.format("%S %S", "hello", "world")
    println(helloString)
    // HELLO WORLD
    
    // 負の数を括弧で囲むように書式設定し、その後 `argument_index$` を使用して
    // 同じ数値を異なる形式（括弧なし）で繰り返します
    val negativeNumberInParentheses = String.format("%(d means %1\$d", -31416)
    println(negativeNumberInParentheses)
    //(31416) means -31416
//sampleEnd    
}
```
{interpolate-variables="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

`String.format()` 関数は、文字列テンプレートと同様の機能を提供します。ただし、`String.format()` 関数は利用可能な書式設定オプションがより多いため、より多用途です。

さらに、変数から書式文字列を割り当てることもできます。これは、ユーザーのロケールに依存するローカライゼーションの場合など、書式文字列が変化する場合に便利です。

`String.format()` 関数を使用する際は、引数の数や位置が対応するプレースホルダーと不一致になりやすいため、注意してください。