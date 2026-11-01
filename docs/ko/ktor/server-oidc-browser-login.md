[//]: # (title: OpenID Connect 브라우저 로그인)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth-oidc"/>

<tldr>
<p>
<b>필수 종속성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor는 Kotlin/Native를 지원하여 추가 런타임이나 가상 머신 없이도 서버를 실행할 수 있습니다.">네이티브 서버</Links> 지원</b>: ✖️
</p>
</tldr>

<link-summary>
OpenID Connect 제공자를 통해 사용자를 로그인 처리합니다. 이 플러그인은 로그인 및 콜백 라우트를 생성하고 세션을 통해 사용자 로그인 상태를 유지합니다.
</link-summary>

이 문서에서는 OpenID Connect를 사용하여 브라우저에서 사용자를 로그인시키고, 세션을 관리하며, 로그아웃 및 토큰 갱신(refresh)을 처리하는 방법을 설명합니다.

> OpenID Connect 제공자가 발급한 토큰을 검증하려면 [OpenID Connect 리소스 서버](server-oidc-resource-server.md)를 참조하세요.
> 
> 디스커버리 및 플러그인 설정에 대해서는 [OpenID Connect](server-oidc.md)를 참조하세요.
> 
{style="tip"}

<note>
    <p>
        OpenID Connect 플러그인은 실험적(experimental) 기능이며, JVM에서만 사용할 수 있고
        <code>@OptIn(ExperimentalKtorApi::class)</code>가 필요합니다. 이 플러그인은 Kotlin 컨텍스트 파라미터가 필요한
        <Links href="server-typed-auth.md" summary="타입 안전한 인증 스키마 API는 프린시펄 타입을 라우트에 바인딩하므로 캐스팅이나 널 체크 없이 null이 아닌 프린시펄을 읽을 수 있습니다.">타입 안전한 인증 API</Links>를 사용합니다.
    </p>
</note>

## 동작 흐름 {id="flow"}

1. 사용자가 `/oidc/{name}/login`에 접근합니다.
2. Ktor는 `state`, `nonce`, PKCE 챌린지와 함께 사용자를 제공자 페이지로 리디렉션합니다.
3. 사용자가 제공자에서 로그인하고 요청된 스코프(scope)를 승인합니다.
4. 제공자는 인가 코드(authorization code)와 함께 사용자를 `/oidc/{name}/callback`으로 다시 리디렉션합니다.
5. Ktor는 코드를 토큰으로 교환하고, ID 토큰을 검증한 뒤 세션을 저장합니다.
6. `onAuthenticated` 핸들러가 실행됩니다.

플러그인은 다음 라우트를 생성합니다:

| 라우트 | 메서드 | 생성 시점 |
|-------------------------|--------|---------------------------|
| `/oidc/{name}/login` | `GET` | 항상 |
| `/oidc/{name}/callback` | `GET` | 항상 |
| `/oidc/{name}/logout` | `POST` | `logout()`을 호출할 때 |
| `/oidc/{name}/refresh` | `POST` | `refresh()`를 호출할 때 |

콜백 라우트를 제공자에 허용된 리디렉션 URI(redirect URI)로 등록해야 합니다.

## 사용자 로그인 {id="oauth"}

성공적인 로그인을 처리하려면 OAuth 자격 증명을 구성하고 `onAuthenticated` 핸들러를 사용합니다.

```kotlin
suspend fun Application.module() {
    val oidc = install(Oidc)

    val google = oidc.identityProvider("google") {
        issuer = "https://accounts.google.com"
        oauth {
            clientId = System.getenv("GOOGLE_CLIENT_ID")
            clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
            onAuthenticated { idToken ->
                val subject = idToken.userInfo.subject
                userService.recordLogin(subject)
                call.respondRedirect("/dashboard")
            }
        }
    }
}
```

`onAuthenticated` 핸들러는 성공적인 콜백이 완료되고 세션이 저장된 후 한 번 실행됩니다.
이 핸들러가 없으면 로그인이 성공했을 때 본문이 빈 `200 OK` 응답을 반환합니다.

`scopes` 프로퍼티의 기본값은 `listOf("openid", "profile", "email")`입니다. 값을 할당하면 기본 목록에 추가되는 것이 아니라 대체되며, 결과 목록에는 반드시 `openid`가 포함되어야 합니다.

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    scopes = listOf("openid", "email", "calendar.read")
}
```

제공자가 ID 토큰에 포함하지 않은 클레임(claim)을 가져오려면 `fetchUserInfo = true`로 설정합니다. 이렇게 하면 로그인할 때마다 UserInfo 엔드포인트로 요청이 추가됩니다.

> 클라이언트 시크릿은 소스 코드 외부에 두고 구성 파일에 저장하세요. 자세한 내용은 [구성 파일에서 설정하기](server-oidc.md#config-file)를 참조하세요.
>
{style="tip"}

## 라우트 커스터마이징 {id="paths"}

생성된 모든 경로를 커스터마이징할 수 있습니다. `loginUri` 및 `redirectUri` 프로퍼티는 `URLBuilder` 블록을 받으며, `logout()` 및 `refresh()`는 `path`를 받습니다.

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    loginUri = { path("auth", "google", "signin") }
    redirectUri = { path("auth", "google", "callback") }
    logout(path = "/auth/google/signout")
    refresh(path = "/auth/google/renew")
}
```

