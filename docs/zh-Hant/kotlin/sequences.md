[//]: # (title: 序列)

除了集合之外，Kotlin 標準函式庫還包含另一種類型——_序列_ ([`Sequence<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/-sequence/index.html))。
與集合不同，序列並不包含元素，而是在迭代時產生它們。
序列提供了與 [`Iterable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/index.html) 相同的函式，但對多步驟集合處理採用了另一種實作方式。

當 `Iterable` 的處理包含多個步驟時，這些步驟會急切地（eagerly）執行：每個處理步驟完成後都會回傳其結果——一個中間集合。後續步驟則在這個集合上執行。相對地，序列的多步驟處理在可能的情況下會延遲（lazily）執行：只有在請求整個處理鏈的結果時，才會進行實際計算。

操作執行的順序也有所不同：`Sequence` 會針對每個單一元素逐一執行所有的處理步驟。而 `Iterable` 則是針對整個集合完成每個步驟後，再進行下一個步驟。

因此，序列能讓你避免建構中間步驟的結果，進而提升整個集合處理鏈的效能。然而，序列的延遲特性也會增加一些開銷，這在處理較小的集合或進行較簡單的計算時可能會特別明顯。因此，你應該同時考慮 `Sequence` 和 `Iterable`，並根據你的實際情況決定何者更合適。

## 建構 {id="construct"}

### 透過元素建立 {id="from-elements"}

若要建立序列，請呼叫 [`sequenceOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/sequence-of.html) 函式，並將元素作為其引數列出。

```kotlin
val numbersSequence = sequenceOf("four", "three", "two", "one")
```

### 透過 Iterable 建立 {id="from-an-iterable"}

如果你已經有一個 `Iterable` 物件（例如 `List` 或 `Set`），可以透過呼叫 [`asSequence()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/as-sequence.html) 來建立序列。

```kotlin
val numbers = listOf("one", "two", "three", "four")
val numbersSequence = numbers.asSequence()

```

### 透過函式建立 {id="from-a-function"}

另一種建立序列的方法是使用計算其元素的函式來進行建構。
若要以函式為基礎建構序列，請呼叫 [`generateSequence()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/generate-sequence.html)，並將該函式作為引數傳入。你可以選擇性地將第一個元素指定為明確的值或函式呼叫的結果。
當提供的函式回傳 `null` 時，序列的產生就會停止。因此，下面範例中的序列是無限的。

```kotlin

fun main() {
//sampleStart
    val oddNumbers = generateSequence(1) { it + 2 } // `it` 為前一個元素
    println(oddNumbers.take(5).toList())
    //println(oddNumbers.count())     // 錯誤：該序列是無限的
//sampleEnd
}
```
{kotlin-runnable="true"}

若要使用 `generateSequence()` 建立有限序列，請提供一個在達到你所需的最後一個元素後回傳 `null` 的函式。

```kotlin

fun main() {
//sampleStart
    val oddNumbersLessThan10 = generateSequence(1) { if (it < 8) it + 2 else null }
    println(oddNumbersLessThan10.count())
//sampleEnd
}
```
{kotlin-runnable="true"}

### 透過區塊建立 {id="from-chunks"}

最後，還有一個函式可以讓你逐一產生序列元素，或是依任意大小的區塊來產生——即 [`sequence()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/sequence.html) 函式。
此函式接受一個 Lambda 運算式，其中包含對 [`yield()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/-sequence-scope/yield.html) 與 [`yieldAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/-sequence-scope/yield-all.html) 函式的呼叫。
它們會向序列取用者回傳一個元素，並掛起 `sequence()` 的執行，直到取用者請求下一個元素為止。`yield()` 接受單一元素作為引數；`yieldAll()` 可以接受一個 `Iterable` 物件、一個 `Iterator` 或另一個 `Sequence`。傳入 `yieldAll()` 的 `Sequence` 引數可以是無限的。不過，這樣的呼叫必須是最後一個呼叫：所有後續呼叫都將永遠不會被執行。

```kotlin

fun main() {
//sampleStart
    val oddNumbers = sequence {
        yield(1)
        yieldAll(listOf(3, 5))
        yieldAll(generateSequence(7) { it + 2 })
    }
    println(oddNumbers.take(5).toList())
//sampleEnd
}
```
{kotlin-runnable="true"}

## 序列操作 {id="sequence-operations"}

根據狀態需求，序列操作可分為以下幾類：

* _無狀態（Stateless）_ 操作不需要狀態，並且獨立處理每個元素，例如 [`map()`](collection-transformations.md#map) 或 [`filter()`](collection-filtering.md)。
   無狀態操作在處理元素時也可以只需要少量常數大小的狀態，例如 [`take()` 或 `drop()`](collection-parts.md)。
* _有狀態（Stateful）_ 操作需要大量的狀態，通常與序列中的元素數量成正比。

如果一個序列操作回傳另一個以延遲方式產生的序列，則稱之為_中間操作（intermediate）_。
否則，該操作即為_終端操作（terminal）_。終端操作的範例包括 [`toList()`](constructing-collections.md#copy) 或 [`sum()`](collection-aggregate.md)。序列元素只能透過終端操作來擷取。

序列可以進行多次迭代；然而，某些序列實作可能限制自己只能迭代一次。這在它們的文件中會特別說明。

## 序列處理範例 {id="sequence-processing-example"}

讓我們透過範例來看看 `Iterable` 與 `Sequence` 之間的差異。 

### Iterable {id="iterable"}

假設你有一個單字清單。以下程式碼會篩選出長度超過三個字元的單字，並輸出前四個此類單字的長度。

```kotlin

fun main() {    
//sampleStart
    val words = "The quick brown fox jumps over the lazy dog".split(" ")
    val lengthsList = words.filter { println("filter: $it"); it.length > 3 }
        .map { println("length: ${it.length}"); it.length }
        .take(4)

    println("Lengths of first 4 words longer than 3 chars:")
    println(lengthsList)
//sampleEnd
}
```
{kotlin-runnable="true"}

執行此程式碼時，你會看到 `filter()` 和 `map()` 函式的執行順序與它們在程式碼中出現的順序相同。首先，你會看到所有元素的 `filter:`，接著是篩選後留下的元素的 `length:`，最後是最後兩行的輸出。 

清單的處理流程如下：

![清單處理](list-processing.svg)

### Sequence {id="sequence"}

現在讓我們使用序列來編寫相同的邏輯：

```kotlin

fun main() {
//sampleStart
    val words = "The quick brown fox jumps over the lazy dog".split(" ")
    //將 List 轉換為 Sequence
    val wordsSequence = words.asSequence()

    val lengthsSequence = wordsSequence.filter { println("filter: $it"); it.length > 3 }
        .map { println("length: ${it.length}"); it.length }
        .take(4)

    println("Lengths of first 4 words longer than 3 chars")
    // 終端操作：以 List 形式取得結果
    println(lengthsSequence.toList())
//sampleEnd
}
```
{kotlin-runnable="true"}

此程式碼的輸出顯示，`filter()` 和 `map()` 函式僅在建置結果清單時才會被呼叫。
因此，你會先看到文字行 `"Lengths of.."`，接著序列處理才開始。
請注意，對於篩選後留下的元素，map 會在篩選下一個元素之前執行。
當結果大小達到 4 時，處理就會停止，因為這是 `take(4)` 所能回傳的最大可能大小。

序列的處理流程如下：

![序列處理](sequence-processing.svg) {width="700"}

在這個範例中，與使用清單的方式相比，元素的延遲處理以及在找到四個項目後停止，減少了操作的次數。