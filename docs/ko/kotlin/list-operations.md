[//]: # (title: List 전용 연산)

[`List`](collection-types.md#list)는 Kotlin에서 가장 널리 사용되는 내장 컬렉션 타입입니다. 리스트 요소에 대한 인덱스 접근은 리스트를 다루기 위한 강력한 연산들을 제공합니다.

## 인덱스로 요소 조회 {id="retrieve-elements-by-index"}

리스트는 요소 조회를 위한 모든 공통 연산을 지원합니다: `elementAt()`, `first()`, `last()` 및 [단일 요소 조회](collection-elements.md)에 나열된 기타 연산들이 포함됩니다.
리스트만의 고유한 특징은 인덱스를 통한 요소 접근이 가능하다는 점이며, 따라서 요소를 읽는 가장 간단한 방법은 인덱스로 요소를 가져오는 것입니다.
이는 인자로 인덱스를 전달하는 [`get()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/get.html) 함수나 축약 구문인 `[index]`를 통해 수행할 수 있습니다.

리스트의 크기가 지정된 인덱스보다 작거나 같으면 예외가 발생합니다.
이러한 예외를 방지하는 데 도움이 되는 두 가지 다른 함수가 있습니다:

* [`getOrElse()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-else.html): 컬렉션에 해당 인덱스가 없을 때 반환할 기본값을 계산하는 함수를 제공할 수 있습니다.
* [`getOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-null.html): 기본값으로 `null`을 반환합니다.

```kotlin

fun main() {
//sampleStart
    val numbers = listOf(1, 2, 3, 4)
    println(numbers.get(0))
    println(numbers[0])
    //numbers.get(5)                         // exception!
    println(numbers.getOrNull(5))             // null
    println(numbers.getOrElse(5, {it}))        // 5
//sampleEnd
}
```
{kotlin-runnable="true"}

## 리스트 일부 조회 {id="retrieve-list-parts"}

[컬렉션 일부 조회](collection-parts.md)를 위한 공통 연산 외에도, 리스트는 지정된 요소 범위를 리스트 형태의 뷰(view)로 반환하는 [`subList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/sub-list.html) 함수를 제공합니다.
따라서 원본 컬렉션의 요소가 변경되면 이전에 생성된 서브리스트에서도 변경되며, 그 반대의 경우도 마찬가지입니다.

```kotlin

fun main() {
//sampleStart
    val numbers = (0..13).toList()
    println(numbers.subList(3, 6))
//sampleEnd
}
```
{kotlin-runnable="true"}

## 요소 위치 찾기 {id="find-element-positions"}

### 선형 탐색 {id="linear-search"}

모든 리스트에서 [`indexOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/index-of.html) 및 [`lastIndexOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last-index-of.html) 함수를 사용하여 요소의 위치를 찾을 수 있습니다.
이 함수들은 리스트에서 주어진 인자와 일치하는 요소의 첫 번째 위치와 마지막 위치를 반환합니다.
일치하는 요소가 없으면 두 함수 모두 `-1`을 반환합니다.

```kotlin

fun main() {
//sampleStart
    val numbers = listOf(1, 2, 3, 4, 2, 5)
    println(numbers.indexOf(2))
    println(numbers.lastIndexOf(2))
//sampleEnd
}
```
{kotlin-runnable="true"}

조건식(predicate)을 받아 조건과 일치하는 요소를 검색하는 함수 쌍도 있습니다:

* [`indexOfFirst()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/index-of-first.html): 조건과 일치하는 *첫 번째 요소의 인덱스*를 반환하며, 일치하는 요소가 없으면 `-1`을 반환합니다.
* [`indexOfLast()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/index-of-last.html): 조건과 일치하는 *마지막 요소의 인덱스*를 반환하며, 일치하는 요소가 없으면 `-1`을 반환합니다.

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4)
    println(numbers.indexOfFirst { it > 2})
    println(numbers.indexOfLast { it % 2 == 1})
//sampleEnd
}
```
{kotlin-runnable="true"}

### 정렬된 리스트에서의 이진 탐색 {id="binary-search-in-sorted-lists"}

리스트에서 요소를 검색하는 또 다른 방법으로 [이진 탐색(binary search)](https://en.wikipedia.org/wiki/Binary_search_algorithm)이 있습니다.
이 방식은 다른 내장 검색 함수보다 훨씬 빠르게 동작하지만, 특정 정렬 기준(자연 순서 또는 함수 파라미터로 제공된 기준)에 따라 *리스트가 오름차순으로 [정렬](collection-ordering.md)*되어 있어야 합니다.
그렇지 않으면 결과를 예측할 수 없습니다.

정렬된 리스트에서 요소를 검색하려면 검색할 값을 인자로 전달하여 [`binarySearch()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/binary-search.html) 함수를 호출합니다.
해당 요소가 존재하면 함수는 그 인덱스를 반환합니다. 그렇지 않은 경우 `(-insertionPoint - 1)`을 반환하며, 여기서 `insertionPoint`는 리스트의 정렬 상태를 유지하면서 해당 요소가 삽입될 수 있는 인덱스입니다.
동일한 값을 가진 요소가 둘 이상인 경우, 검색 결과로 그 중 어느 인덱스든 반환될 수 있습니다.

