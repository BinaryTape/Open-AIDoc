[//]: # (title: Ktor Server에서의 인증 및 인가)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Authentication"/>
<var name="package_name" value="io.ktor.server.auth"/>
<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
</tldr>

<link-summary>
Authentication 플러그인은 Ktor에서의 인증 및 인가를 처리합니다.
</link-summary>

Ktor는 인증 및 인가를 처리하기 위해 [Authentication](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication/index.html) 플러그인을 제공합니다. 일반적인 사용 시나리오에는 사용자 로그인, 특정 리소스에 대한 접근 권한 부여, 당사자 간의 안전한 정보 전송 등이 포함됩니다. 또한 `Authentication`을 [세션(Sessions)](server-sessions.md)과 함께 사용하여 요청 간에 사용자의 정보를 유지할 수도 있습니다.

> 클라이언트 측에서 Ktor는 인증 및 인가 처리를 위한 [Authentication](client-auth.md) 플러그인을 제공합니다.

## 지원되는 인증 유형 {id="supported"}
Ktor는 다음과 같은 인증 및 인가 스킴을 지원합니다:

### HTTP 인증 {id="http-auth"}
HTTP는 접근 제어 및 인증을 위한 [일반적인 프레임워크](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)를 제공합니다. Ktor에서는 다음과 같은 HTTP 인증 스킴을 사용할 수 있습니다:
* [Basic](server-basic-auth.md) - `Base64` 인코딩을 사용하여 사용자 이름과 비밀번호를 제공합니다. HTTPS와 함께 사용하지 않는 한 일반적으로 권장되지 않습니다.
* [Digest](server-digest-auth.md) - 사용자 이름과 비밀번호에 해시 함수를 적용하여 암호화된 형태로 사용자 자격 증명을 통신하는 인증 방법입니다.
* [Bearer](server-bearer-auth.md) - 전달자 토큰(bearer tokens)이라는 보안 토큰이 포함된 인증 스킴입니다.
  Bearer 인증 스킴은 [OAuth](server-oauth.md) 또는 [JWT](server-jwt.md)의 일부로 사용되지만, Bearer 토큰 인증을 위한 커스텀 로직을 제공할 수도 있습니다.
* [API Key](server-api-key-auth.md) - 클라이언트가 헤더에 비밀 키를 전달하는 간단한 인증 방법입니다.

### 폼 기반 인증 {id="form-auth"}
[폼 기반(Form-based)](server-form-based-auth.md) 인증은 [웹 폼](https://developer.mozilla.org/en-US/docs/Learn/Forms)을 사용하여 크리덴셜 정보를 수집하고 사용자를 인증합니다.

### JSON Web Tokens (JWT) {id="jwt"}
[JSON Web Token](server-jwt.md)은 당사자 간에 정보를 JSON 객체로 안전하게 전송하기 위한 개방형 표준입니다. 인가를 위해 JSON Web Token을 사용할 수 있습니다. 사용자가 로그인하면 각 요청에 토큰이 포함되어, 해당 토큰으로 허용된 리소스에 사용자가 접근할 수 있게 합니다. Ktor에서는 `jwt` 인증을 사용하여 토큰을 검증하고 그 안에 포함된 클레임(claims)을 확인할 수 있습니다.

### LDAP {id="ldap"}
[LDAP](server-ldap.md)는 디렉터리 서비스 인증에 사용되는 개방형 크로스 플랫폼 프로토콜입니다. Ktor는 지정된 LDAP 서버에 대해 사용자 크리덴셜을 인증하는 [ldapAuthenticate](https://api.ktor.io/ktor-server-auth-ldap/io.ktor.server.auth.ldap/ldap-authenticate.html) 함수를 제공합니다.

### OAuth {id="oauth"}
[OAuth](server-oauth.md)는 API 접근 보안을 위한 개방형 표준입니다. Ktor의 `oauth` 프로바이더를 사용하면 Google, Facebook, Twitter 등과 같은 외부 프로바이더를 사용하여 인증을 구현할 수 있습니다.

### 세션 {id="sessions"}
[세션(Sessions)](server-sessions.md)은 서로 다른 HTTP 요청 간에 데이터를 유지하는 메커니즘을 제공합니다. 일반적인 사용 사례로는 로그인한 사용자의 ID, 장바구니 내용 저장 또는 클라이언트에 사용자 기본 설정 유지 등이 있습니다. Ktor에서 이미 연결된 세션이 있는 사용자는 `session` 프로바이더를 사용하여 인증될 수 있습니다. 자세한 방법은 [Ktor Server의 세션 인증](server-session-auth.md)에서 확인하세요.

### 커스텀 {id="custom"}
Ktor는 또한 인증 및 인가 처리를 위한 고유한 플러그인을 구현하는 데 사용할 수 있는 [커스텀 플러그인](server-custom-plugins.md) 제작용 API를 제공합니다.
예를 들어, `AuthenticationChecked` [훅(hook)](server-custom-plugins.md#call-handling)은 인증 크리덴셜이 확인된 후에 실행되며, 이를 통해 인가를 구현할 수 있습니다: [custom-plugin-authorization](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin-authorization).

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

[JWT](server-jwt.md) 및 [LDAP](server-ldap.md)와 같은 일부 인증 프로바이더는 추가 아티팩트가 필요하다는 점에 유의하세요.

## Authentication 설치 {id="install"}

<p>
    애플리케이션에 <code>%plugin_name%</code> 플러그인을 <a href="#install">설치</a>하려면, 지정된 <Links href="/ktor/server-modules" summary="모듈을 사용하면 라우트를 그룹화하여 애플리케이션을 구조화할 수 있습니다.">모듈</Links>의 <code>install</code> 함수에 전달하십시오.
    아래의 코드 스니펫은 <code>%plugin_name%</code>을 설치하는 방법을 보여줍니다 ...
</p>
<list>
    <li>
        ... <code>embeddedServer</code> 함수 호출 내부에서.
    </li>
    <li>
        ... <code>Application</code> 클래스의 확장 함수인 명시적으로 정의된 <code>module</code> 내부에서.
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"></code-block>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"></code-block>
    </TabItem>
</Tabs>

## Authentication 설정 {id="configure"}
[Authentication 설치](#install) 후, 다음과 같이 `Authentication`을 설정하고 사용할 수 있습니다:

### 1단계: 인증 프로바이더 선택 {id="choose-provider"}

[basic](server-basic-auth.md), [digest](server-digest-auth.md), 또는 [form](server-form-based-auth.md)과 같은 특정 인증 프로바이더를 사용하려면 `install` 블록 내부에서 해당 함수를 호출해야 합니다. 예를 들어, 기본 인증(basic authentication)을 사용하려면 [`.basic()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 함수를 호출합니다:

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    basic {
        // 기본 인증(basic authentication) 설정
    }
}
```

이 함수 내부에서 해당 프로바이더에 특정한 설정을 [구성](#configure-provider)할 수 있습니다.

### 2단계: 프로바이더 이름 지정 {id="provider-name"}

[특정 프로바이더를 사용](#choose-provider)하기 위한 함수에서는 선택적으로 프로바이더 이름을 지정할 수 있습니다. 아래의 코드 샘플은 [basic](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 및 [form](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/form.html) 프로바이더를 각각 `"auth-basic"` 및 `"auth-form"`이라는 이름으로 설치합니다:

```kotlin
install(Authentication) {
    basic("auth-basic") {
        // 기본 인증 설정
    }
    form("auth-form") {
        // 폼 인증 설정
    }
    // ...
}
```
{disable-links="false"}

이 이름들은 나중에 서로 다른 프로바이더를 사용하여 [서로 다른 라우트를 인증](#authenticate-route)하는 데 사용될 수 있습니다.
> 프로바이더 이름은 고유해야 하며, 이름이 없는 프로바이더는 하나만 정의할 수 있습니다.
>
{style="note"}

### 3단계: 프로바이더 설정 {id="configure-provider"}

각 [프로바이더 유형](#choose-provider)은 고유한 설정을 가집니다. 예를 들어, [`BasicAuthenticationProvider.Config`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-basic-authentication-provider/-config/index.html) 클래스는 [`.basic()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 함수에 대한 옵션을 제공합니다. 이 클래스의 핵심 함수는 사용자 이름과 비밀번호의 유효성을 검사하는 책임을 지는 [`validate()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-basic-authentication-provider/-config/validate.html)입니다. 다음 코드 예제는 그 사용법을 보여줍니다:

```kotlin
install(Authentication) {
    basic("auth-basic") {
        realm = "Access to the '/' path"
        validate { credentials ->
            if (credentials.name == "jetbrains" && credentials.password == "foobar") {
                UserIdPrincipal(credentials.name)
            } else {
                null
            }
        }
    }
}
```

`validate()` 함수가 어떻게 작동하는지 이해하려면 두 가지 용어를 알아야 합니다:

* **프린시펄(principal)**은 인증될 수 있는 개체입니다: 사용자, 컴퓨터, 서비스 등. Ktor에서 다양한 인증 프로바이더는 서로 다른 프린시펄을 사용할 수 있습니다. 예를 들어, `basic`, `digest`, `form` 프로바이더는 [`UserIdPrincipal`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)을 인증하는 반면, `jwt` 프로바이더는 [`JWTPrincipal`](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/-j-w-t-principal/index.html)을 검증합니다.
  > 커스텀 프린시펄을 생성할 수도 있습니다. 이는 다음과 같은 경우에 유용할 수 있습니다:
  > - 크리덴셜을 커스텀 프린시펄에 매핑하면 [라우트 핸들러](#get-principal) 내부에서 인증된 프린시펄에 대한 추가 정보를 가질 수 있습니다.
  > - [세션 인증](server-session-auth.md)을 사용하는 경우, 프린시펄은 세션 데이터를 저장하는 데이터 클래스일 수 있습니다.
* **크리덴셜(credential)**은 서버가 프린시펄을 인증하기 위한 속성 집합입니다: 사용자/비밀번호 쌍, API 키 등. 예를 들어, `basic` 및 `form` 프로바이더는 [`UserPasswordCredential`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-password-credential/index.html)을 사용하여 사용자 이름과 비밀번호를 검증하는 반면, `jwt`는 [`JWTCredential`](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/-j-w-t-credential/index.html)을 검증합니다.

따라서 `validate()` 함수는 지정된 크리덴셜을 확인하고 인증에 성공하면 프린시펄 `Any`를 반환하고, 인증에 실패하면 `null`을 반환합니다.

> 특정 기준에 따라 인증을 건너뛰려면 [`skipWhen()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication-provider/-config/skip-when.html)을 사용하십시오. 예를 들어, [세션](server-sessions.md)이 이미 존재하는 경우 `basic` 인증을 건너뛸 수 있습니다:
> ```kotlin
> basic {
>     skipWhen { call -> call.sessions.get<UserSession>() != null }
> }

### 4단계: 특정 리소스 보호 {id="authenticate-route"}

마지막 단계는 애플리케이션의 특정 리소스를 보호하는 것입니다. 이는 [`authenticate()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/authenticate.html) 함수를 사용하여 수행할 수 있습니다. 이 함수는 두 개의 선택적 매개변수를 받습니다:

- 중첩된 라우트를 인증하는 데 사용되는 [프로바이더 이름](#provider-name).
  아래 코드 스니펫은 _auth-basic_ 이라는 이름의 프로바이더를 사용하여 `/login` 및 `/orders` 라우트를 보호합니다:
   ```kotlin
   routing {
       authenticate("auth-basic") {
           get("/login") {
               // ...
           }    
           get("/orders") {
               // ...
           }    
       }
       get("/") {
           // ...
       }
   }
   ```
- 중첩된 인증 프로바이더를 해결하는 데 사용되는 전략.
  이 전략은 [`AuthenticationStrategy`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication-strategy/index.html) 열거형 값으로 표현됩니다.

  예를 들어, 클라이언트는 `AuthenticationStrategy.Required` 전략으로 등록된 모든 프로바이더에 대해 인증 데이터를 제공해야 합니다.
  아래 코드 스니펫에서는 [세션 인증](server-session-auth.md)을 통과한 사용자만이 기본 인증을 사용하여 `/admin` 라우트에 접근을 시도할 수 있습니다:
   ```kotlin
   routing {
       authenticate("auth-session", strategy = AuthenticationStrategy.Required) {
           get("/hello") {
               // ...
           }    
           authenticate("auth-basic", strategy = AuthenticationStrategy.Required) {
               get("/admin") {
                   // ...
               }
           }  
       }
   }
   ```

> 전체 예제는 [auth-form-session-nested](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-session-nested)를 참조하십시오.

### 5단계: 라우트 핸들러 내에서 프린시펄 가져오기 {id="get-principal"}

인증에 성공하면 `call.principal()` 함수를 사용하여 라우트 핸들러 내부에서 인증된 프린시펄을 검색할 수 있습니다. 이 함수는 [설정된 인증 프로바이더](#configure-provider)가 반환하는 특정 프린시펄 유형을 인자로 받습니다. 다음 예제에서 `call.principal()`은 `UserIdPrincipal`을 얻고 인증된 사용자의 이름을 가져오는 데 사용됩니다.

```kotlin
routing {
    authenticate("auth-basic") {
        get("/") {
            call.respondText("Hello, ${call.principal<UserIdPrincipal>()?.name}!")
        }
    }
}
```

[세션 인증](server-session-auth.md)을 사용하는 경우, 프린시펄은 세션 데이터를 저장하는 데이터 클래스일 수 있습니다. 따라서 이 데이터 클래스를 `call.principal()`에 전달해야 합니다:

```kotlin
authenticate("auth-session") {
    get("/hello") {
        val userSession = call.principal<UserSession>()
    }
}
```

[중첩된 인증 프로바이더](#authenticate-route)의 경우, `call.principal()`에 [프로바이더 이름](#provider-name)을 전달하여 원하는 프로바이더의 프린시펄을 가져올 수 있습니다.

아래 예제에서는 최상위 세션 프로바이더의 프린시펄을 가져오기 위해 `"auth-session"` 값이 전달됩니다:

```kotlin
authenticate("auth-session", strategy = AuthenticationStrategy.Required) {
    authenticate("auth-basic", strategy = AuthenticationStrategy.Required) {
        get("/admin") {
            val userSession = call.principal<UserSession>("auth-session")
        }
    }
}