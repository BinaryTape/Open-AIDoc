[//]: # (title: Java 与 Kotlin 中的集合)

<web-summary>了解如何从 Java 集合迁移到 Kotlin 集合。本指南涵盖了 Kotlin 和 Java 中的 List、ArrayList、Map、Set 等数据结构。</web-summary>

**集合 (Collection)** 是由数量可变（可能为零）的元素组成的群组，这些元素对于正在解决的问题具有重要意义，且经常需要对其进行操作。
本指南将解释并比较 Java 和 Kotlin 中的集合概念与操作。
它将帮助您从 Java 迁移到 Kotlin，并以纯正的 Kotlin 风格编写代码。

本指南的第一部分包含一个快速术语表，列出了 Java 和 Kotlin 中针对相同集合的操作。
它分为[相同的操作](#operations-that-are-the-same-in-java-and-kotlin)以及[仅在 Kotlin 中存在的操作](#operations-that-don-t-exist-in-java-s-standard-library)。
第二部分从[可变性](#mutability)开始，通过具体案例来解释其中的一些差异。

有关集合的入门介绍，请参阅[集合概述](collections-overview.md)或观看 Kotlin 技术布道师 Sebastian Aigner 制作的[视频](https://www.youtube.com/watch?v=F8jj7e-_jFA)。

> 以下所有示例仅使用 Java 和 Kotlin 标准库 API。
>
{style="note"}

## Java 与 Kotlin 中相同的操作 {id="operations-that-are-the-same-in-java-and-kotlin"}

在 Kotlin 中，许多针对集合的操作与 Java 中对应的操作看起来完全相同。

### 针对列表、Set、队列和双端队列的操作 {id="operations-on-lists-sets-queues-and-deques"}

| 说明                               | 常见操作                      | 更多 Kotlin 替代方案                                                                                                         |
|------------------------------------|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| 添加一个或多个元素                 | `add()`、`addAll()`           | 使用 [`plusAssign` (`+=`) 运算符](collection-combine.md#add-and-remove-elements)：`collection += element`、`collection += anotherCollection`。 |
| 检查集合是否包含某个或某些元素     | `contains()`、`containsAll()` | 使用 [`in` 关键字](collection-elements.md#check-element-existence)以运算符形式调用 `contains()`：`element in collection`。   |
| 检查集合是否为空                   | `isEmpty()`                   | 使用 [`isNotEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-not-empty.html) 检查集合是否非空。  |
| 在特定条件下移除元素               | `removeIf()`                  |                                                                                                                             |
| 仅保留选定的元素                   | `retainAll()`                 |                                                                                                                             |
| 移除集合中的所有元素               | `clear()`                     |                                                                                                                             |
| 从集合获取流 (stream)              | `stream()`                    | Kotlin 拥有自己的流处理方式：[序列 (sequences)](#sequences)以及 [`map()`](collection-filtering.md) 和 [`filter()`](#filter-elements) 等方法。 |
| 从集合获取迭代器                   | `iterator()`                  |                                                                                                                             |

### 针对 Map 的操作 {id="operations-on-maps"}

| 说明                               | 常见操作                               | 更多 Kotlin 替代方案                                                                                                                                                                 |
|------------------------------------|----------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 添加一个或多个元素                 | `put()`、`putAll()`、`putIfAbsent()`   | 在 Kotlin 中，赋值 `map[key] = value` 的行为与 `put(key, value)` 相同。此外，您还可以使用 [`plusAssign` (`+=`) 运算符](collection-combine.md#add-and-remove-elements)：`map += Pair(key, value)` 或 `map += anotherMap`。 |
| 替换一个或多个元素                 | `put()`、`replace()`、`replaceAll()`   | 使用索引运算符 `map[key] = value` 代替 `put()` 和 `replace()`。                                                                                                                       |
| 获取元素                           | `get()`                                | 使用索引运算符获取元素：`map[index]`。                                                                                                                                               |
| 检查 Map 是否包含某个键或值         | `containsKey()`、`containsValue()`     | 使用 [`in` 关键字](collection-elements.md#check-element-existence)以运算符形式调用 `contains()`：`element in map`。                                                                    |
| 检查 Map 是否为空                  | `isEmpty()`                            | 使用 [`isNotEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-not-empty.html) 检查 Map 是否非空。                                                          |
| 移除元素                           | `remove(key)`、`remove(key, value)`    | 使用 [`minusAssign` (`-=`) 运算符](collection-combine.md#add-and-remove-elements)：`map -= key`。                                                                                    |
| 移除 Map 中的所有元素              | `clear()`                              |                                                                                                                                                                                      |
| 从 Map 获取流 (stream)             | 对 entries、keys 或 values 调用 `stream()` |                                                                                                                                                                                      |

### 仅适用于列表的操作 {id="operations-that-exist-only-for-lists"}

| 说明                               | 常见操作                 | 更多 Kotlin 替代方案                                                 |
|------------------------------------|--------------------------|----------------------------------------------------------------------|
| 获取元素的索引                     | `indexOf()`              |                                                                      |
| 获取元素的最后一个索引             | `lastIndexOf()`          |                                                                      |
| 获取元素                           | `get()`                  | 使用索引运算符获取元素：`list[index]`。                              |
| 获取子列表                         | `subList()`              |                                                                      |
| 替换一个或多个元素                 | `set()`、`replaceAll()`  | 使用索引运算符代替 `set()`：`list[index] = value`。                  |

## 略有不同的操作 {id="operations-that-differ-a-bit"}

### 针对任意集合类型的操作 {id="operations-on-any-collection-type"}

| 说明                                                                 | Java                                                                                                                | Kotlin                                                                                                                                               |
|----------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| 获取集合的大小                                                       | `size()`                                                                                                            | `count()`、`size`                                                                                                                                    |
| 平铺访问嵌套集合的元素                                               | `collectionOfCollections.forEach(flatCollection::addAll)` 或 `collectionOfCollections.stream().flatMap().collect()` | [`flatten()`](collection-transformations.md#flatten) 或 [`flatMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/flat-map.html) |
| 对每个元素应用给定函数                                               | `stream().map().collect()`                                                                                          | [`map()`](collection-filtering.md)                                                                                                                   |
| 按顺序对集合元素应用所提供的操作，并返回累积结果                     | `stream().reduce()`                                                                                                 | [`reduce()`、`fold()`](collection-aggregate.md#fold-and-reduce)                                                                                      |
| 根据分类器对元素进行分组并对其计数                                   | `stream().collect(Collectors.groupingBy(classifier, counting()))`                                                   | [`eachCount()`](collection-grouping.md)                                                                                                              |
| 按条件过滤                                                           | `stream().filter().collect()`                                                                                       | [`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html)                                                            |
| 检查集合元素是否满足条件                                             | `stream().noneMatch()`、`stream().anyMatch()`、`stream().allMatch()`                                                | [`none()`、`any()`、`all()`](collection-filtering.md)                                                                                                |
| 对元素排序                                                           | `stream().sorted().collect()`                                                                                       | [`sorted()`](collection-ordering.md#natural-order)                                                                                                   |
| 获取前 N 个元素                                                      | `stream().limit(N).collect()`                                                                                       | [`take(N)`](collection-parts.md#take-and-drop)                                                                                                       |
| 根据谓词获取元素                                                     | `stream().takeWhile().collect()`                                                                                    | [`takeWhile()`](collection-parts.md#take-and-drop)                                                                                                   |
| 跳过前 N 个元素                                                      | `stream().skip(N).collect()`                                                                                        | [`drop(N)`](collection-parts.md#take-and-drop)                                                                                                       |
| 根据谓词跳过元素                                                     | `stream().dropWhile().collect()`                                                                                    | [`dropWhile()`](collection-parts.md#take-and-drop)                                                                                                   |
| 从集合元素及其关联的特定值构建 Map                                   | `stream().collect(toMap(keyMapper, valueMapper))`                                                                   | [`associate()`](collection-transformations.md#associate)                                                                                             |

要在 Map 上执行上面列出的所有操作，您首先需要获取 Map 的 `entrySet`。

### 针对列表的操作 {id="operations-on-lists"}

| 说明                                             | Java                               | Kotlin                                                                                        |
|--------------------------------------------------|------------------------------------|-----------------------------------------------------------------------------------------------|
| 将列表按自然顺序排序                             | `sort(null)`                       | `sort()`                                                                                      |
| 将列表按降序排序                                 | `sort(comparator)`                 | `sortDescending()`                                                                            |
| 从列表中移除元素                                 | `remove(index)`、`remove(element)` | `removeAt(index)`、`remove(element)` 或 [`collection -= element`](collection-combine.md#add-and-remove-elements) |
| 用特定值填充列表的所有元素                       | `Collections.fill()`               | [`fill()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fill.html)         |
| 获取列表中的唯一元素                             | `stream().distinct().toList()`     | [`distinct()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/distinct.html) |

## Java 标准库中不存在的操作 {id="operations-that-don-t-exist-in-java-s-standard-library"}

* [`zip()`、`unzip()`](collection-transformations.md) – 转换集合。
* [`aggregate()`](collection-grouping.md) – 按条件聚合。
* [`takeLast()`、`takeLastWhile()`、`dropLast()`、`dropLastWhile()`](collection-parts.md#take-and-drop) – 根据谓词获取或丢弃元素。
* [`slice()`、`chunked()`、`windowed()`](collection-parts.md) – 检索集合的部分内容。
* [加号 (`+`) 和减号 (`-`) 运算符](collection-combine.md#add-and-remove-elements) – 添加或移除元素。

如果您想深入了解 `zip()`、`chunked()`、`windowed()` 以及其他一些操作，请观看 Sebastian Aigner 制作的关于 Kotlin 高级集合操作的视频：

<video src="https://www.youtube.com/v/N4CpLxGJlq0" title="Advanced Collection Operations"/>

## 可变性 {id="mutability"}

在 Java 中，存在可变集合：

```java
// Java
// 该列表是可变的！
public List<Customer> getCustomers() { ... }
```
{id="mutability-java"}

部分可变的集合：

```java
// Java
List<String> numbers = Arrays.asList("one", "two", "three", "four");
numbers.add("five"); // 运行时抛出 `UnsupportedOperationException` 失败
```
{id="mutability-partly-java"}

以及不可变集合：

```java
// Java
List<String> numbers = new LinkedList<>();
// 该列表是不可变的！
List<String> immutableCollection = Collections.unmodifiableList(numbers);
immutableCollection.add("five"); // 运行时抛出 `UnsupportedOperationException` 失败
```
{id="immutable-java"}

如果您在 IntelliJ IDEA 中编写最后两段代码，IDE 将警告您正在尝试修改不可变对象。
这些代码可以通过编译，但在运行时会因 `UnsupportedOperationException` 而失败。您无法仅仅通过查看类型来判断集合是否可变。

与 Java 不同，在 Kotlin 中，您可以根据需要显式声明可变集合或只读集合。
如果您尝试修改只读集合，代码将无法通过编译：

```kotlin
// Kotlin
val numbers = mutableListOf("one", "two", "three", "four")
numbers.add("five")            // 正常执行
val immutableNumbers = listOf("one", "two")
//immutableNumbers.add("five") // 编译错误 - Unresolved reference: add
```
{id="mutability-kotlin"}

要详细了解不可变性，请参阅 [Kotlin 编码规范](coding-conventions.md#immutability)页面。

## 协变 {id="covariance"}

在 Java 中，您无法将具有后代类型的集合传递给接收祖先类型集合的函数。
例如，如果 `Rectangle` 继承自 `Shape`，您无法将 `Rectangle` 元素的集合传递给接收 `Shape` 元素集合的函数。
为了让代码能够编译，请使用 `? extends Shape` 类型，以便该函数可以接收包含 `Shape` 任意子类的集合：

```java
// Java
class Shape {}

class Rectangle extends Shape {}

public void doSthWithShapes(List<? extends Shape> shapes) {
/* 如果仅使用 List<Shape>，当像下面那样使用 List<Rectangle> 作为实参
调用此函数时，代码将无法编译 */
}

public void main() {
    var rectangles = List.of(new Rectangle(), new Rectangle());
    doSthWithShapes(rectangles);
}
```
{id="covariance-java"}

在 Kotlin 中，只读集合类型是[协变的 (covariant)](generics.md#variance)。这意味着如果 `Rectangle` 类继承自 `Shape` 类，
您可以在任何需要 `List<Shape>` 类型的地方使用 `List<Rectangle>` 类型。
换句话说，集合类型具有与元素类型相同的子类型关系。Map 在值类型上是协变的，但在键类型上不是。
可变集合不是协变的——否则会导致运行时失败。

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

在此阅读关于[集合类型](collection-types.md)的更多信息。

## 区间与数列 {id="ranges-and-progressions"}

在 Kotlin 中，您可以使用[区间 (ranges)](ranges.md) 来创建间隔。例如，`Version(1, 11)..Version(1, 30)` 包含从 `1.11` 到 `1.30` 的所有版本。
您可以使用 `in` 运算符来检查您的版本是否在区间内：`Version(0, 9) in versionRange`。

在 Java 中，您需要手动检查 `Version` 是否同时满足两个边界：

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

在 Kotlin 中，您可以将区间作为整体对象来操作。无需创建两个变量再将 `Version` 与它们进行比较：

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

一旦需要排除其中一个边界（例如检查版本是否大于等于 (`>=`) 最小版本且小于 (`<`) 最大版本），这些闭区间就无法直接适用了。

## 按多个条件进行比较 {id="comparison-by-several-criteria"}

在 Java 中，若要按多个条件比较对象，可以使用 [`Comparator`](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html) 接口中的 [`comparing()`](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html#comparing-java.util.function.Function-) 
和 [`thenComparingX()`](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html#thenComparing-java.util.Comparator-) 
函数。
例如，根据姓名和年龄比较人员：

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

在 Kotlin 中，您只需枚举想要比较的字段即可：

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

## 序列 {id="sequences"}

在 Java 中，您可以这样生成一个数字序列：

```java
// Java
int sum = IntStream.iterate(1, e -> e + 3)
    .limit(10).sum();
System.out.println(sum); // 输出 145
```
{id="sequences-java"}

在 Kotlin 中，请使用 *[序列 (sequences)](sequences.md)*。序列的多步处理在可能的情况下是延迟执行的——只有在请求整个处理链的结果时，才会进行实际计算。

```kotlin
fun main() {
//sampleStart
    // Kotlin
    val sum = generateSequence(1) {
        it + 3
    }.take(10).sum()
    println(sum) // 输出 145
//sampleEnd
}
```
{kotlin-runnable="true" id="sequences-kotlin"}

序列可以减少执行某些过滤操作所需的步骤数量。
请参阅[序列处理示例](sequences.md#sequence-processing-example)，其中展示了 `Iterable` 和 `Sequence` 之间的区别。

## 从列表中移除元素 {id="removal-of-elements-from-a-list"}

在 Java 中，[`remove()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/List.html#remove(int)) 
函数接收要移除元素的索引。

当移除整数元素时，请使用 `Integer.valueOf()` 函数作为 `remove()` 函数的实参：

```java
// Java
public void remove() {
    var numbers = new ArrayList<>();
    numbers.add(1);
    numbers.add(2);
    numbers.add(3);
    numbers.add(1);
    numbers.remove(1); // 这是按索引移除
    System.out.println(numbers); // [1, 3, 1]
    numbers.remove(Integer.valueOf(1));
    System.out.println(numbers); // [3, 1]
}
```
{id="remove-elements-java"}

在 Kotlin 中，有两种元素移除方式：
使用 [`removeAt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/remove-at.html) 按索引移除，
以及使用 [`remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/remove.html) 按值移除。

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

## 遍历 Map {id="traverse-a-map"}

在 Java 中，您可以通过 [`forEach`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Map.html#forEach(java.util.function.BiConsumer)) 遍历 Map：

```java
// Java
numbers.forEach((k,v) -> System.out.println("Key = " + k + ", Value = " + v));
```
{id="traverse-map-java"}

在 Kotlin 中，使用 `for` 循环或类似 Java `forEach` 的 `forEach` 来遍历 Map：

```kotlin
// Kotlin
for ((k, v) in numbers) {
    println("Key = $k, Value = $v")
}
// 或者
numbers.forEach { (k, v) -> println("Key = $k, Value = $v") }
```
{id="traverse-map-kotlin"}

## 获取可能为空的集合的第一个和最后一个元素 {id="get-the-first-and-the-last-items-of-a-possibly-empty-collection"}

在 Java 中，您可以通过检查集合的大小并使用索引来安全地获取第一个和最后一个元素：

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

在 JDK 21 及更高版本中，您还可以使用所有 [`SequencedCollection`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/SequencedCollection.html) 
实现上提供的 [`getFirst()`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/SequencedCollection.html#getFirst()) 
和 [`getLast()`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/SequencedCollection.html#getLast()) 方法。
这包括所有 `List` 实现以及其他诸如 `LinkedHashSet` 的集合。
例如，使用 `ArrayList`：

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

在 Kotlin 中，提供了专用的函数 [`firstOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-or-null.html) 
和 [`lastOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last-or-null.html)。
利用 [Elvis 运算符](null-safety.md#elvis-operator)，您可以根据函数的结果立即执行进一步的操作。例如使用 `firstOrNull()`：

```kotlin
// Kotlin
val emails = listOf<String>() // 可能为空
val theOldestEmail = emails.firstOrNull() ?: ""
val theFreshestEmail = emails.lastOrNull() ?: ""
```
{id="get-first-last-kotlin"}

## 从列表创建 Set {id="create-a-set-from-a-list"}

在 Java 中，要从 [`List`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/List.html) 创建 [`Set`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Set.html)，可以使用 [`Set.copyOf`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Set.html#copyOf(java.util.Collection)) 函数：

```java
// Java
public void listToSet() {
    var sourceList = List.of(1, 2, 3, 1);
    var copySet = Set.copyOf(sourceList);
    System.out.println(copySet);
}
```
{id="list-to-set-java"}

在 Kotlin 中，使用 `toSet()` 函数：

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

## 对元素进行分组 {id="group-elements"}

在 Java 中，您可以使用 [Collectors](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Collectors.html) 
函数 `groupingBy()` 对元素进行分组：

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

在 Kotlin 中，使用 [`groupBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/group-by.html) 函数：

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

## 过滤元素 {id="filter-elements"}

在 Java 中，要从集合中过滤元素，需要使用 [Stream API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html)。
Stream API 包含“中间操作”和“终端操作”。`filter()` 属于中间操作，它返回一个流。
若要接收集合作为输出，则需要使用终端操作，例如 `collect()`。
例如，仅保留键以 `1` 结尾且值大于 `10` 的键值对：

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

在 Kotlin 中，过滤功能直接内置于集合中，并且 `filter()` 返回与被过滤集合相同的类型。
因此，您只需编写 `filter()` 及其谓词即可：

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

在此详细了解[过滤 Map](map-operations.md#filter)。

### 按类型过滤元素 {id="filter-elements-by-type"}

在 Java 中，要按类型过滤元素并对其执行操作，需要使用 [`instanceof`](https://docs.oracle.com/en/java/javase/17/language/pattern-matching-instanceof-operator.html) 运算符检查其类型，然后进行类型转换：

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

在 Kotlin 中，只需在集合上调用 [`filterIsInstance<NEEDED_TYPE>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-is-instance.html)，
类型转换将由[智能转换 (Smart casts)](typecasts.md#smart-casts) 自动完成：

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

### 断言测试 {id="test-predicates"}

某些任务需要您检查是否所有元素、没有元素或有任意元素满足某项条件。
在 Java 中，您可以通过 [Stream API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html) 
函数 [`allMatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html#allMatch(java.util.function.Predicate))、
[`noneMatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html#noneMatch(java.util.function.Predicate)) 以及 
[`anyMatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html#anyMatch(java.util.function.Predicate)) 进行所有这些检查：

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

在 Kotlin 中，每个 [Iterable](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/#kotlin.collections.Iterable) 对象均可使用[扩展方法](extensions.md) `none()`、`any()` 和 `all()`：

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

详细了解[断言测试](collection-filtering.md#test-predicates)。

## 集合转换操作 {id="collection-transformation-operations"}

### 配对元素 (Zip) {id="zip-elements"}

在 Java 中，您可以通过同时遍历两个集合，将相同位置上的元素配对：

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

如果想要执行比仅打印成对元素到输出更复杂的操作，
可以使用 [Records](https://docs.oracle.com/en/java/javase/17/language/records.html)。
在上面的示例中，该记录为 `record AnimalDescription(String animal, String color) {}`。

在 Kotlin 中，使用 [`zip()`](collection-transformations.md#zip) 函数执行相同的操作：

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

`zip()` 返回一个包含 [Pair](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-pair/) 对象的 List。

> 如果两个集合的大小不同，`zip()` 的结果大小将为较小集合的大小。较大集合中超出部分的末尾元素将不会包含在结果中。
>
{style="note"}

### 关联元素 (Associate) {id="associate-elements"}

在 Java 中，可以使用 [Stream API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html) 
将元素与特征关联起来：

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

在 Kotlin 中，使用 [`associate()`](collection-transformations.md#associate) 函数：

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

## 下一步 {id="what-s-next"}

* 访问 [Kotlin Koans](koans.md) – 完成练习以学习 Kotlin 语法。每个练习都被设计为一个失败的单元测试，您的任务是让其通过。
* 浏览其他 [Kotlin 惯用法](idioms.md)。
* 了解如何通过 [Java 到 Kotlin 转换器](mixing-java-kotlin-intellij.md#convert-java-files-to-kotlin)将现有的 Java 代码转换为 Kotlin。
* 探索 [Kotlin 中的集合](collections-overview.md)。

如果您有喜欢的惯用法，欢迎通过提交拉取请求来分享！