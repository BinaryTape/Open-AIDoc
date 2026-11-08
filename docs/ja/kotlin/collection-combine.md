[//]: # (title: コレクションの結合)

Kotlin は、コレクション要素の追加や削除、およびコレクションの結合を行うための演算子や関数を提供しています。これらの操作は新しい読み取り専用コレクションを返し、元のコレクションは変更されません。

また、要素を追加または削除することで可変コレクションを変更することもできます。詳細については、[](collection-write.md) を参照してください。

## 要素の追加と削除 {id="add-and-remove-elements"}

Kotlin では、[`plus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus.html)（`+`）演算子および [`minus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus.html)（`-`）演算子を使用して、コレクション要素の追加や削除を行えます。
第 1 オペランドはコレクションで、第 2 オペランドは要素または別のコレクションです。
それぞれの演算子は、新しい読み取り専用コレクションを返します。

* `plus` は、元の要素と、第 2 オペランドの単一または複数の要素を含むコレクションを返します。
* `minus` は、第 2 オペランドで指定された要素を取り除いたコレクションを返します。そのオペランドが単一の要素である場合、`minus` は最初に出現した要素を削除します。第 2 オペランドがコレクションである場合、`minus` はその要素のすべての出現を削除します。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")

    val plusList = numbers + "five"
    val minusList = numbers - listOf("three", "four")
    
    println(plusList)
    // [one, two, three, four, five]
   
    println(minusList)
    // [one, two]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

コレクションに対して [複合代入演算子 (augmented assignment operators)](operator-overloading.md#augmented-assignments) である [`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html)（`+=`）および [`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html)（`-=`）を使用することもできます。

* `var` で宣言された変数に格納されている読み取り専用コレクションの場合、これらの演算子は `plus` または `minus` を使用し、結果のコレクションを変数に再代入します。
* `val` で宣言された変数に格納されている可変コレクションの場合、これらの演算子は `plusAssign` または `minusAssign` を使用して、コレクションをその場で変更します。

マップに対する `plus` および `minus` 演算子の詳細については、[マップ固有の操作 (Map-specific operations)](map-operations.md) を参照してください。

## 2 つのコレクションのマージ {id="merge-two-collections"}

2 つのコレクションをマージするには、[`union()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/union.html) 関数を使用します。両方のコレクションから重複しない要素を含む `Set` を返します。中置形式（infix form）である `a union b` として呼び出すこともできます。

結果は、最初のコレクションの反復順序を保持し、続いてまだ存在しない 2 番目のコレクションの要素がその反復順序に従って追加されます。

```kotlin
fun main() {
//sampleStart
    val numbers = setOf("one", "two", "three")

    // コレクションを入れ替えると、結果の反復順序が変わる
    println(numbers union setOf("four", "five"))
    // [one, two, three, four, five]
    println(setOf("four", "five") union numbers)
    // [four, five, one, two, three]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## 2 つのコレクションの積集合を見つける {id="find-the-intersection-of-two-collections"}

両方のコレクションに存在する要素（共通部分、積集合）を見つけるには、[`intersect()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/intersect.html) を使用します。
最初のコレクションに存在し、2 番目のコレクションには存在しない要素を見つけるには、[`subtract()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/subtract.html) を使用します。

どちらの関数も `Set` を返し、中置記法（`a intersect b` および `a subtract b`）をサポートしています。

```kotlin
fun main() {
//sampleStart
    val numbers = setOf("one", "two", "three")

    // 両方のコレクションに存在する要素を抽出
    println(numbers intersect setOf("two", "one"))
    // [one, two]
   
    // 2 番目のコレクションに存在する要素を除外
    println(numbers subtract setOf("three", "four"))
    // [one, two]

    // 2 番目のコレクションの順序を変更しても結果は変わらない
    println(numbers subtract setOf("four", "three"))
    // [one, two]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## 片方のコレクションにのみ存在する要素を見つける {id="find-elements-present-in-only-one-collection"}

2 つのコレクションのうち片方にしか存在しない要素を見つけるには、それぞれのコレクションを互いに引き算し、その結果を `union()` で結合します。この操作は _対称差（symmetric difference）_ と呼ばれ、`Set` を返します。

```kotlin
fun main() {
//sampleStart
    val numbers = setOf("one", "two", "three")
    val numbers2 = setOf("three", "four")

    // 双方向の差を結合する
    println((numbers - numbers2) union (numbers2 - numbers))
    // [one, two, four]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}