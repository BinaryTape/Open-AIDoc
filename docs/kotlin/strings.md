[//]: # (title: 字符串)

Kotlin 中的字符串由 [`String`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/) 类型表示。

> 在 JVM 上，UTF-16 编码的 `String` 对象每个字符大约占用 2 字节。
> 
{style="note"}

通常，字符串值是用双引号 (`"`) 引起来的字符序列：

```kotlin
val str = "abcd 123"
```

字符串的元素是字符，你可以通过索引操作访问它们：`s[i]`。
你可以使用 `for` 循环遍历这些字符：

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

字符串是不可变的。一旦你初始化了一个字符串，就无法更改它的值或为其分配新值。
所有转换字符串的操作都会在新的 `String` 对象中返回结果，而原始字符串保持不变：

```kotlin
fun main() {
//sampleStart
    val str = "abcd"
   
    // 创建并打印一个新的 String 对象
    println(str.uppercase())
    // ABCD
   
    // 原始字符串保持不变
    println(str) 
    // abcd
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

要串联字符串，请使用 `+` 运算符。这也适用于将字符串与其他类型的值串联，只要表达式中的第一个元素是字符串即可：

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

> 在大多数情况下，使用[字符串模板](#string-templates)或[多行字符串](#multiline-strings)比字符串串联更好。
> 
{style="note"}

## 字符串字面量

Kotlin 有两种类型的字符串字面量：

* [转义字符串](#escaped-strings)
* [多行字符串](#multiline-strings)

### 转义字符串

*转义字符串*可以包含转义字符。  
下面是一个转义字符串的示例：

```kotlin
val s = "Hello, world!
"
```

转义采用常规方式，即使用反斜杠 (`\`)。  
有关支持的转义序列列表，请参阅[字符](characters.md)页面。

### 多行字符串

*多行字符串*可以包含换行符和任意文本。它由三引号 (`"""`) 分隔，不包含转义，并且可以包含换行符和任何其他字符：

```kotlin
val text = """
    for (c in "foo")
        print(c)
    """
```

要移除多行字符串的前导空格，请使用 [`trimMargin()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/trim-margin.html) 函数：

```kotlin
val text = """
    |Tell me and I forget.
    |Teach me and I remember.
    |Involve me and I learn.
    |(Benjamin Franklin)
    """.trimMargin()
```

默认情况下，使用管道符号 `|` 作为边界前缀，但你可以选择另一个字符并将其作为参数传递，例如 `trimMargin(">")`。

## 字符串模板

字符串字面量可以包含*模板表达式*——即被求值并将其结果串联到字符串中的代码片段。
当模板表达式被处理时，Kotlin 会自动在表达式的结果上调用 `.toString()` 函数将其转换为字符串。模板表达式以美元符号 (`$`) 开头，由变量名组成：

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

或者是花括号中的表达式：

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

你可以在多行字符串和转义字符串中使用模板。不过，多行字符串不支持反斜杠转义。
要在多行字符串中、在任何允许作为[标识符](https://kotlinlang.org/grammar/#identifiers)开头的符号之前插入美元符号 (`$`) 字面字符，请使用以下语法：

```kotlin
val price = """
${'$'}9.99
"""
```

> 为了避免在字符串中使用 `${'$'}` 序列，你可以使用实验性的[多美元字符串插值功能](#multi-dollar-string-interpolation)。
>
{style="note"}

### 多美元字符串插值

多美元字符串插值允许你指定需要多少个连续的美元符号来触发插值。
插值是将变量或表达式直接嵌入字符串的过程。

虽然你可以为单行字符串[转义字面量](#escaped-strings)，但 Kotlin 中的多行字符串不支持反斜杠转义。
要包含美元符号 (`$`) 作为字面字符，你必须使用 `${'$'}` 构造来防止字符串插值。
这种方法会使代码难以阅读，特别是当字符串包含多个美元符号时。

多美元字符串插值通过让你在单行和多行字符串中将美元符号视为字面字符来简化此操作。
例如：

```kotlin
val `KClass<*>`.jsonSchema : String
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

在这里，`$$` 前缀指定需要两个连续的美元符号来触发字符串插值。
单个美元符号仍作为字面字符。

你可以调整触发插值的美元符号数量。
例如，使用三个连续的美元符号 (`$$$`) 允许 `$` 和 `$$` 保持为字面量，同时通过 `$$$` 启用插值：

```kotlin
val productName = "carrot"
val requestedData =
    $$$"""{
      "currency": "$",
      "enteredAmount": "42.45 $",
      "$$serviceField": "none",
      "product": "$$$productName"
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

在这里，`$$$` 前缀允许字符串包含 `$$` 和 `$`，而不需要使用 `${'$'}` 构造进行转义。

多美元字符串插值不会影响使用单美元字符串插值的现有代码。
你可以像以前一样继续使用单个 `$`，并在需要在字符串中处理字面美元符号时应用多美元符号。

## 字符串格式化

> 使用 `String.format()` 函数进行字符串格式化仅在 Kotlin/JVM 中可用。
>
{style="note"}

要根据你的特定要求格式化字符串，请使用 [`String.format()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/format.html) 函数。

`String.format()` 函数接受一个格式字符串和一个或多个实参。格式字符串包含一个用于给定实参的占位符（由 `%` 指示），后跟格式说明符。
格式说明符是相应实参的格式化指令，由标志、宽度、精度和转换类型组成。格式说明符共同决定了输出的格式设置。常用的格式说明符包括用于整数的 `%d`，用于浮点数的 `%f`，以及用于字符串的 `%s`。你还可以使用 `argument_index` 语法在格式字符串中以不同的格式多次引用同一个实参。

> 有关格式说明符的深入理解和完整列表，请参阅 [Java 的 Class Formatter 文档](https://docs.oracle.com/javase/8/docs/api/java/util/Formatter.html#summary)。
>
{style="note"}

让我们看一个示例：

```kotlin
fun main() { 
//sampleStart
    // 格式化一个整数，添加前导零以达到七个字符的长度
    val integerNumber = String.format("%07d", 31416)
    println(integerNumber)
    // 0031416

    // 格式化一个浮点数，显示 + 号并保留四位小数
    val floatNumber = String.format("%+.4f", 3.141592)
    println(floatNumber)
    // +3.1416

    // 将两个字符串格式化为大写，每个占用一个占位符
    val helloString = String.format("%S %S", "hello", "world")
    println(helloString)
    // HELLO WORLD
    
    // 格式化一个负数，使其包含在圆括号内，然后使用 `argument_index` 以不同格式（不带圆括号）重复同一个数字
    val negativeNumberInParentheses = String.format("%(d means %1\$d", -31416)
    println(negativeNumberInParentheses)
    //(31416) means -31416
//sampleEnd    
}
```
{interpolate-variables="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

`String.format()` 函数提供了与字符串模板类似的功能。然而，`String.format()` 函数更加通用，因为有更多的格式化选项可用。

此外，你可以从变量中分配格式字符串。当格式字符串发生变化时，这非常有用，例如在取决于用户区域性的本地化情况下。

使用 `String.format()` 函数时要小心，因为实参的数量或位置很容易与相应的占位符不匹配。