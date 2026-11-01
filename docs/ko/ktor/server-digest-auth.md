[//]: # (title: Ktor Server의 다이제스트 인증)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth"/>

<tldr>
<p>
<b>필수 종속성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="auth-digest"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor는 Kotlin/Native를 지원하여 추가 런타임이나 가상 머신 없이 서버를 실행할 수 있습니다.">Native 서버</Links> 지원</b>: ✖️
</p>
</tldr>

다이제스트 인증(Digest authentication) 방식은 접근 제어 및 인증에 사용되는 [HTTP 프레임워크](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)의 일부입니다. 이 방식에서는 사용자 이름과 비밀번호를 네트워크로 전송하기 전에 해시 함수를 적용합니다.

Ktor는 더 강력한 해시 알고리즘, 보호 품질(QoP) 옵션, 프라이버시 보호를 위한 사용자 이름 해싱을 포함한 최신 보안 기능으로 기존 RFC 2617을 개선한 [RFC 7616](https://datatracker.ietf.org/doc/html/rfc7616)(HTTP Digest Access Authentication)을 지원합니다.

Ktor를 사용하면 다이제스트 인증을 적용하여 사용자를 로그인 처리하고 특정 [경로(route)](server-routing.md)를 보호할 수 있습니다.
Ktor의 인증에 대한 일반적인 정보는 [Ktor Server의 인증 및 권한 부여](server-auth.md) 섹션에서 확인할 수 있습니다.

> 다이제스트 인증은 비밀번호를 평문으로 전송하지 않으므로 [기본 인증(Basic authentication)](server-basic-auth.md)보다 강력한 보안을 제공합니다. 하지만 전송 계층의 보안을 강화하기 위해 프로덕션 환경에서는 [HTTPS/TLS](server-ssl.md)를 사용하는 것을 권장합니다.

## 종속성 추가 {id="add_dependencies"}

`digest` 인증을 활성화하려면 빌드 스크립트에 `%artifact_name%` 아티팩트를 포함해야 합니다:

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            위 코드 스니펫은 Ktor 종속성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 버전 카탈로그</a>를 사용합니다.
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            위 코드 스니펫은 Ktor 종속성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 버전 카탈로그</a>를 사용합니다.
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 다이제스트 인증 흐름 {id="flow"}

다이제스트 인증 흐름은 다음과 같이 진행됩니다:

1. 클라이언트가 서버 애플리케이션의 특정 [경로](server-routing.md)에 `Authorization` 헤더 없이 요청을 보냅니다.
2. 서버는 클라이언트에 `401`(Unauthorized) 응답 상태로 응답하며, 해당 경로를 보호하는 데 다이제스트 인증 방식이 사용된다는 정보를 제공하기 위해 `WWW-Authenticate` 응답 헤더를 사용합니다. 일반적인 `WWW-Authenticate` 헤더는 다음과 같습니다:

   ```
   WWW-Authenticate: Digest
           realm="Access to the '/' path",
           nonce="e4549c0548886bc2",
           algorithm=SHA-512-256,
           qop="auth"
   ```
   {style="block"}

   Ktor에서는 `digest` 인증 제공자를 [구성](#configure-provider)할 때 realm, 지원되는 알고리즘, 보호 품질(QoP), nonce 값 생성 방식을 지정할 수 있습니다.

3. 일반적으로 클라이언트는 사용자가 자격 증명(자격 증명 정보)을 입력할 수 있는 로그인 대화 상자를 표시합니다. 그런 다음 클라이언트는 다음과 같은 `Authorization` 헤더를 포함하여 요청을 보냅니다:

   ```
   Authorization: Digest username="jetbrains",
           realm="Access to the '/' path",
           nonce="e4549c0548886bc2",
           uri="/",
           algorithm=SHA-512-256,
           qop=auth,
           nc=00000001,
           cnonce="0a4f113b",
           response="6629fae49393a05397450978507c4ef1"
   ```
   {style="block"}

   `response` 값은 다음과 같은 방식으로 생성됩니다:

    * `HA1 = H(username:realm:password)` (여기서 `H`는 설정된 해시 알고리즘입니다. 예: SHA-512-256)
   > 이 부분은 서버에 [저장](#digest-table)되며 Ktor에서 사용자 자격 증명을 검증하는 데 사용할 수 있습니다.

    * `HA2 = H(method:digestURI)` (`qop=auth`인 경우) 또는 `HA2 = H(method:digestURI:H(entityBody))` (`qop=auth-int`인 경우)

    * `response = H(HA1:nonce:nc:cnonce:qop:HA2)`

4. 서버는 클라이언트가 보낸 자격 증명을 [검증](#configure-provider)하고 요청된 콘텐츠로 응답합니다. QoP를 사용한 인증에 성공하면 서버는 상호 인증을 위해 `Authentication-Info` 헤더도 반환합니다.

## 다이제스트 인증 설치 {id="install"}

`digest` 인증 제공자를 설치하려면 `install` 블록 내에서 [digest](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/digest.html) 함수를 호출합니다:

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    digest {
        // 다이제스트 인증 구성
    }
}
```

선택적으로 [지정된 경로를 인증](#authenticate-route)하는 데 사용할 수 있는 [제공자 이름](server-auth.md#provider-name)을 지정할 수도 있습니다.

## 다이제스트 인증 구성 {id="configure"}

Ktor에서 다양한 인증 제공자를 구성하는 방법에 대한 전반적인 내용은 [인증 구성](server-auth.md#configure)을 참조하세요.
이 섹션에서는 `digest` 인증 제공자의 구체적인 구성 세부 사항을 살펴봅니다.

### 1단계: 해시 알고리즘 선택 {id="choose-algorithms"}

Ktor는 다이제스트 인증을 위한 여러 해시 알고리즘을 지원합니다. `algorithms` 프로퍼티를 사용하여 서버가 허용할 알고리즘을 구성할 수 있습니다:

| 알고리즘             | 상수                                 | 보안 수준          | 참고 사항                                           |
|------------------|------------------------------------|-----------------|-------------------------------------------------|
| SHA-512-256      | `DigestAlgorithm.SHA_512_256`      | **권장**          | 가장 강력한 보안, 새로운 구현 시 사용 권장                |
| SHA-512-256-sess | `DigestAlgorithm.SHA_512_256_SESS` | **권장**          | 세션 변형 - HA1에 클라이언트 nonce 포함              |
| SHA-256          | `DigestAlgorithm.SHA_256`          | 양호            | 프로덕션 환경에 권장되는 최소 수준                      |
| SHA-256-sess     | `DigestAlgorithm.SHA_256_SESS`     | 양호            | 세션 변형 - HA1에 클라이언트 nonce 포함              |
| MD5              | `DigestAlgorithm.MD5`              | **지원 중단(Deprecated)** | 이전 버전과의 호환성만을 위해 제공                   |
| MD5-sess         | `DigestAlgorithm.MD5_SESS`         | **지원 중단(Deprecated)** | 세션 변형 - 레거시 호환성만을 위해 제공               |

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = "Access to the '/' path"
        algorithms = listOf(
            DigestAlgorithm.SHA_512_256,
            DigestAlgorithm.MD5
        )
        // ...
    }
}
```

여러 알고리즘이 구성되어 있으면 서버는 여러 `WWW-Authenticate` 헤더를 전송하여 클라이언트가 지원하는 가장 강력한 알고리즘을 선택할 수 있도록 합니다.

> 기본 알고리즘은 `SHA-512-256` 및 `MD5`(구형 클라이언트와의 하위 호환성을 위함)입니다.

#### 세션 알고리즘(-sess 변형) {id="sess-algorithms"}

`-sess` 알고리즘 변형(예: `SHA-512-256-sess`, `SHA-256-sess`, `MD5-sess`)은 `HA1` 해시 계산 방식을 수정합니다. 세션 알고리즘은 `H(username:realm:password)`를 저장하는 대신 `H(H(username:realm:password):nonce:cnonce)`를 계산합니다. 여기서 `cnonce`는 클라이언트가 제공하는 nonce입니다.

**장점:**

- 세션별 해시를 사용하므로 사전 계산된 딕셔너리 공격(pre-computed dictionary attacks)을 방지합니다.
- 한 세션의 해시가 유출되더라도 비밀번호가 노출되지 않으며 다른 세션에 영향을 미치지 않습니다.

**단점:**

- 서버가 각 인증 요청마다 해시를 계산해야 합니다(사전 계산된 값을 사용할 수 없음).

대부분의 애플리케이션에서는 특히 SHA-512-256과 같은 강력한 해시 함수를 사용할 때 표준(비세션) 알고리즘으로도 충분합니다.

### 2단계: 다이제스트가 포함된 사용자 테이블 제공 {id="digest-table"}

`digest` 인증 제공자는 다이제스트 메시지의 `HA1` 부분을 사용하여 사용자 자격 증명을 검증하므로, 사용자 이름과 그에 해당하는 `HA1` 해시가 포함된 사용자 테이블을 제공할 수 있습니다.

알고리즘마다 서로 다른 해시 값을 생성하므로 지원하는 각 알고리즘에 적합한 해시를 저장하거나, 클라이언트가 요청한 알고리즘을 기반으로 동적으로 해시를 계산해야 합니다:

```kotlin
val userPasswords: Map<String, String> = mapOf(
    "jetbrains" to "foobar",
    "admin" to "password"
)

fun computeHash(
    userName: String,
    realm: String,
    password: String,
    algorithm: DigestAlgorithm
): ByteArray =
    algorithm.toDigester()
        .digest("$userName:$realm:$password".toByteArray(UTF_8))
```

### 3단계: 다이제스트 제공자 구성 {id="configure-provider"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

`digest` 인증 제공자는 [DigestAuthenticationProvider.Config](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-digest-authentication-provider/-config/index.html) 클래스를 통해 설정을 노출합니다. 아래 예제에서는 다음 설정들이 지정되어 있습니다:

* `realm` 프로퍼티는 `WWW-Authenticate` 헤더에 전달될 realm을 설정합니다.
* `algorithms` 프로퍼티는 허용할 해시 알고리즘을 지정합니다.
* `digestProvider` 함수는 지정된 사용자 이름과 알고리즘에 해당하는 다이제스트의 `HA1` 부분을 가져옵니다.
* (선택 사항) `validate` 함수를 사용하면 자격 증명을 커스텀 Principal에 매핑할 수 있습니다.

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = myRealm
        // 최신 SHA-512-256 및
        // 레거시 MD5 클라이언트 모두 지원
        algorithms = listOf(
            DigestAlgorithm.SHA_512_256,
            DigestAlgorithm.MD5
        )
        digestProvider { userName, realm, algorithm ->
            // 요청된 알고리즘을 사용하여
            // H(username:realm:password) 계산
            userPasswords[userName]?.let { password ->
                computeHash(
                    userName, realm, password, algorithm
                )
            }
        }
        validate { credentials ->
            if (credentials.userName.isNotEmpty()) {
                CustomPrincipal(
                    credentials.userName,
                    credentials.realm
                )
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
        타입 안전(type-safe) 인증 스킴 API는 실험적(experimental)입니다. 언제든지 제거되거나 변경될 수 있습니다.
        사용을 위해서는 opt-in이 필요합니다. 자세한 내용은
        <a href="server-typed-auth.md#prerequisites">타입 안전 인증 문서</a>를 참조하세요.
    </p>
</note>

`digest()` 함수는 선택한 Principal 타입에 대한 스킴을 생성합니다. `install(Authentication)` 단계가 없으며, 스킴은 필요한 경로에 전달하는 값입니다.

```kotlin
data class CustomPrincipal(
    val userName: String,
    val realm: String
)

val digestAuth = digest<CustomPrincipal>("auth-digest") {
    realm = myRealm
    // 최신 SHA-512-256 및
    // 레거시 MD5 클라이언트 모두 지원
    algorithms = listOf(
        DigestAlgorithm.SHA_512_256,
        DigestAlgorithm.MD5
    )
    digestProvider { userName, realm, algorithm ->
        // 요청된 알고리즘을 사용하여
        // H(username:realm:password) 계산
        userPasswords[userName]?.let { password ->
            computeHash(userName, realm, password, algorithm)
        }
    }
    validate { credentials ->
        if (credentials.userName.isNotEmpty()) {
            CustomPrincipal(
                credentials.userName,
                credentials.realm
            )
        } else {
            null
        }
    }
}
```

타입 안전 `digest()` 함수는 JVM에서만 사용할 수 있습니다. 전체 API에 대해서는 [타입 안전 인증](server-typed-auth.md)을 참조하세요.

</TabItem>
</Tabs>

`digestProvider` 함수는 세 개의 파라미터를 받습니다:

- `userName` – 클라이언트 요청의 사용자 이름
- `realm` – 구성된 realm
- `algorithm` – 클라이언트가 사용 중인 해시 알고리즘

지정된 알고리즘으로 계산된 `HA1` 해시를 반환해야 하며, 사용자를 찾을 수 없는 경우 `null`을 반환해야 합니다.

또한 [nonceManager](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-digest-authentication-provider/-config/nonce-manager.html) 프로퍼티를 사용하여 nonce 값 생성 방식을 지정할 수도 있습니다.

### 4단계: 보호 품질(QoP) 구성 {id="configure-qop"}

보호 품질(Quality of Protection, QoP)은 다이제스트 계산에 무엇이 포함될지를 결정합니다:

- `DigestQop.AUTH` – 인증 전용(기본값). 다이제스트에 요청 메서드와 URI가 포함됩니다.
- `DigestQop.AUTH_INT` – 무결성 보호를 포함한 인증. 다이제스트에 요청 본문도 포함되어 변조 방지 기능을 제공합니다.

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = "Secure API"
        supportedQop = listOf(
            DigestQop.AUTH,
            DigestQop.AUTH_INT
        )
        // ...
    }
}
```

> `auth-int`를 사용하는 경우 인증 중에 요청 본문이 소비(consume)됩니다. 경로 핸들러에서 본문에 접근해야 하는 경우 [DoubleReceive](server-double-receive.md) 플러그인을 설치하세요.

### 5단계: 특정 리소스 보호 {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

`digest` 제공자를 구성한 후에는 **[authenticate](server-auth.md#authenticate-route)** 함수를 사용하여 애플리케이션의 특정 리소스를 보호할 수 있습니다. 인증에 성공한 경우, 경로 핸들러 내부에서 `call.principal` 함수를 사용하여 인증된 [Principal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-principal/index.html)을 가져오고 인증된 사용자의 이름을 얻을 수 있습니다.

```kotlin
routing {
    authenticate("auth-digest") {
        get("/") {
            val user = call.principal<CustomPrincipal>()
            call.respondText("Hello, ${user?.userName}!")
        }
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

해당 스킴을 `authenticateWith()`에 전달합니다. 블록 내부에서 `call.principal`은 사용자가 정의한 Principal 타입이며 절대 `null`이 되지 않으므로, 타입 캐스팅이나 null 검사가 필요하지 않습니다:

```kotlin
routing {
    authenticateWith(digestAuth) {
        get("/") {
            val user = call.principal
            call.respondText("Hello, ${user.userName}!")
        }
    }
}
```

</TabItem>
</Tabs>

## 고급 구성 {id="advanced"}

### 사용자 해시 지원 {id="userhash"}

RFC 7616은 프라이버시 보호를 위해 사용자 이름 해싱(`userhash`)을 도입했습니다. 이 기능이 활성화되면 클라이언트는 평문 사용자 이름 대신 해시된 버전의 사용자 이름을 보낼 수 있습니다.

사용자 이름 해싱을 지원하려면 `userHashResolver`를 구성합니다:

```kotlin
val users = listOf("alice", "bob", "charlie")

install(Authentication) {
    digest("auth-digest") {
        realm = "Private API"
        userHashResolver { userhash, realm, algorithm ->
            // 해시로부터 실제 사용자 이름을 찾음
            users.find { username ->
                val digester = algorithm.toDigester()
                val bytes = "$username:$realm".toByteArray()
                hex(digester.digest(bytes)) == userhash
            }
        }
        digestProvider { userName, realm, algorithm ->
            // ...
        }
    }
}
```

`userHashResolver`가 구성되면 서버는 `WWW-Authenticate` 챌린지 헤더에 `userhash=true`를 알립니다.

### Strict RFC 7616 모드 {id="strict-mode"}

레거시 클라이언트 지원 요구 사항이 없는 새로운 애플리케이션에서 보안을 극대화하려면 `strictRfc7616Mode()`를 사용하세요:

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = "Secure Zone"
        strictRfc7616Mode()
        digestProvider { userName, realm, algorithm ->
            // strict 모드에서는 알고리즘이 절대 MD5가 되지 않음
        }
    }
}
```

Strict 모드 동작:

- MD5 알고리즘 제거(SHA-256, SHA-512-256 및 해당 세션 변형만 허용)
- UTF-8 문자셋(charset) 강제 적용

### UTF-8 문자셋 지원 {id="charset"}

`digest` 인증 제공자는 ASCII 이외의 문자가 포함된 사용자 이름과 비밀번호를 위해 UTF-8 문자셋을 지원합니다:

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = "My App"
        charset = Charsets.UTF_8  // 기본값임
        // ...
    }
}
```

### Authentication-Info 헤더 {id="auth-info"}

QoP를 사용한 인증에 성공하면 서버는 다음 내용이 포함된 `Authentication-Info` 헤더를 자동으로 반환합니다:

- `rspauth` - 상호 인증을 위한 응답 인증 값
- `nextnonce` - 클라이언트가 다음에 사용할 nonce
- `qop`, `nc`, `cnonce` - 인증 매개변수 에코

이를 통해 클라이언트는 서버의 신원을 검증(상호 인증)할 수 있습니다.

## 보안 권장 사항 {id="security"}

1. **SHA-512-256 또는 SHA-256 사용** - 프로덕션 환경에서는 MD5를 피하세요. MD5는 레거시 호환성만을 위해 포함되어 있습니다.

2. **`strictRfc7616Mode()` 사용** - 레거시 클라이언트 지원 요구 사항이 없는 새로운 애플리케이션에 권장됩니다.

3. **올바른 nonce 관리 구현** – 분산 환경에서 재전송 공격(replay attacks)을 방지하려면 커스텀 `NonceManager`를 사용하세요.

4. **`auth-int` 고려** - 애플리케이션에서 요청 본문의 무결성이 중요한 경우 사용하세요.

5. **`userhash` 활성화** - 사용자 이름의 프라이버시 보호를 위해 사용하세요.

6. **항상 HTTPS 사용** – 다이제스트 인증 자체는 트래픽을 암호화하지 않으므로 프로덕션 환경에서는 항상 TLS를 함께 사용하세요.