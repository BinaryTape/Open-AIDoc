[//]: # (title: 타입 세이프 인증)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>필수 종속성</b>: <code>io.ktor:%artifact_name%</code>
</p>
</tldr>

<link-summary>
타입 세이프 인증 스킴 API는 principal 타입을 라우트에 바인딩하므로, 타입 캐스팅이나 null 검사 없이 null이 아닌 principal을 읽을 수 있습니다.
</link-summary>

Ktor는 인증 스킴을 principal 타입에 바인딩하는 타입 세이프(type-safe) 인증 스킴 API를 제공합니다. 스킴을 한 번 생성하여 라우트에 전달하면, 타입 캐스팅이나 null 검사 없이 principal을 읽을 수 있습니다.

> 이 API는 [`install(Authentication)`](server-auth.md) 접근 방식의 대안입니다. 동일한 애플리케이션에서 두 API를 모두 사용할 수 있으며, 한 API를 사용하는 라우트 내에 다른 API를 사용하는 라우트를 중첩할 수도 있습니다.
> 
{style="tip"}

## 종속성 추가 {id="add_dependencies"}

타입 안전 인증을 사용하려면 빌드 스크립트에 `ktor-server-auth` 아티팩트를 추가합니다.

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

`jwt` 스킴을 사용하는 경우, `ktor-server-auth-jwt` 아티팩트를 추가합니다.

<var name="artifact_name" value="ktor-server-auth-jwt"/>
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

`apiKey` 스킴을 사용하는 경우, `ktor-server-auth-api-key` 아티팩트를 추가합니다.

<var name="artifact_name" value="ktor-server-auth-api-key"/>
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

## API 활성화 {id="prerequisites"}

이 API에는 `@ExperimentalKtorApi` 어노테이션이 지정되어 있으므로, 옵트인(opt-in)해야 합니다.

```kotlin
@OptIn(ExperimentalKtorApi::class)
fun Application.module() {
    // ...
}
```

라우트 빌더는 Kotlin [컨텍스트 파라미터(context parameters)](https://kotlinlang.org/docs/context-parameters.html)를 사용합니다. Kotlin 2.4.0부터는 컨텍스트 파라미터가 기본적으로 활성화되어 있습니다. Kotlin 2.2.x 또는 2.3.x를 사용하는 경우 빌드 스크립트에서 이를 활성화해야 합니다.

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xcontext-parameters")
    }
}
```

## Principal 정의 {id="principal"}

Principal은 애플리케이션이 인증된 호출자와 연결하는 신원(identity) 또는 기타 정보를 나타냅니다. Principal 타입은 null이 아니어야(non-null) 합니다.

```kotlin
data class User(
    val id: String,
    val email: String
)
```

## 스킴 생성 {id="create-scheme"}

각 인증 방식은 principal 타입, 이름 및 구성 블록을 받는 팩토리 함수를 제공합니다. `validate {}` 블록은 principal 타입을 반환하거나, 자격 증명이 거부된 경우 `null`을 반환합니다.

```kotlin
val jwtAuth = jwt<User>("my-jwt") {
    realm = "my-app"
    verifier(jwkProvider, issuer)
    validate { credential ->
        val payload = credential.payload
        User(
            id = payload.subject,
            email = payload.getClaim("email").asString()
        )
    }
}
```

팩토리는 값을 반환합니다. 이 값을 저장해 두었다가 해당 스킴이 필요한 라우트에 전달하세요.

| 팩토리 | 아티팩트 | 참고 사항 |
|-------------------------------------|----------------------------|-----------------------------------------|
| `basic<P>()`                        | `ktor-server-auth`         | [Ktor Server의 Basic 인증](server-basic-auth.md) 참조 |
| `digest<P>()`                       | `ktor-server-auth`         | JVM 전용. [Ktor Server의 Digest 인증](server-digest-auth.md) 참조 |
| `bearer<P>()`                       | `ktor-server-auth`         | [Ktor Server의 Bearer 인증](server-bearer-auth.md) 참조 |
| `form<P>()`                         | `ktor-server-auth`         | [Ktor Server의 폼 기반 인증](server-form-based-auth.md) 참조 |
| `session<S, P>()`                   | `ktor-server-auth`         | [타입 세이프 세션 인증](server-typed-session-auth.md) 참조 |
| `apiKey<P>()`                       | `ktor-server-auth-api-key` | [API Key 인증](server-api-key-auth.md) 참조 |
| `jwt<P>()`                          | `ktor-server-auth-jwt`     | JVM 전용. [JSON Web Tokens](server-jwt.md) 참조 |
| `oauth2()`, `oauth2Session<P, S>()` | `ktor-server-auth`         | [OAuth 2.0 플로우](server-oauth2-flows.md) 참조 |

스킴 이름은 고유해야 합니다. 동일한 이름으로 서로 다른 두 스킴을 생성하면 라우트에서 이를 사용하려고 할 때 두 번째 스킴에서 오류가 발생합니다.

## 라우트 보호 {id="protect-routes"}

라우트를 보호하려면 `authenticateWith()` 함수에 스킴을 전달합니다. 블록 내부에서 `call.principal`은 스킴에 정의된 principal 타입을 가지며, null이 아님이 보장됩니다.

```kotlin
routing {
    authenticateWith(jwtAuth) {
        get("/profile") {
            val user: User = call.principal
            call.respondText(user.email)
        }
    }
}
```

## 인증을 선택 사항으로 만들기 {id="optional"}

라우트가 로그인한 호출자와 익명 호출자를 모두 처리해야 하는 경우 `authenticateWithOptional()` 함수를 사용합니다. 블록 내부에서는 `call.principalOrNull`을 사용하여 principal에 접근합니다.

```kotlin
routing {
    authenticateWithOptional(jwtAuth) {
        get("/me") {
            val user = call.principalOrNull
            call.respondText(user?.email ?: "anonymous")
        }
    }
}
```

자격 증명이 없는 요청은 성공하며 `call.principalOrNull`은 `null`이 됩니다. 유효하지 않은 자격 증명이 포함된 요청은 여전히 실패합니다.

## 여러 스킴 허용 {id="any-of"}

동일한 라우트에서 둘 이상의 스킴을 허용하려면 `authenticateWithAnyOf()` 함수를 사용합니다. Ktor는 나열된 순서대로 스킴을 시도하며, 가장 먼저 성공한 스킴이 principal을 제공합니다.

모든 스킴은 호출 시 지정한 공통 타입에 부합하는 principal을 생성해야 합니다.

```kotlin
interface AppUser {
    val email: String
}

