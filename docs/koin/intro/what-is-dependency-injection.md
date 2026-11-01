---
title: 什么是依赖注入？
---

# 什么是依赖注入？

依赖注入 (Dependency Injection，简称 DI) 是一种设计模式：对象从外部接收它所需要的对象，而不是自行创建它们。本文在不依赖任何框架的前提下解释该模式，并展示 Koin 等 DI 容器在其中的作用。如果你已经了解 DI，可以直接阅读[核心概念](/docs/intro/core-concepts)。

## 什么是依赖？ {id="what-is-a-dependency"}

依赖是指一个对象完成其工作所需要的另一个对象。例如，`Car` 需要 `Engine` 才能行驶。

### 不使用依赖注入 {id="without-dependency-injection"}

```kotlin
class Engine {
    fun start() {
        println("Engine starting...")
    }
}

class Car {
    private val engine = Engine() // Car 自行创建 engine

    fun drive() {
        engine.start()
        println("Car is driving")
    }
}
```

这种方式可以运行，但存在以下代价：

- **紧密耦合**：`Car` 与单一的 `Engine` 实现绑定。
- **难以测试**：无法使用假（fake）引擎来测试 `Car`。
- **难以变更**：若要换成电动引擎，就必须修改 `Car` 的代码。
- **生命周期位置错误**：由 `Car` 决定 `Engine` 何时创建以及存在多少个实例。

### 使用依赖注入 {id="with-dependency-injection"}

```kotlin
class Car(private val engine: Engine) {
    fun drive() {
        engine.start()
        println("Car is driving")
    }
}

val gasolineCar = Car(GasEngine())
val electricCar = Car(ElectricEngine())
```

`Car` 不再需要知道 `Engine` 是如何构建的。你可以传入任意实现（包括测试中的模拟实现），并且构造函数能清晰表明 `Car` 需要什么。

## 提供依赖项的方式 {id="ways-to-provide-dependencies"}

### 构造函数注入 {id="constructor-injection"}

依赖项作为构造函数形参传入：

```kotlin
class UserRepository(
    private val database: Database,
    private val apiClient: ApiClient,
) {
    fun getUser(id: String): User =
        database.query(id) ?: apiClient.fetchUser(id)
}
```

依赖项是显式的、必需的，并且可以是不可变的 (`val`)。无需借助任何框架即可创建和测试该类。这是默认推荐使用的方法。

### 字段注入 {id="field-injection"}

在对象创建后将依赖项赋值给属性。当对象由框架创建且你无法控制其构造函数时，就需要使用这种方式，例如 Android 的 `Activity`：

```kotlin
class UserActivity : AppCompatActivity() {
    private val viewModel: UserViewModel by viewModel() // 首次访问时由 Koin 填充
}
```

请仅在这些框架入口点使用字段注入。在入口点之下的层级，均应使用构造函数注入。

### 方法注入 {id="method-injection"}

将依赖项直接传递给需要它的方法：

```kotlin
class ReportGenerator {
    fun generateReport(data: DataSource) {
        ...
    }
}
```

这种方式适用于每次调用都会发生变化的依赖项，或者仅有单个方法会用到的依赖项。

## 手动与自动化依赖注入 {id="manual-and-automated-dependency-injection"}

### 手动装配 {id="wiring-by-hand"}

你可以在不使用任何库的情况下应用 DI，完全由自己构建对象图：

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val database = Database()
        val apiClient = ApiClient()
        val userRepository = UserRepository(database, apiClient)
        val authRepository = AuthRepository(database, apiClient)
        val userService = UserService(userRepository, authRepository)
        val viewModel = UserViewModel(userService)
    }
}
```

随着应用规模的增长，这类代码会在许多地方重复出现；每当构造函数发生变动时都必须更新，并且无法控制每个对象的存活周期。

### 手写容器 {id="a-container-written-by-hand"}

通常下一步是引入一个容器对象来集中管理对象的创建：

```kotlin
object AppContainer {
    private val database by lazy { Database() }
    private val apiClient by lazy { ApiClient() }

    val userRepository by lazy { UserRepository(database, apiClient) }
    val authRepository by lazy { AuthRepository(database, apiClient) }

    fun createUserViewModel() = UserViewModel(
        UserService(userRepository, authRepository)
    )
}

class MainActivity : AppCompatActivity() {
    private val viewModel = AppContainer.createUserViewModel()
}
```

这消除了代码重复，但你仍然需要编写并维护每一次构造函数调用；对于超出“单一实例”或“全新实例”之外的生命周期（例如每个屏幕一个实例、每个会话一个实例），仍需要编写更多手动代码。

### DI 容器 {id="a-di-container"}

DI 库可以实现容器的自动化。你只需声明存在哪些类以及它们的存活周期，库便会自动构建对象图。在 Koin 中：

**编译器插件 DSL**
```kotlin
val appModule = module {
    single<Database>()
    single<ApiClient>()
    single<UserRepository>()
    single<AuthRepository>()
    single<UserService>()
    viewModel<UserViewModel>()
}
```

**注解**
```kotlin
@Singleton
class UserRepository(private val database: Database, private val apiClient: ApiClient)

@Singleton
class UserService(private val userRepository: UserRepository, private val authRepository: AuthRepository)

