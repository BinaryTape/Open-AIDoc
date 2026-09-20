# SVGs

SVG 지원을 추가하려면 확장 라이브러리를 추가하세요:

```kotlin
implementation("io.coil-kt.coil3:coil-svg:3.6.3")
```

이것으로 끝입니다! `ImageLoader`가 자동으로 모든 SVG를 감지하고 디코딩합니다. Coil은 파일의 처음 1 KB에서 `<svg ` 마커를 찾아 SVG를 감지하며, 이는 대부분의 경우를 처리할 수 있습니다. 만약 SVG가 자동으로 감지되지 않는다면, 요청 시 `Decoder`를 명시적으로 설정할 수 있습니다:

```kotlin
imageView.load("/path/to/svg") {
    decoderFactory { result, options, _ -> SvgDecoder(result.source, options) }
}
```

선택 사항으로, `ImageLoader`를 구성할 때 컴포넌트 레지스트리(component registry)에 디코더를 수동으로 추가할 수도 있습니다:

```kotlin
val imageLoader = ImageLoader.Builder(context)
    .components {
        add(SvgDecoder.Factory())
    }
    .build()