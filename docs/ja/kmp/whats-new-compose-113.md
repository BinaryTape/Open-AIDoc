[//]: # (title: Compose Multiplatform %org.jetbrains.compose-eap% の新機能)

この EAP リリースの主なハイライトは以下のとおりです。

* [SwiftUI および UIKit における Compose Multiplatform ビューのコンテンツに応じたサイズ設定](#content-based-sizing-for-compose-multiplatform-views-in-swiftui-and-uikit)
* [iOS でのパスワードの保存と自動入力](#saving-and-autofilling-passwords)
* [WebGL 相互運用](#webgl-interop)
* [AppCDS および AOT オプションによるデスクトップ起動の高速化](#faster-desktop-startup-with-appcds-or-aot)

このリリースの変更点の完全なリストは、[GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.13.0-beta01) で確認できます。

特定のコンポーネントのバージョンに関する詳細については、[依存関係](#dependencies) セクションを参照してください。
このリリースに含まれる AndroidX Compose ランタイムバージョンの変更点については、[`androidx.compose.runtime` のリリースノート](https://developer.android.com/jetpack/androidx/releases/compose-runtime#version_113_2) を参照してください。

## プラットフォーム共通 {id="across-platforms"}

以前の Compose Multiplatform リリースで[試験的（Experimental）](supported-platforms.md#general-kotlin-stability-levels)だったいくつかの機能が、[安定（Stable）](supported-platforms.md#general-kotlin-stability-levels)になりました。
使用する際にオプトインする必要はなくなりました。

* iOS での `ComposeUIView()` の作成および `ComposeUIViewportConfiguration` による設定。
* [`ComposeViewportConfiguration` による Web 向け `ComposeViewport()` の設定](compose-css-styles.md)。
* [`preload` API による Web 向けリソースの事前読み込み](compose-web-resources.md#preload-resources-using-the-compose-multiplatform-preload-api)。

## iOS {id="ios"}

### SwiftUI および UIKit における Compose Multiplatform ビューのコンテンツに応じたサイズ設定 {id="content-based-sizing-for-compose-multiplatform-views-in-swiftui-and-uikit"}

SwiftUI または UIKit のレイアウトに埋め込まれた Compose Multiplatform ビューが、利用可能なスペースに基づいて優先サイズ（preferred size）をレポートできるようになりました。
ネイティブコンテナはこのサイズを使用して Compose コンテンツを収めることができ、例えば幅を固定したままビューの高さを調整したり、その逆を行ったりすることができます。

Compose Multiplatform ビューは、デフォルトで `PreferredSizeReportingStrategy.SizeThatFits` を使用します。
UIKit では、追加のサイズ設定は必要ありません。

SwiftUI では、iOS 16 以降を実行しているデバイスでこのデフォルトを維持してください。
それより前の iOS バージョンにおける SwiftUI では、`PreferredSizeReportingStrategy.IntrinsicContentSize` を使用し、手動でサイズの提案（sizing proposals）を指定してください。

セットアップ手順と例については、以下を参照してください。

* [SwiftUI でのコンテンツに応じたサイズ設定](compose-swiftui-integration.md#size-compose-views-to-fit-their-content)
* [UIKit でのコンテンツに応じたサイズ設定](compose-uikit-integration.md#size-compose-views-to-fit-their-content)

### パスワードの保存と自動入力 {id="saving-and-autofilling-passwords"}
<primary-label ref="Experimental"/>

iOS において、Compose Multiplatform でログイン認証情報を保存するためのネイティブプロンプトの表示や、Compose のテキストフィールドへの自動入力を行えるようになりました。
iOS がフォームをログインフォームとして認識できるように、ユーザー名フィールドとパスワードフィールドの両方を画面上に配置してください。

フィールドを設定するには、iOS ソースセットで `PlatformImeOptions` を使用します。
ユーザー名には `textContentType(UITextContentTypeUsername)` を設定し、パスワードには `isSecureTextEntry(true)` を設定します。
例えば、`@OptIn(ExperimentalComposeUiApi::class)` でアノテーションされたコンポーザブル内では以下のように記述します。

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

### WebGL 相互運用 {id="webgl-interop"}
<primary-label ref="Experimental"/>

Compose Multiplatform で、[WebGL](https://developer.mozilla.org/ja/docs/Web/API/WebGL_API) テクスチャをレンダリングするための試験的 API が提供されるようになりました。
`WebGLRenderTarget` は、他の Compose UI 要素とともに WebGL グラフィックを表示する Compose の `Painter` を公開します。

`rememberWebGLRenderTarget()` を使用してターゲットを作成し、`render {}` で描画して、その `painter` を `Image` に表示します。
例えば、以下のフラグメントは `@OptIn(ExperimentalComposeUiApi::class)` を付けたコンポーザブル内で青いテクスチャをレンダリングします。

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

### Web でのシステムウィンドウインセット {id="system-window-insets-on-web"}
<primary-label ref="Experimental"/>

Web 向け Compose Multiplatform が、標準の `WindowInsets` API を介したシステムウィンドウインセットをサポートするようになりました。
UI は、ディスプレイカットアウトやオンスクリーンキーボードなどのセーフエリアを尊重しながら、エッジトゥエッジ（画面端まで全面表示）で描画できます。

この機能を有効にするには、`ComposeViewport` の設定で `enableBrowserWindowInsets` を `true` に設定します。
標準のインセット修飾子を使用してレイアウトを調整します。

```kotlin
ComposeViewport(configure = { enableBrowserWindowInsets = true }) {
    Box(Modifier.fillMaxSize().safeDrawingPadding()) {
        Text("Content within the safe drawing area")
    }
}
```

また、`WindowInsets.safeDrawing` や `WindowInsets.ime` などの API を介して直接インセットにアクセスすることもできます。

エッジトゥエッジでレンダリングするには、ページのビューポート `meta` タグに `viewport-fit=cover` を追加します。

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

> `viewport-fit=cover` がない場合、ブラウザはセーフエリアのパディングを適用し、セーフエリアインセットとしてゼロをレポートします。
> この設定なしでブラウザウィンドウインセットが有効になっている場合、Compose Multiplatform は警告をログに出力します。

### Web での設定可能なフォントフォールバック {id="configurable-font-fallback-on-web"}

以前のリリースでは、アプリケーションのフォントでカバーされていない文字に対する[自動フォントフォールバック](compose-web-resources.md#automatic-font-fallback)を導入しました。
このリリースでは、フォールバックフォントのソースを選択したり、自動ダウンロードを無効にしたりできるようになりました。

デフォルトでは、Compose Multiplatform は [Google Fonts](https://fonts.gstatic.com/s/) からフォールバックフォントをダウンロードします。
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

### AppCDS または AOT によるデスクトップ起動の高速化 {id="faster-desktop-startup-with-appcds-or-aot"}

Compose Multiplatform が、デスクトップアプリケーション向けに [Application Class-Data Sharing (AppCDS)](https://openjdk.org/jeps/310) および [Ahead-of-Time (AOT) キャッシュ](https://openjdk.org/jeps/514)をサポートするようになりました。どちらのオプションもアーカイブを使用して起動時間を短縮します。

小規模なデモアプリケーションでのベンチマークでは、ビルド時に事前生成された AOT キャッシュによってコールドスタート時間が短縮されました。

* macOS (M1 Ultra): 2017 ms から 424 ms へ — 4.8 倍高速化。
* Windows (Dell Precision 5690): 1356 ms から 650 ms へ — 2.1 倍高速化。

これらの測定値は、プロセスの起動からウィンドウが表示されるまでの時間を対象としています。
結果はアプリケーションや環境によって異なります。
AOT による起動の最適化には、最新の [JetBrains Runtime (JBR) 25](https://github.com/JetBrains/JetBrainsRuntime) リリースをお勧めします。

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

JDK のバージョンとパッケージングの要件に基づいてモードを選択してください。

| モード             | 最小 JDK | 動作                                                                                           |
|------------------|-------------|------------------------------------------------------------------------------------------------|
| `None`           | —           | デフォルト。起動の最適化は行われません。                                                             |
| `AppCdsAuto`     | 19          | ユーザーの初回セッション終了時に AppCDS アーカイブを作成し、その後の起動を高速化します。               |
| `AppCdsPrebuild` | 21          | パッケージング前に AppCDS アーカイブを作成し、初回起動時から高速化します。                           |
| `AotPrebuild`    | 25          | パッケージング前に AOT キャッシュを作成し、リンクと JIT ウォームアップも改善します。                  |

どちらのプリビルドモードでも、アーカイブを作成するためにパッケージング中にアプリケーションが実行されます。
このキャッシュ生成実行の間、プラグインは `compose.aot.training-run` システムプロパティを `true` に設定します。

プリビルドモードではアプリケーションにアーカイブが含まれるため、配布可能ファイルのサイズが増加することに注意してください。

### macOS および Windows でのウィンドウサイズ変更のスムーズ化 {id="smoother-window-resizing-on-macos-and-windows"}

Compose Multiplatform は、macOS で Metal、Windows で DirectX を使用している場合、対話的なウィンドウサイズ変更のよりスムーズな処理をサポートするようになりました。
レンダリングがウィンドウのサイズ変更と同期されたまま維持されるため、カクつき（スタッター）が軽減され、ウィンドウの端に白い帯が表示されるのを防ぎます。

この動作を有効にするには、ウィンドウを表示する前にレンダラー用のシステムプロパティを `true` に設定します。
`System.setProperty()` または JVM の `-D` フラグを使用して設定します。

* macOS (Metal): `skiko.rendering.macos.metalSynchronousLiveResize`
* Windows (DirectX): `skiko.rendering.windows.direct3DSynchronousLiveResize`

この機能を使用するには、Compose コンテンツがウィンドウ全体を埋める必要があります。

## 依存関係 {id="dependencies"}

| ライブラリ            | Maven 座標                                                      | ベースとなる Jetpack バージョン                                                                                                             |
|--------------------|------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Runtime            | `org.jetbrains.compose.runtime:runtime*:1.13.0-rc01`                   | [Runtime 1.13.0-rc01](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.13.0-rc01)                           |
| UI                 | `org.jetbrains.compose.ui:ui*:1.13.0-rc01`                             | [UI 1.13.0-rc01](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.13.0-rc01)                                     |
| Foundation         | `org.jetbrains.compose.foundation:foundation*:1.13.0-rc01`             | [Foundation 1.13.0-rc01](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.13.0-rc01)                     |
| Material           | `org.jetbrains.compose.material:material*:1.13.0-rc01`                 | [Material 1.13.0-rc01](https://developer.android.com/jetpack/androidx/releases/compose-material#1.13.0-rc01)                         |
| Material3          | `org.jetbrains.compose.material3:material3*:1.13.0-rc01`               | [Material3 1.5.0-rc01](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.5.0-rc01)                         |
| Material3 Adaptive | `org.jetbrains.compose.material3.adaptive:adaptive*:1.4.0-alpha01`     | [Material3 Adaptive 1.4.0-alpha03](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.4.0-alpha03) |
| Lifecycle          | `org.jetbrains.androidx.lifecycle:lifecycle-*:2.11.0`                  | [Lifecycle 2.11.0](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.11.0)                                         |
| Navigation         | `org.jetbrains.androidx.navigation:navigation-*:2.10.0`                | [Navigation 2.10.0](https://developer.android.com/jetpack/androidx/releases/navigation#2.10.0)                                       |
| Navigation3        | `org.jetbrains.androidx.navigation3:navigation3-*:1.2.0`               | [Navigation3 1.2.0](https://developer.android.com/jetpack/androidx/releases/navigation3#1.2.0)                                       |
| Navigation Event   | `org.jetbrains.androidx.navigationevent:navigationevent-compose:1.1.0` | [Navigation Event 1.1.1](https://developer.android.com/jetpack/androidx/releases/navigationevent#1.1.1)                              |
| Savedstate         | `org.jetbrains.androidx.savedstate:savedstate*:1.4.0`                  | [Savedstate 1.4.0](https://developer.android.com/jetpack/androidx/releases/savedstate#1.4.0)                                         |
| WindowManager Core | `org.jetbrains.androidx.window:window-core:1.5.1`                      | [WindowManager 1.5.1](https://developer.android.com/jetpack/androidx/releases/window#1.5.1)                                          |