---
title: Ktor 测试
---

# Ktor 测试

本页介绍如何测试使用 Koin 的 Ktor 服务器：使用 `testApplication` 运行路由、使用测试模块替换定义，以及在测试之间实现相互隔离。本文假定你已了解如何[在 Ktor 中安装 Koin](/docs/reference/koin-ktor/ktor)。对于没有 HTTP 层的普通类的测试，请使用[单元测试](/docs/reference/koin-test/testing)技术。

## 依赖项 {id="dependencies"}

```kotlin
dependencies {
    testImplementation("io.ktor:ktor-server-test-host")
    testImplementation("io.insert-koin:koin-test")
    testImplementation("io.insert-koin:koin-test-junit4") // or koin-test-junit5
}
```

## 使用 testApplication 运行路由 {id="run-routes-with-testapplication"}

`install(Koin)` 在 `testApplication` 内部的工作方式与生产环境中相同。将其与你的测试模块一起安装，然后添加路由：

**编译器插件 DSL**
```kotlin
class UserRoutesTest {

    @Test
    fun `returns a user`() = testApplication {
        application {
            install(Koin) {
                modules(appModule, testModule)
            }
            configureRouting()
        }

        val response = client.get("/users/1")
        assertEquals(HttpStatusCode.OK, response.status)
    }
}
```

**注解**
```kotlin
import org.koin.plugin.module.dsl.withConfiguration

class UserRoutesTest {

    @Test
    fun `returns a user`() = testApplication {
        application {
            install(Koin) {
                withConfiguration<MyApp>()
                modules(testModule)
            }
            configureRouting()
        }

        val response = client.get("/users/1")
        assertEquals(HttpStatusCode.OK, response.status)
    }
}
```

**构造函数 / 经典 DSL**
```kotlin
class UserRoutesTest {

    @Test
    fun `returns a user`() = testApplication {
        application {
            install(Koin) {
                modules(appModule, testModule)
            }
            configureRouting()
        }

        val response = client.get("/users/1")
        assertEquals(HttpStatusCode.OK, response.status)
    }
}
```

```kotlin
val testModule = module {
    single<UserRepository> { InMemoryUserRepository(User("1", "Alice")) }
}
```

