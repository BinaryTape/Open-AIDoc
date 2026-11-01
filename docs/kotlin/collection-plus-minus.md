[//]: # (title: plus 与 minus 运算符)

在 Kotlin 中，为集合定义了 [`plus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus.html)（`+`）与 [`minus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus.html)（`-`）运算符。
它们将一个集合作为第一个操作数；第二个操作数可以是一个元素，也可以是另一个集合。
返回值是一个新的只读集合：

* `plus` 的结果包含来自原始集合_以及_来自第二个操作数的元素。
* `minus` 的结果包含来自原始集合_但排除_第二个操作数中的元素。
  如果第二个操作数是一个元素，`minus` 会移除其_首次_出现；如果它是一个集合，则会移除其元素的_所有_出现。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")

    val plusList = numbers + "five"
    val minusList = numbers - listOf("three", "four")
    println(plusList)
    println(minusList)
//sampleEnd
}
```
{kotlin-runnable="true"}

有关 Map 的 `plus` 与 `minus` 运算符的详细信息，请参阅 [Map 专属操作](map-operations.md)。
集合中还定义了[复合赋值运算符](operator-overloading.md#augmented-assignments) [`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html)（`+=`）与 [`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html)（`-=`）。然而，对于只读集合，它们实际上使用的是 `plus` 或 `minus` 运算符，并尝试将结果赋值给同一个变量。因此，它们仅适用于 `var` 只读集合。
对于可变集合，如果声明为 `val`，它们则会直接修改该集合。更多详情请参阅[集合写操作](collection-write.md)。