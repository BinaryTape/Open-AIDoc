---
title: コンパイラープラグインのセットアップ
---

# コンパイラープラグインのセットアップ

このページでは、Compiler Plugin DSLおよびアノテーションの基盤となるKotlinコンパイラープラグインである、Koin Compiler Pluginの導入手順について説明します。シングルモジュール、マルチモジュール、Kotlin Multiplatform（KMP）ビルド、主要なオプション、およびセットアップ時のトラブルシューティングを網羅しています。プラグインの機能の詳細については、[Koin Compiler Plugin](/docs/intro/koin-compiler-plugin) を参照してください。Koinライブラリ自体の情報については、[Gradle Setup](/docs/setup/gradle) に記載されています。

## 要件 {id="requirements"}

- Kotlin 2.3.20以降（K2コンパイラー）。
- Koin 4.2.0以降。
- Gradle 8以降。

現在のバージョン:

- Koin: [![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-core?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-core)
- Koin Compiler Plugin: [![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-compiler-plugin?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-compiler-plugin)

プラグインには、Koinとは別に独自のバージョンがあります。`koin-annotations` はKoinのバージョンに準拠します。

## インストール {id="install"}

### 1. プラグインの宣言 {id="1-declare-the-plugin"}

`gradle/libs.versions.toml` 内:

```toml
[versions]
koin = "4.2.2"
koin-plugin = "1.2.1"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }

[plugins]
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

[Koin BOM](/docs/setup/gradle#koin-bom) を使用している場合は、ライブラリから `version.ref` を削除してください。プラグインはBOMの一部ではないため、独自のバージョンを維持します。

### 2. プラグインリポジトリの設定 {id="2-plugin-repositories"}

プラグインはMaven CentralおよびGradle Plugin Portalで公開されています。`settings.gradle.kts` に以下を記述します:

```kotlin
pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}
```

### 3. プラグインの適用 {id="3-apply-the-plugin"}

Koinの定義を宣言する各Gradleモジュールの `build.gradle.kts` 内で適用します:

```kotlin
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(libs.koin.core)          // または koin-android、koin-ktor など
    implementation(libs.koin.annotations)   // アノテーション用、およびDSLスタイルでの @Named や @InjectedParam 用
}
```

Compiler Plugin DSL（`single<T>()`、`factory<T>()`、`viewModel<T>()`）は、パッケージ `org.koin.plugin.module.dsl` 内でKoinライブラリに同梱されています。`koin-annotations` は、DSLスタイルでのパラメータアノテーションを含め、アノテーションを使用する場合にのみ必要です。

:::tip
`@KoinViewModel` および `@KoinWorker` は、クラスパス上にそれぞれのランタイムライブラリが必要です。具体的には、`koin-core-viewmodel`（`koin-android` および `koin-compose-viewmodel` に同梱）と `koin-androidx-workmanager` です。これらが不足している場合、ビルドは該当するアーティファクト名を指定したエラーで失敗します。
:::

### 4. 動作確認 {id="4-check-that-it-works"}

1回のビルドでプラグインのログを有効にします:

```kotlin
koinCompiler {
    userLogs = true
}
```

ビルド出力に、プラグインによって検出された各定義が一覧表示されます。確認が完了したら再度無効にしてください。その後、[Starting Koin](/docs/reference/koin-core/starting-koin) に記載されているとおり、`startKoin { }`、またはアノテーションの場合は `startKoin<MyApp>()` を使用してKoinを起動します。

## マルチモジュールプロジェクト {id="multi-module-projects"}

appモジュールだけでなく、定義を宣言するすべてのGradleモジュールにプラグインを適用します:

```kotlin
// feature/build.gradle.kts
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(libs.koin.core)
    implementation(libs.koin.annotations)
}
```

```kotlin
// app/build.gradle.kts
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(project(":feature"))
    implementation(libs.koin.android)
    implementation(libs.koin.annotations)
}
```

プラグインでコンパイルされた各モジュールには、その定義に関するメタデータが含まれます。appモジュールはこれを読み取り、`startKoin` 時にグラフ全体を検証します。プラグインが適用されていないライブラリモジュールは、この検証から不可視（除外）となります。複数のGradleモジュールにまたがってモジュールを組み立てる方法（`includes`、`@Configuration`）については、[Modules](/docs/reference/koin-core/modules) および [Multi-Module Android Apps](/docs/reference/koin-android/multi-module) で説明しています。

## Kotlin Multiplatform {id="kotlin-multiplatform"}

プラグインをsharedモジュールに1回適用し、ライブラリを `commonMain` に追加します。ターゲットごとの設定は不要です:

```kotlin
// shared/build.gradle.kts
plugins {
    alias(libs.plugins.kotlin.multiplatform)
    alias(libs.plugins.koin.compiler)
}

kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation(libs.koin.core)
            implementation(libs.koin.annotations)
        }
    }
}
```

プロジェクト構造については [Kotlin Multiplatform Setup](/docs/reference/koin-core/kmp-setup) を参照してください。

## オプション {id="options"}

`koinCompiler` ブロックでプラグインを設定します。デフォルト値はほとんどのプロジェクトに適しています:

```kotlin
koinCompiler {
    compileSafety = true      // ビルド時にグラフを検証
    skipDefaultValues = true  // インジェクションを行わず、Kotlinのデフォルト値を使用
    userLogs = false          // 検出された定義をログに出力
}
```

`strictSafety`、`unsafeDslChecks`、`logSeverity`、`debugLogs` を含むすべてのオプションについては、[Compiler Plugin Options](/docs/reference/koin-annotations/options) で説明されています。

## Kotlinバージョンの互換性 {id="kotlin-version-compatibility"}

各プラグインのリリースは、以下のKotlinバージョンリストで検証されています:

| Kotlin | Koin Compiler Plugin |
|--------|----------------------|
| 2.3.20, 2.4.0, 2.4.10 | 1.2.0+ |
| 2.4.20 | 1.2.1+ |

リストにないKotlinバージョンの場合、プラグインは警告を出力し、ビルドは続行されます。

:::warning
Kotlin 2.4.20では、プラグイン1.2.0はIR生成中に `NoSuchMethodError` で失敗します。1.2.1以降を使用してください。
:::

## トラブルシューティング {id="troubleshooting"}

### プラグインが見つからない {id="plugin-not-found"}

Gradleが `io.insert-koin.compiler.plugin` を解決できません。`settings.gradle.kts` の `pluginManagement.repositories` に `mavenCentral()` と `gradlePluginPortal()` が含まれているか確認してください。

### ランタイム時のNotImplementedError {id="notimplementederror-at-runtime"}

`single<T>()`、`factory<T>()`、`create(::T)` は、プラグインによって置き換えられるプレースホルダーです。これらを含むGradleモジュールにプラグインが適用されていない場合、コードはコンパイルされますが、モジュール作成時に `NotImplementedError` がスローされます。該当のモジュールにプラグインを適用してください。

### インポートの誤り {id="wrong-imports"}

Compiler Plugin DSLとConstructor DSLには、異なるパッケージに同じ名前の関数が存在します:

```kotlin
// Compiler Plugin DSL
import org.koin.plugin.module.dsl.*

// Constructor DSL: singleOf, factoryOf, viewModelOf
import org.koin.core.module.dsl.*

// 両方共通
import org.koin.dsl.module
```

### リファクタリング後に古い結果が残る {id="stale-results-after-a-refactor"}

他のKotlin IRプラグイン（Composeコンパイラーなど）と同様に、Koin Compiler Pluginでもインクリメンタルコンパイル時に古い結果が残ってしまうことがあります。症状は以下のとおりです:

- 表示されるはずのないコンパイル安全性エラーが発生する、または定義を削除したのにエラーが表示されない。
- リファクタリング後、ランタイム時に `NoSuchMethodError` や `ClassNotFoundException` が発生する。

これは通常、以下のような変更の後に発生します:

- クラス上のアノテーションの変更（`@Singleton` から `@Factory` への変更、`@Named` の追加または削除）。
- `@ComponentScan` のスキャン対象パッケージ間でのクラスの移動。
- モジュールの `includes` または `@Configuration` ラベルの変更。
- 他のモジュールが依存しているライブラリモジュールでの定義の追加または削除。

クリーンビルドを実行してください: `./gradlew clean build`、またはAndroid Studioで「Build」>「Clean Project」を実行してから「Build」>「Rebuild Project」を実行します。

`module { }` ラムダ内の変更に対して、プラグインはエントリーポイント（`startKoin`、`koinApplication`、`@KoinApplication`）を含むモジュールで `strictSafety` を有効にします。これにより、それらのモジュールのビルドごとにグラフ全体の検証が再実行されます。詳細は [`strictSafety`](/docs/reference/koin-annotations/options) を参照してください。

### モジュール間で依存関係の欠落が報告される {id="missing-dependency-reported-across-modules"}

ライブラリモジュールで宣言されている依存関係が欠落しているとプラグインが報告する場合:

1. ライブラリモジュールにもプラグインを適用してください。プラグインがない場合、ライブラリにメタデータが含まれません。
2. そのライブラリを使用するモジュールよりも前にライブラリがビルドされていることを確認してください。通常は `implementation(project(":lib"))` によって順序が保証されます。
3. 初めてライブラリにプラグインを追加した後は、クリーンビルドを実行してください。
4. プラグイン1.2.1以降を使用してください。以前のバージョンでは、2段階以上離れた `implementation` の定義を見落としたり、モジュールをまたいで `@Named` プロバイダーをマージしたりすることがありました。誤った `KOIN-D001` エラーによって `compileSafety` を無効にしていた場合は、再度有効にしてください。

## Compiler Pluginへの移行 {id="moving-to-the-compiler-plugin"}

- **Constructor DSLまたはClassic DSLから**: プラグインを適用します。既存の `singleOf(::T)` 定義や `get()` 呼び出しは変更なしでビルド時に検証されます。その後、モジュールごとに `single<T>()` へ置き換えることができます。[Choosing your style](/docs/intro/choosing-your-style) を参照してください。
- **KSPプロセッサーから**: KSPと `koin-ksp-compiler` を削除し、プラグインを適用して、生成された `.module` 拡張関数を `startKoin<MyApp>()` に置き換えます。アノテーションはそのまま維持されます。[Migrating from KSP](/docs/migration/from-ksp-to-compiler-plugin) を参照してください。

## 関連情報 {id="related"}

- [Koin Compiler Plugin](/docs/intro/koin-compiler-plugin): プラグインの機能と仕組み。
- [Compiler Plugin Options](/docs/reference/koin-annotations/options): すべてのGradleオプション。
- [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety): すべての検証項目とエラーコード。
- [Gradle Setup](/docs/setup/gradle): KoinライブラリとBOM。
- [Starting Koin](/docs/reference/koin-core/starting-koin): `startKoin<MyApp>()` などの型付けされた起動API。