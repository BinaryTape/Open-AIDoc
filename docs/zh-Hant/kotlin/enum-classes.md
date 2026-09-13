[//]: # (title: 列舉類別)

列舉類別表示一組固定的可能值。當某個值只能是數個預先定義的選項之一時（例如可用狀態或模式），請使用列舉類別。

列舉類別中的每個值都稱為一個 _列舉常數_。列舉常數的行為類似於列舉類別型別的 [singleton 物件](object-declarations.md)，因此它們可以擁有屬性、函式以及自訂行為。

當預先知道所有可能的值且它們具有相同的結構時，列舉類別是最適合的選擇。如果你需要為每種情況保存不同的資料或擁有不同的結構，請使用[密封類別或介面](sealed-classes.md)。

## 宣告列舉類別 {id="declare-enum-classes"}

若要建立列舉類別，請使用 `enum` 關鍵字，並遵循常見的類別語法，將主體包裹在花括號中。在類別主體內，列出以逗號分隔的列舉常數：

```kotlin
enum class Direction {
    NORTH, SOUTH, WEST, EAST
}
```

在此範例中，`Direction` 是列舉類別，而 `NORTH`、`SOUTH`、`WEST` 與 `EAST` 是列舉常數。

按照慣例，列舉常數通常以大寫書寫，因為它們代表常數值。

你可以透過列舉類別名稱後接常數名稱來存取列舉常數：

```kotlin
enum class Direction {
    NORTH, SOUTH, WEST, EAST
}

fun main() {
    // `Direction.NORTH` 是 `Direction` 型別的列舉常數。
    val direction: Direction = Direction.NORTH

    println(direction)
    // NORTH
}
```
{kotlin-runnable="true" id="create-enum-class-kotlin"}

Kotlin 中的每個列舉類別都繼承自 [`Enum<T>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-enum/) 基底類別，其中 `T` 是列舉類別本身。例如，`Direction` 列舉類別繼承自 `Enum<Direction>`。這就是為什麼列舉常數具有內建屬性，例如 [`name` 與 `ordinal`](#access-enum-constants-and-their-properties)。

## 使用列舉常數 {id="working-with-enum-constants"}

由於列舉常數是值，你可以將它們指派給變數、印出它們、傳遞給函式、進行比較，以及在 `when` 運算式中使用它們。

### 宣告列舉常數 {id="declare-enum-constants"}

若要宣告列舉常數，首先在列舉類別建構函式中定義屬性，然後在圓括號中將值傳遞給每個列舉常數。與某些其他語言不同，Kotlin 不使用指派語法（例如 `RED = "#FF0000"`）。

列舉常數可以具有任何型別的關聯值。字串和數字是常見的範例，但你也可以使用其他型別，例如 `Boolean`、另一個列舉類別或自訂類別。

以儲存每種顏色十六進位代碼的 `Color` 列舉類別為例：

```kotlin
enum class Color(val hex: String) {
    RED("#FF0000"),
    GREEN("#00FF00"),
    BLUE("#0000FF")
}
```

傳遞給每個列舉常數的值必須與建構函式參數型別相符。在此，`hex` 是 `Color` 列舉類別的字串屬性。每個列舉常數都為此屬性傳遞自己的字串值。

你也可以將數值與列舉常數建立關聯。例如，在建構函式中宣告 `Int` 型別，並為每個列舉常數提供一個 `Int` 值：

```kotlin
enum class Priority(val level: Int) {
    LOW(0),
    MEDIUM(1),
    HIGH(2)
}
```

### 存取列舉常數及其屬性 {id="access-enum-constants-and-their-properties"}

你可以透過列舉類別名稱存取列舉常數。若要存取與列舉常數關聯的屬性，請使用點標記法，例如 `color.hex` 或 `Color.GREEN.hex`：

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

此處的 `Color.RED` 是 `Color` 型別的列舉常數。`color` 變數儲存了此列舉常數。

除了你定義的任何屬性之外，每個列舉常數還具有內建的 `name` 和 `ordinal` 屬性，用於在列舉類別宣告中獲取其名稱和位置（從 `0` 開始）：

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

### 將列舉常數傳遞給函式 {id="pass-enum-constants-to-functions"}

由於列舉常數是值，你可以將它們傳遞給函式。透過這種方式，函式僅接受列舉類別中定義的固定選項集，從而確保型別安全的程式碼：

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

在此範例中，`printColor()` 函式接受一個 `Color` 型別的值，因此你可以將任何 `Color` 列舉常數傳遞給它。

雖然列舉常數的行為類似於 singleton 物件，但編譯器會將它們視為列舉類別型別的值。你可以使用列舉類別名稱本身作為型別，但不能將列舉常數用作列舉型別：

```kotlin
enum class Color {
    RED, GREEN, BLUE
}

fun printColor(color: Color) {
    println(color)
}

fun printRed(color: Color.RED) {
    println(color)
    // 錯誤：列舉項目不能用作型別
}
```

### 在 `when` 運算式中使用列舉常數 {id="use-enum-constants-in-when-expressions"}

當你想要分別處理每個常數時，列舉類別最適合與 `when` 運算式搭配使用：

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

當你在 `when` 運算式中使用所有列舉常數時，不需要 `else` 分支。

> 為了減少使用列舉項目時的重複作業，請嘗試上下文相關解析（目前為預覽版）。此特性允許在已知預期型別時省略列舉類別名稱，例如在 `when` 運算式中或指派給型別化變數時。
>
> 若要了解更多資訊，請參閱[上下文相關解析預覽](whatsnew22.md#preview-of-context-sensitive-resolution)或相關的 [KEEP 提案](https://github.com/Kotlin/KEEP/blob/improved-resolution-expected-type/proposals/context-sensitive-resolution.md)。
>
{style="tip"}

### 尋找列舉常數 {id="find-enum-constants"}

有時你需要從字串、索引或其關聯值之一取得列舉常數。Kotlin 提供了內建 API，可依名稱、位置或自訂值來查閱常數。

例如，考慮一個每個顏色都有關聯 RGB 值的列舉類別。若要依名稱尋找列舉常數，請使用 `valueOf()` 函式：

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

傳遞給 `valueOf()` 的名稱必須與列舉常數名稱完全相符。如果沒有具有指定名稱的列舉常數，`valueOf()` 將拋出 `IllegalArgumentException`。

若要依列舉宣告中的位置尋找列舉常數，請在列舉的 `entries` 屬性上使用 [`getOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/get-or-null.html) 函式：

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

列舉位置從 `0` 開始。在此範例中，`RED` 的位置為 `0`，`GREEN` 為 `1`，而 `BLUE` 為 `2`。

當你有一個代表列舉常數位置的整數（例如來自檔案或使用者輸入）時，這會非常有用。與某些其他語言不同，Kotlin 不允許你將 `Int` 直接轉換為列舉常數。相反地，請將該整數用作索引，並使用 `entries.getOrNull(index)` 查閱該常數。

如果整數代表的值即使在重新排列列舉常數時也應保持穩定，請定義明確的數值屬性（例如 `rgb` 或 `code`），並搜尋具有相符值的常數。

由於 `entries` 是一個特殊化的 `List`，因此你可以對其使用標準集合 API。例如，若要依關聯值尋找列舉常數，請使用 [`first()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first.html) 搜尋 `entries`：

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

如果找不到相符的常數，`first()` 函式將拋出 `NoSuchElementException`。若要改為取得 `null`，請使用 [`firstOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first-or-null.html)。

若要取得列舉常數的數量，請使用 [`size`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-list/size.html) 屬性。例如：

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

如果你經常需要依名稱、位置或關聯值查閱列舉常數，可以在[伴生物件 (companion object)](object-declarations.md#companion-objects)中新增幫助程式函式：

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

當你想要進行安全的查閱並傳回 `null` 而不是拋出例外時，伴生物件幫助程式函式非常實用。

上述使用的查閱 API（例如 `entries` 和 `valueOf()`）是 _合成 (synthetic)_ 成員的範例。在此上下文中，合成表示 Kotlin 會自動提供這些成員，即使你沒有親自宣告它們。這就是為什麼每個列舉類別都可以透過 `entries` 屬性列出其常數，並透過 `valueOf()` 函式依名稱取得常數，而無需撰寫額外程式碼。

你可以使用通用幫助程式函式（例如 [`enumEntries<T>()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.enums/enum-entries.html) 和 [`enumValueOf<T>()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/enum-value-of.html)）存取列舉類別中的常數。這些函式使用[具體化型別參數](inline-functions.md#reified-type-parameters)。此類參數可在泛型內嵌函式內部保持實際列舉型別可用，因此幫助程式函式可以直接使用列舉型別 `T`：

| 函式 | 說明 |
|---|---|
| [`enumEntries<T>()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.enums/enum-entries.html) | （建議）傳回列舉型別 `T` 的所有列舉項目。每次呼叫都會傳回相同的清單。 |
| [`enumValues<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/enum-values.html) | 傳回包含列舉型別 `T` 所有列舉項目的陣列。每次呼叫 `enumValues<T>()` 都會建立一個新陣列。 |
| [`enumValueOf<T>()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/enum-value-of.html) | 依名稱傳回單一列舉項目，如果沒有符合的列舉項目，則拋出 `IllegalArgumentException`。 |

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

若要進一步了解內嵌函式和具體化型別參數，請參閱[內嵌函式](inline-functions.md)。

### 比較和排序列舉常數 {id="compare-and-sort-enum-constants"}

使用 `==` [結構相等性](equality.md#structural-equality)運算子來比較列舉常數：

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

由於每個列舉常數的行為類似於 singleton 物件，因此比較列舉常數會檢查兩個值是否參照同一個常數。

所有列舉類別預設都實作了 [`Comparable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-comparable/index.html) 介面，因此你可以比較和排序列舉常數。常數是依其在列舉宣告中的位置（它們的 `ordinal` 值）進行排序的，這表示最先宣告的常數被視為最小：

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

排序遵循相同的宣告順序。例如，`entries.sorted()` 會依照常數宣告的順序傳回常數，而不論其名稱為何：

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

`Enum<T>` 類別提供了 `compareTo()`、`equals()` 和 `hashCode()` 函式，你不能像在普通類別中那樣覆寫它們來自訂其行為。比較始終遵循宣告順序。

如果你需要不同的順序，請不要依賴宣告順序。相反地，請定義明確的屬性並依其排序。例如，依亮度排序顏色：

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

若要了解更多資訊，請參閱[排序](collection-ordering.md)。

## 在列舉類別中加入函式 {id="add-functions-to-enum-classes"}

就像屬性一樣，列舉類別也可以擁有函式。你可以加入所有列舉常數共用的函式、將它們與屬性結合，或定義運算子函式。

### 加入所有常數共用的函式 {id="add-functions-shared-by-all-constants"}

若要加入每個列舉常數共用的行為，請在列舉類別主體中定義函式。如果列舉類別定義了任何成員，請使用分號將常數定義與成員定義隔開：

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

每個列舉常數都可以呼叫該共用函式。在函式內部，`this` 參照呼叫它的列舉常數。

你可以將建構函式屬性與函式結合，將資料與每個常數建立關聯，並加入使用該資料的行為：

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

在此範例中，每個常數都儲存自己的 `hex` 值，而共用的 `describe()` 函式同時使用了內建的 `name` 屬性和 `hex` 屬性。

### 加入運算子函式 {id="add-operator-functions"}

列舉類別也可以定義[運算子函式](operator-overloading.md)，以便你可以搭配運算子使用列舉常數。例如，定義 `not()` 運算子函式，以便使用 `!` 運算子傳回相反的方向：

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

## 使用匿名類別 {id="use-anonymous-classes"}

列舉常數可以宣告自己的匿名類別及其對應的函式，也可以覆寫基底函式。使用匿名類別時，你可以直接在列舉常數名稱後撰寫類別主體，Kotlin 會將列舉類別推論為超型別。

當你在列舉類別中宣告抽象函式並要求每個常數提供自己的實作時，這會非常實用。每個常數都會在自己的匿名類別中覆寫該抽象函式：

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

在此範例中，每個常數以不同的方式實作抽象 `signal()` 函式，因此呼叫 `signal()` 會根據常數傳回不同的下一個狀態。

雖然列舉常數的行為類似於 singleton 物件，但列舉常數的型別是列舉類別本身，而不是其自身的匿名類別。這就是為什麼你無法存取宣告在匿名類別主體內部的成員：

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
    // 錯誤：未解決的參照 'waitingMessage'
}
```

若要為每個常數公開資料或行為，請在列舉類別主體中宣告它，當每個常數都需要自己的實作時，請使用抽象成員。

## 在列舉類別中實作介面 {id="implement-interfaces-in-enum-classes"}

列舉類別可以實作介面，但不能繼承類別。你可以為所有列舉常數提供介面成員的通用實作，或者讓每個常數在匿名類別中提供自己的實作。

若要實作介面，請將其新增至列舉類別宣告中：

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

在此範例中，`IntArithmetics` 列舉類別在列舉類別宣告中實作了兩個介面：`BinaryOperator<Int>` 和 `IntBinaryOperator`。每個常數都可以在其自己的匿名類別主體內部覆寫介面成員（如同 `PLUS` 和 `TIMES` 對 `apply()` 所做的），而 `applyAsInt()` 則為所有常數提供了共用實作。