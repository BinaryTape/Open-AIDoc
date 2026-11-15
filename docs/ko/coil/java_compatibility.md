# Java 호환성

Coil의 API는 Kotlin 우선(Kotlin-first)으로 설계되었습니다. 인라인 람다, 수신 객체 파라미터, 기본 인자, 확장 함수 등 Java에서는 지원되지 않는 Kotlin 언어 기능들을 활용합니다.

중요한 점은, `suspend` 함수를 Java에서 구현할 수 없다는 것입니다. 즉, 커스텀 [Transformation](/coil/api/coil-core/coil3.transform/-transformation), [Size Resolver](/coil/api/coil-core/coil3.size/-size-resolver), [Fetcher](image_pipeline.md#fetchers), [Decoder](image_pipeline.md#decoders)는 **반드시** Kotlin으로 구현해야 합니다.

이러한 제한에도 불구하고 Coil API의 대부분은 Java와 호환됩니다. 다음과 같이 싱글톤 `ImageLoader`를 가져올 수 있습니다:

```java
ImageLoader imageLoader = SingletonImageLoader.get(context);
```

`ImageRequest`를 큐에 추가(enqueue)하는 문법은 Java와 Kotlin이 거의 동일합니다:

```java
ImageRequest request = new ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .crossfade(true)
    .target(new ImageViewTarget(imageView))
    .build();
imageLoader.enqueue(request);
```

!!! Note
    Java에서는 `ImageView.load`를 사용할 수 없습니다. 대신 `ImageRequest.Builder` API를 사용하세요.

`suspend` 함수는 Java에서 쉽게 호출할 수 없습니다. 따라서 이미지를 동기적으로 가져오려면 Java에서 다음과 같이 호출할 수 있는 `ImageLoader.executeBlocking` 확장 함수를 사용해야 합니다:

```java
ImageRequest request = new ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .size(1080, 1920)
    .build();
Image image = ImageLoaders.executeBlocking(imageLoader, request).getImage();
Drawable drawable = image == null ? null : Image_androidKt.asDrawable(image, context.getResources());
```

!!! Note
    `ImageLoaders.executeBlocking`은 일시 중단(suspend) 대신 현재 스레드를 차단(block)합니다. 메인 스레드에서는 이를 호출하지 마세요.