@KoinViewModel
class UserViewModel(private val userService: UserService) : ViewModel()

// Database、ApiClient 和 AuthRepository 也以相同方式添加注解

@Module
@ComponentScan("com.example.app")
class AppModule
```

**构造函数 / 经典 DSL**
```kotlin
val appModule = module {
    singleOf(::Database)
    singleOf(::ApiClient)
    singleOf(::UserRepository)
    singleOf(::AuthRepository)
    singleOf(::UserService)
    viewModelOf(::UserViewModel)
}
```

随后 Activity 只需请求对象图的顶层对象：

```kotlin
class MainActivity : AppCompatActivity() {
    private val viewModel: UserViewModel by viewModel()
}
```

容器会自动创建 `UserViewModel` 及其依赖的所有底层对象，为整个应用保留一个 `Database` 单例，并为每个屏幕提供一个新的 `UserViewModel`。[核心概念](/docs/intro/core-concepts)详细解释了这些组成部分。

## DI 库如何构建对象图 {id="how-di-libraries-build-the-graph"}

不同 DI 库在构建对象图的时机与方式上有所差异：

| 方式 | 工作原理 | 示例 |
|------|----------|------|
| 反射 | 在运行时读取构造函数并通过反射进行调用 | Guice、Spring |
| 注解处理 | 在构建时生成工厂源代码 | Dagger、Hilt |
| 编译器插件 | 在编译器内部重写代码并在构建时检查对象图 | Koin 编译器插件 |
| 运行时 DSL | 由你将工厂编写为 Kotlin lambda 表达式，容器在运行时执行它们 | Koin 经典 DSL |

Koin 在所有情况下都会保留一个运行时容器。编译器插件在此基础上进一步提供了自动装配和构建期检查功能。关于其在实际开发中的意义，请参阅[什么是 Koin？](/docs/intro/what-is-koin)。

## 服务定位器与依赖注入 {id="service-locator-and-dependency-injection"}

这两种模式经常被混淆。

使用**服务定位器**时，类会向注册中心请求获取其依赖项：

```kotlin
class UserService : KoinComponent {
    private val repository: UserRepository by inject() // 从容器中拉取
}
```

使用**依赖注入**时，依赖项是由外部提供给该类的：

```kotlin
class UserService(
    private val repository: UserRepository // 从外部注入
)
```

| 维度 | 服务定位器 | 依赖注入 |
|------|------------|----------|
| 依赖项可见性 | 隐藏在类内部 | 在构造函数中清晰可见 |
| 测试 | 需要容器或其测试版本 | 向构造函数传入测试替身即可 |
| 耦合度 | 类依赖于容器 | 类仅依赖于其形参 |
| 在 Koin 中的体现 | `get()`、`by inject()`、`KoinComponent` | 由模块解析的构造函数形参 |
| 适用场景 | 无法由你自行构造的框架类 | 业务逻辑、仓库、服务 |

Koin 对这两种模式均提供支持。对于你自己编写的类，请使用依赖注入；仅在框架创建对象的位置（如 `Activity`、`Fragment`、Ktor 路由）使用服务定位器风格：

```kotlin
// 不推荐：依赖关系隐蔽，测试时需要 Koin
class UserService : KoinComponent {
    private val repository: UserRepository = get()
}

// 推荐：显式依赖
class UserService(private val repository: UserRepository)
```

## 优势与收益 {id="what-you-gain"}

### 可测试性 {id="testability"}

```kotlin
class UserService(private val repository: UserRepository)

@Test
fun getUser() {
    val repository = mockk<UserRepository>()
    every { repository.findUser("123") } returns testUser

    val service = UserService(repository)

    assertEquals(testUser, service.getUser("123"))
}
```

接收依赖项的类可以通过直接调用其构造函数来进行测试，完全不需要容器介入。

### 可替换的实现 {id="swappable-implementations"}

```kotlin
val appModule = module {
    single<EmailService> { SmtpEmailService() }
}

val testModule = module {
    single<EmailService> { FakeEmailService() }
}
```

调用方依赖于 `EmailService` 接口。它们具体获得哪种实现，由模块这一个位置统一定义。

### 集中配置 {id="central-configuration"}

```kotlin
startKoin {
    modules(dataModule, domainModule, presentationModule)
}
```

整个对象图通过少数几个模块即可完成描述（通常按层级或功能划分模块），而无需分散在代码各处。

### 生命周期管理 {id="lifecycle-management"}

```kotlin
val appModule = module {
    single<Database>()     // 应用级单例
    factory<Presenter>()   // 每次请求时创建新实例

    scope<UserSession> {
        scoped<CartRepository>() // 每个会话一个实例
    }
}
```

由容器决定每个对象的存活周期，因此各个类无需管理其依赖项的生命周期。请参阅[作用域](/docs/reference/koin-core/scopes)。

## 相关内容 {id="related"}

- [什么是 Koin？](/docs/intro/what-is-koin)：Koin 如何实现 DI 容器。
- [核心概念](/docs/intro/core-concepts)：Koin 中的定义、模块、注入与作用域。
- [获取依赖项](/docs/reference/koin-core/injection)：详解 `get()` 与 `inject()`。
- [在测试中进行注入](/docs/reference/koin-test/testing)：测试使用 Koin 的代码。