[//]: # (title: 字符串)
[//]: # (description: 了解如何在 Kotlin 中使用字符串，包括字符串文字、字符串模板、多行字符串以及常见文本操作。)

[`String`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/) 类型表示[字符](characters.md)序列。你可以将其用于文本值，例如单词、句子、消息或结构化文本。

`String` 类型是不可变的。创建 `String` 对象后，其内容在剩余的生命周期内将保持不变。任何看似修改字符串的操作，实际上都会创建一个新字符串。

## 声明字符串 {id="declare-strings"}

要声明一个 `String` 文字，请将值用双引号（`""`）括起来。你可以显式指定 `String` 类型，也可以让 Kotlin 根据值自动推断：

```kotlin
val name: String = "Kotlin"
val message = "Hello, world!" // Kotlin 推断为 String
```

双引号字符串文字支持诸如 `\n` 或 `\t` 之类的[转义序列](characters.md#escape-sequences)：

```kotlin
val message = "Hello,\nworld!"
val quote = "Kotlin says, \"Hi\"."
```

### 多行字符串 {id="multiline-strings"}

要存储由多行组成的文本，或者包含不想转义的引号的文本，请使用由三引号（`""" """`）括起来的多行字符串：

```kotlin
val text = """
Hello,
Kotlin
"""

val quote = """Kotlin says, "Hi"."""
```

> 多行字符串不支持转义序列。
> Kotlin 会将这些字符视为普通文本。
>
{style="note"}

多行字符串会保留源代码中所写的换行符和缩进。当你希望运行时值与文件中的文本排版保持一致时，此行为非常有用。

在以下示例中，每行前面的空格都是最终生成字符串的一部分：

```kotlin
val text = """
    Hello,
    Kotlin
"""
```

要移除公共的前导缩进，请使用 [`trimIndent()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/trim-indent.html) 函数。它会检测非空行的公共最小缩进并将其移除：

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

要更明确地控制缩进的移除，请使用 [`trimMargin()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/trim-margin.html) 函数。它会移除每行中边距前缀及其之前的所有内容：

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

默认情况下，`trimMargin()` 函数使用管道符号（`|`）作为边距前缀，但你可以传入其他字符作为形参。例如：`trimMargin(">")`。

> 当你使用诸如 `trimIndent()` 或 `trimMargin()` 等函数处理字符串时，无论在哪个平台上，生成的字符串都仅使用换行符（`\n`）作为分隔符。
>
{style="note"}

## 字符串模板 {id="string-templates"}

字符串模板允许你将变量和表达式直接嵌入到 `String` 文字中。这个过程称为*插值*。你可以在常规字符串和多行字符串中使用字符串模板。

要在字符串中插入变量，请使用 `$` 符号：

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

要在字符串中插入表达式，或将变量直接紧挨着其他文本放置，请使用 `${}`：

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

> 你也可以使用 `+` 运算符拼接字符串。但是，字符串模板通常更易读且更符合惯用语法。
>
{style="tip"}

模板表达式中还可以包含双引号字符串，无需转义：

```kotlin
// 双引号字符串
val test = "${"test".uppercase()}"

// 多行字符串
val result = """
Result: ${"OK".lowercase()}
"""
```

### 字符串模板中的可空值 {id="nullable-values-in-string-templates"}

如果被插值的表达式或变量的求值结果为 `null`，Kotlin 编译器会在生成的字符串中插入文本 `null`。要将 `null` 替换为其他值，请使用 [Elvis 运算符](null-safety.md#elvis-operator)（`?:`）：

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

### 多美元符号字符串插值 {id="multi-dollar-string-interpolation"}

在常规字符串模板中，单个美元符号（`$`）即可开启插值。如果你需要在字符串中包含美元符号文字，可以使用**多美元符号字符串插值**。

多美元符号字符串插值允许你指定需要多少个连续的美元符号来触发插值。少于该数量的美元符号将被视为普通字面字符。

例如，当你在字符串文字前使用 `$$` 时，插值仅由连续两个美元符号触发：

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

> 如果你使用单美元符号字符串插值，多美元符号字符串插值不会对你的代码产生影响。你可以继续使用单个 `$`，并在需要时应用多个美元符号。
>
{style="tip"}

## 基本字符串操作 {id="basic-string-operations"}

Kotlin 提供了丰富的字符串操作功能。本节介绍一些最常用的操作。

> 请参阅 [API 参考](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/)详细了解所有可用函数。
>
{style="tip"}

### 获取字符串长度 {id="get-string-length"}

要获取字符串中的字符数，请使用 [`length`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/length.html) 属性：

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

### 访问字符 {id="access-characters"}

你可以使用索引运算符（`[]`）访问字符串中的单个字符：

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

> 字符串索引从 0 开始。
> 如果你尝试访问有效范围之外的索引，Kotlin 会抛出异常。
>
{style="tip"}

你还可以遍历字符串中的字符：

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

### 提取部分字符串 {id="extract-parts-of-a-string"}

要提取字符串的一部分，请使用以下函数之一：

* [`substring()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/substring.html)：返回包含原始文本所选部分的新字符串。
* [`subSequence()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/sub-sequence.html)：返回包含原始文本所选部分的 `CharSequence`。

例如：

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

由于 `String` 类型是不可变的，因此这些函数不会修改原始字符串。

### 比较字符串 {id="compare-strings"}

你可以使用 `==` 运算符检查两个字符串的内容是否相同：

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

你还可以使用 [`compareTo()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/compare-to.html) 函数按字典序（逐字符）比较字符串。它会扫描两个字符串，直到找到第一对不同的字符，并返回：

* 当两字符串相等时返回 `0`。
* 当接收者小于实参时返回小于 `0` 的值。
* 当接收者大于实参时返回大于 `0` 的值。

```kotlin
fun main() {
//sampleStart    
    println("abc".compareTo("abd") < 0)
    // true
    
    println("abc".compareTo("ABC") > 0)
    // true
    
    // 传入 true 以忽略大小写差异
    println("abc".compareTo("ABC", ignoreCase = true) == 0)
    // true
//sampleEnd  
}
```
{kotlin-runnable="true"}

### 操作字符串内容 {id="work-with-string-content"}

如果你想更改字符串的内容，可以使用 [`.trim()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/trim.html)、[`.replace()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/replace.html)、[`.uppercase()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/uppercase.html) 和 [`.lowercase()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/lowercase.html) 等函数创建其修改后的副本：

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

你还可以使用 [`contains()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/contains.html)、[`startsWith()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/starts-with.html) 和 [`endsWith()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/ends-with.html) 函数检查字符串内容：

```kotlin
fun main() { 
//sampleStart
    val domain = "kotlinlang.org"
    
    // 检查字符串是否包含 "."
    println(domain.contains("."))
    // true
    
    // 检查字符串是否以 "kotlin" 开头
    println(domain.startsWith("kotlin"))
    // true
    
    // 检查字符串是否以 ".org" 结尾
    println(domain.endsWith(".org"))
    // true
//sampleEnd
}
 ```
{kotlin-runnable="true"}

### 分割字符串 {id="split-strings"}

你可以使用 [`split()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/split.html) 函数围绕分隔符将字符串拆分为多个部分：

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

如果你想将字符串拆分为单独的行，请使用 [`lines()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/lines.html) 函数：

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

### 构建与格式化字符串 {id="build-and-format-strings"}

> 对于 Kotlin 中的大多数格式化任务，建议使用[字符串模板](#string-templates)。
>
{style="tip"}

当你使用 `+` 运算符拼接字符串时，Kotlin 会为每次操作创建一个新的 `String` 对象。然而，这种方法在循环中或组装大量片段时可能并不划算。为了避免此类问题，你可以使用 `buildString()` 函数或 `StringBuilder`。它们将所有片段收集在单个可变缓冲区中，最后仅生成一个字符串。

当决定追加内容的逻辑较复杂时（例如存在多个用于提供不同片段的条件），可以使用 [`buildString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/build-string.html) 函数。使用 `buildString()` 时，你无需直接处理缓冲区。该函数会在内部创建一个 `StringBuilder`，运行你的代码块，并返回生成的字符串。

```kotlin
fun main() {
//sampleStart

    val hasErrors = true
    val hasWarnings = true
    val isComplete = false
    
    // buildString 创建一个空缓冲区
    val status = buildString {
        // 向缓冲区追加 "Errors found"
        if (hasErrors) append("Errors found")
        if (hasWarnings) {
            // 缓冲区非空，追加 "; "
            if (isNotEmpty()) append("; ")
            // 追加 "Warnings found"
            append("Warnings found")
        }
        // isComplete = false，不追加任何内容
        if (isComplete) {
            if (isNotEmpty()) append("; ")
            append("Completed")
        }
        // 缓冲区非空，跳过备用文本
        if (isEmpty()) append("OK")
    }
    
    println(status)
    // Errors found; Warnings found
//sampleEnd
}
```
{kotlin-runnable="true"}

当你需要将缓冲区作为显式值时，请使用 [`StringBuilder`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/-string-builder/)。例如用于更改现有文本：

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

在 JVM 上，你还可以使用 [`String.format()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/format.html) 函数格式化字符串：

```kotlin
val text = String.format("Hello, %s", "Kotlin") 
```  

> 仅当你在 JVM 上特别需要 Formatter 风格的说明符时，才使用 `String.format()` 函数。
> 有关格式说明符的更多信息，请参阅 [Java Formatter 类文档](https://docs.oracle.com/javase/8/docs/api/java/util/Formatter.html#summary)。
>
{style="note"}

## 字符串转换 {id="string-conversion"}

通常，你可能会使用字符串来表示其他类型的值，例如数字、`Boolean` 值或来自输入的标识符。Kotlin 提供了用于将值转换为字符串以及将字符串解析为其他类型的函数。

要返回某个值的字符串表示形式，请使用 [`toString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/to-string.html) 函数：

```kotlin
val number = 10
val text = number.toString()
```

在字符串模板和字符串串联中，Kotlin 会自动将值转换为字符串。

要将字符串转换为其他类型，请使用相应的解析函数：

* 针对整数值：[`toByte()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-byte.html)、[`toShort()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-short.html)、[`toInt()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-int.html)、[`toLong()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-long.html)
* 针对浮点数值：[`toDouble()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-double.html)、[`toFloat()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-float.html)
* 针对布尔值：[`toBoolean()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-boolean.html)、[`toBooleanStrict()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-boolean-strict.html)

如果字符串格式有效，这些函数将返回请求类型的值。如果输入可能无效，请使用 `OrNull` 变体函数。这些函数会返回 `null` 而不是抛出异常，因此适用于处理用户输入或未完全受控的数据：

```kotlin
val toInt = "10".toInt() // 10

// 1000000000000 超出 Int 的最大值
val toIntInvalid = "1000000000000".toIntOrNull()

val toBoolean = "true".toBooleanStrict() // true
val toBooleanInvalid = "yes".toBooleanStrictOrNull() // null
```