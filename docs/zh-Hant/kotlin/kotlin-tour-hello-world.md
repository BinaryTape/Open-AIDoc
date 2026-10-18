[//]: # (title: Hello world)

<no-index/>

這是一個列印「Hello, world!」的簡單程式：

```kotlin
fun main() {
    println("Hello, world!")
    // Hello, world!
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="hello-world-kotlin"}

在 Kotlin 中：

* `fun` 用於宣告函式
* `main()` 函式是程式的起始入口點
* 函式的主體寫在花括號 `{}` 內
* [`println()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/println.html) 與 [`print()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/print.html) 函式會將其引數列印至標準輸出

函式是一組執行特定任務的指令集合。一旦建立了函式，每當需要執行該任務時就可以直接使用它，而不需要重新編寫所有指令。後續章節將更詳細地討論函式。在此之前，所有範例都將使用 `main()` 函式。

## 變數 {id="variables"}

所有程式都需要儲存資料，而變數正是用來實現這一點。在 Kotlin 中，你可以宣告：

* 使用 `val` 宣告唯讀變數
* 使用 `var` 宣告可變變數

> 一旦為唯讀變數賦予了值，就無法再更改它。
>
{style="note"}

若要指派值，請使用指派運算子 `=`。

例如：

```kotlin
fun main() { 
//sampleStart
    val popcorn = 5    // 有 5 盒爆米花
    val hotdog = 7     // 有 7 份熱狗
    var customers = 10 // 隊伍中有 10 位顧客
    
    // 一些顧客離開了隊伍
    customers = 8
    println(customers)
    // 8
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-variables"}

> 變數可以在程式開頭宣告於 `main()` 函式之外。以這種方式宣告的變數稱為宣告在**頂層 (top level)**。
> 
{style="tip"}

由於 `customers` 是一個可變變數，因此在宣告後可以重新指派其值。

> 我們建議預設將所有變數宣告為唯讀 (`val`)。只有在確實需要時才使用可變變數 (`var`)。這樣一來，可以減少意外修改不應變更之內容的機會。
> 
{style="note"}

## 字串範本 {id="string-templates"}

了解如何將變數的內容列印到標準輸出非常實用。你可以透過**字串範本**來做到這一點。
你可以使用範本運算式來存取儲存在變數和其他物件中的資料，並將它們轉換為字串。
字串值是一串包含在雙引號 `"` 內的字元序列。範本運算式一律以錢字號 `$` 開頭。

若要在範本運算式中對一段程式碼求值，請將該程式碼置於錢字號 `$` 後方的花括號 `{}` 中。

例如：

```kotlin
fun main() { 
//sampleStart
    val customers = 10
    println("There are $customers customers")
    // There are 10 customers
    
    println("There are ${customers + 1} customers")
    // There are 11 customers
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-string-templates"}

如需更多資訊，請參閱[字串範本](strings.md#string-templates)。

你會注意到變數並沒有宣告任何型別。這是因為 Kotlin 自行推論出了型別：`Int`。本導覽將在[下一章](kotlin-tour-basic-types.md)中介紹不同的 Kotlin 基本型別以及如何宣告它們。

## 練習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true">
<def title="使用字串範本列印陳述式" id="hello-world-exercise-1">

完成程式碼，使程式將 `"Mary is 20 years old"` 列印至標準輸出：

```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    // 在此處編寫你的程式碼
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-hello-world-exercise"}

```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    println("$name is $age years old")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="參考解答" id="kotlin-tour-hello-world-solution"}

</def>
</deflist>

<seealso></seealso>

<list id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-basic-types.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>