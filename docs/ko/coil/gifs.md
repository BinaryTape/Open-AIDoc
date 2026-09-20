# GIF

**이 기능은 Android에서만 사용할 수 있습니다.**

Glide와 달리 GIF는 기본적으로 지원되지 않습니다. 하지만 Coil은 이를 지원하기 위한 확장 라이브러리를 제공합니다.

GIF 지원을 추가하려면 확장 라이브러리를 임포트하세요:

```kotlin
implementation("io.coil-kt.coil3:coil-gif:3.6.3")
```

이것으로 설정이 완료되었습니다! `ImageLoader`는 파일 헤더를 사용하여 모든 GIF를 자동으로 감지하고 올바르게 디코딩합니다.

선택적으로, `ImageLoader`를 생성할 때 컴포넌트 레지스트리에 디코더를 수동으로 추가할 수도 있습니다:

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

GIF 각 프레임의 픽셀 데이터를 변환하려면 [AnimatedTransformation](/coil/api/coil-gif/coil3.gif/-animated-transformation)을 참고하세요.

!!! Note
    Coil은 GIF 디코딩을 지원하기 위해 두 개의 별도 디코더를 포함하고 있습니다. `GifDecoder`는 모든 API 레벨을 지원하지만 속도가 더 느립니다. `AnimatedImageDecoder`는 API 28 이상에서만 사용할 수 있는 Android의 [ImageDecoder](https://developer.android.com/reference/android/graphics/ImageDecoder) API를 기반으로 동작합니다. `AnimatedImageDecoder`는 `GifDecoder`보다 빠르며, 애니메이션 WebP 이미지 및 애니메이션 HEIF 이미지 시퀀스 디코딩을 지원합니다.