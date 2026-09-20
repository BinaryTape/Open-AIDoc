[//]: # (title: OpenID Connect 리소스 서버)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth-oidc"/>

<tldr>
<p>
<b>필수 종속성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor는 Kotlin/Native를 지원하여 추가 런타임이나 가상 머신 없이 서버를 실행할 수 있도록 합니다.">Native 서버</Links> 지원</b>: ✖️
</p>
</tldr>

<link-summary>
OpenID Connect 제공자가 발급한 액세스 토큰을 로컬에서 JWT로 검증하거나 토큰 인트로스펙션(token introspection)을 통해 검증합니다.
</link-summary>

리소스 서버는 다른 주체가 발급한 토큰을 수락하는 API입니다. 리소스 서버는 로그인 페이지를 제공하거나 브라우저 세션을 사용하지 않습니다. 클라이언트가 액세스 토큰을 전송하면, 서버는 보호된 리소스에 대한 접근을 허용하기 전에 해당 토큰을 검증합니다.

> 브라우저 로그인에 대한 자세한 내용은 [OpenID Connect 브라우저 로그인](server-oidc-browser-login.md)을 참고하세요.
> 
> 디스커버리(discovery), 토큰 유형 및 플러그인 설정에 대한 내용은 [OpenID Connect](server-oidc.md)를 참고하세요.
> 
{style="tip"}

<note>
    <p>
        OpenID Connect 플러그인은 실험적 기능이며, JVM에서만 사용할 수 있고 <code>@OptIn(ExperimentalKtorApi::class)</code>가 필요합니다. 이 플러그인은 Kotlin 컨텍스트 파라미터(context parameters)를 필요로 하는 <Links href="/ktor/server-typed-auth" summary="타입 세이프 인증 체계 API는 프린시절 타입을 라우트에 바인딩하므로 캐스팅이나 null 검사 없이 null이 아닌 프린시절을 읽을 수 있습니다.">타입 세이프(type-safe) 인증 API</Links>를 사용합니다.
    </p>
</note>

## JWT 액세스 토큰 검증 {id="jwt-bearer"}

많은 제공자가 액세스 토큰을 서명된 JSON Web Token(JWT) 형태로 발급합니다. API에서 기대하는 `audience`를 설정한 후 `provider.jwtBearer`를 사용하여 라우트를 보호하세요.

```kotlin
suspend fun Application.module() {
    val oidc = install(Oidc)

    val auth0 = oidc.identityProvider("auth0") {
        issuer = "https://my-tenant.auth0.com"
        bearer {
            audience = setOf("https://api.example.com")
        }
    }

    routing {
        authenticateWith(auth0.jwtBearer) {
            get("/orders") {
                val subject = call.principal.claims.subject
                call.respondText("Hello $subject")
            }
        }
    }
}
```

`audience` 프로퍼티는 필수 항목이며 비어 있어서는 안 됩니다. 이 값은 제공자 측에서 식별하는 API를 나타내며, 대개 OAuth 클라이언트 ID와 다릅니다.

플러그인은 `Authorization: Bearer` 헤더에서 토큰을 읽고, 제공자의 JWKS 엔드포인트에서 서명 키를 가져와 서명, 발급자(`issuer`), 대상자(`audience`), 만료 여부를 확인합니다.

## 불투명 토큰 검증 {id="introspection"}

모든 제공자가 JWT를 발급하는 것은 아닙니다. 불투명 토큰(opaque token)은 읽을 수 있는 내용이 없는 무작위 문자열이므로 서버에서 로컬로 검증할 수 없습니다. 이는 의도된 절충안(trade-off)입니다. 불투명 토큰은 도청되더라도 정보가 유출되지 않으며, 토큰을 사용할 때마다 제공자에게 조회하므로 즉시 토큰을 폐기하여 작동을 중지시킬 수 있습니다. 반면 JWT는 만료될 때까지 유효합니다.

불투명 토큰을 검증하기 위해 서버는 [RFC 7662](https://www.rfc-editor.org/rfc/rfc7662)에 정의된 *토큰 인트로스펙션(token introspection)*을 사용합니다. 서버는 인트로스펙션 엔드포인트로 토큰을 보내고 자신을 인증한 뒤, 토큰의 활성 여부와 주체(subject), 스코프(scope), 클라이언트, 만료 시간 등의 관련 메타데이터가 포함된 응답을 받습니다.

`introspection { }` 블록을 추가하고 `provider.introspectionBearer`를 사용하세요.

```kotlin
val auth0Issuer = "https://my-tenant.auth0.com"

val auth0 = oidc.identityProvider("auth0") {
    issuer = auth0Issuer
    bearer {
        audience = setOf("https://api.example.com")
        introspection {
            endpoint = "$auth0Issuer/oauth/introspect"
            clientId = "api-client"
            clientSecret = System.getenv("INTROSPECTION_SECRET")
        }
    }
}

routing {
    authenticateWith(auth0.introspectionBearer) {
        get("/orders") {
            val result = call.principal.introspection
            call.respondText("Hello ${result.username}")
        }
    }
}
```

인트로스펙션 엔드포인트는 OpenID Connect 디스커버리 문서의 일부가 아니므로, 제공자의 문서를 참조하여 명시적으로 구성해야 합니다. 위의 예제에서는 바깥쪽의 `issuer` 프로퍼티를 `introspection { }` 블록 내에서 사용할 수 없기 때문에 발급자 URL을 로컬 변수에 저장했습니다.

`clientId` 및 `clientSecret` 프로퍼티는 사용자가 아닌 제공자에게 API를 식별시키는 용도입니다. 인트로스펙션은 권한이 필요한 작업이므로 대부분의 제공자는 이를 수행할 수 있는 권한을 가진 별도의 클라이언트를 요구합니다.

기본적으로 플러그인은 HTTP Basic 인증을 사용합니다. 대신 폼 본문(form body)으로 자격 증명을 전송하려면 `authMethod = ClientAuthenticationMethod.ClientSecretPost`를 설정하세요.

토큰은 응답에 `active: true`가 포함되고, 토큰의 대상자(audience)가 설정한 `audience`와 겹치며, 반환된 모든 `iss`, `exp`, `nbf` 값이 유효한 경우에만 수락됩니다.

인트로스펙션은 각 인증 시도마다 네트워크 요청이 필요하며 제공자의 가용성에 의존합니다. 제공자가 JWT를 발급하는 경우에는 [JWT 검증](#jwt-bearer)을 우선적으로 사용하고, 그렇지 않거나 지연 시간보다 즉각적인 토큰 폐기가 더 중요한 경우에 인트로스펙션을 사용하세요.

## 다른 위치에서 토큰 읽기 {id="token-extractor"}

기본적으로 플러그인은 `Authorization` 헤더에서 토큰을 읽습니다. 다른 위치에서 토큰을 읽으려면 커스텀 추출기를 설정하세요.

```kotlin
bearer {
    audience = setOf("https://api.example.com")
    tokenExtractor = { call.request.cookies["access_token"] }
}
```

토큰을 사용할 수 없는 경우 `null`을 반환하세요. 그러면 해당 요청은 인증되지 않은 상태로 실패합니다.

## 보호된 리소스 메타데이터 게시 {id="protected-resource"}

[RFC 9728](https://www.rfc-editor.org/rfc/rfc9728)을 사용하면 클라이언트가 API에서 신뢰하는 권한 부여 서버(authorization server)를 사전에 설정해 두는 대신, 동적으로 검색할 수 있습니다. 이는 머신 간(M2M) 클라이언트 및 MCP 서버에 유용할 수 있습니다.

플러그인을 설치할 때 보호된 리소스 메타데이터(protected resource metadata)를 설정하세요.

```kotlin
val oidc = install(Oidc) {
    protectedResource("https://api.example.com") {
        resourceName = "Orders API"
    }
}
```

이렇게 하면 `/.well-known/oauth-protected-resource` 경로에서 문서가 제공됩니다. 플러그인은 등록된 제공자로부터 다음 값을 도출합니다.

* `authorizationServers` — `bearer { }` 블록이 있는 모든 제공자의 발급자(issuer).
* `scopesSupported` — 해당 제공자들이 요청하는 스코프(scope).
* `bearerMethodsSupported` — 제공자가 표준 인증 헤더를 읽는 경우 `header`.

이러한 프로퍼티를 명시적으로 설정하면 도출된 값을 재정의(override)할 수 있습니다.

보호된 리소스를 구성하면 챌린지(challenge) 응답도 변경됩니다. 거부된 요청에는 `WWW-Authenticate: Bearer` 헤더 대신 메타데이터 문서를 가리키는 포인터가 포함됩니다.

```http
WWW-Authenticate: Bearer resource_metadata="https://api.example.com/.well-known/oauth-protected-resource"
```

## 인증 오류 처리 {id="errors"}

### 인증 오류 응답 {id="errors-response"}

거부된 토큰은 `WWW-Authenticate: Bearer` 헤더와 함께 `401 Unauthorized`를 생성합니다.

챌린지에는 `error`, `error_description`, `realm` 파라미터가 포함되지 않습니다. 따라서 클라이언트는 토큰 누락과 토큰 만료를 구분할 수 없으며, 잘못된 서명과 잘못된 대상자(audience)도 구별할 수 없습니다. 거부된 토큰을 진단하는 방법에 대한 자세한 내용은 [토큰이 거부된 원인 찾기](#errors-logging)를 참고하세요.

다음 조건이 발생하면 `401 Unauthorized`가 생성됩니다.

| 원인                                                | 비고                                               |
|----------------------------------------------------|----------------------------------------------------|
| 토큰이 없거나 잘못된 형식의 `Authorization` 헤더       |                                                    |
| 잘못된 서명                                         |                                                    |
| 잘못된 발급자(issuer) 또는 잘못된 대상자(audience)   |                                                    |
| 만료된 토큰                                         | `clockSkew` 허용 오차 이후                         |
| `none`, `HS256`, `HS384`, 또는 `HS512` 알고리즘     | 항상 거부됨                                        |
| `allowedAlgorithms`에 포함되지 않은 알고리즘        |                                                    |
| 알 수 없는 `kid`                                    | 가져온 JWKS 문서에 해당 키가 존재하지 않음          |
| 인트로스펙션 결과로 `active: false`가 반환됨        |                                                    |
| 인트로스펙션에서 잘못되었거나 만료된 audience가 반환됨 |                                                    |

알 수 없는 `kid`는 토큰이 참조하는 키가 검색된 JWKS 문서에 없음을 의미하며, 따라서 `401 Unauthorized`가 발생합니다.

### 서버 측 검증 실패 처리 {id="errors-500"}

일부 실패는 플러그인이 토큰 자체의 무효성을 확인하기도 전에 토큰 검증을 완료하지 못하게 만듭니다. 이러한 오류는 `500 Internal Server Error`를 발생시킵니다.

| 오류                                                                       | 예외                                                          |
|----------------------------------------------------------------------------|----------------------------------------------------------------|
| JWKS 엔드포인트에 연결할 수 없음                                             | `OidcSigningKeyUnavailableException`                           |
| JWKS 문서를 파싱할 수 없음                                                   | `OidcSigningKeyUnavailableException`                           |
| JWKS 요청 속도 제한(rate limit)이 초과됨                                    | `OidcSigningKeyUnavailableException`                           |
| 인트로스펙션 엔드포인트에 연결할 수 없거나 2xx가 아닌 상태 코드로 응답함      | `ResponseException`, `IOException` 또는 역직렬화 오류          |
| `fetchUserInfo` 요청이 전송 계층에서 실패함                                 | 상동                                                           |
| 세션 토큰 갱신이 전송 계층에서 실패함                                       | 상동. [로그인 오류 처리](server-oidc-browser-login.md#errors) 참고 |

따라서 아이덴티티 제공자(IdP)에 장애가 발생하면 인증된 요청이 `500 Internal Server Error`로 실패할 수 있습니다.

JWK 요청 속도 제한(rate limiting)은 기본적으로 활성화되어 있으며, 이로 인해 서명 키 조회 실패가 발생할 수도 있습니다. 키 조회는 분당 10회 요청으로 제한되며, 캐시에 없는 kid에 대한 조회는 이 제한 횟수에 포함됩니다. 키 교체(key rotation) 중과 같이 이전에 본 적 없는 키로 서명된 토큰이 급증하면 제한을 초과할 수 있습니다.

이 제한을 늘리려면 `jwkRateLimit`을 설정하세요.

```kotlin
jwt { 
    jwkRateLimit(bucketSize = 60)
}
```

더 적절한 응답을 반환하려면 [`StatusPages`](server-status-pages.md) 플러그인을 설치하세요.

```kotlin
install(StatusPages) {
    exception<OidcSigningKeyUnavailableException> { call, cause ->
        val log = call.application.log
        log.error("Signing key unavailable", cause)
        call.respond(HttpStatusCode.ServiceUnavailable)
    }
}
```

`503 Service Unavailable`은 아이덴티티 제공자가 복구된 후 요청이 성공할 수 있음을 나타냅니다.

전용 예외 타입을 가지고 있는 것은 서명 키 실패뿐이며, 이처럼 전역에서 캐치할 가치가 있는 것도 이 예외뿐입니다. 나머지는 다른 [HTTP 클라이언트](client-create-and-configure.md) 작업에서도 사용되는 `ResponseException` 또는 `IOException`으로 나타납니다. 이러한 예외 타입을 전역적으로 처리하면 무관한 실패가 제공자 장애로 보고될 수 있으므로 전역 처리는 피해야 합니다. 해당 예외가 발생할 수 있는 작업과 가까운 곳에서 처리하거나, `500 Internal Server Error`가 발생하도록 두는 것이 좋습니다.

### 토큰이 거부된 원인 찾기 {id="errors-logging"}

토큰 거부 상세 정보는 `TRACE` 레벨로 기록됩니다. 이를 활성화하려면 플러그인 패키지에 대한 로깅을 구성하세요. Logback을 사용하는 경우 보통 <Path>src/main/resources/logback.xml</Path>에 위치한 <Path>logback.xml</Path>에 다음을 추가합니다.

```xml

<configuration>
    <logger name="io.ktor.server.auth.oidc" level="TRACE"/>
</configuration>
```

각 제공자는 `io.ktor.server.auth.oidc.OidcProvider[<name>]` 아래에 로그를 남기므로, 다른 제공자의 노이즈 없이 단일 제공자에 대해서만 로그 레벨을 올릴 수 있습니다.

로그 메시지에는 실패한 검증 항목이 명시됩니다(예: `JWT algorithm HS256 is not accepted` 또는 `JWT kid abc123 does not match any JWK`).

### 401 응답 커스터마이징 {id="errors-custom"}

`bearer {}` 설정에서는 인증 실패 핸들러를 제공하지 않습니다. 응답을 커스터마이징하려면 보호된 라우트에서 `onUnauthorized` 핸들러를 설정하세요.

```kotlin
routing {
    authenticateWith(
        auth0.jwtBearer,
        onUnauthorized = { cause ->
            call.respond(
                HttpStatusCode.Unauthorized,
                mapOf("error" to "invalid_token")
            )
        }
    ) {
        get("/orders") {
            call.respondText("ok")
        }
    }
}
```

라우트 수준의 핸들러는 `WWW-Authenticate` 헤더를 포함하여 내장된 응답을 완전히 대체합니다. [보호된 리소스 메타데이터](#protected-resource)를 구성한 경우 `resource_metadata` 파라미터도 함께 제거됩니다. 클라이언트가 이 헤더에 의존하는 경우 명시적으로 헤더를 추가하세요.

여러 인증 체계를 수락하는 라우트의 경우 `authenticateWithAnyOf(..., onUnauthorized = ...)`를 사용하세요.

### 클라이언트 ID를 audience로 재사용하지 않기 {id="audience-overlap"}

제공자가 `token_use` 또는 `typ` 클레임으로 토큰을 표시하지 않는 한, `bearer { audience }`에 `oauth { }` 블록의 `clientId`가 포함되어 있으면 로그인을 위해 발급된 ID 토큰이 API 액세스 토큰으로 통과될 수 있습니다. 모든 제공자가 이를 표시하는 것은 아닙니다.

API에 고유한 리소스 식별자를 할당하세요.

```kotlin
oidc.identityProvider("auth0") {
    issuer = "https://my-tenant.auth0.com"
    bearer {
        // 로그인 클라이언트 ID가 아닌 리소스 식별자
        audience = setOf("https://api.example.com")
    }
    oauth {
        clientId = "web-client"
        clientSecret = System.getenv("WEB_CLIENT_SECRET")
    }
}
```

플러그인은 시작 시 API의 audience와 OAuth 클라이언트 ID 간의 중복을 감지하면 경고를 기록합니다.

> 디스커버리, 토큰 검증 설정 및 테스트에 대해 알아보려면 [OpenID Connect](server-oidc.md)를 참고하세요.
> 
> 동일한 제공자를 통한 브라우저 로그인에 대한 내용은 [OpenID Connect 브라우저 로그인](server-oidc-browser-login.md)을 참고하세요.
> 
{style="tip"}