[//]: # (title: 陣列)
[//]: # (description: 了解如何在 Kotlin 中建立、存取、修改、比較與轉換陣列。)

陣列 (array) 是一種資料結構，用於容納固定數量的相同型別或其子型別的值。
陣列元素是有序的，並可透過索引進行存取。

Kotlin 提供了 [`Array<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/) 類別以及[基本型別陣列](#primitive-type-arrays)。

## 何時使用陣列 {id="when-to-use-arrays"}

在需要與 Java API 互通或有底層需求時使用陣列。例如，當你的效能需求超出了常規應用程式的標準，或者你需要建構自訂的資料結構時。

對於大多數使用案例，建議改用[集合](collections-overview.md)。

| 功能性                                              | 陣列                                                                                                                                                 | 集合                                              |
|-----------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------|
| 大小                                                | 固定                                                                                                                                                 | 取決於型別                                        |           
| 唯讀變體                                            | 無，一律為可變                                                                                                                                       | 有（`List` 與 `Set`）                             |
| 新增與移除元素                                      | 無原生支援。<br/> 需分配並複製到新陣列                                                                                                               | 有（可變集合）                                    |
| 使用 `==` 的結構相等性                               | 否，比較的是參照。<br/> 請改用 [`.contentEquals()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/content-equals.html)          | 是                                                |
| 基本型別值                                          | 基本型別陣列存儲值時<br/> 無需裝箱 (boxing)                                                                                                          | 通常會裝箱                                        |
| Java 互通性                                         | 對應至 `T[]`                                                                                                                                         | 對應至 `java.util.List` 與<br/> `java.util.Set`   |
| 函式風格的篩選與<br/>轉換                           | 有限                                                                                                                                                 | 廣泛                                              |

了解如何[將陣列轉換為集合](#convert-to-collections)。

## 建立陣列 {id="create-arrays"}

要建立陣列，你可以使用：

* [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html)、[`arrayOfNulls()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of-nulls.html#kotlin$arrayOfNulls(kotlin.Int)) 
或 [`emptyArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/empty-array.html) 函式。
* `Array` 建構函式。

> 使用 `val` 宣告陣列僅能防止重新指派該變數，但不會使內容變成唯讀。
> 無論在 `val` 還是 `var` 陣列中，元素都是可變的。兩者的區別僅影響參照本身，不影響其內容。
> 若需要唯讀檢視，請改用[集合](collections-overview.md)。
> 
{style="note"}

### 包含值的陣列 {id="array-with-values"}

若要從已知的值集合建立具型別的陣列，請使用 [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html) 函式。
Kotlin 會自動推論型別：

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3) // Array<Int>
    println(simpleArray.joinToString())
    // 1, 2, 3
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-simple-array-kotlin"}

### 空陣列 {id="empty-array"}

若要建立不包含任何元素的陣列，請使用 [`emptyArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/empty-array.html) 函式。
你可以在指派的左側或右側指定元素的型別：

```kotlin
val emptyArrayRight = emptyArray<String>()
val emptyArrayLeft: Array<String> = emptyArray()
```

了解[如何將元素新增](#add-and-remove-elements)至陣列中。

### 包含 null 的陣列 {id="array-with-nulls"}

若要建立指定大小且填入 `null` 元素的陣列，
請使用 [`arrayOfNulls()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of-nulls.html#kotlin$arrayOfNulls(kotlin.Int)) 函式：

```kotlin
fun main() {
//sampleStart
    val nullArray: Array<Int?> = arrayOfNulls(3)
    println(nullArray.joinToString())
    // null, null, null
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-null-array-kotlin"}

### Array 建構函式 {id="array-constructor"}

`Array` 建構函式接受陣列大小以及一個回傳陣列元素值的函式：

```kotlin
fun main() {
//sampleStart
    val zeroes = Array<Int>(3) { 0 }
    println(zeroes.joinToString())
    // 0, 0, 0
    
    val squares = Array(5) { i -> i * i }
    println(squares.joinToString())
    // 0, 1, 4, 9, 16
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-array-constructor-kotlin"}

### 巢狀陣列 {id="nested-arrays"}

若要建立巢狀陣列或多維陣列，請使用陣列的陣列。
巢狀陣列不需要具備相同的型別或相同的大小。

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
{kotlin-runnable="true" id="arrays-multidimensional-array-kotlin"}

### 基本型別陣列 {id="primitive-type-arrays"}

如果你在 `Array` 類別中使用基本型別值，編譯器會將這些值裝箱為物件。
為了避免裝箱開銷，你可以使用專屬的基本型別陣列。
它們並非 [`Array<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/) 類別的子類別，但提供了類似的函式與屬性集。

| Kotlin 型別                                                                             | Java 等效型別   |
|-----------------------------------------------------------------------------------------|-----------------|
| [`BooleanArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-boolean-array/)   | `boolean[]`     |
| [`ByteArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-byte-array/)         | `byte[]`        |
| [`CharArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-char-array/)         | `char[]`        |
| [`DoubleArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-double-array/)     | `double[]`      |
| [`FloatArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-float-array/)       | `float[]`       |
| [`IntArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int-array/)           | `int[]`         |
| [`LongArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-long-array/)         | `long[]`        |
| [`ShortArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-short-array/)       | `short[]`       |

> Kotlin 沒有專屬的 `StringArray` 型別。由於 `String` 不是基本型別，
> 請改用型別推論的 [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html) 或 `arrayOf<String>()` 函式。
> 
{style="note"}

若要建立基本型別陣列，請使用以下任一選項：

* 建構函式：

  ```kotlin
  fun main() {
  //sampleStart
      // 建立大小為 5 且值初始化為零的 Int 陣列
      val primitiveTypeArray = IntArray(5)
      println(primitiveTypeArray.joinToString())
      // 0, 0, 0, 0, 0
  
      // 建立 Int 陣列並傳入初始設定函式
      val squares = IntArray(5) { i -> i * i }
      println(squares.joinToString())
      // 0, 1, 4, 9, 16
  //sampleEnd
  }
  ```
  {kotlin-runnable="true" id="arrays-primitive-type-array-kotlin"}

* 工廠函式：

  ```kotlin
  fun main() {
  //sampleStart
      // 建立包含 5 個元素的 Int 陣列
      val numbers = intArrayOf(1, 2, 3, 4, 5)
      println(numbers.joinToString())
      // 1, 2, 3, 4, 5

      // 建立包含 3 個元素的 Char 陣列
      val characters = charArrayOf('K', 't', 'l')
      println(characters.joinToString())
      // K, t, l

      // 建立包含 3 個元素的 Double 陣列
      val doubles = doubleArrayOf(0.22, 4.16, 0.5)
      println(doubles.joinToString()) 
      // 0.22, 4.16, 0.5
  //sampleEnd
  }
  ```
  {kotlin-runnable="true"}

> 若要將基本型別陣列轉換為物件型別陣列，請使用 [`.toTypedArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-typed-array.html)
> 函式。
>
> 若要將物件型別陣列轉換為基本型別陣列，請使用 [`.toBooleanArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-boolean-array.html)、
> [`.toByteArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-byte-array.html)、[`.toCharArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-char-array.html)
> 等函式。
>
{style="note"}

## 操作陣列 {id="work-with-arrays"}

陣列支援許多與集合相同的操作，包括迭代、搜尋、排序和轉換。
在 Kotlin 中，你可以使用陣列將可變參數傳遞給函式，或者對陣列本身執行操作。
下表列出了最常用的成員屬性與函式：

| 成員                                                                                                                                                                                                   | 傳回值                                |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------|
| [`size`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-array/size.html)                                                                                                                        | 元素數量                              |
| [`indices`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/indices.html)                                                                                                             | 有效索引的範圍                        |
| [`lastIndex`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/last-index.html)                                                                                                        | 最後一個有效索引                      |
| [`first()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first.html) 與 [`last()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/last.html)                    | 第一個與最後一個元素                  |
| [`isEmpty()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/is-empty.html) 與 [`isNotEmpty()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/is-not-empty.html) | 當陣列為空或非空時回傳 `true`         |
| [`contains()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/contains.html)                                                                                                         | 當陣列包含該元素時回傳 `true`         |

> 在 [API 參考](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-array/)中進一步了解陣列的屬性與函式。
> 
{style="tip"}

本節將介紹一些最常用的操作。

### 存取與修改元素 {id="access-and-modify-elements"}

若要存取與修改陣列中的元素，請使用[索引存取運算子](operator-overloading.md#indexed-access-operator)
（`[]`）：

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)
    val twoDArray = Array(2) { Array<Int>(2) { 0 } }

    // 存取元素並修改它
    simpleArray[0] = 10
    twoDArray[0][0] = 2

    // 印出修改後的元素
    println(simpleArray[0]) 
    // 10
    println(twoDArray[0][0]) 
    // 2
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-access-array-kotlin"}

> 如果你嘗試存取超出陣列範圍的索引，Kotlin 會在執行期擲出 `ArrayIndexOutOfBoundsException`。
>
{style="note"} 

你也可以使用 [`fill(element, fromIndex, toIndex)`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/fill.html) 函式
來就地取代某個範圍內的元素。`fromIndex` 為包含，而 `toIndex` 為不包含：

```kotlin
fun main() {
//sampleStart
    val arr = IntArray(3)
    println(arr.joinToString())
    // 0, 0, 0
    
   arr.fill(1)
   println(arr.joinToString())
   // 1, 1, 1
  
   arr.fill(0, 0, 2)
   println(arr.joinToString())
   // 0, 0, 1
//sampleEnd
}
```
{kotlin-runnable="true"}

在 Kotlin 中，陣列是_不變的 (invariant)_。這表示 `Array<String>` 並非 `Array<Any>` 的子型別。這可以防止可能發生的執行期型別錯誤。若要表達協變 (covariance)，請使用 `Array<out Any>`
[型別投影](generics.md#type-projections)：

```kotlin
fun main() {
//sampleStart
    fun printArr(arr: Array<out Any>) {
        for (item in arr) print("$item, ")
    }

    printArr(arrayOf("k", "t", "n"))  
    // k, t, n, 
//sampleEnd
}
```
{kotlin-runnable="true"}

### 新增與移除元素 {id="add-and-remove-elements"}

由於陣列具有固定大小，因此不支援 `.add()` 和 `.remove()` 函式。若要執行這些操作，
你需要建立一個新陣列。為此，你可以使用以下任一選項：

* 使用 [`.copyOf`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/copy-of.html) 函式：

  ```kotlin
  fun main() {
  //sampleStart
      var arr = intArrayOf(0, 1, 2)
      
      arr = arr.copyOf(arr.size + 1)
      println(arr.joinToString())
      // 0, 1, 2, 0

      arr[arr.lastIndex] = 3
      println(arr.joinToString())
      // 0, 1, 2, 3
  //sampleEnd
  }
  ```
  {kotlin-runnable="true"}

* 使用 `+` 或 `+=` 運算子：

  ```kotlin
  fun main() {
  //sampleStart
      var arr = intArrayOf(0, 1, 2)

      arr += 3
      println(arr.joinToString())
      // 0, 1, 2, 3

      arr = arr + intArrayOf(4, 5)
      println(arr.joinToString())
      // 0, 1, 2, 3, 4, 5
  //sampleEnd
  }
  ```
  {kotlin-runnable="true"}

> 如果你需要頻繁新增或移除元素，
> 請改用[可變集合](collections-overview.md#collection-types)。
>
{style="tip"}

### 比較陣列 {id="compare-arrays"}

若要比較兩個陣列是否以相同順序包含相同的元素，請使用 [`.contentEquals()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/content-equals.html)
與 [`.contentDeepEquals()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/content-deep-equals.html)
函式：

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)
    val anotherArray = arrayOf(1, 2, 3)

    // 比較陣列內容
    println(simpleArray.contentEquals(anotherArray))
    // true

    // 使用中綴標記法，在修改元素後比較陣列內容
    simpleArray[0] = 10
    println(simpleArray contentEquals anotherArray)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-compare-array-kotlin"}

> 請勿使用相等性（`==`）與不等運算子（`!=`）[運算子](equality.md#structural-equality)來比較陣列的內容。
> 這些運算子檢查的是指派的變數是否指向同一個物件。
>
> 若要進一步了解 Kotlin 陣列為何具備這種行為，請參閱我們的[部落格文章](https://blog.jetbrains.com/kotlin/2015/09/feedback-request-limitations-on-data-classes/#Appendix.Comparingarrays)。
>
{style="warning"}

### 轉換陣列 {id="transform-arrays"}

Kotlin 提供了許多有用的函式來轉換陣列。本節重點介紹其中一部分。
請在我們的 [API 參考](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/)中查看完整清單。

#### 總和 {id="sum"}

若要傳回陣列中所有元素的總和，請使用 [`.sum()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sum.html)
函式：

```kotlin
fun main() {
//sampleStart
    val sumArray = arrayOf(1, 2, 3)
    println(sumArray.sum())
    // 6
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-sum-array-kotlin"}

> `.sum()` 函式只能用於[數值資料型別](numbers.md)的陣列，例如 `Int`。
>
{style="note"}

#### 排序與隨機排序 {id="sort-and-shuffle"}

你可以使用 [`.sort()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/sort.html) 函式依自然順序對陣列中的元素進行排序，
或使用 [`.shuffle()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/shuffle.html) 函式對其進行隨機排序：

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)

    // 隨機排序元素
    simpleArray.shuffle()
    println(simpleArray.joinToString())
  
    // 排序元素
    simpleArray.sort()
    println(simpleArray.joinToString())
    // 1, 2, 3
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-shuffle-array-kotlin"}

若要取得排序後的新陣列而不修改原始陣列，請改用
[`.sortedArray()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/sorted-array.html) 函式。

### 將可變參數傳遞給函式 {id="pass-variable-number-of-arguments-to-a-function"}

在 Kotlin 中，你可以透過 [`vararg`](functions.md#variable-number-of-arguments-varargs)
參數將可變參數傳遞給函式。當你事先不知道引數的數量時（例如格式化訊息或建立 SQL 查詢時），這非常有用。

若要將包含可變參數的陣列傳遞給函式，請使用_展開運算子_
（`*`）。展開運算子會將陣列的每個元素作為獨立的引數傳遞給所選的函式：

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
{kotlin-runnable="true" id="arrays-vararg-array-kotlin"}

如需更多資訊，請參閱[可變參數 (varargs)](functions.md#variable-number-of-arguments-varargs)。

## 轉換為集合 {id="convert-to-collections"}

如果你處理的不同 API 中，有些使用陣列，有些使用集合，則可以將陣列轉換為集合，
反之亦然。為此，請使用 [`.toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-list.html)、[`.toSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-set.html) 以及 [`.toMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-map.html) 函式。
這些函式會將內容從陣列複製到獨立的複本中。後續對原陣列的修改不會反映在複本上。

### 轉換為 List 或 Set {id="convert-to-list-or-set"}

若要將陣列轉換為 `List` 或 `Set`，請使用 [`.toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-list.html)
與 [`.toSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-set.html) 函式：

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
{kotlin-runnable="true" id="arrays-convert-list-set-kotlin"}

除非你完全確定原始陣列不會被修改或在其他地方共享，
否則請勿使用 [`.asList()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/as-list.html)
及相關的 `as*` 函式。這些函式包裝了原始陣列而不是複製它。因此，
對陣列的修改會反映在列表中，反之亦然。

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf("a", "b", "c")

    val list = simpleArray.asList()
    simpleArray[0] = "d"
    println(list)
    // [d, b, c]
//sampleEnd
}
```
{kotlin-runnable="true"}

### 轉換為 Map {id="convert-to-map"}

若要將陣列轉換為 `Map`，請使用 [`.toMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-map.html)
函式。

你只能將 [`Pair<K,V>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-pair/) 陣列轉換為 `Map`。
`Pair` 執行個體的第一個值將成為鍵 (key)，第二個值將成為值 (value)。
如果同一個鍵出現多次，則會使用最後一個值。

此範例使用[中綴標記法](functions.md#infix-notation)
呼叫 [`.to`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/to.html) 函式來建立 `Pair` 元組：

```kotlin
fun main() {
//sampleStart
    val pairArray = arrayOf("apple" to 120, "banana" to 150, "cherry" to 90, "apple" to 140)

    // 轉換為 Map
    // 水果為鍵，卡路里數值為值
    // 最新的 "apple" 值會覆蓋前一個值
    println(pairArray.toMap())
    // {apple=140, banana=150, cherry=90}
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-convert-map-kotlin"}

## 後續步驟 {id="what-s-next"}

* 在[集合概覽](collections-overview.md)中進一步了解為什麼我們建議在大多數情況下使用集合。
* 了解其他[基本型別](types-overview.md)。
* 如果你是 Java 開發人員，請閱讀我們的 [Java 至 Kotlin 集合移轉指南](java-to-kotlin-collections-guide.md)。