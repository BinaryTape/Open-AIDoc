[//]: # (title: 배열)
[//]: # (description: Kotlin에서 배열을 생성, 접근, 수정, 비교 및 변환하는 방법을 알아봅니다.)

배열(Array)은 동일한 타입 또는 그 하위 타입의 값을 고정된 개수만큼 담는 데이터 구조입니다.
배열 요소는 순서가 정해져 있으며 인덱스를 통해 접근합니다.

Kotlin은 [`Array<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/) 클래스와 [원시 타입 배열](#primitive-type-arrays)을 제공합니다.

## 배열을 사용해야 하는 경우 {id="when-to-use-arrays"}

Java API와의 상호 운용성이나 저수준(low-level) 요구 사항이 있을 때 배열을 사용합니다. 예를 들어 일반적인 애플리케이션에 필요한 수준을 넘어서는 성능 요구 사항이 있거나, 커스텀 데이터 구조를 직접 구현해야 하는 경우가 이에 해당합니다.

대부분의 사용 사례에서는 배열 대신 [컬렉션](collections-overview.md)을 사용하는 것이 좋습니다.

| 기능 | 배열 | 컬렉션 |
|-----------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------|
| 크기 | 고정됨 | 타입에 따라 다름 |           
| 읽기 전용 변형 | 없음, 항상 변경 가능 | 있음 (`List` 및 `Set`) |
| 요소 추가 및 제거 | 기본 지원 없음.<br/> 새 배열을 할당하고 복사해야 함 | 지원함 (가변 컬렉션) |
| `==`를 사용한 구조적 동등성 | 지원하지 않음, 참조를 비교함.<br/> 대신 [`.contentEquals()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/content-equals.html) 사용 | 지원함 |
| 원시 값 | 원시 타입 배열은 박싱 없이<br/> 값을 저장함 | 보통 박싱됨 |
| Java 상호 운용성 | `T[]`에 매핑됨 | `java.util.List` 및<br/> `java.util.Set`에 매핑됨 |
| 함수형 스타일 필터링 및<br/> 변환 | 제한적임 | 광범위함 |

[배열을 컬렉션으로 변환](#convert-to-collections)하는 방법도 확인해 보세요.

## 배열 생성 {id="create-arrays"}

배열을 생성할 때는 다음을 사용할 수 있습니다.

* [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html), [`arrayOfNulls()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of-nulls.html#kotlin$arrayOfNulls(kotlin.Int)), 
[`emptyArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/empty-array.html) 함수
* `Array` 생성자

> 배열을 `val`로 선언하는 것은 변수의 재할당만 방지할 뿐 내부 내용까지 읽기 전용으로 만들지는 않습니다.
> 요소는 `val` 배열과 `var` 배열 모두에서 변경할 수 있습니다. 둘의 차이는 내용이 아니라 참조에만 영향을 미칩니다.
> 읽기 전용 뷰가 필요하다면 대신 [컬렉션](collections-overview.md)을 사용하세요.
> 
{style="note"}

### 값이 있는 배열 {id="array-with-values"}

이미 알고 있는 값의 집합으로 타입이 지정된 배열을 생성하려면 [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html) 함수를 사용합니다.
Kotlin이 타입을 자동으로 추론합니다.

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3) // Array<Int>
    println(simpleArray.joinToString())
    // 1, 2, 3
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-simple-array-kotlin"}

### 빈 배열 {id="empty-array"}

요소가 없는 빈 배열을 생성하려면 [`emptyArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/empty-array.html) 함수를 사용합니다.
요소의 타입은 대입 연산자의 좌변 또는 우변에서 지정할 수 있습니다.

```kotlin
val emptyArrayRight = emptyArray<String>()
val emptyArrayLeft: Array<String> = emptyArray()
```

배열에 [요소를 추가하는 방법](#add-and-remove-elements)을 확인해 보세요.

### null이 포함된 배열 {id="array-with-nulls"}

`null` 요소로 채워진 특정 크기의 배열을 생성하려면
[`arrayOfNulls()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of-nulls.html#kotlin$arrayOfNulls(kotlin.Int)) 함수를 사용합니다.

```kotlin
fun main() {
//sampleStart
    val nullArray: Array<Int?> = arrayOfNulls(3)
    println(nullArray.joinToString())
    // null, null, null
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-null-array-kotlin"}

### Array 생성자 {id="array-constructor"}

`Array` 생성자는 배열의 크기와 배열 요소의 값을 반환하는 함수를 인자로 받습니다.

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
{kotlin-runnable="true" id="arrays-array-constructor-kotlin"}

### 중첩 배열 {id="nested-arrays"}

중첩 배열 또는 다차원 배열을 생성하려면 배열의 배열을 사용합니다.
중첩된 배열들의 타입이나 크기가 반드시 같을 필요는 없습니다.

```kotlin
fun main() {
//sampleStart
    // 2차원 배열 생성
    val twoDArray = Array(2) { Array<Int>(2) { 0 } }
    println(twoDArray.contentDeepToString())
    // [[0, 0], [0, 0]]

    // 3차원 배열 생성
    val threeDArray = Array(3) { Array(3) { Array<Int>(3) { 0 } } }
    println(threeDArray.contentDeepToString())
    // [[[0, 0, 0], [0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]]]
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-multidimensional-array-kotlin"}

### 원시 타입 배열 {id="primitive-type-arrays"}

`Array` 클래스를 원시 값(primitive value)과 함께 사용하면 컴파일러가 이 값들을 객체로 박싱(boxing)합니다.
박싱으로 인한 오버헤드를 피하기 위해 전용 원시 타입 배열(primitive-type arrays)을 사용할 수 있습니다.
이 배열들은 [`Array<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/) 클래스의 서브클래스는 아니지만, 유사한 함수와 프로퍼티 집합을 제공합니다.

| Kotlin 타입 | Java 대응 타입 |
|-----------------------------------------------------------------------------------------|-----------------|
| [`BooleanArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-boolean-array/)   | `boolean[]`     |
| [`ByteArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-byte-array/)         | `byte[]`        |
| [`CharArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-char-array/)         | `char[]`        |
| [`DoubleArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-double-array/)     | `double[]`      |
| [`FloatArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-float-array/)       | `float[]`       |
| [`IntArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int-array/)           | `int[]`         |
| [`LongArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-long-array/)         | `long[]`        |
| [`ShortArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-short-array/)       | `short[]`       |

> Kotlin에는 별도의 `StringArray` 타입이 없습니다. `String`은 원시 타입이 아니므로,
> 대신 [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html) 또는 타입이 추론되는 `arrayOf<String>()` 함수를 사용하세요.
> 
{style="note"}

원시 타입 배열을 생성하려면 다음 방법 중 하나를 사용합니다.

* 생성자 함수:

  ```kotlin
  fun main() {
  //sampleStart
      // 0으로 초기화된 크기 5의 Int 배열 생성
      val primitiveTypeArray = IntArray(5)
      println(primitiveTypeArray.joinToString())
      // 0, 0, 0, 0, 0
  
      // 초기화 함수를 받는 Int 배열 생성
      val squares = IntArray(5) { i -> i * i }
      println(squares.joinToString())
      // 0, 1, 4, 9, 16
  //sampleEnd
  }
  ```
  {kotlin-runnable="true" id="arrays-primitive-type-array-kotlin"}

* 팩토리 함수:

  ```kotlin
  fun main() {
  //sampleStart
      // 5개의 요소를 가진 Int 배열 생성
      val numbers = intArrayOf(1, 2, 3, 4, 5)
      println(numbers.joinToString())
      // 1, 2, 3, 4, 5

      // 3개의 요소를 가진 Char 배열 생성
      val characters = charArrayOf('K', 't', 'l')
      println(characters.joinToString())
      // K, t, l

      // 3개의 요소를 가진 Double 배열 생성
      val doubles = doubleArrayOf(0.22, 4.16, 0.5)
      println(doubles.joinToString()) 
      // 0.22, 4.16, 0.5
  //sampleEnd
  }
  ```
  {kotlin-runnable="true"}

> 원시 타입 배열을 객체 타입 배열로 변환하려면 [`.toTypedArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-typed-array.html)
> 함수를 사용하세요.
>
> 객체 타입 배열을 원시 타입 배열로 변환하려면 [`.toBooleanArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-boolean-array.html),
> [`.toByteArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-byte-array.html), [`.toCharArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-char-array.html)
> 등을 사용하세요.
>
{style="note"}

## 배열 다루기 {id="work-with-arrays"}

배열은 순회, 검색, 정렬, 변환 등 컬렉션과 동일한 연산 상당수를 지원합니다.
Kotlin에서는 배열을 사용하여 함수에 가변 개수의 인자를 전달하거나 배열 자체에 대한 연산을 수행할 수 있습니다.
가장 자주 사용되는 프로퍼티와 함수는 다음 표에서 확인할 수 있습니다.

| 멤버 | 반환값 |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------|
| [`size`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-array/size.html)                                                                                                                        | 요소의 개수 |
| [`indices`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/indices.html)                                                                                                             | 유효한 인덱스 범위 |
| [`lastIndex`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/last-index.html)                                                                                                        | 마지막 유효한 인덱스 |
| [`first()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first.html) 및 [`last()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/last.html)                    | 첫 번째 및 마지막 요소 |
| [`isEmpty()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/is-empty.html) 및 [`isNotEmpty()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/is-not-empty.html) | 배열이 비어 있는지 또는 비어 있지 않은지에 따라 `true` |
| [`contains()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/contains.html)                                                                                                         | 배열에 해당 요소가 포함되어 있으면 `true` |

> 배열 프로퍼티와 함수에 대한 자세한 내용은 [API 레퍼런스](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-array/)에서 확인하세요.
> 
{style="tip"}

이 섹션에서는 가장 흔히 사용되는 몇 가지 연산을 소개합니다.

### 요소 접근 및 수정 {id="access-and-modify-elements"}

배열의 요소에 접근하고 수정하려면 [인덱스 접근 연산자](operator-overloading.md#indexed-access-operator)(`[]`)를 사용합니다.

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)
    val twoDArray = Array(2) { Array<Int>(2) { 0 } }

    // 요소에 접근하여 수정
    simpleArray[0] = 10
    twoDArray[0][0] = 2

    // 수정된 요소 출력
    println(simpleArray[0]) 
    // 10
    println(twoDArray[0][0]) 
    // 2
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-access-array-kotlin"}

> 배열의 범위를 벗어난 인덱스에 접근하려고 하면 런타임에 Kotlin이 `ArrayIndexOutOfBoundsException`을 던집니다.
>
{style="note"} 

또한 [`fill(element, fromIndex, toIndex)`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/fill.html) 함수를 사용하여 지정된 범위의 요소를 제자리에서(in place) 바꿀 수도 있습니다. `fromIndex`는 포함되며, `toIndex`는 제외됩니다.

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
{kotlin-runnable="true"}

Kotlin에서 배열은 *무공변(invariant)*입니다. 즉, `Array<String>`은 `Array<Any>`의 하위 타입이 아닙니다. 이는 발생할 수 있는 런타임 타입 오류를 방지하기 위함입니다. 공변성(covariance)을 표현하려면 `Array<out Any>` [타입 프로젝션](generics.md#type-projections)을 사용하세요.

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
{kotlin-runnable="true"}

### 요소 추가 및 제거 {id="add-and-remove-elements"}

배열은 고정된 크기를 가지므로 `.add()` 및 `.remove()` 함수를 지원하지 않습니다. 이러한 연산을 수행하려면 새 배열을 생성해야 합니다. 이를 위해 다음 옵션 중 하나를 사용할 수 있습니다.

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
  {kotlin-runnable="true"}

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
  {kotlin-runnable="true"}

> 요소를 빈번하게 추가하거나 제거해야 한다면 대신 [가변 컬렉션](collections-overview.md#read-only-and-mutable-collections)을 사용하세요.
>
{style="tip"}

### 배열 비교 {id="compare-arrays"}

두 배열에 동일한 요소가 동일한 순서로 들어 있는지 비교하려면 [`.contentEquals()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/content-equals.html)
및 [`.contentDeepEquals()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/content-deep-equals.html)
함수를 사용합니다.

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)
    val anotherArray = arrayOf(1, 2, 3)

    // 배열의 내용 비교
    println(simpleArray.contentEquals(anotherArray))
    // true

    // 중위 표기법을 사용하여 요소를 변경한 후 배열의 내용 비교
    simpleArray[0] = 10
    println(simpleArray contentEquals anotherArray)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-compare-array-kotlin"}

> 배열의 내용을 비교할 때 동등(`==`) 및 부등(`!=`) [연산자](equality.md#structural-equality)를 사용하지 마세요. 이 연산자들은 할당된 변수가 동일한 객체를 가리키고 있는지 여부를 확인합니다.
>
> Kotlin에서 배열이 이렇게 동작하는 이유에 대해 자세히 알아보려면 [블로그 포스트](https://blog.jetbrains.com/kotlin/2015/09/feedback-request-limitations-on-data-classes/#Appendix.Comparingarrays)를 참고하세요.
>
{style="warning"}

### 배열 변환 {id="transform-arrays"}

Kotlin에는 배열을 변환할 수 있는 유용한 함수가 많이 있습니다. 이 섹션에서는 그중 일부를 소개합니다.
전체 목록은 [API 레퍼런스](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/)에서 확인하세요.

#### 합계 {id="sum"}

배열의 모든 요소의 합을 반환하려면 [`.sum()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sum.html)
함수를 사용합니다.

```kotlin
fun main() {
//sampleStart
    val sumArray = arrayOf(1, 2, 3)
    println(sumArray.sum())
    // 6
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-sum-array-kotlin"}

> `.sum()` 함수는 `Int`와 같은 [숫자 데이터 타입](numbers.md)의 배열에서만 사용할 수 있습니다.
>
{style="note"}

#### 정렬 및 셔플 {id="sort-and-shuffle"}

배열의 요소를 자연스러운 순서에 따라 정렬하려면 [`.sort()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/sort.html) 함수를 사용하고,
무작위로 섞으려면 [`.shuffle()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/shuffle.html)
함수를 사용합니다.

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)

    // 요소를 무작위로 섞음
    simpleArray.shuffle()
    println(simpleArray.joinToString())
  
    // 요소 정렬
    simpleArray.sort()
    println(simpleArray.joinToString())
    // 1, 2, 3
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-shuffle-array-kotlin"}

원본을 수정하지 않고 정렬된 새 배열을 가져오려면 대신
[`.sortedArray()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/sorted-array.html) 함수를 사용하세요.

### 함수에 가변 인자 전달 {id="pass-variable-number-of-arguments-to-a-function"}

Kotlin에서는 [`vararg`](functions.md#variable-number-of-arguments-varargs) 매개변수를 통해 함수에 가변 개수의 인자를 전달할 수 있습니다. 이는 메시지를 포맷팅하거나 SQL 쿼리를 생성할 때처럼 사전에 인자의 개수를 알 수 없을 때 유용합니다.

가변 인자가 포함된 배열을 함수에 전달하려면 *스프레드 연산자(spread operator)*(`*`)를 사용합니다. 스프레드 연산자는 배열의 각 요소를 개별 인자로 풀어서 대상 함수에 전달합니다.

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
{kotlin-runnable="true" id="arrays-vararg-array-kotlin"}

자세한 내용은 [가변 인자 (vararg)](functions.md#variable-number-of-arguments-varargs)를 참고하세요.

## 컬렉션으로 변환 {id="convert-to-collections"}

일부는 배열을 사용하고 일부는 컬렉션을 사용하는 여러 API를 다룰 때, 배열을 컬렉션으로 변환하거나 그 반대로 변환할 수 있습니다. 이를 위해 [`.toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-list.html), [`.toSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-set.html), [`.toMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-map.html) 함수를 사용합니다.
이 함수들은 배열의 내용을 독립적인 복사본으로 복사합니다. 따라서 배열에 이후 변경 사항이 생겨도 컬렉션에 반영되지 않습니다.

### List 또는 Set으로 변환 {id="convert-to-list-or-set"}

배열을 `List` 또는 `Set`으로 변환하려면 [`.toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-list.html)
및 [`.toSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-set.html) 함수를 사용합니다.

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf("a", "b", "c", "c")

    // Set으로 변환
    println(simpleArray.toSet())
    // [a, b, c]

    // List로 변환
    println(simpleArray.toList())
    // [a, b, c, c]
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-convert-list-set-kotlin"}

원본 배열이 다른 곳에서 변경되거나 공유되지 않는다는 확신이 없는 한,
[`.asList()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/as-list.html)
및 관련 `as*` 함수를 사용하지 마세요. 이러한 함수들은 원본 배열을 복사하는 대신 래핑(wrap)합니다. 따라서 배열의 변경 사항이 리스트에 반영되고, 리스트의 변경 사항 역시 배열에 반영됩니다.

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
{kotlin-runnable="true"}

### Map으로 변환 {id="convert-to-map"}

배열을 `Map`으로 변환하려면 [`.toMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-map.html)
함수를 사용합니다.

[`Pair<K,V>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-pair/) 배열만 `Map`으로 변환할 수 있습니다.
`Pair` 인스턴스의 첫 번째 값은 키가 되고, 두 번째 값은 값이 됩니다.
동일한 키가 두 번 이상 나타나면 마지막 값이 사용됩니다.

다음 예제에서는 [중위 표기법](functions.md#infix-notation)을 사용하여 [`.to`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/to.html) 함수를 호출해 `Pair` 튜플을 생성합니다.

```kotlin
fun main() {
//sampleStart
    val pairArray = arrayOf("apple" to 120, "banana" to 150, "cherry" to 90, "apple" to 140)

    // Map으로 변환
    // 과일은 키, 칼로리 숫자는 값
    // 마지막 "apple" 값이 첫 번째 값을 덮어씀
    println(pairArray.toMap())
    // {apple=140, banana=150, cherry=90}
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-convert-map-kotlin"}

## 다음 단계 {id="what-s-next"}

* 대부분의 사용 사례에서 컬렉션을 권장하는 이유에 대한 자세한 내용은 [컬렉션 개요](collections-overview.md)를 참고하세요.
* 다른 [기본 타입](types-overview.md)에 대해서도 알아보세요.
* Java 개발자라면 [컬렉션을 위한 Java to Kotlin 마이그레이션 가이드](java-to-kotlin-collections-guide.md)를 읽어보세요.