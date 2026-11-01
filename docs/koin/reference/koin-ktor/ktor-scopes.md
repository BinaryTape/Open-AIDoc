---
title: 请求作用域
---

# 请求作用域

本页介绍 Koin Ktor 插件的请求作用域 (request scope)：为每个 HTTP 调用开启并在发送响应后关闭的 Koin 作用域。将其用于保存每个请求状态的对象，例如请求日志记录器或当前用户。有关作用域的一般工作原理，请参阅[作用域](/docs/reference/koin-core/scopes)。你需要按照 [Koin for Ktor](/docs/reference/koin-ktor/ktor) 中的说明安装该插件。

## 声明请求作用域定义 {id="declaring-request-scoped-definitions"}

**编译器插件 DSL**
```kotlin
import org.koin.module.requestScope

val appModule = module {
    single<UserRepository>() // 由所有请求共享

    requestScope {
        scoped<RequestLogger>()
        scoped<UserSessionHandler>()
    }
}
```

**注解**
```kotlin
import org.koin.ktor.plugin.RequestScope

@Scope(RequestScope::class)
class RequestLogger(private val call: ApplicationCall)

@Scope(RequestScope::class)
class UserSessionHandler(private val call: ApplicationCall)
```

`requestScope { }` 是由 `RequestScope` 类型限定的作用域，因此 `@Scope(RequestScope::class)` 针对的也是同一个作用域。

**构造函数 / 传统 DSL**
```kotlin
import org.koin.module.requestScope

val appModule = module {
    singleOf(::UserRepository) // 由所有请求共享

    requestScope {
        scopedOf(::RequestLogger)
        scopedOf(::UserSessionHandler)
    }
}
```

## 在处理程序中解析 {id="resolving-in-a-handler"}

`call.scope` 是当前调用的请求作用域：

```kotlin
routing {
    get("/users/{id}") {
        val logger = call.scope.get<RequestLogger>()
        val userService = call.get<UserService>()

        logger.log("Fetching user")
        call.respond(userService.getUser(call.parameters["id"]!!))
    }
}
```

在单次调用内，每次执行 `call.scope.get<RequestLogger>()` 都会返回同一个实例。下一次调用则会获取一个新实例。请求作用域定义可以依赖单例，因为请求作用域会回退到根作用域。

如果调用没有作用域，例如在既未安装 `Koin` 也未安装 `KoinIsolated` 的情况下，`call.scope` 会抛出 "Koin Request Scope is not ready"。

## 注入 ApplicationCall {id="injecting-the-applicationcall"}

call 是其请求作用域的来源，因此请求作用域类可以将 `ApplicationCall` 作为构造函数形参接收，而无需额外声明：

```kotlin
class RequestLogger(private val call: ApplicationCall) {
    fun log(message: String) {
        println("[${call.request.httpMethod.value} ${call.request.path()}] $message")
    }
}

class UserSessionHandler(private val call: ApplicationCall) {
    fun userId(): String? = call.request.headers["X-User-ID"]
}
```

作用域源在[作用域](/docs/reference/koin-core/scopes)中进行了说明。`ApplicationCall` 仅在请求作用域中可用：`single` 无法接收它。

## 生命周期 {id="lifecycle"}

| 步骤 | 时间点 |
|------|------|
| 作用域创建 | Ktor `CallSetup`，在路由之前 |
| 作用域 ID | `request_` 后跟一个唯一的计数器 |
| 作用域关闭 | Ktor `ResponseSent`，在发送响应之后 |

关闭作用域会丢弃其中的所有实例。要运行清理代码，请向定义中添加 `onClose`：

```kotlin
requestScope {
    scoped { RequestMetrics() } onClose { metrics ->
        metrics?.recordDuration()
    }
}
```

`onClose` 接收该实例作为可空值。没有 `onCreate` 回调：请在构造函数或定义 lambda 表达式中运行初始化。有关回调的详细信息，请参阅[定义](/docs/reference/koin-core/definitions)。

## 常见陷阱 {id="pitfalls"}

- **单例中的请求对象**：不要将请求作用域类注入到 `single` 中。单例仅创建一次，并将一直持有第一个请求的实例。应在处理程序中从 `call.scope` 解析请求作用域对象，或者将其作为实参传递。
- **后台任务**：在发送响应后，从处理程序启动且生命周期超出该调用的协程不得使用 `call.scope`：因为此时作用域已关闭。

## 相关内容 {id="related"}

- [作用域](/docs/reference/koin-core/scopes)：作用域概念、作用域源、链接。
- [Koin for Ktor](/docs/reference/koin-ktor/ktor)：安装插件并在路由中进行注入。
- [定义](/docs/reference/koin-core/definitions)：`onClose` 及其他定义选项。
- [Ktor 测试](/docs/reference/koin-ktor/ktor-testing)：测试使用请求作用域的路由。