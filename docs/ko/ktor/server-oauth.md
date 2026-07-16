[//]: # (title: OAuth)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="OAuth"/>
<var name="artifact_name" value="ktor-server-auth"/>

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
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native 서버</Links> 지원</b>: ✅
</p>
</tldr>

[OAuth](https://oauth.net/)는 액세스 위임(access delegation)을 위한 개방형 표준입니다. OAuth를 사용하면 Google, Facebook, Twitter 등과 같은 외부 제공자를 사용하여 애플리케이션의 사용자를 인증(authorize)할 수 있습니다.

`oauth` 제공자는 권한 부여 코드 플로우(authorization code flow)를 지원합니다. OAuth 파라미터를 한 곳에서 구성할 수 있으며, Ktor는 필요한 파라미터와 함께 지정된 권한 부여 서버로 자동 요청을 보냅니다.

> Ktor의 인증 및 인가에 대한 일반적인 정보는 [Ktor 서버의 인증 및 인가(Authentication and authorization in Ktor Server)](server-auth.md) 섹션에서 확인할 수 있습니다.

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

## Sessions 플러그인 설치

클라이언트가 보호된 리소스에 액세스하려고 할 때마다 권한 부여를 요청하는 것을 방지하기 위해, 권한 부여 성공 시 액세스 토큰을 세션에 저장할 수 있습니다.
그런 다음 보호된 라우트의 핸들러 내에서 현재 세션으로부터 액세스 토큰을 가져와 리소스를 요청하는 데 사용할 수 있습니다.

```kotlin
import io.ktor.server.sessions.*

fun Application.main(httpClient: HttpClient = applicationHttpClient) {
    install(Sessions) {
        cookie<UserSession>("user_session")
    }
}

@Serializable
data class UserSession(val state: String, val token: String)
```

## OAuth 권한 부여 플로우 {id="flow"}

Ktor 애플리케이션에서의 OAuth 권한 부여 플로우는 다음과 같이 진행됩니다:

1. 사용자가 Ktor 애플리케이션의 로그인 페이지를 엽니다.
2. Ktor는 특정 제공자의 권한 부여 페이지로 자동 리다이렉트하며 필요한 [파라미터](#configure-oauth-provider)를 전달합니다:
    * 선택한 제공자의 API에 액세스하는 데 사용되는 클라이언트 ID.
    * 권한 부여가 완료된 후 열릴 Ktor 애플리케이션 페이지를 지정하는 콜백 또는 리다이렉트 URL.
    * Ktor 애플리케이션에 필요한 서드파티 리소스의 스코프(Scopes).
    * 액세스 토큰을 얻기 위해 사용되는 권한 부여 유형 (Authorization Code).
    * CSRF 공격을 방지하고 사용자를 리다이렉트하는 데 사용되는 `state` 파라미터.
    * 특정 제공자에 특화된 선택적 파라미터.
3. 권한 부여 페이지에는 Ktor 애플리케이션에 필요한 권한 수준이 표시된 동의 화면이 나타납니다. 이 권한은 [2단계: OAuth 제공자 구성](#configure-oauth-provider)에서 구성한 지정된 스코프에 따라 달라집니다.
4. 사용자가 요청된 권한을 승인하면, 권한 부여 서버는 지정된 리다이렉트 URL로 다시 리다이렉트하며 권한 부여 코드를 보냅니다.
5. Ktor는 다음 파라미터를 포함하여 지정된 액세스 토큰 URL로 자동 요청을 한 번 더 보냅니다:
    * 권한 부여 코드.
    * 클라이언트 ID 및 클라이언트 시크릿.

   권한 부여 서버는 액세스 토큰을 반환하여 응답합니다.
6. 이제 클라이언트는 이 토큰을 사용하여 선택한 제공자의 필요한 서비스에 요청을 보낼 수 있습니다. 대부분의 경우 토큰은 `Bearer` 스키마를 사용하여 `Authorization` 헤더에 담겨 전송됩니다.
7. 서비스는 토큰을 검증하고, 해당 스코프를 권한 부여에 사용한 뒤 요청된 데이터를 반환합니다.

## OAuth 설치 {id="install"}

`oauth` 인증 제공자를 설치하려면, `install` 블록 내에서 [oauth](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/oauth.html) 함수를 호출하세요. 선택적으로 [제공자 이름](server-auth.md#provider-name)을 지정할 수 있습니다.
예를 들어, "auth-oauth-google"이라는 이름으로 `oauth` 제공자를 설치하는 방법은 다음과 같습니다:

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*

fun Application.main(httpClient: HttpClient = applicationHttpClient) {
    install(Authentication) {
        oauth("auth-oauth-google") {
            // oauth 인증 구성
            urlProvider = { "http://localhost:8080/callback" }
        }
    }
}
```

## OAuth 구성 {id="configure-oauth"}

이 섹션에서는 Google을 사용하여 애플리케이션 사용자를 인증하도록 `oauth` 제공자를 구성하는 방법을 보여줍니다.
전체 실행 가능한 예제는 [auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google)을 참조하세요.

### 사전 준비: 권한 부여 자격 증명 생성 {id="authorization-credentials"}

Google API에 액세스하려면 Google Cloud Console에서 권한 부여 자격 증명(authorization credentials)을 생성해야 합니다.

1. Google Cloud Console의 [사용자 인증 정보](https://console.cloud.google.com/apis/credentials) 페이지를 엽니다.
2. **사용자 인증 정보 만들기**를 클릭하고 `OAuth 클라이언트 ID`를 선택합니다.
3. 드롭다운에서 `웹 애플리케이션`을 선택합니다.
4. 다음 설정을 지정합니다:
    * **승인된 JavaScript 원본**: `http://localhost:8080`.
    * **승인된 리다이렉션 URI**: `http://localhost:8080/callback`.
      Ktor에서 [urlProvider](#configure-oauth-provider) 속성은 권한 부여가 완료되었을 때 열릴 리다이렉트 라우트를 지정하는 데 사용됩니다.

5. **만들기**를 클릭합니다.
6. 나타나는 대화 상자에서 `oauth` 제공자를 구성하는 데 사용할 클라이언트 ID와 클라이언트 시크릿을 복사합니다.

### 1단계: HTTP 클라이언트 생성 {id="create-http-client"}

`oauth` 제공자를 구성하기 전에, 서버에서 OAuth 서버로 요청을 보내는 데 사용할 [HttpClient](client-create-and-configure.md)를 생성해야 합니다. [API 요청 후](#request-api) 수신된 JSON 데이터를 역직렬화하려면 JSON 직렬화 도구가 포함된 [ContentNegotiation](client-serialization.md) 클라이언트 플러그인이 필요합니다.

```kotlin
val applicationHttpClient = HttpClient(CIO) {
    install(ContentNegotiation) {
        json(Json {
            ignoreUnknownKeys = true
        })
    }
}
```

클라이언트 인스턴스는 서버 [테스트](server-testing.md)에서 별도의 클라이언트 인스턴스를 생성할 수 있도록 `main` [모듈 함수](server-modules.md)로 전달됩니다.

```kotlin
fun Application.main(httpClient: HttpClient = applicationHttpClient) {
}
```

### 2단계: OAuth 제공자 구성 {id="configure-oauth-provider"}

아래 코드 스니펫은 `auth-oauth-google`이라는 이름으로 `oauth` 제공자를 생성하고 구성하는 방법을 보여줍니다.

```kotlin
val redirects = ConcurrentMap<String, String>()
install(Authentication) {
    oauth("auth-oauth-google") {
        // oauth 인증 구성
        urlProvider = { "http://localhost:8080/callback" }
        providerLookup = {
            OAuthServerSettings.OAuth2ServerSettings(
                name = "google",
                authorizeUrl = "https://accounts.google.com/o/oauth2/auth",
                accessTokenUrl = "https://accounts.google.com/o/oauth2/token",
                requestMethod = HttpMethod.Post,
                clientId = System.getenv("GOOGLE_CLIENT_ID"),
                clientSecret = System.getenv("GOOGLE_CLIENT_SECRET"),
                defaultScopes = listOf("https://www.googleapis.com/auth/userinfo.profile"),
                extraAuthParameters = listOf("access_type" to "offline"),
                onStateCreated = { call, state ->
                    // 리다이렉트 url 값과 함께 새로운 state 저장
                    call.request.queryParameters["redirectUrl"]?.let {
                        redirects[state] = it
                    }
                }
            )
        }
        fallback = { cause ->
            if (cause is OAuth2RedirectError) {
                respondRedirect("/login-after-fallback")
            } else {
                respond(HttpStatusCode.Forbidden, cause.message)
            }
        }
        client = httpClient
    }
}
```

* `urlProvider`는 권한 부여가 완료되었을 때 호출될 [리다이렉트 라우트](#redirect-route)를 지정합니다.
  > 이 라우트가 [**승인된 리다이렉션 URI**](#authorization-credentials) 목록에 추가되어 있는지 확인하세요.
* `providerLookup`을 사용하면 필요한 제공자에 대한 OAuth 설정을 지정할 수 있습니다. 이 설정은 [OAuthServerSettings](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-o-auth-server-settings/index.html) 클래스로 표현되며 Ktor가 OAuth 서버에 자동 요청을 보낼 수 있도록 합니다.
* `fallback` 속성은 리다이렉트나 커스텀 응답을 통해 OAuth 플로우 오류를 처리합니다.
* `client` 속성은 Ktor가 OAuth 서버에 요청을 보낼 때 사용할 [HttpClient](#create-http-client)를 지정합니다.

### 3단계: 로그인 라우트 추가 {id="login-route"}

`oauth` 제공자를 구성한 후, `oauth` 제공자의 이름을 인자로 받는 `authenticate` 함수 내부에 [보호된 로그인 라우트를 생성](server-auth.md#authenticate-route)해야 합니다. Ktor가 이 라우트에 대한 요청을 받으면, [providerLookup](#configure-oauth-provider)에 정의된 `authorizeUrl`로 자동 리다이렉트됩니다.

```kotlin
routing {
    authenticate("auth-oauth-google") {
        get("/login") {
            // 'authorizeUrl'로 자동 리다이렉트됨
        }
    }
}
```

사용자는 Ktor 애플리케이션에 필요한 권한 수준이 표시된 권한 부여 페이지를 보게 됩니다. 이 권한은 [providerLookup](#configure-oauth-provider)에 지정된 `defaultScopes`에 따라 달라집니다.

### 4단계: 리다이렉트 라우트 추가 {id="redirect-route"}

로그인 라우트 외에도, [2단계: OAuth 제공자 구성](#configure-oauth-provider)에서 지정한 `urlProvider`에 대한 리다이렉트 라우트를 생성해야 합니다.

이 라우트 내부에서는 `call.principal` 함수를 사용하여 [OAuthAccessTokenResponse](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-o-auth-access-token-response/index.html) 객체를 가져올 수 있습니다. `OAuthAccessTokenResponse`를 통해 OAuth 서버가 반환한 토큰 및 기타 파라미터에 액세스할 수 있습니다.

```kotlin
    routing {
        authenticate("auth-oauth-google") {
            get("/login") {
                // 'authorizeUrl'로 자동 리다이렉트됨
            }

            get("/callback") {
                val currentPrincipal: OAuthAccessTokenResponse.OAuth2? = call.principal()
                // 권한 부여 전에 url을 찾을 수 없는 경우 홈으로 리다이렉트
                currentPrincipal?.let { principal ->
                    principal.state?.let { state ->
                        call.sessions.set(UserSession(state, principal.accessToken))
                        redirects.remove(state)?.let { redirect ->
                            call.respondRedirect(redirect)
                            return@get
                        }
                    }
                }
                call.respondRedirect("/home")
            }
        }
    }
```

이 예제에서는 토큰을 받은 후 다음 작업이 수행됩니다:

* 토큰이 [세션(Session)](server-sessions.md)에 저장되며, 해당 내용은 다른 라우트 내부에서 액세스할 수 있습니다.
* 사용자는 Google API에 대한 요청이 이루어지는 다음 라우트로 리다이렉트됩니다.
* 요청된 라우트를 찾을 수 없는 경우 사용자는 `/home` 라우트로 리다이렉트됩니다.

### 5단계: API 요청 수행 {id="request-api"}

[리다이렉트 라우트](#redirect-route) 내부에서 토큰을 받고 이를 세션에 저장한 후, 이 토큰을 사용하여 외부 API에 요청을 보낼 수 있습니다. 아래 코드 스니펫은 [HttpClient](#create-http-client)를 사용하여 이러한 요청을 수행하고, `Authorization` 헤더에 토큰을 보내 사용자의 정보를 가져오는 방법을 보여줍니다.

요청을 수행하고 응답 본문을 반환할 `getPersonalGreeting`이라는 새 함수를 만듭니다:

```kotlin
private suspend fun getPersonalGreeting(
    httpClient: HttpClient,
    userSession: UserSession
): UserInfo = httpClient.get("https://www.googleapis.com/oauth2/v2/userinfo") {
    headers {
        append(HttpHeaders.Authorization, "Bearer ${userSession.token}")
    }
}.body()
```

그런 다음 `get` 라우트 내에서 이 함수를 호출하여 사용자의 정보를 가져올 수 있습니다:

```kotlin
get("/{path}") {
    val userSession: UserSession? = getSession(call)
    if (userSession != null) {
        val userInfo: UserInfo = getPersonalGreeting(httpClient, userSession)
        call.respondText("Hello, ${userInfo.name}!")
    }
}
```

전체 실행 가능한 예제는 [auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google)을 참조하세요.