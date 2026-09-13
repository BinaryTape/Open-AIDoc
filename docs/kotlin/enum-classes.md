[//]: # (title: 枚举类)

枚举类表示一组固定的可能值。当一个值只能是若干预定义选项之一（例如可用状态或模式）时，可以使用枚举类。

枚举类中的每个值都称为一个*枚举常量*。枚举常量的行为类似于枚举类类型的[单例对象](object-declarations.md)，因此它们可以拥有属性、函数和自定义行为。

当所有可能的值在事前已知且具有相同结构时，枚举类是最佳选择。如果需要为每种情况保存不同的数据或拥有不同的结构，请使用[密封类或密封接口](sealed-classes.md)。

## 声明枚举类 {id="declare-enum-classes"}

要创建枚举类，请使用 `enum` 关键字，并遵循常规的类语法，其主体用花括号括起来。在类主体内部，列出用逗号分隔的枚举常量：

```kotlin
enum class Direction {
    NORTH, SOUTH, WEST, EAST
}
```

在此示例中，`Direction` 是枚举类，而 `NORTH`、`SOUTH`、`WEST` 和 `EAST` 是枚举常量。

按照惯例，枚举常量通常使用大写字母书写，因为它们代表常量值。

你可以通过使用枚举类名称后跟常量名称来访问枚举常量：

```kotlin
enum class Direction {
    NORTH, SOUTH, WEST, EAST
}

fun main() {
    // `Direction.NORTH` 是 `Direction` 类型的枚举常量。
    val direction: Direction = Direction.NORTH

    println(direction)
    // NORTH
}
```
{kotlin-runnable="true" id="create-enum-class-kotlin"}

Kotlin 中的每个枚举类都继承自 [`Enum<T>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-enum/) 基类，其中 `T` 是枚举类本身。例如，`Direction` 枚举类继承自 `Enum<Direction>`。这也是枚举常量具有内置属性（例如 [`name` 和 `ordinal`](#access-enum-constants-and-their-properties)）的原因。

## 使用枚举常量 {id="working-with-enum-constants"}

由于枚举常量也是值，因此你可以将它们赋值给变量、打印它们、作为实参传递给函数、对它们进行比较，以及在 `when` 表达式中使用它们。

### 声明枚举常量 {id="declare-enum-constants"}

要声明枚举常量，首先在枚举类构造函数中定义属性，然后在圆括号中将值传递给每个枚举常量。与某些其他语言不同，Kotlin 不使用赋值语法（例如 `RED = "#FF0000"`）。

枚举常量可以具有任何类型的关联值。字符串和数字是常见的示例，但你也可以使用其他类型，例如 `Boolean`、另一个枚举类或自定义类。

考虑以下 `Color` 枚举类，它为每种颜色存储一个十六进制颜色代码：

```kotlin
enum class Color(val hex: String) {
    RED("#FF0000"),
    GREEN("#00FF00"),
    BLUE("#0000FF")
}
```

传递给每个枚举常量的值必须与构造函数形参类型匹配。在这里，`hex` 是 `Color` 枚举类的字符串属性。每个枚举常量都会为该属性传递自己的字符串值。

你还可以将数值与枚举常量关联。例如，在构造函数中声明 `Int` 类型，并为每个枚举常量提供一个 `Int` 值：

```kotlin
enum class Priority(val level: Int) {
    LOW(0),
    MEDIUM(1),
    HIGH(2)
}
```

### 访问枚举常量及其属性 {id="access-enum-constants-and-their-properties"}

你可以通过枚举类名称访问枚举常量。要访问与枚举常量关联的属性，请使用点表示法，例如 `color.hex` 或 `Color.GREEN.hex`：

```kotlin
enum class Color(val hex: String) {
    RED("#FF0000"),
    GREEN("#00FF00"),
    BLUE("#0000FF")
}

fun main() {
    val color: Color = Color.RED

    println(color)
    // RED
    println(color.hex)
    // #FF0000
    println(Color.GREEN.hex)
    // #00FF00
}
```
{kotlin-runnable="true" id="access-enum-properties-kotlin"}

在这里，`Color.RED` 是 `Color` 类型的枚举常量。`color` 变量存储了该枚举常量。

除了你定义的任何属性之外，每个枚举常量还具有内置的 `name` 和 `ordinal` 属性，用于获取其在枚举类声明中的名称和位置（从 `0` 开始）：

```kotlin
enum class RGB { RED, GREEN, BLUE }

fun main() {
    println(RGB.RED.name)
    // RED
    println(RGB.RED.ordinal)
    // 0
}
```
{kotlin-runnable="true" id="rgb-enums-properties-kotlin"}

### 将枚举常量传递给函数 {id="pass-enum-constants-to-functions"}

由于枚举常量也是值，因此你可以将它们传递给函数。这样，函数仅接受枚举类中定义的固定选项集，从而确保类型安全的代码：

```kotlin
enum class Color(val hex: String) {
    RED("#FF0000"),
    GREEN("#00FF00"),
    BLUE("#0000FF")
}

//sampleStart
fun printColor(color: Color) {
    println("Color: $color")
    println("Hex code: ${color.hex}")
}

fun main() {
    printColor(Color.BLUE)
    // Color: BLUE
    // Hex code: #0000FF
}
//sampleEnd
```
{kotlin-runnable="true" id="pass-enum-to-function-kotlin"}

在此处，`printColor()` 函数接受 `Color` 类型的值，因此你可以将任何 `Color` 枚举常量传递给它。

尽管枚举常量的行为类似于单例对象，但编译器会将它们视为枚举类类型的值。你可以使用枚举类名称本身作为类型，但不能将枚举常量用作枚举类型：

```kotlin
enum class Color {
    RED, GREEN, BLUE
}

fun printColor(color: Color) {
    println(color)
}

fun printRed(color: Color.RED) {
    println(color)
    // 错误：枚举条目不能用作类型
}
```

### 在 `when` 表达式中使用枚举常量 {id="use-enum-constants-in-when-expressions"}

当你想要分别处理每个常量时，枚举类与 `when` 表达式配合使用效果最佳：

```kotlin
enum class Color(val hex: String) {
    RED("#FF0000"),
    GREEN("#00FF00"),
    BLUE("#0000FF")
}

//sampleStart
fun describeColor(color: Color): String {
    return when (color) {
        Color.RED -> "Red is a warm color"
        Color.GREEN -> "Green is a natural color"
        Color.BLUE -> "Blue is a cool color"
    }
}

fun main() {
    println(describeColor(Color.RED))
    // Red is a warm color
}
//sampleEnd
```
{kotlin-runnable="true" id="enum-when-expression-kotlin"}

当你在 `when` 表达式中使用所有枚举常量时，不需要 `else` 分支。

> 为了在处理枚举条目时减少重复，请尝试使用上下文相关解析（目前处于预览阶段）。此功能允许在已知预期类型时省略枚举类名称，例如在 `when` 表达式中或赋值给类型化变量时。
>
> 更多信息请参阅[上下文相关解析预览](whatsnew22.md#preview-of-context-sensitive-resolution)或相关的 [KEEP 提案](https://github.com/Kotlin/KEEP/blob/improved-resolution-expected-type/proposals/context-sensitive-resolution.md)。
>
{style="tip"}

### 查找枚举常量 {id="find-enum-constants"}

有时你需要根据字符串、索引或其某个关联值来获取枚举常量。Kotlin 提供了内置的 API，用于按名称、位置或自定义值查找常量。

例如，考虑一个每个颜色都有关联 RGB 值的枚举类。要按名称查找枚举常量，请使用 `valueOf()` 函数：

```kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF)
}

