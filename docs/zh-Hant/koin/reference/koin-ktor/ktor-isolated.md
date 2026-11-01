---
title: Ktor 中的隔離上下文
---

# Ktor 中的隔離上下文

本頁介紹 `KoinIsolated` 外掛程式，它會為單一 Ktor 應用程式啟動 Koin，而不會將其註冊到全域上下文中。每個應用程式隨後都擁有自己的容器。關於什麼是隔離上下文以及何時使用它，請參閱[上下文隔離](/docs/reference/koin-core/context-isolation)。常規的 `Koin` 外掛程式則在 [Koin for Ktor](/docs/reference/koin-ktor/ktor) 中說明。

## 安裝 KoinIsolated {id="installing-koinisolated"}

安裝 `KoinIsolated` 來取代 `Koin`。配置區塊完全相同：

**Compiler Plugin DSL**
```kotlin
import org.koin.ktor.plugin.KoinIsolated

fun Application.module() {
    install(KoinIsolated) {
        slf4jLogger()
        modules(appModule)
    }
}
```

**Annotations**
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

**Constructor / Classic DSL**
```kotlin
import org.koin.ktor.plugin.KoinIsolated

fun Application.module() {
    install(KoinIsolated) {
        slf4jLogger()
        modules(appModule)
    }
}
```

## 與 Koin 相比的變化 {id="what-changes-compared-to-koin"}

| | `install(Koin)` | `install(KoinIsolated)` |
|---|---|---|
| 註冊於全域上下文 | 是 | 否 |
| 在 `Application`、`Route`、`Routing`、`ApplicationCall` 上的 `inject()` / `get()` | 是 | 是，來自該應用程式的執行個體 |
| 請求作用域與 `call.scope` | 是 | 是 |
| 生命週期事件，在 `ApplicationStopping` 時關閉 | 是 | 是 |
| 至 Ktor DI 的 `bridge { }` | 是 | 在 Koin 4.2 中不套用 |
| `KoinComponent` 類別、`KoinPlatform.getKoin()` | 看得到此執行個體 | 看不到此執行個體 |

Ktor 擴充功能會讀取儲存在應用程式屬性中的 Koin 執行個體，因此路由中的注入運作方式完全相同：

```kotlin
fun Application.module() {
    install(KoinIsolated) {
        modules(appModule)
    }

    val userService by inject<UserService>()
    val koin = getKoin() // 該應用程式的 Koin 執行個體

    routing {
        get("/users/{id}") {
            val logger = call.scope.get<RequestLogger>()
            call.respond(userService.getUser(call.parameters["id"]!!))
        }
    }
}
```

:::warning
Ktor 接收者（receiver）外部的程式碼無法存取隔離的執行個體。實作 `KoinComponent` 的類別，或呼叫 `KoinPlatform.getKoin()`，均會使用全域上下文並失敗，顯示「KoinApplication has not been started」。請透過在隔離模組中宣告的建構函式參數，將相依性傳遞給你的類別。對於必須自行取得相依性的互通入口點，請覆寫 `getKoin()`，如[上下文隔離](/docs/reference/koin-core/context-isolation)所示。
:::

## 在單一 JVM 中執行多個伺服器 {id="several-servers-in-one-jvm"}

每個嵌入式伺服器都會獲得自己的容器：

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

使用 `install(Koin)` 時，第二個伺服器會停止第一個伺服器的全域 Koin，因為該外掛程式在啟動前會先停止正在執行的全域執行個體。

## 測試 {id="tests"}

每個安裝了 `KoinIsolated` 的 `testApplication` 都擁有自己的容器，因此測試不會透過全域上下文共用狀態，並且可以平行執行。測試設定在 [Ktor 測試](/docs/reference/koin-ktor/ktor-testing)中有詳細說明。

## 何時保留全域上下文 {id="when-to-keep-the-global-context"}

當處理程序（process）中只執行一個 Ktor 應用程式，且該處理程序的其他入口點（例如從 `main()` 啟動的排程工作）必須使用同一個容器，或者當你需要 Ktor DI 橋接器時，請繼續使用 `install(Koin)`。

## 相關內容 {id="related"}

- [上下文隔離](/docs/reference/koin-core/context-isolation)：隔離上下文概念與自訂 `KoinComponent`。
- [Koin for Ktor](/docs/reference/koin-ktor/ktor)：`Koin` 外掛程式與路由中的注入。
- [Ktor 測試](/docs/reference/koin-ktor/ktor-testing)：使用 Koin 測試 Ktor 應用程式。
- [Ktor DI 橋接器](/docs/reference/koin-ktor/ktor-bridge)：與 Ktor DI 共享相依性。