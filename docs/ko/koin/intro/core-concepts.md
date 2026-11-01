---
title: 핵심 개념
---

# 핵심 개념

이 페이지에서는 다른 모든 페이지의 기반이 되는 핵심 개념들(정의(definitions), 모듈(modules), Koin 컨테이너(Koin container), 주입(injection), 스코프(scopes), 한정자(qualifiers), 컴파일 타임 검사(compile-time checks))을 설명하기 위해 작은 예제를 단계별로 구축합니다. 각 섹션은 간결하게 구성되어 있으며, 세부 내용을 다루는 페이지로의 링크가 포함되어 있습니다. 이 글은 의존성 주입(Dependency Injection)이 무엇인지 이미 알고 있다고 가정합니다([의존성 주입이란 무엇인가요?](/docs/intro/what-is-dependency-injection) 참고).

코드 예제는 Compiler Plugin DSL, Annotations, Constructor / Classic DSL의 세 가지 탭으로 제공됩니다. 원하는 스타일을 선택하면 다른 모든 페이지에도 동일하게 적용됩니다. 어떤 스타일을 사용해야 할지 잘 모르겠다면 [스타일 선택하기](/docs/intro/choosing-your-style)를 읽어보세요.

## 예제 {id="the-example"}

3개의 순수 코틀린(Plain Kotlin) 클래스입니다. 각 클래스는 필요한 의존성을 생성자에서 전달받으며, Koin에 대해 전혀 알지 못합니다:

```kotlin
class ApiService

class UserRepository(private val api: ApiService)

class UserViewModel(private val repository: UserRepository) : ViewModel()
```

Koin의 역할은 개발자가 직접 연결 코드를 작성하지 않아도 `ApiService`를 생성하여 `UserRepository`에 전달하고, 이를 다시 `UserViewModel`에 전달하는 것입니다.

## 정의 {id="definition"}

**정의(definition)**는 Koin에게 특정 타입을 생성하는 방법과 해당 인스턴스를 얼마나 오래 유지할지를 알려줍니다:

**Compiler Plugin DSL**
```kotlin
single<ApiService>()
single<UserRepository>()
viewModel<UserViewModel>()
```

**Annotations**
```kotlin
@Singleton
class ApiService

@Singleton
class UserRepository(private val api: ApiService)

@KoinViewModel
class UserViewModel(private val repository: UserRepository) : ViewModel()
```

**Constructor / Classic DSL**
```kotlin
singleOf(::ApiService)
singleOf(::UserRepository)
viewModelOf(::UserViewModel)
```

키워드는 생명주기(lifetime)를 설정합니다. `single`은 전체 컨테이너에 대해 단 하나의 인스턴스만 유지합니다. `factory`는 요청할 때마다 새로운 인스턴스를 생성합니다. `viewModel`은 ViewModel의 수명주기를 따릅니다. Koin은 `UserRepository`의 생성자를 확인하여 `ApiService`가 필요함을 파악하고, 컨테이너에서 이를 찾아 주입합니다.

자세한 내용: [Definitions](/docs/reference/koin-core/definitions).

## 모듈 {id="module"}

**모듈(module)**은 정의들을 그룹화합니다. 보통 기능(feature) 또는 계층(layer)당 하나의 모듈을 둡니다:

**Compiler Plugin DSL**
```kotlin
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

val appModule = module {
    single<ApiService>()
    single<UserRepository>()
    viewModel<UserViewModel>()
}
```

**Annotations**
```kotlin
@Module
@ComponentScan("com.example.app")
class AppModule
```

`@ComponentScan`은 `com.example.app` 패키지 및 그 하위 패키지에 있는 어노테이션이 붙은 모든 클래스를 수집합니다.

**Constructor / Classic DSL**
```kotlin
import org.koin.dsl.module
import org.koin.core.module.dsl.*

val appModule = module {
    singleOf(::ApiService)
    singleOf(::UserRepository)
    viewModelOf(::UserViewModel)
}
```

모듈은 단순한 기술서(설명서)일 뿐입니다. Koin이 시작되고 누군가 인스턴스를 요청하기 전까지는 아무것도 생성되지 않습니다. 모듈은 다른 모듈을 포함할 수 있으므로, 규모가 큰 앱은 작은 모듈들의 트리 구조로 이루어집니다.

