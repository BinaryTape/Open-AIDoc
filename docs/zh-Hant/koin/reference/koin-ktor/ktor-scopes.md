---
title: 請求作用域
---

# 請求作用域

本頁面涵蓋 Koin Ktor 外掛程式的請求作用域（request scope）：為每個 HTTP 呼叫開啟並在傳送回應時關閉的 Koin 作用域。將其用於保存個別請求狀態的物件，例如請求記錄器或當前使用者。作用域的一般運作方式在 [Scopes](/docs/reference/koin-core/scopes) 中進行說明。你需要按照 [Koin for Ktor](/docs/reference/koin-ktor/ktor) 安裝該外掛程式。

## 宣告請求作用域定義 {id="declaring-request-scoped-definitions"}

**編譯器外掛程式 DSL**
```kotlin
import org.koin.module.requestScope

val appModule = module {
    single<UserRepository>() // shared by all requests

    requestScope {
        scoped<RequestLogger>()
        scoped<UserSessionHandler>()
    }
}
```

**註解**
```kotlin
import org.koin.ktor.plugin.RequestScope

@Scope(RequestScope::class)
class RequestLogger(private val call: ApplicationCall)

@Scope(RequestScope::class)
class UserSessionHandler(private val call: ApplicationCall)
```

`requestScope { }` 是一個由 `RequestScope` 型別限定的作用域，因此 `@Scope(RequestScope::class)` 會以同一個作用域為目標。

**建構函式 / 經典 DSL**
```kotlin
import org.koin.module.requestScope

val appModule = module {
    singleOf(::UserRepository) // shared by all requests

    requestScope {
        scopedOf(::RequestLogger)
        scopedOf(::UserSessionHandler)
    }
}
```

## 在處理常式中解析 {id="resolving-in-a-handler"}

`call.scope` 是當前呼叫的請求作用域：

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

在同一個呼叫中，每個 `call.scope.get<RequestLogger>()` 都會傳回相同的執行個體。下一個呼叫則會取得一個新的執行個體。請求作用域定義可以相依於單例，因為請求作用域會備援退回至根作用域。

若該呼叫沒有作用域，例如既未安裝 `Koin` 也未安裝 `KoinIsolated` 時，`call.scope` 會拋出 "Koin Request Scope is not ready"。

## 注入 ApplicationCall {id="injecting-the-applicationcall"}

呼叫是其請求作用域的來源，因此請求作用域類別可以將 `ApplicationCall` 作為建構函式參數，而無需明確宣告它：

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

作用域來源在 [Scopes](/docs/reference/koin-core/scopes) 中有所說明。`ApplicationCall` 僅在請求作用域中可用：`single` 無法接收它。

## 生命週期 {id="lifecycle"}

| 步驟 | 時機 |
|------|------|
| 作用域已建立 | Ktor `CallSetup`，在路由之前 |
| 作用域識別碼 | `request_` 後接唯一計數器 |
| 作用域已關閉 | Ktor `ResponseSent`，在傳送回應之後 |

關閉作用域會捨棄其所有執行個體。若要執行清理程式碼，請在定義中加入 `onClose`：

```kotlin
requestScope {
    scoped { RequestMetrics() } onClose { metrics ->
        metrics?.recordDuration()
    }
}
```

`onClose` 會以可為 null 的值接收執行個體。沒有 `onCreate` 回呼：請在建構函式或定義 Lambda 中執行初始化。有關回呼的資訊，請參閱 [Definitions](/docs/reference/koin-core/definitions)。

## 陷阱 {id="pitfalls"}

- **單例中的請求物件**：不要將請求作用域類別注入到 `single` 中。單例只會建立一次，並且會一直保留第一個請求的執行個體。請在處理常式中從 `call.scope` 解析請求作用域物件，或者將它們作為引數傳遞。
- **背景工作**：從生命週期長於呼叫的處理常式中所啟動的協同程式，在傳送回應後絕不能使用 `call.scope`：因為屆時該作用域已經關閉。

## 相關內容 {id="related"}

- [Scopes](/docs/reference/koin-core/scopes)：作用域概念、作用域來源、連結。
- [Koin for Ktor](/docs/reference/koin-ktor/ktor)：安裝外掛程式並在路由中注入。
- [Definitions](/docs/reference/koin-core/definitions)：`onClose` 與其他定義選項。
- [Ktor Testing](/docs/reference/koin-ktor/ktor-testing)：測試使用請求作用域的路由。