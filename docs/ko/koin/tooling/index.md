---
title: 프로덕션 및 툴링
---

# 프로덕션 및 툴링

이 페이지에서는 Koin 프로젝트의 각 단계와 이를 지원하는 도구를 매핑하여 안내합니다. Koin 자체는 빌드 타임, 개발 및 테스트 단계를 다룹니다. 프로덕션 환경의 경우, Koin을 개발하는 회사인 Kotzilla에서 모니터링 플랫폼(선택 사항)을 제공합니다.

Koin에 기본 포함된 도구를 제외하면, 이 페이지에 소개된 다른 도구 없이도 Koin의 모든 기능이 정상적으로 동작합니다. 필요에 맞는 도구를 선택해 사용하세요.

## 필요에 맞는 도구 선택 {id="which-tool-for-which-need"}

| 단계 | 용도 | 도구 | Koin 기본 제공 |
|-------|------|------|-----------------|
| 빌드 타임 | 누락된 의존성이나 잘못된 한정자(qualifier)가 있을 때 빌드 실패 처리 | Koin 컴파일러 플러그인을 활용한 [컴파일 타임 안전성(Compile-Time Safety)](/docs/reference/koin-compiler/compile-safety) | 예 |
| 개발 | Koin이 생성하고 해결(resolve)하는 대상 확인 | `printLogger()` 또는 플랫폼 로거를 통한 [로깅(Logging)](/docs/reference/koin-core/starting-koin#logging) | 예 |
| 개발 | 정의와 주입 지점 간 탐색, 에디터 내 문제 확인 | Android Studio 및 IntelliJ IDEA용 [IDE 플러그인](/docs/tooling/ide-plugin) | 아니요, Kotzilla에서 제공하는 무료 플러그인 |
| 개발 | AI 코딩 에이전트가 Koin 코드를 설정, 작성, 마이그레이션 및 진단하도록 지원 | Claude Code, Cursor, Codex, Copilot용 [Koin Skills](/docs/tooling/ai-agents) | 아니요, Koin 팀에서 제공하는 무료 스킬 |
| 테스트 | 앱을 실행하지 않고 모듈 구성 확인 | `verify()`를 통한 [모듈 검증(Verifying Modules)](/docs/reference/koin-test/verify) | 예 |
| 테스트 | 정의(definition)를 페이크(fake)나 목(mock)으로 대체 | `KoinTest`를 활용한 [테스트(Testing)](/docs/reference/koin-test/testing) | 예 |
| 프로덕션 | 선택한 함수의 실행 시간 추적 | Kotzilla SDK와 연동되는 [@Monitor](/docs/tooling/monitor) | 어노테이션은 기본 제공, 트레이싱에는 SDK 필요 |
| 프로덕션 | 실제 사용자 세션에서 시작 시간, 메인 스레드 및 백그라운드 성능 문제, 비정상 종료(크래시) 확인 | Kotzilla 플랫폼을 활용한 [프로덕션 모니터링(Production Monitoring)](/docs/tooling/production-monitoring) | 아니요, Kotzilla 서비스 |

## 빌드 타임 {id="build-time"}

Koin 컴파일러 플러그인은 컴파일 중에 의존성 그래프를 검사합니다. 누락된 정의나 누락된 한정자(qualifier), 알 수 없는 스코프가 있으면 런타임에 크래시를 일으키는 대신 `KOIN-Dxxx` 진단과 함께 빌드를 실패 처리합니다. 이는 오류를 막는 첫 번째 방어선입니다. 검증되는 항목과 설정 방법은 [컴파일 타임 안전성(Compile-Time Safety)](/docs/reference/koin-compiler/compile-safety)을 참조하세요.

## 개발 {id="development"}

Koin 로거는 모듈 로딩 및 인스턴스 생성을 출력합니다. `printLogger(Level.DEBUG)` 또는 플랫폼 로거(`androidLogger()`, SLF4J)로 활성화할 수 있습니다. 콘솔이나 Logcat에 텍스트 형태로 직접 출력되므로, 이는 모니터링 도구가 아닌 디버깅 보조 도구입니다. 자세한 내용은 [로깅(Logging)](/docs/reference/koin-core/starting-koin#logging)을 참조하세요.

[IDE 플러그인](/docs/tooling/ide-plugin)은 에디터 내에서 탐색 기능, 모듈 및 정의의 트리 뷰, 구성 검사 기능을 제공합니다.

[Koin skills](/docs/tooling/ai-agents)를 사용하면 AI 코딩 에이전트에 설정, 정의, 다른 DI 프레임워크로부터의 마이그레이션, Koin 오류 진단과 같은 Koin 규칙을 학습시킬 수 있습니다.

## 테스트 {id="tests"}

`verify()`는 순수 JUnit 테스트를 통해 모듈의 모든 정의를 빌드할 수 있는지 검사합니다. 컴파일러 플러그인을 사용하는 경우, 컴파일 타임 안전성이 이미 `verify()`가 확인하는 대부분의 항목을 검사합니다. 자세한 내용은 [모듈 검증(Verifying Modules)](/docs/reference/koin-test/verify) 및 [테스트(Testing)](/docs/reference/koin-test/testing)를 참조하세요.

## 프로덕션 {id="production"}

컴파일 타임 안전성과 테스트는 구성 오류를 잡아냅니다. 하지만 시작 시 의존성 해결에 걸리는 시간, 메인 스레드를 차단하는 의존성, Koin 해결 과정에서 발생하는 크래시 등 실제 기기에서 그래프가 어떻게 동작하는지까지는 알려주지 못합니다.

Koin 자체에는 프로덕션 모니터링 기능이 포함되어 있지 않습니다. Koin 컨테이너와 연동되는 Kotzilla SDK를 통해 Kotzilla 플랫폼이 이러한 요구사항을 지원합니다. 자세한 내용은 [프로덕션 모니터링(Production Monitoring)](/docs/tooling/production-monitoring)을 참조하세요. [@Monitor](/docs/tooling/monitor) 어노테이션을 사용해 직접 작성한 함수까지 모니터링 대상을 확장할 수도 있습니다.

## 관련 문서 {id="related"}

- [컴파일 타임 안전성(Compile-Time Safety)](/docs/reference/koin-compiler/compile-safety): 컴파일러 플러그인이 빌드 타임에 검사하는 항목
- [Koin 시작하기(Starting Koin)](/docs/reference/koin-core/starting-koin#logging): Koin 로거 활성화 및 구성
- [모듈 검증(Verifying Modules)](/docs/reference/koin-test/verify): 테스트에서 구성 검사
- [IDE 플러그인](/docs/tooling/ide-plugin): Android Studio 및 IntelliJ IDEA에서의 탐색 및 검사
- [프로덕션 모니터링(Production Monitoring)](/docs/tooling/production-monitoring): Koin 앱을 위한 Kotzilla 플랫폼