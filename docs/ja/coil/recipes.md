# レシピ

このページでは、Coilを使用した一般的なユースケースの処理方法について案内します。要件に合わせてコードを変更する必要があるかもしれませんが、実装の足がかりとして役立つはずです。

カバーされていない一般的なユースケースにお気づきですか？新しいセクションを追加するPRをぜひ気軽に送信してください。

## Palette {id="palette"}

[Palette](https://developer.android.com/training/material/palette-colors?hl=en) を使用すると、画像から主要な色を抽出できます。`Palette` を作成するには、画像の `Bitmap` にアクセスする必要があります。これにはいくつかの方法があります。

`ImageRequest.Listener` を設定し、`ImageRequest` をエンキューすることで、画像のビットマップにアクセスできます。

```kotlin
imageView.load("https://example.com/image.jpg") {
    // Paletteが画像のピクセルを読み取る必要があるため、ハードウェアビットマップを無効化します。
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

以前のリクエストの `MemoryCache.Key` を後続のリクエストのプレースホルダーとして使用することは、サイズが異なるだけで同じ2つの画像を読み込む場合に役立ちます。例えば、最初のリクエストが画像を 100x100 で読み込み、2番目のリクエストが画像を 500x500 で読み込む場合、最初の画像を2番目のリクエストの同期的なプレースホルダーとして使用できます。

サンプルアプリでは、この効果は次のようになります。

<p style="text-align: center;">
    <video width="360" height="640" autoplay loop muted playsinline>
        <source src="../images/crossfade.mp4" type="video/mp4">
    </video>
</p>

*視覚効果を強調するため、リスト内の画像は意図的に非常に低いディテールで読み込まれ、クロスフェードは遅く設定されています。*

この効果を実現するには、最初のリクエストの `MemoryCache.Key` を2番目のリクエストの `ImageRequest.placeholderMemoryCacheKey` として使用します。以下に例を示します。

```kotlin
// 最初のリクエスト
listImageView.load("https://example.com/image.jpg")

// 2番目のリクエスト（最初のリクエストが完了した後）
detailImageView.load("https://example.com/image.jpg") {
    placeholderMemoryCacheKey((listImageView.result as? SuccessResult)?.memoryCacheKey)
}
```

## Compose AnimatedContent {id="compose-animatedcontent"}

プレースホルダーと読み込まれた画像の間をアニメーションさせるには、`rememberAsyncImagePainter` と `AnimatedContent` を使用します。

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
            // モデルが変更された後、古い画像がアニメーションしながら消える間も表示を維持します。
            Image(
                painter = targetState.painter,
                contentDescription = stringResource(R.string.description),
            )
        }
        is AsyncImagePainter.State.Error -> ErrorContent()
    }
}
```

モデル変更後に古い画像がアニメーションしながら消える間も表示が維持されるよう、`targetState.painter` を `Image` に渡します。

最終的な画像サイズは読み込みが完了するまで不明です。スペースを確保するには、固定の制約（constraints）または既知のアスペクト比を使用してください。

`rememberAsyncImagePainter` は、画像がメモリキャッシュにある場合でも `State.Empty` から開始します。必要に応じて、`state.result.dataSource` を使用してメモリキャッシュされた画像のアニメーションをスキップしてください。

注意: `AnimatedContent` はペインターのクロスフェードよりもはるかに負荷が高く、アニメーションが終了するまで古い画像をメモリに保持します。Lazy リストや単純なフェードの場合は、`ImageRequest.Builder.crossfade` を優先して使用してください。

## 共有要素遷移（Shared Element Transitions） {id="shared-element-transitions"}

[共有要素遷移（Shared element transitions）](https://developer.android.com/training/transitions/start-activity) を使用すると、`Activities` と `Fragments` の間をアニメーション化できます。Coilでこれらを適切に機能させるための推奨事項は以下のとおりです。

- **共有要素遷移はハードウェアビットマップと互換性がありません。** アニメーション元の `ImageView` とアニメーション先のビューの両方で `allowHardware(false)` を設定し、ハードウェアビットマップを無効にする必要があります。設定しない場合、遷移時に `java.lang.IllegalArgumentException: Software rendering doesn't support hardware bitmaps` 例外がスローされます。

- 開始画像の `MemoryCache.Key` を、終了画像の [`placeholderMemoryCacheKey`](/coil/api/coil-core/coil3.request/-image-request/-builder/placeholder-memory-cache-key.html) として使用します。これにより、開始画像が終了画像のプレースホルダーとして使用され、画像がメモリキャッシュにある場合に白いちらつき（フラッシュ）のないスムーズな遷移が実現します。

- 最適な結果を得るには、[`ChangeImageTransform`](https://developer.android.com/reference/android/transition/ChangeImageTransform) と [`ChangeBounds`](https://developer.android.com/reference/android/transition/ChangeBounds) を組み合わせて使用してください。

Composeを使用していますか？[`AsyncImage` で共有要素遷移を実行する方法については、こちらの記事を確認してください](https://www.tunjid.com/articles/animating-contentscale-during-image-shared-element-transitions-65fba03537c67f8df0161c31)。

## Remote Views {id="remote-views"}

Coilは [`RemoteViews`](https://developer.android.com/reference/android/widget/RemoteViews) 用の `Target` を標準では提供していませんが、次のように作成できます。

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

その後、通常どおりリクエストを `enqueue` / `execute` します。

```kotlin
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .target(RemoteViewsTarget(context, componentName, remoteViews, imageViewResId))
    .build()
imageLoader.enqueue(request)
```

## Painterの変形（Transforming Painters） {id="transforming-painters"}

`AsyncImage` と `AsyncImagePainter` の両方に、`Painter` を受け取る `placeholder` / `error` / `fallback` 引数があります。Painterはコンポーザブルを使用するよりも柔軟性に欠けますが、Coilがサブコンポジション（subcomposition）を使用する必要がないため高速です。とはいえ、目的のUIを実現するために、Painterのインセット、拡大・縮小、色合い変更（tint）、または変形が必要になる場合があります。これを実現するには、[このGistをプロジェクトにコピー](https://gist.github.com/colinrtwhite/c2966e0b8584b4cdf0a5b05786b20ae1)し、次のようにPainterをラップします。

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

末尾のラムダを使用して `onDraw` を上書きできます。

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

画像の取得に使用されるHTTPリクエストを変換（変更）する必要がある場合があります。この例では、[Interceptor](https://coil-kt.github.io/coil/api/coil-core/coil3.intercept/-interceptor) を使用してリクエストURLに `width` と `height` のクエリパラメータを追加します。

```kotlin
class UrlSizeInterceptor : Interceptor {

    override suspend fun intercept(chain: Chain): ImageResult {
        val request = chain.request
        val uri = request.uri

        if (uri == null || uri.scheme !in setOf("https", "http")) {
            // HTTP以外のリクエストは無視します。
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
            // 幅と高さが利用できません（例: 無限の制約によるものなど）。
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

作成したインターセプターを `ImageLoader` に追加して登録することを忘れないでください。

```kotlin
ImageLoader.Builder(context)
    .components {
        add(UrlSizeInterceptor())
    }
    .build()
```