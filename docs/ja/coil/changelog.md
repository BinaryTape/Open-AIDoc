# 変更履歴

## [3.6.3] - 2026年9月18日 {id="3-6-3-september-18-2026"}

- Kotlin モジュール名のメタデータに含まれる無効な文字が原因で、Android Gradle Plugin 9.4.0 および R8 を使用したビルドが失敗する問題を修正しました。

## [3.6.2] - 2026年9月4日 {id="3-6-2-september-4-2026"}

- 待機中のリクエストがキャンセルされた場合に、`DeDupeConcurrentRequestStrategy` が特定のキーに対するリクエストをハングさせてしまう問題を修正しました。([#3566](https://github.com/coil-kt/coil/pull/3566))
- Compose Multiplatform 1.13 使用時における JS/WASM のリンケージエラーを修正しました。([#3568](https://github.com/coil-kt/coil/pull/3568))

## [3.6.1] - 2026年9月1日 {id="3-6-1-september-1-2026"}

- ES modules が有効になっている場合に JS ビルドが失敗する問題を修正しました。([#3558](https://github.com/coil-kt/coil/pull/3558))

## [3.6.0] - 2026年8月26日 {id="3-6-0-august-26-2026"}

- **新機能**: JS/WASM における `blob:` URL（オブジェクト URL）の読み込みサポートを追加しました。([#3504](https://github.com/coil-kt/coil/pull/3504))
- **新機能**: Android 上の `StaticImageDecoder` が不完全な画像（partial images）を受け入れるかどうかを設定するための `ImageRequest.Builder.allowPartialImage` および `ImageLoader.Builder.allowPartialImage` を追加しました。これはデフォルトで有効になっており、以前の Coil リリースと同じ動作です。([#3494](https://github.com/coil-kt/coil/pull/3494))
- 反転した制約（inverted constraints）で計測された場合に `AsyncImage` がクラッシュする問題を修正しました。([#3470](https://github.com/coil-kt/coil/pull/3470))
- GIF を含む Drawable ベースの画像に Compose の `filterQuality` が適用されない問題を修正しました。([#3469](https://github.com/coil-kt/coil/pull/3469))
- JS/WASM 画像デコーダーのメモリリークを修正しました。([#3503](https://github.com/coil-kt/coil/pull/3503))
- R8 9.0+ で最適化されたビルドにおいて、`GenericViewTarget` で画像のレンダリングに失敗する問題を修正しました。([#3518](https://github.com/coil-kt/coil/pull/3518))
- JVM 上で利用可能なメモリを 512 MB と仮定する代わりに、`Runtime.maxMemory()` を使用して最大メモリキャッシュサイズを決定するようにしました。([#3458](https://github.com/coil-kt/coil/pull/3458))
- Android 以外の JVM アーティファクトに ProGuard ルールを同梱しました。([#3476](https://github.com/coil-kt/coil/pull/3476))
- Android のコンパイル SDK を 37 に更新しました。
- Kotlin を 2.4.10 に更新しました。
- Compose を 1.12.0 に更新しました。
- Okio を 3.18.1 に更新しました。
- Skiko を 0.150.1 に更新しました。
- `kotlinx-io-okio` を 0.9.1 に更新しました。

## [3.5.0] - 2026年6月10日 {id="3-5-0-june-10-2026"}

`3.4.0` からの変更点:

- **重要**: `iosX64` および `macosX64` ターゲットを削除しました。([#3386](https://github.com/coil-kt/coil/pull/3386))
- **重要**: Android の最小 SDK バージョン（minSdkVersion）を 23 に引き上げました。([#3283](https://github.com/coil-kt/coil/pull/3283))
- **新機能**: 完全な Skia デコードへのフォールバックを回避するため、JS/WASM での高速な WebP サイズ抽出処理を追加しました。([#3341](https://github.com/coil-kt/coil/pull/3341))
- `ImageLoader.Builder.memoryCacheMaxSizePercentWhileInBackground` から実験的（experimental）アノテーションを削除しました。([#3439](https://github.com/coil-kt/coil/pull/3439))
- `CacheStrategy` の実装が、キャッシュされた失敗レスポンス（期限切れのキャッシュされた `404` レスポンスなど）を更新できない問題を修正しました。([#3401](https://github.com/coil-kt/coil/pull/3401))
- コルーチンコンテキストで `CoroutineDispatcher` ではなく `ContinuationInterceptor` を参照するようにしました。([#3415](https://github.com/coil-kt/coil/pull/3415))
- Android のコンパイル SDK を 36 に更新しました。
- Kotlin 言語バージョンを 2.2 に更新しました。
- Kotlin を 2.4.0 に更新しました。
- Compose を 1.11.1 に更新しました。
- Okio を 3.17.0 に更新しました。
- Skiko を 0.144.6 に更新しました。
- `androidx.annotation` を 1.10.0 に更新しました。

`3.5.0-beta01` からの変更点:

- `ImageLoader.Builder.memoryCacheMaxSizePercentWhileInBackground` から実験的アノテーションを削除しました。([#3439](https://github.com/coil-kt/coil/pull/3439))
- コルーチンコンテキストで `CoroutineDispatcher` ではなく `ContinuationInterceptor` を参照するようにしました。([#3415](https://github.com/coil-kt/coil/pull/3415))
- Kotlin 言語バージョンを 2.2 に更新しました。
- Kotlin を 2.4.0 に更新しました。
- Compose を 1.11.1 に更新しました。
- Skiko を 0.144.6 に更新しました。

## [3.5.0-beta01] - 2026年5月4日 {id="3-5-0-beta01-may-4-2026"}

- `iosX64` および `macosX64` ターゲットを削除しました。([#3386](https://github.com/coil-kt/coil/pull/3386))
- Android の最小 SDK バージョンを 23 に引き上げました。([#3283](https://github.com/coil-kt/coil/pull/3283))
- 完全な Skia デコードへのフォールバックを回避するため、JS/WASM での高速な WebP サイズ抽出処理を追加しました。([#3341](https://github.com/coil-kt/coil/pull/3341))
- `CacheStrategy` の実装が、キャッシュされた失敗レスポンス（期限切れのキャッシュされた `404` レスポンスなど）を更新できない問題を修正しました。([#3401](https://github.com/coil-kt/coil/pull/3401))
- コンパイル SDK を 36 に更新しました。
- Kotlin を 2.3.21 に更新しました。
- Compose を 1.11.0-beta03 に更新しました。
- Okio を 3.17.0 に更新しました。
- Skiko を 0.144.5 に更新しました。
- `androidx.annotation` を 1.10.0 に更新しました。

## [3.4.0] - 2026年2月24日 {id="3-4-0-february-24-2026"}

- **新機能**: 同一キーに対する処理中のネットワークリクエストの結合をサポートする `ConcurrentRequestStrategy` を追加しました。([#2995](https://github.com/coil-kt/coil/pull/2995)、[#3326](https://github.com/coil-kt/coil/pull/3326))
    - `DeDupeConcurrentRequestStrategy` はこの動作を有効化し、待機側が処理中のネットワークリクエストの結果を待てるようにします。
        - この動作は実験的機能であり、現在はデフォルトで無効になっています。
        - 現在のところ、リクエストは常に `diskCacheKey` に基づいて結合されます。
    - `OkHttpNetworkFetcherFactory`、`KtorNetworkFetcherFactory`、および `NetworkFetcher.Factory` が `concurrentRequestStrategy` を受け入れるようになりました。
- **新機能**: ブラウザのメインスレッドをブロックしないよう、Web Worker を使用して JS/WASM 上で画像をデコードするようにしました。([#3305](https://github.com/coil-kt/coil/pull/3305))
- **新機能**: 非 Compose マルチプラットフォームアーティファクト向けに、Linux ネイティブターゲット（`linuxX64` および `linuxArm64`）のサポートを追加しました。([#3054](https://github.com/coil-kt/coil/pull/3054))
- **新機能**: 後続のリクエスト間のトランジションを改善するための Compose 専用 API を追加しました。([#3141](https://github.com/coil-kt/coil/pull/3141)、[#3175](https://github.com/coil-kt/coil/pull/3175))
    - `ImageRequest.Builder.useExistingImageAsPlaceholder` により、プレースホルダーが設定されていない場合に前の画像からのクロスフェードが可能になります。
    - `ImageRequest.Builder.preferEndFirstIntrinsicSize` により、`CrossfadePainter` が終了側の Painter の固有サイズ（intrinsic size）を優先できるようになります。
- **新機能**: グローバルなアニメーション画像の繰り返し回数を設定するために、`coil-gif` に `ImageLoader.Builder.repeatCount(Int)` を追加しました。([#3143](https://github.com/coil-kt/coil/pull/3143))
- **新機能**: `coil-video` で埋め込み動画サムネイルの優先設定のサポートを追加しました。([#3107](https://github.com/coil-kt/coil/pull/3107))
- **新機能**: `coil-lint` を `coil-core` と共に公開し、`ImageRequest.Builder` ブロック内での誤った `kotlin.error()` 呼び出しを検出する Lint チェックを追加しました。([#3304](https://github.com/coil-kt/coil/pull/3304))
- Kotlin 言語バージョンを 2.1 に設定しました。([#3302](https://github.com/coil-kt/coil/pull/3302))
- `BitmapFetcher` を共通コード（common code）で利用可能にしました。([#3286](https://github.com/coil-kt/coil/pull/3286))
- Android 上でシングルトン `ImageLoader` を作成する際に `applicationContext` を使用するようにしました。([#3246](https://github.com/coil-kt/coil/pull/3246))
- 対象となる 2xx 以外の HTTP レスポンス（`404` など）をデフォルトでキャッシュし、キャッシュ不可能なレスポンス（`500` など）のキャッシュを停止しました。([#3137](https://github.com/coil-kt/coil/pull/3137)、[#3139](https://github.com/coil-kt/coil/pull/3139))
- OkHttp のレスポンスボディを消費する際の潜在的な競合状態を修正しました。([#3186](https://github.com/coil-kt/coil/pull/3186))
- Android において過大なサイズのビットマップによるクラッシュを防ぐため、`maxBitmapSize` のエッジケースを修正しました。([#3259](https://github.com/coil-kt/coil/pull/3259))
- Kotlin を 2.3.10 に更新しました。
- Compose を 1.9.3 に更新しました。
- Okio を 3.16.4 に更新しました。
- Skiko を 0.9.22.2 に更新しました。
- `kotlinx-io-okio` を 0.9.0 に更新しました。
- `androidx.core` を 1.16.0 に更新しました。
- `androidx.lifecycle` を 2.9.4 に更新しました。
- `androidx.exifinterface` を 1.4.2 に更新しました。

## [3.3.0] - 2025年7月22日 {id="3-3-0-july-22-2025"}

- **新機能**: アプリがバックグラウンドにある間、Android 上で `MemoryCache.maxSize` を制限する新しい API を導入しました。
    - `ImageLoader.Builder.memoryCacheMaxSizePercentWhileInBackground` が設定されている場合、アプリがバックグラウンドにある間、`ImageLoader` のメモリキャッシュはその最大サイズの一定割合に制限されます。この設定は現在、デフォルトで無効になっています。
    - アプリがバックグラウンドに移行した際、制限された最大サイズに収まるようにメモリキャッシュから画像がトリミングされますが、最近トリミングされた画像に対するメモリキャッシュの弱参照（weak reference）は影響を受けません。つまり、画像が現在他の場所（`AsyncImage`、`ImageView` など）から参照されている場合、その画像はメモリキャッシュ内に引き続き存在します。
    - この API は、バックグラウンドでのメモリ使用量を削減し、アプリが早期に強制終了されるのを防ぎ、ユーザー端末のメモリ圧迫を軽減するのに役立ちます。
- **新機能**: `SvgDecoder` に `Svg.Parser` 引数を追加しました。
    - これにより、デフォルトの SVG パーサーが要件を満たさない場合にカスタム SVG パーサーを使用できるようになります。
- カスタムの密度乗数（density multiplier）を指定できるようにするため、`SvgDecoder` に `density` 引数を追加しました。
- `Uri` のコピーおよび変更をサポートする `Uri.Builder` を追加しました。
- テスト内で Coil が使用する `Dispatchers.main.immediate` をオーバーライドできるようにするため、`ImageLoader.Builder.mainCoroutineContext` を追加しました。
- アニメーションの終了時に `start` 画像の参照が解除された際、`CrossfadePainter.intrinsicSize` が変化してしまう問題を修正しました。これにより、`CrossfadeDrawable` の動作と一致するようになります。
- Java から `ImageLoaders.executeBlocking` にアクセスできない問題を修正しました。
- `coil-network-ktor3` で `kotlinx.io` の Okio 相互運用モジュールを使用するようにしました。
- `kotlinx-datetime` を `0.7.1` に更新しました。
    - このリリースには、`coil-network-cache-control` モジュールにのみ影響するバイナリ非互換の変更が含まれています。詳細については[こちら](https://github.com/Kotlin/kotlinx-datetime?tab=readme-ov-file#deprecation-of-instant)を参照してください。
- Kotlin を 2.2.0 に更新しました。
- Compose を 1.8.2 に更新しました。
- Okio を 3.15.0 に更新しました。
- Skiko を 0.9.4.2 に更新しました。

## [3.2.0] - 2025年5月13日 {id="3-2-0-may-13-2025"}

`3.1.0` からの変更点:

- **重要**: Compose `1.8.0` で必要とされているため、`coil-compose` および `coil-compose-core` で Java 11 バイトコードが必要になりました。有効化する方法については[こちら](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8-or-java-11)を参照してください。
- `AsyncImagePreviewHandler` の関数型コンストラクタが、`AsyncImagePainter.State.Loading` ではなく `AsyncImagePainter.State.Success` を返すように変更しました。
- `ConstraintsSizeResolver#size()` でのキャンセル処理を修正しました。
- R8 でビルドする際の `PlatformContext` の欠落に関する警告を修正しました。
- デフォルトの `FakeImageLoaderEngine` レスポンスが返された場合に、`FakeImageLoaderEngine` が `Transition.Factory.NONE` を設定しない問題を修正しました。
- `ColorImage` から実験的アノテーションを削除しました。
- `CacheControlCacheStrategy` でネットワークヘッダーを遅延解析するようにしました。
- `CircleCropTransformation` と `RoundedCornersTransformation` をリファクタリングして共通コードを共有するようにしました。
- `ExifOrientationStrategy` が `RESPECT_PERFORMANCE` でない場合、内部的に `BitmapFactory` の使用にフォールバックするようにしました。
- Kotlin を 2.1.20 に更新しました。
- Compose を 1.8.0 に更新しました。
- Okio を 3.11.0 に更新しました。
- Skiko を 0.9.4 に更新しました。
- Coroutines を 1.10.2 に更新しました。
- `accompanist-drawablepainter` を 0.37.3 に更新しました。

`3.2.0-rc02` からの変更点:

- `ExifOrientationStrategy` が `RESPECT_PERFORMANCE` でない場合、内部的に `BitmapFactory` の使用にフォールバックするようにしました。
- Compose を 1.8.0 に更新しました。
- `accompanist-drawablepainter` を 0.37.3 に更新しました。

## [3.2.0-rc02] - 2025年4月26日 {id="3-2-0-rc02-april-26-2025"}

- JVM 以外のターゲットで `KtorNetworkFetcherFactory` (Ktor 3) を使用して画像を読み込む際に、画像リクエストが `ClosedByteChannelException` で失敗する問題を修正しました。

## [3.2.0-rc01] - 2025年4月24日 {id="3-2-0-rc01-april-24-2025"}

- **重要**: Compose `1.8.0` で必要とされているため、`coil-compose` および `coil-compose-core` で Java 11 バイトコードが必要になりました。有効化する方法については[こちら](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8-or-java-11)を参照してください。
- `AsyncImagePreviewHandler` の関数型コンストラクタが、`AsyncImagePainter.State.Loading` ではなく `AsyncImagePainter.State.Success` を返すように変更しました。
- `ConstraintsSizeResolver#size()` でのキャンセル処理を修正しました。
- R8 でビルドする際の `PlatformContext` の欠落に関する警告を修正しました。
- デフォルトの `FakeImageLoaderEngine` レスポンスが返された場合に、`FakeImageLoaderEngine` が `Transition.Factory.NONE` を設定しない問題を修正しました。
- `ColorImage` から実験的アノテーションを削除しました。
- `CacheControlCacheStrategy` でネットワークヘッダーを遅延解析するようにしました。
- `CircleCropTransformation` と `RoundedCornersTransformation` をリファクタリングして共通コードを共有するようにしました。
- `coil-network-ktor2` および `coil-network-ktor3` で `kotlinx.io` の Okio 相互運用モジュールを使用するようにしました。
- Kotlin を 2.1.20 に更新しました。
- Compose を 1.8.0-rc01 に更新しました。
- Okio を 3.11.0 に更新しました。
- Skiko を 0.9.4 に更新しました。
- Coroutines を 1.10.2 に更新しました。

## [3.1.0] - 2025年2月4日 {id="3-1-0-february-4-2025"}

- `AsyncImage` のパフォーマンスを改善しました。
    - コンポーザブルがインスタンス化されるか再利用されるかに応じて、実行時パフォーマンスが 25% から 40% 向上しました。メモリ割り当て（allocations）も 35% から 48% 削減されました。詳細情報は[こちら](https://github.com/coil-kt/coil/pull/2795)を参照してください。
- `ColorImage` を追加し、`FakeImage` を非推奨にしました。
    - `ColorImage` は、テストやプレビューでフェイクの値を返すのに役立ちます。`FakeImage` と同じユースケースを解決しますが、`coil-test` ではなく `coil-core` にあるため、より簡単にアクセスできます。
- `coil-compose-core` の `Dispatchers.Main.immediate` への依存を削除しました。
    - これにより、Paparazzi や Roborazzi のスクリーンショットテストで `AsyncImagePainter` が `ImageRequest` を同期的に実行しない問題も修正されました。
- `data:[<mediatype>][;base64],<data>` 形式の [データ URI](https://www.ietf.org/rfc/rfc2397.txt) のサポートを追加しました。
- GIF のメタデータにエンコードされた繰り返し回数を使用できるようにするため、`AnimatedImageDecoder.ENCODED_LOOP_COUNT` を追加しました。
- カスタム拡張をサポートするため、`NetworkRequest` に `Extras` を追加しました。
- `DiskCache.Builder.cleanupCoroutineContext` を追加し、`DiskCache.Builder.cleanupDispatcher` を非推奨にしました。
- API 29 以上で `android.graphics.ImageDecoder` の使用をオプションで無効化できるように、`ImageLoader.Builder.imageDecoderEnabled` を追加しました。
- `ImageRequest` のデータ型に対して登録された `Keyer` が存在しない場合に、警告をログ出力するようにしました。
- `CrossfadePainter` をパブリックにしました。
- すべてのマルチプラットフォームターゲットで `Transformation` をサポートしました。
- `CacheControlCacheStrategy` で `Expires` ヘッダー値として 0 をサポートしました。
- `ContentScale` が `None` との間で変化した場合に、`AsyncImage`/`SubcomposeAsyncImage`/`rememberAsyncImage` が新しい `ImageRequest` を起動しない問題を修正しました。
- Kotlin を 2.1.10 に更新しました。
    - 注意: Kotlin Native を使用している場合、[LLVM のアップデート](https://kotlinlang.org/docs/whatsnew21.html#llvm-update-from-11-1-0-to-16-0-0)に伴い、このリリースでは Kotlin 2.1.0 以上でコンパイルする必要があります。
- Compose を 1.7.3 に更新しました。
- `androidx.core` を 1.15.0 に更新しました。

## [3.0.4] - 2024年11月25日 {id="3-0-4-november-25-2024"}

- Android Studio のプレビューでベクター Drawable がレンダリングされない問題を修正しました。
- サイズが `maxBitmapSize` を超えるリクエストにおける潜在的なメモリキャッシュミスを修正しました。
- Android 上で `FakeImage` がレンダリングされない問題を修正しました。
- `AsyncImage`/`rememberAsyncImagePainter`/`SubcomposeAsyncImage` と共に使用した場合に、リクエストの `Transformation` が変更されても新しい画像リクエストが起動されない問題を修正しました。
- `ScaleDrawable` および `CrossfadeDrawable` が色合い（tint）の状態を尊重しない問題を修正しました。
- `ImageDecoder` が不完全な画像ソースをデコードできるようにしました。これは `BitmapFactory` の動作と一致します。
- デコード後に `Bitmap.prepareToDraw()` が呼び出されない問題を修正しました。
- `SvgDecoder` がラスター化されていない画像に対して `isSampled = true` を返さないようにしました。
- 即時メインディスパッチャー（immediate main dispatcher）が利用できない場合、Compose では `Dispatchers.Unconfined` にフォールバックするようにしました。これはプレビュー/テスト環境でのみ使用されます。
- Ktor 2 を `2.3.13` に更新しました。

## [3.0.3] - 2024年11月14日 {id="3-0-3-november-14-2024"}

- `ImageView` の `ScaleType` に基づく `ImageRequest.scale` の設定を修正しました。
- ファイルを削除した後に、`DiskCache` がエントリの削除を追跡しないエッジケースを修正しました。
- エラーのログ出力時に、スロー可能オブジェクト（throwable）を `Logger` に渡すようにしました。
- `kotlin-stdlib-jdk7` および `kotlin-stdlib-jdk8` を `kotlin-stdlib` で置き換えないようにしました。

## [3.0.2] - 2024年11月9日 {id="3-0-2-november-9-2024"}

- Android 上でカスタム `CacheStrategy` を指定して `OkHttpNetworkFetcherFactory` を呼び出した際のクラッシュを修正しました。
- `CacheControlCacheStrategy` がキャッシュエントリの保持期間（age）を誤って計算する問題を修正しました。
- API 28 以上において、`ARGB_8888` または `HARDWARE` の場合にのみ `ImageRequest.bitmapConfig` が尊重されていた問題を修正しました。

## [3.0.1] - 2024年11月7日 {id="3-0-1-november-7-2024"}

- ハードウェアビットマップベースの `BitmapImage` で `Image.toBitmap` を呼び出した際のクラッシュを修正しました。
- `ImageRequest` 以外のモデルに対して、`AsyncImageModelEqualityDelegate.Default` が同等性を誤って比較する問題を修正しました。

## [3.0.0] - 2024年11月4日 {id="3-0-0-november-4-2024"}

Coil 3.0.0 は、[Compose Multiplatform](https://www.jetbrains.com/compose-multiplatform/) を完全にサポートした Coil の次のメジャーリリースです。

[3.0.0 における改善点と重要な変更点の完全なリストについては、アップグレードガイドを確認してください](https://coil-kt.github.io/coil/upgrading_to_coil3/)。

`3.0.0-rc02` からの変更点:

- 残っていた非推奨のメソッドを削除しました。

## [3.0.0-rc02] - 2024年10月28日 {id="3-0-0-rc02-october-28-2024"}

[3.x における改善点と重要な変更点の完全なリストについては、アップグレードガイドを確認してください](https://coil-kt.github.io/coil/upgrading_to_coil3/)。`3.0.0-rc01` からの変更点:

- `BlackholeDecoder` を追加しました。これにより、[ディスクキャッシュのみのプリロード](https://coil-kt.github.io/coil/faq/#how-do-i-preload-an-image)が簡素化されます。
- `ConstraintsSizeResolver` および `DrawScopeSizeResolver` 用の `remember` 関数を追加しました。
- `AsyncImage` のパラメータから `EqualityDelegate` を削除しました。代わりに、`LocalAsyncImageModelEqualityDelegate` を介して設定する必要があります。
- 親コンポーザブルが `IntrinsicSize` を使用している場合に、`AsyncImage` がレンダリングされない問題を修正しました。
- `AsyncImagePainter` に子 painter がない場合に、`AsyncImage` が利用可能な制約領域全体を占有してしまう問題を修正しました。
- `EqualityDelegate` が無視されることにより、状態が監視されているときに `rememberAsyncImagePainter` が無限に再コンポーズされる問題を修正しました。
- 特殊文字を含む `File`/`Path` パスの解析を修正しました。
- `VideoFrameDecoder` でのカスタム `FileSystem` 実装の使用を修正しました。
- Ktor を `3.0.0` に更新しました。
- `androidx.annotation` を `1.9.0` に更新しました。

## [3.0.0-rc01] - 2024年10月8日 {id="3-0-0-rc01-october-8-2024"}

[3.x における改善点と重要な変更点の完全なリストについては、アップグレードガイドを確認してください](https://coil-kt.github.io/coil/upgrading_to_coil3/)。`3.0.0-alpha10` からの変更点:

- **破壊的変更**: `addLastModifiedToFileCacheKey` をデフォルトで無効化し、リクエストごとに設定できるようにしました。同じフラグを使用してこの動作を再度有効にすることができます。
- **新機能**: [`Cache-Control` ヘッダー](https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Cache-Control)のサポートを実装した、新しい `coil-network-cache-control` アーティファクトを導入しました。
- **新機能**: `SvgDecoder.Factory` に `scaleToDensity` プロパティを追加しました。このプロパティにより、固有の寸法を持つ SVG がデバイスの密度で乗算されるようになります（Android でのみサポート）。
- `ExifOrientationPolicy` の名前を `ExifOrientationStrategy` に変更しました。
- 取得時に共有不可能な画像を `MemoryCache` から削除するようにしました。
- `ConstraintsSizeResolver` をパブリックにしました。
- `setSingletonImageLoaderFactory` を安定化しました。
- `coil-network-ktor3` で最適化された JVM I/O 関数を復元しました。
- MIME タイプのリストに `pdf` を追加しました。
- コンパイル SDK を 35 に更新しました。
- Kotlin を 2.0.20 に更新しました。
- Okio を 3.9.1 に更新しました。

## [3.0.0-alpha10] - 2024年8月7日 {id="3-0-0-alpha10-august-7-2024"}

- **破壊的変更**: `ImageLoader.Builder.networkObserverEnabled` を、`NetworkFetcher` 用の `ConnectivityChecker` インターフェースに置き換えました。
    - ネットワークオブザーバーを無効にするには、`KtorNetworkFetcherFactory`/`OkHttpNetworkFetcherFactory` のコンストラクタに `ConnectivityChecker.ONLINE` を渡します。
- **新機能**: すべてのプラットフォームで [Compose Multiplatform リソース](https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-images-resources.html)の読み込みをサポートしました。リソースを読み込むには、`Res.getUri` を使用します:

```kotlin
AsyncImage(
    model = Res.getUri("drawable/image.jpg"),
    contentDescription = null,
)
```

- `ImageLoader` および `ImageRequest` に `maxBitmapSize` プロパティを追加しました。
    - このプロパティのデフォルト値は 4096x4096 であり、割り当てられるビットマップ寸法の安全な上限を提供します。これにより、誤って `Size.ORIGINAL` で非常に大きな画像を読み込んで OutOfMemory エラーが発生するのを防止できます。
- カスタムポリシーをサポートするため、`ExifOrientationPolicy` をインターフェースに変更しました。
- Windows ファイルパスの `Uri` 処理を修正しました。
- `Image` API から `@ExperimentalCoilApi` を削除しました。
- Kotlin を 2.0.10 に更新しました。

## [3.0.0-alpha09] - 2024年7月23日 {id="3-0-0-alpha09-july-23-2024"}

- **破壊的変更**: Ktor 2.x に依存する `io.coil-kt.coil3:coil-network-ktor` アーティファクトの名前を `io.coil-kt.coil3:coil-network-ktor2` に変更しました。さらに、Ktor 3.x に依存する `io.coil-kt.coil3:coil-network-ktor3` を導入しました。`wasmJs` のサポートは Ktor 3.x でのみ利用可能です。
- **新機能**: 画像リクエストを手動で再開するための `AsyncImagePainter.restart()` を追加しました。
- `NetworkClient` および関連クラスから `@ExperimentalCoilApi` を削除しました。
- 不要な `Extras` や `Map` のメモリ割り当てを回避するために `ImageRequest` を最適化しました。

## [2.7.0] - 2024年7月17日 {id="2-7-0-july-17-2024"}

- `ImageLoader.execute`、`AsyncImage`、`SubcomposeAsyncImage`、および `rememberAsyncImagePainter` のパフォーマンスを向上させるため、内部のコルーチン使用方法をわずかに最適化しました。([#2205](https://github.com/coil-kt/coil/pull/2205))
- チャンク化されたレスポンス（chunked responses）に対してネットワーク呼び出しが重複する問題を修正しました。([#2363](https://github.com/coil-kt/coil/pull/2363))
- Kotlin を 2.0.0 に更新しました。
- Compose UI を 1.6.8 に更新しました。
- Okio を 3.9.0 に更新しました。

## [3.0.0-alpha08] - 2024年7月8日 {id="3-0-0-alpha08-july-8-2024"}

- **破壊的変更**: `ImageRequest` および `ImageLoader` の `dispatcher` メソッドの名前を `coroutineContext` に変更しました。たとえば、`ImageRequest.Builder.dispatcher` は `ImageRequest.Builder.coroutineContext` になりました。このメソッドが任意の `CoroutineContext` を受け入れるようになり、`Dispatcher` を必須としなくなったため、名前が変更されました。
- 修正: 競合状態により発生する可能性があった `IllegalStateException: Reading a state that was created after the snapshot was taken or in a snapshot that has not yet been applied` を修正しました。
    - 注意: これにより、`Dispatchers.Main.immediate` へのソフトな依存関係が再導入されます。そのため、JVM 上では [`kotlinx-coroutines-swing`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-swing/) への依存関係を再度追加する必要があります。これがインポートされていない場合、`ImageRequest` は即座にディスパッチされず、`ImageRequest.placeholder` の設定やメモリキャッシュからの解決までに 1 フレームの遅延が発生します。

## [3.0.0-alpha07] - 2024年6月26日 {id="3-0-0-alpha07-june-26-2024"}

- **破壊的変更**: `AsyncImagePainter` はデフォルトで `onDraw` を待機しなくなり、代わりに `Size.ORIGINAL` を使用するようになりました。
    - これにより、[Roborazzi/Paparazzi との互換性の問題](https://github.com/coil-kt/coil/issues/1910)が修正され、テストの信頼性が全体的に向上します。
    - `onDraw` を待機する以前の動作に戻すには、`ImageRequest.sizeResolver` として `DrawScopeSizeResolver` を設定します。
- **破壊的変更**: マルチプラットフォームの `Image` API をリファクタリングしました。特に、`asCoilImage` は `asImage` に名前が変更されました。
- **破壊的変更**: `AsyncImagePainter.state` が `StateFlow<AsyncImagePainter.State>` に変更されました。その値を監視するには `collectAsState` を使用してください。これによりパフォーマンスが向上します。
- **破壊的変更**: `AsyncImagePainter.imageLoader` と `AsyncImagePainter.request` が `StateFlow<AsyncImagePainter.Inputs>` に統合されました。その値を監視するには `collectAsState` を使用してください。これによりパフォーマンスが向上します。
- **破壊的変更**: リソース縮小の最適化を妨げるため、`android.resource://example.package.name/drawable/image` 形式の URI のサポートを削除しました。
    - 引き続きその機能が必要な場合は、[コンポーネントレジストリに `ResourceUriMapper` を手動で含める](https://github.com/coil-kt/coil/blob/main/coil-core/src/androidInstrumentedTest/kotlin/coil3/map/ResourceUriMapper.kt)ことができます。
- **新機能**: `AsyncImagePainter` のプレビューレンダリング動作を制御するための `AsyncImagePreviewHandler` を導入しました。
    - プレビューの動作をオーバーライドするには、`LocalAsyncImagePreviewHandler` を使用します。
    - この変更およびその他の `coil-compose` の改善の一環として、`AsyncImagePainter` はデフォルトで `ImageRequest.placeholder` を表示するのではなく、デフォルトで `ImageRequest` の実行を試みるようになりました。プレビュー環境では、[ネットワークやファイルを使用するリクエストは失敗することが想定されます](https://developer.android.com/develop/ui/compose/tooling/previews#preview-limitations)が、Android リソースは正常に機能するはずです。
- **新機能**: フレームインデックスによる動画画像の抽出をサポートしました。([#2183](https://github.com/coil-kt/coil/pull/2183))
- **新機能**: すべての `CoroutineDispatcher` メソッドへの `CoroutineContext` の受け渡しをサポートしました。([#2241](https://github.com/coil-kt/coil/pull/2241))
- **新機能**: JS および WASM JS での弱参照メモリキャッシュをサポートしました。
- Compose 内で `Dispatchers.Main.immediate` へのディスパッチを行わないようにしました。その結果、JVM 上で [`kotlinx-coroutines-swing`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-swing/) をインポートする必要がなくなりました。
- パフォーマンス向上のため、Compose 内で `async` を呼び出して disposable を作成しないようにしました（@mlykotom に感謝！）。([#2205](https://github.com/coil-kt/coil/pull/2205))
- グローバルな `ImageLoader` の extras を `Options` に渡す処理を修正しました。([#2223](https://github.com/coil-kt/coil/pull/2223))
- Android 以外のターゲットで `crossfade(false)` が機能しない問題を修正しました。
- VP8X 機能フラグのバイトオフセットを修正しました。([#2199](https://github.com/coil-kt/coil/pull/2199))
- 描画時に画像をレンダリングするのではなく、ビットマップにレンダリングするように Android 以外のターゲット上の `SvgDecoder` を変更しました。これによりパフォーマンスが向上します。
    - この動作は `SvgDecoder(renderToBitmap)` を使用して制御できます。
- `ScaleDrawable` を `coil-gif` から `coil-core` に移動しました。
- Kotlin を 2.0.0 に更新しました。
- Compose を 1.6.11 に更新しました。
- Okio を 3.9.0 に更新しました。
- Skiko を 0.8.4 に更新しました。
- [3.x における重要な変更点の完全なリストについては、アップグレードガイドを確認してください。](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [3.0.0-alpha06] - 2024年2月29日 {id="3-0-0-alpha06-february-29-2024"}

- Skiko を 0.7.93 にダウングレードしました。
- [3.x における重要な変更点の完全なリストについては、アップグレードガイドを確認してください。](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [3.0.0-alpha05] - 2024年2月28日 {id="3-0-0-alpha05-february-28-2024"}

- **新機能**: `wasmJs` ターゲットをサポートしました。
- Android 以外のプラットフォームで `Bitmap` ベースではない `Image` の描画をサポートするため、`DrawablePainter` と `DrawableImage` を作成しました。
    - `Image` API は実験的であり、アルファリリース間で変更される可能性があります。
- `Modifier.Node` を実装するように `ContentPainterModifier` を更新しました。
- 修正: コンポーネントのコールバックとネットワークオブザーバーをバックグラウンドスレッドで遅延登録するようにしました。これにより、通常メインスレッドで発生していた低速な初期化が修正されます。
- 修正: `ImageLoader.Builder.placeholder/error/fallback` が `ImageRequest` で使用されない問題を修正しました。
- Compose を 1.6.0 に更新しました。
- Coroutines を 1.8.0 に更新しました。
- Okio を 3.8.0 に更新しました。
- Skiko を 0.7.94 に更新しました。
- [3.x における重要な変更点の完全なリストについては、アップグレードガイドを確認してください。](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [2.6.0] - 2024年2月23日 {id="2-6-0-february-23-2024"}

- `rememberAsyncImagePainter`、`AsyncImage`、および `SubcomposeAsyncImage` を[再起動可能かつスキップ可能（restartable and skippable）](https://developer.android.com/jetpack/compose/performance/stability#functions)にしました。これにより、コンポーザブルの引数のいずれかが変更されない限り再コンポジションを回避できるため、パフォーマンスが向上します。
    - `model` が再コンポジションをトリガーするかどうかを制御するため、オプションの `modelEqualityDelegate` 引数を `rememberAsyncImagePainter`、`AsyncImage`、および `SubcomposeAsyncImage` に追加しました。
- `Modifier.Node` を実装するように `ContentPainterModifier` を更新しました。
- 修正: コンポーネントのコールバックとネットワークオブザーバーをバックグラウンドスレッドで遅延登録するようにしました。これにより、通常メインスレッドで発生していた低速な初期化が修正されます。
- 修正: `ImageRequest.listener` または `ImageRequest.target` が変更された場合に、`rememberAsyncImagePainter`、`AsyncImage`、および `SubcomposeAsyncImage` で新しい画像リクエストが再起動されないようにしました。
- 修正: `AsyncImagePainter` で画像リクエストが 2 回監視されないようにしました。
- Kotlin を 1.9.22 に更新しました。
- Compose を 1.6.1 に更新しました。
- Okio を 3.8.0 に更新しました。
- `androidx.collection` を 1.4.0 に更新しました。
- `androidx.lifecycle` を 2.7.0 に更新しました。

## [3.0.0-alpha04] - 2024年2月1日 {id="3-0-0-alpha04-february-1-2024"}

- **破壊的変更**: `OkHttpNetworkFetcherFactory` および `KtorNetworkFetcherFactory` のパブリック API から `Lazy` を削除しました。
- `OkHttpNetworkFetcherFactory` で `OkHttpClient` の代わりに `Call.Factory` を公開するようにしました。
- `ByteString` をラップするように `NetworkResponseBody` を変更しました。
- Compose を 1.5.12 にダウングレードしました。
- [重要な変更点の完全なリストについては、アップグレードガイドを確認してください。](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [3.0.0-alpha03] - 2024年1月20日 {id="3-0-0-alpha03-january-20-2024"}

- **破壊的変更**: `coil-network` の名前を `coil-network-ktor` に変更しました。さらに、OkHttp に依存し、Ktor エンジンの指定を必要としない新しい `coil-network-okhttp` アーティファクトを追加しました。
    - インポートするアーティファクトに応じて、`KtorNetworkFetcherFactory` または `OkHttpNetworkFetcherFactory` を使用して `Fetcher.Factory` を手動で参照できます。
- Apple プラットフォームでの `NSUrl` の読み込みをサポートしました。
- `AsyncImage` に `clipToBounds` パラメータを追加しました。
- [重要な変更点の完全なリストについては、アップグレードガイドを確認してください。](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [3.0.0-alpha02] - 2024年1月10日 {id="3-0-0-alpha02-january-10-2024"}

- **破壊的変更**: `coil-gif`、`coil-network`、`coil-svg`、および `coil-video` のパッケージが更新され、すべてのクラスがそれぞれ `coil.gif`、`coil.network`、`coil.svg`、`coil.video` の一部になりました。これにより、他のアーティファクトとのクラス名の競合を回避できます。
- **破壊的変更**: `ImageDecoderDecoder` の名前を `AnimatedImageDecoder` に変更しました。
- **新機能**: `coil-gif`、`coil-network`、`coil-svg`、および `coil-video` のコンポーネントが、各 `ImageLoader` の `ComponentRegistry` に自動的に追加されるようになりました。
    - 明確にしておくと、`3.0.0-alpha01` とは異なり、**`ComponentRegistry` に `NetworkFetcher.Factory()` を手動で追加する必要はありません**。`io.coil-kt.coil3:coil-network:[version]` と [Ktor エンジン](https://ktor.io/docs/http-client-engines.html#dependencies)をインポートするだけで、ネットワーク画像を読み込むのに十分です。
    - これらのコンポーネントを `ComponentRegistry` に手動で追加しても問題ありません。手動で追加されたコンポーネントは、自動的に追加されたコンポーネントよりも優先されます。
    - 必要に応じて、`ImageLoader.Builder.serviceLoaderEnabled(false)` を使用してこの動作を無効にすることができます。
- **新機能**: すべてのプラットフォームで `coil-svg` をサポートしました。Android では [AndroidSVG](https://bigbadaboom.github.io/androidsvg/)、Android 以外のプラットフォームでは [SVGDOM](https://api.skia.org/classSkSVGDOM.html) をベースとしています。
- Coil は内部で Android の [`ImageDecoder`](https://developer.android.com/reference/android/graphics/ImageDecoder) API を使用するようになりました。これにより、ファイル、リソース、またはコンテンツ URI から直接デコードする際のパフォーマンスが向上します。
- 修正: `coil3.Uri` 解析に関する複数の修正を行いました。
- [重要な変更点の完全なリストについては、アップグレードガイドを確認してください。](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [3.0.0-alpha01] - 2023年12月30日 {id="3-0-0-alpha01-december-30-2023"}

- **新機能**: [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) のサポート。Coil は、Android、JVM、iOS、macOS、および Javascript をサポートする Kotlin Multiplatform ライブラリになりました。
- Coil の Maven 座標が `io.coil-kt.coil3` に更新され、インポートが `coil3` に更新されました。これにより、バイナリ互換性の問題なしに Coil 3 と Coil 2 を共存させることができます。たとえば、`io.coil-kt:coil:[version]` は `io.coil-kt.coil3:coil:[version]` になりました。
- Coroutines、Ktor、および AndroidX で使用されている命名規則に合わせて、`coil-base` アーティファクトと `coil-compose-base` アーティファクトの名前がそれぞれ `coil-core` と `coil-compose-core` に変更されました。
- [重要な変更点の完全なリストについては、アップグレードガイドを確認してください。](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [2.5.0] - 2023年10月30日 {id="2-5-0-october-30-2023"}

- **新機能**: `coil-video` で `MediaDataSource` の実装のデコードをサポートするため、`MediaDataSourceFetcher.Factory` を追加しました。([#1795](https://github.com/coil-kt/coil/pull/1795))
- ハードウェアビットマップのブロックリストに `SHIFT6m` デバイスを追加しました。([#1812](https://github.com/coil-kt/coil/pull/1812))
- 修正: いずれかの寸法が無制限（unbounded）なサイズを返す painter に対する保護を追加しました。([#1826](https://github.com/coil-kt/coil/pull/1826))
- 修正: キャッシュされたヘッダーに非 ASCII 文字が含まれている場合、`304 Not Modified` の後にディスクキャッシュの読み込みが失敗する問題を修正しました。([#1839](https://github.com/coil-kt/coil/pull/1839))
- 修正: `FakeImageEngine` がインターセプターチェーンのリクエストを更新しない問題を修正しました。([#1905](https://github.com/coil-kt/coil/pull/1905))
- コンパイル SDK を 34 に更新しました。
- Kotlin を 1.9.10 に更新しました。
- Coroutines を 1.7.3 に更新しました。
- `accompanist-drawablepainter` を 0.32.0 に更新しました。
- `androidx.annotation` を 1.7.0 に更新しました。
- `androidx.compose.foundation` を 1.5.4 に更新しました。
- `androidx.core` を 1.12.0 に更新しました。
- `androidx.exifinterface:exifinterface` を 1.3.6 に更新しました。
- `androidx.lifecycle` を 2.6.2 に更新しました。
- `com.squareup.okhttp3` を 4.12.0 に更新しました。
- `com.squareup.okio` を 3.6.0 に更新しました。

## [2.4.0] - 2023年5月21日 {id="2-4-0-may-21-2023"}

- `DiskCache` の `get`/`edit` の名前を `openSnapshot`/`openEditor` に変更しました。
- `AsyncImagePainter` で `ColorDrawable` を `ColorPainter` に自動変換しないようにしました。
- 単純な `AsyncImage` のオーバーロードに `@NonRestartableComposable` アノテーションを付加しました。
- 修正: `ImageSource` 内で `Context.cacheDir` を遅延呼び出しするようにしました。
- 修正: `coil-bom` の公開を修正しました。
- 修正: ハードウェアビットマップが無効になっている場合に、ビットマップ設定が常に `ARGB_8888` に設定されてしまう問題を修正しました。
- Kotlin を 1.8.21 に更新しました。
- Coroutines を 1.7.1 に更新しました。
- `accompanist-drawablepainter` を 0.30.1 に更新しました。
- `androidx.compose.foundation` を 1.4.3 に更新しました。
- `androidx.profileinstaller:profileinstaller` を 1.3.1 に更新しました。
- `com.squareup.okhttp3` を 4.11.0 に更新しました。

## [2.3.0] - 2023年3月25日 {id="2-3-0-march-25-2023"}

- **新機能**: `FakeImageLoaderEngine` を含む新しい `coil-test` アーティファクトを導入しました。このクラスは、テストにおいて一貫性のある同期的な（メインスレッドからの）レスポンスを確保するために、イメージローダーのレスポンスをハードコードするのに便利です。詳細については[こちら](https://coil-kt.github.io/coil/testing)を参照してください。
- **新機能**: `coil-base`（`coil` の子モジュール）および `coil-compose-base`（`coil-compose` の子モジュール）に[ベースラインプロファイル](https://developer.android.com/topic/performance/baselineprofiles/overview)を追加しました。
    - これにより Coil の実行時パフォーマンスが向上し、アプリでの Coil の使用方法に応じて[より優れたフレームタイミング](https://github.com/coil-kt/coil/tree/main/coil-benchmark/benchmark_output.md)が提供されるはずです。
- 修正: エンコードされたデータを含む `file://` URI の解析を修正しました。[#1601](https://github.com/coil-kt/coil/pull/1601)
- 修正: 存在しないディレクトリが渡された場合でも、`DiskCache` が最大サイズを適切に計算するようになりました。[#1620](https://github.com/coil-kt/coil/pull/1620)
- `Coil.reset` をパブリック API にしました。[#1506](https://github.com/coil-kt/coil/pull/1506)
- Java のデフォルトメソッド生成を有効にしました。[#1491](https://github.com/coil-kt/coil/pull/1491)
- Kotlin を 1.8.10 に更新しました。
- `accompanist-drawablepainter` を 0.30.0 に更新しました。
- `androidx.annotation` を 1.6.0 に更新しました。
- `androidx.appcompat:appcompat-resources` を 1.6.1 に更新しました。
- `androidx.compose.foundation` を 1.4.0 に更新しました。
- `androidx.core` を 1.9.0 に更新しました。
- `androidx.exifinterface:exifinterface` を 1.3.6 に更新しました。
- `androidx.lifecycle` を 2.6.1 に更新しました。
- `okio` を 3.3.0 に更新しました。

## [2.2.2] - 2022年10月1日 {id="2-2-2-october-1-2022"}

- システムコールバックを登録する前に、イメージローダーが完全に初期化されていることを確認するようにしました。[#1465](https://github.com/coil-kt/coil/pull/1465)
- バンディングを防ぐため、API 30 以上では `VideoFrameDecoder` で優先されるビットマップ設定を指定するようにしました。[#1487](https://github.com/coil-kt/coil/pull/1487)
- `FileUriMapper` で `#` を含むパスの解析を修正しました。[#1466](https://github.com/coil-kt/coil/pull/1466)
- ディスクキャッシュからの非 ASCII ヘッダーを含むレスポンスの読み取りを修正しました。[#1468](https://github.com/coil-kt/coil/pull/1468)
- アセットのサブフォルダ内にある動画のデコードを修正しました。[#1489](https://github.com/coil-kt/coil/pull/1489)
- `androidx.annotation` を 1.5.0 に更新しました。

## [2.2.1] - 2022年9月8日 {id="2-2-1-september-8-2022"}

- 修正: `RoundedCornersTransformation` が `input` ビットマップを適切にスケーリングするようになりました。
- `kotlin-parcelize` プラグインへの依存関係を削除しました。
- コンパイル SDK を 33 に更新しました。
- [#1423](https://github.com/coil-kt/coil/issues/1423) を回避するため、`androidx.appcompat:appcompat-resources` を 1.4.2 にダウングレードしました。

## [2.2.0] - 2022年8月16日 {id="2-2-0-august-16-2022"}

- **新機能**: 動画の再生時間に対するパーセンテージとして動画フレームを指定できるようにするため、`coil-video` に `ImageRequest.videoFramePercent` を追加しました。
- **新機能**: `BitmapFactoryDecoder` が EXIF の向きデータをどのように扱うかを設定するための `ExifOrientationPolicy` を追加しました。
- 修正: 定義されていない寸法のサイズが渡された場合に、`RoundedCornersTransformation` で例外がスローされないようにしました。
- 修正: GIF のフレーム遅延を 1 つの符号付きバイトではなく 2 つの符号なしバイトとして読み取るようにしました。
- Kotlin を 1.7.10 に更新しました。
- Coroutines を 1.6.4 に更新しました。
- Compose を 1.2.1 に更新しました。
- OkHttp を 4.10.0 に更新しました。
- Okio を 3.2.0 に更新しました。
- `accompanist-drawablepainter` を 0.25.1 に更新しました。
- `androidx.annotation` を 1.4.0 に更新しました。
- `androidx.appcompat:appcompat-resources` を 1.5.0 に更新しました。
- `androidx.core` を 1.8.0 に更新しました。

## [2.1.0] - 2022年5月17日 {id="2-1-0-may-17-2022"}

- **新機能**: `ByteArray` の読み込みをサポートしました。([#1202](https://github.com/coil-kt/coil/pull/1202))
- **新機能**: `ImageRequest.Builder.css` を使用した SVG へのカスタム CSS ルールの設定をサポートしました。([#1210](https://github.com/coil-kt/coil/pull/1210))
- 修正: `GenericViewTarget` のプライベートメソッドを protected に変更しました。([#1273](https://github.com/coil-kt/coil/pull/1273))
- コンパイル SDK を 32 に更新しました。([#1268](https://github.com/coil-kt/coil/pull/1268))

## [2.0.0] - 2022年5月10日 {id="2-0-0-may-10-2022"}

Coil 2.0.0 は本ライブラリのメジャーイテレーションであり、破壊的変更が含まれています。アップグレード方法については[アップグレードガイド](https://coil-kt.github.io/coil/upgrading/)を確認してください。

- **新機能**: `coil-compose` に `AsyncImage` を導入しました。詳細については[ドキュメント](https://coil-kt.github.io/coil/compose/)を確認してください。

```kotlin
// ネットワークから画像を表示します。
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
)

// プレースホルダー、円形切り抜き、クロスフェードアニメーションを指定してネットワークから画像を表示します。
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
    - ディスクキャッシュの設定には `ImageLoader.Builder.diskCache` および `DiskCache.Builder` を使用します。
    - Coil 2.0 では OkHttp の `Cache` を使用しないでください。詳細については[こちら](https://coil-kt.github.io/coil/upgrading_to_coil2/#disk-cache)を参照してください。
    - `Cache-Control` などのキャッシュヘッダーは引き続きサポートされますが、キャッシュは URL の一致のみをチェックするため、`Vary` ヘッダーは除きます。さらに、レスポンスコードが [200..300) の範囲にあるレスポンスのみがキャッシュされます。
    - 2.0 にアップグレードすると、既存のディスクキャッシュはクリアされます。
- 最小サポート API が 21 になりました。
- `ImageRequest` のデフォルトの `Scale` が `Scale.FIT` になりました。
    - これは、デフォルトの `Scale` を持つ他のクラスと `ImageRequest.scale` の一貫性を保つために変更されました。
    - `ImageViewTarget` を持つリクエストでは、引き続き `Scale` が自動検出されます。
- 画像パイプラインクラスの再設計:
    - `Mapper`、`Fetcher`、および `Decoder` をより柔軟になるようリファクタリングしました。
    - `Fetcher.key` は新しい `Keyer` インターフェースに置き換えられました。`Keyer` は入力データからキャッシュキーを作成します。
    - `Decoder` が Okio のファイルシステム API を使用して `File` を直接読み取れるようにする `ImageSource` を追加しました。
- Jetpack Compose 統合の再設計:
    - `rememberImagePainter` と `ImagePainter` の名前がそれぞれ `rememberAsyncImagePainter` と `AsyncImagePainter` に変更されました。
    - `LocalImageLoader` を非推奨にしました。詳細については非推奨メッセージを確認してください。
- 実行時の非 null アサーション生成を無効にしました。
    - Java を使用している場合、非 null アノテーションが付いた引数に null を渡しても、即座に `NullPointerException` がスローされなくなります。Kotlin のコンパイル時 null 安全性により、この発生が防がれます。
    - この変更により、ライブラリのサイズを小さく抑えることができます。
- `Size` は、幅と高さを表す 2 つの `Dimension` 値で構成されるようになりました。`Dimension` は正のピクセル値または `Dimension.Undefined` のいずれかになります。詳細については[こちら](https://coil-kt.github.io/coil/upgrading/#size-refactor)を参照してください。
- `BitmapPool` と `PoolableViewTarget` がライブラリから削除されました。
- `VideoFrameFileFetcher` と `VideoFrameUriFetcher` がライブラリから削除されました。代わりに、すべてのデータソースをサポートする `VideoFrameDecoder` を使用してください。
- [`BlurTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/BlurTransformation.kt) と [`GrayscaleTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/GrayscaleTransformation.kt) がライブラリから削除されました。これらを使用している場合は、コードをプロジェクト内にコピーできます。
- トランジションが完了するまで一時停止（suspend）する必要がなくなったため、`Transition.transition` を非中断（non-suspending）関数に変更しました。
- 処理中の `BitmapFactory` 操作の最大数を制限する `bitmapFactoryMaxParallelism` のサポートを追加しました。UI パフォーマンスを向上させるため、この値はデフォルトで 4 に設定されています。
- `interceptorDispatcher`、`fetcherDispatcher`、`decoderDispatcher`、および `transformationDispatcher` のサポートを追加しました。
- 一般的な `ViewTarget` のロジックを処理する `GenericViewTarget` を追加しました。
- デフォルトでサポートされるデータ型に `ByteBuffer` を追加しました。
- `Disposable` をリファクタリングし、基盤となる `ImageRequest` のジョブを公開するようにしました。
- `MemoryCache` API を再設計しました。
- `ImageRequest.fallback` が null の場合、`ImageRequest.error` が `Target` に設定されるようになりました。
- `Transformation.key` が `Transformation.cacheKey` に置き換えられました。
- Kotlin を 1.6.10 に更新しました。
- Compose を 1.1.1 に更新しました。
- OkHttp を 4.9.3 に更新しました。
- Okio を 3.0.0 に更新しました。

`2.0.0-rc03` からの変更点:
- `Dimension.Original` を `Dimension.Undefined` に変更しました。
    - これにより、サイズシステムにおけるいくつかのエッジケース（[例](https://github.com/coil-kt/coil/issues/1246)）を修正するために、非ピクセル寸法のセマンティクスがわずかに変更されます。
- ContentScale が None の場合、画像を `Size.ORIGINAL` で読み込むようにしました。
- `ImageView.load` のビルダー引数が最後ではなく最初に適用されていた問題を修正しました。
- レスポンスが変更されていない場合（304）に HTTP ヘッダーが結合されない問題を修正しました。

## [2.0.0-rc03] - 2022年4月11日 {id="2-0-0-rc03-april-11-2022"}

- `ScaleResolver` インターフェースを削除しました。
- `Size` のコンストラクタを関数に変更しました。
- `Dimension.Pixels` の `toString` がピクセル値のみを出力するように変更しました。
- `SystemCallbacks.onTrimMemory` における稀なクラッシュに対する保護を追加しました。
- Coroutines を 1.6.1 に更新しました。

## [2.0.0-rc02] - 2022年3月20日 {id="2-0-0-rc02-march-20-2022"}

- `ImageRequest` のデフォルトサイズを、`Size.ORIGINAL` ではなく現在のディスプレイのサイズに戻しました。
- `DiskCache.Builder` が誤って実験的としてマークされていた問題を修正しました。`DiskCache` のメソッドのみが実験的です。
- いずれかの寸法が `WRAP_CONTENT` である `ImageView` に画像を読み込む際、制限された寸法に画像を合わせるのではなく、元のサイズで読み込んでしまうケースを修正しました。
- `MemoryCache.Key`、`MemoryCache.Value`、および `Parameters.Entry` からコンポーネント関数（component functions）を削除しました。

## [2.0.0-rc01] - 2022年3月2日 {id="2-0-0-rc01-march-2-2022"}

`1.4.0` からの重要な変更点:

- 最小サポート API が 21 になりました。
- Jetpack Compose 統合の再設計。
    - `rememberImagePainter` の名前が `rememberAsyncImagePainter` に変更されました。
    - `AsyncImage` および `SubcomposeAsyncImage` のサポートを追加しました。詳細については[ドキュメント](https://coil-kt.github.io/coil/compose/)を確認してください。
    - `LocalImageLoader` を非推奨にしました。詳細については非推奨メッセージを確認してください。
- Coil 2.0 は独自のディスクキャッシュ実装を備えており、ディスクキャッシングにおいて OkHttp に依存しなくなりました。
    - ディスクキャッシュの設定には `ImageLoader.Builder.diskCache` および `DiskCache.Builder` を使用します。
    - スレッドへの書き込み中にスレッドが中断された場合にキャッシュが破損する可能性があるため、Coil 2.0 では OkHttp の `Cache` を**使用しないでください**。
    - `Cache-Control` などのキャッシュヘッダーは引き続きサポートされますが、キャッシュは URL の一致のみをチェックするため、`Vary` ヘッダーは除きます。さらに、レスポンスコードが [200..300) の範囲にあるレスポンスのみがキャッシュされます。
    - 2.0 にアップグレードすると、既存のディスクキャッシュはクリアされます。
- `ImageRequest` のデフォルトの `Scale` が `Scale.FIT` になりました。
    - これは、デフォルトの `Scale` を持つ他のクラスと `ImageRequest.scale` の一貫性を保つために変更されました。
    - `ImageViewTarget` を持つリクエストでは、引き続きスケールが自動検出されます。
- `ImageRequest` のデフォルトサイズが `Size.ORIGINAL` になりました。
- 画像パイプラインクラスの再設計:
    - `Mapper`、`Fetcher`、および `Decoder` をより柔軟になるようリファクタリングしました。
    - `Fetcher.key` は新しい `Keyer` インターフェースに置き換えられました。`Keyer` は入力データからキャッシュキーを作成します。
    - `Decoder` が `File` を直接デコードできるようにする `ImageSource` を追加しました。
- 実行時の非 null アサーション生成を無効にしました。
    - Java を使用している場合、非 null アノテーションが付いたパラメータに null を渡しても、即座に `NullPointerException` がスローされなくなります。Kotlin のコンパイル時 null 安全性により、この発生が防がれます。
    - この変更により、ライブラリのサイズを小さく抑えることができます。
- `Size` は、幅と高さを表す 2 つの `Dimension` 値で構成されるようになりました。`Dimension` は正のピクセル値または `Dimension.Original` のいずれかになります。
- `BitmapPool` と `PoolableViewTarget` がライブラリから削除されました。
- `VideoFrameFileFetcher` と `VideoFrameUriFetcher` がライブラリから削除されました。代わりに、すべてのデータソースをサポートする `VideoFrameDecoder` を使用してください。
- [`BlurTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/BlurTransformation.kt) と [`GrayscaleTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/GrayscaleTransformation.kt) がライブラリから削除されました。これらを使用している場合は、コードをプロジェクト内にコピーできます。
- トランジションが完了するまで一時停止する必要がなくなったため、`Transition.transition` を非中断関数に変更しました。
- 処理中の `BitmapFactory` 操作の最大数を制限する `bitmapFactoryMaxParallelism` のサポートを追加しました。UI パフォーマンスを向上させるため、この値はデフォルトで 4 に設定されています。
- `interceptorDispatcher`、`fetcherDispatcher`、`decoderDispatcher`、および `transformationDispatcher` のサポートを追加しました。
- 一般的な `ViewTarget` のロジックを処理する `GenericViewTarget` を追加しました。
- デフォルトでサポートされるデータ型に `ByteBuffer` を追加しました。
- `Disposable` をリファクタリングし、基盤となる `ImageRequest` のジョブを公開するようにしました。
- `MemoryCache` API を再設計しました。
- `ImageRequest.fallback` が null の場合、`ImageRequest.error` が `Target` に設定されるようになりました。
- `Transformation.key` が `Transformation.cacheKey` に置き換えられました。
- Kotlin を 1.6.10 に更新しました。
- Compose を 1.1.1 に更新しました。
- OkHttp を 4.9.3 に更新しました。
- Okio を 3.0.0 に更新しました。

`2.0.0-alpha09` からの変更点:

- `-Xjvm-default=all` コンパイラフラグを削除しました。
- must-revalidate/e-tag を持つ複数のリクエストが同時に実行された場合に、画像の読み込みに失敗する問題を修正しました。
- `<svg` タグの後に改行文字がある場合、`DecodeUtils.isSvg` が false を返す問題を修正しました。
- `LocalImageLoader.provides` の非推奨メッセージをより明確にしました。
- Compose を 1.1.1 に更新しました。
- `accompanist-drawablepainter` を 0.23.1 に更新しました。

## [2.0.0-alpha09] - 2022年2月16日 {id="2-0-0-alpha09-february-16-2022"}

- `AsyncImage` が無効な制約を生成する問題を修正しました。([#1134](https://github.com/coil-kt/coil/pull/1134))
- `AsyncImagePainter` に `ContentScale` 引数を追加しました。([#1144](https://github.com/coil-kt/coil/pull/1144))
    - 画像が正しいサイズで読み込まれるようにするため、これは `Image` に設定されている値と同じ値に設定する必要があります。
- `ImageRequest` の `Scale` を遅延解決するための `ScaleResolver` を追加しました。([#1134](https://github.com/coil-kt/coil/pull/1134))
    - `ImageRequest.scale` は `ImageRequest.scaleResolver.scale()` に置き換える必要があります。
- Compose を 1.1.0 に更新しました。
- `accompanist-drawablepainter` を 0.23.0 に更新しました。
- `androidx.lifecycle` を 2.4.1 に更新しました。

## [2.0.0-alpha08] - 2022年2月7日 {id="2-0-0-alpha08-february-7-2022"}

- Okio の `FileSystem` API を使用するように `DiskCache` と `ImageSource` を更新しました。([#1115](https://github.com/coil-kt/coil/pull/1115))

## [2.0.0-alpha07] - 2022年1月30日 {id="2-0-0-alpha07-january-30-2022"}

- `AsyncImage` のパフォーマンスを大幅に向上させ、`AsyncImage` を `AsyncImage` と `SubcomposeAsyncImage` に分割しました。([#1048](https://github.com/coil-kt/coil/pull/1048))
    - `SubcomposeAsyncImage` は `loading`/`success`/`error`/`content` スロット API を提供し、パフォーマンスが劣るサブコンポジションを使用します。
    - `AsyncImage` は、読み込み中やリクエスト失敗時に描画される `Painter` を上書きするための `placeholder`/`error`/`fallback` 引数を提供します。`AsyncImage` はサブコンポジションを使用しないため、`SubcomposeAsyncImage` よりも大幅にパフォーマンスが優れています。
    - `SubcomposeAsyncImage.content` から `AsyncImagePainter.State` 引数を削除しました。必要に応じて `painter.state` を使用してください。
    - `AsyncImage` と `SubcomposeAsyncImage` の両方に `onLoading`/`onSuccess`/`onError` コールバックを追加しました。
- `LocalImageLoader` を非推奨にしました。([#1101](https://github.com/coil-kt/coil/pull/1101))
- `ImageRequest.tags` のサポートを追加しました。([#1066](https://github.com/coil-kt/coil/pull/1066))
- `DecodeUtils` 内の `isGif`、`isWebP`、`isAnimatedWebP`、`isHeif`、および `isAnimatedHeif` を coil-gif に移動しました。coil-svg に `isSvg` を追加しました。([#1117](https://github.com/coil-kt/coil/pull/1117))
- `FetchResult` と `DecodeResult` を非データクラス（non-data class）に変更しました。([#1114](https://github.com/coil-kt/coil/pull/1114))
- 未使用の `DiskCache.Builder` のコンテキスト引数を削除しました。([#1099](https://github.com/coil-kt/coil/pull/1099))
- 元のサイズを持つビットマップリソースのスケーリングを修正しました。([#1072](https://github.com/coil-kt/coil/pull/1072))
- `ImageDecoderDecoder` で `ImageDecoder` のクローズに失敗する問題を修正しました。([#1109](https://github.com/coil-kt/coil/pull/1109))
- Drawable をビットマップに変換する際のスケーリングの誤りを修正しました。([#1084](https://github.com/coil-kt/coil/pull/1084))
- Compose を 1.1.0-rc03 に更新しました。
- `accompanist-drawablepainter` を 0.22.1-rc に更新しました。
- `androidx.appcompat:appcompat-resources` を 1.4.1 に更新しました。

## [2.0.0-alpha06] - 2021年12月24日 {id="2-0-0-alpha06-december-24-2021"}

- バッファリングや一時ファイルなしで、アセット、リソース、およびコンテンツ URI からのデコードをサポートする `ImageSource.Metadata` を追加しました。([#1060](https://github.com/coil-kt/coil/pull/1060))
- `AsyncImage` が正の制約を持つまで画像リクエストの実行を遅延させるようにしました。([#1028](https://github.com/coil-kt/coil/pull/1028))
- `loading`、`success`、`error` がすべて設定されている場合に `AsyncImage` で `DefaultContent` が使用される問題を修正しました。([#1026](https://github.com/coil-kt/coil/pull/1026))
- プラットフォームの `LruCache` の代わりに AndroidX の `LruCache` を使用するようにしました。([#1047](https://github.com/coil-kt/coil/pull/1047))
- Kotlin を 1.6.10 に更新しました。
- Coroutines を 1.6.0 に更新しました。
- Compose を 1.1.0-rc01 に更新しました。
- `accompanist-drawablepainter` を 0.22.0-rc に更新しました。
- `androidx.collection` を 1.2.0 に更新しました。

## [2.0.0-alpha05] - 2021年11月28日 {id="2-0-0-alpha05-november-28-2021"}

- **重要**: いずれかの寸法に対して画像の元のサイズを使用できるように `Size` をリファクタリングしました。
    - `Size` は、幅と高さを表す 2 つの `Dimension` 値で構成されるようになりました。`Dimension` は正のピクセル値または `Dimension.Original` のいずれかになります。
    - この変更は、一方の寸法が固定ピクセル値である場合に、制限のない幅/高さの値（`wrap_content`、`Constraints.Infinity` など）をより適切にサポートするために行われました。
- 修正: `AsyncImage` のインスペクションモード（プレビュー）をサポートしました。
- 修正: `imageLoader.memoryCache` が null の場合、`SuccessResult.memoryCacheKey` は常に `null` になるようにしました。
- `ImageLoader`、`SizeResolver`、および `ViewSizeResolver` のコンストラクタ風の `invoke` 関数をトップレベル関数に変更しました。
- `CrossfadeDrawable` の開始および終了 Drawable をパブリック API にしました。
- `ImageLoader` のプレースホルダー/エラー/フォールバック Drawable を mutate（状態の複製・分離）するようにしました。
- `SuccessResult` のコンストラクタにデフォルト引数を追加しました。
- `androidx.collection-ktx` の代わりに `androidx.collection` に依存するようにしました。
- OkHttp を 4.9.3 に更新しました。

## [2.0.0-alpha04] - 2021年11月22日 {id="2-0-0-alpha04-november-22-2021"}

- **新機能**: `coil-compose` に `AsyncImage` を追加しました。
    - `AsyncImage` は、`ImageRequest` を非同期に実行して結果をレンダリングするコンポーザブルです。
    - **`AsyncImage` は、ほとんどのユースケースで `rememberImagePainter` を置き換えることを目的としています。**
    - その API は最終確定されたものではなく、安定版 2.0 リリース前に変更される可能性があります。
    - `Image` と同様の API を備えており、`Alignment`、`ContentScale`、`alpha`、`ColorFilter`、`FilterQuality` といった同じ引数をサポートします。
    - `content`、`loading`、`success`、`error` の各引数を使用して、`AsyncImagePainter` の状態ごとに描画内容を上書きできます。
    - 画像のサイズとスケールの解決に関して `rememberImagePainter` が抱えていたいくつかの設計上の問題を修正しています。
    - 使用例:

```kotlin
// 画像のみを描画します。
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null, // 可能な限り `null` は避け、ローカライズされた文字列を設定してください。
)

// 円形切り抜き、クロスフェードを適用し、`loading` 状態を上書きして画像を描画します。
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

// 円形切り抜き、クロスフェードを適用し、すべての状態を上書きして画像を描画します。
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

- **重要**: `ImagePainter` の名前を `AsyncImagePainter` に、`rememberImagePainter` の名前を `rememberAsyncImagePainter` に変更しました。
    - `ExecuteCallback` はサポートされなくなりました。`AsyncImagePainter` に `onDraw` の呼び出し待機をスキップさせるには、代わりに `ImageRequest.size(OriginalSize)`（または任意のサイズ）を設定します。
    - `rememberAsyncImagePainter` にオプションの `FilterQuality` 引数を追加しました。
- `DiskCache` のクリーンアップ操作にコルーチンを使用するようにし、`DiskCache.Builder.cleanupDispatcher` を追加しました。
- `ImageLoader.Builder.placeholder` を使用して設定されたプレースホルダーの Compose プレビューを修正しました。
- より効率的なコードを生成するため、`LocalImageLoader.current` に `@ReadOnlyComposable` をマークしました。
- Compose を 1.1.0-beta03 に更新し、`compose.ui` ではなく `compose.foundation` に依存するようにしました。
- `androidx.appcompat-resources` を 1.4.0 に更新しました。

## [2.0.0-alpha03] - 2021年11月12日 {id="2-0-0-alpha03-november-12-2021"}

- Android 29 以上で音楽のサムネイルを読み込む機能を追加しました。([#967](https://github.com/coil-kt/coil/pull/967))
- 修正: 現在のパッケージのリソースを読み込むために `context.resources` を使用するようにしました。([#968](https://github.com/coil-kt/coil/pull/968))
- 修正: `clear` -> `dispose` の置換式を修正しました。([#970](https://github.com/coil-kt/coil/pull/970))
- Compose を 1.0.5 に更新しました。
- `accompanist-drawablepainter` を 0.20.2 に更新しました。
- Okio を 3.0.0 に更新しました。
- `androidx.annotation` を 1.3.0 に更新しました。
- `androidx.core` を 1.7.0 に更新しました。
- `androidx.lifecycle` を 2.4.0 に更新しました。
    - `lifecycle-common` に統合されたため、`lifecycle-common-java8` への依存関係を削除しました。

## [2.0.0-alpha02] - 2021年10月24日 {id="2-0-0-alpha02-october-24-2021"}

- [部品表（BOM: Bill of Materials）](https://docs.gradle.org/7.2/userguide/platforms.html#sub:bom_import)を含む新しい `coil-bom` アーティファクトを追加しました。
    - `coil-bom` をインポートすることで、バージョンを指定せずに他の Coil アーティファクトに依存できるようになります。
- `ExecuteCallback.Immediate` を使用した際に画像の読み込みに失敗する問題を修正しました。
- Okio を 3.0.0-alpha.11 に更新しました。
    - これにより、Okio 3.0.0-alpha.11 との互換性の問題も解決されます。
- Kotlin を 1.5.31 に更新しました。
- Compose を 1.0.4 に更新しました。

## [2.0.0-alpha01] - 2021年10月11日 {id="2-0-0-alpha01-october-11-2021"}

Coil 2.0.0 は本ライブラリの次のメジャーイテレーションであり、新機能、パフォーマンスの向上、API の改善、およびさまざまなバグ修正が含まれています。このリリースは、2.0.0 の安定版リリースまで、将来のアルファリリースとのバイナリ/ソース互換性がない可能性があります。

- **重要**: 最小サポート API が 21 になりました。
- **重要**: `-Xjvm-default=all` を有効化しました。
    - これにより、Kotlin のデフォルトインターフェースメソッドサポートを使用する代わりに、Java 8 のデフォルトメソッドが生成されます。詳細については[こちらのブログ記事](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/)を確認してください。
    - **ビルドファイルにも `-Xjvm-default=all` または `-Xjvm-default=all-compatibility` を追加する必要があります。** 設定方法については[こちら](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8)を参照してください。
- **重要**: Coil は独自のディスクキャッシュ実装を備えており、ディスクキャッシングにおいて OkHttp に依存しなくなりました。
    - この変更は以下の目的で行われました:
        - 画像のデコード中のスレッド中断をより適切にサポートするため。これにより、画像リクエストが連続して素早く開始・停止される場合のパフォーマンスが向上します。
        - `File` ベースの `ImageSource` の公開をサポートするため。これにより、デコードに `File` を必要とする Android API（`MediaMetadataRetriever` など）で不要なコピーを回避できます。
        - ディスクキャッシュファイルへの直接の読み取り/書き込みをサポートするため。
    - ディスクキャッシュの設定には `ImageLoader.Builder.diskCache` および `DiskCache.Builder` を使用します。
    - 書き込み中に中断されると破損する可能性があるため、Coil 2.0 では OkHttp の `Cache` を**使用しないでください**。
    - `Cache-Control` などのキャッシュヘッダーは引き続きサポートされますが、キャッシュは URL の一致のみをチェックするため、`Vary` ヘッダーは除きます。さらに、レスポンスコードが [200..300) の範囲にあるレスポンスのみがキャッシュされます。
    - キャッシュヘッダーのサポートは、`ImageLoader.Builder.respectCacheHeaders` を使用して有効または無効にできます。
    - 2.0 にアップグレードすると、既存のディスクキャッシュはクリアされて再構築されます。
- **重要**: `ImageRequest` のデフォルトの `Scale` が `Scale.FIT` になりました。
    - これは、デフォルトの `Scale` を持つ他のクラスと `ImageRequest.scale` の一貫性を保つために変更されました。
    - `ImageViewTarget` を持つリクエストでは、引き続きスケールが自動検出されます。
- 画像パイプラインクラスの重要な変更点:
    - `Mapper`、`Fetcher`、および `Decoder` をより柔軟になるようリファクタリングしました。
    - `Fetcher.key` は新しい `Keyer` インターフェースに置き換えられました。`Keyer` は入力データからキャッシュキーを作成します。
    - `Decoder` が `File` を直接デコードできるようにする `ImageSource` を追加しました。
- `BitmapPool` と `PoolableViewTarget` がライブラリから削除されました。ビットマッププーリングは以下の理由により削除されました:
    - API 23 以下で最も効果的であり、新しい Android リリースでは効果が薄れてきたため。
    - ビットマッププーリングを削除することで、パフォーマンス上の利点がある不変（immutable）ビットマップを Coil で使用できるようになるため。
    - ビットマッププールを管理するための実行時オーバーヘッドがあるため。
    - ビットマッププーリングは、ビットマップがプーリングに適格かどうかを追跡する必要があるため、Coil の API に設計上の制限が生じるため。ビットマッププーリングを削除することで、Coil はより多くの場所（`Listener`、`Disposable` など）で結果の `Drawable` を公開できるようになります。さらに、これにより Coil が `ImageView` をクリアする必要がなくなります（クリア処理は[問題](https://github.com/coil-kt/coil/issues/650)を引き起こす可能性がありました）。
    - ビットマッププーリングは[エラーが発生しやすい](https://github.com/coil-kt/coil/issues/546)ため。まだ使用されている可能性のあるビットマップを再利用しようとするよりも、新しいビットマップを割り当てる方がはるかに安全です。
- `MemoryCache` をより柔軟になるようリファクタリングしました。
- 実行時の非 null アサーション生成を無効にしました。
    - Java を使用している場合、非 null アノテーションが付いたパラメータに null を渡しても、即座に `NullPointerException` がスローされなくなります。Kotlin を使用している場合、実質的な変更はありません。
    - この変更により、ライブラリのサイズを小さく抑えることができます。
- `VideoFrameFileFetcher` と `VideoFrameUriFetcher` がライブラリから削除されました。代わりに、すべてのデータソースをサポートする `VideoFrameDecoder` を使用してください。
- 処理中の `BitmapFactory` 操作の最大数を制限する `bitmapFactoryMaxParallelism` のサポートを追加しました。UI パフォーマンスを向上させるため、この値はデフォルトで 4 に設定されています。
- `interceptorDispatcher`、`fetcherDispatcher`、`decoderDispatcher`、および `transformationDispatcher` のサポートを追加しました。
- `Disposable` をリファクタリングし、基盤となる `ImageRequest` のジョブを公開するようにしました。
- トランジションが完了するまで一時停止する必要がなくなったため、`Transition.transition` を非中断関数に変更しました。
- 一般的な `ViewTarget` のロジックを処理する `GenericViewTarget` を追加しました。
- [`BlurTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/BlurTransformation.kt) と [`GrayscaleTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/GrayscaleTransformation.kt) がライブラリから削除されました。
    - これらを使用している場合は、コードをプロジェクト内にコピーできます。
- `ImageRequest.fallback` が null の場合、`ImageRequest.error` が `Target` に設定されるようになりました。
- `Transformation.key` が `Transformation.cacheKey` に置き換えられました。
- `ImageRequest.Listener` は、`onSuccess` と `onError` でそれぞれ `SuccessResult`/`ErrorResult` を返すようになりました。
- デフォルトでサポートされるデータ型に `ByteBuffer` を追加しました。
- いくつかのクラスから `toString` 実装を削除しました。
- OkHttp を 4.9.2 に更新しました。
- Okio を 3.0.0-alpha.10 に更新しました。

## [1.4.0] - 2021年10月6日 {id="1-4-0-october-6-2021"}

- **新機能**: `ImagePainter.State.Success` および `ImagePainter.State.Error` に `ImageResult` を追加しました。([#887](https://github.com/coil-kt/coil/pull/887))
    - これは `ImagePainter.State.Success` および `ImagePainter.State.Error` のシグネチャに対するバイナリ非互換の変更ですが、これらの API は実験的としてマークされています。
- `View.isShown` が `true` の場合にのみ `CrossfadeTransition` を実行するようにしました。以前は `View.isVisible` のみをチェックしていました。([#898](https://github.com/coil-kt/coil/pull/898))
- 丸めの問題によりスケーリング乗数が 1 よりわずかに小さくなった場合に発生する可能性があったメモリキャッシュミスを修正しました。([#899](https://github.com/coil-kt/coil/pull/899))
- インライン化されていない `ComponentRegistry` メソッドをパブリックにしました。([#925](https://github.com/coil-kt/coil/pull/925))
- `accompanist-drawablepainter` に依存するようにし、Coil 独自の `DrawablePainter` 実装を削除しました。([#845](https://github.com/coil-kt/coil/pull/845))
- 脱糖（desugaring）の問題を防ぐため、Java 8 メソッドの使用を削除しました。([#924](https://github.com/coil-kt/coil/pull/924))
- `ImagePainter.ExecuteCallback` を安定した API に昇格させました。([#927](https://github.com/coil-kt/coil/pull/927))
- compileSdk を 31 に更新しました。
- Kotlin を 1.5.30 に更新しました。
- Coroutines を 1.5.2 に更新しました。
- Compose を 1.0.3 に更新しました。

## [1.3.2] - 2021年8月4日 {id="1-3-2-august-4-2021"}

- `coil-compose` が `compose.foundation` ではなく `compose.ui` に依存するようになりました。
    - `compose.ui` は `compose.foundation` のサブセットであるため、より軽量な依存関係です。
- Jetpack Compose を 1.0.1 に更新しました。
- Kotlin を 1.5.21 に更新しました。
- Coroutines を 1.5.1 に更新しました。
- `androidx.exifinterface:exifinterface` を 1.3.3 に更新しました。

## [1.3.1] - 2021年7月28日 {id="1-3-1-july-28-2021"}

- Jetpack Compose を `1.0.0` に更新しました。[安定版リリース](https://android-developers.googleblog.com/2021/07/jetpack-compose-announcement.html)を迎えた Compose チームに心よりお祝い申し上げます！
- `androidx.appcompat:appcompat-resources` を 1.3.1 に更新しました。

## [1.3.0] - 2021年7月10日 {id="1-3-0-july-10-2021"}

- **新機能**: [Jetpack Compose](https://developer.android.com/jetpack/compose) のサポートを追加しました。[Accompanist](https://github.com/google/accompanist/) の Coil 統合に基づていますが、いくつかの変更が加えられています。詳細については[ドキュメント](https://coil-kt.github.io/coil/compose/)を確認してください。
- `Transformation` のビットマップ自動変換を有効/無効にする `allowConversionToBitmap` を追加しました。([#775](https://github.com/coil-kt/coil/pull/775))
- GIF のフレーム遅延がしきい値を下回っている場合に書き換えを可能にする `enforceMinimumFrameDelay` を `ImageDecoderDecoder` と `GifDecoder` に追加しました。([#783](https://github.com/coil-kt/coil/pull/783))
    - これはデフォルトで無効になっていますが、将来のリリースでデフォルトで有効になる予定です。
- `ImageLoader` の内部ネットワークオブザーバーを有効/無効にするサポートを追加しました。([#741](https://github.com/coil-kt/coil/pull/741))
- `BitmapFactoryDecoder` によってデコードされたビットマップの密度を修正しました。([#776](https://github.com/coil-kt/coil/pull/776))
- Licensee が Coil のライセンス URL を見つけられない問題を修正しました。([#774](https://github.com/coil-kt/coil/pull/774))
- `androidx.core:core-ktx` を 1.6.0 に更新しました。

## [1.2.2] - 2021年6月4日 {id="1-2-2-june-4-2021"}

- 共有状態を持つ Drawable をビットマップに変換する際の競合状態を修正しました。([#771](https://github.com/coil-kt/coil/pull/771))
- `ImageLoader.Builder.fallback` が `fallback` Drawable ではなく `error` Drawable を設定してしまう問題を修正しました。
- `ResourceUriFetcher` によって返される誤ったデータソースを修正しました。([#770](https://github.com/coil-kt/coil/pull/770))
- API 26 および 27 で利用可能なファイル記述子がない場合のログチェックを修正しました。
- プラットフォームベクター Drawable サポートの誤ったバージョンチェックを修正しました。([#751](https://github.com/coil-kt/coil/pull/751))
- Kotlin を更新しました (1.5.10)。
- Coroutines を更新しました (1.5.0)。
- `androidx.appcompat:appcompat-resources` を 1.3.0 に更新しました。
- `androidx.core:core-ktx` を 1.5.0 に更新しました。

## [1.2.1] - 2021年4月27日 {id="1-2-1-april-27-2021"}

- `VideoFrameUriFetcher` が http/https URI を処理しようとする問題を修正しました。([#734](https://github.com/coil-kt/coil/pull/734))

## [1.2.0] - 2021年4月12日 {id="1-2-0-april-12-2021"}

- **重要**: `SvgDecoder` でアスペクト比を計算するために、SVG のビュー境界（view bounds）を使用するようにしました。([#688](https://github.com/coil-kt/coil/pull/688))
    - 以前は、`SvgDecoder` はアスペクト比を決定するために SVG の `width`/`height` 要素を使用していましたが、これは SVG 仕様に正しく準拠していませんでした。
    - 以前の動作に戻すには、`SvgDecoder` の構築時に `useViewBoundsAsIntrinsicSize = false` を設定してください。
- **新機能**: あらゆるソースからの動画フレームのデコードをサポートする `VideoFrameDecoder` を追加しました。([#689](https://github.com/coil-kt/coil/pull/689))
- **新機能**: MIME タイプだけでなく、ソースの内容を使用した SVG の自動検出をサポートしました。([#654](https://github.com/coil-kt/coil/pull/654))
- **新機能**: `ImageLoader.newBuilder()` を使用したリソースの共有をサポートしました。([#653](https://github.com/coil-kt/coil/pull/653))
    - 重要な点として、これにより `ImageLoader` インスタンス間でメモリキャッシュを共有できるようになります。
- **新機能**: `AnimatedTransformation` を使用したアニメーション画像の変換のサポートを追加しました。([#659](https://github.com/coil-kt/coil/pull/659))
- **新機能**: アニメーション Drawable の開始/終了コールバックのサポートを追加しました。([#676](https://github.com/coil-kt/coil/pull/676))

---

- HEIF/HEIC ファイルの EXIF データの解析を修正しました。([#664](https://github.com/coil-kt/coil/pull/664))
- ビットマッププーリングが無効になっている場合に `EmptyBitmapPool` 実装を使用しない問題を修正しました。([#638](https://github.com/coil-kt/coil/pull/638))
    - この修正がなくてもビットマッププーリングは適切に無効化されていましたが、より重量級の `BitmapPool` 実装が使用されていました。
- `MovieDrawable.getOpacity` が誤って透明を返すケースを修正しました。([#682](https://github.com/coil-kt/coil/pull/682))
- デフォルトの一時ディレクトリが存在しない場合の保護を追加しました。([#683](https://github.com/coil-kt/coil/pull/683))

---

- JVM IR バックエンドを使用してビルドするようにしました。([#670](https://github.com/coil-kt/coil/pull/670))
- Kotlin を更新しました (1.4.32)。
- Coroutines を更新しました (1.4.3)。
- OkHttp を更新しました (3.12.13)。
- `androidx.lifecycle:lifecycle-common-java8` を 2.3.1 に更新しました。

## [1.1.1] - 2021年1月11日 {id="1-1-1-january-11-2021"}

- コルーチンが複数回再開されることにより、`ViewSizeResolver.size` が `IllegalStateException` をスローする可能性があったケースを修正しました。
- メインスレッドから呼び出された場合に `HttpFetcher` が永久にブロックされる問題を修正しました。
    - `ImageRequest.dispatcher(Dispatchers.Main.immediate)` を使用してメインスレッドでの実行が強制されたリクエストは、`ImageRequest.networkCachePolicy` が `CachePolicy.DISABLED` または `CachePolicy.WRITE_ONLY` に設定されていない限り、`NetworkOnMainThreadException` で失敗します。
- 動画に回転メタデータがある場合、`VideoFrameFetcher` からの動画フレームを回転させるようにしました。
- Kotlin を更新しました (1.4.21)。
- Coroutines を更新しました (1.4.2)。
- Okio を更新しました (2.10.0)。
- `androidx.exifinterface:exifinterface` を更新しました (1.3.2)。

## [1.1.0] - 2020年11月24日 {id="1-1-0-november-24-2020"}

- **重要**: `ImageView` のスケールタイプ `CENTER` および `MATRIX` が `OriginalSize` に解決されるように変更しました。([#587](https://github.com/coil-kt/coil/pull/587))
    - この変更は、リクエストのサイズが明示的に指定されていない場合の暗黙的なサイズ解決アルゴリズムにのみ影響します。
    - この変更は、画像リクエストの視覚的な結果が `ImageView.setImageResource`/`ImageView.setImageURI` と一致することを保証するために行われました。以前の動作に戻すには、リクエストの作成時に `ViewSizeResolver` を設定してください。
- **重要**: ビューのレイアウトパラメータが `WRAP_CONTENT` の場合、`ViewSizeResolver` からディスプレイサイズを返すようにしました。([#562](https://github.com/coil-kt/coil/pull/562))
    - 以前は、ビューが完全にレイアウトされた場合にのみディスプレイサイズを返していました。この変更により、一般的な動作の整合性と直感性が向上します。
- アルファ乗算済み（alpha pre-multiplication）を制御する機能を追加しました。([#569](https://github.com/coil-kt/coil/pull/569))
- `CrossfadeDrawable` で正確な固有サイズを優先する設定をサポートしました。([#585](https://github.com/coil-kt/coil/pull/585))
- バージョンを含む完全な GIF ヘッダーをチェックするようにしました。([#564](https://github.com/coil-kt/coil/pull/564))
- 空のビットマッププール実装を追加しました。([#561](https://github.com/coil-kt/coil/pull/561))
- `EventListener.Factory` を関数型インターフェースにしました。([#575](https://github.com/coil-kt/coil/pull/575))
- `EventListener` を安定化しました。([#574](https://github.com/coil-kt/coil/pull/574))
- `ImageRequest.Builder.placeholderMemoryCacheKey` の `String` オーバーロードを追加しました。
- `ViewSizeResolver` コンストラクタに `@JvmOverloads` を追加しました。
- 修正: `CrossfadeDrawable` の開始/終了 Drawable を mutate するようにしました。([#572](https://github.com/coil-kt/coil/pull/572))
- 修正: 2 回目の読み込みで GIF が再生されない問題を修正しました。([#577](https://github.com/coil-kt/coil/pull/534))
- Kotlin を更新し (1.4.20)、`kotlin-parcelize` プラグインに移行しました。
- Coroutines を更新しました (1.4.1)。

## [1.0.0] - 2020年10月22日 {id="1-0-0-october-22-2020"}

`0.13.0` からの変更点:
- `Context.imageLoader` 拡張関数を追加しました。([#534](https://github.com/coil-kt/coil/pull/534))
- `ImageLoader.executeBlocking` 拡張関数を追加しました。([#537](https://github.com/coil-kt/coil/pull/537))
- シングルトンのイメージローダーが置き換えられた場合に、以前のイメージローダーをシャットダウンしないようにしました。([#533](https://github.com/coil-kt/coil/pull/533))

`1.0.0-rc3` からの変更点:
- 修正: ActivityManager が欠落している、または無効な場合の保護を追加しました。([#541](https://github.com/coil-kt/coil/pull/541))
- 修正: OkHttp が失敗したレスポンスをキャッシュできるようにしました。([#551](https://github.com/coil-kt/coil/pull/551))
- Kotlin を 1.4.10 に更新しました。
- Okio を 2.9.0 に更新しました。
- `androidx.exifinterface:exifinterface` を 1.3.1 に更新しました。

## [1.0.0-rc3] - 2020年9月21日 {id="1-0-0-rc3-september-21-2020"}

- 不安定性を理由に、[`-Xjvm-default=all`](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/) コンパイラフラグの使用を元に戻しました。
    - **これは以前のリリース候補版とソース互換性がありますが、バイナリ非互換の変更です。**
- `Context.imageLoader` 拡張関数を追加しました。([#534](https://github.com/coil-kt/coil/pull/534))
- `ImageLoader.executeBlocking` 拡張関数を追加しました。([#537](https://github.com/coil-kt/coil/pull/537))
- シングルトンのイメージローダーが置き換えられた場合に、以前のイメージローダーをシャットダウンしないようにしました。([#533](https://github.com/coil-kt/coil/pull/533))
- AndroidX の依存関係を更新しました:
    - `androidx.exifinterface:exifinterface` -> 1.3.0

## [1.0.0-rc2] - 2020年9月3日 {id="1-0-0-rc2-september-3-2020"}

- **このリリースには Kotlin 1.4.0 以上が必要です。**
- [0.13.0](#0130-september-3-2020) に存在するすべての変更が含まれます。
- `stdlib-jdk8` ではなくベースの Kotlin `stdlib` に依存するようにしました。

## [0.13.0] - 2020年9月3日 {id="0-13-0-september-3-2020"}

- **重要**: デフォルトで Interceptor チェーンをメインスレッドで起動するようにしました。([#513](https://github.com/coil-kt/coil/pull/513))
    - これにより、メモリキャッシュがメインスレッド上で同期的にチェックされていた `0.11.0` 以前の動作がほぼ復元されます。
    - メモリキャッシュが `ImageRequest.dispatcher` 上でチェックされる `0.12.0` と同じ動作に戻すには、`ImageLoader.Builder.launchInterceptorChainOnMainThread(false)` を設定します。
    - 詳細については [`launchInterceptorChainOnMainThread`](https://coil-kt.github.io/coil/api/coil-core/coil3/-image-loader/-builder/launch-interceptor-chain-on-main-thread/) を参照してください。

---

- 修正: デタッチされたフラグメント内の `ViewTarget` でリクエストが開始された場合に、メモリリークが発生する可能性があった問題を修正しました。([#518](https://github.com/coil-kt/coil/pull/518))
- 修正: リソース URI を読み込むために `ImageRequest.context` を使用するようにしました。([#517](https://github.com/coil-kt/coil/pull/517))
- 修正: 後続のリクエストがディスクキャッシュに保存されない原因となっていた競合状態を修正しました。([#510](https://github.com/coil-kt/coil/pull/510))
- 修正: API 18 で `blockCountLong` と `blockSizeLong` を使用するようにしました。

---

- `ImageLoaderFactory` を fun インターフェースにしました。
- `File` から読み込まれた画像のメモリキャッシュキーに最終更新タイムスタンプを追加することを有効/無効にできる `ImageLoader.Builder.addLastModifiedToFileCacheKey` を追加しました。

---

- Kotlin を 1.4.0 に更新しました。
- Coroutines を 1.3.9 に更新しました。
- Okio を 2.8.0 に更新しました。

## [1.0.0-rc1] - 2020年8月18日 {id="1-0-0-rc1-august-18-2020"}

- **このリリースには Kotlin 1.4.0 以上が必要です。**
- Kotlin を 1.4.0 に更新し、[`-Xjvm-default=all`](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/) を有効にしました。
    - **ビルドファイルで `-Xjvm-default=all` を有効にする方法については[こちらを参照してください](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8)。**
    - これにより、Kotlin のデフォルトインターフェースメソッドに対して Java 8 のデフォルトメソッドが生成されます。
- 0.12.0 に存在していたすべての非推奨メソッドを削除しました。
- Coroutines を 1.3.9 に更新しました。

## [0.12.0] - 2020年8月18日 {id="0-12-0-august-18-2020"}

- **破壊的変更**: `LoadRequest` と `GetRequest` は `ImageRequest` に置き換えられました:
    - `ImageLoader.execute(LoadRequest)` -> `ImageLoader.enqueue(ImageRequest)`
    - `ImageLoader.execute(GetRequest)` -> `ImageLoader.execute(ImageRequest)`
    - `ImageRequest` は `equals`/`hashCode` を実装しています。
- **破壊的変更**: 多くのクラスの名前変更やパッケージ変更が行われました:
    - `coil.request.RequestResult` -> `coil.request.ImageResult`
    - `coil.request.RequestDisposable` -> `coil.request.Disposable`
    - `coil.bitmappool.BitmapPool` -> `coil.bitmap.BitmapPool`
    - `coil.DefaultRequestOptions` -> `coil.request.DefaultRequestOptions`
- **破壊的変更**: [`SparseIntArraySet`](https://github.com/coil-kt/coil/blob/f52addd039f0195b66f93cb0f1cad59b0832f784/coil-core/src/main/java/coil/collection/SparseIntArraySet.kt) がパブリック API から削除されました。
- **破壊的変更**: `TransitionTarget` は `ViewTarget` を実装しなくなりました。
- **破壊的変更**: `ImageRequest.Listener.onSuccess` のシグネチャが変更され、単なる `DataSource` ではなく `ImageResult.Metadata` を返すようになりました。
- **破壊的変更**: `LoadRequest.aliasKeys` のサポートを削除しました。この API は、メモリキャッシュへの直接の読み書きアクセスによってより適切に処理されます。

---

- **重要**: メモリキャッシュ内の値は、（メインスレッドから呼び出された場合でも）同期的に解決されなくなりました。
    - この変更は、バックグラウンドディスパッチャーでの `Interceptor` の実行をサポートするためにも必要でした。
    - また、この変更により、より多くの処理がメインスレッド外に移動し、パフォーマンスが向上します。
- **重要**: `Mapper` はバックグラウンドディスパッチャーで実行されるようになりました。その副作用として、ビットマップの自動サンプリングは**自動的には**サポートされなくなりました。同じ効果を得るには、前のリクエストの `MemoryCache.Key` を後続のリクエストの `placeholderMemoryCacheKey` として使用します。[例についてはこちらを参照してください](https://coil-kt.github.io/coil/recipes#using-a-memory-cache-key-as-a-placeholder)。
    - `placeholderMemoryCacheKey` API は、異なるデータを持つ 2 つの画像リクエスト（小サイズ画像と大サイズ画像で異なる URL など）を「リンク」できるため、より自由度が高くなります。
- **重要**: Coil の `ImageView` 拡張関数が `coil.api` パッケージから `coil` パッケージに移動しました。
    - 検索と置換を使用して、`import coil.api.load` -> `import coil.load` にリファクタリングしてください。残念ながら、インポートを置換するために Kotlin の `ReplaceWith` 機能を使用することはできません。
- **重要**: Drawable が同じ画像でない場合は、標準のクロスフェードを使用するようにしました。
- **重要**: API 24 以上では不変ビットマップを優先するようにしました。
- **重要**: `MeasuredMapper` は非推奨となり、新しい `Interceptor` インターフェースが推奨されます。`MeasuredMapper` を `Interceptor` に変換する方法の例については、[こちら](https://gist.github.com/colinrtwhite/90267704091467451e46b21b95154299)を参照してください。
    - `Interceptor` は、より幅広いカスタムロジックを可能にする、制約の少ない API です。
- **重要**: `ImageRequest.data` は非 null になりました。データを設定せずに `ImageRequest` を作成した場合、そのデータとして `NullRequestData` が返されます。

---

- **新機能**: `ImageLoader` の `MemoryCache` への直接の読み取り/書き込みアクセスのサポートを追加しました。詳細については[ドキュメント](https://coil-kt.github.io/coil/getting_started/#memory-cache)を参照してください。
- **新機能**: `Interceptor` のサポートを追加しました。詳細については[ドキュメント](https://coil-kt.github.io/coil/image_pipeline/#interceptors)を参照してください。Coil の `Interceptor` 設計は、[OkHttp](https://github.com/square/okhttp) から強い影響を受けています！
- **新機能**: `ImageLoader.Builder.bitmapPoolingEnabled` を使用してビットマッププーリングを有効/無効にする機能を追加しました。
    - ビットマッププーリングは API 23 以下で最も効果的ですが、API 24 以上でも（積極的に `Bitmap.recycle` を呼び出すことによって）有益な場合があります。
- **新機能**: デコード中のスレッド中断をサポートしました。

---

- Content-Type ヘッダー内の複数セグメントの解析を修正しました。
- ビットマップの参照カウントをより堅牢になるよう再構築しました。
- API < 19 のデバイスでの WebP デコードを修正しました。
- EventListener API で FetchResult と DecodeResult を公開しました。

---

- SDK 30 でコンパイルしました。
- Coroutines を 1.3.8 に更新しました。
- OkHttp を 3.12.12 に更新しました。
- Okio を 2.7.0 に更新しました。
- AndroidX の依存関係を更新しました:
    - `androidx.appcompat:appcompat-resources` -> 1.2.0
    - `androidx.core:core-ktx` -> 1.3.1

## [0.11.0] - 2020年5月14日 {id="0-11-0-may-14-2020"}

- **破壊的変更**: **このバージョンでは、既存のすべての非推奨関数が削除されます。**
    - これにより、アプリ起動時にコードを実行しないよう、Coil の `ContentProvider` を削除できるようになります。
- **破壊的変更**: `SparseIntArraySet.size` を val に変更しました。([#380](https://github.com/coil-kt/coil/pull/380))
- **破壊的変更**: `Parameters.count()` を拡張関数に移動しました。([#403](https://github.com/coil-kt/coil/pull/403))
- **破壊的変更**: `BitmapPool.maxSize` を Int に変更しました。([#404](https://github.com/coil-kt/coil/pull/404))

---

- **重要**: `ImageLoader.shutdown()` を（`OkHttpClient` と同様に）オプションにしました。([#385](https://github.com/coil-kt/coil/pull/385))

---

- 修正: AGP 4.1 との互換性を修正しました。([#386](https://github.com/coil-kt/coil/pull/386))
- 修正: GONE のビューの計測を修正しました。([#397](https://github.com/coil-kt/coil/pull/397))

---

- デフォルトのメモリキャッシュサイズを 20% に縮小しました。([#390](https://github.com/coil-kt/coil/pull/390))
    - 既存の動作に戻すには、`ImageLoader` の作成時に `ImageLoaderBuilder.availableMemoryPercentage(0.25)` を設定します。
- Coroutines を 1.3.6 に更新しました。
- OkHttp を 3.12.11 に更新しました。

## [0.10.1] - 2020年4月26日 {id="0-10-1-april-26-2020"}

- API 23 以下で大きな PNG をデコードする際の OOM（メモリ不足）を修正しました。([#372](https://github.com/coil-kt/coil/pull/372))
    - これにより、PNG ファイルに対する EXIF の向きのデコードが無効になります。PNG の EXIF の向きはめったに使用されず、PNG の EXIF データの読み取り（空の場合でも）はファイル全体をメモリにバッファリングする必要があるため、パフォーマンスに悪影響を与えます。
- `SparseIntArraySet` に対する Java 互換性の軽微な改善を行いました。

---

- Okio を 2.6.0 に更新しました。

## [0.10.0] - 2020年4月20日 {id="0-10-0-april-20-2020"}

### ハイライト {id="highlights"}

- **このバージョンでは、ビルダーを直接使用することを推奨し、ほとんどの DSL API を非推奨としました。** 変更内容は以下のとおりです:

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

- **`ImageLoader` に弱参照メモリキャッシュが導入されました**。これは、強参照メモリキャッシュから破棄（evict）された後の画像への弱参照を追跡します。
    - これにより、画像への強参照がまだ存在していれば、`ImageLoader` のメモリキャッシュから常に画像が返されるようになります。
    - 一般的に、これによりメモリキャッシュの予測可能性が大幅に向上し、ヒット率が高くなります。
    - この動作は `ImageLoaderBuilder.trackWeakReferences` で有効/無効を切り替えることができます。

- 動画ファイルから特定のフレームをデコードするための新しいアーティファクト **`io.coil-kt:coil-video`** を追加しました。[詳細についてはこちらをご覧ください](https://coil-kt.github.io/coil/videos/)。

- メトリクスを追跡するための新しい [EventListener](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/EventListener.kt) API を追加しました。

- シングルトンの初期化を簡素化するために、`Application` で実装可能な [ImageLoaderFactory](https://github.com/coil-kt/coil/blob/main/coil/src/main/java/coil/ImageLoaderFactory.kt) を追加しました。

---

### リリースノート全文 {id="full-release-notes"}

- **重要**: DSL 構文を非推奨とし、ビルダー構文を推奨としました。([#267](https://github.com/coil-kt/coil/pull/267))
- **重要**: `Coil` および `ImageLoader` の拡張関数を非推奨としました。([#322](https://github.com/coil-kt/coil/pull/322))
- **破壊的変更**: `ImageLoader.execute(GetRequest)` から sealed な `RequestResult` 型を返すようにしました。([#349](https://github.com/coil-kt/coil/pull/349))
- **破壊的変更**: `ExperimentalCoil` の名前を `ExperimentalCoilApi` に変更しました。`@Experimental` から `@RequiresOptIn` に移行しました。([#306](https://github.com/coil-kt/coil/pull/306))
- **破壊的変更**: `CoilLogger` を `Logger` インターフェースに置き換えました。([#316](https://github.com/coil-kt/coil/pull/316))
- **破壊的変更**: destWidth/destHeight の名前を dstWidth/dstHeight に変更しました。([#275](https://github.com/coil-kt/coil/pull/275))
- **破壊的変更**: `MovieDrawable` のコンストラクタパラメータの順序を変更しました。([#272](https://github.com/coil-kt/coil/pull/272))
- **破壊的変更**: `Request.Listener` のメソッドは、データだけでなく完全な `Request` オブジェクトを受け取るようになりました。
- **破壊的変更**: `GetRequestBuilder` のコンストラクタに `Context` が必須になりました。
- **破壊的変更**: `Request` のいくつかのプロパティが nullable になりました。
- **動作の変更**: デフォルトでパラメータ値をキャッシュキーに含めるようにしました。([#319](https://github.com/coil-kt/coil/pull/319))
- **動作の変更**: `Target.onStart()` の直後に呼び出されるよう、`Request.Listener.onStart()` のタイミングをわずかに調整しました。([#348](https://github.com/coil-kt/coil/pull/348))

---

- **新機能**: `WeakMemoryCache` 実装を追加しました。([#295](https://github.com/coil-kt/coil/pull/295))
- **新機能**: 動画フレームのデコードをサポートする `coil-video` を追加しました。([#122](https://github.com/coil-kt/coil/pull/122))
- **新機能**: [`EventListener`](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/EventListener.kt) を導入しました。([#314](https://github.com/coil-kt/coil/pull/314))
- **新機能**: [`ImageLoaderFactory`](https://github.com/coil-kt/coil/blob/main/coil/src/main/java/coil/ImageLoaderFactory.kt) を導入しました。([#311](https://github.com/coil-kt/coil/pull/311))
- **新機能**: Android 11 でアニメーション HEIF 画像シーケンスをサポートしました。([#297](https://github.com/coil-kt/coil/pull/297))
- **新機能**: Java との互換性を改善しました。([#262](https://github.com/coil-kt/coil/pull/262))
- **新機能**: デフォルトの `CachePolicy` の設定をサポートしました。([#307](https://github.com/coil-kt/coil/pull/307))
- **新機能**: デフォルトの `Bitmap.Config` の設定をサポートしました。([#342](https://github.com/coil-kt/coil/pull/342))
- **新機能**: 単一のメモリキャッシュ項目をクリアするための `ImageLoader.invalidate(key)` を追加しました。([#55](https://github.com/coil-kt/coil/pull/55))
- **新機能**: キャッシュされた画像が再利用されない理由を説明するデバッグログを追加しました。([#346](https://github.com/coil-kt/coil/pull/346))
- **新機能**: get リクエストでの `error` および `fallback` Drawable をサポートしました。

---

- 修正: Transformation によって入力ビットマップのサイズが縮小された場合のメモリキャッシュミスを修正しました。([#357](https://github.com/coil-kt/coil/pull/357))
- 修正: BlurTransformation において半径が RenderScript の最大値未満であることを保証するようにしました。([#291](https://github.com/coil-kt/coil/pull/291))
- 修正: 高色深度の画像のデコードを修正しました。([#358](https://github.com/coil-kt/coil/pull/358))
- 修正: Android 11 以上で `ImageDecoderDecoder` のクラッシュ回避策を無効にしました。([#298](https://github.com/coil-kt/coil/pull/298))
- 修正: API 23 未満での EXIF データの読み取り失敗を修正しました。([#331](https://github.com/coil-kt/coil/pull/331))
- 修正: Android R SDK との非互換性を修正しました。([#337](https://github.com/coil-kt/coil/pull/337))
- 修正: `ImageView` に一致する `SizeResolver` がある場合にのみ不正確なサイズ（inexact size）を有効にするようにしました。([#344](https://github.com/coil-kt/coil/pull/344))
- 修正: キャッシュされた画像が要求されたサイズから最大 1 ピクセルずれることを許容するようにしました。([#360](https://github.com/coil-kt/coil/pull/360))
- 修正: ビューが表示されていない場合はクロスフェードトランジションをスキップするようにしました。([#361](https://github.com/coil-kt/coil/pull/361))

---

- `CoilContentProvider` を非推奨にしました。([#293](https://github.com/coil-kt/coil/pull/293))
- いくつかの `ImageLoader` メソッドに `@MainThread` アノテーションを付加しました。
- ライフサイクルが現在開始されている場合は、`LifecycleCoroutineDispatcher` の作成を避けるようにしました。([#356](https://github.com/coil-kt/coil/pull/356))
- `OriginalSize.toString()` で完全修飾パッケージ名を使用するようにしました。
- ソフトウェアビットマップのデコード時に事前割り当てを行うようにしました。([#354](https://github.com/coil-kt/coil/pull/354))

---

- Kotlin を 1.3.72 に更新しました。
- Coroutines を 1.3.5 に更新しました。
- OkHttp を 3.12.10 に更新しました。
- Okio を 2.5.0 に更新しました。
- AndroidX の依存関係を更新しました:
    - `androidx.exifinterface:exifinterface` -> 1.2.0

## [0.9.5] - 2020年2月6日 {id="0-9-5-february-6-2020"}

- 修正: ハードウェアアクセラレーションが有効かどうかを確認する前に、ビューがアタッチされていることを確認するようにしました。これにより、ハードウェアビットマップを要求したときにメモリキャッシュをミスするケースが修正されます。

---

- AndroidX の依存関係を更新しました:
    - `androidx.core:core-ktx` -> 1.2.0

## [0.9.4] - 2020年2月3日 {id="0-9-4-february-3-2020"}

- 修正: ImageDecoderDecoder でダウンサンプリングする際のアスペクト比を尊重するようにしました。@zhanghai に感謝します。

---

- 以前は、キャッシュされたビットマップの設定（config）がリクエストで指定された設定以上であれば、メモリキャッシュから返されていました。たとえば、`ARGB_8888` のビットマップを要求した場合、メモリキャッシュから `RGBA_F16` のビットマップが返される可能性がありました。今後は、キャッシュされた設定と要求された設定が等しい必要があります。
- `CrossfadeDrawable` および `CrossfadeTransition` の `scale` と `durationMillis` をパブリックにしました。

## [0.9.3] - 2020年2月1日 {id="0-9-3-february-1-2020"}

- 修正: `ScaleDrawable` 内の子 Drawable を確実に中央揃えにするよう平行移動（translate）するようにしました。
- 修正: GIF および SVG が境界を完全に埋めないケースを修正しました。

---

- `HttpUrl.get()` の呼び出しをバックグラウンドスレッドに遅延させました。
- BitmapFactory の null ビットマップエラーメッセージを改善しました。
- ハードウェアビットマップのブラックリストに 3 つのデバイスを追加しました。([#264](https://github.com/coil-kt/coil/pull/264))

---

- AndroidX の依存関係を更新しました:
    - `androidx.lifecycle:lifecycle-common-java8` -> 2.2.0

## [0.9.2] - 2020年1月19日 {id="0-9-2-january-19-2020"}

- 修正: API 19 未満での GIF のデコードを修正しました。@mario に感謝します。
- 修正: ラスター化されたベクター Drawable がサンプリング済みとしてマークされない問題を修正しました。
- 修正: Movie の寸法が 0 以下の場合は例外をスローするようにしました。
- 修正: メモリキャッシュイベントに対して CrossfadeTransition が再開されない問題を修正しました。
- 修正: 許可されていない場合、すべてのターゲットメソッドにハードウェアビットマップが返されないようにしました。
- 修正: MovieDrawable が境界の中央に配置されない問題を修正しました。

---

- CrossfadeDrawable から自動スケーリングを削除しました。
- `BitmapPool.trimMemory` をパブリックにしました。
- 境界を確実に埋めるよう、AnimatedImageDrawable を ScaleDrawable でラップしました。
- RequestBuilder.setParameter に @JvmOverloads を追加しました。
- ビューボックスが設定されていない場合、SVG のビューボックスをそのサイズに設定するようにしました。
- 状態とレベルの変更を CrossfadeDrawable の子に渡すようにしました。

---

- OkHttp を 3.12.8 に更新しました。

## [0.9.1] - 2019年12月30日 {id="0-9-1-december-30-2019"}

- 修正: `LoadRequestBuilder.crossfade(false)` を呼び出した際のクラッシュを修正しました。

## [0.9.0] - 2019年12月30日 {id="0-9-0-december-30-2019"}

- **破壊的変更**: `Transformation.transform` に `Size` パラメータが含まれるようになりました。これは、`Target` のサイズに基づいて出力 `Bitmap` のサイズを変更する transformation をサポートするためです。また、transformation を含むリクエストは[画像サンプリング](https://coil-kt.github.io/coil/getting_started/#image-sampling)の対象外となります。
- **破壊的変更**: `Transformation` があらゆるタイプの `Drawable` に適用されるようになりました。以前は、入力 `Drawable` が `BitmapDrawable` でない場合、`Transformation` はスキップされていました。今後は、`Transformation` を適用する前に `Drawable` が `Bitmap` にレンダリングされます。
- **破壊的変更**: `ImageLoader.load` に `null` データを渡すことはエラーとして扱われるようになり、`NullRequestDataException` と共に `Target.onError` および `Request.Listener.onError` が呼び出されます。この変更は、データが `null` の場合に `fallback` Drawable を設定できるようにするために行われました。以前は、リクエストは暗黙的に無視されていました。
- **破壊的変更**: `RequestDisposable.isDisposed` が `val` になりました。

---

- **新機能**: カスタムトランジションのサポート。[詳細についてはこちらを参照してください](https://coil-kt.github.io/coil/transitions/)。API の仕様検討中のため、トランジションは実験的としてマークされています。
- **新機能**: `LoadRequest` の処理中に中断（suspend）できるようにするため、`RequestDisposable.await` を追加しました。
- **新機能**: リクエストデータが null の場合に `fallback` Drawable を設定する機能をサポートしました。
- **新機能**: `Precision` を追加しました。これにより、スケーリングをサポートするターゲット（`ImageViewTarget` など）に対するスケーリングの最適化を有効にしながら、出力 `Drawable` のサイズを正確にすることができます。詳細については[そのドキュメント](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/size/Precision.kt)を参照してください。
- **新機能**: 複数のキャッシュキーの一致をサポートする `RequestBuilder.aliasKeys` を追加しました。

---

- 修正: RequestDisposable をスレッドセーフにしました。
- 修正: `RoundedCornersTransformation` がターゲットのサイズに切り取ってから角を丸めるようにしました。
- 修正: `CircleCropTransformation` が中央から切り抜くようにしました。
- 修正: [ハードウェアビットマップのブラックリスト](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/memory/HardwareBitmapService.kt)に複数のデバイスを追加しました。
- 修正: Drawable を Bitmap に変換する際にアスペクト比を保持するようにしました。
- 修正: `Scale.FIT` における潜在的なメモリキャッシュミスを修正しました。
- 修正: Parameters の反復順序が決定論的であることを保証するようにしました。
- 修正: Parameters および ComponentRegistry の作成時に防御的コピー（defensive copy）を行うようにしました。
- 修正: RealBitmapPool の maxSize が 0 以上であることを保証するようにしました。
- 修正: CrossfadeDrawable がアニメーション中ではない、または完了していない場合に開始 Drawable を表示するようにしました。
- 修正: 固有サイズが未定義の子に対応するよう CrossfadeDrawable を調整しました。
- 修正: `MovieDrawable` が適切にスケーリングされない問題を修正しました。

---

- Kotlin を 1.3.61 に更新しました。
- Kotlin Coroutines を 1.3.3 に更新しました。
- Okio を 2.4.3 に更新しました。
- AndroidX の依存関係を更新しました:
    - `androidx.exifinterface:exifinterface` -> 1.1.0

## [0.8.0] - 2019年10月22日 {id="0-8-0-october-22-2019"}

- **破壊的変更**: `SvgDrawable` は削除されました。代わりに、SVG は `SvgDecoder` によって `BitmapDrawable` に事前レンダリングされるようになりました。これにより、SVG の**メインスレッドでのレンダリング負荷が大幅に軽減されます**。また、`SvgDecoder` のコンストラクタに `Context` が必要になりました。
- **破壊的変更**: `SparseIntArraySet` 拡張関数が `coil.extension` パッケージに移動しました。

---

- **新機能**: リクエストごとのネットワークヘッダーの設定をサポートしました。[詳細についてはこちらを参照してください](https://github.com/coil-kt/coil/pull/120)。
- **新機能**: 画像パイプラインを介してカスタムデータを渡すことをサポートする新しい `Parameters` API を追加しました。
- **新機能**: RoundedCornersTransformation で個別の角の丸み半径の指定をサポートしました。@khatv911 に感謝します。
- **新機能**: プロアクティブにリソースを解放するための `ImageView.clear()` を追加しました。
- **新機能**: 他のパッケージからのリソースの読み込みをサポートしました。
- **新機能**: 計測時にビューのパディングを差し引くかどうかを切り替えるため、ViewSizeResolver に `subtractPadding` 属性を追加しました。
- **新機能**: HttpUrlFetcher の MIME タイプ検出を改善しました。
- **新機能**: MovieDrawable および CrossfadeDrawable に Animatable2Compat サポートを追加しました。
- **新機能**: GIF の繰り返し回数を設定するための `RequestBuilder<*>.repeatCount` を追加しました。
- **新機能**: パブリック API に BitmapPool の作成を追加しました。
- **新機能**: Request.Listener のメソッドに `@MainThread` アノテーションを付加しました。

---

- 修正: テスト用に CoilContentProvider を可視化しました。
- 修正: リソースキャッシュキーにナイトモードを含めるようにしました。
- 修正: ソースを一時的にディスクに書き込むことで、ImageDecoder のネイティブクラッシュを回避しました。
- 修正: 連絡先の表示写真 URI を正しく処理するようにしました。
- 修正: CrossfadeDrawable の子に色合い（tint）を渡すようにしました。
- 修正: ソースがクローズされない複数の箇所を修正しました。
- 修正: ハードウェアビットマップの実装が壊れている/不完全なデバイスのブラックリストを追加しました。

---

- SDK 29 に対してコンパイルしました。
- Kotlin Coroutines を 1.3.2 に更新しました。
- OkHttp を 3.12.6 に更新しました。
- Okio を 2.4.1 に更新しました。
- `coil-base` における `appcompat-resources` の依存関係を `compileOnly` から `implementation` に変更しました。

## [0.7.0] - 2019年9月8日 {id="0-7-0-september-8-2019"}
- **破壊的変更**: `ImageLoaderBuilder.okHttpClient(OkHttpClient.Builder.() -> Unit)` は `ImageLoaderBuilder.okHttpClient(() -> OkHttpClient)` になりました。また、初期化処理はバックグラウンドスレッドで遅延呼び出しされるようになりました。**カスタムの `OkHttpClient` を設定する場合は、ディスクキャッシュを有効にするために `OkHttpClient.cache` を設定する必要があります。** カスタムの `OkHttpClient` を設定しない場合、Coil はディスクキャッシュが有効化されたデフォルトの `OkHttpClient` を作成します。Coil のデフォルトのキャッシュは、`CoilUtils.createDefaultCache(context)` を使用して作成できます。例:

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
- **破壊的変更**: 軽微な名前付きパラメータの変更: `url` -> `uri`、`factory` -> `initializer`。

---

- **新機能**: SVG の自動デコードをサポートする `SvgDecoder` を備えた `coil-svg` アーティファクトを追加しました。[AndroidSVG](https://github.com/BigBadaboom/androidsvg) を採用しています。@rharter に感謝します。
- **新機能**: `load(String)` と `get(String)` がサポートされている任意の Uri スキームを受け入れるようになりました。たとえば、`imageView.load("file:///path/to/file.jpg")` のように記述できます。
- **新機能**: `OkHttpClient` ではなく `Call.Factory` を使用するように ImageLoader をリファクタリングしました。これにより、`ImageLoaderBuilder.okHttpClient { OkHttpClient() }` を使用してネットワーキングリソースの遅延初期化が可能になります。@ZacSweers に感謝します。
- **新機能**: リクエストのデコーダーを明示的に設定するための `RequestBuilder.decoder` を追加しました。
- **新機能**: ImageLoader でハードウェアビットマップをデフォルトで有効/無効にするための `ImageLoaderBuilder.allowHardware` を追加しました。
- **新機能**: ImageDecoderDecoder でのソフトウェアレンダリングをサポートしました。

---

- 修正: ベクター Drawable の読み込みに関する複数のバグを修正しました。
- 修正: WRAP_CONTENT の View 寸法をサポートしました。
- 修正: 8192 バイトを超える EXIF データの解析をサポートしました。
- 修正: クロスフェード時に異なるアスペクト比の Drawable が引き伸ばされないようにしました。
- 修正: 例外によってネットワークオブザーバーの登録に失敗した場合の保護を追加しました。
- 修正: MovieDrawable でのゼロ除算エラーを修正しました。@R12rus に感謝します。
- 修正: ネストされた Android アセットファイルをサポートしました。@JaCzekanski に感謝します。
- 修正: Android O および O_MR1 でファイル記述子が枯渇する問題に対する保護を追加しました。
- 修正: メモリキャッシュを無効にしたときにクラッシュしないようにしました。@hansenji に感謝します。
- 修正: Target.cancel が常にメインスレッドから呼び出されることを保証するようにしました。

---

- Kotlin を 1.3.50 に更新しました。
- Kotlin Coroutines を 1.3.0 に更新しました。
- OkHttp を 3.12.4 に更新しました。
- Okio を 2.4.0 に更新しました。
- AndroidX の依存関係を最新の安定バージョンに更新しました:
    - `androidx.appcompat:appcompat` -> 1.1.0
    - `androidx.core:core-ktx` -> 1.1.0
    - `androidx.lifecycle:lifecycle-common-java8` -> 2.1.0
- `appcompat` をオプションの `compileOnly` 依存関係として `appcompat-resources` に置き換えました。`appcompat-resources` ははるかに小さなアーティファクトです。

## [0.6.1] - 2019年8月16日 {id="0-6-1-august-16-2019"}
- 新機能: RequestBuilder に `transformations(List<Transformation>)` を追加しました。
- 修正: ファイル URI のキャッシュキーに最終更新日時を追加しました。
- 修正: View の寸法が少なくとも 1px として評価されることを保証するようにしました。
- 修正: フレーム間で MovieDrawable のキャンバスをクリアするようにしました。
- 修正: アセットが正しく開かれるようにしました。

## [0.6.0] - 2019年8月12日 {id="0-6-0-august-12-2019"}
- 初回リリース。