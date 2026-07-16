# 更新日志

## [3.5.0-beta01] - 2026年5月4日

- 移除 `iosX64` 和 `macosX64` 目标。([#3386](https://github.com/coil-kt/coil/pull/3386))
- 将 Android 的最低 SDK 版本提升至 23。([#3283](https://github.com/coil-kt/coil/pull/3283))
- 在 JS/WASM 上添加快速 WebP 尺寸提取，以避免回退到完整的 Skia 解码。([#3341](https://github.com/coil-kt/coil/pull/3341))
- 修复 `CacheStrategy` 实现无法刷新已缓存的失败响应（例如：已过期的 `404` 缓存响应）的问题。([#3401](https://github.com/coil-kt/coil/pull/3401))
- 更新编译 SDK 至 36。
- 更新 Kotlin 至 2.3.21。
- 更新 Compose 至 1.11.0-beta03。
- 更新 Okio 至 3.17.0。
- 更新 Skiko 至 0.144.5。
- 更新 `androidx.annotation` 至 1.10.0。

## [3.4.0] - 2026年2月24日

- **新增**：添加 `ConcurrentRequestStrategy` 以支持合并针对相同 key 的在途网络请求。([#2995](https://github.com/coil-kt/coil/pull/2995), [#3326](https://github.com/coil-kt/coil/pull/3326))
    - `DeDupeConcurrentRequestStrategy` 可启用此行为，并让等待者等待在途网络请求的结果。
        - 此行为是实验性的，目前默认禁用。
        - 目前，请求始终基于其 `diskCacheKey` 进行合并。
    - `OkHttpNetworkFetcherFactory`、`KtorNetworkFetcherFactory` 和 `NetworkFetcher.Factory` 现在接受 `concurrentRequestStrategy`。
- **新增**：在 JS/WASM 上使用 Web Worker 解码图像，以避免阻塞浏览器主线程。([#3305](https://github.com/coil-kt/coil/pull/3305))
- **新增**：为非 Compose 多平台构件添加对 Linux 原生目标（`linuxX64` 和 `linuxArm64`）的支持。([#3054](https://github.com/coil-kt/coil/pull/3054))
- **新增**：添加仅限 Compose 的 API，以改善后续请求之间的过渡。([#3141](https://github.com/coil-kt/coil/pull/3141), [#3175](https://github.com/coil-kt/coil/pull/3175))
    - `ImageRequest.Builder.useExistingImageAsPlaceholder` 允许在未设置占位符时，从前一个图像进行淡入淡出过渡。
    - `ImageRequest.Builder.preferEndFirstIntrinsicSize` 让 `CrossfadePainter` 优先使用结束绘制器的固有大小。
- **新增**：在 `coil-gif` 中添加 `ImageLoader.Builder.repeatCount(Int)` 以设置全局动画图像循环次数。([#3143](https://github.com/coil-kt/coil/pull/3143))
- **新增**：在 `coil-video` 中添加对优先使用嵌入视频缩略图的支持。([#3107](https://github.com/coil-kt/coil/pull/3107))
- **新增**：随 `coil-core` 发布 `coil-lint`，并添加 lint 检查以捕获 `ImageRequest.Builder` 块中意外的 `kotlin.error()` 调用。([#3304](https://github.com/coil-kt/coil/pull/3304))
- 将 Kotlin 语言版本设置为 2.1。([#3302](https://github.com/coil-kt/coil/pull/3302))
- 使 `BitmapFetcher` 在公共代码中可用。([#3286](https://github.com/coil-kt/coil/pull/3286))
- 在 Android 上创建单例 `ImageLoader` 时使用 `applicationContext`。([#3246](https://github.com/coil-kt/coil/pull/3246))
- 默认缓存符合条件的非 2xx HTTP 响应（例如 `404`），并停止缓存不可缓存的响应（例如 `500`）。([#3137](https://github.com/coil-kt/coil/pull/3137), [#3139](https://github.com/coil-kt/coil/pull/3139))
- 修复消耗 OkHttp 响应体时潜在的竞态条件。([#3186](https://github.com/coil-kt/coil/pull/3186))
- 修复 `maxBitmapSize` 边缘情况，以防止 Android 上出现超大位图崩溃。([#3259](https://github.com/coil-kt/coil/pull/3259))
- 更新 Kotlin 至 2.3.10。
- 更新 Compose 至 1.9.3。
- 更新 Okio 至 3.16.4。
- 更新 Skiko 至 0.9.22.2。
- 更新 `kotlinx-io-okio` 至 0.9.0。
- 更新 `androidx.core` 至 1.16.0。
- 更新 `androidx.lifecycle` 至 2.9.4。
- 更新 `androidx.exifinterface` 至 1.4.2。

## [3.3.0] - 2025年7月22日

- **新增**：引入一个新 API，用于在应用处于后台时限制 Android 上的 `MemoryCache.maxSize`。
    - 如果设置了 `ImageLoader.Builder.memoryCacheMaxSizePercentWhileInBackground`，则当应用处于后台时，`ImageLoader` 的内存缓存将被限制为其最大大小的百分比。此设置目前默认禁用。
    - 当应用切换到后台时，图像将从内存缓存中修剪以达到受限的最大大小，但内存缓存对最近修剪图像的弱引用不受影响。这意味着如果图像当前在其他地方被引用（例如 `AsyncImage`、`ImageView` 等），它仍将存在于内存缓存中。
    - 此 API 对于减少后台内存使用、防止应用过早被杀以及帮助减轻用户设备上的内存压力非常有用。
- **新增**：向 `SvgDecoder` 添加 `Svg.Parser` 参数。
    - 如果默认 SVG 解析器不满足您的需求，这允许使用自定义 SVG 解析器。
- 向 `SvgDecoder` 添加 `density` 参数以支持提供自定义密度乘数。
- 添加 `Uri.Builder` 以支持复制和修改 `Uri`。
- 添加 `ImageLoader.Builder.mainCoroutineContext` 以支持在测试中重写 Coil 对 `Dispatchers.main.immediate` 的使用。
- 修复在动画结束时 `start` 图像被取消引用导致 `CrossfadePainter.intrinsicSize` 发生变化的问题。这与 `CrossfadeDrawable` 的行为一致。
- 修复 Java 无法访问 `ImageLoaders.executeBlocking` 的问题。
- 在 `coil-network-ktor3` 中使用 `kotlinx.io` 的 Okio 互操作模块。
- 更新 `kotlinx-datetime` 至 `0.7.1`。
    - 此版本包含二进制不兼容的更改，仅影响 `coil-network-cache-control` 模块。有关更多信息，请参阅[此处](https://github.com/Kotlin/kotlinx-datetime?tab=readme-ov-file#deprecation-of-instant)。
- 更新 Kotlin 至 2.2.0。
- 更新 Compose 至 1.8.2。
- 更新 Okio 至 3.15.0。
- 更新 Skiko 至 0.9.4.2。

## [3.2.0] - 2025年5月13日

自 `3.1.0` 以来的变更：

- **重要**：由于 Compose `1.8.0` 的要求，`coil-compose` 和 `coil-compose-core` 现在需要 Java 11 字节码。有关如何启用它，请参阅[此处](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8-or-java-11)。
- 将 `AsyncImagePreviewHandler` 的函数式构造函数更改为返回 `AsyncImagePainter.State.Success` 而不是 `AsyncImagePainter.State.Loading`。
- 修复 `ConstraintsSizeResolver#size()` 中的取消问题。
- 修复使用 R8 构建时缺少 `PlatformContext` 的警告。
- 修复当返回默认 `FakeImageLoaderEngine` 响应时 `FakeImageLoaderEngine` 未设置 `Transition.Factory.NONE` 的问题。
- 移除 `ColorImage` 的实验性注解。
- 在 `CacheControlCacheStrategy` 中延迟解析网络标头。
- 重构 `CircleCropTransformation` 和 `RoundedCornersTransformation` 以共享公共代码。
- 如果 `ExifOrientationStrategy` 不是 `RESPECT_PERFORMANCE`，则内部回退到使用 `BitmapFactory`。
- 更新 Kotlin 至 2.1.20。
- 更新 Compose 至 1.8.0。
- 更新 Okio 至 3.11.0。
- 更新 Skiko 至 0.9.4。
- 更新 Coroutines 至 1.10.2。
- 更新 `accompanist-drawablepainter` 至 0.37.3。

自 `3.2.0-rc02` 以来的变更：

- 如果 `ExifOrientationStrategy` 不是 `RESPECT_PERFORMANCE`，则内部回退到使用 `BitmapFactory`。
- 更新 Compose 至 1.8.0。
- 更新 `accompanist-drawablepainter` 至 0.37.3。

## [3.2.0-rc02] - 2025年4月26日

- 修复在非 JVM 目标上使用 `KtorNetworkFetcherFactory` (Ktor 3) 加载图像时，图像请求因 `ClosedByteChannelException` 而失败的问题。

## [3.2.0-rc01] - 2025年4月24日

- **重要**：由于 Compose `1.8.0` 的要求，`coil-compose` 和 `coil-compose-core` 现在需要 Java 11 字节码。有关如何启用它，请参阅[此处](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8-or-java-11)。
- 将 `AsyncImagePreviewHandler` 的函数式构造函数更改为返回 `AsyncImagePainter.State.Success` 而不是 `AsyncImagePainter.State.Loading`。
- 修复 `ConstraintsSizeResolver#size()` 中的取消问题。
- 修复使用 R8 构建时缺少 `PlatformContext` 的警告。
- 修复当返回默认 `FakeImageLoaderEngine` 响应时 `FakeImageLoaderEngine` 未设置 `Transition.Factory.NONE` 的问题。
- 移除 `ColorImage` 的实验性注解。
- 在 `CacheControlCacheStrategy` 中延迟解析网络标头。
- 重构 `CircleCropTransformation` 和 `RoundedCornersTransformation` 以共享公共代码。
- 在 `coil-network-ktor2` 和 `coil-network-ktor3` 中使用 `kotlinx.io` 的 Okio 互操作模块。
- 更新 Kotlin 至 2.1.20。
- 更新 Compose 至 1.8.0-rc01。
- 更新 Okio 至 3.11.0。
- 更新 Skiko 至 0.9.4。
- 更新 Coroutines 至 1.10.2。

## [3.1.0] - 2025年2月4日

- 提升 `AsyncImage` 性能。
    - 取决于可组合项是被实例化还是被重用，运行时性能提升了 25% 到 40%。内存分配也减少了 35% 到 48%。更多信息请参阅[此处](https://github.com/coil-kt/coil/pull/2795)。
- 添加 `ColorImage` 并弃用 `FakeImage`。
    - `ColorImage` 对于在测试和预览中返回假值非常有用。它解决了与 `FakeImage` 相同的用例，但在 `coil-core` 中比在 `coil-test` 中更容易访问。
- 移除 `coil-compose-core` 对 `Dispatchers.Main.immedate` 的依赖。
    - 这也修复了在 Paparazzi 和 Roborazzi 屏幕截图测试中 `AsyncImagePainter` 不会同步执行 `ImageRequest` 的情况。
- 添加对格式为 `data:[<mediatype>][;base64],<data>` 的 [data URIs](https://www.ietf.org/rfc/rfc2397.txt) 的支持。
- 添加 `AnimatedImageDecoder.ENCODED_LOOP_COUNT` 以支持使用 GIF 元数据中编码的循环次数。
- 向 `NetworkRequest` 添加 `Extras` 以支持自定义扩展。
- 添加 `DiskCache.Builder.cleanupCoroutineContext` 并弃用 `DiskCache.Builder.cleanupDispatcher`。
- 添加 `ImageLoader.Builder.imageDecoderEnabled` 以在 API 29 及更高版本上可选地禁用 `android.graphics.ImageDecoder`。
- 如果没有为 `ImageRequest` 的数据类型注册 `Keyer`，则记录警告。
- 使 `CrossfadePainter` 公开。
- 在所有多平台目标上支持 `Transformation`。
- 在 `CacheControlCacheStrategy` 中支持 0 作为 `Expires` 标头值。
- 修复当 `AsyncImage`/`SubcomposeAsyncImage`/`rememberAsyncImage` 的 `ContentScale` 在 `None` 与其他值之间切换时，不会启动新 `ImageRequest` 的问题。
- 更新 Kotlin 至 2.1.10。
    - 注意：由于 [LLVM 更新](https://kotlinlang.org/docs/whatsnew21.html#llvm-update-from-11-1-0-to-16-0-0)，如果您使用 Kotlin native，此版本要求使用 Kotlin 2.1.0 或更高版本进行编译。
- 更新 Compose 至 1.7.3。
- 更新 `androidx.core` 至 1.15.0。

## [3.0.4] - 2024年11月25日

- 修复矢量可绘制对象在 Android Studio 预览中不渲染的问题。
- 修复尺寸超过 `maxBitmapSize` 的请求可能出现内存缓存未命中的问题。
- 修复 `FakeImage` 在 Android 上不渲染的问题。
- 修复在使用 `AsyncImage`/`rememberAsyncImagePainter`/`SubcomposeAsyncImage` 时，如果请求的 `Transformation` 发生变化，则不启动新图像请求的问题。
- 修复 `ScaleDrawable` 和 `CrossfadeDrawable` 不遵循着色（tint）状态的问题。
- 允许 `ImageDecoder` 解码部分图像源。这与 `BitmapFactory` 中的行为一致。
- 修复解码后未调用 `Bitmap.prepareToDraw()` 的问题。
- `SvgDecoder` 不应为非光栅化图像返回 `isSampled = true`。
- 如果即时主调度器不可用，在 Compose 中回退到使用 `Dispatchers.Unconfined`。这仅用于预览/测试环境。
- 将 Ktor 2 更新至 `2.3.13`。

## [3.0.3] - 2024年11月14日

- 修复基于 `ImageView` 的 `ScaleType` 设置 `ImageRequest.scale` 的问题。
- 修复 `DiskCache` 在删除文件后无法跟踪条目移除的边缘情况。
- 在记录错误时将 throwable 传递给 `Logger`。
- 不要用 `kotlin-stdlib` 替换 `kotlin-stdlib-jdk7` 和 `kotlin-stdlib-jdk8`。

## [3.0.2] - 2024年11月9日

- 修复在 Android 上使用自定义 `CacheStrategy` 调用 `OkHttpNetworkFetcherFactory` 时发生崩溃的问题。
- 修复 `CacheControlCacheStrategy` 计算缓存条目寿命不正确的问题。
- 修复在 API >= 28 上，只有当 `ImageRequest.bitmapConfig` 为 `ARGB_8888` 或 `HARDWARE` 时才会生效的情况。

## [3.0.1] - 2024年11月7日

- 修复使用硬件位图支持的 `BitmapImage` 调用 `Image.toBitmap` 时发生崩溃的问题。
- 修复 `AsyncImageModelEqualityDelegate.Default` 对 non-`ImageRequest` 模型进行不正确的相等性比较的问题。

## [3.0.0] - 2024年11月4日

Coil 3.0.0 是 Coil 的下一个主要版本，全面支持 [Compose Multiplatform](https://www.jetbrains.com/compose-multiplatform/)。

[有关 3.0.0 中改进和重要变更的完整列表，请查看升级指南](/coil/migrating_to_coil3/)。

自 `3.0.0-rc02` 以来的变更：

- 移除剩余的已弃用方法。

## [3.0.0-rc02] - 2024年10月28日

[有关 3.x 中改进和重要变更的完整列表，请查看升级指南](/coil/migrating_to_coil3/)。自 `3.0.0-rc01` 以来的变更：

- 添加 `BlackholeDecoder`。这简化了[仅限磁盘缓存的预加载](https://coil-kt.github.io/coil/faq/#how-do-i-preload-an-image)。
- 为 `ConstraintsSizeResolver` 和 `DrawScopeSizeResolver` 添加 `remember` 函数。
- 移除 `EqualityDelegate` 作为 `AsyncImage` 的参数。相反，它应该通过 `LocalAsyncImageModelEqualityDelegate` 设置。
- 修复当父可组合项使用 `IntrinsicSize` 时 `AsyncImage` 不渲染的问题。
- 修复当 `AsyncImagePainter` 没有子绘制器时 `AsyncImage` 填充可用约束的问题。
- 修复因 `EqualityDelegate` 被忽略导致其状态被观察时 `rememberAsyncImagePainter` 无限重组的问题。
- 修复解析带有特殊字符的 `File`/`Path` 路径的问题。
- 修复在 `VideoFrameDecoder` 中使用自定义 `FileSystem` 实现的问题。
- 更新 Ktor 至 `3.0.0`。
- 更新 `androidx.annotation` 至 `1.9.0`。

## [3.0.0-rc01] - 2024年10月8日

[有关 3.x 中改进和重要变更的完整列表，请查看升级指南](/coil/migrating_to_coil3/)。自 `3.0.0-alpha10` 以来的变更：

- **破坏性变更**：默认禁用 `addLastModifiedToFileCacheKey` 并允许按请求设置。可以使用相同的标志重新启用该行为。
- **新增**：引入新的 `coil-network-cache-control` 构件，该构件实现了对 [`Cache-Control` 标头](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)的支持。
- **新增**：向 `SvgDecoder.Factory` 添加 `scaleToDensity` 属性。此属性确保具有固有维度的 SVG 乘以设备密度（仅在 Android 上支持）。
- 将 `ExifOrientationPolicy` 重命名为 `ExifOrientationStrategy`。
- 在 get 时从 `MemoryCache` 中移除不可共享的图像。
- 使 `ConstraintsSizeResolver` 公开。
- 稳定 `setSingletonImageLoaderFactory`。
- 在 `coil-network-ktor3` 中恢复优化的 JVM I/O 函数。
- 将 `pdf` 添加到 MIME 类型列表。
- 将编译 SDK 更新至 35。
- 更新 Kotlin 至 2.0.20。
- 更新 Okio 至 3.9.1。

## [3.0.0-alpha10] - 2024年8月7日

- **破坏性变更**：将 `ImageLoader.Builder.networkObserverEnabled` 替换为 `NetworkFetcher` 的 `ConnectivityChecker` 接口。
    - 要禁用网络观察程序，请将 `ConnectivityChecker.ONLINE` 传递给 `KtorNetworkFetcherFactory`/`OkHttpNetworkFetcherFactory` 的构造函数。
- **新增**：支持在所有平台上加载 [Compose Multiplatform 资源](https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-images-resources.html)。要加载资源，请使用 `Res.getUri`：

```kotlin
AsyncImage(
    model = Res.getUri("drawable/image.jpg"),
    contentDescription = null,
)
```

- 向 `ImageLoader` 和 `ImageRequest` 添加 `maxBitmapSize` 属性。
    - 此属性默认为 4096x4096，并为分配的位图维度提供安全的上限。这有助于防止意外使用 `Size.ORIGINAL` 加载非常大的图像并导致内存溢出异常。
- 将 `ExifOrientationPolicy` 转换为接口以支持自定义策略。
- 修复 `Uri` 对 Windows 文件路径的处理。
- 从 `Image` API 中移除 `@ExperimentalCoilApi`。
- 更新 Kotlin 至 2.0.10。

## [3.0.0-alpha09] - 2024年7月23日

- **破坏性变更**：将 `io.coil-kt.coil3:coil-network-ktor` 构件重命名为 `io.coil-kt.coil3:coil-network-ktor2`，它依赖于 Ktor 2.x。此外，引入依赖于 Ktor 3.x 的 `io.coil-kt.coil3:coil-network-ktor3`。`wasmJs` 支持仅在 Ktor 3.x 中可用。
- **新增**：添加 `AsyncImagePainter.restart()` 以手动重启图像请求。
- 从 `NetworkClient` 及相关类中移除 `@ExperimentalCoilApi`。
- 优化 `ImageRequest` 以避免不必要的 `Extras` 和 `Map` 分配。

## [2.7.0] - 2024年7月17日

- 略微优化内部协程使用，以提高 `ImageLoader.execute`、`AsyncImage`、`SubcomposeAsyncImage` 和 `rememberAsyncImagePainter` 的性能。([#2205](https://github.com/coil-kt/coil/pull/2205))
- 修复分块响应的重复网络调用。([#2363](https://github.com/coil-kt/coil/pull/2363))
- 更新 Kotlin 至 2.0.0。
- 更新 Compose UI 至 1.6.8。
- 更新 Okio 至 3.9.0。

## [3.0.0-alpha08] - 2024年7月8日

- **破坏性变更**：将 `ImageRequest` 和 `ImageLoader` 的 `dispatcher` 方法重命名为 `coroutineContext`。例如，`ImageRequest.Builder.dispatcher` 现在是 `ImageRequest.Builder.coroutineContext`。重命名是因为该方法现在接受任何 `CoroutineContext` 而不再要求是 `Dispatcher`。
- 修复：修复可能由于竞态条件而发生的 `IllegalStateException: Reading a state that was created after the snapshot was taken or in a snapshot that has not yet been applied`。
    - 注意：这重新引入了对 `Dispatchers.Main.immediate` 的软依赖。因此，您应该在 JVM 上重新添加对 [`kotlinx-coroutines-swing`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-swing/) 的依赖。如果未导入，则 `ImageRequest` 不会被立即调度，并且在设置 `ImageRequest.placeholder` 或从内存缓存解析之前将有一帧延迟。

## [3.0.0-alpha07] - 2024年6月26日

- **破坏性变更**：`AsyncImagePainter` 默认不再等待 `onDraw`，而是使用 `Size.ORIGINAL`。
    - 这修复了[与 Roborazzi/Paparazzi 的兼容性问题](https://github.com/coil-kt/coil/issues/1910)，并整体提高了测试可靠性。
    - 要恢复到等待 `onDraw`，请将 `DrawScopeSizeResolver` 设置为您的 `ImageRequest.sizeResolver`。
- **破坏性变更**：重构多平台 `Image` API。值得注意的是，`asCoilImage` 已重命名为 `asImage`。
- **破坏性变更**：`AsyncImagePainter.state` 已更改为 `StateFlow<AsyncImagePainter.State>`。使用 `collectAsState` 来观察其值。这提升了性能。
- **破坏性变更**：`AsyncImagePainter.imageLoader` 和 `AsyncImagePainter.request` 已合并为 `StateFlow<AsyncImagePainter.Inputs>`。使用 `collectAsState` 来观察其值。这提升了性能。
- **破坏性变更**：移除对 `android.resource://example.package.name/drawable/image` URI 的支持，因为它会阻碍资源收缩（shrinking）优化。
    - 如果您仍需要其功能，可以[在组件注册表中手动包含 `ResourceUriMapper`](https://github.com/coil-kt/coil/blob/main/coil-core/src/androidInstrumentedTest/kotlin/coil3/map/ResourceUriMapper.kt)。
- **新增**：引入 `AsyncImagePreviewHandler` 以支持控制 `AsyncImagePainter` 的预览渲染行为。
    - 使用 `LocalAsyncImagePreviewHandler` 重写预览行为。
    - 作为此更改和其他 `coil-compose` 改进的一部分，`AsyncImagePainter` 现在默认尝试执行 `ImageRequest`，而不是默认显示 `ImageRequest.placeholder`。[在预览环境中，使用网络或文件的请求预计会失败](https://developer.android.com/develop/ui/compose/tooling/previews#preview-limitations)，但 Android 资源应该可以工作。
- **新增**：支持按帧索引提取视频图像。([#2183](https://github.com/coil-kt/coil/pull/2183))
- **新增**：支持向任何 `CoroutineDispatcher` 方法传递 `CoroutineContext`。([#2241](https://github.com/coil-kt/coil/pull/2241))。
- **新增**：在 JS 和 WASM JS 上支持弱引用内存缓存。
- 在 Compose 中不调度到 `Dispatchers.Main.immediate`。作为副作用，在 JVM 上不再需要导入 [`kotlinx-coroutines-swing`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-swing/)。
- 在 Compose 中不调用 `async` 也不创建 disposable 以提高性能（感谢 @mlykotom！）。([#2205](https://github.com/coil-kt/coil/pull/2205))
- 修复将全局 `ImageLoader` extras 传递给 `Options` 的问题。([#2223](https://github.com/coil-kt/coil/pull/2223))
- 修复 `crossfade(false)` 在非 Android 目标上不起作用的问题。
- 修复 VP8X 功能标志字节偏移 ([#2199](https://github.com/coil-kt/coil/pull/2199))。
- 将非 Android 目标上的 `SvgDecoder` 转换为渲染到位图，而不是在绘制时渲染图像。这提升了性能。
    - 此行为可以使用 `SvgDecoder(renderToBitmap)` 进行控制。
- 将 `ScaleDrawable` 从 `coil-gif` 移动到 `coil-core`。
- 更新 Kotlin 至 2.0.0。
- 更新 Compose 至 1.6.11。
- 更新 Okio 至 3.9.0。
- 更新 Skiko 至 0.8.4。
- [有关 3.x 中重要变更的完整列表，请查看升级指南。](/coil/migrating_to_coil3/)

## [3.0.0-alpha06] - 2024年2月29日

- 将 Skiko 降级至 0.7.93。
- [有关 3.x 中重要变更的完整列表，请查看升级指南。](/coil/migrating_to_coil3/)

## [3.0.0-alpha05] - 2024年2月28日

- **新增**：支持 `wasmJs` 目标。
- 创建 `DrawablePainter` 和 `DrawableImage` 以支持在非 Android 平台上绘制不以位图为后端的 `Image`。
    - `Image` API 是实验性的，在 alpha 版本之间可能会发生变化。
- 更新 `ContentPainterModifier` 以实现 `Modifier.Node`。
- 修复：在后台线程上延迟注册组件回调和网络观察程序。这修复了通常在主线程上发生的初始化缓慢问题。
- 修复：修复 `ImageLoader.Builder.placeholder/error/fallback` 未被 `ImageRequest` 使用的问题。
- 更新 Compose 至 1.6.0。
- 更新 Coroutines 至 1.8.0。
- 更新 Okio 至 3.8.0。
- 更新 Skiko 至 0.7.94。
- [有关 3.x 中重要变更的完整列表，请查看升级指南。](/coil/migrating_to_coil3/)

## [2.6.0] - 2024年2月23日

- 使 `rememberAsyncImagePainter`、`AsyncImage` 和 `SubcomposeAsyncImage` [可重启且可跳过](https://developer.android.com/jetpack/compose/performance/stability#functions)。这通过避免重组（除非可组合项的参数之一发生变化）来提高性能。
    - 向 `rememberAsyncImagePainter`、`AsyncImage` 和 `SubcomposeAsyncImage` 添加可选的 `modelEqualityDelegate` 参数，以控制 `model` 是否会触发重组。
- 更新 `ContentPainterModifier` 以实现 `Modifier.Node`。
- 修复：在后台线程上延迟注册组件回调和网络观察程序。这修复了通常在主线程上发生的初始化缓慢问题。
- 修复：如果 `ImageRequest.listener` 或 `ImageRequest.target` 发生变化，避免在 `rememberAsyncImagePainter`、`AsyncImage` 和 `SubcomposeAsyncImage` 中重新启动新的图像请求。
- 修复：不要在 `AsyncImagePainter` 中观察图像请求两次。
- 更新 Kotlin 至 1.9.22。
- 更新 Compose 至 1.6.1。
- 更新 Okio 至 3.8.0。
- 更新 `androidx.collection` 至 1.4.0。
- 更新 `androidx.lifecycle` 至 2.7.0。

## [3.0.0-alpha04] - 2024年2月1日

- **破坏性变更**：从 `OkHttpNetworkFetcherFactory` 和 `KtorNetworkFetcherFactory` 的公开 API 中移除 `Lazy`。
- 在 `OkHttpNetworkFetcherFactory` 中暴露 `Call.Factory` 而不是 `OkHttpClient`。
- 将 `NetworkResponseBody` 转换为包装 `ByteString`。
- 将 Compose 降级至 1.5.12。
- [有关重要变更的完整列表，请查看升级指南。](/coil/migrating_to_coil3/)

## [3.0.0-alpha03] - 2024年1月20日

- **破坏性变更**：`coil-network` 已重命名为 `coil-network-ktor`。此外，新增了一个依赖于 OkHttp 且不需要指定 Ktor 引擎的 `coil-network-okhttp` 构件。
    - 取决于您导入的构件，您可以使用 `KtorNetworkFetcherFactory` 或 `OkHttpNetworkFetcherFactory` 手动引用 `Fetcher.Factory`。
- 支持在 Apple 平台上加载 `NSUrl`。
- 向 `AsyncImage` 添加 `clipToBounds` 参数。
- [有关重要变更的完整列表，请查看升级指南。](/coil/migrating_to_coil3/)

## [3.0.0-alpha02] - 2024年1月10日

- **破坏性变更**：更新了 `coil-gif`、`coil-network`、`coil-svg` 和 `coil-video` 的软件包，使其所有类分别属于 `coil.gif`、`coil.network`、`coil.svg` 和 `coil.video`。这有助于避免与其他构件的类名冲突。
- **破坏性变更**：将 `ImageDecoderDecoder` 重命名为 `AnimatedImageDecoder`。
- **新增**：`coil-gif`、`coil-network`、`coil-svg` 和 `coil-video` 的组件现在会自动添加到每个 `ImageLoader` 的 `ComponentRegistry` 中。
    - 明确一点，与 `3.0.0-alpha01` 不同，**您不需要手动将 `NetworkFetcher.Factory()` 添加到您的 `ComponentRegistry` 中**。只需导入 `io.coil-kt.coil3:coil-network:[version]` 和[一个 Ktor 引擎](https://ktor.io/docs/http-client-engines.html#dependencies)就足以加载网络图像。
    - 手动将这些组件添加到 `ComponentRegistry` 也是安全的。任何手动添加的组件都优先于自动添加的组件。
    - 如果需要，可以使用 `ImageLoader.Builder.serviceLoaderEnabled(false)` 禁用此行为。
- **新增**：在所有平台上支持 `coil-svg`。它在 Android 上由 [AndroidSVG](https://bigbadaboom.github.io/androidsvg/) 支持，在非 Android 平台上由 [SVGDOM](https://api.skia.org/classSkSVGDOM.html) 支持。
- Coil 现在内部使用 Android 的 [`ImageDecoder`](https://developer.android.com/reference/android/graphics/ImageDecoder) API，当直接从文件、资源或内容 URI 解码时具有性能优势。
- 修复：多个 `coil3.Uri` 解析修复。
- [有关重要变更的完整列表，请查看升级指南。](/coil/migrating_to_coil3/)

## [3.0.0-alpha01] - 2023年12月30日

- **新增**：[Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) 支持。Coil 现在是一个支持 Android、JVM、iOS、macOS 和 Javascript 的 Kotlin 多平台库。
- Coil 的 Maven 坐标已更新为 `io.coil-kt.coil3`，其导入已更新为 `coil3`。这允许 Coil 3 与 Coil 2 并行运行而不会出现二进制兼容性问题。例如，`io.coil-kt:coil:[version]` 现在是 `io.coil-kt.coil3:coil:[version]`。
- `coil-base` 和 `coil-compose-base` 构件分别重命名为 `coil-core` 和 `coil-compose-core`，以符合 Coroutines、Ktor 和 AndroidX 使用的命名约定。
- [有关重要变更的完整列表，请查看升级指南。](/coil/migrating_to_coil3/)

## [2.5.0] - 2023年10月30日

- **新增**：添加 `MediaDataSourceFetcher.Factory` 以支持在 `coil-video` 中解码 `MediaDataSource` 实现。([#1795](https://github.com/coil-kt/coil/pull/1795))
- 将 `SHIFT6m` 设备添加到硬件位图黑名单。([#1812](https://github.com/coil-kt/coil/pull/1812))
- 修复：防范返回具有一个无界维度的尺寸的绘制器。([#1826](https://github.com/coil-kt/coil/pull/1826))
- 修复：当缓存标头包含非 ASCII 字符时，`304 Not Modified` 之后磁盘缓存加载失败的问题。([#1839](https://github.com/coil-kt/coil/pull/1839))
- 修复：`FakeImageEngine` 未更新拦截器链请求的问题。([#1905](https://github.com/coil-kt/coil/pull/1905))
- 更新编译 SDK 至 34。
- 更新 Kotlin 至 1.9.10。
- 更新 Coroutines 至 1.7.3。
- 更新 `accompanist-drawablepainter` 至 0.32.0。
- 更新 `androidx.annotation` 至 1.7.0。
- 更新 `androidx.compose.foundation` 至 1.5.4。
- 更新 `androidx.core` 至 1.12.0。
- 更新 `androidx.exifinterface:exifinterface` 至 1.3.6。
- 更新 `androidx.lifecycle` 至 2.6.2。
- 更新 `com.squareup.okhttp3` 至 4.12.0。
- 更新 `com.squareup.okio` 至 3.6.0。

## [2.4.0] - 2023年5月21日

- 将 `DiskCache` 的 `get`/`edit` 重命名为 `openSnapshot`/`openEditor`。
- 在 `AsyncImagePainter` 中不要自动将 `ColorDrawable` 转换为 `ColorPainter`。
- 使用 `@NonRestartableComposable` 注解简单的 `AsyncImage` 重载。
- 修复：在 `ImageSource` 中延迟调用 `Context.cacheDir`。
- 修复：修复发布 `coil-bom` 的问题。
- 修复：修复在禁用硬件位图的情况下始终将位图配置设置为 `ARGB_8888` 的问题。
- 更新 Kotlin 至 1.8.21。
- 更新 Coroutines 至 1.7.1。
- 更新 `accompanist-drawablepainter` 至 0.30.1。
- 更新 `androidx.compose.foundation` 至 1.4.3。
- 更新 `androidx.profileinstaller:profileinstaller` 至 1.3.1。
- 更新 `com.squareup.okhttp3` 至 4.11.0。

## [2.3.0] - 2023年3月25日

- **新增**：引入新的 `coil-test` 构件，其中包含 `FakeImageLoaderEngine`。此类对于硬编码图像加载器响应非常有用，以确保测试中响应的一致性和同步性（从主线程）。有关更多信息，请参阅[此处](https://coil-kt.github.io/coil/testing)。
- **新增**：向 `coil-base`（`coil` 的子模块）和 `coil-compose-base`（`coil-compose` 的子模块）添加[基准配置文件 (baseline profiles)](https://developer.android.com/topic/performance/baselineprofiles/overview)。
    - 这提升了 Coil 的运行时性能，并应根据应用中 Coil 的使用方式提供[更好的帧时间](https://github.com/coil-kt/coil/tree/main/coil-benchmark/benchmark_output.md)。
- 修复：修复解析带有编码数据的 `file://` URI 的问题。[#1601](https://github.com/coil-kt/coil/pull/1601)
- 修复：如果传递的目录不存在，`DiskCache` 现在可以正确计算其最大大小。[#1620](https://github.com/coil-kt/coil/pull/1620)
- 使 `Coil.reset` 成为公开 API。[#1506](https://github.com/coil-kt/coil/pull/1506)
- 启用 Java 默认方法生成。[#1491](https://github.com/coil-kt/coil/pull/1491)
- 更新 Kotlin 至 1.8.10。
- 更新 `accompanist-drawablepainter` 至 0.30.0。
- 更新 `androidx.annotation` 至 1.6.0。
- 更新 `androidx.appcompat:appcompat-resources` 至 1.6.1。
- 更新 `androidx.compose.foundation` 至 1.4.0。
- 更新 `androidx.core` 至 1.9.0。
- 更新 `androidx.exifinterface:exifinterface` 至 1.3.6。
- 更新 `androidx.lifecycle` 至 2.6.1。
- 更新 `okio` 至 3.3.0。

## [2.2.2] - 2022年10月1日

- 确保图像加载器在注册其系统回调之前已完全初始化。[#1465](https://github.com/coil-kt/coil/pull/1465)
- 在 API 30+ 上的 `VideoFrameDecoder` 中设置首选位图配置以避免色带问题。[#1487](https://github.com/coil-kt/coil/pull/1487)
- 修复 `FileUriMapper` 中解析包含 `#` 的路径的问题。[#1466](https://github.com/coil-kt/coil/pull/1466)
- 修复从磁盘缓存中读取带有非 ASCII 标头的响应的问题。[#1468](https://github.com/coil-kt/coil/pull/1468)
- 修复解码资产子文件夹内的视频的问题。[#1489](https://github.com/coil-kt/coil/pull/1489)
- 更新 `androidx.annotation` 至 1.5.0。

## [2.2.1] - 2022年9月8日

- 修复：`RoundedCornersTransformation` 现在可以正确缩放 `input` 位图。
- 移除对 `kotlin-parcelize` 插件的依赖。
- 将编译 SDK 更新至 33。
- 将 `androidx.appcompat:appcompat-resources` 降级至 1.4.2 以解决 [#1423](https://github.com/coil-kt/coil/issues/1423)。

## [2.2.0] - 2022年8月16日

- **新增**：向 `coil-video` 添加 `ImageRequest.videoFramePercent`，以支持将视频帧指定为视频时长的百分比。
- **新增**：添加 `ExifOrientationPolicy` 以配置 `BitmapFactoryDecoder` 如何处理 EXIF 方向数据。
- 修复：如果传递了具有未定义维度的尺寸，则在 `RoundedCornersTransformation` 中不抛出异常。
- 修复：将 GIF 的帧延迟读取为两个无符号字节而不是一个有符号字节。
- 更新 Kotlin 至 1.7.10。
- 更新 Coroutines 至 1.6.4。
- 更新 Compose 至 1.2.1。
- 更新 OkHttp 至 4.10.0。
- 更新 Okio 至 3.2.0。
- 更新 `accompanist-drawablepainter` 至 0.25.1。
- 更新 `androidx.annotation` 至 1.4.0。
- 更新 `androidx.appcompat:appcompat-resources` 至 1.5.0。
- 更新 `androidx.core` 至 1.8.0。

## [2.1.0] - 2022年5月17日

- **新增**：支持加载 `ByteArray`。([#1202](https://github.com/coil-kt/coil/pull/1202))
- **新增**：支持使用 `ImageRequest.Builder.css` 为 SVG 设置自定义 CSS 规则。([#1210](https://github.com/coil-kt/coil/pull/1210))
- 修复：将 `GenericViewTarget` 的私有方法转换为受保护方法。([#1273](https://github.com/coil-kt/coil/pull/1273))
- 将编译 SDK 更新至 32。([#1268](https://github.com/coil-kt/coil/pull/1268))

## [2.0.0] - 2022年5月10日

Coil 2.0.0 是该库的一次重大迭代，包含破坏性变更。有关如何升级，请查看[升级指南](/coil/migrating)。

- **新增**：在 `coil-compose` 中引入 `AsyncImage`。有关更多信息，请查看[文档](https://coil-kt.github.io/coil/compose/)。

```kotlin
// 显示来自网络的图像。
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
)

// 显示来自网络的图像，带有占位符、圆形裁剪和淡入淡出动画。
AsyncImage(
    model = ImageRequest.Builder(LocalContext.current)
        .data("https://example.com/image.jpg")
        .crossfade(true)
        .build(),
    placeholder = painterResource(R.drawable.placeholder),
    contentDescription = stringResource(R.string.description),
    contentScale = ContentScale.Crop,
    modifier = Modifier.clip(CircleShape)
)
```

- **新增**：引入公开的 `DiskCache` API。
    - 使用 `ImageLoader.Builder.diskCache` 和 `DiskCache.Builder` 配置磁盘缓存。
    - 您不应在 Coil 2.0 中使用 OkHttp 的 `Cache`。有关更多信息，请参阅[此处](/coil/migrating_to_coil2/#disk-cache)。
    - 仍支持 `Cache-Control` 和其他缓存标头——除了 `Vary` 标头，因为缓存仅检查 URL 是否匹配。此外，仅缓存响应代码在 [200..300) 范围内的响应。
    - 升级到 2.0 时将清除现有的磁盘缓存。
- 最低支持的 API 现在为 21。
- `ImageRequest` 的默认 `Scale` 现在为 `Scale.FIT`。
    - 更改此设置是为了使 `ImageRequest.scale` 与具有默认 `Scale` 的其他类保持一致。
    - 带有 `ImageViewTarget` 的请求仍会自动检测其 `Scale`。
- 重新设计图像流水线类：
    - `Mapper`、`Fetcher` 和 `Decoder` 已重构为更加灵活。
    - `Fetcher.key` 已替换为新的 `Keyer` 接口。`Keyer` 根据输入数据创建缓存键。
    - 添加 `ImageSource`，允许 `Decoder` 使用 Okio 的文件系统 API 直接读取 `File`。
- 重新设计 Jetpack Compose 集成：
    - `rememberImagePainter` 和 `ImagePainter` 分别重命名为 `rememberAsyncImagePainter` 和 `AsyncImagePainter`。
    - 弃用 `LocalImageLoader`。有关更多信息，请查看弃用消息。
- 禁用生成运行时非空断言。
    - 如果您使用 Java，将 null 作为带有非空注解的参数传递给函数将不再立即抛出 `NullPointerException`。Kotlin 的编译时空安全可防止这种情况发生。
    - 此更改允许库的大小更小。
- `Size` 现在由其宽度和高度的两个 `Dimension` 值组成。`Dimension` 可以是正像素值或 `Dimension.Undefined`。有关更多信息，请参阅[此处](/coil/migrating#size-refactor)。
- 从库中移除了 `BitmapPool` 和 `PoolableViewTarget`。
- 从库中移除了 `VideoFrameFileFetcher` 和 `VideoFrameUriFetcher`。请改用支持所有数据源的 `VideoFrameDecoder`。
- 从库中移除了 [`BlurTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/BlurTransformation.kt) 和 [`GrayscaleTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/GrayscaleTransformation.kt)。如果您使用它们，可以将它们的代码复制到您的项目中。
- 将 `Transition.transition` 更改为非挂起函数，因为不再需要挂起过渡直到其完成。
- 添加 `bitmapFactoryMaxParallelism` 支持，限制正在进行的 `BitmapFactory` 操作的最大数量。此值默认为 4，可提高 UI 性能。
- 添加对 `interceptorDispatcher`、`fetcherDispatcher`、`decoderDispatcher` 和 `transformationDispatcher` 的支持。
- 添加 `GenericViewTarget`，处理通用的 `ViewTarget` 逻辑。
- 将 `ByteBuffer` 添加到默认支持的数据类型中。
- `Disposable` 已重构并暴露底层 `ImageRequest` 的作业。
- 重新设计 `MemoryCache` API。
- 如果 `ImageRequest.fallback` 为 null，现在在 `Target` 上设置 `ImageRequest.error`。
- `Transformation.key` 被替换为 `Transformation.cacheKey`。
- 更新 Kotlin 至 1.6.10。
- 更新 Compose 至 1.1.1。
- 更新 OkHttp 至 4.9.3。
- 更新 Okio 至 3.0.0。

自 `2.0.0-rc03` 以来的变更：
- 将 `Dimension.Original` 转换为 `Dimension.Undefined`。
    - 略微更改了非像素维度的语义，以修复尺寸系统中一些边缘情况（[示例](https://github.com/coil-kt/coil/issues/1246)）。
- 如果 ContentScale 为 None，则使用 `Size.ORIGINAL` 加载图像。
- 修复首先应用 `ImageView.load` 构建器参数而不是最后应用的问题。
- 修复如果响应未修改则不合并 HTTP 标头的问题。

## [2.0.0-rc03] - 2022年4月11日

- 移除 `ScaleResolver` 接口。
- 将 `Size` 构造函数转换为函数。
- 将 `Dimension.Pixels` 的 `toString` 更改为仅显示其像素值。
- 防范 `SystemCallbacks.onTrimMemory` 中罕见的崩溃。
- 更新 Coroutines 至 1.6.1。

## [2.0.0-rc02] - 2022年3月20日

- 将 `ImageRequest` 的默认尺寸恢复为当前显示的尺寸，而不是 `Size.ORIGINAL`。
- 修复 `DiskCache.Builder` 被标记为实验性的问题。只有 `DiskCache` 的方法是实验性的。
- 修复在将图像加载到具有一个维度为 `WRAP_CONTENT` 的 `ImageView` 时，会以原始尺寸加载图像而不是将其适配到有界维度中的情况。
- 从 `MemoryCache.Key`、`MemoryCache.Value` 和 `Parameters.Entry` 中移除组件函数。

## [2.0.0-rc01] - 2022年3月2日

自 `1.4.0` 以来的重大变更：

- 最低支持的 API 现在为 21。
- 重新设计 Jetpack Compose 集成。
    - `rememberImagePainter` 已重命名为 `rememberAsyncImagePainter`。
    - 添加对 `AsyncImage` 和 `SubcomposeAsyncImage` 的支持。有关更多信息，请查看[文档](https://coil-kt.github.io/coil/compose/)。
    - 弃用 `LocalImageLoader`。有关更多信息，请查看弃用消息。
- Coil 2.0 拥有自己的磁盘缓存实现，不再依赖 OkHttp 进行磁盘缓存。
    - 使用 `ImageLoader.Builder.diskCache` 和 `DiskCache.Builder` 配置磁盘缓存。
    - 您**不应该**在 Coil 2.0 中使用 OkHttp 的 `Cache`，因为如果在向其写入时线程被中断，缓存可能会损坏。
    - 仍支持 `Cache-Control` 和其他缓存标头——除了 `Vary` 标头，因为缓存仅检查 URL 是否匹配。此外，仅缓存响应代码在 [200..300) 范围内的响应。
    - 升级到 2.0 时将清除现有的磁盘缓存。
- `ImageRequest` 的默认 `Scale` 现在为 `Scale.FIT`。
    - 更改此设置是为了使 `ImageRequest.scale` 与具有默认 `Scale` 的其他类保持一致。
    - 带有 `ImageViewTarget` 的请求仍会自动检测其 `Scale`。
- `ImageRequest` 的默认尺寸现在为 `Size.ORIGINAL`。
- 重新设计图像流水线类：
    - `Mapper`、`Fetcher` 和 `Decoder` 已重构为更加灵活。
    - `Fetcher.key` 已替换为新的 `Keyer` 接口。`Keyer` 根据输入数据创建缓存键。
    - 添加 `ImageSource`，允许 `Decoder` 使用 Okio 的文件系统 API 直接读取 `File`。
- 禁用生成运行时非空断言。
    - 如果您使用 Java，将 null 作为带有非空注解的参数传递给函数将不再立即抛出 `NullPointerException`。Kotlin 的编译时空安全可防止这种情况发生。
    - 此更改允许库的大小更小。
- `Size` 现在由其宽度和高度的两个 `Dimension` 值组成。`Dimension` 可以是正像素值或 `Dimension.Original`。
- 从库中移除了 `BitmapPool` 和 `PoolableViewTarget`。
- 从库中移除了 `VideoFrameFileFetcher` 和 `VideoFrameUriFetcher`。请改用支持所有数据源的 `VideoFrameDecoder`。
- 从库中移除了 [`BlurTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/BlurTransformation.kt) 和 [`GrayscaleTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/GrayscaleTransformation.kt)。如果您使用它们，可以将它们的代码复制到您的项目中。
- 将 `Transition.transition` 更改为非挂起函数，因为不再需要挂起过渡直到其完成。
- 添加 `bitmapFactoryMaxParallelism` 支持，限制正在进行的 `BitmapFactory` 操作的最大数量。此值默认为 4，可提高 UI 性能。
- 添加对 `interceptorDispatcher`、`fetcherDispatcher`、`decoderDispatcher` 和 `transformationDispatcher` 的支持。
- 添加 `GenericViewTarget`，处理通用的 `ViewTarget` 逻辑。
- 将 `ByteBuffer` 添加到默认支持的数据类型中。
- `Disposable` 已重构并暴露底层 `ImageRequest` 的作业。
- 重新设计 `MemoryCache` API。
- 如果 `ImageRequest.fallback` 为 null，现在在 `Target` 上设置 `ImageRequest.error`。
- `Transformation.key` 被替换为 `Transformation.cacheKey`。
- 更新 Kotlin 至 1.6.10。
- 更新 Compose 至 1.1.1。
- 更新 OkHttp 至 4.9.3。
- 更新 Okio 至 3.0.0。

自 `2.0.0-alpha09` 以来的变更：

- 移除 `-Xjvm-default=all` 编译器标志。
- 修复如果并发执行多个带有 must-revalidate/e-tag 的请求导致加载图像失败的问题。
- 修复如果 `<svg` 标签后有换行符导致 `DecodeUtils.isSvg` 返回 false 的问题。
- 使 `LocalImageLoader.provides` 弃用消息更清晰。
- 更新 Compose 至 1.1.1。
- 更新 `accompanist-drawablepainter` 至 0.23.1。

## [2.0.0-alpha09] - 2022年2月16日

- 修复 `AsyncImage` 创建无效约束的问题。([#1134](https://github.com/coil-kt/coil/pull/1134))
- 向 `AsyncImagePainter` 添加 `ContentScale` 参数。([#1144](https://github.com/coil-kt/coil/pull/1144))
    - 此设置应与 `Image` 上设置的值相同，以确保图像以正确的尺寸加载。
- 添加 `ScaleResolver` 以支持为 `ImageRequest` 延迟解析 `Scale`。([#1134](https://github.com/coil-kt/coil/pull/1134))
    - `ImageRequest.scale` 应由 `ImageRequest.scaleResolver.scale()` 替换。
- 更新 Compose 至 1.1.0。
- 更新 `accompanist-drawablepainter` 至 0.23.0。
- 更新 `androidx.lifecycle` 至 2.4.1。

## [2.0.0-alpha08] - 2022年2月7日

- 更新 `DiskCache` 和 `ImageSource` 以使用 Okio 的 `FileSystem` API。([#1115](https://github.com/coil-kt/coil/pull/1115))

## [2.0.0-alpha07] - 2022年1月30日

- 显著提升 `AsyncImage` 性能，并将 `AsyncImage` 拆分为 `AsyncImage` 和 `SubcomposeAsyncImage`。([#1048](https://github.com/coil-kt/coil/pull/1048))
    - `SubcomposeAsyncImage` 提供 `loading`/`success`/`error`/`content` 插槽（slot）API，并使用性能较差的子组合（subcomposition）。
    - `AsyncImage` 提供 `placeholder`/`error`/`fallback` 参数，用于覆盖加载时或请求失败时绘制的 `Painter`。`AsyncImage` 不使用子组合，性能比 `SubcomposeAsyncImage` 好得多。
    - 从 `SubcomposeAsyncImage.content` 中移除 `AsyncImagePainter.State` 参数。如果需要，请使用 `painter.state`。
    - 为 `AsyncImage` 和 `SubcomposeAsyncImage` 添加 `onLoading`/`onSuccess`/`onError` 回调。
- 弃用 `LocalImageLoader`。([#1101](https://github.com/coil-kt/coil/pull/1101))
- 添加对 `ImageRequest.tags` 的支持。([#1066](https://github.com/coil-kt/coil/pull/1066))
- 将 `DecodeUtils` 中的 `isGif`、`isWebP`、`isAnimatedWebP`、`isHeif` 和 `isAnimatedHeif` 移至 coil-gif。将 `isSvg` 添加到 coil-svg。([#1117](https://github.com/coil-kt/coil/pull/1117))
- 将 `FetchResult` 和 `DecodeResult` 转换为非 data 类。([#1114](https://github.com/coil-kt/coil/pull/1114))
- 移除未使用的 `DiskCache.Builder` 上下文参数。([#1099](https://github.com/coil-kt/coil/pull/1099))
- 修复具有原始尺寸的位图资源的缩放问题。([#1072](https://github.com/coil-kt/coil/pull/1072))
- 修复 `ImageDecoderDecoder` 中未能关闭 `ImageDecoder` 的问题。([#1109](https://github.com/coil-kt/coil/pull/1109))
- 修复在将可绘制对象转换为位图时错误的缩放。([#1084](https://github.com/coil-kt/coil/pull/1084))
- 更新 Compose 至 1.1.0-rc03。
- 更新 `accompanist-drawablepainter` 至 0.22.1-rc。
- 更新 `androidx.appcompat:appcompat-resources` 至 1.4.1。

## [2.0.0-alpha06] - 2021年12月24日

- 添加 `ImageSource.Metadata` 以支持从资产、资源和内容 URI 进行解码，无需缓冲或临时文件。([#1060](https://github.com/coil-kt/coil/pull/1060))
- 延迟执行图像请求，直到 `AsyncImage` 具有正向约束。([#1028](https://github.com/coil-kt/coil/pull/1028))
- 修复如果 `loading`、`success` 和 `error` 都已设置，则为 `AsyncImage` 使用 `DefaultContent` 的问题。([#1026](https://github.com/coil-kt/coil/pull/1026))
- 使用 androidx `LruCache` 代替平台 `LruCache`。([#1047](https://github.com/coil-kt/coil/pull/1047))
- 更新 Kotlin 至 1.6.10。
- 更新 Coroutines 至 1.6.0。
- 更新 Compose 至 1.1.0-rc01。
- 更新 `accompanist-drawablepainter` 至 0.22.0-rc。
- 更新 `androidx.collection` 至 1.2.0。

## [2.0.0-alpha05] - 2021年11月28日

- **重要**：重构 `Size` 以支持在任一维度上使用图像的原始尺寸。
    - `Size` 现在由其宽度和高度的两个 `Dimension` 值组成。`Dimension` 可以是正像素值或 `Dimension.Original`。
    - 做出此更改是为了在其中一个维度是固定像素值时，更好地支持无界宽度/高度值（例如 `wrap_content`、`Constraints.Infinity`）。
- 修复：为 `AsyncImage` 支持检查模式（预览）。
- 修复：如果 `imageLoader.memoryCache` 为 null，`SuccessResult.memoryCacheKey` 应始终为 `null`。
- 将 `ImageLoader`、`SizeResolver` 和 `ViewSizeResolver` 类似构造函数的 `invoke` 函数转换为顶级函数。
- 使 `CrossfadeDrawable` 的起始和结束可绘制对象成为公开 API。
- 变异 `ImageLoader` 的占位符/错误/回退可绘制对象。
- 向 `SuccessResult` 的构造函数添加默认参数。
- 依赖 `androidx.collection` 而不是 `androidx.collection-ktx`。
- 更新 OkHttp 至 4.9.3。

## [2.0.0-alpha04] - 2021年11月22日

- **新增**：向 `coil-compose` 添加 `AsyncImage`。
    - `AsyncImage` 是一个异步执行 `ImageRequest` 并渲染结果的可组合项。
    - **`AsyncImage` 旨在在大多数用例中取代 `rememberImagePainter`。**
    - 其 API 尚未最终确定，可能会在最终 2.0 版本发布前发生变化。
    - 它具有与 `Image` 类似的 API 并支持相同的参数：`Alignment`、`ContentScale`、`alpha`、`ColorFilter` 和 `FilterQuality`。
    - 它支持使用 `content`、`loading`、`success` 和 `error` 参数覆盖为每个 `AsyncImagePainter` 状态绘制的内容。
    - 它修复了 `rememberImagePainter` 在解析图像尺寸和缩放方面的一些设计问题。
    - 使用示例：

```kotlin
// 仅绘制图像。
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null, // 避免使用 `null`，如果可能请将其设置为本地化字符串。
)

// 绘制具有圆形裁剪、淡入淡出的图像，并覆盖 `loading` 状态。
AsyncImage(
    model = ImageRequest.Builder(LocalContext.current)
        .data("https://example.com/image.jpg")
        .crossfade(true)
        .build(),
    contentDescription = null,
    modifier = Modifier
        .clip(CircleShape),
    loading = {
        CircularProgressIndicator()
    },
    contentScale = ContentScale.Crop
)

// 绘制具有圆形裁剪、淡入淡出的图像，并覆盖所有状态。
AsyncImage(
    model = ImageRequest.Builder(LocalContext.current)
        .data("https://example.com/image.jpg")
        .crossfade(true)
        .build(),
    contentDescription = null,
    modifier = Modifier
        .clip(CircleShape),
    contentScale = ContentScale.Crop
) { state ->
    if (state is AsyncImagePainter.State.Loading) {
        CircularProgressIndicator()
    } else {
        AsyncImageContent() // 绘制图像。
    }
}
```

- **重要**：将 `ImagePainter` 重命名为 `AsyncImagePainter`，将 `rememberImagePainter` 重命名为 `rememberAsyncImagePainter`。
    - 不再支持 `ExecuteCallback`。要让 `AsyncImagePainter` 跳过等待 `onDraw` 被调用，请改为设置 `ImageRequest.size(OriginalSize)`（或任何尺寸）。
    - 向 `rememberAsyncImagePainter` 添加可选的 `FilterQuality` 参数。
- 在 `DiskCache` 中使用协程进行清理操作，并添加 `DiskCache.Builder.cleanupDispatcher`。
- 修复使用 `ImageLoader.Builder.placeholder` 设置占位符时的 Compose 预览。
- 使用 `@ReadOnlyComposable` 标记 `LocalImageLoader.current` 以生成更高效的代码。
- 更新 Compose 至 1.1.0-beta03 并依赖 `compose.foundation` 而不是 `compose.ui`。
- 更新 `androidx.appcompat-resources` 至 1.4.0。

## [2.0.0-alpha03] - 2021年11月12日

- 添加在 Android 29+ 上加载音乐缩略图的能力。([#967](https://github.com/coil-kt/coil/pull/967))
- 修复：使用 `context.resources` 加载当前包的资源。([#968](https://github.com/coil-kt/coil/pull/968))
- 修复：`clear` -> `dispose` 替换表达式。([#970](https://github.com/coil-kt/coil/pull/970))
- 更新 Compose 至 1.0.5。
- 更新 `accompanist-drawablepainter` 至 0.20.2。
- 更新 Okio 至 3.0.0。
- 更新 `androidx.annotation` 至 1.3.0。
- 更新 `androidx.core` 至 1.7.0。
- 更新 `androidx.lifecycle` 至 2.4.0。
    - 移除对 `lifecycle-common-java8` 的依赖，因为它已合并到 `lifecycle-common` 中。

## [2.0.0-alpha02] - 2021年10月24日

- 添加一个新的 `coil-bom` 构件，其中包含 [物料清单 (BOM)](https://docs.gradle.org/7.2/userguide/platforms.html#sub:bom_import)。
    - 导入 `coil-bom` 允许您依赖其他 Coil 构件而无需指定版本。
- 修复使用 `ExecuteCallback.Immediate` 时加载图像失败的问题。
- 更新 Okio 至 3.0.0-alpha.11。
    - 这也解决了与 Okio 3.0.0-alpha.11 的兼容性问题。
- 更新 Kotlin 至 1.5.31。
- 更新 Compose 至 1.0.4。

## [2.0.0-alpha01] - 2021年10月11日

Coil 2.0.0 是该库的下一个主要迭代，具有新功能、性能改进、API 改进和各种错误修复。在 2.0.0 稳定版发布之前，此版本可能与未来的 alpha 版本存在二进制/源码不兼容。

- **重要**：最低支持的 API 现在为 21。
- **重要**：启用 `-Xjvm-default=all`。
    - 这会生成 Java 8 默认方法，而不是使用 Kotlin 的默认接口方法支持。查看[此博文](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/)了解更多信息。
    - **您还需要在构建文件中添加 `-Xjvm-default=all` 或 `-Xjvm-default=all-compatibility`。** 有关如何操作，请参阅[此处](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8)。
- **重要**：Coil 现在拥有自己的磁盘缓存实现，不再依赖 OkHttp 进行磁盘缓存。
    - 做出此更改是为了：
        - 更好地支持解码图像时的线程中断。这提高了图像请求快速连续启动和停止时的性能。
        - 支持暴露由 `File` 支持的 `ImageSource`。这避免了在 Android API 需要 `File` 进行解码（例如 `MediaMetadataRetriever`）时不必要的复制。
        - 支持直接读取/写入磁盘缓存文件。
    - 使用 `ImageLoader.Builder.diskCache` 和 `DiskCache.Builder` 配置磁盘缓存。
    - 您**不应该**在 Coil 2.0 中使用 OkHttp 的 `Cache`，因为它在写入过程中被中断可能会损坏。
    - 仍支持 `Cache-Control` 和其他缓存标头——除了 `Vary` 标头，因为缓存仅检查 URL 是否匹配。此外，仅缓存响应代码在 [200..300) 范围内的响应。
    - 使用 `ImageLoader.Builder.respectCacheHeaders` 可以启用或禁用对缓存标头的支持。
    - 升级到 2.0 时，现有的磁盘缓存将被清除并重建。
- **重要**：`ImageRequest` 的默认 `Scale` 现在为 `Scale.FIT`
    - 更改此设置是为了使 `ImageRequest.scale` 与具有默认 `Scale` 的其他类保持一致。
    - 带有 `ImageViewTarget` 的请求仍会自动检测其缩放比例。
- 图像流水线类发生重大变更：
    - `Mapper`、`Fetcher` 和 `Decoder` 已重构为更加灵活。
    - `Fetcher.key` 已替换为新的 `Keyer` 接口。`Keyer` 根据输入数据创建缓存键。
    - 添加 `ImageSource`，允许 `Decoder` 直接解码 `File`。
- 从库中移除了 `BitmapPool` 和 `PoolableViewTarget`。位图池化被移除的原因：
    - 它在 <= API 23 上最有效，但在较新的 Android 版本中效果已降低。
    - 移除位图池化允许 Coil 使用不可变位图，这具有性能优势。
    - 管理位图池存在运行时开销。
    - 位图池化在 Coil 的 API 上产生了设计限制，因为它需要跟踪位图是否符合池化条件。移除位图池化允许 Coil 在更多地方（例如 `Listener`、`Disposable`）公开结果 `Drawable`。此外，这意味着 Coil 不必清除 `ImageView`，这可能会导致 [问题](https://github.com/coil-kt/coil/issues/650)。
    - 位图池化[容易出错](https://github.com/coil-kt/coil/issues/546)。分配一个新位图比尝试重新使用可能仍在使用的位图要安全得多。
- `MemoryCache` 已重构为更加灵活。
- 禁用生成运行时非空断言。
    - 如果您使用 Java，将 null 作为带有非空注解的参数传递给函数将不再立即抛出 `NullPointerException`。如果您使用 Kotlin，基本上没有变化。
    - 此更改允许库的大小更小。
- 从库中移除了 `VideoFrameFileFetcher` 和 `VideoFrameUriFetcher`。请改用支持所有数据源的 `VideoFrameDecoder`。
- 添加 `bitmapFactoryMaxParallelism` 支持，限制正在进行的 `BitmapFactory` 操作的最大数量。此值默认为 4，可提高 UI 性能。
- 添加对 `interceptorDispatcher`、`fetcherDispatcher`、`decoderDispatcher` 和 `transformationDispatcher` 的支持。
- `Disposable` 已重构并暴露底层 `ImageRequest` 的作业。
- 将 `Transition.transition` 更改为 non-挂起 函数，因为不再需要挂起过渡直到其完成。
- 添加 `GenericViewTarget`，处理通用的 `ViewTarget` 逻辑。
- 从库中移除了 [`BlurTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/BlurTransformation.kt) 和 [`GrayscaleTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/GrayscaleTransformation.kt)。
    - 如果您使用它们，可以将它们的代码复制到您的项目中。
- 如果 `ImageRequest.fallback` 为 null，现在在 `Target` 上设置 `ImageRequest.error`。
- `Transformation.key` 被替换为 `Transformation.cacheKey`。
- `ImageRequest.Listener` 分别在 `onSuccess` 和 `onError` 中返回 `SuccessResult`/`ErrorResult`。
- 将 `ByteBuffer` 添加到默认支持的数据类型中。
- 从多个类中移除了 `toString` 实现。
- 更新 OkHttp 至 4.9.2。
- 更新 Okio 至 3.0.0-alpha.10。

## [1.4.0] - 2021年10月6日

- **新增**：向 `ImagePainter.State.Success` 和 `ImagePainter.State.Error` 添加 `ImageResult`。([#887](https://github.com/coil-kt/coil/pull/887))
    - 这是一个二进制不兼容的变更，更改了 `ImagePainter.State.Success` 和 `ImagePainter.State.Error` 的签名，但这些 API 已标记为实验性的。
- 仅当 `View.isShown` 为 `true` 时才执行 `CrossfadeTransition`。此前它仅检查 `View.isVisible`。([#898](https://github.com/coil-kt/coil/pull/898))
- 修复由于舍入问题导致缩放倍数略小于 1 时可能发生的内存缓存未命中。([#899](https://github.com/coil-kt/coil/pull/899))
- 使非内联 `ComponentRegistry` 方法公开。([#925](https://github.com/coil-kt/coil/pull/925))
- 依赖 `accompanist-drawablepainter` 并移除 Coil 自定义的 `DrawablePainter` 实现。([#845](https://github.com/coil-kt/coil/pull/845))
- 移除对 Java 8 方法的使用以防止脱糖问题。([#924](https://github.com/coil-kt/coil/pull/924))
- 将 `ImagePainter.ExecuteCallback` 提升为稳定 API。([#927](https://github.com/coil-kt/coil/pull/927))
- 将 compileSdk 更新至 31。
- 更新 Kotlin 至 1.5.30。
- 更新 Coroutines 至 1.5.2。
- 更新 Compose 至 1.0.3。

## [1.3.2] - 2021年8月4日

- `coil-compose` 现在依赖 `compose.ui` 而不是 `compose.foundation`。
    - `compose.ui` 是一个更小的依赖项，因为它是 `compose.foundation` 的子集。
- 更新 Jetpack Compose 至 1.0.1。
- 更新 Kotlin 至 1.5.21。
- 更新 Coroutines 至 1.5.1。
- 更新 `androidx.exifinterface:exifinterface` 至 1.3.3。

## [1.3.1] - 2021年7月28日

- 更新 Jetpack Compose 至 `1.0.0`。热烈祝贺 Compose 团队发布[稳定版本](https://android-developers.googleblog.com/2021/07/jetpack-compose-announcement.html)！
- 更新 `androidx.appcompat:appcompat-resources` 至 1.3.1。

## [1.3.0] - 2021年7月10日

- **新增**：添加对 [Jetpack Compose](https://developer.android.com/jetpack/compose) 的支持。它基于 [Accompanist](https://github.com/google/accompanist/) 的 Coil 集成，但进行了大量更改。有关更多信息，请查看[文档](https://coil-kt.github.io/coil/compose/)。
- 添加 `allowConversionToBitmap` 以启用/禁用 `Transformation` 的自动位图转换。([#775](https://github.com/coil-kt/coil/pull/775))
- 向 `ImageDecoderDecoder` 和 `GifDecoder` 添加 `enforceMinimumFrameDelay`，以支持在 GIF 帧延迟低于阈值时进行改写。([#783](https://github.com/coil-kt/coil/pull/783))
    - 默认情况下禁用，但将在未来版本中默认启用。
- 添加对启用/禁用 `ImageLoader` 内部网络观察器的支持。([#741](https://github.com/coil-kt/coil/pull/741))
- 修复由 `BitmapFactoryDecoder` 解码的位图密度。([#776](https://github.com/coil-kt/coil/pull/776))
- 修复 Licensee 找不到 Coil 许可证 URL 的问题。([#774](https://github.com/coil-kt/coil/pull/774))
- 更新 `androidx.core:core-ktx` 至 1.6.0。

## [1.2.2] - 2021年6月4日

- 修复在将具有共享状态的可绘制对象转换为位图时的竞态条件。([#771](https://github.com/coil-kt/coil/pull/771))
- 修复 `ImageLoader.Builder.fallback` 设置 `error` 可绘制对象而不是 `fallback` 可绘制对象的问题。
- 修复 `ResourceUriFetcher` 返回的数据源不正确的问题。([#770](https://github.com/coil-kt/coil/pull/770))
- 修复 API 26 和 27 上没有可用文件描述符的日志检查。
- 修复平台矢量可绘制对象支持的错误版本检查。([#751](https://github.com/coil-kt/coil/pull/751))
- 更新 Kotlin (1.5.10)。
- 更新 Coroutines (1.5.0)。
- 更新 `androidx.appcompat:appcompat-resources` 至 1.3.0。
- 更新 `androidx.core:core-ktx` 至 1.5.0。

## [1.2.1] - 2021年4月27日

- 修复 `VideoFrameUriFetcher` 尝试处理 http/https URI 的问题。([#734](https://github.com/coil-kt/coil/pull/734)

## [1.2.0] - 2021年4月12日

- **重要**：在 `SvgDecoder` 中使用 SVG 的视图边界（view bounds）来计算其纵横比。([#688](https://github.com/coil-kt/coil/pull/688))
    - 此前，`SvgDecoder` 使用 SVG 的 `width`/`height` 元素来确定其纵横比，但这并未正确遵循 SVG 规范。
    - 要恢复到旧行为，请在构造 `SvgDecoder` 时设置 `useViewBoundsAsIntrinsicSize = false`。
- **新增**：添加 `VideoFrameDecoder` 以支持从任何源解码视频帧。([#689](https://github.com/coil-kt/coil/pull/689))
- **新增**：支持使用源内容（而不仅仅是 MIME 类型）进行自动 SVG 检测。([#654](https://github.com/coil-kt/coil/pull/654))
- **新增**：支持使用 `ImageLoader.newBuilder()` 共享资源。([#653](https://github.com/coil-kt/coil/pull/653))
    - 重要的是，这支持在 `ImageLoader` 实例之间共享内存缓存。
- **新增**：支持使用 `AnimatedTransformation` 进行动画图像变换。([#659](https://github.com/coil-kt/coil/pull/659))
- **新增**：添加对动画可绘制对象开始/结束回调的支持。([#676](https://github.com/coil-kt/coil/pull/676))

---

- 修复 HEIF/HEIC 文件的 EXIF 数据解析。([#664](https://github.com/coil-kt/coil/pull/664))
- 修复在禁用了位图池化的情况下不使用 `EmptyBitmapPool` 实现的问题。([#638](https://github.com/coil-kt/coil/pull/638))
    - 如果没有此修复，位图池化仍会被正确禁用，但它使用的是更重量级的 `BitmapPool` 实现。
- 修复 `MovieDrawable.getOpacity` 会错误地返回透明的情况。([#682](https://github.com/coil-kt/coil/pull/682))
- 防范默认临时目录不存在的情况。([#683](https://github.com/coil-kt/coil/pull/683))

---

- 使用 JVM IR 后端进行构建。([#670](https://github.com/coil-kt/coil/pull/670))
- 更新 Kotlin (1.4.32)。
- 更新 Coroutines (1.4.3)。
- 更新 OkHttp (3.12.13)。
- 更新 `androidx.lifecycle:lifecycle-common-java8` 至 2.3.1。

## [1.1.1] - 2021年1月11日

- 修复 `ViewSizeResolver.size` 可能会因为多次恢复协程而抛出 `IllegalStateException` 的情况。
- 修复如果从主线程调用 `HttpFetcher` 会永远阻塞的问题。
    - 使用 `ImageRequest.dispatcher(Dispatchers.Main.immediate)` 强制在主线程执行的请求将失败并抛出 `NetworkOnMainThreadException`，除非将 `ImageRequest.networkCachePolicy` 设置为 `CachePolicy.DISABLED` 或 `CachePolicy.WRITE_ONLY`。
- 如果视频具有旋转元数据，旋转来自 `VideoFrameFetcher` 的视频帧。
- 更新 Kotlin (1.4.21)。
- 更新 Coroutines (1.4.2)。
- 更新 Okio (2.10.0)。
- 更新 `androidx.exifinterface:exifinterface` (1.3.2)。

## [1.1.0] - 2020年11月24日

- **重要**：将 `CENTER` 和 `MATRIX` `ImageView` 缩放类型更改为解析为 `OriginalSize`。([#587](https://github.com/coil-kt/coil/pull/587))
    - 此更改仅影响未显式指定请求尺寸时的隐式尺寸解析算法。
    - 做出此更改是为了确保图像请求的视觉结果与 `ImageView.setImageResource`/`ImageView.setImageURI` 一致。要恢复旧行为，请在构建请求时设置 `ViewSizeResolver`。
- **重要**：如果视图的布局参数为 `WRAP_CONTENT`，则从 `ViewSizeResolver` 返回显示尺寸。([#562](https://github.com/coil-kt/coil/pull/562))
    - 此前，只有在视图完全布局完成后我们才会返回显示尺寸。此更改使典型行为更加一致和直观。
- 添加控制 alpha 预乘的能力。([#569](https://github.com/coil-kt/coil/pull/569))
- 在 `CrossfadeDrawable` 中支持优先使用精确的固有大小。([#585](https://github.com/coil-kt/coil/pull/585))
- 检查包含版本的完整 GIF 标头。([#564](https://github.com/coil-kt/coil/pull/564))
- 添加空位图池实现。([#561](https://github.com/coil-kt/coil/pull/561))
- 使 `EventListener.Factory` 成为一个函数式接口。([#575](https://github.com/coil-kt/coil/pull/575))
- 稳定 `EventListener`。([#574](https://github.com/coil-kt/coil/pull/574))
- 为 `ImageRequest.Builder.placeholderMemoryCacheKey` 添加 `String` 重载。
- 向 `ViewSizeResolver` 构造函数添加 `@JvmOverloads`。
- 修复：在 `CrossfadeDrawable` 中变异起始/结束可绘制对象。([#572](https://github.com/coil-kt/coil/pull/572))
- 修复：修复 GIF 在第二次加载时不播放的问题。([#577](https://github.com/coil-kt/coil/pull/534))
- 更新 Kotlin (1.4.20) 并迁移到 `kotlin-parcelize` 插件。
- 更新 Coroutines (1.4.1)。

## [1.0.0] - 2020年10月22日

自 `0.13.0` 以来的变更：
- 添加 `Context.imageLoader` 扩展函数。([#534](https://github.com/coil-kt/coil/pull/534))
- 添加 `ImageLoader.executeBlocking` 扩展函数。([#537](https://github.com/coil-kt/coil/pull/537))
- 如果单例图像加载器被替换，不要将其关闭。([#533](https://github.com/coil-kt/coil/pull/533))

自 `1.0.0-rc3` 以来的变更：
- 修复：防范缺少/无效的 ActivityManager。([#541](https://github.com/coil-kt/coil/pull/541))
- 修复：允许 OkHttp 缓存失败的响应。([#551](https://github.com/coil-kt/coil/pull/551))
- 更新 Kotlin 至 1.4.10。
- 更新 Okio 至 2.9.0。
- 更新 `androidx.exifinterface:exifinterface` 至 1.3.1。

## [1.0.0-rc3] - 2020年9月21日

- 由于不稳定，撤销使用 [`-Xjvm-default=all`](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/) 编译器标志。
    - **这是与之前发布候选版本源码兼容但二进制不兼容的更改。**
- 添加 `Context.imageLoader` 扩展函数。([#534](https://github.com/coil-kt/coil/pull/534))
- 添加 `ImageLoader.executeBlocking` 扩展函数。([#537](https://github.com/coil-kt/coil/pull/537))
- 如果单例图像加载器被替换，不要将其关闭。([#533](https://github.com/coil-kt/coil/pull/533))
- 更新 AndroidX 依赖项：
    - `androidx.exifinterface:exifinterface` -> 1.3.0

## [1.0.0-rc2] - 2020年9月3日

- **此版本需要 Kotlin 1.4.0 或更高版本。**
- [0.13.0](#0130---september-3-2020) 中的所有更改。
- 依赖基础 Kotlin `stdlib` 而不是 `stdlib-jdk8`。

## [0.13.0] - 2020年9月3日

- **重要**：默认在主线程启动拦截器链。([#513](https://github.com/coil-kt/coil/pull/513))
    - 这在很大程度上恢复了 `0.11.0` 及更低版本的行为，即在主线程上同步检查内存缓存。
    - 要恢复到与 `0.12.0` 相同的行为（即在 `ImageRequest.dispatcher` 上检查内存缓存），请设置 `ImageLoader.Builder.launchInterceptorChainOnMainThread(false)`。
    - 有关更多信息，请参阅 [`launchInterceptorChainOnMainThread`](https://coil-kt.github.io/coil/api/coil-core/coil3/-image-loader/-builder/launch-interceptor-chain-on-main-thread/)。

---

- 修复：修复如果请求是在处于分离状态的 fragment 中的 `ViewTarget` 上启动，可能导致的内存泄漏。([#518](https://github.com/coil-kt/coil/pull/518))
- 修复：使用 `ImageRequest.context` 加载资源 URI。[#517](https://github.com/coil-kt/coil/pull/517)
- 修复：修复可能会导致后续请求无法保存到磁盘缓存的竞态条件。([#510](https://github.com/coil-kt/coil/pull/510))
- 修复：在 API 18 上使用 `blockCountLong` 和 `blockSizeLong`。

---

- 使 `ImageLoaderFactory` 成为一个函数式接口。
- 添加 `ImageLoader.Builder.addLastModifiedToFileCacheKey`，允许您启用/禁用为从 `File` 加载的图像在内存缓存键中添加最后修改时间戳。

---

- 更新 Kotlin 至 1.4.0。
- 更新 Coroutines 至 1.3.9。
- 更新 Okio 至 2.8.0。

## [1.0.0-rc1] - 2020年8月18日

- **此版本需要 Kotlin 1.4.0 或更高版本。**
- 更新 Kotlin 至 1.4.0 并启用 [`-Xjvm-default=all`](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/)。
    - **[请参阅此处](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8)了解如何在构建文件中启用 `-Xjvm-default=all`。**
    - 这将为默认 Kotlin 接口方法生成 Java 8 默认方法。
- 移除 0.12.0 中所有现有的弃用方法。
- 更新 Coroutines 至 1.3.9。

## [0.12.0] - 2020年8月18日

- **破坏性变更**：`LoadRequest` 和 `GetRequest` 已由 `ImageRequest` 替换：
    - `ImageLoader.execute(LoadRequest)` -> `ImageLoader.enqueue(ImageRequest)`
    - `ImageLoader.execute(GetRequest)` -> `ImageLoader.execute(ImageRequest)`
    - `ImageRequest` 实现了 `equals`/`hashCode`。
- **破坏性变更**：重命名了一些类和/或更改了包名：
    - `coil.request.RequestResult` -> `coil.request.ImageResult`
    - `coil.request.RequestDisposable` -> `coil.request.Disposable`
    - `coil.bitmappool.BitmapPool` -> `coil.bitmap.BitmapPool`
    - `coil.DefaultRequestOptions` -> `coil.request.DefaultRequestOptions`
- **破坏性变更**：[`SparseIntArraySet`](https://github.com/coil-kt/coil/blob/f52addd039f0195b66f93cb0f1cad59b0832f784/coil-core/src/main/java/coil/collection/SparseIntArraySet.kt) 已从公开 API 中移除。
- **破坏性变更**：`TransitionTarget` 不再实现 `ViewTarget`。
- **破坏性变更**：`ImageRequest.Listener.onSuccess` 的签名已更改，返回 `ImageResult.Metadata` 而不仅仅是 `DataSource`。
- **破坏性变更**：移除对 `LoadRequest.aliasKeys` 的支持。此 API 最好通过直接读写内存缓存来处理。

---

- **重要**：内存缓存中的值不再同步解析（如果从主线程调用）。
    - 做出此更改也是为了支持在后台调度器上执行 `Interceptor`。
    - 此更改还使更多工作脱离主线程，提升了性能。
- **重要**：`Mappers` 现在在后台调度器上执行。作为副作用，不再**自动**支持自动位图采样。要达到相同的效果，请将上一个请求的 `MemoryCache.Key` 用作后续请求的 `placeholderMemoryCacheKey`。[点此查看示例](https://coil-kt.github.io/coil/recipes/#using-a-memory-cache-key-as-a-placeholder)。
    - `placeholderMemoryCacheKey` API 提供了更多自由，因为您可以“链接”两个具有不同数据的图像请求（例如小图/大图使用不同的 URL）。
- **重要**：Coil 的 `ImageView` 扩展函数已从 `coil.api` 包移动到 `coil` 包。
    - 使用查找并替换功能重构 `import coil.api.load` -> `import coil.load`。不幸的是，无法使用 Kotlin 的 `ReplaceWith` 功能来替换导入。
- **重要**：如果可绘制对象不是同一图像，请使用标准淡入淡出。
- **重要**：在 API 24+ 上优先使用不可变位图。
- **重要**：`MeasuredMapper` 已弃用，取而代之的是新的 `Interceptor` 接口。有关如何将 `MeasuredMapper` 转换为 `Interceptor` 的示例，请参阅[此处](https://gist.github.com/colinrtwhite/90267704091467451e46b21b95154299)。
    - `Interceptor` 是一个限制更少的 API，允许更广泛的自定义逻辑。
- **重要**：`ImageRequest.data` 现在不能为空。如果您在未设置数据的情况下创建 `ImageRequest`，它将返回 `NullRequestData` 作为其数据。

---

- **新增**：支持直接读写访问 `ImageLoader` 的 `MemoryCache`。有关更多信息，请参阅[文档](https://coil-kt.github.io/coil/getting_started/#memory-cache)。
- **新增**：支持 `Interceptor`。有关更多信息，请参阅[文档](https://coil-kt.github.io/coil/image_pipeline/#interceptors)。Coil 的 `Interceptor` 设计深受 [OkHttp](https://github.com/square/okhttp) 的启发！
- **新增**：能够使用 `ImageLoader.Builder.bitmapPoolingEnabled` 启用/禁用位图池化。
    - 位图池化在 API 23 及以下版本中最为有效，但在 API 24 及以上版本中仍可能是有益的（通过积极调用 `Bitmap.recycle`）。
- **新增**：支持解码时的线程中断。

---

- 修复 content-type 标头中解析多个段的问题。
- 重构位图引用计数，使其更加健壮。
- 修复 API < 19 设备上的 WebP 解码。
- 在 EventListener API 中公开 FetchResult 和 DecodeResult。

---

- 使用 SDK 30 进行编译。
- 更新 Coroutines 至 1.3.8。
- 更新 OkHttp 至 3.12.12。
- 更新 Okio 至 2.7.0。
- 更新 AndroidX 依赖项：
    - `androidx.appcompat:appcompat-resources` -> 1.2.0
    - `androidx.core:core-ktx` -> 1.3.1

## [0.11.0] - 2020年5月14日

- **破坏性变更**：**此版本移除了所有现有的已弃用函数。**
    - 这支持了移除 Coil 的 `ContentProvider`，这样它就不会在应用启动时运行任何代码。
- **破坏性变更**：将 `SparseIntArraySet.size` 转换为 val。([#380](https://github.com/coil-kt/coil/pull/380))
- **破坏性变更**：将 `Parameters.count()` 移至扩展函数。([#403](https://github.com/coil-kt/coil/pull/403))
- **破坏性变更**：使 `BitmapPool.maxSize` 成为 Int。([#404](https://github.com/coil-kt/coil/pull/404))

---

- **重要**：使 `ImageLoader.shutdown()` 可选（类似于 `OkHttpClient`）。([#385](https://github.com/coil-kt/coil/pull/385))

---

- 修复：修复 AGP 4.1 兼容性。([#386](https://github.com/coil-kt/coil/pull/386))
- 修复：修复测量 GONE 视图。([#397](https://github.com/coil-kt/coil/pull/397))

---

- 将默认内存缓存大小降低至 20%。([#390](https://github.com/coil-kt/coil/pull/390))
    - 要恢复现有行为，请在创建 `ImageLoader` 时设置 `ImageLoaderBuilder.availableMemoryPercentage(0.25)`。
- 更新 Coroutines 至 1.3.6。
- 更新 OkHttp 至 3.12.11。

## [0.10.1] - 2020年4月26日

- 修复 API 23 及以下版本在解码大型 PNG 时发生 OOM 的问题。([#372](https://github.com/coil-kt/coil/pull/372))。
    - 这禁用了对 PNG 文件的 EXIF 方向解码。PNG EXIF 方向极少使用，且读取 PNG EXIF 数据（即使它是空的）也需要将整个文件缓冲到内存中，这对性能不利。
- 对 `SparseIntArraySet` 进行了细微的 Java 兼容性改进。

---

- 更新 Okio 至 2.6.0。

## [0.10.0] - 2020年4月20日

### 亮点

- **此版本弃用了大部分 DSL API，转而直接使用构建器。** 更改如下所示：

    ```kotlin
    // 0.9.5 (旧版)
    val imageLoader = ImageLoader(context) {
        bitmapPoolPercentage(0.5)
        crossfade(true)
    }

    val disposable = imageLoader.load(context, "https://example.com/image.jpg") {
        target(imageView)
    }

    val drawable = imageLoader.get("https://example.com/image.jpg") {
        size(512, 512)
    }

    // 0.10.0 (新版)
    val imageLoader = ImageLoader.Builder(context)
        .bitmapPoolPercentage(0.5)
        .crossfade(true)
        .build()

    val request = LoadRequest.Builder(context)
        .data("https://example.com/image.jpg")
        .target(imageView)
        .build()
    val disposable = imageLoader.execute(request)

    val request = GetRequest.Builder(context)
        .data("https://example.com/image.jpg")
        .size(512, 512)
        .build()
    val drawable = imageLoader.execute(request).drawable
    ```

    - 如果您正在使用 `io.coil-kt:coil` 构件，可以调用 `Coil.execute(request)` 来使用单例 `ImageLoader` 执行请求。

- **`ImageLoader` 现在具有一个弱引用内存缓存**，当图像从强引用内存缓存中逐出后，它会跟踪这些图像的弱引用。
    - 这意味着只要仍有对图像的强引用，图像将始终从 `ImageLoader` 的内存缓存中返回。
    - 总体而言，这应该使内存缓存更加可预测并提高其命中率。
    - 此行为可以使用 `ImageLoaderBuilder.trackWeakReferences` 启用/禁用。

- 添加了一个新构件 **`io.coil-kt:coil-video`**，用于从视频文件中解码特定帧。[点此阅读更多内容](https://coil-kt.github.io/coil/videos/)。

- 添加了用于跟踪指标的新 [EventListener](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/EventListener.kt) API。

- 添加了 [ImageLoaderFactory](https://github.com/coil-kt/coil/blob/main/coil/src/main/java/coil/ImageLoaderFactory.kt)，您的 `Application` 可以实现它以简化单例初始化。

---

### 完整版本说明

- **重要**：弃用 DSL 语法，转而使用构建器语法。([#267](https://github.com/coil-kt/coil/pull/267))
- **重要**：弃用 `Coil` 和 `ImageLoader` 扩展函数。([#322](https://github.com/coil-kt/coil/pull/322))
- **破坏性变更**：从 `ImageLoader.execute(GetRequest)` 返回密封类 `RequestResult` 类型。([#349](https://github.com/coil-kt/coil/pull/349))
- **破坏性变更**：将 `ExperimentalCoil` 重命名为 `ExperimentalCoilApi`。从 `@Experimental` 迁移到 `@RequiresOptIn`。([#306](https://github.com/coil-kt/coil/pull/306))
- **破坏性变更**：将 `CoilLogger` 替换为 `Logger` 接口。([#316](https://github.com/coil-kt/coil/pull/316))
- **破坏性变更**：将 destWidth/destHeight 重命名为 dstWidth/dstHeight。([#275](https://github.com/coil-kt/coil/pull/275))
- **破坏性变更**：重新排列 `MovieDrawable` 的构造函数参数。([#272](https://github.com/coil-kt/coil/pull/272))
- **破坏性变更**：`Request.Listener` 的方法现在接收完整的 `Request` 对象而不仅仅是其数据。
- **破坏性变更**：`GetRequestBuilder` 现在其构造函数中需要 `Context`。
- **破坏性变更**：`Request` 上的多个属性现在是可空的。
- **行为变更**：默认在缓存键中包含参数值。([#319](https://github.com/coil-kt/coil/pull/319))
- **行为变更**：略微调整了 `Request.Listener.onStart()` 的调用时机，使其在 `Target.onStart()` 之后立即被调用。([#348](https://github.com/coil-kt/coil/pull/348))

---

- **新增**：添加 `WeakMemoryCache` 实现。([#295](https://github.com/coil-kt/coil/pull/295))
- **新增**：添加 `coil-video` 以支持解码视频帧。([#122](https://github.com/coil-kt/coil/pull/122))
- **新增**：引入 [`EventListener`](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/EventListener.kt)。([#314](https://github.com/coil-kt/coil/pull/314))
- **新增**：引入 [`ImageLoaderFactory`](https://github.com/coil-kt/coil/blob/main/coil/src/main/java/coil/ImageLoaderFactory.kt)。([#311](https://github.com/coil-kt/coil/pull/311))
- **新增**：在 Android 11 上支持动画 HEIF 图像序列。([#297](https://github.com/coil-kt/coil/pull/297))
- **新增**：提升 Java 兼容性。([#262](https://github.com/coil-kt/coil/pull/262))
- **新增**：支持设置默认 `CachePolicy`。([#307](https://github.com/coil-kt/coil/pull/307))
- **新增**：支持设置默认 `Bitmap.Config`。([#342](https://github.com/coil-kt/coil/pull/342))
- **新增**：添加 `ImageLoader.invalidate(key)` 以清除单个内存缓存项 ([#55](https://github.com/coil-kt/coil/pull/55))
- **新增**：添加调试日志以解释为何未重用缓存图像。([#346](https://github.com/coil-kt/coil/pull/346))
- **新增**：为 get 请求支持 `error` 和 `fallback` 可绘制对象。

---

- 修复：修复当 Transformation 缩小输入位图尺寸时内存缓存未命中的问题。([#357](https://github.com/coil-kt/coil/pull/357))
- 修复：确保 BlurTransformation 中的半径低于 RenderScript 的最大值。([#291](https://github.com/coil-kt/coil/pull/291))
- 修复：修复解码高色深图像的问题。([#358](https://github.com/coil-kt/coil/pull/358))
- 修复：在 Android 11 及以上版本中禁用 `ImageDecoderDecoder` 崩溃规避方案。([#298](https://github.com/coil-kt/coil/pull/298))
- 修复：修复 API 23 之前解析 EXIF 数据失败的问题。([#331](https://github.com/coil-kt/coil/pull/331))
- 修复：修复与 Android R SDK 的不兼容性。([#337](https://github.com/coil-kt/coil/pull/337))
- 修复：仅当 `ImageView` 具有匹配的 `SizeResolver` 时才启用不精确尺寸。([#344](https://github.com/coil-kt/coil/pull/344))
- 修复：允许缓存图像与请求尺寸最多有一像素偏差。([#360](https://github.com/coil-kt/coil/pull/360))
- 修复：如果视图不可见，则跳过淡入淡出过渡。([#361](https://github.com/coil-kt/coil/pull/361))

---

- 弃用 `CoilContentProvider`。([#293](https://github.com/coil-kt/coil/pull/293))
- 为多个 `ImageLoader` 方法添加 `@MainThread` 注解。
- 如果生命周期当前已启动，避免创建 `LifecycleCoroutineDispatcher`。([#356](https://github.com/coil-kt/coil/pull/356))
- 为 `OriginalSize.toString()` 使用完整包名。
- 解码软件位图时预分配内存。([#354](https://github.com/coil-kt/coil/pull/354))

---

- 更新 Kotlin 至 1.3.72。
- 更新 Coroutines 至 1.3.5。
- 更新 OkHttp 至 3.12.10。
- 更新 Okio 至 2.5.0。
- 更新 AndroidX 依赖项：
    - `androidx.exifinterface:exifinterface` -> 1.2.0

## [0.9.5] - 2020年2月6日

- 修复：确保在检查视图是否启用硬件加速之前将其附加。这修复了请求硬件位图可能会错过内存缓存的情况。

---

- 更新 AndroidX 依赖项：
    - `androidx.core:core-ktx` -> 1.2.0

## [0.9.4] - 2020年2月3日

- 修复：在 ImageDecoderDecoder 中进行下采样时遵循纵横比。感谢 @zhanghai。

---

- 此前，只要位图的配置大于或等于请求中指定的配置，就会从内存缓存中返回位图。例如，如果您请求一个 `ARGB_8888` 位图，可能会从内存缓存中为您返回一个 `RGBA_F16` 位图。现在，缓存配置和请求配置必须相等。
- 使 `scale` 和 `durationMillis` 成为公开属性。

## [0.9.3] - 2020年2月1日

- 修复：在 `ScaleDrawable` 内部平移子可绘制对象以确保其居中。
- 修复：修复 GIF 和 SVG 无法完全填满边界的问题。

---

- 将 `HttpUrl.get()` 的调用推迟到后台线程。
- 改进 BitmapFactory null 位图错误消息。
- 将 3 台设备添加到硬件位图黑名单。([#264](https://github.com/coil-kt/coil/pull/264))

---

- 更新 AndroidX 依赖项：
    - `androidx.lifecycle:lifecycle-common-java8` -> 2.2.0

## [0.9.2] - 2020年1月19日

- 修复：修复在 API 19 之前解码 GIF 的问题。感谢 @mario。
- 修复：修复光栅化的矢量可绘制对象未被标记为已采样的问题。
- 修复：如果 Movie 维度 <= 0，则抛出异常。
- 修复：修复内存缓存事件未恢复 `CrossfadeTransition` 的问题。
- 修复：如果被禁止，阻止向所有 target 方法返回硬件位图。
- 修复：修复 `MovieDrawable` 未将其自身定位在边界中心的问题。

---

- 从 `CrossfadeDrawable` 中移除自动缩放。
- 使 `BitmapPool.trimMemory` 成为公开方法。
- 将 `AnimatedImageDrawable` 包装在 `ScaleDrawable` 中以确保其填满边界。
- 向 `RequestBuilder.setParameter` 添加 `@JvmOverloads`。
- 如果未设置视图框（view box），则将 SVG 的视图框设置为其尺寸。
- 将状态和级别更改传递给 `CrossfadeDrawable` 子项。

---

- 更新 OkHttp 至 3.12.8。

## [0.9.1] - 2019年12月30日

- 修复：修复调用 `LoadRequestBuilder.crossfade(false)` 时崩溃的问题。

## [0.9.0] - 2019年12月30日

- **破坏性变更**：`Transformation.transform` 现在包含一个 `Size` 参数。这是为了支持根据 `Target` 的尺寸更改输出 `Bitmap` 尺寸的变换。带有变换的请求现在也不受[图像采样](https://coil-kt.github.io/coil/getting_started/#image-sampling)的限制。
- **破坏性变更**：`Transformation` 现在应用于任何类型的 `Drawable`。此前，如果输入 `Drawable` 不是 `BitmapDrawable`，则会跳过 `Transformation`。现在，在应用 `Transformation` 之前，`Drawable` 会先渲染到位图上。
- **破坏性变更**：向 `ImageLoader.load` 传递 `null` 数据现在被视为错误，并将使用 `NullRequestDataException` 调用 `Target.onError` 和 `Request.Listener.onError`。做出此更改是为了支持在数据为 `null` 时设置 `fallback` 可绘制对象。此前此类请求会被默默忽略。
- **破坏性变更**：`RequestDisposable.isDisposed` 现在是一个 `val`。

---

- **新增**：支持自定义过渡。[点此获取更多信息](/coil/compose)。过渡 API 被标记为实验性，因为该 API 仍处于孵化阶段。
- **新增**：添加 `RequestDisposable.await` 以支持在 `LoadRequest` 进行时挂起。
- **新增**：支持在请求数据为 null 时设置 `fallback` 可绘制对象。
- **新增**：添加 `Precision`。这使得输出 `Drawable` 的尺寸保持精确，同时支持对支持缩放的 target（如 `ImageViewTarget`）进行缩放优化。有关更多信息，请参阅[其文档](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/size/Precision.kt)。
- **新增**：添加 `RequestBuilder.aliasKeys` 以支持匹配多个缓存键。

---

- 修复：使 `RequestDisposable` 线程安全。
- 修复：`RoundedCornersTransformation` 现在会裁剪到 target 尺寸然后进行圆角处理。
- 修复：`CircleCropTransformation` 现在从中心进行裁剪。
- 修复：将几台设备添加到[硬件位图黑名单](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/memory/HardwareBitmapService.kt)。
- 修复：在将可绘制对象转换为位图时保留纵横比。
- 修复：修复 `Scale.FIT` 可能发生的内存缓存未命中。
- 修复：确保 `Parameters` 迭代顺序是确定性的。
- 修复：在创建 `Parameters` 和 `ComponentRegistry` 时进行防御性复制。
- 修复：确保 `RealBitmapPool` 的 `maxSize` >= 0。
- 修复：如果 `CrossfadeDrawable` 未在播放动画或已完成，则显示起始可绘制对象。
- 修复：调整 `CrossfadeDrawable` 以考虑具有未定义固有尺寸的子项。
- 修复：修复 `MovieDrawable` 缩放不正确的问题。

---

- 更新 Kotlin 至 1.3.61。
- 更新 Kotlin Coroutines 至 1.3.3。
- 更新 Okio 至 2.4.3。
- 更新 AndroidX 依赖项：
    - `androidx.exifinterface:exifinterface` -> 1.1.0

## [0.8.0] - 2019年10月22日

- **破坏性变更**：`SvgDrawable` 已被移除。取而代之的是，SVG 现在由 `SvgDecoder` 预渲染为 `BitmapDrawable`。这使得 SVG **在主线程上的渲染成本显著降低**。此外，`SvgDecoder` 现在在其构造函数中需要一个 `Context`。
- **破坏性变更**：`SparseIntArraySet` 扩展函数已移至 `coil.extension` 包。

---

- **新增**：支持设置按请求设置网络标头。[点此获取更多信息](https://github.com/coil-kt/coil/pull/120)。
- **新增**：添加新的 `Parameters` API 以支持在图像流水线中传递自定义数据。
- **新增**：在 `RoundedCornersTransformation` 中支持单独的圆角半径。感谢 @khatv911。
- **新增**：添加 `ImageView.clear()` 以支持主动释放资源。
- **新增**：支持从其他包加载资源。
- **新增**：向 `ViewSizeResolver` 添加 `subtractPadding` 属性，以启用/禁用在测量时减去视图的内边距。
- **新增**：改进 `HttpUrlFetcher` 的 MIME 类型检测。
- **新增**：为 `MovieDrawable` 和 `CrossfadeDrawable` 添加 `Animatable2Compat` 支持。
- **新增**：添加 `RequestBuilder<*>.repeatCount` 以设置 GIF 的循环次数。
- **新增**：将位图池创建功能添加到公开 API。
- **新增**：为 `Request.Listener` 方法添加 `@MainThread` 注解。

---

- 修复：使 `CoilContentProvider` 对测试可见。
- 修复：在资源缓存键中包含夜间模式。
- 修复：通过暂时将源写入磁盘来规避 `ImageDecoder` 原生崩溃问题。
- 修复：正确处理联系人显示照片 URI。
- 修复：到着色（tint）传递给 `CrossfadeDrawable` 的子项。
- 修复：修复了几处未关闭源的情况。
- 修复：添加了具有损坏/不完整硬件位图实现的设备黑名单。

---

- 针对 SDK 29 进行编译。
- 更新 Kotlin Coroutines 至 1.3.2。
- 更新 OkHttp 至 3.12.6。
- 更新 Okio 至 2.4.1。
- 为 `coil-base` 将 `appcompat-resources` 从 `compileOnly` 更改为 `implementation`。

## [0.7.0] - 2019年9月8日
- **破坏性变更**：`ImageLoaderBuilder.okHttpClient(OkHttpClient.Builder.() -> Unit)` 现在变为 `ImageLoaderBuilder.okHttpClient(() -> OkHttpClient)`。此外，初始值设定项现在在后台线程上延迟调用。**如果您设置了自定义 `OkHttpClient`，您必须设置 `OkHttpClient.cache` 以启用磁盘缓存。** 如果您未设置自定义 `OkHttpClient`，Coil 将创建启用磁盘缓存的默认 `OkHttpClient`。可以使用 `CoilUtils.createDefaultCache(context)` 创建默认的 Coil 缓存。例如：

```kotlin
val imageLoader = ImageLoader(context) {
    okHttpClient {
        OkHttpClient.Builder()
            .cache(CoilUtils.createDefaultCache(context))
            .build()
    }
}
```

- **破坏性变更**：`Fetcher.key` 不再具有默认实现。
- **破坏性变更**：此前，只会调用第一个适用的 `Mapper`。现在，所有适用的 `Mapper` 都会被调用。API 无变化。
- **破坏性变更**：细微的命名参数重命名：`url` -> `uri`，`factory` -> `initializer`。

---

- **新增**：`coil-svg` 构件，它具有支持自动解码 SVG 的 `SvgDecoder`。由 [AndroidSVG](https://github.com/BigBadaboom/androidsvg) 提供支持。感谢 @rharter。
- **新增**：`load(String)` 和 `get(String)` 现在接受任何受支持的 Uri 方案。例如：您现在可以执行 `imageView.load("file:///path/to/file.jpg")`。
- **新增**：重构 `ImageLoader` 以使用 `Call.Factory` 而不是 `OkHttpClient`。这支持使用 `ImageLoaderBuilder.okHttpClient { OkHttpClient() }` 延迟初始化网络资源。感谢 @ZacSweers。
- **新增**：使用 `RequestBuilder.decoder` 显式设置请求的解码器。
- **新增**：使用 `ImageLoaderBuilder.allowHardware` 默认在 `ImageLoader` 中启用/禁用硬件位图。
- **新增**：在 `ImageDecoderDecoder` 中支持软件渲染。

---

- 修复：加载矢量可绘制对象时的多个错误。
- 修复：支持 `WRAP_CONTENT` 视图维度。
- 修复：支持解析长度超过 8192 字节的 EXIF 数据。
- 修复：在淡入淡出时不要拉伸具有不同纵横比的可绘制对象。
- 修复：防范由于异常导致网络观察器无法注册的情况。
- 修复：修复 `MovieDrawable` 中的除以零错误。感谢 @R12rus。
- 修复：支持嵌套的 Android 资产文件。感谢 @JaCzekanski。
- 修复：防范在 Android O 和 O_MR1 上耗尽文件描述符。
- 修复：修复禁用内存缓存时崩溃的问题。感谢 @hansenji。
- 修复：确保 `Target.cancel` 始终从主线程调用。

---

- 更新 Kotlin 至 1.3.50。
- 更新 Kotlin Coroutines 至 1.3.0。
- 更新 OkHttp 至 3.12.4。
- 更新 Okio 至 2.4.0。
- 更新 AndroidX 依赖项至最新稳定版本：
    - `androidx.appcompat:appcompat` -> 1.1.0
    - `androidx.core:core-ktx` -> 1.1.0
    - `androidx.lifecycle:lifecycle-common-java8` -> 2.1.0
- 将 `appcompat` 替换为 `appcompat-resources` 作为可选的 `compileOnly` 依赖项。`appcompat-resources` 是一个更小的构件。

## [0.6.1] - 2019年8月16日
- 新增：向 `RequestBuilder` 添加 `transformations(List<Transformation>)`。
- 修复：为文件 URI 在缓存键中添加最后修改日期。
- 修复：确保视图维度评估为至少 1px。
- 修复：在帧之间清除 `MovieDrawable` 的画布。
- 修复：正确打开资产。

## [0.6.0] - 2019年8月12日
- 初始版本。