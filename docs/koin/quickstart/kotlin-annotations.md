---
title: Kotlin 与注解
---

# Kotlin 与注解

在本教程中，你将构建一个加载用户列表并输出问候语的 Kotlin 控制台应用程序。你将学习如何注解类、将它们扫描到模块中，并从 `@KoinApplication` 对象启动 Koin。本教程大约耗时 10 分钟，需要 JDK 17 和 Gradle 环境。

本教程使用注解方式。如需查看使用编译器插件 DSL 实现的相同应用程序，请参阅 [Kotlin](/docs/quickstart/kotlin)。要比较不同的风格，请参阅[选择你的风格](/docs/intro/choosing-your-style)。

## 获取代码 {id="get-the-code"}

完整的示例位于 [koin-getting-started/kotlin-annotations](https://github.com/InsertKoinIO/koin-getting-started/tree/main/kotlin-annotations)。克隆该仓库并从 `kotlin-annotations` 文件夹运行它：

```bash
./gradlew run
```

## Gradle 设置 {id="gradle-setup"}

该示例应用了 Koin 编译器插件，并添加了 `koin-core` 与 `koin-annotations`。版本信息维护在版本目录中：

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

编译器插件负责处理这些注解，并且需要 Kotlin 2.3.20 或更高版本。`koin-annotations` 与 Koin 共用版本号。有关详细信息，请参阅 [Gradle 设置](/docs/setup/gradle)和[编译器插件设置](/docs/setup/compiler-plugin)。

## 应用程序 {id="the-application"}

该应用程序串联了三个组件。`UserApplication` 向 `UserService` 请求用户，而 `UserService` 从 `UserRepository` 读取数据：

```
User -> UserRepository -> UserService -> UserApplication
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

该仓库在内存中保存用户。使用 `@Singleton` 注解其实现类，以将其声明为单例：

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

Koin 会将 `UserRepositoryImpl` 绑定到其超类型，因此对 `UserRepository` 的请求将获取到该实例。`@Singleton` 来自 `org.koin.core.annotation`，等同于 `@Single`（参见[定义](/docs/reference/koin-core/definitions)）。

## 编写服务 {id="let-s-write-the-service"}

`UserService` 负责加载用户并准备问候信息。它同样是一个 `@Singleton`：

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

编译器插件会读取构造函数，并自动为你传递 `UserRepository` 实例。

## 编写应用程序类 {id="let-s-write-the-application-class"}

`UserApplication` 通过其构造函数接收 `UserService`，加载用户并输出问候语：

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

现在所有三个组件均已添加注解。接下来，将它们汇总到一个模块中。

## 声明 Koin 模块 {id="let-s-declare-the-koin-module"}

模块用于对定义进行分组（参见[核心概念](/docs/intro/core-concepts)）。声明一个扫描示例包的模块类：

```kotlin
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.Configuration
import org.koin.core.annotation.Module

@Module
@ComponentScan("org.koin.sample")
@Configuration
class AppModule
```

`@ComponentScan` 会注册 `org.koin.sample` 及其子包中每一个带有注解的类。`@Configuration` 使该模块能够被 `@KoinApplication` 入口点发现。这两者均在[模块](/docs/reference/koin-core/modules)中进行了说明。

## 启动 Koin {id="let-s-start-koin"}

声明一个 `@KoinApplication` 对象，并使用带类型的 `startKoin<T>()` 启动 Koin：

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

`startKoin<KoinUserApplication>()` 会加载每个 `@Configuration` 模块，因此你无需显式调用 `modules()`。该插件会在构建时验证完整的图，运行 `./gradlew run` 将输出 `Hello 'Alice' (alice@example.com)!`。有关其他选项，请参阅[启动 Koin](/docs/reference/koin-core/starting-koin)。

## 后续步骤 {id="next-steps"}

- [核心概念](/docs/intro/core-concepts)：模块、定义和注入背后的心智模型。
- [模块](/docs/reference/koin-core/modules)：`@Module`、`@ComponentScan`、`@Configuration` 以及模块包含。
- [注解参考](/docs/reference/koin-annotations/annotations-inventory)：所有注解及其形参。
- [测试](/docs/reference/koin-test/testing)：使用 Koin Test 编写测试。
- [工具](/docs/tooling)：适用于 Koin 的 IDE 插件与监控工具。