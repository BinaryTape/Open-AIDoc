[//]: # (title: Kotlin %kotlinEapVersion% の新機能)

<primary-label ref="eap"/>

<show-structure depth="1"/>

<web-summary>Kotlin Early Access Preview (EAP) のリリースノートを確認し、正式リリース前の最新の実験的 Kotlin 機能を試してみましょう。</web-summary>

_[リリース日: %kotlinEapReleaseDate%](eap.md#build-details)_

> このドキュメントは Early Access Preview (EAP) リリースのすべての機能を網羅しているわけではありませんが、主要な改善点について詳しく説明します。
>
> 変更点の完全なリストについては、[GitHub の変更履歴](https://github.com/JetBrains/kotlin/releases/tag/v%kotlinEapVersion%)を参照してください。
>
{style="note"}

Kotlin %kotlinEapVersion% がリリースされました！この EAP リリースの主な内容は以下の通りです。

* **標準ライブラリ**: [コルーチンのスタックトレース復元のサポートと、コレクション要素の等価性と一意性をチェックするための新機能](#standard-library)
* **Kotlin/Native**: [`klib` アーティファクトに対するデフォルトのインクリメンタルコンパイルと、新しい Swift export 機能](#kotlin-native)
* **Kotlin/Wasm**: [`@JsFun` 宣言におけるトップレベルの `require()` 呼び出しの変更、コンパニオンオブジェクトの初期化順序の改善、および Kotlin Gradle プラグインにおける Wasmtime のサポート](#kotlin-wasm)
* **Kotlin/JS**: [ブラウザテスト用の新しい DSL と、suspend ラムダを async 関数としてエクスポートする機能のサポート](#kotlin-js)
* **ビルドツール API**: [新しいターゲット（Kotlin/JS、Kotlin/Wasm、および Kotlin メタデータ）のサポート](#build-tools-api)
* **Kotlin コンパイラ**: [ネイティブイメージの実験的リリース](#kotlin-compiler-native-image)

> Kotlin のリリースサイクルに関する情報は、[Kotlin のリリースプロセス](releases.md)を参照してください。
>
{style="tip"}

## Kotlin %kotlinEapVersion% へのアップデート

最新バージョンの Kotlin は、最新バージョンの [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) および [Android Studio](https://developer.android.com/studio) に含まれています。

新しい Kotlin バージョンにアップデートするには、IDE が最新バージョンに更新されていることを確認し、ビルドスクリプト内の [Kotlin バージョンを %kotlinEapVersion% に変更](releases.md#update-to-a-new-kotlin-version)してください。

## 新機能 {id=new-experimental-features}
<primary-label ref="experimental-exp"/>

このリリースでは、以下のプレステーブル（pre-stable）機能が利用可能です。これには、[Beta](components-stability.md#stability-levels-explained)、[Alpha](components-stability.md#stability-levels-explained)、および [実験的 (Experimental)](components-stability.md#stability-levels-explained) ステータスの機能が含まれます。

* [標準ライブラリ: コルーチンのスタックトレース復元のサポート](#support-for-coroutine-stack-trace-recovery)
* [標準ライブラリ: コレクション要素の等価性と一意性をチェックするための新関数](#new-functions-to-check-collection-elements-for-equality-and-uniqueness)
* [Kotlin/Native: 分離された Kotlin コンパイライメージ](#kotlin-compiler-native-image)
* [Kotlin/JS: ブラウザテスト用の新しい DSL](#new-dsl-for-browser-testing)
* [ビルドツール API: Kotlin/JS、Kotlin/Wasm、および Kotlin メタデータのサポート](#build-tools-api)

## 標準ライブラリ

Kotlin %kotlinEapVersion% では、コルーチンのスタックトレース復元のサポートが追加され、コレクション要素の等価性と一意性をチェックするための新しい関数が導入されました。

### コルーチンのスタックトレース復元のサポート
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin %kotlinEapVersion% では、標準ライブラリに `StackTraceRecoverable` インターフェースが追加されました。これにより、`kotlinx.coroutines` への依存関係を追加することなく、スタックトレース復元のための新しい例外インスタンスの作成方法を定義できるようになり、`kotlinx.coroutines` ライブラリとの統合が改善されます。

スタックトレース復元は、あるコルーチンが例外をスローし、別のコルーチンがそれを再スロー（rethrow）する場合のデバッグに役立ちます。これにより、例外がどこで発生し、どのコルーチンがそれを再スローしたかを確認できるようになります。

`kotlinx.coroutines` ライブラリは、追加のコルーチンスタックトレース情報を含む新しい例外インスタンスを作成することで、スタックトレース復元を実行します。これは、例外メッセージのみ、原因（cause）のみ、その両方、または引数なしのコンストラクタを持つ例外に対して自動的に行われます。

例外のコンストラクタに行番号やエラーコードなどの追加の必須引数がある場合は、`StackTraceRecoverable` インターフェースを実装して、`kotlinx.coroutines` ライブラリがその例外の新しいインスタンスをどのように作成するかを定義します。

そのためには、`copyForStackTraceRecovery()` 関数をオーバーライドします。この関数はスタックトレース復元のための新しい例外インスタンスを返します。`kotlinx.coroutines` ライブラリに例外をコピーさせたくない場合は `null` を返します。

> `StackTraceRecoverable` インターフェースはすべてのターゲットで使用可能ですが、`kotlinx.coroutines` ライブラリがスタックトレース復元のためにこれを使用するのは JVM 上のみです。
>
{style="note"}

これらの API は [実験的 (Experimental)](components-stability.md#stability-levels-explained) であり、`@OptIn(ExperimentalStdlibCoroutineSupportApi::class)` アノテーションによるオプトインが必要です。

以下は、スタックトレース復元用の新しいインスタンスを作成する際に `line` プロパティを保持するカスタム例外の例です。

```kotlin
import kotlin.coroutines.ExperimentalStdlibCoroutineSupportApi
import kotlin.coroutines.StackTraceRecoverable

@OptIn(ExperimentalStdlibCoroutineSupportApi::class)
class FileEditException
// cause を IllegalStateException コンストラクタに渡すために
// 実装にはプライベートコンストラクタが必要です
private constructor(
    val line: Int,
    private val detail: String,
    cause: Throwable?,
) : IllegalStateException("When editing line $line: $detail", cause),
    // スタックトレース復元の目的で StackTraceRecoverable を実装します
    StackTraceRecoverable<FileEditException> {

    constructor(line: Int, detail: String) : this(line, detail, null)

    // 行番号とメッセージの詳細をコピーします
    override fun copyForStackTraceRecovery(): FileEditException =
        FileEditException(line, detail, this)
    }

@OptIn(ExperimentalStdlibCoroutineSupportApi::class) 
fun main() {
    val original = FileEditException(15, "Unexpected token")
    val copy = original.copyForStackTraceRecovery()

    println(copy.message)
    // When editing line 15: Unexpected token

    println(copy.cause == original)
    // true
}
```

詳細については、この機能の [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/stdlib/KEEP-0461-stacktrace-recoverable.md) を参照してください。フィードバックを [YouTrack](https://youtrack.jetbrains.com/issue/KT-86595) でお待ちしております。

### コレクション要素の等価性と一意性をチェックするための新関数
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin %kotlinEapVersion% より前は、コレクションの要素がすべて異なるか、あるいはすべて等しいかをチェックしたい場合、非効率的なコードパターンを使用する必要がありました。

Kotlin %kotlinEapVersion% では、このギャップを埋めるための実験的な関数が導入されました。

| 関数 | チェック内容 |
|--------------------|------------------------------------------------------------|
| `.allDistinct()` | コレクション内のすべての値が一意である。 |
| `.allDistinctBy()` | すべてのオブジェクトが、選択されたプロパティに対して一意の値を持つ。 |
| `.allEqual()` | コレクション内のすべての値が同じである。 |
| `.allEqualBy()` | すべてのオブジェクトが、選択されたプロパティに対して同じ値を持つ。 |

これらの関数はコレクション、シーケンス、および配列で使用できます。他のコレクション操作と同様に、構造的な等価性（structural equality）を使用して要素を比較します。

これらの関数は [実験的 (Experimental)](components-stability.md#stability-levels-explained) であり、`@OptIn(ExperimentalStdlibApi::class)` アノテーションまたは `-opt-in=kotlin.ExperimentalStdlibApi` コンパイラオプションによるオプトインが必要です。

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

    // すべての参加者が同じ回答をしたかどうかをチェックします
    println(responses.allEqualBy { it.answer })
    // false

    // 重複した参加者がいないかチェックします
    println(responses.allDistinctBy { it.participantId })
    // true

    // すべての回答が同じ日に提出されたかどうかをチェックします
    println(responses.allEqualBy { it.responseDate })
    // true

    val answers = responses.map { it.answer }

    // 回答が同一（すべて同じ）かどうかをチェックします
    println(answers.allEqual())
    // false

    // 回答がすべて異なるかどうかをチェックします
    println(answers.allDistinct())
    // true
}
```

これらの関数を使用した感想などのフィードバックを [YouTrack](https://youtrack.jetbrains.com/issue/KT-30270) でお待ちしております。

## Kotlin/Native

Kotlin %kotlinEapVersion% では、`klib` アーティファクトのインクリメンタルコンパイルがデフォルトで有効になり、シールドクラスのサポートや言語を跨いだ継承（cross-language inheritance）を含む新しい Swift export 機能が導入され、Kotlin コンパイラネイティブイメージの最初のリリースが行われました。

### インクリメンタルコンパイルのデフォルト有効化
<secondary-label ref="native"/>

%kotlinEapVersion% 以降、`klib` アーティファクトのインクリメンタルコンパイルがデフォルトで有効になりました。

インクリメンタルコンパイルを使用すると、プロジェクトモジュールによって生成された `klib` アーティファクトの一部のみが変更された場合、その `klib` の影響を受ける部分のみがさらにバイナリへと再コンパイルされます。

この最適化は [Kotlin 1.9.20](whatsnew1920.md#incremental-compilation-of-klib-artifacts) で初めて導入され、デバッグビルドのコンパイル時間を大幅に短縮することが実証されています。

一部のケースでは、この最適化によってクリーンビルドのパフォーマンスが低下する可能性があることに注意してください。

この機能で予期しない問題が発生した場合は、手動で無効にすることができます。無効にするには、`gradle.properties` ファイルに以下のオプションを設定してください。

```none
kotlin.incremental.native=false
```

問題が発生した場合は、イシュートラッカー [YouTrack](https://kotl.in/issue) で報告してください。コンパイル時間の改善に関するその他のヒントについては、[ドキュメント](native-improving-compilation-time.md) を参照してください。

### 新しい Swift export 機能
<secondary-label ref="native"/>

#### シールドクラス

Kotlin %kotlinEapVersion% では、Swift export にシールドクラス（sealed classes）とインターフェースのサポートが追加されました。

以前は、シールド型に対するすべての `switch` 文において `default` ケースを記述する必要がありました。今回のアップデートにより、Kotlin で定義されたシールド階層が Swift の enum にマッピングされ、Xcode で完全な自動補完を伴う網羅的な（exhaustive） `switch` 文が使用可能になりました。

Swift export は、各シールド型に対して `.sealedType()` メソッドを生成します。このメソッドは、シールド階層の直接のサブクラスと一致するケースを持つ Swift enum を返します。これらの呼び出しを入れ子にすることで、より深い階層に一致させることもできます。

例えば、Kotlin でクラス階層を持つシールドインターフェースを宣言します。

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

Swift 側では、`default` ケースなしで網羅的な `switch` を使用できます。

```swift
// Swift
let shape = createCircle()

let name = switch shape.sealedType() {
   case let .circle(type): "It's a \(type.value)"
   case let .rectangle(type): "It's a \(type.value)"
}
// name == "It's a Circle"
```

`switch` が網羅的であるため、シールド階層に新しいサブクラスが追加されるとコンパイラが警告を出します。これにより、`default` ケースに頼るのではなく、すぐに対応することが可能になります。

#### Swift export における言語を跨いだ継承

Kotlin %kotlinEapVersion% では、Swift export に言語を跨いだ継承（cross-language inheritance）のサポートが導入されました。

この機能の一般的なユースケースは、[リバースインポート](native-lib-import-stability.md#swift-library-import) パターンです。これは、Kotlin でコントラクト（規約）を定義し、Swift 側でプラットフォーム固有の実装を提供する場合です。

例えば、Kotlin のインターフェースを宣言し、それを Swift で実装して、そのインターフェースを受け入れる Kotlin 関数に Swift オブジェクトを渡すことができます。これは、Kotlin に直接インポートできない純粋な Swift ライブラリを使用する必要がある場合に特に便利です。

例として、Kotlin インターフェースと、それを受け取る関数を宣言します。

```kotlin
// Kotlin
interface CryptoProvider {
   fun hashMD5(input: String): String
}

fun processHash(provider: CryptoProvider, input: String): String = provider.hashMD5(input)
```

Swift 側で、純粋な Swift ライブラリを使用してこのインターフェースを実装し、Kotlin に渡します。

```swift
// Swift
import CryptoKit

class IosCryptoProvider: KotlinBase & CryptoProvider {
   func hashMD5(input: String) -> String {
       guard let data = input.data(using: .utf8) else { return "failed" }
       return Insecure.MD5.hash(data: data).description
   }
}

let provider = IosCryptoProvider()

// 呼び出しは Swift の実装にディスパッチされます
print(processHash(provider: provider, input: "Hello, world!"))
```

Kotlin が Swift オブジェクトを受け取ると、それを通常のインターフェースの実装として扱い、Swift コードを実行します。

Swift export の詳細については、[ドキュメント](native-swift-export.md) を参照してください。

### SwiftPM 依存関係用の Package.swift の生成
<secondary-label ref="native"/>

SwiftPM パッケージに依存する XCFramework をエクスポートする場合、正しく解決されるように、結果として得られる SwiftPM パッケージを公開する必要があります。これを支援するため、`assembleSharedXCFramework` Gradle タスクは、XCFramework と共に配布される `Package.swift` ファイルを生成するようになりました。

詳細は、[SwiftPM export のページ](https://kotlinlang.org/docs/multiplatform/multiplatform-spm-export.html) を参照してください。

## Kotlin/Wasm

Kotlin %kotlinEapVersion% では、`@JsFun` 宣言におけるトップレベルの `require()` 呼び出しの処理方法が変更され、コンパニオンオブジェクトの初期化順序が JVM の動作に合わせられました。また、Kotlin Gradle プラグインにおいて `wasmWasi` ターゲットのランタイムとして Wasmtime がサポートされました。

### `@JsFun` 宣言におけるトップレベルの `require()` 呼び出しの変更
<secondary-label ref="wasm"/>

Kotlin/Wasm は、`@JsFun` 宣言がトップレベルの `require()` 関数を使用している場合にエラーを報告するようになりました。

以前、コンパイラは `import-object.mjs` ファイル内に `require` 変数を生成しており、`@JsFun` 宣言から `require()` を呼び出すことが可能でした。

この動作は意図せずコンパイラの実装詳細を公開してしまっていました。この動作からの移行をサポートするため、Kotlin/Wasm はこの生成された `require` 宣言を削除し、コンパイラはこのような呼び出しに対してエラーを報告するようになりました。例：

```kotlin
// エラーを報告します
@JsFun("(mod) => require(mod)")
external fun loadModule(mod: String): JsAny
```

この変更に備えて、`@JsFun` 宣言内のトップレベルの `require()` 呼び出しを `@JsModule` アノテーションに置き換えてください。

```kotlin
@JsModule("module")
external val module: Module

external interface Module {
    // 期待されるモジュールメンバーを定義します
}
```

動的なモジュール読み込みには、代わりに `import()` 式を使用してください。webpack が動的インポートを解析するのを防ぐために、`/* webpackIgnore: true */` マジックコメントを追加してください。

```kotlin
@JsFun("""
    ((module) => () => module)(
        await import(/* webpackIgnore: true */ "module")
    )
""")
private external fun loadModuleDynamically(): JsAny?
```

また、`import()` 式を条件付きで使用することもできます。例えば、Node.js で実行されている場合にのみモジュールを読み込むことができます。

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

プロジェクトがトップレベルの `require()` 関数を必要とする依存関係に依存している場合は、ワークアラウンドとして `globalThis` のプロパティに追加してください。

```kotlin
@JsFun("""
    ((module) => {
        globalThis.require = module.default.createRequire(import.meta.url)
        return () => {}
    })(await import("node:module"))
""")
external fun defineRequire()
```

問題が発生した場合は、[イシュートラッカー](https://youtrack.jetbrains.com/projects/KT/issues/KT-86192) でフィードバックを共有してください。

### コンパニオンオブジェクトの初期化順序の改善
<secondary-label ref="wasm"/>

Kotlin/Wasm は、JVM の動作に合わせて、サブクラスのコンパニオンオブジェクトよりも先にスーパークラスのコンパニオンオブジェクトを初期化するようになりました。以前は、初期化が逆になる可能性があり、プラットフォーム間で動作が一致していませんでした。

このアップデートにより、クロスプラットフォームの一貫性が向上し、クラス初期化の動作におけるプラットフォーム固有の違いが減少します。また、中間クラスがコンパニオンオブジェクトを宣言していないケースを含む、より深い継承階層におけるコンパニオンオブジェクトの初期化を正しく処理できるようになります。

### Kotlin Gradle プラグインにおける Wasmtime のサポート
<secondary-label ref="wasm"/>

Kotlin %kotlinEapVersion% では、Kotlin Gradle プラグインにおいて `wasmWasi` ターゲットのランタイムとして [Wasmtime](https://docs.wasmtime.dev/) のサポートが導入されました。

以前は、`wasmWasi` ターゲットは Node.js ランタイムのみをサポートしており、WASI アプリケーションを実行するには JavaScript のブートストラップが必要でした。Wasmtime のサポートにより、Kotlin/Wasm アプリケーションをスタンドアロンの WebAssembly ランタイムで実行できるようになりました。

`wasmWasi` ターゲットのランタイムとして Wasmtime を使用するには、Gradle ビルドファイルに `wasmtime()` を追加してください。

```kotlin
kotlin {
    wasmWasi {
        wasmtime()
    }
}
```

フィードバックを [YouTrack](https://youtrack.jetbrains.com/issue/KT-86633) でお待ちしております。

## Kotlin/JS

Kotlin %kotlinEapVersion% では、ブラウザテスト用の新しい実験的な DSL が導入され、suspend ラムダを JavaScript の async 関数としてエクスポートする機能のサポートが追加されました。

### ブラウザテスト用の新しい DSL
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="js"/>

Kotlin %kotlinEapVersion% では、ブラウザ環境で Kotlin/JS テストを実行するための新しい実験的な DSL が導入されました。

現在、Kotlin Gradle プラグインは、異なるブラウザ間で JavaScript テストを実行するためのブラウザランチャーとして [Karma](https://github.com/karma-runner/karma) を使用しています。Karma プロジェクトは 2 年前から非推奨となっており、ブラウザテストをサポートするための代替手段を模索してきました。

新しい DSL は、内部でさまざまなツールを管理するマネージャーとして Karma を置き換えることを目的としており、以下のものが含まれています。

* テストランナーとしての [Mocha](https://mochajs.org/)。
* バンドラーとしての [Webpack](https://webpack.js.org/)（[将来のリリース](https://youtrack.jetbrains.com/issue/KT-48308/) で [Vite](https://vite.dev/) に置き換えられる予定です）。
* ブラウザドライバーおよび Chromium、Firefox、WebKit (Safari) ブラウザエンジンの配布マネージャーとしての [Playwright](https://playwright.dev/)。

新しいテスト用 DSL を試すには、Kotlin/JS ターゲット内の `browser{}` ブロックにオプトインの `test{}` ブロックを追加してください。

```kotlin
kotlin {
    js {
        browser {
            @OptIn(ExperimentalJsTestDsl::class)
            // 新しい test{} ブロックを追加し構成します
            test {
                // すべてのブラウザに共通のオプションを設定します
                browserDefaults {
                    timeout = Duration.ofSeconds(2)
                    headless = true
                }
                // Chromium テストランナーを有効にします
                chromium {
                    // 共通のタイムアウトオプションをオーバーライドします
                    timeout = Duration.ofSeconds(5)
                    launchArgs.add("--no-sandbox")
                }
                // Firefox テストランナーを有効にします
                firefox()
                // WebKit テストランナーを有効にします
                webkit { }
                // 追加の WebKit テストランナーを有効にし構成します
                webkit("noheadless") {
                    // カスタムオプションを設定します
                    headless = false
                }
            }
        }
    }
}
```

新しい DSL は活発に開発中です。フィードバックを [YouTrack](https://youtrack.jetbrains.com/issue/KT-66897) でお待ちしております。

### suspend ラムダを async 関数としてエクスポートする機能のサポート
<secondary-label ref="js"/>

Kotlin %kotlinEapVersion% では、suspend ラムダを JavaScript の async 関数としてエクスポートできるようになりました。

以前は、suspend ラムダを含む宣言を Kotlin/JS ライブラリからエクスポートする方法がありませんでした。今回のアップデートにより、Kotlin コンパイラは Kotlin の suspend 関数とネイティブ JavaScript の [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) モデルの間のブリッジ（連携）を自動的に処理するようになり、Kotlin と TypeScript が混在するコードベースで便利に使用できます。

この機能を有効にするには、`build.gradle.kts` ファイルに以下のコンパイラオプションを追加してください。

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

次に、関連する宣言に `@JsExport` を付与します。

```kotlin
// Kotlin
@JsExport
class TaskRunner {
    suspend fun runTask(task: suspend () -> String): String {
        return task()
    }
}
```

TypeScript 側からは、suspend ラムダは通常の async 関数として見えます。

```typescript
// TypeScript
import { TaskRunner } from "..."

const runner = new TaskRunner();
const result = await runner.runTask(async () => "done");
console.log(result); // "done"
```

`@JsExport` アノテーションの詳細については、[ドキュメント](js-to-kotlin-interop.md#jsexport-annotation) を参照してください。

## ビルドツール API

### Kotlin/JS、Kotlin/Wasm、および Kotlin メタデータのサポート
<primary-label ref="experimental-general"/>
<secondary-label ref="bta"/>

[Kotlin 2.2.0](whatsnew22.md#new-experimental-build-tools-api) では、ビルドツール API (BTA) が Kotlin/JVM で利用可能になりました。Kotlin %kotlinEapVersion% では、新しいターゲット（Kotlin/JS、Kotlin/Wasm、および Kotlin メタデータ）のサポートを追加することで、BTA の安定化に向けた次のステップに進みます。

これにより、Kotlin Gradle プラグインとコンパイラの相互作用がより一貫したものになります。また、一部のケースでは、より高速で安定したコンパイルの恩恵を受けることができます。

BTA は、ビルドシステムと Kotlin コンパイラエコシステムの間の抽象化レイヤーとして機能するユニバーサルな API です。これは、利用可能なビルドツールにおいて、Kotlin の機能のサポートと Kotlin コンパイラとの互換性を確保するのに役立ちます。

Kotlin Gradle プラグインにおける新しいターゲットへの BTA サポートを段階的に展開する予定です。

* Kotlin 2.4.20-Beta1 では、フィードバックを収集するために、Kotlin/JS、Kotlin/Wasm、および Kotlin メタデータで BTA がデフォルトで有効になっています。プロジェクトでの追加の変更は必要ありません。
* Kotlin 2.4.20-Beta2 から最終的な Kotlin 2.4.20 リリースの間は、新しいターゲットでの BTA はオプトインとして利用可能になります。試すには、`gradle.properties` ファイルに対応するプロパティを追加してください。

  ```kotlin
  kotlin.wasm.runViaBuildToolsApi = true
  kotlin.js.runViaBuildToolsApi = true
  kotlin.metadata.runViaBuildToolsApi = true
  ```

* Kotlin 2.5.0 以降、BTA は Kotlin/JS、Kotlin/Wasm、および Kotlin メタデータで再びデフォルトで有効になります。

BTA の提案について詳しく知りたい、またはフィードバックを共有したい場合は、この [KEEP](https://github.com/Kotlin/KEEP/blob/build-tools-api/proposals/extensions/build-tools-api.md) を参照してください。

### Kotlin コンパイラ: ネイティブイメージ
<primary-label ref="experimental-general"/>
<secondary-label ref="compiler"/>

Kotlin %kotlinEapVersion% では、Kotlin コンパイラネイティブイメージ（native image）の最初の [実験的 (Experimental)](components-stability.md#stability-levels-explained) リリースが行われました。ネイティブイメージは、標準の `kotlinc` コマンドラインツールをそのまま置き換え可能な（drop-in replacement）ものとして提供され、起動時間の短縮と高いパフォーマンスを実現します。

ネイティブイメージを試すには、[GitHub Releases](https://github.com/JetBrains/kotlin/releases/tag/v%kotlinEapVersion%) からビルドをダウンロードしてください。

ネイティブイメージには、CLI オプションの `-Xplugin` または `-Xcompiler-plugin` で使用できる以下のコンパイラプラグインも同梱されています。

* [Serialization](serialization.md)
* [Compose コンパイラ](compose-compiler-options.md)
* [All-open](all-open-plugin.md)
* [`no-arg`](no-arg-plugin.md)
* [SAM with receiver](sam-with-receiver-plugin.md)
* [Assignment](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.plugin.assignment)
* [Lombok](lombok.md)
* [Power-assert](power-assert.md)

Kotlin コンパイラネイティブイメージの詳細については、その [README](https://github.com/JetBrains/kotlin/blob/master/prepare/compiler-native-image/README.md) を参照してください。