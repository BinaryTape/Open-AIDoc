---
title: Ktor における Isolated Context
---

# Ktor における Isolated Context

このページでは、グローバルコンテキストに登録することなく1つの Ktor アプリケーションに対して Koin を起動する `KoinIsolated` プラグインについて説明します。これにより、各アプリケーションが独自のコンテナを持つようになります。Isolated Context（分離されたコンテキスト）とは何か、どのような場合に使用するかについては、[Context Isolation](/docs/reference/koin-core/context-isolation) で解説しています。通常の `Koin` プラグインについては、[Koin for Ktor](/docs/reference/koin-ktor/ktor) を参照してください。

## KoinIsolated のインストール {id="installing-koinisolated"}

`Koin` の代わりに `KoinIsolated` をインストールします。設定ブロックは同じです。

**Compiler Plugin DSL**
```kotlin
import org.koin.ktor.plugin.KoinIsolated

fun Application.module() {
    install(KoinIsolated) {
        slf4jLogger()
        modules(appModule)
    }
}
```

**Annotations**
```kotlin
import org.koin.ktor.plugin.KoinIsolated
import org.koin.plugin.module.dsl.withConfiguration

fun Application.module() {
    install(KoinIsolated) {
        slf4jLogger()
        withConfiguration<KoinUserApplication>()
    }
}
```

**Constructor / Classic DSL**
```kotlin
import org.koin.ktor.plugin.KoinIsolated

fun Application.module() {
    install(KoinIsolated) {
        slf4jLogger()
        modules(appModule)
    }
}
```

## Koin との相違点 {id="what-changes-compared-to-koin"}

| | `install(Koin)` | `install(KoinIsolated)` |
|---|---|---|
| グローバルコンテキストへの登録 | あり | なし |
| `Application`、`Route`、`Routing`、`ApplicationCall` での `inject()` / `get()` | 可能 | 可能（そのアプリケーションのインスタンスから） |
| リクエストスコープと `call.scope` | あり | あり |
| ライフサイクルイベント、`ApplicationStopping` 時のクローズ | あり | あり |
| Ktor DI への `bridge { }` | あり | Koin 4.2 では適用不可 |
| `KoinComponent` クラス、`KoinPlatform.getKoin()` | このインスタンスを参照可能 | このインスタンスを参照不可 |

Ktor の拡張機能はアプリケーションの attributes に保存された Koin インスタンスを読み取るため、ルート内でのインジェクションは同様に動作します。

```kotlin
fun Application.module() {
    install(KoinIsolated) {
        modules(appModule)
    }

    val userService by inject<UserService>()
    val koin = getKoin() // このアプリケーションの Koin インスタンス

    routing {
        get("/users/{id}") {
            val logger = call.scope.get<RequestLogger>()
            call.respond(userService.getUser(call.parameters["id"]!!))
        }
    }
}
```

:::warning
Ktor のレシーバー外部にあるコードからは、分離されたインスタンスにアクセスできません。`KoinComponent` を実装したクラスや `KoinPlatform.getKoin()` の呼び出しはグローバルコンテキストを使用するため、「KoinApplication has not been started」というエラーで失敗します。クラスには、分離されたモジュールで宣言されたコンストラクタパラメータを通じて依存関係を渡してください。独自に依存関係を取得する必要がある相互運用のエントリポイントの場合は、[Context Isolation](/docs/reference/koin-core/context-isolation) で示されているように `getKoin()` をオーバーライドしてください。
:::

## 1つの JVM 内での複数サーバーの実行 {id="several-servers-in-one-jvm"}

組み込みサーバーごとに独自のコンテナが割り当てられます。

```kotlin
fun main() {
    val userServer = embeddedServer(Netty, port = 8080) {
        install(KoinIsolated) { modules(userServiceModule) }
        userRouting()
    }

    val orderServer = embeddedServer(Netty, port = 8081) {
        install(KoinIsolated) { modules(orderServiceModule) }
        orderRouting()
    }

    userServer.start(wait = false)
    orderServer.start(wait = true)
}
```

`install(Koin)` の場合、プラグインは起動前に実行中のグローバルインスタンスを停止するため、2番目のサーバーが1番目のサーバーのグローバル Koin を停止させてしまいます。

## テスト {id="tests"}

`KoinIsolated` をインストールする各 `testApplication` は独自のコンテナを持つため、テスト間でグローバルコンテキストを介して状態が共有されることがなく、並列実行が可能です。テストのセットアップについては、[Ktor Testing](/docs/reference/koin-ktor/ktor-testing) で解説しています。

## グローバルコンテキストを維持すべきケース {id="when-to-keep-the-global-context"}

プロセス内で実行される Ktor アプリケーションが1つだけであり、そのプロセスの他のエントリポイント（例えば `main()` から開始されるスケジュールされたジョブなど）が同じコンテナを使用する必要がある場合や、Ktor DI ブリッジが必要な場合は、引き続き `install(Koin)` を使用してください。

## 関連情報 {id="related"}

- [Context Isolation](/docs/reference/koin-core/context-isolation): 分離されたコンテキストの概念とカスタム `KoinComponent`。
- [Koin for Ktor](/docs/reference/koin-ktor/ktor): `Koin` プラグインとルート内でのインジェクション。
- [Ktor Testing](/docs/reference/koin-ktor/ktor-testing): Koin を使用した Ktor アプリケーションのテスト。
- [Ktor DI Bridge](/docs/reference/koin-ktor/ktor-bridge): Ktor DI との依存関係の共有。