# 변경 로그 (Changelog)

## [3.6.3] - 2026년 9월 18일 {id="3-6-3-september-18-2026"}

- Kotlin 모듈 이름 메타데이터의 잘못된 문자로 인해 Android Gradle 플러그인 9.4.0 및 R8을 사용하는 빌드가 실패하던 문제를 수정했습니다.

## [3.6.2] - 2026년 9월 4일 {id="3-6-2-september-4-2026"}

- 대기 중인 요청이 취소될 경우 `DeDupeConcurrentRequestStrategy`에서 특정 키에 대한 요청이 중단(hang)되던 문제를 수정했습니다. ([#3566](https://github.com/coil-kt/coil/pull/3566))
- Compose Multiplatform 1.13 사용 시 발생하는 JS/WASM 링키지 오류를 수정했습니다. ([#3568](https://github.com/coil-kt/coil/pull/3568))

## [3.6.1] - 2026년 9월 1일 {id="3-6-1-september-1-2026"}

- ES 모듈이 활성화되었을 때 JS 빌드가 실패하던 문제를 수정했습니다. ([#3558](https://github.com/coil-kt/coil/pull/3558))

## [3.6.0] - 2026년 8월 26일 {id="3-6-0-august-26-2026"}

- **신규**: JS/WASM에서 `blob:` URL(오브젝트 URL) 로딩 지원을 추가했습니다. ([#3504](https://github.com/coil-kt/coil/pull/3504))
- **신규**: Android의 `StaticImageDecoder`가 불완전한(partial) 이미지를 허용할지 여부를 구성할 수 있는 `ImageRequest.Builder.allowPartialImage` 및 `ImageLoader.Builder.allowPartialImage`를 추가했습니다. 기본적으로 활성화되어 있으며, 이는 이전 Coil 릴리스와 동일한 동작입니다. ([#3494](https://github.com/coil-kt/coil/pull/3494))
- `AsyncImage`가 반전된 제약 조건(inverted constraints)으로 측정될 때 비정상 종료(crash)되던 문제를 수정했습니다. ([#3470](https://github.com/coil-kt/coil/pull/3470))
- GIF를 포함하여 Drawable 기반 이미지에 Compose `filterQuality`가 적용되지 않던 문제를 수정했습니다. ([#3469](https://github.com/coil-kt/coil/pull/3469))
- JS/WASM 이미지 디코더의 메모리 누수를 수정했습니다. ([#3503](https://github.com/coil-kt/coil/pull/3503))
- R8 9.0+ 최적화 빌드에서 `GenericViewTarget`을 사용할 때 이미지가 렌더링되지 않던 문제를 수정했습니다. ([#3518](https://github.com/coil-kt/coil/pull/3518))
- JVM에서 사용 가능한 메모리를 512MB로 가정하는 대신 `Runtime.maxMemory()`를 사용하여 최대 메모리 캐시 크기를 결정하도록 변경했습니다. ([#3458](https://github.com/coil-kt/coil/pull/3458))
- Android가 아닌 JVM 아티팩트에 ProGuard 규칙을 번들로 포함했습니다. ([#3476](https://github.com/coil-kt/coil/pull/3476))
- Android 컴파일 SDK를 37로 업데이트했습니다.
- Kotlin을 2.4.10으로 업데이트했습니다.
- Compose를 1.12.0으로 업데이트했습니다.
- Okio를 3.18.1로 업데이트했습니다.
- Skiko를 0.150.1로 업데이트했습니다.
- `kotlinx-io-okio`를 0.9.1로 업데이트했습니다.

## [3.5.0] - 2026년 6월 10일 {id="3-5-0-june-10-2026"}

`3.4.0` 이후 변경 사항:

- **중요**: `iosX64` 및 `macosX64` 타깃을 제거했습니다. ([#3386](https://github.com/coil-kt/coil/pull/3386))
- **중요**: Android 최소 SDK 버전을 23으로 상향 조정했습니다. ([#3283](https://github.com/coil-kt/coil/pull/3283))
- **신규**: 전체 Skia 디코드로 폴백되는 것을 방지하기 위해 JS/WASM에서 빠른 WebP 크기 추출 기능을 추가했습니다. ([#3341](https://github.com/coil-kt/coil/pull/3341))
- `ImageLoader.Builder.memoryCacheMaxSizePercentWhileInBackground`에서 실험적(experimental) 애너테이션을 제거했습니다. ([#3439](https://github.com/coil-kt/coil/pull/3439))
- `CacheStrategy` 구현체에서 캐시된 실패 응답(예: 만료된 캐시 `404` 응답)을 갱신할 수 없던 문제를 수정했습니다. ([#3401](https://github.com/coil-kt/coil/pull/3401))
- 코루틴 컨텍스트에서 `CoroutineDispatcher` 대신 `ContinuationInterceptor`를 조회하도록 변경했습니다. ([#3415](https://github.com/coil-kt/coil/pull/3415))
- Android 컴파일 SDK를 36으로 업데이트했습니다.
- Kotlin 언어 버전을 2.2로 업데이트했습니다.
- Kotlin을 2.4.0으로 업데이트했습니다.
- Compose를 1.11.1로 업데이트했습니다.
- Okio를 3.17.0으로 업데이트했습니다.
- Skiko를 0.144.6으로 업데이트했습니다.
- `androidx.annotation`을 1.10.0으로 업데이트했습니다.

`3.5.0-beta01` 이후 변경 사항:

- `ImageLoader.Builder.memoryCacheMaxSizePercentWhileInBackground`에서 실험적 애너테이션을 제거했습니다. ([#3439](https://github.com/coil-kt/coil/pull/3439))
- 코루틴 컨텍스트에서 `CoroutineDispatcher` 대신 `ContinuationInterceptor`를 조회하도록 변경했습니다. ([#3415](https://github.com/coil-kt/coil/pull/3415))
- Kotlin 언어 버전을 2.2로 업데이트했습니다.
- Kotlin을 2.4.0으로 업데이트했습니다.
- Compose를 1.11.1로 업데이트했습니다.
- Skiko를 0.144.6으로 업데이트했습니다.

## [3.5.0-beta01] - 2026년 5월 4일 {id="3-5-0-beta01-may-4-2026"}

- `iosX64` 및 `macosX64` 타깃을 제거했습니다. ([#3386](https://github.com/coil-kt/coil/pull/3386))
- Android 최소 SDK 버전을 23으로 상향 조정했습니다. ([#3283](https://github.com/coil-kt/coil/pull/3283))
- 전체 Skia 디코드로 폴백되는 것을 방지하기 위해 JS/WASM에서 빠른 WebP 크기 추출 기능을 추가했습니다. ([#3341](https://github.com/coil-kt/coil/pull/3341))
- `CacheStrategy` 구현체에서 캐시된 실패 응답(예: 만료된 캐시 `404` 응답)을 갱신할 수 없던 문제를 수정했습니다. ([#3401](https://github.com/coil-kt/coil/pull/3401))
- 컴파일 SDK를 36으로 업데이트했습니다.
- Kotlin을 2.3.21로 업데이트했습니다.
- Compose를 1.11.0-beta03으로 업데이트했습니다.
- Okio를 3.17.0으로 업데이트했습니다.
- Skiko를 0.144.5로 업데이트했습니다.
- `androidx.annotation`을 1.10.0으로 업데이트했습니다.

## [3.4.0] - 2026년 2월 24일 {id="3-4-0-february-24-2026"}

- **신규**: 동일한 키에 대해 진행 중인(in-flight) 네트워크 요청을 병합할 수 있도록 `ConcurrentRequestStrategy`를 추가했습니다. ([#2995](https://github.com/coil-kt/coil/pull/2995), [#3326](https://github.com/coil-kt/coil/pull/3326))
    - `DeDupeConcurrentRequestStrategy`는 이 동작을 활성화하며, 대기자가 진행 중인 네트워크 요청의 결과를 기다릴 수 있도록 합니다.
        - 이 동작은 실험적이며 현재 기본적으로 비활성화되어 있습니다.
        - 현재 요청은 항상 `diskCacheKey`를 기반으로 결합됩니다.
    - `OkHttpNetworkFetcherFactory`, `KtorNetworkFetcherFactory`, `NetworkFetcher.Factory`에서 이제 `concurrentRequestStrategy`를 허용합니다.
- **신규**: 브라우저 메인 스레드가 차단되는 것을 방지하기 위해 웹 워커(Web Worker)를 사용하여 JS/WASM에서 이미지를 디코딩합니다. ([#3305](https://github.com/coil-kt/coil/pull/3305))
- **신규**: Compose가 아닌 멀티플랫폼 아티팩트에 대해 Linux 네이티브 타깃(`linuxX64` 및 `linuxArm64`) 지원을 추가했습니다. ([#3054](https://github.com/coil-kt/coil/pull/3054))
- **신규**: 후속 요청 간의 전환(transition)을 개선하기 위한 Compose 전용 API를 추가했습니다. ([#3141](https://github.com/coil-kt/coil/pull/3141), [#3175](https://github.com/coil-kt/coil/pull/3175))
    - `ImageRequest.Builder.useExistingImageAsPlaceholder`는 플레이스홀더가 설정되지 않았을 때 이전 이미지로부터 크로스페이드(crossfade)되도록 지원합니다.
    - `ImageRequest.Builder.preferEndFirstIntrinsicSize`는 `CrossfadePainter`가 최종(end) 페인터의 고유 크기(intrinsic size)를 우선하도록 합니다.
- **신규**: 애니메이션 이미지의 전역 반복 횟수를 설정할 수 있도록 `coil-gif`에 `ImageLoader.Builder.repeatCount(Int)`를 추가했습니다. ([#3143](https://github.com/coil-kt/coil/pull/3143))
- **신규**: `coil-video`에서 임베디드 비디오 썸네일을 우선 사용하는 지원을 추가했습니다. ([#3107](https://github.com/coil-kt/coil/pull/3107))
- **신규**: `coil-lint`를 `coil-core`와 함께 배포하고, `ImageRequest.Builder` 블록 내에서 실수로 호출된 `kotlin.error()`를 감지하는 린트 검사를 추가했습니다. ([#3304](https://github.com/coil-kt/coil/pull/3304))
- Kotlin 언어 버전을 2.1로 설정했습니다. ([#3302](https://github.com/coil-kt/coil/pull/3302))
- 공통(common) 코드에서 `BitmapFetcher`를 사용할 수 있도록 했습니다. ([#3286](https://github.com/coil-kt/coil/pull/3286))
- Android에서 싱글톤 `ImageLoader`를 생성할 때 `applicationContext`를 사용하도록 했습니다. ([#3246](https://github.com/coil-kt/coil/pull/3246))
- 캐시 가능한 2xx 이외의 HTTP 응답(예: `404`)을 기본적으로 캐시하고, 캐시 불가능한 응답(예: `500`)은 캐시하지 않도록 변경했습니다. ([#3137](https://github.com/coil-kt/coil/pull/3137), [#3139](https://github.com/coil-kt/coil/pull/3139))
- OkHttp 응답 본문을 소비할 때 발생할 수 있는 잠재적 경쟁 상태(race condition)를 수정했습니다. ([#3186](https://github.com/coil-kt/coil/pull/3186))
- Android에서 과도한 크기의 비트맵으로 인한 비정상 종료를 방지하기 위해 `maxBitmapSize` 엣지 케이스를 수정했습니다. ([#3259](https://github.com/coil-kt/coil/pull/3259))
- Kotlin을 2.3.10으로 업데이트했습니다.
- Compose를 1.9.3으로 업데이트했습니다.
- Okio를 3.16.4로 업데이트했습니다.
- Skiko를 0.9.22.2로 업데이트했습니다.
- `kotlinx-io-okio`를 0.9.0으로 업데이트했습니다.
- `androidx.core`를 1.16.0으로 업데이트했습니다.
- `androidx.lifecycle`을 2.9.4로 업데이트했습니다.
- `androidx.exifinterface`를 1.4.2로 업데이트했습니다.

## [3.3.0] - 2025년 7월 22일 {id="3-3-0-july-22-2025"}

- **신규**: 앱이 백그라운드 상태일 때 Android에서 `MemoryCache.maxSize`를 제한하는 새로운 API를 도입했습니다.
    - `ImageLoader.Builder.memoryCacheMaxSizePercentWhileInBackground`가 설정되어 있으면, 앱이 백그라운드에 있는 동안 `ImageLoader`의 메모리 캐시가 최대 크기의 일정 비율로 제한됩니다. 이 설정은 현재 기본적으로 비활성화되어 있습니다.
    - 앱이 백그라운드로 전환될 때 제한된 최대 크기에 도달하도록 메모리 캐시에서 이미지가 정리(trim)되지만, 최근 정리된 이미지에 대한 메모리 캐시의 약한 참조(weak reference)는 영향을 받지 않습니다. 즉, 이미지가 현재 다른 곳(예: `AsyncImage`, `ImageView` 등)에서 참조되고 있다면 메모리 캐시에 계속 유지됩니다.
    - 이 API는 백그라운드 메모리 사용량을 줄여 앱이 조기에 종료되는 것을 방지하고, 사용자 기기의 메모리 부담을 줄이는 데 유용합니다.
- **신규**: `SvgDecoder`에 `Svg.Parser` 인자를 추가했습니다.
    - 기본 SVG 파서가 요구 사항을 충족하지 못하는 경우 커스텀 SVG 파서를 사용할 수 있습니다.
- 커스텀 밀도 배율(density multiplier) 제공을 지원하기 위해 `SvgDecoder`에 `density` 인자를 추가했습니다.
- `Uri`의 복사 및 수정을 지원하기 위해 `Uri.Builder`를 추가했습니다.
- 테스트에서 Coil의 `Dispatchers.main.immediate` 사용을 재정의(override)할 수 있도록 `ImageLoader.Builder.mainCoroutineContext`를 추가했습니다.
- 애니메이션 종료 시 `start` 이미지의 참조가 해제될 때 `CrossfadePainter.intrinsicSize`가 변경되던 문제를 수정했습니다. 이는 `CrossfadeDrawable`의 동작과 일치합니다.
- Java에서 `ImageLoaders.executeBlocking`에 접근할 수 없던 문제를 수정했습니다.
- `coil-network-ktor3`에서 `kotlinx.io`의 Okio 상호 운용(interop) 모듈을 사용하도록 변경했습니다.
- `kotlinx-datetime`을 `0.7.1`로 업데이트했습니다.
    - 이 릴리스에는 `coil-network-cache-control` 모듈에만 영향을 미치는 바이너리 비호환 변경 사항이 포함되어 있습니다. 자세한 내용은 [여기](https://github.com/Kotlin/kotlinx-datetime?tab=readme-ov-file#deprecation-of-instant)를 참조하세요.
- Kotlin을 2.2.0으로 업데이트했습니다.
- Compose를 1.8.2로 업데이트했습니다.
- Okio를 3.15.0으로 업데이트했습니다.
- Skiko를 0.9.4.2로 업데이트했습니다.

## [3.2.0] - 2025년 5월 13일 {id="3-2-0-may-13-2025"}

`3.1.0` 이후 변경 사항:

- **중요**: Compose `1.8.0`의 요구 사항에 따라 `coil-compose` 및 `coil-compose-core`에 이제 Java 11 바이트코드가 필요합니다. 활성화 방법은 [여기](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8-or-java-11)를 참조하세요.
- `AsyncImagePreviewHandler`의 함수형 생성자가 `AsyncImagePainter.State.Loading` 대신 `AsyncImagePainter.State.Success`를 반환하도록 변경했습니다.
- `ConstraintsSizeResolver#size()`의 취소 동작을 수정했습니다.
- R8으로 빌드할 때 누락된 `PlatformContext`에 대한 경고를 수정했습니다.
- 기본 `FakeImageLoaderEngine` 응답이 반환될 때 `FakeImageLoaderEngine`이 `Transition.Factory.NONE`을 설정하지 않던 문제를 수정했습니다.
- `ColorImage`에서 실험적 애너테이션을 제거했습니다.
- `CacheControlCacheStrategy`에서 네트워크 헤더를 지연(lazily) 파싱하도록 변경했습니다.
- 공통 코드를 공유하도록 `CircleCropTransformation` 및 `RoundedCornersTransformation`을 리팩터링했습니다.
- `ExifOrientationStrategy`가 `RESPECT_PERFORMANCE`가 아닌 경우 내부적으로 `BitmapFactory`를 사용하도록 폴백합니다.
- Kotlin을 2.1.20으로 업데이트했습니다.
- Compose를 1.8.0으로 업데이트했습니다.
- Okio를 3.11.0으로 업데이트했습니다.
- Skiko를 0.9.4로 업데이트했습니다.
- Coroutines를 1.10.2로 업데이트했습니다.
- `accompanist-drawablepainter`를 0.37.3으로 업데이트했습니다.

`3.2.0-rc02` 이후 변경 사항:

- `ExifOrientationStrategy`가 `RESPECT_PERFORMANCE`가 아닌 경우 내부적으로 `BitmapFactory`를 사용하도록 폴백합니다.
- Compose를 1.8.0으로 업데이트했습니다.
- `accompanist-drawablepainter`를 0.37.3으로 업데이트했습니다.

## [3.2.0-rc02] - 2025년 4월 26일 {id="3-2-0-rc02-april-26-2025"}

- JVM이 아닌 타깃에서 `KtorNetworkFetcherFactory`(Ktor 3)로 이미지를 로드할 때 이미지 요청이 `ClosedByteChannelException`으로 실패하던 문제를 수정했습니다.

## [3.2.0-rc01] - 2025년 4월 24일 {id="3-2-0-rc01-april-24-2025"}

- **중요**: Compose `1.8.0`의 요구 사항에 따라 `coil-compose` 및 `coil-compose-core`에 이제 Java 11 바이트코드가 필요합니다. 활성화 방법은 [여기](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8-or-java-11)를 참조하세요.
- `AsyncImagePreviewHandler`의 함수형 생성자가 `AsyncImagePainter.State.Loading` 대신 `AsyncImagePainter.State.Success`를 반환하도록 변경했습니다.
- `ConstraintsSizeResolver#size()`의 취소 동작을 수정했습니다.
- R8으로 빌드할 때 누락된 `PlatformContext`에 대한 경고를 수정했습니다.
- 기본 `FakeImageLoaderEngine` 응답이 반환될 때 `FakeImageLoaderEngine`이 `Transition.Factory.NONE`을 설정하지 않던 문제를 수정했습니다.
- `ColorImage`에서 실험적 애너테이션을 제거했습니다.
- `CacheControlCacheStrategy`에서 네트워크 헤더를 지연 파싱하도록 변경했습니다.
- 공통 코드를 공유하도록 `CircleCropTransformation` 및 `RoundedCornersTransformation`을 리팩터링했습니다.
- `coil-network-ktor2` 및 `coil-network-ktor3`에서 `kotlinx.io`의 Okio 상호 운용 모듈을 사용하도록 변경했습니다.
- Kotlin을 2.1.20으로 업데이트했습니다.
- Compose를 1.8.0-rc01로 업데이트했습니다.
- Okio를 3.11.0으로 업데이트했습니다.
- Skiko를 0.9.4로 업데이트했습니다.
- Coroutines를 1.10.2로 업데이트했습니다.

## [3.1.0] - 2025년 2월 4일 {id="3-1-0-february-4-2025"}

- `AsyncImage` 성능을 개선했습니다.
    - 컴포저블의 인스턴스화 여부 또는 재사용 여부에 따라 런타임 성능이 25%~40% 향상되었습니다. 할당(allocation) 또한 35%~48% 감소했습니다. 자세한 정보는 [여기](https://github.com/coil-kt/coil/pull/2795)를 참조하세요.
- `ColorImage`를 추가하고 `FakeImage`를 지원 중단(deprecate)했습니다.
    - `ColorImage`는 테스트 및 미리보기에서 가짜 값을 반환하는 데 유용합니다. `FakeImage`와 동일한 사용 사례를 해결하지만, `coil-test` 대신 `coil-core`에서 더 쉽게 접근할 수 있습니다.
- `coil-compose-core`의 `Dispatchers.Main.immediate`에 대한 의존성을 제거했습니다.
    - 이를 통해 Paparazzi 및 Roborazzi 스크린샷 테스트에서 `AsyncImagePainter`가 `ImageRequest`를 동기적으로 실행하지 못하던 문제도 해결되었습니다.
- `data:[<mediatype>][;base64],<data>` 형식의 [데이터 URI](https://www.ietf.org/rfc/rfc2397.txt) 지원을 추가했습니다.
- GIF 메타데이터에 인코딩된 반복 횟수 사용을 지원하기 위해 `AnimatedImageDecoder.ENCODED_LOOP_COUNT`를 추가했습니다.
- 커스텀 확장을 지원하기 위해 `NetworkRequest`에 `Extras`를 추가했습니다.
- `DiskCache.Builder.cleanupCoroutineContext`를 추가하고 `DiskCache.Builder.cleanupDispatcher`를 지원 중단했습니다.
- API 29 이상에서 `android.graphics.ImageDecoder` 사용을 선택적으로 비활성화할 수 있도록 `ImageLoader.Builder.imageDecoderEnabled`를 추가했습니다.
- `ImageRequest`의 데이터 타입에 대해 등록된 `Keyer`가 없는 경우 경고를 기록하도록 했습니다.
- `CrossfadePainter`를 공개(public) API로 전환했습니다.
- 모든 멀티플랫폼 타깃에서 `Transformation`을 지원합니다.
- `CacheControlCacheStrategy`에서 `Expires` 헤더 값으로 0을 지원합니다.
- `ContentScale`이 `None`으로/에서 변경될 때 `AsyncImage`/`SubcomposeAsyncImage`/`rememberAsyncImage`가 새 `ImageRequest`를 시작하지 않던 문제를 수정했습니다.
- Kotlin을 2.1.10으로 업데이트했습니다.
    - 참고: [LLVM 업데이트](https://kotlinlang.org/docs/whatsnew21.html#llvm-update-from-11-1-0-to-16-0-0)로 인해 Kotlin Native를 사용하는 경우 본 릴리스는 Kotlin 2.1.0 이상으로 컴파일해야 합니다.
- Compose를 1.7.3으로 업데이트했습니다.
- `androidx.core`를 1.15.0으로 업데이트했습니다.

## [3.0.4] - 2024년 11월 25일 {id="3-0-4-november-25-2024"}

- Android Studio 미리보기에서 벡터 드로어블이 렌더링되지 않던 문제를 수정했습니다.
- 크기가 `maxBitmapSize`를 초과하는 요청에 대해 잠재적으로 메모리 캐시 미스가 발생하던 문제를 수정했습니다.
- Android에서 `FakeImage`가 렌더링되지 않던 문제를 수정했습니다.
- `AsyncImage`/`rememberAsyncImagePainter`/`SubcomposeAsyncImage`와 함께 사용할 때 요청의 `Transformation`이 변경되어도 새 이미지 요청이 시작되지 않던 문제를 수정했습니다.
- `ScaleDrawable` 및 `CrossfadeDrawable`이 틴트(tint) 상태를 준수하지 않던 문제를 수정했습니다.
- `ImageDecoder`가 불완전한 이미지 소스를 디코딩할 수 있도록 허용했습니다. 이는 `BitmapFactory`의 동작과 일치합니다.
- 디코딩 후 `Bitmap.prepareToDraw()`가 호출되지 않던 문제를 수정했습니다.
- `SvgDecoder`가 래스터화되지 않은 이미지에 대해 `isSampled = true`를 반환하지 않아야 하던 문제를 수정했습니다.
- 즉각적인 메인 디스패처를 사용할 수 없는 경우 Compose에서 `Dispatchers.Unconfined`로 폴백하도록 했습니다. 이는 미리보기/테스트 환경에서만 사용됩니다.
- Ktor 2를 `2.3.13`으로 업데이트했습니다.

## [3.0.3] - 2024년 11월 14일 {id="3-0-3-november-14-2024"}

- `ImageView`의 `ScaleType`을 기반으로 `ImageRequest.scale`을 설정하던 동작을 수정했습니다.
- 파일을 삭제한 후 `DiskCache`가 항목의 제거를 추적하지 못하던 엣지 케이스를 수정했습니다.
- 오류를 로깅할 때 `Logger`에 throwable을 전달하도록 했습니다.
- `kotlin-stdlib-jdk7` 및 `kotlin-stdlib-jdk8`을 `kotlin-stdlib`로 대체하지 않도록 했습니다.

## [3.0.2] - 2024년 11월 9일 {id="3-0-2-november-9-2024"}

- Android에서 커스텀 `CacheStrategy`를 사용하여 `OkHttpNetworkFetcherFactory`를 호출할 때 비정상 종료되던 문제를 수정했습니다.
- `CacheControlCacheStrategy`가 캐시 항목의 수명을 잘못 계산하던 문제를 수정했습니다.
- API 28 이상에서 `ImageRequest.bitmapConfig`가 `ARGB_8888` 또는 `HARDWARE`인 경우에만 적용되던 문제를 수정했습니다.

## [3.0.1] - 2024년 11월 7일 {id="3-0-1-november-7-2024"}

- 하드웨어 비트맵 기반의 `BitmapImage`로 `Image.toBitmap`을 호출할 때 비정상 종료되던 문제를 수정했습니다.
- `AsyncImageModelEqualityDelegate.Default`가 `ImageRequest`가 아닌 모델에 대해 동등성을 잘못 비교하던 문제를 수정했습니다.

## [3.0.0] - 2024년 11월 4일 {id="3-0-0-november-4-2024"}

Coil 3.0.0은 [Compose Multiplatform](https://www.jetbrains.com/compose-multiplatform/)을 완벽히 지원하는 Coil의 차세대 메이저 릴리스입니다.

[3.0.0의 모든 개선 사항 및 중요 변경 목록은 업그레이드 가이드를 확인하세요](https://coil-kt.github.io/coil/upgrading_to_coil3/).

`3.0.0-rc02` 이후 변경 사항:

- 남아 있던 지원 중단 메서드들을 제거했습니다.

## [3.0.0-rc02] - 2024년 10월 28일 {id="3-0-0-rc02-october-28-2024"}

[3.x의 모든 개선 사항 및 중요 변경 목록은 업그레이드 가이드를 확인하세요](https://coil-kt.github.io/coil/upgrading_to_coil3/). `3.0.0-rc01` 이후 변경 사항:

- `BlackholeDecoder`를 추가했습니다. 이를 통해 [디스크 캐시 전용 사전 로딩](https://coil-kt.github.io/coil/faq/#how-do-i-preload-an-image)이 단순화됩니다.
- `ConstraintsSizeResolver` 및 `DrawScopeSizeResolver`를 위한 `remember` 함수를 추가했습니다.
- `AsyncImage`의 매개변수에서 `EqualityDelegate`를 제거했습니다. 대신 `LocalAsyncImageModelEqualityDelegate`를 통해 설정해야 합니다.
- 부모 컴포저블이 `IntrinsicSize`를 사용할 때 `AsyncImage`가 렌더링되지 않던 문제를 수정했습니다.
- `AsyncImagePainter`에 자식 페인터가 없을 때 `AsyncImage`가 사용 가능한 제약 조건을 모두 채우던 문제를 수정했습니다.
- `EqualityDelegate`가 무시되어 상태를 관찰할 때 `rememberAsyncImagePainter`가 무한 재구성(recomposition)되던 문제를 수정했습니다.
- 특수 문자가 포함된 `File`/`Path` 경로 파싱 문제를 수정했습니다.
- `VideoFrameDecoder`에서 커스텀 `FileSystem` 구현체 사용 시 발생하던 문제를 수정했습니다.
- Ktor를 `3.0.0`으로 업데이트했습니다.
- `androidx.annotation`을 `1.9.0`으로 업데이트했습니다.

## [3.0.0-rc01] - 2024년 10월 8일 {id="3-0-0-rc01-october-8-2024"}

[3.x의 모든 개선 사항 및 중요 변경 목록은 업그레이드 가이드를 확인하세요](https://coil-kt.github.io/coil/upgrading_to_coil3/). `3.0.0-alpha10` 이후 변경 사항:

- **주요 변경 사항(BREAKING)**: `addLastModifiedToFileCacheKey`를 기본적으로 비활성화하고 요청별로 설정할 수 있도록 변경했습니다. 동일한 플래그로 기존 동작을 다시 활성화할 수 있습니다.
- **신규**: [`Cache-Control` 헤더](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) 지원을 구현하는 새로운 `coil-network-cache-control` 아티팩트를 도입했습니다.
- **신규**: `SvgDecoder.Factory`에 `scaleToDensity` 프로퍼티를 추가했습니다. 이 프로퍼티는 고유 치수를 가진 SVG가 기기 밀도에 곱해지도록 보장합니다(Android에서만 지원).
- `ExifOrientationPolicy`를 `ExifOrientationStrategy`로 이름을 변경했습니다.
- 공유 불가능한 이미지를 가져올 때 `MemoryCache`에서 제거하도록 했습니다.
- `ConstraintsSizeResolver`를 공개 API로 전환했습니다.
- `setSingletonImageLoaderFactory`를 안정화했습니다.
- `coil-network-ktor3`에서 최적화된 JVM I/O 함수를 복원했습니다.
- MIME 타입 목록에 `pdf`를 추가했습니다.
- 컴파일 SDK를 35로 업데이트했습니다.
- Kotlin을 2.0.20으로 업데이트했습니다.
- Okio를 3.9.1로 업데이트했습니다.

## [3.0.0-alpha10] - 2024년 8월 7일 {id="3-0-0-alpha10-august-7-2024"}

- **주요 변경 사항(BREAKING)**: `ImageLoader.Builder.networkObserverEnabled`를 `NetworkFetcher`를 위한 `ConnectivityChecker` 인터페이스로 대체했습니다.
    - 네트워크 관찰자를 비활성화하려면 `KtorNetworkFetcherFactory`/`OkHttpNetworkFetcherFactory`의 생성자에 `ConnectivityChecker.ONLINE`을 전달하세요.
- **신규**: 모든 플랫폼에서 [Compose Multiplatform 리소스](https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-images-resources.html) 로딩을 지원합니다. 리소스를 로드하려면 `Res.getUri`를 사용하세요:

```kotlin
AsyncImage(
    model = Res.getUri("drawable/image.jpg"),
    contentDescription = null,
)
```

- `ImageLoader` 및 `ImageRequest`에 `maxBitmapSize` 프로퍼티를 추가했습니다.
    - 이 프로퍼티의 기본값은 4096x4096이며, 할당된 비트맵 크기에 대한 안전한 상한을 제공합니다. 이를 통해 `Size.ORIGINAL`로 매우 큰 이미지를 실수로 로드하여 메모리 부족(out of memory) 예외가 발생하는 상황을 방지할 수 있습니다.
- 커스텀 정책을 지원할 수 있도록 `ExifOrientationPolicy`를 인터페이스로 변환했습니다.
- Windows 파일 경로에 대한 `Uri` 처리 문제를 수정했습니다.
- `Image` API에서 `@ExperimentalCoilApi`를 제거했습니다.
- Kotlin을 2.0.10으로 업데이트했습니다.

## [3.0.0-alpha09] - 2024년 7월 23일 {id="3-0-0-alpha09-july-23-2024"}

- **주요 변경 사항(BREAKING)**: `io.coil-kt.coil3:coil-network-ktor` 아티팩트의 이름을 Ktor 2.x에 의존하는 `io.coil-kt.coil3:coil-network-ktor2`로 변경했습니다. 또한, Ktor 3.x에 의존하는 `io.coil-kt.coil3:coil-network-ktor3`를 새로 도입했습니다. `wasmJs` 지원은 Ktor 3.x에서만 제공됩니다.
- **신규**: 이미지 요청을 수동으로 재시작할 수 있는 `AsyncImagePainter.restart()`를 추가했습니다.
- `NetworkClient` 및 관련 클래스에서 `@ExperimentalCoilApi`를 제거했습니다.
- 불필요한 `Extras` 및 `Map` 할당을 피하도록 `ImageRequest`를 최적화했습니다.

## [2.7.0] - 2024년 7월 17일 {id="2-7-0-july-17-2024"}

- `ImageLoader.execute`, `AsyncImage`, `SubcomposeAsyncImage`, `rememberAsyncImagePainter`의 성능 향상을 위해 내부 코루틴 사용을 소폭 최적화했습니다. ([#2205](https://github.com/coil-kt/coil/pull/2205))
- 청크(chunked) 응답에 대해 중복 네트워크 호출이 발생하던 문제를 수정했습니다. ([#2363](https://github.com/coil-kt/coil/pull/2363))
- Kotlin을 2.0.0으로 업데이트했습니다.
- Compose UI를 1.6.8로 업데이트했습니다.
- Okio를 3.9.0으로 업데이트했습니다.

## [3.0.0-alpha08] - 2024년 7월 8일 {id="3-0-0-alpha08-july-8-2024"}

- **주요 변경 사항(BREAKING)**: `ImageRequest` 및 `ImageLoader`의 `dispatcher` 메서드 이름을 `coroutineContext`로 변경했습니다. 예를 들어 `ImageRequest.Builder.dispatcher`는 이제 `ImageRequest.Builder.coroutineContext`가 됩니다. 메서드가 이제 모든 `CoroutineContext`를 허용하며 더 이상 `Dispatcher`만을 요구하지 않으므로 이름이 변경되었습니다.
- 수정: 경쟁 상태로 인해 발생할 수 있던 `IllegalStateException: Reading a state that was created after the snapshot was taken or in a snapshot that has not yet been applied` 문제를 수정했습니다.
    - 참고: 이로 인해 `Dispatchers.Main.immediate`에 대한 소프트 의존성이 다시 도입되었습니다. 결과적으로 JVM에서는 [`kotlinx-coroutines-swing`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-swing/)에 대한 의존성을 다시 추가해야 합니다. 가져오지 않을 경우 `ImageRequest`가 즉시 디스패치되지 않으며 `ImageRequest.placeholder` 설정 또는 메모리 캐시 확인 전에 한 프레임의 지연이 발생합니다.

## [3.0.0-alpha07] - 2024년 6월 26일 {id="3-0-0-alpha07-june-26-2024"}

- **주요 변경 사항(BREAKING)**: `AsyncImagePainter`가 기본적으로 더 이상 `onDraw`를 기다리지 않고 `Size.ORIGINAL`을 사용합니다.
    - 이를 통해 [Roborazzi/Paparazzi와의 호환성 문제](https://github.com/coil-kt/coil/issues/1910)가 해결되고 전반적인 테스트 안정성이 향상됩니다.
    - `onDraw`를 기다리는 기존 방식으로 되돌리려면 `DrawScopeSizeResolver`를 `ImageRequest.sizeResolver`로 설정하세요.
- **주요 변경 사항(BREAKING)**: 멀티플랫폼 `Image` API를 리팩터링했습니다. 특히 `asCoilImage`가 `asImage`로 이름이 변경되었습니다.
- **주요 변경 사항(BREAKING)**: `AsyncImagePainter.state`가 `StateFlow<AsyncImagePainter.State>`로 변경되었습니다. 값을 관찰하려면 `collectAsState`를 사용하세요. 이를 통해 성능이 향상됩니다.
- **주요 변경 사항(BREAKING)**: `AsyncImagePainter.imageLoader` 및 `AsyncImagePainter.request`가 `StateFlow<AsyncImagePainter.Inputs>`로 통합되었습니다. 값을 관찰하려면 `collectAsState`를 사용하세요. 이를 통해 성능이 향상됩니다.
- **주요 변경 사항(BREAKING)**: 리소스 축소(shrinking) 최적화를 방해하므로 `android.resource://example.package.name/drawable/image` 형식의 URI 지원을 제거했습니다.
    - 해당 기능이 여전히 필요한 경우 [컴포넌트 레지스트리에 `ResourceUriMapper`를 수동으로 포함](https://github.com/coil-kt/coil/blob/main/coil-core/src/androidInstrumentedTest/kotlin/coil3/map/ResourceUriMapper.kt)시킬 수 있습니다.
- **신규**: `AsyncImagePainter`의 미리보기 렌더링 동작 제어를 지원하는 `AsyncImagePreviewHandler`를 도입했습니다.
    - 미리보기 동작을 재정의하려면 `LocalAsyncImagePreviewHandler`를 사용하세요.
    - 이 변경 사항 및 기타 `coil-compose` 개선의 일환으로, `AsyncImagePainter`는 이제 기본적으로 `ImageRequest.placeholder`를 표시하는 대신 `ImageRequest` 실행을 시도합니다. 미리보기 환경에서 [네트워크나 파일을 사용하는 요청은 실패할 것으로 예상](https://developer.android.com/develop/ui/compose/tooling/previews#preview-limitations)되지만 Android 리소스는 정상 작동해야 합니다.
- **신규**: 프레임 인덱스로 비디오 이미지를 추출하는 기능을 지원합니다. ([#2183](https://github.com/coil-kt/coil/pull/2183))
- **신규**: 모든 `CoroutineDispatcher` 메서드에 `CoroutineContext` 전달을 지원합니다. ([#2241](https://github.com/coil-kt/coil/pull/2241))
- **신규**: JS 및 WASM JS에서 약한 참조 메모리 캐시를 지원합니다.
- Compose에서 `Dispatchers.Main.immediate`로 디스패치하지 않도록 했습니다. 이에 따라 JVM에서 [`kotlinx-coroutines-swing`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-swing/)을 더 이상 가져올 필요가 없습니다.
- 성능 향상을 위해 Compose에서 `async`를 호출하고 disposable을 생성하지 않도록 변경했습니다(@mlykotom님께 감사드립니다!). ([#2205](https://github.com/coil-kt/coil/pull/2205))
- 전역 `ImageLoader` 엑스트라(extras)를 `Options`로 전달하던 문제를 수정했습니다. ([#2223](https://github.com/coil-kt/coil/pull/2223))
- Android가 아닌 타깃에서 `crossfade(false)`가 작동하지 않던 문제를 수정했습니다.
- VP8X 기능 플래그 바이트 오프셋을 수정했습니다 ([#2199](https://github.com/coil-kt/coil/pull/2199)).
- 드로우 시점에 이미지를 렌더링하는 대신 비트맵으로 렌더링하도록 Android가 아닌 타깃의 `SvgDecoder`를 변환했습니다. 이를 통해 성능이 향상됩니다.
    - 이 동작은 `SvgDecoder(renderToBitmap)`을 사용하여 제어할 수 있습니다.
- `ScaleDrawable`을 `coil-gif`에서 `coil-core`로 이동했습니다.
- Kotlin을 2.0.0으로 업데이트했습니다.
- Compose를 1.6.11로 업데이트했습니다.
- Okio를 3.9.0으로 업데이트했습니다.
- Skiko를 0.8.4로 업데이트했습니다.
- [3.x의 모든 중요 변경 목록은 업그레이드 가이드를 확인하세요.](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [3.0.0-alpha06] - 2024년 2월 29일 {id="3-0-0-alpha06-february-29-2024"}

- Skiko를 0.7.93으로 다운그레이드했습니다.
- [3.x의 모든 중요 변경 목록은 업그레이드 가이드를 확인하세요.](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [3.0.0-alpha05] - 2024년 2월 28일 {id="3-0-0-alpha05-february-28-2024"}

- **신규**: `wasmJs` 타깃을 지원합니다.
- Android가 아닌 플랫폼에서 `Bitmap` 기반이 아닌 `Image` 그리기를 지원하기 위해 `DrawablePainter` 및 `DrawableImage`를 만들었습니다.
    - `Image` API는 실험적이며 알파 릴리스 간에 변경될 수 있습니다.
- `ContentPainterModifier`가 `Modifier.Node`를 구현하도록 업데이트했습니다.
- 수정: 컴포넌트 콜백 및 네트워크 관찰자를 백그라운드 스레드에서 지연 등록하도록 했습니다. 이를 통해 일반적으로 메인 스레드에서 발생하던 느린 초기화 문제를 수정했습니다.
- 수정: `ImageLoader.Builder.placeholder/error/fallback`이 `ImageRequest`에서 사용되지 않던 문제를 수정했습니다.
- Compose를 1.6.0으로 업데이트했습니다.
- Coroutines를 1.8.0으로 업데이트했습니다.
- Okio를 3.8.0으로 업데이트했습니다.
- Skiko를 0.7.94로 업데이트했습니다.
- [3.x의 모든 중요 변경 목록은 업그레이드 가이드를 확인하세요.](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [2.6.0] - 2024년 2월 23일 {id="2-6-0-february-23-2024"}

- `rememberAsyncImagePainter`, `AsyncImage`, `SubcomposeAsyncImage`를 [재시작 가능하고 건너뛸 수 있도록(restartable and skippable)](https://developer.android.com/jetpack/compose/performance/stability#functions) 만들었습니다. 이를 통해 컴포저블의 인자 중 하나가 변경되지 않는 한 재구성을 방지하여 성능을 향상시킵니다.
    - `model`이 재구성을 트리거할지 여부를 제어하기 위해 선택적 `modelEqualityDelegate` 인자를 `rememberAsyncImagePainter`, `AsyncImage`, `SubcomposeAsyncImage`에 추가했습니다.
- `ContentPainterModifier`가 `Modifier.Node`를 구현하도록 업데이트했습니다.
- 수정: 컴포넌트 콜백 및 네트워크 관찰자를 백그라운드 스레드에서 지연 등록하도록 했습니다. 이를 통해 일반적으로 메인 스레드에서 발생하던 느린 초기화 문제를 수정했습니다.
- 수정: `ImageRequest.listener` 또는 `ImageRequest.target`이 변경되더라도 `rememberAsyncImagePainter`, `AsyncImage`, `SubcomposeAsyncImage`에서 새 이미지 요청이 재시작되지 않도록 방지했습니다.
- 수정: `AsyncImagePainter`에서 이미지 요청을 두 번 관찰하지 않도록 수정했습니다.
- Kotlin을 1.9.22로 업데이트했습니다.
- Compose를 1.6.1로 업데이트했습니다.
- Okio를 3.8.0으로 업데이트했습니다.
- `androidx.collection`을 1.4.0으로 업데이트했습니다.
- `androidx.lifecycle`을 2.7.0으로 업데이트했습니다.

## [3.0.0-alpha04] - 2024년 2월 1일 {id="3-0-0-alpha04-february-1-2024"}

- **주요 변경 사항(BREAKING)**: `OkHttpNetworkFetcherFactory` 및 `KtorNetworkFetcherFactory`의 공개 API에서 `Lazy`를 제거했습니다.
- `OkHttpNetworkFetcherFactory`에서 `OkHttpClient` 대신 `Call.Factory`를 노출하도록 변경했습니다.
- `ByteString`을 감싸도록 `NetworkResponseBody`를 변환했습니다.
- Compose를 1.5.12로 다운그레이드했습니다.
- [모든 중요 변경 사항 목록은 업그레이드 가이드를 확인하세요.](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [3.0.0-alpha03] - 2024년 1월 20일 {id="3-0-0-alpha03-january-20-2024"}

- **주요 변경 사항(BREAKING)**: `coil-network`의 이름이 `coil-network-ktor`로 변경되었습니다. 또한 OkHttp에 의존하며 Ktor 엔진을 지정할 필요가 없는 새로운 `coil-network-okhttp` 아티팩트가 추가되었습니다.
    - 가져오는 아티팩트에 따라 `KtorNetworkFetcherFactory` 또는 `OkHttpNetworkFetcherFactory`를 사용하여 수동으로 `Fetcher.Factory`를 참조할 수 있습니다.
- Apple 플랫폼에서 `NSUrl` 로딩을 지원합니다.
- `AsyncImage`에 `clipToBounds` 매개변수를 추가했습니다.
- [모든 중요 변경 사항 목록은 업그레이드 가이드를 확인하세요.](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [3.0.0-alpha02] - 2024년 1월 10일 {id="3-0-0-alpha02-january-10-2024"}

- **주요 변경 사항(BREAKING)**: 다른 아티팩트와의 클래스 이름 충돌을 방지하기 위해 `coil-gif`, `coil-network`, `coil-svg`, `coil-video`의 패키지가 업데이트되어 모든 클래스가 각각 `coil.gif`, `coil.network`, `coil.svg`, `coil.video`에 속하게 되었습니다.
- **주요 변경 사항(BREAKING)**: `ImageDecoderDecoder`의 이름이 `AnimatedImageDecoder`로 변경되었습니다.
- **신규**: 이제 `coil-gif`, `coil-network`, `coil-svg`, `coil-video`의 컴포넌트가 각 `ImageLoader`의 `ComponentRegistry`에 자동으로 추가됩니다.
    - 명확히 하자면, `3.0.0-alpha01`과 달리 **`ComponentRegistry`에 `NetworkFetcher.Factory()`를 수동으로 추가할 필요가 없습니다**. 단순히 `io.coil-kt.coil3:coil-network:[version]`과 [Ktor 엔진](https://ktor.io/docs/http-client-engines.html#dependencies)을 가져오는 것만으로 네트워크 이미지를 로드하기에 충분합니다.
    - 이러한 컴포넌트를 `ComponentRegistry`에 수동으로 추가해도 안전합니다. 수동으로 추가된 컴포넌트가 자동으로 추가된 컴포넌트보다 우선 적용됩니다.
    - 원하는 경우 `ImageLoader.Builder.serviceLoaderEnabled(false)`를 사용하여 이 동작을 비활성화할 수 있습니다.
- **신규**: 모든 플랫폼에서 `coil-svg`를 지원합니다. Android에서는 [AndroidSVG](https://bigbadaboom.github.io/androidsvg/)를 기반으로 하며, Android 이외의 플랫폼에서는 [SVGDOM](https://api.skia.org/classSkSVGDOM.html)을 기반으로 동작합니다.
- Coil은 이제 내부적으로 Android의 [`ImageDecoder`](https://developer.android.com/reference/android/graphics/ImageDecoder) API를 사용하므로 파일, 리소스 또는 콘텐츠 URI에서 직접 디코딩할 때 성능상의 이점이 있습니다.
- 수정: 여러 `coil3.Uri` 파싱 문제를 수정했습니다.
- [모든 중요 변경 사항 목록은 업그레이드 가이드를 확인하세요.](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [3.0.0-alpha01] - 2023년 12월 30일 {id="3-0-0-alpha01-december-30-2023"}

- **신규**: [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) 지원. Coil은 이제 Android, JVM, iOS, macOS 및 Javascript를 지원하는 Kotlin Multiplatform 라이브러리입니다.
- Coil의 Maven 좌표가 `io.coil-kt.coil3`으로 업데이트되었으며 import 경로가 `coil3`으로 업데이트되었습니다. 이를 통해 바이너리 호환성 문제 없이 Coil 3과 Coil 2를 함께 실행할 수 있습니다. 예를 들어 `io.coil-kt:coil:[version]`은 이제 `io.coil-kt.coil3:coil:[version]`입니다.
- Coroutines, Ktor 및 AndroidX에서 사용하는 명명 규칙에 맞추기 위해 `coil-base` 및 `coil-compose-base` 아티팩트의 이름이 각각 `coil-core` 및 `coil-compose-core`로 변경되었습니다.
- [모든 중요 변경 사항 목록은 업그레이드 가이드를 확인하세요.](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [2.5.0] - 2023년 10월 30일 {id="2-5-0-october-30-2023"}

- **신규**: `coil-video`에서 `MediaDataSource` 구현체의 디코딩을 지원하기 위해 `MediaDataSourceFetcher.Factory`를 추가했습니다. ([#1795](https://github.com/coil-kt/coil/pull/1795))
- 하드웨어 비트맵 차단 목록에 `SHIFT6m` 기기를 추가했습니다. ([#1812](https://github.com/coil-kt/coil/pull/1812))
- 수정: 한쪽 치수가 바운딩되지 않은(unbounded) 크기를 반환하는 페인터에 대한 방어 코드를 추가했습니다. ([#1826](https://github.com/coil-kt/coil/pull/1826))
- 수정: 캐시된 헤더에 비 ASCII 문자가 포함되어 있을 때 `304 Not Modified` 이후 디스크 캐시 로드에 실패하던 문제를 수정했습니다. ([#1839](https://github.com/coil-kt/coil/pull/1839))
- 수정: `FakeImageEngine`이 인터셉터 체인의 요청을 업데이트하지 않던 문제를 수정했습니다. ([#1905](https://github.com/coil-kt/coil/pull/1905))
- 컴파일 SDK를 34로 업데이트했습니다.
- Kotlin을 1.9.10으로 업데이트했습니다.
- Coroutines를 1.7.3으로 업데이트했습니다.
- `accompanist-drawablepainter`를 0.32.0으로 업데이트했습니다.
- `androidx.annotation`을 1.7.0으로 업데이트했습니다.
- `androidx.compose.foundation`을 1.5.4로 업데이트했습니다.
- `androidx.core`를 1.12.0으로 업데이트했습니다.
- `androidx.exifinterface:exifinterface`를 1.3.6으로 업데이트했습니다.
- `androidx.lifecycle`을 2.6.2로 업데이트했습니다.
- `com.squareup.okhttp3`을 4.12.0으로 업데이트했습니다.
- `com.squareup.okio`를 3.6.0으로 업데이트했습니다.

## [2.4.0] - 2023년 5월 21일 {id="2-4-0-may-21-2023"}

- `DiskCache`의 `get`/`edit` 이름을 `openSnapshot`/`openEditor`로 변경했습니다.
- `AsyncImagePainter`에서 `ColorDrawable`을 `ColorPainter`로 자동 변환하지 않도록 변경했습니다.
- 단순 `AsyncImage` 오버로드에 `@NonRestartableComposable` 애너테이션을 추가했습니다.
- 수정: `ImageSource`에서 `Context.cacheDir`을 지연 호출하도록 변경했습니다.
- 수정: `coil-bom` 배포 문제를 수정했습니다.
- 수정: 하드웨어 비트맵이 비활성화된 경우 비트맵 구성을 항상 `ARGB_8888`로 설정하던 문제를 수정했습니다.
- Kotlin을 1.8.21로 업데이트했습니다.
- Coroutines를 1.7.1로 업데이트했습니다.
- `accompanist-drawablepainter`를 0.30.1로 업데이트했습니다.
- `androidx.compose.foundation`을 1.4.3으로 업데이트했습니다.
- `androidx.profileinstaller:profileinstaller`를 1.3.1로 업데이트했습니다.
- `com.squareup.okhttp3`을 4.11.0으로 업데이트했습니다.

## [2.3.0] - 2023년 3월 25일 {id="2-3-0-march-25-2023"}

- **신규**: `FakeImageLoaderEngine`이 포함된 새로운 `coil-test` 아티팩트를 도입했습니다. 이 클래스는 테스트에서 일관되고 동기적인(메인 스레드로부터) 응답을 보장하기 위해 이미지 로더 응답을 하드코딩하는 데 유용합니다. 자세한 내용은 [여기](https://coil-kt.github.io/coil/testing)를 참조하세요.
- **신규**: `coil-base`(`coil`의 자식 모듈) 및 `coil-compose-base`(`coil-compose`의 자식 모듈)에 [기준 프로필(Baseline Profiles)](https://developer.android.com/topic/performance/baselineprofiles/overview)을 추가했습니다.
    - 이를 통해 Coil의 런타임 성능이 향상되며, 앱에서 Coil을 어떻게 사용하는지에 따라 [더 나은 프레임 타이밍](https://github.com/coil-kt/coil/tree/main/coil-benchmark/benchmark_output.md)을 제공할 수 있습니다.
- 수정: 인코딩된 데이터가 포함된 `file://` URI 파싱 문제를 수정했습니다. [#1601](https://github.com/coil-kt/coil/pull/1601)
- 수정: 존재하지 않는 디렉터리가 전달되었을 때 `DiskCache`가 최대 크기를 올바르게 계산하도록 수정했습니다. [#1620](https://github.com/coil-kt/coil/pull/1620)
- `Coil.reset`을 공개 API로 전환했습니다. [#1506](https://github.com/coil-kt/coil/pull/1506)
- Java 디폴트 메서드 생성을 활성화했습니다. [#1491](https://github.com/coil-kt/coil/pull/1491)
- Kotlin을 1.8.10으로 업데이트했습니다.
- `accompanist-drawablepainter`를 0.30.0으로 업데이트했습니다.
- `androidx.annotation`을 1.6.0으로 업데이트했습니다.
- `androidx.appcompat:appcompat-resources`를 1.6.1로 업데이트했습니다.
- `androidx.compose.foundation`을 1.4.0으로 업데이트했습니다.
- `androidx.core`를 1.9.0으로 업데이트했습니다.
- `androidx.exifinterface:exifinterface`를 1.3.6으로 업데이트했습니다.
- `androidx.lifecycle`을 2.6.1로 업데이트했습니다.
- `okio`를 3.3.0으로 업데이트했습니다.

## [2.2.2] - 2022년 10월 1일 {id="2-2-2-october-1-2022"}

- 시스템 콜백을 등록하기 전에 이미지 로더가 완전히 초기화되었는지 확인하도록 보장했습니다. [#1465](https://github.com/coil-kt/coil/pull/1465)
- 밴딩 현상(banding)을 방지하기 위해 API 30+의 `VideoFrameDecoder`에서 선호하는 비트맵 구성을 설정했습니다. [#1487](https://github.com/coil-kt/coil/pull/1487)
- `FileUriMapper`에서 `#`이 포함된 경로 파싱 문제를 수정했습니다. [#1466](https://github.com/coil-kt/coil/pull/1466)
- 디스크 캐시에서 비 ASCII 헤더가 포함된 응답을 읽을 때 발생하던 문제를 수정했습니다. [#1468](https://github.com/coil-kt/coil/pull/1468)
- asset 하위 폴더 내의 비디오를 디코딩할 때 발생하던 문제를 수정했습니다. [#1489](https://github.com/coil-kt/coil/pull/1489)
- `androidx.annotation`을 1.5.0으로 업데이트했습니다.

## [2.2.1] - 2022년 9월 8일 {id="2-2-1-september-8-2022"}

- 수정: `RoundedCornersTransformation`이 이제 `input` 비트맵의 배율을 올바르게 조정합니다.
- `kotlin-parcelize` 플러그인에 대한 의존성을 제거했습니다.
- 컴파일 SDK를 33으로 업데이트했습니다.
- [#1423](https://github.com/coil-kt/coil/issues/1423) 문제의 임시 해결책으로 `androidx.appcompat:appcompat-resources`를 1.4.2로 다운그레이드했습니다.

## [2.2.0] - 2022년 8월 16일 {id="2-2-0-august-16-2022"}

- **신규**: 비디오 재생 시간의 백분율로 비디오 프레임을 지정할 수 있도록 `coil-video`에 `ImageRequest.videoFramePercent`를 추가했습니다.
- **신규**: `BitmapFactoryDecoder`가 EXIF 방향 데이터를 처리하는 방식을 구성할 수 있도록 `ExifOrientationPolicy`를 추가했습니다.
- 수정: 크기에 정의되지 않은 치수가 전달된 경우 `RoundedCornersTransformation`에서 예외를 던지지 않도록 수정했습니다.
- 수정: GIF의 프레임 딜레이를 부호 있는 1바이트 대신 부호 없는 2바이트로 읽도록 수정했습니다.
- Kotlin을 1.7.10으로 업데이트했습니다.
- Coroutines를 1.6.4로 업데이트했습니다.
- Compose를 1.2.1로 업데이트했습니다.
- OkHttp를 4.10.0으로 업데이트했습니다.
- Okio를 3.2.0으로 업데이트했습니다.
- `accompanist-drawablepainter`를 0.25.1로 업데이트했습니다.
- `androidx.annotation`을 1.4.0으로 업데이트했습니다.
- `androidx.appcompat:appcompat-resources`를 1.5.0으로 업데이트했습니다.
- `androidx.core`를 1.8.0으로 업데이트했습니다.

## [2.1.0] - 2022년 5월 17일 {id="2-1-0-may-17-2022"}

- **신규**: `ByteArray` 로딩을 지원합니다. ([#1202](https://github.com/coil-kt/coil/pull/1202))
- **신규**: `ImageRequest.Builder.css`를 사용하여 SVG에 대한 커스텀 CSS 규칙 설정을 지원합니다. ([#1210](https://github.com/coil-kt/coil/pull/1210))
- 수정: `GenericViewTarget`의 private 메서드를 protected로 변경했습니다. ([#1273](https://github.com/coil-kt/coil/pull/1273))
- 컴파일 SDK를 32로 업데이트했습니다. ([#1268](https://github.com/coil-kt/coil/pull/1268))

## [2.0.0] - 2022년 5월 10일 {id="2-0-0-may-10-2022"}

Coil 2.0.0은 라이브러리의 주요 버전 개편 릴리스이며 호환성이 깨지는 변경 사항(breaking changes)을 포함합니다. 업그레이드 방법은 [업그레이드 가이드](https://coil-kt.github.io/coil/upgrading/)를 확인하세요.

- **신규**: `coil-compose`에 `AsyncImage`를 도입했습니다. 자세한 정보는 [공식 문서](https://coil-kt.github.io/coil/compose/)를 확인하세요.

```kotlin
// 네트워크에서 이미지 표시
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
)

// 플레이스홀더, 원형 자르기(circle crop), 크로스페이드 애니메이션과 함께 네트워크에서 이미지 표시
AsyncImage(
    model = ImageRequest.Builder(LocalContext.current)
        .data("https://example.com/image.jpg")
        .crossfade(true)
        .build(),
    placeholder = painterResource(R.drawable.placeholder),
    contentDescription = stringResource(R.string.description),
    contentScale = ContentScale.Crop,
    modifier = Modifier.clip(CircleShape)
)
```

- **신규**: 공개 `DiskCache` API를 도입했습니다.
    - 디스크 캐시를 구성하려면 `ImageLoader.Builder.diskCache` 및 `DiskCache.Builder`를 사용하세요.
    - Coil 2.0에서는 OkHttp의 `Cache`를 사용하지 않아야 합니다. 자세한 정보는 [여기](https://coil-kt.github.io/coil/upgrading_to_coil2/#disk-cache)를 확인하세요.
    - `Cache-Control` 및 기타 캐시 헤더는 여전히 지원됩니다. 단, 캐시는 URL 일치 여부만 확인하므로 `Vary` 헤더는 제외됩니다. 또한 응답 코드가 [200..300) 범위에 있는 응답만 캐시됩니다.
    - 2.0으로 업그레이드할 때 기존 디스크 캐시는 삭제됩니다.
- 최소 지원 API 버전이 이제 21입니다.
- `ImageRequest`의 기본 `Scale`이 이제 `Scale.FIT`입니다.
    - 기본 `Scale`을 갖는 다른 클래스들과 일관성을 맞추기 위해 `ImageRequest.scale`이 변경되었습니다.
    - `ImageViewTarget`을 사용하는 요청은 여전히 `Scale`이 자동으로 감지됩니다.
- 이미지 파이프라인 클래스 개편:
    - 유연성을 높이기 위해 `Mapper`, `Fetcher`, `Decoder`가 리팩터링되었습니다.
    - `Fetcher.key`가 새로운 `Keyer` 인터페이스로 대체되었습니다. `Keyer`는 입력 데이터로부터 캐시 키를 생성합니다.
    - `Decoder`가 Okio의 파일 시스템 API를 사용하여 직접 `File`을 읽을 수 있도록 지원하는 `ImageSource`를 추가했습니다.
- Jetpack Compose 통합 개편:
    - `rememberImagePainter` 및 `ImagePainter`의 이름이 각각 `rememberAsyncImagePainter` 및 `AsyncImagePainter`로 변경되었습니다.
    - `LocalImageLoader`를 지원 중단했습니다. 자세한 정보는 지원 중단 메시지를 확인하세요.
- 런타임 not-null 단언문 생성을 비활성화했습니다.
    - Java를 사용하는 경우 not-null로 애너테이션된 인자에 null을 전달해도 더 이상 즉시 `NullPointerException`이 발생하지 않습니다. Kotlin의 컴파일 타임 널 안전성이 이러한 상황을 방지합니다.
    - 이 변경을 통해 라이브러리 크기를 줄일 수 있습니다.
- `Size`가 이제 너비와 높이를 나타내는 두 개의 `Dimension` 값으로 구성됩니다. `Dimension`은 양수의 픽셀 값이거나 `Dimension.Undefined`일 수 있습니다. 자세한 내용은 [여기](https://coil-kt.github.io/coil/upgrading/#size-refactor)를 참조하세요.
- `BitmapPool` 및 `PoolableViewTarget`이 라이브러리에서 제거되었습니다.
- `VideoFrameFileFetcher` 및 `VideoFrameUriFetcher`가 라이브러리에서 제거되었습니다. 대신 모든 데이터 소스를 지원하는 `VideoFrameDecoder`를 사용하세요.
- [`BlurTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/BlurTransformation.kt) 및 [`GrayscaleTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/GrayscaleTransformation.kt)이 라이브러리에서 제거되었습니다. 이를 사용하는 경우 해당 코드를 프로젝트로 복사하여 사용할 수 있습니다.
- 전환이 완료될 때까지 지연시킬 필요가 없어짐에 따라 `Transition.transition`을 non-suspending 함수로 변경했습니다.
- 진행 중인 `BitmapFactory` 작업의 최대 수를 제한하는 `bitmapFactoryMaxParallelism` 지원을 추가했습니다. 이 값은 기본적으로 4이며 UI 성능을 향상시킵니다.
- `interceptorDispatcher`, `fetcherDispatcher`, `decoderDispatcher`, `transformationDispatcher` 지원을 추가했습니다.
- 공통 `ViewTarget` 로직을 처리하는 `GenericViewTarget`을 추가했습니다.
- 기본 지원 데이터 타입에 `ByteBuffer`를 추가했습니다.
- `Disposable`이 리팩터링되었으며 내부 `ImageRequest`의 잡(Job)을 노출합니다.
- `MemoryCache` API를 개편했습니다.
- `ImageRequest.fallback`이 null인 경우 `Target`에 `ImageRequest.error`가 설정되도록 변경했습니다.
- `Transformation.key`가 `Transformation.cacheKey`로 대체되었습니다.
- Kotlin을 1.6.10으로 업데이트했습니다.
- Compose를 1.1.1로 업데이트했습니다.
- OkHttp를 4.9.3으로 업데이트했습니다.
- Okio를 3.0.0으로 업데이트했습니다.

`2.0.0-rc03`에서의 변경 사항:
- `Dimension.Original`을 `Dimension.Undefined`로 변환했습니다.
    - 크기 시스템의 몇 가지 엣지 케이스([예시](https://github.com/coil-kt/coil/issues/1246))를 수정하기 위해 픽셀이 아닌 치수의 의미를 약간 변경했습니다.
- ContentScale이 None인 경우 `Size.ORIGINAL`로 이미지를 로드합니다.
- `ImageView.load` 빌더 인자가 마지막이 아닌 처음에 적용되던 문제를 수정했습니다.
- 응답이 수정되지 않은(not modified) 경우 HTTP 헤더를 결합하지 않던 문제를 수정했습니다.

## [2.0.0-rc03] - 2022년 4월 11일 {id="2-0-0-rc03-april-11-2022"}

- `ScaleResolver` 인터페이스를 제거했습니다.
- `Size` 생성자를 함수로 변환했습니다.
- `Dimension.Pixels`의 `toString`이 픽셀 값만 표현하도록 변경했습니다.
- `SystemCallbacks.onTrimMemory`에서 드물게 발생하던 비정상 종료에 대한 방어 코드를 추가했습니다.
- Coroutines를 1.6.1로 업데이트했습니다.

## [2.0.0-rc02] - 2022년 3월 20일 {id="2-0-0-rc02-march-20-2022"}

- `ImageRequest`의 기본 크기를 `Size.ORIGINAL` 대신 현재 디스플레이의 크기로 되돌렸습니다.
- `DiskCache.Builder`가 실험적으로 표시되어 있던 문제를 수정했습니다. `DiskCache`의 메서드만 실험적입니다.
- 한쪽 치수가 `WRAP_CONTENT`인 `ImageView`에 이미지를 로드할 때 바운딩된 치수에 맞추는 대신 원본 크기로 로드하던 문제를 수정했습니다.
- `MemoryCache.Key`, `MemoryCache.Value`, `Parameters.Entry`에서 component 함수들을 제거했습니다.

## [2.0.0-rc01] - 2022년 3월 2일 {id="2-0-0-rc01-march-2-2022"}

`1.4.0` 이후 주요 변경 사항:

- 최소 지원 API 버전이 이제 21입니다.
- Jetpack Compose 통합 개편:
    - `rememberImagePainter`의 이름이 `rememberAsyncImagePainter`로 변경되었습니다.
    - `AsyncImage` 및 `SubcomposeAsyncImage` 지원을 추가했습니다. 자세한 정보는 [공식 문서](https://coil-kt.github.io/coil/compose/)를 확인하세요.
    - `LocalImageLoader`를 지원 중단했습니다. 자세한 정보는 지원 중단 메시지를 확인하세요.
- Coil 2.0은 자체 디스크 캐시 구현체를 가지며 디스크 캐싱을 위해 OkHttp에 의존하지 않습니다.
    - 디스크 캐시를 구성하려면 `ImageLoader.Builder.diskCache` 및 `DiskCache.Builder`를 사용하세요.
    - 스레드가 디스크에 쓰는 동안 인터럽트되면 캐시가 손상될 수 있으므로 Coil 2.0에서는 OkHttp의 `Cache`를 **사용해서는 안 됩니다**.
    - `Cache-Control` 및 기타 캐시 헤더는 여전히 지원됩니다. 단, 캐시는 URL 일치 여부만 확인하므로 `Vary` 헤더는 제외됩니다. 또한 응답 코드가 [200..300) 범위에 있는 응답만 캐시됩니다.
    - 2.0으로 업그레이드할 때 기존 디스크 캐시는 삭제됩니다.
- `ImageRequest`의 기본 `Scale`이 이제 `Scale.FIT`입니다.
    - 기본 `Scale`을 갖는 다른 클래스들과 일관성을 맞추기 위해 `ImageRequest.scale`이 변경되었습니다.
    - `ImageViewTarget`을 사용하는 요청은 여전히 `Scale`이 자동으로 감지됩니다.
- `ImageRequest`의 기본 크기가 이제 `Size.ORIGINAL`입니다.
- 이미지 파이프라인 클래스 개편:
    - 유연성을 높이기 위해 `Mapper`, `Fetcher`, `Decoder`가 리팩터링되었습니다.
    - `Fetcher.key`가 새로운 `Keyer` 인터페이스로 대체되었습니다. `Keyer`는 입력 데이터로부터 캐시 키를 생성합니다.
    - `Decoder`가 Okio의 파일 시스템 API를 사용하여 직접 `File`을 읽을 수 있도록 지원하는 `ImageSource`를 추가했습니다.
- 런타임 not-null 단언문 생성을 비활성화했습니다.
    - Java를 사용하는 경우 not-null로 애너테이션된 매개변수에 null을 전달해도 더 이상 즉시 `NullPointerException`이 발생하지 않습니다. Kotlin의 컴파일 타임 널 안전성이 이러한 상황을 방지합니다.
    - 이 변경을 통해 라이브러리 크기를 줄일 수 있습니다.
- `Size`가 이제 너비와 높이를 나타내는 두 개의 `Dimension` 값으로 구성됩니다. `Dimension`은 양수의 픽셀 값이거나 `Dimension.Original`일 수 있습니다.
- `BitmapPool` 및 `PoolableViewTarget`이 라이브러리에서 제거되었습니다.
- `VideoFrameFileFetcher` 및 `VideoFrameUriFetcher`가 라이브러리에서 제거되었습니다. 대신 모든 데이터 소스를 지원하는 `VideoFrameDecoder`를 사용하세요.
- [`BlurTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/BlurTransformation.kt) 및 [`GrayscaleTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/GrayscaleTransformation.kt)이 라이브러리에서 제거되었습니다. 이를 사용하는 경우 해당 코드를 프로젝트로 복사하여 사용할 수 있습니다.
- 전환이 완료될 때까지 지연시킬 필요가 없어짐에 따라 `Transition.transition`을 non-suspending 함수로 변경했습니다.
- 진행 중인 `BitmapFactory` 작업의 최대 수를 제한하는 `bitmapFactoryMaxParallelism` 지원을 추가했습니다. 이 값은 기본적으로 4이며 UI 성능을 향상시킵니다.
- `interceptorDispatcher`, `fetcherDispatcher`, `decoderDispatcher`, `transformationDispatcher` 지원을 추가했습니다.
- 공통 `ViewTarget` 로직을 처리하는 `GenericViewTarget`을 추가했습니다.
- 기본 지원 데이터 타입에 `ByteBuffer`를 추가했습니다.
- `Disposable`이 리팩터링되었으며 내부 `ImageRequest`의 잡을 노출합니다.
- `MemoryCache` API를 개편했습니다.
- `ImageRequest.fallback`이 null인 경우 `Target`에 `ImageRequest.error`가 설정되도록 변경했습니다.
- `Transformation.key`가 `Transformation.cacheKey`로 대체되었습니다.
- Kotlin을 1.6.10으로 업데이트했습니다.
- Compose를 1.1.1로 업데이트했습니다.
- OkHttp를 4.9.3으로 업데이트했습니다.
- Okio를 3.0.0으로 업데이트했습니다.

`2.0.0-alpha09` 이후 변경 사항:

- `-Xjvm-default=all` 컴파일러 플래그를 제거했습니다.
- must-revalidate/e-tag가 포함된 여러 요청이 동시에 실행될 때 이미지 로드에 실패하던 문제를 수정했습니다.
- `<svg` 태그 뒤에 개행 문자가 있는 경우 `DecodeUtils.isSvg`가 false를 반환하던 문제를 수정했습니다.
- `LocalImageLoader.provides`의 지원 중단 메시지를 더 명확하게 수정했습니다.
- Compose를 1.1.1로 업데이트했습니다.
- `accompanist-drawablepainter`를 0.23.1로 업데이트했습니다.

## [2.0.0-alpha09] - 2022년 2월 16일 {id="2-0-0-alpha09-february-16-2022"}

- `AsyncImage`가 잘못된 제약 조건을 생성하던 문제를 수정했습니다. ([#1134](https://github.com/coil-kt/coil/pull/1134))
- `AsyncImagePainter`에 `ContentScale` 인자를 추가했습니다. ([#1144](https://github.com/coil-kt/coil/pull/1144))
    - 이미지가 올바른 크기로 로드되도록 하려면 `Image`에 설정된 값과 동일하게 설정해야 합니다.
- `ImageRequest`의 `Scale`을 지연 계산할 수 있도록 지원하는 `ScaleResolver`를 추가했습니다. ([#1134](https://github.com/coil-kt/coil/pull/1134))
    - `ImageRequest.scale`은 `ImageRequest.scaleResolver.scale()`로 대체되어야 합니다.
- Compose를 1.1.0으로 업데이트했습니다.
- `accompanist-drawablepainter`를 0.23.0으로 업데이트했습니다.
- `androidx.lifecycle`을 2.4.1로 업데이트했습니다.

## [2.0.0-alpha08] - 2022년 2월 7일 {id="2-0-0-alpha08-february-7-2022"}

- Okio의 `FileSystem` API를 사용하도록 `DiskCache` 및 `ImageSource`를 업데이트했습니다. ([#1115](https://github.com/coil-kt/coil/pull/1115))

## [2.0.0-alpha07] - 2022년 1월 30일 {id="2-0-0-alpha07-january-30-2022"}

- `AsyncImage` 성능을 대폭 개선하고 `AsyncImage`를 `AsyncImage`와 `SubcomposeAsyncImage`로 분리했습니다. ([#1048](https://github.com/coil-kt/coil/pull/1048))
    - `SubcomposeAsyncImage`는 `loading`/`success`/`error`/`content` 슬롯 API를 제공하며, 성능이 상대적으로 떨어지는 subcomposition을 사용합니다.
    - `AsyncImage`는 로딩 중이거나 요청이 실패했을 때 그려지는 `Painter`를 덮어쓸 수 있는 `placeholder`/`error`/`fallback` 인자를 제공합니다. `AsyncImage`는 subcomposition을 사용하지 않으므로 `SubcomposeAsyncImage`보다 훨씬 성능이 뛰어납니다.
    - `SubcomposeAsyncImage.content`에서 `AsyncImagePainter.State` 인자를 제거했습니다. 필요한 경우 `painter.state`를 사용하세요.
    - `AsyncImage`와 `SubcomposeAsyncImage` 모두에 `onLoading`/`onSuccess`/`onError` 콜백을 추가했습니다.
- `LocalImageLoader`를 지원 중단했습니다. ([#1101](https://github.com/coil-kt/coil/pull/1101))
- `ImageRequest.tags` 지원을 추가했습니다. ([#1066](https://github.com/coil-kt/coil/pull/1066))
- `DecodeUtils`의 `isGif`, `isWebP`, `isAnimatedWebP`, `isHeif`, `isAnimatedHeif`를 coil-gif로 이동했습니다. coil-svg에 `isSvg`를 추가했습니다. ([#1117](https://github.com/coil-kt/coil/pull/1117))
- `FetchResult` 및 `DecodeResult`를 일반(non-data) 클래스로 변환했습니다. ([#1114](https://github.com/coil-kt/coil/pull/1114))
- 사용되지 않는 `DiskCache.Builder` 컨텍스트 인자를 제거했습니다. ([#1099](https://github.com/coil-kt/coil/pull/1099))
- 원본 크기를 갖는 비트맵 리소스의 배율 조정을 수정했습니다. ([#1072](https://github.com/coil-kt/coil/pull/1072))
- `ImageDecoderDecoder`에서 `ImageDecoder`를 닫지 못하던 문제를 수정했습니다. ([#1109](https://github.com/coil-kt/coil/pull/1109))
- 드로어블을 비트맵으로 변환할 때 잘못된 배율이 적용되던 문제를 수정했습니다. ([#1084](https://github.com/coil-kt/coil/pull/1084))
- Compose를 1.1.0-rc03으로 업데이트했습니다.
- `accompanist-drawablepainter`를 0.22.1-rc로 업데이트했습니다.
- `androidx.appcompat:appcompat-resources`를 1.4.1로 업데이트했습니다.

## [2.0.0-alpha06] - 2021년 12월 24일 {id="2-0-0-alpha06-december-24-2021"}

- 버퍼링이나 임시 파일 없이 에셋, 리소스 및 콘텐츠 URI로부터 디코딩을 지원하도록 `ImageSource.Metadata`를 추가했습니다. ([#1060](https://github.com/coil-kt/coil/pull/1060))
- `AsyncImage`가 양수의 제약 조건을 가질 때까지 이미지 요청 실행을 지연하도록 변경했습니다. ([#1028](https://github.com/coil-kt/coil/pull/1028))
- `loading`, `success`, `error`가 모두 설정된 경우 `AsyncImage`에 `DefaultContent`를 사용하던 문제를 수정했습니다. ([#1026](https://github.com/coil-kt/coil/pull/1026))
- 플랫폼 `LruCache` 대신 androidx `LruCache`를 사용하도록 변경했습니다. ([#1047](https://github.com/coil-kt/coil/pull/1047))
- Kotlin을 1.6.10으로 업데이트했습니다.
- Coroutines를 1.6.0으로 업데이트했습니다.
- Compose를 1.1.0-rc01로 업데이트했습니다.
- `accompanist-drawablepainter`를 0.22.0-rc로 업데이트했습니다.
- `androidx.collection`을 1.2.0으로 업데이트했습니다.

## [2.0.0-alpha05] - 2021년 11월 28일 {id="2-0-0-alpha05-november-28-2021"}

- **중요**: 이미지의 어느 한 치수에 대해 원본 크기를 사용할 수 있도록 지원하기 위해 `Size`를 리팩터링했습니다.
    - `Size`가 이제 너비와 높이를 나타내는 두 개의 `Dimension` 값으로 구성됩니다. `Dimension`은 양수의 픽셀 값이거나 `Dimension.Original`일 수 있습니다.
    - 이 변경은 한쪽 치수가 고정 픽셀 값일 때 무제한(unbounded) 너비/높이 값(예: `wrap_content`, `Constraints.Infinity`)을 더 잘 지원하기 위해 이루어졌습니다.
- 수정: `AsyncImage`에 대한 인스펙션 모드(미리보기)를 지원합니다.
- 수정: `imageLoader.memoryCache`가 null인 경우 `SuccessResult.memoryCacheKey`는 항상 `null`이어야 하도록 수정했습니다.
- 생성자 스타일의 `ImageLoader`, `SizeResolver`, `ViewSizeResolver`의 `invoke` 함수를 최상위(top-level) 함수로 변환했습니다.
- `CrossfadeDrawable`의 시작 및 종료 드로어블을 공개 API로 전환했습니다.
- `ImageLoader`의 placeholder/error/fallback 드로어블을 mutate(독립 복제)하도록 변경했습니다.
- `SuccessResult` 생성자에 기본 인자를 추가했습니다.
- `androidx.collection-ktx` 대신 `androidx.collection`에 의존하도록 변경했습니다.
- OkHttp를 4.9.3으로 업데이트했습니다.

## [2.0.0-alpha04] - 2021년 11월 22일 {id="2-0-0-alpha04-november-22-2021"}

- **신규**: `coil-compose`에 `AsyncImage`를 추가했습니다.
    - `AsyncImage`는 `ImageRequest`를 비동기적으로 실행하고 결과를 렌더링하는 컴포저블입니다.
    - **`AsyncImage`는 대부분의 사용 사례에서 `rememberImagePainter`를 대체하도록 설계되었습니다.**
    - API는 확정된 것이 아니며 최종 2.0 릴리스 전에 변경될 수 있습니다.
    - `Image`와 유사한 API를 가지며 `Alignment`, `ContentScale`, `alpha`, `ColorFilter`, `FilterQuality`와 동일한 인자를 지원합니다.
    - `content`, `loading`, `success`, `error` 인자를 사용하여 각 `AsyncImagePainter` 상태에 대해 그려질 내용을 덮어쓰는 기능을 지원합니다.
    - `rememberImagePainter`가 이미지 크기 및 배율을 결정할 때 갖고 있던 수많은 디자인 문제를 해결했습니다.
    - 사용 예시:

```kotlin
// 이미지만 표시
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null, // 가급적 `null`을 피하고 현지화된 문자열로 설정하세요.
)

// 원형 자르기, 크로스페이드 및 `loading` 상태 덮어쓰기를 적용하여 이미지 표시
AsyncImage(
    model = ImageRequest.Builder(LocalContext.current)
        .data("https://example.com/image.jpg")
        .crossfade(true)
        .build(),
    contentDescription = null,
    modifier = Modifier
        .clip(CircleShape),
    loading = {
        CircularProgressIndicator()
    },
    contentScale = ContentScale.Crop
)

// 원형 자르기, 크로스페이드 및 모든 상태를 덮어써서 이미지 표시
AsyncImage(
    model = ImageRequest.Builder(LocalContext.current)
        .data("https://example.com/image.jpg")
        .crossfade(true)
        .build(),
    contentDescription = null,
    modifier = Modifier
        .clip(CircleShape),
    contentScale = ContentScale.Crop
) { state ->
    if (state is AsyncImagePainter.State.Loading) {
        CircularProgressIndicator()
    } else {
        AsyncImageContent() // 이미지를 그립니다.
    }
}
```

- **중요**: `ImagePainter`의 이름을 `AsyncImagePainter`로, `rememberImagePainter`를 `rememberAsyncImagePainter`로 변경했습니다.
    - `ExecuteCallback`은 더 이상 지원되지 않습니다. `AsyncImagePainter`가 `onDraw` 호출 대기를 건너뛰도록 하려면 대신 `ImageRequest.size(OriginalSize)`(또는 특정 크기)를 설정하세요.
    - `rememberAsyncImagePainter`에 선택적 `FilterQuality` 인자를 추가했습니다.
- `DiskCache`의 정리 작업에 코루틴을 사용하도록 변경하고 `DiskCache.Builder.cleanupDispatcher`를 추가했습니다.
- `ImageLoader.Builder.placeholder`를 사용하여 설정된 플레이스홀더에 대한 Compose 미리보기를 수정했습니다.
- 더 효율적인 코드를 생성하도록 `LocalImageLoader.current`에 `@ReadOnlyComposable`을 마킹했습니다.
- Compose를 1.1.0-beta03으로 업데이트하고 `compose.ui` 대신 `compose.foundation`에 의존하도록 변경했습니다.
- `androidx.appcompat-resources`를 1.4.0으로 업데이트했습니다.

## [2.0.0-alpha03] - 2021년 11월 12일 {id="2-0-0-alpha03-november-12-2021"}

- Android 29 이상에서 음악 썸네일을 로드하는 기능을 추가했습니다. ([#967](https://github.com/coil-kt/coil/pull/967))
- 수정: 현재 패키지의 리소스를 로드할 때 `context.resources`를 사용하도록 수정했습니다. ([#968](https://github.com/coil-kt/coil/pull/968))
- 수정: `clear` -> `dispose` 대체 표현식을 수정했습니다. ([#970](https://github.com/coil-kt/coil/pull/970))
- Compose를 1.0.5로 업데이트했습니다.
- `accompanist-drawablepainter`를 0.20.2로 업데이트했습니다.
- Okio를 3.0.0으로 업데이트했습니다.
- `androidx.annotation`을 1.3.0으로 업데이트했습니다.
- `androidx.core`를 1.7.0으로 업데이트했습니다.
- `androidx.lifecycle`을 2.4.0으로 업데이트했습니다.
    - `lifecycle-common`에 병합됨에 따라 `lifecycle-common-java8`에 대한 의존성을 제거했습니다.

## [2.0.0-alpha02] - 2021년 10월 24일 {id="2-0-0-alpha02-october-24-2021"}

- [BOM(Bill of Materials)](https://docs.gradle.org/7.2/userguide/platforms.html#sub:bom_import)을 포함하는 새로운 `coil-bom` 아티팩트를 추가했습니다.
    - `coil-bom`을 가져오면 버전을 명시하지 않고도 다른 Coil 아티팩트에 의존할 수 있습니다.
- `ExecuteCallback.Immediate`를 사용할 때 이미지 로드에 실패하던 문제를 수정했습니다.
- Okio를 3.0.0-alpha.11로 업데이트했습니다.
    - 이를 통해 Okio 3.0.0-alpha.11과의 호환성 문제도 해결되었습니다.
- Kotlin을 1.5.31로 업데이트했습니다.
- Compose를 1.0.4로 업데이트했습니다.

## [2.0.0-alpha01] - 2021년 10월 11일 {id="2-0-0-alpha01-october-11-2021"}

Coil 2.0.0은 새로운 기능, 성능 향상, API 개선 및 다양한 버그 수정을 포함하는 라이브러리의 차세대 메이저 개편 버전입니다. 이 릴리스는 2.0.0의 안정화 버전이 출시될 때까지 향후 알파 릴리스와 바이너리/소스 호환성이 유지되지 않을 수 있습니다.

- **중요**: 최소 지원 API 버전이 이제 21입니다.
- **중요**: `-Xjvm-default=all`을 활성화했습니다.
    - 이를 통해 Kotlin의 기본 인터페이스 메서드 지원 대신 Java 8 디폴트 메서드가 생성됩니다. 자세한 내용은 [해당 블로그 포스트](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/)를 확인하세요.
    - **빌드 파일에도 `-Xjvm-default=all` 또는 `-Xjvm-default=all-compatibility`를 추가해야 합니다.** 설정 방법은 [여기](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8)를 참조하세요.
- **중요**: Coil은 이제 자체 디스크 캐시 구현체를 가지며 디스크 캐싱을 위해 OkHttp에 의존하지 않습니다.
    - 이 변경은 다음을 위해 이루어졌습니다:
        - 이미지 디코딩 중 스레드 인터럽트를 더 잘 지원합니다. 이를 통해 이미지 요청이 빠르게 연속해서 시작되고 중지될 때 성능이 향상됩니다.
        - `File` 기반의 `ImageSource` 노출을 지원합니다. Android API가 디코딩을 위해 `File`을 요구할 때(예: `MediaMetadataRetriever`) 불필요한 복사를 방지할 수 있습니다.
        - 디스크 캐시 파일에서 직접 읽기/쓰기를 지원합니다.
    - 디스크 캐시를 구성하려면 `ImageLoader.Builder.diskCache` 및 `DiskCache.Builder`를 사용하세요.
    - 디스크에 쓰는 도중 인터럽트가 발생하면 캐시가 손상될 수 있으므로 Coil 2.0에서는 OkHttp의 `Cache`를 **사용하지 않아야 합니다**.
    - `Cache-Control` 및 기타 캐시 헤더는 여전히 지원됩니다. 단, 캐시는 URL 일치 여부만 확인하므로 `Vary` 헤더는 제외됩니다. 또한 응답 코드가 [200..300) 범위에 있는 응답만 캐시됩니다.
    - 캐시 헤더 지원은 `ImageLoader.Builder.respectCacheHeaders`를 사용하여 활성화하거나 비활성화할 수 있습니다.
    - 2.0으로 업그레이드할 때 기존 디스크 캐시는 지워지고 다시 빌드됩니다.
- **중요**: `ImageRequest`의 기본 `Scale`이 이제 `Scale.FIT`입니다.
    - 기본 `Scale`을 갖는 다른 클래스들과 일관성을 유지하도록 `ImageRequest.scale`이 변경되었습니다.
    - `ImageViewTarget`을 사용하는 요청은 여전히 배율이 자동으로 감지됩니다.
- 이미지 파이프라인 클래스에 대한 대대적 변경:
    - 유연성을 높이기 위해 `Mapper`, `Fetcher`, `Decoder`가 리팩터링되었습니다.
    - `Fetcher.key`가 새로운 `Keyer` 인터페이스로 대체되었습니다. `Keyer`는 입력 데이터로부터 캐시 키를 생성합니다.
    - `Decoder`가 직접 `File`을 디코딩할 수 있도록 지원하는 `ImageSource`를 추가했습니다.
- `BitmapPool` 및 `PoolableViewTarget`이 라이브러리에서 제거되었습니다. 비트맵 풀링이 제거된 이유는 다음과 같습니다:
    - API 23 이하에서 가장 효과적이었으며, 최신 Android 릴리스에서는 그 효과가 점차 줄어들었습니다.
    - 비트맵 풀링을 제거함으로써 성능상 이점이 있는 불변(immutable) 비트맵을 Coil에서 사용할 수 있게 됩니다.
    - 비트맵 풀을 관리하는 데 따른 런타임 오버헤드가 존재합니다.
    - 비트맵 풀링은 비트맵이 풀링에 적합한지 여부를 추적해야 하므로 Coil의 API에 설계상의 제약을 만들었습니다. 비트맵 풀링을 제거하면 Coil이 더 많은 곳(예: `Listener`, `Disposable`)에서 결과 `Drawable`을 노출할 수 있습니다. 또한 Coil이 `ImageView`를 지울 필요가 없어지므로 여러 [문제](https://github.com/coil-kt/coil/issues/650)를 방지할 수 있습니다.
    - 비트맵 풀링은 [오류가 발생하기 쉽습니다](https://github.com/coil-kt/coil/issues/546). 새 비트맵을 할당하는 것이 여전히 사용 중일 수 있는 비트맵을 재사용하려고 시도하는 것보다 훨씬 안전합니다.
- 유연성을 높이기 위해 `MemoryCache`를 리팩터링했습니다.
- 런타임 not-null 단언문 생성을 비활성화했습니다.
    - Java를 사용하는 경우 not-null로 애너테이션된 매개변수에 null을 전달해도 더 이상 즉시 `NullPointerException`이 발생하지 않습니다. Kotlin을 사용하는 경우에는 실질적인 변화가 없습니다.
    - 이 변경을 통해 라이브러리 크기를 줄일 수 있습니다.
- `VideoFrameFileFetcher` 및 `VideoFrameUriFetcher`가 라이브러리에서 제거되었습니다. 대신 모든 데이터 소스를 지원하는 `VideoFrameDecoder`를 사용하세요.
- 진행 중인 `BitmapFactory` 작업의 최대 수를 제한하는 `bitmapFactoryMaxParallelism` 지원을 추가했습니다. 이 값은 기본적으로 4이며 UI 성능을 향상시킵니다.
- `interceptorDispatcher`, `fetcherDispatcher`, `decoderDispatcher`, `transformationDispatcher` 지원을 추가했습니다.
- `Disposable`이 리팩터링되었으며 내부 `ImageRequest`의 잡을 노출합니다.
- 전환이 완료될 때까지 지연시킬 필요가 없어짐에 따라 `Transition.transition`을 non-suspending 함수로 변경했습니다.
- 공통 `ViewTarget` 로직을 처리하는 `GenericViewTarget`을 추가했습니다.
- [`BlurTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/BlurTransformation.kt) 및 [`GrayscaleTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/GrayscaleTransformation.kt)이 라이브러리에서 제거되었습니다.
    - 이를 사용하는 경우 해당 코드를 프로젝트로 복사하여 사용할 수 있습니다.
- `ImageRequest.fallback`이 null인 경우 `Target`에 `ImageRequest.error`가 설정되도록 변경했습니다.
- `Transformation.key`가 `Transformation.cacheKey`로 대체되었습니다.
- `ImageRequest.Listener`가 `onSuccess`와 `onError`에서 각각 `SuccessResult`/`ErrorResult`를 반환하도록 변경했습니다.
- 기본 지원 데이터 타입에 `ByteBuffer`를 추가했습니다.
- 여러 클래스에서 `toString` 구현을 제거했습니다.
- OkHttp를 4.9.2로 업데이트했습니다.
- Okio를 3.0.0-alpha.10으로 업데이트했습니다.

## [1.4.0] - 2021년 10월 6일 {id="1-4-0-october-6-2021"}

- **신규**: `ImagePainter.State.Success` 및 `ImagePainter.State.Error`에 `ImageResult`를 추가했습니다. ([#887](https://github.com/coil-kt/coil/pull/887))
    - 이는 `ImagePainter.State.Success` 및 `ImagePainter.State.Error`의 시그니처에 바이너리 비호환 변경 사항이지만, 이 API들은 실험적으로 마킹되어 있습니다.
- `View.isShown`이 `true`인 경우에만 `CrossfadeTransition`을 실행하도록 변경했습니다. 이전에는 `View.isVisible`만 확인했습니다. ([#898](https://github.com/coil-kt/coil/pull/898))
- 반올림 문제로 인해 스케일 배율이 1보다 약간 작을 때 발생할 수 있던 잠재적 메모리 캐시 미스를 수정했습니다. ([#899](https://github.com/coil-kt/coil/pull/899))
- 인라인되지 않은 `ComponentRegistry` 메서드를 공개 API로 전환했습니다. ([#925](https://github.com/coil-kt/coil/pull/925))
- `accompanist-drawablepainter`에 의존하도록 하고 Coil의 커스텀 `DrawablePainter` 구현을 제거했습니다. ([#845](https://github.com/coil-kt/coil/pull/845))
- 디슈가링(desugaring) 문제를 방지하기 위해 Java 8 메서드 사용을 제거했습니다. ([#924](https://github.com/coil-kt/coil/pull/924))
- `ImagePainter.ExecuteCallback`을 안정화된 API로 승격했습니다. ([#927](https://github.com/coil-kt/coil/pull/927))
- compileSdk를 31로 업데이트했습니다.
- Kotlin을 1.5.30으로 업데이트했습니다.
- Coroutines를 1.5.2로 업데이트했습니다.
- Compose를 1.0.3으로 업데이트했습니다.

## [1.3.2] - 2021년 8월 4일 {id="1-3-2-august-4-2021"}

- `coil-compose`가 이제 `compose.foundation` 대신 `compose.ui`에 의존합니다.
    - `compose.ui`는 `compose.foundation`의 하위 집합이므로 더 작은 의존성입니다.
- Jetpack Compose를 1.0.1로 업데이트했습니다.
- Kotlin을 1.5.21로 업데이트했습니다.
- Coroutines를 1.5.1로 업데이트했습니다.
- `androidx.exifinterface:exifinterface`를 1.3.3으로 업데이트했습니다.

## [1.3.1] - 2021년 7월 28일 {id="1-3-1-july-28-2021"}

- Jetpack Compose를 `1.0.0`으로 업데이트했습니다. Compose 팀의 [안정화 릴리스](https://android-developers.googleblog.com/2021/07/jetpack-compose-announcement.html)를 진심으로 축하합니다!
- `androidx.appcompat:appcompat-resources`를 1.3.1로 업데이트했습니다.

## [1.3.0] - 2021년 7월 10일 {id="1-3-0-july-10-2021"}

- **신규**: [Jetpack Compose](https://developer.android.com/jetpack/compose) 지원을 추가했습니다. 이는 [Accompanist](https://github.com/google/accompanist/)의 Coil 연동을 기반으로 하지만 몇 가지 변경 사항이 있습니다. 자세한 내용은 [문서](https://coil-kt.github.io/coil/compose/)를 참조하세요.
- `Transformation`에 대한 자동 비트맵 변환을 활성화/비활성화할 수 있도록 `allowConversionToBitmap`을 추가했습니다. ([#775](https://github.com/coil-kt/coil/pull/775))
- GIF의 프레임 딜레이가 임계값 미만인 경우 이를 다시 작성할 수 있도록 `ImageDecoderDecoder` 및 `GifDecoder`에 `enforceMinimumFrameDelay`를 추가했습니다. ([#783](https://github.com/coil-kt/coil/pull/783))
    - 이는 기본적으로 비활성화되어 있지만 향후 릴리스에서는 기본적으로 활성화될 예정입니다.
- `ImageLoader` 내부 네트워크 관찰자의 활성화/비활성화 지원을 추가했습니다. ([#741](https://github.com/coil-kt/coil/pull/741))
- `BitmapFactoryDecoder`에 의해 디코딩된 비트맵의 밀도를 수정했습니다. ([#776](https://github.com/coil-kt/coil/pull/776))
- Licensee가 Coil의 라이선스 URL을 찾지 못하던 문제를 수정했습니다. ([#774](https://github.com/coil-kt/coil/pull/774))
- `androidx.core:core-ktx`를 1.6.0으로 업데이트했습니다.

## [1.2.2] - 2021년 6월 4일 {id="1-2-2-june-4-2021"}

- 공유 상태를 가진 드로어블을 비트맵으로 변환할 때 발생하던 경쟁 상태를 수정했습니다. ([#771](https://github.com/coil-kt/coil/pull/771))
- `ImageLoader.Builder.fallback`이 `fallback` 드로어블 대신 `error` 드로어블을 설정하던 문제를 수정했습니다.
- `ResourceUriFetcher`가 잘못된 데이터 소스를 반환하던 문제를 수정했습니다. ([#770](https://github.com/coil-kt/coil/pull/770))
- API 26 및 27에서 사용 가능한 파일 디스크립터가 없는지 확인하는 로그 검사를 수정했습니다.
- 플랫폼 벡터 드로어블 지원에 대한 잘못된 버전 검사를 수정했습니다. ([#751](https://github.com/coil-kt/coil/pull/751))
- Kotlin을 업데이트했습니다(1.5.10).
- Coroutines를 업데이트했습니다(1.5.0).
- `androidx.appcompat:appcompat-resources`를 1.3.0으로 업데이트했습니다.
- `androidx.core:core-ktx`를 1.5.0으로 업데이트했습니다.

## [1.2.1] - 2021년 4월 27일 {id="1-2-1-april-27-2021"}

- `VideoFrameUriFetcher`가 http/https URI를 처리하려고 시도하던 문제를 수정했습니다. ([#734](https://github.com/coil-kt/coil/pull/734))

## [1.2.0] - 2021년 4월 12일 {id="1-2-0-april-12-2021"}

- **중요**: `SvgDecoder`에서 종횡비(aspect ratio)를 계산할 때 SVG의 뷰 바운드(view bounds)를 사용하도록 변경했습니다. ([#688](https://github.com/coil-kt/coil/pull/688))
    - 이전에는 `SvgDecoder`가 종횡비를 결정하기 위해 SVG의 `width`/`height` 요소를 사용했으나, 이는 SVG 사양을 올바르게 따르지 않는 방식이었습니다.
    - 이전 동작으로 되돌리려면 `SvgDecoder`를 생성할 때 `useViewBoundsAsIntrinsicSize = false`를 설정하세요.
- **신규**: 모든 소스에서 비디오 프레임 디코딩을 지원하는 `VideoFrameDecoder`를 추가했습니다. ([#689](https://github.com/coil-kt/coil/pull/689))
- **신규**: MIME 타입뿐만 아니라 소스의 내용을 기반으로 하는 자동 SVG 감지를 지원합니다. ([#654](https://github.com/coil-kt/coil/pull/654))
- **신규**: `ImageLoader.newBuilder()`를 사용한 리소스 공유를 지원합니다. ([#653](https://github.com/coil-kt/coil/pull/653))
    - 특히, 이를 통해 `ImageLoader` 인스턴스 간에 메모리 캐시를 공유할 수 있습니다.
- **신규**: `AnimatedTransformation`을 사용한 애니메이션 이미지 변환 지원을 추가했습니다. ([#659](https://github.com/coil-kt/coil/pull/659))
- **신규**: 애니메이션 드로어블에 대한 시작/종료 콜백 지원을 추가했습니다. ([#676](https://github.com/coil-kt/coil/pull/676))

---

- HEIF/HEIC 파일의 EXIF 데이터 파싱을 수정했습니다. ([#664](https://github.com/coil-kt/coil/pull/664))
- 비트맵 풀링이 비활성화된 경우 `EmptyBitmapPool` 구현체를 사용하지 않던 문제를 수정했습니다. ([#638](https://github.com/coil-kt/coil/pull/638))
    - 이 수정 전에도 비트맵 풀링은 정상적으로 비활성화되었으나 더 무거운 `BitmapPool` 구현체를 사용하고 있었습니다.
- `MovieDrawable.getOpacity`가 잘못 투명(transparent)을 반환하던 문제를 수정했습니다. ([#682](https://github.com/coil-kt/coil/pull/682))
- 기본 임시 디렉터리가 존재하지 않는 경우에 대한 방어 코드를 추가했습니다. ([#683](https://github.com/coil-kt/coil/pull/683))

---

- JVM IR 백엔드를 사용하여 빌드합니다. ([#670](https://github.com/coil-kt/coil/pull/670))
- Kotlin을 업데이트했습니다(1.4.32).
- Coroutines를 업데이트했습니다(1.4.3).
- OkHttp를 업데이트했습니다(3.12.13).
- `androidx.lifecycle:lifecycle-common-java8`을 2.3.1로 업데이트했습니다.

## [1.1.1] - 2021년 1월 11일 {id="1-1-1-january-11-2021"}

- 코루틴을 두 번 이상 재개하여 `ViewSizeResolver.size`에서 `IllegalStateException`이 발생할 수 있던 문제를 수정했습니다.
- 메인 스레드에서 호출될 경우 `HttpFetcher`가 무한정 차단(block)되던 문제를 수정했습니다.
    - `ImageRequest.dispatcher(Dispatchers.Main.immediate)`를 사용하여 메인 스레드에서 강제로 실행되는 요청은 `ImageRequest.networkCachePolicy`가 `CachePolicy.DISABLED` 또는 `CachePolicy.WRITE_ONLY`로 설정되지 않은 한 `NetworkOnMainThreadException`으로 실패합니다.
- 비디오에 회전 메타데이터가 있는 경우 `VideoFrameFetcher`에서 비디오 프레임을 회전하도록 했습니다.
- Kotlin을 업데이트했습니다(1.4.21).
- Coroutines를 업데이트했습니다(1.4.2).
- Okio를 업데이트했습니다(2.10.0).
- `androidx.exifinterface:exifinterface`를 업데이트했습니다(1.3.2).

## [1.1.0] - 2020년 11월 24일 {id="1-1-0-november-24-2020"}

- **중요**: `ImageView`의 `CENTER` 및 `MATRIX` 스케일 타입이 `OriginalSize`로 결정되도록 변경했습니다. ([#587](https://github.com/coil-kt/coil/pull/587))
    - 이 변경은 요청 크기가 명시적으로 지정되지 않았을 때의 암시적 크기 결정 알고리즘에만 영향을 미칩니다.
    - 이미지 요청의 시각적 결과가 `ImageView.setImageResource`/`ImageView.setImageURI`와 일관되도록 하기 위해 이 변경이 이루어졌습니다. 이전 동작으로 되돌리려면 요청 구성 시 `ViewSizeResolver`를 설정하세요.
- **중요**: 뷰의 레이아웃 매개변수가 `WRAP_CONTENT`인 경우 `ViewSizeResolver`에서 디스플레이 크기를 반환하도록 변경했습니다. ([#562](https://github.com/coil-kt/coil/pull/562))
    - 이전에는 뷰가 완전히 배치(layout)된 경우에만 디스플레이 크기를 반환했습니다. 이 변경을 통해 일반적인 동작이 보다 일관되고 직관적으로 변경되었습니다.
- 알파 프리멀티플리케이션(pre-multiplication) 제어 기능을 추가했습니다. ([#569](https://github.com/coil-kt/coil/pull/569))
- `CrossfadeDrawable`에서 정확한 고유 크기 선호 설정을 지원합니다. ([#585](https://github.com/coil-kt/coil/pull/585))
- 버전을 포함한 완전한 GIF 헤더를 확인하도록 변경했습니다. ([#564](https://github.com/coil-kt/coil/pull/564))
- 빈(empty) 비트맵 풀 구현체를 추가했습니다. ([#561](https://github.com/coil-kt/coil/pull/561))
- `EventListener.Factory`를 함수형 인터페이스(functional interface)로 만들었습니다. ([#575](https://github.com/coil-kt/coil/pull/575))
- `EventListener`를 안정화했습니다. ([#574](https://github.com/coil-kt/coil/pull/574))
- `ImageRequest.Builder.placeholderMemoryCacheKey`에 대한 `String` 오버로드를 추가했습니다.
- `ViewSizeResolver` 생성자에 `@JvmOverloads`를 추가했습니다.
- 수정: `CrossfadeDrawable`에서 시작/종료 드로어블을 mutate(독립 복제)하도록 수정했습니다. ([#572](https://github.com/coil-kt/coil/pull/572))
- 수정: 두 번째 로드 시 GIF가 재생되지 않던 문제를 수정했습니다. ([#577](https://github.com/coil-kt/coil/pull/534))
- Kotlin을 업데이트하고(1.4.20) `kotlin-parcelize` 플러그인으로 마이그레이션했습니다.
- Coroutines를 업데이트했습니다(1.4.1).

## [1.0.0] - 2020년 10월 22일 {id="1-0-0-october-22-2020"}

`0.13.0` 이후 변경 사항:
- `Context.imageLoader` 확장 함수를 추가했습니다. ([#534](https://github.com/coil-kt/coil/pull/534))
- `ImageLoader.executeBlocking` 확장 함수를 추가했습니다. ([#537](https://github.com/coil-kt/coil/pull/537))
- 싱글톤 이미지 로더가 교체되더라도 이전 이미지 로더를 종료(shutdown)하지 않도록 변경했습니다. ([#533](https://github.com/coil-kt/coil/pull/533))

`1.0.0-rc3` 이후 변경 사항:
- 수정: ActivityManager가 없거나 잘못된 경우에 대한 방어 코드를 추가했습니다. ([#541](https://github.com/coil-kt/coil/pull/541))
- 수정: OkHttp가 실패한 응답을 캐시할 수 있도록 허용했습니다. ([#551](https://github.com/coil-kt/coil/pull/551))
- Kotlin을 1.4.10으로 업데이트했습니다.
- Okio를 2.9.0으로 업데이트했습니다.
- `androidx.exifinterface:exifinterface`를 1.3.1로 업데이트했습니다.

## [1.0.0-rc3] - 2020년 9월 21일 {id="1-0-0-rc3-september-21-2020"}

- 불안정성으로 인해 [`-Xjvm-default=all`](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/) 컴파일러 플래그 사용을 되돌렸습니다.
    - **이는 이전 릴리스 후보(RC) 버전 대비 소스 호환성은 유지되지만 바이너리 호환성은 깨지는 변경 사항입니다.**
- `Context.imageLoader` 확장 함수를 추가했습니다. ([#534](https://github.com/coil-kt/coil/pull/534))
- `ImageLoader.executeBlocking` 확장 함수를 추가했습니다. ([#537](https://github.com/coil-kt/coil/pull/537))
- 싱글톤 이미지 로더가 교체되더라도 이전 이미지 로더를 종료하지 않도록 변경했습니다. ([#533](https://github.com/coil-kt/coil/pull/533))
- AndroidX 의존성을 업데이트했습니다:
    - `androidx.exifinterface:exifinterface` -> 1.3.0

## [1.0.0-rc2] - 2020년 9월 3일 {id="1-0-0-rc2-september-3-2020"}

- **이 릴리스는 Kotlin 1.4.0 이상이 필요합니다.**
- [0.13.0](#0130-september-3-2020)에 포함된 모든 변경 사항이 적용되었습니다.
- `stdlib-jdk8` 대신 기본 Kotlin `stdlib`에 의존하도록 변경했습니다.

## [0.13.0] - 2020년 9월 3일 {id="0-13-0-september-3-2020"}

- **중요**: 기본적으로 인터셉터 체인을 메인 스레드에서 시작하도록 변경했습니다. ([#513](https://github.com/coil-kt/coil/pull/513))
    - 이를 통해 메모리 캐시를 메인 스레드에서 동기적으로 확인하던 `0.11.0` 이하의 동작이 대폭 복원됩니다.
    - `ImageRequest.dispatcher`에서 메모리 캐시를 확인하던 `0.12.0`과 동일한 동작으로 되돌리려면 `ImageLoader.Builder.launchInterceptorChainOnMainThread(false)`를 설정하세요.
    - 자세한 정보는 [`launchInterceptorChainOnMainThread`](https://coil-kt.github.io/coil/api/coil-core/coil3/-image-loader/-builder/launch-interceptor-chain-on-main-thread/)를 확인하세요.

---

- 수정: 분리된(detached) 프래그먼트의 `ViewTarget`에서 요청이 시작될 때 발생할 수 있던 잠재적 메모리 누수를 수정했습니다. ([#518](https://github.com/coil-kt/coil/pull/518))
- 수정: 리소스 URI 로드 시 `ImageRequest.context`를 사용하도록 수정했습니다. ([#517](https://github.com/coil-kt/coil/pull/517))
- 수정: 후속 요청이 디스크 캐시에 저장되지 않던 경쟁 상태를 수정했습니다. ([#510](https://github.com/coil-kt/coil/pull/510))
- 수정: API 18에서 `blockCountLong` 및 `blockSizeLong`을 사용하도록 수정했습니다.

---

- `ImageLoaderFactory`를 fun 인터페이스로 변경했습니다.
- `File`에서 로드된 이미지의 메모리 캐시 키에 최종 수정 타임스탬프를 추가할지 여부를 설정할 수 있는 `ImageLoader.Builder.addLastModifiedToFileCacheKey`를 추가했습니다.

---

- Kotlin을 1.4.0으로 업데이트했습니다.
- Coroutines를 1.3.9로 업데이트했습니다.
- Okio를 2.8.0으로 업데이트했습니다.

## [1.0.0-rc1] - 2020년 8월 18일 {id="1-0-0-rc1-august-18-2020"}

- **이 릴리스는 Kotlin 1.4.0 이상이 필요합니다.**
- Kotlin을 1.4.0으로 업데이트하고 [`-Xjvm-default=all`](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/)을 활성화했습니다.
    - **빌드 파일에서 `-Xjvm-default=all`을 활성화하는 방법은 [여기](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8)를 참조하세요.**
    - 이를 통해 기본 Kotlin 인터페이스 메서드에 대해 Java 8 디폴트 메서드가 생성됩니다.
- 0.12.0에 있던 기존의 모든 지원 중단 메서드를 제거했습니다.
- Coroutines를 1.3.9로 업데이트했습니다.

## [0.12.0] - 2020년 8월 18일 {id="0-12-0-august-18-2020"}

- **주요 변경 사항(Breaking)**: `LoadRequest` 및 `GetRequest`가 `ImageRequest`로 대체되었습니다:
    - `ImageLoader.execute(LoadRequest)` -> `ImageLoader.enqueue(ImageRequest)`
    - `ImageLoader.execute(GetRequest)` -> `ImageLoader.execute(ImageRequest)`
    - `ImageRequest`는 `equals`/`hashCode`를 구현합니다.
- **주요 변경 사항(Breaking)**: 여러 클래스의 이름이 변경되거나 패키지가 변경되었습니다:
    - `coil.request.RequestResult` -> `coil.request.ImageResult`
    - `coil.request.RequestDisposable` -> `coil.request.Disposable`
    - `coil.bitmappool.BitmapPool` -> `coil.bitmap.BitmapPool`
    - `coil.DefaultRequestOptions` -> `coil.request.DefaultRequestOptions`
- **주요 변경 사항(Breaking)**: 공개 API에서 [`SparseIntArraySet`](https://github.com/coil-kt/coil/blob/f52addd039f0195b66f93cb0f1cad59b0832f784/coil-core/src/main/java/coil/collection/SparseIntArraySet.kt)이 제거되었습니다.
- **주요 변경 사항(Breaking)**: `TransitionTarget`이 더 이상 `ViewTarget`을 구현하지 않습니다.
- **주요 변경 사항(Breaking)**: `ImageRequest.Listener.onSuccess`의 시그니처가 단순 `DataSource` 대신 `ImageResult.Metadata`를 반환하도록 변경되었습니다.
- **주요 변경 사항(Breaking)**: `LoadRequest.aliasKeys` 지원을 제거했습니다. 이 API는 메모리 캐시에 대한 직접 읽기/쓰기 접근을 통해 더 잘 처리할 수 있습니다.

---

- **중요**: 메모리 캐시의 값이 더 이상 동기적으로 확인되지 않습니다(메인 스레드에서 호출된 경우).
    - 이 변경은 백그라운드 디스패처에서 `Interceptor`를 실행할 수 있도록 지원하기 위해 필요했습니다.
    - 또한 이 변경을 통해 메인 스레드 외부로 더 많은 작업을 이동시켜 성능을 향상시킵니다.
- **중요**: `Mapper`가 이제 백그라운드 디스패처에서 실행됩니다. 부수 효과로 자동 비트맵 샘플링이 더 이상 **자동으로** 지원되지 않습니다. 동일한 효과를 얻으려면 이전 요청의 `MemoryCache.Key`를 후속 요청의 `placeholderMemoryCacheKey`로 사용하세요. [예시는 여기를 참조하세요](https://coil-kt.github.io/coil/recipes#using-a-memory-cache-key-as-a-placeholder).
    - `placeholderMemoryCacheKey` API는 서로 다른 데이터를 가진 두 이미지 요청(예: 작음/큼 이미지에 대한 서로 다른 URL)을 "연결"할 수 있어 더 많은 자유도를 제공합니다.
- **중요**: Coil의 `ImageView` 확장 함수가 `coil.api` 패키지에서 `coil` 패키지로 이동되었습니다.
    - 찾기 및 바꾸기를 사용하여 `import coil.api.load` -> `import coil.load`로 리팩터링하세요. 아쉽게도 import 문을 대체하기 위해 Kotlin의 `ReplaceWith` 기능을 사용할 수는 없습니다.
- **중요**: 드로어블이 동일한 이미지가 아닌 경우 표준 크로스페이드를 사용하도록 변경했습니다.
- **중요**: API 24 이상에서는 불변 비트맵을 선호하도록 변경했습니다.
- **중요**: 새로운 `Interceptor` 인터페이스를 선호하여 `MeasuredMapper`를 지원 중단했습니다. `MeasuredMapper`를 `Interceptor`로 변환하는 방법의 예는 [여기](https://gist.github.com/colinrtwhite/90267704091467451e46b21b95154299)를 참조하세요.
    - `Interceptor`는 훨씬 덜 제한적인 API로, 더 다양한 커스텀 로직을 허용합니다.
- **중요**: `ImageRequest.data`가 이제 non-null입니다. 데이터를 설정하지 않고 `ImageRequest`를 생성하면 데이터로 `NullRequestData`를 반환합니다.

---

- **신규**: `ImageLoader`의 `MemoryCache`에 대한 직접 읽기/쓰기 접근 지원을 추가했습니다. 자세한 정보는 [공식 문서](https://coil-kt.github.io/coil/getting_started/#memory-cache)를 확인하세요.
- **신규**: `Interceptor` 지원을 추가했습니다. 자세한 정보는 [공식 문서](https://coil-kt.github.io/coil/image_pipeline/#interceptors)를 확인하세요. Coil의 `Interceptor` 디자인은 [OkHttp](https://github.com/square/okhttp)에서 많은 영감을 받았습니다!
- **신규**: `ImageLoader.Builder.bitmapPoolingEnabled`를 사용하여 비트맵 풀링을 활성화/비활성화하는 기능을 추가했습니다.
    - 비트맵 풀링은 API 23 이하에서 가장 효과적이지만, API 24 이상에서도 (`Bitmap.recycle`을 적극적으로 호출함으로써) 여전히 유용할 수 있습니다.
- **신규**: 디코딩 중 스레드 인터럽트를 지원합니다.

---

- content-type 헤더의 다중 세그먼트 파싱을 수정했습니다.
- 비트맵 참조 카운팅이 보다 견고해지도록 개편했습니다.
- API 19 미만 기기에서의 WebP 디코딩을 수정했습니다.
- EventListener API에 FetchResult 및 DecodeResult를 노출했습니다.

---

- SDK 30으로 컴파일합니다.
- Coroutines를 1.3.8로 업데이트했습니다.
- OkHttp를 3.12.12로 업데이트했습니다.
- Okio를 2.7.0으로 업데이트했습니다.
- AndroidX 의존성을 업데이트했습니다:
    - `androidx.appcompat:appcompat-resources` -> 1.2.0
    - `androidx.core:core-ktx` -> 1.3.1

## [0.11.0] - 2020년 5월 14일 {id="0-11-0-may-14-2020"}

- **주요 변경 사항(Breaking)**: **이 버전에서는 기존의 모든 지원 중단 함수를 제거했습니다.**
    - 이를 통해 앱 시작 시 아무런 코드도 실행하지 않도록 Coil의 `ContentProvider`를 제거할 수 있게 되었습니다.
- **주요 변경 사항(Breaking)**: `SparseIntArraySet.size`를 val로 변경했습니다. ([#380](https://github.com/coil-kt/coil/pull/380))
- **주요 변경 사항(Breaking)**: `Parameters.count()`를 확장 함수로 이동했습니다. ([#403](https://github.com/coil-kt/coil/pull/403))
- **주요 변경 사항(Breaking)**: `BitmapPool.maxSize`를 Int로 변경했습니다. ([#404](https://github.com/coil-kt/coil/pull/404))

---

- **중요**: `ImageLoader.shutdown()`을 선택적(optional)으로 변경했습니다(`OkHttpClient`와 유사). ([#385](https://github.com/coil-kt/coil/pull/385))

---

- 수정: AGP 4.1 호환성을 수정했습니다. ([#386](https://github.com/coil-kt/coil/pull/386))
- 수정: GONE 상태인 뷰의 측정을 수정했습니다. ([#397](https://github.com/coil-kt/coil/pull/397))

---

- 기본 메모리 캐시 크기를 20%로 줄였습니다. ([#390](https://github.com/coil-kt/coil/pull/390))
    - 기존 동작을 복원하려면 `ImageLoader`를 생성할 때 `ImageLoaderBuilder.availableMemoryPercentage(0.25)`를 설정하세요.
- Coroutines를 1.3.6으로 업데이트했습니다.
- OkHttp를 3.12.11로 업데이트했습니다.

## [0.10.1] - 2020년 4월 26일 {id="0-10-1-april-26-2020"}

- API 23 이하에서 큰 PNG를 디코딩할 때 발생하던 OOM 문제를 수정했습니다. ([#372](https://github.com/coil-kt/coil/pull/372)).
    - 이는 PNG 파일에 대한 EXIF 방향 디코딩을 비활성화합니다. PNG EXIF 방향은 거의 사용되지 않으며, PNG EXIF 데이터를 읽으려면(비어 있더라도) 전체 파일을 메모리로 버퍼링해야 하므로 성능에 나쁜 영향을 미칩니다.
- `SparseIntArraySet`의 사소한 Java 호환성을 개선했습니다.

---

- Okio를 2.6.0으로 업데이트했습니다.

## [0.10.0] - 2020년 4월 20일 {id="0-10-0-april-20-2020"}

### 주요 사항 {id="highlights"}

- **이 버전에서는 빌더를 직접 사용하는 방식을 선호하여 대부분의 DSL API를 지원 중단했습니다.** 변경 사항은 다음과 같습니다:

    ```kotlin
    // 0.9.5 (이전)
    val imageLoader = ImageLoader(context) {
        bitmapPoolPercentage(0.5)
        crossfade(true)
    }

    val disposable = imageLoader.load(context, "https://example.com/image.jpg") {
        target(imageView)
    }

    val drawable = imageLoader.get("https://example.com/image.jpg") {
        size(512, 512)
    }

    // 0.10.0 (신규)
    val imageLoader = ImageLoader.Builder(context)
        .bitmapPoolPercentage(0.5)
        .crossfade(true)
        .build()

    val request = LoadRequest.Builder(context)
        .data("https://example.com/image.jpg")
        .target(imageView)
        .build()
    val disposable = imageLoader.execute(request)

    val request = GetRequest.Builder(context)
        .data("https://example.com/image.jpg")
        .size(512, 512)
        .build()
    val drawable = imageLoader.execute(request).drawable
    ```

    - `io.coil-kt:coil` 아티팩트를 사용하는 경우, `Coil.execute(request)`를 호출하여 싱글톤 `ImageLoader`로 요청을 실행할 수 있습니다.

- **`ImageLoader`에 약한 참조 메모리 캐시가 추가**되어, 강한 참조 메모리 캐시에서 제거된 이미지의 약한 참조를 추적합니다.
    - 즉, 이미지에 대한 강한 참조가 아직 남아 있다면 항상 `ImageLoader`의 메모리 캐시에서 이미지가 반환됩니다.
    - 일반적으로 이를 통해 메모리 캐시의 예측 가능성이 훨씬 높아지고 히트율이 증가합니다.
    - 이 동작은 `ImageLoaderBuilder.trackWeakReferences`를 통해 활성화/비활성화할 수 있습니다.

- 비디오 파일에서 특정 프레임을 디코딩하기 위한 새로운 아티팩트인 **`io.coil-kt:coil-video`**를 추가했습니다. [자세한 내용은 여기를 읽어보세요](https://coil-kt.github.io/coil/videos/).

- 메트릭 추적을 위한 새로운 [EventListener](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/EventListener.kt) API를 추가했습니다.

- 싱글톤 초기화를 단순화하기 위해 `Application`에서 구현할 수 있는 [ImageLoaderFactory](https://github.com/coil-kt/coil/blob/main/coil/src/main/java/coil/ImageLoaderFactory.kt)를 추가했습니다.

---

### 전체 릴리스 노트 {id="full-release-notes"}

- **중요**: 빌더 구문을 선호하여 DSL 구문을 지원 중단했습니다. ([#267](https://github.com/coil-kt/coil/pull/267))
- **중요**: `Coil` 및 `ImageLoader` 확장 함수를 지원 중단했습니다. ([#322](https://github.com/coil-kt/coil/pull/322))
- **주요 변경 사항(Breaking)**: `ImageLoader.execute(GetRequest)`에서 봉인된(sealed) `RequestResult` 타입을 반환하도록 변경했습니다. ([#349](https://github.com/coil-kt/coil/pull/349))
- **주요 변경 사항(Breaking)**: `ExperimentalCoil`의 이름을 `ExperimentalCoilApi`로 변경했습니다. `@Experimental`에서 `@RequiresOptIn`으로 마이그레이션했습니다. ([#306](https://github.com/coil-kt/coil/pull/306))
- **주요 변경 사항(Breaking)**: `CoilLogger`를 `Logger` 인터페이스로 대체했습니다. ([#316](https://github.com/coil-kt/coil/pull/316))
- **주요 변경 사항(Breaking)**: destWidth/destHeight의 이름을 dstWidth/dstHeight로 변경했습니다. ([#275](https://github.com/coil-kt/coil/pull/275))
- **주요 변경 사항(Breaking)**: `MovieDrawable`의 생성자 매개변수를 재정렬했습니다. ([#272](https://github.com/coil-kt/coil/pull/272))
- **주요 변경 사항(Breaking)**: `Request.Listener`의 메서드가 이제 데이터뿐만 아니라 전체 `Request` 객체를 받습니다.
- **주요 변경 사항(Breaking)**: `GetRequestBuilder`의 생성자에 이제 `Context`가 필요합니다.
- **주요 변경 사항(Breaking)**: `Request`의 여러 프로퍼티가 nullable로 변경되었습니다.
- **동작 변경**: 매개변수 값을 캐시 키에 기본적으로 포함하도록 변경했습니다. ([#319](https://github.com/coil-kt/coil/pull/319))
- **동작 변경**: `Target.onStart()` 직후에 호출되도록 `Request.Listener.onStart()` 타이밍을 소폭 조정했습니다. ([#348](https://github.com/coil-kt/coil/pull/348))

---

- **신규**: `WeakMemoryCache` 구현체를 추가했습니다. ([#295](https://github.com/coil-kt/coil/pull/295))
- **신규**: 비디오 프레임 디코딩을 지원하는 `coil-video`를 추가했습니다. ([#122](https://github.com/coil-kt/coil/pull/122))
- **신규**: [`EventListener`](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/EventListener.kt)를 도입했습니다. ([#314](https://github.com/coil-kt/coil/pull/314))
- **신규**: [`ImageLoaderFactory`](https://github.com/coil-kt/coil/blob/main/coil/src/main/java/coil/ImageLoaderFactory.kt)를 도입했습니다. ([#311](https://github.com/coil-kt/coil/pull/311))
- **신규**: Android 11에서 애니메이션 HEIF 이미지 시퀀스를 지원합니다. ([#297](https://github.com/coil-kt/coil/pull/297))
- **신규**: Java 호환성을 개선했습니다. ([#262](https://github.com/coil-kt/coil/pull/262))
- **신규**: 기본 `CachePolicy` 설정을 지원합니다. ([#307](https://github.com/coil-kt/coil/pull/307))
- **신규**: 기본 `Bitmap.Config` 설정을 지원합니다. ([#342](https://github.com/coil-kt/coil/pull/342))
- **신규**: 단일 메모리 캐시 항목을 지우는 `ImageLoader.invalidate(key)`를 추가했습니다 ([#55](https://github.com/coil-kt/coil/pull/55))
- **신규**: 캐시된 이미지가 재사용되지 않는 이유를 설명하는 디버그 로그를 추가했습니다. ([#346](https://github.com/coil-kt/coil/pull/346))
- **신규**: get 요청에 대한 `error` 및 `fallback` 드로어블을 지원합니다.

---

- 수정: Transformation이 입력 비트맵의 크기를 줄일 때 메모리 캐시 미스가 발생하던 문제를 수정했습니다. ([#357](https://github.com/coil-kt/coil/pull/357))
- 수정: BlurTransformation에서 반지름이 RenderScript 최댓값 미만인지 확인하도록 보장했습니다. ([#291](https://github.com/coil-kt/coil/pull/291))
- 수정: 높은 색 심도(high colour depth) 이미지 디코딩을 수정했습니다. ([#358](https://github.com/coil-kt/coil/pull/358))
- 수정: Android 11 이상에서 `ImageDecoderDecoder` 충돌 방지 임시 코드를 비활성화했습니다. ([#298](https://github.com/coil-kt/coil/pull/298))
- 수정: API 23 미만에서 EXIF 데이터를 읽지 못하던 문제를 수정했습니다. ([#331](https://github.com/coil-kt/coil/pull/331))
- 수정: Android R SDK와의 비호환성을 수정했습니다. ([#337](https://github.com/coil-kt/coil/pull/337))
- 수정: `ImageView`에 일치하는 `SizeResolver`가 있는 경우에만 부정확한 크기(inexact size)를 활성화하도록 수정했습니다. ([#344](https://github.com/coil-kt/coil/pull/344))
- 수정: 캐시된 이미지가 요청된 크기에서 최대 1픽셀까지 차이나는 것을 허용하도록 수정했습니다. ([#360](https://github.com/coil-kt/coil/pull/360))
- 수정: 뷰가 보이지 않는 경우 크로스페이드 전환을 건너뛰도록 수정했습니다. ([#361](https://github.com/coil-kt/coil/pull/361))

---

- `CoilContentProvider`를 지원 중단했습니다. ([#293](https://github.com/coil-kt/coil/pull/293))
- 여러 `ImageLoader` 메서드에 `@MainThread` 애너테이션을 추가했습니다.
- 수명 주기가 현재 시작된 상태인 경우 `LifecycleCoroutineDispatcher`를 생성하지 않도록 방지했습니다. ([#356](https://github.com/coil-kt/coil/pull/356))
- `OriginalSize.toString()`에 전체 패키지 이름을 사용하도록 했습니다.
- 소프트웨어 비트맵을 디코딩할 때 사전 할당(preallocate)하도록 변경했습니다. ([#354](https://github.com/coil-kt/coil/pull/354))

---

- Kotlin을 1.3.72로 업데이트했습니다.
- Coroutines를 1.3.5로 업데이트했습니다.
- OkHttp를 3.12.10으로 업데이트했습니다.
- Okio를 2.5.0으로 업데이트했습니다.
- AndroidX 의존성을 업데이트했습니다:
    - `androidx.exifinterface:exifinterface` -> 1.2.0

## [0.9.5] - 2020년 2월 6일 {id="0-9-5-february-6-2020"}

- 수정: 하드웨어 가속 여부를 확인하기 전에 뷰가 연결(attached)되어 있는지 확인하도록 보장했습니다. 이를 통해 하드웨어 비트맵을 요청할 때 메모리 캐시 미스가 발생할 수 있던 케이스를 수정했습니다.

---

- AndroidX 의존성을 업데이트했습니다:
    - `androidx.core:core-ktx` -> 1.2.0

## [0.9.4] - 2020년 2월 3일 {id="0-9-4-february-3-2020"}

- 수정: ImageDecoderDecoder에서 다운샘플링할 때 종횡비를 준수하도록 수정했습니다. @zhanghai님께 감사드립니다.

---

- 이전에는 캐시된 비트맵의 구성이 요청에 지정된 구성보다 크거나 같기만 하면 메모리 캐시에서 비트맵이 반환되었습니다. 예를 들어 `ARGB_8888` 비트맵을 요청한 경우 메모리 캐시에서 `RGBA_F16` 비트맵이 반환될 수 있었습니다. 이제는 캐시된 구성과 요청된 구성이 동일해야 합니다.
- `CrossfadeDrawable` 및 `CrossfadeTransition`에서 `scale` 및 `durationMillis`를 공개로 변경했습니다.

## [0.9.3] - 2020년 2월 1일 {id="0-9-3-february-1-2020"}

- 수정: 중앙에 위치하도록 `ScaleDrawable` 내부의 자식 드로어블을 평행 이동(translate)했습니다.
- 수정: GIF 및 SVG가 경계를 완전히 채우지 못하던 케이스를 수정했습니다.

---

- `HttpUrl.get()` 호출을 백그라운드 스레드로 지연시켰습니다.
- BitmapFactory의 null 비트맵 오류 메시지를 개선했습니다.
- 하드웨어 비트맵 블랙리스트에 기기 3개를 추가했습니다. ([#264](https://github.com/coil-kt/coil/pull/264))

---

- AndroidX 의존성을 업데이트했습니다:
    - `androidx.lifecycle:lifecycle-common-java8` -> 2.2.0

## [0.9.2] - 2020년 1월 19일 {id="0-9-2-january-19-2020"}

- 수정: API 19 미만에서 GIF 디코딩 문제를 수정했습니다. @mario님께 감사드립니다.
- 수정: 래스터화된 벡터 드로어블이 샘플링된 것으로 표시되지 않던 문제를 수정했습니다.
- 수정: Movie 치수가 0 이하인 경우 예외를 발생시키도록 수정했습니다.
- 수정: 메모리 캐시 이벤트에 대해 CrossfadeTransition이 재개되지 않던 문제를 수정했습니다.
- 수정: 허용되지 않은 경우 모든 타깃 메서드에 하드웨어 비트맵이 반환되지 않도록 방지했습니다.
- 수정: MovieDrawable이 경계의 중앙에 위치하지 않던 문제를 수정했습니다.

---

- CrossfadeDrawable에서 자동 배율 조정을 제거했습니다.
- `BitmapPool.trimMemory`를 공개로 변경했습니다.
- AnimatedImageDrawable이 경계를 채우도록 ScaleDrawable로 감쌌습니다.
- RequestBuilder.setParameter에 @JvmOverloads를 추가했습니다.
- SVG의 view box가 설정되어 있지 않은 경우 view box를 해당 크기로 설정했습니다.
- CrossfadeDrawable 자식들에게 상태 및 레벨 변경 사항을 전달하도록 했습니다.

---

- OkHttp를 3.12.8로 업데이트했습니다.

## [0.9.1] - 2019년 12월 30일 {id="0-9-1-december-30-2019"}

- 수정: `LoadRequestBuilder.crossfade(false)`를 호출할 때 비정상 종료되던 문제를 수정했습니다.

## [0.9.0] - 2019년 12월 30일 {id="0-9-0-december-30-2019"}

- **주요 변경 사항(Breaking)**: `Transformation.transform`에 이제 `Size` 매개변수가 포함됩니다. 이는 `Target`의 크기에 따라 출력 `Bitmap`의 크기를 변경하는 transformation을 지원하기 위함입니다. Transformation이 있는 요청은 이제 [이미지 샘플링](https://coil-kt.github.io/coil/getting_started/#image-sampling)에서도 제외됩니다.
- **주요 변경 사항(Breaking)**: `Transformation`이 이제 모든 타입의 `Drawable`에 적용됩니다. 이전에는 입력 `Drawable`이 `BitmapDrawable`이 아닌 경우 `Transformation`을 건너뛰었습니다. 이제는 `Transformation`을 적용하기 전에 `Drawable`을 `Bitmap`으로 렌더링합니다.
- **주요 변경 사항(Breaking)**: `ImageLoader.load`에 `null` 데이터를 전달하는 것은 이제 오류로 처리되며 `NullRequestDataException`과 함께 `Target.onError` 및 `Request.Listener.onError`를 호출합니다. 이 변경은 데이터가 `null`인 경우 `fallback` 드로어블 설정을 지원하기 위해 도입되었습니다. 이전에는 요청이 조용히 무시되었습니다.
- **주요 변경 사항(Breaking)**: `RequestDisposable.isDisposed`가 이제 `val`입니다.

---

- **신규**: 커스텀 전환 지원. [자세한 내용은 여기를 참조하세요](https://coil-kt.github.io/coil/transitions/). API가 인큐베이팅 단계이므로 전환은 실험적으로 마킹되어 있습니다.
- **신규**: `LoadRequest`가 진행되는 동안 일시 중단(suspending)할 수 있도록 `RequestDisposable.await`를 추가했습니다.
- **신규**: 요청 데이터가 null일 때 `fallback` 드로어블 설정을 지원합니다.
- **신규**: `Precision` 추가. 배율 조정을 지원하는 타깃(예: `ImageViewTarget`)에 대해 배율 최적화를 활성화하면서 출력 `Drawable`의 크기를 정확하게 만듭니다. 자세한 정보는 [공식 문서](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/size/Precision.kt)를 확인하세요.
- **신규**: 여러 캐시 키 매칭을 지원하는 `RequestBuilder.aliasKeys`를 추가했습니다.

---

- 수정: RequestDisposable을 스레드 안전하게 만들었습니다.
- 수정: `RoundedCornersTransformation`이 이제 타깃의 크기로 자른 다음 모서리를 둥글게 처리합니다.
- 수정: `CircleCropTransformation`이 이제 중앙에서부터 자릅니다.
- 수정: [하드웨어 비트맵 블랙리스트](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/memory/HardwareBitmapService.kt)에 여러 기기를 추가했습니다.
- 수정: Drawable을 Bitmap으로 변환할 때 종횡비를 유지하도록 수정했습니다.
- 수정: `Scale.FIT`에서 발생할 수 있던 메모리 캐시 미스 문제를 수정했습니다.
- 수정: Parameters의 반복 순서가 결정론적(deterministic)이 되도록 보장했습니다.
- 수정: Parameters 및 ComponentRegistry를 생성할 때 방어적 복사(defensive copy)를 수행하도록 했습니다.
- 수정: RealBitmapPool의 maxSize가 0 이상이 되도록 보장했습니다.
- 수정: CrossfadeDrawable이 애니메이션 중이 아니거나 완료된 경우 시작 드로어블을 표시하도록 수정했습니다.
- 수정: 고유 크기가 정의되지 않은 자식을 고려하여 CrossfadeDrawable을 조정했습니다.
- 수정: `MovieDrawable`이 올바르게 크기 조정되지 않던 문제를 수정했습니다.

---

- Kotlin을 1.3.61로 업데이트했습니다.
- Kotlin Coroutines를 1.3.3으로 업데이트했습니다.
- Okio를 2.4.3으로 업데이트했습니다.
- AndroidX 의존성을 업데이트했습니다:
    - `androidx.exifinterface:exifinterface` -> 1.1.0

## [0.8.0] - 2019년 10월 22일 {id="0-8-0-october-22-2019"}

- **주요 변경 사항(Breaking)**: `SvgDrawable`이 제거되었습니다. 대신 SVGs는 이제 `SvgDecoder`에 의해 `BitmapDrawable`로 사전 렌더링됩니다. 이를 통해 SVGs가 **메인 스레드에서 렌더링되는 비용이 크게 감소**합니다. 또한 `SvgDecoder`는 생성자에 `Context`를 필요로 합니다.
- **주요 변경 사항(Breaking)**: `SparseIntArraySet` 확장 함수가 `coil.extension` 패키지로 이동했습니다.

---

- **신규**: 요청별 네트워크 헤더 설정을 지원합니다. [자세한 내용은 여기를 확인하세요](https://github.com/coil-kt/coil/pull/120).
- **신규**: 이미지 파이프라인을 통해 커스텀 데이터를 전달할 수 있도록 새로운 `Parameters` API를 추가했습니다.
- **신규**: RoundedCornersTransformation에서 개별 모서리 반지름 지원을 추가했습니다. @khatv911님께 감사드립니다.
- **신규**: 리소스를 사전에 확보할 수 있도록 `ImageView.clear()`를 추가했습니다.
- **신규**: 다른 패키지로부터의 리소스 로딩을 지원합니다.
- **신규**: 측정 시 뷰의 패딩을 제외할지 여부를 설정할 수 있도록 ViewSizeResolver에 `subtractPadding` 속성을 추가했습니다.
- **신규**: HttpUrlFetcher의 MIME 타입 감지를 개선했습니다.
- **신규**: MovieDrawable 및 CrossfadeDrawable에 Animatable2Compat 지원을 추가했습니다.
- **신규**: GIF의 반복 횟수를 설정하는 `RequestBuilder<*>.repeatCount`를 추가했습니다.
- **신규**: 공개 API에 BitmapPool 생성을 추가했습니다.
- **신규**: Request.Listener 메서드에 `@MainThread` 애너테이션을 추가했습니다.

---

- 수정: 테스트를 위해 CoilContentProvider를 표시 가능하도록 변경했습니다.
- 수정: 리소스 캐시 키에 야간 모드를 포함하도록 수정했습니다.
- 수정: 소스를 임시로 디스크에 기록하여 ImageDecoder 네이티브 충돌을 우회했습니다.
- 수정: 연락처 표시 사진 URI를 올바르게 처리하도록 수정했습니다.
- 수정: CrossfadeDrawable의 자식들에게 틴트를 전달하도록 했습니다.
- 수정: 소스를 닫지 않던 여러 인스턴스를 수정했습니다.
- 수정: 하드웨어 비트맵 구현이 깨져 있거나 불완전한 기기들의 블랙리스트를 추가했습니다.

---

- SDK 29 기반으로 컴파일합니다.
- Kotlin Coroutines를 1.3.2로 업데이트했습니다.
- OkHttp를 3.12.6으로 업데이트했습니다.
- Okio를 2.4.1로 업데이트했습니다.
- `coil-base`에 대해 `appcompat-resources`를 `compileOnly`에서 `implementation`으로 변경했습니다.

## [0.7.0] - 2019년 9월 8일 {id="0-7-0-september-8-2019"}
- **주요 변경 사항(Breaking)**: `ImageLoaderBuilder.okHttpClient(OkHttpClient.Builder.() -> Unit)`가 `ImageLoaderBuilder.okHttpClient(() -> OkHttpClient)`로 변경되었습니다. 초기화는 이제 백그라운드 스레드에서 지연 호출됩니다. **커스텀 `OkHttpClient`를 설정하는 경우 디스크 캐싱을 활성화하려면 반드시 `OkHttpClient.cache`를 설정해야 합니다.** 커스텀 `OkHttpClient`를 설정하지 않으면 Coil은 디스크 캐싱이 활성화된 기본 `OkHttpClient`를 생성합니다. 기본 Coil 캐시는 `CoilUtils.createDefaultCache(context)`를 사용하여 생성할 수 있습니다. 예:

```kotlin
val imageLoader = ImageLoader(context) {
    okHttpClient {
        OkHttpClient.Builder()
            .cache(CoilUtils.createDefaultCache(context))
            .build()
    }
}
```

- **주요 변경 사항(Breaking)**: `Fetcher.key`에 더 이상 기본 구현이 제공되지 않습니다.
- **주요 변경 사항(Breaking)**: 이전에는 적용 가능한 첫 번째 `Mapper`만 호출되었습니다. 이제는 적용 가능한 모든 `Mapper`가 호출됩니다. API 변경 사항은 없습니다.
- **주요 변경 사항(Breaking)**: 사소한 명명된 매개변수 이름 변경: `url` -> `uri`, `factory` -> `initializer`.

---

- **신규**: SVG 자동 디코딩을 지원하는 `SvgDecoder`가 포함된 `coil-svg` 아티팩트. [AndroidSVG](https://github.com/BigBadaboom/androidsvg) 기반으로 구동됩니다. @rharter님께 감사드립니다.
- **신규**: `load(String)` 및 `get(String)`이 지원되는 모든 Uri 스킴을 허용합니다. 예: 이제 `imageView.load("file:///path/to/file.jpg")`를 수행할 수 있습니다.
- **신규**: `OkHttpClient` 대신 `Call.Factory`를 사용하도록 ImageLoader를 리팩터링했습니다. 이를 통해 `ImageLoaderBuilder.okHttpClient { OkHttpClient() }`를 사용하여 네트워킹 리소스를 지연 초기화할 수 있습니다. @ZacSweers님께 감사드립니다.
- **신규**: 요청에 대한 디코더를 명시적으로 설정할 수 있는 `RequestBuilder.decoder`.
- **신규**: ImageLoader에 대해 하드웨어 비트맵을 기본적으로 활성화/비활성화하는 `ImageLoaderBuilder.allowHardware`.
- **신규**: ImageDecoderDecoder에서 소프트웨어 렌더링을 지원합니다.

---

- 수정: 벡터 드로어블 로드와 관련된 여러 버그를 수정했습니다.
- 수정: WRAP_CONTENT View 치수를 지원합니다.
- 수정: 8192바이트보다 긴 EXIF 데이터 파싱을 지원합니다.
- 수정: 크로스페이드 시 서로 다른 종횡비를 가진 드로어블이 늘어나지 않도록 수정했습니다.
- 수정: 예외로 인해 네트워크 관찰자가 등록에 실패하는 경우에 대한 방어 코드를 추가했습니다.
- 수정: MovieDrawable의 0으로 나누기 오류를 수정했습니다. @R12rus님께 감사드립니다.
- 수정: 중첩된 Android asset 파일을 지원합니다. @JaCzekanski님께 감사드립니다.
- 수정: Android O 및 O_MR1에서 파일 디스크립터가 고갈되는 현상에 대한 방어 코드를 추가했습니다.
- 수정: 메모리 캐시를 비활성화할 때 비정상 종료되던 문제를 수정했습니다. @hansenji님께 감사드립니다.
- 수정: Target.cancel이 항상 메인 스레드에서 호출되도록 보장했습니다.

---

- Kotlin을 1.3.50으로 업데이트했습니다.
- Kotlin Coroutines를 1.3.0으로 업데이트했습니다.
- OkHttp를 3.12.4로 업데이트했습니다.
- Okio를 2.4.0으로 업데이트했습니다.
- AndroidX 의존성을 최신 안정화 버전으로 업데이트했습니다:
    - `androidx.appcompat:appcompat` -> 1.1.0
    - `androidx.core:core-ktx` -> 1.1.0
    - `androidx.lifecycle:lifecycle-common-java8` -> 2.1.0
- 선택적 `compileOnly` 의존성인 `appcompat`을 `appcompat-resources`로 대체했습니다. `appcompat-resources`는 훨씬 더 작은 아티팩트입니다.

## [0.6.1] - 2019년 8월 16일 {id="0-6-1-august-16-2019"}
- 신규: RequestBuilder에 `transformations(List<Transformation>)`를 추가했습니다.
- 수정: 파일 uri의 캐시 키에 최종 수정 날짜를 추가했습니다.
- 수정: View 치수가 최소 1px 이상으로 평가되도록 보장했습니다.
- 수정: 프레임 간에 MovieDrawable의 캔버스를 지우도록 수정했습니다.
- 수정: 에셋을 올바르게 열도록 수정했습니다.

## [0.6.0] - 2019년 8월 12일 {id="0-6-0-august-12-2019"}
- 최초 릴리스입니다.