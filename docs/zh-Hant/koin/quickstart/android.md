---
title: Android
---

# Android

在這個教學中，你將建置一個 Android 應用程式，用來向從清單中選取的使用者打招呼。你將學習如何宣告 Koin 模組、在 Activity 中注入 Presenter，以及從你的 `Application` 類別啟動 Koin。這大約需要 10 分鐘，且需要 Android Studio。

本教學使用 Compiler Plugin DSL。若要查看使用註解的相同應用程式，請參閱 [Android 與註解](/docs/quickstart/android-annotations)。若要比較不同風格，請參閱 [選擇你的風格](/docs/intro/choosing-your-style)。[Android ViewModel](/docs/quickstart/android-viewmodel) 教學則使用 ViewModel 代替 Presenter 來建置相同的應用程式。

## 取得程式碼 {id="get-the-code"}

完整的範例位於 [koin-getting-started/android](https://github.com/InsertKoinIO/koin-getting-started/tree/main/android)。Clone 該存儲庫並在 Android Studio 中開啟 `android` 資料夾。

## Gradle 設定 {id="gradle-setup"}

此範例套用了 Koin 編譯器外掛程式並新增了 `koin-android`。版本資訊維護在版本目錄 (version catalog) 中：

```toml
# gradle/libs.versions.toml
[versions]
# 已省略 Kotlin、Android Gradle Plugin 與 AndroidX 項目
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

編譯器外掛程式需要 Kotlin 2.3.20 或更高版本。有關目前版本和 BOM，請參閱 [Gradle 設定](/docs/setup/gradle)。有關外掛程式選項，請參閱 [編譯器外掛程式設定](/docs/setup/compiler-plugin)。

## 應用程式 {id="the-application"}

Activity 向 Presenter 請求問候語。Presenter 使用 `UserService`，而後者會從 `UserRepository` 讀取資料：

```
User -> UserRepository -> UserService -> UserPresenter -> MainActivity
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

存儲庫將使用者保留在記憶體中，並依名稱尋找使用者：

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

模組是用來宣告 Koin 所建立組件的地方（請參閱 [核心概念](/docs/intro/core-concepts)）。將這兩個組件宣告為單例 (singleton)，並繫結至它們的介面：

```kotlin
import org.koin.dsl.bind
import org.koin.dsl.module
import org.koin.plugin.module.dsl.single

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
}
```

現在，任何請求 `UserService` 的組件都會取得相同的 `UserServiceImpl` 執行個體。`single` 和 `bind` 的說明請參閱 [定義](/docs/reference/koin-core/definitions)。

## 編寫 Presenter {id="let-s-write-the-presenter"}

Presenter 將名稱轉換為問候語：

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

使用 `factory` 來宣告它，這樣每次請求都會建立一個新的執行個體，且 Koin 不會保留對它的參照：

```kotlin
import org.koin.plugin.module.dsl.factory

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
    factory<UserPresenter>()
}
```

`factory` 的 Presenter 生命週期不會超過使用它的 Activity，從而避免 Activity 發生記憶體洩漏。

## 在 Activity 中注入 Presenter {id="let-s-inject-the-presenter-in-the-activity"}

使用 `by inject()` 委託在 `MainActivity` 中取得 Presenter：

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

`by inject()` 會延遲解析 Presenter，在初次使用時才進行解析。支援此功能的其他 Android 組件列於 [Android 入口點](/docs/reference/koin-android/entry-points) 中。

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

`androidContext()` 讓你的定義能夠存取 Android `Context`，而 `androidLogger()` 則將 Koin 記錄輸出至 Logcat。執行應用程式，輸入名稱並點擊按鈕即可查看問候語。其他選項請參閱 [在 Android 上啟動 Koin](/docs/reference/koin-android/start)。

## 後續步驟 {id="next-steps"}

- [核心概念](/docs/intro/core-concepts)：模組、定義與注入背後的心智模型。
- [Android ViewModel](/docs/quickstart/android-viewmodel)：使用 ViewModel 的相同應用程式。
- [Android 入口點](/docs/reference/koin-android/entry-points)：在 Fragment、Service、Receiver 等組件中進行注入。
- [插樁測試 (Instrumented testing)](/docs/reference/koin-android/instrumented-testing)：使用 Koin 測試你的 Android 應用程式。
- [工具支援](/docs/tooling)：適用於 Koin 的 IDE 外掛程式與監控工具。