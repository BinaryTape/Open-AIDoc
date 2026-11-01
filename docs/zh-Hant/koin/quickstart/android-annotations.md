---
title: Android & 註解
---

# Android & 註解

在本教學中，你將建置一個 Android 應用程式，用來向從清單中選取的使用者打招呼。你將學習如何為類別加上註解、將它們掃描進模組中、為 ViewModel 提供其專屬的作用域相依性，並從 `@KoinApplication` 類別啟動 Koin。這大約需要 10 分鐘，且需要 Android Studio。

本教學使用註解。若要查看使用編譯器外掛程式 DSL 的相同應用程式，請參閱 [Android](/docs/quickstart/android) 和 [Android ViewModel](/docs/quickstart/android-viewmodel)。若要比較這兩種風格，請參閱[選擇你的風格](/docs/intro/choosing-your-style)。

## 取得程式碼 {id="get-the-code"}

完整範例位於 [koin-getting-started/android-annotations](https://github.com/InsertKoinIO/koin-getting-started/tree/main/android-annotations)。複製該存儲庫並在 Android Studio 中開啟 `android-annotations` 資料夾。

## Gradle 設定 {id="gradle-setup"}

此範例套用了 Koin 編譯器外掛程式，並新增了 `koin-android` 與 `koin-annotations`。版本資訊維護在版本目錄（version catalog）中：

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

編譯器外掛程式負責處理註解，並需要 Kotlin 2.3.20 或更高版本。`koin-annotations` 共享 Koin 的版本。編譯期安全性預設為啟用。詳細資訊請參閱 [Gradle 設定](/docs/setup/gradle)與[編譯器外掛程式設定](/docs/setup/compiler-plugin)。

## 應用程式架構 {id="the-application"}

Activity 向 ViewModel 請求問候語。ViewModel 使用從 `UserRepository` 讀取資料的 `UserService`，並擁有限定於其生命週期作用域的 `UserPresenter`：

```
User -> UserRepository -> UserService -> UserViewModel (+ UserPresenter) -> MainActivity
```

## 編寫使用者資料 {id="let-s-write-the-user-data"}

首先從資料類別（data class）與預設的使用者清單開始：

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

存儲庫將使用者保留在記憶體中。使用 `@Singleton` 為其實作加上註解：

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

Koin 會將 `UserRepositoryImpl` 繫結至其基底型別，因此請求 `UserRepository` 時會獲取此執行個體。`@Singleton` 等同於 `@Single`（請參閱[定義](/docs/reference/koin-core/definitions)）。

## 編寫服務 {id="let-s-write-the-service"}

`UserService` 在建立時載入使用者並準備問候語：

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

編譯器外掛程式會讀取建構函式，並自動為你傳入 `UserRepository` 執行個體。

## 編寫 Presenter 與 ViewModel {id="let-s-write-the-presenter-and-the-viewmodel"}

Presenter 負責格式化問候語。使用 `@ViewModelScope` 為其加上註解，這樣每個 ViewModel 都會獲得其專屬的執行個體：

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

ViewModel 加上了 `@KoinViewModel` 註解，並加上 `@ViewModelScope` 註解以便接收具作用域限定的 Presenter：

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

Presenter 的存活時間與 ViewModel 相同，並在 ViewModel 被清除時釋放。ViewModel 作用域的詳細說明請參閱 [ViewModel](/docs/reference/koin-core/viewmodel)，一般作用域請參閱[作用域](/docs/reference/koin-core/scopes)。

## 宣告 Koin 模組 {id="let-s-declare-the-koin-module"}

模組用於分組定義（請參閱[核心概念](/docs/intro/core-concepts)）。宣告一個掃描範例套件的模組類別：

```kotlin
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.Configuration
import org.koin.core.annotation.Module

@Module
@ComponentScan("org.koin.sample")
@Configuration
class AppModule
```

`@ComponentScan` 會註冊 `org.koin.sample` 及其子套件中所有帶有註解的類別。`@Configuration` 讓該模組能夠被 `@KoinApplication` 入口點偵測到。兩者的詳細說明請參閱[模組](/docs/reference/koin-core/modules)。

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

`by viewModel()` 會自動為你建立 ViewModel 工廠，並將執行個體繫結到 Activity 的生命週期。其他委託請參閱 [Android ViewModel](/docs/reference/koin-android/viewmodel)。

## 啟動 Koin {id="let-s-start-koin"}

為你的 `Application` 類別加上 `@KoinApplication` 註解，並使用具型別的 `startKoin<T>()` 啟動 Koin。在 `AndroidManifest.xml` 中註冊該類別：

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

`startKoin<MainApplication>` 會載入所有 `@Configuration` 模組，因此無需呼叫 `modules()`。`viewModelScopeFactory()` 會告知 Koin 為每個 ViewModel 建立一個作用域，這是 `@ViewModelScope` 所必需的。這是一個需要明確啟用（opt-in）的 API（`@KoinViewModelScopeApi`）。有關其他選項，請參閱[在 Android 上啟動 Koin](/docs/reference/koin-android/start)。

## 在建置期檢查相依圖 {id="let-s-check-the-graph-at-build-time"}

建置專案。編譯器外掛程式會驗證完整的相依圖：若遺失相依性、限定詞不相符，或是對未宣告的 ViewModel 呼叫 `by viewModel()`，都會導致建置失敗，並指出檔案與行號。

執行應用程式，輸入名稱並輕觸按鈕即可看到問候語。該外掛程式檢查的項目列於[編譯期安全性](/docs/reference/koin-compiler/compile-safety)中。

## 後續步驟 {id="next-steps"}

- [核心概念](/docs/intro/core-concepts)：模組、定義與注入背後的心智模型。
- [Android 作用域](/docs/reference/koin-android/scope)：Android 上的 Activity、Fragment 與 ViewModel 作用域。
- [註解參考](/docs/reference/koin-annotations/annotations-inventory)：所有註解及其參數。
- [檢測測試 (Instrumented testing)](/docs/reference/koin-android/instrumented-testing)：使用 Koin 測試你的 Android 應用程式。
- [工具](/docs/tooling)：適用於 Koin 的 IDE 外掛程式與監控工具。