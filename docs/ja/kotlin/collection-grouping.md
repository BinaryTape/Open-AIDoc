[//]: # (title: グループ化)

Kotlin標準ライブラリは、コレクションの要素をグループ化するための拡張関数を提供しています。
基本的な関数である [`groupBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/group-by.html) はラムダ関数を受け取り、`Map` を返します。このマップでは、各キーがラムダの結果であり、対応する値はその結果を返した要素の `List` です。この関数は、例えば `String` のリストを頭文字でグループ化する場合などに使用できます。

また、2番目のラムダ引数として値変換関数（value transformation function）を渡して `groupBy()` を呼び出すこともできます。
2つのラムダを持つ `groupBy()` の結果マップでは、`keySelector` 関数によって生成されたキーが、元の要素ではなく値変換関数の結果へとマッピングされます。

以下の例では、`groupBy()` 関数を使用して文字列を頭文字でグループ化し、結果の `Map` を `for` ループで反復処理したあと、`valueTransform` 関数を使用して値を大文字に変換する方法を示しています。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")

    // groupBy() を使用して文字列を頭文字でグループ化
    val groupedByFirstLetter = numbers.groupBy { it.first().uppercase() }
    println(groupedByFirstLetter)
    // {O=[one], T=[two, three], F=[four, five]}

    // 各グループを反復処理し、キーと関連付けられた値を出力
    for ((key, value) in groupedByFirstLetter) {
        println("Key: $key, Values: $value")
    }
    // Key: O, Values: [one]
    // Key: T, Values: [two, three]
    // Key: F, Values: [four, five]

    // 文字列を頭文字でグループ化し、値を大文字に変換
    val groupedAndTransformed = numbers.groupBy(keySelector = { it.first() }, valueTransform = { it.uppercase() })
    println(groupedAndTransformed)
    // {o=[ONE], t=[TWO, THREE], f=[FOUR, FIVE]}
//sampleEnd
}
```
{kotlin-runnable="true"}

要素をグループ化した後、すべてのグループに対して一度に操作を適用したい場合は、[`groupingBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/grouping-by.html) 関数を使用します。
この関数は [`Grouping`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-grouping/index.html) 型のインスタンスを返します。`Grouping` インスタンスを使用すると、すべてのグループに対して遅延（lazy）方式で操作を適用できます。グループは、操作が実行される直前に実際に構築されます。

具体的には、`Grouping` は以下の操作をサポートしています。

* [`eachCount()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/each-count.html) は、各グループの要素数をカウントします。
* [`fold()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fold.html) および [`reduce()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reduce.html) は、各グループを独立したコレクションとして [fold および reduce](collection-aggregate.md#fold-and-reduce) 操作を実行し、その結果を返します。
* [`aggregate()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/aggregate.html) は、各グループのすべての要素に対して指定された操作を順次適用し、その結果を返します。
  これは `Grouping` に対して任意の操作を実行するための汎用的な方法です。fold や reduce では不十分な場合に、カスタム操作を実装するために使用します。

`groupingBy()` 関数によって作成されたグループを反復処理するには、結果の `Map` に対して `for` ループを使用できます。
これにより、各キーと、そのキーに関連付けられた要素のカウントにアクセスできます。

以下の例では、`groupingBy()` 関数を使用して文字列を頭文字でグループ化し、各グループの要素数をカウントした上で、各グループを反復処理してキーと要素数を出力する方法を示しています。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")

    // groupingBy() を使用して文字列を頭文字でグループ化し、各グループの要素数をカウント
    val grouped = numbers.groupingBy { it.first() }.eachCount()

    // 各グループを反復処理し、キーと関連付けられた値を出力
    for ((key, count) in grouped) {
        println("Key: $key, Count: $count")
        // Key: o, Count: 1
        // Key: t, Count: 2
        // Key: f, Count: 2
    }
//sampleEnd
}
```
{kotlin-runnable="true"}