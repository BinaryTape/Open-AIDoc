---
title: 문제 해결
---

# 문제 해결

이 페이지에서는 Koin이 보고하는 에러 목록과 발생 원인, 해결 방법을 다룹니다. 또한 문제가 사용자에게 도달하기 전에 미리 발견할 수 있는 도구와 이러한 에러를 유발하는 일반적인 패턴도 함께 살펴봅니다. 에러 메시지는 Koin이 출력하는 그대로 인용되어 있으므로, 스택 트레이스에 표시된 텍스트로 이 페이지를 검색할 수 있습니다.

## 문제 조기 발견 {id="find-problems-early"}

Koin은 구성 에러를 확인할 수 있는 세 가지 방법을 가장 빠른 시점부터 순서대로 제공합니다.

- **컴파일 타임**: [Koin 컴파일러 플러그인(Koin Compiler Plugin)](/docs/intro/koin-compiler-plugin)을 사용하면 누락된 의존성이나 순환 의존성이 있을 때 빌드가 실패합니다. 에러 메시지에는 정의(Definition), 파라미터 및 모듈명이 명시됩니다. 모든 검사항목과 에러 코드는 [컴파일 타임 안정성(Compile-Time Safety)](/docs/reference/koin-compiler/compile-safety)을 참조하세요.
- **IDE 내부**: [Koin IDE 플러그인](/docs/tooling/ide-plugin)은 코드를 작성하는 동안 각 정의가 선언된 위치, 사용된 위치 및 누락된 항목을 표시해 줍니다.
- **테스트 환경**: 컴파일러 플러그인이 없는 경우, JVM 단위 테스트에서 모듈에 대해 `verify()`를 호출하세요. 각 생성자 파라미터에 대응하는 정의가 존재하는지 확인합니다. 자세한 내용은 [구성 검증하기(Verify your configuration)](/docs/reference/koin-test/verify)를 참조하세요.

```kotlin
class ModuleCheckTest {

    @Test
    fun checkKoinModules() {
        appModule.verify()
    }
}
```

## 로깅 {id="logging"}

Koin은 기본적으로 아무것도 로깅하지 않습니다(`EmptyLogger`). 로깅을 켜면 각 정의가 로드되는 과정과 각 인스턴스가 해결(Resolution)되는 과정을 확인할 수 있습니다:

```kotlin
startKoin {
    printLogger(Level.DEBUG)
    modules(appModule)
}
```

| 레벨 | 확인 가능한 내용 |
|-------|--------------|
| `Level.DEBUG` | Koin이 탐색한 스코프를 포함한 모든 의존성 해결 과정. 실패 원인을 파악할 때 사용합니다 |
| `Level.INFO` | `Started 42 definitions in 1.2 ms`와 같은 시작 요약 정보. `printLogger()`의 기본값 |
| `Level.WARNING` | 다른 정의를 덮어쓰는(override) 등의 경고 메시지 |
| `Level.ERROR` | 에러만 표시 |
| `Level.NONE` | 아무것도 표시하지 않음 |

Android에서는 `androidLogger(Level.DEBUG)`를 사용하여 Logcat에 출력할 수 있습니다. 로거 옵션에 대한 자세한 내용은 [Koin 시작하기](/docs/reference/koin-core/starting-koin)를 참조하세요.

`Level.DEBUG`는 의존성 해결 속도를 저하시킵니다. 릴리스 빌드가 아닌 디버깅 세션에서만 사용하세요.

## 런타임 에러 {id="runtime-errors"}

### 정의를 찾을 수 없음 (No definition found) {id="no-definition-found"}

```
NoDefinitionFoundException: No definition found for type 'com.example.UserRepository' on scope '['_root_']'.
Check or add definition for type 'com.example.UserRepository' in scope '_root_'.
```

로드된 모듈 중 어떤 모듈에도 선언되지 않은 타입을 Koin에 요청했을 때 발생합니다. 다음 순서대로 확인해 보세요:

