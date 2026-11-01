---
title: Android
---

# Android

在本教程中，你将构建一个向从列表中选取的用户发送问候的 Android 应用。你将学习如何声明 Koin 模块、在 Activity 中注入 presenter，以及从你的 `Application` 类中启动 Koin。本教程大约需要 10 分钟，并需要使用 Android Studio。

本教程使用 Compiler Plugin DSL。有关使用注解构建相同应用的内容，请参阅 [Android & Annotations](/docs/quickstart/android-annotations)。如需对比不同风格，请参阅 [Choosing your style](/docs/intro/choosing-your-style)。[Android ViewModel](/docs/quickstart/android-viewmodel) 教程则使用 ViewModel 代替 presenter 来构建相同的应用。

## 获取代码 {id="get-the-code"}

完整示例位于 [koin-getting-started/android](https://github.com/InsertKoinIO/koin-getting-started/tree/main/android)。克隆该仓库并在 Android Studio 中打开 `android` 文件夹。

## Gradle 设置 {id="gradle-setup"}

该示例应用了 Koin Compiler Plugin 并添加了 `koin-android`。版本信息统一保存在版本目录 (version catalog) 中：

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

Compiler Plugin 需要 Kotlin 2.3.20 或更高版本。有关当前版本和 BOM 的信息，请参阅 [Gradle setup](/docs/setup/gradle)。有关插件选项，请参阅 [Compiler Plugin setup](/docs/setup/compiler-plugin)。

## 应用程序 {id="the-application"}

Activity 向 presenter 请求问候语。Presenter 使用 `UserService`，而后者会从 `UserRepository` 中读取数据：

```
User -> UserRepository -> UserService -> UserPresenter -> MainActivity
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

仓库将用户保存在内存中，并支持按名称查找用户：

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

`UserService` 在创建时加载用户并准备问候消息：

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

模块是你声明 Koin 所创建组件的地方（请参阅 [Core Concepts](/docs/intro/core-concepts)）。将这两个组件声明为单例，并绑定到对应的接口：

```kotlin
import org.koin.dsl.bind
import org.koin.dsl.module
import org.koin.plugin.module.dsl.single

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
}
```

现在，任何请求 `UserService` 的组件都会获取相同的 `UserServiceImpl` 实例。`single` 和 `bind` 在 [Definitions](/docs/reference/koin-core/definitions) 中进行了说明。

## 编写 presenter {id="let-s-write-the-presenter"}

Presenter 将用户名转换为问候语：

```kotlin
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

使用 `factory` 对其进行声明，以便每次请求都会创建一个新实例，并且 Koin 不会保留对它的引用：

```kotlin
import org.koin.plugin.module.dsl.factory

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
    factory<UserPresenter>()
}
```

`factory` presenter 的生命周期不会长于使用它的 Activity，从而避免 Activity 泄漏。

## 在 Activity 中注入 presenter {id="let-s-inject-the-presenter-in-the-activity"}

在 `MainActivity` 中使用 `by inject()` 委托来获取 presenter：

```kotlin
import org.koin.android.ext.android.inject

class MainActivity : AppCompatActivity() {

    private val presenter: UserPresenter by inject()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_simple)

        val nameInput = findViewById<EditText>(R.id.nameInput)
        val sayHelloButton = findViewById<Button>(R.id.sayHelloButton)
        val textField = findViewById<TextView>(R.id.text)

        sayHelloButton.setOnClickListener {
            val userName = nameInput.text.toString().trim().ifEmpty { "Alice" }
            textField.text = presenter.sayHello(userName)
        }
    }
}
```

`by inject()` 会在首次使用时惰性解析 presenter。支持该委托的其他 Android 组件已在 [Android Entry Points](/docs/reference/koin-android/entry-points) 中列出。

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

`androidContext()` 使 Android `Context` 可用于你的定义，而 `androidLogger()` 会将 Koin 日志输出到 Logcat。运行应用，输入名称并点击按钮即可查看问候语。有关其他选项，请参阅 [Starting Koin on Android](/docs/reference/koin-android/start)。

## 后续步骤 {id="next-steps"}

- [Core Concepts](/docs/intro/core-concepts)：模块、定义和注入背后的思维模型。
- [Android ViewModel](/docs/quickstart/android-viewmodel)：使用 ViewModel 构建相同的应用。
- [Android Entry Points](/docs/reference/koin-android/entry-points)：在 Fragment、Service、接收器等组件中进行注入。
- [Instrumented testing](/docs/reference/koin-android/instrumented-testing)：使用 Koin 测试你的 Android 应用。
- [Tooling](/docs/tooling)：适用于 Koin 的 IDE 插件和监控工具。