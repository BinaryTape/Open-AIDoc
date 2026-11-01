---
title: コンパイラプラグインオプション
---

# コンパイラプラグインオプション

このページでは、`build.gradle.kts` の `koinCompiler { }` ブロックで設定可能な Koin コンパイラプラグインのすべてのオプションを一覧で示します。本ページはプラグインがインストールされていることを前提としています（[コンパイラプラグインのセットアップ](/docs/setup/compiler-plugin)を参照）。これらのオプションは、コンパイラプラグイン DSL とアノテーションの双方に適用されます。

## すべてのオプション {id="all-options"}

```kotlin
// build.gradle.kts
plugins {
    alias(libs.plugins.koin.compiler)
}

koinCompiler {
    compileSafety = true
    skipDefaultValues = true
    unsafeDslChecks = true
    userLogs = false
    debugLogs = false
}
```

| オプション | 型 | デフォルト値 | 効果 |
|---|---|---|---|
| `compileSafety` | Boolean | `true` | ビルド時に依存関係グラフを検証します |
| `strictSafety` | Boolean | 自動検出 | アグリゲーターモジュールのビルドごとにフルグラフチェックを再実行します |
| `strictSafetyForceOff` | Boolean | `false` | `strictSafety` の誤った自動検出を確認し、それをオフにします |
| `skipDefaultValues` | Boolean | `true` | パラメータを解決する代わりに Kotlin のデフォルト値を使用します |
| `unsafeDslChecks` | Boolean | `true` | `create()` がラムダ内の唯一の命令であることを要求します |
| `userLogs` | Boolean | `false` | プラグインが検出したコンポーネントをログ出力します |
| `debugLogs` | Boolean | `false` | プラグインの内部情報をログ出力します |
| `logSeverity` | String | `"warning"` | プラグインの情報出力の重要度（Severity） |
| `versionCheckSeverity` | String | `"warning"` | Kotlin バージョン互換性警告の重要度（Severity） |
| `aiAssist` | Boolean | `true` | Koin の診断情報があるビルドの末尾にヘルプ行を1行追加します |

## compileSafety {id="compilesafety"}

有効にすると、プラグインはビルド時にグラフ内のすべての依存関係が解決可能かどうかをチェックします。定義の欠落、修飾子（qualifier）の不一致、循環依存関係、一致する定義のない `get()` や `inject()` の呼び出し箇所などが対象です。問題がある場合は、実行時にクラッシュするのではなく、ビルドが失敗します。

```kotlin
koinCompiler {
    compileSafety = false
}
```

この設定は有効のままにしておくことを推奨します。無効にすると、すべてのコンパイル時チェックが削除され、`strictSafety` も効果を発揮しなくなります。何がチェックされるかについては、[コンパイル時の安全性](/docs/reference/koin-compiler/compile-safety)で説明されています。

## strictSafety {id="strictsafety"}

フルグラフチェックは、Koin を起動するモジュール（アグリゲーター: `startKoin`、`koinApplication`、または `@KoinApplication` を含む Gradle モジュール）で実行されます。Kotlin のインクリメンタルコンパイルでは、`module { }` ラムダ本体内の編集後など、グラフが他の場所で変更された場合でも、そのモジュールを「最新（up-to-date）」としてマークすることがあります。その場合チェックが再実行されず、エラーは実行時に発生することになります。

`strictSafety` を設定すると、ビルドキャッシュや up-to-date によるスキップを行わず、アグリゲーターの `compileKotlin` タスクがビルドごとに必ず再実行されます。ライブラリや機能（feature）モジュールはインクリメンタルな状態を維持します。

このオプションは手動で設定する必要はありません。未設定の場合、Gradle プラグインはモジュールのソースコードから `startKoin`、`koinApplication`、または `@KoinApplication` をスキャンし、該当モジュールで自動的に有効化します。この決定はライフサイクルログで通知されます:

```
[Koin] Auto-enabling strictSafety on :app (detected startKoin / @KoinApplication / koinApplication).
```

検出が見逃されたモジュールで強制的に有効化するには、`strictSafety = true` を設定します:

```kotlin
koinCompiler {
    strictSafety = true
}
```

エントリーポイントが検出されたモジュールでは、`strictSafety = false` を設定しても効果はありません（コンパイラプラグイン 1.1.0 以降）。これはエントリーポイントが検出されなかったモジュールでのみ意味を持ちます。また、`compileSafety = false` の場合、このオプションは効果がありません。

