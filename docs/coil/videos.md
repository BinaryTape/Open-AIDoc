# 视频帧

**此功能仅在 Android 上可用。**

要添加视频帧支持，请导入扩展库：

```kotlin
implementation("io.coil-kt.coil3:coil-video:3.6.3")
```

Coil 会通过其 service loader 自动注册 `VideoFrameDecoder.Factory`。如果您已禁用 service loading，请将该工厂添加到您的 `ImageLoader` 组件注册表中：

```kotlin
val imageLoader = ImageLoader.Builder(context)
    .components {
        add(VideoFrameDecoder.Factory())
    }
    .build()
```

解码器会自动处理 MIME 类型以 `video/` 开头的源。Coil 可以根据识别出的文件扩展名推断该 MIME 类型。如果源缺少 MIME 类型或 MIME 类型不正确，请为请求显式设置解码器：

```kotlin
imageView.load("/path/to/video") {
    decoderFactory { result, options, _ -> VideoFrameDecoder(result.source, options) }
}
```

要指定从视频中提取帧的时间，请使用 `videoFrameMillis` 或 `videoFrameMicros`：

```kotlin
imageView.load("/path/to/video.mp4") {
    videoFrameMillis(1000)  // 提取视频第 1 秒处的帧
}
```

要指定精确的帧编号，请使用 `videoFrameIndex`（需要 API 级别 28）：

```kotlin
imageView.load("/path/to/video.mp4") {
    videoFrameIndex(1234)  // 提取视频的第 1234 帧
}
```

要根据视频总时长的百分比选择视频帧，请使用 `videoFramePercent`：

```kotlin
imageView.load("/path/to/video.mp4") {
    videoFramePercent(0.5)  // 提取视频时长中间位置的帧
}
```

如果未指定帧位置，将解码视频的第一帧。