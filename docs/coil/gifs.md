# GIF

**此功能仅在 Android 上可用。**

与 Glide 不同，默认情况下不支持 GIF。不过，Coil 提供了一个扩展库来支持它们。

要添加 GIF 支持，请导入该扩展库：

```kotlin
implementation("io.coil-kt.coil3:coil-gif:3.6.3")
```

大功告成！`ImageLoader` 将利用文件头自动检测任何 GIF 并正确对其进行解码。

或者，您也可以在构建 `ImageLoader` 时手动将解码器添加到组件注册表中：

```kotlin
val imageLoader = ImageLoader.Builder(context)
    .components {
        if (SDK_INT >= 28) {
            add(AnimatedImageDecoder.Factory())
        } else {
            add(GifDecoder.Factory())
        }
    }
    .build()
```

要转换 GIF 每一帧的像素数据，请参阅 [AnimatedTransformation](/coil/api/coil-gif/coil3.gif/-animated-transformation)。

!!! Note
    Coil 包含两个独立的解码器来支持解码 GIF。`GifDecoder` 支持所有 API 级别，但速度较慢。`AnimatedImageDecoder` 由 Android 的 [ImageDecoder](https://developer.android.com/reference/android/graphics/ImageDecoder) API 提供支持，该 API 仅在 API 28 及以上版本中可用。`AnimatedImageDecoder` 比 `GifDecoder` 更快，并且支持解码动效 WebP 图像和动效 HEIF 图像序列。