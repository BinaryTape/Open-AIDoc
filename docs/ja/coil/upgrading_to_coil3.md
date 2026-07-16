# Coil 3.x へのアップグレード

Coil 3 は、多くの主要な改善が含まれた Coil の次期メジャーバージョンです。

- すべての主要なターゲット（Android, iOS, JVM, JS, および [WASM](/coil/overview)）を含む [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) の完全なサポート。
- 複数のネットワークライブラリ（Ktor および OkHttp）のサポート。あるいは、ローカル/静的ファイルのみを読み込む必要がある場合は、ネットワーク依存関係なしで Coil を使用することも可能です。
- Compose の `@Preview` レンダリングの改善、および `LocalAsyncImagePreviewHandler` によるカスタムプレビュー動作のサポート。
- 既存の動作を変更（破壊的変更）する必要があったバグに対する重要な修正（詳細は後述）。

このドキュメントでは、Coil 2 から Coil 3 への主な変更点の概要を説明し、破壊的変更や重要な変更について解説します。すべてのバイナリ互換性のない変更や、細かな動作変更を網羅しているわけではありません。

Compose Multiplatform プロジェクトで Coil 3 を使用していますか？例については [`samples`](https://github.com/coil-kt/coil/tree/3.x/samples/compose) リポジトリを確認してください。

## Maven 座標とパッケージ名

Coil の Maven 座標は `io.coil-kt` から `io.coil-kt.coil3` に更新され、パッケージ名も `coil` から `coil3` に更新されました。これにより、Coil 3 はバイナリ互換性の問題を発生させることなく、Coil 2 と並行して動作させることができます。例えば、`io.coil-kt:coil:2.7.0` は `io.coil-kt.coil3:coil:3.0.0` になりました。

また、`coil-base` と `coil-compose-base` アーティファクトは、Coroutines、Ktor、および AndroidX で使用されている命名規則に合わせるため、それぞれ `coil-core` と `coil-compose-core` に名称変更されました。

## ネットワーク画像

**`coil-core` は、デフォルトでネットワークからの画像読み込みをサポートしなくなりました。** [Coil のネットワークアーティファクトのいずれかへの依存関係を追加する必要があります。詳細についてはこちらを参照してください。](network.md)。この変更は、利用者が異なるネットワークライブラリを使用したり、アプリで必要ない場合にネットワーク依存関係を避けたりできるようにするために行われました。

さらに、キャッシュ制御ヘッダー（cache control headers）は、デフォルトで考慮されなくなりました。詳細については [こちら](network.md) を参照してください。

## マルチプラットフォーム

Coil 3 は、Android、JVM、iOS、macOS、Javascript、および WASM をサポートする Kotlin Multiplatform ライブラリになりました。

Android では、Coil は標準的なグラフィックスクラスを使用して画像をレンダリングします。Android 以外のプラットフォームでは、Coil は [Skiko](https://github.com/JetBrains/skiko) を使用して画像をレンダリングします。Skiko は、Google が開発したグラフィックスエンジン [Skia](https://github.com/google/skia) をラップする Kotlin バインディングのセットです。

Android SDK からのデカップリング（切り離し）の一環として、いくつかの API の変更が行われました。主な変更点は以下の通りです。

- `Drawable` はカスタムの `Image` インターフェースに置き換えられました。Android 上でこれらのクラス間を変換するには、`Drawable.asImage()` および `Image.asDrawable(resources)` を使用します。Android 以外のプラットフォームでは、`Bitmap.asImage()` および `Image.toBitmap()` を使用します。
- Android の `android.net.Uri` クラスの使用箇所は、マルチプラットフォーム対応の `coil3.Uri` クラスに置き換えられました。`ImageRequest.data` として `android.net.Uri` を渡している呼び出し箇所は影響を受けません。`android.net.Uri` を受け取ることに依存しているカスタム `Fetcher` は、`coil3.Uri` を使用するように更新する必要があります。
- `Context` の使用箇所は `PlatformContext` に置き換えられました。`PlatformContext` は Android では `Context` の型エイリアス（type alias）であり、Android 以外のプラットフォームでは `PlatformContext.INSTANCE` を使用してアクセスできます。Compose Multiplatform で参照を取得するには `LocalPlatformContext.current` を使用します。
- `Coil` クラスは `SingletonImageLoader` に名称変更されました。
- カスタムの Android `Application` クラスで `ImageLoaderFactory` を実装している場合は、代わりとして `SingletonImageLoader.Factory` を実装するように切り替える必要があります。`SingletonImageLoader.Factory` を実装すると、必要に応じて `newImageLoader()` をオーバーライドできるようになります。

`coil-svg` アーティファクトはマルチプラットフォームでサポートされていますが、`coil-gif` と `coil-video` アーティファクトは、特定の Android デコーダーやライブラリに依存しているため、（現時点では）Android 専用のままとなっています。

## Compose

`coil-compose` アーティファクトの API は、ほとんど変更されていません。Coil 2 と同様に `AsyncImage`、`SubcomposeAsyncImage`、`rememberAsyncImagePainter` を引き続き使用できます。さらに、これらのメソッドは [restartable（再開可能）かつ skippable（スキップ可能）](https://developer.android.com/jetpack/compose/performance/stability) に更新されており、パフォーマンスが向上しています。

- `AsyncImagePainter.state` は `StateFlow` になりました。これは `val state = painter.state.collectAsState()` を使用して監視する必要があります。
- `AsyncImagePainter` のデフォルトの `SizeResolver` は、キャンバスのサイズを取得するために最初の `onDraw` 呼び出しを待機しなくなりました。代わりに、`AsyncImagePainter` はデフォルトで `Size.ORIGINAL` に設定されます。
- Compose の `modelEqualityDelegate` デリゲートは、`AsyncImage`/`SubcomposeAsyncImage`/`rememberAsyncImagePainter` のパラメータとしてではなく、CompositionLocal である `LocalAsyncImageModelEqualityDelegate` を介して設定されるようになりました。

## 一般的な変更

その他の重要な動作変更は以下の通りです。

- ファーストパーティの `Fetcher` および `Decoder`（例：`NetworkFetcher.Factory`、`SvgDecoder` など）は、サービスローダー（service loader）を通じて新しい各 `ImageLoader` に自動的に追加されるようになりました。この動作は `ImageLoader.Builder.serviceLoaderEnabled(false)` で無効にできます。
- リソースシュリンキング（resource shrinking）の最適化を妨げるため、`android.resource://example.package.name/drawable/image` 形式の URI のサポートが削除されました。代わりに `R.drawable.image` の値を直接渡すことが推奨されます。リソース名の代わりにリソース ID を渡す形式（`android.resource://example.package.name/12345678`）は引き続き動作します。もし以前の機能が引き続き必要な場合は、[コンポーネントレジストリに `ResourceUriMapper` を手動で含めること](https://github.com/coil-kt/coil/blob/da7d872e340430014dbc5136e35eb62f9b17662e/coil-core/src/androidInstrumentedTest/kotlin/coil3/map/ResourceUriMapper.kt)ができます。
- ファイルの最終更新タイムスタンプは、デフォルトでキャッシュキーに追加されなくなりました。これは、メインスレッドでのディスク読み取り（たとえ非常に短時間であっても）を避けるためです。これは `ImageRequest.Builder.addLastModifiedToFileCacheKey(true)` または `ImageLoader.Builder.addLastModifiedToFileCacheKey(true)` で再度有効にできます。
- 予期しない OOM（メモリ不足）を防ぐため、出力画像の寸法が 4096x4096 未満になるように強制されるようになりました。これは `ImageLoader/ImageRequest.Builder.maxBitmapSize` で設定可能です。この動作を無効にするには、`maxBitmapSize` を `Size.ORIGINAL` に設定します。
- Coil 2 の `Parameters` API は `Extras` に置き換えられました。`Extras` は文字列のキーを必要とせず、代わりに同一性（identity equality）に依存します。`Extras` はメモリキャッシュキーの変更をサポートしていません。代わりに、エクストラがメモリキャッシュキーに影響を与える場合は `ImageRequest.memoryCacheKeyExtra` を使用してください。
- 多くの `ImageRequest.Builder` 関数は、マルチプラットフォームをより容易にサポートするために拡張関数（extension functions）に移動されました。