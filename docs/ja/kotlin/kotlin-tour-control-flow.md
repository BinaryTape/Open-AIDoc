[//]: # (title: 制御フロー)

<no-index/>

他のプログラミング言語と同様に、Kotlin でもコードの一部が true（真）と評価されるかどうかに基づいて判断を下すことができます。そのようなコードのことを**条件式（conditional expressions）**と呼びます。また、Kotlin ではループを作成して反復処理を行うこともできます。

## 条件式 {id="conditional-expressions"}

Kotlin では、条件式をチェックするために `if` と `when` が提供されています。

> `if` と `when` のどちらを選ぶか迷った場合は、以下の理由から `when` を使用することをお勧めします。
> 
> * コードが読みやすくなる。
> * 別の分岐を追加しやすくなる。
> * コードのミスを減らせる。
> 
{style="note"}

### If {id="if"}

`if` を使用するには、丸括弧 `()` 内に条件式を記述し、その結果が true の場合に実行するアクションを波括弧 `{}` 内に記述します。

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

Kotlin には三項演算子 `condition ? then : else` はありません。その代わりに、`if` を式（expression）として使用できます。各アクションのコードが1行のみの場合、波括弧 `{}` は省略可能です。

```kotlin
fun main() { 
//sampleStart
    val a = 1
    val b = 2

    println(if (a > b) a else b) // Returns a value: 2
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-if-expression"}

### When {id="when"}

複数の分岐を持つ条件式がある場合は、`when` を使用します。

`when` の使用方法：

* 評価したい値を丸括弧 `()` 内に配置します。
* 分岐を波括弧 `{}` 内に配置します。
* 各分岐で `->` を使用して、条件チェックと、チェックが一致した場合に実行するアクションを区切ります。

`when` は文（statement）としても式（expression）としても使用できます。**文（statement）**は何も値を返さず、代わりにアクションを実行します。

以下は、`when` を文として使用する例です。

```kotlin
fun main() {
//sampleStart
    val obj = "Hello"

    when (obj) {
        // Checks whether obj equals to "1"
        "1" -> println("One")
        // Checks whether obj equals to "Hello"
        "Hello" -> println("Greeting")
        // Default statement
        else -> println("Unknown")     
    }
    // Greeting
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-when-statement"}

> すべての分岐条件は、いずれかが満たされるまで順番にチェックされることに注意してください。そのため、最初に一致した分岐のみが実行されます。
>
{style="note"}

**式（expression）**は、後でコード内で使用できる値を返します。

以下は、`when` を式として使用する例です。`when` 式の結果は変数に直ちに代入され、後で `println()` 関数で使用されます。

```kotlin
fun main() {
//sampleStart    
    val obj = "Hello"    
    
    val result = when (obj) {
        // If obj equals "1", sets result to "one"
        "1" -> "One"
        // If obj equals "Hello", sets result to "Greeting"
        "Hello" -> "Greeting"
        // Sets result to "Unknown" if no previous condition is satisfied
        else -> "Unknown"
    }
    println(result)
    // Greeting
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-when-expression"}

これまで見てきた `when` の例では、どちらも対象（subject）として `obj` が指定されていました。しかし、`when` は対象なしで使用することもできます。

次の例では、対象を**持たない** `when` 式を使用して、一連の Boolean 式をチェックしています。

```kotlin
fun main() {
    val trafficLightState = "Red" // This can be "Green", "Yellow", or "Red"

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

ただし、同じコードを `trafficLightState` を対象にして書くこともできます。

```kotlin
fun main() {
    val trafficLightState = "Red" // This can be "Green", "Yellow", or "Red"

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

対象を指定して `when` を使用すると、コードが読みやすく、保守しやすくなります。また、`when` 式に対象を指定すると、Kotlin が考えられるすべてのケースが網羅されているかをチェックするのにも役立ちます。対象を指定せずに `when` 式を使用する場合は、else 分岐を提供する必要があります。

## 練習問題: 条件式 {id="practice-conditional-expressions"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="2つのサイコロの目が一致するかどうかを判定する" id="conditional-expressions-exercise-1">

2つのサイコロを振って同じ目が出たら勝ちとなるシンプルなゲームを作成してください。`if` を使用して、サイコロの目が一致した場合は `You win :)` を出力し、そうでない場合は `You lose :(` を出力してください。

> この演習では、ランダムな `Int` を取得する `Random.nextInt()` 関数を使用できるようにパッケージをインポートしています。
> パッケージのインポートの詳細については、[パッケージとインポート](packages.md)を参照してください。
>
{style="tip"}

<deflist collapsible="true">
    <def title="ヒント">
        サイコロの結果を比較するには、<a href="operator-overloading.md#equality-and-inequality-operators">等価演算子</a>（<code>==</code>）を使用します。 
    </def>
</deflist>

```kotlin
import kotlin.random.Random

fun main() {
    val firstResult = Random.nextInt(6)
    val secondResult = Random.nextInt(6)
    // Write your code here
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-control-flow-conditional-exercise-1"}

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

</def>
<def title="ゲーム機のボタンに対するアクションを出力する" id="conditional-expressions-exercise-2">

`when` 式を使用して、ゲーム機のボタンの名前を入力したときに対応するアクションを出力するように次のプログラムを更新してください。

| **ボタン** | **アクション**          |
|------------|-------------------------|
| A          | Yes                     |
| B          | No                      |
| X          | Menu                    |
| Y          | Nothing                 |
| その他     | There is no such button |

```kotlin
fun main() {
    val button = "A"

    println(
        // Write your code here
    )
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-control-flow-conditional-exercise-2"}

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

</def>
</deflist>

## 範囲（Ranges） {id="ranges"}

ループについて説明する前に、ループで反復処理を行うための範囲（range）の構築方法を知っておくと便利です。

Kotlin で範囲を作成する最も一般的な方法は、`..` 演算子を使用することです。たとえば、`1..4` は `1, 2, 3, 4` と同等です。

終了値を含まない範囲を宣言するには、`..<` 演算子を使用します。たとえば、`1..<4` は `1, 2, 3` と同等です。

逆順の範囲を宣言するには、[`downTo`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.ranges/down-to.html) を使用します。たとえば、`4 downTo 1` は `4, 3, 2, 1` と同等です。

1 以外のステップで増加する範囲を宣言するには、[`step`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.ranges/step.html) と希望する増分値を使用します。
たとえば、`1..5 step 2` は `1, 3, 5` と同等です。

`Char` の範囲でも同様のことができます。

* `'a'..'d'` は `'a', 'b', 'c', 'd'` と同等
* `'z' downTo 's' step 2` は `'z', 'x', 'v', 't'` と同等

## ループ（Loops） {id="loops"}

プログラミングにおける最も一般的な2つのループ構造は、`for` と `while` です。一連の値に対して反復処理を行い、アクションを実行するには `for` を使用します。特定の条件が満たされるまでアクションを継続するには `while` を使用します。

### For {id="for"}

範囲に関する知識を活用して、1 から 5 までの数値を反復処理し、毎回その数値を出力する `for` ループを作成できます。

丸括弧 `()` 内にイテレータと範囲をキーワード `in` とともに配置します。完了したいアクションは波括弧 `{}` 内に追加します。

```kotlin
fun main() {
//sampleStart
    for (number in 1..5) { 
        // number is the iterator and 1..5 is the range
        print(number)
    }
    // 12345
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-for-loop"}

コレクションもループで反復処理できます。

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

### While {id="while"}

`while` は2つの方法で使用できます。

  * 条件式が true の間、コードブロックを実行する（`while`）
  * 最初にコードブロックを実行してから、条件式をチェックする（`do-while`）

最初のユースケース（`while`）：

* while ループを継続するための条件式を丸括弧 `()` 内に宣言します。
* 完了したいアクションを波括弧 `{}` 内に追加します。

> 以下の例では、[インクリメント演算子](operator-overloading.md#increments-and-decrements) `++` を使用して、変数 `cakesEaten` の値をインクリメント（1加算）しています。
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

2つ目のユースケース（`do-while`）：

* while ループを継続するための条件式を丸括弧 `()` 内に宣言します。
* 完了したいアクションをキーワード `do` とともに波括弧 `{}` 内で定義します。

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

条件式とループに関する詳細と例については、[条件とループ](control-flow.md)を参照してください。

Kotlin の制御フローの基本を理解したところで、次は独自の[関数](kotlin-tour-functions.md)を作成する方法を学びましょう。

## 練習問題: ループ {completion-point="true" id="practice-loops"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="while ループと do-while ループを使用してピザのスライスを数える" id="loops-exercise-1">

ピザが8枚のスライス（ピザ丸ごと1枚分）になるまでピザのスライスを数えるプログラムがあります。このプログラムを以下の2つの方法でリファクタリングしてください。

* `while` ループを使用する。
* `do-while` ループを使用する。

```kotlin
fun main() {
    var pizzaSlices = 0
    // Start refactoring here
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
    // End refactoring here
    println("There are $pizzaSlices slices of pizza. Hooray! We have a whole pizza! :D")
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-control-flow-loops-exercise-1"}

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

</def>
<def title="Fizz buzz ゲームをプレイする" id="loops-exercise-2">

[Fizz buzz](https://en.wikipedia.org/wiki/Fizz_buzz) ゲームをシミュレートするプログラムを作成してください。タスクは、1 から 100 までの数値を順番に出力することです。その際、3 で割り切れる数値は "fizz" という単語に、5 で割り切れる数値は "buzz" という単語に置き換えます。3 と 5 の両方で割り切れる数値は "fizzbuzz" に置き換える必要があります。

<deflist collapsible="true">
    <def title="ヒント 1">
        数値をカウントするには <code>for</code> ループを使用し、各ステップで何を出力するかを決定するには <code>when</code> 式を使用します。 
    </def>
</deflist>

<deflist collapsible="true">
    <def title="ヒント 2">
        除算の余りを取得するには剰余演算子（<code>%</code>）を使用します。余りがゼロと等しいかどうかを確認するには、<a href="operator-overloading.md#equality-and-inequality-operators">等価演算子</a>（<code>==</code>）を使用します。
    </def>
</deflist>

```kotlin
fun main() {
    // Write your code here
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-control-flow-loops-exercise-2"}

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

</def>
<def title="指定された文字で始まる単語を出力する" id="loops-exercise-3">

単語のリストがあります。`for` と `if` を使用して、文字 `l` で始まる単語のみを出力してください。

<deflist collapsible="true">
    <def title="ヒント">
        <code>String</code> 型の <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/starts-with.html"> <code>.startsWith()</code>
        </a> 関数を使用します。 
    </def>
</deflist>

```kotlin
fun main() {
    val words = listOf("dinosaur", "limousine", "magazine", "language")
    // Write your code here
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-control-flow-loops-exercise-3"}

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

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-collections.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-functions.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>