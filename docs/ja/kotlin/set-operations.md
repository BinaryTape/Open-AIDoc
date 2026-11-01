[//]: # (title: Set固有の操作)

Kotlinのコレクションパッケージには、共通部分（積集合）の取得、コレクション同士のマージ（和集合）、またはコレクション間の差分（差集合）の取得といった、セットに対する一般的な操作のための拡張関数が含まれています。

2つのコレクションを1つにマージするには、[`union()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/union.html) 関数を使用します。この関数は、中置構文（infix形式）`a union b` としても使用できます。
順序付けられたコレクションの場合、オペランドの順序が重要になる点に注意してください。結果として得られるコレクションでは、第1オペランドの要素が第2オペランドの要素よりも前に配置されます。

```kotlin
fun main() {
//sampleStart
    val numbers = setOf("one", "two", "three")

    // 順序に従って出力
    println(numbers union setOf("four", "five"))
    // [one, two, three, four, five]
    println(setOf("four", "five") union numbers)
    // [four, five, one, two, three]
//sampleEnd
}
```
{kotlin-runnable="true"}

2つのコレクション間の共通部分（両方に存在する要素）を見つけるには、[`intersect()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/intersect.html) 関数を使用します。
別のコレクションに存在しない要素を見つけるには、[`subtract()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/subtract.html) 関数を使用します。
これらの関数も両方とも、例えば `a intersect b` のように中置構文で呼び出すことができます。

```kotlin
fun main() {
//sampleStart
    val numbers = setOf("one", "two", "three")

    // 同じ出力
    println(numbers intersect setOf("two", "one"))
    // [one, two]
    println(numbers subtract setOf("three", "four"))
    // [one, two]
    println(numbers subtract setOf("four", "three"))
    // [one, two]
//sampleEnd
}
```
{kotlin-runnable="true"}

2つのコレクションのいずれか一方にのみ存在し、共通部分には存在しない要素を見つけるためにも、`union()` 関数を使用できます。
この操作（対称差として知られています）を行うには、2つのコレクション間のそれぞれの差分を計算し、その結果をマージします。

```kotlin
fun main() {
//sampleStart
    val numbers = setOf("one", "two", "three")
    val numbers2 = setOf("three", "four")

    // 差分をマージ
    println((numbers - numbers2) union (numbers2 - numbers))
    // [one, two, four]
//sampleEnd
}
```
{kotlin-runnable="true"}

`union()`、`intersect()`、`subtract()` 関数はリストに対しても適用できます。
ただし、その結果は_常に_ `Set` になります。この結果では、重複する要素はすべて1つにまとめられ、インデックスによるアクセスはできなくなります。

```kotlin
fun main() {
//sampleStart
    val list1 = listOf(1, 1, 2, 3, 5, 8, -1)
    val list2 = listOf(1, 1, 2, 2, 3, 5)

    // 2つのリストの積集合（intersect）の結果はSetになる
    println(list1 intersect list2)
    // [1, 2, 3, 5]

    // 等しい要素は1つにマージされる
    println(list1 union list2)
    // [1, 2, 3, 5, 8, -1]
//sampleEnd
}
```
{kotlin-runnable="true"}