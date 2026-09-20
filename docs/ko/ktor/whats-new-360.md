[//]: # (title: Ktor 3.6.0의 새로운 기능)

<show-structure for="chapter,procedure" depth="3"/>

_[출시일: 2026년 9월 17일](releases.md#release-details)_

Ktor 3.6.0은 서버와 클라이언트 전반에 걸쳐 다양한 개선 사항을 제공합니다. 이번 기능 릴리스의 주요 하이라이트는 다음과 같습니다.

* [Netty 서버 엔진의 실험적 HTTP/3 지원](#http3)
* [Kotlin Multiplatform용 기본 클라이언트 엔진 추가](#default-engines)
* [실험적인 타입 안전 인증(typed authentication) 지원](#typed-auth)
* [실험적인 OpenID Connect 플러그인](#oidc)
* [JVM 환경의 WebRTC 클라이언트 지원](#webrtc-jvm-support)

## Ktor Server {id="ktor-server"}

### 요청 파라미터에 대한 추가 타입 지원 {id="additional-type-support-for-request-parameters"}

Ktor 3.6.0에서는 요청 파라미터를 타입이 지정된 값으로 변환할 때 기본적으로 지원되는 타입 목록이 확장되었습니다.

이제 다음 타입들이 지원됩니다.

* `Byte`
* `java.lang.Byte`
* `UByte`
* `UInt`
* `UShort`
* `ULong`
* `Uuid`

예를 들어, 프로퍼티 위임(property delegation)을 통해 라우트 핸들러 내에서 `Uuid` 파라미터를 직접 가져올 수 있습니다.

```kotlin
get {
    val uuid: Uuid by call.parameters
}
```

### 사전 압축된 정적 파일에 대한 Zstandard(zstd) 및 DEFLATE 지원 {id="zstandard-zstd-and-deflate-support-for-pre-compressed-static-files"}

Ktor가 이제 Zstandard(zstd) 및 DEFLATE 형식으로 사전 압축된(pre-compressed) 정적 콘텐츠를 제공할 수 있습니다.

새로운 형식을 활성화하려면 `preCompressed()` 함수에 `CompressedFileType.ZSTD` 및 `CompressedFileType.DEFLATE` 열거형 상수를 전달합니다.

```kotlin
staticResources("staticResources", "public") {
    preCompressed(
        CompressedFileType.ZSTD,
        CompressedFileType.DEFLATE
    )
}
```

### OpenAPI 태그 설명 {id="openapi-tag-descriptions"}

이제 [`openAPI {}`](server-openapi.md) 및 [`swaggerUI {}`](server-swagger-ui.md) 구성 블록에서 직접 OpenAPI 태그에 대한 설명을 정의할 수 있습니다.

```kotlin
swaggerUI("/swagger") {
    info = OpenApiInfo("Books API from routes", "1.0.0")
    tag(
        name = "Books",
        description = "Operations on books"
    )
}
```

태그 설명은 생성된 OpenAPI 문서의 최상위 메타데이터에 추가됩니다.

### 새로운 `ApplicationCall.respondHtmlPartial()` 함수 {id="new-applicationcall-respondhtmlpartial-function"}

부분 HTML 콘텐츠로 응답할 때 기존의 `.respondHtmlFragment()`를 대체하는 새로운 `.respondHtmlPartial()` 함수가 추가되었습니다.

이 함수는 람다 수신 객체로 `TagConsumer<Appendable>`을 사용하므로 테이블 셀과 같은 제한 없는 HTML 콘텐츠를 반환할 수 있습니다.

```kotlin
call.respondHtmlPartial(HttpStatusCode.Created) {
    td { +"Created!" }
}
```

더 이상 권장되지 않는(deprecated) `.respondHtmlFragment()` 함수는 반환 가능한 HTML 요소를 제한하는 `FlowContent`를 사용했습니다. 이제 `.respondHtmlPartial()`로 대체되었습니다.

### Netty {id="netty"}

#### HTTP/3 지원 {id="http3"}
<primary-label ref="experimental"/>

Netty 서버 엔진에 QUIC 기반 [HTTP/3](server-http3.md)에 대한 실험적 지원이 추가되었습니다.

HTTP/3를 활성화하려면 SSL 커넥터를 구성하고 Netty 엔진 설정에서 `enableHttp3()` 함수를 호출합니다.

```kotlin
embeddedServer(Netty, environment, {
    // SSL 커넥터가 필요합니다.
    sslConnector(
        keyStore = keyStore,
        keyAlias = "server",
        keyStorePassword = { "changeit".toCharArray() },
        privateKeyPassword = { "changeit".toCharArray() }
    ) {
        port = 8443
        host = "0.0.0.0"
    }

    enableHttp3 {
        quicTokenHandler = HmacQuicTokenHandler() // 선택 사항
        quicMaxIdleTimeout = 30.seconds
        quicInitialMaxData = 10_000_000
        quicInitialMaxStreamDataBidirectionalLocal = 1_000_000
        quicInitialMaxStreamDataBidirectionalRemote = 1_000_000
        quicInitialMaxStreamsBidirectional = 100
        udpSocketCount = 1
        udpReceiveBufferSize = 0
        udpSendBufferSize = 0
        configureQuicServerCodec = { /* 선택적 저수준 Netty 튜닝 */ }
    }
}) { /* Application */ }.start(wait = true)
```

`enableHttp3 {}` 블록을 사용하여 연결 타임아웃, 흐름 제어 제한, UDP 소켓 설정과 같은 QUIC 전용 옵션을 구성할 수도 있습니다.

#### TLS 기반 HTTP/2와 함께 h2c 사용 {id="use-h2c-alongside-http-2-over-tls"}

이제 동일한 서버에서 Netty 서버 엔진을 통해 [평문 HTTP/2(h2c)](server-http2.md#http2-without-tls)와 TLS 기반 HTTP/2를 동시에 제공할 수 있습니다.

이를 통해 평문 커넥터와 SSL 커넥터를 각각 구성한 후 HTTP/2와 h2c를 모두 활성화할 수 있습니다.

```kotlin
embeddedServer(Netty, configure = {
    connector {
        port = 8080
    }
    sslConnector(...) {
        port = 8443
    }

    enableHttp2 = true
    enableH2c = true
}) {
    // ...
}
```

평문 커넥터는 h2c 연결을 수락하며, SSL 커넥터는 TLS 기반 HTTP/2를 제공합니다.

### 인증된 Principal을 활용한 Rate Limiting {id="rate-limiting-with-auth"}

이제 [`RateLimit`](server-rate-limit.md) 플러그인이 요청 유효성 검사 중에 인증 주체(Principal)에 접근할 수 있습니다.

이를 통해 `rateLimit()` 함수를 `authenticate()` 내부에 중첩하고 `requestKey()` 함수에서 `call.principal()`을 사용하여 인증된 사용자별로 Rate Limit을 적용할 수 있습니다.

```kotlin
install(Authentication) {
    basic("auth") { validate { UserIdPrincipal(it.name) } }
}

install(RateLimit) {
    register(RateLimitName("per-user")) {
        rateLimiter(limit = 10, refillPeriod = 60.seconds)
        requestKey {
            call.principal<UserIdPrincipal>()?.name ?: "anonymous"
        }
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

또한 `rateLimit()`을 `authenticate()` 외부에 배치하여 인증 전에 요청 빈도 제한을 적용할 수도 있습니다. Rate Limit이 인증된 Principal에 의존하지 않는 경우 이 방식을 사용하세요.

### 타입 안전(Type-safe) 인증 스키마 API {id="typed-auth"}
<primary-label ref="experimental"/>

Ktor 3.6.0에서는 실험적인 [타입 안전 인증 스키마 API](server-typed-auth.md)가 도입되었습니다. 이름을 지정하여 프로바이더를 등록하고 문자열로 참조하는 대신, 스키마 값을 생성하여 해당 인증이 필요한 라우트에 직접 전달할 수 있습니다. 보호된 라우트 내부에서 `call.principal`은 스키마의 Principal 타입을 가지며 `null`이 아님(non-null)이 보장됩니다.

```kotlin
data class User(val id: String, val email: String)

val jwtAuth = jwt<User>("my-jwt") {
    verifier(jwkProvider, issuer)
    validate { credential ->
        val payload = credential.payload
        User(
            id = payload.subject,
            email = payload.getClaim("email").asString()
        )
    }
}

routing {
    authenticateWith(jwtAuth) {
        get("/profile") {
            call.respondText(call.principal.email)
        }
    }
}
```

이 API는 또한 옵트인 [역할 검사(role checks)](server-typed-auth.md#roles), [익명 폴백](server-typed-auth.md#anonymous), 타입이 지정된 [세션](server-typed-session-auth.md) 및 [OAuth 2.0](server-oauth2-flows.md) 지원을 추가합니다.

> 타입 안전 인증 스키마 API는 `@ExperimentalKtorApi`로 표시되어 있으며, Kotlin 2.4.0 또는 `-Xcontext-parameters` 컴파일러 옵션이 필요한 Kotlin Context Parameters를 사용합니다. 기존의 [`install(Authentication)` API](server-auth.md)도 계속 지원되므로 동일한 애플리케이션에서 두 API를 함께 사용할 수 있습니다.
> 
{style="note"}

### OpenID Connect 플러그인 {id="oidc"}
<primary-label ref="experimental"/>

Ktor 3.6.0에 실험적인 [OpenID Connect 플러그인](server-oidc.md)이 추가되었습니다. Discovery, JWKS 확인(resolution), JWT 검증 및 OAuth 콜백을 개별적으로 구성하는 대신, 발급자(Issuer) URL을 사용하여 프로바이더를 등록하고 타입 안전 인증 스키마를 얻을 수 있습니다.

```kotlin
suspend fun Application.module() {
    val oidc = install(Oidc)

    val google = oidc.identityProvider("google") {
        issuer = "https://accounts.google.com"
        bearer { audience = setOf("my-api") }
    }

    routing {
        authenticateWith(google.jwtBearer) {
            get("/me") {
                call.respond(call.principal.userInfo)
            }
        }
    }
}
```

이 플러그인은 유입되는 액세스 토큰을 검증하는 [리소스 서버](server-oidc-resource-server.md)와 세션, 로그아웃, 토큰 갱신을 포함한 [브라우저 로그인](server-oidc-browser-login.md)을 모두 지원합니다. 또한 PKCE를 사용하는 권한 부여 코드 흐름(authorization code flow), 토큰 인트로스펙션(RFC 7662), 리소스 지표(RFC 8707) 및 보호된 리소스 메타데이터(RFC 9728)를 구현합니다.

> 이 플러그인은 `@ExperimentalKtorApi`로 표시되어 있으며, 타입 안전 스키마 API를 기반으로 구축되었고 JVM에서만 사용할 수 있습니다.
> 
{style="note"}

### `ApplicationCall.receive()`의 Nullable 요청 본문 지원 {id="nullable-request-bodies-with-applicationcall-receive"}

Ktor가 이제 `ApplicationCall.receive()` 함수에서 Nullable 타입 인수를 지원합니다.

`.receiveNullable()` 함수는 deprecated되었습니다. 요청 본문이 `null`일 수 있는 경우 Nullable 타입과 함께 `.receive()`를 사용하세요.

<compare first-title="3.5.x" second-title="3.6.0">

```kotlin
 post("/") {
    val payload = call.receiveNullable<Payload?>()
}
```

```kotlin
 post("/") {
    val payload = call.receive<Payload?>()
}
```

</compare>

이를 통해 예상되는 요청 규약(contract)을 타입에서 명시적으로 드러낼 수 있습니다.

* `receive<MyType>()`은 null이 아닌 값을 요구합니다.
* `receive<MyType?>()`은 유효한 값 또는 `null`을 허용합니다.

예를 들어, 엔드포인트에서 `null`을 받아 기존 알림 설정을 지울 수 있습니다.

```kotlin
@Serializable
data class NotificationPreferences(
    val emailEnabled: Boolean,
    val pushEnabled: Boolean,
)

put("/users/{userId}/notification-preferences") {
    val userId = call.parameters.getOrFail("userId")
    val preferences = call.receive<NotificationPreferences?>()

    if (preferences == null) {
        preferenceService.clear(userId)
    } else {
        preferenceService.update(userId, preferences)
    }

    call.respond(HttpStatusCode.NoContent)
}
```

Non-nullable 타입으로 `.receive()`를 호출하는 방식은 이전과 동일하게 동작합니다. 응답 API에는 영향을 주지 않습니다.

## Ktor Client {id="ktor-client"}

### 멀티플랫폼 프로젝트를 위한 기본 클라이언트 엔진 {id="default-engines"}

Ktor 3.6.0에서는 [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/get-started.html) 프로젝트를 위해 엄선된 HTTP [클라이언트 엔진](client-engines.md) 세트를 제공하는 `ktor-client-engine-defaults` 아티팩트가 도입되었습니다.

`commonMain` 소스 세트에 종속성을 추가합니다.

```kotlin
kotlin {
    sourceSets {
        commonMain {
            dependencies {
                api("io.ktor:ktor-client-engine-defaults:3.6.0")
            }
        }
    }
}
```

이제 엔진을 지정하지 않고도 `HttpClient`를 생성할 수 있습니다.

```kotlin
val client = HttpClient()
```

각 대상 플랫폼별로 Ktor는 `ktor-client-engine-defaults`에서 제공하는 기본 엔진을 사용합니다. 사용 가능한 엔진이 두 개 이상인 경우 클라이언트는 우선순위가 가장 높은 엔진을 선택합니다. `CIO`는 기본적으로 가장 낮은 우선순위를 가지므로, 클라이언트는 `CIO` 대신 사용 가능한 다른 엔진을 선택합니다.

현재 멀티플랫폼 프로젝트가 지원되는 모든 타깃에서 `CIO`를 사용하고 있다면, `CIO` 종속성을 `ktor-client-engine-defaults`로 교체하는 것을 고려해 보세요. 이를 통해 공통 소스 세트에서 엔진 선택 코드를 분리하면서도 각 플랫폼에 최적화된 기본 엔진을 Ktor가 제공하도록 할 수 있습니다.

특정 엔진의 설정이나 동작이 필요한 경우에는 여전히 [특정 클라이언트 엔진을 선언](client-dependencies.md#kmp-specific-engine)할 수 있습니다.

### JVM용 WebRTC 클라이언트 지원 {id="webrtc-jvm-support"}
<primary-label ref="experimental"/>

실험적인 [WebRTC 클라이언트](client-webrtc.md)가 이제 JVM 데스크톱 애플리케이션을 지원합니다.

JVM 구현체는 [webrtc-java](https://github.com/devopvoid/webrtc-java) 네이티브 WebRTC 바인딩을 사용하며 피어 연결, 오디오 및 비디오 트랙, 데이터 채널, 연결 통계에 대한 지원을 제공합니다.

현재 JVM 지원에는 플랫폼별 몇 가지 제한 사항이 있습니다. 자세한 내용은 [WebRTC 클라이언트](client-webrtc.md) 문서를 참조하세요.

### HTTP 캐싱을 위한 멀티플랫폼 파일 스토리지 {id="multiplatform-file-storage-for-http-caching"}

[`HttpCache`](client-caching.md) 플러그인이 이제 멀티플랫폼 파일 스토리지를 지원합니다.

기존에는 `FileStorage()` 함수가 JVM에서만 사용 가능했으며 `java.io.File`이 필요했습니다. 이제 `kotlinx-io` 라이브러리를 사용하여 지원되는 모든 플랫폼에서 `Path`를 통해 영구 파일 기반 캐싱을 구성할 수 있습니다.

<compare type="top-bottom" first-title="3.5.x" second-title="3.6.0">

```kotlin
val client = HttpClient {
    install(HttpCache) {
        val cacheFile = Files.createDirectories(Paths.get("build/cache")).toFile()
        publicStorage(FileStorage(cacheFile))
    }
}
```

```kotlin
val client = HttpClient {
    install(HttpCache) {
        publicStorage(FileStorage(Path("build/cache")))
    }
}
```

</compare>

이를 통해 `FileStorage()`에 전달하기 전에 `File`을 생성해야 했던 JVM 전용 설정이 대체됩니다.

### `ContentNegotiation`의 `Accept` 헤더 병합 제어 {id="control-accept-header-merging-in-contentnegotiation"}

이제 클라이언트 [`ContentNegotiation`](client-serialization.md) 플러그인이 등록된 콘텐츠 타입을 기존 `Accept` 헤더와 병합하는 방식을 제어할 수 있습니다.

기본적으로 `ContentNegotiation` 플러그인은 요청의 `Accept` 헤더에 아직 포함되지 않은 등록된 콘텐츠 타입을 추가합니다.

`Accept` 헤더를 명시적으로 설정하고 플러그인이 등록된 콘텐츠 타입을 추가하지 않도록 하려면 `acceptHeaderMergeStrategy` 속성을 `ContentTypeMergeStrategy.SkipIfPresent`로 설정합니다.

```kotlin
install(ContentNegotiation) {
    register(ContentType.Application.Json, noOpJsonConverter)
    acceptHeaderMergeStrategy = ContentTypeMergeStrategy.SkipIfPresent
}
```

`SkipIfPresent`를 사용하면 플러그인이 기존 `Accept` 헤더를 유지합니다. 요청에 `Accept` 헤더가 없는 경우 플러그인은 평소처럼 등록된 콘텐츠 타입을 추가합니다.

### CIO 클라이언트 엔진의 비동기 DNS 확인(Resolution) {id="asynchronous-dns-resolution-in-the-cio-client-engine"}

이번 릴리스에서는 [`CIO` 클라이언트 엔진](client-engines.md#cio)에 사용자 지정 DNS 확인 기능 지원이 추가되었습니다.

JVM 환경에서 `CIO` 엔진은 이전에 스레드를 차단할 수 있는 시스템 DNS 확인에 의존했습니다. 이제 `CIO` 엔진 구성의 `dnsResolver` 속성을 사용하여 DNS 확인 방식을 재정의할 수 있습니다.

예를 들어, `CioDnsResolver()` 함수를 사용하여 특정 DNS 서버를 통해 호스트 이름을 비동기적으로 확인하고 타임아웃을 설정할 수 있습니다.

```kotlin
HttpClient(CIO) {
    engine {
        dnsResolver = CioDnsResolver(
            server = "1.1.1.1",
            timeout = 3.seconds
        )
    }
}
```

### JavaScript 클라이언트 엔진의 `fetch()` 재정의 {id="override-fetch-in-the-javascript-client-engine"}

이제 [JavaScript 클라이언트 엔진](client-engines.md#js)에서 사용하는 전역 `fetch()` 함수를 재정의할 수 있습니다.

커스텀 구현을 제공하려면 `Js` 엔진 구성에서 `fetch` 속성을 설정합니다.

```kotlin
val client = HttpClient(Js) {
    engine {
        fetch = { url, init ->
            Promise.reject(IllegalStateException("Networking not available"))
        }
    }
}
```

이 기능은 [AWS WAF](https://aws.amazon.com/waf/)와 같이 자체적인 `fetch()` 래퍼를 제공하는 JavaScript 라이브러리와 연동할 때 유용합니다. `fetch`를 구성하지 않으면 엔진은 기존과 같이 전역 `fetch()` 함수를 사용합니다.

## 공통 {id="shared"}

### 쿠키 헤더 파싱 시 중복 쿠키 유지 {id="preserve-duplicate-cookies-when-parsing-cookie-headers"}

이제 동일한 이름을 가진 여러 쿠키가 포함된 `Cookie` 헤더를 파싱할 때 `parseClientCookies()` 함수를 사용할 수 있습니다.

`Map<String, String>`을 반환하여 중복된 이름에 대해 마지막 값만 유지하는 `parseClientCookiesHeader()` 함수와 달리, `parseClientCookies()` 함수는 `List<Pair<String, String>>`을 반환하며 중복 쿠키 항목을 그대로 유지합니다.

```kotlin
val header = "name=value1; name=value2"

val cookies = parseClientCookies(header)
// [("name", "value1"), ("name", "value2")]

val cookieMap = parseClientCookiesHeader(header)
// {"name"="value2"}
```

중복된 쿠키 이름을 보존해야 하는 경우 `parseClientCookies()`를 사용하세요.