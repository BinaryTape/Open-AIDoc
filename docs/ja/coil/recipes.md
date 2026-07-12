# レシピ

このページでは、Coilを使用した一般的なユースケースの処理方法について説明します。要件に合わせてこのコードを修正する必要があるかもしれませんが、解決へのヒントとして役立つはずです。

ここに記載されていない一般的なユースケースをご存知ですか？新しいセクションを追加するPR（プルリクエスト）をぜひ送ってください。

## Palette

[Palette](https://developer.android.com/training/material/palette-colors?hl=en) を使用すると、画像から主要な色を抽出できます。`Palette` を作成するには、画像の `Bitmap` にアクセスする必要があります。これにはいくつかの方法があります。

`ImageRequest.Listener` を設定し、`ImageRequest` を実行（enqueue）することで、画像のビットマップにアクセスできます。

```kotlin
imageView.load("https://example.com/image.jpg") {
    // Paletteは画像のピクセルを読み取る必要があるため、ハードウェアビットマップを無効にします。
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

## メモリキャッシュキーをプレースホルダーとして使用する

2つの画像が同じもので、異なるサイズで読み込まれる場合、前のリクエストの `MemoryCache.Key` を後続のリクエストのプレースホルダーとして使用すると便利です。例えば、最初のリクエストで画像を 100x100 で読み込み、2番目のリクエストで 500x500 で読み込む場合、最初の画像を2番目のリクエストの同期プレースホルダーとして使用できます。

サンプルアプリでのこのエフェクトの様子は以下の通りです。

<p style="text-align: center;">
    <video width="360" height="640" autoplay loop muted playsinline>
        <source src="../images/crossfade.mp4" type="video/mp4">
    </video>
</p>

*リスト内の画像は、視覚的な効果を強調するために、意図的に非常に低い詳細度で読み込まれ、クロスフェードの速度を落としています。*

このエフェクトを実現するには、最初のリクエストの `MemoryCache.Key` を2番目のリクエストの `ImageRequest.placeholderMemoryCacheKey` として使用します。例を以下に示します。

```kotlin
// 1番目のリクエスト
listImageView.load("https://example.com/image.jpg")

// 2番目のリクエスト（1番目のリクエストが完了した後）
detailImageView.load("https://example.com/image.jpg") {
    placeholderMemoryCacheKey(listImageView.result.memoryCacheKey)
}
```

## Compose AnimatedContent

`rememberAsyncImagePainter` と `AnimatedContent` を使用して、プレースホルダーと読み込まれた画像の間のアニメーションを行います。

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
            // モデルの変更後に古い画像がアニメーションで消える間も、その画像を表示したままにするために
            // targetState.painter を使用します。
            Image(
                painter = targetState.painter,
                contentDescription = stringResource(R.string.description),
            )
        }
        is AsyncImagePainter.State.Error -> ErrorContent()
    }
}
```

モデルの変更後に古い画像がアニメーションで消える間もその画像を表示したままにするために、`Image` には `targetState.painter` を渡してください。

最終的な画像サイズは読み込みが完了するまで不明です。スペースを確保するために、固定の制約または既知のアスペクト比を使用してください。

`rememberAsyncImagePainter` は、画像がメモリキャッシュにある場合でも `State.Empty` から開始されます。必要に応じて、メモリキャッシュされた画像のアニメーションをスキップするには `state.result.dataSource` を使用してください。

注意: `AnimatedContent` は Painter のクロスフェードよりもはるかに負荷が高く、アニメーションが終了するまで古い画像をメモリに保持します。Lazy list 内や単純なフェードの場合は、`ImageRequest.Builder.crossfade` を優先してください。

## 共通要素遷移（Shared Element Transitions）

[共通要素遷移（Shared element transitions）](https://developer.android.com/training/transitions/start-activity) を使用すると、`Activities` と `Fragments` の間でアニメーションを行うことができます。Coilでこれらを動作させるための推奨事項は以下の通りです。

- **共通要素遷移はハードウェアビットマップと互換性がありません。** アニメーション元の `ImageView` とアニメーション先のビューの両方で、`allowHardware(false)` を設定してハードウェアビットマップを無効にする必要があります。そうしないと、遷移時に `java.lang.IllegalArgumentException: Software rendering doesn't support hardware bitmaps` 例外がスローされます。

- 開始画像の `MemoryCache.Key` を終了画像の [`placeholderMemoryCacheKey`](/coil/api/coil-core/coil3.request/-image-request/-builder/placeholder-memory-cache-key) として使用してください。これにより、開始画像が終了画像のプレースホルダーとして使用され、画像がメモリキャッシュにある場合に白いフラッシュ（点滅）が発生せず、スムーズな遷移が可能になります。

- 最適な結果を得るために、[`ChangeImageTransform`](https://developer.android.com/reference/android/transition/ChangeImageTransform) と [`ChangeBounds`](https://developer.android.com/reference/android/transition/ChangeBounds) を組み合わせて使用してください。

Composeを使用していますか？ [`AsyncImage` で共通要素遷移を行う方法については、こちらの記事を確認してください。](https://www.tunjid.com/articles/animating-contentscale-during-image-shared-element-transitions-65fba03537c67f8df0161c31)

## Remote Views

Coilは標準で [`RemoteViews`](https://developer.android.com/reference/android/widget/RemoteViews) 用の `Target` を提供していませんが、以下のように作成することができます。

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

その後、通常通りリクエストを `enqueue`/`execute` します。

```kotlin
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .target(RemoteViewsTarget(context, componentName, remoteViews, imageViewResId))
    .build()
imageLoader.enqueue(request)
```

## Painterの変換

`AsyncImage` と `AsyncImagePainter` はどちらも `Painter` を受け取る `placeholder`/`error`/`fallback` 引数を持っています。Painterはコンポーザブルを使用するよりも柔軟性は低いですが、Coilがサブコンポジションを使用する必要がないため高速です。とはいえ、目的のUIを実現するために、Painterをインセット（inset）、ストレッチ、ティント（tint）、または変形（transform）させる必要がある場合があります。これを実現するには、[こちらのGistをプロジェクトにコピーし](https://gist.github.com/colinrtwhite/c2966e0b8584b4cdf0a5b05786b20ae1)、以下のようにPainterをラップします。

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

後置ラムダ（trailing lambda）を使用して `onDraw` を上書きできます。

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

## リクエストの変換

画像をフェッチするために使用されるHTTPリクエストを変換する必要がある場合があります。この例では、[Interceptor](https://coil-kt.github.io/coil/api/coil-core/coil3.intercept/-interceptor) を使用して、リクエストURLに `width` と `height` のクエリパラメータを追加します。

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
            // 無限の制約（infinite constraints）などの理由で、幅と高さが利用できない場合。
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

`ImageLoader` にインターセプターを追加するのを忘れないでください！

```kotlin
ImageLoader.Builder(context)
    .components {
        add(UrlSizeInterceptor())
    }
    .build()