[//]: # (title: 函式)

在 Kotlin 中宣告函式：
* 使用 `fun` 關鍵字。
* 在圓括號 `()` 中指定參數。
* 如果需要，包含[傳回型別](#return-types)。

例如：

```kotlin
//sampleStart
// 'double' 是函式的名稱
// 'x' 是 Int 型別的參數
// 預期的傳回值也是 Int 型別
fun double(x: Int): Int {
    return 2 * x
}
//sampleEnd

fun main() {
    println(double(5))
    // 10
}
```
{kotlin-runnable="true" validate="false" id="kotlin-function-double"}

## 函式用法 {id="function-usage"}

呼叫函式時採用標準方式：

```kotlin
val result = double(2)
```

若要呼叫[成員](classes.md)或[擴充函式](extensions.md#extension-functions)，請使用句點 `.`：

```kotlin
// 建立 Stream 類別的執行個體並呼叫 read()
Stream().read()
```

### 參數 {id="parameters"}

使用 Pascal 表示法宣告函式參數：`name: Type`。
參數之間必須使用逗號分隔，且必須明確為每個參數指定型別：

```kotlin
fun powerOf(number: Int, exponent: Int): Int { /*...*/ }
```

當你將物件傳遞給函式時，編譯器會傳遞該物件參照的複本。
複製後的參照指向同一個物件，因此函式可以修改該物件的可變狀態。

函式參數在函式主體內是唯讀的（隱式宣告為 `val`），因此你無法重新指派它們：

```kotlin
class Counter(var value: Int)

fun reset(counter: Counter) {
    counter.value = 0    // 允許：修改物件
    counter = Counter(0) // 錯誤：無法重新指派 'val'
}
```

宣告函式參數時，你可以使用[尾隨逗號](coding-conventions.md#trailing-commas)：

```kotlin
fun powerOf(
    number: Int,
    exponent: Int, // 尾隨逗號
) { /*...*/ }
```

尾隨逗號有助於重構和程式碼維護：
你可以在宣告中移動參數位置，而無需擔心哪一個參數會排在最後。

> Kotlin 函式可以接收其他函式作為參數 — 也可以作為引數傳遞。
> 欲了解更多資訊，請參閱 [](lambdas.md)。
> 
{style="note"}

### 具有預設值的參數 {id="parameters-with-default-values"}

你可以透過為函式參數指定預設值來將其設為選填。
當你呼叫函式且未提供對應該參數的引數時，Kotlin 會使用該預設值。
具有預設值的參數也稱為*選填參數*（optional parameters）。

選填參數減少了對多個多載的需求，因為你不必為了允許跳過具有合理預設值的參數而宣告不同版本的函式。

在參數宣告後附加 `=` 即可設定預設值：

```kotlin
fun read(
    b: ByteArray,
    // 'off' 的預設值為 0
    off: Int = 0,
    // 'len' 的預設值是根據
    // 'b' 陣列的大小計算得出
    len: Int = b.size,
) { /*...*/ }
```

當你在**沒有**預設值的參數之前宣告**具有**預設值的參數時，
你只能透過[具名引數](#named-arguments)來使用該預設值：

```kotlin
fun greeting(
    userId: Int = 0,
    message: String,
) { /*...*/ }

fun main() {
    // 使用 0 作為 'userId' 的預設值
    greeting(message = "Hello!")
    
    // 錯誤：未傳遞參數 'message' 的值
    greeting("Hello!")
}
```
{kotlin-runnable="true" validate="false" id="default-before-ordinary"}

[尾隨 Lambda](lambdas.md#passing-trailing-lambdas) 是此規則的例外，
因為最後一個參數必須對應傳遞的函式：

```kotlin
fun main () {
//sampleStart    
fun greeting(
    userId: Int = 0,
    message: () -> Unit,
)
{ println(userId)
  message() }
    
// 使用 'userId' 的預設值
greeting() { println ("Hello!") }
// 0
// Hello!
//sampleEnd
}
```
{kotlin-runnable="true" id="default-before-trailing-lambda"}

[覆寫方法](inheritance.md#overriding-methods)一律會使用基底方法的預設參數值。
當你覆寫具有預設參數值的方法時，必須從簽章中省略預設參數值：

```kotlin
open class Shape {
    open fun draw(width: Int = 10, height: Int = 5) { /*...*/ }
}

class Rectangle : Shape() {
    // 這裡不允許指定預設值
    // 但該函式預設也會將 'width' 設為 10，
    // 'height' 設為 5。
    override fun draw(width: Int, height: Int) { /*...*/ }
}
```

#### 非常數運算式作為預設值 {id="non-constant-expressions-as-default-values"}

你可以為參數指派非常數的預設值。
例如，預設值可以是函式呼叫的結果，或者是使用其他引數的值所進行的計算，
例如本例中的 `len` 參數：

```kotlin
fun read(
    b: ByteArray,
    off: Int = 0,
    len: Int = b.size,
) { /*...*/ }
```

參照其他參數值的參數必須在順序上宣告於後。
在此範例中，`len` 必須在 `b` 之後宣告。

一般來說，你可以將任何運算式指派為參數的預設值。
然而，只有在呼叫函式時**未提供**對應參數且需要指派預設值時，才會評估預設值。
例如，此函式僅在呼叫時未傳入 `print` 參數時才會印出一行文字：

```kotlin
fun main() {
//sampleStart
    fun read(
        b: Int,
        print: Unit? = println("No argument passed for 'print'")
    ) { println(b) }
    
    // 印出 "No argument passed for 'print'"，然後印出 "1"
    read(1)
    // 僅印出 "1"
    read(1, null)
    //sampleEnd
}
```
{kotlin-runnable="true" id="non-constant-default"}

如果函式宣告中的最後一個參數具有函式型別，
你可以將對應的 [Lambda](lambdas.md#lambda-expression-syntax) 引數作為具名引數傳遞，或傳遞在[圓括號外](lambdas.md#passing-trailing-lambdas)：

```kotlin
fun main() {
    //sampleStart
    fun log(
        level: Int = 0,
        code:  Int = 1,
        action: () -> Unit,
    ) { println (level)
        println (code)
        action() }
    
    // 為 'level' 傳遞 1，並使用 'code' 的預設值 1
    log(1) { println("Connection established") }
    
    // 兩者皆使用預設值：'level' 為 0，'code' 為 1
    log(action = { println("Connection established") })
    
    // 等同於前一個呼叫，兩者皆使用預設值
    log { println("Connection established") }
    //sampleEnd
}
```
{kotlin-runnable="true" id="lambda-outside-parentheses"}

### 具名引數 {id="named-arguments"}

呼叫函式時，你可以為其中一個或多個引數命名。
當函式呼叫有多個引數時，這會很有幫助。
在這種情況下，很難將值與引數關聯起來，特別是在值為 `null` 或布林值時。

在函式呼叫中使用具名引數時，你可以按任意順序排列它們。

以具有 4 個具有預設值引數的 `reformat()` 函式為例：

```kotlin
fun reformat(
    str: String,
    normalizeCase: Boolean = true,
    upperCaseFirstLetter: Boolean = true,
    divideByCamelHumps: Boolean = false,
    wordSeparator: Char = ' ',
) { /*...*/ }
```

呼叫此函式時，你可以為部分引數命名：

```kotlin
reformat(
    "String!",
    normalizeCase = false,
    upperCaseFirstLetter = false,
    divideByCamelHumps = true,
    '_'
)
```

你可以跳過所有具有預設值的引數：

```kotlin
reformat("This is a long String!")
```

你也可以跳過*某些*具有預設值的引數，而不是全部省略。
然而，在跳過第一個引數之後，你必須為後續的所有引數命名：

```kotlin
reformat(
    "This is a short String!",
    upperCaseFirstLetter = false,
    wordSeparator = '_'
)
```

你可以透過為對應的引數命名來傳遞[可變參數](#variable-number-of-arguments-varargs)（`vararg`）。
在此範例中，它是一個陣列：

```kotlin
fun mergeStrings(vararg strings: String) { /*...*/ }

mergeStrings(strings = arrayOf("a", "b", "c"))
```

<!-- Rationale for named arguments interaction with varargs is here https://youtrack.jetbrains.com/issue/KT-52505#focus=Comments-27-6147916.0-0 -->

> 在 JVM 上呼叫 Java 函式時，你無法使用具名引數語法，因為 Java 位元組碼不一定會保留函式參數的名稱。
>
{style="note"}

### 傳回型別 {id="return-types"}

當你宣告具有區塊主體的函式時（將指令放在花括號 `{}` 內），必須一律明確指定傳回型別。唯一的例外是當函式傳回 `Unit` 時，[在此情況下指定傳回型別是選填的](#unit-returning-functions)。

Kotlin 不會為具有區塊主體的函式推論傳回型別。它們的控制流程可能很複雜，這使得讀者甚至編譯器有時都很難確定傳回型別。然而，如果你沒有指定傳回型別，Kotlin 可以為[單一運算式函式](#single-expression-functions)推論傳回型別。

Kotlin 函式傳回單一值，但該值可以包含多個資料項目。有關表示這些值的方式，請參閱[傳回多個值](#return-multiple-values)。

#### 傳回多個值 {id="return-multiple-values"}

當你需要傳回多個具有不同意義的相關值時，請宣告一個[資料類別](data-classes.md)，即使你只在一個函式中使用它：

```kotlin
data class OrderSummary(
    val subtotal: Double,
    val tax: Double,
)

fun calculateOrderSummary(prices: List<Double>): OrderSummary {
    val subtotal = prices.sum()
    val tax = subtotal * 0.2
    return OrderSummary(subtotal, tax)
}

fun main() {
    val summary = calculateOrderSummary(listOf(12.50, 8.00, 4.50))

    println(summary.subtotal)
    // 25.0
    println(summary.tax)
    // 5.0
}
```
{kotlin-runnable="true" id="return-multiple-values-data-class"}

當你需要傳回多個具有不同意義的值時，資料類別的效果很好。如果傳回的值屬於同種類型，且你想要將它們作為一組來處理，請考慮改為傳回集合：

```kotlin
data class Person(val name: String)

val friendGroups = listOf(
    listOf(Person("Alice"), Person("Bob")),
    listOf(Person("Charlie"), Person("Diana"), Person("Eve")),
    listOf(Person("Frank"))
)

fun findLargestGroupOfFriends(): List<Person> {
    return friendGroups.maxByOrNull { it.size } ?: emptyList()
}

fun main() {
    val largestGroup = findLargestGroupOfFriends()

    println(largestGroup.map { it.name })
    // [Charlie, Diana, Eve]
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.4" id="return-multiple-values-list"}

如果你需要傳回固定數量的數值，也可以使用標準函式庫中的 [`Pair`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-pair/) 或 [`Triple`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-triple/) 資料類別。然而，它們的屬性具有諸如 `first`、`second` 和 `third` 等通用名稱，這可能會使結果難以理解。

例如，雖然 `calculateOrderTotals()` 函式傳回 `Pair`，但並不明確每個 `Double` 代表什麼意思：

```kotlin
fun calculateOrderTotals(prices: List<Double>): Pair<Double, Double> {
    val subtotal = prices.sum()
    val tax = subtotal * 0.2
    return Pair(subtotal, tax)
}

fun main() {
    val totals = calculateOrderTotals(listOf(12.50, 8.00, 4.50))

    // 'first' 代表什麼？
    println(totals.first)
    // 25.0
  
    // 'second' 代表什麼？
    println(totals.second)
    // 5.0
}
```
{kotlin-runnable="true" id="return-multiple-values-pair"}

對於具有不同意義的結果，建議使用具有描述性屬性名稱的資料類別，如 [`OrderSummary` 資料類別範例](#return-multiple-values)中所示。

### 單一運算式函式 {id="single-expression-functions"}

當函式主體由單一運算式組成時，你可以省略花括號，並在 `=` 符號之後指定主體：

```kotlin
fun double(x: Int): Int = x * 2
```

多數情況下，你不必明確宣告[傳回型別](#return-types)：

```kotlin
// 編譯器推論該函式傳回 Int
fun double(x: Int) = x * 2
```

編譯器在從單一運算式推論傳回型別時，有時可能會遇到問題。
在這些情況下，你應該明確加上傳回型別。
例如，遞迴或互相遞迴（彼此互相呼叫）的函式，以及包含無型別運算式（例如 `fun empty() = null`）的函式，一律都需要傳回型別。

當你確實使用推論傳回型別時，
請務必檢查實際結果，因為編譯器推論出的型別對你來說可能實用性較低。
在上述範例中，如果你希望 `double()` 函式傳回 `Number` 而非 `Int`，
則必須明確宣告這一點。

如果你在運算式主體內使用 `return` 陳述式，必須明確指定傳回型別：

```kotlin
fun getDisplayNameOrDefault(userId: String?): String =
    getDisplayName(userId ?: return "default")
```

### 傳回 Unit 的函式 {id="unit-returning-functions"}

如果函式具有區塊主體且未明確指定傳回型別，編譯器會將其傳回型別推論為 `Unit`。

`Unit` 是一種只有一個值的型別，該值也稱為 `Unit`。此值是一個[物件](object-declarations.md)，因此只存在單一的 `Unit` 執行個體。
與其他程式語言中的 `void` 不同，`Unit` 是一個真正的型別，如果你的程式碼需要一個值，可以使用其值。
這樣一來，產生結果的函式與僅執行操作的函式就能符合相同的型別模型：兩者都傳回一個值，並且可以由函式型別表示或與泛型 API 一起使用。

你不需要在函式宣告中指定 `Unit` 或明確傳回其值。但是，當 `Unit` 作為函式型別的一部分時（例如 `() -> Unit`），你必須明確指定它。例如，讓我們宣告一個不顯式傳回 `Unit` 的 `printHello()` 函式：

```kotlin
// 函式型別參數 ('action') 的宣告仍然
// 需要明確的傳回型別
fun printHello(name: String?, action: () -> Unit) {
    if (name != null)
        println("Hello $name")
    else
        println("Hi there!")

    action()
}

fun main() {
    printHello("Kodee") {
        println("This runs after the greeting.")
        // Hello Kodee
        // This runs after the greeting.
    }

    printHello(null) {
        println("No name provided, but action still runs.")
        // Hi there!
        // No name provided, but action still runs.
    }
}
```
{kotlin-runnable="true" validate="false" id="return-unit-implicit"}

這等同於以下更詳細的宣告方式，該方式明確指定了傳回型別與值：

```kotlin
//sampleStart
// 在 `() -> Unit` 函式型別中必須包含 `Unit`，
// 但宣告 `: Unit` 作為 `printHello()` 的傳回型別則是選填的
fun printHello(name: String?, action: () -> Unit): Unit {
    if (name != null)
        println("Hello $name")
    else
        println("Hi there!")

    action()
    // 明確傳回 `Unit` 值是選填的
    return Unit
}
//sampleEnd
fun main() {
    printHello("Kodee") {
        println("This action runs when a name is given.")
        // Hello Kodee
        // This action runs when a name is given.
    }
    printHello(null) {
        println("This action runs when no name is provided.")
        // Hi there!
        // This action runs when no name is provided.
    }
}
```
{kotlin-runnable="true" validate="false" id="return-unit-explicit"}

### 可變參數 (varargs) {id="variable-number-of-arguments-varargs"}

若要傳遞可變數量的引數給函式，可以使用 `vararg` 修飾詞標記其參數之一（通常是最後一個）。
在函式內部，你可以將型別為 `T` 的 `vararg` 參數當作 `T` 的陣列使用：

```kotlin
fun <T> asList(vararg ts: T): List<T> {
    val result = ArrayList<T>()
    for (t in ts) // ts 是一個 Array
        result.add(t)
    return result
}
```

接著你可以傳遞可變數量的引數給該函式：

```kotlin
fun <T> asList(vararg ts: T): List<T> {
    val result = ArrayList<T>()
    for (t in ts) // ts 是一個 Array
        result.add(t)
    return result
}

fun main() {
    //sampleStart
    val list = asList(1, 2, 3)
    println(list)
    // [1, 2, 3]
    //sampleEnd
}
```
{kotlin-runnable="true" validate="false" id="varargs-aslist"}

只能將一個參數標記為 `vararg`。
如果你在參數清單中非最後的位置宣告了 `vararg` 參數，則後續參數的值必須使用具名引數傳遞。
如果參數具有函式型別，你也可以透過將 Lambda 置於圓括號外來傳遞其值。

呼叫 `vararg` 函式時，你可以個別傳遞引數，如 `asList(1, 2, 3)` 範例所示。
如果你已經有一個陣列，並希望將其內容作為 `vararg` 參數或作為其中的一部分傳遞給函式，
請使用[展開運算子](arrays.md#pass-variable-number-of-arguments-to-a-function)，在陣列名稱前加上 `*`：

```kotlin
fun <T> asList(vararg ts: T): List<T> {
    val result = ArrayList<T>()
    for (t in ts)
        result.add(t)
    return result
}

fun main() {
    //sampleStart
    val a = arrayOf(1, 2, 3)

    // 該函式接收陣列 [-1, 0, 1, 2, 3, 4]
    list = asList(-1, 0, *a, 4)

    println(list)
    // [-1, 0, 1, 2, 3, 4]
    //sampleEnd
}
```
{kotlin-runnable="true" validate="false" id="varargs-aslist-with-array"}

如果你想要將[基本型別陣列](arrays.md#primitive-type-arrays)作為 `vararg` 傳遞，
你需要使用 [`.toTypedArray()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/to-typed-array.html) 函式將其轉換為一般（具型別的）陣列：

```kotlin
// 'a' 是一個 IntArray，屬於基本型別陣列
val a = intArrayOf(1, 2, 3)
val list = asList(-1, 0, *a.toTypedArray(), 4)
```

### 中綴表示法 {id="infix-notation"}

你可以使用 `infix` 關鍵字宣告無須圓括號或句點即可呼叫的函式。
這有助於讓程式碼中的簡單函式呼叫更易於閱讀。

```kotlin
infix fun Int.shl(x: Int): Int { /*...*/ }

// 使用一般表示法呼叫函式 
1.shl(2)

// 使用中綴表示法呼叫函式
1 shl 2
```

中綴函式必須符合以下需求：

* 它們必須是類別的成員函數或[擴充函式](extensions.md)。
* 它們必須只有一個參數。
* 該參數不能[接受可變參數](#variable-number-of-arguments-varargs)（`vararg`），且不能有[預設值](#parameters-with-default-values)。

> 中綴函式呼叫的優先順序低於算術運算子、型別轉換和 `rangeTo` 運算子。
> 以下運算式是等價的：
> * `1 shl 2 + 3` 等同於 `1 shl (2 + 3)`
> * `0 until n * 2` 等同於 `0 until (n * 2)`
> * `xs union ys as Set<*>` 等同於 `xs union (ys as Set<*>)`
>
> 另一方面，中綴函式呼叫的優先順序高於布林運算子 `&&` 和 `||`、`is` 與 `in` 檢查，以及某些其他運算子。以下運算式也是等價的：
> * `a && b xor c` 等同於 `a && (b xor c)`
> * `a xor b in c` 等同於 `(a xor b) in c`
>
{style="note"}

請注意，中綴函式一律需要同時指定接收者與參數。
當你使用中綴表示法呼叫目前接收者上的方法時，請明確使用 `this`。
這可確保剖析不會產生歧義。

```kotlin
class MyStringCollection {
    val items = mutableListOf<String>()

    infix fun add(s: String) {
        println("Adding: $s")
        items += s
    }

    fun build() {
        add("first")      // 正確：一般函式呼叫
        this add "second" // 正確：具有明確接收者的中綴呼叫
        // add "third"    // 編譯器錯誤：需要明確的接收者
    }

    fun printAll() = println("Items = $items")
}

fun main() {
    val myStrings = MyStringCollection()
    // 將 "first" 和 "second" 加入清單
    myStrings.build()
      
    myStrings.printAll()
    // Adding: first
    // Adding: second
    // Items = [first, second]
}
```
{kotlin-runnable="true" id="infix-notation-example"}

## 函式作用域 {id="function-scope"}

你可以在檔案頂層宣告 Kotlin 函式，這表示你不需要建立類別來容納函式。
函式也可以在區域宣告，或是作為*成員函數*或*擴充函式*宣告。

### 區域函式 {id="local-functions"}

Kotlin 支援區域函式，即宣告在其他函式內部的函式。
例如，以下程式碼為給定圖形實作深度優先搜尋演算法（Depth-first search）。
外部 `dfs()` 函式內部的區域 `dfs()` 函式用於隱藏實作細節並處理遞迴呼叫：

```kotlin
class Person(val name: String) {
    val friends = mutableListOf<Person>()
}
class SocialGraph(val people: List<Person>)
//sampleStart
fun dfs(graph: SocialGraph) {
    fun dfs(current: Person, visited: MutableSet<Person>) {
        if (!visited.add(current)) return
        println("Visited ${current.name}")
        for (friend in current.friends)
            dfs(friend, visited)
    }
    dfs(graph.people[0], HashSet())
}
//sampleEnd
fun main() {
    val alice = Person("Alice")
    val bob = Person("Bob")
    val charlie = Person("Charlie")
    alice.friends += bob
    bob.friends += charlie
    charlie.friends += alice
    val network = SocialGraph(listOf(alice, bob, charlie))
    dfs(network)
}
```
{kotlin-runnable="true" id="local-functions-dfs"}

區域函式可以存取外層函式的區域變數（閉包）。
在上述情況下，`visited` 函式參數可以作為區域變數：

```kotlin
class Person(val name: String) {
    val friends = mutableListOf<Person>()
}
class SocialGraph(val people: List<Person>)
//sampleStart
fun dfs(graph: SocialGraph) {
    val visited = HashSet<Person>()
    fun dfs(current: Person) {
        if (!visited.add(current)) return
        println("Visited ${current.name}")
        for (friend in current.friends)
            dfs(friend)
    }
    dfs(graph.people[0])
}
//sampleEnd
fun main() {
    val alice = Person("Alice")
    val bob = Person("Bob")
    val charlie = Person("Charlie")
    alice.friends += bob
    bob.friends += charlie
    charlie.friends += alice
    val network = SocialGraph(listOf(alice, bob, charlie))
    dfs(network)
}
```
{kotlin-runnable="true" id="local-functions-dfs-with-local-variable"}

### 成員函數 {id="member-functions"}

成員函數是定義在類別或物件內部的函式：

```kotlin
class Sample {
    fun foo() { print("Foo") }
}
```

若要呼叫成員函數，請先寫下執行個體或物件名稱，再加上 `.` 並寫下函式名稱：

```kotlin
// 建立 Stream 類別的執行個體並呼叫 read()
Stream().read()
```

有關類別與覆寫成員的詳細資訊，請參閱[類別](classes.md)與[繼承](classes.md#inheritance)。

## 泛型函式 {id="generic-functions"}

你可以透過在函式名稱前使用尖括號 `<>` 來為函式指定泛型參數：

```kotlin
fun <T> singletonList(item: T): List<T> { /*...*/ }
```

有關泛型函式的詳細資訊，請參閱[泛型](generics.md)。

## 尾端遞迴函式 {id="tail-recursive-functions"}

Kotlin 支援一種稱為[尾端遞迴](https://en.wikipedia.org/wiki/Tail_call)的函式語言程式設計風格。
對於某些通常會使用迴圈的演算法，你可以改用遞迴函式，而沒有堆疊溢位的風險。
當函式標記有 `tailrec` 修飾詞並符合所需的形式條件時，編譯器會最佳化遞迴，改為產生一個快速且高效的迴圈版本：

```kotlin
import kotlin.math.cos
import kotlin.math.abs

// 任意「足夠好」的精準度
val eps = 1E-10

tailrec fun findFixPoint(x: Double = 1.0): Double =
    if (abs(x - cos(x)) < eps) x else findFixPoint(cos(x))
```

此程式碼計算餘弦的不動點（數學常數）。
該函式從 `1.0` 開始重複呼叫 `cos()`，直到結果不再改變為止，
在指定的 `eps` 精度下產生 `0.7390851332151611` 的結果。
這段程式碼等同於以下較傳統的寫法風格：

```kotlin
import kotlin.math.cos
import kotlin.math.abs

// 任意「足夠好」的精準度
val eps = 1E-10

private fun findFixPoint(): Double {
    var x = 1.0
    while (true) {
        val y = cos(x)
        if (abs(x - y) < eps) return x
        x = cos(x)
    }
}
```

只有當函式將呼叫自身作為其最後的操作時，才能套用 `tailrec` 修飾詞。
如果在遞迴呼叫之後還有其他程式碼、在 [`try`/`catch`/`finally` 區塊](exceptions.md#handle-exceptions-using-try-catch-blocks)內，
或是當函式為 [open](inheritance.md) 時，你不能使用尾端遞迴。

**相關主題**：
* [內嵌函式](inline-functions.md)
* [擴充函式](extensions.md)
* [高階函數與 Lambda](lambdas.md)