[//]: # (title: CORS)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-cors"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.cors"/>
<var name="package_name" value="io.ktor.server.plugins.cors"/>
<var name="plugin_name" value="CORS"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="cors"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor는 Kotlin/Native를 지원하며 추가 런타임이나 가상 머신 없이 서버를 실행할 수 있도록 합니다.">네이티브 서버</Links> 지원</b>: ✅
</p>
</tldr>

서버에서 [교차 출처 요청(cross-origin requests)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)을 처리해야 하는 경우,
Ktor의 [CORS](https://api.ktor.io/ktor-server-cors/io.ktor.server.plugins.cors.routing/-c-o-r-s.html)
플러그인을 설치하고 구성해야 합니다. 이 플러그인을 통해 허용할 호스트, HTTP 메서드, 클라이언트에서 설정한 헤더 등을 구성할 수 있습니다.

## 의존성 추가 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code>을(를) 사용하려면 빌드 스크립트에 <code>%artifact_name%</code> 아티팩트를 추가하세요:
</p>
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

## %plugin_name% 설치 {id="install_plugin"}

<p>
    애플리케이션에 <code>%plugin_name%</code> 플러그인을 <a href="server-plugins.md#install">설치</a>하려면,
    지정된 <Links href="server-modules.md" summary="모듈을 사용하면 라우트를 그룹화하여 애플리케이션을 구조화할 수 있습니다.">모듈</Links>의 <code>install</code> 함수에 전달하세요.
    다음 예제는 <code>%plugin_name%</code>을(를) 설치하는 방법을 보여줍니다:
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
    이는 애플리케이션 리소스마다 서로 다른 <code>%plugin_name%</code> 구성이 필요한 경우 유용할 수 있습니다.
</p>

> `CORS` 플러그인을 특정 라우트에 설치하는 경우, 해당 라우트에 `options` [핸들러](server-routing.md#define_route)를 추가해야 합니다.
그래야 Ktor가 CORS 프리플라이트(preflight) 요청에 올바르게 응답할 수 있습니다.

## CORS 구성 {id="configure"}

CORS 관련 구성 설정은 [CORSConfig](https://api.ktor.io/ktor-server-cors/io.ktor.server.plugins.cors/-c-o-r-s-config/index.html) 클래스를 통해 제공됩니다.
이러한 설정을 구성하는 방법을 살펴보겠습니다.

### 개요 {id="overview"}

`8080` 포트에서 수신 대기 중인 서버가 있고, `/customer` [라우트](server-routing.md)가 [JSON](server-serialization.md#send_data) 데이터로 응답한다고 가정해 보겠습니다.
아래 코드 스니펫은 교차 출처 요청을 발생시키기 위해 다른 포트에서 실행 중인 클라이언트에서 Fetch API를 사용하여 보낸 샘플 요청을 보여줍니다:

```javascript
function saveCustomer() {
    fetch('http://0.0.0.0:8080/customer',
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({id: 3, firstName: "Jet", lastName: "Brains"})
        })
        .then(response => response.text())
        .then(data => {
            console.log('Success:', data);
            alert(data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

```
{initial-collapse-state="collapsed" collapsed-title="
fetch('http://0.0.0.0:8080/customer')"}

백엔드 측에서 이러한 요청을 허용하려면 다음과 같이 `CORS` 플러그인을 구성해야 합니다:

```kotlin
install(CORS) {
    allowHost("0.0.0.0:8081")
    allowHeader(HttpHeaders.ContentType)
}
```

전체 예제는 여기에서 확인할 수 있습니다: [cors](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/cors).

### 호스트 {id="hosts"}

교차 출처 요청을 보낼 수 있는 허용 호스트를 지정하려면 `allowHost` 함수를 사용합니다. 호스트 이름 외에도 포트 번호, 서브도메인 목록 또는 지원되는 HTTP 스키마를 지정할 수 있습니다.

```kotlin
install(CORS) {
    allowHost("client-host")
    allowHost("client-host:8081")
    allowHost("client-host", subDomains = listOf("en", "de", "es"))
    allowHost("client-host", schemes = listOf("http", "https"))
}
```

모든 호스트의 교차 출처 요청을 허용하려면 `anyHost` 함수를 사용합니다.

```kotlin
install(CORS) {
    anyHost()
}
```

### HTTP 메서드 {id="methods"}

기본적으로 `%plugin_name%` 플러그인은 `GET`, `POST`, `HEAD` HTTP 메서드를 허용합니다. 추가 메서드를 추가하려면 `allowMethod` 함수를 사용합니다.

```kotlin
install(CORS) {
    allowMethod(HttpMethod.Options)
    allowMethod(HttpMethod.Put)
    allowMethod(HttpMethod.Patch)
    allowMethod(HttpMethod.Delete)
}
```

### 허용 헤더 {id="headers"}

기본적으로 `%plugin_name%` 플러그인은 `Access-Control-Allow-Headers`로 관리되는 다음 클라이언트 헤더를 허용합니다:

* `Accept`
* `Accept-Language`
* `Content-Language`

추가 헤더를 허용하려면 `allowHeader` 함수를 사용합니다.

```kotlin
install(CORS) {
    allowHeader(HttpHeaders.ContentType)
    allowHeader(HttpHeaders.Authorization)
}
```

커스텀 헤더를 허용하려면 `allowHeaders` 또는 `allowHeadersPrefixed` 함수를 사용합니다. 예를 들어 아래의 코드 스니펫은 `custom-`으로 시작하는 헤더를 허용하는 방법을 보여줍니다.

```kotlin
install(CORS) {
    allowHeadersPrefixed("custom-")
}
```

> 단순하지 않은 콘텐츠 유형(non-simple content types)의 경우 `allowHeaders` 또는 `allowHeadersPrefixed`를 사용할 때
[allowNonSimpleContentTypes](https://api.ktor.io/ktor-server-cors/io.ktor.server.plugins.cors/-c-o-r-s-config/allow-non-simple-content-types.html)
속성을 `true`로 설정해야 합니다.

### 노출 헤더 {id="expose-headers"}

`Access-Control-Expose-Headers` 헤더는 브라우저의 JavaScript가 접근할 수 있도록 지정된 헤더를 허용 목록(allowlist)에 추가합니다.
이러한 헤더를 구성하려면 `exposeHeader` 함수를 사용합니다.

```kotlin
install(CORS) {
    // ...
    exposeHeader("X-My-Custom-Header")
    exposeHeader("X-Another-Custom-Header")
}
```

### 자격 증명 {id="credentials"}

기본적으로 브라우저는 교차 출처 요청 시 자격 증명 정보(쿠키 또는 인증 정보 등)를 전송하지 않습니다. 이러한 정보 전달을 허용하려면 `allowCredentials` 속성을 사용하여 `Access-Control-Allow-Credentials` 응답 헤더를 `true`로 설정합니다.

```kotlin
install(CORS) {
    allowCredentials = true
}
```

### 기타 설정 {id="misc"}

`%plugin_name%` 플러그인을 사용하면 기타 CORS 관련 설정도 지정할 수 있습니다. 예를 들어 `maxAgeInSeconds`를 사용하여 추가 프리플라이트 요청을 전송하지 않고 프리플라이트 요청에 대한 응답을 캐시할 수 있는 기간을 지정할 수 있습니다.

```kotlin
install(CORS) {
    maxAgeInSeconds = 3600
}
```

다른 구성 옵션에 대한 자세한 내용은 [CORSConfig](https://api.ktor.io/ktor-server-cors/io.ktor.server.plugins.cors/-c-o-r-s-config/index.html)에서 확인할 수 있습니다.