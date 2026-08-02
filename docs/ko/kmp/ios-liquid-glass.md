[//]: # (title: Compose Multiplatform 앱에서 리퀴드 글래스(Liquid Glass) 사용하기)
<show-structure depth="1"/>

<web-summary>내비게이션을 네이티브 SwiftUI로 마이그레이션하여 Compose Multiplatform 앱에 iOS 26 리퀴드 글래스(Liquid Glass)를 도입하는 단계별 튜토리얼입니다.</web-summary>

[리퀴드 글래스(Liquid Glass)](https://developer.apple.com/documentation/TechnologyOverviews/liquid-glass)는 iOS 26에서 도입된 Apple의 비주얼 디자인 시스템으로, UI 요소에 유리 같은 반투명함과 유동성을 제공합니다.
Compose Multiplatform 앱에 이를 도입하려면 네이티브 SwiftUI 쉘(shell)이 필요합니다. 리퀴드 글래스 효과는 네이티브 `TabView`, `NavigationStack`, 그리고 툴바 API를 통해 시스템에 의해 렌더링되기 때문입니다.
SwiftUI가 프로젝트에 적합하지 않은 경우, [대안 접근 방식](#대안-접근-방식)을 참조하세요.

이 튜토리얼에서는 각 화면의 콘텐츠 렌더링은 Compose가 담당하게 유지하면서, **iOS 앱의 내비게이션을 완전한 Compose 기반에서 iOS 26 리퀴드 글래스 스타일의 네이티브 SwiftUI 내비게이션으로 마이그레이션하는 방법**을 안내합니다.
앱이 네이티브 `TabView`와 `NavigationStack` 뷰를 사용하면 시스템이 리퀴드 글래스 효과를 자동으로 적용하므로, 리퀴드 글래스 전용 코드를 별도로 작성할 필요는 없습니다.

예시로는 공식 [KotlinConf 앱](https://apps.apple.com/us/app/kotlinconf/id1299196584)을 사용하겠습니다.

> iOS 26 SDK가 포함된 Xcode 26 이상의 버전이 필요합니다.
>
{style="note"}

* [`main` 브랜치](https://github.com/JetBrains/kotlinconf-app/tree/main) — 시작 상태로, Compose로 완전히 구현된 커스텀 테마를 사용합니다.
* [`lg-nav` 브랜치](https://github.com/JetBrains/kotlinconf-app/tree/lg-nav) — 최종 상태로, 리퀴드 글래스 디자인이 적용되어 있습니다.

![공통 UI](ios-kotlinconf-no-liquid-glass.png){ width="250" style="inline"}
![리퀴드 글래스가 적용된 네이티브 iOS UI](ios-kotlinconf-liquid-glass.png){ width="250" style="inline"}

저장소를 클론하고 각 브랜치를 확인하여 따라하거나, 두 브랜치를 나란히 비교해 보세요: 
[`main...lg-nav`](https://github.com/JetBrains/kotlinconf-app/compare/main...lg-nav). 

단순화를 위해 앱의 두 가지 탭 버전(**Schedule** 및 **Info**)을 마이그레이션하겠지만, 동일한 패턴을 모든 수의 탭으로 확장할 수 있습니다.

## 마이그레이션 계획

UI 코드가 완전히 공유되는 Compose Multiplatform 설정에서는 단일 `ComposeUIViewController`가 iOS UI 전체(탭, 내비게이션 스택, 뒤로 가기 제스처, 화면 콘텐츠)를 책임집니다. 
Compose Multiplatform의 iOS 내비게이션 전환은 네이티브처럼 느껴지도록 설계되었지만, iOS 26의 리퀴드 글래스 탭 바 스타일과 같은 일부 플랫폼 수준 기능은 네이티브 iOS 컴포넌트를 통해서만 사용할 수 있습니다.

해결책은 내비게이션을 SwiftUI에 맡겨 시스템이 탭 바와 내비게이션 스택을 네이티브로 렌더링하게 하고, Compose는 각 화면의 콘텐츠만 계속 렌더링하도록 하는 것입니다.

**마이그레이션 전:**

```
ContentView
  └── ComposeView (Compose Multiplatform)
```

**마이그레이션 후:**

```
ContentView
  └── TabView  (Liquid Glass, iOS 26)
        ├── Tab: Schedule
        │     └── NavigationStack
        │           ├── NativeNavComposeView  ← Compose 탭 루트
        │           └── DetailComposeView     ← Compose 상세 화면, 대상당 하나씩
        └── Tab: Info
              └── NavigationStack
                    ├── NativeNavComposeView  ← Compose 탭 루트
                    └── DetailComposeView     ← Compose 상세 화면, 대상당 하나씩
```

새로운 설정에서의 내비게이션 흐름은 다음과 같습니다:

* SwiftUI는 각 탭에 대해 `NavigationStack`을 포함하는 `TabView`를 생성합니다.
* Compose는 여전히 각 화면의 콘텐츠를 렌더링하지만 더 이상 백 스택(back stack)을 관리하지 않습니다.
* 사용자가 Compose 화면에서 내비게이션을 트리거하면(예: 리스트의 행을 탭함), 이벤트가 `onNavigate`를 통해 Swift로 전달됩니다.
* Swift 코디네이터는 경로(route)를 `NavigationStack`에 푸시하고, 이는 단일 Compose 화면을 호스팅하는 새로운 `UIViewController`를 생성합니다.

마이그레이션은 공통 Compose Multiplatform 코드와 네이티브 iOS 코드 모두에 걸쳐 진행됩니다.
공통 Kotlin 코드에서는 다음과 같은 작업을 수행합니다:

* [경로에 제목(title) 메타데이터 추가](#add-title-metadata-to-routes): SwiftUI가 Kotlin을 다시 호출하지 않고도 내비게이션 바 제목과 백 스택 항목을 렌더링할 수 있도록 합니다.
* [iOS 진입점에 내비게이션 콜백 추가](#add-navigation-callbacks-to-the-ios-entry-point): iOS 레이어에서 활성 탭을 제어하고 내비게이션 이벤트에 응답할 수 있도록 합니다.
* [Compose 수준에서 내비게이션 가로채기](#intercept-navigation-at-the-compose-level): 상세 경로가 Compose에서 처리되는 대신 Swift로 전달되도록 합니다. 
  이 튜토리얼은 Navigation 3 구현을 보여줍니다. 다른 내비게이션 라이브러리를 사용하는 경우 이 단계를 조정하세요.
* [iOS용 독립 실행형 화면 렌더러 구축](#build-a-standalone-screen-renderer-for-ios): SwiftUI가 전체 `App()` 외부에서 모든 상세 경로를 독립적으로 렌더링할 수 있도록 합니다.
* [Compose의 기본 내비게이션 UI 숨기기](#hide-compose-s-built-in-navigation-ui): SwiftUI가 제어권을 가질 때 사용자가 중복된 제목 표시줄과 뒤로 가기 버튼을 보지 않도록 합니다.
* [새로운 iOS 진입점 노출](#expose-new-ios-entry-points): 루트 뷰 컨트롤러 및 개별 화면 뷰 컨트롤러를 생성하기 위한 진입점을 만듭니다.

네이티브 iOS 코드(Swift)에서는 다음과 같은 작업을 수행합니다:

* [SwiftUI 내비게이션 레이어 구축](#build-the-swiftui-navigation-layer): 네이티브 `TabView` 및 `NavigationStack` 뷰와 Compose 화면을 임베딩하는 브릿지를 구축합니다.

## 경로에 제목 메타데이터 추가

iOS에서는 각 대상에 내비게이션 바에 표시될 제목이 있으며, 뒤로 가기 버튼을 길게 눌렀을 때 나타나는 백 스택에도 제목이 표시됩니다.
제목을 경로 객체에 직접 저장하여 각 경로가 스스로를 설명하게 하면, Swift가 Kotlin과의 왕복 통신 없이도 제목을 읽을 수 있습니다.

1. `navigation/Routes.kt` 파일에서 `AppRoute`에 `title` 및 `subtitle` 속성을 추가합니다.

    ```kotlin
    @Serializable
    sealed interface AppRoute {
        val title: String? get() = null
        val subtitle: String? get() = null
    }
    ```

2. 상세 화면으로 나타나는 경로에서 `title`(필요한 경우 `subtitle`도 포함)을 오버라이드합니다. 데이터가 이미 포함된 경로의 경우 선택적 파라미터로 추가합니다.

    ```kotlin
    @Serializable
    data class SessionScreen(
        val sessionId: SessionId,
        override val title: String? = null,
    ) : AppRoute
    ```

3. `data object`였던 경로들도 제목이 필요하지만, `data object`는 인스턴스별 제목 상태를 가질 수 없습니다. 이들을 `data class`로 변환합니다.

    <compare type="top-bottom">
        <code-block lang="kotlin" code="            data object SettingsScreen : AppRoute"/>
        <code-block lang="kotlin" code="            data class SettingsScreen(override val title: String = &quot;&quot;) : AppRoute"/>
    </compare>

   업데이트된 전체 경로 정의 세트는 [`Routes.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/commonMain/kotlin/org/jetbrains/kotlinconf/navigation/Routes.kt)를 참조하세요.

4. `NavHost.kt` 파일의 호출 지점에서 로컬라이즈된 제목을 전달합니다.
   `stringResource`는 `@Composable` 함수이므로, 콜백 내부가 아니라 진입점 스코프 내부에서 이를 해석하고 클릭 콜백에서 캡처합니다.

    ```kotlin
    entry<InfoScreen> {
        val settingsTitle = stringResource(Res.string.settings_title)
        InfoScreen(
            onSettings = { navigator.add(SettingsScreen(settingsTitle)) },
            // ...
        )
    }
    ```

## iOS 진입점에 내비게이션 콜백 추가

`App()`은 iOS가 호출하는 Kotlin 진입점입니다. Swift가 내비게이션을 주도하도록 하려면 다음 세 가지를 수행할 방법이 필요합니다.

* 새로운 `topLevelRoute` 파라미터를 통해 앱 실행 시 시작 탭을 선택합니다.
* `onNavigate` 콜백을 통해 Compose에서의 내비게이션 푸시(예: 리스트 항목 탭)에 반응합니다.
* `onActivate` 콜백을 통해 Compose에서 시작된 탭 전환에 반응합니다.

새 콜백은 선택 사항이며 기본값은 `null`이므로 Android, 데스크톱 및 웹 타겟은 영향을 받지 않습니다.

`App.kt` 파일에서 `App()`의 시그니처를 다음과 같이 업데이트합니다.

```kotlin
@Composable
fun App(
    appGraph: AppGraph,
    topLevelRoute: TopLevelRoute,
    onThemeChange: ((isDarkTheme: Boolean) -> Unit)? = null,
    onNavigate: ((AppRoute) -> Unit)? = null,
    onActivate: ((TopLevelRoute) -> Unit)? = null,
) {
    // ...
    val startRoute: AppRoute = remember {
        if (isOnboardingComplete) topLevelRoute else StartPrivacyNoticeScreen
    }
    NavHost(startRoute, isDarkTheme, onThemeChange, onNavigate, onActivate)
}
```

전체 구현은 [`App.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/commonMain/kotlin/org/jetbrains/kotlinconf/App.kt)를 참조하세요.

## Compose 수준에서 내비게이션 가로채기

이제 `App()`이 내비게이션 콜백을 노출하므로 `NavHost`에서 이를 사용해야 합니다. 
상세 경로가 Compose의 백 스택에 나타날 때마다 이를 Swift로 넘기고 즉시 Compose에서 제거합니다. 이렇게 하면 Compose는 Swift에서 호출될 때만 상세 화면을 렌더링하게 됩니다.

두 가지 흐름을 설정해야 합니다:

* 상세 푸시 → Swift: 루트가 아닌 경로가 백 스택에 추가될 때마다 `onNavigate`를 통해 전달하고 Compose의 백 스택에서 제거하여 SwiftUI의 `NavigationStack`이 유일한 정보 소스(single source of truth)가 되도록 합니다.
* 탭 전환 → Swift: Compose 내부에서 최상위 경로(top-level route)가 변경되면 `onActivate`를 통해 Swift에 알려 SwiftUI `TabView` 선택 상태가 동기화되도록 합니다.

이 단계는 Navigation 3 라이브러리에 특화된 내용입니다. 
동일한 가로채기(interception) 패턴이 모든 Compose 내비게이션 라이브러리에 적용될 수 있지만, 구체적인 API(백 스택 액세스, 현재 대상 관찰)는 다를 수 있습니다.

`navigation/NavHost.kt`에서 `NavHost()` 함수에 새로운 파라미터와 두 개의 가로채기 효과를 추가합니다.

```kotlin
import androidx.compose.runtime.snapshotFlow

@Composable
internal fun NavHost(
    startRoute: AppRoute,
    isDarkTheme: Boolean,
    onThemeChange: ((Boolean) -> Unit)?,
    onNavigate: ((AppRoute) -> Unit)? = null,
    onActivate: ((TopLevelRoute) -> Unit)? = null,
) {
    // 상세 경로를 Swift로 전달하고 Compose의 스택에서 제거합니다.
    if (onNavigate != null) {
        LaunchedEffect(navState) {
            snapshotFlow { navState.currentBackstack.toList() }.collect { backstack ->
                val detailRoutes = backstack.drop(1)
                if (detailRoutes.isNotEmpty()) {
                    detailRoutes.forEach { onNavigate(it) }
                    navState.currentBackstack.removeRange(1, navState.currentBackstack.size)
                }
            }
        }
    }
    // 사용자가 Compose 내부에서 탭을 전환할 때 Swift에 알립니다.
    if (onActivate != null) {
        LaunchedEffect(navState) {
            snapshotFlow { navState.topLevelRoute }.collect { route ->
                if (route != null) onActivate(route)
            }
        }
    }
    // ...
}
```

전체 파일은 [`NavHost.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/commonMain/kotlin/org/jetbrains/kotlinconf/navigation/NavHost.kt)를 참조하세요.

## iOS용 독립 실행형 화면 렌더러 구축

SwiftUI가 `NavigationStack`을 소유하면 Compose는 각 화면의 콘텐츠만 렌더링하면 됩니다.
`NavHost`는 백 스택, 전환 및 생명주기를 관리하도록 빌드되었으므로 단일 경로를 렌더링하기 위한 더 단순한 진입점이 필요합니다.

### 평면형 화면 렌더러 추가

`ScreenContent`는 그 단순한 진입점입니다. 자체 내비게이션 상태 없이 단일 상세 경로를 해당 컴포저블에 매핑하는 평면형 `when` 표현식입니다. 탭 루트는 여전히 전체 `App()` / `NavHost`에 의해 처리됩니다.
SwiftUI는 각 대상에 대해 별도의 뷰 컨트롤러를 생성하며, 각 뷰 컨트롤러는 단일 `ScreenContent` 호출을 호스팅합니다.

`navigation/NavHost.kt`에 다음 내용을 추가합니다.

```kotlin
@Composable
fun ScreenContent(
    route: AppRoute,
    onNavigate: (AppRoute) -> Unit,
    onBack: () -> Unit,
    onSet: (AppRoute) -> Unit,
    onActivate: (TopLevelRoute) -> Unit,
) {
    val uriHandler = LocalUriHandler.current
    when (route) {
        is SessionScreen -> SessionScreen(
            sessionId = route.sessionId,
            onBack = onBack,
            onSpeaker = { speakerId -> onNavigate(SpeakerDetailScreen(speakerId)) },
            // ...
        )
        is SpeakerDetailScreen -> SpeakerDetailScreen(
            speakerId = route.speakerId,
            onBack = onBack,
            onSession = { sessionId -> onNavigate(SessionScreen(sessionId)) },
        )
        is SettingsScreen -> SettingsScreen(onBack = onBack)
        is AboutAppScreen -> AboutAppScreen(
            onBack = onBack,
            onLicenses = { onNavigate(LicensesScreen) },
            // ...
        )
        // 기타 모든 상세 경로
        else -> {}
    }
}
```

이 함수에는 제목이 나타나지 않습니다. 제목은 [경로에 제목 메타데이터 추가](#add-title-metadata-to-routes) 단계에서 경로 객체에 이미 연결되었으므로, Swift 측에서 내비게이션 바를 구성할 때 각 경로에서 직접 제목을 읽을 수 있습니다.

### SwiftUI가 내비게이션을 소유하고 있음을 Compose에 신호 보내기

`ScreenContent`는 SwiftUI가 내비게이션 바와 뒤로 가기 버튼을 렌더링하는 컨텍스트에서 실행됩니다. 자체 제목 표시줄이나 뒤로 가기 버튼을 그리는 Compose 화면은 이를 건너뛰어야 합니다.

컴포지션 트리 내부에서 중복을 피하기 위해, iOS 관련 코드에 의존하지 않고 각 화면이 읽을 수 있는 `CompositionLocal`을 사용합니다.

`NavHost.kt` 파일에서 `NavHost()` 함수 앞에 `LocalUseNativeNavigation`을 `CompositionLocal`로 선언합니다.

```kotlin
val LocalUseNativeNavigation = staticCompositionLocalOf { false }
```

### iOS용 렌더러 감싸기

`ScreenContent`는 경로를 렌더링하지만, `App()`이 일반적으로 설정하는 것과 동일한 테마, 의존성 주입 및 앱 전역 `CompositionLocal` 값을 설정하는 래퍼가 필요합니다.

`SingleScreenApp` 래퍼를 추가합니다. 이는 `App()`의 설정을 미러링하고 추가적으로 `LocalUseNativeNavigation`을 `true`로 설정하여, 각 화면이 Compose로 렌더링된 제목 표시줄과 뒤로 가기 버튼을 자동으로 숨기도록 합니다.

`iosMain` 소스 세트에서 `SingleScreenApp.kt` 파일을 생성합니다.

```kotlin
@Composable
internal fun SingleScreenApp(
    appGraph: AppGraph,
    route: AppRoute,
    onNavigate: (AppRoute) -> Unit,
    onGoBack: () -> Unit,
    onSet: (AppRoute) -> Unit,
    onActivate: (TopLevelRoute) -> Unit,
) {
    // 테마 및 플래그 설정
    CompositionLocalProvider(
        LocalUseNativeNavigation provides true,
        LocalFlags provides flags,
        LocalAppGraph provides appGraph,
        // 기타 프로바이더
    ) {
        KotlinConfTheme(colors = colors) {
            Box(Modifier.fillMaxSize().background(KotlinConfTheme.colors.mainBackground)) {
                ScreenContent(route, onNavigate, onGoBack, onSet, onActivate)
            }
        }
    }
}
```

### 탭 루트에 플래그 적용

탭 루트는 여전히 일반적인 `NavHost`를 통과하므로, 이들도 `LocalUseNativeNavigation` 값을 준수해야 합니다.
네이티브 내비게이션 콜백이 활성화되어 있는지 여부에 따라 이를 제공합니다.
활성화된 경우 내비게이션 콘텐츠를 직접 렌더링하고 `NavScaffold`(Compose 하단 바)를 건너뜁니다.

```kotlin
val useNativeNavigation = onNavigate != null

CompositionLocalProvider(LocalUseNativeNavigation provides useNativeNavigation) {
    Box(
        // ...
    ) {
        val content = @Composable {
            NavDisplay(
                entries = navState.toDecoratedEntries(entryProvider),
                onBack = navigator::goBack,
            )
        }
        if (useNativeNavigation) {
            content()
        } else {
            NavScaffold(
                navState = navState,
                navigator = navigator,
                showGoldenKodee = showGoldenKodee,
                content = content,
            )
        }
    }
}
```

전체 구현은 [`NavHost.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/commonMain/kotlin/org/jetbrains/kotlinconf/navigation/NavHost.kt)
및 [`SingleScreenApp.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/iosMain/kotlin/org/jetbrains/kotlinconf/SingleScreenApp.kt)를 참조하세요.

## Compose의 기본 내비게이션 UI 숨기기

SwiftUI가 내비게이션 UI를 렌더링하는 곳마다 `LocalUseNativeNavigation`이 설정되어 있으므로, 이제 개별 화면은 이를 읽고 자체 제목 표시줄과 뒤로 가기 버튼을 숨겨야 합니다. 그렇지 않으면 사용자는 서로 겹쳐진 두 개의 제목 표시줄과 두 개의 뒤로 가기 버튼을 보게 됩니다.

`BaseScreens.kt`에서 `ScreenWithTitle()` 함수를 업데이트하여 `LocalUseNativeNavigation`을 읽고, 그 값이 `true`일 때 제목 표시줄과 구분선을 건너뛰도록 합니다.

```kotlin
val useNativeNavigation = LocalUseNativeNavigation.current

if (!useNativeNavigation) {
    MainHeaderTitleBar(...)
    HorizontalDivider(...)
}
```

자체 뒤로 가기 버튼이나 헤더를 그리는 다른 화면에도 동일한 패턴을 적용합니다.

전체 구현은 [`BaseScreens.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/commonMain/kotlin/org/jetbrains/kotlinconf/BaseScreens.kt)를 참조하세요.

## 새로운 iOS 진입점 노출

SwiftUI에서 새로운 내비게이션 구조를 빌드하기 위해 세 가지 Kotlin 진입점을 노출합니다:
두 개의 `MainViewController` 오버로드와 하나의 `ScreenViewController`입니다.
`iosMain/main.ios.kt`에서 세 가지 함수를 추가합니다.

* 콜백이 없는 `MainViewController`: iOS 26 이전 폴백(fallback)으로 사용됩니다. 리퀴드 글래스 API는 iOS 26이 필요하므로, 구버전에서는 SwiftUI가 원래의 전체 Compose 설정으로 폴백해야 합니다. 이 오버로드가 없으면 Swift의 `#available` 분기가 컴파일되지 않습니다.

    ```kotlin
    // iOS 26 이전 폴백: 전체 Compose 내비게이션, 네이티브 콜백 없음
    @Suppress("unused")
    fun MainViewController(topLevelRoute: TopLevelRoute): UIViewController = ComposeUIViewController(
        configure = { onFocusBehavior = OnFocusBehavior.DoNothing },
    ) {
        App(appGraph, topLevelRoute)
    }
    ```

* 콜백이 있는 `MainViewController`: 각 탭 루트에 대해 SwiftUI에 의해 호출됩니다.
  Compose는 전체 `App()` 및 `NavHost`를 실행하지만, 내비게이션 이벤트는 내부적으로 처리되는 대신 SwiftUI로 전달됩니다.
  시그니처에는 `ScreenViewController`와의 API 대칭을 위해 `onGoBack` 및 `onSet`이 포함되어 있지만, 이 오버로드에서는 사용되지 않습니다.

    ```kotlin
    // 탭 루트: Compose는 NavHost를 실행하지만 내비게이션 이벤트는 SwiftUI에 맡김
    @Suppress("unused")
    fun MainViewController(
        topLevelRoute: TopLevelRoute,
        onNavigate: (AppRoute) -> Unit,
        onGoBack: () -> Unit,
        onSet: (AppRoute) -> Unit,
        onActivate: (TopLevelRoute) -> Unit,
    ): UIViewController = ComposeUIViewController(
        configure = { onFocusBehavior = OnFocusBehavior.DoNothing }
    ) {
        App(appGraph, topLevelRoute, onNavigate = onNavigate, onActivate = onActivate)
    }
    ```
  
* `ScreenViewController`: 각 상세 화면에 대해 SwiftUI에 의해 호출됩니다. `SingleScreenApp`을 통해 단일 경로를 렌더링하며, 이는 `LocalUseNativeNavigation`을 `true`로 설정하여 Compose의 기본 제목 표시줄과 뒤로 가기 버튼을 숨깁니다.

    ```kotlin
    // 상세 화면: LocalUseNativeNavigation = true로 단일 화면 렌더링
    @Suppress("unused")
    fun ScreenViewController(
        route: AppRoute,
        onNavigate: (AppRoute) -> Unit,
        onGoBack: () -> Unit,
        onSet: (AppRoute) -> Unit,
        onActivate: (TopLevelRoute) -> Unit,
    ): UIViewController = ComposeUIViewController(
        configure = { onFocusBehavior = OnFocusBehavior.DoNothing }
    ) {
        SingleScreenApp(appGraph, route, onNavigate, onGoBack, onSet, onActivate)
    }
    ```

전체 구현은 [`main.ios.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/iosMain/kotlin/org/jetbrains/kotlinconf/main.ios.kt)를 참조하세요.

### 대안: SwiftUI를 건너뛰고 Kotlin에서 UIKit 구동하기 {collapsible="true"}

위의 진입점들은 SwiftUI `TabView` 및 `NavigationStack`을 위해 설계되었습니다. 
내부적으로 SwiftUI는 `UITabBarController`와 `UINavigationController`를 사용하여 이러한 뷰를 구현하며, iOS 26의 리퀴드 글래스는 SwiftUI에서 선언하든 UIKit에서 구성하든 관계없이 네이티브 탭 및 내비게이션 바에 적용됩니다.

새로운 iOS 진입점을 처음부터 시작하거나, 유지해야 할 SwiftUI App 및 `ContentView`가 이미 있는 것이 아니라면, SwiftUI 레이어를 완전히 건너뛰고 Kotlin에서 직접 UIKit을 구동할 수 있습니다. 
이 접근 방식은 이 튜토리얼의 SwiftUI 쉘에 필요한 `RouteWrapper` 식별 관련 우회 방법, Kotlin 콜백에서 미러링된 `@Observable` 경로 상태, 그리고 `UIViewControllerRepresentable` 래퍼를 피할 수 있게 해줍니다.
내비게이션 상태가 Swift와 Kotlin에 중복되지 않고 한 곳에서 관리됩니다.

네이티브 내비게이션 바와 공유 Compose 화면 콘텐츠를 얻으려면, `commonMain`에서 내비게이션 계약(contract)을 `expect class` 코디네이터로 선언하고 각 플랫폼에서 `actual` 구현을 작성합니다.

이 튜토리얼의 SwiftUI 쉘은 선언적입니다. `TabView`와 `NavigationStack`을 설명하면 SwiftUI가 스택을 관리합니다.
UIKit 코디네이터 접근 방식은 명령적입니다. 사용자가 `UINavigationController`를 소유하고 직접 `push` 및 `pop`을 호출합니다.

```
SceneDelegate
  └── UIWindow.rootViewController = UITabBarController
        ├── UINavigationController (Schedule)
        │     ├── ComposeUIViewController  ← 탭 루트
        │     └── ComposeUIViewController  ← 상세, Kotlin에서 푸시됨
        └── UINavigationController (Info)
              └── ...
```

이 튜토리얼의 SwiftUI 부분은 UIKit 코디네이터와 다음과 같이 매핑됩니다:

* SwiftUI `TabView` 및 `NavigationStack` → `UITabBarController` 및 `UINavigationController`
* `TabNavigationCoordinator` 및 `RouteWrapper` → Kotlin `actual` 코디네이터의 `push` 및 `pop`
* `NativeNavComposeView` 및 `DetailComposeView` → 코디네이터 내부의 `ComposeUIViewController { Screen(...) }`
* `ContentView` SwiftUI 쉘 → `SceneDelegate`에서 `window.rootViewController` 설정

```kotlin
// commonMain
expect class ScheduleCoordinator() {
    fun navigateToDetail(route: AppRoute)
    fun navigateBack()
    @Composable fun Content()
}
```

`iosMain`의 `actual` 구현은 `UINavigationController`에서 `push` 및 `pop`을 호출하고 `showTopBar`를 `false`로 설정합니다.
iOS에서는 `SceneDelegate`에서 코디네이터를 생성하고 탭 바 컨트롤러를 윈도우의 루트 뷰 컨트롤러로 설정합니다.
SwiftUI `App`이나 `ContentView` 래퍼는 필요하지 않습니다.

Kotlin과 Swift 간의 작업을 두 가지 방식으로 나눌 수 있습니다:

* **전부 Kotlin `iosMain`에서 처리**: UIKit 상호운용성을 사용하여 `actual` 코디네이터에서 `UITabBarController`, `UINavigationController`, `ComposeUIViewController`를 연결합니다.
* **Kotlin에서는 화면 팩토리, Swift에서 조립**: `iosMain`에서 내비게이션 클로저가 포함된 `ComposeUIViewController` 인스턴스를 반환하는 `MainViewController` 및 `ScreenViewController`를 노출하고, 네이티브 Swift에서 탭 바와 내비게이션 스택을 빌드합니다. 이 옵션은 화면 콘텐츠는 Compose로 공유하되 iOS 내비게이션 코드는 Swift에 유지하고 싶을 때 적합합니다.

두 옵션 모두 SwiftUI나 `UIViewControllerRepresentable` 없이 동일한 평면형 UIKit 계층 구조를 제공합니다.
팀이 코디네이터 로직을 어디에 두는 것을 선호하느냐에 따라 선택하세요.

`UITabBarController` 내부에서 Compose를 사용하는 방법에 대한 자세한 내용은 [UIKit 프레임워크와의 통합](compose-uikit-integration.md)을 참조하세요.

## SwiftUI 내비게이션 레이어 구축

이 부분은 마이그레이션의 iOS 측면입니다. 이전 단계의 모든 Kotlin 변경 사항은 여기서 일어날 일을 준비하기 위한 것이었습니다. 즉, Compose 뷰를 대상으로 호스팅하는 각 탭별 `NavigationStack`이 있는 SwiftUI `TabView`를 만드는 것입니다.
이를 위해 다음 과정을 완료하세요:

1. [Kotlin 경로를 `NavigationStack`에서 사용할 수 있도록 만들기](#make-kotlin-routes-usable-in-navigationstack)
2. [탭 및 내비게이션 상태 추적](#track-tab-and-navigation-state)
3. [Compose 화면을 SwiftUI 뷰로 임베딩](#embed-compose-screens-as-swiftui-views)
4. [각 탭 내부의 내비게이션 설정](#set-up-navigation-within-each-tab)
5. [탭 바 빌드](#build-the-tab-bar)
6. [이전 iOS 버전에서의 폴백 처리](#fall-back-on-older-ios-versions)

이 섹션의 어떤 코드도 리퀴드 글래스 효과를 직접 적용하지 않는다는 점에 유의하세요.
iOS 26은 네이티브 `TabView` 및 `NavigationStack` 뷰에 대해 리퀴드 글래스를 자동으로 렌더링하므로, 이를 사용하는 것만으로 충분합니다.

### Kotlin 경로를 `NavigationStack`에서 사용할 수 있도록 만들기

`NavigationStack`은 경로 요소가 `Hashable` 및 `Identifiable`일 것을 요구합니다.
Kotlin sealed interface에 대해 이를 충족하려면 `AppRoute`를 Swift `struct`로 감쌉니다.
`ContentView.swift` 파일에 다음 내용을 추가합니다.

```swift
@available(iOS 26.0, *)
struct RouteWrapper: Hashable, Identifiable {
    let id = UUID()
    let route: AppRoute

    static func ==(lhs: RouteWrapper, rhs: RouteWrapper) -> Bool {
        lhs.id == rhs.id
    }

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}
```

동일한 경로를 두 번 푸시할 때 예상되는 내비게이션 동작에 맞춰 두 개의 별개 스택 항목이 생성되어야 합니다. 이를 위해 경로의 값 대신 UUID를 기반으로 식별(identity)을 수행합니다.

### 탭 및 내비게이션 상태 추적

각 탭은 자체 내비게이션 스택을 가지며, 앱은 현재 선택된 탭을 추적합니다. 이를 처리하기 위해 두 개의 `@Observable` 클래스를 추가합니다.

```swift
@available(iOS 26.0, *)
@Observable
class TabNavigationCoordinator {
    var path: [RouteWrapper] = []

    func push(_ route: AppRoute) {
        path.append(RouteWrapper(route: route))
    }

    func pop() {
        if !path.isEmpty {
            path.removeLast()
        }
    }

    func popToRoot() {
        path.removeAll()
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="@Observable class TabNavigationCoordinator { "}

```swift
@available(iOS 26.0, *)
@Observable
class AppNavigationCoordinator {
    enum AppTab {
        case schedule, info
    }

    var selectedTab: AppTab = .schedule
    let scheduleCoordinator = TabNavigationCoordinator()
    let infoCoordinator = TabNavigationCoordinator()

    func activateTab(for route: TopLevelRoute) {
        if route is ScheduleScreen {
            selectedTab = .schedule
        } else if route is InfoScreen {
            selectedTab = .info
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="@Observable class AppNavigationCoordinator { "}

`AppNavigationCoordinator`는 이 튜토리얼에서 사용된 두 개의 탭 버전에 맞춰 단순화되었습니다. 전체 버전은 [`ContentView.swift`](https://github.com/JetBrains/kotlinconf-app/blob/b451d80301c50097d4cf5050d865829b49d07c8e/app/iosApp/iosApp/ContentView.swift)를 참조하세요.

### Compose 화면을 SwiftUI 뷰로 임베딩

두 개의 `UIViewControllerRepresentable` 타입이 [새로운 iOS 진입점 노출](#expose-new-ios-entry-points) 단계의 Kotlin 진입점을 SwiftUI에 연결합니다. 하나는 탭 루트용이고 하나는 상세 화면용입니다.

`NativeNavComposeView`는 탭 루트(Compose의 `NavHost`)를 호스팅하고 내비게이션 이벤트를 전달합니다.

```swift
@available(iOS 26.0, *)
struct NativeNavComposeView: UIViewControllerRepresentable {
    let topLevelRoute: TopLevelRoute
    let coordinator: TabNavigationCoordinator
    let appCoordinator: AppNavigationCoordinator

    func makeUIViewController(context: Context) -> UIViewController {
        return Main_iosKt.MainViewController(
            topLevelRoute: topLevelRoute,
            onNavigate: { route in self.coordinator.push(route) },
            onGoBack: { self.coordinator.pop() },
            onSet: { route in
                self.coordinator.popToRoot()
                if let topLevel = route as? TopLevelRoute {
                    self.appCoordinator.activateTab(for: topLevel)
                } else {
                    self.coordinator.push(route)
                }
            },
            onActivate: { route in self.appCoordinator.activateTab(for: route) }
        )
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {
    }
}
```

`DetailComposeView`는 단일 상세 화면을 호스팅하며, 각 `NavigationStack` 대상에 대해 하나의 인스턴스가 생성됩니다.

```swift
@available(iOS 26.0, *)
struct DetailComposeView: UIViewControllerRepresentable {
    let route: AppRoute
    let coordinator: TabNavigationCoordinator
    let appCoordinator: AppNavigationCoordinator

    func makeUIViewController(context: Context) -> UIViewController {
        return Main_iosKt.ScreenViewController(
            route: route,
            onNavigate: { newRoute in self.coordinator.push(newRoute) },
            onGoBack: { self.coordinator.pop() },
            onSet: { route in
                self.coordinator.popToRoot()
                if let topLevel = route as? TopLevelRoute {
                    self.appCoordinator.activateTab(for: topLevel)
                } else {
                    self.coordinator.push(route)
                }
            },
            onActivate: { route in self.appCoordinator.activateTab(for: route) }
        )
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {
    }
}
```

### 각 탭 내부의 내비게이션 설정

탭 수준에서 `NavigationStack`은 Compose 탭 콘텐츠를 루트로 사용하고 상세 화면을 대상으로 렌더링합니다.

`.navigationBarHidden(true)`를 적용하더라도 탭 루트에 `.navigationTitle(title)`을 설정해야 합니다. iOS 26은 이 값을 읽어 플로팅 탭 바에서 탭의 레이블을 지정하며, 이 값이 없으면 레이블이 공백으로 표시됩니다.

```swift
@available(iOS 26.0, *)
struct TabContentView: View {
    let topLevelRoute: TopLevelRoute
    let coordinator: TabNavigationCoordinator
    let appCoordinator: AppNavigationCoordinator
    let title: String

    var body: some View {
        NavigationStack(path: Binding(
            get: { coordinator.path },
            set: { coordinator.path = $0 }
        )) {
            NativeNavComposeView(
                topLevelRoute: topLevelRoute,
                coordinator: coordinator,
                appCoordinator: appCoordinator
            )
                .ignoresSafeArea(.all)
                .navigationTitle(title)
                .navigationBarHidden(true)
                .navigationDestination(for: RouteWrapper.self) { wrapper in
                    DetailComposeView(
                        route: wrapper.route,
                        coordinator: coordinator,
                        appCoordinator: appCoordinator
                    )
                        .ignoresSafeArea(.all)
                        .navigationTitle(wrapper.route.title ?? "")
                        .navigationSubtitle(wrapper.route.subtitle ?? "")
                        .toolbarTitleDisplayMode(.inline)
                }
        }
    }
}
```

### 탭 바 빌드

최상위 컨테이너는 각 최상위 경로에 대해 하나의 `Tab`을 가지는 `TabView`입니다.
`.tabBarMinimizeBehavior(.automatic)` 수정자는 탭 바를 플로팅 상태로 만들고 스크롤 시 최소화합니다. 이 기능이 없으면 탭 바는 하단에 고정된 상태로 유지됩니다.
`.tint(Color(.accent))` 수정자는 선택된 탭에 앱의 강조 색상을 적용합니다.

```swift
@available(iOS 26.0, *)
struct NativeNavContentView: View {
    @State private var appCoordinator = AppNavigationCoordinator()

    var body: some View {
        TabView(selection: Binding(
            get: { appCoordinator.selectedTab },
            set: { appCoordinator.selectedTab = $0 }
        )) {
            Tab(String(localized: "Schedule"), systemImage: "clock",
                value: AppNavigationCoordinator.AppTab.schedule) {
                TabContentView(topLevelRoute: ScheduleScreen(),
                               coordinator: appCoordinator.scheduleCoordinator,
                               appCoordinator: appCoordinator, title: String(localized: "Schedule"))
            }
            Tab(String(localized: "Info"), systemImage: "info.circle",
                value: AppNavigationCoordinator.AppTab.info) {
                TabContentView(topLevelRoute: InfoScreen(),
                               coordinator: appCoordinator.infoCoordinator,
                               appCoordinator: appCoordinator, title: String(localized: "Info"))
            }
        }
        .tabBarMinimizeBehavior(.automatic) 
        .tint(Color(.accent))
    }
}
```

`Color(.accent)`는 Xcode 프로젝트의 에셋 카탈로그에 있는 `AccentColor` 에셋으로 해석됩니다.
Xcode의 에셋 카탈로그 에디터를 통해 정의하거나([Specifying your app's color scheme](https://developer.apple.com/documentation/xcode/specifying-your-apps-color-scheme) 참조) 
`Assets.xcassets/AccentColor.colorset/Contents.json`을 생성하여 정의할 수 있습니다. JSON 옵션의 경우, 샘플 프로젝트의 [`Contents.json`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/iosApp/iosApp/Assets.xcassets/AccentColor.colorset/Contents.json)을 시작점으로 삼아 컴포넌트 값을 원하는 색상으로 교체할 수 있습니다.

두 개의 탭을 적용하면 앱이 다음과 같이 렌더링됩니다:

![두 개의 탭](ios-kotlinconf-two-tabs.png){ width="250" style="block"}

반투명도, 깊이감 및 플로팅 탭 바는 모두 iOS 26에 의해 적용되며 추가 스타일링 코드는 필요하지 않습니다.

### 이전 iOS 버전에서의 폴백 처리

리퀴드 글래스와 새로운 `TabView` API는 iOS 26 전용입니다. 
구버전에서 앱은 이전의 Compose 기반 설정으로 폴백합니다.
`ComposeView`는 콜백이 없는 `MainViewController` 오버로드를 감싸는 SwiftUI 래퍼입니다.

```swift
struct ContentView: View {
    var body: some View {
        if #available(iOS 26.0, *) {
            NativeNavContentView()
        } else {
            ComposeView(topLevelRoute: ScheduleScreen())
                .ignoresSafeArea(.all)
        }
    }
}
```

전체 파일은 [`ContentView.swift`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/iosApp/iosApp/ContentView.swift)를 참조하세요.

## 대안 접근 방식

이 튜토리얼의 마이그레이션 방식은 네이티브 SwiftUI 내비게이션을 선호하며, 이를 통해 리퀴드 글래스 및 기타 시스템 동작을 즉시 사용할 수 있습니다. 이 방식이 프로젝트에 맞지 않는다면 다음 대안 중 하나를 고려해 보세요:

* **Kotlin에서 조정되는 UIKit 내비게이션**: `commonMain`에서 내비게이션 계약을 `expect class` 코디네이터로 선언하고, 각 플랫폼에서 `actual` 구현을 통해 `UITabBarController` 및 `UINavigationController`를 명령적으로 구동합니다. SwiftUI 쉘 없이도 리퀴드 글래스와 단일 내비게이션 상태 소스를 얻을 수 있지만, UIKit 상호운용 코드를 작성해야 합니다. 자세한 내용은 [SwiftUI를 건너뛰고 Kotlin에서 UIKit 구동하기](#대안-swiftui를-건너뛰고-kotlin에서-uikit-구동하기)를 참조하세요.
* **네이티브 상호운용 컨트롤이 있는 Compose 기반 내비게이션**: 내비게이션은 Compose에 유지하되, `UITabBar` 및 `UINavigationBar`와 같은 네이티브 UI 컨트롤을 리퀴드 글래스 스타일링과 함께 임베딩합니다. 단점은 네이티브 오버레이와 Compose 콘텐츠 간의 일부 상호운용성 제한입니다.
* **적응형 UI를 위한 서드파티 솔루션을 활용한 Compose 기반 내비게이션**: [Calf](https://klibs.io/project/MohamedRejeb/Calf)와 같은 라이브러리를 사용하여 앱이 실행 중인 플랫폼에 네이티브인 적응형 UI 컴포넌트를 렌더링합니다. 이 방식은 플랫폼 차이를 직접 처리하는 복잡성을 줄여주며 iOS의 리퀴드 글래스와 같은 네이티브 동작을 기본적으로 제공합니다.
* **리퀴드 글래스 효과를 모방한 Compose 전용 내비게이션**: 모든 것을 Compose에서 렌더링하고 리퀴드 글래스를 시각적으로 근사하게 구현합니다. 예를 들어 [AndroidLiquidGlass](https://klibs.io/project/Kyant0/AndroidLiquidGlass) 또는 [Liquid](https://klibs.io/project/FletchMcKee/liquid)와 같은 라이브러리를 사용할 수 있습니다. 이 방식은 시스템 리퀴드 글래스와 완전히 동일하지는 않지만 시각적으로 유사한 효과를 내면서 모든 UI를 Compose 측에 유지합니다.

## 다음 단계

* 리퀴드 글래스 효과가 적용된 [공식 KotlinConf 애플리케이션](https://github.com/JetBrains/kotlinconf-app/tree/lg-nav)을 확인해 보세요.
* Apple의 새로운 머티리얼 및 도입 체크리스트인 [Adopting Liquid Glass](https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass)를 참조하세요.
* SwiftUI 내부에서 Compose Multiplatform을 사용하고 Compose Multiplatform 앱 내부에 SwiftUI를 임베딩하는 공식 가이드는 [SwiftUI 프레임워크와의 통합](compose-swiftui-integration.md)을 참조하세요.