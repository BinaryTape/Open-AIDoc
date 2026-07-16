[//]: # (title: Java 與 Kotlin 中的集合)

<web-summary>瞭解如何從 Java 集合遷移到 Kotlin 集合。本指南涵蓋了 Kotlin 與 Java 的 List、ArrayList、Map、Set 等資料結構。</web-summary>

「集合 (Collections)」是包含可變數量項目（可能為零）的群組，這些項目對於解決問題具有重要意義且經常被操作。
本指南解釋並比較了 Java 與 Kotlin 中的集合概念與操作。
它將幫助您從 Java 遷移到 Kotlin，並以道地的 Kotlin 方式編寫程式碼。

本指南的第一部分包含 Java 與 Kotlin 中相同集合操作的快速術語表。
它分為[在 Java 與 Kotlin 中相同的操作](#operations-that-are-the-same-in-java-and-kotlin)以及[僅存在於 Kotlin 中的操作](#operations-that-don-t-exist-in-java-s-standard-library)。
指南的第二部分從[可變性](#mutability)開始，透過查看特定案例來解釋一些差異。

有關集合的簡介，請參閱[集合概覽](collections-overview.md)或觀看 Kotlin 技術傳教士 Sebastian Aigner 的這段[影片](https://www.youtube.com/watch?v=F8jj7e-_jFA)。

> 以下所有範例僅使用 Java 與 Kotlin 標準函式庫 API。
>
{style="note"}

## 在 Java 與 Kotlin 中相同的操作

在 Kotlin 中，集合上的許多操作與 Java 中的對應操作看起來完全相同。

### List、Set、Queue 與 Deque 的操作

| 描述 | 常用操作 | 更多 Kotlin 替代方案 |
|-------------|-----------|---------------------|
| 新增一個或多個元素 | `add()`, `addAll()` | 使用 [`plusAssign` (`+=`) 運算子](collection-plus-minus.md)：`collection += element`、`collection += anotherCollection`。 |
| 檢查集合是否包含一個或多個元素 | `contains()`, `containsAll()` | 使用 [`in` 關鍵字](collection-elements.md#check-element-existence)以運算子形式呼叫 `contains()`：`element in collection`。 |
| 檢查集合是否為空 | `isEmpty()` | 使用 [`isNotEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-not-empty.html) 來檢查集合是否不為空。 |
| 在特定條件下移除 | `removeIf()` | |
| 僅保留選定的元素 | `retainAll()` | |
| 從集合中移除所有元素 | `clear()` | |
| 從集合獲取 Stream | `stream()` | Kotlin 有自己的方式來處理 Stream：[序列 (sequences)](#sequences) 以及 [`map()`](collection-filtering.md) 和 [`filter()`](#filter-elements) 等方法。 |
| 從集合獲取反覆運算器 | `iterator()` | |

### Map 的操作

| 描述 | 常用操作 | 更多 Kotlin 替代方案 |
|-------------|-----------|---------------------|
| 新增一個或多個元素 | `put()`, `putAll()`, `putIfAbsent()`| 在 Kotlin 中，指派 `map[key] = value` 的行為與 `put(key, value)` 相同。此外，您可以使用 [`plusAssign` (`+=`) 運算子](collection-plus-minus.md)：`map += Pair(key, value)` 或 `map += anotherMap`。 |
| 替換一個或多個元素 | `put()`, `replace()`, `replaceAll()` | 使用索引運算子 `map[key] = value` 代替 `put()` 和 `replace()`。 |
| 獲取元素 | `get()` | 使用索引運算子獲取元素：`map[index]`。 |
| 檢查 Map 是否包含一個或多個元素 | `containsKey()`, `containsValue()` | 使用 [`in` 關鍵字](collection-elements.md#check-element-existence)以運算子形式呼叫 `contains()`：`element in map`。 |
| 檢查 Map 是否為空 |  `isEmpty()` | 使用 [`isNotEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-not-empty.html) 來檢查 Map 是否不為空。 |
| 移除元素 | `remove(key)`, `remove(key, value)` | 使用 [`minusAssign` (`-=`) 運算子](collection-plus-minus.md)：`map -= key`。 |
| 從 Map 中移除所有元素 | `clear()` | |
| 從 Map 獲取 Stream | 在 entries、keys 或 values 上使用 `stream()` | |

### 僅適用於 List 的操作

| 描述 | 常用操作 | 更多 Kotlin 替代方案 |
|-------------|-----------|---------------------|
| 獲取元素的索引 | `indexOf()` | |
| 獲取元素的最後一個索引 | `lastIndexOf()` | |
| 獲取元素 | `get()` | 使用索引運算子獲取元素：`list[index]`。 |
| 擷取子清單 | `subList()` | |
| 替換一個或多個元素 | `set()`,  `replaceAll()` | 使用索引運算子代替 `set()`：`list[index] = value`。 |

## 有所不同的操作

### 適用於任何集合類型的操作

| 描述 | Java | Kotlin |
|-------------|------|--------|
| 獲取集合的大小 | `size()` | `count()`, `size` |
| 展平存取巢狀集合元素 | `collectionOfCollections.forEach(flatCollection::addAll)` 或 `collectionOfCollections.stream().flatMap().collect()` | [`flatten()`](collection-transformations.md#flatten) 或 [`flatMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/flat-map.html) |
| 對每個元素套用指定函式 | `stream().map().collect()` | [`map()`](collection-filtering.md) |
| 依序對集合元素套用提供的操作並回傳累加結果 | `stream().reduce()` | [`reduce()`, `fold()`](collection-aggregate.md#fold-and-reduce) |
| 依分類器對元素進行分組並計數 | `stream().collect(Collectors.groupingBy(classifier, counting()))` | [`eachCount()`](collection-grouping.md) |
| 依條件過濾 | `stream().filter().collect()` | [`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html) |
| 檢查集合元素是否滿足條件 | `stream().noneMatch()`, `stream().anyMatch()`, `stream().allMatch()` | [`none()`, `any()`, `all()`](collection-filtering.md) |
| 排序元素 | `stream().sorted().collect()` | [`sorted()`](collection-ordering.md#natural-order) |
| 取前 N 個元素 | `stream().limit(N).collect()` | [`take(N)`](collection-parts.md#take-and-drop) |
| 依述句獲取元素 | `stream().takeWhile().collect()` | [`takeWhile()`](collection-parts.md#take-and-drop) |
| 跳過前 N 個元素 | `stream().skip(N).collect()` | [`drop(N)`](collection-parts.md#take-and-drop) |
| 依述句跳過元素 | `stream().dropWhile().collect()` | [`dropWhile()`](collection-parts.md#take-and-drop) |
| 從集合元素及其關聯的特定值建置 Map | `stream().collect(toMap(keyMapper, valueMapper))` | [`associate()`](collection-transformations.md#associate) |

若要在 Map 上執行上述所有操作，您首先需要獲取 Map 的 `entrySet`。

### List 的操作

| 描述 | Java | Kotlin |
|-------------|------|--------|
| 將清單按自然順序排序 | `sort(null)` | `sort()` |
| 將清單按降冪順序排序 | `sort(comparator)` | `sortDescending()` |
| 從清單中移除元素 | `remove(index)`, `remove(element)`| `removeAt(index)`, `remove(element)` 或 [`collection -= element`](collection-plus-minus.md) |
| 以特定值填充清單的所有元素 | `Collections.fill()` | [`fill()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fill.html) |
| 從清單中獲取不重複的元素 | `stream().distinct().toList()` | [`distinct()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/distinct.html) |

## 僅存在於 Java 標準函式庫之外的操作

* [`zip()`, `unzip()`](collection-transformations.md) – 轉換集合。
* [`aggregate()`](collection-grouping.md) – 依條件分組。
* [`takeLast()`, `takeLastWhile()`, `dropLast()`, `dropLastWhile()`](collection-parts.md#take-and-drop) – 依述句獲取或捨棄元素。
* [`slice()`, `chunked()`, `windowed()`](collection-parts.md) – 檢索集合部分內容。
* [Plus (`+`) 與 minus (`-`) 運算子](collection-plus-minus.md) – 新增或移除元素。

如果您想深入瞭解 `zip()`、`chunked()`、`windowed()` 和其他一些操作，請觀看 Sebastian Aigner 關於 Kotlin 進階集合操作的影片：

<video src="https://www.youtube.com/v/N4CpLxGJlq0" title="進階集合操作"/>

## 可變性

在 Java 中，存在可變集合：

```java
// Java
// 此清單是可變的！
public `List<Customer>` getCustomers() { ... }
```
{id="mutability-java"}

部分可變的集合：

```java
// Java
List<String> numbers = Arrays.asList("one", "two", "three", "four");
numbers.add("five"); // 在執行時失敗，拋出 `UnsupportedOperationException`
```
{id="mutability-partly-java"}

以及不可變的集合：

```java
// Java
List<String> numbers = new LinkedList<>();
// 此清單是不可變的！
List<String> immutableCollection = Collections.unmodifiableList(numbers);
immutableCollection.add("five"); // 在執行時失敗，拋出 `UnsupportedOperationException`
```
{id="immutable-java"}

如果您在 IntelliJ IDEA 中編寫最後兩段程式碼，IDE 會警告您正試圖修改不可變物件。
這段程式碼會通過編譯，但在執行時會因為 `UnsupportedOperationException` 而失敗。您無法僅透過查看類型來判斷一個集合是否可變。

與 Java 不同，在 Kotlin 中，您可以根據需求明確宣告可變或唯讀集合。
如果您嘗試修改唯讀集合，程式碼將無法通過編譯：

```kotlin
// Kotlin
val numbers = mutableListOf("one", "two", "three", "four")
numbers.add("five")            // 這是可以的
val immutableNumbers = listOf("one", "two")
//immutableNumbers.add("five") // 編譯錯誤 - Unresolved reference: add
```
{id="mutability-kotlin"}

在 [Kotlin 編碼慣例](coding-conventions.md#immutability)頁面閱讀更多關於不可變性的內容。

## 共變性

在 Java 中，您不能將具有衍生型別的集合傳遞給接收基底型別集合的函式。
例如，如果 `Rectangle` 繼承自 `Shape`，您不能將 `Rectangle` 元素的集合傳遞給接收 `Shape` 元素集合的函式。
為了讓程式碼可編譯，請使用 `? extends Shape` 型別，以便函式可以接收任何 `Shape` 繼承者的集合：

```java
// Java
class Shape {}

class Rectangle extends Shape {}

public void doSthWithShapes(List<? extends Shape> shapes) {
/* 如果只使用 List<Shape>，當使用 `List<Rectangle>` 作為引數呼叫此函式時，
如下所示，程式碼將無法編譯 */
}

public void main() {
    var rectangles = List.of(new Rectangle(), new Rectangle());
    doSthWithShapes(rectangles);
}
```
{id="covariance-java"}

在 Kotlin 中，唯讀集合型別是[共變的 (covariant)](generics.md#variance)。這意味著如果 `Rectangle` 類別繼承自 `Shape` 類別，
您可以在任何需要 `List<Shape>` 型別的地方使用 `List<Rectangle>` 型別。
換句話說，集合型別具有與元素型別相同的子型別關係。Map 在值 (value) 型別上是共變的，但在鍵 (key) 型別上則不是。
可變集合不是共變的——這會導致執行時失敗。

```kotlin
// Kotlin
open class Shape(val name: String)

class Rectangle(private val rectangleName: String) : Shape(rectangleName)

fun doSthWithShapes(shapes: List<Shape>) {
    println("圖形為：${shapes.joinToString { it.name }}")
}

fun main() {
    val rectangles = listOf(Rectangle("rhombus"), Rectangle("parallelepiped"))
    doSthWithShapes(rectangles)
}
```
{kotlin-runnable="true" id="covariance-kotlin"}

在此閱讀更多關於[集合型別](collections-overview.md#collection-types)的資訊。

## 範圍與數列

在 Kotlin 中，您可以使用[範圍 (ranges)](ranges.md) 來建立區間。例如，`Version(1, 11)..Version(1, 30)` 包含從 `1.11` 到 `1.30` 的所有版本。
您可以使用 `in` 運算子檢查您的版本是否在該範圍內：`Version(0, 9) in versionRange`。

在 Java 中，您需要手動檢查 `Version` 是否符合兩個邊界：

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

在 Kotlin 中，您將範圍作為一個整體物件來操作。您不需要建立兩個變數並將 `Version` 與它們進行比較：

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

一旦您需要排除其中一個邊界，例如檢查版本是否大於或等於 (`>=`) 最小版本且小於 (`<`) 最大版本時，這些包含邊界的範圍將無效。

## 多重準則比較

在 Java 中，要根據多個準則比較物件，您可以使用來自 [`Comparator`](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html) 介面的 [`comparing()`](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html#comparing-java.util.function.Function-) 
和 [`thenComparingX()`](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html#thenComparing-java.util.Comparator-) 函式。
例如，根據姓名和年齡比較人：

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

在 Kotlin 中，您只需列舉想要比較的欄位：

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

在 Java 中，您可以透過這種方式產生數字序列：

```java
// Java
int sum = IntStream.iterate(1, e -> e + 3)
    .limit(10).sum();
System.out.println(sum); // 印出 145
```
{id="sequences-java"}

在 Kotlin 中，使用「[序列 (sequences)](sequences.md)」。序列的多步驟處理在可能的情況下會延遲執行——
只有在請求整個處理鏈的結果時，才會進行實際計算。

```kotlin
fun main() {
//sampleStart
    // Kotlin
    val sum = generateSequence(1) {
        it + 3
    }.take(10).sum()
    println(sum) // 印出 145
//sampleEnd
}
```
{kotlin-runnable="true" id="sequences-kotlin"}

序列可以減少執行某些過濾操作所需的步驟數。
請參閱[序列處理範例](sequences.md#sequence-processing-example)，它展示了 `Iterable` 和 `Sequence` 之間的區別。

## 從清單中移除元素

在 Java 中，[`remove()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/List.html#remove(int)) 函式接收要移除元素的索引。

當移除整數元素時，請使用 `Integer.valueOf()` 函式作為 `remove()` 函式的引數：

```java
// Java
public void remove() {
    var numbers = new ArrayList<>();
    numbers.add(1);
    numbers.add(2);
    numbers.add(3);
    numbers.add(1);
    numbers.remove(1); // 這是按索引移除
    System.out.println(numbers); // [1, 3, 1]
    numbers.remove(Integer.valueOf(1));
    System.out.println(numbers); // [3, 1]
}
```
{id="remove-elements-java"}

在 Kotlin 中，有兩種類型的元素移除方式：
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

## 遍歷 Map

在 Java 中，您可以透過 [`forEach`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Map.html#forEach(java.util.function.BiConsumer)) 遍歷 Map：

```java
// Java
numbers.forEach((k,v) -> System.out.println("Key = " + k + ", Value = " + v));
```
{id="traverse-map-java"}

在 Kotlin 中，使用 `for` 迴圈或與 Java 的 `forEach` 類似的 `forEach` 來遍歷 Map：

```kotlin
// Kotlin
for ((k, v) in numbers) {
    println("Key = $k, Value = $v")
}
// 或者
numbers.forEach { (k, v) -> println("Key = $k, Value = $v") }
```
{id="traverse-map-kotlin"}

## 獲取可能為空的集合的第一個和最後一個項目

在 Java 中，您可以藉由檢查集合大小並使用索引來安全地獲取第一個和最後一個項目：

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

您也可以對 [`Deque`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Deque.html) 及其繼承者使用 [`getFirst()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Deque.html#getFirst()) 
和 [`getLast()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Deque.html#getLast()) 函式：

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

在 Kotlin 中，有特殊的函式 [`firstOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-or-null.html)
和 [`lastOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last-or-null.html)。
使用 [`Elvis 運算子`](null-safety.md#elvis-operator)，您可以根據函式的結果立即執行進一步的操作。例如 `firstOrNull()`：

```kotlin
// Kotlin
val emails = listOf<String>() // 可能為空
val theOldestEmail = emails.firstOrNull() ?: ""
val theFreshestEmail = emails.lastOrNull() ?: ""
```
{id="get-first-last-kotlin"}

## 從清單建立 Set

在 Java 中，要從 [`List`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/List.html) 建立 [`Set`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Set.html)，您可以使用 [`Set.copyOf`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Set.html#copyOf(java.util.Collection)) 函式：

```java
// Java
public void listToSet() {
    var sourceList = List.of(1, 2, 3, 1);
    var copySet = Set.copyOf(sourceList);
    System.out.println(copySet);
}
```
{id="list-to-set-java"}

在 Kotlin 中，使用函式 `toSet()`：

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

## 分組元素

在 Java 中，您可以使用 [Collectors](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Collectors.html) 函式 `groupingBy()` 來分組元素：

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

在 Kotlin 中，使用函式 [`groupBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/group-by.html)：

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

## 過濾元素

在 Java 中，要從集合中過濾元素，您需要使用 [Stream API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html)。
Stream API 具有「中間 (intermediate)」操作和「終端 (terminal)」操作。`filter()` 是一個中間操作，它回傳一個 Stream。
要接收一個集合位為輸出，您需要使用終端操作，例如 `collect()`。
例如，僅保留鍵以 `1` 結尾且值大於 `10` 的配對：

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

在 Kotlin 中，過濾功能內建在集合中，且 `filter()` 會回傳與被過濾集合相同的集合型別。
因此，您只需要編寫 `filter()` 及其述句：

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

在此進一步了解[過濾 Map](map-operations.md#filter)。

### 按型別過濾元素

在 Java 中，要按型別過濾元素並對其執行操作，您需要使用 [`instanceof`](https://docs.oracle.com/en/java/javase/17/language/pattern-matching-instanceof-operator.html) 運算子檢查其型別，然後進行型別轉換：

```java
// Java
public void objectIsInstance() {
    var numbers = new ArrayList<>();
    numbers.add(null);
    numbers.add(1);
    numbers.add("two");
    numbers.add(3.0);
    numbers.add("four");
    System.out.println("所有大寫形式的 String 元素：");
    numbers.stream().filter(it -> it instanceof String)
        .forEach( it -> System.out.println(((String) it).toUpperCase()));
}
```
{id="filter-by-type-java"}

在 Kotlin 中，您只需在集合上呼叫 [`filterIsInstance<NEEDED_TYPE>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-is-instance.html)，型別轉換由[智慧轉換 (Smart casts)](typecasts.md#smart-casts) 完成：

```kotlin
// Kotlin
fun main() {
//sampleStart
    // Kotlin
    val numbers = listOf(null, 1, "two", 3.0, "four")
    println("所有大寫形式的 String 元素：")
    numbers.filterIsInstance<String>().forEach {
        println(it.uppercase())
    }
//sampleEnd
}
```
{kotlin-runnable="true" id="filter-by-type-kotlin"}

### 測試述句

有些任務需要您檢查是否所有、沒有或任何元素滿足某個條件。
在 Java 中，您可以透過 [Stream API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html) 函式 [`allMatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html#allMatch(java.util.function.Predicate))、
[`noneMatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html#noneMatch(java.util.function.Predicate)) 和 
[`anyMatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html#anyMatch(java.util.function.Predicate)) 來執行所有這些檢查：

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

在 Kotlin 中，[擴充函式](extensions.md) `none()`、`any()` 和 `all()` 可用於每個 [Iterable](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/#kotlin.collections.Iterable) 物件：

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

進一步了解[測試述句](collection-filtering.md#test-predicates)。

## 集合轉換操作

### Zip 元素

在 Java 中，您可以透過同時在兩個集合上反覆運算，從兩個集合中相同位置的元素建立配對：

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

如果您想執行比僅將元素配對印出到輸出更複雜的操作，您可以使用 [Records](https://docs.oracle.com/en/java/javase/17/language/records.html)。
在上述範例中，Record 將會是 `record AnimalDescription(String animal, String color) {}`。

在 Kotlin 中，使用 [`zip()`](collection-transformations.md#zip) 函式執行相同的操作：

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

`zip()` 回傳 [Pair](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-pair/) 物件的 List。

> 如果集合大小不同，`zip()` 的結果將以較小的大小為準。較大集合的最後幾個元素不會包含在結果中。
>
{style="note"}

### 關聯元素

在 Java 中，您可以使用 [Stream API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html) 將元素與特徵關聯起來：

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

在 Kotlin 中，使用 [`associate()`](collection-transformations.md#associate) 函式：

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

## 下一步

* 造訪 [Kotlin Koans](koans.md) – 透過完成練習來學習 Kotlin 語法。每個練習都是作為失敗的單元測試建立的，您的任務是讓它通過測試。
* 瀏覽其他 [Kotlin 慣用法](idioms.md)。
* 瞭解如何使用 [Java 到 Kotlin 轉換器](mixing-java-kotlin-intellij.md#convert-java-files-to-kotlin)將現有的 Java 程式碼轉換為 Kotlin。
* 探索 [Kotlin 中的集合](collections-overview.md)。

如果您有喜歡的慣用法，我們歡迎您透過發送提取要求 (PR) 來分享。