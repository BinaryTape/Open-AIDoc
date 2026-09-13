[//]: # (title: 條件與迴圈)

Kotlin 提供靈活的工具來控制程式流。使用 `if`、`when` 和迴圈來為您的條件定義清晰且具表現力的邏輯。

## If 運算式 {id="if-expression"}

在 Kotlin 中使用 `if` 時，請將要檢查的條件放在圓括號 `()` 中，並將結果為 true 時要執行的操作放在花括號 `{}` 中。您可以使用 `else` 和 `else if` 來增加額外的分支和檢查。

您也可以將 `if` 當作運算式使用，這讓您可以直接將其傳回值指派給變數。在這種形式下，必須包含 `else` 分支。`if` 運算式的用途與其他語言中的三元運算子 (`condition ? then : else`) 相同。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="if-else-if-kotlin"}

`if` 運算式中的每個分支都可以是一個程式碼區塊，其中最後一個運算式的值會成為結果：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="if-else-blocks-kotlin"}

## When 運算式與陳述式 {id="when-expressions-and-statements"}

`when` 是一種條件運算式，根據多個可能的值或條件執行程式碼。它類似於 Java、C 和其他語言中的 `switch` 陳述式。`when` 會評估其引數，並按順序將結果與每個分支進行比較，直到滿足某個分支條件。例如：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-conditions-when-statement"}

您可以將 `when` 作為 **運算式** 或 **陳述式** 使用。作為運算式，`when` 會傳回一個值，供您稍後在程式碼中使用。作為陳述式，`when` 會完成一項操作，而不傳回結果：

<table>
   <tr>
       <td>運算式</td>
       <td>陳述式</td>
   </tr>
   <tr>
<td>

```kotlin
// 傳回指派給 
// text 變數的字串
val text = when (x) {
    1 -> "x == 1"
    2 -> "x == 2"
    else -> "x is neither 1 nor 2"
}
```

</td>
<td>

```kotlin
// 不傳回結果，但觸發 
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

其次，您可以使用帶有或不帶有主體（subject）的 `when`。無論哪種方式，行為都保持不變。使用主體通常會使您的程式碼更具可讀性和可維護性，因為它清楚地顯示了您正在檢查的內容。

<table>
   <tr>
       <td>帶有主體 <code>x</code></td>
       <td>不帶有主體</td>
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

您使用 `when` 的方式決定了您是否需要在分支中涵蓋所有可能的情況。涵蓋所有可能的情況稱為 _窮舉_（exhaustive）。

### 陳述式 {id="statements"}

如果您將 `when` 作為陳述式使用，則不需要涵蓋所有可能的情況。在此範例中，並未涵蓋所有情況，因此沒有觸發任何分支。但是，不會發生錯誤：

```kotlin
fun main() {
    //sampleStart
    val deliveryStatus = "OutForDelivery"
    when (deliveryStatus) {
        // 並非所有情況都被涵蓋
        "Pending" -> print("Your order is being prepared")
        "Shipped" -> print("Your order is on the way")
    }
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-statement"}

與 `if` 一樣，每個分支都可以是一個程式碼區塊，其值是區塊中最後一個運算式的值。

### 運算式 {id="expressions"}

如果您將 `when` 作為運算式使用，則 **必須** 涵蓋所有可能的情況。第一個相符分支的值會成為整個運算式的值。如果您沒有涵蓋所有情況，編譯器會擲回錯誤。

如果您的 `when` 運算式有一個主體，您可以使用 `else` 分支來確保涵蓋所有可能的情況，但這並非強制性的。例如，如果您的主體是 `Boolean`、[`enum` 類別](enum-classes.md)、[`sealed` 類別](sealed-classes.md) 或其可為 null 的對應項，則可以在沒有 `else` 分支的情況下涵蓋所有情況：

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
        // 不需要 else 分支，因為所有情況都已涵蓋
        Bit.ZERO -> 0
        Bit.ONE -> 1
    }

    println("Random bit as number: $numericValue")
    // Random bit as number: 0
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-expression-subject"}

