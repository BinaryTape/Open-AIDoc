---
title: 정의
---

# 정의

정의(definition)는 특정 타입을 생성하는 방법과 해당 인스턴스를 유지할 기간을 Koin에 알려줍니다. 이 문서에서는 정의 유형, 인터페이스 바인딩, 생성자 파라미터가 확인(resolve)되는 방식, 직접 소유하지 않은 클래스에 대한 정의를 다룹니다. 모듈이 무엇인지 이미 알고 있다고 가정합니다([핵심 개념](/docs/intro/core-concepts) 참조).

코드 예제는 컴파일러 플러그인 DSL(Compiler Plugin DSL), 애너테이션(Annotations), 생성자 / 클래식 DSL(Constructor / Classic DSL)의 세 가지 탭으로 제공됩니다. 원하는 방식을 선택할 수 있으며, 이 선택은 모든 페이지에 적용됩니다. 어떤 스타일을 사용해야 할지 잘 모르겠다면 [스타일 선택하기](/docs/intro/choosing-your-style)를 읽어보세요.

## 정의 유형 {id="definition-types"}

| 타입 | 인스턴스 | 일반적인 용도 |
|------|----------|-------------|
| `single` | Koin 컨테이너의 수명 주기 동안 유지되는 단일 인스턴스 | 리포지토리(Repository), API 클라이언트, 데이터베이스 |
| `factory` | 요청될 때마다 새로 생성되는 인스턴스 | 프레젠터(Presenter), 유스케이스(Use case), 수명이 짧은 객체 |
| `scoped` | 스코프(scope)당 하나의 인스턴스, 스코프가 닫힐 때 해제됨 | Activity, 세션, 요청에 바인딩된 객체 |
| `viewModel` | ViewModel 수명 주기에 의해 관리됨 | ViewModel (Android 및 Compose Multiplatform) |
| `worker` | WorkManager에 의해 생성됨 | Android `ListenableWorker` |

선언 방법:

**Compiler Plugin DSL**
```kotlin
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

val appModule = module {
    single<Database>()
    single<UserRepository>()
    factory<UserPresenter>()
    viewModel<UserViewModel>()
}
```

**Annotations**
```kotlin
@Singleton
class Database

@Singleton
class UserRepository(private val database: Database)

@Factory
class UserPresenter(private val repository: UserRepository)

@KoinViewModel
class UserViewModel(private val repository: UserRepository) : ViewModel()
```

`@Singleton`과 `@Single`은 동일합니다. JSR-330 명칭인 `@Singleton`을 권장합니다.

**Constructor / Classic DSL**
```kotlin
import org.koin.dsl.module
import org.koin.core.module.dsl.*

val appModule = module {
    singleOf(::Database)
    singleOf(::UserRepository)
    factoryOf(::UserPresenter)
    viewModelOf(::UserViewModel)
}
```

각 의존성에 `get()`을 사용하여 생성자 호출을 직접 작성할 수도 있습니다:

```kotlin
val appModule = module {
    single { Database() }
    single { UserRepository(get()) }
    factory { UserPresenter(get()) }
    viewModel { UserViewModel(get()) }
}
```

컴파일러 플러그인 DSL과 애너테이션을 사용하면 `get()`을 작성할 필요가 없습니다. [Koin 컴파일러 플러그인](/docs/intro/koin-compiler-plugin)이 생성자를 읽어 자동으로 호출 코드를 생성하고, 빌드 시점에 모든 의존성이 선언되어 있는지 검사합니다.

`single`과 `factory`는 위에서 설명했습니다. `scoped`는 스코프 선언이 필요합니다. [Scopes](/docs/reference/koin-core/scopes)를 참조하세요. `viewModel`은 별도의 페이지가 있습니다. [ViewModel](/docs/reference/koin-core/viewmodel)을 참조하세요. `worker`는 [WorkManager](/docs/reference/koin-android/workmanager)에서 다룹니다.

### Single 또는 factory? {id="single-or-factory"}

호출자별 상태가 없고 생성 비용이 큰 객체(데이터베이스, HTTP 클라이언트)에는 `single`을 사용하세요. 각 호출자마다 고유한 인스턴스가 필요하거나 공유해서는 안 되는 상태를 유지하는 객체에는 `factory`를 사용하세요. 인스턴스가 팩토리보다는 오래 유지되어야 하지만 애플리케이션보다는 짧게 유지되어야 한다면 [스코프(scope)](/docs/reference/koin-core/scopes)가 필요합니다.

## 인터페이스 바인딩 {id="interface-binding"}

대부분의 경우, 소비자는 구현체가 아닌 인터페이스에 의존합니다. 다음과 같이 구현체를 인터페이스에 바인딩합니다:

