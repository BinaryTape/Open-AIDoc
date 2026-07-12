[//]: # (title: Hello world)

<no-index/>

這是一個印出 "Hello, world!" 的簡單程式：

```kotlin
fun main() {
    println("Hello, world!")
    // Hello, world!
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="hello-world-kotlin"}

在 Kotlin 中：

* `fun` 用於宣告函式
* `main()` 函式是程式開始執行的地方
* 函式的內容（Body）寫在花括號 `{}` 內
* [`println()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/println.html) 和 [`print()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/print.html) 函式會將其引數印出到標準輸出

函式是一組執行特定任務的指令。一旦建立了函式，每當需要執行該任務時就可以使用它，而不需要重新編寫所有指令。後續章節會更詳細地討論函式。在此之前，所有範例都使用 `main()` 函式。

## 變數

所有程式都需要能夠儲存資料，而變數可以幫助您做到這一點。在 Kotlin 中，您可以宣告：

* 使用 `val` 宣告唯讀變數
* 使用 `var` 宣告可變變數

> 唯讀變數一旦賦值後就無法更改。
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

> 變數可以在程式開頭的 `main()` 函式之外宣告。以此方式宣告的變數被稱為宣告在 **頂層 (top level)**。
> 
{style="tip"}

由於 `customers` 是一個可變變數，其值在宣告後可以重新指派。

> 我們建議預設將所有變數宣告為唯讀 (`val`)。僅在確實需要時才使用可變變數 (`var`)。這樣一來，您就不太可能意外更改本不該更改的內容。
> 
{style="note"}

## 字串範本

瞭解如何將變數內容印出到標準輸出非常實用。您可以使用 **字串範本 (string templates)** 來達成此目的。您可以使用範本運算式來存取儲存在變數和其他物件中的資料，並將其轉換為字串。字串值是包含在雙引號 `"` 中的一連串字元。範本運算式總是以錢字號 `$` 開頭。

若要在範本運算式中評估一段程式碼，請將程式碼放在錢字號 `$` 後方的花括號 `{}` 內。

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

如需更多資訊，請參閱 [字串範本](strings.md#string-templates)。

您會注意到變數並沒有宣告任何型別。Kotlin 已自行推論出型別：`Int`。本導覽將在[下一章節](kotlin-tour-basic-types.md)介紹不同的 Kotlin 基本型別以及如何宣告它們。

## 練習 {completion-point="true"}

### 練習 {initial-collapse-state="collapsed" collapsible="true"}

完成程式碼，使程式將 `"Mary is 20 years old"` 印出至標準輸出：

|---|---|
```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    // 在此編寫您的程式碼
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-hello-world-exercise"}

|---|---|
```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    println("$name is $age years old")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解法" id="kotlin-tour-hello-world-solution"}

<seealso></seealso>

<list id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-basic-types.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>