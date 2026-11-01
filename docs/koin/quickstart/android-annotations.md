---
title: Android 与注解
---

# Android 与注解

在本教程中，你将构建一个 Android 应用，向从列表中选出的用户显示问候语。你将学习如何为类添加注解、将它们扫描到模块中、为 ViewModel 提供其专属的作用域依赖项，以及如何从 `@KoinApplication` 类启动 Koin。整个过程大约需要 10 分钟，并需要 Android Studio。

本教程使用注解方式。若要查看使用编译器插件 DSL 实现的相同应用，请参阅 [Android](/docs/quickstart/android) 和 [Android ViewModel](/docs/quickstart/android-viewmodel)。若要对比不同风格，请参阅[选择你的风格](/docs/intro/choosing-your-style)。

## 获取代码 {id="get-the-code"}

完整示例位于 [koin-getting-started/android-annotations](https://github.com/InsertKoinIO/koin-getting-started/tree/main/android-annotations)。克隆该仓库并在 Android Studio 中打开 `android-annotations` 文件夹。

## Gradle 配置 {id="gradle-setup"}

该示例应用了 Koin 编译器插件，并添加了 `koin-android` 和 `koin-annotations`。版本信息定义在版本目录（version catalog）中：

```toml
# gradle/libs.versions.toml
[versions]
# Kotlin, Android Gradle Plugin and AndroidX entries omitted
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-android = { module = "io.insert-koin:koin-android", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }
koin-test-junit4 = { module = "io.insert-koin:koin-test-junit4", version.ref = "koin" }

[plugins]
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

```kotlin
// app/build.gradle.kts
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(libs.android.appcompat)
    implementation(libs.koin.android)
    implementation(libs.koin.annotations)

    testImplementation(libs.koin.test.junit4)
}
```

编译器插件负责处理这些注解，并且需要 Kotlin 2.3.20 或更高版本。`koin-annotations` 与 Koin 共享版本号。编译时安全性默认启用。有关详细信息，请参阅 [Gradle 配置](/docs/setup/gradle)和[编译器插件配置](/docs/setup/compiler-plugin)。

## 应用程序结构 {id="the-application"}

Activity 向 ViewModel 请求问候语。ViewModel 使用 `UserService`（从 `UserRepository` 读取数据），并拥有一个作用域限定为其生命周期的 `UserPresenter`：

```
User -> UserRepository -> UserService -> UserViewModel (+ UserPresenter) -> MainActivity
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

仓库将用户保存在内存中。使用 `@Singleton` 注解其实现：

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

Koin 会将 `UserRepositoryImpl` 绑定到其超类型，因此对 `UserRepository` 的请求将获得该实例。`@Singleton` 等同于 `@Single`（请参阅[定义](/docs/reference/koin-core/definitions)）。

## 编写服务 {id="let-s-write-the-service"}

`UserService` 在创建时加载用户并准备问候信息：

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

    init {
        loadUsers()
    }

    override fun getUserOrNull(name: String): User? = userRepository.findUserOrNull(name)

    override fun loadUsers() {
        userRepository.addUsers(DEFAULT_USERS)
    }

    override fun prepareHelloMessage(user: User?): String {
        return user?.let { "Hello '${user.name}' (${user.email})!" } ?: "User not found"
    }
}
```

编译器插件会读取构造函数并为你传入 `UserRepository` 实例。

## 编写 Presenter 和 ViewModel {id="let-s-write-the-presenter-and-the-viewmodel"}

Presenter 负责格式化问候语。为其添加 `@ViewModelScope` 注解，使每个 ViewModel 都能获得自己的专属实例：

```kotlin
import org.koin.core.annotation.ViewModelScope

@ViewModelScope
class UserPresenter(
    private val userService: UserService
) {

    fun sayHello(name: String): String {
        val user = userService.getUserOrNull(name)
        val message = userService.prepareHelloMessage(user)
        return "[UserPresenter] $message"
    }
}
```

ViewModel 使用 `@KoinViewModel` 注解，并添加 `@ViewModelScope` 以便接收限定作用域的 Presenter：

```kotlin
import org.koin.core.annotation.KoinViewModel
import org.koin.core.annotation.ViewModelScope

