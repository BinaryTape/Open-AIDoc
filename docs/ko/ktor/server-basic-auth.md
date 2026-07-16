[//]: # (title: Ktor 서버의 기본 인증)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<p>
<b>코드 예제</b>: <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-basic">auth-basic</a>, <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-basic-hash-table">auth-basic-hash-table</a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor는 Kotlin/Native를 지원하며 추가 런타임이나 가상 머신 없이 서버를 실행할 수 있습니다.">네이티브 서버</Links> 지원</b>: ✅
</p>
</tldr>

기본 인증(Basic authentication) 스킴은 액세스 제어 및 인증에 사용되는 [HTTP 프레임워크](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)의 일부입니다. 이 스킴에서 사용자 자격 증명은 Base64를 사용하여 인코딩된 사용자 이름/비밀번호 쌍으로 전송됩니다.

Ktor를 사용하면 기본 인증을 사용하여 사용자를 로그인시키고 특정 [라우트(route)](server-routing.md)를 보호할 수 있습니다. Ktor의 인증에 대한 일반적인 정보는 [Ktor 서버의 인증 및 인가](server-auth.md) 섹션에서 확인할 수 있습니다.

> 기본 인증은 사용자 이름과 비밀번호를 일반 텍스트로 전달하므로, 민감한 정보를 보호하려면 [HTTPS/TLS](server-ssl.md)를 사용해야 합니다.

## 의존성 추가 {id="add_dependencies"}
`basic` 인증을 활성화하려면 빌드 스크립트에 `%artifact_name%` 아티팩트를 포함해야 합니다:

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

## 기본 인증 흐름 {id="flow"}

기본 인증 흐름은 다음과 같습니다:

1. 클라이언트가 서버 애플리케이션의 특정 [라우트](server-routing.md)에 `Authorization` 헤더 없이 요청을 보냅니다.
2. 서버는 클라이언트에 `401` (Unauthorized) 응답 상태로 응답하며, `WWW-Authenticate` 응답 헤더를 사용하여 해당 라우트를 보호하기 위해 기본 인증 스킴이 사용됨을 알립니다. 일반적인 `WWW-Authenticate` 헤더는 다음과 같습니다:
   
   ```
   WWW-Authenticate: Basic realm="Access to the '/' path", charset="UTF-8"
   ```
   {style="block"}
   
   Ktor에서는 `basic` 인증 프로바이더를 [설정](#configure-provider)할 때 해당 프로퍼티를 사용하여 realm과 charset을 지정할 수 있습니다.

3. 보통 클라이언트는 사용자가 자격 증명을 입력할 수 있는 로그인 대화 상자를 표시합니다. 그런 다음 클라이언트는 Base64를 사용하여 인코딩된 사용자 이름과 비밀번호 쌍이 포함된 `Authorization` 헤더와 함께 요청을 보냅니다. 예:
   
   ```
   Authorization: Basic amV0YnJhaW5zOmZvb2Jhcg
   ```
   {style="block"}

4. 서버는 클라이언트가 보낸 자격 증명을 [검증](#configure-provider)하고 요청된 콘텐츠로 응답합니다.

## 기본 인증 설치 {id="install"}
`basic` 인증 프로바이더를 설치하려면 `install` 블록 내에서 [basic](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 함수를 호출하세요:

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    basic {
        // 기본 인증 설정
    }
}
```

필요에 따라 [특정 라우트를 인증](#authenticate-route)하는 데 사용할 수 있는 [프로바이더 이름](server-auth.md#provider-name)을 지정할 수 있습니다.

## 기본 인증 설정 {id="configure"}

Ktor에서 다양한 인증 프로바이더를 설정하는 방법에 대한 일반적인 개념은 [인증 설정](server-auth.md#configure)을 참조하세요. 이 섹션에서는 `basic` 인증 프로바이더의 구체적인 설정에 대해 알아봅니다. 

### 1단계: 기본 프로바이더 설정 {id="configure-provider"}

`basic` 인증 프로바이더는 [BasicAuthenticationProvider.Configuration](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-basic-authentication-provider/-config/index.html) 클래스를 통해 설정을 노출합니다. 아래 예제에서는 다음 설정이 지정되었습니다:
* `realm` 프로퍼티는 `WWW-Authenticate` 헤더에 전달될 realm을 설정합니다.
* `validate` 함수는 사용자 이름과 비밀번호를 검증합니다.

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
   
`validate` 함수는 `UserPasswordCredential`을 확인하고 인증에 성공하면 `UserIdPrincipal`을 반환하고, 실패하면 `null`을 반환합니다. 
> 사용자 이름과 비밀번호 해시를 보관하는 인메모리 테이블에 저장된 사용자를 검증하려면 [UserHashedTableAuth](#validate-user-hash)를 사용할 수도 있습니다.

### 2단계: 특정 리소스 보호 {id="authenticate-route"}

`basic` 프로바이더를 설정한 후에는 **[authenticate](server-auth.md#authenticate-route)** 함수를 사용하여 애플리케이션의 특정 리소스를 보호할 수 있습니다. 인증에 성공하면 라우트 핸들러 내에서 `call.principal` 함수를 사용하여 인증된 [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)을 검색하고 인증된 사용자의 이름을 가져올 수 있습니다.

```kotlin
routing {
    authenticate("auth-basic") {
        get("/") {
            call.respondText("Hello, ${call.principal<UserIdPrincipal>()?.name}!")
        }
    }
}
```

## UserHashedTableAuth로 검증 {id="validate-user-hash"}

Ktor를 사용하면 사용자 이름과 비밀번호 해시를 보관하는 인메모리 테이블에 저장된 사용자를 [검증](#configure-provider)하기 위해 [UserHashedTableAuth](#validate-user-hash)를 사용할 수 있습니다. 이를 통해 데이터 소스가 유출되더라도 사용자 비밀번호가 노출되지 않도록 할 수 있습니다.

사용자 검증을 위해 `UserHashedTableAuth`를 사용하려면 다음 단계를 따르세요:

1. [getDigestFunction](https://api.ktor.io/ktor-utils/io.ktor.util/get-digest-function.html) 함수를 사용하여 지정된 알고리즘과 솔트(salt) 프로바이더로 다이제스트 함수를 생성합니다:
   
   ```kotlin
   val digestFunction = getDigestFunction("SHA-256") { "ktor${it.length}" }
   ```

2. `UserHashedTableAuth`의 새 인스턴스를 초기화하고 다음 프로퍼티를 지정합니다:
   * `table` 프로퍼티를 사용하여 사용자 이름과 해시된 비밀번호 테이블을 제공합니다.
   * `digester` 프로퍼티에 다이제스트 함수를 할당합니다.
   
   ```kotlin
   val hashedUserTable = UserHashedTableAuth(
       table = mapOf(
           "jetbrains" to digestFunction("foobar"),
           "admin" to digestFunction("password")
       ),
       digester = digestFunction
   )
   ```
   
3. `validate` 함수 내에서 [UserHashedTableAuth.authenticate](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-hashed-table-auth/authenticate.html) 함수를 호출하여 사용자를 인증하고 자격 증명이 유효하면 `UserIdPrincipal` 인스턴스를 반환합니다:

   ```kotlin
   install(Authentication) {
       basic("auth-basic-hashed") {
           realm = "Access to the '/' path"
           validate { credentials ->
               hashedUserTable.authenticate(credentials)
           }
       }
   }