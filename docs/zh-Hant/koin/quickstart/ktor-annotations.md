---
title: Ktor 與註解
---

# Ktor 與註解

在本教學中，你將建置一個具有 `/hello` 端點的 Ktor Web 應用程式，該端點會向清單中選取的使用者打招呼。你將學習如何為類別加上註解、將它們掃描至模組中，並透過 `@KoinApplication` 物件在 Koin Ktor 外掛程式中載入它們。這大約需要 10 分鐘，並需要 JDK 17 與 Gradle。

本教學使用註解。若要查看使用 Compiler Plugin DSL 實作的相同應用程式，請參閱 [Ktor](/docs/quickstart/ktor)。若要比較不同風格，請參閱 [選擇你的風格](/docs/intro/choosing-your-style)。

## 取得程式碼 {id="get-the-code"}

完整的範例位於 [koin-getting-started/ktor-annotations](https://github.com/InsertKoinIO/koin-getting-started/tree/main/ktor-annotations)。複製存儲庫並從 `ktor-annotations` 資料夾中執行 `app` 模組。

## Gradle 設定 {id="gradle-setup"}

此範例套用了 Koin Compiler Plugin 並新增了 `koin-ktor`、`koin-annotations` 與 `koin-logger-slf4j`。版本管理於版本目錄中：

```toml
# gradle/libs.versions.toml
[versions]
# Kotlin, Ktor and Logback entries omitted
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-ktor = { module = "io.insert-koin:koin-ktor", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }
koin-logger-slf4j = { module = "io.insert-koin:koin-logger-slf4j", version.ref = "koin" }
koin-test = { module = "io.insert-koin:koin-test", version.ref = "koin" }
koin-test-junit4 = { module = "io.insert-koin:koin-test-junit4", version.ref = "koin" }

[plugins]
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

```kotlin
// app/build.gradle.kts
plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.koin.compiler)
    application
}

dependencies {
    implementation(libs.ktor.server)
    implementation(libs.logback)
    implementation(libs.koin.ktor)
    implementation(libs.koin.annotations)
    implementation(libs.koin.logger.slf4j)

    testImplementation(libs.ktor.test)
    testImplementation(libs.koin.test)
    testImplementation(libs.koin.test.junit4)
}
```

Compiler Plugin 會處理註解，並需要 Kotlin 2.3.20 或更高版本。`koin-annotations` 與 Koin 共用相同版本。如需詳細資訊，請參閱 [Gradle 設定](/docs/setup/gradle) 與 [Compiler Plugin 設定](/docs/setup/compiler-plugin)。

## 應用程式架構 {id="the-application"}

`/hello` 路由向 `UserService` 請求使用者，而 `UserService` 從 `UserRepository` 讀取資料：

```
User -> UserRepository -> UserService -> /hello route
```

## 編寫使用者資料 {id="let-s-write-the-user-data"}

首先建立資料類別與預設的使用者清單：

```kotlin
data class User(val name: String, val email: String)

val DEFAULT_USER = User("Alice", "alice@example.com")

val DEFAULT_USERS = listOf(
    DEFAULT_USER,
    User("Bob", "bob@example.com"),
    User("Charlie", "charlie@example.com")
)
```

這些使用者即是存儲庫所儲存的資料。

## 編寫存儲庫 {id="let-s-write-the-repository"}

存儲庫將使用者保留在記憶體中。使用 `@Singleton` 為實作加上註解：

```kotlin
import org.koin.core.annotation.Singleton

interface UserRepository {
    fun findUserOrNull(name: String): User?
    fun addUsers(users: List<User>)
}

@Singleton
class UserRepositoryImpl : UserRepository {

    private val _users = arrayListOf<User>()

    override fun findUserOrNull(name: String): User? {
        return _users.firstOrNull { it.name == name }
    }

