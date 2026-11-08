[//]: # (title: コレクションのグループ化)

Kotlin標準ライブラリには、コレクションの要素をグループ化するための拡張関数が用意されています。
基本的な関数である [`groupBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/group-by.html) はラムダ関数を受け取り、`Map` を返します。このマップでは、各キーがラムダの結果であり、対応する値はその結果を返した要素の `List` になります。この関数は、たとえば `String` のリストを先頭の文字でグループ化する際などに使用できます。

`groupBy()` は、2番目のラムダ引数として値の変換関数を渡して呼び出すこともできます。
2つのラムダを受け取る `groupBy()` の結果マップでは、`keySelector` 関数によって生成されたキーが、元の要素ではなく値変換関数の結果へとマップされます。

以下の例では、`groupBy()` 関数を使用して文字列を先頭の文字でグループ化し、結果として得られた `Map` の各グループを `for` ループで走査し、`valueTransform` 関数を使用して値を大文字に変換する方法を示します。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")

    // groupBy() を使用して、文字列を先頭の文字でグループ化します
    val groupedByFirstLetter = numbers.groupBy { it.first().uppercase() }
    println(groupedByFirstLetter)
    // {O=[one], T=[two, three], F=[four, five]}

    // 各グループを走査し、キーとそれに関連付けられた値を出力します
    for ((key, value) in groupedByFirstLetter) {
        println("Key: $key, Values: $value")
    }
    // Key: O, Values: [one]
    // Key: T, Values: [two, three]
    // Key: F, Values: [four, five]

    // 文字列を先頭の文字でグループ化し、値を大文字に変換します
    val groupedAndTransformed = numbers.groupBy(keySelector = { it.first() }, valueTransform = { it.uppercase() })
    println(groupedAndTransformed)
    // {o=[ONE], t=[TWO, THREE], f=[FOUR, FIVE]}
//sampleEnd
}
```
{kotlin-runnable="true"}

要素をグループ化した後、すべてのグループに対して一度に操作を適用したい場合は、[`groupingBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/grouping-by.html) 関数を使用します。
この関数は [`Grouping`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-grouping/index.html) 型のインスタンスを返します。`Grouping` インスタンスを使用すると、すべてのグループに対して遅延（レイジー）に操作を適用できます。グループは、実際の操作実行の直前に構築されます。

具体的には、`Grouping` は以下の操作をサポートしています。

* [`eachCount()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/each-count.html) は各グループの要素数をカウントします。
* [`fold()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fold.html) および [`reduce()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reduce.html) は、各グループを個別のコレクションとして [fold および reduce](collection-aggregate.md#fold-and-reduce) 操作を実行し、その結果を返します。
* [`aggregate()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/aggregate.html) は、指定された操作を各グループのすべての要素に順次適用し、その結果を返します。
  これは `Grouping` に対して任意の操作を実行するための汎用的な方法です。fold や reduce では不十分な場合に、カスタム操作を実装するために使用します。

結果として得られた `Map` に対して `for` ループを使用することで、`groupingBy()` 関数によって作成されたグループを走査できます。
これにより、各キーとそのキーに関連付けられた要素数にアクセスできます。

以下の例では、`groupingBy()` 関数を使用して文字列を先頭の文字でグループ化し、各グループの要素数をカウントした上で、各グループを走査してキーと要素数を出力する方法を示します。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")

    // groupingBy() を使用して文字列を先頭の文字でグループ化し、各グループの要素数をカウントします
    val grouped = numbers.groupingBy { it.first() }.eachCount()

    // 各グループを走査し、キーとそれに関連付けられた値を出力します
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