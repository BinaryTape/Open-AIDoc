[//]: # (title: Map 特定操作)

在 [map](collection-types.md#map) 中，鍵（key）和值（value）的型別都是由使用者定義的。
透過鍵存取 map 項目（entry）賦予了各種 map 特有的處理能力，從根據鍵取得值，到分別對鍵與值進行篩選。
本頁提供標準函式庫中 map 處理函式的說明。

## 取得鍵與值 {id="retrieve-keys-and-values"}

若要從 map 中取得值，必須將其鍵作為引數傳遞給 [`get()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/get.html) 函式。
同時也支援簡寫的 `[key]` 語法。如果找不到指定的鍵，它會傳回 `null`。
另外還有 [`getValue()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-value.html) 函式，
其行為略有不同：如果在 map 中找不到該鍵，它會拋出例外。
此外，你還有更多選項來處理鍵不存在的情況：

* [`getOrElse()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-else.html) 的運作方式與 list 相同：不存在鍵的值會由給定的 Lambda 函式傳回。
* [`getOrDefault()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-default.html) 在找不到該鍵時傳回指定的預設值。

對於具有可為 null 值的 map，請改用以下函式，它們會明確處理遺漏的鍵和 `null` 值：

* `getOrElseIfNull()` 在鍵遺漏或具有 `null` 值時傳回指定預設值的結果。
* `getOrElseIfMissing()` 僅在鍵遺漏時傳回指定預設值的結果。

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

    // 拋出例外，因為 map 中不存在 "six"
    // numbersMap.getValue("six")

//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4"}

若要對 map 的所有鍵或所有值執行操作，你可以分別從 `keys` 和 `values` 屬性中擷取它們。
`keys` 是包含所有 map 鍵的 set，而 `values` 是包含所有 map 值的 collection。

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

你可以使用 [`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html) 函式來[篩選](collection-filtering.md) map，就像篩選其他集合一樣。
在 map 上呼叫 `filter()` 時，請傳遞一個以 `Pair` 作為引數的謂詞（predicate）。
這讓你能同時在篩選謂詞中使用鍵與值。

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

篩選 map 還有兩種特定方式：依鍵篩選與依值篩選。
這兩種方式分別有對應的函式：[`filterKeys()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-keys.html) 和 [`filterValues()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-values.html)。
兩者都會傳回符合給定謂詞的新 map 項目。
`filterKeys()` 的謂詞只檢查元素的鍵，而 `filterValues()` 的謂詞只檢查值。

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

## 加號與減號運算子 {id="plus-and-minus-operators"}

由於透過鍵存取元素，[`plus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus.html)（`+`）與 [`minus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus.html)
（`-`）運算子在 map 上的運作方式與其他集合不同。
`plus` 會傳回一個包含其兩個運算元元素的 `Map`：左側為 `Map`，右側為 `Pair` 或另一個 `Map`。
當右側運算元包含的項目其鍵已存在於左側 `Map` 中時，結果 map 會包含來自右側的項目。

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

`minus` 會依據左側 `Map` 的項目建立一個 `Map`，但排除鍵存在於右側運算元中的項目。
因此，右側運算元可以是單一鍵，也可以是鍵的集合：list、set 等。

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

關於在可變 map 上使用 [`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html)（`+=`）與 [`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html)
（`-=`）運算子的詳細資訊，請參閱下方的 [Map 寫入操作](#map-write-operations)。

## Map 寫入操作 {id="map-write-operations"}

[可變](collections-overview.md#read-only-and-mutable-collections) map 提供了 map 特有的寫入操作。
這些操作讓你可以透過基於鍵對值的存取來修改 map 內容。

定義 map 寫入操作的若干規則如下：

* 值可以更新。相對地，鍵永遠不會改變：一旦新增了項目，其鍵即固定不變。
* 每個鍵始終只關聯一個值。你可以新增或移除整個項目。

以下是標準函式庫中可用於可變 map 寫入操作的函式說明。

### 新增與更新項目 {id="add-and-update-entries"}

若要向可變 map 新增鍵值對，請使用 [`put()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/put.html)。
當新項目放入 `LinkedHashMap`（預設的 map 實作）時，它會被加入到最後，因此在疊代 map 時會排在最後。在已排序的 map 中，新元素的位置由其鍵的順序決定。

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
其引數可以是一個 `Map` 或一組 `Pair`：`Iterable`、`Sequence` 或 `Array`。

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

如果給定的鍵已存在於 map 中，`put()` 與 `putAll()` 都會覆寫其值。因此，你可以使用它們來更新 map 項目的值。

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

你也可以使用簡寫運算子形式向 map 新增項目。有兩種方式：

* [`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html)（`+=`）運算子。
* 做為 `set()` 別名的 `[]` 運算子。

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

當使用 map 中已存在的鍵呼叫時，運算子會覆寫對應項目的值。

#### 為缺失的項目新增預設值 {id="add-default-values-for-missing-entries"}

若要在沒有可用值時傳回現有值或新增預設值，請使用 [`.getOrPut()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-put.html) 擴充函式。
如果鍵遺漏或具有 `null` 值，`.getOrPut()` 會儲存預設值並傳回它。

對於具有可為 null 值的 map，你可以使用 `.getOrPutIfNull()` 與 `.getOrPutIfMissing()` 函式來控制如何處理 `null` 值：

* `getOrPutIfNull()` 的行為類似 `getOrPut()`，如果鍵遺漏或具有 `null` 值，則使用預設值。
* `getOrPutIfMissing()` 僅在鍵遺漏時才使用預設值。

`getOrPutIfNull()` 與 `getOrPutIfMissing()` 函式為[實驗性功能](components-stability.md#stability-levels-explained)。
若要啟用，請使用 `@OptIn(ExperimentalStdlibApi::class)` 註解。

以下是一個範例：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
//sampleStart
    val mapForNull = mutableMapOf<String, Int?>("one" to null)
    val mapForMissing = mutableMapOf<String, Int?>("one" to null)

    // 若 "one" 的值為 null 則替換該值
    mapForNull.getOrPutIfNull("one") { 1 }

    println(mapForNull)
    // {one=1}

    // 保留 null 值，因為 "one" 存在於 map 中
    mapForMissing.getOrPutIfMissing("one") { 1 }

    println(mapForMissing)
    // {one=null}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4"}

### 移除項目 {id="remove-entries"}

若要從可變 map 中移除項目，請使用 [`remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/remove.html) 函式。
呼叫 `remove()` 時，你可以傳遞鍵或整個鍵值對。
如果同時指定鍵和值，則僅在該鍵的值與第二個引數相符時，才會移除該元素。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2, "three" to 3)
    numbersMap.remove("one")
    println(numbersMap)
    numbersMap.remove("three", 4)            //不會移除任何內容
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

你也可以透過鍵或值從可變 map 中移除項目。
為此，請在 map 的 keys 或 values 上呼叫 `remove()`，並提供項目的鍵或值。
在 values 上呼叫時，`remove()` 僅會移除第一個具有給定值的項目。

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

[`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html)（`-=`）運算子
也可用於可變 map。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2, "three" to 3)
    numbersMap -= "two"
    println(numbersMap)
    numbersMap -= "five"             //不會移除任何內容
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}