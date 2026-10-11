[//]: # (title: Kotlin 2.4.20 の新機能)

<show-structure depth="1"/>

<web-summary>新しい実験的機能や標準ライブラリ、Native、Wasm、JS、Gradle、BTA、Kotlin コンパイラーのアップデートを網羅した Kotlin 2.4.20 リリースノートをお読みください</web-summary>

_[公開日: 2026年9月7日](releases.md#release-history)_

<tldr>
    <p>バグ修正リリース 2.4.21 の詳細については、<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.21">チェンジログ</a>を参照してください</p>
</tldr>

Kotlin 2.4.20 がリリースされました！リリースのハイライトは以下の通りです：

* **標準ライブラリ:** [コルーチンのスタックトレース復旧のサポート、コレクション要素の等価性と一意性をチェックする新しい関数、`kotlin.test` アサーション関数の新しいオーバーロード](#standard-library)
* **Kotlin/Native:** [新しい Swift エクスポート機能、インクリメンタルコンパイルの改善、SwiftPM 依存関係向けの `Package.swift` ファイルの自動生成](#kotlin-native)
* **Kotlin/Wasm:** [`@JsFun` 宣言内のトップレベル `require()` 呼び出しの変更、コンパニオンオブジェクトの初期化順序の改善、Kotlin Gradle プラグインにおける Wasmtime のサポート、新しいコンパイルモード、ファンクショナルインターフェースのバイナリサイズ削減](#kotlin-wasm)
* **Kotlin/JS:** [ブラウザテスト用の新しい DSL、suspend ラムダを async 関数としてエクスポートするサポート、データクラスのエクスポート性の改善](#kotlin-js)
* **Gradle:** [Gradle 9.7.0 のサポートと Problems API におけるレポート機能の改善](#gradle)
* **ビルドツール API (Build tools API):** [新しいターゲット（Kotlin/JS、Kotlin/Wasm、Kotlin メタデータ）のサポート](#build-tools-api)
* **Kotlin コンパイラー:** [`kotlinr` ランナーコマンドと独立したネイティブイメージ](#kotlin-compiler)

アップデートの概要は以下の動画でもご確認いただけます：

<video src="https://www.youtube.com/v/UhRfN7fx5rs" title="What's New in Kotlin 2.4.20"/>

> Kotlin のリリースサイクルに関する詳細については、[Kotlin のリリースプロセス](releases.md)を参照してください。
>
{style="tip"}

## Kotlin 2.4.20 へのアップデート {id="update-to-kotlin-2-4-20"}

Kotlin の最新バージョンは、[IntelliJ IDEA](https://www.jetbrains.com/idea/download/) および [Android Studio](https://developer.android.com/studio) の最新バージョンに含まれています。

新しい Kotlin バージョンにアップデートするには、IDE が最新バージョンに更新されていることを確認し、ビルドスクリプトで [Kotlin のバージョンを 2.4.20 に変更](releases.md#update-to-a-new-kotlin-version)してください。

## 新機能 {id=new-stable-features}
<primary-label ref="stable"/>

Kotlin 2.2.20 では、JVM 21 以降で `invokedynamic` を使用して `when` 式をコンパイルする実験的サポートが導入されました。

Kotlin 2.4.20 では、この機能が[安定版 (Stable)](components-stability.md#stability-levels-explained)へと昇格し、デフォルトで有効になりました。

詳細については、[ドキュメント](control-flow.md#bytecode-generation-on-the-jvm)を参照してください。

## 新機能 {id=new-experimental-features}
<primary-label ref="experimental-exp"/>

本リリースでは、[Beta](components-stability.md#stability-levels-explained)、[Alpha](components-stability.md#stability-levels-explained)、および [Experimental](components-stability.md#stability-levels-explained) ステータスのものを含む、以下の安定版前の機能が利用可能です：

* [標準ライブラリ: コルーチンのスタックトレース復旧のサポート](#support-for-coroutine-stack-trace-recovery)
* [標準ライブラリ: コレクション要素の等価性と一意性をチェックする新しい関数](#new-functions-to-check-collection-elements-for-equality-and-uniqueness)
* [標準ライブラリ: `kotlin.test` アサーション関数の新しいオーバーロード](#new-overloads-for-kotlin-test-assertion-functions)
* [Kotlin/Native: 新しい Swift エクスポート機能](#new-swift-export-features)
* [Kotlin/Native: `klib` アーティファクトのインクリメンタルコンパイルの改善](#improved-incremental-compilation-of-klib-artifacts)
* [Kotlin/JS: ブラウザテスト用の新しい DSL](#a-new-dsl-for-browser-testing)
* [Kotlin/JS: suspend ラムダを async 関数としてエクスポートするサポート](#support-for-exporting-suspending-lambdas-as-async-functions)
* [ビルドツール API: Kotlin/JS、Kotlin/Wasm、Kotlin メタデータのサポート](#support-for-kotlin-js-kotlin-wasm-and-kotlin-metadata)
* [Kotlin コンパイラー: 独立したネイティブイメージ](#native-image)

## 標準ライブラリ (Standard library) {id="standard-library"}

Kotlin 2.4.20 では、コルーチンのスタックトレース復旧のサポートが追加されたほか、コレクション要素の等価性や一意性をチェックする新しい関数、および `kotlin.test` アサーション関数の新しいオーバーロードが導入されました。

### コルーチンのスタックトレース復旧のサポート {id="support-for-coroutine-stack-trace-recovery"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin 2.4.20 では、標準ライブラリに [`StackTraceRecoverable`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines.debug/-stack-trace-recoverable/) インターフェースが追加されました。これにより、`kotlinx.coroutines` への依存関係を追加することなく、スタックトレース復旧（stack trace recovery）のために新しい例外インスタンスを作成する方法を定義できるようになり、`kotlinx.coroutines` ライブラリとの統合が向上します。

スタックトレース復旧は、あるコルーチンが例外をスローし、別のコルーチンがそれを再スローする場合のデバッグに役立ちます。例外がどこで発生し、別のコルーチンがどこでそれを再スローしたかを確認できるようになります。

`kotlinx.coroutines` ライブラリは、追加のコルーチンスタックトレース情報を含む新しい例外インスタンスを作成することで、スタックトレース復旧を実行します。これは、例外メッセージのみ、原因（cause）のみ、両方、または引数を取らないコンストラクタを持つ例外に対して自動的に行われます。

行番号やエラーコードなど、例外コンストラクタに追加の必須引数がある場合は、`StackTraceRecoverable` インターフェースを実装して、`kotlinx.coroutines` ライブラリがその例外の新しいインスタンスをどのように作成するかを定義します。

このインターフェースを実装するには、[`copyForStackTraceRecovery()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines.debug/-stack-trace-recoverable/copy-for-stack-trace-recovery.html) 関数をオーバーライドします。オーバーライド内では、スタックトレース復旧用の新しい例外インスタンスを返すか、`kotlinx.coroutines` ライブラリに例外をコピーさせたくない場合は `null` を返します。

> `StackTraceRecoverable` インターフェースはすべてのターゲットで利用可能ですが、`kotlinx.coroutines` ライブラリがスタックトレース復旧に使用するのは JVM 上のみです。
>
{style="note"}

これらの API は[実験的 (Experimental)](components-stability.md#stability-levels-explained)であり、`@OptIn(ExperimentalStdlibCoroutineSupportApi::class)` アノテーションによるオプトインが必要です。

以下は、スタックトレース復旧用に新しいインスタンスを作成する際に `line` プロパティを保持するカスタム例外の例です：

```kotlin
import kotlin.coroutines.ExperimentalStdlibCoroutineSupportApi
import kotlin.coroutines.debug.StackTraceRecoverable

@OptIn(ExperimentalStdlibCoroutineSupportApi::class)
class FileEditException
// IllegalStateException コンストラクタに cause を渡すために、
// この実装にはプライベートコンストラクタが必要です
private constructor(
    val line: Int,
    private val detail: String,
    cause: Throwable?,
) : IllegalStateException("When editing line $line: $detail", cause),
    // スタックトレース復旧のために StackTraceRecoverable を実装します
    StackTraceRecoverable<FileEditException> {

    constructor(line: Int, detail: String) : this(line, detail, null)

    // 行番号とメッセージの詳細をコピーします
    override fun copyForStackTraceRecovery(): FileEditException =
        FileEditException(line, detail, this)
    }

fun main() {
    val original = FileEditException(15, "Unexpected token")

    // 通常、その動作をテストする場合を除き、この関数を直接呼び出す必要はありません
    // kotlinx.coroutines ライブラリがスタックトレース復旧中に自動的に呼び出します
    val copy = original.copyForStackTraceRecovery()

    println(copy.message)
    // When editing line 15: Unexpected token

    println(copy.cause == original)
    // true
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.20"}

詳細については、この機能の [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/stdlib/KEEP-0461-stacktrace-recoverable.md) を参照してください。

フィードバックは [YouTrack](https://youtrack.jetbrains.com/issue/KT-86595) にお寄せいただければ幸いです。

### コレクション要素の等価性と一意性をチェックする新しい関数 {id="new-functions-to-check-collection-elements-for-equality-and-uniqueness"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin 2.4.20 より前は、コレクションの要素がすべて異なるか、あるいはすべて等しいかをチェックしたい場合、非効率なコードパターンを使用する必要がありました。

Kotlin 2.4.20 では、このギャップを埋めるための実験的な関数が導入されました：

| 関数 | チェック内容 |
|---|---|
| [`allDistinct()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/all-distinct.html) | コレクション内のすべての値が一意である。 |
| [`allDistinctBy()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/all-distinct-by.html) | すべてのオブジェクトが、選択されたプロパティに対して一意な値を持っている。 |
| [`allEqual()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/all-equal.html) | コレクション内のすべての値が同一である。 |
| [`allEqualBy()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/all-equal-by.html) | すべてのオブジェクトが、選択されたプロパティに対して同じ値を持っている。 |

これらの関数は、コレクション、シーケンス、配列で使用できます。他のコレクション操作と同様に、構造的等価性（structural equality）を使用して要素を比較します。

これらの関数は[実験的 (Experimental)](components-stability.md#stability-levels-explained)であり、`@OptIn(ExperimentalStdlibApi::class)` アノテーションまたは `-opt-in=kotlin.ExperimentalStdlibApi` コンパイラーオプションによるオプトインが必要です：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    data class Response(
        val participantId: String,
        val answer: String,
        val responseDate: String
    )

    val responses = listOf(
        Response("P001", "Yes", "2026-07-21"),
        Response("P002", "Maybe", "2026-07-21"),
        Response("P003", "No", "2026-07-21")
    )

    // すべての参加者が同じ回答をしたかどうかをチェック
    println(responses.allEqualBy { it.answer })
    // false

    // 重複した参加者がいるかどうかをチェック
    println(responses.allDistinctBy { it.participantId })
    // true

    // すべての回答が同じ日付に送信されたかどうかをチェック
    println(responses.allEqualBy { it.responseDate })
    // true

    val answers = responses.map { it.answer }

    // 回答が同一かどうかをチェック
    println(answers.allEqual())
    // false

    // 回答がすべて異なるかどうかをチェック
    println(answers.allDistinct())
    // true
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.20"}

フィードバックは [KEEP のディスカッション](https://github.com/Kotlin/KEEP/discussions/495) にお寄せいただければ幸いです。

### `kotlin.test` アサーション関数の新しいオーバーロード {id="new-overloads-for-kotlin-test-assertion-functions"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin 2.4.20 では、`kotlin.test` アサーション関数の新しいオーバーロードが追加されました。これらは、アサーションが失敗したときにのみ遅延してエラーメッセージを生成するラムダを受け取ります。

以前は、`assertTrue()` や `assertEquals()` などの `kotlin.test` アサーション関数は、アサーションが成功してメッセージが実際には使用されない場合でも、すべてのアサーション実行時に構築される事前フォーマット済みのエラーメッセージのみを受け取っていました。

新しいオーバーロードは `kotlin.test` API を JUnit 5 と整合させ、プレーンな文字列の代わりにラムダを介してメッセージサプライヤーを受け取ります。これにより、特にアサーションの詳細なエラーメッセージを生成する [Power-assert コンパイラープラグイン](power-assert.md) においてパフォーマンスが向上します。

新しいオーバーロードは以下の各アサーション関数で利用可能です：

| 関数 | 説明 |
|---|---|
| [`assertTrue()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-true.html) / [`assertFalse()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-false.html) | 値が `true` または `false` であるかをチェックします。 |
| [`assertEquals()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-equals.html) / [`assertNotEquals()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-not-equals.html) | 値が等しいか等しくないかをチェックします。 |
| [`assertSame()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-same.html) / [`assertNotSame()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-not-same.html) | 値が同じインスタンスを参照しているかをチェックします。 |
| [`assertIs()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-is.html) / [`assertIsNot()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-is-not.html) | 値が指定された型であるかをチェックします。`assertIs()` の場合、関数はその型にスマートキャストします。 |
| [`assertNull()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-null.html) | 値が `null` であるかをチェックします。 |
| [`assertContains()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-contains.html) | 要素（キー、文字、部分文字列、または正規表現）がコレクション、配列、シーケンス、範囲、またはマップ内に存在するかをチェックします。 |
| [`assertContentEquals()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-content-equals.html) | コレクション、シーケンス、または配列に、同じ順序で等しい要素が含まれているかをチェックします。 |

新しい API を使用するには、`@OptIn(ExperimentalKotlinTestApi::class)` アノテーションで明示的にオプトインしてください：

```kotlin
import kotlin.test.ExperimentalKotlinTestApi
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@OptIn(ExperimentalKotlinTestApi::class)
fun testValues(actual: Int, expected: Int, items: List<String>) {
    // メッセージはアサーションが失敗した場合にのみ構築されます
    assertTrue(actual > 0) { "Expected a positive value but got $actual" }

    // アサーションが失敗しない限り、リストのフォーマットを回避します
    assertEquals(expected, actual) { "Unexpected value for items: ${items.joinToString()}" }
}
```

詳細については、この機能の [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/stdlib/KEEP-0465-kotlin.test-lazy-assertion-messages.md) を参照してください。

## Kotlin/Native {id="kotlin-native"}

Kotlin 2.4.20 では、Kotlin Multiplatform プロジェクトにおける SwiftPM 依存関係向けの `Package.swift` ファイルの自動生成、sealed クラスや言語間継承のサポートを含む新しい Swift エクスポート機能、およびインクリメンタルコンパイルの改善が導入されました。

### SwiftPM 依存関係向けの生成された `Package.swift` {id="generated-package-swift-for-swiftpm-dependencies"}
<secondary-label ref="native"/>

SwiftPM パッケージに依存する XCFramework をエクスポートする場合、正しく解決できるように生成された SwiftPM パッケージを公開する必要があります。これを支援するため、`assembleSharedXCFramework` Gradle タスクが XCFramework と一緒に配布される `Package.swift` ファイルを生成するようになりました。

詳細については、[SwiftPM エクスポートのページ](https://kotlinlang.org/docs/multiplatform/multiplatform-spm-export.html)を参照してください。

### 新しい Swift エクスポート機能 {id="new-swift-export-features"}
<primary-label ref="alpha"/>
<secondary-label ref="native"/>

#### Sealed クラス {id="sealed-classes"}

Kotlin 2.4.20 では、Swift エクスポートに sealed クラスおよびインターフェースのサポートが追加されました。

以前は、sealed 型に対するすべての `switch` 文に `default` ケースを記述する必要がありました。Kotlin で定義された sealed 階層が Swift の enum にマッピングされるようになり、Xcode で完全な自動補完を伴う網羅的な（exhaustive）`switch` 文が可能になりました。

Swift エクスポートは、各 sealed 型に `sealedType()` メソッドを生成します。このメソッドは、sealed 階層の直接のサブクラスに一致するケースを持つ Swift の enum を返します。これらの呼び出しをネストして、階層のより深いレベルに一致させることもできます。

例えば、Kotlin でクラス階層を持つ sealed インターフェースを宣言します：

```kotlin
// Kotlin
sealed interface Shape

class Circle : Shape {
    override fun toString(): String = "Circle"
}

class Rectangle : Shape {
    override fun toString(): String = "Rectangle"
}

fun createCircle(): Shape = Circle()
```

Swift 側では、`default` ケースなしで網羅的な `switch` を使用できます：

```swift
// Swift
let shape = createCircle()

let name = switch shape.sealedType() {
    case let .circle(type): "It's a \(type.value)"
    case let .rectangle(type): "It's a \(type.value)"
}
// name == "It's a Circle"
```

`switch` が網羅的であるため、sealed 階層に新しいサブクラスが追加された場合、コンパイラーが警告を発します。そのため、`default` ケースに頼るのではなく、すぐに対処することができます。

#### Swift エクスポートにおける言語間継承 {id="cross-language-inheritance-in-swift-export"}

Kotlin 2.4.20 では、Swift エクスポートにおける言語間継承（cross-language inheritance）のサポートが導入されました。

この機能の一般的なユースケースは[リバースインポート (reverse import)](native-lib-import-stability.md#swift-library-import) パターンです。このパターンでは、Kotlin でコントラクトを定義し、Swift 側でプラットフォーム固有の実装を提供します。これは、Kotlin に直接インポートできない純粋な Swift ライブラリを使用する必要がある場合に特に役立ちます。

このパターンを実装するには、Swift 実装が継承するための Kotlin スーパークラスと、Kotlin インターフェースを宣言します。次に、Swift でこのインターフェースを実装し、そのインターフェースを受け取る Kotlin 関数に Swift オブジェクトを渡します。
例えば、CryptoKit ライブラリの場合：

1. Kotlin 側で、インターフェース、それを受け取る関数、および `open` なベースクラスを宣言します：

   ```kotlin
   // Kotlin
   interface CryptoProvider {
       fun hashMD5(input: String): String
   }

   fun processHash(provider: CryptoProvider, input: String): String = provider.hashMD5(input)

   open class SwiftBase
   ```

2. Swift 側で、エクスポートされた `SwiftBase` クラスを継承し、純粋な Swift ライブラリを使用してインターフェースを実装し、そのオブジェクトを Kotlin に渡します：

   ```swift
   // Swift
   import CryptoKit

   final class IosCryptoProvider: SwiftBase, CryptoProvider {
       func hashMD5(input: String) -> String {
           guard let data = input.data(using: .utf8) else { return "failed" }
           return Insecure.MD5.hash(data: data).description
       }
   }

   let provider = IosCryptoProvider()

   // Kotlin 関数を呼び出し、それが Swift 側の hashMD5() を呼び出します
   print(processHash(provider: provider, input: "Hello, world!"))
   ```

Kotlin が Swift オブジェクトを受け取ると、通常のインターフェースの実装として扱い、Swift コードを直接呼び出します。

Swift エクスポートの詳細については、[ドキュメント](native-swift-export.md)を参照してください。

### `klib` アーティファクトのインクリメンタルコンパイルの改善 {id="improved-incremental-compilation-of-klib-artifacts"}
<primary-label ref="beta"/>
<secondary-label ref="native"/>

Kotlin 2.4.20 では、`klib` アーティファクトのインクリメンタルコンパイルに安定化の改善が施され、[ベータ版 (Beta)](components-stability.md#kotlin-native) になりました。

この最適化は [Kotlin 1.9.20](whatsnew1920.md#incremental-compilation-of-klib-artifacts) で初めて導入され、デバッグビルドのコンパイル時間を大幅に短縮することが実証されました。それ以降、多くのバグ修正とパフォーマンス改善を行ってきました。

インクリメンタルコンパイルを試すには、`gradle.properties` ファイルに次のオプションを追加します：

```properties
kotlin.incremental.native=true
```

現在フィードバックを積極的に収集しており、今後の Kotlin リリースですべてのプロジェクトに対してインクリメンタルコンパイルをデフォルトで有効にする予定です。問題が発生した場合は、[課題トラッカー](https://kotl.in/issue) に報告してください。

## Kotlin/Wasm {id="kotlin-wasm"}

Kotlin 2.4.20 では、Kotlin/Wasm が `@JsFun` 宣言内のトップレベル `require()` 呼び出しを処理する方法が変更され、コンパニオンオブジェクトの初期化順序が JVM の動作と整合され、ファンクショナルインターフェースのバイナリサイズが削減され、新しいコンパイルモードが導入され、Kotlin Gradle プラグインにおける `wasmWasi` ターゲットのランタイムとして Wasmtime のサポートが追加されました。

### `@JsFun` 宣言内のトップレベル `require()` 呼び出しの変更 {id="changes-to-top-level-require-calls-in-jsfun-declarations"}
<secondary-label ref="wasm"/>

Kotlin/Wasm は、[`@JsFun`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-js-fun/) 宣言がトップレベルの `require()` 関数を使用している場合にエラーを報告するようになりました。

以前は、コンパイラーが `import-object.mjs` ファイル内に `require` 変数を生成していたため、`@JsFun` 宣言から `require()` を呼び出すことが可能でした。

この動作は意図せずコンパイラーの実装詳細を公開してしまっていました。これからの移行を支援するため、Kotlin/Wasm はこの生成された `require` 宣言を削除し、コンパイラーはそのような呼び出しに対してエラーを報告するようになりました。例えば：

```kotlin
// エラーを報告します
@JsFun("(mod) => require(mod)")
external fun loadModule(mod: String): JsAny
```

この変更に備えるため、`@JsFun` 宣言内のトップレベル `require()` 呼び出しを [`@JsModule`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.js/-js-module/) アノテーションに置き換えてください：

```kotlin
@JsModule("module")
external val module: Module

external interface Module {
    // 期待されるモジュールメンバーを定義します
}
```

動的なモジュール読み込みには、代わりに `import()` 式を使用してください。webpack が動的インポートを解析しないように、`/* webpackIgnore: true */` マジックコメントを追加します：

```kotlin
@JsFun("""
    ((module) => () => module)(
        await import(/* webpackIgnore: true */ "module")
    )
""")
private external fun loadModuleDynamically(): JsAny?
```

`import()` 式を条件付きで使用することもできます。例えば、Node.js で実行されている場合にのみモジュールを読み込むことができます：

```kotlin
@JsFun("""
    ((module) => () => module)(
        ((typeof process !== "undefined") && (process.release.name === "node"))
            ? await import(/* webpackIgnore: true */ "module")
            : null
    )
""")
private external fun loadNodeModule(): JsAny?
```

プロジェクトがトップレベルの `require()` 関数を必要とする依存関係に依存している場合は、回避策としてそれを `globalThis` のプロパティとして追加します：

```kotlin
@JsFun("""
    ((module) => {
        globalThis.require = module.default.createRequire(import.meta.url)
        return () => {}
    })(await import("node:module"))
""")
external fun defineRequire()
```

問題が発生した場合は、[課題トラッカー](https://youtrack.jetbrains.com/issue/KT-86192) でフィードバックを共有してください。

### コンパニオンオブジェクトの初期化順序の改善 {id="improved-companion-object-initialization-order"}
<secondary-label ref="wasm"/>

Kotlin/Wasm は、JVM の動作に合わせて、サブクラスのコンパニオンオブジェクトよりも前にスーパークラスのコンパニオンオブジェクトを初期化するようになりました。以前は初期化が逆になることがあり、プラットフォーム間で不整合な動作が発生していました。

このアップデートにより、クロスプラットフォームの一貫性が向上し、クラスの初期化動作におけるプラットフォーム固有の差異が減少します。また、中間クラスがコンパニオンオブジェクトを宣言していない場合を含め、より深い継承階層におけるコンパニオンオブジェクトの初期化も正しく処理できるようになります。

### Kotlin Gradle プラグインにおける Wasmtime のサポート {id="support-for-wasmtime-in-the-kotlin-gradle-plugin"}
<secondary-label ref="wasm"/>

Kotlin 2.4.20 では、Kotlin Gradle プラグインにおける `wasmWasi` ターゲットのランタイムとして [Wasmtime](https://docs.wasmtime.dev/) のサポートが導入されました。

以前は、`wasmWasi` ターゲットは Node.js ランタイムのみをサポートしており、WASI アプリケーションを実行するには JavaScript のブートストラップが必要でした。Wasmtime のサポートにより、スタンドアロンの WebAssembly ランタイム上で Kotlin/Wasm アプリケーションを実行できるようになりました。

`wasmWasi` ターゲットのランタイムとして Wasmtime を使用するには、Gradle ビルドファイルに `wasmtime()` を追加します：

```kotlin
kotlin {
    wasmWasi {
        wasmtime()
    }
}
```

フィードバックは [YouTrack](https://youtrack.jetbrains.com/issue/KT-86633) にお寄せいただければ幸いです。

### 新しいコンパイルモード {id="new-compilation-modes"}
<secondary-label ref="wasm"/>

Kotlin 2.4.20 では、新しいマルチモジュールモードを含む Kotlin/Wasm コンパイルモードを選択できるようになりました。以前は、コンパイラーはモノリス（monolith）コンパイルモードを使用していました。これは、プロジェクトとその依存関係を一緒にコンパイルし、単一のバイナリを生成するモードです。これにより、コンパイラーはデッドコード削除を実行し、最も小さい出力を生成できます。

以下のコンパイルモードのいずれかを選択できるようになりました：

| コンパイルモード | コンパイル | 出力 | 最適化の動作 |
|---|---|---|---|
| `monolith` (デフォルト) | プロジェクトとその依存関係をまとめてコンパイルします。 | 単一のバイナリ | 到達不能な宣言を削除し、依存関係を含むプログラム全体に対して最適化を適用します。 |
| `multimodule-open-world` | 各モジュールを個別にコンパイルし、変更されたモジュールのみを再コンパイルします。 | モジュールごとに独立した個別のバイナリ | モジュール間の最適化は適用されないため、バイナリサイズは大きくなります。 |
| `multimodule-closed-world` | 1 回の呼び出しですべてのモジュールを処理し、変更されたモジュールのみを再コンパイルします。 | 相互に依存する個別のバイナリ | 到達不能な宣言は削除されますが、各 Wasm バイナリは個別に最適化されます。 |

コンパイルモードを選択するには、`gradle.properties` ファイルに `kotlin.wasm.compilationMode` プロパティを追加します：

```properties
kotlin.wasm.compilationMode=multimodule-open-world
```

また、開発ビルドにはクローズドワールド（closed-world）マルチモジュールコンパイルを使用し、本番ビルドにはモノリスコンパイルを使用するように Kotlin/Wasm を設定することもできます。これにより、開発中の再コンパイル時間を短縮しつつ、本番ビルドでは最小の出力を生成できます。

この構成を使用するには、`gradle.properties` ファイルに次のプロパティを追加します：

```properties
kotlin.wasm.compilationMode=multimodule-closed-world-only-in-dev
```

フィードバックは [YouTrack](https://youtrack.jetbrains.com/issue/KT-86919) にお寄せいただければ幸いです。

### ラムダとファンクショナルインターフェースのバイナリサイズ削減 {id="reduced-binary-size-for-lambdas-and-functional-interfaces"}
<secondary-label ref="wasm"/>

Kotlin 2.4.20 では、Kotlin/Wasm がラムダとファンクショナルインターフェース（functional interface）をコンパイルする方法が変更されました。
個別の匿名クラスを生成する代わりに、コンパイラーが関数を生成し、共通のベースクラスを使用するようになりました。

[KotlinConf アプリケーション](https://github.com/JetBrains/kotlinconf-app) を使用したテストでは、この変更によって Wasm バイナリサイズが約 5〜10% 削減されることが示されています。

この変更により動的な呼び出しが増加するため、実行時パフォーマンスに影響を与える可能性があります。
問題が発生した場合は、[課題トラッカー](https://youtrack.jetbrains.com/issue/KT-83159) に報告してください。

## Kotlin/JS {id="kotlin-js"}

Kotlin 2.4.20 では、データクラスのエクスポート性の改善、ブラウザテスト用の新しい実験的 DSL の導入、suspend ラムダを JavaScript の async 関数としてエクスポートするサポートの追加が行われました。

### エクスポートされたデータクラスにおける合成関数のエクスポート性の一貫性 {id="consistent-exportability-of-synthetic-functions-on-exported-data-classes"}
<secondary-label ref="js"/>

Kotlin 2.4.20 では、データクラスのプロパティに `@JsExport.Ignore` アノテーションが適切に適用されない問題が修正されました。

以前は、データクラスに `@JsExport` アノテーションを付けた場合、自動生成される `copy()` および `componentN()` 関数の影響で、データクラスのエクスポート性に関する警告がコンパイラーによって報告されていました。これは、コンストラクタとプロパティが `@JsExport.Ignore` で明示的に無視対象としてマークされていた場合でも発生していました。

例えば、JavaScript にエクスポートされる `Session` データクラスがあり、エクスポート対象外の内部型 `DatabaseConnection` への参照も持っている場合を考えます：

```kotlin
// Kotlin
// JavaScript にエクスポートされない内部型
class DatabaseConnection

@JsExport
data class Session @JsExport.Ignore constructor(
    val userId: String,
    @JsExport.Ignore val connection: DatabaseConnection,
)
```

この問題が修正されたため、コンパイラーは `@JsExport.Ignore` アノテーションを考慮するようになり、`Session` の合成関数である `copy()` および `componentN()` がエクスポートされていない型 `DatabaseConnection` に関する警告をトリガーしなくなりました。これは、[`@ConsistentCopyVisibility` および `@ExposedCopyVisibility` アノテーション](whatsnew2020.md#data-class-copy-function-to-have-the-same-visibility-as-constructor) によって導入された可視性ルールと整合します。

### ブラウザテスト用の新しい DSL {id="a-new-dsl-for-browser-testing"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="js"/>

Kotlin 2.4.20 では、ブラウザ環境で Kotlin/JS テストを実行するための新しい実験的 DSL が導入されました。

現在、Kotlin Gradle プラグインはさまざまなブラウザ間で JavaScript テストを実行するためのブラウザランチャーとして [Karma](https://github.com/karma-runner/karma) を使用しています。Karma プロジェクトはすでに 2 年間非推奨（deprecated）となっており、ブラウザテストをサポートするための代替手段を模索してきました。

新しい DSL は、内部で様々なツールを管理する Karma を置き換えることを目的としており、以下を含んでいます：

* Chromium、Firefox、WebKit (Safari) の各ブラウザエンジンをサポートするブラウザドライバーおよびディストリビューションマネージャーとしての [Playwright](https://playwright.dev/)。
* テストランナーとしての [Mocha](https://mochajs.org/)。
* バンドラーとしての [webpack](https://webpack.js.org/)（[将来のリリース](https://youtrack.jetbrains.com/issue/KT-48308/) で [Vite](https://vite.dev/) に置き換えられる予定です）。

ブラウザテスト用の新しい DSL を試すには、Kotlin/JS ターゲットの `browser {}` 内にオプトインの `test {}` ブロックを追加します：

```kotlin
import org.jetbrains.kotlin.gradle.ExperimentalJsTestDsl
import kotlin.time.Duration.Companion.seconds

kotlin {
    js {
        browser {
            // 新しい test {} ブロックを追加して設定します
            @OptIn(ExperimentalJsTestDsl::class)
            test {
                // すべてのランナーに対するデフォルトのタイムアウトを設定
                timeout = 2.seconds
                // Gradle プロバイダーを使用してヘッドレスモードを設定
                headless = providers
                    .environmentVariable("IS_IN_CI")
                    .map { it.toBoolean() }
                    .orElse(false)
                // Chromium テストランナーを有効化して設定
                chromium {
                    // 共通のタイムアウトオプションを上書き
                    timeout = 5.seconds
                    // 追加の起動引数を追加
                    launchArgs.add("--no-sandbox")
                }
                // Firefox テストランナーを有効化
                firefox()
                // WebKit テストランナーを有効化
                webkit()
                // 追加の WebKit テストランナーを有効化して設定
                webkit("noheadless") {
                    // カスタムオプションをセットアップ
                    headless = false
                }
            }
        }
    }
}
```

ブラウザテスト用の新しい DSL は活発に開発中です。フィードバックは [YouTrack](https://youtrack.jetbrains.com/issue/KT-66897) にお寄せいただければ幸いです。

詳細については、[Kotlin/JS でのテスト実行](js-running-tests.md) を参照してください。

### suspend ラムダを async 関数としてエクスポートするサポート {id="support-for-exporting-suspending-lambdas-as-async-functions"}
<primary-label ref="experimental-general"/>
<secondary-label ref="js"/>

Kotlin 2.4.20 では、suspend [ラムダ式](lambdas.md#lambda-expressions-and-anonymous-functions) を JavaScript の `async` 関数としてエクスポートできるようになりました。

以前は、Kotlin/JS ライブラリから suspend ラムダを含む宣言をエクスポートする方法がありませんでした。Kotlin コンパイラーが Kotlin の `suspend` 関数と JavaScript ネイティブの [`async`/`await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) モデルの間のブリッジを自動的に処理するようになり、Kotlin と TypeScript が混在するコードベースで有用になります。

この機能を有効にするには、`build.gradle.kts` ファイルに次のコンパイラーオプションを追加します：

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

その後、関連する宣言を `@JsExport` でマークします：

```kotlin
// Kotlin
@JsExport
class TaskRunner {
    suspend fun runTask(task: suspend () -> String): String {
        return task()
    }
}
```

TypeScript 側からは、suspend ラムダは通常の `async` 関数として見えます：

```typescript
// TypeScript
import { TaskRunner } from "..."

const runner = new TaskRunner();
const result = await runner.runTask(async () => "done");
console.log(result); // "done"
```

`@JsExport` アノテーションの詳細については、[ドキュメント](js-to-kotlin-interop.md#jsexport-annotation) を参照してください。

## Gradle {id="gradle"}

Kotlin 2.4.20 は、Gradle 7.6.3 から 9.7.0 までと完全な互換性があります。最新の Gradle リリースまでのバージョンを使用することも可能ですが、その場合は非推奨の警告が発生したり、一部の新しい Gradle 機能が動作しなかったりする可能性があることに留意してください。

また、Kotlin 2.4.20 には Problems API との統合の改善も含まれています。

### Problems API におけるレポート機能の改善 {id="improved-reporting-in-problems-api"}
<secondary-label ref="gradle"/>

Kotlin 2.2.0 は、[Kotlin Gradle プラグイン (KGP) が Gradle の Problems API と統合](whatsnew22.md#integration-of-problems-api-within-kgp-diagnostics)された最初のリリースでした。Kotlin 2.4.0 では、[Kotlin/JVM においてコンパイラーメッセージを Problems API に書き込む](whatsnew24.md#compiler-messages-written-to-problems-api-for-kotlin-jvm) サポートが追加されました。

Kotlin 2.4.20 では、コンパイラーが [Problems API](https://docs.gradle.org/current/kotlin-dsl/gradle/org.gradle.api.problems/index.html) に渡す情報にコンパイラー診断 ID が追加されました。また、これらの ID によって診断情報がグループ化されるようになり、コンパイル問題の原因を特定しやすくなりました。

Gradle 8.6 以降、KGP はこの統合をデフォルトで有効にしています。この API はまだ進化中のため、最新の改善を活用するには最新の Gradle バージョンを使用してください。

## ビルドツール API (Build tools API) {id="build-tools-api"}

Kotlin 2.4.20 では、ビルドツール API に Kotlin/JS、Kotlin/Wasm、および Kotlin メタデータの実験的サポートが追加されました。

### Kotlin/JS、Kotlin/Wasm、Kotlin メタデータのサポート {id="support-for-kotlin-js-kotlin-wasm-and-kotlin-metadata"}
<primary-label ref="experimental-general"/>
<secondary-label ref="bta"/>

[Kotlin 2.2.0](whatsnew22.md#new-experimental-build-tools-api) で、ビルドツール API (BTA) が Kotlin/JVM 向けに利用可能になりました。Kotlin 2.4.20 では、新しいターゲットである Kotlin/JS、Kotlin/Wasm、および Kotlin メタデータのサポートを追加することで、BTA の安定化に向けた次のステップを踏み出しました。

これにより、Kotlin Gradle プラグインとコンパイラーとのやり取りの一貫性が向上します。場合によっては、より高速で安定したコンパイルの恩恵を受けることもできます。

BTA は、ビルドシステムと Kotlin コンパイラーエコシステムの間の抽象化レイヤーとして機能する汎用 API です。利用可能なビルドツールにおいて、Kotlin 機能と Kotlin コンパイラーとの互換性をサポートするのに役立ちます。

Kotlin 2.4.20 では、BTA は新しいターゲット向けにオプトインとして利用可能です。これを試すには、`gradle.properties` ファイルに対応するプロパティを追加します：

```properties
kotlin.wasm.runViaBuildToolsApi=true
kotlin.js.runViaBuildToolsApi=true
kotlin.metadata.runViaBuildToolsApi=true
```

Kotlin 2.5.0 からは、Kotlin/JS、Kotlin/Wasm、および Kotlin メタデータにおいて BTA をデフォルトで有効にする予定です。

BTA の提案に関心がある場合やフィードバックを共有したい場合は、こちらの [KEEP](https://github.com/Kotlin/KEEP/blob/build-tools-api/proposals/extensions/build-tools-api.md) を参照してください。

## Kotlin コンパイラー {id="kotlin-compiler"}

Kotlin 2.4.20 には、Kotlin ランナーコマンドの変更（`kotlinr`）に関するアップデートが含まれ、実験的な Kotlin コンパイラーネイティブイメージが導入されました。

### Kotlin ランナーコマンドを `kotlin` から `kotlinr` に変更 {id="changed-the-kotlin-runner-command-from-kotlin-to-kotlinr"}
<secondary-label ref="compiler"/>

[Kotlin ツールチェーン (Kotlin Toolchain)](https://kotlin-toolchain.org/latest/) 内の `kotlin` コマンドとの名前の競合を回避するため、Kotlin ランナーコマンドとして `kotlin` に代わり `kotlinr` コマンドが使用されるようになりました。また、Kotlin ランナーは `kotlin` コマンドを使用した際に警告を表示し、代わりに `kotlinr` を使用することを推奨します。

### ネイティブイメージ {id="native-image"}
<primary-label ref="experimental-general"/>
<secondary-label ref="compiler"/>

Kotlin 2.4.20 では、Kotlin コンパイラーネイティブイメージの最初の[実験的 (Experimental)](components-stability.md#stability-levels-explained)リリースが行われました。ネイティブイメージは、起動時間の高速化と高いパフォーマンスを提供しながら、標準の `kotlinc` コマンドラインツールの完全な代替手段（ドロップインの代替品）を提供します。

ネイティブイメージを試すには、[GitHub Releases](https://github.com/JetBrains/kotlin/releases/tag/v2.4.20) からビルドをダウンロードしてください。

ネイティブイメージには、`-Xplugin` または `-Xcompiler-plugin` CLI オプションで使用できる以下のコンパイラープラグインもバンドルされています：

* [Serialization](serialization.md)
* [Compose compiler](compose-compiler-options.md)
* [All-open](all-open-plugin.md)
* [`no-arg`](no-arg-plugin.md)
* [SAM with receiver](sam-with-receiver-plugin.md)
* [Assignment](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.plugin.assignment)
* [Lombok](lombok.md)
* [Power-assert](power-assert.md)

Kotlin コンパイラーネイティブイメージの詳細については、その [README](https://github.com/JetBrains/kotlin/blob/master/prepare/compiler-native-image/README.md) を参照してください。

## 互換性を損なう変更と非推奨 {id="breaking-changes-and-deprecations"}

このセクションでは、重要な互換性を損なう変更（破壊的変更）と非推奨事項を取り上げます。完全な概要については、[互換性ガイド](compatibility-guide-24.md) を参照してください。

* Apple が 32 ビット watchOS ターゲットのサポートを終了するため、`watchosArm32` [Kotlin/Native](native-target-support.md) ターゲットは非推奨になりました。Xcode 27 との互換性を確保するため、Kotlin 2.5.0 で削除される予定です。
* Kotlin 2.4.20 以降、Kotlin/Native コンパイラーは、`public` インライン関数内、または別のファイルから呼び出される `internal` インライン関数内での AtomicFU アトミック操作を禁止します。
* Kotlin 2.4.20 では、webpack の npm 依存関係が 5.108.1 に更新されました。これはプロジェクトに以下の 2 つの影響を与える可能性があります：
  * webpack は、組み込みのミニマイザー（minimizer）依存関係を `terser-webpack-plugin` から、より広範な [`minimizer-webpack-plugin`](https://www.npmjs.com/package/minimizer-webpack-plugin) に移行しました。Terser は引き続きデフォルトの JavaScript ミニマイザーですが、プロジェクトが `terser-webpack-plugin` を直接設定または依存している場合は、その設定の更新が必要になる場合があります。
  * webpack は、JavaScript ファイルのモジュールタイプを決定する際に `import.meta` を無視しなくなりました。`import.meta` が存在する場合、webpack はそのファイルを ES モジュールとして扱うため、CommonJS 構文も使用しているファイルが破損する可能性があります。Kotlin/JS の場合は、[`useEsModules()` Gradle DSL を使用してターゲットが ES モジュールを使用するように設定](js-modules.md#choose-the-target-module-system) できます。Kotlin/Wasm は、追加の設定なしでほとんどの場合に機能するはずです。Kotlin/Wasm で `import.meta` エラーが発生した場合は、プロジェクトのソース、または直接・推移的依存関係が `import.meta` を使用しているかどうかを確認してください。必要に応じて自身のコードを更新してください。依存関係が原因である場合は、互換性のあるバージョンが利用可能であればそれに更新するか、ライブラリのメンテナーに問題を報告してください。
* Kotlin 2.4.20 以降、Kotlin/Wasm は生成される JavaScript の `wasmExports` API を非推奨とします。コンパイラーは、警告付きで一時的に利用可能なままとなっている `wasmExports.memory` を除くすべてのエクスポートへのアクセスを禁止します。モジュールの `WebAssembly.Memory` オブジェクトにアクセスするには、`kotlin.wasm.unsafe.wasmMemory` プロパティを使用してください。

## ドキュメントのアップデート {id="documentation-updates"}

前回のリリース以降、Kotlin エコシステムのドキュメントにおいて新しいページやチュートリアルを作成し、既存のものを刷新しました：

* [iOS デリバリーパイプラインの構築](https://kotlinlang.org/docs/multiplatform/ios-ci-cd-teamcity.html) – TeamCity を使用して Kotlin Multiplatform iOS アプリの継続的デリバリーをセットアップします。
* Compose Multiplatform のアップデート：
  * [ポップアップ](https://kotlinlang.org/docs/multiplatform/compose-popups.html) – Compose Multiplatform でポップアップを作成および設定する方法を学びます。
  * [ウィンドウおよびダイアログ API v2](https://kotlinlang.org/docs/multiplatform/compose-desktop-top-level-windows-management.html#window-and-dialog-api-v2) – Compose Multiplatform でデスクトップのウィンドウとダイアログを管理するための新しい API を確認します。
  * [トレイと通知](https://kotlinlang.org/docs/multiplatform/compose-desktop-tray.html) – デスクトップ向け Compose Multiplatform でシステムトレイにアプリケーションアイコンを追加し、システム通知を送信する方法を学びます。
  * [メニューバー](https://kotlinlang.org/docs/multiplatform/compose-desktop-menu-bar.html) – デスクトップ向け Compose Multiplatform で特定のウィンドウ用のメニューバーを作成する方法を学びます。
  * [ドラッグ＆ドロップ](https://kotlinlang.org/docs/multiplatform/compose-drag-drop.html#platform-specific-data-handling) – Compose Multiplatform でドラッグ＆ドロップを実装する際に、プラットフォーム固有のデータを処理します。
  * [Liquid Glass の UIKit 代替案](https://kotlinlang.org/docs/multiplatform/ios-liquid-glass.html#alternative-skip-swiftui-and-drive-uikit-from-kotlin) – SwiftUI の代わりに UIKit ナビゲーションを使用する、Liquid Glass の代替アプローチを探索します。
  * [AI エージェント用 MCP サーバー](https://kotlinlang.org/docs/multiplatform/compose-hot-reload.html#mcp-server-for-ai-agents) – Compose Hot Reload の MCP サーバーを使用して、AI エージェントを開発ワークフローに接続する方法を学びます。
* [Spring でのキャッシュ](https://spring.io/guides/gs/caching) – 新しい Kotlin の例とともに、Spring アプリケーションにキャッシュを追加する方法を学びます。
* [Exposed IntelliJ IDEA プラグイン](https://www.jetbrains.com/help/idea/exposed.html) – コード補完、データベース対応のインスペクション、ライブテンプレートを使用して IntelliJ IDEA で Exposed を操作する方法を学びます。
* [Kotlin シリアライゼーション](serialization.md) – Kotlin データをシリアライズし、JSON 構造と型表現をカスタマイズし、より高度なシリアライズシナリオを扱う方法を学びます。
* [Flow](coroutines-flow.md) および [Flow オペレーター](coroutines-flow-operators.md) – コールド Flow およびホット Flow の作成と収集、例外処理、幅広い Flow オペレーターの使用方法を学びます。
* [コルーチンのデバッグ](coroutines-debugging.md) – デバッグモード、スタックトレース復旧、デバッグエージェントを使用して JVM 上でコルーチンをデバッグする方法を学びます。
* Lincheck – Lincheck における[モデル検査](lincheck-model-checking.md)の仕組み、[操作実行オプション](lincheck-operation-execution-options.md)の使用方法、テスト結果の[検証](lincheck-results-validation.md)方法を学びます。
* [kapt コンパイラープラグイン](kapt.md) – Gradle、Maven、コマンドラインコンパイラーで kapt コンパイラープラグインを設定する方法を学びます。
* [Kotlin プロジェクトにおけるコード品質ツール](jvm-code-analysis.md) – JVM バイトコードと Kotlin コードを解析するためのツールを探索します。
* [Maven での Power-assert プラグイン](jvm-test-maven.md#get-detailed-failure-messages) – Power-assert プラグインを使用して、より詳細なテスト失敗メッセージを取得する方法を学びます。
* [KSP を使用した複数ラウンド処理](ksp-multi-round.md) – 生成されたファイル、遅延されたシンボル、バリデーションを含め、KSP が複数の処理ラウンドにわたってどのように動作するかを探索します。
* 表示不可能型 (Non-denotable types) – Kotlin における[プラットフォーム型](java-interop.md#null-safety-and-platform-types)、[キャプチャ型](generics.md#captured-types)、および[交差型 (intersection types)](typecasts.md#intersection-types)について学びます。
* [型エイリアス](type-aliases.md) – 型エイリアスのスコープと可視性について学びます。
* [This 式](this-expressions.md) – 暗黙の `this` がどのように解決されるか、およびレシーバーを参照するために明示的に `this` を使用するタイミングを学びます。
* [文字列](strings.md) – 文字列テンプレート、一般的な文字列操作、文字列の構築、型変換について学びます。
* [パッケージとインポート](packages.md) – パッケージとインポートを使用して Kotlin コードを整理する方法を学びます。