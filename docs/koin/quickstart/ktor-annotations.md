---
title: Ktor 与注解
---

# Ktor 与注解

在本教程中，你将构建一个带有 `/hello` 端点的 Ktor Web 应用，该端点会向从列表中选取的某个用户发送问候语。你将学习如何注解类、将它们扫描到模块中，并在 Koin Ktor 插件中从 `@KoinApplication` 对象中加载它们。本教程大约需要 10 分钟，且需要 JDK 17 和 Gradle 环境。

本教程使用注解。若要查看使用 Compiler Plugin DSL 实现的相同应用，请参阅 [Ktor](/docs/quickstart/ktor)。若要比较这两种风格，请参阅[选择你的风格](/docs/intro/choosing-your-style)。

## 获取代码 {id="get-the-code"}

完整示例位于 [koin-getting-started/ktor-annotations](https://github.com/InsertKoinIO/koin-getting-started/tree/main/ktor-annotations)。克隆该仓库并从 `ktor-annotations` 文件夹运行 `app` 模块。

## Gradle 设置 {id="gradle-setup"}

该示例应用了 Koin Compiler Plugin，并添加了 `koin-ktor`、`koin-annotations` 和 `koin-logger-slf4j`。版本定义在版本目录（version catalog）中：

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

Compiler Plugin 会处理这些注解，并且需要 Kotlin 2.3.20 或更高版本。`koin-annotations` 与 Koin 共享版本。有关详细信息，请参阅 [Gradle 设置](/docs/setup/gradle)和 [Compiler Plugin 设置](/docs/setup/compiler-plugin)。

## 应用程序 {id="the-application"}

`/hello` 路由向 `UserService` 请求用户，而 `UserService` 从 `UserRepository` 读取数据：

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

这些用户就是仓库存储的数据。

## 编写仓库 {id="let-s-write-the-repository"}

仓库将用户保存在内存中。使用 `@Singleton` 注解该实现类：

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

Koin 会将 `UserRepositoryImpl` 绑定到其超类型，因此对 `UserRepository` 的请求将获取该实例。`@Singleton` 来自 `org.koin.core.annotation`，与 `@Single` 等效（请参阅[定义](/docs/reference/koin-core/definitions)）。

## 编写服务 {id="let-s-write-the-service"}

`UserService` 负责加载用户并准备问候消息。它也是一个 `@Singleton`：

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

Compiler Plugin 会读取构造函数并为你传入 `UserRepository` 实例。

## 声明 Koin 模块 {id="let-s-declare-the-koin-module"}

模块用于对定义进行分组（请参阅[核心概念](/docs/intro/core-concepts)）。声明一个扫描示例包的模块类：

```kotlin
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.Configuration
import org.koin.core.annotation.Module

@Module
@ComponentScan("org.koin.sample")
@Configuration
class AppModule
```

`@ComponentScan` 会注册 `org.koin.sample` 及其子包中的所有带注解的类。`@Configuration` 使该模块可被 `@KoinApplication` 入口点发现。这两者均在[模块](/docs/reference/koin-core/modules)中进行了说明。

## 安装 Koin 并编写路由 {id="let-s-install-koin-and-write-the-route"}

声明一个 `@KoinApplication` 对象。安装 `Koin` 插件并使用 `withConfiguration<T>()` 加载配置，然后在 `/hello` 路由中注入 `UserService`：

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

`withConfiguration<KoinUserApplication>()` 会加载每个 `@Configuration` 模块，因此你无需调用 `modules()`，并且插件会在构建时验证完整的依赖图。`slf4jLogger()` 将 Koin 日志发送到 SLF4J。有关特定于 Ktor 的 API，请参阅 [Koin for Ktor](/docs/reference/koin-ktor/ktor)。

## 启动服务器 {id="let-s-start-the-server"}

启动运行应用程序模块的嵌入式 Netty 服务器：

```kotlin
fun main(args: Array<String>) {
    embeddedServer(Netty, port = 8080) {
        main()
    }.start(wait = true)
}
```

运行应用，然后打开以下 URL：

- `http://localhost:8080/hello`：向默认用户 Alice 发送问候。
- `http://localhost:8080/hello?name=Bob`：向 Bob 发送问候。

## 后续步骤 {id="next-steps"}

- [核心概念](/docs/intro/core-concepts)：模块、定义与注入背后的心智模型。
- [Koin for Ktor](/docs/reference/koin-ktor/ktor)：安装选项、在路由中的注入以及 Ktor 事件。
- [注解参考](/docs/reference/koin-annotations/annotations-inventory)：所有注解及其形参。
- [Ktor 测试](/docs/reference/koin-ktor/ktor-testing)：使用 `testApplication` 和 Koin 测试你的路由。
- [工具](/docs/tooling)：适用于 Koin 的 IDE 插件和监控工具。