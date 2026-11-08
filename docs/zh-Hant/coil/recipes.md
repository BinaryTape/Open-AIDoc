# 實用技巧 (Recipes)

本頁面提供如何使用 Coil 處理一些常見使用案例的指引。您可能需要修改這些程式碼以符合您的具體需求，但希望它能為您指引正確的方向！

發現未涵蓋的常見使用案例？歡迎提交拉取請求 (PR) 來新增章節。

## Palette {id="palette"}

[Palette](https://developer.android.com/training/material/palette-colors?hl=en) 讓您可以從圖片中擷取醒目的色彩。若要建立 `Palette`，您需要存取圖片的 `Bitmap`。這可以透過幾種方式來達成：

您可以透過設定 `ImageRequest.Listener` 並排入 `ImageRequest` 來存取圖片的 Bitmap：

```kotlin
imageView.load("https://example.com/image.jpg") {
    // 停用硬體點陣圖，因為 Palette 需要讀取圖片的像素。
    allowHardware(false)
    listener(
        onSuccess = { _, result ->
            // 在背景執行緒建立調色盤。
            Palette.Builder(result.image.toBitmap()).generate { palette ->
                // 使用調色盤。
            }
        }
    )
}
```

## 使用記憶體快取索引鍵作為占位符號 {id="using-a-memory-cache-key-as-a-placeholder"}

如果兩張圖片相同但以不同尺寸載入，將先前請求的 `MemoryCache.Key` 作為後續請求的占位符號會非常實用。例如，若第一個請求載入 100x100 的圖片，而第二個請求載入 500x500 的圖片，我們可以將第一張圖片作為第二個請求的同步占位符號。

以下是此效果在範例應用程式中的呈現外觀：

<p style="text-align: center;">
    <video width="360" height="640" autoplay loop muted playsinline>
        <source src="../images/crossfade.mp4" type="video/mp4">
    </video>
</p>

*清單中的圖片特意以極低細節載入，且放慢了淡入淡出速度以突顯視覺效果。*

若要實現此效果，請將第一個請求的 `MemoryCache.Key` 作為第二個請求的 `ImageRequest.placeholderMemoryCacheKey`。範例如下：

```kotlin
// 第一個請求
listImageView.load("https://example.com/image.jpg")

// 第二個請求（在第一個請求完成後）
detailImageView.load("https://example.com/image.jpg") {
    placeholderMemoryCacheKey(listImageView.result.memoryCacheKey)
}
```

## Compose AnimatedContent {id="compose-animatedcontent"}

使用 `rememberAsyncImagePainter` 和 `AnimatedContent` 在占位符號與已載入的圖片之間建立切換動畫：

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
            // 在 model 變更後淡出動畫期間，保持舊圖片可見。
            Image(
                painter = targetState.painter,
                contentDescription = stringResource(R.string.description),
            )
        }
        is AsyncImagePainter.State.Error -> ErrorContent()
    }
}
```

將 `targetState.painter` 傳遞給 `Image`，讓舊圖片在 model 變更後的淡出動畫期間仍保持可見。

在載入完成前，最終圖片的尺寸是未知的。請使用固定約束或已知的長寬比來預留空間。

即使圖片存在於記憶體快取中，`rememberAsyncImagePainter` 也會以 `State.Empty` 開始。如果需要，可使用 `state.result.dataSource` 來跳過記憶體快取圖片的動畫。

注意：`AnimatedContent` 的開銷遠大於 painter 淡入淡出，並且會將舊圖片保留在記憶體中直到動畫結束。在延遲清單（lazy lists）或簡單的淡入淡出情境中，建議優先使用 `ImageRequest.Builder.crossfade`。

## 共享元素轉換 (Shared Element Transitions) {id="shared-element-transitions"}

[共享元素轉換](https://developer.android.com/training/transitions/start-activity)可讓您在 `Activities` 和 `Fragments` 之間建立動畫。以下是讓它們與 Coil 搭配使用的一些建議：

- **共享元素轉換與硬體點陣圖 (hardware bitmaps) 不相容。** 您應該設定 `allowHardware(false)`，針對動畫起始的 `ImageView` 以及動畫目標 view 同時停用硬體點陣圖。若未設定，該轉換將擲出 `java.lang.IllegalArgumentException: Software rendering doesn't support hardware bitmaps` 例外狀況。

- 將起始圖片的 `MemoryCache.Key` 作為結束圖片的 [`placeholderMemoryCacheKey`](/coil/api/coil-core/coil3.request/-image-request/-builder/placeholder-memory-cache-key.html)。這可確保將起始圖片作為結束圖片的占位符號，若圖片已在記憶體快取中，則可實現平滑轉換且不會出現白閃。

- 同時使用 [`ChangeImageTransform`](https://developer.android.com/reference/android/transition/ChangeImageTransform) 和 [`ChangeBounds`](https://developer.android.com/reference/android/transition/ChangeBounds) 以獲得最佳效果。

正在使用 Compose？[請參閱這篇文章，了解如何搭配 `AsyncImage` 執行共享元素轉換](https://www.tunjid.com/articles/animating-contentscale-during-image-shared-element-transitions-65fba03537c67f8df0161c31)。

## Remote Views {id="remote-views"}

Coil 未開箱即用提供 [`RemoteViews`](https://developer.android.com/reference/android/widget/RemoteViews) 的 `Target`，但您可以像這樣建立一個：

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

接著照常 `enqueue`/`execute` 該請求：

```kotlin
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .target(RemoteViewsTarget(context, componentName, remoteViews, imageViewResId))
    .build()
imageLoader.enqueue(request)
```

## 轉換 Painter {id="transforming-painters"}

`AsyncImage` 和 `AsyncImagePainter` 的 `placeholder`/`error`/`fallback` 引數都接受 `Painter`。Painter 雖然不如可組合項 (composables) 靈活，但速度更快，因為 Coil 不需要使用次級組合 (subcomposition)。話雖如此，可能仍需要對 painter 進行內縮 (inset)、延展 (stretch)、色調著色 (tint) 或變形轉換 (transform) 以獲得所需的 UI。若要達成此目的，請[複製此程式片段 (gist) 到您的專案中](https://gist.github.com/colinrtwhite/c2966e0b8584b4cdf0a5b05786b20ae1)，並像這樣包裝 painter：

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

可以使用尾隨 Lambda 運算式覆寫 `onDraw`：

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

## 轉換請求 {id="transforming-requests"}

您可能需要轉換用於擷取圖片的 HTTP 請求。在此範例中，我們將使用 [Interceptor](https://coil-kt.github.io/coil/api/coil-core/coil3.intercept/-interceptor) 在請求 URL 中附加 `width` 和 `height` 查詢參數。

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
            // 寬度與高度不可用，例如由於無限約束。
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

別忘了將攔截器新增至您的 `ImageLoader`！

```kotlin
ImageLoader.Builder(context)
    .components {
        add(UrlSizeInterceptor())
    }
    .build()
```