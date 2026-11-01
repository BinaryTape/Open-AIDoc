[//]: # (title: plus および minus 演算子)

Kotlin では、コレクションに対して [`plus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus.html)（`+`）および [`minus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus.html)（`-`）演算子が定義されています。
これらは第1オペランドとしてコレクションを取り、第2オペランドには要素または別のコレクションを取ることができます。
戻り値は、新しい読み取り専用コレクションです：

* `plus` の結果には、元のコレクションの要素_および_第2オペランドの要素が含まれます。
* `minus` の結果には、第2オペランドの要素を_除いた_元のコレクションの要素が含まれます。
   第2オペランドが要素である場合、`minus` はその_最初_に出現したものを削除します。コレクションである場合は、その要素の_すべて_の出現が削除されます。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")

    val plusList = numbers + "five"
    val minusList = numbers - listOf("three", "four")
    println(plusList)
    println(minusList)
//sampleEnd
}
```
{kotlin-runnable="true"}

マップに対する `plus` および `minus` 演算子の詳細については、[マップ固有の操作](map-operations.md)を参照してください。
また、コレクションに対して[累算代入演算子（augmented assignment operators）](operator-overloading.md#augmented-assignments)である [`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html)（`+=`）および [`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html)（`-=`）も定義されています。しかし、読み取り専用コレクションの場合、これらは実際には `plus` または `minus` 演算子を使用し、その結果を同じ変数に代入しようとします。そのため、これらは `var` で宣言された読み取り専用コレクションでのみ使用できます。
可変コレクション（mutable collection）の場合、`val` であってもコレクション自体が変更されます。詳細については、[コレクションの書き込み操作](collection-write.md)を参照してください。