[//]: # (title: 컬렉션 결합)

Kotlin은 컬렉션 요소를 추가 및 제거하고 컬렉션을 결합하기 위한 연산자와 함수를 제공합니다. 이러한 연산은 원본 컬렉션을 변경하지 않고 새로운 읽기 전용 컬렉션을 반환합니다.

요소를 추가하거나 제거하여 가변 컬렉션을 수정할 수도 있습니다. 자세한 내용은 [](collection-write.md)를 참고하세요.

## 요소 추가 및 제거 {id="add-and-remove-elements"}

Kotlin에서는 [`plus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus.html)(`+`) 및 [`minus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus.html)(`-`) 연산자를 사용하여 컬렉션 요소를 추가하거나 제거할 수 있습니다.
첫 번째 피연산자는 컬렉션이고, 두 번째 피연산자는 요소 또는 다른 컬렉션입니다.
각 연산자는 새로운 읽기 전용 컬렉션을 반환합니다.

* `plus`는 원본 요소들과 두 번째 피연산자의 요소(들)를 포함하는 컬렉션을 반환합니다.
* `minus`는 두 번째 피연산자에 지정된 요소를 제외한 컬렉션을 반환합니다. 피연산자가 단일 요소인 경우, `minus`는 해당 요소가 처음 나타나는 항목만 제거합니다. 두 번째 피연산자가 컬렉션인 경우, `minus`는 해당 컬렉션에 포함된 모든 요소를 제거합니다.

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")

    val plusList = numbers + "five"
    val minusList = numbers - listOf("three", "four")
    
    println(plusList)
    // [one, two, three, four, five]
   
    println(minusList)
    // [one, two]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

컬렉션에 [복합 대입 연산자(augmented assignment operators)](operator-overloading.md#augmented-assignments)인 [`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html)(`+=`) 및 [`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html)(`-=` )을 사용할 수도 있습니다.

* `var`로 선언된 변수에 저장된 읽기 전용 컬렉션의 경우, 이 연산자들은 `plus` 또는 `minus`를 사용하여 연산한 후 결과 컬렉션을 해당 변수에 다시 할당합니다.
* `val`로 선언된 변수에 저장된 가변 컬렉션의 경우, 이 연산자들은 `plusAssign` 또는 `minusAssign`을 사용하여 컬렉션을 제자리에서(in place) 직접 수정합니다.

맵에 대한 `plus` 및 `minus` 연산자에 대한 자세한 내용은 [맵 전용 연산(Map-specific operations)](map-operations.md)을 참고하세요.

## 두 컬렉션 병합하기 {id="merge-two-collections"}

두 컬렉션을 병합하려면 [`union()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/union.html) 함수를 사용합니다. 이 함수는 두 컬렉션의 중복 없는 요소를 포함하는 `Set`을 반환합니다. 중위 표기법(infix form)으로 `a union b`와 같이 호출할 수도 있습니다.

결과는 첫 번째 컬렉션의 순회 순서를 유지하며, 그 뒤에 첫 번째 컬렉션에 없던 두 번째 컬렉션의 요소가 순회 순서대로 이어집니다.

```kotlin
fun main() {
//sampleStart
    val numbers = setOf("one", "two", "three")

    // 컬렉션의 순서를 바꾸면 결과의 순회 순서가 달라집니다
    println(numbers union setOf("four", "five"))
    // [one, two, three, four, five]
    println(setOf("four", "five") union numbers)
    // [four, five, one, two, three]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## 두 컬렉션의 교집합 찾기 {id="find-the-intersection-of-two-collections"}

두 컬렉션 모두에 존재하는 요소(교집합)를 찾으려면 [`intersect()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/intersect.html)를 사용합니다.
첫 번째 컬렉션에는 존재하지만 두 번째 컬렉션에는 없는 요소를 찾으려면 [`subtract()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/subtract.html)를 사용합니다.

두 함수 모두 `Set`을 반환하며 중위 표기법(`a intersect b` 및 `a subtract b`)을 지원합니다.

```kotlin
fun main() {
//sampleStart
    val numbers = setOf("one", "two", "three")

    // 두 컬렉션 모두에 존재하는 요소를 찾습니다
    println(numbers intersect setOf("two", "one"))
    // [one, two]
   
    // 두 번째 컬렉션에 존재하는 요소를 제외합니다
    println(numbers subtract setOf("three", "four"))
    // [one, two]

    // 두 번째 컬렉션의 순서를 바꿔도 결과는 변경되지 않습니다
    println(numbers subtract setOf("four", "three"))
    // [one, two]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## 한 컬렉션에만 존재하는 요소 찾기 {id="find-elements-present-in-only-one-collection"}

두 컬렉션 중 어느 한쪽에만 존재하는 요소를 찾으려면 각 컬렉션을 서로 뺀 다음 그 결과를 `union()`으로 결합합니다. 이 연산을 _대칭 차집합(symmetric difference)_이라고 하며 `Set`을 반환합니다.

```kotlin
fun main() {
//sampleStart
    val numbers = setOf("one", "two", "three")
    val numbers2 = setOf("three", "four")

    // 양방향의 차집합을 결합합니다
    println((numbers - numbers2) union (numbers2 - numbers))
    // [one, two, four]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}