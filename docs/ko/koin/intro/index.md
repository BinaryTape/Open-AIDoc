---
title: 환영합니다
---

# 환영합니다

Koin은 Kotlin을 위한 의존성 주입(Dependency Injection) 프레임워크입니다. 모듈에 클래스가 빌드되는 방식을 선언하면 Koin이 런타임에 인스턴스를 생성하고 연결하며, 선택 사항인 Koin 컴파일러 플러그인(Koin Compiler Plugin)을 통해 빌드 시 전체 의존성 그래프를 검증할 수 있습니다. Koin은 Android, Compose, Kotlin Multiplatform, Ktor 및 모든 Kotlin/JVM 애플리케이션에서 실행됩니다.

이 페이지는 문서의 전체적인 로드맵입니다. 아래 각 섹션에서는 어떤 질문에 대한 답을 다루고 있는지, 그리고 어디서부터 시작해야 하는지 안내합니다.

```kotlin
class UserRepository(private val api: ApiService)

val appModule = module {
    single<ApiService>()
    single<UserRepository>()
}

fun main() {
    startKoin { modules(appModule) }
}
```

## 원하는 작업 바로가기 {id="i-want-to"}

- 의존성 주입 개념부터 이해하기: [의존성 주입이란?](/docs/intro/what-is-dependency-injection)
- 5분 만에 Koin 작동 방식 파악하기: [핵심 개념](/docs/intro/core-concepts)
- DSL과 애너테이션 중 선택하기: [스타일 선택하기](/docs/intro/choosing-your-style)
- Gradle 빌드에 Koin 추가하기: [Gradle 설정](/docs/setup/gradle)
- Composable에 ViewModel 주입하기: [Compose의 ViewModel](/docs/reference/koin-compose/compose-viewmodel)
- Activity, Fragment 또는 Service에 주입하기: [Android 진입점(Entry Points)](/docs/reference/koin-android/entry-points)
- Retrofit, Room, OkHttp 연결하기: [Android 라이브러리 연동](/docs/reference/koin-android/binding-patterns)
- Android와 iOS 간에 모듈 공유하기: [KMP 공유 패턴](/docs/reference/koin-core/kmp-shared-modules)
- ID와 같은 런타임 값을 정의(definition)에 전달하기: [주입 파라미터(Injected Parameters)](/docs/reference/koin-core/injection-parameters)
- Koin 구성 테스트하기: [Koin 구성 검증하기](/docs/reference/koin-test/verify) 및 [컴파일 타임 안전성](/docs/reference/koin-compiler/compile-safety)
- "No definition found" 오류 해결하기: [문제 해결(Troubleshooting)](/docs/reference/koin-core/troubleshooting)
- Hilt에서 마이그레이션하기: [Hilt에서 마이그레이션하기](/docs/reference/koin-android/hilt-migration)
- KSP 애너테이션을 컴파일러 플러그인으로 이전하기: [KSP에서 마이그레이션하기](/docs/migration/from-ksp-to-compiler-plugin)
- 프로덕션 환경에서 Koin 동작 확인하기: [프로덕션 모니터링](/docs/tooling/production-monitoring)

## 문서 둘러보기 {id="where-to-go"}

### 시작하기 {id="get-started"}

Koin이란 무엇이고, 어떻게 동작하며, 어떤 스타일을 사용해야 할까요?

- [Koin이란 무엇인가요?](/docs/intro/what-is-koin): Koin의 개념과 런타임 및 컴파일 타임 동작 방식.
- [핵심 개념](/docs/intro/core-concepts): 정의(definitions), 모듈(modules), 컨테이너(container), 주입(injection), 스코프(scopes).
- [스타일 선택하기](/docs/intro/choosing-your-style): 애너테이션 또는 DSL (컴파일러 플러그인, 생성자 DSL 또는 클래식 DSL).
- [Koin 컴파일러 플러그인](/docs/intro/koin-compiler-plugin): 빌드 타임에 플러그인이 수행하는 작업.

### 설정 {id="setup"}

빌드에 무엇을 추가해야 할까요?

- [설정](/docs/setup): 각 플랫폼별 설치 항목.
- [Gradle 설정](/docs/setup/gradle): BOM 및 모든 Koin 아티팩트.
- [컴파일러 플러그인 설정](/docs/setup/compiler-plugin): Gradle 플러그인 설치 및 구성.

### 튜토리얼 {id="tutorials"}

Koin을 사용해 첫 앱을 단계별로 빌드하는 방법은 무엇일까요?

- [Kotlin](/docs/quickstart/kotlin): 순수 Kotlin 애플리케이션.
- [Android - ViewModel](/docs/quickstart/android-viewmodel) 및 [Android - Jetpack Compose](/docs/quickstart/android-compose).
- [Compose Multiplatform](/docs/quickstart/cmp): Android 및 iOS 공유 UI.
- [Ktor](/docs/quickstart/ktor): 서버 애플리케이션.

