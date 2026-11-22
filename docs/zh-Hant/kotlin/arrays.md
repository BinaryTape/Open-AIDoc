[//]: # (title: 陣列)
<web-summary>了解如何在 Kotlin 中建立、存取、修改、比較以及轉換陣列。</web-summary>

陣列是一種資料結構，用於容納固定數量的相同型別或其子型別的值。
陣列元素是有序的，並可透過索引進行存取。

Kotlin 提供了 [`Array<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/) 類別以及[基本型別陣列](#primitive-type-arrays)。

## 何時使用陣列 {id="when-to-use-arrays"}

請在需要與 Java API 互操作或有底層需求時使用陣列。例如，當你的效能需求超出了一般應用程式所需，或者你需要建構自訂資料結構時。

對於大多數使用案例，建議改為使用[集合](collections-overview.md)。

| 功能性                                              | 陣列                                                                                                                                                 | 集合                                              |
|-----------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------|
| 大小                                                | 固定                                                                                                                                                 | 取決於型別                                        |           
| 唯讀變體                                            | 無，始終為可變                                                                                                                                       | 有（`List` 與 `Set`）                             |
| 新增與移除元素                                      | 無原生支援。<br/> 配置並複製到新陣列                                                                                                                 | 有（可變集合）                                    |
| 使用 `==` 的結構相等性                              | 否，比較的是參照。<br/> 改用 [`.contentEquals()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/content-equals.html)             | 是                                                |
| 基本型別值                                          | 基本型別陣列儲存值時<br/> 無需裝箱                                                                                                                   | 通常會裝箱                                        |
| Java 互操作性                                       | 對應到 `T[]`                                                                                                                                         | 對應到 `java.util.List` 與<br/> `java.util.Set`   |
| 函數式風格的篩選與<br/> 轉換                        | 有限                                                                                                                                                 | 廣泛                                              |

進一步了解如何[將陣列轉換為集合](#convert-to-collections)。 

## 建立陣列 {id="create-arrays"}

要建立陣列，你可以使用：

* [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html)、[`arrayOfNulls()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of-nulls.html#kotlin$arrayOfNulls(kotlin.Int)) 
或 [`emptyArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/empty-array.html) 函式。
* `Array` 建構函式。

> 使用 `val` 宣告陣列僅能防止重新指派該變數，但不會讓其內容變為唯讀。
> 在 `val` 與 `var` 陣列中，元素都是可變的。這種區別僅會影響參照本身，而不會影響內容。
> 若需要唯讀檢視，請改用[集合](collections-overview.md)。
> 
{style="note"}

### 帶有值的陣列 {id="array-with-values"}

若要從已知的數值集合建立具型別的陣列，請使用 [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html) 函式。
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

若要建立沒有元素的陣列，請使用 [`emptyArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/empty-array.html) 函式。
你可以在指派的左側或右側指定元素的型別：

```kotlin
val emptyArrayRight = emptyArray<String>()
val emptyArrayLeft: Array<String> = emptyArray()
```

了解[如何向陣列新增元素](#add-and-remove-elements)。

### 包含 null 的陣列 {id="array-with-nulls"}

若要建立指定大小且填滿 `null` 元素的陣列，
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
巢狀陣列不必具有相同的型別或相同的大小。

```kotlin
fun main() {
//sampleStart
    // 建立二維陣列
    val twoDArray = Array(2) { Array<Int>(2) { 0 } }
    println(twoDArray.contentDeepToString())
    // [[0, 0], [0, 0]]

    // 建立三維陣列
    val threeDArray = Array(3) { Array(3) { Array<Int>(3) { 0 } } }
    println(threeDArray.contentDeepToString())
    // [[[0, 0, 0], [0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]]]
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-multidimensional-array-kotlin"}

### 基本型別陣列 {id="primitive-type-arrays"}

如果你將 `Array` 類別用於基本型別值，編譯器會將這些值裝箱為物件。
為了避免裝箱開銷，你可以使用專門的基本型別陣列。
它們不是 [`Array<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/) 類別的子類別，但提供了類似的函式和屬性集。

| Kotlin 型別                                                                             | Java 對應型別   |
|-----------------------------------------------------------------------------------------|-----------------|
| [`BooleanArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-boolean-array/)   | `boolean[]`     |
| [`ByteArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-byte-array/)         | `byte[]`        |
| [`CharArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-char-array/)         | `char[]`        |
| [`DoubleArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-double-array/)     | `double[]`      |
| [`FloatArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-float-array/)       | `float[]`       |
| [`IntArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int-array/)           | `int[]`         |
| [`LongArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-long-array/)         | `long[]`        |
| [`ShortArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-short-array/)       | `short[]`       |

> Kotlin 沒有專門的 `StringArray` 型別。`String` 不是基本型別，因此
> 請改用帶有推論型別的 [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html) 或 `arrayOf<String>()` 函式。
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
  
      // 建立 Int 陣列並傳入初始化函式
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
下表列出了最常用的屬性和函式：

| 成員                                                                                                                                                                                                   | 傳回值                                |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------|
| [`size`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-array/size.html)                                                                                                                        | 元素數量                              |
| [`indices`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/indices.html)                                                                                                             | 有效索引的範圍                        |
| [`lastIndex`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/last-index.html)                                                                                                        | 最後一個有效索引                      |
| [`first()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first.html) 與 [`last()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/last.html)                    | 第一個與最後一個元素                  |
| [`isEmpty()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/is-empty.html) 與 [`isNotEmpty()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/is-not-empty.html) | 當陣列為空或非空時傳回 `true`         |
| [`contains()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/contains.html)                                                                                                         | 當陣列包含該元素時傳回 `true`         |

> 在 [API 參考](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-array/)中進一步了解陣列的屬性與函式。
> 
{style="tip"}

本節將介紹一些最常用的操作。

### 存取與修改元素 {id="access-and-modify-elements"}

若要存取與修改陣列中的元素，請使用[索引存取運算子](operator-overloading.md#indexed-access-operator)（`[]`）：

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

> 如果你嘗試存取超出陣列範圍的索引，Kotlin 會在執行時擲出 `ArrayIndexOutOfBoundsException`。
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

在 Kotlin 中，陣列是*不變的 (invariant)*。這意味著 `Array<String>` 不是 `Array<Any>` 的子型別。這可以防止可能發生的執行階段型別錯誤。若要表示協變性，請使用 `Array<out Any>` [型別投影](generics.md#type-projections)：

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

由於陣列具有固定大小，因此它們不支援 `.add()` 和 `.remove()` 函式。若要執行這些操作，
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
> 請改用[可變集合](collections-overview.md#read-only-and-mutable-collections)。
>
{style="tip"}

### 比較陣列 {id="compare-arrays"}

若要比較兩個陣列是否以相同順序包含相同的元素，請使用 [`.contentEquals()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/content-equals.html)
和 [`.contentDeepEquals()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/content-deep-equals.html)
函式：

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)
    val anotherArray = arrayOf(1, 2, 3)

    // 比較陣列內容
    println(simpleArray.contentEquals(anotherArray))
    // true

    // 使用中綴表示法，在修改元素後比較陣列內容
    simpleArray[0] = 10
    println(simpleArray contentEquals anotherArray)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-compare-array-kotlin"}

> 請勿使用相等（`==`）和不等（`!=`）[運算子](equality.md#structural-equality)來比較陣列的內容。
> 這些運算子檢查的是被指派的變數是否指向同一個物件。
>
> 若要進一步了解 Kotlin 中的陣列為何具有這種行為，請參閱我們的[部落格文章](https://blog.jetbrains.com/kotlin/2015/09/feedback-request-limitations-on-data-classes/#Appendix.Comparingarrays)。
>
{style="warning"}

### 轉換陣列 {id="transform-arrays"}

Kotlin 擁有許多用於轉換陣列的實用函式。本節著重介紹其中一部分。
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

> `.sum()` 函式只能用於[數值資料型別](numbers.md)（例如 `Int`）的陣列。
>
{style="note"}

#### 排序與洗牌 {id="sort-and-shuffle"}

你可以使用 [`.sort()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/sort.html) 函式依自然順序對陣列中的元素進行排序，
或使用 [`.shuffle()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/shuffle.html) 函式對它們進行隨機洗牌：

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)

    // 隨機洗牌元素
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

若要取得已排序的新陣列而不修改原始陣列，請改用
[`.sortedArray()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/sorted-array.html) 函式。

### 傳遞可變數量的引數給函式 {id="pass-variable-number-of-arguments-to-a-function"}

在 Kotlin 中，你可以透過 [`vararg`](functions.md#variable-number-of-arguments-varargs)
參數將可變數量的引數傳遞給函式。當你事先不知道引數的數量時這非常有用，例如格式化訊息或建立 SQL 查詢時。

若要將包含可變數量引數的陣列傳遞給函式，請使用*展開運算子*（`*`）。展開運算子會將陣列中的每個元素作為單獨的引數傳遞給你所選擇的函式：

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

有關詳細資訊，請參閱[可變數量的引數 (varargs)](functions.md#variable-number-of-arguments-varargs)。

## 轉換為集合 {id="convert-to-collections"}

如果你在處理不同的 API 時，其中某些使用陣列而某些使用集合，則可以將陣列轉換為集合，
反之亦然。為此，請使用 [`.toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-list.html)、[`.toSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-set.html) 以及 [`.toMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-map.html) 函式。
這些函式會將內容從陣列複製到獨立的複本中。後續對原陣列的變更不會反映在複本中。

### 轉換為 List 或 Set {id="convert-to-list-or-set"}

若要將陣列轉換為 `List` 或 `Set`，請使用 [`.toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-list.html)
和 [`.toSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-set.html) 函式：

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

除非你完全確定原始陣列不會在其他地方被修改或共用，
否則請勿使用 [`.asList()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/as-list.html)
及相關的 `as*` 函式。這些函式包裝了原始陣列而不是複製它。因此，
對陣列的變更會反映在列表中，反之亦然。

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

你只能將包含 [`Pair<K,V>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-pair/) 的陣列轉換為 `Map`。
`Pair` 執行個體的第一個值將成為鍵，第二個值成為數值。
如果相同的鍵出現多次，則會使用最後一個值。

此範例使用[中綴表示法](functions.md#infix-notation)
來呼叫 [`.to`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/to.html) 函式以建立 `Pair` 的元組：

```kotlin
fun main() {
//sampleStart
    val pairArray = arrayOf("apple" to 120, "banana" to 150, "cherry" to 90, "apple" to 140)

    // 轉換為 Map
    // 水果為鍵，卡路里數值為值
    // 最新的 "apple" 值會覆寫第一個值
    println(pairArray.toMap())
    // {apple=140, banana=150, cherry=90}
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-convert-map-kotlin"}

## 下一步？ {id="what-s-next"}

* 在[集合概觀](collections-overview.md)中進一步了解為什麼我們建議在大多數使用案例中使用集合。
* 了解其他[基本型別](types-overview.md)。
* 如果你是 Java 開發人員，請閱讀我們的 [Java 到 Kotlin 集合遷移指南](java-to-kotlin-collections-guide.md)。