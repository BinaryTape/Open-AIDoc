[//]: # (title: 中級：帶接收者的 Lambda 運算式)

<no-index/>

<tldr>
    <p><img src="icon-1-done.svg" width="20" alt="第一步" /> <a href="kotlin-tour-intermediate-extension-functions.md">擴充方法</a><br />
        <img src="icon-2-done.svg" width="20" alt="第二步" /> <a href="kotlin-tour-intermediate-scope-functions.md">作用域函式</a><br />
        <img src="icon-3.svg" width="20" alt="第三步" /> <strong>帶接收者的 Lambda 運算式</strong><br />
        <img src="icon-4-todo.svg" width="20" alt="第四步" /> <a href="kotlin-tour-intermediate-classes-interfaces.md">類別與介面</a><br />
        <img src="icon-5-todo.svg" width="20" alt="第五步" /> <a href="kotlin-tour-intermediate-objects.md">物件</a><br />
        <img src="icon-6-todo.svg" width="20" alt="第六步" /> <a href="kotlin-tour-intermediate-open-special-classes.md">Open 與特殊類別</a><br />
        <img src="icon-7-todo.svg" width="20" alt="第七步" /> <a href="kotlin-tour-intermediate-properties.md">屬性</a><br />
        <img src="icon-8-todo.svg" width="20" alt="第八步" /> <a href="kotlin-tour-intermediate-null-safety.md">Null 安全性</a><br />
        <img src="icon-9-todo.svg" width="20" alt="第九步" /> <a href="kotlin-tour-intermediate-libraries-and-apis.md">程式庫與 API</a></p>
</tldr>

在本章節中，您將學習如何將接收者與另一種函式類型——Lambda 運算式結合使用，以及它們如何幫助您建立領域特定語言 (DSL)。

## 帶接收者的 Lambda 運算式

在初級教學中，您已經學習了如何使用 [Lambda 運算式](kotlin-tour-functions.md#lambda-expressions)。Lambda 運算式也可以擁有一個接收者。
在這種情況下，Lambda 運算式可以存取接收者的任何成員函數或屬性，而無需在每次呼叫時都明確指定接收者。沒有了這些額外的參考，您的程式碼會更容易閱讀且更易於維護。

> 帶接收者的 Lambda 運算式也稱為帶接收者的函式常值。
>
{style="tip"}

定義函式型別時，帶接收者的 Lambda 運算式語法會有所不同。首先，寫下您想要擴充的接收者。接著加上一個 `.`，然後完成函式型別定義的其餘部分。例如：

```kotlin
MutableList<Int>.() -> Unit
```

此函式型別具有：

* `MutableList<Int>` 作為接收者。
* 圓括號 `()` 內沒有函式參數。
* 沒有傳回值：`Unit`。

請參考這個在畫布（Canvas）上繪製圖形的範例：

```kotlin
class Canvas {
    fun drawCircle() = println("🟠 Drawing a circle")
    fun drawSquare() = println("🟥 Drawing a square")
}

// 帶接收者的 Lambda 運算式定義
fun render(block: Canvas.() -> Unit): Canvas {
    val canvas = Canvas()
    // 使用帶接收者的 Lambda 運算式
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

在此範例中：

* `Canvas` 類別有兩個模擬繪製圓形或正方形的函式。
* `render()` 函式接收一個 `block` 參數並回傳一個 `Canvas` 類別的執行個體。
* `block` 參數是一個帶接收者的 Lambda 運算式，其中 `Canvas` 類別是接收者。
* `render()` 函式建立一個 `Canvas` 類別的執行個體，並在該 `canvas` 執行個體上呼叫 `block()` Lambda 運算式，將其作為接收者。
* `main()` 函式呼叫 `render()` 函式並傳入一個 Lambda 運算式，該運算式被傳遞給 `block` 參數。
* 在傳遞給 `render()` 函式的 Lambda 內部，程式在 `Canvas` 類別的執行個體上呼叫 `drawCircle()` 和 `drawSquare()` 函式。

  由於 `drawCircle()` 和 `drawSquare()` 是在帶接收者的 Lambda 運算式中呼叫的，因此可以直接呼叫它們，就像它們位於 `Canvas` 類別內部一樣。

當您想要建立領域特定語言 (DSL) 時，帶接收者的 Lambda 運算式非常有用。由於您可以存取接收者的成員函數和屬性而無需明確參考接收者，您的程式碼會變得更加精簡。

為了演示這一點，請參考一個配置菜單項目的範例。我們從一個 `MenuItem` 類別和一個 `Menu` 類別開始，`Menu` 類別包含一個用於向菜單添加項目的函式 `item()`，以及一個包含所有菜單項目的清單 `items`：

```kotlin
class MenuItem(val name: String)

class Menu(val name: String) {
    val items = mutableListOf<MenuItem>()

    fun item(name: String) {
        items.add(MenuItem(name))
    }
}
```

我們使用傳遞給 `menu()` 函式的帶接收者的 Lambda 運算式作為函式參數 (`init`)，以此作為建立菜單的起點：

```kotlin
fun menu(name: String, init: Menu.() -> Unit): Menu {
    // 建立 Menu 類別的執行個體
    val menu = Menu(name)
    // 在類別執行個體上呼叫帶接收者的 Lambda 運算式 init()
    menu.init()
    return menu
}
```

現在您可以使用 DSL 來配置菜單，並建立一個 `printMenu()` 函式將菜單結構列印到主控台：

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
    // 建立菜單
    val mainMenu = menu("Main Menu") {
        // 向菜單添加項目
        item("Home")
        item("Settings")
        item("Exit")
    }

    // 列印菜單
    printMenu(mainMenu)
    // Menu: Main Menu
    //   Item: Home
    //   Item: Settings
    //   Item: Exit
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-intermediate-tour-lambda-expression-with-receiver-dsl"}

如您所見，使用帶接收者的 Lambda 運算式大大簡化了建立菜單所需的程式碼。Lambda 運算式不僅對於設定和建立很有用，對於配置也很有幫助。它們常用於建置 API、UI 架構和配置建置器（configuration builder）的 DSL，以產出流暢的程式碼，讓您能更輕鬆地專注於底層的程式碼結構與邏輯。

Kotlin 生態系統中有許多此設計模式的範例，例如標準函式庫中的 [`buildList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-list.html) 和 [`buildString()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/build-string.html) 函式。

> 帶接收者的 Lambda 運算式可以與 Kotlin 中的 **型別安全建置器** 結合使用，以建立能在編譯期（而非執行期）偵測任何型別問題的 DSL。若要了解更多，請參閱[型別安全建置器](type-safe-builders.md)。
>
{style="tip"}

## 練習

### 練習 1 {initial-collapse-state="collapsed" collapsible="true" id="lambda-receivers-exercise-1"}

您有一個接收帶接收者 Lambda 運算式的 `fetchData()` 函式。請更新該 Lambda 運算式以使用 `append()` 函式，使程式碼的輸出為：`Data received - Processed`。

|---|---|
```kotlin
fun fetchData(callback: StringBuilder.() -> Unit) {
    val builder = StringBuilder("Data received")
    builder.callback()
}

fun main() {
    fetchData {
        // 在此編寫您的程式碼
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-lambda-receivers-solution-1"}

### 練習 2 {initial-collapse-state="collapsed" collapsible="true" id="lambda-receivers-exercise-2"}

您有一個 `Button` 類別以及 `ButtonEvent` 和 `Position` 資料類別。請編寫程式碼來觸發 `Button` 類別的 `onEvent()` 成員函數，以觸發一個按兩下事件。您的程式碼應列印出 `"Double click!"`。

```kotlin
class Button {
    fun onEvent(action: ButtonEvent.() -> Unit) {
        // 模擬按兩下事件（不是右鍵點擊）
        val event = ButtonEvent(isRightClick = false, amount = 2, position = Position(100, 200))
        event.action() // 觸發事件回調
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
        // 在此編寫您的程式碼
        // Double click!
    }
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-receivers-exercise-2"}

|---|---|
```kotlin
class Button {
    fun onEvent(action: ButtonEvent.() -> Unit) {
        // 模擬按兩下事件（不是右鍵點擊）
        val event = ButtonEvent(isRightClick = false, amount = 2, position = Position(100, 200))
        event.action() // 觸發事件回調
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-lambda-receivers-solution-2"}

### 練習 3 {initial-collapse-state="collapsed" collapsible="true" id="lambda-receivers-exercise-3"}

編寫一個函式，建立整數清單的副本，其中每個元素都增加 1。請使用提供的函式架構，該架構使用 `incremented` 函式擴充了 `List<Int>`。

```kotlin
fun List<Int>.incremented(): `List<Int>` {
    val originalList = this
    return buildList {
        // 在此編寫您的程式碼
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-lambda-receivers-solution-3"}

## 下一步

[中級：類別與介面](kotlin-tour-intermediate-classes-interfaces.md)