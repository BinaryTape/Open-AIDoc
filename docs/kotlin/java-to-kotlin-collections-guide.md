[//]: # (title: Java 与 Kotlin 中的集合)

<web-summary>了解如何从 Java 集合迁移到 Kotlin 集合。本指南涵盖了 Kotlin 和 Java 的 List、ArrayList、Map、Set 等数据结构。</web-summary>

“集合 (Collections)”是针对正在解决的问题具有重要意义且通常需要对其进行操作的数量可变的项（可能为零）的组合。
本指南解释并对比了 Java 和 Kotlin 中集合的概念与操作。
它将帮助您从 Java 迁移到 Kotlin，并以地道的 Kotlin 方式编写代码。

本指南的第一部分包含 Java 和 Kotlin 中相同集合操作的快速术语表。
它分为 [Java 和 Kotlin 中相同的操作](#operations-that-are-the-same-in-java-and-kotlin) 以及 [仅在 Kotlin 中存在的操作](#operations-that-don-t-exist-in-java-s-standard-library)。
指南的第二部分从 [可变性](#mutability) 开始，通过查看具体案例来解释其中的一些差异。

有关集合的入门介绍，请参阅[集合概述](collections-overview.md)或观看 Kotlin 技术布道师 Sebastian Aigner 的这段[视频](https://www.youtube.com/watch?v=F8jj7e-_jFA)。

> 以下所有示例仅使用 Java 和 Kotlin 标准库 API。
>
{style="note"}

## Java 和 Kotlin 中相同的操作

在 Kotlin 中，许多针对集合的操作与其在 Java 中的对应操作看起来完全相同。

### List、Set、Queue 和 Deque 上的操作

| 描述 | 常用操作 | 更多 Kotlin 替代方案 |
|-------------|-----------|---------------------|
| 添加一个或多个元素 | `add()`，`addAll()` | 使用 [`plusAssign` (`+=`) 运算符](collection-plus-minus.md)：`collection += element`，`collection += anotherCollection`。 |
| 检查集合是否包含一个或多个元素 | `contains()`，`containsAll()` | 使用 [`in` 关键字](collection-elements.md#check-element-existence)以运算符形式调用 `contains()`：`element in collection`。 |
| 检查集合是否为空 | `isEmpty()` | 使用 [`isNotEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-not-empty.html) 检查集合是否不为空。 |
| 在特定条件下移除 | `removeIf()` | |
| 仅保留选定的元素 | `retainAll()` | |
| 移除集合中的所有元素 | `clear()` | |
| 从集合获取流 | `stream()` | Kotlin 有自己的流处理方式：[序列](#sequences)以及 [`map()`](collection-filtering.md) 和 [`filter()`](#filter-elements) 等方法。 |
| 从集合获取迭代器 | `iterator()` | |

### Map 上的操作

| 描述 | 常用操作 | 更多 Kotlin 替代方案 |
|-------------|-----------|---------------------|
| 添加一个或多个元素 | `put()`，`putAll()`，`putIfAbsent()`| 在 Kotlin 中，赋值 `map[key] = value` 的行为与 `put(key, value)` 相同。此外，您也可以使用 [`plusAssign` (`+=`) 运算符](collection-plus-minus.md)：`map += Pair(key, value)` 或 `map += anotherMap`。 |
| 替换一个或多个元素 | `put()`，`replace()`，`replaceAll()` | 使用索引运算符 `map[key] = value` 代替 `put()` 和 `replace()`。 |
| 获取元素 | `get()` | 使用索引运算符获取元素：`map[index]`。 |
| 检查 Map 是否包含一个或多个元素 | `containsKey()`，`containsValue()` | 使用 [`in` 关键字](collection-elements.md#check-element-existence)以运算符形式调用 `contains()`：`element in map`。 |
| 检查 Map 是否为空 | `isEmpty()` | 使用 [`isNotEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-not-empty.html) 检查 Map 是否不为空。 |
| 移除元素 | `remove(key)`，`remove(key, value)` | 使用 [`minusAssign` (`-=`) 运算符](collection-plus-minus.md)：`map -= key`。 |
| 移除 Map 中的所有元素 | `clear()` | |
| 从 Map 获取流 | 对 entry、key 或 value 调用 `stream()` | |

### 仅适用于 List 的操作

| 描述 | 常用操作 | 更多 Kotlin 替代方案 |
|-------------|-----------|---------------------|
| 获取元素的索引 | `indexOf()` | |
| 获取元素的最后索引 | `lastIndexOf()` | |
| 获取元素 | `get()` | 使用索引运算符获取元素：`list[index]`。 |
| 获取子列表 | `subList()` | |
| 替换一个或多个元素 | `set()`，`replaceAll()` | 使用索引运算符代替 `set()`：`list[index] = value`。 |

## 略有不同的操作

### 任何集合类型上的操作

| 描述 | Java | Kotlin |
|-------------|------|--------|
| 获取集合的大小 | `size()` | `count()`，`size` |
| 扁平化访问嵌套集合元素 | `collectionOfCollections.forEach(flatCollection::addAll)` 或 `collectionOfCollections.stream().flatMap().collect()` | [`flatten()`](collection-transformations.md#flatten) 或 [`flatMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/flat-map.html) |
| 对每个元素应用给定的函数 | `stream().map().collect()` | [`map()`](collection-filtering.md) |
| 按顺序对集合元素应用提供的操作并返回累积结果 | `stream().reduce()` | [`reduce()`，`fold()`](collection-aggregate.md#fold-and-reduce) |
| 按分类器对元素进行分组并计数 | `stream().collect(Collectors.groupingBy(classifier, counting()))` | [`eachCount()`](collection-grouping.md) |
| 按条件筛选 | `stream().filter().collect()` | [`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html) |
| 检查集合元素是否满足条件 | `stream().noneMatch()`，`stream().anyMatch()`，`stream().allMatch()` | [`none()`，`any()`，`all()`](collection-filtering.md) |
| 排序元素 | `stream().sorted().collect()` | [`sorted()`](collection-ordering.md#natural-order) |
| 获取前 N 个元素 | `stream().limit(N).collect()` | [`take(N)`](collection-parts.md#take-and-drop) |
| 使用谓词获取元素 | `stream().takeWhile().collect()` | [`takeWhile()`](collection-parts.md#take-and-drop) |
| 跳过前 N 个元素 | `stream().skip(N).collect()` | [`drop(N)`](collection-parts.md#take-and-drop) |
| 使用谓词跳过元素 | `stream().dropWhile().collect()` | [`dropWhile()`](collection-parts.md#take-and-drop) |
| 从集合元素和与其关联的某些值构建 Map | `stream().collect(toMap(keyMapper, valueMapper))` | [`associate()`](collection-transformations.md#associate) |

要在 Map 上执行上述所有操作，您首先需要获取 Map 的 `entrySet`。

### List 上的操作

| 描述 | Java | Kotlin |
|-------------|------|--------|
| 将列表按自然顺序排序 | `sort(null)` | `sort()` |
| 将列表按降序排序 | `sort(comparator)` | `sortDescending()` |
| 从列表中移除元素 | `remove(index)`，`remove(element)`| `removeAt(index)`，`remove(element)` 或 [`collection -= element`](collection-plus-minus.md) |
| 使用特定值填充列表的所有元素 | `Collections.fill()` | [`fill()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fill.html) |
| 从列表中获取唯一元素 | `stream().distinct().toList()` | [`distinct()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/distinct.html) |

## Java 标准库中不存在的操作

* [`zip()`，`unzip()`](collection-transformations.md) – 转换集合。
* [`aggregate()`](collection-grouping.md) – 按条件分组。
* [`takeLast()`，`takeLastWhile()`，`dropLast()`，`dropLastWhile()`](collection-parts.md#take-and-drop) – 使用谓词获取或丢弃元素。
* [`slice()`，`chunked()`，`windowed()`](collection-parts.md) – 检索集合部分内容。
* [加号 (`+`) 和减号 (`-`) 运算符](collection-plus-minus.md) – 添加或移除元素。

如果您想深入了解 `zip()`、`chunked()`、`windowed()` 和其他一些操作，请观看 Sebastian Aigner 关于 Kotlin 高级集合操作的这段视频：

<video src="https://www.youtube.com/v/N4CpLxGJlq0" title="高级集合操作"/>

## 可变性

在 Java 中，存在可变集合：

```java
// Java
// 这个列表是可变的！
public `List<Customer>` getCustomers() { ... }
```
{id="mutability-java"}

部分可变的集合：

```java
// Java
List<String> numbers = Arrays.asList("one", "two", "three", "four");
numbers.add("five"); // 在运行时失败，抛出 `UnsupportedOperationException`
```
{id="mutability-partly-java"}

以及不可变的集合：

```java
// Java
List<String> numbers = new LinkedList<>();
// 这个列表是不可变的！
List<String> immutableCollection = Collections.unmodifiableList(numbers);
immutableCollection.add("five"); // 在运行时失败，抛出 `UnsupportedOperationException`
```
{id="immutable-java"}

如果您在 IntelliJ IDEA 中编写最后两段代码，IDE 会警告您正尝试修改一个不可变对象。这段代码可以编译，但在运行时会抛出 `UnsupportedOperationException` 失败。仅通过观察类型，您无法判断一个集合是否是可变的。

与 Java 不同，在 Kotlin 中，您根据需要显式声明可变或只读集合。如果您尝试修改只读集合，代码将无法编译：

```kotlin
// Kotlin
val numbers = mutableListOf("one", "two", "three", "four")
numbers.add("five")            // 正常
val immutableNumbers = listOf("one", "two")
//immutableNumbers.add("five") // 编译错误 - 未解析的引用：add
```
{id="mutability-kotlin"}

在 [Kotlin 编码准则](coding-conventions.md#immutability)页面阅读更多关于不可变性的内容。

## 协变

在 Java 中，您不能将具有派生类型的集合传递给接受祖先类型集合的函数。例如，如果 `Rectangle` 继承自 `Shape`，您不能将 `Rectangle` 元素的集合传递给接受 `Shape` 元素集合的函数。为了使代码可编译，请使用 `? extends Shape` 类型，以便该函数可以接受带有 `Shape` 的任何继承者的集合：

```java
// Java
class Shape {}

class Rectangle extends Shape {}

public void doSthWithShapes(List<? extends Shape> shapes) {
/* 如果仅使用 List<Shape>，在调用此函数并将 `List<Rectangle>` 
作为如下实参传递时，代码将无法编译 */
}

public void main() {
    var rectangles = List.of(new Rectangle(), new Rectangle());
    doSthWithShapes(rectangles);
}
```
{id="covariance-java"}

在 Kotlin 中，只读集合类型是[协变的](generics.md#variance)。这意味着如果 `Rectangle` 类继承自 `Shape` 类，您可以在任何需要 `List<Shape>` 类型的地方使用 `List<Rectangle>` 类型。换句话说，集合类型具有与元素类型相同的子类型关系。Map 在值类型上是协变的，但在键类型上不是。可变集合不是协变的——这会导致运行时失败。

```kotlin
// Kotlin
open class Shape(val name: String)

class Rectangle(private val rectangleName: String) : Shape(rectangleName)

fun doSthWithShapes(shapes: List<Shape>) {
    println("形状为：${shapes.joinToString { it.name }}")
}

fun main() {
    val rectangles = listOf(Rectangle("菱形"), Rectangle("平行四边形"))
    doSthWithShapes(rectangles)
}
```
{kotlin-runnable="true" id="covariance-kotlin"}

在此阅读有关[集合类型](collections-overview.md#collection-types)的更多信息。

## 区间与数列

在 Kotlin 中，您可以使用[区间](ranges.md)创建间隔。例如，`Version(1, 11)..Version(1, 30)` 包含从 `1.11` 到 `1.30` 的所有版本。您可以使用 `in` 运算符检查您的版本是否在区间内：`Version(0, 9) in versionRange`。

在 Java 中，您需要手动检查 `Version` 是否符合两个边界：

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

在 Kotlin 中，您可以将区间作为一个整体对象进行操作。您不需要创建两个变量并将 `Version` 与它们进行比较：

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

一旦您需要排除其中一个边界，例如检查版本是否大于或等于 (`>=`) 最小版本且小于 (`<`) 最大版本，这些闭合区间将不再适用。

## 按多个标准比较

在 Java 中，要按多个标准比较对象，您可以使用来自 [`Comparator`](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html) 接口的 [`comparing()`](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html#comparing-java.util.function.Function-) 和 [`thenComparingX()`](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html#thenComparing-java.util.Comparator-) 函数。例如，按姓名和年龄比较人：

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

在 Kotlin 中，您只需列出要比较的字段：

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

## 序列

在 Java 中，您可以这样生成一个数字序列：

```java
// Java
int sum = IntStream.iterate(1, e -> e + 3)
    .limit(10).sum();
System.out.println(sum); // 输出 145
```
{id="sequences-java"}

在 Kotlin 中，使用 _[序列 (sequences)](sequences.md)_。序列的多步处理在可能的情况下是延迟执行的——只有在请求整个处理链的结果时才会进行实际计算。

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

序列可以减少执行某些筛选操作所需的步骤数。请参阅[序列处理示例](sequences.md#sequence-processing-example)，它展示了 `Iterable` 和 `Sequence` 之间的区别。

## 从列表中移除元素

在 Java 中，[`remove()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/List.html#remove(int)) 函数接受要移除元素的索引。

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

在 Kotlin 中，有两种类型的元素移除：通过 [`removeAt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/remove-at.html) 按索引移除，以及通过 [`remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/remove.html) 按值移除。

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

## 遍历 Map

在 Java 中，您可以通过 [`forEach`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Map.html#forEach(java.util.function.BiConsumer)) 遍历 Map：

```java
// Java
numbers.forEach((k,v) -> System.out.println("Key = " + k + ", Value = " + v));
```
{id="traverse-map-java"}

在 Kotlin 中，使用 `for` 循环或类似于 Java `forEach` 的 `forEach` 来遍历 Map：

```kotlin
// Kotlin
for ((k, v) in numbers) {
    println("Key = $k, Value = $v")
}
// 或者
numbers.forEach { (k, v) -> println("Key = $k, Value = $v") }
```
{id="traverse-map-kotlin"}

## 获取可能为空的集合的第一个和最后一个项目

在 Java 中，您可以通过检查集合的大小并使用索引来安全地获取第一个和最后一个项目：

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

您还可以对 [`Deque`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Deque.html) 及其继承者使用 [`getFirst()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Deque.html#getFirst()) 和 [`getLast()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Deque.html#getLast()) 函数：

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

在 Kotlin 中，有专门的函数 [`firstOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-or-null.html) 和 [`lastOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last-or-null.html)。使用 [`Elvis 运算符`](null-safety.md#elvis-operator)，您可以根据函数的结果立即执行进一步的操作。例如，`firstOrNull()`：

```kotlin
// Kotlin
val emails = listOf<String>() // 可能为空
val theOldestEmail = emails.firstOrNull() ?: ""
val theFreshestEmail = emails.lastOrNull() ?: ""
```
{id="get-first-last-kotlin"}

## 从 List 创建 Set

在 Java 中，要从 [`List`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/List.html) 创建 [`Set`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Set.html)，您可以使用 [`Set.copyOf`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Set.html#copyOf(java.util.Collection)) 函数：

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

## 分组元素

在 Java 中，您可以使用 [Collectors](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Collectors.html) 的 `groupingBy()` 函数对元素进行分组：

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

## 筛选元素

在 Java 中，要从集合中筛选元素，您需要使用 [Stream API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html)。Stream API 具有 `intermediate`（中间）和 `terminal`（终端）操作。`filter()` 是一个中间操作，它返回一个流。要接收集合作为输出，您需要使用终端操作，如 `collect()`。例如，仅保留那些键以 `1` 结尾且值大于 `10` 的对：

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

在 Kotlin 中，筛选功能内置在集合中，且 `filter()` 返回被筛选的相同集合类型。因此，您只需编写 `filter()` 及其谓词：

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

在此了解更多关于[筛选 Map](map-operations.md#filter) 的信息。

### 按类型筛选元素

在 Java 中，要按类型筛选元素并对其执行操作，您需要使用 [`instanceof`](https://docs.oracle.com/en/java/javase/17/language/pattern-matching-instanceof-operator.html) 运算符检查它们的类型，然后进行类型转换：

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

在 Kotlin 中，您只需在集合上调用 [`filterIsInstance<NEEDED_TYPE>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-is-instance.html)，类型转换将由[智能转换](typecasts.md#smart-casts)完成：

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

### 测试谓词

某些任务要求您检查是否所有、没有任何或有任何元素满足某个条件。在 Java 中，您可以通过 [Stream API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html) 函数 [`allMatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html#allMatch(java.util.function.Predicate))、[`noneMatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html#noneMatch(java.util.function.Predicate)) 和 [`anyMatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html#anyMatch(java.util.function.Predicate)) 进行所有这些检查：

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

在 Kotlin 中，[扩展函数](extensions.md) `none()`、`any()` 和 `all()` 可用于每个 [Iterable](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/#kotlin.collections.Iterable) 对象：

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

了解更多关于[测试谓词](collection-filtering.md#test-predicates)的信息。

## 集合转换操作

### 压缩元素

在 Java 中，您可以通过同时对两个集合进行迭代，将两个集合中相同位置的元素组成对：

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

如果您想执行比仅将元素对打印到输出更复杂的操作，可以使用 [Records](https://docs.oracle.com/en/java/javase/17/language/records.html)。在上面的示例中，record 将是 `record AnimalDescription(String animal, String color) {}`。

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

`zip()` 返回 [Pair](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-pair/) 对象的 List。

> 如果集合的大小不同，`zip()` 的结果将采用较小的大小。较大集合的最后几个元素不包含在结果中。
>
{style="note"}

### 关联元素

在 Java 中，您可以使用 [Stream API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html) 将元素与其特征相关联：

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

## 下一步是什么？

* 访问 [Kotlin Koans](koans.md) – 完成练习以学习 Kotlin 语法。每个练习都作为一个失败的单元测试创建，您的工作是使其通过。
* 查看其他 [Kotlin 惯用法](idioms.md)。
* 了解如何使用 [Java 到 Kotlin 转换器](mixing-java-kotlin-intellij.md#convert-java-files-to-kotlin)将现有 Java 代码转换为 Kotlin。
* 探索 [Kotlin 中的集合](collections-overview.md)。

如果您有喜欢的惯用法，我们邀请您通过发送拉取请求来分享它。