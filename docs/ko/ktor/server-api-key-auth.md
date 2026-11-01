[//]: # (title: API 키 인증)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth-api-key"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:ktor-server-auth</code>, <code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native 서버</Links> 지원</b>: ✅
</p>
</tldr>

API 키 인증(API Key authentication)은 클라이언트가 주로 헤더에 시크릿 키를 요청의 일부로 포함하여 전달하는 간단한 인증 방식입니다. 이 키는 식별자이자 인증 메커니즘의 역할을 모두 수행합니다.

Ktor를 사용하면 API 키 인증을 통해 [라우트](server-routing.md)를 보호하고 클라이언트 요청을 검증할 수 있습니다.

> Ktor의 인증에 대한 일반적인 정보는 [Ktor Server의 인증 및 인가](server-auth.md) 섹션에서 확인할 수 있습니다.

> API 키는 비밀로 유지되어야 하며 안전하게 전송되어야 합니다. 전송 중인 API 키를 보호하기 위해 [HTTPS/TLS](server-ssl.md)를 사용하는 것을 권장합니다.
>
{style="note"}

## 의존성 추가 {id="add_dependencies"}

API 키 인증을 활성화하려면 빌드 스크립트에 `ktor-server-auth` 및 `%artifact_name%` 아티팩트를 추가합니다.

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">

```kotlin
implementation("io.ktor:%artifact_name%:$ktor_version")
implementation("io.ktor:ktor-server-auth:$ktor_version")
```
</TabItem>
<TabItem title="Gradle (Groovy)" group-key="groovy">

```Groovy
implementation "io.ktor:%artifact_name%:$ktor_version"
implementation "io.ktor:ktor-server-auth:$ktor_version"

```
</TabItem>

<TabItem title="Maven" group-key="maven">

```xml
<dependency>
    <groupId>io.ktor</groupId>
    <artifactId>%artifact_name%-jvm</artifactId>
    <version>${ktor_version}</version>
</dependency>
<dependency>
    <groupId>io.ktor</groupId>
    <artifactId>ktor-server-auth</artifactId>
    <version>${ktor_version}</version>
</dependency>
```

</TabItem>
</Tabs>

## API 키 인증 흐름 {id="flow"}

API 키 인증 흐름은 다음과 같습니다.

1. 클라이언트가 서버 애플리케이션의 특정 [라우트](server-routing.md)로 헤더(주로 `X-API-Key`)에 API 키를 포함하여 요청을 보냅니다.
2. 서버는 커스텀 검증 로직을 사용하여 API 키를 검증합니다.
3. 키가 유효하면 서버는 요청된 콘텐츠로 응답합니다. 키가 유효하지 않거나 누락된 경우, 서버는 `401 Unauthorized` 상태 코드로 응답합니다.

## API 키 인증 설치 {id="install"}

`apiKey` 인증 프로바이더를 설치하려면 `install(Authentication)` 블록 내에서 [`apiKey`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/api-key.html) 함수를 호출합니다.

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    apiKey {
        // API 키 인증 구성
    }
}
```

선택적으로 [지정된 라우트를 인증](#authenticate-route)하는 데 사용할 [프로바이더 이름](server-auth.md#provider-name)을 지정할 수 있습니다.

## API 키 인증 구성 {id="configure"}

이 섹션에서는 `apiKey` 인증 프로바이더의 구체적인 설정 방법을 살펴봅니다.

> Ktor에서 다양한 인증 프로바이더를 구성하는 방법은 [인증 구성](server-auth.md#configure)을 참조하세요.

### 1단계: API 키 프로바이더 구성 {id="configure-provider"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

`apiKey` 인증 프로바이더는 [`ApiKeyAuthenticationProvider.Config`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-api-key-authentication-provider/-config/index.html) 클래스를 통해 설정을 제공합니다. 아래 예제에서는 다음과 같은 설정이 지정되어 있습니다.

* `validate` 함수는 요청에서 추출된 API 키를 수신하여, 인증 성공 시 `Principal`을 반환하고 인증 실패 시 `null`을 반환합니다.

간단한 예시는 다음과 같습니다.

```kotlin
data class AppPrincipal(val key: String) : Principal

