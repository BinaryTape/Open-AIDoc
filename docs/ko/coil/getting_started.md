# 시작하기

## Compose UI {id="compose-ui"}

일반적인 Compose UI 프로젝트에서는 다음을 추가(import)합니다:

```kotlin
implementation("io.coil-kt.coil3:coil-compose:3.6.3")
implementation("io.coil-kt.coil3:coil-network-okhttp:3.6.3")
```

추가한 후에는 `AsyncImage`를 사용하여 네트워크에서 이미지를 로드할 수 있습니다:

```kotlin
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
)
```

!!! Note
    OkHttp는 Android 및 데스크톱 JVM을 지원합니다. iOS나 웹도 타깃으로 하는 공유 네트워킹 코드는 [Ktor network engines](network.md#ktor-network-engines)를 참조하세요.

## Android Views {id="android-views"}

Compose UI 대신 Android View를 사용하는 경우 다음을 추가합니다:

```kotlin
implementation("io.coil-kt.coil3:coil:3.6.3")
implementation("io.coil-kt.coil3:coil-network-okhttp:3.6.3")
```

추가한 후에는 `ImageView.load` 확장 함수를 사용하여 네트워크에서 이미지를 로드할 수 있습니다:

```kotlin
imageView.load("https://example.com/image.jpg")
```

## 싱글톤 ImageLoader 설정하기 {id="configuring-the-singleton-imageloader"}

기본적으로 Coil에는 싱글톤 `ImageLoader`가 포함되어 있습니다. `ImageLoader`는 가져오기(fetching), 디코딩, 캐싱 및 결과 반환을 통해 전달된 `ImageRequest`를 실행합니다. `ImageLoader`를 직접 구성하지 않아도 되며, 별도로 설정하지 않으면 Coil이 기본 구성으로 싱글톤 `ImageLoader`를 생성합니다.

여러 가지 방법으로 설정할 수 있습니다(**한 가지만 선택하세요**):

- 앱의 진입점(앱의 루트 `@Composable`) 부근에서 `setSingletonImageLoaderFactory`를 호출합니다. **Compose Multiplatform 앱에 가장 적합합니다.**

```kotlin
setSingletonImageLoaderFactory { context ->
    ImageLoader.Builder(context)
        .crossfade(true)
        .build()
}
```

- Android의 [`Application`](https://developer.android.com/reference/android/app/Application)에서 `SingletonImageLoader.Factory`를 구현합니다. **Android 앱에 가장 적합합니다.**

```kotlin
class CustomApplication : Application(), SingletonImageLoader.Factory {
    override fun newImageLoader(context: Context): ImageLoader {
        return ImageLoader.Builder(context)
            .crossfade(true)
            .build()
    }
}
```

- 앱의 진입점 부근(예: Android의 `Application.onCreate`)에서 `SingletonImageLoader.setSafe`를 호출합니다. 가장 유연한 방식입니다.

```kotlin
SingletonImageLoader.setSafe { context ->
    ImageLoader.Builder(context)
        .crossfade(true)
        .build()
}
```

!!! Note
    Coil에 의존하는 라이브러리를 작성하는 경우, 싱글톤 `ImageLoader`를 가져오거나(get) 설정(set)해서는 안 됩니다. 대신 `io.coil-kt.coil3:coil-core`에 의존하고, 자체 `ImageLoader`를 생성하여 직접 전달해야 합니다. 라이브러리에서 싱글톤 `ImageLoader`를 설정하면, 해당 라이브러리를 사용하는 앱 역시 Coil을 사용할 때 앱이 설정한 `ImageLoader`를 덮어쓸 위험이 있습니다.

## 이미지 {id="images"}

멀티플랫폼 렌더링을 지원하기 위해 Coil 3.x는 커스텀 `coil3.Image` 클래스를 사용합니다. 이는 Android의 `Drawable`을 대체하지만 완벽하게 상호 운용(interoperable)됩니다:

```kotlin
val drawable = image.asDrawable(resources)
val image = drawable.asImage()
```

또한 Coil은 `coil3.Bitmap` 클래스를 정의하고 있으며, 이는 Android에서는 `android.graphics.Bitmap`, 비 Android 플랫폼에서는 `org.jetbrains.skia.Bitmap`의 타입 에일리어스(type alias)입니다:

```kotlin
val bitmap = image.toBitmap()
val image = bitmap.asImage()
```

Compose UI의 `Painter` 클래스와도 상호 운용이 가능합니다. 이 확장 함수를 사용하려면 `coil-compose-core` 아티팩트를 추가해야 합니다:

```kotlin
val painter = image.asPainter(LocalPlatformContext.current)
```

!!! Note
    `Painter`는 컴포지션 내부에서만 렌더링될 수 있는 반면 `Image`는 모든 `Canvas`에서 렌더링될 수 있어야 하므로, `Painter`를 `Image`로 변환할 수는 없습니다.

## 아티팩트 {id="artifacts"}

다음은 Coil이 `mavenCentral()`에 배포한 주요 아티팩트 목록입니다:

* `io.coil-kt.coil3:coil`: `io.coil-kt.coil3:coil-core`에 의존하는 기본 아티팩트입니다. 싱글톤 `ImageLoader` 및 관련 확장 함수를 포함합니다.
* `io.coil-kt.coil3:coil-core`: `io.coil-kt.coil3:coil`의 서브셋으로, 싱글톤 `ImageLoader` 및 관련 확장 함수를 **포함하지 않습니다**.
* `io.coil-kt.coil3:coil-compose`: `io.coil-kt.coil3:coil` 및 `io.coil-kt.coil3:coil-compose-core`에 의존하는 기본 [Compose UI](https://www.jetbrains.com/compose-multiplatform/) 아티팩트입니다. 싱글톤 `ImageLoader`를 사용하는 `AsyncImage`, `rememberAsyncImagePainter`, `SubcomposeAsyncImage` 오버로드를 포함합니다.
* `io.coil-kt.coil3:coil-compose-core`: `io.coil-kt.coil3:coil-compose`의 서브셋으로, 싱글톤 `ImageLoader`에 의존하는 함수를 포함하지 않습니다.
* `io.coil-kt.coil3:coil-network-okhttp`: [OkHttp](https://github.com/square/okhttp)를 사용하여 네트워크에서 이미지를 가져오는 지원을 포함합니다.
* `io.coil-kt.coil3:coil-network-ktor2`: [Ktor 2](https://github.com/ktorio/ktor)를 사용하여 네트워크에서 이미지를 가져오는 지원을 포함합니다.
* `io.coil-kt.coil3:coil-network-ktor3`: [Ktor 3](https://github.com/ktorio/ktor)를 사용하여 네트워크에서 이미지를 가져오는 지원을 포함합니다.
* `io.coil-kt.coil3:coil-network-httpengine`: Android의 [HttpEngine](https://developer.android.com/reference/android/net/http/HttpEngine)을 사용하여 네트워크에서 이미지를 가져오는 지원을 포함합니다. Android API 34 이상이 필요합니다.
* `io.coil-kt.coil3:coil-network-cache-control`: 네트워크에서 이미지를 가져올 때 [`Cache-Control` 헤더](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)를 준수하도록 지원합니다.
* `io.coil-kt.coil3:coil-gif`: GIF 디코딩을 지원하는 두 개의 [디코더](/coil/api/coil-core/coil3.decode/-decoder)를 포함합니다. 자세한 내용은 [GIFs](gifs.md)를 참조하세요.
* `io.coil-kt.coil3:coil-svg`: SVG 디코딩을 지원하는 [디코더](/coil/api/coil-core/coil3.decode/-decoder)를 포함합니다. 자세한 내용은 [SVGs](svgs.md)를 참조하세요.
* `io.coil-kt.coil3:coil-video`: [Android에서 지원하는 모든 비디오 포맷](https://developer.android.com/guide/topics/media/media-formats#video-codecs)에서 프레임을 디코딩할 수 있는 [디코더](/coil/api/coil-core/coil3.decode/-decoder)를 포함합니다. 자세한 내용은 [videos](videos.md)를 참조하세요.
* `io.coil-kt.coil3:coil-test`: 테스트 지원을 위한 클래스를 포함합니다. 자세한 내용은 [testing](testing.md)을 참조하세요.
* `io.coil-kt.coil3:coil-bom`: [BOM(Bill of Materials)](https://docs.gradle.org/7.2/userguide/platforms.html#sub:bom_import)을 포함합니다. `coil-bom`을 가져오면 버전을 명시하지 않고도 다른 Coil 아티팩트에 의존할 수 있습니다.