[//]: # (title: 取得集合部分內容)

Kotlin 標準函式庫包含用於擷取集合中部分內容的擴充函式。
這些函式提供了多種方式來為結果集合選取元素：明確列出其位置、指定結果大小等等。

## 切片 (Slice) {id="slice"}

[`slice()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/slice.html) 會傳回具有指定索引的集合元素清單。索引可以作為[區間](ranges.md)或整數值集合傳入。

```kotlin

fun main() {
//sampleStart    
    val numbers = listOf("one", "two", "three", "four", "five", "six")    
    println(numbers.slice(1..3))
    println(numbers.slice(0..4 step 2))
    println(numbers.slice(setOf(3, 5, 0)))    
//sampleEnd
}
```
{kotlin-runnable="true"}

## 取得與捨棄 (Take and drop) {id="take-and-drop"}

若要從第一個元素開始取得指定數量的元素，請使用 [`take()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/take.html) 函式。
若要取得最後幾個元素，請使用 [`takeLast()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/take-last.html)。
當傳入的數字大於集合大小時，兩個函式都會傳回整個集合。

若要取得除指定數量的前幾個或後幾個元素之外的所有元素，請分別呼叫 [`drop()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/drop.html) 和 [`dropLast()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/drop-last.html) 函式。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five", "six")
    println(numbers.take(3))
    println(numbers.takeLast(3))
    println(numbers.drop(1))
    println(numbers.dropLast(5))
//sampleEnd
}
```
{kotlin-runnable="true"}

你也可以使用述詞 (predicate) 來定義要取得或捨棄的元素數量。
有四個與上述類似的函式：

* [`takeWhile()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/take-while.html) 是帶有述詞的 `take()`：它會取得元素，直到但不包含第一個不符合述詞的元素。如果集合的第一個元素就不符合述詞，則結果為空。
* [`takeLastWhile()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/take-last-while.html) 與 `takeLast()` 類似：它從集合末尾開始取得符合述詞的元素區間。該區間的第一個元素是最後一個不符合述詞之元素的下一個元素。如果集合的最後一個元素不符合述詞，則結果為空；
* [`dropWhile()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/drop-while.html) 是與使用相同述詞的 `takeWhile()` 相反的操作：它傳回從第一個不符合述詞的元素開始一直到末尾的所有元素。
* [`dropLastWhile()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/drop-last-while.html) 是與使用相同述詞的 `takeLastWhile()` 相反的操作：它傳回從開頭到最後一個不符合述詞的元素為止的所有元素。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five", "six")
    println(numbers.takeWhile { !it.startsWith('f') })
    println(numbers.takeLastWhile { it != "three" })
    println(numbers.dropWhile { it.length == 3 })
    println(numbers.dropLastWhile { it.contains('i') })
//sampleEnd
}
```
{kotlin-runnable="true"}

## 分塊 (Chunked) {id="chunked"}

若要將集合分割為指定大小的多個部分，請使用 [`chunked()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/chunked.html) 函式。
`chunked()` 接受單一引數（分塊的大小），並傳回由指定大小的 `List` 所組成的 `List`。
第一個分塊從第一個元素開始並包含 `size` 個元素，第二個分塊包含接下來的 `size` 個元素，依此類推。最後一個分塊的大小可能會較小。

```kotlin

fun main() {
//sampleStart
    val numbers = (0..13).toList()
    println(numbers.chunked(3))
//sampleEnd
}
```
{kotlin-runnable="true"}

你也可以立即對傳回的分塊套用轉換。
為此，請在呼叫 `chunked()` 時以 Lambda 函式形式提供轉換。
Lambda 引數即為集合的一個分塊。當使用轉換呼叫 `chunked()` 時，
分塊是短期的 `List`，應在該 Lambda 中立即被取用。

```kotlin

fun main() {
//sampleStart
    val numbers = (0..13).toList() 
    println(numbers.chunked(3) { it.sum() })  // `it` 是原始集合的一個分塊
//sampleEnd
}
```
{kotlin-runnable="true"}

## 視窗化 (Windowed) {id="windowed"}

你可以擷取指定大小之集合元素的所有可能區間。
用於取得它們的函式稱為 [`windowed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/windowed.html)：
它會傳回一個元素區間清單，就像是透過給定大小的滑動視窗查看集合時所看到的內容。
與 `chunked()` 不同，`windowed()` 會傳回從*每個*集合元素開始的元素區間（_視窗_）。
所有視窗都會作為單一 `List` 的元素傳回。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")    
    println(numbers.windowed(3))
//sampleEnd
}
```
{kotlin-runnable="true"}

`windowed()` 提供了更多帶有預設值的參數，具有更高的彈性：

* `step` 定義兩個相鄰視窗的第一個元素之間的距離。預設值為 1，因此結果包含從所有元素開始的視窗。如果將步長增加到 2，則只會收到從奇數元素（第一個、第三個等等）開始的視窗。
* `partialWindows` 包含從集合末尾元素開始的較小尺寸視窗。例如，如果請求三個元素的視窗，則無法為最後兩個元素建構完整視窗。在這種情況下啟用 `partialWindows` 會額外包含大小為 2 和 1 的兩個清單。

最後，你也可以立即對傳回的區間套用轉換。
為此，請在呼叫 `windowed()` 時以 Lambda 函式形式提供轉換。

```kotlin

fun main() {
//sampleStart
    val numbers = (1..10).toList()
    println(numbers.windowed(3, step = 2, partialWindows = true))
    println(numbers.windowed(3) { it.sum() })
//sampleEnd
}
```
{kotlin-runnable="true"}

若要建構雙元素視窗，可以使用獨立的函式——[`zipWithNext()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/zip-with-next.html)。
它會為接收者集合的相鄰元素建立配對。
請注意，`zipWithNext()` 不會將集合切分為數對；它會為除最後一個元素之外的_每個_元素建立一個 `Pair`，因此它在 `[1, 2, 3, 4]` 上的結果是 `[[1, 2], [2, 3], [3, 4]]`，而不是 `[[1, 2], [3, 4]]`。
`zipWithNext()` 也可以搭配轉換函式一起呼叫；它應該接受接收者集合的兩個元素作為引數。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")    
    println(numbers.zipWithNext())
    println(numbers.zipWithNext() { s1, s2 -> s1.length > s2.length})
//sampleEnd
}
```
{kotlin-runnable="true"}