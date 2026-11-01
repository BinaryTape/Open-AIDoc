---
title: 구성(Configuration) 검증하기
---

# 구성(Configuration) 검증하기

이 페이지에서는 Koin 구성을 실행하지 않고 확인하는 테스트 API인 `verify()`와 더 이상 권장되지 않는(deprecated) `checkModules()`에 대해 다룹니다. 또한 이 두 API가 Koin 컴파일러 플러그인(Koin Compiler Plugin)의 컴파일 타임 검사와 어떻게 연관되는지 설명하여, 여전히 이 API들이 필요한지 판단할 수 있도록 돕습니다. 시작하기 전에 [Koin을 사용한 단위 테스트](/docs/reference/koin-test/testing) 작성 방법을 알고 있어야 합니다.

## verify()가 여전히 필요한가요? {id="do-you-still-need-verify"}

[Koin 컴파일러 플러그인](/docs/reference/koin-compiler/compile-safety)은 빌드 시점에 누락된 정의(definition), 한정자(qualifier) 불일치, 스코프 오류, `get()` / `inject()` 호출 지점 등 전체 의존성 그래프를 검사합니다. 컴파일러 플러그인이 프로젝트 전체를 검사하고 있다면 `verify()` 테스트는 추가적인 이점이 없으므로 삭제해도 무방합니다.

다음과 같은 상황에서는 여전히 `verify()`가 필요합니다:

