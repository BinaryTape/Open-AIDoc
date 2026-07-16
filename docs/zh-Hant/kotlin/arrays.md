[//]: # (title: 陣列)

陣列是一種資料結構，用於持有固定數量的相同型別或其子型別的值。Kotlin 中最常見的陣列類型是物件型別陣列，由 [`Array`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/) 類別表示。

> 如果您在物件型別陣列中使用基本型別 (primitives)，這會對效能產生影響，因為您的基本型別會被[裝箱 (boxed)](https://docs.oracle.com/javase/tutorial/java/data/autoboxing.html) 成物件。為了避免裝箱開銷，請改用[基本型別陣列](#primitive-type-arrays)。
>
{style="note"}

## 何時使用陣列

當您有特定的低階需求需要滿足時，請在 Kotlin 中使用陣列。例如，如果您的效能需求超出了常規應用程式的需要，或者您需要建構自訂的資料結構。如果您沒有這些限制，請改用[集合](collections-overview.md)。

與陣列相比，集合具有以下優點：
* 集合可以是唯讀的，這為您提供了更多控制權，並允許您編寫具有明確意圖且強健的程式碼。
* 在集合中新增或移除元素非常容易。相比之下，陣列的大小是固定的。在陣列中新增或移除元素的唯一方法是每次都建立一個新陣列，這非常低效：

  ```kotlin
  fun main() {
  //sampleStart
      var riversArray = arrayOf("Nile", "Amazon", "Yangtze")

      // 使用 += 指派操作會建立一個新的 riversArray，
      // 複製原始元素並新增 "Mississippi"
      riversArray += "Mississippi"
      println(riversArray.joinToString())
      // Nile, Amazon, Yangtze, Mississippi
  //sampleEnd
  }
  ```
  {kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-rivers-array-kotlin"}

* 您可以使用相等運算子 (`==`) 來檢查集合是否在結構上相等。您不能對陣列使用此運算子。相反地，您必須使用一個特殊的函式，您可以在[比較陣列](#compare-arrays)中進一步了解。

如需有關集合的詳細資訊，請參閱[集合概覽](collections-overview.md)。

## 建立陣列

要在 Kotlin 中建立陣列，您可以使用：
* 函式，例如 [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html)、[`arrayOfNulls()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of-nulls.html#kotlin$arrayOfNulls(kotlin.Int)) 或 [`emptyArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/empty-array.html)。
* `Array` 建構函式。

此範例使用 [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html) 函式並將項目值傳遞給它：

```kotlin
fun main() {
//sampleStart
    // 建立一個值為 [1, 2, 3] 的陣列
    val simpleArray = arrayOf(1, 2, 3)
    println(simpleArray.joinToString())
    // 1, 2, 3
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-simple-array-kotlin"}

此範例使用 [`arrayOfNulls()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of-nulls.html#kotlin$arrayOfNulls(kotlin.Int)) 函式建立一個指定大小且填滿 `null` 元素的陣列：

```kotlin
fun main() {
//sampleStart
    // 建立一個值為 [null, null, null] 的陣列
    val nullArray: `Array<Int?>` = arrayOfNulls(3)
    println(nullArray.joinToString())
    // null, null, null
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-null-array-kotlin"}

此範例使用 [`emptyArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/empty-array.html) 函式來建立一個空陣列：

```kotlin
    var exampleArray = emptyArray<String>()
```

> 由於 Kotlin 的型別推論，您可以在指派的左側或右側指定空陣列的型別。
>
> 例如：
> ```Kotlin
> var exampleArray = emptyArray<String>()
> 
> var exampleArray: `Array<String>` = emptyArray()
>```
>
{style="note"}

`Array` 建構函式接受陣列大小，以及一個根據索引傳回陣列元素值的函式：

```kotlin
fun main() {
//sampleStart
    // 建立一個 `Array<Int>` 並以零 [0, 0, 0] 進行初始化
    val initArray = Array<Int>(3) { 0 }
    println(initArray.joinToString())
    // 0, 0, 0

    // 建立一個 Array<String>，其值為 ["0", "1", "4", "9", "16"]
    val asc = Array(5) { i -> (i * i).toString() }
    asc.forEach { print(it) }
    // 014916
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-array-constructor-kotlin"}

> 與大多數程式語言一樣，Kotlin 中的索引從 0 開始。
>
{style="note"}

### 巢狀陣列

陣列可以互相巢狀以建立多維陣列：

```kotlin
fun main() {
//sampleStart
    // 建立一個二維陣列
    val twoDArray = Array(2) { Array<Int>(2) { 0 } }
    println(twoDArray.contentDeepToString())
    // [[0, 0], [0, 0]]

    // 建立一個三維陣列
    val threeDArray = Array(3) { Array(3) { Array<Int>(3) { 0 } } }
    println(threeDArray.contentDeepToString())
    // [[[0, 0, 0], [0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]]]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-multidimensional-array-kotlin"}

> 巢狀陣列不需要是相同的型別或相同的大小。
>
{style="note"}

## 存取與修改元素

陣列始終是可變的。要存取和修改陣列中的元素，請使用[索引存取運算子](operator-overloading.md#indexed-access-operator) `[]`：

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)
    val twoDArray = Array(2) { Array<Int>(2) { 0 } }

    // 存取元素並修改它
    simpleArray[0] = 10
    twoDArray[0][0] = 2

    // 列印修改後的元素
    println(simpleArray[0].toString()) // 10
    println(twoDArray[0][0].toString()) // 2
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-access-array-kotlin"}

Kotlin 中的陣列是*不變的 (invariant)*。這意味著 Kotlin 不允許您將 `Array<String>` 指派給 `Array<Any>`，以防止可能的執行時失敗。相反地，您可以使用 `Array<out Any>`。如需更多資訊，請參閱[型別投影](generics.md#type-projections)。

## 使用陣列

在 Kotlin 中，您可以透過陣列將可變參數傳遞給函式，或者對陣列本身執行操作。例如，比較陣列、轉換其內容或將其轉換為集合。

### 將可變參數傳遞給函式

在 Kotlin 中，您可以透過 [`vararg`](functions.md#variable-number-of-arguments-varargs) 參數將可變參數傳遞給函式。這在您預先不知道參數數量時非常有用，例如在格式化訊息或建立 SQL 查詢時。

要將包含可變參數的陣列傳遞給函式，請使用展開運算子 (`*`)。展開運算子會將陣列的每個元素作為個別引數傳遞給您選擇的函式：

```kotlin
fun main() {
    val lettersArray = arrayOf("c", "d")
    printAllStrings("a", "b", *lettersArray)
    // abcd
}

fun printAllStrings(vararg strings: String) {
    for (string in strings) {
        print(string)
    }
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-vararg-array-kotlin"}

如需更多資訊，請參閱[可變參數 (varargs)](functions.md#variable-number-of-arguments-varargs)。

### 比較陣列

要比較兩個陣列是否具有相同順序的相同元素，請使用 [`.contentEquals()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/content-equals.html) 和 [`.contentDeepEquals()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/content-deep-equals.html) 函式：

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)
    val anotherArray = arrayOf(1, 2, 3)

    // 比較陣列內容
    println(simpleArray.contentEquals(anotherArray))
    // true

    // 使用中綴標記法，在元素更改後比較陣列內容
    simpleArray[0] = 10
    println(simpleArray contentEquals anotherArray)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-compare-array-kotlin"}

> 請勿使用相等 (`==`) 和不等 (`!=`) [運算子](equality.md#structural-equality)來比較陣列的內容。這些運算子會檢查指派的變數是否指向同一個物件。
> 
> 若要進一步了解為何 Kotlin 中的陣列會這樣運作，請參閱我們的[部落格文章](https://blog.jetbrains.com/kotlin/2015/09/feedback-request-limitations-on-data-classes/#Appendix.Comparingarrays)。
> 
{style="warning"}

### 轉換陣列

Kotlin 有許多用於轉換陣列的實用函式。本文件僅強調其中幾個，這並非詳盡的清單。如需完整的函式列表，請參閱我們的 [API 參考](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/)。

#### 加總

要傳回陣列中所有元素的總和，請使用 [`.sum()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sum.html) 函式：

```Kotlin
fun main() {
//sampleStart
    val sumArray = arrayOf(1, 2, 3)

    // 加總陣列元素
    println(sumArray.sum())
    // 6
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-sum-array-kotlin"}

> `.sum()` 函式只能用於[數值資料型別](numbers.md)的陣列，例如 `Int`。
>
{style="note"}

#### 打亂

要隨機打亂陣列中的元素，請使用 [`.shuffle()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/shuffle.html) 函式：

```Kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)

    // 打亂元素 [3, 2, 1]
    simpleArray.shuffle()
    println(simpleArray.joinToString())

    // 再次打亂元素 [2, 3, 1]
    simpleArray.shuffle()
    println(simpleArray.joinToString())
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-shuffle-array-kotlin"}

### 將陣列轉換為集合

如果您使用的不同 API 中，有些使用陣列而有些使用集合，那麼您可以將陣列轉換為[集合](collections-overview.md)，反之亦然。

#### 轉換為 List 或 Set

要將陣列轉換為 `List` 或 `Set`，請使用 [`.toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-list.html) 和 [`.toSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-set.html) 函式。

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf("a", "b", "c", "c")

    // 轉換為 Set
    println(simpleArray.toSet())
    // [a, b, c]

    // 轉換為 List
    println(simpleArray.toList())
    // [a, b, c, c]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-convert-list-set-kotlin"}

#### 轉換為 Map

要將陣列轉換為 `Map`，請使用 [`.toMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-map.html) 函式。

只有 [`Pair<K,V>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-pair/) 的陣列可以轉換為 `Map`。`Pair` 執行個體的第一個值成為鍵 (key)，第二個值成為值 (value)。此範例使用[中綴標記法 (infix notation)](functions.md#infix-notation) 呼叫 [`to`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/to.html) 函式來建立 `Pair` 的元組：

```kotlin
fun main() {
//sampleStart
    val pairArray = arrayOf("apple" to 120, "banana" to 150, "cherry" to 90, "apple" to 140)

    // 轉換為 Map
    // 鍵是水果，值是它們的卡路里數
    // 請注意鍵必須是唯一的，因此最後一個 "apple" 的值
    // 會覆蓋第一個
    println(pairArray.toMap())
    // {apple=140, banana=150, cherry=90}

//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-convert-map-kotlin"}

## 基本型別陣列

如果您在 `Array` 類別中使用基本型別值，這些值會被裝箱成物件。作為替代方案，您可以使用基本型別陣列，這允許您在陣列中儲存基本型別而不會產生裝箱開銷的副作用：

| 基本型別陣列 | Java 中的等效項 |
|---|----------------|
| [`BooleanArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-boolean-array/) | `boolean[]`|
| [`ByteArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-byte-array/) | `byte[]`|
| [`CharArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-char-array/) | `char[]`|
| [`DoubleArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-double-array/) | `double[]`|
| [`FloatArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-float-array/) | `float[]`|
| [`IntArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int-array/) | `int[]`|
| [`LongArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-long-array/) | `long[]`|
| [`ShortArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-short-array/) | `short[]`|

這些類別與 `Array` 類別沒有繼承關係，但它們具有相同的函式和屬性集。

此範例建立了 `IntArray` 類別的執行個體：

```kotlin
fun main() {
//sampleStart
    // 建立一個大小為 5 且值初始化為零的 Int 陣列
    val exampleArray = IntArray(5)
    println(exampleArray.joinToString())
    // 0, 0, 0, 0, 0
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-primitive-type-array-kotlin"}

> 要將基本型別陣列轉換為物件型別陣列，請使用 [`.toTypedArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-typed-array.html) 函式。
> 
> 要將物件型別陣列轉換為基本型別陣列，請使用 [`.toBooleanArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-boolean-array.html)、[`.toByteArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-byte-array.html)、[`.toCharArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-char-array.html) 等。
> 
{style="note"}

## 後續步驟

* 若要進一步了解為何我們建議在大多數使用案例中使用集合，請閱讀我們的[集合概覽](collections-overview.md)。
* 了解其他[基本型別](types-overview.md)。
* 如果您是 Java 開發人員，請閱讀我們的 [集合 Java 到 Kotlin 遷移指南](java-to-kotlin-collections-guide.md)。