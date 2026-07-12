# 實用範例

此頁面說明如何處理 Coil 的一些常見使用案例。您可能需要修改此程式碼以符合您的確切需求，但希望這能為您提供正確的方向！

看到未涵蓋的常見使用案例嗎？歡迎提交包含新章節的 PR。

## Palette

[Palette](https://developer.android.com/training/material/palette-colors?hl=en) 允許您從影像中擷取顯著色彩。要建立 `Palette`，您需要存取影像的 `Bitmap`。這可以透過多種方式完成：

您可以透過設定 `ImageRequest.Listener` 並將 `ImageRequest` 加入佇列來存取影像的 `Bitmap`：

```kotlin
imageView.load("https://example.com/image.jpg") {
    // 停用硬體 Bitmap，因為 Palette 需要讀取影像的像素。
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

## 使用記憶體快取金鑰作為占位符號

如果兩張影像相同但載入尺寸不同，將前一次請求的 `MemoryCache.Key` 用作後續請求的占位符號會非常有用。例如，如果第一個請求以 100x100 載入影像，而第二個請求以 500x500 載入影像，我們可以使用第一張影像作為第二個請求的同步占位符號。

以下是範例應用程式中的效果：

<p style="text-align: center;">
    <video width="360" height="640" autoplay loop muted playsinline>
        <source src="../images/crossfade.mp4" type="video/mp4">
    </video>
</p>

*清單中的影像刻意以極低細節載入，且淡入淡出 (crossfade) 被減慢以突顯視覺效果。*

要達成此效果，請將第一個請求的 `MemoryCache.Key` 作為第二個請求的 `ImageRequest.placeholderMemoryCacheKey`。範例如下：

```kotlin
// 第一個請求
listImageView.load("https://example.com/image.jpg")

// 第二個請求 (當第一個請求完成後)
detailImageView.load("https://example.com/image.jpg") {
    placeholderMemoryCacheKey(listImageView.result.memoryCacheKey)
}
```

## Compose AnimatedContent

使用 `rememberAsyncImagePainter` 和 `AnimatedContent` 在占位符號與載入的影像之間製作動畫：

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
            // 在 model 變更後，讓舊影像在淡出動畫期間保持可見。
            Image(
                painter = targetState.painter,
                contentDescription = stringResource(R.string.description),
            )
        }
        is AsyncImagePainter.State.Error -> ErrorContent()
    }
}
```

將 `targetState.painter` 傳遞給 `Image`，以便在 `model` 變更後，舊影像在淡出動畫期間保持可見。

在載入完成之前，最終的影像尺寸是未知的。請使用固定約束 (fixed constraints) 或已知的長寬比 (aspect ratio) 來預留空間。

`rememberAsyncImagePainter` 會從 `State.Empty` 開始，即使影像已在記憶體快取中也是如此。如果需要，可以使用 `state.result.dataSource` 來跳過記憶體快取影像的動畫。

注意：`AnimatedContent` 的開銷比 painter 淡入淡出 (crossfade) 高得多，且會將舊影像保留在記憶體中直到動畫結束。在延遲列表 (lazy lists) 中或對於簡單的淡入淡出，建議優先使用 `ImageRequest.Builder.crossfade`。

## 共享元素過渡

[共享元素過渡 (Shared element transitions)](https://developer.android.com/training/transitions/start-activity) 允許您在 `Activities` 和 `Fragments` 之間製作動畫。以下是關於如何讓它們與 Coil 搭配運作的一些建議：

- **共享元素過渡與硬體 Bitmap 不相容。** 您應該針對正在製作動畫的來源 `ImageView` 和目標視圖設定 `allowHardware(false)` 以停用硬體 Bitmap。如果不這樣做，過渡將會拋出 `java.lang.IllegalArgumentException: Software rendering doesn't support hardware bitmaps` 例外。

- 將起始影像的 `MemoryCache.Key` 作為結束影像的 [`placeholderMemoryCacheKey`](/coil/api/coil-core/coil3.request/-image-request/-builder/placeholder-memory-cache-key)。這可以確保起始影像被用作結束影像的占位符號，如果影像已在記憶體快取中，這會帶來平滑且無白色閃爍的過渡效果。

- 同時使用 [`ChangeImageTransform`](https://developer.android.com/reference/android/transition/ChangeImageTransform) 和 [`ChangeBounds`](https://developer.android.com/reference/android/transition/ChangeBounds) 以獲得最佳效果。

正在使用 Compose？[查看這篇文章了解如何使用 `AsyncImage` 執行共享元素過渡](https://www.tunjid.com/articles/animating-contentscale-during-image-shared-element-transitions-65fba03537c67f8df0161c31)。

## Remote Views

Coil 並未直接提供 [`RemoteViews`](https://developer.android.com/reference/android/widget/RemoteViews) 的 `Target`，但您可以像這樣建立一個：

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

然後像平常一樣 `enqueue`/`execute` 請求：

```kotlin
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .target(RemoteViewsTarget(context, componentName, remoteViews, imageViewResId))
    .build()
imageLoader.enqueue(request)
```

## 轉換 Painter

`AsyncImage` 和 `AsyncImagePainter` 都有接受 `Painter` 的 `placeholder`/`error`/`fallback` 引數。Painter 比起使用 composable 的彈性較低，但速度更快，因為 Coil 不需要使用子組合 (subcomposition)。即便如此，為了獲得所需的 UI，可能仍需要對 Painter 進行內切 (inset)、拉伸、著色或轉換。要達成此目的，請[將此 Gist 複製到您的專案中](https://gist.github.com/colinrtwhite/c2966e0b8584b4cdf0a5b05786b20ae1)並像這樣包裝 Painter：

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

可以使用尾隨 Lambda 覆寫 `onDraw`：

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

## 轉換請求

您可能需要轉換用於獲取影像的 HTTP 請求。在此範例中，我們將使用 [Interceptor](https://coil-kt.github.io/coil/api/coil-core/coil3.intercept/-interceptor) 將 `width` 和 `height` 查詢參數附加到請求 URL。

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
            // 寬度和高度不可用，例如因為無限約束 (infinite constraints)。
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

別忘了將攔截器註冊到您的 `ImageLoader`！

```kotlin
ImageLoader.Builder(context)
    .components {
        add(UrlSizeInterceptor())
    }
    .build()