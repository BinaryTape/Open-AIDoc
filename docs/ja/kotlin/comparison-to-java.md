[//]: # (title: Javaとの比較)

## Kotlinで解決されたJavaの課題 {id="some-java-issues-addressed-in-kotlin"}

Kotlinは、Javaが抱えていた一連の課題を解決しています。

* null参照が[型システムによって制御されている](null-safety.md)。
* [raw型が存在しない](java-interop.md#java-generics-in-kotlin)
* Kotlinの配列は[不変（invariant）](arrays.md)である
* JavaのSAM変換とは異なり、Kotlinには適切な[関数型](lambdas.md#function-types)がある
* ワイルドカードを使用しない[利用場所変異（Use-site variance）](generics.md#use-site-variance-type-projections)
* Kotlinには検査[例外](exceptions.md)がない
* [読み取り専用コレクションと変更可能コレクションでインターフェースが分離されている](collections-overview.md)
* Kotlinは[`Enum.values()`に代わる高パフォーマンスで扱いやすい代替手段](enum-classes.md#find-enum-constants)を提供している

## JavaにあってKotlinにないもの {id="what-java-has-that-kotlin-does-not"}

* [検査例外](exceptions.md)
* クラスではない[プリミティブ型](types-overview.md)。バイトコードでは可能な限りプリミティブ型が使用されますが、明示的には利用できません。
* [静的メンバー](classes.md)は、[コンパニオンオブジェクト](object-declarations.md#companion-objects)、[トップレベル関数](functions.md)、[拡張関数](extensions.md#extension-functions)、または[@JvmStatic](java-to-kotlin-interop.md#static-methods)に置き換えられています。
* [ワイルドカード型](generics.md)は、[宣言場所変異（Declaration-site variance）](generics.md#declaration-site-variance)と[型プロジェクション](generics.md#type-projections)に置き換えられています。
* [三項演算子 `a ? b : c`](control-flow.md#if-expression)は[if式](control-flow.md#if-expression)に置き換えられています。 
* [レコード（Records）](https://openjdk.org/jeps/395)
* package-privateな[可視性修飾子](visibility-modifiers.md)

> Kotlinにはパターンマッチングはありませんが、[Kotlinのスマートキャスト](typecasts.md#smart-casts)によって[Javaのパターンマッチング](https://openjdk.org/projects/amber/design-notes/patterns/pattern-matching-for-java)と同様の機能が提供されています。
>
> 詳しくは[JetBrainsの公式Kotlinチャンネルの動画](https://www.youtube.com/watch?v=yJDoa42X-wQ)をご覧ください。
>
{style="note"}

## KotlinにあってJavaにないもの {id="what-kotlin-has-that-java-does-not"}

* [ラムダ式](lambdas.md) + [インライン関数](inline-functions.md) = 高パフォーマンスなカスタム制御構造
* [拡張関数](extensions.md)
* [Null安全性](null-safety.md)
* [文字列テンプレート](strings.md)
* [プロパティ](properties.md)
* [プライマリコンストラクタ](classes.md)
* [第一級のデリゲーション（委譲）](delegation.md)
* [変数およびプロパティの型の型推論](types-overview.md)（**Java 10**: [ローカル変数型推論](https://openjdk.org/jeps/286)）
* [シングルトン](object-declarations.md)
* [宣言場所変異と型プロジェクション](generics.md)
* [範囲（Range）式](ranges.md)
* [演算子オーバーロード](operator-overloading.md)
* [コンパニオンオブジェクト](classes.md#companion-objects)
* [データクラス](data-classes.md)
* [コルーチン](coroutines-overview.md)
* [トップレベル関数](functions.md)
* [デフォルト値付きの引数](functions.md#parameters-with-default-values)
* [名前付き引数](functions.md#named-arguments)
* [中置関数（Infix functions）](functions.md#infix-notation)
* [expect / actual 宣言](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)
* [明示的APIモード（Explicit API mode）](whatsnew14.md#explicit-api-mode-for-library-authors)と[APIサーフェスのより優れた制御](opt-in-requirements.md)

> Javaにはスマートキャストはありませんが、[パターンマッチング](https://openjdk.org/projects/amber/design-notes/patterns/pattern-matching-for-java)によって[Kotlinのスマートキャスト](typecasts.md#smart-casts)と同様の機能が提供されています。
>
> 詳しくは[JetBrainsの公式Kotlinチャンネルの動画](https://www.youtube.com/watch?v=yJDoa42X-wQ)をご覧ください。
>
{style="note"}

## 次のステップ {id="what-s-next"}

以下の方法について学ぶことができます:
* [JavaとKotlinにおける文字列の一般的な操作](java-to-kotlin-idioms-strings.md)
* [JavaとKotlinにおけるコレクションの一般的な操作](java-to-kotlin-collections-guide.md)
* [JavaとKotlinにおけるnull許容性の扱い方](java-to-kotlin-nullability-guide.md)