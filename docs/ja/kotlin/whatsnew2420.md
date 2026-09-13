[//]: # (title: Kotlin 2.4.20 の新機能)

<show-structure depth="1"/>

<web-summary>標準ライブラリ、Native、Wasm、JS、Gradle、BTA、Kotlin コンパイラに関する新しい実験的機能やアップデートを網羅した Kotlin 2.4.20 リリースノートをお読みください</web-summary>

_[公開日: 2026年9月7日](releases.md#release-history)_

Kotlin 2.4.20 がリリースされました！主なハイライトは以下のとおりです：

* **標準ライブラリ:** [コルーチンのスタックトレース復元のサポート、コレクション要素の同等性と一意性をチェックする新しい関数、`kotlin.test` アサーション関数の新しいオーバーロード](#standard-library)
* **Kotlin/Native:** [新しい Swift エクスポート機能、インクリメンタルコンパイルの改善、SwiftPM 依存関係向けの `Package.swift` ファイル自動生成](#kotlin-native)
* **Kotlin/Wasm:** [`@JsFun` 宣言におけるトップレベル `require()` 呼び出しの変更、コンパニオンオブジェクトの初期化順序の改善、Kotlin Gradle プラグインでの Wasmtime サポート、新しいコンパイルモード、関数型インターフェースのバイナリサイズ削減](#kotlin-wasm)
* **Kotlin/JS:** [ブラウザテスト用の新しい DSL、中断ラムダを非同期関数としてエクスポートするサポート、データクラスのエクスポート性の向上](#kotlin-js)
* **Gradle:** [Gradle 9.7.0 のサポートおよび Problems API におけるレポート機能の改善](#gradle)
* **Build tools API:** [新しいターゲットのサポート: Kotlin/JS、Kotlin/Wasm、Kotlin メタデータ](#build-tools-api)
* **Kotlin コンパイラ:** [`kotlinr` ランナーコマンドと独立したネイティブイメージ](#kotlin-compiler)

> Kotlin のリリースサイクルに関する詳細については、[Kotlin のリリースプロセス](releases.md)を参照してください。
>
{style="tip"}

## Kotlin 2.4.20 へのアップデート {id="update-to-kotlin-2-4-20"}

Kotlin の最新バージョンは、[IntelliJ IDEA](https://www.jetbrains.com/idea/download/) および [Android Studio](https://developer.android.com/studio) の最新バージョンに含まれています。

新しい Kotlin バージョンにアップデートするには、IDE が最新バージョンにアップデートされていることを確認し、ビルドスクリプトで [Kotlin のバージョンを 2.4.20 に変更](releases.md#update-to-a-new-kotlin-version)してください。

## 新機能 {id=new-stable-features}
<primary-label ref="stable"/>

Kotlin 2.2.20 では、JVM 21 以降で `invokedynamic` を使用して `when` 式をコンパイルする実験的サポートが導入されました。

Kotlin 2.4.20 では、この機能が[安定（Stable）](components-stability.md#stability-levels-explained)へと昇格し、デフォルトで有効になりました。

詳細については、[ドキュメント](control-flow.md#bytecode-generation-on-the-jvm)を参照してください。

## 新機能 {id=new-experimental-features}
<primary-label ref="experimental-exp"/>

このリリースでは、[Beta](components-stability.md#stability-levels-explained)、[Alpha](components-stability.md#stability-levels-explained)、[Experimental](components-stability.md#stability-levels-explained) のステータスを含む、以下のプレスタブル機能が利用可能です：

* [標準ライブラリ: コルーチンのスタックトレース復元のサポート](#support-for-coroutine-stack-trace-recovery)
* [標準ライブラリ: コレクション要素の同等性と一意性をチェックする新しい関数](#new-functions-to-check-collection-elements-for-equality-and-uniqueness)
* [標準ライブラリ: `kotlin.test` アサーション関数の新しいオーバーロード](#new-overloads-for-kotlin-test-assertion-functions)
* [Kotlin/Native: 新しい Swift エクスポート機能](#new-swift-export-features)
* [Kotlin/Native: `klib` アーティファクトのインクリメンタルコンパイルの改善](#improved-incremental-compilation-of-klib-artifacts)
* [Kotlin/JS: ブラウザテスト用の新しい DSL](#a-new-dsl-for-browser-testing)
* [Kotlin/JS: 中断ラムダを非同期関数としてエクスポートするサポート](#support-for-exporting-suspending-lambdas-as-async-functions)
* [Build tools API: Kotlin/JS、Kotlin/Wasm、Kotlin メタデータのサポート](#support-for-kotlin-js-kotlin-wasm-and-kotlin-metadata)
* [Kotlin コンパイラ: 独立したネイティブイメージ](#native-image)

## 標準ライブラリ {id="standard-library"}

Kotlin 2.4.20 では、コルーチンのスタックトレース復元のサポートが追加されたほか、コレクション要素の同等性と一意性をチェックする新しい関数や、`kotlin.test` アサーション関数の新しいオーバーロードが導入されました。

### コルーチンのスタックトレース復元のサポート {id="support-for-coroutine-stack-trace-recovery"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin 2.4.20 では、標準ライブラリに [`StackTraceRecoverable`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines.debug/-stack-trace-recoverable/) インターフェースが追加されました。これにより、`kotlinx.coroutines` への依存関係を追加することなく、スタックトレース復元用の新しい例外インスタンスの作成方法を定義できるようになり、`kotlinx.coroutines` ライブラリとの連携が向上します。

スタックトレース復元は、あるコルーチンが例外をスローし、別のコルーチンがそれを再スローした際のデバッグに役立ちます。例外がどこで発生し、どこで別のコルーチンによって再スローされたかを確認できるようになります。

`kotlinx.coroutines` ライブラリは、追加のコルーチンスタックトレース情報を含む新しい例外インスタンスを作成することで、スタックトレースの復元を実行します。これは、例外メッセージのみ、原因（cause）のみ、その両方、または引数を取らないコンストラクタを持つ例外に対して自動的に行われます。

例外のコンストラクタに行番号やエラーコードなどの追加の必須引数がある場合は、`StackTraceRecoverable` インターフェースを実装して、`kotlinx.coroutines` ライブラリがその例外の新しいインスタンスを作成する方法を定義します。

このインターフェースを実装するには、[`copyForStackTraceRecovery()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines.debug/-stack-trace-recoverable/copy-for-stack-trace-recovery.html) 関数をオーバーライドします。オーバーライド内では、スタックトレース復元用の新しい例外インスタンスを返すか、`kotlinx.coroutines` ライブラリに例外をコピーさせたくない場合は `null` を返します。

> `StackTraceRecoverable` インターフェースはすべてのターゲットで利用可能ですが、`kotlinx.coroutines` ライブラリがスタックトレース復元に使用するのは JVM 上のみです。
>
{style="note"}

これらの API は[実験的（Experimental）](components-stability.md#stability-levels-explained)であり、`@OptIn(ExperimentalStdlibCoroutineSupportApi::class)` アノテーションによるオプトインが必要です。

以下は、スタックトレース復元用の新しいインスタンスを作成する際に `line` プロパティを保持するカスタム例外の例です：

```kotlin
import kotlin.coroutines.ExperimentalStdlibCoroutineSupportApi
import kotlin.coroutines.debug.StackTraceRecoverable

@OptIn(ExperimentalStdlibCoroutineSupportApi::class)
class FileEditException
// IllegalStateException のコンストラクタに cause を渡すため、
// 実装にはプライベートコンストラクタが必要です
private constructor(
    val line: Int,
    private val detail: String,
    cause: Throwable?,
) : IllegalStateException("When editing line $line: $detail", cause),
    // スタックトレース復元のために StackTraceRecoverable を実装します
    StackTraceRecoverable<FileEditException> {

    constructor(line: Int, detail: String) : this(line, detail, null)

    // 行番号とメッセージの詳細をコピーします
    override fun copyForStackTraceRecovery(): FileEditException =
        FileEditException(line, detail, this)
    }

fun main() {
    val original = FileEditException(15, "Unexpected token")

    // 通常、動作をテストする場合を除き、この関数を直接呼び出す必要はありません。
    // kotlinx.coroutines ライブラリがスタックトレース復元中に自動的に呼び出します
    val copy = original.copyForStackTraceRecovery()

    println(copy.message)
    // When editing line 15: Unexpected token

    println(copy.cause == original)
    // true
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.20"}

詳細については、この機能の [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/stdlib/KEEP-0461-stacktrace-recoverable.md) を参照してください。

フィードバックは [YouTrack](https://youtrack.jetbrains.com/issue/KT-86595) にお寄せください。

### コレクション要素の同等性と一意性をチェックする新しい関数 {id="new-functions-to-check-collection-elements-for-equality-and-uniqueness"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin 2.4.20 より前では、コレクションの要素がすべて異なるか、あるいはすべて等しいかをチェックしたい場合、非効率なコードパターンを使用する必要がありました。

Kotlin 2.4.20 では、このギャップを埋める実験的な関数が導入されました：

| 関数                                                                                                       | チェック内容                                               |
|------------------------------------------------------------------------------------------------------------|------------------------------------------------------------|
| [`allDistinct()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/all-distinct.html)      | コレクション内のすべての値が一意であるか。                   |
| [`allDistinctBy()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/all-distinct-by.html) | 選択したプロパティの値がすべてのオブジェクトで一意であるか。 |
| [`allEqual()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/all-equal.html)            | コレクション内のすべての値が同一であるか。                 |
| [`allEqualBy()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/all-equal-by.html)       | 選択したプロパティの値がすべてのオブジェクトで同一であるか。 |

これらの関数は、コレクション、シーケンス、配列で使用できます。他のコレクション操作と同様に、構造的同等性（structural equality）を使用して要素を比較します。

これらの関数は[実験的（Experimental）](components-stability.md#stability-levels-explained)であり、`@OptIn(ExperimentalStdlibApi::class)` アノテーションまたは `-opt-in=kotlin.ExperimentalStdlibApi` コンパイラオプションによるオプトインが必要です：

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

    // すべての参加者が同じ回答をしたかチェックします
    println(responses.allEqualBy { it.answer })
    // false

    // 重複する参加者がいないかチェックします
    println(responses.allDistinctBy { it.participantId })
    // true

    // すべての回答が同じ日付に送信されたかチェックします
    println(responses.allEqualBy { it.responseDate })
    // true

    val answers = responses.map { it.answer }

    // 回答がすべて同一かチェックします
    println(answers.allEqual())
    // false

    // 回答がすべて異なるかチェックします
    println(answers.allDistinct())
    // true
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.20"}

フィードバックは [KEEP のディスカッション](https://github.com/Kotlin/KEEP/discussions/495) にお寄せください。

### `kotlin.test` アサーション関数の新しいオーバーロード {id="new-overloads-for-kotlin-test-assertion-functions"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin 2.4.20 では、`kotlin.test` のアサーション関数に新しいオーバーロードが追加されました。これらは、アサーションが失敗したときにのみ遅延評価でエラーメッセージを生成するラムダを受け入れます。

従来、`assertTrue()` や `assertEquals()` などの `kotlin.test` アサーション関数は、事前フォーマットされたエラーメッセージのみを受け入れていたため、アサーションが成功してメッセージが実際には使用されない場合でも、アサーションのたびにメッセージが構築されていました。

新しいオーバーロードは `kotlin.test` API を JUnit 5 に合わせ、プレーンな文字列の代わりにラムダを介したメッセージサプライヤーを受け入れます。これにより、アサーションの詳細なエラーメッセージを生成する [Power-assert コンパイラプラグイン](power-assert.md)において、特にパフォーマンスが向上します。

新しいオーバーロードは、以下のアサーション関数で利用可能です：

| 関数                                                                                                                                                                                                   | 説明                                                                                                                           |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| [`assertTrue()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-true.html) / [`assertFalse()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-false.html)              | 値が `true` または `false` であるかをチェックします。                                                                           |
| [`assertEquals()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-equals.html) / [`assertNotEquals()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-not-equals.html) | 値が等しいか、または等しくないかをチェックします。                                                                             |
| [`assertSame()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-same.html) / [`assertNotSame()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-not-same.html)         | 値が同じインスタンスを参照しているかをチェックします。                                                                         |
| [`assertIs()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-is.html) / [`assertIsNot()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-is-not.html)                 | 値が指定された型であるかをチェックします。`assertIs()` の場合、関数はその型にスマートキャストします。                          |
| [`assertNull()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-null.html)                                                                                                             | 値が `null` であるかをチェックします。                                                                                          |
| [`assertContains()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-contains.html)                                                                                                     | コレクション、配列、シーケンス、範囲、またはマップに要素（キー、文字、部分文字列、正規表現）が含まれているかをチェックします。 |
| [`assertContentEquals()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-content-equals.html)                                                                                          | コレクション、シーケンス、配列に同じ順序で等しい要素が含まれているかをチェックします。                                         |

新しい API を使用するには、`@OptIn(ExperimentalKotlinTestApi::class)` アノテーションで明示的にオプトインしてください：

```kotlin
import kotlin.test.ExperimentalKotlinTestApi
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@OptIn(ExperimentalKotlinTestApi::class)
fun testValues(actual: Int, expected: Int, items: List<String>) {
    // メッセージはアサーションが失敗した場合にのみ構築されます
    assertTrue(actual > 0) { "Expected a positive value but got $actual" }

    // アサーションが失敗しない限り、リストのフォーマット処理を回避します
    assertEquals(expected, actual) { "Unexpected value for items: ${items.joinToString()}" }
}
```

詳細については、この機能の [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/stdlib/KEEP-0465-kotlin.test-lazy-assertion-messages.md) を参照してください。

## Kotlin/Native {id="kotlin-native"}

Kotlin 2.4.20 では、Kotlin Multiplatform プロジェクトにおける SwiftPM 依存関係向けの `Package.swift` ファイルの自動生成、sealed クラスや言語間の継承のサポートを含む新しい Swift エクスポート機能、およびインクリメンタルコンパイルの改善が行われました。

### SwiftPM 依存関係向けの `Package.swift` の生成 {id="generated-package-swift-for-swiftpm-dependencies"}
<secondary-label ref="native"/>

SwiftPM パッケージに依存する XCFramework をエクスポートする場合、正しく解決できるように結果の SwiftPM パッケージを公開する必要があります。これを支援するため、`assembleSharedXCFramework` Gradle タスクが、XCFramework と一緒に配布される `Package.swift` ファイルを生成するようになりました。

詳細については、[SwiftPM エクスポートのページ](https://kotlinlang.org/docs/multiplatform/multiplatform-spm-export.html)を参照してください。

### 新しい Swift エクスポート機能 {id="new-swift-export-features"}
<primary-label ref="alpha"/>
<secondary-label ref="native"/>

#### sealed クラス {id="sealed-classes"}

Kotlin 2.4.20 では、Swift エクスポートに sealed クラスおよびインターフェースのサポートが追加されました。

従来は、sealed 型に対するすべての `switch` 文に `default` ケースを記述する必要がありました。現在では、Kotlin で定義された sealed 階層が Swift の enum にマップされ、Xcode での完全なオートコンプリートを備えた網羅的な（exhaustive）`switch` 文が可能になりました。

Swift エクスポートは、各 sealed 型に `sealedType()` メソッドを生成します。このメソッドは、sealed 階層の直接のサブクラスに一致するケースを持つ Swift の enum を返します。これらの呼び出しをネストして、階層のより深いレベルに一致させることもできます。

たとえば、Kotlin でクラス階層を持つ sealed インターフェースを宣言します：

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

`switch` が網羅的であるため、sealed 階層に新しいサブクラスが追加された場合、コンパイラが警告を出します。これにより、`default` ケースに頼るのではなく、即座に対処することができます。

#### Swift エクスポートにおける言語間の継承 {id="cross-language-inheritance-in-swift-export"}

Kotlin 2.4.20 では、Swift エクスポートにおける言語間の継承のサポートが導入されました。

この機能の一般的なユースケースは[リバースインポート](native-lib-import-stability.md#swift-library-import)パターンです。このパターンでは、Kotlin でコントラクトを定義し、Swift 側でプラットフォーム固有の実装を提供します。これは、Kotlin に直接インポートできない純粋な Swift ライブラリを使用する必要がある場合に特に便利です。

このパターンを実装するには、Swift 実装が継承するための Kotlin スーパークラスと、Kotlin インターフェースを宣言します。次に Swift でこのインターフェースを実装し、そのインターフェースを受け入れる Kotlin 関数に Swift オブジェクトを渡します。たとえば、CryptoKit ライブラリの場合：

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

   // Kotlin 関数を呼び出し、それが Swift の hashMD5() をコールバックします
   print(processHash(provider: provider, input: "Hello, world!"))
   ```

Kotlin が Swift オブジェクトを受け取ると、通常のインターフェースの実装として扱い、Swift コードを直接呼び出します。

Swift エクスポートの詳細については、[ドキュメント](native-swift-export.md)を参照してください。

### `klib` アーティファクトのインクリメンタルコンパイルの改善 {id="improved-incremental-compilation-of-klib-artifacts"}
<primary-label ref="beta"/>
<secondary-label ref="native"/>

Kotlin 2.4.20 では、`klib` アーティファクトのインクリメンタルコンパイルの安定化に向けた改善が行われ、[Beta](components-stability.md#kotlin-native) になりました。

この最適化は [Kotlin 1.9.20](whatsnew1920.md#incremental-compilation-of-klib-artifacts) で初めて導入され、デバッグビルドのコンパイル時間を大幅に短縮できることが実証されました。それ以降、多数のバグ修正とパフォーマンスの改善を行ってきました。

インクリメンタルコンパイルを試すには、`gradle.properties` ファイルに以下のオプションを追加してください：

```properties
kotlin.incremental.native=true
```

現在フィードバックを積極的に収集しており、今後の Kotlin リリースですべてのプロジェクトに対してインクリメンタルコンパイルをデフォルトで有効にすることを計画しています。問題が発生した場合は、[課題トラッカー](https://kotl.in/issue)に報告してください。

## Kotlin/Wasm {id="kotlin-wasm"}

Kotlin 2.4.20 では、Kotlin/Wasm が `@JsFun` 宣言内のトップレベル `require()` 呼び出しを処理する方法が変更され、コンパニオンオブジェクトの初期化順序が JVM の動作と統一され、関数型インターフェースのバイナリサイズが削減され、新しいコンパイルモードが導入され、Kotlin Gradle プラグインにおける `wasmWasi` ターゲットのランタイムとして Wasmtime のサポートが追加されました。

### `@JsFun` 宣言におけるトップレベル `require()` 呼び出しの変更 {id="changes-to-top-level-require-calls-in-jsfun-declarations"}
<secondary-label ref="wasm"/>

Kotlin/Wasm では、[`@JsFun`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-js-fun/) 宣言がトップレベルの `require()` 関数を使用している場合にエラーを報告するようになりました。

従来、コンパイラは `import-object.mjs` ファイル内に `require` 変数を生成していたため、`@JsFun` 宣言から `require()` を呼び出すことができました。

この動作は意図せずコンパイラの実装詳細を公開してしまっていました。そこからの移行を促すため、Kotlin/Wasm はこの生成された `require` 宣言を削除し、コンパイラはこのような呼び出しに対してエラーを報告するようになりました。例：

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
    // 想定されるモジュールメンバーを定義します
}
```

動的なモジュール読み込みには、代わりに `import()` 式を使用してください。
webpack が動的インポートを解析しないようにするため、マジックコメント `/* webpackIgnore: true */` を追加します：

```kotlin
@JsFun("""
    ((module) => () => module)(
        await import(/* webpackIgnore: true */ "module")
    )
""")
private external fun loadModuleDynamically(): JsAny?
```

`import()` 式を条件付きで使用することもできます。たとえば、Node.js で実行されている場合にのみモジュールを読み込むことができます：

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

プロジェクトがトップレベルの `require()` 関数を必要とする依存関係に依存している場合は、回避策として `globalThis` のプロパティとして追加してください：

```kotlin
@JsFun("""
    ((module) => {
        globalThis.require = module.default.createRequire(import.meta.url)
        return () => {}
    })(await import("node:module"))
""")
external fun defineRequire()
```

問題が発生した場合は、[課題トラッカー](https://youtrack.jetbrains.com/issue/KT-86192)にフィードバックを共有してください。

### コンパニオンオブジェクトの初期化順序の改善 {id="improved-companion-object-initialization-order"}
<secondary-label ref="wasm"/>

Kotlin/Wasm は、JVM の動作に合わせて、サブクラスのコンパニオンオブジェクトよりも前にスーパークラスのコンパニオンオブジェクトを初期化するようになりました。以前は初期化順序が逆になることがあり、プラットフォーム間で動作の不一致が生じていました。

このアップデートにより、クロスプラットフォーム間の一貫性が向上し、クラスの初期化動作におけるプラットフォーム固有の差異が軽減されます。また、中間クラスがコンパニオンオブジェクトを宣言していないケースを含む、より深い継承階層においても、コンパニオンオブジェクトの初期化が正しく処理されるようになります。

### Kotlin Gradle プラグインでの Wasmtime サポート {id="support-for-wasmtime-in-the-kotlin-gradle-plugin"}
<secondary-label ref="wasm"/>

Kotlin 2.4.20 では、Kotlin Gradle プラグインの `wasmWasi` ターゲットのランタイムとして [Wasmtime](https://docs.wasmtime.dev/) のサポートが導入されました。

以前は、`wasmWasi` ターゲットは Node.js ランタイムのみをサポートしており、WASI アプリケーションを実行するには JavaScript のブートストラップが必要でした。Wasmtime のサポートにより、スタンドアロンの WebAssembly ランタイム上で Kotlin/Wasm アプリケーションを実行できるようになりました。

`wasmWasi` ターゲットのランタイムとして Wasmtime を使用するには、Gradle ビルドファイルに `wasmtime()` を追加します：

```kotlin
kotlin {
    wasmWasi {
        wasmtime()
    }
}
```

フィードバックは [YouTrack](https://youtrack.jetbrains.com/issue/KT-86633) にお寄せください。

### 新しいコンパイルモード {id="new-compilation-modes"}
<secondary-label ref="wasm"/>

Kotlin 2.4.20 では、新しいマルチモジュールモードを含む、Kotlin/Wasm コンパイルモードを選択できるようになりました。以前は、コンパイラはプロジェクトとその依存関係をまとめてコンパイルし、単一のバイナリを生成するモノリス（monolith）コンパイルモードを使用していました。これにより、コンパイラはデッドコードの排除（DCE）を実行し、最小の出力を生成できます。

現在は、以下のコンパイルモードのいずれかを選択できます：

| コンパイルモード           | コンパイル方式                                                                   | 出力                                             | 最適化の挙動                                                                                               |
|----------------------------|----------------------------------------------------------------------------------|--------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| `monolith`（デフォルト）   | プロジェクトとその依存関係をまとめてコンパイルします。                           | 単一のバイナリ                                   | 到達不能な宣言を削除し、依存関係を含むプログラム全体に対して最適化を適用します。                           |
| `multimodule-open-world`   | 各モジュールを個別にコンパイルし、変更されたモジュールのみを再コンパイルします。   | モジュールごとに独立した個別のバイナリ           | モジュールをまたぐ最適化を適用しないため、バイナリサイズが大きくなります。                                 |
| `multimodule-closed-world` | 1 回の呼び出しですべてのモジュールを処理し、変更されたモジュールのみを再コンパイルします。 | 相互に依存する個別のバイナリ                     | 到達不能な宣言を削除しますが、各 Wasm バイナリを個別に最適化します。                                       |

コンパイルモードを選択するには、`gradle.properties` ファイルに `kotlin.wasm.compilationMode` プロパティを追加します：

```properties
kotlin.wasm.compilationMode=multimodule-open-world
```

また、開発ビルドにはクローズドワールド・マルチモジュールコンパイルを使用し、本番ビルドにはモノリスコンパイルを使用するように Kotlin/Wasm を設定することもできます。これにより、開発中の再コンパイル時間が短縮され、本番ビルドでは最小の出力が得られます。

この設定を使用するには、`gradle.properties` ファイルに次のプロパティを追加します：

```properties
kotlin.wasm.compilationMode=multimodule-closed-world-only-in-dev
```

フィードバックは [YouTrack](https://youtrack.jetbrains.com/issue/KT-86919) にお寄せください。

### ラムダおよび関数型インターフェースのバイナリサイズ削減 {id="reduced-binary-size-for-lambdas-and-functional-interfaces"}
<secondary-label ref="wasm"/>

Kotlin 2.4.20 では、Kotlin/Wasm がラムダや関数型インターフェースをコンパイルする方法が変更されました。
個別の匿名クラスを生成する代わりに、関数を生成して共有ベースクラスを使用するようになりました。

[KotlinConf アプリケーション](https://github.com/JetBrains/kotlinconf-app) を使用したテストでは、この変更により Wasm のバイナリサイズが約 5〜10% 削減されることが示されています。

この変更により動的呼び出しが増加するため、実行時のパフォーマンスに影響を与える可能性があります。
問題が発生した場合は、[課題トラッカー](https://youtrack.jetbrains.com/issue/KT-83159)に報告してください。

## Kotlin/JS {id="kotlin-js"}

Kotlin 2.4.20 では、データクラスのエクスポート性が向上し、ブラウザテスト用の新しい実験的 DSL が導入され、中断ラムダを JavaScript の非同期（async）関数としてエクスポートするサポートが追加されました。

### エクスポートされたデータクラスの合成関数における一貫したエクスポート性 {id="consistent-exportability-of-synthetic-functions-on-exported-data-classes"}
<secondary-label ref="js"/>

Kotlin 2.4.20 では、データクラスのプロパティに `@JsExport.Ignore` アノテーションが適切に適用されない問題が修正されました。

以前は、データクラスに `@JsExport` アノテーションを付与した場合、自動生成される `copy()` および `componentN()` 関数の影響で、コンパイラがデータクラスのエクスポート性に関する警告を報告し続けていました。これは、コンストラクタとプロパティが `@JsExport.Ignore` で明示的に無視対象としてマークされている場合でも発生していました。

たとえば、JavaScript にエクスポートされる `Session` データクラスがあり、エクスポート対象外の内部型 `DatabaseConnection` への参照も持っている場合を考えます：

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

この問題が修正されたため、コンパイラは `@JsExport.Ignore` アノテーションを考慮するようになり、`Session` の合成された `copy()` および `componentN()` 関数が、エクスポートされない型 `DatabaseConnection` に関する警告をトリガーしなくなりました。これは、[`@ConsistentCopyVisibility` および `@ExposedCopyVisibility` アノテーション](whatsnew2020.md#data-class-copy-function-to-have-the-same-visibility-as-constructor)によって導入された可視性ルールと一致します。

### ブラウザテスト用の新しい DSL {id="a-new-dsl-for-browser-testing"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="js"/>

Kotlin 2.4.20 では、ブラウザ環境で Kotlin/JS テストを実行するための新しい実験的 DSL が導入されました。

現在、Kotlin Gradle プラグインは、さまざまなブラウザで JavaScript テストを実行するためのブラウザランチャーとして [Karma](https://github.com/karma-runner/karma) を使用しています。Karma プロジェクトはすでに 2 年間非推奨となっており、ブラウザテストをサポートするための代替手段を模索してきました。

新しい DSL は、内部でさまざまなツールを管理する役割として Karma を置き換えることを目的としており、以下が含まれます：

* Chromium、Firefox、WebKit（Safari）ブラウザエンジンをサポートするブラウザドライバおよびディストリビューションマネージャーとしての [Playwright](https://playwright.dev/)。
* テストランナーとしての [Mocha](https://mochajs.org/)。
* バンドラーとしての [webpack](https://webpack.js.org/)（[将来のリリース](https://youtrack.jetbrains.com/issue/KT-48308/)で [Vite](https://vite.dev/) に置き換えられる予定です）。

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
                // すべてのランナーのデフォルトタイムアウトを設定します
                timeout = 2.seconds
                // Gradle プロバイダーを使用してヘッドレスモードを設定します
                headless = providers
                    .environmentVariable("IS_IN_CI")
                    .map { it.toBoolean() }
                    .orElse(false)
                // Chromium テストランナーを有効化して設定します
                chromium {
                    // 共通のタイムアウト設定をオーバーライドします
                    timeout = 5.seconds
                    // 追加の起動引数を追加します
                    launchArgs.add("--no-sandbox")
                }
                // Firefox テストランナーを有効化します
                firefox()
                // WebKit テストランナーを有効化します
                webkit()
                // 追加の WebKit テストランナーを有効化して設定します
                webkit("noheadless") {
                    // カスタムオプションを設定します
                    headless = false
                }
            }
        }
    }
}
```

ブラウザテスト用の新しい DSL は活発に開発が進められています。フィードバックは [YouTrack](https://youtrack.jetbrains.com/issue/KT-66897) にお寄せください。

詳細については、[Kotlin/JS でテストを実行する](js-running-tests.md)を参照してください。

### 中断ラムダを非同期関数としてエクスポートするサポート {id="support-for-exporting-suspending-lambdas-as-async-functions"}
<primary-label ref="experimental-general"/>
<secondary-label ref="js"/>

Kotlin 2.4.20 では、中断[ラムダ式](lambdas.md#lambda-expressions-and-anonymous-functions)を JavaScript の `async` 関数としてエクスポートできるようになりました。

以前は、Kotlin/JS ライブラリから中断ラムダを含む宣言をエクスポートする方法がありませんでした。今回、Kotlin コンパイラが Kotlin の `suspend` 関数と JavaScript ネイティブの [`async`/`await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) モデルとの間のブリッジングを自動的に処理するようになり、Kotlin と TypeScript が混在するコードベースで役立ちます。

この機能を有効にするには、`build.gradle.kts` ファイルに次のコンパイラオプションを追加します：

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

その後、関連する宣言に `@JsExport` をマークします：

```kotlin
// Kotlin
@JsExport
class TaskRunner {
    suspend fun runTask(task: suspend () -> String): String {
        return task()
    }
}
```

TypeScript 側からは、中断ラムダが通常の `async` 関数として見えます：

```typescript
// TypeScript
import { TaskRunner } from "..."

const runner = new TaskRunner();
const result = await runner.runTask(async () => "done");
console.log(result); // "done"
```

`@JsExport` アノテーションの詳細については、[ドキュメント](js-to-kotlin-interop.md#jsexport-annotation)を参照してください。

## Gradle {id="gradle"}

Kotlin 2.4.20 は、Gradle 7.6.3 から 9.7.0 までと完全な互換性があります。最新の Gradle リリースまでのバージョンを使用することも可能ですが、その場合、非推奨の警告が表示されたり、一部の新しい Gradle 機能が動作しなかったりする可能性があることに注意してください。

Kotlin 2.4.20 には、Problems API との統合の改善も含まれています。

### Problems API におけるレポート機能の改善 {id="improved-reporting-in-problems-api"}
<secondary-label ref="gradle"/>

Kotlin 2.2.0 は、[Kotlin Gradle プラグイン（KGP）が Gradle の Problems API と統合された](whatsnew22.md#integration-of-problems-api-within-kgp-diagnostics)最初のリリースでした。Kotlin 2.4.0 では、[Kotlin/JVM においてコンパイラメッセージを Problems API に書き込むサポート](whatsnew24.md#compiler-messages-written-to-problems-api-for-kotlin-jvm)が追加されました。

Kotlin 2.4.20 では、コンパイラが [Problems API](https://docs.gradle.org/current/kotlin-dsl/gradle/org.gradle.api.problems/index.html) に渡す情報にコンパイラ診断 ID が追加されました。また、これらの ID ごとに診断情報がグループ化されるため、コンパイル問題の原因を特定しやすくなりました。

Gradle 8.6 以降、KGP はこの統合をデフォルトで有効にしています。この API は現在も進化中であるため、最新の改善を活用するには、できるだけ新しい Gradle バージョンを使用してください。

## Build tools API {id="build-tools-api"}

Kotlin 2.4.20 では、Build tools API に Kotlin/JS、Kotlin/Wasm、および Kotlin メタデータの実験的サポートが追加されました。

### Kotlin/JS、Kotlin/Wasm、Kotlin メタデータのサポート {id="support-for-kotlin-js-kotlin-wasm-and-kotlin-metadata"}
<primary-label ref="experimental-general"/>
<secondary-label ref="bta"/>

[Kotlin 2.2.0](whatsnew22.md#new-experimental-build-tools-api) で、Build tools API（BTA）が Kotlin/JVM 向けに利用可能になりました。Kotlin 2.4.20 では、新しいターゲット（Kotlin/JS、Kotlin/Wasm、Kotlin メタデータ）のサポートを追加することで、BTA の安定化に向けた次のステップを踏み出しました。

これにより、Kotlin Gradle プラグインがコンパイラとより一貫して対話できるようになります。場合によっては、より高速で安定したコンパイルの恩恵を受けることもできます。

BTA は、ビルドシステムと Kotlin コンパイラエコシステム間の抽象化レイヤーとして機能するユニバーサル API です。利用可能なビルドツールにおいて、Kotlin 機能のサポートや Kotlin コンパイラとの互換性を支援します。

Kotlin 2.4.20 では、新しいターゲット向けの BTA がオプトイン機能として利用可能です。試してみるには、`gradle.properties` ファイルに対応するプロパティを追加してください：

```properties
kotlin.wasm.runViaBuildToolsApi=true
kotlin.js.runViaBuildToolsApi=true
kotlin.metadata.runViaBuildToolsApi=true
```

Kotlin 2.5.0 以降では、Kotlin/JS、Kotlin/Wasm、Kotlin メタデータにおいて BTA をデフォルトで有効にすることを計画しています。

BTA の提案について詳しく知りたい場合やフィードバックを共有したい場合は、こちらの [KEEP](https://github.com/Kotlin/KEEP/blob/build-tools-api/proposals/extensions/build-tools-api.md) を参照してください。

## Kotlin コンパイラ {id="kotlin-compiler"}

Kotlin 2.4.20 には、Kotlin ランナーコマンドの `kotlinr` への変更に関するアップデートが含まれており、実験的な Kotlin コンパイラネイティブイメージが導入されています。

### Kotlin ランナーコマンドを `kotlin` から `kotlinr` に変更 {id="changed-the-kotlin-runner-command-from-kotlin-to-kotlinr"}
<secondary-label ref="compiler"/>

[Kotlin Toolchain](https://kotlin-toolchain.org/latest/) の `kotlin` コマンドとの命名衝突を避けるため、Kotlin ランナーコマンドとして `kotlin` に代わり `kotlinr` コマンドが使用されるようになりました。また、Kotlin ランナーで `kotlin` コマンドを使用すると警告が表示され、代わりに `kotlinr` を使用することが推奨されます。

### ネイティブイメージ {id="native-image"}
<primary-label ref="experimental-general"/>
<secondary-label ref="compiler"/>

Kotlin 2.4.20 では、Kotlin コンパイラネイティブイメージの最初の[実験的（Experimental）](components-stability.md#stability-levels-explained)リリースが行われました。ネイティブイメージは、標準の `kotlinc` コマンドラインツールの完全な代替として機能し、より高速な起動時間とより高いパフォーマンスを提供します。

ネイティブイメージを試すには、[GitHub Releases](https://github.com/JetBrains/kotlin/releases/tag/v2.4.20) からビルドをダウンロードしてください。

ネイティブイメージには、`-Xplugin` または `-Xcompiler-plugin` CLI オプションで使用できる以下のコンパイラプラグインもバンドルされています：

* [Serialization](serialization.md)
* [Compose コンパイラ](compose-compiler-options.md)
* [All-open](all-open-plugin.md)
* [`no-arg`](no-arg-plugin.md)
* [SAM with receiver](sam-with-receiver-plugin.md)
* [Assignment](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.plugin.assignment)
* [Lombok](lombok.md)
* [Power-assert](power-assert.md)

Kotlin コンパイラネイティブイメージの詳細については、その [README](https://github.com/JetBrains/kotlin/blob/master/prepare/compiler-native-image/README.md) を参照してください。

## 破壊的変更と非推奨化 {id="breaking-changes-and-deprecations"}

このセクションでは、重要な破壊的変更と非推奨化について説明します。完全な概要については、[互換性ガイド](compatibility-guide-24.md)を参照してください。

* Apple が 32 ビット watchOS ターゲットのサポートを終了することに伴い、`watchosArm32` [Kotlin/Native](native-target-support.md) ターゲットは非推奨になりました。Xcode 27 との互換性を確保するため、Kotlin 2.5.0 で削除される予定です。
* Kotlin 2.4.20 以降、Kotlin/Native コンパイラは、`public` インライン関数内、または別のファイルから呼び出される `internal` インライン関数内での AtomicFU アトミック操作を禁止します。
* Kotlin 2.4.20 では、webpack の npm 依存関係が 5.108.1 にアップデートされました。これは、プロジェクトに次の 2 つの影響を与える可能性があります：
  * webpack は、組み込みのミニマイザー依存関係を `terser-webpack-plugin` から、より広範な [`minimizer-webpack-plugin`](https://www.npmjs.com/package/minimizer-webpack-plugin) に移行しました。Terser は引き続きデフォルトの JavaScript ミニマイザーですが、プロジェクトが `terser-webpack-plugin` を直接設定または依存している場合は、その設定を更新する必要がある場合があります。
  * webpack は、JavaScript ファイルのモジュールタイプを決定する際に `import.meta` を無視しなくなりました。`import.meta` が存在する場合、webpack はそのファイルを ES モジュールとして扱うため、CommonJS の構文も使用しているファイルが破損する可能性があります。Kotlin/JS では、[`useEsModules()` Gradle DSL を使用して ES モジュールを使用するようにターゲットを設定](js-modules.md#choose-the-target-module-system)できます。Kotlin/Wasm は、追加の設定なしでほとんどの場合動作するはずです。Kotlin/Wasm で `import.meta` のエラーが発生した場合は、プロジェクトのソース、あるいは直接的または推移的な依存関係が `import.meta` を使用しているかどうかを確認してください。必要に応じて自身のコードを更新してください。依存関係が問題の原因である場合は、利用可能であれば互換性のあるバージョンに更新するか、ライブラリのメンテナーに問題を報告してください。
* Kotlin 2.4.20 以降、Kotlin/Wasm は生成される JavaScript の `wasmExports` API を非推奨とします。コンパイラは、警告付きで一時的に利用可能な `wasmExports.memory` を除き、すべてのエクスポートへのアクセスを禁止します。モジュールの `WebAssembly.Memory` オブジェクトにアクセスするには、`kotlin.wasm.unsafe.wasmMemory` プロパティを使用してください。

## ドキュメントのアップデート {id="documentation-updates"}

前回のリリース以降、Kotlin エコシステムドキュメントの新しいページやチュートリアルを作成し、既存のものを改訂しました：

* [iOS デリバリーパイプラインの設定](https://kotlinlang.org/docs/multiplatform/ios-ci-cd-teamcity.html) – TeamCity を使用して Kotlin Multiplatform iOS アプリの継続的デリバリー（CD）を設定します。
* Compose Multiplatform のアップデート：
  * [ポップアップ](https://kotlinlang.org/docs/multiplatform/compose-popups.html) – Compose Multiplatform でポップアップを作成および設定する方法を学びます。
  * [ウィンドウおよびダイアログ API v2](https://kotlinlang.org/docs/multiplatform/compose-desktop-top-level-windows-management.html#window-and-dialog-api-v2) – Compose Multiplatform でデスクトップウィンドウとダイアログを管理するための新しい API を確認します。
  * [トレイと通知](https://kotlinlang.org/docs/multiplatform/compose-desktop-tray.html) – デスクトップ向け Compose Multiplatform でシステムトレイにアプリアイコンを追加し、システム通知を送信する方法を学びます。
  * [メニューバー](https://kotlinlang.org/docs/multiplatform/compose-desktop-menu-bar.html) – デスクトップ向け Compose Multiplatform で特定のウィンドウ用のメニューバーを作成する方法を学びます。
  * [ドラッグ＆ドロップ](https://kotlinlang.org/docs/multiplatform/compose-drag-drop.html#platform-specific-data-handling) – Compose Multiplatform でドラッグ＆ドロップを実装する際のプラットフォーム固有のデータを処理します。
  * [Liquid Glass 向けの UIKit 代替手段](https://kotlinlang.org/docs/multiplatform/ios-liquid-glass.html#alternative-skip-swiftui-and-drive-uikit-from-kotlin) – SwiftUI の代わりに UIKit ナビゲーションを使用する Liquid Glass への代替アプローチを確認します。
  * [AI エージェント用 MCP サーバー](https://kotlinlang.org/docs/multiplatform/compose-hot-reload.html#mcp-server-for-ai-agents) – Compose Hot Reload の MCP サーバーを使用して、AI エージェントを開発ワークフローに接続する方法を学びます。
* [Spring でのキャッシング](https://spring.io/guides/gs/caching) – 新しい Kotlin の例とともに、Spring アプリケーションにキャッシングを追加する方法を学びます。
* [Exposed IntelliJ IDEA プラグイン](https://www.jetbrains.com/help/idea/exposed.html) – コード補完、データベース対応のインスペクション、ライブテンプレートを使用して、IntelliJ IDEA で Exposed を操作する方法を学びます。
* [Kotlin シリアライゼーション](serialization.md) – Kotlin データをシリアライズし、JSON 構造や型の表現をカスタマイズし、より高度なシリアライズシナリオに対応する方法を学びます。
* [Flow](coroutines-flow.md) および [Flow オペレーター](coroutines-flow-operators.md) – コールド Flow とホット Flow の作成とコレクト、例外の処理、幅広い Flow オペレーターの使用方法を学びます。
* [コルーチンのデバッグ](coroutines-debugging.md) – デバッグモード、スタックトレース復元、デバッグエージェントを使用して JVM 上でコルーチンをデバッグする方法を学びます。
* Lincheck – Lincheck における[モデル検査](lincheck-model-checking.md)の仕組み、[操作実行オプション](lincheck-operation-execution-options.md)の使用方法、およびテスト結果を[検証](lincheck-results-validation.md)する方法を学びます。
* [kapt コンパイラプラグイン](kapt.md) – Gradle、Maven、コマンドラインコンパイラで kapt コンパイラプラグインを設定する方法を学びます。
* [Kotlin プロジェクトにおけるコード品質ツール](jvm-code-analysis.md) – JVM バイトコードおよび Kotlin コードを解析するためのツールを確認します。
* [Maven での Power-assert プラグイン](jvm-test-maven.md#get-detailed-failure-messages) – Power-assert プラグインを使用して、より詳細なテスト失敗メッセージを取得する方法を学びます。
* [KSP による複数ラウンド処理](ksp-multi-round.md) – 生成されたファイル、遅延シンボル、検証など、KSP が複数の処理ラウンドにわたってどのように動作するかを確認します。
* 非表示型（Non-denotable types） – Kotlin における[プラットフォーム型](java-interop.md#null-safety-and-platform-types)、[捕捉された型（Captured types）](generics.md#captured-types)、および[交差型（Intersection types）](typecasts.md#intersection-types)について学びます。
* [型エイリアス](type-aliases.md) – 型エイリアスのスコープと可視性について学びます。
* [This 式](this-expressions.md) – 暗黙の `this` がどのように解決されるか、およびレシーバーを参照するために明示的に `this` を使用するタイミングについて学びます。
* [文字列](strings.md) – 文字列テンプレート、一般的な文字列操作、文字列の構築、および型変換について学びます。
* [パッケージとインポート](packages.md) – パッケージとインポートを使用して Kotlin コードを整理する方法を学びます。