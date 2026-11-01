---
title: 核心概念
---

# 核心概念

本頁面透過一步步建立一個小範例，來解釋其他所有頁面背後的概念：定義 (definitions)、模組 (modules)、Koin 容器 (container)、注入 (injection)、作用域 (scopes)、限定詞 (qualifiers) 以及編譯期檢查 (compile-time checks)。每個章節都很簡短，並附有連結可前往包含詳細說明的頁面。本文假設你已知曉什麼是相依注入（請參閱 [什麼是相依注入？](/docs/intro/what-is-dependency-injection)）。

程式碼範例提供三種標籤頁：Compiler Plugin DSL、Annotations、Constructor / Classic DSL。挑選你偏好的風格即可，此選擇適用於所有頁面。若你不確定該使用哪種風格，請參閱 [選擇你的風格](/docs/intro/choosing-your-style)。

## 範例 {id="the-example"}

三個純 Kotlin 類別。各自在其建構函式中接收所需的相依項目，且對 Koin 一無所知：

```kotlin
class ApiService

class UserRepository(private val api: ApiService)

class UserViewModel(private val repository: UserRepository) : ViewModel()
```

Koin 的工作是建立 `ApiService`、將其傳遞給 `UserRepository`，再將其傳遞給 `UserViewModel`，完全無需你手動撰寫組裝程式碼。

## 定義 {id="definition"}

**定義** (definition) 會告知 Koin 如何建立某個型別以及該執行個體應保留多久：

**Compiler Plugin DSL**
```kotlin
single<ApiService>()
single<UserRepository>()
viewModel<UserViewModel>()
```

**Annotations**
```kotlin
@Singleton
class ApiService

@Singleton
class UserRepository(private val api: ApiService)

@KoinViewModel
class UserViewModel(private val repository: UserRepository) : ViewModel()
```

**Constructor / Classic DSL**
```kotlin
singleOf(::ApiService)
singleOf(::UserRepository)
viewModelOf(::UserViewModel)
```

關鍵字決定了生命週期。`single` 會為整個容器保留單一執行個體。`factory` 則在每次請求時建立新的執行個體。`viewModel` 遵循 ViewModel 的生命週期。Koin 讀取 `UserRepository` 的建構函式，發現其需要 `ApiService`，並從容器中解析該相依項。

詳細資訊：[定義](/docs/reference/koin-core/definitions)。

## 模組 {id="module"}

**模組** (module) 用於將定義分組。通常每個功能或分層會有一個模組：

**Compiler Plugin DSL**
```kotlin
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

val appModule = module {
    single<ApiService>()
    single<UserRepository>()
    viewModel<UserViewModel>()
}
```

**Annotations**
```kotlin
@Module
@ComponentScan("com.example.app")
class AppModule
```

`@ComponentScan` 會收集 `com.example.app` 套件及其子套件中所有帶有註解的類別。

**Constructor / Classic DSL**
```kotlin
import org.koin.dsl.module
import org.koin.core.module.dsl.*

val appModule = module {
    singleOf(::ApiService)
    singleOf(::UserRepository)
    viewModelOf(::UserViewModel)
}
```

模組僅是一種宣告描述。在 Koin 啟動且有程式碼請求執行個體之前，不會建立任何內容。模組可以包含其他模組，因此大型應用程式通常是由多個小型模組構成的樹狀結構。

詳細資訊：[模組](/docs/reference/koin-core/modules)。

## Koin 容器 {id="the-koin-container"}

`startKoin` 會建立**容器**（一個 `KoinApplication`）並將模組載入其中。你只需在應用程式的入口點呼叫它一次：

**Compiler Plugin DSL**
```kotlin
fun main() {
    startKoin {
        modules(appModule)
    }
}
```

**Annotations**
```kotlin
import org.koin.plugin.module.dsl.startKoin

@KoinApplication(modules = [AppModule::class])
class MyApp

fun main() {
    startKoin<MyApp>()
}
```

**Constructor / Classic DSL**
```kotlin
fun main() {
    startKoin {
        modules(appModule)
    }
}
```

在 Android 上，你可以在 `Application.onCreate()` 中呼叫它，並透過 `androidContext(this)` 傳遞 Android context。容器會保存定義以及迄今為止建立的執行個體。`stopKoin()` 則會將其關閉並釋放所有 `single`。

詳細資訊：[啟動 Koin](/docs/reference/koin-core/starting-koin) 與 [在 Android 上啟動 Koin](/docs/reference/koin-android/start)。

## 注入 {id="injection"}

物件取得其相依性有兩種方式。

**建構函式注入** (Constructor injection)：相依項為建構函式參數，Koin 會在建立物件時將其傳入。此範例中的 `UserRepository` 與 `UserViewModel` 便採用此方式。這是預設做法：類別保持純粹的 Kotlin，且你可以透過使用假物件呼叫建構函式來進行測試。

**從容器中檢索** (Retrieving from the container)：有些類別是由架構建立，而非由 Koin 建立（例如 Android `Activity`、Composable、Ktor 路由）。它們會透過 `get()`（立即）或 `inject()`（延遲載入，於首次存取時）向容器請求：

```kotlin
import org.koin.androidx.viewmodel.ext.android.viewModel

class UserActivity : AppCompatActivity() {
    private val viewModel: UserViewModel by viewModel()
}
```

```kotlin
import org.koin.compose.viewmodel.koinViewModel

@Composable
fun UserScreen(viewModel: UserViewModel = koinViewModel()) {
    ...
}
```

