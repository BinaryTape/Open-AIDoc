# 實用技巧 (Recipes)

本頁面提供如何使用 Coil 處理一些常見使用案例的指引。你可能需要修改這些程式碼以符合具體需求，但希望它能為你指引正確的方向！

看到未涵蓋的常見使用案例嗎？歡迎提交拉取請求 (PR) 來新增章節。

## Palette {id="palette"}

[Palette](https://developer.android.com/training/material/palette-colors?hl=en) 讓你能從圖片中擷取突出的顏色。若要建立 `Palette`，你需要存取圖片的 `Bitmap`。這可以透過幾種方式完成：

你可以透過設定 `ImageRequest.Listener` 並將 `ImageRequest` 加入佇列來存取圖片的點陣圖 (Bitmap)：

```kotlin
imageView.load("https://example.com/image.jpg") {
    // 停用硬體點陣圖 (hardware bitmap)，因為 Palette 需要讀取圖片的像素。
    allowHardware(false)
    listener(
        onSuccess = { _, result ->
            // 在背景執行緒上建立 palette。
            Palette.Builder(result.image.toBitmap()).generate { palette ->
                // 使用 palette。
            }
        }
    )
}
```

## 使用記憶體快取鍵 (Memory Cache Key) 作為占位符號 {id="using-a-memory-cache-key-as-a-placeholder"}

如果兩張圖片相同但載入的尺寸不同，將先前請求的 `MemoryCache.Key` 作為後續請求的占位符號會非常有用。例如，如果第一個請求以 100x100 載入圖片，而第二個請求以 500x500 載入圖片，我們可以將第一張圖片用作第二個請求的同步占位符號。

以下是此效果在範例應用程式中的呈現方式：

<p style="text-align: center;">
    <video width="360" height="640" autoplay loop muted playsinline>
        <source src="../images/crossfade.mp4" type="video/mp4">
    </video>
</p>

*清單中的圖片刻意以極低的細節載入，且放慢了淡入淡出 (crossfade) 效果以突顯視覺效果。*

若要達成此效果，請將第一個請求的 `MemoryCache.Key` 作為第二個請求的 `ImageRequest.placeholderMemoryCacheKey`。範例如下：

```kotlin
// 第一個請求
listImageView.load("https://example.com/image.jpg")

// 第二個請求（在第一個請求完成後）
detailImageView.load("https://example.com/image.jpg") {
    placeholderMemoryCacheKey((listImageView.result as? SuccessResult)?.memoryCacheKey)
}
```

## Compose AnimatedContent {id="compose-animatedcontent"}

使用 `rememberAsyncImagePainter` 與 `AnimatedContent` 在占位符號與已載入的圖片之間建立動畫轉場：

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
            // 在 model 變更後淡出時，保持舊圖片可見。
            Image(
                painter = targetState.painter,
                contentDescription = stringResource(R.string.description),
            )
        }
        is AsyncImagePainter.State.Error -> ErrorContent()
    }
}
```

將 `targetState.painter` 傳入 `Image`，以便在 model 變更並以動畫移出時，舊圖片仍保持可見。

在載入完成前，最終圖片的尺寸是未知的。請使用固定約束條件 (constraints) 或已知的寬高比預留空間。

即使圖片已存在於記憶體快取中，`rememberAsyncImagePainter` 也會以 `State.Empty` 開始。如有需要，可使用 `state.result.dataSource` 來略過記憶體快取圖片的動畫。

注意：`AnimatedContent` 的開銷遠高於 painter 的淡入淡出 (crossfade)，而且會將舊圖片保留在記憶體中直到動畫結束。在延遲載入清單 (lazy lists) 中或僅需簡單淡入淡出時，建議優先使用 `ImageRequest.Builder.crossfade`。

## 共享元素轉場 (Shared Element Transitions) {id="shared-element-transitions"}

[共享元素轉場 (Shared element transitions)](https://developer.android.com/training/transitions/start-activity) 讓您能夠在 `Activity` 與 `Fragment` 之間製作轉場動畫。以下是讓它們與 Coil 良好搭配運作的一些建議：

- **共享元素轉場與硬體點陣圖 (hardware bitmaps) 不相容。** 您應該設定 `allowHardware(false)`，以同時為動畫起始的 `ImageView` 以及動畫目標 view 停用硬體點陣圖。若未停用，轉場將會擲出 `java.lang.IllegalArgumentException: Software rendering doesn't support hardware bitmaps` 例外狀況。

- 將起始圖片的 `MemoryCache.Key` 作為結束圖片的 [`placeholderMemoryCacheKey`](/coil/api/coil-core/coil3.request/-image-request/-builder/placeholder-memory-cache-key.html)。這可確保起始圖片被用作結束圖片的占位符號；若圖片存在於記憶體快取中，就能帶來無白色閃爍的流暢轉場。

- 同時搭配使用 [`ChangeImageTransform`](https://developer.android.com/reference/android/transition/ChangeImageTransform) 與 [`ChangeBounds`](https://developer.android.com/reference/android/transition/ChangeBounds) 以獲得最佳效果。

正在使用 Compose 嗎？[請參閱這篇文章，了解如何使用 `AsyncImage` 執行共享元素轉場](https://www.tunjid.com/articles/animating-contentscale-during-image-shared-element-transitions-65fba03537c67f8df0161c31)。

## Remote Views {id="remote-views"}

Coil 沒有開箱即用地為 [`RemoteViews`](https://developer.android.com/reference/android/widget/RemoteViews) 提供 `Target`，不過你可以像這樣自行建立一個：

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

接著像平常一樣 `enqueue`/`execute` 該請求：

```kotlin
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .target(RemoteViewsTarget(context, componentName, remoteViews, imageViewResId))
    .build()
imageLoader.enqueue(request)
```

## 變換 Painter (Transforming Painters) {id="transforming-painters"}

`AsyncImage` 與 `AsyncImagePainter` 的 `placeholder`、`error` 與 `fallback` 引數都接受 `Painter`。Painter 雖然不像使用可組合項 (composable) 那樣具備高彈性，但速度更快，因為 Coil 不需要使用子組合 (subcomposition)。話雖如此，為了獲得理想的 UI，可能仍需要對 painter 進行內縮 (inset)、拉伸、著色 (tint) 或變換 (transform)。若要實現這點，[請複製此 Gist 到你的專案中](https://gist.github.com/colinrtwhite/c2966e0b8584b4cdf0a5b05786b20ae1)，並像這樣封裝 painter：

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

可以透過尾隨 Lambda 覆寫 `onDraw`：

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

## 轉換請求 (Transforming Requests) {id="transforming-requests"}

你可能需要轉換用於擷取圖片的 HTTP 請求。在此範例中，我們將使用 [Interceptor](https://coil-kt.github.io/coil/api/coil-core/coil3.intercept/-interceptor) 將 `width` 與 `height` 查詢參數附加至請求 URL。

```kotlin
class UrlSizeInterceptor : Interceptor {

    override suspend fun intercept(chain: Chain): ImageResult {
        val request = chain.request
        val uri = request.uri

        if (uri == null || uri.scheme !in setOf("https", "http")) {
            // 忽略非 HTTP 請求。
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
            // 無法取得 width 與 height，例如因無限約束 (infinite constraints) 所致。
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

別忘了將攔截器新增至你的 `ImageLoader`！

```kotlin
ImageLoader.Builder(context)
    .components {
        add(UrlSizeInterceptor())
    }
    .build()
```