**Compiler Plugin DSL**
```kotlin
val dataModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class

    // 한 번에 여러 타입 바인딩
    single<MyServiceImpl>() binds arrayOf(ServiceA::class, ServiceB::class)
}
```

**Annotations**
```kotlin
@Singleton
class UserRepositoryImpl(private val database: Database) : UserRepository
```

바인딩은 자동으로 이루어집니다. Koin은 클래스를 모든 상위 타입에 바인딩합니다. 그중 일부만 바인딩하려면 다음과 같이 목록을 지정하세요:

```kotlin
@Singleton(binds = [UserRepository::class])
class UserRepositoryImpl(private val database: Database) : UserRepository, Closeable
```

**Constructor / Classic DSL**
```kotlin
val dataModule = module {
    singleOf(::UserRepositoryImpl) bind UserRepository::class

    // 또는 인터페이스 타입을 직접 선언
    single<UserRepository> { UserRepositoryImpl(get()) }
}
```

그러면 소비자가 `UserRepository`를 요청할 때 `UserRepositoryImpl` 인스턴스를 받게 됩니다. 두 정의가 동일한 타입을 바인딩하는 경우, 이를 구분하기 위해 [한정자(qualifier)](/docs/reference/koin-core/qualifiers)가 필요합니다.

## 생성자 파라미터 {id="constructor-parameters"}

Koin은 컨테이너에서 각 생성자 파라미터를 확인(resolve)합니다. 파라미터 타입에 따라 확인 방식이 결정됩니다:

