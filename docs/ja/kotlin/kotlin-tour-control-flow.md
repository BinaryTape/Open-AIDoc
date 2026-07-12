[//]: # (title: コントロールフロー)

<no-index/>

他のプログラミング言語と同様に、Kotlinはコードの一部が真（true）と評価されるかどうかに基づいて決定を下すことができます。このようなコードの一部を**条件式 (conditional expressions)**と呼びます。また、Kotlinはループを作成して反復処理を行うこともできます。

## 条件式

Kotlinは条件式をチェックするために `if` と `when` を提供しています。

> `if` と `when` のどちらかを選ぶ必要がある場合は、以下の理由から `when` を使用することをお勧めします：
> 
> * コードが読みやすくなる。
> * 分岐の追加が容易になる。
> * コード内のミスが減る。
> 
{style="note"}

### If

`if` を使用するには、丸括弧 `()` 内に条件式を追加し、結果が真の場合に実行するアクションを波括弧 `{}` 内に追加します：

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

Kotlinには三項演算子 `condition ? then : else` はありません。その代わりに、`if` を式として使用できます。アクションごとにコードが1行しかない場合、波括弧 `{}` は省略可能です：

```kotlin
fun main() { 
//sampleStart
    val a = 1
    val b = 2

    println(if (a > b) a else b) // 値を返す: 2
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-if-expression"}

### When

複数の分岐を持つ条件式がある場合は `when` を使用します。

`when` の使い方：

* 評価したい値を丸括弧 `()` 内に置きます。
* 分岐を波括弧 `{}` 内に置きます。
* 各分岐で `->` を使用して、チェック内容と、チェックが成功した場合に実行するアクションを分離します。

`when` は文（statement）としても式（expression）としても使用できます。**文**は何も返しませんが、代わりにアクションを実行します。

以下は `when` を文として使用する例です：

```kotlin
fun main() {
//sampleStart
    val obj = "Hello"

    when (obj) {
        // obj が "1" と等しいかチェック
        "1" -> println("One")
        // obj が "Hello" と等しいかチェック
        "Hello" -> println("Greeting")
        // デフォルトの文
        else -> println("Unknown")     
    }
    // Greeting
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-when-statement"}

> すべての分岐条件は、そのうちの1つが満たされるまで順番にチェックされることに注意してください。したがって、最初に適合した分岐のみが実行されます。
>
{style="note"}

**式**は、後でコード内で使用できる値を返します。

以下は `when` を式として使用する例です。`when` 式の結果はすぐに変数に代入され、その後 `println()` 関数で使用されます：

```kotlin
fun main() {
//sampleStart    
    val obj = "Hello"    
    
    val result = when (obj) {
        // obj が "1" なら、result に "One" をセット
        "1" -> "One"
        // obj が "Hello" なら、result に "Greeting" をセット
        "Hello" -> "Greeting"
        // 以前の条件がどれも満たされない場合、result に "Unknown" をセット
        else -> "Unknown"
    }
    println(result)
    // Greeting
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-when-expression"}

これまでに見た `when` の例には、いずれも `obj` という対象（subject）がありました。しかし、`when` は対象なしで使用することもできます。

この例では、対象**なし**の `when` 式を使用して、一連の Boolean 式をチェックしています：

```kotlin
fun main() {
    val trafficLightState = "Red" // "Green"、"Yellow"、または "Red" の可能性があります

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

しかし、`trafficLightState` を対象として指定して、同じコードを書くこともできます：

```kotlin
fun main() {
    val trafficLightState = "Red" // "Green"、"Yellow"、または "Red" の可能性があります

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

対象を指定して `when` を使用すると、コードの読みやすさとメンテナンス性が向上します。また、`when` 式で対象を使用すると、Kotlin がすべての考えられるケースがカバーされているか（網羅性）をチェックするのにも役立ちます。対象を使用せずに `when` 式を書く場合は、`else` 分岐を提供する必要があります。

## 条件式の練習

### 演習 1 {initial-collapse-state="collapsed" collapsible="true" id="conditional-expressions-exercise-1"}

2つのサイコロを振って同じ数字が出たら勝ち、という簡単なゲームを作成してください。`if` を使用して、サイコロが一致した場合は `You win :)` を、そうでない場合は `You lose :(` を出力するようにしてください。

> この演習では、ランダムな `Int` を取得するために `Random.nextInt()` 関数を使用できるよう、パッケージをインポートしています。パッケージのインポートに関する詳細は、[パッケージとインポート](packages.md)を参照してください。
>
{style="tip"}

<deflist collapsible="true">
    <def title="ヒント">
        サイコロの結果を比較するには、<a href="operator-overloading.md#equality-and-inequality-operators">等価演算子</a> (<code>==</code>) を使用します。 
    </def>
</deflist>

|---|---|
```kotlin
import kotlin.random.Random

fun main() {
    val firstResult = Random.nextInt(6)
    val secondResult = Random.nextInt(6)
    // ここにコードを書いてください
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-control-flow-conditional-solution-1"}

### 演習 2 {initial-collapse-state="collapsed" collapsible="true" id="conditional-expressions-exercise-2"}

`when` 式を使用して、ゲームコンソールのボタン名を入力した際に対応するアクションを出力するように、以下のプログラムを更新してください。

| **ボタン** | **アクション**             |
|------------|------------------------|
| A          | Yes                    |
| B          | No                     |
| X          | Menu                   |
| Y          | Nothing                |
| その他      | There is no such button |

|---|---|
```kotlin
fun main() {
    val button = "A"

    println(
        // ここにコードを書いてください
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-control-flow-conditional-solution-2"}

## 範囲 (Ranges)

ループについて話す前に、ループが反復処理を行うための範囲（レンジ）を作成する方法を知っておくと便利です。

Kotlin で範囲を作成する最も一般的な方法は、`..` 演算子を使用することです。例えば、`1..4` は `1, 2, 3, 4` と同等です。

終端の値を含まない範囲を宣言するには、`..<` 演算子を使用します。例えば、`1..<4` は `1, 2, 3` と同等です。

逆順の範囲を宣言するには、[`downTo`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.ranges/down-to.html) を使用します。例えば、`4 downTo 1` は `4, 3, 2, 1` と同等です。

1 以外のステップで増加する範囲を宣言するには、[`step`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.ranges/step.html) と希望する増分値を使用します。例えば、`1..5 step 2` は `1, 3, 5` と同等です。

`Char`（文字）の範囲でも同様のことができます：

* `'a'..'d'` は `'a', 'b', 'c', 'd'` と同等
* `'z' downTo 's' step 2` は `'z', 'x', 'v', 't'` と同等

## ループ

プログラミングにおける最も一般的な2つのループ構造は `for` と `while` です。一連の値に対して反復処理を行いアクションを実行するには `for` を使用します。特定の条件が満たされるまでアクションを継続するには `while` を使用します。

### For

範囲に関する知識を活かして、1から5までの数字を反復し、毎回その数字を出力する `for` ループを作成できます。

キーワード `in` と共に、イテレータと範囲を丸括弧 `()` 内に配置します。実行したいアクションを波括弧 `{}` 内に追加します：

```kotlin
fun main() {
//sampleStart
    for (number in 1..5) { 
        // number がイテレータ、1..5 が範囲です
        print(number)
    }
    // 12345
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-for-loop"}

コレクションもループで反復処理できます：

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

`while` は2つの方法で使用できます：

  * 条件式が真の間、コードブロックを実行する。 (`while`)
  * 最初にコードブロックを実行し、その後に条件式をチェックする。 (`do-while`)

最初の使用例 (`while`)：

* while ループを継続するための条件式を丸括弧 `()` 内に宣言します。
* 実行したいアクションを波括弧 `{}` 内に追加します。

> 以下の例では、[インクリメント演算子](operator-overloading.md#increments-and-decrements) `++` を使用して `cakesEaten` 変数の値を増やしています。
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

2番目の使用例 (`do-while`)：

* while ループを継続するための条件式を丸括弧 `()` 内に宣言します。
* 実行したいアクションを、キーワード `do` を伴う波括弧 `{}` 内に定義します。

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

条件式とループの詳細な情報と例については、[条件とループ](control-flow.md)を参照してください。

Kotlin のコントロールフローの基本を学んだので、次は自分自身の[関数](kotlin-tour-functions.md)を書く方法を学びましょう。

## ループの練習 {completion-point="true"}

### 演習 1 {initial-collapse-state="collapsed" collapsible="true" id="loops-exercise-1"}

ピザが8スライス（丸ごと1枚分）になるまでピザのスライスを数えるプログラムがあります。このプログラムを次の2つの方法でリファクタリングしてください：

* `while` ループを使用する。
* `do-while` ループを使用する。

|---|---|
```kotlin
fun main() {
    var pizzaSlices = 0
    // ここからリファクタリングを開始してください
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
    // ここでリファクタリングを終了してください
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例 1" id="kotlin-tour-control-flow-loops-exercise-1-solution-1"}

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例 2" id="kotlin-tour-control-flow-loops-exercise-1-solution-2"}

### 演習 2 {initial-collapse-state="collapsed" collapsible="true" id="loops-exercise-2"}

[Fizz buzz](https://ja.wikipedia.org/wiki/Fizz_Buzz) ゲームをシミュレートするプログラムを書いてください。タスクは、1から100までの数字を順番に出力することですが、3で割り切れる数字は "fizz" に、5で割り切れる数字は "buzz" に置き換えてください。3と5の両方で割り切れる数字は "fizzbuzz" に置き換える必要があります。

<deflist collapsible="true">
    <def title="ヒント 1">
        数字を数えるために <code>for</code> ループを使用し、各ステップで何を出力するかを決定するために <code>when</code> 式を使用してください。 
    </def>
</deflist>

<deflist collapsible="true">
    <def title="ヒント 2">
        割り算の余りを取得するには剰余演算子 (<code>%</code>) を使用します。余りがゼロかどうかを確認するには <a href="operator-overloading.md#equality-and-inequality-operators">等価演算子</a> (<code>==</code>) を使用します。
    </def>
</deflist>

|---|---|
```kotlin
fun main() {
    // ここにコードを書いてください
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-control-flow-loops-solution-2"}

### 演習 3 {initial-collapse-state="collapsed" collapsible="true" id="loops-exercise-3"}

単語のリストがあります。`for` と `if` を使用して、文字 `l` で始まる単語のみを出力してください。

<deflist collapsible="true">
    <def title="ヒント">
        <code>String</code> 型の <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/starts-with.html"> <code>.startsWith()</code>
        </a> 関数を使用してください。 
    </def>
</deflist>

|---|---|
```kotlin
fun main() {
    val words = listOf("dinosaur", "limousine", "magazine", "language")
    // ここにコードを書いてください
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-control-flow-loops-solution-3"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-collections.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-functions.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>