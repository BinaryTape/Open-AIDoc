[//]: # (title: レート制限)

<show-structure for="chapter" depth="4"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="RateLimit"/>
<var name="package_name" value="io.ktor.server.plugins.ratelimit"/>
<var name="artifact_name" value="ktor-server-rate-limit"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.rateLimit"/>
<var name="plugin_api_link" value="https://api.ktor.io/ktor-server-rate-limit/io.ktor.server.plugins.ratelimit/-rate-limit.html"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="rate-limit"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="KtorはKotlin/Nativeをサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">ネイティブサーバー</Links>のサポート</b>: ✅
</p>
</tldr>

<link-summary>
%plugin_name% は、クライアントが一定期間内に行えるリクエスト数を制限します。
</link-summary>

[`%plugin_name%`](%plugin_api_link%) プラグインを使用すると、指定された期間内にクライアントが行える[リクエスト](server-requests.md)の数を制限できます。

Ktorはレート制限を設定するためのいくつかの方法を提供しています。

* アプリケーション全体にグローバルにレート制限を適用するか、特定の[リソース](server-routing.md)に対して個別の制限を設定する。
* [IPアドレス](#client-ip)、[APIキー](#api-key)、または[アクセストークン](#access-token)などの[リクエストキー](#request-key)に基づいてレート制限を適用する。

## 依存関係の追加 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code> を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを追加します。
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktorの依存関係を指定するために<a href="server-dependencies.topic#using-version-catalog">Ktorバージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktorの依存関係を指定するために<a href="server-dependencies.topic#using-version-catalog">Ktorバージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## %plugin_name% のインストール {id="install_plugin"}

<p>
    アプリケーションに <code>%plugin_name%</code> プラグインを<a href="server-plugins.md#install">インストール</a>するには、指定された<Links href="server-modules.md" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links>内の <code>install</code> 関数に渡します。
    以下の例は、<code>%plugin_name%</code> をインストールする方法を示しています。
</p>
<list>
    <li>
        <code>embeddedServer()</code> 関数の呼び出し内。
    </li>
    <li>
        <code>Application</code> クラスに明示的に定義された <code>module()</code> 拡張関数内。
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"/>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"/>
    </TabItem>
</Tabs>

## %plugin_name% の設定 {id="configure"}

### 概要 {id="overview"}

Ktorはレート制限にトークンバケット（_token bucket_）アルゴリズムを使用しており、次のように動作します。
1. 指定された容量でバケットが作成され、利用可能なトークン数が定義されます。
2. 送信されてくる各リクエストは、バケットから1つのトークンを消費します。
   * 十分な容量がある場合、サーバーはリクエストを処理し、レスポンスに以下のヘッダーを含めます。
     * `X-RateLimit-Limit`: バケットの容量。
     * `X-RateLimit-Remaining`: バケット内の残りのトークン数。
     * `X-RateLimit-Reset`: バケットが補充される時期を指定する秒単位のUTCタイムスタンプ。
   * 容量が不足している場合、サーバーは `429 Too Many Requests` レスポンスでリクエストを拒否します。レスポンスには、クライアントが次のリクエストを送信するまでに待機すべき秒数を示す `Retry-After` ヘッダーが含まれます。
3. 指定された補充期間の後、バケットは補充されます。

### レートリミッターの登録 {id="register"}

レート制限をアプリケーション全体にグローバルに適用することも、特定のルートに対してレートリミッターを登録することもできます。

* グローバルにレート制限を適用するには、`global()` 関数を呼び出してレートリミッターを設定します。

   ```kotlin
   install(RateLimit) {
       global {
           rateLimiter(limit = 5, refillPeriod = 60.seconds)
       }
   }
   ```

* 特定のルートに対してレート制限を設定するには、`register()` 関数を使用してレートリミッターを登録します。

   ```kotlin
   install(RateLimit) {
       register {
           rateLimiter(limit = 5, refillPeriod = 60.seconds)
       }
   }
   ```

上記の例は、`%plugin_name%` プラグインに必要な最小限の設定を示しています。
`register()` を使用する場合は、登録したレートリミッターを[特定のルート](#rate-limiting-scope)に適用する必要もあります。

### レート制限の設定 {id="configure-rate-limiting"}

以下のオプションを使用してレートリミッターを設定できます。

#### レートリミッターへの名前付け {id="name-a-rate-limiter"}

`register()` 関数を使用してレートリミッターに名前を割り当てます。その後、名前付きレートリミッターを[特定のルート](#rate-limiting-scope)に適用できます。

```kotlin
    install(RateLimit) {
        register(RateLimitName("protected")) {
            // ...
        }
    }
```

#### 制限数と補充期間の設定 {id="set-the-limit-and-refill-period"}

`rateLimiter()` 関数を使用して、バケットの容量と補充期間を設定します。

* `limit` は利用可能なトークン数を指定します。
* `refillPeriod` はバケットが補充される頻度を指定します。

以下の例では、1分間に最大30件のリクエストを許可します。

```kotlin
register(RateLimitName("protected")) {
    rateLimiter(limit = 30, refillPeriod = 60.seconds)
}
```

#### キーによるリクエストの識別 {id="request-key"}

`requestKey()` 関数を使用して、各リクエストのキーを返します。異なるキーを持つリクエストは、それぞれ独立したレート制限を持ちます。デフォルトでは、すべてのリクエストが同じバケットを共有します。

> リクエストキーには、適切な `equals` および `hashCode` の実装があることを確認してください。
> 
{style="note"}

##### クエリパラメーター {id="query-parameter"}

以下の例では、ユーザーを識別するために `login` [クエリパラメーター](server-requests.md#query_parameters)を使用しています。

```kotlin
register(RateLimitName("protected")) {
    requestKey { applicationCall ->
        applicationCall.request.queryParameters["login"]!!
    }
}
```

##### クライアントIPアドレス {id="client-ip"}

クライアントのIPアドレスごとに個別のレート制限を適用するには、[`call.request.origin.remoteHost`](https://api.ktor.io/ktor-http/io.ktor.http/-request-connection-point/remote-host.html) をリクエストキーとして使用します。

```kotlin
register(RateLimitName("per-ip")) {
    rateLimiter(limit = 5, refillPeriod = 60.seconds)
    requestKey { call ->
        call.request.origin.remoteHost
    }
}
```

アプリケーションがプロキシやロードバランサーの背後で動作している場合は、`origin.remoteHost` がプロキシではなく元のクライアントアドレスを表すように [Forwarded headers](server-forward-headers.md) プラグインを設定してください。

##### APIキーヘッダー {id="api-key"}

ヘッダーで送信されたAPIキーによってリクエストをレート制限するには、`requestKey()` からそのヘッダー値を返します。

```kotlin
register(RateLimitName("per-api-key")) {
    rateLimiter(limit = 5, refillPeriod = 60.seconds)
    requestKey { call ->
        call.request.headers["X-Api-Key"] ?: "anonymous"
    }
}
```

このアプローチを [APIキー認証](server-api-key-auth.md)と組み合わせて、生のヘッダー値の代わりに認証されたプリンシパルをリクエストキーとして使用することもできます。

##### アクセストークンまたはBearerトークン {id="access-token"}

各Bearerトークンに個別のレート制限を適用するには、`Authorization` ヘッダーから生のトークンを取り出してリクエストキーとして返します。

```kotlin
requestKey { call ->
    call.request.authorization()?.removePrefix("Bearer ") ?: "anonymous"
}
```

リクエストが認証されている場合は、認証されたアイデンティティごとに個別のレート制限を適用するために、リクエストキーとして[認証プリンシパル](#rate-limit-authenticated-users)を使用することをお勧めします。

#### 認証済みユーザーのレート制限 {id="rate-limit-authenticated-users"}

認証プリンシパルをリクエストキーとして使用し、認証済みユーザーごとにレート制限を適用できます。

`authenticate()` の内部に `rateLimit()` をネストし、`requestKey()` からプリンシパルにアクセスします。

```kotlin
install(Authentication) {
    basic("auth") { validate { UserIdPrincipal(it.name) } }
}
install(RateLimit) {
    register(RateLimitName("per-user")) {
        rateLimiter(limit = 10, refillPeriod = 60.seconds)
        requestKey { call.principal<UserIdPrincipal>()?.name ?: "anonymous" }
    }
}

routing {
    authenticate("auth") {
        rateLimit(RateLimitName("per-user")) {
            get("/api") { call.respondText("OK") }
        }
    }
}
```

#### リクエストの重みの設定 {id="set-the-request-weight"}

`requestWeight()` 関数を使用して、各リクエストが消費するトークン数を指定します。この関数は、アプリケーションコールとリクエストキーを受け取ります。

以下の例では、`jetbrains` キーを持つリクエストは1つのトークンを消費し、その他のすべてのリクエストは2つのトークンを消費します。

```kotlin
register(RateLimitName("protected")) {
    requestKey { applicationCall ->
        applicationCall.request.queryParameters["login"]!!
    }
    requestWeight { applicationCall, key ->
        when (key) {
            "jetbrains" -> 1
            else -> 2
        }
    }
}
```

#### レスポンスのカスタマイズ {id="customize-the-response"}

レート制限が適用されたときのレスポンスをカスタマイズするには、`modifyResponse()` 関数を使用します。

たとえば、カスタムのレート制限ヘッダーを追加できます。

```kotlin
register(RateLimitName("protected")) {
    modifyResponse { applicationCall, state ->
        applicationCall.response.header("X-RateLimit-Custom-Header", "Some value")
    }
}
```

### レート制限スコープの定義 {id="rate-limiting-scope"}

レートリミッターを設定した後、`rateLimit()` 関数を使用して特定のルートに適用できます。

#### デフォルトのレートリミッターの適用 {id="apply-the-default-rate-limiter"}

デフォルトで登録されたレートリミッターを適用するには、名前を指定せずに `rateLimit()` 関数を使用します。

```kotlin
routing {
    rateLimit {
        get("/") {
            val requestsLeft = call.response.headers["X-RateLimit-Remaining"]
            call.respondText("Welcome to the home page! $requestsLeft requests left.")
        }
    }
}
```

#### 名前付きレートリミッターの適用 {id="apply-a-named-rate-limiter"}

[名前付きレートリミッター](#configure-rate-limiting)を適用するには、`rateLimit()` 関数に `RateLimitName` を渡します。

```kotlin
routing {
    rateLimit(RateLimitName("protected")) {
        get("/protected-api") {
            val requestsLeft = call.response.headers["X-RateLimit-Remaining"]
            val login = call.request.queryParameters["login"]
            call.respondText("Welcome to protected API, $login! $requestsLeft requests left.")
        }
    }
}
```

## 例 {id="example"}

以下の例は、異なるルートに異なるレートリミッターを適用する方法を示しています。
ここでは以下を設定しています。

* ホームページ用のデフォルトのレートリミッター。
* パブリックAPI用の「public」という名前のレートリミッター。
* リクエストキーと重みを使用する「protected」という名前のレートリミッター。
* クライアントIPおよび `X-Api-Key` ヘッダーによってキー設定された名前付きレートリミッター。
* `429 Too Many Requests` レスポンスで拒否されたリクエストのレスポンスをカスタマイズするための [`StatusPages`](server-status-pages.md) プラグイン。

```kotlin
package com.example

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.*
import io.ktor.server.plugins.ratelimit.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlin.time.Duration.Companion.seconds

fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)

fun Application.module() {
    install(RateLimit) {
        register {
            rateLimiter(limit = 5, refillPeriod = 60.seconds)
        }
        register(RateLimitName("public")) {
            rateLimiter(limit = 10, refillPeriod = 60.seconds)
        }
        register(RateLimitName("protected")) {
            rateLimiter(limit = 30, refillPeriod = 60.seconds)
            requestKey { applicationCall ->
                applicationCall.request.queryParameters["login"]!!
            }
            requestWeight { applicationCall, key ->
                when (key) {
                    "jetbrains" -> 1
                    else -> 2
                }
            }
        }
        register(RateLimitName("per-ip")) {
            rateLimiter(limit = 5, refillPeriod = 60.seconds)
            requestKey { call ->
                call.request.origin.remoteHost
            }
        }
        register(RateLimitName("per-api-key")) {
            rateLimiter(limit = 5, refillPeriod = 60.seconds)
            requestKey { call ->
                call.request.headers["X-Api-Key"] ?: "anonymous"
            }
        }
    }
    install(StatusPages) {
        status(HttpStatusCode.TooManyRequests) { call, status ->
            val retryAfter = call.response.headers["Retry-After"]
            call.respondText(text = "429: Too many requests. Wait for $retryAfter seconds.", status = status)
        }
    }
    routing {
        rateLimit {
            get("/") {
                val requestsLeft = call.response.headers["X-RateLimit-Remaining"]
                call.respondText("Welcome to the home page! $requestsLeft requests left.")
            }
        }
        rateLimit(RateLimitName("public")) {
            get("/public-api") {
                val requestsLeft = call.response.headers["X-RateLimit-Remaining"]
                call.respondText("Welcome to public API! $requestsLeft requests left.")
            }
        }
        rateLimit(RateLimitName("protected")) {
            get("/protected-api") {
                val requestsLeft = call.response.headers["X-RateLimit-Remaining"]
                val login = call.request.queryParameters["login"]
                call.respondText("Welcome to protected API, $login! $requestsLeft requests left.")
            }
        }
        rateLimit(RateLimitName("per-ip")) {
            get("/ip-api") {
                val requestsLeft = call.response.headers["X-RateLimit-Remaining"]
                val clientHost = call.request.origin.remoteHost
                call.respondText("Welcome to IP API, $clientHost! $requestsLeft requests left.")
            }
        }
        rateLimit(RateLimitName("per-api-key")) {
            get("/keyed-api") {
                val requestsLeft = call.response.headers["X-RateLimit-Remaining"]
                val apiKey = call.request.headers["X-Api-Key"] ?: "anonymous"
                call.respondText("Welcome to keyed API, $apiKey! $requestsLeft requests left.")
            }
        }
    }
}

```

> 完全な例については、[rate-limit](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/rate-limit) を参照してください。
>
{style="tip"}