### 핵심 개념 (Core) {id="core"}

모든 플랫폼에서 의존성을 어떻게 선언, 구성 및 검색할까요?

- [Koin 시작하기](/docs/reference/koin-core/starting-koin): `startKoin`, 로깅, 프로퍼티.
- [모듈](/docs/reference/koin-core/modules) 및 [정의](/docs/reference/koin-core/definitions): Koin이 빌드할 대상 선언.
- [스코프](/docs/reference/koin-core/scopes): 수명 주기(lifecycle)에 바인딩된 인스턴스.
- [문제 해결](/docs/reference/koin-core/troubleshooting): 오류 유형 및 해석 방법.

### 플랫폼 {id="platforms"}

특정 플랫폼이나 프레임워크에서 Koin을 어떻게 사용할까요?

- Android: [Android에서 Koin 시작하기](/docs/reference/koin-android/start), [Android ViewModel](/docs/reference/koin-android/viewmodel), [멀티 모듈 Android 앱](/docs/reference/koin-android/multi-module).
- Compose: [Compose용 Koin](/docs/reference/koin-compose/compose), [Compose의 ViewModel](/docs/reference/koin-compose/compose-viewmodel), [Navigation 3](/docs/reference/koin-compose/navigation3).
- Kotlin Multiplatform: [KMP 설정](/docs/reference/koin-core/kmp-setup), [공유 패턴](/docs/reference/koin-core/kmp-shared-modules).
- Ktor: [Ktor용 Koin](/docs/reference/koin-ktor/ktor), [요청 스코프(Request Scopes)](/docs/reference/koin-ktor/ktor-scopes).

### 테스트 {id="testing"}

Koin을 사용하는 코드를 테스트하고, 구성 자체를 테스트하려면 어떻게 해야 할까요?

- [테스트 환경에서의 주입](/docs/reference/koin-test/testing): `KoinTest`, 정의를 가짜 객체(fake)로 대체하기.
- [Koin 구성 검증하기](/docs/reference/koin-test/verify): 단위 테스트에서 모듈 검증.
- [Android 계측 테스트(Instrumented Testing)](/docs/reference/koin-android/instrumented-testing) 및 [Composable 테스트](/docs/reference/koin-compose/compose-testing).

### 프로덕션 및 도구 {id="production-tooling"}

Koin 앱을 작성, 검사, 실행하는 데 도움이 되는 도구는 무엇이 있을까요?

- [도구(Tooling)](/docs/tooling): Koin 관련 도구 개요.
- [IDE 플러그인](/docs/tooling/ide-plugin): Android Studio 및 IntelliJ IDEA에서의 탐색 및 검사 기능.
- [Monitor](/docs/tooling/monitor) 및 [프로덕션 모니터링](/docs/tooling/production-monitoring): Koin이 런타임에 수행하는 동작 확인.

### 마이그레이션 {id="migration"}

다른 프레임워크나 이전 Koin 설정을 사용 중인 경우 어떻게 이전해야 할까요?

- [Koin vs Hilt](/docs/intro/koin-vs-hilt): 두 프레임워크 비교.
- [Hilt에서 마이그레이션하기](/docs/reference/koin-android/hilt-migration): 단계별 가이드.
- [JSR-330 호환성](/docs/reference/koin-android/jsr330): `javax.inject`의 `@Inject` 및 `@Singleton` 유지하기.
- [KSP에서 마이그레이션하기](/docs/migration/from-ksp-to-compiler-plugin): 애너테이션을 컴파일러 플러그인으로 이전하기.

### 레퍼런스 {id="reference"}

모든 키워드, 애너테이션 및 옵션에는 무엇이 있을까요?

- [DSL 레퍼런스](/docs/reference/koin-core/dsl): 모든 DSL 키워드.
- [애너테이션 레퍼런스](/docs/reference/koin-annotations/annotations-inventory): 모든 애너테이션 및 파라미터.
- [컴파일러 플러그인 옵션](/docs/reference/koin-annotations/options): 플러그인의 모든 Gradle 옵션.

### 지원 {id="support"}

어떤 버전을 사용해야 하고, 무엇이 변경되었으며, 어디에서 도움을 받을 수 있을까요?

- [릴리스 노트](/docs/support/releases): 버전, 변경 사항 및 업그레이드 참고 사항.
- [API 안정성](/docs/support/api-stability): Stable, Experimental, Internal의 의미.
- [지원 안내](/docs/support): 로드맵, 커뮤니티 및 지원 옵션.

## 관련 문서 {id="related"}

- [Koin이란 무엇인가요?](/docs/intro/what-is-koin): Koin을 처음 접하는 분들이 다음에 읽어야 할 문서.
- [핵심 개념](/docs/intro/core-concepts): 다른 모든 문서의 바탕이 되는 멘탈 모델.
- [설정](/docs/setup): 사용 중인 플랫폼에 Koin 설치하기.