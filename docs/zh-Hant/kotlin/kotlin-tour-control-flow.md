[//]: # (title: 控制流程)

<no-index/>

與其他程式語言一樣，Kotlin 能夠根據一段程式碼的求值結果是否為 true 來做出決策。這類程式碼稱為**條件運算式**。Kotlin 也能建立迴圈並進行反覆運算。

## 條件運算式 {id="conditional-expressions"}

Kotlin 提供了 `if` 與 `when` 來檢查條件運算式。 

> 如果你必須在 `if` 與 `when` 之間做出選擇，我們建議使用 `when`，因為它：
> 
> * 讓你的程式碼更容易閱讀。
> * 讓新增其他分支更加容易。
> * 能減少程式碼中的錯誤。
> 
{style="note"}

### If {id="if"}

要使用 `if`，請將條件運算式放在圓括號 `()` 內，並將結果為 true 時要執行的動作放在花括號 `{}` 內：

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
{kotlin-runnable="true" id="kotlin-tour-if"}

Kotlin 中沒有三元運算子 `condition ? then : else`。相反地，`if` 可以作為運算式使用。如果每個動作只有一行程式碼，則花括號 `{}` 是可選的：

```kotlin
fun main() { 
//sampleStart
    val a = 1
    val b = 2

    println(if (a > b) a else b) // 傳回值：2
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-if-expression"}

### When {id="when"}

當你有包含多個分支的條件運算式時，請使用 `when`。

要使用 `when`：

* 將要評估的值放在圓括號 `()` 內。
* 將分支放在花括號 `{}` 內。
* 在每個分支中使用 `->`，將每個檢查條件與檢查成功時要執行的動作分隔開來。

`when` 既可作為陳述式，也可作為運算式使用。**陳述式**不傳回任何內容，而是執行動作。

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
{kotlin-runnable="true" id="kotlin-tour-when-statement"}

> 請注意，所有分支條件都會依序檢查，直到其中一個條件滿足為止。因此只有第一個符合的分支會被執行。
>
{style="note"}

**運算式**會傳回一個值，供程式碼後續使用。

以下是將 `when` 作為運算式使用的範例。`when` 運算式會立即指派給一個變數，稍後該變數會與 `println()` 函式一起使用：

```kotlin
fun main() {
//sampleStart    
    val obj = "Hello"    
    
    val result = when (obj) {
        // 若 obj 等於 "1"，將 result 設為 "One"
        "1" -> "One"
        // 若 obj 等於 "Hello"，將 result 設為 "Greeting"
        "Hello" -> "Greeting"
        // 若前面的條件皆不滿足，則將 result 設為 "Unknown"
        else -> "Unknown"
    }
    println(result)
    // Greeting
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-when-expression"}

到目前為止你看到的 `when` 範例都具有一個主體：`obj`。但是 `when` 也可以在沒有主體的情況下使用。

此範例使用**沒有**主體的 `when` 運算式來檢查一系列布林運算式：

```kotlin
fun main() {
    val trafficLightState = "Red" // 這可以是 "Green"、"Yellow" 或 "Red"

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
{kotlin-runnable="true" id="kotlin-tour-when-expression-boolean"}

不過，你也可以撰寫相同的程式碼，但將 `trafficLightState` 作為其主體：

```kotlin
fun main() {
    val trafficLightState = "Red" // 這可以是 "Green"、"Yellow" 或 "Red"

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
{kotlin-runnable="true" id="kotlin-tour-when-expression-boolean-subject"}

使用帶有主體的 `when` 可以讓你的程式碼更容易閱讀和維護。當你在 `when` 運算式中使用主體時，它也有助於 Kotlin 檢查是否已涵蓋所有可能的情況。否則，如果你在 `when` 運算式中未使用主體，則必須提供一個 else 分支。

## 練習：條件運算式 {id="practice-conditional-expressions"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="檢查兩次擲骰子結果是否相符" id="conditional-expressions-exercise-1">

建立一個簡單的遊戲：擲兩個骰子時，若點數相同即獲勝。使用 `if`，在骰子點數相符時印出 `You win :)`，否則印出 `You lose :(`。

> 在本練習中，你需要匯入套件，以便使用 `Random.nextInt()` 函式為你提供一個隨機 `Int`。
> 若要了解更多有關匯入套件的資訊，請參閱[套件與匯入](packages.md)。
>
{style="tip"}

<deflist collapsible="true">
    <def title="提示">
        使用<a href="operator-overloading.md#equality-and-inequality-operators">相等運算子</a> (<code>==</code>) 來比較骰子的結果。 
    </def>
</deflist>

```kotlin
import kotlin.random.Random

fun main() {
    val firstResult = Random.nextInt(6)
    val secondResult = Random.nextInt(6)
    // 在此處編寫你的程式碼
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/ControlFlowConditionalExercise1Test.kt" validate="false" id="kotlin-tour-control-flow-conditional-exercise-1"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/ControlFlowConditionalExercise1Test.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解決方案" id="kotlin-tour-control-flow-conditional-solution-1"}

</def>
<def title="印出遊戲主機按鈕的動作" id="conditional-expressions-exercise-2">

使用 `when` 運算式更新以下程式，使其印出表格中任意遊戲主機按鈕對應的動作。`button` 的初始值為 `"A"`，但你可以修改它來嘗試其他按鈕。

| **按鈕** | **動作**              |
|------------|-------------------------|
| A          | Yes                     |
| B          | No                      |
| X          | Menu                    |
| Y          | Nothing                 |
| Other      | There is no such button |

```kotlin
var button = "A"

fun main() {
    println(
        // 在此處編寫你的程式碼
    )
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/ControlFlowConditionalExercise2Test.kt" validate="false" id="kotlin-tour-control-flow-conditional-exercise-2"}

```kotlin
var button = "A"

fun main() {
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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/ControlFlowConditionalExercise2Test.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解決方案" id="kotlin-tour-control-flow-conditional-solution-2"}

</def>
</deflist>

## 範圍 {id="ranges"}

在討論迴圈之前，先了解如何建構供迴圈反覆運算的範圍會很有幫助。

在 Kotlin 中建立範圍最常見的方法是使用 `..` 運算子。例如，`1..4` 等同於 `1, 2, 3, 4`。

要宣告一個不包含結束值的範圍，請使用 `..<` 運算子。例如，`1..<4` 等同於 `1, 2, 3`。

要以遞減順序宣告範圍，請使用 [`downTo`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.ranges/down-to.html)。例如，`4 downTo 1` 等同於 `4, 3, 2, 1`。

要宣告步進值不為 1 的範圍，請使用 [`step`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.ranges/step.html) 及你所需的遞增值。
例如，`1..5 step 2` 等同於 `1, 3, 5`。

你也可以對 `Char` 範圍執行相同的操作：

* `'a'..'d'` 等同於 `'a', 'b', 'c', 'd'`
* `'z' downTo 's' step 2` 等同於 `'z', 'x', 'v', 't'`

## 迴圈 {id="loops"}

程式設計中最常見的兩種迴圈結構是 `for` 和 `while`。使用 `for` 遍歷某個範圍的值並執行動作。使用 `while` 持續執行動作，直到滿足特定條件為止。

### For {id="for"}

利用你剛學到的範圍知識，你可以建立一個 `for` 迴圈來遍歷數字 1 到 5，並每次印出該數字。

將反覆運算器與範圍放在圓括號 `()` 內，並加上關鍵字 `in`。將你想要完成的動作新增在花括號 `{}` 內：

```kotlin
fun main() {
//sampleStart
    for (number in 1..5) { 
        // number 是反覆運算器，1..5 是範圍
        print(number)
    }
    // 12345
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-for-loop"}

集合也可以透過迴圈進行反覆運算：

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
{kotlin-runnable="true" id="kotlin-tour-for-collection-loop"}

### While {id="while"}

`while` 可以透過兩種方式使用：

  * 當條件運算式為 true 時執行程式碼區塊。（`while`）
  * 先執行程式碼區塊，然後再檢查條件運算式。（`do-while`）

在第一種使用案例（`while`）中：

* 在圓括號 `()` 內宣告 while 迴圈繼續執行的條件運算式。 
* 在花括號 `{}` 內加入你要完成的動作。

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
{kotlin-runnable="true" id="kotlin-tour-while-loop"}

在第二種使用案例（`do-while`）中：

* 在圓括號 `()` 內宣告 while 迴圈繼續執行的條件運算式。
* 配合關鍵字 `do`，在花括號 `{}` 內定義你要完成的動作。

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
{kotlin-runnable="true" id="kotlin-tour-while-do-loop"}

如需更多條件運算式與迴圈的詳細資訊及範例，請參閱[條件與迴圈](control-flow.md)。

現在你已經了解了 Kotlin 控制流程的基礎知識，接下來該學習如何撰寫你自己的[函式](kotlin-tour-functions.md)了。

## 練習：迴圈 {completion-point="true" id="practice-loops"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="使用 while 和 do-while 迴圈計算披薩切片數量" id="loops-exercise-1">

你有一個計算披薩切片數量的程式，直到湊齊一整片 8 切片的披薩為止。請透過兩種方式重構此程式：

* 使用 `while` 迴圈。
* 使用 `do-while` 迴圈。

```kotlin
fun main() {
    var pizzaSlices = 0
    // 從這裡開始重構
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
    // 在這裡結束重構
    println("There are $pizzaSlices slices of pizza. Hooray! We have a whole pizza! :D")
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/ControlFlowLoopsExercise1Test.kt" validate="false" id="kotlin-tour-control-flow-loops-exercise-1"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/ControlFlowLoopsExercise1Test.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解決方案 1" id="kotlin-tour-control-flow-loops-exercise-1-solution-1"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/ControlFlowLoopsExercise1Test.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解決方案 2" id="kotlin-tour-control-flow-loops-exercise-1-solution-2"}

</def>
<def title="玩 Fizz buzz 遊戲" id="loops-exercise-2">

撰寫一個模擬 [Fizz buzz](https://en.wikipedia.org/wiki/Fizz_buzz) 遊戲的程式。你的任務是遞增印出從 1 到 100 的數字：任何可被 3 整除的數字替換為單字 "fizz"，任何可被 5 整除的數字替換為單字 "buzz"。同時能被 3 和 5 整除的數字則必須替換為單字 "fizzbuzz"。

<deflist collapsible="true">
    <def title="提示 1">
        使用 <code>for</code> 迴圈計數，並使用 <code>when</code> 運算式決定每一步要印出的內容。 
    </def>
</deflist>

<deflist collapsible="true">
    <def title="提示 2">
        使用取模運算子 (<code>%</code>) 傳回除法運算的餘數。使用<a href="operator-overloading.md#equality-and-inequality-operators">相等運算子</a> (<code>==</code>) 檢查餘數是否等於零。
    </def>
</deflist>

```kotlin
fun main() {
    // 在此處編寫你的程式碼
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/ControlFlowLoopsExercise2Test.kt" validate="false" id="kotlin-tour-control-flow-loops-exercise-2"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/ControlFlowLoopsExercise2Test.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解決方案" id="kotlin-tour-control-flow-loops-solution-2"}

</def>
<def title="印出以指定字母開頭的單字" id="loops-exercise-3">

你有一個單字清單。請使用 `for` 與 `if` 僅印出以字母 `l` 開頭的單字。

<deflist collapsible="true">
    <def title="提示">
        使用 <code>String</code> 型別的 <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/starts-with.html"><code>.startsWith()</code></a> 函式。 
    </def>
</deflist>

```kotlin
fun main() {
    val words = listOf("dinosaur", "limousine", "magazine", "language")
    // 在此處編寫你的程式碼
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/ControlFlowLoopsExercise3Test.kt" validate="false" id="kotlin-tour-control-flow-loops-exercise-3"}

```kotlin
fun main() {
    val words = listOf("dinosaur", "limousine", "magazine", "language")
    for (w in words) {
        if (w.startsWith("l"))
            println(w)
    }
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/ControlFlowLoopsExercise3Test.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解決方案" id="kotlin-tour-control-flow-loops-solution-3"}

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