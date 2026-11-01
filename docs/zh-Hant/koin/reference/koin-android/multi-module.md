---
title: 多模組應用程式
---

# 多模組應用程式

本頁面介紹如何在拆分為 Gradle 模組（`:app`、`:feature:*`、`:core:*）的 Android 應用程式中組織 Koin。內容涵蓋各個 Koin 模組的放置位置、應用程式如何載入它們、功能模組之間如何共享型別，以及動態功能模組。模組組合（`includes()`、公開和私有模組、`@Configuration`）已在[模組](/docs/reference/koin-core/modules)中說明。

## 專案結構 {id="project-layout"}

```
:app                  Application class, startKoin, appModule
:feature:login        LoginViewModel, LoginUseCase, loginModule
:feature:profile      ProfileViewModel, profileModule
:core:data            repositories, Retrofit, Room, dataModule
:core:domain          interfaces shared by features (UserRepository)
```

每個 Gradle 模組都為其自有的類別宣告 Koin 模組。這樣一來，各類別可以維持在其 Gradle 模組內的 `internal` 狀態：只有 Koin 模組是公開的。`:app` 模組是唯一知道所有功能模組的模組，因此它是 Koin 啟動的位置。

## 宣告與載入功能模組 {id="declaring-and-loading-feature-modules"}

**編譯器外掛程式 DSL**
```kotlin
// Gradle module ":feature:login"
internal class LoginUseCase(private val auth: AuthService)
internal class LoginViewModel(private val login: LoginUseCase) : ViewModel()

val loginModule = module {
    factory<LoginUseCase>()
    viewModel<LoginViewModel>()
}
```

```kotlin
// Gradle module ":app"
val appModule = module {
    includes(dataModule, loginModule, profileModule)
}

class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidLogger()
            androidContext(this@MainApplication)
            modules(appModule)
        }
    }
}
```

**註解**
```kotlin
// Gradle module ":feature:login"
@Module
@ComponentScan("com.app.feature.login")
@Configuration
class LoginModule

@Factory
internal class LoginUseCase(private val auth: AuthService)

@KoinViewModel
internal class LoginViewModel(private val login: LoginUseCase) : ViewModel()
```

```kotlin
// Gradle module ":app"
@KoinApplication
class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin<MainApplication> {
            androidLogger()
            androidContext(this@MainApplication)
        }
    }
}
```

`startKoin<MainApplication>()` 會尋找應用程式 classpath 上的所有 `@Configuration` 模組，包括來自功能 Gradle 模組的模組。新增功能只需新增 Gradle 相依性，無須其他操作。若要改為明確列出模組，請使用 `@KoinApplication(modules = [LoginModule::class, ProfileModule::class])`。

**建構函式 / 傳統 DSL**
```kotlin
// Gradle module ":feature:login"
internal class LoginUseCase(private val auth: AuthService)
internal class LoginViewModel(private val login: LoginUseCase) : ViewModel()

val loginModule = module {
    factoryOf(::LoginUseCase)
    viewModelOf(::LoginViewModel)
}
```

```kotlin
// Gradle module ":app"
val appModule = module {
    includes(dataModule, loginModule, profileModule)
}

class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidLogger()
            androidContext(this@MainApplication)
            modules(appModule)
        }
    }
}
```

## 在功能模組之間共享型別 {id="sharing-types-between-features"}

一個功能模組不應該相依於另一個功能模組。當 `:feature:profile` 需要目前使用者時，它會相依於核心模組中的介面，而實作則會在它所在的位置進行繫結：

```kotlin
// Gradle module ":core:domain"
interface UserRepository {
    suspend fun currentUser(): User
}
```

**編譯器外掛程式 DSL**
```kotlin
// Gradle module ":core:data"
internal class UserRepositoryImpl(private val api: ApiService) : UserRepository

val dataModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
}
```

**註解**
```kotlin
// Gradle module ":core:data"
@Singleton
internal class UserRepositoryImpl(private val api: ApiService) : UserRepository
```

**建構函式 / 傳統 DSL**
```kotlin
// Gradle module ":core:data"
internal class UserRepositoryImpl(private val api: ApiService) : UserRepository

val dataModule = module {
    singleOf(::UserRepositoryImpl) bind UserRepository::class
}
```

接著 `:feature:profile` 中的 `ProfileViewModel(private val users: UserRepository)` 就會在執行期解析出 `UserRepositoryImpl`。只要載入了每個 Koin 模組，Koin 就能跨 Gradle 模組進行解析：該功能模組只需要看見介面型別即可。您不需要為每個功能額外建立入口點介面或元件。

搭配編譯器外掛程式時，功能模組本身沒有 `startKoin`，因此其相依性會在 `:app` 編譯並組裝完整圖形時進行檢查。請參閱[編譯期安全性](/docs/reference/koin-compiler/compile-safety)。

## 動態功能模組 {id="dynamic-feature-modules"}

使用 Play Feature Delivery 時，基礎應用程式無法參照動態功能模組中的程式碼：相依性是從功能模組指向應用程式。請使用 `loadKoinModules()` 從功能模組本身（在其入口 Activity 中）載入該功能的 Koin 模組：

```kotlin
// Dynamic feature module ":feature:premium"
internal object PremiumKoin {
    private val modules = lazy { loadKoinModules(premiumModule) }
    fun load() = modules.value
}

class PremiumActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        PremiumKoin.load()
        super.onCreate(savedInstanceState)
    }
}
```

`lazy` 可確保該模組在每個處理程序中僅在 `super.onCreate()` 之前載入一次。關於這兩者的重要性以及如何卸載，已在[在 Android 上啟動 Koin](/docs/reference/koin-android/start#loading-modules-after-start)中說明。

編譯器外掛程式無法識別以此方式載入的模組。基礎應用程式所使用、且僅來自此類模組的型別必須標記為 `@Provided`（請參閱[編譯期安全性](/docs/reference/koin-compiler/compile-safety)）。

## 測試功能模組 {id="testing-feature-modules"}

請單獨測試每個功能模組，並為其他模組提供的內容使用假物件（fake）。搭配編譯器外掛程式時，完整的圖形會在建置時進行檢查。若未使用，請使用 `verify()` 檢查每個模組（請參閱[驗證您的設定](/docs/reference/koin-test/verify)）。使用 Koin 進行單元測試的內容請參閱[單元測試](/docs/reference/koin-test/testing)，裝置端測試請參閱[檢測測試 (Instrumented Testing)](/docs/reference/koin-android/instrumented-testing)。

## 相關內容 {id="related"}

- [模組](/docs/reference/koin-core/modules)：`includes()`、模組可見性與 `@Configuration` 探索。
- [在 Android 上啟動 Koin](/docs/reference/koin-android/start)：`startKoin` 以及在執行期載入模組。
- [編譯期安全性](/docs/reference/koin-compiler/compile-safety)：如何跨 Gradle 模組檢查相依圖。
- [延遲載入模組](/docs/reference/koin-core/lazy-modules)：在啟動時於背景載入功能模組。
- [Android 程式庫整合](/docs/reference/koin-android/binding-patterns)：資料層、領域層與 UI 層。