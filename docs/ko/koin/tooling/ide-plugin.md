---
title: IDE 플러그인
---

# IDE 플러그인

Android Studio 및 IntelliJ IDEA용 Koin 플러그인은 IDE 내에서 Koin 설정을 시각화하여 각 정의가 어디에 선언되어 있고, 어디에서 사용되며, 무엇이 누락되었는지를 보여줍니다. Kotzilla에서 제작하였으며 JetBrains Marketplace에서 무료로 제공됩니다. 아래에 설명된 애플리케이션 이슈 기능을 제외하면 Kotzilla 플랫폼이 없어도 사용할 수 있습니다.

## 설치 {id="installation"}

[JetBrains Marketplace](https://plugins.jetbrains.com/plugin/26131-koin-dependency-injection-official-)에서 직접 플러그인을 설치하거나, IDE 내에서 Settings(설정) > Plugins(플러그인) > Marketplace로 이동하여 "Koin"을 검색한 후 IDE를 재시작하여 설치할 수 있습니다.

이 플러그인은 IntelliJ Platform 2024.2 이상 기반의 IDE가 필요합니다. Android, JVM 및 Kotlin Multiplatform 프로젝트를 지원합니다.

## 설정 트리 뷰 {id="configuration-tree-view"}

플러그인을 설치하면 Koin 설정에 대한 트리 뷰가 추가됩니다.

- **모듈(Modules)**: 테스트 모듈, `startKoin` 또는 `koinApplication` 내에 인라인으로 선언된 모듈, 시작 엔트리를 포함하여 선언된 모든 모듈.
- **정의(Definitions)**: 각 모듈의 싱글톤, 팩토리, ViewModel, 스코프 정의(scoped definition) 및 주입된 파라미터.

텍스트를 입력하여 트리를 검색할 수 있으며, 항목을 선택하면 에디터에서 해당 위치가 열립니다.

트리 뷰는 한정자(qualifier)와 제네릭 타입을 포함하여 생성자(Constructor) 및 클래식 DSL(`singleOf(::T)`, `single { }`), Ktor DSL, Compose API, Koin Annotations를 분석합니다.

## 탐색 {id="navigation"}

거터(gutter) 아이콘을 통해 정의, 주입 지점, 파라미터를 표시합니다. 거터 아이콘을 통해 다음 작업을 수행할 수 있습니다.

- 주입 지점(`get()`, `by inject()`, `koinViewModel()`, 생성자 파라미터)에서 이를 제공하는 정의로 이동
- 정의에서 해당 정의를 사용하는 위치로 이동
- 설정 트리에서 해당 정의 열기

플러그인은 정의의 인자 타입을 분석하여 주입된 파라미터를 포함해 어떤 의존성을 필요로 하는지 찾아냅니다. 플러그인 설정에서 표시할 거터 아이콘을 변경할 수 있습니다.

## 설정 검사 {id="configuration-checks"}

플러그인은 편집 중인 설정을 실시간으로 검사하고 Koin Insights 뷰의 "Configuration issues" 탭에 문제를 보고합니다. 정의가 없는 의존성, 선언되지 않은 타입의 사용, 아무도 사용하지 않는 정의, 기타 잘못된 설정 등이 여기에 포함됩니다.

각 검사(inspection) 항목은 IDE 설정에서 켜거나 끌 수 있습니다.

:::note
이러한 검사는 에디터 내에서 실행됩니다. 이는 빠른 피드백을 제공하기 위한 루프이며, 빌드 시점의 유효성 검사를 완전히 대체하는 것은 아닙니다. [Koin 컴파일러 플러그인](/docs/intro/koin-compiler-plugin)을 사용하면 빌드 시점에 동일한 종류의 오류를 감지하여 빌드를 실패 처리할 수 있습니다. 자세한 내용은 [컴파일 타임 안전성](/docs/reference/koin-compiler/compile-safety)을 참조하세요.
:::

## 애플리케이션 이슈 {id="application-issues"}

앱이 Kotzilla SDK를 통해 Kotzilla 플랫폼으로 데이터를 전송하는 경우, "Application issues" 탭에서 실제 사용자 세션에서 감지된 문제(느린 시작, 메인 스레드 블로킹, 백그라운드 병목 현상, 비정상 종료)를 코드 바로 옆에 표시해 줍니다. "Kotzilla Flight Check" 탭에는 Koin 버전과 SDK 설정 여부가 표시됩니다.

이 기능을 사용하려면 Kotzilla 계정과 SDK가 필요합니다. 자세한 내용은 [프로덕션 모니터링](/docs/tooling/production-monitoring)을 참조하세요.

감지된 이슈에 대해 플러그인은 해당 컨텍스트(영향을 받는 컴포넌트, 의존성 체인, 성능 데이터)를 포함한 프롬프트를 생성할 수 있으며, 이를 GitHub Copilot, Gemini, Claude Code, Junie와 같은 AI 코딩 어시스턴트에 붙여넣어 활용할 수 있습니다.

## 제한 사항 {id="limits"}

- **활발히 개발 진행 중**: 릴리스마다 기능이 변경될 수 있습니다. 현재 버전 및 변경 로그는 Marketplace 페이지를 확인하세요.
- **에디터 전용**: 이 플러그인은 CI 환경에서 실행되지 않습니다. 머지(merge)를 차단하는 검사가 필요한 경우 [컴파일 타임 안전성](/docs/reference/koin-compiler/compile-safety) 또는 [모듈 검증](/docs/reference/koin-test/verify)을 사용하세요.

플러그인 자체에 대한 공식 문서는 [doc.kotzilla.io](https://doc.kotzilla.io/docs/discover/idePlugin)에서 확인할 수 있습니다.

## 관련 문서 {id="related"}

- [프로덕션 및 툴링](/docs/tooling): 요구 사항에 따른 도구 선택 가이드.
- [컴파일 타임 안전성](/docs/reference/koin-compiler/compile-safety): 빌드 시점에 동일한 오류를 잡아내는 방법.
- [모듈 검증](/docs/reference/koin-test/verify): 테스트를 통한 설정 검사.
- [문제 해결](/docs/reference/koin-core/troubleshooting): Koin 오류 확인 및 해결.
- [프로덕션 모니터링](/docs/tooling/production-monitoring): 애플리케이션 이슈 탭을 뒷받침하는 데이터.