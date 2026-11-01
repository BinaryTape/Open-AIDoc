[//]: # (title: Ktor 3.3.0의 새로운 기능)

<show-structure for="chapter,procedure" depth="2"/>

_[릴리스 날짜: 2025년 9월 11일](releases.md#release-details)_

Ktor 3.3.0은 서버, 클라이언트 및 툴링 전반에 걸쳐 새로운 기능을 제공합니다. 이번 기능 릴리스의 주요 하이라이트는 다음과 같습니다.

* [정적 리소스를 위한 커스텀 fallback 메커니즘](#custom-fallback)
* [OpenAPI 사양 생성](#openapi-spec-gen)
* [HTTP/2 cleartext (h2c) 지원](#http2-h2c-support)
* [실험적 WebRTC 클라이언트](#webrtc-client)

## Ktor Server {id="ktor-server"}

### 정적 리소스를 위한 커스텀 fallback {id="custom-fallback"}

Ktor 3.3.0에서는 정적 콘텐츠를 위한 새로운 `fallback()` 함수가 도입되어, 요청된 리소스를 찾을 수 없을 때의 커스텀 동작을 정의할 수 있습니다.

항상 동일한 대체 파일을 제공하는 `default()`와 달리, `fallback()`을 사용하면 원래 요청된 경로와 현재의 `ApplicationCall`에 접근할 수 있습니다. 이를 통해 리디렉션하거나, 커스텀 상태 코드를 반환하거나, 서로 다른 파일을 동적으로 제공할 수 있습니다.

커스텀 대체 동작을 정의하려면 `staticFiles()`, `staticResources()`, `staticZip()` 또는 `staticFileSystem()` 내에서 `fallback()` 함수를 사용하세요.

```kotlin
staticFiles("/files", File("textFiles")) {
    fallback { requestedPath, call ->
        when {
            requestedPath.endsWith(".php") -> call.respondRedirect("/static/index.html") // absolute path
            requestedPath.endsWith(".kt") -> call.respondRedirect("Default.kt") // relative path
            requestedPath.endsWith(".xml") -> call.respond(HttpStatusCode.Gone)
            else -> call.respondFile(File("files/index.html"))
        }
    }
}
```

### 정적 콘텐츠를 위한 LastModified 및 Etag 헤더 {id="lastmodified-and-etag-headers-for-static-content"}

Ktor 3.3.0에서는 정적 리소스에 대한 `ETag` 및 `LastModified` 헤더 지원이 도입되었습니다. [`ConditionalHeaders`](server-conditional-headers.md) 플러그인이 설치되어 있으면, 조건부 헤더를 처리하여 지난 요청 이후 콘텐츠가 변경되지 않은 경우 본문 전송을 건너뛸 수 있습니다.

```kotlin
staticFiles("/filesWithEtagAndLastModified", File("files")) {
    etag { resource -> EntityTagVersion("etag") }
    lastModified { resource -> GMTDate() }
}
```

이 값들은 각 리소스를 기반으로 동적으로 계산되어 응답에 적용됩니다.

또한 리소스 콘텐츠의 SHA-256 해시를 사용하여 강력한(strong) `ETag`를 생성하는 등 사전 정의된 프로바이더를 사용할 수도 있습니다.

```kotlin
staticFiles("/filesWithStrongGeneratedEtag", File("files")) {
    etag(ETagProvider.StrongSha256)
}
```

### 개발 모드 자동 리로드 제한 사항 {id="development-mode-auto-reload-limitations"}

Ktor 3.2.0에서 도입된 [suspend 모듈 함수 지원](whats-new-320.md#suspendable-module-functions)으로 인해 블로킹 모듈 참조를 사용하는 애플리케이션에서 자동 리로드(auto-reload)가 작동하지 않는 회귀(regression) 문제가 발생했습니다.

이 문제는 3.3.0에서도 유지되며, 자동 리로드는 계속해서 `suspend` 함수 모듈 및 설정 참조에서만 동작합니다.

지원되는 모듈 선언의 예는 다음과 같습니다.

```kotlin
// 지원됨 — suspend 함수 참조
embeddedServer(Netty, port = 8080, module = Application::mySuspendModule)

// 지원됨 — 설정 참조 (application.conf / application.yaml)
ktor {
    application {
        modules = [ com.example.ApplicationKt.mySuspendModule ]
    }
}
```

향후 릴리스에서 블로킹 함수 참조에 대한 지원을 복원할 계획입니다. 그때까지는 `development` 모드에서 `suspend` 모듈 또는 설정 참조를 사용하는 것을 권장합니다.

### HTTP/2 cleartext (h2c) 지원 {id="http2-h2c-support"}

Ktor 3.3.0은 Netty 엔진에 대해 HTTP/2 cleartext (h2c) 지원을 도입하여, TLS 암호화 없이도 HTTP/2 통신을 사용할 수 있도록 합니다.
이 구성은 주로 로컬 테스트나 프라이빗 네트워크와 같은 신뢰할 수 있는 환경에서 사용됩니다.

h2c를 활성화하려면 엔진 구성에서 `enableH2c` 플래그를 true로 설정하세요.
자세한 내용은 [TLS 없는 HTTP/2](server-http2.md#http2-without-tls)를 참조하세요.

## Ktor Client {id="ktor-client"}

### SSE 응답 본문 버퍼 {id="sse-response-body-buffer"}

지금까지는 SSE 오류 발생 후 `response.bodyAsText()` 호출을 시도하면 이중 소비(double-consume) 문제로 인해 실패했습니다.

Ktor 3.3.0에는 디버깅 및 에러 처리를 위해 이미 처리된 SSE 데이터를 캡처할 수 있는 구성 가능한 진단 버퍼가 도입되었습니다.

[SSE 플러그인](client-server-sent-events.topic)을 설치할 때 버퍼를 전역적으로 구성할 수 있습니다.

```kotlin
install(SSE) {
    bufferPolicy = SSEBufferPolicy.LastEvents(10)
}
```

또는 호출 단위로 구성할 수도 있습니다.

```kotlin
client.sse(url, { bufferPolicy(SSEBufferPolicy.All) }) {
    // …
}
```

SSE 스트림이 소비됨에 따라 클라이언트는 네트워크에서 다시 읽지 않고 인메모리 버퍼에 처리된 데이터의 스냅샷을 유지합니다. 오류가 발생하면 로깅이나 진단을 위해 안전하게 `response?.bodyAsText()`를 호출할 수 있습니다.

자세한 내용은 [응답 버퍼링](client-server-sent-events.topic#response-buffering)을 참조하세요.

### WebRTC 클라이언트 {id="webrtc-client"}

이번 릴리스에서는 멀티플랫폼 프로젝트에서 P2P(peer-to-peer) 실시간 통신을 지원하는 실험적 WebRTC 클라이언트가 도입되었습니다.

WebRTC를 사용하면 영상 통화, 멀티플레이어 게임, 협업 툴 등의 애플리케이션을 구현할 수 있습니다. 이번 릴리스부터 통일된 Kotlin API를 사용하여 JavaScript/Wasm 및 Android 타깃 간에 피어 연결을 설정하고 데이터 채널을 교환할 수 있습니다. iOS, JVM 데스크톱 및 Native와 같은 추가 타깃은 향후 릴리스에서 지원될 예정입니다.

`HttpClient`와 유사하게 플랫폼에 맞는 엔진을 선택하고 설정을 제공하여 `WebRtcClient`를 생성할 수 있습니다.

<Tabs group="platform" id="create-webrtc-client">
<TabItem title="JS/Wasm" group-key="js-wasm">

```kotlin
val jsClient = WebRtcClient(JsWebRtc) {
    defaultConnectionConfig = {
        iceServers = listOf(WebRtc.IceServer("stun:stun.l.google.com:19302"))
    }
}
```

</TabItem>
<TabItem title="Android" group-key="android">

```kotlin
val androidClient = WebRtcClient(AndroidWebRtc) {
    context = appContext // 필수: Android context 제공 필요
    defaultConnectionConfig = {
        iceServers = listOf(WebRtc.IceServer("stun:stun.l.google.com:19302"))
    }
}
```

</TabItem>

<TabItem title="iOS" group-key="ios">

```kotlin
val iosClient = WebRtcClient(IosWebRtc) {
    // 동일한 구성, 추가 context 불필요
}
```

</TabItem>

<TabItem title="JVM" group-key="jvm">

```kotlin
val jvmClient = WebRtcClient(JvmWebRtc) {
    defaultConnectionConfig = {
        iceServers = listOf(WebRtc.IceServer("stun:stun.l.google.com:19302"))
    }
}
```

</TabItem>
</Tabs>

생성된 클라이언트는 ICE(Interactive Connectivity Establishment)를 사용하여 피어 간 연결을 설정할 수 있습니다. 협상이 완료되면 피어끼리 데이터 채널을 열고 메시지를 교환할 수 있습니다.

```kotlin
val connection = client.createPeerConnection()

// 원격 ICE candidate 추가 (시그널링 채널을 통해 수신)
connection.addIceCandidate(WebRtc.IceCandidate(candidateString, sdpMid, sdpMLineIndex))

// 모든 로컬 candidate가 수집될 때까지 대기
connection.awaitIceGatheringComplete()

// 수신되는 데이터 채널 이벤트 리스닝
connection.dataChannelEvents.collect { event ->
   when (event) {
     is Open -> println("Another peer opened a chanel: ${event.channel}")
     is Closed -> println("Data channel is closed")
     is Closing, is BufferedAmountLow, is Error -> println(event)
   }
}

// 채널 생성 및 메시지 송수신
val channel = connection.createDataChannel("chat")
channel.send("hello")
val answer = channel.receiveText()
```

사용법 및 제한 사항에 대한 자세한 내용은 [WebRTC 클라이언트](client-webrtc.md) 문서를 참조하세요.

### OkHttp 버전 업데이트 {id="updated-okhttp-version"}

Ktor 3.3.0에서는 Ktor 클라이언트의 `OkHttp` 엔진이 OkHttp 5.1.0(기존 4.12.0)으로 업그레이드되었습니다. 이 메이저 버전 업데이트로 인해 OkHttp와 직접 상호작용하는 프로젝트에는 API 변경 사항이 발생할 수 있습니다. 해당 프로젝트에서는 호환성을 확인하시기 바랍니다.

### OkHttp SSE 세션 일원화 {id="unified-okhttp-sse-session"}

OkHttp 엔진이 이제 이전에 도입되었던 `OkHttpSSESession` 대신 Server-Sent Events (SSE) 표준 API를 사용합니다.
이 변경으로 모든 클라이언트 엔진에서 SSE 처리가 일원화되었으며, OkHttp 전용 구현의 제한 사항이 해결되었습니다.

## Gradle 플러그인 {id="gradle-plugin"}

### OpenAPI 사양 생성 {id="openapi-spec-gen"}
<primary-label ref="experimental"/>

Ktor 3.3.0에는 Gradle 플러그인 및 컴파일러 플러그인을 통한 실험적 OpenAPI 생성 기능이 도입되었습니다. 이를 통해 빌드 시점에 애플리케이션 코드로부터 직접 OpenAPI 사양을 생성할 수 있습니다.

다음과 같은 기능을 제공합니다.
- Ktor 라우트 정의를 분석하고 중첩된 라우트, 로컬 확장 및 리소스 경로 병합
- 선행하는 KDoc 어노테이션을 파싱하여 다음과 같은 OpenAPI 메타데이터 제공:
    - Path, query, header, cookie 및 body 파라미터
    - 응답 코드 및 타입
    - 보안, 설명, 지원 중단(deprecation) 및 외부 문서 링크
- `call.receive()` 및 `call.respond()`로부터 요청 및 응답 본문 추론

#### OpenAPI 사양 생성하기 {id="generate-the-openapi-specification"}

Ktor 라우트와 KDoc 어노테이션으로부터 OpenAPI 사양 파일을 생성하려면 다음 명령어를 사용하세요.

```shell
./gradlew buildOpenApi
```

#### 사양 제공하기 {id="serve-the-specification"}

생성된 사양을 런타임에 제공하기 위해 [OpenAPI](server-openapi.md) 또는 [SwaggerUI](server-swagger-ui.md) 플러그인을 사용할 수 있습니다.

다음 예제는 생성된 사양 파일을 OpenAPI 엔드포인트에서 제공합니다.

```kotlin
routing {
    openAPI("/docs", swaggerFile = "openapi/generated.json")
}
```

이 기능에 대한 자세한 내용은 [OpenAPI 사양 생성](openapi-spec-generation.md)을 참조하세요.

## 공통 (Shared) {id="shared"}

### Jetty 버전 업데이트 {id="updated-jetty-version"}

Jetty 서버 및 클라이언트 엔진이 Jetty 12를 사용하도록 업그레이드되었습니다. 대부분의 애플리케이션에서 이번 업그레이드는 하위 호환성이 완전히 유지되지만, 클라이언트 및 서버 코드는 이제 내부적으로 업데이트된 Jetty API를 활용합니다.

프로젝트에서 Jetty API를 직접 사용하는 경우 브레이킹 체인지(breaking changes)가 있을 수 있으니 유의하시기 바랍니다. 자세한 내용은 [공식 Jetty 마이그레이션 가이드](https://jetty.org/docs/jetty/12.1/programming-guide/migration/11-to-12.html)를 참조하세요.