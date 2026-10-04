[//]: # (title: レシーバー付きラムダ式)

<no-index/>

この章では、別の種類の関数であるラムダ式でレシーバーを使用する方法と、それがドメイン固有言語（DSL: Domain-Specific Language）の作成にどのように役立つかを学びます。

## レシーバー付きラムダ式 {id="lambda-expressions-with-receiver"}

入門ツアーでは、[ラムダ式](kotlin-tour-functions.md#lambda-expressions)の使い方を学びました。ラムダ式にはレシーバーを持たせることもできます。
この場合、ラムダ式はその都度明示的にレシーバーを指定することなく、レシーバーのメンバー関数やプロパティにアクセスできます。これらの余分な参照を省くことで、コードが読みやすく、保守しやすくなります。

> レシーバー付きラムダ式は、レシーバー付き関数リテラル（function literals with receiver）とも呼ばれます。
>
{style="tip"}

レシーバー付きラムダ式の構文は、関数型を定義する際に異なります。まず、拡張したいレシーバーを記述します。次に `.` を置き、その後に通常の関数型定義を記述します。たとえば、以下のようになります。

```kotlin
MutableList<Int>.() -> Unit
```

この関数型は以下を持っています。

* レシーバーとしての `MutableList<Int>`
* 丸括弧 `()` 内に関数パラメーターなし
* 戻り値なし: `Unit`

キャンバスに図形を描画する以下の例を考えてみましょう。

```kotlin
class Canvas {
    fun drawCircle() = println("🟠 Drawing a circle")
    fun drawSquare() = println("🟥 Drawing a square")
}

// レシーバー付きラムダ式の定義
fun render(block: Canvas.() -> Unit): Canvas {
    val canvas = Canvas()
    // レシーバー付きラムダ式を使用
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

この例では以下のようになっています。

* `Canvas` クラスには、円や正方形の描画をシミュレートする2つの関数があります。
* `render()` 関数は `block` パラメーターを受け取り、`Canvas` クラスのインスタンスを返します。
* `block` パラメーターはレシーバー付きラムダ式であり、`Canvas` クラスがそのレシーバーです。
* `render()` 関数は `Canvas` クラスのインスタンスを作成し、その `canvas` インスタンスをレシーバーとして `block()` ラムダ式を呼び出します。
* `main()` 関数はラムダ式を渡して `render()` 関数を呼び出し、それが `block` パラメーターに渡されます。
* `render()` 関数に渡されたラムダの内部では、`Canvas` クラスのインスタンスに対して `drawCircle()` および `drawSquare()` 関数を呼び出しています。

  `drawCircle()` 関数と `drawSquare()` 関数はレシーバー付きラムダ式の中で呼び出されているため、まるで `Canvas` クラスの内部にいるかのように直接呼び出すことができます。

レシーバー付きラムダ式は、ドメイン固有言語（DSL）を作成したい場合に役立ちます。レシーバーを明示的に参照することなくレシーバーのメンバー関数やプロパティにアクセスできるため、コードをよりシンプルで簡潔にできます。

これを説明するために、メニュー内の項目を設定する例を考えてみましょう。まず、`MenuItem` クラスと、メニューに項目を追加する `item()` 関数およびすべてのメニュー項目のリスト `items` を持つ `Menu` クラスから始めます。

```kotlin
class MenuItem(val name: String)

class Menu(val name: String) {
    val items = mutableListOf<MenuItem>()

    fun item(name: String) {
        items.add(MenuItem(name))
    }
}
```

まずはメニューを構築する `menu()` 関数に、関数パラメーター（`init`）として渡されるレシーバー付きラムダ式を使用してみましょう。

```kotlin
fun menu(name: String, init: Menu.() -> Unit): Menu {
    // Menu クラスのインスタンスを作成
    val menu = Menu(name)
    // クラスインスタンスに対してレシーバー付きラムダ式 init() を呼び出す
    menu.init()
    return menu
}
```

これで、DSL を使用してメニューを設定できるようになり、メニュー構造をコンソールに出力する `printMenu()` 関数も作成できます。

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

// DSL を使用
fun main() {
    // メニューを作成
    val mainMenu = menu("Main Menu") {
        // メニューに項目を追加
        item("Home")
        item("Settings")
        item("Exit")
    }

    // メニューを出力
    printMenu(mainMenu)
    // Menu: Main Menu
    //   Item: Home
    //   Item: Settings
    //   Item: Exit
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-intermediate-tour-lambda-expression-with-receiver-dsl"}

ご覧の通り、レシーバー付きラムダ式を使用することで、メニューの作成に必要なコードが大幅にシンプルになります。ラムダ式はセットアップや作成だけでなく、設定にも便利です。API、UIフレームワーク、設定ビルダー向けの DSL 構築によく使用され、洗練されたコードを作成して、基盤となるコード構造やロジックにより集中しやすくすることができます。

Kotlin のエコシステムには、標準ライブラリの [`buildList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-list.html) や [`buildString()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/build-string.html) 関数など、このデザインパターンの例が数多く存在します。

> レシーバー付きラムダ式を Kotlin の**タイプセーフビルダー**と組み合わせることで、実行時ではなくコンパイル時に型の問題を検出できる DSL を作成できます。詳細については、[タイプセーフビルダー](type-safe-builders.md)を参照してください。
>
{style="tip"}

## 演習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="レシーバー付きラムダ式でデータを処理する" id="lambda-receivers-exercise-1">

レシーバー付きラムダ式を受け取る `fetchData()` 関数があります。コードの出力が `Data received - Processed` となるように、`append()` 関数を使用するようラムダ式を更新してください。

```kotlin
fun fetchData(callback: StringBuilder.() -> Unit) {
    val builder = StringBuilder("Data received")
    builder.callback()
}

fun main() {
    fetchData {
        // ここにコードを記述してください
        // Data received - Processed
    }
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-receivers-exercise-1"}

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-lambda-receivers-solution-1"}

</def>
<def title="ダブルクリックイベントを処理する" id="lambda-receivers-exercise-2">

`Button` クラスと、`ButtonEvent` および `Position` データクラスがあります。ダブルクリックイベントをトリガーするために、`Button` クラスの `onEvent()` メンバー関数を呼び出すコードを記述してください。コードは `"Double click!"` と出力する必要があります。

```kotlin
class Button {
    fun onEvent(action: ButtonEvent.() -> Unit) {
        // ダブルクリックイベントをシミュレート（右クリックではない）
        val event = ButtonEvent(isRightClick = false, amount = 2, position = Position(100, 200))
        event.action() // イベントコールバックをトリガー
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
        // ここにコードを記述してください
        // Double click!
    }
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-receivers-exercise-2"}

```kotlin
class Button {
    fun onEvent(action: ButtonEvent.() -> Unit) {
        // ダブルクリックイベントをシミュレート（右クリックではない）
        val event = ButtonEvent(isRightClick = false, amount = 2, position = Position(100, 200))
        event.action() // イベントコールバックをトリガー
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-lambda-receivers-solution-2"}

</def>
<def title="要素をインクリメントしたリストを作成する" id="lambda-receivers-exercise-3">

整数のリストのコピーを作成し、各要素が 1 ずつインクリメントされたリストを作成する関数を記述してください。`List<Int>` を `incremented` 関数で拡張する提供された関数の骨組みを使用してください。

```kotlin
fun List<Int>.incremented(): List<Int> {
    val originalList = this
    return buildList {
        // ここにコードを記述してください
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-lambda-receivers-solution-3"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-scope-functions.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-classes-interfaces.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>