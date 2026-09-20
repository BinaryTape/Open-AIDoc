# 视频帧

**此功能仅适用于 Android。**

要添加视频帧支持，请导入扩展库：

```kotlin
implementation("io.coil-kt.coil3:coil-video:3.6.3")
```

并在构建 `ImageLoader` 时将解码器添加到组件注册表中：

```kotlin
val imageLoader = ImageLoader.Builder(context)
    .components {
        add(VideoFrameDecoder.Factory())
    }
    .build()
```

要指定从视频中提取帧的时间，请使用 `videoFrameMillis` 或 `videoFrameMicros`：

```kotlin
imageView.load("/path/to/video.mp4") {
    videoFrameMillis(1000)  // 提取视频 1 秒处的帧
}
```

若要指定确切的帧号，请使用 `videoFrameIndex`（需要 API 级别 28）：

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

如果未指定帧位置，则将解码视频的第一帧。

如果请求的文件名/URI 以[有效视频扩展名](https://developer.android.com/guide/topics/media/media-formats#video-formats)结尾，`ImageLoader` 将自动检测任何视频并提取其帧。如果没有，您可以为请求显式设置 `Decoder`：

```kotlin
imageView.load("/path/to/video") {
    decoderFactory { result, options, _ -> VideoFrameDecoder(result.source, options) }
}