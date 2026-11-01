[//]: # (title: イテレータ)

コレクション要素の走査（トラバース）のために、Kotlin標準ライブラリは一般的に使われているメカニズムである*イテレータ*（iterator）をサポートしています。これは、コレクションの内部構造を公開することなく、要素に順次アクセスできるようにするオブジェクトです。イテレータは、コレクションのすべての要素を1つずつ処理する必要がある場合（たとえば、値を出力したり、同様の更新を行ったりする場合）に役立ちます。

イテレータは、[`iterator()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/iterator.html) 関数を呼び出すことで、`Set` や `List` を含む [`Iterable<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/index.html) インターフェースの継承先に対して取得できます。

イテレータを取得すると、コレクションの最初の要素を指します。[`next()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterator/next.html) 関数を呼び出すとこの要素が返され、次の要素が存在する場合はイテレータの位置が次の要素へと進みます。

イテレータが最後の要素を通過すると、要素を取得するために使用することはできなくなります。また、以前の位置にリセットすることもできません。コレクションを再度反復処理するには、新しいイテレータを作成してください。

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

`Iterable` コレクションを走査するもう1つの方法は、おなじみの `for` ループです。コレクションで `for` を使用すると、イテレータが暗黙的に取得されます。したがって、以下のコードは上記の例と同等です。

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

最後に、コレクションを自動的に反復処理し、各要素に対して指定されたコードを実行できる便利な `forEach()` 関数があります。同じ例は次のようになります。

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

リストには、特別なイテレータ実装である [`ListIterator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list-iterator/index.html) が用意されています。これは、順方向と逆方向の両方向へのリストの反復処理をサポートしています。

逆方向の反復処理は、[`hasPrevious()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list-iterator/has-previous.html) 関数と [`previous()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list-iterator/previous.html) 関数によって実装されています。さらに、`ListIterator` は [`nextIndex()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list-iterator/next-index.html) 関数および [`previousIndex()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list-iterator/previous-index.html) 関数によって要素のインデックスに関する情報も提供します。

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

両方向に反復処理できる機能があるため、`ListIterator` は最後の要素に到達した後でも引き続き使用できます。

## ミュータブルイテレータ {id="mutable-iterators"}

可変（ミュータブル）コレクションを反復処理するために、要素の削除関数 [`remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-iterator/remove.html) で `Iterator` を拡張した [`MutableIterator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-iterator/index.html) があります。これにより、コレクションを反復処理しながら要素を削除できます。

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

要素の削除に加えて、[`MutableListIterator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list-iterator/index.html) は、[`add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list-iterator/add.html) 関数および [`set()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list-iterator/set.html) 関数を使用することで、リストを反復処理しながら要素の挿入や置換を行うこともできます。

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