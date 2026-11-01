---
title: 適用於 Ktor 的 Koin
---

# 適用於 Ktor 的 Koin

本頁面說明如何將 Koin 新增至 Ktor 伺服器應用程式：安裝 `Koin` 外掛程式、在路由中注入相依性、從功能函式載入模組，以及監聽 Koin 生命週期事件。你應該先了解如何宣告[定義](/docs/reference/koin-core/definitions)與[模組](/docs/reference/koin-core/modules)。如需逐步專案教學，請參閱 [Ktor 教學](/docs/quickstart/ktor)。

## 安裝設定 {id="setup"}

```kotlin
// build.gradle.kts
dependencies {
    implementation(platform(libs.koin.bom))
    implementation(libs.koin.ktor)
    implementation(libs.koin.logger.slf4j) // optional, SLF4J logger
}
```

目錄項目與版本資訊請參閱 [Gradle 設定](/docs/setup/gradle)。`koin-ktor` 外掛程式以 Ktor 3 為目標版本。

## 安裝 Koin 外掛程式 {id="installing-the-koin-plugin"}

在你的應用程式模組中安裝 `Koin`。其配置區塊與 `startKoin { }` 相同：

**編譯器外掛程式 DSL**
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

**註解**
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

`withConfiguration<T>()` 會載入由 `@KoinApplication` 類別組裝的模組。

**建構函式 / 經典 DSL**
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

該外掛程式的作用：

- **全域啟動**：它會在全域內容中啟動 Koin，如同 `startKoin`。若全域 Koin 執行個體已在執行中（例如在 Ktor 自動重載之後），外掛程式會先停止它。若要避免 Koin 進入全域內容，請使用 [`KoinIsolated`](/docs/reference/koin-ktor/ktor-isolated)。
- **預先建立執行個體**：標記為 `createdAtStart` 的定義會在安裝時建立。
- **請求作用域**：它會為每次呼叫開啟一個 Koin 作用域。請參閱[請求作用域](/docs/reference/koin-ktor/ktor-scopes)。
- **關閉**：當 Ktor 引發 `ApplicationStopping` 時，外掛程式會關閉 Koin 執行個體。

配置區塊的記錄功能、屬性與其他選項均在[啟動 Koin](/docs/reference/koin-core/starting-koin)中說明。

## 注入相依性 {id="injecting-dependencies"}

`inject()`（延遲）與 `get()`（即時）是來自 `org.koin.ktor.ext` 在 `Application`、`Route`、`Routing` 與 `ApplicationCall` 上的擴充函式：

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

在路由擴充函式中：

```kotlin
fun Route.customerRoutes() {
    val customerService by inject<CustomerService>()

    get("/customers/{id}") {
        val id = call.parameters["id"] ?: return@get call.respond(HttpStatusCode.BadRequest)
        call.respond(customerService.getCustomer(id))
    }
}
```

在處理常式內部，從呼叫中解析：

```kotlin
get("/users/{id}") {
    val userService = call.get<UserService>()
    call.respond(userService.getUser(call.parameters["id"]!!))
}
```

這四個接收者都會從儲存在 `Application` 中的 Koin 執行個體進行解析：使用 `Koin` 的全域執行個體，或使用 `KoinIsolated` 的隔離執行個體。它們與核心函式相同，可接受 `qualifier` 與 `parameters`（請參閱[注入](/docs/reference/koin-core/injection)）。`getProperty(key)` 與 `getProperty(key, defaultValue)` 則從相同的接收者讀取 Koin 屬性。

## 從功能函式載入模組 {id="loading-modules-from-feature-functions"}

外掛程式安裝完成後，功能函式即可新增自己的定義：

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

`koinModule { }` 用於行內宣告模組，`koinModules(...)` 則用於載入現有的 `Module` 值。若未預先呼叫 `install(Koin)`，兩者皆會失敗並提示「Koin plugin is not installed properly」。

## 生命週期事件 {id="lifecycle-events"}

此外掛程式會在應用程式 monitor 上引發三個事件：

| 事件 | 引發時機 |
|-------|--------|
| `KoinApplicationStarted` | 當外掛程式安裝且 Koin 啟動時 |
| `KoinApplicationStopPreparing` | 在 `ApplicationStopping` 時，Koin 關閉之前 |
| `KoinApplicationStopped` | 在 Koin 關閉之後 |

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

`KoinApplicationStarted` 是在 `install(Koin)` 期間引發的。請在安裝外掛程式前完成訂閱，否則處理常式永遠不會執行。每個處理常式都會接收到 `KoinApplication`。

## Ktor 自帶的 DI {id="ktor-s-own-di"}

Ktor 3.4 具有內建的相依性注入外掛程式。Koin 可以與之雙向共享相依性：請參閱 [Ktor DI 橋接](/docs/reference/koin-ktor/ktor-bridge)。

## 相關內容 {id="related"}

- [請求作用域](/docs/reference/koin-ktor/ktor-scopes)：生命週期僅限單次 HTTP 呼叫的執行個體。
- [Ktor DI 橋接](/docs/reference/koin-ktor/ktor-bridge)：在 Koin 與 Ktor DI 之間相互解析。
- [Ktor 中的隔離內容](/docs/reference/koin-ktor/ktor-isolated)：不使用全域內容的 Koin。
- [Ktor 測試](/docs/reference/koin-ktor/ktor-testing)：使用 Koin 測試路由。
- [Ktor 教學](/docs/quickstart/ktor)與[搭配註解的 Ktor 教學](/docs/quickstart/ktor-annotations)：逐步使用 Koin 建置 Ktor 應用程式。