[//]: # (title: 숫자)
[//]: # (description: 숫자 타입, 리터럴, 변환, 산술 연산, 오버플로 및 JVM 관련 동작을 포함하여 코틀린에서 숫자를 사용하는 방법에 대해 알아봅니다.)

코틀린 숫자 타입은 다음을 나타냅니다:
* 정수 값 ([Byte](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-byte/),
  [Short](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-short/),
  [Int](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-int/),
  및 [Long](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-long/))
* 부동 소수점 값 ([Float](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-float/)
  및 [Double](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-double/))

숫자 타입은 산술 연산, 카운터, 측정 및 기타 계산과 같이 숫자 데이터를 저장하고 처리하는 데 사용됩니다.

## 숫자 타입 선택하기 {id="choose-a-number-type"}

대부분의 경우, 다음 규칙을 참고하여 작업에 적합한 숫자 타입을 결정할 수 있습니다:

* 정수에는 `Int`를 사용하세요.
* `Int` 범위를 벗어나는 정수에는 `Long`을 사용하세요.
* 소수점이 있는 숫자에는 `Double`을 사용하세요.
* 낮은 정밀도가 허용되거나 필요한 경우에는 `Float`을 사용하세요.
* API나 데이터 포맷에서 요구하는 경우 `Byte`와 `Short`를 사용하세요.

> 코틀린은 베타 기능으로 [](unsigned-integer-types.md)도 제공합니다.
>
{style="tip"}

## 정수 타입 {id="integer-types"}

코틀린은 크기와 값의 범위가 다른 네 가지 정수 타입을 제공합니다:

| 타입 | 크기 (비트) | 최솟값 | 최댓값 |
|----------|-------------|----------------------------------------------|------------------------------------------------|
| `Byte` | 8 | -128 | 127 |
| `Short` | 16 | -32768 | 32767 |
| `Int` | 32 | -2,147,483,648 (-2<sup>31</sup>) | 2,147,483,647 (2<sup>31</sup> - 1) |
| `Long` | 64 | -9,223,372,036,854,775,808 (-2<sup>63</sup>) | 9,223,372,036,854,775,807 (2<sup>63</sup> - 1) |

### 정수 값 선언 {id="declare-integer-values"}

코틀린은 정수 값에 대해 다음과 같은 리터럴 형태를 지원합니다:

* 10진수: `123`
* 16진수: `0x0F`
* 2진수: `0b00001011`

> 코틀린은 8진수 리터럴을 지원하지 않습니다.
>
{style="note"}

숫자 값을 선언하려면 타입을 명시적으로 지정하세요: 

```kotlin
val one: Int = 1

// 가독성을 높이기 위해 밑줄 사용
val oneBillion: Long = 1_000_000_000
val hexBytes: Int = 0x7F_EC_DE_5E
val bytes: Int = 0b01010010_01101001_10010100_10010010

val oneByte: Byte = 1
val oneShort: Short = 1
```

`Long` 값을 선언하기 위해 접미사 `L`을 붙일 수도 있습니다:

```kotlin
val oneLong = 1L
```

숫자 타입을 명시적으로 선언하면, 컴파일러는 해당 값이 그 타입의 범위에 맞는지 확인합니다:

```kotlin
// 값이 Byte에 맞음
val oneByte: Byte = 1

// 오류: 값이 Byte 범위를 벗어남
val tooBig: Byte = 128
```

숫자 타입을 지정하지 않으면, 값이 `Int` 범위에 맞는 경우 코틀린은 `Int`로 추론합니다. 그렇지 않으면 `Long`으로 추론합니다:

```kotlin
val million = 1_000_000 // Int
val threeBillion = 3_000_000_000 // Long
```

값이 없을 수 있는 경우, nullable 타입을 사용하세요:

```kotlin
val maybeAbsent: Int? = null
```

## 부동 소수점 타입 {id="floating-point-types"}

소수 부분이 있는 숫자의 경우, 코틀린은 `Float`와 `Double`을 제공합니다.

부동 소수점 타입은 [IEEE 754 표준](https://en.wikipedia.org/wiki/IEEE_754)을 따릅니다.
`Float`는 *단정밀도(single precision)*를 반영하며, `Double`은 *배정밀도(double precision)*를 반영합니다.

부동 소수점 타입은 크기와 정밀도가 다릅니다:

| 타입 | 크기 (비트) | 유효 비트 | 지수 비트 | 10진수 자릿수 |
|----------|-------------|------------------|---------------|----------------|
| `Float` | 32 | 24 | 8 | 6-7 |
| `Double` | 64 | 53 | 11 | 15-16 |    

### 부동 소수점 값 선언 {id="declare-floating-point-values"}

부동 소수점 리터럴을 선언하려면 소수점(`.`)을 포함하거나 지수 표기법을 사용하세요:

```kotlin
val pi = 3.14
val avogadro = 6.02214076e23
```

기본적으로 코틀린은 부동 소수점 리터럴을 `Double`로 추론합니다. 
`Float`를 선언하려면 접미사 `f` 또는 `F`를 추가하세요:

```kotlin
val pi = 3.14 // Double
val eFloat = 2.7182817f // Float
```

> 코틀린은 `Float`가 저장할 수 있는 것보다 더 높은 정밀도를 가진 `Float` 리터럴을 반올림합니다.
>
{style="note"}

값이 없을 수 있는 경우, nullable 타입을 사용하세요:

```kotlin
val maybeAbsent: Double? = null
```

## 산술 연산 {id="arithmetic-operations"}

코틀린은 숫자에 대해 표준 산술 연산인 `+`, `-`, `*`, `/`, `%`를 지원합니다.

일반적인 계산을 수행하려면 다음 연산자들을 사용하세요:

```kotlin
fun main() {
//sampleStart
    println(1 + 2) // 3
    println(2_500_000_000L - 1L) // 2499999999
    println(3.14 * 2.71) // 8.5094
    println(10.0 / 3) // 3.3333333333333335
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

결과 타입은 피연산자의 타입에 따라 달라집니다. 자세한 내용은 [](#mixed-numeric-expressions)에서 알아보세요.

> 커스텀 숫자 클래스에서 이러한 연산자를 오버라이드할 수 있습니다.
> 자세한 내용은 [연산자 오버로딩](operator-overloading.md)을 참고하세요.
>
{style="tip"}

### 정수 나눗셈 {id="integer-division"}

정수 값 간의 나눗셈은 항상 정수 결과를 반환합니다. 컴파일러는 소수 부분을 버립니다:

```kotlin
fun main() {
//sampleStart
    val intValue = 5 / 2
    println(intValue) // 2
    
    val longValue = 5L / 2
    println(longValue) // 2
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

부동 소수점 결과를 반환하려면 피연산자 중 적어도 하나를 `Float` 또는 `Double`로 만드세요:

```kotlin
fun main() {
//sampleStart
    val a = 5 / 2.0
    println(a) // 2.5
    
    val b = 5 / 2.toDouble()
    println(b) // 2.5
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## 타입 변환 {id="type-conversion"}

숫자 타입은 서로의 하위 타입이 아닙니다. 코틀린은 암시적인 데이터 손실과 예기치 않은 동작을 피하기 위해 명시적 변환을 요구합니다.

예를 들어, `Double`을 기대하는 함수는 변환 없이 `Int`나 `Float` 값을 받을 수 없습니다:

```kotlin
fun main() {
//sampleStart
    fun printDouble(x: Double) { 
        print(x) 
    }

    val x = 1.0
    val xInt = 1
    val xFloat = 1.0f
    val one: Double = 1 // 오류: 초기화 타입 불일치

    printDouble(x) // OK
    printDouble(xInt) // 오류: 인수 타입 불일치
    printDouble(xFloat) // 오류: 인수 타입 불일치
//sampleEnd
}
```
{kotlin-runnable="true" validate="false"}

모든 숫자 타입은 다른 숫자 타입으로의 변환을 지원합니다.
숫자를 다른 타입으로 변환하려면 명시적 변환 함수를 사용하세요:

* `toByte()`
* `toShort()`
* `toInt()`
* `toLong()`
* `toFloat()`
* `toDouble()`

예를 들어, 다음 코드는 `Int` 값을 `Double`로 변환합니다:

```kotlin
fun main() {
//sampleStart
    val intValue: Int = 1
    val doubleValue = intValue.toDouble()
    
    println(doubleValue) // 1.0
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

부동 소수점 값을 정수 타입으로 변환할 때, 컴파일러는 소수 부분을 버립니다:

```kotlin
fun main() {
//sampleStart
    val d: Double = 1.5
    val l: Long = d.toLong()
    
    println(l) // 1
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 혼합 숫자 표현식 {id="mixed-numeric-expressions"}

코틀린은 할당이나 함수 인수에 대해 암시적 변환을 지원하지 않습니다. 
하지만 산술 표현식에서는 서로 다른 숫자 타입을 결합할 수 있습니다. 이러한 경우, 
코틀린은 피연산자 타입을 기반으로 결과 타입을 결정하며, 
산술 연산자가 변환을 자동으로 처리합니다:

```kotlin
val intNumber: Int = 1
val longNumber: Long = 1000
val result = intNumber + longNumber // 1001, Long
```

결과를 더 작은 타입에 할당하려고 하면 컴파일러가 오류를 보고합니다:

```kotlin
val intNumber: Int = 1
val longNumber: Long = 1000
val result: Int = intNumber + longNumber 
// 오류: 초기화 타입 불일치
```

### 정수 리터럴 타입 {id="integer-literal-types"}

타입 추론 중에 코틀린은 접미사가 없는 정수 리터럴을 주변 문맥이 특정 타입을 결정할 때까지 특별한 [정수 리터럴 타입(Integer Literal Type, ILT)](https://kotlinlang.org/spec/type-system.html#integer-literal-types)으로 취급합니다:

```kotlin
//sampleStart
fun List<Any>.log() {
    println(joinToString(" | ") { it::class.simpleName ?: "Unknown" })
}

fun main() {
    listOf(1, 2).log()
    // Int | Int
    
    listOf(1L, 2L).log()
    // Long | Long
    
    // 컴파일러는 1을 ILT로 해석하고 Long으로 결정합니다
    listOf(1, 2L).log()
    // Long | Long
    
    // .toInt()는 리터럴을 Int로 변환합니다
    listOf(1.toInt(), 2L).log()
    // Int | Long
}
//sampleEnd
```
{kotlin-runnable="true"}

런타임에 동일한 문자열 표현을 가지기 때문에 `Int`와 `Long` 값을 혼동하기 특히 쉽습니다. 이를 피하려면 예상되는 타입을 지정하거나 값을 명시적으로 변환하세요:

```kotlin
//sampleStart
fun List<Any>.log() {
    println(joinToString(" | ") { it::class.simpleName ?: "Unknown" })
}

fun main() {
    val longValues: List<Long> = listOf(1, 2L)
    longValues.log()
    // Long | Long

    val numberValues: List<Number> = listOf(1.toInt(), 2L)
    numberValues.log()
    // Int | Long
}
//sampleEnd
```
{kotlin-runnable="true"}

의도하지 않은 타입 추론을 방지하기 위해 명시적 타입을 사용할 수도 있습니다:

```kotlin
fun main() {
//sampleStart
    val intValues: List<Int> = listOf(1, 2L)
    // 오류: 초기화 타입 불일치
//sampleEnd
}
```
{kotlin-runnable="true" validate="false"}

> [정수 리터럴 타입](https://kotlinlang.org/spec/type-system.html#integer-literal-types)에 대해 더 자세히 알아보세요.
> 
{style="tip"}

## 데이터 오버플로 {id="data-overflow"}

숫자 타입은 정의된 범위 내의 값만 표현할 수 있습니다.

연산 결과가 해당 범위를 벗어나면 오버플로가 발생합니다. 
값을 더 작은 숫자 타입으로 변환하면 변환된 값이 원래의 숫자 값을 유지하지 못할 수 있습니다.

이러한 동작은 컴파일러가 허용하더라도 코드 결과에 영향을 줄 수 있습니다.

### 연산에서의 오버플로 {id="overflow-in-operations"}

각 정수 타입은 정의된 범위 내의 값만 저장할 수 있습니다. 산술 연산 결과가 그 범위를 초과하면 *데이터 오버플로(data overflow)*가 발생합니다:

```kotlin
fun main(){
//sampleStart
    val intNumber: Int = 2147483647
    // Int 최댓값은 2147483647입니다.
    println(intNumber + 1) // -2147483648
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

여기서 결과는 값이 더 이상 `Int`에 맞지 않기 때문에 순환(wrap around)합니다.

> 컴파일러는 정수 오버플로가 발생할 때 자동으로 오류를 생성하지 않습니다.
>
{style="note"}

### 부정 연산에서의 오버플로 {id="overflow-in-negation"}

부정(negation) 연산 중에도 오버플로가 발생할 수 있습니다. 
예를 들어, `Int.MIN_VALUE`의 양수 대응값은 `Int`로 표현할 수 없습니다.

```kotlin
fun main(){
//sampleStart
    val min = Int.MIN_VALUE
    println(-min) // -2147483648
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 축소 변환 {id="narrowing-conversions"}

값을 더 작은 정수 타입으로 변환할 때, 
결과가 원래의 숫자 값을 유지하지 못할 수 있습니다:

```kotlin
fun main() {
//sampleStart
    val large: Int = 130
    val narrowed: Byte = large.toByte()

    println(narrowed) // -126
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

하지만 부동 소수점 타입은 [IEEE 754 표준](https://en.wikipedia.org/wiki/IEEE_754)을 따르므로, 매우 큰 결과는 `Infinity`가 될 수 있습니다:

```kotlin
fun main() {
//sampleStart
    println(Double.MAX_VALUE * 2) // Infinity
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## 비트 연산 {id="bitwise-operations"}

코틀린은 `Int`와 `Long`에 대해 *비트 연산(bitwise operations)*을 제공합니다. 이러한 연산은 일련의 [중위 함수(infix functions)](functions.md#infix-notation)와 `inv()`로 표현됩니다.

```kotlin
fun main() {
//sampleStart
    val x = 1
    
    println(x shl 2) // 4
    println(x and 0x000FF000) // 0
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

비트 연산은 다음과 같습니다:

* `shl()` – 부호 있는 왼쪽 시프트 (signed shift left)
* `shr()` – 부호 있는 오른쪽 시프트 (signed shift right)
* `ushr()` – 부호 없는 오른쪽 시프트 (unsigned shift right)
* `and()` – 비트 단위 AND
* `or()` – 비트 단위 OR
* `xor()` – 비트 단위 XOR
* `inv()` – 비트 단위 반전 (bitwise inversion)

## 부동 소수점 숫자 비교 {id="floating-point-number-comparison"}

코틀린에서 부동 소수점 비교는 피연산자의 정적 타입에 따라 달라집니다.

피연산자가 `Float` 또는 `Double`로 정적으로 알려진 경우, 숫자와 숫자가 형성하는 범위에 대한 연산은 [IEEE 754 부동 소수점 산술 표준](https://en.wikipedia.org/wiki/IEEE_754)을 따릅니다.

하지만 제네릭 사용 사례(예: `Any`, `Comparable<...>`, 또는 `Collection<T>`)에서는 부동 소수점 숫자로 정적 타입이 지정되지 않은 피연산자에 대해 동작이 다릅니다. 이 경우 코틀린은 `Float`와 `Double`에 대한 `equals()` 및 `compareTo()` 구현을 사용합니다. 

그 결과:

* `NaN`은 자기 자신과 같은 것으로 간주됩니다.
* `NaN`은 `POSITIVE_INFINITY`를 포함한 다른 모든 요소보다 큰 것으로 간주됩니다.
* `-0.0`은 `0.0`보다 작은 것으로 간주됩니다.

다음 예제는 정적으로 부동 소수점 숫자로 타입이 지정된 피연산자와 제네릭 타입을 통해 사용되는 피연산자 간의 차이를 보여줍니다:

```kotlin
//sampleStart  
fun generalizedEquals(a: Any, b: Any): Boolean {
    return a == b
}

fun main() {
    // 피연산자가 정적으로 부동 소수점 숫자로 타입 지정됨
    println(Double.NaN == Double.NaN) // false
    println(0.0 == -0.0) // true

    // 피연산자가 부동 소수점이 아닌 정적 타입을 통해 사용됨
    println(generalizedEquals(Double.NaN, Double.NaN)) // true
    println(generalizedEquals(0.0, -0.0)) // false
}
//sampleEnd  
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-numbers-floating-comp"}

## JVM에서의 숫자 박싱 및 캐싱 {id="boxing-and-caching-numbers-on-the-jvm"}

JVM에서 null이 될 수 없는 숫자 값은 보통 `int`, `long`, `double`과 같은 기본 타입(primitive types)을 사용하여 저장됩니다.
하지만 [제네릭 타입](generics.md)이나 `Int?`와 같은 nullable 숫자 타입을 사용할 때, 값은 박싱되어 객체로 표현됩니다.

JVM은 작은 숫자의 박싱된 표현을 캐싱하여 [메모리 최적화 기법](https://docs.oracle.com/javase/specs/jls/se22/html/jls-5.html#jls-5.1.7)을 적용합니다. 결과적으로, 동일한 값을 가진 박싱된 숫자들은 [참조 동등성(referential equality)](equality.md#referential-equality)을 가질 수 있습니다.

예를 들어, JVM은 `-128`에서 `127` 사이의 범위에 있는 박싱된 `Integer` 값을 캐싱합니다. 따라서 다음 코드는 `true`를 반환합니다:

```kotlin
fun main() {
//sampleStart
    val score: Int = 100
    val savedScore: Int? = score
    val displayedScore: Int? = score
    
    println(savedScore === displayedScore) // true
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false"}

캐싱된 범위를 벗어나는 값의 경우, 박싱된 값들은 별개의 객체입니다. 이 경우 값이 [구조적 동등성(structural equality)](equality.md#structural-equality)을 가지더라도 참조 동등성은 성립하지 않습니다. 이러한 이유로 숫자 값을 비교할 때는 `==`를 사용하세요:

```kotlin
fun main() {
//sampleStart
    val score: Int = 10000
    val savedScore: Int? = score
    val displayedScore: Int? = score

    println(savedScore === displayedScore) // false
    println(savedScore == displayedScore) // true
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false"}