[//]: # (title: シーケンス)

コレクションに加え、Kotlin標準ライブラリにはもう1つの型である _シーケンス_ ([`Sequence<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/-sequence/index.html)) が含まれています。
コレクションとは異なり、シーケンスは要素を保持せず、反復処理（イテレーション）の実行中に要素を生成します。
シーケンスは [`Iterable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/index.html) と同じ関数を提供しますが、複数ステップにわたるコレクション処理に対して異なるアプローチを採用しています。

`Iterable` の処理に複数のステップが含まれている場合、それらは即座（eager）に実行されます。各処理ステップが完了してその結果である中間コレクションを返し、次のステップはその中間コレクションに対して実行されます。一方、シーケンスの複数ステップ処理は可能な限り遅延（lazy）実行されます。実際の計算は、処理チェーン全体の結果が要求されたときにのみ行われます。

また、操作の実行順序も異なります。`Sequence` は各要素に対してすべての処理ステップを1つずつ順番に行います。対して、`Iterable` はコレクション全体に対して各ステップを完了させてから、次のステップへと進みます。

したがって、シーケンスを使用すると中間ステップの結果の構築を回避できるため、コレクション処理チェーン全体のパフォーマンスが向上します。ただし、シーケンスの遅延性にはある程度のオーバーヘッドが伴うため、小さなコレクションの処理や単純な計算を行う場合には、その影響が大きくなる可能性があります。そのため、`Sequence` と `Iterable` の両方を検討し、ユースケースに合わせてどちらが適しているかを判断する必要があります。

## 作成 {id="construct"}

### 要素から {id="from-elements"}

シーケンスを作成するには、要素を引数として列挙して [`sequenceOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/sequence-of.html) 関数を呼び出します。

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
関数に基づいてシーケンスを構築するには、その関数を引数として [`generateSequence()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/generate-sequence.html) を呼び出します。オプションとして、最初の要素を明示的な値または関数呼び出しの結果として指定できます。
指定した関数が `null` を返すと、シーケンスの生成は停止します。したがって、以下の例のシーケンスは無限シーケンスになります。

```kotlin

fun main() {
//sampleStart
    val oddNumbers = generateSequence(1) { it + 2 } // `it` は直前の要素
    println(oddNumbers.take(5).toList())
    //println(oddNumbers.count())     // エラー: シーケンスが無限であるため
//sampleEnd
}
```
{kotlin-runnable="true"}

`generateSequence()` を使用して有限シーケンスを作成するには、必要な最後の要素の後に `null` を返す関数を指定します。

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

最後に、シーケンスの要素を1つずつ、あるいは任意のサイズのチャンクごとに生成できる関数として [`sequence()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/sequence.html) 関数があります。
この関数は、[`yield()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/-sequence-scope/yield.html) および [`yieldAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/-sequence-scope/yield-all.html) 関数の呼び出しを含むラムダ式を受け取ります。
これらはシーケンスのコンシューマ（呼び出し元）に要素を返し、次の要素がコンシューマによって要求されるまで `sequence()` の実行を一時中断します。`yield()` は単一の要素を引数に取り、`yieldAll()` は `Iterable` オブジェクト、`Iterator`、または別の `Sequence` を引数に取ることができます。`yieldAll()` の `Sequence` 引数は無限シーケンスにすることもできます。ただし、その呼び出しは最後でなければなりません。それ以降の呼び出しは決して実行されません。

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

シーケンスの操作は、状態の必要性に関して以下のグループに分類できます。

* _ステートレス（Stateless）_ 操作は状態を必要とせず、各要素を独立して処理します。例えば [`map()`](collection-transformations.md#map) や [`filter()`](collection-filtering.md) です。
   また、ステートレス操作であっても、要素の処理に少量の一定した状態を必要とする場合があります（例: [`take()` や `drop()`](collection-parts.md)）。
* _ステートフル（Stateful）_ 操作は、通常シーケンス内の要素数に比例する、かなりの量の状態を必要とします。

シーケンス操作が別のシーケンスを返し、それが遅延生成される場合、その操作は _中間操作（intermediate）_ と呼ばれます。
それ以外の場合は _終端操作（terminal）_ です。終端操作の例としては、[`toList()`](constructing-collections.md#copy) や [`sum()`](collection-aggregate.md) などがあります。シーケンスの要素は、終端操作によってのみ取得できます。

シーケンスは複数回反復処理（イテレーション）を行うことができます。ただし、一部のシーケンス実装では一度しか反復処理できないように制限されている場合もあります。その場合はドキュメントに明記されています。

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

このコードを実行すると、`filter()` と `map()` 関数がコード内に記述された順序と同じ順序で実行されることがわかります。まずすべての要素に対して `filter:` が出力され、次にフィルタリング後に残った要素に対して `length:` が出力され、その後に最後の2行の出力が表示されます。

リストの処理は以下のようになります。

![リスト処理](list-processing.svg)

### Sequence {id="sequence"}

今度は、シーケンスを使って同じ処理を書いてみましょう。

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

このコードの出力を見ると、結果のリストを作成する段階になって初めて `filter()` と `map()` 関数が呼び出されていることがわかります。
そのため、まず `"Lengths of.."` というテキストの行が表示され、その後にシーケンスの処理が開始されます。
フィルタリングに残った要素については、次の要素がフィルタリングされる前に map が実行されていることに注目してください。
結果のサイズが4に達すると、`take(4)` が返すことのできる最大サイズに達するため、処理は停止します。

シーケンスの処理は以下のようになります。

![シーケンス処理](sequence-processing.svg) {width="700"}

この例では、要素を遅延処理し、4つの要素が見つかった時点で処理を停止することで、リストを使ったアプローチと比較して処理回数を削減しています。