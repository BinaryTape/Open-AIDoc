---
title: Android Jetpack Compose
---

# Android Jetpack Compose

在本教學中，你將建構一個具有 Jetpack Compose UI 的 Android 應用程式，用來向從清單中選取的使用者顯示問候語。你將學習如何在 Koin 模組中宣告 ViewModel、在 composable 中使用 `koinViewModel()` 注入它，並從你的 `Application` 類別啟動 Koin。這大約需要 10 分鐘，且需要 Android Studio。

本教學使用編譯器外掛程式 (Compiler Plugin) DSL。若要查看使用註解的 Android 應用程式，請參閱 [Android & Annotations](/docs/quickstart/android-annotations)。若要比較不同風格，請參閱 [Choosing your style](/docs/intro/choosing-your-style)。

## 取得程式碼 {id="get-the-code"}

完整的範例位於 [koin-getting-started/android-compose](https://github.com/InsertKoinIO/koin-getting-started/tree/main/android-compose)。請複製 (clone) 此存儲庫，並在 Android Studio 中開啟 `android-compose` 資料夾。

## Gradle 設定 {id="gradle-setup"}

該範例套用了 Koin 編譯器外掛程式，並新增了 `koin-android` 和 `koin-androidx-compose`。版本資訊維護在版本目錄 (version catalog) 中：

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

此編譯器外掛程式需要 Kotlin 2.3.20 或更新版本。如需目前版本和 BOM，請參閱 [Gradle setup](/docs/setup/gradle)。如需外掛程式選項，請參閱 [Compiler Plugin setup](/docs/setup/compiler-plugin)。

## 應用程式 {id="the-application"}

主畫面會向 ViewModel 要求問候訊息。ViewModel 使用 `UserService`，而該服務會從 `UserRepository` 讀取資料：

```
User -> UserRepository -> UserService -> UserViewModel -> MainScreen
```

## 編寫使用者資料 {id="let-s-write-the-user-data"}

首先從資料類別 (data class) 和預設的使用者清單開始：

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

此存儲庫將使用者保留在記憶體中，並依名稱查詢使用者：

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

`UserRepositoryImpl` 沒有相依項，因此 Koin 無需額外資訊即可建立它。

## 編寫服務 {id="let-s-write-the-service"}

`UserService` 在建立時會載入使用者並準備問候訊息：

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

`UserServiceImpl` 相依於 `UserRepository`。Koin 會透過建構函式傳遞它。

## 編寫 ViewModel {id="let-s-write-the-viewmodel"}

ViewModel 將名稱轉換為問候訊息：

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

與其他組建一樣，它透過其建構函式接收 `UserService`。

## 宣告 Koin 模組 {id="let-s-declare-the-koin-module"}

模組是宣告 Koin 所建立組建的地方（請參閱 [Core Concepts](/docs/intro/core-concepts)）。將存儲庫和服務宣告為繫結至其介面的單例 (singleton)，並使用 `viewModel` 宣告 ViewModel：

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

編譯器外掛程式會讀取每個建構函式，並在組建時期檢查每個相依項是否皆已宣告。定義型別請參閱 [Definitions](/docs/reference/koin-core/definitions)。

## 在 composable 中注入 ViewModel {id="let-s-inject-the-viewmodel-in-a-composable"}

在 `ComponentActivity` 中設定 Compose 內容，並在 `MainScreen` 的預設參數中使用 `koinViewModel()` 取得 ViewModel：

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

`koinViewModel()` 會從 Koin 取得 ViewModel 並將其繫結至最近的 `ViewModelStoreOwner`（此處為 Activity）。作為預設參數，它讓你在預覽和測試時可以傳入另一個執行個體。其他 Compose API（如 `koinInject()`）請參閱 [Compose ViewModel](/docs/reference/koin-compose/compose-viewmodel) 與 [Koin for Compose](/docs/reference/koin-compose/compose)。

## 啟動 Koin {id="let-s-start-koin"}

在你的 `Application` 類別中啟動 Koin，並在 `AndroidManifest.xml` 中註冊該類別：

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

`androidContext()` 讓你的定義可以使用 Android `Context`。執行應用程式，輸入名稱並輕觸按鈕即可查看問候語。其他選項請參閱 [Starting Koin on Android](/docs/reference/koin-android/start)。

## 後續步驟 {id="next-steps"}

- [Core Concepts](/docs/intro/core-concepts)：模組、定義與注入背後的心智模型。
- [Koin for Compose](/docs/reference/koin-compose/compose)：`koinInject()`、`KoinApplication` 與 Compose 設定。
- [Compose Multiplatform](/docs/quickstart/cmp)：與 iOS 共享 Compose UI 與 Koin 模組。
- [Compose testing](/docs/reference/koin-compose/compose-testing)：測試使用 Koin 的 composable。
- [Tooling](/docs/tooling)：Koin 的 IDE 外掛程式與監控工具。