`redirectUri` 프로퍼티는 제공자에 등록된 리디렉션 URI와 일치해야 합니다. 이 값을 변경할 때는 등록된 리디렉션 URI도 업데이트하세요.

이 빌더들은 쿼리 파라미터를 지원하지 않습니다. 플러그인은 쿼리 파라미터가 포함된 경로를 거부합니다.

## 세션으로 라우트 보호 {id="session"}

`provider.session` 스키마는 기존 세션이 있는 사용자를 인증합니다. 블록 내부에서 `call.principal`은 `OidcToken.Id` 타입입니다.

```kotlin
routing {
    authenticateWith(google.session) {
        get("/dashboard") {
            val user = call.principal.userInfo
            call.respondText("Hello ${user.name}")
        }
    }
}
```

OIDC 토큰 대신 애플리케이션 전용 프린시펄을 사용하려면 `mapPrincipal()`을 사용하여 스키마를 매핑합니다.

```kotlin
data class AppUser(val id: String, val email: String?)

val sessionAuth = google.session.mapPrincipal { token ->
    val info = token.userInfo
    userService.find(info.subject) ?: AppUser(
        id = info.subject,
        email = info.email
    )
}
```

> 자세한 내용은 [토큰을 애플리케이션 프린시펄에 매핑하기](server-oidc.md#map-principal)를 참조하세요.
> 
{style="tip"}

## 세션 구성 {id="sessions"}

세션은 기본적으로 활성화되어 있습니다. 쿠키 이름이나 세션 스토리지를 구성하려면 `sessions { }` 블록을 사용합니다.

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    sessions {
        name = "GOOGLE_SESSION"
        storage = directorySessionStorage(
            File("build/.sessions")
        )
        cookie {
            cookie.path = "/"
            cookie.maxAgeInSeconds = 3600
        }
    }
}
```

쿠키 이름의 기본값은 `{PROVIDER_NAME}_SESSION`입니다. 플러그인은 개발 모드가 아닐 때 `HttpOnly`, `SameSite=Lax`, `Secure`를 설정합니다. 꼭 필요한 경우에만 이 설정을 재정의하세요.

전송 방식은 항상 `SessionTransportType.CookieId`이며 변경할 수 없습니다. 브라우저로는 세션 ID만 전송됩니다. ID 토큰, 액세스 토큰, 리프레시 토큰은 서버 측의 `storage`에 유지됩니다.

세션 스토리지의 기본값은 `SessionStorageMemory()`입니다. 이는 애플리케이션이 재시작되면 모든 세션이 손실되고 인스턴스 간에 세션이 공유되지 않습니다. 프로덕션에 배포하기 전에 영구 스토리지 또는 공유 스토리지를 구성하세요.

> 세션 작업에 대한 자세한 내용은 [세션](server-sessions.md)을 참조하세요.
> 
{style="tip"}

## CSRF 방어 {id="csrf"}

플러그인이 생성한 라우트는 오리진(origin) 검사로 보호됩니다.

```kotlin
sessions {
    csrfProtection {
        originMatchesHost()
    }
}
```

이 보호 기능은 기본적으로 활성화되어 있으므로 변경이 필요한 경우에만 이 블록을 구성하세요.

`disableCsrfProtection()` 함수를 사용하여 CSRF 보호를 비활성화할 수 있습니다. 그러나 로그아웃 및 토큰 갱신 라우트는 세션 쿠키를 포함하는 브라우저의 `POST` 요청을 수신하므로, 이러한 라우트는 CSRF로부터 보호된 상태를 유지해야 합니다.

## 사용자 로그아웃 {id="logout"}

사용자를 로그아웃시키려면 `logout()` 함수를 사용합니다.

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    logout(
        postLogoutRedirectUri = { path("signed-out") }
    )
}
```

