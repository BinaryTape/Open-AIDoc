[//]: # (title: 函式)

在 Kotlin 中宣告函式：
* 使用 `fun` 關鍵字。
* 在圓括號 `()` 中指定參數。
* 如有需要，包含 [傳回型別](#return-types)。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false" id="kotlin-function-double"}

## 函式用法

使用標準方式呼叫函式：

```kotlin
val result = double(2)
```

要呼叫 [成員](classes.md) 或 [擴充方法](extensions.md#extension-functions)，請使用點號 `.`：

```kotlin
// 建立 Stream 類別的執行個體並呼叫 read()
Stream().read()
```

### 參數

使用 Pascal 表示法宣告函式參數：`name: Type`。
您必須使用逗號分隔參數，並明確給予每個參數一個型別：

```kotlin
fun powerOf(number: Int, exponent: Int): Int { /*...*/ }
```

在函式主體內，收到的引數是唯讀的（隱含宣告為 `val`）：

```kotlin
fun powerOf(number: Int, exponent: Int): Int {
    number = 2 // 錯誤：'val' 不能重新指派。
}
```

宣告函式參數時可以使用 [尾隨逗號](coding-conventions.md#trailing-commas)：

```kotlin
fun powerOf(
    number: Int,
    exponent: Int, // 尾隨逗號
) { /*...*/ }
```

尾隨逗號有助於重構與程式碼維護：
您可以移動宣告中的參數，而不必擔心哪一個會變成最後一個。

> Kotlin 函式可以接收其他函式作為參數，也可以作為引數傳遞。
> 若要了解更多，請參閱 [](lambdas.md)。
> 
{style="note"}

### 具有預設值的參數 {id="parameters-with-default-values"}

您可以透過為函式參數指定預設值，使其成為選用參數。
當您呼叫函式而未提供對應於該參數的引數時，Kotlin 會使用預設值。
具有預設值的參數也稱為「選用參數」。

選用參數減少了對多個多載的需求，因為您不必僅為了允許跳過具有合理預設值的參數而宣告函式的不同版本。

透過在參數宣告後加上 `=` 來設定預設值：

```kotlin
fun read(
    b: ByteArray,
    // 'off' 的預設值為 0
    off: Int = 0,
    // 'len' 的預設值是根據
    // 'b' 陣列的大小計算出來的
    len: Int = b.size,
) { /*...*/ }
```

當您在 **不具** 預設值的參數之前宣告 **具備** 預設值的參數時，
只能透過 [具名引數](#named-arguments) 來使用該預設值：

```kotlin
fun greeting(
    userId: Int = 0,
    message: String,
) { /*...*/ }

fun main() {
    // 將 0 作為 'userId' 的預設值
    greeting(message = "Hello!")
    
    // 錯誤：未傳遞參數 'message' 的值
    greeting("Hello!")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false" id="default-before-ordinary"}

[尾隨 Lambda](lambdas.md#passing-trailing-lambdas) 是此規則的例外，
因為最後一個參數必須對應於傳遞的函式：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="default-before-trailing-lambda"}

[覆寫方法](inheritance.md#overriding-methods) 始終使用基底方法的預設參數值。
當您覆寫具有預設參數值的方法時，必須從簽章中省略預設參數值：

```kotlin
open class Shape {
    open fun draw(width: Int = 10, height: Int = 5) { /*...*/ }
}

class Rectangle : Shape() {
    // 這裡不允許指定預設值
    // 但此函式預設也會使用 10 作為 'width' 並使用 5 作為 'height'。
    override fun draw(width: Int, height: Int) { /*...*/ }
}
```

#### 以非常數運算式作為預設值

您可以為參數指派非常數的預設值。
例如，預設值可以是函式呼叫的結果，或者是使用其他引數值的計算結果，
就像本例中的 `len` 參數：

```kotlin
fun read(
    b: ByteArray,
    off: Int = 0,
    len: Int = b.size,
) { /*...*/ }
```

參考其他參數值的參數必須在順序上後方宣告。
在本例中，`len` 必須在 `b` 之後宣告。

一般來說，您可以指派任何運算式作為參數的預設值。
然而，預設值僅在呼叫函式 **不帶** 對應參數且需要指派預設值時才會求值。
例如，此函式僅在不帶 `print` 參數呼叫時才會印出一行文字：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="non-constant-default"}

如果函式宣告中的最後一個參數具有函式型別，
您可以將對應的 [lambda](lambdas.md#lambda-expression-syntax) 引數作為具名引數傳遞，或 [在圓括號外](lambdas.md#passing-trailing-lambdas) 傳遞：

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
    
    // 為 'level' 傳遞 1，並為 'code' 使用預設值 1
    log(1) { println("Connection established") }
    
    // 同時使用兩個預設值，'level' 為 0，'code' 為 1
    log(action = { println("Connection established") })
    
    // 與前一個呼叫等效，使用兩個預設值
    log { println("Connection established") }
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="lambda-outside-parentheses"}

### 具名引數

在呼叫函式時，您可以為一個或多個引數命名。
當函式呼叫具有許多引數時，這會很有幫助。
在這種情況下，很難將值與引數建立關聯，特別是當值為 `null` 或布林值時。

當您在函式呼叫中使用具名引數時，可以按任何順序排列。

考慮 `reformat()` 函式，它有 4 個帶預設值的引數：

```kotlin
fun reformat(
    str: String,
    normalizeCase: Boolean = true,
    upperCaseFirstLetter: Boolean = true,
    divideByCamelHumps: Boolean = false,
    wordSeparator: Char = ' ',
) { /*...*/ }
```

呼叫此函式時，您可以命名部分引數：

```kotlin
reformat(
    "String!",
    normalizeCase = false,
    upperCaseFirstLetter = false,
    divideByCamelHumps = true,
    '_'
)
```

您可以跳過所有具預設值的引數：

```kotlin
reformat("This is a long String!")
```

您也可以跳過「部分」具預設值的引數，而不是全部省略。
然而，在第一個跳過的引數之後，您必須命名所有後續引數：

```kotlin
reformat(
    "This is a short String!",
    upperCaseFirstLetter = false,
    wordSeparator = '_'
)
```

您可以透過命名對應的引數來傳遞 [可變參數](#variable-number-of-arguments-varargs) (`vararg`)。
在本例中，它是一個陣列：

```kotlin
fun mergeStrings(vararg strings: String) { /*...*/ }

mergeStrings(strings = arrayOf("a", "b", "c"))
```

<!-- Rationale for named arguments interaction with varargs is here https://youtrack.jetbrains.com/issue/KT-52505#focus=Comments-27-6147916.0-0 -->

> 在 JVM 上呼叫 Java 函式時，您不能使用具名引數語法，因為 Java 位元組碼並不總是保留函式參數的名稱。
>
{style="note"}

### 傳回型別

當您宣告具有區塊主體的函式時（透過將指令放在花括號 `{}` 內），
必須一律明確指定傳回型別。
唯一的例外是當它們傳回 `Unit` 時，
[在這種情況下指定傳回型別是選用的](#unit-returning-functions)。

Kotlin 不會為具有區塊主體的函式推論傳回型別。
這些函式的控制流程可能很複雜，這會使傳回型別對於讀者甚至是編譯器都不夠清晰。
然而，如果您不指定，Kotlin 可以為 [單一運算式函式](#single-expression-functions) 推論傳回型別。

### 單一運算式函式

當函式主體由單一運算式組成時，您可以省略花括號，並在 `=` 符號後指定主體：

```kotlin
fun double(x: Int): Int = x * 2
```

大多數情況下，您不必明確宣告 [傳回型別](#return-types)：

```kotlin
// 編譯器推論該函式傳回 Int
fun double(x: Int) = x * 2
```

從單一運算式推論傳回型別時，編譯器有時會遇到問題。
在這種情況下，您應該明確加入傳回型別。
例如，遞迴或相互遞迴（互相呼叫）的函式，
以及具有無型別運算式（如 `fun empty() = null`）的函式，始終需要傳回型別。

當您確實使用推論的傳回型別時，
請務必檢查實際結果，因為編譯器推論出的型別可能對您來說沒那麼有用。
在上面的例子中，如果您希望 `double()` 函式傳回 `Number` 而非 `Int`，
您必須明確宣告。

### 傳回 Unit 的函式

如果函式具有區塊主體（花括號 `{}` 內的指令）且不傳回有用的值，
編譯器會假設其傳回型別為 `Unit`。
`Unit` 是一種只有一個值的型別，該值也稱為 `Unit`。

您不必指定 `Unit` 作為傳回型別，除非是函式型別參數。
您也永遠不必明確傳回 `Unit`。

例如，您可以宣告 `printHello()` 函式而不傳回 `Unit`：

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
    }
    // Hello Kodee
    // This runs after the greeting.

    printHello(null) {
        println("No name provided, but action still runs.")
    }
    // No name provided, but action still runs
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false" id="return-unit-implicit"}

這與下面這種冗長的宣告是等效的：

```kotlin
//sampleStart
fun printHello(name: String?, action: () -> Unit): Unit {
    if (name != null)
        println("Hello $name")
    else
        println("Hi there!")

    action()
    return Unit
}
//sampleEnd
fun main() {
    printHello("Kodee") {
        println("This runs after the greeting.")
    }
    // Hello Kodee
    // This runs after the greeting.

    printHello(null) {
        println("No name provided, but action still runs.")
    }
    // No name provided, but action still runs
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false" id="return-unit-explicit"}

如果函式的傳回型別已明確指定，您可以在運算式主體中使用 `return` 陳述式：

```kotlin
fun getDisplayNameOrDefault(userId: String?): String =
    getDisplayName(userId ?: return "default")
```

### 可變參數 (varargs)

要將可變數量的引數傳遞給函式，您可以使用 `vararg` 修飾詞標記其參數之一
（通常是最後一個）。
在函式內部，您可以使用型別為 `T` 的 `vararg` 參數作為 `T` 的陣列：

```kotlin
fun <T> asList(vararg ts: T): List<T> {
    val result = ArrayList<T>()
    for (t in ts) // ts 是一個 Array
        result.add(t)
    return result
}
```

接著您可以將可變數量的引數傳遞給該函式：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false" id="varargs-aslist"}

只有一個參數可以標記為 `vararg`。
如果您在參數清單中最後一位以外的任何位置宣告 `vararg` 參數，則必須使用具名引數傳遞後續參數的值。
如果參數具有函式型別，您也可以透過將 lambda 放在圓括號之外來傳遞其值。

呼叫 `vararg` 函式時，您可以單獨傳遞引數，如 `asList(1, 2, 3)` 範例所示。
如果您已經有一個陣列並希望將其內容作為 `vararg` 參數或其一部分傳遞給函式，
請使用 [展開運算子](arrays.md#pass-variable-number-of-arguments-to-a-function)，即在陣列名稱前加上 `*`：

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

    // 函式接收陣列 [-1, 0, 1, 2, 3, 4]
    list = asList(-1, 0, *a, 4)

    println(list)
    // [-1, 0, 1, 2, 3, 4]
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false" id="varargs-aslist-with-array"}

如果您想將 [基本型別陣列](arrays.md#primitive-type-arrays) 作為 `vararg` 傳遞，
您需要使用 [`.toTypedArray()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/to-typed-array.html) 函式將其轉換為一般的（型別化）陣列：

```kotlin
// 'a' 是一個 IntArray，這是一個基本型別陣列
val a = intArrayOf(1, 2, 3)
val list = asList(-1, 0, *a.toTypedArray(), 4)
```

### Infix 表示法

您可以使用 `infix` 關鍵字宣告可以不使用圓括號或點號進行呼叫的函式。
這有助於使程式碼中的簡單函式呼叫更易於閱讀。

```kotlin
infix fun Int.shl(x: Int): Int { /*...*/ }

// 使用一般表示法呼叫函式
1.shl(2)

// 使用 infix 表示法呼叫函式
1 shl 2
```

`infix` 函式必須符合以下要求：

* 它們必須是類別的成員函數或 [擴充方法](extensions.md)。
* 它們必須只有一個參數。
* 參數不得 [接受可變數量的引數](#variable-number-of-arguments-varargs) (`vararg`)，且不得有 [預設值](#parameters-with-default-values)。

> `infix` 函式呼叫的優先級低於算術運算子、型別轉換與 `rangeTo` 運算子。
> 以下運算式是等效的：
> * `1 shl 2 + 3` 等效於 `1 shl (2 + 3)`
> * `0 until n * 2` 等效於 `0 until (n * 2)`
> * `xs union ys as Set<*>` 等效於 `xs union (ys as Set<*>)`
>
> 另一方面，`infix` 函式呼叫的優先級高於布林運算子 `&&` 和 `||`、`is` 和 `in` 檢查以及其他一些運算子。這些運算式也是等效的：
> * `a && b xor c` 等效於 `a && (b xor c)`
> * `a xor b in c` 等效於 `(a xor b) in c`
>
{style="note"}

請注意，`infix` 函式始終需要指定接收者和參數。
當您使用 `infix` 表示法在目前接收者上呼叫方法時，請明確使用 `this`。
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
        this add "second" // 正確：具有明確接收者的 infix 呼叫
        // add "third"    // 編譯器錯誤：需要明確的接收者
    }

    fun printAll() = println("Items = $items")
}

fun main() {
    val myStrings = MyStringCollection()
    // 將 "first" 與 "second" 新增到清單中兩次
    myStrings.build()
      
    myStrings.printAll()
    // Adding: first
    // Adding: second
    // Items = [first, second]
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="infix-notation-example"}

## 函式作用域

您可以在檔案的頂層宣告 Kotlin 函式，這表示您不需要建立類別來持有函式。
函式也可以在局部宣告為「成員函數」或「擴充方法」。

### 區域函式

Kotlin 支援區域函式，即在其他函式內部宣告的函式。
例如，以下程式碼實作了給定圖形的深度優先搜尋 (DFS) 演算法。
在外部 `dfs()` 函式中使用區域 `dfs()` 函式來隱藏實作細節並處理遞迴呼叫：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="local-functions-dfs"}

區域函式可以存取外部函式的區域變數（閉包）。
在上述情況下，`visited` 函式參數可以是一個區域變數：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="local-functions-dfs-with-local-variable"}

### 成員函數

成員函數是定義在類別或物件內部的函式：

```kotlin
class Sample {
    fun foo() { print("Foo") }
}
```

要呼叫成員函數，請寫下執行個體或物件名稱，接著加入 `.` 並寫下函式名稱：

```kotlin
// 建立 Stream 類別的執行個體並呼叫 read()
Stream().read()
```

有關類別與覆寫成員的更多資訊，請參閱 [類別](classes.md) 與 [繼承](classes.md#inheritance)。

## 泛型函式

您可以透過在函式名稱前使用尖括號 `<>` 來指定函式的泛型參數：

```kotlin
fun <T> singletonList(item: T): List<T> { /*...*/ }
```

有關泛型函式的更多資訊，請參閱 [泛型](generics.md)。

## 尾端遞迴函式

Kotlin 支援一種稱為 [尾端遞迴](https://en.wikipedia.org/wiki/Tail_call) 的函式語言程式設計風格。
對於某些通常會使用迴圈的演算法，您可以使用遞迴函式來代替，而沒有堆疊溢位的風險。
當函式標記有 `tailrec` 修飾詞並符合要求的正式條件時，編譯器會最佳化掉遞迴，改為留下一個快速且有效率的基於迴圈的版本：

```kotlin
import kotlin.math.cos
import kotlin.math.abs

// 任意一個「足夠好」的精確度
val eps = 1E-10

tailrec fun findFixPoint(x: Double = 1.0): Double =
    if (abs(x - cos(x)) < eps) x else findFixPoint(cos(x))
```

這段程式碼計算餘弦的固定點（一個數學常數）。
該函式從 `1.0` 開始重複呼叫 `cos()`，直到結果不再變更，
對於指定的 `eps` 精確度，產生的結果為 `0.7390851332151611`。
該程式碼等效於這種更傳統的風格：

```kotlin
import kotlin.math.cos
import kotlin.math.abs

// 任意一個「足夠好」的精確度
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

只有當函式在最後一個操作中呼叫自身時，才能將 `tailrec` 修飾詞套用於該函式。
當遞迴呼叫之後還有更多程式碼、位於 [`try`/`catch`/`finally` 區塊](exceptions.md#handle-exceptions-using-try-catch-blocks) 內，
或者當函式是 [open](inheritance.md) 時，不能使用尾端遞迴。

**另請參閱**：
* [內嵌函式](inline-functions.md)
* [擴充方法](extensions.md)
* [高階函數與 Lambda](lambdas.md)