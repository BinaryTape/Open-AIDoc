[//]: # (title: ブール値（Booleans）)
[//]: # (description: 宣言、論理演算子、条件分岐など、Kotlin での Boolean 値の使用方法について学びます。)

<show-structure depth="1"/>

[`Boolean`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-boolean/) 型は、論理値である `true` と `false` を表します。

Yes/No の質問に答える関数や、`while`、`if`、`when` の条件式で `Boolean` 値を使用します。

## `Boolean` 変数を宣言する {id="declare-a-boolean-variable"}

`Boolean` 変数を宣言するには、`true` または `false` を代入します。

`Boolean` 型を明示的に指定することも、Kotlin に値から型推論させることもできます：

```kotlin
val isTrue: Boolean = true
val isFalse = false // Kotlin が Boolean と推論
```

値が `null` になり得る場合は、`Boolean?` を使用します：

```kotlin
val isEnabled: Boolean? = null
```

> `Boolean` 変数に整数値を代入することはできません。
> Kotlin では、`0` や `1` は `Boolean` 値ではありません。
>
{style="note"}

## `Boolean` 値を生成する {id="produce-boolean-values"}

比較式や関数を使用して `Boolean` 値を生成できます：

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

結果は、条件分岐やその他の式でも使用できます：

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

## `Boolean` の演算 {id="boolean-operations"}

Kotlin には、`Boolean` 値を扱うための演算子と中置関数（infix function）が用意されています。
これらを使用して、`Boolean` 値を反転したり、複数の `Boolean` 値を組み合わせて単一の結果にしたりできます。

### 否定（NOT） {id="negation-not"}

NOT 演算子は `Boolean` 値を反転します。

NOT を使用するには、`Boolean` 値の前に `!` 演算子を置きます：

```kotlin
val isOn = true
val isOff = !isOn // isOff は false
```

### 論理積（AND） {id="logical-and"}

AND 演算子は、両方のオペランドが `true` の場合にのみ `true` を返します。

論理 AND を使用するには、オペランドの間に `&&` 演算子を置きます：

```kotlin
val a = false && false // false
val b = false && true // false
val c = true && false // false
val d = true && true  // true
```

> 最初のオペランドが `false` の場合、`&&` 演算子は2番目のオペランドの評価をスキップします。
> 両方のオペランドを評価したい場合は、代わりに `and` [中置関数](functions.md#infix-notation)を使用してください。
>
{style="note"}

### 論理和（OR） {id="logical-or"}

OR 演算子は、少なくとも1つのオペランドが `true` の場合に `true` を返します。

論理 OR を使用するには、オペランドの間に `||` 演算子を置きます：

```kotlin
val a = false || false // false
val b = false || true  // true
val c = true || false  // true
val d = true || true   // true
```

> 最初のオペランドが `true` の場合、`||` 演算子は2番目のオペランドの評価をスキップします。
> 両方のオペランドを評価したい場合は、代わりに `or` [中置関数](functions.md#infix-notation)を使用してください。
>
{style="note"}

### 排他的論理和（XOR） {id="exclusive-or-xor"}

排他的論理和（XOR）演算は、オペランドの値が異なる場合に `true` を返します。

XOR を使用するには、オペランドの間に `xor` と記述します：

```kotlin
val a = false xor false // false
val b = false xor true  // true
val c = true xor false  // true
val d = true xor true   // false
```

> `xor` は演算子ではなく、[中置関数](functions.md#infix-notation)です。
>
> `Boolean` 関数の詳細については、[API リファレンス](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-boolean/)を参照してください。
>
{style="note"}

## 演算子の優先順位 {id="operator-precedence"}

式に複数の論理演算が含まれており、評価順序を指定する括弧がない場合、Kotlin は優先順位の規則を適用します。優先順位の高い演算が、優先順位の低い演算よりも先に評価されます。

このセクションで説明した `Boolean` 演算の優先順位は次のとおりです：

1. `!`
2. `xor`（およびその他の中置関数）
3. `&&`
4. `||`

次の例では、コンパイラは `||` よりも前に `&&` を評価します：

```kotlin
fun main() {
//sampleStart
    val result = true || false && false
    println(result) // true
//sampleEnd    
}
```
{kotlin-runnable="true" validate="false"}

評価順序を明示的にするには、括弧を使用します：

```kotlin
fun main() {
//sampleStart
    val result = (true || false) && false
    println(result) // false
//sampleEnd    
}
```
{kotlin-runnable="true" validate="false"}

## 条件式における `Boolean` {id="boolean-in-conditions"}

[`if`](control-flow.md#if-expression)、[`when`](control-flow.md#when-expressions-and-statements)、[`while`](control-flow.md#while-loops) は、プログラムの流れを制御するために `Boolean` 式を評価します。

### `if` 式 {id="if-expressions"}

```kotlin
fun main() {
//sampleStart
    val number = 4
    val isEven = number % 2 == 0

    // 条件はすでに `Boolean` 型を持っています
    // `true` や `false` と比較する必要はありません
    if (isEven) { 
        println("The number is even.")
    } else {
        println("The number is odd.")
    }
//sampleEnd    
}
```
{kotlin-runnable="true"}

### `when` 式 {id="when-expressions"}

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

### `while` ループ {id="while-loops"}

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