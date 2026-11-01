---
title: Koin이란 무엇인가요?
---

# Koin이란 무엇인가요?

Koin은 Kotlin을 위한 의존성 주입(Dependency Injection) 프레임워크입니다. 이 페이지에서는 Koin의 동작 방식, Koin이 제공하는 이점과 그에 따른 비용, 그리고 프로젝트의 구성 방식을 설명합니다. 의존성 주입이 처음이라면 [의존성 주입이란 무엇인가요?](/docs/intro/what-is-dependency-injection)를 먼저 읽어보세요.

## Koin 동작 방식 {id="how-koin-works"}

모듈에 클래스를 정의하고, Koin을 한 번 시작한 뒤 필요한 곳에서 인스턴스를 요청합니다.

```kotlin
class ApiService
class UserRepository(private val api: ApiService)

val appModule = module {
    single<ApiService>()
    single<UserRepository>()
}

fun main() {
    startKoin {
        modules(appModule)
    }
}
```

두 가지 부분이 함께 동작합니다.

- **런타임 컨테이너(Runtime container)**: `startKoin`은 모듈을 컨테이너에 로드합니다. 각 정의(definition)는 하나의 타입을 생성하는 Kotlin 함수입니다. 어딘가에서 `UserRepository`를 요청하면, Koin은 해당 함수를 실행하고 컨테이너로부터 생성자 매개변수를 확인(resolve)한 후, 정의 타입(`single`, `factory`, `scoped`)에 따라 인스턴스를 유지하거나 폐기합니다. Koin은 리플렉션(reflection)으로 객체를 생성하지 않습니다.
- **컴파일 타임 검증(선택 사항)**: [Koin Compiler Plugin](/docs/intro/koin-compiler-plugin)은 Kotlin 컴파일러 플러그인입니다. 생성자를 읽어 의존성 연결 코드를 생성한 다음, 빌드 타임에 구성된 그래프의 모든 의존성이 선언되어 있는지 검사합니다. 누락된 정의가 있으면 런타임 크래시 대신 빌드 에러가 발생합니다.

[핵심 개념(Core Concepts)](/docs/intro/core-concepts)에서는 모듈, 정의, 스코프 및 주입에 대해 하나의 실습 예제를 통해 설명합니다.

## 런타임 모델이 제공하는 이점과 비용 {id="what-the-runtime-model-costs-and-gives"}

의존성 그래프가 런타임 컨테이너에 존재하기 때문에, Koin은 앱이 실행되는 동안 그래프를 변경할 수 있습니다.

- **동적 모듈(Dynamic modules)**: 기능 플래그(feature flags)나 온디맨드 기능(on-demand features)을 위해 `loadKoinModules()` 및 `unloadKoinModules()`를 사용하여 시작 후 모듈을 로드 및 언로드할 수 있습니다. [Koin 시작하기](/docs/reference/koin-core/starting-koin)를 참고하세요.
- **지연 모듈(Lazy modules)**: 시작 시 작업을 줄이기 위해 그래프의 일부를 백그라운드에서 로드합니다. [지연 모듈](/docs/reference/koin-core/lazy-modules)을 참고하세요.
- **런타임에 생성되는 스코프**: 세션, 화면 또는 요청에 맞춰 스코프를 열고 닫을 수 있습니다. [스코프](/docs/reference/koin-core/scopes)를 참고하세요.
- **생성되는 소스 코드가 없음**: 소스 관리 도구에 커밋할 코드도 없고, Kotlin Multiplatform 타깃별로 설정할 것도 없습니다.

동일한 모델에서 고려해야 할 비용(단점)도 있습니다.

- **시작 시 작업 비용**: Koin이 시작될 때 모듈이 등록되며, 모든 조회(lookup)는 컨테이너를 거칩니다. 대부분의 앱에서는 이 작업이 사소하지만, 즉시 생성 정의(`createdAtStart`)는 Koin을 시작하는 스레드에서 실행됩니다.
- **플러그인 미사용 시 런타임 에러 발생 가능성**: 플러그인 없이 Constructor DSL이나 Classic DSL을 사용하는 경우, 누락된 정의는 코드가 실행될 때만 발견됩니다. 이는 [`verify()`](/docs/reference/koin-test/verify)를 사용한 단위 테스트나 컴파일러 플러그인을 통한 빌드 타임 검사로 방지할 수 있습니다.
- **컴파일 타임 검증의 한계**: 플러그인은 `startKoin`과 같은 Koin 진입점에서 조립된 그래프를 검증합니다. 나중에 `loadKoinModules()`로 로드되는 모듈은 빌드 타임에 검증할 수 없으며, 진입점이 없는 라이브러리 모듈은 앱이 이를 조립할 때만 검증됩니다. [컴파일 타임 안정성](/docs/reference/koin-compiler/compile-safety)을 참고하세요.
- **Kotlin 버전 결합도**: 컴파일러 플러그인은 컴파일러 내부에 의존하므로, 각 플러그인 릴리스는 지원되는 Kotlin 버전 목록에 대해 검증됩니다. [컴파일러 플러그인 설정](/docs/setup/compiler-plugin)을 참고하세요.

## 생성자 주입과 서비스 로케이터 {id="constructor-injection-and-service-locator"}

클래스는 생성자를 통해 의존성을 전달받습니다. Koin은 객체를 직접 생성할 수 없는 진입점에서만 인스턴스를 가져옵니다.

```kotlin
// Koin이 생성하는 객체: 의존성은 생성자를 통해 전달됩니다.
class UserRepository(private val api: UserApi)
class UserViewModel(private val repository: UserRepository) : ViewModel()

// Android가 Activity를 생성함: Koin으로부터 ViewModel을 가져옵니다.
class UserActivity : AppCompatActivity() {
    private val viewModel: UserViewModel by viewModel()
}
```

