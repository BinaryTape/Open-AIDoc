[//]: # (title: WebRTC 用戶端)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-client-webrtc"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.webrtc"/>
<tldr>
    <p>
        <b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
    </p>
    <p>
        <b>支援的平台</b>：JS/Wasm, Android, iOS, JVM
    </p>   
    <p>
        <b>程式碼範例</b>：<a href="https://github.com/ktorio/ktor-chat/">ktor-chat</a>
    </p>
</tldr>
<link-summary>
    WebRTC 用戶端可在多平台專案中實現即時點對點通訊。
</link-summary>

Web 即時通訊 (Web Real-Time Communication, WebRTC) 是一套用於瀏覽器和原生應用程式中進行即時點對點 (peer-to-peer) 通訊的標準與 API。

Ktor 中的 WebRTC 用戶端可在多平台專案中實現即時點對點通訊。透過 WebRTC，你可以建置如下功能：

* 視訊與語音通話
* 多人遊戲
* 協作應用程式，例如白板與編輯器
* 用戶端之間的低延遲資料交換

## 新增相依性 {id="add-dependencies"}

若要使用 `WebRtcClient`，你需要在建置指令碼中包含 `%artifact_name%` 構件：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 建立用戶端 {id="create-a-client"}

建立 `WebRtcClient` 時，請根據你的目標平台選擇引擎：

* JS/Wasm：`JsWebRtc` 使用瀏覽器的 [WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API) 和 [Media Capture and Streams](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API) API。
* Android：`AndroidWebRtc` 使用預先編譯的 [Stream WebRTC library for Android](https://github.com/GetStream/webrtc-android) 與 Android 媒體 API。
* iOS：`IosWebRtc` 使用 [WebRTC SDK](https://github.com/webrtc-sdk) 和原生的 [AVFoundation](https://developer.apple.com/documentation/avfoundation) 架構。
* JVM：`JvmWebRtc` 使用 [webrtc-java](https://github.com/devopvoid/webrtc-java) 提供的原生 WebRTC 繫結。

接著你可以提供類似於 `HttpClient` 的平台專屬配置。STUN/TURN 伺服器是讓 [ICE](#ice) 正確運作的必備條件。你可以使用現有的解決方案，例如 [coturn](https://github.com/coturn/coturn)：

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
    context = appContext // 必需：提供 Android context
    defaultConnectionConfig = {
        iceServers = listOf(WebRtc.IceServer("stun:stun.l.google.com:19302"))
    }
}
```

</TabItem>

<TabItem title="iOS" group-key="ios">

```kotlin
val iosClient = WebRtcClient(IosWebRtc) {
    // 相同的配置，無需額外的 context
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

## 建立連線並協商 SDP {id="create-a-connection-and-negotiate-sdp"}

建立 `WebRtcClient` 之後，下一步是建立對等連線 (peer connection)。
對等連線是管理兩個用戶端之間即時通訊的核心物件。

為了建立連線，WebRTC 使用會談描述協定 (Session Description Protocol, SDP)。這包含三個步驟：

1. 其中一個對等端（呼叫方）建立 offer。
2. 另一個對等端（被叫方）回應 answer。
3. 雙方套用彼此的描述以完成設定。

```kotlin
// 呼叫方建立連線與 offer
val caller = jsClient.createPeerConnection()
val offer = caller.createOffer()
caller.setLocalDescription(offer)
// 透過你的信令機制將 offer.sdp 發送給遠端對等端

// 被叫方接收 offer 並建立 answer
val callee = jsClient.createPeerConnection()
callee.setRemoteDescription(
    WebRtc.SessionDescription(WebRtc.SessionDescriptionType.OFFER, remoteOfferSdp)
)
val answer = callee.createAnswer()
callee.setLocalDescription(answer)
// 透過信令將 answer.sdp 發送回呼叫方

// 呼叫方套用 answer
caller.setRemoteDescription(
    WebRtc.SessionDescription(WebRtc.SessionDescriptionType.ANSWER, remoteAnswerSdp)
)
```

## 交換 ICE 候選位址 {id="ice"}

SDP 協商完成後，對等端仍需要探索如何跨網路建立連線。[互動式連線建立 (Interactive Connectivity Establishment, ICE)](https://en.wikipedia.org/wiki/Interactive_Connectivity_Establishment) 讓對等端能夠找到通往彼此的網路路徑。

* 每個對等端收集自己的 ICE 候選位址。
* 這些候選位址必須透過你選擇的信令通道發送給另一個對等端。
* 當雙方都新增了彼此的候選位址後，連線便能成功建立。

```kotlin
// 收集並發送本機候選位址
scope.launch {
    caller.iceCandidates.collect { candidate ->
        // 將 candidate.candidate、candidate.sdpMid、candidate.sdpMLineIndex 發送至遠端對等端
    }
}

// 接收並新增遠端候選位址
callee.addIceCandidate(WebRtc.IceCandidate(candidateString, sdpMid, sdpMLineIndex))

// （可選）等待所有候選位址收集完畢
callee.awaitIceGatheringComplete()
```

> Ktor 不提供信令機制。請使用 WebSockets、HTTP 或其他傳輸方式來交換 offer、answer 和 ICE 候選位址。
> 
{style="note"}

## 使用資料通道 {id="use-a-data-channel"}

WebRTC 支援資料通道 (data channel)，允許對等端交換任意訊息。這在聊天、多人遊戲、協作工具或任何用戶端之間的低延遲通訊中非常有用。

### 建立通道 {id="creating-a-channel"}

要在其中一端建立通道，請使用 `.createDataChannel()` 方法：

```kotlin
val channel = caller.createDataChannel("chat")
```

接著你可以在另一端監聽資料通道事件：

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

`DataChannelEvent` 可以表示以下事件：

* `Open`：通道已準備好發送和接收資料。
* `Closing`：通道已開始關閉。
* `Closed`：通道已關閉。
* `BufferedAmountLow`：緩衝的傳出資料量已降至或低於 `bufferedAmountLowThreshold`。
* `Error`：通道發生錯誤。此事件不會在 JVM 上發出。發送失敗時會改為擲出 `WebRtc.IOException`。

若要接收 `BufferedAmountLow` 事件，請在通道上設定閾值：

```kotlin
channel.setBufferedAmountLowThreshold(16 * 1024)
```

### 發送與接收訊息 {id="sending-and-receiving-messages"}

通道使用 Kotlin 開發者熟悉的類似 `Channel` 的 API：

```kotlin
// 發送訊息
scope.launch { channel.send("hello") }

// 接收訊息
scope.launch { println("received: " + channel.receiveText()) }
```

## 新增與觀察媒體軌 {id="add-and-observe-media-tracks"}

除了資料通道之外，WebRTC 還支援用於音訊和視訊的媒體軌 (media track)。這讓你可以建置視訊通話或螢幕分享等應用程式。

### 建立本機媒體軌 {id="creating-local-tracks"}

你可以向本機裝置（麥克風、相機）請求音訊或視訊軌：

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

媒體擷取依平台而異：

* 在 Web 上，使用 `navigator.mediaDevices.getUserMedia`。
* 在 Android 上，使用 Camera2 API。你需要分開請求相機和麥克風權限。
* 在 iOS 上，使用 AVFoundation API。你也需要分開請求所需的權限。
* 在 JVM 上，使用 [webrtc-java](https://github.com/devopvoid/webrtc-java) 存取系統相機和麥克風。作業系統可能會提示使用者授予權限。

用戶端會根據指定的條件約束選取最合適的媒體裝置。若無合適的裝置可用，則會擲出 `WebRtcMedia.DeviceException`。

> `WebRtcClient`、`WebRtcPeerConnection`、`WebRtcMedia.Track` 以及其他介面均實作了 `AutoCloseable`。當你不再需要它們時，請呼叫 `close()` 函式以釋放資源。
> 
{style="note"}

### 接收遠端媒體軌 {id="receiving-remote-tracks"}

你也可以監聽遠端媒體軌：

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

## 平台專屬邏輯 {id="platform-specific-logic"}

此 API 提供了高階抽象，但某些使用案例可能需要存取平台專屬的 API。你可以使用 `.getNative()` 擴充函式來取得底層實作。除了 iOS 上的 `WebRTC-SDK` CocoaPod 之外，平台專屬程式庫均以可傳遞程式庫的形式公開。

<Tabs group="platform" id="platform-specific-logic-tabs">
<TabItem title="JS/Wasm" group-key="js-wasm">

```kotlin
// DOM API 是從 `kotlin-wrappers` 匯入

val videoTrack = rtcClient.createVideoTrack()
val jsStream = MediaStream().apply {
    val nativeTrack: MediaStreamTrack = videoTrack.getNative()
    addTrack(nativeTrack)
}

// 開始渲染視訊
val videoElement = document.createElement("video") as HTMLVideoElement
videoElement.srcObject = jsStream
videoElement.autoplay = true

// 停止渲染視訊
videoElement.srcObject = null
```

</TabItem>
<TabItem title="Android" group-key="android">

```kotlin
val eglBase = org.webrtc.EglBase.create() // 在應用程式中應為唯一

val videoTrack = rtcClient.createVideoTrack()
val nativeTrack: org.webrtc.VideoTrack = videoTrack.getNative()

// 建立用於渲染傳入視訊影格的 surface
val renderer = org.webrtc.SurfaceViewRenderer()
renderer.init(eglBase.eglBaseContext, null)

// 開始渲染視訊
videoTrack.addSink(renderer)

// 停止渲染視訊
videoTrack.removeSink(renderer)
renderer.release()
```

</TabItem>

<TabItem title="iOS" group-key="ios">

```kotlin
val videoTrack = rtcClient.createVideoTrack()
val nativeTrack: RTCVideoTrack = videoTrack.getNative()

// 建立用於渲染傳入視訊影格的 surface
val videoView = RTCMTLVideoView() // iOS UIKit View

// 開始渲染視訊
nativeTrack.addRenderer(videoView)

// 停止渲染視訊
nativeTrack.removeRenderer(videoView)
```

若要使用 `WebRTC-SDK` API，你需要手動安裝：

```kotlin
// build.gradle.kts
kotlin {
    cocoapods {
        pod("WebRTC-SDK") {
            version = "137.7151.04" // 或更新版本
            // 預設模組名稱為 `WebRTC-SDK`，你可以根據需要進行變更
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

// 沒有內建的視訊檢視。請附加一個 sink，並使用 Swing、JavaFX、Compose 或其他 UI 工具包來渲染影格。
nativeTrack.addSink { frame ->
    // 將 frame.buffer 繪製到你的 UI，然後執行 frame.release()
}
```

</TabItem>
</Tabs>

```kotlin
// 在 Android、iOS 和 JVM 上，無需使用 `getNative()` 即可開始/停止播放音訊軌
// 在瀏覽器中，你仍應建立一個 <audio/> 元素。

val audio = rtcClient.createAudioTrack()
// 開始播放音訊
audio.enable(true)
// 停止播放音訊
audio.enable(false)
```

> 這些程式碼片段可搭配 Compose Multiplatform 使用，但未考慮其生命週期。如需完整整合範例，請參閱 [Ktor Chat](https://github.com/ktorio/ktor-chat)。
> 
{style="note"}

## 限制 {id="limitations"}

WebRTC 用戶端目前為實驗功能，具有以下限制：

* **信令 (Signaling)：** 不包含信令功能。你需要自行實作，例如使用 WebSockets 或 HTTP。
* **平台支援：** 用戶端支援 JavaScript/Wasm、Android、iOS 以及 JVM 桌面端。Kotlin/Native 支援預計於未來版本推出。
* **權限：** 必須由你的應用程式自行處理權限。瀏覽器會提示使用者授予麥克風與相機存取權。Android 和 iOS 需要執行時期權限請求。在 JVM 上，相機與麥克風存取權是在作業系統層級授予。
* **JVM 限制：** 不支援候選位址預先擷取 (candidate prefetching)。`iceCandidatePoolSize` 必須為 `0` 或省略。不支援 `facingMode`、`aspectRatio` 和 `resizeMode` 視訊約束，若設定將擲出例外狀況。不會發出 `DataChannelEvent.Error`。
* **媒體功能：** 僅支援基本的音訊與視訊軌。螢幕分享、裝置選擇、聯播 (simulcast) 以及進階 RTP 功能尚未提供。
* **連線統計資訊：** 雖提供統計資訊，但在各平台間存在差異，且未遵循統一架構。