トレードオフとして、ビルドごとにアグリゲーターモジュールの完全な再コンパイルが1回発生します。インクリメンタルコンパイルのギャップに関する背景については、[koin-compiler-plugin issue #32](https://github.com/InsertKoinIO/koin-compiler-plugin/issues/32) を参照してください。

## strictSafetyForceOff {id="strictsafetyforceoff"}

検出はテキスト一致によって行われます。コメントや文字列リテラル内の `startKoin` にも一致してしまうため、アグリゲーターではないモジュールで `strictSafety` が有効になってしまう場合があります。誤検出であることを確認した場合は、両方のオプションを設定します:

```kotlin
koinCompiler {
    strictSafety = false
    strictSafetyForceOff = true
}
```

両方の設定が必要です。`strictSafetyForceOff` は `strictSafety = false` と併用した場合にのみ適用されます。必ず誤検出であることが確認できた場合のみ使用してください。実際のエントリーポイントでこれを使用すると再実行が無効になり、インクリメンタルビルド後にグラフのエラーが実行時に持ち越される可能性があります。

## skipDefaultValues {id="skipdefaultvalues"}

有効にすると、Kotlin のデフォルト値を持つ非 null パラメータはデフォルト値を維持し、Koin からは解決されません:

```kotlin
@Singleton
class ApiClient(
    val repository: UserRepository,                         // Koin から解決
    val timeout: Int = 30_000,                              // Kotlin のデフォルト値
    @Property("api_url") val url: String = "https://...",   // アノテーションが付いているため解決される
    val logger: Logger? = null,                             // getOrNull() で解決
)
```

Null 許容パラメータは引き続き `getOrNull()` で解決されます。`@Named`、`@Qualifier`、`@InjectedParam`、または `@Property` が付与されたパラメータは、デフォルト値の有無にかかわらず常に解決されます。すべてのパラメータを Koin から解決したい場合は、`skipDefaultValues = false` を設定してください。

## unsafeDslChecks {id="unsafedslchecks"}

有効にすると、`create(::T)` の呼び出しはその定義ラムダ内の唯一の命令である必要があります。これにより、ラムダがプラグインで解析および検証可能な状態に保たれます。違反するとビルドが失敗します:

```
[Koin][KOIN-S001] create(::UserRepository) must be the only instruction in the lambda. Other statements are not allowed when using create(). To disable this check, set koinCompiler { unsafeDslChecks = false } in your build.gradle.kts
```

`create()` ラムダ内で他のステートメントを実行している Classic DSL コードを移行する間は一時的に `false` に設定し、移行完了後に再度有効化してください。

## userLogs と debugLogs {id="userlogs-and-debuglogs"}

`userLogs = true` は、プラグインが検出および処理した内容を出力します。インターセプトした DSL 定義（`single<T>()`、`factory<T>()`）、アノテーション付きクラス（`@Singleton`、`@Module`）、および生成されたモジュールなどです。定義が認識されない場合に使用してください。

`debugLogs = true` は、プラグインの内部情報（FIR および IR フェーズ、モジュール検出）を出力します。プラグインのバグを報告する場合に使用してください。

どちらも `[Koin]` プレフィックスが付いた行を、`logSeverity` で設定された重要度で出力します。

## logSeverity と versionCheckSeverity {id="logseverity-and-versioncheckseverity"}

どちらも `"warning"`（デフォルト）または `"info"` を受け入れます。

```kotlin
koinCompiler {
    logSeverity = "info"
    versionCheckSeverity = "info"
}
```

- **logSeverity**: 情報出力（`userLogs`、`debugLogs`、「Koin エントリーポイントがありません」の通知、`@Monitor` の概要）の重要度。ビルドで `allWarningsAsErrors` を使用している場合、これらの出力によってビルドが失敗しないように `"info"` に設定してください。
- **versionCheckSeverity**: プラグインが検証されていない Kotlin バージョンでビルドした際に表示される警告の重要度。ログ出力を抑制しても互換性のリスクが隠れてしまわないよう、独立した設定になっています。Kotlin バージョンが正常に動作することを確認した後にのみ `"info"` に設定してください。

どちらのオプションも、実際の診断（`KOIN-D001`、`KOIN-W003` など）の重要度は変更せず、独自の重要度が維持されます。

## aiAssist {id="aiassist"}

ビルドで少なくとも1つの Koin 診断情報が報告された場合、プラグインはコンパイルの最後に1行追加し、AI コーディングアシスタントがエラーを分類して修正を提案するために使用できる Kotzilla MCP サーバーを案内します:

```
[Koin] → Fix with AI: set up Kotzilla MCP at https://kotzilla.io/koin-mcp
```

この行はエラーごとではなく、1回のビルドにつき1回表示されます。非表示にするには `aiAssist = false` を設定してください。

## 関連情報 {id="related"}

- [コンパイル時の安全性](/docs/reference/koin-compiler/compile-safety): `compileSafety` がチェックする内容とレポートされる診断情報。
- [コンパイラプラグインのセットアップ](/docs/setup/compiler-plugin): プラグインとその依存関係のインストール。
- [Koin コンパイラプラグイン](/docs/intro/koin-compiler-plugin): プラグインの機能と仕組み。
- [トラブルシューティング](/docs/reference/koin-core/troubleshooting): 実行時エラーとデバッグ。