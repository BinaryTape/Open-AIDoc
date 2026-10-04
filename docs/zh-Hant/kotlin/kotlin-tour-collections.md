[//]: # (title: 集合)

<no-index/>

在撰寫程式時，能將資料整理為結構以便後續處理是非常實用的功能。Kotlin 提供集合正是為了這個目的。

Kotlin 具有以下用於分組項目的集合：

| **集合型別** | **說明**                                                                |
|---------------------|-------------------------------------------------------------------------|
| List                | 項目的有序集合                                                          |
| Set                 | 項目的唯一無序集合                                                      |
| Map                 | 鍵值組（key-value pair）的集合，其中鍵是唯一的，且僅對應到一個值        |

每種集合型別都可以是可變的（mutable）或唯讀的（read-only）。

## List {id="list"}

List 會按照項目加入的順序儲存項目，並允許重複的項目。

若要建立唯讀 List（[`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/)），請使用 
[`listOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/list-of.html) 函式。

若要建立可變 List（[`MutableList`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list.html)），
請使用 [`mutableListOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-list-of.html) 函式。

建立 List 時，Kotlin 可以推論所儲存項目的型別。若要明確宣告型別，請在 List 宣告後的尖括號 `<>` 內加上型別：

```kotlin
fun main() { 
//sampleStart
    // 唯讀 List
    val readOnlyShapes = listOf("triangle", "square", "circle")
    println(readOnlyShapes)
    // [triangle, square, circle]
    
    // 具有明確型別宣告的可變 List
    val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")
    println(shapes)
    // [triangle, square, circle]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lists-declaration"}

> 為了防止意外的修改，您可以透過將可變 List 指派給 `List` 來建立唯讀檢視：
> 
> ```kotlin
>     val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")
>     val shapesLocked: List<String> = shapes
> ```
> 這也稱為**轉換**（casting）。
> 
{style="tip"}

List 是有序的，因此若要存取 List 中的項目，請使用[索引存取運算子](operator-overloading.md#indexed-access-operator) `[]`：

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

若要取得 List 中的第一個或最後一個項目，請分別使用 [`.first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html)
和 [`.last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html) 函式：

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
> 函式是**擴充函式**的範例。若要在物件上呼叫擴充函式，請在物件後方加上句點 `.`，接著寫入函式名稱。
> 
> 擴充函式會在[中階教學](kotlin-tour-intermediate-extension-functions.md#extension-functions)中詳細介紹。
> 目前您只需要知道如何呼叫它們即可。
> 
{style="note"}

若要取得 List 中的項目數量，請使用 [`.count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html)
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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-list-count"}

若要檢查某個項目是否存在於 List 中，請使用 [`in` 運算子](operator-overloading.md#in-operator)：

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

若要從可變 List 中新增或移除項目，請分別使用 [`.add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/add.html)
和 [`.remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 函式：

```kotlin
fun main() { 
//sampleStart
    val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")
    // 將 "pentagon" 加入到 List 中
    shapes.add("pentagon") 
    println(shapes)  
    // [triangle, square, circle, pentagon]

    // 從 List 中移除第一個 "pentagon"
    shapes.remove("pentagon") 
    println(shapes)  
    // [triangle, square, circle]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-list-add-remove"}

## Set {id="set"}

List 是有序的且允許重複項目，而 Set 則是**無序**且僅儲存**唯一**項目。

若要建立唯讀 Set（[`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/)），請使用 
[`setOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/set-of.html) 函式。

若要建立可變 Set（[`MutableSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/)),
請使用 [`mutableSetOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-set-of.html) 函式。

建立 Set 時，Kotlin 可以推論所儲存項目的型別。若要明確宣告型別，請在 Set 宣告後的尖括號 `<>` 內加上型別：

```kotlin
fun main() {
//sampleStart
    // 唯讀 Set
    val readOnlyFruit = setOf("apple", "banana", "cherry", "cherry")
    // 具有明確型別宣告的可變 Set
    val fruit: MutableSet<String> = mutableSetOf("apple", "banana", "cherry", "cherry")
    
    println(readOnlyFruit)
    // [apple, banana, cherry]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-sets-declaration"}

您可以在上一個範例中看到，由於 Set 僅包含唯一元素，因此重複的 `"cherry"` 項目會被捨棄。

> 為了防止意外的修改，您可以透過將可變 Set 指派給 `Set` 來建立唯讀檢視：
> 
> ```kotlin
>     val fruit: MutableSet<String> = mutableSetOf("apple", "banana", "cherry", "cherry")
>     val fruitLocked: Set<String> = fruit
> ```
>
{style="tip"}

> 由於 Set 是**無序**的，因此您無法存取特定索引處的項目。
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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-set-count"}

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-set-in"}

若要從可變 Set 中新增或移除項目，請分別使用 [`.add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/add.html)
和 [`.remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 函式：

```kotlin
fun main() { 
//sampleStart
    val fruit: MutableSet<String> = mutableSetOf("apple", "banana", "cherry", "cherry")
    fruit.add("dragonfruit")    // 將 "dragonfruit" 加入到 Set 中
    println(fruit)              // [apple, banana, cherry, dragonfruit]
    
    fruit.remove("dragonfruit") // 從 Set 中移除 "dragonfruit"
    println(fruit)              // [apple, banana, cherry]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-set-add-remove"}

## Map {id="map"}

Map 將項目儲存為鍵值組。您可以透過參照鍵來存取其對應的值。您可以將 Map 想像成菜單：您可以透過尋找想吃的餐點（鍵），來找到其價格（值）。如果您想要查詢值而不需要像在 List 中那樣使用數字索引，Map 就非常實用。

> * Map 中的每個鍵都必須是唯一的，這樣 Kotlin 才能識別您想要取得哪一個值。
> * Map 中可以有重複的值。
>
{style="note"}

若要建立唯讀 Map（[`Map`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/)），請使用 
[`mapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-of.html) 函式。

若要建立可變 Map（[`MutableMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/)），
請使用 [`mutableMapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-map-of.html) 函式。

建立 Map 時，Kotlin 可以推論所儲存項目的型別。若要明確宣告型別，請在 Map 宣告後的尖括號 `<>` 內加上鍵和值的型別。例如：`MutableMap<String, Int>`。
鍵的型別為 `String`，值的型別為 `Int`。

建立 Map 最簡單的方式是在每個鍵與其相關值之間使用 [`to`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/to.html)：

```kotlin
fun main() {
//sampleStart
    // 唯讀 Map
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println(readOnlyJuiceMenu)
    // {apple=100, kiwi=190, orange=100}

    // 具有明確型別宣告的可變 Map
    val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println(juiceMenu)
    // {apple=100, kiwi=190, orange=100}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-maps-declaration"}

> 為了防止意外的修改，您可以透過將可變 Map 指派給 `Map` 來建立唯讀檢視：
> 
> ```kotlin
>     val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
>     val juiceMenuLocked: Map<String, Int> = juiceMenu
> ```
>
{style="tip"}

若要存取 Map 中的值，請使用[索引存取運算子](operator-overloading.md#indexed-access-operator) `[]` 搭配其鍵：

```kotlin
fun main() {
//sampleStart
    // 唯讀 Map
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println("The value of apple juice is: ${readOnlyJuiceMenu["apple"]}")
    // The value of apple juice is: 100
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-access"}

> 如果您嘗試使用 Map 中不存在的鍵來存取鍵值組，您會看到 `null` 值：
>
> ```kotlin
> fun main() {
> //sampleStart
>     // 唯讀 Map
>     val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
>     println("The value of pineapple juice is: ${readOnlyJuiceMenu["pineapple"]}")
>     // The value of pineapple juice is: null
> //sampleEnd
> }
> ```
> {kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-no-key" validate="false"}
> 
> 本教學稍後會在[空值安全](kotlin-tour-null-safety.md)章節中解釋 null 值。
> 
{style="note"}

您也可以使用[索引存取運算子](operator-overloading.md#indexed-access-operator) `[]` 將項目加入到可變 Map 中：

```kotlin
fun main() {
//sampleStart
    val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    juiceMenu["coconut"] = 150 // 將鍵 "coconut" 與值 150 加入到 Map 中
    println(juiceMenu)
    // {apple=100, kiwi=190, orange=100, coconut=150}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-add-item"}

若要從可變 Map 中移除項目，請使用 [`.remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 
函式：

```kotlin
fun main() {
//sampleStart
    val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    juiceMenu.remove("orange")    // 從 Map 中移除鍵 "orange"
    println(juiceMenu)
    // {apple=100, kiwi=190}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-put-remove"}

若要取得 Map 中的項目數量，請使用 [`.count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html)
函式：

```kotlin
fun main() {
//sampleStart
    // 唯讀 Map
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println("This map has ${readOnlyJuiceMenu.count()} key-value pairs")
    // This map has 3 key-value pairs
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-count"}

若要檢查特定鍵是否已包含在 Map 中，請使用 [`.containsKey()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/contains-key.html)
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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-contains-keys"}

若要取得 Map 的鍵或值的集合，請分別使用 [`keys`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/keys.html)
和 [`values`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/values.html) 屬性：

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

> [`keys`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/keys.html) 與 [`values`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/values.html)
> 是物件**屬性**的範例。若要存取物件的屬性，請在物件後方加上句點 `.`，接著寫入屬性名稱。
>
> 屬性會在[類別](kotlin-tour-classes.md)章節中進行更詳細的討論。
> 在教學的這個階段，您只需要知道如何存取它們即可。
>
{style="note"}

若要檢查鍵或值是否存在於 Map 中，請使用 [`in` 運算子](operator-overloading.md#in-operator)：

```kotlin
fun main() {
//sampleStart
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println("orange" in readOnlyJuiceMenu.keys)
    // true
    
    // 或者，您不需要使用 keys 屬性
    println("orange" in readOnlyJuiceMenu)
    // true
    
    println(200 in readOnlyJuiceMenu.values)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-in"}

如需更多關於集合操作的資訊，請參閱[集合](collections-overview.md)。

現在您已經了解基本型別以及如何管理集合，接下來是時候探索可在程式中使用的[控制流程](kotlin-tour-control-flow.md)了。

## 練習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="計算兩個 List 中的項目總數">

您有一個「綠色」數字清單和一個「紅色」數字清單。請完成程式碼，印出總共有多少個數字。

```kotlin
fun main() {
    val greenNumbers = listOf(1, 4, 23)
    val redNumbers = listOf(17, 2)
    // 在此處編寫您的程式碼
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-collections-exercise-1"}

```kotlin
fun main() {
    val greenNumbers = listOf(1, 4, 23)
    val redNumbers = listOf(17, 2)
    val totalCount = greenNumbers.count() + redNumbers.count()
    println(totalCount)
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-collections-solution-1"}

</def>
<def title="檢查是否支援請求的通訊協定">

您有一組伺服器支援的通訊協定。使用者請求使用特定通訊協定。請完成程式以檢查是否支援請求的通訊協定（`isSupported` 必須為布林值）。

```kotlin
fun main() {
    val SUPPORTED = setOf("HTTP", "HTTPS", "FTP")
    val requested = "smtp"
    val isSupported = // 在此處編寫您的程式碼 
    println("Support for $requested: $isSupported")
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-collections-exercise-2"}

<deflist collapsible="true" id="kotlin-tour-collections-exercise-2-hint">
    <def title="提示">
        請確保您檢查的請求通訊協定為大寫。您可以使用 <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase.html"><code>.uppercase()</code></a>
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-collections-solution-2"}

</def>
<def title="使用 Map 拼寫數字">

定義一個將 1 到 3 的整數對應至其對應英文拼寫的 Map。使用此 Map 來拼寫給定的數字。

```kotlin
fun main() {
    val number2word = // 在此處編寫您的程式碼
    val n = 2
    println("$n is spelled as '${<在此處編寫您的程式碼>}'")
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-collections-exercise-3"}

```kotlin
fun main() {
    val number2word = mapOf(1 to "one", 2 to "two", 3 to "three")
    val n = 2
    println("$n is spelled as '${number2word[n]}'")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-collections-solution-3"}

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