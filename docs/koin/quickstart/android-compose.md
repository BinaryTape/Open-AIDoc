---
title: Android Jetpack Compose
---

# Android Jetpack Compose

在本教程中，您将构建一个带有 Jetpack Compose UI 的 Android 应用，向从列表中选出的用户展示问候信息。您将学习如何在 Koin 模块中声明 ViewModel，使用 `koinViewModel()` 将其注入到可组合项中，以及如何从 `Application` 类启动 Koin。本教程大约需要 10 分钟，并需要使用 Android Studio。

本教程使用编译器插件 DSL。如果需要了解使用注解的 Android 应用，请参阅 [Android & Annotations](/docs/quickstart/android-annotations)。如需对比不同风格，请参阅 [Choosing your style](/docs/intro/choosing-your-style)。

## 获取代码 {id="get-the-code"}

完整示例位于 [koin-getting-started/android-compose](https://github.com/InsertKoinIO/koin-getting-started/tree/main/android-compose)。克隆仓库并在 Android Studio 中打开 `android-compose` 文件夹。

## Gradle 配置 {id="gradle-setup"}

该示例应用了 Koin 编译器插件，并添加了 `koin-android` 和 `koin-androidx-compose`。版本信息保存在版本目录（version catalog）中：

```toml
# gradle/libs.versions.toml
[versions]
# Kotlin, Android Gradle Plugin, AndroidX and Compose entries omitted
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-android = { module = "io.insert-koin:koin-android", version.ref = "koin" }
koin-androidx-compose = { module = "io.insert-koin:koin-androidx-compose", version.ref = "koin" }
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
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.koin.compiler)
}

android {
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.koin.android)
    implementation(libs.koin.androidx-compose)

    // Compose BOM, ui, material3, activity-compose, lifecycle-viewmodel-compose
    implementation(platform(libs.compose.bom))
    ...

    testImplementation(libs.koin.test.junit4)
    testImplementation(libs.koin.android.test)
}
```

编译器插件需要 Kotlin 2.3.20 或更高版本。有关当前版本和 BOM，请参阅 [Gradle setup](/docs/setup/gradle)。有关插件选项，请参阅 [Compiler Plugin setup](/docs/setup/compiler-plugin)。

## 应用程序 {id="the-application"}

主屏幕向 ViewModel 请求问候语。ViewModel 使用 `UserService`，而该服务从 `UserRepository` 读取数据：

```
User -> UserRepository -> UserService -> UserViewModel -> MainScreen
```

## 编写用户数据 {id="let-s-write-the-user-data"}

首先从数据类和默认用户列表开始：

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

仓库将用户保留在内存中，并按名称查找用户：

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

`UserService` 在创建时加载用户并准备问候语：

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

## 编写 ViewModel {id="let-s-write-the-viewmodel"}

ViewModel 将名称转换为问候语：

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

与其他组件一样，它通过其构造函数接收 `UserService`。

## 声明 Koin 模块 {id="let-s-declare-the-koin-module"}

模块是您声明由 Koin 创建的组件的地方（请参阅 [Core Concepts](/docs/intro/core-concepts)）。将仓库和服务声明为绑定到其接口的单例，并使用 `viewModel` 声明 ViewModel：

```kotlin
import org.koin.dsl.bind
import org.koin.dsl.module
import org.koin.plugin.module.dsl.single
import org.koin.plugin.module.dsl.viewModel

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
    viewModel<UserViewModel>()
}
```

编译器插件会读取每个构造函数，并在构建时检查每个依赖项是否均已声明。定义类型在 [Definitions](/docs/reference/koin-core/definitions) 中进行了说明。

## 在可组合项中注入 ViewModel {id="let-s-inject-the-viewmodel-in-a-composable"}

在 `ComponentActivity` 中设置 Compose 内容，并在 `MainScreen` 的默认形参中使用 `koinViewModel()` 获取 ViewModel：

```kotlin
import org.koin.androidx.compose.koinViewModel

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                MainScreen()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    viewModel: UserViewModel = koinViewModel()
) {
    var nameInput by remember { mutableStateOf("") }
    var greetingMessage by remember { mutableStateOf("") }

    Scaffold(
        topBar = { TopAppBar(title = { Text("Koin Sample") }) }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            OutlinedTextField(
                value = nameInput,
                onValueChange = { nameInput = it },
                label = { Text("Enter name") },
                modifier = Modifier.fillMaxWidth()
            )

            Button(
                onClick = {
                    val userName = nameInput.trim().ifEmpty { "Alice" }
                    greetingMessage = viewModel.sayHello(userName)
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Say Hello")
            }

            if (greetingMessage.isNotEmpty()) {
                Text(
                    text = greetingMessage,
                    style = MaterialTheme.typography.bodyLarge,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}
```

`koinViewModel()` 从 Koin 获取 ViewModel，并将其绑定到最近的 `ViewModelStoreOwner`（在此处为 Activity）。将其作为默认形参，允许您在预览和测试中传入其他实例。其他 Compose API（例如 `koinInject()`）请参阅 [Compose ViewModel](/docs/reference/koin-compose/compose-viewmodel) 和 [Koin for Compose](/docs/reference/koin-compose/compose)。

## 启动 Koin {id="let-s-start-koin"}

在您的 `Application` 类中启动 Koin，并在 `AndroidManifest.xml` 中注册该类：

```kotlin
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.startKoin

class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidContext(this@MainApplication)
            modules(appModule)
        }
    }
}
```

`androidContext()` 使 Android `Context` 可供您的定义使用。运行应用，输入名称并点击按钮即可查看问候语。有关其他选项，请参阅 [Starting Koin on Android](/docs/reference/koin-android/start)。

## 后续步骤 {id="next-steps"}

- [Core Concepts](/docs/intro/core-concepts)：模块、定义和注入背后的心智模型。
- [Koin for Compose](/docs/reference/koin-compose/compose)：`koinInject()`、`KoinApplication` 和 Compose 配置。
- [Compose Multiplatform](/docs/quickstart/cmp)：与 iOS 共享 Compose UI 和 Koin 模块。
- [Compose testing](/docs/reference/koin-compose/compose-testing)：测试使用 Koin 的可组合项。
- [Tooling](/docs/tooling)：适用于 Koin 的 IDE 插件和监控工具。