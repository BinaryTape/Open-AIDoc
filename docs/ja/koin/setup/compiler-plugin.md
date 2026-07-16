---
title: コンパイラプラグインのセットアップ
---

# Koinコンパイラプラグインのセットアップ

**Koinコンパイラプラグイン**は、すべての新しいKotlin 2.xプロジェクトにおいて推奨されるアプローチです。オートワイヤリング（auto-wiring）、コンパイル時の安全性、そしてよりクリーンなDSL構文を提供します。

## コンパイラプラグインとは？

Koinコンパイラプラグインは、以下の特徴を持つ**ネイティブなKotlinコンパイラプラグイン（K2）**です：

- コンストラクタの依存関係を自動検出
- コンパイル時の解析を提供
- DSLとアノテーションの両方で動作
- 可視ファイルの生成なし

機能とメリットの詳細については、[Koinコンパイラプラグインの導入](/docs/setup/compiler-plugin)を参照してください。

## 要件

- **Kotlin 2.3+** (K2コンパイラ)
- **Gradle 8.x+**

## セットアップ

### ステップ 1: バージョンカタログへのKoinの追加

まず、最新バージョンを確認してください：
- Koin: [![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-core?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-core)
- Koinコンパイラプラグイン: [![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-compiler-plugin?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-compiler-plugin)

次に、`gradle/libs.versions.toml`に以下を記述します：

```toml
[versions]
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }

[plugins]
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

### ステップ 2: 設定の構成

`settings.gradle.kts`にて：

```kotlin
pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}
```

### ステップ 3: プラグインの適用

モジュールの `build.gradle.kts`にて：

```kotlin
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(libs.koin.core)
    implementation(libs.koin.annotations)  // アノテーションサポートを利用する場合
}
```

## 完全な例

### gradle/libs.versions.toml

```toml
[versions]
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }

[plugins]
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

### settings.gradle.kts

```kotlin
pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}
```

### build.gradle.kts

```kotlin
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(libs.koin.core)
    implementation(libs.koin.annotations)
}
```

## コンパイラプラグインの使用

### DSLスタイル

コンパイラプラグインのパッケージからインポートします：

```kotlin
import org.koin.plugin.module.dsl.*
import org.koin.dsl.module

val appModule = module {
    single<Database>()
    single<ApiClient>()
    single<UserRepository>()
    viewModel<UserViewModel>()
}
```

:::info
コンパイラプラグインのDSLは、パッケージ **`org.koin.plugin.module.dsl`** にあります。従来のDSLは `org.koin.dsl` に残っています。
:::

### アノテーションスタイル

クラスにアノテーションを使用します：

```kotlin
@Singleton
class Database

@Singleton
class ApiClient

@Singleton
class UserRepository(
    private val database: Database,
    private val apiClient: ApiClient
)

@KoinViewModel
class UserViewModel(private val repository: UserRepository) : ViewModel()

@Module
@ComponentScan("com.myapp")
class AppModule
```

### アノテーションによるKoinの開始

コンパイラプラグインを使用すると、型指定されたAPIを使用してKoinを開始できます。**コード生成は不要です**：

```kotlin
@KoinApplication
@ComponentScan("com.myapp")
class MyApp

// 型指定されたAPIでKoinを開始
startKoin<MyApp>()

// または追加の設定を行う場合
startKoin<MyApp> {
    androidContext(this@MyApplication)
    printLogger()
}
```

**利用可能な型指定API:**

| API | 説明 |
|-----|-------------|
| `startKoin<T>()` | アプリケーションTを使用してKoinをグローバルに開始する |
| `startKoin<T> { }` | アプリケーションTと設定ブロックを使用してKoinを開始する |
| `koinApplication<T>()` | Tを使用してアイソレートされたKoinApplicationを作成する |
| `koinConfiguration<T>()` | TからKoinConfigurationを作成する（ComposeのKoinApplicationやKtorなどで使用） |

ここで `T` は `@KoinApplication` アノテーションが付与されたクラスです。

## 設定オプション

`build.gradle.kts` でコンパイラプラグインの設定を行えます：

