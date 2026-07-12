[//]: # (title: 集合)

<no-index/>

在编程时，能够将数据分组到结构中以便后续处理是非常有用的。Kotlin 提供的集合正是为了这一目的。

Kotlin 拥有以下用于对项进行分组的集合类型：

| **集合类型** | **描述**                                                         |
|---------------------|-------------------------------------------------------------------------|
| List               | 有序的项集合                                            |
| Set                | 唯一的无序项集合                                   |
| Map                | 键值对的集合，其中键是唯一的，且仅映射到一个值 |

每种集合类型都可以是可变的或只读的。

## List

List 按添加顺序存储项，并允许重复项。

要创建只读 List ([`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/))，请使用 
[`listOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/list-of.html) 函数。

要创建可变 List ([`MutableList`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list.html))，
请使用 [`mutableListOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-list-of.html) 函数。

创建 List 时，Kotlin 可以推断存储的项类型。要显式声明类型，请在 List 声明后的尖括号 `<>` 内添加类型：

```kotlin
fun main() { 
//sampleStart
    // 只读 List
    val readOnlyShapes = listOf("triangle", "square", "circle")
    println(readOnlyShapes)
    // [triangle, square, circle]
    
    // 带有显式类型声明的可变 List
    val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")
    println(shapes)
    // [triangle, square, circle]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lists-declaration"}

> 为了防止不必要的修改，你可以通过将可变 List 赋值给一个 `List` 来创建该 List 的只读视图：
> 
> ```kotlin
>     val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")
>     val shapesLocked: List<String> = shapes
> ```
> 这也称为**转换**。
> 
{style="tip"}

List 是有序的，因此要访问 List 中的项，请使用[索引访问运算符](operator-overloading.md#indexed-access-operator) `[]`：

```kotlin
fun main() { 
//sampleStart
    val readOnlyShapes = listOf("triangle", "square", "circle")
    println("The first item in the list is: ${readOnlyShapes[0]}")
    // The first item in the list is: triangle
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-list-access"}

要获取 List 中的第一个或最后一个项，请分别使用 [`.first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html)
和 [`.last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html) 函数：

```kotlin
fun main() { 
//sampleStart
    val readOnlyShapes = listOf("triangle", "square", "circle")
    println("The first item in the list is: ${readOnlyShapes.first()}")
    // The first item in the list is: triangle
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-list-first"}

> [`.first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) 和 [`.last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html)
> 函数是**扩展**函数的示例。要在对象上调用扩展函数，请在对象后紧跟一个点号 `.` 并写下函数名称。
> 
> 扩展函数将在[中级教程](kotlin-tour-intermediate-extension-functions.md#extension-functions)中详细介绍。
> 目前，你只需要知道如何调用它们即可。 
> 
{style="note"}

要获取 List 中的项数，请使用 [`.count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html)
函数：

```kotlin
fun main() { 
//sampleStart
    val readOnlyShapes = listOf("triangle", "square", "circle")
    println("This list has ${readOnlyShapes.count()} items")
    // This list has 3 items
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-list-count"}

要检查某个项是否在 List 中，请使用 [`in` 运算符](operator-overloading.md#in-operator)：

```kotlin
fun main() {
//sampleStart
    val readOnlyShapes = listOf("triangle", "square", "circle")
    println("circle" in readOnlyShapes)
    // true
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-list-in"}

要从可变 List 中添加或移除项，请分别使用 [`.add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/add.html)
和 [`.remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 函数：

```kotlin
fun main() { 
//sampleStart
    val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")
    // 将 "pentagon" 添加到 List 中
    shapes.add("pentagon") 
    println(shapes)  
    // [triangle, square, circle, pentagon]

    // 从 List 中移除第一个 "pentagon"
    shapes.remove("pentagon") 
    println(shapes)  
    // [triangle, square, circle]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-list-add-remove"}

## Set

List 是有序且允许重复项的，而 Set 则是**无序**且仅存储**唯一**项的。

要创建只读 Set ([`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/))，请使用 
[`setOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/set-of.html) 函数。

要创建可变 Set ([`MutableSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/))，
请使用 [`mutableSetOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-set-of.html) 函数。

创建 Set 时，Kotlin 可以推断存储的项类型。要显式声明类型，请在 Set 声明后的尖括号 `<>` 内添加类型：

```kotlin
fun main() {
//sampleStart
    // 只读 Set
    val readOnlyFruit = setOf("apple", "banana", "cherry", "cherry")
    // 带有显式类型声明的可变 Set
    val fruit: MutableSet<String> = mutableSetOf("apple", "banana", "cherry", "cherry")
    
    println(readOnlyFruit)
    // [apple, banana, cherry]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-sets-declaration"}

你可以在前面的示例中看到，由于 Set 仅包含唯一元素，重复的 `"cherry"` 项被丢弃了。

> 为了防止不必要的修改，你可以通过将可变 Set 赋值给一个 `Set` 来创建该 Set 的只读视图：
> 
> ```kotlin
>     val fruit: MutableSet<String> = mutableSetOf("apple", "banana", "cherry", "cherry")
>     val fruitLocked: Set<String> = fruit
> ```
>
{style="tip"}

> 由于 Set 是**无序**的，你无法访问特定索引处的项。
> 
{style="note"}

要获取 Set 中的项数，请使用 [`.count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html)
函数：

```kotlin
fun main() { 
//sampleStart
    val readOnlyFruit = setOf("apple", "banana", "cherry", "cherry")
    println("This set has ${readOnlyFruit.count()} items")
    // This set has 3 items
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-set-count"}

要检查某个项是否在 Set 中，请使用 [`in` 运算符](operator-overloading.md#in-operator)：

```kotlin
fun main() {
//sampleStart
    val readOnlyFruit = setOf("apple", "banana", "cherry", "cherry")
    println("banana" in readOnlyFruit)
    // true
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-set-in"}

要从可变 Set 中添加或移除项，请分别使用 [`.add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/add.html)
和 [`.remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 函数：

```kotlin
fun main() { 
//sampleStart
    val fruit: MutableSet<String> = mutableSetOf("apple", "banana", "cherry", "cherry")
    fruit.add("dragonfruit")    // 将 "dragonfruit" 添加到 Set
    println(fruit)              // [apple, banana, cherry, dragonfruit]
    
    fruit.remove("dragonfruit") // 从 Set 中移除 "dragonfruit"
    println(fruit)              // [apple, banana, cherry]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-set-add-remove"}

## Map

Map 以键值对的形式存储项。你可以通过引用键来访问值。你可以将 Map 想象成一份食物菜单。
你可以通过找到你想吃的食物（键）来找到价格（值）。如果你想在不使用数字索引（如 List）的情况下查找值，Map 非常有用。

> * Map 中的每个键都必须是唯一的，以便 Kotlin 能够理解你想要获取哪个值。 
> * 你在 Map 中可以有重复的值。
>
{style="note"}

要创建只读 Map ([`Map`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/))，请使用 
[`mapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-of.html) 函数。

要创建可变 Map ([`MutableMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/))，
请使用 [`mutableMapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-map-of.html) 函数。

创建 Map 时，Kotlin 可以推断存储的项类型。要显式声明类型，请在 Map 声明后的尖括号 `<>` 内添加键和值的类型。例如：`MutableMap<String, Int>`。
键的类型为 `String`，值的类型为 `Int`。

创建 Map 最简单的方法是在每个键与其相关值之间使用 [`to`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/to.html)：

```kotlin
fun main() {
//sampleStart
    // 只读 Map
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println(readOnlyJuiceMenu)
    // {apple=100, kiwi=190, orange=100}

    // 带有显式类型声明的可变 Map
    val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println(juiceMenu)
    // {apple=100, kiwi=190, orange=100}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-maps-declaration"}

> 为了防止不必要的修改，你可以通过将可变 Map 赋值给一个 `Map` 来创建该 Map 的只读视图：
> 
> ```kotlin
>     val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
>     val juiceMenuLocked: Map<String, Int> = juiceMenu
> ```
>
{style="tip"}

要访问 Map 中的值，请使用[索引访问运算符](operator-overloading.md#indexed-access-operator) `[]` 及其键：

```kotlin
fun main() {
//sampleStart
    // 只读 Map
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println("The value of apple juice is: ${readOnlyJuiceMenu["apple"]}")
    // The value of apple juice is: 100
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-access"}

> 如果你尝试使用 Map 中不存在的键来访问键值对，你将看到一个 `null` 值：
>
> ```kotlin
> fun main() {
> //sampleStart
>     // 只读 Map
>     val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
>     println("The value of pineapple juice is: ${readOnlyJuiceMenu["pineapple"]}")
>     // The value of pineapple juice is: null
> //sampleEnd
> }
> ```
> {kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-no-key" validate="false"}
> 
> 本教程稍后将在 [null 安全](kotlin-tour-null-safety.md)章节中解释 null 值。
> 
{style="note"}

你还可以使用[索引访问运算符](operator-overloading.md#indexed-access-operator) `[]` 向可变 Map 添加项：

```kotlin
fun main() {
//sampleStart
    val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    juiceMenu["coconut"] = 150 // 向 Map 中添加键 "coconut" 及其值 150
    println(juiceMenu)
    // {apple=100, kiwi=190, orange=100, coconut=150}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-add-item"}

要从可变 Map 中移除项，请使用 [`.remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 
函数：

```kotlin
fun main() {
//sampleStart
    val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    juiceMenu.remove("orange")    // 从 Map 中移除键 "orange"
    println(juiceMenu)
    // {apple=100, kiwi=190}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-put-remove"}

要获取 Map 中的项数，请使用 [`.count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html)
函数：

```kotlin
fun main() {
//sampleStart
    // 只读 Map
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println("This map has ${readOnlyJuiceMenu.count()} key-value pairs")
    // This map has 3 key-value pairs
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-count"}

要检查某个特定键是否已包含在 Map 中，请使用 [`.containsKey()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/contains-key.html)
函数：

```kotlin
fun main() {
//sampleStart
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println(readOnlyJuiceMenu.containsKey("kiwi"))
    // true
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-contains-keys"}

要获取 Map 的键或值的集合，请分别使用 [`keys`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/keys.html)
和 [`values`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/values.html) 属性：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-keys-values"}

> [`keys`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/keys.html) 和 [`values`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/values.html)
> 是对象**属性**的示例。要访问对象的属性，请在对象后紧跟一个点号 `.` 并写下属性名称。
>
> 属性将在[类](kotlin-tour-classes.md)章节中进行更详细的讨论。
> 在本教程的此阶段，你只需要知道如何访问它们即可。
>
{style="note"}

要检查键或值是否在 Map 中，请使用 [`in` 运算符](operator-overloading.md#in-operator)：

```kotlin
fun main() {
//sampleStart
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println("orange" in readOnlyJuiceMenu.keys)
    // true
    
    // 或者，你不需要使用 keys 属性
    println("orange" in readOnlyJuiceMenu)
    // true
    
    println(200 in readOnlyJuiceMenu.values)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-in"}

有关集合用法的更多信息，请参阅[集合](collections-overview.md)。

现在你已经了解了基本类型以及如何管理集合，是时候探索可以在程序中使用的[控制流](kotlin-tour-control-flow.md)了。

## 练习 {completion-point="true"}

### 练习 1 {initial-collapse-state="collapsed" collapsible="true"}

你有一个“绿色”数字列表和一个“红色”数字列表。完成代码以打印总共有多少个数字。

|---|---|
```kotlin
fun main() {
    val greenNumbers = listOf(1, 4, 23)
    val redNumbers = listOf(17, 2)
    // 在此处编写你的代码
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-collections-exercise-1"}

|---|---|
```kotlin
fun main() {
    val greenNumbers = listOf(1, 4, 23)
    val redNumbers = listOf(17, 2)
    val totalCount = greenNumbers.count() + redNumbers.count()
    println(totalCount)
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法" id="kotlin-tour-collections-solution-1"}

### 练习 2 {initial-collapse-state="collapsed" collapsible="true"}

你有一组服务器支持的协议。用户请求使用特定协议。完成程序以检查请求的协议是否受支持（`isSupported` 必须是一个布尔值）。

|---|---|
```kotlin
fun main() {
    val SUPPORTED = setOf("HTTP", "HTTPS", "FTP")
    val requested = "smtp"
    val isSupported = // 在此处编写你的代码 
    println("Support for $requested: $isSupported")
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-collections-exercise-2"}

<deflist collapsible="true" id="kotlin-tour-collections-exercise-2-hint">
    <def title="提示">
        确保检查的是大写形式的请求协议。你可以使用 <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase.html"><code>.uppercase()</code></a> 函数来帮助你完成此操作。
    </def>
</deflist>

|---|---|
```kotlin
fun main() {
    val SUPPORTED = setOf("HTTP", "HTTPS", "FTP")
    val requested = "smtp"
    val isSupported = requested.uppercase() in SUPPORTED
    println("Support for $requested: $isSupported")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法" id="kotlin-tour-collections-solution-2"}

### 练习 3 {initial-collapse-state="collapsed" collapsible="true"}

定义一个 Map，将 1 到 3 的整数与其对应的拼写形式关联起来。使用此 Map 拼写给定的数字。

|---|---|
```kotlin
fun main() {
    val number2word = // 在此处编写你的代码
    val n = 2
    println("$n is spelled as '${<在此处编写你的代码 >}'")
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-collections-exercise-3"}

|---|---|
```kotlin
fun main() {
    val number2word = mapOf(1 to "one", 2 to "two", 3 to "three")
    val n = 2
    println("$n is spelt as '${number2word[n]}'")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法" id="kotlin-tour-collections-solution-3"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-basic-types.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-control-flow.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>