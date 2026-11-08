[//]: # (title: Map 专属操作)

在 [Map](collection-types.md#map) 中，键和值的类型都是用户定义的。基于键对 map 条目的访问支持多种 map 专属的处理能力，从通过键获取值到分别对键和值进行过滤。在本页面中，我们提供了标准库中 map 处理函数的说明。

## 获取键和值 {id="retrieve-keys-and-values"}

要从 map 中获取值，必须提供其键作为 [`get()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/get.html) 函数的实参。
同时还支持简写语法 `[key]`。如果找不到给定的键，则返回 `null`。
还有一个 [`getValue()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-value.html) 函数，它的行为略有不同：如果键在 map 中不存在，它会抛出异常。
此外，你还可以使用更多选项来处理键不存在的情况：

* [`getOrElse()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-else.html) 的工作方式与列表相同：不存在的键的值由给定的 lambda 函数返回。
* [`getOrDefault()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-default.html) 在找不到键时返回指定的默认值。

对于具有可空值的 map，改用以下函数，它们可以显式处理缺失的键和 `null` 值：

* `getOrElseIfNull()` 在键缺失或其值为 `null` 时返回指定的默认值结果。
* `getOrElseIfMissing()` 仅在键缺失时返回指定的默认值结果。

以下示例展示了这些函数之间的区别：

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

    // 抛出异常，因为 map 中缺失 "six"
    // numbersMap.getValue("six")

//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4"}

要对 map 的所有键或所有值执行操作，可以分别从 `keys` 和 `values` 属性中检索它们。
`keys` 是包含所有 map 键的 Set，而 `values` 是包含所有 map 值的集合。

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

## 过滤 {id="filter"}

你可以像过滤其他集合一样，使用 [`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html) 函数[过滤](collection-filtering.md) map。
对 map 调用 `filter()` 时，需要传入一个以 `Pair` 作为实参的谓词。
这样可以在过滤谓词中同时使用键和值。

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

还有两种特定的 map 过滤方式：按键过滤和按值过滤。
分别对应两个函数：[`filterKeys()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-keys.html) 和 [`filterValues()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-values.html)。
两者都返回包含匹配给定谓词的条目的新 map。
`filterKeys()` 的谓词仅检查元素键，而 `filterValues()` 的谓词仅检查元素值。

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

## plus 和 minus 运算符 {id="plus-and-minus-operators"}

由于按键访问元素的特性，[`plus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus.html) (`+`) 和 [`minus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus.html) (`-`) 运算符在 map 上的工作方式与其他集合不同。
`plus` 返回一个包含其两个操作数元素的 `Map`：左侧为 `Map`，右侧为 `Pair` 或另一个 `Map`。
当右侧操作数包含左侧 `Map` 中已存在的键时，结果 map 将包含来自右侧的条目。

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

`minus` 从左侧 `Map` 的条目中排除包含右侧操作数中指定键的条目，从而创建一个 `Map`。
因此，右侧操作数既可以是单个键，也可以是键集合：list、set 等。

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

关于在可变 map 上使用 [`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html) (`+=`) 和 [`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html) (`-=`) 运算符的详细信息，请参阅下文的 [Map 写入操作](#map-write-operations)。

## Map 写入操作 {id="map-write-operations"}

[可变](collections-overview.md#read-only-and-mutable-collections) map 提供了 map 专属的写入操作。
这些操作允许你通过按键访问值的方式来修改 map 内容。

定义 map 写入操作的特定规则如下：

* 值可以被更新。反之，键永远不会改变：一旦添加了一个条目，其键就是固定不变的。
* 每个键始终只关联一个值。你可以添加和移除整个条目。

以下是可变 map 上可用的写入操作标准库函数说明。

### 添加与更新条目 {id="add-and-update-entries"}

要向可变 map 添加新的键值对，请使用 [`put()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/put.html)。
将新条目放入 `LinkedHashMap`（默认的 map 实现）时，条目会被添加到末尾，以便在遍历 map 时最后出现。在已排序的 map 中，新元素的位置由其键的顺序决定。

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

要一次性添加多个条目，请使用 [`putAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/put-all.html)。
其实参可以是一个 `Map` 或一组 `Pair`：`Iterable`、`Sequence` 或 `Array`。

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

如果给定的键已存在于 map 中，`put()` 和 `putAll()` 都会覆盖原来的值。因此，你可以使用它们来更新 map 条目的值。

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

你还可以使用运算符简写形式向 map 添加新条目。有两种方式：

* [`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html) (`+=`) 运算符。
* 作为 `set()` 别名的 `[]` 运算符。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2)
    numbersMap["three"] = 3     // 调用 numbersMap.put("three", 3)
    numbersMap += mapOf("four" to 4, "five" to 5)
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

当使用 map 中已存在的键调用时，运算符会覆盖对应条目的值。

#### 为缺失的条目添加默认值 {id="add-default-values-for-missing-entries"}

若要在值不存在时返回现有值或添加默认值，请使用 [`.getOrPut()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-put.html) 扩展函数。
如果键缺失或其值为 `null`，`.getOrPut()` 会存储默认值并返回它。

对于具有可空值的 map，可以使用 `.getOrPutIfNull()` 和 `.getOrPutIfMissing()` 函数来控制如何处理 `null` 值：

* `getOrPutIfNull()` 的行为类似于 `getOrPut()`，并在键缺失或其值为 `null` 时使用默认值。
* `getOrPutIfMissing()` 仅在键缺失时使用默认值。

`getOrPutIfNull()` 和 `getOrPutIfMissing()` 函数属于[实验性功能](components-stability.md#stability-levels-explained)。
要选择加入，请使用 `@OptIn(ExperimentalStdlibApi::class)` 注解。

示例如下：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
//sampleStart
    val mapForNull = mutableMapOf<String, Int?>("one" to null)
    val mapForMissing = mutableMapOf<String, Int?>("one" to null)

    // 如果 "one" 的值为 null 则替换该值
    mapForNull.getOrPutIfNull("one") { 1 }

    println(mapForNull)
    // {one=1}

    // 保留 null 值，因为 "one" 已存在于 map 中
    mapForMissing.getOrPutIfMissing("one") { 1 }

    println(mapForMissing)
    // {one=null}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4"}

### 移除条目 {id="remove-entries"}

要从可变 map 中移除条目，请使用 [`remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/remove.html) 函数。
调用 `remove()` 时，既可以传入键，也可以传入整个键值对。
如果同时指定了键和值，则仅当其值与第二个实参匹配时，该键对应的元素才会被移除。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2, "three" to 3)
    numbersMap.remove("one")
    println(numbersMap)
    numbersMap.remove("three", 4)            // 不会移除任何内容
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

你还可以通过键或值从可变 map 中移除条目。
为此，可以在 map 的键集合或值集合上调用 `remove()`，并提供条目的键或值。
对值调用时，`remove()` 仅移除具有给定值的第一个条目。

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

[`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html) (`-=`) 运算符同样适用于可变 map。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2, "three" to 3)
    numbersMap -= "two"
    println(numbersMap)
    numbersMap -= "five"             // 不会移除任何内容
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}