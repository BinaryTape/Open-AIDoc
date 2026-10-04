[//]: # (title: 函数)

<no-index/>

你可以使用 `fun` 关键字在 Kotlin 中声明自己的函数。

```kotlin
fun hello() {
    return println("Hello, world!")
}

fun main() {
    hello()
    // Hello, world!
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-function-demo"}

在 Kotlin 中：

* 函数形参写在圆括号 `()` 内。
* 每个形参都必须指定类型，多个形参之间必须用逗号 `,` 分隔。
* 返回值类型写在函数的圆括号 `()` 之后，用冒号 `:` 分隔。
* 函数体写在花括号 `{}` 内。
* `return` 关键字用于退出函数或从函数返回值。

> 如果函数不返回任何有用的内容，则可以省略返回值类型和 `return` 关键字。有关详细信息，请参阅[无返回值的函数](#functions-without-return)。
>
{style="note"}

在以下示例中：

* `x` 和 `y` 是函数形参。
* `x` 和 `y` 的类型为 `Int`。
* 该函数的返回值类型为 `Int`。
* 调用该函数时会返回 `x` 和 `y` 的和。

```kotlin
fun sum(x: Int, y: Int): Int {
    return x + y
}

fun main() {
    println(sum(1, 2))
    // 3
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-simple-function"}

> 我们在[编码规范](coding-conventions.md#function-names)中建议：函数命名以小写字母开头，并采用不含下划线的骆驼拼写法。
> 
{style="note"}

## 命名实参 {id="named-arguments"}

为了使代码更简洁，调用函数时不必包含形参名称。但是，包含形参名称确实可以提高代码的可读性。这被称为使用**命名实参**。如果包含了形参名称，就可以按任意顺序书写实参。

> 在以下示例中，使用[字符串模板](strings.md#string-templates)（`$`）来访问形参值，将其转换为 `String` 类型，然后串联成一个字符串进行打印。
> 
{style="tip"}

```kotlin
fun printMessageWithPrefix(message: String, prefix: String) {
    println("[$prefix] $message")
}

fun main() {
    // 使用命名实参并调换了实参顺序
    printMessageWithPrefix(prefix = "Log", message = "Hello")
    // [Log] Hello
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-named-arguments-function"}

## 默认形参值 {id="default-parameter-values"}

你可以为函数形参定义默认值。在调用函数时，任何具有默认值的形参都可以省略。要声明默认值，请在类型之后使用赋值运算符 `=`：

```kotlin
fun printMessageWithPrefix(message: String, prefix: String = "Info") {
    println("[$prefix] $message")
}

fun main() {
    // 传入全部两个实参调用函数
    printMessageWithPrefix("Hello", "Log") 
    // [Log] Hello
    
    // 仅传入 message 实参调用函数
    printMessageWithPrefix("Hello")        
    // [Info] Hello
    
    printMessageWithPrefix(prefix = "Log", message = "Hello")
    // [Log] Hello
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-default-param-function"}

> 你可以跳过带有默认值的特定形参，而不必省略所有形参。但是，在第一个跳过的形参之后，必须为后续的所有实参指定名称。
>
{style="note"}

## 无返回值的函数 {id="functions-without-return"}

如果你的函数不返回有用的值，其返回值类型就是 `Unit`。`Unit` 是一种只有一个值的类型——即 `Unit`。你无需在函数体中显式声明返回 `Unit`。这意味着你既不需要使用 `return` 关键字，也不需要声明返回值类型：

```kotlin
fun printMessage(message: String) {
    println(message)
    // `return Unit` 或 `return` 是可选的
}

fun main() {
    printMessage("Hello")
    // Hello
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-unit-function"}

## 单表达式函数 {id="single-expression-functions"}

为了让代码更简洁，你可以使用单表达式函数。例如，可以简化 `sum()` 函数：

```kotlin
fun sum(x: Int, y: Int): Int {
    return x + y
}

fun main() {
    println(sum(1, 2))
    // 3
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-simple-function-before"}

你可以移除花括号 `{}`，并使用赋值运算符 `=` 来声明函数体。当使用赋值运算符 `=` 时，Kotlin 会使用类型推断，因此你也可以省略返回值类型。此时 `sum()` 函数就变成了一行：

```kotlin
fun sum(x: Int, y: Int) = x + y

fun main() {
    println(sum(1, 2))
    // 3
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-simple-function-after"}

不过，如果你希望代码能够被其他开发者迅速理解，即使在使用赋值运算符 `=` 时，显式定义返回值类型也是一个好习惯。

> 如果使用 `{}` 花括号来声明函数体，则必须声明返回值类型，除非该类型为 `Unit`。
> 
{style="note"}

## 函数中的提前返回 {id="early-returns-in-functions"}

要阻止函数中的代码执行超过某个特定点，请使用 `return` 关键字。该示例使用 `if`，在条件表达式为 true 时提前从函数返回：

```kotlin
// 已注册用户名的列表
val registeredUsernames = mutableListOf("john_doe", "jane_smith")

// 已注册电子邮箱的列表
val registeredEmails = mutableListOf("john@example.com", "jane@example.com")

fun registerUser(username: String, email: String): String {
    // 如果用户名已被占用，则提前返回
    if (username in registeredUsernames) {
        return "Username already taken. Please choose a different username."
    }

    // 如果电子邮箱已被注册，则提前返回
    if (email in registeredEmails) {
        return "Email already registered. Please use a different email."
    }

    // 如果用户名和电子邮箱均未被占用，则继续注册
    registeredUsernames.add(username)
    registeredEmails.add(email)

    return "User registered successfully: $username"
}

fun main() {
    println(registerUser("john_doe", "newjohn@example.com"))
    // Username already taken. Please choose a different username.
    println(registerUser("new_user", "newuser@example.com"))
    // User registered successfully: new_user
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-function-early-return"}

## 练习：函数 {id="practice-functions"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="计算圆的面积" id="functions-exercise-1">

编写一个名为 `circleArea` 的函数，该函数接收以整数格式表示的圆半径作为形参，并输出该圆的面积。

> 在本练习中，你将导入一个软件包，以便可以通过 `PI` 访问 <math>π</math> 的值。有关导入软件包的更多信息，请参阅[软件包与导入](packages.md)。
>
{style="tip"}

<deflist collapsible="true" id="kotlin-tour-functions-exercise-1-hint">
    <def title="提示">
        计算圆面积的公式为 <math>πr^2</math>，其中 <math>r</math> 为半径。
    </def>
</deflist>

```kotlin
import kotlin.math.PI

// 在此处编写你的代码

fun main() {
    println(circleArea(2))
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-functions-exercise-1"}

```kotlin
import kotlin.math.PI

fun circleArea(radius: Int): Double {
    return PI * radius * radius
}

fun main() {
    println(circleArea(2)) // 12.566370614359172
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考解答" id="kotlin-tour-functions-solution-1"}

</def>
<def title="将函数重写为单表达式" id="functions-exercise-2">

将上一练习中的 `circleArea` 函数重写为单表达式函数。

```kotlin
import kotlin.math.PI

// 在此处编写你的代码

fun main() {
    println(circleArea(2))
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-functions-exercise-2"}

```kotlin
import kotlin.math.PI

fun circleArea(radius: Int): Double = PI * radius * radius

fun main() {
    println(circleArea(2)) // 12.566370614359172
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考解答" id="kotlin-tour-functions-solution-2"}

</def>
<def title="使用默认形参和命名实参重构函数" id="functions-exercise-3">

你有一个函数，用于将以小时、分钟和秒给出的时间间隔转换为秒。在大多数情况下，你只需要传递一个或两个函数形参，而其余形参等于 0。请使用默认形参值和命名实参来改进该函数及调用它的代码，使代码更易于阅读。

```kotlin
fun intervalInSeconds(hours: Int, minutes: Int, seconds: Int) =
    ((hours * 60) + minutes) * 60 + seconds

fun main() {
    println(intervalInSeconds(1, 20, 15))
    println(intervalInSeconds(0, 1, 25))
    println(intervalInSeconds(2, 0, 0))
    println(intervalInSeconds(0, 10, 0))
    println(intervalInSeconds(1, 0, 1))
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-functions-exercise-3"}

```kotlin
fun intervalInSeconds(hours: Int = 0, minutes: Int = 0, seconds: Int = 0) =
    ((hours * 60) + minutes) * 60 + seconds

fun main() {
    println(intervalInSeconds(1, 20, 15))
    println(intervalInSeconds(minutes = 1, seconds = 25))
    println(intervalInSeconds(hours = 2))
    println(intervalInSeconds(minutes = 10))
    println(intervalInSeconds(hours = 1, seconds = 1))
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考解答" id="kotlin-tour-functions-solution-3"}

</def>
</deflist>

## lambda表达式 {id="lambda-expressions"}

Kotlin 允许你通过使用 lambda 表达式来编写更加简洁的函数代码。

例如，以下 `uppercaseString()` 函数：

```kotlin
fun uppercaseString(text: String): String {
    return text.uppercase()
}
fun main() {
    println(uppercaseString("hello"))
    // HELLO
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-function-before"}

也可以写成 lambda 表达式：

```kotlin
fun main() {
    val upperCaseString = { text: String -> text.uppercase() }
    println(upperCaseString("hello"))
    // HELLO
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-variable"}

lambda 表达式初看可能比较难理解，让我们逐步剖析。lambda 表达式写在花括号 `{}` 内。

在 lambda 表达式内部，你需要编写：

* 形参，后跟 `->`。
* `->` 之后的函数体。

在前面的示例中：

* `text` 是函数形参。
* `text` 的类型为 `String`。
* 该函数返回在 `text` 上调用 [`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase.html) 函数的结果。
* 整个 lambda 表达式通过赋值运算符 `=` 赋值给 `upperCaseString` 变量。
* 通过像调用函数一样使用变量 `upperCaseString`，并将字符串 `"hello"` 作为实参来调用该 lambda 表达式。
* `println()` 函数打印结果。

> 如果你声明的 lambda 没有形参，则无需使用 `->`。例如：
> ```kotlin
> { println("Log message") }
> ```
>
{style="note"}

lambda 表达式有多种用法。你可以：

* [将 lambda 表达式作为形参传递给另一个函数](#pass-to-another-function)
* [从函数中返回 lambda 表达式](#return-from-a-function)
* [单独调用 lambda 表达式](#invoke-separately)

### 传递给另一个函数 {id="pass-to-another-function"}

将 lambda 表达式传递给函数的绝佳示例，是对集合使用 [`.filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html) 函数：

```kotlin
fun main() {
    //sampleStart
    val numbers = listOf(1, -2, 3, -4, 5, -6)
    
    val positives = numbers.filter ({ x -> x > 0 })
    
    val isNegative = { x: Int -> x < 0 }
    val negatives = numbers.filter(isNegative)
    
    println(positives)
    // [1, 3, 5]
    println(negatives)
    // [-2, -4, -6]
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-filter"}

`.filter()` 函数接受一个 lambda 表达式作为谓词，并将其应用于列表中的每个元素。该函数仅在谓词返回 `true` 时保留该元素：

* `{ x -> x > 0 }` 在元素为正数时返回 `true`。
* `{ x -> x < 0 }` 在元素为负数时返回 `true`。

该示例展示了将 lambda 表达式传递给函数的两种方式：

* 对于正数，示例直接在 `.filter()` 函数中添加 lambda 表达式。
* 对于负数，示例将 lambda 表达式赋值给 `isNegative` 变量。然后将 `isNegative` 变量作为函数实参用在 `.filter()` 函数中。在这种情况下，必须在 lambda 表达式中指定函数形参（`x`）的类型。

> 如果 lambda 表达式是唯一的函数实参，则可以省略函数的圆括号 `()`：
> 
> ```kotlin
> val positives = numbers.filter { x -> x > 0 }
> ```
> 
> 这是[尾随 lambda](#trailing-lambdas) 的一个示例，本章末尾将对此进行更详细的讨论。
>
{style="note"}

另一个很好的示例是使用 [`.map()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map.html) 函数来转换集合中的元素：

```kotlin
fun main() {
    //sampleStart
    val numbers = listOf(1, -2, 3, -4, 5, -6)
    val doubled = numbers.map { x -> x * 2 }
    
    val isTripled = { x: Int -> x * 3 }
    val tripled = numbers.map(isTripled)
    
    println(doubled)
    // [2, -4, 6, -8, 10, -12]
    println(tripled)
    // [3, -6, 9, -12, 15, -18]
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-map"}

`.map()` 函数接受一个 lambda 表达式作为转换函数：

* `{ x -> x * 2 }` 获取列表的每个元素，并返回该元素乘以 2 的结果。
* `{ x -> x * 3 }` 获取列表的每个元素，并返回该元素乘以 3 的结果。

### 函数类型 {id="function-types"}

在从函数返回 lambda 表达式之前，你首先需要了解**函数类型**。

你已经了解了基本类型，但函数本身也有类型。Kotlin 的类型推断可以根据形参类型推断出函数的类型。但有时你可能需要显式指定函数类型。编译器需要函数类型，以便明确该函数允许和不允许的操作。

函数类型的语法如下：

* 每个形参的类型写在圆括号 `()` 内，并用逗号 `,` 分隔。
* 返回值类型写在 `->` 之后。

例如：`(String) -> String` 或 `(Int, Int) -> Int`。

如果为 `upperCaseString()` 定义了函数类型，lambda 表达式将如下所示：

```kotlin
val upperCaseString: (String) -> String = { text -> text.uppercase() }

fun main() {
    println(upperCaseString("hello"))
    // HELLO
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-function-type"}

如果你的 lambda 表达式没有形参，则圆括号 `()` 保持为空。例如：`() -> Unit`

> 必须在 lambda 表达式中或作为函数类型声明形参和返回值类型。否则，编译器将无法得知 lambda 表达式的类型。
> 
> 例如，以下代码将无法正常运行：
> 
> `val upperCaseString = { str -> str.uppercase() }`
>
{style="note"}

### 从函数返回 {id="return-from-a-function"}

lambda 表达式可以作为函数的返回值。为了让编译器理解返回的 lambda 表达式是什么类型，你必须声明一个函数类型。

在以下示例中，`toSeconds()` 函数具有函数类型 `(Int) -> Int`，因为它总是返回一个接收 `Int` 类型形参并返回 `Int` 值的 lambda 表达式。

该示例使用 `when` 表达式来确定在调用 `toSeconds()` 时返回哪个 lambda 表达式：

```kotlin
fun toSeconds(time: String): (Int) -> Int = when (time) {
    "hour" -> { value -> value * 60 * 60 }
    "minute" -> { value -> value * 60 }
    "second" -> { value -> value }
    else -> { value -> value }
}

fun main() {
    val timesInMinutes = listOf(2, 10, 15, 1)
    val min2sec = toSeconds("minute")
    val totalTimeInSeconds = timesInMinutes.map(min2sec).sum()
    println("Total time is $totalTimeInSeconds secs")
    // Total time is 1680 secs
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-return-from-function"}

### 单独调用 {id="invoke-separately"}

通过在花括号 `{}` 之后添加圆括号 `()` 并在圆括号内传入实参，可以单独调用 lambda 表达式：

```kotlin
fun main() {
    //sampleStart
    println({ text: String -> text.uppercase() }("hello"))
    // HELLO
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-standalone"}

### 尾随 lambda {id="trailing-lambdas"}

正如你之前所见，如果 lambda 表达式是唯一的函数实参，则可以省略函数的圆括号 `()`。如果 lambda 表达式作为函数的最后一个实参传递，则该表达式可以写在函数圆括号 `()` 的外部。这两种情况下的语法都称为**尾随 lambda**。

例如，[`.fold()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/fold.html) 函数接收一个初始值和一个操作：

```kotlin
fun main() {
    //sampleStart
    // 初始值为零。 
    // 该操作将初始值与列表中的每个元素进行累加。
    println(listOf(1, 2, 3).fold(0, { x, item -> x + item })) // 6

    // 或者，采用尾随 lambda 的形式
    println(listOf(1, 2, 3).fold(0) { x, item -> x + item })  // 6
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-trailing-lambda"}

有关 lambda 表达式的更多信息，请参阅 [lambda表达式与匿名函数](lambdas.md#lambda-expressions-and-anonymous-functions)。

我们教程的下一步是学习 Kotlin 中的[类](kotlin-tour-classes.md)。

## 练习：lambda表达式 {completion-point="true" id="practice-lambda-expressions"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="使用 lambda 表达式构建 URL 列表" id="lambdas-exercise-1">

你有一个 Web 服务支持的操作列表、所有请求的通用前缀以及特定资源的 ID。
若要针对 ID 为 5 的资源请求 `title` 操作，你需要创建以下 URL：`https://example.com/book-info/5/title`。
请使用 lambda 表达式从操作列表中创建一个 URL 列表。

```kotlin
fun main() {
    val actions = listOf("title", "year", "author")
    val prefix = "https://example.com/book-info"
    val id = 5
    val urls = // 在此处编写你的代码
    println(urls)
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambdas-exercise-1"}

```kotlin
fun main() {
    val actions = listOf("title", "year", "author")
    val prefix = "https://example.com/book-info"
    val id = 5
    val urls = actions.map { action -> "$prefix/$id/$action" }
    println(urls)
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考解答" id="kotlin-tour-lambdas-solution-1"}

</def>
<def title="多次重复执行操作" id="lambdas-exercise-2">

编写一个接收 `Int` 值和一个操作（类型为 `() -> Unit` 的函数）的函数，该函数将重复执行该操作指定的次数。然后使用该函数打印 5 次 “Hello”。

```kotlin
fun repeatN(n: Int, action: () -> Unit) {
    // 在此处编写你的代码
}

fun main() {
    // 在此处编写你的代码
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambdas-exercise-2"}

```kotlin
fun repeatN(n: Int, action: () -> Unit) {
    for (i in 1..n) {
        action()
    }
}

fun main() {
    repeatN(5) {
        println("Hello")
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考解答" id="kotlin-tour-lambdas-solution-2"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-control-flow.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-classes.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>