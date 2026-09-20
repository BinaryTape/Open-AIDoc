[//]: # (title: LDAP)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:ktor-server-auth</code>, <code>io.ktor:ktor-server-auth-ldap</code>
</p>
<var name="example_name" value="auth-ldap"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native 서버</Links> 지원</b>: ✖️
</p>
</tldr>

LDAP는 사용자 정보를 저장할 수 있는 다양한 디렉터리 서비스와 연동하기 위한 프로토콜입니다. Ktor를 사용하면 [basic](server-basic-auth.md), [digest](server-digest-auth.md) 또는 [폼 기반(form-based)](server-form-based-auth.md) 인증 스키마를 사용하여 LDAP 사용자를 인증할 수 있습니다.

> Ktor의 인증 및 권한 부여에 관한 일반적인 정보는 [Ktor 서버의 인증 및 권한 부여](server-auth.md) 섹션에서 확인할 수 있습니다.

## 의존성 추가 {id="add_dependencies"}
`LDAP` 인증을 활성화하려면 빌드 스크립트에 `ktor-server-auth` 및 `ktor-server-auth-ldap` 아티팩트를 포함해야 합니다.

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" title="Sample" code="            implementation(&quot;io.ktor:ktor-server-auth:$ktor_version&quot;)&#10;            implementation(&quot;io.ktor:ktor-server-auth-ldap:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" title="Sample" code="            implementation &quot;io.ktor:ktor-server-auth:$ktor_version&quot;&#10;            implementation &quot;io.ktor:ktor-server-auth-ldap:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" title="Sample" code="&amp;lt;dependency&amp;gt;&#10;&amp;lt;groupId&amp;gt;io.ktor&amp;lt;/groupId&amp;gt;&#10;&amp;lt;artifactId&amp;gt;ktor-server-auth&amp;lt;/artifactId&amp;gt;&#10;&amp;lt;version&amp;gt;${ktor_version}&amp;lt;/version&amp;gt;&#10;&amp;lt;/dependency&amp;gt;&#10;&amp;lt;dependency&amp;gt;&#10;&amp;lt;groupId&amp;gt;io.ktor&amp;lt;/groupId&amp;gt;&#10;&amp;lt;artifactId&amp;gt;ktor-server-auth-ldap&amp;lt;/artifactId&amp;gt;&#10;&amp;lt;version&amp;gt;${ktor_version}&amp;lt;/version&amp;gt;&#10;&amp;lt;/dependency&amp;gt;"/>
   </TabItem>
</Tabs>

## LDAP 구성 {id="configure"}

### 1단계: 인증 프로바이더 선택 {id="choose-auth"}

LDAP 사용자를 인증하려면 먼저 사용자 이름과 비밀번호 검증을 위한 인증 프로바이더를 선택해야 합니다. Ktor에서는 이를 위해 [basic](server-basic-auth.md), [digest](server-digest-auth.md) 또는 [폼 기반(form-based)](server-form-based-auth.md) 프로바이더를 사용할 수 있습니다. 예를 들어, `basic` 인증 프로바이더를 사용하려면 `install` 블록 내부에서 [basic](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 함수를 호출하세요.

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.ldap.*
//...
install(Authentication) {
    basic {
        validate { credentials ->
            // LDAP 사용자 인증
        }
    }
}
```

`validate` 함수는 사용자 자격 증명(credentials)을 확인하는 데 사용됩니다.
 

### 2단계: LDAP 사용자 인증 {id="authenticate"}

LDAP 사용자를 인증하려면 [ldapAuthenticate](https://api.ktor.io/ktor-server-auth-ldap/io.ktor.server.auth.ldap/ldap-authenticate.html) 함수를 호출해야 합니다. 이 함수는 [UserPasswordCredential](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-password-credential/index.html)을 받아 지정된 LDAP 서버를 대상으로 검증합니다.

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

```kotlin
install(Authentication) {
    basic("auth-ldap") {
        validate { credentials ->
            val url = "ldap://0.0.0.0:389"
            val userDNFormat = "cn=%s,dc=ktor,dc=io"
            ldapAuthenticate(credentials, url, userDNFormat)
        }
    }
}
```

`validate` 함수는 인증에 성공하면 [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)을 반환하고, 인증에 실패하면 `null`을 반환합니다.

선택적으로, 인증된 사용자에 대해 추가적인 검증을 더할 수 있습니다.

```kotlin
install(Authentication) {
    basic("auth-ldap") {
        validate { credentials ->
            val url = "ldap://localhost:389"
            val userDNFormat = "cn=%s,dc=ktor,dc=io"
            ldapAuthenticate(credentials, url, userDNFormat) {
                if (it.name == it.password) {
                    UserIdPrincipal(it.name)
                } else {
                    null
                }
            }
        }
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

<note>
    <p>
        타입 세이프(type-safe) 인증 스키마 API는 실험적(experimental) 기능입니다. 언제든지 제거되거나 변경될 수 있습니다.
        옵트인(opt-in)이 필요합니다. 자세한 내용은
        <a href="server-typed-auth.md#prerequisites">API 활성화</a>를 참조하세요.
    </p>
</note>

LDAP 전용 타입 세이프 인증 스키마는 없습니다. 타입 세이프 [`basic`](server-basic-auth.md), [`digest`](server-digest-auth.md) 또는 [`form`](server-form-based-auth.md) 스키마의 `validate` 블록 내부에서 `ldapAuthenticate`를 호출하세요.

`ldapAuthenticate`에 블록을 전달하여 고유한 프린시펄(principal) 타입을 반환할 수 있습니다:

```kotlin
data class User(val name: String)

val ldapAuth = basic<User>("auth-ldap") {
    validate { credentials ->
        val url = "ldap://0.0.0.0:389"
        val userDNFormat = "cn=%s,dc=ktor,dc=io"
        ldapAuthenticate(credentials, url, userDNFormat) {
            User(it.name)
        }
    }
}
```

이 블록을 사용하면 인증된 사용자에 대한 검증을 추가할 수도 있습니다:

```kotlin
val ldapAuth = basic<User>("auth-ldap") {
    validate { credentials ->
        val url = "ldap://localhost:389"
        val userDNFormat = "cn=%s,dc=ktor,dc=io"
        ldapAuthenticate(credentials, url, userDNFormat) {
            if (it.name == it.password) {
                User(it.name)
            } else {
                null
            }
        }
    }
}
```

전체 API에 대한 내용은 [타입 세이프 인증](server-typed-auth.md)을 참조하세요.

</TabItem>
</Tabs>

### 3단계: 특정 리소스 보호 {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

LDAP를 구성한 후에는 **[authenticate](server-auth.md#authenticate-route)** 함수를 사용하여 애플리케이션의 특정 리소스를 보호할 수 있습니다. 인증에 성공하면, 라우트 핸들러 내부에서 `call.principal` 함수를 사용하여 인증된 [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)을 가져와 인증된 사용자의 이름을 얻을 수 있습니다.

```kotlin
routing {
    authenticate("auth-ldap") {
        get("/") {
            val user = call.principal<UserIdPrincipal>()
            call.respondText("Hello, ${user?.name}!")
        }
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

`authenticateWith()`에 스키마를 전달하세요. 블록 내부에서 `call.principal`은 사용자가 정의한 프린시펄 타입이며 결코 `null`이 되지 않으므로, 타입 캐스팅이나 null 검사가 필요하지 않습니다:

```kotlin
routing {
    authenticateWith(ldapAuth) {
        get("/") {
            call.respondText("Hello, ${call.principal.name}!")
        }
    }
}
```

</TabItem>
</Tabs>

실행 가능한 전체 예제는 여기서 확인할 수 있습니다: [auth-ldap](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-ldap).

> 현재 LDAP 구현은 동기식(synchronous)으로 작동한다는 점에 유의하세요.