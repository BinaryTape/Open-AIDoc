---
title: Koinの開始
---

# Koinの開始

このページでは、Koinコンテナの起動方法、起動時に渡せるオプション、`@KoinApplication` を使用した型付き起動、ロギング、プロパティ、および後からモジュールをロード/アンロードする方法について説明します。モジュールとは何かを理解していることを前提としています（[Modules](/docs/reference/koin-core/modules) を参照）。

コードサンプルには、Compiler Plugin DSL、Annotations、Constructor / Classic DSL の3つのタブがあります。使用するものを選んでください。その選択はすべてのページに適用されます。

## Koinの起動 {id="start-koin"}

**Compiler Plugin DSL**
```kotlin
import org.koin.core.context.startKoin

fun main() {
    startKoin {
        printLogger()
        modules(appModule)
    }
}
```

**Annotations**
```kotlin
import org.koin.plugin.module.dsl.startKoin

@KoinApplication(modules = [AppModule::class])
class MyApp

fun main() {
    startKoin<MyApp> {
        printLogger()
    }
}
```

Koin Compiler Pluginは、`startKoin<MyApp>()` を、`@KoinApplication` に記載されたモジュールおよび自動検出された `@Configuration` モジュールをロードする `startKoin { }` の呼び出しに置き換えます。[@KoinApplicationによる型付き起動](#typed-startup-with-koinapplication) を参照してください。

**Constructor / Classic DSL**
```kotlin
import org.koin.core.context.startKoin

fun main() {
    startKoin {
        printLogger()
        modules(appModule)
    }
}
```

`startKoin` はコンテナを作成し、プロセスのデフォルトコンテキストである `GlobalContext` に登録します。この処理が完了すると、すべての `get()`、`by inject()`、またはプラットフォームAPI（`by viewModel()`、`koinInject()`）がこのコンテナから解決されるようになります。

`startKoin` はプロセスごとに1回しか呼び出せません。2回目の呼び出しは `KoinApplicationAlreadyStartedException` をスローします。起動後にモジュールを追加するには、[`loadKoinModules`](#load-and-unload-modules-at-runtime) を使用してください。

## 起動オプション {id="start-options"}

`startKoin { }` ブロック内のすべてがコンテナを設定します。

```kotlin
startKoin {
    printLogger(Level.DEBUG)
    properties(mapOf("server_url" to "https://api.example.com"))
    allowOverride(false)
    modules(coreModule, networkModule)
    lazyModules(analyticsModule)
}
```

| オプション | 説明 |
|--------|--------------|
| `modules(...)` | モジュールを即座にロードします。単一のモジュール、複数のモジュール、または `List<Module>` を受け取ります |
| `lazyModules(...)` | バックグラウンドでモジュールをロードします。`koin-core-coroutines` が必要です。[Lazy Modules](/docs/reference/koin-core/lazy-modules) を参照してください |
| `printLogger(level)` | コンソールにログを出力します。[ロギング](#logging) を参照してください |
| `logger(logger)` | 独自の `Logger` 実装を使用します |
| `properties(map)` | マップからプロパティを追加します。[プロパティ](#properties) を参照してください |
| `fileProperties(file)` | クラスパスのファイルからプロパティをロードします。デフォルトは `/koin.properties` です（JVMのみ） |
| `environmentProperties()` | システムプロパティおよび環境変数をロードします（JVMのみ） |
| `allowOverride(false)` | 2つの定義が `.override()` なしで同じ型を宣言した場合に失敗します。[定義のオーバーライド](/docs/reference/koin-core/definitions#overriding-a-definition) を参照してください |
| `strictOverride()` | `allowOverride(false)` と同じです |
| `createEagerInstances()` | `createdAtStart` な定義を直ちに生成します。`startKoin` と `koinApplication` はすでにブロックの最後でこれを行うため、`koinApplication(createEagerInstances = false)` を使用する場合にのみ必要です |

`startKoin` ブロックは呼び出し元のスレッドで実行されます。そこでロードする各モジュールや、各 `createdAtStart` 定義は、起動時間を増加させます。

## @KoinApplicationによる型付き起動 {id="typed-startup-with-koinapplication"}

[Koin Compiler Plugin](/docs/setup/compiler-plugin) を使用すると、`@KoinApplication` アノテーションが付与されたアプリケーションクラスがロードするモジュールを記述します。型付きの呼び出しを使用して、そのクラスからKoinを起動できます。

```kotlin
@Module
@ComponentScan("com.myapp.data")
class DataModule

@Module(includes = [DataModule::class])
class AppModule

@KoinApplication(modules = [AppModule::class])
class MyApp
```

| 呼び出し | 結果 |
|------|--------|
| `startKoin<MyApp>()` | `MyApp` のモジュールを使用して `GlobalContext` 内でKoinを起動します |
| `startKoin<MyApp> { ... }` | 同様ですが、設定ブロック（ロガー、プロパティ、追加のDSLモジュール）を指定できます |
| `koinApplication<MyApp>()` | グローバルに登録されない、独立した `KoinApplication` を作成します |
| `koinConfiguration<MyApp>()` | 自身でKoinを起動するAPI（Composeの `KoinApplication`、Ktorなど）向けに `KoinConfiguration` を作成します |
| `withConfiguration<MyApp>()` | 既存の `KoinApplication`（例: Ktorの `install(Koin) { }` 内）に `MyApp` のモジュールを追加します |

これらの関数は `org.koin.plugin.module.dsl` からインポートされます。これらはコンパイラスタブであり、Compiler Pluginが適用されていない場合、プラグインが見つからないことを示すメッセージとともに実行時に例外をスローします。

`@KoinApplication` は2つのパラメータを受け取ります:

- `modules`: 明示的にロードする `@Module` クラス。
- `configurations`: 自動検出する設定ラベル。[設定ラベル](#configuration-labels) を参照してください。

各 `@Module` クラスは、その `includes` と `@ComponentScan` 定義を持ち込みます。`startKoin<MyApp> { }` の設定ブロックは通常の `startKoin` ブロックであるため、アノテーションベースのモジュールとDSLモジュールを混在させることができます。

```kotlin
startKoin<MyApp> {
    printLogger()
    modules(legacyDslModule)
}
```

### @KoinApplicationなしで@Moduleクラスをロードする {id="loading-module-classes-without-koinapplication"}

通常の `startKoin { }` または `koinApplication { }` ブロックの内部で、`@Module` クラスを直接ロードできます。

```kotlin
import org.koin.plugin.module.dsl.module
import org.koin.plugin.module.dsl.modules

startKoin {
    module<NetworkModule>()
    modules(DataModule::class, CacheModule::class)
}
```

これは、一部のモジュールのみが必要なテストで役立ちます。`module<T>()` と `modules(vararg KClass)` もコンパイラスタブであり、プラグインによってすでに書き換えられる `startKoin<T> { }` の内部では動作しません。

:::note
Compiler Pluginを使用する場合、呼び出すべき `AppModule().module` 拡張関数は存在しません。アノテーション付きモジュールは、`@KoinApplication` と `startKoin<T>()`、または上記のように `module<T>()` を使用してロードしてください。
:::

### 設定ラベル {id="configuration-labels"}

`@Configuration` が付けられた `@Module` は、クラスパス上の他のGradleモジュールからも含め、`@KoinApplication` によって自動的に検出されます（[@Configurationによる自動検出](/docs/reference/koin-core/modules#auto-discovery-with-configuration) を参照）。ラベルを使用すると、これらのモジュールのうちどれをロードするかを選択できます。

```kotlin
@Module
@Configuration
class CoreModule

@Module
@Configuration("prod")
class ProdDatabaseModule

@Module
@Configuration("test")
class TestDatabaseModule

@Module
@Configuration("default", "test")
class LoggingModule
```

```kotlin
@KoinApplication
class MyApp // CoreModuleとLoggingModuleをロード

@KoinApplication(configurations = ["default", "prod"])
class ProdApp // CoreModule、LoggingModule、ProdDatabaseModuleをロード

@KoinApplication(configurations = ["test"])
class TestApp // TestDatabaseModuleとLoggingModuleをロード
```

ルール:

- 値のない `@Configuration` は `"default"` ラベルになります。`@Configuration("default")` も同様です。
- `configurations` を指定しない `@KoinApplication` は、`"default"` ラベルのみをロードします。
- ラベルをリストした場合、それらのラベルのみがロードされます。デフォルトのモジュールもロードしたい場合は、リストに `"default"` を追加してください。
- 1つのモジュールに複数のラベルを設定できます。

## koinApplicationによる独立したインスタンス {id="isolated-instance-with-koinapplication"}

`koinApplication { }` は、`GlobalContext` に登録されないコンテナを作成します。

```kotlin
val koinApp = koinApplication {
    modules(sdkModule)
}

val service = koinApp.koin.get<SdkService>()
```

グローバルAPI（Activity内の `KoinComponent` や `by inject()` など）からは、このコンテナは見えません。ホストアプリのコンテナを共有してはならないライブラリやSDK、または独自のインスタンスが必要なテストに使用してください。完全なパターンは [Context Isolation](/docs/reference/koin-core/context-isolation) に記載されています。

`koinConfiguration { }` は、何も開始せずに設定のみを構築します。Composeの `KoinApplication` やKtorプラグインなど、自身でKoinを起動するAPIに渡して使用します。

## 各プラットフォームでの起動 {id="starting-on-each-platform"}

- Android: `Application.onCreate()` 内で `androidContext()` および `androidLogger()` を使用してKoinを起動します。[Starting Koin on Android](/docs/reference/koin-android/start) を参照してください。
- Compose: コンポーザブル関数から `KoinApplication` または `KoinMultiplatformApplication` を使用してKoinを起動します。[Koin for Compose](/docs/reference/koin-compose/compose) を参照してください。
- Ktor: `Application` モジュールに `Koin` プラグインをインストールします。[Koin for Ktor](/docs/reference/koin-ktor/ktor) を参照してください。
- Kotlin Multiplatform: `commonMain` で `initKoin()` 関数を共有し、各プラットフォームから呼び出します。[KMP Setup](/docs/reference/koin-core/kmp-setup) を参照してください。

## 実行時のモジュールのロードとアンロード {id="load-and-unload-modules-at-runtime"}

起動後、グローバルコンテナ内のモジュールを追加および削除できます。

```kotlin
import org.koin.core.context.loadKoinModules
import org.koin.core.context.unloadKoinModules

if (premiumEnabled) {
    loadKoinModules(premiumModule)
}

// 後で
unloadKoinModules(premiumModule)
```

どちらの関数も、単一のモジュールまたは `List<Module>` を受け取ります。`unloadKoinModules` はモジュールの定義を削除し、そのインスタンスを破棄するため、その後これらの型に対する `get()` を呼び出すと失敗します。

Compiler Pluginは実行時に構築されるグラフを検証できません。モジュールがいつロードされるか、あるいは本当にロードされるかどうかを判断できないためです。実行時にロードされるモジュールから他の定義が必要とする型には `@Provided` をマークする必要があり、プラグインはそのモジュール自体が起動時にロードされていないものとして報告します。[Compile-Time Safety](/docs/reference/koin-compiler/compile-safety) を参照してください。単に起動時間を短縮する目的で後からモジュールをロードする場合は、通常 [Lazy Modules](/docs/reference/koin-core/lazy-modules) を使用する方が適しています。

## Koinの停止 {id="stop-koin"}

```kotlin
import org.koin.core.context.stopKoin

stopKoin()
```

`stopKoin()` はグローバルコンテナをクローズします。すべてのインスタンスを解放し、定義の `onClose` コールバックを呼び出し、`GlobalContext` をクリアします。その後、再び `startKoin` を呼び出すことができます。独立したコンテナの場合は、`KoinApplication` の `close()` を呼び出します。

```kotlin
koinApp.close()
```

テストでは、各テストの後にKoinを停止して、次のテストがクリーンな状態で開始されるようにしてください。[Testing](/docs/reference/koin-test/testing) では、これを自動的に行うJUnitルールを紹介しています。

## ロギング {id="logging"}

Koinはデフォルトでは何もログを出力しません（`EmptyLogger`）。起動ブロックでロギングを有効にします。

```kotlin
startKoin {
    printLogger(Level.DEBUG)
    modules(appModule)
}
```

`Level` には `DEBUG`、`INFO`、`WARNING`、`ERROR`、または `NONE` があります。各ロガーのデフォルトレベルは `INFO` です。

| ロガー | 起動オプション | プラットフォーム | アーティファクト |
|--------|--------------|----------|----------|
| `EmptyLogger` | (デフォルト) | すべて | `koin-core` |
| `PrintLogger` | `printLogger()` | すべて | `koin-core` |
| `AndroidLogger` | `androidLogger()` | Android (Logcat) | `koin-android` |
| `SLF4JLogger` | `slf4jLogger()` | JVM | `koin-logger-slf4j` |

`DEBUG` レベルでは、Koinは各モジュールのロードと各依存解決をその所要時間とともに出力します。これは処理の遅い定義を特定するのに役立ちますが、本番環境には冗長すぎます。

ログを別の場所に出力するには、`Logger` を継承して `logger()` に渡します。

```kotlin
import org.koin.core.logger.Level
import org.koin.core.logger.Logger
import org.koin.core.logger.MESSAGE

class AppLogger : Logger(Level.INFO) {
    override fun display(level: Level, msg: MESSAGE) {
        MyLogSystem.log(level.name, msg)
    }
}

startKoin {
    logger(AppLogger())
}
```

## プロパティ {id="properties"}

プロパティはコンテナ内に保存されるキーと値のペアです。URLやキーなどの設定値に使用します。

### プロパティのロード {id="loading-properties"}

```kotlin
startKoin {
    properties(mapOf("server_url" to "https://api.example.com"))
    fileProperties()          // JVM: クラスパスから /koin.properties を読み込む
    environmentProperties()   // JVM: システムプロパティおよび環境変数
}
```

Androidでは、`androidFileProperties()` が `assets` フォルダから `koin.properties` を読み込みます。実行時に `Koin` インスタンスでプロパティを設定・取得することもできます。

```kotlin
val koin = KoinPlatform.getKoin()
koin.setProperty("session_token", token)
val token: String? = koin.getProperty("session_token")
```

ファイルや環境変数からロードされた値は `String` になります。必要に応じて手動で変換してください（`getProperty<String>("timeout").toInt()`）。

### プロパティのインジェクション {id="injecting-properties"}

**Compiler Plugin DSL**
コンストラクタパラメータに `@Property`（`koin-annotations` 提供）を付与します:

```kotlin
class ApiClient(@Property("server_url") val url: String)

val networkModule = module {
    single<ApiClient>()
}
```

**Annotations**
```kotlin
@Singleton
class ApiClient(@Property("server_url") val url: String)
```

プロパティにデフォルト値を設定するには、同じキーを持つトップレベルの値に `@PropertyValue` を付与します:

```kotlin
@PropertyValue("server_url")
val defaultServerUrl = "https://api.example.com"
```

生成されたコードは `getProperty("server_url", defaultServerUrl)` を読み出すため、プロパティが設定されていない場合は `ApiClient` にデフォルト値が渡されます。

**Constructor / Classic DSL**
```kotlin
val networkModule = module {
    single { ApiClient(url = getProperty("server_url")) }

    // デフォルト値あり
    single { ApiClient(url = getProperty("server_url", "https://api.example.com")) }
}
```

`getProperty(key)` はプロパティが存在しない場合に例外をスローします。代わりに `getPropertyOrNull(key)` を使用すると `null` が返されます。

さまざまな場所で `getProperty` を呼び出すのではなく、1つの設定クラスでプロパティを読み込み、そのクラスをインジェクトするようにしてください。そうすることでキーを1つのファイルに集約できます。

## 制限事項 {id="limits"}

- `startKoin` はプロセスごとに1回のみ実行されます。再起動する前に `stopKoin()` を呼び出してください。
- `fileProperties()` および `environmentProperties()` はJVMでのみ使用可能です。その他のプラットフォームでは、`properties()` でマップを渡してください。
- 型付き起動（`startKoin<T>()`、`module<T>()`）には Compiler Plugin が必要です。KSPプロセッサは非推奨になりました。[Migrating from KSP](/docs/migration/from-ksp-to-compiler-plugin) を参照してください。
- 起動後に `loadKoinModules` でロードされたモジュールは、コンパイル時の依存関係グラフチェックの対象外となります。

## 関連ドキュメント {id="related"}

- [Modules](/docs/reference/koin-core/modules): 定義の整理、`includes()`、`@Module`、および `@Configuration`。
- [Definitions](/docs/reference/koin-core/definitions): Koinが作成するものの宣言、先行作成（eager creation）、オーバーライド。
- [Lazy Modules](/docs/reference/koin-core/lazy-modules): バックグラウンドでモジュールをロードして起動時間を短縮。
- [Context Isolation](/docs/reference/koin-core/context-isolation): SDK向けに独立したコンテナでKoinを実行。
- [Compiler Plugin Setup](/docs/setup/compiler-plugin): `startKoin<T>()` に必要なプラグインのセットアップ。
- [Starting Koin on Android](/docs/reference/koin-android/start): `androidContext()`、`androidLogger()`、および AndroidX Startup。