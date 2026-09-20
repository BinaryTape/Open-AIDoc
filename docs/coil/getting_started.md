# 快速入门

## Compose UI {id="compose-ui"}

典型的 Compose UI 项目通常需要导入：

```kotlin
implementation("io.coil-kt.coil3:coil-compose:3.6.3")
implementation("io.coil-kt.coil3:coil-network-okhttp:3.6.3")
```

导入后，您可以使用 `AsyncImage` 从网络加载图像：

```kotlin
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
)
```

!!! Note
    如果您使用 Compose Multiplatform，则需要使用 Ktor 而非 OkHttp。请参阅[此处](network.md#ktor-network-engines)了解操作方法。

## Android 视图 {id="android-views"}

如果您使用 Android 视图而非 Compose UI，请导入：

```kotlin
implementation("io.coil-kt.coil3:coil:3.6.3")
implementation("io.coil-kt.coil3:coil-network-okhttp:3.6.3")
```

导入后，您可以使用 `ImageView.load` 扩展函数从网络加载图像：

```kotlin
imageView.load("https://example.com/image.jpg")
```

## 配置单例 ImageLoader {id="configuring-the-singleton-imageloader"}

默认情况下，Coil 包含一个单例 `ImageLoader`。`ImageLoader` 通过获取、解码、缓存并返回结果来执行传入的 `ImageRequest`。您无需配置您的 `ImageLoader`；如果您不配置，Coil 将使用默认配置创建单例 `ImageLoader`。

您可以通过多种方式进行配置（**仅限选择一种**）：

- 在应用的入口点附近（应用的根 `@Composable`）调用 `setSingletonImageLoaderFactory`。**这最适合 Compose Multiplatform 应用。**

```kotlin
setSingletonImageLoaderFactory { context ->
    ImageLoader.Builder(context)
        .crossfade(true)
        .build()
}
```

- 在 Android 的 [`Application`](https://developer.android.com/reference/android/app/Application) 中实现 `SingletonImageLoader.Factory`。**这最适合 Android 应用。**

```kotlin
class CustomApplication : Application(), SingletonImageLoader.Factory {
    override fun newImageLoader(context: Context): ImageLoader {
        return ImageLoader.Builder(context)
            .crossfade(true)
            .build()
    }
}
```

- 在应用的入口点附近（例如 Android 中的 `Application.onCreate`）调用 `SingletonImageLoader.setSafe`。这是最灵活的方式。

```kotlin
SingletonImageLoader.setSafe { context ->
    ImageLoader.Builder(context)
        .crossfade(true)
        .build()
}
```

!!! Note
    如果您正在编写依赖于 Coil 的库，则**不应**获取/设置单例 `ImageLoader`。相反，您应该依赖 `io.coil-kt.coil3:coil-core`，创建自己的 `ImageLoader` 并手动传递。如果您在库中设置了单例 `ImageLoader`，若使用您库的应用也使用了 Coil，您可能会覆盖该应用设置的 `ImageLoader`。

## 图像 {id="images"}

为了支持多平台渲染，Coil 3.x 使用了自定义的 `coil3.Image` 类。它取代了 Android 的 `Drawable`，但与其完全互操作：

```kotlin
val drawable = image.asDrawable(resources)
val image = drawable.asImage()
```

Coil 还定义了一个 `coil3.Bitmap` 类，它是 Android 上的 `android.graphics.Bitmap` 或非 Android 平台上的 `org.jetbrains.skia.Bitmap` 的类型别名：

```kotlin
val bitmap = image.toBitmap()
val image = bitmap.asImage()
```

它也与 Compose UI 的 `Painter` 类互操作。该扩展函数需要导入 `coil-compose-core` 构件：

```kotlin
val painter = image.asPainter()
```

!!! Note
    `Painter` 无法转换为 `Image`，因为 painter 只能在组合（composition）内部渲染，而 `Image` 必须能够在任何 `Canvas` 上渲染。

## 构件 {id="artifacts"}

以下是 Coil 发布到 `mavenCentral()` 的主要构件列表：

* `io.coil-kt.coil3:coil`：默认构件，依赖于 `io.coil-kt.coil3:coil-core`。它包含一个单例 `ImageLoader` 和相关的扩展函数。
* `io.coil-kt.coil3:coil-core`：`io.coil-kt.coil3:coil` 的子集，**不包含**单例 `ImageLoader` 及相关的扩展函数。
* `io.coil-kt.coil3:coil-compose`：默认的 [Compose UI](https://www.jetbrains.com/compose-multiplatform/) 构件，依赖于 `io.coil-kt.coil3:coil` 和 `io.coil-kt.coil3:coil-compose-core`。它包含使用单例 `ImageLoader` 的 `AsyncImage`、`rememberAsyncImagePainter` 和 `SubcomposeAsyncImage` 的重载。
* `io.coil-kt.coil3:coil-compose-core`：`io.coil-kt.coil3:coil-compose` 的子集，不包含依赖单例 `ImageLoader` 的函数。
* `io.coil-kt.coil3:coil-network-okhttp`：包含对使用 [OkHttp](https://github.com/square/okhttp) 从网络获取图像的支持。
* `io.coil-kt.coil3:coil-network-ktor2`：包含对使用 [Ktor 2](https://github.com/ktorio/ktor) 从网络获取图像的支持。
* `io.coil-kt.coil3:coil-network-ktor3`：包含对使用 [Ktor 3](https://github.com/ktorio/ktor) 从网络获取图像的支持。
* `io.coil-kt.coil3:coil-network-cache-control`：包含在从网络获取图像时对 [`Cache-Control` 标头](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) 的支持。
* `io.coil-kt.coil3:coil-gif`：包含两个[解码器](/coil/api/coil-core/coil3.decode/-decoder)以支持 GIF 解码。详见 [GIF](gifs.md)。
* `io.coil-kt.coil3:coil-svg`：包含一个[解码器](/coil/api/coil-core/coil3.decode/-decoder)以支持 SVG 解码。详见 [SVG](svgs.md)。
* `io.coil-kt.coil3:coil-video`：包含一个[解码器](/coil/api/coil-core/coil3.decode/-decoder)以支持从[任何 Android 支持的视频格式](https://developer.android.com/guide/topics/media/media-formats#video-codecs)中解码帧。详见[视频](videos.md)。
* `io.coil-kt.coil3:coil-test`：包含支持测试的类。详见[测试](testing.md)。
* `io.coil-kt.coil3:coil-bom`：包含 [BOM (物料清单)](https://docs.gradle.org/7.2/userguide/platforms.html#sub:bom_import)。导入 `coil-bom` 允许您在不指定版本的情况下依赖其他 Coil 构件。