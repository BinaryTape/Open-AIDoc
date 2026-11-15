# Java 相容性

Coil 的 API 設計以 Kotlin 優先（Kotlin-first）。它充分利用了 Java 中不具備的 Kotlin 語言特性，例如內嵌 Lambda、接收者參數、預設引數以及擴充函式。

重要的是，Java 無法實作 suspend 函式。這意味著自訂的 [Transformations](/coil/api/coil-core/coil3.transform/-transformation)、[Size Resolvers](/coil/api/coil-core/coil3.size/-size-resolver)、[Fetchers](image_pipeline.md#fetchers) 和 [Decoders](image_pipeline.md#decoders) **必須**使用 Kotlin 實作。

儘管有這些限制，Coil 的大部分 API 仍與 Java 相容。你可以使用以下方式取得單例 `ImageLoader`：

```java
ImageLoader imageLoader = SingletonImageLoader.get(context);
```

在 Java 和 Kotlin 中，將 `ImageRequest` 排入佇列的語法幾乎相同：

```java
ImageRequest request = new ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .crossfade(true)
    .target(new ImageViewTarget(imageView))
    .build();
imageLoader.enqueue(request);
```

!!! Note
    無法從 Java 使用 `ImageView.load`。請改用 `ImageRequest.Builder` API。

在 Java 中無法輕易呼叫 `suspend` 函式。因此，若要同步取得圖片，你必須使用 `ImageLoader.executeBlocking` 擴充函式，在 Java 中可以這樣呼叫：

```java
ImageRequest request = new ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .size(1080, 1920)
    .build();
Image image = ImageLoaders.executeBlocking(imageLoader, request).getImage();
Drawable drawable = image == null ? null : Image_androidKt.asDrawable(image, context.getResources());
```

!!! Note
    `ImageLoaders.executeBlocking` 會阻塞當前執行緒而不是掛起。切勿在主執行緒中呼叫此方法。