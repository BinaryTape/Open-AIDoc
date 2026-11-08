[//]: # (title: Java と Kotlin におけるコレクション)

<web-summary>Java コレクションから Kotlin コレクションへの移行方法を学びます。このガイドでは、Kotlin と Java の List、ArrayList、Map、Set などのデータ構造を取り上げます。</web-summary>

_コレクション（Collections）_ とは、解決すべき課題にとって意味を持ち、共通の操作が行われる可変個（0 個の場合もあります）のアイテムの集まりです。
このガイドでは、Java と Kotlin におけるコレクションの概念と操作を説明し、比較します。
Java から Kotlin への移行を支援し、本物の Kotlin らしい方法でコードを書けるようにすることを目的としています。

このガイドの最初のパートには、Java と Kotlin で同じコレクションに対する操作のクイック用語集（対応表）が含まれています。
これは、[Java と Kotlin で同じ操作](#operations-that-are-the-same-in-java-and-kotlin) と 
[Kotlin にのみ存在する操作](#operations-that-don-t-exist-in-java-s-standard-library) に分かれています。
[可変性（Mutability）](#mutability) から始まるガイドの第 2 パートでは、具体的なケースを見ながらいくつかの違いを説明します。

コレクションの概要については、[コレクションの概要](collections-overview.md) を参照するか、Kotlin デベロッパーアドボケイトの Sebastian Aigner によるこちらの [ビデオ](https://www.youtube.com/watch?v=F8jj7e-_jFA) をご覧ください。

> 以下の例はすべて、Java および Kotlin の標準ライブラリ API のみを使用しています。
>
{style="note"}

## Java と Kotlin で同じ操作 {id="operations-that-are-the-same-in-java-and-kotlin"}

Kotlin には、Java の対応するものとまったく同じように見えるコレクション操作が多数あります。

### List、Set、Queue、Deque に対する操作 {id="operations-on-lists-sets-queues-and-deques"}

| 説明                                                        | 一般的な操作                  | より Kotlin らしい代替手段                                                                                                                                 |
|------------------------------------------------------------|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 要素を追加する                                             | `add()`, `addAll()`           | [`plusAssign` (`+=`) 演算子](collection-combine.md#add-and-remove-elements) を使用: `collection += element`, `collection += anotherCollection`。          |
| コレクションに要素が含まれているか確認する                 | `contains()`, `containsAll()` | [`in` キーワード](collection-elements.md#check-element-existence) を使用して演算子の形式で `contains()` を呼び出す: `element in collection`。                 |
| コレクションが空かどうかを確認する                         | `isEmpty()`                   | コレクションが空でないことを確認するには [`isNotEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-not-empty.html) を使用。        |
| 特定の条件で削除する                                       | `removeIf()`                  |                                                                                                                                                            |
| 選択した要素のみを残す                                     | `retainAll()`                 |                                                                                                                                                            |
| コレクションからすべての要素を削除する                     | `clear()`                     |                                                                                                                                                            |
| コレクションからストリームを取得する                       | `stream()`                    | Kotlin にはストリームを処理する独自の方法があります: [シーケンス（sequences）](#sequences) や [`map()`](collection-filtering.md)、[`filter()`](#filter-elements) などのメソッド。 |
| コレクションからイテレータを取得する                       | `iterator()`                  |                                                                                                                                                            |

### Map に対する操作 {id="operations-on-maps"}

| 説明                                                | 一般的な操作                           | より Kotlin らしい代替手段                                                                                                                                                                                           |
|-----------------------------------------------------|----------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 要素を追加する                                      | `put()`, `putAll()`, `putIfAbsent()`   | Kotlin では、代入 `map[key] = value` は `put(key, value)` と同じように動作します。また、[`plusAssign` (`+=`) 演算子](collection-combine.md#add-and-remove-elements) を使用することもできます: `map += Pair(key, value)` または `map += anotherMap`。 |
| 要素を置き換える                                    | `put()`, `replace()`, `replaceAll()`   | `put()` や `replace()` の代わりにインデックス演算子 `map[key] = value` を使用。                                                                                                                                     |
| 要素を取得する                                      | `get()`                                | 要素を取得するためにインデックス演算子を使用: `map[index]`。                                                                                                                                                           |
| Map に要素が含まれているか確認する                  | `containsKey()`, `containsValue()`     | [`in` キーワード](collection-elements.md#check-element-existence) を使用して演算子の形式で `contains()` を呼び出す: `element in map`。                                                                                  |
| Map が空かどうかを確認する                          | `isEmpty()`                            | Map が空でないことを確認するには [`isNotEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-not-empty.html) を使用。                                                                         |
| 要素を削除する                                      | `remove(key)`, `remove(key, value)`    | [`minusAssign` (`-=`) 演算子](collection-combine.md#add-and-remove-elements) を使用: `map -= key`。                                                                                                                                         |
| Map からすべての要素を削除する                      | `clear()`                              |                                                                                                                                                                                                                      |
| Map からストリームを取得する                        | エントリ、キー、または値に対する `stream()` |                                                                                                                                                                                                                      |

### List にのみ存在する操作 {id="operations-that-exist-only-for-lists"}

| 説明                             | 一般的な操作             | より Kotlin らしい代替手段                                                  |
|----------------------------------|--------------------------|----------------------------------------------------------------------------|
| 要素のインデックスを取得する     | `indexOf()`              |                                                                            |
| 要素の最後のインデックスを取得する | `lastIndexOf()`          |                                                                            |
| 要素を取得する                   | `get()`                  | 要素を取得するためにインデックス演算子を使用: `list[index]`。              |
| サブリストを取得する             | `subList()`              |                                                                            |
| 要素を置き換える                 | `set()`,  `replaceAll()` | `set()` の代わりにインデックス演算子を使用: `list[index] = value`。        |

## 少し異なる操作 {id="operations-that-differ-a-bit"}

### 任意のコレクション型に対する操作 {id="operations-on-any-collection-type"}

| 説明                                                                                | Java                                                                                | Kotlin                                                                                                                                               |
|------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| コレクションのサイズを取得する                                                     | `size()`                                                                            | `count()`, `size`                                                                                                                                    |
| ネストされたコレクション要素へフラットにアクセスする                               | `collectionOfCollections.forEach(flatCollection::addAll)` または `collectionOfCollections.stream().flatMap().collect()` | [`flatten()`](collection-transformations.md#flatten) または [`flatMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/flat-map.html) |
| 指定された関数をすべての要素に適用する                                             | `stream().map().collect()`                                                           | [`map()`](collection-filtering.md)                                                                                                                   |
| コレクション要素に指定された操作を順次適用し、蓄積された結果を返す                  | `stream().reduce()`                                                                 | [`reduce()`, `fold()`](collection-aggregate.md#fold-and-reduce)                                                                                      |
| 分類基準（classifier）によって要素をグループ化し、カウントする                     | `stream().collect(Collectors.groupingBy(classifier, counting()))`                   | [`eachCount()`](collection-grouping.md)                                                                                                              |
| 条件でフィルタリングする                                                           | `stream().filter().collect()`                                                       | [`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html)                                                            |
| コレクション要素が条件を満たしているか確認する                                     | `stream().noneMatch()`, `stream().anyMatch()`, `stream().allMatch()`                | [`none()`, `any()`, `all()`](collection-filtering.md)                                                                                                |
| 要素をソートする                                                                   | `stream().sorted().collect()`                                                       | [`sorted()`](collection-ordering.md#natural-order)                                                                                                   |
| 最初の N 個の要素を取得する                                                        | `stream().limit(N).collect()`                                                       | [`take(N)`](collection-parts.md#take-and-drop)                                                                                                       |
| 述語（predicate）に基づいて要素を取得する                                          | `stream().takeWhile().collect()`                                                    | [`takeWhile()`](collection-parts.md#take-and-drop)                                                                                                   |
| 最初の N 個の要素をスキップする                                                    | `stream().skip(N).collect()`                                                        | [`drop(N)`](collection-parts.md#take-and-drop)                                                                                                       |
| 述語（predicate）に基づいて要素をスキップする                                      | `stream().dropWhile().collect()`                                                    | [`dropWhile()`](collection-parts.md#take-and-drop)                                                                                                   |
| コレクション要素とそれに関連付けられた特定の値から Map を構築する                  | `stream().collect(toMap(keyMapper, valueMapper))`                                   | [`associate()`](collection-transformations.md#associate)                                                                                             |

上記のすべての操作を Map に対して実行するには、まず Map の `entrySet` を取得する必要があります。

### List に対する操作 {id="operations-on-lists"}

| 説明                                             | Java                               | Kotlin                                                                                        |
|--------------------------------------------------|------------------------------------|-----------------------------------------------------------------------------------------------|
| リストを自然順序でソートする                     | `sort(null)`                       | `sort()`                                                                                      |
| リストを降順でソートする                         | `sort(comparator)`                 | `sortDescending()`                                                                            |
| リストから要素を削除する                         | `remove(index)`, `remove(element)` | `removeAt(index)`, `remove(element)` または [`collection -= element`](collection-combine.md#add-and-remove-elements) |
| リストのすべての要素を特定の値で埋める           | `Collections.fill()`               | [`fill()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fill.html)         |
| リストから重複しない要素（一意な要素）を取得する | `stream().distinct().toList()`     | [`distinct()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/distinct.html) |

## Java の標準ライブラリに存在しない操作 {id="operations-that-don-t-exist-in-java-s-standard-library"}

* [`zip()`, `unzip()`](collection-transformations.md) – コレクションを変換する。
* [`aggregate()`](collection-grouping.md) – 条件によってグループ化する。
* [`takeLast()`, `takeLastWhile()`, `dropLast()`, `dropLastWhile()`](collection-parts.md#take-and-drop) – 述語に基づいて要素を取得または除外する。
* [`slice()`, `chunked()`, `windowed()`](collection-parts.md) – コレクションの一部を抽出する。
* [プラス（`+`）およびマイナス（`-`）演算子](collection-combine.md#add-and-remove-elements) – 要素を追加または削除する。

`zip()`、`chunked()`、`windowed()`、およびその他の操作について詳しく知りたい場合は、Sebastian Aigner による Kotlin の高度なコレクション操作に関するこちらのビデオをご覧ください:

<video src="https://www.youtube.com/v/N4CpLxGJlq0" title="Advanced Collection Operations"/>

## 可変性 (Mutability) {id="mutability"}

Java には、可変（mutable）なコレクションがあります:

```java
// Java
// このリストは可変です！
public List<Customer> getCustomers() { ... }
```
{id="mutability-java"}

部分的に可変なものもあります:

```java
// Java
List<String> numbers = Arrays.asList("one", "two", "three", "four");
numbers.add("five"); // 実行時に `UnsupportedOperationException` で失敗します
```
{id="mutability-partly-java"}

そして不変（immutable）なものもあります:

```java
// Java
List<String> numbers = new LinkedList<>();
// このリストは不変です！
List<String> immutableCollection = Collections.unmodifiableList(numbers);
immutableCollection.add("five"); // 実行時に `UnsupportedOperationException` で失敗します
```
{id="immutable-java"}

IntelliJ IDEA で最後の 2 つのコードを書くと、不変なオブジェクトを変更しようとしているという警告が IDE から表示されます。
このコードはコンパイルは通りますが、実行時に `UnsupportedOperationException` で失敗します。型を見るだけでは、コレクションが可変かどうかを判断することはできません。

Java とは異なり、Kotlin ではニーズに応じて可変コレクションまたは読み取り専用（read-only）コレクションを明示的に宣言します。
読み取り専用コレクションを変更しようとすると、コードはコンパイルされません:

```kotlin
// Kotlin
val numbers = mutableListOf("one", "two", "three", "four")
numbers.add("five")            // これは OK
val immutableNumbers = listOf("one", "two")
//immutableNumbers.add("five") // コンパイルエラー - Unresolved reference: add
```
{id="mutability-kotlin"}

不変性についての詳細は、[Kotlin コーディング規約](coding-conventions.md#immutability) ページをご覧ください。

## 共変性 (Covariance) {id="covariance"}

Java では、子孫（派生）型のコレクションを、祖先（基底）型のコレクションを受け取る関数に渡すことはできません。
たとえば、`Rectangle` が `Shape` を拡張している場合、`Rectangle` 要素のコレクションを `Shape` 要素のコレクションを受け取る関数に渡すことはできません。
コードをコンパイルできるようにするには、関数が `Shape` の任意の後継クラスのコレクションを受け取れるように、`? extends Shape` 型を使用します:

```java
// Java
class Shape {}

class Rectangle extends Shape {}

public void doSthWithShapes(List<? extends Shape> shapes) {
/* 単に List<Shape> を使用した場合、以下のように List<Rectangle> を
引数としてこの関数を呼び出すとコードはコンパイルされません */
}

public void main() {
    var rectangles = List.of(new Rectangle(), new Rectangle());
    doSthWithShapes(rectangles);
}
```
{id="covariance-java"}

Kotlin では、読み取り専用コレクション型は[共変（covariant）](generics.md#variance)です。つまり、`Rectangle` クラスが `Shape` クラスを継承している場合、`List<Shape>` 型が必要とされる場所ならどこでも `List<Rectangle>` 型を使用できます。
言い換えると、コレクション型は要素型と同じサブタイプ関係を持ちます。Map は値の型に対しては共変ですが、キーの型に対しては共変ではありません。
可変コレクションは共変ではありません。共変にしてしまうと実行時エラーにつながるためです。

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

[コレクション型](collection-types.md) の詳細についてはこちらをご覧ください。

## 範囲と数列 (Ranges and progressions) {id="ranges-and-progressions"}

Kotlin では、[範囲（ranges）](ranges.md) を使用して区間を作成できます。たとえば、`Version(1, 11)..Version(1, 30)` には `1.11` から `1.30` までのすべてのバージョンが含まれます。
`in` 演算子を使用して、指定したバージョンが範囲内にあるかどうかを確認できます: `Version(0, 9) in versionRange`。

Java では、`Version` が両方の境界に適合しているかどうかを手動で確認する必要があります:

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

Kotlin では、範囲を 1 つのオブジェクトとして操作します。2 つの変数を作成して `Version` と比較する必要はありません:

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

バージョンが最小バージョン以上（`>=`）かつ最大バージョン未満（`<`）であるかを確認するなど、境界のいずれかを除外する必要がある場合、これらの両端を含む（inclusive な）範囲は利用できません。

## 複数の基準による比較 {id="comparison-by-several-criteria"}

Java で複数の基準によってオブジェクトを比較するには、[`Comparator`](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html) インターフェースの [`comparing()`](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html#comparing-java.util.function.Function-) 
および [`thenComparingX()`](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html#thenComparing-java.util.Comparator-) 
関数を使用できます。
たとえば、名前と年齢で人を比較するには次のようにします:

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

Kotlin では、比較したいフィールドを列挙するだけです:

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

## シーケンス (Sequences) {id="sequences"}

Java では、次のようにして数列を生成できます:

```java
// Java
int sum = IntStream.iterate(1, e -> e + 3)
    .limit(10).sum();
System.out.println(sum); // 145 を出力
```
{id="sequences-java"}

Kotlin では、_[シーケンス](sequences.md)_ を使用します。シーケンスの複数ステップの処理は、可能な限り遅延（lazy）実行されます。
実際の計算は、処理チェーン全体の結果が要求されたときにのみ行われます。

```kotlin
fun main() {
//sampleStart
    // Kotlin
    val sum = generateSequence(1) {
        it + 3
    }.take(10).sum()
    println(sum) // 145 を出力
//sampleEnd
}
```
{kotlin-runnable="true" id="sequences-kotlin"}

シーケンスを使用すると、一部のフィルタリング操作の実行に必要なステップ数を減らすことができます。
`Iterable` と `Sequence` の違いを示す [シーケンスの処理例](sequences.md#sequence-processing-example) をご覧ください。

## リストからの要素の削除 {id="removal-of-elements-from-a-list"}

Java では、[`remove()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/List.html#remove(int)) 
関数は削除する要素のインデックスを受け取ります。

整数の要素を削除する場合は、`remove()` 関数の引数として `Integer.valueOf()` 関数を使用します:

```java
// Java
public void remove() {
    var numbers = new ArrayList<>();
    numbers.add(1);
    numbers.add(2);
    numbers.add(3);
    numbers.add(1);
    numbers.remove(1); // これはインデックスによって削除します
    System.out.println(numbers); // [1, 3, 1]
    numbers.remove(Integer.valueOf(1));
    System.out.println(numbers); // [3, 1]
}
```
{id="remove-elements-java"}

Kotlin では、[`removeAt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/remove-at.html) によるインデックス指定の削除と、
[`remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/remove.html) による値指定の削除の 2 種類があります。

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

## Map の走査 (Traverse a map) {id="traverse-a-map"}

Java では、[`forEach`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Map.html#forEach(java.util.function.BiConsumer)) を使用して Map を走査できます:

```java
// Java
numbers.forEach((k,v) -> System.out.println("Key = " + k + ", Value = " + v));
```
{id="traverse-map-java"}

Kotlin では、Java の `forEach` と同様の `forEach` や `for` ループを使用して Map を走査します:

```kotlin
// Kotlin
for ((k, v) in numbers) {
    println("Key = $k, Value = $v")
}
// または
numbers.forEach { (k, v) -> println("Key = $k, Value = $v") }
```
{id="traverse-map-kotlin"}

## 空の可能性があるコレクションから最初と最後のアイテムを取得する {id="get-the-first-and-the-last-items-of-a-possibly-empty-collection"}

Java では、コレクションのサイズを確認してインデックスを使用することで、最初と最後のアイテムを安全に取得できます:

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

JDK 21 以降では、すべての [`SequencedCollection`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/SequencedCollection.html) 実装で利用可能な 
[`getFirst()`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/SequencedCollection.html#getFirst()) および 
[`getLast()`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/SequencedCollection.html#getLast()) 
メソッドを使用することもできます。これには、すべての `List` 実装や `LinkedHashSet` などの他のコレクションが含まれます。
たとえば、`ArrayList` の場合は次のようになります:

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

Kotlin には、特別な関数 [`firstOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-or-null.html) と 
[`lastOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last-or-null.html) があります。
[`Elvis 演算子`](null-safety.md#elvis-operator) を使用すると、関数の結果に応じて即座に以降のアクションを実行できます。たとえば、`firstOrNull()` の場合:

```kotlin
// Kotlin
val emails = listOf<String>() // 空の可能性あり
val theOldestEmail = emails.firstOrNull() ?: ""
val theFreshestEmail = emails.lastOrNull() ?: ""
```
{id="get-first-last-kotlin"}

## List から Set を作成する {id="create-a-set-from-a-list"}

Java で [`List`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/List.html) から 
[`Set`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Set.html) を作成するには、
[`Set.copyOf`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Set.html#copyOf(java.util.Collection)) 関数を使用できます:

```java
// Java
public void listToSet() {
    var sourceList = List.of(1, 2, 3, 1);
    var copySet = Set.copyOf(sourceList);
    System.out.println(copySet);
}
```
{id="list-to-set-java"}

Kotlin では、`toSet()` 関数を使用します:

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

## 要素のグループ化 {id="group-elements"}

Java では、[Collectors](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Collectors.html) の 
`groupingBy()` 関数を使用して要素をグループ化できます:

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

Kotlin では、[`groupBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/group-by.html) 関数を使用します:

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

## 要素のフィルタリング {id="filter-elements"}

Java でコレクションから要素をフィルタリングするには、[Stream API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html) を使用する必要があります。
Stream API には「中間操作」と「終端操作」があります。`filter()` は中間操作であり、ストリームを返します。
出力としてコレクションを受け取るには、`collect()` などの終端操作を使用する必要があります。
たとえば、キーが `1` で終わり、かつ値が `10` より大きいペアのみを残すには次のようにします:

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

Kotlin ではフィルタリング機能がコレクションに組み込まれており、`filter()` はフィルタリングされたものと同じコレクション型を返します。
そのため、記述する必要があるのは `filter()` とその述語（条件式）だけです:

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

[Map のフィルタリング](map-operations.md#filter) の詳細についてはこちらをご覧ください。

### 型による要素のフィルタリング {id="filter-elements-by-type"}

Java で型によって要素をフィルタリングし、それらに対してアクションを実行するには、[`instanceof`](https://docs.oracle.com/en/java/javase/17/language/pattern-matching-instanceof-operator.html) 演算子で型を確認してから型キャストを行う必要があります:

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

Kotlin では、コレクションに対して [`filterIsInstance<NEEDED_TYPE>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-is-instance.html) を呼び出すだけで、[スマートキャスト](typecasts.md#smart-casts) によって型キャストが行われます:

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

### 条件のテスト (Test predicates) {id="test-predicates"}

タスクによっては、すべての要素、いずれの要素も満たさない、またはいずれかの要素が条件を満たしているかを確認する必要があります。
Java では、[Stream API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html) の関数である 
[`allMatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html#allMatch(java.util.function.Predicate))、
[`noneMatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html#noneMatch(java.util.function.Predicate))、および 
[`anyMatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html#anyMatch(java.util.function.Predicate)) 
を通じてこれらのチェックをすべて行えます:

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

Kotlin では、すべての [Iterable](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/#kotlin.collections.Iterable) オブジェクトで [拡張関数](extensions.md) の `none()`、`any()`、および `all()` が使用可能です:

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

[条件のテスト](collection-filtering.md#test-predicates) の詳細をご覧ください。

## コレクションの変換操作 {id="collection-transformation-operations"}

### 要素の結合 (Zip elements) {id="zip-elements"}

Java では、2 つのコレクションを同時に反復処理することで、同じ位置にある要素からペアを作成できます:

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

要素のペアを出力するだけでなく、より複雑な処理を行いたい場合は、[レコード（Records）](https://docs.oracle.com/en/java/javase/17/language/records.html) を使用できます。
上記の例では、レコードは `record AnimalDescription(String animal, String color) {}` のようになります。

Kotlin では、同じことを行うために [`zip()`](collection-transformations.md#zip) 関数を使用します:

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

`zip()` は [Pair](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-pair/) オブジェクトの List を返します。

> コレクションのサイズが異なる場合、`zip()` の結果は小さい方のサイズになります。大きい方のコレクションの末尾の要素は結果に含まれません。
>
{style="note"}

### 要素の関連付け (Associate elements) {id="associate-elements"}

Java では、[Stream API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html) を使用して要素を特性に関連付けることができます:

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

Kotlin では、[`associate()`](collection-transformations.md#associate) （または `associateWith()`）関数を使用します:

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

## 次のステップ {id="what-s-next"}

* [Kotlin Koans](koans.md) を確認する – 演習を完了して Kotlin の構文を学びます。各演習は失敗する単体テストとして作成されており、それをパスさせることが目標です。
* その他の [Kotlin のイディオム](idioms.md) を確認する。
* [Java から Kotlin へのコンバーター](mixing-java-kotlin-intellij.md#convert-java-files-to-kotlin) を使用して、既存の Java コードを Kotlin に変換する方法を学ぶ。
* [Kotlin のコレクション](collections-overview.md) をさらに詳しく知る。

お気に入りのイディオムがあれば、プルリクエストを送ってぜひ共有してください。