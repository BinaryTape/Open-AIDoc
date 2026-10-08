[//]: # (title: 高階函數與 Lambda 運算式)

Kotlin 函式是一等公民 (first-class)，這意味著它們可以存儲在變數和資料結構中，並可以作為引數傳遞給其他[高階函數](#higher-order-functions)或從中傳回。您可以對函式執行任何對其他非函式值所能進行的操作。

為了實現這一點，Kotlin 作為一種靜態型別程式語言，使用一系列的[函式型別](#function-types)來表示函式，並提供了一組專門的語言結構，例如 [Lambda 運算式](#lambda-expressions-and-anonymous-functions)。

## 高階函數 {id="higher-order-functions"}

高階函數是指將函式作為參數或傳回函式的函式。

高階函數的一個好例子是集合的[函數式程式設計慣用法 `fold`](https://en.wikipedia.org/wiki/Fold_(higher-order_function))。它接受一個初始累加器值和一個組合函式，並透過連續將當前累加器值與每個集合元素結合，每次替換累加器值來建構其傳回值：

```kotlin
fun <T, R> Collection<T>.fold(
    initial: R, 
    combine: (acc: R, nextElement: T) -> R
): R {
    var accumulator: R = initial
    for (element: T in this) {
        accumulator = combine(accumulator, element)
    }
    return accumulator
}
```

在上面的程式碼中，`combine` 參數具有[函式型別](#function-types) `(R, T) -> R`，因此它接受一個接受兩個型別分別為 `R` 和 `T` 的引數並傳回一個型別為 `R` 的值的函式。它在 `for` 迴圈內被[呼叫](#invoking-a-function-type-instance)，然後將傳回值指派給 `accumulator`。

要呼叫 `fold`，您需要向其傳遞一個[函式型別的執行個體](#instantiating-a-function-type)作為引數，而 Lambda 運算式（[在下文中有更詳細的描述](#lambda-expressions-and-anonymous-functions)）在高階函數呼叫點被廣泛用於此目的：

```kotlin
fun main() {
    //sampleStart
    val items = listOf(1, 2, 3, 4, 5)
    
    // Lambda 運算式是封閉在花括號中的程式碼區塊。
    items.fold(0, { 
        // 當 Lambda 運算式有參數時，它們排在最前面，後跟 '->'
        acc: Int, i: Int -> 
        print("acc = $acc, i = $i, ") 
        val result = acc + i
        println("result = $result")
        // Lambda 運算式中的最後一個運算式被視為傳回值：
        result
    })
    
    // 如果可以推論出 Lambda 運算式中的參數型別，則它們是選用的：
    val joinedToString = items.fold("Elements:", { acc, i -> acc + " " + i })
    
    // 函式參照也可用於高階函數呼叫：
    val product = items.fold(1, Int::times)
    //sampleEnd
    println("joinedToString = $joinedToString")
    println("product = $product")
}
```
{kotlin-runnable="true"}

## 函式型別 {id="function-types"}

Kotlin 使用函式型別（例如 `(Int) -> String`）來進行與函式相關的宣告：`val onClick: () -> Unit = ...`。

這些型別具有與函式簽章相對應的特殊標記法——包括它們的參數和傳回值：

* 所有函式型別都有一個用圓括號括起來的參數型別列表和一個傳回型別：`(A, B) -> C` 表示代表接受型別為 `A` 和 `B` 的兩個引數並傳回型別為 `C` 的值的函式的型別。參數型別列表可以為空，如 `() -> A`。[`Unit` 傳回型別](functions.md#unit-returning-functions)不可省略。

* 函式型別可以選擇性地具有一個額外的 *接收者* 型別，該型別在標記法中的點之前指定：型別 `A.(B) -> C` 表示可以在接收者物件 `A` 上呼叫且具有參數 `B` 並傳回值 `C` 的函式。[帶有接收者的函式常值](#function-literals-with-receiver)通常與這些型別一起使用。

* [暫停函式](coroutines-basics.md)屬於一種特殊的函式型別，其標記法中具有 *suspend* 修飾符，例如 `suspend () -> Unit` 或 `suspend A.(B) -> C`。

函式型別標記法可以選擇性地包含函式參數的名稱：`(x: Int, y: Int) -> Point`。這些名稱可用於記錄參數的含義。

要指定函式型別為[可 null](null-safety.md#nullable-types-and-non-nullable-types)，請按照以下方式使用圓括號：`((Int, Int) -> Int)?`。

函式型別也可以使用圓括號進行組合：`(Int) -> ((Int) -> Unit)`。

> 箭頭標記法是右結合的，`(Int) -> (Int) -> Unit` 與前面的範例等效，但與 `((Int) -> (Int)) -> Unit` 不等效。
>
{style="note"}

您還可以使用[型別別名](type-aliases.md)為函式型別提供一個替代名稱：

```kotlin
typealias ClickHandler = (Button, ClickEvent) -> Unit
```

### 具現化函式型別 {id="instantiating-a-function-type"}

有幾種方法可以取得函式型別的執行個體：

* 在函式常值中使用程式碼區塊，採用以下形式之一：
    * [Lambda 運算式](#lambda-expressions-and-anonymous-functions)：`{ a, b -> a + b }`，
    * [匿名函式](#anonymous-functions)：`fun(s: String): Int { return s.toIntOrNull() ?: 0 }`

  [帶有接收者的函式常值](#function-literals-with-receiver)可用作帶有接收者的函式型別的值。

* 使用對現有宣告的可呼叫參照：
    * 頂層、區域、成員或延伸[函式](reflection.md#function-references)：`::isOdd`、`String::toInt`，
    * 頂層、成員或延伸[屬性](reflection.md#property-references)：`List<Int>::size`，
    * [建構函式](reflection.md#constructor-references)：`::Regex`

  這些包括指向特定執行個體的成員的[限定可呼叫參照](reflection.md#bound-function-and-property-references)：`foo::toString`。

* 使用實作了函式型別作為介面的自訂類別執行個體：

```kotlin
class IntTransformer: (Int) -> Int {
    override operator fun invoke(x: Int): Int = TODO()
}

val intFunction: (Int) -> Int = IntTransformer()
```

如果有足夠的資訊，編譯器可以推論出變數的函式型別：

```kotlin
val a = { i: Int -> i + 1 } // 推論出的型別是 (Int) -> Int
```

帶有接收者和不帶接收者的函式型別的 *非常值* 值是可以互換的，因此接收者可以代替第一個參數，反之亦然。例如，型別為 `(A, B) -> C` 的值可以傳遞或指派給預期型別為 `A.(B) -> C` 的地方，反之亦然：

```kotlin
fun main() {
    //sampleStart
    val repeatFun: String.(Int) -> String = { times -> this.repeat(times) }
    val twoParameters: (String, Int) -> String = repeatFun // OK
    
    fun runTransformation(f: (String, Int) -> String): String {
        return f("hello", 3)
    }
    val result = runTransformation(repeatFun) // OK
    //sampleEnd
    println("result = $result")
}
```
{kotlin-runnable="true"}

> 預設情況下會推論出不帶接收者的函式型別，即使變數是用對延伸函式的參照初始化的也是如此。
> 要更改這一點，請明確指定變數型別。
>
{style="note"}

### 呼叫函式型別執行個體 {id="invoking-a-function-type-instance"}

函式型別的值可以透過使用其 [`invoke(...)` 運算子](operator-overloading.md#invoke-operator)來呼叫：`f.invoke(x)` 或簡寫為 `f(x)`。

如果該值具有接收者型別，則接收者物件應作為第一個引數傳遞。另一種呼叫帶有接收者的函式型別的值的方法是在其前面加上接收者物件，就像該值是一個[延伸函式](extensions.md)一樣：`1.foo(2)`。

範例：

```kotlin
fun main() {
    //sampleStart
    val stringPlus: (String, String) -> String = String::plus
    val intPlus: Int.(Int) -> Int = Int::plus
    
    println(stringPlus.invoke("<-", "->"))
    println(stringPlus("Hello, ", "world!"))
    
    println(intPlus.invoke(1, 1))
    println(intPlus(1, 2))
    println(2.intPlus(3)) // 類似延伸函式的呼叫
    //sampleEnd
}
```
{kotlin-runnable="true"}

### 內嵌函式 {id="inline-functions"}

有時對高階函數使用[內嵌函式](inline-functions.md)是有益的，這可以提供靈活的控制流。

## Lambda 運算式與匿名函式 {id="lambda-expressions-and-anonymous-functions"}

Lambda 運算式和匿名函式是 *函式常值*。函式常值是未宣告但立即作為運算式傳遞的函式。請考慮以下範例：

```kotlin
max(strings, { a, b -> a.length < b.length })
```

函式 `max` 是一個高階函數，因為它接受一個函式值作為其第二個引數。這第二個引數是一個本身就是函式的運算式，稱為函式常值，它等效於以下具名函式：

```kotlin
fun compare(a: String, b: String): Boolean = a.length < b.length
```

您還可以使用 `suspend` 關鍵字建立 _暫停 Lambda 運算式_。暫停 Lambda 具有函式型別 `suspend () -> Unit`，並且可以呼叫其他暫停函式：

```kotlin
val suspendingTask = suspend { doSuspendingWork() }
```

### Lambda 運算式語法 {id="lambda-expression-syntax"}

Lambda 運算式的完整語法形式如下：

```kotlin
val sum: (Int, Int) -> Int = { x: Int, y: Int -> x + y }
```

* Lambda 運算式始終被包裹在花括號中。
* 完整語法形式中的參數宣告在花括號內，並具有選用的型別註解。
* 主體放在 `->` 之後。
* 如果推論出的 Lambda 傳回型別不是 `Unit`，則 Lambda 主體內的最後一個（或可能是唯一一個）運算式將被視為傳回值。

如果您省略所有選用的註解，剩下的部分看起來像這樣：

```kotlin
val sum = { x: Int, y: Int -> x + y }
```

### 傳遞尾隨 Lambda {id="passing-trailing-lambdas"}

根據 Kotlin 慣例，如果函式的最後一個參數是函式，則作為相應引數傳遞的 Lambda 運算式可以放置在圓括號外：

```kotlin
val product = items.fold(1) { acc, e -> acc * e }
```

這種語法也稱為 *尾隨 Lambda*。

如果 Lambda 是該呼叫中的唯一引數，則可以完全省略圓括號：

```kotlin
run { println("...") }
```

### it：單個參數的隱含名稱 {id="it-implicit-name-of-a-single-parameter"}

Lambda 運算式只有一個參數是很常見的。

如果編譯器可以在不使用任何參數的情況下解析簽章，則不需要宣告該參數，並且可以省略 `->`。該參數將以名稱 `it` 隱含宣告：

```kotlin
ints.filter { it > 0 } // 此常值的型別為 '(it: Int) -> Boolean'
```

### 從 Lambda 運算式傳回值 {id="returning-a-value-from-a-lambda-expression"}

您可以使用[限定 return](returns.md#return-to-labels) 語法從 Lambda 明確傳回一個值。否則，最後一個運算式的值將被隱含傳回。

因此，以下兩個片段是等效的：

```kotlin
ints.filter {
    val shouldFilter = it > 0
    shouldFilter
}

ints.filter {
    val shouldFilter = it > 0
    return@filter shouldFilter
}
```

這一慣例與[在圓括號外傳遞 Lambda 運算式](#passing-trailing-lambdas)相結合，可以實現 [LINQ 風格](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/linq/)的程式碼：

```kotlin
strings.filter { it.length == 5 }.sortedBy { it }.map { it.uppercase() }
```

### 未使用變數的底線 {id="underscore-for-unused-variables"}

如果 Lambda 參數未使用，您可以用底線代替其名稱：

```kotlin
map.forEach { (_, value) -> println("$value!") }
```

### Lambda 中的解構 {id="destructuring-in-lambdas"}

Lambda 中的解構作為[解構宣告](destructuring-declarations.md#destructuring-in-lambdas)的一部分進行了描述。

### 匿名函式 {id="anonymous-functions"}

上面的 Lambda 運算式語法缺少一件事——指定函式傳回型別的能力。在大多數情況下，這是不必要的，因為傳回型別可以自動推論。但是，如果您確實需要明確指定它，可以使用另一種語法：*匿名函式*。

```kotlin
fun(x: Int, y: Int): Int = x + y
```

匿名函式看起來非常像常規函式宣告，只是省略了它的名稱。它的主體可以是一個運算式（如上所示）或一個區塊：

```kotlin
fun(x: Int, y: Int): Int {
    return x + y
}
```

參數和傳回型別的指定方式與常規函式相同，不同之處在於如果可以從內容中推論出參數型別，則可以省略參數型別：

```kotlin
ints.filter(fun(item) = item > 0)
```

匿名函式的傳回型別推論與正常函式完全相同：對於具有運算式主體的匿名函式，傳回型別會自動推論，但對於具有區塊主體的匿名函式，必須明確指定傳回型別（或假定為 `Unit`）。

> 當將匿名函式作為參數傳遞時，請將它們放在圓括號內。允許將函式留在圓括號外的簡寫語法僅適用於 Lambda 運算式。
>
{style="note"}

Lambda 運算式與匿名函式之間的另一個區別是[非區域傳回](inline-functions.md#returns)的行為。不帶標籤的 `return` 陳述式始終從使用 `fun` 關鍵字宣告的函式中傳回。這意味著 Lambda 運算式內部的 `return` 將從外圍函式傳回，而匿名函式內部的 `return` 將從匿名函式本身傳回。

### 閉包 {id="closures"}

Lambda 運算式或匿名函式（以及[區域函式](functions.md#local-functions)和[物件運算式](object-declarations.md#object-expressions)）可以存取其 *閉包 (closure)*，其中包括在外層作用域中宣告的變數。在閉包中捕獲的變數可以在 Lambda 中修改：

```kotlin
var sum = 0
ints.filter { it > 0 }.forEach {
    sum += it
}
print(sum)
```

### 帶有接收者的函式常值 {id="function-literals-with-receiver"}

帶有接收者的[函式型別](#function-types)（例如 `A.(B) -> C`）可以使用特殊形式的函式常值——帶有接收者的函式常值來具現化。

如上所述，Kotlin 提供了在提供 *接收者物件* 的同時[呼叫](#invoking-a-function-type-instance)帶有接收者的函式型別執行個體的能力。

在函式常值的主體內部，傳遞給呼叫的接收者物件變成了一個 *隱含的* `this`，因此您可以存取該接收者物件的成員而不需要任何額外的限定符，或者使用 [`this` 運算式](this-expressions.md)來存取接收者物件。

這種行為與[延伸函式](extensions.md)類似，延伸函式也允許您在函式主體內部存取接收者物件的成員。

下面是一個帶有接收者的函式常值及其型別的範例，其中 `plus` 在接收者物件上呼叫：

```kotlin
val sum: Int.(Int) -> Int = { other -> plus(other) }
```

匿名函式語法允許您直接指定函式常值的接收者型別。如果您需要宣告帶有接收者的函式型別的變數，以便稍後使用，這會很有用。

```kotlin
val sum = fun Int.(other: Int): Int = this + other
```

當接收者型別可以從內容中推論出來時，Lambda 運算式可用作帶有接收者的函式常值。其用法最重要的範例之一是[型別安全建構器](type-safe-builders.md)：

```kotlin
class HTML {
    fun body() { ... }
}

fun html(init: HTML.() -> Unit): HTML {
    val html = HTML()  // 建立接收者物件
    html.init()        // 將接收者物件傳遞給 Lambda
    return html
}

html {       // 帶有接收者的 Lambda 從這裡開始
    body()   // 在接收者物件上呼叫方法
}
```
