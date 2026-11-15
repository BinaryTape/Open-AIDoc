[//]: # (title: Compose Multiplatform %org.jetbrains.compose-eap% の新機能)

このEAPリリースのハイライトは以下のとおりです:

* [SwiftUIおよびUIKitにおけるCompose Multiplatformビューのコンテンツに応じたサイズ設定](#content-based-sizing-for-compose-multiplatform-views-in-swiftui-and-uikit)
* [iOSでのパスワードの保存と自動入力](#saving-and-autofilling-passwords)
* [WebGLとの相互運用](#webgl-interop)
* [AppCDSおよびAOTオプションによるデスクトップの起動高速化](#faster-desktop-startup-with-appcds-or-aot)

このリリースのすべての変更点の一覧は、[GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.13.0-beta01)で確認できます。

特定のコンポーネントバージョンに関する詳細については、[依存関係](#dependencies)セクションを参照してください。
このリリースに含まれるAndroidX Compose runtimeバージョンの変更点については、[`androidx.compose.runtime`のリリースノート](https://developer.android.com/jetpack/androidx/releases/compose-runtime#version_113_2)を参照してください。

## プラットフォーム共通 {id="across-platforms"}

以前のCompose Multiplatformリリースで実験的（Experimental）だったいくつかの機能が安定版（Stable）になりました。
これらを使用するためにオプトインする必要はなくなりました:

* iOS上での `ComposeUIView()` の作成および `ComposeUIViewportConfiguration` を使用した設定。
* [`ComposeViewportConfiguration` によるWeb向け `ComposeViewport()` の設定](compose-css-styles.md)。
* [`preload` APIを使用したWeb向けリソースの事前読み込み](compose-web-resources.md#preload-resources-using-the-compose-multiplatform-preload-api)。

## iOS {id="ios"}

### SwiftUIおよびUIKitにおけるCompose Multiplatformビューのコンテンツに応じたサイズ設定 {id="content-based-sizing-for-compose-multiplatform-views-in-swiftui-and-uikit"}

SwiftUIまたはUIKitのレイアウトに埋め込まれたCompose Multiplatformビューで、利用可能なスペースに基づいて適切な推奨サイズ（preferred size）をレポートできるようになりました。
ネイティブコンテナはこのサイズを使用して、幅を固定したままビューの高さを調整したり、その逆を行ったりしてComposeコンテンツに合わせることができます。

Compose Multiplatformビューは、デフォルトで `PreferredSizeReportingStrategy.SizeThatFits` を使用します。
UIKitでは、追加のサイズ設定は不要です。

SwiftUIでは、iOS 16以降を実行しているデバイスではこのデフォルトのままにしてください。
それより前のiOSバージョン上のSwiftUIの場合は、`PreferredSizeReportingStrategy.IntrinsicContentSize` を使用し、手動でサイズの提案（sizing proposals）を指定してください。

セットアップ手順と例については、以下を参照してください:

* [SwiftUIでのコンテンツに応じたサイズ設定](compose-swiftui-integration.md#size-compose-views-to-fit-their-content)
* [UIKitでのコンテンツに応じたサイズ設定](compose-uikit-integration.md#size-compose-views-to-fit-their-content)

### パスワードの保存と自動入力 {id="saving-and-autofilling-passwords"}
<primary-label ref="Experimental"/>

iOSにおいて、Compose Multiplatformでログイン認証情報を保存するためのネイティブプロンプトの表示や、Composeのテキストフィールドへの自動入力（autofill）ができるようになりました。
iOSがフォームをログインフォームとして認識できるように、ユーザー名フィールドとパスワードフィールドの両方を画面上に表示したままにしてください。

フィールドを設定するには、iOSソースセットで `PlatformImeOptions` を使用します。
ユーザー名には `textContentType(UITextContentTypeUsername)` を、パスワードには `isSecureTextEntry(true)` を設定します。
たとえば、`@OptIn(ExperimentalComposeUiApi::class)` でアノテーションされたコンポーザブル内では次のように記述します:

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

### WebGLとの相互運用 {id="webgl-interop"}
<primary-label ref="Experimental"/>

Compose Multiplatformで、[WebGL](https://developer.mozilla.org/ja/docs/Web/API/WebGL_API)テクスチャを描画するための実験的APIが提供されるようになりました。
`WebGLRenderTarget` は、他のCompose UI要素と一緒にWebGLグラフィックスを表示するComposeの `Painter` を公開します。

`rememberWebGLRenderTarget()` を使用してターゲットを作成し、`render {}` で描画して、その `painter` を `Image` 内で表示します。
たとえば、以下のコードスニペットは `@OptIn(ExperimentalComposeUiApi::class)` を付けたコンポーザブル内で青いテクスチャを描画します:

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

### Webでのシステムウィンドウインセット {id="system-window-insets-on-web"}
<primary-label ref="Experimental"/>

Web向けCompose Multiplatformで、標準の `WindowInsets` APIを通じたシステムウィンドウインセットがサポートされるようになりました。
ディスプレイのカットアウトやオンスクリーンキーボードなどのセーフエリアを尊重しながら、UIを端から端まで（Edge-to-Edge）描画できます。

この機能を有効にするには、`ComposeViewport` の設定で `enableBrowserWindowInsets` を `true` に設定します。
レイアウトを調整するには、標準のインセット修飾子（Modifier）を使用します:

```kotlin
ComposeViewport(configure = { enableBrowserWindowInsets = true }) {
    Box(Modifier.fillMaxSize().safeDrawingPadding()) {
        Text("Content within the safe drawing area")
    }
}
```

`WindowInsets.safeDrawing` や `WindowInsets.ime` などのAPIを介して、インセットに直接アクセスすることもできます。

Edge-to-Edgeのレンダリングを行うには、ページのビューポート `meta` タグに `viewport-fit=cover` を追加します:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

> `viewport-fit=cover` がない場合、ブラウザはセーフエリアのパディングを適用し、セーフエリアのインセットをゼロとしてレポートします。
> この設定を行わずにブラウザウィンドウのインセットを有効にすると、Compose Multiplatformは警告を出力します。

### Webでのフォントフォールバックの設定 {id="configurable-font-fallback-on-web"}

前のリリースでは、アプリケーションのフォントでカバーされていない文字に対する[自動フォントフォールバック](compose-web-resources.md#automatic-font-fallback)が導入されました。
このリリースでは、フォールバックフォントの取得元を選択したり、自動ダウンロードを無効にしたりできるようになりました。

デフォルトでは、Compose Multiplatformは [Google Fonts](https://fonts.gstatic.com/s/) からフォールバックフォントをダウンロードします。
別の取得元を使用するには、ウィンドウ設定で `fontFallbackUrl` を指定します:

```kotlin
createComposeWindow(
    configure = { fontFallbackUrl = "https://custom.fonts.com" }
) {
    BasicText("გამარჯობა")
}
```

自動フォントフォールバックを無効にするには、`fontFallbackUrl` に `null` を設定します:

```kotlin
createComposeWindow(
    configure = { fontFallbackUrl = null }
) {
    BasicText("გამარჯობა")
}
```

## デスクトップ {id="desktop"}

### AppCDSまたはAOTによるデスクトップ起動の高速化 {id="faster-desktop-startup-with-appcds-or-aot"}

Compose Multiplatformのデスクトップアプリケーションで、[Application Class-Data Sharing (AppCDS)](https://openjdk.org/jeps/310) および [Ahead-of-Time (AOT) キャッシング](https://openjdk.org/jeps/514) がサポートされるようになりました。どちらのオプションも、アーカイブを使用して起動時間を短縮します。

小規模なデモアプリケーションでのベンチマークでは、事前に構築されたAOTキャッシュによりコールドスタート時間が短縮されました:

* macOS (M1 Ultra): 2017ミリ秒から424ミリ秒へ — 4.8倍高速化。
* Windows (Dell Precision 5690): 1356ミリ秒から650ミリ秒へ — 2.1倍高速化。

これらの測定値は、プロセスの起動からウィンドウが表示されるまでの時間を対象としています。
結果はアプリケーションや環境によって異なります。
AOTによる起動の最適化には、最新の [JetBrains Runtime (JBR) 25](https://github.com/JetBrains/JetBrainsRuntime) リリースを推奨します。

これらの起動オプションを有効にするには、`build.gradle.kts` ファイルで `aot {}` ブロックを設定します:

```kotlin
compose.desktop {
    application {
        aot {
            mode = AotMode.AotPrebuild
        }
    }
}
```

JDKバージョンとパッケージング要件に基づいてモードを選択してください:

| モード             | 最小JDK | 動作                                                                                       |
|------------------|-------------|------------------------------------------------------------------------------------------------|
| `None`           | —           | デフォルト。起動の最適化を行いません。                                                             |
| `AppCdsAuto`     | 19          | ユーザーの最初のセッション終了時にAppCDSアーカイブを作成し、それ以降の起動を高速化します。 |
| `AppCdsPrebuild` | 21          | パッケージング前にAppCDSアーカイブを作成し、初回起動時から高速化します。         |
| `AotPrebuild`    | 25          | パッケージング前にAOTキャッシュを作成し、リンクおよびJITのウォームアップも改善します。                  |

どちらの事前構築（Prebuild）モードでも、パッケージング中にアーカイブを作成するためにアプリケーションを実行します。
このキャッシュ生成の実行中、プラグインは `compose.aot.training-run` システムプロパティを `true` に設定します。

事前構築モードでは、アプリケーションにアーカイブが含まれるため、配布可能なパッケージのサイズが増加することに注意してください。

### macOSおよびWindowsでのよりスムーズなウィンドウリサイズ {id="smoother-window-resizing-on-macos-and-windows"}

macOSでMetalを使用している場合、またはWindowsでDirectXを使用している場合に、Compose Multiplatformでインタラクティブなウィンドウリサイズがよりスムーズに行えるようになりました。
レンダリングがウィンドウのリサイズと同期した状態を維持するため、カクつき（スタッター）が軽減され、ウィンドウの端に白い帯が表示されるのを防ぎます。

この動作を有効にするには、ウィンドウを表示する前に、レンダラー用のシステムプロパティを `true` に設定します。
`System.setProperty()` またはJVMの `-D` フラグで設定します:

* Metalを使用するmacOS: `skiko.rendering.macos.metalSynchronousLiveResize`
* DirectXを使用するWindows: `skiko.rendering.windows.direct3DSynchronousLiveResize`

この機能を使用するには、Composeコンテンツがウィンドウ全体を満たしている必要があります。

## 依存関係 {id="dependencies"}

| ライブラリ            | Maven座標                                                      | ベースとなるJetpackバージョン                                                                                                             |
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