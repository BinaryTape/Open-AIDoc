[//]: # (title: 速率限制)

<show-structure for="chapter" depth="4"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="RateLimit"/>
<var name="package_name" value="io.ktor.server.plugins.ratelimit"/>
<var name="artifact_name" value="ktor-server-rate-limit"/>
<var name="plugin_api_link" value="https://api.ktor.io/ktor-server-rate-limit/io.ktor.server.plugins.ratelimit/-rate-limit.html"/>

<tldr>
<p>
<b>必需的依赖项</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="rate-limit"/>
<p>
    <b>代码示例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支持 Kotlin/Native，并允许你在没有额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>: ✅
</p>
</tldr>

<link-summary>
%plugin_name% 限制了客户端在一段时间内可以发出的请求数量。
</link-summary>

[`%plugin_name%`](%plugin_api_link%) 插件允许你限制客户端在指定时间段内可以发出的[请求](server-requests.md)数量。

Ktor 提供了多种配置速率限制的方式：

* 为整个应用程序全局应用速率限制，或为特定[资源](server-routing.md)配置不同的限制。
* 基于[请求键](#request-key)应用速率限制，例如 [IP 地址](#client-ip)、[API 密钥](#api-key)或[访问令牌](#access-token)。

## 添加依赖项 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，请在构建脚本中添加 <code>%artifact_name%</code> 构件：
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

## 安装 %plugin_name% {id="install_plugin"}

<p>
    要在应用程序中<a href="#install">安装</a> <code>%plugin_name%</code> 插件，请将其传递给指定<Links href="/ktor/server-modules" summary="模块允许你通过对路由进行分组来构建应用程序。">模块</Links>中的 <code>install</code> 函数。
    以下示例展示了如何安装 <code>%plugin_name%</code>：
</p>
<list>
    <li>
        在 <code>embeddedServer()</code> 函数调用中。
    </li>
    <li>
        在 <code>Application</code> 类上显式定义的 <code>module()</code> 扩展函数中。
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

### 概览 {id="overview"}

Ktor 使用_令牌桶 (token bucket)_ 算法进行速率限制，其工作原理如下：
1. 创建一个具有指定容量的桶，用于定义可用令牌的数量。
2. 每个传入请求都会从桶中消耗一个令牌：
   * 如果有足够的容量，服务器会处理请求并在响应中包含以下标头：
     * `X-RateLimit-Limit`：桶容量。
     * `X-RateLimit-Remaining`：桶中剩余的令牌数量。
     * `X-RateLimit-Reset`：UTC 时间戳（以秒为单位），指定补充桶的时间。
   * 如果容量不足，服务器会使用 `429 Too Many Requests` 响应拒绝请求。响应中包含 `Retry-After` 标头，指示客户端在发送下一个请求之前应等待多少秒。
3. 在指定的补充周期后，桶会被补充。

### 注册速率限制器 {id="register"}

你可以将速率限制全局应用于整个应用程序，也可以为特定路由注册速率限制器：

* 要全局应用速率限制，请调用 `global()` 函数并配置速率限制器：

   ```kotlin
   install(RateLimit) {
       global {
           rateLimiter(limit = 5, refillPeriod = 60.seconds)
       }
   }
   ```

* 要为特定路由配置速率限制，请使用 `register()` 函数注册速率限制器：

   ```kotlin
   install(RateLimit) {
       register {
           rateLimiter(limit = 5, refillPeriod = 60.seconds)
       }
   }
   ```

上面的示例展示了 `%plugin_name%` 插件所需的最小配置。
如果使用 `register()`，你还需要将注册的速率限制器应用于[特定路由](#rate-limiting-scope)。

### 配置速率限制 {id="configure-rate-limiting"}

你可以使用以下选项配置速率限制器。

#### 为速率限制器命名 {id="name-a-rate-limiter"}

使用 `register()` 函数为速率限制器分配名称。随后你可以将命名速率限制器应用于[特定路由](#rate-limiting-scope)：

```kotlin
    install(RateLimit) {
        register(RateLimitName("protected")) {
            // ...
        }
    }
```

#### 设置限制和补充周期 {id="set-the-limit-and-refill-period"}

使用 `rateLimiter()` 函数配置桶容量和补充周期：

* `limit` 指定可用令牌的数量。
* `refillPeriod` 指定补充桶的频率。

以下示例允许每分钟最多 30 个请求：

```kotlin
register(RateLimitName("protected")) {
    rateLimiter(limit = 30, refillPeriod = 60.seconds)
}
```

#### 按键区分请求 {id="request-key"}

使用 `requestKey()` 函数为每个请求返回一个键。具有不同键的请求拥有独立的速率限制。默认情况下，所有请求共享同一个桶。

> 确保请求键具有适当的 `equals` 和 `hashCode` 实现。
> 
{style="note"}

##### 查询参数 {id="query-parameter"}

以下示例使用 `login` [查询参数](server-requests.md#query_parameters)来区分用户：

```kotlin
register(RateLimitName("protected")) {
    requestKey { applicationCall ->
        applicationCall.request.queryParameters["login"]!!
    }
}
```

##### 客户端 IP 地址 {id="client-ip"}

要为每个客户端 IP 地址应用独立的速率限制，请使用 [`call.request.origin.remoteHost`](https://api.ktor.io/ktor-http/io.ktor.http/-request-connection-point/remote-host.html) 作为请求键：

```kotlin
register(RateLimitName("per-ip")) {
    rateLimiter(limit = 5, refillPeriod = 60.seconds)
    requestKey { call ->
        call.request.origin.remoteHost
    }
}
```

如果应用程序运行在代理或负载均衡器后，请配置 [Forwarded headers](server-forward-headers.md) 插件，以便 `origin.remoteHost` 表示原始客户端地址而非代理。

##### API 密钥标头 {id="api-key"}

要按标头中发送的 API 密钥对请求进行速率限制，请从 `requestKey()` 返回该标头值：

```kotlin
register(RateLimitName("per-api-key")) {
    rateLimiter(limit = 5, refillPeriod = 60.seconds)
    requestKey { call ->
        call.request.headers["X-Api-Key"] ?: "anonymous"
    }
}
```

你还可以将此方法与 [API 密钥身份验证](server-api-key-auth.md)相结合，使用已验证的主体作为请求键，而不是原始标头值。

##### 访问令牌或 Bearer 令牌 {id="access-token"}

要为每个 Bearer 令牌应用独立的速率限制，请从 `Authorization` 标头返回原始令牌作为请求键：

```kotlin
requestKey { call ->
    call.request.authorization()?.removePrefix("Bearer ") ?: "anonymous"
}
```

当请求已通过身份验证时，建议使用[身份验证主体](#rate-limit-authenticated-users)作为请求键，以便为每个已验证的身份应用独立的速率限制。

#### 对已验证用户进行速率限制 {id="rate-limit-authenticated-users"}

你可以使用身份验证主体作为请求键，以便按已验证用户应用速率限制。

将 `rateLimit()` 嵌套在 `authenticate()` 内部，然后从 `requestKey()` 中访问主体：

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

#### 设置请求权重 {id="set-the-request-weight"}

使用 `requestWeight()` 函数指定每个请求消耗多少令牌。该函数接收应用程序调用和请求键。

在以下示例中，具有 `jetbrains` 键的请求消耗一个令牌，而所有其他请求消耗两个：

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

#### 自定义响应 {id="customize-the-response"}

使用 `modifyResponse()` 函数自定义应用速率限制时的响应。

例如，你可以添加自定义速率限制标头：

```kotlin
register(RateLimitName("protected")) {
    modifyResponse { applicationCall, state ->
        applicationCall.response.header("X-RateLimit-Custom-Header", "Some value")
    }
}
```

### 定义速率限制范围 {id="rate-limiting-scope"}

配置速率限制器后，你可以使用 `rateLimit()` 函数将其应用于特定路由。

#### 应用默认速率限制器 {id="apply-the-default-rate-limiter"}

使用不带名称的 `rateLimit()` 函数来应用默认注册的速率限制器：

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

#### 应用命名速率限制器 {id="apply-a-named-rate-limiter"}

将 `RateLimitName` 传递给 `rateLimit()` 函数以应用[命名速率限制器](#configure-rate-limiting)：

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

## 示例 {id="example"}

以下示例展示了如何将不同的速率限制器应用于不同的路由。
它配置了：

* 主页的默认速率限制器。
* 公共 API 的命名 public 速率限制器。
* 使用请求键和权重的命名 protected 速率限制器。
* 按客户端 IP 和 `X-Api-Key` 标头为键的命名速率限制器。
* [`StatusPages`](server-status-pages.md) 插件，用于为因 `429 Too Many Requests` 响应而被拒绝的请求自定义响应。

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

> 有关完整示例，请参阅 [rate-limit](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/rate-limit)。
>
{style="tip"}