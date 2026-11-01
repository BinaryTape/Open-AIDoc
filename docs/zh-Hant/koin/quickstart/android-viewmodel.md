---
title: Android ViewModel
---

# Android ViewModel

在本教學中，你將建構一個 Android 應用程式，用於向從清單中選取的使用者問好。你將學習如何在 Koin 模組中宣告 ViewModel、將其注入到 Activity 中，以及從你的 `Application` 類別啟動 Koin。這大約需要 10 分鐘，且需要 Android Studio。

本教學使用 Compiler Plugin DSL。若要查看使用註解的同款應用程式，請參閱 [Android & Annotations](/docs/quickstart/android-annotations)。若要比較各種樣式，請參閱 [Choosing your style](/docs/intro/choosing-your-style)。

## 取得程式碼 {id="get-the-code"}

完整範例位於 [koin-getting-started/android](https://github.com/InsertKoinIO/koin-getting-started/tree/main/android)。請複製（clone）該存儲庫，並在 Android Studio 中開啟 `android` 資料夾。

## Gradle 設定 {id="gradle-setup"}

此範例套用了 Koin Compiler Plugin 並新增了包含 ViewModel 支援的 `koin-android`。版本資訊維護在版本目錄（version catalog）中：

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

Compiler Plugin 需要 Kotlin 2.3.20 或更高版本。有關目前版本和 BOM，請參閱 [Gradle setup](/docs/setup/gradle)。有關外掛程式選項，請參閱 [Compiler Plugin setup](/docs/setup/compiler-plugin)。

## 應用程式架構 {id="the-application"}

Activity 向 ViewModel 請求問候語。ViewModel 使用 `UserService`，而後者會從 `UserRepository` 讀取資料：

```
User -> UserRepository -> UserService -> UserViewModel -> MainActivity
```

## 編寫使用者資料 {id="let-s-write-the-user-data"}

首先建立資料類別以及預設的使用者清單：

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

存儲庫將使用者保留在記憶體中，並可依姓名尋找使用者：

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

`UserRepositoryImpl` 沒有任何相依性，因此 Koin 無需額外資訊即可建立它。

## 編寫服務 {id="let-s-write-the-service"}

`UserService` 在建立時載入使用者並準備問候訊息：

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

`UserServiceImpl` 相依於 `UserRepository`。Koin 會透過建構函式將其傳入。

## 宣告 Koin 模組 {id="let-s-declare-the-koin-module"}

模組是你宣告由 Koin 建立之組建的地方（請參閱 [Core Concepts](/docs/intro/core-concepts)）。將這兩個組建宣告為單例，並繫結至其介面：

```kotlin
import org.koin.dsl.bind
import org.koin.dsl.module
import org.koin.plugin.module.dsl.single

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
}
```

現在，任何請求 `UserService` 的組建都會獲得同一個 `UserServiceImpl` 執行個體。`single` 和 `bind` 的說明請參閱 [Definitions](/docs/reference/koin-core/definitions)。

## 編寫 ViewModel {id="let-s-write-the-viewmodel"}

ViewModel 將姓名轉換為問候訊息：

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

使用 `viewModel` 來宣告它：

```kotlin
import org.koin.plugin.module.dsl.viewModel

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
    viewModel<UserViewModel>()
}
```

現在 Android ViewModel 機制擁有了該執行個體：它能在配置變更時保留下來，並隨其擁有者一同清除。有關參數和 `SavedStateHandle`，請參閱 [ViewModel](/docs/reference/koin-core/viewmodel)。

## 在 Activity 中注入 ViewModel {id="let-s-inject-the-viewmodel-in-the-activity"}

在 `MainActivity` 中使用 `by viewModel()` 委託：

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

`by viewModel()` 會為你建立 ViewModel 工廠，並將執行個體繫結到 Activity 生命週期。其他委託（例如用於 Fragment 的 `activityViewModel()`）請參閱 [Android ViewModel](/docs/reference/koin-android/viewmodel)。

## 啟動 Koin {id="let-s-start-koin"}

在你的 `Application` 類別中啟動 Koin，並在 `AndroidManifest.xml` 中註冊該類別：

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

`androidContext()` 讓你的定義可以使用 Android 的 `Context`，而 `androidLogger()` 會將 Koin 記錄傳送至 Logcat。執行應用程式，輸入姓名並點擊按鈕即可查看問候語。有關其他選項，請參閱 [Starting Koin on Android](/docs/reference/koin-android/start)。

## 後續步驟 {id="next-steps"}

- [Core Concepts](/docs/intro/core-concepts)：模組、定義與注入背後的心智模型。
- [Android ViewModel](/docs/reference/koin-android/viewmodel)：所有 ViewModel 委託、共用 ViewModel 以及導覽圖。
- [Android Jetpack Compose](/docs/quickstart/android-compose)：使用 Compose UI 的同款應用程式。
- [Instrumented testing](/docs/reference/koin-android/instrumented-testing)：使用 Koin 測試你的 Android 應用程式。
- [Tooling](/docs/tooling)：適用於 Koin 的 IDE 外掛程式與監控工具。