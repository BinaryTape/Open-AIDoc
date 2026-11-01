---
title: Ktor
---

# Ktor

在本教學中，你將建置一個具有 `/hello` 端點的 Ktor Web 應用程式，該端點會向從清單中選出的使用者發送問候。你將學習如何宣告 Koin 模組、將 Koin 作為 Ktor 外掛程式安裝，並在應用程式中注入服務。此教學約需 10 分鐘，並需要 JDK 17 與 Gradle。

本教學使用編譯器外掛程式 DSL。若要查看使用註解的相同應用程式，請參閱 [Ktor & Annotations](/docs/quickstart/ktor-annotations)。若要比較不同風格，請參閱 [Choosing your style](/docs/intro/choosing-your-style)。

## 取得程式碼 {id="get-the-code"}

完整範例位於 [koin-getting-started/ktor](https://github.com/InsertKoinIO/koin-getting-started/tree/main/ktor)。Clone 該存儲庫並從 `ktor` 資料夾中執行：

```bash
./gradlew run
```

## Gradle 設定 {id="gradle-setup"}

範例套用了 Koin 編譯器外掛程式，並新增了 `koin-ktor` 與 `koin-logger-slf4j`。版本資訊定義在版本目錄（version catalog）中：

```toml
# gradle/libs.versions.toml
[versions]
# Kotlin, Ktor and Logback entries omitted
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-ktor = { module = "io.insert-koin:koin-ktor", version.ref = "koin" }
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
    implementation(libs.koin.logger.slf4j)

    testImplementation(libs.ktor.test)
    testImplementation(libs.koin.test)
    testImplementation(libs.koin.test.junit4)
}
```

編譯器外掛程式需要 Kotlin 2.3.20 或更新版本。有關目前版本和 BOM，請參閱 [Gradle setup](/docs/setup/gradle)。有關外掛程式選項，請參閱 [Compiler Plugin setup](/docs/setup/compiler-plugin)。

## 應用程式架構 {id="the-application"}

`/hello` 路由向 `UserService` 請求使用者資料，而 `UserService` 則從 `UserRepository` 讀取資料：

```
User -> UserRepository -> UserService -> /hello route
```

## 撰寫使用者資料 {id="let-s-write-the-user-data"}

首先建立資料類別（data class）與預設的使用者清單：

```kotlin
data class User(val name: String, val email: String)

val DEFAULT_USER = User("Alice", "alice@example.com")

val DEFAULT_USERS = listOf(
    DEFAULT_USER,
    User("Bob", "bob@example.com"),
    User("Charlie", "charlie@example.com")
)
```

這些使用者就是存儲庫所儲存的資料。

## 撰寫存儲庫 {id="let-s-write-the-repository"}

存儲庫將使用者保留在記憶體中，並能依名稱尋找使用者：

```kotlin
interface UserRepository {
    fun findUserOrNull(name: String): User?
    fun addUsers(users: List<User>)
}

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

`UserRepositoryImpl` 沒有任何相依性，因此 Koin 不需要額外資訊即可建立它。

## 撰寫服務 {id="let-s-write-the-service"}

`UserService` 負責載入使用者並準備問候訊息：

```kotlin
interface UserService {
    fun getUserOrNull(name: String = DEFAULT_USER.name): User?
    fun loadUsers()
    fun prepareHelloMessage(user: User?): String
}

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

`UserServiceImpl` 相依於 `UserRepository`。Koin 會透過建構函式將其傳入。

## 宣告 Koin 模組 {id="let-s-declare-the-koin-module"}

模組是你宣告 Koin 所建立組建的地方（請參閱 [Core Concepts](/docs/intro/core-concepts)）。將這兩個組建宣告為單例（singleton），並繫結至它們的介面：

```kotlin
import org.koin.dsl.bind
import org.koin.dsl.module
import org.koin.plugin.module.dsl.single

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
}
```

現在任何請求 `UserService` 的組建都會取得相同的 `UserServiceImpl` 執行個體。關於 `single` 與 `bind` 的說明，請參閱 [Definitions](/docs/reference/koin-core/definitions)。

## 安裝 Koin 並撰寫路由 {id="let-s-install-koin-and-write-the-route"}

在你的 Ktor 應用程式中安裝帶有該模組的 `Koin` 外掛程式，接著注入 `UserService` 並在 `/hello` 路由中使用它：

```kotlin
import org.koin.ktor.ext.inject
import org.koin.ktor.plugin.Koin

fun Application.main() {
    install(Koin) {
        modules(appModule)
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

`install(Koin)` 會隨 Ktor 應用程式一同啟動 Koin，而 `inject()` 則可在 `Application`、`Route` 以及 `ApplicationCall` 上使用。若要將 Koin 記錄傳送至 SLF4J，請在 `install(Koin)` 內部加入 `slf4jLogger()`。有關 Ktor 專屬的 API，請參閱 [Koin for Ktor](/docs/reference/koin-ktor/ktor)。

## 啟動伺服器 {id="let-s-start-the-server"}

啟動內嵌的 Netty 伺服器來執行你的應用程式模組：

```kotlin
fun main(args: Array<String>) {
    embeddedServer(Netty, port = 8080) {
        main()
    }.start(wait = true)
}
```

執行 `./gradlew run`，然後開啟以下 URL：

- `http://localhost:8080/hello`：向預設使用者 Alice 發送問候。
- `http://localhost:8080/hello?name=Bob`：向 Bob 發送問候。

## 後續步驟 {id="next-steps"}

- [Core Concepts](/docs/intro/core-concepts)：模組、定義與注入背後的心智模型。
- [Koin for Ktor](/docs/reference/koin-ktor/ktor)：安裝選項、路由中的注入以及 Ktor 事件。
- [Request Scopes](/docs/reference/koin-ktor/ktor-scopes)：生命週期僅限於單一 HTTP 請求的執行個體。
- [Ktor testing](/docs/reference/koin-ktor/ktor-testing)：使用 `testApplication` 與 Koin 測試你的路由。
- [Tooling](/docs/tooling)：適用於 Koin 的 IDE 外掛程式與監控工具。