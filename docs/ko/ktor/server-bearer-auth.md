[//]: # (title: Ktor Server의 Bearer 인증)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>필수 종속성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="auth-bearer"/>
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

Bearer 인증 스킴은 액세스 제어 및 인증에 사용되는 [HTTP 프레임워크](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)의 일부입니다. 이 스킴은 bearer 토큰(bearer tokens)이라고 불리는 보안 토큰을 포함합니다. Bearer 인증 스킴은 [OAuth](server-oauth.md) 또는 [JWT](server-jwt.md)의 일부로 사용되지만, bearer 토큰 승인을 위한 커스텀 로직을 제공할 수도 있습니다.

Ktor의 인증에 관한 일반적인 정보는 [Ktor Server의 인증 및 권한 부여](server-auth.md) 섹션에서 확인할 수 있습니다.

> Bearer 인증은 반드시 [HTTPS/TLS](server-ssl.md)를 통해서만 사용해야 합니다.

## 종속성 추가 {id="add_dependencies"}
`bearer` 인증을 활성화하려면 빌드 스크립트에 `%artifact_name%` 아티팩트를 포함해야 합니다.

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

## Bearer 인증 흐름 {id="flow"}

일반적으로 Bearer 인증 흐름은 다음과 같습니다.

1. 사용자가 성공적으로 인증하고 액세스 권한을 부여받으면, 서버는 클라이언트에 액세스 토큰을 반환합니다.
2. 클라이언트는 `Bearer` 스킴을 사용하여 `Authorization` 헤더에 전달된 토큰과 함께 보호된 리소스에 요청을 보낼 수 있습니다.
   ```HTTP
   GET http://localhost:8080/
   Authorization: Bearer abc123
   
   
   ```
3. 서버는 요청을 수신하고 토큰을 [검증](#configure)합니다.
4. 검증 후, 서버는 보호된 리소스의 내용으로 응답합니다.

## Bearer 인증 설치 {id="install"}
`bearer` 인증 프로바이더를 설치하려면 `install` 블록 내부에서 [bearer](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/bearer.html) 함수를 호출합니다.

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    bearer {
        // Bearer 인증 구성
    }
}
```

필요한 경우 [특정 경로를 인증](#authenticate-route)하는 데 사용할 수 있는 [프로바이더 이름](server-auth.md#provider-name)을 지정할 수 있습니다.

## Bearer 인증 구성 {id="configure"}

Ktor에서 다양한 인증 프로바이더를 구성하는 방법에 대한 일반적인 개념은 [인증 구성](server-auth.md#configure)을 참조하세요. 이 섹션에서는 `bearer` 인증 프로바이더의 구체적인 구성에 대해 살펴보겠습니다. 

### 1단계: bearer 프로바이더 구성 {id="configure-provider"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

`bearer` 인증 프로바이더는 [BearerAuthenticationProvider.Configuration](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-bearer-authentication-provider/-config/index.html) 클래스를 통해 설정을 노출합니다. 아래 예제에서는 다음과 같은 설정이 지정되었습니다.
* `realm` 속성은 `WWW-Authenticate` 헤더에 전달될 realm을 설정합니다.
* `authenticate` 함수는 클라이언트가 보낸 토큰을 확인하고, 인증에 성공하면 `UserIdPrincipal`을 반환하고 인증에 실패하면 `null`을 반환합니다.

```kotlin
install(Authentication) {
    bearer("auth-bearer") {
        realm = "Access to the '/' path"
        authenticate { tokenCredential ->
            if (tokenCredential.token == "abc123") {
                UserIdPrincipal("jetbrains")
            } else {
                null
            }
        }
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

<note>
    <p>
        타입 안전(type-safe) 인증 스킴 API는 실험적(experimental) 기능입니다. 언제든지 제거되거나 변경될 수 있습니다.
        옵트인이 필요합니다. 자세한 내용은
        <a href="server-typed-auth.md#prerequisites">API 활성화</a>를 참조하세요.
    </p>
</note>

`bearer()` 함수는 원하는 principal 타입에 대한 스킴을 생성합니다. `install(Authentication)`
단계는 필요하지 않으며, 스킴은 이를 필요로 하는 라우트에 전달하는 값입니다.

```kotlin
data class User(val name: String)

val bearerAuth = bearer<User>("auth-bearer") {
    realm = "Access to the '/' path"
    validate { tokenCredential ->
        if (tokenCredential.token == "abc123") {
            User("jetbrains")
        } else {
            null
        }
    }
}
```

이름 변경에 유의하세요. 클래식 프로바이더는 `authenticate`를 사용하는 반면, 타입 안전 스킴은 다른 타입 안전 스킴과 마찬가지로 `validate`를 사용합니다. 이 함수는 사용자가 지정한 principal 타입을 반환하거나, 인증에 실패하면 `null`을 반환합니다.

또한 `authHeader`를 설정하여 `Authorization` 헤더 이외의 위치에서 토큰을 읽을 수 있으며, `authSchemes`를 설정하여 `Bearer` 이외의 스킴을 허용할 수도 있습니다. 전체 API에 대해서는 [타입 안전 인증](server-typed-auth.md)을 참조하세요.

</TabItem>
</Tabs>

### 2단계: 특정 리소스 보호 {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

`bearer` 프로바이더를 구성한 후에는 **[authenticate](server-auth.md#authenticate-route)** 함수를 사용하여 애플리케이션의 특정 리소스를 보호할 수 있습니다. 인증에 성공하면 라우트 핸들러 내부에서 `call.principal` 함수를 사용해 인증된 [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)을 가져와 인증된 사용자의 이름을 얻을 수 있습니다.

```kotlin
routing {
    authenticate("auth-bearer") {
        get("/") {
            val user = call.principal<UserIdPrincipal>()
            call.respondText("Hello, ${user?.name}!")
        }
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

스킴을 `authenticateWith()`에 전달합니다. 블록 내부에서 `call.principal`은 사용자가 지정한 principal 타입이며 절대 `null`이 될 수 없으므로, 타입 캐스팅이나 null 검사가 필요하지 않습니다.

```kotlin
routing {
    authenticateWith(bearerAuth) {
        get("/") {
            call.respondText("Hello, ${call.principal.name}!")
        }
    }
}
```

</TabItem>
</Tabs>