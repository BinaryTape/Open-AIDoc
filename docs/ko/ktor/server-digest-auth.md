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
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native 서버</Links> 지원</b>: ✖️
</p>
</tldr>

Digest 인증 방식은 액세스 제어 및 인증에 사용되는 [HTTP 프레임워크](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)의 일부입니다. 이 방식에서는 사용자 이름과 비밀번호를 네트워크를 통해 전송하기 전에 해시 함수를 적용합니다.

Ktor는 [RFC 7616](https://datatracker.ietf.org/doc/html/rfc7616) (HTTP Digest Access Authentication)을 지원합니다. 이는 더 강력한 해시 알고리즘, QoP(Quality of Protection) 옵션, 프라이버시를 위한 사용자 이름 해싱을 포함하여 기존의 RFC 2617을 개선한 최신 보안 기능을 제공합니다.

Ktor를 사용하면 사용자 로그인 및 특정 [라우트(route)](server-routing.md) 보호를 위해 Digest 인증을 사용할 수 있습니다. Ktor의 인증에 대한 일반적인 정보는 [Ktor Server의 인증 및 권한 부여](server-auth.md) 섹션에서 확인할 수 있습니다.

> Digest 인증은 비밀번호를 평문으로 전송하지 않기 때문에 [Basic 인증](server-basic-auth.md)보다 더 강력한 보안을 제공합니다. 하지만 추가적인 전송 계층 보안을 위해 프로덕션 환경에서는 [HTTPS/TLS](server-ssl.md)를 함께 사용하는 것이 권장됩니다.

## 의존성 추가 {id="add_dependencies"}

`digest` 인증을 활성화하려면 빌드 스크립트에 `%artifact_name%` 아티팩트를 포함해야 합니다:

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

## Digest 인증 흐름 {id="flow"}

Digest 인증 흐름은 다음과 같습니다:

1. 클라이언트가 서버 애플리케이션의 특정 [라우트](server-routing.md)에 `Authorization` 헤더 없이 요청을 보냅니다.
2. 서버는 클라이언트에게 `401` (Unauthorized) 응답 상태로 응답하고, `WWW-Authenticate` 응답 헤더를 사용하여 해당 라우트를 보호하는 데 Digest 인증 방식이 사용됨을 알립니다. 일반적인 `WWW-Authenticate` 헤더는 다음과 같습니다:

   ```
   WWW-Authenticate: Digest
           realm="Access to the '/' path",
           nonce="e4549c0548886bc2",
           algorithm=SHA-512-256,
           qop="auth"
   ```
   {style="block"}

   Ktor에서는 `digest` 인증 프로바이더를 [구성](#configure-provider)할 때 realm, 지원되는 알고리즘, QoP, nonce 생성 방법을 지정할 수 있습니다.

3. 보통 클라이언트는 사용자가 자격 증명(credentials)을 입력할 수 있는 로그인 대화 상자를 표시합니다. 그런 다음 클라이언트는 다음과 같은 `Authorization` 헤더를 포함하여 요청을 보냅니다:

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

    * `HA1 = H(username:realm:password)`, 여기서 `H`는 구성된 해시 알고리즘(예: SHA-512-256)입니다.
   > 이 부분은 서버에 [저장](#digest-table)되며, Ktor에서 사용자 자격 증명을 검증하는 데 사용될 수 있습니다.

    * `HA2 = H(method:digestURI)` (`qop=auth`인 경우) 또는 `HA2 = H(method:digestURI:H(entityBody))` (`qop=auth-int`인 경우)

    * `response = H(HA1:nonce:nc:cnonce:qop:HA2)`

4. 서버는 클라이언트가 보낸 자격 증명을 [검증](#configure-provider)하고 요청된 콘텐츠로 응답합니다. QoP를 통한 인증에 성공하면, 서버는 상호 인증을 위해 `Authentication-Info` 헤더도 함께 반환합니다.

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

선택적으로 특정 [라우트 인증](#authenticate-route)에 사용할 [프로바이더 이름](server-auth.md#provider-name)을 지정할 수 있습니다.

## Digest 인증 구성 {id="configure"}

Ktor에서 다양한 인증 프로바이더를 구성하는 방법에 대한 일반적인 개념은 [인증 구성](server-auth.md#configure)을 참조하십시오. 이 섹션에서는 `digest` 인증 프로바이더의 구체적인 구성 사항을 살펴보겠습니다.

### 1단계: 해시 알고리즘 선택 {id="choose-algorithms"}

Ktor는 Digest 인증을 위해 여러 해시 알고리즘을 지원합니다. `algorithms` 속성을 사용하여 서버가 허용할 알고리즘을 구성할 수 있습니다.

| 알고리즘             | 상수                                 | 보안 수준        | 비고                                          |
|-------------------|------------------------------------|---------------|---------------------------------------------|
| SHA-512-256      | `DigestAlgorithm.SHA_512_256`      | **권장**       | 가장 강력한 보안, 새로운 구현에 사용 권장                |
| SHA-512-256-sess | `DigestAlgorithm.SHA_512_256_SESS` | **권장**       | 세션 변형 - HA1에 클라이언트 nonce 포함            |
| SHA-256          | `DigestAlgorithm.SHA_256`          | 좋음           | 프로덕션 환경에서 권장되는 최소 수준                  |
| SHA-256-sess     | `DigestAlgorithm.SHA_256_SESS`     | 좋음           | 세션 변형 - HA1에 클라이언트 nonce 포함            |
| MD5              | `DigestAlgorithm.MD5`              | **사용 중단**    | 이전 버전과의 호환성만을 위해 사용                  |
| MD5-sess         | `DigestAlgorithm.MD5_SESS`         | **사용 중단**    | 세션 변형 - 레거시 호환성만을 위해 사용                |

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

여러 알고리즘이 구성된 경우, 서버는 여러 개의 `WWW-Authenticate` 헤더를 전송하여 클라이언트가 지원하는 가장 강력한 알고리즘을 선택할 수 있도록 합니다.

> 기본 알고리즘은 `SHA-512-256` 및 `MD5`(이전 클라이언트와의 호환성용)입니다.

#### 세션 알고리즘 (-sess 변형) {id="sess-algorithms"}

`-sess` 알고리즘 변형(예: `SHA-512-256-sess`, `SHA-256-sess`, `MD5-sess`)은 `HA1` 해시 계산 방식을 변경합니다. `H(username:realm:password)`를 저장하는 대신, 세션 알고리즘은 `H(H(username:realm:password):nonce:cnonce)`를 계산합니다. 여기서 `cnonce`는 클라이언트가 제공한 nonce입니다.

**장점:**

- 세션별 해시는 사전 계산된 사전 공격(pre-computed dictionary attacks)을 방지합니다.
- 한 세션의 해시가 유출되어도 비밀번호가 노출되지 않으며 다른 세션에 영향을 주지 않습니다.

**단점:**

- 서버는 각 인증 요청마다 해시를 계산해야 합니다 (사전 계산된 값을 사용할 수 없음).

대부분의 애플리케이션에서는 특히 SHA-512-256과 같은 강력한 해시 함수와 함께 사용할 때 표준(비세션) 알고리즘으로도 충분합니다.

### 2단계: Digest를 포함한 사용자 테이블 제공 {id="digest-table"}

`digest` 인증 프로바이더는 Digest 메시지의 `HA1` 부분을 사용하여 사용자 자격 증명을 검증하므로, 사용자 이름과 그에 해당하는 `HA1` 해시를 포함하는 사용자 테이블을 제공할 수 있습니다.

알고리즘마다 생성되는 해시 값이 다르므로, 지원하는 각 알고리즘에 적절한 해시를 저장하거나 클라이언트가 요청한 알고리즘에 따라 동적으로 해시를 계산해야 합니다.

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

### 3단계: Digest 프로바이더 구성 {id="configure-provider"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

`digest` 인증 프로바이더는 [DigestAuthenticationProvider.Config](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-digest-authentication-provider/-config/index.html) 클래스를 통해 설정을 노출합니다. 아래 예제에서는 다음 설정들이 지정되었습니다:

* `realm` 속성은 `WWW-Authenticate` 헤더에 전달될 realm을 설정합니다.
* `algorithms` 속성은 허용할 해시 알고리즘을 지정합니다.
* `digestProvider` 함수는 지정된 사용자 이름과 알고리즘에 대한 Digest의 `HA1` 부분을 가져옵니다.
* (선택 사항) `validate` 함수를 사용하여 자격 증명을 커스텀 Principal에 매핑할 수 있습니다.

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = myRealm
        // 최신 SHA-512-256 및 레거시 MD5 클라이언트 모두 지원
        algorithms = listOf(
            DigestAlgorithm.SHA_512_256,
            DigestAlgorithm.MD5
        )
        digestProvider { userName, realm, algorithm ->
            // 요청된 알고리즘을 사용하여 H(username:realm:password) 계산
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
        타입 세이프 인증 체계 API는 실험적입니다. 언제든지 중단되거나 변경될 수 있습니다.
        사용을 위해 명시적인 동의(Opt-in)가 필요합니다. 자세한 내용은
        <a href="server-typed-auth.md#prerequisites">API 활성화</a>를 참조하십시오.
    </p>
</note>

`digest()` 함수는 선택한 principal 타입을 위한 체계를 생성합니다. `install(Authentication)` 단계는 필요하지 않으며, 이 체계는 이를 필요로 하는 라우트에 전달하는 값입니다.

```kotlin
data class CustomPrincipal(
    val userName: String,
    val realm: String
)

val digestAuth = digest<CustomPrincipal>("auth-digest") {
    realm = myRealm
    // 최신 SHA-512-256 및 레거시 MD5 클라이언트 모두 지원
    algorithms = listOf(
        DigestAlgorithm.SHA_512_256,
        DigestAlgorithm.MD5
    )
    digestProvider { userName, realm, algorithm ->
        // 요청된 알고리즘을 사용하여 H(username:realm:password) 계산
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

타입 세이프 `digest()` 함수는 JVM에서만 사용할 수 있습니다. 전체 API에 대해서는 [타입 세이프 인증](server-typed-auth.md)을 참조하십시오.

</TabItem>
</Tabs>

`digestProvider` 함수는 세 가지 매개변수를 받습니다:

- `userName` – 클라이언트 요청의 사용자 이름
- `realm` - 구성된 realm
- `algorithm` – 클라이언트가 사용 중인 해시 알고리즘

지정된 알고리즘으로 계산된 `HA1` 해시를 반환해야 하며, 사용자를 찾을 수 없는 경우 `null`을 반환해야 합니다.

[nonceManager](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-digest-authentication-provider/-config/nonce-manager.html) 속성을 사용하여 nonce 값을 생성하는 방법을 지정할 수도 있습니다.

### 4단계: QoP(Quality of Protection) 구성 {id="configure-qop"}

QoP(Quality of Protection)는 Digest 계산에 포함될 내용을 결정합니다:

- `DigestQop.AUTH` – 인증 전용 (기본값). Digest에 요청 메서드와 URI가 포함됩니다.
- `DigestQop.AUTH_INT` – 무결성 보호를 포함한 인증. Digest에 요청 본문도 포함되어 변조 방지 기능을 제공합니다.

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

> `auth-int`를 사용할 때 요청 본문은 인증 중에 소비됩니다. 라우트 핸들러에서 본문에 액세스해야 하는 경우 [DoubleReceive](server-double-receive.md) 플러그인을 설치하십시오.

### 5단계: 특정 리소스 보호 {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

`digest` 프로바이더를 구성한 후에는 **[authenticate](server-auth.md#authenticate-route)** 함수를 사용하여 애플리케이션의 특정 리소스를 보호할 수 있습니다. 인증에 성공하면 라우트 핸들러 내부에서 `call.principal` 함수를 사용하여 인증된 [Principal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-principal/index.html)을 검색하고 인증된 사용자의 이름을 가져올 수 있습니다.

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

체계를 `authenticateWith()`에 전달하십시오. 블록 내부에서 `call.principal`은 지정한 principal 타입이며 절대 `null`이 아니므로 캐스팅이나 null 검사가 필요하지 않습니다:

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

RFC 7616은 프라이버시 보호를 위해 사용자 이름 해싱(`userhash`)을 도입했습니다. 이 기능이 활성화되면 클라이언트는 평문 사용자 이름 대신 해싱된 버전의 사용자 이름을 보낼 수 있습니다.

사용자 이름 해싱을 지원하려면 `userHashResolver`를 구성하십시오:

```kotlin
val users = listOf("alice", "bob", "charlie")

install(Authentication) {
    digest("auth-digest") {
        realm = "Private API"
        userHashResolver { userhash, realm, algorithm ->
            // 해시에서 실제 사용자 이름 찾기
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

`userHashResolver`가 구성되면, 서버는 `WWW-Authenticate` 챌린지 헤더에 `userhash=true`를 광고합니다.

### Strict RFC 7616 모드 {id="strict-mode"}

레거시 클라이언트 요구 사항이 없는 새로운 애플리케이션에서 최대 보안을 위해 `strictRfc7616Mode()`를 사용하십시오:

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = "Secure Zone"
        strictRfc7616Mode()
        digestProvider { userName, realm, algorithm ->
            // strict 모드에서 알고리즘은 절대 MD5가 되지 않습니다.
        }
    }
}
```

Strict 모드:

- MD5 알고리즘을 제거합니다 (SHA-256, SHA-512-256 및 해당 세션 변형만 허용).
- UTF-8 문자셋을 강제합니다.

### UTF-8 문자셋 지원 {id="charset"}

`digest` 인증 프로바이더는 비 ASCII 문자를 포함하는 사용자 이름과 비밀번호를 위해 UTF-8 문자셋을 지원합니다:

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = "My App"
        charset = Charsets.UTF_8  // 이것이 기본값입니다.
        // ...
    }
}
```

### Authentication-Info 헤더 {id="auth-info"}

QoP를 통한 인증에 성공하면 서버는 다음을 포함하는 `Authentication-Info` 헤더를 자동으로 반환합니다:

- `rspauth` - 상호 인증을 위한 응답 인증 값
- `nextnonce` - 클라이언트가 다음에 사용할 nonce
- `qop`, `nc`, `cnonce` - 인증 매개변수 에코

이를 통해 클라이언트는 서버의 신원을 확인할 수 있습니다 (상호 인증).

## 보안 권장 사항 {id="security"}

1. **SHA-512-256 또는 SHA-256 사용** - 프로덕션에서 MD5를 피하십시오. 이는 오직 레거시 호환성을 위해서만 포함되었습니다.

2. **`strictRfc7616Mode()` 사용** - 레거시 클라이언트 요구 사항이 없는 새로운 애플리케이션의 경우.

3. **적절한 nonce 관리 구현** – 분산 환경에서 재전송 공격(replay attack)을 방지하려면 커스텀 `NonceManager`를 사용하십시오.

4. **`auth-int` 고려** - 애플리케이션에서 요청 본문의 무결성이 중요한 경우.

5. **`userhash` 활성화** - 사용자 이름의 프라이버시 보호를 위해.

6. **항상 HTTPS 사용** – Digest 인증 자체는 트래픽을 암호화하지 않습니다. 프로덕션 환경에서는 항상 TLS를 사용하십시오.