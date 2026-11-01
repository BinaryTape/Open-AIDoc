[//]: # (title: WebRTC クライアント)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-client-webrtc"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.webrtc"/>
<tldr>
    <p>
        <b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
    </p>
    <p>
        <b>サポートされているプラットフォーム</b>: JS/Wasm, Android, iOS, JVM
    </p>   
    <p>
        <b>コード例</b>: <a href="https://github.com/ktorio/ktor-chat/">ktor-chat</a>
    </p>
</tldr>
<link-summary>
    WebRTC クライアントにより、マルチプラットフォームプロジェクトでリアルタイムのピアツーピア通信が可能になります。
</link-summary>

Web Real-Time Communication（WebRTC）は、ブラウザやネイティブアプリでリアルタイムのピアツーピア（Peer-to-Peer）通信を行うための一連の標準規格および API です。

Ktor の WebRTC クライアントを使用すると、マルチプラットフォームプロジェクトでリアルタイムのピアツーピア通信を実現できます。WebRTC を活用することで、以下のような機能を構築できます：

* ビデオ通話および音声通話
* マルチプレイヤーゲーム
* ホワイトボードやエディタなどの共同作業用アプリケーション
* クライアント間の低遅延データ送受信

## 依存関係の追加 {id="add-dependencies"}

`WebRtcClient` を使用するには、ビルドスクリプトに `%artifact_name%` アーティファクトを含める必要があります：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## クライアントの作成 {id="create-a-client"}

`WebRtcClient` を作成する際は、ターゲットプラットフォームに基づいてエンジンを選択します：

* JS/Wasm: `JsWebRtc` はブラウザの [WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API) および [Media Capture and Streams](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API) API を使用します。
* Android: `AndroidWebRtc` は事前コンパイルされた [Stream WebRTC library for Android](https://github.com/GetStream/webrtc-android) および Android のメディア API を使用します。
* iOS: `IosWebRtc` は [WebRTC SDK](https://github.com/webrtc-sdk) およびネイティブの [AVFoundation](https://developer.apple.com/documentation/avfoundation) フレームワークを使用します。
* JVM: `JvmWebRtc` は [webrtc-java](https://github.com/devopvoid/webrtc-java) によって提供されるネイティブ WebRTC バインディングを使用します。

その後、`HttpClient` と同様にプラットフォーム固有の設定を指定できます。[ICE](#ice) が正常に機能するためには STUN/TURN サーバーが必要です。[coturn](https://github.com/coturn/coturn) などの既存のソリューションを使用できます：

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
    context = appContext // 必須: Android context の指定
    defaultConnectionConfig = {
        iceServers = listOf(WebRtc.IceServer("stun:stun.l.google.com:19302"))
    }
}
```

</TabItem>

<TabItem title="iOS" group-key="ios">

```kotlin
val iosClient = WebRtcClient(IosWebRtc) {
    // 同様の設定（追加の context は不要）
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

## 接続の作成と SDP ネゴシエーション {id="create-a-connection-and-negotiate-sdp"}

`WebRtcClient` を作成したら、次のステップとしてピア接続（Peer connection）を作成します。
ピア接続は、2 つのクライアント間のリアルタイム通信を管理する中核となるオブジェクトです。

接続を確立するために、WebRTC は Session Description Protocol（SDP）を使用します。これには次の 3 つのステップが含まれます：

1. 一方のピア（発信者 / Caller）がオファー（Offer）を作成します。
2. もう一方のピア（着信者 / Callee）がアンサー（Answer）で応答します。
3. 双方が互いの記述（Description）を適用してセットアップを完了します。

```kotlin
// 発信者が接続とオファーを作成
val caller = jsClient.createPeerConnection()
val offer = caller.createOffer()
caller.setLocalDescription(offer)
// シグナリング機構を介して offer.sdp をリモートピアに送信

// 着信者がオファーを受信してアンサーを作成
val callee = jsClient.createPeerConnection()
callee.setRemoteDescription(
    WebRtc.SessionDescription(WebRtc.SessionDescriptionType.OFFER, remoteOfferSdp)
)
val answer = callee.createAnswer()
callee.setLocalDescription(answer)
// シグナリングを介して answer.sdp を発信者に返信

// 発信者がアンサーを適用
caller.setRemoteDescription(
    WebRtc.SessionDescription(WebRtc.SessionDescriptionType.ANSWER, remoteAnswerSdp)
)
```

## ICE Candidate の交換 {id="ice"}

SDP ネゴシエーションが完了しても、ピア同士がネットワークを越えてどのように接続するかを見つけ出す必要があります。[Interactive Connectivity Establishment (ICE)](https://ja.wikipedia.org/wiki/Interactive_Connectivity_Establishment) により、ピアはお互いへのネットワーク経路を発見できます。

* 各ピアは自身の ICE Candidate を収集します。
* これらの Candidate は、選択したシグナリングチャネルを通じて相手のピアに送信される必要があります。
* 双方が互いの Candidate を追加すると、接続が確立可能になります。

```kotlin
// ローカル Candidate の収集と送信
scope.launch {
    caller.iceCandidates.collect { candidate ->
        // candidate.candidate, candidate.sdpMid, candidate.sdpMLineIndex をリモートピアに送信
    }
}

// リモート Candidate の受信と追加
callee.addIceCandidate(WebRtc.IceCandidate(candidateString, sdpMid, sdpMLineIndex))

// 必要に応じて、すべての Candidate が収集されるまで待機
callee.awaitIceGatheringComplete()
```

> Ktor はシグナリング機能を提供していません。オファー、アンサー、および ICE Candidate の交換には、WebSockets、HTTP、またはその他のトランスポートを使用してください。
> 
{style="note"}

## データチャネルの使用 {id="use-a-data-channel"}

WebRTC はデータチャネル（Data channel）をサポートしており、ピア間で任意のメッセージを交換できます。これは、チャット、マルチプレイヤーゲーム、共同作業ツール、またはクライアント間の低遅延メッセージングに役立ちます。

### チャネルの作成 {id="creating-a-channel"}

一方の側でチャネルを作成するには、`.createDataChannel()` メソッドを使用します：

```kotlin
val channel = caller.createDataChannel("chat")
```

その後、もう一方の側でデータチャネルのイベントをリッスンできます：

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

`DataChannelEvent` は以下のイベントを表すことができます：

* `Open`: チャネルがデータの送受信準備を完了しました。
* `Closing`: チャネルがクローズ処理を開始しました。
* `Closed`: チャネルがクローズされました。
* `BufferedAmountLow`: バッファリングされた送信データの量が `bufferedAmountLowThreshold` 以下に減少しました。
* `Error`: チャネルでエラーが発生しました。このイベントは JVM では発行されません。送信エラーの場合は、代わりに `WebRtc.IOException` がスローされます。

`BufferedAmountLow` を受信するには、チャネルにしきい値を設定します：

```kotlin
channel.setBufferedAmountLowThreshold(16 * 1024)
```

### メッセージの送受信 {id="sending-and-receiving-messages"}

チャネルは、Kotlin 開発者にとって馴染みのある `Channel` に似た API を使用します：

```kotlin
// メッセージの送信
scope.launch { channel.send("hello") }

// メッセージの受信
scope.launch { println("received: " + channel.receiveText()) }
```

## メディアトラックの追加と監視 {id="add-and-observe-media-tracks"}

データチャネルに加えて、WebRTC は音声と映像のためのメディアトラックをサポートしています。これにより、ビデオ通話や画面共有などのアプリケーションを構築できます。

### ローカルトラックの作成 {id="creating-local-tracks"}

ローカルデバイス（マイク、カメラ）からの音声トラックや映像トラックをリクエストできます：

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

メディアキャプチャはプラットフォーム固有です：

* Web では、`navigator.mediaDevices.getUserMedia` を使用します。
* Android では、Camera2 API を使用します。カメラとマイクのパーミッションは個別にリクエストする必要があります。
* iOS では、AVFoundation API を使用します。こちらも必要なパーミッションを個別にリクエストする必要があります。
* JVM では、システムのカメラとマイクにアクセスするために [webrtc-java](https://github.com/devopvoid/webrtc-java) を使用します。オペレーティングシステムがユーザーに許可を求めるプロンプトを表示する場合があります。

クライアントは、指定された制約（Constraints）に基づいて最も適切なメディアデバイスを選択します。適切なデバイスが利用できない場合は、`WebRtcMedia.DeviceException` をスローします。

> `WebRtcClient`、`WebRtcPeerConnection`、`WebRtcMedia.Track` などのインターフェースは `AutoCloseable` を実装しています。リソースが不要になったら `close()` 関数を呼び出して解放してください。
> 
{style="note"}

### リモートトラックの受信 {id="receiving-remote-tracks"}

リモートメディアトラックをリッスンすることもできます：

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

## プラットフォーム固有のロジック {id="platform-specific-logic"}

この API は高水準の抽象化を提供しますが、プラットフォーム固有の API へのアクセスが必要となるユースケースもあります。
`.getNative()` 拡張関数を使用して、基盤となる実装を取得できます。
iOS の `WebRTC-SDK` CocoaPod を除き、プラットフォーム固有のライブラリは推移的ライブラリ（Transitive libraries）として公開されます。

<Tabs group="platform" id="platform-specific-logic-tabs">
<TabItem title="JS/Wasm" group-key="js-wasm">

```kotlin
// DOM API は `kotlin-wrappers` からインポートされます

val videoTrack = rtcClient.createVideoTrack()
val jsStream = MediaStream().apply {
    val nativeTrack: MediaStreamTrack = videoTrack.getNative()
    addTrack(nativeTrack)
}

// 映像のレンダリングを開始
val videoElement = document.createElement("video") as HTMLVideoElement
videoElement.srcObject = jsStream
videoElement.autoplay = true

// 映像のレンダリングを停止
videoElement.srcObject = null
```

</TabItem>
<TabItem title="Android" group-key="android">

```kotlin
val eglBase = org.webrtc.EglBase.create() // アプリ内で一意である必要があります

val videoTrack = rtcClient.createVideoTrack()
val nativeTrack: org.webrtc.VideoTrack = videoTrack.getNative()

// 受信したビデオフレームをレンダリングするためのサーフェスを作成
val renderer = org.webrtc.SurfaceViewRenderer()
renderer.init(eglBase.eglBaseContext, null)

// 映像のレンダリングを開始
videoTrack.addSink(renderer)

// 映像のレンダリングを停止
videoTrack.removeSink(renderer)
renderer.release()
```

</TabItem>

<TabItem title="iOS" group-key="ios">

```kotlin
val videoTrack = rtcClient.createVideoTrack()
val nativeTrack: RTCVideoTrack = videoTrack.getNative()

// 受信したビデオフレームをレンダリングするためのサーフェスを作成
val videoView = RTCMTLVideoView() // iOS UIKit View

// 映像のレンダリングを開始
nativeTrack.addRenderer(videoView)

// 映像のレンダリングを停止
nativeTrack.removeRenderer(videoView)
```

`WebRTC-SDK` API を使用するには、手動でインストールする必要があります：

```kotlin
// build.gradle.kts
kotlin {
    cocoapods {
        pod("WebRTC-SDK") {
            version = "137.7151.04" // またはそれ以降
            // デフォルトのモジュール名は `WebRTC-SDK` ですが、利便性のために変更できます
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

// 組み込みのビデオビューはありません。シンクをアタッチし、
// Swing、JavaFX、Compose、またはその他の UI ツールキットでフレームをレンダリングします。
nativeTrack.addSink { frame ->
    // frame.buffer を UI に描画し、その後 frame.release() を呼び出します
}
```

</TabItem>
</Tabs>

```kotlin
// Android、iOS、および JVM では、`getNative()` を使用せずに音声トラックの再生を開始/停止できます
// ブラウザでは、引き続き <audio/> 要素を作成する必要があります。

val audio = rtcClient.createAudioTrack()
// 音声の再生を開始
audio.enable(true)
// 音声の再生を停止
audio.enable(false)
```

> これらのスニペットは Compose Multiplatform で使用できますが、そのライフサイクルは考慮されていません。完全な統合方法については、[Ktor Chat](https://github.com/ktorio/ktor-chat) のサンプルを参照してください。
> 
{style="note"}

## 制限事項 {id="limitations"}

WebRTC クライアントは実験段階（Experimental）であり、以下の制限事項があります：

* **シグナリング:** シグナリング機能は含まれていません。WebSockets や HTTP などを使用して個別に実装する必要があります。
* **プラットフォームサポート:** クライアントは JavaScript/Wasm、Android、iOS、および JVM デスクトップをサポートしています。Kotlin/Native のサポートは将来のリリースで予定されています。
* **パーミッション:** パーミッションの管理はアプリケーション側で行う必要があります。ブラウザはマイクとカメラのアクセスについてユーザーに確認を求めます。Android と iOS ではランタイムパーミッションのリクエストが必要です。JVM では、カメラとマイクへのアクセス権限はオペレーティングシステムレベルで付与されます。
* **JVM の制限事項:** Candidate のプリフェッチはサポートされていません。`iceCandidatePoolSize` は `0` にするか省略する必要があります。`facingMode`、`aspectRatio`、`resizeMode` のビデオ制約はサポートされておらず、設定すると例外がスローされます。`DataChannelEvent.Error` は発行されません。
* **メディア機能:** 基本的な音声および映像トラックのみがサポートされています。画面共有、デバイス選択、サイマルキャスト（Simulcast）、および高度な RTP 機能はまだ利用できません。
* **接続統計:** 統計情報は利用可能ですが、プラットフォームごとに異なり、統一されたスキーマには従っていません。