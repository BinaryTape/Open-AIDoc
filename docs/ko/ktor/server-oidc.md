[//]: # (title: OpenID Connect)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth-oidc"/>

<tldr>
<p>
<b>필수 종속성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor는 Kotlin/Native를 지원하며 추가 런타임이나 가상 머신 없이 서버를 실행할 수 있도록 해줍니다.">Native 서버</Links> 지원</b>: ✖️
</p>
</tldr>

<link-summary>
OpenID Connect 플러그인을 사용하면 제공자의 디스커버리(discovery) 문서를 활용하여 발급자(issuer) URL로부터 토큰 유효성 검사 및 브라우저 로그인을 구성할 수 있습니다.
</link-summary>

[OpenID Connect](https://openid.net/developers/how-connect-works/)(OIDC)는 OAuth 2.0 기반의 신원 확인 계층(identity layer)입니다.
OAuth 2.0이 위임된 인가(authorization) 프레임워크를 제공하는 반면, OIDC는 클라이언트가 최종 사용자의 신원을 확인할 수 있도록 하여 인증(authentication) 기능을 추가합니다. OIDC는 ID 토큰을 통해 신원 정보를 제공합니다.

`Oidc` 플러그인은 다음과 같은 일반적인 시나리오를 지원합니다:

* **API 보호.** 보호된 라우트에 대한 접근을 허용하기 전에 OpenID Connect 제공자가 발급한 토큰의 유효성을 검사합니다. 자세한 내용은 [OpenID Connect 리소스 서버](server-oidc-resource-server.md)를 참고하세요.
* **사용자 로그인.** 인증을 위해 사용자를 OpenID Connect 제공자로 리다이렉트하고 로그인 후 콜백을 처리합니다. 자세한 내용은 [OpenID Connect 브라우저 로그인](server-oidc-browser-login.md)을 참고하세요.

두 시나리오 모두 제공자의 발급자(issuer) URL에서 시작합니다. 플러그인은 제공자의 디스커버리 문서를 읽고 엔드포인트, 서명 키 및 지원되는 알고리즘을 파악합니다.

<note>
    <p>
        OpenID Connect 플러그인은 실험적(experimental) 기능이며, JVM에서만 사용 가능하고 <code>@OptIn(ExperimentalKtorApi::class)</code>가 필요합니다. 이 플러그인은 Kotlin 컨텍스트 파라미터가 필요한 <Links href="/ktor/server-typed-auth" summary="타입 세이프 인증 스키마 API는 프린시펄 타입을 라우트에 바인딩하므로 캐스팅이나 널 검사 없이 null이 아닌 프린시펄을 읽을 수 있습니다.">타입 세이프 인증 API</Links>를 사용합니다.
    </p>
</note>

## 종속성 추가 {id="add_dependencies"}

`Oidc` 플러그인을 사용하려면 빌드 스크립트에 `%artifact_name%` 아티팩트를 추가하세요:

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

> 이 아티팩트는 JVM에서만 사용할 수 있습니다.
> 
{style="note"}

## 신원 제공자(Identity Provider) 등록 {id="register"}

`Oidc` 플러그인을 설치하고 각 발급자에 대한 신원 제공자를 등록합니다:

```kotlin
suspend fun Application.module() {
    val oidc = install(Oidc)

    val google = oidc.identityProvider("google") {
        issuer = "https://accounts.google.com"
        bearer {
            audience = setOf("my-api")
        }
    }
}
```

`identityProvider()` 함수는 결과를 반환하기 전에 디스커버리 문서를 가져오므로, [suspend 애플리케이션 모듈](server-modules.md#concurrent-modules)과 같은 일시 중단 함수(suspending function) 내에서 호출해야 합니다.

제공자 이름은 생성된 라우트 경로 및 인증 스키마 이름에 사용됩니다. 이 이름은 소문자, 숫자, 하이픈(-)으로 구분된 세그먼트로 구성되어야 합니다. 예를 들어, `google` 및 `my-idp`는 유효한 이름이지만 `Google` 및 `my_idp`는 유효하지 않습니다.

각 제공자 이름과 발급자(issuer)는 고유해야 합니다. 동일한 이름이나 발급자를 두 번 이상 등록하면 `IllegalArgumentException`이 발생합니다.

`identityProvider()` 함수는 라우트를 보호하는 데 사용하는 `OidcProvider`를 반환합니다. 구성에 따라 제공자는 `authenticateWith()`와 함께 사용할 수 있는 최대 세 가지 인증 스키마를 노출합니다:

| 구성 방식                          | 스키마                            | 보호 대상                              |
|--------------------------------|--------------------------------|---------------------------------------|
| `bearer { }`                   | `provider.jwtBearer`           | JWT 액세스 토큰을 수신하는 API          |
| `bearer { introspection { } }` | `provider.introspectionBearer` | 불투명(opaque) 액세스 토큰을 수신하는 API |
| `oauth { }`                    | `provider.session`             | 브라우저 로그인 기반의 라우트           |

구성되지 않은 스키마를 읽으려고 하면 `IllegalStateException`이 발생합니다. 예외 메시지에는 해당 스키마를 활성화하는 데 필요한 구성 블록이 표시됩니다.

> 자세한 내용은 [OpenID Connect 리소스 서버](server-oidc-resource-server.md) 및 [OpenID Connect 브라우저 로그인](server-oidc-browser-login.md)을 참고하세요.
> 
{style="tip"}

## 디스커버리 동작 방식 {id="discovery"}

플러그인은 `<issuer>/.well-known/openid-configuration`을 가져온 다음, 여기에서 제공자 엔드포인트와 서명 키를 읽습니다. 인가 엔드포인트(authorization endpoint), 토큰 엔드포인트(token endpoint) 또는 JWKS URL을 수동으로 구성할 필요가 없습니다.

디스커버리 문서의 `issuer` 값은 끝에 붙는 슬래시(`/`)를 포함하여 구성된 `issuer`와 정확히 일치해야 합니다. 이 비교는 보안 검사이므로 플러그인은 두 값 모두 정규화하지 않습니다.

초기 요청 이후 플러그인은 `discoveryRefreshInterval`(기본값 15분)로 지정된 간격마다 문서를 다시 읽습니다. 이를 통해 애플리케이션을 다시 시작하지 않고도 키 로테이션(key rotation)을 반영할 수 있습니다:

```kotlin
val oidc = install(Oidc) {
    discoveryRefreshInterval = 15.minutes
    initialDiscoveryAttempts = 3
    initialDiscoveryRetryDelay = 5.seconds
}
```

주기적인 디스커버리 갱신을 비활성화하려면 `discoveryRefreshInterval`을 `Duration.ZERO`로 설정하세요.

## 디스커버리 실패 처리 {id="discovery-errors"}

디스커버리 실패는 [애플리케이션 시작 중](#discovery-errors-startup)과 [애플리케이션 실행 중](#discovery-errors-runtime)에 서로 다르게 처리됩니다.

### 시작 시 {id="discovery-errors-startup"}

초기 디스커버리 요청이 실패하면 `identityProvider()`에서 `OidcDiscoveryException`이 발생합니다. 예외가 모듈 함수 밖으로 전파되며 애플리케이션이 시작되지 않습니다.

기본적으로 플러그인은 디스커버리를 1회 시도합니다. 시작하는 동안 제공자를 일시적으로 사용할 수 없는 상황이 발생할 수 있다면 시도 횟수를 늘리세요:

```kotlin
val oidc = install(Oidc) {
    initialDiscoveryAttempts = 5
    initialDiscoveryRetryDelay = 3.seconds
}
```

재시도는 네트워크 및 HTTP 오류에 적용됩니다. 발급자 불일치나 디스커버리 문서에 필수 엔드포인트가 누락된 경우와 같은 구성 오류에는 재시도가 적용되지 않으며, 이러한 오류는 `IllegalArgumentException`과 함께 즉시 실패합니다.

### 실행 중 {id="discovery-errors-runtime"}

주기적인 갱신이 실패하면 플러그인은 가장 최근에 가져온 디스커버리 문서를 계속 사용합니다. `discoveryRefreshFailureDelay`(기본값 1분) 후에 재시도하며 성공할 때까지 계속 재시도합니다.

갱신 실패는 기본적으로 로깅되지 않습니다. 이를 모니터링하려면 `OidcMetadataRefreshFailed` 이벤트를 구독하세요:

```kotlin
monitor.subscribe(OidcMetadataRefreshFailed) { failure ->
    log.warn(
        "OIDC refresh failed for {} ({} in a row)",
        failure.provider.name,
        failure.consecutiveFailures,
        failure.cause
    )
}
```

## 정적 메타데이터 구성 {id="static-metadata"}

제공자 엔드포인트를 미리 알고 있거나 테스트를 위해 정적 구성이 필요한 경우 `metadata` 프로퍼티를 사용하세요:

```kotlin
val provider = oidc.identityProvider("static") {
    issuer = issuerUrl
    metadata = OpenIdProviderMetadata(
        issuer = issuerUrl,
        authorizationEndpoint = "$issuerUrl/authorize",
        tokenEndpoint = "$issuerUrl/token",
        jwksUri = "$issuerUrl/jwks",
    )
}
```

`metadata`를 설정하면 초기 디스커버리 요청을 건너뛰고 해당 제공자에 대한 주기적 디스커버리 갱신이 비활성화됩니다. 이후에는 키 로테이션 후를 포함하여 메타데이터를 최신 상태로 유지하는 책임이 애플리케이션에 있습니다.

정적 문서의 발급자는 여전히 구성된 `issuer`와 일치해야 합니다. JWKS 엔드포인트는 여전히 HTTP를 통해 접근됩니다. 테스트 중에 해당 요청을 방지하려면 [외부 제공자 없이 테스트하기](#testing)를 참고하세요.

## 토큰 타입 {id="tokens"}

각 인증 [스키마](#register)는 특정 프린시펄(principal) 타입을 생성하므로, 라우트는 자신이 전달받은 객체를 항상 정확히 파악할 수 있습니다:

| 스키마                            | 프린시펄                 | 출처                                    |
|--------------------------------|--------------------------|-----------------------------------------|
| `provider.session`             | `OidcToken.Id`           | 브라우저 로그인                            |
| `provider.jwtBearer`           | `OidcToken.Access`       | 로컬에서 검증된 JWT 액세스 토큰            |
| `provider.introspectionBearer` | `OidcToken.Introspected` | 제공자가 확인한 액세스 토큰                 |

`OidcToken.Id` 및 `OidcToken.Access`는 원시 JWT 클레임을 위한 `claims`와 `subject`, `name`, `email`과 같이 정규화된 사용자 필드를 위한 `userInfo`를 노출합니다. `OidcToken.Introspected`는 대신 `introspection`을 노출합니다.

## 토큰을 애플리케이션 프린시펄로 매핑 {id="map-principal"}

라우트는 OIDC 토큰보다는 애플리케이션 전용 프린시펄을 주로 사용합니다. `.mapPrincipal()` 함수를 사용하여 애플리케이션 타입을 생성하는 새 인증 스키마를 만들 수 있습니다:

```kotlin
data class AppUser(val id: String, val email: String?)

val apiAuth = google.jwtBearer.mapPrincipal { token ->
    val id = token.claims.subject ?: return@mapPrincipal null
    AppUser(id, token.userInfo?.email)
}

routing {
    authenticateWith(apiAuth) {
        get("/me") {
            call.respond(call.principal.id)
        }
    }
}
```

`null`을 반환하면 요청이 거부됩니다. 이 동작을 사용하여 유효한 토큰이라 하더라도 해당하는 애플리케이션 계정이 더 이상 존재하지 않는 경우 요청을 거부할 수 있습니다.

프린시펄 매핑은 OAuth 콜백 중이 아니라 스키마가 라우트를 인증할 때 실행됩니다. 예를 들어 로그인한 사용자가 나중에 데이터베이스에서 삭제되면, 유효한 애플리케이션 세션을 유지하는 대신 다음 요청 시 거부됩니다.

## 구성 파일에서 설정하기 {id="config-file"}

클라이언트 시크릿(client secret)은 소스 코드 대신 구성 파일에 저장하세요. 예를 들어 <Path>application.yaml</Path> 파일에 다음과 같이 작성합니다:

```yaml
ktor:
  oidc:
    google:
      issuer: "https://accounts.google.com"
      clientId: "$GOOGLE_CLIENT_ID"
      clientSecret: "$GOOGLE_CLIENT_SECRET"
      scopes: ["openid", "profile", "email"]
```

`$GOOGLE_CLIENT_ID` 및 `$GOOGLE_CLIENT_SECRET`은 환경 변수를 참조합니다.

> 구성 파일 작업에 대한 자세한 내용은 [파일 구성](server-configuration-file.topic)을 참고하세요.
> 
{style="tip"}

그런 다음 해당 구성을 `OidcEnvConfig`로 읽을 수 있습니다:

```kotlin
val env = environment.config
    .property("ktor.oidc.google")
    .getAs<OidcEnvConfig>()

val google = oidc.identityProvider("google") {
    issuer = env.issuer
    oauth {
        clientId = env.clientId
        clientSecret = env.clientSecret
        scopes = env.scopes
    }
}
```

플러그인이 이 구성을 자동으로 로드하지는 않습니다. `OidcEnvConfig`는 값을 읽기 위한 편의 타입입니다. 값이 어디에서 오고 어떻게 적용되는지는 애플리케이션에서 결정합니다.

## 토큰 유효성 검사 구성 {id="jwt-config"}

`jwt {}` 블록을 사용하여 토큰 검증 방식을 구성합니다. 기본값이 안전하게 설정되어 있으므로 꼭 필요한 경우에만 변경하세요:

```kotlin
oidc.identityProvider("google") {
    issuer = "https://accounts.google.com"
    jwt {
        clockSkew = 30.seconds
        allowedAlgorithms = setOf(
            SignatureAlgorithm.RSA_SHA_256
        )
        jwkCache(maxEntries = 10, duration = 1.hours)
        jwkRateLimit(bucketSize = 10)
    }
}
```

* `clockSkew`는 `exp` 및 `nbf`에 적용되는 시간 허용 오차를 지정합니다. 기본값은 60초입니다.
* `allowedAlgorithms`는 허용되는 서명 알고리즘을 제한합니다. 이 옵션을 설정하지 않으면 ID 토큰은 디스커버리 문서에서 알리는 알고리즘으로 대체(fallback)됩니다. RSA 및 EC 알고리즘만 지정할 수 있습니다.
* `jwkCache` 및 `jwkRateLimit`는 JWKS 엔드포인트를 쿼리하는 빈도를 제어합니다. 처리율 제한(Rate limiting)은 기본적으로 분당 10개 요청으로 활성화되어 있습니다. 제한을 초과하면 토큰을 거부하는 대신 `OidcSigningKeyUnavailableException`과 함께 요청이 실패합니다. 예상되는 최대 캐시 미스 트래픽을 수용할 수 있도록 제한을 구성하세요. 자세한 내용은 [서버 측 유효성 검사 실패 처리](server-oidc-resource-server.md#errors-500)를 참고하세요.

구성 내용과 관계없이 `none` 알고리즘과 모든 HMAC 알고리즘(`HS256`, `HS384`, `HS512`)은 항상 거부됩니다. 제3자가 발급한 토큰을 검증하는 데 공유 시크릿(shared secret)을 사용하는 것은 안전하지 않습니다.

`jwkProviderFactory`는 `jwkCache` 또는 `jwkRateLimit`와 결합하여 사용할 수 없습니다. 커스텀 JWK 제공자 팩토리를 제공하는 경우, 캐싱에 대한 책임은 애플리케이션에 있습니다.

## 외부 제공자 없이 테스트하기 {id="testing"}

`OpenIdTestKeys`는 인메모리 키 쌍을 생성하고 해당 키로 서명된 토큰을 발급합니다. 정적 메타데이터와 결합하면 네트워크 호출 없이 완전한 OIDC 환경을 구축하면서도 실제 발급자, 대상(audience), 알고리즘 및 서명 검사를 실행할 수 있습니다:

```kotlin
@Test
fun `rejects a token for another audience`() = testApplication {
    val issuerUrl = "https://test-issuer"
    val keys = OpenIdTestKeys.rsa(
        issuer = issuerUrl,
        audience = "my-api"
    )

    application {
        val oidc = install(Oidc)
        val provider = oidc.identityProvider("test") {
            issuer = issuerUrl
            metadata = OpenIdProviderMetadata(
                issuer = issuerUrl,
                authorizationEndpoint = "$issuerUrl/authorize",
                tokenEndpoint = "$issuerUrl/token",
                jwksUri = "$issuerUrl/jwks",
            )
            jwt(keys)
            bearer { audience = setOf("my-api") }
        }

        routing {
            authenticateWith(provider.jwtBearer) {
                get("/protected") {
                    call.respondText(call.principal.value)
                }
            }
        }
    }

    val token = keys.accessToken {
        subject = "user-1"
        audience = "some-other-api"
    }

    val response = client.get("/protected") {
        bearerAuth(token)
    }

    assertEquals(HttpStatusCode.Unauthorized, response.status)
}
```

`jwt(keys)` 함수는 인메모리 공개 키를 사용하도록 검증기(verifier)를 구성하고 허용되는 알고리즘을 제한하므로 JWKS 요청이 발생하지 않습니다.

액세스 토큰을 생성하려면 `keys.accessToken { }`을 사용하고, ID 토큰에는 `keys.idToken(subject) { }`를 사용하세요. 둘 다 `issuer`, `audience`, `expiresAt` 및 커스텀 `claim()` 값을 받습니다.

EC 서명을 테스트하려면 `rsa()` 함수 대신 `OpenIdTestKeys.ec()` 함수를 사용하세요.

## 프로덕션을 위한 보안 설정 검토 {id="production"}

플러그인은 다음과 같은 기본 보안 설정을 적용합니다:

* 모든 로그인에 PKCE가 활성화되며 `S256`을 사용합니다.
* 인가 상태는 유효 기간이 10분인 AES-256-GCM 암호화 쿠키에 저장됩니다.
* 세션 쿠키는 `HttpOnly` 및 `SameSite=Lax`이며, 개발 모드 외부에서는 `Secure`가 적용됩니다.
* 플러그인에 의해 생성된 라우트에 CSRF 보호가 활성화됩니다.
* 모든 ID 토큰에 대해 `nonce` 및 `at_hash`가 확인됩니다.

프로덕션에 배포하기 전에 다음 설정을 검토하세요:

| 설정                           | 기본값                        | 변경해야 하는 이유                                                                                |
|--------------------------------|------------------------------|-------------------------------------------------------------------------------------------------|
| `oauth { stateEncryptionKey }` | 프로세스당 새로운 무작위 키      | 다시 시작 시 진행 중인 로그인이 중단되고 여러 인스턴스 간에 실패함                                    |
| `sessions { storage }`         | `SessionStorageMemory()`     | 다시 시작 시 세션이 손실되며 인스턴스 간에 공유되지 않음                                           |
| `bearer { audience }`          | —                            | OAuth `clientId`를 포함해서는 안 됨. [클라이언트 ID를 대상으로 재사용하지 마세요](server-oidc-resource-server.md#audience-overlap) 참고 |
| `initialDiscoveryAttempts`     | `1`                          | 제공자의 응답이 한 번만 지연되어도 애플리케이션 시작이 차단될 수 있음                                   |
| `jwt { clockSkew }`            | `60.seconds`                 | 시계가 정밀하게 동기화되어 있는 경우 값을 낮춤                                                     |
| `discoveryRefreshInterval`     | `15.minutes`                 | 제공자가 키를 자주 교체하는 경우 간격을 단축함                                                     |
| `codeChallengeMethod`          | `S256`                       | PKCE를 활성화된 상태로 유지                                                                       |
| `sessions { csrfProtection }`  | `originMatchesHost()`        | CSRF 보호를 활성화된 상태로 유지                                                                  |

처음 세 가지 설정이 기본값을 사용하는 경우 플러그인은 시작 시 경고를 기록합니다. 프로덕션 환경에서는 이러한 경고를 오류로 취급하는 것을 고려하세요.

## 구현된 사양 {id="specs"}

플러그인은 인가 코드 플로우(authorization code flow) 및 해당 기능에서 사용되는 관련 사양들을 구현합니다:

* [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html) — `nonce`, `azp`, `at_hash`를 포함한 ID 토큰 유효성 검사
* [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html) — [디스커버리 동작 방식](#discovery)
* [RP-Initiated Logout 1.0](https://openid.net/specs/openid-connect-rpinitiated-1_0.html) — [사용자 로그아웃](server-oidc-browser-login.md#logout)
* [RFC 6749](https://www.rfc-editor.org/rfc/rfc6749) §4.1 — 인가 코드 플로우
* [RFC 6750](https://www.rfc-editor.org/rfc/rfc6750) — 베어러 토큰 및 `WWW-Authenticate` 챌린지
* [RFC 7636](https://www.rfc-editor.org/rfc/rfc7636) — [PKCE](server-oidc-browser-login.md#pkce)
* [RFC 7662](https://www.rfc-editor.org/rfc/rfc7662) — [토큰 인트로스펙션](server-oidc-resource-server.md#introspection)
* [RFC 8707](https://www.rfc-editor.org/rfc/rfc8707) — [리소스 지시자(resource indicators)](server-oidc-browser-login.md#resource-indicators)
* [RFC 9207](https://www.rfc-editor.org/rfc/rfc9207) — `iss` 인가 응답 파라미터
* [RFC 9728](https://www.rfc-editor.org/rfc/rfc9728) — [보호된 리소스 메타데이터](server-oidc-resource-server.md#protected-resource)

## 제한 사항 {id="limitations"}

* 플러그인은 JVM에서만 사용할 수 있습니다.
* API는 실험적(experimental)이며 변경될 수 있습니다.
* 인가 코드 플로우만 지원됩니다. 암시적(implicit) 및 하이브리드(hybrid) 플로우는 지원되지 않습니다.
* PKCE는 `S256`으로 고정됩니다. 커스텀 챌린지 방식은 거부됩니다.
* 암호화된(JWE) UserInfo 응답은 지원되지 않습니다.
* ID 토큰을 반환하지 않는 로그인 콜백은 지원되지 않습니다. OIDC를 구현하지 않는 제공자에 대해 액세스 토큰 전용 로그인을 처리하려면 [`oauth`](server-oauth.md) 제공자를 사용하세요.
* 인트로스펙션 엔드포인트는 디스커버리에서 읽어오지 않습니다. 명시적으로 구성해야 합니다.