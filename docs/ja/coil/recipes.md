# レシピ

このページでは、Coil を使用した一般的なユースケースの処理方法に関するガイダンスを提供します。実際の要件に合わせてコードを変更する必要があるかもしれませんが、実装の足がかりとして役立つはずです。

まだカバーされていない一般的なユースケースにお気づきですか？新しいセクションを追加する PR をお気軽に提出してください。

## Palette {id="palette"}

[Palette](https://developer.android.com/training/material/palette-colors?hl=ja) を使用すると、画像から特徴的な色を抽出できます。`Palette` を作成するには、画像の `Bitmap` にアクセスする必要があります。これにはいくつかの方法があります。

`ImageRequest.Listener` を設定し、`ImageRequest` をエンキュー（enqueue）することで、画像のビットマップにアクセスできます。

```kotlin
imageView.load("https://example.com/image.jpg") {
    // Palette は画像のピクセルを読み取る必要があるため、ハードウェアビットマップを無効にします。
    allowHardware(false)
    listener(
        onSuccess = { _, result ->
            // バックグラウンドスレッドでパレットを作成します。
            Palette.Builder(result.image.toBitmap()).generate { palette ->
                // パレットを使用します。
            }
        }
    )
}
```

## メモリキャッシュキーをプレースホルダーとして使用する {id="using-a-memory-cache-key-as-a-placeholder"}

同じ画像が異なるサイズで読み込まれる場合、前のリクエストの `MemoryCache.Key` を後続のリクエストのプレースホルダーとして使用すると便利です。たとえば、最初のリクエストで 100x100 の画像を読み込み、2 回目のリクエストで 500x500 の画像を読み込む場合、最初の画像を 2 回目のリクエストの同期的なプレースホルダーとして使用できます。

サンプルアプリでのこの効果の見た目は次のとおりです。

<p style="text-align: center;">
    <video width="360" height="640" autoplay loop muted playsinline>
        <source src="../images/crossfade.mp4" type="video/mp4">
    </video>
</p>

*リスト内の画像は意図的に非常に低いディテールで読み込まれており、視覚的効果を強調するためにクロスフェードを遅くしています。*

この効果を実現するには、1 回目のリクエストの `MemoryCache.Key` を、2 回目のリクエストの `ImageRequest.placeholderMemoryCacheKey` として使用します。以下に例を示します。

```kotlin
// 1 回目のリクエスト
listImageView.load("https://example.com/image.jpg")

// 2 回目のリクエスト（1 回目のリクエストが完了した後）
detailImageView.load("https://example.com/image.jpg") {
    placeholderMemoryCacheKey(listImageView.result.memoryCacheKey)
}
```

## Compose AnimatedContent {id="compose-animatedcontent"}

`rememberAsyncImagePainter` と `AnimatedContent` を使用して、プレースホルダーと読み込まれた画像の間のアニメーションを作成します。

```kotlin
val sizeResolver = rememberConstraintsSizeResolver()
val painter = rememberAsyncImagePainter(
    model = ImageRequest.Builder(LocalPlatformContext.current)
        .data("https://example.com/image.jpg")
        .size(sizeResolver)
        .build(),
)
val state by painter.state.collectAsState()

AnimatedContent(
    modifier = Modifier.then(sizeResolver),
    targetState = state,
    contentKey = { it::class },
    transitionSpec = { fadeIn() togetherWith fadeOut() },
) { targetState ->
    when (targetState) {
        is AsyncImagePainter.State.Empty,
        is AsyncImagePainter.State.Loading -> PlaceholderContent()
        is AsyncImagePainter.State.Success -> {
            // モデル変更後に古い画像がアニメーションで消える間も、表示を維持します。
            Image(
                painter = targetState.painter,
                contentDescription = stringResource(R.string.description),
            )
        }
        is AsyncImagePainter.State.Error -> ErrorContent()
    }
}
```

モデル変更後に古い画像がアニメーションしながら消える間も表示を維持するために、`targetState.painter` を `Image` に渡します。

最終的な画像サイズは読み込みが完了するまで不明です。スペースを確保するために、固定の制約または既知のアスペクト比を使用してください。

`rememberAsyncImagePainter` は、画像がメモリキャッシュにある場合でも `State.Empty` から開始します。必要に応じて `state.result.dataSource` を使用して、メモリキャッシュされた画像のアニメーションをスキップしてください。

**注意**: `AnimatedContent` は Painter のクロスフェードよりも大幅に負荷が高く、アニメーションが終了するまで古い画像をメモリ内に保持します。遅延リスト（Lazy lists）内や単純なフェードの場合は、`ImageRequest.Builder.crossfade` を優先して使用してください。

## 共有要素遷移（Shared Element Transitions） {id="shared-element-transitions"}

[共有要素遷移（Shared element transitions）](https://developer.android.com/training/transitions/start-activity?hl=ja)を使用すると、`Activity` 間や `Fragment` 間でアニメーションを実行できます。Coil でこれらを機能させるための推奨事項は以下のとおりです。

- **共有要素遷移はハードウェアビットマップと互換性がありません。** 遷移元のアニメーション対象となる `ImageView` と遷移先のアニメーション対象となるビューの両方で、`allowHardware(false)` を設定してハードウェアビットマップを無効にする必要があります。設定しない場合、遷移時に `java.lang.IllegalArgumentException: Software rendering doesn't support hardware bitmaps` 例外がスローされます。

- 開始画像の `MemoryCache.Key` を、終了画像の [`placeholderMemoryCacheKey`](/coil/api/coil-core/coil3.request/-image-request/-builder/placeholder-memory-cache-key.html) として使用します。これにより、終了画像のプレースホルダーとして開始画像が確実に使用され、画像がメモリキャッシュにある場合は白いちらつきのないスムーズな遷移が実現します。

- 最適な結果を得るには、[`ChangeImageTransform`](https://developer.android.com/reference/android/transition/ChangeImageTransform) と [`ChangeBounds`](https://developer.android.com/reference/android/transition/ChangeBounds) を組み合わせて使用します。

Compose を使用していますか？[`AsyncImage` で共有要素遷移を実行する方法については、こちらの記事を確認してください](https://www.tunjid.com/articles/animating-contentscale-during-image-shared-element-transitions-65fba03537c67f8df0161c31)。

## RemoteViews {id="remote-views"}

Coil はそのまま使える [`RemoteViews`](https://developer.android.com/reference/android/widget/RemoteViews) 用の `Target` を提供していませんが、以下のように作成できます。

```kotlin
class RemoteViewsTarget(
    private val context: Context,
    private val componentName: ComponentName,
    private val remoteViews: RemoteViews,
    @IdRes private val imageViewResId: Int
) : Target {

    override fun onStart(placeholder: Image?) = setImage(placeholder)

    override fun onError(error: Image?) = setImage(error)

    override fun onSuccess(result: Image) = setImage(result)

    private fun setImage(image: Image?) {
        remoteViews.setImageViewBitmap(imageViewResId, image?.toBitmap())
        AppWidgetManager.getInstance(context).updateAppWidget(componentName, remoteViews)
    }
}
```

その後、通常通りリクエストを `enqueue` / `execute` します。

```kotlin
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .target(RemoteViewsTarget(context, componentName, remoteViews, imageViewResId))
    .build()
imageLoader.enqueue(request)
```

## Painter の変換 {id="transforming-painters"}

`AsyncImage` と `AsyncImagePainter` は両方とも、`Painter` を受け取る `placeholder` / `error` / `fallback` 引数を持っています。Painter はコンポーザブルを使用するよりも柔軟性には劣りますが、Coil がサブコンポジション（subcomposition）を使用する必要がないため高速です。ただし、目的の UI を実現するために、Painter のインセット、拡大・縮小、色合い変更（ティント）、または変換が必要になる場合があります。これを実現するには、[この Gist をプロジェクトにコピー](https://gist.github.com/colinrtwhite/c2966e0b8584b4cdf0a5b05786b20ae1)し、次のように Painter をラップします。

```kotlin
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
    placeholder = forwardingPainter(
        painter = painterResource(R.drawable.placeholder),
        colorFilter = ColorFilter(Color.Red),
        alpha = 0.5f,
    ),
)
```

`onDraw` は末尾のラムダを使用してオーバーライドできます。

```kotlin
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
    placeholder = forwardingPainter(painterResource(R.drawable.placeholder)) { info ->
        inset(50f, 50f) {
            with(info.painter) {
                draw(size, info.alpha, info.colorFilter)
            }
        }
    },
)
```

## リクエストの変換 {id="transforming-requests"}

画像の取得に使用される HTTP リクエストの変換が必要になる場合があります。この例では、[Interceptor](https://coil-kt.github.io/coil/api/coil-core/coil3.intercept/-interceptor) を使用して、リクエスト URL に `width` と `height` のクエリパラメータを追加します。

```kotlin
class UrlSizeInterceptor : Interceptor {

    override suspend fun intercept(chain: Chain): ImageResult {
        val request = chain.request
        val uri = request.uri

        if (uri == null || uri.scheme !in setOf("https", "http")) {
            // HTTP リクエスト以外は無視します。
            return chain.proceed()
        }

        val (width, height) = chain.size
        return if (width is Pixels && height is Pixels) {
            val transformUri = uri.newBuilder()
                .query("width=${width.px}&height=${height.px}")
                .build()

            val transformedRequest = request.newBuilder()
                .data(transformUri)
                .build()
            return chain.withRequest(transformedRequest).proceed()
        } else {
            // 無限の制約などの理由で幅と高さが利用できない場合。
            chain.proceed()
        }
    }

    private val ImageRequest.uri: Uri?
        get() = when (val data = data) {
            is Uri -> data
            is coil3.Uri -> data.toAndroidUri()
            is String -> data.toUri()
            else -> null
        }
}
```

作成したインターセプターを `ImageLoader` に追加・登録することを忘れないでください。

```kotlin
ImageLoader.Builder(context)
    .components {
        add(UrlSizeInterceptor())
    }
    .build()
```