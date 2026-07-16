[//]: # (title: WebRTCクライアント)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-client-webrtc"/>
<tldr>
    <p>
        <b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
    </p>
    <p>
        <b>サポートされているプラットフォーム</b>: JS/Wasm, Android
    </p>   
    <p>
        <b>コード例</b>: <a href="https://github.com/ktorio/ktor-chat/">ktor-chat</a>
    </p>
</tldr>
<link-summary>
    WebRTCクライアントは、マルチプラットフォームプロジェクトにおいてリアルタイムのピア・ツー・ピア通信を可能にします。
</link-summary>

Web Real-Time Communication (WebRTC) は、ブラウザやネイティブアプリでリアルタイムのピア・ツー・ピア (peer-to-peer) 通信を行うための標準規格およびAPIのセットです。

KtorのWebRTCクライアントを使用すると、マルチプラットフォームプロジェクトでリアルタイムのピア・ツー・ピア通信を実現できます。WebRTCを使用すると、以下のような機能を構築できます：

- ビデオおよび音声通話
- マルチプレイヤーゲーム
- 共同作業用アプリケーション（ホワイトボード、エディタなど）
- クライアント間の低遅延データ交換

## 依存関係の追加 {id="add-dependencies"}

`WebRtcClient`を使用するには、ビルドスクリプトに`%artifact_name%`アーティファクトを含める必要があります：

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

## クライアントの作成

`WebRtcClient`を作成する際は、ターゲットプラットフォームに基づいてエンジンを選択します：

- JS/Wasm: `JsWebRtc` – [WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)、[Media Capture and Streams](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API) ブラウザAPIを使用します。
- Android: `AndroidWebRtc` – [Stream](https://github.com/GetStream/webrtc-android) によるAndroid用のプリコンパイル済みWebRTCライブラリとAndroidメディアAPIを使用します。
- iOS: `IosWebRtc` - iOS用の [WebRTC SDK](https://github.com/webrtc-sdk) とネイティブの [AVFoundation](https://developer.apple.com/documentation/avfoundation) フレームワークを使用します。

その後、`HttpClient`と同様にプラットフォーム固有の設定を提供できます。[ICE](#ice)が正しく動作するためには、STUN/TURNサーバーが必要です。[coturn](https://github.com/coturn/coturn) などの既存のソリューションを使用できます：

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
    context = appContext // 必須: Androidのcontextを提供
    defaultConnectionConfig = {
        iceServers = listOf(WebRtc.IceServer("stun:stun.l.google.com:19302"))
    }
}
```

</TabItem>

<TabItem title="iOS" group-key="ios">

```kotlin
val iosClient = WebRtcClient(IosWebRtc) {
    // 同じ設定を使用、追加のcontextは不要
}
```

</TabItem>
</Tabs>

## 接続の作成とSDPのネゴシエーション

`WebRtcClient`を作成した後の次のステップは、ピア接続（peer connection）を作成することです。
ピア接続は、2つのクライアント間のリアルタイム通信を管理するコアオブジェクトです。

接続を確立するために、WebRTCはSession Description Protocol (SDP) を使用します。これには3つのステップが含まれます：

1. 一方のピア（コーラー / caller）がオファー (offer) を作成する。
2. もう一方のピア（カリー / callee）がアンサー (answer) で応答する。
3. 両方のピアが互いの記述 (description) を適用してセットアップを完了する。

```kotlin
// コーラーが接続とオファーを作成
val caller = jsClient.createPeerConnection()
val offer = caller.createOffer()
caller.setLocalDescription(offer)
// シグナリングメカニズムを介して offer.sdp をリモートピアに送信

// カリーがオファーを受信してアンサーを作成
val callee = jsClient.createPeerConnection()
callee.setRemoteDescription(
    WebRtc.SessionDescription(WebRtc.SessionDescriptionType.OFFER, remoteOfferSdp)
)
val answer = callee.createAnswer()
callee.setLocalDescription(answer)
// シグナリングを介して answer.sdp をコーラーに返送

// コーラーがアンサーを適用
caller.setRemoteDescription(
    WebRtc.SessionDescription(WebRtc.SessionDescriptionType.ANSWER, remoteAnswerSdp)
)
```

## ICE候補の交換 {id="ice"}

SDPのネゴシエーションが完了した後も、ピアはネットワークを越えて接続する方法を見つける必要があります。[Interactive Connectivity Establishment (ICE)](https://en.wikipedia.org/wiki/Interactive_Connectivity_Establishment) により、ピアは互いへのネットワークパスを見つけることができます。

- 各ピアは自身のICE候補 (ICE candidates) を収集します。
- これらの候補は、選択したシグナリングチャネルを通じて他方のピアに送信される必要があります。
- 両方のピアが互いの候補を追加すると、接続が成功します。

```kotlin
// ローカル候補を収集して送信
scope.launch {
    caller.iceCandidates.collect { candidate ->
        // candidate.candidate, candidate.sdpMid, candidate.sdpMLineIndex をリモートピアに送信
    }
}

// リモート候補を受信して追加
callee.addIceCandidate(WebRtc.IceCandidate(candidateString, sdpMid, sdpMLineIndex))

// オプション：すべての候補の収集が完了するまで待機
callee.awaitIceGatheringComplete()
```

> Ktorはシグナリングを提供しません。オファー、アンサー、およびICE候補を交換するには、WebSocket、HTTP、またはその他のトランスポートを使用してください。
> 
{style="note"}

## データチャネルの使用

WebRTCはデータチャネルをサポートしており、ピア間で任意のメッセージを交換できます。これは、チャット、マルチプレイヤーゲーム、共同作業ツール、またはクライアント間の低遅延メッセージングに役立ちます。

### チャネルの作成

一方でチャネルを作成するには、`.createDataChannel()` メソッドを使用します：

```kotlin
val channel = caller.createDataChannel("chat")
```

その後、もう一方でデータチャネルのイベントをリッスンできます：

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

### メッセージの送信と受信

チャネルは、Kotlin開発者におなじみの `Channel` 風のAPIを使用します：

```kotlin
// メッセージを送信
scope.launch { channel.send("hello") }

// メッセージを受信
scope.launch { println("received: " + channel.receiveText()) }
```

## メディアトラックの追加と監視

データチャネルに加えて、WebRTCは音声およびビデオ用のメディアトラックをサポートしています。これにより、ビデオ通話や画面共有などのアプリケーションを構築できます。

### ローカルトラックの作成

ローカルデバイス（マイク、カメラ）から音声またはビデオトラックをリクエストできます：

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

Webでは、これは `navigator.mediaDevices.getUserMedia` を使用します。Androidでは Camera2 API を使用し、マイク/カメラの権限を手動でリクエストする必要があります。iOSでは AVFoundation API を使用し、同様に権限を手動でリクエストする必要があります。クライアントは、指定された制約に従って最適なメディアデバイスを見つけようとしますが、見つからない場合は `WebRtcMedia.DeviceException` をスローします。

> `WebRtcClient`、`WebRtcPeerConnection`、`WebRtcMedia.Track` およびその他のインターフェースは `AutoCloseable` です。不要になった際にリソースを解放するために、必ず `close()` メソッドを呼び出してください。
{style="note"}

### リモートトラックの受信

リモートのメディアトラックをリッスンすることもできます：

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

## プラットフォーム固有のロジック

このAPIは高レベルの抽象化を提供しますが、プラットフォーム固有のAPIにアクセスする必要があるユースケースもあります。`.getNative()` 拡張関数を使用して、基盤となる実装を取得できます。プラットフォーム固有のライブラリは、iOSの `WebRTC-SDK` CocoaPodを除き、推移的（transitive）ライブラリとして公開されています。

<Tabs group="platform" id="platform-specific-logic-tabs">
<TabItem title="JS/Wasm" group-key="js-wasm">

```kotlin
// DOM APIは `kotlin-wrappers` からインポートされます

val videoTrack = rtcClient.createVideoTrack()
val jsStream = MediaStream().apply {
    val nativeTrack: MediaStreamTrack = videoTrack.getNative()
    addTrack(nativeTrack)
}

// ビデオレンダリングを開始
val videoElement = document.createElement("video") as HTMLVideoElement
videoElement.srcObject = jsStream
videoElement.autoplay = true

// ビデオレンダリングを停止
videoElement.srcObject = null
```

</TabItem>
<TabItem title="Android" group-key="android">

```kotlin
val eglBase = org.webrtc.EglBase.create() // アプリ内で一意である必要があります

val videoTrack = rtcClient.createVideoTrack()
val nativeTrack: org.webrtc.VideoTrack = videoTrack.getNative()

// 入力ビデオフレームをレンダリングするためのサーフェスを作成
val renderer = org.webrtc.SurfaceViewRenderer()
renderer.init(eglBase.eglBaseContext, null)

// ビデオレンダリングを開始
videoTrack.addSink(renderer)

// ビデオレンダリングを停止
videoTrack.removeSink(renderer)
renderer.release()
```

</TabItem>

<TabItem title="iOS" group-key="ios">

```kotlin
val videoTrack = rtcClient.createVideoTrack()
val nativeTrack: RTCVideoTrack = videoTrack.getNative()

// 入力ビデオフレームをレンダリングするためのサーフェスを作成
val videoView = RTCMTLVideoView() // iOS UIKit View

// ビデオレンダリングを開始
nativeTrack.addRenderer(videoView)

// ビデオレンダリングを停止
nativeTrack.removeRenderer(videoView)
```

`WebRTC-SDK` APIを使用するには、手動でインストールする必要があります：

```kotlin
// build.gradle.kts
kotlin {
    cocoapods {
        pod("WebRTC-SDK") {
            version = "137.7151.04" // またはそれ以降
            // デフォルトのモジュール名は `WebRTC-SDK` です。便宜上変更できます。
            moduleName = "WebRTC"
            packageName = "WebRTC"
        }
    }
}
```

</TabItem>
</Tabs>

```kotlin
// AndroidおよびiOSでは、音声トラックの再生は `getNative()` を使用せずに開始/停止できます。
// ブラウザでは、引き続き undefined 要素を作成する必要があります。

val audio = rtcClient.createAudioTrack()
// 音声再生を開始
audio.enable(true)
// 音声再生を停止
audio.enable(false)
```

> これらのスニペットは Compose Multiplatform で使用できますが、そのライフサイクルは考慮されていません。完全な統合については、[Ktor Chat](https://github.com/ktorio/ktor-chat) の例を参照してください。
{style="note"}

## 制限事項

WebRTCクライアントは実験的であり、以下の制限事項があります：

- シグナリングは含まれていません。独自のシグナリング（WebSocketやHTTPなど）を実装する必要があります。
- サポートされているプラットフォームは JavaScript/Wasm、Android、および iOS です。JVMデスクトップおよびKotlin/Nativeのサポートは将来のリリースで計画されています。
- 権限（Permissions）はアプリケーションで処理する必要があります。ブラウザはユーザーにマイクとカメラへのアクセスを促しますが、AndroidとiOSでは実行時の権限リクエストが必要です。
- 基本的な音声およびビデオトラックのみがサポートされています。画面共有、デバイス選択、サイマルキャスト（simulcast）、および高度なRTP機能はまだ利用できません。
- 接続統計（Connection statistics）は利用可能ですが、プラットフォーム間で異なり、統一されたスキーマに従っていません。