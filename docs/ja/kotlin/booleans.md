[//]: # (title: Boolean 型)
[//]: # (description: 宣言、論理演算子、条件式など、Kotlin で Boolean 値を使用する方法について学びます。)

<show-structure depth="1"/>

[`Boolean`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-boolean/) 型は、論理値である `true` と `false` を表します。

Boolean 値は、はい・いいえで答える質問を返す関数や、`while`、`if`、`when` の条件式で使用します。

## Boolean 変数の宣言 {id="declare-a-boolean-variable"}

Boolean 変数を宣言するには、`true` または `false` を代入します。

Boolean 型を明示的に指定するか、値から Kotlin に推論させることができます：

```kotlin
val isTrue: Boolean = true
val isFalse = false // Kotlin が Boolean と推論します
```

値が `null` になる可能性がある場合は、`Boolean?` を使用します：

```kotlin
val isEnabled: Boolean? = null
```

> Boolean 変数に整数値を代入することはできません。
> Kotlin では、`0` や `1` は Boolean 値ではありません。
>
{style="note"}

## Boolean 値の生成 {id="produce-boolean-values"}

比較式や関数を使用して Boolean 値を生成できます：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

その結果を条件式や他の式でも使用できます：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## Boolean の演算 {id="boolean-operations"}

Kotlin は、Boolean 値を扱うための演算子や中置関数を提供しています。これらを使用して、Boolean 値を反転させたり、複数の Boolean 値を組み合わせて 1 つの結果にしたりできます。

### 否定 (NOT) {id="negation-not"}

NOT 演算子は Boolean 値を反転させます。

NOT を使用するには、Boolean 値の前に `!` 演算子を置きます：

```kotlin
val isOn = true
val isOff = !isOn // isOff は false
```

### 論理積 (AND) {id="logical-and"}

AND 演算子は、両方のオペランドが `true` の場合にのみ `true` を返します。

論理積（AND）を使用するには、オペランドの間に `&&` 演算子を置きます：

```kotlin
val a = false && false // false
val b = false && true // false
val c = true && false // false
val d = true && true  // true
```

> 最初のオペランドが `false` の場合、`&&` 演算子は 2 番目のオペランドの評価をスキップします。
> 両方のオペランドを評価するには、代わりに `and` [中置関数](functions.md#infix-notation)を使用してください。
>
{style="note"}

### 論理和 (OR) {id="logical-or"}

OR 演算子は、少なくとも一方のオペランドが `true` であれば `true` を返します。

論理和（OR）を使用するには、オペランドの間に `||` 演算子を置きます：

```kotlin
val a = false || false // false
val b = false || true  // true
val c = true || false  // true
val d = true || true   // true
```

> 最初のオペランドが `true` の場合、`||` 演算子は 2 番目のオペランドの評価をスキップします。
> 両方のオペランドを評価するには、代わりに `or` [中置関数](functions.md#infix-notation)を使用してください。
>
{style="note"}

### 排他的論理和 (XOR) {id="exclusive-or-xor"}

排他的論理和（XOR）演算は、オペランドが異なる値を持つ場合に `true` を返します。

XOR を使用するには、オペランドの間に `xor` を記述します：

```kotlin
val a = false xor false // false
val b = false xor true  // true
val c = true xor false  // true
val d = true xor true   // false
```

> `xor` は演算子ではなく[中置関数](functions.md#infix-notation)です。
>
> Boolean 関数の詳細については、[API リファレンス](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-boolean/)を参照してください。
>
{style="note"}

## 演算子の優先順位 {id="operator-precedence"}

式に複数の論理演算が含まれており、評価順序を指定する括弧がない場合、Kotlin は優先順位ルールを適用します。優先順位の高い演算は、優先順位の低い演算よりも前に評価されます。

このセクションで説明した Boolean 演算の優先順位は次の通りです：

1. `!`
2. `xor` (および他の中置関数)
3. `&&`
4. `||`

次の例では、コンパイラは `||` よりも先に `&&` を評価します：

```kotlin
fun main() {
//sampleStart
    val result = true || false && false
    println(result) // true
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false"}

評価順序を明示的にするには、括弧を使用します：

```kotlin
fun main() {
//sampleStart
    val result = (true || false) && false
    println(result) // false
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false"}

## 条件式での Boolean {id="boolean-in-conditions"}

[`if`](control-flow.md#if-expression)、[`when`](control-flow.md#when-expressions-and-statements)、および [`while`](control-flow.md#while-loops) は Boolean 式を評価してプログラムのフローを制御します。

### if 式 {id="if-expressions"}

```kotlin
fun main() {
//sampleStart
    val number = 4
    val isEven = number % 2 == 0

    // 条件はすでに Boolean 型です
    // true や false と比較する必要はありません
    if (isEven) { 
        println("The number is even.")
    } else {
        println("The number is odd.")
    }
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### when 式 {id="when-expressions"}

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### while ループ {id="while-loops"}

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}