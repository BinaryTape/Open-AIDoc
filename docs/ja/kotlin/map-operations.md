[//]: # (title: マップ固有の操作)

[マップ](collection-types.md#map)では、キーと値の両方の型がユーザー定義となります。
マップエントリへのキーベースのアクセスにより、キーによる値の取得からキーと値の個別フィルタリングに至るまで、さまざまなマップ固有の処理機能が利用できます。
このページでは、標準ライブラリが提供するマップ処理関数について説明します。

## キーと値の取得 {id="retrieve-keys-and-values"}

マップから値を取得するには、[`get()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/get.html) 関数の引数としてキーを渡す必要があります。
短縮形の `[key]` 構文もサポートされています。指定されたキーが見つからない場合、`null` を返します。
また、動作が少し異なる [`getValue()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-value.html) 関数もあります。こちらはキーがマップ内に見つからない場合に例外をスローします。
さらに、キーが存在しない場合を処理するためのオプションが他にも用意されています。

* [`getOrElse()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-else.html) はリストの場合と同様に機能します。存在しないキーに対しては、指定されたラムダ関数から値が返されます。
* [`getOrDefault()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-default.html) は、キーが見つからない場合に指定されたデフォルト値を返します。

null 許容値を持つマップの場合は、キーの欠落と `null` 値を明示的に処理する以下の関数を代わりに使用してください。

* `getOrElseIfNull()` は、キーが存在しないか、または値が `null` の場合に、指定されたデフォルト値の結果を返します。
* `getOrElseIfMissing()` は、キーが存在しない場合に指定されたデフォルト値の結果を返します。

以下は、これらの関数の違いを示す例です。

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
//sampleStart
    val numbersMap = mapOf("one" to 1, "two" to 2, "three" to 3)
    println(numbersMap.get("one"))
    // 1

    println(numbersMap["one"])
    // 1

    println(numbersMap.getOrDefault("four", 10))
    // 10

    println(numbersMap["five"])
    // null
    
    val nullableMap = mapOf("one" to 1, "two" to null)
    println(nullableMap.getOrElseIfNull("two") { 0 })
    // 0

    println(nullableMap.getOrElseIfMissing("two") { 0 })
    // null

    // "six" はマップに存在しないため例外をスローします
    // numbersMap.getValue("six")

//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4"}

マップのすべてのキーまたはすべての値に対して操作を行うには、それぞれ `keys` プロパティおよび `values` プロパティから取得できます。
`keys` はマップのすべてのキーのセット（Set）であり、`values` はマップのすべての値のコレクションです。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mapOf("one" to 1, "two" to 2, "three" to 3)
    println(numbersMap.keys)
    println(numbersMap.values)
//sampleEnd
}
```
{kotlin-runnable="true"}

## フィルタリング {id="filter"}

他のコレクションと同様に、[`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html) 関数を使用してマップを[フィルタリング](collection-filtering.md)できます。
マップに対して `filter()` を呼び出すときは、引数として `Pair` を受け取る述語（predicate）を渡します。
これにより、フィルタリング述語内でキーと値の両方を使用できます。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key11" to 11)
    val filteredMap = numbersMap.filter { (key, value) -> key.endsWith("1") && value > 10}
    println(filteredMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

マップのフィルタリングには、キーによる方法と値による方法の2つの固有の方法もあります。
それぞれの方法に対して、[`filterKeys()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-keys.html) と [`filterValues()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-values.html) という関数が用意されています。
どちらも、指定された述語に一致するエントリの新しいマップを返します。
`filterKeys()` の述語は要素のキーのみをチェックし、`filterValues()` の述語は値のみをチェックします。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key11" to 11)
    val filteredKeysMap = numbersMap.filterKeys { it.endsWith("1") }
    val filteredValuesMap = numbersMap.filterValues { it < 10 }

    println(filteredKeysMap)
    println(filteredValuesMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

## plus および minus 演算子 {id="plus-and-minus-operators"}

要素へのキーアクセスという特性上、[`plus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus.html) (`+`) および [`minus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus.html) (`-`) 演算子は、他のコレクションとは異なる動作をします。
`plus` は、両方のオペランドの要素を含む `Map` を返します。左側のオペランドは `Map`、右側のオペランドは `Pair` または別の `Map` です。
右側のオペランドに、左側の `Map` にすでに存在するキーのエントリが含まれている場合、結果のマップには右側のエントリが含まれます。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mapOf("one" to 1, "two" to 2, "three" to 3)
    println(numbersMap + Pair("four", 4))
    println(numbersMap + Pair("one", 10))
    println(numbersMap + mapOf("five" to 5, "one" to 11))
//sampleEnd
}
```
{kotlin-runnable="true"}

`minus` は、右側のオペランドのキーを持つエントリを除いた、左側の `Map` のエントリから新しい `Map` を作成します。
そのため、右側のオペランドには、単一のキーまたはキーのコレクション（リスト、セットなど）を指定できます。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mapOf("one" to 1, "two" to 2, "three" to 3)
    println(numbersMap - "one")
    println(numbersMap - listOf("two", "four"))
//sampleEnd
}
```
{kotlin-runnable="true"}

ミュータブルマップで [`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html) (`+=`) および [`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html) (`-=`) 演算子を使用する方法の詳細については、後述の[マップの書き込み操作](#map-write-operations)を参照してください。

## マップの書き込み操作 {id="map-write-operations"}

[ミュータブル（可変）](collections-overview.md#read-only-and-mutable-collections)マップは、マップ固有の書き込み操作を提供します。
これらの操作により、値へのキーベースのアクセスを使用してマップの内容を変更できます。

マップに対する書き込み操作を定義する特定のルールがあります。

* 値は更新できます。一方で、キーが変更されることはありません。一度エントリを追加すると、そのキーは一定です。
* 各キーに対して、関連付けられる値は常に1つだけです。エントリ全体を追加または削除できます。

以下は、ミュータブルマップで利用可能な書き込み操作の標準ライブラリ関数の説明です。

### エントリの追加と更新 {id="add-and-update-entries"}

ミュータブルマップに新しいキーと値のペアを追加するには、[`put()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/put.html) を使用します。
新しいエントリが `LinkedHashMap`（デフォルトのマップ実装）に追加される場合、マップの反復処理（イテレーション）時に最後に来るように追加されます。ソートされたマップでは、新しい要素の位置はキーの順序によって決まります。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2)
    numbersMap.put("three", 3)
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

一度に複数のエントリを追加するには、[`putAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/put-all.html) を使用します。
その引数には、`Map` または `Pair` のグループ（`Iterable`、`Sequence`、`Array`）を指定できます。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2, "three" to 3)
    numbersMap.putAll(setOf("four" to 4, "five" to 5))
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

指定されたキーがすでにマップ内に存在する場合、`put()` と `putAll()` の両方とも値を上書きします。したがって、これらを使用してマップエントリの値を更新できます。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2)
    val previousValue = numbersMap.put("one", 11)
    println("value associated with 'one', before: $previousValue, after: ${numbersMap["one"]}")
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

短縮形の演算子形式を使用して、マップに新しいエントリを追加することもできます。2つの方法があります。

* [`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html) (`+=`) 演算子。
* `set()` のエイリアスである `[]` 演算子。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2)
    numbersMap["three"] = 3     // numbersMap.put("three", 3) を呼び出す
    numbersMap += mapOf("four" to 4, "five" to 5)
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

マップに存在するキーを指定して呼び出された場合、演算子は対応するエントリの値を上書きします。

#### 存在しないエントリへのデフォルト値の追加 {id="add-default-values-for-missing-entries"}

既存の値を返すか、値が存在しない場合にデフォルト値を追加するには、[`.getOrPut()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-put.html) 拡張関数を使用します。
キーが存在しないか値が `null` の場合、`.getOrPut()` はデフォルト値を保存してそれを返します。

null 許容値を持つマップでは、`.getOrPutIfNull()` および `.getOrPutIfMissing()` 関数を使用して `null` 値の処理方法を制御できます。

* `getOrPutIfNull()` は `getOrPut()` と同様に動作し、キーが存在しないか値が `null` の場合にデフォルト値を使用します。
* `getOrPutIfMissing()` は、キーが存在しない場合にのみデフォルト値を使用します。

`getOrPutIfNull()` および `getOrPutIfMissing()` 関数は[試験的（Experimental）](components-stability.md#stability-levels-explained)です。
オプトインするには、`@OptIn(ExperimentalStdlibApi::class)` アノテーションを使用します。

以下に例を示します。

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
//sampleStart
    val mapForNull = mutableMapOf<String, Int?>("one" to null)
    val mapForMissing = mutableMapOf<String, Int?>("one" to null)

    // "one" が null 値を持つ場合に値を置き換える
    mapForNull.getOrPutIfNull("one") { 1 }

    println(mapForNull)
    // {one=1}

    // "one" がマップに存在するため、null 値を保持する
    mapForMissing.getOrPutIfMissing("one") { 1 }

    println(mapForMissing)
    // {one=null}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4"}

### エントリの削除 {id="remove-entries"}

ミュータブルマップからエントリを削除するには、[`remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/remove.html) 関数を使用します。
`remove()` を呼び出すときは、キーまたはキーと値のペア全体を渡すことができます。
キーと値の両方を指定した場合、そのキーを持つ要素は、その値が第2引数と一致する場合にのみ削除されます。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2, "three" to 3)
    numbersMap.remove("one")
    println(numbersMap)
    numbersMap.remove("three", 4)            //何も削除されない
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

キーまたは値によってミュータブルマップからエントリを削除することもできます。
これを行うには、マップのキーまたは値に対して `remove()` を呼び出し、エントリのキーまたは値を渡します。
値に対して呼び出された場合、`remove()` は指定された値を持つ最初のエントリのみを削除します。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2, "three" to 3, "threeAgain" to 3)
    numbersMap.keys.remove("one")
    println(numbersMap)
    numbersMap.values.remove(3)
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

[`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html) (`-=`) 演算子もミュータブルマップで使用できます。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2, "three" to 3)
    numbersMap -= "two"
    println(numbersMap)
    numbersMap -= "five"             //何も削除されない
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}