[//]: # (title: Compose Multiplatform 1.10.3의 새로운 기능)

이번 기능 릴리스의 주요 하이라이트는 다음과 같습니다.

 * [통합된 `@Preview` 어노테이션](#unified-preview-annotation)
 * [Navigation 3 지원](#support-for-navigation-3)
 * [번들된 Compose Hot Reload](#compose-hot-reload-integration)

이번 릴리스의 전체 변경 사항 목록은 [GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.10.0)에서 확인할 수 있습니다.
구체적인 컴포넌트 버전에 대한 자세한 내용은 [의존성](#dependencies) 섹션을 참조하세요.

## 파괴적 변경 사항 및 지원 중단

### 지원 중단된 의존성 별칭

Compose Multiplatform Gradle 플러그인에서 지원하던 의존성 별칭(`compose.ui` 등)이 1.10.0-beta01 릴리스부터 지원 중단(deprecated)되었습니다.
버전 카탈로그(version catalogs)에 직접 라이브러리 참조를 추가하는 것을 권장합니다.
구체적인 참조 방식은 해당 지원 중단 알림에서 제안됩니다.

이 변경을 통해 Compose Multiplatform 라이브러리의 의존성 관리가 좀 더 투명해질 것입니다.
향후에는 호환되는 버전을 더 쉽게 설정할 수 있도록 Compose Multiplatform용 BOM을 제공할 예정입니다.

### 지원 중단된 `PredictiveBackHandler()`

Compose Multiplatform에서 네이티브 안드로이드의 뒤로 가기 탐색 제스처를 다른 플랫폼에 도입하기 위해 `PredictiveBackHandler()` 함수가 도입되었습니다.
Navigation 3 릴리스와 함께, 이전 구현은 새로운 [Navigation Event](https://developer.android.com/jetpack/androidx/releases/navigationevent) 라이브러리 및 해당 API를 위해 지원 중단되었습니다.
구체적으로, 이제 `PredictiveBackHandler()` 함수 대신 더 일반적인 `NavigationEventHandler()` 구현을 감싸는 새로운 `NavigationBackHandler()` 함수를 사용해야 합니다.

가장 간단한 마이그레이션 예시는 다음과 같습니다.

<compare type="top-bottom">
    <code-block lang="kotlin" code="         PredictiveBackHandler(enabled = true) { progress -&gt;&#10;            try {&#10;                progress.collect { event -&gt;&#10;                    // 뒤로 가기 제스처 진행 상황을 애니메이션화합니다&#10;                }&#10;                // 완료된 뒤로 가기 제스처를 처리합니다&#10;            } catch(e: Exception) {&#10;                // 취소된 뒤로 가기 제스처를 처리합니다&#10;            }&#10;        }"></code-block>
    <code-block lang="kotlin" code="        // 필수 인자를 충족하기 위해 빈 상태를 스텁(stub)으로 사용합니다&#10;        val navState = rememberNavigationEventState(NavigationEventInfo.None)&#10;        NavigationBackHandler(&#10;            state = navState,&#10;            isBackEnabled = true,&#10;            onBackCancelled = {&#10;                // 취소된 뒤로 가기 제스처를 처리합니다&#10;            },&#10;            onBackCompleted = {&#10;              // 완료된 뒤로 가기 제스처를 처리합니다&#10;            }&#10;        )&#10;        LaunchedEffect(navState.transitionState) {&#10;            val transitionState = navState.transitionState&#10;            if (transitionState is NavigationEventTransitionState.InProgress) {&#10;                val progress = transitionState.latestEvent.progress&#10;                // 뒤로 가기 제스처 진행 상황을 애니메이션화합니다&#10;            }&#10;        }"></code-block>
</compare>

참고 사항:

* `state` 매개변수는 필수입니다: `NavigationEventInfo`는 UI 상태에 대한 컨텍스트 정보를 보유하도록 설계되었습니다.
  현재 저장할 정보가 없다면 `NavigationEventInfo.None`을 스텁으로 사용할 수 있습니다.
* `onBack` 매개변수가 `onBackCancelled`와 `onBackCompleted`로 분리되어, 취소된 제스처를 별도로 추적할 필요가 없습니다.
* `NavigationEventState.transitionState` 속성은 실제 제스처의 진행 상황을 추적하는 데 도움이 됩니다.

구현에 대한 자세한 내용은 [Navigation Event API 참조의 NavigationEventHandler 페이지](https://developer.android.com/reference/kotlin/androidx/navigationevent/NavigationEventHandler)를 확인하세요.

### 최소 Kotlin 버전 상향

프로젝트에 네이티브 또는 웹 타겟이 포함된 경우, 최신 기능을 사용하려면 Kotlin 2.2.20으로 업그레이드해야 합니다.

## 플랫폼 공통

### 통합된 `@Preview` 어노테이션

플랫폼 전반에 걸쳐 프리뷰에 대한 접근 방식을 통합했습니다.
이제 `commonMain` 소스 세트에서 `androidx.compose.ui.tooling.preview.Preview` 어노테이션을 사용할 수 있습니다.

`org.jetbrains.compose.ui.tooling.preview.Preview` 및 데스크톱 전용 `androidx.compose.desktop.ui.tooling.preview.Preview`와 같은 다른 모든 어노테이션은 지원 중단되었습니다.

### 상호운용 뷰 자동 크기 조정

이제 Compose Multiplatform은 데스크톱과 iOS 모두에서 네이티브 상호운용(interop) 요소의 자동 크기 조정을 지원합니다.
이러한 요소들은 이제 콘텐츠에 맞춰 레이아웃을 조정할 수 있어, 수동으로 정확한 크기를 계산하거나 고정된 치수를 미리 지정할 필요가 없습니다.

* 데스크톱에서 `SwingPanel`은 임베디드 컴포넌트의 최소, 기본(preferred), 최대 크기에 따라 크기를 자동으로 조정합니다.
* iOS에서 UIKit 상호운용 뷰는 이제 뷰의 피팅 크기(intrinsic content size, 고유 콘텐츠 크기)에 따른 크기 조정을 지원합니다.
  이를 통해 SwiftUI 뷰(`UIHostingController`를 통해) 및 `NSLayoutConstraints`에 의존하지 않는 기본 `UIView` 서브클래스를 적절하게 래핑할 수 있습니다.

### 안정화된 `Popup` 및 `Dialog` 속성

`DialogProperties`의 다음 속성들이 안정(stable) 버전으로 승격되었으며 더 이상 실험적이지 않습니다: 
`usePlatformInsets`, `useSoftwareKeyboardInset`, `scrimColor`.

마찬가지로, `PopupProperties`의 `usePlatformDefaultWidth` 및 `usePlatformInsets` 속성도 안정 버전으로 승격되었습니다.

업데이트된 API 사용을 강제하기 위해 `PopupProperties` 매개변수가 없는 `Popup` 오버로드의 지원 중단 수준이 `ERROR`로 변경되었습니다.

### Skia 버전 138(Milestone 138)로 업데이트

Skiko를 통해 Compose Multiplatform에서 사용하는 Skia 버전이 Milestone 138로 업데이트되었습니다.

이전에 사용된 Skia 버전은 Milestone 132였습니다.
해당 버전들 사이의 변경 사항은 [릴리스 노트](https://skia.googlesource.com/skia/+/refs/heads/chrome/m138/RELEASE_NOTES.md)에서 확인할 수 있습니다.

### Navigation 3 지원
<primary-label ref="Experimental"/>

Navigation 3는 Compose와 함께 작동하도록 설계된 새로운 탐색 라이브러리입니다.
Navigation 3를 사용하면 백 스택(back stack)을 완전히 제어할 수 있으며, 목적지(destination)를 이동하는 것이 리스트에서 아이템을 추가하고 제거하는 것만큼 간단해집니다.
새로운 가이드 원칙과 결정 사항은 [Navigation 3 문서](https://developer.android.com/guide/navigation/navigation-3) 및 발표 [블로그 포스트](https://android-developers.googleblog.com/2025/05/announcing-jetpack-navigation-3-for-compose.html)에서 읽어볼 수 있습니다.

Compose Multiplatform 1.10.0-beta01은 안드로이드 이외의 타겟에서 새로운 탐색 API를 사용할 수 있도록 알파(Alpha) 지원을 제공합니다. 릴리스된 멀티플랫폼 아티팩트는 다음과 같습니다.

* Navigation 3 UI 라이브러리, `org.jetbrains.androidx.navigation3:navigation3-ui`
* Navigation 3용 ViewModel, `org.jetbrains.androidx.lifecycle:lifecycle-viewmodel-navigation3`
* Navigation 3용 Material 3 적응형 레이아웃, `org.jetbrains.compose.material3.adaptive:adaptive-navigation3`

원본 안드로이드 리포지토리를 미러링한 [nav3-recipes](https://github.com/terrakok/nav3-recipes) 샘플에서 멀티플랫폼 Navigation 3 구현 예시를 찾을 수 있습니다.

플랫폼별 구현 세부 사항:

* iOS에서는 이제 [EndEdgePanGestureBehavior](https://github.com/JetBrains/compose-multiplatform-core/pull/2519) 옵션(기본값 `Disabled`)을 사용하여 끝 가장자리(end edge) [팬 제스처(pan gestures)](https://developer.apple.com/documentation/uikit/handling-pan-gestures)에 대한 탐색을 관리할 수 있습니다.
  여기서 "끝 가장자리(end edge)"는 LTR 인터페이스에서는 화면의 오른쪽 가장자리를, RTL 인터페이스에서는 왼쪽 가장자리를 의미합니다.
  시작 가장자리(start edge)는 끝 가장자리의 반대이며 항상 뒤로 가기 제스처에 바인딩됩니다.
* 웹 앱의 경우, 데스크톱 브라우저에서 **Esc** 키를 누르면 데스크톱 앱에서와 마찬가지로 사용자가 이전 화면으로 돌아가거나(다이얼로그, 팝업, Material 3의 `SearchBar`와 같은 일부 위젯을 닫음) 할 수 있습니다.
* [브라우저 기록 탐색](compose-navigation-routing.md#support-for-browser-navigation-in-web-apps) 및 주소창의 목적지 사용 지원은 Compose Multiplatform 1.10의 Navigation 3로 확장되지 않습니다.
  이는 멀티플랫폼 라이브러리의 이후 버전으로 연기되었습니다.

## iOS

### 윈도우 인셋(Window insets)

Compose Multiplatform은 이제 상태 표시줄, 내비게이션 바 또는 화면 키보드와 같은 윈도우 인셋을 기반으로 UI 요소의 위치와 크기를 조정하는 기능을 제공하는 `WindowInsetsRulers`를 지원합니다.

윈도우 인셋을 관리하는 이 새로운 방식은 플랫폼별 윈도우 인셋 데이터를 검색하기 위해 단일 구현을 사용합니다.
즉, `WindowInsets`와 `WindowInsetsRulers` 모두 공통 메커니즘을 사용하여 인셋을 일관되게 관리합니다.

> 이전에는 `WindowInsets.Companion.captionBar`에 `@Composable` 표시가 없었습니다.
> 플랫폼 간 동작을 맞추기 위해 `@Composable` 속성을 추가했습니다.
>
{style="note"}

### IME 설정 개선

1.9.0에서 도입된 [iOS 전용 IME 커스터마이징](whats-new-compose-190.md#ime-options)에 이어, 이번 릴리스에서는 `PlatformImeOptions`를 사용하여 텍스트 입력 뷰를 설정하는 새로운 API가 추가되었습니다.

이 새로운 API를 사용하면 필드에 포커스가 가고 IME가 트리거될 때 입력 인터페이스를 커스터마이징할 수 있습니다.

 * `UIResponder.inputView`는 기본 시스템 키보드를 대체할 사용자 정의 입력 뷰를 지정합니다.
 * `UIResponder.inputAccessoryView`는 IME 활성화 시 시스템 키보드 또는 사용자 정의 `inputView`에 부착되는 사용자 정의 액세서리 뷰를 정의합니다.

### 상호운용 뷰의 오버레이 배치
<primary-label ref="Experimental"/>

이제 실험적인 `placedAsOverlay` 플래그를 사용하여 Compose UI 위에 `UIKitView` 및 `UIKitViewController` 뷰를 배치할 수 있습니다.
이 플래그를 사용하면 상호운용 뷰가 투명한 배경과 네이티브 셰이더 효과를 지원할 수 있습니다.

상호운용 뷰를 오버레이로 렌더링하려면 `@OptIn(ExperimentalComposeUiApi::class)` 어노테이션을 사용하고 `UIKitInteropProperties`에서 `placedAsOverlay` 매개변수를 `true`로 설정하세요.

```kotlin
UIKitViewController(
    modifier = modifier,
    update = {},
    factory = { factory.createNativeMap() },
    properties = UIKitInteropProperties(placedAsOverlay = true)
)
```

이 설정은 뷰를 Compose UI 레이어 위에 렌더링하므로, 결과적으로 동일한 영역에 있는 다른 컴포저블을 시각적으로 가리게 된다는 점에 유의하세요.

## 웹

### 리소스 캐싱
<primary-label ref="Experimental"/>

Compose Multiplatform은 이제 [Web Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache)를 사용하여 정적 에셋 및 문자열 리소스에 대한 성공적인 응답을 캐싱합니다.
이 방식은 반복적인 HTTP 요청을 통해 저장된 콘텐츠를 검증하며 대역폭이 낮은 연결에서 특히 느릴 수 있는 브라우저의 기본 캐시와 관련된 지연을 방지합니다.
캐시는 앱을 실행하거나 페이지를 새로 고칠 때마다 지워져 리소스가 애플리케이션의 현재 상태와 일치하도록 보장합니다.

자세한 내용은 [풀 리퀘스트(pull request)](https://github.com/JetBrains/compose-multiplatform/pull/5379) 및 [웹 리소스 캐싱](compose-web-resources.md#caching-web-resources) 문서를 참조하세요.

## 데스크톱

### Compose Hot Reload 통합

이제 Compose Hot Reload 플러그인이 Compose Multiplatform Gradle 플러그인에 번들로 제공됩니다.
데스크톱을 타겟으로 하는 Compose Multiplatform 프로젝트의 경우 기본적으로 활성화되므로 더 이상 Hot Reload 플러그인을 별도로 설정할 필요가 없습니다.

Compose Hot Reload 플러그인을 명시적으로 선언하던 프로젝트의 경우 다음과 같습니다.

 * Compose Multiplatform Gradle 플러그인에서 제공하는 버전을 사용하기 위해 선언을 안전하게 제거할 수 있습니다.
 * 특정 버전 선언을 유지하기로 선택한 경우, 번들된 버전 대신 해당 버전이 사용됩니다.

번들된 Compose Hot Reload Gradle 플러그인의 최소 Kotlin 버전은 2.1.20입니다.
이전 버전의 Kotlin이 감지되면 Hot Reload 기능이 비활성화됩니다.

## Gradle

### AGP 9.0.0 지원

Compose Multiplatform은 Android Gradle Plugin(AGP) 버전 9.0.0 지원을 도입합니다.
새로운 AGP 버전과의 호환성을 위해 Compose Multiplatform 1.9.3 또는 1.10.0으로 업그레이드했는지 확인하세요.

장기적으로 업데이트 프로세스를 원활하게 하기 위해, 프로젝트 구조를 전용 Android 애플리케이션 모듈을 사용하도록 변경하는 것을 권장합니다.

## 의존성

| 라이브러리 | Maven 좌표 | 기반 Jetpack 버전 |
|--------------------|------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Runtime | `org.jetbrains.compose.runtime:runtime*:1.10.3` | [Runtime 1.10.5](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.10.5) |
| UI | `org.jetbrains.compose.ui:ui*:1.10.3` | [UI 1.10.5](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.10.5) |
| Foundation | `org.jetbrains.compose.foundation:foundation*:1.10.3` | [Foundation 1.10.5](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.10.5) |
| Material | `org.jetbrains.compose.material:material*:1.10.3` | [Material 1.10.5](https://developer.android.com/jetpack/androidx/releases/compose-material#1.10.5) |
| Material3 | `org.jetbrains.compose.material3:material3*:1.10.0-alpha05` | [Material3 1.5.0-alpha08](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.5.0-alpha08) |
| Material3 Adaptive | `org.jetbrains.compose.material3.adaptive:adaptive*:1.3.0-alpha02` | [Material3 Adaptive 1.3.0-alpha03](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.3.0-alpha03) |
| Lifecycle | `org.jetbrains.androidx.lifecycle:lifecycle-*:2.10.0` | [Lifecycle 2.10.0](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.10.0) |
| Navigation | `org.jetbrains.androidx.navigation:navigation-*:2.9.2` | [Navigation 2.9.7](https://developer.android.com/jetpack/androidx/releases/navigation#2.9.7) |
| Navigation3 | `org.jetbrains.androidx.navigation3:navigation3-*:1.0.0-alpha06` | [Navigation3 1.0.0](https://developer.android.com/jetpack/androidx/releases/navigation3#1.0.0) |
| Navigation Event | `org.jetbrains.androidx.navigationevent:navigationevent-compose:1.0.1` | [Navigation Event 1.0.2](https://developer.android.com/jetpack/androidx/releases/navigationevent#1.0.2) |
| Savedstate | `org.jetbrains.androidx.savedstate:savedstate*:1.4.0` | [Savedstate 1.4.0](https://developer.android.com/jetpack/androidx/releases/savedstate#1.4.0) |
| WindowManager Core | `org.jetbrains.androidx.window:window-core:1.5.1` | [WindowManager 1.5.1](https://developer.android.com/jetpack/androidx/releases/window#1.5.1) |