자세한 내용: [Modules](/docs/reference/koin-core/modules).

## Koin 컨테이너 {id="the-koin-container"}

`startKoin`은 **컨테이너**( `KoinApplication`)를 생성하고 여기에 모듈을 로드합니다. 앱의 진입점(entry point)에서 한 번만 호출하면 됩니다:

**Compiler Plugin DSL**
```kotlin
fun main() {
    startKoin {
        modules(appModule)
    }
}
```

**Annotations**
```kotlin
import org.koin.plugin.module.dsl.startKoin

@KoinApplication(modules = [AppModule::class])
class MyApp

fun main() {
    startKoin<MyApp>()
}
```

**Constructor / Classic DSL**
```kotlin
fun main() {
    startKoin {
        modules(appModule)
    }
}
```

Android에서는 `Application.onCreate()`에서 호출하며, `androidContext(this)`를 통해 Android Context를 전달합니다. 컨테이너는 정의들과 지금까지 생성된 인스턴스들을 보유합니다. `stopKoin()`을 호출하면 컨테이너가 닫히고 모든 `single` 인스턴스가 해제됩니다.

자세한 내용: [Starting Koin](/docs/reference/koin-core/starting-koin), [Start Koin on Android](/docs/reference/koin-android/start).

## 주입 {id="injection"}

객체가 의존성을 가져오는 방법에는 두 가지가 있습니다.

**생성자 주입(Constructor injection)**: 의존성이 생성자 매개변수로 선언되고, Koin이 객체를 생성할 때 이를 전달합니다. 이 예제의 `UserRepository`와 `UserViewModel`은 이미 이 방식을 사용하고 있습니다. 이것이 기본 방식입니다. 클래스는 순수 코틀린 상태로 유지되므로 테스트 시 페이크(fake) 객체와 함께 생성자를 직접 호출하여 테스트할 수 있습니다.

**컨테이너에서 가져오기(Retrieving from the container)**: 어떤 클래스들은 Koin이 아닌 프레임워크에 의해 생성됩니다(Android `Activity`, Composable, Ktor 라우트 등). 이러한 클래스들은 컨테이너에 즉시 가져오는 `get()`이나 첫 접근 시 지연 호출되는 `inject()`를 사용하여 인스턴스를 요청합니다:

```kotlin
import org.koin.androidx.viewmodel.ext.android.viewModel

class UserActivity : AppCompatActivity() {
    private val viewModel: UserViewModel by viewModel()
}
```

```kotlin
import org.koin.compose.viewmodel.koinViewModel

@Composable
fun UserScreen(viewModel: UserViewModel = koinViewModel()) {
    ...
}
```

컨테이너에서 가져오는 방식은 어떤 스타일을 사용하든 동일합니다. 이 방식은 이러한 진입점에만 유지하고, 그 하위의 모든 요소는 생성자 주입을 사용하는 것이 좋습니다.

자세한 내용: [Retrieving Dependencies](/docs/reference/koin-core/injection), [Android Entry Points](/docs/reference/koin-android/entry-points), [Koin for Compose](/docs/reference/koin-compose/compose).

## 그래프 {id="the-graph"}

모두 종합하면, 컨테이너는 다음과 같은 그래프를 갖게 됩니다:

```text
startKoin
  └── appModule
        ├── single     ApiService
        ├── single     UserRepository  ── needs ── ApiService
        └── viewModel  UserViewModel   ── needs ── UserRepository

UserActivity ── by viewModel() ──> UserViewModel
```

`UserActivity`가 `UserViewModel`을 요청하면, Koin은 `ApiService`를 생성하고(1회), 이어서 `UserRepository`를 생성한 후(1회), Activity의 ViewModel 생명주기에 바인딩된 `UserViewModel`을 생성합니다.

## 스코프 {id="scope"}

`single`은 컨테이너가 유지되는 동안 살아있고, `factory`는 호출자가 유지하는 동안에만 살아있습니다. **스코프(scope)**는 그 중간 영역을 다룹니다. 즉, 사용자 세션, 화면 또는 요청 등 다른 어떤 것의 수명만큼만 살아있는 인스턴스를 관리합니다.

예를 들어 `CartRepository`가 사용자가 로그인해 있는 동안에만 존재해야 한다고 가정해 보겠습니다:

