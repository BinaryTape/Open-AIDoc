[//]: # (title: Compose Multiplatform 1.7.3 の新機能)

この機能リリースのハイライトは以下の通りです：

* [型安全なナビゲーション (Type-safe Navigation)](#type-safe-navigation)
* [シェアードエレメント遷移 (Shared element transitions)](#shared-element-transitions)
* [Android アセットにパックされたマルチプラットフォームリソース](#resources-packed-into-android-assets)
* [カスタムリソースディレクトリ](#custom-resource-directories)
* [マルチプラットフォームテストリソースのサポート](#support-for-multiplatform-test-resources)
* [iOS におけるタッチ相互運用の改善](#new-default-behavior-for-processing-touch-in-ios-native-elements)
* [Material3 の `adaptive` と `material3-window-size-class` が共通コードに対応](#material3-adaptive-adaptive)
* [デスクトップでドラッグ＆ドロップを実装](#drag-and-drop)
* [デスクトップでの `BasicTextField` の採用](#basictextfield-renamed-from-basictextfield2-adopted-on-desktop)

このリリースの変更点の全リストは、[GitHub](https://github.com/JetBrains/compose-multiplatform/blob/master/CHANGELOG.md#170-october-2024) で確認できます。

## 依存関係 (Dependencies)

* Gradle プラグイン `org.jetbrains.compose` バージョン 1.7.3。以下の Jetpack Compose ライブラリに基づいています：
  * [Runtime 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.7.5)
  * [UI 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.7.5)
  * [Foundation 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.7.5)
  * [Material 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-material#1.7.5)
  * [Material3 1.3.1](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.3.1)
* Lifecycle ライブラリ `org.jetbrains.androidx.lifecycle:lifecycle-*:2.8.3`。[Jetpack Lifecycle 2.8.5](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.8.5) に基づいています。
* Navigation ライブラリ `org.jetbrains.androidx.navigation:navigation-*:2.8.0-alpha10`。[Jetpack Navigation 2.8.0](https://developer.android.com/jetpack/androidx/releases/navigation#2.8.0) に基づいています。
* Material3 Adaptive ライブラリ `org.jetbrains.compose.material3.adaptive:adaptive-*:1.0.0`。[Jetpack Material3 Adaptive 1.0.0](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.0.0) に基づいています。

## 破壊的変更 (Breaking changes)

### 最小 AGP バージョンが 8.1.0 に引き上げられました

Compose Multiplatform 1.7.0 で使用されている Jetpack Compose 1.7.0 および Lifecycle 2.8.0 は、いずれも AGP 7 をサポートしていません。
そのため、Compose Multiplatform 1.7.3 にアップデートする際、AGP の依存関係もアップグレードする必要がある場合があります。

> Android Studio における Android コンポーザブル向けに新しく実装されたプレビュー機能には、[最新の AGP バージョンのいずれかが必要](#resources-packed-into-android-assets)です。
>
{style="note"}

### Java リソース API が非推奨となり、マルチプラットフォームリソースライブラリが推奨されます

<!-- TODO additional copy editing -->

このリリースでは、`compose.ui` パッケージで利用可能な Java リソース API を明示的に非推奨（deprecated）にしました。これには、`painterResource()`、`loadImageBitmap()`、`loadSvgPainter()`、`loadXmlImageVector()` 関数、および `ClassLoaderResourceLoader` クラスとそれに依存する関数が含まれます。

[マルチプラットフォームリソースライブラリ](compose-multiplatform-resources.md)への移行を検討してください。
Java リソースを Compose Multiplatform で使用し続けることは可能ですが、生成されたアクセサ、マルチモジュールサポート、ローカライズなど、フレームワークが提供する拡張機能の恩恵を受けることはできません。

引き続き Java リソースにアクセスする必要がある場合は、[プルリクエストで提案されている実装](https://github.com/JetBrains/compose-multiplatform-core/pull/1457)をコピーすることで、Compose Multiplatform 1.7.3 にアップグレードし、可能な限りマルチプラットフォームリソースに切り替えた後でも、コードが動作するようにできます。

### iOS ネイティブ要素におけるタッチ処理の新しいデフォルト動作

1.7.3 より前の Compose Multiplatform では、相互運用（interop）UI ビュー内で発生したタッチイベントに応答できなかったため、相互運用ビューがこれらのタッチシーケンスを完全に処理していました。

Compose Multiplatform 1.7.3 では、相互運用タッチシーケンスを処理するためのより高度なロジックを実装しています。
デフォルトでは、最初のタッチの後に遅延が発生するようになりました。これにより、親コンポーザブルはタッチシーケンスがネイティブビューとの対話を意図したものかどうかを判断し、それに応じて反応できるようになります。

詳細については、[このページの iOS セクション](#ios-touch-interop)の説明を参照するか、[この機能のドキュメント](compose-ios-touch.md)をお読みください。

### iOS での最小フレーム持続時間の無効化が必須になりました

開発者が高リフレッシュレートディスプレイに関する出力警告を見落とすことが多く、ユーザーが 120Hz 対応デバイスでスムーズなアニメーションを享受できないケースがありました。
現在、このチェックを厳格に適用しています。`Info.plist` ファイルに `CADisableMinimumFrameDurationOnPhone` プロパティが存在しないか、`false` に設定されている場合、Compose Multiplatform で構築されたアプリはクラッシュするようになります。

この動作を無効にするには、`ComposeUIViewControllerConfiguration.enforceStrictPlistSanityCheck` プロパティを `false` に設定します。

### デスクトップにおける Modifier.onExternalDrag の非推奨化

<!-- TODO additional copy editing -->

実験的な `Modifier.onExternalDrag` および関連 API は、新しい `Modifier.dragAndDropTarget` のために非推奨となりました。
`DragData` インターフェースは `compose.ui.draganddrop` パッケージに移動されました。

Compose Multiplatform 1.7.0 で非推奨の API を使用している場合、非推奨エラーが発生します。
1.8.0 では `onExternalDrag` 修飾子は完全に削除される予定です。

## プラットフォーム共通 (Across platforms)

### シェアードエレメント遷移 (Shared element transitions)

Compose Multiplatform で、共通の要素を持つコンポーザブル間でシームレスな遷移を行うための API が提供されました。
これらの遷移はナビゲーションにおいて便利で、ユーザーが UI の変化の軌跡を追うのに役立ちます。

API の詳細については、[Jetpack Compose のドキュメント](https://developer.android.com/develop/ui/compose/animation/shared-elements)を参照してください。

### 型安全なナビゲーション (Type-safe Navigation)

Compose Multiplatform は、ナビゲーションルートに沿ってオブジェクトを渡すための Jetpack Compose の型安全なアプローチを採用しました。
Navigation 2.8.0 の新しい API により、Compose はナビゲーショングラフにコンパイル時の安全性を提供できます。
これらの API は、XML ベースのナビゲーションにおける [Safe Args](https://developer.android.com/guide/navigation/use-graph/pass-data#Safe-args) プラグインと同じ結果をもたらします。

詳細は、[Navigation Compose における型安全性に関する Google のドキュメント](https://developer.android.com/guide/navigation/design/type-safety)を参照してください。

### マルチプラットフォームリソース

#### Android アセットにパックされたマルチプラットフォームリソース

すべてのマルチプラットフォームリソースが Android アセットにパックされるようになりました。これにより、Android Studio は Android ソースセット内の Compose Multiplatform コンポーザブルのプレビューを生成できるようになります。

> Android Studio のプレビューは、Android ソースセット内のコンポーザブルでのみ利用可能です。
> また、最新バージョンの AGP（8.5.2、8.6.0-rc01、または 8.7.0-alpha04）のいずれかが必要です。
>
{style="note"}

これにより、Android 上の WebView やメディアプレーヤーコンポーネントからマルチプラットフォームリソースに直接アクセスすることも可能になります。リソースには `Res.getUri("files/index.html")` のような単純なパスでアクセスできます。

以下は、リソース画像へのリンクを含むリソース HTML ページを表示する Android コンポーザブルの例です：

```kotlin
// androidMain/kotlin/com/example/webview/App.kt
@OptIn(ExperimentalResourceApi::class)
@Composable
@Preview
fun App() {
    MaterialTheme {
        val uri = Res.getUri("files/webview/index.html")

        // AndroidView 内に WebView をフルスクリーンレイアウトで追加
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

この例は、以下のシンプルな HTML ファイルで動作します：

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

この例の両方のリソースファイルは、`commonMain` ソースセットに配置されています：

![composeResources ディレクトリのファイル構造](compose-resources-android-webview.png){width="230"}

#### カスタムリソースディレクトリ

設定 DSL の新しい `customDirectory` 設定を使用すると、[特定のソースセットにカスタムディレクトリを関連付ける](compose-multiplatform-resources-setup.md#custom-resource-directories)ことができます。これにより、例えばダウンロードしたファイルをリソースとして使用することが可能になります。

#### マルチプラットフォームフォントキャッシュ

Compose Multiplatform は、Android のフォントキャッシュ機能を他のプラットフォームにも導入し、`Font` リソースの過度なバイト読み取りを排除しました。

#### マルチプラットフォームテストリソースのサポート

リソースライブラリがプロジェクト内でのテストリソースの使用をサポートするようになりました。これにより、以下のことが可能になります：

* テストソースセットへのリソース追加。
* 対応するソースセットでのみ利用可能な生成されたアクセサの使用。
* テスト実行時のみアプリにテストリソースをパック。

#### 簡単にアクセスできるように文字列 ID にマッピングされたリソース

各タイプのリソースは、そのファイル名でマッピングされます。例えば、`Res.allDrawableResources` プロパティを使用して、すべての `drawable` リソースのマップを取得し、文字列 ID を渡すことで必要なリソースにアクセスできます：

```kotlin
Image(painterResource(Res.allDrawableResources["compose_multiplatform"]!!), null)
```

#### バイト配列を ImageBitmap または ImageVector に変換する関数

`ByteArray` を画像リソースに変換するための新しい関数が追加されました：

* `decodeToImageBitmap()` は、JPEG、PNG、BMP、または WEBP ファイルを `ImageBitmap` オブジェクトに変換します。
* `decodeToImageVector()` は、XML ベクターファイルを `ImageVector` オブジェクトに変換します。
* `decodeToSvgPainter()` は、SVG ファイルを `Painter` オブジェクトに変換します。この関数は Android では利用できません。

詳細は [ドキュメント](compose-multiplatform-resources-usage.md#convert-byte-arrays-into-images) を参照してください。

### 新しい共通モジュール

#### material3.adaptive:adaptive*

Material3 Adaptive モジュールが Compose Multiplatform の共通コードで利用可能になりました。
これらを使用するには、モジュールの `build.gradle.kts` ファイルで共通ソースセットに対応する依存関係を明示的に追加します：

```kotlin
commonMain.dependencies {
    implementation("org.jetbrains.compose.material3.adaptive:adaptive:1.0.0-alpha03")
    implementation("org.jetbrains.compose.material3.adaptive:adaptive-layout:1.0.0-alpha03")
    implementation("org.jetbrains.compose.material3.adaptive:adaptive-navigation:1.0.0-alpha03")
}
```

#### material3.material3-adaptive-navigation-suite

Compose で[アダプティブナビゲーションを構築する](https://developer.android.com/develop/ui/compose/layouts/adaptive/build-adaptive-navigation)ために必要な Material3 adaptive navigation suite が、Compose Multiplatform の共通コードで利用可能になりました。
これを使用するには、モジュールの `build.gradle.kts` ファイルで共通ソースセットに依存関係を明示的に追加します：

```kotlin
commonMain.dependencies {
    implementation(compose.material3AdaptiveNavigationSuite)
}
```

#### material3:material3-window-size-class

[`WindowSizeClass`](https://developer.android.com/reference/kotlin/androidx/compose/material3/windowsizeclass/package-summary) クラスを使用するには、モジュールの `build.gradle.kts` ファイルで共通ソースセットに `material3-window-size-class` の依存関係を明示的に追加します：

```kotlin
commonMain.dependencies {
    implementation("org.jetbrains.compose.material3:material3-window-size-class:1.7.3")
}
```

`calculateWindowSizeClass()` 関数はまだ共通コードでは利用できません。
ただし、プラットフォーム固有のコードでインポートして呼び出すことができます。例：

```kotlin
// desktopMain/kotlin/main.kt
import androidx.compose.material3.windowsizeclass.calculateWindowSizeClass

// ...

val size = calculateWindowSizeClass()
```

#### material-navigation

`material-navigation` ライブラリが、Compose Multiplatform Navigation に加えて共通コードで利用可能になりました。
これを使用するには、モジュールの `build.gradle.kts` ファイルで共通ソースセットに以下の明示的な依存関係を追加します：

```kotlin
commonMain.dependencies {
    implementation("org.jetbrains.androidx.navigation:navigation-compose:2.8.0-alpha10")
    implementation("org.jetbrains.compose.material:material-navigation:1.7.0-beta02")
}
```

### Skia を Milestone 126 にアップデート

[Skiko](https://github.com/JetBrains/skiko) を通じて Compose Multiplatform で使用されている Skia のバージョンが、Milestone 126 にアップデートされました。

以前に使用されていた Skia のバージョンは Milestone 116 でした。これらのバージョン間で行われた変更は [リリースノート](https://skia.googlesource.com/skia/+/refs/heads/main/RELEASE_NOTES.md#milestone-126) で確認できます。

### GraphicsLayer – 新しい描画 API

Jetpack Compose 1.7.0 で追加された新しい描画レイヤーが、Compose Multiplatform でも利用可能になりました。

`Modifier.graphicsLayer` とは異なり、新しい `GraphicsLayer` クラスを使用すると、コンポーザブルのコンテンツをどこにでもレンダリングできます。
これは、アニメーションコンテンツを異なるシーンでレンダリングする必要がある場合に便利です。

詳細な説明と例については、[リファレンスドキュメント](https://developer.android.com/reference/kotlin/androidx/compose/ui/graphics/layer/GraphicsLayer)を参照してください。

### LocalLifecycleOwner が Compose UI から移動

`LocalLifecycleOwner` クラスが Compose UI パッケージから Lifecycle パッケージに移動されました。

この変更により、Compose UI とは独立してクラスにアクセスし、その Compose ベースのヘルパー API を呼び出すことができるようになります。ただし、Compose UI バインディングがない場合、`LocalLifecycleOwner` インスタンスはプラットフォーム統合を持たないため、リッスンすべきプラットフォーム固有のイベントは発生しないことに注意してください。

## iOS

### Compose Multiplatform とネイティブ iOS 間のタッチ相互運用の改善 {id="ios-touch-interop"}

このリリースでは、iOS 相互運用ビューのタッチ処理が改善されました。
Compose Multiplatform は、タッチが相互運用ビューに向けられたものか、Compose によって処理されるべきものかを検出しようとするようになりました。
これにより、Compose Multiplatform アプリ内の UIKit または SwiftUI 領域で発生するタッチイベントを処理することが可能になります。

デフォルトでは、Compose Multiplatform は相互運用ビューへのタッチイベントの送信を 150 ミリ秒遅延させます：

* この時間枠内に距離しきい値を超える移動があった場合、親コンポーザブルがタッチシーケンスをインターセプトし、相互運用ビューには転送されません。
* 目立った移動がない場合、Compose はタッチシーケンスの残りを処理せず、代わりに相互運用ビューのみによって処理されます。

この動作は、ネイティブの [`UIScrollView`](https://developer.apple.com/documentation/uikit/uiscrollview) の動作と一致しています。
これにより、相互運用ビューで始まるタッチシーケンスが、Compose Multiplatform がそれを処理する機会を得る前にインターセプトされてしまう状況を防ぐことができます。このような状況は、ユーザー体験を損なう可能性があります。
例えば、遅延リスト（lazy list）のようなスクロール可能なコンテキストで使用される大きな相互運用ビデオプレーヤーを想像してください。画面の大部分が、Compose Multiplatform が関知しないまま、すべてのタッチをインターセプトするビデオで占められている場合、リストをスクロールするのは困難です。

### ネイティブのパフォーマンス向上

<!-- TODO additional copy editing -->

Kotlin 2.0.20 では、Kotlin/Native チームが iOS 上の Compose アプリをより高速かつスムーズに動作させるために多大な進歩を遂げました。
Compose Multiplatform 1.7.3 リリースでは、これらの最適化を活用するとともに、Jetpack Compose 1.7.0 からのパフォーマンス改善も取り入れています。

Kotlin 2.0.0 と組み合わせた Compose Multiplatform 1.6.11 と、Kotlin 2.0.20 と組み合わせた Compose Multiplatform 1.7.3 を比較すると、全面的に良好な結果が得られています：

* *LazyGrid* ベンチマークは `LazyVerticalGrid` のスクロールをシミュレートするもので、実際のユースケースに最も近く、平均で **約 9%** 高速に動作します。
    また、UI が反応しにくいとユーザーが感じる原因となるフレーム落ちの数も大幅に減少しています。ぜひご自身で試してみてください。iOS 向け Compose Multiplatform で作成されたアプリは、以前よりはるかにスムーズに感じられるはずです。
* *VisualEffects* ベンチマークは、ランダムに配置された多数のコンポーネントをレンダリングし、**3.6 倍** 高速に動作します。
    1000 フレームあたりの平均 CPU 時間は 8.8 秒から 2.4 秒に短縮されました。
* *AnimatedVisibility* コンポーザブルは画像の表示・非表示のアニメーションを行い、**約 6%** 高速なレンダリングを示しています。

さらに、Kotlin 2.0.20 ではガベージコレクタにおける[コンカレントマーキング（concurrent marking）の実験的サポート](https://kotlinlang.org/docs/whatsnew2020.html#concurrent-marking-in-garbage-collector)が導入されました。コンカレントマーキングを有効にすると、ガベージコレクタの停止時間が短縮され、すべてのベンチマークでさらに大きな改善が見られます。

Compose Multiplatform リポジトリで、これらの Compose 固有のベンチマークコードを確認できます：

* [Kotlin/Native パフォーマンスベンチマーク](https://github.com/JetBrains/compose-multiplatform/tree/master/benchmarks/kn-performance)
* [Kotlin/JVM 対 Kotlin/Native ベンチマーク](https://github.com/JetBrains/compose-multiplatform/tree/master/benchmarks/ios/jvm-vs-kotlin-native)

## デスクトップ (Desktop)

### ドラッグ＆ドロップ

ユーザーが Compose アプリケーションにコンテンツをドラッグしたり、アプリケーションからドラッグしたりできるようにするドラッグ＆ドロップメカニズムが、デスクトップ向けの Compose Multiplatform で実装されました。
ドラッグ＆ドロップの潜在的なソース（転送元）とデスティネーション（転送先）を指定するには、`dragAndDropSource` および `dragAndDropTarget` 修飾子を使用します。

> これらの修飾子は共通コードで利用可能ですが、現在はデスクトップおよび Android のソースセットでのみ動作します。今後のリリースにご期待ください。
> 
{style="note"}

一般的なユースケースについては、Jetpack Compose ドキュメントの[専用記事](https://developer.android.com/develop/ui/compose/touch-input/user-interactions/drag-and-drop)を参照してください。

### BasicTextField (BasicTextField2 から改称) をデスクトップで採用

Jetpack Compose は `BasicTextField2` コンポーネントを安定版とし、`BasicTextField` に改称しました。
今回のリリースで、Compose Multiplatform はデスクトップターゲット向けにこの変更を採用しました。安定版 1.7.0 では iOS もカバーする予定です。

新しい `BasicTextField` の特徴：

* 状態をより確実に管理できます。
* テキストフィールドの内容をプログラムで変更するための新しい `TextFieldBuffer` API を提供します。
* 視覚的な変換やスタイリングのためのいくつかの新しい API が含まれています。
* `UndoState` へのアクセスを提供し、フィールドの以前の状態に戻ることができます。

### ComposePanel のレンダリング設定

`ComposePanel` コンストラクタで新しい `RenderSettings.isVsyncEnabled` パラメータを指定することで、バックエンドのレンダリング実装に対して垂直同期（Vsync）を無効にするようヒントを与えることができます。
これにより、入力と UI の変化の間の視覚的なレイテンシを短縮できますが、画面のティアリング（引き裂き）が発生する可能性もあります。

デフォルトの動作は変わりません。`ComposePanel` は描画プレゼンテーションを VSync と同期させようとします。

## ウェブ (Web)

### Kotlin/Wasm アプリケーションにおける skiko.js の不要化

<!-- TODO additional copy editing -->

Compose Multiplatform で構築された Kotlin/Wasm アプリケーションにおいて、`skiko.js` ファイルは不要になりました。
`index.html` ファイルからこれを削除することで、アプリのロード時間を改善できます。
`skiko.js` は、将来のリリースで Kotlin/Wasm 配布物から完全に削除される予定です。

> `skiko.js` ファイルは、Compose Multiplatform 1.9.0 までは Kotlin/JS アプリケーションで引き続き必要です。いつ変更されたかについては、[Compose Multiplatform 1.9.3 の新機能](whats-new-compose-190.md#skiko-js-is-no-longer-needed) を参照してください。
> 
{style="note"}