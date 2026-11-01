---
title: 멀티 모듈 앱
---

# 멀티 모듈 앱

이 페이지에서는 Gradle 모듈(`:app`, `:feature:*`, `:core:*`)로 분리된 Android 앱에서 Koin을 구성하는 방법을 설명합니다. 각 Koin 모듈의 위치, 앱에서 모듈을 로드하는 방법, 기능(feature) 간에 타입을 공유하는 방법, 그리고 동적 기능 모듈(dynamic feature modules)을 다룹니다. 모듈 구성(`includes()`, 공개 및 비공개 모듈, `@Configuration`)에 대한 내용은 [Modules](/docs/reference/koin-core/modules)에 설명되어 있습니다.

## 프로젝트 레이아웃 {id="project-layout"}

```
:app                  Application class, startKoin, appModule
:feature:login        LoginViewModel, LoginUseCase, loginModule
:feature:profile      ProfileViewModel, profileModule
:core:data            repositories, Retrofit, Room, dataModule
:core:domain          interfaces shared by features (UserRepository)
```

각 Gradle 모듈은 자체 클래스를 위한 Koin 모듈을 선언합니다. 이렇게 하면 클래스는 해당 Gradle 모듈 내에서 `internal`로 유지될 수 있으며, Koin 모듈만 공개(public) 상태가 됩니다. `:app` 모듈은 모든 기능을 알고 있는 유일한 모듈이므로, 이곳에서 Koin이 시작됩니다.

## 기능 모듈 선언 및 로드 {id="declaring-and-loading-feature-modules"}

**Compiler Plugin DSL**
```kotlin
// Gradle 모듈 ":feature:login"
internal class LoginUseCase(private val auth: AuthService)
internal class LoginViewModel(private val login: LoginUseCase) : ViewModel()

val loginModule = module {
    factory<LoginUseCase>()
    viewModel<LoginViewModel>()
}
```

```kotlin
// Gradle 모듈 ":app"
val appModule = module {
    includes(dataModule, loginModule, profileModule)
}

class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidLogger()
            androidContext(this@MainApplication)
            modules(appModule)
        }
    }
}
```

**Annotations**
```kotlin
// Gradle 모듈 ":feature:login"
@Module
@ComponentScan("com.app.feature.login")
@Configuration
class LoginModule

@Factory
internal class LoginUseCase(private val auth: AuthService)

@KoinViewModel
internal class LoginViewModel(private val login: LoginUseCase) : ViewModel()
```

```kotlin
// Gradle 모듈 ":app"
@KoinApplication
class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin<MainApplication> {
            androidLogger()
            androidContext(this@MainApplication)
        }
    }
}
```

`startKoin<MainApplication>()`은 기능 Gradle 모듈의 모듈을 포함하여 앱 클래스패스에 있는 모든 `@Configuration` 모듈을 찾습니다. 새로운 기능을 추가할 때는 Gradle 의존성만 추가하면 되며, 다른 작업은 필요하지 않습니다. 모듈을 명시적으로 나열하려면 `@KoinApplication(modules = [LoginModule::class, ProfileModule::class])`을 대신 사용하세요.

**Constructor / Classic DSL**
```kotlin
// Gradle 모듈 ":feature:login"
internal class LoginUseCase(private val auth: AuthService)
internal class LoginViewModel(private val login: LoginUseCase) : ViewModel()

val loginModule = module {
    factoryOf(::LoginUseCase)
    viewModelOf(::LoginViewModel)
}
```

```kotlin
// Gradle 모듈 ":app"
val appModule = module {
    includes(dataModule, loginModule, profileModule)
}

class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidLogger()
            androidContext(this@MainApplication)
            modules(appModule)
        }
    }
}
```

## 기능 간 타입 공유 {id="sharing-types-between-features"}

한 기능이 다른 기능에 직접 의존해서는 안 됩니다. 예를 들어 `:feature:profile`에 현재 사용자가 필요한 경우, core 모듈의 인터페이스에 의존하도록 하고 구현체는 해당 구현체가 위치한 모듈에서 바인딩합니다.

```kotlin
// Gradle 모듈 ":core:domain"
interface UserRepository {
    suspend fun currentUser(): User
}
```

