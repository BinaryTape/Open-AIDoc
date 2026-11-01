[//]: # (title: Ktorのリリース)

<show-structure for="chapter" depth="2"/>

Ktorは[セマンティックバージョニング](https://semver.org/)（Semantic Versioning）に従っています。

- _メジャーバージョン_ (x.0.0) には、後方互換性のないAPIの変更が含まれます。
- _マイナーバージョン_ (x.y.0) では、後方互換性のある新機能が提供されます。
- _パッチバージョン_ (x.y.z) には、後方互換性のある修正が含まれます。

メジャーおよびマイナーリリースのそれぞれに対して、正式リリース前に新機能をお試しいただけるよう、複数のプレビュー（EAP）バージョンも提供しています。詳細については、[Early Access Program](https://ktor.io/eap/) を参照してください。

## Gradleプラグイン {id="gradle"}

[Gradle Ktorプラグイン](https://github.com/ktorio/ktor-build-plugins)とフレームワークは同じリリースサイクルを採用しています。
すべてのプラグインリリースは [Gradle Plugin Portal](https://plugins.gradle.org/plugin/io.ktor.plugin) で確認できます。

## IntelliJ Ultimateプラグイン {id="intellij"}

[IntelliJ Ktorプラグイン](https://www.jetbrains.com/help/idea/ktor.html)はKtorフレームワークとは独立してリリースされ、[IntelliJ IDEA Ultimate](https://www.jetbrains.com/idea/download/other.html) と同じリリースサイクルを使用します。

### 新しいリリースへのアップデート {id="update"}

IntelliJ Ktorプラグインを使用すると、Ktorプロジェクトを最新バージョンに移行できます。
詳細は [プロジェクトの移行（Migrate projects）](https://www.jetbrains.com/help/idea/ktor.html#migrate) セクションを参照してください。

## リリースの詳細 {id="release-details"}

以下の表は、最新のKtorリリースの詳細をまとめたものです。

<table>

<tr>
<td>バージョン</td><td>リリース日</td><td>ハイライト</td>
</tr>

<tr>
<td>3.6.1</td><td>2026年10月30日</td><td>
<p>
コネクション管理、リクエストのキャンセル、ストリーミング、WebSocket、プラットフォーム固有のエンジンに関する各種の問題を修正し、ルーティング、HTTP準拠性、リソース処理の改善をもたらすパッチリリースです。
</p>
<var name="version" value="3.6.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.6.0</td><td>2026年9月17日</td><td>
<p>
Netty向けの実験的なHTTP/3サポート、Kotlin Multiplatform向けのデフォルトクライアントエンジン、JVM WebRTCサポートのほか、クライアントとサーバーの両方にわたる新機能と改善を追加したマイナーリリースです。
</p>
詳細については、<Links href="whats-new-360.md" summary="">Ktor 3.6.0の新機能</Links> を参照してください。
<var name="version" value="3.6.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.5.2</td><td>2026年8月4日</td><td>
<p>
レート制限サポートの強化、テキスト処理パフォーマンスの回復、I/O処理、OpenAPI、設定に関する問題の修正など、安定性とパフォーマンスに焦点を当てたパッチリリースです。
</p>
<var name="version" value="3.5.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.5.1</td><td>2026年6月26日</td><td>
<p>
OpenAPIプラグインの改善、認証に関するKDocドキュメントの拡充に加え、Kotlin 2.4コンパイラ互換性、HTTPおよびキャッシュの動作、認証、WebRTCの安定性、JVM、Darwin、Android、Windowsにわたるプラットフォーム固有の問題をカバーする広範なバグ修正を含むパッチリリースです。
</p>
<var name="version" value="3.5.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.5.0</td><td>2026年5月15日</td><td>
<p>
RFC 7616 Digest認証のサポート、OkHttpおよびApache5向けのカスタムDNSリゾルバー設定、リクエストパラメータのヘルパー関数の導入に加え、設定、セッション、JavaScript互換性に関する改善を行ったマイナーリリースです。
詳細については、<Links href="whats-new-350.md" summary="">Ktor 3.5.0の新機能</Links> を参照してください。
</p>
<var name="version" value="3.5.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.4.3</td><td>2026年4月22日</td><td>
<p>
OpenAPIスキーマ推論の修正、クライアントエンジンのライフサイクルの問題、並行処理およびプラットフォーム固有のいくつかのバグ修正など、安定性に焦点を当てたパッチリリースです。
</p>
<var name="version" value="3.4.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.4.2</td><td>2026年3月27日</td><td>
<p>
アロケーションの最適化とWebSocketの修正によってクライアントとエンジンのパフォーマンスを向上させるとともに、OpenAPI、ロギング、GraalVM互換性、Netty、Darwin、依存性注入（DI）、圧縮、証明書ピニング、Kotlin/Nativeにわたる幅広い問題に対処したパッチリリースです。
</p>
<var name="version" value="3.4.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.4.1</td><td>2026年3月4日</td><td>
<p>
<a href="whats-new-340.md#use-engine-dispatcher">3.4.0で導入されたFlow不変条件エラーの解決</a>や、適切な<code>StreamResetException</code>の伝播の復元など、重要なリグレッション修正を含むパッチリリースです。また、パフォーマンスの向上、OpenAPIの強化、エンジンやプラットフォーム全般にわたる複数の安定性修正も含まれています。
</p>
<var name="version" value="3.4.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.4.0</td><td>2026年1月23日</td><td>
<p>
ランタイム生成によるOpenAPI仕様、ZstdおよびJackson 3のサポート、OkHttp向け全二重ストリーミング（Duplex streaming）の導入に加え、フレームワーク全体の信頼性を強化する多数のバグ修正を含むマイナーリリースです。
</p>
<var name="version" value="3.4.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.3.3</td><td>2025年11月26日</td><td>
<p>
Jetty ClientでのHTTP/2 over cleartext（h2c）サポートの追加、ロギングとOpenAPI生成の改善、ならびにエンジン、SSE処理、二重レスポンス、HTTP/2ヘッダー、クライアントキャッシュにおけるバグ修正を行ったパッチリリースです。
</p>
<var name="version" value="3.3.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.3.2</td><td>2025年11月5日</td><td>
<p>
Darwin向けのSOCKSプロキシサポートの追加、WebRTCクライアントターゲットおよびJavaプロキシ処理の改善、ならびにHTTPリトライ、OpenAPI、キャッシュ、Android上でのNettyにおける複数の問題の修正を行ったパッチリリースです。
</p>
<var name="version" value="3.3.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.3.1</td><td>2025年10月8日</td><td>
<p>
Kotlinを2.2.20にアップデートし、Content-Lengthのパースエラー、<code>ClientSSESession</code>のシリアライザー欠落、Nettyの設定およびシャットダウンに関するバグなど複数の問題を修正したほか、bootJar内での静的リソース提供のサポートを追加したパッチリリースです。
</p>
<var name="version" value="3.3.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.3.0</td><td>2025年9月11日</td><td>
<p>
実験的なOpenAPI生成プレビュー、静的コンテンツ処理の改善、AndroidおよびJS/Wasm向けWebRTCクライアント、Jetty、OkHttp、Kotlin 2.2へのアップグレードなどの主要機能を導入したマイナーリリースです。詳細については、<Links href="whats-new-330.md" summary="">Ktor 3.3.0の新機能</Links> を参照してください。
</p>
<var name="version" value="3.3.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.2.3</td><td>2025年7月29日</td><td>
<p>
YAML設定処理、DI解決、Wasm/JSの安定性の向上に加え、マルチパートのパース、CIOの <code>100 Continue</code> レスポンスのフォーマット、<code>ByteReadChannel</code> での無限読み込みループ、サーバーのシャットダウンに関する問題の修正を行ったパッチリリースです。
</p>
<var name="version" value="3.2.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.2.2</td><td>2025年7月14日</td><td>
<p>
SSEフィールドのシリアライズ順序を改善し、CORSプリフライト処理、テストアプリケーションのストリーミング、設定のデシリアライズのバグ、3.2.1で発生したwasmJsおよびDarwinターゲットに影響するリグレッションを含むプラットフォーム間のヘッダー欠落など、複数の問題を解決したパッチリリースです。
</p>
<var name="version" value="3.2.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.2.1</td><td>2025年7月4日</td><td>
<p>
Time API、テンプレート機能、パブリッシングの改善に加え、プラグインの挙動、Netty、OkHttp、および3.2.0で導入された起動時の問題に関する重要なバグ修正を含むパッチリリースです。
</p>
<var name="version" value="3.2.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.2.0</td><td>2025年6月12日</td><td>
<p>
型安全な設定のデシリアライズ、新しい依存性注入（DI）およびHTMXモジュール、Gradleバージョンカタログのサポート、suspendモジュールのサポートを導入したマイナーリリースです。詳細については、<Links href="whats-new-320.md" summary="">Ktor 3.2.0の新機能</Links> を参照してください。
</p>
<var name="version" value="3.2.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.1.3</td><td>2025年5月5日</td><td><p>
高速なバイト操作やマルチパート処理、より安全なトークンリフレッシュ処理などのパフォーマンス向上を含むパッチリリースです。また、メトリクスのメモリ問題の修正、ヘッダーの挙動の改善、WebSockets、OkHttp、Apache5、Nettyにわたるバグ修正、さらにKotlin 2.1.0サポートのためのJTEアップデートも行われています。
</p>
<var name="version" value="3.1.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.1.2</td><td>2025年3月27日</td><td><p>
Kotlinを2.1.20にアップデートし、Base64デコード、認証トークンのクリア、Androidサーバーの起動エラー、WebSocketヘッダーのフォーマット、SSEセッションのキャンセルなど、さまざまな問題を修正したパッチリリースです。
</p>
<var name="version" value="3.1.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.1.1</td><td>2025年2月24日</td><td><p>
ロギングの改善とWebSocketタイムアウト処理の修正を行ったパッチリリースです。HTTPキャッシュの不整合、フォームデータのコピーエラー、gzip処理のクラッシュ、セグメントプールの破損を引き起こす並行処理の問題など、複数のバグを修正しています。
</p>
<var name="version" value="3.1.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.1.0</td><td>2025年2月11日</td><td><p>
さまざまなSSE機能、CIOエンジンの拡張、WebSocketサポートを導入したマイナーリリースです。プラットフォーム互換性、ロギング、認証を強化するとともに、バイトチャネル処理、HTTPリクエストの失敗、並行処理の問題に関連する重要なバグを修正しています。
</p>
<var name="version" value="3.1.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.0.3</td><td>2024年12月18日</td><td><p>
<code>browserProductionWebpack</code> におけるビルドエラーの解消、gzip圧縮コンテンツの処理、<code>FormFieldLimit</code> 設定の上書きなど、各種のバグ修正を含むパッチリリースです。コアのパフォーマンス向上やテストアプリケーションの適切なシャットダウン処理も含まれています。
</p>
<var name="version" value="3.0.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.0.2</td><td>2024年12月4日</td><td><p>
レスポンスの破損、ボディの切り捨て、コネクション処理、不正なヘッダーに関する複数のバグ修正と、拡張バイナリエンコーディングサポートおよびAndroid向けのパフォーマンス改善を行ったパッチリリースです。
</p>
<var name="version" value="3.0.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.3.13</td><td>2024年11月20日</td><td><p>
バグ修正、セキュリティパッチ、および改善を含み、<code>watchosDeviceArm64</code> ターゲットのサポートが追加されたパッチリリースです。
</p>
<var name="version" value="2.3.13"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.0.1</td><td>2024年10月29日</td><td><p>
クライアントおよびサーバーのロギングの改善と、各種バグ修正を含むパッチリリースです。
</p>
<var name="version" value="3.0.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0</td><td>2024年10月9日</td><td><p>
Android Nativeターゲットのサポート追加など、改善とバグ修正を含むメジャーリリースです。
破壊的変更の詳細については、<Links href="migrating-3.md" summary="">移行ガイド</Links> を参照してください。
</p>
<var name="version" value="3.0.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-rc-2</td><td>2024年10月2日</td><td><p>
XMLのマルチプラットフォームサポートなど、破壊的変更を伴う各種改善、バグ修正、新機能を含むメジャーリリースカンディデート（RC）です。
</p>
<var name="version" value="3.0.0-rc-2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-rc-1</td><td>2024年9月9日</td><td><p>
大幅な改善とバグ修正を含むメジャーリリースカンディデート（RC）です。後方互換性が強化され、<code>staticZip</code> サポートが拡張されています。
</p>
<var name="version" value="3.0.0-rc-1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-beta-2</td><td>2024年7月15日</td><td><p>
SSEサポートの改善やKotlin/Wasm向けKtorクライアントなど、各種の改善とバグ修正を含むメジャープレリリースバージョンです。
</p>
<var name="version" value="3.0.0-beta-2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.3.12</td><td>2024年6月20日</td><td><p>
Ktor CoreおよびKtor Serverのバグ修正や、NettyおよびOpenAPIのバージョン更新を含むパッチリリースです。
</p>
<var name="version" value="2.3.12"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.3.11</td><td>2024年5月9日</td><td><p>
Test Clientのエンジンへのソケットタイムアウト適用に関するバグ修正を含むパッチリリースです。
</p>
<var name="version" value="2.3.11"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.3.10</td><td>2024年4月8日</td><td><p>
CallLoggingおよびSSEサーバープラグインに関する各種バグ修正、Androidクライアントのロギング改善などを含むパッチリリースです。
</p>
<var name="version" value="2.3.10"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.3.9</td><td>2024年3月4日</td><td><p>
ContentNegotiationクライアントプラグインのバグ修正や、HTTP経由でのセキュアクッキー送信のサポート追加を含むパッチリリースです。
</p>
<var name="version" value="2.3.9"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.3.8</td><td>2024年1月31日</td><td><p>
URLBuilder、CORS、WebSocketプラグインに関する各種バグ修正を含むパッチリリースです。
</p>
<var name="version" value="2.3.8"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.3.7</td><td>2023年12月7日</td><td>
<p>
ContentNegotiation、WebSockets、およびNative Serverでのメモリ使用量に関するバグ修正を含むパッチリリースです。
</p>
<var name="version" value="2.3.7"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-beta-1</td><td>2023年11月23日</td><td>
<p>
クライアントおよびサーバーのSSEサポートなど、各種の改善とバグ修正を含むメジャープレリリースバージョンです。
</p>
<var name="version" value="3.0.0-beta-1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.3.6</td><td>2023年11月7日</td><td>
<p>
2.3.5における破壊的変更の修正や、その他各種のバグ修正を含むパッチリリースです。
</p>
<var name="version" value="2.3.6"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.3.5</td><td>2023年10月5日</td><td>
<p>
DarwinおよびApache5エンジン設定の修正を含むパッチリリースです。
</p>
<var name="version" value="2.3.5"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.3.4</td><td>2023年8月31日</td><td>
<p>
HTTP Cookieヘッダーおよび <code>NoTransformationFoundException</code> エラーに関するバグ修正を含むパッチリリースです。
</p>
<var name="version" value="2.3.4"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.3.3</td><td>2023年8月1日</td><td>
<p>
<code>linuxArm64</code> 向けのクライアントおよびサーバーサポートの追加と、各種バグ修正を含むパッチリリースです。
</p>
<var name="version" value="2.3.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.3.2</td><td>2023年6月28日</td><td>
<p>
Kotlinバージョンを <code>1.8.22</code> にアップグレードし、各種バグ修正を行ったパッチリリースです。
</p>
<var name="version" value="2.3.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.3.1</td><td>2023年5月31日</td><td>
<p>
サーバー設定の改善と各種バグ修正を含むパッチリリースです。
</p>
<var name="version" value="2.3.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.3.0</td><td>2023年4月19日</td><td>
<p>
複数設定ファイルのサポート、Routingでの正規表現パターンの追加などを行った機能追加リリースです。
</p>
<var name="version" value="2.3.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.2.4</td><td>2023年2月28日</td><td>
<p>
HTTPクライアント、Routing、およびContentNegotiationに関する各種バグ修正を含むパッチリリースです。
</p>
<var name="version" value="2.2.4"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.2.3</td><td>2023年1月31日</td><td>
<p>
OAuth2のマルチプラットフォーム機能および各種バグ修正を含むパッチリリースです。
</p>
<var name="version" value="2.2.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.2.2</td><td>2023年1月3日</td><td>
<p>
<code>2.2.1</code> に対するバグ修正、Swaggerプラグインの改善および修正などを含むパッチリリースです。
</p>
<var name="version" value="2.2.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.2.1</td><td>2022年12月7日</td><td>
<p>
<code>2.2.0</code> における <code>java.lang.NoClassDefFoundError: kotlinx/atomicfu/AtomicFU</code> エラーに対応したパッチリリースです。
</p>
<var name="version" value="2.2.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.2.0</td><td>2022年12月7日</td><td>
<p>
Swagger UIのホスティング、新しいプラグインAPI、Sessionsのマルチプラットフォームサポートなどを含む多数の機能追加リリースです。
詳細については、<Links href="migration-to-22x.md" summary="">2.0.xから2.2.xへの移行</Links> ガイドを参照してください。
</p>
<var name="version" value="2.2.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.1.3</td><td>2022年10月26日</td><td>
<p>
各種バグ修正を含むパッチリリースです。
</p>
<var name="version" value="2.1.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.1.2</td><td>2022年9月29日</td><td>
<p>
Routing、Testingエンジン、およびKtorクライアントにおけるバグ修正を含むパッチリリースです。
</p>
<var name="version" value="2.1.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.1.1</td><td>2022年9月6日</td><td>
<p>
Ktorクライアントおよびサーバーにおける各種バグ修正を含むパッチリリースです。
</p>
<var name="version" value="2.1.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.1.0</td><td>2022年8月11日</td><td>
<p>
YAML設定のサポートやその他各種の改善、バグ修正を追加したマイナーリリースです。
</p>
<var name="version" value="2.1.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.0.3</td><td>2022年6月28日</td><td>
<p>
バグ修正と <code>kotlinx.coroutines</code> バージョンの <code>1.6.2</code> へのアップグレードを含むパッチリリースです。
</p>
<var name="version" value="2.0.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.0.2</td><td>2022年5月27日</td><td>
<p>
各種の改善、バグ修正、依存関係のバージョンアップグレードを含むパッチリリースです。
</p>
<var name="version" value="2.0.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.0.1</td><td>2022年4月28日</td><td>
<p>
各種バグ修正とKotlinバージョンの <code>1.6.21</code> への更新を含むパッチリリースです。
</p>
<var name="version" value="2.0.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>2.0.0</td><td>2022年4月11日</td><td>
<p>
APIドキュメントの更新とさまざまな新機能を含むメジャーリリースです。破壊的変更の詳細および <code>1.x.x</code> からの移行方法については、<Links href="migration-to-20x.md" summary="">移行ガイド</Links> を参照してください。
</p>
<var name="version" value="2.0.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

<tr>
<td>1.6.8</td><td>2022年3月15日</td><td>
<p>
依存関係のバージョンアップグレードを含むパッチリリースです。
</p>
<var name="version" value="1.6.8"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubでチェンジログを見る</a>
</p>
</td>
</tr>

</table>