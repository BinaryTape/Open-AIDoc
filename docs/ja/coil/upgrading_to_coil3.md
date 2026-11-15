# Coil 3.x へのアップグレード

Coil 3 は、多くの主要な改善点を含む Coil の次のメジャーバージョンです：

- すべての主要ターゲット（Android、iOS、JVM、JS、および [WASM](https://coil-kt.github.io/coil/sample/)）を含む [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) の完全サポート。
- 複数のネットワークライブラリ（Ktor および OkHttp）のサポート。あるいは、ローカルや静的ファイルのみを読み込む場合は、ネットワークの依存関係なしで Coil を使用することも可能です。
- Compose の `@Preview` レンダリングの改善、および `LocalAsyncImagePreviewHandler` を介したカスタムプレビュー動作のサポート。
- 既存の動作を破棄（破壊的変更）する必要があったバグに関する重要な修正（詳細は後述）。

このドキュメントでは、Coil 2 から Coil 3 への主な変更点の概要を提供し、破壊的変更や重要な変更点を取り上げます。バイナリ非互換となる変更や細かな動作変更のすべてを網羅しているわけではありません。

プロジェクトの例については、[Compose Multiplatform のサンプル](https://github.com/coil-kt/coil/tree/main/samples/compose)を参照してください。

## Maven 座標とパッケージ名 {id="maven-coordinates-and-package-name"}

Coil の Maven 座標は `io.coil-kt` から `io.coil-kt.coil3` に更新され、パッケージ名は `coil` から `coil3` に更新されました。これにより、バイナリ互換性の問題を発生させることなく、Coil 3 と Coil 2 を共存させることができます。例えば、`io.coil-kt:coil:2.7.0` は `io.coil-kt.coil3:coil:3.0.0` になります。

Coroutines、Ktor、AndroidX で使用されている命名規則に合わせるため、`coil-base` アーティファクトと `coil-compose-base` アーティファクトは、それぞれ `coil-core` と `coil-compose-core` に名前が変更されました。

## ネットワーク画像 {id="network-images"}

**`coil-core` は、デフォルトでネットワークからの画像読み込みをサポートしなくなりました。** [Coil のネットワークアーティファクトのいずれかへの依存関係を追加する必要があります。詳細はこちらを参照してください。](network.md)。この変更により、ユーザーは異なるネットワークライブラリを選択したり、アプリで不要な場合にネットワーク依存関係を排除したりできるようになりました。

さらに、Cache-Control ヘッダーはデフォルトでは考慮されなくなりました。詳細については[こちら](network.md)を参照してください。

## マルチプラットフォーム {id="multiplatform"}

Coil 3 は、Android、JVM、iOS、macOS、JavaScript、WASM をサポートする Kotlin Multiplatform ライブラリになりました。

Android では、Coil は画像のレンダリングに標準のグラフィックスクラスを使用します。Android 以外のプラットフォームでは、Coil は画像のレンダリングに [Skiko](https://github.com/JetBrains/skiko) を使用します。Skiko は、Google が開発した [Skia](https://github.com/google/skia) グラフィックスエンジンをラップする Kotlin バインディングのセットです。

Android SDK からの分離の一環として、多くの API の変更が行われました。主なものは以下のとおりです：

- `Drawable` はカスタムの `Image` インターフェースに置き換えられました。Android 上でのクラス間の変換には、`Drawable.asImage()` および `Image.asDrawable(resources)` を使用します。Android 以外のプラットフォームでは、`Bitmap.asImage()` および `Image.toBitmap()` を使用します。
- Android の `android.net.Uri` クラスの使用箇所は、マルチプラットフォームの `coil3.Uri` クラスに置き換えられました。`ImageRequest.data` として `android.net.Uri` を渡している呼び出し元は影響を受けません。`android.net.Uri` を受け取ることに依存しているカスタム `Fetcher` は、`coil3.Uri` を使用するように更新する必要があります。
- `Context` の使用箇所は `PlatformContext` に置き換えられました。`PlatformContext` は Android では `Context` の型エイリアスであり、Android 以外のプラットフォームでは `PlatformContext.INSTANCE` を使用してアクセスできます。Compose Multiplatform で参照を取得するには、`LocalPlatformContext.current` を使用します。
- `Coil` クラスは `SingletonImageLoader` に名前が変更されました。
- カスタムの Android `Application` クラスで `ImageLoaderFactory` を実装している場合は、`ImageLoaderFactory` の代替として `SingletonImageLoader.Factory` の実装に切り替える必要があります。`SingletonImageLoader.Factory` を実装すると、必要に応じて `newImageLoader()` をオーバーライドできるようになります。

`coil-svg` アーティファクトはマルチプラットフォームでサポートされていますが、`coil-gif` および `coil-video` アーティファクトは、特定の Android デコーダーやライブラリに依存しているため、（現時点では）引き続き Android 専用です。

## Compose {id="compose"}

`coil-compose` アーティファクトの API はほぼ変更されていません。Coil 2 と同様に、`AsyncImage`、`SubcomposeAsyncImage`、`rememberAsyncImagePainter` を引き続き使用できます。さらに、これらのメソッドは[再起動可能（restartable）かつスキップ可能（skippable）](https://developer.android.com/jetpack/compose/performance/stability)になるよう更新されており、パフォーマンスが向上するはずです。

- `AsyncImagePainter.state` は `StateFlow` になりました。`val state = painter.state.collectAsState()` を使用して監視する必要があります。
- `AsyncImagePainter` のデフォルトの `SizeResolver` は、キャンバスのサイズを取得するために最初の `onDraw` 呼び出しを待機しなくなりました。代わりに、`AsyncImagePainter` はデフォルトで `Size.ORIGINAL` になります。
- Compose の `modelEqualityDelegate` は、`AsyncImage`/`SubcomposeAsyncImage`/`rememberAsyncImagePainter` へのパラメーターではなく、CompositionLocal である `LocalAsyncImageModelEqualityDelegate` を介して設定されるようになりました。

## 全般 {id="general"}

その他の重要な動作変更は以下のとおりです：

- ファーストパーティの `Fetcher` や `Decoder`（例: `NetworkFetcher.Factory`、`SvgDecoder` など）は、ServiceLoader を介して各新しい `ImageLoader` に自動的に追加されるようになりました。この動作は `ImageLoader.Builder.serviceLoaderEnabled(false)` で無効にできます。
- リソース縮小の最適化を妨げるため、`android.resource://example.package.name/drawable/image` URI のサポートが削除されました。`R.drawable.image` の値を直接渡すことを推奨します。リソース名の代わりにリソース ID を渡す形式（`android.resource://example.package.name/12345678`）は引き続き機能します。この機能が依然として必要な場合は、[コンポーネントレジストリに手動で `ResourceUriMapper` を含める](https://github.com/coil-kt/coil/blob/da7d872e340430014dbc5136e35eb62f9b17662e/coil-core/src/androidInstrumentedTest/kotlin/coil3/map/ResourceUriMapper.kt)ことができます。
- ファイルの最終更新タイムスタンプは、デフォルトでキャッシュキーに追加されなくなりました。これは、（ごく短時間であっても）メインスレッドでのディスク読み込みを回避するためです。この動作は、`ImageRequest.Builder.addLastModifiedToFileCacheKey(true)` または `ImageLoader.Builder.addLastModifiedToFileCacheKey(true)` で再度有効にできます。
- 予期しない OOM（メモリ不足）を防ぐため、出力画像のサイズは 4096x4096 未満に制限されるようになりました。これは `ImageLoader/ImageRequest.Builder.maxBitmapSize` で設定できます。この動作を無効にするには、`maxBitmapSize` を `Size.ORIGINAL` に設定します。
- Coil 2 の `Parameters` API は `Extras` に置き換えられました。`Extras` は文字列のキーを必要とせず、参照の等価性に依存します。`Extras` はメモリキャッシュキーの変更をサポートしていません。extra がメモリキャッシュキーに影響を与える場合は、代わりに `ImageRequest.memoryCacheKeyExtra` を使用してください。
- マルチプラットフォームをより容易にサポートするため、多くの `ImageRequest.Builder` 関数が拡張関数に移行しました。