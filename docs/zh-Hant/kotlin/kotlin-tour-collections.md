[//]: # (title: 集合)

<no-index/>

在進行程式設計時，能夠將資料分組到各種結構中以便後續處理是非常有用的。Kotlin 提供的集合（collection）正是用於此目的。

Kotlin 提供以下集合來為項目進行分組：

| **集合型別** | **描述**                                                                |
|---------------------|-------------------------------------------------------------------------|
| Lists               | 有序的項目集合                                            |
| Sets                | 唯一的無序項目集合                                   |
| Maps                | 鍵值組（key-value pair）的集合，其中鍵是唯一的，且每個鍵僅對應到一個值 |

每種集合型別都可以是可變的（mutable）或唯讀的（read-only）。

## List {id="list"}

List 會按照項目被新增的順序來儲存它們，並允許出現重複項目。 

若要建立唯讀清單（[`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/)），請使用 
[`listOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/list-of.html) 函式。

若要建立可變清單（[`MutableList`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list.html)），
請使用 [`mutableListOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-list-of.html) 函式。

建立清單時，Kotlin 可以推論儲存項目的型別。若要明確宣告型別，可以在清單宣告後的尖括號 `<>` 內加上型別：

```kotlin
fun main() { 
//sampleStart
    // Read only list
    val readOnlyShapes = listOf("triangle", "square", "circle")
    println(readOnlyShapes)
    // [triangle, square, circle]
    
    // Mutable list with explicit type declaration
    val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")
    println(shapes)
    // [triangle, square, circle]
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-lists-declaration"}

> 為了防止意外修改，你可以將可變清單指派給 `List`，以建立唯讀檢視：
> 
> ```kotlin
>     val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")
>     val shapesLocked: List<String> = shapes
> ```
> 這也稱為**型別轉換**（casting）。
> 
{style="tip"}

由於清單是有序的，若要存取清單中的項目，請使用[索引存取運算子](operator-overloading.md#indexed-access-operator) `[]`：

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

若要取得清單中的第一個或最後一個項目，請分別使用 [`.first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html)
與 [`.last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html) 函式：

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

> [`.first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) 與 [`.last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html)
> 函式都是**擴充函式**（extension function）的範例。若要在物件上呼叫擴充函式，請在物件名稱後方加上句號 `.`，接著寫上函式名稱。
> 
> 擴充函式在[中階教學](kotlin-tour-intermediate-extension-functions.md#extension-functions)中有詳細介紹。
> 目前你只需要知道如何呼叫它們即可。 
> 
{style="note"}

若要取得清單中的項目數量，請使用 [`.count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html)
函式：

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

若要檢查某個項目是否存在於清單中，請使用 [`in` 運算子](operator-overloading.md#in-operator)：

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

若要從可變清單中新增或移除項目，請分別使用 [`.add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/add.html)
與 [`.remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 函式：

```kotlin
fun main() { 
//sampleStart
    val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")
    // Add "pentagon" to the list
    shapes.add("pentagon") 
    println(shapes)  
    // [triangle, square, circle, pentagon]

    // Remove the first "pentagon" from the list
    shapes.remove("pentagon") 
    println(shapes)  
    // [triangle, square, circle]
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-list-add-remove"}

## Set {id="set"}

清單是有序且允許重複項目的，而 Set 則是**無序**且僅儲存**唯一**項目。

若要建立唯讀 Set（[`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/)），請使用 
[`setOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/set-of.html) 函式。

若要建立可變 Set（[`MutableSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/)),
請使用 [`mutableSetOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-set-of.html) 函式。

建立 Set 時，Kotlin 可以推論儲存項目的型別。若要明確宣告型別，可以在 Set 宣告後的尖括號 `<>` 內加上型別：

```kotlin
fun main() {
//sampleStart
    // Read-only set
    val readOnlyFruit = setOf("apple", "banana", "cherry", "cherry")
    // Mutable set with explicit type declaration
    val fruit: MutableSet<String> = mutableSetOf("apple", "banana", "cherry", "cherry")
    
    println(readOnlyFruit)
    // [apple, banana, cherry]
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-sets-declaration"}

你可以從前面的範例中看到，因為 Set 只包含唯一元素，所以重複的 `"cherry"` 項目會被捨棄。

> 為了防止意外修改，你可以將可變 Set 指派給 `Set`，以建立唯讀檢視：
> 
> ```kotlin
>     val fruit: MutableSet<String> = mutableSetOf("apple", "banana", "cherry", "cherry")
>     val fruitLocked: Set<String> = fruit
> ```
>
{style="tip"}

> 由於 Set 是**無序**的，因此你無法存取特定索引處的項目。
> 
{style="note"}

若要取得 Set 中的項目數量，請使用 [`.count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html)
函式：

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

若要檢查某個項目是否存在於 Set 中，請使用 [`in` 運算子](operator-overloading.md#in-operator)：

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

若要從可變 Set 中新增或移除項目，請分別使用 [`.add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/add.html)
與 [`.remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 函式：

```kotlin
fun main() { 
//sampleStart
    val fruit: MutableSet<String> = mutableSetOf("apple", "banana", "cherry", "cherry")
    fruit.add("dragonfruit")    // Add "dragonfruit" to the set
    println(fruit)              // [apple, banana, cherry, dragonfruit]
    
    fruit.remove("dragonfruit") // Remove "dragonfruit" from the set
    println(fruit)              // [apple, banana, cherry]
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-set-add-remove"}

## Map {id="map"}

Map 以鍵值組（key-value pair）的形式儲存項目。你可以透過參照鍵來存取對應的值。你可以把 Map 想像成一張菜單：
透過尋找你想吃的餐點（鍵），即可查到對應的價格（值）。如果你想要查詢某個值，又不想像在清單中那樣使用數字索引時，Map 會非常實用。

> * Map 中的每個鍵都必須是唯一的，這樣 Kotlin 才能識別你想取得哪一個值。
> * Map 中可以有重複的值。
>
{style="note"}

若要建立唯讀 Map（[`Map`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/)），請使用 
[`mapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-of.html) 函式。

若要建立可變 Map（[`MutableMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/)），
請使用 [`mutableMapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-map-of.html) 函式。

建立 Map 時，Kotlin 可以推論儲存項目的型別。若要明確宣告型別，可以在 Map 宣告後的尖括號 `<>` 內加上鍵與值的型別。
例如：`MutableMap<String, Int>`。其中鍵的型別為 `String`，值的型別為 `Int`。

建立 Map 最簡單的方式是在每個鍵與其相關聯的值之間使用 [`to`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/to.html)：

```kotlin
fun main() {
//sampleStart
    // Read-only map
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println(readOnlyJuiceMenu)
    // {apple=100, kiwi=190, orange=100}

    // Mutable map with explicit type declaration
    val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println(juiceMenu)
    // {apple=100, kiwi=190, orange=100}
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-maps-declaration"}

> 為了防止意外修改，你可以將可變 Map 指派給 `Map`，以建立唯讀檢視：
> 
> ```kotlin
>     val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
>     val juiceMenuLocked: Map<String, Int> = juiceMenu
> ```
>
{style="tip"}

若要存取 Map 中的值，請使用[索引存取運算子](operator-overloading.md#indexed-access-operator) `[]` 並傳入其鍵：

```kotlin
fun main() {
//sampleStart
    // Read-only map
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println("The value of apple juice is: ${readOnlyJuiceMenu["apple"]}")
    // The value of apple juice is: 100
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-map-access"}

> 如果你嘗試使用 Map 中不存在的鍵來存取鍵值組，將會得到 `null` 值：
>
> ```kotlin
> fun main() {
> //sampleStart
>     // Read-only map
>     val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
>     println("The value of pineapple juice is: ${readOnlyJuiceMenu["pineapple"]}")
>     // The value of pineapple juice is: null
> //sampleEnd
> }
> ```
> {kotlin-runnable="true" id="kotlin-tour-map-no-key" validate="false"}
> 
> 本教學後續將在[空值安全](kotlin-tour-null-safety.md)章節中詳細說明 null 值。
> 
{style="note"}

你也可以使用[索引存取運算子](operator-overloading.md#indexed-access-operator) `[]` 來向可變 Map 新增項目：

```kotlin
fun main() {
//sampleStart
    val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    juiceMenu["coconut"] = 150 // Add key "coconut" with value 150 to the map
    println(juiceMenu)
    // {apple=100, kiwi=190, orange=100, coconut=150}
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-map-add-item"}

若要從可變 Map 中移除項目，請使用 [`.remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 函式：

```kotlin
fun main() {
//sampleStart
    val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    juiceMenu.remove("orange")    // Remove key "orange" from the map
    println(juiceMenu)
    // {apple=100, kiwi=190}
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-map-put-remove"}

若要取得 Map 中的項目數量，請使用 [`.count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html)
函式：

```kotlin
fun main() {
//sampleStart
    // Read-only map
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println("This map has ${readOnlyJuiceMenu.count()} key-value pairs")
    // This map has 3 key-value pairs
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-map-count"}

若要檢查 Map 中是否已包含特定鍵，請使用 [`.containsKey()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/contains-key.html)
函式：

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

若要取得 Map 的鍵或值的集合，請分別使用 [`keys`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/keys.html)
與 [`values`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/values.html) 屬性：

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

> [`keys`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/keys.html) 與 [`values`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/values.html)
> 都是物件**屬性**（property）的範例。若要存取物件的屬性，請在物件名稱後方加上句號 `.`，接著寫上屬性名稱。
>
> 屬性將在[類別](kotlin-tour-classes.md)章節中進行更詳細的討論。
> 在教學的這個階段，你只需要知道如何存取它們即可。
>
{style="note"}

若要檢查某個鍵或值是否存在於 Map 中，請使用 [`in` 運算子](operator-overloading.md#in-operator)：

```kotlin
fun main() {
//sampleStart
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println("orange" in readOnlyJuiceMenu.keys)
    // true
    
    // Alternatively, you don't need to use the keys property
    println("orange" in readOnlyJuiceMenu)
    // true
    
    println(200 in readOnlyJuiceMenu.values)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-map-in"}

若要深入了解集合的更多操作，請參閱[集合](collections-overview.md)。

現在你已經了解了基本型別以及如何管理集合，接下來是時候探索可在程式中使用的[控制流程](kotlin-tour-control-flow.md)了。

## 練習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="計算兩個清單中的項目總數" id="collections-exercise-1">

你有一個「綠色」數字清單和一個「紅色」數字清單。請補全程式碼以印出共有多少個數字。

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
<def title="檢查是否支援請求的通訊協定" id="collections-exercise-2">

你的伺服器有一組支援的通訊協定集合。使用者請求使用特定協定。請補全程式以檢查是否支援所請求的通訊協定（`isSupported` 必須為布林值）。

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
        請確保你將請求的通訊協定檢查為大寫。你可以使用 <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase.html"><code>.uppercase()</code></a>
函式來協助完成此操作。
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
<def title="使用 Map 拼寫數字" id="collections-exercise-3">

定義一個將整數 1 到 3 與其對應英文拼寫關聯起來的 Map。使用此 Map 拼寫出指定的數字。

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