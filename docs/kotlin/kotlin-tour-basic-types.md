[//]: # (title: 基本类型)

<no-index/>

Kotlin 中的每个变量和数据结构都有一个类型。类型非常重要，因为它们会告诉编译器允许对该变量或数据结构执行哪些操作。换句话说，就是它具有哪些函数和属性。

在上一章的示例中，Kotlin 能够确定 `customers` 的类型为 [`Int`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int/)。
Kotlin 这种**推断**类型的能力被称为**类型推断**。`customers` 被赋值为一个整数值。由此，Kotlin 推断出 `customers` 具有数值类型 `Int`。因此，编译器知道你可以对 `customers` 执行算术运算：

```kotlin
fun main() {
//sampleStart
    var customers = 10

    // 几位顾客离开了队列
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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-basic-types-arithmetic"}

> `+=`、`-=`、`*=`、`/=` 以及 `%=` 是复合赋值运算符。要了解更多信息，请参阅[复合赋值](operator-overloading.md#augmented-assignments)。
> 
{style="tip"}

总的来说，Kotlin 包含以下基本类型：

| **类别**                                                   | **基本类型**                       | **示例代码**                                                      |
|-----------------------------------------------------------|------------------------------------|-------------------------------------------------------------------|
| [整数](numbers.md#integer-types)                          | `Byte`, `Short`, `Int`, `Long`     | `val year: Int = 2020`<br/> `val amount: Long = 350_000_000`      |
| [无符号整数](unsigned-integer-types.md)                    | `UByte`, `UShort`, `UInt`, `ULong` | `val score: UInt = 100u`                                          |
| [浮点数](numbers.md#floating-point-types)                 | `Float`, `Double`                  | `val currentTemp: Float = 24.5f`<br/> `val price: Double = 19.99` |
| [布尔](booleans.md)                                       | `Boolean`                          | `val isEnabled: Boolean = true`                                   |
| [字符](characters.md)                                     | `Char`                             | `val separator: Char = ','`                                       |
| [字符串](strings.md)                                      | `String`                           | `val message: String = "Hello, world!"`                           |

有关基本类型及其属性的更多信息，请参阅[类型概述](types-overview.md)。

掌握了这些知识后，你就可以先声明变量并在稍后对其进行初始化。只要变量在第一次读取之前完成初始化，Kotlin 就能正确处理。

要声明一个未初始化的变量，请使用 `:` 指定其类型。例如：

```kotlin
fun main() {
//sampleStart
    // 声明变量但未初始化
    val d: Int
    // 初始化变量
    d = 3

    // 显式指定类型并初始化变量
    val e: String = "hello"

    // 变量可以被读取，因为它们已经被初始化
    println(d) // 3
    println(e) // hello
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-basic-types-initialization"}

如果在读取变量之前没有对其进行初始化，将会看到一个错误：

```kotlin
fun main() {
//sampleStart
    // 声明变量但未初始化
    val d: Int
    
    // 触发错误
    println(d)
    // 变量 'd' 必须被初始化
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-basic-types-no-initialization" validate="false"}

现在你已经了解了如何声明基本类型，接下来是时候学习[集合](kotlin-tour-collections.md)了。

## 练习 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true">
<def title="为变量声明显式类型">

显式为每个变量声明正确的类型：

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
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-basic-types-exercise"}

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-basic-types-solution"}

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