# 升级到 Coil 3.x

Coil 3 是 Coil 的下一个主要版本，包含多项重大改进：

- 完全支持 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)，包括所有主要目标平台（Android、iOS、JVM、JS 和 [WASM](/coil/overview)）。
- 支持多种网络库（Ktor 和 OkHttp）。或者，如果您只需要加载本地/静态文件，可以在没有网络依赖的情况下使用 Coil。
- 改进了 Compose `@Preview` 渲染，并通过 `LocalAsyncImagePreviewHandler` 支持自定义预览行为。
- 修复了需要破坏现有行为的重要错误（如下文所述）。

本文档提供了从 Coil 2 到 Coil 3 主要变化的概览，并强调了任何破坏性或重要的变更。它并未涵盖每一个二进制不兼容的变更或微小的行为变化。

在 Compose Multiplatform 项目中使用 Coil 3？请查看 [`samples`](https://github.com/coil-kt/coil/tree/3.x/samples/compose) 仓库获取示例。

## Maven 坐标与包名

Coil 的 Maven 坐标已从 `io.coil-kt` 更新为 `io.coil-kt.coil3`，其包名已从 `coil` 更新为 `coil3`。这允许 Coil 3 与 Coil 2 并存运行，而不会产生二进制兼容性问题。例如，`io.coil-kt:coil:2.7.0` 现在是 `io.coil-kt.coil3:coil:3.0.0`。

`coil-base` 和 `coil-compose-base` 构件分别重命名为 `coil-core` 和 `coil-compose-core`，以符合 Coroutines、Ktor 和 AndroidX 使用的命名约定。

## 网络图像

**`coil-core` 默认不再支持从网络加载图像。**[您必须添加对 Coil 网络构件之一的依赖。点击此处查看更多信息。](network.md)。进行此项更改是为了让使用者可以使用不同的网络库，或者在应用不需要时避免引入网络依赖。

此外，默认情况下不再遵循缓存控制标头。详见[此处](network.md)。

## 多平台

Coil 3 现在是一个 Kotlin Multiplatform 库，支持 Android、JVM、iOS、macOS、Javascript 和 WASM。

在 Android 上，Coil 使用标准图形类来渲染图像。在非 Android 平台上，Coil 使用 [Skiko](https://github.com/JetBrains/skiko) 渲染图像。Skiko 是包装了 Google 开发的 [Skia](https://github.com/google/skia) 图形引擎的一组 Kotlin 绑定。

作为从 Android SDK 解耦的一部分，进行了一些 API 变更。特别地：

- `Drawable` 被替换为自定义的 `Image` 接口。在 Android 上，使用 `Drawable.asImage()` 和 `Image.asDrawable(resources)` 在这些类之间进行转换。在非 Android 平台上，使用 `Bitmap.asImage()` 和 `Image.toBitmap()`。
- Android 的 `android.net.Uri` 类的用法被替换为多平台 `coil3.Uri` 类。任何将 `android.net.Uri` 作为 `ImageRequest.data` 传递的调用站点不受影响。依赖于接收 `android.net.Uri` 的自定义 `Fetcher` 需要更新以使用 `coil3.Uri`。
- `Context` 的用法已替换为 `PlatformContext`。`PlatformContext` 在 Android 上是 `Context` 的类型别名，在非 Android 平台上可以通过 `PlatformContext.INSTANCE` 访问。在 Compose Multiplatform 中使用 `LocalPlatformContext.current` 来获取引用。
- `Coil` 类已重命名为 `SingletonImageLoader`。
- 如果您在自定义 Android `Application` 类中实现了 `ImageLoaderFactory`，则需要切换为实现 `SingletonImageLoader.Factory` 以替换 `ImageLoaderFactory`。一旦您实现了 `SingletonImageLoader.Factory`，如果您需要或想要重写 `newImageLoader()`，您将能够重写它。

`coil-svg` 构件在多平台中受支持，但 `coil-gif` 和 `coil-video` 构件（目前）仍仅限 Android，因为它们依赖于特定的 Android 解码器和库。

## Compose

`coil-compose` 构件的 API 基本保持不变。您可以继续以与 Coil 2 相同的方式使用 `AsyncImage`、`SubcomposeAsyncImage` 和 `rememberAsyncImagePainter`。此外，这些方法已更新为[可重启且可跳过 (restartable and skippable)](https://developer.android.com/jetpack/compose/performance/stability)，这应该会提高它们的性能。

- `AsyncImagePainter.state` 现在是一个 `StateFlow`。应使用 `val state = painter.state.collectAsState()` 进行观察。
- `AsyncImagePainter` 的默认 `SizeResolver` 不再等待第一次 `onDraw` 调用来获取画布大小。相反，`AsyncImagePainter` 默认为 `Size.ORIGINAL`。
- Compose 的 `modelEqualityDelegate` 委托现在通过组合本地项 `LocalAsyncImageModelEqualityDelegate` 进行设置，而不是作为 `AsyncImage`/`SubcomposeAsyncImage`/`rememberAsyncImagePainter` 的参数。

## 通用

其他重要的行为变化包括：

- 原生 `Fetcher` 和 `Decoder`（例如 `NetworkFetcher.Factory`、`SvgDecoder` 等）现在通过服务加载器自动添加到每个新的 `ImageLoader` 中。可以通过 `ImageLoader.Builder.serviceLoaderEnabled(false)` 禁用此行为。
- 移除了对 `android.resource://example.package.name/drawable/image` URI 的支持，因为它会阻碍资源缩减 (resource shrinking) 优化。建议直接传递 `R.drawable.image` 值。传递资源 ID 而不是资源名称仍然有效：`android.resource://example.package.name/12345678`。如果您仍然需要该功能，可以[手动将 `ResourceUriMapper` 包含在您的组件注册表中](https://github.com/coil-kt/coil/blob/da7d872e340430014dbc5136e35eb62f9b17662e/coil-core/src/androidInstrumentedTest/kotlin/coil3/map/ResourceUriMapper.kt)。
- 文件的最后写入时间戳默认不再添加到其缓存键中。这是为了避免在主线程上读取磁盘（即使时间非常短）。可以通过 `ImageRequest.Builder.addLastModifiedToFileCacheKey(true)` 或 `ImageLoader.Builder.addLastModifiedToFileCacheKey(true)` 重新启用。
- 输出图像尺寸现在强制限制在 4096x4096 以下，以防止意外的 OOM。可以通过 `ImageLoader/ImageRequest.Builder.maxBitmapSize` 进行配置。要禁用此行为，请将 `maxBitmapSize` 设置为 `Size.ORIGINAL`。
- Coil 2 的 `Parameters` API 已被 `Extras` 取代。`Extras` 不需要字符串键，而是依赖于标识等价性。`Extras` 不支持修改内存缓存键。相反，如果您的 extra 影响内存缓存键，请使用 `ImageRequest.memoryCacheKeyExtra`。
- 许多 `ImageRequest.Builder` 函数已移至扩展函数，以更轻松地支持多平台。