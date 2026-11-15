# 升级到 Coil 3.x

Coil 3 是 Coil 的下一个主要版本，包含多项重大改进：

- 完整支持 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)，包括所有主要目标平台（Android、iOS、JVM、JS 以及 [WASM](https://coil-kt.github.io/coil/sample/)）。
- 支持多个网络库（Ktor 和 OkHttp）。或者，如果你只需要加载本地/静态文件，也可以在不依赖网络库的情况下使用 Coil。
- 改进了 Compose `@Preview` 渲染，并通过 `LocalAsyncImagePreviewHandler` 支持自定义预览行为。
- 对部分需要破坏现有行为的错误进行了重要修复（详情见下文）。

本文档简要概述了从 Coil 2 到 Coil 3 的主要变更，并重点说明了所有破坏性或重要改动。本文档未涵盖所有的二进制不兼容变更或细微的行为变化。

有关示例项目，请参阅 [Compose Multiplatform 示例](https://github.com/coil-kt/coil/tree/main/samples/compose)。

## Maven 坐标与包名 {id="maven-coordinates-and-package-name"}

Coil 的 Maven 坐标已从 `io.coil-kt` 更新为 `io.coil-kt.coil3`，其包名也已从 `coil` 更新为 `coil3`。这使得 Coil 3 可以与 Coil 2 并行运行，而不会发生二进制兼容性问题。例如，`io.coil-kt:coil:2.7.0` 现在变更为 `io.coil-kt.coil3:coil:3.0.0`。

构件 `coil-base` 和 `coil-compose-base` 分别重命名为 `coil-core` 和 `coil-compose-core`，以与 Coroutines、Ktor 和 AndroidX 所使用的命名约定保持一致。

## 网络图片 {id="network-images"}

**`coil-core` 默认不再支持从网络加载图片。**[你必须添加对 Coil 网络构件之一的依赖项。详细了解请参阅此处。](network.md)。进行此更改是为了让使用者能够使用不同的网络库，或者在应用不需要时避免引入网络依赖项。

此外，默认不再遵循 Cache-Control 标头。详细了解请参阅[此处](network.md)。

## 多平台 {id="multiplatform"}

Coil 3 现已成为一个 Kotlin Multiplatform 库，支持 Android、JVM、iOS、macOS、JavaScript 和 WASM。

在 Android 上，Coil 使用标准图形类来渲染图片。在非 Android 平台上，Coil 使用 [Skiko](https://github.com/JetBrains/skiko) 渲染图片。Skiko 是一套包装了 Google 开发的 [Skia](https://github.com/google/skia) 图形引擎的 Kotlin 绑定。

作为脱离 Android SDK 解耦的一部分，API 进行了多项更改。值得注意的有：

- `Drawable` 已替换为自定义的 `Image` 接口。在 Android 上，使用 `Drawable.asImage()` 和 `Image.asDrawable(resources)` 在类之间进行转换。在非 Android 平台上，使用 `Bitmap.asImage()` 和 `Image.toBitmap()`。
- Android 的 `android.net.Uri` 类的使用已被多平台的 `coil3.Uri` 类取代。将 `android.net.Uri` 作为 `ImageRequest.data` 传递的所有调用站点均不受影响。依赖接收 `android.net.Uri` 的自定义 `Fetcher` 需要更新为使用 `coil3.Uri`。
- `Context` 的使用已被替换为 `PlatformContext`。`PlatformContext` 在 Android 上是 `Context` 的类型别名，在非 Android 平台上可以使用 `PlatformContext.INSTANCE` 进行访问。在 Compose Multiplatform 中，请使用 `LocalPlatformContext.current` 获取引用。
- `Coil` 类已重命名为 `SingletonImageLoader`。
- 如果你在自定义的 Android `Application` 类中实现了 `ImageLoaderFactory`，则需要改为实现 `SingletonImageLoader.Factory` 来替代 `ImageLoaderFactory`。实现 `SingletonImageLoader.Factory` 后，如果你需要或希望重写 `newImageLoader()`，即可对其进行重写。

`coil-svg` 构件已支持多平台，但 `coil-gif` 和 `coil-video` 构件（目前）仍然仅限 Android，因为它们依赖特定的 Android 解码器与库。

## Compose {id="compose"}

构件 `coil-compose` 的 API 大部分保持不变。你可以像在 Coil 2 中一样继续使用 `AsyncImage`、`SubcomposeAsyncImage` 和 `rememberAsyncImagePainter`。此外，这些方法已更新为[可重启与可跳过 (restartable and skippable)](https://developer.android.com/jetpack/compose/performance/stability)，这有助于提升其性能。

- `AsyncImagePainter.state` 现在是一个 `StateFlow`。应当使用 `val state = painter.state.collectAsState()` 来进行观察。
- `AsyncImagePainter` 的默认 `SizeResolver` 不再等待第一次 `onDraw` 调用来获取画布的大小。取而代之的是，`AsyncImagePainter` 默认使用 `Size.ORIGINAL`。
- Compose 的 `modelEqualityDelegate` 委托现在通过 CompositionLocal `LocalAsyncImageModelEqualityDelegate` 设置，而不是作为 `AsyncImage`/`SubcomposeAsyncImage`/`rememberAsyncImagePainter` 的形参传入。

## 常规变更 {id="general"}

其他重要的行为变更包括：

- 官方第一方的 `Fetcher` 和 `Decoder`（例如 `NetworkFetcher.Factory`、`SvgDecoder` 等）现在会通过 ServiceLoader 自动添加到每个新建的 `ImageLoader` 中。可以通过 `ImageLoader.Builder.serviceLoaderEnabled(false)` 禁用此行为。
- 移除对 `android.resource://example.package.name/drawable/image` URI 的支持，因为这会阻碍资源缩减优化。建议直接传递 `R.drawable.image` 值。传递资源 ID 而不是资源名称仍然有效：`android.resource://example.package.name/12345678`。如果你仍然需要此功能，可以[在组件注册表中手动引入 `ResourceUriMapper`](https://github.com/coil-kt/coil/blob/da7d872e340430014dbc5136e35eb62f9b17662e/coil-core/src/androidInstrumentedTest/kotlin/coil3/map/ResourceUriMapper.kt)。
- 默认不再将文件的最后修改时间戳添加到其缓存键中。这是为了避免在主线程上读取磁盘（哪怕耗时极短）。可以通过 `ImageRequest.Builder.addLastModifiedToFileCacheKey(true)` 或 `ImageLoader.Builder.addLastModifiedToFileCacheKey(true)` 重新启用该功能。
- 输出图片尺寸现在强制要求小于 4096x4096，以防止意外的 OOM。可以通过 `ImageLoader/ImageRequest.Builder.maxBitmapSize` 进行配置。若要禁用此行为，请将 `maxBitmapSize` 设置为 `Size.ORIGINAL`。
- Coil 2 的 `Parameters` API 已被 `Extras` 替代。`Extras` 不需要字符串键，而是依赖标识相等性（identity equality）。`Extras` 不支持修改内存缓存键。如果你的 extra 会影响内存缓存键，请改用 `ImageRequest.memoryCacheKeyExtra`。
- 许多 `ImageRequest.Builder` 函数已变更为扩展函数，以便更轻松地支持多平台。