검색할 인덱스 범위를 지정할 수도 있습니다. 이 경우 함수는 제공된 두 인덱스 사이에서만 검색합니다.

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four")
    numbers.sort()
    println(numbers)
    println(numbers.binarySearch("two"))  // 3
    println(numbers.binarySearch("z")) // -5
    println(numbers.binarySearch("two", 0, 2))  // -3
//sampleEnd
}
```
{kotlin-runnable="true"}

#### Comparator를 사용한 이진 탐색 {id="comparator-binary-search"}

리스트 요소가 `Comparable`을 구현하지 않은 경우, 이진 탐색에 사용할 [`Comparator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-comparator/)를 제공해야 합니다.
이때 리스트는 해당 `Comparator`에 따라 오름차순으로 정렬되어 있어야 합니다. 다음 예제를 살펴보겠습니다:

```kotlin

data class Product(val name: String, val price: Double)

fun main() {
//sampleStart
    val productList = listOf(
        Product("WebStorm", 49.0),
        Product("AppCode", 99.0),
        Product("DotTrace", 129.0),
        Product("ReSharper", 149.0))

    println(productList.binarySearch(Product("AppCode", 99.0), compareBy<Product> { it.price }.thenBy { it.name }))
//sampleEnd
}
```
{kotlin-runnable="true"}

위 예제에는 `Comparable`이 아닌 `Product` 인스턴스 리스트와 정렬 순서를 정의하는 `Comparator`가 있습니다. 상품 `p1`의 가격이 상품 `p2`의 가격보다 낮으면 `p1`이 `p2`보다 앞에 옵니다.
따라서 이 순서에 따라 오름차순으로 정렬된 리스트가 준비되면, `binarySearch()`를 사용하여 지정된 `Product`의 인덱스를 찾을 수 있습니다.

커스텀 비교자(Comparator)는 리스트가 자연 순서와 다른 순서를 사용할 때도 유용합니다. 예를 들어 `String` 요소에 대해 대소문자를 구분하지 않는 순서를 적용할 때 사용할 수 있습니다.

```kotlin

fun main() {
//sampleStart
    val colors = listOf("Blue", "green", "ORANGE", "Red", "yellow")
    println(colors.binarySearch("RED", String.CASE_INSENSITIVE_ORDER)) // 3
//sampleEnd
}
```
{kotlin-runnable="true"}

#### 비교 함수를 사용한 이진 탐색 {id="comparison-binary-search"}

*비교(comparison)* 함수를 사용하는 이진 탐색을 사용하면 명시적인 검색 값을 제공하지 않고도 요소를 찾을 수 있습니다.
대신 요소를 `Int` 값으로 매핑하는 비교 함수를 받아 함수가 0을 반환하는 요소를 검색합니다.
리스트는 제공된 함수에 따라 오름차순으로 정렬되어 있어야 합니다. 다시 말해, 비교 함수의 반환값이 리스트 요소가 진행됨에 따라 증가해야 합니다.