fun main() {
    val color = Color.valueOf("RED")

    println(color)
    // RED
}
```
{kotlin-runnable="true" id="find-enum-valueof-kotlin"}

传递给 `valueOf()` 的名称必须与枚举常量名称完全匹配。如果不存在具有指定名称的枚举常量，`valueOf()` 会抛出 `IllegalArgumentException`。

要按枚举常量在枚举声明中的位置查找它，请在枚举的 `entries` 属性上使用 [`getOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/get-or-null.html) 函数：

```kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF)
}

//sampleStart
fun main() {
    val color = Color.entries.getOrNull(0)

    println(color)
    // RED
}
//sampleEnd
```
{kotlin-runnable="true" id="find-enum-getornull-kotlin"}

枚举位置从 `0` 开始。在此示例中，`RED` 的位置为 `0`，`GREEN` 为 `1`，`BLUE` 为 `2`。

当你拥有一个表示枚举常量位置的整数（例如来自文件或用户输入）时，这非常有用。与某些其他语言不同，Kotlin 不允许你直接将 `Int` 转换为枚举常量。相反，应将该整数用作索引，并通过 `entries.getOrNull(index)` 查找常量。

如果该整数表示即使对枚举常量重新排序也应保持稳定的值，请定义显式的数字属性（例如 `rgb` 或 `code`），并搜索具有匹配值的常量。

