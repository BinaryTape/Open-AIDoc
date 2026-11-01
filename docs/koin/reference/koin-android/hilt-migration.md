---
title: 从 Hilt 迁移
---

# 从 Hilt 迁移

本指南将引导你逐步将 Android 应用从 Dagger Hilt 迁移到 Koin：Gradle、`Application` 类、模块、绑定、ViewModel、入口点、限定符、Compose 以及测试。每个 Koin 示例均提供了三种 Koin 风格；如果不确定选择哪一种，请阅读[选择你的风格](/docs/intro/choosing-your-style)。有关这两个框架的对比，请参阅 [Koin vs Hilt](/docs/intro/koin-vs-hilt)。

:::note
如需查看完整的实际项目迁移案例，请阅读 [Migrating Now in Android to Koin](https://blog.insert-koin.io/migrating-now-in-android-to-koin-annotations-2-3-67d252dbb97d)：Google 包含 30 个 Gradle 模块的示例应用从 Hilt 迁移到 Koin Annotations 的全过程。
:::

## 概念映射 {id="concept-mapping"}

| Hilt | 编译器插件 DSL | 注解 | 构造函数 / 经典 DSL |
|------|---------------------|-------------|-------------|
| `@HiltAndroidApp` | `Application.onCreate()` 中的 `startKoin { }` | `@KoinApplication` + `startKoin<T>()` | `Application.onCreate()` 中的 `startKoin { }` |
| `@AndroidEntryPoint` | 不需要：`by inject()`、`by viewModel()` | 不需要 | 不需要 |
| `@Inject constructor` | `single<T>()` / `factory<T>()` | 类上的 `@Singleton` / `@Factory` | `singleOf(::T)` / `factoryOf(::T)` |
| `@Module` + `@InstallIn` | `module { }` | `@Module` + `@ComponentScan` | `module { }` |
| `@Provides` | `single { create(::fn) }` | 函数上的 `@Singleton` / `@Factory` | `single { ... }` |
| `@Binds` | `bind Interface::class` | 自动（超类型）或 `binds = [...]` | `bind Interface::class` |
| `@Singleton` | `single` | `@Singleton` / `@Single` | `single` |
| `@HiltViewModel` | `viewModel<T>()` | `@KoinViewModel` | `viewModelOf(::T)` |
| `@HiltWorker` | `worker<T>()` | `@KoinWorker` | `workerOf(::T)` |
| `@Named`、自定义 `@Qualifier` | `named("x")`、形参上的 `@Named` | `@Named`、自定义 `@Qualifier` | `named("x")` |
| `@ApplicationContext` | 由 `androidContext()` 提供的 `Context` 形参 | 同左 | `androidContext()` |
| `@AssistedInject` | 注入形参 | `@InjectedParam` | 注入形参 |
| 自有类中的 `@Inject` 字段 | 构造函数形参 | 构造函数形参 | 构造函数形参 |
| `@EntryPoint`（Hilt 无法注入的框架类） | 仅在该入口点使用 `KoinComponent` | 同左 | 同左 |
| `@HiltAndroidTest` | `KoinTestRule` | `KoinTestRule` | `KoinTestRule` |

### 作用域映射 {id="scope-mapping"}

| Hilt | Koin DSL | 注解 | 生命周期 |
|------|----------|-------------|----------|
| `@Singleton`（`SingletonComponent`） | `single` | `@Singleton` | Application |
| `@ActivityRetainedScoped` | `activityRetainedScope { }` | `@ActivityRetainedScope` | 在配置变更后依然保留 |
| `@ViewModelScoped` | `viewModelScope { }` | `@ViewModelScope` | ViewModel |
| `@ActivityScoped` | `activityScope { }` | `@ActivityScope` | Activity |
| `@FragmentScoped` | `fragmentScope { }` | `@FragmentScope` | Fragment |

作用域 DSL 与注解详见 [Android 作用域](/docs/reference/koin-android/scope)。

## 第 1 步：Gradle {id="step-1-gradle"}

移除 Hilt 插件、`hilt-android` 和 `hilt-compiler`（kapt 或 KSP）。然后添加 Koin：

```kotlin
dependencies {
    implementation(platform("io.insert-koin:koin-bom:$koin_version"))
    implementation("io.insert-koin:koin-android")
    implementation("io.insert-koin:koin-androidx-compose") // 如果使用 Compose
}
```

若要使用编译器插件 DSL 或注解，还需应用 [Koin 编译器插件](/docs/setup/compiler-plugin)。它在 Kotlin 编译器内部运行，并为 Koin 替代 kapt 或 KSP。完整的构件列表请参阅 [Gradle 设置](/docs/setup/gradle)。

## 第 2 步：Application 类 {id="step-2-application-class"}

Hilt：

```kotlin
@HiltAndroidApp
class MyApplication : Application()
```

Koin：

**编译器插件 DSL**
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

**注解**
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

`@KoinApplication` 会加载每个标记有 `@Configuration` 的模块。如需显式列出模块，请使用 `@KoinApplication(modules = [AppModule::class])`。

**构造函数 / 经典 DSL**
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

`androidContext()` 使 `Context` 对每个定义均可用。请参阅[在 Android 上启动 Koin](/docs/reference/koin-android/start)。

## 第 3 步：模块与 @Provides {id="step-3-modules-and-provides"}

Hilt：

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

Koin：

**编译器插件 DSL**
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

**注解**
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

**构造函数 / 经典 DSL**
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

这里没有 `@InstallIn`：定义的生命周期取决于其类型（`single`、`factory`、`scoped`），而不是安装它的组件。带有 `@Inject constructor` 的类将转换为 `single<T>()` / `factory<T>()`、类上的注解，或 `singleOf(::T)`。有关库对象的更多内容，请参阅[定义](/docs/reference/koin-core/definitions#classes-you-dont-own)。

## 第 4 步：接口绑定 {id="step-4-interface-bindings"}

Hilt：

```kotlin
@Module
@InstallIn(SingletonComponent::class)
abstract class DataModule {
    @Binds
    @Singleton
    abstract fun bindUserRepository(impl: UserRepositoryImpl): UserRepository
}
```

Koin：

**编译器插件 DSL**
```kotlin
val dataModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
}
```

**注解**
```kotlin
@Singleton
class UserRepositoryImpl(private val api: ApiService) : UserRepository
```

该类会自动绑定到其所有的超类型。若只需绑定部分类型，请使用 `@Singleton(binds = [UserRepository::class])`。

**构造函数 / 经典 DSL**
```kotlin
val dataModule = module {
    singleOf(::UserRepositoryImpl) bind UserRepository::class
}
```

## 第 5 步：ViewModel {id="step-5-viewmodels"}

Hilt：

```kotlin
@HiltViewModel
class UserViewModel @Inject constructor(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel()
```

Koin：

**编译器插件 DSL**
```kotlin
class UserViewModel(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel()

val appModule = module {
    viewModel<UserViewModel>()
}
```

**注解**
```kotlin
@KoinViewModel
class UserViewModel(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel()
```

**构造函数 / 经典 DSL**
```kotlin
class UserViewModel(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel()

val appModule = module {
    viewModelOf(::UserViewModel)
}
```

Koin 会向 ViewModel 定义提供 `SavedStateHandle`。在 Activity 或 Fragment 中，将 `by viewModels()` 替换为 `by viewModel()`。在 Compose 中，将 `hiltViewModel()` 替换为 `koinViewModel()`。请参阅 [Android ViewModel](/docs/reference/koin-android/viewmodel)。

## 第 6 步：Activity、Fragment 与其他入口点 {id="step-6-activities-fragments-and-other-entry-points"}

Hilt：

```kotlin
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    @Inject lateinit var analytics: Analytics
}
```

Koin：

```kotlin
class MainActivity : ComponentActivity() {
    private val analytics: Analytics by inject()
}
```

移除 `@AndroidEntryPoint`。在框架创建的 Activity、Fragment 及其他 Android 组件中，带有 `@Inject lateinit var` 的字段将转换为 `by inject()`（延迟加载）或 `get()`（立即获取）。这在各种风格中都是相同的。Service、BroadcastReceiver 以及其他组件的用法请参阅[入口点](/docs/reference/koin-android/entry-points)。

在你自己的类（仓库、服务、用例、ViewModel）中，将 `@Inject` 字段移至构造函数形参，并按照[第 3 步](#step-3-modules-and-provides)中的方式声明该类。这些类绝不需要调用 `get()` 或 `by inject()`：

```kotlin
// Hilt：自有类中的字段注入
class SyncService @Inject constructor() {
    @Inject lateinit var repository: UserRepository
}

// Koin：构造函数注入
class SyncService(private val repository: UserRepository)
```

Hilt 的 `@EntryPoint` 是为 Hilt 无法注入的框架类（例如 `ContentProvider` 或第三方库回调）而设计的。仅在此类入口点中，才应实现 [KoinComponent](/docs/reference/koin-core/koin-component) 并调用 `by inject()`。切勿使用 `KoinComponent` 来替换应用类中的 `@Inject` 字段。

## 第 7 步：限定符 {id="step-7-qualifiers"}

Hilt：

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

Koin：

**编译器插件 DSL**
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

**注解**
保留你的限定符注解。Koin 支持读取标有 `@Qualifier` 的自定义注解（Koin 的、`jakarta.inject` 或 `javax.inject`）：

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

**构造函数 / 经典 DSL**
```kotlin
val dispatcherModule = module {
    single<CoroutineDispatcher>(named("io")) { Dispatchers.IO }
    single { SyncRepository(get(named("io"))) }
}
```

类型限定符（`named<IoDispatcher>()`）及所有其他选项详见[限定符](/docs/reference/koin-core/qualifiers)。Hilt 的 `@ApplicationContext` 不需要限定符：`Context` 形参会自动接收传递给 `androidContext()` 的上下文。

## 第 8 步：Compose {id="step-8-compose"}

Hilt 需要借助入口点才能从 Composable 中访问非 ViewModel 依赖项。Koin 则可以直接解析：

```kotlin
@Composable
fun UserScreen(viewModel: UserViewModel = koinViewModel()) {
    val analytics: Analytics = koinInject()
}
```

请参阅 [Koin for Compose](/docs/reference/koin-compose/compose)。

## 第 9 步：测试 {id="step-9-tests"}

Hilt：

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

Koin：

```kotlin
class UserRepositoryTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(appModule, testModule)
    }

    private val repository: UserRepository by inject()
}
```

Hilt 的 `@TestInstallIn` 和 `@UninstallModules` 会转换为在生产模块之后加载的测试模块。移除 `HiltTestApplication` 和 Hilt 测试运行程序。请参阅[单元测试](/docs/reference/koin-test/testing)和 [Android 插桩测试](/docs/reference/koin-android/instrumented-testing)。

## 使用 @Inject 渐进式迁移 {id="migrate-gradually-with-inject"}

使用注解时，编译器插件支持读取 JSR-330 注解：在 `@ComponentScan` 覆盖的包中，带有 `@Inject constructor` 的类会成为 factory，而带有 `@Singleton` 注解（来自 `jakarta.inject` 或 `javax.inject`）的类会成为 single。你可以保持这些类不变，按 Gradle 模块逐一进行迁移。请参阅 [JSR-330 注解](/docs/reference/koin-android/jsr330)。

## 多模块项目 {id="multi-module-projects"}

每个 Gradle 模块声明各自的 Koin 模块，而 app 模块在 `startKoin` 中统一加载它们。无需配置组件层次结构，跨模块访问也不需要 `@EntryPoint`：`:feature:home` 中的定义可以使用应用所加载的任意定义。

使用注解时，为每个功能模块类添加 `@Module`、`@ComponentScan` 和 `@Configuration` 标记。app 模块中的 `@KoinApplication` 无需手动列出即可自动发现它们。

模块组织、可见性以及功能模块详见[多模块应用](/docs/reference/koin-android/multi-module)。

## 常见模式 {id="common-patterns"}

### 辅助注入 {id="assisted-injection"}

Hilt 的 `@AssistedInject` 和 `@AssistedFactory` 会转换为注入形参。由调用方传入运行时值：

**编译器插件 DSL**
```kotlin
class UserDetailViewModel(
    @InjectedParam private val userId: String,
    private val repository: UserRepository,
) : ViewModel()

val appModule = module {
    viewModel<UserDetailViewModel>()
}
```

**注解**
```kotlin
@KoinViewModel
class UserDetailViewModel(
    @InjectedParam private val userId: String,
    private val repository: UserRepository,
) : ViewModel()
```

**构造函数 / 经典 DSL**
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

请参阅[注入形参](/docs/reference/koin-core/injection-parameters)。

### Lazy 与 Provider {id="lazy-and-provider"}

- `dagger.Lazy<T>`：使用 Kotlin 的 `Lazy<T>` 构造函数形参，或在 Android 入口点中使用 `by inject()`（请参阅[注入](/docs/reference/koin-core/injection)）。
- `Provider<T>`：若要在自有类中实现每次调用均创建新实例，请使用[高级模式](/docs/reference/koin-core/advanced-patterns)中的 Provider 模式。

### WorkManager {id="workmanager"}

`@HiltWorker` worker 会转换为 `worker` 定义，`HiltWorkerFactory` 会转换为 `startKoin` 中的 `workManagerFactory()`。请参阅 [WorkManager](/docs/reference/koin-android/workmanager)。

## 核对清单 {id="checklist"}

- [ ] Gradle：移除 Hilt 插件、`hilt-android` 和 `hilt-compiler`。添加 Koin，如果使用编译器插件也请一并添加。若无其他依赖需要，移除 kapt。
- [ ] Application：移除 `@HiltAndroidApp`，在 `onCreate()` 中通过 `androidContext()` 启动 Koin。
- [ ] 模块：将 `@Module` / `@InstallIn` / `@Provides` / `@Binds` 转换为 Koin 模块。
- [ ] ViewModel：移除 `@HiltViewModel`，声明它们，改用 `by viewModel()` / `koinViewModel()`。
- [ ] 入口点：移除 `@AndroidEntryPoint`，在 Android 组件中使用 `by inject()`。将自有类中的 `@Inject` 字段移至构造函数形参。仅在 Koin 无法创建的框架类中将 `@EntryPoint` 替换为 `KoinComponent`。
- [ ] 限定符：保留自定义 `@Qualifier` 注解（注解风格）或切换为 `named()`。
- [ ] Worker：替换 `@HiltWorker` 和 `HiltWorkerFactory`。
- [ ] 测试：移除 `@HiltAndroidTest`、`HiltAndroidRule` 和 Hilt 测试运行程序，改用 `KoinTestRule`。
- [ ] 构建：使用编译器插件时，构建成功即表明依赖图是完整的。如果不使用编译器插件，请添加 [verify()](/docs/reference/koin-test/verify) 测试。
- [ ] 运行：启动应用并执行测试套件。

## 故障排除 {id="troubleshooting"}

### NoDefinitionFoundException {id="nodefinitionfoundexception"}

Koin 找不到所请求类型的定义。请检查声明该类型的模块是否已在 `startKoin` 中加载（或被 `@Configuration` 发现），以及请求的类型是否与声明或绑定的类型匹配。此前仅包含 `@Inject constructor` 且由 Hilt 注入的类同样需要 Koin 定义，除非 `@ComponentScan` 通过其 JSR-330 注解自动拾取了它。

### 相同类型的两个定义导致解析出错误实例 {id="wrong-instance-with-two-definitions-of-the-same-type"}

在 Hilt 中，缺少限定符属于构建错误。而在 Koin 中，默认情况下最后加载的定义会胜出（覆盖前面的定义），除非在启动 Koin 时设置了 `allowOverride(false)`。请为这两个定义以及各个注入点添加[限定符](/docs/reference/koin-core/qualifiers)。

### 循环依赖 {id="circular-dependency"}

两个类相互依赖。请重构以消除循环依赖，或使用 `Lazy<T>` 形参使其中一方变为延迟加载。编译器插件会在构建期报告循环依赖。详情请参阅[故障排除](/docs/reference/koin-core/troubleshooting)。

## 相关内容 {id="related"}

- [Koin vs Hilt](/docs/intro/koin-vs-hilt)：两个框架的区别。
- [JSR-330 注解](/docs/reference/koin-android/jsr330)：在迁移期间保留 `@Inject` 和 `@Singleton`。
- [在 Android 上启动 Koin](/docs/reference/koin-android/start)：`startKoin`、`androidContext()` 与日志记录。
- [Android 作用域](/docs/reference/koin-android/scope)：Activity、Fragment 与 ViewModel 作用域。
- [单元测试](/docs/reference/koin-test/testing)：替换 Hilt 测试规则。
- [编译期安全性](/docs/reference/koin-compiler/compile-safety)：编译器插件的检查项。