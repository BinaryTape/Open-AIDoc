[//]: # (title: Kotlin から JavaScript コードを使用する)

Kotlin は当初、Java プラットフォームとの容易な相互運用を目的として設計されました。Kotlin から Java クラスは Kotlin クラスとして見え、Java から Kotlin クラスは Java クラスとして見えます。

しかし、JavaScript は動的型付け言語であり、コンパイル時に型チェックを行いません。Kotlin からは [dynamic](dynamic-type.md) 型を介して、JavaScript と自由に対話できます。Kotlin の型システムの能力を最大限に活用したい場合は、JavaScript ライブラリに対して外部宣言（external declaration）を作成することで、Kotlin コンパイラや周辺ツールに認識させることができます。

## インライン JavaScript {id="inline-javascript"}

[`js()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/js.html) 関数を使用すると、Kotlin コード内に JavaScript コードをインラインで記述できます：

```kotlin
fun jsTypeOf(o: Any): String {
    return js("typeof o")
}
```

JavaScript コードのインライン記述では、以下を含む [ES2015 機能](js-project-setup.md#set-an-ecmascript-target)を完全にサポートしています：

* `const` および `let` 変数宣言
* ES クラス
* ジェネレーター
* ラムダ（[アロー関数](whatsnew21.md#support-for-generating-es2015-arrow-functions)）
* スプレッドおよびレスト演算子
* テンプレート文字列

`js` のパラメータはコンパイル時に解析され、そのまま JavaScript コードに変換されるため、文字列定数である必要があります。そのため、以下のコードは正しくありません：

```kotlin
fun jsTypeOf(o: Any): String {
    return js(getTypeof() + " o") // エラー：引数は文字列定数である必要があります
    // コンパイラは文字列の連結を評価できません
}

fun getTypeof() = "typeof"
```

代わりに、例えばレスト演算子をインラインで記述するには、文字列定数を使用します：

```kotlin
fun runSumExample() {
    val sum = js("(...nums) => nums.reduce((a, b) => a + b, 0)")
    println(sum(1, 2, 3, 4))
}
```

> `js()` の呼び出し結果は [`dynamic`](dynamic-type.md) 型となり、コンパイル時の型安全性は提供されない点に注意してください。
>
{style="note"}

## `external` 修飾子 {id="external-modifier"}

ある宣言が純粋な JavaScript で記述されていることを Kotlin に伝えるには、`external` 修飾子を付与します。コンパイラがこのような宣言を見つけると、対応するクラス、関数、またはプロパティの実装が外部（開発者によって、または [npm 依存関係](js-project-setup.md#npm-dependencies)を介して）から提供されるものと見なし、その宣言から JavaScript コードを生成しようとしません。そのため、`external` 宣言は本文（body）を持つことができません。例えば：

```kotlin
external fun alert(message: Any?): Unit

external class Node {
    val firstChild: Node

    fun append(child: Node): Node

    fun removeChild(child: Node): Node

    // など
}

external val window: Window
```

`external` 修飾子はネストされた宣言に継承されることに注意してください。このため、例に挙げた `Node` クラスでは、メンバー関数やプロパティの前に `external` 修飾子がありません。

`external` 修飾子はパッケージレベルの宣言にのみ許可されます。非 `external` クラスのメンバーを `external` として宣言することはできません。

### クラスの（静的）メンバーを宣言する {id="declare-static-members-of-a-class"}

JavaScript では、メンバーをプロトタイプまたはクラス自体のどちらかに定義できます：

``` javascript
function MyClass() { ... }
MyClass.sharedMember = function() { /* 実装 */ };
MyClass.prototype.ownMember = function() { /* 実装 */ };
```

Kotlin にはこのような構文はありませんが、Kotlin には [`companion`](object-declarations.md#companion-objects) オブジェクトがあります。Kotlin は `external` クラスのコンパニオンオブジェクトを特別な方法で処理します。オブジェクトを期待する代わりに、コンパニオンオブジェクトのメンバーをクラス自体のメンバーであると想定します。上記の例の `MyClass` は、次のように記述できます：

```kotlin
external class MyClass {
    companion object {
        fun sharedMember()
    }

    fun ownMember()
}
```

### デフォルト値を持つパラメータを宣言する {id="declare-parameters-with-default-values"}

デフォルト値を持つパラメータがある JavaScript 関数の外部宣言を記述する場合は、`definedExternally` を使用します。これにより、デフォルト値の生成を JavaScript 関数自体に委任します：

```kotlin
external fun myFunWithOptionalArgs(
    x: Int,
    y: String = definedExternally,
    z: String = definedExternally
)
```

この外部宣言により、1 つの必須引数と 2 つのオプション引数で `myFunWithOptionalArgs` を呼び出すことができ、デフォルト値は `myFunWithOptionalArgs` の JavaScript 実装によって計算されます。

### JavaScript クラスを継承する {id="extend-javascript-classes"}

JavaScript クラスは、Kotlin クラスであるかのように簡単に継承できます。`external open` クラスを定義し、それを非 `external` クラスで継承するだけです。例えば：

```kotlin
open external class Foo {
    open fun run()
    fun stop()
}

class Bar : Foo() {
    override fun run() {
        window.alert("Running!")
    }

    fun restart() {
        window.alert("Restarting")
    }
}
```

いくつか制限事項があります：

- 外部基底クラスの関数がシグネチャによってオーバーロードされている場合、派生クラスでそれをオーバーライドすることはできません。
- デフォルト値を持つパラメータを含む関数をオーバーライドすることはできません。
- 非外部クラスを外部クラスで継承することはできません。

### external インターフェース {id="external-interfaces"}

JavaScript にはインターフェースの概念がありません。ある関数がパラメータに対して `foo` と `bar` という 2 つのメソッドをサポートすることを期待する場合、実際にはそれらのメソッドを持つオブジェクトを渡すだけです。

静的型付けされた Kotlin では、インターフェースを使用してこの概念を表現できます：

```kotlin
external interface HasFooAndBar {
    fun foo()

    fun bar()
}

external fun myFunction(p: HasFooAndBar)
```

外部インターフェースの典型的なユースケースは、設定オブジェクトを記述することです。例えば：

```kotlin
external interface JQueryAjaxSettings {
    var async: Boolean

    var cache: Boolean

    var complete: (JQueryXHR, String) -> Unit

    // など
}

fun JQueryAjaxSettings(): JQueryAjaxSettings = js("{}")

external class JQuery {
    companion object {
        fun get(settings: JQueryAjaxSettings): JQueryXHR
    }
}

fun sendQuery() {
    JQuery.get(JQueryAjaxSettings().apply {
        complete = { (xhr, data) ->
            window.alert("Request complete")
        }
    })
}
```

外部インターフェースにはいくつかの制限があります：

- `is` チェックの右側で使用することはできません。 
- reified 型引数として渡すことはできません。
- クラスリテラル式（`I::class` など）で使用することはできません。
- 外部インターフェースへの `as` キャストは常に成功します。
    外部インターフェースへのキャストは、「Unchecked cast to external interface」というコンパイル時の警告を生成します。この警告は `@Suppress("UNCHECKED_CAST_TO_EXTERNAL_INTERFACE")` アノテーションで抑制できます。

    IntelliJ IDEA は `@Suppress` アノテーションを自動生成することもできます。電球アイコンまたは Alt-Enter でインテンションメニューを開き、「Unchecked cast to external interface」インスペクションの横にある小さな矢印をクリックします。ここで抑制範囲を選択すると、IDE がそれに応じてファイルにアノテーションを追加します。

### キャスト {id="casts"}

キャストが不可能な場合に `ClassCastException` を投げる ["unsafe" キャスト演算子](typecasts.md#unsafe-cast-operator) `as` に加えて、Kotlin/JS は [`unsafeCast<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/unsafe-cast.html) も提供しています。`unsafeCast` を使用すると、実行中に型チェックが**一切行われません**。例えば、次の 2 つのメソッドを考えてみましょう：

```kotlin
fun usingUnsafeCast(s: Any) = s.unsafeCast<String>()
fun usingAsOperator(s: Any) = s as String
```

これらは次のようにコンパイルされます：

```javascript
function usingUnsafeCast(s) {
    return s;
}

function usingAsOperator(s) {
    var tmp$;
    return typeof (tmp$ = s) === 'string' ? tmp$ : throwCCE();
}
```

## 等価性 {id="equality"}

Kotlin/JS は、他のプラットフォームと比較して等価性チェックに関する特定のセマンティクスを持っています。

Kotlin/JS では、Kotlin の[参照の等価性](equality.md#referential-equality)演算子（`===`）は、常に JavaScript の[厳格な等価性](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality)演算子（`===`）に変換されます。

JavaScript の `===` 演算子は、2 つの値が等しいことだけでなく、それら 2 つの値の型も等しいことをチェックします：

 ```kotlin
fun main() {
    val name = "kotlin"
    val value1 = name.substring(0, 1)
    val value2 = name.substring(0, 1)

    println(value1 === value2)
    // Kotlin/JS では 'true' を出力
    // 他のプラットフォームでは 'false' を出力
}
 ```

また、Kotlin/JS では、[`Byte`、`Short`、`Int`、`Float`、および `Double`](js-to-kotlin-interop.md#kotlin-types-in-javascript) の数値型はすべて、実行時に `Number` JavaScript 型で表されます。したがって、これら 5 つの型の値は区別できません：

 ```kotlin
fun main() {
    println(1.0 as Any === 1 as Any)
    // Kotlin/JS では 'true' を出力
    // 他のプラットフォームでは 'false' を出力
}
 ```

> Kotlin における等価性の詳細については、[等価性](equality.md)のドキュメントを参照してください。
> 
{style="tip"}