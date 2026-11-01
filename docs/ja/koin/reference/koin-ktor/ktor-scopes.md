---
title: リクエストスコープ
---

# リクエストスコープ

本ページでは、Koin Ktor プラグインのリクエストスコープについて解説します。これは、HTTP 呼び出しごとに作成（オープン）され、レスポンスが送信されると破棄（クローズ）される Koin スコープです。リクエストロガーや現在のユーザーなど、リクエストごとの状態を保持するオブジェクトに使用します。スコープの一般的な仕組みについては [Scopes](/docs/reference/koin-core/scopes) で説明されています。[Koin for Ktor](/docs/reference/koin-ktor/ktor) の説明に従ってプラグインがインストールされている必要があります。

## リクエストスコープ定義の宣言 {id="declaring-request-scoped-definitions"}

**Compiler Plugin DSL**
```kotlin
import org.koin.module.requestScope

val appModule = module {
    single<UserRepository>() // すべてのリクエストで共有

    requestScope {
        scoped<RequestLogger>()
        scoped<UserSessionHandler>()
    }
}
```

**Annotations**
```kotlin
import org.koin.ktor.plugin.RequestScope

@Scope(RequestScope::class)
class RequestLogger(private val call: ApplicationCall)

@Scope(RequestScope::class)
class UserSessionHandler(private val call: ApplicationCall)
```

`requestScope { }` は `RequestScope` 型によって修飾されたスコープであるため、`@Scope(RequestScope::class)` も同じスコープを対象とします。

**Constructor / Classic DSL**
```kotlin
import org.koin.module.requestScope

val appModule = module {
    singleOf(::UserRepository) // すべてのリクエストで共有

    requestScope {
        scopedOf(::RequestLogger)
        scopedOf(::UserSessionHandler)
    }
}
```

## ハンドラー内での解決 {id="resolving-in-a-handler"}

`call.scope` は現在の呼び出しのリクエストスコープです：

```kotlin
routing {
    get("/users/{id}") {
        val logger = call.scope.get<RequestLogger>()
        val userService = call.get<UserService>()

        logger.log("Fetching user")
        call.respond(userService.getUser(call.parameters["id"]!!))
    }
}
```

1 回の呼び出し内では、すべての `call.scope.get<RequestLogger>()` が同じインスタンスを返します。次の呼び出しでは新しいインスタンスが取得されます。リクエストスコープはルートスコープへフォールバックするため、リクエストスコープの定義はシングルトンに依存できます。

`Koin` も `KoinIsolated` もインストールされていない場合など、呼び出しにスコープが存在しない場合、`call.scope` は "Koin Request Scope is not ready" をスローします。

## ApplicationCall の注入 {id="injecting-the-applicationcall"}

呼び出し（call）はそのリクエストスコープのソース（生成元）であるため、リクエストスコープのクラスは宣言なしで `ApplicationCall` をコンストラクタパラメータとして受け取ることができます：

```kotlin
class RequestLogger(private val call: ApplicationCall) {
    fun log(message: String) {
        println("[${call.request.httpMethod.value} ${call.request.path()}] $message")
    }
}

class UserSessionHandler(private val call: ApplicationCall) {
    fun userId(): String? = call.request.headers["X-User-ID"]
}
```

スコープソースについては [Scopes](/docs/reference/koin-core/scopes) で説明されています。`ApplicationCall` はリクエストスコープ内でのみ利用可能であり、`single` で受け取ることはできません。

## ライフサイクル {id="lifecycle"}

| ステップ | タイミング |
|------|------|
| スコープの作成 | Ktor の `CallSetup`（ルーティング前） |
| スコープ ID | `request_` に続く一意のカウンター |
| スコープのクローズ | Ktor の `ResponseSent`（レスポンス送信後） |

スコープをクローズすると、そのすべてのインスタンスが破棄されます。クリーンアップコードを実行するには、定義に `onClose` を追加します：

```kotlin
requestScope {
    scoped { RequestMetrics() } onClose { metrics ->
        metrics?.recordDuration()
    }
}
```

`onClose` はインスタンスを null 許容値として受け取ります。`onCreate` コールバックは存在しません。初期化処理はコンストラクタまたは定義ラムダ内で行ってください。コールバックの詳細については [Definitions](/docs/reference/koin-core/definitions) を参照してください。

## 注意点 {id="pitfalls"}

- **シングルトン内のリクエストオブジェクト**: リクエストスコープのクラスを `single` に注入しないでください。シングルトンは一度だけ作成されるため、最初のリクエストのインスタンスを保持し続けてしまいます。ハンドラー内で `call.scope` からリクエストスコープのオブジェクトを解決するか、引数として渡してください。
- **バックグラウンド処理**: ハンドラーから起動され、呼び出しの寿命を超えて存続するコルーチンは、レスポンスが送信された後に `call.scope` を使用してはなりません。その時点ですでにスコープはクローズされています。

## 関連情報 {id="related"}

- [Scopes](/docs/reference/koin-core/scopes): スコープの概念、スコープソース、リンク。
- [Koin for Ktor](/docs/reference/koin-ktor/ktor): プラグインのインストールとルートでの注入。
- [Definitions](/docs/reference/koin-core/definitions): `onClose` およびその他の定義オプション。
- [Ktor Testing](/docs/reference/koin-ktor/ktor-testing): リクエストスコープを使用するルートのテスト。