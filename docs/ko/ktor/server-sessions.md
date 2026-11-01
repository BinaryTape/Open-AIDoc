[//]: # (title: 세션)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Sessions"/>
<var name="package_name" value="io.ktor.server.sessions"/>
<var name="artifact_name" value="ktor-server-sessions"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.sessions"/>

<tldr>
<p>
<b>필수 종속성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<p><b>코드 예제</b>:
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-client">session-cookie-client</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-server">session-cookie-server</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-header-server">session-header-server</a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor는 Kotlin/Native를 지원하므로 추가 런타임이나 가상 머신 없이 서버를 실행할 수 있습니다.">네이티브 서버</Links> 지원</b>: ✅
</p>
</tldr>

<link-summary>
Sessions 플러그인은 서로 다른 HTTP 요청 간에 데이터를 유지할 수 있는 메커니즘을 제공합니다.
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/-sessions.html) 플러그인은 서로 다른 HTTP 요청 간에 데이터를 유지하는 메커니즘을 제공합니다. 로그인한 사용자의 ID나 장바구니 내용 저장, 또는 클라이언트에 사용자 환경설정을 유지하는 것 등이 대표적인 사용 사례입니다. Ktor에서는 쿠키나 사용자 정의 헤더를 사용하여 세션을 구현할 수 있으며, 세션 데이터를 서버에 저장할지 클라이언트로 전달할지 선택할 수 있고, 세션 데이터의 서명 및 암호화 등을 처리할 수 있습니다.

