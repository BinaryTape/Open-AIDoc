[//]: # (title: 文字列)
[//]: # (description: 文字列リテラル、文字列テンプレート、複数行文字列、一般的なテキスト操作など、Kotlin における文字列の扱い方について学びます。)

[`String`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/) 型は、一連の[文字](characters.md)のシーケンスを表します。単語、文、メッセージ、構造化テキストなどのテキスト値に使用できます。

`String` 型はイミュータブル（不変）です。一度 `String` オブジェクトを作成すると、その内容は存続期間中に変更されることはありません。文字列を変更するように見える操作は、実際にはすべて新しい文字列を作成しています。

## 文字列の宣言 {id="declare-strings"}

`String` リテラルを宣言するには、値をダブルクォート（`""`）で囲みます。`String` 型を明示的に指定することも、Kotlin に値から型推論させることもできます。

```kotlin
val name: String = "Kotlin"
val message = "Hello, world!" // Kotlin が String を推論
```

ダブルクォートで囲まれた文字列リテラルは、`\n` や `\t` などの[エスケープシーケンス](characters.md#escape-sequences)をサポートしています。

```kotlin
val message = "Hello,\nworld!"
val quote = "Kotlin says, \"Hi\"."
```

### 複数行文字列 {id="multiline-strings"}

複数行で構成されるテキストや、エスケープしたくない引用符を含むテキストを保持するには、トリプルクォート（`""" """`）で囲まれた複数行文字列を使用します。

```kotlin
val text = """
Hello,
Kotlin
"""

val quote = """Kotlin says, "Hi"."""
```

> 複数行文字列はエスケープシーケンスをサポートしていません。
> Kotlin はそれらの文字を通常のテキストとして扱います。
>
{style="note"}

複数行文字列は、ソースコードに記述された改行やインデントをそのまま保持します。
この挙動は、実行時の値をファイル内のテキストのレイアウトと一致させたい場合に便利です。

以下の例では、各行の前のスペースが結果の文字列の一部になります。

```kotlin
val text = """
    Hello,
    Kotlin
"""
```

行頭の共通インデントを削除するには、[`trimIndent()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/trim-indent.html) 関数を使用します。空行を除く行の共通する最小インデントを検出し、それを削除します。

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

インデントの削除をより明示的に制御するには、[`trimMargin()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/trim-margin.html) 関数を使用します。各行のマージンプレフィックス（接頭辞）とその前にあるすべての文字を削除します。

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

デフォルトでは、`trimMargin()` 関数はパイプ記号（`|`）をマージンプレフィックスとして使用しますが、パラメータとして別の文字を渡すこともできます。例: `trimMargin(">")`

> `trimIndent()` や `trimMargin()` などの関数で文字列を処理すると、プラットフォームに関係なく、結果の文字列には改行文字（`\n`）のみが使用されます。
>
{style="note"}

## 文字列テンプレート {id="string-templates"}

文字列テンプレートを使用すると、変数や式を `String` リテラル内に直接埋め込むことができます。
この処理は*文字列補間（interpolation）*と呼ばれます。文字列テンプレートは、通常の文字列と複数行文字列の両方で使用できます。

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

文字列に式を挿入する場合や、変数を他のテキストの直後に配置する場合は、`${}` を使用します。

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

> 文字列は `+` 演算子で結合することもできます。しかし、通常は文字列テンプレートの方が読みやすく、よりイディオマティックです。
>
{style="tip"}

テンプレート式には、エスケープなしでダブルクォート文字列を含めることもできます。

```kotlin
// ダブルクォート文字列
val test = "${"test".uppercase()}"

// 複数行文字列
val result = """
Result: ${"OK".lowercase()}
"""
```

### 文字列テンプレートでの Null 許容値 {id="nullable-values-in-string-templates"}

補間された式または変数が `null` と評価された場合、Kotlin コンパイラは結果の文字列に `null` というテキストを挿入します。`null` を別の値に置き換えるには、[Elvis 演算子](null-safety.md#elvis-operator)（`?:`）を使用します。

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

### マルチドル文字列補間 {id="multi-dollar-string-interpolation"}

通常の文字列テンプレートでは、単一のドル記号（`$`）で補間が始まります。文字列にリテラルとしてドル記号を含める必要がある場合は、**マルチドル文字列補間（Multi-dollar string interpolation）**を使用します。

マルチドル文字列補間を使用すると、補間をトリガーするために必要な連続したドル記号の数を指定できます。その数未満のドル記号はリテラル文字として扱われます。

たとえば、文字列リテラルの前に `$$` を使用すると、2 つ連続したドル記号でのみ補間が開始されます。

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

> 1つのドル記号による文字列補間を使用している場合、マルチドル文字列補間が既存のコードに影響を与えることはありません。引き続き単一の `$` を使用でき、必要に応じて複数のドル記号を適用できます。
>
{style="tip"}

## 基本的な文字列操作 {id="basic-string-operations"}

Kotlin には、文字列を操作するためのさまざまな操作が用意されています。このセクションでは、最も一般的に使用される操作をいくつか紹介します。

> 利用可能なすべての関数についての詳細は、[API リファレンス](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/)をご覧ください。
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
{kotlin-runnable="true"}

> 文字列のインデックスは 0 から始まります。
> 有効な範囲外のインデックスにアクセスしようとすると、Kotlin は例外をスローします。
>
{style="tip"}

文字列内の文字をイテレート（反復処理）することもできます。

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

* [`substring()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/substring.html): 元のテキストの選択された部分を含む新しい文字列を返します。
* [`subSequence()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/sub-sequence.html): 元のテキストの選択された部分を含む `CharSequence` を返します。

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

2 つの文字列が同じ内容を持っているかどうかは、`==` 演算子で確認できます。

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

[`compareTo()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/compare-to.html) 関数を使用して、文字列を辞書順（文字単位）で比較することもできます。この関数は、両方の文字列を最初の異なる文字のペアが見つかるまで走査し、以下を返します。

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
    
    // 大文字小文字の違いを無視するには true を渡す
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

また、[`contains()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/contains.html)、[`startsWith()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/starts-with.html)、[`endsWith()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/ends-with.html) 関数を使用して文字列の内容を検査することもできます。

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

[`split()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/split.html) 関数を使用すると、区切り文字に基づいて文字列を複数の部分に分割できます。

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

文字列を個々の行に分割したい場合は、[`lines()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/lines.html) 関数を使用します。

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

`+` 演算子で文字列を連結すると、Kotlin は操作ごとに新しい `String` オブジェクトを作成します。しかし、このアプローチはループ内や多くの断片を組み立てる場合には効率的ではない可能性があります。
このような問題を回避するために、`buildString()` 関数または `StringBuilder` を使用できます。これらはすべての断片を単一のミュータブル（可変）バッファに収集し、最後に1つの文字列だけを生成します。

追加する内容を決定するロジックが複雑な場合は、[`buildString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/build-string.html) 関数を使用します。たとえば、異なる断片を提供する複数の条件がある場合などです。`buildString()` を使用すると、バッファを直接処理する必要がありません。この関数は内部で `StringBuilder` を作成し、渡されたブロックを実行して、結果の文字列を返します。

```kotlin
fun main() {
//sampleStart

    val hasErrors = true
    val hasWarnings = true
    val isComplete = false
    
    // buildString が空のバッファを作成
    val status = buildString {
        // バッファに "Errors found" を追加
        if (hasErrors) append("Errors found")
        if (hasWarnings) {
            // バッファが空ではないため、"; " を追加
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

バッファを明示的な値として必要とする場合は、[`StringBuilder`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/-string-builder/) を使用します。たとえば、既存のテキストを変更する場合などです。

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

> JVM 上でフォーマッタ形式の指定子（specifier）が明示的に必要な場合にのみ、`String.format()` 関数を使用してください。
> フォーマット指定子の詳細については、[Java の Formatter クラスのドキュメント](https://docs.oracle.com/javase/8/docs/api/java/util/Formatter.html#summary)を参照してください。
>
{style="note"}

## 文字列の型変換 {id="string-conversion"}

文字列を使用して、数値、`Boolean` 値、入力からの識別子など、他の型の値を表すことがよくあります。
Kotlin には、値を文字列に変換したり、文字列を他の型にパースしたりするための関数が用意されています。

値の文字列表現を取得するには、[`toString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/to-string.html) 関数を使用します。

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
入力が無効である可能性がある場合は、`OrNull` バリアントを使用してください。これらの関数は、例外をスローする代わりに `null` を返すため、ユーザー入力や完全に制御できないデータを扱う際に安全です。

```kotlin
val toInt = "10".toInt() // 10

// 1000000000000 は Int の最大値を超えています
val toIntInvalid = "1000000000000".toIntOrNull()

val toBoolean = "true".toBooleanStrict() // true
val toBooleanInvalid = "yes".toBooleanStrictOrNull() // null
```