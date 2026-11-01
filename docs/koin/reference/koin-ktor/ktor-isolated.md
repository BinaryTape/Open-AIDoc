---
title: Ktor 中的隔离上下文
---

# Ktor 中的隔离上下文

本页面介绍 `KoinIsolated` 插件，它为单个 Ktor 应用程序启动 Koin，而无需将其注册到全局上下文中。这样每个应用程序都拥有自己的容器。有关什么是隔离上下文以及何时使用隔离上下文的说明，请参阅[上下文隔离](/docs/reference/koin-core/context-isolation)。常规的 `Koin` 插件在 [Ktor 版 Koin](/docs/reference/koin-ktor/ktor) 中进行了介绍。

## 安装 KoinIsolated {id="installing-koinisolated"}

安装 `KoinIsolated` 代替 `Koin`。配置块相同：

**编译器插件 DSL**
```kotlin
import org.koin.ktor.plugin.KoinIsolated

fun Application.module() {
    install(KoinIsolated) {
        slf4jLogger()
        modules(appModule)
    }
}
```

**注解**
```kotlin
import org.koin.ktor.plugin.KoinIsolated
import org.koin.plugin.module.dsl.withConfiguration

fun Application.module() {
    install(KoinIsolated) {
        slf4jLogger()
        withConfiguration<KoinUserApplication>()
    }
}
```

**构造函数 / 经典 DSL**
```kotlin
import org.koin.ktor.plugin.KoinIsolated

fun Application.module() {
    install(KoinIsolated) {
        slf4jLogger()
        modules(appModule)
    }
}
```

## 与 Koin 相比有何变化 {id="what-changes-compared-to-koin"}

| | `install(Koin)` | `install(KoinIsolated)` |
|---|---|---|
| 注册在全局上下文中 | 是 | 否 |
| `Application`、`Route`、`Routing`、`ApplicationCall` 上的 `inject()` / `get()` | 是 | 是，来自该应用程序的实例 |
| 请求作用域与 `call.scope` | 是 | 是 |
| 生命周期事件，在 `ApplicationStopping` 时关闭 | 是 | 是 |
| 桥接到 Ktor DI 的 `bridge { }` | 是 | 在 Koin 4.2 中不适用 |
| `KoinComponent` 类、`KoinPlatform.getKoin()` | 能看到该实例 | 看不到该实例 |

Ktor 扩展会读取存储在应用程序属性中的 Koin 实例，因此在路由中的注入工作方式完全相同：

```kotlin
fun Application.module() {
    install(KoinIsolated) {
        modules(appModule)
    }

    val userService by inject<UserService>()
    val koin = getKoin() // 该应用程序的 Koin 实例

    routing {
        get("/users/{id}") {
            val logger = call.scope.get<RequestLogger>()
            call.respond(userService.getUser(call.parameters["id"]!!))
        }
    }
}
```

:::warning
Ktor 接收者之外的代码无法访问该隔离实例。实现 `KoinComponent` 的类或对 `KoinPlatform.getKoin()` 的调用会使用全局上下文，并失败报错 "KoinApplication has not been started"。请通过在隔离模块中声明的构造函数形参为类提供其依赖项。对于必须自行检索依赖项的互操作入口点，请按照[上下文隔离](/docs/reference/koin-core/context-isolation)中所示重写 `getKoin()`。
:::

## 单个 JVM 中的多个服务器 {id="several-servers-in-one-jvm"}

每个嵌入式服务器都会获得自己的容器：

```kotlin
fun main() {
    val userServer = embeddedServer(Netty, port = 8080) {
        install(KoinIsolated) { modules(userServiceModule) }
        userRouting()
    }

    val orderServer = embeddedServer(Netty, port = 8081) {
        install(KoinIsolated) { modules(orderServiceModule) }
        orderRouting()
    }

    userServer.start(wait = false)
    orderServer.start(wait = true)
}
```

如果使用 `install(Koin)`，第二个服务器将停止第一个服务器的全局 Koin，因为该插件在启动之前会先停止正在运行的全局实例。

## 测试 {id="tests"}

每个安装了 `KoinIsolated` 的 `testApplication` 都有自己的容器，因此测试不会通过全局上下文共享状态，并且可以并行运行。有关测试设置的说明，请参阅 [Ktor 测试](/docs/reference/koin-ktor/ktor-testing)。

## 何时保留全局上下文 {id="when-to-keep-the-global-context"}

当进程中只运行一个 Ktor 应用程序，并且该进程的其他入口点（例如从 `main()` 启动的定时作业）必须使用同一个容器时，或者当你需要 Ktor DI 桥接时，请继续使用 `install(Koin)`。

## 相关内容 {id="related"}

- [上下文隔离](/docs/reference/koin-core/context-isolation)：隔离上下文的概念和自定义 `KoinComponent`。
- [Ktor 版 Koin](/docs/reference/koin-ktor/ktor)：`Koin` 插件以及在路由中的注入。
- [Ktor 测试](/docs/reference/koin-ktor/ktor-testing)：使用 Koin 测试 Ktor 应用程序。
- [Ktor DI 桥接](/docs/reference/koin-ktor/ktor-bridge)：与 Ktor DI 共享依赖项。