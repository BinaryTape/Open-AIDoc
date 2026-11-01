[//]: # (title: レシーバー付きラムダ式)

<no-index/>

この章では、別の種類の関数であるラムダ式でレシーバーを使用する方法と、それがドメイン固有言語（DSL）の作成にどのように役立つかを学びます。

## レシーバー付きラムダ式 {id="lambda-expressions-with-receiver"}

入門ツアーでは、[ラムダ式](kotlin-tour-functions.md#lambda-expressions)の使い方を学びました。ラムダ式はレシーバーを持つこともできます。
この場合、ラムダ式は毎回明示的にレシーバーを指定することなく、レシーバーのメンバー関数やプロパティにアクセスできます。これらの追加の参照が不要になるため、コードが読みやすく保守しやすくなります。

> レシーバー付きラムダ式は、レシーバー付き関数リテラル（function literals with receiver）とも呼ばれます。
>
{style="tip"}

レシーバー付きラムダ式の構文は、関数型を定義する際に異なります。まず、拡張したいレシーバーを記述します。次に `.` を置き、その後に残りの関数型定義を記述します。例えば以下のようになります：

```kotlin
MutableList<Int>.() -> Unit
```

この関数型は以下を持っています：

* レシーバーとしての `MutableList<Int>`。
* カッコ `()` 内に関数パラメータなし。
* 戻り値なし：`Unit`。

キャンバスに図形を描画する以下の例を考えてみましょう：

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
{kotlin-runnable="true" id="kotlin-intermediate-tour-lambda-expression-with-receiver"}

この例では：

* `Canvas` クラスには、円や正方形の描画をシミュレートする2つの関数があります。
* `render()` 関数は `block` パラメータを受け取り、`Canvas` クラスのインスタンスを返します。
* `block` パラメータはレシーバー付きラムダ式であり、`Canvas` クラスがそのレシーバーです。
* `render()` 関数は `Canvas` クラスのインスタンスを作成し、その `canvas` インスタンスをレシーバーとして `block()` ラムダ式を呼び出します。
* `main()` 関数はラムダ式を渡して `render()` 関数を呼び出し、それが `block` パラメータに渡されます。
* `render()` 関数に渡されたラムダの内部では、プログラムは `Canvas` クラスのインスタンス上で `drawCircle()` 関数と `drawSquare()` 関数を呼び出します。

  `drawCircle()` および `drawSquare()` 関数はレシーバー付きラムダ式の中で呼び出されているため、まるで `Canvas` クラスの内部にいるかのように直接呼び出すことができます。

レシーバー付きラムダ式は、ドメイン固有言語（DSL）を作成したい場合に役立ちます。レシーバーを明示的に参照することなくレシーバーのメンバー関数やプロパティにアクセスできるため、コードがよりすっきりと簡潔になります。

これを示すために、メニュー内の項目を設定する例を考えてみましょう。まずは、`MenuItem` クラスと、メニューに項目を追加する `item()` 関数および全メニュー項目のリスト `items` を含む `Menu` クラスから始めます：

```kotlin
class MenuItem(val name: String)

class Menu(val name: String) {
    val items = mutableListOf<MenuItem>()

    fun item(name: String) {
        items.add(MenuItem(name))
    }
}
```

出発点として、メニューを構築する `menu()` 関数に関数パラメータ（`init`）として渡されるレシーバー付きラムダ式を使用してみましょう：

```kotlin
fun menu(name: String, init: Menu.() -> Unit): Menu {
    // Menu クラスのインスタンスを作成
    val menu = Menu(name)
    // クラスインスタンス上でレシーバー付きラムダ式 init() を呼び出す
    menu.init()
    return menu
}
```

これで、DSLを使用してメニューを設定し、メニュー構造をコンソールに出力する `printMenu()` 関数を作成できるようになりました：

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
{kotlin-runnable="true" id="kotlin-intermediate-tour-lambda-expression-with-receiver-dsl"}

ご覧のように、レシーバー付きラムダ式を使用すると、メニューの作成に必要なコードが大幅にシンプルになります。ラムダ式はセットアップや作成だけでなく、設定（コンフィギュレーション）にも役立ちます。API、UIフレームワーク、設定ビルダー向けのDSL構築でよく使われており、効率的で無駄のないコードを作成できるため、基本的なコード構造やロジックにより集中しやすくなります。

Kotlinのエコシステムには、標準ライブラリの [`buildList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-list.html) や [`buildString()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/build-string.html) 関数など、このデザインパターンの例が数多くあります。

> Kotlinでは、レシーバー付きラムダ式を**型安全ビルダー（type-safe builders）**と組み合わせることで、実行時ではなくコンパイル時に型に関する問題を検出できるDSLを作成できます。詳細については、[型安全ビルダー](type-safe-builders.md)を参照してください。
>
{style="tip"}

## 練習問題 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="レシーバー付きラムダ式でデータを処理する" id="lambda-receivers-exercise-1">

レシーバー付きラムダ式を受け取る `fetchData()` 関数があります。コードの出力が `Data received - Processed` になるように、ラムダ式を更新して `append()` 関数を使用してください。

```kotlin
fun fetchData(callback: StringBuilder.() -> Unit) {
    val builder = StringBuilder("Data received")
    builder.callback()
}

fun main() {
    fetchData {
        // ここにコードを書いてください
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
<def title="ダブルクリックイベントを処理する" id="lambda-receivers-exercise-2">

`Button` クラスと、`ButtonEvent` および `Position` データクラスがあります。`Button` クラスの `onEvent()` メンバー関数を実行してダブルクリックイベントをトリガーするコードを作成してください。コードは `"Double click!"` を出力する必要があります。

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
        // ここにコードを書いてください
        // Double click!
    }
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/ButtonEventTest.kt" validate="false" id="kotlin-tour-lambda-receivers-exercise-2"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/ButtonEventTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution" id="kotlin-tour-lambda-receivers-solution-2"}

</def>
<def title="インクリメントされたリストを作成する" id="lambda-receivers-exercise-3">

すべての要素が1ずつインクリメントされた整数のリストのコピーを作成する関数を作成してください。`List<Int>` を `incremented` 関数で拡張した、提供されているスケルトンコードを使用してください。

```kotlin
fun List<Int>.incremented(): List<Int> {
    val originalList = this
    return buildList {
        // ここにコードを書いてください
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
    <a as="button" href="kotlin-tour-intermediate-scope-functions.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-classes-interfaces.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>