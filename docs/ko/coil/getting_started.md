# 시작하기

## Compose UI {id="compose-ui"}

일반적인 Compose UI 프로젝트에서는 다음을 임포트합니다:

```kotlin
implementation("io.coil-kt.coil3:coil-compose:3.6.3")
implementation("io.coil-kt.coil3:coil-network-okhttp:3.6.3")
```

임포트가 완료되면 `AsyncImage`를 사용하여 네트워크에서 이미지를 로드할 수 있습니다:

```kotlin
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
)
```

!!! Note
    Compose Multiplatform을 사용하는 경우 OkHttp 대신 Ktor를 사용해야 합니다. 자세한 방법은 [여기](network.md#ktor-network-engines)를 참고하세요.

## Android View {id="android-views"}

Compose UI 대신 Android View를 사용한다면 다음을 임포트하세요:

```kotlin
implementation("io.coil-kt.coil3:coil:3.6.3")
implementation("io.coil-kt.coil3:coil-network-okhttp:3.6.3")
```

임포트가 완료되면 `ImageView.load` 확장 함수를 사용하여 네트워크에서 이미지를 로드할 수 있습니다:

```kotlin
imageView.load("https://example.com/image.jpg")
```

## 싱글톤 ImageLoader 설정하기 {id="configuring-the-singleton-imageloader"}

기본적으로 Coil은 싱글톤 `ImageLoader`를 포함하고 있습니다. `ImageLoader`는 들어오는 `ImageRequest`를 가져오기(fetching), 디코딩(decoding), 캐싱(caching)하여 그 결과를 반환하는 방식으로 실행합니다. `ImageLoader`를 직접 설정할 필요는 없습니다. 별도로 설정하지 않으면 Coil이 기본 설정으로 싱글톤 `ImageLoader`를 생성합니다.

여러 가지 방법으로 설정할 수 있습니다 (**하나만 선택하세요**):

- 앱의 진입점(앱의 루트 `@Composable`) 근처에서 `setSingletonImageLoaderFactory`를 호출하세요. **이 방법은 Compose Multiplatform 앱에 가장 적합합니다.**

```kotlin
setSingletonImageLoaderFactory { context ->
    ImageLoader.Builder(context)
        .crossfade(true)
        .build()
}
```

- Android의 [`Application`](https://developer.android.com/reference/android/app/Application)에서 `SingletonImageLoader.Factory`를 구현하세요. **이 방법은 Android 앱에 가장 적합합니다.**

```kotlin
class CustomApplication : Application(), SingletonImageLoader.Factory {
    override fun newImageLoader(context: Context): ImageLoader {
        return ImageLoader.Builder(context)
            .crossfade(true)
            .build()
    }
}
```

- 앱의 진입점(예: Android의 `Application.onCreate`) 근처에서 `SingletonImageLoader.setSafe`를 호출하세요. 이 방법이 가장 유연합니다.

```kotlin
SingletonImageLoader.setSafe { context ->
    ImageLoader.Builder(context)
        .crossfade(true)
        .build()
}
```

!!! Note
    Coil에 의존하는 라이브러리를 작성 중이라면 싱글톤 `ImageLoader`를 가져오거나 설정해서는 안 됩니다. 대신 `io.coil-kt.coil3:coil-core`에 의존하고, 자체 `ImageLoader`를 만들어 직접 전달해야 합니다. 라이브러리에서 싱글톤 `ImageLoader`를 설정하면, 해당 라이브러리를 사용하는 앱에서도 Coil을 사용할 경우 앱이 설정한 `ImageLoader`를 덮어씌울 위험이 있습니다.

## 이미지 {id="images"}

멀티플랫폼 렌더링을 지원하기 위해 Coil 3.x는 커스텀 `coil3.Image` 클래스를 사용합니다. 이는 Android의 `Drawable`을 대체하지만, 다음과 같이 완벽하게 상호 호환됩니다:

```kotlin
val drawable = image.asDrawable(resources)
val image = drawable.asImage()
```

또한 Coil은 `coil3.Bitmap` 클래스를 정의하고 있는데, 이는 Android에서는 `android.graphics.Bitmap`, Android 이외의 플랫폼에서는 `org.jetbrains.skia.Bitmap`에 대한 타입 별칭(type alias)입니다:

```kotlin
val bitmap = image.toBitmap()
val image = bitmap.asImage()
```

Compose UI의 `Painter` 클래스와도 상호 호환됩니다. 이 확장 함수를 사용하려면 `coil-compose-core` 아티팩트를 임포트해야 합니다:

```kotlin
val painter = image.asPainter()
```

!!! Note
    `Painter`는 컴포지션(composition) 내부에서만 렌더링될 수 있는 반면, `Image`는 모든 `Canvas`에서 렌더링될 수 있어야 하므로 `Painter`를 `Image`로 변환할 수는 없습니다.

## 아티팩트 {id="artifacts"}

다음은 Coil이 `mavenCentral()`에 배포한 주요 아티팩트 목록입니다:

* `io.coil-kt.coil3:coil`: 기본 아티팩트로 `io.coil-kt.coil3:coil-core`에 의존합니다. 싱글톤 `ImageLoader`와 관련 확장 함수를 포함합니다.
* `io.coil-kt.coil3:coil-core`: `io.coil-kt.coil3:coil`의 하위 집합으로, 싱글톤 `ImageLoader`와 관련 확장 함수를 **포함하지 않습니다**.
* `io.coil-kt.coil3:coil-compose`: 기본 [Compose UI](https://www.jetbrains.com/compose-multiplatform/) 아티팩트로 `io.coil-kt.coil3:coil` 및 `io.coil-kt.coil3:coil-compose-core`에 의존합니다. 싱글톤 `ImageLoader`를 사용하는 `AsyncImage`, `rememberAsyncImagePainter`, `SubcomposeAsyncImage` 오버로드를 포함합니다.
* `io.coil-kt.coil3:coil-compose-core`: `io.coil-kt.coil3:coil-compose`의 하위 집합으로, 싱글톤 `ImageLoader`에 의존하는 함수들을 포함하지 않습니다.
* `io.coil-kt.coil3:coil-network-okhttp`: [OkHttp](https://github.com/square/okhttp)를 사용하여 네트워크에서 이미지를 가져오는 기능을 지원합니다.
* `io.coil-kt.coil3:coil-network-ktor2`: [Ktor 2](https://github.com/ktorio/ktor)를 사용하여 네트워크에서 이미지를 가져오는 기능을 지원합니다.
* `io.coil-kt.coil3:coil-network-ktor3`: [Ktor 3](https://github.com/ktorio/ktor)를 사용하여 네트워크에서 이미지를 가져오는 기능을 지원합니다.
* `io.coil-kt.coil3:coil-network-cache-control`: 네트워크에서 이미지를 가져올 때 [`Cache-Control` 헤더](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)를 준수하도록 지원합니다.
* `io.coil-kt.coil3:coil-gif`: GIF 디코딩을 지원하기 위한 두 개의 [디코더](/coil/api/coil-core/coil3.decode/-decoder)를 포함합니다. 자세한 내용은 [GIF](gifs.md)를 참고하세요.
* `io.coil-kt.coil3:coil-svg`: SVG 디코딩을 지원하기 위한 [디코더](/coil/api/coil-core/coil3.decode/-decoder)를 포함합니다. 자세한 내용은 [SVG](svgs.md)를 참고하세요.
* `io.coil-kt.coil3:coil-video`: [Android에서 지원하는 모든 비디오 형식](https://developer.android.com/guide/topics/media/media-formats#video-codecs)의 프레임 디코딩을 지원하기 위한 [디코더](/coil/api/coil-core/coil3.decode/-decoder)를 포함합니다. 자세한 내용은 [비디오](videos.md)를 참고하세요.
* `io.coil-kt.coil3:coil-test`: 테스트 지원을 위한 클래스들을 포함합니다. 자세한 내용은 [테스트](testing.md)를 참고하세요.
* `io.coil-kt.coil3:coil-bom`: [BOM(Bill of Materials)](https://docs.gradle.org/7.2/userguide/platforms.html#sub:bom_import)을 포함합니다. `coil-bom`을 임포트하면 버전을 지정하지 않고도 다른 Coil 아티팩트들에 의존할 수 있습니다.