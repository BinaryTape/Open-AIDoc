[//]: # (title: Compose Multiplatform 1.7.3 の新機能)

この機能リリースの主なハイライトは以下のとおりです。

* [型安全な Navigation](#type-safe-navigation)
* [共有要素遷移（Shared element transitions）](#shared-element-transitions)
* [Android assets にパッケージ化されたマルチプラットフォームリソース](#resources-packed-into-android-assets)
* [カスタムリソースディレクトリ](#custom-resource-directories)
* [マルチプラットフォームテストリソースのサポート](#support-for-multiplatform-test-resources)
* [iOS におけるタッチ操作の相互運用の改善](#new-default-behavior-for-processing-touch-in-ios-native-elements)
* [共通コードで利用可能になった Material3 `adaptive` および `material3-window-size-class`](#material3-adaptive-adaptive)
* [デスクトップでのドラッグ＆ドロップの実装](#drag-and-drop)
* [デスクトップで採用された `BasicTextField`](#basictextfield-renamed-from-basictextfield2-adopted-on-desktop)

このリリースの変更点の全リストについては、[GitHub](https://github.com/JetBrains/compose-multiplatform/blob/master/CHANGELOG.md#170-october-2024) をご覧ください。

## 依存関係 {id="dependencies"}

* Gradle プラグイン `org.jetbrains.compose` バージョン 1.7.3。以下の Jetpack Compose ライブラリに基づいています。
  * [Runtime 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.7.5)
  * [UI 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.7.5)
  * [Foundation 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.7.5)
  * [Material 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-material#1.7.5)
  * [Material3 1.3.1](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.3.1)
* Lifecycle ライブラリ `org.jetbrains.androidx.lifecycle:lifecycle-*:2.8.3`。[Jetpack Lifecycle 2.8.5](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.8.5) に基づいています。
* Navigation ライブラリ `org.jetbrains.androidx.navigation:navigation-*:2.8.0-alpha10`。[Jetpack Navigation 2.8.0](https://developer.android.com/jetpack/androidx/releases/navigation#2.8.0) に基づいています。
* Material3 Adaptive ライブラリ `org.jetbrains.compose.material3.adaptive:adaptive-*:1.0.0`。[Jetpack Material3 Adaptive 1.0.0](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.0.0) に基づいています。

## 破壊的変更 {id="breaking-changes"}

### AGP の最小バージョンが 8.1.0 に引き上げ {id="minimum-agp-version-raised-to-8-1-0"}

Compose Multiplatform 1.7.0 で使用されている Jetpack Compose 1.7.0 および Lifecycle 2.8.0 は、どちらも AGP 7 をサポートしていません。
そのため、Compose Multiplatform 1.7.3 にアップデートする際は、AGP の依存関係もアップグレードする必要がある場合があります。

> Android Studio で新たに実装された Android composable のプレビューには、[最新の AGP バージョンのいずれかが必要です](#resources-packed-into-android-assets)。
>
{style="note"}

### Java リソース API が非推奨になり、マルチプラットフォームリソースライブラリが推奨に {id="java-resources-api-is-deprecated-in-favor-of-the-multiplatform-resource-library"}

本リリースでは、`compose.ui` パッケージで利用可能だった Java リソース API（`painterResource()`、`loadImageBitmap()`、`loadSvgPainter()`、`loadXmlImageVector()` 関数、および `ClassLoaderResourceLoader` クラスとそれに依存する関数）を明示的に非推奨（deprecated）としました。

[マルチプラットフォームリソースライブラリ](compose-multiplatform-resources.md) への移行をご検討ください。
Compose Multiplatform でも Java リソースを引き続き使用することはできますが、生成されたアクセサ、マルチモジュールサポート、ローカライズなど、フレームワークが提供する拡張機能の恩恵を受けることはできません。

引き続き Java リソースにアクセスする必要がある場合は、[プルリクエストで提案されている実装](https://github.com/JetBrains/compose-multiplatform-core/pull/1457) をコピーすることで、Compose Multiplatform 1.7.3 へのアップグレード後もコードが動作するようにしつつ、可能な箇所からマルチプラットフォームリソースへと移行できます。

### iOS ネイティブ要素におけるタッチ処理の新しいデフォルトの挙動 {id="new-default-behavior-for-processing-touch-in-ios-native-elements"}

1.7.3 より前は、Compose Multiplatform は相互運用（interop）UI ビュー内で行われたタッチイベントに応答できず、相互運用ビューがそれらのタッチシーケンスを完全に処理していました。

Compose Multiplatform 1.7.3 では、相互運用タッチシーケンスを処理するためのより高度なロジックが実装されています。
デフォルトでは、最初のタッチの後に遅延が発生するようになり、親の composable がそのタッチシーケンスがネイティブビューとの対話を意図したものかどうかを判断し、それに応じて反応できるようになりました。

詳細については、[このページの iOS セクション](#ios-touch-interop) の解説をご覧いただくか、[この機能のドキュメント](compose-ios-touch.md) をお読みください。

### iOS における最小フレーム時間無効化の必須化 {id="disabling-minimum-frame-duration-on-ios-is-mandatory"}

開発者が高リフレッシュレートディスプレイに関する出力警告を見落とすことが多く、120Hz 対応デバイスを持つユーザーが滑らかなアニメーションを享受できない問題がありました。
現在、このチェックを厳格に適用しています。`Info.plist` ファイル内の `CADisableMinimumFrameDurationOnPhone` プロパティが存在しないか `false` に設定されている場合、Compose Multiplatform でビルドされたアプリはクラッシュするようになります。

この挙動を無効にするには、`ComposeUIViewControllerConfiguration.enforceStrictPlistSanityCheck` プロパティを `false` に設定します。

### デスクトップにおける Modifier.onExternalDrag の非推奨化 {id="deprecated-modifier-onexternaldrag-on-desktop"}

実験的機能であった `Modifier.onExternalDrag` および関連 API は非推奨となり、新しい `Modifier.dragAndDropTarget` が推奨されます。
`DragData` インターフェースは `compose.ui.draganddrop` パッケージに移動しました。

Compose Multiplatform 1.7.0 でこれらの非推奨 API を使用している場合、非推奨エラーが発生します。
1.8.0 では、`onExternalDrag` 修飾子は完全に削除される予定です。

## プラットフォーム共通 {id="across-platforms"}

### 共有要素遷移（Shared element transitions） {id="shared-element-transitions"}

Compose Multiplatform で、共通の要素を持つ composable 間をシームレスに遷移させるための API が提供されるようになりました。
これらの遷移はナビゲーションでよく役立ち、ユーザーが UI の変化の軌跡を追うのを支援します。

API の詳細については、[Jetpack Compose のドキュメント](https://developer.android.com/develop/ui/compose/animation/shared-elements) をご覧ください。

### 型安全な Navigation {id="type-safe-navigation"}

Compose Multiplatform は、ナビゲーションルートに沿ってオブジェクトを渡す Jetpack Compose の型安全なアプローチを採用しました。
Navigation 2.8.0 の新しい API により、Compose はナビゲーショングラフにコンパイル時の安全性を提供できます。
これらの API は、XML ベースのナビゲーションにおける [Safe Args](https://developer.android.com/guide/navigation/use-graph/pass-data#Safe-args) プラグインと同じ結果をもたらします。

詳細については、[Navigation Compose における型安全性に関する Google のドキュメント](https://developer.android.com/guide/navigation/design/type-safety) をご覧ください。

### マルチプラットフォームリソース {id="multiplatform-resources"}

#### Android assets にパッケージ化されたリソース {id="resources-packed-into-android-assets"}

すべてのマルチプラットフォームリソースが Android assets にパッケージ化されるようになりました。これにより、Android Studio は Android ソースセット内の Compose Multiplatform composable のプレビューを生成できるようになります。

> Android Studio のプレビューは、Android ソースセット内の composable でのみ利用可能です。
> また、最新バージョンの AGP（8.5.2、8.6.0-rc01、または 8.7.0-alpha04 のいずれか）が必要です。
>
{style="note"}

また、リソースには `Res.getUri("files/index.html")` などのシンプルなパスで到達できるため、Android 上の WebView やメディアプレイヤーコンポーネントからマルチプラットフォームリソースへ直接アクセスすることも可能になります。

以下は、リソース画像へのリンクを含むリソース HTML ページを表示する Android composable の例です。

```kotlin
// androidMain/kotlin/com/example/webview/App.kt
@OptIn(ExperimentalResourceApi::class)
@Composable
@Preview
fun App() {
    MaterialTheme {
        val uri = Res.getUri("files/webview/index.html")

        // フルスクリーンのレイアウトで AndroidView 内に WebView を追加
        AndroidView(factory = {
            WebView(it).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
            }
        }, update = {
            it.loadUrl(uri)
        })
    }
}
```
{initial-collapse-state="collapsed" collapsible="true"  collapsed-title="AndroidView(factory = { WebView(it).apply"}

この例は、次のシンプルな HTML ファイルで動作します。

```html
<html>
<header>
    <title>
        Cat Resource
    </title>
</header>
<body>
    <img src="cat.jpg">
</body>
</html>
```
{initial-collapse-state="collapsed" collapsible="true"  collapsed-title="<title>Cat Resource</title>"}

この例の両方のリソースファイルは、`commonMain` ソースセットに配置されています。

![composeResources ディレクトリのファイル構造](compose-resources-android-webview.png){width="230"}

#### カスタムリソースディレクトリ {id="custom-resource-directories"}

構成 DSL の新しい `customDirectory` 設定を使用すると、[カスタムディレクトリを特定のソースセットに関連付ける](compose-multiplatform-resources-setup.md#custom-resource-directories) ことができます。これにより、例えばダウンロードしたファイルをリソースとして使用することなどが可能になります。

#### マルチプラットフォームフォントキャッシュ {id="multiplatform-font-cache"}

Compose Multiplatform は Android のフォントキャッシュ機能を他のプラットフォームにも導入し、`Font` リソースの過剰なバイト読み取りを排除します。

#### マルチプラットフォームテストリソースのサポート {id="support-for-multiplatform-test-resources"}

リソースライブラリがプロジェクトでのテストリソースの使用をサポートするようになり、以下のことが可能になりました。

* テストソースセットへのリソースの追加。
* 対応するソースセットでのみ利用可能な、生成されたアクセサの使用。
* テスト実行時のみアプリにテストリソースをパッケージ化。

#### アクセスを容易にする文字列 ID にマッピングされたリソース {id="resources-mapped-to-string-ids-for-easy-access"}

各タイプのリソースは、そのファイル名とマッピングされています。例えば、`Res.allDrawableResources` プロパティを使用してすべての `drawable` リソースのマップを取得し、文字列 ID を渡すことで必要なリソースにアクセスできます。

```kotlin
Image(painterResource(Res.allDrawableResources["compose_multiplatform"]!!), null)
```

#### バイト配列を ImageBitmap または ImageVector に変換する関数 {id="functions-for-converting-byte-arrays-into-imagebitmap-or-imagevector"}

`ByteArray` を画像リソースに変換するための新しい関数が追加されました。

* `decodeToImageBitmap()` は、JPEG、PNG、BMP、または WEBP ファイルを `ImageBitmap` オブジェクトに変換します。
* `decodeToImageVector()` は、XML ベクターファイルを `ImageVector` オブジェクトに変換します。
* `decodeToSvgPainter()` は、SVG ファイルを `Painter` オブジェクトに変換します。この関数は Android では利用できません。

詳細については、[ドキュメント](compose-multiplatform-resources-usage.md#convert-byte-arrays-into-images) をご覧ください。

### 新しい共通モジュール {id="new-common-modules"}

#### material3.adaptive:adaptive* {id="material3-adaptive-adaptive"}

Material3 adaptive モジュールが、Compose Multiplatform を使用した共通コードで利用可能になりました。
これらを使用するには、モジュールの `build.gradle.kts` ファイル内の共通ソースセットに対応する依存関係を明示的に追加します。

```kotlin
commonMain.dependencies {
    implementation("org.jetbrains.compose.material3.adaptive:adaptive:1.0.0-alpha03")
    implementation("org.jetbrains.compose.material3.adaptive:adaptive-layout:1.0.0-alpha03")
    implementation("org.jetbrains.compose.material3.adaptive:adaptive-navigation:1.0.0-alpha03")
}
```

#### material3.material3-adaptive-navigation-suite {id="material3-material3-adaptive-navigation-suite"}

Compose で[アダプティブナビゲーションを構築する](https://developer.android.com/develop/ui/compose/layouts/adaptive/build-adaptive-navigation) ために必要な Material3 adaptive navigation suite が、Compose Multiplatform を使用した共通コードで利用可能になりました。
これを使用するには、モジュールの `build.gradle.kts` ファイル内の共通ソースセットに依存関係を明示的に追加します。

```kotlin
commonMain.dependencies {
    implementation(compose.material3AdaptiveNavigationSuite)
}
```

#### material3:material3-window-size-class {id="material3-material3-window-size-class"}

[`WindowSizeClass`](https://developer.android.com/reference/kotlin/androidx/compose/material3/windowsizeclass/package-summary) クラスを使用するには、モジュールの `build.gradle.kts` ファイル内の共通ソースセットに `material3-window-size-class` の依存関係を明示的に追加します。

```kotlin
commonMain.dependencies {
    implementation("org.jetbrains.compose.material3:material3-window-size-class:1.7.3")
}
```

`calculateWindowSizeClass()` 関数は、まだ共通コードでは利用できません。
ただし、以下のようにプラットフォーム固有のコードでインポートして呼び出すことができます。

```kotlin
// desktopMain/kotlin/main.kt
import androidx.compose.material3.windowsizeclass.calculateWindowSizeClass

// ...

val size = calculateWindowSizeClass()
```

#### material-navigation {id="material-navigation"}

Compose Multiplatform Navigation に加えて、`material-navigation` ライブラリが共通コードで利用可能です。
これを使用するには、モジュールの `build.gradle.kts` ファイル内の共通ソースセットに以下の明示的な依存関係を追加します。

```kotlin
commonMain.dependencies {
    implementation("org.jetbrains.androidx.navigation:navigation-compose:2.8.0-alpha10")
    implementation("org.jetbrains.compose.material:material-navigation:1.7.0-beta02")
}
```

### Skia を Milestone 126 にアップデート {id="skia-updated-to-milestone-126"}

[Skiko](https://github.com/JetBrains/skiko) を介して Compose Multiplatform で使用されている Skia のバージョンが、Milestone 126 にアップデートされました。

以前使用されていた Skia のバージョンは Milestone 116 でした。これらのバージョン間で行われた変更については、[リリースノート](https://skia.googlesource.com/skia/+/refs/heads/main/RELEASE_NOTES.md#milestone-126) をご覧ください。

### GraphicsLayer – 新しい描画 API {id="graphicslayer-a-new-drawing-api"}

Jetpack Compose 1.7.0 で追加された新しい描画レイヤーが、Compose Multiplatform でも利用可能になりました。

`Modifier.graphicsLayer` とは異なり、新しい `GraphicsLayer` クラスを使用すると、Composable コンテンツをどこにでもレンダリングできます。
これは、アニメーション化されたコンテンツを異なるシーンでレンダリングすることが期待される場合に便利です。

より詳細な説明と例については、[リファレンスドキュメント](https://developer.android.com/reference/kotlin/androidx/compose/ui/graphics/layer/GraphicsLayer) をご覧ください。

### LocalLifecycleOwner が Compose UI から移動 {id="locallifecycleowner-moved-out-of-compose-ui"}

`LocalLifecycleOwner` クラスが、Compose UI パッケージから Lifecycle パッケージに移動しました。

この変更により、Compose UI とは独立してこのクラスにアクセスし、その Compose ベースのヘルパー API を呼び出すことができるようになります。
ただし、Compose UI のバインディングがない場合、`LocalLifecycleOwner` インスタンスにはプラットフォームとの統合が存在しないため、リッスンすべきプラットフォーム固有のイベントも存在しない点に注意してください。

## iOS {id="ios"}

### Compose Multiplatform とネイティブ iOS 間のタッチ相互運用の改善 {id="ios-touch-interop"}

本リリースでは、iOS 相互運用ビューのタッチ処理が改善されています。
Compose Multiplatform は、タッチが相互運用ビュー向けのものか、Compose によって処理されるべきかを検出しようとするようになりました。
これにより、Compose Multiplatform アプリ内の UIKit または SwiftUI エリアで発生するタッチイベントを処理できるようになります。

デフォルトでは、Compose Multiplatform は相互運用ビューへのタッチイベントの送信を 150ミリ秒遅延させます。

* この時間枠内に距離のしきい値を超える動きがあった場合、親の composable がタッチシーケンスをインターセプトし、相互運用ビューには転送されません。
* 目立った動きがない場合、Compose は残りのタッチシーケンスを処理せず、相互運用ビューのみによって処理されます。

この挙動は、ネイティブの [`UIScrollView`](https://developer.apple.com/documentation/uikit/uiscrollview) の動作と一致しています。
これにより、相互運用ビューで開始されたタッチシーケンスが、Compose Multiplatform がそれを処理する機会を得られないままインターセプトされてしまう状況を防ぐことができます。このような状況はユーザー体験の低下につながる可能性があります。
例えば、遅延リストなどのスクロール可能なコンテキストで大きな相互運用ビデオプレイヤーが使用されている場合を想像してください。画面の大部分がビデオで占められ、Compose Multiplatform が感知することなくすべてのタッチをビデオがインターセプトしてしまうと、リストをスクロールするのが困難になります。

### ネイティブパフォーマンスの改善 {id="native-performance-improvements"}

Kotlin 2.0.20 により、Kotlin/Native チームは iOS 上での Compose アプリの動作をより高速かつ滑らかにする上で大きな進歩を遂げました。
Compose Multiplatform 1.7.3 リリースでは、これらの最適化を活用するとともに、Jetpack Compose 1.7.0 からのパフォーマンス改善も取り入れています。

Kotlin 2.0.0 を組み合わせた Compose Multiplatform 1.6.11 と、Kotlin 2.0.20 を組み合わせた Compose Multiplatform 1.7.3 を比較すると、全体的に優れた結果が得られています。

* 最も現実の使用例に近い `LazyVerticalGrid` のスクロールをシミュレートする *LazyGrid* ベンチマークでは、平均で**約9%** 高速化しました。また、ユーザーが UI の応答性が低いと感じる原因となるドロップフレーム（描画遅延）の数が大幅に減少しました。ぜひ実際にお試しください。Compose Multiplatform で作成された iOS アプリは、はるかに滑らかに感じられるはずです。
* ランダムに配置された多数のコンポーネントをレンダリングする *VisualEffects* ベンチマークは、**3.6倍** 高速に動作します。1000フレームあたりの平均 CPU 時間が 8.8秒から 2.4秒に短縮されました。
* 画像の表示と非表示をアニメーション化する *AnimatedVisibility* composable は、レンダリングが**約6%** 高速化しています。

さらに、Kotlin 2.0.20 ではガベージコレクタにおける[コンカレントマーキングの実験的サポート](https://kotlinlang.org/docs/whatsnew2020.html#concurrent-marking-in-garbage-collector) が導入されています。コンカレントマーキングを有効にすると、ガベージコレクタの一時停止時間が短縮され、すべてのベンチマークでさらに大幅な改善が見られます。

これらの Compose 固有のベンチマークのコードは、Compose Multiplatform リポジトリで確認できます。

* [Kotlin/Native パフォーマンスベンチマーク](https://github.com/JetBrains/compose-multiplatform/tree/master/benchmarks/kn-performance)
* [Kotlin/JVM 対 Kotlin/Native ベンチマーク](https://github.com/JetBrains/compose-multiplatform/tree/master/benchmarks/ios/jvm-vs-kotlin-native)

## デスクトップ {id="desktop"}

### ドラッグ＆ドロップ {id="drag-and-drop"}

ユーザーが Compose アプリケーションの内外にコンテンツをドラッグできるようにするドラッグ＆ドロップのメカニズムが、デスクトップ向けの Compose Multiplatform に実装されました。
ドラッグ＆ドロップの潜在的なソース（ドラッグ元）とデスティネーション（ドロップ先）を指定するには、`dragAndDropSource` および `dragAndDropTarget` 修飾子を使用します。

> これらの修飾子は共通コードで利用可能ですが、現時点ではデスクトップおよび Android ソースセットでのみ機能します。
> 今後のリリースにご期待ください。
> 
{style="note"}

一般的なユースケースについては、Jetpack Compose ドキュメントの[専用記事](https://developer.android.com/develop/ui/compose/touch-input/user-interactions/drag-and-drop) をご覧ください。

### BasicTextField2 から名称変更された BasicTextField をデスクトップで採用 {id="basictextfield-renamed-from-basictextfield2-adopted-on-desktop"}

Jetpack Compose は `BasicTextField2` コンポーネントを安定版とし、`BasicTextField` に名称を変更しました。
本リリースにおいて、Compose Multiplatform はデスクトップターゲット向けにこの変更を採用しました。また、安定版 1.7.0 では iOS もカバーする予定です。

新しい `BasicTextField` の特徴は以下のとおりです。

* より信頼性の高い状態管理が可能。
* テキストフィールドのコンテンツをプログラムから変更するための新しい `TextFieldBuffer` API の提供。
* 視覚的な変換（Visual transformation）とスタイリングのための複数の新しい API を収録。
* フィールドの以前の状態に戻すことができる `UndoState` へのアクセスの提供。

### ComposePanel のレンダリング設定 {id="render-settings-for-composepanel"}

`ComposePanel` コンストラクタで新しい `RenderSettings.isVsyncEnabled` パラメータを指定することで、垂直同期（VSync）を無効にするようバックエンドのレンダリング実装にヒントを与えることができます。
これにより、入力と UI の変化との間の視覚的なレイテンシを短縮できますが、画面のテアリング（画面の乱れ）が発生する可能性もあります。

デフォルトの挙動は従来通りです。`ComposePanel` は描画の提示を VSync と同期させようとします。

## Web {id="web"}

### Kotlin/Wasm アプリケーションにおける skiko.js の不要化 {id="skiko-js-is-redundant-for-kotlin-wasm-applications"}

Compose Multiplatform でビルドされた Kotlin/Wasm アプリケーションにおいて、`skiko.js` ファイルは不要（冗長）になりました。
`index.html` ファイルからこれを削除することで、アプリのロード時間を短縮できます。
`skiko.js` は、今後のリリースで Kotlin/Wasm の配布パッケージから完全に削除される予定です。

> `skiko.js` ファイルは、Compose Multiplatform 1.9.0 までは Kotlin/JS アプリケーションで引き続き必要です。
> この変更がいつ行われたかについては、[Compose Multiplatform 1.9.3 の新機能](whats-new-compose-190.md#skiko-js-is-no-longer-needed) をご覧ください。
{style="note"}