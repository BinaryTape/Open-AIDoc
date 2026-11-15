# Java 互換性

Coil の API は Kotlin ファーストで設計されています。Java では利用できないインラインラムダ、レシーバーパラメーター、デフォルト引数、拡張関数といった Kotlin の言語機能を活用しています。

重要な点として、Java では suspend 関数を実装できません。そのため、カスタムの [Transformations](/coil/api/coil-core/coil3.transform/-transformation)、[Size Resolvers](/coil/api/coil-core/coil3.size/-size-resolver)、[Fetchers](image_pipeline.md#fetchers)、および [Decoders](image_pipeline.md#decoders) は**必ず** Kotlin で実装する必要があります。

これらの制限はあるものの、Coil の API の大部分は Java と互換性があります。シングルトンの `ImageLoader` は次のように取得できます：

```java
ImageLoader imageLoader = SingletonImageLoader.get(context);
```

`ImageRequest` をエンキューする構文は、Java と Kotlin でほぼ同じです：

```java
ImageRequest request = new ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .crossfade(true)
    .target(new ImageViewTarget(imageView))
    .build();
imageLoader.enqueue(request);
```

!!! Note
    Java から `ImageView.load` を使用することはできません。代わりに `ImageRequest.Builder` API を使用してください。

Java から `suspend` 関数を簡単に呼び出すことはできません。そのため、画像を同期的に取得するには、拡張関数 `ImageLoader.executeBlocking` を使用する必要があります。これは Java から次のように呼び出すことができます：

```java
ImageRequest request = new ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .size(1080, 1920)
    .build();
Image image = ImageLoaders.executeBlocking(imageLoader, request).getImage();
Drawable drawable = image == null ? null : Image_androidKt.asDrawable(image, context.getResources());
```

!!! Note
    `ImageLoaders.executeBlocking` は中断（サスペンド）するのではなく、現在のスレッドをブロックします。メインスレッドからこれを呼び出さないでください。