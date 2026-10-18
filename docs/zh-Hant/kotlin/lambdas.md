[//]: # (title: 高階函式與 Lambda)

Kotlin 函式是[一等公民](https://en.wikipedia.org/wiki/First-class_function)，這意味著它們可以儲存在變數和資料結構中，並且可以作為引數傳遞給其他[高階函式](#higher-order-functions)或從中傳回。你可以對函式執行適用於其他非函式值的任何操作。

為了實現這一點，Kotlin 作為一種靜態型別程式語言，使用了一系列[函式型別](#function-types)來表示函式，並提供了一組專門的語言結構，例如 [Lambda 運算式](#lambda-expressions-and-anonymous-functions)。

## 高階函式 {id="higher-order-functions"}

高階函式是將函式作為參數或傳回函式的函式。

高階函式的一個絕佳範例是針對集合的[函式程式設計慣用語 `fold`](https://en.wikipedia.org/wiki/Fold_(higher-order_function))。它接受一個初始累加值和一個組合函式，並透過依序將目前的累加值與每個集合元素相結合來建構其傳回值，每次都會替換累加值：

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

在上面的程式碼中，`combine` 參數具有[函式型別](#function-types) `(R, T) -> R`，因此它接受一個帶有兩個型別分別為 `R` 和 `T` 的引數並傳回型別為 `R` 的值的函式。它在 `for` 迴圈內[被呼叫](#invoking-a-function-type-instance)，然後傳回值被指派給 `accumulator`。

若要呼叫 `fold`，你需要將一個[函式型別的執行個體](#instantiating-a-function-type)作為引數傳遞給它，而 Lambda 運算式（[下文有更詳細的說明](#lambda-expressions-and-anonymous-functions)）在高階函式呼叫點被廣泛用於此目的：

```kotlin
fun main() {
    //sampleStart
    val items = listOf(1, 2, 3, 4, 5)
    
    // Lambda 是包含在花括號內的程式碼區塊。
    items.fold(0, { 
        // 當 Lambda 有參數時，參數放在最前面，後面跟著 '->'
        acc: Int, i: Int -> 
        print("acc = $acc, i = $i, ") 
        val result = acc + i
        println("result = $result")
        // Lambda 中的最後一個運算式被視為傳回值：
        result
    })
    
    // 如果可以推論出參數型別，則 Lambda 中的參數型別是選用的：
    val joinedToString = items.fold("Elements:", { acc, i -> acc + " " + i })
    
    // 函式參照也可用於高階函式呼叫：
    val product = items.fold(1, Int::times)
    //sampleEnd
    println("joinedToString = $joinedToString")
    println("product = $product")
}
```
{kotlin-runnable="true"}

## 函式型別 {id="function-types"}

Kotlin 使用函式型別（例如 `(Int) -> String`）來宣告處理函式的宣告：`val onClick: () -> Unit = ...`。

這些型別有一種特殊的表示法，對應於函式的簽章——其參數和傳回值：

* 所有函式型別都具有一個圓括號括起來的參數型別清單和一個傳回型別：`(A, B) -> C` 表示接受兩個型別為 `A` 和 `B` 的引數並傳回型別為 `C` 的值的函式型別。參數型別清單可以為空，例如 `() -> A`。[`Unit` 傳回型別](functions.md#unit-returning-functions)不能省略。

* 函式型別可以選擇性地具有額外的*接收者*（receiver）型別，該型別在標記法的點號之前指定：型別 `A.(B) -> C` 表示可以在接收者物件 `A` 上呼叫、帶有參數 `B` 且傳回值 `C` 的函式。[帶有接收者的函式常值](#function-literals-with-receiver)通常與這些型別一起使用。

* [暫停函式](coroutines-basics.md)屬於一種特殊的函式型別，其標記法中包含 *suspend* 修飾詞，例如 `suspend () -> Unit` 或 `suspend A.(B) -> C`。

函式型別標記法可以選擇性地包含函式參數的名稱：`(x: Int, y: Int) -> Point`。這些名稱可用於記錄參數的含義。

若要指定函式型別為[可 null](null-safety.md#nullable-types-and-non-nullable-types)，請使用圓括號如下所示：`((Int, Int) -> Int)?`。

函式型別也可以使用圓括號組合：`(Int) -> ((Int) -> Unit)`。

> 箭頭標記法是右結合的，`(Int) -> (Int) -> Unit` 等同於前一個範例，但不同於 `((Int) -> (Int)) -> Unit`。
>
{style="note"}

你也可以使用[型別別名](type-aliases.md)為函式型別提供替代名稱：

```kotlin
typealias ClickHandler = (Button, ClickEvent) -> Unit
```

### 具現化函式型別 {id="instantiating-a-function-type"}

有幾種方法可以取得函式型別的執行個體：

* 使用函式常值內的程式碼區塊，形式如下之一：
    * [Lambda 運算式](#lambda-expressions-and-anonymous-functions)：`{ a, b -> a + b }`，
    * [匿名函式](#anonymous-functions)：`fun(s: String): Int { return s.toIntOrNull() ?: 0 }`

  [帶有接收者的函式常值](#function-literals-with-receiver)可用作帶有接收者的函式型別的值。

* 使用對現有宣告的可呼叫參照：
    * 頂層、區域、成員或擴充[函式](#function-references)：`::isOdd`、`String::toInt`，
    * 頂層、成員或擴充[屬性](#property-references)：`List<Int>::size`，
    * [建構函式](#constructor-references)：`::Regex`

  這些包括指向特定執行個體成員的[綁定可呼叫參照](#bound-and-unbound-references)：`foo::toString`。

* 使用實作了作為介面的函式型別的自訂類別執行個體：

```kotlin
class IntTransformer: (Int) -> Int {
    override operator fun invoke(x: Int): Int = TODO()
}

val intFunction: (Int) -> Int = IntTransformer()
```

如果有足夠的資訊，編譯器可以推論變數的函式型別：

```kotlin
val a = { i: Int -> i + 1 } // 推論型別為 (Int) -> Int
```

帶有和不帶有接收者的函式型別的*非常值*值是可以互換的，因此接收者可以替代第一個參數，反之亦然。例如，型別為 `(A, B) -> C` 的值可以傳遞或指派給預期型別為 `A.(B) -> C` 的地方，反之亦然：

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

> 即使變數是使用對擴充函式的參照初始化的，預設情況下也會推論為沒有接收者的函式型別。
> 若要變更此行為，請明確指定變數型別。
>
{style="note"}

### 呼叫函式型別執行個體 {id="invoking-a-function-type-instance"}

函式型別的值可以透過使用其 [`invoke(...)` 運算子](operator-overloading.md#invoke-operator)來呼叫：`f.invoke(x)` 或簡寫為 `f(x)`。

如果該值具有接收者型別，則接收者物件應作為第一個引數傳遞。另一種呼叫帶有接收者的函式型別的值的方法是在其前面加上接收者物件，就好像該值是一個[擴充函式](extensions.md)一樣：`1.foo(2)`。

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
    println(2.intPlus(3)) // 類似擴充函式的呼叫
    //sampleEnd
}
```
{kotlin-runnable="true"}

### 內聯函式 {id="inline-functions"}

有時對高階函式使用提供靈活控制流的[內聯函式](inline-functions.md)是很有益的。

## 可呼叫參照 {id="callable-reference"}

可呼叫參照可讓你參照函式、屬性或建構函式，而無需立即呼叫或存取它。你可以將參照儲存在變數中、將其傳遞給另一個函式，或稍後再進行呼叫。

若要建立可呼叫參照，請使用 `::` 運算子：

```kotlin
fun isOdd(number: Int) = number % 2 != 0

fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)

    // 傳遞對 isOdd() 的參照
    println(numbers.filter(::isOdd))
    // [1, 3, 5]
}
```
{kotlin-runnable="true"}

可呼叫參照物件實作了[反射](reflection.md)介面，例如 `KFunction` 和 `KProperty`。

### 函式參照 {id="function-references"}

使用函式參照將現有函式作為值進行傳遞或儲存。若要參照頂層或區域具名函式，請使用 `::functionName`：

```kotlin
fun calculateLength(text: String) = text.length

fun main() {
    val length: (String) -> Int = ::calculateLength

    println(length("Kotlin"))
    // 6
    println(::calculateLength.name)
    // calculateLength
}
```
{kotlin-runnable="true"}

函式參照屬於 [`KFunction<out R>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-function/) 的子型別之一，取決於參數數量。例如 `KFunction3<T1, T2, T3, R>`。

如果多個函式同名，編譯器會使用預期的函式型別來選擇相符的多載：

```kotlin
fun parse(value: String) = "String: $value"
fun parse(value: Int) = "Int: $value"

fun main() {
    val parseString: (String) -> String = ::parse
    val parseInt: (Int) -> String = ::parse

    println(parseString("Kotlin"))
    // String: Kotlin
    println(parseInt(22))
    // Int: 22
}
```
{kotlin-runnable="true"}

### 屬性參照 {id="property-references"}

當你需要傳遞靜態檢查的屬性存取子時，請使用屬性參照。例如，另一個函式可以使用該參照來選擇要讀取或更新的值。

若要建立屬性參照，請使用 `::` 運算子。你可以透過將參照作為函式呼叫或使用 `get()` 函式來讀取該屬性。可變屬性參照還提供了 `set()`：

```kotlin
var greeting = "Hello"

class User(var name: String)

fun main() {
    // 頂層屬性參照
    // 不需要接收者
    println(::greeting.get())
    // Hello

    ::greeting.set("Hi")
    println(greeting)
    // Hi

    val user = User("Jane")

    // 未綁定的成員屬性參照
    // 明確傳遞 User 接收者
    val unboundName = User::name
    println(unboundName.get(user))
    // Jane

    unboundName.set(user, "Jane Doe")
    println(user.name)
    // Jane Doe

    // 已綁定的成員屬性參照
    // 捕獲 user 接收者
    val boundName = user::name

    println(boundName.get())
    // Jane Doe

    boundName.set("Jane Smith")
    println(user.name)
    // Jane Smith
}
```
{kotlin-runnable="true"}

屬性參照型別指明了需要多少個接收者：

* [`KProperty0<V>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-property0/) 不需要接收者。這包括頂層屬性和綁定到物件的屬性。
* [`KProperty1<T, V>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-property1/) 需要一個接收者。
* [`KProperty2<D, E, V>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-property2/) 需要兩個接收者，表示成員擴充屬性：一個接收者用於包含類別，另一個用於擴充型別。

可變屬性具有對應的 [`KMutableProperty0`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-mutable-property0/)、[`KMutableProperty1`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-mutable-property1/) 和 [`KMutableProperty2`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-mutable-property2/) 型別。通常，你不需要明確寫出這些型別，因為編譯器會從參照中推論出它們。

> 若要在執行階段發現屬性，請使用 [Kotlin 反射](reflection.md)。
>
{style="tip"}

### 建構函式參照 {id="constructor-references"}

當 API 需要工廠且現有建構函式已具有所需的參數和傳回型別時，請使用建構函式參照。建構函式參照讓 API 能夠透過函式值建立新執行個體。

若要建立對建構函式的參照，請使用 `::ClassName`：

```kotlin
data class User(val name: String, val age: Int)

fun createUser(factory: (String, Int) -> User): User =
    factory("Jane Doe", 22)

fun main() {
    val user = createUser(::User)
    println(user)
    // User(name=Jane Doe, age=22)
}
```
{kotlin-runnable="true"}

對建構函式的可呼叫參照型別是 [`KFunction<out R>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-function/) 的子型別之一，具體取決於參數數量。

### 綁定與未綁定參照 {id="bound-and-unbound-references"}

對成員的參照可以是*綁定*（bound）或*未綁定*（unbound）的：

* 綁定參照會捕獲特定執行個體，並且只需要函式宣告的引數。當每次呼叫都應使用同一個物件時，請使用它。
* 未綁定參照未附加到執行個體，因此其函式型別包含接收者。當呼叫者應提供該物件時，請使用它。

```kotlin
class User(val name: String) {
    fun hasName(prefix: String) = name.startsWith(prefix)
}

fun main() {
    // 未綁定參照的第一個參數是 User 接收者
    val unbound: (User, String) -> Boolean = User::hasName
    println(unbound(User("Jane"), "Ja"))
    // true

    val jane = User("Jane")

    // 參照將 jane 捕獲為其接收者
    val bound: (String) -> Boolean = jane::hasName
    println(bound("Doe"))
    // false
}
```
{kotlin-runnable="true"}

擴充函式遵循相同的規則。例如，`String::isBlank` 是未綁定的，需要一個 `String` 接收者。`"Kotlin"::isBlank` 是綁定的，不接受任何參數。

## Lambda 運算式與匿名函式 {id="lambda-expressions-and-anonymous-functions"}

Lambda 運算式和匿名函式都是*函式常值*（function literals）。函式常值是未宣告但作為運算式立即傳遞的函式。考慮以下範例：

```kotlin
max(strings, { a, b -> a.length < b.length })
```

函式 `max` 是一個高階函式，因為它接受一個函式值作為其第二個引數。第二個引數是一個本身就是函式的運算式，稱為函式常值，它等同於以下具名函式：

```kotlin
fun compare(a: String, b: String): Boolean = a.length < b.length
```

你也可以使用 `suspend` 關鍵字建立*暫停 Lambda 運算式*。暫停 Lambda 具有函式型別 `suspend () -> Unit`，並且可以呼叫其他暫停函式：

```kotlin
val suspendingTask = suspend { doSuspendingWork() }
```

### Lambda 運算式語法 {id="lambda-expression-syntax"}

Lambda 運算式的完整語法形式如下：

```kotlin
val sum: (Int, Int) -> Int = { x: Int, y: Int -> x + y }
```

* Lambda 運算式始終用花括號包裹。
* 完整語法形式中的參數宣告放在花括號內，並具有選用的型別註解。
* 主體放在 `->` 之後。
* 如果 Lambda 的推論傳回型別不是 `Unit`，則 Lambda 主體內的最後一個（或可能是單個）運算式將被視為傳回值。

如果省略所有選用註解，剩下的部分如下所示：

```kotlin
val sum = { x: Int, y: Int -> x + y }
```

### 傳遞尾隨 Lambda {id="passing-trailing-lambdas"}

根據 Kotlin 慣例，如果函式的最後一個參數是函式，則作為相應引數傳遞的 Lambda 運算式可以放置在圓括號之外：

```kotlin
val product = items.fold(1) { acc, e -> acc * e }
```

這種語法也稱為*尾隨閉包*（trailing lambda）。

如果 Lambda 是該呼叫中的唯一引數，則可以完全省略圓括號：

```kotlin
run { println("...") }
```

### it：單一參數的隱式名稱 {id="it-implicit-name-of-a-single-parameter"}

Lambda 運算式只有一個參數是非常常見的。

如果編譯器可以在沒有任何參數的情況下剖析簽章，則不需要宣告該參數，並且可以省略 `->`。該參數將以名稱 `it` 隱式宣告：

```kotlin
ints.filter { it > 0 } // 此常值的型別為 '(it: Int) -> Boolean'
```

### 從 Lambda 運算式傳回值 {id="returning-a-value-from-a-lambda-expression"}

你可以使用[限定返回](returns.md#return-to-labels)語法從 Lambda 明確傳回值。否則，將隱式傳回最後一個運算式的值。

因此，以下兩個程式碼片段是等效的：

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

這個慣例與[將 Lambda 運算式傳遞到圓括號之外](#passing-trailing-lambdas)相結合，允許編寫 [LINQ 風格](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/linq/)的程式碼：

```kotlin
strings.filter { it.length == 5 }.sortedBy { it }.map { it.uppercase() }
```

### 未使用變數的底線 {id="underscore-for-unused-variables"}

如果 Lambda 參數未使用，你可以放置底線而不是其名稱：

```kotlin
map.forEach { (_, value) -> println("$value!") }
```

### Lambda 中的解構 {id="destructuring-in-lambdas"}

Lambda 中的解構被描述為[解構宣告](destructuring-declarations.md#destructuring-in-lambdas)的一部分。

### 匿名函式 {id="anonymous-functions"}

上面的 Lambda 運算式語法缺少了一項功能——指定函式傳回型別的能力。在大多數情況下，這是不必要的，因為傳回型別可以自動推論。但是，如果你確實需要明確指定它，可以使用另一種語法：*匿名函式*。

```kotlin
fun(x: Int, y: Int): Int = x + y
```

匿名函式看起來非常類似於常規函式宣告，只是省略了其名稱。其主體可以是運算式（如上所示）或程式碼區塊：

```kotlin
fun(x: Int, y: Int): Int {
    return x + y
}
```

參數和傳回型別的指定方式與常規函式相同，不同之處在於如果可以從上下文推論出參數型別，則可以省略參數型別：

```kotlin
ints.filter(fun(item) = item > 0)
```

匿名函式的傳回型別推論與正常函式完全相同：具有運算式主體的匿名函式會自動推論傳回型別，但具有區塊主體的匿名函式則必須明確指定傳回型別（否則假定為 `Unit`）。

> 當將匿名函式作為參數傳遞時，請將它們放在圓括號內。允許將函式留在圓括號外的簡寫語法僅適用於 Lambda 運算式。
>
{style="note"}

Lambda 運算式和匿名函式之間的另一個區別是[非區域返回](inline-functions.md#returns)的行為。沒有標籤的 `return` 陳述式總是從使用 `fun` 關鍵字宣告的函式傳回。這意味著 Lambda 運算式內的 `return` 將從封閉函式傳回，而匿名函式內的 `return` 將從匿名函式本身傳回。

### 閉包 {id="closures"}

Lambda 運算式或匿名函式（以及[區域函式](functions.md#local-functions)和[物件運算式](object-declarations.md#object-expressions)）可以存取其*閉包*，其中包括在外層作用域中宣告的變數。在閉包中捕獲的變數可以在 Lambda 中進行修改：

```kotlin
var sum = 0
ints.filter { it > 0 }.forEach {
    sum += it
}
print(sum)
```

### 帶有接收者的函式常值 {id="function-literals-with-receiver"}

帶有接收者的[函式型別](#function-types)（例如 `A.(B) -> C`）可以使用特殊形式的函式常值進行具現化——帶有接收者的函式常值。

如上所述，Kotlin 提供了在提供*接收者物件*的同時[呼叫帶有接收者的函式型別執行個體](#invoking-a-function-type-instance)的能力。

在函式常值的主體內，傳遞給呼叫的接收者物件會變成*隱式* `this`，因此你可以存取該接收者物件的成員而無需任何額外的限定詞，或者使用 [`this` 運算式](this-expressions.md)存取接收者物件。

此行為類似於[擴充函式](extensions.md)，擴充函式也允許你在函式主體內存取接收者物件的成員。

以下是帶有接收者的函式常值及其型別的範例，其中在接收者物件上呼叫了 `plus`：

```kotlin
val sum: Int.(Int) -> Int = { other -> plus(other) }
```

匿名函式語法允許你直接指定函式常值的接收者型別。如果你需要宣告帶有接收者的函式型別的變數，並在稍後使用它，這會非常有用。

```kotlin
val sum = fun Int.(other: Int): Int = this + other
```

當可以從上下文推論出接收者型別時，Lambda 運算式可以用作帶有接收者的函式常值。其用法最重要的範例之一是[型別安全建構器](type-safe-builders.md)：

```kotlin
class HTML {
    fun body() { ... }
}

fun html(init: HTML.() -> Unit): HTML {
    val html = HTML()  // 建立接收者物件
    html.init()        // 將接收者物件傳遞給 lambda
    return html
}

html {       // 帶有接收者的 lambda 從這裡開始
    body()   // 在接收者物件上呼叫方法
}
```