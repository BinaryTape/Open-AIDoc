[//]: # (title: 基本类型)

<no-index/>

Kotlin 中的每个变量和数据结构都有一个类型。类型之所以重要，是因为它能告诉编译器允许你对该变量或数据结构执行哪些操作。换句话说，也就是它拥有哪些函数与属性。

在上一章的示例中，Kotlin 能够确定 `customers` 的类型为 [`Int`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int/)。Kotlin **推断**类型的能力被称为**类型推断**。`customers` 被赋予了一个整数值，Kotlin 由此推断出 `customers` 具有数值类型 `Int`。因此，编译器知道你可以对 `customers` 执行算术运算：

```kotlin
fun main() {
//sampleStart
    var customers = 10

    // 一些顾客离开了队伍
    customers = 8

    customers = customers + 3 // 加法示例：11
    customers += 7            // 加法示例：18
    customers -= 3            // 减法示例：15
    customers *= 2            // 乘法示例：30
    customers /= 3            // 除法示例：10

    println(customers) // 10
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-basic-types-arithmetic"}

> `+=`、`-=`、`*=`、`/=` 以及 `%=` 属于复合赋值运算符。要了解更多信息，请参阅[复合赋值](operator-overloading.md#augmented-assignments)。
> 
{style="tip"}

总体而言，Kotlin 具有以下基本类型：

| **类别**                                                   | **基本类型**                       | **示例代码**                                                      |
|-----------------------------------------------------------|------------------------------------|-------------------------------------------------------------------|
| [整数](numbers.md#integer-types)                          | `Byte`, `Short`, `Int`, `Long`     | `val year: Int = 2020`<br/> `val amount: Long = 350_000_000`      |
| [无符号整数](unsigned-integer-types.md)                    | `UByte`, `UShort`, `UInt`, `ULong` | `val score: UInt = 100u`                                          |
| [浮点数](numbers.md#floating-point-types)                 | `Float`, `Double`                  | `val currentTemp: Float = 24.5f`<br/> `val price: Double = 19.99` |
| [布尔](booleans.md)                                       | `Boolean`                          | `val isEnabled: Boolean = true`                                   |
| [字符](characters.md)                                     | `Char`                             | `val separator: Char = ','`                                       |
| [字符串](strings.md)                                      | `String`                           | `val message: String = "Hello, world!"`                           |

有关基本类型及其属性的更多信息，请参阅[类型概述](types-overview.md)。

掌握了这些知识后，你就可以声明变量并在稍后进行初始化。只要变量在首次读取前已完成初始化，Kotlin 就能正确处理。

要声明一个变量而不立即初始化它，请使用 `:` 指定其类型。例如：

```kotlin
fun main() {
//sampleStart
    // 声明变量但不进行初始化
    val d: Int
    // 初始化变量
    d = 3

    // 显式指定类型并初始化变量
    val e: String = "hello"

    // 变量已被初始化，因此可以被读取
    println(d) // 3
    println(e) // hello
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-basic-types-initialization"}

如果在读取变量之前没有对其进行初始化，你将会看到一个错误：

```kotlin
fun main() {
//sampleStart
    // 声明变量但不进行初始化
    val d: Int
    
    // 触发错误
    println(d)
    // Variable 'd' must be initialized
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-basic-types-no-initialization" validate="false"}

现在你已经了解了如何声明基本类型，接下来让我们学习[集合](kotlin-tour-collections.md)。

## 练习 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true">
<def title="为变量显式声明类型" id="basic-types-exercise-1">

为每个变量显式声明正确的类型：

```kotlin
fun main() {
    val a: Int = 1000 
    val b = "log message"
    val c = 3.14
    val d = 100_000_000_000_000
    val e = false
    val f = '\n'
}
```
{validate="false" kotlin-runnable="true" id="kotlin-tour-basic-types-exercise"}

```kotlin
fun main() {
    val a: Int = 1000
    val b: String = "log message"
    val c: Double = 3.14
    val d: Long = 100_000_000_000_000
    val e: Boolean = false
    val f: Char = '\n'
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考解答" id="kotlin-tour-basic-types-solution"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-hello-world.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-collections.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>