# Java 兼容性

Coil 的 API 采用 Kotlin 优先的设计。它充分利用了 Java 中不具备的 Kotlin 语言功能，例如内联 lambda、接收者形参、默认实参以及扩展函数。

重要的是，`suspend` 函数无法在 Java 中实现。这意味着自定义的 [Transformations](/coil/api/coil-core/coil3.transform/-transformation)、[Size Resolvers](/coil/api/coil-core/coil3.size/-size-resolver)、[Fetchers](image_pipeline.md#fetchers) 和 [Decoders](image_pipeline.md#decoders)**必须**在 Kotlin 中实现。

尽管存在这些限制，Coil 的大部分 API 仍兼容 Java。你可以通过以下方式获取单例 `ImageLoader`：

```java
ImageLoader imageLoader = SingletonImageLoader.get(context);
```

在 Java 和 Kotlin 中，将 `ImageRequest` 加入队列的语法几乎相同：

```java
ImageRequest request = new ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .crossfade(true)
    .target(new ImageViewTarget(imageView))
    .build();
imageLoader.enqueue(request);
```

!!! Note
    无法在 Java 中使用 `ImageView.load`。请改用 `ImageRequest.Builder` API。

`suspend` 函数无法直接在 Java 中便捷地调用。因此，若要同步获取图片，你必须使用 `ImageLoader.executeBlocking` 扩展函数，可以像这样在 Java 中调用：

```java
ImageRequest request = new ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .size(1080, 1920)
    .build();
Image image = ImageLoaders.executeBlocking(imageLoader, request).getImage();
Drawable drawable = image == null ? null : Image_androidKt.asDrawable(image, context.getResources());
```

!!! Note
    `ImageLoaders.executeBlocking` 会阻塞当前线程而不是挂起。请勿在主线程中调用此方法。