[//]: # (title: JavaとKotlinのコレクション)

<web-summary>JavaのコレクションからKotlinのコレクションへ移行する方法を学びます。このガイドでは、KotlinとJavaのList、ArrayList、Map、Setなどのデータ構造をカバーしています。</web-summary>

「コレクション（Collections）」とは、解決しようとしている問題にとって重要な、一般的に操作される可変個（ゼロ個の場合もあります）のアイテムのグループです。
このガイドでは、JavaとKotlinにおけるコレクションの概念と操作を説明し、比較します。
これは、JavaからKotlinへの移行を助け、Kotlinらしい慣用的な方法でコードを書くのに役立ちます。

このガイドの最初の部分には、JavaとKotlinで同じコレクションに対する操作のクイック用語集が含まれています。
これは、[JavaとKotlinで同じ操作](#operations-that-are-the-same-in-java-and-kotlin)と、[Kotlinにのみ存在する操作](#operations-that-don-t-exist-in-java-s-standard-library)に分かれています。
ガイドの後半部分では、[ミュータビリティ](#mutability)から始まり、具体的なケースを見ていくつかの違いを説明します。

コレクションの概要については、[コレクションの概要](collections-overview.md)を参照するか、KotlinデベロッパーアドボケイトのSebastian Aignerによるこの[動画](https://www.youtube.com/watch?v=F8jj7e-_jFA)を視聴してください。

> 以下の例はすべて、JavaおよびKotlinの標準ライブラリAPIのみを使用しています。
>
{style="note"}

## JavaとKotlinで同じ操作

Kotlinには、Javaの対応するものとまったく同じように見えるコレクション操作が数多くあります。

### List、Set、Queue、Dequeに対する操作

| 説明 | 一般的な操作 | よりKotlinらしい代替案 |
|-------------|-----------|---------------------|
| 要素の追加 | `add()`, `addAll()` | [`plusAssign`(`+=`) 演算子](collection-plus-minus.md)を使用します： `collection += element`, `collection += anotherCollection` |
| コレクションに要素が含まれているか確認 | `contains()`, `containsAll()` | [`in` キーワード](collection-elements.md#check-element-existence)を使用して、演算子形式で `contains()` を呼び出します： `element in collection` |
| コレクションが空かどうかを確認 | `isEmpty()` | [`isNotEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-not-empty.html) を使用して、コレクションが空でないことを確認します。 |
| 特定の条件下で削除 | `removeIf()` | |
| 選択した要素のみを残す | `retainAll()` | |
| コレクションからすべての要素を削除 | `clear()` | |
| コレクションからストリームを取得 | `stream()` | Kotlinにはストリームを処理するための独自の方法があります：[シーケンス](#sequences)や、[`map()`](collection-filtering.md) や [`filter()`](#filter-elements) のようなメソッドです。 |
| コレクションからイテレータを取得 | `iterator()` | |

### Mapに対する操作

| 説明 | 一般的な操作 | よりKotlinらしい代替案 |
|-------------|-----------|---------------------|
| 要素の追加 | `put()`, `putAll()`, `putIfAbsent()`| Kotlinでは、代入 `map[key] = value` は `put(key, value)` と同じように動作します。また、[`plusAssign`(`+=`) 演算子](collection-plus-minus.md)を使用することもできます： `map += Pair(key, value)` または `map += anotherMap` |
| 要素の置換 | `put()`, `replace()`, `replaceAll()` | `put()` や `replace()` の代わりに、インデックス演算子 `map[key] = value` を使用します。 |
| 要素の取得 | `get()` | インデックス演算子を使用して要素を取得します： `map[index]` |
| Mapに要素が含まれているか確認 | `containsKey()`, `containsValue()` | [`in` キーワード](collection-elements.md#check-element-existence)を使用して、演算子形式で `contains()` を呼び出します： `element in map` |
| Mapが空かどうかを確認 | `isEmpty()` | [`isNotEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-not-empty.html) を使用して、Mapが空でないことを確認します。 |
| 要素の削除 | `remove(key)`, `remove(key, value)` | [`minusAssign`(`-=`) 演算子](collection-plus-minus.md)を使用します： `map -= key` |
| Mapからすべての要素を削除 | `clear()` | |
| Mapからストリームを取得 | エントリ、キー、または値に対する `stream()` | |

### Listにのみ存在する操作

| 説明 | 一般的な操作 | よりKotlinらしい代替案 |
|-------------|-----------|---------------------|
| 要素のインデックスを取得 | `indexOf()` | |
| 要素の最後のインデックスを取得 | `lastIndexOf()` | |
| 要素の取得 | `get()` | インデックス演算子を使用して要素を取得します： `list[index]` |
| サブリストの取得 | `subList()` | |
| 要素の置換 | `set()`, `replaceAll()` | `set()` の代わりにインデックス演算子を使用します： `list[index] = value` |

## 少し異なる操作

### すべてのコレクション型に対する操作

| 説明 | Java | Kotlin |
|-------------|------|--------|
| コレクションのサイズを取得 | `size()` | `count()`, `size` |
| ネストされたコレクション要素へのフラットなアクセス | `collectionOfCollections.forEach(flatCollection::addAll)` または `collectionOfCollections.stream().flatMap().collect()` | [`flatten()`](collection-transformations.md#flatten) または [`flatMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/flat-map.html) |
| すべての要素に指定された関数を適用 | `stream().map().collect()` | [`map()`](collection-filtering.md) |
| コレクション要素に順次操作を適用し、累積された結果を返す | `stream().reduce()` | [`reduce()`, `fold()`](collection-aggregate.md#fold-and-reduce) |
| 分類子によって要素をグループ化し、それらをカウントする | `stream().collect(Collectors.groupingBy(classifier, counting()))` | [`eachCount()`](collection-grouping.md) |
| 条件によるフィルタリング | `stream().filter().collect()` | [`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html) |
| コレクション要素が条件を満たすか確認 | `stream().noneMatch()`, `stream().anyMatch()`, `stream().allMatch()` | [`none()`, `any()`, `all()`](collection-filtering.md) |
| 要素のソート | `stream().sorted().collect()` | [`sorted()`](collection-ordering.md#natural-order) |
| 最初のN個の要素を取得 | `stream().limit(N).collect()` | [`take(N)`](collection-parts.md#take-and-drop) |
| 述語を用いて要素を取得 | `stream().takeWhile().collect()` | [`takeWhile()`](collection-parts.md#take-and-drop) |
| 最初のN個の要素をスキップ | `stream().skip(N).collect()` | [`drop(N)`](collection-parts.md#take-and-drop) |
| 述語を用いて要素をスキップ | `stream().dropWhile().collect()` | [`dropWhile()`](collection-parts.md#take-and-drop) |
| コレクション要素とそれに関連付けられた特定の値からMapを構築 | `stream().collect(toMap(keyMapper, valueMapper))` | [`associate()`](collection-transformations.md#associate) |

Mapに対して上記のすべての操作を実行するには、まずMapの `entrySet` を取得する必要があります。

### Listに対する操作

| 説明 | Java | Kotlin |
|-------------|------|--------|
| リストを自然順序でソートする | `sort(null)` | `sort()` |
| リストを降順でソートする | `sort(comparator)` | `sortDescending()` |
| リストから要素を削除する | `remove(index)`, `remove(element)`| `removeAt(index)`, `remove(element)` または [`collection -= element`](collection-plus-minus.md) |
| リストのすべての要素を特定の値で埋める | `Collections.fill()` | [`fill()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fill.html) |
| リストから一意の要素を取得する | `stream().distinct().toList()` | [`distinct()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/distinct.html) |

## Javaの標準ライブラリには存在しない操作

* [`zip()`, `unzip()`](collection-transformations.md) – コレクションを変換します。
* [`aggregate()`](collection-grouping.md) – 条件でグループ化します。
* [`takeLast()`, `takeLastWhile()`, `dropLast()`, `dropLastWhile()`](collection-parts.md#take-and-drop) – 述語によって要素を取得または破棄します。
* [`slice()`, `chunked()`, `windowed()`](collection-parts.md) – コレクションの一部を取得します。
* [プラス (`+`) とマイナス (`-`) 演算子](collection-plus-minus.md) – 要素を追加または削除します。

`zip()`、`chunked()`、`windowed()`、およびその他の操作について詳しく知りたい場合は、Sebastian AignerによるKotlinでの高度なコレクション操作に関するこのビデオをご覧ください。

<video src="https://www.youtube.com/v/N4CpLxGJlq0" title="高度なコレクション操作"/>

## ミュータビリティ（可変性）

Javaには、ミュータブル（可変）なコレクションがあります：

```java
// Java
// このリストはミュータブルです！
public `List<Customer>` getCustomers() { ... }
```
{id="mutability-java"}

部分的にミュータブルなもの：

```java
// Java
List<String> numbers = Arrays.asList("one", "two", "three", "four");
numbers.add("five"); // 実行時に `UnsupportedOperationException` で失敗します
```
{id="mutability-partly-java"}

そしてイミュータブル（不変）なもの：

```java
// Java
List<String> numbers = new LinkedList<>();
// このリストはイミュータブルです！
List<String> immutableCollection = Collections.unmodifiableList(numbers);
immutableCollection.add("five"); // 実行時に `UnsupportedOperationException` で失敗します
```
{id="immutable-java"}

IntelliJ IDEAで最後の2つのコードを書くと、イミュータブルなオブジェクトを変更しようとしているという警告がIDEから表示されます。
このコードはコンパイルは通りますが、実行時に `UnsupportedOperationException` で失敗します。型を見ただけでは、コレクションがミュータブルかどうかを判断することはできません。

Javaとは異なり、Kotlinでは必要に応じてミュータブルなコレクションまたは読み取り専用のコレクションを明示的に宣言します。
読み取り専用のコレクションを変更しようとすると、コードはコンパイルされません。

```kotlin
// Kotlin
val numbers = mutableListOf("one", "two", "three", "four")
numbers.add("five")            // これはOKです
val immutableNumbers = listOf("one", "two")
//immutableNumbers.add("five") // コンパイルエラー - Unresolved reference: add
```
{id="mutability-kotlin"}

不変性についての詳細は、[Kotlinコーディング規約](coding-conventions.md#immutability)のページを読んでください。

## 共変性（Covariance）

Javaでは、子孫型のコレクションを、祖先型のコレクションを受け取る関数に渡すことはできません。
例えば、`Rectangle` が `Shape` を継承している場合、`Rectangle` 要素のコレクションを `Shape` 要素のコレクションを受け取る関数に渡すことはできません。
コードをコンパイル可能にするには、`? extends Shape` 型を使用して、関数が `Shape` の継承者のコレクションを受け取れるようにします。

```java
// Java
class Shape {}

class Rectangle extends Shape {}

public void doSthWithShapes(List<? extends Shape> shapes) {
/* 単に `List<Shape>` を使用すると、後述のように `List<Rectangle>` を
引数としてこの関数を呼び出すときにコードがコンパイルされません */
}

public void main() {
    var rectangles = List.of(new Rectangle(), new Rectangle());
    doSthWithShapes(rectangles);
}
```
{id="covariance-java"}

Kotlinでは、読み取り専用のコレクション型は[共変](generics.md#variance)です。これは、`Rectangle` クラスが `Shape` クラスを継承している場合、`List<Shape>` 型が必要な場所で `List<Rectangle>` 型を使用できることを意味します。
言い換えれば、コレクション型は要素型と同じサブタイプ関係を持ちます。Mapは値の型については共変ですが、キーの型については共変ではありません。
ミュータブルなコレクションは共変ではありません。これは実行時の失敗につながるためです。

```kotlin
// Kotlin
open class Shape(val name: String)

class Rectangle(private val rectangleName: String) : Shape(rectangleName)

fun doSthWithShapes(shapes: List<Shape>) {
    println("図形は次のとおりです: ${shapes.joinToString { it.name }}")
}

fun main() {
    val rectangles = listOf(Rectangle("rhombus"), Rectangle("parallelepiped"))
    doSthWithShapes(rectangles)
}
```
{kotlin-runnable="true" id="covariance-kotlin"}

[コレクション型](collections-overview.md#collection-types)についての詳細はこちらを読んでください。

## 範囲（Range）と進行（Progression）

Kotlinでは、[範囲（Range）](ranges.md)を使用して区間を作成できます。例えば、`Version(1, 11)..Version(1, 30)` には `1.11` から `1.30` までのすべてのバージョンが含まれます。
`in` 演算子を使用して、特定のバージョンが範囲内にあるかどうかを確認できます：`Version(0, 9) in versionRange`。

Javaでは、`Version` が両方の境界に適合するかどうかを手動で確認する必要があります。

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

Kotlinでは、範囲を一つのオブジェクト全体として操作します。2つの変数を作成して、それらと `Version` を比較する必要はありません。

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

「バージョンが最小バージョン以上（`>=`）かつ最大バージョン未満（`<`）」であるかどうかを確認する場合など、境界のいずれかを除外する必要がある場合、これらの包含的な範囲は役に立ちません。

## 複数の基準による比較

Javaでオブジェクトを複数の基準で比較するには、[`Comparator`](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html) インターフェースの [`comparing()`](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html#comparing-java.util.function.Function-) および [`thenComparingX()`](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html#thenComparing-java.util.Comparator-) 関数を使用できます。
例えば、名前と年齢で人を比較する場合：

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

Kotlinでは、比較したいフィールドを列挙するだけです。

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

## シーケンス（Sequences）

Javaでは、次のように数値のシーケンスを生成できます。

```java
// Java
int sum = IntStream.iterate(1, e -> e + 3)
    .limit(10).sum();
System.out.println(sum); // 145 を出力
```
{id="sequences-java"}

Kotlinでは、_[シーケンス](sequences.md)_ を使用します。シーケンスの多段階処理は、可能な限り遅延実行されます。
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

シーケンスは、一部のフィルタリング操作を実行するために必要なステップ数を減らすことができます。
`Iterable` と `Sequence` の違いを示す [シーケンス処理の例](sequences.md#sequence-processing-example) を参照してください。

## リストからの要素の削除

Javaの [`remove()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/List.html#remove(int)) 関数は、削除する要素のインデックスを受け取ります。

整数の要素を削除する場合、`remove()` 関数の引数として `Integer.valueOf()` 関数を使用します。

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

Kotlinには、2種類の要素削除があります。
[`removeAt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/remove-at.html) によるインデックス指定の削除と、[`remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/remove.html) による値指定の削除です。

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

## Mapのトラバース（走査）

Javaでは、[`forEach`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Map.html#forEach(java.util.function.BiConsumer)) を介してMapを走査できます。

```java
// Java
numbers.forEach((k,v) -> System.out.println("Key = " + k + ", Value = " + v));
```
{id="traverse-map-java"}

Kotlinでは、`for` ループまたは Javaの `forEach` に似た `forEach` を使用してMapを走査します。

```kotlin
// Kotlin
for ((k, v) in numbers) {
    println("Key = $k, Value = $v")
}
// または
numbers.forEach { (k, v) -> println("Key = $k, Value = $v") }
```
{id="traverse-map-kotlin"}

## 空である可能性のあるコレクションの最初と最後のアイテムを取得する

Javaでは、コレクションのサイズを確認し、インデックスを使用することで、最初と最後のアイテムを安全に取得できます。

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

また、[`Deque`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Deque.html) とその継承者のために [`getFirst()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Deque.html#getFirst()) および [`getLast()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Deque.html#getLast()) 関数を使用することもできます。

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

Kotlinには、特別な関数 [`firstOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-or-null.html)
および [`lastOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last-or-null.html) があります。
[`Elvis 演算子`](null-safety.md#elvis-operator) を使用すると、関数の結果に応じてすぐに追加のアクションを実行できます。
例えば、`firstOrNull()` の場合：

```kotlin
// Kotlin
val emails = listOf<String>() // 空である可能性があります
val theOldestEmail = emails.firstOrNull() ?: ""
val theFreshestEmail = emails.lastOrNull() ?: ""
```
{id="get-first-last-kotlin"}

## リストからセットを作成する

Javaで [`List`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/List.html) から [`Set`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Set.html) を作成するには、[`Set.copyOf`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Set.html#copyOf(java.util.Collection)) 関数を使用できます。

```java
// Java
public void listToSet() {
    var sourceList = List.of(1, 2, 3, 1);
    var copySet = Set.copyOf(sourceList);
    System.out.println(copySet);
}
```
{id="list-to-set-java"}

Kotlinでは、`toSet()` 関数を使用します。

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

## 要素のグループ化

Javaでは、[Collectors](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Collectors.html) 関数 `groupingBy()` を使用して要素をグループ化できます。

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

Kotlinでは、[`groupBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/group-by.html) 関数を使用します。

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

## 要素のフィルタリング

Javaでコレクションから要素をフィルタリングするには、[Stream API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html) を使用する必要があります。
Stream APIには `intermediate`（中間）操作と `terminal`（終端）操作があります。`filter()` は中間操作であり、ストリームを返します。
コレクションとして出力を受け取るには、`collect()` のような終端操作を使用する必要があります。
例えば、キーが `1` で終わり、値が `10` より大きいペアのみを残す場合：

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

Kotlinでは、フィルタリングはコレクションに組み込まれており、`filter()` はフィルタリングされたのと同じコレクション型を返します。
したがって、書く必要があるのは `filter()` とその述語だけです。

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

[Mapのフィルタリング](map-operations.md#filter)についての詳細はこちら。

### 型による要素のフィルタリング

Javaで型によって要素をフィルタリングし、それらに対してアクションを実行するには、[`instanceof`](https://docs.oracle.com/en/java/javase/17/language/pattern-matching-instanceof-operator.html) 演算子で型を確認してから型キャストを行う必要があります。

```java
// Java
public void objectIsInstance() {
    var numbers = new ArrayList<>();
    numbers.add(null);
    numbers.add(1);
    numbers.add("two");
    numbers.add(3.0);
    numbers.add("four");
    System.out.println("大文字のすべての String 要素:");
    numbers.stream().filter(it -> it instanceof String)
        .forEach( it -> System.out.println(((String) it).toUpperCase()));
}
```
{id="filter-by-type-java"}

Kotlinでは、コレクションに対して [`filterIsInstance<必要な型>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-is-instance.html) を呼び出すだけで、型キャストは[スマートキャスト](typecasts.md#smart-casts)によって行われます。

```kotlin
// Kotlin
fun main() {
//sampleStart
    // Kotlin
    val numbers = listOf(null, 1, "two", 3.0, "four")
    println("大文字のすべての String 要素:")
    numbers.filterIsInstance<String>().forEach {
        println(it.uppercase())
    }
//sampleEnd
}
```
{kotlin-runnable="true" id="filter-by-type-kotlin"}

### 述語のテスト

一部のタスクでは、すべて、なし、または任意の要素が条件を満たすかどうかを確認する必要があります。
Javaでは、[Stream API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html) 関数である [`allMatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html#allMatch(java.util.function.Predicate))、[`noneMatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html#noneMatch(java.util.function.Predicate))、および [`anyMatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html#anyMatch(java.util.function.Predicate)) を介してこれらすべてのチェックを実行できます。

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

Kotlinでは、すべての [Iterable](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/#kotlin.collections.Iterable) オブジェクトに対して [拡張関数](extensions.md) `none()`、`any()`、および `all()` が利用可能です。

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

[述語のテスト](collection-filtering.md#test-predicates)についての詳細。

## コレクション変換操作

### 要素の結合（Zip）

Javaでは、2つのコレクションの同じ位置にある要素から、それらを同時に反復処理することでペアを作成できます。

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

単に要素のペアを出力するよりも複雑なことをしたい場合は、[レコード（Records）](https://docs.oracle.com/en/java/javase/17/language/records.html)を使用できます。
上記の例では、レコードは `record AnimalDescription(String animal, String color) {}` になります。

Kotlinでは、[`zip()`](collection-transformations.md#zip) 関数を使用して同じことができます。

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

> コレクションのサイズが異なる場合、`zip()` の結果は小さい方のサイズになります。大きい方のコレクションの最後の要素は結果に含まれません。
>
{style="note"}

### 要素の関連付け（Associate）

Javaでは、[Stream API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html) を使用して要素を特性に関連付けることができます。

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

Kotlinでは、[`associate()`](collection-transformations.md#associate) 関数を使用します。

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

## 次のステップ

* [Kotlin Koans](koans.md) にアクセスする – Kotlinの構文を学ぶための練習問題を完了してください。各練習問題は失敗するユニットテストとして作成されており、あなたの仕事はそれをパスさせることです。
* 他の [Kotlinのイディオム](idioms.md) を調べる。
* [JavaからKotlinへの変換ツール](mixing-java-kotlin-intellij.md#convert-java-files-to-kotlin)を使用して、既存のJavaコードをKotlinに変換する方法を学ぶ。
* [Kotlinのコレクション](collections-overview.md)を発見する。

お気に入りのイディオムがあれば、プルリクエストを送って共有してください。