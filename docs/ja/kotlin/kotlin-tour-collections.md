[//]: # (title: コレクション)

<no-index/>

プログラミングにおいて、後で処理するためにデータを構造体にグループ化できると便利です。Kotlinでは、まさにこの目的のためにコレクションを提供しています。

Kotlinには、項目をグループ化するための以下のコレクションがあります：

| **コレクション型** | **説明**                                                         |
|---------------------|-------------------------------------------------------------------------|
| リスト（Lists）               | 項目の順序付けられたコレクション                                            |
| セット（Sets）                | 重複のない、順序のない項目のコレクション                                   |
| マップ（Maps）                | キーが一意で、1つの値にのみマップされるキーと値のペアのセット |

各コレクション型には、可変（mutable）または読み取り専用（read only）があります。

## リスト (List)

リストは、追加された順序で項目を保存し、重複する項目を許可します。

読み取り専用リスト ([`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/)) を作成するには、
[`listOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/list-of.html) 関数を使用します。

可変リスト ([`MutableList`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list.html)) を作成するには、
[`mutableListOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-list-of.html) 関数を使用します。

リストを作成する際、Kotlinは保存されている項目の型を推論できます。型を明示的に宣言するには、リスト宣言の後の山括弧 `<>` 内に型を追加します：

```kotlin
fun main() { 
//sampleStart
    // 読み取り専用リスト
    val readOnlyShapes = listOf("triangle", "square", "circle")
    println(readOnlyShapes)
    // [triangle, square, circle]
    
    // 明示的な型宣言を伴う可変リスト
    val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")
    println(shapes)
    // [triangle, square, circle]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lists-declaration"}

> 不要な変更を防ぐために、可変リストを `List` に代入することで、読み取り専用のビューを作成できます：
> 
> ```kotlin
>     val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")
>     val shapesLocked: List<String> = shapes
> ```
> これは**キャスト（casting）**とも呼ばわれます。
> 
{style="tip"}

リストは順序付けられているため、リスト内の項目にアクセスするには、[インデックスアクセス演算子](operator-overloading.md#indexed-access-operator) `[]` を使用します：

```kotlin
fun main() { 
//sampleStart
    val readOnlyShapes = listOf("triangle", "square", "circle")
    println("The first item in the list is: ${readOnlyShapes[0]}")
    // The first item in the list is: triangle
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-list-access"}

リストの最初または最後の項目を取得するには、それぞれ [`.first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html)
および [`.last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html) 関数を使用します：

```kotlin
fun main() { 
//sampleStart
    val readOnlyShapes = listOf("triangle", "square", "circle")
    println("The first item in the list is: ${readOnlyShapes.first()}")
    // The first item in the list is: triangle
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-list-first"}

> [`.first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) および [`.last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html)
> 関数は**拡張（extension）**関数の例です。オブジェクトに対して拡張関数を呼び出すには、オブジェクトの後にピリオド `.` を付けて関数名を書きます。
> 
> 拡張関数については、[中級ツアー](kotlin-tour-intermediate-extension-functions.md#extension-functions)で詳しく説明します。
> 現時点では、呼び出し方を知っておくだけで十分です。
> 
{style="note"}

リスト内の項目数を取得するには、[`.count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html)
関数を使用します：

```kotlin
fun main() { 
//sampleStart
    val readOnlyShapes = listOf("triangle", "square", "circle")
    println("This list has ${readOnlyShapes.count()} items")
    // This list has 3 items
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-list-count"}

項目がリストに含まれているか確認するには、[`in` 演算子](operator-overloading.md#in-operator)を使用します：

```kotlin
fun main() {
//sampleStart
    val readOnlyShapes = listOf("triangle", "square", "circle")
    println("circle" in readOnlyShapes)
    // true
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-list-in"}

可変リストに項目を追加または削除するには、それぞれ [`.add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/add.html)
および [`.remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 関数を使用します：

```kotlin
fun main() { 
//sampleStart
    val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")
    // リストに "pentagon" を追加
    shapes.add("pentagon") 
    println(shapes)  
    // [triangle, square, circle, pentagon]

    // リストから最初の "pentagon" を削除
    shapes.remove("pentagon") 
    println(shapes)  
    // [triangle, square, circle]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-list-add-remove"}

## セット (Set)

リストが順序付けられ、重複した項目を許可するのに対し、セットは**順序がなく**、**一意（ユニーク）な**項目のみを保存します。

読み取り専用セット ([`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/)) を作成するには、
[`setOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/set-of.html) 関数を使用します。

可変セット ([`MutableSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/)) を作成するには、
[`mutableSetOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-set-of.html) 関数を使用します。

セットを作成する際、Kotlinは保存されている項目の型を推論できます。型を明示的に宣言するには、セット宣言の後の山括弧 `<>` 内に型を追加します：

```kotlin
fun main() {
//sampleStart
    // 読み取り専用セット
    val readOnlyFruit = setOf("apple", "banana", "cherry", "cherry")
    // 明示的な型宣言を伴う可変セット
    val fruit: MutableSet<String> = mutableSetOf("apple", "banana", "cherry", "cherry")
    
    println(readOnlyFruit)
    // [apple, banana, cherry]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-sets-declaration"}

前の例でわかるように、セットは一意な要素のみを含むため、重複した `"cherry"` 項目は破棄されます。

> 不要な変更を防ぐために、可変セットを `Set` に代入することで、読み取り専用のビューを作成できます：
> 
> ```kotlin
>     val fruit: MutableSet<String> = mutableSetOf("apple", "banana", "cherry", "cherry")
>     val fruitLocked: Set<String> = fruit
> ```
>
{style="tip"}

> セットは**順序がない**ため、特定のインデックスにある項目にアクセスすることはできません。
> 
{style="note"}

セット内の項目数を取得するには、[`.count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html)
関数を使用します：

```kotlin
fun main() { 
//sampleStart
    val readOnlyFruit = setOf("apple", "banana", "cherry", "cherry")
    println("This set has ${readOnlyFruit.count()} items")
    // This set has 3 items
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-set-count"}

項目がセットに含まれているか確認するには、[`in` 演算子](operator-overloading.md#in-operator)を使用します：

```kotlin
fun main() {
//sampleStart
    val readOnlyFruit = setOf("apple", "banana", "cherry", "cherry")
    println("banana" in readOnlyFruit)
    // true
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-set-in"}

可変セットに項目を追加または削除するには、それぞれ [`.add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/add.html)
および [`.remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 関数を使用します：

```kotlin
fun main() { 
//sampleStart
    val fruit: MutableSet<String> = mutableSetOf("apple", "banana", "cherry", "cherry")
    fruit.add("dragonfruit")    // セットに "dragonfruit" を追加
    println(fruit)              // [apple, banana, cherry, dragonfruit]
    
    fruit.remove("dragonfruit") // セットから "dragonfruit" を削除
    println(fruit)              // [apple, banana, cherry]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-set-add-remove"}

## マップ (Map)

マップは項目をキーと値のペア（key-value pairs）として保存します。キーを参照することで値にアクセスします。マップは食べ物のメニューのようなものだと想像してください。食べたい料理（キー）を見つけることで、その価格（値）を知ることができます。マップは、リストのように番号付きのインデックスを使用せずに、特定の値を検索したい場合に便利です。

> * マップ内のすべてのキーは一意である必要があります。これにより、Kotlinは取得したい値を正しく特定できます。
> * マップ内で値を重複させることは可能です。
>
{style="note"}

読み取り専用マップ ([`Map`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/)) を作成するには、
[`mapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-of.html) 関数を使用します。

可変マップ ([`MutableMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/)) を作成するには、
[`mutableMapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-map-of.html) 関数を使用します。

マップを作成する際、Kotlinは保存されている項目の型を推論できます。型を明示的に宣言するには、マップ宣言の後の山括弧 `<>` 内にキーと値の型を追加します。例えば、`MutableMap<String, Int>` のようになります。この場合、キーの型は `String` で、値の型は `Int` です。

マップを作成する最も簡単な方法は、各キーとそれに関連する値の間に [`to`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/to.html) を使用することです：

```kotlin
fun main() {
//sampleStart
    // 読み取り専用マップ
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println(readOnlyJuiceMenu)
    // {apple=100, kiwi=190, orange=100}

    // 明示的な型宣言を伴う可変マップ
    val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println(juiceMenu)
    // {apple=100, kiwi=190, orange=100}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-maps-declaration"}

> 不要な変更を防ぐために、可変マップを `Map` に代入することで、読み取り専用のビューを作成できます：
> 
> ```kotlin
>     val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
>     val juiceMenuLocked: Map<String, Int> = juiceMenu
> ```
>
{style="tip"}

マップ内の値にアクセスするには、[インデックスアクセス演算子](operator-overloading.md#indexed-access-operator) `[]` にキーを指定して使用します：

```kotlin
fun main() {
//sampleStart
    // 読み取り専用マップ
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println("The value of apple juice is: ${readOnlyJuiceMenu["apple"]}")
    // The value of apple juice is: 100
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-access"}

> マップに存在しないキーでアクセスしようとすると、`null` 値が返されます：
>
> ```kotlin
> fun main() {
> //sampleStart
>     // 読み取り専用マップ
>     val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
>     println("The value of pineapple juice is: ${readOnlyJuiceMenu["pineapple"]}")
>     // The value of pineapple juice is: null
> //sampleEnd
> }
> ```
> {kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-no-key" validate="false"}
> 
> このツアーでは、後半の [Null安全](kotlin-tour-null-safety.md) の章で null 値について説明します。
> 
{style="note"}

[インデックスアクセス演算子](operator-overloading.md#indexed-access-operator) `[]` を使用して、可変マップに項目を追加することもできます：

```kotlin
fun main() {
//sampleStart
    val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    juiceMenu["coconut"] = 150 // キー "coconut"、値 150 をマップに追加
    println(juiceMenu)
    // {apple=100, kiwi=190, orange=100, coconut=150}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-add-item"}

可変マップから項目を削除するには、[`.remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 関数を使用します：

```kotlin
fun main() {
//sampleStart
    val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    juiceMenu.remove("orange")    // マップからキー "orange" を削除
    println(juiceMenu)
    // {apple=100, kiwi=190}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-put-remove"}

マップ内の項目数を取得するには、[`.count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html)
関数を使用します：

```kotlin
fun main() {
//sampleStart
    // 読み取り専用マップ
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println("This map has ${readOnlyJuiceMenu.count()} key-value pairs")
    // This map has 3 key-value pairs
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-count"}

特定のキーが既にマップに含まれているか確認するには、[`.containsKey()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/contains-key.html)
関数を使用します：

```kotlin
fun main() {
//sampleStart
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println(readOnlyJuiceMenu.containsKey("kiwi"))
    // true
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-contains-keys"}

マップのキーまたは値のコレクションを取得するには、それぞれ [`keys`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/keys.html)
および [`values`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/values.html) プロパティを使用します：

```kotlin
fun main() {
//sampleStart
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println(readOnlyJuiceMenu.keys)
    // [apple, kiwi, orange]
    println(readOnlyJuiceMenu.values)
    // [100, 190, 100]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-keys-values"}

> [`keys`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/keys.html) と [`values`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/values.html)
> はオブジェクトの**プロパティ**の例です。オブジェクトのプロパティにアクセスするには、オブジェクトの後にピリオド `.` を付けてプロパティ名を書きます。
>
> プロパティについては、[クラス](kotlin-tour-classes.md)の章で詳しく説明します。
> 現時点では、それらにアクセスする方法を知っておくだけで十分です。
>
{style="note"}

キーまたは値がマップに含まれているか確認するには、[`in` 演算子](operator-overloading.md#in-operator)を使用します：

```kotlin
fun main() {
//sampleStart
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println("orange" in readOnlyJuiceMenu.keys)
    // true
    
    // 代わりに、keys プロパティを使用しなくても確認できます
    println("orange" in readOnlyJuiceMenu)
    // true
    
    println(200 in readOnlyJuiceMenu.values)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-in"}

コレクションでできることについての詳細は、[コレクション](collections-overview.md)を参照してください。

基本型とコレクションの管理方法について学んだので、次はプログラムで使用できる [制御フロー](kotlin-tour-control-flow.md) について見ていきましょう。

## 練習問題 {completion-point="true"}

### 演習 1 {initial-collapse-state="collapsed" collapsible="true"}

「緑」の番号のリストと「赤」の番号のリストがあります。合計でいくつの番号があるかを出力するようにコードを完成させてください。

|---|---|
```kotlin
fun main() {
    val greenNumbers = listOf(1, 4, 23)
    val redNumbers = listOf(17, 2)
    // ここにコードを書いてください
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-collections-exercise-1"}

|---|---|
```kotlin
fun main() {
    val greenNumbers = listOf(1, 4, 23)
    val redNumbers = listOf(17, 2)
    val totalCount = greenNumbers.count() + redNumbers.count()
    println(totalCount)
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-collections-solution-1"}

### 演習 2 {initial-collapse-state="collapsed" collapsible="true"}

サーバーでサポートされているプロトコルのセットがあります。ユーザーが特定のプロトコルの使用をリクエストします。リクエストされたプロトコルがサポートされているかどうかを確認するプログラムを完成させてください（`isSupported` は Boolean 値である必要があります）。

|---|---|
```kotlin
fun main() {
    val SUPPORTED = setOf("HTTP", "HTTPS", "FTP")
    val requested = "smtp"
    val isSupported = // ここにコードを書いてください 
    println("Support for $requested: $isSupported")
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-collections-exercise-2"}

<deflist collapsible="true" id="kotlin-tour-collections-exercise-2-hint">
    <def title="ヒント">
        リクエストされたプロトコルを大文字にして確認するようにしてください。これには <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase.html"><code>.uppercase()</code></a>
関数が役立ちます。
    </def>
</deflist>

|---|---|
```kotlin
fun main() {
    val SUPPORTED = setOf("HTTP", "HTTPS", "FTP")
    val requested = "smtp"
    val isSupported = requested.uppercase() in SUPPORTED
    println("Support for $requested: $isSupported")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-collections-solution-2"}

### 演習 3 {initial-collapse-state="collapsed" collapsible="true"}

1から3までの整数を、対応する英語の綴りに関連付けるマップを定義してください。このマップを使用して、与えられた数値を綴ってください。

|---|---|
```kotlin
fun main() {
    val number2word = // ここにコードを書いてください
    val n = 2
    println("$n is spelled as '${<ここにコードを書いてください >}'")
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-collections-exercise-3"}

|---|---|
```kotlin
fun main() {
    val number2word = mapOf(1 to "one", 2 to "two", 3 to "three")
    val n = 2
    println("$n is spelt as '${number2word[n]}'")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-collections-solution-3"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-basic-types.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-control-flow.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>