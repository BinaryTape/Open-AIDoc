[//]: # (title: コレクションの反復処理)

コレクションの要素を走査（トラバース）するために、Kotlin標準ライブラリは一般的に使われる仕組みである *イテレータ（iterator）* をサポートしています。イテレータは、コレクションの内部構造を公開することなく、要素に順番にアクセスできるようにするオブジェクトです。イテレータは、コレクションの全要素を1つずつ処理する必要がある場合（例えば、値を出力したり、同様の更新を行ったりする場合）に便利です。

イテレータは、`Set` や `List` を含む [`Iterable<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/index.html) インターフェースの継承先に対して、[`iterator()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/iterator.html) 関数を呼び出すことで取得できます。

イテレータを取得すると、コレクションの最初の要素を指した状態になります。[`next()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterator/next.html) 関数を呼び出すと、その要素を返し、次の要素が存在する場合はイテレータの位置を次の要素に進めます。

イテレータが最後の要素を通過すると、要素の取得には使用できなくなります。また、以前の位置にリセットすることもできません。コレクションを再度反復処理するには、新しいイテレータを作成してください。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    val numbersIterator = numbers.iterator()
    while (numbersIterator.hasNext()) {
        println(numbersIterator.next())
        // one
        // two
        // three
        // four
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

`Iterable` コレクションを順に処理するもう一つの方法は、よく知られている `for` ループです。コレクションで `for` を使用すると、暗黙的にイテレータを取得します。そのため、次のコードは上記の例と同等です。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    for (item in numbers) {
        println(item)
        // one
        // two
        // three
        // four
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

最後に、コレクションを自動的に反復処理し、各要素に対して指定されたコードを実行できる便利な `forEach()` 関数があります。同じ例は以下のようになります。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    numbers.forEach {
        println(it)
        // one
        // two
        // three
        // four
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

## リストイテレータ {id="list-iterators"}

リスト向けには、特別なイテレータ実装である [`ListIterator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list-iterator/index.html) が用意されています。これは前方と後方の両方向への反復処理をサポートします。

後方への反復処理は、[`hasPrevious()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list-iterator/has-previous.html) 関数および [`previous()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list-iterator/previous.html) 関数によって実装されています。さらに、`ListIterator` は [`nextIndex()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list-iterator/next-index.html) 関数と [`previousIndex()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list-iterator/previous-index.html) 関数によって要素のインデックスに関する情報も提供します。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    val listIterator = numbers.listIterator()
    while (listIterator.hasNext()) listIterator.next()
    println("Iterating backwards:")
    // Iterating backwards:
    while (listIterator.hasPrevious()) {
        print("Index: ${listIterator.previousIndex()}")
        println(", value: ${listIterator.previous()}")
        // Index: 3, value: four
        // Index: 2, value: three
        // Index: 1, value: two
        // Index: 0, value: one
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

両方向に反復処理できる機能により、`ListIterator` は最後の要素に到達した後でも引き続き使用できます。

## ミュータブルイテレータ {id="mutable-iterators"}

変更可能な（mutableな）コレクションを反復処理するために、要素の削除関数 [`remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-iterator/remove.html) で `Iterator` を拡張した [`MutableIterator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-iterator/index.html) があります。これにより、反復処理中にコレクションから要素を削除できます。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four") 
    val mutableIterator = numbers.iterator()
    
    mutableIterator.next()
    mutableIterator.remove()    
    println("After removal: $numbers")
    // After removal: [two, three, four]
//sampleEnd
}
```
{kotlin-runnable="true"}

要素の削除に加えて、[`MutableListIterator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list-iterator/index.html) は [`add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list-iterator/add.html) 関数や [`set()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list-iterator/set.html) 関数を使用することで、リストの反復処理中に要素の挿入や置き換えを行うことも可能です。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "four", "four") 
    val mutableListIterator = numbers.listIterator()
    
    mutableListIterator.next()
    mutableListIterator.add("two")
    println(numbers)
    // [one, two, four, four]
    mutableListIterator.next()
    mutableListIterator.set("three")   
    println(numbers)
    // [one, two, three, four]
//sampleEnd
}
```
{kotlin-runnable="true"}