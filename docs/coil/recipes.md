# 实用指南

本页提供了关于如何使用 Coil 处理一些常见用例的指导。你可能需要根据具体要求修改这些代码，但希望它能为你指明正确的方向！

发现了未涵盖的常见用例？欢迎提交拉取请求 (PR) 来新增章节。

## Palette {id="palette"}

[Palette](https://developer.android.com/training/material/palette-colors?hl=en) 允许你从图像中提取出主要颜色。要创建 `Palette`，你需要获取图像的 `Bitmap`。这可以通过多种方式实现：

你可以通过设置 `ImageRequest.Listener` 并将 `ImageRequest` 加入队列来获取图像的位图：

```kotlin
imageView.load("https://example.com/image.jpg") {
    // 禁用硬件位图，因为 Palette 需要读取图像的像素。
    allowHardware(false)
    listener(
        onSuccess = { _, result ->
            // 在后台线程上创建 palette。
            Palette.Builder(result.image.toBitmap()).generate { palette ->
                // 使用 palette。
            }
        }
    )
}
```

## 将内存缓存键用作占位符 {id="using-a-memory-cache-key-as-a-placeholder"}

如果两张图像相同但加载尺寸不同，将前一个请求的 `MemoryCache.Key` 用作后续请求的占位符会非常有用。例如，如果第一个请求加载的是 100x100 的图像，而第二个请求加载的是 500x500 的图像，我们可以将第一张图像用作第二个请求的同步占位符。

以下是该效果在示例应用中的展示：

<p style="text-align: center;">
    <video width="360" height="640" autoplay loop muted playsinline>
        <source src="../images/crossfade.mp4" type="video/mp4">
    </video>
</p>

*列表中故意以极低细节加载图像，并且放慢了淡入淡出速度以突出视觉效果。*

要实现此效果，请将第一个请求的 `MemoryCache.Key` 用作第二个请求的 `ImageRequest.placeholderMemoryCacheKey`。示例如下：

```kotlin
// 第一个请求
listImageView.load("https://example.com/image.jpg")

// 第二个请求（在第一个请求完成后）
detailImageView.load("https://example.com/image.jpg") {
    placeholderMemoryCacheKey(listImageView.result.memoryCacheKey)
}
```

## Compose AnimatedContent {id="compose-animatedcontent"}

使用 `rememberAsyncImagePainter` 和 `AnimatedContent` 在占位符与加载完成的图像之间添加过渡动画：

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
            // 当 model 发生变化后，在旧图像淡出动画期间保持其可见。
            Image(
                painter = targetState.painter,
                contentDescription = stringResource(R.string.description),
            )
        }
        is AsyncImagePainter.State.Error -> ErrorContent()
    }
}
```

将 `targetState.painter` 传递给 `Image`，以便在 model 发生变化后，旧图像在淡出动画期间仍保持可见。

在加载完成之前，最终图像的尺寸是未知的。请使用固定约束或已知宽高比来预留空间。

`rememberAsyncImagePainter` 初始状态为 `State.Empty`，即使图像已存在于内存缓存中也是如此。如有需要，可以使用 `state.result.dataSource` 为内存缓存中的图像跳过动画。

注意：`AnimatedContent` 的开销远高于 painter 淡入淡出，并且在动画结束之前会将旧图像保留在内存中。在惰性列表中或仅需简单的淡入淡出时，建议优先使用 `ImageRequest.Builder.crossfade`。

## 共享元素转换 (Shared Element Transitions) {id="shared-element-transitions"}

[共享元素转换 (Shared element transitions)](https://developer.android.com/training/transitions/start-activity) 允许你在 `Activities` 与 `Fragments` 之间实现过渡动画。以下是让它们与 Coil 配合使用的一些建议：

- **共享元素转换与硬件位图不兼容。** 你应该设置 `allowHardware(false)`，为动画起始的 `ImageView` 和动画目标的视图同时禁用硬件位图。否则，转换过程将抛出 `java.lang.IllegalArgumentException: Software rendering doesn't support hardware bitmaps` 异常。

- 将起始图像的 `MemoryCache.Key` 用作结束图像的 [`placeholderMemoryCacheKey`](/coil/api/coil-core/coil3.request/-image-request/-builder/placeholder-memory-cache-key.html)。这能确保起始图像被用作结束图像的占位符，如果图像位于内存缓存中，则可以实现没有白屏闪烁的平滑过渡。

- 同时使用 [`ChangeImageTransform`](https://developer.android.com/reference/android/transition/ChangeImageTransform) 和 [`ChangeBounds`](https://developer.android.com/reference/android/transition/ChangeBounds) 以获得最佳效果。

正在使用 Compose？[阅读此文章，了解如何使用 `AsyncImage` 执行共享元素转换](https://www.tunjid.com/articles/animating-contentscale-during-image-shared-element-transitions-65fba03537c67f8df0161c31)。

## Remote Views {id="remote-views"}

Coil 并未开箱即用地为 [`RemoteViews`](https://developer.android.com/reference/android/widget/RemoteViews) 提供 `Target`，但你可以按如下方式自行创建一个：

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

然后像往常一样 `enqueue`/`execute` 该请求：

```kotlin
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .target(RemoteViewsTarget(context, componentName, remoteViews, imageViewResId))
    .build()
imageLoader.enqueue(request)
```

## 变换 Painter {id="transforming-painters"}

`AsyncImage` 和 `AsyncImagePainter` 都有接受 `Painter` 的 `placeholder`/`error`/`fallback` 实参。Painter 不如使用可组合项灵活，但速度更快，因为 Coil 不需要使用子组合。尽管如此，可能仍需要对 painter 进行内嵌、拉伸、着色或变换以获得预期的 UI。为此，可以[将此代码片段 (gist) 复制到你的项目中](https://gist.github.com/colinrtwhite/c2966e0b8584b4cdf0a5b05786b20ae1)，并像这样包装 painter：

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

可以使用尾随 lambda 覆盖 `onDraw`：

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

## 转换请求 {id="transforming-requests"}

你可能需要转换用于获取图像的 HTTP 请求。在本例中，我们将使用一个 [Interceptor](https://coil-kt.github.io/coil/api/coil-core/coil3.intercept/-interceptor) 向请求 URL 追加 `width` 和 `height` 查询参数。

```kotlin
class UrlSizeInterceptor : Interceptor {

    override suspend fun intercept(chain: Chain): ImageResult {
        val request = chain.request
        val uri = request.uri

        if (uri == null || uri.scheme !in setOf("https", "http")) {
            // 忽略非 HTTP 请求。
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
            // 宽度和高度不可用，例如由于无限约束。
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

别忘了将该拦截器添加到你的 `ImageLoader` 中！

```kotlin
ImageLoader.Builder(context)
    .components {
        add(UrlSizeInterceptor())
    }
    .build()
```