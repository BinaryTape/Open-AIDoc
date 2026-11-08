[//]: # (title: Java 與 Kotlin 中的集合)

<web-summary>了解如何從 Java 集合遷移至 Kotlin 集合。本指南涵蓋 Kotlin 與 Java 的 List、ArrayList、Map、Set 等資料結構。</web-summary>

*集合（Collections）* 是由可變數量（可能為零）的項目組成的群組，這些項目對於要解決的問題至關重要，且經常被操作。
本指南解釋並比較 Java 和 Kotlin 中的集合概念與操作。
它將協助你從 Java 遷移至 Kotlin，並以純正的 Kotlin 風格編寫程式碼。

本指南的第一部分包含 Java 與 Kotlin 中相同集合操作的快速對照表。
其分為[兩者相同的操作](#operations-that-are-the-same-in-java-and-kotlin)以及[僅存在於 Kotlin 中的操作](#operations-that-don-t-exist-in-java-s-standard-library)。
指南的第二部分從[可變性](#mutability)開始，透過具體案例來解釋部分差異。

如需集合的簡介，請參閱[集合概觀](collections-overview.md)，或觀看 Kotlin 技術傳教士 Sebastian Aigner 製作的[影片](https://www.youtube.com/watch?v=F8jj7e-_jFA)。

> 以下所有範例均僅使用 Java 和 Kotlin 標準程式庫 API。
>
{style="note"}

## Java 與 Kotlin 中相同的操作 {id="operations-that-are-the-same-in-java-and-kotlin"}

在 Kotlin 中，有許多集合操作看起來與 Java 中的對應操作完全相同。

### 針對 List、Set、Queue 與 Deque 的操作 {id="operations-on-lists-sets-queues-and-deques"}

| 說明 | 通用操作 | 更多 Kotlin 替代方案 |
|---|---|---|
| 新增一個或多個元素 | `add()`, `addAll()` | 使用 [`plusAssign`(`+=`) 運算子](collection-combine.md#add-and-remove-elements)：`collection += element`、`collection += anotherCollection`。 |
| 檢查集合是否包含一個或多個元素 | `contains()`, `containsAll()` | 使用 [`in` 關鍵字](collection-elements.md#check-element-existence)以運算子形式呼叫 `contains()`：`element in collection`。 |
| 檢查集合是否為空 | `isEmpty()` | 使用 [`isNotEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-not-empty.html) 來檢查集合是否非空。 |
| 依特定條件移除 | `removeIf()` | |
| 僅保留選定的元素 | `retainAll()` | |
| 移除集合中的所有元素 | `clear()` | |
| 從集合獲取串流 (stream) | `stream()` | Kotlin 有自己的串流處理方式：[序列](#sequences)以及如 [`map()`](collection-filtering.md) 和 [`filter()`](#filter-elements) 等方法。 |
| 從集合獲取反覆運算器 (iterator) | `iterator()` | |

### 針對 Map 的操作 {id="operations-on-maps"}

| 說明 | 通用操作 | 更多 Kotlin 替代方案 |
|---|---|---|
| 新增一個或多個元素 | `put()`, `putAll()`, `putIfAbsent()` | 在 Kotlin 中，指派操作 `map[key] = value` 的行為與 `put(key, value)` 相同。此外，你也可以使用 [`plusAssign`(`+=`) 運算子](collection-combine.md#add-and-remove-elements)：`map += Pair(key, value)` 或 `map += anotherMap`。 |
| 替換一個或多個元素 | `put()`, `replace()`, `replaceAll()` | 使用索引運算子 `map[key] = value` 代替 `put()` 與 `replace()`。 |
| 獲取元素 | `get()` | 使用索引運算子獲取元素：`map[index]`。 |
| 檢查 Map 是否包含一個或多個元素 | `containsKey()`, `containsValue()` | 使用 [`in` 關鍵字](collection-elements.md#check-element-existence)以運算子形式呼叫 `contains()`：`element in map`。 |
| 檢查 Map 是否為空 | `isEmpty()` | 使用 [`isNotEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-not-empty.html) 檢查 Map 是否非空。 |
| 移除元素 | `remove(key)`, `remove(key, value)` | 使用 [`minusAssign`(`-=`) 運算子](collection-combine.md#add-and-remove-elements)：`map -= key`。 |
| 移除 Map 中的所有元素 | `clear()` | |
| 從 Map 獲取串流 | 針對 entries、keys 或 values 呼叫 `stream()` | |

### 僅適用於 List 的操作 {id="operations-that-exist-only-for-lists"}

| 說明 | 通用操作 | 更多 Kotlin 替代方案 |
|---|---|---|
| 獲取元素的索引 | `indexOf()` | |
| 獲取元素的最後一個索引 | `lastIndexOf()` | |
| 獲取元素 | `get()` | 使用索引運算子獲取元素：`list[index]`。 |
| 取子清單 (sublist) | `subList()` | |
| 替換一個或多個元素 | `set()`,  `replaceAll()` | 使用索引運算子代替 `set()`：`list[index] = value`。 |

## 略有差異的操作 {id="operations-that-differ-a-bit"}

### 適用於任何集合類型的操作 {id="operations-on-any-collection-type"}

| 說明 | Java | Kotlin |
|---|---|---|
| 獲取集合的大小 | `size()` | `count()`, `size` |
| 扁平化存取巢狀集合元素 | `collectionOfCollections.forEach(flatCollection::addAll)` 或 `collectionOfCollections.stream().flatMap().collect()` | [`flatten()`](collection-transformations.md#flatten) 或 [`flatMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/flat-map.html) |
| 對每個元素套用給定的函式 | `stream().map().collect()` | [`map()`](collection-filtering.md) |
| 依序對集合元素套用所提供的操作並回傳累計結果 | `stream().reduce()` | [`reduce()`, `fold()`](collection-aggregate.md#fold-and-reduce) |
| 依分類器對元素分組並計數 | `stream().collect(Collectors.groupingBy(classifier, counting()))` | [`eachCount()`](collection-grouping.md) |
| 依條件篩選 | `stream().filter().collect()` | [`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html) |
| 檢查集合元素是否符合條件 | `stream().noneMatch()`, `stream().anyMatch()`, `stream().allMatch()` | [`none()`, `any()`, `all()`](collection-filtering.md) |
| 排序元素 | `stream().sorted().collect()` | [`sorted()`](collection-ordering.md#natural-order) |
| 取得前 N 個元素 | `stream().limit(N).collect()` | [`take(N)`](collection-parts.md#take-and-drop) |
| 依述詞取得元素 | `stream().takeWhile().collect()` | [`takeWhile()`](collection-parts.md#take-and-drop) |
| 跳過前 N 個元素 | `stream().skip(N).collect()` | [`drop(N)`](collection-parts.md#take-and-drop) |
| 依述詞跳過元素 | `stream().dropWhile().collect()` | [`dropWhile()`](collection-parts.md#take-and-drop) |
| 依集合元素及其關聯的特定值建立 Map | `stream().collect(toMap(keyMapper, valueMapper))` | [`associate()`](collection-transformations.md#associate) |

若要在 Map 上執行上述所有操作，首先需要取得 Map 的 `entrySet`。

### 針對 List 的操作 {id="operations-on-lists"}

| 說明 | Java | Kotlin |
|---|---|---|
| 將 List 依自然順序排序 | `sort(null)` | `sort()` |
| 將 List 依降冪順序排序 | `sort(comparator)` | `sortDescending()` |
| 從 List 移除元素 | `remove(index)`, `remove(element)` | `removeAt(index)`, `remove(element)` 或 [`collection -= element`](collection-combine.md#add-and-remove-elements) |
| 以特定值填入 List 的所有元素 | `Collections.fill()` | [`fill()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fill.html) |
| 從 List 獲取唯一元素 | `stream().distinct().toList()` | [`distinct()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/distinct.html) |

## Java 標準程式庫中不存在的操作 {id="operations-that-don-t-exist-in-java-s-standard-library"}

* [`zip()`, `unzip()`](collection-transformations.md) – 轉換集合。
* [`aggregate()`](collection-grouping.md) – 依條件分組。
* [`takeLast()`, `takeLastWhile()`, `dropLast()`, `dropLastWhile()`](collection-parts.md#take-and-drop) – 依述詞選取或捨棄元素。
* [`slice()`, `chunked()`, `windowed()`](collection-parts.md) – 檢索集合的部分內容。
* [加號 (`+`) 與減號 (`-`) 運算子](collection-combine.md#add-and-remove-elements) – 新增或移除元素。

如果你想深入了解 `zip()`、`chunked()`、`windowed()` 和其他操作，請觀看 Sebastian Aigner 介紹 Kotlin 進階集合操作的影片：

<video src="https://www.youtube.com/v/N4CpLxGJlq0" title="Advanced Collection Operations"/>

## 可變性 {id="mutability"}

在 Java 中，存在可變集合（mutable collections）：

```java
// Java
// 這個 list 是可變的！
public List<Customer> getCustomers() { ... }
```
{id="mutability-java"}

部分可變集合：

```java
// Java
List<String> numbers = Arrays.asList("one", "two", "three", "four");
numbers.add("five"); // 執行時失敗，拋出 `UnsupportedOperationException`
```
{id="mutability-partly-java"}

以及不可變集合：

```java
// Java
List<String> numbers = new LinkedList<>();
// 這個 list 是不可變的！
List<String> immutableCollection = Collections.unmodifiableList(numbers);
immutableCollection.add("five"); // 執行時失敗，拋出 `UnsupportedOperationException`
```
{id="immutable-java"}

若你在 IntelliJ IDEA 中編寫最後兩段程式碼，IDE 會警告你正在嘗試修改不可變物件。這段程式碼可以通過編譯，但在執行階段會因 `UnsupportedOperationException` 而失敗。單看型別，你無法分辨某個集合是否為可變。

與 Java 不同的是，在 Kotlin 中，你需要根據需求明確宣告可變集合或唯讀集合。若你嘗試修改唯讀集合，程式碼將無法編譯：

```kotlin
// Kotlin
val numbers = mutableListOf("one", "two", "three", "four")
numbers.add("five")            // 正常執行
val immutableNumbers = listOf("one", "two")
//immutableNumbers.add("five") // 編譯錯誤 - Unresolved reference: add
```
{id="mutability-kotlin"}

若要深入了解不可變性，請參閱 [Kotlin 編碼慣例](coding-conventions.md#immutability)頁面。

## 共變性 {id="covariance"}

在 Java 中，你無法將包含衍生型別的集合傳遞給接收基底型別集合的函式。例如，若 `Rectangle` 繼承自 `Shape`，你無法將 `Rectangle` 元素的集合傳遞給接收 `Shape` 元素集合的函式。為了使程式碼能夠編譯，請使用 `? extends Shape` 型別，以便該函式可以接收包含任何 `Shape` 繼承者的集合：

```java
// Java
class Shape {}

class Rectangle extends Shape {}

public void doSthWithShapes(List<? extends Shape> shapes) {
/* 若僅使用 List<Shape>，如下方呼叫該函式並傳入
List<Rectangle> 作為引數時，程式碼將無法編譯 */
}

public void main() {
    var rectangles = List.of(new Rectangle(), new Rectangle());
    doSthWithShapes(rectangles);
}
```
{id="covariance-java"}

在 Kotlin 中，唯讀集合型別具有[共變性 (covariant)](generics.md#variance)。這意味著如果 `Rectangle` 類別繼承自 `Shape` 類別，你可以在任何需要 `List<Shape>` 型別的地方使用 `List<Rectangle>` 型別。換句話說，集合型別具有與元素型別相同的子型別關係。Map 在值型別上是共變的，但在鍵型別上則不是。可變集合不具共變性——否則會導致執行階段錯誤。

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

若要深入了解[集合型別](collection-types.md)，請參閱此處。

## 區間與數列 {id="ranges-and-progressions"}

在 Kotlin 中，你可以使用[區間 (ranges)](ranges.md) 來建立間隔。例如，`Version(1, 11)..Version(1, 30)` 包含從 `1.11` 到 `1.30` 的所有版本。你可以使用 `in` 運算子來檢查你的版本是否在該區間內：`Version(0, 9) in versionRange`。

在 Java 中，你需要手動檢查 `Version` 是否符合雙向邊界：

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

在 Kotlin 中，你將區間作為一個整體物件進行操作。你不需要建立兩個變數並拿 `Version` 與它們進行比較：

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

一旦你需要排除其中一個邊界（例如檢查版本是否大於或等於 (`>=`) 最小版本且小於 (`<`) 最大版本），這些包含邊界的區間就無法直接適用。

## 依多個條件進行比較 {id="comparison-by-several-criteria"}

在 Java 中，若要依多個條件比較物件，可以使用 [`Comparator`](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html) 介面中的 [`comparing()`](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html#comparing-java.util.function.Function-) 和 [`thenComparingX()`](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html#thenComparing-java.util.Comparator-) 函式。例如，依姓名和年齡比較人員：

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

在 Kotlin 中，你只需列舉想要比較的欄位即可：

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

在 Java 中，你可以透過這種方式產生數列：

```java
// Java
int sum = IntStream.iterate(1, e -> e + 3)
    .limit(10).sum();
System.out.println(sum); // 輸出 145
```
{id="sequences-java"}

在 Kotlin 中，請使用 *[序列 (sequences)](sequences.md)*。序列的多步驟處理會在可能的情況下延遲執行——只有在請求整個處理鏈的結果時，才會進行實際計算。

```kotlin
fun main() {
//sampleStart
    // Kotlin
    val sum = generateSequence(1) {
        it + 3
    }.take(10).sum()
    println(sum) // 輸出 145
//sampleEnd
}
```
{kotlin-runnable="true" id="sequences-kotlin"}

序列可以減少執行某些篩選操作所需的步驟數。請參閱[序列處理範例](sequences.md#sequence-processing-example)，該範例展示了 `Iterable` 和 `Sequence` 之間的差異。

## 從 List 中移除元素 {id="removal-of-elements-from-a-list"}

在 Java 中，[`remove()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/List.html#remove(int)) 函式接收要移除元素的索引。

移除整數元素時，請使用 `Integer.valueOf()` 函式作為 `remove()` 函式的引數：

```java
// Java
public void remove() {
    var numbers = new ArrayList<>();
    numbers.add(1);
    numbers.add(2);
    numbers.add(3);
    numbers.add(1);
    numbers.remove(1); // 依索引移除
    System.out.println(numbers); // [1, 3, 1]
    numbers.remove(Integer.valueOf(1));
    System.out.println(numbers); // [3, 1]
}
```
{id="remove-elements-java"}

在 Kotlin 中，有兩種類型的元素移除方式：透過 [`removeAt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/remove-at.html) 依索引移除，以及透過 [`remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/remove.html) 依值移除。

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

## 遍歷 Map {id="traverse-a-map"}

在 Java 中，你可以透過 [`forEach`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Map.html#forEach(java.util.function.BiConsumer)) 遍歷 Map：

```java
// Java
numbers.forEach((k,v) -> System.out.println("Key = " + k + ", Value = " + v));
```
{id="traverse-map-java"}

在 Kotlin 中，使用 `for` 迴圈或類似 Java `forEach` 的 `forEach` 來遍歷 Map：

```kotlin
// Kotlin
for ((k, v) in numbers) {
    println("Key = $k, Value = $v")
}
// 或者
numbers.forEach { (k, v) -> println("Key = $k, Value = $v") }
```
{id="traverse-map-kotlin"}

## 獲取可能為空的集合之首尾項目 {id="get-the-first-and-the-last-items-of-a-possibly-empty-collection"}

在 Java 中，你可以透過檢查集合大小並使用索引來安全地獲取第一個與最後一個項目：

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

在 JDK 21 及更高版本中，你還可以使用所有 [`SequencedCollection`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/SequencedCollection.html) 實作上提供的 [`getFirst()`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/SequencedCollection.html#getFirst()) 和 [`getLast()`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/SequencedCollection.html#getLast()) 方法。這包括所有的 `List` 實作以及如 `LinkedHashSet` 等其他集合。例如搭配 `ArrayList`：

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

在 Kotlin 中，有專用的 [`firstOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-or-null.html) 和 [`lastOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last-or-null.html) 函式。使用 [Elvis 運算子](null-safety.md#elvis-operator)，你可以根據函式結果立即執行後續操作。例如 `firstOrNull()`：

```kotlin
// Kotlin
val emails = listOf<String>() // 可能為空
val theOldestEmail = emails.firstOrNull() ?: ""
val theFreshestEmail = emails.lastOrNull() ?: ""
```
{id="get-first-last-kotlin"}

## 從 List 建立 Set {id="create-a-set-from-a-list"}

在 Java 中，若要從 [`List`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/List.html) 建立 [`Set`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Set.html)，可以使用 [`Set.copyOf`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Set.html#copyOf(java.util.Collection)) 函式：

```java
// Java
public void listToSet() {
    var sourceList = List.of(1, 2, 3, 1);
    var copySet = Set.copyOf(sourceList);
    System.out.println(copySet);
}
```
{id="list-to-set-java"}

在 Kotlin 中，使用 `toSet()` 函式：

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

## 元素分組 {id="group-elements"}

在 Java 中，你可以使用 [Collectors](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Collectors.html) 函式 `groupingBy()` 對元素進行分組：

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

在 Kotlin 中，使用 [`groupBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/group-by.html) 函式：

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

## 篩選元素 {id="filter-elements"}

在 Java 中，若要從集合中篩選元素，需要使用 [Stream API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html)。Stream API 包含「中間操作 (intermediate)」與「終端操作 (terminal)」。`filter()` 是一個中間操作，會回傳串流。若要接收集合做為輸出，則需要使用終端操作，例如 `collect()`。例如，僅保留鍵以 `1` 結尾且值大於 `10` 的鍵值對：

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

在 Kotlin 中，篩選功能已內建於集合中，且 `filter()` 會回傳與被篩選集合相同的型別。因此，你只需要編寫 `filter()` 及其述詞：

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

若要深入了解 [Map 篩選](map-operations.md#filter)，請參閱此處。

### 依型別篩選元素 {id="filter-elements-by-type"}

在 Java 中，若要依型別篩選元素並對其執行操作，需要使用 [`instanceof`](https://docs.oracle.com/en/java/javase/17/language/pattern-matching-instanceof-operator.html) 運算子檢查其型別，然後進行型別轉換：

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

在 Kotlin 中，你只需在集合上呼叫 [`filterIsInstance<NEEDED_TYPE>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-is-instance.html)，型別轉換會由[智慧轉型 (Smart casts)](typecasts.md#smart-casts) 自動完成：

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

### 測試述詞 {id="test-predicates"}

某些任務需要你檢查是否所有、沒有任何一個、或有任何元素符合條件。在 Java 中，你可以透過 [Stream API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html) 函式 [`allMatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html#allMatch(java.util.function.Predicate))、[`noneMatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html#noneMatch(java.util.function.Predicate)) 和 [`anyMatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html#anyMatch(java.util.function.Predicate)) 來完成所有這些檢查：

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

在 Kotlin 中，每個 [Iterable](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/#kotlin.collections.Iterable) 物件都提供[擴充函式](extensions.md) `none()`、`any()` 和 `all()`：

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

深入了解[測試述詞](collection-filtering.md#test-predicates)。

## 集合轉換操作 {id="collection-transformation-operations"}

### 配對元素 (Zip) {id="zip-elements"}

在 Java 中，你可以透過同時迭代兩個集合，將相同位置的元素組成配對：

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

若你想執行的操作不僅僅是將成對元素輸出，你可以使用[記錄 (Records)](https://docs.oracle.com/en/java/javase/17/language/records.html)。在上述範例中，記錄為 `record AnimalDescription(String animal, String color) {}`。

在 Kotlin 中，使用 [`zip()`](collection-transformations.md#zip) 函式即可達成相同的效果：

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

`zip()` 會回傳 [Pair](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-pair/) 物件的 List。

> 若集合的大小不同，`zip()` 的結果長度將以較小者為準。較大集合中多出的末尾元素將不會包含在結果中。
>
{style="note"}

### 關聯元素 (Associate) {id="associate-elements"}

在 Java 中，你可以使用 [Stream API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html) 將元素與其特徵建立關聯：

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

## 後續步驟 {id="what-s-next"}

* 造訪 [Kotlin Koans](koans.md) – 透過完成練習來學習 Kotlin 語法。每個練習最初都是一個失敗的單元測試，你的任務是讓它順利通過。
* 瀏覽其他 [Kotlin 慣用語 (Kotlin idioms)](idioms.md)。
* 了解如何使用 [Java 到 Kotlin 轉換器](mixing-java-kotlin-intellij.md#convert-java-files-to-kotlin)將現有的 Java 程式碼轉換為 Kotlin。
* 探索 [Kotlin 中的集合](collections-overview.md)。

若你有喜愛的慣用語，歡迎透過提交提取要求 (Pull Request) 與我們分享。