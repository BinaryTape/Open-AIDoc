[//]: # (title: レシーバ付きラムダ式)

<no-index/>

この章では、別の種類の関数であるレシーバ付きラムダ式の使い方と、それがドメイン固有言語（DSL）の作成にどのように役立つかを学びます。

## レシーバ付きラムダ式

入門ツアーでは、[ラムダ式](kotlin-tour-functions.md#lambda-expressions)の使い方を学びました。ラムダ式にはレシーバを持たせることもできます。
この場合、ラムダ式の中では、毎回明示的にレシーバを指定することなく、レシーバの任意のメンバ関数やプロパティにアクセスできます。これらの追加の参照が不要になることで、コードの可読性と保守性が向上します。

> レシーバ付きラムダ式は、レシーバ付き関数リテラルとも呼ばれます。
>
{style="tip"}

レシーバ付きラムダ式の構文は、関数型を定義する際に異なります。まず、拡張したいレシーバを記述します。次に `.` を置き、その後に残りの関数型の定義を続けます。例えば以下のようになります。

```kotlin
MutableList<Int>.() -> Unit
```

この関数型の構成は以下の通りです。

* `MutableList<Int>` がレシーバです。
* 括弧 `()` 内に関数パラメータはありません。
* 戻り値はありません（`Unit`）。

キャンバスに図形を描画する以下の例を考えてみましょう。

```kotlin
class Canvas {
    fun drawCircle() = println("🟠 Drawing a circle")
    fun drawSquare() = println("🟥 Drawing a square")
}

// レシーバ付きラムダ式の定義
fun render(block: Canvas.() -> Unit): Canvas {
    val canvas = Canvas()
    // レシーバ付きラムダ式を使用
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

この例では：

* `Canvas` クラスには、円や正方形の描画をシミュレートする2つの関数があります。
* `render()` 関数は `block` パラメータを受け取り、`Canvas` クラスのインスタンスを返します。
* `block` パラメータはレシーバ付きラムダ式であり、`Canvas` クラスがレシーバとなっています。
* `render()` 関数は `Canvas` クラスのインスタンスを作成し、その `canvas` インスタンスをレシーバとして `block()` ラムダ式を呼び出します。
* `main()` 関数は、`block` パラメータに渡されるラムダ式を伴って `render()` 関数を呼び出します。
* `render()` 関数に渡されたラムダ式の内部では、プログラムは `Canvas` クラスのインスタンスに対して `drawCircle()` と `drawSquare()` 関数を呼び出します。

  `drawCircle()` と `drawSquare()` 関数はレシーバ付きラムダ式の中で呼び出されているため、あたかも `Canvas` クラスの内部にいるかのように直接呼び出すことができます。

レシーバ付きラムダ式は、ドメイン固有言語（DSL）を作成したい場合に役立ちます。レシーバを明示的に参照することなくレシーバのメンバ関数やプロパティにアクセスできるため、コードがより簡潔になります。

これを実証するために、メニューの項目を設定する例を考えてみましょう。まず、`MenuItem` クラスと、メニューに項目を追加する `item()` 関数、および全メニュー項目のリスト `items` を持つ `Menu` クラスから始めます。

```kotlin
class MenuItem(val name: String)

class Menu(val name: String) {
    val items = mutableListOf<MenuItem>()

    fun item(name: String) {
        items.add(MenuItem(name))
    }
}
```

メニューを構築する出発点として、関数パラメータ (`init`) として渡されたレシーバ付きラムダ式を使用する `menu()` 関数を使用します。

```kotlin
fun menu(name: String, init: Menu.() -> Unit): Menu {
    // Menuクラスのインスタンスを作成
    val menu = Menu(name)
    // クラスインスタンスに対してレシーバ付きラムダ式 init() を呼び出す
    menu.init()
    return menu
}
```

これで、DSL を使用してメニューを設定し、メニュー構造をコンソールに出力する `printMenu()` 関数を作成できます。

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

// DSLを使用
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

見ての通り、レシーバ付きラムダ式を使用することで、メニューを作成するために必要なコードが大幅に簡素化されます。ラムダ式は、セットアップや作成だけでなく、設定にも役立ちます。これらは、API、UI フレームワーク、設定ビルダーのための DSL 構築に一般的に使用され、合理化されたコードを作成することで、基盤となるコード構造やロジックにより集中できるようにします。

Kotlin のエコシステムには、標準ライブラリの [`buildList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-list.html) や [`buildString()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/build-string.html) 関数など、このデザインパターンの例が多くあります。

> レシーバ付きラムダ式を Kotlin の**型安全なビルダー**と組み合わせることで、実行時ではなくコンパイル時に型に関する問題を検出できる DSL を作成できます。詳細については、[型安全なビルダー](type-safe-builders.md)を参照してください。
>
{style="tip"}

## 練習問題 {completion-point="true"}

### 練習問題 1 {initial-collapse-state="collapsed" collapsible="true" id="lambda-receivers-exercise-1"}

レシーバ付きラムダ式を受け取る `fetchData()` 関数があります。ラムダ式を更新して `append()` 関数を使用し、コードの出力が `Data received - Processed` になるようにしてください。

|---|---|
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-lambda-receivers-solution-1"}

### 練習問題 2 {initial-collapse-state="collapsed" collapsible="true" id="lambda-receivers-exercise-2"}

`Button` クラスと、`ButtonEvent` および `Position` データクラスがあります。`Button` クラスの `onEvent()` メンバ関数を呼び出して、ダブルクリックイベントをトリガーするコードを記述してください。コードは `"Double click!"` と出力する必要があります。

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
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-receivers-exercise-2"}

|---|---|
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

### 練習問題 3 {initial-collapse-state="collapsed" collapsible="true" id="lambda-receivers-exercise-3"}

整数のリストのコピーを作成し、各要素を 1 ずつインクリメントする関数を記述してください。提供されている、`List<Int>` を `incremented` 関数で拡張する関数のスケルトンを使用してください。

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-lambda-receivers-solution-3"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-scope-functions.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-classes-interfaces.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>