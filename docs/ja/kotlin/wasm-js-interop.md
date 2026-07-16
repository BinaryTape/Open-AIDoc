[//]: # (title: JavaScript との相互運用性)

<primary-label ref="beta"/> 

Kotlin/Wasm では、Kotlin 内で JavaScript コードを使用することも、JavaScript 内で Kotlin コードを使用することも可能です。

[Kotlin/JS](js-overview.md) と同様に、Kotlin/Wasm コンパイラも JavaScript との相互運用性を備えています。Kotlin/JS の相互運用性に慣れている方であれば、Kotlin/Wasm の相互運用性も似ていることに気づくでしょう。ただし、考慮すべき重要な違いがいくつかあります。

> Kotlin/Wasm は[ベータ版](components-stability.md)です。いつでも変更される可能性があります。プロダクション環境以前のシナリオで使用してください。皆様からのフィードバックを [YouTrack](https://youtrack.jetbrains.com/issue/KT-56492) でお待ちしております。
>
{style="note"}

## Kotlin で JavaScript コードを使用する

`external` 宣言、JavaScript コードスニペットを含む関数、および `@JsModule` アノテーションを使用して、Kotlin で JavaScript コードを使用する方法について学びます。

### 外部宣言 (External declarations)

デフォルトでは、外部の JavaScript コードは Kotlin からは見えません。
Kotlin で JavaScript コードを使用するには、`external` 宣言を使用してその API を記述します。

#### JavaScript 関数

次のような JavaScript 関数を考えます：

```javascript
function greet (name) {
    console.log("Hello, " + name + "!");
}
```

これを Kotlin では `external` 関数として宣言できます：

```kotlin
external fun greet(name: String)
```

外部関数は本体（body）を持ちません。通常の Kotlin 関数と同じように呼び出すことができます：

```kotlin
fun main() {
    greet("Alice")
}
```

#### JavaScript プロパティ

次のような JavaScript のグローバル変数を考えます：

```javascript
let globalCounter = 0;
```

これを Kotlin では外部の `var` または `val` プロパティを使用して宣言できます：

```kotlin
external var globalCounter: Int
```

これらのプロパティは外部で初期化されます。Kotlin コード内で `= value` による初期化子を持つことはできません。

#### JavaScript クラス

次のような JavaScript クラスを考えます：

```javascript
class Rectangle {
    constructor (height, width) {
        this.height = height;
        this.width = width;
    }

    area () {
        return this.height * this.width;
    }
}
```

これを Kotlin では外部クラスとして使用できます：

```kotlin
external class Rectangle(height: Double, width: Double) : JsAny {
    val height: Double
    val width: Double
    fun area(): Double
}
```

`external` クラス内のすべての宣言は、暗黙的に外部のものとみなされます。

#### 外部インターフェース (External interfaces)

JavaScript オブジェクトの形状を Kotlin で記述できます。次のような JavaScript 関数とその戻り値を考えます：

```javascript
function createUser (name, age) {
    return { name: name, age: age };
}
```

この形状を Kotlin の `external interface User` 型で記述する方法を確認してください：

```kotlin
external interface User : JsAny {
    val name: String
    val age: Int
}

external fun createUser(name: String, age: Int): User
```

外部インターフェースは実行時の型情報（RTTI）を持たず、コンパイル時のみの概念です。
そのため、外部インターフェースには通常のインターフェースと比較して、いくつかの制限があります：
* `is` チェックの右辺で使用することはできません。
* クラスリテラル式（`User::class` など）で使用することはできません。
* `reified` 型引数として渡すことはできません。
* `as` による外部インターフェースへのキャストは常に成功します。

#### 外部オブジェクト (External objects)

オブジェクトを保持する次のような JavaScript 変数を考えます：

```javascript
let Counter = {
    value: 0,
    step: 1,
    increment () {
        this.value += this.step;
    }
};
```

これを Kotlin では外部オブジェクトとして使用できます：

```kotlin
external object Counter : JsAny {
    fun increment()
    val value: Int
    var step: Int
}
```

#### 外部型の階層

通常のクラスやインターフェースと同様に、他の外部クラスを拡張したり、外部インターフェースを実装したりするように外部宣言を行うことができます。
ただし、同じ型階層内で外部宣言と非外部宣言を混在させることはできません。

#### @nativeInvoke を使用した呼び出し可能な JavaScript オブジェクト
<primary-label ref="experimental-opt-in"/>

`external` 宣言（クラスまたはインターフェース）の Kotlin メンバ関数に `@nativeInvoke` アノテーションを使用することで、それを JavaScript 関数として呼び出し可能にすることができます。

このアノテーションを使用すると、Kotlin でのその関数の各呼び出しは、JavaScript オブジェクトへの直接呼び出しに変換されます：

```kotlin
import kotlin.js.nativeInvoke

@OptIn(ExperimentalWasmJsInterop::class)
external class JsAction {
    @nativeInvoke
    operator fun invoke(data: String)
}

fun main() {
    val action = JsAction() 
    action("Run task")
}
```

> `@nativeInvoke` アノテーションは、安定した相互運用性のための設計が整うまでの暫定的な解決策です。
> 現在、`@nativeInvoke` を使用すると、コンパイラは警告を報告します。
>
> {style="note"}

### JavaScript コードを含む Kotlin 関数

`= js("code")` 形式の本体を持つ関数を定義することで、Kotlin/Wasm コードに JavaScript スニペットを追加できます。

```kotlin
fun getCurrentURL(): String =
    js("window.location.href")
```

JavaScript ステートメントのブロックを実行したい場合は、文字列内のコードを波括弧 `{}` で囲みます：

```kotlin
fun setLocalSettings(value: String): Unit = js(
    """{
        localStorage.setItem('settings', value);
}"""
)
```

オブジェクトを返したい場合は、波括弧 `{}` を括弧 `()` で囲みます：

```kotlin
fun createJsUser(name: String, age: Int): JsAny =
    js("({ name: name, age: age })")
```

Kotlin/Wasm は `js()` 関数の呼び出しを特別な方法で処理しますが、その実装にはいくつかの制限があります：
* `js()` 関数の呼び出しには、文字列リテラルの引数を指定する必要があります。
* `js()` 関数の呼び出しは、関数本体の唯一の式である必要があります。
* `js()` 関数はパッケージレベルの関数からのみ呼び出すことができます。
* 関数の戻り値の型を明示的に指定する必要があります。
* `external fun` と同様に、[型](#type-correspondence)が制限されます。

Kotlin コンパイラは、生成された JavaScript ファイル内の関数にこのコード文字列を配置し、それを WebAssembly フォーマットにインポートします。
Kotlin コンパイラはこれらの JavaScript スニペットを検証しません。
JavaScript の構文エラーがある場合は、JavaScript コードを実行したときに報告されます。

> `@JsFun` アノテーションも同様の機能を持ちますが、将来的に非推奨になる可能性があります。
>
{style="note"}

### JavaScript モジュール

デフォルトでは、外部宣言は JavaScript のグローバルスコープに対応します。Kotlin ファイルに [`@JsModule` アノテーション](js-modules.md#jsmodule-annotation)を付けると、そのファイル内のすべての外部宣言は指定されたモジュールからインポートされます。

次の JavaScript コードの例を考えます：

```javascript
// users.mjs
export let maxUsers = 10;

export class User {
    constructor (username) {
        this.username = username;
    }
}
```

この JavaScript コードを Kotlin で `@JsModule` アノテーションを使用して使用します：

```kotlin
// Kotlin
@file:JsModule("./users.mjs")

external val maxUsers: Int

external class User : JsAny {
    constructor(username: String)

    val username: String
}
```

### 配列の相互運用性

JavaScript の `JsArray<T>` を Kotlin のネイティブな `Array` または `List` 型にコピーできます。同様に、これらの Kotlin 型を `JsArray<T>` にコピーすることもできます。

`JsArray<T>` を `Array<T>` に、またはその逆に変換するには、利用可能な [アダプター関数](https://github.com/Kotlin/kotlinx-browser/blob/dfbdceed314567983c98f1d66e8c2e10d99c5a55/src/wasmJsMain/kotlin/arrayCopy.kt) のいずれかを使用します。

ジェネリック型間の変換例は以下の通りです：

```kotlin
val list: `List<JsString>` =
    listOf("Kotlin", "Wasm").map { it.toJsString() }

// .toJsArray() を使用して List または Array を JsArray に変換する
val jsArray: JsArray<JsString> = list.toJsArray()

// .toArray() および .toList() を使用して Kotlin 型に戻す 
val kotlinArray: `Array<JsString>` = jsArray.toArray()
val kotlinList: `List<JsString>` = jsArray.toList()
```

型付き配列を対応する Kotlin の配列（例：`IntArray` と `Int32Array`）に変換するための同様のアダプター関数も用意されています。詳細な情報と実装については、[`kotlinx-browser` リポジトリ](https://github.com/Kotlin/kotlinx-browser/blob/dfbdceed314567983c98f1d66e8c2e10d99c5a55/src/wasmJsMain/kotlin/arrayCopy.kt) を参照してください。

型付き配列間の変換例は以下の通りです：

```kotlin
import org.khronos.webgl.*

    // ...

    val intArray: IntArray = intArrayOf(1, 2, 3)
    
    // .toInt32Array() を使用して Kotlin の IntArray を JavaScript の Int32Array に変換する
    val jsInt32Array: Int32Array = intArray.toInt32Array()
    
    // toIntArray() を使用して JavaScript の Int32Array を Kotlin の IntArray に戻す
    val kotlinIntArray: IntArray = jsInt32Array.toIntArray()
```

## JavaScript で Kotlin コードを使用する

`@JsExport` アノテーションを使用して、JavaScript で Kotlin コードを使用する方法について学びます。

### @JsExport アノテーション付きの関数

Kotlin/Wasm 関数を JavaScript コードから利用できるようにするには、`@JsExport` アノテーションを使用します：

```kotlin
// Kotlin/Wasm

@JsExport
fun addOne(x: Int): Int = x + 1
```

`@JsExport` アノテーションが付けられた Kotlin/Wasm 関数は、生成された `.mjs` モジュールの `default` エクスポートのプロパティとして表示されます。
その後、この関数を JavaScript で使用できます：

```javascript
// JavaScript

import exports from "./module.mjs"

exports.addOne(10)
```

Kotlin/Wasm コンパイラは、Kotlin コード内の任意の `@JsExport` 宣言から TypeScript 定義を生成することができます。
これらの定義は、IDE や JavaScript ツールでコードの自動補完、型チェックの補助、および JavaScript や TypeScript からの Kotlin コードの利用を容易にするために使用できます。

Kotlin/Wasm コンパイラは、`@JsExport` アノテーションが付けられたすべてのトップレベル関数を収集し、`.d.ts` ファイルに TypeScript 定義を自動的に生成します。

TypeScript 定義を生成するには、`build.gradle.kts` ファイルの `wasmJs{}` ブロックに `generateTypeScriptDefinitions()` 関数を追加します：

```kotlin
kotlin {
    wasmJs {
        binaries.executable()
        browser {
        }
        generateTypeScriptDefinitions()
    }
}
```

> Kotlin/Wasm における TypeScript 宣言ファイルの生成は[試験的（Experimental）](components-stability.md#stability-levels-explained)です。
> いつでも削除または変更される可能性があります。
>
{style="warning"}

## 型の対応関係

Kotlin/Wasm では、JavaScript 相互運用宣言のシグネチャにおいて、特定の型のみが許可されます。
これらの制限は、`external`、`= js("code")`、または `@JsExport` を使用した宣言に一律に適用されます。

Kotlin 型が JavaScript 型にどのように対応するかを確認してください：

| Kotlin                                                     | JavaScript                        |
|------------------------------------------------------------|-----------------------------------|
| `Byte`, `Short`, `Int`, `Char`, `UByte`, `UShort`, `UInt`, | `Number`                          |
| `Float`, `Double`,                                         | `Number`                          |
| `Long`, `ULong`,                                           | `BigInt`                          |
| `Boolean`,                                                 | `Boolean`                         |
| `String`,                                                  | `String`                          |
| 戻り値の位置にある `Unit`                                  | `undefined`                       |
| 関数型（例：`(String) -> Int`）                            | 関数 (Function)                   |
| `JsAny` およびそのサブタイプ                               | 任意の JavaScript 値              |
| `JsReference`                                              | Kotlin オブジェクトへの不透明な参照 |
| その他の型                                                 | サポートされていません            |

これらの型の null 許容（nullable）バージョンも使用できます。

### JsAny 型

JavaScript の値は、Kotlin では `JsAny` 型とそのサブタイプを使用して表されます。

Kotlin/Wasm 標準ライブラリは、これらの型のいくつかの表現を提供しています：
* `kotlin.js` パッケージ:
    * `JsAny`
    * `JsBoolean`, `JsNumber`, `JsString`
    * `JsArray`
    * `Promise`

また、`external` インターフェースやクラスを宣言することで、カスタムの `JsAny` サブタイプを作成することもできます。

### JsReference 型

Kotlin の値は、`JsReference` 型を使用して、不透明な参照（opaque reference）として JavaScript に渡すことができます。

例えば、次の Kotlin クラス `User` を JavaScript に公開したい場合：

```kotlin
class User(var name: String)
```

`toJsReference()` 関数を使用して `JsReference<User>` を作成し、それを JavaScript に返すことができます：

```kotlin
@JsExport
fun createUser(name: String): JsReference<User> {
    return User(name).toJsReference()
}
```

これらの参照は JavaScript で直接操作することはできず、中身のない凍結された JavaScript オブジェクトのように振る舞います。
これらのオブジェクトを操作するには、参照値をアンラップする `get()` メソッドを使用する追加の関数を JavaScript にエクスポートする必要があります：

```kotlin
@JsExport
fun setUserName(user: JsReference<User>, name: String) {
    user.get().name = name
}
```

クラスを作成し、JavaScript からその名前を変更することができます：

```javascript
import UserLib from "./userlib.mjs"

let user = UserLib.createUser("Bob");
UserLib.setUserName(user, "Alice");
```

### 型パラメータ

JavaScript 相互運用宣言は、`JsAny` またはそのサブタイプを上限境界（upper bound）として持つ場合に限り、型パラメータを持つことができます。例：

```kotlin
external fun <T : JsAny> processData(data: JsArray<T>): T
```

## 例外処理

Kotlin の `try-catch` 式を使用して、Kotlin/Wasm コードで JavaScript の例外をキャッチできます。
例外処理は以下のように機能します：

* JavaScript からスローされた例外：Kotlin 側で詳細な情報を利用できます。
  そのような例外が再び JavaScript に伝播した場合、それはもはや WebAssembly にラップされません。

* Kotlin からスローされた例外：JavaScript 側で通常の JS エラーとしてキャッチできます。

以下は、JavaScript の例外を Kotlin 側でキャッチする例です：

```kotlin
external object JSON {
    fun <T: JsAny> parse(json: String): T
}

fun main() {
    try {
        JSON.parse("an invalid JSON")
    } catch (e: JsException) {
        println("Thrown value is: ${e.thrownValue}")
        // Thrown value is: SyntaxError: Unexpected token 'a', "an invalid JSON" is not valid JSON

        println("Message: ${e.message}")
        // Message: Unexpected token 'a', "an invalid JSON" is not valid JSON

        println("Stacktrace:")
        // Stacktrace:

        // JavaScript のフルスタックトレースを出力します
        e.printStackTrace()
    }
}
```

この例外処理は、[`WebAssembly.JSTag`](https://webassembly.github.io/exception-handling/js-api/#dom-webassembly-jstag) 機能をサポートする最新のブラウザで自動的に動作します：

* Chrome 115+
* Firefox 129+
* Safari 18.4+

## Kotlin/Wasm と Kotlin/JS の相互運用性の違い

Kotlin/Wasm の相互運用性は Kotlin/JS の相互運用性と類似していますが、考慮すべき重要な違いがあります：

|                         | **Kotlin/Wasm**                                                                                                                                                                                                     | **Kotlin/JS**                                                                                                                                       |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| **外部列挙型**          | 外部列挙型クラス（external enum classes）をサポートしていません。                                                                                                                                               | 外部列挙型クラスをサポートしています。                                                                                                               |
| **型の拡張**            | 非外部型が外部型を拡張することをサポートしていません。                                                                                                                                                           | 非外部型をサポートしています。                                                                                                                     |
| **`JsName` アノテーション** | 外部宣言にアノテーションを付けた場合にのみ効果があります。                                                                                                                                                        | 通常の非外部宣言の名前を変更するために使用できます。                                                                                                 |
| **`js()` 関数**         | `js("code")` 関数の呼び出しは、パッケージレベルの関数の単一の式本体としてのみ許可されます。                                                                                                                        | `js("code")` 関数は任意のコンテキストで呼び出すことができ、`dynamic` 値を返します。                                                                 |
| **モジュールシステム**  | ES モジュールのみをサポートしています。`@JsNonModule` アノテーションに相当するものはありません。エクスポートを `default` オブジェクトのプロパティとして提供します。パッケージレベルの関数のみエクスポート可能です。 | ES モジュールとレガシーなモジュールシステムをサポートしています。名前付きの ESM エクスポートを提供します。クラスやオブジェクトのエクスポートが可能です。 |
| **型**                  | `external`、`= js("code")`、`@JsExport` のすべての相互運用宣言に対して、より厳格な型制限を一律に適用します。限定された数の[組み込み Kotlin 型と `JsAny` サブタイプ](#type-correspondence)のみを許可します。 | `external` 宣言ではすべての型を許可します。[`@JsExport` で使用できる型](js-to-kotlin-interop.md#kotlin-types-in-javascript)を制限します。            |
| **Long**                | JavaScript の `BigInt` に対応します。                                                                                                                                                                             | JavaScript ではカスタムクラスとして表示されます。                                                                                                   |
| **配列**                | 相互運用において直接はまだサポートされていません。代わりに新しい `JsArray` 型を使用できます。                                                                                                                      | JavaScript の配列として実装されます。                                                                                                             |
| **その他の型**          | Kotlin オブジェクトを JavaScript に渡すには `JsReference<>` が必要です。                                                                                                                                          | 外部宣言で非外部の Kotlin クラス型を使用できます。                                                                                                 |
| **例外処理**            | `JsException` および `Throwable` 型を使用して、任意の JavaScript 例外をキャッチできます。                                                                                                                          | `Throwable` 型を使用して JavaScript の `Error` をキャッチできます。`dynamic` 型を使用して任意の JavaScript 例外をキャッチできます。                 |
| **動的型 (Dynamic types)** | `dynamic` 型をサポートしていません。代わりに `JsAny` を使用してください（以下のサンプルコードを参照）。                                                                                                            | `dynamic` 型をサポートしています。                                                                                                                 |

> 型のない、または型の緩いオブジェクトとの相互運用性のための Kotlin/JS [動的型（dynamic type）](dynamic-type.md)は、Kotlin/Wasm ではサポートされていません。`dynamic` 型の代わりに `JsAny` 型を使用できます：
>
> ```kotlin
> // Kotlin/JS
> fun processUser(user: dynamic, age: Int) {
>     // ...
>     user.profile.updateAge(age)
>     // ...
> }
>
> // Kotlin/Wasm
> private fun updateUserAge(user: JsAny, age: Int): Unit =
>     js("{ user.profile.updateAge(age); }")
>
> fun processUser(user: JsAny, age: Int) {
>     // ...
>     updateUserAge(user, age)
>     // ...
> }
> ```
>
{style="note"}

## Web 関連のブラウザ API

[`kotlinx-browser` ライブラリ](https://github.com/kotlin/kotlinx-browser) は、以下を含む JavaScript ブラウザ API を提供するスタンドアロンライブラリです：
* `org.khronos.webgl` パッケージ:
  * `Int8Array` などの型付き配列。
  * WebGL 型。
* `org.w3c.dom.*` パッケージ:
  * DOM API 型。
* `kotlinx.browser` パッケージ:
  * `window` や `document` などの DOM API グローバルオブジェクト。

`kotlinx-browser` ライブラリの宣言を使用するには、プロジェクトのビルド設定ファイルに依存関係として追加します：

```kotlin
val wasmJsMain by getting {
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-browser:0.3")
    }
}