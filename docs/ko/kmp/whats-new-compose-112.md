[//]: # (title: Compose Multiplatform 1.12.2의 새로운 기능)

이번 기능 릴리스의 주요 변경 사항은 다음과 같습니다.

 * [웹용 자동 폰트 폴백(Fallback)](#automatic-font-fallback)
 * [Compose Hot Reload의 AI 에이전트를 위한 MCP 서버](#mcp-server-for-ai-agents-in-compose-hot-reload)
 * [데스크톱용 Window 및 Dialog API v2](#window-and-dialog-api-v2)

이번 릴리스의 전체 변경 사항 목록은 [GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.12.0)에서 확인할 수 있습니다.
특정 컴포넌트 버전에 대한 자세한 내용은 [종속성](#dependencies) 섹션을 참조하세요.

## 호환성을 깨뜨리는 변경 사항 및 지원 중단(Deprecations) {id="breaking-changes-and-deprecations"}

앱 테마 관리에 사용되던 `LocalSystemTheme` 프로퍼티가 지원 중단(deprecated)되었습니다. 
해당 프로퍼티는 `@InternalComposeUiApi` 어노테이션 아래에서 임시로 계속 사용할 수 있으며, 
향후 릴리스에서 대체될 예정입니다.

## 크로스 플랫폼 공통 {id="across-platforms"}

### Skia 버전 Milestone 150으로 업데이트 {id="skia-updated-to-milestone-150"}

Compose Multiplatform에서 Skiko를 통해 사용하는 Skia 버전이 Milestone 150으로 업데이트되었습니다.

Compose Multiplatform 1.11에서 사용되던 이전 버전은 Milestone 144였습니다. 
두 버전 간의 변경 사항은 [릴리스 노트](https://skia.googlesource.com/skia/+/refs/heads/chrome/m150/RELEASE_NOTES.md)에서 확인할 수 있습니다.

또한 이번 업데이트를 통해 자체 Skia 라이브러리를 이미 번들로 포함하고 있는 앱(예: Chromium 기반 앱)의 경우 iOS에서 발생하던 중복 심볼 충돌 문제도 해결되었습니다.

## iOS {id="ios"}

### Lazy layout 스크롤 성능 개선 {id="improved-lazy-layout-scrolling-performance"}

이제 iOS용 Compose Multiplatform에서 lazy layout의 스크롤 성능이 향상되었습니다. 
목록 항목의 비활성화(deactivation) 작업이 그리기(drawing) 단계 외부에서 실행되므로 그리기 단계가 더 빠르게 완료되며, 
이를 통해 더욱 부드러운 스크롤을 제공합니다.

## Web {id="web"}

### 자동 폰트 폴백(Font fallback) {id="automatic-font-fallback"}
<primary-label ref="Experimental"/>

이전에는 애플리케이션에 로드된 폰트가 지원하지 않는 문자가 대체 글리프(glyph)(일명 "두부(tofu)" 현상, □)로 표시되었습니다.

이제 Web용 Compose Multiplatform은 렌더링 중에 확인되지 않은 문자가 발견되면 필요한 Noto 폰트 서브셋을 
필요에 따라 자동으로 다운로드합니다. 
폰트가 다운로드되면 Compose는 영향을 받는 텍스트를 재구성(recompose)합니다. 
필요한 폰트를 가져오기 전까지 두부 현상이 잠시 나타날 수 있습니다.

## Desktop {id="desktop"}

### Compose Hot Reload의 AI 에이전트를 위한 MCP 서버 {id="mcp-server-for-ai-agents-in-compose-hot-reload"}
<primary-label ref="Experimental"/>

Compose Hot Reload에 AI 코딩 에이전트가 실행 중인 Compose 애플리케이션과 직접 상호 작용할 수 있도록 지원하는 실험적 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 서버가 포함되었습니다.

지금까지는 AI 에이전트가 Compose 코드를 편집했을 때 그 결과를 안정적으로 검증할 방법이 없었습니다. 에이전트가 핫 리로드의 성공 여부를 확인할 수 없었고, 렌더링된 UI를 볼 수도 없었으며, 런타임 로그나 예외를 읽을 수도 없었습니다. 이제 MCP 서버를 통해 에이전트는 사용자의 수동 개입 없이도 리로드를 트리거하고, 스크린샷을 캡처하고, 시맨틱 트리를 검사하고, 클릭 및 입력을 시뮬레이션하며, 애플리케이션 로그를 읽을 수 있습니다.

AI 에이전트가 사용할 수 있는 전체 MCP 도구 목록 및 연결 방법은 [AI 에이전트를 위한 MCP 서버](compose-hot-reload.md#mcp-server-for-ai-agents)를 참조하세요.

### Window 및 Dialog API v2 {id="window-and-dialog-api-v2"}
<primary-label ref="Experimental"/>

기존 API의 여러 한계를 해결한 데스크톱용 `WindowState` 및 `DialogState`의 새로운 실험적 v2 API가 도입되었습니다. 
v2 API는 `androidx.compose.ui.window.v2` 하위 패키지에서 사용할 수 있습니다.

v2 API를 사용하면 창(window)과 대화상자(dialog)의 배치 및 크기를 더욱 세밀하게 제어할 수 있습니다. 가능한 작업은 다음과 같습니다. 
* 창이 표시될 화면 선택
* 콘텐츠의 고유 크기(intrinsic size) 기반 로직을 포함한 커스텀 위치 지정 및 크기 조절 로직 제공
* 최소 및 최대 창 크기 설정
* 부모 창을 기준으로 대화상자 위치 지정

또한 v2 API는 창 상태 변경의 비동기적 특성을 명시적으로 나타내어, 요청된 상태와 실제 상태를 분리합니다.

예를 들어 화면 중앙에 고정된 크기로 창을 열려면 다음과 같이 작성합니다.

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

v2 API는 창 크기를 콘텐츠 크기에 맞추면서도 창이 더 커질 때 콘텐츠가 (`fillMaxSize()`와 같은 수정자(modifier)를 통해) 확장되도록 허용하는 등, 이전에는 불가능했던 시나리오도 지원합니다. 
자세한 내용은 [Window 및 Dialog API v2](compose-desktop-top-level-windows-management.md#window-and-dialog-api-v2) 문서 페이지를 참조하세요.

## 종속성 {id="dependencies"}

| 라이브러리 | Maven 좌표 | 기반 Jetpack 버전 |
|--------------------|------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| Runtime            | `org.jetbrains.compose.runtime:runtime*:1.12.2`                        | [Runtime 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.12.1)                     |
| UI                 | `org.jetbrains.compose.ui:ui*:1.12.2`                                  | [UI 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.12.1)                               |
| Foundation         | `org.jetbrains.compose.foundation:foundation*:1.12.2`                  | [Foundation 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.12.1)               |
| Material           | `org.jetbrains.compose.material:material*:1.12.2`                      | [Material 1.12.1](https://developer.android.com/jetpack/androidx/releases/compose-material#1.12.1)                   |
| Material3          | `org.jetbrains.compose.material3:material3*:1.12.0-alpha03`            | [Material3 1.5.0-alpha22](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.5.0-alpha22)   |
| Material3 Adaptive | `org.jetbrains.compose.material3.adaptive:adaptive*:1.3.0`             | [Material3 Adaptive 1.3.0](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.3.0) |
| Lifecycle          | `org.jetbrains.androidx.lifecycle:lifecycle-*:2.11.0`                  | [Lifecycle 2.11.0](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.11.0)                         |
| Navigation         | `org.jetbrains.androidx.navigation:navigation-*:2.10.0-rc01`           | [Navigation 2.10.0](https://developer.android.com/jetpack/androidx/releases/navigation#2.10.0)                       |
| Navigation3        | `org.jetbrains.androidx.navigation3:navigation3-*:1.2.0-rc01`          | [Navigation3 1.2.0](https://developer.android.com/jetpack/androidx/releases/navigation3#1.2.0)                       |
| Navigation Event   | `org.jetbrains.androidx.navigationevent:navigationevent-compose:1.1.0` | [Navigation Event 1.1.1](https://developer.android.com/jetpack/androidx/releases/navigationevent#1.1.1)              |
| Savedstate         | `org.jetbrains.androidx.savedstate:savedstate*:1.4.0`                  | [Savedstate 1.4.0](https://developer.android.com/jetpack/androidx/releases/savedstate#1.4.0)                         |
| WindowManager Core | `org.jetbrains.androidx.window:window-core:1.5.1`                      | [WindowManager 1.5.1](https://developer.android.com/jetpack/androidx/releases/window#1.5.1)                          |