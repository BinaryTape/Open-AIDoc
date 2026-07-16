[//]: # (title: Ktor Server의 Digest 인증)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="auth-digest"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native 서버</Links> 지원</b>: ✖️
</p>
</tldr>

Digest 인증 방식은 액세스 제어 및 인증에 사용되는 [HTTP 프레임워크](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)의 일부입니다. 이 방식에서는 사용자 이름과 비밀번호를 네트워크를 통해 전송하기 전에 해시 함수를 적용합니다.

Ktor를 사용하면 사용자 로그인 및 특정 [라우트(route)](server-routing.md) 보호를 위해 Digest 인증을 사용할 수 있습니다. Ktor의 인증에 대한 일반적인 정보는 [Ktor Server의 인증 및 권한 부여](server-auth.md) 섹션에서 확인할 수 있습니다.

## 의존성 추가 {id="add_dependencies"}
`digest` 인증을 활성화하려면 빌드 스크립트에 `%artifact_name%` 아티팩트를 포함해야 합니다.

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

## Digest 인증 흐름 {id="flow"}

Digest 인증 흐름은 다음과 같습니다:

1. 클라이언트가 서버 애플리케이션의 특정 [라우트](server-routing.md)에 `Authorization` 헤더 없이 요청을 보냅니다.
2. 서버는 클라이언트에게 `401` (Unauthorized) 응답 상태로 응답하고, `WWW-Authenticate` 응답 헤더를 사용하여 해당 라우트를 보호하는 데 Digest 인증 방식이 사용됨을 알립니다. 일반적인 `WWW-Authenticate` 헤더는 다음과 같습니다:

   ```
   WWW-Authenticate: Digest
           realm="Access to the '/' path",
           nonce="e4549c0548886bc2",
           algorithm="MD5"
   ```
   {style="block"}

   Ktor에서는 `digest` 인증 프로바이더를 [구성](#configure-provider)할 때 realm과 nonce 값을 생성하는 방법을 지정할 수 있습니다.

3. 보통 클라이언트는 사용자가 자격 증명(credentials)을 입력할 수 있는 로그인 대화 상자를 표시합니다. 그런 다음 클라이언트는 다음과 같은 `Authorization` 헤더를 포함하여 요청을 보냅니다:

   ```
   Authorization: Digest username="jetbrains",
           realm="Access to the '/' path",
           nonce="e4549c0548886bc2",
           uri="/",
           algorithm=MD5,
           response="6299988bb4f05c0d8ad44295873858cf"
   ```
   {style="block"}

   `response` 값은 다음과 같은 방식으로 생성됩니다:
   
   a. `HA1 = MD5(username:realm:password)`
   > 이 부분은 서버에 [저장](#digest-table)되며, Ktor에서 사용자 자격 증명을 검증하는 데 사용될 수 있습니다.
   
   b. `HA2 = MD5(method:digestURI)`
   
   c. `response = MD5(HA1:nonce:HA2)`

4. 서버는 클라이언트가 보낸 자격 증명을 [검증](#configure-provider)하고 요청된 콘텐츠로 응답합니다.

## Digest 인증 설치 {id="install"}
`digest` 인증 프로바이더를 설치하려면 `install` 블록 내에서 [digest](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/digest.html) 함수를 호출하십시오.

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    digest {
        // Digest 인증 구성
    }
}
```
선택적으로 [라우트 인증](#authenticate-route)에 사용할 [프로바이더 이름](server-auth.md#provider-name)을 지정할 수 있습니다.

## Digest 인증 구성 {id="configure"}

Ktor에서 다양한 인증 프로바이더를 구성하는 방법에 대한 일반적인 개념은 [인증 구성](server-auth.md#configure)을 참조하십시오. 이 섹션에서는 `digest` 인증 프로바이더의 구체적인 구성 사항을 살펴보겠습니다.

### 1단계: Digest를 포함한 사용자 테이블 제공 {id="digest-table"}

`digest` 인증 프로바이더는 Digest 메시지의 `HA1` 부분을 사용하여 사용자 자격 증명을 검증합니다. 따라서 사용자 이름과 그에 해당하는 `HA1` 해시를 포함하는 사용자 테이블을 제공할 수 있습니다. 아래 예제에서는 `getMd5Digest` 함수를 사용하여 `HA1` 해시를 생성합니다.

```kotlin
fun getMd5Digest(str: String): ByteArray = MessageDigest.getInstance("MD5").digest(str.toByteArray(UTF_8))

val myRealm = "Access to the '/' path"
val userTable: Map<String, ByteArray> = mapOf(
    "jetbrains" to getMd5Digest("jetbrains:$myRealm:foobar"),
    "admin" to getMd5Digest("admin:$myRealm:password")
)
```

### 2단계: Digest 프로바이더 구성 {id="configure-provider"}

`digest` 인증 프로바이더는 [DigestAuthenticationProvider.Config](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-digest-authentication-provider/-config/index.html) 클래스를 통해 설정을 노출합니다. 아래 예제에서는 다음 설정들이 지정되었습니다:
* `realm` 속성은 `WWW-Authenticate` 헤더에 전달될 realm을 설정합니다.
* `digestProvider` 함수는 지정된 사용자 이름에 대한 Digest의 `HA1` 부분을 가져옵니다.
* (선택 사항) `validate` 함수를 사용하여 자격 증명을 커스텀 Principal에 매핑할 수 있습니다.

```kotlin
fun Application.main() {
    install(Authentication) {
        digest("auth-digest") {
            realm = myRealm
            digestProvider { userName, realm ->
                userTable[userName]
            }
            validate { credentials ->
                if (credentials.userName.isNotEmpty()) {
                    CustomPrincipal(credentials.userName, credentials.realm)
                } else {
                    null
                }
            }
        }
    }
}

data class CustomPrincipal(val userName: String, val realm: String)
```

[nonceManager](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-digest-authentication-provider/-config/nonce-manager.html) 속성을 사용하여 nonce 값을 생성하는 방법을 지정할 수도 있습니다.

### 3단계: 특정 리소스 보호 {id="authenticate-route"}

`digest` 프로바이더를 구성한 후에는 **[authenticate](server-auth.md#authenticate-route)** 함수를 사용하여 애플리케이션의 특정 리소스를 보호할 수 있습니다. 인증에 성공하면 라우트 핸들러 내부에서 `call.principal` 함수를 사용하여 인증된 [Principal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-principal/index.html)을 검색하고 인증된 사용자의 이름을 가져올 수 있습니다.

```kotlin
routing {
    authenticate("auth-digest") {
        get("/") {
            call.respondText("Hello, ${call.principal<CustomPrincipal>()?.userName}!")
        }
    }
}