`/oidc/google/logout`으로 `POST` 요청을 보내면 세션이 지워지고 `303 See Other`로 응답하여 사용자를 제공자의 `end_session_endpoint`로 리디렉션합니다.

제공자는 디스커버리 문서에 `end_session_endpoint`를 공지해야 합니다. Ktor는 라우트가 등록될 때 이를 확인하므로, 이 엔드포인트가 없는 제공자를 사용하면 로그아웃 시점이 아니라 애플리케이션 시작 시점에 실패하게 됩니다. 제공자가 이 엔드포인트를 지원하지 않는 경우 `logout()`을 호출하는 대신 세션을 직접 지우세요.

리디렉션하는 대신 추가 로직을 실행하거나 커스텀 응답을 반환하려면 핸들러를 전달합니다.

```kotlin
logout {
    call.respondRedirect("/goodbye")
}
```

로그아웃하더라도 제공자 측의 리프레시 토큰이 취소(revoke)되지는 않습니다.

## 세션 최신 상태 유지 {id="refresh"}

ID 토큰은 만료됩니다. 기본적으로 플러그인은 토큰을 갱신하지 않습니다. 토큰이 `exp` 값을 지나면 세션이 지워지고 사용자는 다시 로그인해야 합니다.

토큰을 자동으로 갱신하려면 갱신 전략(refresh strategy)을 구성합니다.

```kotlin
sessions {
    tokenRefreshStrategy = OidcTokenRefreshStrategy.Auto(
        beforeExpiry = 30.seconds
    )
}
```

갱신된 토큰은 기존 토큰과 동일한 `sub` 값을 가져야 합니다. 그렇지 않으면 갱신된 토큰은 폐기됩니다.

자동 갱신에는 `OidcTokenRefreshStrategy.Auto`를 사용합니다. 커스텀 갱신 동작이 필요한 경우에는 `OidcTokenRefreshStrategy.Custom`을 사용합니다.

```kotlin
sessions {
    val custom = OidcTokenRefreshStrategy.Custom { provider, token, now ->
        val expiresAt = token.claims.expiresAt
        val stale = expiresAt != null && expiresAt <= now + 5.minutes
        val refreshToken = token.refreshToken
        if (stale && refreshToken != null) {
            provider.refreshToken(refreshToken).idToken
        } else {
            token
        }
    }
    tokenRefreshStrategy = custom
}
```

기존 세션을 유지하려면 `token`을 반환하고, 저장된 세션을 교체하려면 새 `OidcToken.Id`를 반환하며, 갱신된 토큰을 사용할 수 없는 경우 `null`을 반환합니다. 콜백이 `null`을 반환하거나 예외를 던지면, 세션은 현재 토큰이 유효한 동안 유지되다가 만료되면 삭제됩니다. 세션을 즉시 종료하려면 [Sessions](server-sessions.md) 플러그인을 사용하여 세션을 직접 지우세요.

이 콜백은 세션 스키마로 인증된 모든 요청마다 실행되므로 작업을 가볍게 유지해야 합니다. 시계를 직접 읽는 대신 `now` 파라미터를 사용하여 해당 요청 내의 모든 시간 비교가 동일한 값을 사용하도록 하세요.

`now` 파라미터와 `claims.expiresAt`은 실험적 기능인 `kotlin.time.Instant`입니다. 이를 비교하는 전략은 플러그인에 필요한 옵트인 외에도 `@OptIn(ExperimentalTime::class)`가 필요합니다.

