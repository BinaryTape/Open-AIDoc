---
title: Ktor DI 橋接
---

# Ktor DI 橋接

Ktor 3.4 隨附了自家的相依注入外掛程式（`dependencies { provide<T> { } }` 與 `by dependencies`）。本頁面將示範如何使用 Koin 外掛程式的 `bridge { }` 選項將其與 Koin 連接（單向或雙向）。你需要按照 [Koin for Ktor](/docs/reference/koin-ktor/ktor) 中的說明安裝 Koin 外掛程式。

此橋接功能自 Koin 4.2 起提供。其函式標記為 `@KoinExperimentalAPI`。

## 設定橋接 {id="configuring-the-bridge"}

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

| 選項 | 效果 |
|--------|--------|
| `ktorToKoin()` | Ktor 的 `by dependencies` 可以解析 Koin 定義 |
| `koinToKtor()` | Koin 的 `get()`、`inject()` 與建構函式注入可以解析 Ktor DI 相依性 |

僅啟用你所使用的方向。

## Ktor 從 Koin 解析 {id="ktor-resolving-from-koin"}

使用 `ktorToKoin()` 時，該外掛程式會安裝 Ktor 的 `DI` 外掛程式，並搭配由 Koin 支援的相依性對應表：

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
            val helloService: HelloService by dependencies // 宣告於 Koin
            call.respondText(helloService.sayHello())
        }
    }
}
```

具有名稱的 Ktor 相依性鍵會對應至具有相同值的 Koin `named()` 限定詞。

## Koin 從 Ktor DI 解析 {id="koin-resolving-from-ktor-di"}

使用 `koinToKtor()` 時，Koin 會新增一個解析擴充功能：當某個型別沒有 Koin 定義時，Koin 會向 Ktor DI 請求該型別。

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
            val database: DatabaseConnection by inject() // 宣告於 Ktor DI
            call.respondText(database.query())
        }
    }
}
```

Koin 定義也可以將 Ktor DI 型別作為建構函式參數。Koin 限定詞會作為相依性名稱傳遞給 Ktor。如果 Ktor DI 也沒有該相依性，Koin 會記錄一則警告，且解析作業將失敗，如同任何遺失的定義一樣。

## 分離基礎結構與應用程式程式碼 {id="splitting-infrastructure-and-application-code"}

常見的切分方式是將架構層級的物件保留在 Ktor DI 中，而應用程式類別則保留在 Koin 中，並僅啟用 `koinToKtor()`：

```kotlin
fun Application.module() {
    // Ktor DI：基礎結構
    val database = Database(environment.config)
    dependencies {
        provide<Database> { database }
        provide<ApplicationConfig> { environment.config }
    }

    // Koin：應用程式類別
    install(Koin) {
        slf4jLogger()
        bridge { koinToKtor() }
        modules(appModule)
    }
}

val appModule = module {
    singleOf(::CustomerRepository) // 從 Ktor DI 接收 Database
    singleOf(::CustomerService)
}
```

## 限制 {id="limits"}

- **編譯期檢查**：Koin 編譯器外掛程式無法識別 Ktor DI 宣告。若編譯期安全性回報遺失 Ktor DI 型別，請將其標記為 `@Provided`，如[編譯期安全性](/docs/reference/koin-compiler/compile-safety)中所述。
- **KoinIsolated**：在 Koin 4.2 中，`KoinIsolated` 外掛程式接受 `bridge { }` 區塊但不會套用。需要橋接功能時，請使用 `install(Koin)`。
- **實驗性**：橋接 API 可能會在未來的版本中變更。

## 相關資源 {id="related"}

- [Koin for Ktor](/docs/reference/koin-ktor/ktor)：安裝外掛程式並在路由中注入。
- [Ktor 中的隔離上下文](/docs/reference/koin-ktor/ktor-isolated)：全域上下文之外的 Koin。
- [請求作用域](/docs/reference/koin-ktor/ktor-scopes)：每次呼叫獨立的執行個體。
- [Ktor 相依注入](https://ktor.io/docs/server-dependency-injection.html)：Ktor 自帶的 DI 外掛程式。