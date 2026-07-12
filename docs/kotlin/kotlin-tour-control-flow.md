[//]: # (title: 控制流)

<no-index/>

与其他编程语言类似，Kotlin 能够根据一段代码的求值结果是否为 true 来做出决策。这类代码被称为 **条件表达式**。Kotlin 还能创建并遍历循环。

## 条件表达式

Kotlin 提供了 `if` 和 `when` 来检查条件表达式。 

> 如果必须在 `if` 和 `when` 之间做出选择，我们建议使用 `when`，因为它：
> 
> * 使代码更易于阅读。
> * 更易于添加另一个分支。
> * 减少代码中的错误。
> 
{style="note"}

### If

要使用 `if`，请在圆括号 `()` 内添加条件表达式，并在花括号 `{}` 内添加结果为 true 时要执行的操作：

```kotlin
fun main() {
//sampleStart
    val d: Int
    val check = true

    if (check) {
        d = 1
    } else {
        d = 2
    }

    println(d)
    // 1
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-if"}

Kotlin 中没有三元运算符 `condition ? then : else`。相反，`if` 可以作为表达式使用。如果每个操作只有一行代码，则花括号 `{}` 是可选的：

```kotlin
fun main() { 
//sampleStart
    val a = 1
    val b = 2

    println(if (a > b) a else b) // 返回一个值：2
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-if-expression"}

### When

当条件表达式有多个分支时，请使用 `when`。

要使用 `when`：

* 将要评估的值放在圆括号 `()` 内。
* 将分支放在花括号 `{}` 内。
* 在每个分支中使用 `->` 将每次检查与检查成功时要执行的操作分开。

`when` 既可以作为语句使用，也可以作为表达式使用。**语句** (statement) 不返回任何内容，而是执行操作。

以下是将 `when` 作为语句使用的示例：

```kotlin
fun main() {
//sampleStart
    val obj = "Hello"

    when (obj) {
        // 检查 obj 是否等于 "1"
        "1" -> println("One")
        // 检查 obj 是否等于 "Hello"
        "Hello" -> println("Greeting")
        // 默认语句
        else -> println("Unknown")     
    }
    // Greeting
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-when-statement"}

> 请注意，所有分支条件都会按顺序检查，直到其中一个满足为止。因此，只有第一个匹配的分支会被执行。
>
{style="note"}

**表达式** (expression) 返回一个值，供稍后在代码中使用。

以下是将 `when` 作为表达式使用的示例。`when` 表达式会立即赋值给一个变量，稍后该变量将用于 `println()` 函数：

```kotlin
fun main() {
//sampleStart    
    val obj = "Hello"    
    
    val result = when (obj) {
        // 如果 obj 等于 "1"，将 result 设置为 "One"
        "1" -> "One"
        // 如果 obj 等于 "Hello"，将 result 设置为 "Greeting"
        "Hello" -> "Greeting"
        // 如果之前没有条件满足，将 result 设置为 "Unknown"
        else -> "Unknown"
    }
    println(result)
    // Greeting
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-when-expression"}

到目前为止，您看到的 `when` 示例都有一个主体：`obj`。但 `when` 也可以在没有主体的情况下使用。

本示例使用 **不带** 主体的 `when` 表达式来检查一系列布尔表达式：

```kotlin
fun main() {
    val trafficLightState = "Red" // 可以是 "Green"、"Yellow" 或 "Red"

    val trafficAction = when {
        trafficLightState == "Green" -> "Go"
        trafficLightState == "Yellow" -> "Slow down"
        trafficLightState == "Red" -> "Stop"
        else -> "Malfunction"
    }

    println(trafficAction)
    // Stop
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-when-expression-boolean"}

不过，您可以编写同样的代码，但将 `trafficLightState` 作为主体：

```kotlin
fun main() {
    val trafficLightState = "Red" // 可以是 "Green"、"Yellow" 或 "Red"

    val trafficAction = when (trafficLightState) {
        "Green" -> "Go"
        "Yellow" -> "Slow down"
        "Red" -> "Stop"
        else -> "Malfunction"
    }

    println(trafficAction)  
    // Stop
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-when-expression-boolean-subject"}

在 `when` 中使用主体可以使代码更易于阅读和维护。当您在 `when` 表达式中使用主体时，它还能帮助 Kotlin 检查是否涵盖了所有可能的情况。否则，如果您不在 `when` 表达式中使用主体，则需要提供一个 `else` 分支。

## 条件表达式练习

### 练习 1 {initial-collapse-state="collapsed" collapsible="true" id="conditional-expressions-exercise-1"}

创建一个简单的游戏，如果投掷两枚骰子结果相同，您就赢了。使用 `if` 在骰子匹配时打印 `You win :)`，否则打印 `You lose :(`。

> 在本练习中，您将导入一个软件包，以便可以使用 `Random.nextInt()` 函数为您提供一个随机 `Int`。
> 有关导入软件包的更多信息，请参阅[软件包与导入](packages.md)。
>
{style="tip"}

<deflist collapsible="true">
    <def title="提示">
        使用<a href="operator-overloading.md#equality-and-inequality-operators">相等运算符</a> (<code>==</code>) 来比较骰子结果。 
    </def>
</deflist>

|---|---|
```kotlin
import kotlin.random.Random

fun main() {
    val firstResult = Random.nextInt(6)
    val secondResult = Random.nextInt(6)
    // 在此处编写您的代码
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-control-flow-conditional-exercise-1"}

|---|---|
```kotlin
import kotlin.random.Random

fun main() {
    val firstResult = Random.nextInt(6)
    val secondResult = Random.nextInt(6)
    if (firstResult == secondResult)
        println("You win :)")
    else
        println("You lose :(")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法" id="kotlin-tour-control-flow-conditional-solution-1"}

### 练习 2 {initial-collapse-state="collapsed" collapsible="true" id="conditional-expressions-exercise-2"}

使用 `when` 表达式更新以下程序，以便在输入游戏控制台按钮名称时打印相应的操作。

| **按钮** | **操作**             |
|------------|------------------------|
| A          | Yes                    |
| B          | No                     |
| X          | Menu                   |
| Y          | Nothing                |
| 其他       | There is no such button |

|---|---|
```kotlin
fun main() {
    val button = "A"

    println(
        // 在此处编写您的代码
    )
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-control-flow-conditional-exercise-2"}

|---|---|
```kotlin
fun main() {
    val button = "A"
    
    println(
        when (button) {
            "A" -> "Yes"
            "B" -> "No"
            "X" -> "Menu"
            "Y" -> "Nothing"
            else -> "There is no such button"
        }
    )
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法" id="kotlin-tour-control-flow-conditional-solution-2"}

## 区间

在讨论循环之前，了解如何构建供循环遍历的区间 (Range) 非常有用。

在 Kotlin 中创建区间最常用的方式是使用 `..` 运算符。例如，`1..4` 等同于 `1, 2, 3, 4`。

要声明一个不包含末尾值的区间，请使用 `..<` 运算符。例如，`1..<4` 等同于 `1, 2, 3`。

要以相反顺序声明区间，请使用 [`downTo`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.ranges/down-to.html)。例如，`4 downTo 1` 等同于 `4, 3, 2, 1`。

要声明一个增量不是 1 的区间，请使用 [`step`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.ranges/step.html) 和您所需的增量值。
例如，`1..5 step 2` 等同于 `1, 3, 5`。

您也可以对 `Char` (字符) 区间执行相同的操作：

* `'a'..'d'` 等同于 `'a', 'b', 'c', 'd'`
* `'z' downTo 's' step 2` 等同于 `'z', 'x', 'v', 't'`

## 循环

编程中最常见的两种循环结构是 `for` 和 `while`。使用 `for` 遍历一系列值并执行操作。使用 `while` 继续执行操作，直到满足特定条件为止。

### For

利用您新学到的区间知识，可以创建一个 `for` 循环，遍历数字 1 到 5 并每次打印该数字。

将迭代器和区间放在圆括号 `()` 内，并使用关键字 `in`。在花括号 `{}` 内添加您想要完成的操作：

```kotlin
fun main() {
//sampleStart
    for (number in 1..5) { 
        // number 是迭代器，1..5 是区间
        print(number)
    }
    // 12345
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-for-loop"}

集合也可以通过循环进行遍历：

```kotlin
fun main() { 
//sampleStart
    val cakes = listOf("carrot", "cheese", "chocolate")

    for (cake in cakes) {
        println("Yummy, it's a $cake cake!")
    }
    // Yummy, it's a carrot cake!
    // Yummy, it's a cheese cake!
    // Yummy, it's a chocolate cake!
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-for-collection-loop"}

### While

`while` 可以通过两种方式使用：

  * 在条件表达式为 true 时执行代码块。(`while`)
  * 先执行代码块，然后检查条件表达式。(`do-while`)

在第一种使用场景 (`while`) 中：

* 在圆括号 `()` 内声明 `while` 循环继续执行的条件表达式。 
* 在花括号 `{}` 内添加您想要完成的操作。

> 以下示例使用[增量运算符](operator-overloading.md#increments-and-decrements) `++` 来增加 `cakesEaten` 变量的值。
>
{style="tip"}

```kotlin
fun main() {
//sampleStart
    var cakesEaten = 0
    while (cakesEaten < 3) {
        println("Eat a cake")
        cakesEaten++
    }
    // Eat a cake
    // Eat a cake
    // Eat a cake
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-while-loop"}

在第二种使用场景 (`do-while`) 中：

* 在圆括号 `()` 内声明 `while` 循环继续执行的条件表达式。
* 在关键字 `do` 后面的花括号 `{}` 内定义您想要完成的操作。

```kotlin
fun main() {
//sampleStart
    var cakesEaten = 0
    var cakesBaked = 0
    while (cakesEaten < 3) {
        println("Eat a cake")
        cakesEaten++
    }
    do {
        println("Bake a cake")
        cakesBaked++
    } while (cakesBaked < cakesEaten)
    // Eat a cake
    // Eat a cake
    // Eat a cake
    // Bake a cake
    // Bake a cake
    // Bake a cake
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-while-do-loop"}

有关条件表达式和循环的更多信息和示例，请参阅[条件与循环](control-flow.md)。

既然您已经了解了 Kotlin 控制流的基础知识，现在是时候学习如何编写自己的[函数](kotlin-tour-functions.md)了。

## 循环练习 {completion-point="true"}

### 练习 1 {initial-collapse-state="collapsed" collapsible="true" id="loops-exercise-1"}

您有一个程序，负责清点披萨切片，直到凑够一个包含 8 片的完整披萨。通过两种方式重构此程序：

* 使用 `while` 循环。
* 使用 `do-while` 循环。

|---|---|
```kotlin
fun main() {
    var pizzaSlices = 0
    // 从此处开始重构
    pizzaSlices++
    println("There's only $pizzaSlices slice/s of pizza :(")
    pizzaSlices++
    println("There's only $pizzaSlices slice/s of pizza :(")
    pizzaSlices++
    println("There's only $pizzaSlices slice/s of pizza :(")
    pizzaSlices++
    println("There's only $pizzaSlices slice/s of pizza :(")
    pizzaSlices++
    println("There's only $pizzaSlices slice/s of pizza :(")
    pizzaSlices++
    println("There's only $pizzaSlices slice/s of pizza :(")
    pizzaSlices++
    println("There's only $pizzaSlices slice/s of pizza :(")
    pizzaSlices++
    // 在此处结束重构
    println("There are $pizzaSlices slices of pizza. Hooray! We have a whole pizza! :D")
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-control-flow-loops-exercise-1"}

|---|---|
```kotlin
fun main() {
    var pizzaSlices = 0
    while ( pizzaSlices < 7 ) {
        pizzaSlices++
        println("There's only $pizzaSlices slice/s of pizza :(")
    }
    pizzaSlices++
    println("There are $pizzaSlices slices of pizza. Hooray! We have a whole pizza! :D")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法 1" id="kotlin-tour-control-flow-loops-exercise-1-solution-1"}

|---|---|
```kotlin
fun main() {
    var pizzaSlices = 0
    pizzaSlices++
    do {
        println("There's only $pizzaSlices slice/s of pizza :(")
        pizzaSlices++
    } while ( pizzaSlices < 8 )
    println("There are $pizzaSlices slices of pizza. Hooray! We have a whole pizza! :D")
}

```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法 2" id="kotlin-tour-control-flow-loops-exercise-1-solution-2"}

### 练习 2 {initial-collapse-state="collapsed" collapsible="true" id="loops-exercise-2"}

编写一个模拟 [Fizz buzz](https://en.wikipedia.org/wiki/Fizz_buzz) 游戏的程序。您的任务是递增打印从 1 到 100 的数字，将任何能被 3 整除的数字替换为单词 "fizz"，将任何能被 5 整除的数字替换为单词 "buzz"。任何既能被 3 整除又能被 5 整除的数字都必须替换为单词 "fizzbuzz"。

<deflist collapsible="true">
    <def title="提示 1">
        使用 <code>for</code> 循环来计数，并使用 <code>when</code> 表达式来决定每一步打印什么。 
    </def>
</deflist>

<deflist collapsible="true">
    <def title="提示 2">
        使用取模运算符 (<code>%</code>) 返回数字相除后的余数。使用<a href="operator-overloading.md#equality-and-inequality-operators">相等运算符</a> (<code>==</code>) 检查余数是否等于零。
    </def>
</deflist>

|---|---|
```kotlin
fun main() {
    // 在此处编写您的代码
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-control-flow-loops-exercise-2"}

|---|---|
```kotlin
fun main() {
    for (number in 1..100) {
        println(
            when {
                number % 15 == 0 -> "fizzbuzz"
                number % 3 == 0 -> "fizz"
                number % 5 == 0 -> "buzz"
                else -> "$number"
            }
        )
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法" id="kotlin-tour-control-flow-loops-solution-2"}

### 练习 3 {initial-collapse-state="collapsed" collapsible="true" id="loops-exercise-3"}

您有一个单词列表。使用 `for` 和 `if` 仅打印以字母 `l` 开头的单词。

<deflist collapsible="true">
    <def title="提示">
        对 <code>String</code> 类型使用 <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/starts-with.html"> <code>.startsWith()</code>
        </a> 函数。 
    </def>
</deflist>

|---|---|
```kotlin
fun main() {
    val words = listOf("dinosaur", "limousine", "magazine", "language")
    // 在此处编写您的代码
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-control-flow-loops-exercise-3"}

|---|---|
```kotlin
fun main() {
    val words = listOf("dinosaur", "limousine", "magazine", "language")
    for (w in words) {
        if (w.startsWith("l"))
            println(w)
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法" id="kotlin-tour-control-flow-loops-solution-3"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-collections.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-functions.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>