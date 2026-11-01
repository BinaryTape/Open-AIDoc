---
title: Ktor 向け Koin
---

# Ktor 向け Koin

このページでは、Ktor サーバーアプリケーションに Koin を追加する方法について説明します。`Koin` プラグインのインストール、ルート内での依存関係のインジェクション、機能（feature）関数からのモジュールのロード、そして Koin ライフサイクルイベントのリスニングなどを扱います。前提知識として、[定義（definitions）](/docs/reference/koin-core/definitions) と [モジュール（modules）](/docs/reference/koin-core/modules) の宣言方法を理解している必要があります。ステップバイステップのプロジェクトについては、[Ktor チュートリアル](/docs/quickstart/ktor) を参照してください。

## セットアップ {id="setup"}

```kotlin
// build.gradle.kts
dependencies {
    implementation(platform(libs.koin.bom))
    implementation(libs.koin.ktor)
    implementation(libs.koin.logger.slf4j) // 任意、SLF4J ロガー
}
```

カタログのエントリとバージョンについては、[Gradle セットアップ](/docs/setup/gradle) に記載されています。`koin-ktor` プラグインは Ktor 3 を対象としています。

## Koin プラグインのインストール {id="installing-the-koin-plugin"}

アプリケーションモジュール内で `Koin` をインストールします。その設定ブロックは `startKoin { }` と同じです。

**Compiler Plugin DSL**
```kotlin
import org.koin.ktor.plugin.Koin
import org.koin.logger.slf4jLogger

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserService>()
}

fun Application.module() {
    install(Koin) {
        slf4jLogger()
        modules(appModule)
    }
}
```

**Annotations**
```kotlin
import org.koin.ktor.plugin.Koin
import org.koin.logger.slf4jLogger
import org.koin.plugin.module.dsl.withConfiguration

@Module
@ComponentScan("com.example")
@Configuration
class AppModule

@KoinApplication
object KoinUserApplication

fun Application.module() {
    install(Koin) {
        slf4jLogger()
        withConfiguration<KoinUserApplication>()
    }
}
```

`withConfiguration<T>()` は、`@KoinApplication` クラスによって組み立てられたモジュールをロードします。

**Constructor / Classic DSL**
```kotlin
import org.koin.ktor.plugin.Koin
import org.koin.logger.slf4jLogger

val appModule = module {
    singleOf(::UserRepositoryImpl) bind UserRepository::class
    singleOf(::UserService)
}

fun Application.module() {
    install(Koin) {
        slf4jLogger()
        modules(appModule)
    }
}
```

プラグインの動作：

- **グローバル開始**: `startKoin` と同様に、グローバルコンテキストで Koin を開始します。グローバルな Koin インスタンスがすでに実行されている場合（例えば Ktor の自動リロード後など）、プラグインはまずそれを停止します。Koin をグローバルコンテキストに含めたくない場合は、[`KoinIsolated`](/docs/reference/koin-ktor/ktor-isolated) を使用してください。
- **即時生成インスタンス（Eager instances）**: `createdAtStart` とマークされた定義は、インストール時に作成されます。
- **リクエストスコープ**: 各呼び出し（call）に対して Koin スコープを開きます。[Request Scopes](/docs/reference/koin-ktor/ktor-scopes) を参照してください。
- **シャットダウン**: Ktor が `ApplicationStopping` を発生させると、プラグインは Koin インスタンスを閉じます。

設定ブロックのロギング、プロパティ、その他のオプションについては、[Koin の開始](/docs/reference/koin-core/starting-koin) で説明されています。

## 依存関係のインジェクト {id="injecting-dependencies"}

`inject()`（遅延）と `get()`（即時）は、`Application`、`Route`、`Routing`、および `ApplicationCall` に対する `org.koin.ktor.ext` の拡張関数です。

```kotlin
import org.koin.ktor.ext.inject

fun Application.module() {
    install(Koin) { modules(appModule) }

    val userService by inject<UserService>()

    routing {
        get("/users") {
            call.respond(userService.getAllUsers())
        }
    }
}
```

ルートの拡張関数内での例：

