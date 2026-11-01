[//]: # (title: 带接收者的 lambda 表达式)

<no-index/>

在本章中，你将学习如何对另一种函数类型——lambda 表达式使用接收者，以及它们如何帮助你创建领域专用语言。

## 带接收者的 lambda 表达式 {id="lambda-expressions-with-receiver"}

在初学者教程中，你已经学习了如何使用 [lambda 表达式](kotlin-tour-functions.md#lambda-expressions)。Lambda 表达式也可以拥有接收者。
在这种情况下，lambda 表达式可以访问接收者的任何成员函数或属性，而无需每次都显式指定接收者。省去这些额外的引用后，代码会更易于阅读和维护。

> 带接收者的 lambda 表达式也被称为带接收者的函数字面量。
>
{style="tip"}

当定义函数类型时，带接收者的 lambda 表达式的语法有所不同。首先，编写你想要扩展的接收者。接着加上一个 `.`，然后完成函数类型定义的其余部分。例如：

```kotlin
MutableList<Int>.() -> Unit
```

该函数类型具有：

* `MutableList<Int>` 作为接收者。
* 圆括号 `()` 内没有函数形参。
* 无返回值：`Unit`。

参考以下在画布上绘制形状的示例：

```kotlin
class Canvas {
    fun drawCircle() = println("🟠 Drawing a circle")
    fun drawSquare() = println("🟥 Drawing a square")
}

// 带接收者的 lambda 表达式定义
fun render(block: Canvas.() -> Unit): Canvas {
    val canvas = Canvas()
    // 使用带接收者的 lambda 表达式
    canvas.block()
    return canvas
}

fun main() {
    render {
        drawCircle()
        // 🟠 Drawing a circle
        drawSquare()
        // 🟥 Drawing a square
    }
}
```
{kotlin-runnable="true" id="kotlin-intermediate-tour-lambda-expression-with-receiver"}

在此示例中：

* `Canvas` 类具有两个模拟绘制圆或正方形的函数。
* `render()` 函数接受一个 `block` 形参，并返回 `Canvas` 类的一个实例。
* `block` 形参是一个带接收者的 lambda 表达式，其中 `Canvas` 类是接收者。
* `render()` 函数创建 `Canvas` 类的一个实例，并在 `canvas` 实例上调用 `block()` lambda 表达式，将其用作接收者。
* `main()` 函数调用带有 lambda 表达式的 `render()` 函数，该 lambda 表达式传递给 `block` 形参。
* 在传递给 `render()` 函数的 lambda 内部，程序在 `Canvas` 类的实例上调用 `drawCircle()` 和 `drawSquare()` 函数。

  因为 `drawCircle()` 和 `drawSquare()` 函数是在带接收者的 lambda 表达式中调用的，所以可以直接调用它们，就像在 `Canvas` 类内部一样。

当你想要创建领域专用语言 (DSL) 时，带接收者的 lambda 表达式非常有用。由于无需显式引用接收者即可访问其成员函数和属性，因此代码变得更加精简。

为了演示这一点，我们来看一个配置菜单项的示例。首先从 `MenuItem` 类和一个 `Menu` 类开始，`Menu` 类包含一个用于向菜单添加项的 `item()` 函数，以及所有菜单项的列表 `items`：

```kotlin
class MenuItem(val name: String)

class Menu(val name: String) {
    val items = mutableListOf<MenuItem>()

    fun item(name: String) {
        items.add(MenuItem(name))
    }
}
```

我们以此为起点，使用作为函数形参 (`init`) 传递给用于构建菜单的 `menu()` 函数的带接收者的 lambda 表达式：

```kotlin
fun menu(name: String, init: Menu.() -> Unit): Menu {
    // 创建 Menu 类的一个实例
    val menu = Menu(name)
    // 在类实例上调用带接收者的 lambda 表达式 init()
    menu.init()
    return menu
}
```

现在你可以使用 DSL 来配置菜单，并创建一个 `printMenu()` 函数将菜单结构输出到控制台：

```kotlin
class MenuItem(val name: String)

class Menu(val name: String) {
    val items = mutableListOf<MenuItem>()

    fun item(name: String) {
        items.add(MenuItem(name))
    }
}

fun menu(name: String, init: Menu.() -> Unit): Menu {
    val menu = Menu(name)
    menu.init()
    return menu
}

//sampleStart
fun printMenu(menu: Menu) {
    println("Menu: ${menu.name}")
    menu.items.forEach { println("  Item: ${it.name}") }
}

// 使用 DSL
fun main() {
    // 创建菜单
    val mainMenu = menu("Main Menu") {
        // 向菜单添加项
        item("Home")
        item("Settings")
        item("Exit")
    }

    // 打印菜单
    printMenu(mainMenu)
    // Menu: Main Menu
    //   Item: Home
    //   Item: Settings
    //   Item: Exit
}
//sampleEnd
```
{kotlin-runnable="true" id="kotlin-intermediate-tour-lambda-expression-with-receiver-dsl"}

如你所见，使用带接收者的 lambda 表达式大大简化了创建菜单所需的代码。Lambda 表达式不仅适用于设置和创建，还适用于配置。它们通常用于为 API、UI 框架和配置构建器构建 DSL，以生成流线型代码，使你能够更轻松地专注于底层代码结构和逻辑。

Kotlin 生态系统中有很多这种设计模式的示例，例如标准库中的 [`buildList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-list.html) 和 [`buildString()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/build-string.html) 函数。

> 在 Kotlin 中，带接收者的 lambda 表达式可以与**类型安全构建器**相结合，以创建在编译时而非运行时检测类型问题的 DSL。要了解更多信息，请参阅[类型安全构建器](type-safe-builders.md)。
>
{style="tip"}

## 练习 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="使用带接收者的 lambda 表达式处理数据" id="lambda-receivers-exercise-1">

你有一个接受带接收者的 lambda 表达式的 `fetchData()` 函数。更新 lambda 表达式以使用 `append()` 函数，使你的代码输出为：`Data received - Processed`。

```kotlin
fun fetchData(callback: StringBuilder.() -> Unit) {
    val builder = StringBuilder("Data received")
    builder.callback()
}

fun main() {
    fetchData {
        // 在此处编写你的代码
        // Data received - Processed
    }
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/FetchDataTest.kt" validate="false" id="kotlin-tour-lambda-receivers-exercise-1"}

```kotlin
fun fetchData(callback: StringBuilder.() -> Unit) {
    val builder = StringBuilder("Data received")
    builder.callback()
}

fun main() {
    fetchData {
        append(" - Processed")
        println(this.toString())
        // Data received - Processed
    }
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/FetchDataTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-lambda-receivers-solution-1"}

</def>
<def title="处理双击事件" id="lambda-receivers-exercise-2">

你拥有一个 `Button` 类以及 `ButtonEvent` 和 `Position` 数据类。编写代码触发 `Button` 类的 `onEvent()` 成员函数以触发双击事件。你的代码应输出 `"Double click!"`。

```kotlin
class Button {
    fun onEvent(action: ButtonEvent.() -> Unit) {
        // 模拟双击事件（非右键点击）
        val event = ButtonEvent(isRightClick = false, amount = 2, position = Position(100, 200))
        event.action() // 触发事件回调
    }
}

data class ButtonEvent(
    val isRightClick: Boolean,
    val amount: Int,
    val position: Position
)

data class Position(
    val x: Int,
    val y: Int
)

fun main() {
    val button = Button()

    button.onEvent {
        // 在此处编写你的代码
        // Double click!
    }
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/ButtonEventTest.kt" validate="false" id="kotlin-tour-lambda-receivers-exercise-2"}

```kotlin
class Button {
    fun onEvent(action: ButtonEvent.() -> Unit) {
        // 模拟双击事件（非右键点击）
        val event = ButtonEvent(isRightClick = false, amount = 2, position = Position(100, 200))
        event.action() // 触发事件回调
    }
}

data class ButtonEvent(
    val isRightClick: Boolean,
    val amount: Int,
    val position: Position
)

data class Position(
    val x: Int,
    val y: Int
)

fun main() {
    val button = Button()
    
    button.onEvent {
        if (!isRightClick && amount == 2) {
            println("Double click!")
            // Double click!
        }
    }
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/ButtonEventTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-lambda-receivers-solution-2"}

</def>
<def title="创建递增列表" id="lambda-receivers-exercise-3">

编写一个函数，创建整数列表的副本，其中每个元素递增 1。使用提供的函数框架，该框架通过 `incremented` 函数扩展了 `List<Int>`。

```kotlin
fun List<Int>.incremented(): List<Int> {
    val originalList = this
    return buildList {
        // 在此处编写你的代码
    }
}

fun main() {
    val originalList = listOf(1, 2, 3)
    val newList = originalList.incremented()
    println(newList)
    // [2, 3, 4]
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/IncrementedTest.kt" validate="false" id="kotlin-tour-lambda-receivers-exercise-3"}

```kotlin
fun List<Int>.incremented(): List<Int> {
    val originalList = this
    return buildList {
        for (n in originalList) add(n + 1)
    }
}

fun main() {
    val originalList = listOf(1, 2, 3)
    val newList = originalList.incremented()
    println(newList)
    // [2, 3, 4]
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/IncrementedTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-lambda-receivers-solution-3"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-scope-functions.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-classes-interfaces.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>