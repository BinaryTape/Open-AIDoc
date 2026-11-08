[//]: # (title: シーケンス)

Kotlin標準ライブラリには、コレクションに加えて、もう1つの型である _シーケンス_ ([`Sequence<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/-sequence/index.html)) が含まれています。
シーケンスはコレクションとは異なり、要素を保持するのではなく、反復処理を行いながら要素を生成します。
シーケンスは [`Iterable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/index.html) と同じ関数を提供しますが、複数ステップにわたるコレクション処理に対して異なるアプローチを実装しています。

`Iterable` の処理に複数のステップが含まれる場合、それらは先行評価（eagerly）されます。各処理ステップが完了するとその結果（中間コレクション）を返し、次のステップはそのコレクションに対して実行されます。一方で、シーケンスの複数ステップ処理は、可能な限り遅延評価（lazily）されます。実際の計算は、処理チェーン全体の結果が要求されたときにのみ行われます。

操作の実行順序も異なります。`Sequence` は各要素に対してすべての処理ステップを1つずつ順番に実行します。一方、`Iterable` はコレクション全体に対して各ステップを完了してから、次のステップに進みます。

したがって、シーケンスを使用すると中間ステップの結果の構築を回避できるため、コレクション処理チェーン全体のパフォーマンスが向上します。ただし、シーケンスの遅延性にはオーバーヘッドが伴い、小さなコレクションの処理や単純な計算を行う場合にはそれが顕著になることがあります。そのため、`Sequence` と `Iterable` の両方を考慮し、ユースケースに適した方を選択する必要があります。

## 生成 {id="construct"}

### 要素から {id="from-elements"}

シーケンスを作成するには、要素を引数として列挙した [`sequenceOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/sequence-of.html) 関数を呼び出します。

```kotlin
val numbersSequence = sequenceOf("four", "three", "two", "one")
```

### Iterable から {id="from-an-iterable"}

すでに `Iterable` オブジェクト（`List` や `Set` など）がある場合は、[`asSequence()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/as-sequence.html) を呼び出すことでそこからシーケンスを作成できます。

```kotlin
val numbers = listOf("one", "two", "three", "four")
val numbersSequence = numbers.asSequence()

```

### 関数から {id="from-a-function"}

シーケンスを作成するもう1つの方法は、要素を計算する関数を使用して構築することです。
関数に基づいてシーケンスを構築するには、その関数を引数として [`generateSequence()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/generate-sequence.html) を呼び出します。オプションとして、最初の要素を明示的な値または関数呼び出しの結果として指定することもできます。
渡された関数が `null` を返すと、シーケンスの生成は停止します。したがって、以下の例のシーケンスは無限です。

```kotlin

fun main() {
//sampleStart
    val oddNumbers = generateSequence(1) { it + 2 } // `it` は直前の要素
    println(oddNumbers.take(5).toList())
    //println(oddNumbers.count())     // エラー: シーケンスが無限です
//sampleEnd
}
```
{kotlin-runnable="true"}

`generateSequence()` で有限シーケンスを作成するには、必要な最後の要素の後に `null` を返す関数を指定します。

```kotlin

fun main() {
//sampleStart
    val oddNumbersLessThan10 = generateSequence(1) { if (it < 8) it + 2 else null }
    println(oddNumbersLessThan10.count())
//sampleEnd
}
```
{kotlin-runnable="true"}

### チャンクから {id="from-chunks"}

最後に、シーケンスの要素を1つずつ、または任意のサイズのチャンクごとに生成できる関数として、[`sequence()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/sequence.html) 関数があります。
この関数は、[`yield()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/-sequence-scope/yield.html) および [`yieldAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/-sequence-scope/yield-all.html) 関数の呼び出しを含むラムダ式を受け取ります。
これらはシーケンスのコンシューマ（呼び出し側）に要素を返し、コンシューマから次の要素が要求されるまで `sequence()` の実行を一時停止（サスペンド）します。`yield()` は単一の要素を引数に取り、`yieldAll()` は `Iterable` オブジェクト、`Iterator`、または別の `Sequence` を取ることができます。`yieldAll()` の `Sequence` 引数は無限でもかまいません。ただし、そのような呼び出しは最後に置く必要があります。それ以降の呼び出しは決して実行されません。

```kotlin

fun main() {
//sampleStart
    val oddNumbers = sequence {
        yield(1)
        yieldAll(listOf(3, 5))
        yieldAll(generateSequence(7) { it + 2 })
    }
    println(oddNumbers.take(5).toList())
//sampleEnd
}
```
{kotlin-runnable="true"}

## シーケンスの操作 {id="sequence-operations"}

シーケンスの操作は、状態の要件に関して以下のグループに分類できます。

* _ステートレス（無状態）_ 操作は状態を必要とせず、各要素を独立して処理します。例えば [`map()`](collection-transformations.md#map) や [`filter()`](collection-filtering.md) です。
   また、ステートレス操作は、要素を処理するためにわずかな一定量の状態を必要とする場合もあります（例えば [`take()` や `drop()`](collection-parts.md)）。
* _ステートフル（有状態）_ 操作は、通常シーケンス内の要素数に比例する、かなりの量の状態を必要とします。

シーケンスの操作が遅延生成される別のシーケンスを返す場合、それは _中間（intermediate）_ 操作と呼ばれます。
そうでない場合、その操作は _終端（terminal）_ 操作です。終端操作の例としては、[`toList()`](constructing-collections.md#copy) や [`sum()`](collection-aggregate.md) などがあります。シーケンスの要素は、終端操作によってのみ取得できます。

シーケンスは複数回反復処理できますが、一部のシーケンス実装は1回しか反復処理できないように制限されている場合があります。これについては、各実装のドキュメントに明記されています。

## シーケンス処理の例 {id="sequence-processing-example"}

`Iterable` と `Sequence` の違いを例で見てみましょう。

### Iterable {id="iterable"}

単語のリストがあるとします。以下のコードは、3文字より長い単語をフィルタリングし、該当する最初の4つの単語の長さを出力します。

```kotlin

fun main() {    
//sampleStart
    val words = "The quick brown fox jumps over the lazy dog".split(" ")
    val lengthsList = words.filter { println("filter: $it"); it.length > 3 }
        .map { println("length: ${it.length}"); it.length }
        .take(4)

    println("Lengths of first 4 words longer than 3 chars:")
    println(lengthsList)
//sampleEnd
}
```
{kotlin-runnable="true"}

このコードを実行すると、`filter()` 関数と `map()` 関数がコード内に現れるのと同じ順序で実行されることがわかります。まずすべての要素に対して `filter:` が表示され、次にフィルタリング後に残った要素に対して `length:` が表示され、最後に最後の2行の出力が表示されます。

リスト処理は次のようになります。

![List processing](list-processing.svg)

### Sequence {id="sequence"}

次に、同じ処理をシーケンスで書いてみましょう。

```kotlin

fun main() {
//sampleStart
    val words = "The quick brown fox jumps over the lazy dog".split(" ")
    // List を Sequence に変換
    val wordsSequence = words.asSequence()

    val lengthsSequence = wordsSequence.filter { println("filter: $it"); it.length > 3 }
        .map { println("length: ${it.length}"); it.length }
        .take(4)

    println("Lengths of first 4 words longer than 3 chars")
    // 終端操作: 結果を List として取得
    println(lengthsSequence.toList())
//sampleEnd
}
```
{kotlin-runnable="true"}

このコードの出力から、`filter()` 関数と `map()` 関数は結果のリストを構築するときにのみ呼び出されることがわかります。
そのため、まず `"Lengths of.."` というテキスト行が表示され、その後にシーケンスの処理が開始されます。
フィルタリング後に残った要素については、次の要素をフィルタリングする前に map が実行されている点に注意してください。
結果のサイズが4に達すると、`take(4)` が返すことができる最大サイズであるため、処理が停止します。

シーケンス処理は次のようになります。

![Sequences processing](sequence-processing.svg) {width="700"}

この例では、要素の遅延処理と4つの項目が見つかった後に処理を停止することにより、リストを使用したアプローチと比較して処理の実行回数が削減されています。