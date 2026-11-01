---
title: Ktor 測試
---

# Ktor 測試

本頁面涵蓋測試使用 Koin 的 Ktor 伺服器：使用 `testApplication` 執行您的路由、使用測試模組替換定義，以及將測試相互隔離。本文假設您已知曉如何[在 Ktor 中安裝 Koin](/docs/reference/koin-ktor/ktor)。對於沒有 HTTP 層的純類別測試，請使用[單元測試](/docs/reference/koin-test/testing)的技巧。

## 相依性 {id="dependencies"}

```kotlin
dependencies {
    testImplementation("io.ktor:ktor-server-test-host")
    testImplementation("io.insert-koin:koin-test")
    testImplementation("io.insert-koin:koin-test-junit4") // 或 koin-test-junit5
}
```

## 使用 testApplication 執行路由 {id="run-routes-with-testapplication"}

`install(Koin)` 在 `testApplication` 內部的運作方式與在生產環境中相同。將其與您的測試模組一起安裝，接著新增您的路由：

**編譯器外掛程式 DSL**
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

**註解**
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

**建構函式 / 傳統 DSL**
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

測試模組會在最後載入，因此其 `UserRepository` 會取代生產環境的版本（請參閱[定義](/docs/reference/koin-core/definitions#overriding-a-definition)）。像這樣的 Lambda 定義在每種風格中皆可運作。

路由會如同在生產環境中一樣，透過 `org.koin.ktor.ext` 中的 `inject()` 與 `get()` 解析相依性。當 `testApplication` 結束時，Ktor 會停止應用程式，而 Koin 外掛程式則會關閉其容器。

## 重複使用您的應用程式模組 {id="reuse-your-application-module"}

如果您的生產環境 `Application.module()` 安裝了 Koin，請在測試中呼叫它，並使用 `koinModules()` 新增覆寫：

```kotlin
// 生產環境
fun Application.module() {
    install(Koin) {
        modules(appModule)
    }
    configureRouting()
}

// 測試
@Test
fun `returns a user`() = testApplication {
    application {
        module()
        koinModules(testModule)
    }

    assertEquals(HttpStatusCode.OK, client.get("/users/1").status)
}
```

`koinModules()` 會將模組載入到由 `install(Koin)` 所建立的容器中。Ktor 外掛程式只能安裝一次，因此在測試中進行第二次 `install(Koin)` 會失敗。

`koinModules()` 會在 `install(Koin)` 之後載入覆寫項目。在安裝時建立的定義（例如使用 `createdAtStart`）會保留生產環境的相依性。

## 隔離測試 {id="isolate-tests"}

`install(Koin)` 會在全域上下文（global context）中啟動 Koin。如果已有容器在執行，外掛程式會先將其停止。循序執行的測試不會有問題，但同時執行的兩個測試會共用全域上下文並互相干擾。

繼承 `AutoCloseKoinTest` 以在每個測試後停止 Koin，即使測試在應用程式關閉前失敗也是如此：

```kotlin
class UserRoutesTest : AutoCloseKoinTest() {
    // 測試
}
```

對於平行測試，請改為安裝 `KoinIsolated`。每個應用程式都會在全域上下文之外獲得專屬的容器：

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

使用 `KoinIsolated` 時，請透過 Ktor 擴充功能（`inject()`、`get()`、`call.scope`）解析相依性。`KoinComponent` 或 `GlobalContext.get()` 無法看到隔離的容器。請參閱 [Ktor 中的隔離上下文](/docs/reference/koin-ktor/ktor-isolated)。

## 模擬相依性 {id="mock-a-dependency"}

將 Mock 置於測試模組中：

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

`declareMock`（請參閱[使用 declareMock 進行模擬](/docs/reference/koin-test/testing#mocking-with-declaremock)）也可以與 `install(Koin)` 搭配使用，因為它使用的是全域上下文。它無法與 `KoinIsolated` 一起運作。

## 請求作用域 {id="request-scope"}

宣告在 `requestScope { }` 中的定義會為每次呼叫建立，並在傳送回應時關閉（請參閱 [Ktor 中的請求作用域](/docs/reference/koin-ktor/ktor-scopes)）。透過請求對其進行測試：

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

`call.scope` 僅在處理呼叫時存在。在路由之外解析請求作用域的定義將會失敗。

## Ktor DI 橋接 {id="ktor-di-bridge"}

啟用 [Ktor DI 橋接](/docs/reference/koin-ktor/ktor-bridge)時，在測試應用程式中使用 Ktor 的 `dependencies { }` 提供測試值，方式與在生產環境中相同。`koinToKtor()` 讓 Koin 定義能夠解析它們：

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

## 檢查您的配置 {id="check-your-configuration"}

若要檢查每個定義的相依性是否皆已宣告，且無需啟動伺服器，請參閱[驗證您的配置](/docs/reference/koin-test/verify)。Ktor 在執行時期提供的型別（例如請求作用域中的 `ApplicationCall`）則放入 `extraTypes`。

## 相關內容 {id="related"}

- [適用於 Ktor 的 Koin](/docs/reference/koin-ktor/ktor)：安裝外掛程式並在路由中注入。
- [Ktor 中的隔離上下文](/docs/reference/koin-ktor/ktor-isolated)：`KoinIsolated` 及其使用時機。
- [Ktor 中的請求作用域](/docs/reference/koin-ktor/ktor-scopes)：繫結至呼叫的定義。
- [單元測試](/docs/reference/koin-test/testing)：`KoinTest`、覆寫與 `declareMock`。
- [驗證您的配置](/docs/reference/koin-test/verify)：在測試中檢查模組。