[//]: # (title: Set 관련 연산)

Kotlin 컬렉션 패키지에는 컬렉션 간의 교집합 구하기, 병합(합집합), 차집합 연산과 같이 세트(Set)에서 주로 사용되는 연산을 위한 확장 함수들이 포함되어 있습니다.

두 컬렉션을 하나로 병합하려면 [`union()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/union.html) 함수를 사용합니다. 이 함수는 `a union b`와 같이 중위 연산자(infix) 형태로도 사용할 수 있습니다.
순서가 있는 컬렉션의 경우 피연산자의 순서가 중요하다는 점에 유의하세요. 결과 컬렉션에는 첫 번째 피연산자의 요소가 두 번째 피연산자의 요소보다 먼저 위치합니다.

```kotlin
fun main() {
//sampleStart
    val numbers = setOf("one", "two", "three")

    // 순서에 따른 출력
    println(numbers union setOf("four", "five"))
    // [one, two, three, four, five]
    println(setOf("four", "five") union numbers)
    // [four, five, one, two, three]
//sampleEnd
}
```
{kotlin-runnable="true"}

두 컬렉션의 교집합(양쪽 컬렉션에 모두 존재하는 요소)을 찾으려면 [`intersect()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/intersect.html) 함수를 사용합니다.
다른 컬렉션에 존재하지 않는 컬렉션의 요소를 찾으려면(차집합) [`subtract()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/subtract.html) 함수를 사용합니다.
두 함수 모두 `a intersect b`와 같이 중위 연산자 형태로 호출할 수 있습니다.

```kotlin
fun main() {
//sampleStart
    val numbers = setOf("one", "two", "three")

    // 동일한 출력 결과
    println(numbers intersect setOf("two", "one"))
    // [one, two]
    println(numbers subtract setOf("three", "four"))
    // [one, two]
    println(numbers subtract setOf("four", "three"))
    // [one, two]
//sampleEnd
}
```
{kotlin-runnable="true"}

두 컬렉션 중 어느 한쪽에만 있고 두 컬렉션의 교집합에는 속하지 않는 요소를 찾으려면 `union()` 함수를 활용할 수도 있습니다.
이 연산(대칭차집합, symmetric difference)을 수행하려면 두 컬렉션 간의 차집합을 각각 계산한 다음 그 결과를 병합합니다.

```kotlin
fun main() {
//sampleStart
    val numbers = setOf("one", "two", "three")
    val numbers2 = setOf("three", "four")

    // 차집합 결과들을 병합 (대칭차집합)
    println((numbers - numbers2) union (numbers2 - numbers))
    // [one, two, four]
//sampleEnd
}
```
{kotlin-runnable="true"}

`union()`, `intersect()`, `subtract()` 함수는 리스트에도 적용할 수 있습니다.
하지만 그 결과는 _항상_ `Set`입니다. 따라서 결과에서 모든 중복 요소는 하나로 병합되며, 인덱스를 통한 접근은 불가능합니다.

```kotlin
fun main() {
//sampleStart
    val list1 = listOf(1, 1, 2, 3, 5, 8, -1)
    val list2 = listOf(1, 1, 2, 2, 3, 5)

    // 두 리스트의 교집합 결과는 Set임
    println(list1 intersect list2)
    // [1, 2, 3, 5]

    // 동일한 요소는 하나로 병합됨
    println(list1 union list2)
    // [1, 2, 3, 5, 8, -1]
//sampleEnd
}
```
{kotlin-runnable="true"}