> 為了簡化 `when` 運算式並減少重複，請試試內容感知解析（context-sensitive resolution，目前為預覽版）。
> 當預期型別已知時，此功能允許您在 `when` 運算式中使用 enum 項目或 sealed 類別成員時省略型別名稱。
> 
> 如需更多資訊，請參閱 [內容感知解析預覽](whatsnew22.md#preview-of-context-sensitive-resolution) 或相關的 [KEEP 提案](https://github.com/Kotlin/KEEP/blob/improved-resolution-expected-type/proposals/context-sensitive-resolution.md)。
> 
{style="tip"}

如果您的 `when` 運算式 **沒有** 主體，則 **必須** 包含一個 `else` 分支，否則編譯器會擲回錯誤。當沒有其他分支條件滿足時，會評估 `else` 分支：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-no-subject"}

### When 的其他用法 {id="other-ways-to-use-when"}

`when` 運算式和陳述式提供了不同的方式來簡化程式碼、處理多個條件以及執行型別檢查。

使用逗號將多個條件分組到單個分支中：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-multiple-cases"}

使用評估結果為 `true` 或 `false` 的運算式作為分支條件：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-branch-expression"}

使用 `in` 或 `!in` 關鍵字檢查值是否包含在 [範圍](ranges.md) 或集合中：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-ranges"}

使用 `is` 或 `!is` 關鍵字檢查值的型別。由於 [智慧轉型](typecasts.md#smart-casts)，您可以直接存取該型別的成員函數和屬性：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-type-checks"}

使用 `when` 代替傳統的 `if`-`else` `if` 鏈。
在沒有主體的情況下，分支條件僅為布林運算式。第一個條件為 `true` 的分支會執行：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-replace-if"}

最後，使用以下語法將主體擷取到變數中：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-capture-subject"}

作為主體引入的變數作用域僅限於 `when` 運算式或陳述式的主體。

### 防護條件 {id="guard-conditions-in-when-expressions"}

防護條件（Guard conditions）允許您在 `when` 運算式或陳述式的分支中包含多個條件，使複雜的控制流更加明確且簡潔。只要 `when` 具有主體，您就可以使用防護條件。

將防護條件放在同一分支的主要條件之後，並以 `if` 分隔：

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
        // 僅包含主要條件的分支
        // 當 animal 為 Dog 時呼叫 feedDog()
        is Animal.Dog -> feedDog()
        // 同時包含主要條件和防護條件的分支
        // 當 animal 為 Cat 且非 mouseHunter 時呼叫 feedCat()
        is Animal.Cat if !animal.mouseHunter -> feedCat()
        // 如果以上條件都不匹配，則列印 "Unknown animal"
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

當您有多個以逗號分隔的條件時，不能使用防護條件。例如：

```kotlin
0, 1 -> print("x == 0 or x == 1")
```

在單個 `when` 運算式或陳述式中，您可以結合帶有和不帶有防護條件的分支。帶有防護條件的分支中的程式碼僅在主要條件和防護條件評估結果均為 `true` 時才會執行。如果主要條件不相符，則不會評估防護條件。

由於 `when` 陳述式不需要涵蓋所有情況，在沒有 `else` 分支的 `when` 陳述式中使用防護條件意味著如果沒有條件相符，則不執行任何程式碼。

與陳述式不同，`when` 運算式必須涵蓋所有情況。如果您在不帶 `else` 分支的 `when` 運算式中使用防護條件，編譯器會要求您處理每一種可能的情況，以避免執行時期錯誤。

使用布林運算子 `&&` (AND) 或 `||` (OR) 在單個分支中組合多個防護條件。請在布林運算式周圍使用圓括號以 [避免混淆](coding-conventions.md#guard-conditions-in-when-expression)：

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
    // 如果以上條件均不匹配且 animal.eatsPlants 為 true，則呼叫 giveLettuce()
    else if animal.eatsPlants -> giveLettuce()
    // 如果以上條件都不匹配，則列印 "Unknown animal"
    else -> println("Unknown animal")
}
```

### JVM 上的位元組碼產生 {id="bytecode-generation-on-the-jvm"}

當您針對 JVM 21 或更高版本編譯 Kotlin 程式碼時，編譯器會為符合資格的 `when` 運算式產生 [`invokedynamic`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/invoke/package-summary.html) 指令。這會產生更精簡的位元組碼，類似於 Java `switch` 陳述式所產生的位元組碼。

當滿足以下所有條件時，編譯器會搭配 [`SwitchBootstraps.typeSwitch()`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/runtime/SwitchBootstraps.html) 方法使用 `invokedynamic`：

* 除 `else` 以外的所有條件均為 `is` 或 `null` 檢查。
* `when` 運算式不包含[防護條件 (`if`)](#guard-conditions-in-when-expressions)。
* 條件中不包含無法直接進行型別檢查的型別，例如可變 Kotlin 集合（`MutableList`）或函式型別（`kotlin.Function1`、`kotlin.Function2` 等）。
* 除 `else` 之外，`when` 運算式至少有兩個條件。
* 所有分支皆檢查 `when` 運算式的相同主體。

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

這裡的 `when (shape)` 運算式會被編譯為單個 `invokedynamic` 型別 switch，而不是位元組碼中多個 `instanceof` 檢查。

## For 迴圈 {id="for-loops"}

使用 `for` 迴圈來反覆運算 [集合](collections-overview.md)、[陣列](arrays.md) 或 [範圍](ranges.md)：

```kotlin
for (item in collection) print(item)
```

`for` 迴圈的主體可以是一個帶有花括號 `{}` 的程式碼區塊。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-for-loop"}

### 範圍 {id="ranges"}

要反覆運算一組數字範圍，請使用帶有 `..` 和 `..<` 運算子的 [範圍運算式](ranges.md)：

```kotlin
fun main() {
//sampleStart
    println("Closed-ended range:")
    for (i in 1..6) {
        print(i)
    }
    // Closed-ended range:
    // 123456
  
    println("\nOpen-ended range:")
    for (i in 1..<6) {
        print(i)
    }
    // Open-ended range:
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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-for-loop-range"}

### 陣列 {id="arrays"}

如果您想透過索引來反覆運算陣列或列表，可以使用 `indices` 屬性：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-for-loop-array"}

或者，您可以使用標準庫中的 [`.withIndex()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/with-index.html) 函式：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-for-loop-array-index"}

### 迭代器 {id="iterators"}

`for` 迴圈可以反覆運算任何提供 [迭代器](iterators.md) 的物件。集合預設提供迭代器，而範圍和陣列則會被編譯成基於索引的迴圈。

您可以透過提供名為 `iterator()` 的成員或擴充函式來建立自己的迭代器，該函式需傳回一個 `Iterator<>`。`iterator()` 函式必須具有 `next()` 函式和傳回 `Boolean` 的 `hasNext()` 函式。

為類別建立自己的迭代器最簡單的方法是繼承 [`Iterable<T>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-iterable/) 介面，並覆寫其中已有的 `iterator()`、`next()` 和 `hasNext()` 函式。例如：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-for-loop-inherit-iterator"}

> 進一步了解 [介面](interfaces.md) 和 [繼承](inheritance.md)。
> 
{style="tip"}

或者，您可以從頭開始建立這些函式。在這種情況下，請在函式中加入 `operator` 關鍵字：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-for-loop-iterator-from-scratch"}

## While 迴圈 {id="while-loops"}

`while` 和 `do-while` 迴圈會在滿足條件時持續執行其主體中的程式碼。兩者之間的區別在於檢查條件的時間點：

* `while` 檢查條件，如果滿足，則執行其主體中的程式碼，然後返回條件檢查。
* `do-while` 先執行其主體中的程式碼，然後檢查條件。如果滿足，則重複迴圈。因此，無論條件如何，`do-while` 的主體至少會執行一次。

對於 `while` 迴圈，請將要檢查的條件放在圓括號 `()` 中，並將主體放在花括號 `{}` 中：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-while-loop"}

對於 `do-while` 迴圈，請先將主體放在花括號 `{}` 中，然後再將要檢查的條件放在圓括號 `()` 中：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-do-while-loop"}

## 迴圈中的 break 與 continue {id="break-and-continue-in-loops"}

Kotlin 支援在迴圈中使用傳統的 `break` 和 `continue` 運算子。請參閱 [返回與跳轉](returns.md)。