無論哪種風格，檢索方式都相同。請將檢索保留在這些入口點：入口點底下的所有內容均使用建構函式注入。

詳細資訊：[檢索相依性](/docs/reference/koin-core/injection)、[Android 入口點](/docs/reference/koin-android/entry-points)、[適用於 Compose 的 Koin](/docs/reference/koin-compose/compose)。

## 相依關係圖 {id="the-graph"}

綜合起來，容器中維護著這張圖：

```text
startKoin
  └── appModule
        ├── single     ApiService
        ├── single     UserRepository  ── needs ── ApiService
        └── viewModel  UserViewModel   ── needs ── UserRepository

UserActivity ── by viewModel() ──> UserViewModel
```

當 `UserActivity` 請求 `UserViewModel` 時，Koin 會先建立 `ApiService`（僅一次），接著建立 `UserRepository`（僅一次），然後建立繫結至該 Activity 之 ViewModel 生命週期的 `UserViewModel`。

## 作用域 {id="scope"}

`single` 的生命週期與容器相同，`factory` 的生命週期則取決於呼叫者持有的時間。**作用域** (scope) 涵蓋兩者之間的情境：其執行個體的存續時間與其他事物相同，例如使用者工作階段、畫面或請求。

假設 `CartRepository` 僅應在使用者登入期間存在：

**Compiler Plugin DSL**
```kotlin
class UserSession
class CartRepository(private val api: ApiService)

val sessionModule = module {
    scope<UserSession> {
        scoped<CartRepository>()
    }
}
```

**Annotations**
```kotlin
class UserSession

@Scope(UserSession::class)
@Scoped
class CartRepository(private val api: ApiService)
```

**Constructor / Classic DSL**
```kotlin
class UserSession
class CartRepository(private val api: ApiService)

val sessionModule = module {
    scope<UserSession> {
        scopedOf(::CartRepository)
    }
}
```

你可以在工作階段開始時開啟作用域，並在工作階段結束時將其關閉：

```kotlin
// inside a KoinComponent
val sessionScope = getKoin().createScope<UserSession>("session-42")
val cart: CartRepository = sessionScope.get()

sessionScope.close() // releases CartRepository
```

具作用域的定義可以使用來自根容器的定義（此處為 `ApiService`）。在 Android 上，Koin 為 Activity、Fragment 和 ViewModel 提供了現成的作用域，因此鮮少需要手動建立作用域。

詳細資訊：[作用域](/docs/reference/koin-core/scopes) 與 [Android 作用域](/docs/reference/koin-android/scope)。

## 限定詞 {id="qualifier"}

Koin 依據型別尋找定義。當兩個定義提供相同的型別時，**限定詞** (qualifier) 能為各自指定一個名稱：

**Compiler Plugin DSL**
```kotlin
interface NetworkClient

@Named("auth")
class AuthClient : NetworkClient

@Named("public")
class PublicClient : NetworkClient

class UserRepository(@Named("auth") private val client: NetworkClient)

val networkModule = module {
    single<AuthClient>() bind NetworkClient::class
    single<PublicClient>() bind NetworkClient::class
    single<UserRepository>()
}
```

**Annotations**
```kotlin
@Singleton
@Named("auth")
class AuthClient : NetworkClient

@Singleton
@Named("public")
class PublicClient : NetworkClient

@Singleton
class UserRepository(@Named("auth") private val client: NetworkClient)
```

**Constructor / Classic DSL**
```kotlin
val networkModule = module {
    single<NetworkClient>(named("auth")) { AuthClient() }
    single<NetworkClient>(named("public")) { PublicClient() }
    single { UserRepository(get(named("auth"))) }
}
```

詳細資訊：[限定詞](/docs/reference/koin-core/qualifiers)。

## 編譯期檢查 {id="compile-time-checks"}

若未使用編譯器外掛程式，遺漏定義的情況只會在程式碼執行時顯現：`get()` 會擲出 `NoDefinitionFoundException`。而搭配 [Koin 編譯器外掛程式](/docs/intro/koin-compiler-plugin) 時，同樣的錯誤會直接導致組建失敗。若你從 `appModule` 中移除 `single<ApiService>()`，編譯將中斷並顯示：

```text
[Koin][KOIN-D001] Missing dependency: ApiService
  required by: UserRepository (parameter 'api')
  in module: ...
```

外掛程式會在每個入口點（`startKoin`、`@KoinApplication`、Ktor 的 `install(Koin)`）以及每次 `get()`、`inject()` 或 `koinViewModel()` 呼叫處檢查完整的相依圖。若使用 Constructor 或 Classic DSL 且未搭配外掛程式，你可以在單元測試中透過 `verify()` 獲得類似的檢查。

詳細資訊：[編譯期安全性](/docs/reference/koin-compiler/compile-safety)、[驗證你的 Koin 設定](/docs/reference/koin-test/verify)。

## 相關資源 {id="related"}

- [選擇你的風格](/docs/intro/choosing-your-style)：該使用哪種宣告風格。
- [設定](/docs/setup)：將 Koin 和編譯器外掛程式加入你的組建中。
- [教學](/docs/quickstart/kotlin)：運用這些概念建構出一個完整的應用程式。
- [定義](/docs/reference/koin-core/definitions)：深入了解各種類型的定義。
- [作用域](/docs/reference/koin-core/scopes)：超越 single 與 factory 的生命週期。