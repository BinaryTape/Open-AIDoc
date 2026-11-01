[//]: # (title: 字符)
[//]: # (description: 了解如何在 Kotlin 中使用 Char 类型，包括语法、Unicode 支持、转义序列以及常见的字符操作。)

[`Char`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-char/) 类型将单个字符表示为一个 UTF-16 代码单元。

对于单个字符值（例如字母、数字、标点符号或空格），请使用 `Char`。对于字符序列，请使用 [`String`](strings.md)。

> `Char` 不是数值类型，但每个字符都有可供访问的数值型 Unicode 值。
> 参见 [](#character-conversion)。
> 
{style="tip"}

## 语法 {id="syntax"}

要声明字符，请将值括在单引号（`' '`）中。你可以显式指定 `Char` 类型，或者让 Kotlin 根据该值进行推断：

```kotlin
val letter: Char = 'a'

// Kotlin 会推断为 Char，因为值是用单引号书写的
val digit = '1'
val symbol = '!'
val space = ' '
val separator = ':'
```

字符文字必须包含且仅包含一个字符。否则，Kotlin 编译器将报错：

```kotlin
val invalid = 'AB' // 错误
val invalidEmpty = '' // 错误
```
{validate="false"}

### 可空值 {id="nullable-values"}

要存储可空值，请使用 `Char?`：

```kotlin
val maybeAbsent: Char? = null
```

> 在 JVM 上，可空 `Char` 值会在需要时被装箱。这同样适用于[数值类型](numbers.md#boxing-and-caching-numbers-on-the-jvm)。
>
{style="note"}

## Unicode 支持 {id="unicode-support"}

Kotlin 将 `Char` 值表示为 UTF-16 代码单元。这意味着单个 `Char` 存储一个 UTF-16 代码单元，而不一定是一个完整的 Unicode 字符。

### 基本多语言平面 {id="basic-multilingual-plane"}

单个 `Char` 可以存储从 `\u0000` 到 `\uFFFF` 范围内的值。该范围涵盖了基本多语言平面 (BMP)，其中包含几乎所有现代语言的字符以及大量符号。

要通过 Unicode 值指定字符，请使用 `\u` 并在其后附加来自 [Unicode 字符图表](https://www.unicode.org/charts/)的四位十六进制值：

```kotlin
val unicodeNumber = '\u0031' // 等同于 '1'
```

### 增补字符 {id="supplementary-characters"}

BMP 之外的 Unicode 字符（例如 Emoji 表情符号和某些历史文字）无法用单个 `Char` 表示。在 UTF-16 中，它们被编码为*代理对*（surrogate pair），在 `String` 中由两个 `Char` 值共同表示一个 Unicode 字符：

```kotlin
fun main() {
//sampleStart
    val emoji = "🥦"
    
    println(emoji.length) // 2
    println(emoji[0])     // 第一个代理项
    println(emoji[1])     // 第二个代理项
//sampleEnd
}
```

> 要单独处理 32 位符号，请使用存储为 `Int` 值的 Unicode 码点（code points）。
>
{style="tip"}

## 转义序列 {id="escape-sequences"}

对于难以直接在源代码中编写或具有特殊含义的特殊字符，请使用转义序列。

每个转义序列均以反斜杠（`\`）开头。

| **支持的序列** | **说明** | 
|------------------------|-----------------------|
| `\t` | 制表符 (Tab) | 
| `\b` | 退格键 (Backspace) | 
| `\n` | 换行 (LF) | 
| `\r` | 回车 (CR) | 
| `\'` | 单引号 | 
| `\"` | 双引号 |
| `\\` | 反斜杠 | 
| `\$` | 美元符号 | 

例如：

```kotlin
val newLine = '\n'
val dollar = '\$'
val backslash = '\\'
```

## 操作 {id="operations"}

`Char` 支持比较、检查、大小写转换以及显式数值转换。

### 字符比较 {id="character-comparison"}

要比较 `Char` 值，请使用标准[比较运算符](keyword-reference.md#operators-and-special-symbols)，例如 `==`、`!=`、`<`、`>`、`<=` 以及 `>=`。

Kotlin 会按字符的数值型 Unicode 值进行比较并返回 `Boolean` 值：

```kotlin
val before = 'a' < 'b' // true
val after = 'c' > 'd' // false
val different = 'A' == 'a' // false 
val equal = 'A' == 'A' // true
```

### 字符处理 {id="character-processing"}

Kotlin 提供了用于检查字符值以及进行大小写转换的函数。例如：

```kotlin
fun main() {
//sampleStart
    val myChar = 'A'
    // 检查字符是否表示数字
    println(myChar.isDigit()) // false
    // 检查字符是否表示大写字母
    println(myChar.isUpperCase()) // true
    // 返回小写形式
    println(myChar.lowercaseChar()) // 'a'
//sampleEnd
}
```
{kotlin-runnable="true"}

> 在 [API 参考](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-char/)中详细了解可用函数。
>
{style="note"}

### 字符算术运算 {id="character-arithmetic"}

你可以通过加或减一个整数来创建另一个字符值：

```kotlin
fun main() {
//sampleStart
    val a = 'a'

    println(a + 1)  // b
    println(a + 2)  // c
    println(a - 32) // A
//sampleEnd
}
```
{kotlin-runnable="true"}

> 这些操作遵循 Unicode 值，而不是特定语言的字母表规则。
>
{style="note"}

你还可以对可变变量使用前缀和后缀形式的自增（`++`）与自减（`--`）运算符：

```kotlin
fun main() {
//sampleStart
    var a = 'A'
    
    a += 10
    println(a)   // 'K'
    
    println(++a) // 'L'  前缀自增
    println(a++) // 'L'  后缀自增
    println(a)   // 'M'
    
    println(--a) // 'L'  前缀自减
    println(a--) // 'L'  后缀自减
    println(a)   // 'K'
//sampleEnd
}
```
{kotlin-runnable="true"}

### 字符转换 {id="character-conversion"}

要将 `Char` 转换为数值类型，请使用显式转换：

* 使用 `.code` 获取字符的数值型 Unicode 值：

  ```kotlin
  fun main() { 
  //sampleStart
      val letter = 'A'
      println(letter.code) // 65
  //sampleEnd
  }
  ```
  {kotlin-runnable="true"}

* 如果字符表示十进制数字，请使用 `digitToInt()`：
  ```kotlin
  fun main() { 
  //sampleStart
      val digit = '7'
      println(digit.digitToInt()) // 7
  //sampleEnd
  }
  ```
  {kotlin-runnable="true"}

  > 如果该字符可能不是有效数字，请使用 `digitToIntOrNull()`。
  >
  {style="tip"}