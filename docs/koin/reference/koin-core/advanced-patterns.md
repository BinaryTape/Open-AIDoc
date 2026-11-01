---
title: 高级模式
---

# 高级模式

本页涵盖了超越“每个定义对应一个类”的高级模式：实现集合、泛型类型、运行时对象的 Provider（提供程序）以及装饰器。阅读本文假定你已了解[定义](/docs/reference/koin-core/definitions)和[限定符](/docs/reference/koin-core/qualifiers)。对于来自库的类（Retrofit、Room、OkHttp），请参阅[非自有的类](/docs/reference/koin-core/definitions#classes-you-dont-own)。

## 依赖项集合 {id="collections-of-dependencies"}

要注入某个接口的每个实现，请将每个实现绑定到该接口并请求一个 `List`：

**编译器插件 DSL**
```kotlin
interface PaymentProcessor {
    fun process(amount: Double): Boolean
}

class CreditCardProcessor : PaymentProcessor { ... }
class PayPalProcessor : PaymentProcessor { ... }

class PaymentManager(private val processors: List<PaymentProcessor>)

val paymentModule = module {
    single<CreditCardProcessor>() bind PaymentProcessor::class
    single<PayPalProcessor>() bind PaymentProcessor::class
    single<PaymentManager>()
}
```

**注解**
```kotlin
interface PaymentProcessor {
    fun process(amount: Double): Boolean
}

// 自动绑定到 PaymentProcessor
@Singleton
class CreditCardProcessor : PaymentProcessor { ... }

@Singleton
class PayPalProcessor : PaymentProcessor { ... }

@Singleton
class PaymentManager(private val processors: List<PaymentProcessor>)
```

**构造函数 / 经典 DSL**
```kotlin
val paymentModule = module {
    singleOf(::CreditCardProcessor) bind PaymentProcessor::class
    singleOf(::PayPalProcessor) bind PaymentProcessor::class
    single { PaymentManager(getAll()) }
}
```

`List<T>` 形参通过 `getAll<T>()` 进行解析：包括其类型（或其绑定的类型之一）为 `T` 的每个定义，无论是否带有限定符。在构造函数之外，可以在 `Scope` 或 `getKoin()` 上调用 `getAll<PaymentProcessor>()`。

需要了解的特性与行为：

- **空列表**：如果没有绑定到 `T` 的内容，列表为空。不会抛出错误，并且编译器插件不会针对 `List<T>` 形参报告依赖项缺失。
- **无序**：不要依赖列表的顺序。如果顺序至关重要，请对其进行排序，例如通过接口上的 `priority` 属性排序。
- **仅限当前作用域**：从作用域实例调用时，`getAll` 会返回该作用域及其链接作用域（包括根作用域）的定义。
- **单个查找**：`get<PaymentProcessor>()` 仍然只返回绑定的定义之一（最后加载的那一个）。若要选取特定项，请为每个定义指定[限定符](/docs/reference/koin-core/qualifiers)。
- **严格重写**：在使用 `allowOverride(false)` 的情况下，如果在两个不同的模块中绑定同一个接口而未指定限定符，启动时将抛出 `DefinitionOverrideException` 失败。请为每个绑定分别指定限定符。

当你既需要完整列表又需要特定实现时，可结合使用绑定与限定符。使用编译器插件 DSL 和注解时，在类上添加 `@Named`：

```kotlin
@Named("creditCard")
class CreditCardProcessor : PaymentProcessor { ... }

@Named("paypal")
class PayPalProcessor : PaymentProcessor { ... }

val paymentModule = module {
    single<CreditCardProcessor>() bind PaymentProcessor::class
    single<PayPalProcessor>() bind PaymentProcessor::class
}

class CheckoutService(
    @Named("creditCard") private val defaultProcessor: PaymentProcessor,
    private val allProcessors: List<PaymentProcessor>,
)
```

## 泛型类型 {id="generic-types"}

Koin 通过类和限定符来标识定义。类型实参会被擦除：`Repository<User>` 与 `Repository<Product>` 具有相同的键 `Repository`。同一泛型类的两个定义会互相重写，编译器插件会将它们作为一个定义进行验证。

```kotlin
// 无法正常工作：第二个定义会重写第一个定义
val repositoryModule = module {
    single<Repository<User>> { UserRepository() }
    single<Repository<Product>> { ProductRepository() }
}
```

请改用以下方案之一：

- **具体类型**：直接注入 `UserRepository` 和 `ProductRepository`。每个类都有自己独立的键。
- **限定符**：保留泛型接口，并通过限定符区分这些定义。

**编译器插件 DSL**
```kotlin
@Qualifier(User::class)
class UserRepository : Repository<User> { ... }

@Qualifier(Product::class)
class ProductRepository : Repository<Product> { ... }

val repositoryModule = module {
    single<UserRepository>() bind Repository::class
    single<ProductRepository>() bind Repository::class
}

class UserService(@Qualifier(User::class) private val repository: Repository<User>)
```

**注解**
```kotlin
@Singleton
@Qualifier(User::class)
class UserRepository : Repository<User> { ... }

@Singleton
@Qualifier(Product::class)
class ProductRepository : Repository<Product> { ... }

@Singleton
class UserService(@Qualifier(User::class) private val repository: Repository<User>)
```

**构造函数 / 经典 DSL**
```kotlin
val repositoryModule = module {
    single<Repository<User>>(named<User>()) { UserRepository() }
    single<Repository<Product>>(named<Product>()) { ProductRepository() }
    single { UserService(get(named<User>())) }
}
```

`named<User>()` 是根据类 `User` 构建的类型限定符。`@Qualifier(User::class)` 是其注解形式。

## Provider 模式 {id="provider-pattern"}

某些对象所需的值仅在运行时存在：例如标题、回调或用户选择。与其每次都从 Koin 中解析它们，不如注入一个用于创建这些对象的 Provider 类：

```kotlin
class DialogProvider(private val context: Context) {

    fun confirmDialog(title: String, onConfirm: () -> Unit): AlertDialog =
        AlertDialog.Builder(context)
            .setTitle(title)
            .setPositiveButton("OK") { _, _ -> onConfirm() }
            .create()
}

class SettingsScreen(private val dialogs: DialogProvider) {
    fun askReset() {
        dialogs.confirmDialog("Reset settings?") { reset() }.show()
    }
}
```

像普通类一样声明 `DialogProvider`（使用 `factory<DialogProvider>()`、`@Factory` 或 `factoryOf(::DialogProvider)`）。Provider 从 Koin 获取其依赖项，而创建的对象则从调用者处获取其运行时值。

对于在调用站点已知且在构造函数中需要的值，[注入形参](/docs/reference/koin-core/injection-parameters)是更简单的选择。对于开销较大且并非始终需要的实例，可注入 `Lazy<T>`：参见[构造函数形参](/docs/reference/koin-core/definitions#constructor-parameters)。

## 装饰器模式 {id="decorator-pattern"}

装饰器通过包装某个实现来扩展行为（如日志记录、缓存、速率限制），同时对外暴露相同的接口。Koin 没有内置的 decorator 关键字：在自身类型下注册内部实现，并将接口绑定到外部装饰器。

```kotlin
interface NotificationService {
    fun send(message: String)
}

class PushNotificationService : NotificationService { ... }

class LoggingNotificationService(
    private val delegate: NotificationService,
    private val logger: Logger,
) : NotificationService {
    override fun send(message: String) {
        logger.log("Sending: $message")
        delegate.send(message)
    }
}
```

**编译器插件 DSL**
```kotlin
import org.koin.plugin.module.dsl.create

fun loggingNotifications(
    push: PushNotificationService,
    logger: Logger,
): NotificationService = LoggingNotificationService(push, logger)

val notificationModule = module {
    single<Logger>()
    single<PushNotificationService>()
    single { create(::loggingNotifications) }
}
```

**注解**
```kotlin
@Module
class NotificationModule {

    @Singleton
    fun notifications(push: PushNotificationService, logger: Logger): NotificationService =
        LoggingNotificationService(push, logger)
}
```

使用 `@Singleton(binds = [])` 声明 `PushNotificationService`，使其不会同时绑定到 `NotificationService`。

**构造函数 / 经典 DSL**
```kotlin
val notificationModule = module {
    singleOf(::Logger)
    singleOf(::PushNotificationService)
    single<NotificationService> {
        LoggingNotificationService(delegate = get<PushNotificationService>(), logger = get())
    }
}
```

消费者请求 `NotificationService` 时将获取到经过装饰的实例。若要叠加多个装饰器，请在同一个函数中进行嵌套：`RateLimitedNotificationService(LoggingNotificationService(push, logger), limiter)`。

内部实现绝不能同时绑定到该接口。否则将有两个定义同时匹配 `NotificationService`，从而导致其中一个重写另一个。

## 相关内容 {id="related"}

- [定义](/docs/reference/koin-core/definitions)：定义类型、绑定、非自有的类。
- [限定符](/docs/reference/koin-core/qualifiers)：`named()`、类型限定符与 `@Named`。
- [注入形参](/docs/reference/koin-core/injection-parameters)：解析时传入的运行时值。
- [注入](/docs/reference/koin-core/injection)：在构造函数之外使用 `get()`、`getAll()` 与 `inject()`。
- [故障排除](/docs/reference/koin-core/troubleshooting)：重写错误与缺少定义错误。