---
title: Gradleのセットアップ
---

# Gradleのセットアップ

このページでは、各プラットフォーム向けのGradle依存関係と、公開されているすべてのKoinアーティファクトを一覧で示します。サンプルではKotlin DSL（`build.gradle.kts`）およびバージョンカタログを使用しています。コンパイル時チェックやCompiler Plugin DSLを追加する場合は、[Compiler Plugin Setup](/docs/setup/compiler-plugin)の手順もあわせて参照してください。

## バージョン {id="versions"}

`koin-annotations` を含むすべてのKoinライブラリは、共通のバージョンを共有しています。現在の安定版バージョンは 4.2.2 です。

- Koin: [![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-core?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-core)

すべてのアーティファクトは、グループ `io.insert-koin` の下で [Maven Central](https://central.sonatype.com/search?q=io.insert-koin) に公開されています。バージョンの履歴やアップグレードに関する注意事項は [Releases](/docs/support/releases) に記載されています。

## Koin BOM {id="koin-bom"}

Koin BOM（Bill of Materials）は、すべてのKoinライブラリを同じバージョンに固定します。BOMのバージョンを一度宣言すれば、Koinライブラリをバージョン指定なしで追加できます。BOMを更新すると、すべてのKoinライブラリが一括で更新されます。

`gradle/libs.versions.toml` の場合：

```toml
[versions]
koin = "4.2.2"

[libraries]
koin-bom = { module = "io.insert-koin:koin-bom", version.ref = "koin" }
koin-core = { module = "io.insert-koin:koin-core" }
koin-android = { module = "io.insert-koin:koin-android" }
koin-compose = { module = "io.insert-koin:koin-compose" }
koin-compose-viewmodel = { module = "io.insert-koin:koin-compose-viewmodel" }
koin-compose-viewmodel-navigation = { module = "io.insert-koin:koin-compose-viewmodel-navigation" }
koin-ktor = { module = "io.insert-koin:koin-ktor" }
koin-logger-slf4j = { module = "io.insert-koin:koin-logger-slf4j" }
koin-annotations = { module = "io.insert-koin:koin-annotations" }
koin-test = { module = "io.insert-koin:koin-test" }
koin-test-junit4 = { module = "io.insert-koin:koin-test-junit4" }
```

モジュールの `build.gradle.kts` の場合：

```kotlin
dependencies {
    implementation(platform(libs.koin.bom))
    implementation(libs.koin.android)
}
```

バージョンカタログを使用しない場合：

```kotlin
dependencies {
    implementation(platform("io.insert-koin:koin-bom:4.2.2"))
    implementation("io.insert-koin:koin-android")
    testImplementation("io.insert-koin:koin-test-junit4")
}
```

特定の依存関係にバージョンを記述すると、その依存関係についてのみBOMの設定が上書きされます。特定のライブラリのより新しいリリースに含まれる修正が必要な場合を除き、これは避けてください。

### BOMを使用しない場合 {id="without-the-bom"}

各ライブラリに個別にバージョンを指定することもできます。[Koin samples](https://github.com/InsertKoinIO/koin-getting-started) ではこの方法が採用されており、Kotlin Multiplatformのソースセットでも同様に動作します。

```toml
[versions]
koin = "4.2.2"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-android = { module = "io.insert-koin:koin-android", version.ref = "koin" }
```

すべてのKoinライブラリで単一の `koin` バージョンを維持してください。異なるバージョンの混在はサポートされていません。

## Kotlin/JVM {#kotlin}

```kotlin
dependencies {
    implementation(platform(libs.koin.bom))
    implementation(libs.koin.core)
}
```

その後、`main` でKoinを起動します。[Starting Koin](/docs/reference/koin-core/starting-koin) および [Kotlin tutorial](/docs/quickstart/kotlin) を参照してください。

## Android {#android}

```kotlin
dependencies {
    implementation(platform(libs.koin.bom))
    implementation(libs.koin.android)
}
```

`koin-android` には `koin-core` とViewModelサポートが含まれています。`Application` クラスでKoinを起動してください。[Start Koin on Android](/docs/reference/koin-android/start) を参照してください。

任意のAndroidライブラリ：

| アーティファクト | 追加される機能 |
|----------|------|
| `koin-androidx-workmanager` | WorkManagerのワーカー：[WorkManager](/docs/reference/koin-android/workmanager) を参照 |
| `koin-androidx-navigation` | ナビゲーショングラフにスコープされたViewModel（Fragment向け） |
| `koin-androidx-startup` | AndroidX App StartupによるKoinの起動 |
| `koin-android-compat` | JavaクラスからインジェクトするためのJavaヘルパー |
| `koin-dagger-bridge` | 移行期間中にKoinからDaggerコンポーネントを使用 |

## Android with Jetpack Compose {#compose-android}

```kotlin
dependencies {
    implementation(platform(libs.koin.bom))
    implementation(libs.koin.android)
    implementation(libs.koin.compose)
    implementation(libs.koin.compose.viewmodel)
}
```

`koin-androidx-compose` は、`koin-compose` と `koin-compose-viewmodel` を1つの依存関係にまとめたAndroid専用のアーティファクトです。どちらの設定でも動作します。

ナビゲーションを利用する場合は、次のいずれかを追加してください：

| アーティファクト | ナビゲーションライブラリ |
|----------|--------------------|
| `koin-androidx-compose-navigation` | Navigation Compose 2（Android専用） |
| `koin-compose-viewmodel-navigation` | Navigation Compose 2（マルチプラットフォーム） |
| `koin-compose-navigation3` | Navigation 3：[Navigation 3](/docs/reference/koin-compose/navigation3) を参照 |

APIの詳細については [Koin for Compose](/docs/reference/koin-compose/compose) を参照してください。

## Compose Multiplatform {#compose}

共有モジュールでは、Composeライブラリを `commonMain` に追加します。マルチプラットフォームのソースセットでは、バージョン情報を持つカタログエントリを使用してください（[BOMを使用しない場合](#without-the-bom) を参照）：

```kotlin
kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation(libs.koin.core)
            implementation(libs.koin.compose)
            implementation(libs.koin.compose.viewmodel)
            implementation(libs.koin.compose.viewmodel.navigation) // Navigation Composeを使用する場合
        }
    }
}
```

Androidでは `koin-compose` が自動的に `koin-android` を取り込むため、追加する必要はありません。[Compose Multiplatform tutorial](/docs/quickstart/cmp) を参照してください。

## Kotlin Multiplatform {#kotlin-multiplatform}

共有モジュールの `build.gradle.kts` で、バージョン情報を持つカタログエントリを使用します（[BOMを使用しない場合](#without-the-bom) を参照）：

```kotlin
kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation(libs.koin.core)
        }
        androidMain.dependencies {
            implementation(libs.koin.android)
        }
        commonTest.dependencies {
            implementation(libs.koin.test)
        }
    }
}
```

`koin-core` は、JVM、Android、Appleターゲット（iOS、macOS、tvOS、watchOS）、Linux、Windows、JS、およびWasm（`wasmJs`）をサポートしています。プロジェクト構成やプラットフォーム固有の定義については、[Kotlin Multiplatform Setup](/docs/reference/koin-core/kmp-setup) で解説されています。

## Ktor {#ktor}

```kotlin
dependencies {
    implementation(platform(libs.koin.bom))
    implementation(libs.koin.ktor)
    implementation(libs.koin.logger.slf4j)
}
```

KtorアプリケーションにKoinプラグインをインストールします。[Koin for Ktor](/docs/reference/koin-ktor/ktor) を参照してください。

## テスト {#testing}

```kotlin
dependencies {
    testImplementation(libs.koin.test)
    testImplementation(libs.koin.test.junit4) // または koin-test-junit5
}
```

Androidのインストゥルメンテッドテスト（Instrumented tests）の場合は、`androidTestImplementation` に `koin-android-test` を追加してください。[Injecting in Tests](/docs/reference/koin-test/testing) および [Android Instrumented Testing](/docs/reference/koin-android/instrumented-testing) を参照してください。

## すべてのアーティファクト {id="all-artifacts"}

| アーティファクト | プラットフォーム | 説明 |
|----------|-----------|-------------|
| `koin-bom` | 全プラットフォーム | 下記のすべてのアーティファクト向けBill of Materials（部品表） |
| `koin-core` | 全プラットフォーム | コンテナ、DSL、スコープ、Compiler Plugin DSL |
| `koin-core-coroutines` | 全プラットフォーム | 遅延ロードモジュールとバックグラウンドロード |
| `koin-core-viewmodel` | 全プラットフォーム | AndroidおよびCompose Multiplatform用のViewModel定義 |
| `koin-annotations` | 全プラットフォーム | コンパイラプラグイン用アノテーション（`@Singleton`、`@Module`、`@Named` など） |
| `koin-android` | Android | Androidコンテキスト、ActivityおよびFragment用API、ViewModel |
| `koin-android-compat` | Android | Java互換性ヘルパー |
| `koin-androidx-navigation` | Android | ナビゲーショングラフにスコープされたViewModel |
| `koin-androidx-workmanager` | Android | WorkManagerの統合 |
| `koin-androidx-startup` | Android | AndroidX App Startupの統合 |
| `koin-dagger-bridge` | Android | KoinからDaggerコンポーネントへのアクセス |
| `koin-compose` | 全Composeターゲット | `koinInject()`、`KoinApplication`、およびComposeコンテキスト |
| `koin-compose-viewmodel` | 全Composeターゲット | `koinViewModel()` |
| `koin-compose-viewmodel-navigation` | 全Composeターゲット | Navigation ComposeのバックスタックエントリにスコープされたViewModel |
| `koin-compose-navigation3` | 全Composeターゲット | Navigation 3の統合 |
| `koin-androidx-compose` | Android | Android向けの `koin-compose` と `koin-compose-viewmodel` のバンドル |
| `koin-androidx-compose-navigation` | Android | Android向けNavigation Compose 2 |
| `koin-ktor` | JVM、JS、Wasm、iOS、macOS（Ktorサーバーターゲット） | Ktorサーバープラグイン |
| `koin-logger-slf4j` | JVM | SLF4Jロガー |
| `koin-test` | 全プラットフォーム | テストAPI：`KoinTest`、`verify()` |
| `koin-test-coroutines` | JVM | 遅延ロードモジュールの検証 |
| `koin-test-junit4` | JVM | JUnit 4ルール |
| `koin-test-junit5` | JVM | JUnit 5拡張機能 |
| `koin-android-test` | Android | インストゥルメンテッドテスト用ヘルパー |

Koin Compiler PluginはライブラリではなくGradleプラグインであり、独自のバージョンを持っています。[Compiler Plugin Setup](/docs/setup/compiler-plugin) を参照してください。

## 関連情報 {id="related"}

- [Compiler Plugin Setup](/docs/setup/compiler-plugin)：コンパイラプラグインとコンパイル時チェックの追加。
- [Setup](/docs/setup)：プラットフォームごとにインストールするもの。
- [Starting Koin](/docs/reference/koin-core/starting-koin)：依存関係の設定完了後にコンテナを起動する方法。
- [Tutorials](/docs/quickstart/kotlin)：各プラットフォームでの最初のアプリ構築。
- [Releases](/docs/support/releases)：バージョン情報とアップグレードに関する注意事項。