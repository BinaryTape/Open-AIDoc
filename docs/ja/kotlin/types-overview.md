[//]: # (title: 型の概要)

Kotlinでは、すべての変数のメンバー関数やプロパティを呼び出すことができるという意味で、すべてがオブジェクトです。
一部の型（数値、文字、ブール値など）は、実行時にはプリミティブ値として最適化された内部表現を持ちますが、Kotlinコード内では通常のクラスと同じように見え、振る舞います。

## 基本型 {id="basic-types"}

このセクションでは、Kotlinで使用される基本型について説明します：

| **カテゴリ**                                              | **基本型**                         | **定義**                           |
|-----------------------------------------------------------|------------------------------------|------------------------------------|
| [整数](numbers.md#integer-types)                          | `Byte`, `Short`, `Int`, `Long`     | 整数                               |
| [符号なし整数](unsigned-integer-types.md)                 | `UByte`, `UShort`, `UInt`, `ULong` | 非負の整数                         |
| [浮動小数点数](numbers.md#floating-point-types)           | `Float`, `Double`                  | 小数部を持つ数値                   |
| [ブール値](booleans.md)                                   | `Boolean`                          | 論理値: `true` および `false`      |
| [文字](characters.md)                                     | `Char`                             | 単一の文字                         |
| [文字列](strings.md)                                     | `String`                           | 文字の並び                         |
| [配列](arrays.md)                                         | `Array<T>`, プリミティブ型の配列  | 固定サイズの値の並び               |

> デフォルトでは、すべての型はnull非許容（non-nullable）です。`null` 値を許可するには、変数の型の直後に `?` を付けて変数を宣言します。たとえば、`String?` です。詳細は[Null安全性](null-safety.md#nullable-types-and-non-nullable-types)を参照してください。
> 
{style="note"}

`Nothing`、`Any`、`Unit` などの他のKotlinの型については、Kotlin APIリファレンスを参照してください：

* [`Any`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-any/) – Kotlinクラス階層のルート。
* [`Nothing`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-nothing.html) – 値を持たない型。
* [`Unit`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-unit/) – 1つの値（`Unit`）しか持たない型。

## 表記不可能な型 {id="non-denotable-types"}

Kotlinには、表記不可能な型（non-denotable types）もあります。これらは、Kotlinコード内で直接記述することができない型です。代わりに、コンパイラが他言語との相互運用性などのために、内部的に使用します。Kotlinは、Kotlinソースコードの構文で許可されているものよりも正確な型情報を表現するために、これら表記不可能な型を作成します。

自分自身で表記不可能な型を宣言することはできませんが、コンパイラの診断、IDEのツールチップ、または推論された型の表示でそれらに遭遇することがあります。表記不可能な型の詳細については、以下を参照してください：

* [プラットフォーム型](java-interop.md#null-safety-and-platform-types)
* [](typecasts.md#intersection-types)
* [](numbers.md#integer-literal-types)
* [](generics.md#captured-types)
* [Kotlin言語仕様：型システム](https://kotlinlang.org/spec/type-system.html)

> [Kotlin での型チェックとキャストの実行方法を学ぶ](typecasts.md)。
>
{style="tip"}