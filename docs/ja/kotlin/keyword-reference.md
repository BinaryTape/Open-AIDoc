[//]: # (title: キーワードと演算子)

## ハードキーワード（Hard keywords） {id="hard-keywords"}

以下のトークンは常にキーワードとして解釈され、識別子として使用することはできません:

 * `as`
     - [型キャスト](typecasts.md#unsafe-cast-operator)に使用されます。
     - [インポートのエイリアス](packages.md#imports)を指定します。
 * `as?` は[安全な型キャスト](typecasts.md#unsafe-cast-operator)に使用されます。
 * `break` は[ループの実行を終了](returns.md)します。
 * `class` は[クラス](classes.md)を宣言します。
 * `continue` は[最も内側のループの次のステップに進みます](returns.md)。
 * `do` は [do/while ループ](control-flow.md#while-loops)（後置条件付きループ）を開始します。
 * `else` は条件が偽の場合に実行される [if 式](control-flow.md#if-expression)の分岐を定義します。
 * `false` は [Boolean 型](booleans.md)の「偽」の値を指定します。
 * `for` は [for ループ](control-flow.md#for-loops)を開始します。
 * `fun` は[関数](functions.md)を宣言します。
 * `if` は [if 式](control-flow.md#if-expression)を開始します。
 * `in`
     - [for ループ](control-flow.md#for-loops)内で反復処理されるオブジェクトを指定します。
     - 中置演算子（infix operator）として、値が[範囲](ranges.md)、コレクション、または['contains' メソッドを定義する](operator-overloading.md#in-operator)その他のエンティティに属しているかどうかを確認するために使用されます。
     - [when 式](control-flow.md#when-expressions-and-statements)でも同じ目的で使用されます。
     - 型パラメータを[反変（contravariant）](generics.md#declaration-site-variance)としてマークします。
 * `!in`
     - 演算子として、値が[範囲](ranges.md)、コレクション、または['contains' メソッドを定義する](operator-overloading.md#in-operator)その他のエンティティに属して「いない」ことを確認するために使用されます。
     - [when 式](control-flow.md#when-expressions-and-statements)でも同じ目的で使用されます。
 * `interface` は[インターフェース](interfaces.md)を宣言します。
 * `is`
     - [値が特定の型を持っているか](typecasts.md#is-and-is-operators)をチェックします。
     - [when 式](control-flow.md#when-expressions-and-statements)でも同じ目的で使用されます。
 * `!is`
     - [値が特定の型を持って「いない」か](typecasts.md#is-and-is-operators)をチェックします。
     - [when 式](control-flow.md#when-expressions-and-statements)でも同じ目的で使用されます。
 * `null` は、いかなるオブジェクトも指していないオブジェクト参照を表す定数です。
 * `object` は[クラスとそのインスタンスを同時に](object-declarations.md)宣言します。
 * `package` は[現在のファイルのパッケージ](packages.md)を指定します。
 * `return` は[最も内側の関数または無名関数から戻ります](returns.md)。
 * `super`
     - [メソッドまたはプロパティのスーパークラス実装を参照](inheritance.md#calling-the-superclass-implementation)します。
     - [セカンダリコンストラクタからスーパークラスのコンストラクタを呼び出します](classes.md#inheritance)。
 * `this`
     - [現在のレシーバ](this-expressions.md)を参照します。
     - [セカンダリコンストラクタから同じクラスの別のコンストラクタを呼び出します](classes.md#constructors-and-initializer-blocks)。
 * `throw` は[例外をスロー](exceptions.md)します。
 * `true` は [Boolean 型](booleans.md)の「真」の値を指定します。
 * `try` は[例外処理ブロックを開始](exceptions.md)します。
 * `typealias` は[型エイリアス](type-aliases.md)を宣言します。
 * `typeof` は将来の使用のために予約されています。
 * `val` は読み取り専用の[プロパティ](properties.md)または[ローカル変数](basic-syntax.md#variables)を宣言します。
 * `var` はミュータブル（可変）な[プロパティ](properties.md)または[ローカル変数](basic-syntax.md#variables)を宣言します。
 * `when` は [when 式](control-flow.md#when-expressions-and-statements)を開始します（指定された分岐のいずれかを実行します）。
 * `while` は [while ループ](control-flow.md#while-loops)（前置条件付きループ）を開始します。

## ソフトキーワード（Soft keywords） {id="soft-keywords"}

以下のトークンは、適用可能なコンテキストにおいてのみキーワードとして機能し、他のコンテキストでは識別子として使用できます:

 * `by`
     - [インターフェースの実装を別のオブジェクトに委譲](delegation.md)します。
     - [プロパティのアクセサの実装を別のオブジェクトに委譲](delegated-properties.md)します。
 * `catch` は[特定の例外型を処理する](exceptions.md)ブロックを開始します。
 * `constructor` は[プライマリまたはセカンダリコンストラクタ](classes.md#constructors-and-initializer-blocks)を宣言します。
 * `context` は関数やプロパティの[コンテキストパラメータ](context-parameters.md)を宣言します。
 * `delegate` は[アノテーションの使用箇所ターゲット（use-site target）](annotations.md#annotation-use-site-targets)として使用されます。
 * `dynamic` は Kotlin/JS コードで[動的型（dynamic type）](dynamic-type.md)を参照します。
 * `field`
     - [明示的なバッキングフィールド（explicit backing field）](properties.md#explicit-backing-fields)を宣言します。
     - [アノテーションの使用箇所ターゲット](annotations.md#annotation-use-site-targets)として使用されます。
 * `file` は[アノテーションの使用箇所ターゲット](annotations.md#annotation-use-site-targets)として使用されます。
 * `finally` は [try ブロックの終了時に常に実行される](exceptions.md)ブロックを開始します。
 * `get`
     - [プロパティのゲッター](properties.md)を宣言します。
     - [アノテーションの使用箇所ターゲット](annotations.md#annotation-use-site-targets)として使用されます。
 * `import` は[別のパッケージの宣言を現在のファイルにインポート](packages.md)します。
 * `init` は[イニシャライザブロック](classes.md#constructors-and-initializer-blocks)を開始します。
 * `param` は[アノテーションの使用箇所ターゲット](annotations.md#annotation-use-site-targets)として使用されます。
 * `property` は[アノテーションの使用箇所ターゲット](annotations.md#annotation-use-site-targets)として使用されます。
 * `receiver` は[アノテーションの使用箇所ターゲット](annotations.md#annotation-use-site-targets)として使用されます。
 * `set`
     - [プロパティのセッター](properties.md)を宣言します。
     - [アノテーションの使用箇所ターゲット](annotations.md#annotation-use-site-targets)として使用されます。
* `setparam` は[アノテーションの使用箇所ターゲット](annotations.md#annotation-use-site-targets)として使用されます。
* `value` は `class` キーワードとともに[インラインクラス](inline-classes.md)を宣言します。
* `where` は[ジェネリック型パラメータの制約](generics.md#upper-bounds)を指定します。

## 修飾子キーワード（Modifier keywords） {id="modifier-keywords"}

以下のトークンは宣言の修飾子リストでキーワードとして機能し、他のコンテキストでは識別子として使用できます:

 * `abstract` はクラスやメンバを[抽象（abstract）](classes.md#abstract-classes)としてマークします。
 * `actual` は[マルチプラットフォームプロジェクト](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)において、プラットフォーム固有の実装を示します。
 * `annotation` は[アノテーションクラス](annotations.md)を宣言します。
 * `companion` は[コンパニオンオブジェクト](object-declarations.md#companion-objects)を宣言します。
 * `const` はプロパティを[コンパイル時定数](properties.md#compile-time-constants)としてマークします。
 * `crossinline` は[インライン関数に渡されるラムダでの非ローカルリターンを禁止](inline-functions.md#returns)します。
 * `data` はコンパイラに対し、[クラスの標準的なメンバを生成する](data-classes.md)よう指示します。
 * `enum` は[列挙型（enum）](enum-classes.md)を宣言します。
 * `expect` は宣言を[プラットフォーム固有](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)としてマークし、プラットフォームモジュールでの実装を期待します。
 * `external` は宣言が Kotlin の外部で実装されていること（[JNI](java-interop.md#using-jni-with-kotlin) 経由、または [JavaScript](js-interop.md#external-modifier) でアクセス可能）を示します。
 * `final` は[メンバのオーバーライドを禁止](inheritance.md#overriding-methods)します。
 * `infix` は関数を[中置記法（infix notation）](functions.md#infix-notation)で呼び出すことを許可します。
 * `inline` はコンパイラに対し、[呼び出し箇所で関数とそこに渡されたラムダをインライン展開する](inline-functions.md)よう指示します。
 * `inner` は[ネストしたクラス](nested-classes.md)から外側のクラスインスタンスの参照を許可します。
 * `internal` は宣言を[現在のモジュール内から参照可能](visibility-modifiers.md)としてマークします。
 * `lateinit` は[コンストラクタの外部で null 非許容プロパティを初期化](properties.md#late-initialized-properties-and-variables)できるようにします。
 * `noinline` は[インライン関数に渡されたラムダのインライン展開を無効化](inline-functions.md#noinline)します。
 * `open` は[クラスのサブクラス化やメンバのオーバーライド](classes.md#inheritance)を許可します。
 * `operator` は関数が[演算子をオーバーロードしているか、規約（convention）を実装している](operator-overloading.md)ものとしてマークします。
 * `out` は型パラメータを[共変（covariant）](generics.md#declaration-site-variance)としてマークします。
 * `override` はメンバを[スーパークラスのメンバのオーバーライド](inheritance.md#overriding-methods)としてマークします。
 * `private` は宣言を[現在のクラスまたはファイルからのみ参照可能](visibility-modifiers.md)としてマークします。
 * `protected` は宣言を[現在のクラスおよびそのサブクラスから参照可能](visibility-modifiers.md)としてマークします。
 * `public` は宣言を[どこからでも参照可能](visibility-modifiers.md)としてマークします。
 * `reified` はインライン関数の型パラメータを[実行時にアクセス可能（実体化）](inline-functions.md#reified-type-parameters)としてマークします。
 * `sealed` は[シールドクラス](sealed-classes.md)（サブクラス化が制限されたクラス）を宣言します。
 * `suspend` は関数またはラムダを中断可能（suspending）としてマークします（[コルーチン](coroutines-overview.md)として使用可能）。
 * `tailrec` は関数を[末尾再帰（tail-recursive）](functions.md#tail-recursive-functions)としてマークします（コンパイラが再帰をループに置き換えることを可能にします）。
 * `vararg` は[パラメータに可変長引数を渡す](functions.md#variable-number-of-arguments-varargs)ことを許可します。

## 特殊な識別子（Special identifiers） {id="special-identifiers"}

以下の識別子は特定のコンテキストにおいてコンパイラによって定義され、他のコンテキストでは通常の識別子として使用できます:

 * `field` は、プロパティアクセサ内で[プロパティのバッキングフィールド](properties.md#backing-fields)を参照するために使用されます。
 * `it` は、ラムダ内で[そのパラメータを暗黙的に参照する](lambdas.md#it-implicit-name-of-a-single-parameter)ために使用されます。

## 演算子と特殊記号 {id="operators-and-special-symbols"}

Kotlin は以下の演算子および特殊記号をサポートしています:

 * `+`, `-`, `*`, `/`, `%` - 算術演算子
     - `*` は [vararg パラメータに配列を渡す](functions.md#variable-number-of-arguments-varargs)ためにも使用されます（スプレッド演算子）。
 * `=`
     - 代入演算子。
     - [パラメータのデフォルト値](functions.md#parameters-with-default-values)を指定するためにも使用されます。
 * `+=`, `-=`, `*=`, `/=`, `%=` - [複合代入演算子](operator-overloading.md#augmented-assignments)。
 * `++`, `--` - [インクリメントおよびデクリメント演算子](operator-overloading.md#increments-and-decrements)。
 * `&&`, `||`, `!` - 論理「AND」、「OR」、「NOT」演算子（ビット単位の演算には、代わりに対応する[中置関数](numbers.md#bitwise-operations)を使用します）。
 * `==`, `!=` - [等値演算子](operator-overloading.md#equality-and-inequality-operators)（非プリミティブ型の場合、`equals()` の呼び出しに変換されます）。
 * `===`, `!==` - [参照等価性演算子](equality.md#referential-equality)。
 * `<`, `>`, `<=`, `>=` - [比較演算子](operator-overloading.md#comparison-operators)（非プリミティブ型の場合、`compareTo()` の呼び出しに変換されます）。
 * `[`, `]` - [インデックスアクセス演算子](operator-overloading.md#indexed-access-operator)（`get` および `set` の呼び出しに変換されます）。
 * `!!` は[式が null 非許容（non-nullable）であることをアサート](null-safety.md#not-null-assertion-operator)します。
 * `?.` は[セーフコール](null-safety.md#safe-call-operator)を実行します（レシーバが null でない場合にメソッドを呼び出すか、プロパティにアクセスします）。
 * `?:` は左辺の値が null の場合に右辺の値を取ります（[エルビス演算子](null-safety.md#elvis-operator)）。
 * `::` は[メンバ参照](lambdas.md#function-references)または[クラス参照](reflection.md#obtain-a-runtime-class)を作成します。
 * `.`
     - [ネストしたクラス](nested-classes.md)や [enum エントリ](enum-classes.md#working-with-enum-constants)を含む[メンバ](classes.md)にアクセスします。
     - [拡張](extensions.md)を定義および呼び出します。
     - 名前や[パッケージ](packages.md)を修飾（限定）します。
     - [浮動小数点数リテラル](numbers.md#floating-point-types)の整数部と小数部を区切ります。
 * `..`, `..<` は[範囲（レンジ）](ranges.md)を作成します。
 * `:` は宣言において名前と型を区切ります。
 * `?` は型を [nullable](null-safety.md#nullable-types-and-non-nullable-types) としてマークします。
 * `->`
     - [ラムダ式](lambdas.md#lambda-expression-syntax)のパラメータと本体を区切ります。
     - [関数型](lambdas.md#function-types)のパラメータと戻り値の型宣言を区切ります。
     - [when 式](control-flow.md#when-expressions-and-statements)の分岐の条件と本体を区切ります。
 * `@`
     - [アノテーション](annotations.md#usage)を導入します。
     - [ループラベル](returns.md#break-and-continue-labels)を導入または参照します。
     - [ラムダラベル](returns.md#return-to-labels)を導入または参照します。
     - [外側のスコープの 'this' 式](this-expressions.md#qualified-this)を参照します。
     - [外側のスーパークラス](inheritance.md#calling-the-superclass-implementation)を参照します。
 * `;` は同一行にある複数の文を区切ります。
 * `$` は[文字列テンプレート](strings.md#string-templates)内で変数または式を参照します。
 * `_`
     - [ラムダ式](lambdas.md#underscore-for-unused-variables)で未使用のパラメータを代用します。
     - [分解宣言](destructuring-declarations.md#underscore-for-unused-variables)で未使用のパラメータを代用します。

演算子の優先順位については、Kotlin 文法の[こちらのドキュメント](https://kotlinlang.org/grammar/#expressions)を参照してください。