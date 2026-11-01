[//]: # (title: 等価性)

Kotlinには、2種類の等価性（equality）があります：

* _構造的_ 等価性（structural equality、`==`）- `equals()` 関数の呼び出しによる検証
* _参照_ 等価性（referential equality、`===`）- 2つの参照が同一のオブジェクトを指しているかの検証

## 構造的等価性 {id="structural-equality"}

構造的等価性は、2つのオブジェクトが同じコンテンツまたは構造を持っているかを検証します。構造的等価性は、`==` 操作およびその否定である `!=` によってチェックされます。
慣例として、`a == b` のような式は以下のように変換されます：

```kotlin
a?.equals(b) ?: (b === null)
```

`a` が `null` でない場合、`equals(Any?)` 関数を呼び出します。そうでなく `a` が `null` の場合は、`b` が参照的に `null` と等しいかをチェックします：

```kotlin
fun main() {
    var a = "hello"
    var b = "hello"
    var c = null
    var d = null
    var e = d

    println(a == b)
    // true
    println(a == c)
    // false
    println(c == e)
    // true
}
```
{kotlin-runnable="true" validate="false"}

明示的に `null` と比較する場合、コードを最適化しようとする意味はないことに注意してください。
`a == null` は自動的に `a === null` に変換されます。

Kotlinでは、`equals()` 関数はすべてのクラスによって `Any` クラスから継承されます。デフォルトでは、`equals()` 関数は[参照等価性](#referential-equality)を実装しています。しかし、Kotlinのクラスでは `equals()` 関数をオーバーライドして独自の等価ロジックを提供することができ、これによって構造的等価性を実装できます。

バリュークラス（Value classes）とデータクラス（Data classes）は、自動的に `equals()` 関数をオーバーライドする2つの特別なKotlinの型です。
そのため、これらはデフォルトで構造的等価性を実装しています。

ただしデータクラスの場合、親クラスで `equals()` 関数が `final` としてマークされていると、その振る舞いは変更されません。

対照的に、非データクラス（`data` 修飾子を伴わずに宣言されたクラス）はデフォルトでは `equals()` 関数をオーバーライドしません。その代わり、非データクラスは `Any` クラスから継承された参照等価性の振る舞いを実装します。
構造的等価性を実装するには、非データクラスで `equals()` 関数をオーバーライドするカスタムの等価ロジックが必要です。

カスタムの等価性チェック実装を提供するには、[`equals(other: Any?): Boolean`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-any/equals.html) 関数をオーバーライドします：

```kotlin
class Point(val x: Int, val y: Int) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Point) return false

        // 構造的等価性のためにプロパティを比較
        return this.x == other.x && this.y == other.y
    }
}
```
> `equals()` 関数をオーバーライドする場合は、等価性とハッシュの一貫性を保ち、これらの関数が適切に動作するようにするために、[hashCode() 関数](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-any/hash-code.html) もオーバーライドする必要があります。
>
{style="note"}

同名で異なるシグネチャを持つ関数（`equals(other: Foo)` など）は、演算子 `==` および `!=` による等価性チェックには影響しません。

構造的等価性は `Comparable<...>` インターフェースで定義される比較とは無関係であるため、カスタムの `equals(Any?)` 実装のみが演算子の動作に影響を与えることができます。

## 参照等価性 {id="referential-equality"}

参照等価性は、2つのオブジェクトのメモリアドレスを検証し、それらが同一のインスタンスであるかどうかを判断します。

参照等価性は、`===` 操作およびその否定である `!==` によってチェックされます。`a === b` は、`a` と `b` が同じオブジェクトを指している場合にのみ `true` と評価されます：

```kotlin
fun main() {
    var a = "Hello"
    var b = a
    var c = "world"
    var d = "world"

    println(a === b)
    // true
    println(a === c)
    // false
    println(c === d)
    // true

}
```
{kotlin-runnable="true" validate="false"}

実行時にプリミティブ型で表される値（例えば `Int`）の場合、`===` による等価性チェックは `==` によるチェックと同等です。

> Kotlin/JSでは、参照等価性の実装が異なります。等価性の詳細については、[Kotlin/JS](js-interop.md#equality) のドキュメントを参照してください。
>
{style="tip"}

## 浮動小数点数の等価性 {id="floating-point-numbers-equality"}

等価性チェックのオペランドが静的に `Float` または `Double` であると判明している場合（nullableかどうかを問わず）、チェックは [IEEE 754 浮動小数点演算標準](https://en.wikipedia.org/wiki/IEEE_754) に従います。

静的に浮動小数点数型として型付けされていないオペランドの場合、動作が異なります。この場合、構造的等価性が実装されます。その結果、静的に浮動小数点数型として型付けされていないオペランドでのチェックは、IEEE標準とは異なります。このシナリオでは：

* `NaN` はそれ自身と等しい
* `NaN` は他のどの要素（`POSITIVE_INFINITY` を含む）よりも大きい
* `-0.0` は `0.0` と等しくない

詳細については、[浮動小数点数の比較](numbers.md#floating-point-number-comparison)を参照してください。

## 配列の等価性 {id="array-equality"}

2つの配列が同じ要素を同じ順序で持っているかを比較するには、[`contentEquals()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/content-equals.html) を使用します。

詳細については、[配列の比較](arrays.md#compare-arrays)を参照してください。