**Compiler Plugin DSL**
```kotlin
// Gradle 모듈 ":core:data"
internal class UserRepositoryImpl(private val api: ApiService) : UserRepository

val dataModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
}
```

**Annotations**
```kotlin
// Gradle 모듈 ":core:data"
@Singleton
internal class UserRepositoryImpl(private val api: ApiService) : UserRepository
```

**Constructor / Classic DSL**
```kotlin
// Gradle 모듈 ":core:data"
internal class UserRepositoryImpl(private val api: ApiService) : UserRepository

val dataModule = module {
    singleOf(::UserRepositoryImpl) bind UserRepository::class
}
```

그러면 `:feature:profile`의 `ProfileViewModel(private val users: UserRepository)`은 런타임에 `UserRepositoryImpl`을 주입받아 해결(resolve)합니다. 모든 Koin 모듈이 로드되어 있는 한 Koin은 Gradle 모듈 전반에 걸쳐 의존성을 해결할 수 있으므로, 기능 모듈은 인터페이스 타입만 알고 있으면 됩니다. 기능별로 별도의 진입점 인터페이스나 컴포넌트를 만들 필요가 없습니다.

Compiler Plugin을 사용하는 경우 기능 모듈에는 자체 `startKoin`이 없으므로, `:app`이 컴파일되고 전체 그래프를 구성할 때 종속성이 검사됩니다. 자세한 내용은 [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety)를 참고하세요.

## 동적 기능 모듈 (Dynamic feature modules) {id="dynamic-feature-modules"}

Play Feature Delivery를 사용할 경우 기본(base) 앱은 동적 기능 모듈의 코드를 참조할 수 없습니다. 의존성 방향이 기능 모듈에서 기본 앱으로 향하기 때문입니다. 이 경우 해당 기능의 진입 Activity에서 `loadKoinModules()`를 사용하여 기능 모듈 자체에서 Koin 모듈을 로드합니다.

```kotlin
// 동적 기능 모듈 ":feature:premium"
internal object PremiumKoin {
    private val modules = lazy { loadKoinModules(premiumModule) }
    fun load() = modules.value
}

class PremiumActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        PremiumKoin.load()
        super.onCreate(savedInstanceState)
    }
}
```

`lazy`를 사용하면 프로세스당 한 번, 그리고 `super.onCreate()`가 호출되기 전에 모듈이 로드되도록 보장합니다. 이 두 가지가 모두 중요한 이유와 모듈을 언로드(unload)하는 방법은 [Starting Koin on Android](/docs/reference/koin-android/start#loading-modules-after-start)에서 다룹니다.

Compiler Plugin은 이러한 방식으로 로드된 모듈을 감지할 수 없습니다. 기본 앱에서 사용되지만 동적 기능 모듈에서만 제공되는 타입은 `@Provided`로 표시해야 합니다([Compile-Time Safety](/docs/reference/koin-compiler/compile-safety) 참고).

## 기능 모듈 테스트 {id="testing-feature-modules"}

다른 모듈이 제공하는 항목에 대해서는 페이크(fake)를 사용하여 각 기능 모듈을 독립적으로 테스트하세요. Compiler Plugin을 사용하면 빌드 타임에 전체 그래프가 검사됩니다. 플러그인을 사용하지 않는 경우에는 `verify()`를 통해 각 모듈을 검사하세요([Verifying your Configuration](/docs/reference/koin-test/verify) 참고). Koin을 활용한 단위 테스트는 [Unit Testing](/docs/reference/koin-test/testing)에서, 온디바이스(on-device) 테스트는 [Instrumented Testing](/docs/reference/koin-android/instrumented-testing)에서 다룹니다.

## 관련 문서 {id="related"}

- [Modules](/docs/reference/koin-core/modules): `includes()`, 모듈 가시성(visibility) 및 `@Configuration` 탐색.
- [Starting Koin on Android](/docs/reference/koin-android/start): `startKoin` 및 런타임 모듈 로드.
- [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety): Gradle 모듈 전반에 걸쳐 그래프를 검사하는 방법.
- [Lazy Modules](/docs/reference/koin-core/lazy-modules): 앱 시작 시 백그라운드에서 기능 모듈 로드.
- [Android Library Integration](/docs/reference/koin-android/binding-patterns): data, domain 및 UI 레이어.