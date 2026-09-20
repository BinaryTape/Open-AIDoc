[//]: # (title: キーワードと演算子)

## ハードキーワード {id="hard-keywords"}

以下のトークンは常にキーワードとして解釈され、識別子として使用することはできません：

 * `as`
     - [型キャスト](typecasts.md#unsafe-cast-operator)に使用されます。
     - [インポートの別名](packages.md#imports)を指定します。
 * `as?` は[セーフキャスト](typecasts.md#unsafe-cast-operator)に使用されます。
 * `break` は[ループの実行を終了](returns.md)します。
 * `class` は[クラス](classes.md)を宣言します。
 * `continue` は[直近の囲っているループの次のステップに進みます](returns.md)。
 * `do` は [do/while ループ](control-flow.md#while-loops)（後置条件付きループ）を開始します。
 * `else` は、条件が偽（false）の場合に実行される [if 式](control-flow.md#if-expression)の分岐を定義します。
 * `false` は [Boolean 型](booleans.md)の「偽」の値を指定します。
 * `for` は [for ループ](control-flow.md#for-loops)を開始します。
 * `fun` は[関数](functions.md)を宣言します。
 * `if` は [if 式](control-flow.md#if-expression)を開始します。
 * `in`
     - [for ループ](control-flow.md#for-loops)で反復処理されるオブジェクトを指定します。
     - 値が[範囲](ranges.md)、コレクション、または ['contains' メソッドを定義](operator-overloading.md#in-operator)しているその他のエンティティに属しているかを確認するための中置演算子として使用されます。
     - [when 式](control-flow.md#when-expressions-and-statements)内でも同じ目的で使用されます。
     - 型パラメータを[反変（contravariant）](generics.md#declaration-site-variance)としてマークします。
 * `!in`
     - 値が[範囲](ranges.md)、コレクション、または ['contains' メソッドを定義](operator-overloading.md#in-operator)しているその他のエンティティに属して「いない」かを確認するための演算子として使用されます。
     - [when 式](control-flow.md#when-expressions-and-statements)内でも同じ目的で使用されます。
 * `interface` は[インターフェース](interfaces.md)を宣言します。
 * `is`
     - [値が特定の型であるか](typecasts.md#is-and-is-operators)を確認します。
     - [when 式](control-flow.md#when-expressions-and-statements)内でも同じ目的で使用されます。
 * `!is`
     - [値が特定の型ではないか](typecasts.md#is-and-is-operators)を確認します。
     - [when 式](control-flow.md#when-expressions-and-statements)内でも同じ目的で使用されます。
 * `null` は、いかなるオブジェクトも指していないオブジェクト参照を表す定数です。
 * `object` は[クラスとそのインスタンスを同時に](object-declarations.md)宣言します。
 * `package` は[現在のファイルのパッケージ](packages.md)を指定します。
 * `return` は[直近の囲っている関数または無名関数から戻ります](returns.md)。
 * `super`
     - [メソッドまたはプロパティのスーパークラスの実装を参照](inheritance.md#calling-the-superclass-implementation)します。
     - [セカンダリコンストラクタからスーパークラスのコンストラクタを呼び出し](classes.md#inheritance)ます。
 * `this`
     - [現在のレシーバ](this-expressions.md)を参照します。
     - [セカンダリコンストラクタから同じクラスの別のコンストラクタを呼び出し](classes.md#constructors-and-initializer-blocks)ます。
 * `throw` は[例外をスロー](exceptions.md)します。
 * `true` は [Boolean 型](booleans.md)の「真」の値を指定します。
 * `try` は[例外処理ブロックを開始](exceptions.md)します。
 * `typealias` は[型エイリアス](type-aliases.md)を宣言します。
 * `typeof` は将来の使用のために予約されています。
 * `val` は読み取り専用の[プロパティ](properties.md)または[ローカル変数](basic-syntax.md#variables)を宣言します。
 * `var` は可変な[プロパティ](properties.md)または[ローカル変数](basic-syntax.md#variables)を宣言します。
 * `when` は [when 式](control-flow.md#when-expressions-and-statements)を開始します（指定された分岐のいずれかを実行します）。
 * `while` は [while ループ](control-flow.md#while-loops)（前置条件付きループ）を開始します。

## ソフトキーワード {id="soft-keywords"}

以下のトークンは、適用可能なコンテキストではキーワードとして機能しますが、それ以外のコンテキストでは識別子として使用できます：

 * `by`
     - [インターフェースの実装を別のオブジェクトに委譲](delegation.md)します。
     - [プロパティのアクセサの実装を別のオブジェクトに委譲](delegated-properties.md)します。
 * `catch` は[特定の例外型を処理する](exceptions.md)ブロックを開始します。
 * `constructor` は[プライマリまたはセカンダリコンストラクタ](classes.md#constructors-and-initializer-blocks)を宣言します。
 * `context` は関数やプロパティの[コンテキストパラメータ](context-parameters.md)を宣言します。
 * `delegate` は[アノテーションの使用箇所ターゲット（use-site target）](annotations.md#annotation-use-site-targets)として使用されます。
 * `dynamic` は Kotlin/JS コードにおいて [dynamic 型](dynamic-type.md)を参照します。
 * `field`
     - [明示的なバッキングフィールド](properties.md#explicit-backing-fields)を宣言します。
     - [アノテーションの使用箇所ターゲット](annotations.md#annotation-use-site-targets)として使用されます。
 * `file` は[アノテーションの使用箇所ターゲット](annotations.md#annotation-use-site-targets)として使用されます。
 * `finally` は [try ブロックを抜ける際に常に実行される](exceptions.md)ブロックを開始します。
 * `get`
     - [プロパティのゲッター](properties.md)を宣言します。
     - [アノテーションの使用箇所ターゲット](annotations.md#annotation-use-site-targets)として使用されます。
 * `import` は[別のパッケージからの宣言を現在のファイルにインポート](packages.md)します。
 * `init` は[初期化ブロック](classes.md#constructors-and-initializer-blocks)を開始します。
 * `param` は[アノテーションの使用箇所ターゲット](annotations.md#annotation-use-site-targets)として使用されます。
 * `property` は[アノテーションの使用箇所ターゲット](annotations.md#annotation-use-site-targets)として使用されます。
 * `receiver` は[アノテーションの使用箇所ターゲット](annotations.md#annotation-use-site-targets)として使用されます。
 * `set`
     - [プロパティのセッター](properties.md)を宣言します。
     - [アノテーションの使用箇所ターゲット](annotations.md#annotation-use-site-targets)として使用されます。
* `setparam` は[アノテーションの使用箇所ターゲット](annotations.md#annotation-use-site-targets)として使用されます。
* `value` は `class` キーワードと共に[インラインクラス](inline-classes.md)を宣言します。
* `where` は[ジェネリック型パラメータの制約](generics.md#upper-bounds)を指定します。

## 修飾子キーワード {id="modifier-keywords"}

以下のトークンは、宣言の修飾子リスト内ではキーワードとして機能しますが、それ以外のコンテキストでは識別子として使用できます：

 * `abstract` はクラスまたはメンバを[抽象（abstract）](classes.md#abstract-classes)としてマークします。
 * `actual` は[マルチプラットフォームプロジェクト](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)において、プラットフォーム固有の実装であることを示します。
 * `annotation` は[アノテーションクラス](annotations.md)を宣言します。
 * `companion` は[コンパニオンオブジェクト](object-declarations.md#companion-objects)を宣言します。
 * `const` はプロパティを[コンパイル時定数](properties.md#compile-time-constants)としてマークします。
 * `crossinline` は[インライン関数に渡されるラムダ内での非ローカルリターン](inline-functions.md#returns)を禁止します。
 * `data` はコンパイラに対して、[クラスの標準的なメンバを生成](data-classes.md)するよう指示します。
 * `enum` は[列挙型（enumeration）](enum-classes.md)を宣言します。
 * `expect` は宣言を[プラットフォーム固有](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)としてマークし、プラットフォームモジュールでの実装を期待します。
 * `external` は宣言が Kotlin 以外（[JNI](java-interop.md#using-jni-with-kotlin) または [JavaScript](js-interop.md#external-modifier) 経由でアクセス可能）で実装されていることを示します。
 * `final` は[メンバのオーバーライド](inheritance.md#overriding-methods)を禁止します。
 * `infix` は[中置記法（infix notation）](functions.md#infix-notation)を使用した関数の呼び出しを許可します。
 * `inline` は呼び出し箇所で[関数とその関数に渡されたラムダをインライン展開](inline-functions.md)するようコンパイラに指示します。
 * `inner` は[ネストしたクラス](nested-classes.md)から外部クラスのインスタンスを参照できるようにします。
 * `internal` は宣言が[現在のモジュール内でのみ見える](visibility-modifiers.md)ようにマークします。
 * `lateinit` は[コンストラクタ以外での非 null プロパティの初期化](properties.md#late-initialized-properties-and-variables)を許可します。
 * `noinline` は[インライン関数に渡されるラムダのインライン展開](inline-functions.md#noinline)をオフにします。
 * `open` は[クラスの継承またはメンバのオーバーライド](classes.md#inheritance)を許可します。
 * `operator` は関数が[演算子をオーバーロード、または規約（convention）を実装](operator-overloading.md)しているものとしてマークします。
 * `out` は型パラメータを[共変（covariant）](generics.md#declaration-site-variance)としてマークします。
 * `override` はメンバが[スーパークラスのメンバをオーバーライド](inheritance.md#overriding-methods)していることを示します。
 * `private` は宣言を[現在のクラスまたはファイル内でのみ見える](visibility-modifiers.md)ようにマークします。
 * `protected` は宣言を[現在のクラスとそのサブクラス内でのみ見える](visibility-modifiers.md)ようにマークします。
 * `public` は宣言が[どこからでも見える](visibility-modifiers.md)ようにマークします。
 * `reified` はインライン関数の型パラメータに[実行時にアクセス可能](inline-functions.md#reified-type-parameters)であるようにマークします。
 * `sealed` は[封印された（sealed）クラス](sealed-classes.md)（継承が制限されたクラス）を宣言します。
 * `suspend` は関数またはラムダを中断可能（suspending）としてマークします（[コルーチン](coroutines-overview.md)として使用可能）。
 * `tailrec` は関数を[末尾再帰（tail-recursive）](functions.md#tail-recursive-functions)としてマークします（コンパイラが再帰を反復に置き換えることを許可します）。
 * `vararg` は[パラメータに対して可変個の引数を渡すこと](functions.md#variable-number-of-arguments-varargs)を許可します。

## 特殊な識別子 {id="special-identifiers"}

以下の識別子は特定のコンテキストでコンパイラによって定義され、それ以外のコンテキストでは通常の識別子として使用できます：

 * `field` はプロパティアクセサ内で、その[プロパティのバッキングフィールド](properties.md#backing-fields)を参照するために使用されます。
 * `it` はラムダ内で、[そのパラメータを暗黙的に参照](lambdas.md#it-implicit-name-of-a-single-parameter)するために使用されます。

## 演算子と特殊記号 {id="operators-and-special-symbols"}

Kotlin は以下の演算子と特殊記号をサポートしています：

 * `+`, `-`, `*`, `/`, `%` - 数学演算子
     - `*` は[配列を vararg パラメータに渡す](functions.md#variable-number-of-arguments-varargs)ためにも使用されます。
 * `=`
     - 代入演算子。
     - [パラメータのデフォルト値](functions.md#parameters-with-default-values)を指定するために使用されます。
 * `+=`, `-=`, `*=`, `/=`, `%=` - [代入演算子の拡張（augmented assignment operators）](operator-overloading.md#augmented-assignments)。
 * `++`, `--` - [インクリメントおよびデクリメント演算子](operator-overloading.md#increments-and-decrements)。
 * `&&`, `||`, `!` - 論理 'and', 'or', 'not' 演算子（ビット演算には、対応する[中置関数](numbers.md#bitwise-operations)を代わりに使用してください）。
 * `==`, `!=` - [等価性演算子](operator-overloading.md#equality-and-inequality-operators)（非プリミティブ型の場合、`equals()` の呼び出しに変換されます）。
 * `===`, `!==` - [参照等価性演算子](equality.md#referential-equality)。
 * `<`, `>`, `<=`, `>=` - [比較演算子](operator-overloading.md#comparison-operators)（非プリミティブ型の場合、`compareTo()` の呼び出しに変換されます）。
 * `[`, `]` - [インデックスアクセス演算子](operator-overloading.md#indexed-access-operator)（`get` および `set` の呼び出しに変換されます）。
 * `!!` は[式が非 null であることをアサート](null-safety.md#not-null-assertion-operator)します。
 * `?.` は[セーフコール](null-safety.md#safe-call-operator)を実行します（レシーバが非 null の場合にメソッドを呼び出すか、プロパティにアクセスします）。
 * `?:` は左側の値が null の場合に右側の値をとります（[エルビス演算子](null-safety.md#elvis-operator)）。
 * `::` は[メンバ参照](reflection.md#function-references)または[クラス参照](reflection.md#class-references)を作成します。
 * `.`
     - [ネストしたクラス](nested-classes.md)や[列挙型エントリ](enum-classes.md#working-with-enum-constants)を含む[メンバ](classes.md)にアクセスします。
     - [拡張（extensions）](extensions.md)を定義および呼び出します。
     - 名前や[パッケージ](packages.md)を修飾（限定）します。
     - [浮動小数点リテラル](numbers.md#floating-point-types)の整数部と小数を区切ります。
 * `..`, `..<` は[範囲](ranges.md)を作成します。
 * `:` は宣言において名前と型を区切ります。
 * `?` は型を[nullable（ヌル許容）](null-safety.md#nullable-types-and-non-nullable-types)としてマークします。
 * `->`
     - [ラムダ式](lambdas.md#lambda-expression-syntax)のパラメータと本体を区切ります。
     - [関数型](lambdas.md#function-types)のパラメータと戻り値型の宣言を区切ります。
     - [when 式](control-flow.md#when-expressions-and-statements)の分岐の条件と本体を区切ります。
 * `@`
     - [アノテーション](annotations.md#usage)を導入します。
     - [ループラベル](returns.md#break-and-continue-labels)を導入または参照します。
     - [ラムダラベル](returns.md#return-to-labels)を導入または参照します。
     - [外部スコープからの 'this' 式](this-expressions.md#qualified-this)を参照します。
     - [外部のスーパークラス](inheritance.md#calling-the-superclass-implementation)を参照します。
 * `;` は同一ライン上の複数の文を区切ります。
 * `$` は[文字列テンプレート](strings.md#string-templates)内で変数または式を参照します。
 * `_`
     - [ラムダ式](lambdas.md#underscore-for-unused-variables)において使用しないパラメータの代わりに使用します。
     - [分解宣言](destructuring-declarations.md#underscore-for-unused-variables)において使用しないパラメータの代わりに使用します。

演算子の優先順位については、Kotlin 文法の[こちらのレファレンス](https://kotlinlang.org/grammar/#expressions)を参照してください。