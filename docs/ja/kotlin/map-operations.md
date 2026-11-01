[//]: # (title: マップ固有の操作)

[マップ](collections-overview.md#map)では、キーと値の両方の型をユーザーが定義します。
マップのエントリに対するキーベースのアクセスにより、キーによる値の取得からキーと値の個別のフィルタリングまで、マップ固有の様々な処理機能が利用可能になります。
このページでは、標準ライブラリが提供するマップ処理関数について説明します。

## キーと値の取得 {id="retrieve-keys-and-values"}

マップから値を取得するには、[`get()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/get.html) 関数の引数としてキーを渡す必要があります。
省略形の `[key]` 構文もサポートされています。指定されたキーが見つからない場合、`null` が返されます。
また、動作がわずかに異なる [`getValue()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-value.html) 関数もあります。これは、マップ内にキーが見つからない場合に例外をスローします。
さらに、キーが存在しない場合を処理するためのオプションがいくつか用意されています。

* [`getOrElse()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-else.html) はリストの場合と同様に動作します。存在しないキーに対する値は、渡されたラムダ関数から返されます。
* [`getOrDefault()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-default.html) は、キーが見つからない場合に指定されたデフォルト値を返します。

null許容値（nullable values）を持つマップの場合は、キーの欠落と `null` 値を明示的に処理する以下の関数を代わりに使用してください。

* `getOrElseIfNull()` は、キーが存在しないか、値が `null` の場合に、指定されたデフォルト値の結果を返します。
* `getOrElseIfMissing()` は、キーが存在しない場合に、指定されたデフォルト値の結果を返します。

これらの関数の違いを示す例を以下に示します。

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

    // "six" がマップに存在しないため例外をスローします
    // numbersMap.getValue("six")

//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4"}

マップのすべてのキーまたはすべての値に対して操作を実行するには、それぞれ `keys` プロパティおよび `values` プロパティから取得できます。
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
マップで `filter()` を呼び出すときは、`Pair` を引数に取る述語（predicate）を渡します。
これにより、フィルタリング述語内でキーと値の両方を使用できるようになります。

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

マップをフィルタリングするための特定の方法として、キーによるものと値によるものの2つもあります。
それぞれの方法に対して、[`filterKeys()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-keys.html) と [`filterValues()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-values.html) という関数があります。
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

## plus演算子とminus演算子 {id="plus-and-minus-operators"}

要素へのキーアクセスがあるため、[`plus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus.html)（`+`）演算子および [`minus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus.html)（`-`）演算子は、他のコレクションとは異なる動作をします。
`plus` は、左辺の `Map` と右辺の `Pair` または別の `Map` の両方のオペランドの要素を含む `Map` を返します。
右辺のオペランドに、左辺の `Map` に存在するキーを持つエントリが含まれている場合、結果のマップには右辺のエントリが含まれます。

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

`minus` は、左辺の `Map` のエントリから、右辺のオペランドにあるキーを持つものを除外した `Map` を作成します。
したがって、右辺のオペランドには、単一のキー、またはリストやセットなどのキーのコレクションを指定できます。

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

可変マップでの [`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html)（`+=`）および [`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html)（`-=`）演算子の使用の詳細については、後述の[マップの書き込み操作](#map-write-operations)を参照してください。

## マップの書き込み操作 {id="map-write-operations"}

[可変（Mutable）](collections-overview.md#collection-types)マップは、マップ固有の書き込み操作を提供します。
これらの操作を使用すると、値へのキーベースのアクセスによってマップの内容を変更できます。

マップに対する書き込み操作を定義する特定のルールがあります：

* 値は更新できます。一方、キーが変更されることはありません。一度エントリを追加すると、そのキーは不変です。
* 各キーに対して、関連付けられる値は常に1つだけです。エントリ全体を追加または削除できます。

以下では、可変マップで利用可能な書き込み操作のための標準ライブラリ関数について説明します。

### エントリの追加と更新 {id="add-and-update-entries"}

可変マップに新しいキーと値のペアを追加するには、[`put()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/put.html) を使用します。
新しいエントリが `LinkedHashMap`（デフォルトのマップ実装）に追加されると、マップのイテレーション時に最後に来るように追加されます。ソートされたマップでは、新しい要素の位置はキーの順序によって定義されます。

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
その引数には、`Map` または `Pair` のグループ（`Iterable`、`Sequence`、または `Array`）を指定できます。

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

指定されたキーが既にマップ内に存在する場合、`put()` と `putAll()` はどちらも値を上書きします。したがって、これらを使用してマップエントリの値を更新できます。

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

省略形の演算子形式を使用してマップに新しいエントリを追加することもできます。2つの方法があります：

* [`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html)（`+=`）演算子。
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

マップ内に存在するキーで呼び出された場合、演算子は対応するエントリの値を上書きします。

#### 存在しないエントリへのデフォルト値の追加 {id="add-default-values-for-missing-entries"}

既存の値を返すか、値が存在しない場合にデフォルト値を追加するには、[`.getOrPut()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-put.html) 拡張関数を使用します。
キーが存在しない場合、または `null` 値を持つ場合、`.getOrPut()` はデフォルト値を格納してそれを返します。

null許容値を持つマップでは、`.getOrPutIfNull()` および `.getOrPutIfMissing()` 関数を使用して、`null` 値の処理方法を制御できます：

* `getOrPutIfNull()` は `getOrPut()` と同様に動作し、キーが存在しないか `null` 値を持つ場合にデフォルト値を使用します。
* `getOrPutIfMissing()` は、キーが存在しない場合にのみデフォルト値を使用します。

`getOrPutIfNull()` および `getOrPutIfMissing()` 関数は[実験的（Experimental）](components-stability.md#stability-levels-explained)です。
オプトインするには、`@OptIn(ExperimentalStdlibApi::class)` アノテーションを使用します。

例を示します：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
//sampleStart
    val mapForNull = mutableMapOf<String, Int?>("one" to null)
    val mapForMissing = mutableMapOf<String, Int?>("one" to null)

    // "one" が null 値を持つ場合は値を置き換える
    mapForNull.getOrPutIfNull("one") { 1 }

    println(mapForNull)
    // {one=1}

    // "one" がマップに存在するため null 値を保持する
    mapForMissing.getOrPutIfMissing("one") { 1 }

    println(mapForMissing)
    // {one=null}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4"}

### エントリの削除 {id="remove-entries"}

可変マップからエントリを削除するには、[`remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/remove.html) 関数を使用します。
`remove()` を呼び出すときは、キーまたはキーと値のペア全体のいずれかを渡すことができます。
キーと値の両方を指定した場合、そのキーを持つ要素は、値が第2引数と一致する場合にのみ削除されます。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2, "three" to 3)
    numbersMap.remove("one")
    println(numbersMap)
    numbersMap.remove("three", 4)            // 何も削除されない
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

キーまたは値によって可変マップからエントリを削除することもできます。
これを行うには、エントリのキーまたは値を指定して、マップの `keys` または `values` に対して `remove()` を呼び出します。
`values` に対して呼び出された場合、`remove()` は指定された値を持つ最初のエントリのみを削除します。

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

可変マップでは、[`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html)（`-=`）演算子も使用できます。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2, "three" to 3)
    numbersMap -= "two"
    println(numbersMap)
    numbersMap -= "five"             // 何も削除されない
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}