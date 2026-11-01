[//]: # (title: OAuth)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="OAuth"/>
<var name="artifact_name" value="ktor-server-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="auth-oauth-google"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native 서버</Links> 지원</b>: ✅
</p>
</tldr>

[OAuth](https://oauth.net/)는 접근 권한 위임을 위한 공개 표준입니다. OAuth를 사용하면 Google, Facebook, Twitter 등과 같은 외부 제공자(Provider)를 활용하여 애플리케이션 사용자를 인증할 수 있습니다.

`oauth` 제공자는 인가 코드 흐름(Authorization Code Flow)을 지원합니다. 한 곳에서 OAuth 매개변수를 구성하면, Ktor가 필요한 매개변수와 함께 지정된 인가 서버로 자동으로 요청을 전송합니다.

> Ktor의 인증 및 인가에 대한 일반적인 정보는 [Ktor Server의 인증 및 인가](server-auth.md) 섹션에서 확인할 수 있습니다.

> Ktor는 타입 안전한 OAuth 2.0 흐름(Flow)도 제공합니다. 이름을 가진 제공자를 구성하는 대신 흐름 값을 생성하여 설치하면, Ktor가 로그인 및 콜백 라우트를 자동으로 생성해 줍니다. 또한 `oauth2Session` 흐름을 통해 로그인 후 애플리케이션 라우트를 보호하기 위한 체계도 제공합니다. 자세한 내용은 [OAuth 2.0 흐름](server-oauth2-flows.md)을 참조하세요.
>
{style="tip"}

> 사용 중인 제공자가 OpenID Connect를 지원하는 경우 `Oidc` 플러그인을 통해 더 많은 기능을 활용할 수 있습니다. 제공자의 디스커버리 문서를 읽어오므로 인가, 토큰, JWKS 엔드포인트 대신 발급자(Issuer) URL만 구성하면 되며, PKCE, ID 토큰 검증, 세션 및 로그아웃을 자동으로 처리해 줍니다. 자세한 내용은 [OpenID Connect](server-oidc.md)를 참조하세요.
>
{style="tip"}

## 의존성 추가 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code>을(를) 사용하려면 빌드 스크립트에 <code>%artifact_name%</code> 아티팩트를 추가하세요.
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            위 코드 스니펫은 Ktor 의존성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 버전 카탈로그</a>를 사용합니다.
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            위 코드 스니펫은 Ktor 의존성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 버전 카탈로그</a>를 사용합니다.
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## Sessions 플러그인 설치 {id="install-the-sessions-plugin"}

클라이언트가 보호된 리소스에 접근하려고 할 때마다 인가를 요청하는 것을 방지하기 위해, 인가 성공 시 세션에 액세스 토큰을 저장할 수 있습니다.
그런 다음 보호된 라우트의 핸들러 내에서 현재 세션으로부터 액세스 토큰을 가져와 리소스를 요청하는 데 사용할 수 있습니다.

```kotlin
import io.ktor.server.sessions.*

fun Application.main(
    httpClient: HttpClient = applicationHttpClient
) {
    install(Sessions) {
        cookie<UserSession>("user_session")
    }
}

@Serializable
data class UserSession(val state: String, val token: String)
```

## OAuth 인가 흐름 {id="flow"}

Ktor 애플리케이션에서의 OAuth 인가 흐름은 다음과 같이 진행됩니다.

1. 사용자가 Ktor 애플리케이션의 로그인 페이지를 엽니다.
2. Ktor가 특정 제공자의 인가 페이지로 자동 리다이렉트하며 필요한 [매개변수](#configure-oauth-provider)를 전달합니다.
    * 선택한 제공자의 API에 접근하는 데 사용되는 클라이언트 ID.
    * 인가가 완료된 후 열릴 Ktor 애플리케이션 페이지를 지정하는 콜백 또는 리다이렉트 URL.
    * Ktor 애플리케이션에 필요한 서드파티 리소스의 스코프(Scopes).
    * 액세스 토큰을 얻는 데 사용되는 그랜트 타입(Grant Type, Authorization Code).
    * CSRF 공격을 방지하고 사용자를 리다이렉트하는 데 사용되는 `state` 매개변수.
    * 특정 제공자에 한정된 선택적 매개변수.
3. 인가 페이지에 Ktor 애플리케이션에 필요한 권한 수준을 나타내는 동의 화면이 표시됩니다. 이 권한은 [2단계: OAuth 제공자 구성](#configure-oauth-provider)에서 구성한 지정된 스코프에 따라 결정됩니다.
4. 사용자가 요청된 권한을 승인하면, 인가 서버는 지정된 리다이렉트 URL로 다시 리다이렉트하며 인가 코드를 전달합니다.
5. Ktor는 다음 매개변수를 포함하여 지정된 액세스 토큰 URL로 한 번 더 자동 요청을 전송합니다.
    * 인가 코드.
    * 클라이언트 ID 및 클라이언트 시크릿.

   인가 서버는 액세스 토큰을 반환하여 응답합니다.
6. 클라이언트는 이 토큰을 사용하여 선택한 제공자의 필요한 서비스에 요청을 보낼 수 있습니다. 대부분의 경우 토큰은 `Bearer` 스키마를 사용하여 `Authorization` 헤더에 담겨 전송됩니다.
7. 서비스는 토큰을 검증하고 스코프를 인가에 활용한 후 요청된 데이터를 반환합니다.

## OAuth 설치 {id="install"}

`oauth` 인증 제공자를 설치하려면 `install` 블록 내부에서 [oauth](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/oauth.html) 함수를 호출합니다. 선택 사항으로 [제공자 이름을 지정](server-auth.md#provider-name)할 수도 있습니다.
예를 들어 "auth-oauth-google"이라는 이름으로 `oauth` 제공자를 설치하는 방법은 다음과 같습니다.

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*

fun Application.main(
    httpClient: HttpClient = applicationHttpClient
) {
    install(Authentication) {
        oauth("auth-oauth-google") {
            // OAuth 인증 구성
            urlProvider = { "http://localhost:8080/callback" }
            client = httpClient
        }
    }
}
```

## OAuth 구성 {id="configure-oauth"}

이 섹션에서는 Google을 사용하여 애플리케이션 사용자를 인가하도록 `oauth` 제공자를 구성하는 방법을 보여줍니다.
실행 가능한 전체 예제는 [auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google)을 참조하세요.

### 사전 준비: 인가 자격 증명 생성 {id="authorization-credentials"}

Google API에 접근하려면 Google Cloud Console에서 인가 자격 증명(Authorization Credentials)을 생성해야 합니다.

1. Google Cloud Console에서 [사용자 인증 정보](https://console.cloud.google.com/apis/credentials) 페이지를 엽니다.
2. **사용자 인증 정보 만들기**를 클릭하고 `OAuth 클라이언트 ID`를 선택합니다.
3. 드롭다운에서 `웹 애플리케이션`을 선택합니다.
4. 다음 설정을 지정합니다.
    * **승인된 자바스크립트 원본**: `http://localhost:8080`.
    * **승인된 리디렉션 URI**: `http://localhost:8080/callback`.
      Ktor에서는 인가가 완료되었을 때 열릴 리다이렉트 라우트를 지정하기 위해 [urlProvider](#configure-oauth-provider) 속성을 사용합니다.

5. **만들기**를 클릭합니다.
6. 표시되는 대화상자에서 생성된 클라이언트 ID와 클라이언트 시크릿을 복사합니다. 이는 `oauth` 제공자를 구성하는 데 사용됩니다.

### 1단계: HTTP 클라이언트 생성 {id="create-http-client"}

`oauth` 제공자를 구성하기 전에, 서버가 OAuth 서버로 요청을 보낼 때 사용할 [HttpClient](client-create-and-configure.md)를 생성해야 합니다. [API 요청 후](#request-api) 수신된 JSON 데이터를 역직렬화하려면 JSON 직렬 변환기가 포함된 [ContentNegotiation](client-serialization.md) 클라이언트 플러그인이 필요합니다.

```kotlin
val applicationHttpClient = HttpClient(CIO) {
    install(ContentNegotiation) {
        json(Json {
            ignoreUnknownKeys = true
        })
    }
}
```

서버 [테스트](server-testing.md)에서 별도의 클라이언트 인스턴스를 생성할 수 있도록 클라이언트 인스턴스를 `main` [모듈 함수](server-modules.md)로 전달합니다.

```kotlin
fun Application.main(
    httpClient: HttpClient = applicationHttpClient
) {
}
```

### 2단계: OAuth 제공자 구성 {id="configure-oauth-provider"}

아래 코드 스니펫은 `auth-oauth-google`이라는 이름으로 `oauth` 제공자를 생성하고 구성하는 방법을 보여줍니다.
고정된 OAuth 설정이 있는 제공자의 경우 `settings` 속성을 사용합니다.

```kotlin
val googleAuthorizeUrl =
    "https://accounts.google.com/o/oauth2/auth"
val googleTokenUrl =
    "https://accounts.google.com/o/oauth2/token"
val profileScope =
    "https://www.googleapis.com/auth/userinfo.profile"
val googleClientId =
    System.getenv("GOOGLE_CLIENT_ID").orEmpty()
val googleClientSecret =
    System.getenv("GOOGLE_CLIENT_SECRET").orEmpty()
val redirects = ConcurrentMap<String, String>()
install(Authentication) {
    oauth("auth-oauth-google") {
        // OAuth 인증 구성
        urlProvider = { "http://localhost:8080/callback" }
        settings = OAuthServerSettings.OAuth2ServerSettings(
                name = "google",
                authorizeUrl = googleAuthorizeUrl,
                accessTokenUrl = googleTokenUrl,
                requestMethod = HttpMethod.Post,
                clientId = googleClientId,
                clientSecret = googleClientSecret,
                defaultScopes = listOf(profileScope),
                extraAuthParameters =
                    listOf("access_type" to "offline"),
                onStateCreated = { call, state ->
                    // 새로운 state와 리다이렉트 URL 저장
                    val query = call.request.queryParameters
                    query["redirectUrl"]?.let {
                        redirects[state] = it
                    }
                }
            )
        fallback = { cause ->
            if (cause is OAuth2RedirectError) {
                respondRedirect("/login-after-fallback")
            } else {
                respond(
                    HttpStatusCode.Forbidden,
                    cause.message
                )
            }
        }
        client = httpClient
    }
}
```

* `urlProvider`는 인가가 완료되었을 때 호출될 [리다이렉트 라우트](#redirect-route)를 지정합니다.
  > 이 라우트가 [**승인된 리디렉션 URI**](#authorization-credentials) 목록에 추가되어 있는지 확인하세요.
* `settings` 속성은 제공자에 대한 정적 OAuth 설정을 지정합니다. 이 설정은 [OAuthServerSettings](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-o-auth-server-settings/index.html) 클래스로 표현되며 Ktor가 OAuth 서버로 자동 요청을 보낼 수 있도록 합니다. 정적 제공자 구성에는 `providerLookup`보다 `settings`를 사용하는 것이 좋습니다. Ktor가 생성된 [OpenAPI 명세](openapi-spec-generation.md)에 대한 메타데이터를 추론할 수도 있기 때문입니다.
* `fallback` 속성은 리다이렉트 또는 커스텀 응답을 반환하여 OAuth 흐름 오류를 처리합니다.
* `client` 속성은 Ktor가 OAuth 서버로 요청을 보낼 때 사용하는 [HttpClient](#create-http-client)를 지정합니다.

> 특정 호출에 대해 OAuth 설정을 동적으로 확인하기 위한 `providerLookup` 속성도 계속 지원됩니다. 테넌트별 자격 증명이나 엔드포인트처럼 제공자 구성이 요청 데이터에 따라 달라지는 경우에 이를 사용하세요.

### 3단계: 로그인 라우트 추가 {id="login-route"}

`oauth` 제공자를 구성한 후에는 `oauth` 제공자의 이름을 받는 `authenticate` 함수 내부에 [보호된 로그인 라우트를 생성](server-auth.md#authenticate-route)해야 합니다. Ktor가 이 라우트로 요청을 받으면 [settings](#configure-oauth-provider)에 정의된 `authorizeUrl`로 자동 리다이렉트됩니다.

```kotlin
routing {
    authenticate("auth-oauth-google") {
        get("/login") {
            // 자동으로 'authorizeUrl'로 리다이렉트됨
        }
    }
}
```

사용자에게는 Ktor 애플리케이션에 필요한 권한 수준이 표시된 인가 페이지가 나타납니다. 이 권한은 [settings](#configure-oauth-provider)에 지정된 `defaultScopes`에 따라 달라집니다.

### 4단계: 리다이렉트 라우트 추가 {id="redirect-route"}

로그인 라우트 외에도 [2단계: OAuth 제공자 구성](#configure-oauth-provider)에 지정된 `urlProvider`를 위한 리다이렉트 라우트를 생성해야 합니다.

이 라우트 내부에서는 `call.principal` 함수를 사용하여 [OAuthAccessTokenResponse](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-o-auth-access-token-response/index.html) 객체를 가져올 수 있습니다. `OAuthAccessTokenResponse`를 통해 OAuth 서버에서 반환된 토큰 및 기타 매개변수에 접근할 수 있습니다.

```kotlin
    routing {
        authenticate("auth-oauth-google") {
            get("/login") {
                // 자동으로 'authorizeUrl'로 리다이렉트됨
            }

            get("/callback") {
                val currentPrincipal:
                    OAuthAccessTokenResponse.OAuth2? =
                        call.principal()
                // 인가 전에 URL을 찾을 수 없는 경우 홈으로 리다이렉트
                currentPrincipal?.let { principal ->
                    principal.state?.let { state ->
                        val session = UserSession(
                            state,
                            principal.accessToken
                        )
                        call.sessions.set(session)
                        redirects.remove(state)?.let { url ->
                            call.respondRedirect(url)
                            return@get
                        }
                    }
                }
                call.respondRedirect("/home")
            }
        }
    }
```

이 예제에서는 토큰을 받은 후 다음 작업이 수행됩니다.

* 토큰이 [세션](server-sessions.md)에 저장되며, 이 세션의 내용은 다른 라우트 내부에서 접근할 수 있습니다.
* 사용자는 Google API 요청이 수행되는 다음 라우트로 리다이렉트됩니다.
* 요청된 라우트를 찾을 수 없는 경우 사용자는 `/home` 라우트로 리다이렉트됩니다.

### 5단계: API 요청 수행 {id="request-api"}

[리다이렉트 라우트](#redirect-route) 내에서 토큰을 수신하여 세션에 저장한 후에는, 이 토큰을 사용하여 외부 API에 요청을 보낼 수 있습니다. 아래 코드 스니펫은 [HttpClient](#create-http-client)를 사용하여 요청을 보내고 이 토큰을 `Authorization` 헤더에 전달하여 사용자 정보를 가져오는 방법을 보여줍니다.

요청을 보내고 응답 본문을 반환하는 `getPersonalGreeting`이라는 새 함수를 생성합니다.

```kotlin
private suspend fun getPersonalGreeting(
    httpClient: HttpClient,
    userSession: UserSession
): UserInfo = httpClient.get(
    "https://www.googleapis.com/oauth2/v2/userinfo"
) {
    headers {
        val bearer = "Bearer ${userSession.token}"
        append(HttpHeaders.Authorization, bearer)
    }
}.body()
```

그런 다음 `get` 라우트 내에서 이 함수를 호출하여 사용자 정보를 가져올 수 있습니다.

```kotlin
get("/{path}") {
    val userSession: UserSession? = getSession(call)
    if (userSession != null) {
        val userInfo: UserInfo =
            getPersonalGreeting(httpClient, userSession)
        call.respondText("Hello, ${userInfo.name}!")
    }
}
```

실행 가능한 전체 예제는 [auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google)을 참조하세요.