# Coil 3.x로 업그레이드하기

Coil 3는 다음과 같은 여러 주요 개선 사항을 포함하는 Coil의 차세대 주요 버전입니다:

- 모든 주요 타겟(Android, iOS, JVM, JS 및 [WASM](/coil/overview))을 포함한 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)의 전체 지원.
- 여러 네트워킹 라이브러리(Ktor 및 OkHttp) 지원. 또는 로컬/정적 파일만 로드하면 되는 경우 네트워크 의존성 없이 Coil을 사용할 수 있습니다.
- 개선된 Compose `@Preview` 렌더링 및 `LocalAsyncImagePreviewHandler`를 통한 커스텀 프리뷰 동작 지원.
- 기존 동작을 변경해야 했던(breaking) 버그들에 대한 중요한 수정 사항(아래에 요약됨).

이 문서는 Coil 2에서 Coil 3로의 주요 변경 사항에 대한 상위 수준의 개요를 제공하고, 파괴적 변경(breaking changes) 또는 중요한 변경 사항을 강조합니다. 모든 바이너리 호환성 변경이나 사소한 동작 변경을 다루지는 않습니다.

Compose Multiplatform 프로젝트에서 Coil 3를 사용하시나요? 예제는 [`samples`](https://github.com/coil-kt/coil/tree/3.x/samples/compose) 저장소를 확인해 보세요.

## Maven 좌표 및 패키지 명

Coil의 Maven 좌표가 `io.coil-kt`에서 `io.coil-kt.coil3`로 업데이트되었으며, 패키지 명도 `coil`에서 `coil3`로 업데이트되었습니다. 이를 통해 Coil 3는 바이너리 호환성 문제 없이 Coil 2와 공존하여 실행될 수 있습니다. 예를 들어, `io.coil-kt:coil:2.7.0`은 이제 `io.coil-kt.coil3:coil:3.0.0`입니다.

`coil-base` 및 `coil-compose-base` 아티팩트(artifact)는 Coroutines, Ktor 및 AndroidX에서 사용하는 명명 규칙에 맞추기 위해 각각 `coil-core` 및 `coil-compose-core`로 이름이 변경되었습니다.

## 네트워크 이미지

**`coil-core`는 더 이상 기본적으로 네트워크에서 이미지 로딩을 지원하지 않습니다.** [Coil의 네트워크 아티팩트 중 하나에 대한 의존성을 추가해야 합니다. 자세한 내용은 여기를 참조하세요.](network.md). 이 변경은 사용자가 다른 네트워킹 라이브러리를 사용하거나, 앱에 네트워크 기능이 필요하지 않은 경우 네트워크 의존성을 피할 수 있도록 하기 위함입니다.

또한, 캐시 제어(cache control) 헤더가 더 이상 기본적으로 적용되지 않습니다. 자세한 내용은 [여기](network.md)를 참조하세요.

## 멀티플랫폼 (Multiplatform)

Coil 3는 이제 Android, JVM, iOS, macOS, Javascript 및 WASM을 지원하는 Kotlin Multiplatform 라이브러리입니다.

Android에서 Coil은 이미지를 렌더링하기 위해 표준 그래픽 클래스를 사용합니다. Android 이외의 플랫폼에서 Coil은 이미지를 렌더링하기 위해 [Skiko](https://github.com/JetBrains/skiko)를 사용합니다. Skiko는 Google에서 개발한 [Skia](https://github.com/google/skia) 그래픽 엔진을 래핑하는 Kotlin 바인딩 세트입니다.

Android SDK와의 분리 작업의 일환으로 여러 API 변경이 이루어졌습니다. 특히 다음과 같습니다:

- `Drawable`이 커스텀 `Image` 인터페이스로 대체되었습니다. Android에서 클래스 간 변환을 하려면 `Drawable.asImage()` 및 `Image.asDrawable(resources)`를 사용하세요. Android 이외의 플랫폼에서는 `Bitmap.asImage()` 및 `Image.toBitmap()`을 사용하세요.
- Android의 `android.net.Uri` 클래스 사용이 멀티플랫폼 `coil3.Uri` 클래스로 대체되었습니다. `android.net.Uri`를 `ImageRequest.data`로 전달하는 모든 호출 지점은 영향을 받지 않습니다. `android.net.Uri`를 받는 것에 의존하는 커스텀 `Fetcher`는 `coil3.Uri`를 사용하도록 업데이트해야 합니다.
- `Context` 사용이 `PlatformContext`로 대체되었습니다. `PlatformContext`는 Android에서 `Context`의 타입 별칭(type alias)이며, Android 이외의 플랫폼에서는 `PlatformContext.INSTANCE`를 사용하여 접근할 수 있습니다. Compose Multiplatform에서 참조를 가져오려면 `LocalPlatformContext.current`를 사용하세요.
- `Coil` 클래스의 이름이 `SingletonImageLoader`로 변경되었습니다.
- 커스텀 Android `Application` 클래스에서 `ImageLoaderFactory`를 구현하고 있다면, 이를 대체하는 `SingletonImageLoader.Factory` 구현으로 전환해야 합니다. `SingletonImageLoader.Factory`를 구현하면, 필요한 경우 `newImageLoader()`를 오버라이드할 수 있습니다.

`coil-svg` 아티팩트는 멀티플랫폼에서 지원되지만, `coil-gif` 및 `coil-video` 아티팩트는 특정 Android 디코더 및 라이브러리에 의존하기 때문에 (현재로서는) Android 전용으로 유지됩니다.

## Compose

`coil-compose` 아티팩트의 API는 거의 변경되지 않았습니다. Coil 2와 동일한 방식으로 `AsyncImage`, `SubcomposeAsyncImage`, `rememberAsyncImagePainter`를 계속 사용할 수 있습니다. 또한, 이러한 메서드들은 성능 향상을 위해 [재시작 가능(restartable) 및 건너뛰기 가능(skippable)](https://developer.android.com/jetpack/compose/performance/stability)하도록 업데이트되었습니다.

- `AsyncImagePainter.state`는 이제 `StateFlow`입니다. `val state = painter.state.collectAsState()`를 사용하여 관찰해야 합니다.
- `AsyncImagePainter`의 기본 `SizeResolver`는 더 이상 캔버스의 크기를 얻기 위해 첫 번째 `onDraw` 호출을 기다리지 않습니다. 대신, `AsyncImagePainter`는 기본값으로 `Size.ORIGINAL`을 사용합니다.
- Compose `modelEqualityDelegate` 델리게이트는 이제 `AsyncImage`/`SubcomposeAsyncImage`/`rememberAsyncImagePainter`의 파라미터 대신 `LocalAsyncImageModelEqualityDelegate`라는 컴포지션 로컬(composition local)을 통해 설정됩니다.

## 일반 사항 (General)

기타 중요한 동작 변경 사항은 다음과 같습니다:

- 퍼스트 파티 `Fetcher` 및 `Decoder`(예: `NetworkFetcher.Factory`, `SvgDecoder` 등)는 이제 서비스 로더(service loader)를 통해 각 새로운 `ImageLoader`에 자동으로 추가됩니다. 이 동작은 `ImageLoader.Builder.serviceLoaderEnabled(false)`로 비활성화할 수 있습니다.
- `android.resource://example.package.name/drawable/image` URI 지원이 중단되었습니다. 이는 리소스 축소(resource shrinking) 최적화를 방해하기 때문입니다. `R.drawable.image` 값을 직접 전달하는 것이 권장됩니다. 리소스 이름 대신 리소스 ID를 전달하는 방식은 여전히 작동합니다: `android.resource://example.package.name/12345678`. 여전히 해당 기능이 필요한 경우 [컴포넌트 레지스트리에 `ResourceUriMapper`를 수동으로 포함](https://github.com/coil-kt/coil/blob/da7d872e340430014dbc5136e35eb62f9b17662e/coil-core/src/androidInstrumentedTest/kotlin/coil3/map/ResourceUriMapper.kt)할 수 있습니다.
- 파일의 마지막 수정 타임스탬프가 더 이상 기본적으로 캐시 키에 추가되지 않습니다. 이는 (비록 매우 짧은 시간일지라도) 메인 스레드에서 디스크를 읽는 것을 피하기 위함입니다. 이는 `ImageRequest.Builder.addLastModifiedToFileCacheKey(true)` 또는 `ImageLoader.Builder.addLastModifiedToFileCacheKey(true)`로 다시 활성화할 수 있습니다.
- 실수로 인한 OOM(메모리 부족)을 방지하기 위해 출력 이미지 크기가 이제 4096x4096 미만으로 강제됩니다. 이는 `ImageLoader/ImageRequest.Builder.maxBitmapSize`로 설정할 수 있습니다. 이 동작을 비활성화하려면 `maxBitmapSize`를 `Size.ORIGINAL`로 설정하세요.
- Coil 2의 `Parameters` API가 `Extras`로 대체되었습니다. `Extras`는 문자열 키를 요구하지 않으며 대신 ID 일치 여부(identity equality)에 의존합니다. `Extras`는 메모리 캐시 키 수정을 지원하지 않습니다. 대신 extra가 메모리 캐시 키에 영향을 주는 경우 `ImageRequest.memoryCacheKeyExtra`를 사용하세요.
- 많은 `ImageRequest.Builder` 함수들이 멀티플랫폼을 더 쉽게 지원하기 위해 확장 함수(extension functions)로 이동되었습니다.