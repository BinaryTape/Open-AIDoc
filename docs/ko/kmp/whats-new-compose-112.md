[//]: # (title: Compose Multiplatform %org.jetbrains.compose-eap%의 새로운 기능)

이번 EAP 릴리스의 주요 변경 사항은 다음과 같습니다.

 * [웹을 위한 자동 폰트 폴백(font fallback)](#automatic-font-fallback)
 * [Compose Hot Reload의 AI 에이전트를 위한 MCP 서버](#mcp-server-for-ai-agents-in-compose-hot-reload)

이번 릴리스의 전체 변경 사항 목록은 [GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.12.0-beta01)에서 확인할 수 있습니다.
특정 컴포넌트 버전에 대한 자세한 내용은 [의존성](#dependencies) 섹션을 참고하세요.

## 플랫폼 공통

### Skia Milestone 150으로 업데이트

Skiko를 통해 Compose Multiplatform에서 사용하는 Skia 버전이 Milestone 150으로 업데이트되었습니다.

Compose Multiplatform 1.11에서 사용된 이전 버전은 Milestone 144였습니다.
두 버전 사이의 변경 사항은 [릴리스 노트](https://skia.googlesource.com/skia/+/refs/heads/chrome/m150/RELEASE_NOTES.md)에서 확인할 수 있습니다.

또한 이번 업데이트는 (예를 들어 Chromium 기반 앱처럼) 이미 자체 Skia 라이브러리를 번들로 포함하고 있는 앱들이 iOS에서 겪던 중복 심볼(duplicate symbol) 충돌 문제도 해결합니다.

## iOS

### 지연 레이아웃(lazy layout) 스크롤 성능 개선

Compose Multiplatform for iOS에서 지연 레이아웃의 스크롤 성능이 개선되었습니다. 
리스트 아이템 비활성화(deactivation)가 드로잉 단계 밖에서 실행되므로, 드로잉 단계가 더 빠르게 완료되어 더욱 부드러운 스크롤이 가능해집니다.

## 웹(Web)

### 자동 폰트 폴백(font fallback)
<primary-label ref="Experimental"/>

이전에는 애플리케이션에 로드된 폰트에 포함되지 않은 문자는 대체 글리프(□, 일명 "tofu")로 표시되었습니다.

Compose Multiplatform for Web은 이제 렌더링 중에 해결되지 않은 문자가 발견되면 필요한 Noto 폰트 서브셋을 필요에 따라 자동으로 다운로드합니다. 
폰트 다운로드가 완료되면 Compose는 해당 텍스트를 재구성(recompose)합니다. 
필요한 폰트를 가져오기 전까지는 일시적으로 tofu가 나타날 수 있습니다.

## 데스크톱(Desktop)

### Compose Hot Reload의 AI 에이전트를 위한 MCP 서버
<primary-label ref="Experimental"/>

Compose Hot Reload에 이제 AI 코딩 에이전트가 실행 중인 Compose 애플리케이션과 직접 상호작용할 수 있게 해주는 실험적인 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 서버가 포함됩니다.

지금까지는 AI 에이전트가 Compose 코드를 수정하더라도 결과를 확인할 신뢰할 수 있는 방법이 없었습니다. 에이전트는 핫 리로드(hot reload) 성공 여부를 확인하거나 렌더링된 UI를 볼 수 없었으며, 런타임 로그나 예외를 읽을 수도 없었습니다. MCP 서버를 통해 에이전트는 수동 개입 없이도 리로드를 트리거하고, 스크린샷을 찍고, 시맨틱 트리(semantic tree)를 조사하고, 클릭 및 입력을 시뮬레이션하고, 애플리케이션 로그를 읽을 수 있습니다.

AI 에이전트가 사용할 수 있는 MCP 도구의 전체 목록과 연결 방법은 [AI 에이전트를 위한 MCP 서버](compose-hot-reload.md#mcp-server-for-ai-agents)를 참고하세요.

## 의존성

| 라이브러리 | Maven 좌표 | Jetpack 버전 기반 |
|--------------------|------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| Runtime            | `org.jetbrains.compose.runtime:runtime*:1.12.0-beta03`                 | [Runtime 1.12.0-beta02](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.12.0-beta02)                     |
| UI                 | `org.jetbrains.compose.ui:ui*:1.12.0-beta03`                           | [UI 1.12.0-beta02](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.12.0-beta02)                               |
| Foundation         | `org.jetbrains.compose.foundation:foundation*:1.12.0-beta03`           | [Foundation 1.12.0-beta02](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.12.0-beta02)               |
| Material           | `org.jetbrains.compose.material:material*:1.12.0-beta03`               | [Material 1.12.0-beta02](https://developer.android.com/jetpack/androidx/releases/compose-material#1.12.0-beta02)                   |
| Material3          | `org.jetbrains.compose.material3:material3*:1.12.0-alpha03`            | [Material3 1.5.0-alpha22](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.5.0-alpha22)                 |
| Material3 Adaptive | `org.jetbrains.compose.material3.adaptive:adaptive*:1.3.0-beta02`      | [Material3 Adaptive 1.3.0-beta02](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.3.0-beta02) |
| Lifecycle          | `org.jetbrains.androidx.lifecycle:lifecycle-*:2.11.0`                  | [Lifecycle 2.11.0](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.11.0)                                       | 
| Navigation         | `org.jetbrains.androidx.navigation:navigation-*:2.10.0-alpha02`        | [Navigation 2.10.0-alpha05](https://developer.android.com/jetpack/androidx/releases/navigation#2.10.0-alpha05)                     |
| Navigation3        | `org.jetbrains.androidx.navigation3:navigation3-*:1.2.0-alpha02`       | [Navigation3 1.2.0-alpha04](https://developer.android.com/jetpack/androidx/releases/navigation3#1.2.0-alpha04)                     |
| Navigation Event   | `org.jetbrains.androidx.navigationevent:navigationevent-compose:1.1.0` | [Navigation Event 1.1.1](https://developer.android.com/jetpack/androidx/releases/navigationevent#1.1.1)                            |
| Savedstate         | `org.jetbrains.androidx.savedstate:savedstate*:1.4.0`                  | [Savedstate 1.4.0](https://developer.android.com/jetpack/androidx/releases/savedstate#1.4.0)                                       |
| WindowManager Core | `org.jetbrains.androidx.window:window-core:1.5.1`                      | [WindowManager 1.5.1](https://developer.android.com/jetpack/androidx/releases/window#1.5.1)                                        |