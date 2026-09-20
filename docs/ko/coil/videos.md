# 비디오 프레임

**이 기능은 Android에서만 사용할 수 있습니다.**

비디오 프레임 지원을 추가하려면 확장 라이브러리를 임포트하세요:

```kotlin
implementation("io.coil-kt.coil3:coil-video:3.6.3")
```

그리고 `ImageLoader`를 생성할 때 컴포넌트 레지스트리에 디코더를 추가하세요:

```kotlin
val imageLoader = ImageLoader.Builder(context)
    .components {
        add(VideoFrameDecoder.Factory())
    }
    .build()
```

비디오에서 추출할 프레임의 시간을 지정하려면 `videoFrameMillis` 또는 `videoFrameMicros`를 사용하세요:

```kotlin
imageView.load("/path/to/video.mp4") {
    videoFrameMillis(1000)  // 비디오의 1초 지점 프레임을 추출합니다.
}
```

정확한 프레임 번호를 지정하려면 `videoFrameIndex`를 사용하세요 (API 레벨 28 이상 필요):

```kotlin
imageView.load("/path/to/video.mp4") {
    videoFrameIndex(1234)  // 비디오의 1234번째 프레임을 추출합니다.
}
```

비디오 전체 재생 시간의 백분율을 기준으로 비디오 프레임을 선택하려면 `videoFramePercent`를 사용하세요:

```kotlin
imageView.load("/path/to/video.mp4") {
    videoFramePercent(0.5)  // 비디오 재생 시간의 중간 지점 프레임을 추출합니다.
}
```

프레임 위치를 지정하지 않으면 비디오의 첫 번째 프레임이 디코딩됩니다.

`ImageLoader`는 요청의 파일 이름/URI가 [유효한 비디오 확장자](https://developer.android.com/guide/topics/media/media-formats#video-formats)로 끝나는 경우 자동으로 비디오를 감지하고 프레임을 추출합니다. 확장자가 유효하지 않은 경우, 요청에 대해 `Decoder`를 명시적으로 설정할 수 있습니다:

```kotlin
imageView.load("/path/to/video") {
    decoderFactory { result, options, _ -> VideoFrameDecoder(result.source, options) }
}