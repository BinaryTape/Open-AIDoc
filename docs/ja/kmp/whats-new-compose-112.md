[//]: # (title: Compose Multiplatform の最新情報 %org.jetbrains.compose-eap%)

この EAP リリースのハイライトは以下の通りです。

 * [Web での自動フォントフォールバック](#automatic-font-fallback)
 * [Compose Hot Reload における AI エージェント向けの MCP サーバー](#mcp-server-for-ai-agents-in-compose-hot-reload)

このリリースにおける変更点の完全なリストは、[GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.12.0-beta01) で確認できます。
特定のコンポーネントバージョンの詳細については、[依存関係](#dependencies)セクションを参照してください。

## マルチプラットフォーム共通

### Skia が Milestone 150 にアップデート

Skiko を介して Compose Multiplatform で使用されている Skia のバージョンが、Milestone 150 にアップデートされました。

Compose Multiplatform 1.11 で使用されていた以前のバージョンは Milestone 144 でした。
これらのバージョン間で行われた変更については、[リリースノート](https://skia.googlesource.com/skia/+/refs/heads/chrome/m150/RELEASE_NOTES.md)を参照してください。

このアップデートにより、独自の Skia ライブラリをすでに同梱しているアプリ（例：Chromium ベースのアプリ）で発生していた、iOS 上でのシンボル重複の競合も解決されます。

## iOS

### Lazy layout のスクロールパフォーマンスの向上

iOS 向けの Compose Multiplatform で、Lazy layout（遅延レイアウト）のスクロールパフォーマンスが向上しました。
リスト項目の非アクティブ化が描画フェーズ（drawing phase）の外で実行されるようになり、描画フェーズをより早く完了できるようになったことで、よりスムーズなスクロールが実現しました。

## Web

### 自動フォントフォールバック
<primary-label ref="Experimental"/>

以前は、アプリケーションに読み込まれたフォントでカバーされていない文字は、置換用グリフ（□、通称「豆腐」）として表示されていました。

Web 向けの Compose Multiplatform では、レンダリング中に未解決の文字に遭遇した際、必要に応じて必要な Noto フォントのサブセットを自動的にダウンロードするようになりました。
フォントのダウンロード後、Compose は影響を受けるテキストを再構成（recompose）します。
必要なフォントが取得されるまで、一時的に豆腐が表示される可能性があることに注意してください。

## Desktop

### Compose Hot Reload における AI エージェント向けの MCP サーバー
<primary-label ref="Experimental"/>

Compose Hot Reload に、実験的な [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) サーバーが搭載されました。これにより、AI コーディングエージェントが実行中の Compose アプリケーションと直接対話できるようになります。

これまでは、AI エージェントが Compose コードを編集しても、その結果を検証する信頼できる方法がありませんでした。エージェントはホットリロード（hot reload）が成功したことを確認できず、レンダリングされた UI を見ることもできず、実行時のログや例外を読み取ることもできませんでした。MCP サーバーを使用すると、エージェントは手動の介入を必要とせずに、リロードのトリガー、スクリーンショットの撮影、セマンティックツリー（semantic tree）の検査、クリックや入力のシミュレート、およびアプリケーションログの読み取りを行うことができます。

AI エージェントが利用可能な MCP ツールの完全なリストと接続方法については、[AI エージェント向けの MCP サーバー](compose-hot-reload.md#mcp-server-for-ai-agents)を参照してください。

## 依存関係

| ライブラリ | Maven 座標 | ベースとなる Jetpack バージョン |
|--------------------|------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| Runtime            | `org.jetbrains.compose.runtime:runtime*:1.12.0-beta02`                 | [Runtime 1.12.0-beta02](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.12.0-beta02)                     |
| UI                 | `org.jetbrains.compose.ui:ui*:1.12.0-beta02`                           | [UI 1.12.0-beta02](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.12.0-beta02)                               |
| Foundation         | `org.jetbrains.compose.foundation:foundation*:1.12.0-beta02`           | [Foundation 1.12.0-beta02](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.12.0-beta02)               |
| Material           | `org.jetbrains.compose.material:material*:1.12.0-beta02`               | [Material 1.12.0-beta02](https://developer.android.com/jetpack/androidx/releases/compose-material#1.12.0-beta02)                   |
| Material3          | `org.jetbrains.compose.material3:material3*:1.12.0-alpha03`            | [Material3 1.5.0-alpha22](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.5.0-alpha22)                 |
| Material3 Adaptive | `org.jetbrains.compose.material3.adaptive:adaptive*:1.3.0-beta02`      | [Material3 Adaptive 1.3.0-beta02](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.3.0-beta02) |
| Lifecycle          | `org.jetbrains.androidx.lifecycle:lifecycle-*:2.11.0`                  | [Lifecycle 2.11.0](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.11.0)                                       |
| Navigation         | `org.jetbrains.androidx.navigation:navigation-*:2.10.0-alpha02`        | [Navigation 2.10.0-alpha05](https://developer.android.com/jetpack/androidx/releases/navigation#2.10.0-alpha05)                     |
| Navigation3        | `org.jetbrains.androidx.navigation3:navigation3-*:1.2.0-alpha02`       | [Navigation3 1.2.0-alpha04](https://developer.android.com/jetpack/androidx/releases/navigation3#1.2.0-alpha04)                     |
| Navigation Event   | `org.jetbrains.androidx.navigationevent:navigationevent-compose:1.1.0` | [Navigation Event 1.1.1](https://developer.android.com/jetpack/androidx/releases/navigationevent#1.1.1)                            |
| Savedstate         | `org.jetbrains.androidx.savedstate:savedstate*:1.4.0`                  | [Savedstate 1.4.0](https://developer.android.com/jetpack/androidx/releases/savedstate#1.4.0)                                       |
| WindowManager Core | `org.jetbrains.androidx.window:window-core:1.5.1`                      | [WindowManager 1.5.1](https://developer.android.com/jetpack/androidx/releases/window#1.5.1)                                        |