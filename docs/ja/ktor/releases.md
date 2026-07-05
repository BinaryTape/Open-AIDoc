[//]: # (title: Ktorのリリース)

<show-structure for="chapter" depth="2"/>

Ktorは[セマンティック バージョニング](https://semver.org/)に従っています：

- _メジャーバージョン_ (x.0.0) には、互換性のないAPIの変更が含まれます。
- _マイナーバージョン_ (x.y.0) では、後方互換性のある新機能が提供されます。
- _パッチバージョン_ (x.y.z) には、後方互換性のある修正が含まれます。

メジャーおよびマイナーリリースごとに、新機能がリリースされる前に試用できるプレビュー（EAP）バージョンもいくつか提供されます。詳細は[アーリーアクセスプログラム](https://ktor.io/eap/)をご覧ください。

## Gradleプラグイン {id="gradle"}

[Gradle Ktorプラグイン](https://github.com/ktorio/ktor-build-plugins)とフレームワークは同じリリースサイクルにあります。
すべてのプラグインリリースは[Gradle Plugin Portal](https://plugins.gradle.org/plugin/io.ktor.plugin)で確認できます。

## IntelliJ Ultimateプラグイン {id="intellij"}

[IntelliJ Ktorプラグイン](https://www.jetbrains.com/help/idea/ktor.html)はKtorフレームワークとは独立してリリースされ、[IntelliJ IDEA Ultimate](https://www.jetbrains.com/idea/download/other.html)と同じリリースサイクルを採用しています。

### 新しいリリースへのアップデート {id="update"}

IntelliJ Ktorプラグインを使用すると、Ktorプロジェクトを最新バージョンに移行できます。
詳細は[プロジェクトの移行](https://www.jetbrains.com/help/idea/ktor.html#migrate)セクションからご確認いただけます。

## リリースの詳細 {id="release-details"}

以下の表は、最新のKtorリリースの詳細をまとめたものです。

<table>

<tr>
<td>バージョン</td><td>リリース日</td><td>ハイライト</td>
</tr>

<tr>
<td>3.5.1</td><td>2026年6月26日</td><td>
<p>
OpenAPIプラグインの改善、認証のKDocドキュメントの拡充、およびKotlin 2.4コンパイラの互換性、HTTPおよびキャッシュの動作、認証、WebRTCの安定性、さらにJVM、Darwin、Android、Windowsにおけるプラットフォーム固有の問題を含む、広範なバグ修正を盛り込んだパッチリリースです。
</p>
<var name="version" value="3.5.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>3.5.0</td><td>2026年5月15日</td><td>
<p>
RFC 7616 Digest認証のサポート、OkHttpおよびApache5向けのカスタムDNSリゾルバー設定、リクエストパラメータのヘルパー関数、および設定、セッション、JavaScript互換性にわたるその他の改善を導入したマイナーリリースです。
詳細は「<Links href="/ktor/whats-new-350" summary="undefined">Ktor 3.5.0の新機能</Links>」をご覧ください。
</p>
<var name="version" value="3.5.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>3.4.3</td><td>2026年4月22日</td><td>
<p>
OpenAPIスキーマ推論、クライアントエンジンのライフサイクル問題、およびいくつかの並行性とプラットフォーム固有のバグ修正に焦点を当てた、安定性重視のパッチリリースです。
</p>
<var name="version" value="3.4.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>3.4.2</td><td>2026年3月27日</td><td>
<p>
アロケーションの最適化とWebSocketの修正によりクライアントとエンジンのパフォーマンスを向上させ、OpenAPI、ロギング、GraalVMの互換性、Netty、Darwin、依存関係注入（DI）、圧縮、証明書のピン留め、およびKotlin/Nativeにわたる幅広い問題を解決したパッチリリースです。
</p>
<var name="version" value="3.4.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>3.4.1</td><td>2026年3月4日</td><td>
<p>
重要なデグレード（リグレッション）修正を含むパッチリリースです。これには、<a href="whats-new-340.md#use-engine-dispatcher">エンジンディスパッチャーを使用したHttpStatementの実行</a>の解決や、適切な<code>StreamResetException</code>の伝播の復元が含まれます。また、パフォーマンスの向上、OpenAPIの強化、およびエンジンとプラットフォーム全体の複数の安定性修正も含まれています。
</p>
<var name="version" value="3.4.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>3.4.0</td><td>2026年1月23日</td><td>
<p>
ランタイム生成のOpenAPIスペック、ZstdおよびJackson 3のサポート、OkHttpの二重ストリーミング（duplex streaming）を導入したマイナーリリースです。また、フレームワーク全体の信頼性を高める数十のバグ修正も含まれています。
</p>
<var name="version" value="3.4.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>3.3.3</td><td>2025年11月26日</td><td>
<p>
Jetty ClientでのHTTP/2 over cleartext (h2c) サポートの追加、ロギングとOpenAPI生成の改善、エンジン、SSE処理、二重レスポンス、HTTP/2ヘッダー、クライアントキャッシュのバグ修正を含むパッチリリースです。
</p>
<var name="version" value="3.3.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>3.3.2</td><td>2025年11月5日</td><td>
<p>
DarwinでのSOCKSプロキシサポートの追加、WebRTCクライアントターゲットとJavaプロキシ処理の改良、およびHTTPリretry、OpenAPI、キャッシュ、Android上のNettyにおける複数の問題の修正を含むパッチリリースです。
</p>
<var name="version" value="3.3.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>3.3.1</td><td>2025年10月8日</td><td>
<p>
Kotlinを2.2.20に更新し、Content-Length解析エラー、<code>ClientSSESession</code>のシリアライザー欠落、Nettyの設定とシャットダウンのバグなどの複数の問題を修正したパッチリリースです。また、bootJar内での静的リソース提供のサポートも追加されました。
</p>
<var name="version" value="3.3.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>3.3.0</td><td>2025年9月11日</td><td>
<p>
実験的なOpenAPI生成プレビュー、静的コンテンツ処理の改善、AndroidおよびJS/Wasm用のWebRTCクライアント、Jetty、OkHttp、Kotlin 2.2へのアップグレードなどの主要な機能を導入したマイナーリリースです。詳細は「<Links href="/ktor/whats-new-330" summary="undefined">Ktor 3.3.0の新機能</Links>」をご覧ください。
</p>
<var name="version" value="3.3.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>3.2.3</td><td>2025年7月29日</td><td>
<p>
YAML設定処理、DI解決、Wasm/JSの安定性の向上に加え、マルチパート解析、CIOの<code>100 Continue</code>レスポンス形式、<code>ByteReadChannel</code>の無限読み取りループ、サーバーのシャットダウンの問題に関する修正を含むパッチリリースです。
</p>
<var name="version" value="3.2.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>3.2.2</td><td>2025年7月14日</td><td>
<p>
SSEフィールドのシリアル化順序を改善し、CORSプリフライト処理、テストアプリケーションのストリーミング、設定のデシリアライズのバグ、および各プラットフォーム（3.2.1からのwasmJsやDarwinターゲットに影響するデグレードを含む）でのヘッダー欠落の問題を解決したパッチリリースです。
</p>
<var name="version" value="3.2.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>3.2.1</td><td>2025年7月4日</td><td>
<p>
Time API、テンプレート作成、パブリッシングの改善に加え、プラグインの動作、Netty、OkHttp、および3.2.0で導入された起動時の問題に関する重要なバグ修正を含むパッチリリースです。
</p>
<var name="version" value="3.2.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>3.2.0</td><td>2025年6月12日</td><td>
<p>
型付き設定のデシリアライズ、新しい依存関係注入（DI）およびHTMXモジュール、Gradleバージョンカタログのサポート、およびsuspendモジュールのサポートを導入したマイナーリリースです。詳細は「<Links href="/ktor/whats-new-320" summary="undefined">Ktor 3.2.0の新機能</Links>」をご覧ください。
</p>
<var name="version" value="3.2.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>3.1.3</td><td>2025年5月5日</td><td><p>
バイト操作やマルチパート処理の高速化などのパフォーマンス向上、およびより安全なトークンリフレッシュ処理を含むパッチリリースです。メトリクスのメモリ問題の修正、ヘッダー動作の改善、WebSockets、OkHttp、Apache5、Nettyのバグ修正に加え、Kotlin 2.1.0サポートのためのJTEの更新も行われました。
</p>
<var name="version" value="3.1.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>3.1.2</td><td>2025年3月27日</td><td><p>
Kotlinを2.1.20に更新し、Base64デコード、認証トークンのクリア、Androidサーバーの起動エラー、WebSocketヘッダーのフォーマット、SSEセッションのキャンセルなど、さまざまな問題を修正したパッチリリースです。
</p>
<var name="version" value="3.1.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>3.1.1</td><td>2025年2月24日</td><td><p>
ロギングの改善とWebSocketのタイムアウト処理の修正を行ったパッチリリースです。HTTPキャッシュの不整合、フォームデータのコピーエラー、gzip処理のクラッシュ、セグメントプールの破損を引き起こす並行性の問題など、複数のバグを修正しました。
</p>
<var name="version" value="3.1.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>3.1.0</td><td>2025年2月11日</td><td><p>
さまざまなSSE機能と拡張されたCIOエンジンおよびWebSocketサポートを導入したマイナーリリースです。プラットフォームの互換性、ロギング、認証を強化し、バイトチャネル処理、HTTPリクエストの失敗、並行性の問題に関連する重要なバグを修正しました。
</p>
<var name="version" value="3.1.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>3.0.3</td><td>2024年12月18日</td><td><p>
<code>browserProductionWebpack</code>のビルドエラー、gzip圧縮コンテンツの処理、<code>FormFieldLimit</code>設定の上書きなどの修正を含むパッチリリースです。コアのパフォーマンス向上とテストアプリケーションの適切なシャットダウンも含まれています。
</p>
<var name="version" value="3.0.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>3.0.2</td><td>2024年12月4日</td><td><p>
レスポンスの破損、ボディの切り捨て、接続処理、誤ったヘッダーに関連する複数のバグ修正に加え、バイナリエンコーディングのサポート拡張とAndroid向けのパフォーマンス強化を含むパッチリリースです。
</p>
<var name="version" value="3.0.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>2.3.13</td><td>2024年11月20日</td><td><p>
バグ修正、セキュリティパッチ、および改善を含むパッチリリースです。これには<code>watchosDeviceArm64</code>ターゲットのサポート追加が含まれます。
</p>
<var name="version" value="2.3.13"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>3.0.1</td><td>2024年10月29日</td><td><p>
クライアントとサーバーのロギングの改善、および各種バグ修正を含むパッチリリースです。
</p>
<var name="version" value="3.0.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0</td><td>2024年10月9日</td><td><p>
Android Nativeターゲットのサポート追加を含む、改善とバグ修正を盛り込んだメジャーリリースです。
破壊的変更の詳細については、<Links href="/ktor/migrating-3" summary="undefined">移行ガイド</Links>をご覧ください。
</p>
<var name="version" value="3.0.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-rc-2</td><td>2024年10月2日</td><td><p>
破壊的変更、バグ修正、およびXMLのマルチプラットフォームサポートなどの機能を含む、メジャーリリースの候補（RC）版です。
</p>
<var name="version" value="3.0.0-rc-2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-rc-1</td><td>2024年9月9日</td><td><p>
重要な改善とバグ修正を含むメジャーリリースの候補（RC）版です。このアップデートでは、後方互換性が強化され、<code>staticZip</code>のサポートが拡張されました。
</p>
<var name="version" value="3.0.0-rc-1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-beta-2</td><td>2024年7月15日</td><td><p>
SSEサポートの改善やKotlin/Wasm用のKtorクライアントなど、さまざまな改善とバグ修正を含むメジャープレリリース版です。
</p>
<var name="version" value="3.0.0-beta-2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>2.3.12</td><td>2024年6月20日</td><td><p>
Ktor CoreとKtor Serverのバグ修正、およびNetty and OpenAPIのバージョン更新を含むパッチリリースです。
</p>
<var name="version" value="2.3.12"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>2.3.11</td><td>2024年5月9日</td><td><p>
テストクライアントのエンジンにソケットタイムアウトを適用するためのバグ修正を含むパッチリリースです。
</p>
<var name="version" value="2.3.11"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>2.3.10</td><td>2024年4月8日</td><td><p>
CallLoggingおよびSSEサーバープラグインの各種バグ修正、Androidクライアントのロギング改善などを含むパッチリリースです。
</p>
<var name="version" value="2.3.10"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>2.3.9</td><td>2024年3月4日</td><td><p>
ContentNegotiationクライアントプラグインのバグ修正と、HTTP経由でのセキュアクッキー送信のサポート追加を含むパッチリリースです。
</p>
<var name="version" value="2.3.9"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>2.3.8</td><td>2024年1月31日</td><td><p>
URLBuilder、CORS、およびWebSocketプラグインの各種バグ修正を含むパッチリリースです。
</p>
<var name="version" value="2.3.8"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>2.3.7</td><td>2023年12月7日</td><td>
<p>
ContentNegotiation、WebSocketsのバグ修正、およびNative Serverでのメモリ使用量の改善を含むパッチリリースです。
</p>
<var name="version" value="2.3.7"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-beta-1</td><td>2023年11月23日</td><td>
<p>
クライアントおよびサーバーのSSEサポートを含む、さまざまな改善とバグ修正を盛り込んだメジャープレリリース版です。
</p>
<var name="version" value="3.0.0-beta-1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>2.3.6</td><td>2023年11月7日</td><td>
<p>
2.3.5での破壊的変更の修正およびその他の各種バグ修正を含むパッチリリースです。
</p>
<var name="version" value="2.3.6"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>2.3.5</td><td>2023年10月5日</td><td>
<p>
DarwinおよびApache5エンジンの設定に関する修正を含むパッチリリースです。
</p>
<var name="version" value="2.3.5"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>2.3.4</td><td>2023年8月31日</td><td>
<p>
HTTP CookieヘッダーとNoTransformationFoundExceptionエラーのバグ修正を含むパッチリリースです。
</p>
<var name="version" value="2.3.4"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>2.3.3</td><td>2023年8月1日</td><td>
<p>
<code>linuxArm64</code>のクライアントおよびサーバーのサポートと、各種バグ修正を含むパッチリリースです。
</p>
<var name="version" value="2.3.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>2.3.2</td><td>2023年6月28日</td><td>
<p>
Kotlinバージョンを<code>1.8.22</code>にアップグレードし、各種バグ修正を行ったパッチリリースです。
</p>
<var name="version" value="2.3.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
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
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>2.3.0</td><td>2023年4月19日</td><td>
<p>
複数の設定ファイルのサポートやRoutingでの正規表現パターンの追加などを行った機能リリースです。
</p>
<var name="version" value="2.3.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>2.2.4</td><td>2023年2月28日</td><td>
<p>
HTTPクライアント、Routing、およびContentNegotiationにおける各種バグ修正を含むパッチリリースです。
</p>
<var name="version" value="2.2.4"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>2.2.3</td><td>2023年1月31日</td><td>
<p>
OAuth2のマルチプラットフォーム機能と各種バグ修正を含むパッチリリースです。
</p>
<var name="version" value="2.2.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>2.2.2</td><td>2023年1月3日</td><td>
<p>
<code>2.2.1</code>のバグ修正、Swaggerプラグインの改善および修正などを含むパッチリリースです。
</p>
<var name="version" value="2.2.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>2.2.1</td><td>2022年12月7日</td><td>
<p>
<code>2.2.0</code>での<code>java.lang.NoClassDefFoundError: kotlinx/atomicfu/AtomicFU</code>エラーを修正するためのパッチリリースです。
</p>
<var name="version" value="2.2.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>2.2.0</td><td>2022年12月7日</td><td>
<p>
Swagger UIホスティング、新しいプラグインAPI、Sessionsのマルチプラットフォームサポートなど、複数の機能を盛り込んだリリースです。
詳細は「<Links href="/ktor/migration-to-22x" summary="undefined">2.0.xから2.2.xへの移行</Links>」ガイドをご覧ください。
</p>
<var name="version" value="2.2.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
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
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>2.1.2</td><td>2022年9月29日</td><td>
<p>
Routing、Testingエンジン、Ktorクライアントのバグ修正を含むパッチリリースです。
</p>
<var name="version" value="2.1.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>2.1.1</td><td>2022年9月6日</td><td>
<p>
Ktorクライアントとサーバーにおける各種バグ修正を含むパッチリリースです。
</p>
<var name="version" value="2.1.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>2.1.0</td><td>2022年8月11日</td><td>
<p>
YAML設定のサポートと、その他のさまざまな改善およびバグ修正を追加したマイナーリリースです。
</p>
<var name="version" value="2.1.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>2.0.3</td><td>2022年6月28日</td><td>
<p>
バグ修正と<code>kotlinx.coroutines</code>バージョンの<code>1.6.2</code>へのアップグレードを含むパッチリリースです。
</p>
<var name="version" value="2.0.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>2.0.2</td><td>2022年5月27日</td><td>
<p>
各種改善、バグ修正、および依存関係のバージョンアップグレードを含むパッチリリースです。
</p>
<var name="version" value="2.0.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>2.0.1</td><td>2022年4月28日</td><td>
<p>
各種バグ修正とKotlinバージョンの<code>1.6.21</code>への更新を行ったパッチリリースです。
</p>
<var name="version" value="2.0.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

<tr>
<td>2.0.0</td><td>2022年4月11日</td><td>
<p>
APIドキュメントの更新とさまざまな新機能を含むメジャーリリースです。破壊的変更および<code>1.x.x</code>からの移行方法については、<Links href="/ktor/migration-to-20x" summary="undefined">移行ガイド</Links>をご覧ください。
</p>
<var name="version" value="2.0.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
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
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHubで変更履歴を確認する</a>
</p>
</td>
</tr>

</table>