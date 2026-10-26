[//]: # (title: Compose Multiplatform의 새로운 기능 %org.jetbrains.compose-eap%)

이번 EAP 릴리스의 주요 변경 사항은 다음과 같습니다:

* [SwiftUI 및 UIKit에서 Compose Multiplatform 뷰의 콘텐츠 기반 크기 조정](#content-based-sizing-for-compose-multiplatform-views-in-swiftui-and-uikit)
* [iOS에서 비밀번호 저장 및 자동 완성](#saving-and-autofilling-passwords)
* [WebGL 상호 운용성(interop)](#webgl-interop)
* [AppCDS 및 AOT 옵션을 통한 데스크톱 시작 속도 향상](#faster-desktop-startup-with-appcds-or-aot)

이번 릴리스의 전체 변경 사항 목록은 [GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.13.0-beta01)에서 확인할 수 있습니다.
특정 컴포넌트 버전에 대한 자세한 내용은 [종속성(Dependencies)](#dependencies) 섹션을 참조하세요.

## 크로스 플랫폼 (Across platforms) {id="across-platforms"}

이전 Compose Multiplatform 릴리스에서 실험적(Experimental)이었던 몇 가지 기능이 이제 안정화(Stable)되었습니다.
더 이상 해당 기능을 사용하기 위해 opt-in할 필요가 없습니다:

* iOS에서 `ComposeUIView()`를 생성하고 `ComposeUIViewportConfiguration`으로 구성.
* [웹용 `ComposeViewport()`를 `ComposeViewportConfiguration`으로 구성](compose-css-styles.md).
* [`preload` API를 사용하여 웹용 리소스 미리 로드](compose-web-resources.md#preload-resources-using-the-compose-multiplatform-preload-api).

## iOS {id="ios"}

### SwiftUI 및 UIKit에서 Compose Multiplatform 뷰의 콘텐츠 기반 크기 조정 {id="content-based-sizing-for-compose-multiplatform-views-in-swiftui-and-uikit"}

SwiftUI 또는 UIKit에 임베드된 Compose Multiplatform 뷰에서 사용 가능한 상위 공간을 기반으로 권장 크기(preferred size)를 보고할 수 있게 되었습니다.
네이티브 컨테이너는 이 크기를 사용하여 너비를 고정한 채로 뷰의 높이를 조정하는 등 Compose 콘텐츠에 맞출 수 있습니다.

iOS 16 이상에서는 Compose Multiplatform 뷰가 기본적으로 `PreferredSizeReportingStrategy.SizeThatFits`를 사용하므로,
추가적인 크기 조정 설정이 필요하지 않습니다.

Kotlin 측에서 Compose 뷰를 생성합니다:

```kotlin
val view = ComposeUIView {
    Text("Hello from Compose")
}
```

그런 다음 SwiftUI `UIViewRepresentable` 래퍼에서 크기 조정 제안을 `sizeThatFits()`에 전달합니다.
SwiftUI가 지정하지 않은 치수에는 `UIView.noIntrinsicMetric`을 사용하세요:

```swift
@available(iOS 16.0, *)
func sizeThatFits(
    _ proposal: ProposedViewSize,
    uiView: UIView,
    context: Context
) -> CGSize? {
    uiView.sizeThatFits(
        CGSize(
            width: proposal.width ?? UIView.noIntrinsicMetric,
            height: proposal.height ?? UIView.noIntrinsicMetric
        )
    )
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="func sizeThatFits( _ proposal: ProposedViewSize, uiView: UIView, "}

UIKit에서는 Auto Layout이 Compose Multiplatform 뷰의 너비를 설정한 후,
`sizeThatFits()`를 사용하여 권장 높이를 가져오고 높이 제약 조건을 업데이트합니다:

```swift
let preferredSize = uiView.sizeThatFits(
    CGSize(
        width: uiView.bounds.width,
        height: UIView.noIntrinsicMetric
    )
)
heightConstraint.constant = preferredSize.height
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="let preferredSize = uiView.sizeThatFits("}

### 비밀번호 저장 및 자동 완성 {id="saving-and-autofilling-passwords"}
<primary-label ref="Experimental"/>

iOS에서 Compose Multiplatform은 이제 로그인 자격 증명을 저장하고 Compose 텍스트 필드를 자동 완성할 수 있는 네이티브 프롬프트를 표시할 수 있습니다.
iOS가 해당 양식을 로그인 양식으로 인식할 수 있도록 사용자 이름과 비밀번호 필드를 모두 화면에 유지하세요.

필드를 구성하려면 iOS 소스 세트에서 `PlatformImeOptions`를 사용하세요.
사용자 이름 필드에는 `textContentType(UITextContentTypeUsername)`을 설정하고, 비밀번호 필드에는 `isSecureTextEntry(true)`를 설정합니다.
예를 들어, `@OptIn(ExperimentalComposeUiApi::class)` 주석이 지정된 컴포저블 내부에서 다음과 같이 작성합니다:

```kotlin
var username by remember { mutableStateOf("") }
var password by remember { mutableStateOf("") }

Column {
    TextField(
        value = username,
        onValueChange = { username = it },
        keyboardOptions = KeyboardOptions(
            keyboardType = KeyboardType.Email,
            platformImeOptions = PlatformImeOptions {
                textContentType(UITextContentTypeUsername)
            }
        )
    )

    TextField(
        value = password,
        onValueChange = { password = it },
        visualTransformation = PasswordVisualTransformation(),
        keyboardOptions = KeyboardOptions(
            keyboardType = KeyboardType.Password,
            platformImeOptions = PlatformImeOptions {
                isSecureTextEntry(true)
            }
        )
    )
}
```

## 웹 (Web) {id="web"}

### WebGL 상호 운용성 {id="webgl-interop"}
<primary-label ref="Experimental"/>

Compose Multiplatform은 이제 [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) 텍스처를 렌더링하기 위한 실험적 API를 제공합니다.
`WebGLRenderTarget`은 다른 Compose UI 요소와 함께 WebGL 그래픽을 표시하는 Compose `Painter`를 노출합니다.

`rememberWebGLRenderTarget()`을 사용하여 타깃을 생성하고, `render {}`로 타깃에 그린 다음, `Image`에 타깃의 `painter`를 표시합니다.
예를 들어, 다음 코드는 `@OptIn(ExperimentalComposeUiApi::class)`가 지정된 컴포저블 내부에서 파란색 텍스처를 렌더링합니다:

```kotlin
val target = rememberWebGLRenderTarget(IntSize(64, 64))

if (target != null) {
    LaunchedEffect(target) {
        target.render {
            with(target.webGLContext) {
                disable(WebGLRenderingContext.SCISSOR_TEST)
                clearColor(0.15f, 0.55f, 1f, 1f)
                clear(WebGLRenderingContext.COLOR_BUFFER_BIT)
            }
        }
    }

    Image(
        painter = target.painter,
        contentDescription = "A blue WebGL texture",
        modifier = Modifier.size(200.dp),
    )
}
```

더 고급 사용 사례를 위해 `target`은 기본 WebGL 렌더링 컨텍스트에 대한 접근도 제공합니다.

### 웹에서의 시스템 창 인셋 (System window insets) {id="system-window-insets-on-web"}
<primary-label ref="Experimental"/>

Compose Multiplatform for Web은 이제 표준 `WindowInsets` API를 통해 시스템 창 인셋(insets)을 지원합니다.
디스플레이 컷아웃(노치)과 온스크린 키보드를 포함한 세이프 에어리어(safe areas)를 고려하면서 에지 투 에지(edge-to-edge)로 UI를 그릴 수 있습니다.

이 기능을 활성화하려면 `ComposeViewport` 구성에서 `enableBrowserWindowInsets`를 `true`로 설정하세요.
표준 인셋 수정자(modifier)를 사용하여 레이아웃을 조정할 수 있습니다:

```kotlin
ComposeViewport(configure = { enableBrowserWindowInsets = true }) {
    Box(Modifier.fillMaxSize().safeDrawingPadding()) {
        Text("Content within the safe drawing area")
    }
}
```

`WindowInsets.safeDrawing` 및 `WindowInsets.ime`과 같은 API를 통해 인셋에 직접 접근할 수도 있습니다.

에지 투 에지 렌더링을 적용하려면 페이지의 뷰포트 `meta` 태그에 `viewport-fit=cover`를 추가하세요:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

> `viewport-fit=cover`가 없으면 브라우저가 세이프 에어리어 패딩을 적용하고 세이프 에어리어 인셋을 0으로 보고합니다.
> 이 설정 없이 브라우저 창 인셋이 활성화되면 Compose Multiplatform에서 경고를 기록합니다.

### 웹에서의 폰트 폴백(Fallback) 설정 {id="configurable-font-fallback-on-web"}

이전 릴리스에서는 애플리케이션 폰트에서 지원하지 않는 문자를 위한 [자동 폰트 폴백](compose-web-resources.md#automatic-font-fallback) 기능을 도입했습니다.
이번 릴리스에서는 폴백 폰트의 소스를 직접 선택하거나 자동 다운로드를 비활성화할 수 있습니다.

기본적으로 Compose Multiplatform은 [Google Fonts](https://fonts.gstatic.com/s/)에서 폴백 폰트를 다운로드합니다.
다른 소스를 사용하려면 윈도우 구성에서 `fontFallbackUrl`을 설정하세요:

```kotlin
createComposeWindow(
    configure = { fontFallbackUrl = "https://custom.fonts.com" }
) {
    BasicText("გამარჯობა")
}
```

자동 폰트 폴백을 비활성화하려면 `fontFallbackUrl`을 `null`로 설정하세요:

```kotlin
createComposeWindow(
    configure = { fontFallbackUrl = null }
) {
    BasicText("გამარჯობა")
}
```

## 데스크톱 (Desktop) {id="desktop"}

### AppCDS 또는 AOT를 통한 데스크톱 시작 속도 향상 {id="faster-desktop-startup-with-appcds-or-aot"}

Compose Multiplatform은 이제 데스크톱 애플리케이션을 위한 [애플리케이션 클래스 데이터 공유(AppCDS, Application Class-Data Sharing)](https://openjdk.org/jeps/310) 및 
[사전 컴파일(AOT, Ahead-of-Time) 캐싱](https://openjdk.org/jeps/514)을 지원합니다. 두 옵션 모두 아카이브를 사용하여 시작 시간을 단축합니다.

소규모 데모 애플리케이션의 벤치마크에서 사전 빌드된 AOT 캐시는 콜드 스타트(cold startup) 시간을 다음과 같이 단축했습니다:

* macOS(M1 Ultra): 2017 ms에서 424 ms로 단축 — 4.8배 향상.
* Windows(Dell Precision 5690): 1356 ms에서 650 ms로 단축 — 2.1배 향상.

이 측정값은 프로세스 시작부터 창이 표시될 때까지의 시간을 포함합니다.
결과는 애플리케이션과 환경에 따라 다를 수 있습니다.
AOT 시작 최적화를 위해 최신 [JetBrains Runtime (JBR) 25](https://github.com/JetBrains/JetBrainsRuntime) 릴리스를 사용하는 것을 권장합니다.

이러한 시작 옵션을 활성화하려면 `build.gradle.kts` 파일의 `aot {}` 블록을 구성하세요:

```kotlin
compose.desktop {
    application {
        aot {
            mode = AotMode.AotPrebuild
        }
    }
}
```

사용 중인 JDK 버전과 패키징 요구 사항에 따라 모드를 선택하세요:

| 모드 | 최소 JDK | 동작 |
|------------------|-------------|------------------------------------------------------------------------------------------------|
| `None` | — | 기본값, 시작 최적화 없음. |
| `AppCdsAuto` | 19 | 사용자의 첫 번째 세션이 종료될 때 AppCDS 아카이브를 생성하여 이후 실행 속도를 향상시킵니다. |
| `AppCdsPrebuild` | 21 | 패키징 전에 AppCDS 아카이브를 생성하여 첫 번째 실행부터 시작 속도를 향상시킵니다. |
| `AotPrebuild` | 25 | 패키징 전에 AOT 캐시를 생성하며, 링킹 및 JIT 웜업도 개선합니다. |

두 프리빌드(prebuild) 모드는 모두 아카이브를 생성하기 위해 패키징 중에 애플리케이션을 실행합니다.
이 캐시 생성 실행 동안 플러그인은 `compose.aot.training-run` 시스템 프로퍼티를 `true`로 설정합니다.

프리빌드 모드는 애플리케이션에 아카이브가 포함되므로 배포 패키지 크기가 증가한다는 점에 유의하세요.

### macOS 및 Windows에서 더 부드러워진 창 크기 조정 {id="smoother-window-resizing-on-macos-and-windows"}

Compose Multiplatform은 이제 macOS에서 Metal을 사용하거나 Windows에서 DirectX를 사용할 때 더욱 부드러운 대화형 창 크기 조정을 지원합니다.
렌더링이 창 크기 조정과 동기화되어 버벅거림을 줄이고 창 가장자리에 흰색 줄이 나타나는 현상을 방지합니다.

이 동작을 활성화하려면 창을 표시하기 전에 해당 렌더러의 시스템 프로퍼티를 `true`로 설정하세요.
`System.setProperty()` 또는 JVM `-D` 플래그를 사용하여 설정할 수 있습니다:

* Metal 기반 macOS: `skiko.rendering.macos.metalSynchronousLiveResize`
* DirectX 기반 Windows: `skiko.rendering.windows.direct3DSynchronousLiveResize`

이 기능을 사용하려면 Compose 콘텐츠가 창 전체를 채워야 합니다.

## 종속성 (Dependencies) {id="dependencies"}

| 라이브러리 | Maven 좌표 | 기반 Jetpack 버전 |
|--------------------|------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Runtime | `org.jetbrains.compose.runtime:runtime*:1.13.0-beta01` | [Runtime 1.13.0-beta01](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.13.0-beta01) |
| UI | `org.jetbrains.compose.ui:ui*:1.13.0-beta01` | [UI 1.13.0-beta01](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.13.0-beta01) |
| Foundation | `org.jetbrains.compose.foundation:foundation*:1.13.0-beta01` | [Foundation 1.13.0-beta01](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.13.0-beta01) |
| Material | `org.jetbrains.compose.material:material*:1.13.0-beta01` | [Material 1.13.0-beta01](https://developer.android.com/jetpack/androidx/releases/compose-material#1.13.0-beta01) |
| Material3 | `org.jetbrains.compose.material3:material3*:1.13.0-beta01` | [Material3 1.5.0-beta01](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.5.0-beta01) |
| Material3 Adaptive | `org.jetbrains.compose.material3.adaptive:adaptive*:1.4.0-alpha01` | [Material3 Adaptive 1.4.0-alpha03](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.4.0-alpha03) |
| Lifecycle | `org.jetbrains.androidx.lifecycle:lifecycle-*:2.11.0` | [Lifecycle 2.11.0](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.11.0) |
| Navigation | `org.jetbrains.androidx.navigation:navigation-*:2.10.0` | [Navigation 2.10.0](https://developer.android.com/jetpack/androidx/releases/navigation#2.10.0) |
| Navigation3 | `org.jetbrains.androidx.navigation3:navigation3-*:1.2.0` | [Navigation3 1.2.0](https://developer.android.com/jetpack/androidx/releases/navigation3#1.2.0) |
| Navigation Event | `org.jetbrains.androidx.navigationevent:navigationevent-compose:1.1.0` | [Navigation Event 1.1.1](https://developer.android.com/jetpack/androidx/releases/navigationevent#1.1.1) |
| Savedstate | `org.jetbrains.androidx.savedstate:savedstate*:1.4.0` | [Savedstate 1.4.0](https://developer.android.com/jetpack/androidx/releases/savedstate#1.4.0) |
| WindowManager Core | `org.jetbrains.androidx.window:window-core:1.5.1` | [WindowManager 1.5.1](https://developer.android.com/jetpack/androidx/releases/window#1.5.1) |