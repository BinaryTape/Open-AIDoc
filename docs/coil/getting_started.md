# 快速入门

## Compose UI {id="compose-ui"}

典型的 Compose UI 项目通常需要导入：

```kotlin
implementation("io.coil-kt.coil3:coil-compose:3.6.3")
implementation("io.coil-kt.coil3:coil-network-okhttp:3.6.3")
```

导入后，你就可以使用 `AsyncImage` 从网络加载图片：

```kotlin
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
)
```

!!! Note
    OkHttp 支持 Android 和桌面 JVM。如需编写同样面向 iOS 或 Web 的共享网络代码，请参阅 [Ktor 网络引擎](network.md#ktor-network-engines)。

## Android Views {id="android-views"}

如果你使用的是 Android Views 而不是 Compose UI，请导入：

```kotlin
implementation("io.coil-kt.coil3:coil:3.6.3")
implementation("io.coil-kt.coil3:coil-network-okhttp:3.6.3")
```

导入后，你可以使用 `ImageView.load` 扩展函数从网络加载图片：

```kotlin
imageView.load("https://example.com/image.jpg")
```

## 配置单例 ImageLoader {id="configuring-the-singleton-imageloader"}

默认情况下，Coil 包含一个单例 `ImageLoader`。该 `ImageLoader` 通过获取、解码、缓存并返回结果来执行传入的 `ImageRequest`。你无需手动配置 `ImageLoader`；如果你未进行配置，Coil 会使用默认配置创建单例 `ImageLoader`。

你可以通过多种方式对其进行配置（**仅选择其中一种**）：

- 在应用程序的入口点附近（应用程序的根 `@Composable`）调用 `setSingletonImageLoaderFactory`。**此方式最适合 Compose Multiplatform 应用程序。**

```kotlin
setSingletonImageLoaderFactory { context ->
    ImageLoader.Builder(context)
        .crossfade(true)
        .build()
}
```

- 在 Android 的 [`Application`](https://developer.android.com/reference/android/app/Application) 上实现 `SingletonImageLoader.Factory`。**此方式最适合 Android 应用程序。**

```kotlin
class CustomApplication : Application(), SingletonImageLoader.Factory {
    override fun newImageLoader(context: Context): ImageLoader {
        return ImageLoader.Builder(context)
            .crossfade(true)
            .build()
    }
}
```

- 在应用程序的入口点附近（例如 Android 中的 `Application.onCreate`）调用 `SingletonImageLoader.setSafe`。这是最灵活的方式。

```kotlin
SingletonImageLoader.setSafe { context ->
    ImageLoader.Builder(context)
        .crossfade(true)
        .build()
}
```

!!! Note
    如果你正在编写依赖 Coil 的库，则**不应该**获取/设置单例 `ImageLoader`。相反，你应该依赖 `io.coil-kt.coil3:coil-core`，创建你自己的 `ImageLoader` 并手动传递它。如果你在库中设置了单例 `ImageLoader`，当使用该库的应用程序同样使用了 Coil 时，可能会覆盖掉该应用程序设置的 `ImageLoader`。

## Images {id="images"}

为了支持多平台渲染，Coil 3.x 使用了自定义的 `coil3.Image` 类。它取代了 Android 的 `Drawable`，但与其完全互操作：

```kotlin
val drawable = image.asDrawable(resources)
val image = drawable.asImage()
```

Coil 还定义了一个 `coil3.Bitmap` 类，它在 Android 上是 `android.graphics.Bitmap` 的类型别名，在非 Android 平台上则是 `org.jetbrains.skia.Bitmap` 的类型别名：

```kotlin
val bitmap = image.toBitmap()
val image = bitmap.asImage()
```

它还可以与 Compose UI 的 `Painter` 类互操作。此扩展函数需要导入 `coil-compose-core` 构件：

```kotlin
val painter = image.asPainter(LocalPlatformContext.current)
```

!!! Note
    `Painter` 无法转换为 `Image`，因为 Painter 只能在组合（composition）内部渲染，而 `Image` 必须能够在任何 `Canvas` 上渲染。

## 构件 (Artifacts) {id="artifacts"}

以下是 Coil 发布到 `mavenCentral()` 的主要构件列表：

* `io.coil-kt.coil3:coil`：默认构件，依赖于 `io.coil-kt.coil3:coil-core`。它包含单例 `ImageLoader` 以及相关的扩展函数。
* `io.coil-kt.coil3:coil-core`：`io.coil-kt.coil3:coil` 的子集，**不包含**单例 `ImageLoader` 及相关的扩展函数。
* `io.coil-kt.coil3:coil-compose`：默认的 [Compose UI](https://www.jetbrains.com/compose-multiplatform/) 构件，依赖于 `io.coil-kt.coil3:coil` 和 `io.coil-kt.coil3:coil-compose-core`。它包含使用单例 `ImageLoader` 的 `AsyncImage`、`rememberAsyncImagePainter` 和 `SubcomposeAsyncImage` 重载。
* `io.coil-kt.coil3:coil-compose-core`：`io.coil-kt.coil3:coil-compose` 的子集，不包含依赖单例 `ImageLoader` 的函数。
* `io.coil-kt.coil3:coil-network-okhttp`：包含使用 [OkHttp](https://github.com/square/okhttp) 从网络获取图片的支持。
* `io.coil-kt.coil3:coil-network-ktor2`：包含使用 [Ktor 2](https://github.com/ktorio/ktor) 从网络获取图片的支持。
* `io.coil-kt.coil3:coil-network-ktor3`：包含使用 [Ktor 3](https://github.com/ktorio/ktor) 从网络获取图片的支持。
* `io.coil-kt.coil3:coil-network-httpengine`：包含使用 Android 的 [HttpEngine](https://developer.android.com/reference/android/net/http/HttpEngine) 从网络获取图片的支持。要求 Android API >= 34。
* `io.coil-kt.coil3:coil-network-cache-control`：包含在从网络获取图片时遵循 [`Cache-Control` 请求头](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) 的支持。
* `io.coil-kt.coil3:coil-gif`：包含两个用于支持 GIF 解码的[解码器](/coil/api/coil-core/coil3.decode/-decoder)。详情请参阅 [GIF](gifs.md)。
* `io.coil-kt.coil3:coil-svg`：包含一个用于支持 SVG 解码的[解码器](/coil/api/coil-core/coil3.decode/-decoder)。详情请参阅 [SVG](svgs.md)。
* `io.coil-kt.coil3:coil-video`：包含一个[解码器](/coil/api/coil-core/coil3.decode/-decoder)，用于支持从[任何 Android 支持的视频格式](https://developer.android.com/guide/topics/media/media-formats#video-codecs)中解码帧。详情请参阅[视频](videos.md)。
* `io.coil-kt.coil3:coil-test`：包含支持测试的类。详情请参阅[测试](testing.md)。
* `io.coil-kt.coil3:coil-bom`：包含[物料清单 (BOM)](https://docs.gradle.org/7.2/userguide/platforms.html#sub:bom_import)。导入 `coil-bom` 允许你在依赖其他 Coil 构件时无需指定版本。