data class JwtUser(
    override val email: String,
    val id: String
) : AppUser

data class ApiUser(override val email: String) : AppUser

val jwtScheme = jwt<JwtUser>("my-jwt") { /* ... */ }
val apiKeyScheme = apiKey<ApiUser>("my-api-key") { /* ... */ }

routing {
    // AppUser 사용
    authenticateWithAnyOf<AppUser>(jwtScheme, apiKeyScheme) {
        get("/profile") {
            call.respondText(call.principal.email)
        }
    }
}
```

> `authenticateWithAnyOf()` 내부에서는 `call.principal`만 사용할 수 있습니다. [세션 스킴](server-typed-session-auth.md)의 `call.session`과 같이 단일 스킴에 종속된 부가 기능은 사용할 수 없습니다.
>
{style="note"}

## 익명 호출자 허용 {id="anonymous"}

자격 증명이 없는 호출자에게 서비스를 제공하는 스킴을 만들려면 `orAnonymous()` 함수를 사용합니다. 자격 증명이 없는 요청은 블록이 반환하는 principal을 받습니다. 유효하지 않은 자격 증명이 포함된 요청은 여전히 실패합니다.

그 결과 두 타입의 공통 슈퍼타입을 principal 타입으로 갖는 스킴이 생성됩니다.

```kotlin
interface Identity

data class AuthenticatedUser(val id: String) : Identity
data class GuestUser(val label: String = "guest") : Identity

val feedAuth = jwt<AuthenticatedUser>("my-jwt") {
    verifier(jwkProvider, issuer)
    validate { credential ->
        AuthenticatedUser(credential.payload.subject)
    }
}.orAnonymous { GuestUser() }

routing {
    authenticateWith(feedAuth) {
        get("/feed") {
            when (val user = call.principal) {
                is AuthenticatedUser ->
                    call.respondText(user.id)
                is GuestUser ->
                    call.respondText(user.label)
            }
        }
    }
}
```

## Principal 변환 {id="map-principal"}

데이터베이스에서 사용자 레코드를 로드하는 등의 작업을 통해 principal을 다른 타입으로 변환하려면 `mapPrincipal()` 함수를 사용합니다.

```kotlin
data class AppUser(val id: String, val email: String)

val appAuth = jwtAuth.mapPrincipal { jwtUser ->
    userDirectory.find(jwtUser.id)?.let { row ->
        AppUser(id = row.id, email = row.email)
    }
}
```

변환은 스킴이 principal을 생성한 후에만 실행됩니다. 변환 결과가 `null`을 반환하면 요청은 `401 Unauthorized`로 거부됩니다.

## 역할 확인 {id="roles"}

역할(Role) 확인은 선택적으로 사용할 수 있습니다. `AuthenticationRole`을 구현하는 역할 타입을 정의한 다음, `withRoles()`를 사용하여 역할을 인식하는 스킴을 빌드합니다.

```kotlin
enum class Role : AuthenticationRole {
    User, Admin, Moderator
}

