[//]: # (title: Map 特定操作)

在 [Map](collections-overview.md#map) 中，键和值的类型都是用户定义的。
基于键访问 Map 条目的特性提供了多种 Map 特定的处理能力，涵盖从按键获取值到分别过滤键与值。
本页介绍了标准库中提供的 Map 处理函数。

## 获取键和值 {id="retrieve-keys-and-values"}

要从 Map 中获取值，必须提供其键作为 [`get()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/get.html) 函数的实参。
同时也支持 `[key]` 简写语法。如果未找到指定的键，则返回 `null`。
还有 [`getValue()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-value.html) 函数，其行为略有不同：如果键在 Map 中未找到，它会抛出异常。
此外，针对键不存在的情况，你还有更多处理选项：

* [`getOrElse()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-else.html) 与在列表中工作方式相同：对于不存在的键，其值由给定的 lambda 表达式返回。
* [`getOrDefault()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-default.html) 在未找到键时返回指定的默认值。

对于包含可空值的 Map，可改用以下函数，它们显式处理缺失的键和 `null` 值：

* `getOrElseIfNull()` 在键缺失或其值为 `null` 时返回指定的默认值的结果。
* `getOrElseIfMissing()` 在键缺失时返回指定的默认值的结果。

下面是一个展示这些函数之间区别的示例：

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

    // 因 Map 中缺少 "six" 而抛出异常
    // numbersMap.getValue("six")

//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4"}

要对 Map 的所有键或所有值执行操作，可以分别从 `keys` 和 `values` 属性中获取它们。
`keys` 是所有 Map 键的 Set，`values` 是所有 Map 值的集合。

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

你可以像对待其他集合一样，使用 [`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html) 函数对 Map 进行[过滤](collection-filtering.md)。
在 Map 上调用 `filter()` 时，向其传递一个以 `Pair` 作为实参的谓词。
这样你便可以在过滤谓词中同时使用键和值。

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

还有两种专门用于过滤 Map 的方式：按键过滤和按值过滤。
每种方式都对应一个函数：[`filterKeys()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-keys.html) 和 [`filterValues()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-values.html)。
两者都会返回一个由符合给定谓词的条目组成的新 Map。
`filterKeys()` 的谓词仅检查元素的键，而 `filterValues()` 的谓词仅检查元素的值。

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

## plus 与 minus 运算符 {id="plus-and-minus-operators"}

由于通过键访问元素，[`plus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus.html) (`+`) 和 [`minus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus.html) (`-`) 运算符在 Map 上的工作方式与其他集合不同。
`plus` 返回一个包含其两个操作数元素的 `Map`：左侧为一个 `Map`，右侧为一个 `Pair` 或另一个 `Map`。
当右操作数中包含的条目的键已存在于左侧 `Map` 中时，结果 Map 将包含右侧的条目。

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

`minus` 从左侧 `Map` 的条目中创建一个 `Map`，但排除键存在于右操作数中的条目。
因此，右操作数可以是一个单独的键，也可以是键的集合：如列表、Set 等。

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

有关在可变 Map 上使用 [`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html) (`+=`) 和 [`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html) (`-=`) 运算符的详细信息，请参阅下文的 [Map 写入操作](#map-write-operations)。

## Map 写入操作 {id="map-write-operations"}

[可变](collections-overview.md#collection-types) Map 提供了 Map 特有的写入操作。
这些操作允许你利用基于键访问值的能力来更改 Map 的内容。

定义 Map 写入操作的特定规则如下：

* 值可以更新。反之，键永远不可变：一旦添加了条目，其键即保持不变。
* 每个键始终关联单一值。你可以添加和移除整个条目。

以下是标准库中适用于可变 Map 的写入操作函数的说明。

### 添加与更新条目 {id="add-and-update-entries"}

要向可变 Map 中添加新的键值对，请使用 [`put()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/put.html)。
当新条目放入 `LinkedHashMap`（默认的 Map 实现）中时，添加后它将在迭代 Map 时排在最后。在已排序的 Map 中，新元素的位置由其键的顺序决定。

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

要一次添加多个条目，请使用 [`putAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/put-all.html)。
它的实参可以是一个 `Map` 或一组 `Pair`：`Iterable`、`Sequence` 或 `Array`。

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

如果给定的键已存在于 Map 中，`put()` 和 `putAll()` 都会覆盖其值。因此，你可以使用它们来更新 Map 条目的值。

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

你还可以使用简短的运算符形式向 Map 添加新条目。有两种方式：

* [`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html) (`+=`) 运算符。
* `set()` 的运算符别名 `[]`。

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

当使用 Map 中已存在的键进行调用时，运算符会覆盖对应条目的值。

#### 为缺失的条目添加默认值 {id="add-default-values-for-missing-entries"}

要返回现有值，或在没有可用值时添加默认值，请使用 [`.getOrPut()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-put.html) 扩展函数。
如果键缺失或值为 `null`，`.getOrPut()` 会存储默认值并将其返回。

对于包含可空值的 Map，你可以使用 `.getOrPutIfNull()` 和 `.getOrPutIfMissing()` 函数来控制如何处理 `null` 值：

* `getOrPutIfNull()` 的行为与 `getOrPut()` 类似，在键缺失或值为 `null` 时使用默认值。
* `getOrPutIfMissing()` 仅在键缺失时使用默认值。

`getOrPutIfNull()` 和 `getOrPutIfMissing()` 函数处于[实验性阶段](components-stability.md#stability-levels-explained)。
如需启用，请使用 `@OptIn(ExperimentalStdlibApi::class)` 注解。

下面是一个示例：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
//sampleStart
    val mapForNull = mutableMapOf<String, Int?>("one" to null)
    val mapForMissing = mutableMapOf<String, Int?>("one" to null)

    // 如果 "one" 的值为 null，则替换该值
    mapForNull.getOrPutIfNull("one") { 1 }

    println(mapForNull)
    // {one=1}

    // 保留 null 值，因为 "one" 已存在于 Map 中
    mapForMissing.getOrPutIfMissing("one") { 1 }

    println(mapForMissing)
    // {one=null}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4"}

### 移除条目 {id="remove-entries"}

要从可变 Map 中移除条目，请使用 [`remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/remove.html) 函数。
调用 `remove()` 时，你可以传递一个键或整个键值对。
如果同时指定了键和值，则仅当该键对应的值与第二个实参匹配时，才会移除带有该键的元素。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2, "three" to 3)
    numbersMap.remove("one")
    println(numbersMap)
    numbersMap.remove("three", 4)            // 不移除任何内容
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

你还可以按键或按值从可变 Map 中移除条目。
为此，在 Map 的键或值上调用 `remove()`，并提供条目的键或值。
当在值上调用时，`remove()` 仅移除具有给定值的第一个条目。

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

[`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html) (`-=`) 运算符也可用于可变 Map。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2, "three" to 3)
    numbersMap -= "two"
    println(numbersMap)
    numbersMap -= "five"             // 不移除任何内容
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}