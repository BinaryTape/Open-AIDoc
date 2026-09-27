[//]: # (title: Compose Multiplatform 1.12.1 の最新情報)

この機能リリースのハイライトは以下の通りです。

 * [Web での自動フォントフォールバック](#automatic-font-fallback)
 * [Compose Hot Reload における AI エージェント向けの MCP サーバー](#mcp-server-for-ai-agents-in-compose-hot-reload)
 * [デスクトップ向けの Window および dialog API v2](#window-and-dialog-api-v2)

このリリースにおける変更点の完全なリストは、[GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.12.0) で確認できます。
特定のコンポーネントバージョンの詳細については、[依存関係](#dependencies)セクションを参照してください。

## 互換性を損なう変更と非推奨 {id="breaking-changes-and-deprecations"}

アプリのテーマ管理に使用されていた `LocalSystemTheme` プロパティが非推奨になりました。
これは `@InternalComposeUiApi` アノテーションのもとで一時的に引き続き利用可能ですが、将来のリリースで置き換えられる予定です。

## マルチプラットフォーム共通 {id="across-platforms"}

### Skia が Milestone 150 にアップデート {id="skia-updated-to-milestone-150"}

Skiko を介して Compose Multiplatform で使用されている Skia のバージョンが、Milestone 150 にアップデートされました。

Compose Multiplatform 1.11 で使用されていた以前のバージョンは Milestone 144 でした。
これらのバージョン間で行われた変更については、[リリースノート](https://skia.googlesource.com/skia/+/refs/heads/chrome/m150/RELEASE_NOTES.md)を参照してください。

このアップデートにより、独自の Skia ライブラリをすでに同梱しているアプリ（例：Chromium ベースのアプリ）で発生していた、iOS 上でのシンボル重複の競合も解決されます。

## iOS {id="ios"}

### Lazy layout のスクロールパフォーマンスの向上 {id="improved-lazy-layout-scrolling-performance"}

iOS 向けの Compose Multiplatform で、Lazy layout（遅延レイアウト）のスクロールパフォーマンスが向上しました。
リスト項目の非アクティブ化が描画フェーズ（drawing phase）の外で実行されるようになり、描画フェーズをより早く完了できるようになったことで、よりスムーズなスクロールが実現しました。

## Web {id="web"}

### 自動フォントフォールバック {id="automatic-font-fallback"}
<primary-label ref="Experimental"/>

以前は、アプリケーションに読み込まれたフォントでカバーされていない文字は、置換用グリフ（□、通称「豆腐」）として表示されていました。

Web 向けの Compose Multiplatform では、レンダリング中に未解決の文字に遭遇した際、必要に応じて必要な Noto フォントのサブセットを自動的にダウンロードするようになりました。
フォントのダウンロード後、Compose は影響を受けるテキストを再構成（recompose）します。
必要なフォントが取得されるまで、一時的に豆腐が表示される可能性があることに注意してください。

## Desktop {id="desktop"}

### Compose Hot Reload における AI エージェント向けの MCP サーバー {id="mcp-server-for-ai-agents-in-compose-hot-reload"}
<primary-label ref="Experimental"/>

Compose Hot Reload に、実験的な [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) サーバーが搭載されました。これにより、AI コーディングエージェントが実行中の Compose アプリケーションと直接対話できるようになります。

これまでは、AI エージェントが Compose コードを編集しても、その結果を検証する信頼できる方法がありませんでした。エージェントはホットリロード（hot reload）が成功したことを確認できず、レンダリングされた UI を見ることもできず、実行時のログや例外を読み取ることもできませんでした。MCP サーバーを使用すると、エージェントは手動の介入を必要とせずに、リロードのトリガー、スクリーンショットの撮影、セマンティックツリー（semantic tree）の検査、クリックや入力のシミュレート、およびアプリケーションログの読み取りを行うことができます。

AI エージェントが利用可能な MCP ツールの完全なリストと接続方法については、[AI エージェント向けの MCP サーバー](compose-hot-reload.md#mcp-server-for-ai-agents)を参照してください。

### Window および dialog API v2 {id="window-and-dialog-api-v2"}
<primary-label ref="Experimental"/>

デスクトップにおける `WindowState` および `DialogState` の新しい実験的な v2 API を導入し、既存の API のいくつかの制限に対応しました。
v2 API は `androidx.compose.ui.window.v2` サブパッケージで利用可能です。

v2 API を使用すると、ウィンドウとダイアログの配置とサイズの制御がより柔軟になります。以下のことが可能です：
* ウィンドウを表示する画面の選択
* コンテンツの固有サイズ（intrinsic size）に基づくロジックを含む、カスタムの配置およびサイジングロジックの提供
* ウィンドウの最小サイズと最大サイズの設定
* 親ウィンドウに対するダイアログの相対的な配置

また、v2 API ではウィンドウ状態変更の非同期的な性質が明示的になり、リクエストされた状態と実際の状態が分離されました。

例えば、固定サイズで画面中央にウィンドウを開くには、次のように記述します：

```kotlin
import androidx.compose.material.Text
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.application
import androidx.compose.ui.window.v2.Window
import androidx.compose.ui.window.v2.WindowBoundsProvider
import androidx.compose.ui.window.v2.WindowPositionProvider
import androidx.compose.ui.window.v2.WindowSizeProvider
import androidx.compose.ui.window.v2.rememberWindowState

@OptIn(ExperimentalComposeUiApi::class)
fun main() = application {
    val windowState = rememberWindowState(
        initialBoundsProvider = WindowBoundsProvider(
            positionProvider = WindowPositionProvider.CenteredOnScreen,
            sizeProvider = WindowSizeProvider.Fixed(DpSize(400.dp, 200.dp))
        )
    )

    Window(
        onCloseRequest = ::exitApplication,
        state = windowState,
    ) {
        Text("Hello, World!", fontSize = 48.sp)
    }
}
```

v2 API は、ウィンドウがより大きい場合にコンテンツを（`fillMaxSize()` などの修飾子を介して）拡張させつつ、コンテンツのサイズに合わせてウィンドウのサイズを決定するといった、これまで不可能だったシナリオも可能にします。
詳細は [Window および dialog API v2](compose-desktop-top-level-windows-management.md#window-and-dialog-api-v2) のドキュメントページを参照してください。

## 依存関係 {id="dependencies"}

| ライブラリ | Maven 座標 | ベースとなる Jetpack バージョン |
|--------------------|------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| Runtime            | `org.jetbrains.compose.runtime:runtime*:1.12.1`                        | [Runtime 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.12.1)                     |
| UI                 | `org.jetbrains.compose.ui:ui*:1.12.1`                                  | [UI 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.12.1)                               |
| Foundation         | `org.jetbrains.compose.foundation:foundation*:1.12.1`                  | [Foundation 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.12.1)               |
| Material           | `org.jetbrains.compose.material:material*:1.12.1`                      | [Material 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-material#1.12.1)                   |
| Material3          | `org.jetbrains.compose.material3:material3*:1.12.0-alpha03`            | [Material3 1.5.0-alpha22](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.5.0-alpha22)   |
| Material3 Adaptive | `org.jetbrains.compose.material3.adaptive:adaptive*:1.3.0-rc01`        | [Material3 Adaptive 1.3.0](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.3.0) |
| Lifecycle          | `org.jetbrains.androidx.lifecycle:lifecycle-*:2.11.0`                  | [Lifecycle 2.11.0](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.11.0)                         |
| Navigation         | `org.jetbrains.androidx.navigation:navigation-*:2.10.0-beta01`         | [Navigation 2.10.0](https://developer.android.com/jetpack/androidx/releases/navigation#2.10.0)                       |
| Navigation3        | `org.jetbrains.androidx.navigation3:navigation3-*:1.1.2`               | [Navigation3 1.1.7](https://developer.android.com/jetpack/androidx/releases/navigation3#1.1.7)                       |
| Navigation Event   | `org.jetbrains.androidx.navigationevent:navigationevent-compose:1.1.0` | [Navigation Event 1.1.1](https://developer.android.com/jetpack/androidx/releases/navigationevent#1.1.1)              |
| Savedstate         | `org.jetbrains.androidx.savedstate:savedstate*:1.4.0`                  | [Savedstate 1.4.0](https://developer.android.com/jetpack/androidx/releases/savedstate#1.4.0)                         |
| WindowManager Core | `org.jetbrains.androidx.window:window-core:1.5.1`                      | [WindowManager 1.5.1](https://developer.android.com/jetpack/androidx/releases/window#1.5.1)                          |