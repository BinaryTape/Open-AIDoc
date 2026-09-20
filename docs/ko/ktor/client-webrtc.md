[//]: # (title: WebRTC 클라이언트)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-client-webrtc"/>
<tldr>
    <p>
        <b>필수 종속 항목</b>: <code>io.ktor:%artifact_name%</code>
    </p>
    <p>
        <b>지원 플랫폼</b>: JS/Wasm, Android, iOS, JVM
    </p>   
    <p>
        <b>코드 예제</b>: <a href="https://github.com/ktorio/ktor-chat/">ktor-chat</a>
    </p>
</tldr>
<link-summary>
    WebRTC 클라이언트는 멀티플랫폼 프로젝트에서 실시간 피어 투 피어(peer-to-peer) 통신을 가능하게 합니다.
</link-summary>

WebRTC(Web Real-Time Communication)는 브라우저와 네이티브 앱에서 실시간 피어 투 피어(P2P) 통신을 위한 표준 및 API 모음입니다.

Ktor의 WebRTC 클라이언트는 멀티플랫폼 프로젝트에서 실시간 피어 투 피어 통신을 가능하게 합니다. WebRTC를 사용하면 다음과 같은 기능을 구축할 수 있습니다.

* 화상 및 음성 통화
* 멀티플레이어 게임
* 협업 애플리케이션 (화이트보드, 에디터 등)
* 클라이언트 간 저지연(Low-latency) 데이터 교환

## 종속 항목 추가 {id="add-dependencies"}

`WebRtcClient`를 사용하려면 빌드 스크립트에 `%artifact_name%` 아티팩트를 포함해야 합니다.

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

## 클라이언트 생성 {id="create-a-client"}

`WebRtcClient`를 생성할 때 대상 플랫폼에 맞는 엔진을 선택하세요.

* JS/Wasm: `JsWebRtc` – [WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API), [Media Capture and Streams](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API) 브라우저 API를 사용합니다.
* Android: `AndroidWebRtc` – Android용 사전 컴파일된 [Stream WebRTC 라이브러리](https://github.com/GetStream/webrtc-android)와 Android 미디어 API를 사용합니다.
* iOS: `IosWebRtc` – [WebRTC SDK](https://github.com/webrtc-sdk)와 네이티브 [AVFoundation](https://developer.apple.com/documentation/avfoundation) 프레임워크를 사용합니다.
* JVM: `JvmWebRtc` – [webrtc-java](https://github.com/devopvoid/webrtc-java)에서 제공하는 네이티브 WebRTC 바인딩을 사용합니다.

그 후 `HttpClient`와 유사하게 플랫폼별 구성을 제공할 수 있습니다. [ICE](#ice)가 올바르게 작동하려면 STUN/TURN 서버가 필요합니다. [coturn](https://github.com/coturn/coturn)과 같은 기존 솔루션을 사용할 수 있습니다.

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
    // 동일한 구성, 추가 컨텍스트 불필요
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

## 연결 생성 및 SDP 협상 {id="create-a-connection-and-negotiate-sdp"}

`WebRtcClient`를 생성한 후 다음 단계는 피어 연결(peer connection)을 생성하는 것입니다.
피어 연결은 두 클라이언트 간의 실시간 통신을 관리하는 핵심 객체입니다.

연결을 설정하기 위해 WebRTC는 SDP(Session Description Protocol)를 사용합니다. 여기에는 세 가지 단계가 포함됩니다.

1. 한쪽 피어(호출자, caller)가 제안(offer)을 생성합니다.
2. 다른 쪽 피어(수신자, callee)가 응답(answer)으로 대응합니다.
3. 양쪽 피어가 서로의 설명을 적용하여 설정을 완료합니다.

```kotlin
// 호출자가 연결과 제안을 생성함
val caller = jsClient.createPeerConnection()
val offer = caller.createOffer()
caller.setLocalDescription(offer)
// 시그널링 메커니즘을 통해 원격 피어에게 offer.sdp를 전송함

// 수신자가 제안을 받고 응답을 생성함
val callee = jsClient.createPeerConnection()
callee.setRemoteDescription(
    WebRtc.SessionDescription(WebRtc.SessionDescriptionType.OFFER, remoteOfferSdp)
)
val answer = callee.createAnswer()
callee.setLocalDescription(answer)
// 시그널링을 통해 호출자에게 answer.sdp를 다시 보냄

// 호출자가 응답을 적용함
caller.setRemoteDescription(
    WebRtc.SessionDescription(WebRtc.SessionDescriptionType.ANSWER, remoteAnswerSdp)
)
```

## ICE 후보 교환 {id="ice"}

SDP 협상이 완료되면 피어들은 여전히 네트워크를 통해 연결하는 방법을 찾아야 합니다. [ICE(Interactive Connectivity Establishment)](https://en.wikipedia.org/wiki/Interactive_Connectivity_Establishment)를 통해 피어들은 서로에게 도달하는 네트워크 경로를 찾을 수 있습니다.

* 각 피어는 자신의 ICE 후보(ICE candidates)를 수집합니다.
* 이러한 후보들은 선택한 시그널링 채널을 통해 상대 피어에게 전송되어야 합니다.
* 양쪽 피어가 서로의 후보를 추가하면 연결이 성공할 수 있습니다.

```kotlin
// 로컬 후보 수집 및 전송
scope.launch {
    caller.iceCandidates.collect { candidate ->
        // candidate.candidate, candidate.sdpMid, candidate.sdpMLineIndex를 원격 피어에게 전송
    }
}

// 원격 후보 수신 및 추가
callee.addIceCandidate(WebRtc.IceCandidate(candidateString, sdpMid, sdpMLineIndex))

// 선택 사항: 모든 후보가 수집될 때까지 대기
callee.awaitIceGatheringComplete()
```

> Ktor는 시그널링(signaling)을 제공하지 않습니다. WebSockets, HTTP 또는 다른 전송 방식을 사용하여 제안(offer), 응답(answer) 및 ICE 후보를 교환하세요.
> 
{style="note"}

## 데이터 채널 사용 {id="use-a-data-channel"}

WebRTC는 피어 간에 임의의 메시지를 교환할 수 있는 데이터 채널을 지원합니다. 이는 채팅, 멀티플레이어 게임, 협업 도구 또는 클라이언트 간의 모든 저지연 메시징에 유용합니다.

### 채널 생성 {id="creating-a-channel"}

한쪽에서 채널을 생성하려면 `.createDataChannel()` 메서드를 사용합니다.

```kotlin
val channel = caller.createDataChannel("chat")
```

그런 다음 다른 쪽에서 데이터 채널 이벤트를 수신할 수 있습니다.

```kotlin
scope.launch {
    callee.dataChannelEvents.collect { event ->
        when (event) {
            is DataChannelEvent.Open -> println("Channel opened: ${event.channel}")
            is DataChannelEvent.Closing -> println("Channel closing: ${event.channel}")
            is DataChannelEvent.Closed -> println("Channel closed: ${event.channel}")
            is DataChannelEvent.BufferedAmountLow ->
                println("Buffered amount is low: ${event.channel}")
            is DataChannelEvent.Error ->
                println("Channel error: ${event.reason}")
        }
    }
}
```

`DataChannelEvent`는 다음과 같은 이벤트를 나타낼 수 있습니다.

* `Open`: 채널이 데이터를 송수신할 준비가 되었습니다.
* `Closing`: 채널이 닫히기 시작했습니다.
* `Closed`: 채널이 닫혔습니다.
* `BufferedAmountLow`: 버퍼링된 발신 데이터의 양이 `bufferedAmountLowThreshold` 이하로 떨어졌습니다.
* `Error`: 채널에 오류가 발생했습니다. 이 이벤트는 JVM에서는 발생하지 않습니다. 대신 전송 실패 시 `WebRtc.IOException`이 발생합니다.

`BufferedAmountLow`를 수신하려면 채널에 임계값을 설정하세요.

```kotlin
channel.setBufferedAmountLowThreshold(16 * 1024)
```

### 메시지 송수신 {id="sending-and-receiving-messages"}

채널은 Kotlin 개발자에게 익숙한 `Channel`과 유사한 API를 사용합니다.

```kotlin
// 메시지 전송
scope.launch { channel.send("hello") }

// 메시지 수신
scope.launch { println("received: " + channel.receiveText()) }
```

## 미디어 트랙 추가 및 관찰 {id="add-and-observe-media-tracks"}

데이터 채널 외에도 WebRTC는 오디오 및 비디오를 위한 미디어 트랙을 지원합니다. 이를 통해 영상 통화나 화면 공유와 같은 애플리케이션을 구축할 수 있습니다.

### 로컬 트랙 생성 {id="creating-local-tracks"}

로컬 장치(마이크, 카메라)에서 오디오 또는 비디오 트랙을 요청할 수 있습니다.

```kotlin
val audio = rtcClient.createAudioTrack {
    echoCancellation = true
}
val video = rtcClient.createVideoTrack {
    width = 1280
    height = 720
}

val pc = jsClient.createPeerConnection()
pc.addTrack(audio)
pc.addTrack(video)
```

미디어 캡처는 플랫폼에 따라 다릅니다.

* 웹에서는 `navigator.mediaDevices.getUserMedia`를 사용합니다.
* Android에서는 Camera2 API를 사용합니다. 카메라 및 마이크 권한을 별도로 요청해야 합니다.
* iOS에서는 AVFoundation API를 사용합니다. 마찬가지로 필요한 권한을 별도로 요청해야 합니다.
* JVM에서는 [webrtc-java](https://github.com/devopvoid/webrtc-java)를 사용하여 시스템 카메라 및 마이크에 액세스합니다. 운영 체제에서 사용자에게 권한을 요청할 수 있습니다.

클라이언트는 지정된 제약 조건(constraints)에 따라 가장 적합한 미디어 장치를 선택합니다. 적합한 장치를 사용할 수 없는 경우 `WebRtcMedia.DeviceException`을 발생시킵니다.

> `WebRtcClient`, `WebRtcPeerConnection`, `WebRtcMedia.Track` 및 기타 인터페이스는 `AutoCloseable`을 구현합니다.
> 더 이상 필요하지 않을 때 리소스를 해제하려면 `close()` 함수를 호출하세요.
> 
{style="note"}

### 원격 트랙 수신 {id="receiving-remote-tracks"}

원격 미디어 트랙을 수신할 수도 있습니다.

```kotlin
scope.launch {
    pc.trackEvents.collect { event ->
        when (event) {
            is TrackEvent.Add -> println("Remote track added: ${event.track.id}")
            is TrackEvent.Remove -> println("Remote track removed: ${event.track.id}")
        }
    }
}
```

## 플랫폼별 로직 {id="platform-specific-logic"}

이 API는 고수준의 추상화를 제공하지만, 플랫폼 전용 API에 액세스해야 하는 사용 사례가 있을 수 있습니다.
`.getNative()` 확장 함수를 사용하여 기본 구현을 가져올 수 있습니다.
플랫폼별 라이브러리는 iOS의 `WebRTC-SDK` CocoaPod을 제외하고 전이적 라이브러리(transitive libraries)로 노출됩니다.

<Tabs group="platform" id="platform-specific-logic-tabs">
<TabItem title="JS/Wasm" group-key="js-wasm">

```kotlin
// DOM API는 `kotlin-wrappers`에서 가져옵니다.

val videoTrack = rtcClient.createVideoTrack()
val jsStream = MediaStream().apply {
    val nativeTrack: MediaStreamTrack = videoTrack.getNative()
    addTrack(nativeTrack)
}

// 비디오 렌더링 시작
val videoElement = document.createElement("video") as HTMLVideoElement
videoElement.srcObject = jsStream
videoElement.autoplay = true

// 비디오 렌더링 중지
videoElement.srcObject = null
```

</TabItem>
<TabItem title="Android" group-key="android">

```kotlin
val eglBase = org.webrtc.EglBase.create() // 앱 내에서 고유해야 함

val videoTrack = rtcClient.createVideoTrack()
val nativeTrack: org.webrtc.VideoTrack = videoTrack.getNative()

// 들어오는 비디오 프레임을 렌더링할 서피스 생성
val renderer = org.webrtc.SurfaceViewRenderer()
renderer.init(eglBase.eglBaseContext, null)

// 비디오 렌더링 시작
videoTrack.addSink(renderer)

// 비디오 렌더링 중지
videoTrack.removeSink(renderer)
renderer.release()
```

</TabItem>

<TabItem title="iOS" group-key="ios">

```kotlin
val videoTrack = rtcClient.createVideoTrack()
val nativeTrack: RTCVideoTrack = videoTrack.getNative()

// 들어오는 비디오 프레임을 렌더링할 서피스 생성
val videoView = RTCMTLVideoView() // iOS UIKit 뷰

// 비디오 렌더링 시작
nativeTrack.addRenderer(videoView)

// 비디오 렌더링 중지
nativeTrack.removeRenderer(videoView)
```

`WebRTC-SDK` API를 사용하려면 수동으로 설치해야 합니다.

```kotlin
// build.gradle.kts
kotlin {
    cocoapods {
        pod("WebRTC-SDK") {
            version = "137.7151.04" // 또는 최신 버전
            // 기본 모듈 이름은 `WebRTC-SDK`이며, 편의를 위해 변경할 수 있습니다.
            moduleName = "WebRTC"
            packageName = "WebRTC"
        }
    }
}
```

</TabItem>

<TabItem title="JVM" group-key="jvm">

```kotlin
val videoTrack = rtcClient.createVideoTrack()
val nativeTrack: dev.onvoid.webrtc.media.video.VideoTrack = videoTrack.getNative()

// 내장 비디오 뷰가 없습니다. 싱크(sink)를 연결하고 Swing, JavaFX, Compose
// 또는 다른 UI 툴킷으로 프레임을 렌더링하세요.
nativeTrack.addSink { frame ->
    // frame.buffer를 UI에 그린 다음 frame.release()를 호출합니다.
}
```

</TabItem>
</Tabs>

```kotlin
// Android, iOS 및 JVM에서는 `getNative()`를 사용하지 않고도 오디오 트랙 재생을 시작/중지할 수 있습니다.
// 브라우저에서는 여전히 정의되지 않은 엘리먼트를 생성해야 합니다.

val audio = rtcClient.createAudioTrack()
// 오디오 재생 시작
audio.enable(true)
// 오디오 재생 중지
audio.enable(false)
```

> 이 스니펫들은 Compose Multiplatform과 함께 사용할 수 있지만, 해당 생명주기(lifecycle)를 고려하지는 않습니다. 완전한 통합을 위해서는 [Ktor Chat](https://github.com/ktorio/ktor-chat) 예제를 참조하세요.
> 
{style="note"}

## 제한 사항 {id="limitations"}

WebRTC 클라이언트는 실험적이며 다음과 같은 제한 사항이 있습니다.

* **시그널링:** 시그널링이 포함되어 있지 않습니다. WebSockets나 HTTP 등을 사용하여 별도로 구현해야 합니다.
* **플랫폼 지원:** 이 클라이언트는 JavaScript/Wasm, Android, iOS 및 JVM 데스크톱을 지원합니다. Kotlin/Native 지원은 향후 릴리스에서 계획되어 있습니다.
* **권한:** 권한 처리는 애플리케이션에서 직접 수행해야 합니다. 브라우저는 사용자에게 마이크 및 카메라 액세스를 요청합니다. Android 및 iOS는 런타임 권한 요청이 필요합니다. JVM에서는 운영 체제 수준에서 카메라 및 마이크 액세스 권한이 부여됩니다.
* **JVM 제한 사항:** 후보 프리페칭(Candidate prefetching)은 지원되지 않습니다. `iceCandidatePoolSize`는 `0`이거나 생략되어야 합니다. `facingMode`, `aspectRatio` 및 `resizeMode` 비디오 제약 조건은 지원되지 않으며 설정 시 예외를 발생시킵니다. `DataChannelEvent.Error`는 발생하지 않습니다.
* **미디어 기능:** 기본적인 오디오 및 비디오 트랙만 지원됩니다. 화면 공유, 장치 선택, 시뮬캐스트(simulcast) 및 고급 RTP 기능은 아직 제공되지 않습니다.
* **연결 통계:** 연결 통계를 사용할 수 있지만 플랫폼마다 다르며 통합된 스키마를 따르지 않습니다.