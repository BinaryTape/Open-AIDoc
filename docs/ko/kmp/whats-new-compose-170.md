[//]: # (title: Compose Multiplatform 1.7.3의 새로운 기능)

이번 기능 릴리스의 주요 하이라이트는 다음과 같습니다:

* [타입 안전한 내비게이션(Type-safe Navigation)](#type-safe-navigation)
* [공유 요소 전환(Shared element transitions)](#shared-element-transitions)
* [Android 에셋으로 패키징된 멀티플랫폼 리소스](#resources-packed-into-android-assets)
* [커스텀 리소스 디렉터리](#custom-resource-directories)
* [멀티플랫폼 테스트 리소스 지원](#support-for-multiplatform-test-resources)
* [iOS 터치 상호운용성 개선](#new-default-behavior-for-processing-touch-in-ios-native-elements)
* [Material3 `adaptive` 및 `material3-window-size-class` 공통 코드 지원](#material3-adaptive-adaptive)
* [데스크톱 드래그 앤 드롭 구현](#drag-and-drop)
* [데스크톱 `BasicTextField` 도입](#basictextfield-renamed-from-basictextfield2-adopted-on-desktop)

이번 릴리스의 전체 변경 사항 목록은 [GitHub](https://github.com/JetBrains/compose-multiplatform/blob/master/CHANGELOG.md#170-october-2024)에서 확인하실 수 있습니다.

## 의존성(Dependencies)

* Gradle 플러그인 `org.jetbrains.compose`, 버전 1.7.3. 다음 Jetpack Compose 라이브러리를 기반으로 합니다:
  * [Runtime 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.7.5)
  * [UI 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.7.5)
  * [Foundation 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.7.5)
  * [Material 1.7.5](https://developer.android.com/jetpack/androidx/releases/compose-material#1.7.5)
  * [Material3 1.3.1](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.3.1)
* Lifecycle 라이브러리 `org.jetbrains.androidx.lifecycle:lifecycle-*:2.8.3`. [Jetpack Lifecycle 2.8.5](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.8.5)를 기반으로 합니다.
* Navigation 라이브러리 `org.jetbrains.androidx.navigation:navigation-*:2.8.0-alpha10`. [Jetpack Navigation 2.8.0](https://developer.android.com/jetpack/androidx/releases/navigation#2.8.0)을 기반으로 합니다.
* Material3 Adaptive 라이브러리 `org.jetbrains.compose.material3.adaptive:adaptive-*:1.0.0`. [Jetpack Material3 Adaptive 1.0.0](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.0.0)을 기반으로 합니다.

## 주요 변경 사항(Breaking changes)

### 최소 AGP 버전 8.1.0으로 상향

Compose Multiplatform 1.7.0에서 사용하는 Jetpack Compose 1.7.0과 Lifecycle 2.8.0은 모두 AGP 7을 지원하지 않습니다.
따라서 Compose Multiplatform 1.7.3으로 업데이트할 때 AGP 의존성도 함께 업그레이드해야 할 수 있습니다.

> Android Studio에서 Android 컴포저블을 위해 새로 구현된 프리뷰 기능은 [최신 AGP 버전 중 하나가 필요합니다](#resources-packed-into-android-assets).
>
{style="note"}

### Java 리소스 API가 멀티플랫폼 리소스 라이브러리로 대체되며 지원 중단됨

이 릴리스에서는 `compose.ui` 패키지에서 제공되는 Java 리소스 API를 명시적으로 지원 중단(deprecate)합니다.
대상은 `painterResource()`, `loadImageBitmap()`, `loadSvgPainter()`, `loadXmlImageVector()` 함수와 `ClassLoaderResourceLoader` 클래스 및 이를 사용하는 함수들입니다.

[멀티플랫폼 리소스 라이브러리](compose-multiplatform-resources.md)로 전환하는 것을 권장합니다.
Compose Multiplatform에서 Java 리소스를 계속 사용할 수는 있지만, 프레임워크에서 제공하는 생성된 접근자(generated accessors), 멀티모듈 지원, 현지화(localization) 등의 확장 기능을 활용할 수 없습니다.

여전히 Java 리소스에 접근해야 한다면, [풀 리퀘스트(pull request)에서 제안된 구현](https://github.com/JetBrains/compose-multiplatform-core/pull/1457)을 복사하여 Compose Multiplatform 1.7.3으로 업그레이드하고 가능한 경우 멀티플랫폼 리소스로 전환한 후에도 코드가 작동하도록 할 수 있습니다.

### iOS 네이티브 요소의 터치 처리 기본 동작 변경

1.7.3 이전 버전에서는 Compose Multiplatform이 상호운용성(interop) UI 뷰에 도달한 터치 이벤트에 응답할 수 없었기 때문에, 상호운용성 뷰가 이러한 터치 시퀀스를 전적으로 처리했습니다.

Compose Multiplatform 1.7.3은 상호운용성 터치 시퀀스를 처리하기 위해 더 정교한 로직을 구현했습니다.
기본적으로 초기 터치 후 지연 시간이 추가되어, 부모 컴포저블이 해당 터치 시퀀스가 네이티브 뷰와 상호작용하기 위한 것인지 이해하고 그에 따라 반응할 수 있도록 돕습니다.

자세한 내용은 [이 페이지의 iOS 섹션](#ios-touch-interop) 설명을 참조하거나 [해당 기능의 문서](compose-ios-touch.md)를 읽어보시기 바랍니다.

### iOS에서 최소 프레임 지속 시간 비활성화가 필수 사항이 됨

개발자들이 고주사율 디스플레이에 관한 경고 문구를 인지하지 못하는 경우가 많았고, 이로 인해 사용자들이 120Hz 지원 기기에서 부드러운 애니메이션을 경험하지 못하는 문제가 있었습니다.
이제 이 검사를 엄격하게 적용합니다. `Info.plist` 파일에 `CADisableMinimumFrameDurationOnPhone` 속성이 없거나 `false`로 설정된 경우, Compose Multiplatform으로 빌드된 앱은 크래시가 발생합니다.

`ComposeUIViewControllerConfiguration.enforceStrictPlistSanityCheck` 속성을 `false`로 설정하여 이 동작을 비활성화할 수 있습니다.

### 데스크톱의 Modifier.onExternalDrag 지원 중단

실험적 기능이었던 `Modifier.onExternalDrag` 및 관련 API가 새로운 `Modifier.dragAndDropTarget`으로 대체되어 지원 중단되었습니다.
`DragData` 인터페이스는 `compose.ui.draganddrop` 패키지로 이동되었습니다.

Compose Multiplatform 1.7.0에서 지원 중단된 API를 사용 중이라면 지원 중단 오류가 발생할 것입니다.
1.8.0 버전에서는 `onExternalDrag` 수정자(modifier)가 완전히 제거될 예정입니다.

## 플랫폼 공통(Across platforms)

### 공유 요소 전환(Shared element transitions)

Compose Multiplatform은 이제 일관된 요소를 공유하는 컴포저블 간의 자연스러운 전환을 위한 API를 제공합니다.
이러한 전환은 내비게이션 시 사용자가 UI의 변화 흐름을 따라가는 데 유용합니다.

API에 대한 자세한 내용은 [Jetpack Compose 문서](https://developer.android.com/develop/ui/compose/animation/shared-elements)를 참조하세요.

### 타입 안전한 내비게이션(Type-safe Navigation)

Compose Multiplatform은 내비게이션 경로를 따라 객체를 전달할 때 Jetpack Compose의 타입 안전한 방식을 도입했습니다.
Navigation 2.8.0의 새로운 API를 사용하면 내비게이션 그래프에 대해 컴파일 타임 안전성을 확보할 수 있습니다.
이 API들은 XML 기반 내비게이션의 [Safe Args](https://developer.android.com/guide/navigation/use-graph/pass-data#Safe-args) 플러그인과 동일한 결과를 제공합니다.

자세한 내용은 [Navigation Compose의 타입 안전성에 관한 Google 문서](https://developer.android.com/guide/navigation/design/type-safety)를 참조하세요.

### 멀티플랫폼 리소스

#### Android 에셋으로 패키징된 리소스

모든 멀티플랫폼 리소스는 이제 Android 에셋(assets)으로 패키징됩니다. 이를 통해 Android Studio는 Android 소스 세트에 있는 Compose Multiplatform 컴포저블의 프리뷰를 생성할 수 있습니다.

> Android Studio 프리뷰는 Android 소스 세트의 컴포저블에서만 사용할 수 있습니다.
> 또한 AGP 최신 버전 중 하나(8.5.2, 8.6.0-rc01, 8.7.0-alpha04)가 필요합니다.
>
{style="note"}

또한 리소스에 간단한 경로(예: `Res.getUri(“files/index.html”)`)로 접근할 수 있게 됨에 따라 Android의 WebView 및 미디어 플레이어 구성 요소에서 멀티플랫폼 리소스에 직접 접근할 수 있습니다.

다음은 리소스 이미지 링크가 포함된 리소스 HTML 페이지를 표시하는 Android 컴포저블의 예시입니다:

```kotlin
// androidMain/kotlin/com/example/webview/App.kt
@OptIn(ExperimentalResourceApi::class)
@Composable
@Preview
fun App() {
    MaterialTheme {
        val uri = Res.getUri("files/webview/index.html")

        // Adding a WebView inside AndroidView with layout as full screen.
        AndroidView(factory = {
            WebView(it).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
            }
        }, update = {
            it.loadUrl(uri)
        })
    }
}
```
{initial-collapse-state="collapsed" collapsible="true"  collapsed-title="AndroidView(factory = { WebView(it).apply"}

이 예시는 다음의 간단한 HTML 파일과 함께 작동합니다:

```html
<html>
<header>
    <title>
        Cat Resource
    </title>
</header>
<body>
    <img src="cat.jpg">
</body>
</html>
```
{initial-collapse-state="collapsed" collapsible="true"  collapsed-title="<title>Cat Resource</title>"}

이 예시의 두 리소스 파일은 모두 `commonMain` 소스 세트에 위치합니다:

![composeResources 디렉터리의 파일 구조](compose-resources-android-webview.png){width="230"}

#### 커스텀 리소스 디렉터리

구성 DSL의 새로운 `customDirectory` 설정을 사용하여 [커스텀 디렉터리를 특정 소스 세트와 연결](compose-multiplatform-resources-setup.md#custom-resource-directories)할 수 있습니다. 이를 통해 예를 들어 다운로드한 파일을 리소스로 사용할 수 있습니다.

#### 멀티플랫폼 폰트 캐시

Compose Multiplatform은 Android의 폰트 캐시 기능을 다른 플랫폼으로 가져와 `Font` 리소스의 과도한 바이트 읽기를 제거했습니다.

#### 멀티플랫폼 테스트 리소스 지원

이제 리소스 라이브러리에서 프로젝트의 테스트 리소스 사용을 지원합니다. 이를 통해 다음이 가능해집니다:

* 테스트 소스 세트에 리소스 추가.
* 해당 소스 세트에서만 사용 가능한 생성된 접근자 사용.
* 테스트 실행 시에만 앱에 테스트 리소스 패키징.

#### 빠른 접근을 위해 문자열 ID에 매핑된 리소스

각 유형의 리소스는 파일 이름과 매핑됩니다. 예를 들어 `Res.allDrawableResources` 속성을 사용하여 모든 `drawable` 리소스의 맵을 가져오고, 문자열 ID를 전달하여 필요한 리소스에 접근할 수 있습니다:

```kotlin
Image(painterResource(Res.allDrawableResources["compose_multiplatform"]!!), null)
```

#### 바이트 배열을 ImageBitmap 또는 ImageVector로 변환하는 함수

`ByteArray`를 이미지 리소스로 변환하는 새로운 함수들이 추가되었습니다:

* `decodeToImageBitmap()`: JPEG, PNG, BMP 또는 WEBP 파일을 `ImageBitmap` 객체로 변환합니다.
* `decodeToImageVector()`: XML 벡터 파일을 `ImageVector` 객체로 변환합니다.
* `decodeToSvgPainter()`: SVG 파일을 `Painter` 객체로 변환합니다. 이 함수는 Android에서 사용할 수 없습니다.

자세한 내용은 [문서](compose-multiplatform-resources-usage.md#convert-byte-arrays-into-images)를 참조하세요.

### 새로운 공통 모듈

#### material3.adaptive:adaptive*

Material3 adaptive 모듈을 이제 Compose Multiplatform의 공통 코드에서 사용할 수 있습니다.
이를 사용하려면 모듈의 `build.gradle.kts` 파일 내 공통 소스 세트에 해당 의존성을 명시적으로 추가하세요:

```kotlin
commonMain.dependencies {
    implementation("org.jetbrains.compose.material3.adaptive:adaptive:1.0.0-alpha03")
    implementation("org.jetbrains.compose.material3.adaptive:adaptive-layout:1.0.0-alpha03")
    implementation("org.jetbrains.compose.material3.adaptive:adaptive-navigation:1.0.0-alpha03")
}
```

#### material3.material3-adaptive-navigation-suite

Compose로 [적응형 내비게이션(adaptive navigation)을 구축](https://developer.android.com/develop/ui/compose/layouts/adaptive/build-adaptive-navigation)하는 데 필요한 Material3 adaptive navigation suite를 공통 코드에서 사용할 수 있습니다.
사용하려면 모듈의 `build.gradle.kts` 파일 내 공통 소스 세트에 의존성을 명시적으로 추가하세요:

```kotlin
commonMain.dependencies {
    implementation(compose.material3AdaptiveNavigationSuite)
}
```

#### material3:material3-window-size-class

[`WindowSizeClass`](https://developer.android.com/reference/kotlin/androidx/compose/material3/windowsizeclass/package-summary) 클래스를 사용하려면 모듈의 `build.gradle.kts` 파일 내 공통 소스 세트에 `material3-window-size-class` 의존성을 명시적으로 추가하세요:

```kotlin
commonMain.dependencies {
    implementation("org.jetbrains.compose.material3:material3-window-size-class:1.7.3")
}
```

`calculateWindowSizeClass()` 함수는 아직 공통 코드에서 사용할 수 없습니다.
그러나 플랫폼별 코드에서 이를 임포트하여 호출할 수 있습니다. 예:

```kotlin
// desktopMain/kotlin/main.kt
import androidx.compose.material3.windowsizeclass.calculateWindowSizeClass

// ...

val size = calculateWindowSizeClass()
```

#### material-navigation

Compose Multiplatform Navigation 외에도 `material-navigation` 라이브러리를 공통 코드에서 사용할 수 있습니다.
사용하려면 모듈의 `build.gradle.kts` 파일 내 공통 소스 세트에 다음 의존성을 명시적으로 추가하세요:

```kotlin
commonMain.dependencies {
    implementation("org.jetbrains.androidx.navigation:navigation-compose:2.8.0-alpha10")
    implementation("org.jetbrains.compose.material:material-navigation:1.7.0-beta02")
}
```

### Skia Milestone 126으로 업데이트

Compose Multiplatform에서 [Skiko](https://github.com/JetBrains/skiko)를 통해 사용하는 Skia 버전이 Milestone 126으로 업데이트되었습니다.

이전에는 Milestone 116 버전을 사용했습니다. 버전 간 변경 사항은 [릴리스 노트](https://skia.googlesource.com/skia/+/refs/heads/main/RELEASE_NOTES.md#milestone-126)에서 확인할 수 있습니다.

### GraphicsLayer – 새로운 그리기 API

Jetpack Compose 1.7.0에 추가된 새로운 그리기 레이어를 이제 Compose Multiplatform에서도 사용할 수 있습니다.

`Modifier.graphicsLayer`와 달리 새로운 `GraphicsLayer` 클래스를 사용하면 컴포저블 콘텐츠를 어디에서나 렌더링할 수 있습니다.
이는 애니메이션 콘텐츠를 서로 다른 씬(scene)에서 렌더링해야 하는 경우에 유용합니다.

자세한 설명과 예시는 [참조 문서](https://developer.android.com/reference/kotlin/androidx/compose/ui/graphics/layer/GraphicsLayer)를 확인하세요.

### LocalLifecycleOwner가 Compose UI 밖으로 이동

`LocalLifecycleOwner` 클래스가 Compose UI 패키지에서 Lifecycle 패키지로 이동되었습니다.

이 변경을 통해 Compose UI와 독립적으로 해당 클래스에 접근하고 Compose 기반 헬퍼 API를 호출할 수 있습니다.
단, Compose UI 바인딩이 없으면 `LocalLifecycleOwner` 인스턴스에 플랫폼 통합이 이루어지지 않으므로 리스닝할 플랫폼 전용 이벤트가 없다는 점에 유의하세요.

## iOS

### Compose Multiplatform과 네이티브 iOS 간의 터치 상호운용성 개선 {id="ios-touch-interop"}

이번 릴리스에서는 iOS 상호운용성(interop) 뷰의 터치 처리가 개선되었습니다.
Compose Multiplatform은 이제 터치가 상호운용성 뷰를 위한 것인지, 아니면 Compose에서 처리해야 하는지를 감지하려고 시도합니다.
이를 통해 Compose Multiplatform 앱 내부의 UIKit 또는 SwiftUI 영역에서 발생하는 터치 이벤트를 처리할 수 있습니다.

기본적으로 Compose Multiplatform은 상호운용성 뷰로의 터치 이벤트 전달을 150ms 동안 지연시킵니다:

* 이 시간 내에 거리 임계값을 초과하는 움직임이 있으면 부모 컴포저블이 터치 시퀀스를 가로채며, 상호운용성 뷰로 전달되지 않습니다.
* 눈에 띄는 움직임이 없으면 Compose는 나머지 터치 시퀀스를 처리하지 않고, 상호운용성 뷰에서만 처리되도록 합니다.

이 동작은 네이티브 [`UIScrollView`](https://developer.apple.com/documentation/uikit/uiscrollview)의 작동 방식과 일치합니다.
이는 상호운용성 뷰에서 시작된 터치 시퀀스가 Compose Multiplatform에서 처리될 기회 없이 가로채지는 상황을 방지하는 데 도움이 됩니다. 이러한 상황은 사용자 경험을 저하시킬 수 있습니다.
예를 들어, 지연 목록(lazy list)처럼 스크롤 가능한 컨텍스트에서 사용되는 대형 상호운용성 비디오 플레이어를 상상해 보십시오. Compose Multiplatform이 터치를 인지하지 못한 채 비디오가 모든 터치를 가로챈다면 리스트를 스크롤하기가 매우 까다로울 것입니다.

### 네이티브 성능 개선

Kotlin 2.0.20을 통해 Kotlin/Native 팀은 iOS에서 Compose 앱이 더 빠르고 부드럽게 작동하도록 많은 진전을 이루었습니다.
Compose Multiplatform 1.7.3 릴리스는 이러한 최적화 사항을 활용하며, Jetpack Compose 1.7.0의 성능 개선 사항도 함께 제공합니다.

Kotlin 2.0.0 기반의 Compose Multiplatform 1.6.11과 Kotlin 2.0.20 기반의 Compose Multiplatform 1.7.3을 비교했을 때, 전반적으로 더 나은 결과를 보여줍니다:

* 실사용 사례와 가장 유사한 `LazyVerticalGrid` 스크롤을 시뮬레이션하는 *LazyGrid* 벤치마크는 평균 **~9%** 더 빠르게 작동합니다.
    또한 사용자가 UI가 덜 반응적이라고 느끼게 만드는 프레임 드랍(missed frames) 횟수가 현저히 감소했습니다. 직접 확인해 보세요. iOS용 Compose Multiplatform으로 제작된 앱이 훨씬 더 부드럽게 느껴질 것입니다.
* 무작위로 배치된 수많은 컴포넌트를 렌더링하는 *VisualEffects* 벤치마크는 **3.6배** 더 빠르게 작동합니다.
    1,000프레임당 평균 CPU 시간이 8.8초에서 2.4초로 단축되었습니다.
* 이미지의 표시 및 숨기기 애니메이션을 수행하는 *AnimatedVisibility* 컴포저블은 **~6%** 더 빠른 렌더링 성능을 보여줍니다.

그뿐만 아니라, Kotlin 2.0.20은 가비지 컬렉터에서 실험적인 [동시 마킹(concurrent marking) 지원](https://kotlinlang.org/docs/whatsnew2020.html#concurrent-marking-in-garbage-collector)을 도입했습니다. 동시 마킹을 활성화하면 가비지 컬렉터 일시 중지 시간이 단축되어 모든 벤치마크에서 더욱 큰 개선 효과를 볼 수 있습니다.

Compose Multiplatform 저장소에서 이러한 Compose 전용 벤치마크 코드를 확인할 수 있습니다:

* [Kotlin/Native 성능 벤치마크](https://github.com/JetBrains/compose-multiplatform/tree/master/benchmarks/kn-performance)
* [Kotlin/JVM vs Kotlin/Native 벤치마크](https://github.com/JetBrains/compose-multiplatform/tree/master/benchmarks/ios/jvm-vs-kotlin-native)

## 데스크톱

### 드래그 앤 드롭

사용자가 콘텐츠를 Compose 애플리케이션 안팎으로 드래그할 수 있게 해주는 드래그 앤 드롭 메커니즘이 데스크톱용 Compose Multiplatform에 구현되었습니다.
드래그 앤 드롭의 잠재적 소스(source)와 대상(destination)을 지정하려면 `dragAndDropSource` 및 `dragAndDropTarget` 수정자를 사용하세요.

> 이 수정자들은 공통 코드에서 사용할 수 있지만, 현재는 데스크톱 및 Android 소스 세트에서만 작동합니다. 향후 릴리스를 기대해 주세요.
> 
{style="note"}

일반적인 사용 사례는 Jetpack Compose 문서의 [전용 아티클](https://developer.android.com/develop/ui/compose/touch-input/user-interactions/drag-and-drop)을 참조하세요.

### BasicTextField2에서 이름이 변경된 BasicTextField 데스크톱 도입

Jetpack Compose는 `BasicTextField2` 컴포넌트를 안정화(stable)하고 이름을 `BasicTextField`로 변경했습니다.
이번 릴리스에서 Compose Multiplatform은 데스크톱 타겟에 이 변경 사항을 도입했으며, 안정화된 1.7.0 버전에서는 iOS까지 포함할 계획입니다.

새로운 `BasicTextField`는 다음을 제공합니다:

* 더욱 신뢰할 수 있는 상태 관리.
* 텍스트 필드 콘텐츠의 프로그래밍 방식 변경을 위한 새로운 `TextFieldBuffer` API.
* 시각적 변환 및 스타일 지정을 위한 여러 새로운 API.
* 필드의 이전 상태로 되돌릴 수 있는 기능을 포함한 `UndoState` 접근성 제공.

### ComposePanel의 렌더링 설정

`ComposePanel` 생성자에서 새로운 `RenderSettings.isVsyncEnabled` 파라미터를 지정하여 백엔드 렌더링 구현 시 수직 동기화(VSync)를 비활성화하도록 힌트를 줄 수 있습니다.
이렇게 하면 입력과 UI 변경 사이의 시각적 지연(latency)을 줄일 수 있지만, 화면 찢어짐(tearing) 현상이 발생할 수 있습니다.

기본 동작은 동일하게 유지됩니다: `ComposePanel`은 드로어블 프리젠테이션을 VSync와 동기화하려고 시도합니다.

## 웹(Web)

### Kotlin/Wasm 애플리케이션에서 skiko.js 불필요

이제 Compose Multiplatform으로 빌드된 Kotlin/Wasm 애플리케이션에서 `skiko.js` 파일이 더 이상 필요하지 않습니다.
`index.html` 파일에서 이를 제거하여 앱의 로드 시간을 개선할 수 있습니다.
향후 릴리스에서는 Kotlin/Wasm 배포판에서 `skiko.js`가 완전히 제거될 예정입니다.

> Kotlin/JS 애플리케이션에서는 Compose Multiplatform 1.9.0까지 여전히 `skiko.js` 파일이 필요합니다. 변경 시점에 대해서는 [Compose Multiplatform 1.9.3의 새로운 기능](whats-new-compose-190.md#skiko-js-is-no-longer-needed)을 참조하세요.
{style="note"}