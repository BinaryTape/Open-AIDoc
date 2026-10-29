[//]: # (title: マップ固有の操作)

[マップ](collections-overview.md#map)では、キーと値の両方の型がユーザー定義です。
キーに基づいたマップエントリへのアクセスにより、キーによる値の取得から、キーと値を個別にフィルタリングする機能まで、マップ固有のさまざまな処理が可能になります。
このページでは、標準ライブラリのマップ処理関数について説明します。

## キーと値の取得 {id="retrieve-keys-and-values"}

マップから値を取得するには、[`get()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/get.html) 関数の引数としてそのキーを渡す必要があります。
短縮形の `[key]` 構文もサポートされています。指定されたキーが見つからない場合、`null` を返します。
また、[`getValue()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-value.html) 関数もあります。これは少し動作が異なり、キーがマップ内に見つからない場合に例外をスローします。
さらに、キーが存在しない場合を処理するためのオプションが他にあります。

* [`getOrElse()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-else.html) はリストの場合と同じように動作します。存在しないキーに対する値が、指定されたラムダ関数から返されます。
* [`getOrDefault()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-default.html) は、キーが見つからない場合に指定されたデフォルト値を返します。

値に null を許容する（nullable な）マップの場合は、代わりに以下の関数を使用して、欠落しているキーと `null` 値を明示的に処理します：

* `getOrElseIfNull()` は、キーが欠落しているか、値が `null` の場合に、指定されたデフォルト値の結果を返します。
* `getOrElseIfMissing()` は、キーが欠落している場合にのみ、指定されたデフォルト値の結果を返します。

以下の例は、これらの関数の違いを示しています：

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

    // "six" がマップに存在しないため、例外をスローします
    // numbersMap.getValue("six")

//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4"}

マップのすべてのキーまたはすべての値に対して操作を実行するには、プロパティ `keys` および `values` からそれぞれ取得できます。
`keys` はマップのすべてのキーのセット（set）であり、`values` はマップのすべての値のコレクション（collection）です。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mapOf("one" to 1, "two" to 2, "three" to 3)
    println(numbersMap.keys)
    println(numbersMap.values)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## フィルタリング {id="filter"}

他のコレクションと同様に、[`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html) 関数を使用してマップを[フィルタリング](collection-filtering.md)できます。
マップで `filter()` を呼び出すときは、`Pair` を引数とする述語（predicate）を渡します。
これにより、フィルタリングの述語内でキーと値の両方を使用できるようになります。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key11" to 11)
    val filteredMap = numbersMap.filter { (key, value) -> key.endsWith("1") && value > 10}
    println(filteredMap)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

マップをフィルタリングするための、キーによる方法と値による方法の2つの特定の方法もあります。
それぞれの方法に対して、[`filterKeys()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-keys.html) と [`filterValues()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-values.html) 関数があります。
どちらも、指定された述語に一致するエントリの新しいマップを返します。
`filterKeys()` の述語は要素의 キーのみをチェックし、`filterValues()` の述語は値のみをチェックします。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## plus および minus 演算子 {id="plus-and-minus-operators"}

要素へのキーアクセスがあるため、[`plus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus.html) (`+`) および [`minus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus.html) (`-`) 演算子は、他のコレクションとは異なる動作をマップに対して行います。
`plus` は、両方のオペランド（左側の `Map` と、右側の `Pair` または別の `Map`）の要素を含む `Map` を返します。
右側のオペランドに、左側の `Map` に存在するキーを持つエントリが含まれている場合、結果のマップには右側のエントリが含まれます。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

`minus` は、左側の `Map` のエントリから、右側のオペランドにあるキーを持つエントリを除外した `Map` を作成します。
したがって、右側のオペランドは単一のキー、またはリストやセットなどのキーのコレクションのいずれかにすることができます。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mapOf("one" to 1, "two" to 2, "three" to 3)
    println(numbersMap - "one")
    println(numbersMap - listOf("two", "four"))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

可変マップでの [`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html) (`+=`) および [`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html) (`-=`) 演算子の使用方法の詳細については、以下の[マップの書き込み操作](#map-write-operations)を参照してください。

## マップの書き込み操作 {id="map-write-operations"}

[可変（Mutable）](collections-overview.md#collection-types)マップは、マップ固有の書き込み操作を提供します。
これらの操作により、キーに基づいた値へのアクセスを使用してマップの内容を変更できます。

マップの書き込み操作を定義する特定のルールがあります：

* 値は更新できます。一方で、キーは決して変わりません。一度エントリを追加すると、そのキーは固定されます。
* 各キーに対して、常に関連付けられている値は1つだけです。エントリ全体を追加したり削除したりできます。

以下は、可変マップで使用できる書き込み操作用の標準ライブラリ関数の説明です。

### エントリの追加と更新 {id="add-and-update-entries"}

可変マップに新しいキーと値のペアを追加するには、[`put()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/put.html) を使用します。
新しいエントリが `LinkedHashMap`（デフォルトのマップ実装）に入れられると、マップを反復処理する際に最後に来るように追加されます。ソートされたマップでは、新しい要素の位置はキーの順序によって定義されます。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2)
    numbersMap.put("three", 3)
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

一度に複数のエントリを追加するには、[`putAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/put-all.html) を使用します。
その引数は、`Map` または `Pair` のグループ（`Iterable`、`Sequence`、または `Array`）にすることができます。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2, "three" to 3)
    numbersMap.putAll(setOf("four" to 4, "five" to 5))
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

`put()` と `putAll()` の両方は、指定されたキーが既にマップ内に存在する場合、値を上書きします。したがって、これらを使用してマップエントリの値を更新できます。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

短縮演算子形式を使用して、マップに新しいエントリを追加することもできます。2つの方法があります。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

マップ内に存在するキーを指定して呼び出された場合、演算子は対応するエントリの値を上書きします。

#### 欠落しているエントリへのデフォルト値の追加 {id="add-default-values-for-missing-entries"}

既存の値を返すか、値が利用できない場合にデフォルト値を追加するには、[`.getOrPut()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-put.html) 拡張関数を使用します。
キーが欠落しているか、値が `null` の場合、`.getOrPut()` はデフォルト値を保存してそれを返します。

値に null を許容するマップの場合、`null` 値の扱いを制御するために `.getOrPutIfNull()` および `.getOrPutIfMissing()` 関数を使用できます：

* `getOrPutIfNull()` は `getOrPut()` と同様に動作し、キーが欠落しているか値が `null` の場合にデフォルト値を使用します。
* `getOrPutIfMissing()` は、キーが欠落している場合にのみデフォルト値を使用します。

`getOrPutIfNull()` および `getOrPutIfMissing()` 関数は[試験的（Experimental）](components-stability.md#stability-levels-explained)です。
オプトインするには、`@OptIn(ExperimentalStdlibApi::class)` アノテーションを使用してください。

以下に例を示します：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
//sampleStart
    val mapForNull = mutableMapOf<String, Int?>("one" to null)
    val mapForMissing = mutableMapOf<String, Int?>("one" to null)

    // "one" の値が null の場合、値を置き換える
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

可変マップからエントリを削除するには、[`remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/remove.html) 関数を使用します。
`remove()` を呼び出すときは、キーまたはキーと値のペア全体を渡すことができます。
キーと値の両方を指定した場合、そのキーを持つ要素は、その値が第2引数と一致する場合にのみ削除されます。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

[`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html) (`-=`) 演算子も可変マップで使用できます。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}