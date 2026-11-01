---
title: 컴파일 타임 안전성 (Compile-Time Safety)
---

# 컴파일 타임 안전성 (Compile-Time Safety)

Koin 컴파일러 플러그인은 코드가 컴파일되는 동안 의존성 그래프(dependency graph)를 검사합니다. 누락된 정의(definition), 잘못된 한정자(qualifier) 또는 순환 의존성(circular dependency)이 발생하면 런타임에 비정상 종료(crash)되는 대신 파일과 라인 번호를 표시하며 빌드가 실패합니다. 이 문서에서는 검사되는 항목, 정확한 진단(diagnostics) 메시지, 플러그인이 검사할 수 없는 사례에 대해 다룹니다. 이 문서는 플러그인이 이미 설치되어 있다고 가정합니다([컴파일러 플러그인 설정](/docs/setup/compiler-plugin) 참조).

컴파일 타임 안전성은 기본적으로 활성화되어 있습니다(`compileSafety = true`, [컴파일러 플러그인 옵션](/docs/reference/koin-annotations/options) 참조).

## 검사가 실행되는 위치 {id="where-the-checks-run"}

플러그인은 두 가지 수준에서 검사를 수행합니다.

**전체 그래프 (Full graph)**: 각 Koin 진입점(entry point)에서 플러그인은 소스 코드 및 의존성 JAR로부터 진입점이 로드하는 모든 모듈을 수집하고, 완성된 전체 그래프를 기준으로 모든 정의를 검사합니다.

**호출 지점 (Call sites)**: 모든 `get<T>()`, `inject<T>()`, `koinInject<T>()`, `koinViewModel<T>()`, `by viewModel()` 및 이와 유사한 호출이 검사됩니다. 즉, `T`가 구성된 그래프에 반드시 존재해야 합니다. 만약 기능 모듈(feature module)이 호출을 수행하지만 전체 그래프를 볼 수 없는 경우, 플러그인은 컴파일된 모듈에 힌트를 남깁니다. 앱 모듈은 컴파일 시 이러한 힌트를 의존성으로부터 읽어와 검사합니다.

인식되는 진입점:

| 진입점 | 예시 |
|-------------|---------|
| `startKoin` | `startKoin<MyApp>()`, `startKoin { modules(appModule) }` |
| `koinApplication` | `koinApplication { modules(appModule) }` |
| `koinConfiguration` | `koinConfiguration<MyApp>()` |
| `@KoinApplication` | `@KoinApplication object MyApp` |
| `withConfiguration<T>()` | `startKoin { withConfiguration<MyApp>() }` |
| Ktor `install(Koin)` | `install(Koin) { modules(appModule) }` |

`modules(...)`는 플러그인이 추적할 수 있는 리스트 형태를 지원합니다: `listOf(...)`, `+`, `.toList()`, 최상위(top-level) `val` 또는 `List<Module>`을 반환하는 함수:

```kotlin
val dataModules = listOf(databaseModule, networkModule)
fun featureModules(): List<Module> = listOf(loginModule, profileModule)

startKoin {
    modules(dataModules + featureModules())
}
```

함수로 선언된 모듈(`fun dataModule(): Module = module { ... }`)은 최상위 `val`과 동일하게 추적됩니다.

:::note
자체적인 진입점이 없는 Gradle 모듈(라이브러리, 대부분의 기능 모듈)은 자체 컴파일 시 누락된 의존성에 대한 진단이 발생하지 않습니다. 모듈을 단독으로 검사할 때는 앱이 이를 어떻게 연결할지 알 수 없기 때문입니다. 해당 모듈의 정의는 앱 모듈이 그래프를 구성할 때 검사됩니다. 플러그인은 빌드 출력에 다음과 같이 표시합니다:

```
[Koin] compile-safety validation skipped — no Koin entry point in this compilation.
```
:::

## 검사 항목 {id="what-is-checked"}

