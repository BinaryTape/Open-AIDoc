[//]: # (title: 布尔值)
[//]: # (description: 了解如何在 Kotlin 中使用布尔值，包括声明、逻辑运算符和条件。)

<show-structure depth="1"/>

[`Boolean`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-boolean/) 类型表示逻辑值：`true` 和 `false`。

在用于判断是非问题的函数中，以及在 `while`、`if` 和 `when` 的条件中，可以使用 `Boolean` 值。

## 声明 `Boolean` 变量 {id="declare-a-boolean-variable"}

要声明 `Boolean` 变量，为其赋值 `true` 或 `false` 即可。

你可以显式指定 `Boolean` 类型，也可以让 Kotlin 根据值自动进行类型推断：

```kotlin
val isTrue: Boolean = true
val isFalse = false // Kotlin 会推断为 Boolean
```

如果值可能为 `null`，请使用 `Boolean?`：

```kotlin
val isEnabled: Boolean? = null
```

> 不能将整数值赋给 `Boolean` 变量。
> 在 Kotlin 中，`0` 和 `1` 不是 `Boolean` 值。
>
{style="note"}

## 生成 `Boolean` 值 {id="produce-boolean-values"}

可以使用比较表达式和函数来生成 `Boolean` 值：

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

你还可以将结果用于条件和其他表达式中：

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

## `Boolean` 操作 {id="boolean-operations"}

Kotlin 提供了用于处理 `Boolean` 值的运算符和中缀函数。
你可以使用它们来对 `Boolean` 值求反，或将多个 `Boolean` 值合并为一个结果。

### 逻辑非 (NOT) {id="negation-not"}

NOT 运算符用于对 `Boolean` 值求反。

要使用 NOT，请在 `Boolean` 值前放置 `!` 运算符：

```kotlin
val isOn = true
val isOff = !isOn // isOff 为 false
```

### 逻辑与 (AND) {id="logical-and"}

仅当两个操作数都为 `true` 时，AND 运算符才会返回 `true`。

要使用逻辑与，请在操作数之间放置 `&&` 运算符：

```kotlin
val a = false && false // false
val b = false && true // false
val c = true && false // false
val d = true && true  // true
```

> 如果第一个操作数为 `false`，则 `&&` 运算符会跳过第二个操作数。
> 如需计算两个操作数的值，请改用 `and` [中缀函数](functions.md#infix-notation)。
>
{style="note"}

### 逻辑或 (OR) {id="logical-or"}

只要至少有一个操作数为 `true`，OR 运算符就会返回 `true`。

要使用逻辑或，请在操作数之间放置 `||` 运算符：

```kotlin
val a = false || false // false
val b = false || true  // true
val c = true || false  // true
val d = true || true   // true
```

> 如果第一个操作数为 `true`，则 `||` 运算符会跳过第二个操作数。
> 如需计算两个操作数的值，请改用 `or` [中缀函数](functions.md#infix-notation)。
>
{style="note"}

### 异或 (XOR) {id="exclusive-or-xor"}

如果操作数具有不同的值，则异或 (XOR) 操作返回 `true`。

要使用 XOR，请在操作数之间写入 `xor`：

```kotlin
val a = false xor false // false
val b = false xor true  // true
val c = true xor false  // true
val d = true xor true   // false
```

> `xor` 是一个[中缀函数](functions.md#infix-notation)，而不是运算符。
>
> 详细了解 `Boolean` 函数，请参阅 [API 参考](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-boolean/)。
>
{style="note"}

## 运算符优先级 {id="operator-precedence"}

如果表达式中包含多个逻辑运算且没有使用圆括号指定求值顺序，Kotlin 将应用优先级规则。具有较高优先级的运算会先于具有较低优先级的运算执行。

对于本节中介绍的 `Boolean` 操作，优先级顺序如下：

1. `!`
2. `xor`（以及其他中缀函数）
3. `&&`
4. `||`

在以下示例中，编译器会先计算 `&&`，然后再计算 `||`：

```kotlin
fun main() {
//sampleStart
    val result = true || false && false
    println(result) // true
//sampleEnd    
}
```
{kotlin-runnable="true" validate="false"}

如需明确指定求值顺序，请使用圆括号：

```kotlin
fun main() {
//sampleStart
    val result = (true || false) && false
    println(result) // false
//sampleEnd    
}
```
{kotlin-runnable="true" validate="false"}

## 条件中的 `Boolean` {id="boolean-in-conditions"}

[`if`](control-flow.md#if-expression)、[`when`](control-flow.md#when-expressions-and-statements) 和 [`while`](control-flow.md#while-loops) 会对 `Boolean` 表达式进行求值，以控制程序流程。

### `if` 表达式 {id="if-expressions"}

```kotlin
fun main() {
//sampleStart
    val number = 4
    val isEven = number % 2 == 0

    // 条件本身已经是 `Boolean` 类型
    // 无需将其与 `true` 或 `false` 进行比较
    if (isEven) { 
        println("The number is even.")
    } else {
        println("The number is odd.")
    }
//sampleEnd    
}
```
{kotlin-runnable="true"}

### `when` 表达式 {id="when-expressions"}

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

### `while` 循环 {id="while-loops"}

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