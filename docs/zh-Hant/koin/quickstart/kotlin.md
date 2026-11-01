---
title: Kotlin
---

# Kotlin

在本教學中，你將建置一個載入使用者清單並列印問候語的 Kotlin 主控台應用程式。你將學習如何宣告 Koin 模組、將實作繫結至介面，以及啟動 Koin。這大約需要 10 分鐘，且需要 JDK 17 與 Gradle。

本教學使用編譯器外掛程式 (Compiler Plugin) DSL。若要查看使用註解的相同應用程式，請參閱 [Kotlin & Annotations](/docs/quickstart/kotlin-annotations)。若要比較不同風格，請參閱 [Choosing your style](/docs/intro/choosing-your-style)。

## 取得程式碼 {id="get-the-code"}

完整的範例位於 [koin-getting-started/kotlin](https://github.com/InsertKoinIO/koin-getting-started/tree/main/kotlin)。複製 (clone) 此存儲庫並從 `kotlin` 資料夾中執行：

```bash
./gradlew run
```

## Gradle 設定 {id="gradle-setup"}

此範例套用了 Koin 編譯器外掛程式並新增了 `koin-core`。版本資訊維護在版本目錄 (version catalog) 中：

```toml
# gradle/libs.versions.toml
[versions]
kotlin = "<KOTLIN_VERSION>"
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-test = { module = "io.insert-koin:koin-test", version.ref = "koin" }
koin-test-junit4 = { module = "io.insert-koin:koin-test-junit4", version.ref = "koin" }

[plugins]
kotlin-jvm = { id = "org.jetbrains.kotlin.jvm", version.ref = "kotlin" }
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
    implementation(libs.koin.core)

    testImplementation(libs.koin.test)
    testImplementation(libs.koin.test.junit4)
}
```

編譯器外掛程式需要 Kotlin 2.3.20 或更高版本。有關目前版本和 BOM，請參閱 [Gradle setup](/docs/setup/gradle)。有關外掛程式選項，請參閱 [Compiler Plugin setup](/docs/setup/compiler-plugin)。

## 應用程式 {id="the-application"}

此應用程式串聯了三個組建。`UserApplication` 向 `UserService` 請求使用者，而 `UserService` 則從 `UserRepository` 讀取資料：

```
User -> UserRepository -> UserService -> UserApplication
```

## 編寫使用者資料 {id="let-s-write-the-user-data"}

首先從資料類別 (data class) 和預設使用者清單開始：

```kotlin
data class User(val name: String, val email: String)

val DEFAULT_USER = User("Alice", "alice@example.com")

val DEFAULT_USERS = listOf(
    DEFAULT_USER,
    User("Bob", "bob@example.com"),
    User("Charlie", "charlie@example.com")
)
```

這些使用者即為存儲庫所儲存的資料。

## 編寫存儲庫 {id="let-s-write-the-repository"}

存儲庫將使用者保留在記憶體中，並可依姓名尋找使用者：

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

`UserRepositoryImpl` 沒有任何相依性，因此 Koin 無需額外資訊即可建立它。

## 宣告 Koin 模組 {id="let-s-declare-the-koin-module"}

模組是宣告 Koin 所建立組建的地方（請參閱 [Core Concepts](/docs/intro/core-concepts)）。將 `UserRepositoryImpl` 宣告為單例 (singleton)，並以 `UserRepository` 的形式提供：

```kotlin
import org.koin.dsl.bind
import org.koin.dsl.module
import org.koin.plugin.module.dsl.single

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
}
```

現在任何請求 `UserRepository` 的組建都會取得同一個 `UserRepositoryImpl` 執行個體。`single` 與 `bind` 在 [Definitions](/docs/reference/koin-core/definitions) 中有詳細說明。

## 編寫服務 {id="let-s-write-the-service"}

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

將其新增至模組：

```kotlin
val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
}
```

`UserServiceImpl` 在其建構函式中接受一個 `UserRepository`。編譯器外掛程式會讀取該建構函式，並為你傳遞 `UserRepositoryImpl` 執行個體。

## 編寫應用程式類別 {id="let-s-write-the-application-class"}

`UserApplication` 透過其建構函式接收 `UserService`，載入使用者並列印問候語：

```kotlin
class UserApplication(
    private val userService: UserService
) {

    init {
        userService.loadUsers()
    }

    fun sayHello(name: String) {
        val user = userService.getUserOrNull(name)
        val message = userService.prepareHelloMessage(user)
        println(message)
    }
}
```

也將它宣告在模組中：

```kotlin
val appModule = module {
    single<UserApplication>()
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
}
```

現在三個組建都已包含在模組中。外掛程式會在組建階段檢查每個建構函式參數是否都有對應的定義。

## 啟動 Koin {id="let-s-start-koin"}

在 `main()` 中使用你的模組啟動 Koin，然後從容器中取得 `UserApplication`：

```kotlin
import org.koin.core.context.startKoin
import org.koin.mp.KoinPlatform

fun main() {
    startKoin {
        modules(appModule)
    }

    val userApplication = KoinPlatform.getKoin().get<UserApplication>()
    userApplication.sayHello("Alice")
}
```

執行 `./gradlew run`，應用程式將列印出 `Hello 'Alice' (alice@example.com)!`。[Starting Koin](/docs/reference/koin-core/starting-koin) 中介紹了 `startKoin` 及其選項。

## 後續步驟 {id="next-steps"}

- [Core Concepts](/docs/intro/core-concepts)：模組、定義與注入背後的心智模型。
- [Definitions](/docs/reference/koin-core/definitions)：所有定義類型與繫結選項。
- [JUnit Tests](/docs/quickstart/junit-test)：使用 Koin Test 測試同一個應用程式。
- [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety)：編譯器外掛程式在你的相依圖中檢查的內容。
- [Tooling](/docs/tooling)：適用於 Koin 的 IDE 外掛程式與監控工具。