---
title: DSL 레퍼런스
---

# DSL 레퍼런스

이 페이지는 모든 Koin DSL 키워드를 표로 정리하고, 임포트할 패키지와 이를 설명하는 페이지 링크를 제공합니다. 컴파일러 플러그인 DSL(Compiler Plugin DSL), 생성자 DSL(Constructor DSL, 생성자 참조), 클래식 DSL(Classic DSL, 람다)의 세 가지 DSL 형태를 다룹니다. 애너테이션에 대해서는 [애너테이션 레퍼런스](/docs/reference/koin-annotations/annotations-inventory)를 참조하세요.

## DSL 스타일 {id="dsl-styles"}

| 스타일 | 예제 | 임포트 |
|-------|---------|--------|
| 컴파일러 플러그인 DSL | `single<UserRepository>()` | `org.koin.plugin.module.dsl.*` |
| 생성자 DSL | `singleOf(::UserRepository)` | `org.koin.core.module.dsl.*` |
| 클래식 DSL | `single { UserRepository(get()) }` | `org.koin.dsl.*` |

컴파일러 플러그인 DSL을 사용하려면 [Koin 컴파일러 플러그인](/docs/setup/compiler-plugin)이 필요합니다. 이 플러그인은 생성자를 분석하고, `get()` 호출을 생성하며, 빌드 시점에 의존성 그래프를 검증합니다. 플러그인이 없으면 `single<T>()`와 같은 호출 시 런타임에 다음 오류가 발생합니다: `Error while using 'single<T>()'. The Koin Compiler plugin is missing. Please fix your setup to use 'io.insert-koin.compiler.plugin' Koin Gradle Plugin.`

생성자 참조 형태(`singleOf(::T)`) 또한 컴파일러 플러그인이 적용되면 검증을 거칩니다. 직접 작성한 람다는 검증되지 않습니다. 플러그인은 람다 본문이 수행하는 작업이 아니라 제공하는 타입만을 추적하기 때문입니다. 스타일을 선택하는 방법은 [스타일 선택하기](/docs/intro/choosing-your-style)를 참조하세요.

## Application DSL {id="application-dsl"}

Koin 컨테이너를 생성하고 시작하는 함수입니다. [Koin 시작하기](/docs/reference/koin-core/starting-koin)를 참조하세요.

| 함수 | 패키지 | 기능 설명 |
|----------|---------|--------------|
| `startKoin { }` | `org.koin.core.context` | `KoinApplication`을 생성하고 글로벌 컨텍스트에 등록합니다. 이미 시작된 경우 `KoinApplicationAlreadyStartedException`을 발생시킵니다 |
| `startKoin<T>()` | `org.koin.plugin.module.dsl` | 컴파일러 플러그인: `@KoinApplication` 클래스 `T`의 모듈로 Koin을 시작합니다 |
| `koinApplication { }` | `org.koin.dsl` | 글로벌에 등록되지 않는 독립형(standalone) `KoinApplication`을 생성합니다. [컨텍스트 격리(Context Isolation)](/docs/reference/koin-core/context-isolation)를 참조하세요 |
| `koinApplication<T>()` | `org.koin.plugin.module.dsl` | 컴파일러 플러그인: `T`의 모듈을 사용하는 독립형 애플리케이션입니다 |
| `koinConfiguration { }` | `org.koin.dsl` | Koin을 시작하지 않고 재사용 가능한 `KoinConfiguration`을 선언합니다 |
| `koinConfiguration<T>()` | `org.koin.plugin.module.dsl` | 컴파일러 플러그인: `T`의 모듈을 사용하는 설정입니다 |
| `stopKoin()` | `org.koin.core.context` | 글로벌 컨테이너와 모든 인스턴스를 닫습니다 |
| `loadKoinModules(module)` | `org.koin.core.context` | 시작된 글로벌 컨테이너에 모듈을 로드합니다 |
| `unloadKoinModules(module)` | `org.koin.core.context` | 모듈을 언로드하고 해당 인스턴스를 제거합니다 |

