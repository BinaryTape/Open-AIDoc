[//]: # (title: 过滤集合)

过滤是集合处理中最常见的任务之一。
在 Kotlin 中，过滤条件由_谓词_（predicate）定义——即接受一个集合元素并返回布尔值的 lambda 表达式：`true` 表示给定元素符合该谓词，`false` 则表示不符合。

标准库包含一组扩展函数，让你可以通过单次调用来过滤集合。
这些函数不会更改原始集合，因此它们既可用于[可变集合也可用于只读集合](collections-overview.md#read-only-and-mutable-collections)。要对过滤结果进行操作，应将其赋值给变量，或在过滤后链式调用其他函数。

## 按谓词过滤 {id="filter-by-predicate"}

最基本的过滤函数是 [`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html)。
当使用谓词调用时，`filter()` 会返回符合该谓词的集合元素。
无论对 `List` 还是 `Set`，过滤后的结果集合都是 `List`；对 `Map` 而言，结果也仍然是 `Map`。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")  
    val longerThan3 = numbers.filter { it.length > 3 }
    println(longerThan3)

    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key11" to 11)
    val filteredMap = numbersMap.filter { (key, value) -> key.endsWith("1") && value > 10}
    println(filteredMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

`filter()` 中的谓词只能检查元素的值。
如果想在过滤中使用元素的位置，请使用 [`filterIndexed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-indexed.html)。
它接受一个带有两个实参的谓词：元素的索引与元素的值。 

若要根据否定条件过滤集合，请使用 [`filterNot()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-not.html)。
它会返回谓词计算结果为 `false` 的元素列表。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    
    val filteredIdx = numbers.filterIndexed { index, s -> (index != 0) && (s.length < 5)  }
    val filteredNot = numbers.filterNot { it.length <= 3 }

    println(filteredIdx)
    println(filteredNot)
//sampleEnd
}
```
{kotlin-runnable="true"}

还有一些函数可以通过过滤给定类型的元素来收窄元素类型：

* [`filterIsInstance()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-is-instance.html) 返回给定类型的集合元素。在 `List<Any>` 上调用时，`filterIsInstance<T>()` 会返回 `List<T>`，从而允许你对其项调用 `T` 类型的函数。

    ```kotlin
    fun main() {
    //sampleStart
        val numbers = listOf(null, 1, "two", 3.0, "four")
        println("All String elements in upper case:")
        numbers.filterIsInstance<String>().forEach {
            println(it.uppercase())
        }
    //sampleEnd
    }
    ```
    {kotlin-runnable="true"}

* [`filterNotNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-not-null.html) 返回所有非可空元素。在 `List<T?>` 上调用时，`filterNotNull()` 会返回 `List<T: Any>`，从而允许你将这些元素作为非可空对象来处理。

    ```kotlin
    fun main() {
    //sampleStart
        val numbers = listOf(null, "one", "two", null)
        numbers.filterNotNull().forEach {
            println(it.length)   // length 对于可为 null 的 String 是不可用的
        }
    //sampleEnd
    }
    ```
    {kotlin-runnable="true"}

## 分区 {id="partition"}

另一个过滤函数——[`partition()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/partition.html)——通过谓词过滤集合，并将不符合该谓词的元素保留在单独的列表中。
因此，你会得到一个由 `List` 组成的 `Pair` 作为返回值：第一个列表包含符合谓词的元素，第二个列表包含原始集合中的其余所有元素。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    val (match, rest) = numbers.partition { it.length > 3 }

    println(match)
    println(rest)
//sampleEnd
}
```
{kotlin-runnable="true"}

## 检验谓词 {id="test-predicates"}

最后，还有一些函数用于根据谓词对集合元素进行简单检验：

* [`any()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/any.html) 如果至少有一个元素符合给定谓词，则返回 `true`。
* [`none()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/none.html) 如果没有任何元素符合给定谓词，则返回 `true`。
* [`all()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/all.html) 如果所有元素都符合给定谓词，则返回 `true`。
    请注意，在空集合上使用任何有效谓词调用 `all()` 都会返回 `true`。这种行为在逻辑学中被称为_[空真 (vacuous truth)](https://en.wikipedia.org/wiki/Vacuous_truth)_。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")

    println(numbers.any { it.endsWith("e") })
    println(numbers.none { it.endsWith("a") })
    println(numbers.all { it.endsWith("e") })

    println(emptyList<Int>().all { it > 5 })   // 空真 (vacuous truth)
//sampleEnd
}
```
{kotlin-runnable="true"}

`any()` 和 `none()` 也可以在不带谓词的情况下使用：此时它们仅用于检查集合是否为空。
如果集合中存在元素，`any()` 返回 `true`，不存在则返回 `false`；`none()` 则正好相反。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    val empty = emptyList<String>()

    println(numbers.any())
    println(empty.any())
    
    println(numbers.none())
    println(empty.none())
//sampleEnd
}
```
{kotlin-runnable="true"}