[//]: # (title: 条件与循环)

Kotlin 为你提供了灵活的工具来控制程序流程。使用 `if`、`when` 和循环为你的条件定义清晰、富有表现力的逻辑。

## If 表达式 {id="if-expression"}

在 Kotlin 中使用 `if` 时，需将要检查的条件放在圆括号 `()` 中，并将结果为 true 时执行的操作放在花括号 `{}` 中。你可以使用 `else` 和 `else if` 来添加额外的分支与检查。

你还可以将 `if` 作为表达式使用，从而将其返回值直接赋给变量。在这种形式下，`else` 分支是必需的。`if` 表达式的作用与其它语言中的三元运算符（`condition ? then : else`）相同。

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

    // 将 if 作为表达式使用
    taller = if (heightAlice > heightBob) heightAlice else heightBob

    // 将 else if 作为表达式使用：
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

`if` 表达式的每个分支都可以是一个代码块，其中最后一个表达式的值将作为该分支的结果：

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

## When 表达式与语句 {id="when-expressions-and-statements"}

`when` 是一种根据多个可能的值或条件来运行代码的条件表达式。它类似于 Java、C 以及其他语言中的 `switch` 语句。`when` 会对其实参进行求值，并依次与每个分支进行比较，直到满足某个分支的条件为止。例如：

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

你可以将 `when` 用作**表达式**或**语句**。作为表达式时，`when` 会返回一个可在后续代码中使用的值。作为语句时，`when` 仅执行操作而不返回任何结果：

<table>
   <tr>
       <td>表达式</td>
       <td>语句</td>
   </tr>
   <tr>
<td>

```kotlin
// 返回一个赋给 text 变量的字符串
val text = when (x) {
    1 -> "x == 1"
    2 -> "x == 2"
    else -> "x is neither 1 nor 2"
}
```

</td>
<td>

```kotlin
// 不返回结果，但触发 print 语句
when (x) {
    1 -> print("x == 1")
    2 -> print("x == 2")
    else -> print("x is neither 1 nor 2")
}
```

</td>
</tr>
</table>

其次，`when` 可以在包含或不包含主体（subject）的情况下使用。无论哪种方式，其行为都是相同的。使用主体通常可以使代码更具可读性和可维护性，因为它可以清晰地展示正在检查的内容。

<table>
   <tr>
       <td>包含主体 <code>x</code></td>
       <td>不包含主体</td>
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

使用 `when` 的方式决定了是否需要在分支中覆盖所有可能的情况。覆盖所有可能的情况称为**穷尽**（_exhaustive_）。

### 语句 {id="statements"}

如果将 `when` 作为语句使用，则不需要覆盖所有可能的情况。在以下示例中，由于某些情况未被覆盖，因此不会触发任何分支。但此时不会发生错误：

```kotlin
fun main() {
    //sampleStart
    val deliveryStatus = "OutForDelivery"
    when (deliveryStatus) {
        // 未覆盖所有情况
        "Pending" -> print("Your order is being prepared")
        "Shipped" -> print("Your order is on the way")
    }
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-when-statement"}

与 `if` 类似，每个分支都可以是一个代码块，其值由块中最后一个表达式的值决定。

### 表达式 {id="expressions"}

如果将 `when` 作为表达式使用，则**必须**覆盖所有可能的情况。第一个匹配分支的值将作为整个表达式的值。如果未覆盖所有情况，编译器将抛出错误。

如果 `when` 表达式包含主体，你可以使用 `else` 分支来确保覆盖所有可能的情况，但这并不是强制要求的。例如，如果你的主体是 `Boolean`、[`enum` 类](enum-classes.md)、[`sealed` 类](sealed-classes.md)或它们对应的可空类型，你可以在没有 `else` 分支的情况下覆盖所有情况：

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
        // 不需要 else 分支，因为已覆盖所有情况
        Bit.ZERO -> 0
        Bit.ONE -> 1
    }

    println("Random bit as number: $numericValue")
    // Random bit as number: 0
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-when-expression-subject"}

> 为简化 `when` 表达式并减少重复，可以尝试上下文相关解析（目前处于预览阶段）。
> 如果预期类型已知，该功能允许你在 `when` 表达式中使用枚举条目或密封类成员时省略类型名称。
> 
> 欲了解更多信息，请参阅[上下文相关解析预览](whatsnew22.md#preview-of-context-sensitive-resolution)或相关的 [KEEP 提案](https://github.com/Kotlin/KEEP/blob/improved-resolution-expected-type/proposals/context-sensitive-resolution.md)。
> 
{style="tip"}

如果 `when` 表达式**没有**主体，则**必须**包含一个 `else` 分支，否则编译器将报错。当没有满足其他任何分支条件时，将对 `else` 分支求值：

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

`when` 表达式和语句提供了多种方式来简化代码、处理多个条件并执行类型检查。

使用逗号将多个条件组合到单个分支中：

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

使用求值结果为 `true` 或 `false` 的表达式作为分支条件：

```kotlin
fun main() {
    val storedPin = "1234"
    val enteredPin = 1234
  
    //sampleStart
    when (enteredPin) {
        // 表达式
        storedPin.toInt() -> print("PIN is correct")
        else -> print("Incorrect PIN")
    }
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-when-branch-expression"}

使用 `in` 或 `!in` 关键字检查某个值是否包含在[区间](ranges.md)或集合中：

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

使用 `is` 或 `!is` 关键字检查值的类型。得益于[智能转换](typecasts.md#smart-casts)，你可以直接访问该类型的成员函数和属性：

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

使用 `when` 取代传统的 `if`-`else` `if` 链。
在不包含主体时，分支条件仅是普通的布尔表达式。首个条件为 `true` 的分支将会运行：

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

最后，可以通过以下语法将主体捕获到变量中：

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

作为主体引入的变量的作用域仅限于 `when` 表达式或语句的主体之内。

### 守卫条件 {id="guard-conditions-in-when-expressions"}

守卫条件允许你在 `when` 表达式或语句的分支中添加多个条件，使复杂的控制流更加明确且简洁。只要 `when` 包含主体，就可以使用守卫条件。

将守卫条件放在同一分支的主条件之后，并用 `if` 分隔：

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
        // 仅包含主条件的分支
        // 当 animal 为 Dog 时调用 feedDog()
        is Animal.Dog -> feedDog()
        // 同时包含主条件和守卫条件的分支
        // 当 animal 为 Cat 且不是 mouseHunter 时调用 feedCat()
        is Animal.Cat if !animal.mouseHunter -> feedCat()
        // 如果上述条件都不匹配，则输出 "Unknown animal"
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

如果使用逗号分隔了多个条件，则不能使用守卫条件。例如：

```kotlin
0, 1 -> print("x == 0 or x == 1")
```

在单个 `when` 表达式或语句中，你可以混合使用包含守卫条件和不包含守卫条件的分支。
包含守卫条件的分支中的代码仅在主条件与守卫条件求值结果均为 `true` 时才会执行。
如果主条件不匹配，则不会对守卫条件求值。

由于 `when` 语句无需覆盖所有情况，因此在没有 `else` 分支的 `when` 语句中使用守卫条件意味着如果没有任何条件匹配，则不会执行任何代码。

与语句不同，`when` 表达式必须覆盖所有情况。如果在没有 `else` 分支的 `when` 表达式中使用守卫条件，编译器将要求你处理所有可能的情况，以避免运行时错误。

在单个分支中使用布尔运算符 `&&`（与）或 `||`（或）组合多个守卫条件。
建议使用圆括号包裹布尔表达式以[避免混淆](coding-conventions.md#guard-conditions-in-when-expression)：

```kotlin
when (animal) {
    is Animal.Cat if (!animal.mouseHunter && animal.hungry) -> feedCat()
}
```

守卫条件还支持 `else if`：

```kotlin
when (animal) {
    // 检查 `animal` 是否为 `Dog`
    is Animal.Dog -> feedDog()
    // 检查 `animal` 是否为 `Cat` 且不是 `mouseHunter` 的守卫条件
    is Animal.Cat if !animal.mouseHunter -> feedCat()
    // 如果上述条件都不匹配且 animal.eatsPlants 为 true，则调用 giveLettuce()
    else if animal.eatsPlants -> giveLettuce()
    // 如果上述条件都不匹配，则输出 "Unknown animal"
    else -> println("Unknown animal")
}
```

### JVM 上的字节码生成 {id="bytecode-generation-on-the-jvm"}

当针对 JVM 21 或更高版本编译 Kotlin 代码时，编译器会为符合条件的 `when` 表达式生成 [`invokedynamic`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/invoke/package-summary.html) 指令。这将生成更小的字节码，类似于 Java `switch` 语句所生成的字节码。

当满足以下所有条件时，编译器会将 `invokedynamic` 与 [`SwitchBootstraps.typeSwitch()`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/runtime/SwitchBootstraps.html) 方法配合使用：

* 除 `else` 外的所有条件均为 `is` 或 `null` 检查。
* 该 `when` 表达式不包含[守卫条件（`if`）](#guard-conditions-in-when-expressions)。
* 条件中不包含无法直接进行类型检查的类型，例如 Kotlin 可变集合（`MutableList`）或函数类型（`kotlin.Function1`、`kotlin.Function2` 等）。
* 该 `when` 表达式除 `else` 外至少包含两个条件。
* 所有分支检查的都是该 `when` 表达式的同一个主体。

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

这里的 `when (shape)` 表达式在字节码中会编译为一个单独的 `invokedynamic` 类型 switch，而不是多次 `instanceof` 检查。

## For 循环 {id="for-loops"}

使用 `for` 循环遍历[集合](collections-overview.md)、[数组](arrays.md)或[区间](ranges.md)：

```kotlin
for (item in collection) print(item)
```

`for` 循环的主体可以是用花括号 `{}` 包裹的代码块。

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

### 区间 {id="ranges"}

要遍历数字区间，请使用包含 `..` 和 `..<` 运算符的[区间表达式](ranges.md)：

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

### 数组 {id="arrays"}

如果你想通过索引遍历数组或列表，可以使用 `indices` 属性：

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

或者，也可以使用标准库中的 [`.withIndex()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/with-index.html) 函数：

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

`for` 循环可以遍历任何提供[迭代器](iterators.md)的对象。集合默认提供迭代器，而区间和数组则会被编译为基于索引的循环。

你可以通过提供一个名为 `iterator()` 且返回 `Iterator<>` 的成员函数或扩展函数来创建自定义迭代器。
该 `iterator()` 函数必须包含一个 `next()` 函数以及一个返回 `Boolean` 的 `hasNext()` 函数。

为类创建自定义迭代器最简单的方法是继承 [`Iterable<T>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-iterable/) 接口，并重写已有的 `iterator()`、`next()` 和 `hasNext()` 函数。例如：

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

> 了解关于[接口](interfaces.md)与[继承](inheritance.md)的更多信息。
> 
{style="tip"}

或者，你也可以从头开始创建这些函数。在这种情况下，需为函数添加 `operator` 关键字：

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

## While 循环 {id="while-loops"}

在条件满足期间，`while` 和 `do-while` 循环会持续运行其主体中的代码。
它们之间的区别在于检查条件的时机：

* `while` 会先检查条件，如果满足，则运行其主体中的代码，然后返回继续检查条件。
* `do-while` 会先运行其主体中的代码，然后检查条件。如果满足，循环将重复执行。因此，无论条件是否满足，`do-while` 的主体都会至少运行一次。

对于 `while` 循环，需将要检查的条件放在圆括号 `()` 中，并将主体放在花括号 `{}` 中：

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

对于 `do-while` 循环，需先将主体放在花括号 `{}` 中，然后再将要检查的条件放在圆括号 `()` 中：

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

## 循环中的 break 和 continue {id="break-and-continue-in-loops"}

Kotlin 在循环中支持传统的 `break` 和 `continue` 运算符。请参阅[返回与跳转](returns.md)。