**Compiler Plugin DSL**
```kotlin
class UserSession
class CartRepository(private val api: ApiService)

val sessionModule = module {
    scope<UserSession> {
        scoped<CartRepository>()
    }
}
```

**Annotations**
```kotlin
class UserSession

@Scope(UserSession::class)
@Scoped
class CartRepository(private val api: ApiService)
```

**Constructor / Classic DSL**
```kotlin
class UserSession
class CartRepository(private val api: ApiService)

val sessionModule = module {
    scope<UserSession> {
        scopedOf(::CartRepository)
    }
}
```

세션이 시작될 때 스코프를 열고, 세션이 종료될 때 닫습니다:

```kotlin
// inside a KoinComponent
val sessionScope = getKoin().createScope<UserSession>("session-42")
val cart: CartRepository = sessionScope.get()

sessionScope.close() // releases CartRepository
```

스코프 정의는 루트 컨테이너의 정의(여기서는 `ApiService`)를 사용할 수 있습니다. Android의 경우 Koin이 Activity, Fragment, ViewModel을 위한 기본 제공 스코프를 제공하므로 직접 스코프를 생성할 일은 거의 없습니다.

자세한 내용: [Scopes](/docs/reference/koin-core/scopes), [Android Scopes](/docs/reference/koin-android/scope).

## 한정자 {id="qualifier"}

Koin은 타입을 기준으로 정의를 찾습니다. 두 개의 정의가 동일한 타입을 제공할 때, **한정자(qualifier)**를 사용하여 각 정의에 이름을 부여할 수 있습니다:

**Compiler Plugin DSL**
```kotlin
interface NetworkClient

@Named("auth")
class AuthClient : NetworkClient

@Named("public")
class PublicClient : NetworkClient

class UserRepository(@Named("auth") private val client: NetworkClient)

val networkModule = module {
    single<AuthClient>() bind NetworkClient::class
    single<PublicClient>() bind NetworkClient::class
    single<UserRepository>()
}
```

**Annotations**
```kotlin
@Singleton
@Named("auth")
class AuthClient : NetworkClient

@Singleton
@Named("public")
class PublicClient : NetworkClient

@Singleton
class UserRepository(@Named("auth") private val client: NetworkClient)
```

**Constructor / Classic DSL**
```kotlin
val networkModule = module {
    single<NetworkClient>(named("auth")) { AuthClient() }
    single<NetworkClient>(named("public")) { PublicClient() }
    single { UserRepository(get(named("auth"))) }
}
```

자세한 내용: [Qualifiers](/docs/reference/koin-core/qualifiers).

## 컴파일 타임 검사 {id="compile-time-checks"}

컴파일러 플러그인이 없으면 정의가 누락되었을 때 코드가 실행되는 런타임 시점에 발견되어 `get()` 호출 시 `NoDefinitionFoundException`이 발생합니다. 하지만 [Koin Compiler Plugin](/docs/intro/koin-compiler-plugin)을 사용하면 빌드 시점에 이러한 실수를 감지하여 빌드가 실패합니다. 만약 `appModule`에서 `single<ApiService>()`를 제거하면 다음과 같이 컴파일이 중단됩니다:

```text
[Koin][KOIN-D001] Missing dependency: ApiService
  required by: UserRepository (parameter 'api')
  in module: ...
```

플러그인은 각 진입점(`startKoin`, `@KoinApplication`, Ktor의 `install(Koin)`) 및 모든 `get()`, `inject()`, `koinViewModel()` 호출 시점에서 전체 그래프를 검사합니다. 플러그인 없이 Constructor 또는 Classic DSL을 사용하는 경우에는 단위 테스트에서 `verify()`를 통해 유사한 검사를 수행할 수 있습니다.

자세한 내용: [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety), [Verifying your Koin configuration](/docs/reference/koin-test/verify).

## 관련 문서 {id="related"}

- [Choosing your style](/docs/intro/choosing-your-style): 사용할 선언 스타일 선택하기.
- [Setup](/docs/setup): 빌드에 Koin 및 컴파일러 플러그인 추가하기.
- [Tutorials](/docs/quickstart/kotlin): 이러한 개념들을 활용하여 완전한 앱 구축하기.
- [Definitions](/docs/reference/koin-core/definitions): 모든 정의 타입에 대한 상세 설명.
- [Scopes](/docs/reference/koin-core/scopes): single과 factory를 넘어서는 생명주기.