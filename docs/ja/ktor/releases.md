[//]: # (title: Ktor のリリース)

<show-structure for="chapter" depth="2"/>

Ktor は[セマンティック バージョニング](https://semver.org/)（Semantic Versioning）に従います:

- _メジャーバージョン_ (x.0.0): 互換性のない API の変更が含まれます。
- _マイナーバージョン_ (x.y.0): 後方互換性のある新機能が提供されます。
- _パッチバージョン_ (x.y.z): 後方互換性のある修正が含まれます。

メジャーおよびマイナーの各リリースでは、正式リリース前に新機能をお試しいただけるよう、いくつかのプレビュー（EAP）バージョンも提供しています。詳細については、[Early Access Program](https://ktor.io/eap/) を参照してください。

## Gradle プラグイン {id="gradle"}

[Gradle Ktor プラグイン](https://github.com/ktorio/ktor-build-plugins)とフレームワークは同じリリースサイクルです。
すべてのプラグインリリースは [Gradle Plugin Portal](https://plugins.gradle.org/plugin/io.ktor.plugin) で確認できます。

## IntelliJ Ultimate プラグイン {id="intellij"}

[IntelliJ Ktor プラグイン](https://www.jetbrains.com/help/idea/ktor.html)は Ktor フレームワークとは独立してリリースされ、[IntelliJ IDEA Ultimate](https://www.jetbrains.com/idea/download/other.html) と同じリリースサイクルを使用します。

### 新しいリリースへのアップデート {id="update"}

IntelliJ Ktor プラグインを使用すると、Ktor プロジェクトを最新バージョンに移行できます。
詳細については、[Migrate projects](https://www.jetbrains.com/help/idea/ktor.html#migrate) セクションを参照してください。

## リリースの詳細 {id="release-details"}

以下の表は、最新の Ktor リリースの詳細をまとめたものです。

<table>

<tr>
<td>バージョン</td><td>リリース日</td><td>ハイライト</td>
</tr>

<tr>
<td>3.6.0</td><td>2026年9月17日</td><td>
<p>
Netty 向けの実験的 HTTP/3 サポート、Kotlin Multiplatform 向けのデフォルトクライアントエンジン、JVM WebRTC サポート、ならびにクライアントおよびサーバー全般にわたるその他の機能と改善を追加したマイナーリリース。
</p>
詳細については、<Links href="whats-new-360.md" summary="">Ktor 3.6.0 の新機能</Links>を参照してください。
<var name="version" value="3.6.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.5.2</td><td>2026年8月4日</td><td>
<p>
レートリミット（rate limiting）サポートの強化、テキスト処理パフォーマンスの回復、I/O 処理、OpenAPI、および設定に関する問題の修正など、安定性とパフォーマンスに焦点を当てたパッチリリース。
</p>
<var name="version" value="3.5.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.5.1</td><td>2026年6月26日</td><td>
<p>
OpenAPI プラグインの改善、認証に関する KDoc ドキュメントの拡充、および Kotlin 2.4 コンパイラ互換性、HTTP とキャッシュの挙動、認証、WebRTC の安定性、JVM、Darwin、Android、Windows にわたるプラットフォーム固有の問題をカバーする広範なバグ修正を含むパッチリリース。
</p>
<var name="version" value="3.5.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.5.0</td><td>2026年5月15日</td><td>
<p>
RFC 7616 Digest 認証のサポート、OkHttp および Apache5 向けのカスタム DNS リゾルバー設定、リクエストパラメータのヘルパー関数、ならびに設定、セッション、JavaScript 互換性にわたるその他の改善を導入したマイナーリリース。
詳細については、<Links href="whats-new-350.md" summary="">Ktor 3.5.0 の新機能</Links>を参照してください。
</p>
<var name="version" value="3.5.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.4.3</td><td>2026年4月22日</td><td>
<p>
OpenAPI スキーマ推論の修正、クライアントエンジンのライフサイクルの問題、いくつかの並行処理およびプラットフォーム固有のバグ修正など、安定性に焦点を当てたパッチリリース。
</p>
<var name="version" value="3.4.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.4.2</td><td>2026年3月27日</td><td>
<p>
アロケーションの最適化と WebSocket の修正によってクライアントとエンジンのパフォーマンスを向上させるとともに、OpenAPI、ロギング、GraalVM 互換性、Netty、Darwin、依存性注入（DI）、圧縮、証明書ピニング（certificate pinning）、Kotlin/Native にわたる幅広い問題に対処したパッチリリース。
</p>
<var name="version" value="3.4.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.4.1</td><td>2026年3月4日</td><td>
<p>
<a href="whats-new-340.md#use-engine-dispatcher">3.4.0 で発生した Flow 不変条件エラー（Flow invariant error）</a>の解決や、適切な <code>StreamResetException</code> の伝播の復元など、重要なリグレッション修正を含むパッチリリース。また、パフォーマンスの向上、OpenAPI の拡張、エンジンおよびプラットフォーム全般にわたる複数の安定性修正も含まれます。
</p>
<var name="version" value="3.4.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.4.0</td><td>2026年1月23日</td><td>
<p>
ランタイム生成の OpenAPI 仕様、Zstd および Jackson 3 のサポート、OkHttp の全二重ストリーミング（duplex streaming）の導入、ならびにフレームワーク全体の信頼性を高める多数のバグ修正を含むマイナーリリース。
</p>
<var name="version" value="3.4.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.3.3</td><td>2025年11月26日</td><td>
<p>
Jetty Client での HTTP/2 over cleartext (h2c) サポートの追加、ロギングと OpenAPI 生成の改善、エンジン、SSE 処理、二重レスポンス、HTTP/2 ヘッダー、クライアントキャッシュのバグ修正を行ったパッチリリース。
</p>
<var name="version" value="3.3.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.3.2</td><td>2025年11月5日</td><td>
<p>
Darwin 向けの SOCKS プロキシサポートの追加、WebRTC クライアントターゲットと Java プロキシ処理の改良、HTTP リトライ、OpenAPI、キャッシュ、Android 上の Netty における複数の問題の修正を行ったパッチリリース。
</p>
<var name="version" value="3.3.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.3.1</td><td>2025年10月8日</td><td>
<p>
Kotlin を 2.2.20 に更新し、Content-Length のパースエラー、<code>ClientSSESession</code> のシリアライザー欠落、Netty の設定およびシャットダウンに関するバグなど複数の問題を修正し、bootJar 内の静的リソースの配信サポートを追加したパッチリリース。
</p>
<var name="version" value="3.3.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.3.0</td><td>2025年9月11日</td><td>
<p>
実験的な OpenAPI 生成プレビュー、静的コンテンツ処理の改善、Android および JS/Wasm 向け WebRTC クライアント、Jetty、OkHttp、Kotlin 2.2 へのアップグレードなどの主要機能を導入したマイナーリリース。詳細については、<Links href="whats-new-330.md" summary="">Ktor 3.3.0 の新機能</Links>を参照してください。
</p>
<var name="version" value="3.3.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.2.3</td><td>2025年7月29日</td><td>
<p>
YAML 設定処理、DI 解決、Wasm/JS の安定性の向上に加え、マルチパートのパース、CIO の <code>100 Continue</code> レスポンスのフォーマット、<code>ByteReadChannel</code> での無限読み込みループ、サーバーのシャットダウンに関する問題の修正を導入したパッチリリース。
</p>
<var name="version" value="3.2.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.2.2</td><td>2025年7月14日</td><td>
<p>
SSE フィールドのシリアライズ順序を改善し、CORS プリフライト処理、テストアプリケーションのストリーミング、設定のデシリアライズのバグ、および 3.2.1 で wasmJs と Darwin ターゲットに影響を与えたリグレッションを含む各プラットフォームでのヘッダー欠落など、複数の問題を解決したパッチリリース。
</p>
<var name="version" value="3.2.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.2.1</td><td>2025年7月4日</td><td>
<p>
Time API、テンプレート機能、パブリッシングの改善に加え、プラグインの挙動、Netty、OkHttp、および 3.2.0 で混入した起動時の問題に対する重大なバグ修正を含むパッチリリース。
</p>
<var name="version" value="3.2.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.2.0</td><td>2025年6月12日</td><td>
<p>
型付けされた設定のデシリアライズ、新しい依存性注入（DI）および HTMX モジュール、Gradle バージョンカタログのサポート、suspend モジュールのサポートを導入したマイナーリリース。詳細については、<Links href="whats-new-320.md" summary="">Ktor 3.2.0 の新機能</Links>を参照してください。
</p>
<var name="version" value="3.2.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.1.3</td><td>2025年5月5日</td><td><p>
バイト操作やマルチパート処理の高速化、安全なトークンリフレッシュ処理などのパフォーマンス向上を含むパッチリリース。また、メトリクスにおけるメモリ問題の修正、ヘッダー動作の改善、WebSocket、OkHttp、Apache5、Netty にわたるバグの解決、Kotlin 2.1.0 をサポートするための JTE の更新も含まれます。
</p>
<var name="version" value="3.1.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.1.2</td><td>2025年3月27日</td><td><p>
Kotlin を 2.1.20 に更新し、Base64 デコード、認証トークンのクリア、Android サーバーの起動エラー、WebSocket ヘッダーのフォーマット、SSE セッションのキャンセルなど、さまざまな問題を修正したパッチリリース。
</p>
<var name="version" value="3.1.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.1.1</td><td>2025年2月24日</td><td><p>
ロギングの改善と WebSocket タイムアウト処理の修正を行ったパッチリリース。HTTP キャッシュの不整合、フォームデータのコピーエラー、gzip 処理のクラッシュ、セグメントプールの破損を引き起こす並行処理の問題など、複数のバグを修正しています。
</p>
<var name="version" value="3.1.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.1.0</td><td>2025年2月11日</td><td><p>
各種 SSE 機能や、CIO エンジンおよび WebSocket サポートの拡張を導入したマイナーリリース。バイトチャネル処理、HTTP リクエストの失敗、並行処理の問題に関連する重大なバグを修正しつつ、プラットフォーム互換性、ロギング、認証を強化しています。
</p>
<var name="version" value="3.1.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.0.3</td><td>2024年12月18日</td><td><p>
<code>browserProductionWebpack</code> でのビルドエラーの修正、gzip 圧縮されたコンテンツの処理、<code>FormFieldLimit</code> 設定の上書きなど、さまざまなバグ修正を含むパッチリリース。コアパフォーマンスの向上や、テストアプリケーションの適切なシャットダウンも含まれています。
</p>
<var name="version" value="3.0.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.0.2</td><td>2024年12月4日</td><td><p>
レスポンスの破損、ボディの途切れ、接続処理、不正なヘッダーに関連する複数のバグ修正に対処し、バイナリエンコーディングのサポート拡張と Android 向けのパフォーマンス向上を含んだパッチリリース。
</p>
<var name="version" value="3.0.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.3.13</td><td>2024年11月20日</td><td><p>
バグ修正、セキュリティパッチ、および <code>watchosDeviceArm64</code> ターゲットのサポート追加を含む改善を施したパッチリリース。
</p>
<var name="version" value="2.3.13"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.0.1</td><td>2024年10月29日</td><td><p>
クライアントおよびサーバーのロギングの改善と、さまざまなバグ修正を含むパッチリリース。
</p>
<var name="version" value="3.0.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0</td><td>2024年10月9日</td><td><p>
Android Native ターゲットのサポート追加を含む、改善とバグ修正を盛り込んだメジャーリリース。
破壊的変更の詳細については、<Links href="migrating-3.md" summary="">移行ガイド</Links>を参照してください。
</p>
<var name="version" value="3.0.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-rc-2</td><td>2024年10月2日</td><td><p>
破壊的変更を伴う各種改善、バグ修正、XML 向けのマルチプラットフォームサポートなどの機能を含むメジャーリリースカンジデート（RC）。
</p>
<var name="version" value="3.0.0-rc-2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-rc-1</td><td>2024年9月9日</td><td><p>
大幅な改善とバグ修正を含むメジャーリリースカンジデート（RC）。後方互換性を強化し、拡張された <code>staticZip</code> サポートを特徴としています。
</p>
<var name="version" value="3.0.0-rc-1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-beta-2</td><td>2024年7月15日</td><td><p>
SSE サポートの改善や Kotlin/Wasm 向け Ktor クライアントなど、さまざまな改善とバグ修正を含むメジャープレリリースバージョン。
</p>
<var name="version" value="3.0.0-beta-2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.3.12</td><td>2024年6月20日</td><td><p>
Ktor Core および Ktor Server のバグ修正、ならびに Netty と OpenAPI のバージョン更新を含むパッチリリース。
</p>
<var name="version" value="2.3.12"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.3.11</td><td>2024年5月9日</td><td><p>
Test Client のエンジンへのソケットタイムアウト適用に関するバグ修正を含むパッチリリース。
</p>
<var name="version" value="2.3.11"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.3.10</td><td>2024年4月8日</td><td><p>
CallLogging および SSE サーバープラグインに関するさまざまなバグ修正、Android クライアントロギングの改善などを含むパッチリリース。
</p>
<var name="version" value="2.3.10"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.3.9</td><td>2024年3月4日</td><td><p>
ContentNegotiation クライアントプラグインのバグ修正と、HTTP 経由でのセキュアクッキー送信サポートを追加したパッチリリース。
</p>
<var name="version" value="2.3.9"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.3.8</td><td>2024年1月31日</td><td><p>
URLBuilder、CORS、WebSocket プラグインに関する各種バグ修正を含むパッチリリース。
</p>
<var name="version" value="2.3.8"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.3.7</td><td>2023年12月7日</td><td>
<p>
ContentNegotiation、WebSockets、Native Server でのメモリ使用量に関するバグ修正を含むパッチリリース。
</p>
<var name="version" value="2.3.7"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-beta-1</td><td>2023年11月23日</td><td>
<p>
クライアントおよびサーバーの SSE サポートを含む、さまざまな改善とバグ修正を盛り込んだメジャープレリリースバージョン。
</p>
<var name="version" value="3.0.0-beta-1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.3.6</td><td>2023年11月7日</td><td>
<p>
2.3.5 での破壊的変更の修正と、その他さまざまなバグ修正を含むパッチリリース。
</p>
<var name="version" value="2.3.6"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.3.5</td><td>2023年10月5日</td><td>
<p>
Darwin および Apache5 エンジン設定の修正を含むパッチリリース。
</p>
<var name="version" value="2.3.5"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.3.4</td><td>2023年8月31日</td><td>
<p>
HTTP Cookie ヘッダーおよび NoTransformationFoundException エラーのバグ修正を含むパッチリリース。
</p>
<var name="version" value="2.3.4"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.3.3</td><td>2023年8月1日</td><td>
<p>
<code>linuxArm64</code> のクライアントおよびサーバーサポートと、さまざまなバグ修正を含むパッチリリース。
</p>
<var name="version" value="2.3.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.3.2</td><td>2023年6月28日</td><td>
<p>
Kotlin バージョンを <code>1.8.22</code> にアップグレードし、さまざまなバグ修正を行ったパッチリリース。
</p>
<var name="version" value="2.3.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.3.1</td><td>2023年5月31日</td><td>
<p>
サーバー設定の改善とさまざまなバグ修正を含むパッチリリース。
</p>
<var name="version" value="2.3.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.3.0</td><td>2023年4月19日</td><td>
<p>
複数の設定ファイルのサポート、Routing での正規表現パターンのサポートなどを追加した機能リリース。
</p>
<var name="version" value="2.3.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.2.4</td><td>2023年2月28日</td><td>
<p>
HTTP クライアント、Routing、ContentNegotiation における各種バグ修正を含むパッチリリース。
</p>
<var name="version" value="2.2.4"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.2.3</td><td>2023年1月31日</td><td>
<p>
OAuth2 のマルチプラットフォーム機能と各種バグ修正を含むパッチリリース。
</p>
<var name="version" value="2.2.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.2.2</td><td>2023年1月3日</td><td>
<p>
<code>2.2.1</code> に対するバグ修正、Swagger プラグインの改善および修正などを含むパッチリリース。
</p>
<var name="version" value="2.2.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.2.1</td><td>2022年12月7日</td><td>
<p>
<code>2.2.0</code> での <code>java.lang.NoClassDefFoundError: kotlinx/atomicfu/AtomicFU</code> エラーに対するパッチリリース。
</p>
<var name="version" value="2.2.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.2.0</td><td>2022年12月7日</td><td>
<p>
Swagger UI のホスティング、新しいプラグイン API、Sessions のマルチプラットフォームサポートなど、複数の新機能を含むリリース。
詳細については、<Links href="migration-to-22x.md" summary="">2.0.x から 2.2.x への移行</Links>ガイドを参照してください。
</p>
<var name="version" value="2.2.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.1.3</td><td>2022年10月26日</td><td>
<p>
各種バグ修正を含むパッチリリース。
</p>
<var name="version" value="2.1.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.1.2</td><td>2022年9月29日</td><td>
<p>
Routing、Testing エンジン、Ktor クライアントにおけるバグ修正を含むパッチリリース。
</p>
<var name="version" value="2.1.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.1.1</td><td>2022年9月6日</td><td>
<p>
Ktor クライアントおよびサーバーにおける各種バグ修正を含むパッチリリース。
</p>
<var name="version" value="2.1.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.1.0</td><td>2022年8月11日</td><td>
<p>
YAML 設定のサポート追加、ならびにその他の各種改善とバグ修正を行ったマイナーリリース。
</p>
<var name="version" value="2.1.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.0.3</td><td>2022年6月28日</td><td>
<p>
バグ修正と <code>kotlinx.coroutines</code> のバージョン <code>1.6.2</code> へのアップグレードを含むパッチリリース。
</p>
<var name="version" value="2.0.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.0.2</td><td>2022年5月27日</td><td>
<p>
各種改善、バグ修正、依存関係のバージョンアップグレードを含むパッチリリース。
</p>
<var name="version" value="2.0.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.0.1</td><td>2022年4月28日</td><td>
<p>
各種バグ修正と Kotlin バージョンの <code>1.6.21</code> への更新を含むパッチリリース。
</p>
<var name="version" value="2.0.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>2.0.0</td><td>2022年4月11日</td><td>
<p>
更新された API ドキュメントとさまざまな新機能を含むメジャーリリース。破壊的変更の詳細および <code>1.x.x</code> からの移行方法については、<Links href="migration-to-20x.md" summary="">移行ガイド</Links>を参照してください。
</p>
<var name="version" value="2.0.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

<tr>
<td>1.6.8</td><td>2022年3月15日</td><td>
<p>
依存関係のバージョンアップグレードを含むパッチリリース。
</p>
<var name="version" value="1.6.8"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub で変更ログを確認</a>
</p>
</td>
</tr>

</table>