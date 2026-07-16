# 変更履歴

## [3.5.0-beta01] - 2026年5月4日

- `iosX64` および `macosX64` ターゲットを削除しました。 ([#3386](https://github.com/coil-kt/coil/pull/3386))
- Android の最小 SDK バージョンを 23 に引き上げました。 ([#3283](https://github.com/coil-kt/coil/pull/3283))
- JS/WASM において、フルでの Skia デコードへのフォールバックを避けるため、WebP サイズの高速抽出を追加しました。 ([#3341](https://github.com/coil-kt/coil/pull/3341))
- `CacheStrategy` の実装において、キャッシュされた失敗レスポンス（例：有効期限切れのキャッシュされた `404` レスポンス）を更新できない問題を修正しました。 ([#3401](https://github.com/coil-kt/coil/pull/3401))
- コンパイル SDK を 36 に更新しました。
- Kotlin を 2.3.21 に更新しました。
- Compose を 1.11.0-beta03 に更新しました。
- Okio を 3.17.0 に更新しました。
- Skiko を 0.144.5 に更新しました。
- `androidx.annotation` を 1.10.0 に更新しました。

## [3.4.0] - 2026年2月24日

- **新機能**: 同じキーに対する実行中のネットワークリクエストの統合をサポートする `ConcurrentRequestStrategy` を追加しました。 ([#2995](https://github.com/coil-kt/coil/pull/2995), [#3326](https://github.com/coil-kt/coil/pull/3326))
    - `DeDupeConcurrentRequestStrategy` はこの動作を有効にし、待機リクエストが実行中のネットワークリクエストの結果を待てるようにします。
        - この動作は実験的（experimental）であり、現在はデフォルトで無効になっています。
        - 現在、リクエストは常に `diskCacheKey` に基づいて統合されます。
    - `OkHttpNetworkFetcherFactory`、`KtorNetworkFetcherFactory`、および `NetworkFetcher.Factory` が `concurrentRequestStrategy` を受け取るようになりました。
- **新機能**: JS/WASM において、ブラウザのメインスレッドをブロックしないよう、Web Worker を使用して画像をデコードするようにしました。 ([#3305](https://github.com/coil-kt/coil/pull/3305))
- **新機能**: Compose を使用しないマルチプラットフォーム・アーティファクトにおいて、Linux ネイティブターゲット（`linuxX64` および `linuxArm64`）のサポートを追加しました。 ([#3054](https://github.com/coil-kt/coil/pull/3054))
- **新機能**: 後続のリクエスト間の遷移を改善するため、Compose 専用の API を追加しました。 ([#3141](https://github.com/coil-kt/coil/pull/3141), [#3175](https://github.com/coil-kt/coil/pull/3175))
    - `ImageRequest.Builder.useExistingImageAsPlaceholder` は、プレースホルダーが設定されていない場合に、前の画像からのクロスフェードを有効にします。
    - `ImageRequest.Builder.preferEndFirstIntrinsicSize` は、`CrossfadePainter` が終了側のペインターの固有サイズ（intrinsic size）を優先するようにします。
- **新機能**: `coil-gif` に `ImageLoader.Builder.repeatCount(Int)` を追加し、アニメーション画像のグローバルな繰り返し回数を設定できるようにしました。 ([#3143](https://github.com/coil-kt/coil/pull/3143))
- **新機能**: `coil-video` において、埋め込み動画サムネイルの優先サポートを追加しました。 ([#3107](https://github.com/coil-kt/coil/pull/3107))
- **新機能**: `coil-core` と共に `coil-lint` をパブリッシュし、`ImageRequest.Builder` ブロック内での誤った `kotlin.error()` 呼び出しを検出する lint チェックを追加しました。 ([#3304](https://github.com/coil-kt/coil/pull/3304))
- Kotlin の言語バージョンを 2.1 に設定しました。 ([#3302](https://github.com/coil-kt/coil/pull/3302))
- `BitmapFetcher` を共通コード（common code）で利用可能にしました。 ([#3286](https://github.com/coil-kt/coil/pull/3286))
- Android でシングルトンの `ImageLoader` を作成する際、`applicationContext` を使用するようにしました。 ([#3246](https://github.com/coil-kt/coil/pull/3246))
- デフォルトで、キャッシュ可能な非2xxの HTTP レスポンス（例：`404`）をキャッシュし、キャッシュ不可なレスポンス（例：`500`）のキャッシュを停止しました。 ([#3137](https://github.com/coil-kt/coil/pull/3137), [#3139](https://github.com/coil-kt/coil/pull/3139))
- OkHttp のレスポンスボディを消費する際の潜在的な競合状態（race condition）を修正しました。 ([#3186](https://github.com/coil-kt/coil/pull/3186))
- Android でサイズ超過のビットマップによるクラッシュを防ぐため、`maxBitmapSize` のエッジケースを修正しました。 ([#3259](https://github.com/coil-kt/coil/pull/3259))
- Kotlin を 2.3.10 に更新しました。
- Compose を 1.9.3 に更新しました。
- Okio を 3.16.4 に更新しました。
- Skiko を 0.9.22.2 に更新しました。
- `kotlinx-io-okio` を 0.9.0 に更新しました。
- `androidx.core` を 1.16.0 に更新しました。
- `androidx.lifecycle` を 2.9.4 に更新しました。
- `androidx.exifinterface` を 1.4.2 に更新しました。

## [3.3.0] - 2025年7月22日

- **新機能**: アプリがバックグラウンドにある間、Android で `MemoryCache.maxSize` を制限する新しい API を導入しました。
    - `ImageLoader.Builder.memoryCacheMaxSizePercentWhileInBackground` が設定されている場合、アプリがバックグラウンドにある間、`ImageLoader` のメモリキャッシュは最大サイズの指定された割合に制限されます。この設定は現在はデフォルトで無効になっています。
    - アプリがバックグラウンドに移行すると、制限された最大サイズに達するまでメモリキャッシュから画像がトリミング（削除）されます。ただし、最近トリミングされた画像へのメモリキャッシュの弱参照（weak references）は影響を受けません。つまり、画像が他の場所（例：`AsyncImage`、`ImageView` など）で現在参照されている場合は、引き続きメモリキャッシュに存在します。
    - この API は、バックグラウンドでのメモリ使用量を削減し、アプリが早期に強制終了されるのを防ぎ、ユーザーのデバイスのメモリ負荷を軽減するのに役立ちます。
- **新機能**: `SvgDecoder` に `Svg.Parser` 引数を追加しました。
    - これにより、デフォルトの SVG パーサーがニーズに合わない場合に、カスタム SVG パーサーを使用できるようになります。
- `SvgDecoder` に `density` 引数を追加し、カスタムの密度倍率を提供できるようにしました。
- `Uri` のコピーと変更をサポートする `Uri.Builder` を追加しました。
- テストで Coil の `Dispatchers.main.immediate` 使用をオーバーライドできるように `ImageLoader.Builder.mainCoroutineContext` を追加しました。
- アニメーション終了時に `start` 画像の参照が解除されたときに `CrossfadePainter.intrinsicSize` が変化する問題を修正しました。これにより、`CrossfadeDrawable` の動作と一致するようになります。
- `ImageLoaders.executeBlocking` が Java からアクセスできない問題を修正しました。
- `coil-network-ktor3` で `kotlinx.io` の Okio 相互運用モジュールを使用するようにしました。
- `kotlinx-datetime` を `0.7.1` に更新しました。
    - このリリースには、`coil-network-cache-control` モジュールのみに影響するバイナリ互換性のない変更が含まれています。詳細は [こちら](https://github.com/Kotlin/kotlinx-datetime?tab=readme-ov-file#deprecation-of-instant) を参照してください。
- Kotlin を 2.2.0 に更新しました。
- Compose を 1.8.2 に更新しました。
- Okio を 3.15.0 に更新しました。
- Skiko を 0.9.4.2 に更新しました。

## [3.2.0] - 2025年5月13日

`3.1.0` からの変更点:

- **重要**: Compose `1.8.0` が Java 11 を要求するため、`coil-compose` と `coil-compose-core` は Java 11 バイトコードが必要になりました。有効にする方法については [こちら](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8-or-java-11) を参照してください。
- `AsyncImagePreviewHandler` の関数型コンストラクタが、`AsyncImagePainter.State.Loading` ではなく `AsyncImagePainter.State.Success` を返すように変更しました。
- `ConstraintsSizeResolver#size()` におけるキャンセル処理を修正しました。
- R8 でビルドする際に `PlatformContext` が見つからないという警告が出る問題を修正しました。
- デフォルトの `FakeImageLoaderEngine` レスポンスが返されたときに、`FakeImageLoaderEngine` が `Transition.Factory.NONE` を設定しない問題を修正しました。
- `ColorImage` から実験的（experimental）アノテーションを削除しました。
- `CacheControlCacheStrategy` において、ネットワークヘッダーのパースを遅延（lazy）させるようにしました。
- 共通コードを共有するため、`CircleCropTransformation` と `RoundedCornersTransformation` をリファクタリングしました。
- `ExifOrientationStrategy` が `RESPECT_PERFORMANCE` でない場合、内部的に `BitmapFactory` を使用するようにフォールバックしました。
- Kotlin を 2.1.20 に更新しました。
- Compose を 1.8.0 に更新しました。
- Okio を 3.11.0 に更新しました。
- Skiko を 0.9.4 に更新しました。
- Coroutines を 1.10.2 に更新しました。
- `accompanist-drawablepainter` を 0.37.3 に更新しました。

`3.2.0-rc02` からの変更点:

- `ExifOrientationStrategy` が `RESPECT_PERFORMANCE` でない場合、内部的に `BitmapFactory` を使用するようにフォールバックしました。
- Compose を 1.8.0 に更新しました。
- `accompanist-drawablepainter` を 0.37.3 に更新しました。

## [3.2.0-rc02] - 2025年4月26日

- 非 JVM ターゲットにおいて `KtorNetworkFetcherFactory` (Ktor 3) で画像を読み込む際、画像リクエストが `ClosedByteChannelException` で失敗する問題を修正しました。

## [3.2.0-rc01] - 2025年4月24日

- **重要**: Compose `1.8.0` が Java 11 を要求するため、`coil-compose` と `coil-compose-core` は Java 11 バイトコードが必要になりました。有効にする方法については [こちら](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8-or-java-11) を参照してください。
- `AsyncImagePreviewHandler` の関数型コンストラクタが、`AsyncImagePainter.State.Loading` ではなく `AsyncImagePainter.State.Success` を返すように変更しました。
- `ConstraintsSizeResolver#size()` におけるキャンセル処理を修正しました。
- R8 でビルドする際に `PlatformContext` が見つからないという警告が出る問題を修正しました。
- デフォルトの `FakeImageLoaderEngine` レスポンスが返されたときに、`FakeImageLoaderEngine` が `Transition.Factory.NONE` を設定しない問題を修正しました。
- `ColorImage` から実験的（experimental）アノテーションを削除しました。
- `CacheControlCacheStrategy` において、ネットワークヘッダーのパースを遅延させるようにしました。
- 共通コードを共有するため、`CircleCropTransformation` と `RoundedCornersTransformation` をリファクタリングしました。
- `coil-network-ktor2` と `coil-network-ktor3` で `kotlinx.io` の Okio 相互運用モジュールを使用するようにしました。
- Kotlin を 2.1.20 に更新しました。
- Compose を 1.8.0-rc01 に更新しました。
- Okio を 3.11.0 に更新しました。
- Skiko を 0.9.4 に更新しました。
- Coroutines を 1.10.2 に更新しました。

## [3.1.0] - 2025年2月4日

- `AsyncImage` のパフォーマンスを改善しました。
    - 実行時のパフォーマンスは、コンポーザブルがインスタンス化されるか再利用されるかに応じて 25% から 40% 向上しました。アロケーションも 35% から 48% 削減されました。詳細は [こちら](https://github.com/coil-kt/coil/pull/2795) を参照してください。
- `ColorImage` を追加し、`FakeImage` を非推奨にしました。
    - `ColorImage` は、テストやプレビューでフェイクの値を返すのに役立ちます。`FakeImage` と同じユースケースを解決しますが、`coil-test` ではなく `coil-core` でより簡単にアクセスできます。
- `coil-compose-core` の `Dispatchers.Main.immedate` への依存を削除しました。
    - これにより、Paparazzi や Roborazzi のスクリーンショットテストで `AsyncImagePainter` が `ImageRequest` を同期的に実行しない問題も修正されました。
- `data:[<mediatype>][;base64],<data>` 形式の [data URI](https://www.ietf.org/rfc/rfc2397.txt) のサポートを追加しました。
- GIF のメタデータに含まれるエンコードされた繰り返し回数を使用できるように `AnimatedImageDecoder.ENCODED_LOOP_COUNT` を追加しました。
- カスタム拡張をサポートするため、`NetworkRequest` に `Extras` を追加しました。
- `DiskCache.Builder.cleanupCoroutineContext` を追加し、`DiskCache.Builder.cleanupDispatcher` を非推奨にしました。
- API 29 以上で `android.graphics.ImageDecoder` の使用をオプションで無効化できるように `ImageLoader.Builder.imageDecoderEnabled` を追加しました。
- `ImageRequest` のデータ型に対して登録された `Keyer` がない場合に警告をログ出力するようにしました。
- `CrossfadePainter` をパブリックにしました。
- すべてのマルチプラットフォーム・ターゲットで `Transformation` をサポートしました。
- `CacheControlCacheStrategy` で `Expires` ヘッダーの値として 0 をサポートしました。
- `ContentScale` が `None` との間で変更された場合に、`AsyncImage`/`SubcomposeAsyncImage`/`rememberAsyncImage` が新しい `ImageRequest` を開始しない問題を修正しました。
- Kotlin を 2.1.10 に更新しました。
    - 注意: このリリースでは、Kotlin Native を使用する場合、[LLVM の更新](https://kotlinlang.org/docs/whatsnew21.html#llvm-update-from-11-1-0-to-16-0-0)（11.1.0 から 16.0.0 へ）のため、Kotlin 2.1.0 以上でコンパイルする必要があります。
- Compose を 1.7.3 に更新しました。
- `androidx.core` を 1.15.0 に更新しました。

## [3.0.4] - 2024年11月25日

- Android Studio のプレビューでベクタードローアブルがレンダリングされない問題を修正しました。
- サイズが `maxBitmapSize` を超えるリクエストにおいて、メモリキャッシュがヒットしない可能性がある問題を修正しました。
- Android で `FakeImage` がレンダリングされない問題を修正しました。
- `AsyncImage`/`rememberAsyncImagePainter`/`SubcomposeAsyncImage` で使用している際、リクエストの `Transformation` が変更されても新しい画像リクエストが開始されない問題を修正しました。
- `ScaleDrawable` と `CrossfadeDrawable` が tint の状態を尊重しない問題を修正しました。
- `ImageDecoder` が部分的な画像ソースをデコードできるようにしました。これは `BitmapFactory` の動作と一致します。
- デコード後に `Bitmap.prepareToDraw()` が呼び出されない問題を修正しました。
- ラスタライズされていない画像に対して `SvgDecoder` が `isSampled = true` を返さないようにしました。
- メインのイミディエイト・ディスパッチャ（immediate main dispatcher）が利用できない場合、Compose で `Dispatchers.Unconfined` にフォールバックするようにしました。これはプレビューやテスト環境でのみ使用されます。
- Ktor 2 を `2.3.13` に更新しました。

## [3.0.3] - 2024年11月14日

- `ImageView` の `ScaleType` に基づく `ImageRequest.scale` の設定を修正しました。
- `DiskCache` がファイルを削除した後にエントリの削除を追跡しないエッジケースを修正しました。
- エラーをログ出力する際に `Logger` に throwable を渡すようにしました。
- `kotlin-stdlib-jdk7` および `kotlin-stdlib-jdk8` を `kotlin-stdlib` に置換しないようにしました。

## [3.0.2] - 2024年11月9日

- Android でカスタムの `CacheStrategy` を指定して `OkHttpNetworkFetcherFactory` を呼び出した際のクラッシュを修正しました。
- `CacheControlCacheStrategy` がキャッシュエントリの有効期間（age）を誤って計算する問題を修正しました。
- API 28 以上において、`ImageRequest.bitmapConfig` が `ARGB_8888` または `HARDWARE` の場合にのみ尊重されるケースを修正しました。

## [3.0.1] - 2024年11月7日

- クラッシュを修正：ハードウェアビットマップをバックエンドに持つ `BitmapImage` に対して `Image.toBitmap` を呼び出した際のクラッシュを修正しました。
- `AsyncImageModelEqualityDelegate.Default` が `ImageRequest` 以外のモデルに対して等価性を誤って比較する問題を修正しました。

## [3.0.0] - 2024年11月4日

Coil 3.0.0 は、[Compose Multiplatform](https://www.jetbrains.com/compose-multiplatform/) をフルサポートした次のメジャーリリースです。

[3.0.0 における改善点と重要な変更の全リストについては、アップグレードガイドを確認してください](/coil/migrating_to_coil3/)。

`3.0.0-rc02` からの変更点:

- 残っていた非推奨のメソッドを削除しました。

## [3.0.0-rc02] - 2024年10月28日

[3.x における改善点と重要な変更の全リストについては、アップグレードガイドを確認してください](/coil/migrating_to_coil3/)。 `3.0.0-rc01` からの変更点:

- `BlackholeDecoder` を追加しました。これにより、[ディスクキャッシュのみのプリロード](https://coil-kt.github.io/coil/faq/#how-do-i-preload-an-image) が簡素化されます。
- `ConstraintsSizeResolver` と `DrawScopeSizeResolver` のための `remember` 関数を追加しました。
- `AsyncImage` のパラメータから `EqualityDelegate` を削除しました。代わりに、`LocalAsyncImageModelEqualityDelegate` を通じて設定する必要があります。
- 親コンポーザブルが `IntrinsicSize` を使用している場合に `AsyncImage` がレンダリングされない問題を修正しました。
- `AsyncImagePainter` に子ペインターがない場合に、`AsyncImage` が利用可能な制約（constraints）を埋め尽くしてしまう問題を修正しました。
- `EqualityDelegate` が無視されるために、状態が監視されると `rememberAsyncImagePainter` が無限に再構成（recomposition）される問題を修正しました。
- 特殊文字を含む `File`/`Path` パスのパースを修正しました。
- `VideoFrameDecoder` でカスタム `FileSystem` 実装を使用できるように修正しました。
- Ktor を `3.0.0` に更新しました。
- `androidx.annotation` を `1.9.0` に更新しました。

## [3.0.0-rc01] - 2024年10月8日

[3.x における改善点と重要な変更の全リストについては、アップグレードガイドを確認してください](/coil/migrating_to_coil3/)。 `3.0.0-alpha10` からの変更点:

- **破壊的変更**: `addLastModifiedToFileCacheKey` をデフォルトで無効にし、リクエストごとに設定できるようにしました。この動作は同じフラグで再度有効にできます。
- **新機能**: [`Cache-Control` ヘッダー](https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Cache-Control) のサポートを実装した新しい `coil-network-cache-control` アーティファクトを導入しました。
- **新機能**: `SvgDecoder.Factory` に `scaleToDensity` プロパティを追加しました。このプロパティは、固有の寸法を持つ SVG がデバイスの密度で乗算されることを保証します（Android でのみサポート）。
- `ExifOrientationPolicy` を `ExifOrientationStrategy` に改名しました。
- 取得時に共有不可な画像を `MemoryCache` から削除するようにしました。
- `ConstraintsSizeResolver` をパブリックにしました。
- `setSingletonImageLoaderFactory` を安定化しました。
- `coil-network-ktor3` で最適化された JVM I/O 関数を復元しました。
- mime type のリストに `pdf` を追加しました。
- コンパイル SDK を 35 に更新しました。
- Kotlin を 2.0.20 に更新しました。
- Okio を 3.9.1 に更新しました。

## [3.0.0-alpha10] - 2024年8月7日

- **破壊的変更**: `ImageLoader.Builder.networkObserverEnabled` を `NetworkFetcher` のための `ConnectivityChecker` インターフェースに置き換えました。
    - ネットワークオブザーバーを無効にするには、`KtorNetworkFetcherFactory`/`OkHttpNetworkFetcherFactory` のコンストラクタに `ConnectivityChecker.ONLINE` を渡します。
- **新機能**: すべてのプラットフォームで [Compose Multiplatform リソース](https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-images-resources.html) の読み込みをサポートしました。リソースを読み込むには、`Res.getUri` を使用します。

```kotlin
AsyncImage(
    model = Res.getUri("drawable/image.jpg"),
    contentDescription = null,
)
```

- `ImageLoader` と `ImageRequest` に `maxBitmapSize` プロパティを追加しました。
    - このプロパティのデフォルトは 4096x4096 で、割り当てられるビットマップの寸法の安全な上限を提供します。これにより、誤って非常に大きな画像を `Size.ORIGINAL` で読み込んでしまい、メモリ不足（Out of Memory）例外が発生するのを防ぎます。
- カスタムポリシーをサポートするため、`ExifOrientationPolicy` をインターフェースに変更しました。
- Windows のファイルパスにおける `Uri` の処理を修正しました。
- `Image` API から `@ExperimentalCoilApi` を削除しました。
- Kotlin を 2.0.10 に更新しました。

## [3.0.0-alpha09] - 2024年7月23日

- **破壊的変更**: `io.coil-kt.coil3:coil-network-ktor` アーティファクトを、Ktor 2.x に依存する `io.coil-kt.coil3:coil-network-ktor2` に改名しました。さらに、Ktor 3.x に依存する `io.coil-kt.coil3:coil-network-ktor3` を導入しました。`wasmJs` のサポートは Ktor 3.x でのみ利用可能です。
- **新機能**: 画像リクエストを手動で再開するための `AsyncImagePainter.restart()` を追加しました。
- `NetworkClient` および関連クラスから `@ExperimentalCoilApi` を削除しました。
- 不必要な `Extras` や `Map` のアロケーションを避けるため、`ImageRequest` を最適化しました。

## [2.7.0] - 2024年7月17日

- `ImageLoader.execute`、`AsyncImage`、`SubcomposeAsyncImage`、および `rememberAsyncImagePainter` のパフォーマンス向上のため、内部のコルーチン使用をわずかに最適化しました。 ([#2205](https://github.com/coil-kt/coil/pull/2205))
- チャンク化された（chunked）レスポンスに対する重複したネットワーク呼び出しを修正しました。 ([#2363](https://github.com/coil-kt/coil/pull/2363))
- Kotlin を 2.0.0 に更新しました。
- Compose UI を 1.6.8 に更新しました。
- Okio を 3.9.0 に更新しました。

## [3.0.0-alpha08] - 2024年7月8日

- **破壊的変更**: `ImageRequest` と `ImageLoader` の `dispatcher` メソッドを `coroutineContext` に改名しました。例えば、`ImageRequest.Builder.dispatcher` は `ImageRequest.Builder.coroutineContext` になりました。これは、メソッドが任意の `CoroutineContext` を受け取れるようになり、`Dispatcher` が必須ではなくなったためです。
- 修正: 競合状態により発生する可能性があった `IllegalStateException: Reading a state that was created after the snapshot was taken or in a snapshot that has not yet been applied` を修正しました。
    - 注意: これにより `Dispatchers.Main.immediate` への緩い依存関係が再導入されました。結果として、JVM では [`kotlinx-coroutines-swing`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-swing/) への依存関係を再度追加する必要があります。これがインポートされていない場合、`ImageRequest` は即座にディスパッチされず、`ImageRequest.placeholder` の設定やメモリキャッシュからの解決の前に 1 フレームの遅延が発生します。

## [3.0.0-alpha07] - 2024年6月26日

- **破壊的変更**: `AsyncImagePainter` はデフォルトで `onDraw` を待機せず、代わりに `Size.ORIGINAL` を使用するようになりました。
    - これにより [Roborazzi/Paparazzi との互換性の問題](https://github.com/coil-kt/coil/issues/1910) が修正され、全体的なテストの信頼性が向上します。
    - `onDraw` を待機する以前の動作に戻すには、`ImageRequest.sizeResolver` として `DrawScopeSizeResolver` を設定してください。
- **破壊的変更**: マルチプラットフォーム `Image` API をリファクタリングしました。特に、`asCoilImage` は `asImage` に改名されました。
- **破壊的変更**: `AsyncImagePainter.state` が `StateFlow<AsyncImagePainter.State>` に変更されました。値を監視するには `collectAsState` を使用してください。これによりパフォーマンスが向上します。
- **破壊的変更**: `AsyncImagePainter.imageLoader` と `AsyncImagePainter.request` が `StateFlow<AsyncImagePainter.Inputs>` に統合されました。値を監視するには `collectAsState` を使用してください。これによりパフォーマンスが向上します。
- **破壊的変更**: リソースのシュリンキング（最適化）を妨げるため、`android.resource://example.package.name/drawable/image` 形式の URI サポートを削除しました。
    - もしこの機能が引き続き必要な場合は、[コンポーネントレジストリに手動で `ResourceUriMapper` を含める](https://github.com/coil-kt/coil/blob/main/coil-core/src/androidInstrumentedTest/kotlin/coil3/map/ResourceUriMapper.kt) ことができます。
- **新機能**: `AsyncImagePainter` のプレビューレンダリング動作の制御をサポートするため、`AsyncImagePreviewHandler` を導入しました。
    - プレビューの動作をオーバーライドするには `LocalAsyncImagePreviewHandler` を使用します。
    - この変更およびその他の `coil-compose` の改善の一環として、`AsyncImagePainter` はデフォルトで `ImageRequest.placeholder` を表示するのではなく、デフォルトで `ImageRequest` を実行しようとするようになりました。[ネットワークやファイルを使用するリクエストは、プレビュー環境では失敗することが予想されます](https://developer.android.com/develop/ui/compose/tooling/previews#preview-limitations)が、Android リソースは動作するはずです。
- **新機能**: フレームインデックスによる動画画像の抽出をサポートしました。 ([#2183](https://github.com/coil-kt/coil/pull/2183))
- **新機能**: 任意の `CoroutineDispatcher` メソッドへの `CoroutineContext` の受け渡しをサポートしました。 ([#2241](https://github.com/coil-kt/coil/pull/2241))。
- **新機能**: JS および WASM JS における弱参照（weak reference）メモリキャッシュをサポートしました。
- Compose において `Dispatchers.Main.immediate` にディスパッチしないようにしました。副次的な効果として、JVM で [`kotlinx-coroutines-swing`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-swing/) をインポートする必要がなくなりました。
- パフォーマンス向上のため、Compose で `async` を呼び出したりディスポーザブルを作成したりしないようにしました（@mlykotom に感謝！）。 ([#2205](https://github.com/coil-kt/coil/pull/2205))
- 修正：グローバルな `ImageLoader` の extra を `Options` に渡すよう修正しました。 ([#2223](https://github.com/coil-kt/coil/pull/2223))
- 非 Android ターゲットで `crossfade(false)` が動作しない問題を修正しました。
- VP8X フィーチャーフラグのバイトオフセットを修正しました（[#2199](https://github.com/coil-kt/coil/pull/2199)）。
- 非 Android ターゲットの `SvgDecoder` において、描画時に画像をレンダリングするのではなく、ビットマップにレンダリングするように変更しました。これによりパフォーマンスが向上します。
    - この動作は `SvgDecoder(renderToBitmap)` を使用して制御できます。
- `ScaleDrawable` を `coil-gif` から `coil-core` に移動しました。
- Update Kotlin to 2.0.0.
- Update Compose to 1.6.11.
- Update Okio to 3.9.0.
- Update Skiko to 0.8.4.
- [3.x における重要な変更の全リストについては、アップグレードガイドを確認してください。](/coil/migrating_to_coil3/)

## [3.0.0-alpha06] - 2024年2月29日

- Skiko を 0.7.93 にダウングレードしました。
- [3.x における重要な変更の全リストについては、アップグレードガイドを確認してください。](/coil/migrating_to_coil3/)

## [3.0.0-alpha05] - 2024年2月28日

- **新機能**: `wasmJs` ターゲットをサポートしました。
- 非 Android プラットフォームでビットマップをバックエンドに持たない `Image` の描画をサポートするため、`DrawablePainter` と `DrawableImage` を作成しました。
    - `Image` API は実験的（experimental）であり、アルファリリース間で変更される可能性があります。
- `Modifier.Node` を実装するように `ContentPainterModifier` を更新しました。
- 修正: コンポーネントのコールバックとネットワークオブザーバーの登録をバックグラウンドスレッドで遅延（lazy）して行うようにしました。これにより、通常メインスレッドで発生していた初期化の遅延が修正されます。
- 修正: `ImageRequest` で `ImageLoader.Builder.placeholder/error/fallback` が使用されない問題を修正しました。
- Update Compose to 1.6.0.
- Update Coroutines to 1.8.0.
- Update Okio to 3.8.0.
- Update Skiko to 0.7.94.
- [3.x における重要な変更の全リストについては、アップグレードガイドを確認してください。](/coil/migrating_to_coil3/)

## [2.6.0] - 2024年2月23日

- `rememberAsyncImagePainter`、`AsyncImage`、および `SubcomposeAsyncImage` を [restartable および skippable](https://developer.android.com/jetpack/compose/performance/stability#functions) にしました。これにより、コンポーザブルの引数のいずれかが変更されない限り再構成（recomposition）を回避でき、パフォーマンスが向上します。
    - `model` が再構成をトリガーするかどうかを制御するため、`rememberAsyncImagePainter`、`AsyncImage`、および `SubcomposeAsyncImage` にオプションの `modelEqualityDelegate` 引数を追加しました。
- `Modifier.Node` を実装するように `ContentPainterModifier` を更新しました。
- 修正: コンポーネントのコールバックとネットワークオブザーバーの登録をバックグラウンドスレッドで遅延して行うようにしました。これにより、通常メインスレッドで発生していた初期化の遅延が修正されます。
- 修正: `ImageRequest.listener` または `ImageRequest.target` が変更された場合でも、`rememberAsyncImagePainter`、`AsyncImage`、および `SubcomposeAsyncImage` で新しい画像リクエストを再開しないようにしました。
- 修正: `AsyncImagePainter` で画像リクエストを 2 回監視しないようにしました。
- Update Kotlin to 1.9.22.
- Update Compose to 1.6.1.
- Update Okio to 3.8.0.
- Update `androidx.collection` to 1.4.0.
- Update `androidx.lifecycle` to 2.7.0.

## [3.0.0-alpha04] - 2024年2月1日

- **破壊的変更**: `OkHttpNetworkFetcherFactory` と `KtorNetworkFetcherFactory` のパブリック API から `Lazy` を削除しました。
- `OkHttpNetworkFetcherFactory` において、`OkHttpClient` ではなく `Call.Factory` を公開するようにしました。
- `NetworkResponseBody` が `ByteString` をラップするように変更しました。
- Compose を 1.5.12 にダウングレードしました。
- [重要な変更の全リストについては、アップグレードガイドを確認してください。](/coil/migrating_to_coil3/)

## [3.0.0-alpha03] - 2024年1月20日

- **破壊的変更**: `coil-network` を `coil-network-ktor` に改名しました。さらに、OkHttp に依存し Ktor エンジンの指定を必要としない新しい `coil-network-okhttp` アーティファクトを追加しました。
    - インポートするアーティファクトに応じて、`KtorNetworkFetcherFactory` または `OkHttpNetworkFetcherFactory` を使用して手動で `Fetcher.Factory` を参照できます。
- Apple プラットフォームでの `NSUrl` の読み込みをサポートしました。
- `AsyncImage` に `clipToBounds` パラメータを追加しました。
- [重要な変更の全リストについては、アップグレードガイドを確認してください。](/coil/migrating_to_coil3/)

## [3.0.0-alpha02] - 2024年1月10日

- **破壊的変更**: `coil-gif`、`coil-network`、`coil-svg`、および `coil-video` のパッケージを更新し、すべてのクラスがそれぞれ `coil.gif`、`coil.network`、`coil.svg`、および `coil.video` に含まれるようにしました。これにより、他のアーティファクトとのクラス名衝突を回避できます。
- **破壊的変更**: `ImageDecoderDecoder` を `AnimatedImageDecoder` に改名しました。
- **新機能**: `coil-gif`、`coil-network`、`coil-svg`、および `coil-video` のコンポーネントが、各 `ImageLoader` の `ComponentRegistry` に自動的に追加されるようになりました。
    - 明確に言うと、`3.0.0-alpha01` とは異なり、**`NetworkFetcher.Factory()` を `ComponentRegistry` に手動で追加する必要はありません**。`io.coil-kt.coil3:coil-network:[version]` と [Ktor エンジン](https://ktor.io/docs/http-client-engines.html#dependencies) をインポートするだけで、ネットワーク画像を読み込むことができます。
    - これらのコンポーネントを手動で `ComponentRegistry` に追加しても安全です。手動で追加されたコンポーネントは、自動的に追加されるコンポーネントよりも優先されます。
    - 必要であれば、この動作は `ImageLoader.Builder.serviceLoaderEnabled(false)` を使用して無効にできます。
- **新機能**: すべてのプラットフォームで `coil-svg` をサポートしました。Android では [AndroidSVG](https://bigbadaboom.github.io/androidsvg/) が、非 Android プラットフォームでは [SVGDOM](https://api.skia.org/classSkSVGDOM.html) がバックエンドとして使用されます。
- Coil は内部的に Android の [`ImageDecoder`](https://developer.android.com/reference/android/graphics/ImageDecoder) API を使用するようになりました。これにより、ファイル、リソース、またはコンテンツ URI から直接デコードする際のパフォーマンスが向上します。
- 修正: 複数の `coil3.Uri` パースの修正。
- [重要な変更の全リストについては、アップグレードガイドを確認してください。](/coil/migrating_to_coil3/)

## [3.0.0-alpha01] - 2023年12月30日

- **新機能**: [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) をサポートしました。Coil は Android、JVM、iOS、macOS、Javascript をサポートする Kotlin Multiplatform ライブラリになりました。
- Coil の Maven 座標を `io.coil-kt.coil3` に、インポートを `coil3` に更新しました。これにより、バイナリ互換性の問題を発生させることなく、Coil 3 を Coil 2 と共存させることができます。例えば、`io.coil-kt:coil:[version]` は `io.coil-kt.coil3:coil:[version]` になりました。
- `coil-base` および `coil-compose-base` アーティファクトを、Coroutines、Ktor、AndroidX で使用されている命名規則に合わせて、それぞれ `coil-core` および `coil-compose-core` に改名しました。
- [重要な変更の全リストについては、アップグレードガイドを確認してください。](/coil/migrating_to_coil3/)

## [2.5.0] - 2023年10月30日

- **新機能**: `coil-video` で `MediaDataSource` 実装のデコードをサポートするため、`MediaDataSourceFetcher.Factory` を追加しました。 ([#1795](https://github.com/coil-kt/coil/pull/1795))
- ハードウェアビットマップのブロックリストに `SHIFT6m` デバイスを追加しました。 ([#1812](https://github.com/coil-kt/coil/pull/1812))
- 修正: 片方の次元が無制限（unbounded）のサイズを返すペインターへのガードを追加しました。 ([#1826](https://github.com/coil-kt/coil/pull/1826))
- 修正: キャッシュされたヘッダーに非 ASCII 文字が含まれている場合、`304 Not Modified` の後のディスクキャッシュ読み込みが失敗する問題を修正しました。 ([#1839](https://github.com/coil-kt/coil/pull/1839))
- 修正: `FakeImageEngine` がインターセプターチェーンのリクエストを更新しない問題を修正しました。 ([#1905](https://github.com/coil-kt/coil/pull/1905))
- Update compile SDK to 34.
- Update Kotlin to 1.9.10.
- Update Coroutines to 1.7.3.
- Update `accompanist-drawablepainter` to 0.32.0.
- Update `androidx.annotation` to 1.7.0.
- Update `androidx.compose.foundation` to 1.5.4.
- Update `androidx.core` to 1.12.0.
- Update `androidx.exifinterface:exifinterface` to 1.3.6.
- Update `androidx.lifecycle` to 2.6.2.
- Update `com.squareup.okhttp3` to 4.12.0.
- Update `com.squareup.okio` to 3.6.0.

## [2.4.0] - 2023年5月21日

- `DiskCache` の `get`/`edit` を `openSnapshot`/`openEditor` に改名しました。
- `AsyncImagePainter` で `ColorDrawable` を `ColorPainter` に自動変換しないようにしました。
- シンプルな `AsyncImage` オーバーロードに `@NonRestartableComposable` アノテーションを付与しました。
- 修正: `ImageSource` で `Context.cacheDir` を遅延して呼び出すようにしました。
- 修正: `coil-bom` のパブリッシュを修正しました。
- 修正: ハードウェアビットマップが無効な場合、常にビットマップ設定を `ARGB_8888` に設定するように修正しました。
- Update Kotlin to 1.8.21.
- Update Coroutines to 1.7.1.
- Update `accompanist-drawablepainter` to 0.30.1.
- Update `androidx.compose.foundation` to 1.4.3.
- Update `androidx.profileinstaller:profileinstaller` to 1.3.1.
- Update `com.squareup.okhttp3` to 4.11.0.

## [2.3.0] - 2023年3月25日

- **新機能**: `FakeImageLoaderEngine` を含む新しい `coil-test` アーティファクトを導入しました。このクラスは、イメージローダー의 レスポンスをハードコードし、テストにおいて一貫性のある同期的な（メインスレッドからの）レスポンスを保証するのに役立ちます。詳細は [こちら](https://coil-kt.github.io/coil/testing) を参照してください。
- **新機能**: `coil-base` (`coil` の子モジュール) および `coil-compose-base` (`coil-compose` の子モジュール) に [ベースラインプロフィール（baseline profiles）](https://developer.android.com/topic/performance/baselineprofiles/overview) を追加しました。
    - これにより Coil の実行時パフォーマンスが向上し、アプリでの Coil の使用方法に応じて [より良いフレームタイミング](https://github.com/coil-kt/coil/tree/main/coil-benchmark/benchmark_output.md) が得られます。
- 修正: エンコードされたデータを含む `file://` URI のパースを修正しました。 [#1601](https://github.com/coil-kt/coil/pull/1601)
- 修正: 存在しないディレクトリが渡された場合に、`DiskCache` が最大サイズを正しく計算するように修正しました。 [#1620](https://github.com/coil-kt/coil/pull/1620)
- `Coil.reset` をパブリック API にしました。 [#1506](https://github.com/coil-kt/coil/pull/1506)
- Java のデフォルトメソッド生成を有効にしました。 [#1491](https://github.com/coil-kt/coil/pull/1491)
- Update Kotlin to 1.8.10.
- Update `accompanist-drawablepainter` to 0.30.0.
- Update `androidx.annotation` to 1.6.0.
- Update `androidx.appcompat:appcompat-resources` to 1.6.1.
- Update `androidx.compose.foundation` to 1.4.0.
- Update `androidx.core` to 1.9.0.
- Update `androidx.exifinterface:exifinterface` to 1.3.6.
- Update `androidx.lifecycle` to 2.6.1.
- Update `okio` to 3.3.0.

## [2.2.2] - 2022年10月1日

- イメージローダーの初期化が完全に完了してから、システムコールバックを登録するようにしました。 [#1465](https://github.com/coil-kt/coil/pull/1465)
- バンディング（階調の縞）を避けるため、API 30+ において `VideoFrameDecoder` で優先されるビットマップ設定をセットするようにしました。 [#1487](https://github.com/coil-kt/coil/pull/1487)
- `FileUriMapper` において `#` を含むパスのパースを修正しました。 [#1466](https://github.com/coil-kt/coil/pull/1466)
- ディスクキャッシュから非 ASCII ヘッダーを持つレスポンスを読み込む問題を修正しました。 [#1468](https://github.com/coil-kt/coil/pull/1468)
- アセットのサブフォルダ内にある動画のデコードを修正しました。 [#1489](https://github.com/coil-kt/coil/pull/1489)
- Update `androidx.annotation` to 1.5.0.

## [2.2.1] - 2022年9月8日

- 修正: `RoundedCornersTransformation` が `input` ビットマップを適切にスケールするように修正しました。
- `kotlin-parcelize` プラグインへの依存関係を削除しました。
- コンパイル SDK を 33 に更新しました。
- [#1423](https://github.com/coil-kt/coil/issues/1423) 回避のため、`androidx.appcompat:appcompat-resources` を 1.4.2 にダウングレードしました。

## [2.2.0] - 2022年8月16日

- **新機能**: 動画の再生時間に対する割合で動画フレームを指定できるよう、`coil-video` に `ImageRequest.videoFramePercent` を追加しました。
- **新機能**: `BitmapFactoryDecoder` が EXIF 回転（orientation）データをどのように扱うかを設定する `ExifOrientationPolicy` を追加しました。
- 修正: 未定義の寸法を持つサイズが渡された場合でも `RoundedCornersTransformation` で例外をスローしないようにしました。
- 修正: GIF のフレーム遅延を、1バイトの符号付き整数ではなく、2バイトの符号なし整数として読み込むようにしました。
- Update Kotlin to 1.7.10.
- Update Coroutines to 1.6.4.
- Update Compose to 1.2.1.
- Update OkHttp to 4.10.0.
- Update Okio to 3.2.0.
- Update `accompanist-drawablepainter` to 0.25.1.
- Update `androidx.annotation` to 1.4.0.
- Update `androidx.appcompat:appcompat-resources` to 1.5.0.
- Update `androidx.core` to 1.8.0.

## [2.1.0] - 2022年5月17日

- **新機能**: `ByteArray` の読み込みをサポートしました。 ([#1202](https://github.com/coil-kt/coil/pull/1202))
- **新機能**: `ImageRequest.Builder.css` を使用して SVG のカスタム CSS ルールを設定できるようになりました。 ([#1210](https://github.com/coil-kt/coil/pull/1210))
- 修正: `GenericViewTarget` の private メソッドを protected に変更しました。 ([#1273](https://github.com/coil-kt/coil/pull/1273))
- コンパイル SDK を 32 に更新しました。 ([#1268](https://github.com/coil-kt/coil/pull/1268))

## [2.0.0] - 2022年5月10日

Coil 2.0.0 はライブラリのメジャーアップデートであり、破壊的変更が含まれています。アップグレード方法については [アップグレードガイド](/coil/migrating) を確認してください。

- **新機能**: `coil-compose` に `AsyncImage` を導入しました。詳細は [ドキュメント](https://coil-kt.github.io/coil/compose/) を確認してください。

```kotlin
// ネットワークから画像を表示します。
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
)

// プレースホルダー、円形クロップ、クロスフェードアニメーションを使用してネットワークから画像を表示します。
AsyncImage(
    model = ImageRequest.Builder(LocalContext.current)
        .data("https://example.com/image.jpg")
        .crossfade(true)
        .build(),
    placeholder = painterResource(R.drawable.placeholder),
    contentDescription = stringResource(R.string.description),
    contentScale = ContentScale.Crop,
    modifier = Modifier.clip(CircleShape)
)
```

- **新機能**: パブリックな `DiskCache` API を導入しました。
    - ディスクキャッシュを設定するには `ImageLoader.Builder.diskCache` と `DiskCache.Builder` を使用します。
    - Coil 2.0 では OkHttp の `Cache` を使用すべきではありません。詳細は [こちら](/coil/migrating_to_coil2/#disk-cache) を参照してください。
    - `Cache-Control` やその他のキャッシュヘッダーは引き続きサポートされます（キャッシュは URL の一致のみをチェックするため `Vary` ヘッダーは除きます）。また、レスポンスコードが [200..300) の範囲内のレスポンスのみがキャッシュされます。
    - 既存のディスクキャッシュは 2.0 へのアップグレード時にクリアされます。
- サポートされる最小 API が 21 になりました。
- `ImageRequest` のデフォルトの `Scale` は `Scale.FIT` になりました。
    - これは、デフォルトの `Scale` を持つ他のクラスと `ImageRequest.scale` の一貫性を持たせるために変更されました。
    - `ImageViewTarget` を持つリクエストの `Scale` は引き続き自動検出されます。
- 画像パイプラインクラスの再構築:
    - `Mapper`、`Fetcher`、および `Decoder` は、より柔軟になるようリファクタリングされました。
    - `Fetcher.key` は新しい `Keyer` インターフェースに置き換えられました。`Keyer` は入力データからキャッシュキーを作成します。
    - `Decoder` が Okio のファイルシステム API を使用して直接 `File` を読み込めるようにする `ImageSource` を追加しました。
- Jetpack Compose 統合の再構築:
    - `rememberImagePainter` と `ImagePainter` は、それぞれ `rememberAsyncImagePainter` と `AsyncImagePainter` に改名されました。
    - `LocalImageLoader` を非推奨にしました。詳細は非推奨メッセージを確認してください。
- 実行時の非 null アサーションの生成を無効にしました。
    - Java を使用している場合、非 null アノテーションが付与された引数に null を渡しても、即座に `NullPointerException` がスローされなくなりました。Kotlin のコンパイル時の null 安全性により、これが防止されます。
    - この変更により、ライブラリのサイズを小さくすることができます。
- `Size` は、幅と高さの 2 つの `Dimension` 値で構成されるようになりました。`Dimension` は正のピクセル値または `Dimension.Undefined` のいずれかになります。詳細は [こちら](/coil/migrating#size-refactor) を参照してください。
- `BitmapPool` と `PoolableViewTarget` をライブラリから削除しました。
- `VideoFrameFileFetcher` と `VideoFrameUriFetcher` をライブラリから削除しました。すべてのデータソースをサポートする `VideoFrameDecoder` を代わりに使用してください。
- [`BlurTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/BlurTransformation.kt) および [`GrayscaleTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/GrayscaleTransformation.kt) はライブラリから削除されました。使用している場合は、コードをプロジェクトにコピーしてください。
- `Transition.transition` を suspend しない関数に変更しました。完了するまでトランジションを suspend する必要がなくなったためです。
- 進行中の `BitmapFactory` オペレーションの最大数を制限する `bitmapFactoryMaxParallelism` のサポートを追加しました。この値はデフォルトで 4 で、UI パフォーマンスを向上させます。
- `interceptorDispatcher`、`fetcherDispatcher`、`decoderDispatcher`、および `transformationDispatcher` のサポートを追加しました。
- 共通の `ViewTarget` ロジックを処理する `GenericViewTarget` を追加しました。
- デフォルトでサポートされるデータ型に `ByteBuffer` を追加しました。
- `Disposable` をリファクタリングし、基盤となる `ImageRequest` のジョブを公開するようにしました。
- `MemoryCache` API を刷新しました。
- `ImageRequest.error` は、`ImageRequest.fallback` が null の場合、`Target` に設定されるようになりました。
- `Transformation.key` は `Transformation.cacheKey` に置き換えられました。
- Update Kotlin to 1.6.10.
- Update Compose to 1.1.1.
- Update OkHttp to 4.9.3.
- Update Okio to 3.0.0.

`2.0.0-rc03` からの変更点:
- `Dimension.Original` を `Dimension.Undefined` に変換しました。
    - これにより、サイズシステムにおけるいくつかのエッジケース（[例](https://github.com/coil-kt/coil/issues/1246)）を修正するため、非ピクセル次元のセマンティクスがわずかに変更されました。
- ContentScale が None の場合、画像を `Size.ORIGINAL` で読み込むようにしました。
- `ImageView.load` ビルダー引数が最後ではなく最初に適用される問題を修正しました。
- レスポンスが変更されていない場合（not modified）、HTTP ヘッダーを結合しない問題を修正しました。

## [2.0.0-rc03] - 2022年4月11日

- `ScaleResolver` インターフェースを削除しました。
- `Size` コンストラクタを関数に変更しました。
- `Dimension.Pixels` の `toString` がピクセル値のみになるよう変更しました。
- `SystemCallbacks.onTrimMemory` における稀なクラッシュへのガードを追加しました。
- Update Coroutines to 1.6.1.

## [2.0.0-rc02] - 2022年3月20日

- `ImageRequest` のデフォルトサイズを `Size.ORIGINAL` ではなく、現在のディスプレイサイズに戻しました。
- `DiskCache.Builder` が実験的（experimental）としてマークされていた問題を修正しました。`DiskCache` のメソッドのみが実験的です。
- 片方の次元が `WRAP_CONTENT` である `ImageView` に画像を読み込む際、制限された次元に合わせるのではなく、元のサイズで画像を読み込んでしまうケースを修正しました。
- `MemoryCache.Key`、`MemoryCache.Value`、および `Parameters.Entry` からコンポーネント関数（component functions）を削除しました。

## [2.0.0-rc01] - 2022年3月2日

`1.4.0` からの重要な変更点:

- サポートされる最小 API が 21 になりました。
- Jetpack Compose 統合の再構築。
    - `rememberImagePainter` は `rememberAsyncImagePainter` に改名されました。
    - `AsyncImage` と `SubcomposeAsyncImage` のサポートを追加しました。詳細は [ドキュメント](https://coil-kt.github.io/coil/compose/) を確認してください。
    - `LocalImageLoader` を非推奨にしました。詳細は非推奨メッセージを確認してください。
- Coil 2.0 は独自のディスクキャッシュ実装を持ち、ディスクキャッシュのために OkHttp に依存しなくなりました。
    - ディスクキャッシュを設定するには `ImageLoader.Builder.diskCache` と `DiskCache.Builder` を使用します。
    - Coil 2.0 では OkHttp の `Cache` を使用**すべきではありません**。書き込み中にスレッドが中断されるとキャッシュが破損する可能性があるためです。
    - `Cache-Control` やその他のキャッシュヘッダーは引き続きサポートされます（キャッシュは URL の一致のみをチェックするため `Vary` ヘッダーは除きます）。また、レスポンスコードが [200..300) の範囲内のレスポンスのみがキャッシュされます。
    - 既存のディスクキャッシュは 2.0 へのアップグレード時にクリアされます。
- `ImageRequest` のデフォルトの `Scale` は `Scale.FIT` になりました。
    - これは、デフォルトの `Scale` を持つ他のクラスと `ImageRequest.scale` の一貫性を持たせるために変更されました。
    - `ImageViewTarget` を持つリクエストの `Scale` は引き続き自動検出されます。
- `ImageRequest` のデフォルトサイズは `Size.ORIGINAL` になりました。
- 画像パイプラインクラスの再構築:
    - `Mapper`、`Fetcher`、および `Decoder` は、より柔軟になるようリファクタリングされました。
    - `Fetcher.key` は新しい `Keyer` インターフェースに置き換えられました。`Keyer` は入力データからキャッシュキーを作成します。
    - `Decoder` が Okio のファイルシステム API を使用して直接 `File` を読み込めるようにする `ImageSource` を追加しました。
- 実行時の non-null アサーションの生成を無効にしました。
    - Java を使用している場合、non-null アノテーションが付与されたパラメータに null を渡しても、即座に `NullPointerException` がスローされなくなりました。Kotlin のコンパイル時の null 安全性により、これが防止されます。
    - この変更により、ライブラリのサイズを小さくすることができます。
- `Size` は、幅と高さの 2 つ `Dimension` 値で構成されるようになりました。`Dimension` は正のピクセル値または `Dimension.Original` のいずれかになります。
- `BitmapPool` と `PoolableViewTarget` はライブラリから削除されました。
- `VideoFrameFileFetcher` と `VideoFrameUriFetcher` はライブラリから削除されました。すべてのデータソースをサポートする `VideoFrameDecoder` を代わりに使用してください。
- [`BlurTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/BlurTransformation.kt) および [`GrayscaleTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/GrayscaleTransformation.kt) はライブラリから削除されました。使用している場合は、コードをプロジェクトにコピーしてください。
- `Transition.transition` を suspend しない関数に変更しました。完了するまでトランジションを suspend する必要がなくなったためです。
- 進行中の `BitmapFactory` オペレーションの最大数を制限する `bitmapFactoryMaxParallelism` のサポートを追加しました。この値はデフォルトで 4 で、UI パフォーマンスを向上させます。
- `interceptorDispatcher`、`fetcherDispatcher`、`decoderDispatcher`、および `transformationDispatcher` のサポートを追加しました。
- 共通の `ViewTarget` ロジックを処理する `GenericViewTarget` を追加しました。
- デフォルトでサポートされるデータ型に `ByteBuffer` を追加しました。
- `Disposable` をリファクタリングし、基盤となる `ImageRequest` のジョブを公開するようにしました。
- `MemoryCache` API を刷新しました。
- `ImageRequest.error` は、`ImageRequest.fallback` が null の場合、`Target` に設定されるようになりました。
- `Transformation.key` は `Transformation.cacheKey` に置き換えられました。
- Update Kotlin to 1.6.10.
- Update Compose to 1.1.1.
- Update OkHttp to 4.9.3.
- Update Okio to 3.0.0.

`2.0.0-alpha09` からの変更点:

- `-Xjvm-default=all` コンパイラフラグを削除しました。
- must-revalidate/e-tag を持つ複数のリクエストが同時に実行された場合に、画像の読み込みに失敗する問題を修正しました。
- `<svg` タグの後に改行文字がある場合に `DecodeUtils.isSvg` が false を返す問題を修正しました。
- `LocalImageLoader.provides` の非推奨メッセージをより明確にしました。
- Update Compose to 1.1.1.
- Update `accompanist-drawablepainter` to 0.23.1.

## [2.0.0-alpha09] - 2022年2月16日

- `AsyncImage` が無効な制約（constraints）を作成する問題を修正しました。 ([#1134](https://github.com/coil-kt/coil/pull/1134))
- `AsyncImagePainter` に `ContentScale` 引数を追加しました。 ([#1144](https://github.com/coil-kt/coil/pull/1144))
    - 画像が正しいサイズで読み込まれることを保証するため、`Image` に設定されているものと同じ値を設定する必要があります。
- `ImageRequest` の `Scale` を遅延解決できるよう `ScaleResolver` を追加しました。 ([#1134](https://github.com/coil-kt/coil/pull/1134))
    - `ImageRequest.scale` は `ImageRequest.scaleResolver.scale()` に置き換える必要があります。
- Update Compose to 1.1.0.
- Update `accompanist-drawablepainter` to 0.23.0.
- Update `androidx.lifecycle` to 2.4.1.

## [2.0.0-alpha08] - 2022年2月7日

- `DiskCache` と `ImageSource` を Okio の `FileSystem` API を使用するように更新しました。 ([#1115](https://github.com/coil-kt/coil/pull/1115))

## [2.0.0-alpha07] - 2022年1月30日

- `AsyncImage` のパフォーマンスを大幅に向上させ、`AsyncImage` を `AsyncImage` と `SubcomposeAsyncImage` に分割しました。 ([#1048](https://github.com/coil-kt/coil/pull/1048))
    - `SubcomposeAsyncImage` は `loading`/`success`/`error`/`content` スロット API を提供し、サブコンポジション（subcomposition）を使用しますが、パフォーマンスは低下します。
    - `AsyncImage` は、読み込み中やリクエスト失敗時に描画される `Painter` を上書きするための `placeholder`/`error`/`fallback` 引数を提供します。`AsyncImage` はサブコンポジションを使用せず、`SubcomposeAsyncImage` よりもはるかに高いパフォーマンスを発揮します。
    - `SubcomposeAsyncImage.content` から `AsyncImagePainter.State` 引数を削除しました。必要であれば `painter.state` を使用してください。
    - `AsyncImage` と `SubcomposeAsyncImage` の両方に `onLoading`/`onSuccess`/`onError` コールバックを追加しました。
- `LocalImageLoader` を非推奨にしました。 ([#1101](https://github.com/coil-kt/coil/pull/1101))
- `ImageRequest.tags` のサポートを追加しました。 ([#1066](https://github.com/coil-kt/coil/pull/1066))
- `DecodeUtils` 内の `isGif`、`isWebP`、`isAnimatedWebP`、`isHeif`、`isAnimatedHeif` を coil-gif に移動しました。`isSvg` を coil-svg に追加しました。 ([#1117](https://github.com/coil-kt/coil/pull/1117))
- `FetchResult` と `DecodeResult` を非データクラス（non-data classes）に変更しました。 ([#1114](https://github.com/coil-kt/coil/pull/1114))
- 未使用の `DiskCache.Builder` context 引数を削除しました。 ([#1099](https://github.com/coil-kt/coil/pull/1099))
- 元のサイズのビットマップリソースに対するスケーリングを修正しました。 ([#1072](https://github.com/coil-kt/coil/pull/1072))
- `ImageDecoderDecoder` で `ImageDecoder` のクローズに失敗する問題を修正しました。 ([#1109](https://github.com/coil-kt/coil/pull/1109))
- ドローアブルをビットマップに変換する際の不正確なスケーリングを修正しました。 ([#1084](https://github.com/coil-kt/coil/pull/1084))
- Update Compose to 1.1.0-rc03.
- Update `accompanist-drawablepainter` to 0.22.1-rc.
- Update `androidx.appcompat:appcompat-resources` to 1.4.1.

## [2.0.0-alpha06] - 2021年12月24日

- バッファリングや一時ファイルなしでアセット、リソース、およびコンテンツ URI からデコードできるよう、`ImageSource.Metadata` を追加しました。 ([#1060](https://github.com/coil-kt/coil/pull/1060))
- `AsyncImage` が正の制約（positive constraints）を持つまで、画像リクエストの実行を遅延させるようにしました。 ([#1028](https://github.com/coil-kt/coil/pull/1028))
- `loading`、`success`、`error` がすべて設定されている場合に、`AsyncImage` で `DefaultContent` を使用するよう修正しました。 ([#1026](https://github.com/coil-kt/coil/pull/1026))
- プラットフォームの `LruCache` ではなく、androidx の `LruCache` を使用するようにしました。 ([#1047](https://github.com/coil-kt/coil/pull/1047))
- Update Kotlin to 1.6.10.
- Update Coroutines to 1.6.0.
- Update Compose to 1.1.0-rc01.
- Update `accompanist-drawablepainter` to 0.22.0-rc.
- Update `androidx.collection` to 1.2.0.

## [2.0.0-alpha05] - 2021年11月28日

- **重要**: いずれかの次元で画像の元のサイズ（original size）を使用できるよう、`Size` をリファクタリングしました。
    - `Size` は、幅と高さの 2 つの `Dimension` 値で構成されるようになりました。`Dimension` は正のピクセル値または `Dimension.Original` のいずれかになります。
    - この変更は、一方の次元が固定ピクセル値である場合の、無制限の幅/高さの値（例：`wrap_content`、`Constraints.Infinity`）をより良くサポートするために行われました。
- 修正: `AsyncImage` のインスペクションモード（プレビュー）をサポートしました。
- 修正: `imageLoader.memoryCache` が null の場合、`SuccessResult.memoryCacheKey` が常に `null` になるようにしました。
- コンストラクタに似た `ImageLoader`、`SizeResolver`、および `ViewSizeResolver` の `invoke` 関数をトップレベル関数に変換しました。
- `CrossfadeDrawable` の開始および終了ドローアブルをパブリック API にしました。
- `ImageLoader` の placeholder/error/fallback ドローアブルをミューテート（mutate）するようにしました。
- `SuccessResult` のコンストラクタにデフォルト引数を追加しました。
- `androidx.collection-ktx` ではなく `androidx.collection` に依存するようにしました。
- Update OkHttp to 4.9.3.

## [2.0.0-alpha04] - 2021年11月22日

- **新機能**: `coil-compose` に `AsyncImage` を追加しました。
    - `AsyncImage` は `ImageRequest` を非同期で実行し、結果をレンダリングするコンポーザブルです。
    - **`AsyncImage` は、ほとんどのユースケースで `rememberImagePainter` を置き換えることを意図しています。**
    - その API は最終確定ではなく、2.0 の最終リリース前に変更される可能性があります。
    - `Image` と同様の API を持ち、`Alignment`、`ContentScale`、`alpha`、`ColorFilter`、`FilterQuality` といった同じ引数をサポートします。
    - `content`、`loading`、`success`、`error` 引数を使用して、各 `AsyncImagePainter` の状態ごとに描画される内容を上書きすることをサポートします。
    - `rememberImagePainter` が持っていた、画像のサイズやスケールの解決に関する設計上の問題を解決します。
    - 使用例:

```kotlin
// 画像のみを描画します。
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null, // `null` を避け、可能な限りローカライズされた文字列を設定してください。
)

// 円形クロップ、クロスフェードを適用し、`loading` 状態を上書きして画像を描画します。
AsyncImage(
    model = ImageRequest.Builder(LocalContext.current)
        .data("https://example.com/image.jpg")
        .crossfade(true)
        .build(),
    contentDescription = null,
    modifier = Modifier
        .clip(CircleShape),
    loading = {
        CircularProgressIndicator()
    },
    contentScale = ContentScale.Crop
)

// 円形クロップ、クロスフェードを適用し、すべての状態を上書きして画像を描画します。
AsyncImage(
    model = ImageRequest.Builder(LocalContext.current)
        .data("https://example.com/image.jpg")
        .crossfade(true)
        .build(),
    contentDescription = null,
    modifier = Modifier
        .clip(CircleShape),
    contentScale = ContentScale.Crop
) { state ->
    if (state is AsyncImagePainter.State.Loading) {
        CircularProgressIndicator()
    } else {
        AsyncImageContent() // 画像を描画します。
    }
}
```

- **重要**: `ImagePainter` を `AsyncImagePainter` に、`rememberImagePainter` を `rememberAsyncImagePainter` に改名しました。
    - `ExecuteCallback` はサポートされなくなりました。`AsyncImagePainter` が `onDraw` の呼び出しを待たずに実行されるようにするには、代わりに `ImageRequest.size(OriginalSize)` (または任意のサイズ) を設定してください。
    - `rememberAsyncImagePainter` にオプションの `FilterQuality` 引数を追加しました。
- `DiskCache` のクリーンアップ操作にコルーチンを使用し、`DiskCache.Builder.cleanupDispatcher` を追加しました。
- `ImageLoader.Builder.placeholder` を使用して設定されたプレビューの Compose プレビューを修正しました。
- より効率的なコードを生成するため、`LocalImageLoader.current` を `@ReadOnlyComposable` でマークしました。
- Update Compose to 1.1.0-beta03 and depend on `compose.foundation` instead of `compose.ui`.
- Update `androidx.appcompat-resources` to 1.4.0.

## [2.0.0-alpha03] - 2021年11月12日

- Android 29+ で音楽のサムネイルを読み込む機能を追加しました。 ([#967](https://github.com/coil-kt/coil/pull/967))
- 修正: 現在のパッケージのリソースを読み込むために `context.resources` を使用するようにしました。 ([#968](https://github.com/coil-kt/coil/pull/968))
- 修正: `clear` -> `dispose` の置換式を修正しました。 ([#970](https://github.com/coil-kt/coil/pull/970))
- Update Compose to 1.0.5.
- Update `accompanist-drawablepainter` to 0.20.2.
- Update Okio to 3.0.0.
- Update `androidx.annotation` to 1.3.0.
- Update `androidx.core` to 1.7.0.
- Update `androidx.lifecycle` to 2.4.0.
    - `lifecycle-common-java8` が `lifecycle-common` に統合されたため、その依存関係を削除しました。

## [2.0.0-alpha02] - 2021年10月24日

- [bill of materials (BOM)](https://docs.gradle.org/7.2/userguide/platforms.html#sub:bom_import) を含む新しい `coil-bom` アーティファクトを追加しました。
    - `coil-bom` をインポートすることで、バージョンを指定せずに他の Coil アーティファクトに依存できるようになります。
- `ExecuteCallback.Immediate` を使用した際の画像読み込み失敗を修正しました。
- Update Okio to 3.0.0-alpha.11.
    - これにより、Okio 3.0.0-alpha.11 との互換性の問題も解決されます。
- Update Kotlin to 1.5.31.
- Update Compose to 1.0.4.

## [2.0.0-alpha01] - 2021年10月11日

Coil 2.0.0 はライブラリの次のメジャーアップデートであり、新機能、パフォーマンス向上、API の改善、および様々なバグ修正が含まれています。このリリースは、2.0.0 の安定版リリースまで、将来のアルファリリースとバイナリ/ソースの互換性がない可能性があります。

- **重要**: サポートされる最小 API が 21 になりました。
- **重要**: `-Xjvm-default=all` を有効にしました。
    - これにより、Kotlin のデフォルトインターフェースメソッドサポートを使用する代わりに、Java 8 のデフォルトメソッドが生成されます。詳細は [こちらのブログ記事](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/) を確認してください。
    - **ビルドファイルにも `-Xjvm-default=all` または `-Xjvm-default=all-compatibility` を追加する必要があります。** 方法については [こちら](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8) を参照してください。
- **重要**: Coil は独自のディスクキャッシュ実装を持つようになり、ディスクキャッシュのために OkHttp に依存しなくなりました。
    - この変更は以下の理由によります:
        - 画像のデコード中にスレッドの中断をより良くサポートするため。これにより、画像リクエストが短時間で連続して開始・停止された際のパフォーマンスが向上します。
        - `File` をバックエンドに持つ `ImageSource` の公開をサポートするため。これにより、デコードに `File` が必要な Android API（例：`MediaMetadataRetriever`）を使用する際の不必要なコピーを回避できます。
        - ディスクキャッシュファイルへの直接の読み書きをサポートするため。
    - ディスクキャッシュを設定するには `ImageLoader.Builder.diskCache` と `DiskCache.Builder` を使用します。
    - Coil 2.0 では OkHttp の `Cache` を使用**すべきではありません**。書き込み中に中断されると破損する可能性があるためです。
    - `Cache-Control` やその他のキャッシュヘッダーは引き続きサポートされます（キャッシュは URL の一致のみをチェックするため `Vary` ヘッダーは除きます）。また、レスポンスコードが [200..300) の範囲内のレスポンスのみがキャッシュされます。
    - キャッシュヘッダーのサポートは `ImageLoader.Builder.respectCacheHeaders` を使用して有効化・無効化できます。
    - 既存のディスクキャッシュは 2.0 へのアップグレード時にクリアされ、再構築されます。
- **重要**: `ImageRequest` のデフォルトの `Scale` は `Scale.FIT` になりました。
    - これは、デフォルトの `Scale` を持つ他のクラスと `ImageRequest.scale` の一貫性を持たせるために変更されました。
    - `ImageViewTarget` を持つリクエストのスケールは引き続き自動検出されます。
- 画像パイプラインクラスの重要な変更:
    - `Mapper`、`Fetcher`、および `Decoder` は、より柔軟になるようリファクタリングされました。
    - `Fetcher.key` は新しい `Keyer` インターフェースに置き換えられました。`Keyer` は入力データからキャッシュキーを作成します。
    - `Decoder` が直接 `File` をデコードできるようにする `ImageSource` を追加しました。
- `BitmapPool` と `PoolableViewTarget` はライブラリから削除されました。ビットマッププーリング（bitmap pooling）が削除された理由は以下の通りです:
    - API 23 以下で最も効果的でしたが、新しい Android リリースでは効果が低くなっていました。
    - ビットマッププーリングを削除することで、Coil はパフォーマンス上の利点がある不変（immutable）のビットマップを使用できるようになります。
    - ビットマッププールを管理するための実行時のオーバーヘッドがあります。
    - ビットマッププーリングは、ビットマップがプーリングに適しているかどうかを追跡する必要があるため、Coil の API に設計上の制約を生んでいました。ビットマッププーリングを削除することで、Coil はより多くの場所（例：`Listener`、`Disposable`）で結果の `Drawable` を公開できるようになります。さらに、Coil が `ImageView` をクリアする必要がなくなるため、[問題](https://github.com/coil-kt/coil/issues/650) の発生を防ぐことができます。
    - ビットマッププーリングは [エラーが発生しやすい](https://github.com/coil-kt/coil/issues/546) です。使用中の可能性があるビットマップを再利用しようとするよりも、新しいビットマップを割り当てる方がはるかに安全です。
- `MemoryCache` は、より柔軟になるようリファクタリングされました。
- 実行時の非 null アサーションの生成を無効にしました。
    - Java を使用している場合、非 null アノテーションが付与されたパラメータに null を渡しても、即座に `NullPointerException` がスローされなくなりました。Kotlin を使用している場合、実質的に変更はありません。
    - この変更により、ライブラリのサイズを小さくすることができます。
- `VideoFrameFileFetcher` と `VideoFrameUriFetcher` はライブラリから削除されました。すべてのデータソースをサポートする `VideoFrameDecoder` を代わりに使用してください。
- 進行中の `BitmapFactory` オペレーションの最大数を制限する `bitmapFactoryMaxParallelism` のサポートを追加しました。この値はデフォルトで 4 で、UI パフォーマンスを向上させます。
- `interceptorDispatcher`、`fetcherDispatcher`、`decoderDispatcher`、および `transformationDispatcher` のサポートを追加しました。
- `Disposable` をリファクタリングし、基盤となる `ImageRequest` のジョブを公開するようにしました。
- `Transition.transition` を suspend しない関数に変更しました。完了するまでトランジションを suspend する必要がなくなったためです。
- 共通の `ViewTarget` ロジックを処理する `GenericViewTarget` を追加しました。
- [`BlurTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/BlurTransformation.kt) および [`GrayscaleTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/GrayscaleTransformation.kt) はライブラリから削除されました。
    - 使用している場合は、コードをプロジェクトにコピーしてください。
- `ImageRequest.error` は、`ImageRequest.fallback` が null の場合、`Target` に設定されるようになりました。
- `Transformation.key` は `Transformation.cacheKey` に置き換えられました。
- `ImageRequest.Listener` は `onSuccess` と `onError` でそれぞれ `SuccessResult`/`ErrorResult` を返すようになりました。
- デフォルトでサポートされるデータ型に `ByteBuffer` を追加しました。
- 複数のクラスから `toString` 実装を削除しました。
- Update OkHttp to 4.9.2.
- Update Okio to 3.0.0-alpha.10.

## [1.4.0] - 2021年10月6日

- **新機能**: `ImagePainter.State.Success` と `ImagePainter.State.Error` に `ImageResult` を追加しました。 ([#887](https://github.com/coil-kt/coil/pull/887))
    - これは `ImagePainter.State.Success` と `ImagePainter.State.Error` のシグネチャに対するバイナリ互換性のない変更ですが、これらの API は実験的（experimental）としてマークされています。
- `View.isShown` が `true` の場合にのみ `CrossfadeTransition` を実行するようにしました。以前は `View.isVisible` のみをチェックしていました。 ([#898](https://github.com/coil-kt/coil/pull/898))
- 丸め処理の問題によりスケーリング倍率が 1 をわずかに下回った場合に、メモリキャッシュがヒットしない可能性がある問題を修正しました。 ([#899](https://github.com/coil-kt/coil/pull/899))
- インライン化されていない `ComponentRegistry` メソッドをパブリックにしました。 ([#925](https://github.com/coil-kt/coil/pull/925))
- `accompanist-drawablepainter` に依存するようにし、Coil のカスタム `DrawablePainter` 実装を削除しました。 ([#845](https://github.com/coil-kt/coil/pull/845))
- デザガリング（desugaring）の問題を回避するため、Java 8 のメソッドの使用を削除しました。 ([#924](https://github.com/coil-kt/coil/pull/924))
- `ImagePainter.ExecuteCallback` を安定した API に昇格させました。 ([#927](https://github.com/coil-kt/coil/pull/927))
- compileSdk を 31 に更新しました。
- Update Kotlin to 1.5.30.
- Update Coroutines to 1.5.2.
- Update Compose to 1.0.3.

## [1.3.2] - 2021年8月4日

- `coil-compose` が `compose.foundation` ではなく `compose.ui` に依存するようになりました。
    - `compose.ui` は `compose.foundation` のサブセットであるため、より小さな依存関係となります。
- Update Jetpack Compose to 1.0.1.
- Update Kotlin to 1.5.21.
- Update Coroutines to 1.5.1.
- Update `androidx.exifinterface:exifinterface` to 1.3.3.

## [1.3.1] - 2021年7月28日

- Jetpack Compose を `1.0.0` に更新しました。[安定版リリース](https://android-developers.googleblog.com/2021/07/jetpack-compose-announcement.html) おめでとうございます！
- Update `androidx.appcompat:appcompat-resources` to 1.3.1.

## [1.3.0] - 2021年7月10日

- **新機能**: [Jetpack Compose](https://developer.android.com/jetpack/compose) のサポートを追加しました。[Accompanist](https://github.com/google/accompanist/) の Coil 統合をベースにしていますが、いくつかの変更が加えられています。詳細は [ドキュメント](https://coil-kt.github.io/coil/compose/) を確認してください。
- `Transformation` における自動ビットマップ変換を有効・無効にする `allowConversionToBitmap` を追加しました。 ([#775](https://github.com/coil-kt/coil/pull/775))
- GIF のフレーム遅延がしきい値を下回る場合に書き換えを可能にする `enforceMinimumFrameDelay` を `ImageDecoderDecoder` と `GifDecoder` に追加しました。 ([#783](https://github.com/coil-kt/coil/pull/783))
    - これはデフォルトでは無効ですが、将来のリリースでデフォルトで有効になる予定です。
- `ImageLoader` の内部ネットワークオブザーバーを有効化・無効化する機能を追加しました。 ([#741](https://github.com/coil-kt/coil/pull/741))
- `BitmapFactoryDecoder` でデコードされたビットマップの密度（density）を修正しました。 ([#776](https://github.com/coil-kt/coil/pull/776))
- Licensee が Coil のライセンス URL を見つけられない問題を修正しました。 ([#774](https://github.com/coil-kt/coil/pull/774))
- Update `androidx.core:core-ktx` to 1.6.0.

## [1.2.2] - 2021年6月4日

- 共有された状態を持つドローアブルをビットマップに変換する際の競合状態を修正しました。 ([#771](https://github.com/coil-kt/coil/pull/771))
- `ImageLoader.Builder.fallback` が `fallback` ドローアブルではなく `error` ドローアブルを設定してしまう問題を修正しました。
- `ResourceUriFetcher` によって返される不正確なデータソースを修正しました。 ([#770](https://github.com/coil-kt/coil/pull/770))
- API 26 および 27 において利用可能なファイル記述子がない場合のログチェックを修正しました。
- プラットフォームのベクタードローアブルサポートに関する不正確なバージョンチェックを修正しました。 ([#751](https://github.com/coil-kt/coil/pull/751))
- Update Kotlin (1.5.10).
- Update Coroutines (1.5.0).
- Update `androidx.appcompat:appcompat-resources` to 1.3.0.
- Update `androidx.core:core-ktx` to 1.5.0.

## [1.2.1] - 2021年4月27日

- 修正: `VideoFrameUriFetcher` が http/https URI を処理しようとする問題を修正しました。 ([#734](https://github.com/coil-kt/coil/pull/734)

## [1.2.0] - 2021年4月12日

- **重要**: `SvgDecoder` において、SVG のアスペクト比を計算するために SVG の view bounds を使用するようにしました。 ([#688](https://github.com/coil-kt/coil/pull/688))
    - 以前は、`SvgDecoder` は SVG の `width`/`height` 要素を使用してアスペクト比を決定していましたが、これは SVG 仕様に正しく従っていませんでした。
    - 以前の動作に戻すには、`SvgDecoder` を構築する際に `useViewBoundsAsIntrinsicSize = false` を設定してください。
- **新機能**: 任意のソースから動画フレームをデコードできるよう `VideoFrameDecoder` を追加しました。 ([#689](https://github.com/coil-kt/coil/pull/689))
- **新機能**: MIME タイプだけでなく、ソースの内容を使用した SVG の自動検出をサポートしました。 ([#654](https://github.com/coil-kt/coil/pull/654))
- **新機能**: `ImageLoader.newBuilder()` を使用したリソースの共有をサポートしました。 ([#653](https://github.com/coil-kt/coil/pull/653))
    - 重要な点として、これにより `ImageLoader` インスタンス間でのメモリキャッシュの共有が可能になります。
- **新機能**: `AnimatedTransformation` を使用したアニメーション画像の変換のサポートを追加しました。 ([#659](https://github.com/coil-kt/coil/pull/659))
- **新機能**: アニメーションドローアブルの開始/終了コールバックのサポートを追加しました。 ([#676](https://github.com/coil-kt/coil/pull/676))

---

- HEIF/HEIC ファイルの EXIF データのパースを修正しました。 ([#664](https://github.com/coil-kt/coil/pull/664))
- ビットマッププーリングが無効な場合に `EmptyBitmapPool` 実装を使用しない問題を修正しました。 ([#638](https://github.com/coil-kt/coil/pull/638))
    - この修正がなくてもビットマッププーリングは適切に無効化されていましたが、より重い `BitmapPool` 実装が使用されていました。
- `MovieDrawable.getOpacity` が誤って透明を返すケースを修正しました。 ([#682](https://github.com/coil-kt/coil/pull/682))
- デフォルトの一時ディレクトリが存在しない場合へのガードを追加しました。 ([#683](https://github.com/coil-kt/coil/pull/683))

---

- JVM IR バックエンドを使用してビルドするようにしました。 ([#670](https://github.com/coil-kt/coil/pull/670))
- Update Kotlin (1.4.32).
- Update Coroutines (1.4.3).
- Update OkHttp (3.12.13).
- Update `androidx.lifecycle:lifecycle-common-java8` to 2.3.1.

## [1.1.1] - 2021年1月11日

- 修正: コルーチンを複数回再開（resume）することによる `IllegalStateException` を `ViewSizeResolver.size` がスローする可能性がある問題を修正しました。
- 修正: メインスレッドから呼び出された場合に `HttpFetcher` が永久にブロックされる問題を修正しました。
    - `ImageRequest.dispatcher(Dispatchers.Main.immediate)` を使用してメインスレッドで強制的に実行されるリクエストは、`ImageRequest.networkCachePolicy` が `CachePolicy.DISABLED` または `CachePolicy.WRITE_ONLY` に設定されていない限り、`NetworkOnMainThreadException` で失敗します。
- 動画に回転メタデータがある場合、`VideoFrameFetcher` からの動画フレームを回転させるようにしました。
- Update Kotlin (1.4.21).
- Update Coroutines (1.4.2).
- Update Okio (2.10.0).
- Update `androidx.exifinterface:exifinterface` (1.3.2).

## [1.1.0] - 2020年11月24日

- **重要**: `CENTER` および `MATRIX` の `ImageView` スケールタイプを `OriginalSize` に解決されるよう変更しました。 ([#587](https://github.com/coil-kt/coil/pull/587))
    - この変更は、リクエストのサイズが明示的に指定されていない場合の暗黙的なサイズ解決アルゴリズムにのみ影響します。
    - この変更は、画像リクエストの視覚的な結果が `ImageView.setImageResource`/`ImageView.setImageURI` と一致することを保証するために行われました。以前の動作に戻すには、リクエスト構築時に `ViewSizeResolver` を設定してください。
- **重要**: ビューのレイアウトパラメータが `WRAP_CONTENT` の場合、`ViewSizeResolver` からディスプレイサイズを返すようにしました。 ([#562](https://github.com/coil-kt/coil/pull/562))
    - 以前は、ビューが完全にレイアウトされている場合にのみディスプレイサイズを返していました。この変更により、典型的な動作がより一貫し、直感的になります。
- アルファ事前乗算（alpha pre-multiplication）を制御する機能を追加しました。 ([#569](https://github.com/coil-kt/coil/pull/569))
- `CrossfadeDrawable` において、正確な固有サイズ（intrinsic size）を優先するサポートを追加しました。 ([#585](https://github.com/coil-kt/coil/pull/585))
- バージョンを含む完全な GIF ヘッダーをチェックするようにしました。 ([#564](https://github.com/coil-kt/coil/pull/564))
- 空のビットマッププール実装を追加しました。 ([#561](https://github.com/coil-kt/coil/pull/561))
- `EventListener.Factory` を関数型インターフェースにしました。 ([#575](https://github.com/coil-kt/coil/pull/575))
- `EventListener` を安定化しました。 ([#574](https://github.com/coil-kt/coil/pull/574))
- `ImageRequest.Builder.placeholderMemoryCacheKey` の `String` オーバーロードを追加しました。
- `ViewSizeResolver` コンストラクタに `@JvmOverloads` を追加しました。
- 修正: `CrossfadeDrawable` の開始/終了ドローアブルをミューテートするようにしました。 ([#572](https://github.com/coil-kt/coil/pull/572))
- 修正: 2回目の読み込み時に GIF が再生されない問題を修正しました。 ([#577](https://github.com/coil-kt/coil/pull/534))
- Kotlin (1.4.20) に更新し、`kotlin-parcelize` プラグインに移行しました。
- Update Coroutines (1.4.1).

## [1.0.0] - 2020年10月22日

`0.13.0` からの変更点:
- `Context.imageLoader` 拡張関数を追加しました。 ([#534](https://github.com/coil-kt/coil/pull/534))
- `ImageLoader.executeBlocking` 拡張関数を追加しました。 ([#537](https://github.com/coil-kt/coil/pull/537))
- シングルトンのイメージローダーを置換した際、以前のイメージローダーをシャットダウンしないようにしました。 ([#533](https://github.com/coil-kt/coil/pull/533))

`1.0.0-rc3` からの変更点:
- 修正: ActivityManager が欠落している、または無効である場合へのガードを追加しました。 ([#541](https://github.com/coil-kt/coil/pull/541))
- 修正: OkHttp が失敗したレスポンスをキャッシュできるようにしました。 ([#551](https://github.com/coil-kt/coil/pull/551))
- Update Kotlin to 1.4.10.
- Update Okio to 2.9.0.
- Update `androidx.exifinterface:exifinterface` to 1.3.1.

## [1.0.0-rc3] - 2020年9月21日

- 不安定さのため、[`-Xjvm-default=all`](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/) コンパイラフラグの使用を元に戻しました。
    - **これは以前のリリース候補版（release candidate）からのソース互換性はありますが、バイナリ互換性のない変更です。**
- `Context.imageLoader` 拡張関数を追加しました。 ([#534](https://github.com/coil-kt/coil/pull/534))
- `ImageLoader.executeBlocking` 拡張関数を追加しました。 ([#537](https://github.com/coil-kt/coil/pull/537))
- シングルトンのイメージローダーを置換した際、以前のイメージローダーをシャットダウンしないようにしました。 ([#533](https://github.com/coil-kt/coil/pull/533))
- AndroidX の依存関係を更新しました:
    - `androidx.exifinterface:exifinterface` -> 1.3.0

## [1.0.0-rc2] - 2020年9月3日

- **このリリースには Kotlin 1.4.0 以上が必要です。**
- [0.13.0](#0130---2020年9月3日) に含まれるすべての変更点。
- `stdlib-jdk8` ではなくベースの Kotlin `stdlib` に依存するようにしました。

## [0.13.0] - 2020年9月3日

- **重要**: デフォルトで Interceptor チェーンをメインスレッドで開始するようにしました。 ([#513](https://github.com/coil-kt/coil/pull/513))
    - これにより、メモリキャッシュがメインスレッドで同期的にチェックされていた `0.11.0` 以前の動作が概ね復元されます。
    - `0.12.0` のように `ImageRequest.dispatcher` 上でメモリキャッシュをチェックする動作に戻すには、`ImageLoader.Builder.launchInterceptorChainOnMainThread(false)` を設定してください。
    - 詳細は [`launchInterceptorChainOnMainThread`](https://coil-kt.github.io/coil/api/coil-core/coil3/-image-loader/-builder/launch-interceptor-chain-on-main-thread/) を参照してください。

---

- 修正: デタッチされた Fragment 内の `ViewTarget` でリクエストが開始された場合の潜在的なメモリリークを修正しました。 ([#518](https://github.com/coil-kt/coil/pull/518))
- 修正: リソース URI を読み込むために `ImageRequest.context` を使用するようにしました。 ([#517](https://github.com/coil-kt/coil/pull/517))
- 修正: 後続のリクエストがディスクキャッシュに保存されない原因となる競合状態を修正しました。 ([#510](https://github.com/coil-kt/coil/pull/510))
- 修正: API 18 で `blockCountLong` および `blockSizeLong` を使用するように修正しました。

---

- `ImageLoaderFactory` を fun インターフェースにしました。
- `File` から読み込まれた画像のメモリキャッシュキーに、最終更新日時を追加するかどうかを設定できる `ImageLoader.Builder.addLastModifiedToFileCacheKey` を追加しました。

---

- Update Kotlin to 1.4.0.
- Update Coroutines to 1.3.9.
- Update Okio to 2.8.0.

## [1.0.0-rc1] - 2020年8月18日

- **このリリースには Kotlin 1.4.0 以上が必要です。**
- Kotlin を 1.4.0 に更新し、[`-Xjvm-default=all`](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/) を有効にしました。
    - **ビルドファイルで `-Xjvm-default=all` を有効にする方法については [こちら](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8) を参照してください。**
    - これにより、Kotlin のデフォルトインターフェースメソッドに対して Java 8 のデフォルトメソッドが生成されます。
- 0.12.0 で存在したすべての非推奨メソッドを削除しました。
- Update Coroutines to 1.3.9.

## [0.12.0] - 2020年8月18日

- **破壊的変更**: `LoadRequest` および `GetRequest` は `ImageRequest` に置き換えられました:
    - `ImageLoader.execute(LoadRequest)` -> `ImageLoader.enqueue(ImageRequest)`
    - `ImageLoader.execute(GetRequest)` -> `ImageLoader.execute(ImageRequest)`
    - `ImageRequest` は `equals`/`hashCode` を実装しています。
- **破壊的変更**: 多くのクラスが改名、またはパッケージ変更されました:
    - `coil.request.RequestResult` -> `coil.request.ImageResult`
    - `coil.request.RequestDisposable` -> `coil.request.Disposable`
    - `coil.bitmappool.BitmapPool` -> `coil.bitmap.BitmapPool`
    - `coil.DefaultRequestOptions` -> `coil.request.DefaultRequestOptions`
- **破壊的変更**: [`SparseIntArraySet`](https://github.com/coil-kt/coil/blob/f52addd039f0195b66f93cb0f1cad59b0832f784/coil-core/src/main/java/coil/collection/SparseIntArraySet.kt) がパブリック API から削除されました。
- **破壊的変更**: `TransitionTarget` が `ViewTarget` を実装しなくなりました。
- **破壊的変更**: `ImageRequest.Listener.onSuccess` のシグネチャが、`DataSource` だけでなく `ImageResult.Metadata` を返すように変更されました。
- **破壊的変更**: `LoadRequest.aliasKeys` のサポートを削除しました。この API はメモリキャッシュへの直接の読み書きアクセスでより良く処理できます。

---

- **重要**: メモリキャッシュ内の値は（メインスレッドから呼び出された場合でも）同期的に解決されなくなりました。
    - この変更は、バックグラウンドディスパッチャで `Interceptor` を実行することをサポートするためにも必要でした。
    - この変更により、より多くの処理がメインスレッド外に移動し、パフォーマンスが向上します。
- **重要**: `Mappers` がバックグラウンドディスパッチャで実行されるようになりました。副次的な効果として、自動的なビットマップサンプリングは**自動的には**サポートされなくなりました。同じ効果を得るには、前のリクエストの `MemoryCache.Key` を後続のリクエストの `placeholderMemoryCacheKey` として使用してください。[例はこちら](https://coil-kt.github.io/coil/recipes/#using-a-memory-cache-key-as-a-placeholder) を参照してください。
    - `placeholderMemoryCacheKey` API は、異なるデータを持つ2つの画像リクエスト（例：小サイズと大サイズの画像の異なる URL）を「リンク」できるため、より自由度が高くなります。
- **重要**: Coil の `ImageView` 拡張関数が `coil.api` パッケージから `coil` パッケージに移動しました。
    - 検索置換を使用して、`import coil.api.load` -> `import coil.load` にリファクタリングしてください。残念ながら、Kotlin の `ReplaceWith` 機能を使用してインポートを置換することはできません。
- **重要**: ドローアブルが同じ画像でない場合は、標準のクロスフェードを使用するようにしました。
- **重要**: API 24+ では不変（immutable）のビットマップを優先するようにしました。
- **重要**: `MeasuredMapper` は新しい `Interceptor` インターフェースのために非推奨となりました。`MeasuredMapper` を `Interceptor` に変換する方法の例については [こちら](https://gist.github.com/colinrtwhite/90267704091467451e46b21b95154299) を参照してください。
    - `Interceptor` は、より幅広いカスタムロジックを可能にする、制限の少ない API です。
- **重要**: `ImageRequest.data` は null 不可になりました。データを設定せずに `ImageRequest` を作成した場合、データとして `NullRequestData` が返されます。

---

- **新機能**: `ImageLoader` の `MemoryCache` への直接の読み書きアクセスのサポートを追加しました。詳細は [ドキュメント](https://coil-kt.github.io/coil/getting_started/#memory-cache) を参照してください。
- **新機能**: `Interceptor` のサポートを追加しました。詳細は [ドキュメント](https://coil-kt.github.io/coil/image_pipeline/#interceptors) を参照してください。Coil の `Interceptor` 設計は [OkHttp](https://github.com/square/okhttp) に強くインスパイアされています。
- **新機能**: `ImageLoader.Builder.bitmapPoolingEnabled` を使用してビットマッププーリングを有効・無効にする機能を追加しました。
    - ビットマッププーリングは API 23 以下で最も効果的ですが、API 24 以上でも（積極的に `Bitmap.recycle` を呼び出すことで）有益な場合があります。
- **新機能**: デコード中のスレッド中断をサポートしました。

---

- content-type ヘッダー内の複数セグメントのパースを修正しました。
- より堅牢になるよう、ビットマップの参照カウントを再構築しました。
- API < 19 のデバイスでの WebP デコードを修正しました。
- EventListener API で FetchResult と DecodeResult を公開しました。

---

- SDK 30 でコンパイルするようにしました。
- Update Coroutines to 1.3.8.
- Update OkHttp to 3.12.12.
- Update Okio to 2.7.0.
- AndroidX の依存関係を更新しました:
    - `androidx.appcompat:appcompat` -> 1.2.0
    - `androidx.core:core-ktx` -> 1.3.1

## [0.11.0] - 2020年5月14日

- **破壊的変更**: **このバージョンでは、既存の非推奨関数をすべて削除しました。**
    - これにより、アプリの起動時にコードを実行しないよう、Coil の `ContentProvider` を削除できるようになります。
- **破壊的変更**: `SparseIntArraySet.size` を val に変更しました。 ([#380](https://github.com/coil-kt/coil/pull/380))
- **破壊的変更**: `Parameters.count()` を拡張関数に移動しました。 ([#403](https://github.com/coil-kt/coil/pull/403))
- **破壊的変更**: `BitmapPool.maxSize` を Int にしました。 ([#404](https://github.com/coil-kt/coil/pull/404))

---

- **重要**: `ImageLoader.shutdown()` をオプションにしました（`OkHttpClient` と同様）。 ([#385](https://github.com/coil-kt/coil/pull/385))

---

- 修正: AGP 4.1 との互換性を修正しました。 ([#386](https://github.com/coil-kt/coil/pull/386))
- 修正: GONE ビューの計測を修正しました。 ([#397](https://github.com/coil-kt/coil/pull/397))

---

- デフォルトのメモリキャッシュサイズを 20% に削減しました。 ([#390](https://github.com/coil-kt/coil/pull/390))
    - 以前の動作を復元するには、`ImageLoader` 作成時に `ImageLoaderBuilder.availableMemoryPercentage(0.25)` を設定してください。
- Update Coroutines to 1.3.6.
- Update OkHttp to 3.12.11.

## [0.10.1] - 2020年4月26日

- 修正: API 23 以下で大きな PNG をデコードする際の OOM（メモリ不足）を修正しました。 ([#372](https://github.com/coil-kt/coil/pull/372))。
    - これにより、PNG ファイルに対する EXIF 回転（orientation）のデコードが無効になります。PNG の EXIF 回転は非常に稀にしか使用されず、PNG EXIF データを読み取るには（たとえ空であっても）ファイル全体をメモリにバッファリングする必要があり、パフォーマンスに悪影響を与えます。
- `SparseIntArraySet` に対する些細な Java 互換性の改善。

---

- Update Okio to 2.6.0.

## [0.10.0] - 2020年4月20日

### ハイライト

- **このバージョンでは、ビルダーを直接使用するスタイルを優先し、ほとんどの DSL API を非推奨にしました。** 変更内容は以下の通りです:

    ```kotlin
    // 0.9.5 (旧)
    val imageLoader = ImageLoader(context) {
        bitmapPoolPercentage(0.5)
        crossfade(true)
    }

    val disposable = imageLoader.load(context, "https://example.com/image.jpg") {
        target(imageView)
    }

    val drawable = imageLoader.get("https://example.com/image.jpg") {
        size(512, 512)
    }

    // 0.10.0 (新)
    val imageLoader = ImageLoader.Builder(context)
        .bitmapPoolPercentage(0.5)
        .crossfade(true)
        .build()

    val request = LoadRequest.Builder(context)
        .data("https://example.com/image.jpg")
        .target(imageView)
        .build()
    val disposable = imageLoader.execute(request)

    val request = GetRequest.Builder(context)
        .data("https://example.com/image.jpg")
        .size(512, 512)
        .build()
    val drawable = imageLoader.execute(request).drawable
    ```

    - `io.coil-kt:coil` アーティファクトを使用している場合は、`Coil.execute(request)` を呼び出してシングルトンの `ImageLoader` でリクエストを実行できます。

- **`ImageLoader` が弱参照（weak reference）メモリキャッシュを持つようになりました。** これは、画像が強参照（strong reference）メモリキャッシュから追い出された後、それらへの弱参照を追跡します。
    - つまり、画像への強参照がまだどこかに存在する場合、画像は常に `ImageLoader` のメモリキャッシュから返されます。
    - 一般的に、これによりメモリキャッシュはより予測可能になり、ヒット率が向上します。
    - この動作は `ImageLoaderBuilder.trackWeakReferences` で有効化・無効化できます。

- 動画ファイルから特定のフレームをデコードするための新しいアーティファクト、**`io.coil-kt:coil-video`** を追加しました。[詳細はこちら](https://coil-kt.github.io/coil/videos/)。

- メトリクスを追跡するための新しい [EventListener](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/EventListener.kt) API を追加しました。

- シングルトンの初期化を簡素化するために、`Application` で実装できる [ImageLoaderFactory](https://github.com/coil-kt/coil/blob/main/coil/src/main/java/coil/ImageLoaderFactory.kt) を追加しました。

---

### フルリリースノート

- **重要**: DSL 構文を非推奨にし、ビルダー構文を優先するようにしました。 ([#267](https://github.com/coil-kt/coil/pull/267))
- **重要**: `Coil` および `ImageLoader` の拡張関数を非推奨にしました。 ([#322](https://github.com/coil-kt/coil/pull/322))
- **破壊的変更**: `ImageLoader.execute(GetRequest)` からシールされた `RequestResult` 型を返すようにしました。 ([#349](https://github.com/coil-kt/coil/pull/349))
- **破壊的変更**: `ExperimentalCoil` を `ExperimentalCoilApi` に改名しました。`@Experimental` から `@RequiresOptIn` に移行しました。 ([#306](https://github.com/coil-kt/coil/pull/306))
- **破壊的変更**: `CoilLogger` を `Logger` インターフェースに置き換えました。 ([#316](https://github.com/coil-kt/coil/pull/316))
- **破壊的変更**: destWidth/destHeight を dstWidth/dstHeight に改名しました。 ([#275](https://github.com/coil-kt/coil/pull/275))
- **破壊的変更**: `MovieDrawable` のコンストラクタパラメータを再配置しました。 ([#272](https://github.com/coil-kt/coil/pull/272))
- **破壊的変更**: `Request.Listener` のメソッドが、データではなく完全な `Request` オブジェクトを受け取るようになりました。
- **破壊的変更**: `GetRequestBuilder` コンストラクタで `Context` が必須になりました。
- **破壊的変更**: `Request` のいくつかのプロパティが nullable になりました。
- **動作変更**: デフォルトでキャッシュキーにパラメータ値を含めるようにしました。 ([#319](https://github.com/coil-kt/coil/pull/319))
- **動作変更**: `Request.Listener.onStart()` のタイミングを `Target.onStart()` の直後に呼び出されるよう微調整しました。 ([#348](https://github.com/coil-kt/coil/pull/348))

---

- **新機能**: `WeakMemoryCache` 実装を追加しました。 ([#295](https://github.com/coil-kt/coil/pull/295))
- **新機能**: 動画フレームのデコードをサポートする `coil-video` を追加しました。 ([#122](https://github.com/coil-kt/coil/pull/122))
- **新機能**: [`EventListener`](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/EventListener.kt) を導入しました。 ([#314](https://github.com/coil-kt/coil/pull/314))
- **新機能**: [`ImageLoaderFactory`](https://github.com/coil-kt/coil/blob/main/coil/src/main/java/coil/ImageLoaderFactory.kt) を導入しました。 ([#311](https://github.com/coil-kt/coil/pull/311))
- **新機能**: Android 11 でアニメーション HEIF 画像シーケンスをサポートしました。 ([#297](https://github.com/coil-kt/coil/pull/297))
- **新機能**: Java 互換性を向上させました。 ([#262](https://github.com/coil-kt/coil/pull/262))
- **新機能**: デフォルトの `CachePolicy` 設定をサポートしました。 ([#307](https://github.com/coil-kt/coil/pull/307))
- **新機能**: デフォルトの `Bitmap.Config` 設定をサポートしました。 ([#342](https://github.com/coil-kt/coil/pull/342))
- **新機能**: 単一のメモリキャッシュアイテムをクリアするための `ImageLoader.invalidate(key)` を追加しました。 ([#55](https://github.com/coil-kt/coil/pull/55))
- **新機能**: キャッシュされた画像が再利用されない理由を説明するデバッグログを追加しました。 ([#346](https://github.com/coil-kt/coil/pull/346))
- **新機能**: get リクエストに対して `error` および `fallback` ドローアブルをサポートしました。

---

- 修正: Transformation が入力ビットマップのサイズを縮小した際に、メモリキャッシュがヒットしない問題を修正しました。 ([#357](https://github.com/coil-kt/coil/pull/357))
- 修正: BlurTransformation において、半径が RenderScript の最大値以下であることを保証するようにしました。 ([#291](https://github.com/coil-kt/coil/pull/291))
- 修正: 高色深度（high colour depth）画像のデコードを修正しました。 ([#358](https://github.com/coil-kt/coil/pull/358))
- 修正: Android 11 以上で `ImageDecoderDecoder` のクラッシュ回避策を無効化しました。 ([#298](https://github.com/coil-kt/coil/pull/298))
- 修正: pre-API 23 での EXIF データ読み込み失敗を修正しました。 ([#331](https://github.com/coil-kt/coil/pull/331))
- 修正: Android R SDK との不整合を修正しました。 ([#337](https://github.com/coil-kt/coil/pull/337))
- 修正: `ImageView` が一致する `SizeResolver` を持っている場合にのみ、不正確なサイズ（inexact size）を有効にするように修正しました。 ([#344](https://github.com/coil-kt/coil/pull/344))
- 修正: キャッシュされた画像が、要求されたサイズから最大1ピクセルずれることを許容するようにしました。 ([#360](https://github.com/coil-kt/coil/pull/360))
- 修正: ビューが可視でない場合にクロスフェードトランジションをスキップするようにしました。 ([#361](https://github.com/coil-kt/coil/pull/361))

---

- `CoilContentProvider` を非推奨にしました。 ([#293](https://github.com/coil-kt/coil/pull/293))
- いくつかの `ImageLoader` メソッドに `@MainThread` アノテーションを付与しました。
- ライフサイクルが現在開始されている場合、`LifecycleCoroutineDispatcher` を作成しないようにしました。 ([#356](https://github.com/coil-kt/coil/pull/356))
- `OriginalSize.toString()` に完全なパッケージ名を使用するようにしました。
- ソフトウェアビットマップをデコードする際に事前割り当て（preallocate）を行うようにしました。 ([#354](https://github.com/coil-kt/coil/pull/354))

---

- Update Kotlin to 1.3.72.
- Update Coroutines to 1.3.5.
- Update OkHttp to 3.12.10.
- Update Okio to 2.5.0.
- AndroidX の依存関係を更新しました:
    - `androidx.exifinterface:exifinterface` -> 1.2.0

## [0.9.5] - 2020年2月6日

- 修正: ハードウェアアクセラレーションが有効かチェックする前に、ビューがアタッチされていることを保証するようにしました。これにより、ハードウェアビットマップのリクエストがメモリキャッシュをミスするケースが修正されます。

---

- AndroidX の依存関係を更新しました:
    - `androidx.core:core-ktx` -> 1.2.0

## [0.9.4] - 2020年2月3日

- 修正: ImageDecoderDecoder において、ダウンサンプリング時にアスペクト比を尊重するようにしました。@zhanghai に感謝。

---

- 以前は、キャッシュされた設定（config）がリクエストで指定された設定以上であれば、メモリキャッシュからビットマップが返されていました。例えば、`ARGB_8888` ビットマップをリクエストした場合、メモリキャッシュから `RGBA_F16` ビットマップが返される可能性がありました。今後は、キャッシュされた設定と要求された設定が等しくなければなりません。
- `CrossfadeDrawable` および `CrossfadeTransition` の `scale` と `durationMillis` をパブリックにしました。

## [0.9.3] - 2020年2月1日

- 修正: 子ドローアブルが中央に配置されるよう、`ScaleDrawable` 内部で子ドローアブルを平行移動するようにしました。
- 修正: GIF や SVG が境界を完全に埋めないケースを修正しました。

---

- `HttpUrl.get()` の呼び出しをバックグラウンドスレッドに遅延させるようにしました。
- BitmapFactory のビットマップ null エラーメッセージを改善しました。
- ハードウェアビットマップのブラックリストに 3 つのデバイスを追加しました。 ([#264](https://github.com/coil-kt/coil/pull/264))

---

- AndroidX の依存関係を更新しました:
    - `androidx.lifecycle:lifecycle-common-java8` -> 2.2.0

## [0.9.2] - 2020年1月19日

- 修正: pre-API 19 デバイスでの GIF デコードを修正しました。@mario に感謝。
- 修正: ラスタライズされたベクタードローアブルがサンプリング済み（sampled）としてマークされない問題を修正しました。
- 修正: Movie の寸法が <= 0 の場合に例外をスローするようにしました。
- 修正: メモリキャッシュイベントに対して CrossfadeTransition が再開されない問題を修正しました。
- 修正: 許可されていない場合に、すべてのターゲットメソッドにハードウェアビットマップを返さないようにしました。
- 修正: MovieDrawable がその境界の中央に配置されない問題を修正しました。

---

- CrossfadeDrawable からの自動スケーリングを削除しました。
- `BitmapPool.trimMemory` をパブリックにしました。
- AnimatedImageDrawable を境界いっぱいに広げるため、`ScaleDrawable` でラップするようにしました。
- `RequestBuilder.setParameter` に `@JvmOverloads` を追加しました。
- view box が設定されていない場合に、SVG の view box をそのサイズに設定するようにしました。
- 状態とレベルの変更を CrossfadeDrawable の子に渡すようにしました。

---

- OkHttp を 3.12.8 に更新しました。

## [0.9.1] - 2019年12月30日

- 修正: `LoadRequestBuilder.crossfade(false)` を呼び出した際のクラッシュを修正しました。

## [0.9.0] - 2019年12月30日

- **破壊的変更**: `Transformation.transform` に `Size` パラメータが含まれるようになりました。これは、`Target` のサイズに基づいて出力 `Bitmap` のサイズを変更する transformation をサポートするためです。transformation を持つリクエストは、[画像サンプリング](https://coil-kt.github.io/coil/getting_started/#image-sampling) からも除外されるようになりました。
- **破壊的変更**: 任意のタイプの `Drawable` に `Transformation` が適用されるようになりました。以前は、入力 `Drawable` が `BitmapDrawable` でない場合、`Transformation` はスキップされていました。今後は、`Transformation` を適用する前に `Drawable` が `Bitmap` にレンダリングされます。
- **破壊的変更**: `ImageLoader.load` に `null` データを渡すとエラーとして扱われ、データが `null` の場合に `fallback` ドローアブルを設定できるよう、`Target.onError` および `Request.Listener.onError` が `NullRequestDataException` と共に呼び出されるようになりました。以前はリクエストが黙って無視されていました。
- **破壊的変更**: `RequestDisposable.isDisposed` が `val` になりました。

---

- **新機能**: カスタムトランジションをサポートしました。[詳細はこちら](/coil/compose)。API が検討中であるため、トランジションは実験的（experimental）としてマークされています。
- **新機能**: `LoadRequest` の進行中に suspend できるよう `RequestDisposable.await` を追加しました。
- **新機能**: リクエストデータが null の際に `fallback` ドローアブルを設定できるようサポートしました。
- **新機能**: `Precision` を追加しました。これにより、スケーリングをサポートするターゲット（例：`ImageViewTarget`）に対してスケーリングの最適化を可能にしつつ、出力 `Drawable` のサイズを正確にします。詳細は [ドキュメント](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/size/Precision.kt) を参照してください。
- **新機能**: 複数のキャッシュキーの一致をサポートするため、`RequestBuilder.aliasKeys` を追加しました。

---

- 修正: RequestDisposable をスレッドセーフにしました。
- 修正: `RoundedCornersTransformation` において、ターゲットのサイズにクロップしてから角を丸めるようにしました。
- 修正: `CircleCropTransformation` において、中央からクロップするようにしました。
- 修正: [ハードウェアビットマップ・ブラックリスト](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/memory/HardwareBitmapService.kt) にいくつかのデバイスを追加しました。
- 修正: Drawable を Bitmap に変換する際のアスペクト比を維持するようにしました。
- 修正: `Scale.FIT` において、メモリキャッシュがミスする可能性を修正しました。
- 修正: Parameters の反復順序が確定的（deterministic）であることを保証するようにしました。
- 修正: Parameters および ComponentRegistry 作成時の防御的コピー（defensive copy）を行うようにしました。
- 修正: RealBitmapPool の maxSize が >= 0 であることを保証するようにしました。
- 修正: CrossfadeDrawable がアニメーション中でない、または終了している場合に開始ドローアブルを表示するようにしました。
- 修正: 固有サイズ（intrinsic size）が未定義の子に対応するよう CrossfadeDrawable を調整しました。
- 修正: `MovieDrawable` が正しくスケーリングされない問題を修正しました。

---

- Update Kotlin to 1.3.61.
- Update Kotlin Coroutines to 1.3.3.
- Update Okio to 2.4.3.
- Update AndroidX dependencies:
    - `androidx.exifinterface:exifinterface` -> 1.1.0

## [0.8.0] - 2019年10月22日

- **破壊的変更**: `SvgDrawable` が削除されました。代わりに、`SvgDecoder` によって SVG が `BitmapDrawable` に事前レンダリングされるようになりました。これにより、SVG の**メインスレッドでのレンダリング負荷が大幅に軽減**されます。また、`SvgDecoder` のコンストラクタで `Context` が必須になりました。
- **破壊的変更**: `SparseIntArraySet` 拡張関数が `coil.extension` パッケージに移動しました。

---

- **新機能**: リクエストごとのネットワークヘッダー設定をサポートしました。[詳細はこちら](https://github.com/coil-kt/coil/pull/120)。
- **新機能**: 画像パイプラインを通じてカスタムデータを渡すための新しい `Parameters` API を追加しました。
- **新機能**: RoundedCornersTransformation において、角ごとに異なる半径の設定をサポートしました。@khatv911 に感謝。
- **新機能**: リソースを積極的に解放できるよう `ImageView.clear()` を追加しました。
- **新機能**: 他のパッケージからのリソース読み込みをサポートしました。
- **新機能**: 計測時にビューのパディングを差し引くかどうかを設定できるよう、ViewSizeResolver に `subtractPadding` 属性を追加しました。
- **新機能**: HttpUrlFetcher の MIME タイプ検出を改善しました。
- **新機能**: MovieDrawable と CrossfadeDrawable に Animatable2Compat サポートを追加しました。
- **新機能**: GIF の繰り返し回数を設定できるよう、`RequestBuilder<*>.repeatCount` を追加しました。
- **新機能**: BitmapPool の作成をパブリック API に追加しました。
- **新機能**: Request.Listener のメソッドに `@MainThread` アノテーションを付与しました。

---

- 修正: テスト用に CoilContentProvider を可視化しました。
- 修正: リソースキャッシュキーにナイトモードを含めるようにしました。
- 修正: ImageDecoder のネイティブクラッシュを回避するため、一時的にソースをディスクに書き込むようにしました。
- 修正: 連絡先の表示写真 URI を正しく処理するようにしました。
- 修正: CrossfadeDrawable の子に tint を渡すようにしました。
- 修正: ソースを閉じていない複数の箇所を修正しました。
- 修正: 不完全または壊れたハードウェアビットマップ実装を持つデバイスのブラックリストを追加しました。

---

- SDK 29 でコンパイルするようにしました。
- Update Kotlin Coroutines to 1.3.2.
- Update OkHttp to 3.12.6.
- Update Okio to 2.4.1.
- `coil-base` において `appcompat-resources` を `compileOnly` から `implementation` に変更しました。

## [0.7.0] - 2019年9月8日
- **破壊的変更**: `ImageLoaderBuilder.okHttpClient(OkHttpClient.Builder.() -> Unit)` は `ImageLoaderBuilder.okHttpClient(() -> OkHttpClient)` になりました。また、初期化子（initializer）はバックグラウンドスレッドで遅延して呼び出されるようになりました。**カスタムの `OkHttpClient` を設定する場合は、ディスクキャッシュを有効にするために `OkHttpClient.cache` を設定する必要があります。** カスタムの `OkHttpClient` を設定しない場合、Coil はデフォルトでディスクキャッシュが有効な `OkHttpClient` を作成します。デフォルトの Coil キャッシュは `CoilUtils.createDefaultCache(context)` を使用して作成できます。例:

```kotlin
val imageLoader = ImageLoader(context) {
    okHttpClient {
        OkHttpClient.Builder()
            .cache(CoilUtils.createDefaultCache(context))
            .build()
    }
}
```

- **破壊的変更**: `Fetcher.key` にデフォルト実装がなくなりました。
- **破壊的変更**: 以前は、最初に適用可能な `Mapper` のみが呼び出されていました。今後は、適用可能なすべての `Mapper` が呼び出されます。API の変更はありません。
- **破壊的変更**: 些細な名前付きパラメータの改名: `url` -> `uri`、`factory` -> `initializer`。

---

- **新機能**: SVG の自動デコードをサポートする `SvgDecoder` を持つ `coil-svg` アーティファクトを追加しました。[AndroidSVG](https://github.com/BigBadaboom/androidsvg) を使用しています。@rharter に感謝。
- **新機能**: `load(String)` および `get(String)` が、サポートされている任意の Uri スキームを受け入れるようになりました。例：`imageView.load("file:///path/to/file.jpg")` が可能になりました。
- **新機能**: `OkHttpClient` の代わりに `Call.Factory` を使用するよう ImageLoader をリファクタリングしました。これにより、`ImageLoaderBuilder.okHttpClient { OkHttpClient() }` を使用してネットワークリソースを遅延初期化できるようになります。@ZacSweers に感謝。
- **新機能**: リクエストに対して明示的にデコーダーを設定するための `RequestBuilder.decoder`。
- **新機能**: ImageLoader に対してデフォルトでハードウェアビットマップを有効・無効にする `ImageLoaderBuilder.allowHardware`。
- **新機能**: ImageDecoderDecoder におけるソフトウェアレンダリングのサポート。

---

- 修正: ベクタードローアブルの読み込みに関する複数のバグを修正しました。
- 修正: WRAP_CONTENT の View 寸法をサポートしました。
- 修正: 8192 バイトより長い EXIF データのパースをサポートしました。
- 修正: クロスフェード時にアスペクト比が異なるドローアブルを引き伸ばさないように修正しました。
- 修正: 例外によりネットワークオブザーバーの登録に失敗する場合へのガードを追加しました。
- 修正: MovieDrawable における 0 除算エラーを修正しました。@R12rus に感謝。
- 修正: ネストされた Android アセットファイルをサポートしました。@JaCzekanski に感謝。
- 修正: Android O および O_MR1 でファイル記述子が不足する場合へのガードを追加しました。
- 修正: メモリキャッシュを無効にした際のクラッシュを修正しました。@hansenji に感謝。
- 修正: Target.cancel が常にメインスレッドから呼び出されることを保証するようにしました。

---

- Update Kotlin to 1.3.50.
- Update Kotlin Coroutines to 1.3.0.
- Update OkHttp to 3.12.4.
- Update Okio to 2.4.0.
- AndroidX 依存関係を最新の安定版に更新しました:
    - `androidx.appcompat:appcompat` -> 1.1.0
    - `androidx.core:core-ktx` -> 1.1.0
    - `androidx.lifecycle:lifecycle-common-java8` -> 2.1.0
- `appcompat` を、より小さなアーティファクトである `appcompat-resources`（オプションの `compileOnly` 依存関係）に置き換えました。

## [0.6.1] - 2019年8月16日
- 新機能: `transformations(List<Transformation>)` を RequestBuilder に追加しました。
- 修正: ファイル URI のキャッシュキーに最終更新日を追加しました。
- 修正: View の寸法が少なくとも 1px に評価されることを保証するようにしました。
- 修正: フレーム間で MovieDrawable のキャンバスをクリアするようにしました。
- 修正: アセットを正しく開くようにしました。

## [0.6.0] - 2019年8月12日
- 初回リリース。