[//]: # (title: Compose Multiplatform %org.jetbrains.compose-eap% の新機能)

この EAP リリースのハイライトは以下のとおりです。

* [SwiftUI および UIKit における Compose Multiplatform ビューのコンテンツに応じたサイズ設定](#content-based-sizing-for-compose-multiplatform-views-in-swiftui-and-uikit)
* [iOS でのパスワードの保存と自動入力](#saving-and-autofilling-passwords)
* [WebGL との相互運用（WebGL interop）](#webgl-interop)
* [AppCDS および AOT オプションによるデスクトップ起動の高速化](#faster-desktop-startup-with-appcds-or-aot)

このリリースの完全な変更履歴は [GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.13.0-beta01) で確認できます。

特定のコンポーネントバージョンに関する詳細については、[依存関係](#dependencies) セクションを参照してください。
このリリースに含まれる AndroidX Compose ランタイムバージョンの変更点については、[`androidx.compose.runtime` リリースノート](https://developer.android.com/jetpack/androidx/releases/compose-runtime#version_113_2) を参照してください。

## プラットフォーム共通 {id="across-platforms"}

以前の Compose Multiplatform リリースで試験的（Experimental）だったいくつかの機能が、安定版（Stable）になりました。
使用するためにオプトインする必要はなくなりました。

* iOS で `ComposeUIView()` を作成し、`ComposeUIViewportConfiguration` で設定する。
* [`ComposeViewportConfiguration` を使用して Web 向けの `ComposeViewport()` を設定する](compose-css-styles.md)。
* [`preload` API を使用して Web 向けのリソースをプリロードする](compose-web-resources.md#preload-resources-using-the-compose-multiplatform-preload-api)。

## iOS {id="ios"}

### SwiftUI および UIKit における Compose Multiplatform ビューのコンテンツに応じたサイズ設定 {id="content-based-sizing-for-compose-multiplatform-views-in-swiftui-and-uikit"}

SwiftUI または UIKit に埋め込まれた Compose Multiplatform ビューが、親の利用可能なスペースに基づいて適切な推奨サイズ（Preferred size）を報告できるようになりました。
ネイティブコンテナはこのサイズを使用して Compose コンテンツを適切に収めることができます（例: 幅を固定したままビューの高さを調整するなど）。

iOS 16 以降では、Compose Multiplatform ビューはデフォルトで `PreferredSizeReportingStrategy.SizeThatFits` を使用するため、追加のサイズ設定は不要です。

Kotlin 側で Compose ビューを作成します。

```kotlin
val view = ComposeUIView {
    Text("Hello from Compose")
}
```

次に、SwiftUI の `UIViewRepresentable` ラッパー内で、提案されたサイズを `sizeThatFits()` に渡します。
SwiftUI で指定されていない寸法には `UIView.noIntrinsicMetric` を使用します。

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

UIKit では、Auto Layout によって Compose Multiplatform ビューの幅が設定された後、
`sizeThatFits()` を使用して推奨の高さを取得し、高さの制約を更新します。

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

iOS 上で、ログイン認証情報を保存するためのネイティブプロンプトの表示や、Compose のテキストフィールドへの自動入力ができるようになりました。
iOS がフォームをログインフォームとして認識できるように、ユーザー名とパスワードの両方のフィールドを画面上に配置してください。

フィールドを設定するには、iOS ソースセットで `PlatformImeOptions` を使用します。
ユーザー名には `textContentType(UITextContentTypeUsername)` を、パスワードには `isSecureTextEntry(true)` を設定します。
たとえば、`@OptIn(ExperimentalComposeUiApi::class)` でアノテーションされたコンポーザブル内では以下のように記述します。

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

### WebGL との相互運用 {id="webgl-interop"}
<primary-label ref="Experimental"/>

Compose Multiplatform で、[WebGL](https://developer.mozilla.org/ja/docs/Web/API/WebGL_API) テクスチャをレンダリングするための試験的 API が提供されるようになりました。
`WebGLRenderTarget` は、他の Compose UI 要素と一緒に WebGL グラフィックスを表示する Compose の `Painter` を公開します。

`rememberWebGLRenderTarget()` を使用してターゲットを作成し、`render {}` でターゲット内に描画して、その `painter` を `Image` 内で表示します。
たとえば、次のコード片は `@OptIn(ExperimentalComposeUiApi::class)` を付けたコンポーザブル内で青いテクスチャをレンダリングします。

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

より高度なユースケース向けに、`target` は基盤となる WebGL レンダリングコンテキストへのアクセスも提供します。

### Web におけるシステムウィンドウインセット {id="system-window-insets-on-web"}
<primary-label ref="Experimental"/>

Compose Multiplatform for web が、標準の `WindowInsets` API を介したシステムウィンドウインセットに対応しました。
ディスプレイカットアウトやオンスクリーンキーボードなどのセーフエリアを尊重しながら、UI をエッジトゥエッジ（画面端まで全面表示）で描画できます。

この機能を有効にするには、`ComposeViewport` の設定で `enableBrowserWindowInsets` を `true` に設定します。
レイアウトを調整するには、標準のインセット修飾子（Modifier）を使用します。

```kotlin
ComposeViewport(configure = { enableBrowserWindowInsets = true }) {
    Box(Modifier.fillMaxSize().safeDrawingPadding()) {
        Text("Content within the safe drawing area")
    }
}
```

`WindowInsets.safeDrawing` や `WindowInsets.ime` などの API を介して、インセットに直接アクセスすることもできます。

エッジトゥエッジのレンダリングを行うには、ページの viewport 用 `meta` タグに `viewport-fit=cover` を追加してください。

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

> `viewport-fit=cover` がない場合、ブラウザがセーフエリアのパディングを適用し、セーフエリアのインセットは 0 として報告されます。
> この設定を行わずにブラウザウィンドウのインセットを有効にすると、Compose Multiplatform は警告をログに出力します。

### Web におけるフォールバックフォントのカスタマイズ {id="configurable-font-fallback-on-web"}

前のリリースでは、アプリケーションのフォントでカバーされていない文字に対する[自動フォントフォールバック](compose-web-resources.md#automatic-font-fallback)が導入されました。
このリリースでは、フォールバックフォントの取得元を選択したり、自動ダウンロードを無効にしたりできるようになりました。

デフォルトでは、Compose Multiplatform はフォールバックフォントを [Google Fonts](https://fonts.gstatic.com/s/) からダウンロードします。
別の取得元を使用するには、ウィンドウ設定で `fontFallbackUrl` を設定します。

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

### AppCDS または AOT によるデスクトップ起動の高速化 {id="faster-desktop-startup-with-appcds-or-aot"}

Compose Multiplatform は、デスクトップアプリケーション向けに [Application Class-Data Sharing (AppCDS)](https://openjdk.org/jeps/310) および [Ahead-of-Time (AOT) キャッシング](https://openjdk.org/jeps/514) をサポートするようになりました。どちらのオプションもアーカイブを使用して起動時間を短縮します。

小規模なデモアプリケーションでのベンチマークでは、事前ビルドされた AOT キャッシュによってコールドスタート時間が短縮されました。

* macOS (M1 Ultra): 2017 ms から 424 ms へ — 4.8倍高速化。
* Windows (Dell Precision 5690): 1356 ms から 650 ms へ — 2.1倍高速化。

これらの測定値は、プロセスの起動からウィンドウが表示されるまでの時間を対象としています。
結果はアプリケーションや環境によって異なります。
AOT による起動の最適化には、最新の [JetBrains Runtime (JBR) 25](https://github.com/JetBrains/JetBrainsRuntime) リリースの使用をお勧めします。

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

使用している JDK バージョンとパッケージングの要件に基づいてモードを選択してください。

| モード             | 最小 JDK バージョン | 動作                                                                                           |
|------------------|-------------------|------------------------------------------------------------------------------------------------|
| `None`           | —                 | デフォルト。起動の最適化は行われません。                                                         |
| `AppCdsAuto`     | 19                | ユーザーの最初のセッション終了時に AppCDS アーカイブを作成し、それ以降の起動を高速化します。       |
| `AppCdsPrebuild` | 21                | パッケージング前に AppCDS アーカイブを作成し、初回起動時から高速化します。                     |
| `AotPrebuild`    | 25                | パッケージング前に AOT キャッシュを作成し、リンク処理や JIT のウォームアップも向上させます。     |

どちらの Prebuild モードも、パッケージング中にアーカイブを作成するためにアプリケーションを実行します。
このキャッシュ生成の実行中、プラグインはシステムプロパティ `compose.aot.training-run` を `true` に設定します。

なお、Prebuild モードではアーカイブがアプリケーションに含まれるため、配布サイズ（インストーラー等のサイズ）が増加することにご注意ください。

### macOS および Windows でのよりスムーズなウィンドウリサイズ {id="smoother-window-resizing-on-macos-and-windows"}

Compose Multiplatform で、macOS の Metal や Windows の DirectX を使用している場合に、よりスムーズなインタラクティブウィンドウリサイズがサポートされるようになりました。
レンダリングがウィンドウのリサイズと同期した状態を維持するため、カクつき（Stutter）が軽減され、ウィンドウの端に白い帯が表示されるのを防ぎます。

この挙動を有効にするには、ウィンドウを表示する前にレンダラー用のシステムプロパティを `true` に設定してください。
`System.setProperty()` または JVM の `-D` フラグで設定します。

* Metal を使用する macOS: `skiko.rendering.macos.metalSynchronousLiveResize`
* DirectX を使用する Windows: `skiko.rendering.windows.direct3DSynchronousLiveResize`

この機能を使用するには、Compose コンテンツがウィンドウ全体を埋めている必要があります。

## 依存関係 {id="dependencies"}

| ライブラリ            | Maven 座標                                                             | ベースとなる Jetpack バージョン                                                                                                      |
|--------------------|------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Runtime            | `org.jetbrains.compose.runtime:runtime*:1.13.0-beta02`                 | [Runtime 1.13.0-beta02](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.13.0-beta02)                       |
| UI                 | `org.jetbrains.compose.ui:ui*:1.13.0-beta02`                           | [UI 1.13.0-beta02](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.13.0-beta02)                                 |
| Foundation         | `org.jetbrains.compose.foundation:foundation*:1.13.0-beta02`           | [Foundation 1.13.0-beta02](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.13.0-beta02)                 |
| Material           | `org.jetbrains.compose.material:material*:1.13.0-beta02`               | [Material 1.13.0-beta02](https://developer.android.com/jetpack/androidx/releases/compose-material#1.13.0-beta02)                     |
| Material3          | `org.jetbrains.compose.material3:material3*:1.13.0-beta02`             | [Material3 1.5.0-beta02](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.5.0-beta02)                     |
| Material3 Adaptive | `org.jetbrains.compose.material3.adaptive:adaptive*:1.4.0-alpha01`     | [Material3 Adaptive 1.4.0-alpha03](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.4.0-alpha03) |
| Lifecycle          | `org.jetbrains.androidx.lifecycle:lifecycle-*:2.11.0`                  | [Lifecycle 2.11.0](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.11.0)                                         |
| Navigation         | `org.jetbrains.androidx.navigation:navigation-*:2.10.0`                | [Navigation 2.10.0](https://developer.android.com/jetpack/androidx/releases/navigation#2.10.0)                                       |
| Navigation3        | `org.jetbrains.androidx.navigation3:navigation3-*:1.2.0`               | [Navigation3 1.2.0](https://developer.android.com/jetpack/androidx/releases/navigation3#1.2.0)                                       |
| Navigation Event   | `org.jetbrains.androidx.navigationevent:navigationevent-compose:1.1.0` | [Navigation Event 1.1.1](https://developer.android.com/jetpack/androidx/releases/navigationevent#1.1.1)                              |
| Savedstate         | `org.jetbrains.androidx.savedstate:savedstate*:1.4.0`                  | [Savedstate 1.4.0](https://developer.android.com/jetpack/androidx/releases/savedstate#1.4.0)                                         |
| WindowManager Core | `org.jetbrains.androidx.window:window-core:1.5.1`                      | [WindowManager 1.5.1](https://developer.android.com/jetpack/androidx/releases/window#1.5.1)                                          |