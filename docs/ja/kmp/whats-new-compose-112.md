[//]: # (title: Compose Multiplatform 1.12.2 の新機能)

この機能リリースの主なハイライトは以下のとおりです。

 * [Web 向けの自動フォントフォールバック](#automatic-font-fallback)
 * [Compose Hot Reload における AI エージェント向け MCP サーバー](#mcp-server-for-ai-agents-in-compose-hot-reload)
 * [デスクトップ向けの Window および Dialog API v2](#window-and-dialog-api-v2)

このリリースの完全な変更リストは [GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.12.0) で確認できます。
特定のコンポーネントのバージョンに関する詳細については、[依存関係](#dependencies)セクションを参照してください。

## 破壊的変更と非推奨 {id="breaking-changes-and-deprecations"}

アプリのテーマ管理に使用されていた `LocalSystemTheme` プロパティが非推奨となりました。
一時的に `@InternalComposeUiApi` アノテーションのもとで引き続き利用可能ですが、
将来のリリースで置き換えられる予定です。

## プラットフォーム共通 {id="across-platforms"}

### Skia を Milestone 150 に更新 {id="skia-updated-to-milestone-150"}

Compose Multiplatform が Skiko を介して使用している Skia のバージョンが Milestone 150 に更新されました。

Compose Multiplatform 1.11 で使用されていた以前のバージョンは Milestone 144 でした。
これらのバージョン間で行われた変更は、[リリースノート](https://skia.googlesource.com/skia/+/refs/heads/chrome/m150/RELEASE_NOTES.md)で確認できます。

このアップデートにより、独自の Skia ライブラリをすでにバンドルしているアプリ（Chromium ベースのアプリなど）において、iOS 上で発生していた重複シンボルの衝突も解決されます。

## iOS {id="ios"}

### Lazy レイアウトのスクロールパフォーマンスの向上 {id="improved-lazy-layout-scrolling-performance"}

Compose Multiplatform for iOS で、Lazy レイアウトのスクロールパフォーマンスが向上しました。
リストアイテムの非アクティブ化処理（deactivation）が表示フェーズ（drawing phase）の外部で実行されるようになり、表示フェーズがより迅速に完了することで、よりスムーズなスクロールが実現します。

## Web {id="web"}

### 自動フォントフォールバック {id="automatic-font-fallback"}
<primary-label ref="Experimental"/>

これまでは、アプリケーションで読み込まれているフォントでカバーされていない文字は、代替グリフ（「豆腐」と呼ばれる □）として表示されていました。

Compose Multiplatform for Web では、レンダリング時に未解決の文字が見つかった際、必要な Noto フォントのサブセットをオンデマンドで自動的にダウンロードするようになりました。
フォントがダウンロードされた後、Compose は影響を受けるテキストを再構成（recompose）します。
なお、必要なフォントが取得されるまでの間、一時的に豆腐が表示される場合があります。

## デスクトップ {id="desktop"}

### Compose Hot Reload における AI エージェント向け MCP サーバー {id="mcp-server-for-ai-agents-in-compose-hot-reload"}
<primary-label ref="Experimental"/>

Compose Hot Reload に実験的な [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) サーバーが同梱されるようになりました。これにより、AI コーディングエージェントが実行中の Compose アプリケーションと直接対話できるようになります。

これまでは、AI エージェントが Compose のコードを編集した際、その結果を検証する信頼性の高い方法がありませんでした。エージェントはホットリロードが成功したかどうかを確認できず、レンダリングされた UI を確認することも、ランタイムログや例外を読み取ることもできませんでした。MCP サーバーを使用することで、エージェントは手動の介入を必要とすることなく、リロードのトリガー、スクリーンショットの撮影、セマンティックツリー（semantic tree）のインスペクション、クリックや入力のシミュレーション、アプリケーションログの読み取りを行うことができます。

AI エージェントが利用できる MCP ツールの完全なリストおよび接続方法については、
[AI エージェント向け MCP サーバー](compose-hot-reload.md#mcp-server-for-ai-agents)を参照してください。

### Window および Dialog API v2 {id="window-and-dialog-api-v2"}
<primary-label ref="Experimental"/>

デスクトップにおける既存 API のいくつかの制限に対処した、`WindowState` および `DialogState` 向けの新しい実験的な v2 API を導入しました。
v2 API は `androidx.compose.ui.window.v2` サブパッケージで利用可能です。

v2 API では、ウィンドウやダイアログの配置およびサイズ設定をより細かく制御できるようになります。以下の操作が可能です。
* ウィンドウを表示する画面の選択
* コンテンツの固有サイズ（intrinsic size）に基づくロジックを含む、カスタムの配置およびサイズ設定ロジックの提供
* ウィンドウの最小サイズおよび最大サイズの設定
* 親ウィンドウを基準としたダイアログの配置

また、v2 API ではウィンドウ状態の変更の非同期性が明確化され、要求された状態（requested state）と実際の状態（actual state）が分離されます。

たとえば、画面の中央に固定サイズでウィンドウを開くには、以下のように記述します。

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

さらに、v2 API により、ウィンドウをそのコンテンツのサイズに合わせつつ、ウィンドウがより大きくなった場合には（`fillMaxSize()` などの修飾子を介して）コンテンツを拡張できるようにするなど、これまで不可能だったシナリオも実現できるようになります。
詳細については、[Window and dialog API v2](compose-desktop-top-level-windows-management.md#window-and-dialog-api-v2) のドキュメントページを参照してください。

## 依存関係 {id="dependencies"}

| ライブラリ | Maven 座標 | ベースとなる Jetpack バージョン |
|--------------------|------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| Runtime            | `org.jetbrains.compose.runtime:runtime*:1.12.2`                        | [Runtime 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.12.1)                     |
| UI                 | `org.jetbrains.compose.ui:ui*:1.12.2`                                  | [UI 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.12.1)                               |
| Foundation         | `org.jetbrains.compose.foundation:foundation*:1.12.2`                  | [Foundation 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.12.1)               |
| Material           | `org.jetbrains.compose.material:material*:1.12.2`                      | [Material 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-material#1.12.1)                   |
| Material3          | `org.jetbrains.compose.material3:material3*:1.12.0-alpha03`            | [Material3 1.5.0-alpha22](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.5.0-alpha22)   |
| Material3 Adaptive | `org.jetbrains.compose.material3.adaptive:adaptive*:1.3.0`             | [Material3 Adaptive 1.3.0](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.3.0) |
| Lifecycle          | `org.jetbrains.androidx.lifecycle:lifecycle-*:2.11.0`                  | [Lifecycle 2.11.0](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.11.0)                         |
| Navigation         | `org.jetbrains.androidx.navigation:navigation-*:2.10.0-rc01`           | [Navigation 2.10.0](https://developer.android.com/jetpack/androidx/releases/navigation#2.10.0)                       |
| Navigation3        | `org.jetbrains.androidx.navigation3:navigation3-*:1.2.0-rc01`          | [Navigation3 1.2.0](https://developer.android.com/jetpack/androidx/releases/navigation3#1.2.0)                       |
| Navigation Event   | `org.jetbrains.androidx.navigationevent:navigationevent-compose:1.1.0` | [Navigation Event 1.1.1](https://developer.android.com/jetpack/androidx/releases/navigationevent#1.1.1)              |
| Savedstate         | `org.jetbrains.androidx.savedstate:savedstate*:1.4.0`                  | [Savedstate 1.4.0](https://developer.android.com/jetpack/androidx/releases/savedstate#1.4.0)                         |
| WindowManager Core | `org.jetbrains.androidx.window:window-core:1.5.1`                      | [WindowManager 1.5.1](https://developer.android.com/jetpack/androidx/releases/window#1.5.1)                          |