[//]: # (title: 集合)

<no-index/>

在编程时，能够将数据分组到特定结构中以便后续处理是非常实用的。Kotlin 提供的集合正是用于此目的。

Kotlin 拥有以下用于对项进行分组的集合：

| **集合类型** | **说明** |
|---------------------|-------------------------------------------------------------------------|
| 列表 (List) | 有序项集合 |
| 集 (Set) | 唯一项的无序集合 |
| 映射 (Map) | 键值对的集合，其中键是唯一的，且仅映射到一个值 |

每种集合类型都可以是可变的或只读的。

## 列表 (List) {id="list"}

列表按添加顺序存储各项，并允许存在重复项。

要创建只读列表（[`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/)），请使用 [`listOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/list-of.html) 函数。

要创建可变列表（[`MutableList`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list.html)），请使用 [`mutableListOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-list-of.html) 函数。

在创建列表时，Kotlin 可以推断所存储项的类型。要显式声明类型，请在列表声明后的尖括号 `<>` 中添加类型：

```kotlin
fun main() { 
//sampleStart
    // 只读列表
    val readOnlyShapes = listOf("triangle", "square", "circle")
    println(readOnlyShapes)
    // [triangle, square, circle]
    
    // 带有显式类型声明的可变列表
    val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")
    println(shapes)
    // [triangle, square, circle]
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-lists-declaration"}

> 为了防止不必要的修改，你可以通过将可变列表赋值给 `List` 来创建它的只读视图：
> 
> ```kotlin
>     val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")
>     val shapesLocked: List<String> = shapes
> ```
> 这也被称为**转换 (casting)**。
> 
{style="tip"}

列表是有序的，因此要访问列表中的项，请使用[索引访问运算符](operator-overloading.md#indexed-access-operator) `[]`：

```kotlin
fun main() { 
//sampleStart
    val readOnlyShapes = listOf("triangle", "square", "circle")
    println("The first item in the list is: ${readOnlyShapes[0]}")
    // The first item in the list is: triangle
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-list-access"}

要获取列表中的第一项或最后一项，请分别使用 [`.first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) 和 [`.last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html) 函数：

```kotlin
fun main() { 
//sampleStart
    val readOnlyShapes = listOf("triangle", "square", "circle")
    println("The first item in the list is: ${readOnlyShapes.first()}")
    // The first item in the list is: triangle
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-list-first"}

> [`.first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) 与 [`.last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html) 函数是**扩展函数**的示例。要在对象上调用扩展函数，请在对象后追加句点 `.`，然后写上函数名称。
> 
> 扩展函数将在[进阶之旅](kotlin-tour-intermediate-extension-functions.md#extension-functions)中详细介绍。目前，你只需要了解如何调用它们即可。
> 
{style="note"}

要获取列表中的项数，请使用 [`.count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html) 函数：

```kotlin
fun main() { 
//sampleStart
    val readOnlyShapes = listOf("triangle", "square", "circle")
    println("This list has ${readOnlyShapes.count()} items")
    // This list has 3 items
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-list-count"}

要检查某项是否在列表中，请使用 [`in` 运算符](operator-overloading.md#in-operator)：

```kotlin
fun main() {
//sampleStart
    val readOnlyShapes = listOf("triangle", "square", "circle")
    println("circle" in readOnlyShapes)
    // true
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-list-in"}

要从可变列表中添加或移除项，请分别使用 [`.add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/add.html) 和 [`.remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 函数：

```kotlin
fun main() { 
//sampleStart
    val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")
    // 向列表中添加 "pentagon"
    shapes.add("pentagon") 
    println(shapes)  
    // [triangle, square, circle, pentagon]

    // 从列表中移除第一个 "pentagon"
    shapes.remove("pentagon") 
    println(shapes)  
    // [triangle, square, circle]
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-list-add-remove"}

## 集 (Set) {id="set"}

与有序且允许重复项的列表不同，集是**无序**的，并且仅存储**唯一**项。

要创建只读集（[`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/)），请使用 [`setOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/set-of.html) 函数。

要创建可变集（[`MutableSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/)), 请使用 [`mutableSetOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-set-of.html) 函数。

在创建集时，Kotlin 可以推断所存储项的类型。要显式声明类型，请在集声明后的尖括号 `<>` 中添加类型：

```kotlin
fun main() {
//sampleStart
    // 只读集
    val readOnlyFruit = setOf("apple", "banana", "cherry", "cherry")
    // 带有显式类型声明的可变集
    val fruit: MutableSet<String> = mutableSetOf("apple", "banana", "cherry", "cherry")
    
    println(readOnlyFruit)
    // [apple, banana, cherry]
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-sets-declaration"}

你可以从前面的示例中看到，因为集仅包含唯一元素，所以重复的 `"cherry"` 项会被丢弃。

> 为了防止不必要的修改，你可以通过将可变集赋值给 `Set` 来创建它的只读视图：
> 
> ```kotlin
>     val fruit: MutableSet<String> = mutableSetOf("apple", "banana", "cherry", "cherry")
>     val fruitLocked: Set<String> = fruit
> ```
>
{style="tip"}

> 由于集是**无序**的，因此你无法访问特定索引处的项。
> 
{style="note"}

要获取集中的项数，请使用 [`.count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html) 函数：

```kotlin
fun main() { 
//sampleStart
    val readOnlyFruit = setOf("apple", "banana", "cherry", "cherry")
    println("This set has ${readOnlyFruit.count()} items")
    // This set has 3 items
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-set-count"}

要检查某项是否在集中，请使用 [`in` 运算符](operator-overloading.md#in-operator)：

```kotlin
fun main() {
//sampleStart
    val readOnlyFruit = setOf("apple", "banana", "cherry", "cherry")
    println("banana" in readOnlyFruit)
    // true
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-set-in"}

要从可变集中添加或移除项，请分别使用 [`.add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/add.html) 和 [`.remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 函数：

```kotlin
fun main() { 
//sampleStart
    val fruit: MutableSet<String> = mutableSetOf("apple", "banana", "cherry", "cherry")
    fruit.add("dragonfruit")    // 向集中添加 "dragonfruit"
    println(fruit)              // [apple, banana, cherry, dragonfruit]
    
    fruit.remove("dragonfruit") // 从集中移除 "dragonfruit"
    println(fruit)              // [apple, banana, cherry]
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-set-add-remove"}

## 映射 (Map) {id="map"}

映射将项存储为键值对。你可以通过引用键来访问对应的值。你可以将映射想象成一份菜单。通过查找想要吃的食物（键），即可找到价格（值）。如果你想在不使用数字索引的情况下查找值（如同在列表中那样），映射会非常有用。

> * 映射中的每个键都必须是唯一的，以便 Kotlin 能够确定你想要获取哪一个值。
> * 映射中可以存在重复的值。
>
{style="note"}

要创建只读映射（[`Map`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/)），请使用 [`mapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-of.html) 函数。

要创建可变映射（[`MutableMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/)），请使用 [`mutableMapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-map-of.html) 函数。

在创建映射时，Kotlin 可以推断所存储项的类型。要显式声明类型，请在映射声明后的尖括号 `<>` 中添加键和值的类型。例如：`MutableMap<String, Int>`。其中键的类型为 `String`，值的类型为 `Int`。

创建映射最简单的方法是在每个键与其相关值之间使用 [`to`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/to.html)：

```kotlin
fun main() {
//sampleStart
    // 只读映射
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println(readOnlyJuiceMenu)
    // {apple=100, kiwi=190, orange=100}

    // 带有显式类型声明的可变映射
    val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println(juiceMenu)
    // {apple=100, kiwi=190, orange=100}
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-maps-declaration"}

> 为了防止不必要的修改，你可以通过将可变映射赋值给 `Map` 来创建它的只读视图：
> 
> ```kotlin
>     val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
>     val juiceMenuLocked: Map<String, Int> = juiceMenu
> ```
>
{style="tip"}

要访问映射中的值，请使用[索引访问运算符](operator-overloading.md#indexed-access-operator) `[]` 并传入其键：

```kotlin
fun main() {
//sampleStart
    // 只读映射
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println("The value of apple juice is: ${readOnlyJuiceMenu["apple"]}")
    // The value of apple juice is: 100
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-map-access"}

> 如果你尝试使用映射中不存在的键来访问键值对，将会得到一个 `null` 值：
>
> ```kotlin
> fun main() {
> //sampleStart
>     // 只读映射
>     val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
>     println("The value of pineapple juice is: ${readOnlyJuiceMenu["pineapple"]}")
>     // The value of pineapple juice is: null
> //sampleEnd
> }
> ```
> {kotlin-runnable="true" id="kotlin-tour-map-no-key" validate="false"}
> 
> 本教程稍后将在[空安全](kotlin-tour-null-safety.md)一章中详细解释 null 值。
> 
{style="note"}

你还可以使用[索引访问运算符](operator-overloading.md#indexed-access-operator) `[]` 向可变映射中添加项：

```kotlin
fun main() {
//sampleStart
    val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    juiceMenu["coconut"] = 150 // 向映射中添加键 "coconut"，其值为 150
    println(juiceMenu)
    // {apple=100, kiwi=190, orange=100, coconut=150}
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-map-add-item"}

要从可变映射中移除项，请使用 [`.remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 函数：

```kotlin
fun main() {
//sampleStart
    val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    juiceMenu.remove("orange")    // 从映射中移除键 "orange"
    println(juiceMenu)
    // {apple=100, kiwi=190}
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-map-put-remove"}

要获取映射中的项数，请使用 [`.count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html) 函数：

```kotlin
fun main() {
//sampleStart
    // 只读映射
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println("This map has ${readOnlyJuiceMenu.count()} key-value pairs")
    // This map has 3 key-value pairs
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-map-count"}

要检查映射中是否已包含某个特定键，请使用 [`.containsKey()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/contains-key.html) 函数：

```kotlin
fun main() {
//sampleStart
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println(readOnlyJuiceMenu.containsKey("kiwi"))
    // true
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-map-contains-keys"}

要获取映射的键或值的集合，请分别使用 [`keys`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/keys.html) 和 [`values`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/values.html) 属性：

```kotlin
fun main() {
//sampleStart
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println(readOnlyJuiceMenu.keys)
    // [apple, kiwi, orange]
    println(readOnlyJuiceMenu.values)
    // [100, 190, 100]
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-map-keys-values"}

> [`keys`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/keys.html) 和 [`values`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/values.html) 是对象的**属性**示例。要访问对象的属性，请在对象后追加句点 `.`，然后写上属性名称。
>
> 属性将在[类](kotlin-tour-classes.md)一章中更详细地讨论。在本教程现阶段，你只需了解如何访问它们即可。
>
{style="note"}

要检查键或值是否存在于映射中，请使用 [`in` 运算符](operator-overloading.md#in-operator)：

```kotlin
fun main() {
//sampleStart
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println("orange" in readOnlyJuiceMenu.keys)
    // true
    
    // 或者，你也可以无需使用 keys 属性
    println("orange" in readOnlyJuiceMenu)
    // true
    
    println(200 in readOnlyJuiceMenu.values)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-map-in"}

有关集合可用操作的更多信息，请参阅[集合](collections-overview.md)。

既然你已经了解了基本类型以及如何管理集合，接下来是时候探索可以在程序中使用的[控制流](kotlin-tour-control-flow.md)了。

## 练习 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="计算两个列表中的总项数" id="collections-exercise-1">

你有一个“绿色”数字列表和一个“红色”数字列表。完成代码以打印总共有多少个数字。

```kotlin
// Keep these two lists as they are. Use them in main().
val greenNumbers = listOf(1, 4, 23)
val redNumbers = listOf(17, 2)

fun main() {
    // Write your code here
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/CollectionsExercise1Test.kt" validate="false" id="kotlin-tour-collections-exercise-1"}

```kotlin
val greenNumbers = listOf(1, 4, 23)
val redNumbers = listOf(17, 2)

fun main() {
    val totalCount = greenNumbers.count() + redNumbers.count()
    println(totalCount)
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/CollectionsExercise1Test.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution" id="kotlin-tour-collections-solution-1"}

</def>
<def title="检查是否支持所请求的协议" id="collections-exercise-2">

你的服务器拥有一组支持的协议。用户请求使用特定协议。完成程序以检查是否支持所请求的协议（`isSupported` 必须是一个布尔值）。

```kotlin
fun main() {
    val SUPPORTED = setOf("HTTP", "HTTPS", "FTP")
    val requested = "smtp"
    val isSupported = TODO() // Replace the TODO() function
    println("Support for $requested: $isSupported")
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/CollectionsExercise2Test.kt" validate="false" id="kotlin-tour-collections-exercise-2"}

<deflist collapsible="true" id="kotlin-tour-collections-exercise-2-hint">
    <def title="提示">
        确保以大写形式检查所请求的协议。你可以使用 <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase.html"><code>.uppercase()</code></a> 函数来提供帮助。
    </def>
</deflist>

```kotlin
fun main() {
    val SUPPORTED = setOf("HTTP", "HTTPS", "FTP")
    val requested = "smtp"
    val isSupported = requested.uppercase() in SUPPORTED
    println("Support for $requested: $isSupported")
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/CollectionsExercise2Test.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution" id="kotlin-tour-collections-solution-2"}

</def>
<def title="使用映射拼写数字" id="collections-exercise-3">

定义一个将 1 到 3 的整数关联到对应英文拼写的映射。使用此映射来拼写给定的数字。

```kotlin
// Replace the empty map. Keep the variable name as number2word.
val number2word: Map<Int, String> = emptyMap()

fun main() {
    val n = 2
    println("$n is spelled as '${number2word[n]}'")
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/CollectionsExercise3Test.kt" validate="false" id="kotlin-tour-collections-exercise-3"}

```kotlin
val number2word = mapOf(1 to "one", 2 to "two", 3 to "three")

fun main() {
    val n = 2
    println("$n is spelled as '${number2word[n]}'")
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/CollectionsExercise3Test.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution" id="kotlin-tour-collections-solution-3"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-basic-types.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-control-flow.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>