由于 `entries` 是专门的 `List`，因此你可以对其使用标准的集合 API。例如，要按关联值查找枚举常量，可以使用 [`first()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first.html) 在条目中搜索：

```kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF)
}

//sampleStart
fun main() {
    val color = Color.entries.first { it.rgb == 0xFF0000 }

    println(color)
    // RED
}
//sampleEnd
```
{kotlin-runnable="true" id="find-enum-first-kotlin"}

如果未找到匹配的常量，`first()` 函数将抛出 `NoSuchElementException`。若要获取 `null`，请使用 [`firstOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first-or-null.html)。

要获取枚举常量的数量，请使用 [`size`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-list/size.html) 属性。例如：

```kotlin
enum class RGB { RED, GREEN, BLUE }

fun main() {
    println(RGB.entries)
    // [RED, GREEN, BLUE]
    println(RGB.entries.size)
    // 3
    println("The first color is: ${RGB.valueOf("RED")}")
    // "The first color is: RED"
}
```
{kotlin-runnable="true" id="rgb-enums-entries-kotlin"}

如果你经常需要按名称、位置或关联值查找枚举常量，可以在[伴生对象](object-declarations.md#companion-objects)中添加帮助程序函数：

```kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF);

    companion object {
        fun fromName(name: String): Color? =
            entries.find { it.name == name }

        fun fromPosition(position: Int): Color? =
            entries.getOrNull(position)

        fun fromRgb(rgb: Int): Color? =
            entries.find { it.rgb == rgb }
    }
}

fun main() {
    println(Color.fromName("RED"))
    // RED
    println(Color.fromPosition(1))
    // GREEN
    println(Color.fromRgb(0x0000FF))
    // BLUE
    println(Color.fromRgb(0xABCDEF))
    // null
}
```
{kotlin-runnable="true" id="find-enum-companion-object-kotlin"}

当需要安全查找并返回 `null` 而不是抛出异常时，伴生对象的帮助程序函数非常有用。

上面使用的查找 API（例如 `entries` 和 `valueOf()`）是*合成*成员的示例。在本文上下文中，合成意味着 Kotlin 自动提供这些成员，即使你没有亲自声明它们。这就是为什么每个枚举类都可以通过 `entries` 属性列出其常量，并通过 `valueOf()` 函数按名称获取常量，而无需编写额外代码的原因。

你可以使用通用帮助程序函数（如 [`enumEntries<T>()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.enums/enum-entries.html) 和 [`enumValueOf<T>()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/enum-value-of.html)）访问枚举类中的常量。这些函数使用了[具体化类型形参](inline-functions.md#reified-type-parameters)。此类形参可以在泛型内联函数内保留实际的枚举类型，以便帮助程序函数可以直接使用枚举类型 `T`：

| 函数 | 描述 |
|---|---|
| [`enumEntries<T>()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.enums/enum-entries.html) | （推荐）返回枚举类型 `T` 的所有枚举条目。每次调用都会返回同一个列表。 |
| [`enumValues<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/enum-values.html) | 返回包含枚举类型 `T` 的所有枚举条目的数组。每次调用 `enumValues<T>()` 都会创建一个新数组。 |
| [`enumValueOf<T>()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/enum-value-of.html) | 按名称返回单个枚举条目，如果没有匹配的枚举条目，则抛出 `IllegalArgumentException`。 |

例如：

```kotlin
import kotlin.enums.enumEntries

enum class RGB { RED, GREEN, BLUE }

inline fun <reified T : Enum<T>> printAllValues() {
    println(enumEntries<T>().joinToString { it.name })
}

inline fun <reified T : Enum<T>> findByName(name: String): T = enumValueOf<T>(name)

fun main() {
    printAllValues<RGB>()
    // RED, GREEN, BLUE
    println(findByName<RGB>("GREEN"))
    // GREEN
}
```
{kotlin-runnable="true" id="enum-reified-type-parameters-kotlin"}

有关内联函数和具体化类型参数的更多信息，请参阅[内联函数](inline-functions.md)。

### 比较和排序枚举常量 {id="compare-and-sort-enum-constants"}

使用 `==` [结构相等](equality.md#structural-equality)运算符来比较枚举常量：

```kotlin
enum class Color(val hex: String) {
    RED("#FF0000"),
    GREEN("#00FF00"),
    BLUE("#0000FF")
}

//sampleStart
fun main() {
    val color = Color.RED

    println(color == Color.RED)
    // true
    println(color == Color.BLUE)
    // false
}
//sampleEnd
```
{kotlin-runnable="true" id="compare-enum-constants-kotlin"}

由于每个枚举常量的行为都类似于单例对象，因此比较枚举常量实质上是在检查两个值是否引用同一个常量。

所有枚举类默认都实现了 [`Comparable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-comparable/index.html) 接口，因此你可以比较和排序枚举常量。常量按其在枚举声明中的位置（它们的 `ordinal` 值）排序，这意味着最先声明的常量被视为最小：

```kotlin
enum class Priority {
    LOW, MEDIUM, HIGH
}

fun main() {
    println(Priority.LOW < Priority.HIGH)
    // true
    println(Priority.HIGH > Priority.MEDIUM)
    // true
}
```
{kotlin-runnable="true" id="compare-enum-comparable-kotlin"}

排序遵循相同的声明顺序。例如，`entries.sorted()` 会按照常量声明的顺序返回它们，而不管它们的名称如何：

```kotlin
enum class Priority {
    HIGH, LOW, MEDIUM
}

fun main() {
    println(Priority.entries.sorted())
    // [HIGH, LOW, MEDIUM]
}
```
{kotlin-runnable="true" id="sort-enum-declaration-order-kotlin"}

`Enum<T>` 类提供了 `compareTo()`、`equals()` 和 `hashCode()` 函数，并且你不能像在普通类中那样重写它们来定制其行为。比较始终遵循声明顺序。

如果你需要不同的顺序，请不要依赖声明顺序。相反，应定义一个显式属性并按其进行排序。例如，按颜色的亮度对它们进行排序：

```kotlin
enum class Color(val brightness: Int) {
    RED(1),
    GREEN(3),
    BLUE(2)
}

fun main() {
    println(Color.entries.sortedBy { it.brightness })
    // [RED, BLUE, GREEN]
}
```
{kotlin-runnable="true" id="sort-enum-brightness-kotlin"}

更多信息请参阅[排序](collection-ordering.md)。

## 为枚举类添加函数 {id="add-functions-to-enum-classes"}

就像属性一样，枚举类也可以包含函数。你可以添加所有枚举常量共享的函数、将它们与属性组合，或定义运算符函数。

### 添加由所有常量共享的函数 {id="add-functions-shared-by-all-constants"}

要添加每个枚举常量共享的行为，请在枚举类主体中定义函数。如果枚举类定义了任何成员，请使用分号将常量定义与成员定义分开：

```kotlin
enum class Direction {
    NORTH, SOUTH, WEST, EAST;

    fun isVertical(): Boolean = this == NORTH || this == SOUTH
}

fun main() {
    println(Direction.NORTH.isVertical())
    // true
    println(Direction.EAST.isVertical())
    // false
}
```
{kotlin-runnable="true" id="enum-shared-function-kotlin"}

每个枚举常量都可以调用该共享函数。在函数内部，`this` 指向调用它的枚举常量。

你可以将构造函数属性与函数组合起来，将数据与每个常量相关联，并添加使用该数据的行为：

```kotlin
enum class Color(val hex: String) {
    RED("#FF0000"),
    GREEN("#00FF00"),
    BLUE("#0000FF");

    fun describe(): String = "$name has hex code $hex"
}

fun main() {
    println(Color.RED.describe())
    // RED has hex code #FF0000
}
```
{kotlin-runnable="true" id="enum-properties-functions-kotlin"}

在这里，每个常量都存储自己的 `hex` 值，而共享的 `describe()` 函数同时使用了内置的 `name` 属性和 `hex` 属性。

### 添加运算符函数 {id="add-operator-functions"}

枚举类还可以定义[运算符函数](operator-overloading.md)，以便你可以将枚举常量与运算符一起使用。例如，定义 `not()` 运算符函数以通过 `!` 运算符返回相反的方向：

```kotlin
enum class Direction {
    NORTH, SOUTH, WEST, EAST;

    operator fun not(): Direction = when (this) {
        NORTH -> SOUTH
        SOUTH -> NORTH
        WEST -> EAST
        EAST -> WEST
    }
}

fun main() {
    println(!Direction.NORTH)
    // SOUTH
}
```
{kotlin-runnable="true" id="enum-operator-function-kotlin"}

## 使用匿名类 {id="use-anonymous-classes"}

枚举常量可以声明自己的匿名类，其中包含相应的方法，以及重写的基类函数。使用匿名类时，你直接在枚举常量名称后编写类主体，Kotlin 会将枚举类推断为其超类型。

这在枚举类中声明了抽象函数并要求每个常量提供自己的实现时非常有用。每个常量都会在其自己的匿名类中重写该抽象函数：

```kotlin
enum class ProtocolState {
    WAITING {
        override fun signal() = TALKING
    },

    TALKING {
        override fun signal() = WAITING
    };

    abstract fun signal(): ProtocolState
}

fun main() {
    var state = ProtocolState.WAITING

    println(state)
    // WAITING
    state = state.signal()
    println(state)
    // TALKING
}
```
{kotlin-runnable="true" id="enum-abstract-function-kotlin"}

在这里，每个常量以不同的方式实现抽象 `signal()` 函数，因此调用 `signal()` 会根据常量返回不同的下一个状态。

尽管枚举常量的行为类似于单例对象，但枚举常量的类型是枚举类本身，而不是它自己的匿名类。这就是你无法访问在匿名类主体内部声明的成员的原因：

```kotlin
enum class ProtocolState {
    WAITING {
        val waitingMessage = "Waiting for a signal"
        override fun signal() = TALKING
    },

    TALKING {
        override fun signal() = WAITING
    };

    abstract fun signal(): ProtocolState
}

fun main() {
    println(ProtocolState.WAITING.waitingMessage)
    // 错误：无法解析的引用 'waitingMessage'
}
```

要为每个常量公开数据或行为，请在枚举类主体中进行声明；当每个常量需要自己的实现时，请使用抽象成员。

## 在枚举类中实现接口 {id="implement-interfaces-in-enum-classes"}

枚举类可以实现接口，但不能继承类。你可以为所有枚举常量提供接口成员的通用实现，也可以让每个常量在其匿名类中提供自己的实现。

要实现接口，请将其添加到枚举类声明中：

```kotlin
import java.util.function.BinaryOperator
import java.util.function.IntBinaryOperator

//sampleStart
enum class IntArithmetics : BinaryOperator<Int>, IntBinaryOperator {
    PLUS {
        override fun apply(t: Int, u: Int): Int = t + u
    },
    TIMES {
        override fun apply(t: Int, u: Int): Int = t * u
    };
    
    override fun applyAsInt(t: Int, u: Int) = apply(t, u)
}
//sampleEnd

fun main() {
    val a = 13
    val b = 31
    for (f in IntArithmetics.entries) {
        println("$f($a, $b) = ${f.apply(a, b)}")
    }
}
```
{kotlin-runnable="true" id="implement-interfaces-enum-kotlin"}

在此示例中，`IntArithmetics` 枚举类在枚举类声明中实现了两个接口：`BinaryOperator<Int>` 和 `IntBinaryOperator`。每个常量都可以在其自己的匿名类主体中重写接口成员（正如 `PLUS` 和 `TIMES` 针对 `apply()` 所做的那样），而 `applyAsInt()` 则为所有常量提供共享实现。