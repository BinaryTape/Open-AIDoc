[//]: # (title: 타입 안전한 세션 인증)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>필수 종속성</b>: <code>io.ktor:%artifact_name%</code>, <code>io.ktor:ktor-server-sessions</code>
</p>
</tldr>

<link-summary>
타입 안전한 인증 스키마 API의 세션 스키마는 라우트에 null이 아닌 principal과 저장된 세션에 대한 읽기/쓰기 접근을 제공합니다.
</link-summary>

`session` 스키마는 [타입 안전한 인증 스키마 API](server-typed-auth.md)의 일부입니다. 이는 기존 이름 기반 제공자의 [세션 인증](server-session-auth.md)에서 함께 묶여 있던 두 가지 요소를 분리합니다.

* **세션(session)**은 액세스 토큰이나 사용자 ID와 같이 호출자를 위해 저장하는 값입니다.
* **프린시펄(principal)**은 전체 사용자 레코드와 같이 라우트 핸들러가 작업하는 대상입니다.

보호된 라우트 내부에서 `call.session`은 저장된 세션을 제공하고 `call.principal`은 프린시펄을 제공합니다. 둘 다 null이 아니며 올바른 타입으로 지정됩니다.

<note>
    <p>
        타입 안전한 인증 스키마 API는 실험적(experimental) 기능입니다. 언제든지 제거되거나 변경될 수 있습니다.
        사용하려면 옵트인이 필요합니다. 자세한 내용은
        <a href="server-typed-auth.md#prerequisites">API 활성화</a>를 참조하세요.
    </p>
</note>

## 세션 스키마 생성 {id="create-scheme"}

`session<S, P>()` 팩토리는 세션 타입을 첫 번째로, 프린시펄 타입을 두 번째로 받습니다. `validate` 블록은 세션을 프린시펄로 변환하거나, 세션을 거부하기 위해 `null`을 반환합니다.

기본적으로 유효한 세션이 없는 요청은 `401 Unauthorized`를 수신합니다. 브라우저 애플리케이션의 경우 호출자를 로그인 페이지로 리다이렉트할 수 있습니다. 응답을 변경하려면 `onUnauthorized` 핸들러를 설정하세요.

```kotlin
data class UserSession(val userId: String)
data class User(val id: String, val email: String)

val sessionAuth = session<UserSession, User>("auth-session") {
    validate { session ->
        userRepository.findById(session.userId)
    }
    onUnauthorized = {
        call.respondRedirect("/login")
    }
}
```

`authenticateWith()`에 전달된 핸들러는 해당 라우트에 대해 이 설정을 재정의(override)합니다. 전체 적용 순서는 [실패 처리](server-typed-auth.md#failures)를 참조하세요.

## 전송 방식(Transport) 선택 {id="transport"}

`transport` 프로퍼티는 클라이언트와 서버 간에 세션이 전달되는 방식을 제어합니다.

| 전송 방식 | 클라이언트가 보유하는 것 | 세션 데이터가 저장되는 위치 |
|---------------------------------|------------------------------------|--------------------------------------|
| `SessionTransportType.CookieId` | 쿠키 내의 세션 ID | 서버의 `SessionStorage` |
| `SessionTransportType.HeaderId` | 헤더 내의 세션 ID | 서버의 `SessionStorage` |
| `SessionTransportType.Cookie`   | 쿠키 내의 직렬화된 세션 | 클라이언트 |
| `SessionTransportType.Header`   | 헤더 내의 직렬화된 세션 | 클라이언트 |

기본값은 인메모리 스토리지를 사용하는 `CookieId`이며, 세션 데이터를 서버에 유지합니다.

```kotlin
val storage = SessionStorageMemory()

val sessionAuth = session<UserSession, User>("auth-session") {
    transport = SessionTransportType.CookieId(storage) {
        cookie.path = "/"
        cookie.maxAgeInSeconds = 3600
        cookie.httpOnly = true
    }
    validate { session ->
        userRepository.findById(session.userId)
    }
}
```

`SessionStorageMemory`는 서버 재시작 시 모든 데이터가 손실되고 인스턴스 간에 공유되지 않으므로 로컬 개발에 적합합니다. 프로덕션 환경에서는 `directorySessionStorage()`와 같은 영구 스토리지나 직접 구현한 `SessionStorage`를 사용하세요.

> `Cookie` 및 `Header` 전송 방식은 세션 값을 클라이언트로 전송합니다. 이 값은 호출자의 신원(identity)이므로, 보호 조치가 없으면 클라이언트가 이를 위조하여 다른 사용자로 로그인할 수 있습니다. 값 기반(by-value) 전송 방식을 사용하는 경우 `SessionTransportTransformerEncrypt`와 같은 변환기(transformer)를 추가하세요.
> ```kotlin
> val transformer = SessionTransportTransformerEncrypt(
>     encryptKey, 
>     signKey
> )
> transport = SessionTransportType.Cookie {
>     transform(transformer)
> }
> ```
>
{style="warning"}

## Sessions 플러그인 설치 {id="install-sessions"}

세션 스키마는 [Sessions](server-sessions.md) 플러그인을 통해 세션을 읽으므로, 라우트에서 스키마를 사용하기 전에 플러그인이 설치되어 있어야 합니다. 스키마를 `install()`에 전달하면 Ktor가 구성된 전송 방식을 적용합니다.

```kotlin
fun Application.module() {
    install(sessionAuth)

    routing {
        authenticateWith(sessionAuth) {
            get("/profile") {
                call.respondText(call.principal.email)
            }
        }
    }
}
```

단일 라우트 하위 트리에만 설치할 수도 있습니다.

```kotlin
routing {
    route("/app") {
        install(sessionAuth)

        authenticateWith(sessionAuth) {
            get("/profile") { /* ... */ }
        }
    }
}
```

`Sessions`를 직접 구성하는 경우, 스키마와 플러그인이 이름, 타입, 전송 방식을 일치시키도록 구성 블록 내에서 `applyTransport()`를 호출하세요.

```kotlin
install(Sessions) {
    sessionAuth.applyTransport()
    cookie<OtherSession>("other-session")
}
```

플러그인이 누락되었거나 스키마의 이름 및 세션 타입과 일치하는 제공자(provider)가 없는 경우, 시작 시 스키마 초기화에 실패합니다.

## 세션 읽기 및 변경 {id="read-write"}

세션 스키마로 보호되는 라우트 내에서 `call.session`은 읽기/쓰기가 가능한 프로퍼티입니다.

```kotlin
routing {
    authenticateWith(sessionAuth) {
        get("/profile") {
            val session = call.session
            call.respondText("Signed in as ${session.userId}")
        }

        post("/switch-team") {
            val teamId = call.receiveText()
            call.session = call.session.copy(teamId = teamId)
            call.respondText("Switched")
        }
    }
}
```

동일한 블록 내에서 다음 접근자들을 사용할 수 있습니다.

| 접근자 | 목적 |
|--------------------------|----------------------------------------------------------------------------|
| `call.session`           | 세션을 읽거나 대체합니다. |
| `call.updateSession { }` | 세션을 읽고 변경 사항을 적용한 뒤, 결과를 저장하고 반환합니다. |
| `call.clearSession()`    | 세션을 제거하여 호출자를 로그아웃시킵니다. |

새로운 값이 이전 값에 의존하는 경우 `updateSession`을 사용하세요.

```kotlin
post("/increment") {
    val updated = call.updateSession {
        it.copy(visits = it.visits + 1)
    }
    call.respondText("Visits: ${updated.visits}")
}
```

`authenticateWithOptional()` 내부에서는 세션이 전혀 없을 수도 있으므로 `call.session`을 사용할 수 없습니다. 대신 `call.sessionOrNull`을 사용하세요.

```kotlin
routing {
    authenticateWithOptional(sessionAuth) {
        get("/greeting") {
            val message = when (call.sessionOrNull) {
                null -> "Hello, guest"
                else -> "Welcome back"
            }
            call.respondText(message)
        }
    }
}
```

## 사용자 로그인 및 로그아웃 {id="login-logout"}

스키마의 `setSession()` 및 `clearSession()`은 해당 스키마가 보호하는 라우트인지 여부와 관계없이 모든 라우트에서 작동합니다.

로그인은 스키마로 보호되지 않는 라우트에 속해야 합니다. 호출자에게 아직 세션이 없으므로, 보호된 라우트에서는 핸들러가 실행되기도 전에 요청을 거부합니다.

```kotlin
routing {
    post("/login") {
        val credentials = call.receive<LoginRequest>()
        val user = userRepository.authenticate(credentials)
            ?: return@post call.respond(
                HttpStatusCode.Unauthorized
            )

        sessionAuth.setSession(UserSession(userId = user.id))
        call.respondText("Signed in")
    }

    post("/logout") {
        sessionAuth.clearSession()
        call.respondText("Signed out")
    }
}
```

## 인증 도중 세션 업데이트 {id="transform-session"}

`validate`가 실행되기 전에 인증의 일부로서 저장된 세션을 변경하려면 `transformSession`을 사용하세요. 이는 만료 기한이 있는 토큰을 포함하는 세션에 유용합니다.

해당 요청에 사용할 세션을 반환하거나, 요청을 거부하려면 `null`을 반환하세요. Ktor는 반환된 값이 들어온 값과 다를 때만 세션을 다시 저장합니다.

```kotlin
val sessionAuth = session<UserSession, User>("auth-session") {
    transformSession { session ->
        if (session.expiresAt > Clock.System.now()) {
            session
        } else {
            tokenService.refresh(session.refreshToken)
        }
    }
    validate { session ->
        userRepository.findById(session.userId)
    }
}
```

## CSRF 보호 추가 {id="csrf"}

쿠키 전송 방식은 다른 사이트에서 시작된 요청을 포함하여 모든 요청에 세션을 자동으로 전송합니다. `csrfProtection {}` 블록을 사용하여 이 스키마가 보호하는 라우트에 [CSRF](https://api.ktor.io/ktor-server/ktor-server-plugins/ktor-server-csrf/io.ktor.server.plugins.csrf/-c-s-r-f.html) 플러그인을 설치하세요.

```kotlin
val sessionAuth = session<UserSession, User>("auth-session") {
    csrfProtection {
        allowOrigin("https://app.example.com")
        originMatchesHost()
    }
    validate { session ->
        userRepository.findById(session.userId)
    }
}
```

> 역할(role), 선택적 인증(optional authentication) 및 기타 API에 대한 자세한 내용은 [타입 안전한 인증](server-typed-auth.md)을 참조하세요.
> 
> `Sessions` 플러그인 사용에 관한 자세한 내용은 [세션](server-sessions.md)을 참조하세요.
> 
{style="tip"}