```kotlin

import kotlin.math.sign
//sampleStart
data class Product(val name: String, val price: Double)

fun priceComparison(product: Product, price: Double) = sign(product.price - price).toInt()

fun main() {
    val productList = listOf(
        Product("WebStorm", 49.0),
        Product("AppCode", 99.0),
        Product("DotTrace", 129.0),
        Product("ReSharper", 149.0))

    println(productList.binarySearch { priceComparison(it, 99.0) })
}
//sampleEnd
```
{kotlin-runnable="true"}

Comparator 및 비교 함수를 사용하는 이진 탐색 모두 리스트의 특정 범위를 대상으로 수행할 수도 있습니다.

## List 쓰기 연산 {id="list-write-operations"}

[컬렉션 쓰기 연산](collection-write.md)에 설명된 컬렉션 수정 연산 외에도, [가변(mutable)](collections-overview.md#read-only-and-mutable-collections) 리스트는 고유한 쓰기 연산을 지원합니다.
이러한 연산들은 인덱스를 사용하여 요소에 접근함으로써 리스트 수정 기능을 확장합니다.

### 추가 {id="add"}

리스트의 특정 위치에 요소를 추가하려면 요소가 삽입될 위치를 추가 인자로 전달하여 [`add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/add.html) 및 [`addAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/add-all.html)을 사용합니다.
해당 위치 뒤에 있는 모든 요소는 오른쪽으로 이동합니다.

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "five", "six")
    numbers.add(1, "two")
    numbers.addAll(2, listOf("three", "four"))
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

### 수정 {id="update"}

리스트는 지정된 위치의 요소를 교체하는 함수인 [`set()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/set.html)과 연산자 형태인 `[]`도 제공합니다. `set()`은 다른 요소들의 인덱스를 변경하지 않습니다.

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "five", "three")
    numbers[1] =  "two"
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

[`fill()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fill.html)은 단순히 컬렉션의 모든 요소를 지정된 값으로 바꿉니다.

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4)
    numbers.fill(3)
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

### 제거 {id="remove"}

리스트의 특정 위치에 있는 요소를 제거하려면 위치를 인자로 전달하여 [`removeAt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/remove-at.html) 함수를 사용합니다.
제거된 요소 뒤에 오는 모든 요소의 인덱스는 1씩 감소합니다.

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4, 3)    
    numbers.removeAt(1)
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

### 정렬 {id="sort"}

[컬렉션 정렬](collection-ordering.md)에서는 특정 순서로 컬렉션 요소를 조회하는 연산에 대해 설명했습니다.
가변 리스트의 경우, 표준 라이브러리는 동일한 정렬 작업을 제자리(in-place)에서 수행하는 유사한 확장 함수들을 제공합니다.
리스트 인스턴스에 이러한 연산을 적용하면 해당 인스턴스 자체의 요소 순서가 변경됩니다.

제자리 정렬 함수들은 읽기 전용 리스트에 적용되는 함수들과 이름이 유사하지만, `ed/d` 접미사가 붙지 않습니다:

* 모든 정렬 함수 이름에서 `sorted*` 대신 `sort*`를 사용합니다: [`sort()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sort.html), [`sortDescending()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sort-descending.html), [`sortBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sort-by.html) 등.
* `shuffled()` 대신 [`shuffle()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/shuffle.html)을 사용합니다.
* `reversed()` 대신 [`reverse()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reverse.html)를 사용합니다.

가변 리스트에서 [`asReversed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/as-reversed.html)를 호출하면 원본 리스트의 역순 뷰인 또 다른 가변 리스트가 반환됩니다. 이 뷰에서의 변경 사항은 원본 리스트에도 반영됩니다.
다음 예제는 가변 리스트를 위한 정렬 함수들을 보여줍니다:

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four")

    numbers.sort()
    println("Sort into ascending: $numbers")
    numbers.sortDescending()
    println("Sort into descending: $numbers")

    numbers.sortBy { it.length }
    println("Sort into ascending by length: $numbers")
    numbers.sortByDescending { it.last() }
    println("Sort into descending by the last letter: $numbers")
    
    numbers.sortWith(compareBy<String> { it.length }.thenBy { it })
    println("Sort by Comparator: $numbers")

    numbers.shuffle()
    println("Shuffle: $numbers")

    numbers.reverse()
    println("Reverse: $numbers")
//sampleEnd
}
```
{kotlin-runnable="true"}