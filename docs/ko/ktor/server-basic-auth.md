[//]: # (title: Ktor Server의 Basic 인증)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<p>
<b>코드 예제</b>: <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-basic">auth-basic</a>, <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-basic-hash-table">auth-basic-hash-table</a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">네이티브 서버(Native server)</Links> 지원</b>: ✅
</p>
</tldr>

Basic 인증(Basic authentication) 스킴은 접근 제어 및 인증에 사용되는 [HTTP 프레임워크](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)의 일부입니다. 이 스킴에서 사용자 자격 증명(credentials)은 Base64로 인코딩된 사용자 이름/비밀번호 쌍으로 전송됩니다.

Ktor를 사용하면 기본(basic) 인증을 통해 사용자를 로그인 처리하고 특정 [라우트(route)](server-routing.md)를 보호할 수 있습니다. Ktor의 인증에 대한 일반적인 정보는 [Ktor Server의 인증 및 인가](server-auth.md) 섹션에서 확인할 수 있습니다.

> Basic 인증은 사용자 이름과 비밀번호를 평문으로 전달하므로, 민감한 정보를 보호하려면 반드시 [HTTPS/TLS](server-ssl.md)를 사용해야 합니다.

## 의존성 추가 {id="add_dependencies"}
`basic` 인증을 활성화하려면 빌드 스크립트에 `%artifact_name%` 아티팩트를 포함해야 합니다.

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

## Basic 인증 흐름 {id="flow"}

Basic 인증 흐름은 다음과 같습니다.

1. 클라이언트가 서버 애플리케이션의 특정 [라우트](server-routing.md)로 `Authorization` 헤더 없이 요청을 보냅니다.
2. 서버는 클라이언트에 `401`(Unauthorized) 응답 상태로 응답하며, 라우트를 보호하는 데 Basic 인증 스킴이 사용된다는 정보를 제공하기 위해 `WWW-Authenticate` 응답 헤더를 사용합니다. 일반적인 `WWW-Authenticate` 헤더는 다음과 같습니다.
   
   ```
   WWW-Authenticate: Basic realm="Access to the '/' path", charset="UTF-8"
   ```
   {style="block"}
   
   Ktor에서는 `basic` 인증 프로바이더를 [구성](#configure-provider)할 때 해당 프로퍼티를 사용하여 realm과 charset을 지정할 수 있습니다.

3. 일반적으로 클라이언트는 사용자가 자격 증명을 입력할 수 있는 로그인 대화 상자를 표시합니다. 그런 다음 클라이언트는 Base64로 인코딩된 사용자 이름과 비밀번호 쌍이 포함된 `Authorization` 헤더와 함께 요청을 보냅니다. 예를 들면 다음과 같습니다.
   
   ```
   Authorization: Basic amV0YnJhaW5zOmZvb2Jhcg
   ```
   {style="block"}

4. 서버는 클라이언트가 보낸 자격 증명을 [검증](#configure-provider)하고 요청된 콘텐츠로 응답합니다.

## Basic 인증 설치 {id="install"}
`basic` 인증 프로바이더를 설치하려면 `install` 블록 내에서 [basic](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 함수를 호출합니다.

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    basic {
        // Basic 인증 구성
    }
}
```

필요한 경우 [특정 라우트를 인증](#authenticate-route)하는 데 사용할 수 있는 [프로바이더 이름](server-auth.md#provider-name)을 지정할 수도 있습니다.

## Basic 인증 구성 {id="configure"}

Ktor에서 다양한 인증 프로바이더를 구성하는 방법에 대한 전반적인 내용은 [인증 구성](server-auth.md#configure)을 참조하세요. 이 섹션에서는 `basic` 인증 프로바이더의 구체적인 구성 방법을 살펴봅니다. 

### 1단계: Basic 프로바이더 구성 {id="configure-provider"}

<Tabs group="auth-dsl">
<TabItem title="이름이 지정된 프로바이더" group-key="classic">

`basic` 인증 프로바이더는 [BasicAuthenticationProvider.Configuration](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-basic-authentication-provider/-config/index.html) 클래스를 통해 설정을 노출합니다. 아래 예제에서는 다음 설정이 지정되어 있습니다.
* `realm` 프로퍼티는 `WWW-Authenticate` 헤더에 전달될 realm을 설정합니다.
* `validate` 함수는 사용자 이름과 비밀번호를 검증합니다.

```kotlin
install(Authentication) {
    basic("auth-basic") {
        realm = "Access to the '/' path"
        validate { credentials ->
            val isValid = credentials.name == "jetbrains" &&
                credentials.password == "foobar"
            if (isValid) {
                UserIdPrincipal(credentials.name)
            } else {
                null
            }
        }
    }
}
```
   
`validate` 함수는 `UserPasswordCredential`을 확인하고 인증에 성공하면 `UserIdPrincipal`을 반환하며, 인증에 실패하면 `null`을 반환합니다. 
> 사용자 이름과 비밀번호 해시를 보관하는 인메모리 테이블에 저장된 사용자를 검증하기 위해 [UserHashedTableAuth](#validate-user-hash)를 사용할 수도 있습니다.

</TabItem>
<TabItem title="타입 안전 방식" group-key="typed">

<note>
    <p>
        타입 안전(type-safe) 인증 스킴 API는 실험적 기능입니다. 언제든지 제거되거나 변경될 수 있습니다.
        사용을 위해서는 opt-in이 필요합니다. 자세한 내용은
        <a href="server-typed-auth.md#prerequisites">타입 안전 인증 문서</a>를 참조하세요.
    </p>
</note>

`basic()` 함수는 선택한 principal 타입에 대한 스킴을 생성합니다. `install(Authentication)`
단계가 필요하지 않으며, 이 스킴은 해당 스킴을 필요로 하는 라우트에 전달하는 값입니다.

```kotlin
data class User(val name: String)

val basicAuth = basic<User>("auth-basic") {
    realm = "Access to the '/' path"
    validate { credentials ->
        val isValid = credentials.name == "jetbrains" &&
            credentials.password == "foobar"
        if (isValid) User(credentials.name) else null
    }
}
```

`validate` 함수는 `UserPasswordCredential`을 확인하고 지정한 principal 타입을 반환하거나, 인증에 실패하면
`null`을 반환합니다. 전체 API는 [타입 안전 인증](server-typed-auth.md)을 참조하세요.

</TabItem>
</Tabs>

### 2단계: 특정 리소스 보호 {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="이름이 지정된 프로바이더" group-key="classic">

`basic` 프로바이더를 구성한 후에는 **[authenticate](server-auth.md#authenticate-route)** 함수를 사용하여 애플리케이션의 특정 리소스를 보호할 수 있습니다. 인증에 성공한 경우 라우트 핸들러 내에서 `call.principal` 함수를 사용하여 인증된 [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)을 가져오고 인증된 사용자의 이름을 얻을 수 있습니다.

```kotlin
routing {
    authenticate("auth-basic") {
        get("/") {
            val user = call.principal<UserIdPrincipal>()
            call.respondText("Hello, ${user?.name}!")
        }
    }
}
```

</TabItem>
<TabItem title="타입 안전 방식" group-key="typed">

`authenticateWith()`에 스킴을 전달합니다. 블록 내에서 `call.principal`은 사용자가 정의한 principal 타입이며 절대
`null`이 아니므로 타입 캐스팅이나 null 체크가 필요하지 않습니다.

```kotlin
routing {
    authenticateWith(basicAuth) {
        get("/") {
            call.respondText("Hello, ${call.principal.name}!")
        }
    }
}
```

</TabItem>
</Tabs>

## UserHashedTableAuth로 검증 {id="validate-user-hash"}

Ktor에서는 [UserHashedTableAuth](#validate-user-hash)를 사용하여 사용자 이름과 비밀번호 해시를 보관하는 인메모리 테이블에 저장된 사용자를 [검증](#configure-provider)할 수 있습니다. 이를 통해 데이터 소스가 유출되더라도 사용자의 비밀번호가 노출되지 않도록 방지할 수 있습니다.

사용자 검증에 `UserHashedTableAuth`를 사용하려면 다음 단계를 따르세요.

1. [getDigestFunction](https://api.ktor.io/ktor-utils/io.ktor.util/get-digest-function.html) 함수를 사용하여 지정된 알고리즘과 솔트(salt) 제공자로 다이제스트(digest) 함수를 생성합니다.
   
   ```kotlin
   val digestFunction = getDigestFunction("SHA-256") {
       "ktor${it.length}"
   }
   ```

2. `UserHashedTableAuth`의 새 인스턴스를 초기화하고 다음 프로퍼티를 지정합니다.
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
   
3. `validate` 함수 내부에서 [UserHashedTableAuth.authenticate](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-hashed-table-auth/authenticate.html) 함수를 호출하여 사용자를 인증하고, 자격 증명이 유효한 경우 `UserIdPrincipal` 인스턴스를 반환하도록 합니다.

   ```kotlin
   install(Authentication) {
       basic("auth-basic-hashed") {
           realm = "Access to the '/' path"
           validate { credentials ->
               hashedUserTable.authenticate(credentials)
           }
       }
   }
   ```