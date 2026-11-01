---
title: 限定符
---

# 限定符

限定符为定义赋予了一个名称，以便你可以声明同一类型的多个定义并请求特定的一个。本页涵盖字符串、类型和枚举限定符、自定义限定符注解以及常见错误。本文假设你已知晓如何声明定义（请参阅[定义](/docs/reference/koin-core/definitions)）。

## 何时需要限定符 {id="when-you-need-a-qualifier"}

Koin 通过其类型来查找定义。如果两个定义提供了相同的类型（例如两个 `Database` 实例），对 `Database` 的普通请求将无法在它们之间做出选择。限定符可以将它们区分开来。

如果这两个对象扮演不同的角色，请考虑为它们赋予不同的类型（例如将 `LocalDatabase` 和 `RemoteDatabase` 分别作为它们各自的接口）。类型不匹配会在编译器阶段被捕获，而错误的限定符字符串则不会。

## 命名限定符 {id="named-qualifiers"}

声明每个定义时指定一个名称，然后在注入它的位置请求该名称：

**Compiler Plugin DSL**
```kotlin
import org.koin.core.annotation.Named
import org.koin.core.qualifier.named
import org.koin.plugin.module.dsl.*

class UserRepository(
    @Named("local") private val localDb: Database,
    @Named("remote") private val remoteDb: Database,
)

val dataModule = module {
    single<Database>(named("local")) { create(::LocalDatabase) }
    single<Database>(named("remote")) { create(::RemoteDatabase) }
    single<UserRepository>()
}
```

`single<UserRepository>()` 会读取构造函数形参上的 `@Named` 并解析带限定符的定义。你也可以将 `@Named("local")` 直接置于 `LocalDatabase` 类本身：随后 `single<LocalDatabase>()` 便会使用该名称进行注册。`@Named` 注解来自 `koin-annotations` 构件。

**Annotations**
```kotlin
import org.koin.core.annotation.Named
import org.koin.core.annotation.Singleton

@Singleton
@Named("local")
class LocalDatabase : Database

@Singleton
@Named("remote")
class RemoteDatabase : Database

@Singleton
class UserRepository(
    @Named("local") private val localDb: Database,
    @Named("remote") private val remoteDb: Database,
)
```

`@Named` 可用于类、提供程序函数以及形参。

**Constructor / Classic DSL**
```kotlin
import org.koin.core.qualifier.named

val dataModule = module {
    single<Database>(named("local")) { LocalDatabase() }
    single<Database>(named("remote")) { RemoteDatabase() }
    single {
        UserRepository(
            localDb = get(named("local")),
            remoteDb = get(named("remote")),
        )
    }
}
```

`singleOf(::UserRepository)` 仅按类型解析形参，因此无法传递限定符。请如示例所示，使用 `get(named(...))` 编写构造函数调用。

在定义之外，将限定符传递给 `get()` 或 `inject()`：

```kotlin
val localDb: Database by inject(named("local"))
val remoteDb: Database = get(named("remote"))
```

相同的限定符实参存在于所有注入 API 中，例如 Compose 中的 `koinInject(named("local"))`。请参阅[注入](/docs/reference/koin-core/injection)。

## 类型限定符 {id="type-qualifiers"}

类型也可以充当限定符。拼写错误会变为编译错误，并且在 IDE 中重命名该类型会自动更新所有使用之处：

**Compiler Plugin DSL**
```kotlin
import org.koin.core.annotation.Qualifier

object LocalDb
object RemoteDb

class UserRepository(
    @Qualifier(LocalDb::class) private val localDb: Database,
    @Qualifier(RemoteDb::class) private val remoteDb: Database,
)

val dataModule = module {
    single<Database>(named<LocalDb>()) { create(::LocalDatabase) }
    single<Database>(named<RemoteDb>()) { create(::RemoteDatabase) }
    single<UserRepository>()
}
```

**Annotations**
```kotlin
object LocalDb
object RemoteDb

@Singleton
@Qualifier(LocalDb::class)
class LocalDatabase : Database

@Singleton
@Qualifier(RemoteDb::class)
class RemoteDatabase : Database

@Singleton
class UserRepository(
    @Qualifier(LocalDb::class) private val localDb: Database,
    @Qualifier(RemoteDb::class) private val remoteDb: Database,
)
```

`@Qualifier(name = "local")` 是字符串形式，等同于 `@Named("local")`。

**Constructor / Classic DSL**
```kotlin
object LocalDb
object RemoteDb

val dataModule = module {
    single<Database>(named<LocalDb>()) { LocalDatabase() }
    single<Database>(named<RemoteDb>()) { RemoteDatabase() }
    single { UserRepository(get(named<LocalDb>()), get(named<RemoteDb>())) }
}
```

