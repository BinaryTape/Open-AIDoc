[//]: # (title: 배열)

배열은 동일한 타입 또는 그 하위 타입의 값을 고정된 수만큼 보유하는 데이터 구조입니다. 
Kotlin에서 가장 일반적인 배열 타입은 [`Array`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/) 클래스로 표현되는 객체 타입 배열입니다.

> 객체 타입 배열에서 원시 타입(primitives)을 사용하면, 원시 타입이 객체로 [박싱(boxed)](https://docs.oracle.com/javase/tutorial/java/data/autoboxing.html)되기 때문에 성능에 영향을 미칩니다. 박싱 오버헤드를 피하려면 대신 [원시 타입 배열](#primitive-type-arrays)을 사용하세요.
>
{style="note"}

## 배열 사용 시기

Kotlin에서 배열은 충족해야 할 특수한 로우레벨(low-level) 요구사항이 있을 때 사용합니다. 예를 들어, 일반적인 애플리케이션에 필요한 수준 이상의 성능 요구사항이 있거나, 커스텀 데이터 구조를 구축해야 하는 경우입니다. 이러한 제약 사항이 없다면 대신 [컬렉션(collections)](collections-overview.md)을 사용하세요.

컬렉션은 배열과 비교하여 다음과 같은 장점이 있습니다:
* 컬렉션은 읽기 전용으로 설정할 수 있어 더 많은 제어 권한을 제공하며, 명확한 의도를 가진 견고한 코드를 작성할 수 있게 해줍니다.
* 컬렉션은 요소를 추가하거나 제거하기 쉽습니다. 이에 반해 배열은 크기가 고정되어 있습니다. 배열에서 요소를 추가하거나 제거하는 유일한 방법은 매번 새로운 배열을 생성하는 것인데, 이는 매우 비효율적입니다:

  ```kotlin
  fun main() {
  //sampleStart
      var riversArray = arrayOf("Nile", "Amazon", "Yangtze")

      // += 할당 연산을 사용하면 새로운 riversArray를 생성하고,
      // 기존 요소들을 복사한 뒤 "Mississippi"를 추가합니다.
      riversArray += "Mississippi"
      println(riversArray.joinToString())
      // Nile, Amazon, Yangtze, Mississippi
  //sampleEnd
  }
  ```
  {kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-rivers-array-kotlin"}

* 동등성 연산자(`==`)를 사용하여 컬렉션이 구조적으로 동일한지 확인할 수 있습니다. 배열에는 이 연산자를 사용할 수 없습니다. 대신 특별한 함수를 사용해야 하며, 이에 대한 자세한 내용은 [배열 비교](#compare-arrays)에서 확인할 수 있습니다.

컬렉션에 대한 자세한 정보는 [컬렉션 개요](collections-overview.md)를 참조하세요.

## 배열 생성

Kotlin에서 배열을 생성하려면 다음을 사용할 수 있습니다:
* [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html), [`arrayOfNulls()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of-nulls.html#kotlin$arrayOfNulls(kotlin.Int)) 또는 [`emptyArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/empty-array.html)와 같은 함수.
* `Array` 생성자.

이 예제는 [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html) 함수를 사용하고 아이템 값들을 전달합니다:

```kotlin
fun main() {
//sampleStart
    // [1, 2, 3] 값을 가진 배열을 생성합니다.
    val simpleArray = arrayOf(1, 2, 3)
    println(simpleArray.joinToString())
    // 1, 2, 3
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-simple-array-kotlin"}

이 예제는 [`arrayOfNulls()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of-nulls.html#kotlin$arrayOfNulls(kotlin.Int)) 함수를 사용하여 지정된 크기의 `null` 요소로 채워진 배열을 생성합니다:

```kotlin
fun main() {
//sampleStart
    // [null, null, null] 값을 가진 배열을 생성합니다.
    val nullArray: `Array<Int?>` = arrayOfNulls(3)
    println(nullArray.joinToString())
    // null, null, null
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-null-array-kotlin"}

이 예제는 [`emptyArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/empty-array.html) 함수를 사용하여 빈 배열을 생성합니다:

```kotlin
    var exampleArray = emptyArray<String>()
```

> Kotlin의 타입 추론 덕분에 할당문의 왼쪽 또는 오른쪽에서 빈 배열의 타입을 지정할 수 있습니다.
>
> 예시:
> ```Kotlin
> var exampleArray = emptyArray<String>()
> 
> var exampleArray: `Array<String>` = emptyArray()
>```
>
{style="note"}

`Array` 생성자는 배열의 크기와 인덱스가 주어졌을 때 배열 요소의 값을 반환하는 함수를 인자로 받습니다:

```kotlin
fun main() {
//sampleStart
    // 0으로 초기화된 [0, 0, 0] Array<Int>를 생성합니다.
    val initArray = Array<Int>(3) { 0 }
    println(initArray.joinToString())
    // 0, 0, 0

    // ["0", "1", "4", "9", "16"] 값을 가진 Array<String>을 생성합니다.
    val asc = Array(5) { i -> (i * i).toString() }
    asc.forEach { print(it) }
    // 014916
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-array-constructor-kotlin"}

> 대부분의 프로그래밍 언어와 마찬가지로 Kotlin에서 인덱스는 0부터 시작합니다.
>
{style="note"}

### 중첩 배열

배열은 서로 중첩되어 다차원 배열을 생성할 수 있습니다:

```kotlin
fun main() {
//sampleStart
    // 2차원 배열을 생성합니다.
    val twoDArray = Array(2) { Array<Int>(2) { 0 } }
    println(twoDArray.contentDeepToString())
    // [[0, 0], [0, 0]]

    // 3차원 배열을 생성합니다.
    val threeDArray = Array(3) { Array(3) { Array<Int>(3) { 0 } } }
    println(threeDArray.contentDeepToString())
    // [[[0, 0, 0], [0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]]]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-multidimensional-array-kotlin"}

> 중첩된 배열이 반드시 동일한 타입이거나 동일한 크기일 필요는 없습니다.
>
{style="note"}

## 요소 접근 및 수정

배열은 항상 가변(mutable)입니다. 배열의 요소에 접근하고 수정하려면 [인덱스 접근 연산자(indexed access operator)](operator-overloading.md#indexed-access-operator) `[]`를 사용하세요:

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)
    val twoDArray = Array(2) { Array<Int>(2) { 0 } }

    // 요소에 접근하고 수정합니다.
    simpleArray[0] = 10
    twoDArray[0][0] = 2

    // 수정된 요소를 출력합니다.
    println(simpleArray[0].toString()) // 10
    println(twoDArray[0][0].toString()) // 2
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-access-array-kotlin"}

Kotlin의 배열은 _무공변(invariant)_입니다. 즉, 런타임 실패를 방지하기 위해 Kotlin은 `Array<String>`을 `Array<Any>`에 할당하는 것을 허용하지 않습니다. 대신 `Array<out Any>`를 사용할 수 있습니다. 자세한 내용은 [타입 프로젝션(Type Projections)](generics.md#type-projections)을 참조하세요.

## 배열 작업

Kotlin에서는 배열을 사용하여 함수에 가변적인 개수의 인자를 전달하거나 배열 자체에 대한 연산을 수행할 수 있습니다. 예를 들어 배열 비교, 콘텐츠 변환 또는 컬렉션으로의 변환 등이 있습니다.

### 함수에 가변 인자 전달

Kotlin에서는 [`vararg`](functions.md#variable-number-of-arguments-varargs) 파라미터를 통해 함수에 가변적인 개수의 인자를 전달할 수 있습니다. 이는 메시지를 포맷팅하거나 SQL 쿼리를 생성할 때와 같이 인자의 개수를 미리 알 수 없을 때 유용합니다.

가변 인자를 받는 함수에 배열을 전달하려면 _스프레드(spread)_ 연산자(`*`)를 사용하세요. 스프레드 연산자는 배열의 각 요소를 개별 인자로 함수에 전달합니다:

```kotlin
fun main() {
    val lettersArray = arrayOf("c", "d")
    printAllStrings("a", "b", *lettersArray)
    // abcd
}

fun printAllStrings(vararg strings: String) {
    for (string in strings) {
        print(string)
    }
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-vararg-array-kotlin"}

자세한 내용은 [가변 인자 (varargs)](functions.md#variable-number-of-arguments-varargs)를 참조하세요.

### 배열 비교

두 배열이 동일한 순서로 동일한 요소를 가지고 있는지 비교하려면 [`.contentEquals()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/content-equals.html) 및 [`.contentDeepEquals()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/content-deep-equals.html) 함수를 사용하세요:

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)
    val anotherArray = arrayOf(1, 2, 3)

    // 배열의 콘텐츠를 비교합니다.
    println(simpleArray.contentEquals(anotherArray))
    // true

    // 중위 표기법을 사용하여, 요소가 변경된 후 
    // 배열의 콘텐츠를 비교합니다.
    simpleArray[0] = 10
    println(simpleArray contentEquals anotherArray)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-compare-array-kotlin"}

> 배열의 콘텐츠를 비교할 때 동등성(`==`) 및 부등성(`!=`) [연산자](equality.md#structural-equality)를 사용하지 마세요. 이 연산자들은 할당된 변수가 동일한 객체를 가리키는지를 확인합니다.
> 
> Kotlin에서 배열이 이렇게 동작하는 이유에 대해 자세히 알아보려면 [블로그 포스트](https://blog.jetbrains.com/kotlin/2015/09/feedback-request-limitations-on-data-classes/#Appendix.Comparingarrays)를 확인하세요.
> 
{style="warning"}

### 배열 변환

Kotlin에는 배열을 변환하는 유용한 함수가 많이 있습니다. 이 문서에서는 몇 가지만 강조하지만, 이것이 전체 목록은 아닙니다. 전체 함수 목록은 [API 레퍼런스](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/)를 참조하세요.

#### 합계 (Sum)

배열의 모든 요소의 합을 반환하려면 [`.sum()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sum.html) 함수를 사용하세요:

```Kotlin
fun main() {
//sampleStart
    val sumArray = arrayOf(1, 2, 3)

    // 배열 요소를 합산합니다.
    println(sumArray.sum())
    // 6
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-sum-array-kotlin"}

> `.sum()` 함수는 `Int`와 같은 [숫자 데이터 타입](numbers.md)의 배열에만 사용할 수 있습니다.
>
{style="note"}

#### 셔플 (Shuffle)

배열의 요소를 무작위로 섞으려면 [`.shuffle()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/shuffle.html) 함수를 사용하세요:

```Kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)

    // 요소를 섞습니다 [3, 2, 1]
    simpleArray.shuffle()
    println(simpleArray.joinToString())

    // 요소를 다시 섞습니다 [2, 3, 1]
    simpleArray.shuffle()
    println(simpleArray.joinToString())
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-shuffle-array-kotlin"}

### 배열을 컬렉션으로 변환

어떤 API는 배열을 사용하고 어떤 API는 컬렉션을 사용하는 환경에서 작업한다면, 배열을 [컬렉션(collections)](collections-overview.md)으로 변환하거나 그 반대로 변환할 수 있습니다.

#### List 또는 Set으로 변환

배열을 `List` 또는 `Set`으로 변환하려면 [`.toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-list.html) 및 [`.toSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-set.html) 함수를 사용하세요.

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf("a", "b", "c", "c")

    // Set으로 변환합니다.
    println(simpleArray.toSet())
    // [a, b, c]

    // List로 변환합니다.
    println(simpleArray.toList())
    // [a, b, c, c]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-convert-list-set-kotlin"}

#### Map으로 변환

배열을 `Map`으로 변환하려면 [`.toMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-map.html) 함수를 사용하세요.

[`Pair<K,V>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-pair/)의 배열만 `Map`으로 변환할 수 있습니다. `Pair` 인스턴스의 첫 번째 값은 키가 되고, 두 번째 값은 값이 됩니다. 이 예제는 [중위 표기법(infix notation)](functions.md#infix-notation)을 사용하여 [`to`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/to.html) 함수를 호출해 `Pair` 튜플을 생성합니다:

```kotlin
fun main() {
//sampleStart
    val pairArray = arrayOf("apple" to 120, "banana" to 150, "cherry" to 90, "apple" to 140)

    // Map으로 변환합니다.
    // 키는 과일 이름이고 값은 칼로리입니다.
    // 키는 유일해야 하므로, "apple"의 마지막 값이
    // 첫 번째 값을 덮어씁니다.
    println(pairArray.toMap())
    // {apple=140, banana=150, cherry=90}

//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-convert-map-kotlin"}

## 원시 타입 배열

`Array` 클래스를 원시 타입 값과 함께 사용하면, 이 값들은 객체로 박싱됩니다. 대안으로, 박싱 오버헤드의 부작용 없이 원시 타입을 배열에 저장할 수 있게 해주는 원시 타입 배열을 사용할 수 있습니다:

| 원시 타입 배열 | Java에서의 대응 항목 |
|---|----------------|
| [`BooleanArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-boolean-array/) | `boolean[]`|
| [`ByteArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-byte-array/) | `byte[]`|
| [`CharArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-char-array/) | `char[]`|
| [`DoubleArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-double-array/) | `double[]`|
| [`FloatArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-float-array/) | `float[]`|
| [`IntArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int-array/) | `int[]`|
| [`LongArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-long-array/) | `long[]`|
| [`ShortArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-short-array/) | `short[]`|

이 클래스들은 `Array` 클래스와 상속 관계가 없지만, 동일한 함수와 프로퍼티 세트를 가지고 있습니다.

이 예제는 `IntArray` 클래스의 인스턴스를 생성합니다:

```kotlin
fun main() {
//sampleStart
    // 크기가 5이고 값이 0으로 초기화된 Int 배열을 생성합니다.
    val exampleArray = IntArray(5)
    println(exampleArray.joinToString())
    // 0, 0, 0, 0, 0
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-primitive-type-array-kotlin"}

> 원시 타입 배열을 객체 타입 배열로 변환하려면 [`.toTypedArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-typed-array.html) 함수를 사용하세요.
> 
> 객체 타입 배열을 원시 타입 배열로 변환하려면 [`.toBooleanArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-boolean-array.html), [`.toByteArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-byte-array.html), [`.toCharArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-char-array.html) 등을 사용하세요.
> 
{style="note"}

## 다음 단계

* 왜 대부분의 경우에 컬렉션 사용을 권장하는지 알아보려면 [컬렉션 개요](collections-overview.md)를 읽어보세요.
* 다른 [기본 타입](types-overview.md)에 대해 알아보세요.
* Java 개발자라면 [컬렉션에 대한 Java에서 Kotlin으로의 마이그레이션 가이드](java-to-kotlin-collections-guide.md)를 읽어보세요.