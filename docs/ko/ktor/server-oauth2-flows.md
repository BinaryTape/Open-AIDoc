[//]: # (title: OAuth 2.0 플로우)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>, <code>io.ktor:ktor-server-sessions</code>
</p>
</tldr>

<link-summary>
타입 기반 OAuth 2.0 플로우는 자체 로그인 및 콜백 라우트를 설치하며, 타입이 지정된 세션을 통해 사용자의 로그인 상태를 유지할 수 있습니다.
</link-summary>

Ktor는 [타입 안전한 인증 스키마 API](server-typed-auth.md)의 일부로 두 가지 타입 기반 OAuth 2.0 플로우를 제공합니다:

* `oauth2Session`은 사용자를 로그인 처리하고, 세션을 저장하며, 애플리케이션 라우트를 보호하기 위한 스키마를 제공합니다. 특별한 이유가 없다면 이 방식을 사용하는 것이 좋습니다.
* `oauth2`는 사용자를 로그인 처리하고 콜백에서 토큰을 전달합니다. 이후의 라우트를 보호하지는 않습니다.

플로우는 `authenticateWith()`에 전달하는 스키마가 아닙니다. 라우팅에 `install()`하는 값이며, 로그인 및 콜백 라우트를 자동으로 생성해 줍니다.

<note>
    <p>
        타입 안전한 인증 스키마 API는 실험적(experimental) 기능입니다. 언제든지 제거되거나 변경될 수 있습니다.
        옵트인(opt-in)이 필요합니다. 자세한 내용은
        <a href="server-typed-auth.md#prerequisites">API 활성화</a>를 참조하세요.
    </p>
</note>

> 이 문서에서는 타입 기반 API를 다룹니다. 기존의 `oauth` 제공자에 대해서는 [OAuth](server-oauth.md)를 참조하세요.
>
{style="note"}

## 플로우 동작 방식 {id="flow"}

1. 사용자가 로그인 경로를 방문합니다. Ktor는 사용자를 OAuth 제공자로 리다이렉트합니다.
2. 사용자가 제공자 페이지에서 요청된 권한을 승인합니다.
3. 제공자가 인가 코드(authorization code)와 함께 콜백 경로로 다시 리다이렉트합니다.
4. Ktor가 코드를 액세스 토큰으로 교환합니다.
5. `oauth2Session`의 경우, Ktor는 세션을 저장하고 프린시펄(principal)을 해석(resolve)한 후 콜백 핸들러를 실행합니다.

## oauth2Session으로 사용자 로그인 처리하기 {id="oauth2-session"}

플로우가 제공자의 토큰 엔드포인트를 호출하려면 [HttpClient](client-create-and-configure.md)가 필요하므로, `io.ktor:ktor-client-cio`와 같은 클라이언트 엔진 의존성도 함께 추가해야 합니다.

라우트에서 다룰 프린시펄과 Ktor가 호출자를 위해 저장할 세션이라는 두 가지 타입을 선언합니다.

```kotlin
data class User(val id: String, val email: String)
data class UserSession(val accessToken: String)
```

그런 다음 플로우를 생성합니다. 타입 인자의 순서에 주의하세요. 프린시펄이 첫 번째이고 세션이 두 번째입니다.

```kotlin
val googleAuthorizeUrl =
    "https://accounts.google.com/o/oauth2/auth"
val googleTokenUrl = "https://oauth2.googleapis.com/token"
val profileScope =
    "https://www.googleapis.com/auth/userinfo.profile"

val googleAuth = oauth2Session<User, UserSession>("google") {
    client = HttpClient(CIO)
    settings = OAuthServerSettings.OAuth2ServerSettings(
        name = "google",
        authorizeUrl = googleAuthorizeUrl,
        accessTokenUrl = googleTokenUrl,
        requestMethod = HttpMethod.Post,
        clientId = System.getenv("GOOGLE_CLIENT_ID"),
        clientSecret = System.getenv("GOOGLE_CLIENT_SECRET"),
        defaultScopes = listOf(profileScope)
    )
    loginPath = "/login"
    callback("/callback") {
        call.respondRedirect("/profile")
    }
    sessions {
        sessionCreator = { token ->
            UserSession(token.accessToken)
        }
        validate { session ->
            userService.loadUser(session.accessToken)
        }
    }
}
```

`sessions` 블록은 두 가지 역할을 수행합니다:

* `sessionCreator`는 토큰 응답을 저장하고자 하는 세션으로 변환합니다. 토큰 교환 직후 한 번 실행됩니다.
* `validate`는 저장된 세션을 프린시펄로 변환합니다. 보호된 라우트에 대한 모든 요청마다 실행됩니다.

두 항목 모두 필수입니다.

플로우를 설치하고 `flow.session`으로 라우트를 보호하세요:

```kotlin
routing {
    install(googleAuth)

    authenticateWith(googleAuth.session) {
        get("/profile") {
            val user = call.principal
            val session = call.session
            val token = session.accessToken
            call.respondText("${user.email} ($token)")
        }
    }
}
```

`install()`은 로그인 라우트를 생성하고, 콜백 라우트를 생성하며, 세션 스키마를 위한 [Sessions](server-sessions.md) 플러그인을 설치합니다. 사용자가 직접 `Sessions`를 설치할 필요는 없습니다.

보호된 라우트 내부에서 `call.principal`은 `User`이고 `call.session`은 `UserSession`입니다. 세션으로 할 수 있는 모든 작업에 대해서는 [타입 안전한 세션 인증](server-typed-session-auth.md)을 참조하세요.

## 보호된 라우트는 리다이렉트하지 않음 {id="redirects"}

플로우가 생성해 주는 라우트인 로그인 경로와 콜백 경로는 인증되지 않은 방문자를 OAuth 제공자로 리다이렉트합니다. 하지만 `authenticateWith(flow.session)`으로 보호된 라우트는 **리다이렉트하지 않습니다**. 유효한 세션이 없는 요청에는 `401 Unauthorized`가 반환됩니다.

사용자를 제공자로 보내는 방법에는 두 가지가 있습니다:

* 로그인 페이지에서 `loginPath`로 연결되는 링크를 제공합니다.
* 세션이 없을 때 직접 해당 경로로 리다이렉트합니다:

  ```kotlin
  val googleAuth = oauth2Session<User, UserSession>("google") {
      // ...
      sessions {
          sessionCreator = { token ->
              UserSession(token.accessToken)
          }
          validate { session ->
              userService.loadUser(session.accessToken)
          }
          onUnauthorized = { call.respondRedirect("/login") }
      }
  }
  ```

## 로그인 실패 처리 {id="errors"}

로그인이 실패할 수 있는 두 가지 경우를 처리하는 두 개의 핸들러가 있습니다.

플로우의 `onUnauthorized`는 사용자의 동의 거부, 토큰 교환 실패, `sessionCreator` 또는 `validate`가 `null`을 반환하는 등의 OAuth 오류를 처리합니다:

```kotlin
val googleAuth = oauth2Session<User, UserSession>("google") {
    // ...
    onUnauthorized = { cause ->
        call.respondRedirect("/login?error=${cause}")
    }
}
```

## 여러 제공자 사용하기 {id="provider-lookup"}

요청마다 제공자를 선택하려면 `settings` 대신 `providerLookup`을 설정하세요. 이 블록은 라우팅 컨텍스트에서 실행되므로 경로, 쿼리 파라미터, 헤더를 읽을 수 있습니다:

```kotlin
val socialAuth = oauth2Session<User, UserSession>("social") {
    client = HttpClient(CIO)
    providerLookup = {
        when (call.parameters["provider"]) {
            "google" -> googleSettings
            "github" -> githubSettings
            else -> null
        }
    }
    loginPath = "/login/{provider}"
    callback("/callback/{provider}") {
        call.respondRedirect("/profile")
    }
    sessions {
        sessionCreator = { token ->
            UserSession(token.accessToken)
        }
        validate { session ->
            userService.loadUser(session.accessToken)
        }
    }
}
```

`settings` 또는 `providerLookup` 중 하나만 설정해야 하며, 둘 다 설정해서는 안 됩니다.

## 세션 없이 로그인하기 {id="oauth2"}

로그인 후 자체 JWT를 발급하는 경우처럼 Ktor가 이후의 라우트를 보호할 필요가 없을 때는 `oauth2`를 사용하세요. 콜백 핸들러는 토큰 응답을 받습니다:

```kotlin
val githubAuthorizeUrl =
    "https://github.com/login/oauth/authorize"
val githubTokenUrl =
    "https://github.com/login/oauth/access_token"

val githubOAuth = oauth2("github") {
    client = HttpClient(CIO)
    settings = OAuthServerSettings.OAuth2ServerSettings(
        name = "github",
        authorizeUrl = githubAuthorizeUrl,
        accessTokenUrl = githubTokenUrl,
        requestMethod = HttpMethod.Post,
        clientId = System.getenv("GITHUB_CLIENT_ID"),
        clientSecret = System.getenv("GITHUB_CLIENT_SECRET")
    )
    loginPath = "/login"
    callback("/callback") { token ->
        val jwt = tokenService.issueToken(token.accessToken)
        call.respondText(jwt)
    }
}

routing {
    install(githubOAuth)
}
```

여기에는 `flow.session`이 없으므로 `authenticateWith()`에 전달할 항목이 없습니다. [`jwt`](server-jwt.md)와 같은 다른 스키마로 라우트를 보호하세요.

## 보안 고려 사항 {id="security"}

* `clientSecret`이 소스 제어 시스템에 포함되지 않도록 하세요. 환경 변수나 [구성 파일](server-configuration-file.topic)에서 읽어오도록 설정합니다.
* 콜백은 새로 생성된 세션 ID로 세션을 저장하며, 콜백 요청과 함께 도착한 기존 세션 ID는 모두 폐기합니다. 이를 통해 세션 고정(session fixation) 공격을 방지합니다.
* 기본 세션 전송(transport) 방식은 세션 데이터를 서버에 보관하고 클라이언트에는 ID만 전송합니다. 값 기반(by-value) 전송 방식으로 전환하는 경우 트랜스포머를 추가하세요. [전송 방식 선택](server-typed-session-auth.md#transport)을 참조하세요.

## 다음 단계 {id="next"}

* [타입 안전한 인증](server-typed-auth.md)에서 역할, 선택적 인증 및 기타 API를 다룹니다.
* [타입 안전한 세션 인증](server-typed-session-auth.md)에서 세션, 전송 방식, 사용자 로그아웃을 다룹니다.
* [OpenID Connect](server-oidc.md)는 OpenID Connect 발급자 URL로부터 이러한 플로우를 자동으로 구성합니다.