---
title: Kotlin
---

# Kotlin

在本教程中，你将构建一个加载用户列表并输出问候语的 Kotlin 控制台应用。你将学习如何声明 Koin 模块、将实现绑定到接口，以及启动 Koin。整个过程大约需要 10 分钟，并且需要 JDK 17 和 Gradle。

本教程使用的是 Compiler Plugin DSL。若要查看使用注解的相同应用，请参阅 [Kotlin & Annotations](/docs/quickstart/kotlin-annotations)。如需比较这两种风格，请参阅 [Choosing your style](/docs/intro/choosing-your-style)。

## 获取代码 {id="get-the-code"}

完整示例位于 [koin-getting-started/kotlin](https://github.com/InsertKoinIO/koin-getting-started/tree/main/kotlin)。克隆该仓库并从 `kotlin` 文件夹中运行：

```bash
./gradlew run
```

## Gradle 配置 {id="gradle-setup"}

该示例应用了 Koin Compiler 插件并添加了 `koin-core`。版本信息存储在版本目录（version catalog）中：

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

编译器插件需要 Kotlin 2.3.20 或更高版本。有关当前版本及 BOM 的信息，请参阅 [Gradle 配置](/docs/setup/gradle)。有关插件选项，请参阅 [Compiler Plugin 配置](/docs/setup/compiler-plugin)。

## 应用程序 {id="the-application"}

该应用串联了三个组件。`UserApplication` 向 `UserService` 请求用户，而 `UserService` 则从 `UserRepository` 中读取：

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

这些用户就是仓库中存储的数据。

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

## 声明 Koin 模块 {id="let-s-declare-the-koin-module"}

模块用于声明由 Koin 创建的组件（请参阅[核心概念](/docs/intro/core-concepts)）。将 `UserRepositoryImpl` 声明为单例，并作为 `UserRepository` 提供：

```kotlin
import org.koin.dsl.bind
import org.koin.dsl.module
import org.koin.plugin.module.dsl.single

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
}
```

现在，任何请求 `UserRepository` 的组件都会获得同一个 `UserRepositoryImpl` 实例。有关 `single` 和 `bind` 的说明，请参阅[定义](/docs/reference/koin-core/definitions)。

## 编写服务 {id="let-s-write-the-service"}

`UserService` 负责加载用户并准备问候信息：

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

将其添加到模块中：

```kotlin
val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
}
```

`UserServiceImpl` 在其构造函数中接收一个 `UserRepository`。编译器插件会读取该构造函数，并自动为你传入 `UserRepositoryImpl` 实例。

## 编写应用程序类 {id="let-s-write-the-application-class"}

`UserApplication` 通过构造函数接收 `UserService`，加载用户并输出问候语：

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

同样在模块中声明它：

```kotlin
val appModule = module {
    single<UserApplication>()
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
}
```

现在所有三个组件都已包含在模块中。插件会在构建时检查每个构造函数形参是否都存在对应的定义。

## 启动 Koin {id="let-s-start-koin"}

在 `main()` 中使用你的模块启动 Koin，然后从容器中获取 `UserApplication`：

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

运行 `./gradlew run`，应用将输出 `Hello 'Alice' (alice@example.com)!`。有关 `startKoin` 及其选项的详细介绍，请参阅[启动 Koin](/docs/reference/koin-core/starting-koin)。

## 后续步骤 {id="next-steps"}

- [核心概念](/docs/intro/core-concepts)：模块、定义和注入背后的心智模型。
- [定义](/docs/reference/koin-core/definitions)：各种定义类型与绑定选项。
- [JUnit 测试](/docs/quickstart/junit-test)：使用 Koin Test 测试该应用。
- [编译期安全](/docs/reference/koin-compiler/compile-safety)：编译器插件在你的依赖图中检查的内容。
- [工具支持](/docs/tooling)：适用于 Koin 的 IDE 插件和监控工具。