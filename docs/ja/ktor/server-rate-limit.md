[//]: # (title: レート制限)

<show-structure for="chapter" depth="2"/>
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

[%plugin_name%](%plugin_api_link%)プラグインを使用すると、クライアントが特定の期間内に行うことができる[リクエスト](server-requests.md)の数を制限できます。
Ktorは、レート制限を構成するためのさまざまな手段を提供しています。例えば：
- アプリケーション全体に対してグローバルにレート制限を有効にしたり、異なる[リソース](server-routing.md)ごとに異なるレート制限を構成したりできます。
- IPアドレス、APIキー、アクセストークンなどの特定の要求パラメータに基づいてレート制限を構成できます。

## 依存関係の追加 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code>を使用するには、ビルドスクリプトに<code>%artifact_name%</code>アーティファクトを含める必要があります。
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

## %plugin_name%のインストール {id="install_plugin"}

<p>
    <code>%plugin_name%</code>プラグインをアプリケーションに<a href="#install">インストール</a>するには、指定された<Links href="/ktor/server-modules" summary="Modules allow you to structure your application by grouping routes.">モジュール</Links>内の<code>install</code>関数に渡します。
    以下のコードスニペットは、<code>%plugin_name%</code>をインストールする方法を示しています...
</p>
<list>
    <li>
        ... <code>embeddedServer</code>関数の呼び出し内。
    </li>
    <li>
        ... <code>Application</code>クラスの拡張関数である、明示的に定義された<code>module</code>内。
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"></code-block>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"></code-block>
    </TabItem>
</Tabs>

## %plugin_name%の構成 {id="configure"}

### 概要 {id="overview"}

Ktorはレート制限に「トークンバケットアルゴリズム」を使用しており、以下のように動作します。
1. 最初に、トークンの数によって定義されるキャパシティ（容量）を持つバケットがあります。
2. 各受信リクエストは、バケットから1つのトークンを消費しようとします。
    - 十分なキャパシティがある場合、サーバーはリクエストを処理し、以下のヘッダーを含むレスポンスを送信します。
        - `X-RateLimit-Limit`: 指定されたバケットのキャパシティ。
        - `X-RateLimit-Remaining`: バケットに残っているトークンの数。
        - `X-RateLimit-Reset`: バケットが補充される時間を指定するUTCタイムスタンプ（秒単位）。
    - キャパシティが不足している場合、サーバーは `429 Too Many Requests` レスポンスを使用してリクエストを拒否し、クライアントが次のリクエストを行うまでに待機すべき時間（秒単位）を示す `Retry-After` ヘッダーを追加します。
3. 指定された期間が経過すると、バケットのキャパシティが補充されます。

### レートリミッターの登録 {id="register"}
Ktorでは、アプリケーション全体、または特定のルートにレート制限を適用できます。
- アプリケーション全体にレート制限を適用するには、`global`メソッドを呼び出し、構成済みのレートリミッターを渡します。
   ```kotlin
   install(RateLimit) {
       global {
           rateLimiter(limit = 5, refillPeriod = 60.seconds)
       }
   }
   ```

- `register`メソッドは、特定のルートに適用できるレートリミッターを登録します。
   ```kotlin
   install(RateLimit) {
       register {
           rateLimiter(limit = 5, refillPeriod = 60.seconds)
       }
   }
   ```

上記のコードサンプルは、`%plugin_name%`プラグインの最小限の構成を示していますが、`register`メソッドを使用して登録されたレートリミッターの場合、それを[特定のルート](#rate-limiting-scope)に適用する必要もあります。

### レート制限の構成 {id="configure-rate-limiting"}

このセクションでは、レート制限を構成する方法について説明します。

1. (オプション) `register`メソッドを使用すると、レート制限ルールを[特定のルート](#rate-limiting-scope)に適用するために使用できるレートリミッター名を指定できます。
   ```kotlin
       install(RateLimit) {
           register(RateLimitName("protected")) {
               // ...
           }
       }
   ```

2. `rateLimiter`メソッドは、2つのパラメータを使用してレートリミッターを作成します。`limit`はバケットのキャパシティを定義し、`refillPeriod`はこのバケットの補充期間を指定します。
   以下の例のレートリミッターは、1分間に30件のリクエストの処理を許可します。
   ```kotlin
   register(RateLimitName("protected")) {
       rateLimiter(limit = 30, refillPeriod = 60.seconds)
   }
   ```

3. (オプション) `requestKey`を使用すると、リクエストのキーを返す関数を指定できます。
   異なるキーを持つリクエストは、独立したレート制限を持ちます。
   以下の例では、`login` [クエリパラメータ](server-requests.md#query_parameters)が、異なるユーザーを区別するために使用されるキーです。
   ```kotlin
   register(RateLimitName("protected")) {
       requestKey { applicationCall ->
           applicationCall.request.queryParameters["login"]!!
       }
   }
   ```

   > キーには、適切な `equals` および `hashCode` の実装が必要であることに注意してください。

4. (オプション) `requestWeight`は、リクエストによって消費されるトークンの数を返す関数を設定します。
   以下の例では、リクエストキーを使用してリクエストの重みを構成しています。
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

5. (オプション) `modifyResponse`を使用すると、各リクエストとともに送信されるデフォルトの `X-RateLimit-*` ヘッダーをオーバーライドできます。
   ```kotlin
   register(RateLimitName("protected")) {
       modifyResponse { applicationCall, state ->
           applicationCall.response.header("X-RateLimit-Custom-Header", "Some value")
       }
   }
   ```

### レート制限の適用範囲の定義 {id="rate-limiting-scope"}

レートリミッターを構成した後、`rateLimit`メソッドを使用してそのルールを特定のルートに適用できます。

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

このメソッドは、[レートリミッター名](#configure-rate-limiting)を受け入れることもできます。

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

以下のコードサンプルは、`RateLimit`プラグインを使用して、異なるリソースに異なるレートリミッターを適用する方法を示しています。
[StatusPages](server-status-pages.md)プラグインは、`429 Too Many Requests`レスポンスが送信された拒否リクエストを処理するために使用されています。

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

完全な例はこちらにあります: [rate-limit](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/rate-limit)