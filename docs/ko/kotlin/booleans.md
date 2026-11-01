[//]: # (title: 불리언)
[//]: # (description: 변수 선언, 논리 연산자, 조건문을 포함하여 Kotlin에서 Boolean 값을 사용하는 방법을 알아봅니다.)

<show-structure depth="1"/>

[`Boolean`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-boolean/) 타입은 논리 값인 `true`와 `false`를 나타냅니다.

예/아니오(yes-or-no) 질문에 답하는 함수나 `while`, `if`, `when`의 조건식에서 `Boolean` 값을 사용합니다.

## `Boolean` 변수 선언 {id="declare-a-boolean-variable"}

`Boolean` 변수를 선언하려면 `true` 또는 `false`를 할당합니다.

`Boolean` 타입을 명시적으로 지정하거나 Kotlin이 값으로부터 추론하도록 할 수 있습니다.

```kotlin
val isTrue: Boolean = true
val isFalse = false // Kotlin이 Boolean으로 추론
```

값이 `null`일 수 있는 경우 `Boolean?`를 사용합니다.

```kotlin
val isEnabled: Boolean? = null
```

> `Boolean` 변수에는 정수 값을 할당할 수 없습니다.
> Kotlin에서 `0`과 `1`은 `Boolean` 값이 아닙니다.
>
{style="note"}

## `Boolean` 값 생성 {id="produce-boolean-values"}

비교식과 함수를 사용하여 `Boolean` 값을 생성할 수 있습니다.

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

이 결과를 조건문이나 다른 표현식에서도 사용할 수 있습니다.

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

## `Boolean` 연산 {id="boolean-operations"}

Kotlin은 `Boolean` 값을 다루기 위한 연산자와 중위 함수(infix function)를 제공합니다.
이를 사용하여 `Boolean` 값을 반전시키거나 여러 `Boolean` 값을 결합하여 하나의 결과로 만들 수 있습니다.

### 부정 (NOT) {id="negation-not"}

NOT 연산자는 `Boolean` 값을 반전시킵니다.

NOT을 사용하려면 `Boolean` 값 앞에 `!` 연산자를 배치합니다.

```kotlin
val isOn = true
val isOff = !isOn // isOff는 false
```

### 논리 AND {id="logical-and"}

AND 연산자는 두 피연산자가 모두 `true`인 경우에만 `true`를 반환합니다.

논리 AND를 사용하려면 피연산자 사이에 `&&` 연산자를 배치합니다.

```kotlin
val a = false && false // false
val b = false && true // false
val c = true && false // false
val d = true && true  // true
```

> 첫 번째 피연산자가 `false`이면 `&&` 연산자는 두 번째 피연산자의 평가를 건너뜁니다.
> 두 피연산자를 모두 평가하려면 대신 `and` [중위 함수](functions.md#infix-notation)를 사용하세요.
>
{style="note"}

### 논리 OR {id="logical-or"}

OR 연산자는 피연산자 중 하나 이상이 `true`이면 `true`를 반환합니다.

논리 OR를 사용하려면 피연산자 사이에 `||` 연산자를 배치합니다.

```kotlin
val a = false || false // false
val b = false || true  // true
val c = true || false  // true
val d = true || true   // true
```

> 첫 번째 피연산자가 `true`이면 `||` 연산자는 두 번째 피연산자의 평가를 건너뜁니다.
> 두 피연산자를 모두 평가하려면 대신 `or` [중위 함수](functions.md#infix-notation)를 사용하세요.
>
{style="note"}

### 배타적 OR (XOR) {id="exclusive-or-xor"}

배타적 OR(XOR) 연산은 피연산자의 값이 서로 다를 때 `true`를 반환합니다.

XOR을 사용하려면 피연산자 사이에 `xor`를 작성합니다.

```kotlin
val a = false xor false // false
val b = false xor true  // true
val c = true xor false  // true
val d = true xor true   // false
```

> `xor`은 연산자가 아니라 [중위 함수](functions.md#infix-notation)입니다.
>
> `Boolean` 함수에 대한 자세한 내용은 [API 레퍼런스](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-boolean/)에서 확인하세요.
>
{style="note"}

## 연산자 우선순위 {id="operator-precedence"}

표현식에 여러 논리 연산이 포함되어 있고 평가 순서를 지정하는 괄호가 없는 경우, Kotlin은 우선순위 규칙을 적용합니다. 우선순위가 높은 연산이 우선순위가 낮은 연산보다 먼저 평가됩니다.

이 섹션에서 설명한 `Boolean` 연산의 우선순위는 다음과 같습니다.

1. `!`
2. `xor` (및 기타 중위 함수)
3. `&&`
4. `||`

다음 예제에서 컴파일러는 `||`보다 `&&`를 먼저 평가합니다.

```kotlin
fun main() {
//sampleStart
    val result = true || false && false
    println(result) // true
//sampleEnd    
}
```
{kotlin-runnable="true" validate="false"}

평가 순서를 명확하게 지정하려면 괄호를 사용하세요.

```kotlin
fun main() {
//sampleStart
    val result = (true || false) && false
    println(result) // false
//sampleEnd    
}
```
{kotlin-runnable="true" validate="false"}

## 조건문에서의 `Boolean` {id="boolean-in-conditions"}

[`if`](control-flow.md#if-expression), [`when`](control-flow.md#when-expressions-and-statements), 그리고 [`while`](control-flow.md#while-loops)은 `Boolean` 표현식을 평가하여 프로그램 흐름을 제어합니다.

### `if` 표현식 {id="if-expressions"}

```kotlin
fun main() {
//sampleStart
    val number = 4
    val isEven = number % 2 == 0

    // 조건식이 이미 `Boolean` 타입입니다.
    // `true` 또는 `false`와 비교할 필요가 없습니다.
    if (isEven) { 
        println("The number is even.")
    } else {
        println("The number is odd.")
    }
//sampleEnd    
}
```
{kotlin-runnable="true"}

### `when` 표현식 {id="when-expressions"}

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

### `while` 루프 {id="while-loops"}

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