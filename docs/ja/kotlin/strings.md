[//]: # (title: 文字列)
[//]: # (description: Kotlinでの文字列リテラル、文字列テンプレート、マルチライン文字列、および一般的なテキスト操作を含む、文字列の扱い方について学びます。)

[`String`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/) 型は、[文字（characters）](characters.md)のシーケンスを表します。単語、文章、メッセージ、あるいは構造化されたテキストなどのテキスト値に使用できます。

`String` 型は不変（immutable）です。`String` オブジェクトを作成した後、その内容はライフサイクルの終わりまで変わりません。文字列を修正しているように見える操作は、実際には新しい文字列を作成しています。

## 文字列の宣言

`String` リテラルを宣言するには、値をダブルクォート（`""`）で囲みます。`String` 型を明示的に指定することも、Kotlinに値から型を推論させることもできます。

```kotlin
val name: String = "Kotlin"
val message = "Hello, world!" // KotlinはStringと推論します
```

ダブルクォートで囲まれた文字列リテラルは、`
` や `\t` などの[エスケープシーケンス](characters.md#escape-sequences)をサポートしています。

```kotlin
val message = "Hello,
world!"
val quote = "Kotlin says, \"Hi\"."
```

### マルチライン文字列

複数行にわたるテキストを保存したり、エスケープしたくない引用符を含めたりする場合は、トリプルクォート（`""" """`）で囲まれたマルチライン文字列を使用します。

```kotlin
val text = """
Hello,
Kotlin
"""

val quote = """Kotlin says, "Hi"."""
```

> マルチライン文字列はエスケープシーケンスをサポートしていません。
> Kotlinはこれらの文字を通常のテキストとして扱います。
>
{style="note"}

マルチライン文字列は、ソースコードに書かれた通りの改行とインデントを保持します。この動作は、実行時の値をファイル内のテキストレイアウトと一致させたい場合に便利です。

次の例では、各行の前のスペースは結果の文字列の一部になります。

```kotlin
val text = """
    Hello,
    Kotlin
"""
```

共通する先頭のインデントを削除するには、[`trimIndent()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/trim-indent.html) 関数を使用します。これは空行ではない行の共通の最小インデントを検出し、それを削除します。

```kotlin
fun main() {
//sampleStart
    val text = """
        Hello,
        Kotlin
    """.trimIndent()
    
    println(text)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

インデントの削除をより明示的に制御するには、[`trimMargin()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/trim-margin.html) 関数を使用します。これは、各行のマージン接頭辞（margin prefix）とその前にあるすべての文字を削除します。

```kotlin
fun main() {
//sampleStart
    val text = """
        |Hello,
        |Kotlin
    """.trimMargin()
    
    println(text)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

デフォルトでは、`trimMargin()` 関数はパイプ記号（`|`）をマージン接頭辞として使用しますが、別の文字をパラメータとして渡すこともできます。例：`trimMargin(">")`。

> `trimIndent()` や `trimMargin()` のような関数で文字列を処理すると、プラットフォームに関係なく、結果の文字列は改行（`
`）セパレータのみを使用します。
>
{style="note"}

## 文字列テンプレート

文字列テンプレートを使用すると、変数や式を `String` リテラルの中に直接埋め込むことができます。このプロセスは *補間（interpolation）* と呼ばれます。文字列テンプレートは、通常の文字列とマルチライン文字列の両方で使用できます。

変数を取り込むには、`$` 記号を使用します。

```kotlin
fun main() { 
//sampleStart
    val name = "Kotlin"
    println("Hello, $name") 
    // Hello, Kotlin
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

文字列の中に式を挿入したり、変数を他のテキストの直後に配置したりするには、`${}` を使用します。

```kotlin
fun main() {
//sampleStart
    val text = "abc"
    println("The length of $text is ${text.length}")
    // The length of abc is 3
      
    val language = "Kotlin"
    println("${language}Lang")
    // KotlinLang
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

> `+` 演算子を使用して文字列を結合することもできます。しかし、通常は文字列テンプレートの方が読みやすく、よりイディオマティック（慣用的）です。
>
{style="tip"}

テンプレート式には、エスケープなしでダブルクォートで囲まれた文字列を含めることもできます。

```kotlin
// ダブルクォートの文字列
val test = "${"test".uppercase()}"

// マルチライン文字列
val result = """
Result: ${"OK".lowercase()}
"""
```

### 文字列テンプレートでの Null 許容値

補間された式や変数が `null` と評価された場合、Kotlinコンパイラは結果の文字列に `null` というテキストを挿入します。`null` を別の値に置き換えるには、[エルビス演算子（Elvis operator）](null-safety.md#elvis-operator)（`?:`）を使用します。

```kotlin 
fun main(){
//sampleStart
    val text: String? = null
  
    println("Hello, $text")
    // Hello, null

    println("Hello, ${text ?: "Kotlin"}")
    // Hello, Kotlin
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### マルチドル文字列補間

通常の文字列テンプレートでは、単一のドル記号（`$`）が補間を開始します。文字列にリテラルのドル記号を含める必要がある場合は、**マルチドル文字列補間（multi-dollar string interpolation）** を使用してください。

マルチドル文字列補間を使用すると、補間をトリガーするために必要な連続したドル記号の数を指定できます。その数に満たないドル記号はリテラル文字として扱われます。

たとえば、文字列リテラルの前に `$$` を使用すると、2つ連続したドル記号がある場合のみ補間が始まります。

```kotlin
val KClass<*>.jsonSchema : String
    get() = $$"""
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "$id": "https://example.com/product.schema.json",
      "$dynamicAnchor": "meta",
      "title": "$${simpleName ?: qualifiedName ?: "unknown"}",
      "type": "object"
    }
    """
```

> 単一ドル記号の文字列補間を使用している場合、マルチドル文字列補間はコードに影響しません。引き続き単一の `$` を使用し、必要に応じてマルチドル記号を適用することができます。
>
{style="tip"}

## 基本的な文字列操作

Kotlinは文字列を扱うためのさまざまな操作を提供しています。このセクションでは、最も一般的に使用される操作のいくつかを紹介します。

> 利用可能なすべての関数については、[APIリファレンス](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/)で詳細を確認してください。
>
{style="tip"}

### 文字列の長さを取得する

文字列内の文字数を取得するには、[`length`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/length.html) プロパティを使用します。

```kotlin 
fun main (){
//sampleStart
    val language = "Kotlin"
    println(language.length)
    // 6
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 文字へのアクセス

インデックス演算子（`[]`）を使用して、文字列内の個々の文字にアクセスできます。

```kotlin 
fun main (){
//sampleStart
    val language = "Kotlin"
    
    println(language[0])
    // K
    println(language[5])
    // n
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

> 文字列のインデックスはゼロから始まります。
> 有効な範囲外のインデックスにアクセスしようとすると、Kotlinは例外をスローします。
>
{style="tip"}

文字列内の文字を反復処理（イテレーション）することもできます。

```kotlin
fun main(){
//sampleStart
    for (char in "Kotlin") {
      println(char)
    }
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 文字列の一部の抽出

文字列の一部を抽出するには、以下のいずれかの関数を使用します。

* [`substring()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/substring.html): 元のテキストの選択された部分を含む新しい文字列を返します。
* [`subSequence()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/sub-sequence.html): 元のテキストの選択された部分を含む `CharSequence` を返します。

例：

```kotlin
fun main() {
//sampleStart    
    val text = "Kotlin"
    println(text.substring(1))
    // otlin
    println(text.substring(1, 5))
    // otli
    println(text.subSequence(1, 5))
    // otli
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

`String` 型は不変であるため、これらの関数は元の文字列を変更しません。

### 文字列の比較

2つの文字列が同じ内容であるかどうかは、`==` 演算子で確認できます。

```kotlin
fun main(){
//sampleStart
    println("kotlin" == "kotlin")
    // true
  
    println("kotlin" == "Kotlin")
    // false
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

また、[`compareTo()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/compare-to.html) 関数を使用して、辞書順（1文字ずつ）で文字列を比較することもできます。この関数は、両方の文字列をスキャンして最初に異なる文字のペアを見つけるまでスキャンし、以下を返します。

* 文字列が等しい場合は `0`。
* レシーバーが引数より小さい場合は、`0` より小さい値。
* レシーバーが引数より大きい場合は、`0` より大きい値。

```kotlin
fun main() {
//sampleStart    
    println("abc".compareTo("abd") < 0)
    // true
    
    println("abc".compareTo("ABC") > 0)
    // true
    
    // 大文字小文字の違いを無視するには true を渡します
    println("abc".compareTo("ABC", ignoreCase = true) == 0)
    // true
//sampleEnd  
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 文字列内容の操作

文字列の内容を変更したい場合は、[`.trim()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/trim.html)、[`.replace()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/replace.html)、[`.uppercase()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/uppercase.html)、[`.lowercase()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/lowercase.html) などの関数を使用して、変更されたコピーを作成します。

```kotlin
fun main() {
//sampleStart
    val text = "  Hello, Kotlin  "

    println(text.trim())
    // Hello, Kotlin

    println(text.replace("Kotlin", "world"))
    //   Hello, world  

    println(text.uppercase())
    //   HELLO, KOTLIN  

    println(text.lowercase())
    //   hello, kotlin  
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

また、[`contains()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/contains.html)、[`startsWith()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/starts-with.html)、[`endsWith()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/ends-with.html) 関数を使用して、文字列の内容を検査することもできます。

```kotlin
fun main() { 
//sampleStart
    val domain = "kotlinlang.org"
    
    // 文字列に "." が含まれているか確認します
    println(domain.contains("."))
    // true
    
    // 文字列が "kotlin" で始まっているか確認します
    println(domain.startsWith("kotlin"))
    // true
    
    // 文字列が ".org" で終わっているか確認します
    println(domain.endsWith(".org"))
    // true
//sampleEnd
}
 ```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 文字列の分割

[`split()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/split.html) 関数を使用して、デリミタ（区切り文字）の前後で文字列を分割できます。

```kotlin
fun main() { 
//sampleStart
    val numbers = "one, two, three"
    println(numbers.split(", "))
    // [one, two, three]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

文字列を個々の行に分割したい場合は、[`lines()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/lines.html) 関数を使用します。

```kotlin
fun main() { 
//sampleStart
    val numbers = "one
two
three"
    println(numbers.lines())
    // [one, two, three]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 文字列の構築と書式設定

> Kotlinでのほとんどの書式設定タスクには、[文字列テンプレート](#文字列テンプレート)を使用してください。
>
{style="tip"}

`+` 演算子で文字列を連結すると、操作のたびに新しい `String` オブジェクトが作成されます。しかし、ループ内や多くの断片を組み立てる場合、この方法は効率的ではない可能性があります。そのような問題を避けるために、`buildString()` 関数または `StringBuilder` を使用できます。これらはすべての断片を単一のミュータブル（可変）なバッファに収集し、最後に1つの文字列のみを生成します。

何を追加するかを決定するロジックが複雑な場合は、[`buildString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/build-string.html) 関数を使用してください。たとえば、異なる断片を寄与する複数の条件がある場合です。`buildString()` を使用すると、バッファを直接操作する必要はありません。この関数は内部的に `StringBuilder` を作成し、ブロックを実行して、結果の文字列を返します。

```kotlin
fun main() {
//sampleStart

    val hasErrors = true
    val hasWarnings = true
    val isComplete = false
    
    // buildStringは空のバッファを作成します
    val status = buildString {
        // バッファに "Errors found" を追加します
        if (hasErrors) append("Errors found")
        if (hasWarnings) {
            // バッファが空でない場合、"; " を追加します
            if (isNotEmpty()) append("; ")
            // "Warnings found" を追加します
            append("Warnings found")
        }
        // isComplete = false なので、何も追加されません
        if (isComplete) {
            if (isNotEmpty()) append("; ")
            append("Completed")
        }
        // バッファが空でないため、フォールバック（isEmptyの時）はスキップされます
        if (isEmpty()) append("OK")
    }
    
    println(status)
    // Errors found; Warnings found
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

明示的な値としてバッファが必要な場合は、[`StringBuilder`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/-string-builder/) を使用してください。たとえば、既存のテキストを変更する場合などです。

```kotlin
fun main() {
//sampleStart
    val text = "Hello, Kotlin"
    val builder = StringBuilder(text)

    builder.replace(7, 13, "world")
    println(builder.toString()) 
    // Hello, world
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

JVMでは、[`String.format()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/format.html) 関数を使用して文字列を書式設定することもできます。

```kotlin
val text = String.format("Hello, %s", "Kotlin") 
```  

> JVMでフォーマッタースタイルの指定子が必要な場合にのみ、`String.format()` 関数を使用してください。
> 書式指定子の詳細については、[JavaのFormatterクラスのドキュメント](https://docs.oracle.com/javase/8/docs/api/java/util/Formatter.html#summary)を参照してください。
>
{style="note"}

## 文字列の変換

数値、`Boolean` 値、または入力からの識別子など、他の型の値を表すために文字列を使用することがよくあります。Kotlinは、値を文字列に変換する関数と、文字列を他の型に解析（パース）する関数を提供しています。

値の文字列形式を返すには、[`toString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/to-string.html) 関数を使用します。

```kotlin
val number = 10
val text = number.toString()
```

文字列テンプレートや文字列の連結では、Kotlinは自動的に値を文字列に変換します。

文字列を別の型に変換するには、対応する解析関数を使用します。

* 整数値の場合： [`toByte()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-byte.html)、[`toShort()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-short.html)、[`toInt()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-int.html)、[`toLong()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-long.html)
* 浮動小数点数値の場合： [`toDouble()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-double.html)、[`toFloat()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-float.html)
* Booleanの場合： [`toBoolean()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-boolean.html)、[`toBooleanStrict()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-boolean-strict.html)

文字列が有効な形式である場合、これらの関数は要求された型の値を返します。入力が無効である可能性がある場合は、`OrNull` バリアントを使用してください。これらの関数は例外をスローする代わりに `null` を返すため、ユーザー入力や完全に制御できないデータを扱う際に安全です。

```kotlin
val toInt = "10".toInt() // 10

// 1000000000000 は Int の最大値を超えています
val toIntInvalid = "1000000000000".toIntOrNull()

val toBoolean = "true".toBooleanStrict() // true
val toBooleanInvalid = "yes".toBooleanStrictOrNull() // null