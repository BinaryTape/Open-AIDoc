[//]: # (title: Compose Multiplatform 1.9.3 の新機能)

この機能リリースの主なハイライトは以下の通りです：

* [`@Preview` アノテーションのパラメータ](#parameters-for-the-preview-annotation)
* [カスタマイズ可能なシャドウ](#customizable-shadows)
* [新しいコンテキストメニュー API](#new-context-menu-api)
* [Material 3 Expressive テーマ](#material-3-expressive-theme)
* [iOS でのフレームレート設定](#frame-rate-configuration)
* [Compose Multiplatform for web が Beta に](#compose-multiplatform-for-web-in-beta)
* [Web ターゲットでのアクセシビリティサポート](#accessibility-support)
* [HTML コンテンツ埋め込み用の新しい API](#new-api-for-embedding-html-content)

このリリースの変更点の全リストについては、[GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.9.0) を参照してください。

## 依存関係

* Gradle プラグイン `org.jetbrains.compose`、バージョン 1.9.3。以下の Jetpack Compose ライブラリに基づいています：
   * [Runtime 1.9.4](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.9.4)
   * [UI 1.9.4](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.9.4)
   * [Foundation 1.9.4](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.9.4)
   * [Material 1.9.4](https://developer.android.com/jetpack/androidx/releases/compose-material#1.9.4)
   * [Material3 1.4.0](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.4.0)

* Compose Material3 ライブラリ `org.jetbrains.compose.material3:1.9.0`。 [Jetpack Material3 1.4.0](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.4.0) に基づいています。
  Compose Multiplatform と Material3 の[バージョン分離](#decoupled-material3-versioning)により、プロジェクトでより新しいプレリリースバージョンを選択できるようになりました。
* Compose Material3 Adaptive ライブラリ `org.jetbrains.compose.material3.adaptive:adaptive*:1.2.0`。 [Jetpack Material3 Adaptive 1.2.0](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.2.0) に基づいています。
* Lifecycle ライブラリ `org.jetbrains.androidx.lifecycle:lifecycle-*:2.9.6`。 [Jetpack Lifecycle 2.9.4](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.9.4) に基づいています。
* Navigation ライブラリ `org.jetbrains.androidx.navigation:navigation-*:2.9.1`。 [Jetpack Navigation 2.9.4](https://developer.android.com/jetpack/androidx/releases/navigation#2.9.4) に基づいています。
* Savedstate ライブラリ `org.jetbrains.androidx.savedstate:savedstate:1.3.6`。 [Jetpack Savedstate 1.3.3](https://developer.android.com/jetpack/androidx/releases/savedstate#1.3.3) に基づいています。
* WindowManager Core ライブラリ `org.jetbrains.androidx.window:window-core:1.4.0`。 [Jetpack WindowManager 1.4.0](https://developer.android.com/jetpack/androidx/releases/window#1.4.0) に基づいています。

## マルチプラットフォーム共通

### `@Preview` アノテーションのパラメータ

Compose Multiplatform の `@Preview` アノテーションに、デザインタイムプレビューで `@Composable` 関数をどのようにレンダリングするかを構成するための追加パラメータが含まれるようになりました。

* `name`: プレビューの表示名。
* `group`: プレビューのグループ名。関連するプレビューを論理的に整理し、選択的に表示できるようになります。
* `widthDp`: 最大幅 (dp 単位)。
* `heightDp`: 最大高さ (dp 単位)。
* `locale`: アプリケーションの現在のロケール。
* `showBackground`: プレビューにデフォルトの背景色を適用するためのフラグ。
* `backgroundColor`: プレビューの背景色を定義する 32 ビット ARGB カラー整数。

これらの新しいプレビューパラメータは、IntelliJ IDEA と Android Studio の両方で認識され、動作します。

### カスタマイズ可能なシャドウ

Compose Multiplatform 1.9.0 では、Jetpack Compose の新しいシャドウプリミティブと API を採用し、カスタマイズ可能なシャドウを導入しました。以前からサポートされていた `shadow` 修飾子に加えて、新しい API を使用して、より高度で柔軟なシャドウ効果を作成できるようになりました。

異なる種類のシャドウを作成するために、2 つの新しいプリミティブが利用可能です：
`DropShadowPainter()` と `InnerShadowPainter()`。

これらの新しいシャドウを UI コンポーネントに適用するには、`dropShadow` または `innerShadow` 修飾子を使用してシャドウ効果を構成します：

<list columns="2">
   <li><code-block lang="kotlin" code="        Box(&#10;            Modifier.size(120.dp)&#10;                .dropShadow(&#10;                    RectangleShape,&#10;                    DropShadow(12.dp)&#10;                )&#10;                .background(Color.White)&#10;        )&#10;        Box(&#10;            Modifier.size(120.dp)&#10;                .innerShadow(&#10;                    RectangleShape,&#10;                    InnerShadow(12.dp)&#10;                )&#10;        )"></code-block></li>
   <li><img src="compose-advanced-shadows.png" type="inline" alt="Customizable shadows" width="200"/></li>
</list>

任意の形状や色のシャドウを描画したり、シャドウのジオメトリをマスクとして使用して、内側にグラデーションが塗りつぶされたシャドウを作成したりすることもできます：

<img src="compose-expressive-shadows.png" alt="Expressive shadows" width="244"/>

詳細は、[シャドウ API リファレンス](https://developer.android.com/reference/kotlin/androidx/compose/ui/graphics/shadow/package-summary.html)を参照してください。

### 新しいコンテキストメニュー API

`SelectionContainer` と `BasicTextField` におけるカスタムコンテキストメニューのための、Jetpack Compose の新しい API を採用しました。iOS と Web では実装が完了しており、デスクトップでは初期サポートが提供されています。

<list columns="2">
   <li><img src="compose_basic_text_field.png" type="inline" alt="Context menu for BasicTextField" width="420"/></li>
   <li><img src="compose_selection_container.png" type="inline" alt="Context menu for SelectionContainer" width="440"/></li>
</list>

この新しい API を有効にするには、アプリケーションのエントリーポイントで以下の設定を使用します：

```kotlin
ComposeFoundationFlags.isNewContextMenuEnabled = true
```

詳細は、[コンテキストメニュー API リファレンス](https://developer.android.com/reference/kotlin/androidx/compose/foundation/text/contextmenu/data/package-summary)を参照してください。

### Material 3 Expressive テーマ
<primary-label ref="Experimental"/>

Compose Multiplatform が、Material 3 ライブラリの実験的な [`MaterialExpressiveTheme`](https://developer.android.com/reference/kotlin/androidx/compose/material3/package-summary?hl=en#MaterialExpressiveTheme(androidx.compose.material3.ColorScheme,androidx.compose.material3.MotionScheme,androidx.compose.material3.Shapes,androidx.compose.material3.Typography,kotlin.Function0)) をサポートするようになりました。Expressive テーマを使用すると、Material Design アプリをカスタマイズして、よりパーソナライズされた体験を提供できます。

> Jetpack Material3 [1.4.0-beta01 リリース](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.4.0-beta01)に合わせて、`ExperimentalMaterial3ExpressiveApi` および `ExperimentalMaterial3ComponentOverrideApi` タグが付いたすべてのパブリック API が削除されました。
>
> これらの実験的機能を使用したい場合は、明示的に Alpha バージョンの Material3 を含める必要があります。
{style="note"}

Expressive テーマを使用するには：

1. Material 3 の実験的バージョンを含めます：

    ```kotlin
    implementation("org.jetbrains.compose.material3:material3:1.9.0-alpha04")
    ```

2. `MaterialExpressiveTheme()` 関数を使用して、UI 要素の全体的なテーマを構成します。この関数には `@OptIn(ExperimentalMaterial3ExpressiveApi::class)` のオプトインが必要で、`colorScheme`、`motionScheme`、`shapes`、`typography` を指定できます。

これにより、[`Button()`](https://kotlinlang.org/api/compose-multiplatform/material3/androidx.compose.material3/-button.html) や [`Checkbox()`](https://kotlinlang.org/api/compose-multiplatform/material3/androidx.compose.material3/-checkbox.html) などの Material コンポーネントが、提供された値を自動的に使用するようになります。

<img src="compose_expressive_theme.animated.gif" alt="Material 3 Expressive" width="250" preview-src="compose_expressive_theme.png"/>

### `androidx.compose.runtime:runtime` におけるマルチプラットフォームターゲット

Compose Multiplatform と Jetpack Compose との整合性を向上させるため、すべてのターゲットへのサポートを `androidx.compose.runtime:runtime` アーティファクトに直接追加しました。

`org.jetbrains.compose.runtime:runtime` アーティファクトは引き続き完全な互換性を維持し、現在はエイリアスとして機能します。

### `suspend` ラムダを伴う `runComposeUiTest()`

`runComposeUiTest()` 関数が `suspend` ラムダを受け入れるようになり、`awaitIdle()` などのサスペンド関数を使用できるようになりました。

この新しい API は、Web 環境向けの適切な非同期処理を含め、サポートされているすべてのプラットフォームで正しいテスト実行を保証します：

* JVM および Native ターゲットの場合、`runComposeUiTest()` は `runBlocking()` と同様に動作しますが、ディレイをスキップします。
* Web ターゲット (Wasm および JS) の場合、`Promise` を返し、ディレイをスキップしてテスト本体を実行します。

## iOS

### フレームレート設定

Compose Multiplatform for iOS で、コンポーザブルをレンダリングするための優先フレームレートを構成できるようになりました。アニメーションがカクついている（スタッタリングが発生している）場合は、フレームレートを上げることができます。一方で、アニメーションが遅い場合や静止している場合は、消費電力を抑えるために低いフレームレートで実行することを選択できます。

優先フレームレートのカテゴリは次のように設定できます：

```kotlin
Modifier.preferredFrameRate(FrameRateCategory.High)
```

あるいは、コンポーザブルに特定のフレームレートが必要な場合は、非負の数値を使用して 1 秒あたりのフレーム数で優先フレームレートを定義できます：

```kotlin
Modifier.preferredFrameRate(30f)
```

同じ `@Composable` ツリー内で `preferredFrameRate` が複数回適用された場合、指定された中で最も高い値が適用されます。ただし、デバイスのハードウェアによって、サポートされるフレームレート（通常は最大 120 Hz まで）に制限される場合があります。

### IME オプション

Compose Multiplatform 1.9.0 では、テキスト入力コンポーネントにおける iOS 固有の IME カスタマイズのサポートが導入されました。`PlatformImeOptions` を使用して、キーボードタイプ、自動修正、Return キーの動作などのネイティブ UIKit テキスト入力特性を、テキストフィールドコンポーネント内で直接構成できるようになりました：

```kotlin
BasicTextField(
    value = "",
    onValueChange = {},
    keyboardOptions = KeyboardOptions(
        platformImeOptions = PlatformImeOptions {
            keyboardType(UIKeyboardTypeEmailAddress)
        }
    )
)
```

## Web

### Compose Multiplatform for web が Beta に

Compose Multiplatform for web が Beta になりました。ぜひお試しください。このマイルストーンに到達するまでの進捗については、[公式ブログ記事](https://blog.jetbrains.com/kotlin/2025/09/compose-multiplatform-1-9-0-compose-for-web-beta/)をご覧ください。

安定版リリースに向けて、私たちのロードマップには以下が含まれています：

* モバイルブラウザにおけるドラッグ＆ドロップ機能のサポート実装。
* アクセシビリティサポートの向上。
* `TextField` コンポーネントに関連する問題への対応。

### アクセシビリティサポート

Compose Multiplatform で、Web ターゲットに対する初期のアクセシビリティサポートが提供されました。このバージョンでは、スクリーンリーダーが説明ラベルにアクセスできるようになり、ユーザーがアクセシブルなナビゲーションモードでボタンを移動したりクリックしたりできるようになります。

このバージョンでは、以下の機能はまだサポートされていません：

* スクロールやスライダーを伴う相互運用（interop）およびコンテナビューのアクセシビリティ。
* トラバーサル（巡回）インデックス。

コンポーネントの[セマンティックプロパティ](compose-accessibility.md#semantic-properties)を定義することで、コンポーネントのテキストによる説明、機能タイプ、現在の状態、一意の識別子など、さまざまな詳細をアクセシビリティサービスに提供できます。

例えば、コンポーザブルに `Modifier.semantics { heading() }` を設定することで、その要素がドキュメント内の章や節の見出しのように機能することをアクセシビリティサービスに通知できます。スクリーンリーダーはこの情報を使用してコンテンツをナビゲートし、ユーザーが見出し間を直接ジャンプできるようにします。

```kotlin
Text(
    text = "これは見出しです", 
    modifier = Modifier.semantics { heading() }
)
```

アクセシビリティサポートは現在デフォルトで有効になっていますが、`isA11YEnabled` を調整することでいつでも無効にできます：

```kotlin
ComposeViewport(
    viewportContainer = document.body!!,
    configure = { isA11YEnabled = false }
) {
    Text("Hello, Compose Multiplatform for web")
}
```

### HTML コンテンツ埋め込み用の新しい API

新しい `WebElementView()` コンポーザブル関数を使用すると、Web アプリケーションに HTML 要素をシームレスに統合できます。

埋め込まれた HTML 要素は、Compose コードで定義されたサイズに基づいてキャンバス領域にオーバーレイされます。その領域内の入力イベントをインターセプトし、それらのイベントが Compose Multiplatform に受信されるのを防ぎます。

以下は、`WebElementView()` を使用して、Compose アプリケーション内にインタラクティブなマップビューを表示する HTML 要素を作成し、埋め込む例です：

```kotlin
private val ttOSM =
    "https://www.openstreetmap.org/export/embed.html?bbox=4.890965223312379%2C52.33722052818563%2C4.893990755081177%2C52.33860862450587&amp;layer=mapnik"

@Composable
fun Map() {
    Box(
        modifier = Modifier.fillMaxWidth().fillMaxHeight()
    ) {
        WebElementView(
            factory = {
                (document.createElement("iframe")
                        as HTMLIFrameElement)
                    .apply { src = ttOSM }
            },
            modifier = Modifier.fillMaxSize(),
            update = { iframe -> iframe.src = iframe.src }
        )
    }
}
```

`CanvasBasedWindow` は非推奨となったため、この関数は `ComposeViewport` エントリーポイントでのみ使用できることに注意してください。

### ナビゲーショングラフへのバインディング用 API の簡素化

Compose Multiplatform では、ブラウザのナビゲーション状態を `NavController` にバインドするための新しい API が導入されました：

```kotlin
suspend fun NavController.bindToBrowserNavigation()
```

この新しい関数により、`window` API と直接やり取りする必要がなくなり、Kotlin/Wasm と Kotlin/JS の両方のソースセットが簡素化されます。

以前使用されていた `Window.bindToNavigation()` 関数は、新しい `NavController.bindToBrowserNavigation()` 関数に取って代わられ、非推奨となりました。

以前：

```kotlin
LaunchedEffect(Unit) {
    // window オブジェクトと直接やり取りする
    window.bindToNavigation(navController)
}
```

以後：

```kotlin
LaunchedEffect(Unit) {
    // 暗黙的に window オブジェクトにアクセスする
    navController.bindToBrowserNavigation()
}
```

## デスクトップ

### 表示前のウィンドウ構成

Compose Multiplatform に、新しい `SwingFrame()` および `SwingDialog()` コンポーザブルが含まれるようになりました。これらは既存の `Window()` および `DialogWindow()` 関数に似ていますが、`init` ブロックが含まれています。

以前は、表示前に構成する必要がある特定のウィンドウプロパティを設定することができませんでした。新しい `init` ブロックはウィンドウやダイアログが画面に表示される前に実行されるため、`java.awt.Window.setType` のようなプロパティの構成や、早期に準備しておく必要があるイベントリスナーの追加が可能です。

`init` ブロックは、ウィンドウやダイアログが表示された後では変更できないプロパティに対してのみ使用することをお勧めします。それ以外のすべての構成については、引き続き `LaunchedEffect(window)` パターンを使用して、コードの互換性を維持し、将来のアップデートでも正しく動作するようにしてください。

## Gradle プラグイン

### Material3 バージョンの分離

Material3 ライブラリと Compose Multiplatform Gradle プラグインのバージョンおよび安定レベルを一致させる必要がなくなりました。`compose.material3` DSL エイリアスは Jetpack Compose の安定版リリースからの Material3 1.9.0 を参照しますが、プロジェクトに合わせてプレリリースバージョンを選択することもできます。

Expressive デザインをサポートする Material3 バージョンを使用する場合は、`build.gradle.kts` の Material 3 依存関係を以下に置き換えてください：

```kotlin
implementation("org.jetbrains.compose.material3:material3:1.9.0-alpha04")
```

### 統一された Web 配布

新しい `composeCompatibilityBrowserDistribution` Gradle タスクは、Kotlin/JS と Kotlin/Wasm の配布物を単一のパッケージに統合します。これにより、モダンな Wasm 機能がブラウザでサポートされていない場合に、Wasm アプリケーションが JS ターゲットにフォールバックできるようになります。

### AGP 9.0.0 のサポート

Compose Multiplatform が Android Gradle プラグイン (AGP) のバージョン 9.0.0 のサポートを導入しました。新しい AGP バージョンとの互換性を確保するために、Compose Multiplatform 1.9.3 または 1.10.0 へのアップグレードを確認してください。

長期的にアップデートプロセスをよりスムーズにするために、専用の Android アプリケーションモジュールを使用するようにプロジェクト構造を変更することをお勧めします。