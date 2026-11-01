[//]: # (title: Set 專屬操作)

Kotlin collections 套件包含用於 Set 常見操作的擴充函式：尋找交集、合併、或從彼此中相減（求差集）。

若要將兩個集合合併為一個，請使用 [`union()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/union.html) 函式。它也可以使用中置（infix）形式 `a union b`。
請注意，對於有序集合，運算元的順序很重要。在產生的結果集合中，第一個運算元的元素會排在第二個運算元的元素之前：

```kotlin
fun main() {
//sampleStart
    val numbers = setOf("one", "two", "three")

    // 依順序輸出
    println(numbers union setOf("four", "five"))
    // [one, two, three, four, five]
    println(setOf("four", "five") union numbers)
    // [four, five, one, two, three]
//sampleEnd
}
```
{kotlin-runnable="true"}

若要找出兩個集合的交集（同時存在於兩者中的元素），請使用 [`intersect()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/intersect.html) 函式。
若要找出不存在於另一個集合中的集合元素，請使用 [`subtract()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/subtract.html) 函式。
這兩個函式也都可以使用中置形式呼叫，例如 `a intersect b`：

```kotlin
fun main() {
//sampleStart
    val numbers = setOf("one", "two", "three")

    // 輸出相同
    println(numbers intersect setOf("two", "one"))
    // [one, two]
    println(numbers subtract setOf("three", "four"))
    // [one, two]
    println(numbers subtract setOf("four", "three"))
    // [one, two]
//sampleEnd
}
```
{kotlin-runnable="true"}

若要尋找存在於兩個集合其中之一、但不存在於其交集中的元素，你也可以使用 `union()` 函式。
對於此操作（稱為對稱差，symmetric difference），可以計算兩個集合之間的差集並合併其結果：

```kotlin
fun main() {
//sampleStart
    val numbers = setOf("one", "two", "three")
    val numbers2 = setOf("three", "four")

    // 合併差集
    println((numbers - numbers2) union (numbers2 - numbers))
    // [one, two, four]
//sampleEnd
}
```
{kotlin-runnable="true"}

你也可以對 List 套用 `union()`、`intersect()` 和 `subtract()` 函式。
然而，它們的結果_一律_是 `Set`。在此結果中，所有重複的元素都會合併為一個，且無法使用索引存取：

```kotlin
fun main() {
//sampleStart
    val list1 = listOf(1, 1, 2, 3, 5, 8, -1)
    val list2 = listOf(1, 1, 2, 2, 3, 5)

    // 兩個 List 取交集的結果是 Set
    println(list1 intersect list2)
    // [1, 2, 3, 5]

    // 相同的元素會合併為一個
    println(list1 union list2)
    // [1, 2, 3, 5, 8, -1]
//sampleEnd
}
```
{kotlin-runnable="true"}