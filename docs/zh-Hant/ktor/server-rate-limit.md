[//]: # (title: 速率限制)

<show-structure for="chapter" depth="3"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="RateLimit"/>
<var name="package_name" value="io.ktor.server.plugins.ratelimit"/>
<var name="artifact_name" value="ktor-server-rate-limit"/>
<var name="plugin_api_link" value="https://api.ktor.io/ktor-server-rate-limit/io.ktor.server.plugins.ratelimit/-rate-limit.html"/>

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="rate-limit"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">原生伺服器</Links> 支援</b>：✅
</p>
</tldr>

<link-summary>
%plugin_name% 提供了驗證傳入請求內容的能力。
</link-summary>

[`%plugin_name%`](%plugin_api_link%) 外掛程式允許您限制用戶端在指定時間段內可以發送的 [請求](server-requests.md) 數量。

Ktor 提供了多種配置速率限制的方式：

* 為整個應用程式全域套用速率限制，或為特定 [資源](server-routing.md) 配置不同的限制。
* 根據請求參數套用速率限制，例如 IP 位址、API 金鑰或存取權杖。

## 新增相依性 {id="add_dependencies"}

<p>
    若要使用 <code>%plugin_name%</code>，請在建置指令碼中新增 <code>%artifact_name%</code> 構件：
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

## 安裝 %plugin_name% {id="install_plugin"}

<p>
    若要將 <code>%plugin_name%</code> 外掛程式 <a href="#install">安裝</a> 到您的應用程式，請將其傳遞給指定 <Links href="/ktor/server-modules" summary="Modules allow you to structure your application by grouping routes.">模組</Links> 中的 <code>install</code> 函式。
    以下範例示範了如何安裝 <code>%plugin_name%</code>：
</p>
<list>
    <li>
        在 <code>embeddedServer()</code> 函式呼叫中。
    </li>
    <li>
        在 <code>Application</code> 類別上明確定義的 <code>module()</code> 擴充函式中。
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

## 配置 %plugin_name% {id="configure"}

### 總覽 {id="overview"}

Ktor 使用 _權杖桶 (token bucket)_ 演算法進行速率限制，其運作原理如下：
1. 建立一個具有指定容量的桶，該容量定義了可用權杖的數量。
2. 每個傳入請求會從桶中消耗一個權杖：
   * 如果容量足夠，伺服器會處理該請求，並在回應中包含以下標頭：
     * `X-RateLimit-Limit`：桶容量。
     * `X-RateLimit-Remaining`：桶中剩餘的權杖數量。
     * `X-RateLimit-Reset`：以秒為單位的 UTC 時間戳記，指定何時重新補充桶容量。
   * 如果容量不足，伺服器會使用 `429 Too Many Requests` 回應拒絕請求。回應包含 `Retry-After` 標頭，指示用戶端在發送另一個請求之前應等待多少秒。
3. 經過指定的補充週期後，桶將被重新填滿。

### 註冊速率限制器 {id="register"}

您可以將速率限制套用於整個應用程式，或為特定路由註冊速率限制器：

* 若要全域套用速率限制，請呼叫 `global()` 函式並配置速率限制器：

   ```kotlin
   install(RateLimit) {
       global {
           rateLimiter(limit = 5, refillPeriod = 60.seconds)
       }
   }
   ```

* 若要為特定路由配置速率限制，請使用 `register()` 函式註冊速率限制器：

   ```kotlin
   install(RateLimit) {
       register {
           rateLimiter(limit = 5, refillPeriod = 60.seconds)
       }
   }
   ```

上面的範例展示了 `%plugin_name%` 外掛程式所需的最低限度配置。
如果您使用 `register()`，您還需要將註冊的速率限制器套用至 [特定路由](#rate-limiting-scope)。

### 配置速率限制 {id="configure-rate-limiting"}

您可以使用以下選項來配置速率限制器。

#### 為速率限制器命名 {id="name-a-rate-limiter"}

使用 `register()` 函式為速率限制器指定名稱。接著您可以將具名的速率限制器套用至 [特定路由](#rate-limiting-scope)：

```kotlin
    install(RateLimit) {
        register(RateLimitName("protected")) {
            // ...
        }
    }
```

#### 設定限制和補充週期 {id="set-the-limit-and-refill-period"}

使用 `rateLimiter()` 函式來配置桶容量與補充週期：

* `limit` 指定可用權杖的數量。
* `refillPeriod` 指定重新補充桶容量的頻率。

以下範例允許每分鐘最多 30 個請求：

```kotlin
register(RateLimitName("protected")) {
    rateLimiter(limit = 30, refillPeriod = 60.seconds)
}
```

#### 依金鑰區分請求 {id="distinguish-requests-by-key"}

使用 `requestKey()` 函式為每個請求傳回一個金鑰。具有不同金鑰的請求具有獨立的速率限制。

以下範例使用 `login` [查詢參數](server-requests.md#query_parameters) 來區分使用者：

```kotlin
register(RateLimitName("protected")) {
    requestKey { applicationCall ->
        applicationCall.request.queryParameters["login"]!!
    }
}
```

> 請確保請求金鑰具有適當的 `equals` 與 `hashCode` 實作。
> 
{style="tip"}

#### 對已驗證的使用者進行速率限制 {id="rate-limit-authenticated-users"}

您可以使用身分驗證主體 (authentication principal) 作為請求金鑰，針對每個已驗證的使用者套用速率限制。

將 `rateLimit()` 巢狀置於 `authenticate()` 內部，然後從 `requestKey()` 中存取主體：

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

#### 設定請求權重 {id="set-the-request-weight"}

使用 `requestWeight()` 函式指定每個請求消耗多少權杖。該函式會接收應用程式呼叫 (application call) 與請求金鑰。

在以下範例中，帶有 `jetbrains` 金鑰的請求會消耗一個權杖，而所有其他請求則消耗兩個：

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

#### 自訂回應 {id="customize-the-response"}

使用 `modifyResponse()` 函式自訂套用速率限制時的回應。

例如，您可以新增自訂的速率限制標頭：

```kotlin
register(RateLimitName("protected")) {
    modifyResponse { applicationCall, state ->
        applicationCall.response.header("X-RateLimit-Custom-Header", "Some value")
    }
}
```

### 定義速率限制範圍 {id="rate-limiting-scope"}

配置速率限制器後，您可以使用 `rateLimit()` 函式將其套用至特定路由。

#### 套用預設速率限制器 {id="apply-the-default-rate-limiter"}

使用不帶名稱的 `rateLimit()` 函式來套用預設註冊的速率限制器：

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

#### 套用具名速率限制器 {id="apply-a-named-rate-limiter"}

將 `RateLimitName` 傳遞給 `rateLimit()` 函式以套用 [具名速率限制器](#configure-rate-limiting)：

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

## 範例 {id="example"}

以下範例示範如何將不同的速率限制器套用至不同的路由。
它配置了：

* 適用於首頁的預設速率限制器。
* 適用於公開 API 的具名 public 速率限制器。
* 使用請求金鑰和權重的具名 protected 速率限制器。
* 用於自訂被 `429 Too Many Requests` 回應拒絕之請求的回應的 [`StatusPages`](server-status-pages.md) 外掛程式。

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

> 若要查看完整範例，請參閱 [rate-limit](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/rate-limit)。
>
{style="tip"}