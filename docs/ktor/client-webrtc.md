[//]: # (title: WebRTC 客户端)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-client-webrtc"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.webrtc"/>
<tldr>
    <p>
        <b>必需依赖项</b>：<code>io.ktor:%artifact_name%</code>
    </p>
    <p>
        <b>支持的平台</b>：JS/Wasm、Android、iOS、JVM
    </p>   
    <p>
        <b>代码示例</b>：<a href="https://github.com/ktorio/ktor-chat/">ktor-chat</a>
    </p>
</tldr>
<link-summary>
    WebRTC 客户端支持在多平台项目中进行实时对等通信。
</link-summary>

Web 实时通信（Web Real-Time Communication，WebRTC）是一套用于在浏览器和原生应用中进行实时对等通信的标准与 API。

Ktor 中的 WebRTC 客户端支持在多平台项目中进行实时对等通信。借助 WebRTC，你可以构建如下功能：

* 视频与语音通话
* 多人游戏
* 协作应用程序，例如白板和编辑器
* 客户端之间的低延迟数据交换

## 添加依赖项 {id="add-dependencies"}

要使用 `WebRtcClient`，你需要在构建脚本中引入 `%artifact_name%` 工件：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">Ktor 版本目录</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">Ktor 版本目录</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 创建客户端 {id="create-a-client"}

创建 `WebRtcClient` 时，请根据目标平台选择引擎：

* JS/Wasm：`JsWebRtc` 使用浏览器 [WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API) 和 [Media Capture and Streams](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API) API。
* Android：`AndroidWebRtc` 使用预编译的 [Stream WebRTC library for Android](https://github.com/GetStream/webrtc-android) 以及 Android 媒体 API。
* iOS：`IosWebRtc` 使用 [WebRTC SDK](https://github.com/webrtc-sdk) 和原生 [AVFoundation](https://developer.apple.com/documentation/avfoundation) 框架。
* JVM：`JvmWebRtc` 使用由 [webrtc-java](https://github.com/devopvoid/webrtc-java) 提供的原生 WebRTC 绑定。

随后你可以提供类似于 `HttpClient` 的平台特定配置。[ICE](#ice) 正常工作需要 STUN/TURN 服务器。你可以使用现有的解决方案，例如 [coturn](https://github.com/coturn/coturn)：

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

## 创建连接并协商 SDP {id="create-a-connection-and-negotiate-sdp"}

创建 `WebRtcClient` 之后，下一步是创建对等连接（peer connection）。
对等连接是管理两个客户端之间实时通信的核心对象。

为了建立连接，WebRTC 使用会话描述协议（Session Description Protocol，SDP）。这包含三个步骤：

1. 一方（呼叫方/caller）创建一个 offer。
2. 另一方（应答方/callee）以 answer 进行响应。
3. 双方均应用彼此的描述以完成建立。

```kotlin
// 呼叫方创建连接和 offer
val caller = jsClient.createPeerConnection()
val offer = caller.createOffer()
caller.setLocalDescription(offer)
// 通过你的信令机制将 offer.sdp 发送给远端对等节点

// 应答方接收 offer 并创建 answer
val callee = jsClient.createPeerConnection()
callee.setRemoteDescription(
    WebRtc.SessionDescription(WebRtc.SessionDescriptionType.OFFER, remoteOfferSdp)
)
val answer = callee.createAnswer()
callee.setLocalDescription(answer)
// 通过信令将 answer.sdp 发送回呼叫方

// 呼叫方应用 answer
caller.setRemoteDescription(
    WebRtc.SessionDescription(WebRtc.SessionDescriptionType.ANSWER, remoteAnswerSdp)
)
```

## 交换 ICE candidate {id="ice"}

一旦 SDP 协商完成，对等端仍然需要探寻如何跨网络进行连接。[交互式连通建立方式 (ICE)](https://en.wikipedia.org/wiki/Interactive_Connectivity_Establishment) 允许对等端查找通往彼此的网络路径。

* 每个对等端都会收集自己的 ICE candidate。
* 这些 candidate 必须通过你选定的信令通道发送给另一个对等端。
* 一旦双方都添加了彼此的 candidate，连接即可建立成功。

```kotlin
// 收集并发送本地 candidate
scope.launch {
    caller.iceCandidates.collect { candidate ->
        // 将 candidate.candidate、candidate.sdpMid、candidate.sdpMLineIndex 发送给远端对等节点
    }
}

// 接收并添加远端 candidate
callee.addIceCandidate(WebRtc.IceCandidate(candidateString, sdpMid, sdpMLineIndex))

// 可选：等待所有 candidate 收集完毕
callee.awaitIceGatheringComplete()
```

> Ktor 不提供信令。请使用 WebSocket、HTTP 或其他传输方式来交换 offer、answer 和 ICE candidate。
> 
{style="note"}

## 使用数据通道 {id="use-a-data-channel"}

WebRTC 支持数据通道（data channel），允许对等端交换任意消息。这适用于聊天、多人游戏、协作工具或客户端之间的任何低延迟消息传递。

### 创建通道 {id="creating-a-channel"}

要在其中一端创建通道，请使用 `.createDataChannel()` 方法：

```kotlin
val channel = caller.createDataChannel("chat")
```

随后你可以在另一端监听数据通道事件：

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

* `Open`：通道已准备好发送和接收数据。
* `Closing`：通道已开始关闭。
* `Closed`：通道已关闭。
* `BufferedAmountLow`：缓冲的传出数据量已降至或低于 `bufferedAmountLowThreshold`。
* `Error`：通道发生错误。此事件在 JVM 上不会发出。发送失败时会改为抛出 `WebRtc.IOException`。

要接收 `BufferedAmountLow`，请在通道上设置阈值：

```kotlin
channel.setBufferedAmountLowThreshold(16 * 1024)
```

### 发送与接收消息 {id="sending-and-receiving-messages"}

通道使用类似 `Channel` 的 API，Kotlin 开发者对此会非常熟悉：

```kotlin
// 发送消息
scope.launch { channel.send("hello") }

// 接收消息
scope.launch { println("received: " + channel.receiveText()) }
```

## 添加并观察媒体轨道 {id="add-and-observe-media-tracks"}

除数据通道外，WebRTC 还支持用于音频和视频的媒体轨道。这允许你构建视频通话或屏幕共享等应用程序。

### 创建本地轨道 {id="creating-local-tracks"}

你可以从本地设备（麦克风、摄像头）请求音频或视频轨道：

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

媒体采集是平台特定的：

* 在 Web 上，使用 `navigator.mediaDevices.getUserMedia`。
* 在 Android 上，使用 Camera2 API。你需要单独请求摄像头和麦克风权限。
* 在 iOS 上，使用 AVFoundation API。你同样需要单独请求所需的权限。
* 在 JVM 上，使用 [webrtc-java](https://github.com/devopvoid/webrtc-java) 访问系统摄像头和麦克风。操作系统可能会提示用户授权。

客户端会根据指定的约束条件选择最合适的媒体设备。如果没有合适的设备可用，它将抛出 `WebRtcMedia.DeviceException`。

> `WebRtcClient`、`WebRtcPeerConnection`、`WebRtcMedia.Track` 以及其他接口均实现了 `AutoCloseable`。当你不再需要它们时，请调用 `close()` 函数释放资源。
> 
{style="note"}

### 接收远端轨道 {id="receiving-remote-tracks"}

你还可以监听远端媒体轨道：

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

## 平台特定逻辑 {id="platform-specific-logic"}

此 API 提供了高层级抽象，但某些用例可能需要访问平台特定的 API。你可以使用 `.getNative()` 扩展函数来获取底层实现。除 iOS 上的 `WebRTC-SDK` CocoaPod 之外，平台特定库均作为传递依赖库公开。

<Tabs group="platform" id="platform-specific-logic-tabs">
<TabItem title="JS/Wasm" group-key="js-wasm">

```kotlin
// DOM API 是从 `kotlin-wrappers` 导入的

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
val eglBase = org.webrtc.EglBase.create() // 在应用中应保持唯一

val videoTrack = rtcClient.createVideoTrack()
val nativeTrack: org.webrtc.VideoTrack = videoTrack.getNative()

// 创建用于渲染传入视频帧的 surface
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

// 创建用于渲染传入视频帧的 surface
val videoView = RTCMTLVideoView() // iOS UIKit View

// 开始渲染视频
nativeTrack.addRenderer(videoView)

// 停止渲染视频
nativeTrack.removeRenderer(videoView)
```

要使用 `WebRTC-SDK` API，你需要手动安装它：

```kotlin
// build.gradle.kts
kotlin {
    cocoapods {
        pod("WebRTC-SDK") {
            version = "137.7151.04" // 或更新版本
            // 默认模块名称为 `WebRTC-SDK`，你可以为方便起见进行修改
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

// 没有内置的视频视图。请附加一个接收器（sink），并使用
// Swing、JavaFX、Compose 或其他 UI 工具包渲染视频帧。
nativeTrack.addSink { frame ->
    // 将 frame.buffer 绘制到 UI，然后调用 frame.release()
}
```

</TabItem>
</Tabs>

```kotlin
// 在 Android、iOS 和 JVM 上，无需使用 `getNative()` 即可启动/停止音频轨道播放
// 在浏览器中，你仍应创建一个 <audio/> 元素。

val audio = rtcClient.createAudioTrack()
// 开始播放音频
audio.enable(true)
// 停止播放音频
audio.enable(false)
```

> 这些代码段可与 Compose Multiplatform 结合使用，但未处理其生命周期。完整的集成示例请参阅 [Ktor Chat](https://github.com/ktorio/ktor-chat)。
> 
{style="note"}

## 限制 {id="limitations"}

WebRTC 客户端目前处于实验阶段，并具有以下限制：

* **信令：** 不包含信令功能。你需要单独实现信令，例如使用 WebSocket 或 HTTP。
* **平台支持：** 该客户端支持 JavaScript/Wasm、Android、iOS 和 JVM 桌面端。Kotlin/Native 支持计划在未来版本中推出。
* **权限：** 权限必须由你的应用程序自行处理。浏览器会提示用户授权访问麦克风和摄像头。Android 和 iOS 需要运行时权限请求。在 JVM 上，摄像头和麦克风的访问权限在操作系统级别授予。
* **JVM 限制：** 不支持 candidate 预提取。`iceCandidatePoolSize` 必须为 `0` 或省略。不支持 `facingMode`、`aspectRatio` 和 `resizeMode` 视频约束，若设置则会抛出异常。不会发出 `DataChannelEvent.Error`。
* **媒体功能：** 仅支持基本的音频和视频轨道。屏幕共享、设备选择、联播（simulcast）以及高级 RTP 功能暂不可用。
* **连接统计信息：** 统计信息可用，但各平台之间存在差异，且未遵循统一的架构。