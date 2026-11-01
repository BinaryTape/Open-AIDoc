[//]: # (title: 條件與迴圈)

Kotlin 提供了靈活的工具來控制程式流程。使用 `if`、`when` 和迴圈，可以為你的條件定義清晰且富有表現力的邏輯。

## If 運算式 {id="if-expression"}

要在 Kotlin 中使用 `if`，請將要檢查的條件放在圓括號 `()` 內，並將結果為 true 時要執行的操作放在花括號 `{}` 內。你可以使用 `else` 和 `else if` 來加入額外的分支和檢查。

你也可以將 `if` 作為運算式來撰寫，這讓你可以將其傳回值直接指派給變數。在這種形式下，`else` 分支是強制必要的。`if` 運算式的作用與其他語言中的三元運算子 (`condition ? then : else`) 相同。

例如：

```kotlin
fun main() {
    val heightAlice = 160
    val heightBob = 175

    //sampleStart
    var taller = heightAlice
    if (heightAlice < heightBob) taller = heightBob

    // 使用 else 分支
    if (heightAlice > heightBob) {
        taller = heightAlice
    } else {
        taller = heightBob
    }

    // 將 if 作為運算式使用
    taller = if (heightAlice > heightBob) heightAlice else heightBob

    // 將 else if 作為運算式使用：
    val heightLimit = 150
    val heightOrLimit = if (heightLimit > heightAlice) heightLimit else if (heightAlice > heightBob) heightAlice else heightBob

    println("Taller height is $taller")
    // Taller height is 175
    println("Height or limit is $heightOrLimit")
    // Height or limit is 175
    //sampleEnd
}
```
{kotlin-runnable="true" id="if-else-if-kotlin"}

`if` 運算式中的每個分支都可以是一個區塊，其中最後一個運算式的值會成為該分支的結果：

```kotlin
fun main() {
    //sampleStart
    val heightAlice = 160
    val heightBob = 175

    val taller = if (heightAlice > heightBob) {
        print("Choose Alice\n")
        heightAlice
    } else {
        print("Choose Bob\n")
        heightBob
    }

    println("Taller height is $taller")
    //sampleEnd
}
```
{kotlin-runnable="true" id="if-else-blocks-kotlin"}

## When 運算式與陳述式 {id="when-expressions-and-statements"}

`when` 是一種條件運算式，可根據多個可能的值或條件來執行程式碼。它類似於 Java、C 和其他語言中的 `switch` 陳述式。`when` 會對其引數求值，並依序將結果與各個分支進行比較，直到滿足某個分支條件為止。例如：

```kotlin
fun main() {
    //sampleStart
    val userRole = "Editor"
    when (userRole) {
        "Viewer" -> print("User has read-only access")
        "Editor" -> print("User can edit content")
        else -> print("User role is not recognized")
    }
    // User can edit content
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-conditions-when-statement"}

你可以將 `when` 作為**運算式**或**陳述式**使用。作為運算式時，`when` 會傳回一個值供後續程式碼使用。作為陳述式時，`when` 僅執行操作而不傳回結果：

<table>
   <tr>
       <td>運算式</td>
       <td>陳述式</td>
   </tr>
   <tr>
<td>

```kotlin
// 傳回一個字串並指派給 
// text 變數
val text = when (x) {
    1 -> "x == 1"
    2 -> "x == 2"
    else -> "x is neither 1 nor 2"
}
```

</td>
<td>

```kotlin
// 不傳回結果，但會觸發 
// print 陳述式
when (x) {
    1 -> print("x == 1")
    2 -> print("x == 2")
    else -> print("x is neither 1 nor 2")
}
```

</td>
</tr>
</table>

其次，你可以在包含主體或不包含主體的情況下使用 `when`。兩種方式的行為保持一致。使用主體通常會使程式碼更具可讀性與可維護性，因為它明確展示了正在檢查的對象。

<table>
   <tr>
       <td>包含主體 <code>x</code></td>
       <td>不包含主體</td>
   </tr>
   <tr>
<td>

```kotlin
when(x) { ... }
```

</td>
<td>

```kotlin
when { ... }
```

</td>
</tr>
</table>

使用 `when` 的方式決定了你是否需要在分支中涵蓋所有可能的情況。涵蓋所有可能的情況稱為*窮舉*（exhaustive）。

### 陳述式 {id="statements"}

如果將 `when` 作為陳述式使用，則不需要涵蓋所有可能的情況。在以下範例中，某些情況並未被涵蓋，因此不會觸發任何分支，但也不會發生錯誤：

```kotlin
fun main() {
    //sampleStart
    val deliveryStatus = "OutForDelivery"
    when (deliveryStatus) {
        // 未涵蓋所有情況
        "Pending" -> print("Your order is being prepared")
        "Shipped" -> print("Your order is on the way")
    }
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-when-statement"}

與 `if` 相同，每個分支都可以是一個區塊，其值為區塊中最後一個運算式的值。

### 運算式 {id="expressions"}

如果將 `when` 作為運算式使用，則**必須**涵蓋所有可能的情況。第一個相符分支的值會成為整個運算式的值。如果未涵蓋所有情況，編譯器將會拋出錯誤。

如果你的 `when` 運算式包含主體，你可以使用 `else` 分支來確保涵蓋所有可能情況，但這不是強制的。例如，如果你的主體是 `Boolean`、[`enum` 類別](enum-classes.md)、[`sealed` 類別](sealed-classes.md)，或是它們的可為 null 對應型別，你可以在沒有 `else` 分支的情況下涵蓋所有情況：

```kotlin
import kotlin.random.Random
//sampleStart
enum class Bit {
    ZERO, ONE
}

fun getRandomBit(): Bit {
    return if (Random.nextBoolean()) Bit.ONE else Bit.ZERO
}

fun main() {
    val numericValue = when (getRandomBit()) {
        // 不需要 else 分支，因為已涵蓋所有情況
        Bit.ZERO -> 0
        Bit.ONE -> 1
    }

    println("Random bit as number: $numericValue")
    // Random bit as number: 0
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-when-expression-subject"}

> 為了簡化 `when` 運算式並減少重複程式碼，可以嘗試上下文敏感解析 (context-sensitive resolution)（目前為預覽階段）。
> 如果預期型別已知，此功能允許你在 `when` 運算式中使用 enum 項目或 sealed 類別成員時省略型別名稱。
> 
> 若要了解更多，請參閱[上下文敏感解析預覽](whatsnew22.md#preview-of-context-sensitive-resolution)或相關的 [KEEP 提案](https://github.com/Kotlin/KEEP/blob/improved-resolution-expected-type/proposals/context-sensitive-resolution.md)。
> 
{style="tip"}

如果你的 `when` 運算式**不包含**主體，則**必須**包含 `else` 分支，否則編譯器會拋出錯誤。當沒有其他分支條件滿足時，就會對 `else` 分支求值：

```kotlin
fun main() {
    //sampleStart
    val localFileSize = 1200
    val remoteFileSize = 1200

    val message = when {
        localFileSize > remoteFileSize -> "Local file is larger than remote file"
        localFileSize < remoteFileSize -> "Local file is smaller than remote file"
        else -> "Local and remote files are the same size"
    }

    println(message)
    // Local and remote files are the same size
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-when-no-subject"}

### when 的其他用法 {id="other-ways-to-use-when"}

`when` 運算式與陳述式提供了多種方式來簡化程式碼、處理多個條件以及執行型別檢查。

使用逗號將多個條件合併到單一分支中：

```kotlin
fun main() {
    val ticketPriority = "High"
    //sampleStart
    when (ticketPriority) {
        "Low", "Medium" -> print("Standard response time")
        else -> print("High-priority handling")
    }
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-when-multiple-cases"}

使用求值為 `true` 或 `false` 的運算式作為分支條件：

```kotlin
fun main() {
    val storedPin = "1234"
    val enteredPin = 1234
  
    //sampleStart
    when (enteredPin) {
        // 運算式
        storedPin.toInt() -> print("PIN is correct")
        else -> print("Incorrect PIN")
    }
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-when-branch-expression"}

使用 `in` 或 `!in` 關鍵字檢查某個值是否包含在[範圍](ranges.md)或集合中：

```kotlin
fun main() {
    val x = 7
    val validNumbers = setOf(15, 16, 17)

    //sampleStart
    when (x) {
        in 1..10 -> print("x is in the range")
        in validNumbers -> print("x is valid")
        !in 10..20 -> print("x is outside the range")
        else -> print("none of the above")
    }
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-when-ranges"}

使用 `is` 或 `!is` 關鍵字檢查值的型別。透過[智慧轉型](typecasts.md#smart-casts)，你可以直接存取該型別的成員函式與屬性：

```kotlin
fun hasPrefix(input: Any): Boolean = when (input) {
    is String -> input.startsWith("ID-")
    else -> false
}

fun main() {
    val testInput = "ID-98345"
    println(hasPrefix(testInput))
    // true
}
```
{kotlin-runnable="true" id="kotlin-when-type-checks"}

使用 `when` 取代傳統的 `if`-`else` `if` 鏈。
在沒有主體的情況下，分支條件就是單純的布林運算式。第一個條件為 `true` 的分支將會執行：

```kotlin
fun Int.isOdd() = this % 2 != 0
fun Int.isEven() = this % 2 == 0

fun main() {
    //sampleStart
    val x = 5
    val y = 8

    when {
        x.isOdd() -> print("x is odd")
        y.isEven() -> print("y is even")
        else -> print("x+y is odd")
    }
    // x is odd
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-when-replace-if"}

最後，可以使用以下語法將主體擷取至變數中：

```kotlin
fun main() {
    val message = when (val input = "yes") {
        "yes" -> "You said yes"
        "no" -> "You said no"
        else -> "Unrecognized input: $input"
    }

    println(message)
    // You said yes
}
```
{kotlin-runnable="true" id="kotlin-when-capture-subject"}

作為主體引入的變數作用域僅限於該 `when` 運算式或陳述式的主體內。

### 防護條件 (Guard conditions) {id="guard-conditions-in-when-expressions"}

防護條件允許你為 `when` 運算式或陳述式的分支新增多個條件，使複雜的控制流程更明確且精簡。只要 `when` 包含主體，就可以使用防護條件。

在同一分支的主條件之後放置防護條件，並以 `if` 分隔：

```kotlin
sealed interface Animal {
    data class Cat(val mouseHunter: Boolean) : Animal
    data class Dog(val breed: String) : Animal
}

fun feedDog() = println("Feeding a dog")
fun feedCat() = println("Feeding a cat")

//sampleStart
fun feedAnimal(animal: Animal) {
    when (animal) {
        // 僅包含主條件的分支
        // 當 animal 為 Dog 時呼叫 feedDog()
        is Animal.Dog -> feedDog()
        // 同時包含主條件與防護條件的分支
        // 當 animal 為 Cat 且非 mouseHunter 時呼叫 feedCat()
        is Animal.Cat if !animal.mouseHunter -> feedCat()
        // 若上述條件皆不符合，則輸出 "Unknown animal"
        else -> println("Unknown animal")
    }
}

fun main() {
    val animals = listOf(
        Animal.Dog("Beagle"),
        Animal.Cat(mouseHunter = false),
        Animal.Cat(mouseHunter = true)
    )

    animals.forEach { feedAnimal(it) }
    // Feeding a dog
    // Feeding a cat
    // Unknown animal
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.2" id="kotlin-when-guard-conditions"}

若有多個以逗號分隔的條件，則無法使用防護條件。例如：

```kotlin
0, 1 -> print("x == 0 or x == 1")
```

在單一 `when` 運算式或陳述式中，你可以結合使用帶有防護條件與不帶防護條件的分支。
帶有防護條件的分支中的程式碼，只有在主條件與防護條件的求值結果皆為 `true` 時才會執行。
若主條件不符合，則不會對防護條件進行求值。

由於 `when` 陳述式不需要涵蓋所有情況，在沒有 `else` 分支的 `when` 陳述式中使用防護條件意味著若沒有條件相符，則不會執行任何程式碼。

與陳述式不同，`when` 運算式必須涵蓋所有情況。如果你在沒有 `else` 分支的 `when` 運算式中使用防護條件，編譯器會要求你處理所有可能的情況以避免執行時期錯誤。

使用布林運算子 `&&` (AND) 或 `||` (OR) 在單一分支內組合多個防護條件。
請在布林運算式周圍使用圓括號以[避免混淆](coding-conventions.md#guard-conditions-in-when-expression)：

```kotlin
when (animal) {
    is Animal.Cat if (!animal.mouseHunter && animal.hungry) -> feedCat()
}
```

防護條件也支援 `else if`：

```kotlin
when (animal) {
    // 檢查 `animal` 是否為 `Dog`
    is Animal.Dog -> feedDog()
    // 檢查 `animal` 是否為 `Cat` 且非 `mouseHunter` 的防護條件
    is Animal.Cat if !animal.mouseHunter -> feedCat()
    // 若上述條件皆不符合且 animal.eatsPlants 為 true，則呼叫 giveLettuce()
    else if animal.eatsPlants -> giveLettuce()
    // 若上述條件皆不符合，則輸出 "Unknown animal"
    else -> println("Unknown animal")
}
```

### JVM 上的位元組碼產生 {id="bytecode-generation-on-the-jvm"}

當針對 JVM 21 或更高版本編譯 Kotlin 程式碼時，編譯器會為符合條件的 `when` 運算式產生 [`invokedynamic`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/invoke/package-summary.html) 指令。這會產生更小的位元組碼，類似於 Java `switch` 陳述式所產生的位元組碼。

當滿足以下所有條件時，編譯器會使用帶有 [`SwitchBootstraps.typeSwitch()`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/runtime/SwitchBootstraps.html) 方法的 `invokedynamic`：

* 除 `else` 外的所有條件均為 `is` 或 `null` 檢查。
* `when` 運算式不包含[防護條件 (`if`)](#guard-conditions-in-when-expressions)。
* 條件不包含無法直接進行型別檢查的型別，例如可變 Kotlin 集合 (`MutableList`) 或函式型別 (`kotlin.Function1`、`kotlin.Function2` 等)。
* 除 `else` 之外，`when` 運算式至少有兩個條件。
* 所有分支檢查的都是 `when` 運算式的同一個主體。

例如：

```kotlin
open class Shape

class Circle : Shape()
class Rectangle : Shape()
class Triangle : Shape()

fun countCorners(shape: Shape) = when (shape) {
    is Circle -> 0
    is Rectangle -> 4
    is Triangle -> 3
    else -> -1
}
```

此處的 `when (shape)` 運算式在位元組碼中會編譯為單個 `invokedynamic` 型別切換，而不是多個 `instanceof` 檢查。

## For 迴圈 {id="for-loops"}

使用 `for` 迴圈來遍歷[集合](collections-overview.md)、[陣列](arrays.md)或[範圍](ranges.md)：

```kotlin
for (item in collection) print(item)
```

`for` 迴圈的主體可以是用花括號 `{}` 包裹的區塊。

```kotlin
fun main() {
    val shoppingList = listOf("Milk", "Bananas", "Bread")
    //sampleStart
    println("Things to buy:")
    for (item in shoppingList) {
        println("- $item")
    }
    // Things to buy:
    // - Milk
    // - Bananas
    // - Bread
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-for-loop"}

### 範圍 {id="ranges"}

若要遍歷數字範圍，請使用帶有 `..` 和 `..<` 運算子的[範圍運算式](ranges.md)：

```kotlin
fun main() {
//sampleStart
    println("Range with an inclusive upper bound:")
    for (i in 1..6) {
        print(i)
    }
    // Range with an inclusive upper bound:
    // 123456
  
    println("\nRange with an exclusive upper bound:")
    for (i in 1..<6) {
        print(i)
    }
    // Range with an exclusive upper bound:
    // 12345
  
    println("\nReverse order in steps of 2:")
    for (i in 6 downTo 0 step 2) {
        print(i)
    }
    // Reverse order in steps of 2:
    // 6420
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-for-loop-range"}

### 陣列 {id="arrays"}

如果你想透過索引來遍歷陣列或清單，可以使用 `indices` 屬性：

```kotlin
fun main() {
    val routineSteps = arrayOf("Wake up", "Brush teeth", "Make coffee")
    //sampleStart
    for (i in routineSteps.indices) {
        println(routineSteps[i])
    }
    // Wake up
    // Brush teeth
    // Make coffee
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-for-loop-array"}

或者，你可以使用標準函式庫中的 [`.withIndex()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/with-index.html) 函式：

```kotlin
fun main() {
    val routineSteps = arrayOf("Wake up", "Brush teeth", "Make coffee")
    //sampleStart
    for ((index, value) in routineSteps.withIndex()) {
        println("The step at $index is \"$value\"")
    }
    // The step at 0 is "Wake up"
    // The step at 1 is "Brush teeth"
    // The step at 2 is "Make coffee"
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-for-loop-array-index"}

### 迭代器 {id="iterators"}

`for` 迴圈可以遍歷任何提供[迭代器](iterators.md)的物件。集合預設提供迭代器，而範圍和陣列則會被編譯為以索引為基礎的迴圈。

你可以透過提供名為 `iterator()` 且傳回 `Iterator<>` 的成員函式或擴充函式，來建立自己的迭代器。`iterator()` 函式必須包含一個 `next()` 函式和一個傳回 `Boolean` 的 `hasNext()` 函式。

為類別建立自訂迭代器最簡單的方法，是繼承 [`Iterable<T>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-iterable/) 介面，並覆寫既有的 `iterator()`、`next()` 和 `hasNext()` 函式。例如：

```kotlin
class Booklet(val totalPages: Int) : Iterable<Int> {
    override fun iterator(): Iterator<Int> {
        return object : Iterator<Int> {
            var current = 1
            override fun hasNext() = current <= totalPages
            override fun next() = current++
        }
    }
}

fun main() {
    val booklet = Booklet(3)
    for (page in booklet) {
        println("Reading page $page")
    }
    // Reading page 1
    // Reading page 2
    // Reading page 3
}
```
{kotlin-runnable="true" id="kotlin-for-loop-inherit-iterator"}

> 進一步了解[介面](interfaces.md)與[繼承](inheritance.md)。
> 
{style="tip"}

或者，你也可以從頭開始建立這些函式。在此情況下，請在函式加上 `operator` 關鍵字：

```kotlin
//sampleStart
class Booklet(val totalPages: Int) {
    operator fun iterator(): Iterator<Int> {
        return object {
            var current = 1

            operator fun hasNext() = current <= totalPages
            operator fun next() = current++
        }.let {
            object : Iterator<Int> {
                override fun hasNext() = it.hasNext()
                override fun next() = it.next()
            }
        }
    }
}
//sampleEnd

fun main() {
    val booklet = Booklet(3)
    for (page in booklet) {
        println("Reading page $page")
    }
    // Reading page 1
    // Reading page 2
    // Reading page 3
}
```
{kotlin-runnable="true" id="kotlin-for-loop-iterator-from-scratch"}

## While 迴圈 {id="while-loops"}

只要滿足條件，`while` 和 `do-while` 迴圈就會持續執行其主體內的程式碼。
兩者之間的差異在於條件檢查的時機：

* `while` 會先檢查條件，如果滿足，則執行其主體內的程式碼，然後返回條件檢查。
* `do-while` 會先執行其主體內的程式碼，然後才檢查條件。如果滿足，迴圈將會重複。因此，無論條件如何，`do-while` 的主體至少會執行一次。

對於 `while` 迴圈，將要檢查的條件放在圓括號 `()` 內，主體放在花括號 `{}` 內：

```kotlin
fun main() {
    var carsInGarage = 0
    val maxCapacity = 3
//sampleStart
    while (carsInGarage < maxCapacity) {
        println("Car entered. Cars now in garage: ${++carsInGarage}")
    }
    // Car entered. Cars now in garage: 1
    // Car entered. Cars now in garage: 2
    // Car entered. Cars now in garage: 3

    println("Garage is full!")
    // Garage is full!
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-while-loop"}

對於 `do-while` 迴圈，請先將主體放在花括號 `{}` 內，然後再將要檢查的條件放在圓括號 `()` 內：

```kotlin
import kotlin.random.Random

fun main() {
    var roll: Int
//sampleStart
    do {
        roll = Random.nextInt(1, 7)
        println("Rolled a $roll")
    } while (roll != 6)
    // Rolled a 2
    // Rolled a 6
    
    println("Got a 6! Game over.")
    // Got a 6! Game over.
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-do-while-loop"}

## 迴圈中的 break 與 continue {id="break-and-continue-in-loops"}

Kotlin 支援迴圈中傳統的 `break` 與 `continue` 運算子。請參閱[返回與跳轉](returns.md)。