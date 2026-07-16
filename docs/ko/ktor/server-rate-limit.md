[//]: # (title: 속도 제한(Rate limiting))

<show-structure for="chapter" depth="2"/>
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

[%plugin_name%](%plugin_api_link%) 플러그인을 사용하면 클라이언트가 일정 시간 동안 보낼 수 있는 [요청](server-requests.md) 수를 제한할 수 있습니다.
Ktor는 속도 제한을 구성하기 위한 다양한 수단을 제공합니다. 예를 들어:
- 애플리케이션 전체에 전역적으로 속도 제한을 활성화하거나, 서로 다른 [리소스](server-routing.md)에 대해 각기 다른 속도 제한을 구성할 수 있습니다.
- IP 주소, API 키 또는 액세스 토큰 등 특정 요청 파라미터를 기반으로 속도 제한을 구성할 수 있습니다.

## 의존성 추가 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code>을 사용하려면 빌드 스크립트에 <code>%artifact_name%</code> 아티팩트를 포함해야 합니다:
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

## %plugin_name% 설치 {id="install_plugin"}

<p>
    <code>%plugin_name%</code> 플러그인을 애플리케이션에 <a href="#install">설치</a>하려면, 지정된 <Links href="/ktor/server-modules" summary="모듈을 사용하면 경로를 그룹화하여 애플리케이션을 구조화할 수 있습니다.">모듈</Links>의 <code>install</code> 함수에 전달하세요.
    아래의 코드 스니펫은 <code>%plugin_name%</code>을 설치하는 방법을 보여줍니다...
</p>
<list>
    <li>
        ... <code>embeddedServer</code> 함수 호출 내부에서 설치하는 방법.
    </li>
    <li>
        ... <code>Application</code> 클래스의 확장 함수인 명시적으로 정의된 <code>module</code> 내부에서 설치하는 방법.
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

## %plugin_name% 구성 {id="configure"}

### 개요 {id="overview"}

Ktor는 속도 제한을 위해 토큰 버킷(token bucket) 알고리즘을 사용하며, 다음과 같이 작동합니다:
1. 처음에는 용량(토큰 수)으로 정의된 버킷이 있습니다.
2. 들어오는 각 요청은 버킷에서 토큰 하나를 소비하려고 시도합니다:
    - 용량이 충분하면 서버는 요청을 처리하고 다음 헤더와 함께 응답을 보냅니다:
        - `X-RateLimit-Limit`: 지정된 버킷 용량.
        - `X-RateLimit-Remaining`: 버킷에 남아 있는 토큰 수.
        - `X-RateLimit-Reset`: 버킷이 다시 채워지는 시간을 지정하는 UTC 타임스탬프(초 단위).
    - 용량이 부족하면 서버는 `429 Too Many Requests` 응답을 사용하여 요청을 거부하고, 클라이언트가 다음 요청을 보내기까지 기다려야 하는 시간(초 단위)을 나타내는 `Retry-After` 헤더를 추가합니다.
3. 지정된 시간이 지나면 버킷 용량이 다시 채워집니다.

### 속도 제한기 등록 {id="register"}
Ktor를 사용하면 애플리케이션 전체에 전역적으로 속도 제한을 적용하거나 특정 경로에 적용할 수 있습니다:
- 애플리케이션 전체에 속도 제한을 적용하려면 `global` 메서드를 호출하고 구성된 속도 제한기를 전달하세요.
   ```kotlin
   install(RateLimit) {
       global {
           rateLimiter(limit = 5, refillPeriod = 60.seconds)
       }
   }
   ```

- `register` 메서드는 특정 경로에 적용할 수 있는 속도 제한기를 등록합니다.
   ```kotlin
   install(RateLimit) {
       register {
           rateLimiter(limit = 5, refillPeriod = 60.seconds)
       }
   }
   ```

위의 코드 샘플은 `%plugin_name%` 플러그인에 대한 최소한의 구성을 보여주지만, `register` 메서드를 사용하여 등록된 속도 제한기의 경우 [특정 경로](#rate-limiting-scope)에도 이를 적용해야 합니다.

### 속도 제한 구성 {id="configure-rate-limiting"}

이 섹션에서는 속도 제한을 구성하는 방법을 살펴보겠습니다:

1. (선택 사항) `register` 메서드를 사용하면 [특정 경로](#rate-limiting-scope)에 속도 제한 규칙을 적용하는 데 사용할 수 있는 속도 제한기 이름을 지정할 수 있습니다:
   ```kotlin
       install(RateLimit) {
           register(RateLimitName("protected")) {
               // ...
           }
       }
   ```

2. `rateLimiter` 메서드는 두 개의 파라미터로 속도 제한기를 생성합니다: 
   `limit`은 버킷 용량을 정의하고, `refillPeriod`는 이 버킷의 리필 주기를 지정합니다.
   아래 예제의 속도 제한기는 분당 30개의 요청을 처리할 수 있도록 허용합니다:
   ```kotlin
   register(RateLimitName("protected")) {
       rateLimiter(limit = 30, refillPeriod = 60.seconds)
   }
   ```

3. (선택 사항) `requestKey`를 사용하면 요청에 대한 키를 반환하는 함수를 지정할 수 있습니다.
   키가 서로 다른 요청은 독립적인 속도 제한을 갖습니다.
   아래 예제에서는 `login` [쿼리 파라미터](server-requests.md#query_parameters)를 키로 사용하여 서로 다른 사용자를 구분합니다:
   ```kotlin
   register(RateLimitName("protected")) {
       requestKey { applicationCall ->
           applicationCall.request.queryParameters["login"]!!
       }
   }
   ```

   > 키는 `equals` 및 `hashCode`가 잘 구현되어 있어야 합니다.

4. (선택 사항) `requestWeight`는 요청에 의해 소비되는 토큰 수를 반환하는 함수를 설정합니다.
   아래 예제에서는 요청 키를 사용하여 요청 가중치를 구성합니다:
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

5. (선택 사항) `modifyResponse`를 사용하면 각 요청과 함께 전송되는 기본 `X-RateLimit-*` 헤더를 오버라이드할 수 있습니다:
   ```kotlin
   register(RateLimitName("protected")) {
       modifyResponse { applicationCall, state ->
           applicationCall.response.header("X-RateLimit-Custom-Header", "Some value")
       }
   }
   ```

### 속도 제한 범위 정의 {id="rate-limiting-scope"}

속도 제한기를 구성한 후에는 `rateLimit` 메서드를 사용하여 특정 경로에 해당 규칙을 적용할 수 있습니다:

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

이 메서드는 [속도 제한기 이름](#configure-rate-limiting)을 인자로 받을 수도 있습니다:

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

아래 코드 샘플은 `RateLimit` 플러그인을 사용하여 서로 다른 리소스에 각기 다른 속도 제한기를 적용하는 방법을 보여줍니다.
[StatusPages](server-status-pages.md) 플러그인은 `429 Too Many Requests` 응답이 전송된 거부된 요청을 처리하는 데 사용됩니다.

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

전체 예제는 여기에서 확인할 수 있습니다: [rate-limit](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/rate-limit).