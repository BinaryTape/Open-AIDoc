[//]: # (title: Ktor 서버의 폼 기반 인증)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<p>
<b>코드 예제</b>:
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-html-dsl">auth-form-html-dsl</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-session">auth-form-session</a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native 서버</Links> 지원</b>: ✅
</p>
</tldr>

폼 기반 인증(Form-based authentication)은 [웹 폼](https://developer.mozilla.org/en-US/docs/Learn/Forms)을 사용하여 자격 증명(credential) 정보를 수집하고 사용자를 인증합니다.
Ktor에서 웹 폼을 만들려면 [HTML DSL](server-html-dsl.md#html_response)을 사용하거나 FreeMarker, Velocity 등과 같은 JVM [템플릿 엔진](server-templating.md) 중에서 선택할 수 있습니다.

> 폼 기반 인증을 사용할 때는 사용자 이름과 비밀번호가 일반 텍스트(clear text)로 전달되므로, 민감한 정보를 보호하기 위해 [HTTPS/TLS](server-ssl.md)를 사용해야 합니다.

## 의존성 추가 {id="add_dependencies"}
`form` 인증을 활성화하려면 빌드 스크립트에 `%artifact_name%` 아티팩트를 포함해야 합니다.

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

## 폼 기반 인증 흐름 {id="flow"}

폼 기반 인증 흐름은 다음과 같습니다.

1. 인증되지 않은 클라이언트가 서버 애플리케이션의 특정 [라우트(route)](server-routing.md)에 요청을 보냅니다.
2. 서버는 사용자에게 사용자 이름과 비밀번호를 입력하도록 요청하는 최소 하나 이상의 HTML 기반 웹 폼으로 구성된 HTML 페이지를 반환합니다.
   > Ktor를 사용하면 [Kotlin DSL](server-html-dsl.md)을 사용하여 폼을 작성하거나, FreeMarker, Velocity 등 다양한 JVM 템플릿 엔진 중에서 선택할 수 있습니다.
3. 사용자가 사용자 이름과 비밀번호를 제출하면, 클라이언트는 웹 폼 데이터(사용자 이름과 비밀번호 포함)가 포함된 요청을 서버에 보냅니다.
   
   ```kotlin
   POST http://localhost:8080/login
   Content-Type: application/x-www-form-urlencoded
   
   username=jetbrains&password=foobar
   
   ```
   
   Ktor에서는 사용자 이름과 비밀번호를 가져오는 데 사용되는 [매개변수 이름을 지정](#configure-provider)해야 합니다.

4. 서버는 클라이언트가 보낸 자격 증명을 [검증](#configure-provider)하고 요청된 콘텐츠로 응답합니다.

## 폼 인증 설치 {id="install"}
`form` 인증 공급자(provider)를 설치하려면 `install` 블록 내에서 [form](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/form.html) 함수를 호출하세요.

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    form {
        // 폼 인증 구성
    }
}
```

필요에 따라 [특정 라우트를 인증](#authenticate-route)하는 데 사용할 수 있는 [공급자 이름](server-auth.md#provider-name)을 지정할 수 있습니다.

## 폼 인증 구성 {id="configure"}

### 1단계: 폼 공급자 구성 {id="configure-provider"}
`form` 인증 공급자는 [FormAuthenticationProvider.Config](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-form-authentication-provider/-config/index.html) 클래스를 통해 설정을 노출합니다. 아래 예제에서는 다음과 같은 설정이 지정되었습니다.
* `userParamName` 및 `passwordParamName` 속성은 사용자 이름과 비밀번호를 가져오는 데 사용되는 매개변수 이름을 지정합니다.
* `validate` 함수는 사용자 이름과 비밀번호를 검증합니다.
  `validate` 함수는 `UserPasswordCredential`을 확인하고 인증에 성공하면 `UserIdPrincipal`을 반환하며, 실패하면 `null`을 반환합니다.
* `challenge` 함수는 인증에 실패할 경우 수행할 동작을 지정합니다. 예를 들어, 로그인 페이지로 리다이렉트하거나 [UnauthorizedResponse](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-unauthorized-response/index.html)를 보낼 수 있습니다.

```kotlin
install(Authentication) {
    form("auth-form") {
        userParamName = "username"
        passwordParamName = "password"
        validate { credentials ->
            if (credentials.name == "jetbrains" && credentials.password == "foobar") {
                UserIdPrincipal(credentials.name)
            } else {
                null
            }
        }
        challenge {
            call.respond(HttpStatusCode.Unauthorized, "Credentials are not valid")
        }
    }
}
```

> `basic` 인증과 마찬가지로, 사용자 이름과 비밀번호 해시를 보관하는 인메모리 테이블에 저장된 사용자를 검증하기 위해 [UserHashedTableAuth](server-basic-auth.md#validate-user-hash)를 사용할 수도 있습니다.

### 2단계: 특정 리소스 보호 {id="authenticate-route"}

`form` 공급자를 구성한 후에는 데이터가 전송될 `post` 라우트를 정의해야 합니다.
그런 다음 이 라우트를 **[authenticate](server-auth.md#authenticate-route)** 함수 내부에 추가합니다.
인증에 성공하면 라우트 핸들러 내부에서 `call.principal` 함수를 사용하여 인증된 [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)을 검색하고 인증된 사용자의 이름을 가져올 수 있습니다.

```kotlin
routing {
    authenticate("auth-form") {
        post("/login") {
            call.respondText("Hello, ${call.principal<UserIdPrincipal>()?.name}!")
        }
    }
}
```

로그인한 사용자의 ID를 저장하기 위해 [세션 인증(Session authentication)](server-session-auth.md)을 사용할 수 있습니다.
예를 들어, 사용자가 처음 웹 폼을 사용하여 로그인할 때 사용자 이름을 쿠키 세션에 저장하고, 이후 요청에서는 `session` 공급자를 사용하여 이 사용자를 승인할 수 있습니다.