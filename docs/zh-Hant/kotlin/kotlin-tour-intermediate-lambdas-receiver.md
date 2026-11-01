[//]: # (title: 帶接收者的 Lambda 運算式)

<no-index/>

在本章中，你將學習如何將接收者與另一種類型的函式——Lambda 運算式結合使用，以及它們如何協助你建立領域特定語言。

## 帶接收者的 Lambda 運算式 {id="lambda-expressions-with-receiver"}

在初學者導覽中，你已經學習了如何使用 [Lambda 運算式](kotlin-tour-functions.md#lambda-expressions)。Lambda 運算式也可以具有接收者。
在這種情況下，Lambda 運算式可以存取接收者的任何成員函數或屬性，而無需每次都明確指定接收者。沒有了這些額外的參照，你的程式碼將更容易閱讀與維護。

> 帶接收者的 Lambda 運算式也稱為帶接收者的函式常值。
>
{style="tip"}

定義函式型別時，帶接收者的 Lambda 運算式語法會有所不同。首先，寫下你想要擴充的接收者。接著加上一個 `.`，然後完成函式型別定義的其餘部分。例如：

```kotlin
MutableList<Int>.() -> Unit
```

此函式型別具有：

* 以 `MutableList<Int>` 作為接收者。
* 圓括號 `()` 內沒有函式參數。
* 無傳回值：`Unit`。

參考以下在畫布上繪製形狀的範例：

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
{kotlin-runnable="true" id="kotlin-intermediate-tour-lambda-expression-with-receiver"}

在此範例中：

* `Canvas` 類別具有兩個模擬繪製圓形或正方形的函式。
* `render()` 函式接受一個 `block` 參數，並傳回 `Canvas` 類別的執行個體。
* `block` 參數是一個帶接收者的 Lambda 運算式，其中 `Canvas` 類別為接收者。
* `render()` 函式建立 `Canvas` 類別的執行個體，並在 `canvas` 執行個體上呼叫 `block()` Lambda 運算式，將其作為接收者使用。
* `main()` 函式使用傳遞給 `block` 參數的 Lambda 運算式來呼叫 `render()` 函式。
* 在傳遞給 `render()` 函式的 Lambda 內部，程式在 `Canvas` 類別的執行個體上呼叫 `drawCircle()` 和 `drawSquare()` 函式。

  由於 `drawCircle()` 和 `drawSquare()` 函式是在帶接收者的 Lambda 運算式中呼叫的，因此可以直接呼叫它們，就如同它們位於 `Canvas` 類別內部一樣。

當你想建立領域特定語言 (DSL) 時，帶接收者的 Lambda 運算式非常實用。由於你可以在沒有明確參照接收者的情況下存取接收者的成員函數與屬性，程式碼會變得更加精簡。

為了示範這一點，請參考一個在選單中設定項目的範例。首先建立一個 `MenuItem` 類別，以及一個包含名為 `item()` 的函式（用於向選單新增項目）和所有選單項目清單 `items` 的 `Menu` 類別：

```kotlin
class MenuItem(val name: String)

class Menu(val name: String) {
    val items = mutableListOf<MenuItem>()

    fun item(name: String) {
        items.add(MenuItem(name))
    }
}
```

我們以此為起點，將一個帶接收者的 Lambda 運算式作為函式參數 (`init`) 傳遞給用來建構選單的 `menu()` 函式：

```kotlin
fun menu(name: String, init: Menu.() -> Unit): Menu {
    // 建立 Menu 類別的執行個體
    val menu = Menu(name)
    // 在該類別執行個體上呼叫帶接收者的 Lambda 運算式 init()
    menu.init()
    return menu
}
```

現在你可以使用該 DSL 來設定選單，並建立一個 `printMenu()` 函式將選單結構輸出至主控台：

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
    // 建立選單
    val mainMenu = menu("Main Menu") {
        // 向選單新增項目
        item("Home")
        item("Settings")
        item("Exit")
    }

    // 列印選單
    printMenu(mainMenu)
    // Menu: Main Menu
    //   Item: Home
    //   Item: Settings
    //   Item: Exit
}
//sampleEnd
```
{kotlin-runnable="true" id="kotlin-intermediate-tour-lambda-expression-with-receiver-dsl"}

如你所見，使用帶接收者的 Lambda 運算式大幅簡化了建立選單所需的程式碼。Lambda 運算式不僅適用於設定與建立，也適用於組態配置。它們常被用於為 API、UI 架構與組態建構器建立 DSL，以產出流暢精煉的程式碼，讓你能夠更輕鬆地專注於底層程式碼結構與邏輯。

Kotlin 生態系統中有許多此設計模式的範例，例如標準函式庫中的 [`buildList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-list.html) 和 [`buildString()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/build-string.html) 函式。

> 帶接收者的 Lambda 運算式可以與 Kotlin 中的**型別安全建構器** (type-safe builders) 結合使用，以製作能夠在編譯期而非執行階段偵測任何型別問題的 DSL。若要了解更多，請參閱[型別安全建構器](type-safe-builders.md)。
>
{style="tip"}

## 練習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="使用帶接收者的 Lambda 運算式處理資料" id="lambda-receivers-exercise-1">

你擁有一個接受帶接收者的 Lambda 運算式的 `fetchData()` 函式。請更新該 Lambda 運算式以使用 `append()` 函式，使程式碼的輸出為：`Data received - Processed`。

```kotlin
fun fetchData(callback: StringBuilder.() -> Unit) {
    val builder = StringBuilder("Data received")
    builder.callback()
}

fun main() {
    fetchData {
        // 在此處編寫你的程式碼
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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/FetchDataTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution" id="kotlin-tour-lambda-receivers-solution-1"}

</def>
<def title="處理按兩下事件" id="lambda-receivers-exercise-2">

你有一個 `Button` 類別，以及 `ButtonEvent` 和 `Position` 資料類別。請撰寫程式碼來觸發 `Button` 類別的 `onEvent()` 成員函數，以觸發按兩下事件。你的程式碼應列印出 `"Double click!"`。

```kotlin
class Button {
    fun onEvent(action: ButtonEvent.() -> Unit) {
        // 模擬按兩下事件（非按一下右鍵）
        val event = ButtonEvent(isRightClick = false, amount = 2, position = Position(100, 200))
        event.action() // 觸發事件回呼
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
        // 在此處編寫你的程式碼
        // Double click!
    }
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/ButtonEventTest.kt" validate="false" id="kotlin-tour-lambda-receivers-exercise-2"}

```kotlin
class Button {
    fun onEvent(action: ButtonEvent.() -> Unit) {
        // 模擬按兩下事件（非按一下右鍵）
        val event = ButtonEvent(isRightClick = false, amount = 2, position = Position(100, 200))
        event.action() // 觸發事件回呼
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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/ButtonEventTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution" id="kotlin-tour-lambda-receivers-solution-2"}

</def>
<def title="建立遞增清單" id="lambda-receivers-exercise-3">

撰寫一個函式來建立整數清單的複本，其中每個元素的值都遞增 1。請使用所提供的函式骨架，以 `incremented` 函式擴充 `List<Int>`。

```kotlin
fun List<Int>.incremented(): List<Int> {
    val originalList = this
    return buildList {
        // 在此處編寫你的程式碼
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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/IncrementedTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution" id="kotlin-tour-lambda-receivers-solution-3"}

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