```kotlin
koinCompiler {
    userLogs = true
    debugLogs = false
    dslSafetyChecks = true
}
```

### 利用可能なオプション

| オプション | 説明 | デフォルト値 |
|--------|-------------|---------|
| `userLogs` | コンポーネント検出およびDSL/アノテーション処理のログを有効にする | `false` |
| `debugLogs` | 内部プラグイン処理の詳細なデバッグログを有効にする | `false` |
| `dslSafetyChecks` | ラムダ内の `create()` 呼び出しが唯一の命令であることを検証する | `true` |

:::tip
開発中は `userLogs = true` に設定して、どのコンポーネントがプラグインによって検出・処理されているかを確認することをお勧めします。
:::

## コンパイル時の安全性（近日公開）

Koinコンパイラプラグインは、**コンパイル時の依存関係検証**を提供する予定です。これにより、実行時に失敗するのではなく、ビルド時にすべての依存関係が解決可能であることを検証できるようになります。

:::note 開発中
DSLとアノテーションの両方に対するコンパイル時の安全性は現在開発中です。これは、KSPベースの `KOIN_CONFIG_CHECK` オプションをネイティブのKotlinコンパイラ統合に置き換えるものになります。
:::

## マルチモジュールプロジェクト

複数のGradleモジュールを持つプロジェクトの場合：

### ライブラリモジュール

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
// feature/src/main/kotlin/FeatureModule.kt
@Module
@ComponentScan("com.myapp.feature")
class FeatureModule
```

### アプリモジュール

```kotlin
// app/build.gradle.kts
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(project(":feature"))
    implementation(libs.koin.core)
    implementation(libs.koin.annotations)
}
```

```kotlin
// app/src/main/kotlin/MyModule.kt
@Module
@Configuration
class MyModule

// app/src/main/kotlin/MyApp.kt
@KoinApplication
class MyApp

class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin<MyApp>()
    }
}
```

メインのアプリケーションクラスに `@KoinApplication` を使用し、型指定されたスタートアップAPIを使用してください。

## Kotlin Multiplatform

コンパイラプラグインはKMPプロジェクトでも動作します：

```kotlin
// shared/build.gradle.kts
plugins {
    id("org.jetbrains.kotlin.multiplatform")
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

## トラブルシューティング

### プラグインが見つからない

プラグインがプラグインリポジトリに含まれていることを確認してください：

```kotlin
// settings.gradle.kts
pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}
```

### Kotlinバージョンの不一致

コンパイラプラグインにはKotlin 2.3.20+が必要です。Kotlinのバージョンを確認してください：

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "2.3.20-Beta1"  // 2.3.20+ が必要
}
```

### インポートエラー

正しいパッケージからインポートしていることを確認してください：

```kotlin
// コンパイラプラグイン DSL
import org.koin.plugin.module.dsl.*

// 従来の DSL
import org.koin.dsl.*
```

## 移行

### 従来のDSLからの移行

1. コンパイラプラグインを追加する
2. インポートを `org.koin.plugin.module.dsl.*` に更新する
3. `single { Class(get() ...) }` または `singleOf(::Class)` を `single<Class>()` に置き換える

[DSLからコンパイラプラグインへの移行](/docs/migration/from-ksp-to-compiler-plugin)を参照してください。

### KSPアノテーションからの移行

1. KSPプラグインと依存関係を削除する
2. Koinコンパイラプラグインを追加する
3. `startKoin { modules(...) }` を `startKoin<MyApp>()` に更新する
4. **アノテーションはそのまま使用できます！**

完全なガイドについては、**[KSPからコンパイラプラグインへの移行](/docs/migration/from-ksp-to-compiler-plugin)**を参照してください。

## 次のステップ

- **[DSLリファレンス](/docs/reference/koin-core/modules)** - DSLの詳細ドキュメント
- **[アノテーションリファレンス](/docs/reference/koin-annotations/modules)** - アノテーションの詳細ドキュメント
- **[Koinの開始](/docs/reference/koin-core/starting-koin)** - アプリケーションの設定