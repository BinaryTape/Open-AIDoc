[//]: # (title: Java 및 Kotlin의 컬렉션)

<web-summary>Java 컬렉션에서 Kotlin 컬렉션으로 마이그레이션하는 방법을 알아봅니다. 이 가이드는 Kotlin 및 Java의 List, ArrayList, Map, Set 등의 데이터 구조를 다룹니다.</web-summary>

컬렉션(Collections)은 해결하려는 문제에서 중요하며 공통적으로 조작되는 가변적인 수의 항목(0개일 수도 있음) 그룹입니다.
이 가이드는 Java와 Kotlin의 컬렉션 개념 및 연산을 설명하고 비교합니다.
이 가이드는 Java에서 Kotlin으로 마이그레이션하고 Kotlin다운 방식으로 코드를 작성하는 데 도움이 될 것입니다.

이 가이드의 첫 번째 부분은 Java와 Kotlin에서 동일한 컬렉션에 대한 연산 용어집을 요약하여 담고 있습니다.
이 부분은 [Java와 Kotlin에서 동일한 연산](#operations-that-are-the-same-in-java-and-kotlin)과 [Java 표준 라이브러리에 없는 연산](#operations-that-don-t-exist-in-java-s-standard-library)으로 나뉩니다.
[가변성(Mutability)](#mutability)부터 시작하는 가이드의 두 번째 부분에서는 특정 사례를 통해 몇 가지 차이점을 설명합니다.

컬렉션 입문은 [컬렉션 개요](collections-overview.md)를 참조하거나 Kotlin Developer Advocate인 Sebastian Aigner의 [비디오](https://www.youtube.com/watch?v=F8jj7e-_jFA)를 시청하세요.

> 아래 모든 예제는 Java 및 Kotlin 표준 라이브러리 API만을 사용합니다.
>
{style="note"}

## Java와 Kotlin에서 동일한 연산

Kotlin에는 Java의 대응되는 기능과 정확히 동일하게 보이는 컬렉션 연산이 많이 있습니다.

### 리스트, 세트, 큐, 데크에 대한 연산

| 설명 | 공통 연산 | 기타 Kotlin 대안 |
|-------------|-----------|---------------------|
| 요소 또는 요소들을 추가합니다. | `add()`, `addAll()` | [`plusAssign`(`+=`) 연산자](collection-plus-minus.md)를 사용하세요: `collection += element`, `collection += anotherCollection`. |
| 컬렉션에 요소 또는 요소들이 포함되어 있는지 확인합니다. | `contains()`, `containsAll()` | [`in` 키워드](collection-elements.md#check-element-existence)를 사용하여 연산자 형태로 `contains()`를 호출하세요: `element in collection`. |
| 컬렉션이 비어 있는지 확인합니다. | `isEmpty()` | [`isNotEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-not-empty.html)를 사용하여 컬렉션이 비어 있지 않은지 확인하세요. |
| 특정 조건에서 제거합니다. | `removeIf()` | |
| 선택된 요소만 남깁니다. | `retainAll()` | |
| 컬렉션에서 모든 요소를 제거합니다. | `clear()` | |
| 컬렉션에서 스트림을 가져옵니다. | `stream()` | Kotlin은 스트림을 처리하는 자체적인 방식인 [시퀀스(sequences)](#sequences)와 [`map()`](collection-filtering.md) 및 [`filter()`](#filter-elements) 같은 메서드를 제공합니다. |
| 컬렉션에서 반복자(iterator)를 가져옵니다. | `iterator()` | |

### 맵에 대한 연산

| 설명 | 공통 연산 | 기타 Kotlin 대안 |
|-------------|-----------|---------------------|
| 요소 또는 요소들을 추가합니다. | `put()`, `putAll()`, `putIfAbsent()`| Kotlin에서 `map[key] = value` 할당은 `put(key, value)`와 동일하게 작동합니다. 또한 [`plusAssign`(`+=`) 연산자](collection-plus-minus.md)인 `map += Pair(key, value)` 또는 `map += anotherMap`을 사용할 수 있습니다. |
| 요소 또는 요소들을 교체합니다. | `put()`, `replace()`, `replaceAll()` | `put()` 및 `replace()` 대신 인덱싱 연산자 `map[key] = value`를 사용하세요. |
| 요소를 가져옵니다. | `get()` | 요소를 가져오려면 인덱싱 연산자 `map[index]`를 사용하세요. |
| 맵에 요소 또는 요소들이 포함되어 있는지 확인합니다. | `containsKey()`, `containsValue()` | [`in` 키워드](collection-elements.md#check-element-existence)를 사용하여 연산자 형태로 `contains()`를 호출하세요: `element in map`. |
| 맵이 비어 있는지 확인합니다. |  `isEmpty()` | [`isNotEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-not-empty.html)를 사용하여 맵이 비어 있지 않은지 확인하세요. |
| 요소를 제거합니다. | `remove(key)`, `remove(key, value)` | [`minusAssign`(`-=`) 연산자](collection-plus-minus.md)인 `map -= key`를 사용하세요. |
| 맵에서 모든 요소를 제거합니다. | `clear()` | |
| 맵에서 스트림을 가져옵니다. | 엔트리(entries), 키(keys), 값(values)에 대한 `stream()` | |

### 리스트에만 존재하는 연산

| 설명 | 공통 연산 | 기타 Kotlin 대안 |
|-------------|-----------|---------------------|
| 요소의 인덱스를 가져옵니다. | `indexOf()` | |
| 요소의 마지막 인덱스를 가져옵니다. | `lastIndexOf()` | |
| 요소를 가져옵니다. | `get()` | 요소를 가져오려면 인덱싱 연산자 `list[index]`를 사용하세요. |
| 하위 리스트(sublist)를 가져옵니다. | `subList()` | |
| 요소 또는 요소들을 교체합니다. | `set()`,  `replaceAll()` | `set()` 대신 인덱싱 연산자 `list[index] = value`를 사용하세요. |

## 약간 다른 연산들

### 모든 컬렉션 타입에 대한 연산

| 설명 | Java | Kotlin |
|-------------|------|--------|
| 컬렉션의 크기를 가져옵니다. | `size()` | `count()`, `size` |
| 중첩된 컬렉션 요소에 평면적으로 접근합니다. | `collectionOfCollections.forEach(flatCollection::addAll)` 또는 `collectionOfCollections.stream().flatMap().collect()` | [`flatten()`](collection-transformations.md#flatten) 또는 [`flatMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/flat-map.html) |
| 모든 요소에 지정된 함수를 적용합니다. | `stream().map().collect()` | [`map()`](collection-filtering.md) |
| 컬렉션 요소에 제공된 연산을 순차적으로 적용하고 누적된 결과를 반환합니다. | `stream().reduce()` | [`reduce()`, `fold()`](collection-aggregate.md#fold-and-reduce) |
| 분류기(classifier)에 의해 요소를 그룹화하고 개수를 셉니다. | `stream().collect(Collectors.groupingBy(classifier, counting()))` | [`eachCount()`](collection-grouping.md) |
| 조건에 따라 필터링합니다. | `stream().filter().collect()` | [`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html) |
| 컬렉션 요소가 조건을 만족하는지 확인합니다. | `stream().noneMatch()`, `stream().anyMatch()`, `stream().allMatch()` | [`none()`, `any()`, `all()`](collection-filtering.md) |
| 요소를 정렬합니다. | `stream().sorted().collect()` | [`sorted()`](collection-ordering.md#natural-order) |
| 처음 N개 요소를 가져옵니다. | `stream().limit(N).collect()` | [`take(N)`](collection-parts.md#take-and-drop) |
| 서술어(predicate)를 만족하는 요소를 가져옵니다. | `stream().takeWhile().collect()` | [`takeWhile()`](collection-parts.md#take-and-drop) |
| 처음 N개 요소를 건너뜁니다. | `stream().skip(N).collect()` | [`drop(N)`](collection-parts.md#take-and-drop) |
| 서술어를 만족하는 요소를 건너뜁니다. | `stream().dropWhile().collect()` | [`dropWhile()`](collection-parts.md#take-and-drop) |
| 컬렉션 요소와 그와 연관된 특정 값으로 맵을 생성합니다. | `stream().collect(toMap(keyMapper, valueMapper))` | [`associate()`](collection-transformations.md#associate) |

맵에서 위에 나열된 모든 연산을 수행하려면 먼저 맵의 `entrySet`을 가져와야 합니다.

### 리스트에 대한 연산

| 설명 | Java | Kotlin |
|-------------|------|--------|
| 리스트를 자연 순서(natural order)로 정렬합니다. | `sort(null)` | `sort()` |
| 리스트를 내림차순으로 정렬합니다. | `sort(comparator)` | `sortDescending()` |
| 리스트에서 요소를 제거합니다. | `remove(index)`, `remove(element)`| `removeAt(index)`, `remove(element)` 또는 [`collection -= element`](collection-plus-minus.md) |
| 리스트의 모든 요소를 특정 값으로 채웁니다. | `Collections.fill()` | [`fill()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fill.html) |
| 리스트에서 중복되지 않는 고유한 요소를 가져옵니다. | `stream().distinct().toList()` | [`distinct()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/distinct.html) |

## Java 표준 라이브러리에 없는 연산

* [`zip()`, `unzip()`](collection-transformations.md) – 컬렉션을 변환합니다.
* [`aggregate()`](collection-grouping.md) – 조건에 따라 그룹화합니다.
* [`takeLast()`, `takeLastWhile()`, `dropLast()`, `dropLastWhile()`](collection-parts.md#take-and-drop) – 서술어(predicate)에 따라 요소를 가져오거나 제거합니다.
* [`slice()`, `chunked()`, `windowed()`](collection-parts.md) – 컬렉션의 일부를 검색합니다.
* [Plus (`+`) 및 minus (`-`) 연산자](collection-plus-minus.md) – 요소를 추가하거나 제거합니다.

`zip()`, `chunked()`, `windowed()` 및 기타 연산에 대해 자세히 알아보려면 Sebastian Aigner의 Kotlin 고급 컬렉션 연산에 관한 영상을 시청하세요.

<video src="https://www.youtube.com/v/N4CpLxGJlq0" title="고급 컬렉션 연산"/>

## 가변성(Mutability)

Java에는 가변 컬렉션이 있습니다.

```java
// Java
// 이 리스트는 가변적입니다!
public `List<Customer>` getCustomers() { ... }
```
{id="mutability-java"}

부분적으로 가변적인 컬렉션도 있습니다.

```java
// Java
List<String> numbers = Arrays.asList("one", "two", "three", "four");
numbers.add("five"); // 런타임에 `UnsupportedOperationException` 발생
```
{id="mutability-partly-java"}

그리고 불변 컬렉션도 있습니다.

```java
// Java
List<String> numbers = new LinkedList<>();
// 이 리스트는 불변입니다!
List<String> immutableCollection = Collections.unmodifiableList(numbers);
immutableCollection.add("five"); // 런타임에 `UnsupportedOperationException` 발생
```
{id="immutable-java"}

IntelliJ IDEA에서 마지막 두 코드를 작성하면 IDE는 불변 객체를 수정하려 한다는 경고를 표시합니다. 이 코드는 컴파일되지만 런타임에 `UnsupportedOperationException`과 함께 실패합니다. 타입만 보고는 컬렉션이 가변적인지 알 수 없습니다.

Java와 달리 Kotlin에서는 필요에 따라 가변 컬렉션 또는 읽기 전용 컬렉션을 명시적으로 선언합니다. 읽기 전용 컬렉션을 수정하려고 하면 코드가 컴파일되지 않습니다.

```kotlin
// Kotlin
val numbers = mutableListOf("one", "two", "three", "four")
numbers.add("five")            // 문제 없음
val immutableNumbers = listOf("one", "two")
//immutableNumbers.add("five") // 컴파일 에러 - Unresolved reference: add
```
{id="mutability-kotlin"}

불변성에 대한 자세한 내용은 [Kotlin 코딩 컨벤션](coding-conventions.md#immutability) 페이지를 참조하세요.

## 공변성(Covariance)

Java에서는 자손 타입의 컬렉션을 조상 타입의 컬렉션을 받는 함수에 전달할 수 없습니다. 예를 들어 `Rectangle`이 `Shape`를 상속하는 경우, `Rectangle` 요소의 컬렉션을 `Shape` 요소의 컬렉션을 받는 함수에 전달할 수 없습니다. 코드를 컴파일 가능하게 하려면 `? extends Shape` 타입을 사용하여 함수가 `Shape`의 모든 상속자를 갖는 컬렉션을 받을 수 있게 해야 합니다.

```java
// Java
class Shape {}

class Rectangle extends Shape {}

public void doSthWithShapes(List<? extends Shape> shapes) {
/* List<Shape>만 사용할 경우 아래와 같이 List<Rectangle>을 
인자로 하여 이 함수를 호출할 때 코드가 컴파일되지 않습니다. */
}

public void main() {
    var rectangles = List.of(new Rectangle(), new Rectangle());
    doSthWithShapes(rectangles);
}
```
{id="covariance-java"}

Kotlin에서 읽기 전용 컬렉션 타입은 [공변성(covariant)](generics.md#variance)을 갖습니다. 이는 `Rectangle` 클래스가 `Shape` 클래스를 상속하는 경우, `List<Shape>` 타입이 필요한 모든 곳에 `List<Rectangle>` 타입을 사용할 수 있음을 의미합니다. 즉, 컬렉션 타입은 요소 타입과 동일한 서브타이핑 관계를 갖습니다. 맵은 값 타입에 대해서는 공변적이지만 키 타입에 대해서는 그렇지 않습니다. 가변 컬렉션은 공변적이지 않습니다. 이는 런타임 실패로 이어질 수 있기 때문입니다.

```kotlin
// Kotlin
open class Shape(val name: String)

class Rectangle(private val rectangleName: String) : Shape(rectangleName)

fun doSthWithShapes(shapes: List<Shape>) {
    println("The shapes are: ${shapes.joinToString { it.name }}")
}

fun main() {
    val rectangles = listOf(Rectangle("rhombus"), Rectangle("parallelepiped"))
    doSthWithShapes(rectangles)
}
```
{kotlin-runnable="true" id="covariance-kotlin"}

[컬렉션 타입](collections-overview.md#collection-types)에 대한 자세한 내용은 여기를 참조하세요.

## 범위(Ranges) 및 프로그레션(Progressions)

Kotlin에서는 [범위(ranges)](ranges.md)를 사용하여 구간을 만들 수 있습니다. 예를 들어 `Version(1, 11)..Version(1, 30)`은 `1.11`부터 `1.30`까지의 모든 버전을 포함합니다. `in` 연산자를 사용하여 해당 버전이 범위 내에 있는지 확인할 수 있습니다: `Version(0, 9) in versionRange`.

Java에서는 `Version`이 양쪽 경계에 맞는지 수동으로 확인해야 합니다.

```java
// Java
class Version implements Comparable<Version> {

    int major;
    int minor;

    Version(int major, int minor) {
        this.major = major;
        this.minor = minor;
    }

    @Override
    public int compareTo(Version o) {
        if (this.major != o.major) {
            return this.major - o.major;
        }
        return this.minor - o.minor;
    }
}

public void compareVersions() {
    var minVersion = new Version(1, 11);
    var maxVersion = new Version(1, 31);

   System.out.println(
           versionIsInRange(new Version(0, 9), minVersion, maxVersion));
   System.out.println(
           versionIsInRange(new Version(1, 20), minVersion, maxVersion));
}

public Boolean versionIsInRange(Version versionToCheck, Version minVersion, 
                                Version maxVersion) {
    return versionToCheck.compareTo(minVersion) >= 0 
            && versionToCheck.compareTo(maxVersion) <= 0;
}
```
{id="ranges-java"}

Kotlin에서는 범위를 하나의 전체 객체로 다룹니다. 두 개의 변수를 만들고 `Version`과 비교할 필요가 없습니다.

```kotlin
// Kotlin
class Version(val major: Int, val minor: Int): Comparable<Version> {
    override fun compareTo(other: Version): Int {
        if (this.major != other.major) {
            return this.major - other.major
        }
        return this.minor - other.minor
    }
}

fun main() {
    val versionRange = Version(1, 11)..Version(1, 30)

    println(Version(0, 9) in versionRange)
    println(Version(1, 20) in versionRange)
}
```
{kotlin-runnable="true" id="ranges-kotlin"}

버전이 최소 버전보다 크거나 같고(`>=`) 최대 버전보다 작은지(`<`) 확인하는 경우와 같이 경계 중 하나를 제외해야 할 때는 이러한 포함 범위(inclusive ranges)가 도움이 되지 않습니다.

## 여러 기준으로 비교

Java에서 여러 기준으로 객체를 비교하려면 [`Comparator`](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html) 인터페이스의 [`comparing()`](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html#comparing-java.util.function.Function-) 및 [`thenComparingX()`](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html#thenComparing-java.util.Comparator-) 함수를 사용할 수 있습니다. 예를 들어 사람들을 이름과 나이로 비교하는 경우입니다.

```java
class Person implements Comparable<Person> {
    String name;
    int age;

    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }

    Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public String toString() {
        return this.name + " " + age;
    }
}

public void comparePersons() {
    var persons = List.of(new Person("Jack", 35), new Person("David", 30), 
            new Person("Jack", 25));
    System.out.println(persons.stream().sorted(Comparator
            .comparing(Person::getName)
            .thenComparingInt(Person::getAge)).collect(toList()));
}
```
{id="comparison-java"}

Kotlin에서는 비교하고자 하는 필드를 나열하기만 하면 됩니다.

```kotlin
data class Person(
    val name: String,
    val age: Int
)

fun main() {
    val persons = listOf(Person("Jack", 35), Person("David", 30), 
        Person("Jack", 25))
    println(persons.sortedWith(compareBy(Person::name, Person::age)))
}
```
{kotlin-runnable="true" id="comparison-kotlin"}

## 시퀀스(Sequences)

Java에서는 다음과 같은 방식으로 숫자 시퀀스를 생성할 수 있습니다.

```java
// Java
int sum = IntStream.iterate(1, e -> e + 3)
    .limit(10).sum();
System.out.println(sum); // 145 출력
```
{id="sequences-java"}

Kotlin에서는 _[시퀀스(sequences)](sequences.md)_를 사용합니다. 시퀀스의 다단계 처리는 가능한 경우 지연(lazily) 실행됩니다. 실제 계산은 전체 처리 체인의 결과가 요청될 때만 발생합니다.

```kotlin
fun main() {
//sampleStart
    // Kotlin
    val sum = generateSequence(1) {
        it + 3
    }.take(10).sum()
    println(sum) // 145 출력
//sampleEnd
}
```
{kotlin-runnable="true" id="sequences-kotlin"}

시퀀스는 일부 필터링 연산을 수행하는 데 필요한 단계 수를 줄일 수 있습니다. `Iterable`과 `Sequence`의 차이점을 보여주는 [시퀀스 처리 예제](sequences.md#sequence-processing-example)를 참조하세요.

## 리스트에서 요소 제거

Java에서 [`remove()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/List.html#remove(int)) 함수는 제거할 요소의 인덱스를 인자로 받습니다.

정수 요소를 제거할 때는 `Integer.valueOf()` 함수를 `remove()` 함수의 인자로 사용하세요.

```java
// Java
public void remove() {
    var numbers = new ArrayList<>();
    numbers.add(1);
    numbers.add(2);
    numbers.add(3);
    numbers.add(1);
    numbers.remove(1); // 인덱스에 의한 제거
    System.out.println(numbers); // [1, 3, 1]
    numbers.remove(Integer.valueOf(1));
    System.out.println(numbers); // [3, 1]
}
```
{id="remove-elements-java"}

Kotlin에는 두 가지 유형의 요소 제거가 있습니다. [`removeAt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/remove-at.html)을 사용한 인덱스에 의한 제거와 [`remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/remove.html)를 사용한 값에 의한 제거입니다.

```kotlin
fun main() {
//sampleStart
    // Kotlin
    val numbers = mutableListOf(1, 2, 3, 1)
    numbers.removeAt(0)
    println(numbers) // [2, 3, 1]
    numbers.remove(1)
    println(numbers) // [2, 3]
//sampleEnd
}
```
{kotlin-runnable="true" id="remove-elements-kotlin"}

## 맵 탐색

Java에서는 [`forEach`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Map.html#forEach(java.util.function.BiConsumer))를 통해 맵을 탐색할 수 있습니다.

```java
// Java
numbers.forEach((k,v) -> System.out.println("Key = " + k + ", Value = " + v));
```
{id="traverse-map-java"}

Kotlin에서는 Java의 `forEach`와 유사하게 `for` 루프 또는 `forEach`를 사용하여 맵을 탐색합니다.

```kotlin
// Kotlin
for ((k, v) in numbers) {
    println("Key = $k, Value = $v")
}
// 또는
numbers.forEach { (k, v) -> println("Key = $k, Value = $v") }
```
{id="traverse-map-kotlin"}

## 비어 있을 수 있는 컬렉션에서 첫 번째와 마지막 항목 가져오기

Java에서는 컬렉션의 크기를 확인하고 인덱스를 사용하여 첫 번째와 마지막 항목을 안전하게 가져올 수 있습니다.

```java
// Java
var list = new ArrayList<>();
//...
if (list.size() > 0) {
    System.out.println(list.get(0));
    System.out.println(list.get(list.size() - 1));
}
```
{id="list-get-first-last-java"}

[`Deque`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Deque.html) 및 그 상속자들에 대해서는 [`getFirst()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Deque.html#getFirst()) 및 [`getLast()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Deque.html#getLast()) 함수를 사용할 수도 있습니다.

```java
// Java
var deque = new ArrayDeque<>();
//...
if (deque.size() > 0) {
    System.out.println(deque.getFirst());
    System.out.println(deque.getLast());
}
```
{id="deque-get-first-last-java"}

Kotlin에는 특별한 함수인 [`firstOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-or-null.html) 및 [`lastOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last-or-null.html)이 있습니다. [`Elvis 연산자`](null-safety.md#elvis-operator)를 사용하면 함수의 결과에 따라 즉시 추가 작업을 수행할 수 있습니다. 예를 들어 `firstOrNull()`입니다.

```kotlin
// Kotlin
val emails = listOf<String>() // 비어 있을 수 있음
val theOldestEmail = emails.firstOrNull() ?: ""
val theFreshestEmail = emails.lastOrNull() ?: ""
```
{id="get-first-last-kotlin"}

## 리스트로부터 세트 생성

Java에서 [`List`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/List.html)로부터 [`Set`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Set.html)을 생성하려면 [`Set.copyOf`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Set.html#copyOf(java.util.Collection)) 함수를 사용할 수 있습니다.

```java
// Java
public void listToSet() {
    var sourceList = List.of(1, 2, 3, 1);
    var copySet = Set.copyOf(sourceList);
    System.out.println(copySet);
}
```
{id="list-to-set-java"}

Kotlin에서는 `toSet()` 함수를 사용하세요.

```kotlin
fun main() {
//sampleStart
    // Kotlin
    val sourceList = listOf(1, 2, 3, 1)
    val copySet = sourceList.toSet()
    println(copySet)
//sampleEnd
}
```
{kotlin-runnable="true" id="list-to-set-kotlin"}

## 요소 그룹화

Java에서는 [Collectors](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Collectors.html)의 `groupingBy()` 함수로 요소를 그룹화할 수 있습니다.

```java
// Java
public void analyzeLogs() {
    var requests = List.of(
        new Request("https://kotlinlang.org/docs/home.html", 200),
        new Request("https://kotlinlang.org/docs/home.html", 400),
        new Request("https://kotlinlang.org/docs/comparison-to-java.html", 200)
    );
    var urlsAndRequests = requests.stream().collect(
            Collectors.groupingBy(Request::getUrl));
    System.out.println(urlsAndRequests);
}
```
{id="group-elements-java"}

Kotlin에서는 [`groupBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/group-by.html) 함수를 사용하세요.

```kotlin
data class Request(
    val url: String,
    val responseCode: Int
)

fun main() {
//sampleStart
    // Kotlin
    val requests = listOf(
        Request("https://kotlinlang.org/docs/home.html", 200),
        Request("https://kotlinlang.org/docs/home.html", 400),
        Request("https://kotlinlang.org/docs/comparison-to-java.html", 200)
    )
    println(requests.groupBy(Request::url))
//sampleEnd
}
```
{kotlin-runnable="true" id="group-elements-kotlin"}

## 요소 필터링

Java에서 컬렉션의 요소를 필터링하려면 [Stream API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html)를 사용해야 합니다. Stream API에는 `intermediate`(중간) 및 `terminal`(최종) 연산이 있습니다. `filter()`는 스트림을 반환하는 중간 연산입니다. 출력으로 컬렉션을 받으려면 `collect()`와 같은 최종 연산을 사용해야 합니다. 예를 들어 키가 `1`로 끝나고 값이 `10`보다 큰 쌍만 남기는 경우입니다.

```java
// Java
public void filterEndsWith() {
    var numbers = Map.of("key1", 1, "key2", 2, "key3", 3, "key11", 11);
    var filteredNumbers = numbers.entrySet().stream()
        .filter(entry -> entry.getKey().endsWith("1") && entry.getValue() > 10)
        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    System.out.println(filteredNumbers);
}
```
{id="filter-elements-java"}

Kotlin에서 필터링은 컬렉션에 기본적으로 포함되어 있으며, `filter()`는 필터링된 것과 동일한 컬렉션 타입을 반환합니다. 따라서 `filter()`와 그 서술어(predicate)만 작성하면 됩니다.

```kotlin
fun main() {
//sampleStart
    // Kotlin
    val numbers = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key11" to 11)
    val filteredNumbers = numbers.filter { (key, value) -> key.endsWith("1") && value > 10 }
    println(filteredNumbers)
//sampleEnd
}
```
{kotlin-runnable="true" id="filter-elements-kotlin"}

[맵 필터링](map-operations.md#filter)에 대한 자세한 내용은 여기를 참조하세요.

### 타입별 요소 필터링

Java에서 타입별로 요소를 필터링하고 작업을 수행하려면 [`instanceof`](https://docs.oracle.com/en/java/javase/17/language/pattern-matching-instanceof-operator.html) 연산자로 타입을 확인한 다음 타입 캐스팅을 수행해야 합니다.

```java
// Java
public void objectIsInstance() {
    var numbers = new ArrayList<>();
    numbers.add(null);
    numbers.add(1);
    numbers.add("two");
    numbers.add(3.0);
    numbers.add("four");
    System.out.println("All String elements in upper case:");
    numbers.stream().filter(it -> it instanceof String)
        .forEach( it -> System.out.println(((String) it).toUpperCase()));
}
```
{id="filter-by-type-java"}

Kotlin에서는 컬렉션에서 [`filterIsInstance<NEEDED_TYPE>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-is-instance.html)를 호출하기만 하면 되며, 타입 캐스팅은 [스마트 캐스트(Smart casts)](typecasts.md#smart-casts)에 의해 수행됩니다.

```kotlin
// Kotlin
fun main() {
//sampleStart
    // Kotlin
    val numbers = listOf(null, 1, "two", 3.0, "four")
    println("All String elements in upper case:")
    numbers.filterIsInstance<String>().forEach {
        println(it.uppercase())
    }
//sampleEnd
}
```
{kotlin-runnable="true" id="filter-by-type-kotlin"}

### 서술어 테스트(Test predicates)

일부 작업에서는 모든 요소, 어떤 요소도 없음, 또는 일부 요소가 조건을 만족하는지 확인해야 합니다.
Java에서는 [Stream API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html) 함수인 [`allMatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html#allMatch(java.util.function.Predicate)), [`noneMatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html#noneMatch(java.util.function.Predicate)), [`anyMatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html#anyMatch(java.util.function.Predicate))를 통해 이러한 모든 확인을 수행할 수 있습니다.

```java
// Java
public void testPredicates() {
    var numbers = List.of("one", "two", "three", "four");
    System.out.println(numbers.stream().noneMatch(it -> it.endsWith("e"))); // false
    System.out.println(numbers.stream().anyMatch(it -> it.endsWith("e"))); // true
    System.out.println(numbers.stream().allMatch(it -> it.endsWith("e"))); // false
}
```
{id="test-predicates-java"}

Kotlin에서는 모든 [Iterable](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/#kotlin.collections.Iterable) 객체에서 [확장 함수(extension functions)](extensions.md)인 `none()`, `any()`, `all()`을 사용할 수 있습니다.

```kotlin
fun main() {
//sampleStart
// Kotlin
    val numbers = listOf("one", "two", "three", "four")
    println(numbers.none { it.endsWith("e") })
    println(numbers.any { it.endsWith("e") })
    println(numbers.all { it.endsWith("e") })
//sampleEnd
}
```
{kotlin-runnable="true" id="test-predicates-kotlin"}

[서술어 테스트](collection-filtering.md#test-predicates)에 대해 자세히 알아보세요.

## 컬렉션 변환 연산

### 요소 Zip 처리

Java에서는 두 컬렉션을 동시에 반복하여 동일한 위치의 요소들로 쌍을 만들 수 있습니다.

```java
// Java
public void zip() {
    var colors = List.of("red", "brown");
    var animals = List.of("fox", "bear", "wolf");

    for (int i = 0; i < Math.min(colors.size(), animals.size()); i++) {
        String animal = animals.get(i);
        System.out.println("The " + animal.substring(0, 1).toUpperCase()
               + animal.substring(1) + " is " + colors.get(i));
   }
}
```
{id="zip-elements-java"}

단순히 요소 쌍을 출력하는 것보다 복잡한 작업을 원한다면 [레코드(Records)](https://docs.oracle.com/en/java/javase/17/language/records.html)를 사용할 수 있습니다. 위의 예시에서 레코드는 `record AnimalDescription(String animal, String color) {}`가 됩니다.

Kotlin에서는 [`zip()`](collection-transformations.md#zip) 함수를 사용하여 동일한 작업을 수행할 수 있습니다.

```kotlin
fun main() {
//sampleStart
    // Kotlin
    val colors = listOf("red", "brown")
    val animals = listOf("fox", "bear", "wolf")

    println(colors.zip(animals) { color, animal -> 
        "The ${animal.replaceFirstChar { it.uppercase() }} is $color" })
//sampleEnd
}
```
{kotlin-runnable="true" id="zip-elements-kotlin"}

`zip()`은 [Pair](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-pair/) 객체의 리스트(List)를 반환합니다.

> 컬렉션의 크기가 서로 다른 경우 `zip()`의 결과는 더 작은 크기를 따릅니다. 더 큰 컬렉션의 마지막 요소들은 결과에 포함되지 않습니다.
>
{style="note"}

### 요소 연관(Associate) 처리

Java에서는 [Stream API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html)를 사용하여 요소를 특성과 연관시킬 수 있습니다.

```java
// Java
public void associate() {
    var numbers = List.of("one", "two", "three", "four");
    var wordAndLength = numbers.stream()
        .collect(toMap(number -> number, String::length));
    System.out.println(wordAndLength);
}
```
{id="associate-elements-java"}

Kotlin에서는 [`associate()`](collection-transformations.md#associate) 함수를 사용하세요.

```kotlin
fun main() {
//sampleStart
    // Kotlin
    val numbers = listOf("one", "two", "three", "four")
    println(numbers.associateWith { it.length })
//sampleEnd
}
```
{kotlin-runnable="true" id="associate-elements-kotlin"}

## 다음 단계는?

* [Kotlin Koans](koans.md)를 방문하세요 – Kotlin 구문을 배우기 위한 연습 문제를 완료하세요. 각 연습 문제는 실패하는 단위 테스트로 만들어져 있으며, 여러분의 역할은 이를 통과하게 만드는 것입니다.
* 다른 [Kotlin 관용구(idioms)](idioms.md)를 살펴보세요.
* [Java to Kotlin 변환기](mixing-java-kotlin-intellij.md#convert-java-files-to-kotlin)를 사용하여 기존 Java 코드를 Kotlin으로 변환하는 방법을 알아보세요.
* [Kotlin의 컬렉션](collections-overview.md)에 대해 알아보세요.

즐겨 사용하는 관용구가 있다면 풀 리퀘스트를 보내 공유해 주세요.