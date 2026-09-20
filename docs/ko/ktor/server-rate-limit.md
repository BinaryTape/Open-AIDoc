[//]: # (title: 속도 제한(Rate limiting))

<show-structure for="chapter" depth="3"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="RateLimit"/>
<var name="package_name" value="io.ktor.server.plugins.ratelimit"/>
<var name="artifact_name" value="ktor-server-rate-limit"/>
<var name="plugin_api_link" value="https://api.ktor.io/ktor-server-rate-limit/io.ktor.server.plugins.ratelimit/-rate-limit.html"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="rate-limit"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor는 Kotlin/Native를 지원하며 추가 런타임이나 가상 머신 없이 서버를 실행할 수 있게 해줍니다.">Native 서버</Links> 지원</b>: ✅
</p>
</tldr>

<link-summary>
%plugin_name%은 들어오는 요청 본문을 검증하는 기능을 제공합니다.
</link-summary>

[`%plugin_name%`](%plugin_api_link%) 플러그인을 사용하면 클라이언트가 지정된 시간 동안 보낼 수 있는 [요청](server-requests.md) 수를 제한할 수 있습니다.

Ktor는 속도 제한을 구성하기 위한 여러 가지 방법을 제공합니다:

* 애플리케이션 전체에 전역적으로 속도 제한을 적용하거나 특정 [리소스](server-routing.md)에 대해 각기 다른 제한을 구성합니다.
* IP 주소, API 키 또는 액세스 토큰과 같은 요청 파라미터를 기반으로 속도 제한을 적용합니다.

## 의존성 추가 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code>을 사용하려면 빌드 스크립트에 <code>%artifact_name%</code> 아티팩트를 추가하세요:
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

## %plugin_name% 설치 {id="install_plugin"}

<p>
    <code>%plugin_name%</code> 플러그인을 애플리케이션에 <a href="#install">설치</a>하려면, 지정된 <Links href="/ktor/server-modules" summary="모듈을 사용하면 경로를 그룹화하여 애플리케이션을 구조화할 수 있습니다.">모듈</Links>의 <code>install</code> 함수에 전달하세요.
    다음 예제는 <code>%plugin_name%</code>을 설치하는 방법을 보여줍니다:
</p>
<list>
    <li>
        <code>embeddedServer()</code> 함수 호출 내부에서 설치.
    </li>
    <li>
        <code>Application</code> 클래스의 명시적으로 정의된 <code>module()</code> 확장 함수 내부에서 설치.
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

## %plugin_name% 구성 {id="configure"}

### 개요 {id="overview"}

Ktor는 속도 제한을 위해 _토큰 버킷(token bucket)_ 알고리즘을 사용하며, 다음과 같이 작동합니다:
1. 사용 가능한 토큰 수를 정의하는 지정된 용량으로 버킷이 생성됩니다.
2. 들어오는 각 요청은 버킷에서 하나의 토큰을 소비합니다:
   * 용량이 충분하면 서버는 요청을 처리하고 다음 헤더를 응답에 포함합니다:
     * `X-RateLimit-Limit`: 버킷 용량.
     * `X-RateLimit-Remaining`: 버킷에 남아 있는 토큰 수.
     * `X-RateLimit-Reset`: 버킷이 다시 채워지는 시점을 지정하는 UTC 타임스탬프(초 단위).
   * 용량이 부족하면 서버는 `429 Too Many Requests` 응답을 사용하여 요청을 거부합니다. 응답에는 클라이언트가 다음 요청을 보내기 전까지 대기해야 하는 시간(초 단위)을 나타내는 `Retry-After` 헤더가 포함됩니다.
3. 지정된 리필 주기가 지나면 버킷이 다시 채워집니다.

### 속도 제한기 등록 {id="register"}

애플리케이션 전체에 전역적으로 속도 제한을 적용하거나 특정 경로에 대한 속도 제한기를 등록할 수 있습니다:

* 전역적으로 속도 제한을 적용하려면 `global()` 함수를 호출하고 속도 제한기를 구성하세요:

   ```kotlin
   install(RateLimit) {
       global {
           rateLimiter(limit = 5, refillPeriod = 60.seconds)
       }
   }
   ```

* 특정 경로에 대한 속도 제한을 구성하려면 `register()` 함수를 사용하여 속도 제한기를 등록하세요:

   ```kotlin
   install(RateLimit) {
       register {
           rateLimiter(limit = 5, refillPeriod = 60.seconds)
       }
   }
   ```

위의 예제는 `%plugin_name%` 플러그인에 필요한 최소한의 구성을 보여줍니다.
`register()`를 사용하는 경우 등록된 속도 제한기를 [특정 경로](#rate-limiting-scope)에도 적용해야 합니다.

### 속도 제한 구성 {id="configure-rate-limiting"}

아래 옵션들을 사용하여 속도 제한기를 구성할 수 있습니다.

#### 속도 제한기 이름 지정 {id="name-a-rate-limiter"}

`register()` 함수를 사용하여 속도 제한기에 이름을 지정할 수 있습니다. 그런 다음 이름이 지정된 속도 제한기를 [특정 경로](#rate-limiting-scope)에 적용할 수 있습니다:

```kotlin
    install(RateLimit) {
        register(RateLimitName("protected")) {
            // ...
        }
    }
```

#### 제한 및 리필 주기 설정 {id="set-the-limit-and-refill-period"}

`rateLimiter()` 함수를 사용하여 버킷 용량과 리필 주기를 구성합니다:

* `limit`은 사용 가능한 토큰 수를 지정합니다.
* `refillPeriod`는 버킷이 다시 채워지는 주기를 지정합니다.

다음 예제는 분당 최대 30개의 요청을 허용합니다:

```kotlin
register(RateLimitName("protected")) {
    rateLimiter(limit = 30, refillPeriod = 60.seconds)
}
```

#### 키로 요청 구분 {id="distinguish-requests-by-key"}

`requestKey()` 함수를 사용하여 각 요청에 대한 키를 반환할 수 있습니다. 서로 다른 키를 가진 요청은 독립적인 속도 제한을 갖습니다.

다음 예제는 `login` [쿼리 파라미터](server-requests.md#query_parameters)를 사용하여 사용자를 구분합니다:

```kotlin
register(RateLimitName("protected")) {
    requestKey { applicationCall ->
        applicationCall.request.queryParameters["login"]!!
    }
}
```

> 요청 키에는 적절한 `equals` 및 `hashCode` 구현이 되어 있어야 합니다.
> 
{style="tip"}

#### 인증된 사용자 속도 제한 {id="rate-limit-authenticated-users"}

인증 주체(principal)를 요청 키로 사용하여 인증된 사용자별로 속도 제한을 적용할 수 있습니다.

`authenticate()` 내부에 `rateLimit()`을 중첩한 후, `requestKey()`에서 주체에 접근합니다:

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

#### 요청 가중치 설정 {id="set-the-request-weight"}

`requestWeight()` 함수를 사용하여 각 요청이 소비하는 토큰 수를 지정합니다. 이 함수는 애플리케이션 호출과 요청 키를 인자로 받습니다.

다음 예제에서는 `jetbrains` 키를 가진 요청은 토큰 하나를 소비하고, 다른 모든 요청은 두 개를 소비합니다:

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

#### 응답 커스터마이징 {id="customize-the-response"}

`modifyResponse()` 함수를 사용하여 속도 제한이 적용될 때 응답을 커스터마이징할 수 있습니다.

예를 들어, 사용자 정의 속도 제한 헤더를 추가할 수 있습니다:

```kotlin
register(RateLimitName("protected")) {
    modifyResponse { applicationCall, state ->
        applicationCall.response.header("X-RateLimit-Custom-Header", "Some value")
    }
}
```

### 속도 제한 범위 정의 {id="rate-limiting-scope"}

속도 제한기를 구성한 후에는 `rateLimit()` 함수를 사용하여 특정 경로에 적용할 수 있습니다.

#### 기본 속도 제한기 적용 {id="apply-the-default-rate-limiter"}

이름 없이 `rateLimit()` 함수를 사용하여 등록된 기본 속도 제한기를 적용합니다:

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

#### 이름이 지정된 속도 제한기 적용 {id="apply-a-named-rate-limiter"}

`rateLimit()` 함수에 `RateLimitName`을 전달하여 [이름이 지정된 속도 제한기](#configure-rate-limiting)를 적용합니다:

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

## 예제 {id="example"}

다음 예제는 서로 다른 경로에 서로 다른 속도 제한기를 적용하는 방법을 보여줍니다.
이 예제에서는 다음을 구성합니다:

* 홈페이지를 위한 기본 속도 제한기.
* 공개 API를 위한 이름이 지정된 공개(public) 속도 제한기.
* 요청 키와 가중치를 사용하는 이름이 지정된 보호(protected) 속도 제한기.
* `429 Too Many Requests` 응답으로 거부된 요청에 대한 응답을 커스터마이징하는 [`StatusPages`](server-status-pages.md) 플러그인.

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

> 전체 예제는 [rate-limit](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/rate-limit)에서 확인할 수 있습니다.
>
{style="tip"}