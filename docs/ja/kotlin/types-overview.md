[//]: # (title: 型の概要)

Kotlinでは、すべての変数のメンバー関数やプロパティを呼び出すことができるという意味で、すべてがオブジェクトです。
一部の型（数値、文字、ブール値など）は、実行時にはプリミティブ値として最適化された内部表現を持ちますが、それらは通常のクラスと同じように見え、振る舞います。

このセクションでは、Kotlinで使用される基本型について説明します。

* [数値](numbers.md) と [符号なし数値型](unsigned-integer-types.md)
* [ブール値](booleans.md)
* [文字](characters.md)
* [文字列](strings.md)
* [配列](arrays.md)

`Nothing`、`Any`、`Unit` などの他の Kotlin の型については、Kotlin API リファレンスを確認してください。

* [`Any`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-any/)
* [`Nothing`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-nothing.html)
* [`Unit`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-unit/)

Kotlinには、表記不可能な型（non-denotable types）もあります。これらは、Kotlinコード内で直接記述することができない型です。代わりに、コンパイラが他言語との相互運用性などのために、内部的に使用します。Kotlinは、Kotlinソースコードの構文で許可されているものよりも正確な型情報を表現するために、これら表記不可能な型を作成します。

自分自身で表記不可能な型を宣言することはできませんが、コンパイラの診断、IDEのツールチップ、または推論された型の表示でそれらに遭遇することがあります。表記不可能な型の詳細については、以下を参照してください：

* [プラットフォーム型](java-interop.md#null-safety-and-platform-types)
* [交差型](typecasts.md#intersection-types)
* [整数リテラル型](numbers.md#integer-literal-types)
* [キャプチャされた型](generics.md#captured-types)
* [Kotlin言語仕様：型システム](https://kotlinlang.org/spec/type-system.html)

> [Kotlin での型チェックとキャストの実行方法を学ぶ](typecasts.md)。
>
{style="tip"}