```kotlin
fun Route.customerRoutes() {
    val customerService by inject<CustomerService>()

    get("/customers/{id}") {
        val id = call.parameters["id"] ?: return@get call.respond(HttpStatusCode.BadRequest)
        call.respond(customerService.getCustomer(id))
    }
}
```

ハンドラー内では、call から解決します：

```kotlin
get("/users/{id}") {
    val userService = call.get<UserService>()
    call.respond(userService.getUser(call.parameters["id"]!!))
}
```

これら4つのレシーバーはすべて、`Application` に保存されている Koin インスタンスから解決します（`Koin` を使用している場合はグローバルなインスタンス、`KoinIsolated` を使用している場合は隔離されたインスタンス）。コア関数と同様に、`qualifier` と `parameters` を受け取ることができます（[Injection](/docs/reference/koin-core/injection) を参照）。`getProperty(key)` と `getProperty(key, defaultValue)` は、同じレシーバーから Koin プロパティを読み取ります。

## 機能関数からのモジュールのロード {id="loading-modules-from-feature-functions"}

プラグインがインストールされると、機能（feature）関数から独自の定義を追加できるようになります。

```kotlin
import org.koin.ktor.plugin.koinModule
import org.koin.ktor.plugin.koinModules

fun Application.customerFeature() {
    koinModule {
        singleOf(::CustomerRepository)
        singleOf(::CustomerService)
    }

    routing { customerRoutes() }
}

fun Application.orderFeature() {
    koinModules(orderDataModule, orderServiceModule)

    routing { orderRoutes() }
}

fun Application.module() {
    install(Koin) {
        slf4jLogger()
        modules(coreModule)
    }
    customerFeature()
    orderFeature()
}
```

`koinModule { }` はインラインでモジュールを宣言し、`koinModules(...)` は既存の `Module` 値をロードします。事前に `install(Koin)` が呼び出されていない場合、どちらも "Koin plugin is not installed properly" で失敗します。

## ライフサイクルイベント {id="lifecycle-events"}

このプラグインは、アプリケーションモニター上で3つのイベントを発生させます。

| イベント | 発生タイミング |
|-------|--------|
| `KoinApplicationStarted` | プラグインがインストールされ、Koin が開始されたとき |
| `KoinApplicationStopPreparing` | `ApplicationStopping` 時、Koin が閉じられる前 |
| `KoinApplicationStopped` | Koin が閉じられた後 |

```kotlin
fun Application.module() {
    monitor.subscribe(KoinApplicationStarted) { koinApp ->
        log.info("Koin started")
    }
    monitor.subscribe(KoinApplicationStopped) {
        log.info("Koin stopped")
    }

    install(Koin) {
        slf4jLogger()
        modules(appModule)
    }
}
```

`KoinApplicationStarted` は `install(Koin)` の実行中に発生します。プラグインをインストールする前にサブスクライブ（購読）してください。そうしないとハンドラーは実行されません。各ハンドラーは `KoinApplication` を受け取ります。

## Ktor 独自の DI {id="ktor-s-own-di"}

Ktor 3.4 には組み込みの依存関係注入プラグインがあります。Koin はこれと双方向で依存関係を共有できます。[Ktor DI Bridge](/docs/reference/koin-ktor/ktor-bridge) を参照してください。

## 関連情報 {id="related"}

- [Request Scopes](/docs/reference/koin-ktor/ktor-scopes): 1回の HTTP 呼び出しの間生存するインスタンス。
- [Ktor DI Bridge](/docs/reference/koin-ktor/ktor-bridge): Koin と Ktor DI の間での解決。
- [Ktor における隔離されたコンテキスト](/docs/reference/koin-ktor/ktor-isolated): グローバルコンテキストを使用しない Koin。
- [Ktor のテスト](/docs/reference/koin-ktor/ktor-testing): Koin を使用したルートのテスト。
- [Ktor チュートリアル](/docs/quickstart/ktor) および [アノテーションを使用した Ktor チュートリアル](/docs/quickstart/ktor-annotations): Koin を使用した Ktor アプリケーションのステップバイステップ構築。