- **모듈 미로드**: 정의는 존재하지만 해당 모듈이 `modules(...)` 또는 `includes(...)`에 포함되지 않았습니다.
- **한정자(Qualifier) 누락**: 정의에는 한정자가 지정되어 있지만 요청에는 없거나, 그 반대의 경우입니다. 이 경우 메시지에 `and qualifier '...'`가 포함됩니다. 자세한 내용은 [한정자(Qualifiers)](/docs/reference/koin-core/qualifiers)를 참조하세요.
- **인터페이스 미바인딩**: 정의에서는 `UserRepositoryImpl`을 선언하고 요청에서는 `UserRepository`를 요구합니다. 인터페이스를 바인딩해야 합니다. 자세한 내용은 [정의(Definitions)](/docs/reference/koin-core/definitions#interface-binding)를 참조하세요.
- **잘못된 스코프**: 정의가 특정 스코프 내에 `scoped`로 지정되어 있는데, 다른 스코프나 루트에서 요청한 경우입니다. 메시지에는 탐색된 스코프 목록이 표시됩니다. 자세한 내용은 [스코프(Scopes)](/docs/reference/koin-core/scopes)를 참조하세요.

`SavedStateHandle`의 경우, 에러 메시지에 ViewModel의 `CreationExtras`를 통해 제공된다는 내용이 대신 표시됩니다. ViewModel을 `koinViewModel()` 또는 `by viewModel()`로 해결하고 `SavedStateHandle`을 생성자 파라미터로 받도록 설정하세요. 자세한 내용은 [ViewModel](/docs/reference/koin-core/viewmodel)을 참조하세요.

### 인스턴스를 생성할 수 없음 (Could not create instance) {id="could-not-create-instance"}

```
InstanceCreationException: Could not create instance for '[Singleton: 'com.example.UserRepository']'
```

Koin이 정의를 찾았지만, 인스턴스를 생성하는 과정에서 예외가 발생했습니다. 실제 원인은 스택 트레이스의 중첩된 예외(`Caused by:`)에 있습니다. 주로 생성자 파라미터 중 하나에 대한 `NoDefinitionFoundException`이거나 생성자 자체에서 던져진 예외입니다.

### 이미 존재하는 정의 (Already existing definition) {id="already-existing-definition"}

```
DefinitionOverrideException: Already existing definition for [Singleton: 'com.example.ApiService'] at com.example.ApiService::_root_
```

두 개 이상의 모듈이 동일한 타입과 한정자를 선언했으며, 오버라이딩이 비활성화되어 있는 상태(`allowOverride(false)`)입니다. 중복을 제거하거나, [한정자](/docs/reference/koin-core/qualifiers)를 부여하거나, 의도한 정의에 `.override()`를 명시하세요. 자세한 내용은 [정의(Definitions)](/docs/reference/koin-core/definitions#overriding-a-definition)를 참조하세요.

### 스코프 에러 {id="scope-errors"}

| 메시지 | 예외 | 원인 |
|---------|-----------|-------|
| `Scope 'user_session' is closed` | `ClosedScopeException` | 스코프가 닫혔는데 여전히 해당 스코프에 인스턴스를 요청하고 있습니다. 주로 화면 수명보다 오래 지속되는 콜백이나 코루틴에서 발생합니다 |
| `No scope found for id 'user_session'` | `ScopeNotCreatedException` | `createScope(id, ...)` 전에 `getScope(id)`가 호출되었습니다. `getOrCreateScope`를 사용하거나 스코프를 먼저 생성하세요 |
| `Scope with id 'user_session' is already created` | `ScopeAlreadyCreatedException` | 동일한 ID로 `createScope`가 두 번 호출되었습니다 |
| `No value for scope 'user_session' in [Scoped: ...]` | `MissingScopeValueException` | `declare()`로 선언된 스코프 값이 해당 스코프에 제공되지 않았습니다 |
| `Activity should implement AndroidScopeComponent` | `IllegalStateException` | 스코프가 없는 Activity에서 Android 스코프 API를 사용했습니다. [Android Scopes](/docs/reference/koin-android/scope)를 참조하세요 |

스코프 생명주기에 대한 내용은 [스코프(Scopes)](/docs/reference/koin-core/scopes)를 참조하세요.

### 주입 파라미터 (Injected parameters) {id="injected-parameters"}

| 메시지 | 예외 | 원인 |
|---------|-----------|-------|
| `Can't get injected parameter #0 from DefinitionParameters[] for type 'kotlin.String'` | `NoParameterFoundException` | 정의에서 파라미터를 읽으려 했으나, 호출자가 `parametersOf(...)`로 전달하지 않았습니다 |
| `No value found for type 'kotlin.String'` | `DefinitionParameterException` | `params.get<T>()`에서 해당 타입의 파라미터를 찾지 못했습니다 |

자세한 내용은 [주입 파라미터(Injected Parameters)](/docs/reference/koin-core/injection-parameters)를 참조하세요.

### 시작 및 프로퍼티 {id="start-and-properties"}

| 메시지 | 예외 | 원인 |
|---------|-----------|-------|
| `KoinApplication has not been started` | `IllegalStateException` | `startKoin` 이전에 글로벌 컨텍스트(`KoinComponent`, `by inject()`)를 사용했습니다. Android의 경우 매니페스트에 `Application` 클래스가 선언되어 있는지 확인하세요 |
| `A Koin Application has already been started` | `KoinApplicationAlreadyStartedException` | `startKoin`이 두 번 호출되었습니다. 테스트에서는 각 테스트 후에 `stopKoin()`을 호출하세요 |
| `Can't resolve Context instance. Please use androidContext() function in your KoinApplication configuration.` | `MissingAndroidContextException` | 정의에서 `androidContext()`를 사용하고 있으나 `startKoin`에 `androidContext(this)`가 누락되었습니다 |
| `Property 'api_url' not found` | `MissingPropertyException` | 기본값 없이 `getProperty("api_url")`을 호출했으나 해당 프로퍼티가 존재하지 않습니다 |
| `No properties found for file '/koin.properties'` | `NoPropertyFileFoundException` | `fileProperties()`가 파일을 찾지 못했습니다 |

### 컴파일러 플러그인 미적용 {id="compiler-plugin-not-applied"}

```
NotImplementedError: Error while using 'single<T>()'. The Koin Compiler plugin is missing. Please fix your setup to use 'io.insert-koin.compiler.plugin' Koin Gradle Plugin.
```

코드에서 컴파일러 플러그인 DSL(`single<T>()`, `factory<T>()`, `startKoin<T>()`)을 사용하고 있지만, 해당 Gradle 모듈에 플러그인이 적용되지 않았습니다. [컴파일러 플러그인 설정](/docs/setup/compiler-plugin)을 참조하세요.

## 순환 의존성 (Circular dependencies) {id="circular-dependencies"}

순환 의존성은 두 클래스가 서로의 생성자에서 상대를 필요로 할 때 발생합니다:

```kotlin
class SessionManager(private val authService: AuthService)
class AuthService(private val sessionManager: SessionManager)
```

컴파일러 플러그인을 사용하면 빌드가 실패합니다:

```
[Koin][KOIN-D004] Circular dependency detected:
  com.example.AuthService → com.example.SessionManager → com.example.AuthService
  Break with Lazy<T> injection or refactor to remove the cycle.
```

`verify()`를 사용하는 경우, 테스트에서 `Circular injection between ... Fix your Koin configuration!` 에러가 발생하며 실패합니다.

이러한 검사가 없으면 Koin은 순환 의존성을 감지하지 못합니다. 각 클래스가 호출 스택이 오버플로될 때까지 서로를 계속 해결하려고 시도하므로 앱이 `StackOverflowError`와 함께 비정상 종료(크래시)됩니다.

### Lazy로 순환 끊기 {id="break-the-cycle-with-lazy"}

한쪽을 지연(Lazy) 초기화하도록 변경하여, 객체 생성 시점이 아닌 처음 사용할 때 해결되도록 합니다:

**컴파일러 플러그인 DSL**
```kotlin
class AuthService(private val sessionManager: Lazy<SessionManager>)

val authModule = module {
    single<SessionManager>()
    single<AuthService>()
}
```

**애너테이션**
```kotlin
@Singleton
class SessionManager(private val authService: AuthService)

@Singleton
class AuthService(private val sessionManager: Lazy<SessionManager>)
```

**생성자 / 클래식 DSL**
```kotlin
class AuthService(private val sessionManager: Lazy<SessionManager>)

val authModule = module {
    single { SessionManager(get()) }
    single { AuthService(inject()) }
}
```

`AuthService` 생성자나 `init` 블록에서 `sessionManager.value`를 읽어서는 안 됩니다. 그렇게 하면 다시 순환이 발생합니다.

### 순환 제거하기 {id="remove-the-cycle"}

`Lazy` 파라미터는 문제를 가릴 뿐 결합도를 그대로 유지합니다. 대부분의 순환 의존성은 두 클래스가 하나의 책임을 공유하고 있음을 의미합니다. 두 클래스가 모두 의존하는 제3의 클래스로 책임을 분리하거나, 한쪽이 필요한 기능만 노출하는 인터페이스에 의존하도록 리팩터링하세요.

```kotlin
class TokenStore

class SessionManager(private val tokenStore: TokenStore)
class AuthService(private val tokenStore: TokenStore)
```

## 에러를 유발하는 안티패턴 {id="patterns-that-cause-errors"}

**메서드 내부에서 의존성 해결**: 클래스 본문 내부에서 `get()` 또는 `KoinComponent`를 호출하면 의존성이 숨겨집니다. 컴파일러 플러그인이 이를 검사할 수 없으며, 누락된 정의는 해당 메서드가 실행될 때에만 에러를 발생시킵니다. 가급적 생성자 파라미터를 사용하는 것을 권장합니다. 반드시 필요한 경우에 대해서는 [KoinComponent](/docs/reference/koin-core/koin-component)를 참조하세요.

```kotlin
// 숨겨진 의존성, 런타임에 늦게 해결됨
class UserViewModel : ViewModel(), KoinComponent {
    fun loadUser() {
        val repository = get<UserRepository>()
    }
}

// 명시적인 의존성, 빌드 타임에 검사됨
class UserViewModel(private val repository: UserRepository) : ViewModel()
```

**직접 의존성 생성**: 클래스 내부에서 `private val api = ApiService()`와 같이 직접 생성하면 Koin을 우회하게 됩니다. 이 경우 테스트 더블(Fake)을 사용한 테스트가 불가능해지며 의존성 검사도 이루어지지 않습니다.

**서로 다른 타입에 한정자 사용**: 한정자는 여러 정의가 동일한 타입을 제공할 때만 필요합니다. `UserRepository`와 `OrderRepository`는 이미 서로 다른 타입이므로 한정자가 필요하지 않습니다.

**정의 내부에서 과도한 작업 수행**: 정의는 객체를 생성해야 하며, 비즈니스 로직을 실행해서는 안 됩니다. `single { }` 람다의 사이드 이펙트는 예측할 수 없는 시점(최초 사용 시)에 실행되며, `createdAtStart`의 경우 메인 스레드에서 실행됩니다. 작업은 클래스 내부로 한정하거나, 시작 시점의 작업은 [Lazy Modules](/docs/reference/koin-core/lazy-modules)로 이동하세요.

**전체 앱에 단 하나의 모듈 사용**: 하나의 거대한 모듈은 테스트 시 재정의(Override)하기 어렵고 지연 로딩(Lazy load)하기도 힘듭니다. 기능(Feature)이나 계층(Layer)별로 모듈을 분리하세요. 자세한 내용은 [모듈(Modules)](/docs/reference/koin-core/modules)을 참조하세요.

**닫힌 후에도 유지되는 스코프 인스턴스**: `single` 또는 정적 필드에 스코프 인스턴스에 대한 참조를 저장하면, 해당 스코프가 닫힌 후에도 인스턴스가 메모리에 유지되며 이후 호출 시 `ClosedScopeException`이 발생할 수 있습니다. 스코프 인스턴스는 동일하거나 더 짧은 수명 주기를 가진 객체에만 주입하세요.

:::tip
시작 시 느린 의존성 해결 속도, 닫히지 않는 스코프, 드문 경로에서의 크래시 등 일부 문제는 실제 기기에서만 나타납니다. 실제 사용자 세션에서 이러한 문제를 확인하려면 [프로덕션 모니터링(Production Monitoring)](/docs/tooling/production-monitoring)을 참조하세요.
:::

## 관련 문서 {id="related"}

- [컴파일 타임 안정성(Compile-Time Safety)](/docs/reference/koin-compiler/compile-safety): 모든 빌드 타임 검사항목 및 에러 코드.
- [구성 검증하기(Verify your configuration)](/docs/reference/koin-test/verify): 컴파일러 플러그인 없이 테스트에서 모듈 검사하기.
- [Koin 시작하기](/docs/reference/koin-core/starting-koin): 로거 및 시작 옵션.
- [스코프(Scopes)](/docs/reference/koin-core/scopes): 스코프 생명주기 및 종료.
- [IDE 플러그인](/docs/tooling/ide-plugin): 코딩하는 동안 의존성 그래프 확인하기.