    override fun addUsers(users: List<User>) {
        _users.addAll(users)
    }
}
```

Koin 會將 `UserRepositoryImpl` 繫結至其父型別，因此請求 `UserRepository` 時將取得此執行個體。`@Singleton` 來自 `org.koin.core.annotation`，其等同於 `@Single`（請參閱 [定義](/docs/reference/koin-core/definitions)）。

## 編寫服務 {id="let-s-write-the-service"}

`UserService` 負責載入使用者並準備問候訊息。它同樣也是一個 `@Singleton`：

```kotlin
interface UserService {
    fun getUserOrNull(name: String = DEFAULT_USER.name): User?
    fun loadUsers()
    fun prepareHelloMessage(user: User?): String
}

@Singleton
class UserServiceImpl(
    private val userRepository: UserRepository
) : UserService {

    override fun getUserOrNull(name: String): User? = userRepository.findUserOrNull(name)

    override fun loadUsers() {
        userRepository.addUsers(DEFAULT_USERS)
    }

    override fun prepareHelloMessage(user: User?): String {
        return user?.let { "Hello '${user.name}' (${user.email})!" } ?: "User not found"
    }
}
```

Compiler Plugin 會讀取建構函式，並為你傳遞 `UserRepository` 執行個體。

## 宣告 Koin 模組 {id="let-s-declare-the-koin-module"}

模組用於將定義分組（請參閱 [核心概念](/docs/intro/core-concepts)）。宣告一個會掃描範例套件的模組類別：

```kotlin
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.Configuration
import org.koin.core.annotation.Module

@Module
@ComponentScan("org.koin.sample")
@Configuration
class AppModule
```

`@ComponentScan` 會註冊 `org.koin.sample` 及其子套件中所有加上註解的類別。`@Configuration` 讓該模組能被 `@KoinApplication` 入口點探索到。這兩者均在 [模組](/docs/reference/koin-core/modules) 中有詳細說明。

## 安裝 Koin 並編寫路由 {id="let-s-install-koin-and-write-the-route"}

宣告一個 `@KoinApplication` 物件。安裝 `Koin` 外掛程式並使用 `withConfiguration<T>()` 載入配置，接著在 `/hello` 路由中注入 `UserService`：

```kotlin
import org.koin.core.annotation.KoinApplication
import org.koin.ktor.ext.inject
import org.koin.ktor.plugin.Koin
import org.koin.logger.slf4jLogger
import org.koin.plugin.module.dsl.withConfiguration

@KoinApplication
object KoinUserApplication

fun Application.main() {
    install(Koin) {
        slf4jLogger()
        withConfiguration<KoinUserApplication>()
    }

    val service by inject<UserService>()
    service.loadUsers()

    routing {
        get("/hello") {
            val userName = call.queryParameters["name"] ?: "Alice"
            val user = service.getUserOrNull(userName)
            val message = service.prepareHelloMessage(user)
            call.respondText(message)
        }
    }
}
```

`withConfiguration<KoinUserApplication>()` 會載入每個 `@Configuration` 模組，因此你不需要呼叫 `modules()`，且外掛程式會在組建期驗證完整的依賴關係圖。`slf4jLogger()` 會將 Koin 記錄傳送至 SLF4J。有關 Ktor 專屬的 API，請參閱 [適用於 Ktor 的 Koin](/docs/reference/koin-ktor/ktor)。

## 啟動伺服器 {id="let-s-start-the-server"}

啟動執行你應用程式模組的內嵌 Netty 伺服器：

```kotlin
fun main(args: Array<String>) {
    embeddedServer(Netty, port = 8080) {
        main()
    }.start(wait = true)
}
```

執行應用程式，然後開啟以下 URL：

- `http://localhost:8080/hello`：向預設使用者 Alice 打招呼。
- `http://localhost:8080/hello?name=Bob`：向 Bob 打招呼。

## 後續步驟 {id="next-steps"}

- [核心概念](/docs/intro/core-concepts)：模組、定義與注入背後的心智模型。
- [適用於 Ktor 的 Koin](/docs/reference/koin-ktor/ktor)：安裝選項、路由中的注入以及 Ktor 事件。
- [註解參考](/docs/reference/koin-annotations/annotations-inventory)：每個註解及其參數。
- [Ktor 測試](/docs/reference/koin-ktor/ktor-testing)：使用 `testApplication` 和 Koin 測試你的路由。
- [工具集](/docs/tooling)：適用於 Koin 的 IDE 外掛程式與監控工具。