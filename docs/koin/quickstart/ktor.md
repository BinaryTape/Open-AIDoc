---
title: Ktor
---

# Ktor

在本次教程中，你将构建一个带有 `/hello` 端点的 Ktor Web 应用，该端点会向从列表中选出的用户发送问候语。你将学习如何声明 Koin 模块、将 Koin 作为 Ktor 插件进行安装，以及在应用程序中注入服务。本教程大约需要 10 分钟，并需要 JDK 17 和 Gradle。

本教程使用编译器插件 DSL（Compiler Plugin DSL）。如需查看使用注解的相同应用，请参阅 [Ktor 与注解](/docs/quickstart/ktor-annotations)。要对比不同风格，请参阅[选择你的风格](/docs/intro/choosing-your-style)。

## 获取代码 {id="get-the-code"}

完整示例位于 [koin-getting-started/ktor](https://github.com/InsertKoinIO/koin-getting-started/tree/main/ktor)。克隆该仓库并从 `ktor` 文件夹运行它：

```bash
./gradlew run
```

## Gradle 设置 {id="gradle-setup"}

该示例应用了 Koin 编译器插件，并添加了 `koin-ktor` 和 `koin-logger-slf4j`。版本信息存储在版本目录（version catalog）中：

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

编译器插件需要 Kotlin 2.3.20 或更高版本。关于当前版本和 BOM，请参阅 [Gradle 设置](/docs/setup/gradle)。关于插件选项，请参阅[编译器插件设置](/docs/setup/compiler-plugin)。

## 应用程序 {id="the-application"}

`/hello` 路由向 `UserService` 请求一个用户，而 `UserService` 则从 `UserRepository` 中读取：

```
User -> UserRepository -> UserService -> /hello route
```

## 编写用户数据 {id="let-s-write-the-user-data"}

首先创建数据类和默认用户列表：

```kotlin
data class User(val name: String, val email: String)

val DEFAULT_USER = User("Alice", "alice@example.com")

val DEFAULT_USERS = listOf(
    DEFAULT_USER,
    User("Bob", "bob@example.com"),
    User("Charlie", "charlie@example.com")
)
```

这些用户就是仓库所存储的数据。

## 编写仓库 {id="let-s-write-the-repository"}

仓库将用户保存在内存中，并根据名称查找用户：

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

`UserRepositoryImpl` 没有依赖项，因此 Koin 无需额外信息即可创建它。

## 编写服务 {id="let-s-write-the-service"}

`UserService` 加载用户并准备问候消息：

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

`UserServiceImpl` 依赖于 `UserRepository`。Koin 会通过构造函数将其传入。

## 声明 Koin 模块 {id="let-s-declare-the-koin-module"}

模块是你声明 Koin 要创建的组件的地方（请参阅[核心概念](/docs/intro/core-concepts)）。将这两个组件声明为单例，并绑定到它们对应的接口：

```kotlin
import org.koin.dsl.bind
import org.koin.dsl.module
import org.koin.plugin.module.dsl.single

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
}
```

现在，任何请求 `UserService` 的组件都将获取相同的 `UserServiceImpl` 实例。关于 `single` 和 `bind` 的说明，请参阅[定义](/docs/reference/koin-core/definitions)。

## 安装 Koin 并编写路由 {id="let-s-install-koin-and-write-the-route"}

在你的 Ktor 应用程序中安装 `Koin` 插件并传入你的模块，然后注入 `UserService` 并在 `/hello` 路由中使用它：

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

`install(Koin)` 会随 Ktor 应用程序一起启动 Koin，并且可以在 `Application`、`Route` 以及 `ApplicationCall` 上使用 `inject()`。若要将 Koin 日志发送到 SLF4J，请在 `install(Koin)` 内部添加 `slf4jLogger()`。有关特定于 Ktor 的 API，请参阅 [Koin for Ktor](/docs/reference/koin-ktor/ktor)。

## 启动服务器 {id="let-s-start-the-server"}

启动一个运行你的应用程序模块的嵌入式 Netty 服务器：

```kotlin
fun main(args: Array<String>) {
    embeddedServer(Netty, port = 8080) {
        main()
    }.start(wait = true)
}
```

运行 `./gradlew run`，然后打开以下 URL：

- `http://localhost:8080/hello`：向默认用户 Alice 发送问候。
- `http://localhost:8080/hello?name=Bob`：向 Bob 发送问候。

## 后续步骤 {id="next-steps"}

- [核心概念](/docs/intro/core-concepts)：模块、定义和注入背后的心智模型。
- [Koin for Ktor](/docs/reference/koin-ktor/ktor)：安装选项、在路由中注入以及 Ktor 事件。
- [请求作用域](/docs/reference/koin-ktor/ktor-scopes)：存在于单个 HTTP 请求生命周期内的实例。
- [Ktor 测试](/docs/reference/koin-ktor/ktor-testing)：使用 `testApplication` 和 Koin 测试你的路由。
- [工具](/docs/tooling)：适用于 Koin 的 IDE 插件和监控工具。