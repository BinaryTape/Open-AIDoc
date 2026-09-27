[//]: # (title: Compose Multiplatform 1.12.1의 새로운 기능)

이번 기능 릴리스의 주요 변경 사항은 다음과 같습니다.

 * [웹을 위한 자동 폰트 폴백(font fallback)](#automatic-font-fallback)
 * [Compose Hot Reload의 AI 에이전트를 위한 MCP 서버](#mcp-server-for-ai-agents-in-compose-hot-reload)
 * [데스크톱을 위한 Window 및 Dialog API v2](#window-and-dialog-api-v2)

이번 릴리스의 전체 변경 사항 목록은 [GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.12.0)에서 확인할 수 있습니다.
특정 컴포넌트 버전에 대한 자세한 내용은 [의존성](#dependencies) 섹션을 참고하세요.

## 호환성을 깨뜨리는 변경 사항 및 지원 중단(Breaking changes and deprecations) {id="breaking-changes-and-deprecations"}

앱 테마 관리에 사용되던 `LocalSystemTheme` 프로퍼티가 지원 중단(deprecated)되었습니다. 
이 프로퍼티는 `@InternalComposeUiApi` 애너테이션 아래에서 임시로 계속 사용할 수 있으며, 
향후 릴리스에서 대체될 예정입니다.

## 플랫폼 공통 {id="across-platforms"}

### Skia Milestone 150으로 업데이트 {id="skia-updated-to-milestone-150"}

Skiko를 통해 Compose Multiplatform에서 사용하는 Skia 버전이 Milestone 150으로 업데이트되었습니다.

Compose Multiplatform 1.11에서 사용된 이전 버전은 Milestone 144였습니다.
두 버전 사이의 변경 사항은 [릴리스 노트](https://skia.googlesource.com/skia/+/refs/heads/chrome/m150/RELEASE_NOTES.md)에서 확인할 수 있습니다.

또한 이번 업데이트는 (예를 들어 Chromium 기반 앱처럼) 이미 자체 Skia 라이브러리를 번들로 포함하고 있는 앱들이 iOS에서 겪던 중복 심볼(duplicate symbol) 충돌 문제도 해결합니다.

## iOS {id="ios"}

### 지연 레이아웃(lazy layout) 스크롤 성능 개선 {id="improved-lazy-layout-scrolling-performance"}

Compose Multiplatform for iOS에서 지연 레이아웃의 스크롤 성능이 개선되었습니다. 
리스트 아이템 비활성화(deactivation)가 드로잉 단계(drawing phase) 밖에서 실행되므로, 드로잉 단계가 더 빠르게 완료되어 더욱 부드러운 스크롤이 가능해집니다.

## 웹(Web) {id="web"}

### 자동 폰트 폴백(font fallback) {id="automatic-font-fallback"}
<primary-label ref="Experimental"/>

이전에는 애플리케이션에 로드된 폰트에 포함되지 않은 문자는 대체 글리프(□, 일명 "tofu")로 표시되었습니다.

Compose Multiplatform for Web은 이제 렌더링 중에 해결되지 않은 문자가 발견되면 필요한 Noto 폰트 서브셋을 필요에 따라 자동으로 다운로드합니다. 
폰트 다운로드가 완료되면 Compose는 해당 텍스트를 재구성(recompose)합니다. 
필요한 폰트를 가져오기 전까지는 일시적으로 tofu가 나타날 수 있습니다.

## 데스크톱(Desktop) {id="desktop"}

### Compose Hot Reload의 AI 에이전트를 위한 MCP 서버 {id="mcp-server-for-ai-agents-in-compose-hot-reload"}
<primary-label ref="Experimental"/>

Compose Hot Reload에 이제 AI 코딩 에이전트가 실행 중인 Compose 애플리케이션과 직접 상호작용할 수 있게 해주는 실험적인 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 서버가 포함됩니다.

지금까지는 AI 에이전트가 Compose 코드를 수정하더라도 결과를 확인할 신뢰할 수 있는 방법이 없었습니다. 에이전트는 핫 리로드(hot reload) 성공 여부를 확인하거나 렌더링된 UI를 볼 수 없었으며, 런타임 로그나 예외를 읽을 수도 없었습니다. MCP 서버를 통해 에이전트는 수동 개입 없이도 리로드를 트리거하고, 스크린샷을 찍고, 시맨틱 트리(semantic tree)를 조사하고, 클릭 및 입력을 시뮬레이션하고, 애플리케이션 로그를 읽을 수 있습니다.

AI 에이전트가 사용할 수 있는 MCP 도구의 전체 목록과 연결 방법은 [AI 에이전트를 위한 MCP 서버](compose-hot-reload.md#mcp-server-for-ai-agents)를 참고하세요.

### Window 및 Dialog API v2 {id="window-and-dialog-api-v2"}
<primary-label ref="Experimental"/>

기존 API의 여러 제약 사항을 해결하는 데스크톱용 `WindowState` 및 `DialogState`에 대한 새로운 실험적 v2 API를 도입했습니다.
v2 API는 `androidx.compose.ui.window.v2` 서브패키지에서 사용할 수 있습니다.

v2 API를 사용하면 창(window)과 다이얼로그의 배치 및 크기를 더욱 세밀하게 제어할 수 있습니다. 다음이 가능합니다:
* 창이 표시될 화면 선택
* 콘텐츠의 고유 크기(intrinsic size)에 기반한 로직을 포함하여, 커스텀 위치 및 크기 조정 로직 제공
* 창의 최소 및 최대 크기 설정
* 부모 창에 상대적인 다이얼로그 위치 지정

또한 v2 API는 창 상태 변경의 비동기적 특성(asynchronous nature)을 명시적으로 만들어, 요청된 상태(requested state)와 실제 상태(actual state)를 분리합니다.

예를 들어, 화면 중앙에 고정된 크기로 창을 열려면 다음과 같이 작성합니다:

```kotlin
import androidx.compose.material.Text
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.application
import androidx.compose.ui.window.v2.Window
import androidx.compose.ui.window.v2.WindowBoundsProvider
import androidx.compose.ui.window.v2.WindowPositionProvider
import androidx.compose.ui.window.v2.WindowSizeProvider
import androidx.compose.ui.window.v2.rememberWindowState

@OptIn(ExperimentalComposeUiApi::class)
fun main() = application {
    val windowState = rememberWindowState(
        initialBoundsProvider = WindowBoundsProvider(
            positionProvider = WindowPositionProvider.CenteredOnScreen,
            sizeProvider = WindowSizeProvider.Fixed(DpSize(400.dp, 200.dp))
        )
    )

    Window(
        onCloseRequest = ::exitApplication,
        state = windowState,
    ) {
        Text("Hello, World!", fontSize = 48.sp)
    }
}
```

v2 API는 이전에는 불가능했던 시나리오도 가능하게 합니다. 예를 들어, 창이 더 커질 때 콘텐츠가 확장되도록(`fillMaxSize()`와 같은 수정자 사용) 허용하면서도, 창의 크기를 콘텐츠 크기에 맞게 조정하는 것이 가능합니다.
자세한 내용은 [Window 및 Dialog API v2](compose-desktop-top-level-windows-management.md#window-and-dialog-api-v2) 문서 페이지를 참고하세요.

## 의존성 {id="dependencies"}

| 라이브러리 | Maven 좌표 | Jetpack 버전 기반 |
|--------------------|------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| Runtime            | `org.jetbrains.compose.runtime:runtime*:1.12.1`                        | [Runtime 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.12.1)                     |
| UI                 | `org.jetbrains.compose.ui:ui*:1.12.1`                                  | [UI 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.12.1)                               |
| Foundation         | `org.jetbrains.compose.foundation:foundation*:1.12.1`                  | [Foundation 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.12.1)               |
| Material           | `org.jetbrains.compose.material:material*:1.12.1`                      | [Material 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-material#1.12.1)                   |
| Material3          | `org.jetbrains.compose.material3:material3*:1.12.0-alpha03`            | [Material3 1.5.0-alpha22](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.5.0-alpha22)   |
| Material3 Adaptive | `org.jetbrains.compose.material3.adaptive:adaptive*:1.3.0-rc01`        | [Material3 Adaptive 1.3.0](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.3.0) |
| Lifecycle          | `org.jetbrains.androidx.lifecycle:lifecycle-*:2.11.0`                  | [Lifecycle 2.11.0](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.11.0)                         |
| Navigation         | `org.jetbrains.androidx.navigation:navigation-*:2.10.0-beta01`         | [Navigation 2.10.0](https://developer.android.com/jetpack/androidx/releases/navigation#2.10.0)                       |
| Navigation3        | `org.jetbrains.androidx.navigation3:navigation3-*:1.1.2`               | [Navigation3 1.1.7](https://developer.android.com/jetpack/androidx/releases/navigation3#1.1.7)                       |
| Navigation Event   | `org.jetbrains.androidx.navigationevent:navigationevent-compose:1.1.0` | [Navigation Event 1.1.1](https://developer.android.com/jetpack/androidx/releases/navigationevent#1.1.1)              |
| Savedstate         | `org.jetbrains.androidx.savedstate:savedstate*:1.4.0`                  | [Savedstate 1.4.0](https://developer.android.com/jetpack/androidx/releases/savedstate#1.4.0)                         |
| WindowManager Core | `org.jetbrains.androidx.window:window-core:1.5.1`                      | [WindowManager 1.5.1](https://developer.android.com/jetpack/androidx/releases/window#1.5.1)                          |