[//]: # (title: 修改集合)

[可变集合](collections-overview.md#read-only-and-mutable-collections)支持更改集合内容的操作，例如添加或移除元素。
在本页中，我们将介绍适用于所有 `MutableCollection` 实现的写入操作。
有关适用于 `List` 和 `Map` 的更具体操作，请分别参阅 [List 专属操作](list-operations.md)与 [Map 专属操作](map-operations.md)。

## 添加元素 {id="adding-elements"}

若要将单个元素添加到列表或 set 中，请使用 [`add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/add.html) 函数。指定的对象会被追加到集合末尾。

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

[`addAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/add-all.html) 将实参对象中的每个元素都添加到列表或 set 中。该实参可以是 `Iterable`、`Sequence` 或 `Array`。
接收者与实参的类型可以不同，例如，你可以将 `Set` 中的所有项添加到 `List` 中。

在列表上调用时，`addAll()` 会按照新元素在实参中出现的顺序将其添加。
你也可以在调用 `addAll()` 时将元素位置指定为第一个实参。
实参集合中的第一个元素将插入到该位置。
实参集合中的其他元素将紧随其后，同时将接收者中的原有元素向后顺延。

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

你还可以使用 [`plus` 运算符](collection-combine.md)的就地版本——[`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html)（`+=`）来添加元素。
当应用于可变集合时，`+=` 会将第二个操作数（单个元素或另一个集合）追加到集合末尾。

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

若要从可变集合中移除元素，请使用 [`remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 函数。
`remove()` 接收元素值并移除该值出现的一次（即首个匹配项）。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4, 3)
    numbers.remove(3)                    // 移除第一个 `3`
    println(numbers)
    numbers.remove(5)                    // 没有任何移除
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

若要一次移除多个元素，可以使用以下函数：

* [`removeAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove-all.html) 移除实参集合中存在的所有元素。
   此外，你也可以传入一个谓词作为实参来调用它；在此情况下，该函数将移除使谓词返回 `true` 的所有元素。
* [`retainAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/retain-all.html) 与 `removeAll()` 相反：它移除除实参集合中包含的元素之外的所有元素。
   当与谓词一起使用时，它仅保留与该谓词匹配的元素。
* [`clear()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/clear.html) 移除列表中的所有元素并使其变为空。

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

从集合中移除元素的另一种方式是使用 [`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html)（`-=`）运算符——即 [`minus`](collection-combine.md) 的就地版本。
第二个实参可以是元素类型的单个实例，也可以是另一个集合。
当右侧为单个元素时，`-=` 会移除其*首次*出现的项。
反之，如果右侧是一个集合，则会移除其包含元素的*所有*出现项。
例如，如果列表中包含重复元素，它们会被一次性全部移除。
第二个操作数可以包含集合中不存在的元素。这些元素不会影响操作的执行。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "three", "four")
    numbers -= "three"
    println(numbers)
    numbers -= listOf("four", "five")    
    //numbers -= listOf("four")    // 与上述操作效果相同
    println(numbers)    
//sampleEnd
}
```
{kotlin-runnable="true"}

## 更新元素 {id="updating-elements"}

List 和 map 也提供了更新元素的操作。
具体请参见 [List 专属操作](list-operations.md)与 [Map 专属操作](map-operations.md)。
对于 set，更新操作没有意义，因为其本质上就是移除一个元素并添加另一个元素。