| 케이스 | 결과 |
|------|--------|
| Non-nullable 파라미터, 정의 없음 | 에러 (Error) |
| Nullable 파라미터 (`T?`), 정의 없음 | 정상 (OK), `getOrNull()`로 해결됨 |
| 기본값(default value)이 있는 파라미터, 정의 없음 | 정상 (OK), Kotlin 기본값 사용 (`skipDefaultValues = true`인 경우) |
| 기본값과 한정자(`@Named`)가 함께 있는 파라미터 | 에러 (Error), 한정자가 강제로 의존성을 해결하도록 함 |
| `@InjectedParam` 파라미터 | 정상 (OK), 런타임에 `parametersOf()`로 전달됨 |
| `@Property("key")` 파라미터 | 정상 (OK). `@PropertyValue("key")` 기본값이 없으면 경고(Warning) 발생 |
| `List<T>` 파라미터 | 정상 (OK), 일치하는 항목이 없으면 `getAll()`이 빈 리스트 반환 |
| `Lazy<T>`, `T`에 대한 정의 없음 | 에러 (Error), 내부 타입이 검사됨 |
| `@Named("x")` 파라미터, 해당 한정자를 가진 정의 없음 | 에러 (Error), 해당 타입이 다른 한정자로 존재하는 경우 힌트 제공 |
| 다른 스코프에 선언된 스코프 의존성(Scoped dependency) | 에러 (Error) |
| 순환 의존성 (A가 B를 필요로 하고, B가 A를 필요로 함) | 에러 (Error) |
| `@Provided` 타입 또는 파라미터 | 정상 (OK), 그래프 외부에서 제공됨 |
| `@ScopeId` 파라미터 | 정상 (OK), 런타임에 명명된 스코프(named scope)로부터 해결됨 |
| `Scope` 파라미터 | 정상 (OK), 현재 스코프가 전달됨 |
| Android 프레임워크 타입 (`Context`, `SavedStateHandle`, ...) | 정상 (OK), 내장 목록 지원 |
| `T`에 대한 정의가 없는 `get<T>()` / `inject<T>()` | 에러 (Error) |
| `T`에 `@InjectedParam`이 있지만 `parametersOf()`가 없는 `get<T>()` | 에러 (Error) |
| 개수나 타입이 일치하지 않는 `parametersOf(...)` | 에러 (Error) |