在调用站点：`get<Database>(named<LocalDb>())`。`qualifier<LocalDb>()` 是 `named<LocalDb>()` 的别名。

## 枚举限定符 {id="enum-qualifiers"}

枚举成员也可以作为限定符：

```kotlin
enum class DbType { LOCAL, REMOTE }

val dataModule = module {
    single<Database>(named(DbType.LOCAL)) { LocalDatabase() }
    single<Database>(named(DbType.REMOTE)) { RemoteDatabase() }
}

val localDb: Database = get(named(DbType.LOCAL))
```

`named(DbType.LOCAL)` 是由小写成员名称构成的字符串限定符。它与 `named("local")` 是相同的限定符。

## 自定义限定符注解 {id="custom-qualifier-annotations"}

使用注解时，你可以创建自己的限定符注解。使用 `@Qualifier`（或 `@Named`）对其进行注解，然后像使用 `@Named` 一样使用它：

```kotlin
import org.koin.core.annotation.Qualifier

@Qualifier
annotation class BaseUrl

@Qualifier
annotation class AuthUrl

@Singleton
@BaseUrl
fun baseUrl(): String = "https://api.example.com"

@Singleton
@AuthUrl
fun authUrl(): String = "https://auth.example.com"

@Singleton
class ApiClient(
    @BaseUrl private val baseUrl: String,
    @AuthUrl private val authUrl: String,
)
```

不带形参的注解将成为该注解类上的类型限定符。在代码中，可通过 `get<String>(named<BaseUrl>())` 进行获取。

自定义限定符可以接受形参，以便通过一个注解定义一组限定符：

```kotlin
enum class AppDispatchers { Default, IO }

@Qualifier
annotation class Dispatcher(val dispatcher: AppDispatchers)

@Module
class DispatchersModule {

    @Singleton
    @Dispatcher(AppDispatchers.IO)
    fun ioDispatcher(): CoroutineDispatcher = Dispatchers.IO

    @Singleton
    @Dispatcher(AppDispatchers.Default)
    fun defaultDispatcher(): CoroutineDispatcher = Dispatchers.Default

    @Singleton
    fun applicationScope(
        @Dispatcher(AppDispatchers.Default) dispatcher: CoroutineDispatcher,
    ): CoroutineScope = CoroutineScope(SupervisorJob() + dispatcher)
}
```

形参的值将成为限定符：

- 字符串形参：`@ApiName("users")` 是字符串限定符 `"users"`，与 `@Named("users")` 相同。
- 枚举形参：`@Dispatcher(AppDispatchers.IO)` 是由枚举的完全限定类名和成员构成的字符串限定符，即 `named("com.myapp.AppDispatchers.IO")`。它与使用小写成员名称的 `named(AppDispatchers.IO)` 不同。

编译器插件会在构建时检查自定义限定符：提供程序和注入点具有不同的限定符将导致构建错误。自定义限定符注解也可用于编译器插件 DSL，作用于构造函数形参以及传递给 `single<T>()` 的类上。

自定义限定符注解在构造函数或传统 DSL 中不可用。在这些地方请使用 `named()`。

## JSR-330 限定符 {id="jsr-330-qualifiers"}

`jakarta.inject.Named`、`javax.inject.Named` 以及标记有 `jakarta.inject.Qualifier` 的注解其工作方式与 Koin 的对等项类似。请参阅 [JSR-330 支持](/docs/reference/koin-android/jsr330)。

## 常见错误 {id="common-mistakes"}

- 注入点缺少限定符：当每个 `Database` 定义都带有限定符时，`get<Database>()` 将失败并抛出 `NoDefinitionFoundException`。带有限定符的定义只能通过该限定符来查找到。
- 拼写不同：`named("encrypted")` 和 `named("encrypted_client")` 是两个不同的限定符。使用类型或枚举限定符，或者将字符串保存在常量中，以避免出现此类情况。
- 为每个定义都添加限定符：如果类型本身已经不同，限定符不会带来任何益处。仅在两个定义共享相同类型时才使用限定符。

借助编译器插件，前两个错误会成为构建错误。当带限定符的形参没有匹配项但存在同一类型的无限定符定义时，错误信息会指向该定义。

## 相关内容 {id="related"}

- [定义](/docs/reference/koin-core/definitions)：声明定义并将其绑定到接口。
- [注入](/docs/reference/koin-core/injection)：将限定符传递给 `get()` 和 `inject()`。
- [注入形参](/docs/reference/koin-core/injection-parameters)：在解析时传递值，而不是声明变体。
- [编译时安全性](/docs/reference/koin-compiler/compile-safety)：编译器插件针对限定符所做的检查。
- [注解参考](/docs/reference/koin-annotations/annotations-inventory)：`@Named` 和 `@Qualifier` 的形参。