测试模块最后被加载，因此其中的 `UserRepository` 会替换生产环境中的定义（参见[定义](/docs/reference/koin-core/definitions#overriding-a-definition)）。像这样的 lambda 表达式定义适用于每种风格。

与生产环境一样，路由通过 `org.koin.ktor.ext` 中的 `inject()` 和 `get()` 解析依赖项。当 `testApplication` 结束时，Ktor 会停止应用程序，Koin 插件也会关闭其容器。

## 复用应用程序模块 {id="reuse-your-application-module"}

如果生产环境的 `Application.module()` 安装了 Koin，可以在测试中调用它，并通过 `koinModules()` 添加重写：

```kotlin
// 生产环境
fun Application.module() {
    install(Koin) {
        modules(appModule)
    }
    configureRouting()
}

// 测试
@Test
fun `returns a user`() = testApplication {
    application {
        module()
        koinModules(testModule)
    }

    assertEquals(HttpStatusCode.OK, client.get("/users/1").status)
}
```

`koinModules()` 会将模块加载到由 `install(Koin)` 创建的容器中。Ktor 插件只能安装一次，因此在测试中进行第二次 `install(Koin)` 将会失败。

`koinModules()` 在 `install(Koin)` 之后加载重写项。在安装时创建的定义（例如使用 `createdAtStart`）将保留生产环境依赖项。

## 隔离测试 {id="isolate-tests"}

`install(Koin)` 会在全局上下文中启动 Koin。如果已有容器在运行，该插件会先将其停止。按顺序运行的测试没有问题，但两个同时运行的测试会共享全局上下文并相互干扰。

继承 `AutoCloseKoinTest` 以在每次测试后停止 Koin，即使测试在应用程序关闭前失败也是如此：

```kotlin
class UserRoutesTest : AutoCloseKoinTest() {
    // tests
}
```

对于并行测试，请改用安装 `KoinIsolated`。每个应用程序都会获得独立于全局上下文之外的专属容器：

```kotlin
@Test
fun `returns a user`() = testApplication {
    application {
        install(KoinIsolated) {
            modules(appModule, testModule)
        }
        configureRouting()
    }

    assertEquals(HttpStatusCode.OK, client.get("/users/1").status)
}
```

使用 `KoinIsolated` 时，需通过 Ktor 扩展（`inject()`、`get()`、`call.scope`）解析依赖项。`KoinComponent` 或 `GlobalContext.get()` 无法感知该隔离容器。参见 [Ktor 中的隔离上下文](/docs/reference/koin-ktor/ktor-isolated)。

## Mock 依赖项 {id="mock-a-dependency"}

将 Mock 对象放入测试模块中：

```kotlin
@Test
fun `returns 404 for an unknown user`() = testApplication {
    val repository = mockk<UserRepository> {
        every { findById(any()) } returns null
    }

    application {
        install(Koin) {
            modules(appModule, module { single { repository } })
        }
        configureRouting()
    }

    assertEquals(HttpStatusCode.NotFound, client.get("/users/999").status)
    verify { repository.findById("999") }
}
```

`declareMock`（参见[使用 declareMock 进行 Mock](/docs/reference/koin-test/testing#mocking-with-declaremock)）同样适用于 `install(Koin)`，因为它使用的是全局上下文。但它不适用于 `KoinIsolated`。

## 请求作用域 {id="request-scope"}

在 `requestScope { }` 中声明的定义会为每个调用单独创建，并在发送响应后关闭（参见 [Ktor 中的请求作用域](/docs/reference/koin-ktor/ktor-scopes)）。可以通过请求对它们进行测试：

```kotlin
@Test
fun `each call gets its own request logger`() = testApplication {
    application {
        install(Koin) {
            modules(module {
                requestScope {
                    scoped { RequestLogger() }
                }
            })
        }
        routing {
            get("/id") {
                call.respondText(call.scope.get<RequestLogger>().id)
            }
        }
    }

    val first = client.get("/id").bodyAsText()
    val second = client.get("/id").bodyAsText()
    assertNotEquals(first, second)
}
```

`call.scope` 仅在处理调用期间存在。在路由外部解析请求作用域的定义将会失败。

## Ktor DI 桥接 {id="ktor-di-bridge"}

启用 [Ktor DI 桥接](/docs/reference/koin-ktor/ktor-bridge)后，可像在生产环境中一样，在测试应用程序中使用 Ktor 的 `dependencies { }` 提供测试值。`koinToKtor()` 允许 Koin 定义解析它们：

```kotlin
@Test
fun `uses the Ktor-provided database`() = testApplication {
    application {
        dependencies {
            provide<Database> { InMemoryDatabase() }
        }
        install(Koin) {
            bridge { koinToKtor() }
            modules(appModule)
        }
        configureRouting()
    }

    assertEquals(HttpStatusCode.OK, client.get("/users").status)
}
```

## 检查配置 {id="check-your-configuration"}

如需在不启动服务器的情况下检查是否已声明每个定义的依赖项，请参阅[验证配置](/docs/reference/koin-test/verify)。Ktor 在运行时提供的类型（例如请求作用域中的 `ApplicationCall`）应置于 `extraTypes` 中。

## 相关内容 {id="related"}

- [适用于 Ktor 的 Koin](/docs/reference/koin-ktor/ktor)：安装插件并在路由中注入。
- [Ktor 中的隔离上下文](/docs/reference/koin-ktor/ktor-isolated)：`KoinIsolated` 及其使用场景。
- [Ktor 中的请求作用域](/docs/reference/koin-ktor/ktor-scopes)：绑定到调用的定义。
- [单元测试](/docs/reference/koin-test/testing)：`KoinTest`、重写与 `declareMock`。
- [验证配置](/docs/reference/koin-test/verify)：在测试中检查模块。