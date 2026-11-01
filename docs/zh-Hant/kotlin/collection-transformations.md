[//]: # (title: 集合轉換操作)

Kotlin 標準函式庫提供了一組用於集合「轉換」（_transformations_）的擴充函式。
這些函式會根據提供的轉換規則，從現有集合建構出新的集合。
在本頁中，我們將簡要介紹可用的集合轉換函式。

## Map {id="map"}

「映射」（_mapping_）轉換會依據對另一個集合之元素呼叫函式的結果來建立集合。
基本的映射函式是 [`map()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map.html)。
它會將給定的 Lambda 函式套用至後續的每個元素，並傳回包含該 Lambda 結果的清單（List）。
結果的順序與元素的原始順序相同。
若要套用額外使用元素索引作為引數的轉換，請使用 [`mapIndexed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-indexed.html)。

```kotlin

fun main() {
//sampleStart
    val numbers = setOf(1, 2, 3)
    println(numbers.map { it * 3 })
    println(numbers.mapIndexed { idx, value -> value * idx })
//sampleEnd
}
```
{kotlin-runnable="true"}

如果轉換在某些元素上產生 `null`，你可以呼叫 [`mapNotNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-not-null.html) 函式而非 `map()`，或者呼叫 [`mapIndexedNotNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-indexed-not-null.html) 而非 `mapIndexed()`，從結果集合中過濾掉 `null`。

```kotlin

fun main() {
//sampleStart
    val numbers = setOf(1, 2, 3)
    println(numbers.mapNotNull { if ( it == 2) null else it * 3 })
    println(numbers.mapIndexedNotNull { idx, value -> if (idx == 0) null else value * idx })
//sampleEnd
}
```
{kotlin-runnable="true"}

在轉換 Map 時，你有兩種選擇：轉換鍵（key）同時保持值（value）不變，反之亦然。
若要對鍵套用給定的轉換，請使用 [`mapKeys()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-keys.html)；
相對地，[`mapValues()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-values.html) 則用於轉換值。
這兩個函式所使用的轉換都接收 Map 條目（entry）作為引數，因此你可以同時操作其鍵與值。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key11" to 11)
    println(numbersMap.mapKeys { it.key.uppercase() })
    println(numbersMap.mapValues { it.value + it.key.length })
//sampleEnd
}
```
{kotlin-runnable="true"}

## Zip {id="zip"}

_Zipping_ 轉換是從兩個集合中相同位置的元素建構 Pair。
在 Kotlin 標準函式庫中，這是透過 [`zip()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/zip.html) 擴充函式來完成的。

當在某個集合或陣列上呼叫並以另一個集合（或陣列）作為引數時，`zip()` 會傳回 `Pair` 物件的 `List`。接收者集合的元素是這些 Pair 中的第一個元素。

如果集合的大小不同，`zip()` 的結果大小為兩者中較小者；較大集合的後續元素將不會包含在結果中。

`zip()` 也可以使用中綴形式 `a zip b` 呼叫。

```kotlin

fun main() {
//sampleStart
    val colors = listOf("red", "brown", "grey")
    val animals = listOf("fox", "bear", "wolf")
    println(colors zip animals)

    val twoAnimals = listOf("fox", "bear")
    println(colors.zip(twoAnimals))
//sampleEnd
}
```
{kotlin-runnable="true"}

你也可以傳入帶有兩個參數（接收者元素和引數元素）的轉換函式來呼叫 `zip()`。在這種情況下，結果 `List` 會包含對相同位置的接收者與引數元素對呼叫轉換函式所得的傳回值。

```kotlin

fun main() {
//sampleStart
    val colors = listOf("red", "brown", "grey")
    val animals = listOf("fox", "bear", "wolf")
    
    println(colors.zip(animals) { color, animal -> "The ${animal.replaceFirstChar { it.uppercase() }} is $color"})
//sampleEnd
}
```
{kotlin-runnable="true"}

當你擁有一個 `Pair` 的 `List` 時，可以進行反向轉換 — _unzipping_（解壓）— 從這些 Pair 建構出兩個清單：

* 第一個清單包含原始清單中每個 `Pair` 的第一個元素。
* 第二個清單包含第二個元素。

若要解壓 Pair 清單，請呼叫 [`unzip()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/unzip.html)。

```kotlin

fun main() {
//sampleStart
    val numberPairs = listOf("one" to 1, "two" to 2, "three" to 3, "four" to 4)
    println(numberPairs.unzip())
//sampleEnd
}
```
{kotlin-runnable="true"}

## Associate {id="associate"}

「關聯」（_Association_）轉換允許從集合元素以及與其關聯的特定值來建構 Map。
在不同的關聯類型中，元素可以是關聯 Map 中的鍵或值。

基本的關聯函式 [`associateWith()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate-with.html) 會建立一個 `Map`，其中原始集合的元素作為鍵，而值則是透過給定的轉換函式從這些元素產生。如果兩個元素相等，則 Map 中只會保留最後一個。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    println(numbers.associateWith { it.length })
//sampleEnd
}
```
{kotlin-runnable="true"}

若要以集合元素作為值來建構 Map，可以使用函式 [`associateBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate-by.html)。
它接受一個根據元素的值傳回鍵的函式。如果兩個元素的鍵相等，則 Map 中只會保留最後一個。

