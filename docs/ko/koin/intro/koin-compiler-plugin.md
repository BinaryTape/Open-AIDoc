---
title: Koin Compiler Plugin
---

# Koin Compiler Plugin

Koin Compiler Plugin은 Kotlin 컴파일러(K2) 내부에서 실행되는 Kotlin 컴파일러 플러그인입니다. 정의(definition)에 대한 생성자 연결(wiring) 코드를 생성하고, 빌드 시점에 의존성 그래프를 검증합니다. 이 플러그인은 Compiler Plugin DSL과 애너테이션 방식 모두를 지원합니다. 이 페이지에서는 플러그인의 역할과 동작 방식을 설명합니다. 설치 방법은 [Compiler Plugin Setup](/docs/setup/compiler-plugin)을, Constructor DSL 및 Classic DSL과의 비교는 [Choosing your style](/docs/intro/choosing-your-style)을 참조하세요.

## 코드가 어떻게 변환되는가 {id="what-it-does-to-your-code"}

개발자가 타입을 작성하면, 플러그인이 생성자 호출 코드를 작성합니다.

**Compiler Plugin DSL**
```kotlin
class UserRepository(private val api: ApiService, private val cache: UserCache)

val appModule = module {
    single<UserRepository>()
}
```

**애너테이션**
```kotlin
@Singleton
class UserRepository(private val api: ApiService, private val cache: UserCache)
```

**Constructor / Classic DSL**
Classic DSL은 플러그인이 필요하지 않으며, 직접 연결 코드를 작성합니다. Constructor DSL(`singleOf(::T)`) 역시 플러그인이 필요하지 않습니다.

```kotlin
val appModule = module {
    single { UserRepository(get(), get()) }
}
```

플러그인이 적용된 경우, 이러한 `get()` 호출과 `singleOf(::T)` 정의도 빌드 시점에 검증합니다.

컴파일 중에 플러그인은 `single<UserRepository>()`(또는 `@Singleton` 클래스)을 다음과 동등한 코드로 대체합니다.

```kotlin
single { UserRepository(get(), get()) }
```