| 파라미터 | 확인 방식 | 세부 정보 |
|-----------|-------------|--------|
| `repository: UserRepository` | `UserRepository` 정의. 누락된 경우 실패 | |
| `logger: Logger?` | 정의가 존재하는 경우 해당 정의, 없으면 `null` | |
| `heavy: Lazy<HeavyService>` | `heavy.value`에 처음 접근할 때 생성됨 | [Injection](/docs/reference/koin-core/injection) |
| `loggers: List<Logger>` | `Logger`에 바인딩된 모든 정의 | [Advanced Patterns](/docs/reference/koin-core/advanced-patterns#collections-of-dependencies) |
| `@Named("local") db: Database` | 해당 한정자가 지정된 정의 | [Qualifiers](/docs/reference/koin-core/qualifiers) |
| `@InjectedParam userId: String` | 확인 시점에 호출자가 전달한 값 | [Injected Parameters](/docs/reference/koin-core/injection-parameters) |
| `@Property("api_url") url: String` | Koin 프로퍼티 | [Starting Koin](/docs/reference/koin-core/starting-koin#properties) |

컴파일러 플러그인 DSL과 애너테이션을 사용하면 생성자 시그니처만으로 이 작업이 처리됩니다:

**Compiler Plugin DSL**
```kotlin
class SyncService(
    private val repository: UserRepository,
    private val analytics: Analytics?,
    private val uploader: Lazy<Uploader>,
)

val appModule = module {
    single<SyncService>()
}
```

**Annotations**
```kotlin
@Singleton
class SyncService(
    private val repository: UserRepository,
    private val analytics: Analytics?,
    private val uploader: Lazy<Uploader>,
)
```

**Constructor / Classic DSL**
`singleOf(::SyncService)`는 `get()`을 사용하여 모든 파라미터를 확인합니다. nullable, lazy 또는 list 파라미터의 경우 일치하는 함수를 사용하여 직접 호출을 작성하세요:

```kotlin
val appModule = module {
    single {
        SyncService(
            repository = get(),
            analytics = getOrNull(),
            uploader = inject(),
        )
    }
}
```

`getAll()`은 `List`를 반환하고, `getProperty("key")`는 프로퍼티를 읽으며, `params.get()`은 주입된 파라미터를 읽습니다.

## 직접 소유하지 않은 클래스 {id="classes-you-don-t-own"}

라이브러리 클래스(Room, Retrofit, OkHttp)는 애너테이션을 추가할 수 없으며 보통 빌더를 통해 생성됩니다. Koin이 파라미터를 확인하는 함수를 통해 이를 선언할 수 있습니다:

**Compiler Plugin DSL**
```kotlin
import org.koin.plugin.module.dsl.create

fun database(context: Context): AppDatabase =
    Room.databaseBuilder(context, AppDatabase::class.java, "app-db").build()

fun topicDao(db: AppDatabase): TopicDao = db.topicDao()

val databaseModule = module {
    single { create(::database) }
    single { create(::topicDao) }
}
```

`create(::function)`은 생성자와 마찬가지로 동일한 컴파일 타임 검사를 거쳐 함수 파라미터를 확인합니다. 함수 및 해당 파라미터에 한정자 애너테이션을 사용하는 것도 가능합니다.

**Annotations**
최상위(top-level) 함수에 애너테이션을 추가하세요. `@ComponentScan`이 클래스와 마찬가지로 함수를 찾아냅니다:

```kotlin
@Singleton
fun database(context: Context): AppDatabase =
    Room.databaseBuilder(context, AppDatabase::class.java, "app-db").build()

@Singleton
fun topicDao(db: AppDatabase): TopicDao = db.topicDao()
```

또는 프로바이더 함수들을 `@Module` 클래스로 그룹화할 수도 있습니다:

```kotlin
@Module
class DatabaseModule {

    @Singleton
    fun database(context: Context): AppDatabase =
        Room.databaseBuilder(context, AppDatabase::class.java, "app-db").build()

    @Singleton
    fun topicDao(db: AppDatabase): TopicDao = db.topicDao()
}
```

**Constructor / Classic DSL**
```kotlin
val databaseModule = module {
    single {
        Room.databaseBuilder(androidContext(), AppDatabase::class.java, "app-db").build()
    }
    single { get<AppDatabase>().topicDao() }
}
```

Android에서의 완전한 Retrofit, Room 및 직렬화 설정에 대해서는 [Android Library Integration](/docs/reference/koin-android/binding-patterns)을 참조하세요.

## 즉시 생성 {id="eager-creation"}

Koin은 누군가 처음 요청할 때 `single`을 생성합니다. 대신 Koin이 시작될 때 생성하려면 `createdAtStart`로 표시하세요:

**Compiler Plugin DSL**
```kotlin
val appModule = module {
    single<ConfigManager>() withOptions {
        createdAtStart()
    }
}
```

**Annotations**
```kotlin
@Singleton(createdAtStart = true)
class ConfigManager
```

**Constructor / Classic DSL**
```kotlin
val appModule = module {
    single(createdAtStart = true) { ConfigManager() }
}
```

즉시 생성은 Koin을 시작하는 스레드에서 실행됩니다. Android에서는 `Application.onCreate()` 중의 메인 스레드에 해당하므로, 모든 즉시 생성 정의는 앱 시작 시간을 증가시킵니다. 첫 화면이 표시되기 전에 반드시 존재해야 하는 객체에만 사용하세요. 시작 시점의 작업을 줄이려면 [지연 모듈](/docs/reference/koin-core/lazy-modules)을 참조하세요.

## 해제 콜백 {id="release-callback"}

`onClose`는 인스턴스가 해제될 때 실행됩니다. `single`의 경우 Koin이 중지될 때, `scoped`의 경우 스코프가 닫힐 때 실행됩니다.

**Compiler Plugin DSL**
```kotlin
val appModule = module {
    single<Database>() onClose { it?.close() }
}
```

**Annotations**
애너테이션에는 `onClose` 파라미터가 없습니다. 이 정의는 DSL 모듈에 선언하세요.

**Constructor / Classic DSL**
```kotlin
val appModule = module {
    single { Database() } onClose { it?.close() }
}
```

`factory`에 대해서는 `onClose`가 호출되지 않습니다. Koin은 팩토리 인스턴스를 유지하지 않기 때문입니다.

## 정의 재정의(Override) {id="overriding-a-definition"}

두 모듈이 동일한 타입을 선언하면 마지막에 로드된 모듈이 우선합니다:

```kotlin
val prodModule = module {
    single<ApiService> { ProductionApi() }
}

val testModule = module {
    single<ApiService> { FakeApi() }
}

startKoin {
    modules(prodModule, testModule) // ApiService는 FakeApi로 확인됩니다
}
```

이는 테스트에서 유용하지만, 실수로 발생할 경우 버그의 원인이 됩니다. 오버라이드를 명시적으로 만들기 위해 전역적으로 비활성화하고 원하는 항목에만 표시할 수 있습니다:

```kotlin
val testModule = module {
    single<ApiService> { FakeApi() }.override()
}

startKoin {
    allowOverride(false)
    modules(prodModule, testModule)
}
```

`allowOverride(false)`를 설정하면 오버라이드 표시가 되지 않은 중복 정의가 있을 때 시작 시 실패합니다.

## 관련 문서 {id="related"}

- [Modules](/docs/reference/koin-core/modules): 정의를 그룹화하고 `includes()`로 모듈을 구성합니다.
- [Qualifiers](/docs/reference/koin-core/qualifiers): 동일한 타입에 대한 여러 정의.
- [Injection](/docs/reference/koin-core/injection): 생성자 외부에서 인스턴스를 가져옵니다.
- [Scopes](/docs/reference/koin-core/scopes): 수명 주기에 바인딩된 인스턴스.
- [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety): 컴파일러 플러그인이 정의에서 검사하는 항목.
- [DSL Reference](/docs/reference/koin-core/dsl) 및 [Annotations Reference](/docs/reference/koin-annotations/annotations-inventory): 모든 키워드 및 애너테이션 참조.