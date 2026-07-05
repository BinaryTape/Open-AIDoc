---
title: 字符串
description: 了解如何在 Kotlin 中处理字符串，包括字符串字面量、字符串模板、多行字符串以及常用的文本操作。
---

[`String`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/) 类型表示[字符](characters.md)序列。你可以将其用于文本值，例如单词、句子、消息或结构化文本。

`String` 类型是不可变的。在创建一个 `String` 对象后，其内容在其余下的生命周期中保持不变。任何看起来像修改字符串的操作实际上都是创建了一个新字符串。

## 声明字符串

要声明 `String` 字面量，请将值括在双引号 (`""`) 中。你可以显式指定 `String` 类型，或者让 Kotlin 从值中推断它：

```kotlin
val name: String = "Kotlin"
val message = "Hello, world!" // Kotlin 推断为 String
```

双引号字符串字面量支持[转义序列](characters.md#escape-sequences)，例如 `
` 或 `\t`：

```kotlin
val message = "Hello,
world!"
val quote = "Kotlin says, \"Hi\"."
```

### 多行字符串

要存储由多行组成或包含不想转义的引号的文本，请使用括在三引号 (`""" """`) 中的多行字符串：

```kotlin
val text = """
Hello,
Kotlin
"""

val quote = """Kotlin says, "Hi"."""
```

> 多行字符串不支持转义序列。
> Kotlin 将这些字符视为普通文本。
>
{style="note"}

多行字符串会保留源代码中所写的换行符和缩进。当你希望运行时值与文件中的文本布局匹配时，此行为非常有用。

在以下示例中，每行之前的空格都是结果字符串的一部分：

```kotlin
val text = """
    Hello,
    Kotlin
"""
```

要移除通用的前导缩进，请使用 [`trimIndent()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/trim-indent.html) 函数。它会检测非空行的通用最小缩进并将其移除：

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

要更显式地控制缩进移除，请使用 [`trimMargin()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/trim-margin.html) 函数。它会移除每行中边界前缀（包括前缀本身）之前的所有内容：

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

默认情况下，`trimMargin()` 函数使用管道符号 (`|`) 作为边界前缀，但你可以传递另一个字符作为参数。例如：`trimMargin(">")`。

> 当你使用 `trimIndent()` 或 `trimMargin()` 等函数处理字符串时，无论在什么平台上，结果字符串都仅使用换行符 (`
`) 作为分隔符。
>
{style="note"}

## 字符串模板

字符串模板允许你直接在 `String` 字面量中嵌入变量和表达式。这个过程被称为*插值 (interpolation)*。你可以在普通字符串和多行字符串中使用字符串模板。

要将变量插入字符串中，请使用 `$` 符号：

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

要在字符串中插入表达式或将变量直接放置在其他文本旁边，请使用 `${}`：

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

> 你也可以使用 `+` 运算符连接字符串。但是，字符串模板通常更易读且更符合惯用法。
>
{style="tip"}

模板表达式也可以包含不带转义的双引号字符串：

```kotlin
// 双引号字符串
val test = "${"test".uppercase()}"

// 多行字符串
val result = """
Result: ${"OK".lowercase()}
"""
```

### 字符串模板中的可空值

如果插值表达式或变量的求值结果为 `null`，Kotlin 编译器会在结果字符串中插入文本 `"null"`。要将 `null` 替换为另一个值，请使用[空合并运算符](null-safety.md#elvis-operator) (`?:`)：

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

### 多美元字符串插值

在普通字符串模板中，单个美元符号 (`$`) 即可开始插值。如果你需要在字符串中包含美元符号字面量，请使用**多美元字符串插值 (multi-dollar string interpolation)**。

多美元字符串插值允许你指定需要多少个连续的美元符号来触发插值。少于该数量的美元符号将被视为字面字符。

例如，当你在字符串字面量前使用 `$$` 时，插值仅在出现两个连续的美元符号时开始：

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

> 如果你使用单美元字符串插值，多美元字符串插值不会影响你的代码。你可以继续使用单个 `$` 并根据需要应用多美元符号。
>
{style="tip"}

## 基础字符串操作

Kotlin 提供了一系列用于处理字符串的操作。本节介绍一些最常用的操作。

> 要详细了解所有可用函数，请参阅 [API 参考文档](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/)。
>
{style="tip"}

### 获取字符串长度

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 访问字符

你可以通过索引操作符 (`[]`) 访问字符串中的单个字符：

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

> 字符串索引从零开始。如果你尝试访问有效范围之外的索引，Kotlin 会抛出异常。
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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 提取字符串的部分内容

要提取字符串的部分内容，请使用以下函数之一：

* [`substring()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/substring.html)：返回包含原始文本选定部分的新字符串。
* [`subSequence()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/sub-sequence.html)：返回包含原始文本选定部分的 `CharSequence`。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

由于 `String` 类型是不可变的，这些函数不会修改原始字符串。

### 比较字符串

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

你还可以使用 [`compareTo()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/compare-to.html) 函数按字典序（逐个字符）比较字符串。它会扫描两个字符串，直到找到第一对不同的字符，并返回：

