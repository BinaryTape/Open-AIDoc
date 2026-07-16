[//]: # (title: 中级：带接收者的 lambda 表达式)

<no-index/>

<tldr>
    <p><img src="icon-1-done.svg" width="20" alt="第一步" /> <a href="kotlin-tour-intermediate-extension-functions.md">扩展函数</a><br />
        <img src="icon-2-done.svg" width="20" alt="第二步" /> <a href="kotlin-tour-intermediate-scope-functions.md">作用域函数</a><br />
        <img src="icon-3.svg" width="20" alt="第三步" /> <strong>带接收者的 lambda 表达式</strong><br />
        <img src="icon-4-todo.svg" width="20" alt="第四步" /> <a href="kotlin-tour-intermediate-classes-interfaces.md">类与接口</a><br />
        <img src="icon-5-todo.svg" width="20" alt="第五步" /> <a href="kotlin-tour-intermediate-objects.md">对象</a><br />
        <img src="icon-6-todo.svg" width="20" alt="第六步" /> <a href="kotlin-tour-intermediate-open-special-classes.md">Open 类与特殊类</a><br />
        <img src="icon-7-todo.svg" width="20" alt="第七步" /> <a href="kotlin-tour-intermediate-properties.md">属性</a><br />
        <img src="icon-8-todo.svg" width="20" alt="第八步" /> <a href="kotlin-tour-intermediate-null-safety.md">空安全</a><br />
        <img src="icon-9-todo.svg" width="20" alt="第九步" /> <a href="kotlin-tour-intermediate-libraries-and-apis.md">库与 API</a></p>
</tldr>

在本章中，你将学习如何将接收者与其他类型的函数（即 lambda 表达式）结合使用，以及它们如何帮助你创建领域专用语言 (DSL)。

## 带接收者的 lambda 表达式

在初学者教程中，你学习了如何使用 [lambda 表达式](kotlin-tour-functions.md#lambda-expressions)。Lambda 表达式也可以拥有接收者。
在这种情况下，lambda 表达式可以访问接收者的任何成员函数或属性，而无需每次都显式指定接收者。由于没有这些额外的引用，你的代码将更易于阅读和维护。

> 带接收者的 lambda 表达式也称为带接收者的函数字面量。
>
{style="tip"}

在定义函数类型时，带接收者的 lambda 表达式的语法有所不同。首先，编写你想要扩展的接收者。接着，输入一个 `.`，然后完成函数类型定义的其余部分。例如：

```kotlin
MutableList<Int>.() -> Unit
```

此函数类型具有：

*   作为接收者的 `MutableList<Int>`。
*   圆括号 `()` 内没有函数参数。
*   没有返回值：`Unit`。

考虑这个在画布上绘制形状的示例：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-intermediate-tour-lambda-expression-with-receiver"}

在此示例中：

*   `Canvas` 类有两个模拟绘制圆形或正方形的函数。
*   `render()` 函数接受一个 `block` 参数，并返回 `Canvas` 类的一个实例。
*   `block` 参数是一个带接收者的 lambda 表达式，其中 `Canvas` 类是接收者。
*   `render()` 函数创建 `Canvas` 类的一个实例，并在 `canvas` 实例上调用 `block()` lambda 表达式，将其作为接收者。
*   `main()` 函数使用一个传递给 `block` 参数的 lambda 表达式来调用 `render()` 函数。
*   在传递给 `render()` 函数的 lambda 内部，程序在 `Canvas` 类的实例上调用 `drawCircle()` 和 `drawSquare()` 函数。

    由于 `drawCircle()` 和 `drawSquare()` 函数是在带接收者的 lambda 表达式中调用的，因此可以直接调用它们，就像它们位于 `Canvas` 类内部一样。

带接收者的 lambda 表达式在你想创建领域专用语言 (DSL) 时非常有用。由于你可以在不显式引用接收者的情况下访问其成员函数和属性，因此你的代码会变得更加精简。

为了演示这一点，考虑一个配置菜单项的示例。让我们从一个 `MenuItem` 类和一个 `Menu` 类开始，`Menu` 类包含一个用于向菜单添加项的 `item()` 函数，以及所有菜单项的列表 `items`：

```kotlin
class MenuItem(val name: String)

class Menu(val name: String) {
    val items = mutableListOf<MenuItem>()

    fun item(name: String) {
        items.add(MenuItem(name))
    }
}
```

让我们使用作为函数参数 (`init`) 传递给 `menu()` 函数的带接收者的 lambda 表达式，以此作为构建菜单的起点：

```kotlin
fun menu(name: String, init: Menu.() -> Unit): Menu {
    // 创建 Menu 类的实例
    val menu = Menu(name)
    // 在类实例上调用带接收者的 lambda 表达式 init()
    menu.init()
    return menu
}
```

现在，你可以使用 DSL 来配置菜单，并创建一个 `printMenu()` 函数以将菜单结构打印到控制台：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-intermediate-tour-lambda-expression-with-receiver-dsl"}

如你所见，使用带接收者的 lambda 表达式极大地简化了创建菜单所需的代码。Lambda 表达式不仅在设置和创建时有用，在配置时也非常有用。它们通常用于为 API、UI 框架和配置构建器构建 DSL，以生成精简的代码，让你能够更轻松地专注于底层的代码结构和逻辑。

Kotlin 生态系统中有许多此设计模式的示例，例如标准库中的 [`buildList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-list.html) 和 [`buildString()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/build-string.html) 函数。

> 带接收者的 lambda 表达式可以与 Kotlin 中的**类型安全构建器**结合使用，以创建能在编译时而非运行时检测类型问题的 DSL。要了解更多信息，请参阅[类型安全构建器](type-safe-builders.md)。
>
{style="tip"}

## 练习

### 练习 1 {initial-collapse-state="collapsed" collapsible="true" id="lambda-receivers-exercise-1"}

你有一个接受带接收者的 lambda 表达式的 `fetchData()` 函数。更新该 lambda 表达式以使用 `append()` 函数，使代码的输出为：`Data received - Processed`。

|---|---|
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
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-receivers-exercise-1"}

|---|---|
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-lambda-receivers-solution-1"}

### 练习 2 {initial-collapse-state="collapsed" collapsible="true" id="lambda-receivers-exercise-2"}

你有一个 `Button` 类以及 `ButtonEvent` 和 `Position` 数据类。编写代码触发 `Button` 类的 `onEvent()` 成员函数，以触发双击事件。你的代码应打印 `"Double click!"`。

```kotlin
class Button {
    fun onEvent(action: ButtonEvent.() -> Unit) {
        // 模拟双击事件（不是右键点击）
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
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-receivers-exercise-2"}

|---|---|
```kotlin
class Button {
    fun onEvent(action: ButtonEvent.() -> Unit) {
        // 模拟双击事件（不是右键点击）
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-lambda-receivers-solution-2"}

### 练习 3 {initial-collapse-state="collapsed" collapsible="true" id="lambda-receivers-exercise-3"}

编写一个函数，创建一个整数列表的副本，其中每个元素都增加 1。使用提供的函数骨架，通过 `incremented` 函数扩展 `List<Int>`。

```kotlin
fun List<Int>.incremented(): `List<Int>` {
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
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-receivers-exercise-3"}

|---|---|
```kotlin
fun List<Int>.incremented(): `List<Int>` {
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-lambda-receivers-solution-3"}

## 下一步

[中级：类与接口](kotlin-tour-intermediate-classes-interfaces.md)