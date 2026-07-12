# Compose

要添加对 [Compose UI](https://www.jetbrains.com/compose-multiplatform/) 的支持，请导入扩展库：

```kotlin
implementation("io.coil-kt.coil3:coil-compose:3.5.0")
```

然后使用 `AsyncImage` 可组合项来加载并显示图像：

```kotlin
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
)
```

`model` 既可以是 `ImageRequest.data` 的值，也可以是 `ImageRequest` 本身。`contentDescription` 用于设置无障碍服务使用的文本，以描述此图像所代表的内容。

## AsyncImage

`AsyncImage` 是一个异步执行图像请求并呈现结果的可组合项。它支持与标准 `Image` 可组合项相同的参数，此外，它还支持设置 `placeholder`/`error`/`fallback` painter 以及 `onLoading`/`onSuccess`/`onError` 回调。以下是一个加载图像并设置圆形裁剪、淡入淡出和占位符的示例：

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

在大多数情况下，请优先使用 `AsyncImage`。它会根据可组合项的约束和提供的 `ContentScale` 正确确定加载图像的尺寸。

## rememberAsyncImagePainter

在内部，`AsyncImage` 和 `SubcomposeAsyncImage` 使用 `rememberAsyncImagePainter` 来加载 `model`。如果你需要的是 `Painter` 而不是可组合项，可以使用 `rememberAsyncImagePainter` 来加载图像：

```kotlin
val painter = rememberAsyncImagePainter("https://example.com/image.jpg")
```

`rememberAsyncImagePainter` 比 `AsyncImage` 和 `SubcomposeAsyncImage` 更灵活，但也有一些缺点（见下文）。

**何时使用此函数：**

如果你需要 `Painter` 而不是可组合项，或者你需要观察 `AsyncImagePainter.state` 并据此绘制不同的可组合项，或者你需要使用 `AsyncImagePainter.restart` 手动重启图像请求，那么此函数非常有用。

此函数的主要缺点是它不会检测图像在屏幕上加载的尺寸，并且始终以原始尺寸加载图像。你可以通过传递自定义的 `SizeResolver` 或使用 `rememberConstraintsSizeResolver`（这是 `AsyncImage` 内部使用的组件）来解决此问题。示例：

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

另一个缺点是，在使用 `rememberAsyncImagePainter` 时，第一次组合的 `AsyncImagePainter.state` 始终为 `AsyncImagePainter.State.Empty` —— 即使图像存在于内存缓存中且会在第一帧绘制。

## SubcomposeAsyncImage

`SubcomposeAsyncImage` 是 `AsyncImage` 的变体，它使用子组合为 `AsyncImagePainter` 的状态提供插槽 API，而不是使用 Painter。示例如下：

```kotlin
SubcomposeAsyncImage(
    model = "https://example.com/image.jpg",
    loading = {
        CircularProgressIndicator()
    },
    contentDescription = stringResource(R.string.description),
)
```

此外，你还可以使用其 `content` 参数和 `SubcomposeAsyncImageContent`（用于呈现当前状态）来实现更复杂的逻辑：

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
    子组合比常规组合慢，因此此可组合项可能不适合 UI 中对性能要求极高的部分（例如 `LazyList`）。

**何时使用此函数：**

如果你需要观察 `AsyncImagePainter.state`，通常建议优先使用 `rememberAsyncImagePainter` 而不是此函数，因为它不使用子组合。

具体而言，只有当你需要观察 `AsyncImagePainter.state`，且不能像使用 `rememberAsyncImagePainter` 那样在第一次组合和第一帧时状态为 `Empty` 时，此函数才有用。`SubcomposeAsyncImage` 使用子组合来获取图像的约束，因此其 `AsyncImagePainter.state` 会立即更新。

## 观察 AsyncImagePainter.state

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
        // 显示某些错误 UI。
    }
}
```

## 过渡

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

自定义 [`Transition`](/coil/api/coil-core/coil3.transition/-transition) 无法与 `AsyncImage`、`SubcomposeAsyncImage` 或 `rememberAsyncImagePainter` 配合使用，因为它们需要 `View` 引用。`CrossfadeTransition` 能够工作是因为有特殊的内部支持。

即便如此，在 Compose 中仍然可以通过观察 `AsyncImagePainter.state` 来创建自定义过渡：

```kotlin
val painter = rememberAsyncImagePainter("https://example.com/image.jpg")

val state by painter.state.collectAsState()
if (state is AsyncImagePainter.State.Success && state.result.dataSource != DataSource.MEMORY_CACHE) {
    // 执行过渡动画。
}

Image(
    painter = painter,
    contentDescription = stringResource(R.string.description),
)
```

有关完整的 `AnimatedContent` 示例，请参阅 [Compose AnimatedContent](/coil/recipes/#compose-animatedcontent)。

## 预览

`AsyncImage`/`rememberAsyncImagePainter`/`SubcomposeAsyncImage` 的 Android Studio 预览行为由 `LocalAsyncImagePreviewHandler` 控制。默认情况下，它会尝试在预览环境中正常执行请求。由于预览环境禁用了网络访问，因此网络 URL 将始终失败。

你可以像这样覆盖预览行为：

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

这对于在相同预览环境中执行的 [AndroidX Compose 预览屏幕截图测试库](https://developer.android.com/studio/preview/compose-screenshot-testing) 也非常有用。

## Compose 多平台资源

Coil 支持通过使用 `Res.getUri` 作为 `model` 参数来加载 [Compose 多平台资源](https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-multiplatform-resources.html)。示例：

```kotlin
AsyncImage(
    model = Res.getUri("drawable/sample.jpg"),
    contentDescription = null,
)
```

!!! Note
    Coil 不支持 `Res.drawable.image` 和其他编译安全引用。你必须改用 `Res.getUri("drawable/image")`。[关注此问题以获取更新](https://github.com/coil-kt/coil/issues/2812)。