* `0`：当字符串相等时。
* 小于 `0` 的值：当接收者小于实参时。
* 大于 `0` 的值：当接收者大于实参时。

```kotlin
fun main() {
//sampleStart    
    println("abc".compareTo("abd") < 0)
    // true
    
    println("abc".compareTo("ABC") > 0)
    // true
    
    // 传递 true 以忽略大小写差异
    println("abc".compareTo("ABC", ignoreCase = true) == 0)
    // true
//sampleEnd  
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 处理字符串内容

如果你想更改字符串的内容，请使用 [`.trim()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/trim.html)、[`.replace()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/replace.html)、[`.uppercase()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/uppercase.html) 和 [`.lowercase()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/lowercase.html) 等函数创建一个修改后的副本：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 分割字符串

你可以使用 [`split()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/split.html) 函数根据分隔符将字符串分割成多个部分：

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

如果你想将字符串分割为单独的行，请使用 [`lines()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/lines.html) 函数：

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

### 构建与格式化字符串

> 对于 Kotlin 中的大多数格式化任务，请使用[字符串模板](#字符串模板)。
>
{style="tip"}

当你使用 `+` 运算符连接字符串时，Kotlin 会为每次操作创建一个新的 `String` 对象。然而，这种方法在循环中或组装许多碎片时可能并非最佳。为了避免此类问题，你可以使用 `buildString()` 函数或 `StringBuilder`。它们将所有碎片收集在单个可变缓冲区中，最后仅生成一个字符串。

当决定追加内容的逻辑比较复杂时，请使用 [`buildString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/build-string.html) 函数。例如，当你有多个贡献不同片段的条件时。使用 `buildString()`，你不需要直接处理缓冲区。该函数内部会创建一个 `StringBuilder`，运行你的代码块，并返回结果字符串。

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
            // 如果缓冲区不为空，追加 "; "
            if (isNotEmpty()) append("; ")
            // 追加 "Warnings found"
            append("Warnings found")
        }
        // isComplete = false，不追加任何内容
        if (isComplete) {
            if (isNotEmpty()) append("; ")
            append("Completed")
        }
        // 缓冲区不为空，跳过回退内容
        if (isEmpty()) append("OK")
    }
    
    println(status)
    // Errors found; Warnings found
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

当你需要将缓冲区作为显式值使用时，请使用 [`StringBuilder`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/-string-builder/)。例如，用于更改现有文本：

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

在 JVM 上，你还可以使用 [`String.format()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/format.html) 函数来格式化字符串：

```kotlin
val text = String.format("Hello, %s", "Kotlin") 
```  

> 仅当你特别需要在 JVM 上使用格式化程序样式的说明符时，才使用 `String.format()` 函数。要详细了解格式说明符，请参阅 [Java Class Formatter 文档](https://docs.oracle.com/javase/8/docs/api/java/util/Formatter.html#summary)。
>
{style="note"}

## 字符串转换

你经常可能使用字符串来表示其他类型的值，例如数字、`Boolean` 值或来自输入的标识符。Kotlin 提供了将值转换为字符串以及将字符串解析为其他类型的函数。

要返回值的字符串表示形式，请使用 [`toString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/to-string.html) 函数：

```kotlin
val number = 10
val text = number.toString()
```

在字符串模板和字符串连接中，Kotlin 会自动将值转换为字符串。

要将字符串转换为另一种类型，请使用相应的解析函数：

* 对于整数值：[`toByte()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-byte.html)、[`toShort()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-short.html)、[`toInt()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-int.html)、[`toLong()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-long.html)
* 对于浮点值：[`toDouble()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-double.html)、[`toFloat()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-float.html)
* 对于布尔值：[`toBoolean()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-boolean.html)、[`toBooleanStrict()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-boolean-strict.html)

如果字符串具有有效的格式，这些函数将返回所请求类型的值。如果输入可能无效，请使用 `OrNull` 变体。这些函数会返回 `null` 而不是抛出异常，这使得它们在处理用户输入或你无法完全控制的数据时更加安全：

```kotlin
val toInt = "10".toInt() // 10

// 1000000000000 超过了 Int 的最大值
val toIntInvalid = "1000000000000".toIntOrNull()

val toBoolean = "true".toBooleanStrict() // true
val toBooleanInvalid = "yes".toBooleanStrictOrNull() // null