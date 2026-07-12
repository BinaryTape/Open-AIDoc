[//]: # (title: 수신 객체가 있는 람다 식)

<no-index/>

이 장에서는 또 다른 유형의 함수인 람다 식에서 수신 객체(receiver)를 사용하는 방법과, 이를 통해 도메인 특화 언어(DSL)를 만드는 방법을 알아봅니다.

## 수신 객체가 있는 람다 식

초급 튜토리얼에서 [람다 식](kotlin-tour-functions.md#lambda-expressions)을 사용하는 방법을 배웠습니다. 람다 식은 수신 객체를 가질 수도 있습니다.
이 경우, 람다 식은 매번 수신 객체를 명시적으로 지정하지 않고도 수신 객체의 모든 멤버 함수나 프로퍼티에 접근할 수 있습니다. 이러한 추가적인 참조가 없으면 코드를 읽고 유지보수하기가 더 쉬워집니다.

> 수신 객체가 있는 람다 식은 수신 객체 지정 함수 리터럴(function literals with receiver)이라고도 합니다.
>
{style="tip"}

수신 객체가 있는 람다 식의 구문은 함수 타입을 정의할 때 다릅니다. 먼저 확장하려는 수신 객체를 작성합니다. 그 다음 `.`을 찍고 나머지 함수 타입 정의를 완료합니다. 예를 들면 다음과 같습니다:

```kotlin
MutableList<Int>.() -> Unit
```

이 함수 타입은 다음과 같은 특징을 가집니다:

* `MutableList<Int>`가 수신 객체입니다.
* 괄호 `()` 안에 함수 파라미터가 없습니다.
* 반환 값이 없습니다: `Unit`.

캔버스에 도형을 그리는 다음 예제를 살펴보세요:

```kotlin
class Canvas {
    fun drawCircle() = println("🟠 Drawing a circle")
    fun drawSquare() = println("🟥 Drawing a square")
}

// 수신 객체가 있는 람다 식 정의
fun render(block: Canvas.() -> Unit): Canvas {
    val canvas = Canvas()
    // 수신 객체가 있는 람다 식 사용
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

이 예제에서:

* `Canvas` 클래스에는 원이나 사각형을 그리는 것을 시뮬레이션하는 두 개의 함수가 있습니다.
* `render()` 함수는 `block` 파라미터를 받고 `Canvas` 클래스의 인스턴스를 반환합니다.
* `block` 파라미터는 `Canvas` 클래스가 수신 객체인 수신 객체가 있는 람다 식입니다.
* `render()` 함수는 `Canvas` 클래스의 인스턴스를 생성하고, 이 `canvas` 인스턴스를 수신 객체로 사용하여 `block()` 람다 식을 호출합니다.
* `main()` 함수는 람다 식과 함께 `render()` 함수를 호출하며, 이 람다 식은 `block` 파라미터로 전달됩니다.
* `render()` 함수에 전달된 람다 내부에서 프로그램은 `Canvas` 클래스의 인스턴스에 대해 `drawCircle()` 및 `drawSquare()` 함수를 호출합니다.

  `drawCircle()`과 `drawSquare()` 함수가 수신 객체가 있는 람다 식 내에서 호출되기 때문에, 마치 `Canvas` 클래스 내부에 있는 것처럼 직접 호출할 수 있습니다.

수신 객체가 있는 람다 식은 도메인 특화 언어(DSL)를 만들 때 유용합니다. 수신 객체를 명시적으로 참조하지 않고도 수신 객체의 멤버 함수와 프로퍼티에 접근할 수 있으므로 코드가 더 간결해집니다.

이를 보여주기 위해 메뉴의 항목을 구성하는 예제를 살펴보겠습니다. 먼저 `MenuItem` 클래스와, 메뉴에 항목을 추가하는 `item()` 함수 및 모든 메뉴 항목의 리스트인 `items`를 포함하는 `Menu` 클래스로 시작합니다:

```kotlin
class MenuItem(val name: String)

class Menu(val name: String) {
    val items = mutableListOf<MenuItem>()

    fun item(name: String) {
        items.add(MenuItem(name))
    }
}
```

메뉴를 빌드하는 시작점으로, `menu()` 함수에 함수 파라미터(`init`)로 전달된 수신 객체가 있는 람다 식을 사용해 보겠습니다:

```kotlin
fun menu(name: String, init: Menu.() -> Unit): Menu {
    // Menu 클래스의 인스턴스 생성
    val menu = Menu(name)
    // 클래스 인스턴스에서 수신 객체가 있는 람다 식 init() 호출
    menu.init()
    return menu
}
```

이제 DSL을 사용하여 메뉴를 구성하고, 메뉴 구조를 콘솔에 출력하는 `printMenu()` 함수를 만들 수 있습니다:

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

// DSL 사용
fun main() {
    // 메뉴 생성
    val mainMenu = menu("Main Menu") {
        // 메뉴에 항목 추가
        item("Home")
        item("Settings")
        item("Exit")
    }

    // 메뉴 출력
    printMenu(mainMenu)
    // Menu: Main Menu
    //   Item: Home
    //   Item: Settings
    //   Item: Exit
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-intermediate-tour-lambda-expression-with-receiver-dsl"}

보시다시피, 수신 객체가 있는 람다 식을 사용하면 메뉴를 생성하는 데 필요한 코드가 크게 단순해집니다. 람다 식은 설정과 생성뿐만 아니라 구성(configuration)에도 유용합니다. 이들은 API, UI 프레임워크, 구성 빌더를 위한 DSL을 구축할 때 흔히 사용되어 코드를 능률적으로 만들고, 기저의 코드 구조와 로직에 더 쉽게 집중할 수 있게 해줍니다.

코틀린 생태계에는 표준 라이브러리의 [`buildList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-list.html) 및 [`buildString()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/build-string.html) 함수와 같이 이러한 디자인 패턴의 많은 예가 있습니다.

> 수신 객체가 있는 람다 식은 코틀린의 **타입 안전 빌더(type-safe builders)**와 결합하여 실행 시점이 아닌 컴파일 시점에 타입 관련 문제를 감지하는 DSL을 만들 수 있습니다. 더 자세히 알아보려면 [타입 안전 빌더](type-safe-builders.md)를 참고하세요.
>
{style="tip"}

## 연습 문제 {completion-point="true"}

### 연습 문제 1 {initial-collapse-state="collapsed" collapsible="true" id="lambda-receivers-exercise-1"}

수신 객체가 있는 람다 식을 인자로 받는 `fetchData()` 함수가 있습니다. 코드의 출력이 `Data received - Processed`가 되도록 `append()` 함수를 사용해 람다 식을 업데이트하세요.

|---|---|
```kotlin
fun fetchData(callback: StringBuilder.() -> Unit) {
    val builder = StringBuilder("Data received")
    builder.callback()
}

fun main() {
    fetchData {
        // 여기에 코드를 작성하세요
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="예시 답안" id="kotlin-tour-lambda-receivers-solution-1"}

### 연습 문제 2 {initial-collapse-state="collapsed" collapsible="true" id="lambda-receivers-exercise-2"}

`Button` 클래스와 `ButtonEvent`, `Position` 데이터 클래스가 있습니다. `Button` 클래스의 `onEvent()` 멤버 함수를 호출하여 더블 클릭 이벤트를 트리거하는 코드를 작성하세요. 코드는 `"Double click!"`을 출력해야 합니다.

```kotlin
class Button {
    fun onEvent(action: ButtonEvent.() -> Unit) {
        // 더블 클릭 이벤트 시뮬레이션 (우클릭 아님)
        val event = ButtonEvent(isRightClick = false, amount = 2, position = Position(100, 200))
        event.action() // 이벤트 콜백 트리거
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
        // 여기에 코드를 작성하세요
        // Double click!
    }
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-receivers-exercise-2"}

|---|---|
```kotlin
class Button {
    fun onEvent(action: ButtonEvent.() -> Unit) {
        // 더블 클릭 이벤트 시뮬레이션 (우클릭 아님)
        val event = ButtonEvent(isRightClick = false, amount = 2, position = Position(100, 200))
        event.action() // 이벤트 콜백 트리거
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="예시 답안" id="kotlin-tour-lambda-receivers-solution-2"}

### 연습 문제 3 {initial-collapse-state="collapsed" collapsible="true" id="lambda-receivers-exercise-3"}

모든 요소가 1씩 증가된 정수 리스트의 복사본을 만드는 함수를 작성하세요. `List<Int>`를 `incremented` 함수로 확장하는 제공된 함수 스켈레톤을 사용하세요.

```kotlin
fun List<Int>.incremented(): List<Int> {
    val originalList = this
    return buildList {
        // 여기에 코드를 작성하세요
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="예시 답안" id="kotlin-tour-lambda-receivers-solution-3"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-scope-functions.md" mode="outline" icon="arrow-left" icon-position="left">이전 단계</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-classes-interfaces.md" mode="classic" icon="arrow-right" icon-position="right">다음 단계</a>
  </li>
</list>