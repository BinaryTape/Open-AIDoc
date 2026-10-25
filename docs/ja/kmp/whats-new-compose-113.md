[//]: # (title: Compose Multiplatform %org.jetbrains.compose-eap% の新機能)

このEAPリリースのハイライトは以下のとおりです。

* [SwiftUIおよびUIKitにおけるCompose Multiplatformビューのコンテンツに応じたサイズ設定](#content-based-sizing-for-compose-multiplatform-views-in-swiftui-and-uikit)
* [iOSにおけるパスワードの保存と自動入力](#saving-and-autofilling-passwords)
* [WebGLの相互運用性](#webgl-interop)
* [AppCDSおよびAOTオプションによるデスクトップ起動の高速化](#faster-desktop-startup-with-appcds-or-aot)

このリリースの変更点の完全なリストは [GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.13.0-beta01) で確認できます。
特定のコンポーネントバージョンに関する詳細については、[依存関係](#dependencies) セクションを参照してください。

## プラットフォーム共通 {id="across-platforms"}

以前のCompose Multiplatformリリースで試験的（Experimental）だったいくつかの機能が安定版（Stable）になりました。
使用するためにオプトインする必要はなくなりました。

* iOSで `ComposeUIView()` を作成し、`ComposeUIViewportConfiguration` で設定する。
* [`ComposeViewportConfiguration` を使用してWeb向けの `ComposeViewport()` を設定する](compose-css-styles.md)。
* [`preload` APIを使用したWeb向けリソースの事前読み込み](compose-web-resources.md#preload-resources-using-the-compose-multiplatform-preload-api)。

## iOS {id="ios"}

### SwiftUIおよびUIKitにおけるCompose Multiplatformビューのコンテンツに応じたサイズ設定 {id="content-based-sizing-for-compose-multiplatform-views-in-swiftui-and-uikit"}

SwiftUIまたはUIKitに埋め込まれたCompose Multiplatformビューが、親ビューの利用可能なスペースに基づいて適切なサイズ（preferred size）をレポートできるようになりました。
ネイティブのコンテナはこのサイズを使用してComposeコンテンツにフィットさせることができます（例: 幅を固定したままビューの高さを調整するなど）。

iOS 16以降では、Compose Multiplatformビューはデフォルトで `PreferredSizeReportingStrategy.SizeThatFits` を使用するため、追加のサイズ設定は不要です。

Kotlin側でComposeビューを作成します。

```kotlin
val view = ComposeUIView {
    Text("Hello from Compose")
}
```

次に、SwiftUIの `UIViewRepresentable` ラッパー内で、サイズの提案（sizing proposal）を `sizeThatFits()` に渡します。
SwiftUIで指定されていない寸法には `UIView.noIntrinsicMetric` を使用します。

```swift
@available(iOS 16.0, *)
func sizeThatFits(
    _ proposal: ProposedViewSize,
    uiView: UIView,
    context: Context
) -> CGSize? {
    uiView.sizeThatFits(
        CGSize(
            width: proposal.width ?? UIView.noIntrinsicMetric,
            height: proposal.height ?? UIView.noIntrinsicMetric
        )
    )
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="func sizeThatFits( _ proposal: ProposedViewSize, uiView: UIView, "}

UIKitでは、Auto LayoutがCompose Multiplatformビューの幅を設定した後、`sizeThatFits()` を使用して推奨される高さを取得し、高さの制約を更新します。

```swift
let preferredSize = uiView.sizeThatFits(
    CGSize(
        width: uiView.bounds.width,
        height: UIView.noIntrinsicMetric
    )
)
heightConstraint.constant = preferredSize.height
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="let preferredSize = uiView.sizeThatFits("}

### パスワードの保存と自動入力 {id="saving-and-autofilling-passwords"}
<primary-label ref="Experimental"/>

iOSにおいて、Compose Multiplatformはログイン認証情報を保存し、Composeのテキストフィールドに自動入力するためのネイティブプロンプトを表示できるようになりました。
iOSがフォームをログインフォームとして認識できるように、ユーザー名とパスワードの両方のフィールドを画面上に配置してください。

フィールドを設定するには、iOSのソースセットで `PlatformImeOptions` を使用します。
ユーザー名には `textContentType(UITextContentTypeUsername)` を、パスワードには `isSecureTextEntry(true)` を設定します。
たとえば、`@OptIn(ExperimentalComposeUiApi::class)` でアノテーションされたコンポーザブル内では次のようになります。

```kotlin
var username by remember { mutableStateOf("") }
var password by remember { mutableStateOf("") }

Column {
    TextField(
        value = username,
        onValueChange = { username = it },
        keyboardOptions = KeyboardOptions(
            keyboardType = KeyboardType.Email,
            platformImeOptions = PlatformImeOptions {
                textContentType(UITextContentTypeUsername)
            }
        )
    )

    TextField(
        value = password,
        onValueChange = { password = it },
        visualTransformation = PasswordVisualTransformation(),
        keyboardOptions = KeyboardOptions(
            keyboardType = KeyboardType.Password,
            platformImeOptions = PlatformImeOptions {
                isSecureTextEntry(true)
            }
        )
    )
}
```

## Web {id="web"}

### WebGLの相互運用性 {id="webgl-interop"}
<primary-label ref="Experimental"/>

Compose Multiplatformで、[WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) テクスチャをレンダリングするための試験的APIが提供されるようになりました。
`WebGLRenderTarget` は、他のCompose UI要素と一緒にWebGLグラフィックスを表示するComposeの `Painter` を公開します。

`rememberWebGLRenderTarget()` を使用してターゲットを作成し、`render {}` で描画して、その `painter` を `Image` で表示します。
たとえば、以下のコードフラグメントは `@OptIn(ExperimentalComposeUiApi::class)` を付けたコンポーザブル内で青いテクスチャをレンダリングします。

```kotlin
val target = rememberWebGLRenderTarget(IntSize(64, 64))

if (target != null) {
    LaunchedEffect(target) {
        target.render {
            with(target.webGLContext) {
                disable(WebGLRenderingContext.SCISSOR_TEST)
                clearColor(0.15f, 0.55f, 1f, 1f)
                clear(WebGLRenderingContext.COLOR_BUFFER_BIT)
            }
        }
    }

    Image(
        painter = target.painter,
        contentDescription = "A blue WebGL texture",
        modifier = Modifier.size(200.dp),
    )
}
```

より高度なユースケース向けに、`target` は基盤となるWebGLレンダリングコンテキストへのアクセスも提供します。

### Webにおけるシステムウィンドウインセット {id="system-window-insets-on-web"}
<primary-label ref="Experimental"/>

Web向けCompose Multiplatformで、標準の `WindowInsets` APIを通じたシステムウィンドウインセットがサポートされるようになりました。
ディスプレイのカットアウト（切り欠き）やオンスクリーンキーボードなどのセーフエリアを考慮しながら、UIをエッジトゥエッジ（画面全体）で描画できます。

この機能を有効にするには、`ComposeViewport` の設定で `enableBrowserWindowInsets` を `true` に設定します。
標準のインセットModifierを使用してレイアウトを調整します。

```kotlin
ComposeViewport(configure = { enableBrowserWindowInsets = true }) {
    Box(Modifier.fillMaxSize().safeDrawingPadding()) {
        Text("Content within the safe drawing area")
    }
}
```

また、`WindowInsets.safeDrawing` や `WindowInsets.ime` などのAPIを通じてインセットに直接アクセスすることもできます。

エッジトゥエッジでレンダリングするには、ページのビューポート `meta` タグに `viewport-fit=cover` を追加します。

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

> `viewport-fit=cover` がない場合、ブラウザはセーフエリアのパディングを適用し、セーフエリアインセットとして0を報告します。
> この設定を行わずにブラウザウィンドウインセットを有効にすると、Compose Multiplatformは警告をログに出力します。

### Webにおけるフォントフォールバックの設定機能 {id="configurable-font-fallback-on-web"}

前回のリリースでは、アプリケーションのフォントでカバーされていない文字のための[自動フォントフォールバック](compose-web-resources.md#automatic-font-fallback)を導入しました。
今回のリリースでは、フォールバックフォントのソースを選択したり、自動ダウンロードを無効化したりできるようになりました。

デフォルトでは、Compose Multiplatformはフォールバックフォントを [Google Fonts](https://fonts.gstatic.com/s/) からダウンロードします。
別のソースを使用するには、ウィンドウ設定で `fontFallbackUrl` を設定します。

```kotlin
createComposeWindow(
    configure = { fontFallbackUrl = "https://custom.fonts.com" }
) {
    BasicText("გამარჯობა")
}
```

自動フォントフォールバックを無効にするには、`fontFallbackUrl` を `null` に設定します。

```kotlin
createComposeWindow(
    configure = { fontFallbackUrl = null }
) {
    BasicText("გამარჯობა")
}
```

## デスクトップ {id="desktop"}

### AppCDSまたはAOTによるデスクトップ起動の高速化 {id="faster-desktop-startup-with-appcds-or-aot"}

Compose Multiplatformで、デスクトップアプリケーション向けに [Application Class-Data Sharing (AppCDS)](https://openjdk.org/jeps/310) および [Ahead-of-Time (AOT) キャッシュ](https://openjdk.org/jeps/514) がサポートされるようになりました。どちらのオプションもアーカイブを使用して起動時間を短縮します。

小さなデモアプリケーションでのベンチマークでは、事前ビルドされたAOTキャッシュによってコールドスタート時間が短縮されました。

* macOS (M1 Ultra): 2017 ms から 424 ms へ — 4.8倍高速化。
* Windows (Dell Precision 5690): 1356 ms から 650 ms へ — 2.1倍高速化。

これらの測定値は、プロセスの起動からウィンドウが表示されるまでの時間を対象としています。
実際の結果はアプリケーションや環境によって異なります。
AOTによる起動の最適化には、最新の [JetBrains Runtime (JBR) 25](https://github.com/JetBrains/JetBrainsRuntime) リリースを推奨します。

これらの起動オプションを有効にするには、`build.gradle.kts` ファイルで `aot {}` ブロックを設定します。

```kotlin
compose.desktop {
    application {
        aot {
            mode = AotMode.AotPrebuild
        }
    }
}
```

JDKのバージョンとパッケージングの要件に基づいてモードを選択してください。

| モード             | 最小JDKバージョン | 動作                                                                                           |
|------------------|-------------|------------------------------------------------------------------------------------------------|
| `None`           | —           | デフォルト。起動の最適化は行われません。                                                             |
| `AppCdsAuto`     | 19          | ユーザーの最初のセッション終了時にAppCDSアーカイブを作成し、以降の起動を高速化します。                     |
| `AppCdsPrebuild` | 21          | パッケージング前にAppCDSアーカイブを作成し、初回起動時から高速化します。                                 |
| `AotPrebuild`    | 25          | パッケージング前にAOTキャッシュを作成し、リンクおよびJITのウォームアップも改善します。                    |

どちらの事前ビルドモードでも、アーカイブを作成するためにパッケージング中にアプリケーションが実行されます。
このキャッシュ生成の実行中、プラグインはシステムプロパティ `compose.aot.training-run` を `true` に設定します。

なお、アプリケーションにアーカイブが含まれるため、事前ビルドモードを使用すると配布パッケージのサイズが増加することに注意してください。

### macOSおよびWindowsでのウィンドウリサイズの円滑化 {id="smoother-window-resizing-on-macos-and-windows"}

Compose Multiplatformで、macOSのMetalまたはWindowsのDirectXを使用している際のインタラクティブなウィンドウリサイズがよりスムーズになりました。
レンダリングがウィンドウのリサイズと同期を維持し、カクつき（スタッター）を抑え、ウィンドウの縁に白いバーが生じるのを防ぎます。

この動作を有効にするには、ウィンドウを表示する前にレンダラー用のシステムプロパティを `true` に設定します。
`System.setProperty()` またはJVMの `-D` フラグで設定してください。

* macOS (Metal): `skiko.rendering.macos.metalSynchronousLiveResize`
* Windows (DirectX): `skiko.rendering.windows.direct3DSynchronousLiveResize`

この機能を使用するには、Composeコンテンツがウィンドウ全体に広がっている必要があります。

## 依存関係 {id="dependencies"}

| ライブラリ            | Maven座標                                                      | ベースとなるJetpackバージョン                                                                                                             |
|--------------------|------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Runtime            | `org.jetbrains.compose.runtime:runtime*:1.13.0-beta01`                 | [Runtime 1.13.0-beta01](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.13.0-beta01)                       |
| UI                 | `org.jetbrains.compose.ui:ui*:1.13.0-beta01`                           | [UI 1.13.0-beta01](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.13.0-beta01)                                 |
| Foundation         | `org.jetbrains.compose.foundation:foundation*:1.13.0-beta01`           | [Foundation 1.13.0-beta01](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.13.0-beta01)                 |
| Material           | `org.jetbrains.compose.material:material*:1.13.0-beta01`               | [Material 1.13.0-beta01](https://developer.android.com/jetpack/androidx/releases/compose-material#1.13.0-beta01)                     |
| Material3          | `org.jetbrains.compose.material3:material3*:1.13.0-beta01`             | [Material3 1.5.0-beta01](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.5.0-beta01)                     |
| Material3 Adaptive | `org.jetbrains.compose.material3.adaptive:adaptive*:1.4.0-alpha01`     | [Material3 Adaptive 1.4.0-alpha03](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.4.0-alpha03) |
| Lifecycle          | `org.jetbrains.androidx.lifecycle:lifecycle-*:2.11.0`                  | [Lifecycle 2.11.0](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.11.0)                                         |
| Navigation         | `org.jetbrains.androidx.navigation:navigation-*:2.10.0`                | [Navigation 2.10.0](https://developer.android.com/jetpack/androidx/releases/navigation#2.10.0)                                       |
| Navigation3        | `org.jetbrains.androidx.navigation3:navigation3-*:1.2.0`               | [Navigation3 1.2.0](https://developer.android.com/jetpack/androidx/releases/navigation3#1.2.0)                                       |
| Navigation Event   | `org.jetbrains.androidx.navigationevent:navigationevent-compose:1.1.0` | [Navigation Event 1.1.1](https://developer.android.com/jetpack/androidx/releases/navigationevent#1.1.1)                              |
| Savedstate         | `org.jetbrains.androidx.savedstate:savedstate*:1.4.0`                  | [Savedstate 1.4.0](https://developer.android.com/jetpack/androidx/releases/savedstate#1.4.0)                                         |
| WindowManager Core | `org.jetbrains.androidx.window:window-core:1.5.1`                      | [WindowManager 1.5.1](https://developer.android.com/jetpack/androidx/releases/window#1.5.1)                                          |