### `startKoin { }` 및 `koinApplication { }` 내부 {id="inside-startkoin-and-koinapplication"}

| 함수 | 기능 설명 |
|----------|--------------|
| `modules(...)` | 모듈을 로드합니다: 하나의 `Module`, 가변 인자(vararg) 또는 `List<Module>` |
| `modules(UserModule::class, ...)` | 컴파일러 플러그인: `@Module` 클래스로부터 생성된 모듈을 로드합니다 |
| `module<UserModule>()` | 컴파일러 플러그인: 하나의 `@Module` 클래스로부터 생성된 모듈을 로드합니다 |
| `withConfiguration<T>()` | 컴파일러 플러그인: `@KoinApplication` 클래스 `T`의 모듈을 기존 애플리케이션에 추가합니다 |
| `includes(configuration)` | 하나 이상의 `KoinConfiguration` 또는 `KoinAppDeclaration` 블록을 적용합니다 |
| `printLogger(level)` | 표준 출력으로 로그를 남깁니다. 기본 레벨은 `Level.INFO`입니다 |
| `logger(logger)` | 사용자 정의 `Logger` 구현체를 사용합니다. 기본값은 `EmptyLogger`(출력 없음)입니다 |
| `properties(map)` | `Map<String, Any>`로부터 프로퍼티를 로드합니다 |
| `fileProperties(fileName)` | JVM 전용. 파일로부터 프로퍼티를 로드합니다. 기본값은 `/koin.properties`입니다 |
| `environmentProperties()` | JVM 전용. 시스템 프로퍼티와 환경 변수를 로드합니다 |
| `allowOverride(Boolean)` | 정의 오버라이드(override)를 허용하거나 금지합니다. 기본값은 `true`입니다. [정의(Definitions)](/docs/reference/koin-core/definitions#overriding-a-definition)를 참조하세요 |
| `createEagerInstances()` | `createdAtStart` 정의들을 생성합니다. `startKoin` 및 `koinApplication`에서 이미 호출됩니다 |
| `options(...)` | `viewModelScopeFactory()`와 같은 Koin 옵션을 설정합니다. [ViewModel](/docs/reference/koin-core/viewmodel)을 참조하세요 |
| `lazyModules(...)` | 백그라운드에서 지연 로딩 모듈(lazy modules)을 로드합니다(`koin-core-coroutines`). [지연 모듈(Lazy Modules)](/docs/reference/koin-core/lazy-modules)을 참조하세요 |

`modules(A::class)`, `module<T>()`, `withConfiguration<T>()`는 `startKoin<T> { }` 내부가 아니라 일반 `startKoin { }` 또는 `koinApplication { }`에 작성합니다.

플랫폼 확장 기능은 이 블록에 추가 함수를 제공합니다:

| 함수 | 아티팩트 | 참고 |
|----------|----------|-----|
| `androidContext(context)`, `androidLogger(level)`, `androidFileProperties()` | `koin-android` | [Android 시작](/docs/reference/koin-android/start) |
| `fragmentFactory()` | `koin-android` | [Fragment Factory](/docs/reference/koin-android/fragment-factory) |
| `workManagerFactory()` | `koin-androidx-workmanager` | [WorkManager](/docs/reference/koin-android/workmanager) |
| `slf4jLogger(level)` | `koin-logger-slf4j` | [Ktor](/docs/reference/koin-ktor/ktor) |

## Module DSL {id="module-dsl"}

[모듈(Modules)](/docs/reference/koin-core/modules) 및 [지연 모듈(Lazy Modules)](/docs/reference/koin-core/lazy-modules)을 참조하세요.

| 함수 | 패키지 | 기능 설명 |
|----------|---------|--------------|
| `module { }` | `org.koin.dsl` | 모듈을 선언합니다 |
| `module(createdAtStart = true) { }` | `org.koin.dsl` | 모듈의 모든 `single`이 시작 시점에 생성됩니다 |
| `lazyModule { }` | `org.koin.dsl` | 나중에 백그라운드에서 로드되는 모듈을 선언합니다(`koin-core-coroutines`) |
| `includes(otherModule, ...)` | `org.koin.dsl` | 다른 모듈들을 가변 인자(vararg) 또는 `Collection<Module>` 형태로 포함합니다 |
| `moduleA + moduleB` | `org.koin.dsl` | `List<Module>`을 생성합니다 |

## 정의 (Definitions) {id="definitions"}

각 키워드가 무엇을 생성하는지는 [정의(Definitions)](/docs/reference/koin-core/definitions)에 설명되어 있습니다.

| 정의 | 컴파일러 플러그인 DSL | 생성자 DSL | 클래식 DSL |
|------------|---------------------|-----------------|-------------|
| Single | `single<T>()` | `singleOf(::T)` | `single { T(get()) }` |
| Factory | `factory<T>()` | `factoryOf(::T)` | `factory { T(get()) }` |
| Scoped (스코프 블록 내부) | `scoped<T>()` | `scopedOf(::T)` | `scoped { T(get()) }` |
| ViewModel | `viewModel<T>()` | `viewModelOf(::T)` | `viewModel { T(get()) }` |
| Worker (Android) | `worker<T>()` | `workerOf(::T)` | `worker { T(get(), get()) }` |
| Fragment (Android) | 지원되지 않음 | `fragmentOf(::T)` | `fragment { T(get()) }` |
| 함수 또는 빌더 | `single { create(::buildT) }` | `singleOf(::buildT)` | `single { buildT(get()) }` |

패키지:

| 키워드 | 컴파일러 플러그인 DSL | 생성자 / 클래식 DSL |
|----------|---------------------|---------------------------|
| `single`, `factory`, `scoped`, `create` | `org.koin.plugin.module.dsl` | `org.koin.dsl` (람다), `org.koin.core.module.dsl` (`singleOf`, `factoryOf`, `scopedOf`, `new`) |
| `viewModel`, `viewModelOf` (아티팩트: `koin-core-viewmodel`) | `org.koin.plugin.module.dsl` | `org.koin.core.module.dsl` |
| `worker`, `workerOf` (아티팩트: `koin-androidx-workmanager`) | `org.koin.plugin.module.dsl` | `org.koin.androidx.workmanager.dsl` |
| `fragment`, `fragmentOf` (아티팩트: `koin-android`) | | `org.koin.androidx.fragment.dsl` |

`org.koin.androidx.viewmodel.dsl` 및 `org.koin.compose.viewmodel.dsl`의 `viewModel`과 `viewModelOf`는 지원 중단(deprecated)되었습니다. `org.koin.core.module.dsl`에서 임포트하세요.

`create(::buildT)`는 람다 내의 유일한 명령문이어야 합니다. 그렇지 않으면 컴파일러 플러그인에서 `create(::buildT) must be the only instruction in the lambda.` 오류를 보고합니다. [정의(Definitions)](/docs/reference/koin-core/definitions#classes-you-dont-own)를 참조하세요.

### 람다 매개변수 {id="lambda-parameters"}

람다 정의는 다음과 같은 시그니처를 갖습니다:

| 키워드 | 매개변수 |
|---------|------------|
| `single(qualifier, createdAtStart) { }` | `qualifier: Qualifier? = null`, `createdAtStart: Boolean = false` |
| `factory(qualifier) { }` | `qualifier: Qualifier? = null` |
| `scoped(qualifier) { }` | `qualifier: Qualifier? = null` |
| `viewModel(qualifier) { }` | `qualifier: Qualifier? = null` |
| `worker(qualifier) { }` | `qualifier: Qualifier = named<T>()` |

### 정의 람다 내부 {id="inside-a-definition-lambda"}

이 람다는 `Scope` 수신 객체와 `ParametersHolder` 인수(`params`)를 사용하여 실행됩니다:

| 함수 | 반환값 | 참고 |
|----------|---------|-----|
| `get<T>()`, `get<T>(qualifier)` | 인스턴스. 누락된 경우 `NoDefinitionFoundException` 발생 | [주입(Injection)](/docs/reference/koin-core/injection) |
| `getOrNull<T>()` | 인스턴스 또는 `null` | [주입(Injection)](/docs/reference/koin-core/injection) |
| `inject<T>()` | `Lazy<T>` | [주입(Injection)](/docs/reference/koin-core/injection) |
| `getAll<T>()` | `T`에 바인딩된 모든 인스턴스 | [고급 패턴(Advanced Patterns)](/docs/reference/koin-core/advanced-patterns#collections-of-dependencies) |
| `getProperty(key)`, `getProperty(key, default)`, `getPropertyOrNull(key)` | Koin 프로퍼티 | [Koin 시작하기](/docs/reference/koin-core/starting-koin) |
| `params.get<T>()`, `(id) -> ...` 구조 분해 할당 | 주입된 매개변수 | [주입 매개변수(Injected Parameters)](/docs/reference/koin-core/injection-parameters) |
| `new(::T)` | 모든 생성자 매개변수가 `get()`을 통해 해결된 새로운 `T` | |
| `create(::T)` | 컴파일러 플러그인: 동일한 기능 및 빌드 타임 검증 제공 | [정의(Definitions)](/docs/reference/koin-core/definitions#classes-you-dont-own) |
| `getSource<T>()` | 스코프 소스(source) 객체 | [스코프(Scopes)](/docs/reference/koin-core/scopes) |
| `androidContext()`, `androidApplication()` | Android `Context` 또는 `Application` | [Android 시작](/docs/reference/koin-android/start) |

## 정의 옵션 {id="definition-options"}

옵션은 정의 뒤에 중위(infix) 연산자를 사용하거나 `withOptions { }` 블록 내에서 적용됩니다. 모든 정의 키워드에서 동작합니다.

| 옵션 | 형태 | 기능 설명 | 참고 |
|--------|------|--------------|-----|
| `bind` | `single<T>() bind I::class` | 보조(secondary) 타입을 추가합니다 | [정의(Definitions)](/docs/reference/koin-core/definitions#interface-binding) |
| `binds` | `single<T>() binds arrayOf(I::class, J::class)` | 여러 보조 타입을 추가합니다 | [정의(Definitions)](/docs/reference/koin-core/definitions#interface-binding) |
| `onClose` | `single<T>() onClose { it?.close() }` | 인스턴스가 해제될 때 실행되는 콜백 | [정의(Definitions)](/docs/reference/koin-core/definitions#release-callback) |
| `withOptions { }` | `single<T>() withOptions { ... }` | 아래의 옵션 블록을 엽니다 | |
| `.override()` | `single<T> { ... }.override()` | `allowOverride(false)`가 설정되어 있을 때 허용된 오버라이드로 표시합니다 | [정의(Definitions)](/docs/reference/koin-core/definitions#overriding-a-definition) |

`withOptions { }` 내부나 `singleOf(::T) { }`, `factoryOf`, `scopedOf`, `viewModelOf`의 후행 블록에서 사용 가능한 옵션:

| 옵션 | 기능 설명 |
|--------|--------------|
| `named("name")` | 문자열 한정자(qualifier). [한정자(Qualifiers)](/docs/reference/koin-core/qualifiers)를 참조하세요 |
| `named<Type>()` | 타입 한정자 |
| `bind<I>()` | 보조 타입을 추가합니다 |
| `binds(listOf(I::class, J::class))` | 여러 보조 타입을 추가합니다 |
| `createdAtStart()` | Koin이 시작될 때 `single`을 생성합니다 |
| `onClose { }` | 해제(release) 콜백 |

```kotlin
val appModule = module {
    single<UserRepositoryImpl>() withOptions {
        named("local")
        bind<UserRepository>()
        createdAtStart()
    }

    // Constructor DSL
    singleOf(::UserRepositoryImpl) {
        named("local")
        bind<UserRepository>()
    }
}
```

## Scope DSL {id="scope-dsl"}

스코프 블록은 스코프의 수명 주기 동안 유지되는 정의들을 그룹화합니다. [스코프(Scopes)](/docs/reference/koin-core/scopes)를 참조하세요.

| 함수 | 패키지 | 기능 설명 |
|----------|---------|--------------|
| `scope<T> { }` | `Module` 멤버 | 타입 `T`로 식별되는 스코프(일반적으로 스코프 소스의 타입) |
| `scope(named("session")) { }` | `Module` 멤버 | 한정자로 식별되는 스코프 |

스코프 블록 내부:

| 정의 | 컴파일러 플러그인 DSL | 생성자 DSL | 클래식 DSL |
|------------|---------------------|-----------------|-------------|
| Scoped | `scoped<T>()` | `scopedOf(::T)` | `scoped { T(get()) }` |
| Factory | `factory<T>()` | `factoryOf(::T)` | `factory { T(get()) }` |
| ViewModel | `viewModel<T>()` | `viewModelOf(::T)` | `viewModel { T(get()) }` |
| Worker (Android) | `worker<T>()` | `workerOf(::T)` | `worker { T(get(), get()) }` |

```kotlin
val sessionModule = module {
    scope<UserSession> {
        scoped<SessionCache>()
        factory<SessionPresenter>()
    }
}
```

### 스코프 아키타입 (Scope archetypes) {id="scope-archetypes"}

아키타입(archetype)은 단일 클래스가 아니라 특정 스코프 소스 유형을 위한 스코프 블록입니다. 해당 유형의 모든 소스는 해당 정의들을 공유합니다.

| 함수 | 아티팩트 | 스코프 대상 | 참고 |
|----------|----------|----------|-----|
| `viewModelScope { }` | `koin-core-viewmodel` | 각 ViewModel | [ViewModel](/docs/reference/koin-core/viewmodel) |
| `activityScope { }` | `koin-android` | 각 Activity | [Android 스코프](/docs/reference/koin-android/scope) |
| `activityRetainedScope { }` | `koin-android` | 구성 변경(configuration changes) 시에도 유지되는 각 Activity | [Android 스코프](/docs/reference/koin-android/scope) |
| `fragmentScope { }` | `koin-android` | 각 Fragment | [Android 스코프](/docs/reference/koin-android/scope) |
| `navigationScope { }` | `koin-compose-viewmodel-navigation` | 각 내비게이션 목적지(`NavBackStackEntry`) | [Compose 스코프](/docs/reference/koin-compose/compose-scopes) |
| `requestScope { }` | `koin-ktor` | 각 Ktor 호출(call) | [Ktor 스코프](/docs/reference/koin-ktor/ktor-scopes) |

## 관련 문서 {id="related"}

- [정의(Definitions)](/docs/reference/koin-core/definitions): 각 정의 타입이 수행하는 역할과 사용 시점.
- [모듈(Modules)](/docs/reference/koin-core/modules): 모듈 구성 및 조합.
- [스코프(Scopes)](/docs/reference/koin-core/scopes): 스코프 수명 주기, 연결 및 종료.
- [애너테이션 레퍼런스(Annotations Reference)](/docs/reference/koin-annotations/annotations-inventory): 이 페이지의 애너테이션 버전.
- [컴파일러 플러그인 설정(Compiler Plugin Setup)](/docs/setup/compiler-plugin): 컴파일러 플러그인 DSL에 필요한 플러그인 설치 방법.