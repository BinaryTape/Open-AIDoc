# 常用示例

本页面提供了关于如何使用 Coil 处理一些常见用例的指导。您可能需要修改这些代码以符合您的确切需求，但希望这能为您提供正确的方向！

发现有未涵盖的常用用例？欢迎提交包含新章节的拉取请求 (PR)。

## Palette

[Palette](https://developer.android.com/training/material/palette-colors?hl=en) 允许您从图像中提取显著颜色。要创建 `Palette`，您需要访问图像的 `Bitmap`。这可以通过多种方式实现：

您可以通过设置 `ImageRequest.Listener` 并将 `ImageRequest` 加入队列来获取图像的位图：

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

## 使用内存缓存键作为占位符

如果两个图像相同但加载尺寸不同，将前一个请求的 `MemoryCache.Key` 用作后续请求的占位符会非常有用。例如，如果第一个请求以 100x100 加载图像，而第二个请求以 500x500 加载图像，我们可以将第一个图像用作第二个请求的同步占位符。

以下是示例应用中该效果的展示：

<p style="text-align: center;">
    <video width="360" height="640" autoplay loop muted playsinline>
        <source src="../images/crossfade.mp4" type="video/mp4">
    </video>
</p>

*列表中的图像故意以极低细节加载，且淡入淡出效果被放慢，以突出视觉效果。*

要实现此效果，请将第一个请求的 `MemoryCache.Key` 作为第二个请求的 `ImageRequest.placeholderMemoryCacheKey`。示例如下：

```kotlin
// 第一个请求
listImageView.load("https://example.com/image.jpg")

// 第二个请求（一旦第一个请求完成）
detailImageView.load("https://example.com/image.jpg") {
    placeholderMemoryCacheKey(listImageView.result.memoryCacheKey)
}
```

## Compose AnimatedContent

使用 `rememberAsyncImagePainter` 和 `AnimatedContent` 在占位符和加载的图像之间制作动画：

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
            // 在模型更改后制作退出动画时，保持旧图像可见。
            Image(
                painter = targetState.painter,
                contentDescription = stringResource(R.string.description),
            )
        }
        is AsyncImagePainter.State.Error -> ErrorContent()
    }
}
```

将 `targetState.painter` 传递给 `Image`，以便在模型更改后制作退出动画时，旧图像保持可见。

在加载完成之前，最终图像尺寸是未知的。请使用固定约束或已知的宽高比来预留空间。

`rememberAsyncImagePainter` 以 `State.Empty` 开始，即使图像在内存缓存中也是如此。如果需要，可以使用 `state.result.dataSource` 来跳过内存缓存图像的动画。

注意：`AnimatedContent` 的开销比 painter 淡入淡出大得多，并且会一直将旧图像保留在内存中，直到动画结束。在延迟列表或简单的淡入淡出效果中，请优先使用 `ImageRequest.Builder.crossfade`。

## 共享元素转换

[共享元素转换](https://developer.android.com/training/transitions/start-activity)允许您在 `Activities` 和 `Fragments` 之间制作动画。以下是关于如何让它们与 Coil 协同工作的一些建议：

- **共享元素转换与硬件位图不兼容。** 您应该为制作动画的起始 `ImageView` 和结束视图都设置 `allowHardware(false)` 以禁用硬件位图。如果不这样做，转换将抛出 `java.lang.IllegalArgumentException: Software rendering doesn't support hardware bitmaps` 异常。

- 将起始图像的 `MemoryCache.Key` 用作结束图像的 [`placeholderMemoryCacheKey`](/coil/api/coil-core/coil3.request/-image-request/-builder/placeholder-memory-cache-key)。这可以确保起始图像被用作结束图像的占位符，如果图像在内存缓存中，这将实现平滑转换且没有白色闪烁。

- 同时使用 [`ChangeImageTransform`](https://developer.android.com/reference/android/transition/ChangeImageTransform) 和 [`ChangeBounds`](https://developer.android.com/reference/android/transition/ChangeBounds) 以获得最佳效果。

正在使用 Compose？[查看这篇文章，了解如何使用 `AsyncImage` 执行共享元素转换](https://www.tunjid.com/articles/animating-contentscale-during-image-shared-element-transitions-65fba03537c67f8df0161c31)。

## Remote Views

Coil 没有开箱即用地为 [`RemoteViews`](https://developer.android.com/reference/android/widget/RemoteViews) 提供 `Target`，但您可以像这样创建一个：

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

然后像往常一样 `enqueue`/`execute` 请求：

```kotlin
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .target(RemoteViewsTarget(context, componentName, remoteViews, imageViewResId))
    .build()
imageLoader.enqueue(request)
```

## 转换 Painter

`AsyncImage` 和 `AsyncImagePainter` 都有接受 `Painter` 的 `placeholder`/`error`/`fallback` 参数。Painter 的灵活性不如使用组合项，但速度更快，因为 Coil 不需要使用子组合。即便如此，可能仍需要对您的 painter 进行内切、拉伸、着色或转换以获得所需的 UI。要实现这一点，请[将此代码片段 (Gist) 复制到您的项目中](https://gist.github.com/colinrtwhite/c2966e0b8584b4cdf0a5b05786b20ae1)并像这样包装 painter：

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

可以使用尾随 lambda 重写 `onDraw`：

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

## 转换请求

您可能需要转换用于获取图像的 HTTP 请求。在此示例中，我们将使用一个 [Interceptor](https://coil-kt.github.io/coil/api/coil-core/coil3.intercept/-interceptor) 将 `width` 和 `height` 查询参数附加到请求 URL。

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

别忘了在您的 `ImageLoader` 中注册并添加拦截器！

```kotlin
ImageLoader.Builder(context)
    .components {
        add(UrlSizeInterceptor())
    }
    .build()