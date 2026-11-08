[//]: # (title: 数组)
[//]: # (description: 了解如何在 Kotlin 中创建、访问、修改、比较和转换数组。)

数组是一种用于保存固定数量相同类型或其子类型值的数据结构。
数组元素是有序的，并且可以通过索引进行访问。

Kotlin 提供了 [`Array<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/) 类和[基本类型数组](#primitive-type-arrays)。

## 何时使用数组 {id="when-to-use-arrays"}

在需要与 Java API 互操作或满足底层需求时使用数组。例如，当你的性能要求超出了常规应用程序所需，或者你需要构建自定义数据结构时。

对于大多数用例，建议优先使用[集合](collections-overview.md)。

| 功能                                                 | 数组                                                                                                                                                 | 集合                                              |
|-----------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------|
| 大小                                                | 固定                                                                                                                                                 | 取决于类型                                        |           
| 只读变体                                            | 无，始终可变                                                                                                                                         | 有（`List` 和 `Set`）                             |
| 添加和移除元素                                      | 无原生支持。<br/> 分配并复制到新数组                                                                                                                  | 支持（可变集合）                                  |
| 使用 `==` 进行结构相等比较                          | 不支持，仅比较引用。<br/> 应改用 [`.contentEquals()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/content-equals.html)         | 支持                                              |
| 基本类型值                                          | 基本类型数组存储值时<br/> 无需装箱                                                                                                                   | 通常会装箱                                        |
| Java 互操作性                                       | 映射为 `T[]`                                                                                                                                         | 映射为 `java.util.List` 和<br/> `java.util.Set`   |
| 函数式风格的过滤与<br/> 转换                         | 有限                                                                                                                                                 | 丰富                                              |

了解如何[将数组转换为集合](#convert-to-collections)。

## 创建数组 {id="create-arrays"}

要创建数组，可以使用：

* [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html)、[`arrayOfNulls()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of-nulls.html#kotlin$arrayOfNulls(kotlin.Int)) 或 [`emptyArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/empty-array.html) 函数。
* `Array` 构造函数。

> 使用 `val` 声明数组仅能防止重新对该变量赋值，但不会使数组内容变为只读。
> 无论是 `val` 还是 `var` 数组，其元素都是可变的。两者的区别仅影响引用，不影响其内容。
> 如需只读视图，请改用[集合](collections-overview.md)。
> 
{style="note"}

### 包含值的数组 {id="array-with-values"}

要基于一组已知的值创建类型化数组，请使用 [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html) 函数。
Kotlin 会自动推断类型：

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3) // Array<Int>
    println(simpleArray.joinToString())
    // 1, 2, 3
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-simple-array-kotlin"}

### 空数组 {id="empty-array"}

要创建不包含任何元素的数组，请使用 [`emptyArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/empty-array.html) 函数。
你可以在赋值语句的左侧或右侧指定元素类型：

```kotlin
val emptyArrayRight = emptyArray<String>()
val emptyArrayLeft: Array<String> = emptyArray()
```

了解[如何向数组添加元素](#add-and-remove-elements)。

### 包含 null 的数组 {id="array-with-nulls"}

要创建填充了 `null` 元素且具有指定大小的数组，
请使用 [`arrayOfNulls()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of-nulls.html#kotlin$arrayOfNulls(kotlin.Int)) 函数：

```kotlin
fun main() {
//sampleStart
    val nullArray: Array<Int?> = arrayOfNulls(3)
    println(nullArray.joinToString())
    // null, null, null
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-null-array-kotlin"}

### Array 构造函数 {id="array-constructor"}

`Array` 构造函数接收数组大小和一个返回数组元素值的函数：

```kotlin
fun main() {
//sampleStart
    val zeroes = Array<Int>(3) { 0 }
    println(zeroes.joinToString())
    // 0, 0, 0
    
    val squares = Array(5) { i -> i * i }
    println(squares.joinToString())
    // 0, 1, 4, 9, 16
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-array-constructor-kotlin"}

### 嵌套数组 {id="nested-arrays"}

要创建嵌套数组或多维数组，请使用元素为数组的数组。
嵌套数组的类型或大小不必相同。

```kotlin
fun main() {
//sampleStart
    // 创建二维数组
    val twoDArray = Array(2) { Array<Int>(2) { 0 } }
    println(twoDArray.contentDeepToString())
    // [[0, 0], [0, 0]]

    // 创建三维数组
    val threeDArray = Array(3) { Array(3) { Array<Int>(3) { 0 } } }
    println(threeDArray.contentDeepToString())
    // [[[0, 0, 0], [0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]]]
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-multidimensional-array-kotlin"}

### 基本类型数组 {id="primitive-type-arrays"}

如果将 `Array` 类与基本类型值一起使用，编译器会将这些值装箱为对象。
为避免装箱开销，可以使用专门的基本类型数组。
它们不是 [`Array<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/) 类的子类，但提供了一组类似的函数和属性。

| Kotlin 类型                                                                             | Java 对应类型   |
|-----------------------------------------------------------------------------------------|-----------------|
| [`BooleanArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-boolean-array/)   | `boolean[]`     |
| [`ByteArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-byte-array/)         | `byte[]`        |
| [`CharArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-char-array/)         | `char[]`        |
| [`DoubleArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-double-array/)     | `double[]`      |
| [`FloatArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-float-array/)       | `float[]`       |
| [`IntArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int-array/)           | `int[]`         |
| [`LongArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-long-array/)         | `long[]`        |
| [`ShortArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-short-array/)       | `short[]`       |

> Kotlin 没有专用的 `StringArray` 类型。由于 `String` 不是基本类型，
> 请使用带类型推断的 [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html) 或 `arrayOf<String>()` 函数。
> 
{style="note"}

要创建基本类型数组，请使用以下选项之一：

* 构造函数：

  ```kotlin
  fun main() {
  //sampleStart
      // 创建大小为 5 且值初始化为 0 的 Int 数组
      val primitiveTypeArray = IntArray(5)
      println(primitiveTypeArray.joinToString())
      // 0, 0, 0, 0, 0
  
      // 创建 Int 数组并接收一个初始化函数
      val squares = IntArray(5) { i -> i * i }
      println(squares.joinToString())
      // 0, 1, 4, 9, 16
  //sampleEnd
  }
  ```
  {kotlin-runnable="true" id="arrays-primitive-type-array-kotlin"}

* 工厂函数：

  ```kotlin
  fun main() {
  //sampleStart
      // 创建包含 5 个元素的 Int 数组
      val numbers = intArrayOf(1, 2, 3, 4, 5)
      println(numbers.joinToString())
      // 1, 2, 3, 4, 5

      // 创建包含 3 个元素的 Char 数组
      val characters = charArrayOf('K', 't', 'l')
      println(characters.joinToString())
      // K, t, l

      // 创建包含 3 个元素的 Double 数组
      val doubles = doubleArrayOf(0.22, 4.16, 0.5)
      println(doubles.joinToString()) 
      // 0.22, 4.16, 0.5
  //sampleEnd
  }
  ```
  {kotlin-runnable="true"}

> 要将基本类型数组转换为对象类型数组，请使用 [`.toTypedArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-typed-array.html)
> 函数。
>
> 要将对象类型数组转换为基本类型数组，请使用 [`.toBooleanArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-boolean-array.html)、
> [`.toByteArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-byte-array.html)、[`.toCharArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-char-array.html)
> 等函数。
>
{style="note"}

## 操作数组 {id="work-with-arrays"}

数组支持许多与集合相同的操作，包括迭代、搜索、排序和转换。
在 Kotlin 中，你可以使用数组向函数传递可变实参数量，也可以对数组本身执行操作。
下表列出了最常用的属性和函数：

| 成员                                                                                                                                                                                                   | 返回值                                |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------|
| [`size`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-array/size.html)                                                                                                                        | 元素数量                              |
| [`indices`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/indices.html)                                                                                                             | 有效索引的范围                        |
| [`lastIndex`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/last-index.html)                                                                                                        | 最后一个有效索引                      |
| [`first()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first.html) 和 [`last()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/last.html)                    | 第一个和最后一个元素                  |
| [`isEmpty()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/is-empty.html) 和 [`isNotEmpty()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/is-not-empty.html) | 如果数组为空或非空则返回 `true`       |
| [`contains()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/contains.html)                                                                                                         | 如果数组包含指定元素则返回 `true`     |

> 在 [API 参考文档](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-array/)中详细了解数组的属性和函数。
> 
{style="tip"}

本节介绍一些最常用的操作。

### 访问和修改元素 {id="access-and-modify-elements"}

要访问和修改数组中的元素，请使用[索引访问运算符](operator-overloading.md#indexed-access-operator)（`[]`）：

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)
    val twoDArray = Array(2) { Array<Int>(2) { 0 } }

    // 访问元素并修改它
    simpleArray[0] = 10
    twoDArray[0][0] = 2

    // 输出修改后的元素
    println(simpleArray[0]) 
    // 10
    println(twoDArray[0][0]) 
    // 2
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-access-array-kotlin"}

> 如果尝试访问超出数组边界的索引，Kotlin 将在运行时抛出 `ArrayIndexOutOfBoundsException`。
>
{style="note"} 

你还可以使用 [`fill(element, fromIndex, toIndex)`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/fill.html) 函数
就地替换指定范围内的元素。`fromIndex` 包含在范围内，而 `toIndex` 不包含：

```kotlin
fun main() {
//sampleStart
    val arr = IntArray(3)
    println(arr.joinToString())
    // 0, 0, 0
    
   arr.fill(1)
   println(arr.joinToString())
   // 1, 1, 1
  
   arr.fill(0, 0, 2)
   println(arr.joinToString())
   // 0, 0, 1
//sampleEnd
}
```
{kotlin-runnable="true"}

在 Kotlin 中，数组是*不变的（invariant）*。这意味着 `Array<String>` 不是 `Array<Any>` 的子类型。这可以防止潜在的运行时类型错误。要表示协变，请使用 `Array<out Any>` [类型投影](generics.md#type-projections)：

```kotlin
fun main() {
//sampleStart
    fun printArr(arr: Array<out Any>) {
        for (item in arr) print("$item, ")
    }

    printArr(arrayOf("k", "t", "n"))  
    // k, t, n, 
//sampleEnd
}
```
{kotlin-runnable="true"}

### 添加和移除元素 {id="add-and-remove-elements"}

由于数组大小是固定的，因此它们不支持 `.add()` 和 `.remove()` 函数。要执行这些操作，
需要创建一个新数组。为此，可以使用以下选项之一：

* 使用 [`.copyOf`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/copy-of.html) 函数：

  ```kotlin
  fun main() {
  //sampleStart
      var arr = intArrayOf(0, 1, 2)
      
      arr = arr.copyOf(arr.size + 1)
      println(arr.joinToString())
      // 0, 1, 2, 0

      arr[arr.lastIndex] = 3
      println(arr.joinToString())
      // 0, 1, 2, 3
  //sampleEnd
  }
  ```
  {kotlin-runnable="true"}

* 使用 `+` 或 `+=` 运算符：

  ```kotlin
  fun main() {
  //sampleStart
      var arr = intArrayOf(0, 1, 2)

      arr += 3
      println(arr.joinToString())
      // 0, 1, 2, 3

      arr = arr + intArrayOf(4, 5)
      println(arr.joinToString())
      // 0, 1, 2, 3, 4, 5
  //sampleEnd
  }
  ```
  {kotlin-runnable="true"}

> 如果需要频繁添加或移除元素，
> 请改用[可变集合](collections-overview.md#read-only-and-mutable-collections)。
>
{style="tip"}

### 比较数组 {id="compare-arrays"}

要比较两个数组是否包含相同顺序的相同元素，请使用 [`.contentEquals()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/content-equals.html)
和 [`.contentDeepEquals()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/content-deep-equals.html)
函数：

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)
    val anotherArray = arrayOf(1, 2, 3)

    // 比较数组内容
    println(simpleArray.contentEquals(anotherArray))
    // true

    // 使用中缀表示法，在修改某个元素后
    // 比较数组内容
    simpleArray[0] = 10
    println(simpleArray contentEquals anotherArray)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-compare-array-kotlin"}

> 请勿使用相等（`==`）和不等（`!=`）[运算符](equality.md#structural-equality)来比较数组的内容。
> 这些运算符检查被赋值的变量是否指向同一个对象。
>
> 要详细了解为什么 Kotlin 中的数组会有这种行为，请参阅我们的[博客文章](https://blog.jetbrains.com/kotlin/2015/09/feedback-request-limitations-on-data-classes/#Appendix.Comparingarrays)。
>
{style="warning"}

### 转换数组 {id="transform-arrays"}

Kotlin 提供了许多用于转换数组的实用函数。本节重点介绍其中一些。
请在我们的 [API 参考文档](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/)中查看完整列表。

#### 求和 {id="sum"}

要返回数组中所有元素的总和，请使用 [`.sum()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sum.html)
函数：

```kotlin
fun main() {
//sampleStart
    val sumArray = arrayOf(1, 2, 3)
    println(sumArray.sum())
    // 6
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-sum-array-kotlin"}

> `.sum()` 函数只能用于[数字数据类型](numbers.md)的数组，例如 `Int`。
>
{style="note"}

#### 排序与乱序 {id="sort-and-shuffle"}

你可以使用 [`.sort()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/sort.html) 函数按自然顺序对数组中的元素进行排序，也可以使用 [`.shuffle()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/shuffle.html)
函数对它们进行随机打乱：

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)

    // 随机打乱元素
    simpleArray.shuffle()
    println(simpleArray.joinToString())
  
    // 排序元素
    simpleArray.sort()
    println(simpleArray.joinToString())
    // 1, 2, 3
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-shuffle-array-kotlin"}

要在不修改原数组的情况下获取一个新的已排序数组，请改用
[`.sortedArray()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/sorted-array.html) 函数。

### 向函数传递可变实参数量 {id="pass-variable-number-of-arguments-to-a-function"}

在 Kotlin 中，可以通过 [`vararg`](functions.md#variable-number-of-arguments-varargs)
形参向函数传递可变实参数量。当预先不知道实参的数量时（例如在格式化消息或创建 SQL 查询时），这非常有用。

要向函数传递包含可变实参数量的数组，请使用*扩展运算符*（`*`）。扩展运算符会将数组的每个元素作为单独的实参传递给所调用的函数：

```kotlin
fun main() {
    val lettersArray = arrayOf("c", "d")
    printAllStrings("a", "b", *lettersArray)
    // abcd
}

fun printAllStrings(vararg strings: String) {
    for (string in strings) {
        print(string)
    }
}
```
{kotlin-runnable="true" id="arrays-vararg-array-kotlin"}

有关更多信息，请参阅[可变数量的实参 (varargs)](functions.md#variable-number-of-arguments-varargs)。

## 转换为集合 {id="convert-to-collections"}

如果你使用的不同 API 中有的使用数组、有的使用集合，则可以在数组和集合之间相互转换。为此，可以使用 [`.toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-list.html)、[`.toSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-set.html) 和 [`.toMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-map.html) 函数。
这些函数会将内容从数组复制到独立的副本中。它们不会反映对数组的后续更改。

### 转换为 List 或 Set {id="convert-to-list-or-set"}

要将数组转换为 `List` 或 `Set`，请使用 [`.toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-list.html)
和 [`.toSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-set.html) 函数：

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf("a", "b", "c", "c")

    // 转换为 Set
    println(simpleArray.toSet())
    // [a, b, c]

    // 转换为 List
    println(simpleArray.toList())
    // [a, b, c, c]
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-convert-list-set-kotlin"}

除非完全确定原始数组不会被更改或在其他地方共享，
否则请勿使用 [`.asList()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/as-list.html)
及相关的 `as*` 函数。这些函数包装了原始数组而不是复制它。因此，
对数组的更改会反映在列表中，反之亦然。

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf("a", "b", "c")

    val list = simpleArray.asList()
    simpleArray[0] = "d"
    println(list)
    // [d, b, c]
//sampleEnd
}
```
{kotlin-runnable="true"}

### 转换为 Map {id="convert-to-map"}

要将数组转换为 `Map`，请使用 [`.toMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-map.html)
函数。

只有 [`Pair<K,V>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-pair/) 数组才能转换为 `Map`。
`Pair` 实例的第一个值将作为键，第二个值作为值。
如果相同的键出现多次，将使用最后一个值。

本例使用[中缀表示法](functions.md#infix-notation)
调用 [`.to`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/to.html) 函数来创建 `Pair` 的元组：

```kotlin
fun main() {
//sampleStart
    val pairArray = arrayOf("apple" to 120, "banana" to 150, "cherry" to 90, "apple" to 140)

    // 转换为 Map
    // 水果为键，卡路里数值为值
    // 最新的 "apple" 值会覆盖前一个
    println(pairArray.toMap())
    // {apple=140, banana=150, cherry=90}
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-convert-map-kotlin"}

## 下一步 {id="what-s-next"}

* 在[集合概述](collections-overview.md)中详细了解为什么我们建议在大多数用例中使用集合。
* 了解其他[基本类型](types-overview.md)。
* 如果你是 Java 开发者，请阅读我们的 [Java 到 Kotlin 集合迁移指南](java-to-kotlin-collections-guide.md)。