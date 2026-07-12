[//]: # (title: 控制流程)

<no-index/>

如同其他程式語言，Kotlin 能夠根據一段程式碼的求值結果是否為 true 來做出決策。這類程式碼被稱為**條件運算式**（conditional expression）。Kotlin 也能夠建立並疊代迴圈。

## 條件運算式

Kotlin 提供 `if` 與 `when` 來檢查條件運算式。 

> 如果您必須在 `if` 與 `when` 之間做出選擇，我們建議使用 `when`，因為它：
> 
> * 讓您的程式碼更易於閱讀。
> * 讓增加另一個分支變得更容易。
> * 減少程式碼中的錯誤。
> 
{style="note"}

### If

若要使用 `if`，請將條件運算式放在圓括號 `()` 中，並將結果為 true 時要執行的操作放在花括號 `{}` 中：

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

Kotlin 中沒有三元運算子 `condition ? then : else`。相反地，`if` 可以作為運算式使用。如果每個操作只有一行程式碼，則花括號 `{}` 是可選的：

```kotlin
fun main() { 
//sampleStart
    val a = 1
    val b = 2

    println(if (a > b) a else b) // 傳回一個值：2
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-if-expression"}

### When

當您有一個具有多個分支的條件運算式時，請使用 `when`。

若要使用 `when`：

* 將您要求值的值放在圓括號 `()` 中。
* 將分支放在花括號 `{}` 中。
* 在每個分支中使用 `->` 將每次檢查與檢查成功時要執行的操作隔開。

`when` 可以作為陳述式或運算式使用。**陳述式**（statement）不傳回任何內容，而是執行操作。

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

> 請注意，所有分支條件都會按順序檢查，直到其中一個滿足為止。因此，只有第一個合適的分支會被執行。
>
{style="note"}

**運算式**（expression）會傳回一個值，供稍後在程式碼中使用。

以下是將 `when` 作為運算式使用的範例。`when` 運算式會立即指派給一個變數，該變數稍後會與 `println()` 函式一起使用：

```kotlin
fun main() {
//sampleStart    
    val obj = "Hello"    
    
    val result = when (obj) {
        // 如果 obj 等於 "1"，將 result 設定為 "One"
        "1" -> "One"
        // 如果 obj 等於 "Hello"，將 result 設定為 "Greeting"
        "Hello" -> "Greeting"
        // 如果沒有滿足之前的條件，則將 result 設定為 "Unknown"
        else -> "Unknown"
    }
    println(result)
    // Greeting
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-when-expression"}

到目前為止您看到的 `when` 範例都有一個主體：`obj`。但 `when` 也可以在沒有主體的情況下使用。

此範例使用**不帶**主體的 `when` 運算式來檢查一系列布林運算式：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-when-expression-boolean"}

然而，您也可以使用相同的程式碼，但將 `trafficLightState` 作為主體：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-when-expression-boolean-subject"}

使用帶有主體的 `when` 可以讓您的程式碼更易於閱讀和維護。當您在 `when` 運算式中使用主體時，它還能協助 Kotlin 檢查是否涵蓋了所有可能的情況。否則，如果您在 `when` 運算式中不使用主體，則需要提供一個 `else` 分支。

## 條件運算式練習

### 練習 1 {initial-collapse-state="collapsed" collapsible="true" id="conditional-expressions-exercise-1"}

建立一個簡單的遊戲，如果擲兩顆骰子得到的數字相同則獲勝。如果骰子數字相符，使用 `if` 印出 `You win :)`，否則印出 `You lose :(`。

> 在此練習中，您會匯入一個套件，以便使用 `Random.nextInt()` 函式來取得隨機的 `Int`。如需更多關於匯入套件的資訊，請參閱 [套件與匯入](packages.md)。
>
{style="tip"}

<deflist collapsible="true">
    <def title="提示">
        使用 <a href="operator-overloading.md#equality-and-inequality-operators">相等運算子</a> (<code>==</code>) 來比較骰子結果。 
    </def>
</deflist>

|---|---|
```kotlin
import kotlin.random.Random

fun main() {
    val firstResult = Random.nextInt(6)
    val secondResult = Random.nextInt(6)
    // 在此處編寫您的程式碼
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-control-flow-conditional-solution-1"}

### 練習 2 {initial-collapse-state="collapsed" collapsible="true" id="conditional-expressions-exercise-2"}

使用 `when` 運算式更新以下程式，以便在您輸入遊戲主機按鈕名稱時印出對應的操作。

| **按鈕** | **操作** |
|------------|------------------------|
| A | Yes |
| B | No |
| X | Menu |
| Y | Nothing |
| 其他 | There is no such button |

|---|---|
```kotlin
fun main() {
    val button = "A"

    println(
        // 在此處編寫您的程式碼
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-control-flow-conditional-solution-2"}

## 範圍

在討論迴圈之前，了解如何建構供迴圈疊代的範圍（range）很有幫助。

在 Kotlin 中建立範圍最常見的方式是使用 `..` 運算子。例如，`1..4` 相當於 `1, 2, 3, 4`。

要宣告一個不包含結束值的範圍，請使用 `..<` 運算子。例如，`1..<4` 相當於 `1, 2, 3`。

要以反序宣告範圍，請使用 [`downTo`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.ranges/down-to.html)。例如，`4 downTo 1` 相當於 `4, 3, 2, 1`。

要宣告一個以非 1 的步長遞增的範圍，請使用 [`step`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.ranges/step.html) 並指定所需的遞增值。例如，`1..5 step 2` 相當於 `1, 3, 5`。

您也可以對 `Char` 範圍執行相同的操作：

* `'a'..'d'` 相當於 `'a', 'b', 'c', 'd'`
* `'z' downTo 's' step 2` 相當於 `'z', 'x', 'v', 't'`

## 迴圈

程式設計中最常見的兩種迴圈結構是 `for` 與 `while`。使用 `for` 來疊代範圍內的值並執行操作。使用 `while` 則持續執行操作，直到滿足特定條件為止。

### For

利用您對範圍的新知識，您可以建立一個 `for` 迴圈來疊代數字 1 到 5，並每次印出該數字。

將迭代器和範圍放在圓括號 `()` 中，並使用關鍵字 `in`。將您想要完成的操作放在花括號 `{}` 中：

```kotlin
fun main() {
//sampleStart
    for (number in 1..5) { 
        // number 是迭代器，1..5 是範圍
        print(number)
    }
    // 12345
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-for-loop"}

集合也可以透過迴圈進行疊代：

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

`while` 可以透過兩種方式使用：

  * 在條件運算式為 true 時執行程式碼區塊。(`while`)
  * 先執行程式碼區塊，然後再檢查條件運算式。(`do-while`)

在第一種使用情況 (`while`) 中：

* 在圓括號 `()` 中宣告讓 while 迴圈繼續執行的條件運算式。
* 在花括號 `{}` 中加入您想要完成的操作。

> 以下範例使用 [累加運算子](operator-overloading.md#increments-and-decrements) `++` 來增加 `cakesEaten` 變數的值。
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

在第二種使用情況 (`do-while`) 中：

* 在圓括號 `()` 中宣告讓 while 迴圈繼續執行的條件運算式。
* 在關鍵字 `do` 後的花括號 `{}` 中定義您想要完成的操作。

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

如需更多關於條件運算式與迴圈的資訊和範例，請參閱 [條件與迴圈](control-flow.md)。

現在您已經了解 Kotlin 控制流程的基礎知識，是時候學習如何編寫您自己的 [函式](kotlin-tour-functions.md) 了。

## 迴圈練習 {completion-point="true"}

### 練習 1 {initial-collapse-state="collapsed" collapsible="true" id="loops-exercise-1"}

您有一個程式會計算披薩切片，直到湊成一個包含 8 片的完整披薩。請以兩種方式重構此程式：

* 使用 `while` 迴圈。
* 使用 `do-while` 迴圈。

|---|---|
```kotlin
fun main() {
    var pizzaSlices = 0
    // 在此開始重構
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
    // 在此結束重構
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答 1" id="kotlin-tour-control-flow-loops-exercise-1-solution-1"}

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答 2" id="kotlin-tour-control-flow-loops-exercise-1-solution-2"}

### 練習 2 {initial-collapse-state="collapsed" collapsible="true" id="loops-exercise-2"}

撰寫一個模擬 [Fizz buzz](https://en.wikipedia.org/wiki/Fizz_buzz) 遊戲的程式。您的任務是遞增地印出 1 到 100 的數字，將任何可被 3 整除的數字替換為單字 "fizz"，任何可被 5 整除的數字替換為單字 "buzz"。任何同時可被 3 和 5 整除的數字必須替換為單字 "fizzbuzz"。

<deflist collapsible="true">
    <def title="提示 1">
        使用 <code>for</code> 迴圈來計數，並使用 <code>when</code> 運算式來決定在每一步印出什麼。 
    </def>
</deflist>

<deflist collapsible="true">
    <def title="提示 2">
        使用餘數運算子 (<code>%</code>) 來獲取數字被除後的餘數。使用 <a href="operator-overloading.md#equality-and-inequality-operators">相等運算子</a> 
        (<code>==</code>) 來檢查餘數是否等於零。
    </def>
</deflist>

|---|---|
```kotlin
fun main() {
    // 在此處編寫您的程式碼
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-control-flow-loops-solution-2"}

### 練習 3 {initial-collapse-state="collapsed" collapsible="true" id="loops-exercise-3"}

您有一個單字列表。使用 `for` 與 `if` 僅印出以字母 `l` 開頭的單字。

<deflist collapsible="true">
    <def title="提示">
        針對 <code>String</code> 型別使用 <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/starts-with.html"> <code>.startsWith()</code>
        </a> 函式。 
    </def>
</deflist>

|---|---|
```kotlin
fun main() {
    val words = listOf("dinosaur", "limousine", "magazine", "language")
    // 在此處編寫您的程式碼
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-control-flow-loops-solution-3"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-collections.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-functions.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>