필요에 따라 갱신(on-demand refresh)을 위한 라우트를 추가할 수도 있습니다.

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    refresh()
}
```

`/oidc/google/refresh`로 `POST` 요청을 보내면 성공 시 `200 OK`로 응답하고, 세션을 갱신할 수 없으면 `401 Unauthorized`로 응답합니다. `401` 응답 시 기존 세션은 토큰이 만료될 때까지 변경되지 않은 상태로 유지됩니다.

### 수동으로 토큰 갱신 {id="manual-refresh"}

생성된 갱신 라우트를 사용하지 않는 경우(예: 예약된 작업이나 다운스트림 API를 호출하기 전 갱신) 제공자에서 `refreshToken()` 함수를 호출합니다.

```kotlin
val refreshToken = call.principal.refreshToken
if (refreshToken != null) {
    val result = google.refreshToken(refreshToken)
    val newIdToken = result.idToken
    if (newIdToken != null) {
        call.session = newIdToken
    }
}
```

`OidcTokenRefreshResult`는 원시 토큰 응답인 `accessToken`, `refreshToken`, `expiresIn`, `tokenType`, `scope`를 담고 있습니다. 제공자가 ID 토큰을 반환하지 않는 경우 `idToken` 프로퍼티는 null이 되므로, 세션을 저장하기 전에 확인하세요.

갱신 중에 제공자가 다음 예외를 던질 수 있습니다:
* 제공자가 요청을 거부할 때 `ResponseException`
* 반환된 토큰의 유효성 검사에 실패할 때 `OidcTokenRejectedException`
* ID 토큰을 확인할 수 없을 때 `OidcSigningKeyUnavailableException`. 자세한 내용은 [서버 측 유효성 검사 실패 처리](server-oidc-resource-server.md#errors-500)를 참조하세요.

동일한 리프레시 토큰을 사용하는 동시 호출은 제공자에 대한 단일 요청을 공유합니다. 그 결과는 `tokenRefreshCacheTtl` 동안 재사용되므로 추가적인 동기화가 필요하지 않습니다.

> `exp` 클레임이 없는 ID 토큰은 만료된 것으로 처리되지 않으며 갱신되지도 않습니다. 세션은 쿠키가 유효한 한 계속 유효합니다.
>
{style="note"}

## 세션 없이 로그인 {id="no-session"}

직접 세션을 관리하거나 자체 토큰을 발급하는 경우, 플러그인의 세션 지원을 비활성화할 수 있습니다.

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    disableSessions()
    onAuthenticated { idToken ->
        val token = myTokenService.issue(idToken.userInfo)
        call.respondText(token)
    }
}
```

세션이 비활성화된 경우 `onAuthenticated`는 필수입니다. 이 모드에서는 `provider.session`, `logout()`, `refresh()` 함수를 사용할 수 없습니다.

## 다중 제공자 사용 {id="multiple"}

발급자(issuer)마다 하나의 신원 제공자(identity provider)를 등록합니다. 각 제공자는 자체 라우트, 쿠키 및 인증 스키마를 가집니다.

```kotlin
val google = oidc.identityProvider("google") {
    issuer = "https://accounts.google.com"
    oauth {
        clientId = System.getenv("GOOGLE_CLIENT_ID")
        clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    }
}

val github = oidc.identityProvider("github-idp") {
    issuer = "https://idp.example.com"
    oauth {
        clientId = System.getenv("IDP_CLIENT_ID")
        clientSecret = System.getenv("IDP_CLIENT_SECRET")
    }
}
```

위 예제에서 로그인 페이지는 `/oidc/google/login`과 `/oidc/github-idp/login`으로 연결됩니다. 두 제공자 중 하나로 동일한 라우트를 인증할 수 있도록 하려면 둘 다 공통 프린시펄 타입으로 매핑하고 `authenticateWithAnyOf()` 함수를 사용하세요.

## 범위 지정 토큰 요청 {id="resource-indicators"}

