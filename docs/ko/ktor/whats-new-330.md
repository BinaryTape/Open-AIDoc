[//]: # (title: Ktor 3.3.0의 새로운 기능)

<show-structure for="chapter,procedure" depth="2"/>

_[출시일: 2025년 9월 11일](releases.md#release-details)_

Ktor 3.3.0은 서버, 클라이언트 및 툴링 전반에 걸쳐 새로운 기능을 제공합니다. 이번 기능 릴리스의 주요 내용은 다음과 같습니다.

* [정적 리소스를 위한 커스텀 폴백(fallback) 메커니즘](#custom-fallback)
* [OpenAPI 사양(specification) 생성](#openapi-spec-gen)
* [HTTP/2 클리어텍스트(h2c) 지원](#http2-h2c-support)
* [실험적 WebRTC 클라이언트](#webrtc-client)

## Ktor Server {id="ktor-server"}

### 정적 리소스를 위한 커스텀 폴백 {id="custom-fallback"}

Ktor 3.3.0은 정적 콘텐츠를 위한 새로운 `fallback()` 함수를 도입하여, 요청된 리소스를 찾을 수 없을 때의 커스텀 동작을 정의할 수 있게 합니다.

항상 동일한 폴백 파일을 제공하는 `default()`와 달리, `fallback()`은 원래 요청된 경로와 현재의 `ApplicationCall`에 접근할 수 있게 해줍니다. 이를 사용하여 리다이렉트하거나, 커스텀 상태 코드를 반환하거나, 동적으로 다른 파일을 제공할 수 있습니다.

커스텀 폴백 동작을 정의하려면 `staticFiles()`, `staticResources()`, `staticZip()` 또는 `staticFileSystem()` 내에서 `fallback()` 함수를 사용하세요.

```kotlin
staticFiles("/files", File("textFiles")) {
    fallback { requestedPath, call ->
        when {
            requestedPath.endsWith(".php") -> call.respondRedirect("/static/index.html") // 절대 경로
            requestedPath.endsWith(".kt") -> call.respondRedirect("Default.kt") // 상대 경로
            requestedPath.endsWith(".xml") -> call.respond(HttpStatusCode.Gone)
            else -> call.respondFile(File("files/index.html"))
        }
    }
}
```

### 정적 콘텐츠를 위한 LastModified 및 Etag 헤더 {id="lastmodified-and-etag-headers-for-static-content"}

Ktor 3.3.0은 정적 리소스에 대한 `ETag` 및 `LastModified` 헤더 지원을 도입했습니다. [`ConditionalHeaders`](server-conditional-headers.md) 플러그인이 설치되어 있으면, 조건부 헤더를 처리하여 마지막 요청 이후 콘텐츠가 변경되지 않은 경우 본문 전송을 피할 수 있습니다.

```kotlin
staticFiles("/filesWithEtagAndLastModified", File("files")) {
    etag { resource -> EntityTagVersion("etag") }
    lastModified { resource -> GMTDate() }
}
```

값은 각 리소스를 기반으로 동적으로 계산되어 응답에 적용됩니다.

또한 미리 정의된 프로바이더를 사용할 수도 있습니다. 예를 들어, 리소스 콘텐츠의 SHA-256 해시를 사용하여 강력한(strong) `ETag`를 생성할 수 있습니다.

```kotlin
staticFiles("/filesWithStrongGeneratedEtag", File("files")) {
    etag(ETagProvider.StrongSha256)
}
```

### 개발 모드 자동 리로드(auto-reload) 제한 사항 {id="development-mode-auto-reload-limitations"}

Ktor 3.2.0에서 도입된 [중단 모듈 함수(suspend module functions) 지원](whats-new-320.md#suspendable-module-functions)으로 인해, 블로킹(blocking) 모듈 참조를 사용하는 애플리케이션에서 자동 리로드가 작동하지 않는 회귀(regression) 문제가 발생했습니다.

이 문제는 3.3.0에서도 유지되며, 자동 리로드는 계속해서 `suspend` 함수 모듈 및 설정 참조에서만 작동합니다.

지원되는 모듈 선언 예시는 다음과 같습니다.

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

향후 릴리스에서 블로킹 함수 참조에 대한 지원을 복구할 계획입니다. 그때까지는 `development` 모드에서 `suspend` 모듈 또는 설정 참조를 사용하는 것을 권장합니다.

### HTTP/2 클리어텍스트(h2c) 지원 {id="http2-h2c-support"}

Ktor 3.3.0은 Netty 엔진에 대해 HTTP/2 클리어텍스트(h2c) 지원을 도입하여, TLS 암호화 없이 HTTP/2 통신이 가능해집니다. 이 설정은 일반적으로 로컬 테스트나 프라이빗 네트워크와 같이 신뢰할 수 있는 환경에서 사용됩니다.

h2c를 활성화하려면 엔진 설정에서 `enableH2c` 플래그를 true로 설정하세요. 자세한 내용은 [TLS 없는 HTTP/2](server-http2.md#http2-without-tls)를 참조하세요.

## Ktor Client {id="ktor-client"}

### SSE 응답 바디 버퍼 {id="sse-response-body-buffer"}

지금까지는 SSE 오류 발생 후 `response.bodyAsText()`를 호출하려고 하면 이중 소비(double-consume) 문제로 인해 실패했습니다.

Ktor 3.3.0은 디버깅 및 에러 처리를 위해 이미 처리된 SSE 데이터를 캡처할 수 있는 설정 가능한 진단 버퍼를 도입했습니다.

[SSE 플러그인](client-server-sent-events.topic)을 설치할 때 버퍼를 전역적으로 설정할 수 있습니다.

```kotlin
install(SSE) {
    bufferPolicy = SSEBufferPolicy.LastEvents(10)
}
```

또는 호출별로 설정할 수도 있습니다.

```kotlin
client.sse(url, { bufferPolicy(SSEBufferPolicy.All) }) {
    // …
}
```

SSE 스트림이 소비됨에 따라, 클라이언트는 (네트워크에서 다시 읽지 않고) 처리된 데이터의 스냅샷을 메모리 내 버퍼에 유지합니다. 오류가 발생하면 로깅 또는 진단을 위해 안전하게 `response?.bodyAsText()`를 호출할 수 있습니다.

자세한 내용은 [응답 버퍼링](client-server-sent-events.topic#response-buffering)을 참조하세요.

### WebRTC 클라이언트 {id="webrtc-client"}

이번 릴리스에서는 멀티플랫폼 프로젝트에서의 피어 투 피어(peer-to-peer) 실시간 통신을 위한 실험적 WebRTC 클라이언트 지원을 도입했습니다.

WebRTC를 사용하면 화상 통화, 멀티플레이어 게임 및 협업 도구와 같은 애플리케이션을 구현할 수 있습니다. 이번 릴리스를 통해 이제 통합된 Kotlin API를 사용하여 JavaScript/Wasm 및 Android 타겟에서 피어 연결을 설정하고 데이터 채널을 교환할 수 있습니다. iOS, JVM 데스크톱 및 Native와 같은 추가 타겟은 향후 릴리스에서 지원될 예정입니다.

`HttpClient`와 유사하게 플랫폼에 맞는 엔진을 선택하고 설정을 제공하여 `WebRtcClient`를 생성할 수 있습니다.

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
    context = appContext // 필수: Android 컨텍스트 제공
    defaultConnectionConfig = {
        iceServers = listOf(WebRtc.IceServer("stun:stun.l.google.com:19302"))
    }
}
```

</TabItem>

<TabItem title="iOS" group-key="ios">

```kotlin
val iosClient = WebRtcClient(IosWebRtc) {
    // 동일한 설정, 추가 컨텍스트 불필요
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

생성된 클라이언트는 ICE(Interactive Connectivity Establishment)를 사용하여 피어 투 피어 연결을 설정할 수 있습니다. 협상이 완료되면 피어들은 데이터 채널을 열고 메시지를 교환할 수 있습니다.

```kotlin
val connection = client.createPeerConnection()

// 원격 ICE candidate 추가 (사용자의 시그널링 채널을 통해 수신됨)
connection.addIceCandidate(WebRtc.IceCandidate(candidateString, sdpMid, sdpMLineIndex))

// 모든 로컬 candidate가 수집될 때까지 대기
connection.awaitIceGatheringComplete()

// 들어오는 데이터 채널 이벤트 리스닝
connection.dataChannelEvents.collect { event ->
   when (event) {
     is Open -> println("Another peer opened a chanel: ${event.channel}")
     is Closed -> println("Data channel is closed")
     is Closing, is BufferedAmountLow, is Error -> println(event)
   }
}

// 채널을 생성하고 메시지 송수신
val channel = connection.createDataChannel("chat")
channel.send("hello")
val answer = channel.receiveText()
```

사용법 및 제한 사항에 대한 자세한 내용은 [WebRTC 클라이언트](client-webrtc.md) 문서를 참조하세요.

### OkHttp 버전 업데이트 {id="updated-okhttp-version"}

Ktor 3.3.0에서 Ktor 클라이언트의 `OkHttp` 엔진이 OkHttp 5.1.0(기존 4.12.0)을 사용하도록 업그레이드되었습니다. 이 메이저 버전 업데이트는 OkHttp와 직접 상호작용하는 프로젝트에 API 변경 사항을 발생시킬 수 있습니다. 이러한 프로젝트는 호환성을 확인해야 합니다.

### 통합된 OkHttp SSE 세션 {id="unified-okhttp-sse-session"}

OkHttp 엔진은 이제 이전에 도입된 `OkHttpSSESession` 대신 Server-Sent Events(SSE)용 표준 API를 사용합니다. 이 변경은 모든 클라이언트 엔진에서 SSE 처리를 통일하고 OkHttp 전용 구현의 제한 사항을 해결합니다.

## Gradle 플러그인 {id="gradle-plugin"}

### OpenAPI 사양 생성 {id="openapi-spec-gen"}
<primary-label ref="experimental"/>

Ktor 3.3.0은 Gradle 플러그인 및 컴파일러 플러그인을 통해 실험적인 OpenAPI 생성 기능을 도입했습니다. 이를 통해 빌드 시점에 애플리케이션 코드에서 직접 OpenAPI 사양을 생성할 수 있습니다.

이 기능은 다음과 같은 역량을 제공합니다.
- Ktor 경로 정의를 분석하고 중첩된 경로, 로컬 확장 및 리소스 경로를 병합합니다.
- 선행하는 KDoc 어노테이션을 파싱하여 다음을 포함한 OpenAPI 메타데이터를 제공합니다.
    - 경로, 쿼리, 헤더, 쿠키 및 바디 파라미터
    - 응답 코드 및 타입
    - 보안, 설명, 지원 중단(deprecation) 및 외부 문서 링크
- `call.receive()` 및 `call.respond()`에서 요청 및 응답 바디를 유추합니다.

#### OpenAPI 사양 생성하기 {id="generate-the-openapi-specification"}

Ktor 경로와 KDoc 어노테이션에서 OpenAPI 사양 파일을 생성하려면 다음 명령을 사용하세요.

```shell
./gradlew buildOpenApi
```

#### 사양 제공하기 {id="serve-the-specification"}

생성된 사양을 런타임에 사용할 수 있게 하려면, [OpenAPI](server-openapi.md) 또는 [SwaggerUI](server-swagger-ui.md) 플러그인을 사용할 수 있습니다.

다음 예시는 생성된 사양 파일을 OpenAPI 엔드포인트에서 제공합니다.

```kotlin
routing {
    openAPI("/docs", swaggerFile = "openapi/generated.json")
}
```

이 기능에 대한 자세한 내용은 [OpenAPI 사양 생성](openapi-spec-generation.md)을 참조하세요.

## Shared {id="shared"}

### Jetty 버전 업데이트 {id="updated-jetty-version"}

Jetty 서버 및 클라이언트 엔진이 Jetty 12를 사용하도록 업그레이드되었습니다. 대부분의 애플리케이션에서 이 업그레이드는 완전히 하위 호환되지만, 클라이언트 및 서버 코드는 이제 내부적으로 업데이트된 Jetty API를 활용합니다.

프로젝트에서 Jetty API를 직접 사용하는 경우 파괴적 변경(breaking changes)이 있을 수 있음을 유의하세요. 자세한 내용은 [공식 Jetty 마이그레이션 가이드](https://jetty.org/docs/jetty/12.1/programming-guide/migration/11-to-12.html)를 참조하세요.