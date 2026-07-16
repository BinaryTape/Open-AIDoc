[//]: # (title: Kotlin 2.2.20 の新機能)

<web-summary>新しい言語機能、Kotlin Multiplatform、JVM、Native、JS、Wasm のアップデート、Gradle および Maven のビルドツールサポートを含む、Kotlin 2.2.20 のリリースノートをご覧ください。</web-summary>

_[リリース日: 2025年9月10日](releases.md#release-history)_

<tldr>
    <p>バグ修正リリース 2.2.21 の詳細については、<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.21">変更ログ（changelog）</a>を参照してください。</p>
</tldr>

Kotlin 2.2.20 がリリースされました。Web 開発に関する重要な変更が含まれています。[Kotlin/Wasm が Beta](#kotlin-wasm) になり、[JavaScript 相互運用における例外処理の改善](#improved-exception-handling-in-kotlin-wasm-and-javascript-interop)、[npm 依存関係管理の分離](#separated-npm-dependencies)、[設定なしでのブラウザデバッグのサポート](#support-for-debugging-in-browsers-without-configuration)、および新しい [`js` および `wasmJs` ターゲット用の共有ソースセット](#shared-source-set-for-js-and-wasmjs-targets)が導入されました。

さらに、主なハイライトは以下の通りです。

* **Kotlin Multiplatform**: [Swift export がデフォルトで利用可能](#swift-export-available-by-default)、[Kotlin ライブラリのクロスプラットフォーム・コンパイルの安定化](#stable-cross-platform-compilation-for-kotlin-libraries)、および [共通の依存関係を宣言するための新しいアプローチ](#new-approach-for-declaring-common-dependencies)。
* **言語**: [suspend 関数型のオーバーロードにラムダを渡す際のオーバーロード解決の改善](#improved-overload-resolution-for-lambdas-with-suspend-function-types)。
* **Kotlin/Native**: [Xcode 26 のサポート、スタックカナリア、およびリリースバイナリのバイナリサイズの縮小](#kotlin-native)。
* **Kotlin/JS**: [`Long` 値を JavaScript の `BigInt` にコンパイル](#usage-of-the-bigint-type-to-represent-kotlin-s-long-type)。

> Web 用の Compose Multiplatform が Beta になりました。詳細は [ブログ記事](https://blog.jetbrains.com/kotlin/2025/09/compose-multiplatform-1-9-0-compose-for-web-beta/) をご覧ください。
>
{style="note"}

こちらの動画でも、アップデートの概要を短く紹介しています：

<video src="https://www.youtube.com/v/QWpp5-LlTqA" title="Kotlin 2.2.21 の新機能"/>

> Kotlin のリリースサイクルについては、[Kotlin リリースプロセス](releases.md) をご覧ください。
>
{style="tip"}

## IDE サポート

Kotlin 2.2.20 をサポートする Kotlin プラグインは、IntelliJ IDEA および Android Studio の最新バージョンにバンドルされています。
アップデートするには、ビルドスクリプトの Kotlin バージョンを 2.2.20 に変更するだけです。

詳細は [新しいリリースへのアップデート](releases.md#update-to-a-new-kotlin-version) をご覧ください。

## 言語

Kotlin 2.2.20 では、Kotlin 2.3.0 で計画されている今後の言語機能を試すことができます。これには、[`suspend` 関数型のオーバーロードにラムダを渡す際のオーバーロード解決の改善](#improved-overload-resolution-for-lambdas-with-suspend-function-types) や、[明示的な戻り値の型を持つ式本体（expression bodies）での `return` ステートメントのサポート](#support-for-return-statements-in-expression-bodies-with-explicit-return-types) が含まれます。また、このリリースには、[`when` 式の網羅性チェックの改善](#data-flow-based-exhaustiveness-checks-for-when-expressions)、[reified な `Throwable` キャッチ](#support-for-reified-types-in-catch-clauses)、および [Kotlin コントラクト（Contracts）の改善](#improved-kotlin-contracts) も含まれています。

### suspend 関数型のオーバーロードに対するラムダのオーバーロード解決の改善

以前は、通常の関数型と `suspend` 関数型の両方で関数をオーバーロードすると、ラムダを渡す際に曖昧さによるエラーが発生していました。明示的な型キャストでこのエラーを回避できましたが、コンパイラが誤って `No cast needed`（キャストは不要です）という警告を報告していました。

```kotlin
// 2つのオーバーロードを定義
fun transform(block: () -> Int) {}
fun transform(block: suspend () -> Int) {}

fun test() {
    // オーバーロード解決の曖昧さにより失敗する
    transform({ 42 })

    // 明示的なキャストを使用するが、コンパイラが誤って 
    // "No cast needed" 警告を報告する
    transform({ 42 } as () -> Int)
}
```

この変更により、通常と `suspend` の両方の関数型オーバーロードを定義した場合、キャストのないラムダは通常のオーバーロードとして解決されます。suspend のオーバーロードとして明示的に解決するには、`suspend` キーワードを使用してください。

```kotlin
// transform(() -> Int) に解決される
transform({ 42 })

// transform(suspend () -> Int) に解決される
transform(suspend { 42 })
```

この動作は Kotlin 2.3.0 でデフォルトで有効になります。今すぐテストするには、以下のコンパイラオプションを使用して言語バージョンを `2.3` に設定してください。

```kotlin
-language-version 2.3
```

または、`build.gradle(.kts)` ファイルで設定します。

```kotlin
kotlin {
    compilerOptions {
        languageVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_3)
    }
}
```

フィードバックは、課題トラッカーの [YouTrack](https://youtrack.jetbrains.com/issue/KT-23610) でお待ちしております。

### 明示的な戻り値の型を持つ式本体での `return` ステートメントのサポート

以前は、式本体（expression body）で `return` を使用すると、関数の戻り値の型が `Nothing` と推論される可能性があるため、コンパイラエラーが発生していました。

```kotlin
fun example() = return 42
// Error: Returns are prohibited for functions with an expression body
```

この変更により、戻り値の型が明示的に記述されている限り、式本体で `return` を使用できるようになりました。

```kotlin
// 戻り値の型を明示的に指定
fun getDisplayNameOrDefault(userId: String?): String = getDisplayName(userId ?: return "default")

// 戻り値の型を明示的に指定していないため失敗する
fun getDisplayNameOrDefault(userId: String?) = getDisplayName(userId ?: return "default")
```

同様に、式本体を持つ関数内のラムダやネストされた式の中の `return` ステートメントも、意図せずコンパイルされてしまうことがありました。Kotlin では、戻り値の型が明示的に指定されている場合に限り、これらのケースをサポートするようになりました。明示的な戻り値の型がないケースは、Kotlin 2.3.0 で非推奨となります。

```kotlin
// 戻り値の型が明示的に指定されておらず、return ステートメントがラムダ内にある。
// これは非推奨となる
fun returnInsideLambda() = run { return 42 }

// 戻り値の型が明示的に指定されておらず、return ステートメントがローカル変数の
// 初期化子内にある。これは非推奨となる
fun returnInsideIf() = when {
    else -> {
        val result = if (someCondition()) return "" else "value"
        result
    }
}
```

この動作は Kotlin 2.3.0 でデフォルトで有効になります。今すぐテストするには、以下のコンパイラオプションを使用して言語バージョンを `2.3` に設定してください。

```kotlin
-language-version 2.3
```

または、`build.gradle(.kts)` ファイルで設定します。

```kotlin
kotlin {
    compilerOptions {
        languageVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_3)
    }
}
```

フィードバックは、課題トラッカーの [YouTrack](https://youtrack.jetbrains.com/issue/KT-76926) でお待ちしております。

### when 式におけるデータフローに基づく網羅性チェック
<primary-label ref="experimental-opt-in"/>

Kotlin 2.2.20 では、`when` 式に対する**データフローに基づく**網羅性チェックが導入されました。
以前は、コンパイラのチェックは `when` 式自体に限定されていたため、冗長な `else` ブランチを追加せざるを得ないことがよくありました。
今回のアップデートにより、コンパイラは以前の条件チェックや早期リターン（early return）を追跡するようになり、冗長な `else` ブランチを削除できるようになります。

例えば、コンパイラは `if` 条件が満たされたときに関数がリターンすることを認識するようになったため、`when` 式では残りのケースのみを処理すればよくなります。

```kotlin
enum class UserRole { ADMIN, MEMBER, GUEST }

fun getPermissionLevel(role: UserRole): Int {
    // when 式の外側で Admin ケースをカバー
    if (role == UserRole.ADMIN) return 99

    return when (role) {
        UserRole.MEMBER -> 10
        UserRole.GUEST -> 1
        // この else ブランチを含める必要はなくなりました 
        // else -> throw IllegalStateException()
    }
}
```

この機能は [実験的（Experimental）](components-stability.md#stability-levels-explained) です。有効にするには、`build.gradle(.kts)` ファイルに以下のコンパイラオプションを追加してください。

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xdata-flow-based-exhaustiveness")
    }
}
```

### catch 句での reified 型のサポート
<primary-label ref="experimental-opt-in"/>

Kotlin 2.2.20 では、`inline` 関数の `catch` 句で [reified（具現化）されたジェネリック型パラメータ](inline-functions.md#reified-type-parameters) を使用できるようになりました。

例を挙げます：

```kotlin
inline fun <reified ExceptionType : Throwable> handleException(block: () -> Unit) {
    try {
        block()
        // この変更により、これが許可されるようになりました
    } catch (e: ExceptionType) {
        println("Caught specific exception: ${e::class.simpleName}")
    }
}

fun main() {
    // IOException を投げる可能性のあるアクションを実行しようとする
    handleException<java.io.IOException> {
        throw java.io.IOException("File not found")
    }
    // Caught specific exception: IOException
}
```

以前は、`inline` 関数で reified な `Throwable` 型をキャッチしようとするとエラーが発生していました。

この動作は Kotlin 2.4.0 でデフォルトで有効になります。
今すぐ使用するには、`build.gradle(.kts)` ファイルに以下のコンパイラオプションを追加してください。

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-reified-type-in-catch")
    }
}
```

Kotlin チームは、外部コントリビューターの [Iven Krall](https://github.com/kralliv) 氏の貢献に感謝します。

### Kotlin コントラクトの改善
<primary-label ref="experimental-opt-in"/>

Kotlin 2.2.20 では、[Kotlin コントラクト（Contracts）](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.contracts/contract.html) に以下のようないくつかの改善が導入されました。

* [コントラクト型アサーションにおけるジェネリクスのサポート](#support-for-generics-in-contract-type-assertions)。
* [プロパティアクセサおよび特定の演算子関数内でのコントラクトのサポート](#support-for-contracts-inside-property-accessors-and-specific-operator-functions)。
* コントラクトにおける [`returnsNotNull()` 関数のサポート](#support-for-the-returnsnotnull-function-in-contracts)（条件が満たされたときに非 null の戻り値を保証する方法として）。
* [新しい `holdsIn` キーワード](#new-holdsin-keyword)（ラムダ内に渡されたときに条件が真であると仮定できるようにするもの）。

これらの改善は [実験的（Experimental）](components-stability.md#stability-levels-explained) です。オプトインするには、コントラクトを宣言する際に依然として `@OptIn(ExperimentalContracts::class)` アノテーションを使用する必要があります。`holdsIn` キーワードと `returnsNotNull()` 関数には `@OptIn(ExperimentalExtendedContracts::class)` アノテーションも必要です。

これらの改善を使用するには、以下の各セクションで説明するコンパイラオプションも追加する必要があります。

フィードバックは [課題トラッカー](https://kotl.in/issue) でお待ちしております。

#### コントラクト型アサーションにおけるジェネリクスのサポート

ジェネリック型に対して型アサーションを行うコントラクトを記述できるようになりました。

```kotlin
import kotlin.contracts.*

sealed class Failure {
    class HttpError(val code: Int) : Failure()
    // 他の失敗型をここに挿入
}

sealed class Result<out T, out F : Failure> {
    class Success<T>(val data: T) : Result<T, Nothing>()
    class Failed<F : Failure>(val failure: F) : Result<Nothing, F>()
}

@OptIn(ExperimentalContracts::class)
// コントラクトを使用してジェネリック型をアサート
fun <T, F : Failure> Result<T, F>.isHttpError(): Boolean {
    contract {
        returns(true) implies (this@isHttpError is Result.Failed<Failure.HttpError>)
    }
    return this is Result.Failed && this.failure is Failure.HttpError
}
```

この例では、コントラクトが `Result` オブジェクトに対して型アサーションを実行し、コンパイラがそれをアサートされたジェネリック型に安全に [スマートキャスト](typecasts.md#smart-casts) できるようにします。

この機能は [実験的（Experimental）](components-stability.md#stability-levels-explained) です。オプトインするには、`build.gradle(.kts)` ファイルに以下のコンパイラオプションを追加してください。

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-contracts-on-more-functions")
    }
}
```

#### プロパティアクセサおよび特定の演算子関数内でのコントラクトのサポート

プロパティアクセサや特定の演算子関数の中でコントラクトを定義できるようになりました。
これにより、より多くの種類の宣言でコントラクトを使用できるようになり、柔軟性が向上します。

例えば、ゲッター内でコントラクトを使用して、レシーバーオブジェクトのスマートキャストを有効にできます。

```kotlin
import kotlin.contracts.*

val Any.isHelloString: Boolean
    get() {
        @OptIn(ExperimentalContracts::class)
        // ゲッターが true を返すときにレシーバーを String にスマートキャストできるようにする
        contract { returns(true) implies (this@isHelloString is String) }
        return "hello" == this
    }

fun printIfHelloString(x: Any) {
    if (x.isHelloString) {
        // レシーバーが String にスマートキャストされた後、length を出力
        println(x.length)
        // 5
    }
}
```

さらに、以下の演算子関数でもコントラクトを使用できます。

* `invoke`
* `contains`
* `rangeTo`, `rangeUntil`
* `componentN`
* `iterator`
* `unaryPlus`, `unaryMinus`, `not`
* `inc`, `dec`

以下は、演算子関数でコントラクトを使用して、ラムダ内での変数の初期化を確実にする例です。

```kotlin
import kotlin.contracts.*

class Runner {
    @OptIn(ExperimentalContracts::class)
    // ラムダ内で代入された変数の初期化を可能にする
    operator fun invoke(block: () -> Unit) {
        contract {
            callsInPlace(block, InvocationKind.EXACTLY_ONCE)
        }
        block()
    }
}

fun testOperator(runner: Runner) {
    val number: Int
    runner {
        number = 1
    }
    // コントラクトによって保証された確実な初期化の後、値を出力
    println(number)
    // 1
}
```

この機能は [実験的（Experimental）](components-stability.md#stability-levels-explained) です。オプトインするには、`build.gradle(.kts)` ファイルに以下のコンパイラオプションを追加してください。

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-contracts-on-more-functions")
    }
}
```

#### コントラクトにおける `returnsNotNull()` 関数のサポート

Kotlin 2.2.20 では、コントラクト用の [`returnsNotNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.contracts/-contract-builder/returns-not-null.html) 関数が導入されました。
この関数を使用すると、特定の条件が満たされたときに関数が非 null の値を返すことを保証できます。
これにより、nullable と non-nullable の個別の関数オーバーロードを 1 つの簡潔な関数に置き換えることができ、コードを簡素化できます。

```kotlin
import kotlin.contracts.*

@OptIn(ExperimentalContracts::class, ExperimentalExtendedContracts::class)
fun decode(encoded: String?): String? {
    contract {
        // 入力が非 null の場合、非 null の戻り値を保証
        (encoded != null) implies (returnsNotNull())
    }
    if (encoded == null) return null
    return java.net.URLDecoder.decode(encoded, "UTF-8")
}

fun useDecodedValue(s: String?) {
    // 戻り値が null になる可能性があるため、セーフコールを使用
    decode(s)?.length
    if (s != null) {
        // スマートキャストの後、戻り値を非 null として扱う
        decode(s).length
    }
}
```

この例では、`decode()` 関数のコントラクトにより、入力が非 null の場合に戻り値をスマートキャストできるため、余分な null チェックや複数のオーバーロードが不要になります。

この機能は [実験的（Experimental）](components-stability.md#stability-levels-explained) です。オプトインするには、`build.gradle(.kts)` ファイルに以下のコンパイラオプションを追加してください。

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-condition-implies-returns-contracts")
    }
}
```

#### 新しい `holdsIn` キーワード

Kotlin 2.2.20 では、コントラクトに新しい [`holdsIn`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.contracts/-contract-builder/holds-in.html) キーワードが導入されました。
これを使用すると、特定のラムダ内で boolean 条件が `true` であると見なされることを保証できます。これにより、コントラクトを使用した条件付きスマートキャストを含む DSL を構築できます。

例を挙げます：

```kotlin
import kotlin.contracts.*

@OptIn(ExperimentalContracts::class, ExperimentalExtendedContracts::class)
fun <T> T.alsoIf(condition: Boolean, block: (T) -> Unit): T {
    contract {
        // ラムダが高々1回実行されることを宣言
        callsInPlace(block, InvocationKind.AT_MOST_ONCE)
        // ラムダ内では条件が真であると仮定されることを宣言
        condition holdsIn block
    }
    if (condition) block(this)
    return this
}

fun useApplyIf(input: Any) {
    val result = listOf(1, 2, 3)
        .first()
        .alsoIf(input is Int) {
            // ラムダ内では input パラメータが Int にスマートキャストされる
            // input とリストの最初の要素の合計を出力
            println(input + it)
            // 2
        }
        .toString()
}
```

この機能は [実験的（Experimental）](components-stability.md#stability-levels-explained) です。オプトインするには、`build.gradle(.kts)` ファイルに以下のコンパイラオプションを追加してください。

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-holdsin-contract")
    }
}
```

## Kotlin/JVM: `when` 式での `invokedynamic` のサポート
<primary-label ref="experimental-opt-in"/> 

Kotlin 2.2.20 では、`when` 式を `invokedynamic` でコンパイルできるようになりました。以前は、複数の型チェックを伴う `when` 式は、バイトコード上では `instanceof` チェックの長いチェーンにコンパイルされていました。

以下の条件が満たされる場合、Java の `switch` ステートメントによって生成されるバイトコードと同様に、`invokedynamic` を使用してより小さなバイトコードを生成できるようになります。

* `else` 以外のすべての条件が `is` または `null` チェックである。
* 式に [ガード条件（`if`）](control-flow.md#guard-conditions-in-when-expressions) が含まれていない。
* 条件に、ミュータブルな Kotlin コレクション（`MutableList`）や関数型（`kotlin.Function1`, `kotlin.Function2` など）のように、直接型チェックできない型が含まれていない。
* `else` 以外に少なくとも 2 つの条件がある。
* すべてのブランチが `when` 式の同じ対象をチェックしている。

例を挙げます：

```kotlin
open class Example

class A : Example()
class B : Example()
class C : Example()

fun test(e: Example) = when (e) {
    // SwitchBootstraps.typeSwitch を伴う invokedynamic を使用
    is A -> 1
    is B -> 2
    is C -> 3
    else -> 0
}
```

この新機能が有効な場合、この例の `when` 式は複数の `instanceof` チェックではなく、単一の `invokedynamic` 型スイッチにコンパイルされます。

この機能を有効にするには、Kotlin コードを JVM ターゲット 21 以上でコンパイルし、以下のコンパイラオプションを追加してください。

```bash
-Xwhen-expressions=indy
```

または、`build.gradle(.kts)` ファイルの `compilerOptions {}` ブロックに追加します。

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xwhen-expressions=indy")
    }
}
```

この機能は [実験的（Experimental）](components-stability.md#stability-levels-explained) です。フィードバックは課題トラッカー [YouTrack](https://youtrack.jetbrains.com/issue/KT-65688) でお待ちしております。

## Kotlin Multiplatform

Kotlin 2.2.20 では、Kotlin Multiplatform に重要な変更が導入されました。Swift export がデフォルトで利用可能になり、新しい共有ソースセットが登場し、共通の依存関係を管理するための新しいアプローチを試すことができます。

### Swift export がデフォルトで利用可能
<primary-label ref="experimental-general"/> 

Kotlin 2.2.20 では、Swift export の実験的サポートが導入されました。これにより、Kotlin ソースを直接エクスポートし、Swift から Kotlin コードを慣用的（idiomatic）に呼び出すことができ、Objective-C ヘッダーの必要性がなくなります。

これにより、Apple ターゲット向けのマルチプラットフォーム開発が大幅に改善されます。例えば、トップレベル関数を持つ Kotlin モジュールがある場合、Swift export を使用すると、Objective-C 特有の混乱を招くアンダースコアやマングルされた名前なしに、クリーンなモジュール固有のインポートが可能になります。

主な機能は以下の通りです：

* **マルチモジュール・サポート**: 各 Kotlin モジュールは個別の Swift モジュールとしてエクスポートされるため、関数呼び出しが簡素化されます。
* **パッケージ・サポート**: Kotlin のパッケージはエクスポート中も明示的に保持され、生成された Swift コード内での名前の競合を回避します。
* **型エイリアス**: Kotlin の型エイリアスがエクスポートされ、Swift でも保持されるため、可読性が向上します。
* **プリミティブの null 許容性の向上**: null 許容性を保持するために `Int?` などの型を `KotlinInt` のようなラッパークラスにボックス化する必要があった Objective-C の相互運用とは異なり、Swift export では null 許容性情報を直接変換します。
* **オーバーロード**: 曖昧さなしに、Swift で Kotlin のオーバーロードされた関数を呼び出すことができます。
* **フラット化されたパッケージ構造**: Kotlin のパッケージを Swift の列挙型（enum）に変換し、生成された Swift コードからパッケージプレフィックスを取り除くことができます。
* **モジュール名のカスタマイズ**: Kotlin プロジェクトの Gradle 設定で、結果として生成される Swift モジュール名をカスタマイズできます。

#### Swift export を有効にする方法

この機能は現在 [実験的（Experimental）](components-stability.md#stability-levels-explained) であり、iOS フレームワークを Xcode プロジェクトに接続するために [直接統合（direct integration）](https://kotlinlang.org/docs/multiplatform/multiplatform-direct-integration.html) を使用しているプロジェクトでのみ動作します。これは、IntelliJ IDEA の Kotlin Multiplatform プラグインまたは [Web ウィザード](https://kmp.jetbrains.com/) で作成されたマルチプラットフォームプロジェクトの標準的な構成です。

Swift export を試すには、Xcode プロジェクトを構成してください：

1. Xcode でプロジェクト設定を開きます。
2. **Build Phases** タブで、`embedAndSignAppleFrameworkForXcode` タスクを含む **Run Script** フェーズを探します。
3. 実行スクリプトフェーズで、代わりに `embedSwiftExportForXcode` タスクを使用するようにスクリプトを調整します。

   ```bash
   ./gradlew :<Shared module name>:embedSwiftExportForXcode
   ```

   ![Swift export スクリプトの追加](xcode-swift-export-run-script-phase.png){width=700}

4. プロジェクトをビルドします。Swift モジュールがビルド出力ディレクトリに生成されます。

この機能はデフォルトで利用可能です。以前のリリースですでに有効にしていた場合は、`gradle.properties` ファイルから `kotlin.experimental.swift-export.enabled` を削除できるようになりました。

> 時間を節約するために、Swift export がすでにセットアップされている [公開サンプル](https://github.com/Kotlin/swift-export-sample) をクローンしてください。
>
{style="tip"}

Swift export の詳細については、[ドキュメント](native-swift-export.md) をご覧ください。

#### フィードバックのお願い

今後の Kotlin リリースでは、Swift export サポートを拡大し、段階的に安定化させる予定です。Kotlin 2.2.20 以降は、特にコルーチンやフローに関する Kotlin と Swift 間の相互運用性の向上に重点を置く予定です。

Swift export のサポートは、Kotlin Multiplatform にとって大きな変更です。皆様のフィードバックをお待ちしております：

* Kotlin Slack で開発チームに直接連絡する – [招待を受ける](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw) して [#swift-export](https://kotlinlang.slack.com/archives/C073GUW6WN9) チャンネルに参加してください。
* Swift export で直面した問題については、[YouTrack](https://kotl.in/issue) で報告してください。

### js および wasmJs ターゲット用の共有ソースセット

以前は、Kotlin Multiplatform にはデフォルトで JavaScript (`js`) と WebAssembly (`wasmJs`) の Web ターゲット用の共有ソースセットが含まれていませんでした。`js` と `wasmJs` の間でコードを共有するには、カスタムソースセットを手動で設定するか、`js` 用と `wasmJs` 用の 2 か所にコードを記述する必要がありました。例えば：

```kotlin
// commonMain
expect suspend fun readCopiedText(): String

// jsMain
external interface Navigator { val clipboard: Clipboard }
// JS と Wasm で異なる相互運用性
external interface Clipboard { fun readText(): Promise<String> }
external val navigator: Navigator

suspend fun readCopiedText(): String {
    // JS と Wasm で異なる相互運用性
    return navigator.clipboard.readText().await()
}

// wasmJsMain
external interface Navigator { val clipboard: Clipboard }
external interface Clipboard { fun readText(): Promise<JsString> }
external val navigator: Navigator

suspend fun readCopiedText(): String {
    return navigator.clipboard.readText().await().toString()
}
```

本リリース以降、[デフォルトの階層テンプレート](https://kotlinlang.org/docs/multiplatform/multiplatform-hierarchy.html#default-hierarchy-template) を使用すると、Kotlin Gradle プラグインが Web 用の新しい共有ソースセット（`webMain` および `webTest` で構成）を追加するようになりました。

この変更により、`web` ソースセットは `js` と `wasmJs` の両方のソースセットの親になります。更新されたソースセット階層は以下のようになります。

![Web を含むデフォルト階層テンプレートの使用例](default-hierarchy-example-with-web.svg)

新しいソースセットにより、`js` と `wasmJs` の両方のターゲットに対して 1 つのコードを記述できるようになります。共有コードを `webMain` に配置すれば、自動的に両方で動作します。

```kotlin
// commonMain
expect suspend fun readCopiedText(): String

// webMain
@OptIn(ExperimentalWasmJsInterop::class)
private suspend fun <R : JsAny?> Promise<R>.await(): R = suspendCancellableCoroutine { continuation ->
    this.then(
        onFulfilled = { continuation.resumeWith(Result.success(it)); null },
        onRejected = { continuation.resumeWithException(it.asJsException()); null }
    )
}

external interface Navigator { val clipboard: Clipboard }
external interface Clipboard { fun readText(): Promise<JsString> }
external val navigator: Navigator

actual suspend fun readCopiedText(): String {
    return navigator.clipboard.readText().await().toString()
}
```

このアップデートにより、`js` ターゲットと `wasmJs` ターゲット間のコード共有が簡素化されます。これは特に以下の 2 つのケースで役立ちます。

* あなたがライブラリの作者で、コードを重複させることなく `js` と `wasmJs` の両方のターゲットのサポートを追加したい場合。
* Web をターゲットとする Compose Multiplatform アプリケーションを開発しており、より広いブラウザ互換性のために `js` と `wasmJs` の両方のターゲットに対してクロスコンパイルを可能にしたい場合。このフォールバックモードにより、Web サイトを作成すると、モダンなブラウザは `wasmJs` を使い、古いブラウザは `js` を使うため、すべてのブラウザでそのまま動作します。

この機能を試すには、`build.gradle(.kts)` ファイルの `kotlin {}` ブロックで [デフォルトの階層テンプレート](https://kotlinlang.org/docs/multiplatform/multiplatform-hierarchy.html#default-hierarchy-template) を使用してください。

```kotlin
kotlin {
    js()
    wasmJs()

    // webMain および webTest を含む、デフォルトのソースセット階層を有効にする
    applyDefaultHierarchyTemplate()
}
```

デフォルトの階層を使用する前に、カスタム共有ソースセットを持つプロジェクトがある場合や、`js("web")` ターゲットの名前を変更している場合に発生する可能性のある競合について慎重に検討してください。これらの競合を解決するには、競合するソースセットやターゲットの名前を変更するか、デフォルトの階層を使用しないようにしてください。

### Kotlin ライブラリの安定したクロスプラットフォーム・コンパイル

Kotlin 2.2.20 は、重要な [ロードマップ項目](https://youtrack.jetbrains.com/issue/KT-71290) を完了し、Kotlin ライブラリのクロスプラットフォーム・コンパイルを安定化させました。

Kotlin ライブラリを公開するための `.klib` アーティファクトを生成するために、任意の [サポートされているホスト](native-target-support.md#hosts) を使用できるようになりました。これにより、以前は Mac が必要だった Apple ターゲットなどの公開プロセスが大幅に合理化されます。

この機能はデフォルトで利用可能です。すでに `kotlin.native.enableKlibsCrossCompilation=true` でクロスコンパイルを有効にしていた場合は、`gradle.properties` ファイルから削除できるようになりました。

残念ながら、いくつかの制限がまだ残っています。以下の場合は引き続き Mac を使用する必要があります。

* あなたのライブラリまたは依存するモジュールに [cinterop 依存関係](native-c-interop.md) がある場合。
* プロジェクトに [CocoaPods 統合](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html) が設定されている場合。
* Apple ターゲット向けの [最終バイナリ](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html) をビルドまたはテストする必要がある場合。

マルチプラットフォーム・ライブラリの公開に関する詳細については、[ドキュメント](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-lib-setup.html) を参照してください。

### 共通の依存関係を宣言するための新しいアプローチ
<primary-label ref="experimental-opt-in"/>

Gradle を使用したマルチプラットフォーム・プロジェクトのセットアップを簡素化するために、Gradle 8.8 以上を使用している場合、Kotlin 2.2.20 では `kotlin {}` ブロック内のトップレベルの `dependencies {}` ブロックを使用して共通の依存関係を宣言できるようになりました。これらの依存関係は、`commonMain` ソースセットで宣言されているかのように動作します。この機能は、Kotlin/JVM および Android 専用プロジェクトで使用する依存関係ブロックと同様に機能し、Kotlin Multiplatform でも [実験的（Experimental）](components-stability.md#stability-levels-explained) として導入されました。

プロジェクトレベルで共通の依存関係を宣言することで、ソースセット間での繰り返しの設定が減り、ビルドセットアップの合理化に役立ちます。必要に応じて、各ソースセットにプラットフォーム固有の依存関係を追加することもできます。

この機能を試すには、トップレベルの `dependencies {}` ブロックの前に `@OptIn(ExperimentalKotlinGradlePluginApi::class)` アノテーションを追加してオプトインしてください。例えば：

```kotlin
kotlin {
    @OptIn(ExperimentalKotlinGradlePluginApi::class)
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
    }
}
```

この機能に関するフィードバックは [YouTrack](https://youtrack.jetbrains.com/issue/KT-76446) でお待ちしております。

### 依存関係におけるターゲット・サポートの新しい診断

Kotlin 2.2.20 より前は、ビルドスクリプト内の依存関係がソースセットで必要なすべてのターゲットをサポートしていない場合、Gradle が生成するエラーメッセージでは問題の理解が困難でした。

Kotlin 2.2.20 では、各依存関係がどのターゲットをサポートし、どのターゲットをサポートしていないかを明確に示す新しい診断機能が導入されました。

この診断はデフォルトで有効になっています。何らかの理由で無効にする必要がある場合は、この [YouTrack 課題](https://kotl.in/kmp-dependencies-diagnostic-issue) のコメントでお知らせください。`gradle.properties` ファイルで以下の Gradle プロパティを使用して診断を無効にすることができます。

| プロパティ                                                 | 説明                                                    |
|----------------------------------------------------------|---------------------------------------------------------|
| `kotlin.kmp.eagerUnresolvedDependenciesDiagnostic=false` | メタデータのコンパイルとインポートの時のみ診断を実行する      |
| `kotlin.kmp.unresolvedDependenciesDiagnostic=false`      | 診断を完全に無効にする                                   |

## Kotlin/Native

このリリースでは、Xcode 26 のサポート、Objective-C/Swift との相互運用性の改善、デバッグ、および新しいバイナリオプションが提供されます。

### Xcode 26 のサポート

Kotlin 2.2.2**1** 以降、Kotlin/Native コンパイラは Xcode 26（Xcode の最新の安定版）をサポートします。Xcode をアップデートして最新の API にアクセスし、Apple オペレーティングシステム向けの Kotlin プロジェクトの作業を継続できます。

### バイナリにおけるスタックカナリアのサポート

Kotlin 2.2.20 以降、Kotlin は生成される Kotlin/Native バイナリにおけるスタックカナリア（stack canaries）のサポートを追加しました。スタック保護の一環として、このセキュリティ機能はスタックスマッシングを防ぎ、一般的なアプリケーションの脆弱性を軽減します。Swift や Objective-C ではすでに利用可能でしたが、Kotlin でもサポートされるようになりました。

Kotlin/Native におけるスタック保護の実装は、[Clang](https://clang.org/docs/ClangCommandLineReference.html#cmdoption-clang-fstack-protector) のスタックプロテクターの動作に従います。

スタックカナリアを有効にするには、`gradle.properties` ファイルに以下の [バイナリオプション](native-binary-options.md) を追加してください。

```none
kotlin.native.binary.stackProtector=yes
```

このプロパティは、スタックスマッシングに対して脆弱なすべての Kotlin 関数に対してこの機能を有効にします。代替モードは以下の通りです：

* `kotlin.native.binary.stackProtector=strong`: スタックスマッシングに対して脆弱な関数に対して、より強力なヒューリスティックを使用します。
* `kotlin.native.binary.stackProtector=all`: すべての関数に対してスタックプロテクターを有効にします。

スタック保護を有効にすると、場合によってはパフォーマンスに影響が出る可能性があることに注意してください。

### リリースバイナリのバイナリサイズの縮小
<primary-label ref="experimental-opt-in"/> 

Kotlin 2.2.20 では、リリースバイナリのサイズを縮小するのに役立つ `smallBinary` オプションが導入されました。この新しいオプションは、LLVM コンパイルフェーズ中のコンパイラのデフォルト最適化引数として実質的に `-Oz` を設定します。

`smallBinary` オプションを有効にすると、リリースバイナリを小さくし、ビルド時間を改善できます。ただし、場合によっては実行時のパフォーマンスに影響を与える可能性があります。

この新機能は現在 [実験的（Experimental）](components-stability.md#stability-levels-explained) です。プロジェクトで試すには、`gradle.properties` ファイルに以下の [バイナリオプション](native-binary-options.md) を追加してください。

```none
kotlin.native.binary.smallBinary=true
```

Kotlin チームは、この機能の実装を支援してくれた [Troels Lund](https://github.com/troelsbjerre) 氏に感謝します。

### デバッガーのオブジェクトサマリーの改善

Kotlin/Native は、LLDB や GDB などのデバッガーツールに対して、より明確なオブジェクトサマリーを生成するようになりました。これにより、生成されたデバッグ情報の可読性が向上し、デバッグ体験が合理化されます。

例えば、次のオブジェクトを考えてみましょう。

```kotlin
class Point(val x: Int, val y: Int)
val point = Point(1, 2)
```

以前は、インスペクションではオブジェクトのメモリ番地へのポインタを含む限定的な情報しか表示されませんでした。

```none
(lldb) v point
(ObjHeader *) point = [x: ..., y: ...]
(lldb) v point->x
(int32_t *) x = 0x0000000100274048
```

Kotlin 2.2.20 では、デバッガーは実際の値を含む、より詳細な情報を表示するようになりました。

```none
(lldb) v point
(ObjHeader *) point = Point(x=1, y=2)
(lldb) v point->x
(int32_t) point->x = 1
```

Kotlin チームは、この機能の実装を支援してくれた [Nikita Nazarov](https://github.com/nikita-nazarov) 氏に感謝します。

Kotlin/Native でのデバッグの詳細については、[ドキュメント](native-debugging.md) を参照してください。

### Objective-C ヘッダーのブロック型における明示的な名前

Kotlin 2.2.20 では、Kotlin/Native プロジェクトからエクスポートされる Objective-C ヘッダーにおいて、Kotlin の関数型に明示的なパラメータ名を追加するオプションが導入されました。パラメータ名により、Xcode でのオートコンプリートの提案が改善され、Clang の警告を回避するのに役立ちます。

以前は、生成された Objective-C ヘッダーにおいて、ブロック型のパラメータ名が省略されていました。そのような場合、Xcode のオートコンプリートは、Objective-C ブロック内でパラメータ名なしでそれらの関数を呼び出すことを提案していました。生成されたブロックは Clang の警告を誘発していました。

例えば、以下の Kotlin コードの場合：

```kotlin
// Kotlin:
fun greetUser(block: (name: String) -> Unit) = block("John")
```

生成された Objective-C ヘッダーにはパラメータ名がありませんでした：

```objc
// Objective-C:
+ (void)greetUserBlock:(void (^)(NSString *))block __attribute__((swift_name("greetUser(block:)")));
```

そのため、Xcode で Objective-C から `greetUserBlock()` 関数を呼び出す際、IDE は次のように提案していました：

```objc
// Objective-C:
greetUserBlock:^(NSString *) {
    // ...
};
```

提案の中でパラメータ名 `(NSString *)` が欠けていることが Clang の警告の原因となっていました。

新しいオプションを使用すると、Kotlin は Kotlin の関数型から Objective-C のブロック型にパラメータ名を転送するため、Xcode が提案でそれらを使用するようになります：

```objc
// Objective-C:
greetUserBlock:^(NSString *name) {
    // ...
};
```

明示的なパラメータ名を有効にするには、`gradle.properties` ファイルに以下の [バイナリオプション](native-binary-options.md) を追加してください。

```none
kotlin.native.binary.objcExportBlockExplicitParameterNames=true
```

Kotlin チームは、この機能を実装してくれた [Yijie Jiang](https://github.com/edisongz) 氏に感謝します。

### Kotlin/Native 配布サイズの削減

これまでの Kotlin/Native 配布物には、コンパイラコードを含む 2 つの JAR ファイルが含まれていました：

* `konan/lib/kotlin-native.jar`
* `konan/lib/kotlin-native-compiler-embeddable.jar`

Kotlin 2.2.20 以降、`kotlin-native.jar` は公開されなくなりました。

削除された JAR ファイルは、もはや必要のない embeddable コンパイラのレガシーバージョンです。この変更により、配布物のサイズが大幅に削減されます。

その結果、以下のオプションは非推奨となり、削除されました：

* `kotlin.native.useEmbeddableCompilerJar=false` Gradle プロパティ。代わりに、Kotlin/Native プロジェクトでは常に embeddable コンパイラ JAR ファイルが使用されます。
* `KotlinCompilerPluginSupportPlugin.getPluginArtifactForNative()` 関数。代わりに、常に [`getPluginArtifact()`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-compiler-plugin-support-plugin/get-plugin-artifact.html) 関数が使用されます。

詳細については、[YouTrack 課題](https://kotl.in/KT-51301) を参照してください。

### Objective-C ヘッダーへの KDoc エクスポートのデフォルト化

Kotlin/Native の最終バイナリのコンパイル中に Objective-C ヘッダーを生成する際、[KDoc](kotlin-doc.md) コメントがデフォルトでエクスポートされるようになりました。

以前は、ビルドファイルに `-Xexport-kdoc` オプションを手動で追加する必要がありました。現在は、自動的にコンパイルタスクに渡されます。

このオプションは KDoc コメントを klib に埋め込み、Apple フレームワークを生成する際に klib からコメントを抽出します。その結果、Xcode などのオートコンプリート中にクラスやメソッドのコメントが表示されるようになります。

klib から生成される Apple フレームワークへの KDoc コメントのエクスポートを無効にするには、`build.gradle(.kts)` ファイルの `binaries {}` ブロックで設定できます：

```kotlin
import org.jetbrains.kotlin.gradle.ExperimentalKotlinGradlePluginApi

kotlin {
    iosArm64 {
        binaries {
            framework { 
                baseName = "sdk"
                @OptIn(ExperimentalKotlinGradlePluginApi::class)
                exportKdoc.set(false)
            }
        }
    }
}
```

詳細については、[公式ドキュメント](native-objc-interop.md#provide-documentation-with-kdoc-comments) を参照してください。

### x86_64 Apple ターゲットの非推奨化

Apple 数年前に Intel チップを搭載したデバイスの製造を停止し、[先日](https://www.youtube.com/live/51iONeETSng?t=3288s)、macOS Tahoe 26 が Intel ベースのアーキテクチャをサポートする最後の OS バージョンになると発表しました。

このため、ビルドエージェントでこれらのターゲットを適切にテストすることがますます困難になっています。特に、macOS 26 に付属するサポート対象の Xcode バージョンを更新する今後の Kotlin リリースでは顕著になります。

Kotlin 2.2.20 以降、`macosX64` および `iosX64` ターゲットはサポートティア 2 に降格されました。これは、ターゲットがコンパイルされることを確認するために CI で定期的にテストされますが、実行されることを確認するための自動テストは行われない可能性があることを意味します。

Kotlin 2.2.20 から 2.4.0 のリリースサイクルの間に、すべての `x86_64` Apple ターゲットを段階的に非推奨にし、最終的にサポートを削除する予定です。これには以下のターゲットが含まれます：

* `macosX64`
* `iosX64`
* `tvosX64`
* `watchosX64`

サポートティアの詳細については、[Kotlin/Native ターゲットサポート](native-target-support.md) を参照してください。

## Kotlin/Wasm

Kotlin/Wasm は Beta になり、分離された npm 依存関係、[JavaScript 相互運用における例外処理の改善](#improved-exception-handling-in-kotlin-wasm-and-javascript-interop)、[設定なしでのブラウザデバッグのサポート](#support-for-debugging-in-browsers-without-configuration)などの改善とともに、より高い安定性を提供します。

### 分離された npm 依存関係

以前の Kotlin/Wasm プロジェクトでは、Kotlin ツールチェーンの依存関係とあなた自身の依存関係の両方を含むすべての [npm](https://www.npmjs.com/) 依存関係が、プロジェクトフォルダ内にまとめてインストールされていました。また、それらはプロジェクトのロックファイル（`package-lock.json` または `yarn.lock`）にまとめて記録されていました。

その結果、Kotlin ツールチェーンの依存関係が更新されるたびに、何も追加や変更を行っていなくても、ロックファイルを更新する必要がありました。

Kotlin 2.2.20 からは、Kotlin ツールチェーンの npm 依存関係はプロジェクトの外にインストールされるようになります。今後、ツールチェーンとあなた（ユーザー）の依存関係は別々のディレクトリを持ちます：

* **ツールチェーンの依存関係ディレクトリ:**

  `<kotlin-user-home>/kotlin-npm-tooling/<yarn|npm>/hash/node_modules`

* **ユーザーの依存関係ディレクトリ:**

  `build/wasm/node_modules`

さらに、プロジェクトディレクトリ内のロックファイルには、ユーザーが定義した依存関係のみが含まれるようになります。

この改善により、ロックファイルはあなた自身の依存関係のみに集中し、プロジェクトをクリーンに保ち、ファイルへの不要な変更を減らすことができます。

この変更は `wasm-js` ターゲットではデフォルトで有効になっています。`js` ターゲットについては、この変更はまだ実装されていません。将来のリリースで実装する計画はありますが、Kotlin 2.2.20 における `js` ターゲットの npm 依存関係の動作は以前と同じままです。

### Kotlin/Wasm と JavaScript 相互運用における例外処理の改善

以前の Kotlin では、JavaScript (JS) で投げられ、Kotlin/Wasm コードに渡される例外（エラー）を理解するのに困難がありました。

場合によっては、逆方向でも問題が発生していました。例外が Wasm コードを介して JS に投げられるか渡される際、詳細情報なしに `WebAssembly.Exception` にラップされていました。これらの Kotlin の例外処理の問題により、デバッグが困難になっていました。

Kotlin 2.2.20 から、両方向で例外のデベロッパーエクスペリエンスが向上します：

* JS から例外が投げられた際、Kotlin 側でより多くの情報を確認できるようになります。
  そのような例外が Kotlin を介して JS に戻る際、もはや `WebAssembly.Exception` にラップされることはありません。
* Kotlin から例外が投げられた際、JS 側で JS エラーとしてキャッチできるようになります。

新しい例外処理は、[`WebAssembly.JSTag`](https://webassembly.github.io/exception-handling/js-api/#dom-webassembly-jstag) 機能をサポートする最新のブラウザで自動的に動作します：

* Chrome 115+
* Firefox 129+
* Safari 18.4+

古いブラウザでは、例外処理の動作は変わりません。

### 設定なしでのブラウザデバッグのサポート

以前は、ブラウザがデバッグに必要な Kotlin/Wasm プロジェクトのソースに自動的にアクセスすることができませんでした。ブラウザで Kotlin/Wasm アプリケーションをデバッグするには、`build.gradle(.kts)` ファイルに以下のスニペットを追加して、これらのソースを提供するためにビルドを手動で設定する必要がありました：

```kotlin
devServer = (devServer ?: KotlinWebpackConfig.DevServer()).apply {
    static = (static ?: mutableListOf()).apply {
        add(project.rootDir.path)
    }
}
```

Kotlin 2.2.20 以降、[最新のブラウザ](wasm-configuration.md#browser-versions)でのアプリケーションのデバッグがそのまま動作するようになりました。Gradle の開発タスク（`*DevRun`）を実行すると、Kotlin は自動的にソースファイルをブラウザに提供するため、特別な設定なしにブレークポイントの設定、変数の調査、Kotlin コードのステップ実行が可能になります。

この変更により、手動設定の必要がなくなり、デバッグが簡素化されます。必要な設定は Kotlin Gradle プラグインに含まれるようになりました。以前に `build.gradle(.kts)` ファイルにこの設定を追加していた場合は、競合を避けるために削除してください。

ブラウザでのデバッグは、すべての Gradle `*DevRun` タスクでデフォルトで有効になっています。これらのタスクはアプリケーションだけでなくそのソースファイルも提供するため、ローカル開発にのみ使用し、ソースが公開されてしまうクラウドや本番環境では実行しないでください。

#### デバッグ中の繰り返しのリロードへの対処

ソースをデフォルトで提供すると、[Kotlin のコンパイルとバンドルが完了する前に、ブラウザでアプリケーションが繰り返しリロードされる](https://youtrack.jetbrains.com/issue/KT-80582/Multiple-reloads-when-using-webpack-dev-server-after-2.2.20-Beta2#focus=Comments-27-12596427.0-0) 原因になることがあります。
回避策として、Kotlin ソースファイルを無視し、提供される静的ファイルの監視を無効にするように webpack 設定を調整してください。プロジェクトのルートにある `webpack.config.d` ディレクトリに、以下の内容の `.js` ファイルを追加します：

```kotlin
config.watchOptions = config.watchOptions || {
    ignored: ["**/*.kt", "**/node_modules"]
}

if (config.devServer) {
    config.devServer.static = config.devServer.static.map(file => {
        if (typeof file === "string") {
        return { directory: file,
                 watch: false,
        }
    } else {
        return file
    }
    })
}
```

### 空の `yarn.lock` ファイルの排除

以前の Kotlin Gradle プラグイン (KGP) は、Kotlin ツールチェーンが必要とする npm パッケージや、プロジェクトや使用ライブラリから既存の [npm](https://www.npmjs.com/) 依存関係に関する情報を含む `yarn.lock` ファイルを自動的に生成していました。

現在、KGP はツールチェーンの依存関係を個別に管理しており、プロジェクトに npm 依存関係がない限り、プロジェクトレベルの `yarn.lock` ファイルは生成されなくなりました。

KGP は npm 依存関係が追加されたときに `yarn.lock` ファイルを自動的に作成し、npm 依存関係が削除されたときに `yarn.lock` ファイルを削除します。

この変更により、プロジェクト構造がクリーンになり、実際の npm 依存関係がいつ導入されたかを追跡しやすくなります。

この動作を設定するために追加の手順は必要ありません。Kotlin 2.2.20 以降の Kotlin/Wasm プロジェクトにデフォルトで適用されます。

### 完全修飾クラス名における新しいコンパイラエラー

Kotlin/Wasm では、アプリケーションのサイズ増大を避けるため、コンパイラは生成されたバイナリにクラスの完全修飾名 (FQN) をデフォルトで保存しません。

その結果、以前の Kotlin リリースでは、`KClass::qualifiedName` プロパティを呼び出すと、クラスの修飾名の代わりに空の文字列が返されていました。

Kotlin 2.2.20 以降、修飾名機能を明示的に有効にしない限り、Kotlin/Wasm プロジェクトで `KClass::qualifiedName` プロパティを使用するとコンパイラがエラーを報告するようになります。

この変更により、`qualifiedName` プロパティを呼び出した際、予期せぬ空の文字列が返されるのを防ぎ、コンパイル時に問題を捉えることでデベロッパーエクスペリエンスが向上します。

この診断はデフォルトで有効になっており、エラーは自動的に報告されます。この診断を無効にし、Kotlin/Wasm で FQN の保存を許可するには、`build.gradle(.kts)` ファイルに以下のオプションを追加して、すべてのクラスの完全修飾名を保存するようにコンパイラに指示してください：

```kotlin
kotlin {
    wasmJs {
        ...
        compilerOptions {
            freeCompilerArgs.add("-Xwasm-kclass-fqn")
        }
    }
}
```

> このオプションを有効にすると、アプリケーションのサイズが大きくなることに注意してください。
>
{style="note"}

## Kotlin/JS

Kotlin 2.2.20 では、Kotlin の `Long` 型を表現するために `BigInt` 型を使用することをサポートし、エクスポートされた宣言で `Long` を利用できるようになりました。さらに、Node.js 引数をクリーンアップするための DSL 関数が追加されました。

### Kotlin の `Long` 型を表現するための `BigInt` 型の使用
<primary-label ref="experimental-opt-in"/>

ES2020 標準以前、JavaScript (JS) は 53 ビットを超える正確な整数のためのプリミティブ型をサポートしていませんでした。

このため、Kotlin/JS は（64 ビット幅である）`Long` 値を、2 つの `number` プロパティを持つ JavaScript オブジェクトとして表現していました。このカスタム実装により、Kotlin と JavaScript 間の相互運用性がより複雑になっていました。

Kotlin 2.2.20 以降、最新の JavaScript (ES2020) にコンパイルする際、Kotlin/JS は Kotlin の `Long` 値を表現するために JavaScript の組み込みの `BigInt` 型を使用するようになりました。

この変更により、Kotlin 2.2.20 で導入されたもう一つの機能である [JavaScript への `Long` 型のエクスポート](#usage-of-long-in-exported-declarations) が可能になります。結果として、この変更は Kotlin と JavaScript 間の相互運用性を簡素化します。

これを有効にするには、`build.gradle(.kts)` ファイルに以下のコンパイラオプションを追加する必要があります：

```kotlin
kotlin {
    js {
        ...
        compilerOptions {
            freeCompilerArgs.add("-Xes-long-as-bigint")
        }
    }
}
```

この機能は [実験的（Experimental）](components-stability.md#stability-levels-explained) です。フィードバックは課題トラッカー [YouTrack](https://youtrack.jetbrains.com/issue/KT-57128) でお待ちしております。

#### エクスポートされた宣言における `Long` の使用

Kotlin/JS がカスタムの `Long` 表現を使用していたため、JavaScript から Kotlin の `Long` を操作するための直接的な方法を提供することは困難でした。その結果、`Long` 型を使用する Kotlin コードを JavaScript にエクスポートすることはできませんでした。この問題は、関数のパラメータ、クラスのプロパティ、コンストラクタなど、`Long` を使用するすべてのコードに影響を与えていました。

Kotlin の `Long` 型が JavaScript の `BigInt` 型にコンパイルできるようになったため、Kotlin/JS は `Long` 値の JavaScript へのエクスポートをサポートし、Kotlin と JavaScript コード間の相互運用性を簡素化しました。

この機能を有効にするには：

1. `build.gradle(.kts)` ファイルの `freeCompilerArgs` 属性に以下のコンパイラオプションを追加して、Kotlin/JS での `Long` のエクスポートを許可します：

    ```kotlin
    kotlin {
        js {
            ...
            compilerOptions {                   
                freeCompilerArgs.add("-XXLanguage:+JsAllowLongInExportedDeclarations")
            }
        }
    }
    ```

2. `BigInt` 型を有効にします。有効化の方法については、[Kotlin の `Long` 型を表現するための `BigInt` 型の使用](#usage-of-the-bigint-type-to-represent-kotlin-s-long-type) を参照してください。

### 引数を整理するための新しい DSL 関数

Kotlin/JS アプリケーションを Node.js で実行する際、プログラムに渡される引数 (`args`) には通常以下が含まれていました：

* 実行ファイル `Node` へのパス。
* あなたのスクリプトへのパス。
* 提供した実際のコマンドライン引数。

しかし、`args` の期待される動作は、コマンドライン引数のみを含むことでした。これを実現するために、`build.gradle(.kts)` ファイル内または Kotlin コード内で、`drop()` 関数を使用して最初の 2 つの引数を手動でスキップする必要がありました：

```kotlin
fun main(args: Array<String>) {
    println(args.drop(2).joinToString(", "))
}
```

この回避策は繰り返される作業で、エラーが発生しやすく、プラットフォーム間でコードを共有する際にもうまく機能しませんでした。

この問題を解決するために、Kotlin 2.2.20 では `passCliArgumentsToMainFunction()` という新しい DSL 関数が導入されました。

この関数を使用すると、コマンドライン引数のみが含まれ、`Node` とスクリプトのパスは除外されます：

```kotlin
fun main(args: Array<String>) {
    // drop() を使う必要はなく、カスタム引数のみが含まれます 
    println(args.joinToString(", "))
}
```

この変更により、ボイラープレートコードが削減され、引数の手動ドロップによるミスが防止され、クロスプラットフォームの互換性が向上します。

この機能を有効にするには、`build.gradle(.kts)` ファイル内に以下の DSL 関数を追加してください：

```kotlin
kotlin {
    js {
        nodejs {
            passCliArgumentsToMainFunction()
        }
    }
}
```

## Gradle

Kotlin 2.2.20 では、Gradle ビルドレポートの Kotlin/Native タスクに新しいコンパイラパフォーマンス指標が追加され、インクリメンタル・コンパイルの使い勝手が向上しました。

### Kotlin/Native タスクのビルドレポートにおける新しいコンパイラパフォーマンス指標

Kotlin 1.7.0 では、コンパイラのパフォーマンスを追跡しやすくするために [ビルドレポート](gradle-compilation-and-caches.md#build-reports) を導入しました。それ以来、これらのレポートをより詳細にし、パフォーマンスの問題を調査するのに役立つよう、さらに多くの指標を追加してきました。

Kotlin 2.2.20 では、ビルドレポートに Kotlin/Native タスクのコンパイラパフォーマンス指標が含まれるようになりました。

ビルドレポートの詳細と設定方法については、[ビルドレポートを有効にする](gradle-compilation-and-caches.md#enabling-build-reports) を参照してください。

### Kotlin/JVM のインクリメンタル・コンパイル改善のプレビュー
<primary-label ref="experimental-general"/>

Kotlin 2.0.0 では、最適化されたフロントエンドを備えた新しい K2 コンパイラが導入されました。Kotlin 2.2.20 では、この新しいフロントエンドを使用して、Kotlin/JVM の特定の複雑なインクリメンタル・コンパイル・シナリオにおけるパフォーマンスを向上させることで、これをさらに発展させています。

これらの改善は、動作の安定化を図っている間はデフォルトで無効になっています。これらを有効にするには、`gradle.properties` ファイルに以下のプロパティを追加してください：

```none
kotlin.incremental.jvm.fir=true
```

現在、[`kapt` コンパイラプラグイン](kapt.md) はこの新しい動作と互換性がありません。将来の Kotlin リリースでサポートを追加するよう取り組んでいます。

この機能に関するフィードバックは [YouTrack](https://youtrack.jetbrains.com/issue/KT-72822) でお待ちしております。

### インクリメンタル・コンパイルによるインライン関数のラムダの変更の検知

Kotlin 2.2.20 以前は、インクリメンタル・コンパイルを有効にしてインライン関数内のラムダのロジックを変更しても、コンパイラは他のモジュールにあるそのインライン関数の呼び出し元を再コンパイルしませんでした。その結果、それらの呼び出し元は古いバージョンのラムダを使用し続け、予期せぬ動作を引き起こす可能性がありました。

Kotlin 2.2.20 では、コンパイラがインライン関数のラムダの変更を検出し、その呼び出し元を自動的に再コンパイルするようになりました。

### ライブラリ公開のための改善

Kotlin 2.2.20 では、ライブラリの公開を容易にする新しい Gradle タスクが追加されました。これらのタスクは、キーペアの生成、公開キーのアップロード、および Maven Central リポジトリにアップロードする前に検証プロセスが成功することを確認するためのローカルチェックの実行を支援します。

公開プロセスの一環としてこれらのタスクを使用する方法の詳細については、[ライブラリを Maven Central に公開する](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-libraries.html) を参照してください。

#### PGP キーの生成とアップロードのための新しい Gradle タスク

Kotlin 2.2.20 以前、マルチプラットフォーム・ライブラリを Maven Central リポジトリに公開する場合、公開物に署名するためのキーペアを生成するために `gpg` のようなサードパーティプログラムをインストールする必要がありました。現在、Kotlin Gradle プラグインにはキーペアの生成と公開キーのアップロードを可能にする Gradle タスクが付属しているため、別のプログラムをインストールする必要はありません。

##### キーペアの生成

`generatePgpKeys` タスクはキーペアを生成します。これを実行する際、秘密鍵ストアのパスワードとあなたの名前を以下の形式で提供する必要があります：

```bash
./gradlew -Psigning.password=example-password generatePgpKeys --name "John Smith <john@example.com>"
```

このタスクはキーペアを `build/pgp` ディレクトリに保存します。

> 誤った削除や不正なアクセスを防ぐため、キーペアを安全な場所に移動してください。
> 
{style="warning"}

##### 公開キーのアップロード

`uploadPublicPgpKey` タスクは、公開キーを Ubuntu のキーサーバー `keyserver.ubuntu.com` にアップロードします。実行時に、`.asc` 形式の公開キーへのパスを指定してください：

```bash
./gradlew uploadPublicPgpKey --keyring /path_to/build/pgp/public_KEY_ID.asc
```

#### 検証をローカルでテストするための新しい Gradle タスク

Kotlin 2.2.20 では、ライブラリを Maven Central リポジトリにアップロードする前に検証をローカルでテストするための Gradle タスクも追加されました。

Kotlin Gradle プラグインを Gradle の [Signing Plugin](https://docs.gradle.org/current/userguide/signing_plugin.html) および [Maven Publish Plugin](https://docs.gradle.org/current/userguide/publishing_maven.html) と併用している場合、`checkSigningConfiguration` および `checkPomFileFor<PUBLICATION_NAME>Publication` タスクを実行して、セットアップが Maven Central の要件を満たしているか確認できます。`<PUBLICATION_NAME>` はあなたの公開名に置き換えてください。

これらのタスクは `build` や `check` Gradle タスクの一部として自動的に実行されないため、手動で実行する必要があります。例えば、`KotlinMultiplatform` 公開がある場合：

```bash
./gradlew checkSigningConfiguration checkPomFileForKotlinMultiplatformPublication
```

`checkSigningConfiguration` タスクは以下を確認します：

* Signing Plugin にキーが設定されていること。
* 設定された公開キーが `keyserver.ubuntu.com` または `keys.openpgp.org` キーサーバーのいずれかにアップロードされていること。
* すべての公開で署名が有効になっていること。

これらのチェックのいずれかが失敗した場合、タスクは問題を修正する方法に関する情報とともにエラーを返します。

`checkPomFileFor<PUBLICATION_NAME>Publication` タスクは、`pom.xml` ファイルが Maven Central の [要件](https://central.sonatype.org/publish/requirements/#required-pom-metadata) を満たしているかを確認します。満たしていない場合、タスクは `pom.xml` ファイルのどの部分が準拠していないかに関する詳細とともにエラーを返します。

## Maven: `kotlin-maven-plugin` における Kotlin デーモンのサポート

Kotlin 2.2.20 では、[Kotlin 2.2.0 で導入されたビルドツール API](whatsnew22.md#new-experimental-build-tools-api) をさらに一歩進め、`kotlin-maven-plugin` における [Kotlin デーモン](kotlin-daemon.md) のサポートを追加しました。Kotlin デーモンを使用すると、Kotlin コンパイラは別の隔離されたプロセスで実行され、他の Maven プラグインによるシステムプロパティの上書きを防止します。例についてはこちらの [YouTrack 課題](https://youtrack.jetbrains.com/issue/KT-43894/Maven-Windows-error-RuntimeException-Could-not-find-installation-home-path) をご覧ください。

Kotlin 2.2.20 以降、Kotlin デーモンがデフォルトで使用されます。以前の動作に戻したい場合は、`pom.xml` ファイルで以下のプロパティを `false` に設定してオプトアウトしてください：

```xml
<properties>
    <kotlin.compiler.daemon>false</kotlin.compiler.daemon>
</properties>
```

Kotlin 2.2.20 では、Kotlin デーモンのデフォルトの JVM 引数をカスタマイズするために使用できる新しい `jvmArgs` プロパティも導入されました。例えば、`-Xmx` および `-Xms` オプションを上書きするには、`pom.xml` ファイルに以下を追加します：

```xml
<properties>
    <kotlin.compiler.daemon.jvmArgs>Xmx1500m,Xms500m</kotlin.compiler.daemon.jvmArgs>
</properties>
```

## Kotlin コンパイラオプションの新しい共通スキーマ

Kotlin 2.2.20 では、[`org.jetbrains.kotlin:kotlin-compiler-arguments-description`](https://central.sonatype.com/artifact/org.jetbrains.kotlin/kotlin-compiler-arguments-description) の下で公開されるすべてのコンパイラオプションの共通スキーマが導入されました。このアーティファクトには、すべてのコンパイラオプションのコード表現と JSON 同等物（JVM 以外のコンシューマー向け）、それらの説明、および各オプションが導入または安定化されたバージョンなどのメタデータが含まれています。このスキーマを使用して、オプションのカスタムビューを生成したり、必要に応じて分析したりできます。

## 標準ライブラリ

このリリースでは、標準ライブラリに新しい実験的機能が導入されました。Kotlin/JS でのインターフェース型識別のためのリフレクションサポート、一般的なアトミック型向けの更新関数、および配列リサイズのための `copyOf()` オーバーロードです。

### Kotlin/JS でのリフレクションを介したインターフェース型の識別のサポート
<primary-label ref="experimental-opt-in"/>

Kotlin 2.2.20 では、[実験的 (Experimental)](components-stability.md#stability-levels-explained) な [`KClass.isInterface`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/is-interface.html) プロパティが Kotlin/JS 標準ライブラリに追加されました。

このプロパティを使用すると、クラス参照が Kotlin のインターフェースを表しているかどうかを確認できるようになりました。これにより、`KClass.java.isInterface` を使用してクラスがインターフェースを表すか確認できる Kotlin/JVM との同等性に近づきます。

オプトインするには、`@OptIn(ExperimentalStdlibApi::class)` アノテーションを使用してください：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun inspect(klass: `KClass<*>`) {
    // インターフェースの場合は true を出力
    println(klass.isInterface)
}
```

フィードバックは課題トラッカー [YouTrack](https://youtrack.jetbrains.com/issue/KT-78581) でお待ちしております。

### 一般的なアトミック型向けの新しい更新関数
<primary-label ref="experimental-opt-in"/>

Kotlin 2.2.20 では、一般的なアトミック型およびそれらに対応する配列の要素を更新するための、新しい実験的関数が導入されました。各関数は、これらの更新関数のいずれかを使用してアトミックに新しい値を計算し、現在の値を置き換えます。戻り値は使用する関数によって異なります：

* [`update()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/update.html) および [`updateAt()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/update-at.html) は、結果を返さずに新しい値を設定します。
* [`fetchAndUpdate()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/fetch-and-update.html) および [`fetchAndUpdateAt()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/fetch-and-update-at.html) は、新しい値を設定し、変更前の値を返します。
* [`updateAndFetch()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/update-and-fetch.html) および [`updateAndFetchAt()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/update-and-fetch-at.html) は、新しい値を設定し、変更後の更新された値を返します。

これらの関数を使用すると、乗算やビット演算など、標準でサポートされていないアトミックな変換を実装できます。この変更以前は、一般的なアトミック型をインクリメントして以前の値を読み取るには、[`compareAndSet()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent/-atomic-int/compare-and-set.html) 関数を使用したループが必要でした。

一般的なアトミック型のすべての API と同様に、これらの関数は [実験的 (Experimental)](components-stability.md#stability-levels-explained) です。オプトインするには、`@OptIn(ExperimentalAtomicApi::class)` アノテーションを使用してください。

以下は、さまざまな種類の更新を実行し、以前の値または更新された値を返すコードの例です：

```kotlin
import kotlin.concurrent.atomics.*
import kotlin.random.Random

@OptIn(ExperimentalAtomicApi::class)
fun main() {
    val counter = AtomicLong(Random.nextLong())
    val minSetBitsThreshold = 20

    // 結果を使用せずに新しい値を設定
    counter.update { if (it < 0xDECAF) 0xCACA0 else 0xC0FFEE }

    // 現在の値を取得してから更新
    val previousValue = counter.fetchAndUpdate { 0x1CEDL.shl(Long.SIZE_BITS - it.countLeadingZeroBits()) or it }

    // 値を更新してから結果を取得
    val current = counter.updateAndFetch {
        if (it.countOneBits() < minSetBitsThreshold) it.shl(20) or 0x15BADL else it
    }

    val hexFormat = HexFormat {
        upperCase = true
        number {
            removeLeadingZeros = true
        }
    }
    println("Previous value: ${previousValue.toHexString(hexFormat)}")
    println("Current value: ${current.toHexString(hexFormat)}")
    println("Expected status flag set: ${current and 0xBAD != 0xBADL}")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.2.20"}

フィードバックは課題トラッカー [YouTrack](https://youtrack.jetbrains.com/issue/KT-76389) でお待ちしております。

### 配列に対する `copyOf()` オーバーロードのサポート
<primary-label ref="experimental-opt-in"/>

Kotlin 2.2.20 では、[`copyOf()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/copy-of.html) 関数の実験的なオーバーロードが導入されました。これは、ジェネリック型 `Array<T>` の配列およびすべてのプリミティブ配列型で利用可能です。

この関数を使用して配列を大きくし、初期化子ラムダからの値を使用して新しい要素を埋めることができます。これにより、カスタムのボイラープレートコードを削減でき、ジェネリックな `Array<T>` をリサイズすると nullable な結果 (`Array<T?>`) が生成されてしまうという一般的な問題が解決されます。

例を挙げます：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val row1: `Array<String>` = arrayOf("one", "two")
    // 配列をリサイズし、ラムダを使用して新しい要素を埋める
    val row2: `Array<String>` = row1.copyOf(4) { "default" }
    println(row2.contentToString())
    // [one, two, default, default]
}
```

この API は [実験的 (Experimental)](components-stability.md#stability-levels-explained) です。オプトインするには、`@OptIn(ExperimentalStdlibApi::class)` アノテーションを使用してください。

フィードバックは [課題トラッカー](https://youtrack.jetbrains.com/issue/KT-70984) でお待ちしております。

## Compose コンパイラ

このリリースでは、Compose コンパイラに新しい警告が追加され、ビルド指標の出力が読みやすくなるよう改善されました。

### デフォルトパラメータの言語バージョン制限

本リリースでは、抽象（abstract）またはオープン（open）な composable 関数におけるデフォルトパラメータをサポートするために必要な言語バージョンよりも低い言語バージョンがコンパイルに指定されている場合、Compose コンパイラがエラーを報告するようになりました。

デフォルトパラメータは、抽象関数の場合は Kotlin 2.1.0 から、オープン関数の場合は Kotlin 2.2.0 から Compose コンパイラでサポートされています。新しいバージョンの Compose コンパイラを使用しながら古い Kotlin 言語バージョンをターゲットにする場合、言語バージョンがそれらをサポートしていなくても、抽象またはオープン関数のデフォルトパラメータがパブリック API に表示される可能性があることに、ライブラリ開発者は注意する必要があります。

### K2 コンパイラにおける Composable ターゲットの警告

本リリースでは、K2 コンパイラを使用する際の [`@ComposableTarget`](https://developer.android.com/reference/kotlin/androidx/compose/runtime/ComposableTarget) の不一致に関する警告が追加されました。

例：

```text
@Composable fun App() {
  Box { // <-- `Box` は `@UiComposable` です
    Path(...) // <-- `Path` は `@VectorComposable` です
    ^^^^^^^^^
    warning: Calling a Vector composable function where a UI composable was expected
  }
}
```
### ビルド指標における完全修飾名

ビルド指標で報告されるクラス名と関数名が完全修飾（fully qualified）されるようになり、異なるパッケージにある同名の宣言を区別しやすくなりました。

さらに、ビルド指標にはデフォルトパラメータからの複雑な式のダンプが含まれなくなり、読みやすくなりました。

## 破壊的変更と非推奨

このセクションでは、注目すべき重要な破壊的変更と非推奨事項をハイライトします：

* [kapt](kapt.md) コンパイラプラグインは、デフォルトで K2 コンパイラを使用するようになりました。その結果、プラグインが K2 コンパイラを使用するかどうかを制御する `kapt.use.k2` プロパティは非推奨となりました。K2 コンパイラの使用をオプトアウトするためにこのプロパティを `false` に設定すると、Gradle は警告を表示します。

## ドキュメントの更新

Kotlin ドキュメントには、いくつかの注目すべき変更が加えられました：

* [Kotlin ロードマップ](roadmap.md) – 言語とエコシステムの進化に関する Kotlin の優先事項の更新されたリストをご覧ください。
* [プロパティ](properties.md) – Kotlin でプロパティを使用するさまざまな方法について学びます。
* [条件とループ](control-flow.md) – Kotlin で条件とループがどのように機能するかを学びます。
* [Kotlin/JavaScript](js-overview.md) – Kotlin/JS のユースケースを探索します。
* [Web をターゲットにする](gradle-configure-project.md#targeting-the-web) – Gradle が Web 開発向けに提供するさまざまなターゲットについて学びます。
* [Kotlin デーモン](kotlin-daemon.md) – Kotlin デーモンと、それがビルドシステムや Kotlin コンパイラとどのように連携するかについて学びます。
* [コルーチンの概要ページ](coroutines-overview.md) – コルーチンの概念を学び、学習の旅を始めましょう。
* [Kotlin/Native バイナリオプション](native-binary-options.md) – Kotlin/Native のバイナリオプションとその設定方法について学びます。
* [Kotlin/Native のデバッグ](native-debugging.md) – Kotlin/Native でデバッグするさまざまな方法を探索します。
* [LLVM バックエンドのカスタマイズのヒント](native-llvm-passes.md) – Kotlin/Native が LLVM をどのように使用するかを学び、最適化パスを調整します。
* [Exposed の DAO API を使い始める](https://www.jetbrains.com/help/exposed/get-started-with-exposed-dao.html) – Exposed の Data Access Object (DAO) API を使用して、リレーショナルデータベースにデータを保存および取得する方法を学びます。
* R2DBC に関する Exposed ドキュメントの新しいページ：
  * [データベースの操作](https://www.jetbrains.com/help/exposed/working-with-database.html)
  * [ConnectionFactory の操作](https://www.jetbrains.com/help/exposed/working-with-connectionfactory.html)
  * [カスタム型マッピング](https://www.jetbrains.com/help/exposed/custom-type-mapping.html)
* [HTMX 統合](https://ktor.io/docs/htmx-integration.html) – Ktor がどのように HTMX に対して実験的でファーストクラスのサポートを提供しているかを学びます。

## Kotlin 2.2.20 へのアップデート方法

Kotlin プラグインは、IntelliJ IDEA および Android Studio のバンドルプラグインとして配布されています。

新しい Kotlin バージョンにアップデートするには、ビルドスクリプトで [Kotlin バージョンを 2.2.20 に変更](releases.md#update-to-a-new-kotlin-version) してください。