이 문서에서는 `%plugin_name%` 플러그인을 설치하고 설정하는 방법과 [라우트 핸들러](server-routing.md#define_route) 내에서 세션 데이터에 접근하는 방법을 살펴봅니다.

## 종속성 추가 {id="add_dependencies"}
세션 지원을 활성화하려면 빌드 스크립트에 `%artifact_name%` 아티팩트를 포함해야 합니다.

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

## Sessions 설치 {id="install_plugin"}

<p>
    애플리케이션에 <code>%plugin_name%</code> 플러그인을 <a href="server-plugins.md#install">설치</a>하려면,
    지정된 <Links href="server-modules.md" summary="모듈을 사용하면 라우트를 그룹화하여 애플리케이션을 구조화할 수 있습니다.">모듈</Links>의 <code>install</code> 함수에 전달합니다.
    다음 예제는 <code>%plugin_name%</code>을 설치하는 방법을 보여줍니다.
</p>
<list>
    <li>
        <code>embeddedServer()</code> 함수 호출 내부에서 설치.
    </li>
    <li>
        <code>Application</code> 클래스에 명시적으로 정의된 <code>module()</code> 확장 함수 내부에서 설치.
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"/>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"/>
    </TabItem>
</Tabs>
<p>
    <code>%plugin_name%</code> 플러그인은 <a href="server-plugins.md#install-route">특정 라우트에 설치</a>할 수도 있습니다.
    이는 애플리케이션 리소스마다 서로 다른 <code>%plugin_name%</code> 구성이 필요한 경우에 유용합니다.
</p>

## 세션 구성 개요 {id="configuration_overview"}
`%plugin_name%` 플러그인을 구성하려면 다음 단계를 수행해야 합니다.
1. *[데이터 클래스 생성](#data_class)*: 세션을 구성하기 전에 세션 데이터를 저장할 [데이터 클래스](https://kotlinlang.org/docs/data-classes.html)를 생성해야 합니다.
2. *[서버와 클라이언트 간의 데이터 전달 방식 선택](#cookie_header)*: 쿠키 또는 사용자 정의 헤더를 사용합니다. 쿠키는 일반 HTML 애플리케이션에 더 적합하며, 사용자 정의 헤더는 API용으로 사용됩니다.
3. *[세션 페이로드 저장 위치 선택](#client_server)*: 클라이언트 또는 서버에 저장합니다. 직렬화된 세션 데이터를 쿠키/헤더 값을 사용해 클라이언트로 전달하거나, 페이로드를 서버에 저장하고 세션 식별자만 전달할 수 있습니다.

   세션 페이로드를 서버에 저장하려는 경우, *[저장 방식 선택](#storages)*을 할 수 있습니다. 서버 메모리 또는 폴더에 저장할 수 있으며, 세션 데이터를 보관하기 위한 커스텀 스토리지를 직접 구현할 수도 있습니다.
4. *[세션 데이터 보호](#protect_session)*: 클라이언트로 전달되는 민감한 세션 데이터를 보호하려면 세션의 페이로드를 서명하고 암호화해야 합니다.

`%plugin_name%`을 구성한 후에는 [라우트 핸들러](server-routing.md#define_route) 내부에서 [세션 데이터를 가져오고 설정](#use_sessions)할 수 있습니다.

## 데이터 클래스 생성 {id="data_class"}

세션을 구성하기 전에 세션 데이터를 저장할 [데이터 클래스](https://kotlinlang.org/docs/data-classes.html)를 생성해야 합니다. 
예를 들어, 아래의 `UserSession` 클래스는 세션 ID와 페이지 조회 수를 저장하는 데 사용됩니다.

```kotlin
@Serializable
data class UserSession(val id: String, val count: Int)
```

여러 세션을 사용하려는 경우 여러 데이터 클래스를 생성해야 합니다.

## 세션 데이터 전달: 쿠키 vs 헤더 {id="cookie_header"}

### 쿠키 {id="cookie"}
쿠키를 사용하여 세션 데이터를 전달하려면 `install(Sessions)` 블록 내에서 지정된 이름과 데이터 클래스를 사용하여 `cookie` 함수를 호출합니다.
```kotlin
install(Sessions) {
    cookie<UserSession>("user_session")
}
```
위 예제에서는 `Set-Cookie` 헤더에 추가된 `user_session` 속성을 사용하여 세션 데이터가 클라이언트로 전달됩니다. `cookie` 블록 내에 전달하여 다른 쿠키 속성을 구성할 수 있습니다. 예를 들어, 아래 코드 스니펫은 쿠키의 경로와 만료 시간을 지정하는 방법을 보여줍니다.

```kotlin
install(Sessions) {
    cookie<UserSession>("user_session") {
        cookie.path = "/"
        cookie.maxAgeInSeconds = 10
    }
}
```

필요한 속성이 명시적으로 노출되어 있지 않은 경우 `extensions` 프로퍼티를 사용합니다. 예를 들어 다음과 같이 `SameSite` 속성을 전달할 수 있습니다.
```kotlin
install(Sessions) {
    cookie<UserSession>("user_session") {
        cookie.extensions["SameSite"] = "lax"
    }
}
```
사용 가능한 구성 설정에 대한 자세한 내용은 [CookieConfiguration](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/-cookie-configuration/index.html)을 참조하세요.

> 애플리케이션을 프로덕션 환경에 [배포](server-deployment.md)하기 전에 `secure` 프로퍼티가 `true`로 설정되어 있는지 확인하세요. 이렇게 하면 [보안 연결](server-ssl.md)을 통해서만 쿠키가 전송되도록 설정되어 HTTPS 다운그레이드 공격으로부터 세션 데이터를 보호할 수 있습니다.
>
{type="warning"}

### 헤더 {id="header"}
사용자 정의 헤더를 사용하여 세션 데이터를 전달하려면 `install(Sessions)` 블록 내에서 지정된 이름과 데이터 클래스를 사용하여 `header` 함수를 호출합니다.

```kotlin
install(Sessions) {
    header<CartSession>("cart_session")
}
```

위 예제에서는 `cart_session` 사용자 정의 헤더를 사용하여 세션 데이터가 클라이언트로 전달됩니다. 
클라이언트 측에서는 세션 데이터를 가져오기 위해 각 요청에 이 헤더를 추가해야 합니다.

> 교차 출처 요청(Cross-Origin Requests)을 처리하기 위해 [CORS](server-cors.md) 플러그인을 사용하는 경우, 다음과 같이 `CORS` 구성에 사용자 정의 헤더를 추가하세요.
> ```kotlin
> install(CORS) {
>     allowHeader("cart_session")
>     exposeHeader("cart_session")
> }
> ```

### 수정된 경우에만 세션 데이터 전송 {id="send_only_if_modified"}

기본적으로 Ktor는 세션 데이터가 변경되지 않았더라도 모든 응답에 세션 데이터를 전송합니다.

세션 데이터가 수정된 경우에만 전송하려면 세션 구성에서 `sendOnlyIfModified` 플래그를 활성화하세요.

```kotlin
install(Sessions) {
    cookie<MySession>("SESSION") {
        sendOnlyIfModified = true
    }
}
```

이 옵션은 [쿠키](#cookie) 및 [헤더 기반](#header) 세션 모두에서 사용할 수 있습니다.

## 세션 페이로드 저장: 클라이언트 vs 서버 {id="client_server"}

Ktor에서는 세션 데이터를 두 가지 방식으로 관리할 수 있습니다.
- _클라이언트와 서버 간에 세션 데이터 전달_.
   
  [쿠키 또는 헤더](#cookie_header) 함수에 세션 이름만 전달하면 세션 데이터가 클라이언트와 서버 간에 전달됩니다. 이 경우 클라이언트로 전달되는 민감한 세션 데이터를 보호하기 위해 세션의 페이로드를 [서명 및 암호화](#protect_session)해야 합니다.
- _서버에 세션 데이터를 저장하고 클라이언트와 서버 간에는 세션 ID만 전달_.
   
  이 경우 서버의 [어디에 페이로드를 저장할지](#storages) 선택할 수 있습니다. 예를 들어 메모리나 지정된 폴더에 세션 데이터를 저장하거나, 직접 커스텀 스토리지를 구현할 수 있습니다.

## 서버에 세션 페이로드 저장 {id="storages"}

Ktor를 사용하면 세션 데이터를 [서버에 저장](#client_server)하고 서버와 클라이언트 간에는 세션 ID만 전달할 수 있습니다. 이 경우 서버에서 페이로드를 보관할 위치를 선택할 수 있습니다.

### 인메모리 스토리지 {id="in_memory_storage"}
[SessionStorageMemory](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/-session-storage-memory/index.html)를 사용하면 세션 콘텐츠를 메모리에 저장할 수 있습니다. 이 스토리지는 서버가 실행되는 동안 데이터를 유지하며 서버가 중지되면 정보를 삭제합니다. 예를 들어 다음과 같이 서버 메모리에 쿠키를 저장할 수 있습니다.

```kotlin
cookie<CartSession>("cart_session", SessionStorageMemory()) {
}
```

전체 예제는 [session-cookie-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-server)에서 확인할 수 있습니다.

> `SessionStorageMemory`는 개발 용도로만 사용해야 합니다.

### 디렉터리 스토리지 {id="directory_storage"}

[directorySessionStorage](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/directory-session-storage.html)는 지정된 디렉터리 아래의 파일에 세션 데이터를 저장하는 데 사용할 수 있습니다. 예를 들어 `build/.sessions` 디렉터리 아래의 파일에 세션 데이터를 저장하려면 다음과 같이 `directorySessionStorage`를 생성합니다.
```kotlin
header<CartSession>("cart_session", directorySessionStorage(File("build/.sessions"))) {
}
```

전체 예제는 [session-header-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-header-server)에서 확인할 수 있습니다.

### 커스텀 스토리지 {id="custom_storage"}

Ktor는 커스텀 스토리지를 구현할 수 있도록 [SessionStorage](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/-session-storage/index.html) 인터페이스를 제공합니다.
```kotlin
interface SessionStorage {
    suspend fun invalidate(id: String)
    suspend fun write(id: String, value: String)
    suspend fun read(id: String): String
}
```
세 함수 모두 [중단(suspending)](https://kotlinlang.org/docs/composing-suspending-functions.html) 함수입니다. 구현 시 [SessionStorageMemory](https://github.com/ktorio/ktor/blob/main/ktor-server/ktor-server-plugins/ktor-server-sessions/common/src/io/ktor/server/sessions/SessionStorageMemory.kt)를 참고 자료로 활용할 수 있습니다.

## 세션 데이터 보호 {id="protect_session"}

### 세션 데이터 서명 {id="sign_session"}

세션 데이터에 서명하면 세션 콘텐츠가 수정되는 것을 방지할 수 있지만, 사용자가 해당 내용을 볼 수는 있습니다.
세션에 서명하려면 서명 키를 `SessionTransportTransformerMessageAuthentication` 생성자에 전달하고 이 인스턴스를 `transform` 함수에 전달합니다.

```kotlin
install(Sessions) {
    val secretSignKey = "6819b57a326945c1968f45236589".hexToByteArray()
    cookie<CartSession>("cart_session", SessionStorageMemory()) {
        cookie.path = "/"
        transform(SessionTransportTransformerMessageAuthentication(secretSignKey))
    }
}
```

`SessionTransportTransformerMessageAuthentication`은 기본 인증 알고리즘으로 `HmacSHA256`을 사용하며, 변경할 수 있습니다. 

### 세션 데이터 서명 및 암호화 {id="sign_encrypt_session"}

세션 데이터를 서명하고 암호화하면 세션 콘텐츠를 읽거나 수정하는 것을 방지할 수 있습니다.
세션을 서명하고 암호화하려면 서명/암호화 키를 `SessionTransportTransformerEncrypt` 생성자에 전달하고 이 인스턴스를 `transform` 함수에 전달합니다.

```kotlin
install(Sessions) {
    val secretEncryptKey = "00112233445566778899aabbccddeeff".hexToByteArray()
    val secretSignKey = "6819b57a326945c1968f45236589".hexToByteArray()
    cookie<UserSession>("user_session") {
        cookie.path = "/"
        cookie.maxAgeInSeconds = 10
        transform(SessionTransportTransformerEncrypt(secretEncryptKey, secretSignKey))
    }
}
```

> Ktor 버전 `3.0.0`에서 [암호화 방식이 업데이트되었습니다](migrating-3.md#session-encryption-method-update).
> 이전 버전에서 마이그레이션하는 경우, 기존 세션과의 호환성을 보장하기 위해
> `SessionTransportTransformerEncrypt` 생성자의 `backwardCompatibleRead` 프로퍼티를 사용하세요.
>
{style="note"}

기본적으로 `SessionTransportTransformerEncrypt`는 `AES` 및 `HmacSHA256` 알고리즘을 사용하며, 변경할 수 있습니다. 

> 서명/암호화 키는 코드에 직접 명시해서는 안 됩니다. [구성 파일](server-configuration-file.topic#configuration-file-overview)의 사용자 정의 그룹을 사용하여 서명/암호화 키를 저장하고, [환경 변수](server-configuration-file.topic#environment-variables)를 사용해 이를 초기화할 수 있습니다.
>
{type="warning"}

## 세션 콘텐츠 가져오기 및 설정 {id="use_sessions"}
특정 [라우트](server-routing.md)에 대한 세션 콘텐츠를 설정하려면 `call.sessions` 프로퍼티를 사용합니다. `set` 메서드를 사용해 새 세션 인스턴스를 생성할 수 있습니다.

```kotlin
get("/login") {
    call.sessions.set(UserSession(id = "123abc", count = 0))
    call.respondRedirect("/user")
}
```

세션 콘텐츠를 가져오려면 등록된 세션 타입 중 하나를 타입 매개변수로 전달하여 `get`을 호출합니다.

```kotlin
get("/user") {
    val userSession = call.sessions.get<UserSession>()
    if (userSession != null) {
}
```

세션을 수정하려면(예: 카운터 증가), 데이터 클래스의 `copy` 메서드를 호출해야 합니다.

```kotlin
get("/user") {
    val userSession = call.sessions.get<UserSession>()
    if (userSession != null) {
        call.sessions.set(userSession.copy(count = userSession.count + 1))
        call.respondText("Session ID is ${userSession.id}. Reload count is ${userSession.count}.")
    } else {
        call.respondText("Session doesn't exist or is expired.")
    }
}
```

어떤 이유로든 세션을 삭제해야 하는 경우(예: 사용자 로그아웃 시), `clear` 함수를 호출합니다.

```kotlin
get("/logout") {
    call.sessions.clear<UserSession>()
    call.respondRedirect("/user")
}
```

전체 예제는 [session-cookie-client](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-client)에서 확인할 수 있습니다.

## 지연 세션 조회 {id="deferred_session_retrieval"}

기본적으로 Ktor는 해당 라우트에서 실제로 세션이 필요한지 여부와 관계없이, 세션이 포함된 모든 요청에 대해 스토리지에서 세션을 읽으려고 시도합니다. 이러한 동작은 특히 커스텀 세션 스토리지를 사용하는 애플리케이션에서 불필요한 오버헤드를 발생시킬 수 있습니다.

`io.ktor.server.sessions.deferred` 시스템 속성을 활성화하여 세션 로드를 지연시킬 수 있습니다.

```kotlin
System.setProperty("io.ktor.server.sessions.deferred", "true")
```

## 예제 {id="examples"}

아래의 실행 가능한 예제들은 `%plugin_name%` 플러그인을 사용하는 방법을 보여줍니다.

- [session-cookie-client](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-client): [쿠키](#cookie)를 사용하여 [서명 및 암호화된](#sign_encrypt_session) 세션 페이로드를 [클라이언트](#client_server)로 전달하는 방법을 보여줍니다.
- [session-cookie-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-server): 세션 페이로드를 [서버 메모리](#in_memory_storage)에 보관하고 [쿠키](#cookie)를 사용하여 [서명된](#sign_session) 세션 ID를 클라이언트로 전달하는 방법을 보여줍니다.
- [session-header-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-header-server): 서버의 [디렉터리 스토리지](#directory_storage)에 세션 페이로드를 보관하고 [사용자 정의 헤더](#header)를 사용하여 [서명된](#sign_session) 세션 ID를 클라이언트로 전달하는 방법을 보여줍니다.