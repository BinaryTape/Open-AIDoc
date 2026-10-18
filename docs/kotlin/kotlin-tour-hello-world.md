[//]: # (title: Hello world)

<no-index/>

这是一个打印 "Hello, world!" 的简单程序：

```kotlin
fun main() {
    println("Hello, world!")
    // Hello, world!
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="hello-world-kotlin"}

在 Kotlin 中：

* `fun` 用于声明函数
* `main()` 函数是程序的入口点
* 函数体写在花括号 `{}` 内
* [`println()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/println.html) 和 [`print()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/print.html) 函数将其实参打印到标准输出

函数是执行特定任务的一组指令。一旦创建了函数，每当需要执行该任务时就可以使用它，而无需重写所有指令。后续章节将更详细地讨论函数。在那之前，所有示例都使用 `main()` 函数。

## 变量 {id="variables"}

所有程序都需要能够存储数据，而变量正是用于此目的。在 Kotlin 中，你可以声明：

* 使用 `val` 声明只读变量
* 使用 `var` 声明可变变量

> 一旦为只读变量赋予了值，就无法更改它。
>
{style="note"}

要赋值，请使用赋值运算符 `=`。

例如：

```kotlin
fun main() { 
//sampleStart
    val popcorn = 5    // 有 5 盒爆米花
    val hotdog = 7     // 有 7 个热狗
    var customers = 10 // 队列中有 10 位顾客
    
    // 一些顾客离开了队列
    customers = 8
    println(customers)
    // 8
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-variables"}

> 变量可以在程序开头的 `main()` 函数外部声明。以这种方式声明的变量被称为在**顶层**（top level）声明。
> 
{style="tip"}

由于 `customers` 是一个可变变量，因此其值在声明后可以被重新赋值。

> 我们建议默认将所有变量声明为只读（`val`）。仅在确实需要时才使用可变变量（`var`）。这样，你就不太可能意外修改本不打算更改的内容。
> 
{style="note"}

## 字符串模板 {id="string-templates"}

了解如何将变量的内容打印到标准输出非常有用。你可以使用**字符串模板**来实现这一点。你可以使用模板表达式访问存储在变量和其他对象中的数据，并将它们转换为字符串。字符串值是双引号 `"` 内的字符序列。模板表达式始终以美元符号 `$` 开头。

要在模板表达式中对一段代码求值，请将该代码放置在美元符号 `$` 后面的花括号 `{}` 内。

例如：

```kotlin
fun main() { 
//sampleStart
    val customers = 10
    println("There are $customers customers")
    // There are 10 customers
    
    println("There are ${customers + 1} customers")
    // There are 11 customers
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-string-templates"}

要了解更多信息，请参阅[字符串模板](strings.md#string-templates)。

你会注意到，并未给变量声明任何类型。Kotlin 自行推断出了类型：`Int`。本教程将在[下一章](kotlin-tour-basic-types.md)介绍不同的 Kotlin 基本类型以及如何声明它们。

## 练习 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true">
<def title="使用字符串模板打印语句" id="hello-world-exercise-1">

补全代码，使程序向标准输出打印 `"Mary is 20 years old"`：

```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    // 在此处编写你的代码
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-hello-world-exercise"}

```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    println("$name is $age years old")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-hello-world-solution"}

</def>
</deflist>

<seealso></seealso>

<list id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-basic-types.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>