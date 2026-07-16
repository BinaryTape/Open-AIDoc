[//]: # (title: 전달된 헤더 (Forwarded headers))

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-forwarded-header"/>
<var name="package_name" value="io.ktor.server.plugins.forwardedheaders"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="forwarded-header"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor는 Kotlin/Native를 지원하며 추가 런타임이나 가상 머신 없이 서버를 실행할 수 있게 해줍니다.">네이티브 서버</Links> 지원</b>: ✅
</p>
</tldr>

[ForwardedHeaders](https://api.ktor.io/ktor-server-forwarded-header/io.ktor.server.plugins.forwardedheaders/-forwarded-headers.html) 및 [XForwardedHeaders](https://api.ktor.io/ktor-server-forwarded-header/io.ktor.server.plugins.forwardedheaders/-x-forwarded-headers.html) 플러그인을 사용하면 Ktor 서버가 리버스 프록시(reverse proxy) 뒤에 배치되었을 때 원본 [요청(request)](server-requests.md)에 대한 정보를 얻기 위해 리버스 프록시 헤더를 처리할 수 있습니다. 이는 [로깅(logging)](server-logging.md) 목적으로 유용할 수 있습니다.

* `ForwardedHeaders`는 `Forwarded` 헤더([RFC 7239](https://tools.ietf.org/html/rfc7239))를 처리합니다.
* `XForwardedHeaders`는 다음과 같은 `X-Forwarded-` 헤더들을 처리합니다:
   - `X-Forwarded-Host`/`X-Forwarded-Server` 
   - `X-Forwarded-For` 
   - `X-Forwarded-By`
   - `X-Forwarded-Proto`/`X-Forwarded-Protocol`
   - `X-Forwarded-SSL`/`Front-End-Https`

> `Forwarded` 헤더 조작을 방지하려면, 애플리케이션이 리버스 프록시 연결만 허용하는 경우에만 이 플러그인들을 설치하세요.
> 
{type="note"}

## 의존성 추가 {id="add_dependencies"}
`ForwardedHeaders`/`XForwardedHeaders` 플러그인을 사용하려면 빌드 스크립트에 `%artifact_name%` 아티팩트를 포함해야 합니다:

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

## 플러그인 설치 {id="install_plugin"}

<Tabs>
<TabItem title="ForwardedHeader">

<var name="plugin_name" value="ForwardedHeaders"/>
<p>
    애플리케이션에 <code>%plugin_name%</code> 플러그인을 <a href="#install">설치</a>하려면,
    지정된 <Links href="/ktor/server-modules" summary="모듈을 사용하면 라우트를 그룹화하여 애플리케이션을 구성할 수 있습니다.">모듈</Links>에서 <code>install</code> 함수에 전달하세요.
    아래 코드 스니펫은 <code>%plugin_name%</code>을 설치하는 방법을 보여줍니다...
</p>
<list>
    <li>
        ... <code>embeddedServer</code> 함수 호출 내부에서 설치.
    </li>
    <li>
        ... <code>Application</code> 클래스의 확장 함수인 명시적으로 정의된 <code>module</code> 내부에서 설치.
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"></code-block>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"></code-block>
    </TabItem>
</Tabs>

</TabItem>

<TabItem title="XForwardedHeader">

<var name="plugin_name" value="XForwardedHeaders"/>
<p>
    애플리케이션에 <code>%plugin_name%</code> 플러그인을 <a href="#install">설치</a>하려면,
    지정된 <Links href="/ktor/server-modules" summary="모듈을 사용하면 라우트를 그룹화하여 애플리케이션을 구성할 수 있습니다.">모듈</Links>에서 <code>install</code> 함수에 전달하세요.
    아래 코드 스니펫은 <code>%plugin_name%</code>을 설치하는 방법을 보여줍니다...
</p>
<list>
    <li>
        ... <code>embeddedServer</code> 함수 호출 내부에서 설치.
    </li>
    <li>
        ... <code>Application</code> 클래스의 확장 함수인 명시적으로 정의된 <code>module</code> 내부에서 설치.
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"></code-block>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"></code-block>
    </TabItem>
</Tabs>

</TabItem>
</Tabs>

`ForwardedHeaders`/`XForwardedHeaders`를 설치한 후, [call.request.origin](#request_info) 속성을 사용하여 원본 요청에 대한 정보를 얻을 수 있습니다.

## 요청 정보 가져오기 {id="request_info"}

### 프록시 요청 정보 {id="proxy_request_info"}

프록시 요청에 대한 정보를 얻으려면 [라우트 핸들러(route handler)](server-routing.md#define_route) 내부에서 [call.request.local](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/local.html) 속성을 사용하세요.
아래 코드 스니펫은 프록시 주소와 요청이 전달된 호스트에 대한 정보를 얻는 방법을 보여줍니다:

```kotlin
get("/hello") {
    val remoteHost = call.request.local.remoteHost
    val serverHost = call.request.local.serverHost
}
```

### 원본 요청 정보 {id="original-request-information"}

원본 요청에 대한 정보를 읽으려면 [call.request.origin](https://api.ktor.io/ktor-server-core/io.ktor.server.plugins/origin.html) 속성을 사용하세요:

```kotlin
get("/hello") {
    val originRemoteHost = call.request.origin.remoteHost
    val originServerHost = call.request.origin.serverHost
}
```

아래 표는 `ForwardedHeaders`/`XForwardedHeaders` 설치 여부에 따라 `call.request.origin`에 의해 노출되는 다양한 속성들의 값을 보여줍니다.

![요청 다이어그램](forwarded-headers.png){width="706"}

| 속성 | ForwardedHeaders 없음 | ForwardedHeaders 포함 |
|------------------------|--------------------------|-----------------------|
| `origin.localHost`     | _web-server_             | _web-server_          |
| `origin.localPort`     | _8080_                   | _8080_                |
| `origin.serverHost`    | _web-server_             | _proxy_               |
| `origin.serverPort`    | _8080_                   | _80_                  |
| `origin.remoteHost`    | _proxy_                  | _client_              |
| `origin.remotePort`    | _32864_                  | _32864_               |

> 전체 예제는 여기에서 확인할 수 있습니다: [forwarded-header](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/forwarded-header).

## ForwardedHeaders 설정 {id="configure"}

요청이 여러 프록시를 거치는 경우 `ForwardedHeaders`/`XForwardedHeaders`를 설정해야 할 수도 있습니다.
이 경우, `X-Forwarded-For`는 각 연속된 프록시의 모든 IP 주소를 포함합니다. 예:

```HTTP
X-Forwarded-For: <client>, <proxy1>, <proxy2>
```

기본적으로 `XForwardedHeader`는 `X-Forward-For`의 첫 번째 항목을 `call.request.origin.remoteHost` 속성에 할당합니다.
[IP 주소 선택](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For#selecting_an_ip_address)을 위한 사용자 정의 로직을 제공할 수도 있습니다.
[XForwardedHeadersConfig](https://api.ktor.io/ktor-server-forwarded-header/io.ktor.server.plugins.forwardedheaders/-x-forwarded-headers-config/index.html)는 이를 위해 다음과 같은 API를 노출합니다:

- `useFirstProxy` 및 `useLastProxy`는 각각 IP 주소 목록에서 첫 번째 또는 마지막 값을 가져올 수 있게 합니다.
- `skipLastProxies`는 오른쪽부터 지정된 수의 항목을 건너뛰고 다음 항목을 가져옵니다.
   예를 들어, `proxiesCount` 매개변수가 `3`인 경우, 아래 헤더에 대해 `origin.remoteHost`는 `10.0.0.123`을 반환합니다:
   ```HTTP
   X-Forwarded-For: 10.0.0.123, proxy-1, proxy-2, proxy-3
   ```
- `skipKnownProxies`는 목록에서 지정된 항목들을 제거하고 마지막 항목을 가져옵니다.
   예를 들어, 이 함수에 `listOf("proxy-1", "proxy-3")`을 전달하면, 아래 헤더에 대해 `origin.remoteHost`는 `proxy-2`를 반환합니다:
   ```HTTP
   X-Forwarded-For: 10.0.0.123, proxy-1, proxy-2, proxy-3
   ```
- `extractEdgeProxy`를 사용하면 `X-Forward-*` 헤더에서 값을 추출하기 위한 사용자 정의 로직을 제공할 수 있습니다.