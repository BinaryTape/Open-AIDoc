# 更新日志

## [3.6.3] - 2026 年 9 月 18 日 {id="3-6-3-september-18-2026"}

- 修复使用 Android Gradle 插件 9.4.0 和 R8 的构建因 Kotlin 模块名称元数据中包含无效字符而失败的问题。

## [3.6.2] - 2026 年 9 月 4 日 {id="3-6-2-september-4-2026"}

- 修复当等待中的请求被取消时，`DeDupeConcurrentRequestStrategy` 会挂起该 key 的请求的问题。([#3566](https://github.com/coil-kt/coil/pull/3566))
- 修复使用 Compose Multiplatform 1.13 时出现的 JS/WASM 链接错误。([#3568](https://github.com/coil-kt/coil/pull/3568))

## [3.6.1] - 2026 年 9 月 1 日 {id="3-6-1-september-1-2026"}

- 修复启用 ES 模块时 JS 构建失败的问题。([#3558](https://github.com/coil-kt/coil/pull/3558))

## [3.6.0] - 2026 年 8 月 26 日 {id="3-6-0-august-26-2026"}

- **新增**：支持在 JS/WASM 上加载 `blob:` URL（对象 URL）。([#3504](https://github.com/coil-kt/coil/pull/3504))
- **新增**：添加 `ImageRequest.Builder.allowPartialImage` 与 `ImageLoader.Builder.allowPartialImage`，用于配置 Android 上的 `StaticImageDecoder` 是否接受部分图像。该选项默认启用，与先前 Coil 版本的行为一致。([#3494](https://github.com/coil-kt/coil/pull/3494))
- 修复使用倒置约束测量时 `AsyncImage` 崩溃的问题。([#3470](https://github.com/coil-kt/coil/pull/3470))
- 修复 Compose `filterQuality` 未应用于由 Drawable 支持的图像（包括 GIF）的问题。([#3469](https://github.com/coil-kt/coil/pull/3469))
- 修复 JS/WASM 图像解码器内存泄漏问题。([#3503](https://github.com/coil-kt/coil/pull/3503))
- 修复在 R8 9.0+ 优化构建中使用 `GenericViewTarget` 时图像无法渲染的问题。([#3518](https://github.com/coil-kt/coil/pull/3518))
- 在 JVM 上使用 `Runtime.maxMemory()` 确定最大内存缓存大小，而不是假定有 512 MB 的可用内存。([#3458](https://github.com/coil-kt/coil/pull/3458))
- 将 ProGuard 规则打包到非 Android JVM 构件中。([#3476](https://github.com/coil-kt/coil/pull/3476))
- 将 Android 编译 SDK 更新至 37。
- 将 Kotlin 更新至 2.4.10。
- 将 Compose 更新至 1.12.0。
- 将 Okio 更新至 3.18.1。
- 将 Skiko 更新至 0.150.1。
- 将 `kotlinx-io-okio` 更新至 0.9.1。

## [3.5.0] - 2026 年 6 月 10 日 {id="3-5-0-june-10-2026"}

自 `3.4.0` 以来的变更：

- **重要**：移除 `iosX64` 与 `macosX64` 目标。([#3386](https://github.com/coil-kt/coil/pull/3386))
- **重要**：将 Android 最低 SDK 版本提升至 23。([#3283](https://github.com/coil-kt/coil/pull/3283))
- **新增**：在 JS/WASM 上添加快速 WebP 尺寸提取功能，以避免回退到完整的 Skia 解码。([#3341](https://github.com/coil-kt/coil/pull/3341))
- 移除 `ImageLoader.Builder.memoryCacheMaxSizePercentWhileInBackground` 上的实验性注解。([#3439](https://github.com/coil-kt/coil/pull/3439))
- 修复 `CacheStrategy` 实现无法刷新已缓存的失败响应（例如已过期的缓存 `404` 响应）的问题。([#3401](https://github.com/coil-kt/coil/pull/3401))
- 在协程上下文中查找 `ContinuationInterceptor` 而非 `CoroutineDispatcher`。([#3415](https://github.com/coil-kt/coil/pull/3415))
- 将 Android 编译 SDK 更新至 36。
- 将 Kotlin 语言版本更新至 2.2。
- 将 Kotlin 更新至 2.4.0。
- 将 Compose 更新至 1.11.1。
- 将 Okio 更新至 3.17.0。
- 将 Skiko 更新至 0.144.6。
- 将 `androidx.annotation` 更新至 1.10.0。

自 `3.5.0-beta01` 以来的变更：

- 移除 `ImageLoader.Builder.memoryCacheMaxSizePercentWhileInBackground` 上的实验性注解。([#3439](https://github.com/coil-kt/coil/pull/3439))
- 在协程上下文中查找 `ContinuationInterceptor` 而非 `CoroutineDispatcher`。([#3415](https://github.com/coil-kt/coil/pull/3415))
- 将 Kotlin 语言版本更新至 2.2。
- 将 Kotlin 更新至 2.4.0。
- 将 Compose 更新至 1.11.1。
- 将 Skiko 更新至 0.144.6。

## [3.5.0-beta01] - 2026 年 5 月 4 日 {id="3-5-0-beta01-may-4-2026"}

- 移除 `iosX64` 与 `macosX64` 目标。([#3386](https://github.com/coil-kt/coil/pull/3386))
- 将 Android 最低 SDK 版本提升至 23。([#3283](https://github.com/coil-kt/coil/pull/3283))
- 在 JS/WASM 上添加快速 WebP 尺寸提取功能，以避免回退到完整的 Skia 解码。([#3341](https://github.com/coil-kt/coil/pull/3341))
- 修复 `CacheStrategy` 实现无法刷新已缓存的失败响应（例如已过期的缓存 `404` 响应）的问题。([#3401](https://github.com/coil-kt/coil/pull/3401))
- 将编译 SDK 更新至 36。
- 将 Kotlin 更新至 2.3.21。
- 将 Compose 更新至 1.11.0-beta03。
- 将 Okio 更新至 3.17.0。
- 将 Skiko 更新至 0.144.5。
- 将 `androidx.annotation` 更新至 1.10.0。

## [3.4.0] - 2026 年 2 月 24 日 {id="3-4-0-february-24-2026"}

- **新增**：添加 `ConcurrentRequestStrategy`，以支持合并针对相同 key 的正在进行的网络请求。([#2995](https://github.com/coil-kt/coil/pull/2995)，[#3326](https://github.com/coil-kt/coil/pull/3326))
    - `DeDupeConcurrentRequestStrategy` 启用了该行为，并允许等待者等待正在进行的网络请求的结果。
        - 该行为属于实验性功能，目前默认处于禁用状态。
        - 目前，请求始终根据其 `diskCacheKey` 进行合并。
    - `OkHttpNetworkFetcherFactory`、`KtorNetworkFetcherFactory` 和 `NetworkFetcher.Factory` 现在接受 `concurrentRequestStrategy`。
- **新增**：在 JS/WASM 上使用 Web Worker 解码图像，以避免阻塞浏览器主线程。([#3305](https://github.com/coil-kt/coil/pull/3305))
- **新增**：为非 Compose 多平台构件添加对 Linux 原生目标（`linuxX64` 和 `linuxArm64`）的支持。([#3054](https://github.com/coil-kt/coil/pull/3054))
- **新增**：添加仅限 Compose 的 API，以改进后续请求之间的过渡效果。([#3141](https://github.com/coil-kt/coil/pull/3141)，[#3175](https://github.com/coil-kt/coil/pull/3175))
    - `ImageRequest.Builder.useExistingImageAsPlaceholder` 支持在未设置占位图时从上一张图像淡入淡出。
    - `ImageRequest.Builder.preferEndFirstIntrinsicSize` 允许 `CrossfadePainter` 优先使用结束绘制器（end painter）的固有尺寸。
- **新增**：在 `coil-gif` 中添加 `ImageLoader.Builder.repeatCount(Int)`，用于设置全局动图重复播放次数。([#3143](https://github.com/coil-kt/coil/pull/3143))
- **新增**：在 `coil-video` 中添加对优先使用内嵌视频缩略图的支持。([#3107](https://github.com/coil-kt/coil/pull/3107))
- **新增**：将 `coil-lint` 与 `coil-core` 一同发布，并添加 lint 检查以捕获在 `ImageRequest.Builder` 代码块中意外调用 `kotlin.error()` 的情况。([#3304](https://github.com/coil-kt/coil/pull/3304))
- 将 Kotlin 语言版本设置为 2.1。([#3302](https://github.com/coil-kt/coil/pull/3302))
- 使 `BitmapFetcher` 在通用代码中可用。([#3286](https://github.com/coil-kt/coil/pull/3286))
- 在 Android 上创建单例 `ImageLoader` 时使用 `applicationContext`。([#3246](https://github.com/coil-kt/coil/pull/3246))
- 默认缓存符合条件的非 2xx HTTP 响应（例如 `404`），并停止缓存不可缓存的响应（例如 `500`）。([#3137](https://github.com/coil-kt/coil/pull/3137)，[#3139](https://github.com/coil-kt/coil/pull/3139))
- 修复消费 OkHttp 响应体时的潜在竞态条件。([#3186](https://github.com/coil-kt/coil/pull/3186))
- 修复 `maxBitmapSize` 边缘情况，以防止 Android 上因 Bitmap 过大而发生崩溃。([#3259](https://github.com/coil-kt/coil/pull/3259))
- 将 Kotlin 更新至 2.3.10。
- 将 Compose 更新至 1.9.3。
- 将 Okio 更新至 3.16.4。
- 将 Skiko 更新至 0.9.22.2。
- 将 `kotlinx-io-okio` 更新至 0.9.0。
- 将 `androidx.core` 更新至 1.16.0。
- 将 `androidx.lifecycle` 更新至 2.9.4。
- 将 `androidx.exifinterface` 更新至 1.4.2。

## [3.3.0] - 2025 年 7 月 22 日 {id="3-3-0-july-22-2025"}

- **新增**：引入新 API，用于在应用处于后台时限制 Android 上的 `MemoryCache.maxSize`。
    - 如果设置了 `ImageLoader.Builder.memoryCacheMaxSizePercentWhileInBackground`，当应用处于后台时，`ImageLoader` 的内存缓存将被限制为其最大尺寸的指定百分比。该设置目前默认禁用。
    - 当应用处于后台时，将从内存缓存中剪裁图像以达到受限的最大尺寸，但内存缓存对最近剪裁图像的弱引用不受影响。这意味着如果图像当前在其他位置被引用（例如 `AsyncImage`、`ImageView` 等），它仍将存在于内存缓存中。
    - 该 API 有助于减少后台内存使用量，防止应用过早被终止，并有助于减轻用户设备上的内存压力。
- **新增**：为 `SvgDecoder` 添加 `Svg.Parser` 实参。
    - 这使得在默认 SVG 解析器不满足需求时，可以使用自定义的 SVG 解析器。
- 为 `SvgDecoder` 添加 `density` 实参，以支持提供自定义密度倍数。
- 添加 `Uri.Builder` 以支持复制和修改 `Uri`。
- 添加 `ImageLoader.Builder.mainCoroutineContext`，以支持在测试中覆盖 Coil 对 `Dispatchers.main.immediate` 的使用。
- 修复在动画结束且取消对 `start` 图像的引用时，`CrossfadePainter.intrinsicSize` 发生变化的问题。这与 `CrossfadeDrawable` 的行为保持一致。
- 修复无法从 Java 访问 `ImageLoaders.executeBlocking` 的问题。
- 在 `coil-network-ktor3` 中使用 `kotlinx.io` 的 Okio 互操作模块。
- 将 `kotlinx-datetime` 更新至 `0.7.1`。
    - 此版本包含仅影响 `coil-network-cache-control` 模块的二进制不兼容变更。有关更多信息，请参见[此处](https://github.com/Kotlin/kotlinx-datetime?tab=readme-ov-file#deprecation-of-instant)。
- 将 Kotlin 更新至 2.2.0。
- 将 Compose 更新至 1.8.2。
- 将 Okio 更新至 3.15.0。
- 将 Skiko 更新至 0.9.4.2。

## [3.2.0] - 2025 年 5 月 13 日 {id="3-2-0-may-13-2025"}

自 `3.1.0` 以来的变更：

- **重要**：由于 Compose `1.8.0` 的要求，`coil-compose` 和 `coil-compose-core` 现在需要 Java 11 字节码。有关如何启用它，请参见[此处](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8-or-java-11)。
- 修改 `AsyncImagePreviewHandler` 的函数式构造函数，使其返回 `AsyncImagePainter.State.Success` 而非 `AsyncImagePainter.State.Loading`。
- 修复 `ConstraintsSizeResolver#size()` 中的取消操作。
- 修复使用 R8 构建时缺少 `PlatformContext` 的警告。
- 修复当返回默认 `FakeImageLoaderEngine` 响应时，`FakeImageLoaderEngine` 未设置 `Transition.Factory.NONE` 的问题。
- 移除 `ColorImage` 上的实验性注解。
- 在 `CacheControlCacheStrategy` 中延迟解析网络标头。
- 重构 `CircleCropTransformation` 和 `RoundedCornersTransformation` 以共享通用代码。
- 如果 `ExifOrientationStrategy` 不是 `RESPECT_PERFORMANCE`，则在内部回退到使用 `BitmapFactory`。
- 将 Kotlin 更新至 2.1.20。
- 将 Compose 更新至 1.8.0。
- 将 Okio 更新至 3.11.0。
- 将 Skiko 更新至 0.9.4。
- 将 Coroutines 更新至 1.10.2。
- 将 `accompanist-drawablepainter` 更新至 0.37.3。

自 `3.2.0-rc02` 以来的变更：

- 如果 `ExifOrientationStrategy` 不是 `RESPECT_PERFORMANCE`，则在内部回退到使用 `BitmapFactory`。
- 将 Compose 更新至 1.8.0。
- 将 `accompanist-drawablepainter` 更新至 0.37.3。

## [3.2.0-rc02] - 2025 年 4 月 26 日 {id="3-2-0-rc02-april-26-2025"}

- 修复在非 JVM 目标上使用 `KtorNetworkFetcherFactory` (Ktor 3) 加载图像时，图像请求因 `ClosedByteChannelException` 失败的问题。

## [3.2.0-rc01] - 2025 年 4 月 24 日 {id="3-2-0-rc01-april-24-2025"}

- **重要**：由于 Compose `1.8.0` 的要求，`coil-compose` 和 `coil-compose-core` 现在需要 Java 11 字节码。有关如何启用它，请参见[此处](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8-or-java-11)。
- 修改 `AsyncImagePreviewHandler` 的函数式构造函数，使其返回 `AsyncImagePainter.State.Success` 而非 `AsyncImagePainter.State.Loading`。
- 修复 `ConstraintsSizeResolver#size()` 中的取消操作。
- 修复使用 R8 构建时缺少 `PlatformContext` 的警告。
- 修复当返回默认 `FakeImageLoaderEngine` 响应时，`FakeImageLoaderEngine` 未设置 `Transition.Factory.NONE` 的问题。
- 移除 `ColorImage` 上的实验性注解。
- 在 `CacheControlCacheStrategy` 中延迟解析网络标头。
- 重构 `CircleCropTransformation` 和 `RoundedCornersTransformation` 以共享通用代码。
- 在 `coil-network-ktor2` 和 `coil-network-ktor3` 中使用 `kotlinx.io` 的 Okio 互操作模块。
- 将 Kotlin 更新至 2.1.20。
- 将 Compose 更新至 1.8.0-rc01。
- 将 Okio 更新至 3.11.0。
- 将 Skiko 更新至 0.9.4。
- 将 Coroutines 更新至 1.10.2。

## [3.1.0] - 2025 年 2 月 4 日 {id="3-1-0-february-4-2025"}

- 提升 `AsyncImage` 性能。
    - 根据可组合项是新实例化还是复用，运行时性能提升了 25% 至 40%。内存分配也减少了 35% 至 48%。更多信息请参见[此处](https://github.com/coil-kt/coil/pull/2795)。
- 添加 `ColorImage` 并弃用 `FakeImage`。
    - `ColorImage` 用于在测试和预览中返回模拟值。它解决了与 `FakeImage` 相同的用例，但位于 `coil-core` 而非 `coil-test` 中，更易于访问。
- 移除 `coil-compose-core` 对 `Dispatchers.Main.immedate` 的依赖。
    - 这同时也修复了在 Paparazzi 和 Roborazzi 屏幕截图测试中，`AsyncImagePainter` 无法同步执行 `ImageRequest` 的问题。
- 添加对格式为 `data:[<mediatype>][;base64],<data>` 的[数据 URI](https://www.ietf.org/rfc/rfc2397.txt) 的支持。
- 添加 `AnimatedImageDecoder.ENCODED_LOOP_COUNT`，以支持使用 GIF 元数据中编码的重复次数。
- 向 `NetworkRequest` 添加 `Extras` 以支持自定义扩展。
- 添加 `DiskCache.Builder.cleanupCoroutineContext` 并弃用 `DiskCache.Builder.cleanupDispatcher`。
- 添加 `ImageLoader.Builder.imageDecoderEnabled`，以支持在 API 29 及以上版本中选择性禁用 `android.graphics.ImageDecoder`。
- 如果没有为 `ImageRequest` 的数据类型注册 `Keyer`，则输出一条警告日志。
- 将 `CrossfadePainter` 公开。
- 在所有多平台目标上支持 `Transformation`。
- 在 `CacheControlCacheStrategy` 中支持将 0 作为 `Expires` 标头的值。
- 修复当 `ContentScale` 更改为/从 `None` 变更时，`AsyncImage`/`SubcomposeAsyncImage`/`rememberAsyncImage` 未启动新 `ImageRequest` 的问题。
- 将 Kotlin 更新至 2.1.10。
    - 注意：如果使用了 Kotlin Native，由于 [LLVM 更新](https://kotlinlang.org/docs/whatsnew21.html#llvm-update-from-11-1-0-to-16-0-0)，该版本需要使用 Kotlin 2.1.0 或更高版本进行编译。
- 将 Compose 更新至 1.7.3。
- 将 `androidx.core` 更新至 1.15.0。

## [3.0.4] - 2024 年 11 月 25 日 {id="3-0-4-november-25-2024"}

- 修复矢量 Drawable 无法在 Android Studio 预览中渲染的问题。
- 修复尺寸超过 `maxBitmapSize` 的请求可能会发生内存缓存未命中的问题。
- 修复 `FakeImage` 无法在 Android 上渲染的问题。
- 修复当与 `AsyncImage`/`rememberAsyncImagePainter`/`SubcomposeAsyncImage` 一起使用时，若请求的 `Transformation` 发生变化却未启动新图像请求的问题。
- 修复 `ScaleDrawable` 和 `CrossfadeDrawable` 不遵循着色（tint）状态的问题。
- 允许 `ImageDecoder` 解码部分图像源。这与 `BitmapFactory` 中的行为一致。
- 修复解码后未调用 `Bitmap.prepareToDraw()` 的问题。
- 对于非光栅化图像，`SvgDecoder` 不应返回 `isSampled = true`。
- 如果 immediate main 调度器不可用，在 Compose 中回退到 `Dispatchers.Unconfined`。此机制仅在预览/测试环境中使用。
- 将 Ktor 2 更新至 `2.3.13`。

## [3.0.3] - 2024 年 11 月 14 日 {id="3-0-3-november-14-2024"}

- 修复根据 `ImageView` 的 `ScaleType` 设置 `ImageRequest.scale` 的问题。
- 修复在删除其文件后，`DiskCache` 无法跟踪条目移除的边缘情况。
- 记录错误日志时将 throwable 传递给 `Logger`。
- 不再将 `kotlin-stdlib-jdk7` 和 `kotlin-stdlib-jdk8` 替换为 `kotlin-stdlib`。

## [3.0.2] - 2024 年 11 月 9 日 {id="3-0-2-november-9-2024"}

- 修复在 Android 上使用自定义 `CacheStrategy` 调用 `OkHttpNetworkFetcherFactory` 时崩溃的问题。
- 修复 `CacheControlCacheStrategy` 计算缓存条目寿命不正确的问题。
- 修复在 API >= 28 上，仅当 `ImageRequest.bitmapConfig` 为 `ARGB_8888` 或 `HARDWARE` 时才会生效的问题。

## [3.0.1] - 2024 年 11 月 7 日 {id="3-0-1-november-7-2024"}

- 修复在由硬件 Bitmap 支持的 `BitmapImage` 上调用 `Image.toBitmap` 时崩溃的问题。
- 修复 `AsyncImageModelEqualityDelegate.Default` 对非 `ImageRequest` 模型进行错误相等性比较的问题。

## [3.0.0] - 2024 年 11 月 4 日 {id="3-0-0-november-4-2024"}

Coil 3.0.0 是 Coil 的下一个主要版本，全面支持 [Compose Multiplatform](https://www.jetbrains.com/compose-multiplatform/)。

[要查看 3.0.0 中的完整改进和重要变更列表，请查阅升级指南](https://coil-kt.github.io/coil/upgrading_to_coil3/)。

自 `3.0.0-rc02` 以来的变更：

- 移除其余已弃用的方法。

## [3.0.0-rc02] - 2024 年 10 月 28 日 {id="3-0-0-rc02-october-28-2024"}

[要查看 3.x 中的完整改进和重要变更列表，请查阅升级指南](https://coil-kt.github.io/coil/upgrading_to_coil3/)。自 `3.0.0-rc01` 以来的变更：

- 添加 `BlackholeDecoder`。这简化了[仅磁盘缓存的预加载](https://coil-kt.github.io/coil/faq/#how-do-i-preload-an-image)。
- 为 `ConstraintsSizeResolver` 和 `DrawScopeSizeResolver` 添加 `remember` 函数。
- 移除作为 `AsyncImage` 形参的 `EqualityDelegate`。现在应通过 `LocalAsyncImageModelEqualityDelegate` 进行设置。
- 修复当父级可组合项使用 `IntrinsicSize` 时 `AsyncImage` 无法渲染的问题。
- 修复当 `AsyncImagePainter` 没有子绘制器时 `AsyncImage` 填满可用约束的问题。
- 修复由于忽略 `EqualityDelegate`，观察 `rememberAsyncImagePainter` 的状态会导致无限重组的问题。
- 修复解析包含特殊字符的 `File`/`Path` 路径时的问题。
- 修复在 `VideoFrameDecoder` 中使用自定义 `FileSystem` 实现时的问题。
- 将 Ktor 更新至 `3.0.0`。
- 将 `androidx.annotation` 更新至 `1.9.0`。

## [3.0.0-rc01] - 2024 年 10 月 8 日 {id="3-0-0-rc01-october-8-2024"}

[要查看 3.x 中的完整改进和重要变更列表，请查阅升级指南](https://coil-kt.github.io/coil/upgrading_to_coil3/)。自 `3.0.0-alpha10` 以来的变更：

- **破坏性变更**：默认禁用 `addLastModifiedToFileCacheKey`，并允许针对每个请求进行设置。可以使用相同的标志重新启用该行为。
- **新增**：引入新的 `coil-network-cache-control` 构件，实现了对 [`Cache-Control` 标头](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)的支持。
- **新增**：为 `SvgDecoder.Factory` 添加 `scaleToDensity` 属性。该属性确保具有固有尺寸的 SVG 会乘上设备密度（仅在 Android 上受支持）。
- 将 `ExifOrientationPolicy` 重命名为 `ExifOrientationStrategy`。
- 在获取时从 `MemoryCache` 中移除不可共享的图像。
- 将 `ConstraintsSizeResolver` 公开。
- 稳定 `setSingletonImageLoaderFactory`。
- 在 `coil-network-ktor3` 中恢复优化的 JVM I/O 函数。
- 将 `pdf` 添加到 MIME 类型列表中。
- 将编译 SDK 更新至 35。
- 将 Kotlin 更新至 2.0.20。
- 将 Okio 更新至 3.9.1。

## [3.0.0-alpha10] - 2024 年 8 月 7 日 {id="3-0-0-alpha10-august-7-2024"}

- **破坏性变更**：将 `ImageLoader.Builder.networkObserverEnabled` 替换为用于 `NetworkFetcher` 的 `ConnectivityChecker` 接口。
    - 要禁用网络观察程序，请将 `ConnectivityChecker.ONLINE` 传递给 `KtorNetworkFetcherFactory`/`OkHttpNetworkFetcherFactory` 的构造函数。
- **新增**：支持在所有平台上加载 [Compose Multiplatform 资源](https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-images-resources.html)。要加载资源，请使用 `Res.getUri`：

```kotlin
AsyncImage(
    model = Res.getUri("drawable/image.jpg"),
    contentDescription = null,
)
```

- 为 `ImageLoader` 和 `ImageRequest` 添加 `maxBitmapSize` 属性。
    - 该属性默认为 4096x4096，为已分配 Bitmap 的尺寸提供了安全上限。这有助于避免因意外使用 `Size.ORIGINAL` 加载超大图像而导致内存不足异常。
- 将 `ExifOrientationPolicy` 转换为接口以支持自定义策略。
- 修复 `Uri` 对 Windows 文件路径的处理。
- 从 `Image` API 中移除 `@ExperimentalCoilApi`。
- 将 Kotlin 更新至 2.0.10。

## [3.0.0-alpha09] - 2024 年 7 月 23 日 {id="3-0-0-alpha09-july-23-2024"}

- **破坏性变更**：将 `io.coil-kt.coil3:coil-network-ktor` 构件重命名为 `io.coil-kt.coil3:coil-network-ktor2`，后者依赖于 Ktor 2.x。此外，引入了依赖于 Ktor 3.x 的 `io.coil-kt.coil3:coil-network-ktor3`。`wasmJs` 支持仅在 Ktor 3.x 中可用。
- **新增**：添加 `AsyncImagePainter.restart()` 以手动重启图像请求。
- 从 `NetworkClient` 及相关类中移除 `@ExperimentalCoilApi`。
- 优化 `ImageRequest` 以避免不必要的 `Extras` 和 `Map` 分配。

## [2.7.0] - 2024 年 7 月 17 日 {id="2-7-0-july-17-2024"}

- 微调内部协程的使用，以提高 `ImageLoader.execute`、`AsyncImage`、`SubcomposeAsyncImage` 和 `rememberAsyncImagePainter` 的性能。([#2205](https://github.com/coil-kt/coil/pull/2205))
- 修复分块响应的重复网络调用问题。([#2363](https://github.com/coil-kt/coil/pull/2363))
- 将 Kotlin 更新至 2.0.0。
- 将 Compose UI 更新至 1.6.8。
- 将 Okio 更新至 3.9.0。

## [3.0.0-alpha08] - 2024 年 7 月 8 日 {id="3-0-0-alpha08-july-8-2024"}

- **破坏性变更**：将 `ImageRequest` 和 `ImageLoader` 的 `dispatcher` 方法重命名为 `coroutineContext`。例如，`ImageRequest.Builder.dispatcher` 现已变更为 `ImageRequest.Builder.coroutineContext`。重命名的原因是该方法现在接受任意 `CoroutineContext`，不再仅限于 `Dispatcher`。
- 修复：修复因竞态条件可能导致的 `IllegalStateException: Reading a state that was created after the snapshot was taken or in a snapshot that has not yet been applied`。
    - 注意：此修改重新引入了对 `Dispatchers.Main.immediate` 的软依赖。因此，在 JVM 上应重新添加对 [`kotlinx-coroutines-swing`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-swing/) 的依赖项。若未导入，`ImageRequest` 将无法立即调度，并在设置 `ImageRequest.placeholder` 或从内存缓存解析之前产生一帧延迟。

## [3.0.0-alpha07] - 2024 年 6 月 26 日 {id="3-0-0-alpha07-june-26-2024"}

- **破坏性变更**：`AsyncImagePainter` 默认不再等待 `onDraw`，而是直接使用 `Size.ORIGINAL`。
    - 这修复了[与 Roborazzi/Paparazzi 的兼容性问题](https://github.com/coil-kt/coil/issues/1910)，并整体提升了测试可靠性。
    - 若要恢复为等待 `onDraw` 的行为，请将 `DrawScopeSizeResolver` 设置为你的 `ImageRequest.sizeResolver`。
- **破坏性变更**：重构多平台 `Image` API。值得注意的是，`asCoilImage` 已重命名为 `asImage`。
- **破坏性变更**：`AsyncImagePainter.state` 已更改为 `StateFlow<AsyncImagePainter.State>`。使用 `collectAsState` 观察其值。这提升了性能。
- **破坏性变更**：`AsyncImagePainter.imageLoader` 和 `AsyncImagePainter.request` 已合并为 `StateFlow<AsyncImagePainter.Inputs>`。使用 `collectAsState` 观察其值。这提升了性能。
- **破坏性变更**：移除对 `android.resource://example.package.name/drawable/image` URI 的支持，因为它会阻碍资源缩减优化。
    - 如果仍需要该功能，可以[在组件注册表中手动包含 `ResourceUriMapper`](https://github.com/coil-kt/coil/blob/main/coil-core/src/androidInstrumentedTest/kotlin/coil3/map/ResourceUriMapper.kt)。
- **新增**：引入 `AsyncImagePreviewHandler`，以支持控制 `AsyncImagePainter` 的预览渲染行为。
    - 使用 `LocalAsyncImagePreviewHandler` 覆盖预览行为。
    - 作为此更改和其他 `coil-compose` 改进的一部分，`AsyncImagePainter` 现在默认尝试执行 `ImageRequest`，而不是默认显示 `ImageRequest.placeholder`。在预览环境中，[使用网络或文件的请求预计会失败](https://developer.android.com/develop/ui/compose/tooling/previews#preview-limitations)，但 Android 资源应该可以正常工作。
- **新增**：支持按帧索引提取视频图像。([#2183](https://github.com/coil-kt/coil/pull/2183))
- **新增**：支持向任何 `CoroutineDispatcher` 方法传递 `CoroutineContext`。([#2241](https://github.com/coil-kt/coil/pull/2241))。
- **新增**：在 JS 和 WASM JS 上支持弱引用内存缓存。
- 在 Compose 中不调度到 `Dispatchers.Main.immediate`。附带影响是在 JVM 上不再需要导入 [`kotlinx-coroutines-swing`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-swing/)。
- 在 Compose 中不调用 `async` 也不创建 disposable 以提高性能（感谢 @mlykotom！）。([#2205](https://github.com/coil-kt/coil/pull/2205))
- 修复向 `Options` 传递全局 `ImageLoader` extras 的问题。([#2223](https://github.com/coil-kt/coil/pull/2223))
- 修复 `crossfade(false)` 在非 Android 目标上不起作用的问题。
- 修复 VP8X 功能标志字节偏移量。([#2199](https://github.com/coil-kt/coil/pull/2199))
- 将非 Android 目标上的 `SvgDecoder` 改为渲染至 Bitmap，而不是在绘制时渲染图像。这提升了性能。
    - 可以使用 `SvgDecoder(renderToBitmap)` 控制此行为。
- 将 `ScaleDrawable` 从 `coil-gif` 移至 `coil-core`。
- 将 Kotlin 更新至 2.0.0。
- 将 Compose 更新至 1.6.11。
- 将 Okio 更新至 3.9.0。
- 将 Skiko 更新至 0.8.4。
- [要查看 3.x 中的完整重要变更列表，请查阅升级指南。](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [3.0.0-alpha06] - 2024 年 2 月 29 日 {id="3-0-0-alpha06-february-29-2024"}

- 将 Skiko 降级至 0.7.93。
- [要查看 3.x 中的完整重要变更列表，请查阅升级指南。](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [3.0.0-alpha05] - 2024 年 2 月 28 日 {id="3-0-0-alpha05-february-28-2024"}

- **新增**：支持 `wasmJs` 目标。
- 创建 `DrawablePainter` 和 `DrawableImage`，以支持在非 Android 平台上绘制非 `Bitmap` 支持的 `Image`。
    - `Image` API 属于实验性质，在 Alpha 各版本之间可能会发生变动。
- 更新 `ContentPainterModifier` 以实现 `Modifier.Node`。
- 修复：在后台线程上延迟注册组件回调和网络观察程序。这修复了通常在主线程上发生的初始化缓慢问题。
- 修复：修复 `ImageRequest` 未使用 `ImageLoader.Builder.placeholder/error/fallback` 的问题。
- 将 Compose 更新至 1.6.0。
- 将 Coroutines 更新至 1.8.0。
- 将 Okio 更新至 3.8.0。
- 将 Skiko 更新至 0.7.94。
- [要查看 3.x 中的完整重要变更列表，请查阅升级指南。](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [2.6.0] - 2024 年 2 月 23 日 {id="2-6-0-february-23-2024"}

- 使 `rememberAsyncImagePainter`、`AsyncImage` 和 `SubcomposeAsyncImage` 成为[可重启和可跳过的](https://developer.android.com/jetpack/compose/performance/stability#functions)。通过避免在可组合项的实参未发生更改时进行重组，提升了性能。
    - 为 `rememberAsyncImagePainter`、`AsyncImage` 和 `SubcomposeAsyncImage` 添加可选的 `modelEqualityDelegate` 实参，用于控制 `model` 是否会触发重组。
- 更新 `ContentPainterModifier` 以实现 `Modifier.Node`。
- 修复：在后台线程上延迟注册组件回调和网络观察程序。这修复了通常在主线程上发生的初始化缓慢问题。
- 修复：在 `rememberAsyncImagePainter`、`AsyncImage` 和 `SubcomposeAsyncImage` 中，若 `ImageRequest.listener` 或 `ImageRequest.target` 发生更改，避免重新发起新的图像请求。
- 修复：避免在 `AsyncImagePainter` 中对图像请求进行重复观察。
- 将 Kotlin 更新至 1.9.22。
- 将 Compose 更新至 1.6.1。
- 将 Okio 更新至 3.8.0。
- 将 `androidx.collection` 更新至 1.4.0。
- 将 `androidx.lifecycle` 更新至 2.7.0。

## [3.0.0-alpha04] - 2024 年 2 月 1 日 {id="3-0-0-alpha04-february-1-2024"}

- **破坏性变更**：从 `OkHttpNetworkFetcherFactory` 和 `KtorNetworkFetcherFactory` 的公共 API 中移除 `Lazy`。
- 在 `OkHttpNetworkFetcherFactory` 中公开 `Call.Factory` 而不是 `OkHttpClient`。
- 将 `NetworkResponseBody` 转换为包装 `ByteString`。
- 将 Compose 降级至 1.5.12。
- [要查看完整的重要变更列表，请查阅升级指南。](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [3.0.0-alpha03] - 2024 年 1 月 20 日 {id="3-0-0-alpha03-january-20-2024"}

- **破坏性变更**：`coil-network` 已重命名为 `coil-network-ktor`。此外，新增了依赖 OkHttp 且不需要指定 Ktor 引擎的 `coil-network-okhttp` 构件。
    - 取决于导入的构件，你可以使用 `KtorNetworkFetcherFactory` 或 `OkHttpNetworkFetcherFactory` 手动引用 `Fetcher.Factory`。
- 支持在 Apple 平台上加载 `NSUrl`。
- 为 `AsyncImage` 添加 `clipToBounds` 形参。
- [要查看完整的重要变更列表，请查阅升级指南。](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [3.0.0-alpha02] - 2024 年 1 月 10 日 {id="3-0-0-alpha02-january-10-2024"}

- **破坏性变更**：`coil-gif`、`coil-network`、`coil-svg` 和 `coil-video` 的包已更新，使其所有类分别归属于 `coil.gif`、`coil.network`、`coil.svg` 和 `coil.video`。这有助于避免与其他构件的类名冲突。
- **破坏性变更**：`ImageDecoderDecoder` 已重命名为 `AnimatedImageDecoder`。
- **新增**：`coil-gif`、`coil-network`、`coil-svg` 和 `coil-video` 的组件现在会自动添加到每个 `ImageLoader` 的 `ComponentRegistry` 中。
    - 明确地说，与 `3.0.0-alpha01` 不同，**你无需手动将 `NetworkFetcher.Factory()` 添加到你的 `ComponentRegistry` 中**。只需导入 `io.coil-kt.coil3:coil-network:[version]` 和[一个 Ktor 引擎](https://ktor.io/docs/http-client-engines.html#dependencies)即可加载网络图像。
    - 手动将这些组件添加到 `ComponentRegistry` 也是安全的。任何手动添加的组件都优先于自动添加的组件。
    - 如有需要，可以使用 `ImageLoader.Builder.serviceLoaderEnabled(false)` 禁用此行为。
- **新增**：在所有平台上支持 `coil-svg`。它在 Android 上由 [AndroidSVG](https://bigbadaboom.github.io/androidsvg/) 支持，在非 Android 平台上由 [SVGDOM](https://api.skia.org/classSkSVGDOM.html) 支持。
- Coil 现在内部使用 Android 的 [`ImageDecoder`](https://developer.android.com/reference/android/graphics/ImageDecoder) API，这在直接从文件、资源或 content URI 解码时具有性能优势。
- 修复：多处 `coil3.Uri` 解析修复。
- [要查看完整的重要变更列表，请查阅升级指南。](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [3.0.0-alpha01] - 2023 年 12 月 30 日 {id="3-0-0-alpha01-december-30-2023"}

- **新增**：[Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) 支持。Coil 现已成为一个 Kotlin Multiplatform 库，支持 Android、JVM、iOS、macOS 和 JavaScript。
- Coil 的 Maven 坐标已更新为 `io.coil-kt.coil3`，其导入语句已更新为 `coil3`。这使得 Coil 3 可以与 Coil 2 并存运行而不会产生二进制兼容性问题。例如，`io.coil-kt:coil:[version]` 现在是 `io.coil-kt.coil3:coil:[version]`。
- `coil-base` 和 `coil-compose-base` 构件分别重命名为 `coil-core` 和 `coil-compose-core`，以符合 Coroutines、Ktor 和 AndroidX 所使用的命名规范。
- [要查看完整的重要变更列表，请查阅升级指南。](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [2.5.0] - 2023 年 10 月 30 日 {id="2-5-0-october-30-2023"}

- **新增**：添加 `MediaDataSourceFetcher.Factory` 以支持在 `coil-video` 中解码 `MediaDataSource` 实现。([#1795](https://github.com/coil-kt/coil/pull/1795))
- 将 `SHIFT6m` 设备添加到硬件 Bitmap 黑名单中。([#1812](https://github.com/coil-kt/coil/pull/1812))
- 修复：防范返回单边无界尺寸的绘制器。([#1826](https://github.com/coil-kt/coil/pull/1826))
- 修复：当缓存的标头包含非 ASCII 字符时，在 `304 Not Modified` 后磁盘缓存加载失败的问题。([#1839](https://github.com/coil-kt/coil/pull/1839))
- 修复：`FakeImageEngine` 未更新拦截器链的请求的问题。([#1905](https://github.com/coil-kt/coil/pull/1905))
- 将编译 SDK 更新至 34。
- 将 Kotlin 更新至 1.9.10。
- 将 Coroutines 更新至 1.7.3。
- 将 `accompanist-drawablepainter` 更新至 0.32.0。
- 将 `androidx.annotation` 更新至 1.7.0。
- 将 `androidx.compose.foundation` 更新至 1.5.4。
- 将 `androidx.core` 更新至 1.12.0。
- 将 `androidx.exifinterface:exifinterface` 更新至 1.3.6。
- 将 `androidx.lifecycle` 更新至 2.6.2。
- 将 `com.squareup.okhttp3` 更新至 4.12.0。
- 将 `com.squareup.okio` 更新至 3.6.0。

## [2.4.0] - 2023 年 5 月 21 日 {id="2-4-0-may-21-2023"}

- 将 `DiskCache` 的 `get`/`edit` 重命名为 `openSnapshot`/`openEditor`。
- 在 `AsyncImagePainter` 中不再自动将 `ColorDrawable` 转换为 `ColorPainter`。
- 使用 `@NonRestartableComposable` 注解简单的 `AsyncImage` 重载。
- 修复：在 `ImageSource` 中延迟调用 `Context.cacheDir`。
- 修复：修复发布 `coil-bom` 的问题。
- 修复：修复在禁用硬件 Bitmap 时始终将 Bitmap 配置设置为 `ARGB_8888` 的问题。
- 将 Kotlin 更新至 1.8.21。
- 将 Coroutines 更新至 1.7.1。
- 将 `accompanist-drawablepainter` 更新至 0.30.1。
- 将 `androidx.compose.foundation` 更新至 1.4.3。
- 将 `androidx.profileinstaller:profileinstaller` 更新至 1.3.1。
- 将 `com.squareup.okhttp3` 更新至 4.11.0。

## [2.3.0] - 2023 年 3 月 25 日 {id="2-3-0-march-25-2023"}

- **新增**：引入新的 `coil-test` 构件，其中包含 `FakeImageLoaderEngine`。该类可用于硬编码图像加载器响应，以确保在测试中获得一致且同步（来自主线程）的响应。更多信息请参见[此处](https://coil-kt.github.io/coil/testing)。
- **新增**：向 `coil-base`（`coil` 的子模块）和 `coil-compose-base`（`coil-compose` 的子模块）添加[基准配置文件](https://developer.android.com/topic/performance/baselineprofiles/overview)。
    - 这提升了 Coil 的运行时性能，并根据 Coil 在应用中的使用方式提供[更好的帧时间](https://github.com/coil-kt/coil/tree/main/coil-benchmark/benchmark_output.md)。
- 修复：修复解析包含编码数据的 `file://` URI 的问题。[#1601](https://github.com/coil-kt/coil/pull/1601)
- 修复：如果传递了不存在的目录，`DiskCache` 现在可以正确计算其最大大小。[#1620](https://github.com/coil-kt/coil/pull/1620)
- 将 `Coil.reset` 作为公共 API。[#1506](https://github.com/coil-kt/coil/pull/1506)
- 启用 Java 默认方法生成。[#1491](https://github.com/coil-kt/coil/pull/1491)
- 将 Kotlin 更新至 1.8.10。
- 将 `accompanist-drawablepainter` 更新至 0.30.0。
- 将 `androidx.annotation` 更新至 1.6.0。
- 将 `androidx.appcompat:appcompat-resources` 更新至 1.6.1。
- 将 `androidx.compose.foundation` 更新至 1.4.0。
- 将 `androidx.core` 更新至 1.9.0。
- 将 `androidx.exifinterface:exifinterface` 更新至 1.3.6。
- 将 `androidx.lifecycle` 更新至 2.6.1。
- 将 `okio` 更新至 3.3.0。

## [2.2.2] - 2022 年 10 月 1 日 {id="2-2-2-october-1-2022"}

- 确保图像加载器在注册其系统回调之前已完全初始化。[#1465](https://github.com/coil-kt/coil/pull/1465)
- 在 API 30+ 上的 `VideoFrameDecoder` 中设置首选 Bitmap 配置以避免色带问题。[#1487](https://github.com/coil-kt/coil/pull/1487)
- 修复 `FileUriMapper` 中解析包含 `#` 的路径的问题。[#1466](https://github.com/coil-kt/coil/pull/1466)
- 修复从磁盘缓存读取包含非 ASCII 标头的响应的问题。[#1468](https://github.com/coil-kt/coil/pull/1468)
- 修复解码 asset 子文件夹中的视频的问题。[#1489](https://github.com/coil-kt/coil/pull/1489)
- 将 `androidx.annotation` 更新至 1.5.0。

## [2.2.1] - 2022 年 9 月 8 日 {id="2-2-1-september-8-2022"}

- 修复：`RoundedCornersTransformation` 现在能正确缩放 `input` Bitmap。
- 移除对 `kotlin-parcelize` 插件的依赖。
- 将编译 SDK 更新至 33。
- 将 `androidx.appcompat:appcompat-resources` 降级至 1.4.2 以解决 [#1423](https://github.com/coil-kt/coil/issues/1423)。

## [2.2.0] - 2022 年 8 月 16 日 {id="2-2-0-august-16-2022"}

- **新增**：向 `coil-video` 添加 `ImageRequest.videoFramePercent`，以支持将视频帧指定为视频时长的百分比。
- **新增**：添加 `ExifOrientationPolicy` 以配置 `BitmapFactoryDecoder` 如何处理 EXIF 方向数据。
- 修复：若传递了未定义维度的尺寸，`RoundedCornersTransformation` 不再抛出异常。
- 修复：将 GIF 的帧延迟读取为两个无符号字节，而不是一个有符号字节。
- 将 Kotlin 更新至 1.7.10。
- 将 Coroutines 更新至 1.6.4。
- 将 Compose 更新至 1.2.1。
- 将 OkHttp 更新至 4.10.0。
- 将 Okio 更新至 3.2.0。
- 将 `accompanist-drawablepainter` 更新至 0.25.1。
- 将 `androidx.annotation` 更新至 1.4.0。
- 将 `androidx.appcompat:appcompat-resources` 更新至 1.5.0。
- 将 `androidx.core` 更新至 1.8.0。

## [2.1.0] - 2022 年 5 月 17 日 {id="2-1-0-may-17-2022"}

- **新增**：支持加载 `ByteArray`。([#1202](https://github.com/coil-kt/coil/pull/1202))
- **新增**：支持使用 `ImageRequest.Builder.css` 为 SVG 设置自定义 CSS 规则。([#1210](https://github.com/coil-kt/coil/pull/1210))
- 修复：将 `GenericViewTarget` 的私有方法转换为 protected。([#1273](https://github.com/coil-kt/coil/pull/1273))
- 将编译 SDK 更新至 32。([#1268](https://github.com/coil-kt/coil/pull/1268))

## [2.0.0] - 2022 年 5 月 10 日 {id="2-0-0-may-10-2022"}

Coil 2.0.0 是该库的一次重大迭代，包含破坏性变更。有关如何升级，请查阅[升级指南](https://coil-kt.github.io/coil/upgrading/)。

- **新增**：在 `coil-compose` 中引入 `AsyncImage`。更多信息请查看[文档](https://coil-kt.github.io/coil/compose/)。

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

- **新增**：引入公共 `DiskCache` API。
    - 使用 `ImageLoader.Builder.diskCache` 和 `DiskCache.Builder` 配置磁盘缓存。
    - 在 Coil 2.0 中不应使用 OkHttp 的 `Cache`。更多信息请参见[此处](https://coil-kt.github.io/coil/upgrading_to_coil2/#disk-cache)。
    - 仍然支持 `Cache-Control` 和其他缓存标头——但不支持 `Vary` 标头，因为缓存仅检查 URL 是否匹配。此外，仅缓存响应代码在 [200..300) 范围内的响应。
    - 升级到 2.0 时，现有的磁盘缓存将被清除。
- 最低支持的 API 现为 21。
- `ImageRequest` 的默认 `Scale` 现在为 `Scale.FIT`。
    - 进行此更改是为了让 `ImageRequest.scale` 与其他具有默认 `Scale` 的类保持一致。
    - 具有 `ImageViewTarget` 的请求仍会自动检测其 `Scale`。
- 重构图像流水线（pipeline）类：
    - `Mapper`、`Fetcher` 和 `Decoder` 经过重构，更加灵活。
    - `Fetcher.key` 已替换为新的 `Keyer` 接口。`Keyer` 根据输入数据创建缓存键。
    - 添加 `ImageSource`，允许 `Decoder` 直接使用 Okio 的文件系统 API 读取 `File`。
- 重构 Jetpack Compose 集成：
    - `rememberImagePainter` 和 `ImagePainter` 分别重命名为 `rememberAsyncImagePainter` 和 `AsyncImagePainter`。
    - 弃用 `LocalImageLoader`。有关更多信息，请查阅弃用信息。
- 禁用生成运行时非空断言。
    - 如果使用 Java，向函数传递带有非空注解的 null 实参将不再立即抛出 `NullPointerException`。Kotlin 的编译时空安全可防止这种情况发生。
    - 此更改有助于减小库的大小。
- `Size` 现在由表示其宽度和高度的两个 `Dimension` 值组成。`Dimension` 可以是正像素值或 `Dimension.Undefined`。更多信息请参见[此处](https://coil-kt.github.io/coil/upgrading/#size-refactor)。
- 从库中移除了 `BitmapPool` 和 `PoolableViewTarget`。
- 从库中移除了 `VideoFrameFileFetcher` 和 `VideoFrameUriFetcher`。改用支持所有数据源的 `VideoFrameDecoder`。
- 从库中移除了 [`BlurTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/BlurTransformation.kt) 和 [`GrayscaleTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/GrayscaleTransformation.kt)。如果仍在使用它们，可以将它们的代码复制到项目中。
- 将 `Transition.transition` 修改为非挂起函数，因为不再需要挂起过渡直到其完成。
- 添加对 `bitmapFactoryMaxParallelism` 的支持，用于限制正在进行的 `BitmapFactory` 操作的最大数量。该值默认为 4，有助于提高 UI 性能。
- 添加对 `interceptorDispatcher`、`fetcherDispatcher`、`decoderDispatcher` 和 `transformationDispatcher` 的支持。
- 添加用于处理通用 `ViewTarget` 逻辑的 `GenericViewTarget`。
- 将 `ByteBuffer` 添加到默认支持的数据类型中。
- `Disposable` 经过重构，公开底层 `ImageRequest` 的作业（job）。
- 重构 `MemoryCache` API。
- 若 `ImageRequest.fallback` 为 null，现在会在 `Target` 上设置 `ImageRequest.error`。
- `Transformation.key` 替换为 `Transformation.cacheKey`。
- 将 Kotlin 更新至 1.6.10。
- 将 Compose 更新至 1.1.1。
- 将 OkHttp 更新至 4.9.3。
- 将 Okio 更新至 3.0.0。

自 `2.0.0-rc03` 以来的变更：
- 将 `Dimension.Original` 转换为 `Dimension.Undefined`。
    - 这稍微改变了非像素维度的语义，以修复尺寸系统中的某些边缘情况（[示例](https://github.com/coil-kt/coil/issues/1246)）。
- 如果 ContentScale 为 None，则使用 `Size.ORIGINAL` 加载图像。
- 修复先应用 `ImageView.load` 构建器实参而非最后应用的问题。
- 修复如果响应未修改则不合并 HTTP 标头的问题。

## [2.0.0-rc03] - 2022 年 4 月 11 日 {id="2-0-0-rc03-april-11-2022"}

- 移除 `ScaleResolver` 接口。
- 将 `Size` 构造函数转换为函数。
- 将 `Dimension.Pixels` 的 `toString` 修改为仅输出其像素值。
- 防范 `SystemCallbacks.onTrimMemory` 中罕见的崩溃。
- 将 Coroutines 更新至 1.6.1。

## [2.0.0-rc02] - 2022 年 3 月 20 日 {id="2-0-0-rc02-march-20-2022"}

- 将 `ImageRequest` 的默认尺寸恢复为当前屏幕的尺寸，而不是 `Size.ORIGINAL`。
- 修复 `DiskCache.Builder` 被标记为实验性的问题。只有 `DiskCache` 的方法属于实验性质。
- 修复将图像加载到具有 `WRAP_CONTENT` 单边维度的 `ImageView` 时，会以原始尺寸加载图像而不是适配有界维度的问题。
- 移除 `MemoryCache.Key`、`MemoryCache.Value` 和 `Parameters.Entry` 中的解构组件函数（component functions）。

## [2.0.0-rc01] - 2022 年 3 月 2 日 {id="2-0-0-rc01-march-2-2022"}

自 `1.4.0` 以来的重大变更：

- 最低支持的 API 现为 21。
- 重构 Jetpack Compose 集成。
    - `rememberImagePainter` 已重命名为 `rememberAsyncImagePainter`。
    - 添加对 `AsyncImage` 和 `SubcomposeAsyncImage` 的支持。更多信息请查看[文档](https://coil-kt.github.io/coil/compose/)。
    - 弃用 `LocalImageLoader`。有关更多信息，请查阅弃用信息。
- Coil 2.0 拥有自己的磁盘缓存实现，不再依赖 OkHttp 进行磁盘缓存。
    - 使用 `ImageLoader.Builder.diskCache` 和 `DiskCache.Builder` 配置磁盘缓存。
    - **不应**在 Coil 2.0 中使用 OkHttp 的 `Cache`，因为如果在写入时线程被中断，缓存可能会损坏。
    - 仍然支持 `Cache-Control` 和其他缓存标头——但不支持 `Vary` 标头，因为缓存仅检查 URL 是否匹配。此外，仅缓存响应代码在 [200..300) 范围内的响应。
    - 升级到 2.0 时，现有的磁盘缓存将被清除。
- `ImageRequest` 的默认 `Scale` 现在为 `Scale.FIT`。
    - 进行此更改是为了让 `ImageRequest.scale` 与其他具有默认 `Scale` 的类保持一致。
    - 具有 `ImageViewTarget` 的请求仍会自动检测其缩放比例。
- `ImageRequest` 的默认尺寸现在为 `Size.ORIGINAL`。
- 重构图像流水线类：
    - `Mapper`、`Fetcher` 和 `Decoder` 经过重构，更加灵活。
    - `Fetcher.key` 已替换为新的 `Keyer` 接口。`Keyer` 根据输入数据创建缓存键。
    - 添加 `ImageSource`，允许 `Decoder` 直接使用 Okio 的文件系统 API 读取 `File`。
- 禁用生成运行时非空断言。
    - 如果使用 Java，向函数传递带有非空注解的形参作为 null 将不再立即抛出 `NullPointerException`。Kotlin 的编译时空安全可防止这种情况发生。
    - 此更改有助于减小库的大小。
- `Size` 现在由表示其宽度和高度的两个 `Dimension` 值组成。`Dimension` 可以是正像素值或 `Dimension.Original`。
- 从库中移除了 `BitmapPool` 和 `PoolableViewTarget`。
- 从库中移除了 `VideoFrameFileFetcher` 和 `VideoFrameUriFetcher`。改用支持所有数据源的 `VideoFrameDecoder`。
- 从库中移除了 [`BlurTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/BlurTransformation.kt) 和 [`GrayscaleTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/GrayscaleTransformation.kt)。如果仍在使用它们，可以将它们的代码复制到项目中。
- 将 `Transition.transition` 修改为非挂起函数，因为不再需要挂起过渡直到其完成。
- 添加对 `bitmapFactoryMaxParallelism` 的支持，用于限制正在进行的 `BitmapFactory` 操作的最大数量。该值默认为 4，有助于提高 UI 性能。
- 添加对 `interceptorDispatcher`、`fetcherDispatcher`、`decoderDispatcher` 和 `transformationDispatcher` 的支持。
- 添加用于处理通用 `ViewTarget` 逻辑的 `GenericViewTarget`。
- 将 `ByteBuffer` 添加到默认支持的数据类型中。
- `Disposable` 经过重构，公开底层 `ImageRequest` 的作业。
- 重构 `MemoryCache` API。
- 若 `ImageRequest.fallback` 为 null，现在会在 `Target` 上设置 `ImageRequest.error`。
- `Transformation.key` 替换为 `Transformation.cacheKey`。
- 将 Kotlin 更新至 1.6.10。
- 将 Compose 更新至 1.1.1。
- 将 OkHttp 更新至 4.9.3。
- 将 Okio 更新至 3.0.0。

自 `2.0.0-alpha09` 以来的变更：

- 移除 `-Xjvm-default=all` 编译器标志。
- 修复并发执行多个带有 must-revalidate/e-tag 的请求时导致图像加载失败的问题。
- 修复 `<svg` 标签后若有换行符则 `DecodeUtils.isSvg` 返回 false 的问题。
- 使 `LocalImageLoader.provides` 弃用信息更加清晰。
- 将 Compose 更新至 1.1.1。
- 将 `accompanist-drawablepainter` 更新至 0.23.1。

## [2.0.0-alpha09] - 2022 年 2 月 16 日 {id="2-0-0-alpha09-february-16-2022"}

- 修复 `AsyncImage` 创建无效约束的问题。([#1134](https://github.com/coil-kt/coil/pull/1134))
- 为 `AsyncImagePainter` 添加 `ContentScale` 实参。([#1144](https://github.com/coil-kt/coil/pull/1144))
    - 应将其设置为与 `Image` 上设置的相同值，以确保图像以正确的尺寸加载。
- 添加 `ScaleResolver` 以支持为 `ImageRequest` 延迟解析 `Scale`。([#1134](https://github.com/coil-kt/coil/pull/1134))
    - `ImageRequest.scale` 应替换为 `ImageRequest.scaleResolver.scale()`。
- 将 Compose 更新至 1.1.0。
- 将 `accompanist-drawablepainter` 更新至 0.23.0。
- 将 `androidx.lifecycle` 更新至 2.4.1。

## [2.0.0-alpha08] - 2022 年 2 月 7 日 {id="2-0-0-alpha08-february-7-2022"}

- 更新 `DiskCache` 和 `ImageSource` 以使用 Okio 的 `FileSystem` API。([#1115](https://github.com/coil-kt/coil/pull/1115))

## [2.0.0-alpha07] - 2022 年 1 月 30 日 {id="2-0-0-alpha07-january-30-2022"}

- 显著提高 `AsyncImage` 的性能，并将 `AsyncImage` 拆分为 `AsyncImage` 和 `SubcomposeAsyncImage`。([#1048](https://github.com/coil-kt/coil/pull/1048))
    - `SubcomposeAsyncImage` 提供 `loading`/`success`/`error`/`content` 插槽（slot）API，并使用性能较低的子组合（subcomposition）。
    - `AsyncImage` 提供 `placeholder`/`error`/`fallback` 实参，用于覆盖加载时或请求失败时绘制的 `Painter`。`AsyncImage` 不使用子组合，性能显著优于 `SubcomposeAsyncImage`。
    - 从 `SubcomposeAsyncImage.content` 中移除 `AsyncImagePainter.State` 实参。如需使用，请使用 `painter.state`。
    - 为 `AsyncImage` 和 `SubcomposeAsyncImage` 同时添加 `onLoading`/`onSuccess`/`onError` 回调。
- 弃用 `LocalImageLoader`。([#1101](https://github.com/coil-kt/coil/pull/1101))
- 添加对 `ImageRequest.tags` 的支持。([#1066](https://github.com/coil-kt/coil/pull/1066))
- 将 `DecodeUtils` 中的 `isGif`、`isWebP`、`isAnimatedWebP`、`isHeif` 和 `isAnimatedHeif` 移至 coil-gif。将 `isSvg` 添加至 coil-svg。([#1117](https://github.com/coil-kt/coil/pull/1117))
- 将 `FetchResult` 和 `DecodeResult` 转换为非数据类。([#1114](https://github.com/coil-kt/coil/pull/1114))
- 移除未使用的 `DiskCache.Builder` context 实参。([#1099](https://github.com/coil-kt/coil/pull/1099))
- 修复具有原始尺寸的 Bitmap 资源的缩放问题。([#1072](https://github.com/coil-kt/coil/pull/1072))
- 修复 `ImageDecoderDecoder` 中未能关闭 `ImageDecoder` 的问题。([#1109](https://github.com/coil-kt/coil/pull/1109))
- 修复将 Drawable 转换为 Bitmap 时缩放不正确的问题。([#1084](https://github.com/coil-kt/coil/pull/1084))
- 将 Compose 更新至 1.1.0-rc03。
- 将 `accompanist-drawablepainter` 更新至 0.22.1-rc。
- 将 `androidx.appcompat:appcompat-resources` 更新至 1.4.1。

## [2.0.0-alpha06] - 2021 年 12 月 24 日 {id="2-0-0-alpha06-december-24-2021"}

- 添加 `ImageSource.Metadata`，以支持无需缓冲或临时文件即可从 asset、资源和 content URI 中进行解码。([#1060](https://github.com/coil-kt/coil/pull/1060))
- 延迟执行图像请求，直到 `AsyncImage` 获得正向约束。([#1028](https://github.com/coil-kt/coil/pull/1028))
- 修复当同时设置了 `loading`、`success` 和 `error` 时 `AsyncImage` 使用 `DefaultContent` 的问题。([#1026](https://github.com/coil-kt/coil/pull/1026))
- 使用 androidx `LruCache` 替代平台的 `LruCache`。([#1047](https://github.com/coil-kt/coil/pull/1047))
- 将 Kotlin 更新至 1.6.10。
- 将 Coroutines 更新至 1.6.0。
- 将 Compose 更新至 1.1.0-rc01。
- 将 `accompanist-drawablepainter` 更新至 0.22.0-rc。
- 将 `androidx.collection` 更新至 1.2.0。

## [2.0.0-alpha05] - 2021 年 11 月 28 日 {id="2-0-0-alpha05-november-28-2021"}

- **重要**：重构 `Size`，以支持针对任一维度使用图像的原始尺寸。
    - `Size` 现在由表示其宽度和高度的两个 `Dimension` 值组成。`Dimension` 可以是正像素值或 `Dimension.Original`。
    - 进行此项更改是为了在某一维度为固定像素值时，更好地支持无界宽度/高度值（例如 `wrap_content`、`Constraints.Infinity`）。
- 修复：支持 `AsyncImage` 的检查模式（预览）。
- 修复：如果 `imageLoader.memoryCache` 为 null，则 `SuccessResult.memoryCacheKey` 始终应为 `null`。
- 将类似构造函数的 `ImageLoader`、`SizeResolver` 和 `ViewSizeResolver` 的 `invoke` 函数转换为顶层函数。
- 将 `CrossfadeDrawable` 的起始和结束 Drawable 设为公共 API。
- 对 `ImageLoader` 的 placeholder/error/fallback Drawable 进行 mutate 操作。
- 向 `SuccessResult` 的构造函数添加默认实参。
- 依赖于 `androidx.collection` 而不是 `androidx.collection-ktx`。
- 将 OkHttp 更新至 4.9.3。

## [2.0.0-alpha04] - 2021 年 11 月 22 日 {id="2-0-0-alpha04-november-22-2021"}

- **新增**：向 `coil-compose` 添加 `AsyncImage`。
    - `AsyncImage` 是一个异步执行 `ImageRequest` 并渲染结果的可组合项。
    - **在大多数用例中，`AsyncImage` 旨在替代 `rememberImagePainter`。**
    - 其 API 尚未最终定型，在 2.0 正式发布前可能会有变动。
    - 它拥有与 `Image` 类似的 API，并支持相同的实参：`Alignment`、`ContentScale`、`alpha`、`ColorFilter` 和 `FilterQuality`。
    - 它支持使用 `content`、`loading`、`success` 和 `error` 实参覆盖每个 `AsyncImagePainter` 状态所绘制的内容。
    - 它修复了 `rememberImagePainter` 在解析图像尺寸和缩放比例时的诸多设计问题。
    - 使用示例：

```kotlin
// 仅绘制图像。
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null, // 尽量避免使用 `null`，尽可能将其设置为本地化字符串。
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
    - 不再支持 `ExecuteCallback`。若要让 `AsyncImagePainter` 跳过等待调用 `onDraw`，请改为设置 `ImageRequest.size(OriginalSize)`（或任意尺寸）。
    - 为 `rememberAsyncImagePainter` 添加可选的 `FilterQuality` 实参。
- 在 `DiskCache` 中使用协程进行清理操作，并添加 `DiskCache.Builder.cleanupDispatcher`。
- 修复使用 `ImageLoader.Builder.placeholder` 设置占位图时的 Compose 预览。
- 使用 `@ReadOnlyComposable` 标记 `LocalImageLoader.current` 以生成更高效的代码。
- 将 Compose 更新至 1.1.0-beta03，并依赖于 `compose.foundation` 而不是 `compose.ui`。
- 将 `androidx.appcompat-resources` 更新至 1.4.0。

## [2.0.0-alpha03] - 2021 年 11 月 12 日 {id="2-0-0-alpha03-november-12-2021"}

- 添加在 Android 29+ 上加载音乐缩略图的功能。([#967](https://github.com/coil-kt/coil/pull/967))
- 修复：使用 `context.resources` 加载当前软件包的资源。([#968](https://github.com/coil-kt/coil/pull/968))
- 修复：`clear` -> `dispose` 的替换表达式。([#970](https://github.com/coil-kt/coil/pull/970))
- 将 Compose 更新至 1.0.5。
- 将 `accompanist-drawablepainter` 更新至 0.20.2。
- 将 Okio 更新至 3.0.0。
- 将 `androidx.annotation` 更新至 1.3.0。
- 将 `androidx.core` 更新至 1.7.0。
- 将 `androidx.lifecycle` 更新至 2.4.0。
    - 移除对 `lifecycle-common-java8` 的依赖，因为其已合并入 `lifecycle-common`。

## [2.0.0-alpha02] - 2021 年 10 月 24 日 {id="2-0-0-alpha02-october-24-2021"}

- 添加新的 `coil-bom` 构件，包含[物料清单 (BOM)](https://docs.gradle.org/7.2/userguide/platforms.html#sub:bom_import)。
    - 导入 `coil-bom` 可让你在无需指定版本的情况下依赖其他 Coil 构件。
- 修复使用 `ExecuteCallback.Immediate` 时加载图像失败的问题。
- 将 Okio 更新至 3.0.0-alpha.11。
    - 这同时也解决了与 Okio 3.0.0-alpha.11 的兼容性问题。
- 将 Kotlin 更新至 1.5.31。
- 将 Compose 更新至 1.0.4。

## [2.0.0-alpha01] - 2021 年 10 月 11 日 {id="2-0-0-alpha01-october-11-2021"}

Coil 2.0.0 是该库的下一个重大迭代版本，具有新功能、性能改进、API 改进以及各种错误修复。在 2.0.0 正式发布之前，本版本可能与后续的 Alpha 版本存在二进制/源码级的不兼容。

- **重要**：最低支持的 API 现为 21。
- **重要**：启用 `-Xjvm-default=all`。
    - 这会生成 Java 8 默认方法，而不是使用 Kotlin 的默认接口方法支持。有关更多信息，请查阅[这篇博客](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/)。
    - **你同样需要在构建文件中添加 `-Xjvm-default=all` 或 `-Xjvm-default=all-compatibility`。** 有关如何操作，请参见[此处](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8)。
- **重要**：Coil 现在拥有自己的磁盘缓存实现，不再依赖 OkHttp 进行磁盘缓存。
    - 做出此项更改是为了：
        - 更好地支持解码图像时的线程中断。当频繁快速地启动和停止图像请求时，这能提升性能。
        - 支持公开由 `File` 支持的 `ImageSource`。当 Android API 需要 `File` 进行解码（例如 `MediaMetadataRetriever`）时，这可以避免不必要的复制。
        - 支持直接读写磁盘缓存文件。
    - 使用 `ImageLoader.Builder.diskCache` 和 `DiskCache.Builder` 配置磁盘缓存。
    - **不应**在 Coil 2.0 中使用 OkHttp 的 `Cache`，因为如果在写入时被中断，缓存可能会损坏。
    - 仍然支持 `Cache-Control` 和其他缓存标头——但不支持 `Vary` 标头，因为缓存仅检查 URL 是否匹配。此外，仅缓存响应代码在 [200..300) 范围内的响应。
    - 可以使用 `ImageLoader.Builder.respectCacheHeaders` 启用或禁用对缓存标头的支持。
    - 升级到 2.0 时，现有的磁盘缓存将被清除并重建。
- **重要**：`ImageRequest` 的默认 `Scale` 现在为 `Scale.FIT`。
    - 进行此更改是为了让 `ImageRequest.scale` 与其他具有默认 `Scale` 的类保持一致。
    - 具有 `ImageViewTarget` 的请求仍会自动检测其缩放比例。
- 对图像流水线类的重大更改：
    - `Mapper`、`Fetcher` 和 `Decoder` 经过重构，更加灵活。
    - `Fetcher.key` 已替换为新的 `Keyer` 接口。`Keyer` 根据输入数据创建缓存键。
    - 添加 `ImageSource`，允许 `Decoder` 直接解码 `File`。
- 从库中移除了 `BitmapPool` 和 `PoolableViewTarget`。移除 Bitmap 池化（pooling）的原因是：
    - 它在 <= API 23 上最有效，但在更新的 Android 版本中效果逐渐减弱。
    - 移除 Bitmap 池化后，Coil 可以使用不可变 Bitmap，这带来了性能收益。
    - 管理 Bitmap 池存在运行时开销。
    - Bitmap 池化会对 Coil 的 API 产生设计限制，因为它需要跟踪 Bitmap 是否符合池化条件。移除 Bitmap 池化允许 Coil 在更多地方公开结果 `Drawable`（例如 `Listener`、`Disposable`）。此外，这意味着 Coil 不必清除 `ImageView`，而清除操作可能会引发[问题](https://github.com/coil-kt/coil/issues/650)。
    - Bitmap 池化[容易出错](https://github.com/coil-kt/coil/issues/546)。分配新的 Bitmap 比尝试复用可能仍在使用中的 Bitmap 要安全得多。
- 重构 `MemoryCache` 使其更加灵活。
- 禁用生成运行时非空断言。
    - 如果使用 Java，向函数传递带有非空注解的形参作为 null 将不再立即抛出 `NullPointerException`。如果使用 Kotlin，则基本没有变化。
    - 此更改有助于减小库的大小。
- 从库中移除了 `VideoFrameFileFetcher` 和 `VideoFrameUriFetcher`。改用支持所有数据源的 `VideoFrameDecoder`。
- 添加对 `bitmapFactoryMaxParallelism` 的支持，用于限制正在进行的 `BitmapFactory` 操作的最大数量。该值默认为 4，有助于提高 UI 性能。
- 添加对 `interceptorDispatcher`、`fetcherDispatcher`、`decoderDispatcher` 和 `transformationDispatcher` 的支持。
- `Disposable` 经过重构，公开底层 `ImageRequest` 的作业。
- 将 `Transition.transition` 修改为非挂起函数，因为不再需要挂起过渡直到其完成。
- 添加用于处理通用 `ViewTarget` 逻辑的 `GenericViewTarget`。
- 从库中移除了 [`BlurTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/BlurTransformation.kt) 和 [`GrayscaleTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/GrayscaleTransformation.kt)。
    - 如果仍在使用它们，可以将它们的代码复制到项目中。
- 若 `ImageRequest.fallback` 为 null，现在会在 `Target` 上设置 `ImageRequest.error`。
- `Transformation.key` 替换为 `Transformation.cacheKey`。
- `ImageRequest.Listener` 分别在 `onSuccess` 和 `onError` 中返回 `SuccessResult`/`ErrorResult`。
- 将 `ByteBuffer` 添加到默认支持的数据类型中。
- 移除多个类中的 `toString` 实现。
- 将 OkHttp 更新至 4.9.2。
- 将 Okio 更新至 3.0.0-alpha.10。

## [1.4.0] - 2021 年 10 月 6 日 {id="1-4-0-october-6-2021"}

- **新增**：向 `ImagePainter.State.Success` 和 `ImagePainter.State.Error` 添加 `ImageResult`。([#887](https://github.com/coil-kt/coil/pull/887))
    - 这对 `ImagePainter.State.Success` 和 `ImagePainter.State.Error` 的签名构成了二进制不兼容变更，但这些 API 被标记为实验性。
- 仅当 `View.isShown` 为 `true` 时才执行 `CrossfadeTransition`。先前仅检查 `View.isVisible`。([#898](https://github.com/coil-kt/coil/pull/898))
- 修复因舍入问题导致缩放倍数略小于 1 时可能发生的内存缓存未命中。([#899](https://github.com/coil-kt/coil/pull/899))
- 将非内联的 `ComponentRegistry` 方法公开。([#925](https://github.com/coil-kt/coil/pull/925))
- 依赖于 `accompanist-drawablepainter` 并移除 Coil 的自定义 `DrawablePainter` 实现。([#845](https://github.com/coil-kt/coil/pull/845))
- 移除对 Java 8 方法的使用以防止脱糖问题。([#924](https://github.com/coil-kt/coil/pull/924))
- 将 `ImagePainter.ExecuteCallback` 提升为稳定 API。([#927](https://github.com/coil-kt/coil/pull/927))
- 将 compileSdk 更新至 31。
- 将 Kotlin 更新至 1.5.30。
- 将 Coroutines 更新至 1.5.2。
- 将 Compose 更新至 1.0.3。

## [1.3.2] - 2021 年 8 月 4 日 {id="1-3-2-august-4-2021"}

- `coil-compose` 现在依赖于 `compose.ui` 而不是 `compose.foundation`。
    - `compose.ui` 是一个更轻量的依赖项，因为它是 `compose.foundation` 的子集。
- 将 Jetpack Compose 更新至 1.0.1。
- 将 Kotlin 更新至 1.5.21。
- 将 Coroutines 更新至 1.5.1。
- 将 `androidx.exifinterface:exifinterface` 更新至 1.3.3。

## [1.3.1] - 2021 年 7 月 28 日 {id="1-3-1-july-28-2021"}

- 将 Jetpack Compose 更新至 `1.0.0`。热烈祝贺 Compose 团队推出[稳定版本](https://android-developers.googleblog.com/2021/07/jetpack-compose-announcement.html)！
- 将 `androidx.appcompat:appcompat-resources` 更新至 1.3.1。

## [1.3.0] - 2021 年 7 月 10 日 {id="1-3-0-july-10-2021"}

- **新增**：添加对 [Jetpack Compose](https://developer.android.com/jetpack/compose) 的支持。基于 [Accompanist](https://github.com/google/accompanist/) 的 Coil 集成，但包含多项改动。更多信息请查看[文档](https://coil-kt.github.io/coil/compose/)。
- 添加 `allowConversionToBitmap` 以启用/禁用 `Transformation` 的自动 Bitmap 转换。([#775](https://github.com/coil-kt/coil/pull/775))
- 向 `ImageDecoderDecoder` 和 `GifDecoder` 添加 `enforceMinimumFrameDelay`，以便在 GIF 的帧延迟低于阈值时重写该延迟。([#783](https://github.com/coil-kt/coil/pull/783))
    - 该选项默认禁用，但会在未来版本中默认启用。
- 添加对启用/禁用 `ImageLoader` 内部网络观察程序的支持。([#741](https://github.com/coil-kt/coil/pull/741))
- 修复 `BitmapFactoryDecoder` 解码出的 Bitmap 的密度。([#776](https://github.com/coil-kt/coil/pull/776))
- 修复 Licensee 找不到 Coil 许可证 URL 的问题。([#774](https://github.com/coil-kt/coil/pull/774))
- 将 `androidx.core:core-ktx` 更新至 1.6.0。

## [1.2.2] - 2021 年 6 月 4 日 {id="1-2-2-june-4-2021"}

- 修复将具有共享状态的 Drawable 转换为 Bitmap 时的竞态条件。([#771](https://github.com/coil-kt/coil/pull/771))
- 修复 `ImageLoader.Builder.fallback` 设置了 `error` Drawable 而非 `fallback` Drawable 的问题。
- 修复 `ResourceUriFetcher` 返回错误数据源的问题。([#770](https://github.com/coil-kt/coil/pull/770))
- 修复在 API 26 和 27 上针对无可用文件描述符的日志检查。
- 修复平台矢量 Drawable 支持的版本检查错误。([#751](https://github.com/coil-kt/coil/pull/751))
- 更新 Kotlin (1.5.10)。
- 更新 Coroutines (1.5.0)。
- 将 `androidx.appcompat:appcompat-resources` 更新至 1.3.0。
- 将 `androidx.core:core-ktx` 更新至 1.5.0。

## [1.2.1] - 2021 年 4 月 27 日 {id="1-2-1-april-27-2021"}

- 修复 `VideoFrameUriFetcher` 尝试处理 http/https URI 的问题。([#734](https://github.com/coil-kt/coil/pull/734))

## [1.2.0] - 2021 年 4 月 12 日 {id="1-2-0-april-12-2021"}

- **重要**：在 `SvgDecoder` 中使用 SVG 的视图边界（view bounds）来计算其宽高比。([#688](https://github.com/coil-kt/coil/pull/688))
    - 此前，`SvgDecoder` 使用 SVG 的 `width`/`height` 元素来确定宽高比，但这并未正确遵循 SVG 规范。
    - 若要恢复旧行为，请在构建 `SvgDecoder` 时设置 `useViewBoundsAsIntrinsicSize = false`。
- **新增**：添加 `VideoFrameDecoder` 以支持从任意来源解码视频帧。([#689](https://github.com/coil-kt/coil/pull/689))
- **新增**：支持使用源内容而非仅根据 MIME 类型进行自动 SVG 检测。([#654](https://github.com/coil-kt/coil/pull/654))
- **新增**：支持使用 `ImageLoader.newBuilder()` 共享资源。([#653](https://github.com/coil-kt/coil/pull/653))
    - 重要的是，这支持在 `ImageLoader` 实例之间共享内存缓存。
- **新增**：使用 `AnimatedTransformation` 添加对动图变换的支持。([#659](https://github.com/coil-kt/coil/pull/659))
- **新增**：添加对动画 Drawable 的启动/结束回调的支持。([#676](https://github.com/coil-kt/coil/pull/676))

---

- 修复解析 HEIF/HEIC 文件的 EXIF 数据的问题。([#664](https://github.com/coil-kt/coil/pull/664))
- 修复禁用 Bitmap 池化时未采用 `EmptyBitmapPool` 实现的问题。([#638](https://github.com/coil-kt/coil/pull/638))
    - 即使没有此修复，Bitmap 池化仍会被正确禁用，但此前使用的是开销更大的 `BitmapPool` 实现。
- 修复 `MovieDrawable.getOpacity` 错误返回透明的问题。([#682](https://github.com/coil-kt/coil/pull/682))
- 防范默认临时目录不存在的情况。([#683](https://github.com/coil-kt/coil/pull/683))

---

- 使用 JVM IR 后端进行构建。([#670](https://github.com/coil-kt/coil/pull/670))
- 更新 Kotlin (1.4.32)。
- 更新 Coroutines (1.4.3)。
- 更新 OkHttp (3.12.13)。
- 将 `androidx.lifecycle:lifecycle-common-java8` 更新至 2.3.1。

## [1.1.1] - 2021 年 1 月 11 日 {id="1-1-1-january-11-2021"}

- 修复因多次恢复协程而导致 `ViewSizeResolver.size` 抛出 `IllegalStateException` 的情况。
- 修复从主线程调用时 `HttpFetcher` 永久阻塞的问题。
    - 使用 `ImageRequest.dispatcher(Dispatchers.Main.immediate)` 强制在主线程上执行的请求将失败并抛出 `NetworkOnMainThreadException`，除非将 `ImageRequest.networkCachePolicy` 设置为 `CachePolicy.DISABLED` 或 `CachePolicy.WRITE_ONLY`。
- 如果视频具有旋转元数据，旋转来自 `VideoFrameFetcher` 的视频帧。
- 更新 Kotlin (1.4.21)。
- 更新 Coroutines (1.4.2)。
- 更新 Okio (2.10.0)。
- 更新 `androidx.exifinterface:exifinterface` (1.3.2)。

## [1.1.0] - 2020 年 11 月 24 日 {id="1-1-0-november-24-2020"}

- **重要**：将 `CENTER` 和 `MATRIX` 两种 `ImageView` 缩放类型解析为 `OriginalSize`。([#587](https://github.com/coil-kt/coil/pull/587))
    - 此更改仅在未显式指定请求尺寸时影响隐式尺寸解析算法。
    - 进行此项更改是为了确保图像请求的视觉结果与 `ImageView.setImageResource`/`ImageView.setImageURI` 保持一致。若要恢复旧行为，请在构造请求时设置 `ViewSizeResolver`。
- **重要**：如果 View 的布局参数为 `WRAP_CONTENT`，则从 `ViewSizeResolver` 返回屏幕尺寸。([#562](https://github.com/coil-kt/coil/pull/562))
    - 先前，只有在 View 完全完成布局后才会返回屏幕尺寸。这一变更使常规行为更加一致和直观。
- 添加控制 alpha 预乘（pre-multiplication）的功能。([#569](https://github.com/coil-kt/coil/pull/569))
- 在 `CrossfadeDrawable` 中支持优先使用精确的固有尺寸。([#585](https://github.com/coil-kt/coil/pull/585))
- 检查包含版本的完整 GIF 标头。([#564](https://github.com/coil-kt/coil/pull/564))
- 添加空的 Bitmap 池实现。([#561](https://github.com/coil-kt/coil/pull/561))
- 将 `EventListener.Factory` 改为函数式接口。([#575](https://github.com/coil-kt/coil/pull/575))
- 稳定 `EventListener`。([#574](https://github.com/coil-kt/coil/pull/574))
- 为 `ImageRequest.Builder.placeholderMemoryCacheKey` 添加 `String` 重载。
- 向 `ViewSizeResolver` 构造函数添加 `@JvmOverloads`。
- 修复：在 `CrossfadeDrawable` 中对起始/结束 Drawable 进行 mutate 操作。([#572](https://github.com/coil-kt/coil/pull/572))
- 修复：修复 GIF 在二次加载时不播放的问题。([#577](https://github.com/coil-kt/coil/pull/534))
- 更新 Kotlin (1.4.20) 并迁移至 `kotlin-parcelize` 插件。
- 更新 Coroutines (1.4.1)。

## [1.0.0] - 2020 年 10 月 22 日 {id="1-0-0-october-22-2020"}

自 `0.13.0` 以来的变更：
- 添加 `Context.imageLoader` 扩展函数。([#534](https://github.com/coil-kt/coil/pull/534))
- 添加 `ImageLoader.executeBlocking` 扩展函数。([#537](https://github.com/coil-kt/coil/pull/537))
- 替换单例图像加载器时不关闭前一个实例。([#533](https://github.com/coil-kt/coil/pull/533))

自 `1.0.0-rc3` 以来的变更：
- 修复：防范缺少/无效的 ActivityManager。([#541](https://github.com/coil-kt/coil/pull/541))
- 修复：允许 OkHttp 缓存失败的响应。([#551](https://github.com/coil-kt/coil/pull/551))
- 将 Kotlin 更新至 1.4.10。
- 将 Okio 更新至 2.9.0。
- 将 `androidx.exifinterface:exifinterface` 更新至 1.3.1。

## [1.0.0-rc3] - 2020 年 9 月 21 日 {id="1-0-0-rc3-september-21-2020"}

- 因不稳定原因，回滚使用 [`-Xjvm-default=all`](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/) 编译器标志。
    - **与以前的候选发布版本相比，这是源码兼容但二进制不兼容的更改。**
- 添加 `Context.imageLoader` 扩展函数。([#534](https://github.com/coil-kt/coil/pull/534))
- 添加 `ImageLoader.executeBlocking` 扩展函数。([#537](https://github.com/coil-kt/coil/pull/537))
- 替换单例图像加载器时不关闭前一个实例。([#533](https://github.com/coil-kt/coil/pull/533))
- 更新 AndroidX 依赖项：
    - `androidx.exifinterface:exifinterface` -> 1.3.0

## [1.0.0-rc2] - 2020 年 9 月 3 日 {id="1-0-0-rc2-september-3-2020"}

- **此版本需要 Kotlin 1.4.0 或更高版本。**
- 包含 [0.13.0](#0130-september-3-2020) 中的所有变更。
- 依赖于基础 Kotlin `stdlib` 而非 `stdlib-jdk8`。

## [0.13.0] - 2020 年 9 月 3 日 {id="0-13-0-september-3-2020"}

- **重要**：默认在主线程上启动拦截器链。([#513](https://github.com/coil-kt/coil/pull/513))
    - 这在很大程度上恢复了 `0.11.0` 及更低版本的行为，即在主线程上同步检查内存缓存。
    - 若要恢复为与 `0.12.0` 相同的行为（在 `ImageRequest.dispatcher` 上检查内存缓存），请设置 `ImageLoader.Builder.launchInterceptorChainOnMainThread(false)`。
    - 更多信息请参阅 [`launchInterceptorChainOnMainThread`](https://coil-kt.github.io/coil/api/coil-core/coil3/-image-loader/-builder/launch-interceptor-chain-on-main-thread/)。

---

- 修复：修复在已分离的 Fragment 中的 `ViewTarget` 上启动请求时可能发生的内存泄漏。([#518](https://github.com/coil-kt/coil/pull/518))
- 修复：使用 `ImageRequest.context` 加载资源 URI。([#517](https://github.com/coil-kt/coil/pull/517))
- 修复：修复可能导致后续请求无法保存到磁盘缓存的竞态条件。([#510](https://github.com/coil-kt/coil/pull/510))
- 修复：在 API 18 上使用 `blockCountLong` 和 `blockSizeLong`。

---

- 将 `ImageLoaderFactory` 设为 fun 接口。
- 添加 `ImageLoader.Builder.addLastModifiedToFileCacheKey`，支持启用/禁用向从 `File` 加载的图像的内存缓存键添加最后修改时间戳。

---

- 将 Kotlin 更新至 1.4.0。
- 将 Coroutines 更新至 1.3.9。
- 将 Okio 更新至 2.8.0。

## [1.0.0-rc1] - 2020 年 8 月 18 日 {id="1-0-0-rc1-august-18-2020"}

- **此版本需要 Kotlin 1.4.0 或更高版本。**
- 将 Kotlin 更新至 1.4.0 并启用 [`-Xjvm-default=all`](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/)。
    - **[关于如何在构建文件中启用 `-Xjvm-default=all`，请参见此处](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8)。**
    - 这会为默认 Kotlin 接口方法生成 Java 8 默认方法。
- 移除 0.12.0 中所有现存的已弃用方法。
- 将 Coroutines 更新至 1.3.9。

## [0.12.0] - 2020 年 8 月 18 日 {id="0-12-0-august-18-2020"}

- **破坏性变更**：`LoadRequest` 和 `GetRequest` 已替换为 `ImageRequest`：
    - `ImageLoader.execute(LoadRequest)` -> `ImageLoader.enqueue(ImageRequest)`
    - `ImageLoader.execute(GetRequest)` -> `ImageLoader.execute(ImageRequest)`
    - `ImageRequest` 实现了 `equals`/`hashCode`。
- **破坏性变更**：许多类已重命名和/或更改了包路径：
    - `coil.request.RequestResult` -> `coil.request.ImageResult`
    - `coil.request.RequestDisposable` -> `coil.request.Disposable`
    - `coil.bitmappool.BitmapPool` -> `coil.bitmap.BitmapPool`
    - `coil.DefaultRequestOptions` -> `coil.request.DefaultRequestOptions`
- **破坏性变更**：[`SparseIntArraySet`](https://github.com/coil-kt/coil/blob/f52addd039f0195b66f93cb0f1cad59b0832f784/coil-core/src/main/java/coil/collection/SparseIntArraySet.kt) 已从公共 API 中移除。
- **破坏性变更**：`TransitionTarget` 不再实现 `ViewTarget`。
- **破坏性变更**：`ImageRequest.Listener.onSuccess` 的签名已更改为返回 `ImageResult.Metadata`，而不仅是 `DataSource`。
- **破坏性变更**：移除对 `LoadRequest.aliasKeys` 的支持。该 API 更好地通过直接读/写访问内存缓存来处理。

---

- **重要**：内存缓存中的值不再同步解析（如果从主线程调用）。
    - 做出此项更改也是为了支持在后台调度器上执行 `Interceptor`。
    - 此更改还将更多工作从主线程移出，从而提高性能。
- **重要**：`Mappers` 现在在后台调度器上执行。附带影响是，不再**自动**支持自动 Bitmap 采样。若要获得相同的效果，请将前一个请求的 `MemoryCache.Key` 用作后续请求的 `placeholderMemoryCacheKey`。[请参阅此处的示例](https://coil-kt.github.io/coil/recipes#using-a-memory-cache-key-as-a-placeholder)。
    - `placeholderMemoryCacheKey` API 提供了更多自由度，因为你可以将带有不同数据的两个图像请求“链接”起来（例如小图/大图的不同 URL）。
- **重要**：Coil 的 `ImageView` 扩展函数已从 `coil.api` 包移至 `coil` 包。
    - 使用查找 + 替换将 `import coil.api.load` 重构为 `import coil.load`。很遗憾，无法使用 Kotlin 的 `ReplaceWith` 功能来替换导入。
- **重要**：如果 Drawable 不是相同的图像，则使用标准淡入淡出。
- **重要**：在 API 24+ 上优先使用不可变 Bitmap。
- **重要**：已弃用 `MeasuredMapper`，改用新的 `Interceptor` 接口。有关如何将 `MeasuredMapper` 转换为 `Interceptor` 的示例，请参见[此处](https://gist.github.com/colinrtwhite/90267704091467451e46b21b95154299)。
    - `Interceptor` 是一个限制少得多的 API，允许使用更广泛的自定义逻辑。
- **重要**：`ImageRequest.data` 现在为非空。如果创建 `ImageRequest` 时未设置其数据，它将返回 `NullRequestData` 作为其数据。

---

- **新增**：添加对直接读/写访问 `ImageLoader` 的 `MemoryCache` 的支持。有关更多信息，请查阅[文档](https://coil-kt.github.io/coil/getting_started/#memory-cache)。
- **新增**：添加对 `Interceptor` 的支持。有关更多信息，请查阅[文档](https://coil-kt.github.io/coil/image_pipeline/#interceptors)。Coil 的 `Interceptor` 设计深受 [OkHttp](https://github.com/square/okhttp) 的启发！
- **新增**：支持使用 `ImageLoader.Builder.bitmapPoolingEnabled` 启用/禁用 Bitmap 池化。
    - Bitmap 池化在 API 23 及以下版本中最有效，但在 API 24 及以上版本中仍可能有益（通过积极调用 `Bitmap.recycle`）。
- **新增**：支持在解码时中断线程。

---

- 修复解析 content-type 标头中的多个分段的问题。
- 重构 Bitmap 引用计数以使其更加健壮。
- 修复 API < 19 设备上的 WebP 解码问题。
- 在 EventListener API 中公开 FetchResult 和 DecodeResult。

---

- 使用 SDK 30 进行编译。
- 将 Coroutines 更新至 1.3.8。
- 将 OkHttp 更新至 3.12.12。
- 将 Okio 更新至 2.7.0。
- 更新 AndroidX 依赖项：
    - `androidx.appcompat:appcompat-resources` -> 1.2.0
    - `androidx.core:core-ktx` -> 1.3.1

## [0.11.0] - 2020 年 5 月 14 日 {id="0-11-0-may-14-2020"}

- **破坏性变更**：**此版本移除了所有现有的已弃用函数。**
    - 这使得可以移除 Coil 的 `ContentProvider`，从而在应用启动时不运行任何代码。
- **破坏性变更**：将 `SparseIntArraySet.size` 转换为 val。([#380](https://github.com/coil-kt/coil/pull/380))
- **破坏性变更**：将 `Parameters.count()` 移至扩展函数。([#403](https://github.com/coil-kt/coil/pull/403))
- **破坏性变更**：将 `BitmapPool.maxSize` 设为 Int。([#404](https://github.com/coil-kt/coil/pull/404))

---

- **重要**：使 `ImageLoader.shutdown()` 变为可选（类似于 `OkHttpClient`）。([#385](https://github.com/coil-kt/coil/pull/385))

---

- 修复：修复 AGP 4.1 兼容性问题。([#386](https://github.com/coil-kt/coil/pull/386))
- 修复：修复测量处于 GONE 状态的 View 的问题。([#397](https://github.com/coil-kt/coil/pull/397))

---

- 将默认内存缓存大小减少至 20%。([#390](https://github.com/coil-kt/coil/pull/390))
    - 若要恢复现有行为，请在创建 `ImageLoader` 时设置 `ImageLoaderBuilder.availableMemoryPercentage(0.25)`。
- 将 Coroutines 更新至 1.3.6。
- 将 OkHttp 更新至 3.12.11。

## [0.10.1] - 2020 年 4 月 26 日 {id="0-10-1-april-26-2020"}

- 修复在 API 23 及以下版本上解码大型 PNG 时的 OOM 问题。([#372](https://github.com/coil-kt/coil/pull/372))。
    - 这禁用了针对 PNG 文件的 EXIF 方向解码。PNG 的 EXIF 方向极少使用，且读取 PNG EXIF 数据（即使为空）也需要将整个文件缓冲到内存中，这对性能不利。
- 对 `SparseIntArraySet` 进行了细微的 Java 兼容性改进。

---

- 将 Okio 更新至 2.6.0。

## [0.10.0] - 2020 年 4 月 20 日 {id="0-10-0-april-20-2020"}

### 重点关注 {id="highlights"}

- **此版本弃用了大部分 DSL API，转而直接使用构建器。** 变更如下所示：

    ```kotlin
    // 0.9.5（旧）
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

    // 0.10.0（新）
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

    - 如果使用的是 `io.coil-kt:coil` 构件，可以调用 `Coil.execute(request)` 使用单例 `ImageLoader` 执行请求。

- **`ImageLoader` 现在具有弱引用内存缓存**，用于在图像从强引用内存缓存中逐出后跟踪对它们的弱引用。
    - 这意味着如果某个图像仍然存在强引用，它将始终从 `ImageLoader` 的内存缓存中返回。
    - 通常，这会使内存缓存更加可预测并提高命中率。
    - 可以通过 `ImageLoaderBuilder.trackWeakReferences` 启用/禁用此行为。

- 添加新构件 **`io.coil-kt:coil-video`**，用于从视频文件中解码特定帧。[在此阅读更多信息](https://coil-kt.github.io/coil/videos/)。

- 添加新的 [EventListener](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/EventListener.kt) API 用于指标跟踪。

- 添加 [ImageLoaderFactory](https://github.com/coil-kt/coil/blob/main/coil/src/main/java/coil/ImageLoaderFactory.kt)，可由你的 `Application` 实现以简化单例初始化。

---

### 完整版本说明 {id="full-release-notes"}

- **重要**：弃用 DSL 语法，改用构建器语法。([#267](https://github.com/coil-kt/coil/pull/267))
- **重要**：弃用 `Coil` 和 `ImageLoader` 扩展函数。([#322](https://github.com/coil-kt/coil/pull/322))
- **破坏性变更**：从 `ImageLoader.execute(GetRequest)` 返回密封的 `RequestResult` 类型。([#349](https://github.com/coil-kt/coil/pull/349))
- **破坏性变更**：将 `ExperimentalCoil` 重命名为 `ExperimentalCoilApi`。从 `@Experimental` 迁移到 `@RequiresOptIn`。([#306](https://github.com/coil-kt/coil/pull/306))
- **破坏性变更**：将 `CoilLogger` 替换为 `Logger` 接口。([#316](https://github.com/coil-kt/coil/pull/316))
- **破坏性变更**：将 destWidth/destHeight 重命名为 dstWidth/dstHeight。([#275](https://github.com/coil-kt/coil/pull/275))
- **破坏性变更**：重新调整 `MovieDrawable` 构造函数的形参。([#272](https://github.com/coil-kt/coil/pull/272))
- **破坏性变更**：`Request.Listener` 的方法现在接收完整的 `Request` 对象，而不仅是其数据。
- **破坏性变更**：`GetRequestBuilder` 构造函数现在需要 `Context`。
- **破坏性变更**：`Request` 上的多个属性现在可为空。
- **行为变更**：默认在缓存键中包含形参值。([#319](https://github.com/coil-kt/coil/pull/319))
- **行为变更**：微调 `Request.Listener.onStart()` 的调用时机，使其在 `Target.onStart()` 后立即被调用。([#348](https://github.com/coil-kt/coil/pull/348))

---

- **新增**：添加 `WeakMemoryCache` 实现。([#295](https://github.com/coil-kt/coil/pull/295))
- **新增**：添加 `coil-video` 以支持解码视频帧。([#122](https://github.com/coil-kt/coil/pull/122))
- **新增**：引入 [`EventListener`](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/EventListener.kt)。([#314](https://github.com/coil-kt/coil/pull/314))
- **新增**：引入 [`ImageLoaderFactory`](https://github.com/coil-kt/coil/blob/main/coil/src/main/java/coil/ImageLoaderFactory.kt)。([#311](https://github.com/coil-kt/coil/pull/311))
- **新增**：在 Android 11 上支持动画 HEIF 图像序列。([#297](https://github.com/coil-kt/coil/pull/297))
- **新增**：改进 Java 兼容性。([#262](https://github.com/coil-kt/coil/pull/262))
- **新增**：支持设置默认 `CachePolicy`。([#307](https://github.com/coil-kt/coil/pull/307))
- **新增**：支持设置默认 `Bitmap.Config`。([#342](https://github.com/coil-kt/coil/pull/342))
- **新增**：添加 `ImageLoader.invalidate(key)` 以清除单个内存缓存项。([#55](https://github.com/coil-kt/coil/pull/55))
- **新增**：添加调试日志以解释为何未复用缓存图像。([#346](https://github.com/coil-kt/coil/pull/346))
- **新增**：为 get 请求支持 `error` 和 `fallback` Drawable。

---

- 修复：修复 Transformation 缩减输入 Bitmap 尺寸时的内存缓存未命中问题。([#357](https://github.com/coil-kt/coil/pull/357))
- 修复：确保 BlurTransformation 中的半径低于 RenderScript 的最大值。([#291](https://github.com/coil-kt/coil/pull/291))
- 修复：修复解码高色彩深度图像的问题。([#358](https://github.com/coil-kt/coil/pull/358))
- 修复：在 Android 11 及更高版本上禁用针对 `ImageDecoderDecoder` 崩溃的规避处理。([#298](https://github.com/coil-kt/coil/pull/298))
- 修复：修复在 API 23 之前读取 EXIF 数据失败的问题。([#331](https://github.com/coil-kt/coil/pull/331))
- 修复：修复与 Android R SDK 的不兼容问题。([#337](https://github.com/coil-kt/coil/pull/337))
- 修复：仅在 `ImageView` 具有匹配的 `SizeResolver` 时才启用非精确尺寸。([#344](https://github.com/coil-kt/coil/pull/344))
- 修复：允许缓存图像与请求尺寸最多相差一个像素。([#360](https://github.com/coil-kt/coil/pull/360))
- 修复：若 View 不可见则跳过淡入淡出过渡。([#361](https://github.com/coil-kt/coil/pull/361))

---

- 弃用 `CoilContentProvider`。([#293](https://github.com/coil-kt/coil/pull/293))
- 使用 `@MainThread` 注解多个 `ImageLoader` 方法。
- 若生命周期当前处于已启动状态，避免创建 `LifecycleCoroutineDispatcher`。([#356](https://github.com/coil-kt/coil/pull/356))
- 对 `OriginalSize.toString()` 使用完整包名。
- 解码软件 Bitmap 时进行预分配。([#354](https://github.com/coil-kt/coil/pull/354))

---

- 将 Kotlin 更新至 1.3.72。
- 将 Coroutines 更新至 1.3.5。
- 将 OkHttp 更新至 3.12.10。
- 将 Okio 更新至 2.5.0。
- 更新 AndroidX 依赖项：
    - `androidx.exifinterface:exifinterface` -> 1.2.0

## [0.9.5] - 2020 年 2 月 6 日 {id="0-9-5-february-6-2020"}

- 修复：确保在检查 View 是否硬件加速之前已附加 View。这修复了请求硬件 Bitmap 时可能未命中内存缓存的问题。

---

- 更新 AndroidX 依赖项：
    - `androidx.core:core-ktx` -> 1.2.0

## [0.9.4] - 2020 年 2 月 3 日 {id="0-9-4-february-3-2020"}

- 修复：在 ImageDecoderDecoder 中降采样时遵循宽高比。感谢 @zhanghai。

---

- 此前，只要内存缓存中 Bitmap 的配置大于或等于请求中指定的配置，就会返回该 Bitmap。例如，如果请求的是 `ARGB_8888` 的 Bitmap，从内存缓存中返回的可能是 `RGBA_F16` 的 Bitmap。现在，缓存的配置与请求的配置必须完全一致。
- 在 `CrossfadeDrawable` 和 `CrossfadeTransition` 中将 `scale` 和 `durationMillis` 设为 public。

## [0.9.3] - 2020 年 2 月 1 日 {id="0-9-3-february-1-2020"}

- 修复：在 `ScaleDrawable` 内平移子 Drawable 以确保其居中。
- 修复：修复 GIF 和 SVG 无法完全填满边界的问题。

---

- 将 `HttpUrl.get()` 的调用推迟到后台线程。
- 改进 BitmapFactory 返回 null Bitmap 时的错误信息。
- 将 3 款设备添加到硬件 Bitmap 黑名单中。([#264](https://github.com/coil-kt/coil/pull/264))

---

- 更新 AndroidX 依赖项：
    - `androidx.lifecycle:lifecycle-common-java8` -> 2.2.0

## [0.9.2] - 2020 年 1 月 19 日 {id="0-9-2-january-19-2020"}

- 修复：修复 API 19 之前版本上的 GIF 解码问题。感谢 @mario。
- 修复：修复光栅化矢量 Drawable 未被标记为已采样的问题。
- 修复：Movie 尺寸 <= 0 时抛出异常。
- 修复：修复内存缓存事件未恢复 CrossfadeTransition 的问题。
- 修复：如果被禁用，阻止向所有 target 方法返回硬件 Bitmap。
- 修复：修复 MovieDrawable 未在边界中心定位自身的问题。

---

- 移除 CrossfadeDrawable 的自动缩放。
- 将 `BitmapPool.trimMemory` 设为 public。
- 将 AnimatedImageDrawable 包装在 ScaleDrawable 中以确保其填满边界。
- 为 RequestBuilder.setParameter 添加 @JvmOverloads。
- 如果未设置 SVG 的 viewBox，则将其设置为其自身尺寸。
- 将状态和层级更改传递给 CrossfadeDrawable 的子项。

---

- 将 OkHttp 更新至 3.12.8。

## [0.9.1] - 2019 年 12 月 30 日 {id="0-9-1-december-30-2019"}

- 修复：修复调用 `LoadRequestBuilder.crossfade(false)` 时的崩溃问题。

## [0.9.0] - 2019 年 12 月 30 日 {id="0-9-0-december-30-2019"}

- **破坏性变更**：`Transformation.transform` 现在包含一个 `Size` 形参。这是为了支持根据 `Target` 的大小更改输出 `Bitmap` 大小的变换。带有变换的请求现在也将不受[图像采样](https://coil-kt.github.io/coil/getting_started/#image-sampling)的影响。
- **破坏性变更**：`Transformation` 现在适用于任何类型的 `Drawable`。此前，如果输入的 `Drawable` 不是 `BitmapDrawable`，则会跳过 `Transformation`。现在，在应用 `Transformation` 之前会将 `Drawable` 渲染为 `Bitmap`。
- **破坏性变更**：向 `ImageLoader.load` 传递 `null` 数据现在被视为错误，并会调用带有 `NullRequestDataException` 的 `Target.onError` 和 `Request.Listener.onError`。做出此项更改是为了支持在数据为 `null` 时设置 `fallback` Drawable。此前该请求会被静默忽略。
- **破坏性变更**：`RequestDisposable.isDisposed` 现在是一个 `val`。

---

- **新增**：支持自定义过渡。[在此查看更多信息](https://coil-kt.github.io/coil/transitions/)。由于 API 仍在孵化中，过渡功能被标记为实验性。
- **新增**：添加 `RequestDisposable.await` 以支持在 `LoadRequest` 进行中时挂起。
- **新增**：支持在请求数据为 null 时设置 `fallback` Drawable。
- **新增**：添加 `Precision`。这使得输出 `Drawable` 的大小精确无误，同时为支持缩放的 target（例如 `ImageViewTarget`）启用缩放优化。有关更多信息，请参阅[其文档](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/size/Precision.kt)。
- **新增**：添加 `RequestBuilder.aliasKeys` 以支持匹配多个缓存键。

---

- 修复：使 RequestDisposable 线程安全。
- 修复：`RoundedCornersTransformation` 现在先裁剪到 target 的大小，然后将角变圆。
- 修复：`CircleCropTransformation` 现在从中心进行裁剪。
- 修复：将多款设备添加到[硬件 Bitmap 黑名单](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/memory/HardwareBitmapService.kt)。
- 修复：将 Drawable 转换为 Bitmap 时保持宽高比。
- 修复：修复在使用 `Scale.FIT` 时可能发生的内存缓存未命中。
- 修复：确保 Parameters 的迭代顺序是确定性的。
- 修复：在创建 Parameters 和 ComponentRegistry 时进行防御性复制。
- 修复：确保 RealBitmapPool 的 maxSize >= 0。
- 修复：如果 CrossfadeDrawable 没有在动画播放中或未完成，则显示起始 Drawable。
- 修复：调整 CrossfadeDrawable 以考量具有未定义固有尺寸的子项。
- 修复：修复 `MovieDrawable` 缩放不正确的问题。

---

- 将 Kotlin 更新至 1.3.61。
- 将 Kotlin Coroutines 更新至 1.3.3。
- 将 Okio 更新至 2.4.3。
- 更新 AndroidX 依赖项：
    - `androidx.exifinterface:exifinterface` -> 1.1.0

## [0.8.0] - 2019 年 10 月 22 日 {id="0-8-0-october-22-2019"}

- **破坏性变更**：移除了 `SvgDrawable`。取而代之的是，SVG 现在由 `SvgDecoder` 预渲染为 `BitmapDrawable`。这使得 SVG **在主线程上的渲染开销显著降低**。此外，`SvgDecoder` 构造函数现在需要 `Context`。
- **破坏性变更**：`SparseIntArraySet` 扩展函数已移至 `coil.extension` 包。

---

- **新增**：支持按请求设置网络标头。[在此查看更多信息](https://github.com/coil-kt/coil/pull/120)。
- **新增**：添加新的 `Parameters` API，以支持通过图像流水线传递自定义数据。
- **新增**：在 RoundedCornersTransformation 中支持单个圆角半径。感谢 @khatv911。
- **新增**：添加 `ImageView.clear()` 以支持主动释放资源。
- **新增**：支持从其他软件包加载资源。
- **新增**：为 ViewSizeResolver 添加 `subtractPadding` 属性，用于在测量时启用/禁用扣除 View 的内边距。
- **新增**：改进 HttpUrlFetcher 的 MIME 类型检测。
- **新增**：向 MovieDrawable 和 CrossfadeDrawable 添加 Animatable2Compat 支持。
- **新增**：添加 `RequestBuilder<*>.repeatCount` 用于设置 GIF 的重复次数。
- **新增**：将 BitmapPool 的创建加入公共 API。
- **新增**：使用 `@MainThread` 注解 Request.Listener 的方法。

---

- 修复：使 CoilContentProvider 对测试可见。
- 修复：在资源缓存键中包含夜间模式。
- 修复：通过临时将源写入磁盘来规避 ImageDecoder 原生崩溃。
- 修复：正确处理联系人显示照片 URI。
- 修复：将着色传递给 CrossfadeDrawable 的子项。
- 修复：修复多处未关闭源的情况。
- 修复：添加包含损坏/不完整硬件 Bitmap 实现的设备黑名单。

---

- 针对 SDK 29 进行编译。
- 将 Kotlin Coroutines 更新至 1.3.2。
- 将 OkHttp 更新至 3.12.6。
- 将 Okio 更新至 2.4.1。
- 将 `coil-base` 中的 `appcompat-resources` 从 `compileOnly` 改为 `implementation`。

## [0.7.0] - 2019 年 9 月 8 日 {id="0-7-0-september-8-2019"}
- **破坏性变更**：`ImageLoaderBuilder.okHttpClient(OkHttpClient.Builder.() -> Unit)` 现已变更为 `ImageLoaderBuilder.okHttpClient(() -> OkHttpClient)`。初始值设定项现在也在后台线程上延迟调用。**如果设置了自定义 `OkHttpClient`，必须设置 `OkHttpClient.cache` 才能启用磁盘缓存。** 如果未设置自定义 `OkHttpClient`，Coil 将创建已启用磁盘缓存的默认 `OkHttpClient`。可以使用 `CoilUtils.createDefaultCache(context)` 创建默认的 Coil 缓存。例如：

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
- **破坏性变更**：先前仅调用第一个适用的 `Mapper`。现在将调用所有适用的 `Mapper`。API 无变动。
- **破坏性变更**：少量具名形参重命名：`url` -> `uri`，`factory` -> `initializer`。

---

- **新增**：`coil-svg` 构件，包含支持自动解码 SVG 的 `SvgDecoder`。由 [AndroidSVG](https://github.com/BigBadaboom/androidsvg) 提供支持。感谢 @rharter。
- **新增**：`load(String)` 和 `get(String)` 现在接受任何受支持的 Uri 架构（scheme）。例如，你现在可以执行 `imageView.load("file:///path/to/file.jpg")`。
- **新增**：重构 ImageLoader，使用 `Call.Factory` 代替 `OkHttpClient`。这允许使用 `ImageLoaderBuilder.okHttpClient { OkHttpClient() }` 延迟初始化网络资源。感谢 @ZacSweers。
- **新增**：`RequestBuilder.decoder`，用于为请求显式设置解码器。
- **新增**：`ImageLoaderBuilder.allowHardware`，用于为 ImageLoader 默认启用/禁用硬件 Bitmap。
- **新增**：在 ImageDecoderDecoder 中支持软件渲染。

---

- 修复：修复加载矢量 Drawable 的多个错误。
- 修复：支持 WRAP_CONTENT 的 View 尺寸。
- 修复：支持解析超过 8192 字节的 EXIF 数据。
- 修复：淡入淡出时不对不同宽高比的 Drawable 进行拉伸。
- 修复：防范网络观察程序因异常而无法注册的情况。
- 修复：修复 MovieDrawable 中的除以零错误。感谢 @R12rus。
- 修复：支持嵌套的 Android asset 文件。感谢 @JaCzekanski。
- 修复：防范在 Android O 和 O_MR1 上耗尽文件描述符。
- 修复：禁用内存缓存时不再崩溃。感谢 @hansenji。
- 修复：确保始终从主线程调用 Target.cancel。

---

- 将 Kotlin 更新至 1.3.50。
- 将 Kotlin Coroutines 更新至 1.3.0。
- 将 OkHttp 更新至 3.12.4。
- 将 Okio 更新至 2.4.0。
- 将 AndroidX 依赖项更新至最新稳定版本：
    - `androidx.appcompat:appcompat` -> 1.1.0
    - `androidx.core:core-ktx` -> 1.1.0
    - `androidx.lifecycle:lifecycle-common-java8` -> 2.1.0
- 将 `appcompat` 替换为作为可选 `compileOnly` 依赖项的 `appcompat-resources`。`appcompat-resources` 是一个更小巧的构件。

## [0.6.1] - 2019 年 8 月 16 日 {id="0-6-1-august-16-2019"}
- 新增：向 RequestBuilder 添加 `transformations(List<Transformation>)`。
- 修复：将最后修改日期添加到文件 URI 的缓存键中。
- 修复：确保 View 尺寸至少评估为 1px。
- 修复：在帧之间清除 MovieDrawable 的画布。
- 修复：正确打开 asset。

## [0.6.0] - 2019 年 8 月 12 日 {id="0-6-0-august-12-2019"}
- 首次发布。