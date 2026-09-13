[//]: # (title: JavaScript から Kotlin コードを使用する)

選択された [JavaScript モジュール](js-modules.md)システムに応じて、Kotlin/JS コンパイラは異なる出力を生成します。
しかし、一般的に Kotlin コンパイラは通常の JavaScript のクラス、関数、プロパティを生成するため、JavaScript コードから自由に利用できます。
ただし、いくつか注意すべき細かい点があります。

## plain モードにおいて個別の JavaScript オブジェクトに宣言を分離する {id="isolating-declarations-in-a-separate-javascript-object-in-plain-mode"}

モジュール形式を明示的に `plain` に設定した場合、Kotlin は現在のモジュールのすべての Kotlin 宣言を含むオブジェクトを作成します。
これはグローバルオブジェクトを汚染するのを防ぐために行われます。つまり、`myModule` というモジュールの場合、すべての宣言は `myModule` オブジェクトを介して JavaScript から利用可能になります。例えば：

```kotlin
fun foo() = "Hello"
```

この関数は JavaScript から次のように呼び出すことができます：

```javascript
alert(myModule.foo());
```

コンパイルターゲットとして [UMD](https://github.com/umdjs/umd)（`browser` および `nodejs` ターゲットの両方でデフォルトの設定）、[ESM](https://tc39.es/ecma262/#sec-modules)、[CommonJS](https://nodejs.org/api/modules.html#modules-commonjs-modules)、[AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) などの JavaScript モジュールを使用する場合、このように関数を直接呼び出す手法は適用されません。
これらの場合、宣言は選択された JavaScript モジュールシステムに従って公開されます。
例えば、UMD、ESM、または CommonJS を使用する場合、呼び出し側は次のようになります：

```javascript
alert(require('myModule').foo());
```

JavaScript モジュールシステムの詳細については、[JavaScript モジュール](js-modules.md)を参照してください。

## パッケージ構造 {id="package-structure"}

ほとんどのモジュールシステム（CommonJS、Plain、UMD）において、Kotlin はそのパッケージ構造を JavaScript に公開します。
ルートパッケージ以外で宣言を定義する場合、JavaScript では完全修飾名（fully qualified names）を使用する必要があります。
例えば：

```kotlin
package my.qualified.packagename

fun foo() = "Hello"
```

例えば、UMD や CommonJS を使用する場合、呼び出し側は次のようになります：

```javascript
alert(require('myModule').my.qualified.packagename.foo())
```

モジュールシステムの設定として `plain` を使用している場合、呼び出し側は次のようになります：

```javascript
alert(myModule.my.qualified.packagename.foo());
```

ECMAScript モジュール（ESM）をターゲットにする場合、アプリケーションのバンドルサイズを改善し、ESM パッケージの典型的なレイアウトに合わせるため、パッケージ情報は保持されません。
この場合、ES モジュールでの Kotlin 宣言の利用は次のようになります：

```javascript
import { foo } from 'myModule';

alert(foo());
```

### `@JsName` アノテーション {id="jsname-annotation"}

場合によっては（例えば、オーバーロードをサポートするため）、Kotlin コンパイラは JavaScript コード内で生成される関数や属性の名前をマングル（難読化・加工）します。
生成される名前を制御するには、`@JsName` アノテーションを使用できます：

```kotlin
// モジュール 'kjs'
class Person(val name: String) {
    fun hello() {
        println("Hello $name!")
    }

    @JsName("helloWithGreeting")
    fun hello(greeting: String) {
        println("$greeting $name!")
    }
}
```

これで、JavaScript からこのクラスを次のように使用できます：

```javascript
// 必要に応じて、選択したモジュールシステムに従って 'kjs' をインポートしてください
var person = new kjs.Person("Dmitry");   // モジュール 'kjs' を参照
person.hello();                          // "Hello Dmitry!" を出力
person.helloWithGreeting("Servus");      // "Servus Dmitry!" を出力
```

`@JsName` アノテーションを指定しなかった場合、対応する関数の名前には、関数のシグネチャから計算されたサフィックス（例えば `hello_61zpoe$`）が含まれます。

Kotlin コンパイラがマングリングを適用しないケースがいくつかあることに注意してください：
- `external` 宣言はマングルされません。
- `external` クラスを継承した非 `external` クラス内のオーバーライドされた関数はマングルされません。

`@JsName` のパラメータは、有効な識別子である定数文字列リテラルである必要があります。
識別子ではない文字列を `@JsName` に渡そうとすると、コンパイラはエラーを報告します。
次の例はコンパイルエラーになります：

```kotlin
@JsName("new C()")   // ここでエラー
external fun newC()
```

### `@JsExport` アノテーション {id="jsexport-annotation"}
<primary-label ref="experimental-general"/>

トップレベルの宣言（クラス、インターフェース、関数など）に `@JsExport` アノテーションを適用することで、Kotlin の宣言を JavaScript または TypeScript から利用できるようにします。このアノテーションは、Kotlin で指定された名前ですべてのネストされた宣言をエクスポートします。

例えば、ネストされたクラスと名前付きコンパニオンオブジェクトを持つ Kotlin インターフェースをエクスポートする方法は次のとおりです：

```kotlin
@JsExport
interface Identity {
     class Metadata(val tag: String)

    companion object Registry {
        val defaultTag = "GUEST"
    }
}
```

現在、`@JsExport` アノテーションは、関数を JavaScript から見えるようにするための唯一の方法です。

`@JsExport` アノテーションは以下でも利用可能です：

* マルチプラットフォームプロジェクトの共通コード。これは JavaScript ターゲット向けにコンパイルする場合にのみ効果があり、プラットフォーム固有ではない Kotlin 宣言もエクスポートできるようにします。
* 生成およびエクスポートされる関数の名前を指定するための [`@JsName` アノテーション](#jsname-annotation)との併用。これは、エクスポートにおける曖昧さ（同名の関数のオーバーロードなど）を解決するのに役立ちます。
* `@file:JsExport` を使用したファイルレベルでの適用。

#### 値クラスのエクスポート {id="export-value-classes"}

Kotlin の [インライン値クラス（inline value classes）](inline-classes.md)を、通常の TypeScript クラスとしてエクスポートできます。

値クラスをエクスポートするには、Kotlin 側で `@JsExport` アノテーションを付加します：

```kotlin
// Kotlin
@JsExport
@JvmInline
value class Email(val address: String) {
    init { require(address.contains("@")) { "Invalid email" } }
}

@JsExport
class AuthService {
    suspend fun login(email: Email): String = ...
}
```

TypeScript 側からは、通常のクラスのように見えます：

```typescript
// TypeScript
import { AuthService, Email } from "..."
const auth = new AuthService();

console.log(await auth.login(new Email("jane@example.com"))); 
// "Welcome, jane@example.com!"
console.log(await auth.login(new Email("not-an-email"))); 
// "Invalid email"
```

#### 中断ラムダ式のエクスポート {id="export-suspending-lambdas"}

Kotlin の[中断ラムダ式（suspending lambda expressions）](lambdas.md#lambda-expressions-and-anonymous-functions)を JavaScript の [async 関数](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)としてエクスポートできます：

1. この機能を有効にするには、`build.gradle.kts` ファイルに以下のコンパイラオプションを追加します：

    ```kotlin
    kotlin {
        js {
            compilations.all {
                compileTaskProvider.configure {
                    compilerOptions {
                        freeCompilerArgs.add("-Xsuspend-lambda-exporting")
                    }
                }
            }
        }
    }
    ```

2. 関連する Kotlin 宣言に `@JsExport` アノテーションを付加します：

    ```kotlin
    // Kotlin
    @JsExport
    class TaskRunner {
        suspend fun runTask(task: suspend () -> String): String {
            return task()
        }
    }
    ```

3. TypeScript 側では、`suspend` ラムダは通常の `async` 関数にマッピングされます：

    ```typescript
    // TypeScript
    import { TaskRunner } from "..."
    
    const runner = new TaskRunner();
    const result = await runner.runTask(async () => "done");
    console.log(result); // "done"
    ```

### `@JsNoRuntime` アノテーション {id="jsnoruntime-annotation"}

`@JsNoRuntime` アノテーションを使用して、Kotlin インターフェースを JavaScript/TypeScript にエクスポートできます。
これにより、通常の TypeScript インターフェースへの直接的なマッピングが可能になります。

例えば、Kotlin マルチプラットフォームプロジェクトから Kotlin インターフェースをエクスポートするには：

1. 共通コードの Kotlin インターフェースに `@JsNoRuntime` を付加します：

    ```kotlin
    // commonMain
    import kotlin.js.JsNoRuntime
    
    @JsNoRuntime
    expect interface DataProcessor {
        fun process(data: String): Int 
    }
    ```

2. JS 固有のソースコードで、`actual` 実装に `@JsNoRuntime` を付加します：

    ```kotlin
    // jsMain
    import kotlin.js.JsNoRuntime
    
    @JsNoRuntime
    actual interface DataProcessor {
        actual fun process(data: String): Int
    } 
    ```
    
3. TypeScript 側では、インターフェースは通常の TypeScript インターフェースにマッピングされます：
    
    ```typescript
    // 生成された .d.ts
    export interface DataProcessor {
        process(data: string): number;
    }
    ```

Kotlin マルチプラットフォームプロジェクトにおける一般的なルールは以下の通りです：

* `expect` と `actual` の両方のインターフェース宣言に `@JsNoRuntime` を付加する必要があります。唯一の例外は、プラットフォーム固有のコードの `actual` 側における、アノテーションを必要としない `external` 実装です。
* `expect` 側の共通コードで `external` インターフェース宣言を使用することは禁止されています。代わりに、`@JsNoRuntime` が付加された通常のインターフェースを使用してください。

`@JsNoRuntime` を使用した Kotlin インターフェースのエクスポートにはいくつかの制限があります。このアノテーションは以下の場合には使用できません：

* すでにデフォルトで `@JsNoRuntime` があるかのように動作する `external` インターフェース。追加するとコンパイラの警告が発生します。
* `is` および `as` による型チェック。
* [`::class` 構文](js-reflection.md)を使用するクラス参照。
* [具体化された型引数（reified type argument）](inline-functions.md#reified-type-parameters)として渡されるインターフェース。

### `@JsStatic` {id="jsstatic"}
<primary-label ref="experimental-general"/>

`@JsStatic` アノテーションは、ターゲットとなる宣言に対して追加の静的メソッドを生成するようコンパイラに指示します。
これにより、Kotlin コードの静的メンバーを JavaScript で直接使用できるようになります。

`@JsStatic` アノテーションは、名前付きオブジェクト（named object）内で定義された関数、およびクラスやインターフェース内で宣言されたコンパニオンオブジェクト内の関数に適用できます。
このアノテーションを使用すると、コンパイラはオブジェクトの静的メソッドと、オブジェクト自体のインスタンスメソッドの両方を生成します。例えば：

```kotlin
// Kotlin
class C {
    companion object {
        @JsStatic
        fun callStatic() {}
        fun callNonStatic() {}
    }
}
```

これで、JavaScript において `callStatic()` 関数は静的になりますが、`callNonStatic()` 関数は静的ではありません：

```javascript
// JavaScript
C.callStatic();              // 動作する。静的関数にアクセス
C.callNonStatic();           // エラー。生成された JavaScript では静的関数ではない
C.Companion.callStatic();    // インスタンスメソッドは残る
C.Companion.callNonStatic(); // これが唯一の動作する方法
```

また、オブジェクトまたはコンパニオンオブジェクトのプロパティに `@JsStatic` アノテーションを適用することもでき、そのゲッターおよびセッターメソッドを、そのオブジェクトまたはコンパニオンオブジェクトを含むクラスの静的メンバーにすることができます。

この機能は[試験的](components-stability.md#stability-levels-explained)です。課題トラッカー [YouTrack](https://youtrack.jetbrains.com/issue/KT-18891/JS-provide-a-way-to-declare-static-members-JsStatic) でフィードバックを共有してください。

### Kotlin の `Long` 型を表現するために `BigInt` 型を使用する {id="use-bigint-type-to-represent-kotlin-s-long-type"}
<primary-label ref="experimental-general"/>

Kotlin/JS は、モダンな JavaScript（ES2020）へコンパイルする際、Kotlin の `Long` 値を表現するために JavaScript の組み込みの `BigInt` 型を使用します。

`BigInt` 型のサポートを有効にするには、`build.gradle(.kts)` ファイルに以下のコンパイラオプションを追加する必要があります：

```kotlin
// build.gradle.kts
kotlin {
    js {
        ...
        compilerOptions {
            freeCompilerArgs.add("-Xes-long-as-bigint")
        }
    }
}
```

この機能は[試験的](components-stability.md#stability-levels-explained)です。課題トラッカー [YouTrack](https://youtrack.jetbrains.com/issue/KT-57128/KJS-Use-BigInt-to-represent-Long-values-in-ES6-mode) でフィードバックを共有してください。

#### エクスポートされた宣言で `Long` を使用する {id="use-long-in-exported-declarations"}

Kotlin の `Long` 型は JavaScript の `BigInt` 型にコンパイルできるため、Kotlin/JS は `Long` 値の JavaScript へのエクスポートをサポートしています。

この機能を有効にするには：

1. Kotlin/JS での `Long` のエクスポートを許可します。`build.gradle(.kts)` ファイルの `freeCompilerArgs` 属性に以下のコンパイラオプションを追加してください：

     ```kotlin
    // build.gradle.kts
    kotlin {
        js {
            ...
            compilerOptions { 
                freeCompilerArgs.add("-XXLanguage:+JsAllowLongInExportedDeclarations")
            }
        }
    }
    ```

2. `BigInt` 型を有効にします。有効化の方法については、[Kotlin の `Long` 型を表現するために `BigInt` 型を使用する](#kotlin-の-long-型を表現するために-bigint-型を使用する)を参照してください。

### Kotlin の `LongArray` 型を表現するために `BigInt64Array` 型を使用する {id="use-bigint64array-type-to-represent-kotlin-s-longarray-type"}
<primary-label ref="experimental-general"/>

Kotlin/JS は、JavaScript へコンパイルする際、Kotlin の `LongArray` 値を表現するために JavaScript の組み込みの `BigInt64Array` 型を使用できます。

`BigInt64Array` 型のサポートを有効にするには、`build.gradle(.kts)` ファイルに以下のコンパイラオプションを追加します：

```kotlin
// build.gradle.kts
kotlin {
    js {
        ...
        compilerOptions {
            freeCompilerArgs.add("-Xes-long-as-bigint")
        }
    }
}
```

この機能は[試験的](components-stability.md#stability-levels-explained)です。課題トラッカー [YouTrack](https://youtrack.jetbrains.com/issue/KT-79284/Use-BigInt64Array-for-LongArray) でフィードバックを共有してください。

## JavaScript における Kotlin の型 {id="kotlin-types-in-javascript"}

Kotlin の型が JavaScript の型にどのようにマッピングされるかを確認してください：

| Kotlin                                                           | JavaScript                | 備考                                                                                                |
|------------------------------------------------------------------|---------------------------|---------------------------------------------------------------------------------------------------------|
| `Byte`, `Short`, `Int`, `Float`, `Double`                        | `Number`                  |                                                                                                         |
| `Char`                                                           | `Number`                  | 数値は文字コードを表します。                                                             |
| `Long`                                                           | `BigInt`                  | [`-Xes-long-as-bigint` コンパイラオプション](compiler-reference.md#xes-long-as-bigint)の設定が必要です。 |
| `Boolean`                                                        | `Boolean`                 |                                                                                                         |
| `String`                                                         | `String`                  |                                                                                                         |
| `Array`                                                          | `Array`                   |                                                                                                         |
| `ByteArray`                                                      | `Int8Array`               |                                                                                                         |
| `ShortArray`                                                     | `Int16Array`              |                                                                                                         |
| `IntArray`                                                       | `Int32Array`              |                                                                                                         |
| `CharArray`                                                      | `UInt16Array`             | `$type$ == "CharArray"` というプロパティを持ちます。                                                           |
| `FloatArray`                                                     | `Float32Array`            |                                                                                                         |
| `DoubleArray`                                                    | `Float64Array`            |                                                                                                         |
| `LongArray`                                                      | `BigInt64Array`           |                                                                                                         |
| `BooleanArray`                                                   | `Int8Array`               | `$type$ == "BooleanArray"` というプロパティを持ちます。                                                        |
| `List`, `MutableList`                                            | `KtList`, `KtMutableList` | `KtList.asJsReadonlyArrayView` または `KtMutableList.asJsArrayView` を介して `Array` を公開します。                 |
| `Map`, `MutableMap`                                              | `KtMap`, `KtMutableMap`   | `KtMap.asJsReadonlyMapView` または `KtMutableMap.asJsMapView` を介して ES2015 の `Map` を公開します。                  |
| `Set`, `MutableSet`                                              | `KtSet`, `KtMutableSet`   | `KtSet.asJsReadonlySetView` または `KtMutableSet.asJsSetView` を介して ES2015 の `Set` を公開します。                  |
| `Unit`                                                           | Undefined                 | 戻り値の型として使用される場合はエクスポート可能ですが、パラメータの型として使用される場合はエクスポートできません。                               |
| `Any`                                                            | `Object`                  |                                                                                                         |
| `Throwable`                                                      | `Error`                   |                                                                                                         |
| `enum class Type`                                                | `Type`                    | Enum エントリは、クラスの静的プロパティ（`Type.ENTRY`）として公開されます。                                     |
| Nullable `Type?`                                                 | `Type                     | null                                                                                                    | undefined` |                                                                                            |
| `@JsExport` が付いていないその他のすべての Kotlin 型 | サポートされていません             | Kotlin の [符号なし整数型](unsigned-integer-types.md)を含みます。                                  |

さらに、以下の点を知っておくことが重要です：

* Kotlin は `kotlin.Int`、`kotlin.Byte`、`kotlin.Short`、`kotlin.Char`、`kotlin.Long` に対してオーバーフローのセマンティクスを保持します。
* Kotlin は実行時に（`kotlin.Long` を除き）数値型を区別できないため、以下のコードは動作します：
  
  ```kotlin
  fun f() {
      val x: Int = 23
      val y: Any = x
      println(y as Float)
  }
  ```

* Kotlin は JavaScript においてもオブジェクトの遅延初期化（lazy initialization）を保持します。