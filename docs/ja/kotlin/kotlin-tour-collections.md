[//]: # (title: コレクション)

<no-index/>

プログラミングでは、後で処理するためにデータを構造としてグループ化できると便利です。Kotlinはそのような目的のためにコレクションを提供しています。

Kotlinには、アイテムをグループ化するための以下のコレクションがあります。

| **コレクション型** | **説明**                                                                 |
|---------------------|-------------------------------------------------------------------------|
| リスト (List)       | 順序付けられたアイテムのコレクション                                      |
| セット (Set)        | 一意（ユニーク）で順序付けられていないアイテムのコレクション              |
| マップ (Map)        | キーが一意であり、1つの値のみに対応付けられているキーと値のペアのセット |

それぞれのコレクション型には、変更可能（mutable）なものと読み取り専用（read-only）のものがあります。

## リスト（List） {id="list"}

リストは、アイテムが追加された順序でアイテムを保存し、重複したアイテムを許可します。

読み取り専用リスト（[`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/)）を作成するには、[`listOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/list-of.html) 関数を使用します。

変更可能なリスト（[`MutableList`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list.html)）を作成するには、[`mutableListOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-list-of.html) 関数を使用します。

リストを作成する際、Kotlinは格納されているアイテムの型を推論できます。型を明示的に宣言するには、リストの宣言の後に山括弧 `<>` で囲んで型を追加します。

```kotlin
fun main() { 
//sampleStart
    // 読み取り専用リスト
    val readOnlyShapes = listOf("triangle", "square", "circle")
    println(readOnlyShapes)
    // [triangle, square, circle]
    
    // 型を明示的に宣言した変更可能リスト
    val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")
    println(shapes)
    // [triangle, square, circle]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lists-declaration"}

> 意図しない変更を防ぐために、変更可能なリストを `List` に代入することで、読み取り専用のビューを作成できます。
> 
> ```kotlin
>     val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")
>     val shapesLocked: List<String> = shapes
> ```
> これは**キャスト（casting）**とも呼ばれます。
> 
{style="tip"}

リストは順序付けられているため、リスト内のアイテムにアクセスするには[インデックスアクセス演算子](operator-overloading.md#indexed-access-operator) `[]` を使用します。

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

リストの最初または最後のアイテムを取得するには、それぞれ [`.first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) 関数と [`.last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html) 関数を使用します。

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

> [`.first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) 関数と [`.last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html) 関数は、**拡張関数（extension functions）**の例です。オブジェクトに対して拡張関数を呼び出すには、オブジェクトの後にピリオド `.` を付け、その後に続けて関数名を書きます。
> 
> 拡張関数の詳細については、[中級ツアー](kotlin-tour-intermediate-extension-functions.md#extension-functions)で説明しています。現時点では、呼び出し方さえ知っていれば問題ありません。
> 
{style="note"}

リスト内のアイテム数を取得するには、[`.count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html) 関数を使用します。

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

アイテムがリストに含まれているかどうかを確認するには、[`in` 演算子](operator-overloading.md#in-operator)を使用します。

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

変更可能なリストにアイテムを追加または削除するには、それぞれ [`.add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/add.html) 関数と [`.remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 関数を使用します。

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

## セット（Set） {id="set"}

リストが順序付けられており重複したアイテムを許可するのに対し、セットは**順序付けられておらず**、**一意（ユニーク）**なアイテムのみを保存します。

読み取り専用セット（[`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/)）を作成するには、[`setOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/set-of.html) 関数を使用します。

変更可能なセット（[`MutableSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/）を作成するには、[`mutableSetOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-set-of.html) 関数を使用します。

セットを作成する際、Kotlinは格納されているアイテムの型を推論できます。型を明示的に宣言するには、セットの宣言の後に山括弧 `<>` で囲んで型を追加します。

```kotlin
fun main() {
//sampleStart
    // 読み取り専用セット
    val readOnlyFruit = setOf("apple", "banana", "cherry", "cherry")
    // 型を明示的に宣言した変更可能セット
    val fruit: MutableSet<String> = mutableSetOf("apple", "banana", "cherry", "cherry")
    
    println(readOnlyFruit)
    // [apple, banana, cherry]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-sets-declaration"}

前の例を見るとわかるように、セットには一意の要素しか含めることができないため、重複した `"cherry"` のアイテムは除外されます。

> 意図しない変更を防ぐために、変更可能なセットを `Set` に代入することで、読み取り専用のビューを作成できます。
> 
> ```kotlin
>     val fruit: MutableSet<String> = mutableSetOf("apple", "banana", "cherry", "cherry")
>     val fruitLocked: Set<String> = fruit
> ```
>
{style="tip"}

> セットは**順序付けられていない**ため、特定のインデックスにあるアイテムにアクセスすることはできません。
> 
{style="note"}

セット内のアイテム数を取得するには、[`.count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html) 関数を使用します。

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

アイテムがセットに含まれているかどうかを確認するには、[`in` 演算子](operator-overloading.md#in-operator)を使用します。

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

変更可能なセットにアイテムを追加または削除するには、それぞれ [`.add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/add.html) 関数と [`.remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 関数を使用します。

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

## マップ（Map） {id="map"}

マップは、アイテムをキーと値のペアとして保存します。キーを参照して値にアクセスします。マップは飲食店のメニューのようなものだと想像してください。食べたい料理（キー）を見つけることで、その価格（値）を知ることができます。マップは、リストのように数値のインデックスを使わずに値を検索したい場合に便利です。

> * Kotlinがどの値を取得したいかを認識できるように、マップ内の各キーは一意である必要があります。
> * マップ内で値が重複することは問題ありません。
>
{style="note"}

読み取り専用マップ（[`Map`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/)）を作成するには、[`mapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-of.html) 関数を使用します。

変更可能なマップ（[`MutableMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/)）を作成するには、[`mutableMapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-map-of.html) 関数を使用します。

マップを作成する際、Kotlinは格納されているアイテムの型を推論できます。型を明示的に宣言するには、マップの宣言の後に山括弧 `<>` で囲んでキーと値の型を追加します。例えば `MutableMap<String, Int>` の場合、キーの型は `String` で、値の型は `Int` です。

マップを作成する最も簡単な方法は、各キーとそれに対応する値の間に [`to`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/to.html) を使用することです。

```kotlin
fun main() {
//sampleStart
    // 読み取り専用マップ
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println(readOnlyJuiceMenu)
    // {apple=100, kiwi=190, orange=100}

    // 型を明示的に宣言した変更可能マップ
    val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println(juiceMenu)
    // {apple=100, kiwi=190, orange=100}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-maps-declaration"}

> 意図しない変更を防ぐために、変更可能なマップを `Map` に代入することで、読み取り専用のビューを作成できます。
> 
> ```kotlin
>     val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
>     val juiceMenuLocked: Map<String, Int> = juiceMenu
> ```
>
{style="tip"}

マップ内の値にアクセスするには、キーを指定して[インデックスアクセス演算子](operator-overloading.md#indexed-access-operator) `[]` を使用します。

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

> マップ内に存在しないキーを使ってキーと値のペアにアクセスしようとすると、`null` 値が返されます。
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
> このツアーでは、null値について後ほど[Null安全性（Null safety）](kotlin-tour-null-safety.md)の章で説明します。
> 
{style="note"}

[インデックスアクセス演算子](operator-overloading.md#indexed-access-operator) `[]` を使用して、変更可能なマップにアイテムを追加することもできます。

```kotlin
fun main() {
//sampleStart
    val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    juiceMenu["coconut"] = 150 // マップにキー "coconut" と値 150 を追加
    println(juiceMenu)
    // {apple=100, kiwi=190, orange=100, coconut=150}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-add-item"}

変更可能なマップからアイテムを削除するには、[`.remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 関数を使用します。

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

マップ内のアイテム数を取得するには、[`.count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html) 関数を使用します。

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

特定のキーがマップに既に含まれているか確認するには、[`.containsKey()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/contains-key.html) 関数を使用します。

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

マップのキーまたは値のコレクションを取得するには、それぞれ [`keys`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/keys.html) プロパティおよび [`values`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/values.html) プロパティを使用します。

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

> [`keys`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/keys.html) と [`values`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/values.html) は、オブジェクトの**プロパティ（properties）**の例です。オブジェクトのプロパティにアクセスするには、オブジェクトの後にピリオド `.` を付け、その後に続けてプロパティ名を書きます。
>
> プロパティの詳細については、[クラス（Classes）](kotlin-tour-classes.md)の章で説明します。このツアーの現時点では、アクセスする方法さえ知っていれば問題ありません。
>
{style="note"}

キーや値がマップに含まれているか確認するには、[`in` 演算子](operator-overloading.md#in-operator)を使用します。

```kotlin
fun main() {
//sampleStart
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println("orange" in readOnlyJuiceMenu.keys)
    // true
    
    // 代わりに、keys プロパティを使わなくても確認できます
    println("orange" in readOnlyJuiceMenu)
    // true
    
    println(200 in readOnlyJuiceMenu.values)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-map-in"}

コレクションでできることの詳細については、[コレクション（Collections）](collections-overview.md)を参照してください。

基本型とコレクションの扱い方を理解できたので、次はプログラムで使用できる[制御フロー（control flow）](kotlin-tour-control-flow.md)について見ていきましょう。

## 練習問題 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="2つのリスト内のアイテムの合計数を数える" id="collections-exercise-1">

「緑（green）」の数値リストと「赤（red）」の数値リストがあります。合計でいくつの数値があるかを出力するようにコードを完成させてください。

```kotlin
fun main() {
    val greenNumbers = listOf(1, 4, 23)
    val redNumbers = listOf(17, 2)
    // ここにコードを記述してください
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-collections-exercise-1"}

```kotlin
fun main() {
    val greenNumbers = listOf(1, 4, 23)
    val redNumbers = listOf(17, 2)
    val totalCount = greenNumbers.count() + redNumbers.count()
    println(totalCount)
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-collections-solution-1"}

</def>
<def title="要求されたプロトコルがサポートされているか確認する" id="collections-exercise-2">

サーバーでサポートされているプロトコルのセットがあります。ユーザーが特定のプロトコルの使用を要求しています。要求されたプロトコルがサポートされているかどうかを確認するプログラムを完成させてください（`isSupported` は Boolean 値である必要があります）。

```kotlin
fun main() {
    val SUPPORTED = setOf("HTTP", "HTTPS", "FTP")
    val requested = "smtp"
    val isSupported = // ここにコードを記述してください 
    println("Support for $requested: $isSupported")
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-collections-exercise-2"}

<deflist collapsible="true" id="kotlin-tour-collections-exercise-2-hint">
    <def title="ヒント">
        要求されたプロトコルを大文字にして確認してください。これには <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase.html"><code>.uppercase()</code></a> 関数を使用できます。
    </def>
</deflist>

```kotlin
fun main() {
    val SUPPORTED = setOf("HTTP", "HTTPS", "FTP")
    val requested = "smtp"
    val isSupported = requested.uppercase() in SUPPORTED
    println("Support for $requested: $isSupported")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-collections-solution-2"}

</def>
<def title="マップを使って数値を単語で表す" id="collections-exercise-3">

1から3までの整数を対応するスペル（英語の単語表記）に関連付けるマップを定義してください。このマップを使用して、与えられた数値を単語で表してください。

```kotlin
fun main() {
    val number2word = // ここにコードを記述してください
    val n = 2
    println("$n is spelled as '${<ここにコードを記述してください >}'")
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-collections-exercise-3"}

```kotlin
fun main() {
    val number2word = mapOf(1 to "one", 2 to "two", 3 to "three")
    val n = 2
    println("$n is spelled as '${number2word[n]}'")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-collections-solution-3"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-basic-types.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-control-flow.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>