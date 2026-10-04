[//]: # (title: 네이티브 애플리케이션 진입점)

Compose Multiplatform UI는 전적으로 공통 코드에서 구현할 수 있지만,
실제 애플리케이션은 네이티브 진입점(entry point)에서 시작됩니다.
이러한 진입점은 앱의 플랫폼별 동작을 변경할 수 있는 위치입니다.

예를 들어, [KMP IDE 마법사로 생성된 기본 프로젝트](quickstart.md)에서
UI의 기본 베이스는 공통 코드의 `App()` 함수입니다.
그런 다음 이 함수가 각 플랫폼에서 호출됩니다:

* Android에서는 액티비티(activity)가 호출을 관리합니다.
* iOS에서는 뷰 컨트롤러(view controller)가 관리합니다.
* 데스크톱에서는 윈도우(window)가 관리합니다.
* 웹에서는 컨테이너(container)가 관리합니다.

> 이 예제들에서는 `App()` 함수가 어떤 매개변수도 받지 않습니다.
> 규모가 더 큰 애플리케이션에서는 일반적으로 플랫폼별 의존성(dependency)에 매개변수를 전달합니다.
> 이러한 의존성은 수동으로 제공하거나 의존성 주입(dependency injection) 라이브러리를 사용하여 전달할 수 있습니다.
>
{style="tip"}

## Android의 경우 {id="on-android"}

Android의 경우, `MainActivity`라는 [Android 액티비티](https://developer.android.com/guide/components/activities/intro-activities) 내의 `setContent()` 람다에서 호출이 이루어집니다:

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        setContent {
            // Calling the common App() composable
            App()
        }
    }
}
```

Compose Multiplatform은 모든 Jetpack Compose API에 대한 접근을 제공하지만,
[그중 일부는 Android 앱에서만 사용할 수 있습니다](compose-android-only-components.md).

## iOS의 경우 {id="on-ios"}

iOS의 경우, Android의 액티비티와 동일한 역할을 수행하는 [뷰 컨트롤러](https://developer.apple.com/documentation/uikit/view_controllers) 내에서 공통 `App()` 컴포저블(composable)을 호출합니다:

```kotlin
fun MainViewController() = ComposeUIViewController { App() }
```

iOS 뷰 컨트롤러와 Android 액티비티 모두 공통 코드에서 `App()` 컴포저블을 단순히 호출합니다.

Compose Multiplatform과 iOS UI 프레임워크의 연동에 대한 자세한 내용은 [SwiftUI 프레임워크와의 연동](compose-swiftui-integration.md) 및 [UIKit 프레임워크와의 연동](compose-uikit-integration.md)을 참조하세요.

## 데스크톱의 경우 {id="on-desktop"}

데스크톱에서 Compose Multiplatform은 JVM 앱으로 빌드됩니다.
공통 `App()` 컴포저블에 대한 호출은 `main()` 함수에서 이루어지며,
`application()`(또는 `singleWindowApplication()`) 호출로 래핑됩니다:

```kotlin
fun main() = application {
    Window(
        onCloseRequest = ::exitApplication,
        title = "ComposeDemo"
    ) {
        App()
    }
}
```

일반적으로 `application()` 함수 내에서 `Window`를 생성하고, 해당 속성을 지정하며,
`onCloseRequest` 콜백을 통해 창이 닫힐 때 발생하는 동작을 정의합니다.
기본 프로젝트에서는 전체 애플리케이션이 종료됩니다(`::exitApplication`).

Android 및 iOS와 마찬가지로, `App()` 컴포저블이 전체 UI 레이아웃을 담당합니다.

[데스크톱 전용 Compose Multiplatform 컴포넌트](compose-desktop-components.md) 및 [Swing 상호 운용성](compose-desktop-swing-interoperability.md)에 대해 자세히 알아보세요.

## 웹의 경우 {id="on-web"}

기본 프로젝트에서 코드가 `webApp` 모듈에 위치하는 웹 애플리케이션은
`main.kt` 파일의 `main()` 함수에서 공통 `App()` 컴포저블을 호출합니다:

```kotlin
// The web API is experimental and requires opt-in
@OptIn(ExperimentalComposeUiApi::class)
fun main() {
    // Sets up the Compose environment for the web app
    ComposeViewport {
        // Produces the UI layout
        App()
    }
}
```

웹 진입점에 대한 자세한 내용은 [뷰포트 설정](compose-css-styles.md)을 참조하세요.

## 도움 받기 {id="get-help"}

* **Kotlin Slack**: KMP 및 Compose Multiplatform에 대한 도움을 받고 토론에 참여하세요.
  [초대 요청](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)을 제출하고
[#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU)
  및 [#compose](https://kotlinlang.slack.com/archives/CJLTWPH7S) 채널에 참여할 수 있습니다.
* **Kotlin 이슈 트래커**: [새 이슈 보고하기](https://youtrack.jetbrains.com/newIssue?project=KT).