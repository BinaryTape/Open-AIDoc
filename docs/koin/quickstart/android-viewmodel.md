---
title: Android ViewModel
---

# Android ViewModel

在本教程中，你将构建一个 Android 应用程序，用于向从列表中选取的某个用户发送问候语。你将学习如何在 Koin 模块中声明 ViewModel、将其注入到 Activity 中，以及如何在 `Application` 类中启动 Koin。整个过程大约需要 10 分钟，并需要准备好 Android Studio。

本教程使用编译器插件 DSL。如需查看使用注解构建的相同应用，请参阅 [Android 与注解](/docs/quickstart/android-annotations)。如需对比不同风格，请参阅[选择你的风格](/docs/intro/choosing-your-style)。

## 获取代码 {id="get-the-code"}

完整示例位于 [koin-getting-started/android](https://github.com/InsertKoinIO/koin-getting-started/tree/main/android)。克隆该仓库并在 Android Studio 中打开 `android` 文件夹。

## Gradle 配置 {id="gradle-setup"}

该示例应用了 Koin 编译器插件，并添加了包含 ViewModel 支持的 `koin-android`。版本信息存储在版本目录（version catalog）中：

```toml
# gradle/libs.versions.toml
[versions]
# Kotlin, Android Gradle Plugin and AndroidX entries omitted
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-android = { module = "io.insert-koin:koin-android", version.ref = "koin" }
koin-test-junit4 = { module = "io.insert-koin:koin-test-junit4", version.ref = "koin" }
koin-android-test = { module = "io.insert-koin:koin-android-test", version.ref = "koin" }

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

    testImplementation(libs.koin.test.junit4)
    testImplementation(libs.koin.android.test)
}
```

编译器插件需要 Kotlin 2.3.20 或更高版本。有关当前版本和 BOM，请参阅 [Gradle 配置](/docs/setup/gradle)。有关插件选项，请参阅[编译器插件配置](/docs/setup/compiler-plugin)。

## 应用程序结构 {id="the-application"}

Activity 向 ViewModel 请求一条问候语。ViewModel 使用从 `UserRepository` 读取数据的 `UserService`：

```
User -> UserRepository -> UserService -> UserViewModel -> MainActivity
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

这些用户就是由仓库存储的数据。

## 编写仓库 {id="let-s-write-the-repository"}

仓库将用户保存在内存中，并支持按姓名查找用户：

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

`UserService` 在创建时加载用户并准备问候信息：

```kotlin
interface UserService {
    fun getUserOrNull(name: String = DEFAULT_USER.name): User?
    fun loadUsers()
    fun prepareHelloMessage(user: User?): String
}

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

`UserServiceImpl` 依赖于 `UserRepository`。Koin 会通过构造函数将其传入。

## 声明 Koin 模块 {id="let-s-declare-the-koin-module"}

模块是你声明 Koin 所创建组件的地方（请参阅[核心概念](/docs/intro/core-concepts)）。将这两个组件都声明为单例，并绑定到它们各自的接口：

```kotlin
import org.koin.dsl.bind
import org.koin.dsl.module
import org.koin.plugin.module.dsl.single

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
}
```

现在，任何请求 `UserService` 的组件都将获得相同的 `UserServiceImpl` 实例。关于 `single` 和 `bind` 的说明，请参阅[定义](/docs/reference/koin-core/definitions)。

## 编写 ViewModel {id="let-s-write-the-viewmodel"}

ViewModel 将姓名转换为问候语：

```kotlin
class UserViewModel(
    private val userService: UserService
) : ViewModel() {

    fun sayHello(name: String): String {
        val user = userService.getUserOrNull(name)
        val message = userService.prepareHelloMessage(user)
        return "[UserViewModel] $message"
    }
}
```

使用 `viewModel` 声明它：

```kotlin
import org.koin.plugin.module.dsl.viewModel

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
    viewModel<UserViewModel>()
}
```

此时 Android ViewModel 机制将接管该实例：它能够在配置变更时保持存活，并随其所有者一同销毁。关于形参和 `SavedStateHandle`，请参阅 [ViewModel](/docs/reference/koin-core/viewmodel)。

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

`by viewModel()` 会为你创建 ViewModel 工厂，并将该实例绑定到 Activity 的生命周期。其他委托（例如针对 Fragment 的 `activityViewModel()`）请参阅 [Android ViewModel](/docs/reference/koin-android/viewmodel)。

## 启动 Koin {id="let-s-start-koin"}

在你的 `Application` 类中启动 Koin，并在 `AndroidManifest.xml` 中注册该类：

```kotlin
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.context.startKoin
import org.koin.core.logger.Level

class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidLogger(Level.DEBUG)
            androidContext(this@MainApplication)
            modules(appModule)
        }
    }
}
```

`androidContext()` 使 Android `Context` 可供你的定义使用，而 `androidLogger()` 则将 Koin 日志发送到 Logcat。运行应用程序，输入姓名并点击按钮即可查看问候语。有关其他选项，请参阅[在 Android 上启动 Koin](/docs/reference/koin-android/start)。

## 后续步骤 {id="next-steps"}

- [核心概念](/docs/intro/core-concepts)：模块、定义与注入背后的心智模型。
- [Android ViewModel](/docs/reference/koin-android/viewmodel)：所有 ViewModel 委托、共享 ViewModel 以及导航图。
- [Android Jetpack Compose](/docs/quickstart/android-compose)：使用 Compose UI 实现的相同应用程序。
- [插桩测试](/docs/reference/koin-android/instrumented-testing)：结合 Koin 测试你的 Android 应用程序。
- [工具](/docs/tooling)：适用于 Koin 的 IDE 插件与监控工具。