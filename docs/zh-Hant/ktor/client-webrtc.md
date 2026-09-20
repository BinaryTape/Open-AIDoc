[//]: # (title: WebRTC 用戶端)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-client-webrtc"/>
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

Web 即時通訊（WebRTC）是一套用於瀏覽器和原生應用程式中進行即時點對點通訊的標準與 API。

Ktor 中的 WebRTC 用戶端可在多平台專案中實現即時點對點通訊。透過 WebRTC，您可以建立如下功能：

* 影片與語音通話
* 多人遊戲
* 協作應用程式，例如白板與編輯器
* 用戶端之間的低延遲資料交換

## 新增相依性 {id="add-dependencies"}

若要使用 `WebRtcClient`，您需要在建置指令碼中包含 `%artifact_name%` 構件：

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

## 建立用戶端 {id="create-a-client"}

建立 `WebRtcClient` 時，請根據您的目標平台選擇引擎：

* JS/Wasm：`JsWebRtc` – 使用瀏覽器 [WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API) 與 [媒體擷取與串流](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API) API。
* Android：`AndroidWebRtc` – 使用預先編譯的 [適用於 Android 的 Stream WebRTC 程式庫](https://github.com/GetStream/webrtc-android) 以及 Android 媒體 API。
* iOS：`IosWebRtc` – 使用 [WebRTC SDK](https://github.com/webrtc-sdk) 和原生 [AVFoundation](https://developer.apple.com/documentation/avfoundation) 架構。
* JVM：`JvmWebRtc` – 使用由 [webrtc-java](https://github.com/devopvoid/webrtc-java) 提供的原生 WebRTC 繫結。

接著您可以提供類似於 `HttpClient` 的平台特定配置。STUN/TURN 伺服器對於 [ICE](#ice) 的正確運作是必要的。您可以使用現有的解決方案，例如 [coturn](https://github.com/coturn/coturn)：

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
    context = appContext // 必要：提供 Android context
    defaultConnectionConfig = {
        iceServers = listOf(WebRtc.IceServer("stun:stun.l.google.com:19302"))
    }
}
```

</TabItem>

<TabItem title="iOS" group-key="ios">

```kotlin
val iosClient = WebRtcClient(IosWebRtc) {
    // 相同的配置，不需要額外的 context
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

建立 `WebRtcClient` 後，下一步是建立對等連線。
對等連線是管理兩個用戶端之間即時通訊的核心物件。

為了建立連線，WebRTC 使用會話描述協定（SDP）。這涉及三個步驟：

1. 其中一個對等端（撥號端）建立一個供應（offer）。
2. 另一個對等端（受話端）以一個應答（answer）進行回應。
3. 雙方對等端都套用彼此的描述以完成設定。

```kotlin
// 撥號端建立連線與供應 (offer)
val caller = jsClient.createPeerConnection()
val offer = caller.createOffer()
caller.setLocalDescription(offer)
// 透過您的信令機制將 offer.sdp 傳送給遠端對等端

// 受話端接收供應 (offer) 並建立應答 (answer)
val callee = jsClient.createPeerConnection()
callee.setRemoteDescription(
    WebRtc.SessionDescription(WebRtc.SessionDescriptionType.OFFER, remoteOfferSdp)
)
val answer = callee.createAnswer()
callee.setLocalDescription(answer)
// 透過信令將 answer.sdp 傳回給撥號端

// 撥號端套用應答 (answer)
caller.setRemoteDescription(
    WebRtc.SessionDescription(WebRtc.SessionDescriptionType.ANSWER, remoteAnswerSdp)
)
```

## 交換 ICE 候選者 {id="ice"}

SDP 協商完成後，對等端仍需探索如何跨網路連線。[互動式連接建立（ICE）](https://en.wikipedia.org/wiki/Interactive_Connectivity_Establishment) 允許對等端尋找彼此之間的網路路徑。

* 每個對等端都會收集自己的 ICE 候選者。
* 這些候選者必須透過您選擇的信令通道傳送給另一個對等端。
* 一旦雙方對等端都新增了對方的候選者，連線即可成功。

```kotlin
// 收集並傳送本地候選者
scope.launch {
    caller.iceCandidates.collect { candidate ->
        // 傳送 candidate.candidate, candidate.sdpMid, candidate.sdpMLineIndex 給遠端對等端
    }
}

// 接收並新增遠端候選者
callee.addIceCandidate(WebRtc.IceCandidate(candidateString, sdpMid, sdpMLineIndex))

// （選填）等待所有候選者收集完成
callee.awaitIceGatheringComplete()
```

> Ktor 不提供信令。請使用 WebSockets、HTTP 或其他傳輸方式來交換供應 (offer)、應答 (answer) 和 ICE 候選者。
> 
{style="note"}

## 使用資料通道 {id="use-a-data-channel"}

WebRTC 支援資料通道，讓對等端可以交換任意訊息。這對於聊天、多人遊戲、協作工具或用戶端之間的任何低延遲訊息傳遞非常有用。

### 建立通道 {id="creating-a-channel"}

要在其中一側建立通道，請使用 `.createDataChannel()` 方法：

```kotlin
val channel = caller.createDataChannel("chat")
```

接著您可以在另一側監聽資料通道事件：

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

* `Open`：通道已準備好傳送和接收資料。
* `Closing`：通道已開始關閉。
* `Closed`：通道已關閉。
* `BufferedAmountLow`：已緩衝的傳出資料量已降至或低於 `bufferedAmountLowThreshold`。
* `Error`：通道發生錯誤。此事件不會在 JVM 上發出。傳送失敗時會改為拋出 `WebRtc.IOException`。

若要接收 `BufferedAmountLow`，請在通道上設定門檻值：

```kotlin
channel.setBufferedAmountLowThreshold(16 * 1024)
```

### 傳送與接收訊息 {id="sending-and-receiving-messages"}

通道使用類似於 `Channel` 的 API，這對 Kotlin 開發人員來說非常熟悉：

```kotlin
// 傳送訊息
scope.launch { channel.send("hello") }

// 接收訊息
scope.launch { println("received: " + channel.receiveText()) }
```

## 新增與觀察媒體軌道 {id="add-and-observe-media-tracks"}

除了資料通道外，WebRTC 還支援音訊和影片的媒體軌道。這讓您可以建立影片通話或螢幕共享等應用程式。

### 建立本地軌道 {id="creating-local-tracks"}

您可以向本地裝置（麥克風、相機）請求音訊或影片軌道：

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

媒體擷取是特定於平台的：

* 在 Web 端，它使用 `navigator.mediaDevices.getUserMedia`。
* 在 Android 端，它使用 Camera2 API。您需要分別請求相機和麥克風權限。
* 在 iOS 端，它使用 AVFoundation API。您也需要分別請求所需的權限。
* 在 JVM 端，它使用 [webrtc-java](https://github.com/devopvoid/webrtc-java) 存取系統相機和麥克風。作業系統可能會提示使用者授予權限。

用戶端將根據指定的約束選擇最合適的媒體裝置。如果沒有合適的裝置可用，它將拋出 `WebRtcMedia.DeviceException`。

> `WebRtcClient`、`WebRtcPeerConnection`、`WebRtcMedia.Track` 以及其他介面皆實作了 `AutoCloseable`。
> 請務必在不再需要時呼叫 `close()` 函式以釋放資源。
> 
{style="note"}

### 接收遠端軌道 {id="receiving-remote-tracks"}

您也可以監聽遠端媒體軌道：

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

## 特定平台的邏輯 {id="platform-specific-logic"}

此 API 提供了高階抽象，但在某些使用案例下可能需要存取特定平台的 API。
您可以使用 `.getNative()` 擴充函式來獲取底層實作。
除 iOS 上的 `WebRTC-SDK` CocoaPod 外，特定平台的程式庫均作為傳遞性程式庫公開。

<Tabs group="platform" id="platform-specific-logic-tabs">
<TabItem title="JS/Wasm" group-key="js-wasm">

```kotlin
// DOM API 從 `kotlin-wrappers` 匯入

val videoTrack = rtcClient.createVideoTrack()
val jsStream = MediaStream().apply {
    val nativeTrack: MediaStreamTrack = videoTrack.getNative()
    addTrack(nativeTrack)
}

// 開始渲染影片
val videoElement = document.createElement("video") as HTMLVideoElement
videoElement.srcObject = jsStream
videoElement.autoplay = true

// 停止渲染影片
videoElement.srcObject = null
```

</TabItem>
<TabItem title="Android" group-key="android">

```kotlin
val eglBase = org.webrtc.EglBase.create() // 在應用程式中應為唯一的

val videoTrack = rtcClient.createVideoTrack()
val nativeTrack: org.webrtc.VideoTrack = videoTrack.getNative()

// 建立用於渲染傳入影片畫面格的 surface
val renderer = org.webrtc.SurfaceViewRenderer()
renderer.init(eglBase.eglBaseContext, null)

// 開始渲染影片
videoTrack.addSink(renderer)

// 停止渲染影片
videoTrack.removeSink(renderer)
renderer.release()
```

</TabItem>

<TabItem title="iOS" group-key="ios">

```kotlin
val videoTrack = rtcClient.createVideoTrack()
val nativeTrack: RTCVideoTrack = videoTrack.getNative()

// 建立用於渲染傳入影片畫面格的 surface
val videoView = RTCMTLVideoView() // iOS UIKit 檢視

// 開始渲染影片
nativeTrack.addRenderer(videoView)

// 停止渲染影片
nativeTrack.removeRenderer(videoView)
```

要使用 `WebRTC-SDK` API，您需要手動安裝它：

```kotlin
// build.gradle.kts
kotlin {
    cocoapods {
        pod("WebRTC-SDK") {
            version = "137.7151.04" // 或更新版本
            // 預設模組名稱為 `WebRTC-SDK`，您可以為了方便而變更它
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

// 沒有內建的影片檢視。請附加 sink 並使用 Swing、JavaFX、Compose
// 或其他 UI 工具包來渲染畫面格。
nativeTrack.addSink { frame ->
    // 將 frame.buffer 繪製到您的 UI，然後執行 frame.release()
}
```

</TabItem>
</Tabs>

```kotlin
// 在 Android、iOS 和 JVM 上，音訊軌道播放可以無需使用 `getNative()` 即可開始/停止
// 在瀏覽器中，您仍應建立一個未定義的元素。

val audio = rtcClient.createAudioTrack()
// 開始播放音訊
audio.enable(true)
// 停止播放音訊
audio.enable(false)
```

> 這些程式碼片段可以與 Compose Multiplatform 搭配使用，但未考慮其生命週期。有關完整的整合方式，請參閱 [Ktor Chat](https://github.com/ktorio/ktor-chat) 範例。
> 
{style="note"}

## 限制 {id="limitations"}

WebRTC 用戶端目前處於實驗階段，並具有以下限制：

* **信令：** 不包含信令。您需要個別實作它，例如使用 WebSockets 或 HTTP。
* **平台支援：** 此用戶端支援 JavaScript/Wasm、Android、iOS 和 JVM 桌面。Kotlin/Native 支援計劃在未來的版本中提供。
* **權限：** 權限必須由您的應用程式處理。瀏覽器會提示使用者獲取麥克風和相機存取權限。Android 和 iOS 則需要執行期權限請求。在 JVM 上，相機和麥克風存取權限是在作業系統層級授予的。
* **JVM 限制：** 不支援候選者預先擷取（candidate prefetching）。`iceCandidatePoolSize` 必須為 `0` 或省略。不支援 `facingMode`、`aspectRatio` 與 `resizeMode` 影片約束，若設定將會拋出例外狀況。不會發出 `DataChannelEvent.Error`。
* **媒體功能：** 僅支援基本的音訊和影片軌道。螢幕共享、裝置選擇、聯播（simulcast）和進階 RTP 功能尚不可用。
* **連線統計資料：** 雖然可以使用統計資料，但在不同平台之間有所差異，且不遵循統一的架構。