각 파라미터 타입이 해결되는 방식에 대한 규칙은 [정의(Definitions)](/docs/reference/koin-core/definitions#constructor-parameters)를 참조하세요.

## 선언 스타일별 검사 {id="checks-per-declaration-style"}

모든 스타일과 DSL 형태는 동일한 그래프를 기준으로 검사됩니다. 이들은 한 프로젝트 내에 공존할 수 있으며, DSL 정의가 애너테이션이 적용된 클래스에 의존하거나 그 반대의 경우도 가능합니다.

**컴파일러 플러그인 DSL (Compiler Plugin DSL)**
```kotlin
val appModule = module {
    single<Database>()
    single<UserRepository>()      // 검사됨: Database가 존재하는지 확인
    viewModel<UserViewModel>()    // 검사됨: UserRepository가 존재하는지 확인
}
```

플러그인은 생성자를 읽어 의존성 해결 호출을 생성하고 모든 파라미터를 검사합니다. `create(::function)`도 함수의 파라미터에 대해 동일한 방식으로 검사됩니다:

```kotlin
fun buildUserRepository(db: Database): UserRepository = UserRepository(db)

val appModule = module {
    single { create(::buildUserRepository) }    // 검사됨: Database가 존재하는지 확인
}
```

**애너테이션 (Annotations)**
```kotlin
@Singleton
class Database

@Singleton
class UserRepository(private val db: Database)    // 검사됨: Database가 존재하는지 확인

@KoinViewModel
class UserViewModel(private val repo: UserRepository) : ViewModel()

@Module
@ComponentScan("com.myapp")
class AppModule

@KoinApplication(modules = [AppModule::class])
object MyApp
```

`startKoin<MyApp>()`이 진입점이 됩니다. 플러그인은 `@ComponentScan`으로 발견된 모든 정의를 검사합니다. 애너테이션이 지정된 최상위 함수도 클래스와 마찬가지로 검사됩니다:

```kotlin
@Factory
fun provideCache(db: Database): CacheService = RedisCache(db)    // 검사됨: Database가 존재하는지 확인
```

`@Configuration` 태그가 지정된 모듈은 여러 Gradle 모듈에 걸쳐 해당 라벨을 요청하는 `@KoinApplication`과 함께 수집되어 함께 검사됩니다.

**생성자 / 클래식 DSL (Constructor / Classic DSL)**
생성자 참조는 컴파일러 플러그인 DSL과 동일하게 검사됩니다:

```kotlin
val appModule = module {
    singleOf(::Database)
    singleOf(::UserRepository)        // 검사됨: Database가 존재하는지 확인
    viewModelOf(::UserViewModel)      // 검사됨: UserRepository가 존재하는지 확인
    scope<UserSession> {
        scopedOf(::SessionCache)
    }
}
```

`singleOf`, `factoryOf`, `scopedOf`, `viewModelOf` 및 `new(::T)`는 기존의 런타임 동작을 그대로 유지합니다. 플러그인은 검사 기능만 추가할 뿐 코드를 재작성하지 않습니다.

직접 작성한 람다식의 경우 플러그인이 생성자를 직접 읽지 않습니다. 대신 일반적인 호출 지점과 마찬가지로 람다 내부의 `get()`, `inject()`, `getOrNull()` 호출을 검사합니다:

```kotlin
val appModule = module {
    single { UserRepository(get()) }  // 검사됨: get() 호출에 Database가 필요한지 확인
}
```

:::warning
컴파일러 플러그인 1.2.0부터 `singleOf`, `factoryOf`, `scopedOf`, `viewModelOf`가 검사됩니다. 이러한 함수에서 누락된 의존성에 의존하던 코드는 더 이상 컴파일되지 않습니다. 이전 빌드에서는 런타임 크래시가 숨겨져 있었습니다.
:::

## 진단 (Diagnostics) {id="diagnostics"}

모든 진단 메시지에는 `[Koin][CODE]` 형식으로 출력되는 고유 코드가 있습니다. 해당 코드나 메시지의 첫 줄로 검색할 수 있습니다.

### 의존성 누락 (KOIN-D001) {id="missing-dependency-koin-d001"}

정의의 파라미터에 해당하는 정의가 그래프 내에 없습니다:

```
[Koin][KOIN-D001] Missing dependency: com.myapp.Database
  required by: com.myapp.UserRepository (parameter 'db')
  in module: com.myapp.AppModule
```

DSL 정의의 경우 `required by:` 부분이 `dsl:`로 시작합니다. 동일한 타입이 다른 한정자로 존재하는 경우 다음과 같이 힌트가 함께 표시됩니다:

```
[Koin][KOIN-D001] Missing dependency: com.myapp.NetworkClient qualified with @Named("http")
  required by: com.myapp.ApiService (parameter 'client')
  in module: com.myapp.AppModule
  Hint: Found similar binding: com.myapp.NetworkClient (no qualifier)
```

해결 방법: 누락된 정의를 선언하거나, 해당 정의를 선언한 모듈을 `modules()` 또는 `includes()`에 추가하거나, 한정자를 수정합니다([한정자(Qualifiers)](/docs/reference/koin-core/qualifiers) 참조).

### 호출 지점의 정의 누락 (KOIN-D002, KOIN-D003) {id="missing-definition-at-a-call-site-koin-d002-koin-d003"}

`get<T>()`, `inject<T>()` 또는 `koinViewModel<T>()` 호출이 로드된 모듈에 선언되지 않은 타입을 요청합니다:

```
[Koin][KOIN-D002] Missing definition: com.myapp.Tracker
  resolved by: get<Tracker>()
  No matching definition found in any loaded module.
  Check your declaration with Annotation or DSL.
```

`KOIN-D003`은 의존성 모듈에서 발생한 호출에 대한 동일한 에러로, 앱 모듈이 컴파일될 때 보고됩니다. 두 번째 줄에 `required by a call site in a dependency module`이라고 표시됩니다.

### 순환 의존성 (KOIN-D004) {id="circular-dependency-koin-d004"}

```
[Koin][KOIN-D004] Circular dependency detected:
  com.myapp.A → com.myapp.B → com.myapp.A
  Break with Lazy<T> injection or refactor to remove the cycle.
```

`Lazy<T>`, nullable, `List<T>`, `@InjectedParam`, `@Provided`, `@Property`, `@ScopeId` 또는 기본값이 있는 파라미터는 순환 고리의 엣지(edge)로 간주되지 않습니다. 파라미터 중 하나를 `Lazy<T>`로 변경하면 순환 고리를 끊을 수 있습니다. 순환을 제거하는 방법은 [문제 해결(Troubleshooting)](/docs/reference/koin-core/troubleshooting)을 참조하세요.

### 주입 파라미터 (KOIN-D005, KOIN-D006) {id="injected-parameters-koin-d005-koin-d006"}

정의에는 `@InjectedParam` 파라미터가 선언되어 있지만, 호출 지점에서 이를 전달하지 않았습니다:

```
[Koin][KOIN-D006] com.myapp.Greeter requires 1 injected param(s) but get<Greeter>() has no parametersOf(...) at the call site.
  Expected @InjectedParam slots: name: kotlin.String
  Pass them via parametersOf(...) inside the trailing lambda.
```

`KOIN-D005`는 `parametersOf(...)`의 인자 개수나 타입이 일치하지 않을 때 보고됩니다(`Mismatched parametersOf(...) for ...`). 두 검사 모두 플러그인이 읽을 수 있는 `parametersOf(...)`가 호출에 포함된 경우에만 실행됩니다. 자세한 내용은 [주입 파라미터(Injected Parameters)](/docs/reference/koin-core/injection-parameters)를 참조하세요.

### 지원되지 않는 suspend 바인딩 (KOIN-D007) {id="unsupported-suspend-binding-koin-d007"}

타입이 suspend 함수 타입을 확장하는 정의는 Koin이 런타임에 이를 해결할 수 없기 때문에 거부됩니다:

```kotlin
fun interface SetUsernameUseCase : suspend (String) -> Unit

@Factory
fun provideSetUsernameUseCase(repository: UserRepository): SetUsernameUseCase =
    SetUsernameUseCase(repository::setUsername)
```

```
[Koin][KOIN-D007] Unsupported binding: com.myapp.SetUsernameUseCase extends kotlin.coroutines.SuspendFunction1
  Suspend function injection is not yet supported by Koin runtime.
  Remove the @Single / @Factory / @Scoped registration, or refactor the binding type to not extend a suspend function.
  Tracked at https://github.com/InsertKoinIO/koin-compiler-plugin/issues/16
```

해결 방법: `suspend` 메서드를 포함한 일반 인터페이스나 클래스를 사용하세요.

### 전체 코드 목록 {id="all-codes"}

| 코드 | 심각도 | 메시지 시작 문구 |
|------|----------|---------------------|
| `KOIN-D001` | Error | `Missing dependency:` |
| `KOIN-D002` | Error | `Missing definition:` (현재 모듈 내의 호출 지점) |
| `KOIN-D003` | Error | `Missing definition:` (의존성 모듈 내의 호출 지점) |
| `KOIN-D004` | Error | `Circular dependency detected:` |
| `KOIN-D005` | Error | `Mismatched parametersOf(...) for` |
| `KOIN-D006` | Error | `<Type> requires N injected param(s) but` |
| `KOIN-D007` | Error | `Unsupported binding:` |
| `KOIN-D008` | Error | `Module id collision:` (두 모듈 이름이 동일한 힌트 이름으로 인코딩됨: 둘 중 하나의 이름을 변경하세요) |
| `KOIN-W001` | Warning | `Module '<name>' is not loaded at startKoin` |
| `KOIN-W003` | Warning | `Graph not verifiable at compile time:` |
| `KOIN-W004` | Warning | `Custom @Configuration label '<label>' requested by` |
| `KOIN-W005` | Warning | `Definition '<name>' in dependency module` |
| `KOIN-W006` | Warning | `<definition>'s bind(...) argument could not be resolved` |
| `KOIN-A001` | Error | `@KoinViewModel definition '<name>' cannot be generated` (`io.insert-koin:koin-core-viewmodel` 추가 필요) |
| `KOIN-A002` | Error | `@KoinWorker definition '<name>' cannot be generated` (`io.insert-koin:koin-android-workmanager` 추가 필요) |
| `KOIN-A003` | Error | `Cannot generate <Module>.module()` (`io.insert-koin:koin-core` 추가 필요) |
| `KOIN-S001` | Error | `create(::<Type>) must be the only instruction in the lambda` ([unsafeDslChecks](/docs/reference/koin-annotations/options#unsafedslchecks) 참조) |
| `KOIN-P001` | Warning | `Missing @PropertyValue default:` |
| `KOIN-M001` | Warning | `@Monitor: Kotzilla SDK not found on classpath` |

경고(Warning)는 플러그인이 검사할 수 없었던 항목을 설명합니다. `KOIN-W003`, `KOIN-W004`, `KOIN-W005`는 [제한 사항](#limits)에서 다룹니다. `KOIN-W006`은 `bind`/`binds` 인자가 `X::class` 리터럴(또는 이들의 리터럴 배열/리스트)이 아님을 의미합니다. 리터럴을 사용하세요.

## 외부 타입: `@Provided` {id="external-types-provided"}

어떤 타입들은 플랫폼 객체, SDK 인스턴스, 런타임에 수동으로 추가된 정의 등 Koin 선언 외부로부터 그래프에 유입되기도 합니다. 플러그인이 이를 누락된 것으로 보고하지 않도록 `@Provided`로 표시하세요:

```kotlin
// 클래스에 적용: 이 타입의 모든 사용에 대해 검사를 건너뜁니다
@Provided
class FirebaseAnalytics

// 파라미터에 적용: 이 파라미터에 대해서만 검사를 건너뜁니다
@Singleton
class PaymentProcessor(@Provided val gateway: PaymentGateway)
```

`@Provided`(`org.koin.core.annotation`)는 모든 선언 스타일과 함께 작동합니다. 정의가 DSL 모듈에 있더라도 클래스나 생성자 파라미터에 애너테이션을 추가할 수 있습니다. 이는 컴파일 타임 검사에만 영향을 미칩니다. 런타임에는 여전히 `get()`을 통해 타입이 해결되며, 아무도 선언하지 않은 경우 실패합니다. 가급적 파라미터 형태를 사용하는 것이 좋습니다. 클래스에 적용하면 해당 타입이 사용되는 모든 위치에서 검사가 비활성화되기 때문입니다.

다음 타입들은 `@Provided` 없이도 항상 허용됩니다:

- `android.content.Context`
- `android.app.Application`
- `android.app.Activity`
- `androidx.activity.ComponentActivity`
- `androidx.fragment.app.Fragment`
- `androidx.lifecycle.SavedStateHandle`
- `androidx.work.WorkerParameters`

### 런타임에 로드되는 모듈 {id="modules-loaded-at-runtime"}

`startKoin` 이후에 `loadKoinModules(...)`로 로드되는 모듈은 플러그인이 구성하는 그래프의 일부가 아닙니다. 플러그인은 해당 호출이 언제 실행되는지, 또는 실제로 실행되는지 여부를 알 수 없습니다. 이러한 모듈에서만 제공되는 타입은 `@Provided`로 표시해야 합니다:

```kotlin
val featureModule = module { single<Repository>() }   // 나중에 로드됨
val appModule = module { single<Service>() }          // Service(@Provided val repo: Repository)

startKoin { modules(appModule) }
loadKoinModules(featureModule)
```

플러그인은 런타임 로드 모듈에 대해 여전히 `KOIN-W001`을 통해 도달할 수 없음(unreachable)으로 보고합니다. 이 모듈을 `modules()`에 추가하면 온디맨드 로딩 목적에 어긋나므로, 이 경고는 무시해도 됩니다(`allWarningsAsErrors`가 활성화된 경우에만 빌드가 실패합니다).

## 특수 파라미터 {id="special-parameters"}

**Scope**: `org.koin.core.scope.Scope` 타입의 파라미터는 현재 스코프를 받습니다. 코드에서 동적으로 타입을 해결하므로 검사되지 않습니다.

```kotlin
@Scoped
class ScopedService(val scope: Scope) {
    fun load() = scope.get<SomeDependency>()
}
```

**@ScopeId**: 파라미터가 다른 스코프에서 이름(`@ScopeId(name = "user_session")`) 또는 타입(`@ScopeId(UserSessionScope::class)`, 스코프 ID는 전체 클래스 이름임)으로 해결됩니다. 해당 스코프는 런타임에만 존재하므로 검사되지 않습니다. 자세한 내용은 [스코프(Scopes)](/docs/reference/koin-core/scopes)를 참조하세요.

**@Property**: 파라미터가 Koin 프로퍼티를 읽습니다. `@PropertyValue("key")` 기본값이 선언되지 않은 경우 빌드 시 경고가 발생하며, 시작 시 프로퍼티를 설정해야 합니다:

```kotlin
@PropertyValue("api.timeout")
val defaultTimeout = 30

@Factory
class ApiClient(@Property("api.timeout") val timeout: Int)    // 정상 (OK)

@Factory
class Other(@Property("missing.key") val value: String)
// [Koin][KOIN-P001] Missing @PropertyValue default: "missing.key" ...
```

**기본값 (Default values)**: `skipDefaultValues = true`(기본값)인 경우, Kotlin 기본값을 가진 파라미터는 해당 값을 사용하며 검사되지 않습니다. [skipDefaultValues](/docs/reference/koin-annotations/options#skipdefaultvalues)를 참조하세요.

## 제네릭 타입 {id="generic-types"}

Koin은 타입 소거(type erasure)된 클래스를 기준으로 정의를 해결합니다. 즉, 타입 인자는 조회 키의 일부가 아닙니다. 플러그인도 동일한 규칙을 따릅니다. `get<Box<Int>>()`는 모든 `Box` 정의에 대해 검사되며, `single<Box<A>>()`와 `single<Box<B>>()`는 동일한 정의로 취급되어 두 번째 정의가 첫 번째 정의를 덮어씁니다.

하나의 제네릭 타입에 대해 여러 인스턴스를 유지하려면 `named<T>()`를 사용하여 타입 인자로부터 파생된 타입 한정자를 각각 부여하세요. 이 패턴은 [고급 패턴(Advanced Patterns)](/docs/reference/koin-core/advanced-patterns)에 설명되어 있습니다.

## 증분 빌드 (Incremental builds) {id="incremental-builds"}

전체 그래프 검사는 애그리게이터 모듈(진입점이 있는 모듈)이 컴파일될 때 실행됩니다. 다른 곳(예: `module { }` 람다 본문 내부)이 변경된 후 Kotlin 증분 컴파일이 해당 모듈을 건너뛸 수 있습니다. 플러그인은 진입점을 감지한 모듈에서 `strictSafety`를 활성화하여 모든 빌드에서 검사가 실행되도록 합니다. 자세한 내용과 예외 설정 방법은 [strictSafety](/docs/reference/koin-annotations/options#strictsafety)를 참조하세요.

## 제한 사항 {id="limits"}

- **동적 모듈 리스트**: `modules(if (debug) a else b)`, `modules(*list)` 또는 런타임에 빌드된 리스트는 추적할 수 없습니다. 플러그인은 `KOIN-W003`을 보고하고 해당 진입점에 대한 전체 그래프 검사를 건너뜁니다. 검사를 유지하려면 모듈을 직접 전달하세요.
- **직접 작성한 람다와 순환 의존성**: `single { A(get()) }` 형태의 람다는 순환 검사에 엣지를 추가하지 않으므로, 직접 작성한 람다를 통한 순환 의존성은 감지되지 않습니다. 순환 검사가 중요한 위치에는 `single<T>()`, `singleOf(::T)` 또는 `create(::T)`를 사용하세요.
- **커스텀 구성 라벨 (Custom configuration labels)**: `"default"` 이외의 라벨이 지정된 모듈은 최대 1단계의 `implementation` 의존성까지만 감지됩니다(`KOIN-W004`). 직접 의존성을 추가하거나 `@KoinApplication(modules = [...])`에 모듈을 명시하세요.
- **멀리 떨어진 함수 정의**: 2단계 이상의 `implementation` 홉(hop)으로 떨어진 모듈에 있는 `@Module` 함수 정의나 한정자가 지정된 최상위 함수는 검사에 표시되지 않습니다(`KOIN-W005`). 런타임에는 정상 작동합니다. 이를 검사하려면 직접 의존성을 추가하세요.
- **런타임 로드 모듈**: [런타임에 로드되는 모듈](#modules-loaded-at-runtime)을 참조하세요.

## verify() 및 checkModules() 대체하기 {id="replacing-verify-and-checkmodules"}

컴파일 타임 안전성이 활성화되면 빌드 시 매 컴파일마다 `verify()` 및 `checkModules()` 테스트가 검사하는 내용을 자동으로 검사합니다. 플러그인이 완전히 검사하는 그래프에 대해서는 이러한 테스트를 제거해도 됩니다. 플러그인이 검증 불가능으로 보고하거나(`KOIN-W003`) 런타임 로드 모듈을 사용하는 그래프에 대해서는 테스트를 유지하세요. 자세한 내용은 [모듈 검증(Verifying modules)](/docs/reference/koin-test/verify)을 참조하세요.

## 관련 문서 {id="related"}

- [컴파일러 플러그인 옵션](/docs/reference/koin-annotations/options): `compileSafety`, `strictSafety`, `skipDefaultValues` 및 기타 옵션.
- [Koin 컴파일러 플러그인](/docs/intro/koin-compiler-plugin): 플러그인의 역할 및 동작 방식.
- [정의 (Definitions)](/docs/reference/koin-core/definitions): 생성자 파라미터가 해결되는 방식.
- [문제 해결 (Troubleshooting)](/docs/reference/koin-core/troubleshooting): 런타임 에러, 로거 및 순환 의존성.
- [IDE 플러그인](/docs/tooling/ide-plugin): IDE에서 그래프를 확인하고 정의 간 이동하기.
- [Playground 앱](https://github.com/InsertKoinIO/koin-compiler-plugin/tree/main/playground-apps): 애너테이션(`app-annotations/`) 및 DSL(`app-dsl/`)을 사용한 샘플 앱.