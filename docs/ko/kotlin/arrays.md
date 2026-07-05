[//]: # (title: 배열)
[//]: # (description: Kotlin에서 배열을 생성, 접근, 수정, 비교 및 변환하는 방법을 알아봅니다.)

배열은 동일한 타입 또는 그 하위 타입의 값을 고정된 수만큼 보유하는 데이터 구조입니다.
배열의 요소는 순서가 정해져 있으며 인덱스로 접근할 수 있습니다.

Kotlin은 [`Array<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/) 클래스와 [원시 타입 배열](#원시-타입-배열)을 제공합니다.

## 배열 사용 시기

Java API와의 상호 운용성이 필요하거나 로우레벨(low-level) 요구사항이 있는 경우에 배열을 사용하세요. 예를 들어, 일반적인 애플리케이션에 필요한 수준 이상의 성능 요구사항이 있거나 커스텀 데이터 구조를 구축해야 하는 경우입니다.

대부분의 유스케이스에서는 대신 [컬렉션(collections)](collections-overview.md)을 사용하세요.

| 기능 | 배열 | 컬렉션 |
|-----------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------|
| 크기 | 고정됨 | 타입에 따라 다름 |
| 읽기 전용 변체 | 없음, 항상 가변(mutable) | 있음 (`List` 및 `Set`) |
| 요소 추가 및 제거 | 기본 지원 없음.<br/> 새로운 배열을 할당하고 복사해야 함 | 있음 (가변 컬렉션) |
| `==`를 통한 구조적 동등성 | 아니요, 참조를 비교합니다.<br/> 대신 [`.contentEquals()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/content-equals.html)를 사용하세요 | 예 |
| 원시 타입 값 | 원시 타입 배열은 박싱(boxing) 없이<br/> 값을 저장함 | 일반적으로 박싱됨 |
| Java 상호 운용성 | `T[]`로 매핑됨 | `java.util.List` 및<br/> `java.util.Set`으로 매핑됨 |
| 함수형 스타일 필터링 및<br/> 변환 | 제한적임 | 광범위함 |

[배열을 컬렉션으로 변환](#컬렉션으로-변환)하는 방법을 알아보세요.

## 배열 생성

배열을 생성하려면 다음을 사용할 수 있습니다:

* [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html), [`arrayOfNulls()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of-nulls.html#kotlin$arrayOfNulls(kotlin.Int)) 또는 [`emptyArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/empty-array.html) 함수.
* `Array` 생성자.

> `val`로 배열을 선언하면 변수에 대한 재할당만 방지될 뿐 콘텐츠가 읽기 전용이 되지는 않습니다.
> `val`과 `var` 배열 모두에서 요소는 가변적입니다. 이 차이는 참조에만 영향을 미치며 콘텐츠에는 영향을 주지 않습니다.
> 읽기 전용 뷰가 필요한 경우 대신 [컬렉션](collections-overview.md)을 사용하세요.
> 
{style="note"}

### 값을 포함하는 배열

이미 알고 있는 값 세트로부터 타입이 지정된 배열을 생성하려면 [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html) 함수를 사용하세요.
Kotlin은 타입을 자동으로 추론합니다:

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3) // Array<Int>
    println(simpleArray.joinToString())
    // 1, 2, 3
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-simple-array-kotlin"}

### 빈 배열

요소가 없는 배열을 생성하려면 [`emptyArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/empty-array.html) 함수를 사용하세요.
할당문의 왼쪽 또는 오른쪽에서 요소의 타입을 지정할 수 있습니다:

```kotlin
val emptyArrayRight = emptyArray<String>()
val emptyArrayLeft: Array<String> = emptyArray()
```

배열에 [요소를 추가하는 방법](#요소-추가-및-제거)을 알아보세요.

### null을 포함하는 배열

지정된 크기의 `null` 요소로 채워진 배열을 생성하려면
[`arrayOfNulls()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of-nulls.html#kotlin$arrayOfNulls(kotlin.Int)) 함수를 사용하세요:

```kotlin
fun main() {
//sampleStart
    val nullArray: Array<Int?> = arrayOfNulls(3)
    println(nullArray.joinToString())
    // null, null, null
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-null-array-kotlin"}

### Array 생성자

`Array` 생성자는 배열의 크기와 배열 요소의 값을 반환하는 함수를 인자로 받습니다:

```kotlin
fun main() {
//sampleStart
    val zeroes = Array<Int>(3) { 0 }
    println(zeroes.joinToString())
    // 0, 0, 0
    
    val squares = Array(5) { i -> i * i }
    println(squares.joinToString())
    // 0, 1, 4, 9, 16
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-array-constructor-kotlin"}

### 중첩 배열

중첩 배열 또는 다차원 배열을 생성하려면 배열의 배열을 사용하세요.
중첩 배열이 반드시 동일한 타입이거나 동일한 크기일 필요는 없습니다.

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

### 원시 타입 배열

`Array` 클래스를 원시 타입 값과 함께 사용하면 컴파일러가 이 값들을 객체로 박싱합니다.
박싱 오버헤드를 피하려면 전용 원시 타입 배열을 사용할 수 있습니다.
이들은 [`Array<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/) 클래스의 하위 클래스는 아니지만, 유사한 함수와 프로퍼티 세트를 제공합니다.

| Kotlin 타입 | Java 대응 항목 |
|-----------------------------------------------------------------------------------------|-----------------|
| [`BooleanArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-boolean-array/) | `boolean[]` |
| [`ByteArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-byte-array/) | `byte[]` |
| [`CharArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-char-array/) | `char[]` |
| [`DoubleArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-double-array/) | `double[]` |
| [`FloatArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-float-array/) | `float[]` |
| [`IntArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int-array/) | `int[]` |
| [`LongArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-long-array/) | `long[]` |
| [`ShortArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-short-array/) | `short[]` |

> Kotlin에는 별도의 `StringArray` 타입이 없습니다. `String`은 원시 타입이 아니므로
> 대신 타입 추론과 함께 [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html) 또는 `arrayOf<String>()` 함수를 사용하세요.
> 
{style="note"}

원시 타입 배열을 생성하려면 다음 옵션 중 하나를 사용하세요:

* 생성자 함수:

  ```kotlin
  fun main() {
  //sampleStart
      // 모든 값이 0으로 초기화된 크기 5의 Int 배열을 생성합니다.
      val primitiveTypeArray = IntArray(5)
      println(primitiveTypeArray.joinToString())
      // 0, 0, 0, 0, 0
  
      // Int 배열을 생성하고 초기화 함수를 사용합니다.
      val squares = IntArray(5) { i -> i * i }
      println(squares.joinToString())
      // 0, 1, 4, 9, 16
  //sampleEnd
  }
  ```
  {kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-primitive-type-array-kotlin"}

* 팩토리 함수:

  ```kotlin
  fun main() {
  //sampleStart
      // 5개의 요소를 가진 Int 배열을 생성합니다.
      val numbers = intArrayOf(1, 2, 3, 4, 5)
      println(numbers.joinToString())
      // 1, 2, 3, 4, 5

      // 3개의 요소를 가진 Char 배열을 생성합니다.
      val characters = charArrayOf('K', 't', 'l')
      println(characters.joinToString())
      // K, t, l

      // 3개의 요소를 가진 Double 배열을 생성합니다.
      val doubles = doubleArrayOf(0.22, 4.16, 0.5)
      println(doubles.joinToString()) 
      // 0.22, 4.16, 0.5
  //sampleEnd
  }
  ```
  {kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

> 원시 타입 배열을 객체 타입 배열로 변환하려면 [`.toTypedArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-typed-array.html)
> 함수를 사용하세요.
>
> 객체 타입 배열을 원시 타입 배열로 변환하려면 [`.toBooleanArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-boolean-array.html),
> [`.toByteArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-byte-array.html), [`.toCharArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-char-array.html)
> 등을 사용하세요.
>
{style="note"}

## 배열 작업

배열은 반복(iteration), 검색, 정렬 및 변환을 포함하여 컬렉션과 동일한 작업을 많이 지원합니다.
Kotlin에서는 배열을 사용하여 함수에 가변적인 개수의 인자를 전달하거나 배열 자체에 대한 연산을 수행할 수 있습니다.
다음 표에서 가장 일반적인 프로퍼티와 함수를 확인할 수 있습니다:

| 멤버 | 반환 값 |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------|
| [`size`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-array/size.html) | 요소의 개수 |
| [`indices`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/indices.html) | 유효한 인덱스 범위 |
| [`lastIndex`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/last-index.html) | 마지막 유효 인덱스 |
| [`first()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first.html) 및 [`last()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/last.html) | 첫 번째 및 마지막 요소 |
| [`isEmpty()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/is-empty.html) 및 [`isNotEmpty()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/is-not-empty.html) | 배열이 비어 있거나 비어 있지 않으면 `true` |
| [`contains()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/contains.html) | 배열에 요소가 포함되어 있으면 `true` |

> 배열 프로퍼티와 함수에 대한 자세한 내용은 [API 레퍼런스](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-array/)를 참조하세요.
> 
{style="tip"}

이 섹션에서는 가장 자주 사용되는 작업 중 일부를 소개합니다.

### 요소 접근 및 수정

배열의 요소에 접근하고 수정하려면 [인덱스 접근 연산자(indexed access operator)](operator-overloading.md#indexed-access-operator)
(`[]`)를 사용하세요:

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)
    val twoDArray = Array(2) { Array<Int>(2) { 0 } }

    // 요소에 접근하고 수정합니다.
    simpleArray[0] = 10
    twoDArray[0][0] = 2

    // 수정된 요소를 출력합니다.
    println(simpleArray[0]) 
    // 10
    println(twoDArray[0][0]) 
    // 2
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-access-array-kotlin"}

> 배열의 범위를 벗어난 인덱스에 접근하려고 하면 Kotlin은 런타임에 `ArrayIndexOutOfBoundsException`을 발생시킵니다.
>
{style="note"} 

[`fill(element, fromIndex, toIndex)`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/fill.html) 함수를 사용하여 특정 범위의 요소를 제자리(in place)에서 교체할 수도 있습니다. `fromIndex`는 포함되고, `toIndex`는 제외됩니다:

```kotlin
fun main() {
//sampleStart
    val arr = IntArray(3)
    println(arr.joinToString())
    // 0, 0, 0
    
   arr.fill(1)
   println(arr.joinToString())
   // 1, 1, 1
  
   arr.fill(0, 0, 2)
   println(arr.joinToString())
   // 0, 0, 1
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

Kotlin에서 배열은 _무공변(invariant)_입니다. 이는 `Array<String>`이 `Array<Any>`의 하위 타입이 아님을 의미합니다. 이는 발생 가능한 런타임 타입 실패를 방지합니다. 공변성(covariance)을 표현하려면 `Array<out Any>` [타입 프로젝션(type projection)](generics.md#type-projections)을 사용하세요:

```kotlin
fun main() {
//sampleStart
    fun printArr(arr: Array<out Any>) {
        for (item in arr) print("$item, ")
    }

    printArr(arrayOf("k", "t", "n"))  
    // k, t, n, 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 요소 추가 및 제거

배열은 크기가 고정되어 있으므로 `.add()` 및 `.remove()` 함수를 지원하지 않습니다. 이러한 작업을 수행하려면 새로운 배열을 생성해야 합니다. 이를 위해 다음 옵션 중 하나를 사용할 수 있습니다:

* [`.copyOf`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/copy-of.html) 함수 사용:

  ```kotlin
  fun main() {
  //sampleStart
      var arr = intArrayOf(0, 1, 2)
      
      arr = arr.copyOf(arr.size + 1)
      println(arr.joinToString())
      // 0, 1, 2, 0

      arr[arr.lastIndex] = 3
      println(arr.joinToString())
      // 0, 1, 2, 3
  //sampleEnd
  }
  ```
  {kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

* `+` 또는 `+=` 연산자 사용:

  ```kotlin
  fun main() {
  //sampleStart
      var arr = intArrayOf(0, 1, 2)

      arr += 3
      println(arr.joinToString())
      // 0, 1, 2, 3

      arr = arr + intArrayOf(4, 5)
      println(arr.joinToString())
      // 0, 1, 2, 3, 4, 5
  //sampleEnd
  }
  ```
  {kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

> 요소를 빈번하게 추가하거나 제거해야 한다면 대신 [가변 컬렉션(mutable collections)](collections-overview.md#컬렉션-타입)을 사용하세요.
>
{style="tip"}

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

    // 중위 표기법을 사용하여 요소가 변경된 후
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
> Kotlin에서 배열이 왜 이렇게 동작하는지에 대해 더 자세히 알아보려면 [블로그 포스트](https://blog.jetbrains.com/kotlin/2015/09/feedback-request-limitations-on-data-classes/#Appendix.Comparingarrays)를 확인하세요.
>
{style="warning"}

### 배열 변환

Kotlin에는 배열을 변환하는 유용한 함수가 많이 있습니다. 이 섹션에서는 그 중 몇 가지만 강조합니다. 전체 목록은 [API 레퍼런스](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/)를 확인하세요.

#### 합계 (Sum)

배열의 모든 요소의 합을 반환하려면 [`.sum()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sum.html) 함수를 사용하세요:

```kotlin
fun main() {
//sampleStart
    val sumArray = arrayOf(1, 2, 3)
    println(sumArray.sum())
    // 6
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-sum-array-kotlin"}

> `.sum()` 함수는 `Int`와 같은 [숫자 데이터 타입](numbers.md)의 배열에만 사용할 수 있습니다.
>
{style="note"}

#### 정렬 및 셔플

[`.sort()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/sort.html) 함수로 배열의 요소를 자연 순서에 따라 정렬하거나, [`.shuffle()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/shuffle.html) 함수로 무작위로 섞을 수 있습니다:

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)

    // 요소를 무작위로 섞습니다.
    simpleArray.shuffle()
    println(simpleArray.joinToString())
  
    // 요소를 정렬합니다.
    simpleArray.sort()
    println(simpleArray.joinToString())
    // 1, 2, 3
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-shuffle-array-kotlin"}

원본을 수정하지 않고 정렬된 새 배열을 얻으려면 대신 [`.sortedArray()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/sorted-array.html) 함수를 사용하세요.

### 함수에 가변 인자 전달

Kotlin에서는 [`vararg`](functions.md#가변-인자-varargs) 파라미터를 통해 함수에 가변적인 개수의 인자를 전달할 수 있습니다. 이는 메시지를 포맷팅하거나 SQL 쿼리를 생성할 때와 같이 인자의 개수를 미리 알 수 없을 때 유용합니다.

가변 인자를 포함하는 배열을 함수에 전달하려면 _스프레드 연산자(spread operator)_ (`*`)를 사용하세요. 스프레드 연산자는 배열의 각 요소를 개별 인자로 선택한 함수에 전달합니다:

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

자세한 내용은 [가변 인자 (varargs)](functions.md#가변-인자-varargs)를 참조하세요.

## 컬렉션으로 변환

어떤 API는 배열을 사용하고 어떤 API는 컬렉션을 사용하는 환경에서 작업한다면, 배열을 컬렉션으로 변환하거나 그 반대로 변환할 수 있습니다. 이를 위해 [`.toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-list.html), [`.toSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-set.html), [`.toMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-map.html) 함수를 사용하세요. 이 함수들은 배열의 콘텐츠를 독립적인 복사본으로 복사합니다. 따라서 이후 배열에 대한 변경 사항이 컬렉션에 반영되지 않습니다.

### List 또는 Set으로 변환

배열을 `List` 또는 `Set`으로 변환하려면 [`.toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-list.html) 및 [`.toSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-set.html) 함수를 사용하세요:

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

원본 배열이 변경되지 않거나 다른 곳에서 공유되지 않는다는 확신이 없다면 [`.asList()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/as-list.html) 및 관련 `as*` 함수를 사용하지 마세요. 이 함수들은 원본 배열을 복사하는 대신 래핑(wrap)합니다. 따라서 배열의 변경 사항이 리스트에 반영되며 그 반대도 마찬가지입니다.

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf("a", "b", "c")

    val list = simpleArray.asList()
    simpleArray[0] = "d"
    println(list)
    // [d, b, c]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### Map으로 변환

배열을 `Map`으로 변환하려면 [`.toMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-map.html) 함수를 사용하세요.

[`Pair<K,V>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-pair/)의 배열만 `Map`으로 변환할 수 있습니다. `Pair` 인스턴스의 첫 번째 값은 키가 되고, 두 번째 값은 값이 됩니다. 동일한 키가 여러 번 나타나면 마지막 값이 사용됩니다.

이 예제는 [중위 표기법(infix notation)](functions.md#중위-표기법-infix-notation)을 사용하여 [`.to`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/to.html) 함수를 호출해 `Pair` 튜플을 생성합니다:

```kotlin
fun main() {
//sampleStart
    val pairArray = arrayOf("apple" to 120, "banana" to 150, "cherry" to 90, "apple" to 140)

    // Map으로 변환합니다.
    // 과일 이름이 키이고, 칼로리 숫자가 값입니다.
    // 마지막 "apple" 값이 첫 번째 값을 덮어씁니다.
    println(pairArray.toMap())
    // {apple=140, banana=150, cherry=90}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-convert-map-kotlin"}

## 다음 단계

* 대부분의 유스케이스에서 왜 컬렉션 사용을 권장하는지 알아보려면 [컬렉션 개요](collections-overview.md)를 읽어보세요.
* 다른 [기본 타입](types-overview.md)에 대해 알아보세요.
* Java 개발자라면 [컬렉션에 대한 Java에서 Kotlin으로의 마이그레이션 가이드](java-to-kotlin-collections-guide.md)를 읽어보세요.