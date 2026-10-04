[//]: # (title: 控制流程)

<no-index/>

與其他程式語言一樣，Kotlin 能夠根據一段程式碼的求值結果是否為 true 來做出決策。這樣的程式碼片段稱為**條件運算式**。Kotlin 還能夠建立並反覆運算迴圈。

## 條件運算式 {id="conditional-expressions"}

Kotlin 提供了 `if` 與 `when` 來檢查條件運算式。 

> 如果你必須在 `if` 與 `when` 之間做選擇，我們建議使用 `when`，因為它：
> 
> * 讓你的程式碼更易於閱讀。
> * 讓新增其他分支變得更容易。
> * 能減少程式碼中的錯誤。
> 
{style="note"}

### If {id="if"}

若要使用 `if`，請將條件運算式放在圓括號 `()` 內，並將結果為 true 時要執行的操作放在花括號 `{}` 內：

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

Kotlin 中沒有三元運算子 `condition ? then : else`。相反地，`if` 可以作為運算式使用。如果每個操作只有一行程式碼，花括號 `{}` 是可選的：

```kotlin
fun main() { 
//sampleStart
    val a = 1
    val b = 2

    println(if (a > b) a else b) // 回傳值：2
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-if-expression"}

### When {id="when"}

當你有包含多個分支的條件運算式時，請使用 `when`。

若要使用 `when`：

* 將你要評估的值放在圓括號 `()` 內。
* 將各個分支放在花括號 `{}` 內。
* 在每個分支中使用 `->`，將各個檢查與檢查成功時要執行的操作分開。

`when` 可以作為陳述式或運算式使用。**陳述式**不回傳任何內容，而是執行操作。

以下是將 `when` 作為陳述式使用的範例：

```kotlin
fun main() {
//sampleStart
    val obj = "Hello"

    when (obj) {
        // 檢查 obj 是否等於 "1"
        "1" -> println("One")
        // 檢查 obj 是否等於 "Hello"
        "Hello" -> println("Greeting")
        // 預設陳述式
        else -> println("Unknown")     
    }
    // Greeting
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-when-statement"}

> 請注意，所有分支條件都會依序檢查，直到其中一個條件滿足為止。因此只會執行第一個符合條件的分支。
>
{style="note"}

**運算式**會回傳一個值，供後續程式碼使用。

以下是將 `when` 作為運算式使用的範例。該 `when` 運算式會立即指派給一個變數，稍後在 `println()` 函式中使用：

```kotlin
fun main() {
//sampleStart    
    val obj = "Hello"    
    
    val result = when (obj) {
        // 若 obj 等於 "1"，將 result 設為 "One"
        "1" -> "One"
        // 若 obj 等於 "Hello"，將 result 設為 "Greeting"
        "Hello" -> "Greeting"
        // 若先前的條件皆未滿足，將 result 設為 "Unknown"
        else -> "Unknown"
    }
    println(result)
    // Greeting
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-when-expression"}

到目前為止你看到的 `when` 範例都有一個主體：`obj`。但 `when` 也可以在沒有主體的情況下使用。

此範例使用**不帶**主體的 `when` 運算式來檢查一系列布林運算式：

```kotlin
fun main() {
    val trafficLightState = "Red" // 可以是 "Green"、"Yellow" 或 "Red"

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

不過，你可以撰寫相同的程式碼，但將 `trafficLightState` 作為主體：

```kotlin
fun main() {
    val trafficLightState = "Red" // 可以是 "Green"、"Yellow" 或 "Red"

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

搭配主體使用 `when` 可以讓你的程式碼更易於閱讀與維護。當你在 `when` 運算式中使用主體時，它還有助於 Kotlin 檢查是否已涵蓋所有可能的情況。否則，如果你在 `when` 運算式中沒有使用主體，就需要提供一個 else 分支。

## 練習：條件運算式 {id="practice-conditional-expressions"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="檢查擲兩次骰子的結果是否相同" id="conditional-expressions-exercise-1">

建立一個簡單的遊戲，如果擲兩次骰子得到相同的點數就算獲勝。使用 `if`，如果骰子點數相符則印出 `You win :)`，否則印出 `You lose :(`。

> 在此練習中，你將匯入一個套件，以便使用 `Random.nextInt()` 函式為你提供一個隨機 `Int`。
> 有關匯入套件的詳細資訊，請參閱[套件與匯入](packages.md)。
>
{style="tip"}

<deflist collapsible="true">
    <def title="提示">
        使用<a href="operator-overloading.md#equality-and-inequality-operators">相等運算子</a>（<code>==</code>）來比較骰子結果。 
    </def>
</deflist>

```kotlin
import kotlin.random.Random

fun main() {
    val firstResult = Random.nextInt(6)
    val secondResult = Random.nextInt(6)
    // 在此處撰寫你的程式碼
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-control-flow-conditional-solution-1"}

</def>
<def title="印出遊戲主機按鈕的動作" id="conditional-expressions-exercise-2">

使用 `when` 運算式更新以下程式，以便在輸入遊戲主機按鈕名稱時印出對應的動作。

| **按鈕** | **動作**                 |
|------------|-------------------------|
| A          | Yes                     |
| B          | No                      |
| X          | Menu                    |
| Y          | Nothing                 |
| 其他       | There is no such button |

```kotlin
fun main() {
    val button = "A"

    println(
        // 在此處撰寫你的程式碼
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-control-flow-conditional-solution-2"}

</def>
</deflist>

## 區間 {id="ranges"}

在討論迴圈之前，了解如何建構供迴圈反覆運算的區間會很有幫助。

在 Kotlin 中建立區間最常見的方法是使用 `..` 運算子。例如，`1..4` 等同於 `1, 2, 3, 4`。

若要宣告一個不包含結束值的區間，請使用 `..<` 運算子。例如，`1..<4` 等同於 `1, 2, 3`。

若要以反向順序宣告區間，請使用 [`downTo`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.ranges/down-to.html)。例如，`4 downTo 1` 等同於 `4, 3, 2, 1`。

若要宣告不以 1 為步長遞增的區間，請使用 [`step`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.ranges/step.html) 以及所需的遞增值。
例如，`1..5 step 2` 等同於 `1, 3, 5`。

你也可以對 `Char` 區間執行相同的操作：

* `'a'..'d'` 等同於 `'a', 'b', 'c', 'd'`
* `'z' downTo 's' step 2` 等同於 `'z', 'x', 'v', 't'`

## 迴圈 {id="loops"}

程式設計中最常見的兩種迴圈結構是 `for` 與 `while`。使用 `for` 來遍歷一系列值並執行操作。使用 `while` 則可持續執行操作，直到滿足特定條件為止。

### For {id="for"}

利用你剛學到的區間知識，你可以建立一個 `for` 迴圈來反覆運算數字 1 到 5，並在每次時印出該數字。

使用關鍵字 `in` 將反覆運算變數和區間放在圓括號 `()` 內。將你要完成的操作放在花括號 `{}` 內：

```kotlin
fun main() {
//sampleStart
    for (number in 1..5) { 
        // number 是反覆運算變數，1..5 是區間
        print(number)
    }
    // 12345
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-for-loop"}

集合也可以被迴圈反覆運算：

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

`while` 可以透過兩種方式使用：

  * 在條件運算式為 true 時執行程式碼區塊。(`while`)
  * 先執行程式碼區塊，然後再檢查條件運算式。(`do-while`)

在第一種使用案例（`while`）中：

* 在圓括號 `()` 內宣告讓 while 迴圈繼續執行的條件運算式。 
* 在花括號 `{}` 內新增你要完成的操作。

> 以下範例使用[遞增運算子](operator-overloading.md#increments-and-decrements) `++` 來增加 `cakesEaten` 變數的值。
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

在第二種使用案例（`do-while`）中：

* 在圓括號 `()` 內宣告讓 while 迴圈繼續執行的條件運算式。
* 使用關鍵字 `do`，在花括號 `{}` 內定義你要完成的操作。

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

有關條件運算式與迴圈的更多資訊及範例，請參閱[條件與迴圈](control-flow.md)。

現在你已經了解了 Kotlin 控制流程的基本概念，是時候學習如何編寫你自己的[函式／方法](kotlin-tour-functions.md)了。

## 練習：迴圈 {completion-point="true" id="practice-loops"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="使用 while 與 do-while 迴圈計算披薩切片數量" id="loops-exercise-1">

你有一個會計算披薩切片數量直到湊齊一整批 8 片披薩的程式。請透過兩種方式重構此程式：

* 使用 `while` 迴圈。
* 使用 `do-while` 迴圈。

```kotlin
fun main() {
    var pizzaSlices = 0
    // 從此處開始重構
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
    // 在此處結束重構
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答 1" id="kotlin-tour-control-flow-loops-exercise-1-solution-1"}

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答 2" id="kotlin-tour-control-flow-loops-exercise-1-solution-2"}

</def>
<def title="玩 Fizz buzz 遊戲" id="loops-exercise-2">

編寫一個模擬 [Fizz buzz](https://en.wikipedia.org/wiki/Fizz_buzz) 遊戲的程式。你的任務是依序印出 1 到 100 的數字，任何能被 3 整除的數字替換為單字 "fizz"，任何能被 5 整除的數字替換為單字 "buzz"。任何同時能被 3 和 5 整除的數字必須替換為單字 "fizzbuzz"。

<deflist collapsible="true">
    <def title="提示 1">
        使用 <code>for</code> 迴圈計算數字，並使用 <code>when</code> 運算式決定每一步要印出的內容。 
    </def>
</deflist>

<deflist collapsible="true">
    <def title="提示 2">
        使用模數運算子（<code>%</code>）回傳數字相除的餘數。使用<a href="operator-overloading.md#equality-and-inequality-operators">相等運算子</a>（<code>==</code>）來檢查餘數是否等於零。
    </def>
</deflist>

```kotlin
fun main() {
    // 在此處撰寫你的程式碼
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-control-flow-loops-solution-2"}

</def>
<def title="印出以指定字母開頭的單字" id="loops-exercise-3">

你有一個單字清單。使用 `for` 與 `if` 僅印出以字母 `l` 開頭的單字。

<deflist collapsible="true">
    <def title="提示">
        對 <code>String</code> 型別使用 <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/starts-with.html"><code>.startsWith()</code></a> 函式。 
    </def>
</deflist>

```kotlin
fun main() {
    val words = listOf("dinosaur", "limousine", "magazine", "language")
    // 在此處撰寫你的程式碼
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-control-flow-loops-solution-3"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-collections.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-functions.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>