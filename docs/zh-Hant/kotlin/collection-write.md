[//]: # (title: 集合寫入操作)

[可變集合](collections-overview.md#collection-types)支援用於變更集合內容的操作，例如新增或移除元素。
在本頁中，我們將介紹適用於 `MutableCollection` 所有實作的寫入操作。
關於 `List` 和 `Map` 適用的更具體操作，請分別參閱 [List 專屬操作](list-operations.md) 與 [Map 專屬操作](map-operations.md)。

## 新增元素 {id="adding-elements"}

若要將單一元素新增至 list 或 set，請使用 [`add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/add.html) 函式。指定的物件會附加到集合的末尾。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4)
    numbers.add(5)
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

[`addAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/add-all.html) 會將引數物件中的每個元素新增至 list 或 set。該引數可以是 `Iterable`、`Sequence` 或 `Array`。
接收者與引數的型別可以不同，例如，你可以將 `Set` 中的所有項目新增至 `List`。

當在 list 上呼叫時，`addAll()` 會依照元素在引數中的順序新增新元素。
你也可以呼叫 `addAll()` 並指定元素位置作為第一個引數。
引數集合的第一個元素將插入到此位置。
引數集合的其他元素將緊隨其後，將接收者原本的元素往後推移。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 5, 6)
    numbers.addAll(arrayOf(7, 8))
    println(numbers)
    numbers.addAll(2, setOf(3, 4))
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

你也可以使用 [`plus` 運算子](collection-plus-minus.md)的原地版本——[`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html)（`+=`）來新增元素。
當套用於可變集合時，`+=` 會將第二個運算元（一個元素或另一個集合）附加到集合的末尾。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two")
    numbers += "three"
    println(numbers)
    numbers += listOf("four", "five")    
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

## 移除元素 {id="removing-elements"}

若要從可變集合中移除元素，請使用 [`remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 函式。
`remove()` 接收元素值並移除該值第一次出現的項目。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4, 3)
    numbers.remove(3)                    // 移除第一個 `3`
    println(numbers)
    numbers.remove(5)                    // 未移除任何內容
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

若要一次移除多個元素，可以使用以下函式：

* [`removeAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove-all.html) 會移除引數集合中存在的所有元素。
   或者，你也可以傳入一個述詞作為引數來呼叫它；在此情況下，該函式會移除述詞結果為 `true` 的所有元素。
* [`retainAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/retain-all.html) 與 `removeAll()` 相反：它會移除除了引數集合中元素之外的所有元素。
   當與述詞搭配使用時，它只會保留符合該條件的元素。
* [`clear()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/clear.html) 會移除 list 中的所有元素，使其變為空集合。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4)
    println(numbers)
    numbers.retainAll { it >= 3 }
    println(numbers)
    numbers.clear()
    println(numbers)

    val numbersSet = mutableSetOf("one", "two", "three", "four")
    numbersSet.removeAll(setOf("one", "two"))
    println(numbersSet)
//sampleEnd
}
```
{kotlin-runnable="true"}

從集合中移除元素的另一種方式是使用 [`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html)（`-=`）運算子——也就是 [`minus`](collection-plus-minus.md) 的原地版本。
第二個引數可以是該元素型別的單一執行個體，也可以是另一個集合。
當右側為單一元素時，`-=` 會移除該元素*第一次*出現的項目。
反之，如果右側是集合，則會移除其元素*所有*出現的項目。
例如，如果 list 包含重複的元素，它們會被一次全部移除。
第二個運算元可以包含集合中不存在的元素，這些元素不會影響操作的執行。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "three", "four")
    numbers -= "three"
    println(numbers)
    numbers -= listOf("four", "five")    
    //numbers -= listOf("four")    // 效果與上述相同
    println(numbers)    
//sampleEnd
}
```
{kotlin-runnable="true"}

## 更新元素 {id="updating-elements"}

List 與 Map 也提供了用於更新元素的操作。
相關內容在 [List 專屬操作](list-operations.md) 與 [Map 專屬操作](map-operations.md) 中說明。
對於 set 而言，更新元素沒有意義，因為它本質上就是先移除一個元素，然後再新增另一個元素。