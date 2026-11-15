# Coil 3.x로 업그레이드하기

Coil 3는 다음과 같은 여러 주요 개선 사항이 포함된 Coil의 차기 메이저 버전입니다.

- 모든 주요 타깃(Android, iOS, JVM, JS 및 [WASM](https://coil-kt.github.io/coil/sample/))을 포함한 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) 전면 지원.
- 여러 네트워킹 라이브러리(Ktor 및 OkHttp) 지원. 또는 로컬/정적 파일만 로드하면 되는 경우 네트워크 의존성 없이 Coil을 사용할 수 있습니다.
- Compose `@Preview` 렌더링 개선 및 `LocalAsyncImagePreviewHandler`를 통한 커스텀 프리뷰 동작 지원.
- 기존 동작을 깨뜨려야(breaking) 해결할 수 있었던 중요 버그 수정(아래 내용 참조).

이 문서는 Coil 2에서 Coil 3로의 주요 변경 사항에 대한 대략적인 개요를 제공하고, 호환성을 깨뜨리는 주요 변경 사항(breaking changes)을 안내합니다. 모든 바이너리 비호환 변경 사항이나 사소한 동작 변경 사항을 다루지는 않습니다.

예제 프로젝트는 [Compose Multiplatform 샘플](https://github.com/coil-kt/coil/tree/main/samples/compose)을 참고하세요.

## Maven 좌표 및 패키지 이름 {id="maven-coordinates-and-package-name"}

Coil의 Maven 좌표가 `io.coil-kt`에서 `io.coil-kt.coil3`로 변경되었으며, 패키지 이름도 `coil`에서 `coil3`로 변경되었습니다. 이를 통해 바이너리 호환성 문제 없이 Coil 2와 Coil 3를 함께 실행할 수 있습니다. 예를 들어, `io.coil-kt:coil:2.7.0`은 이제 `io.coil-kt.coil3:coil:3.0.0`이 됩니다.

`coil-base` 및 `coil-compose-base` 아티팩트는 Coroutines, Ktor, AndroidX에서 사용하는 네이밍 규칙에 맞추기 위해 각각 `coil-core` 및 `coil-compose-core`로 이름이 변경되었습니다.

## 네트워크 이미지 {id="network-images"}

**`coil-core`는 더 이상 기본적으로 네트워크를 통한 이미지 로드를 지원하지 않습니다.** [Coil의 네트워크 아티팩트 중 하나에 대한 의존성을 추가해야 합니다. 자세한 내용은 여기를 참고하세요.](network.md). 이 변경 사항은 사용자가 다양한 네트워킹 라이브러리를 사용하거나, 앱에 네트워크 기능이 필요하지 않은 경우 네트워크 의존성을 제거할 수 있도록 하기 위함입니다.

또한 캐시 제어(cache control) 헤더가 더 이상 기본적으로 적용되지 않습니다. 자세한 내용은 [여기](network.md)를 참고하세요.

## 멀티플랫폼 {id="multiplatform"}

Coil 3는 이제 Android, JVM, iOS, macOS, Javascript 및 WASM을 지원하는 Kotlin Multiplatform 라이브러리입니다.

Android에서 Coil은 표준 그래픽 클래스를 사용하여 이미지를 렌더링합니다. Android 이외의 플랫폼에서 Coil은 [Skiko](https://github.com/JetBrains/skiko)를 사용하여 이미지를 렌더링합니다. Skiko는 Google에서 개발한 [Skia](https://github.com/google/skia) 그래픽 엔진을 래핑한 Kotlin 바인딩 세트입니다.

Android SDK와의 결합을 분리하는 과정에서 여러 API 변경이 이루어졌습니다. 주목할 만한 변경 사항은 다음과 같습니다.

- `Drawable`이 커스텀 `Image` 인터페이스로 대체되었습니다. Android에서는 클래스 간 변환을 위해 `Drawable.asImage()` 및 `Image.asDrawable(resources)`를 사용합니다. Android 이외의 플랫폼에서는 `Bitmap.asImage()` 및 `Image.toBitmap()`을 사용합니다.
- Android의 `android.net.Uri` 클래스 사용이 멀티플랫폼 `coil3.Uri` 클래스로 대체되었습니다. `ImageRequest.data`로 `android.net.Uri`를 전달하는 호출 코드는 영향을 받지 않습니다. `android.net.Uri` 수신에 의존하는 커스텀 `Fetcher`는 `coil3.Uri`를 사용하도록 업데이트해야 합니다.
- `Context` 사용이 `PlatformContext`로 대체되었습니다. `PlatformContext`는 Android에서는 `Context`의 타입 별칭(typealias)이며, Android 이외의 플랫폼에서는 `PlatformContext.INSTANCE`를 사용하여 접근할 수 있습니다. Compose Multiplatform에서는 `LocalPlatformContext.current`를 사용하여 참조를 가져옵니다.
- `Coil` 클래스의 이름이 `SingletonImageLoader`로 변경되었습니다.
- 커스텀 Android `Application` 클래스에서 `ImageLoaderFactory`를 구현하고 있다면, `ImageLoaderFactory` 대신 `SingletonImageLoader.Factory`를 구현하도록 변경해야 합니다. `SingletonImageLoader.Factory`를 구현하면 필요하거나 원하는 경우 `newImageLoader()`를 재정의할 수 있습니다.

`coil-svg` 아티팩트는 멀티플랫폼에서 지원되지만, `coil-gif` 및 `coil-video` 아티팩트는 특정 Android 디코더 및 라이브러리에 의존하므로 (현재로서는) Android 전용으로 유지됩니다.

## Compose {id="compose"}

`coil-compose` 아티팩트의 API는 거의 변경되지 않았습니다. `AsyncImage`, `SubcomposeAsyncImage`, `rememberAsyncImagePainter`를 Coil 2와 동일한 방식으로 계속 사용할 수 있습니다. 또한 성능 향상을 위해 이러한 메서드들이 [재시작 가능(restartable)하고 건너뛰기 가능(skippable)](https://developer.android.com/jetpack/compose/performance/stability)하도록 업데이트되었습니다.

- `AsyncImagePainter.state`가 이제 `StateFlow`입니다. `val state = painter.state.collectAsState()`를 사용하여 관찰해야 합니다.
- `AsyncImagePainter`의 기본 `SizeResolver`가 더 이상 캔버스 크기를 가져오기 위해 첫 번째 `onDraw` 호출을 기다리지 않습니다. 대신 `AsyncImagePainter`의 기본값은 `Size.ORIGINAL`입니다.
- Compose의 `modelEqualityDelegate` 델리게이트는 이제 `AsyncImage`/`SubcomposeAsyncImage`/`rememberAsyncImagePainter`의 매개변수가 아닌 컴포지션 로컬인 `LocalAsyncImageModelEqualityDelegate`를 통해 설정됩니다.

## 일반 {id="general"}

기타 중요한 동작 변경 사항은 다음과 같습니다.

- 퍼스트 파티 `Fetcher` 및 `Decoder`(예: `NetworkFetcher.Factory`, `SvgDecoder` 등)는 이제 서비스 로더(ServiceLoader)를 통해 새로운 `ImageLoader`마다 자동으로 추가됩니다. 이 동작은 `ImageLoader.Builder.serviceLoaderEnabled(false)`로 비활성화할 수 있습니다.
- 리소스 축소(Resource Shrinking) 최적화를 방해하므로 `android.resource://example.package.name/drawable/image` URI에 대한 지원이 제거되었습니다. `R.drawable.image` 값을 직접 전달하는 것을 권장합니다. 리소스 이름 대신 리소스 ID를 전달하는 방식은 계속 동작합니다: `android.resource://example.package.name/12345678`. 해당 기능이 여전히 필요한 경우 [컴포넌트 레지스트리에 `ResourceUriMapper`를 수동으로 포함](https://github.com/coil-kt/coil/blob/da7d872e340430014dbc5136e35eb62f9b17662e/coil-core/src/androidInstrumentedTest/kotlin/coil3/map/ResourceUriMapper.kt)할 수 있습니다.
- 파일의 마지막 수정 타임스탬프가 더 이상 기본적으로 캐시 키에 추가되지 않습니다. 이는 (매우 짧은 시간이라도) 메인 스레드에서 디스크를 읽는 것을 방지하기 위함입니다. `ImageRequest.Builder.addLastModifiedToFileCacheKey(true)` 또는 `ImageLoader.Builder.addLastModifiedToFileCacheKey(true)`를 통해 다시 활성화할 수 있습니다.
- 의도치 않은 OOM(Out of Memory)을 방지하기 위해 출력 이미지 크기가 4096x4096 미만으로 강제 제한됩니다. 이 설정은 `ImageLoader/ImageRequest.Builder.maxBitmapSize`로 구성할 수 있습니다. 이 동작을 비활성화하려면 `maxBitmapSize`를 `Size.ORIGINAL`로 설정하세요.
- Coil 2의 `Parameters` API가 `Extras`로 대체되었습니다. `Extras`는 문자열 키를 필요로 하지 않으며 동일성 비교(identity equality)에 의존합니다. `Extras`는 메모리 캐시 키 수정을 지원하지 않습니다. 대신 추가 데이터(extra)가 메모리 캐시 키에 영향을 미치는 경우 `ImageRequest.memoryCacheKeyExtra`를 사용하세요.
- 멀티플랫폼을 더 쉽게 지원하기 위해 다수의 `ImageRequest.Builder` 함수가 확장 함수로 이동되었습니다.