`associateBy()` 也可以搭配值轉換函式一起呼叫。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")

    println(numbers.associateBy { it.first().uppercaseChar() })
    println(numbers.associateBy(keySelector = { it.first().uppercaseChar() }, valueTransform = { it.length }))
//sampleEnd
}
```
{kotlin-runnable="true"}

另一種鍵與值均以某種方式由集合元素產生的建構 Map 方式是 [`associate()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate.html) 函式。
它接受一個傳回 `Pair` 的 Lambda 函式：即對應 Map 條目的鍵與值。

請注意，`associate()` 會產生短期的 `Pair` 物件，這可能會影響效能。
因此，應在效能要求不高或比其他選項更合適時才使用 `associate()`。

後者的一個範例是當鍵與對應的值是同時由某個元素產生時。

```kotlin

fun main() {
data class FullName (val firstName: String, val lastName: String)

fun parseFullName(fullName: String): FullName {
    val nameParts = fullName.split(" ")
    if (nameParts.size == 2) {
        return FullName(nameParts[0], nameParts[1])
    } else throw Exception("Wrong name format")
}

//sampleStart
    val names = listOf("Alice Adams", "Brian Brown", "Clara Campbell")
    println(names.associate { name -> parseFullName(name).let { it.lastName to it.firstName } })  
//sampleEnd
}
```
{kotlin-runnable="true"}

在這裡，我們先對元素呼叫轉換函式，然後從該函式結果的屬性建構出 Pair。

## Flatten {id="flatten"}

如果你操作巢狀集合，可能會發現標準函式庫中提供扁平化存取巢狀集合元素的函式非常實用。

第一個函式是 [`flatten()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/flatten.html)。
你可以在集合的集合上呼叫它，例如 `Set` 的 `List`。
此函式會傳回包含所有巢狀集合元素的單一 `List`。

```kotlin

fun main() {
//sampleStart
    val numberSets = listOf(setOf(1, 2, 3), setOf(4, 5, 6), setOf(1, 2))
    println(numberSets.flatten())
//sampleEnd
}
```
{kotlin-runnable="true"}

另一個函式 [`flatMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/flat-map.html) 則提供了處理巢狀集合的靈活方式。它接受一個將集合元素映射為另一個集合的函式。
因此，`flatMap()` 會傳回在所有元素上呼叫該函式後之傳回值的單一清單。
所以，`flatMap()` 的行為相當於依序呼叫 `map()`（以集合做為映射結果）與 `flatten()`。

```kotlin

data class StringContainer(val values: List<String>)

fun main() {
//sampleStart
    val containers = listOf(
        StringContainer(listOf("one", "two", "three")),
        StringContainer(listOf("four", "five", "six")),
        StringContainer(listOf("seven", "eight"))
    )
    println(containers.flatMap { it.values })
//sampleEnd
}

```
{kotlin-runnable="true"}

## 字串表示 (String representation) {id="string-representation"}

如果你需要以易讀的格式取得集合內容，請使用將集合轉換為字串的函式：[`joinToString()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/join-to-string.html) 與 [`joinTo()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/join-to.html)。

`joinToString()` 根據提供的引數從集合元素建構單一 `String`。
`joinTo()` 執行相同的操作，但將結果附加到給定的 [`Appendable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-appendable/index.html) 物件中。

當使用參數的預設值呼叫時，這些函式傳回的結果類似於在集合上呼叫 `toString()`：以逗號加空格分隔各元素字串表示的 `String`。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    
    println(numbers)         
    println(numbers.joinToString())
    
    val listString = StringBuffer("The list of numbers: ")
    numbers.joinTo(listString)
    println(listString)
//sampleEnd
}
```
{kotlin-runnable="true"}

若要建構自訂的字串表示，你可以在函式引數 `separator`、`prefix` 及 `postfix` 中指定參數。產生的字串將以 `prefix` 開頭，以 `postfix` 結尾。除了最後一個元素之外，每個元素後面都會加上 `separator`。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")    
    println(numbers.joinToString(separator = " | ", prefix = "start: ", postfix = ": end"))
//sampleEnd
}
```
{kotlin-runnable="true"}

對於較大的集合，你可能想要指定 `limit` — 即包含在結果中的元素數量。如果集合大小超過 `limit`，則所有其餘元素將被替換為 `truncated` 引數的單一值。

```kotlin

fun main() {
//sampleStart
    val numbers = (1..100).toList()
    println(numbers.joinToString(limit = 10, truncated = "<...>"))
//sampleEnd
}
```
{kotlin-runnable="true"}

最後，若要自訂元素本身的呈現方式，請提供 `transform` 函式。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    println(numbers.joinToString { "Element: ${it.uppercase()}"})
//sampleEnd
}
```
{kotlin-runnable="true"}