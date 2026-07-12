[//]: # (title: 函数)

<no-index/>

在 Kotlin 中，你可以使用 `fun` 关键字声明你自己的函数。

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
* 每个形参必须有类型，多个形参必须用逗号 `,` 分隔。
* 返回值类型写在函数圆括号 `()` 之后，用冒号 `:` 分隔。
* 函数体写在花括号 `{}` 内。
* `return` 关键字用于退出函数或从函数返回内容。

> 如果函数不返回任何有用的内容，则可以省略返回值类型和 `return` 关键字。在[不带返回值的函数](#不带返回值的函数)中详细了解相关内容。
>
{style="note"}

在以下示例中：

* `x` 和 `y` 是函数形参。
* `x` 和 `y` 的类型为 `Int`。
* 函数的返回值类型为 `Int`。
* 函数在调用时返回 `x` 和 `y` 的和。

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

> 我们的[编码规范](coding-conventions.md#function-names)建议你命名函数时以小写字母开头，并使用不带下划线的骆驼拼写法。
> 
{style="note"}

## 具名实参

为了使代码简洁，在调用函数时，你不必包含形参名称。但是，包含形参名称确实会使你的代码更易于阅读。这被称为使用**具名实参**。如果你确实包含了形参名称，那么你可以按任何顺序编写实参。

> 在以下示例中，使用了[字符串模板](strings.md#string-templates)（`$形参名`）来访问形参值，将其转换为 `String` 类型，然后将它们连接成一个字符串进行打印。
> 
{style="tip"}

```kotlin
fun printMessageWithPrefix(message: String, prefix: String) {
    println("[$prefix] $message")
}

fun main() {
    // 使用具名实参并交换了实参顺序
    printMessageWithPrefix(prefix = "Log", message = "Hello")
    // [Log] Hello
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-named-arguments-function"}

## 默认参数值

你可以为函数形参定义默认值。在调用函数时，可以省略任何具有默认值的形参。要声明默认值，请在类型后使用赋值运算符 `=`：

```kotlin
fun printMessageWithPrefix(message: String, prefix: String = "Info") {
    println("[$prefix] $message")
}

fun main() {
    // 调用函数时带有两个实参
    printMessageWithPrefix("Hello", "Log") 
    // [Log] Hello
    
    // 调用函数时仅带有 message 实参
    printMessageWithPrefix("Hello")        
    // [Info] Hello
    
    printMessageWithPrefix(prefix = "Log", message = "Hello")
    // [Log] Hello
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-default-param-function"}

> 你可以跳过具有默认值的特定参数，而不是省略所有参数。但是，在第一个跳过的参数之后，你必须为所有后续参数命名。
>
{style="note"}

## 不带返回值的函数

如果你的函数不返回有用的值，那么它的返回值类型就是 `Unit`。`Unit` 是一种只有唯一值 `Unit` 的类型。你不需要在函数体中显式声明返回 `Unit`。这意味着你不需要使用 `return` 关键字或声明返回值类型：

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

## 单表达式函数

为了使你的代码更简洁，你可以使用单表达式函数。例如，`sum()` 函数可以缩短：

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

你可以移除花括号 `{}` 并使用赋值运算符 `=` 声明函数体。当你使用赋值运算符 `=` 时，Kotlin 会使用类型推断，因此你也可以省略返回值类型。`sum()` 函数随后变为一行：

```kotlin
fun sum(x: Int, y: Int) = x + y

fun main() {
    println(sum(1, 2))
    // 3
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-simple-function-after"}

然而，如果你希望你的代码能被其他开发者快速理解，即使在使用赋值运算符 `=` 时，显式定义返回值类型也是一个好主意。

> 如果你使用 `{}` 花括号来声明函数体，则必须声明返回值类型，除非它是 `Unit` 类型。
> 
{style="note"}

## 函数中的提前返回

要停止函数中的代码继续处理到某个特定点之后，请使用 `return` 关键字。此示例使用 `if` 在发现条件表达式为 true 时提前从函数返回：

```kotlin
// 已注册用户名的列表
val registeredUsernames = mutableListOf("john_doe", "jane_smith")

// 已注册电子邮件的列表
val registeredEmails = mutableListOf("john@example.com", "jane@example.com")

fun registerUser(username: String, email: String): String {
    // 如果用户名已被占用，则提前返回
    if (username in registeredUsernames) {
        return "Username already taken. Please choose a different username."
    }

    // 如果电子邮件已注册，则提前返回
    if (email in registeredEmails) {
        return "Email already registered. Please use a different email."
    }

    // 如果用户名和电子邮件未被占用，则继续注册
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

## 函数练习

### 练习 1 {initial-collapse-state="collapsed" collapsible="true" id="functions-exercise-1"}

编写一个名为 `circleArea` 的函数，该函数接收圆的半径（整数格式）作为参数并输出该圆的面积。

> 在这个练习中，你需要导入一个包，以便你可以通过 `PI` 访问 <math>π</math> 的值。有关导入包的更多信息，请参阅[包和导入](packages.md)。
>
{style="tip"}

<deflist collapsible="true" id="kotlin-tour-functions-exercise-1-hint">
    <def title="提示">
        计算圆面积的公式是 <math>πr^2</math>，其中 <math>r</math> 是半径。
    </def>
</deflist>

|---|---|
```kotlin
import kotlin.math.PI

// 在这里编写你的代码

fun main() {
    println(circleArea(2))
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-functions-exercise-1"}

|---|---|
```kotlin
import kotlin.math.PI

fun circleArea(radius: Int): Double {
    return PI * radius * radius
}

fun main() {
    println(circleArea(2)) // 12.566370614359172
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法" id="kotlin-tour-functions-solution-1"}

### 练习 2 {initial-collapse-state="collapsed" collapsible="true" id="functions-exercise-2"}

将上一个练习中的 `circleArea` 函数重写为单表达式函数。

|---|---|
```kotlin
import kotlin.math.PI

// 在这里编写你的代码

fun main() {
    println(circleArea(2))
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-functions-exercise-2"}

|---|---|
```kotlin
import kotlin.math.PI

fun circleArea(radius: Int): Double = PI * radius * radius

fun main() {
    println(circleArea(2)) // 12.566370614359172
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法" id="kotlin-tour-functions-solution-2"}

### 练习 3 {initial-collapse-state="collapsed" collapsible="true" id="functions-exercise-3"}

你有一个函数，可以将以小时、分钟和秒给出的时间间隔转换为秒。在大多数情况下，你只需要传递一两个函数形参，而其余参数等于 0。通过使用默认参数值和具名实参来改进该函数及其调用代码，使代码更易于阅读。

|---|---|
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

|---|---|
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法" id="kotlin-tour-functions-solution-3"}

## lambda表达式

Kotlin 允许你通过使用 lambda表达式 为函数编写更简洁的代码。

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

也可以写成 lambda表达式：

```kotlin
fun main() {
    val upperCaseString = { text: String -> text.uppercase() }
    println(upperCaseString("hello"))
    // HELLO
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-variable"}

lambda表达式 乍一看可能很难理解，所以让我们拆解一下。lambda表达式 写在花括号 `{}` 内。

在 lambda表达式 中，你需要编写：

* 形参，后跟一个 `->`。
* `->` 之后的函数体。

在前面的示例中：

* `text` 是一个函数形参。
* `text` 的类型为 `String`。
* 函数返回在 `text` 上调用的 [`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase.html) 函数的结果。
* 整个 lambda表达式 通过赋值运算符 `=` 分配给 `upperCaseString` 变量。
* 通过像使用函数一样使用变量 `upperCaseString` 并将字符串 `"hello"` 作为形参来调用 lambda表达式。
* `println()` 函数打印结果。

> 如果你声明一个不带参数的 lambda，则不需要使用 `->`。例如：
> ```kotlin
> { println("Log message") }
> ```
>
{style="note"}

lambda表达式 可以通过多种方式使用。你可以：

* [将 lambda表达式 作为参数传递给另一个函数](#将-lambda表达式-作为参数传递给另一个函数)
* [从函数返回一个 lambda表达式](#从函数返回一个-lambda表达式)
* [单独调用 lambda表达式](#单独调用-lambda表达式)

### 将 lambda表达式 作为参数传递给另一个函数

将 lambda表达式 传递给函数的一个极佳示例是在集合上使用 [`.filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html) 函数：

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

`.filter()` 函数接受一个 lambda表达式 作为谓词，并将其应用于列表的每个元素。仅当谓词返回 `true` 时，该函数才会保留该元素：

* `{ x -> x > 0 }` 如果元素为正数，则返回 `true`。
* `{ x -> x < 0 }` 如果元素为负数，则返回 `true`。

此示例演示了将 lambda表达式 传递给函数的两种方式：

* 对于正数，示例直接在 `.filter()` 函数中添加 lambda表达式。
* 对于负数，示例将 lambda表达式 分配给 `isNegative` 变量。然后，`isNegative` 变量被用作 `.filter()` 函数中的函数形参。在这种情况下，你必须在 lambda表达式 中指定函数形参 (`x`) 的类型。

> 如果 lambda表达式 是唯一的函数形参，你可以省略函数圆括号 `()`：
> 
> ```kotlin
> val positives = numbers.filter { x -> x > 0 }
> ```
> 
> 这是一个[尾随 lambda](#尾随-lambda) 的示例，本章末尾将更详细地讨论它。
>
{style="note"}

另一个很好的例子是使用 [`.map()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map.html) 函数来转换集合中的项目：

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

`.map()` 函数接受一个 lambda表达式 作为转换函数：

* `{ x -> x * 2 }` 获取列表的每个元素并返回该元素乘以 2 的结果。
* `{ x -> x * 3 }` 获取列表的每个元素并返回该元素乘以 3 的结果。

### 函数类型

在从函数返回 lambda表达式 之前，你首先需要理解**函数类型**。

你已经学习了基本类型，但函数本身也有类型。Kotlin 的类型推断可以从参数类型推断出函数的类型。但有时你可能需要显式指定函数类型。编译器需要函数类型，以便它知道该函数允许和不允许什么。

函数类型的语法包括：

* 每个形参的类型写在圆括号 `()` 内，并用逗号 `,` 分隔。
* 返回值类型写在 `->` 之后。

例如：`(String) -> String` 或 `(Int, Int) -> Int`。

如果为 `upperCaseString()` 定义了函数类型，那么 lambda表达式 看起来像这样：

```kotlin
val upperCaseString: (String) -> String = { text -> text.uppercase() }

fun main() {
    println(upperCaseString("hello"))
    // HELLO
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-function-type"}

如果你的 lambda表达式 没有参数，则圆括号 `()` 为空。例如：`() -> Unit`

> 你必须在 lambda表达式 中或作为函数类型声明形参和返回值类型。否则，编译器将无法知道你的 lambda表达式 是什么类型。
> 
> 例如，以下代码将无法工作：
> 
> `val upperCaseString = { str -> str.uppercase() }`
>
{style="note"}

### 从函数返回一个 lambda表达式

可以从函数返回 lambda表达式。为了使编译器理解返回的 lambda表达式 是什么类型，你必须声明一个函数类型。

在以下示例中，`toSeconds()` 函数的函数类型为 `(Int) -> Int`，因为它总是返回一个接收 `Int` 类型形参并返回 `Int` 值的 lambda表达式。

此示例使用 `when` 表达式来确定在调用 `toSeconds()` 时返回哪个 lambda表达式：

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

### 单独调用 lambda表达式

lambda表达式 可以单独调用，方法是在花括号 `{}` 之后添加圆括号 `()`，并在圆括号内包含任何参数：

```kotlin
fun main() {
    //sampleStart
    println({ text: String -> text.uppercase() }("hello"))
    // HELLO
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-standalone"}

### 尾随 lambda

如你所见，如果 lambda表达式 是唯一的函数形参，你可以省略函数圆括号 `()`。如果 lambda表达式 作为函数的最后一个形参传递，则该表达式可以写在函数圆括号 `()` 之外。在这两种情况下，这种语法都称为**尾随 lambda**。

例如，[`.fold()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/fold.html) 函数接受一个初始值和一个操作：

```kotlin
fun main() {
    //sampleStart
    // 初始值为零。 
    // 该操作累积地将初始值与列表中的每个项相加。
    println(listOf(1, 2, 3).fold(0, { x, item -> x + item })) // 6

    // 或者，采用尾随 lambda 的形式
    println(listOf(1, 2, 3).fold(0) { x, item -> x + item })  // 6
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-trailing-lambda"}

有关 lambda表达式 的更多信息，请参阅 [lambda表达式与匿名函数](lambdas.md#lambda-expressions-and-anonymous-functions)。

我们旅程的下一步是学习 Kotlin 中的[类](kotlin-tour-classes.md)。

## lambda表达式练习 {completion-point="true"}

### 练习 1 {initial-collapse-state="collapsed" collapsible="true" id="lambdas-exercise-1"}

你有一个 Web 服务支持的操作列表、一个适用于所有请求的公共前缀，以及一个特定资源的 ID。要对 ID 为 5 的资源请求操作 `title`，你需要创建以下 URL：`https://example.com/book-info/5/title`。使用 lambda表达式 从操作列表中创建一个 URL 列表。

|---|---|
```kotlin
fun main() {
    val actions = listOf("title", "year", "author")
    val prefix = "https://example.com/book-info"
    val id = 5
    val urls = // 在这里编写你的代码
    println(urls)
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambdas-exercise-1"}

|---|---|
```kotlin
fun main() {
    val actions = listOf("title", "year", "author")
    val prefix = "https://example.com/book-info"
    val id = 5
    val urls = actions.map { action -> "$prefix/$id/$action" }
    println(urls)
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法" id="kotlin-tour-lambdas-solution-1"}

### 练习 2 {initial-collapse-state="collapsed" collapsible="true" id="lambdas-exercise-2"}

编写一个函数，它接收一个 `Int` 值和一个操作（一个类型为 `() -> Unit` 的函数），然后重复执行该操作给定的次数。然后使用此函数打印 “Hello” 5 次。

|---|---|
```kotlin
fun repeatN(n: Int, action: () -> Unit) {
    // 在这里编写你的代码
}

fun main() {
    // 在这里编写你的代码
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambdas-exercise-2"}

|---|---|
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法" id="kotlin-tour-lambdas-solution-2"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-control-flow.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-classes.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>