특정 API에 대한 액세스 토큰을 요청하려면 `resourceIndicators` 프로퍼티([RFC 8707](https://www.rfc-editor.org/rfc/rfc8707))를 사용합니다.

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    resourceIndicators = listOf("https://api.example.com")
}
```

이 값은 API가 [보호된 리소스 메타데이터](server-oidc-resource-server.md#protected-resource)에 게시하는 식별자와 일치해야 합니다.

## PKCE 이해하기 {id="pkce"}

인가 코드는 사용자의 브라우저를 통해 반환되며 사용자가 제어할 수 없는 소프트웨어를 거칩니다. 동일한 URL 스키마에 등록된 악성 앱이나 로깅 프록시와 같은 다른 애플리케이션이 이 코드를 가로채 토큰으로 교환하려고 시도할 수 있습니다.

PKCE([RFC 7636](https://www.rfc-editor.org/rfc/rfc7636))는 추가적인 시크릿 없이 인가 코드를 사용할 수 없도록 방지합니다. 사용자를 리디렉션하기 전에 Ktor는 _검증자(verifier)_라는 무작위 시크릿을 생성하고, 그 SHA-256 해시값인 _챌린지(challenge)_만을 제공자에게 보냅니다. 이후 Ktor가 코드를 교환할 때 검증자를 제시하고, 제공자는 이 검증자를 해시한 값이 저장해 둔 챌린지와 일치하는지 확인합니다.

검증자는 인가 요청 중에 제공자에게 전송되지 않으며, 브라우저 스크립트로 읽을 수 없습니다. Ktor는 플러그인이 설정한 AES-256-GCM 암호화 쿠키에 `state` 및 `nonce` 값과 함께 검증자를 저장하므로, 브라우저는 키가 없는 암호문만 보유하게 됩니다. 쿠키를 복호화하려면 `stateEncryptionKey`가 필요합니다.

Ktor는 모든 로그인에 PKCE를 사용합니다. `codeChallengeMethod`의 기본값은 `CodeChallengeMethod.S256`이며, `S256`만 지원됩니다. 커스텀 챌린지 메서드는 거부됩니다. 검증자가 해당 쿠키에 저장되기 때문에 로그인에는 [제한 시간](#errors-state)이 있습니다.

## 로그인 에러 처리 {id="errors"}

### 로그인 실패 대응 {id="errors-handler"}

콜백을 완료할 수 없을 때 `onAuthenticationFailed` 핸들러가 실행됩니다.

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    onAuthenticationFailed { cause ->
        val reason = (cause as? AuthenticationFailedCause.Error)
            ?.message
        call.application.log.info("Login failed: $reason")
        call.respondRedirect("/oidc/google/login")
    }
}
```

핸들러는 예외 대신 `AuthenticationFailedCause`를 전달받습니다.
`AuthenticationFailedCause.Error`는 실패에 대한 세부 정보를 담은 `message`를 제공합니다.

핸들러가 없으면 로그인 실패 시 빈 본문과 함께 `401 Unauthorized`로 응답합니다. 브라우저 애플리케이션의 경우, 사용자를 로그인 라우트로 리디렉션하여 새 인증 흐름을 시작하도록 할 수 있습니다.

핸들러는 응답을 생성해야 합니다. 응답하지 않으면 Ktor는 오류에서 등록한 챌린지로 폴백(fallback)하거나, 사용 가능한 챌린지가 없는 경우 `401 Unauthorized`로 응답합니다.

토큰 엔드포인트가 코드가 만료되었거나 이미 사용되어 인가 코드를 `invalid_grant`로 거부하는 경우, 제공자로의 리디렉션이 폴백으로 등록됩니다. 핸들러가 응답하지 않으면 로그인 흐름이 다시 시작됩니다.

흐름을 다시 시작하는 것은 사용자가 콜백 페이지를 새로고침하여 동일한 코드를 재사용하려고 시도하는 경우 등에 유용합니다. 하지만 이 과정이 반복될 위험이 있습니다. 클라이언트 시크릿이 올바르지 않거나 시스템 시계 문제로 인해 모든 인가 코드가 만료된 것처럼 보이는 등 모든 인가 코드가 실패하는 상황에서는 반복적인 `invalid_grant` 응답으로 인해 리디렉션 루프가 발생할 수 있습니다.

폴백 리디렉션을 방지하려면 핸들러 내부에서 응답을 반환하세요. 1회의 재시도만 허용하려면 재시도가 이미 발생했는지 여부를 추적합니다.

```kotlin
onAuthenticationFailed { cause ->
    val retried =
        call.request.cookies["oidc_retry"] != null
    if (cause is OAuth2InvalidGrantError && !retried) {
        call.response.cookies.append(
            name = "oidc_retry",
            value = "1",
            maxAge = 120,
            path = "/",
            httpOnly = true
        )
        call.respondRedirect("/oidc/google/login")
    } else {
        call.response.cookies.append(
            name = "oidc_retry",
            value = "",
            maxAge = 0,
            path = "/"
        )
        call.application.log.warn("Login failed: $cause")
        call.respond(HttpStatusCode.Unauthorized)
    }
}
```

수명이 짧은 쿠키를 통해 재시도가 이미 발생했는지 기록합니다. 두 번째 실패 시에는 다시 리디렉션하는 대신 에러를 반환합니다. 해당 에러 발생 시 쿠키가 지워지며, 2분 후에 자동으로 만료되므로 다음 로그인에 영향을 주지 않습니다.

### 로그인 유효 시간은 10분입니다 {id="errors-state"}

`state`, `nonce`, PKCE 검증자는 10분 후에 만료되는 암호화된 쿠키에 저장됩니다. 이는 변경할 수 없습니다.

로그인 페이지를 열어두고 자리를 비웠다가 1시간 후에 돌아온 사용자는 콜백 실패를 겪게 됩니다. `stateEncryptionKey`를 구성하지 않은 경우 애플리케이션이 재시작되었을 때 로그인이 진행 중이던 사용자도 마찬가지입니다.

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    stateEncryptionKey = OidcStateEncryptionKey.of(stateKey)
}
```

키는 정확히 32바이트여야 합니다. 명시적인 키가 없으면 플러그인은 프로세스마다 새 키를 생성합니다. 그 결과, 애플리케이션 재시작 후 진행 중이던 로그인이 실패하며 로드 밸런서 뒤에 있는 인스턴스 간에 로그인을 이어갈 수 없습니다. `OidcStateEncryptionKey.rotating(current, previous)`를 사용하면 이미 진행 중인 로그인 흐름을 무효화하지 않고 키를 교체(rotate)할 수 있습니다.

만료된 로그인과 위조된 콜백은 동일한 실패를 유발하므로 핸들러는 둘을 구분할 수 없습니다. 이것이 로그인 라우트로 리디렉션하는 것이 기본 동작인 이유입니다.

### 인증 실패 원인 {id="errors-causes"}

| 원인 | 일반적인 이유 |
|----------------------------------------|---------------------------------------------------------------------------------|
| 제공자가 `error=`를 반환함 | 사용자가 동의를 거부함 |
| state 쿠키가 없거나 만료됨 | 10분의 제한 시간이 지났거나 `stateEncryptionKey` 없이 재시작됨 |
| state 쿠키를 복호화할 수 없음 | 위조된 콜백이거나 키가 교체됨 |
| `iss` 불일치 또는 누락 | 제공자 간 혼동([RFC 9207](https://www.rfc-editor.org/rfc/rfc9207)) |
| `nonce` 불일치 | 재전송된(replayed) ID 토큰 |
| `at_hash` 불일치 | ID 토큰이 액세스 토큰과 일치하지 않음 |
| 응답에 `id_token`이 없음 | 제공자가 OIDC 흐름을 실행하고 있지 않음 |
| ID 토큰 유효성 검사 실패 | 서명, issuer, audience, `exp`, `iat`, `azp` 또는 `sub` 오류 |
| 토큰 엔드포인트가 에러를 반환함 | 만료되었거나 재사용된 인가 코드 |

### 제공자 가용성 에러 처리 {id="errors-500"}

일부 실패는 `onAuthenticationFailed`에 도달하지 않고 대신 `500 Internal Server Error`로 나타납니다. 자세한 내용은 [서버 측 유효성 검사 실패 처리](server-oidc-resource-server.md#errors-500)를 참조하세요.

이는 자동 토큰 갱신 중에 발생할 수 있습니다. `OidcTokenRefreshStrategy.Auto`를 사용하면 일반적인 요청을 처리하는 동안 토큰 갱신이 실행됩니다. 따라서 제공자를 사용할 수 없는 경우 요청이 `500` 응답과 함께 실패할 수 있습니다.

세션에 어떤 일이 발생하는지는 갱신 실패 이유에 따라 달라집니다:

| 실패 유형 | 세션 | 결과 |
|-------------------------------------------------|----------------------------------------------|-------------------------------------------------------------------|
| 갱신된 토큰이 유효하지 않음 | 삭제됨 | `401`, 쿠키 제거됨. 세션을 복구할 수 없음 |
| 제공자에 연결할 수 없거나 에러를 반환함 | 유지됨 (이미 만료된 경우 제외) | 예외가 전파되므로 `500` |
| 응답에 ID 토큰이 없거나 `sub`가 변경됨 | 유효한 동안 유지되고 만료 시 삭제됨 | 이전 토큰이 만료될 때까지 정상 동작 |

세션이 삭제된 후 다음 보호된 요청은 인증되지 않은 상태가 되며 사용자는 다시 로그인해야 합니다.

> 디스커버리, 세션 보안 기본값, 테스트에 대해 자세히 알아보려면 [OpenID Connect](server-oidc.md)를 참조하세요.
> 
> API에서 토큰을 검증하는 방법은 [OpenID Connect 리소스 서버](server-oidc-resource-server.md)를 참조하세요.
> 
> 세션 스토리지 및 쿠키 구성에 대해서는 [세션](server-sessions.md)을 참조하세요.
> 
{style="tip"}