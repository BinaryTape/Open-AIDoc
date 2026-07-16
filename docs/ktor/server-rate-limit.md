[//]: # (title: 速率限制)

<show-structure for="chapter" depth="2"/>
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
%plugin_name% 提供了验证传入请求正文的能力。
</link-summary>

[%plugin_name%](%plugin_api_link%) 插件允许你限制客户端在特定时间段内可以发出的[请求](server-requests.md)数量。
Ktor 提供了多种配置速率限制的方式，例如：
- 你可以为整个应用程序全局启用速率限制，或者为不同的[资源](server-routing.md)配置不同的速率限制。
- 你可以基于特定的请求参数配置速率限制：IP 地址、API 密钥或访问令牌等。

## 添加依赖项 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，你需要在构建脚本中包含 <code>%artifact_name%</code> 构件：
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

## 安装 %plugin_name% {id="install_plugin"}

<p>
    要在应用程序中<a href="#install">安装</a> <code>%plugin_name%</code> 插件，请将其传递给指定<Links href="/ktor/server-modules" summary="模块允许你通过对路由进行分组来构建应用程序。">模块</Links>中的 <code>install</code> 函数。
    以下代码片段显示了如何安装 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函数调用中。
    </li>
    <li>
        ... 在显式定义的 <code>module</code> 中，它是 <code>Application</code> 类的扩展函数。
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

## 配置 %plugin_name% {id="configure"}

### 概览 {id="overview"}

Ktor 使用**令牌桶 (token bucket)** 算法进行速率限制，其工作原理如下：
1. 开始时，我们有一个由容量定义的桶，即令牌数量。
2. 每个传入请求都会尝试从桶中消耗一个令牌：
    - 如果有足够的容量，服务器会处理请求并发送带有以下标头的响应：
        - `X-RateLimit-Limit`：指定的桶容量。
        - `X-RateLimit-Remaining`：桶中剩余的令牌数量。
        - `X-RateLimit-Reset`：一个 UTC 时间戳（以秒为单位），指定补充桶的时间。
    - 如果容量不足，服务器会使用 `429 Too Many Requests` 响应拒绝请求，并添加 `Retry-After` 标头，指示客户端在发出后续请求之前应等待多长时间（以秒为单位）。
3. 在指定的时间段后，桶容量会被补充。

### 注册速率限制器 {id="register"}
Ktor 允许你将速率限制全局应用于整个应用程序或特定路由：
- 要将速率限制应用于整个应用程序，请调用 `global` 方法并传递配置好的速率限制器。
   ```kotlin
   install(RateLimit) {
       global {
           rateLimiter(limit = 5, refillPeriod = 60.seconds)
       }
   }
   ```

- `register` 方法注册一个可应用于特定路由的速率限制器。
   ```kotlin
   install(RateLimit) {
       register {
           rateLimiter(limit = 5, refillPeriod = 60.seconds)
       }
   }
   ```

上面的代码示例演示了 `%plugin_name%` 插件的最小配置，但对于使用 `register` 方法注册的速率限制器，你还需要将其应用于[特定路由](#rate-limiting-scope)。

### 配置速率限制 {id="configure-rate-limiting"}

在本节中，我们将了解如何配置速率限制：

1. （可选）`register` 方法允许你指定一个速率限制器名称，该名称可用于将速率限制规则应用于[特定路由](#rate-limiting-scope)：
   ```kotlin
       install(RateLimit) {
           register(RateLimitName("protected")) {
               // ...
           }
       }
   ```

2. `rateLimiter` 方法创建一个速率限制器，它带有两个参数：
   `limit` 定义桶容量，而 `refillPeriod` 指定该桶的补充周期。
   下面示例中的速率限制器允许每分钟处理 30 个请求：
   ```kotlin
   register(RateLimitName("protected")) {
       rateLimiter(limit = 30, refillPeriod = 60.seconds)
   }
   ```

3. （可选）`requestKey` 允许你指定一个返回请求键的函数。
   具有不同键的请求拥有独立的速率限制。
   在下面的示例中，`login` [查询参数](server-requests.md#query_parameters)是用于区分不同用户的键：
   ```kotlin
   register(RateLimitName("protected")) {
       requestKey { applicationCall ->
           applicationCall.request.queryParameters["login"]!!
       }
   }
   ```

   > 请注意，键应具有良好的 `equals` 和 `hashCode` 实现。

4. （可选）`requestWeight` 设置一个返回请求消耗多少令牌的函数。
   在下面的示例中，请求键用于配置请求权重：
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

5. （可选）`modifyResponse` 允许你重写随每个请求发送的默认 `X-RateLimit-*` 标头：
   ```kotlin
   register(RateLimitName("protected")) {
       modifyResponse { applicationCall, state ->
           applicationCall.response.header("X-RateLimit-Custom-Header", "Some value")
       }
   }
   ```

### 定义速率限制范围 {id="rate-limiting-scope"}

配置速率限制器后，你可以使用 `rateLimit` 方法将其规则应用于特定路由：

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

此方法还可以接受一个[速率限制器名称](#configure-rate-limiting)：

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

下面的代码示例演示了如何使用 `RateLimit` 插件将不同的速率限制器应用于不同的资源。
[StatusPages](server-status-pages.md) 插件用于处理已拒绝的请求，对于这些请求，已发送了 `429 Too Many Requests` 响应。

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

你可以在此处找到完整的示例：[rate-limit](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/rate-limit)。