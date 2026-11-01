---
title: Hilt에서 마이그레이션하기
---

# Hilt에서 마이그레이션하기

이 가이드에서는 Android 앱을 Dagger Hilt에서 Koin으로 단계별로 이전하는 방법을 다룹니다: Gradle, `Application` 클래스, 모듈, 바인딩, ViewModel, 진입점(entry points), 한정자(qualifiers), Compose 및 테스트. 각 Koin 예제는 세 가지 Koin 스타일로 제공됩니다. 어떤 스타일을 선택해야 할지 확실하지 않다면 [스타일 선택하기](/docs/intro/choosing-your-style)를 참고하세요. 두 프레임워크의 비교는 [Koin vs Hilt](/docs/intro/koin-vs-hilt)를 참조하세요.

:::note
실제 환경에서의 전체 마이그레이션 사례를 보려면 [Migrating Now in Android to Koin](https://blog.insert-koin.io/migrating-now-in-android-to-koin-annotations-2-3-67d252dbb97d)을 읽어보세요. 30개의 Gradle 모듈로 구성된 Google의 샘플 앱을 Hilt에서 Koin Annotations로 이전한 과정을 다룹니다.
:::

## 개념 매핑 {id="concept-mapping"}

| Hilt | Compiler Plugin DSL | Annotations | Constructor / Classic DSL |
|------|---------------------|-------------|-------------|
| `@HiltAndroidApp` | `Application.onCreate()`에서 `startKoin { }` | `@KoinApplication` + `startKoin<T>()` | `Application.onCreate()`에서 `startKoin { }` |
| `@AndroidEntryPoint` | 불필요: `by inject()`, `by viewModel()` | 불필요 | 불필요 |
| `@Inject constructor` | `single<T>()` / `factory<T>()` | 클래스에 `@Singleton` / `@Factory` | `singleOf(::T)` / `factoryOf(::T)` |
| `@Module` + `@InstallIn` | `module { }` | `@Module` + `@ComponentScan` | `module { }` |
| `@Provides` | `single { create(::fn) }` | 함수에 `@Singleton` / `@Factory` | `single { ... }` |
| `@Binds` | `bind Interface::class` | 자동 (상위 타입) 또는 `binds = [...]` | `bind Interface::class` |
| `@Singleton` | `single` | `@Singleton` / `@Single` | `single` |
| `@HiltViewModel` | `viewModel<T>()` | `@KoinViewModel` | `viewModelOf(::T)` |
| `@HiltWorker` | `worker<T>()` | `@KoinWorker` | `workerOf(::T)` |
| `@Named`, 커스텀 `@Qualifier` | `named("x")`, 파라미터에 `@Named` | `@Named`, 커스텀 `@Qualifier` | `named("x")` |
| `@ApplicationContext` | `androidContext()`로 제공되는 `Context` 파라미터 | 동일 | `androidContext()` |
| `@AssistedInject` | 주입 파라미터 (Injected parameters) | `@InjectedParam` | 주입 파라미터 (Injected parameters) |
| 직접 작성한 클래스의 `@Inject` 필드 | 생성자 파라미터 | 생성자 파라미터 | 생성자 파라미터 |
| `@EntryPoint` (Hilt가 주입할 수 없는 프레임워크 클래스) | 해당 진입점에서만 `KoinComponent` | 동일 | 동일 |
| `@HiltAndroidTest` | `KoinTestRule` | `KoinTestRule` | `KoinTestRule` |

### 스코프 매핑 {id="scope-mapping"}

| Hilt | Koin DSL | Annotations | 수명 주기 (Lifetime) |
|------|----------|-------------|----------|
| `@Singleton` (`SingletonComponent`) | `single` | `@Singleton` | Application |
| `@ActivityRetainedScoped` | `activityRetainedScope { }` | `@ActivityRetainedScope` | Configuration 변경 시에도 유지 |
| `@ViewModelScoped` | `viewModelScope { }` | `@ViewModelScope` | ViewModel |
| `@ActivityScoped` | `activityScope { }` | `@ActivityScope` | Activity |
| `@FragmentScoped` | `fragmentScope { }` | `@FragmentScope` | Fragment |

스코프 DSL 및 어노테이션에 대한 자세한 내용은 [Android Scopes](/docs/reference/koin-android/scope)에서 확인할 수 있습니다.

## 1단계: Gradle {id="step-1-gradle"}

Hilt 플러그인, `hilt-android`, `hilt-compiler`(kapt 또는 KSP)를 제거합니다. 그런 다음 Koin을 추가합니다:

```kotlin
dependencies {
    implementation(platform("io.insert-koin:koin-bom:$koin_version"))
    implementation("io.insert-koin:koin-android")
    implementation("io.insert-koin:koin-androidx-compose") // Compose를 사용하는 경우
}
```

Compiler Plugin DSL 또는 어노테이션을 사용하려면 [Koin Compiler Plugin](/docs/setup/compiler-plugin)도 적용해야 합니다. 이는 Kotlin 컴파일러 내부에서 실행되며 Koin을 위한 kapt 또는 KSP를 대체합니다. 아티팩트 전체 목록은 [Gradle 설정](/docs/setup/gradle)에서 확인할 수 있습니다.

## 2단계: Application 클래스 {id="step-2-application-class"}

Hilt:

```kotlin
@HiltAndroidApp
class MyApplication : Application()
```

Koin:

**Compiler Plugin DSL**
```kotlin
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidLogger()
            androidContext(this@MyApplication)
            modules(appModule)
        }
    }
}
```

**Annotations**
```kotlin
import org.koin.plugin.module.dsl.startKoin

@KoinApplication
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin<MyApplication> {
            androidLogger()
            androidContext(this@MyApplication)
        }
    }
}
```

`@KoinApplication`은 `@Configuration`이 지정된 모든 모듈을 로드합니다. 모듈을 명시적으로 나열하려면 `@KoinApplication(modules = [AppModule::class])`를 사용합니다.

**Constructor / Classic DSL**
```kotlin
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidLogger()
            androidContext(this@MyApplication)
            modules(appModule)
        }
    }
}
```

`androidContext()`는 모든 정의에서 `Context`를 사용할 수 있도록 합니다. 자세한 내용은 [Android에서 Koin 시작하기](/docs/reference/koin-android/start)를 참조하세요.

## 3단계: 모듈과 @Provides {id="step-3-modules-and-provides"}

Hilt:

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient = OkHttpClient.Builder().build()

    @Provides
    @Singleton
    fun provideApiService(client: OkHttpClient): ApiService =
        Retrofit.Builder()
            .baseUrl("https://api.example.com")
            .client(client)
            .build()
            .create(ApiService::class.java)
}
```

Koin:

**Compiler Plugin DSL**
```kotlin
import org.koin.plugin.module.dsl.create

