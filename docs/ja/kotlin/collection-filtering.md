[//]: # (title: コレクションのフィルタリング)

フィルタリングは、コレクション処理において最も一般的なタスクの1つです。
Kotlinでは、フィルタリング条件は_述語（predicate）_によって定義されます。述語とは、コレクションの要素を受け取ってブール値を返すラムダ関数です。`true` は渡された要素が述語に一致することを意味し、`false` は一致しないことを意味します。

標準ライブラリには、1回の呼び出しでコレクションをフィルタリングできる一連の拡張関数が含まれています。
これらの関数は元のコレクションを変更しないため、[可変（mutable）と読み取り専用（read-only）](collections-overview.md#collection-types)の両方のコレクションで使用できます。フィルタリング結果を操作するには、結果を変数に代入するか、フィルタリング後に関数をチェーンします。

## 述語によるフィルタリング {id="filter-by-predicate"}

基本的なフィルタリング関数は [`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html) です。
述語を指定して呼び出すと、`filter()` はそれに一致するコレクション要素を返します。
`List` と `Set` のいずれの場合も、結果のコレクションは `List` になり、`Map` の場合は結果も `Map` になります。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")  
    val longerThan3 = numbers.filter { it.length > 3 }
    println(longerThan3)

    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key11" to 11)
    val filteredMap = numbersMap.filter { (key, value) -> key.endsWith("1") && value > 10}
    println(filteredMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

`filter()` の述語は要素の値のみをチェックできます。
フィルター内で要素の位置（インデックス）を使用したい場合は、[`filterIndexed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-indexed.html) を使用します。
これはインデックスと要素の値という2つの引数を取る述語を受け取ります。

否定条件でコレクションをフィルタリングするには、[`filterNot()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-not.html) を使用します。
これは述語が `false` を返す要素のリストを返します。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    
    val filteredIdx = numbers.filterIndexed { index, s -> (index != 0) && (s.length < 5)  }
    val filteredNot = numbers.filterNot { it.length <= 3 }

    println(filteredIdx)
    println(filteredNot)
//sampleEnd
}
```
{kotlin-runnable="true"}

また、特定の型の要素をフィルタリングして要素の型を絞り込む関数もあります：

* [`filterIsInstance()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-is-instance.html) は、指定された型のコレクション要素を返します。`List<Any>` に対して呼び出された場合、`filterIsInstance<T>()` は `List<T>` を返すため、その要素に対して `T` 型の関数を呼び出すことができます。

    ```kotlin
    fun main() {
    //sampleStart
        val numbers = listOf(null, 1, "two", 3.0, "four")
        println("All String elements in upper case:")
        numbers.filterIsInstance<String>().forEach {
            println(it.uppercase())
        }
    //sampleEnd
    }
    ```
    {kotlin-runnable="true"}

* [`filterNotNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-not-null.html) は、すべての non-nullable（null 非許容）要素を返します。`List<T?>` に対して呼び出された場合、`filterNotNull()` は `List<T: Any>` を返すため、要素を null 非許容のオブジェクトとして扱うことができます。

    ```kotlin
    fun main() {
    //sampleStart
        val numbers = listOf(null, "one", "two", null)
        numbers.filterNotNull().forEach {
            println(it.length)   // nullable な String では length は使用できない
        }
    //sampleEnd
    }
    ```
    {kotlin-runnable="true"}

## パーティション {id="partition"}

もう1つのフィルタリング関数である [`partition()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/partition.html) は、述語によってコレクションをフィルタリングし、一致しなかった要素を別のリストに保持します。
そのため、戻り値として `List` の `Pair` が得られます。1つ目のリストには述語に一致した要素が含まれ、2つ目のリストには元のコレクションのそれ以外のすべての要素が含まれます。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    val (match, rest) = numbers.partition { it.length > 3 }

    println(match)
    println(rest)
//sampleEnd
}
```
{kotlin-runnable="true"}

## 述語のテスト {id="test-predicates"}

最後に、コレクション要素に対して単純に述語をテスト（判定）する関数があります：

* [`any()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/any.html) は、少なくとも1つの要素が指定された述語に一致する場合に `true` を返します。
* [`none()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/none.html) は、どの要素も指定された述語に一致しない場合に `true` を返します。
* [`all()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/all.html) は、すべての要素が指定された述語に一致する場合に `true` を返します。
    空のコレクションに対して有効な述語を指定して `all()` を呼び出すと、`true` が返されることに注意してください。このような挙動は論理学では_[空虚な真（vacuous truth）](https://en.wikipedia.org/wiki/Vacuous_truth)_として知られています。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")

    println(numbers.any { it.endsWith("e") })
    println(numbers.none { it.endsWith("a") })
    println(numbers.all { it.endsWith("e") })

    println(emptyList<Int>().all { it > 5 })   // 空虚な真 (vacuous truth)
//sampleEnd
}
```
{kotlin-runnable="true"}

`any()` と `none()` は述語なしで使用することもできます。その場合、コレクションが空であるかどうかを単にチェックします。
`any()` は要素が存在すれば `true`、存在しなければ `false` を返します。`none()` はその逆です。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    val empty = emptyList<String>()

    println(numbers.any())
    println(empty.any())
    
    println(numbers.none())
    println(empty.none())
//sampleEnd
}
```
{kotlin-runnable="true"}