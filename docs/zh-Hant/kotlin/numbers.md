[//]: # (title: 數字)
<web-summary>了解如何在 Kotlin 中使用數字，包括數值型別、常值、轉換、算術運算、溢位以及 JVM 專屬行為。</web-summary>

Kotlin 的數值型別代表：
* 整數值（[Byte](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-byte/)、
  [Short](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-short/)、
  [Int](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-int/)
  與 [Long](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-long/)）
* 浮點數值（[Float](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-float/)
  與 [Double](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-double/)）

數值型別可用於儲存與處理數值資料，例如算術、計數器、測量值以及其他計算。

## 選擇數值型別 {id="choose-a-number-type"}

在大多數情況下，你可以參考以下規則來決定適合該任務的數值型別：

* 整數請使用 `Int`。
* 超出 `Int` 範圍的整數請使用 `Long`。
* 帶有小數的數字請使用 `Double`。
* 當可接受或需要較低精度時，請使用 `Float`。
* 當 API 或資料格式有明確要求時，請使用 `Byte` 與 `Short`。

> Kotlin 也提供了 [](unsigned-integer-types.md) 作為 Beta 功能。
>
{style="tip"}

## 整數型別 {id="integer-types"}

Kotlin 提供四種不同大小與數值範圍的整數型別：

| 型別	    | 大小（位元） | 最小值                                       | 最大值                                         |
|----------|-------------|----------------------------------------------|------------------------------------------------|
| `Byte`	  | 8           | -128                                         | 127                                            |
| `Short`	 | 16          | -32768                                       | 32767                                          |
| `Int`	   | 32          | -2,147,483,648 (-2<sup>31</sup>)             | 2,147,483,647 (2<sup>31</sup> - 1)             |
| `Long`	  | 64          | -9,223,372,036,854,775,808 (-2<sup>63</sup>) | 9,223,372,036,854,775,807 (2<sup>63</sup> - 1) |

### 宣告整數值 {id="declare-integer-values"}

Kotlin 支援下列整數常值形式：

* 十進位：`123`
* 十六進位：`0x0F`
* 二進位：`0b00001011`

> Kotlin 不支援八進位常值。
>
{style="note"}

若要宣告數值，請明確指定型別：

```kotlin
val one: Int = 1

// 使用底線提升可讀性
val oneBillion: Long = 1_000_000_000
val hexBytes: Int = 0x7F_EC_DE_5E
val bytes: Int = 0b01010010_01101001_10010100_10010010

val oneByte: Byte = 1
val oneShort: Short = 1
```

你也可以加上 `L` 後綴來宣告 `Long` 值：

```kotlin
val oneLong = 1L
```

當你明確宣告數值型別時，編譯器會檢查該值是否符合該型別的範圍：

```kotlin
// 值符合 Byte 範圍
val oneByte: Byte = 1

// 錯誤：值超出 Byte 範圍
val tooBig: Byte = 128
```

當未指定數值型別時，如果該值符合 `Int` 範圍，Kotlin 會推論為 `Int`；否則會推論為 `Long`：

```kotlin
val million = 1_000_000 // Int
val threeBillion = 3_000_000_000 // Long
```

如果值可能不存在，請使用可 null 型別：

```kotlin
val maybeAbsent: Int? = null
```

## 浮點數型別 {id="floating-point-types"}

針對帶有小數部分的數字，Kotlin 提供 `Float` 與 `Double`。

浮點數型別遵循 [IEEE 754 標準](https://en.wikipedia.org/wiki/IEEE_754)。
`Float` 代表*單精度*，而 `Double` 代表*雙精度*。

浮點數型別的大小與精度有所不同：

| 型別	    | 大小（位元） | 有效位數 | 指數位元 | 十進位有效位數 |
|----------|-------------|----------|----------|----------------|
| `Float`	 | 32          | 24       | 8        | 6-7            |
| `Double` | 64          | 53       | 11       | 15-16          |    

### 宣告浮點數值 {id="declare-floating-point-values"}

若要宣告浮點數常值，請加上小數點（`.`）或使用科學記號：

```kotlin
val pi = 3.14
val avogadro = 6.02214076e23
```

預設情況下，Kotlin 會將浮點數常值推論為 `Double`。
若要宣告 `Float`，請加上 `f` 或 `F` 後綴：

```kotlin
val pi = 3.14 // Double
val eFloat = 2.7182817f // Float
```

> 當 `Float` 常值包含超過 `Float` 所能儲存的精度時，Kotlin 會進行捨入。
>
{style="note"}

如果值可能不存在，請使用可 null 型別：

```kotlin
val maybeAbsent: Double? = null
```

## 算術運算 {id="arithmetic-operations"}

Kotlin 支援數字的標準算術運算：`+`、`-`、`*`、`/` 與 `%`。

使用這些運算子可執行常見的計算：

```kotlin
fun main() {
//sampleStart
    println(1 + 2) // 3
    println(2_500_000_000L - 1L) // 2499999999
    println(3.14 * 2.71) // 8.5094
    println(10.0 / 3) // 3.3333333333333335
//sampleEnd
}
```
{kotlin-runnable="true"}

結果型別取決於運算元的型別。若要深入了解，請參閱[](#mixed-numeric-expressions)。

> 你可以在自訂數字類別中覆寫這些運算子。
> 如需詳細資訊，請參閱[運算子多載](operator-overloading.md)。
>
{style="tip"}

### 整數除法 {id="integer-division"}

整數值之間的除法一律會傳回整數結果。編譯器會捨棄小數部分：

```kotlin
fun main() {
//sampleStart
    val intValue = 5 / 2
    println(intValue) // 2
    
    val longValue = 5L / 2
    println(longValue) // 2
//sampleEnd
}
```
{kotlin-runnable="true"}

若要傳回浮點數結果，請將至少一個運算元設定為 `Float` 或 `Double`：

```kotlin
fun main() {
//sampleStart
    val a = 5 / 2.0
    println(a) // 2.5
    
    val b = 5 / 2.toDouble()
    println(b) // 2.5
//sampleEnd
}
```
{kotlin-runnable="true"}

## 型別轉換 {id="type-conversion"}

數值型別之間並非彼此的子型別。Kotlin 要求明確轉換，以避免無預警的資料遺失與非預期的行為。

例如，需要 `Double` 的函式無法在沒有轉換的情況下接收 `Int` 或 `Float` 值：

```kotlin
fun main() {
//sampleStart
    fun printDouble(x: Double) { 
        print(x) 
    }

    val x = 1.0
    val xInt = 1
    val xFloat = 1.0f
    val one: Double = 1 // 錯誤：初始設定式型別不相符

    printDouble(x) // OK
    printDouble(xInt) // 錯誤：引數型別不相符
    printDouble(xFloat) // 錯誤：引數型別不相符
//sampleEnd
}
```
{kotlin-runnable="true" validate="false"}

所有數值型別都支援轉換為其他數值型別。
若要將數字轉換為其他型別，請使用明確轉換函式：

* `toByte()`
* `toShort()`
* `toInt()`
* `toLong()`
* `toFloat()`
* `toDouble()`

例如，以下程式碼將 `Int` 值轉換為 `Double`：

```kotlin
fun main() {
//sampleStart
    val intValue: Int = 1
    val doubleValue = intValue.toDouble()
    
    println(doubleValue) // 1.0
//sampleEnd
}
```
{kotlin-runnable="true"}

當你將浮點數值轉換為整數型別時，編譯器會捨棄小數部分：

```kotlin
fun main() {
//sampleStart
    val d: Double = 1.5
    val l: Long = d.toLong()
    
    println(l) // 1
//sampleEnd    
}
```
{kotlin-runnable="true"}

### 混合數值運算式 {id="mixed-numeric-expressions"}

Kotlin 在指派或函式引數傳遞時不支援隱式轉換。
不過，你可以在算術運算式中混合使用不同的數值型別。在這種情況下，
Kotlin 會根據運算元型別決定結果型別，
且算術運算子會自動處理轉換：

```kotlin
val intNumber: Int = 1
val longNumber: Long = 1000
val result = intNumber + longNumber // 1001, Long
```

若嘗試將結果指派給較小的型別，編譯器將回報錯誤：

```kotlin
val intNumber: Int = 1
val longNumber: Long = 1000
val result: Int = intNumber + longNumber 
// 錯誤：初始設定式型別不相符
```

### 整數常值型別 {id="integer-literal-types"}

在型別推論期間，Kotlin 會將無後綴的整數常值視為特殊的[整數常值型別 (Integer Literal Type, ILT)](https://kotlinlang.org/spec/type-system.html#integer-literal-types)，
直到周圍的上下文決定出具體型別為止：

```kotlin
//sampleStart
fun List<Any>.log() {
    println(joinToString(" | ") { it::class.simpleName ?: "Unknown" })
}

fun main() {
    listOf(1, 2).log()
    // Int | Int
    
    listOf(1L, 2L).log()
    // Long | Long
    
    // 編譯器將 1 解釋為 ILT 並將其解析為 Long
    listOf(1, 2L).log()
    // Long | Long
    
    // .toInt() 將常值轉換為 Int
    listOf(1.toInt(), 2L).log()
    // Int | Long
}
//sampleEnd
```
{kotlin-runnable="true"}

這在 `Int` 與 `Long` 值之間特別容易被忽略，因為它們在執行時期的字串表示形式完全相同。為了避免這種情況，請明確指定預期型別或明確轉換值：

```kotlin
//sampleStart
fun List<Any>.log() {
    println(joinToString(" | ") { it::class.simpleName ?: "Unknown" })
}

fun main() {
    val longValues: List<Long> = listOf(1, 2L)
    longValues.log()
    // Long | Long

    val numberValues: List<Number> = listOf(1.toInt(), 2L)
    numberValues.log()
    // Int | Long
}
//sampleEnd
```
{kotlin-runnable="true"}

你也可以使用明確型別來攔截非預期的型別推論：

```kotlin
fun main() {
//sampleStart
    val intValues: List<Int> = listOf(1, 2L)
    // 錯誤：初始設定式型別不相符
//sampleEnd
}
```
{kotlin-runnable="true" validate="false"}

> 了解更多關於[整數常值型別](https://kotlinlang.org/spec/type-system.html#integer-literal-types)的資訊。
> 
{style="tip"}

## 資料溢位 {id="data-overflow"}

數值型別只能表示其定義範圍內的值。

若運算結果超出該範圍，就會發生溢位。
若將數值轉換為較小的數值型別，轉換後的值可能無法保留原始數值。

即使編譯器編譯通過，這種行為也可能影響程式碼的執行結果。

### 運算中的溢位 {id="overflow-in-operations"}

每個整數型別只能儲存其定義範圍內的值。當算術運算的結果超出該範圍時，就會發生*資料溢位*：

```kotlin
fun main(){
//sampleStart
    val intNumber: Int = 2147483647
    // Int 最大值為 2147483647
    println(intNumber + 1) // -2147483648
//sampleEnd    
}
```
{kotlin-runnable="true"}

此處由於數值無法再容納於 `Int` 中，結果產生了環繞（wrap around）。

> 當整數發生溢位時，編譯器不會自動發出錯誤。
>
{style="note"}

### 負號運算中的溢位 {id="overflow-in-negation"}

在取負數運算時也可能發生溢位。
例如，你無法將 `Int.MIN_VALUE` 的正數對應值以 `Int` 表示。

```kotlin
fun main(){
//sampleStart
    val min = Int.MIN_VALUE
    println(-min) // -2147483648
//sampleEnd    
}
```
{kotlin-runnable="true"}

### 縮窄轉換 {id="narrowing-conversions"}

當你將數值轉換為較小的整數型別時，結果可能無法保留原始數值：

```kotlin
fun main() {
//sampleStart
    val large: Int = 130
    val narrowed: Byte = large.toByte()

    println(narrowed) // -126
//sampleEnd
}
```
{kotlin-runnable="true"}

然而，由於浮點數型別遵循 [IEEE 754 標準](https://en.wikipedia.org/wiki/IEEE_754)，非常大的結果可能會變成 `Infinity`：

```kotlin
fun main() {
//sampleStart
    println(Double.MAX_VALUE * 2) // Infinity
//sampleEnd    
}
```
{kotlin-runnable="true"}

## 按位運算 {id="bitwise-operations"}

Kotlin 為 `Int` 與 `Long` 提供了*按位運算*。這些運算透過一組[中綴函式](functions.md#infix-notation)以及 `inv()` 來表示。

```kotlin
fun main() {
//sampleStart
    val x = 1
    
    println(x shl 2) // 4
    println(x and 0x000FF000) // 0
//sampleEnd
}
```
{kotlin-runnable="true"}

按位運算包含：

* `shl()` – 有號左移
* `shr()` – 有號右移
* `ushr()` – 無號右移
* `and()` – 按位 AND
* `or()` – 按位 OR
* `xor()` – 按位 XOR
* `inv()` – 按位反轉

## 浮點數比較 {id="floating-point-number-comparison"}

在 Kotlin 中，浮點數比較取決於運算元的靜態型別。

當運算元在靜態型別上已知為 `Float` 或 `Double` 時，
對數字及其構成範圍的運算會遵循 [IEEE 754 浮點數運算標準](https://en.wikipedia.org/wiki/IEEE_754)。

然而，在泛型使用案例中（例如 `Any`、`Comparable<...>` 或 `Collection<T>`），對於靜態型別不是浮點數的運算元，其行為會有所不同。在這些情況下，Kotlin 會使用 `Float` 與 `Double` 的 `equals()` 和 `compareTo()` 實作。

因此：

* `NaN` 被視為等於自身
* `NaN` 被視為大於包括 `POSITIVE_INFINITY` 在內的任何其他元素
* `-0.0` 被視為小於 `0.0`

下列範例展示了靜態型別為浮點數的運算元與透過泛型型別使用的運算元之間的差異：

```kotlin
//sampleStart  
fun generalizedEquals(a: Any, b: Any): Boolean {
    return a == b
}

fun main() {
    // 靜態型別為浮點數的運算元
    println(Double.NaN == Double.NaN) // false
    println(0.0 == -0.0) // true

    // 透過非浮點數靜態型別使用的運算元
    println(generalizedEquals(Double.NaN, Double.NaN)) // true
    println(generalizedEquals(0.0, -0.0)) // false
}
//sampleEnd  
```
{kotlin-runnable="true" id="kotlin-numbers-floating-comp"}

## 在 JVM 上封箱與快取數字 {id="boxing-and-caching-numbers-on-the-jvm"}

在 JVM 上，不可為 null 的數值通常使用基本型別儲存，例如 `int`、`long` 或 `double`。
然而，當你使用[泛型](generics.md)或可為 null 的數值型別（如 `Int?`）時，該數值會被封箱並以物件表示。

JVM 對較小的數字採用了[記憶體最佳化技術](https://docs.oracle.com/javase/specs/jls/se22/html/jls-5.html#jls-5.1.7)，會快取它們的封箱表示形式。因此，具有相同數值的封箱數字可能具有[參照相等性](equality.md#referential-equality)。

例如，JVM 會快取範圍在 `-128` 至 `127` 之間的封箱 `Integer` 值。因此，下列程式碼會傳回 `true`：

```kotlin
fun main() {
//sampleStart
    val score: Int = 100
    val savedScore: Int? = score
    val displayedScore: Int? = score
    
    println(savedScore === displayedScore) // true
//sampleEnd
}
```
{kotlin-runnable="true" validate="false"}

對於快取範圍之外的值，封箱的值會是不同的物件。在這種情況下，即使它們的值具有[結構相等性](equality.md#structural-equality)，也不會具備參照相等性。因此，比較數值時請使用 `==`：

```kotlin
fun main() {
//sampleStart
    val score: Int = 10000
    val savedScore: Int? = score
    val displayedScore: Int? = score

    println(savedScore === displayedScore) // false
    println(savedScore == displayedScore) // true
//sampleEnd
}
```
{kotlin-runnable="true" validate="false"}