val roleAuth = jwtAuth.withRoles { user ->
    roleService.resolveRoles(user.id)
}
```

`withRoles {}` 블록은 인증이 성공한 후 모든 요청마다 실행됩니다. 데이터베이스, 캐시 또는 principal 자체에서 역할을 로드하는 데 사용하세요.

`roles` 파라미터를 사용하여 라우트에 필요한 역할을 선언합니다.

```kotlin
routing {
    authenticateWith(roleAuth, roles = setOf(Role.Admin)) {
        get("/admin") {
            val userRoles: Set<Role> = call.principal.roles
            call.respondText(userRoles.joinToString { it.name })
        }
    }
}
```

인증에는 성공했지만 필수 역할이 없는 호출자는 `403 Forbidden`을 받게 됩니다. 호출자는 세트에 지정된 역할 중 하나만이 아니라 모든 역할을 가지고 있어야 합니다.

역할을 요구하지 않고 확인(resolve)만 하려면 `roles = null`을 전달합니다. 이는 핸들러 자체에서 판단해야 할 때 유용합니다.

```kotlin
authenticateWith(roleAuth, roles = null) {
    get("/dashboard") {
        if (Role.Admin in call.principal.roles) {
            call.respondText("admin view")
        } else {
            call.respondText("user view")
        }
    }
}
```

`roles` 프로퍼티는 역할을 인식하는 라우트 내부에서만 존재합니다. 일반 스킴으로 보호되는 라우트에서는 컴파일되지 않습니다.

## 실패 처리 {id="failures"}

두 가지 문제가 발생할 수 있으며, 각각 별도로 처리됩니다.

* `onUnauthorized`: 인증에 실패할 때 실행됩니다. 기본 응답은 `401 Unauthorized`입니다.
* `onForbidden`: 인증은 성공했으나 호출자에게 필요한 역할이 없을 때 실행됩니다. 기본 응답은 `403 Forbidden`입니다.

해당 스킴을 사용하는 모든 라우트에 적용되도록 스킴에 핸들러를 설정할 수 있습니다.

```kotlin
val jwtAuth = jwt<User>("my-jwt") {
    verifier(jwkProvider, issuer)
    validate { credential -> /* ... */ }
    onUnauthorized = { cause ->
        val message = cause.toString()
        call.respond(HttpStatusCode.Unauthorized, message)
    }
}

val roleAuth = jwtAuth.withRoles(
    onForbidden = {
        val forbidden = HttpStatusCode.Forbidden
        call.respondText("Not allowed", status = forbidden)
    }
) { user ->
    roleService.resolveRoles(user.id)
}
```

또는 단일 라우트에 핸들러를 설정하여 스킴 수준의 설정을 덮어쓸 수도 있습니다.

```kotlin
authenticateWith(
    roleAuth,
    roles = setOf(Role.Admin),
    onUnauthorized = { call.respondRedirect("/login") },
    onForbidden = {
        val forbidden = HttpStatusCode.Forbidden
        call.respondText("Admins only", status = forbidden)
    },
) {
    get("/admin") {
        call.respondText(call.principal.email)
    }
}
```

Ktor는 다음 순서로 unauthorized 핸들러를 찾습니다.

1. `authenticateWith()`에 전달된 핸들러.
2. 스킴에 구성된 `onUnauthorized` 핸들러.
3. 프로바이더의 기본 챌린지.

이 중 아무것도 응답하지 않으면 요청은 `401 Unauthorized`로 실패합니다.

`authenticateWithAnyOf()`의 경우, 핸들러가 스킴 이름과 실패 원인 매핑(map)을 수신하므로 각 스킴이 실패한 이유를 보고할 수 있습니다.

```kotlin
authenticateWithAnyOf<AppUser>(
    jwtScheme,
    apiKeyScheme,
    onUnauthorized = { failures ->
        val schemes = failures.keys.joinToString()
        call.respond(HttpStatusCode.Unauthorized, schemes)
    }
) {
    get("/profile") { /* ... */ }
}
```

## 클래식 API와 결합 {id="mixing"}

동일한 애플리케이션에서 두 인증 API를 함께 사용할 수 있습니다. 이름 기반 프로바이더 API로 보호되는 라우트 내에 타입 세이프 라우트를 중첩하거나, 타입 세이프 라우트 내에 프로바이더 기반 라우트를 중첩할 수 있습니다.

```kotlin
routing {
    authenticate("auth-session") {
        authenticateWith(basicAuth) {
            get("/admin") {
                val basicUser = call.principal
                val sessionUser = 
                    checkNotNull(call.principal<SessionUser>())
                if (basicUser.name == sessionUser.name) {
                    call.respondText("You are ${basicUser.name}!")
                } else {
                    call.respondText("Who are you?")
                }
            }
        }
    }

    authenticate(basicAuth.name) {
        get("/hello") {
            val user = checkNotNull(call.principal<BasicUser>())
            call.respondText("Hello ${user.name}!")
        }
    }
}
```

중첩된 인증 레이어는 순서대로 적용됩니다.

## 제한 사항 {id="limitations"}

* 이 API는 실험적(experimental)입니다. 마이너 릴리스에서 변경될 수 있습니다.
* 이 API는 Kotlin 컨텍스트 파라미터를 사용하므로 Kotlin 2.4.0 또는 `-Xcontext-parameters` 컴파일러 옵션이 필요합니다.
* `authenticateWithAnyOf()` 함수는 `call.principal`만 제공합니다. 그 내부에서는 `call.session`과 같은 스킴 전용 프로퍼티를 사용할 수 없습니다.
* LDAP 프로바이더에 해당하는 타입 세이프 버전은 없습니다. 대신 타입이 지정된 `validate {}` 블록 내부에서 [`ldapAuthenticate()`](server-ldap.md)를 호출하세요.