[//]: # (title: 컬렉션 연산 개요)

Kotlin 표준 라이브러리는 컬렉션에 대한 다양한 연산을 수행할 수 있는 폭넓은 함수들을 제공합니다. 여기에는 요소를 가져오거나 추가하는 간단한 연산뿐만 아니라 검색, 정렬, 필터링, 변환 등과 같은 더 복잡한 연산도 포함됩니다.

## 확장 함수 및 멤버 함수 {id="extension-and-member-functions"}

컬렉션 연산은 표준 라이브러리에서 두 가지 방식으로 선언됩니다. 바로 컬렉션 인터페이스의 [멤버 함수](classes.md)와 [확장 함수](extensions.md#extension-functions)입니다.

멤버 함수는 특정 컬렉션 타입에 필수적인 연산들을 정의합니다. 예를 들어, [`Collection`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-collection/index.html)에는 비어 있는지 확인하기 위한 [`isEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-collection/is-empty.html) 함수가 포함되어 있으며, [`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html)에는 인덱스로 요소에 접근하기 위한 [`get()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/get.html) 함수 등이 포함되어 있습니다.

컬렉션 인터페이스의 자체 구현체를 만들 때는 이러한 멤버 함수들을 구현해야 합니다. 새로운 구현체를 더 쉽게 만들 수 있도록 표준 라이브러리에서 제공하는 컬렉션 인터페이스의 골격 구현체(skeletal implementation)를 사용할 수 있습니다: [`AbstractCollection`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-collection/index.html), [`AbstractList`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-list/index.html), [`AbstractSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-set/index.html), [`AbstractMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-map/index.html) 및 이들의 가변(mutable) 대응 클래스들입니다.

그 외의 컬렉션 연산들은 확장 함수로 선언되어 있습니다. 필터링, 변환, 정렬 및 기타 컬렉션 처리 함수들이 여기에 해당합니다.

## 공통 연산 {id="common-operations"}

공통 연산은 [읽기 전용 컬렉션과 가변 컬렉션](collections-overview.md#collection-types) 모두에서 사용할 수 있습니다. 공통 연산은 다음과 같은 그룹으로 나뉩니다:

* [변환(Transformations)](collection-transformations.md)
* [필터링(Filtering)](collection-filtering.md)
* [`plus` 및 `minus` 연산자](collection-plus-minus.md)
* [그룹화(Grouping)](collection-grouping.md)
* [컬렉션 일부 가져오기(Retrieving collection parts)](collection-parts.md)
* [단일 요소 가져오기(Retrieving single elements)](collection-elements.md)
* [정렬(Ordering)](collection-ordering.md)
* [집계 연산(Aggregate operations)](collection-aggregate.md)

이 페이지들에 설명된 연산들은 원본 컬렉션에 영향을 주지 않고 결과를 반환합니다. 예를 들어, 필터링 연산은 필터 조건식(predicate)과 일치하는 모든 요소를 포함하는 _새로운 컬렉션_을 생성합니다. 이러한 연산의 결과는 변수에 저장하거나 다른 함수에 전달하는 등 다른 방식으로 사용해야 합니다.

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")  
    numbers.filter { it.length > 3 }  // `numbers`에는 아무런 변화가 없으며 결과가 손실됩니다
    println("numbers are still $numbers")
    val longerThan3 = numbers.filter { it.length > 3 } // 결과가 `longerThan3`에 저장됩니다
    println("numbers longer than 3 chars are $longerThan3")
//sampleEnd
}
```
{kotlin-runnable="true"}

특정 컬렉션 연산에서는 _대상(destination)_ 객체를 지정할 수 있는 옵션이 있습니다. 대상은 함수가 새로운 객체로 결과를 반환하는 대신 결과 항목을 추가할 가변 컬렉션입니다. 대상을 지정하여 연산을 수행하기 위해 이름에 `To` 접미사가 붙은 별도의 함수들이 있습니다. 예를 들어, [`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html) 대신 [`filterTo()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-to.html)를 사용하거나, [`associate()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate.html) 대신 [`associateTo()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate-to.html)를 사용할 수 있습니다. 이러한 함수들은 대상 컬렉션을 추가 매개변수로 받습니다.

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    val filterResults = mutableListOf<String>()  // 대상(destination) 객체
    numbers.filterTo(filterResults) { it.length > 3 }
    numbers.filterIndexedTo(filterResults) { index, _ -> index == 0 }
    println(filterResults) // 두 연산의 결과가 모두 포함됩니다
//sampleEnd
}

```
{kotlin-runnable="true"}

편의를 위해 이러한 함수들은 대상 컬렉션을 다시 반환하므로 함수 호출 시 해당 인자 위치에서 바로 생성할 수도 있습니다:

```kotlin

fun main() {
    val numbers = listOf("one", "two", "three", "four")
//sampleStart
    // 새로운 해시 셋으로 직접 변환하여
    // 결과에서 중복을 제거합니다
    val result = numbers.mapTo(HashSet()) { it.length }
    println("distinct item lengths are $result")
//sampleEnd
}
```
{kotlin-runnable="true"}

대상을 지정하는 함수는 필터링, 연관(association), 그룹화, 평탄화(flattening) 및 기타 연산에서 사용할 수 있습니다. 대상 지정 연산의 전체 목록은 [Kotlin 컬렉션 레퍼런스](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/index.html)를 참조하세요.

## 쓰기 연산 {id="write-operations"}

가변 컬렉션의 경우 컬렉션 상태를 변경하는 _쓰기 연산(write operations)_도 있습니다. 이러한 연산에는 요소 추가, 제거 및 업데이트가 포함됩니다. 쓰기 연산은 [쓰기 연산](collection-write.md) 문서와 [List 전용 연산](list-operations.md#list-write-operations) 및 [Map 전용 연산](map-operations.md#map-write-operations)의 해당 섹션에 나열되어 있습니다.

특정 연산의 경우 동일한 작업을 수행하는 함수가 쌍으로 제공됩니다. 하나는 연산을 제자리에서(in-place) 적용하고, 다른 하나는 결과를 별도의 컬렉션으로 반환합니다. 예를 들어, [`sort()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sort.html)는 가변 컬렉션을 제자리에서 정렬하므로 해당 컬렉션의 상태가 변경됩니다. 반면 [`sorted()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted.html)는 동일한 요소를 정렬된 순서로 포함하는 새로운 컬렉션을 생성합니다.

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four")
    val sortedNumbers = numbers.sorted()
    println(numbers == sortedNumbers)  // false
    numbers.sort()
    println(numbers == sortedNumbers)  // true
//sampleEnd
}
```
{kotlin-runnable="true"}