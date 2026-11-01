[//]: # (title: Map 專用操作)

在 [Map](collections-overview.md#map) 中，鍵（Key）與值（Value）的型別都是使用者自訂的。
透過鍵存取 Map 項目，可實現各種 Map 專屬的處理功能，從依鍵取值到對鍵和值進行分別篩選。
本頁介紹了來自標準函式庫的 Map 處理函式。

## 取得鍵與值 {id="retrieve-keys-and-values"}

若要從 Map 中取得值，必須將其鍵作為 [`get()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/get.html) 函式的引數傳入。
也支援簡短的 `[key]` 語法。如果找不到指定的鍵，則會傳回 `null`。
還有一個函式 [`getValue()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-value.html)，其行為略有不同：如果在 Map 中找不到該鍵，它會拋出例外。
此外，你還有更多選項來處理鍵不存在的情況：

* [`getOrElse()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-else.html) 的運作方式與在 List 中相同：針對不存在的鍵，其值將由給定的 Lambda 函式傳回。
* [`getOrDefault()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-default.html) 在找不到該鍵時傳回指定的預設值。

對於值可為 null 的 Map，請改用以下函式，它們能明確處理缺失的鍵以及 `null` 值：

* `getOrElseIfNull()` 在鍵缺失或其值為 `null` 時，傳回指定預設值的計算結果。
* `getOrElseIfMissing()` 僅在鍵缺失時傳回指定預設值的計算結果。

以下範例展示了這些函式之間的差異：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
//sampleStart
    val numbersMap = mapOf("one" to 1, "two" to 2, "three" to 3)
    println(numbersMap.get("one"))
    // 1

    println(numbersMap["one"])
    // 1

    println(numbersMap.getOrDefault("four", 10))
    // 10

    println(numbersMap["five"])
    // null
    
    val nullableMap = mapOf("one" to 1, "two" to null)
    println(nullableMap.getOrElseIfNull("two") { 0 })
    // 0

    println(nullableMap.getOrElseIfMissing("two") { 0 })
    // null

    // 拋出例外，因為 Map 中缺少 "six"
    // numbersMap.getValue("six")

//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4"}

若要對 Map 的所有鍵或所有值執行操作，可以分別從屬性 `keys` 和 `values` 中取得。
`keys` 是包含所有 Map 鍵的 Set，而 `values` 是包含所有 Map 值的 Collection。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mapOf("one" to 1, "two" to 2, "three" to 3)
    println(numbersMap.keys)
    println(numbersMap.values)
//sampleEnd
}
```
{kotlin-runnable="true"}

## 篩選 {id="filter"}

你可以像處理其他集合一樣，使用 [`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html) 函式來[篩選](collection-filtering.md) Map。
在 Map 上呼叫 `filter()` 時，傳入一個以 `Pair` 作為引數的述詞（predicate）。
這讓你可以同時在篩選述詞中使用鍵和值。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key11" to 11)
    val filteredMap = numbersMap.filter { (key, value) -> key.endsWith("1") && value > 10}
    println(filteredMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

還有兩種專門用於篩選 Map 的方式：按鍵篩選與按值篩選。
每種方式都有對應的函式：[`filterKeys()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-keys.html) 與 [`filterValues()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-values.html)。
兩者都會傳回一個包含符合指定述詞之項目的新 Map。
`filterKeys()` 的述詞僅檢查元素的鍵，而 `filterValues()` 的述詞僅檢查值。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key11" to 11)
    val filteredKeysMap = numbersMap.filterKeys { it.endsWith("1") }
    val filteredValuesMap = numbersMap.filterValues { it < 10 }

    println(filteredKeysMap)
    println(filteredValuesMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

## 加法與減法運算子 {id="plus-and-minus-operators"}

由於透過鍵存取元素，[`plus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus.html)（`+`）與 [`minus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus.html)（`-`）運算子在 Map 上的運作方式與其他集合不同。
`plus` 會傳回一個包含其兩個運算元元素的 `Map`：左側為 `Map`，右側為 `Pair` 或另一個 `Map`。
當右側運算元包含左側 `Map` 中已存在的鍵時，結果 Map 將包含來自右側的項目。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mapOf("one" to 1, "two" to 2, "three" to 3)
    println(numbersMap + Pair("four", 4))
    println(numbersMap + Pair("one", 10))
    println(numbersMap + mapOf("five" to 5, "one" to 11))
//sampleEnd
}
```
{kotlin-runnable="true"}

`minus` 會從左側 `Map` 的項目中建立一個 `Map`，但排除鍵存在於右側運算元中的項目。
因此，右側運算元可以是單一鍵，或是鍵的集合：List、Set 等。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mapOf("one" to 1, "two" to 2, "three" to 3)
    println(numbersMap - "one")
    println(numbersMap - listOf("two", "four"))
//sampleEnd
}
```
{kotlin-runnable="true"}

關於在可變 Map 上使用 [`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html)（`+=`）與 [`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html)（`-=`）運算子的詳細資訊，請參閱下方的 [Map 寫入操作](#map-write-operations)。

## Map 寫入操作 {id="map-write-operations"}

[可變](collections-overview.md#collection-types) Map 提供了 Map 專屬的寫入操作。
這些操作讓你可以利用透過鍵存取值的方式來變更 Map 的內容。

定義 Map 寫入操作的若干規則如下：

* 值可以被更新。相對地，鍵永遠不會改變：一旦新增了一個項目，其鍵就是不可變的。
* 每個鍵始終只有單一關聯的值。你可以新增和移除整個項目。

以下介紹了標準函式庫中可用於可變 Map 的寫入操作函式。

### 新增與更新項目 {id="add-and-update-entries"}

若要將新的鍵值組新增至可變 Map，請使用 [`put()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/put.html)。
當新項目被放入 `LinkedHashMap`（預設的 Map 實作）時，它會被加入到最後，因此在疊代 Map 時會排在最後。在排序的 Map 中，新元素的位置則由其鍵的順序決定。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2)
    numbersMap.put("three", 3)
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

若要一次新增多個項目，請使用 [`putAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/put-all.html)。
其引數可以是 `Map` 或一組 `Pair`：`Iterable`、`Sequence` 或 `Array`。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2, "three" to 3)
    numbersMap.putAll(setOf("four" to 4, "five" to 5))
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

若指定的鍵已存在於 Map 中，`put()` 與 `putAll()` 都會覆寫對應的值。因此，你可以使用它們來更新 Map 項目的值。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2)
    val previousValue = numbersMap.put("one", 11)
    println("value associated with 'one', before: $previousValue, after: ${numbersMap["one"]}")
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

你也可以使用簡短的運算子形式向 Map 新增項目。有兩種方式：

* [`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html)（`+=`）運算子。
* 作為 `set()` 別名的 `[]` 運算子。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2)
    numbersMap["three"] = 3     // 呼叫 numbersMap.put("three", 3)
    numbersMap += mapOf("four" to 4, "five" to 5)
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

當使用的鍵已存在於 Map 中時，運算子會覆寫對應項目的值。

#### 為缺失的項目新增預設值 {id="add-default-values-for-missing-entries"}

若要在已有值時傳回該值，或在值不存在時新增預設值，請使用 [`.getOrPut()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-put.html) 擴充函式。
如果缺少該鍵或其值為 `null`，`.getOrPut()` 會儲存預設值並將其傳回。

對於值可為 null 的 Map，你可以使用 `.getOrPutIfNull()` 與 `.getOrPutIfMissing()` 函式來控制如何處理 `null` 值：

* `getOrPutIfNull()` 的行為與 `getOrPut()` 類似，在鍵缺失或其值為 `null` 時使用預設值。
* `getOrPutIfMissing()` 僅在鍵缺失時使用預設值。

`getOrPutIfNull()` 與 `getOrPutIfMissing()` 函式為[實驗性](components-stability.md#stability-levels-explained)功能。
若要選擇採用，請使用 `@OptIn(ExperimentalStdlibApi::class)` 註解。

範例如下：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
//sampleStart
    val mapForNull = mutableMapOf<String, Int?>("one" to null)
    val mapForMissing = mutableMapOf<String, Int?>("one" to null)

    // 若 "one" 的值為 null 則取代該值
    mapForNull.getOrPutIfNull("one") { 1 }

    println(mapForNull)
    // {one=1}

    // 保留 null 值，因為 "one" 存在於 Map 中
    mapForMissing.getOrPutIfMissing("one") { 1 }

    println(mapForMissing)
    // {one=null}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4"}

### 移除項目 {id="remove-entries"}

若要從可變 Map 中移除項目，請使用 [`remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/remove.html) 函式。
呼叫 `remove()` 時，你可以傳入鍵或整個鍵值組。
如果你同時指定了鍵和值，則僅在該鍵對應的值與第二個引數相符時，才會移除該元素。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2, "three" to 3)
    numbersMap.remove("one")
    println(numbersMap)
    numbersMap.remove("three", 4)            //不移除任何內容
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

你也可以根據鍵或值從可變 Map 中移除項目。
為此，可以在 Map 的鍵或值上呼叫 `remove()`，並提供項目的鍵或值。
在值上呼叫時，`remove()` 僅會移除具有該指定值的第一個項目。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2, "three" to 3, "threeAgain" to 3)
    numbersMap.keys.remove("one")
    println(numbersMap)
    numbersMap.values.remove(3)
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

[`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html)（`-=`）運算子也可用於可變 Map。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2, "three" to 3)
    numbersMap -= "two"
    println(numbersMap)
    numbersMap -= "five"             //不移除任何內容
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}