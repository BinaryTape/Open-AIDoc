[//]: # (title: 型の概要)

Kotlinでは、任意の変数に対してメンバー関数やプロパティを呼び出すことができるという意味で、すべてがオブジェクトです。
数値型、文字型、真偽値型などの一部の型は、実行時にプリミティブ値として内部的に最適化された表現を持ちますが、Kotlinコード上では通常のクラスのように見え、同様に振る舞います。

## 基本型 {id="basic-types"}

このセクションでは、Kotlinで使用される基本型について説明します。

| **カテゴリ**                                              | **基本型**                         | **定義**                           |
|-----------------------------------------------------------|------------------------------------|------------------------------------|
| [整数型](numbers.md#integer-types)                      | `Byte`, `Short`, `Int`, `Long`     | 整数                               |
| [符号なし整数型](unsigned-integer-types.md)            | `UByte`, `UShort`, `UInt`, `ULong` | 非負の整数                         |
| [浮動小数点数型](numbers.md#floating-point-types) | `Float`, `Double`                  | 小数部を持つ数値                   |
| [ブール型](booleans.md)                                   | `Boolean`                          | 論理値: `true` および `false`      |
| [文字型](characters.md)                               | `Char`                             | 単一の文字                         |
| [文字列型](strings.md)                                     | `String`                           | 文字の並び（文字列）               |
| [配列](arrays.md)                                       | `Array<T>`, プリミティブ型の配列   | 固定長の値の並び                   |

> デフォルトでは、すべての型が非null（non-nullable）です。`null` 値を許可するには、変数の型の直後に `?` 記号を付けて宣言します。例えば `String?` です。詳細については [Null安全](null-safety.md#nullable-types-and-non-nullable-types) を参照してください。
> 
{style="note"}

`Nothing`、`Any`、`Unit` などのその他のKotlinの型については、Kotlin APIリファレンスを参照してください。

* [`Any`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-any/) – Kotlinのクラス階層のルート。
* [`Nothing`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-nothing.html) – 値を持たない型。
* [`Unit`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-unit/) – 1つの値（`Unit`）のみを持つ型。ブロック本体を持ち、明示的な戻り値の型がない関数の戻り値の型としてコンパイラによって推論されます。[Unitを返す関数](functions.md#unit-returning-functions) を参照してください。

## 表記できない型（Non-denotable types） {id="non-denotable-types"}

Kotlinには、コード上で直接記述できない型（non-denotable types）もあります。これらはKotlinコード内に直接記述することができない型です。代わりに、コンパイラが他の言語との相互運用性などの目的で内部的に使用します。Kotlinは、Kotlinのソース構文で表現できる以上のより正確な型情報を表すために、表記できない型を生成します。

表記できない型を自分で宣言することはできませんが、コンパイラの診断メッセージ、IDEのツールチップ、または推論された型の表示で見かけることがあります。表記できない型についての詳細は、以下を参照してください。

* [プラットフォーム型](java-interop.md#null-safety-and-platform-types)
* [](typecasts.md#intersection-types)
* [](numbers.md#integer-literal-types)
* [](generics.md#captured-types)
* [Kotlin言語仕様: 型システム](https://kotlinlang.org/spec/type-system.html)

> [Kotlinでの型チェックとキャストの実行方法を学ぶ](typecasts.md)。
>
{style="tip"}