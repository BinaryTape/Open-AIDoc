[//]: # (title: 数组)
[//]: # (description: 了解如何在 Kotlin 中创建、访问、修改、比较以及转换数组。)

数组是一种数据结构，包含固定数量的相同类型或其子类型的值。数组元素是有序的，可以通过索引访问。

Kotlin 提供了 [`Array<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/) 类以及[原生类型数组](#原生类型数组)。

## 何时使用数组

在与 Java API 互操作或有底层需求时使用数组。例如，如果你对性能的要求超出了常规应用的需求，或者需要构建自定义数据结构。

对于大多数用例，请改用[集合](collections-overview.md)。

| 功能                                       | 数组                                                                                                                                                 | 集合                                              |
|------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------|
| 大小                                       | 固定                                                                                                                                                 | 取决于类型                                         |           
| 只读变体                                   | 无，始终是可变的                                                                                                                                     | 是 (`List` 和 `Set`)                             |
| 添加和移除元素                             | 无原生支持。<br/> 分配并复制到新数组                                                                                                                | 是（可变集合）                                    |
| 使用 `==` 检查结构相等                     | 否，比较的是引用。<br/> 请改用 [`.contentEquals()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/content-equals.html)          | 是                                                |
| 原生类型值                                 | 原生类型数组存储值且<br/> 无需装箱                                                                                                                   | 通常会被装箱                                      |
| Java 互操作性                             | 映射为 `T[]`                                                                                                                                        | 映射为 `java.util.List` 和<br/> `java.util.Set` |
| 函数式风格的过滤与<br/> 转换                | 有限                                                                                                                                                 | 广泛                                              |

了解如何[将数组转换为集合](#将数组转换为集合)。

## 创建数组

要创建数组，你可以使用：

* [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html)、[`arrayOfNulls()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of-nulls.html#kotlin$arrayOfNulls(kotlin.Int)) 或 [`emptyArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/empty-array.html) 函数。
* `Array` 构造函数。

> 使用 `val` 声明数组只能防止重新为变量赋值，但不会使内容变为只读。
> 无论是在 `val` 还是 `var` 数组中，元素都是可变的。这种区别仅影响引用，不影响内容。
> 若需只读视图，请改用[集合](collections-overview.md)。
> 
{style="note"}

### 带有值的数组

要从一组已知值创建类型化数组，请使用 [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html) 函数。Kotlin 会自动推断类型：

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3) // Array<Int>
    println(simpleArray.joinToString())
    // 1, 2, 3
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-simple-array-kotlin"}

### 空数组

要创建一个不含元素的数组，请使用 [`emptyArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/empty-array.html) 函数。你可以在赋值语句的左侧或右侧指定元素的类型：

```kotlin
val emptyArrayRight = emptyArray<String>()
val emptyArrayLeft: Array<String> = emptyArray()
```

了解[如何向数组添加元素](#添加和移除元素)。

### 带有 null 的数组

要创建一个填充了 `null` 元素且给定大小的数组，请使用 [`arrayOfNulls()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of-nulls.html#kotlin$arrayOfNulls(kotlin.Int)) 函数：

```kotlin
fun main() {
//sampleStart
    val nullArray: Array<Int?> = arrayOfNulls(3)
    println(nullArray.joinToString())
    // null, null, null
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-null-array-kotlin"}

### Array 构造函数

`Array` 构造函数接收数组大小以及一个返回数组元素值的函数：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-array-constructor-kotlin"}

### 嵌套数组

要创建嵌套数组或多维数组，请使用数组的数组。嵌套数组不需要具有相同的类型或相同的大小。

```kotlin
fun main() {
//sampleStart
    // 创建一个二维数组
    val twoDArray = Array(2) { Array<Int>(2) { 0 } }
    println(twoDArray.contentDeepToString())
    // [[0, 0], [0, 0]]

    // 创建一个三维数组
    val threeDArray = Array(3) { Array(3) { Array<Int>(3) { 0 } } }
    println(threeDArray.contentDeepToString())
    // [[[0, 0, 0], [0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]]]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-multidimensional-array-kotlin"}

### 原生类型数组

如果在 `Array` 类中使用原生类型值，编译器会将这些值装箱为对象。为了避免装箱开销，你可以使用专门的原生类型数组。它们不是 [`Array<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/) 类的子类，但提供了类似的函数和属性集。

| Kotlin 类型                                                                             | Java 等效项 |
|-----------------------------------------------------------------------------------------|-----------------|
| [`BooleanArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-boolean-array/)   | `boolean[]`     |
| [`ByteArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-byte-array/)         | `byte[]`        |
| [`CharArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-char-array/)         | `char[]`        |
| [`DoubleArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-double-array/)     | `double[]`      |
| [`FloatArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-float-array/)       | `float[]`       |
| [`IntArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int-array/)           | `int[]`         |
| [`LongArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-long-array/)         | `long[]`        |
| [`ShortArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-short-array/)       | `short[]`       |

> Kotlin 没有专门的 `StringArray` 类型。`String` 不是原生类型，因此请改用带有推断类型的 [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html) 或 `arrayOf<String>()` 函数。
> 
{style="note"}

要创建原生类型数组，请使用以下选项之一：

* 构造函数：

  ```kotlin
  fun main() {
  //sampleStart
      // 创建一个大小为 5 且值初始化为零的 Int 数组
      val primitiveTypeArray = IntArray(5)
      println(primitiveTypeArray.joinToString())
      // 0, 0, 0, 0, 0
  
      // 创建一个 Int 数组并接收一个初始值设定项函数
      val squares = IntArray(5) { i -> i * i }
      println(squares.joinToString())
      // 0, 1, 4, 9, 16
  //sampleEnd
  }
  ```
  {kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-primitive-type-array-kotlin"}

* 工厂函数：

  ```kotlin
  fun main() {
  //sampleStart
      // 创建一个包含 5 个元素的 Int 数组
      val numbers = intArrayOf(1, 2, 3, 4, 5)
      println(numbers.joinToString())
      // 1, 2, 3, 4, 5

      // 创建一个包含 3 个元素的 Char 数组
      val characters = charArrayOf('K', 't', 'l')
      println(characters.joinToString())
      // K, t, l

      // 创建一个包含 3 个元素的 Double 数组
      val doubles = doubleArrayOf(0.22, 4.16, 0.5)
      println(doubles.joinToString()) 
      // 0.22, 4.16, 0.5
  //sampleEnd
  }
  ```
  {kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

> 要将原生类型数组转换为对象类型数组，请使用 [`.toTypedArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-typed-array.html) 函数。
>
> 要将对象类型数组转换为原生类型数组，请使用 [`.toBooleanArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-boolean-array.html)、[`.toByteArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-byte-array.html)、[`.toCharArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-char-array.html) 等。
>
{style="note"}

## 处理数组

数组支持许多与集合相同的操作，包括迭代、搜索、排序和转换。在 Kotlin 中，你可以通过使用数组向函数传递可变数量的参数，或对数组本身执行操作来处理数组。下表列出了最常用的属性和函数：

| 成员                                                                                                                                                                                                 | 返回                               |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------|
| [`size`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-array/size.html)                                                                                                                        | 元素数量                              |
| [`indices`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/indices.html)                                                                                                             | 有效索引范围                          |
| [`lastIndex`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/last-index.html)                                                                                                        | 最后一个有效索引                      |
| [`first()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first.html) 和 [`last()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/last.html)                    | 第一个和最后一个元素                  |
| [`isEmpty()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/is-empty.html) 和 [`isNotEmpty()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/is-not-empty.html) | 如果数组为空或不为空，则返回 `true` |
| [`contains()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/contains.html)                                                                                                         | 如果数组包含该元素，则返回 `true`     |

> 在 [API 参考](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-array/)中了解更多关于数组属性和函数的信息。
> 
{style="tip"}

本节介绍一些最常用的操作。

### 访问和修改元素

要访问和修改数组中的元素，请使用[索引访问运算符](operator-overloading.md#indexed-access-operator) (`[]`)：

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)
    val twoDArray = Array(2) { Array<Int>(2) { 0 } }

    // 访问元素并修改它
    simpleArray[0] = 10
    twoDArray[0][0] = 2

    // 打印修改后的元素
    println(simpleArray[0]) 
    // 10
    println(twoDArray[0][0]) 
    // 2
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-access-array-kotlin"}

> 如果你尝试访问超出数组边界的索引，Kotlin 会在运行时抛出 `ArrayIndexOutOfBoundsException`。
>
{style="note"} 

你还可以使用 [`fill(element, fromIndex, toIndex)`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/fill.html) 函数就地替换某个范围内的元素。`fromIndex` 是包含的，而 `toIndex` 是排除的：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

在 Kotlin 中，数组是*不变的 (invariant)*。这意味着 `Array<String>` 不是 `Array<Any>` 的子类型。这可以防止可能的运行时类型故障。要表达协变，请使用 `Array<out Any>` [类型投影](generics.md#type-projections)：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 添加和移除元素

由于数组具有固定大小，因此不支持 `.add()` 和 `.remove()` 函数。要执行这些操作，你需要创建一个新数组。为此，你可以使用以下选项之一：

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
  {kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

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
  {kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

> 如果你需要频繁添加或移除元素，请改用[可变集合](collections-overview.md#collection-types)。
>
{style="tip"}

### 比较数组

要比较两个数组是否以相同的顺序包含相同的元素，请使用 [`.contentEquals()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/content-equals.html) 和 [`.contentDeepEquals()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/content-deep-equals.html) 函数：

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)
    val anotherArray = arrayOf(1, 2, 3)

    // 比较数组内容
    println(simpleArray.contentEquals(anotherArray))
    // true

    // 使用中缀表示法，在元素更改后比较数组内容
    simpleArray[0] = 10
    println(simpleArray contentEquals anotherArray)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-compare-array-kotlin"}

> 不要使用相等 (`==`) 和不等 (`!=`) [运算符](equality.md#structural-equality)来比较数组的内容。这些运算符检查的是分配的变量是否指向同一个对象。
>
> 详细了解为什么 Kotlin 中的数组表现如此，请参阅我们的[博客文章](https://blog.jetbrains.com/kotlin/2015/09/feedback-request-limitations-on-data-classes/#Appendix.Comparingarrays)。
>
{style="warning"}

### 转换数组

Kotlin 拥有许多用于转换数组的有用函数。本节重点介绍其中几个。请在我们的 [API 参考](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/)中查看完整列表。

#### 求和

要返回数组中所有元素的总和，请使用 [`.sum()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sum.html) 函数：

```kotlin
fun main() {
//sampleStart
    val sumArray = arrayOf(1, 2, 3)
    println(sumArray.sum())
    // 6
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-sum-array-kotlin"}

> `.sum()` 函数只能用于[数字数据类型](numbers.md)（如 `Int`）的数组。
>
{style="note"}

#### 排序与乱序

你可以使用 [`.sort()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/sort.html) 函数根据自然顺序对数组中的元素进行排序，或者使用 [`.shuffle()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/shuffle.html) 函数随机打乱它们：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-shuffle-array-kotlin"}

若要获取新的排序数组而不修改原数组，请改用 [`.sortedArray()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/sorted-array.html) 函数。

### 向函数传递可变数量的参数

在 Kotlin 中，你可以通过 [`vararg`](functions.md#variable-number-of-arguments-varargs) 形参向函数传递可变实参数量。这在你预先不知道参数数量时非常有用，例如在格式化消息或创建 SQL 查询时。

要向函数传递包含可变实参数量的数组，请使用 *扩展 (spread)* 运算符 (`*`)。扩展运算符将数组的每个元素作为单独的实参传递给所选函数：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-vararg-array-kotlin"}

有关更多信息，请参阅[可变实参数量 (varargs)](functions.md#variable-number-of-arguments-varargs)。

## 将数组转换为集合

如果你使用的不同 API 中有的使用数组，有的使用集合，那么你可以将数组转换为集合，反之亦然。为此，请使用 [`.toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-list.html)、[`.toSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-set.html) 和 [`.toMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-map.html) 函数。这些函数会将数组中的内容复制到独立的副本中。它们不会反映随后对数组所做的更改。

### 转换为 List 或 Set

要将数组转换为 `List` 或 `Set`，请使用 [`.toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-list.html) 和 [`.toSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-set.html) 函数：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-convert-list-set-kotlin"}

除非你完全确定原始数组不会在其他地方被修改或共享，否则请勿使用 [`.asList()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/as-list.html) 及相关的 `as*` 函数。这些函数是对原始数组的包装而非复制。因此，对数组的更改会反映在列表中，反之亦然。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 转换为 Map

要将数组转换为 `Map`，请使用 [`.toMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-map.html) 函数。

只有 [`Pair<K,V>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-pair/) 数组可以转换为 `Map`。`Pair` 实例的第一个值将成为键，第二个值将成为值。如果相同的键出现多次，则使用最新的值。

本示例使用[中缀表示法](functions.md#infix-notation)调用 [`.to`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/to.html) 函数来创建 `Pair` 元组：

```kotlin
fun main() {
//sampleStart
    val pairArray = arrayOf("apple" to 120, "banana" to 150, "cherry" to 90, "apple" to 140)

    // 转换为 Map
    // 水果是键，卡路里数是值
    // 最新的 "apple" 值会覆盖第一个值
    println(pairArray.toMap())
    // {apple=140, banana=150, cherry=90}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-convert-map-kotlin"}

## 下一步？

* 在[集合概览](collections-overview.md)中详细了解为什么我们建议在大多数用例中使用集合。
* 了解其他[基本类型](types-overview.md)。
* 如果你是 Java 开发者，请参阅我们的 [Java 到 Kotlin 集合迁移指南](java-to-kotlin-collections-guide.md)。