---
title: Ktor DI 桥接
---

# Ktor DI 桥接

Ktor 3.4 提供了自带的依赖注入插件（`dependencies { provide<T> { } }` 与 `by dependencies`）。本页介绍如何使用 Koin 插件的 `bridge { }` 选项将其连接到 Koin，支持单向或双向连接。你需要按照 [Koin for Ktor](/docs/reference/koin-ktor/ktor) 中所述安装 Koin 插件。

该桥接自 Koin 4.2 起可用。其函数均标记为 `@KoinExperimentalAPI`。

## 配置桥接 {id="configuring-the-bridge"}

```kotlin
fun Application.module() {
    install(Koin) {
        slf4jLogger()
        bridge {
            ktorToKoin()
            koinToKtor()
        }
        modules(appModule)
    }

    dependencies {
        provide<KtorSpecificService> { KtorSpecificServiceImpl() }
    }
}
```

| 选项 | 效果 |
|--------|--------|
| `ktorToKoin()` | Ktor 的 `by dependencies` 可以解析 Koin 定义 |
| `koinToKtor()` | Koin 的 `get()`、`inject()` 以及构造函数注入可以解析 Ktor DI 依赖项 |

仅启用你使用的方向。

## Ktor 从 Koin 中解析依赖 {id="ktor-resolving-from-koin"}

在使用 `ktorToKoin()` 时，该插件会安装 Ktor 的 `DI` 插件，并由 Koin 提供底层依赖映射：

```kotlin
fun Application.module() {
    install(Koin) {
        bridge { ktorToKoin() }
        modules(module {
            single<HelloService> { HelloServiceImpl() }
        })
    }

    routing {
        get("/hello") {
            val helloService: HelloService by dependencies // 在 Koin 中声明
            call.respondText(helloService.sayHello())
        }
    }
}
```

带名称的 Ktor 依赖键会映射到具有相同值的 Koin `named()` 限定符。

## Koin 从 Ktor DI 中解析依赖 {id="koin-resolving-from-ktor-di"}

在使用 `koinToKtor()` 时，Koin 会添加一个解析扩展：当某个类型没有对应的 Koin 定义时，Koin 会向 Ktor DI 请求该类型。

```kotlin
fun Application.module() {
    install(Koin) {
        bridge { koinToKtor() }
        modules(appModule)
    }

    dependencies {
        provide<DatabaseConnection> { DatabaseConnectionImpl() }
    }

    routing {
        get("/data") {
            val database: DatabaseConnection by inject() // 在 Ktor DI 中声明
            call.respondText(database.query())
        }
    }
}
```

Koin 定义也可以将 Ktor DI 类型作为构造函数形参。Koin 限定符会作为依赖项名称传递给 Ktor。如果 Ktor DI 中也没有此类依赖项，Koin 会记录一条警告，并且解析会失败，如同任何缺失的定义一样。

## 拆分基础架构与应用程序代码 {id="splitting-infrastructure-and-application-code"}

一种常见的划分方式是将框架级对象保留在 Ktor DI 中，将应用程序类保留在 Koin 中，且仅使用 `koinToKtor()`：

```kotlin
fun Application.module() {
    // Ktor DI: 基础架构
    val database = Database(environment.config)
    dependencies {
        provide<Database> { database }
        provide<ApplicationConfig> { environment.config }
    }

    // Koin: 应用程序类
    install(Koin) {
        slf4jLogger()
        bridge { koinToKtor() }
        modules(appModule)
    }
}

val appModule = module {
    singleOf(::CustomerRepository) // 从 Ktor DI 接收 Database
    singleOf(::CustomerService)
}
```

## 限制 {id="limits"}

- **编译时检查**：Koin 编译器插件无法感知 Ktor DI 声明。如果编译时安全性检查提示缺少某个 Ktor DI 类型，请将其标记为 `@Provided`，如[编译时安全](/docs/reference/koin-compiler/compile-safety)中所述。
- **KoinIsolated**：在 Koin 4.2 中，`KoinIsolated` 插件接受 `bridge { }` 代码块，但不会应用它。当需要桥接功能时，请使用 `install(Koin)`。
- **实验性**：桥接 API 可能会在未来的版本中发生更改。

## 相关内容 {id="related"}

- [Koin for Ktor](/docs/reference/koin-ktor/ktor)：安装插件并在路由中进行注入。
- [Ktor 中的隔离上下文](/docs/reference/koin-ktor/ktor-isolated)：在全局上下文之外使用 Koin。
- [请求作用域](/docs/reference/koin-ktor/ktor-scopes)：每次调用的实例。
- [Ktor 依赖注入](https://ktor.io/docs/server-dependency-injection.html)：Ktor 自带的 DI 插件。