install(Authentication) {
    apiKey {
        validate { keyFromHeader ->
            val expectedApiKey = "this-is-expected-key"
            keyFromHeader
                .takeIf { it == expectedApiKey }
                ?.let { AppPrincipal(it) }
        }
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

<note>
    <p>
        타입 안전(Type-safe) 인증 스키마 API는 실험적(experimental) 기능입니다. 언제든지 제거되거나 변경될 수 있으며,
        옵트인(Opt-in)이 필요합니다. 자세한 내용은
        <a href="server-typed-auth.md#prerequisites">타입 안전 인증 문서</a>를 참조하세요.
    </p>
</note>

`apiKey()` 함수는 선택한 principal 타입에 대한 스키마를 생성합니다. 별도의 `install(Authentication)` 단계는 없으며, 스키마는 해당 인증이 필요한 라우트에 전달하는 값입니다.

```kotlin
data class AppPrincipal(val key: String)

val apiKeyAuth = apiKey<AppPrincipal>("api-key") {
    validate { keyFromHeader ->
        val expectedApiKey = "this-is-expected-key"
        keyFromHeader
            .takeIf { it == expectedApiKey }
            ?.let { AppPrincipal(it) }
    }
}
```

클래식 프로바이더와 달리 이름 지정이 필수입니다. 전체 API에 대한 내용은 [타입 안전 인증](server-typed-auth.md)을 참조하세요.

</TabItem>
</Tabs>

#### 키 위치 커스터마이징 {id="key-location"}

기본적으로 `apiKey` 프로바이더는 `X-API-Key` 헤더에서 API 키를 찾습니다.

`headerName`을 사용하여 커스텀 헤더를 지정할 수 있습니다.

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

```kotlin
apiKey("api-key-header") {
    headerName = "X-Secret-Key"
    validate { key ->
        // ...
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

```kotlin
val apiKeyAuth = apiKey<AppPrincipal>("api-key-header") {
    headerName = "X-Secret-Key"
    validate { key ->
        // ...
    }
}
```

</TabItem>
</Tabs>

### 2단계: API 키 검증 {id="validate"}

검증 로직은 애플리케이션의 요구사항에 따라 달라집니다. 일반적으로 사용되는 접근 방식은 다음과 같습니다.

#### 정적 키 비교 {id="static-key"}

단순한 경우, 사전 정의된 키와 비교할 수 있습니다.

```kotlin
apiKey {
    validate { keyFromHeader ->
        val expectedApiKey = 
            environment.config.property("api.key").getString()
        keyFromHeader
            .takeIf { it == expectedApiKey }
            ?.let { AppPrincipal(it) }
    }
}
```

> 민감한 API 키는 소스 코드가 아닌 설정 파일이나 환경 변수에 저장하세요.
>
{style="note"}

#### 데이터베이스 조회 {id="database-lookup"}

여러 API 키를 처리해야 하는 경우, 데이터베이스를 대상으로 검증할 수 있습니다.

```kotlin
apiKey {
    validate { keyFromHeader ->
        // 데이터베이스에서 키 조회
        val user = database.findUserByApiKey(keyFromHeader)
        user?.let { UserIdPrincipal(it.username) }
    }
}
```

#### 다중 검증 기준 {id="multiple-criteria"}

복잡한 검증 로직을 구현할 수도 있습니다.

```kotlin
apiKey {
    validate { keyFromHeader ->
        val apiKey = database.findApiKey(keyFromHeader)

        // 키가 존재하고 활성 상태이며 만료되지 않았는지 확인
        if (apiKey != null &&
            apiKey.isActive &&
            apiKey.expiresAt > Clock.System.now()
        ) {
            UserIdPrincipal(apiKey.userId)
        } else {
            null
        }
    }
}
```

### 3단계: 챌린지 구성 {id="challenge"}

인증이 실패했을 때 전송되는 응답은 `challenge` 함수를 사용하여 커스터마이징할 수 있습니다.

```kotlin
apiKey {
    validate { key ->
        // 검증 로직
    }
    challenge { defaultScheme, realm ->
        call.respond(
            HttpStatusCode.Unauthorized,
            "Invalid or missing API key"
        )
    }
}
```

### 4단계: 특정 리소스 보호 {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

`apiKey` 프로바이더를 구성한 후, [`authenticate`](server-auth.md#authenticate-route) 함수를 사용하여 애플리케이션의 특정 리소스를 보호할 수 있습니다. 인증에 성공한 경우, 라우트 핸들러 내부에서 `call.principal` 함수를 사용하여 인증된 principal을 가져올 수 있습니다.

```kotlin
routing {
    authenticate {
        get("/") {
            val principal = call.principal<AppPrincipal>()!!
            val key = principal.key
            call.respondText("Hello! Your key: $key")
        }
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

스키마를 `authenticateWith()`에 전달합니다. 블록 내부에서 `call.principal`은 사용자가 정의한 principal 타입이며 절대 `null`이 될 수 없으므로 `!!` 연산자가 필요하지 않습니다.

```kotlin
routing {
    authenticateWith(apiKeyAuth) {
        get("/") {
            val key = call.principal.key
            call.respondText("Hello! Your key: $key")
        }
    }
}
```

</TabItem>
</Tabs>

## API 키 인증 예제 {id="complete-example"}

다음은 API 키 인증에 대한 완전하고 간단한 예제입니다.

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

data class AppPrincipal(val key: String) : Principal

fun Application.module() {
    val expectedApiKey = "this-is-expected-key"

    install(Authentication) {
        apiKey {
            validate { keyFromHeader ->
                keyFromHeader
                    .takeIf { it == expectedApiKey }
                    ?.let { AppPrincipal(it) }
            }
        }
    }

    routing {
        authenticate {
            get("/") {
                val principal = call.principal<AppPrincipal>()!!
                call.respondText("Key: ${principal.key}")
            }
        }
    }
}
```

## 모범 사례 {id="best-practices"}

API 키 인증을 구현할 때는 다음과 같은 모범 사례를 고려하세요.

1. **HTTPS 사용**: 가로채기를 방지하기 위해 항상 HTTPS를 통해 API 키를 전송하세요.
2. **안전한 저장**: 소스 코드에 API 키를 하드코딩하지 마세요. 환경 변수나 안전한 구성 관리 도구를 사용하세요.
3. **키 로테이션**: 주기적으로 API 키를 교체(로테이션)할 수 있는 메커니즘을 구현하세요.
4. **속도 제한(Rate limiting)**: 남용을 방지하기 위해 API 키 인증과 속도 제한을 함께 사용하세요.
5. **로깅**: 보안 모니터링을 위해 인증 실패 내역은 로깅하되, 실제 API 키 값은 절대 로깅하지 마세요.
6. **키 포맷**: 암호학적으로 안전한 무작위 문자열을 API 키로 사용하세요 (예: UUID 또는 Base64로 인코딩된 난수 바이트).
7. **다중 키 지원**: 애플리케이션이나 용도별로 사용자당 여러 개의 API 키를 지원하는 방안을 고려하세요.
8. **만료 기한**: 보안 강화를 위해 키 만료 기능을 구현하세요.