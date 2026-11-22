[//]: # (title: 文字列)
<web-summary>文字列リテラル、文字列テンプレート、複数行文字列、一般的なテキスト操作など、Kotlin で文字列を扱う方法について学びます。</web-summary>

[`String`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/) 型は、[文字 (character)](characters.md) のシーケンスを表します。単語、文、メッセージ、構造化テキストなどのテキスト値に使用できます。

`String` 型はイミュータブル（不変）です。一度 `String` オブジェクトを作成すると、その内容はライフタイム全体を通じて同じ状態を保ちます。文字列を変更しているように見える操作は、実際には新しい文字列を作成しています。

## 文字列の宣言 {id="declare-strings"}

`String` リテラルを宣言するには、値を二重引用符 (`""`) で囲みます。`String` 型を明示的に指定することも、値から Kotlin に型推論させることもできます。

```kotlin
val name: String = "Kotlin"
val message = "Hello, world!" // Kotlin が String を推論
```

二重引用符で囲まれた文字列リテラルは、`\n` や `\t` などの[エスケープシーケンス](characters.md#escape-sequences)をサポートしています。

```kotlin
val message = "Hello,\nworld!"
val quote = "Kotlin says, \"Hi\"."
```

### 複数行文字列 {id="multiline-strings"}

複数行で構成されるテキストや、エスケープしたくない引用符を含むテキストを保存するには、三重引用符 (`""" """`) で囲まれた複数行文字列を使用します。

```kotlin
val text = """
Hello,
Kotlin
"""

val quote = """Kotlin says, "Hi"."""
```

> 複数行文字列はエスケープシーケンスをサポートしていません。
> Kotlin はこれらの文字を通常のテキストとして扱います。
>
{style="note"}

複数行文字列は、ソースコードに記述されたとおりの改行とインデントを保持します。
この動作は、ランタイム時の値をファイル内のテキストレイアウトと一致させたい場合に便利です。

次の例では、各行の前のスペースが結果の文字列の一部になります。

```kotlin
val text = """
    Hello,
    Kotlin
"""
```

共通する先頭のインデントを削除するには、[`trimIndent()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/trim-indent.html) 関数を使用します。この関数は、空行以外の行に共通する最小のインデントを検出し、それを削除します。

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
{kotlin-runnable="true"}

インデントの削除をより明示的に制御するには、[`trimMargin()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/trim-margin.html) 関数を使用します。この関数は、各行のマージンプレフィックス（余白の接頭辞）およびそれより前にあるすべての文字を削除します。

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
{kotlin-runnable="true"}

デフォルトでは、`trimMargin()` 関数はパイプ記号 (`|`) をマージンプレフィックスとして使用しますが、パラメータとして別の文字を渡すこともできます。例: `trimMargin(">")`。

> `trimIndent()` や `trimMargin()` などの関数で文字列を処理すると、プラットフォームに関係なく、結果の文字列には改行コードとしてラインフィード (`\n`) のみが使用されます。
>
{style="note"}

## 文字列テンプレート {id="string-templates"}

文字列テンプレートを使用すると、変数や式を `String` リテラル内に直接埋め込むことができます。
この処理は*文字列補間 (interpolation)* と呼ばれます。文字列テンプレートは、通常の文字列と複数行文字列の両方で使用できます。

文字列に変数を挿入するには、`$` 記号を使用します。

```kotlin
fun main() { 
//sampleStart
    val name = "Kotlin"
    println("Hello, $name") 
    // Hello, Kotlin
//sampleEnd
}
```
{kotlin-runnable="true"}

文字列に式を挿入したり、変数の直後に他のテキストを配置したりするには、`${}` を使用します。

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
{kotlin-runnable="true"}

> `+` 演算子を使用して文字列を連結することもできます。ただし、通常は文字列テンプレートの方が読みやすく、よりイディオマティック（Kotlin らしい書き方）です。
>
{style="tip"}

テンプレート式には、エスケープせずに二重引用符で囲んだ文字列を含めることもできます。

```kotlin
// 二重引用符の文字列
val test = "${"test".uppercase()}"

// 複数行文字列
val result = """
Result: ${"OK".lowercase()}
"""
```

### 文字列テンプレートでの Null 許容値 {id="nullable-values-in-string-templates"}

補間された式や変数が `null` と評価された場合、Kotlin コンパイラは結果の文字列にテキストとして `null` を挿入します。`null` を別の値に置き換えるには、[Elvis 演算子](null-safety.md#elvis-operator) (`?:`) を使用します。

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
{kotlin-runnable="true"}

### マルチドル文字列補間 (Multi-dollar string interpolation) {id="multi-dollar-string-interpolation"}

通常の文字列テンプレートでは、単一のドル記号 (`$`) で補間が始まります。文字列内にリテラルのドル記号を含める必要がある場合は、**マルチドル文字列補間**を使用します。

マルチドル文字列補間を使用すると、補間をトリガーするために必要な連続したドル記号の数を指定できます。その数未満のドル記号は、リテラル文字として扱われます。

たとえば、文字列リテラルの前に `$$` を使用すると、ドル記号が2つ連続した場合にのみ補間が開始されます。

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

> 単一ドルの文字列補間を使用している場合、マルチドル文字列補間が既存のコードに影響を与えることはありません。引き続き単一の `$` を使用でき、必要な場合にのみマルチドル記号を適用できます。
>
{style="tip"}

## 基本的な文字列操作 {id="basic-string-operations"}

Kotlin には、文字列を操作するためのさまざまな操作が用意されています。このセクションでは、最も頻繁に使用される操作のいくつかを紹介します。

> 使用可能なすべての関数の詳細については、[API リファレンス](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/)を参照してください。
>
{style="tip"}

### 文字列の長さを取得する {id="get-string-length"}

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
{kotlin-runnable="true"}

### 文字へのアクセス {id="access-characters"}

インデックス演算子 (`[]`) を使用して、文字列内の個々の文字にアクセスできます。

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
{kotlin-runnable="true"}

> 文字列のインデックスは 0 から始まります。
> 有効な範囲外のインデックスにアクセスしようとすると、Kotlin は例外をスローします。
>
{style="tip"}

文字列内の文字を反復処理することもできます。

```kotlin
fun main(){
//sampleStart
    for (char in "Kotlin") {
      println(char)
    }
//sampleEnd    
}
```
{kotlin-runnable="true"}

### 文字列の一部分を抽出する {id="extract-parts-of-a-string"}

文字列の一部分を抽出するには、次のいずれかの関数を使用します。

* 元のテキストの選択された部分を含む新しい文字列を返すには [`substring()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/substring.html)。
* 元のテキストの選択された部分を含む `CharSequence` を返すには [`subSequence()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/sub-sequence.html)。

例:

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
{kotlin-runnable="true"}

`String` 型はイミュータブルであるため、これらの関数が元の文字列を変更することはありません。

### 文字列の比較 {id="compare-strings"}

2つの文字列が同じ内容を持っているかどうかは、`==` 演算子で確認できます。

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
{kotlin-runnable="true"}

また、[`compareTo()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/compare-to.html) 関数を使用して、辞書順（文字単位）で文字列を比較することもできます。この関数は、異なる文字のペアが最初に見つかるまで両方の文字列をスキャンし、以下を返します。

* 文字列が等しい場合は `0`。
* レシーバが引数より小さい場合は `0` 未満の値。
* レシーバが引数より大きい場合は `0` より大きい値。

```kotlin
fun main() {
//sampleStart    
    println("abc".compareTo("abd") < 0)
    // true
    
    println("abc".compareTo("ABC") > 0)
    // true
    
    // 大文字と小文字の違いを無視するには true を渡す
    println("abc".compareTo("ABC", ignoreCase = true) == 0)
    // true
//sampleEnd  
}
```
{kotlin-runnable="true"}

### 文字列コンテンツの操作 {id="work-with-string-content"}

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
{kotlin-runnable="true"}

また、[`contains()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/contains.html)、[`startsWith()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/starts-with.html)、[`endsWith()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/ends-with.html) 関数を使用して、文字列の内容を検査することもできます。

```kotlin
fun main() { 
//sampleStart
    val domain = "kotlinlang.org"
    
    // 文字列に "." が含まれているか確認
    println(domain.contains("."))
    // true
    
    // 文字列が "kotlin" で始まるか確認
    println(domain.startsWith("kotlin"))
    // true
    
    // 文字列が ".org" で終わるか確認
    println(domain.endsWith(".org"))
    // true
//sampleEnd
}
 ```
{kotlin-runnable="true"}

### 文字列の分割 {id="split-strings"}

区切り文字を基準にして文字列を分割するには、[`split()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/split.html) 関数を使用できます。

```kotlin
fun main() { 
//sampleStart
    val numbers = "one, two, three"
    println(numbers.split(", "))
    // [one, two, three]
//sampleEnd
}
```
{kotlin-runnable="true"}

文字列を行ごとに分割したい場合は、[`lines()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/lines.html) 関数を使用します。

```kotlin
fun main() { 
//sampleStart
    val numbers = "one\ntwo\nthree"
    println(numbers.lines())
    // [one, two, three]
//sampleEnd
}
```
{kotlin-runnable="true"}

### 文字列の構築とフォーマット {id="build-and-format-strings"}

> Kotlin でのほとんどのフォーマットタスクには、[文字列テンプレート](#string-templates)を使用してください。
>
{style="tip"}

`+` 演算子を使用して文字列を連結すると、Kotlin は操作ごとに新しい `String` オブジェクトを作成します。しかし、ループ内や多数のピースを結合する場合には、このアプローチは効率的でない場合があります。
このような問題を回避するために、`buildString()` 関数または `StringBuilder` を使用できます。これらはすべてのピースを単一のミュータブル（可変）バッファに収集し、最後に1つの文字列のみを生成します。

何を追加するかを決定するロジックが複雑な場合は、[`buildString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/build-string.html) 関数を使用します。たとえば、異なるフラグメントを寄与する複数の条件がある場合です。`buildString()` を使用すると、バッファを直接処理する必要がありません。
この関数は内部で `StringBuilder` を作成し、ブロックを実行して、結果の文字列を返します。

```kotlin
fun main() {
//sampleStart

    val hasErrors = true
    val hasWarnings = true
    val isComplete = false
    
    // buildString は空のバッファを作成する
    val status = buildString {
        // バッファに "Errors found" を追加
        if (hasErrors) append("Errors found")
        if (hasWarnings) {
            // バッファが空ではない場合、"; " を追加
            if (isNotEmpty()) append("; ")
            // "Warnings found" を追加
            append("Warnings found")
        }
        // isComplete = false のため、何も追加しない
        if (isComplete) {
            if (isNotEmpty()) append("; ")
            append("Completed")
        }
        // バッファが空ではないため、フォールバックをスキップ
        if (isEmpty()) append("OK")
    }
    
    println(status)
    // Errors found; Warnings found
//sampleEnd
}
```
{kotlin-runnable="true"}

バッファを明示的な値として必要とする場合は、[`StringBuilder`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/-string-builder/) を使用します。
たとえば、既存のテキストを変更する場合などです。

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
{kotlin-runnable="true"}

JVM では、[`String.format()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/format.html) 関数を使用して文字列をフォーマットすることもできます。

```kotlin
val text = String.format("Hello, %s", "Kotlin") 
```  

> JVM 上でフォーマッタ形式の指定子（フォーマット指定子）が明確に必要な場合にのみ、`String.format()` 関数を使用してください。
> フォーマット指定子の詳細については、[Java Class Formatter のドキュメント](https://docs.oracle.com/javase/8/docs/api/java/util/Formatter.html#summary)を参照してください。
>
{style="note"}

## 文字列の変換 {id="string-conversion"}

数値、`Boolean` 値、入力からの識別子など、他の型の値を表すために文字列を使用することがよくあります。
Kotlin は、値を文字列に変換したり、文字列を他の型にパース（解析）したりするための関数を提供しています。

値の文字列表現を返すには、[`toString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/to-string.html) 関数を使用します。

```kotlin
val number = 10
val text = number.toString()
```

文字列テンプレートおよび文字列連結では、Kotlin は値を自動的に文字列に変換します。

文字列を他の型に変換するには、対応するパース関数を使用します。

* 整数値の場合: [`toByte()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-byte.html)、[`toShort()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-short.html)、[`toInt()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-int.html)、[`toLong()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-long.html)
* 浮動小数点値の場合: [`toDouble()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-double.html)、[`toFloat()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-float.html)
* ブール値の場合: [`toBoolean()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-boolean.html)、[`toBooleanStrict()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-boolean-strict.html)

これらの関数は、文字列が有効なフォーマットである場合に、要求された型の値を返します。
入力が無効である可能性がある場合は、`OrNull` バリアントを使用してください。これらの関数は、例外をスローする代わりに `null` を返すため、ユーザー入力や完全には制御できないデータを安全に扱うことができます。

```kotlin
val toInt = "10".toInt() // 10

// 1000000000000 は Int の最大値を超えている
val toIntInvalid = "1000000000000".toIntOrNull()

val toBoolean = "true".toBooleanStrict() // true
val toBooleanInvalid = "yes".toBooleanStrictOrNull() // null
```