의존성이 시그니처에 명확히 드러나므로 Koin 없이도 `UserRepository`와 `UserViewModel`을 테스트할 수 있습니다. `by inject()`, `by viewModel()`, `koinInject()`와 같은 인스턴스 조회 함수는 진입점(`Activity`, `Fragment`, 루트 Composable, `main()`, Ktor 라우트, 테스트 등)에서만 사용됩니다. [의존성 주입이란 무엇인가요?](/docs/intro/what-is-dependency-injection)에서 두 패턴을 비교하며, [의존성 가져오기](/docs/reference/koin-core/injection)에서 `get()`과 `inject()`를 다룹니다.

## 두 가지 스타일, 하나의 컨테이너 {id="two-styles-one-container"}

| 스타일 | 예시 | 요구 사항 |
|---|---|---|
| 컴파일러 플러그인 DSL | `single<UserRepository>()` | Koin Compiler Plugin |
| 어노테이션 | `@Singleton class UserRepository(...)` | Koin Compiler Plugin, `koin-annotations` |
| Constructor DSL | `singleOf(::UserRepository)` | 추가 요구 사항 없음 (플러그인 사용 시 컴파일 타임 검사 추가) |
| Classic DSL | `single { UserRepository(get()) }` | 추가 요구 사항 없음 (플러그인 사용 시 컴파일 타임 검사 추가) |

어노테이션은 한 가지 스타일이며, 컴파일러 플러그인 DSL, Constructor DSL, Classic DSL은 또 다른 방식인 Koin DSL의 세 가지 형태입니다. 모든 스타일은 동일한 컨테이너에서 동일한 정의를 생성합니다. 프로젝트당 하나의 스타일을 선택해 사용하세요. [스타일 선택하기](/docs/intro/choosing-your-style)에서 각 스타일을 비교하고 기본 권장 사항을 제시합니다.

## 어노테이션 지원 현황 {id="annotations-status"}

`koin-annotations` 라이브러리(`@Singleton`, `@Factory`, `@KoinViewModel`, `@Module`, `@ComponentScan`)는 메인 Koin 프로젝트의 일부로, 동일한 저장소, 동일한 버전, 동일한 BOM을 사용합니다. 이는 지원 중단(deprecated)되지 않았습니다. 지원 중단된 것은 이러한 어노테이션을 읽는 데 사용되었던 KSP 프로세서인 `koin-ksp-compiler`입니다. Koin Compiler Plugin이 동일한 어노테이션을 지원하며 이를 대체합니다. [KSP에서 컴파일러 플러그인으로 마이그레이션하기](/docs/migration/from-ksp-to-compiler-plugin)를 참고하세요.

## 플랫폼 {id="platforms"}

Koin은 Kotlin Multiplatform 라이브러리입니다. 코어 모듈은 모든 Kotlin 타깃에서 실행되며, 연동 라이브러리를 통해 플랫폼별 API를 추가로 제공합니다.

| 플랫폼 | 주요 아티팩트 | 시작하기 |
|---|---|---|
| Kotlin/JVM | `koin-core` | [Kotlin 튜토리얼](/docs/quickstart/kotlin) |
| Android | `koin-android` | [Android에서 Koin 시작하기](/docs/reference/koin-android/start) |
| Jetpack Compose, Compose Multiplatform | `koin-compose`, `koin-compose-viewmodel` | [Compose용 Koin](/docs/reference/koin-compose/compose) |
| Kotlin Multiplatform (iOS, 데스크톱, 웹, 네이티브) | `koin-core` | [Kotlin Multiplatform 설정](/docs/reference/koin-core/kmp-setup) |
| Ktor 서버 | `koin-ktor` | [Ktor용 Koin](/docs/reference/koin-ktor/ktor) |

전체 아티팩트 목록은 [Gradle 설정](/docs/setup/gradle)에서 확인할 수 있습니다.

## Koin 프로젝트 {id="the-koin-project"}

Koin은 Apache 2.0 라이선스 기반의 오픈 소스입니다. 다음과 같이 구성되어 있습니다.

- **Koin 라이브러리**: core, Android, Compose, Ktor, test, annotations 등 단일 버전으로 함께 릴리스됩니다. 소스 코드: [InsertKoinIO/koin](https://github.com/InsertKoinIO/koin).
- **Koin Compiler Plugin**: Kotlin 컴파일러 플러그인 및 Gradle 플러그인으로, 독자적인 버전을 갖습니다. 소스 코드: [InsertKoinIO/koin-compiler-plugin](https://github.com/InsertKoinIO/koin-compiler-plugin).
- **Koin IDE Plugin**: Android Studio 및 IntelliJ IDEA에서의 코드 탐색 및 검사 기능. [IDE 플러그인](/docs/tooling/ide-plugin)을 참고하세요.
- **샘플**: [InsertKoinIO/koin-getting-started](https://github.com/InsertKoinIO/koin-getting-started)의 각 튜토리얼별 실행 가능한 앱.

Hilt나 Dagger에 익숙하다면 [Koin vs Hilt](/docs/intro/koin-vs-hilt)에서 두 접근 방식의 차이점을 비교해 보세요.

## 관련 문서 {id="related"}

- [핵심 개념](/docs/intro/core-concepts): 단계별 예제를 통해 살펴보는 개념적 모델.
- [스타일 선택하기](/docs/intro/choosing-your-style): 어떤 선언 스타일을 사용할 것인가.
- [Koin Compiler Plugin](/docs/intro/koin-compiler-plugin): 빌드 타임에 일어나는 작업.
- [설정](/docs/setup): 프로젝트에 Koin 추가하기.
- [튜토리얼](/docs/quickstart/kotlin): 첫 번째 앱 만들기.