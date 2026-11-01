---
title: Kotlin 與註解
---

# Kotlin 與註解

在本教學中，你將建置一個 Kotlin 主控台應用程式，該應用程式會載入使用者清單並印出問候語。你將學習如何為類別加上註解、將它們掃描進模組中，並從 `@KoinApplication` 物件啟動 Koin。這大約需要 10 分鐘，並需要 JDK 17 與 Gradle。

本教學使用註解。若要查看使用 Compiler Plugin DSL 的相同應用程式，請參閱 [Kotlin](/docs/quickstart/kotlin)。若要比較不同風格，請參閱[選擇你的風格](/docs/intro/choosing-your-style)。

## 取得程式碼 {id="get-the-code"}

完整範例位於 [koin-getting-started/kotlin-annotations](https://github.com/InsertKoinIO/koin-getting-started/tree/main/kotlin-annotations)。複製存儲庫並從 `kotlin-annotations` 資料夾執行它：

```bash
./gradlew run
```

## Gradle 設定 {id="gradle-setup"}

該範例套用了 Koin Compiler Plugin 並新增了 `koin-core` 和 `koin-annotations`。版本資訊儲存在版本目錄（version catalog）中：

```toml
# gradle/libs.versions.toml
[versions]
kotlin = "<KOTLIN_VERSION>"
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }
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
    implementation(libs.koin.annotations)

    testImplementation(libs.koin.test)
    testImplementation(libs.koin.test.junit4)
}
```

Compiler Plugin 會處理這些註解，並且需要 Kotlin 2.3.20 或更高版本。`koin-annotations` 與 Koin 版本保持一致。如需詳細資訊，請參閱 [Gradle 設定](/docs/setup/gradle)和 [Compiler Plugin 設定](/docs/setup/compiler-plugin)。

## 應用程式架構 {id="the-application"}

該應用程式串聯了三個組建。`UserApplication` 向 `UserService` 請求使用者，而 `UserService` 則從 `UserRepository` 讀取資料：

```
User -> UserRepository -> UserService -> UserApplication
```

## 編寫使用者資料 {id="let-s-write-the-user-data"}

從資料類別（data class）和預設使用者清單開始：

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

## 編寫存儲庫 {id="let-s-write-the-repository"}

存儲庫會在記憶體中保存使用者。使用 `@Singleton` 為實作加上註解，將其宣告為單例：

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

Koin 會將 `UserRepositoryImpl` 繫結至其超型別，因此請求 `UserRepository` 時會取得此執行個體。`@Singleton` 來自 `org.koin.core.annotation`，相當於 `@Single`（請參閱[定義](/docs/reference/koin-core/definitions)）。

## 編寫服務 {id="let-s-write-the-service"}

`UserService` 負責載入使用者並準備問候語。它也是一個 `@Singleton`：

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

## 編寫應用程式類別 {id="let-s-write-the-application-class"}

`UserApplication` 透過其建構函式接收 `UserService`，載入使用者並印出問候語：

```kotlin
@Singleton
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

所有三個組建現在都已加上註解。接下來，將它們聚集在一個模組中。

## 宣告 Koin 模組 {id="let-s-declare-the-koin-module"}

模組用於將定義分組（請參閱[核心概念](/docs/intro/core-concepts)）。宣告一個模組類別來掃描範例套件：

```kotlin
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.Configuration
import org.koin.core.annotation.Module

@Module
@ComponentScan("org.koin.sample")
@Configuration
class AppModule
```

`@ComponentScan` 會註冊 `org.koin.sample` 及其子套件中每個帶有註解的類別。`@Configuration` 讓該模組能被 `@KoinApplication` 入口點探索到。兩者的詳細說明請參閱[模組](/docs/reference/koin-core/modules)。

## 啟動 Koin {id="let-s-start-koin"}

宣告一個 `@KoinApplication` 物件，並使用具型別的 `startKoin<T>()` 啟動 Koin：

```kotlin
import org.koin.core.annotation.KoinApplication
import org.koin.mp.KoinPlatform
import org.koin.plugin.module.dsl.startKoin

@KoinApplication
object KoinUserApplication

fun main() {
    startKoin<KoinUserApplication>()

    val userApplication = KoinPlatform.getKoin().get<UserApplication>()
    userApplication.sayHello("Alice")
}
```

`startKoin<KoinUserApplication>()` 會載入每個 `@Configuration` 模組，因此你不需要呼叫 `modules()`。外掛程式會在組建期驗證完整的圖（graph），執行 `./gradlew run` 會印出 `Hello 'Alice' (alice@example.com)!`。其他選項請參閱[啟動 Koin](/docs/reference/koin-core/starting-koin)。

## 後續步驟 {id="next-steps"}

- [核心概念](/docs/intro/core-concepts)：模組、定義與注入背後的心智模型。
- [模組](/docs/reference/koin-core/modules)：`@Module`、`@ComponentScan`、`@Configuration` 與模組包含（include）。
- [註解參考](/docs/reference/koin-annotations/annotations-inventory)：所有註解及其參數。
- [測試](/docs/reference/koin-test/testing)：使用 Koin Test 編寫測試。
- [工具集](/docs/tooling)：適用於 Koin 的 IDE 外掛程式與監控工具。