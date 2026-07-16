[//]: # (title: Compose Multiplatform 1.9.3의 새로운 기능)

이번 기능 출시의 주요 내용은 다음과 같습니다:

* [`@Preview` 어노테이션을 위한 파라미터](#parameters-for-the-preview-annotation)
* [사용자 정의 가능한 그림자](#customizable-shadows)
* [새로운 컨텍스트 메뉴 API](#new-context-menu-api)
* [Material 3 Expressive 테마](#material-3-expressive-theme)
* [iOS 프레임 레이트 설정](#frame-rate-configuration)
* [웹용 Compose Multiplatform 베타 출시](#compose-multiplatform-for-web-in-beta)
* [웹 타겟의 접근성 지원](#accessibility-support)
* [HTML 콘텐츠 임베딩을 위한 새로운 API](#new-api-for-embedding-html-content)

이 버전에 대한 전체 변경 사항 목록은 [GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.9.0)에서 확인할 수 있습니다.

## 의존성(Dependencies)

* Gradle 플러그인 `org.jetbrains.compose`, 버전 1.9.3. 다음 Jetpack Compose 라이브러리를 기반으로 합니다:
   * [Runtime 1.9.4](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.9.4)
   * [UI 1.9.4](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.9.4)
   * [Foundation 1.9.4](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.9.4)
   * [Material 1.9.4](https://developer.android.com/jetpack/androidx/releases/compose-material#1.9.4)
   * [Material3 1.4.0](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.4.0)

* Compose Material3 라이브러리 `org.jetbrains.compose.material3:1.9.0`. [Jetpack Material3 1.4.0](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.4.0)을 기반으로 합니다.
  Compose Multiplatform과 Material3의 [분리된 버전](#decoupled-material3-versioning) 체계 덕분에, 프로젝트에 더 최신 프리릴리스 버전을 선택하여 사용할 수 있습니다.
* Compose Material3 Adaptive 라이브러리 `org.jetbrains.compose.material3.adaptive:adaptive*:1.2.0`. [Jetpack Material3 Adaptive 1.2.0](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.2.0) 기반.
* Lifecycle 라이브러리 `org.jetbrains.androidx.lifecycle:lifecycle-*:2.9.6`. [Jetpack Lifecycle 2.9.4](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.9.4) 기반.
* Navigation 라이브러리 `org.jetbrains.androidx.navigation:navigation-*:2.9.1`. [Jetpack Navigation 2.9.4](https://developer.android.com/jetpack/androidx/releases/navigation#2.9.4) 기반.
* Savedstate 라이브러리 `org.jetbrains.androidx.savedstate:savedstate:1.3.6`. [Jetpack Savedstate 1.3.3](https://developer.android.com/jetpack/androidx/releases/savedstate#1.3.3) 기반.
* WindowManager Core 라이브러리 `org.jetbrains.androidx.window:window-core:1.4.0`. [Jetpack WindowManager 1.4.0](https://developer.android.com/jetpack/androidx/releases/window#1.4.0) 기반.

## 공통 플랫폼(Across platforms)

### `@Preview` 어노테이션을 위한 파라미터

Compose Multiplatform의 `@Preview` 어노테이션에 디자인 타임 미리보기에서 `@Composable` 함수가 렌더링되는 방식을 설정하기 위한 추가 파라미터가 포함되었습니다:

* `name`: 미리보기의 표시 이름입니다.
* `group`: 미리보기의 그룹 이름으로, 관련 미리보기를 논리적으로 조직하고 선택적으로 표시할 수 있게 해줍니다.
* `widthDp`: 최대 너비 (dp 단위).
* `heightDp`: 최대 높이 (dp 단위).
* `locale`: 애플리케이션의 현재 로케일(locale).
* `showBackground`: 미리보기에 기본 배경색을 적용할지 여부를 나타내는 플래그입니다.
* `backgroundColor`: 미리보기의 배경색을 정의하는 32비트 ARGB 컬러 정수입니다.

이러한 새로운 미리보기 파라미터는 IntelliJ IDEA와 Android Studio 모두에서 인식되고 작동합니다.

### 사용자 정의 가능한 그림자

Compose Multiplatform 1.9.0에서는 Jetpack Compose의 새로운 섀도우 프리미티브(shadow primitives) 및 API를 채택하여 사용자 정의 가능한 그림자 기능을 도입했습니다. 기존에 지원되던 `shadow` 수정자(modifier) 외에도, 새로운 API를 사용하여 더 고급스럽고 유연한 그림자 효과를 만들 수 있습니다.

다양한 유형의 그림자를 만들기 위해 두 가지 새로운 프리미티브를 사용할 수 있습니다:
`DropShadowPainter()` 및 `InnerShadowPainter()`.

이러한 새로운 그림자를 UI 컴포넌트에 적용하려면 `dropShadow` 또는 `innerShadow` 수정자로 그림자 효과를 설정하세요:

<list columns="2">
   <li><code-block lang="kotlin" code="        Box(&#10;            Modifier.size(120.dp)&#10;                .dropShadow(&#10;                    RectangleShape,&#10;                    DropShadow(12.dp)&#10;                )&#10;                .background(Color.White)&#10;        )&#10;        Box(&#10;            Modifier.size(120.dp)&#10;                .innerShadow(&#10;                    RectangleShape,&#10;                    InnerShadow(12.dp)&#10;                )&#10;        )"></code-block></li>
   <li><img src="compose-advanced-shadows.png" type="inline" alt="Customizable shadows" width="200"/></li>
</list>

어떤 모양이나 색상의 그림자도 그릴 수 있으며, 그림자 지오메트리를 마스크로 사용하여 내부 그라데이션이 채워진 그림자를 만들 수도 있습니다:

<img src="compose-expressive-shadows.png" alt="Expressive shadows" width="244"/>

자세한 내용은 [shadow API 레퍼런스](https://developer.android.com/reference/kotlin/androidx/compose/ui/graphics/shadow/package-summary.html)를 참조하세요.

### 새로운 컨텍스트 메뉴 API

`SelectionContainer` 및 `BasicTextField`에서 커스텀 컨텍스트 메뉴를 위한 Jetpack Compose의 새로운 API를 채택했습니다. iOS 및 웹용 구현이 완료되었으며, 데스크톱은 초기 지원을 제공합니다.

<list columns="2">
   <li><img src="compose_basic_text_field.png" type="inline" alt="Context menu for BasicTextField" width="420"/></li>
   <li><img src="compose_selection_container.png" type="inline" alt="Context menu for SelectionContainer" width="440"/></li>
</list>

이 새로운 API를 활성화하려면 애플리케이션 진입점에서 다음과 같이 설정하세요:

```kotlin
ComposeFoundationFlags.isNewContextMenuEnabled = true
```

자세한 내용은 [컨텍스트 메뉴 API 레퍼런스](https://developer.android.com/reference/kotlin/androidx/compose/foundation/text/contextmenu/data/package-summary)를 참조하세요.

### Material 3 Expressive 테마
<primary-label ref="Experimental"/>

이제 Compose Multiplatform은 Material 3 라이브러리의 실험적 기능인 [`MaterialExpressiveTheme`](https://developer.android.com/reference/kotlin/androidx/compose/material3/package-summary?hl=en#MaterialExpressiveTheme(androidx.compose.material3.ColorScheme,androidx.compose.material3.MotionScheme,androidx.compose.material3.Shapes,androidx.compose.material3.Typography,kotlin.Function0))을 지원합니다. Expressive 테마를 사용하면 더욱 개인화된 경험을 위해 Material Design 앱을 커스터마이징할 수 있습니다.

>Jetpack Material3 [1.4.0-beta01 출시](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.4.0-beta01)에 맞추어, `ExperimentalMaterial3ExpressiveApi` 및 `ExperimentalMaterial3ComponentOverrideApi` 태그가 지정된 모든 공개 API가 제거되었습니다.
>
>이러한 실험적 기능을 사용하려면 Alpha 버전의 Material3를 명시적으로 포함해야 합니다.
{style="note"}

Expressive 테마를 사용하는 방법:

1. 실험적 버전의 Material 3를 포함합니다:

    ```kotlin
    implementation("org.jetbrains.compose.material3:material3:1.9.0-alpha04")
    ```

2. `MaterialExpressiveTheme()` 함수를 사용하여 UI 요소의 전반적인 테마를 구성합니다. 이 함수는 `@OptIn(ExperimentalMaterial3ExpressiveApi::class)` 옵트인이 필요하며, `colorScheme`, `motionScheme`, `shapes`, `typography`를 지정할 수 있게 해줍니다.

그 후 [`Button()`](https://kotlinlang.org/api/compose-multiplatform/material3/androidx.compose.material3/-button.html) 및 [`Checkbox()`](https://kotlinlang.org/api/compose-multiplatform/material3/androidx.compose.material3/-checkbox.html)와 같은 Material 컴포넌트들은 제공된 값을 자동으로 사용하게 됩니다.

<img src="compose_expressive_theme.animated.gif" alt="Material 3 Expressive" width="250" preview-src="compose_expressive_theme.png"/>

### `androidx.compose.runtime:runtime`의 멀티플랫폼 타겟

Compose Multiplatform과 Jetpack Compose의 일관성을 개선하기 위해, 모든 타겟에 대한 지원을 `androidx.compose.runtime:runtime` 아티팩트에 직접 추가했습니다.

`org.jetbrains.compose.runtime:runtime` 아티팩트는 완전히 호환되는 상태로 유지되며, 이제 에일리어스(alias) 역할을 합니다.

### `suspend` 람다를 사용하는 `runComposeUiTest()`

`runComposeUiTest()` 함수가 이제 `suspend` 람다를 허용하여, `awaitIdle()`과 같은 중단 함수(suspending functions)를 사용할 수 있게 되었습니다.

새로운 API는 웹 환경을 위한 적절한 비동기 처리를 포함하여 지원되는 모든 플랫폼에서 올바른 테스트 실행을 보장합니다:

* JVM 및 네이티브 타겟의 경우, `runComposeUiTest()`는 `runBlocking()`과 유사하게 작동하지만 딜레이를 건너뜁니다.
* 웹 타겟(Wasm 및 JS)의 경우, `Promise`를 반환하고 딜레이를 건너뛴 상태로 테스트 본문을 실행합니다.

## iOS

### 프레임 레이트 설정

이제 iOS용 Compose Multiplatform에서 컴포저블 렌더링을 위한 선호 프레임 레이트(frame rate) 설정을 지원합니다. 애니메이션에 끊김 현상(stuttering)이 발생할 경우 프레임 레이트를 높일 수 있습니다. 반대로, 애니메이션이 느리거나 정적인 경우에는 전력 소모를 줄이기 위해 낮은 프레임 레이트로 실행하도록 설정할 수 있습니다.

다음과 같이 선호 프레임 레이트 카테고리를 설정할 수 있습니다:

```kotlin
Modifier.preferredFrameRate(FrameRateCategory.High)
```

또는 특정 컴포저블에 특정 프레임 레이트가 필요한 경우, 음수가 아닌 숫자를 사용하여 초당 프레임 수(FPS)로 선호 프레임 레이트를 정의할 수 있습니다:

```kotlin
Modifier.preferredFrameRate(30f)
```

동일한 `@Composable` 트리 내에서 `preferredFrameRate`를 여러 번 적용하면, 지정된 값 중 가장 높은 값이 적용됩니다. 다만, 장치의 하드웨어가 지원하는 프레임 레이트(일반적으로 최대 120Hz)에 의해 제한될 수 있습니다.

### IME 옵션

Compose Multiplatform 1.9.0에서는 텍스트 입력 컴포넌트를 위한 iOS 전용 IME 커스터마이징 지원을 도입했습니다. 이제 `PlatformImeOptions`를 사용하여 텍스트 필드 컴포넌트에서 키보드 유형, 자동 수정 및 리턴 키 동작과 같은 네이티브 UIKit 텍스트 입력 특성(traits)을 직접 구성할 수 있습니다:

```kotlin
BasicTextField(
    value = "",
    onValueChange = {},
    keyboardOptions = KeyboardOptions(
        platformImeOptions = PlatformImeOptions {
            keyboardType(UIKeyboardTypeEmailAddress)
        }
    )
)
```

## 웹(Web)

### 웹용 Compose Multiplatform 베타 출시

웹용 Compose Multiplatform이 이제 베타(Beta) 단계에 진입하여 시도해 보기 좋은 시기가 되었습니다. 이 이정표에 도달하기까지의 과정에 대해 자세히 알아보려면 [블로그 포스트](https://blog.jetbrains.com/kotlin/2025/09/compose-multiplatform-1-9-0-compose-for-web-beta/)를 확인해 보세요.

안정 버전(stable release)을 향해 나아가면서, 저희의 로드맵에는 다음 내용이 포함되어 있습니다:

* 모바일 브라우저의 드래그 앤 드롭(drag-and-drop) 기능 지원 구현.
* 접근성 지원 개선.
* `TextField` 컴포넌트와 관련된 이슈 해결.

### 접근성 지원

Compose Multiplatform은 이제 웹 타겟에 대한 초기 접근성(accessibility) 지원을 제공합니다. 이 버전을 통해 스크린 리더가 설명 레이블(description labels)에 액세스할 수 있으며, 사용자가 접근성 탐색 모드에서 버튼을 탐색하고 클릭할 수 있습니다.

이 버전에서는 다음 기능들이 아직 지원되지 않습니다:

* 스크롤 및 슬라이더가 있는 상호운용(interop) 및 컨테이너 뷰에 대한 접근성.
* 순회 인덱스(Traversal indexes).

컴포넌트의 [시맨틱 속성(semantic properties)](compose-accessibility.md#semantic-properties)을 정의하여 컴포넌트의 텍스트 설명, 기능 유형, 현재 상태 또는 고유 식별자와 같은 다양한 세부 정보를 접근성 서비스에 제공할 수 있습니다.

예를 들어, 컴포저블에 `Modifier.semantics { heading() }`을 설정하면, 접근성 서비스에 이 요소가 문서의 장이나 소섹션 제목과 같은 헤딩(heading) 역할을 한다고 알립니다. 그러면 스크린 리더는 이 정보를 콘텐츠 탐색에 사용하여 사용자가 헤딩 사이를 직접 이동할 수 있게 합니다.

```kotlin
Text(
    text = "This is heading", 
    modifier = Modifier.semantics { heading() }
)
```

접근성 지원은 현재 기본적으로 활성화되어 있지만, `isA11YEnabled`를 조정하여 언제든지 비활성화할 수 있습니다:

```kotlin
ComposeViewport(
    viewportContainer = document.body!!,
    configure = { isA11YEnabled = false }
) {
    Text("Hello, Compose Multiplatform for web")
}
```

### HTML 콘텐츠 임베딩을 위한 새로운 API

새로운 `WebElementView()` 컴포저블 함수를 사용하면 웹 애플리케이션에 HTML 요소를 원활하게 통합할 수 있습니다.

임베드된 HTML 요소는 Compose 코드에 정의된 크기에 따라 캔버스 영역 위에 겹쳐집니다(overlay). 해당 영역 내의 입력 이벤트를 가로채어 Compose Multiplatform에서 해당 이벤트가 수신되는 것을 방지합니다.

다음은 Compose 애플리케이션 내에서 대화형 지도 뷰를 표시하는 HTML 요소를 만들고 임베드하는 데 `WebElementView()`를 사용하는 예입니다:

```kotlin
private val ttOSM =
    "https://www.openstreetmap.org/export/embed.html?bbox=4.890965223312379%2C52.33722052818563%2C4.893990755081177%2C52.33860862450587&amp;layer=mapnik"

@Composable
fun Map() {
    Box(
        modifier = Modifier.fillMaxWidth().fillMaxHeight()
    ) {
        WebElementView(
            factory = {
                (document.createElement("iframe")
                        as HTMLIFrameElement)
                    .apply { src = ttOSM }
            },
            modifier = Modifier.fillMaxSize(),
            update = { iframe -> iframe.src = iframe.src }
        )
    }
}
```

참고로 `CanvasBasedWindow`는 지원 중단(deprecated)되었으므로, `ComposeViewport` 진입점에서만 이 함수를 사용할 수 있습니다.

### 내비게이션 그래프 바인딩을 위한 단순화된 API

Compose Multiplatform은 브라우저의 내비게이션 상태를 `NavController`에 바인딩하기 위한 새로운 API를 도입했습니다:

```kotlin
suspend fun NavController.bindToBrowserNavigation()
```

이 새로운 함수는 `window` API와 직접 상호작용할 필요를 없애주어, Kotlin/Wasm 및 Kotlin/JS 소스 세트 모두를 단순화합니다.

이전에 사용되던 `Window.bindToNavigation()` 함수는 새로운 `NavController.bindToBrowserNavigation()` 함수로 대체되어 지원 중단되었습니다.

이전:

```kotlin
LaunchedEffect(Unit) {
    // window 객체와 직접 상호작용함
    window.bindToNavigation(navController)
}
```

이후:

```kotlin
LaunchedEffect(Unit) {
    // window 객체에 암시적으로 액세스함
    navController.bindToBrowserNavigation()
}
```

## 데스크톱(Desktop)

### 표시 전 윈도우 설정

Compose Multiplatform에 새로운 `SwingFrame()` 및 `SwingDialog()` 컴포저블이 포함되었습니다. 기존의 `Window()` 및 `DialogWindow()` 함수와 유사하지만 `init` 블록을 포함하고 있습니다.

이전에는 표시 전에 설정해야 하는 특정 윈도우 속성들을 설정할 수 없었습니다. 새로운 `init` 블록은 윈도우나 다이얼로그가 화면에 나타나기 전에 실행되므로, `java.awt.Window.setType`과 같은 속성을 구성하거나 초기에 준비되어야 하는 이벤트 리스너를 추가할 수 있습니다.

`init` 블록은 윈도우나 다이얼로그가 보인 후에는 변경할 수 없는 속성들에 대해서만 사용하는 것을 권장합니다. 그 외의 모든 설정에 대해서는 코드가 향후 업데이트와 호환되고 올바르게 작동하도록 `LaunchedEffect(window)` 패턴을 계속 사용하세요.

## Gradle 플러그인

### 분리된 Material3 버저닝

Material3 라이브러리와 Compose Multiplatform Gradle 플러그인의 버전 및 안정성 수준을 더 이상 일치시킬 필요가 없습니다. `compose.material3` DSL 에일리어스는 Jetpack Compose의 안정 버전에 있는 Material3 1.9.0을 참조하지만, 프로젝트에 프리릴리스 버전을 선택하여 사용할 수 있습니다.

Expressive 디자인 지원이 포함된 Material3 버전을 사용하려면 `build.gradle.kts`의 Material 3 의존성을 다음과 같이 교체하세요:

```kotlin
implementation("org.jetbrains.compose.material3:material3:1.9.0-alpha04")
```

### 통합된 웹 배포

새로운 `composeCompatibilityBrowserDistribution` Gradle 태스크는 Kotlin/JS와 Kotlin/Wasm 배포를 단일 패키지로 결합합니다. 이를 통해 브라우저에서 최신 Wasm 기능을 지원하지 않을 때 Wasm 애플리케이션이 JS 타겟으로 대체(fallback)될 수 있습니다.

### AGP 9.0.0 지원

Compose Multiplatform은 Android Gradle Plugin(AGP) 버전 9.0.0에 대한 지원을 도입합니다. 새로운 AGP 버전과의 호환성을 위해 Compose Multiplatform 1.9.3 또는 1.10.0으로 업그레이드해야 합니다.

장기적으로 업데이트 프로세스를 더 원활하게 만들기 위해, 전용 Android 애플리케이션 모듈을 사용하도록 프로젝트 구조를 변경하는 것을 권장합니다.