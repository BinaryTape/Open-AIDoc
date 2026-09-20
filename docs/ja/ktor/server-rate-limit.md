[//]: # (title: レート制限)

<show-structure for="chapter" depth="3"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="RateLimit"/>
<var name="package_name" value="io.ktor.server.plugins.ratelimit"/>
<var name="artifact_name" value="ktor-server-rate-limit"/>
<var name="plugin_api_link" value="https://api.ktor.io/ktor-server-rate-limit/io.ktor.server.plugins.ratelimit/-rate-limit.html"/>

<tldr>
<p>
<b>必須依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="rate-limit"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Nativeサーバー</Links>のサポート</b>: ✅
</p>
</tldr>

<link-summary>
%plugin_name%は、受信リクエストのボディを検証する機能を提供します。
</link-summary>

[`%plugin_name%`](%plugin_api_link%)プラグインを使用すると、クライアントが特定の期間内に行うことができる[リクエスト](server-requests.md)の数を制限できます。

Ktorは、レート制限を構成するためのさまざまな方法を提供しています。

* アプリケーション全体に対してグローバルにレート制限を適用したり、特定の[リソース](server-routing.md)ごとに異なる制限を構成したりできます。
* IPアドレス、APIキー、アクセストークンなどのリクエストパラメータに基づいてレート制限を適用できます。

## 依存関係の追加 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code>を使用するには、ビルドスクリプトに<code>%artifact_name%</code>アーティファクトを追加します。
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## %plugin_name%のインストール {id="install_plugin"}

<p>
    <code>%plugin_name%</code>プラグインをアプリケーションに<a href="#install">インストール</a>するには、指定された<Links href="/ktor/server-modules" summary="Modules allow you to structure your application by grouping routes.">モジュール</a>内の<code>install</code>関数に渡します。
    以下の例は、<code>%plugin_name%</code>をインストールする方法を示しています。
</p>
<list>
    <li>
        <code>embeddedServer()</code>関数の呼び出し内。
    </li>
    <li>
        <code>Application</code>クラスの明示的に定義された<code>module()</code>拡張関数内。
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

## %plugin_name%の構成 {id="configure"}

### 概要 {id="overview"}

Ktorはレート制限にトークンバケット（_token bucket_）アルゴリズムを使用しており、以下のように動作します。
1. 利用可能なトークンの数を定義する、指定されたキャパシティ（容量）を持つバケットが作成されます。
2. 各受信リクエストはバケットから1つのトークンを消費します。
   * 十分なキャパシティがある場合、サーバーはリクエストを処理し、レスポンスに以下のヘッダーを含めます。
     * `X-RateLimit-Limit`: バケットのキャパシティ。
     * `X-RateLimit-Remaining`: バケットに残っているトークンの数。
     * `X-RateLimit-Reset`: バケットが補充される時間を指定するUTCタイムスタンプ（秒単位）。
   * キャパシティが不足している場合、サーバーは `429 Too Many Requests` レスポンスを使用してリクエストを拒否します。レスポンスには、クライアントが次のリクエストを送信するまでに待機すべき秒数を示す `Retry-After` ヘッダーが含まれます。
3. 指定された補充期間が経過すると、バケットが補充されます。

### レートリミッターの登録 {id="register"}

アプリケーション全体にグローバルにレート制限を適用することも、特定のルート向けにレートリミッターを登録することもできます。

* グローバルにレート制限を適用するには、`global()`関数を呼び出してレートリミッターを構成します。

   ```kotlin
   install(RateLimit) {
       global {
           rateLimiter(limit = 5, refillPeriod = 60.seconds)
       }
   }
   ```

* 特定のルート向けにレート制限を構成するには、`register()`関数を使用してレートリミッターを登録します。

   ```kotlin
   install(RateLimit) {
       register {
           rateLimiter(limit = 5, refillPeriod = 60.seconds)
       }
   }
   ```

上記の例は、`%plugin_name%`プラグインに必要な最小限の構成を示しています。
`register()`を使用する場合、登録されたレートリミッターを[特定のルート](#rate-limiting-scope)に適用する必要もあります。

### レート制限の構成 {id="configure-rate-limiting"}

以下のオプションを使用してレートリミッターを構成できます。

#### レートリミッターへの名前付け {id="name-a-rate-limiter"}

`register()`関数を使用してレートリミッターに名前を割り当てることができます。これにより、名前付きのレートリミッターを[特定のルート](#rate-limiting-scope)に適用できるようになります。

```kotlin
    install(RateLimit) {
        register(RateLimitName("protected")) {
            // ...
        }
    }
```

#### リミットと補充期間の設定 {id="set-the-limit-and-refill-period"}

`rateLimiter()`関数を使用して、バケットのキャパシティと補充期間を構成します。

* `limit`は利用可能なトークンの数を指定します。
* `refillPeriod`はバケットが補充される頻度を指定します。

以下の例では、1分あたり最大30件のリクエストを許可します。

```kotlin
register(RateLimitName("protected")) {
    rateLimiter(limit = 30, refillPeriod = 60.seconds)
}
```

#### キーによるリクエストの区別 {id="distinguish-requests-by-key"}

`requestKey()`関数を使用して、各リクエストに対するキーを返すことができます。異なるキーを持つリクエストには、個別の独立したレート制限が適用されます。

以下の例では、ユーザーを区別するために`login` [クエリパラメータ](server-requests.md#query_parameters)を使用しています。

```kotlin
register(RateLimitName("protected")) {
    requestKey { applicationCall ->
        applicationCall.request.queryParameters["login"]!!
    }
}
```

> リクエストキーには適切な `equals` および `hashCode` の実装が必要であることに注意してください。
> 
{style="tip"}

#### 認証済みユーザーのレート制限 {id="rate-limit-authenticated-users"}

認証プリンシパル（Principal）をリクエストキーとして使用することで、認証済みユーザーごとにレート制限を適用できます。

`rateLimit()`を`authenticate()`の内部にネストし、`requestKey()`からプリンシパルにアクセスします。

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

`requestWeight()`関数を使用して、各リクエストが消費するトークンの数を指定します。この関数は、アプリケーションコールとリクエストキーを受け取ります。

以下の例では、`jetbrains`キーを持つリクエストは1トークンを消費し、その他のすべてのリクエストは2トークンを消費します。

```kotlin
register(RateLimitName("protected")) {
    requestKey { applicationCall ->
        applicationCall.request.queryParameters["login"]!!
    }
    requestWeight { applicationCall, key ->
        when(key) {
            "jetbrains" -> 1
            else -> 2
        }
    }
}
```

#### レスポンスのカスタマイズ {id="customize-the-response"}

レート制限が適用された際のレスポンスをカスタマイズするには、`modifyResponse()`関数を使用します。

例えば、カスタムのレート制限ヘッダーを追加できます。

```kotlin
register(RateLimitName("protected")) {
    modifyResponse { applicationCall, state ->
        applicationCall.response.header("X-RateLimit-Custom-Header", "Some value")
    }
}
```

### レート制限の適用範囲の定義 {id="rate-limiting-scope"}

レートリミッターを構成した後、`rateLimit()`関数を使用してそれを特定のルートに適用できます。

#### デフォルトのレートリミッターの適用 {id="apply-the-default-rate-limiter"}

名前を指定せずに`rateLimit()`関数を使用すると、デフォルトで登録されたレートリミッターが適用されます。

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

`rateLimit()`関数に`RateLimitName`を渡すことで、[名前付きレートリミッター](#configure-rate-limiting)を適用できます。

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
この例では以下を構成しています。

* ホームページ用のデフォルトレートリミッター。
* パブリックAPI用の名前付きパブリックレートリミッター。
* リクエストキーと重みを使用する、名前付き保護レートリミッター。
* `429 Too Many Requests`レスポンスで拒否されたリクエストのレスポンスをカスタマイズするための[`StatusPages`](server-status-pages.md)プラグイン。

```kotlin
package com.example

import io.ktor.http.*
import io.ktor.server.application.*
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
                when(key) {
                    "jetbrains" -> 1
                    else -> 2
                }
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
    }
}

```

> 完全な例については、[rate-limit](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/rate-limit)を参照してください。
>
{style="tip"}