fun okHttpClient(): OkHttpClient = OkHttpClient.Builder().build()

fun apiService(client: OkHttpClient): ApiService =
    Retrofit.Builder()
        .baseUrl("https://api.example.com")
        .client(client)
        .build()
        .create(ApiService::class.java)

val networkModule = module {
    single { create(::okHttpClient) }
    single { create(::apiService) }
}
```

**Annotations**
```kotlin
@Module
class NetworkModule {

    @Singleton
    fun okHttpClient(): OkHttpClient = OkHttpClient.Builder().build()

    @Singleton
    fun apiService(client: OkHttpClient): ApiService =
        Retrofit.Builder()
            .baseUrl("https://api.example.com")
            .client(client)
            .build()
            .create(ApiService::class.java)
}
```

**Constructor / Classic DSL**
```kotlin
val networkModule = module {
    single { OkHttpClient.Builder().build() }
    single {
        Retrofit.Builder()
            .baseUrl("https://api.example.com")
            .client(get())
            .build()
            .create(ApiService::class.java)
    }
}
```

Koin에는 `@InstallIn`이 없습니다. 정의의 수명 주기는 설치된 컴포넌트가 아니라 해당 타입(`single`, `factory`, `scoped`)에 따라 결정됩니다. `@Inject constructor`가 있는 클래스는 `single<T>()` / `factory<T>()`, 클래스 어노테이션, 또는 `singleOf(::T)`로 변환됩니다. 라이브러리 객체에 대한 자세한 내용은 [정의(Definitions)](/docs/reference/koin-core/definitions#classes-you-dont-own)를 참조하세요.

## 4단계: 인터페이스 바인딩 {id="step-4-interface-bindings"}

Hilt:

```kotlin
@Module
@InstallIn(SingletonComponent::class)
abstract class DataModule {
    @Binds
    @Singleton
    abstract fun bindUserRepository(impl: UserRepositoryImpl): UserRepository
}
```

Koin:

**Compiler Plugin DSL**
```kotlin
val dataModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
}
```

**Annotations**
```kotlin
@Singleton
class UserRepositoryImpl(private val api: ApiService) : UserRepository
```

해당 클래스는 모든 상위 타입에 바인딩됩니다. 특정 타입에만 바인딩하려면 `@Singleton(binds = [UserRepository::class])`를 사용하세요.

**Constructor / Classic DSL**
```kotlin
val dataModule = module {
    singleOf(::UserRepositoryImpl) bind UserRepository::class
}
```

## 5단계: ViewModel {id="step-5-viewmodels"}

Hilt:

```kotlin
@HiltViewModel
class UserViewModel @Inject constructor(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel()
```

Koin:

**Compiler Plugin DSL**
```kotlin
class UserViewModel(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel()

val appModule = module {
    viewModel<UserViewModel>()
}
```

**Annotations**
```kotlin
@KoinViewModel
class UserViewModel(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel()
```

**Constructor / Classic DSL**
```kotlin
class UserViewModel(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel()

val appModule = module {
    viewModelOf(::UserViewModel)
}
```

Koin은 ViewModel 정의에 `SavedStateHandle`을 제공합니다. Activity 또는 Fragment에서는 `by viewModels()`를 `by viewModel()`로 교체합니다. Compose에서는 `hiltViewModel()`을 `koinViewModel()`로 교체합니다. 자세한 내용은 [Android ViewModel](/docs/reference/koin-android/viewmodel)을 참조하세요.

## 6단계: Activity, Fragment 및 기타 진입점 {id="step-6-activities-fragments-and-other-entry-points"}

Hilt:

```kotlin
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    @Inject lateinit var analytics: Analytics
}
```

Koin:

```kotlin
class MainActivity : ComponentActivity() {
    private val analytics: Analytics by inject()
}
```

`@AndroidEntryPoint`를 제거합니다. 프레임워크가 생성하는 Activity, Fragment 및 기타 Android 컴포넌트에서 `@Inject lateinit var` 필드는 `by inject()`(lazy) 또는 `get()`(즉시)으로 변환됩니다. 이는 모든 스타일에서 동일합니다. Service, BroadcastReceiver 및 기타 컴포넌트에 대한 내용은 [진입점(Entry Points)](/docs/reference/koin-android/entry-points)에서 다룹니다.

직접 작성한 클래스(repository, service, use case, ViewModel)의 경우, `@Inject` 필드를 생성자 파라미터로 이동하고 [3단계](#step-3-modules-and-provides)와 같이 클래스를 선언합니다. 이러한 클래스는 `get()`이나 `by inject()`를 직접 호출하지 않습니다:

```kotlin
// Hilt: 직접 작성한 클래스에서의 필드 주입
class SyncService @Inject constructor() {
    @Inject lateinit var repository: UserRepository
}

// Koin: 생성자 주입
class SyncService(private val repository: UserRepository)
```

Hilt의 `@EntryPoint`는 `ContentProvider`나 라이브러리 콜백과 같이 Hilt가 주입할 수 없는 프레임워크 클래스를 위해 존재합니다. 이러한 진입점에서만 [KoinComponent](/docs/reference/koin-core/koin-component)를 구현하고 `by inject()`를 호출하세요. 일반 앱 클래스의 `@Inject` 필드를 대체하기 위해 `KoinComponent`를 사용해서는 안 됩니다.

## 7단계: 한정자(Qualifiers) {id="step-7-qualifiers"}

Hilt:

```kotlin
@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class IoDispatcher

@Provides
@IoDispatcher
fun provideIoDispatcher(): CoroutineDispatcher = Dispatchers.IO

class SyncRepository @Inject constructor(
    @IoDispatcher private val dispatcher: CoroutineDispatcher,
)
```

Koin:

**Compiler Plugin DSL**
```kotlin
import org.koin.core.annotation.Named

class SyncRepository(
    @Named("io") private val dispatcher: CoroutineDispatcher,
)

val dispatcherModule = module {
    single<CoroutineDispatcher>(named("io")) { Dispatchers.IO }
    single<SyncRepository>()
}
```

**Annotations**
기존 한정자 어노테이션을 그대로 유지합니다. Koin은 `@Qualifier`(Koin 자체 어노테이션, `jakarta.inject` 또는 `javax.inject`)로 표시된 커스텀 어노테이션을 인식합니다:

```kotlin
import javax.inject.Qualifier

@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class IoDispatcher

@Module
class DispatcherModule {
    @Singleton
    @IoDispatcher
    fun ioDispatcher(): CoroutineDispatcher = Dispatchers.IO
}

@Singleton
class SyncRepository(
    @IoDispatcher private val dispatcher: CoroutineDispatcher,
)
```

**Constructor / Classic DSL**
```kotlin
val dispatcherModule = module {
    single<CoroutineDispatcher>(named("io")) { Dispatchers.IO }
    single { SyncRepository(get(named("io"))) }
}
```

타입 한정자(`named<IoDispatcher>()`) 및 기타 모든 옵션은 [한정자(Qualifiers)](/docs/reference/koin-core/qualifiers)에서 확인할 수 있습니다. Hilt의 `@ApplicationContext`는 한정자가 필요하지 않으며, `Context` 파라미터는 `androidContext()`에 전달된 컨텍스트를 주입받습니다.

## 8단계: Compose {id="step-8-compose"}

Hilt는 Composable에서 ViewModel이 아닌 의존성에 접근하기 위해 진입점이 필요합니다. Koin은 이를 직접 해결합니다:

```kotlin
@Composable
fun UserScreen(viewModel: UserViewModel = koinViewModel()) {
    val analytics: Analytics = koinInject()
}
```

자세한 내용은 [Koin for Compose](/docs/reference/koin-compose/compose)를 참조하세요.

## 9단계: 테스트 {id="step-9-tests"}

Hilt:

```kotlin
@HiltAndroidTest
class UserRepositoryTest {
    @get:Rule
    val hiltRule = HiltAndroidRule(this)

    @Inject lateinit var repository: UserRepository

    @Before
    fun init() = hiltRule.inject()
}
```

Koin:

```kotlin
class UserRepositoryTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(appModule, testModule)
    }

    private val repository: UserRepository by inject()
}
```

Hilt의 `@TestInstallIn` 및 `@UninstallModules`는 프로덕션 모듈 다음에 로드되는 테스트 모듈로 대체됩니다. `HiltTestApplication` 및 Hilt 테스트 러너는 제거합니다. [단위 테스트](/docs/reference/koin-test/testing) 및 [Android 계측 테스트(Instrumented Testing)](/docs/reference/koin-android/instrumented-testing)를 참조하세요.

## @Inject를 사용하여 점진적으로 마이그레이션하기 {id="migrate-gradually-with-inject"}

어노테이션 방식을 사용할 경우, Compiler Plugin은 JSR-330 어노테이션을 지원합니다. `@ComponentScan` 대상 패키지 내에서 `@Inject constructor`가 있는 클래스는 factory가 되고, `@Singleton`(`jakarta.inject` 또는 `javax.inject`)이 지정된 클래스는 single이 됩니다. 따라서 이러한 클래스들을 수정하지 않고 그대로 유지하면서 Gradle 모듈 단위로 점진적인 마이그레이션을 진행할 수 있습니다. 자세한 내용은 [JSR-330 Annotations](/docs/reference/koin-android/jsr330)을 참조하세요.

## 멀티 모듈 프로젝트 {id="multi-module-projects"}

각 Gradle 모듈은 자체 Koin 모듈을 선언하고, 앱 모듈은 `startKoin`에서 이들을 모두 로드합니다. 설정해야 할 컴포넌트 계층 구조가 없으며, 모듈 간 접근을 위한 `@EntryPoint`도 필요하지 않습니다. `:feature:home`에 있는 정의는 앱에 로드된 모든 정의를 사용할 수 있습니다.

어노테이션 방식을 사용할 경우, 각 피처 모듈 클래스에 `@Module`, `@ComponentScan`, `@Configuration`을 지정합니다. 앱 모듈의 `@KoinApplication`은 이들을 일일이 나열하지 않고도 찾아냅니다.

모듈 구성, 가시성 및 피처 모듈에 대한 내용은 [멀티 모듈 앱](/docs/reference/koin-android/multi-module)에서 다룹니다.

## 자주 사용되는 패턴 {id="common-patterns"}

### 지원 주입 (Assisted injection) {id="assisted-injection"}

Hilt의 `@AssistedInject` 및 `@AssistedFactory`는 주입 파라미터(injected parameters)로 변환됩니다. 호출자가 런타임 값을 전달합니다:

**Compiler Plugin DSL**
```kotlin
class UserDetailViewModel(
    @InjectedParam private val userId: String,
    private val repository: UserRepository,
) : ViewModel()

val appModule = module {
    viewModel<UserDetailViewModel>()
}
```

**Annotations**
```kotlin
@KoinViewModel
class UserDetailViewModel(
    @InjectedParam private val userId: String,
    private val repository: UserRepository,
) : ViewModel()
```

**Constructor / Classic DSL**
```kotlin
class UserDetailViewModel(
    private val userId: String,
    private val repository: UserRepository,
) : ViewModel()

val appModule = module {
    viewModel { (userId: String) -> UserDetailViewModel(userId, get()) }
}
```

```kotlin
val viewModel: UserDetailViewModel by viewModel { parametersOf("user-42") }
```

자세한 내용은 [주입 파라미터(Injected Parameters)](/docs/reference/koin-core/injection-parameters)를 참조하세요.

### Lazy 및 Provider {id="lazy-and-provider"}

- `dagger.Lazy<T>`: Kotlin의 `Lazy<T>` 생성자 파라미터를 사용하거나, Android 진입점에서 `by inject()`를 사용합니다([주입(Injection)](/docs/reference/koin-core/injection) 참조).
- `Provider<T>`: 직접 작성한 클래스에서 호출할 때마다 새 인스턴스를 생성하려면 [고급 패턴(Advanced Patterns)](/docs/reference/koin-core/advanced-patterns)의 provider 패턴을 사용하세요.

### WorkManager {id="workmanager"}

`@HiltWorker` 워커는 `worker` 정의로 변환되며, `HiltWorkerFactory`는 `startKoin`의 `workManagerFactory()`로 변환됩니다. 자세한 내용은 [WorkManager](/docs/reference/koin-android/workmanager)를 참조하세요.

## 체크리스트 {id="checklist"}

- [ ] Gradle: Hilt 플러그인, `hilt-android`, `hilt-compiler`를 제거합니다. Koin을 추가하고, 사용하는 경우 Compiler Plugin을 추가합니다. 다른 용도로 필요하지 않다면 kapt를 제거합니다.
- [ ] Application: `@HiltAndroidApp`을 제거하고, `onCreate()`에서 `androidContext()`와 함께 Koin을 시작합니다.
- [ ] 모듈: `@Module` / `@InstallIn` / `@Provides` / `@Binds`를 Koin 모듈로 변환합니다.
- [ ] ViewModel: `@HiltViewModel`을 제거하고 선언한 뒤, `by viewModel()` / `koinViewModel()`을 사용합니다.
- [ ] 진입점: `@AndroidEntryPoint`를 제거하고, Android 컴포넌트에서 `by inject()`를 사용합니다. 직접 작성한 클래스의 `@Inject` 필드는 생성자 파라미터로 이동합니다. Koin이 생성할 수 없는 프레임워크 클래스에서만 `@EntryPoint`를 `KoinComponent`로 교체합니다.
- [ ] 한정자: 커스텀 `@Qualifier` 어노테이션을 유지(어노테이션 스타일)하거나 `named()`로 전환합니다.
- [ ] 워커: `@HiltWorker` 및 `HiltWorkerFactory`를 교체합니다.
- [ ] 테스트: `@HiltAndroidTest`, `HiltAndroidRule`, Hilt 테스트 러너를 제거하고 `KoinTestRule`을 사용합니다.
- [ ] 빌드: Compiler Plugin을 사용할 경우 빌드가 성공하면 그래프가 완전함을 의미합니다. 사용하지 않는 경우 [verify()](/docs/reference/koin-test/verify) 테스트를 추가합니다.
- [ ] 실행: 앱과 테스트 스위트를 실행합니다.

## 문제 해결 {id="troubleshooting"}

### NoDefinitionFoundException {id="nodefinitionfoundexception"}

Koin에 요청된 타입에 대한 정의가 없습니다. 해당 정의를 선언한 모듈이 `startKoin`에 로드되었는지(또는 `@Configuration`에 의해 발견되었는지), 요청된 타입이 선언되거나 바인딩된 타입과 일치하는지 확인하세요. `@Inject constructor`만 가지고 Hilt를 통해 주입되던 클래스는 `@ComponentScan`이 JSR-330 어노테이션을 통해 감지하지 않는 한 Koin 정의도 필요합니다.

### 동일한 타입의 두 정의로 인해 잘못된 인스턴스가 주입되는 경우 {id="wrong-instance-with-two-definitions-of-the-same-type"}

Hilt에서는 한정자 누락 시 빌드 오류가 발생합니다. Koin에서는 `allowOverride(false)`로 시작하지 않는 한 마지막으로 로드된 정의가 우선 적용됩니다. 두 정의와 주입 지점에 [한정자(qualifier)](/docs/reference/koin-core/qualifiers)를 추가하세요.

### 순환 의존성 (Circular dependency) {id="circular-dependency"}

두 클래스가 서로 의존하고 있습니다. 순환을 끊도록 리팩터링하거나 `Lazy<T>` 파라미터를 사용하여 한쪽을 지연(lazy) 처리하세요. Compiler Plugin은 빌드 시점에 순환 의존성을 보고합니다. 자세한 내용은 [문제 해결(Troubleshooting)](/docs/reference/koin-core/troubleshooting)을 참조하세요.

## 관련 문서 {id="related"}

- [Koin vs Hilt](/docs/intro/koin-vs-hilt): 두 프레임워크 간의 차이점.
- [JSR-330 Annotations](/docs/reference/koin-android/jsr330): 마이그레이션 중에 `@Inject` 및 `@Singleton` 유지하기.
- [Starting Koin on Android](/docs/reference/koin-android/start): `startKoin`, `androidContext()` 및 로깅.
- [Android Scopes](/docs/reference/koin-android/scope): Activity, Fragment 및 ViewModel 스코프.
- [Unit Testing](/docs/reference/koin-test/testing): Hilt 테스트 룰 교체하기.
- [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety): Compiler Plugin이 검증하는 항목.