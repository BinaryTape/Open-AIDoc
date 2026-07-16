[//]: # (title: WebRTC 客户端)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-client-webrtc"/>
<tldr>
    <p>
        <b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
    </p>
    <p>
        <b>支持的平台</b>：JS/Wasm、Android
    </p>   
    <p>
        <b>代码示例</b>：<a href="https://github.com/ktorio/ktor-chat/">ktor-chat</a>
    </p>
</tldr>
<link-summary>
    WebRTC 客户端支持在多平台项目中进行实时点对点通信。
</link-summary>

Web 实时通信 (WebRTC) 是一套用于浏览器和原生应用中实时点对点通信的标准和 API。

Ktor 中的 WebRTC 客户端支持在多平台项目中进行实时点对点通信。借助 WebRTC，您可以构建如下功能：

- 视频与语音通话
- 多人游戏
- 协作应用（白板、编辑器等）
- 客户端之间的低延迟数据交换

## 添加依赖项 {id="add-dependencies"}

要使用 `WebRtcClient`，您需要在构建脚本中包含 `%artifact_name%` 构件：

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

## 创建客户端

创建 `WebRtcClient` 时，请根据目标平台选择引擎：

- JS/Wasm：`JsWebRtc` – 使用 [WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)、[媒体捕获与流](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API) 浏览器 API。
- Android：`AndroidWebRtc` – 使用由 [Stream](https://github.com/GetStream/webrtc-android) 提供的 Android 预编译 WebRTC 库和 Android 媒体 API。
- iOS：`IosWebRtc` - 使用适用于 iOS 的 [WebRTC SDK](https://github.com/webrtc-sdk) 和原生 [AVFoundation](https://developer.apple.com/documentation/avfoundation) 框架。

您可以随后提供类似于 `HttpClient` 的平台特定配置。STUN/TURN 服务器是 [ICE](#ice) 正常工作所必需的。您可以使用 [coturn](https://github.com/coturn/coturn) 等现有解决方案：

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
    // 相同的配置，不需要额外的 context
}
```

</TabItem>
</Tabs>

## 创建连接并协商 SDP

创建 `WebRtcClient` 后，下一步是创建对等连接。对等连接是管理两个客户端之间实时通信的核心对象。

为了建立连接，WebRTC 使用会话描述协议 (SDP)。这包含三个步骤：

1. 一个对等端（呼叫方）创建一个提议 (offer)。
2. 另一个对等端（被呼叫方）以应答 (answer) 响应。
3. 双方都应用彼此的描述以完成设置。

```kotlin
// 呼叫方创建连接和提议
val caller = jsClient.createPeerConnection()
val offer = caller.createOffer()
caller.setLocalDescription(offer)
// 通过您的信令机制将 offer.sdp 发送给远程对等端

// 被呼叫方接收提议并创建应答
val callee = jsClient.createPeerConnection()
callee.setRemoteDescription(
    WebRtc.SessionDescription(WebRtc.SessionDescriptionType.OFFER, remoteOfferSdp)
)
val answer = callee.createAnswer()
callee.setLocalDescription(answer)
// 通过信令将 answer.sdp 发回给呼叫方

// 呼叫方应用应答
caller.setRemoteDescription(
    WebRtc.SessionDescription(WebRtc.SessionDescriptionType.ANSWER, remoteAnswerSdp)
)
```

## 交换 ICE 候选者 {id="ice"}

SDP 协商完成后，对等端仍需发现如何跨网络连接。[交互式连接建立 (ICE)](https://en.wikipedia.org/wiki/Interactive_Connectivity_Establishment) 允许对等端寻找彼此间的网络路径。

- 每个对等端收集自己的 ICE 候选者。
- 这些候选者必须通过您选择的信令通道发送给另一个对等端。
- 一旦双方都添加了彼此的候选者，连接即可成功。

```kotlin
// 收集并发送本地候选者
scope.launch {
    caller.iceCandidates.collect { candidate ->
        // 发送 candidate.candidate, candidate.sdpMid, candidate.sdpMLineIndex 到远程对等端
    }
}

// 接收并添加远程候选者
callee.addIceCandidate(WebRtc.IceCandidate(candidateString, sdpMid, sdpMLineIndex))

// （可选）等待直到所有候选者收集完毕
callee.awaitIceGatheringComplete()
```

> Ktor 不提供信令。请使用 WebSocket、HTTP 或其他传输方式来交换提议、应答和 ICE 候选者。
> 
{style="note"}

## 使用数据通道

WebRTC 支持数据通道，允许对等端交换任意消息。这对于聊天、多人游戏、协作工具或客户端之间的任何低延迟消息传递都非常有用。

### 创建通道

要在其中一方创建通道，请使用 `.createDataChannel()` 方法：

```kotlin
val channel = caller.createDataChannel("chat")
```

您随后可以在另一方监听数据通道事件：

```kotlin
scope.launch {
    callee.dataChannelEvents.collect { event ->
        when (event) {
            is DataChannelEvent.Open -> println("Channel opened: ${event.channel}")
            is DataChannelEvent.Closed -> println("Channel closed")
            else -> {}
        }
    }
}
```

### 发送和接收消息

通道使用类似于 `Channel` 的 API，这对 Kotlin 开发者来说非常熟悉：

```kotlin
// 发送消息
scope.launch { channel.send("hello") }

// 接收消息
scope.launch { println("received: " + channel.receiveText()) }
```

## 添加并观察媒体轨道

除数据通道外，WebRTC 还支持音频和视频媒体轨道。这允许您构建视频通话或屏幕共享等应用。

### 创建本地轨道

您可以从本地设备（麦克风、摄像头）请求音频或视频轨道：

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

在 Web 端，这使用 `navigator.mediaDevices.getUserMedia`。在 Android 端，它使用 Camera2 API，且您必须手动请求麦克风/摄像头权限。在 iOS 端，它使用 AVFoundation API，您也应手动请求任何权限。客户端将尝试根据指定的约束寻找最合适的媒体设备，否则将抛出 `WebRtcMedia.DeviceException`。

> `WebRtcClient`、`WebRtcPeerConnection`、`WebRtcMedia.Track` 等接口都是 `AutoCloseable` 的。请确保在不再需要时调用 `close()` 方法以释放资源。
{style="note"}

### 接收远程轨道

您也可以监听远程媒体轨道：

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

## 平台特定逻辑

此 API 提供了高级抽象，但在某些用例中可能需要访问平台特定的 API。您可以使用 `.getNative()` 扩展函数来获取底层实现。除 iOS 上的 `WebRTC-SDK` CocoaPod 外，平台特定库均作为传递依赖项公开。

<Tabs group="platform" id="platform-specific-logic-tabs">
<TabItem title="JS/Wasm" group-key="js-wasm">

```kotlin
// DOM API 从 `kotlin-wrappers` 导入

val videoTrack = rtcClient.createVideoTrack()
val jsStream = MediaStream().apply {
    val nativeTrack: MediaStreamTrack = videoTrack.getNative()
    addTrack(nativeTrack)
}

// 开始渲染视频
val videoElement = document.createElement("video") as HTMLVideoElement
videoElement.srcObject = jsStream
videoElement.autoplay = true

// 停止渲染视频
videoElement.srcObject = null
```

</TabItem>
<TabItem title="Android" group-key="android">

```kotlin
val eglBase = org.webrtc.EglBase.create() // 在应用中应该是唯一的

val videoTrack = rtcClient.createVideoTrack()
val nativeTrack: org.webrtc.VideoTrack = videoTrack.getNative()

// 创建一个表面 (surface) 以渲染传入的视频帧
val renderer = org.webrtc.SurfaceViewRenderer()
renderer.init(eglBase.eglBaseContext, null)

// 开始渲染视频
videoTrack.addSink(renderer)

// 停止渲染视频
videoTrack.removeSink(renderer)
renderer.release()
```

</TabItem>

<TabItem title="iOS" group-key="ios">

```kotlin
val videoTrack = rtcClient.createVideoTrack()
val nativeTrack: RTCVideoTrack = videoTrack.getNative()

// 创建一个表面 (surface) 以渲染传入的视频帧
val videoView = RTCMTLVideoView() // iOS UIKit 视图

// 开始渲染视频
nativeTrack.addRenderer(videoView)

// 停止渲染视频
nativeTrack.removeRenderer(videoView)
```

要使用 `WebRTC-SDK` API，您需要手动安装它：

```kotlin
// build.gradle.kts
kotlin {
    cocoapods {
        pod("WebRTC-SDK") {
            version = "137.7151.04" // 或更高版本
            // 默认模块名称为 `WebRTC-SDK`，您可以为了方便进行更改
            moduleName = "WebRTC"
            packageName = "WebRTC"
        }
    }
}
```

</TabItem>
</Tabs>

```kotlin
// 在 Android 和 iOS 上，音频轨道播放可以在不使用 `getNative()` 的情况下开始/停止
// 在浏览器中，您仍应创建一个未定义的元素。

val audio = rtcClient.createAudioTrack()
// 开始播放音频
audio.enable(true)
// 停止播放音频
audio.enable(false)
```

> 这些片段可以与 Compose Multiplatform 配合使用，但未考虑其生命周期。有关完整的集成示例，请参阅 [Ktor Chat](https://github.com/ktorio/ktor-chat) 示例。
{style="note"}

## 限制

WebRTC 客户端目前处于实验性阶段，并具有以下限制：

- 不包含信令。您需要实现自己的信令（例如使用 WebSocket 或 HTTP）。
- 支持的平台包括 JavaScript/Wasm、Android 和 iOS。JVM 桌面和 Kotlin/Native 支持计划在未来版本中提供。
- 权限必须由您的应用程序处理。浏览器会提示用户访问麦克风和摄像头，而 Android 和 iOS 则需要运行时权限请求。
- 仅支持基础音频和视频轨道。屏幕共享、设备选择、联播 (simulcast) 和高级 RTP 功能尚不可用。
- 连接统计信息可用，但各平台之间存在差异，且未遵循统一的架构。