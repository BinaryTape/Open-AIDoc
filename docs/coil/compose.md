# Compose

要添加对 [Compose UI](https://www.jetbrains.com/compose-multiplatform/) 的支持，请导入扩展库：

```kotlin
implementation("io.coil-kt.coil3:coil-compose:3.6.3")
```

然后使用 `AsyncImage` 可组合项来加载并显示图片：

```kotlin
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
)
```

`model` 既可以是 `ImageRequest.data` 的值，也可以是 `ImageRequest` 本身。`contentDescription` 用于设置无障碍服务所使用的文本，以描述该图片所呈现的内容。

## AsyncImage {id="asyncimage"}

`AsyncImage` 是一个以异步方式执行图片请求并渲染结果的可组合项。它支持与标准 `Image` 可组合项相同的实参，并且还支持设置 `placeholder`/`error`/`fallback` painter 以及 `onLoading`/`onSuccess`/`onError` 回调。以下是一个加载图片时应用圆形裁剪、淡入淡出（crossfade）并设置占位符的示例：

```kotlin
AsyncImage(
    model = ImageRequest.Builder(LocalContext.current)
        .data("https://example.com/image.jpg")
        .crossfade(true)
        .build(),
    placeholder = painterResource(R.drawable.placeholder),
    contentDescription = stringResource(R.string.description),
    contentScale = ContentScale.Crop,
    modifier = Modifier.clip(CircleShape),
)
```

**何时使用此函数：**

在大多数情况下首选 `AsyncImage`。它会根据可组合项的约束条件以及所提供的 `ContentScale` 正确确定加载图片应采用的尺寸。

## rememberAsyncImagePainter {id="rememberasyncimagepainter"}

在内部，`AsyncImage` 和 `SubcomposeAsyncImage` 使用 `rememberAsyncImagePainter` 来加载 `model`。如果你需要的是 `Painter` 而非可组合项，可以使用 `rememberAsyncImagePainter` 来加载图片：

```kotlin
val painter = rememberAsyncImagePainter("https://example.com/image.jpg")
```

`rememberAsyncImagePainter` 比 `AsyncImage` 和 `SubcomposeAsyncImage` 更灵活，但有一些缺点（见下文）。

**何时使用此函数：**

适用于需要 `Painter` 而非可组合项的情况——或者需要观察 `AsyncImagePainter.state` 并根据其绘制不同的可组合项——亦或需要使用 `AsyncImagePainter.restart` 手动重启图片请求的情况。

此函数的主要缺点在于它不会检测图片在屏幕上加载时的尺寸，并且始终按其原始尺寸加载图片。你可以传入自定义的 `SizeResolver` 或使用 `rememberConstraintsSizeResolver`（这也是 `AsyncImage` 内部所使用的）来解决此问题。示例：

```kotlin
val sizeResolver = rememberConstraintsSizeResolver()
val painter = rememberAsyncImagePainter(
    model = ImageRequest.Builder(LocalPlatformContext.current)
        .data("https://example.com/image.jpg")
        .size(sizeResolver)
        .build(),
)

Image(
    painter = painter,
    contentDescription = null,
    modifier = Modifier.then(sizeResolver),
)
```

另一个缺点是，使用 `rememberAsyncImagePainter` 时，在首次组合中 `AsyncImagePainter.state` 将始终为 `AsyncImagePainter.State.Empty`——即使图片已存在于内存缓存中且会在第一帧绘制。

## SubcomposeAsyncImage {id="subcomposeasyncimage"}

`SubcomposeAsyncImage` 是 `AsyncImage` 的变体，它利用子组合（subcomposition）为 `AsyncImagePainter` 的各种状态提供插槽 API，而不是使用 `Painter`。示例如下：

```kotlin
SubcomposeAsyncImage(
    model = "https://example.com/image.jpg",
    loading = {
        CircularProgressIndicator()
    },
    contentDescription = stringResource(R.string.description),
)
```

此外，你可以利用其 `content` 实参和用于渲染当前状态的 `SubcomposeAsyncImageContent` 来实现更复杂的逻辑：

```kotlin
SubcomposeAsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = stringResource(R.string.description)
) {
    val state by painter.state.collectAsState()
    if (state is AsyncImagePainter.State.Success) {
        SubcomposeAsyncImageContent()
    } else {
        CircularProgressIndicator()
    }
}
```

!!! Note
    子组合比常规组合更慢，因此该可组合项可能不适合用于 UI 中对性能要求极高的部分（例如 `LazyList`）。

**何时使用此函数：**

如果你需要观察 `AsyncImagePainter.state`，通常首选使用 `rememberAsyncImagePainter` 而非此函数，因为它不使用子组合。

具体而言，仅当你需要观察 `AsyncImagePainter.state`，且不能像 `rememberAsyncImagePainter` 那样在首次组合和第一帧中为 `Empty` 时，此函数才有用。`SubcomposeAsyncImage` 使用子组合来获取图片的约束，因此其 `AsyncImagePainter.state` 可以立即更新。

## 观察 AsyncImagePainter.state {id="observing-asyncimagepainter-state"}

```kotlin
val painter = rememberAsyncImagePainter("https://example.com/image.jpg")
val state by painter.state.collectAsState()

when (state) {
    is AsyncImagePainter.State.Empty,
    is AsyncImagePainter.State.Loading -> {
        CircularProgressIndicator()
    }
    is AsyncImagePainter.State.Success -> {
        Image(
            painter = painter,
            contentDescription = stringResource(R.string.description)
        )
    }
    is AsyncImagePainter.State.Error -> {
        // 展示错误 UI。
    }
}
```

## 过渡 {id="transitions"}

你可以使用 `ImageRequest.Builder.crossfade` 启用内置的淡入淡出过渡：

```kotlin
AsyncImage(
    model = ImageRequest.Builder(LocalContext.current)
        .data("https://example.com/image.jpg")
        .crossfade(true)
        .build(),
    contentDescription = null,
)
```

自定义 [`Transition`](/coil/api/coil-core/coil3.transition/-transition) 无法与 `AsyncImage`、`SubcomposeAsyncImage` 或 `rememberAsyncImagePainter` 配合使用，因为它们需要 `View` 引用。而 `CrossfadeTransition` 可以正常工作是因为内部提供了特殊支持。

话虽如此，在 Compose 中可以通过观察 `AsyncImagePainter.state` 来创建自定义过渡：

```kotlin
val painter = rememberAsyncImagePainter("https://example.com/image.jpg")

val state = painter.state.collectAsState().value
if (state is AsyncImagePainter.State.Success && state.result.dataSource != DataSource.MEMORY_CACHE) {
    // 执行过渡动画。
}

Image(
    painter = painter,
    contentDescription = stringResource(R.string.description),
)
```

完整的 `AnimatedContent` 示例请参阅 [Compose AnimatedContent](/coil/recipes#compose-animatedcontent)。

## 预览 {id="previews"}

`AsyncImage`/`rememberAsyncImagePainter`/`SubcomposeAsyncImage` 在 Android Studio 中的预览行为由 `LocalAsyncImagePreviewHandler` 控制。默认情况下，它会在预览环境中尝试正常执行请求。由于预览环境中禁用了网络访问，因此网络 URL 请求将始终失败。

你可以像这样重写预览行为：

```kotlin
val previewHandler = AsyncImagePreviewHandler {
    ColorImage(Color.Red.toArgb())
}

CompositionLocalProvider(LocalAsyncImagePreviewHandler provides previewHandler) {
    AsyncImage(
        model = "https://example.com/image.jpg",
        contentDescription = null,
    )
}
```

这对于在相同预览环境中运行的 [AndroidX 的 Compose Preview 屏幕截图测试库](https://developer.android.com/studio/preview/compose-screenshot-testing) 也非常有用。

## Compose Multiplatform 资源 {id="compose-multiplatform-resources"}

Coil 支持通过将 `Res.getUri` 作为 `model` 形参来加载 [Compose Multiplatform Resources](https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-multiplatform-resources.html)。示例：

```kotlin
AsyncImage(
    model = Res.getUri("drawable/sample.jpg"),
    contentDescription = null,
)
```

!!! Note
    Coil 不支持 `Res.drawable.image` 和其他编译期安全的引用。你必须改用 `Res.getUri("drawable/image")`。[关注此问题获取更新](https://github.com/coil-kt/coil/issues/2812)。