[//]: # (title: 速率限制)

<show-structure for="chapter" depth="4"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="RateLimit"/>
<var name="package_name" value="io.ktor.server.plugins.ratelimit"/>
<var name="artifact_name" value="ktor-server-rate-limit"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.rateLimit"/>
<var name="plugin_api_link" value="https://api.ktor.io/ktor-server-rate-limit/io.ktor.server.plugins.ratelimit/-rate-limit.html"/>

<tldr>
<p>
<b>必要相依性</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="rate-limit"/>
<p>
    <b>程式碼範例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支援 Kotlin/Native，可讓你在無需額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器</Links> 支援</b>: ✅
</p>
</tldr>

<link-summary>
%plugin_name% 限制用戶端在一段時間內可發送的請求數量。
</link-summary>

[`%plugin_name%`](%plugin_api_link%) 外掛程式可讓您限制用戶端在指定時間段內可發送的[請求](server-requests.md)數量。

Ktor 提供了幾種設定速率限制的方式：

* 全域套用速率限制至整個應用程式，或為特定[資源](server-routing.md)設定不同的限制。
* 依據[請求金鑰](#request-key)套用速率限制，例如 [IP 位址](#client-ip)、[API 金鑰](#api-key)或[存取權杖](#access-token)。

## 新增相依性 {id="add_dependencies"}

<p>
    若要使用 <code>%plugin_name%</code>，請將 <code>%artifact_name%</code> 構件新增至您的組建指令碼中：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 安裝 %plugin_name% {id="install_plugin"}

<p>
    若要將 <code>%plugin_name%</code> 外掛程式<a href="server-plugins.md#install">安裝</a>至您的應用程式，
    請將其傳遞給指定 <Links href="server-modules.md" summary="模組可讓您透過將路由分組來建構應用程式。">模組</Links> 中的 <code>install</code> 函式。
    以下範例示範如何安裝 <code>%plugin_name%</code>：
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

## 設定 %plugin_name% {id="configure"}

### 概覽 {id="overview"}

Ktor 使用*權杖桶*（token bucket）演算法進行速率限制，其運作方式如下：
1. 建立一個具有指定容量的桶子，該容量定義了可用權杖的數量。
2. 每個傳入的請求都會消耗桶中的一枚權杖：
   * 如果容量足夠，伺服器會處理請求並在回應中包含以下標頭：
     * `X-RateLimit-Limit`：桶的容量。
     * `X-RateLimit-Remaining`：桶中剩餘的權杖數量。
     * `X-RateLimit-Reset`：以秒為單位的 UTC 時間戳記，指定桶重新填滿的時間。
   * 如果容量不足，伺服器會拒絕請求並回傳 `429 Too Many Requests` 回應。該回應包含 `Retry-After` 標頭，指示用戶端在發送另一個請求之前應等待多少秒。
3. 在指定的重新填充週期後，桶會被重新裝滿。

### 註冊速率限制器 {id="register"}

您可以全域套用速率限制至整個應用程式，或是為特定路由註冊速率限制器：

* 若要全域套用速率限制，請呼叫 `global()` 函式並設定速率限制器：

   ```kotlin
   install(RateLimit) {
       global {
           rateLimiter(limit = 5, refillPeriod = 60.seconds)
       }
   }
   ```

* 若要為特定路由設定速率限制，請使用 `register()` 函式註冊速率限制器：

   ```kotlin
   install(RateLimit) {
       register {
           rateLimiter(limit = 5, refillPeriod = 60.seconds)
       }
   }
   ```

上述範例展示了 `%plugin_name%` 外掛程式所需的最低設定。
如果使用 `register()`，您還需要將註冊的速率限制器套用至[特定路由](#rate-limiting-scope)。

### 設定速率限制 {id="configure-rate-limiting"}

您可以使用以下選項來設定速率限制器。

#### 命名速率限制器 {id="name-a-rate-limiter"}

使用 `register()` 函式為速率限制器指定名稱。接著您可以將具名速率限制器套用至[特定路由](#rate-limiting-scope)：

```kotlin
    install(RateLimit) {
        register(RateLimitName("protected")) {
            // ...
        }
    }
```

#### 設定限制與重新填充週期 {id="set-the-limit-and-refill-period"}

使用 `rateLimiter()` 函式設定桶容量與重新填充週期：

* `limit` 指定可用權杖的數量。
* `refillPeriod` 指定重新裝滿桶的頻率。

以下範例允許每分鐘最多 30 個請求：

```kotlin
register(RateLimitName("protected")) {
    rateLimiter(limit = 30, refillPeriod = 60.seconds)
}
```

#### 依金鑰區分請求 {id="request-key"}

使用 `requestKey()` 函式為每個請求傳回一個金鑰。具有不同金鑰的請求具有獨立的速率限制。預設情況下，所有請求共享同一個桶。

> 請確保請求金鑰具有適當的 `equals` 與 `hashCode` 實作。
> 
{style="note"}

##### 查詢參數 {id="query-parameter"}

以下範例使用 `login` [查詢參數](server-requests.md#query_parameters)來區分使用者：

```kotlin
register(RateLimitName("protected")) {
    requestKey { applicationCall ->
        applicationCall.request.queryParameters["login"]!!
    }
}
```

##### 用戶端 IP 位址 {id="client-ip"}

若要為每個用戶端 IP 位址套用獨立的速率限制，請使用
[`call.request.origin.remoteHost`](https://api.ktor.io/ktor-http/io.ktor.http/-request-connection-point/remote-host.html)
作為請求金鑰：

```kotlin
register(RateLimitName("per-ip")) {
    rateLimiter(limit = 5, refillPeriod = 60.seconds)
    requestKey { call ->
        call.request.origin.remoteHost
    }
}
```

如果應用程式執行於 Proxy 或負載平衡器後方，請設定
[Forwarded headers](server-forward-headers.md) 外掛程式，以確保 `origin.remoteHost` 代表原始用戶端位址而非 Proxy。

##### API 金鑰標頭 {id="api-key"}

若要依據標頭中發送的 API 金鑰進行請求速率限制，請從 `requestKey()` 傳回該標頭值：

```kotlin
register(RateLimitName("per-api-key")) {
    rateLimiter(limit = 5, refillPeriod = 60.seconds)
    requestKey { call ->
        call.request.headers["X-Api-Key"] ?: "anonymous"
    }
}
```

您也可以將此方法與 [API 金鑰驗證](server-api-key-auth.md)結合使用，並使用已驗證的主體 (principal) 代替原始標頭值作為請求金鑰。

##### 存取權杖或 Bearer 權杖 {id="access-token"}

若要為每個 Bearer 權杖套用獨立的速率限制，請從 `Authorization` 標頭傳回原始權杖作為請求金鑰：

```kotlin
requestKey { call ->
    call.request.authorization()?.removePrefix("Bearer ") ?: "anonymous"
}
```

當請求通過驗證時，建議使用[驗證主體](#rate-limit-authenticated-users)作為請求金鑰，為每個已驗證的身分套用獨立的速率限制。

#### 限制已驗證使用者的速率 {id="rate-limit-authenticated-users"}

您可以使用驗證主體作為請求金鑰，按已驗證的使用者套用速率限制。

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

使用 `requestWeight()` 函式指定每個請求消耗多少枚權杖。該函式會接收應用程式呼叫 (application call) 與請求金鑰。

在以下範例中，帶有 `jetbrains` 金鑰的請求消耗一枚權杖，而所有其他請求則消耗兩枚：

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

#### 自訂回應 {id="customize-the-response"}

當套用速率限制時，使用 `modifyResponse()` 函式自訂回應。

例如，您可以新增自訂的速率限制標頭：

```kotlin
register(RateLimitName("protected")) {
    modifyResponse { applicationCall, state ->
        applicationCall.response.header("X-RateLimit-Custom-Header", "Some value")
    }
}
```

### 定義速率限制作用域 {id="rate-limiting-scope"}

設定速率限制器後，您可以使用 `rateLimit()` 函式將其套用至特定路由。

#### 套用預設速率限制器 {id="apply-the-default-rate-limiter"}

使用不帶名稱的 `rateLimit()` 函式套用已註冊的預設速率限制器：

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

將 `RateLimitName` 傳遞給 `rateLimit()` 函式以套用[具名速率限制器](#configure-rate-limiting)：

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
其設定了：

* 首頁的預設速率限制器。
* 公開 API 的具名 public 速率限制器。
* 使用請求金鑰與權重的具名 protected 速率限制器。
* 分別以用戶端 IP 與 `X-Api-Key` 標頭為金鑰的具名速率限制器。
* 用於自訂被拒絕並傳回 `429 Too Many Requests` 回應之請求的 [`StatusPages`](server-status-pages.md) 外掛程式。

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

> 如需完整範例，請參閱 [rate-limit](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/rate-limit)。
>
{style="tip"}