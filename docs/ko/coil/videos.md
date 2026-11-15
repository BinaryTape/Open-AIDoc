# 비디오 프레임

**이 기능은 Android에서만 지원됩니다.**

비디오 프레임 지원을 추가하려면 확장 라이브러리를 추가하세요:

```kotlin
implementation("io.coil-kt.coil3:coil-video:3.6.3")
```

Coil은 서비스 로더(service loader)를 통해 `VideoFrameDecoder.Factory`를 자동으로 등록합니다. 서비스 로딩을 비활성화한 경우, `ImageLoader`의 컴포넌트 레지스트리에 해당 팩토리를 직접 추가하세요:

```kotlin
val imageLoader = ImageLoader.Builder(context)
    .components {
        add(VideoFrameDecoder.Factory())
    }
    .build()
```

디코더는 MIME 타입이 `video/`로 시작하는 소스를 자동으로 처리합니다. Coil은 인식 가능한 파일 확장자로부터 이 MIME 타입을 유추할 수 있습니다. 소스에 MIME 타입이 누락되었거나 잘못된 경우, 요청 시 디코더를 명시적으로 설정하세요:

```kotlin
imageView.load("/path/to/video") {
    decoderFactory { result, options, _ -> VideoFrameDecoder(result.source, options) }
}
```

비디오에서 추출할 프레임의 시간을 지정하려면 `videoFrameMillis` 또는 `videoFrameMicros`를 사용하세요:

```kotlin
imageView.load("/path/to/video.mp4") {
    videoFrameMillis(1000)  // 비디오의 1초 지점 프레임 추출
}
```

정확한 프레임 번호를 지정하려면 `videoFrameIndex`를 사용하세요(API 레벨 28 필요):

```kotlin
imageView.load("/path/to/video.mp4") {
    videoFrameIndex(1234)  // 비디오의 1234번째 프레임 추출
}
```

비디오의 전체 재생 시간 비율을 기준으로 프레임을 선택하려면 `videoFramePercent`를 사용하세요:

```kotlin
imageView.load("/path/to/video.mp4") {
    videoFramePercent(0.5)  // 비디오 전체 재생 시간의 중간 지점 프레임 추출
}
```

프레임 위치를 지정하지 않으면 비디오의 첫 번째 프레임이 디코딩됩니다.