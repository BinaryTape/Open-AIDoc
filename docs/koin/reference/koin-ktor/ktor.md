---
title: 适用于 Ktor 的 Koin
---

# 适用于 Ktor 的 Koin

本页介绍了如何将 Koin 添加到 Ktor 服务器应用程序中：安装 `Koin` 插件、在路由中注入依赖项、从特性函数加载模块以及侦听 Koin 生命周期事件。您应该了解如何声明[定义](/docs/reference/koin-core/definitions)和[模块](/docs/reference/koin-core/modules)。如需分步项目教程，请参阅 [Ktor 教程](/docs/quickstart/ktor)。

## 设置 {id="setup"}

```kotlin
// build.gradle.kts
dependencies {
    implementation(platform(libs.koin.bom))
    implementation(libs.koin.ktor)
    implementation(libs.koin.logger.slf4j) // 可选，SLF4J 日志记录器
}
```

版本目录条目与版本信息请参阅 [Gradle 设置](/docs/setup/gradle)。`koin-ktor` 插件的目标版本为 Ktor 3。

## 安装 Koin 插件 {id="installing-the-koin-plugin"}

在应用程序模块中安装 `Koin`。其配置块与 `startKoin { }` 相同：

**编译器插件 DSL**
```kotlin
import org.koin.ktor.plugin.Koin
import org.koin.logger.slf4jLogger

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserService>()
}

fun Application.module() {
    install(Koin) {
        slf4jLogger()
        modules(appModule)
    }
}
```

**注解**
```kotlin
import org.koin.ktor.plugin.Koin
import org.koin.logger.slf4jLogger
import org.koin.plugin.module.dsl.withConfiguration

@Module
@ComponentScan("com.example")
@Configuration
class AppModule

@KoinApplication
object KoinUserApplication

fun Application.module() {
    install(Koin) {
        slf4jLogger()
        withConfiguration<KoinUserApplication>()
    }
}
```

`withConfiguration<T>()` 会加载由 `@KoinApplication` 类组装的模块。

**构造函数 / 经典 DSL**
```kotlin
import org.koin.ktor.plugin.Koin
import org.koin.logger.slf4jLogger

val appModule = module {
    singleOf(::UserRepositoryImpl) bind UserRepository::class
    singleOf(::UserService)
}

fun Application.module() {
    install(Koin) {
        slf4jLogger()
        modules(appModule)
    }
}
```

该插件的作用：

- **全局启动**：它在全局上下文中启动 Koin，类似于 `startKoin`。如果全局 Koin 实例已在运行（例如在 Ktor 自动重载后），插件会先将其停止。若要避免将 Koin 放入全局上下文中，请使用 [`KoinIsolated`](/docs/reference/koin-ktor/ktor-isolated)。
- **预加载实例**：标记为 `createdAtStart` 的定义会在安装时创建。
- **请求作用域**：它为每次调用开启一个 Koin 作用域。请参阅[请求作用域](/docs/reference/koin-ktor/ktor-scopes)。
- **关闭**：当 Ktor 引发 `ApplicationStopping` 时，插件会关闭 Koin 实例。

配置块的日志记录、属性及其他选项在[启动 Koin](/docs/reference/koin-core/starting-koin)中进行了说明。

## 注入依赖项 {id="injecting-dependencies"}

`inject()`（惰性）和 `get()`（即时）是 `org.koin.ktor.ext` 中针对 `Application`、`Route`、`Routing` 和 `ApplicationCall` 的扩展函数：

```kotlin
import org.koin.ktor.ext.inject

fun Application.module() {
    install(Koin) { modules(appModule) }

    val userService by inject<UserService>()

    routing {
        get("/users") {
            call.respond(userService.getAllUsers())
        }
    }
}
```

在路由扩展函数中：

```kotlin
fun Route.customerRoutes() {
    val customerService by inject<CustomerService>()

    get("/customers/{id}") {
        val id = call.parameters["id"] ?: return@get call.respond(HttpStatusCode.BadRequest)
        call.respond(customerService.getCustomer(id))
    }
}
```

在处理程序内部，从调用中解析：

```kotlin
get("/users/{id}") {
    val userService = call.get<UserService>()
    call.respond(userService.getUser(call.parameters["id"]!!))
}
```

所有这四种接收者都会从存储在 `Application` 中的 Koin 实例进行解析：使用 `Koin` 时解析全局实例，使用 `KoinIsolated` 时解析隔离实例。与核心函数一样，它们接受 `qualifier` 和 `parameters`（请参阅[注入](/docs/reference/koin-core/injection)）。`getProperty(key)` 和 `getProperty(key, defaultValue)` 可以从相同的接收者读取 Koin 属性。

## 从特性函数加载模块 {id="loading-modules-from-feature-functions"}

一旦插件安装完毕，特性函数即可添加其自身的定义：

```kotlin
import org.koin.ktor.plugin.koinModule
import org.koin.ktor.plugin.koinModules

fun Application.customerFeature() {
    koinModule {
        singleOf(::CustomerRepository)
        singleOf(::CustomerService)
    }

    routing { customerRoutes() }
}

fun Application.orderFeature() {
    koinModules(orderDataModule, orderServiceModule)

    routing { orderRoutes() }
}

fun Application.module() {
    install(Koin) {
        slf4jLogger()
        modules(coreModule)
    }
    customerFeature()
    orderFeature()
}
```

`koinModule { }` 用于内联声明模块，`koinModules(...)` 用于加载已有的 `Module` 值。如果事先未调用 `install(Koin)`，两者都会失败并报错 "Koin plugin is not installed properly"。

## 生命周期事件 {id="lifecycle-events"}

该插件会在应用程序监视器上引发三个事件：

| 事件 | 触发时机 |
|-------|--------|
| `KoinApplicationStarted` | 插件安装且 Koin 启动时 |
| `KoinApplicationStopPreparing` | 在 `ApplicationStopping` 时，Koin 关闭之前 |
| `KoinApplicationStopped` | Koin 关闭之后 |

```kotlin
fun Application.module() {
    monitor.subscribe(KoinApplicationStarted) { koinApp ->
        log.info("Koin started")
    }
    monitor.subscribe(KoinApplicationStopped) {
        log.info("Koin stopped")
    }

    install(Koin) {
        slf4jLogger()
        modules(appModule)
    }
}
```

`KoinApplicationStarted` 会在 `install(Koin)` 期间引发。请在安装插件之前进行订阅，否则处理程序将永远不会执行。每个处理程序都会接收到 `KoinApplication`。

## Ktor 自带的 DI {id="ktor-s-own-di"}

Ktor 3.4 具有内置的依赖项注入插件。Koin 可以与它进行双向依赖共享：请参阅 [Ktor DI Bridge](/docs/reference/koin-ktor/ktor-bridge)。

## 相关内容 {id="related"}

- [请求作用域](/docs/reference/koin-ktor/ktor-scopes)：生命周期仅持续单个 HTTP 调用的实例。
- [Ktor DI 桥接](/docs/reference/koin-ktor/ktor-bridge)：在 Koin 和 Ktor DI 之间进行解析。
- [Ktor 中的隔离上下文](/docs/reference/koin-ktor/ktor-isolated)：不使用全局上下文的 Koin。
- [Ktor 测试](/docs/reference/koin-ktor/ktor-testing)：使用 Koin 测试路由。
- [Ktor 教程](/docs/quickstart/ktor)与[带注解的 Ktor 教程](/docs/quickstart/ktor-annotations)：逐步构建使用 Koin 的 Ktor 应用。