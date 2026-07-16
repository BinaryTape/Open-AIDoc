[//]: # (title: 集合)

<no-index/>

<tldr>
    <p><img src="icon-1-done.svg" width="20" alt="First step" /> <a href="kotlin-tour-hello-world.md">Hello world</a><br />
        <img src="icon-2-done.svg" width="20" alt="Second step" /> <a href="kotlin-tour-basic-types.md">基本型別</a><br />
        <img src="icon-3.svg" width="20" alt="Third step" /> <strong>集合</strong><br />
        <img src="icon-4-todo.svg" width="20" alt="Fourth step" /> <a href="kotlin-tour-control-flow.md">控制流</a><br />
        <img src="icon-5-todo.svg" width="20" alt="Fifth step" /> <a href="kotlin-tour-functions.md">函式</a><br />
        <img src="icon-6-todo.svg" width="20" alt="Sixth step" /> <a href="kotlin-tour-classes.md">類別</a><br />
        <img src="icon-7-todo.svg" width="20" alt="Final step" /> <a href="kotlin-tour-null-safety.md">Null 安全性</a></p>
</tldr>

在進行程式設計時，能夠將資料分組到結構中以便稍後處理是非常有用的。Kotlin 正是為了這個目的而提供了集合（collections）。

Kotlin 具有以下用於將項目分組的集合型別：

| **集合型別** | **描述**                                                         |
|---------------------|-------------------------------------------------------------------------|
| List               | 項目的有序集合                                            |
| Set                | 項目的唯一無序集合                                   |
| Map                | 鍵值對的集合，其中鍵是唯一的，且僅對應到一個值 |

每種集合型別都可以是可變（mutable）或唯讀（read-only）的。

## List

List 按項目新增的順序儲存項目，並允許重複的項目。

要建立唯讀 List（[`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/)），請使用 [`listOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/list-of.html) 函式。

要建立可變 List（[`MutableList`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list.html)），請使用 [`mutableListOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-list-of.html) 函式。

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

> 為了防止非預期的修改，您可以將可變 List 指派給 `List` 來建立該 List 的唯讀檢視：
> 
> ```kotlin
>     val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")
>     val shapesLocked: `List<String>` = shapes
> ```
> 這也被稱為**轉換**（casting）。
> 
{style="tip"}

List 是有序的，因此要存取 List 中的項目，請使用 [索引存取運算子](operator-overloading.md#indexed-access-operator) `[]`：

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

若要取得 List 中的第一個或最後一個項目，請分別使用 [`.first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) 和 [`.last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html) 函式：

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

> [`.first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) 和 [`.last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html) 函式是**擴充**方法的範例。要對物件呼叫擴充方法，請在物件名稱後加上句點 `.` 並寫下方法名稱。
> 
> 擴充方法在 [中級教學](kotlin-tour-intermediate-extension-functions.md#extension-functions) 中有詳細介紹。目前，您只需要知道如何呼叫它們即可。
> 
{style="note"}

若要取得 List 中的項目數量，請使用 [`.count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html) 函式：

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

若要檢查某個項目是否在 List 中，請使用 [`in` 運算子](operator-overloading.md#in-operator)：

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

若要從可變 List 中新增或移除項目，請分別使用 [`.add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/add.html) 和 [`.remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 函式：

```kotlin
fun main() { 
//sampleStart
    val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")
    // 將 "pentagon" 新增到 List
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

## Set

List 是有序且允許重複項目的，而 Set 則是**無序**且僅儲存**唯一**項目。

要建立唯讀 Set（[`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/)），請使用 [`setOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/set-of.html) 函式。

要建立可變 Set（[`MutableSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/)），請使用 [`mutableSetOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-set-of.html) 函式。

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

您可以在前面的範例中看到，由於 Set 僅包含唯一元素，因此重複的 `"cherry"` 項目會被捨棄。

> 為了防止非預期的修改，您可以將可變 Set 指派給 `Set` 來建立該 Set 的唯讀檢視：
> 
> ```kotlin
>     val fruit: MutableSet<String> = mutableSetOf("apple", "banana", "cherry", "cherry")
>     val fruitLocked: Set<String> = fruit
> ```
>
{style="tip"}

> 由於 Set 是**無序**的，您無法存取特定索引處的項目。
> 
{style="note"}

若要取得 Set 中的項目數量，請使用 [`.count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html) 函式：

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

若要檢查某個項目是否在 Set 中，請使用 [`in` 運算子](operator-overloading.md#in-operator)：

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

若要從可變 Set 中新增或移除項目，請分別使用 [`.add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/add.html) 和 [`.remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 函式：

```kotlin
fun main() { 
//sampleStart
    val fruit: MutableSet<String> = mutableSetOf("apple", "banana", "cherry", "cherry")
    fruit.add("dragonfruit")    // 將 "dragonfruit" 新增到 Set
    println(fruit)              // [apple, banana, cherry, dragonfruit]
    
    fruit.remove("dragonfruit") // 從 Set 中移除 "dragonfruit"
    println(fruit)              // [apple, banana, cherry]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-set-add-remove"}

## Map

Map 以鍵值對的形式儲存項目。您可以透過引用鍵（key）來存取值（value）。您可以將 Map 想像成菜單。您可以透過找到想吃的食物（鍵）來找到對應的價格（值）。如果您想在不使用數字索引（如 List）的情況下查找值，Map 就非常有用。

> * Map 中的每個鍵都必須是唯一的，這樣 Kotlin 才能識別您想要取得哪個值。 
> * Map 中可以有重複的值。
>
{style="note"}

要建立唯讀 Map（[`Map`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/)），請使用 [`mapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-of.html) 函式。

要建立可變 Map（[`MutableMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/)），請使用 [`mutableMapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-map-of.html) 函式。

建立 Map 時，Kotlin 可以推論所儲存項目的型別。若要明確宣告型別，請在 Map 宣告後的尖括號 `<>` 內加上鍵和值的型別。例如：`MutableMap<String, Int>`。在此例中，鍵的型別為 `String`，值的型別為 `Int`。

建立 Map 最簡單的方法是在每個鍵與其相關的值之間使用 [`to`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/to.html)：

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

> 為了防止非預期的修改，您可以將可變 Map 指派給 `Map` 來建立該 Map 的唯讀檢視：
> 
> ```kotlin
>     val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
>     val juiceMenuLocked: Map<String, Int> = juiceMenu
> ```
>
{style="tip"}

要存取 Map 中的值，請使用 [索引存取運算子](operator-overloading.md#indexed-access-operator) `[]` 及其鍵：

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

> 如果您嘗試使用 Map 中不存在的鍵來存取鍵值對，您將看到 `null` 值：
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
> 本教學稍後將在 [Null 安全性](kotlin-tour-null-safety.md) 章節中解釋 null 值。
> 
{style="note"}

您也可以使用 [索引存取運算子](operator-overloading.md#indexed-access-operator) `[]` 將項目新增至可變 Map：

```kotlin
fun main() {
//sampleStart
    val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    juiceMenu["coconut"] = 150 // 將鍵 "coconut" 及其值 150 新增至 Map
    println(juiceMenu)
    // {apple=100, kiwi=190, orange=100, coconut=150}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-add-item"}

要從可變 Map 中移除項目，請使用 [`.remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 函式：

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

若要取得 Map 中的項目數量，請使用 [`.count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html) 函式：

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

若要檢查 Map 中是否已包含特定鍵，請使用 [`.containsKey()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/contains-key.html) 函式：

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

若要獲取 Map 的鍵或值的集合，請分別使用 [`keys`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/keys.html) 和 [`values`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/values.html) 屬性：

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

> [`keys`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/keys.html) 和 [`values`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/values.html) 是物件**屬性**（properties）的範例。要存取物件的屬性，請在物件名稱後加上句點 `.` 並寫下屬性名稱。
>
> 屬性在 [類別](kotlin-tour-classes.md) 章節中有更詳細的討論。在目前的教學階段，您只需要知道如何存取它們即可。
>
{style="note"}

若要檢查鍵或值是否在 Map 中，請使用 [`in` 運算子](operator-overloading.md#in-operator)：

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

有關您可以使用集合執行的操作的更多資訊，請參閱 [集合](collections-overview.md)。

現在您已經了解基本型別以及如何管理集合，接下來是時候探索可以在程式中使用的 [控制流](kotlin-tour-control-flow.md) 了。

## 練習

### 練習 1 {initial-collapse-state="collapsed" collapsible="true"}

您有一個「綠色」數字列表和一個「紅色」數字列表。完成程式碼以列印總共有多少個數字。

|---|---|
```kotlin
fun main() {
    val greenNumbers = listOf(1, 4, 23)
    val redNumbers = listOf(17, 2)
    // 在此編寫您的程式碼
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-collections-solution-1"}

### 練習 2 {initial-collapse-state="collapsed" collapsible="true"}

您有一組伺服器支援的通訊協定（protocols）。使用者請求使用特定通訊協定。完成程式以檢查所請求的通訊協定是否受支援（`isSupported` 必須為布林值）。

|---|---|
```kotlin
fun main() {
    val SUPPORTED = setOf("HTTP", "HTTPS", "FTP")
    val requested = "smtp"
    val isSupported = // 在此編寫您的程式碼 
    println("Support for $requested: $isSupported")
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-collections-exercise-2"}

<deflist collapsible="true" id="kotlin-tour-collections-exercise-2-hint">
    <def title="提示">
        請確保您以大寫形式檢查所請求的通訊協定。您可以使用 <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase.html"><code>.uppercase()</code></a> 函式來協助您。
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-collections-solution-2"}

### 練習 3 {initial-collapse-state="collapsed" collapsible="true"}

定義一個 Map，將 1 到 3 的整數對應到其對應的拼字。使用此 Map 來拼出指定的數字。

|---|---|
```kotlin
fun main() {
    val number2word = // 在此編寫您的程式碼
    val n = 2
    println("$n is spelled as '${<在此編寫您的程式碼 >}'")
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-collections-solution-3"}

## 下一步

[控制流](kotlin-tour-control-flow.md)