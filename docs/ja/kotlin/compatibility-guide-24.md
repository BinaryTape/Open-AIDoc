[//]: # (title: Kotlin 2.4.x 互換性ガイド)

_[言語をモダンに保つ](kotlin-evolution-principles.md)_ および _[快適なアップデート](kotlin-evolution-principles.md)_ は、Kotlin 言語設計における基本原則です。前者は言語の進化を妨げる構文を削除すべきであることを示しており、後者はコードの移行を可能な限りスムーズにするために、その削除を事前に十分に周知すべきであることを示しています。

ほとんどの言語変更は、アップデートの変更履歴やコンパイラの警告など、他のチャネルを通じて既に発表されていますが、このドキュメントではそれらすべてを要約し、Kotlin 2.3 から Kotlin 2.4 への移行のための完全なリファレンスを提供します。このドキュメントには、ツールに関連する変更に関する情報も含まれています。

## 基本用語 {id="basic-terms"}

このドキュメントでは、いくつかの種類の互換性を紹介します：

- _ソース (source)_: ソース互換性のない変更により、以前は問題なく（エラーや警告なしで）コンパイルできていたコードがコンパイルできなくなります。
- _バイナリ (binary)_: 2 つのバイナリアーティファクトを入れ替えても、ロードエラーやリンケージエラーが発生しない場合、それらはバイナリ互換であると言われます。
- _振る舞い (behavioral)_: 変更を適用する前後で、同じプログラムが異なる動作を示す場合、その変更は振る舞いの互換性がないと言われます。

これらの定義は、純粋な Kotlin に対してのみ適用されることに注意してください。他の言語（Java など）の観点からの Kotlin コードの互換性は、このドキュメントの範囲外です。

## 言語 (Language) {id="language"}

### `-language-version=1.9` および K1 コンパイラのサポート終了 {id="drop-support-for-language-version-1-9-and-the-k1-compiler"}

> **課題**: [KT-80590](https://youtrack.jetbrains.com/issue/KT-80590)
>
> **コンポーネント**: コンパイラ
>
> **互換性のない変更の種類**: ソース
>
> **概要**: Kotlin 2.4 以降、コンパイラは [`-language-version=1.9`](compiler-reference.md#language-version-version) をサポートしなくなります。その結果、K1 コンパイラはサポートされなくなります。
>
> **デプロケーションサイクル**:
>
> - 2.2.0: `-language-version` に 1.9 を使用した場合に警告を報告
> - 2.4.0: 警告をエラーに格上げ

### Java 型に対するフレキシブルな明示的 Null 許容型引数の禁止 {id="prohibit-flexible-explicit-nullable-type-arguments-for-java-types"}

> **課題**: [KTLC-284](https://youtrack.jetbrains.com/issue/KTLC-284)
>
> **コンポーネント**: 言語コア
>
> **互換性のない変更の種類**: ソース
>
> **概要**: 以前、Kotlin から Java API を呼び出す際、コンパイラは明示的に指定された Null 許容型引数をフレキシブルな型（flexible type）引数として扱うことがありました。Kotlin 2.4.0 では、Null 許容型引数に対してこの動作を適用しなくなったため、型安全性を損なう可能性や実行時に失敗する可能性のあるコードに対してコンパイラがエラーを報告するようになります。
>
> **デプロケーションサイクル**:
>
> - 2.2.0: フレキシブルな型として扱われる明示的に指定された Null 許容型引数に対して警告を報告
> - 2.4.0: 警告をエラーに格上げ

### 明らかに互換性のない型に対する常に false となる `is` チェックの禁止 {id="prohibit-always-false-is-checks-for-definitely-incompatible-types"}

> **課題**: [KTLC-365](https://youtrack.jetbrains.com/issue/KTLC-365)
>
> **コンポーネント**: 言語コア
>
> **互換性のない変更の種類**: ソース
>
> **概要**: チェックされる型が明らかに互換性がないために常に false となる、無意味な `is` チェックをコンパイラが禁止するようになりました。これにより、互換性のない型を含む他の操作と動作が一貫するようになります。
>
> **デプロケーションサイクル**:
>
> - 2.0.0: 明らかに互換性のない型を用いた `is` チェックに対して警告を報告
> - 2.4.0: 警告をエラーに格上げ

### インライン関数における可視性の低い型および宣言の露出の禁止 {id="prohibit-exposing-types-and-declarations-with-lower-visibility-in-inline-functions"}

> **課題**: [KTLC-283](https://youtrack.jetbrains.com/issue/KTLC-283)
>
> **コンポーネント**: 言語コア
>
> **互換性のない変更の種類**: ソース
>
> **概要**: コンパイラは、インライン関数自体よりも可視性が低い型や宣言を、インライン関数が露出させることを禁止するようになりました。
>
> **デプロケーションサイクル**:
>
> - 2.3.0: インライン関数において可視性の低い型および宣言を露出させている場合に警告を報告
> - 2.4.0: 警告をエラーに格上げ

### アノテーションのデフォルトの使用箇所ターゲット選択の変更 {id="change-default-use-site-target-selection-for-annotations"}

> **課題**: [KTLC-391](https://youtrack.jetbrains.com/issue/KTLC-391)
>
> **コンポーネント**: 言語コア
>
> **互換性のない変更の種類**: バイナリ
>
> **概要**: Kotlin 2.4.0 では、アノテーションをパラメータ、プロパティ、およびフィールドに伝播させるためのデフォルトルールが更新されました。これは、再コンパイル後のアノテーション処理、リフレクション、およびバイナリメタデータに影響を与える可能性があります。使用箇所ターゲット（use-site target）を指定しない場合、コンパイラは適用可能であれば `param` と `property` を使用し、`property` が適用できない場合にのみ `field` を使用するようになりました。
>
> `@Annotation` の代わりに `@param:Annotation` のように、使用箇所ターゲットを明示的に指定することができます。プロジェクト全体で以前のデフォルトルールを使用するには、ビルドファイルに `-Xannotation-default-target=first-only` を追加してください。
>  
> **デプロケーションサイクル**:
>
> - 2.2.0: 新しいデフォルトルールによって選択される使用箇所ターゲットが変化する場合に警告を報告
> - 2.4.0: 新しいデフォルトルールを有効化

### アクセス不能な型への暗黙的な参照の禁止 {id="forbid-implicit-references-to-inaccessible-types"}

> **課題**: [KTLC-384](https://youtrack.jetbrains.com/issue/KTLC-384)
>
> **コンポーネント**: 言語コア
>
> **互換性のない変更の種類**: ソース
>
> **概要**: 間接的な依存関係からアクセス不能な型を暗黙的に参照する宣言を使用すると、エラーが発生するようになりました。
> 
> 移行するには、アクセス不能な型を宣言しているモジュールへの明示的な依存関係を追加するか、その型を露出させないように中間 API を更新してください。
> 
> **デプロケーションサイクル**:
>
> - 2.3.0: アクセス不能な型への暗黙的な参照に対して警告を報告
> - 2.4.0: 警告をエラーに格上げ

### Jakarta Null 許容性アノテーションの強制 {id="enforce-jakarta-nullability-annotations"}

> **課題**: [KTLC-285](https://youtrack.jetbrains.com/issue/KTLC-285)
>
> **コンポーネント**: 言語コア
>
> **互換性のない変更の種類**: ソース
>
> **概要**: コンパイラは、[`jakarta.annotation.Nullable`](https://jakarta.ee/specifications/annotations/2.1/apidocs/jakarta.annotation/jakarta/annotation/nullable) または [`jakarta.annotation.Nonnull`](https://jakarta.ee/specifications/annotations/2.1/apidocs/jakarta.annotation/jakarta/annotation/nonnull) を使用する Java 宣言に対して、Kotlin 側で宣言された Null 許容性を強制するようになりました。これらのアノテーションによって Null 許容とマークされた Java 宣言を、Null 非許容の Kotlin 型に代入しようとすると、コンパイラがエラーを報告します。
>
> **デプロケーションサイクル**:
>
> - 2.2.0: Jakarta Null 許容性アノテーションが付与された Java 宣言における Null 許容性の不一致に対して警告を報告
> - 2.4.0: 警告をエラーに格上げ

### 呼び出し可能参照の修飾子における不適切な位置の型引数の報告 {id="report-misplaced-type-arguments-in-callable-reference-qualifiers"}

> **課題**: [KTLC-388](https://youtrack.jetbrains.com/issue/KTLC-388)
>
> **コンポーネント**: 言語コア
>
> **互換性のない変更の種類**: ソース
>
> **概要**: コンパイラは呼び出し可能参照（callable reference）の左辺をチェックし、内部クラスが修飾子の間違った部分に型引数を含んでいる場合に警告を報告するようになりました。
> 
> 移行するには、各型引数がそれを宣言しているクラスに属するように参照を更新してください。例えば、`Inner<String, Int>::toString` の代わりに完全な型 `Outer<Int>.Inner<String>::toString` と記述します。
>
> **デプロケーションサイクル**:
>
> - 2.4.0: 呼び出し可能参照の左辺にある型引数が修飾子の別の部分に属している場合に警告を報告

### Null 許容な上限境界を持つ具体化された型パラメータからのクラスリテラルに対するエラー報告 {id="report-errors-for-class-literals-from-reified-type-parameters-with-nullable-upper-bounds"}

> **課題**: [KTLC-370](https://youtrack.jetbrains.com/issue/KTLC-370)
>
> **コンポーネント**: 言語コア
>
> **互換性のない変更の種類**: ソース
>
> **概要**: Null 許容な上限境界を持つ具体化された（reified）型パラメータから型が決定される式に対して `::class` を使用すると、コンパイラがエラーを報告するようになりました。そのような式に対して `::class` を使用する場合は、明示的な Null チェックまたは `!!` 演算子を使用して、まず値を Null 非許容にしてください。
>
> **デプロケーションサイクル**:
>
> - 2.3.0: Null 許容な上限境界を持つ具体化された型パラメータから型が決定される式に対して `::class` が使用された場合に警告を報告
> - 2.4.0: 警告をエラーに格上げ

### 匿名オブジェクトにおける宣言前の初期化の禁止 {id="prohibit-initialization-before-declarations-in-anonymous-objects"}

> **課題**: [KTLC-290](https://youtrack.jetbrains.com/issue/KTLC-290)
>
> **コンポーネント**: 言語コア
>
> **互換性のない変更の種類**: ソース
>
> **概要**: 匿名オブジェクトの `init` ブロックにおいて、プロパティを宣言する前にそのプロパティを初期化しようとすると、Kotlin がエラーを報告するようになりました。
> 
> **デプロケーションサイクル**:
>
> - 2.2.20: 匿名オブジェクトの `init` ブロックにおいて、プロパティ宣言の前にプロパティを初期化している場合に警告を報告
> - 2.4.0: 警告をエラーに格上げ

### 非抽象 Java sealed クラスを用いた `when` 式における網羅性の強制 {id="enforce-exhaustiveness-for-when-expressions-with-non-abstract-java-sealed-classes"}

> **課題**: [KTLC-366](https://youtrack.jetbrains.com/issue/KTLC-366)
>
> **コンポーネント**: 言語コア
>
> **互換性のない変更の種類**: ソース
>
> **概要**: 非抽象 Java sealed クラスを用いた `when` 式を使用する場合、Kotlin は網羅性（exhaustiveness）をより厳格にチェックし、`else` ブランチまたは sealed クラス自体に一致するブランチを要求するようになりました。以前は、Java sealed クラス自体を直接インスタンス化できる場合であっても、Kotlin はそのような `when` 式を網羅的であるとして扱うことがありました。
>
> **デプロケーションサイクル**:
>
> - 2.3.0: 非抽象 Java sealed クラスを用いた非網羅的な `when` 式に対して警告を報告
> - 2.4.0: 警告をエラーに格上げ

### パラメータが多すぎる `getValue()` および `setValue()` 関数への `operator` 修飾子の付与禁止 {id="prohibit-operator-modifier-on-getvalue-and-setvalue-functions-with-too-many-parameters"}

> **課題**: [KTLC-289](https://youtrack.jetbrains.com/issue/KTLC-289)
>
> **コンポーネント**: 言語コア
>
> **互換性のない変更の種類**: ソース
>
> **概要**: [`getValue()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.properties/-read-only-property/get-value.html) または [`setValue()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.properties/-read-write-property/set-value.html) 関数に `operator` 修飾子を付与する場合、コンパイラはそれらが必要な数の値パラメータを持っているかどうかをチェックするようになりました。`getValue()` 関数は正確に 2 つの値パラメータを持つ必要があり、`setValue()` 関数は正確に 3 つである必要があります。移行するには、`operator` 修飾子を削除するか、関数のシグネチャを変更してください。
>
> **デプロケーションサイクル**:
>
> - 2.2.20: 値パラメータが多すぎる `operator` `getValue()` および `setValue()` 関数に対して警告を報告
> - 2.4.0: 警告をエラーに格上げ

### ジェネリック呼び出しにおける一貫性のない型引数の禁止 {id="prohibit-inconsistent-type-arguments-in-generic-calls"}

> **課題**: [KTLC-373](https://youtrack.jetbrains.com/issue/KTLC-373)
>
> **コンポーネント**: 言語コア
>
> **互換性のない変更の種類**: ソース
>
> **概要**: ジェネリック呼び出しで型引数を指定する際、ある型引数が別の型引数に依存する上限境界制約に違反している場合に、コンパイラがエラーを報告するようになりました。型パラメータが互いに依存している場合は、それらの制約に一致する型引数を使用してください。例えば、`Container<Alpha, BetaKey>()` の代わりに `Container<Alpha, AlphaKey>()` を使用します。
>
> **デプロケーションサイクル**:
>
> - 2.3.0: ジェネリック呼び出しにおける明示的な型引数が型パラメータ間の上限境界制約に違反している場合に警告を報告
> - 2.4.0: 警告をエラーに格上げ

### `javaClass` プロパティへの参照の非推奨化 {id="deprecate-references-to-the-javaclass-property"}

> **課題**: [KTLC-375](https://youtrack.jetbrains.com/issue/KTLC-375)
>
> **コンポーネント**: Kotlin/JVM
>
> **互換性のない変更の種類**: ソース
>
> **概要**: Kotlin 2.4.0 では、`::class.java` との混同を避けるため、[`javaClass`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/java-class.html) プロパティへのプロパティ参照が非推奨になりました。オブジェクトの実行時の Java クラスを取得するには `.javaClass` を、Java クラス参照を取得するには `::class.java` を使用してください。
>
> **デプロケーションサイクル**:
>
> - 2.4.0: `javaClass` プロパティへのプロパティ参照に対して警告を報告

### オプトインが必要な暗黙的な列挙型コンストラクタ呼び出しのエラー報告 {id="report-errors-for-implicit-enum-constructor-calls-that-require-opt-in"}

> **課題**: [KTLC-359](https://youtrack.jetbrains.com/issue/KTLC-359)
>
> **コンポーネント**: 言語コア
>
> **互換性のない変更の種類**: ソース
>
> **概要**: 列挙型のエントリが、オプトインを必要とする列挙型のプライマリコンストラクタを暗黙的に呼び出している場合、Kotlin がエラーを報告するようになりました。移行するには、列挙型クラス、またはコンストラクタを呼び出す各列挙型エントリに `@OptIn` を追加してください。
>
> **デプロケーションサイクル**:
>
> - 2.2.20: 列挙型のエントリがオプトインを必要とする列挙型のプライマリコンストラクタを暗黙的に呼び出している場合に警告を報告
> - 2.4.0: 警告をエラーに格上げ

### 列挙型エントリにおける `inline` 修飾子の禁止 {id="forbid-inline-modifier-on-enum-entries"}

> **課題**: [KTLC-361](https://youtrack.jetbrains.com/issue/KTLC-361)
>
> **コンポーネント**: 言語コア
>
> **互換性のない変更の種類**: ソース
>
> **概要**: 列挙型のエントリに `inline` 修飾子を使用すると、Kotlin がエラーを報告するようになりました。
>
> **デプロケーションサイクル**:
>
> - 2.3.0: 列挙型のエントリに `inline` 修飾子が使用されている場合に警告を報告
> - 2.4.0: 警告をエラーに格上げ

### アノテーション呼び出しおよびパラメータのデフォルト値以外での配列リテラルの禁止 {id="prohibit-array-literals-outside-annotation-calls-and-parameter-defaults"}

> **課題**: [KTLC-369](https://youtrack.jetbrains.com/issue/KTLC-369)
>
> **コンポーネント**: 言語コア
>
> **互換性のない変更の種類**: ソース
>
> **概要**: アノテーション呼び出しおよびアノテーションパラメータのデフォルト値以外で配列リテラルを使用すると、エラーが発生するようになりました。移行するには、`arrayOf(...)` を使用してください。例えば、`Roles(["admin", "user"])` の代わりに `Roles(arrayOf("admin", "user"))` と記述します。
> 
> **デプロケーションサイクル**:
>
> - 2.3.0: アノテーション呼び出しおよびアノテーションパラメータのデフォルト値以外での配列リテラル使用に対して警告を報告
> - 2.4.0: 警告をエラーに格上げ

### CLI コンパイラモードにおける `_root_ide_package_` の禁止 {id="prohibit-rootidepackage-in-cli-compiler-mode"}

> **課題**: [KTLC-378](https://youtrack.jetbrains.com/issue/KTLC-378)
>
> **コンポーネント**: コンパイラ
>
> **互換性のない変更の種類**: ソース
>
> **概要**: CLI コンパイラモードにおいて、IDE 専用の `_root_ide_package_` 修飾子を使用すると、エラーが発生するようになりました。
>
> **デプロケーションサイクル**:
>
> - 2.3.20: CLI コンパイラモードにおける `_root_ide_package_` 参照に対して警告を報告
> - 2.4.0: 警告をエラーに格上げ

### 可変長引数変換を伴う関数参照の等価性の修正 {id="correct-equality-for-function-references-with-vararg-conversions"}

> **課題**: [KTLC-385](https://youtrack.jetbrains.com/issue/KTLC-385)
>
> **コンポーネント**: Kotlin/JVM
>
> **互換性のない変更の種類**: 振る舞い
>
> **概要**: Kotlin/JVM は、異なる変換を伴う関数参照を「等しくない」ものとして扱うようになりました。以前、Kotlin/JVM は、同じ関数参照が別の変換も使用している場合に等価性チェックにおいて可変長引数（vararg）変換を無視していました。そのため、片方だけが可変長引数変換を使用している場合でも `getDefault(::foo) == getDefaultAndVararg(::foo)` が `true` を返すことがありました。
>
> **デプロケーションサイクル**:
>
> - 2.4.0: 新しい動作を導入

### コンパニオンオブジェクトへのアクセスに対するオプトインの強制 {id="enforce-opt-in-for-companion-object-access"}

> **課題**: [KTLC-386](https://youtrack.jetbrains.com/issue/KTLC-386)
>
> **コンポーネント**: 言語コア
>
> **互換性のない変更の種類**: ソース
>
> **概要**: クラス名参照がオプトインを必要とするコンパニオンオブジェクトに解決される場合に、Kotlin がオプトインエラーを報告するようになりました。例えば、`C` がオプトインアノテーションの付いたコンパニオンオブジェクトに解決される場合、`val p = C` にはオプトインが必要になります。
>
> **デプロケーションサイクル**:
>
> - 2.3.20: コンパニオンオブジェクトへのアクセスにオプトインが必要な場合に警告を報告
> - 2.4.0: `ERROR` レベルのオプトイン要件に対して警告をエラーに格上げ

### ネストされたジェネリック引数を持つスーパータイプからの型不一致の報告 {id="report-type-mismatches-from-supertypes-with-nested-generic-arguments"}

> **課題**: [KTLC-372](https://youtrack.jetbrains.com/issue/KTLC-372)
>
> **コンポーネント**: 言語コア
>
> **互換性のない変更の種類**: ソース
>
> **概要**: ネストされたジェネリック引数を持つスーパータイプに関連する型の不一致をコンパイラが検出した際に、Kotlin がエラーを報告するようになりました。以前はコンパイラがこの不一致を見逃すことがあり、後に `ClassCastException` で失敗していました。移行するには、レシーバーのジェネリック型に一致する型引数を使用するか、コンパイラが推論できるように明示的な型引数を削除してください。
>
> **デプロケーションサイクル**:
>
> - 2.4.0: ネストされたジェネリック引数を持つスーパータイプに関連する型の不一致に対してエラーを報告

### アクセス不能な宣言を含む推論型の禁止 {id="prohibit-inferred-types-with-inaccessible-declarations"}

> **課題**: [KTLC-363](https://youtrack.jetbrains.com/issue/KTLC-363)
>
> **コンポーネント**: 言語コア
>
> **互換性のない変更の種類**: ソース
>
> **概要**: 現在のスコープでアクセス不能な宣言を含む推論型（inferred type）を使用すると、エラーが発生するようになりました。
>
> **デプロケーションサイクル**:
>
> - 2.3.0: 推論型が現在のスコープでアクセスできない宣言を含んでいる場合に警告を報告
> - 2.4.0: 警告をエラーに格上げ

## 標準ライブラリ (Standard library) {id="standard-library"}

### `kotlin.io.readLine()` 関数の非推奨化 {id="deprecate-kotlin-io-readline-function"}

> **課題**: [KTLC-394](https://youtrack.jetbrains.com/issue/KTLC-394)
>
> **コンポーネント**: kotlin-stdlib
>
> **互換性のない変更の種類**: ソース
>
> **概要**: [`kotlin.io.readLine()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io/read-line.html) 関数が非推奨になりました。`readLine()!!` の代わりに [`readln()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io/readln.html) 関数を、`readLine()` の代わりに [`readlnOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io/readln-or-null.html) 関数を使用してください。
>
> **デプロケーションサイクル**:
>
> - 2.4.0: `kotlin.io.readLine()` を使用している場合に警告を報告

### `AbstractCoroutineContextKey` および関連 API の非推奨化 {id="deprecate-abstractcoroutinecontextkey-and-related-apis"}

> **課題**: [KT-84970](https://youtrack.jetbrains.com/issue/KT-84970)
>
> **コンポーネント**: kotlin-stdlib
>
> **互換性のない変更の種類**: ソース
>
> **概要**: [`AbstractCoroutineContextKey`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/-abstract-coroutine-context-key/) クラスおよびその関連 API は Kotlin 1.3 から実験的（experimental）でしたが、エラーを誘発しやすいことが判明しました。このため、このクラスと関連する [`getPolymorphicElement()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/get-polymorphic-element.html) および [`minusPolymorphicKey()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/minus-polymorphic-key.html) 関数は非推奨になりました。
>
> **デプロケーションサイクル**:
>
> - 2.4.0: 非推奨の API を使用している場合に警告を報告

### 無限の境界に対する `Random.nextDouble()` のコントラクトの変更 {id="change-random-nextdouble-contract-for-infinite-bounds"}

> **課題**: [KT-84368](https://youtrack.jetbrains.com/issue/KT-84368)
>
> **コンポーネント**: kotlin-stdlib
>
> **互換性のない変更の種類**: 振る舞い
>
> **概要**: [`Random.nextDouble(until)`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.random/-random/next-double.html) のドキュメント化されたコントラクトにより、`until` 境界が有限であることが要求されるようになりました。有限の境界を使用してください。
>
> **デプロケーションサイクル**:
>
> - 2.4.0: 新しい動作を有効化

## ツール (Tools) {id="tools"}

### レガシー Kotlin/JS コンパイラ型選択 API の削除 {id="deprecate-legacy-kotlin-js-compiler-type-selection-apis"}

> **課題**: [KT-64275](https://youtrack.jetbrains.com/issue/KT-64275), [KT-84753](https://youtrack.jetbrains.com/issue/KT-84753)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **概要**: Kotlin 2.4.0 では、レガシー Kotlin/JS コンパイラ型の選択に関連する非推奨の Gradle API が削除されました。
> 
> さらに、`KotlinJsCompilerType` 列挙型およびコンパイラ型パラメータを持つ `KotlinProjectExtension.js()` のオーバーロードも非推奨になりました。移行するには、`js()` ターゲット宣言からコンパイラ型引数を削除し、代わりに `js {}` ブロックを使用してください。
>
> **デプロケーションサイクル**:
>
> - 1.8.0: レガシー Kotlin/JS コンパイラ型の定数を非推奨化
> - 2.4.0: 非推奨のレガシーコンパイラ型 API を削除し、`KotlinJsCompilerType` またはコンパイラ型パラメータを持つ `KotlinProjectExtension.js()` オーバーロードを使用している場合に警告を報告

### Kotlin Android エクステンションにおける `sourceSets` の非推奨化 {id="deprecate-sourcesets-in-the-kotlin-android-extension"}

> **課題**: [KT-74451](https://youtrack.jetbrains.com/issue/KT-74451)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **概要**: `KotlinAndroidProjectExtension` の `sourceSets` プロパティが非推奨になりました。移行するには、代わりに Android Gradle プラグインの `android { sourceSets { ... } }` ブロックを通じてソースセットを設定してください。
>
> **デプロケーションサイクル**:
>
> - 2.4.0: `KotlinAndroidProjectExtension` から `sourceSets` にアクセスしている場合に警告を報告

### Kotlin/Native Apple フレームワークの Consumable な構成の削除 {id="remove-consumable-configurations-for-kotlin-native-apple-frameworks"}

> **課題**: [KT-74503](https://youtrack.jetbrains.com/issue/KT-74503), [KT-82230](https://youtrack.jetbrains.com/issue/KT-82230)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **概要**: Kotlin 2.4.0 では、Kotlin/Native Apple フレームワークを外部向けのアーティファクトとして露出させる、生成された Consumable な Gradle 構成が削除されました。
>
> **デプロケーションサイクル**:
>
> - 2.4.0: Kotlin/Native Apple フレームワークの Consumable な構成を削除

### Kotlin Gradle プラグインから非推奨のタスク、コンパイル、および DSL API を削除 {id="remove-deprecated-task-compilation-and-dsl-apis-from-the-kotlin-gradle-plugin"}

> **課題**: [KT-85509](https://youtrack.jetbrains.com/issue/KT-85509)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **概要**: Kotlin 2.4.0 では、以下の非推奨の Kotlin Gradle プラグイン API が削除されました。
>
> コンパイルタスク設定 API:
>   * `KotlinJvmCompile.parentKotlinOptions`
>   * `KotlinJvmCompile.moduleName`
>   * `KotlinJvmFactory.createKotlinJvmOptions()`
>   * `KotlinCompile` および `Kotlin2JsCompile` タスクの `BaseKotlinCompile.moduleName`
> 
> Kotlin マルチプラットフォームの階層およびターゲット API:
>   * `DeprecatedKotlinTargetHierarchyDsl`
>   * `KotlinMultiplatformExtension.targetHierarchy`
>   * `KotlinTargetComponent.sourcesArtifacts`
>   * `KotlinTarget.sourceSets`
>   * `KotlinHierarchyBuilder.withoutCompilations()`
>   * `KotlinHierarchyBuilder.filterCompilations()`
>   * `KotlinHierarchyBuilder.withWasm()`
>   * `KotlinCompilation.defaultSourceSetName`
> 
> Kotlin コンパイルタスク API:
>   * `KotlinCompilation.compileKotlinTaskProvider`
>   * `KotlinCompilation.compileKotlinTask`
>
> Kotlin 依存関係ハンドラ API:
>   * `KotlinDependencyHandler.enforcedPlatform()`
>   * `KotlinDependencyHandler.platform()`
> その他の非推奨のタスクおよびエクステンション API:
>   * `KaptExtension.processors`
>   * `KotlinTest.excludes`
>   * `KotlinTest.fileResolver`
>   * `KotlinTest.execHandleFactory`
>   * `IncrementalSyncTask.destinationDir`
>
> 移行するには、これらの API の使用を中止し、非推奨の診断メッセージで推奨されている代替手段を使用してください。
>
> **デプロケーションサイクル**:
>
> - 2.4.0: 非推奨の API を削除

### 明示的な shrunk クラスパススナップショット設定の非推奨化 {id="deprecate-explicit-shrunk-classpath-snapshot-configuration"}

> **課題**: [KT-75837](https://youtrack.jetbrains.com/issue/KT-75837)
>
> **コンポーネント**: ビルドツール API 
>
> **互換性のない変更の種類**: ソース
>
> **概要**: `ClasspathSnapshotBasedIncrementalCompilationApproachParameters` における `shrunkClasspathSnapshot` 設定パラメータが非推奨になりました。shrunk クラスパススナップショットは内部的な増分コンパイルキャッシュであるため、コンパイラは増分コンパイラメタデータの `workingDirectory` 配下でこれを自動的に作成および管理するようになりました。移行するには、`shrunkClasspathSnapshot` に値を渡すのではなく、自動管理されるスナップショットファイルを使用してください。
>
> **デプロケーションサイクル**:
>
> - 2.4.0: `shrunkClasspathSnapshot` を使用している場合に警告を報告

### 冗長な ABI バリデーション Gradle DSL 要素の削除 {id="remove-redundant-abi-validation-gradle-dsl-elements"}

> **課題**: [KT-80685](https://youtrack.jetbrains.com/issue/KT-80685)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **概要**: Kotlin 2.4.0 では、[ABI バリデーション](gradle-binary-compatibility-validation.md) Gradle DSL が簡素化され、冗長な設定項目が削除されました。移行するには、`abiValidation { legacyDump { ... } }` の代わりに `abiValidation {}` で直接レポート設定を行い、`abiValidation { klib { enabled = ... } }` を削除し、`klib.keepUnsupportedTargets` の代わりに `keepLocallyUnsupportedTargets` を使用してください。
>
> **デプロケーションサイクル**:
>
> - 2.4.0: 冗長な ABI バリデーション DSL 要素を削除

### 旧式の Compose コンパイラ Gradle プラグインオプションの非推奨化 {id="deprecate-obsolete-compose-compiler-gradle-plugin-options"}

> **課題**: [KT-85343](https://youtrack.jetbrains.com/issue/KT-85343)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **概要**: Kotlin 2.4.0 では、以下の非推奨の Compose コンパイラ Gradle プラグインオプションを使用するとエラーが報告されるようになりました。
>
> * `generateFunctionKeyMetaClasses`
> * `enableIntrinsicRemember`
> * `enableNonSkippingGroupOptimization`
> * `enableStrongSkippingMode`
> * `stabilityConfigurationFile`
> * `ComposeFeatureFlag.StrongSkipping`
> * `ComposeFeatureFlag.IntrinsicRemember`
>
> 非推奨の機能オプションの代わりに `featureFlags` を、`stabilityConfigurationFile` の代わりに `stabilityConfigurationFiles` を使用してください。
>
> **デプロケーションサイクル**:
>
> - 2.0.20: `enableIntrinsicRemember`、`enableNonSkippingGroupOptimization`、および `enableStrongSkippingMode` に対して警告を報告
> - 2.1.0: `stabilityConfigurationFile` に対して警告を報告
> - 2.4.0: 警告をエラーに格上げ

### 旧式の Kotlin/Native Gradle タスク API に対するエラー報告 {id="report-errors-for-obsolete-kotlin-native-gradle-task-apis"}

> **課題**: [KT-85510](https://youtrack.jetbrains.com/issue/KT-85510)
>
> **コンポーネント**: Gradle
>
> **互換性のない変更の種類**: ソース
>
> **概要**: 以下の非推奨の Kotlin/Native Gradle タスク API を使用するとエラーが報告されるようになりました。
>
> `AbstractKotlinNativeCompile` のプロパティ:
>
> * `additionalCompilerOptions`
> * `languageSettings`
> * `progressiveMode`
>
> `KotlinNativeCompile` のプロパティ:
>
> * `moduleName`
> * `konanDataDir`
> * `konanHome`
> * `languageVersion`
> * `apiVersion`
> * `enabledLanguageFeatures`
> * `optInAnnotationsInUse`
> * `additionalCompilerOptions`
>
> `CInteropProcess` のプロパティ:
>
> * `outputFile`
> * `konanDataDir`
> * `konanHome`
> * `defFile`
>
> `KotlinNativeLink` のプロパティ:
>
> * `languageSettings`
> * `additionalCompilerOptions`
> * `konanDataDir`
> * `konanHome`
>
> さらに、`KotlinNativeLink.compilation` プロパティが削除されました。
>
> **デプロケーションサイクル**:
>
> - 2.4.0: 非推奨の Kotlin/Native Gradle タスク API に対してエラーを報告し、`KotlinNativeLink.compilation` プロパティを削除

### コンパイラ引数の値における大文字・小文字の不一致に対する警告の報告 {id="report-warnings-for-case-mismatches-in-compiler-argument-values"}

> **課題**: [KT-86059](https://youtrack.jetbrains.com/issue/KT-86059)
>
> **コンポーネント**: ビルドツール API
>
> **互換性のない変更の種類**: ソース
>
> **概要**: 固定の値セットを受け入れるコンパイラ引数は、以前は大文字・小文字の扱いが一貫していませんでした。任意の大文字・小文字を受け入れるものもあれば、完全一致を要求するものもありました。[ビルドツール API](build-tools-api.md) は、これらの値に対して任意の大文字・小文字を受け入れるようになりましたが、例えば `Case mismatch for -module-kind: expected 'commonjs', got 'CommonJS'` のように警告を報告します。移行するには、[コンパイラリファレンス](compiler-reference.md)でその引数に対してリストされている大文字・小文字を使用してください。
>
> **デプロケーションサイクル**:
>
> - 2.4.20: コンパイラ引数の値の大文字・小文字が期待される値と一致しない場合に警告を報告