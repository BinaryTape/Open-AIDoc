[//]: # (title: Java 및 Kotlin의 컬렉션)

<web-summary>Java 컬렉션에서 Kotlin 컬렉션으로 마이그레이션하는 방법을 알아봅니다. 이 가이드에서는 Kotlin 및 Java의 List, ArrayList, Map, Set 등의 데이터 구조를 다룹니다.</web-summary>

_컬렉션(Collections)_은 해결하려는 문제에 유의미하며 공통적으로 작업의 대상이 되는 가변적인 개수(0개일 수도 있음)의 항목 모음입니다.
이 가이드에서는 Java와 Kotlin의 컬렉션 개념 및 연산을 설명하고 비교합니다.
이를 통해 Java에서 Kotlin으로 쉽게 마이그레이션하고, 진정한 Kotlin다운 방식으로 코드를 작성할 수 있도록 돕습니다.

이 가이드의 첫 번째 부분에는 Java와 Kotlin의 동일한 컬렉션 연산에 대한 빠른 용어집이 포함되어 있습니다.
이는 [동일한 연산](#operations-that-are-the-same-in-java-and-kotlin)과 [Kotlin에만 존재하는 연산](#operations-that-don-t-exist-in-java-s-standard-library)으로 나뉩니다.
[가변성](#mutability)부터 시작하는 두 번째 부분에서는 구체적인 사례를 살펴보며 몇 가지 차이점을 설명합니다.

컬렉션에 대한 입문 내용은 [컬렉션 개요](collections-overview.md)를 참조하거나 Kotlin 개발자 에반젤리스트 Sebastian Aigner의 [비디오](https://www.youtube.com/watch?v=F8jj7e-_jFA)를 시청하세요.

> 아래의 모든 예제는 Java 및 Kotlin 표준 라이브러리 API만을 사용합니다.
>
{style="note"}

## Java와 Kotlin에서 동일한 연산 {id="operations-that-are-the-same-in-java-and-kotlin"}

Kotlin에는 Java의 해당 기능과 완전히 동일하게 동작하는 컬렉션 연산이 많이 있습니다.

### List, Set, Queue, Deque 연산 {id="operations-on-lists-sets-queues-and-deques"}

| 설명 | 일반적인 연산 | 더 Kotlin다운 대안 |
|---|---|---|
| 하나 이상의 요소 추가 | `add()`, `addAll()` | [`plusAssign`(`+=`) 연산자](collection-combine.md#add-and-remove-elements) 사용: `collection += element`, `collection += anotherCollection` |
| 컬렉션에 하나 이상의 요소가 포함되어 있는지 확인 | `contains()`, `containsAll()` | [`in` 키워드](collection-elements.md#check-element-existence)를 사용하여 연산자 형태로 `contains()` 호출: `element in collection` |
| 컬렉션이 비어 있는지 확인 | `isEmpty()` | 컬렉션이 비어 있지 않은지 확인하려면 [`isNotEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-not-empty.html) 사용 |
| 특정 조건에 따라 제거 | `removeIf()` | |
| 선택된 요소만 유지 | `retainAll()` | |
| 컬렉션에서 모든 요소 제거 | `clear()` | |
| 컬렉션에서 스트림 가져오기 | `stream()` | Kotlin은 스트림 처리를 위한 자체 방식을 제공합니다: [시퀀스(Sequences)](#sequences) 및 [`map()`](collection-filtering.md), [`filter()`](#filter-elements)와 같은 메서드 |
| 컬렉션에서 반복자(Iterator) 가져오기 | `iterator()` | |

### Map 연산 {id="operations-on-maps"}

| 설명 | 일반적인 연산 | 더 Kotlin다운 대안 |
|---|---|---|
| 하나 이상의 요소 추가 | `put()`, `putAll()`, `putIfAbsent()` | Kotlin에서 `map[key] = value` 대입문은 `put(key, value)`와 동일하게 동작합니다. 또한 [`plusAssign`(`+=`) 연산자](collection-combine.md#add-and-remove-elements)를 사용할 수도 있습니다: `map += Pair(key, value)` 또는 `map += anotherMap` |
| 하나 이상의 요소 교체 | `put()`, `replace()`, `replaceAll()` | `put()`과 `replace()` 대신 인덱싱 연산자 `map[key] = value`를 사용합니다. |
| 요소 가져오기 | `get()` | 인덱싱 연산자를 사용하여 요소를 가져옵니다: `map[index]` |
| 맵에 하나 이상의 요소가 포함되어 있는지 확인 | `containsKey()`, `containsValue()` | [`in` 키워드](collection-elements.md#check-element-existence)를 사용하여 연산자 형태로 `contains()`를 호출합니다: `element in map` |
| 맵이 비어 있는지 확인 | `isEmpty()` | 맵이 비어 있지 않은지 확인하려면 [`isNotEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-not-empty.html)를 사용합니다. |
| 요소 제거 | `remove(key)`, `remove(key, value)` | [`minusAssign`(`-=`) 연산자](collection-combine.md#add-and-remove-elements)를 사용합니다: `map -= key` |
| 맵에서 모든 요소 제거 | `clear()` | |
| 맵에서 스트림 가져오기 | 엔트리(Entry), 키, 또는 값에 대해 `stream()` 호출 | |

### List에만 존재하는 연산 {id="operations-that-exist-only-for-lists"}

| 설명 | 일반적인 연산 | 더 Kotlin다운 대안 |
|---|---|---|
| 요소의 인덱스 가져오기 | `indexOf()` | |
| 요소의 마지막 인덱스 가져오기 | `lastIndexOf()` | |
| 요소 가져오기 | `get()` | 인덱싱 연산자를 사용하여 요소를 가져옵니다: `list[index]` |
| 서브리스트 가져오기 | `subList()` | |
| 하나 이상의 요소 교체 | `set()`, `replaceAll()` | `set()` 대신 인덱싱 연산자를 사용합니다: `list[index] = value` |

## 약간 차이가 있는 연산 {id="operations-that-differ-a-bit"}

### 모든 컬렉션 타입에 대한 연산 {id="operations-on-any-collection-type"}

| 설명 | Java | Kotlin |
|---|---|---|
| 컬렉션의 크기 가져오기 | `size()` | `count()`, `size` |
| 중첩 컬렉션 요소에 대한 평탄화(Flat) 접근 | `collectionOfCollections.forEach(flatCollection::addAll)` 또는 `collectionOfCollections.stream().flatMap().collect()` | [`flatten()`](collection-transformations.md#flatten) 또는 [`flatMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/flat-map.html) |
| 모든 요소에 지정된 함수 적용 | `stream().map().collect()` | [`map()`](collection-filtering.md) |
| 컬렉션 요소에 제공된 연산을 순차적으로 적용하고 누적된 결과 반환 | `stream().reduce()` | [`reduce()`, `fold()`](collection-aggregate.md#fold-and-reduce) |
| 분류자(Classifier)를 기준으로 요소를 그룹화하고 개수 세기 | `stream().collect(Collectors.groupingBy(classifier, counting()))` | [`eachCount()`](collection-grouping.md) |
| 조건에 따라 필터링 | `stream().filter().collect()` | [`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html) |
| 컬렉션 요소가 조건을 만족하는지 확인 | `stream().noneMatch()`, `stream().anyMatch()`, `stream().allMatch()` | [`none()`, `any()`, `all()`](collection-filtering.md) |
| 요소 정렬 | `stream().sorted().collect()` | [`sorted()`](collection-ordering.md#natural-order) |
| 처음 N개의 요소 가져오기 | `stream().limit(N).collect()` | [`take(N)`](collection-parts.md#take-and-drop) |
| 조건자(Predicate)를 만족하는 요소 가져오기 | `stream().takeWhile().collect()` | [`takeWhile()`](collection-parts.md#take-and-drop) |
| 처음 N개의 요소 건너뛰기 | `stream().skip(N).collect()` | [`drop(N)`](collection-parts.md#take-and-drop) |
| 조건자를 만족하는 요소 건너뛰기 | `stream().dropWhile().collect()` | [`dropWhile()`](collection-parts.md#take-and-drop) |
| 컬렉션 요소와 그에 연관된 특정 값으로부터 맵 생성 | `stream().collect(toMap(keyMapper, valueMapper))` | [`associate()`](collection-transformations.md#associate) |

맵에서 위에 나열된 모든 작업을 수행하려면 먼저 맵의 `entrySet`을 가져와야 합니다.

### List 연산 {id="operations-on-lists"}

| 설명 | Java | Kotlin |
|---|---|---|
| 자연 순서(Natural order)로 리스트 정렬 | `sort(null)` | `sort()` |
| 내림차순으로 리스트 정렬 | `sort(comparator)` | `sortDescending()` |
| 리스트에서 요소 제거 | `remove(index)`, `remove(element)` | `removeAt(index)`, `remove(element)` 또는 [`collection -= element`](collection-combine.md#add-and-remove-elements) |
| 리스트의 모든 요소를 특정 값으로 채우기 | `Collections.fill()` | [`fill()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fill.html) |
| 리스트에서 중복 없는 고유한 요소 가져오기 | `stream().distinct().toList()` | [`distinct()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/distinct.html) |

## Java 표준 라이브러리에는 없는 연산 {id="operations-that-don-t-exist-in-java-s-standard-library"}

* [`zip()`, `unzip()`](collection-transformations.md) – 컬렉션을 변환합니다.
* [`aggregate()`](collection-grouping.md) – 조건에 따라 그룹화합니다.
* [`takeLast()`, `takeLastWhile()`, `dropLast()`, `dropLastWhile()`](collection-parts.md#take-and-drop) – 조건자에 따라 요소를 가져오거나 건너뜁니다.
* [`slice()`, `chunked()`, `windowed()`](collection-parts.md) – 컬렉션의 일부분을 추출합니다.
* [더하기(`+`) 및 빼기(`-`) 연산자](collection-combine.md#add-and-remove-elements) – 요소를 추가하거나 제거합니다.

`zip()`, `chunked()`, `windowed()` 및 기타 연산에 대해 더 자세히 알아보려면 Kotlin의 고급 컬렉션 연산에 관한 Sebastian Aigner의 영상을 시청하세요:

<video src="https://www.youtube.com/v/N4CpLxGJlq0" title="고급 컬렉션 연산(Advanced Collection Operations)"/>

## 가변성 {id="mutability"}

Java에는 가변(mutable) 컬렉션이 있습니다:

```java
// Java
// 이 리스트는 가변입니다!
public List<Customer> getCustomers() { ... }
```
{id="mutability-java"}

부분적으로 가변인 컬렉션도 있습니다:

```java
// Java
List<String> numbers = Arrays.asList("one", "two", "three", "four");
numbers.add("five"); // 런타임에 `UnsupportedOperationException`이 발생하며 실패함
```
{id="mutability-partly-java"}

그리고 불변(immutable) 컬렉션도 있습니다:

```java
// Java
List<String> numbers = new LinkedList<>();
// 이 리스트는 불변입니다!
List<String> immutableCollection = Collections.unmodifiableList(numbers);
immutableCollection.add("five"); // 런타임에 `UnsupportedOperationException`이 발생하며 실패함
```
{id="immutable-java"}

IntelliJ IDEA에서 뒤의 두 코드 조각을 작성하면, 불변 객체를 수정하려고 한다는 경고가 표시됩니다.
이 코드는 컴파일은 되지만 런타임에 `UnsupportedOperationException`을 던지며 실패합니다. 즉, 타입만 보고는 컬렉션이 가변인지 알 수 없습니다.

Java와 달리 Kotlin에서는 필요에 따라 가변 컬렉션 또는 읽기 전용(read-only) 컬렉션을 명시적으로 선언합니다.
읽기 전용 컬렉션을 수정하려고 하면 코드가 컴파일되지 않습니다:

```kotlin
// Kotlin
val numbers = mutableListOf("one", "two", "three", "four")
numbers.add("five")            // 정상 동작
val immutableNumbers = listOf("one", "two")
//immutableNumbers.add("five") // 컴파일 오류 - Unresolved reference: add
```
{id="mutability-kotlin"}

불변성에 대한 자세한 내용은 [Kotlin 코딩 규칙](coding-conventions.md#immutability) 페이지에서 확인하세요.

## 공변성 {id="covariance"}

Java에서는 하위(descendant) 타입의 컬렉션을 상위(ancestor) 타입의 컬렉션을 받는 함수에 전달할 수 없습니다.
예를 들어 `Rectangle`이 `Shape`를 상속하는 경우, `Shape` 요소의 컬렉션을 받는 함수에 `Rectangle` 요소의 컬렉션을 전달할 수 없습니다.
코드가 컴파일되도록 하려면 함수가 `Shape`의 모든 하위 타입을 컬렉션으로 받을 수 있도록 `? extends Shape` 타입을 사용해야 합니다:

```java
// Java
class Shape {}

class Rectangle extends Shape {}

public void doSthWithShapes(List<? extends Shape> shapes) {
/* 그냥 List<Shape>을 사용하면 아래와 같이 List<Rectangle>을 
인수로 전달하여 이 함수를 호출할 때 코드가 컴파일되지 않습니다 */
}

public void main() {
    var rectangles = List.of(new Rectangle(), new Rectangle());
    doSthWithShapes(rectangles);
}
```
{id="covariance-java"}

Kotlin에서 읽기 전용 컬렉션 타입은 [공변(covariant)](generics.md#variance)합니다. 즉, `Rectangle` 클래스가 `Shape` 클래스를 상속하는 경우, `List<Shape>` 타입이 필요한 모든 곳에 `List<Rectangle>` 타입을 사용할 수 있습니다.
다시 말해 컬렉션 타입은 요소 타입과 동일한 하위 타입 관계를 가집니다. Map은 값(value) 타입에 대해서는 공변하지만 키(key) 타입에 대해서는 공변하지 않습니다.
가변 컬렉션은 공변하지 않습니다. 가변 컬렉션이 공변성을 띠게 되면 런타임 오류가 발생할 수 있기 때문입니다.

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

[컬렉션 타입](collection-types.md)에 대한 자세한 내용은 여기에서 확인하세요.

## 범위 및 진행 {id="ranges-and-progressions"}

Kotlin에서는 [범위(Ranges)](ranges.md)를 사용하여 구간을 생성할 수 있습니다. 예를 들어 `Version(1, 11)..Version(1, 30)`은 `1.11`부터 `1.30`까지의 모든 버전을 포함합니다.
`in` 연산자를 사용하여 버전이 해당 범위 내에 있는지 확인할 수 있습니다: `Version(0, 9) in versionRange`.

Java에서는 `Version`이 양쪽 경계에 부합하는지 수동으로 확인해야 합니다:

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

Kotlin에서는 범위를 하나의 독립된 객체로 다룹니다. 두 개의 변수를 생성하고 `Version`을 변수들과 일일이 비교할 필요가 없습니다:

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

특정 버전이 최소 버전 이상(`>=`)이면서 최대 버전 미만(`<`)인지 확인하는 경우처럼 한쪽 경계를 제외해야 하는 상황에서는 이러한 폐구간(inclusive) 범위가 적합하지 않습니다.

## 여러 기준에 따른 비교 {id="comparison-by-several-criteria"}

Java에서 여러 기준에 따라 객체를 비교하려면 [`Comparator`](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html) 인터페이스의 [`comparing()`](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html#comparing-java.util.function.Function-) 및 [`thenComparingX()`](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html#thenComparing-java.util.Comparator-) 함수를 사용할 수 있습니다.
예를 들어 이름과 나이를 기준으로 사람을 비교하는 경우는 다음과 같습니다:

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

Kotlin에서는 비교하려는 필드를 단순히 나열하기만 하면 됩니다:

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

## 시퀀스 {id="sequences"}

Java에서는 다음과 같은 방식으로 숫자 시퀀스를 생성할 수 있습니다:

```java
// Java
int sum = IntStream.iterate(1, e -> e + 3)
    .limit(10).sum();
System.out.println(sum); // 145 출력
```
{id="sequences-java"}

Kotlin에서는 _[시퀀스(Sequences)](sequences.md)_를 사용합니다. 시퀀스의 다단계 처리는 가능한 경우 지연(lazily) 실행되며, 전체 처리 체인의 결과가 실제로 요청될 때만 연산이 수행됩니다.

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

시퀀스를 사용하면 일부 필터링 연산을 수행하는 데 필요한 단계 수를 줄일 수 있습니다.
`Iterable`과 `Sequence`의 차이점을 보여주는 [시퀀스 처리 예제](sequences.md#sequence-processing-example)를 참조하세요.

## 리스트에서 요소 제거 {id="removal-of-elements-from-a-list"}

Java에서 [`remove()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/List.html#remove(int)) 함수는 제거할 요소의 인덱스를 받습니다.

정수형(Integer) 요소를 제거할 때는 `remove()` 함수의 인수로 `Integer.valueOf()` 함수를 사용해야 합니다:

```java
// Java
public void remove() {
    var numbers = new ArrayList<>();
    numbers.add(1);
    numbers.add(2);
    numbers.add(3);
    numbers.add(1);
    numbers.remove(1); // 인덱스를 기준으로 제거함
    System.out.println(numbers); // [1, 3, 1]
    numbers.remove(Integer.valueOf(1));
    System.out.println(numbers); // [3, 1]
}
```
{id="remove-elements-java"}

Kotlin에서는 [`removeAt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/remove-at.html)을 사용하는 인덱스 기반 제거와 [`remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/remove.html)를 사용하는 값 기반 제거의 두 가지 유형이 있습니다.

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

## 맵 순회하기 {id="traverse-a-map"}

Java에서는 [`forEach`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Map.html#forEach(java.util.function.BiConsumer))를 통해 맵을 순회할 수 있습니다:

```java
// Java
numbers.forEach((k,v) -> System.out.println("Key = " + k + ", Value = " + v));
```
{id="traverse-map-java"}

Kotlin에서는 Java의 `forEach`와 유사하게 `for` 루프 또는 `forEach`를 사용하여 맵을 순회합니다:

```kotlin
// Kotlin
for ((k, v) in numbers) {
    println("Key = $k, Value = $v")
}
// 또는
numbers.forEach { (k, v) -> println("Key = $k, Value = $v") }
```
{id="traverse-map-kotlin"}

## 비어 있을 수 있는 컬렉션에서 첫 번째 및 마지막 항목 가져오기 {id="get-the-first-and-the-last-items-of-a-possibly-empty-collection"}

Java에서는 컬렉션의 크기를 확인하고 인덱스를 사용하여 첫 번째와 마지막 항목을 안전하게 가져올 수 있습니다:

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

JDK 21 이상에서는 모든 [`SequencedCollection`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/SequencedCollection.html) 구현체에서 제공되는 [`getFirst()`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/SequencedCollection.html#getFirst()) 및 [`getLast()`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/SequencedCollection.html#getLast()) 메서드를 사용할 수도 있습니다.
여기에는 모든 `List` 구현체뿐만 아니라 `LinkedHashSet`과 같은 다른 컬렉션도 포함됩니다.
예를 들어 `ArrayList`의 경우는 다음과 같습니다:

```java
// Java
var list = new ArrayList<>();
//...
if (!list.isEmpty()) {
    System.out.println(list.getFirst());
    System.out.println(list.getLast());
}
```
{id="deque-get-first-last-java"}

Kotlin에는 [`firstOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-or-null.html) 및 [`lastOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last-or-null.html)이라는 특별한 함수가 있습니다.
[`엘비스 연산자(Elvis operator)`](null-safety.md#elvis-operator)를 사용하면 함수의 결과에 따라 즉시 후속 작업을 수행할 수 있습니다. 예를 들어 `firstOrNull()`의 경우:

```kotlin
// Kotlin
val emails = listOf<String>() // 비어 있을 수 있음
val theOldestEmail = emails.firstOrNull() ?: ""
val theFreshestEmail = emails.lastOrNull() ?: ""
```
{id="get-first-last-kotlin"}

## 리스트로부터 세트(Set) 생성하기 {id="create-a-set-from-a-list"}

Java에서는 [`List`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/List.html)로부터 [`Set`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Set.html)을 생성하기 위해 [`Set.copyOf`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Set.html#copyOf(java.util.Collection)) 함수를 사용할 수 있습니다:

```java
// Java
public void listToSet() {
    var sourceList = List.of(1, 2, 3, 1);
    var copySet = Set.copyOf(sourceList);
    System.out.println(copySet);
}
```
{id="list-to-set-java"}

Kotlin에서는 `toSet()` 함수를 사용합니다:

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

## 요소 그룹화하기 {id="group-elements"}

Java에서는 [Collectors](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Collectors.html)의 `groupingBy()` 함수를 사용하여 요소를 그룹화할 수 있습니다:

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

Kotlin에서는 [`groupBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/group-by.html) 함수를 사용합니다:

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

## 요소 필터링하기 {id="filter-elements"}

Java에서 컬렉션의 요소를 필터링하려면 [Stream API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html)를 사용해야 합니다.
Stream API에는 중간 연산(intermediate operation)과 최종 연산(terminal operation)이 있습니다. `filter()`는 스트림을 반환하는 중간 연산입니다.
결과물로 컬렉션을 받으려면 `collect()`와 같은 최종 연산을 사용해야 합니다.
예를 들어 키가 `1`로 끝나고 값이 `10`보다 큰 쌍만 남기려면 다음과 같이 작성합니다:

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

Kotlin에서는 필터링 기능이 컬렉션 자체에 내장되어 있으며, `filter()`는 필터링된 동일한 컬렉션 타입을 반환합니다.
따라서 `filter()`와 해당 조건자만 작성하면 됩니다:

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

[맵 필터링](map-operations.md#filter)에 대한 자세한 내용은 여기에서 확인하세요.

### 타입별 요소 필터링 {id="filter-elements-by-type"}

Java에서 타입별로 요소를 필터링하고 이에 대한 작업을 수행하려면 [`instanceof`](https://docs.oracle.com/en/java/javase/17/language/pattern-matching-instanceof-operator.html) 연산자로 타입을 확인한 다음 타입 캐스팅을 수행해야 합니다:

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

Kotlin에서는 컬렉션에 대해 [`filterIsInstance<NEEDED_TYPE>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-is-instance.html)을 호출하기만 하면 되며, 타입 캐스팅은 [스마트 캐스트(Smart casts)](typecasts.md#smart-casts)에 의해 자동으로 처리됩니다:

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

### 조건자 검사 {id="test-predicates"}

어떤 작업에서는 모든 요소, 일체의 요소가 아님(none), 또는 일부 요소가 조건을 만족하는지 확인해야 합니다.
Java에서는 [Stream API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html) 함수인 [`allMatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html#allMatch(java.util.function.Predicate)), [`noneMatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html#noneMatch(java.util.function.Predicate)), [`anyMatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html#anyMatch(java.util.function.Predicate))를 통해 이러한 모든 검사를 수행할 수 있습니다:

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

Kotlin에서는 모든 [Iterable](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/#kotlin.collections.Iterable) 객체에서 [확장 함수(extension functions)](extensions.md)인 `none()`, `any()`, `all()`을 사용할 수 있습니다:

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

[조건자 검사](collection-filtering.md#test-predicates)에 대해 자세히 알아보세요.

## 컬렉션 변환 연산 {id="collection-transformation-operations"}

### 요소 결합하기(Zip) {id="zip-elements"}

Java에서는 두 컬렉션을 동시에 순회하여 동일한 위치의 요소를 쌍으로 묶을 수 있습니다:

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

단순히 요소 쌍을 출력하는 것보다 복잡한 작업을 수행하려는 경우 [레코드(Records)](https://docs.oracle.com/en/java/javase/17/language/records.html)를 사용할 수 있습니다.
위의 예제에서는 `record AnimalDescription(String animal, String color) {}`와 같은 레코드를 정의할 수 있습니다.

Kotlin에서는 동일한 작업을 수행하기 위해 [`zip()`](collection-transformations.md#zip) 함수를 사용합니다:

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

`zip()`은 [Pair](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-pair/) 객체의 List를 반환합니다.

> 컬렉션의 크기가 서로 다른 경우, `zip()`의 결과는 더 작은 크기에 맞춰집니다. 크기가 더 큰 컬렉션의 마지막 요소들은 결과에 포함되지 않습니다.
>
{style="note"}

### 요소 연관짓기(Associate) {id="associate-elements"}

Java에서는 [Stream API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html)를 사용하여 요소를 특정 특성과 연관시킬 수 있습니다:

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

Kotlin에서는 [`associate()`](collection-transformations.md#associate) 함수(또는 `associateWith()`)를 사용합니다:

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

## 다음 단계는? {id="what-s-next"}

* [Kotlin Koans](koans.md)를 방문해 보세요 – 실습을 완료하며 Kotlin 구문을 배울 수 있습니다. 각 연습 문제는 실패하는 단위 테스트로 작성되어 있으며, 여러분의 역할은 테스트가 통과하도록 코드를 작성하는 것입니다.
* 다른 [Kotlin 관용구(Idioms)](idioms.md)를 살펴보세요.
* [Java to Kotlin 변환기](mixing-java-kotlin-intellij.md#convert-java-files-to-kotlin)를 사용하여 기존 Java 코드를 Kotlin으로 변환하는 방법을 알아보세요.
* [Kotlin의 컬렉션](collections-overview.md)에 대해 자세히 알아보세요.

자신만의 유용한 관용구가 있다면 풀 리퀘스트(pull request)를 보내 공유해 주시기 바랍니다.