[//]: # (title: コレクションの変更)

[ミュータブル（可変）コレクション](collections-overview.md#read-only-and-mutable-collections)は、要素の追加や削除など、コレクションの内容を変更するための操作をサポートしています。
このページでは、`MutableCollection` のすべての実装で利用可能な書き込み操作について説明します。
`List` および `Map` で利用可能なより具体的な操作については、それぞれ[List固有の操作](list-operations.md)および[Map固有の操作](map-operations.md)を参照してください。

## 要素の追加 {id="adding-elements"}

リストまたはセットに単一の要素を追加するには、[`add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/add.html) 関数を使用します。指定されたオブジェクトはコレクションの末尾に追加されます。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4)
    numbers.add(5)
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

[`addAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/add-all.html) は、引数オブジェクトのすべての要素をリストまたはセットに追加します。引数には `Iterable`、`Sequence`、または `Array` を指定できます。
レシーバーと引数の型が異なっていても構いません。例えば、`Set` のすべての項目を `List` に追加できます。

リストに対して呼び出された場合、`addAll()` は引数内にあるのと同じ順序で新しい要素を追加します。
また、最初の引数として要素の位置（インデックス）を指定して `addAll()` を呼び出すこともできます。
引数コレクションの最初の要素がこの位置に挿入されます。
引数コレクションの他の要素がその後に続き、レシーバーの元の要素は後ろにシフトされます。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 5, 6)
    numbers.addAll(arrayOf(7, 8))
    println(numbers)
    numbers.addAll(2, setOf(3, 4))
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

また、[`plus` 演算子](collection-combine.md)のインプレース（in-place）バージョンである [`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html) (`+=`) を使用して要素を追加することもできます。
ミュータブルコレクションに適用すると、`+=` は2番目のオペランド（要素または別のコレクション）をコレクションの末尾に追加します。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two")
    numbers += "three"
    println(numbers)
    numbers += listOf("four", "five")    
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

## 要素の削除 {id="removing-elements"}

ミュータブルコレクションから要素を削除するには、[`remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 関数を使用します。
`remove()` は要素の値を受け取り、その値に一致するものを1つ削除します。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4, 3)
    numbers.remove(3)                    // 最初の `3` を削除
    println(numbers)
    numbers.remove(5)                    // 何も削除しない
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

一度に複数の要素を削除するために、以下の関数が用意されています。

* [`removeAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove-all.html) は、引数コレクションに存在するすべての要素を削除します。
   あるいは、述語（predicate）を引数として呼び出すこともできます。この場合、関数は述語が `true` を返す全ての要素を削除します。
* [`retainAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/retain-all.html) は `removeAll()` の逆です。引数コレクションに含まれる要素以外のすべての要素を削除します。
   述語と共に使用した場合、それに一致する要素のみを残します。
* [`clear()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/clear.html) はリストからすべての要素を削除し、空にします。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4)
    println(numbers)
    numbers.retainAll { it >= 3 }
    println(numbers)
    numbers.clear()
    println(numbers)

    val numbersSet = mutableSetOf("one", "two", "three", "four")
    numbersSet.removeAll(setOf("one", "two"))
    println(numbersSet)
//sampleEnd
}
```
{kotlin-runnable="true"}

コレクションから要素を削除するもう1つの方法は、[`minus`](collection-combine.md) のインプレースバージョンである [`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html) (`-=`) 演算子を使用することです。
2番目の引数には、要素型の単一インスタンスまたは別のコレクションを指定できます。
右辺に単一の要素を指定した場合、`-=` はその要素の*最初*に出現したものを削除します。
一方、コレクションである場合は、その要素に一致する*すべての*出現箇所が削除されます。
例えば、リストに重複する要素が含まれている場合、それらは一度に削除されます。
2番目のオペランドには、コレクション内に存在しない要素を含めることもできます。そのような要素は操作の実行に影響を与えません。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "three", "four")
    numbers -= "three"
    println(numbers)
    numbers -= listOf("four", "five")    
    //numbers -= listOf("four")    // 上記と同じ結果になる
    println(numbers)    
//sampleEnd
}
```
{kotlin-runnable="true"}

## 要素の更新 {id="updating-elements"}

リストとマップには、要素を更新するための操作も用意されています。
それらについては、[List固有の操作](list-operations.md)および[Map固有の操作](map-operations.md)で説明されています。
セットの場合、更新は実質的に要素を削除して別の要素を追加することになるため、更新操作は意味を持ちません。