생성된 코드는 Classic DSL이 사용하는 런타임 코드와 동일합니다. 런타임 동작에는 아무런 변화가 없습니다. 정의는 동일한 컨테이너에 등록되며, Koin은 동일한 방식으로 이를 해결(resolve)합니다. 각 매개변수 타입은 다음과 같이 처리됩니다. nullable 타입은 `getOrNull()`, `Lazy<T>`는 `inject()`, `List<T>`는 `getAll()`을 사용하며, 애너테이션이 추가된 매개변수(`@Named`, `@InjectedParam`, `@Property`)는 일치하는 호출을 사용합니다. 전체 목록은 [Definitions](/docs/reference/koin-core/definitions#constructor-parameters)에서 확인할 수 있습니다.

DSL 스타일에서는 모듈이 클래스가 등록되는 위치를 지정하고, 클래스 매개변수의 애너테이션이 해당 매개변수가 어떻게 해결되는지 지정합니다.

```kotlin
class UserPresenter(
    @InjectedParam val userId: String,
    @Named("remote") val api: ApiService,
    val repository: UserRepository,
)

val appModule = module {
    factory<UserPresenter>()
}
```

## 동작 방식 {id="how-it-works"}

플러그인은 Kotlin K2 컴파일러의 두 단계에 연결(hook)됩니다.

```text
Kotlin 소스 코드
     │
     ▼
  FIR (프론트엔드)  @Module, @ComponentScan, @Configuration을 찾고
                   생성된 모듈 프로퍼티 및 모듈 간 힌트를 선언
     │
     ▼
  IR (백엔드)      1. 애너테이션이 적용된 정의를 수집하고 모듈을 채움
                   2. DSL 호출 재작성: single<T>()가 single { T(get()) }로 변환됨
                   3. 진입점(startKoin, @KoinApplication)에서 전체 그래프를
                      조립하고 유효성을 검증
                   4. get(), inject(), koinViewModel() 호출 위치를 검증
     │
     ▼
  바이트코드 (JVM, Android, Native, JS, Wasm)
```

프로젝트 내에 소스 파일이 직접 생성되지는 않습니다. 여러 Gradle 모듈 전반을 확인하기 위해, 플러그인은 컴파일된 각 모듈에 작은 합성 마커 함수("힌트")를 추가합니다. 다운스트림 모듈은 이를 읽어 의존성에 선언된 정의를 찾습니다. 따라서 Koin 정의를 선언하는 모든 Gradle 모듈에 이 플러그인을 적용해야 합니다.

## 검증 대상 {id="what-it-validates"}

플러그인은 각 Koin 진입점(`startKoin`, `koinApplication`, `@KoinApplication`, `KoinApplication.withConfiguration<T>()`, Ktor의 `install(Koin) {}`)에서 그래프를 검증합니다. 각 정의에 대해 non-nullable 생성자 매개변수마다 올바른 한정자(qualifier)를 가지고 도달 가능한 스코프(scope) 내에 일치하는 정의가 있는지 확인합니다. 또한 모든 `get<T>()`, `inject<T>()`, `koinViewModel<T>()` 호출도 검사합니다.

누락된 의존성이 있으면 빌드가 실패합니다.

```text
[Koin][KOIN-D001] Missing dependency: ApiService
  required by: UserRepository (parameter 'api')
  in module: ...
```

전체 검사 목록, 오류 코드 및 예외 처리를 위한 `@Provided`는 [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety)에서 확인할 수 있습니다.

## 제한 사항 {id="limits"}

- **런타임 로드 모듈**: 나중에 `loadKoinModules()`로 추가된 모듈은 플러그인이 확인하는 그래프에 포함되지 않습니다. 이 모듈들이 제공하는 타입은 `@Provided`로 표시해야 합니다.
- **단독 라이브러리 모듈**: Koin 진입점이 없는 Gradle 모듈은 단독으로 검증되지 않습니다. 앱 모듈이 이를 조합할 때 검사됩니다.
- **증분 컴파일**: 다른 IR 컴파일러 플러그인과 마찬가지로, 일부 변경 사항(스캔 대상 패키지 간 클래스 이동, 한정자 변경 등)으로 인해 오래된 결과가 남을 수 있습니다. 클린 빌드를 수행하면 해결됩니다. 자세한 내용은 [Compiler Plugin Setup](/docs/setup/compiler-plugin)을 참조하세요.
- **Kotlin 버전**: 플러그인은 Kotlin 릴리스 간에 변경될 수 있는 컴파일러 API를 사용합니다. 각 플러그인 릴리스는 지원되는 Kotlin 버전 목록에서 검증되며, 그 외의 버전에서는 경고가 출력됩니다.

## 요구 사항 {id="requirements"}

- Kotlin 2.3.20 이상(K2 컴파일러). 플러그인 1.2.1은 Kotlin 2.3.20, 2.4.0, 2.4.10, 2.4.20에서 검증되었습니다.
- Koin 4.2.0 이상.
- Gradle 플러그인 `io.insert-koin.compiler.plugin`이 정의를 선언하는 모든 Gradle 모듈에 적용되어야 합니다.

Compiler Plugin DSL은 `koin-core`와 함께 제공되는 `org.koin.plugin.module.dsl` 패키지에 있습니다. Classic DSL은 `org.koin.dsl`에, Constructor DSL은 `org.koin.core.module.dsl`에 유지됩니다.

이 플러그인은 동일한 애너테이션을 사용하는 기존의 지원 중단된(deprecated) KSP 프로세서 `koin-ksp-compiler`를 대체합니다. [Migrating from KSP](/docs/migration/from-ksp-to-compiler-plugin)를 참조하세요. 소스 코드는 GitHub에서 확인할 수 있습니다: [InsertKoinIO/koin-compiler-plugin](https://github.com/InsertKoinIO/koin-compiler-plugin).

## 관련 문서 {id="related"}

- [Compiler Plugin Setup](/docs/setup/compiler-plugin): 플러그인 설치 및 구성 방법.
- [Choosing your style](/docs/intro/choosing-your-style): 애너테이션 또는 DSL(Compiler Plugin, Constructor, Classic DSL) 선택 가이드.
- [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety): 모든 검사 항목 및 오류 코드.
- [Compiler Plugin Options](/docs/reference/koin-annotations/options): 모든 Gradle 옵션.
- [Definitions](/docs/reference/koin-core/definitions): 생성자 매개변수가 해결되는 방식.