- 컴파일러 플러그인을 사용하지 않는 경우: 프로젝트에서 플러그인 없이 Constructor DSL이나 Classic DSL을 사용하는 경우입니다. (어노테이션을 위한 구버전 KSP 프로세서에는 자체 `KOIN_CONFIG_CHECK` 옵션이 있습니다.)
- 빌드 시점에 그래프를 알 수 없는 경우: 플러그인은 `if` / `when` 문이나 가변 인자(varargs)로 빌드된 모듈 목록을 확인할 수 없습니다. 이 경우 플러그인은 `KOIN-W003` 경고를 출력하고 해당 진입점에 대한 검사를 건너뜁니다.
- 라이브러리 모듈: 자체 `startKoin` / `@KoinApplication`이 없는 라이브러리 또는 기능(feature) 모듈은 앱에서 결합하기 전까지는 누락된 의존성 검사를 받지 못합니다. 라이브러리에 작성된 `verify()` 테스트를 통해 자체적으로 검사할 수 있습니다.
- Lazy 모듈: 그래프의 일부를 [Lazy 모듈](/docs/reference/koin-core/lazy-modules)로 로드하며, 전체 구성에 대해 하나의 테스트를 수행하려는 경우입니다([일반 모듈과 Lazy 모듈 함께 사용하기](#modules-and-lazy-modules-together) 참고).

## verify() {id="verify"}

`verify()`는 `Module`의 확장 함수로, `koin-test`의 JVM 환경에서 사용할 수 있습니다. 이 함수는 각 정의 클래스의 생성자를 읽어 모든 매개변수 타입이 해당 모듈이나 포함된(included) 모듈에 정의되어 있는지 확인합니다. 정의를 직접 실행하지 않으며 목(mock) 객체도 필요하지 않습니다.

```kotlin
val appModule = module {
    includes(dataModule, networkModule)
    viewModel<UserViewModel>()
}
```

```kotlin
import org.koin.test.verify.verify

class AppModuleCheck {

    @Test
    fun checkKoinModule() {
        appModule.verify()
    }
}
```

의존성이 누락된 경우, `verify()`는 `MissingKoinDefinitionException`을 던지고 해결 방법을 제안하는 메시지를 출력합니다. 두 생성자 간에 순환 의존성이 발생하면 `CircularInjectionException`을 던집니다.

`includes()`로 연결되지 않은 여러 모듈을 검사하려면 `listOf(dataModule, uiModule).verifyAll()`을 사용하세요.

### verify()가 통과시키는 조건 {id="what-verify-accepts"}

생성자 매개변수는 다음 조건 중 하나를 충족할 때 검사를 통과합니다:

- 선언됨(Declared): 모듈 트리에 해당 타입에 대한 정의가 존재하는 경우.
- 선택적(Optional): 매개변수에 기본값(default value)이 있는 경우. 정의가 존재하지 않으면 `verify()`가 경고를 출력합니다.
- 래핑됨(Wrapped): `Lazy<T>` 또는 `List<T>` 타입이며, 여기서 `T`가 선언되어 있는 경우.
- 화이트리스트 등록됨(Whitelisted): 해당 타입이 `extraTypes`에 포함되어 있거나 기본 타입(`String`, `Int`, `Long`, `Double`)인 경우.
- 주입됨 또는 제공됨(Injected or provided): 매개변수에 `@InjectedParam` 또는 `@Provided`가 어노테이션되어 있거나, `injections`로 선언된 경우.

`verify()`는 생성자만 읽습니다. 한정자(qualifier), 프로퍼티(property), 또는 정의 람다 내부에서 호출된 `get()` 호출은 검사하지 않습니다.

### 런타임에 제공되는 타입 {id="types-provided-at-runtime"}

프레임워크 객체나 플랫폼에 의해 생성되는 값과 같은 일부 타입은 모듈에 선언되지 않습니다. 이러한 타입은 `extraTypes`에 추가하세요:

```kotlin
appModule.verify(
    extraTypes = listOf(HttpClientEngine::class, Clock::class)
)
```

Android에서는 `koin-android-test`의 `androidVerify()`를 사용하세요. `Context`, `Activity`, `Fragment`, `Application`, `SavedStateHandle`, `WorkerParameters`를 자동으로 추가해 줍니다:

```kotlin
import org.koin.android.test.verify.androidVerify

@Test
fun checkKoinModule() {
    appModule.androidVerify()
}
```

### 주입된 매개변수(Injected parameters) {id="injected-parameters"}

`parametersOf()`를 통해 전달되는 매개변수는 정의가 없기 때문에 `verify()`에서 누락된 것으로 보고됩니다. 이를 `injections`로 선언하세요:

```kotlin
class UserPresenter(val userId: String, val repository: UserRepository)

val presenterModule = module {
    factory { (userId: String) -> UserPresenter(userId, get()) }
}

@Test
fun checkKoinModule() {
    presenterModule.verify(
        injections = injectedParameters(
            definition<UserPresenter>(String::class)
        )
    )
}
```

또는 생성자 매개변수에 어노테이션을 추가할 수 있습니다. `@InjectedParam`은 `parametersOf()`로 전달된 값을 나타내며, `@Provided`는 Koin 모듈 외부에서 제공되는 타입을 나타냅니다:

```kotlin
class UserPresenter(@InjectedParam val userId: String, val repository: UserRepository)

class SyncWorker(@Provided val params: WorkerParameters, val repository: UserRepository)
```

두 어노테이션 모두 `koin-core-annotations`에서 제공되며 컴파일러 플러그인이 읽는 것과 동일합니다([주입 매개변수](/docs/reference/koin-core/injection-parameters) 참고).

### 일반 모듈과 Lazy 모듈 함께 사용하기 {id="modules-and-lazy-modules-together"}

`koin-test-coroutines`는 `ModuleConfiguration`에 대한 `verify()` 확장 함수를 제공하여, 일반 모듈과 [Lazy 모듈](/docs/reference/koin-core/lazy-modules)을 하나의 그래프로 검사할 수 있게 해줍니다:

```kotlin
val configuration = moduleConfiguration {
    modules(coreModule)
    lazyModules(featureModule)
}

@Test
fun checkConfiguration() {
    configuration.verify()
}
```

`moduleConfiguration`과 이 `verify()`는 실험적 기능(`@KoinExperimentalAPI`)입니다.

## checkModules() (deprecated) {id="checkmodules-deprecated"}

:::warning
`checkModules()`, `checkKoinModules()` 및 해당 DSL은 더 이상 권장되지 않습니다(deprecated). `verify()` 또는 컴파일러 플러그인으로 마이그레이션하세요.
:::

`verify()`와 달리 `checkModules()`는 모듈을 시작하고 모든 정의를 실제로 생성하므로, 런타임에 확인되는 모든 값들이 제공되어야 합니다. 오래된 프로젝트에서 다음과 같은 코드를 볼 수 있습니다:

```kotlin
@Test
fun checkAllModules() {
    koinApplication {
        modules(appModule)
        checkModules {
            withInstance<Context>()
            withParameter<UserPresenter> { "user-1" }
            withProperty("api_url", "http://localhost")
        }
    }
}

// 또는
@Test
fun checkAllModules() {
    checkKoinModules(listOf(appModule))
}
```

검사 DSL:

- `withInstance(value)`: 그래프에 `value`를 추가합니다. `withInstance<T>()`는 `T`의 목(mock) 객체를 추가하며 `MockProviderRule`이 필요합니다([declareMock을 사용한 모킹](/docs/reference/koin-test/testing#mocking-with-declaremock) 참고).
- `withParameter<T> { value }`: `T`를 생성하는 데 사용되는 주입 매개변수입니다. 여러 개인 경우 `withParameters<T> { parametersOf(a, b) }`를 사용합니다.
- `withProperty(key, value)`: Koin 프로퍼티를 추가합니다.
- `withScopeLink(scope, targetScope)`: 검사를 위해 두 스코프를 [연결(link)](/docs/reference/koin-core/scopes)합니다.

`verify()`로 마이그레이션하려면 프레임워크 타입에 대한 `withInstance`를 제거하고(`extraTypes` 또는 `androidVerify()` 사용), `withParameter`를 `injections` 또는 `@InjectedParam`으로 대체하세요.

## 관련 문서 {id="related"}

- [컴파일 타임 세이프티(Compile-Time Safety)](/docs/reference/koin-compiler/compile-safety): 컴파일러 플러그인이 빌드 시점에 검사하는 내용.
- [단위 테스트(Unit Testing)](/docs/reference/koin-test/testing): 테스트에서 Koin을 시작하고 정의를 재정의(override) 및 모킹(mock)하는 방법.
- [주입 매개변수(Injected Parameters)](/docs/reference/koin-core/injection-parameters): `parametersOf` 및 `@InjectedParam`.
- [Lazy 모듈(Lazy Modules)](/docs/reference/koin-core/lazy-modules): 백그라운드에서 그래프의 일부 로드하기.
- [문제 해결(Troubleshooting)](/docs/reference/koin-core/troubleshooting): `NoDefinitionFoundException`과 같은 런타임 오류.