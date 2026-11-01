[//]: # (title: 布林值)
[//]: # (description: 了解如何在 Kotlin 中使用布林值，包括宣告、邏輯運算子和條件式。)

<show-structure depth="1"/>

[`Boolean`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-boolean/) 型別表示邏輯值：`true` 與 `false`。

在回答是非問題的函式中，以及在 `while`、`if` 和 `when` 條件中使用 `Boolean` 值。

## 宣告 `Boolean` 變數 {id="declare-a-boolean-variable"}

若要宣告 `Boolean` 變數，請為其指派 `true` 或 `false`。

你可以明確指定 `Boolean` 型別，或讓 Kotlin 從值中進行型別推論：

```kotlin
val isTrue: Boolean = true
val isFalse = false // Kotlin 推論為 Boolean
```

如果值可以為 `null`，請使用 `Boolean?`：

```kotlin
val isEnabled: Boolean? = null
```

> 你不能將整數值指派給 `Boolean` 變數。
> 在 Kotlin 中，`0` 與 `1` 不是 `Boolean` 值。
>
{style="note"}

## 產生 `Boolean` 值 {id="produce-boolean-values"}

你可以使用比較運算式和函式來產生 `Boolean` 值：

```kotlin
fun main() {
//sampleStart
    val number = 10
    val isPositive = number > 0 
    println(isPositive) // true

    val language = "Kotlin"
    val isEmpty = language.isEmpty() 
    println(isEmpty) // false
//sampleEnd
}
```
{kotlin-runnable="true"}

你也可以在條件式與其他運算式中使用這些結果：

```kotlin
fun main() {
//sampleStart
    val number = 10
    val isPositive = number > 0 // true

    if (isPositive) {
        println("The number is positive.")
    }
//sampleEnd    
}
```
{kotlin-runnable="true"}

## `Boolean` 運算 {id="boolean-operations"}

Kotlin 提供了用於處理 `Boolean` 值的運算子和中綴函式。
你可以使用它們來反轉 `Boolean` 值，或將多個 `Boolean` 值合併為單一結果。

### 邏輯非 (NOT) {id="negation-not"}

NOT 運算子會反轉 `Boolean` 值。

若要使用 NOT，請在 `Boolean` 值前面放置 `!` 運算子：

```kotlin
val isOn = true
val isOff = !isOn // isOff 為 false
```

### 邏輯 AND {id="logical-and"}

AND 運算子僅在兩個運算元皆為 `true` 時才傳回 `true`。

若要使用邏輯 AND，請在運算元之間放置 `&&` 運算子：

```kotlin
val a = false && false // false
val b = false && true // false
val c = true && false // false
val d = true && true  // true
```

> 如果第一個運算元為 `false`，則 `&&` 運算子會略過第二個運算元。
> 若要對兩個運算元都進行求值，請改用 `and` [中綴函式](functions.md#infix-notation)。
>
{style="note"}

### 邏輯 OR {id="logical-or"}

OR 運算子在至少有一個運算元為 `true` 時傳回 `true`。

若要使用邏輯 OR，請在運算元之間放置 `||` 運算子：

```kotlin
val a = false || false // false
val b = false || true  // true
val c = true || false  // true
val d = true || true   // true
```

> 如果第一個運算元為 `true`，則 `||` 運算子會略過第二個運算元。
> 若要對兩個運算元都進行求值，請改用 `or` [中綴函式](functions.md#infix-notation)。
>
{style="note"}

### 互斥 OR (XOR) {id="exclusive-or-xor"}

互斥 OR (XOR) 運算會在運算元具有不同值時傳回 `true`。

若要使用 XOR，請在運算元之間寫入 `xor`：

```kotlin
val a = false xor false // false
val b = false xor true  // true
val c = true xor false  // true
val d = true xor true   // false
```

> `xor` 是一個[中綴函式](functions.md#infix-notation)，而不是運算子。
>
> 請在 [API 參考](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-boolean/)中進一步了解 `Boolean` 函式。
>
{style="note"}

## 運算子優先順序 {id="operator-precedence"}

如果運算式包含多個邏輯運算且未包含圓括號來指定求值順序，Kotlin 會套用優先順序規則。具有較高優先順序的運算會在具有較低優先順序的運算之前求值。

對於本節介紹的 `Boolean` 運算，優先順序如下：

1. `!`
2. `xor`（以及其他中綴函式）
3. `&&`
4. `||`

在以下範例中，編譯器會在 `||` 之前先對 `&&` 求值：

```kotlin
fun main() {
//sampleStart
    val result = true || false && false
    println(result) // true
//sampleEnd    
}
```
{kotlin-runnable="true" validate="false"}

若要明確指定求值順序，請使用圓括號：

```kotlin
fun main() {
//sampleStart
    val result = (true || false) && false
    println(result) // false
//sampleEnd    
}
```
{kotlin-runnable="true" validate="false"}

## 條件式中的 `Boolean` {id="boolean-in-conditions"}

[`if`](control-flow.md#if-expression)、[`when`](control-flow.md#when-expressions-and-statements) 和 [`while`](control-flow.md#while-loops) 會對 `Boolean` 運算式求值，以引導程式流程。

### `if` 運算式 {id="if-expressions"}

```kotlin
fun main() {
//sampleStart
    val number = 4
    val isEven = number % 2 == 0

    // 條件本身已經具有 `Boolean` 型別
    // 你不需要將它與 `true` 或 `false` 進行比較
    if (isEven) { 
        println("The number is even.")
    } else {
        println("The number is odd.")
    }
//sampleEnd    
}
```
{kotlin-runnable="true"}

### `when` 運算式 {id="when-expressions"}

```kotlin
fun main() {
//sampleStart
    val number = 3

    when {
        number > 0 -> println("The number is positive.")
        number < 0 -> println("The number is negative.")
        else -> println("The number is zero.")
    }
//sampleEnd    
}
```
{kotlin-runnable="true"}

### `while` 迴圈 {id="while-loops"}

```kotlin
fun main() {
//sampleStart
    var isCalculating = true
    
    while (isCalculating) {
        println("Calculating...")
        isCalculating = false
    }
//sampleEnd    
}
```
{kotlin-runnable="true"}