@ViewModelScope
@KoinViewModel
class UserViewModel(
    private val userService: UserService,
    private val userPresenter: UserPresenter
) : ViewModel() {

    fun sayHello(name: String): String {
        val user = userService.getUserOrNull(name)
        val message = userService.prepareHelloMessage(user)
        return "[UserViewModel] $message"
    }
}
```

Presenter 的生命周期与 ViewModel 相同，并在 ViewModel 被清除时释放。ViewModel 作用域在 [ViewModel](/docs/reference/koin-core/viewmodel) 中有详细介绍，常规作用域请参阅[作用域](/docs/reference/koin-core/scopes)。

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

`@ComponentScan` 会注册 `org.koin.sample` 及其子包中的所有带注解类。`@Configuration` 使该模块能够被 `@KoinApplication` 入口点发现。这两者均在[模块](/docs/reference/koin-core/modules)中进行了说明。

## 在 Activity 中注入 ViewModel {id="let-s-inject-the-viewmodel-in-the-activity"}

在 `MainActivity` 中使用 `by viewModel()` 委托：

```kotlin
import org.koin.androidx.viewmodel.ext.android.viewModel

class MainActivity : AppCompatActivity() {

    private val viewModel: UserViewModel by viewModel()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_simple)

        val nameInput = findViewById<EditText>(R.id.nameInput)
        val sayHelloButton = findViewById<Button>(R.id.sayHelloButton)
        val textField = findViewById<TextView>(R.id.text)

        sayHelloButton.setOnClickListener {
            val userName = nameInput.text.toString().trim().ifEmpty { "Alice" }
            textField.text = viewModel.sayHello(userName)
        }
    }
}
```

`by viewModel()` 会为你创建 ViewModel 工厂并将该实例绑定到 Activity 生命周期。其他委托见 [Android ViewModel](/docs/reference/koin-android/viewmodel)。

## 启动 Koin {id="let-s-start-koin"}

为你的 `Application` 类添加 `@KoinApplication` 注解，并通过带类型的 `startKoin<T>()` 启动 Koin。在 `AndroidManifest.xml` 中注册该类：

```kotlin
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.annotation.KoinApplication
import org.koin.core.annotation.KoinViewModelScopeApi
import org.koin.core.logger.Level
import org.koin.core.option.viewModelScopeFactory
import org.koin.plugin.module.dsl.startKoin

@OptIn(KoinViewModelScopeApi::class)
@KoinApplication
class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin<MainApplication> {
            androidContext(this@MainApplication)
            androidLogger(level = Level.DEBUG)
            options(viewModelScopeFactory())
        }
    }
}
```

`startKoin<MainApplication>` 会加载所有 `@Configuration` 模块，因此无需手动调用 `modules()`。`viewModelScopeFactory()` 告知 Koin 为每个 ViewModel 创建一个作用域，这正是 `@ViewModelScope` 所需要的。这是一个需要显式选择加入的 API（`@KoinViewModelScopeApi`）。关于其他选项，请参阅[在 Android 上启动 Koin](/docs/reference/koin-android/start)。

## 在构建时检查依赖图 {id="let-s-check-the-graph-at-build-time"}

构建项目。编译器插件会验证完整的依赖图：如果存在缺失的依赖项、限定符不匹配，或者在未声明的 ViewModel 上调用了 `by viewModel()`，构建都将失败并指出具体的文件和行号。

运行应用，输入名称并点击按钮即可查看问候信息。有关插件检查内容的列表，请参阅[编译时安全性](/docs/reference/koin-compiler/compile-safety)。

## 后续步骤 {id="next-steps"}

- [核心概念](/docs/intro/core-concepts)：模块、定义和注入背后的思维模型。
- [Android 作用域](/docs/reference/koin-android/scope)：Android 上的 Activity、Fragment 和 ViewModel 作用域。
- [注解参考](/docs/reference/koin-annotations/annotations-inventory)：所有注解及其形参。
- [插桩测试](/docs/reference/koin-android/instrumented-testing)：结合 Koin 测试你的 Android 应用。
- [工具](/docs/tooling)：适用于 Koin 的 IDE 插件和监控工具。