---
title: 從 Hilt 遷移
---

# 從 Hilt 遷移

本指南將逐步帶領你將 Android 應用程式從 Dagger Hilt 遷移至 Koin：Gradle、`Application` 類別、模組、繫結 (bindings)、ViewModel、入口點、限定詞、Compose 以及測試。每個 Koin 範例均提供三種 Koin 風格；若你不確定該選擇哪一種，請閱讀[選擇你的風格](/docs/intro/choosing-your-style)。關於這兩種架構的比較，請參閱 [Koin 與 Hilt 比較](/docs/intro/koin-vs-hilt)。

:::note
若要參考完整的實際遷移案例，請閱讀 [Migrating Now in Android to Koin](https://blog.insert-koin.io/migrating-now-in-android-to-koin-annotations-2-3-67d252dbb97d)：Google 擁有 30 個 Gradle 模組的範例應用程式，從 Hilt 遷移至 Koin Annotations。
:::

## 概念對應 {id="concept-mapping"}

| Hilt | 編譯器外掛程式 DSL | 註解 | 建構函式 / 傳統 DSL |
|------|---------------------|-------------|-------------|
| `@HiltAndroidApp` | `Application.onCreate()` 中的 `startKoin { }` | `@KoinApplication` + `startKoin<T>()` | `Application.onCreate()` 中的 `startKoin { }` |
| `@AndroidEntryPoint` | 不需要：`by inject()`、`by viewModel()` | 不需要 | 不需要 |
| `@Inject constructor` | `single<T>()` / `factory<T>()` | 類別上的 `@Singleton` / `@Factory` | `singleOf(::T)` / `factoryOf(::T)` |
| `@Module` + `@InstallIn` | `module { }` | `@Module` + `@ComponentScan` | `module { }` |
| `@Provides` | `single { create(::fn) }` | 函式上的 `@Singleton` / `@Factory` | `single { ... }` |
| `@Binds` | `bind Interface::class` | 自動（超型別）或 `binds = [...]` | `bind Interface::class` |
| `@Singleton` | `single` | `@Singleton` / `@Single` | `single` |
| `@HiltViewModel` | `viewModel<T>()` | `@KoinViewModel` | `viewModelOf(::T)` |
| `@HiltWorker` | `worker<T>()` | `@KoinWorker` | `workerOf(::T)` |
| `@Named`、自訂 `@Qualifier` | `named("x")`、參數上的 `@Named` | `@Named`、自訂 `@Qualifier` | `named("x")` |
| `@ApplicationContext` | `Context` 參數，由 `androidContext()` 提供 | 相同 | `androidContext()` |
| `@AssistedInject` | 注入參數 | `@InjectedParam` | 注入參數 |
| 自有類別中的 `@Inject` 欄位 | 建構函式參數 | 建構函式參數 | 建構函式參數 |
| `@EntryPoint`（Hilt 無法注入的架構類別） | 僅在該入口點使用 `KoinComponent` | 相同 | 相同 |
| `@HiltAndroidTest` | `KoinTestRule` | `KoinTestRule` | `KoinTestRule` |

### 作用域對應 {id="scope-mapping"}

| Hilt | Koin DSL | 註解 | 生命週期 |
|------|----------|-------------|----------|
| `@Singleton` (`SingletonComponent`) | `single` | `@Singleton` | 應用程式 |
| `@ActivityRetainedScoped` | `activityRetainedScope { }` | `@ActivityRetainedScope` | 在組態變更後保留 |
| `@ViewModelScoped` | `viewModelScope { }` | `@ViewModelScope` | ViewModel |
| `@ActivityScoped` | `activityScope { }` | `@ActivityScope` | Activity |
| `@FragmentScoped` | `fragmentScope { }` | `@FragmentScope` | Fragment |

作用域 DSL 與註解已在 [Android 作用域](/docs/reference/koin-android/scope)中詳細說明。

## 步驟 1：Gradle {id="step-1-gradle"}

移除 Hilt 外掛程式、`hilt-android` 以及 `hilt-compiler`（kapt 或 KSP）。接著新增 Koin：

```kotlin
dependencies {
    implementation(platform("io.insert-koin:koin-bom:$koin_version"))
    implementation("io.insert-koin:koin-android")
    implementation("io.insert-koin:koin-androidx-compose") // 如果你使用 Compose
}
```

若要使用編譯器外掛程式 DSL 或註解，還需套用 [Koin 編譯器外掛程式](/docs/setup/compiler-plugin)。它在 Kotlin 編譯器內部執行，並取代 Koin 原本所需的 kapt 或 KSP。產物的完整清單請參閱 [Gradle 設定](/docs/setup/gradle)。

## 步驟 2：Application 類別 {id="step-2-application-class"}

Hilt：

```kotlin
@HiltAndroidApp
class MyApplication : Application()
```

Koin：

**編譯器外掛程式 DSL**
```kotlin
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidLogger()
            androidContext(this@MyApplication)
            modules(appModule)
        }
    }
}
```

**註解**
```kotlin
import org.koin.plugin.module.dsl.startKoin

@KoinApplication
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin<MyApplication> {
            androidLogger()
            androidContext(this@MyApplication)
        }
    }
}
```

`@KoinApplication` 會載入所有標記為 `@Configuration` 的模組。若要明確列出模組，請使用 `@KoinApplication(modules = [AppModule::class])`。

**建構函式 / 傳統 DSL**
```kotlin
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidLogger()
            androidContext(this@MyApplication)
            modules(appModule)
        }
    }
}
```

`androidContext()` 讓所有定義都能取得 `Context`。請參閱[在 Android 上啟動 Koin](/docs/reference/koin-android/start)。

## 步驟 3：模組與 @Provides {id="step-3-modules-and-provides"}

Hilt：

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient = OkHttpClient.Builder().build()

    @Provides
    @Singleton
    fun provideApiService(client: OkHttpClient): ApiService =
        Retrofit.Builder()
            .baseUrl("https://api.example.com")
            .client(client)
            .build()
            .create(ApiService::class.java)
}
```

Koin：

**編譯器外掛程式 DSL**
```kotlin
import org.koin.plugin.module.dsl.create

fun okHttpClient(): OkHttpClient = OkHttpClient.Builder().build()

fun apiService(client: OkHttpClient): ApiService =
    Retrofit.Builder()
        .baseUrl("https://api.example.com")
        .client(client)
        .build()
        .create(ApiService::class.java)

val networkModule = module {
    single { create(::okHttpClient) }
    single { create(::apiService) }
}
```

**註解**
```kotlin
@Module
class NetworkModule {

    @Singleton
    fun okHttpClient(): OkHttpClient = OkHttpClient.Builder().build()

    @Singleton
    fun apiService(client: OkHttpClient): ApiService =
        Retrofit.Builder()
            .baseUrl("https://api.example.com")
            .client(client)
            .build()
            .create(ApiService::class.java)
}
```

**建構函式 / 傳統 DSL**
```kotlin
val networkModule = module {
    single { OkHttpClient.Builder().build() }
    single {
        Retrofit.Builder()
            .baseUrl("https://api.example.com")
            .client(get())
            .build()
            .create(ApiService::class.java)
    }
}
```

這裡沒有 `@InstallIn`：定義的生命週期來自其型別（`single`、`factory`、`scoped`），而非來自其安裝到的元件。帶有 `@Inject constructor` 的類別會轉換為 `single<T>()` / `factory<T>()`、類別上的註解，或是 `singleOf(::T)`。關於程式庫物件的更多資訊，請參閱[定義](/docs/reference/koin-core/definitions#classes-you-dont-own)。

## 步驟 4：介面繫結 {id="step-4-interface-bindings"}

Hilt：

```kotlin
@Module
@InstallIn(SingletonComponent::class)
abstract class DataModule {
    @Binds
    @Singleton
    abstract fun bindUserRepository(impl: UserRepositoryImpl): UserRepository
}
```

Koin：

**編譯器外掛程式 DSL**
```kotlin
val dataModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
}
```

**註解**
```kotlin
@Singleton
class UserRepositoryImpl(private val api: ApiService) : UserRepository
```

該類別會繫結至其所有的超型別。若只想繫結部分超型別，請使用 `@Singleton(binds = [UserRepository::class])`。

**建構函式 / 傳統 DSL**
```kotlin
val dataModule = module {
    singleOf(::UserRepositoryImpl) bind UserRepository::class
}
```

## 步驟 5：ViewModel {id="step-5-viewmodels"}

Hilt：

```kotlin
@HiltViewModel
class UserViewModel @Inject constructor(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel()
```

Koin：

**編譯器外掛程式 DSL**
```kotlin
class UserViewModel(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel()

val appModule = module {
    viewModel<UserViewModel>()
}
```

**註解**
```kotlin
@KoinViewModel
class UserViewModel(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel()
```

**建構函式 / 傳統 DSL**
```kotlin
class UserViewModel(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel()

val appModule = module {
    viewModelOf(::UserViewModel)
}
```

Koin 會將 `SavedStateHandle` 提供給 ViewModel 定義。在 Activity 或 Fragment 中，將 `by viewModels()` 替換為 `by viewModel()`。在 Compose 中，將 `hiltViewModel()` 替換為 `koinViewModel()`。請參閱 [Android ViewModel](/docs/reference/koin-android/viewmodel)。

## 步驟 6：Activity、Fragment 與其他入口點 {id="step-6-activities-fragments-and-other-entry-points"}

Hilt：

```kotlin
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    @Inject lateinit var analytics: Analytics
}
```

Koin：

```kotlin
class MainActivity : ComponentActivity() {
    private val analytics: Analytics by inject()
}
```

移除 `@AndroidEntryPoint`。在架構建立的 Activity、Fragment 及其他 Android 元件中，帶有 `@Inject lateinit var` 的欄位將改為 `by inject()`（延遲）或 `get()`（立即）。這在每種風格中都是相同的。Service、BroadcastReceiver 以及其他元件請參閱[入口點](/docs/reference/koin-android/entry-points)。

在你自己的類別中（repository、service、use case、ViewModel），將 `@Inject` 欄位移至建構函式參數中，並按照[步驟 3](#step-3-modules-and-provides)宣告該類別。這些類別絕不需要呼叫 `get()` 或 `by inject()`：

```kotlin
// Hilt：自有類別中的欄位注入
class SyncService @Inject constructor() {
    @Inject lateinit var repository: UserRepository
}

// Koin：建構函式注入
class SyncService(private val repository: UserRepository)
```

Hilt 的 `@EntryPoint` 是為了處理 Hilt 無法直接注入的架構類別（例如 `ContentProvider` 或程式庫回呼）。僅在此類入口點上實作 [KoinComponent](/docs/reference/koin-core/koin-component) 並呼叫 `by inject()`。請勿使用 `KoinComponent` 來取代應用程式自有類別中的 `@Inject` 欄位。

## 步驟 7：限定詞 {id="step-7-qualifiers"}

Hilt：

```kotlin
@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class IoDispatcher

@Provides
@IoDispatcher
fun provideIoDispatcher(): CoroutineDispatcher = Dispatchers.IO

class SyncRepository @Inject constructor(
    @IoDispatcher private val dispatcher: CoroutineDispatcher,
)
```

Koin：

**編譯器外掛程式 DSL**
```kotlin
import org.koin.core.annotation.Named

class SyncRepository(
    @Named("io") private val dispatcher: CoroutineDispatcher,
)

val dispatcherModule = module {
    single<CoroutineDispatcher>(named("io")) { Dispatchers.IO }
    single<SyncRepository>()
}
```

**註解**
保留你的限定詞註解。Koin 會讀取標記有 `@Qualifier`（Koin、`jakarta.inject` 或 `javax.inject`）的自訂註解：

```kotlin
import javax.inject.Qualifier

@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class IoDispatcher

@Module
class DispatcherModule {
    @Singleton
    @IoDispatcher
    fun ioDispatcher(): CoroutineDispatcher = Dispatchers.IO
}

@Singleton
class SyncRepository(
    @IoDispatcher private val dispatcher: CoroutineDispatcher,
)
```

**建構函式 / 傳統 DSL**
```kotlin
val dispatcherModule = module {
    single<CoroutineDispatcher>(named("io")) { Dispatchers.IO }
    single { SyncRepository(get(named("io"))) }
}
```

型別限定詞（`named<IoDispatcher>()`）與所有其他選項請參閱[限定詞](/docs/reference/koin-core/qualifiers)。Hilt 的 `@ApplicationContext` 不需要限定詞：`Context` 參數會自動接收傳遞給 `androidContext()` 的 context。

## 步驟 8：Compose {id="step-8-compose"}

Hilt 需要入口點才能從 Composable 存取非 ViewModel 的相依性。Koin 則可以直接解析：

```kotlin
@Composable
fun UserScreen(viewModel: UserViewModel = koinViewModel()) {
    val analytics: Analytics = koinInject()
}
```

請參閱 [Koin for Compose](/docs/reference/koin-compose/compose)。

## 步驟 9：測試 {id="step-9-tests"}

Hilt：

```kotlin
@HiltAndroidTest
class UserRepositoryTest {
    @get:Rule
    val hiltRule = HiltAndroidRule(this)

    @Inject lateinit var repository: UserRepository

    @Before
    fun init() = hiltRule.inject()
}
```

Koin：

```kotlin
class UserRepositoryTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(appModule, testModule)
    }

    private val repository: UserRepository by inject()
}
```

Hilt 的 `@TestInstallIn` 與 `@UninstallModules` 會轉變為在正式模組之後載入的測試模組。移除 `HiltTestApplication` 與 Hilt 測試執行器。請參閱[單元測試](/docs/reference/koin-test/testing)與 [Android 插樁測試](/docs/reference/koin-android/instrumented-testing)。

## 使用 @Inject 漸進式遷移 {id="migrate-gradually-with-inject"}

搭配註解使用時，編譯器外掛程式會讀取 JSR-330 註解：在 `@ComponentScan` 涵蓋的套件中，帶有 `@Inject constructor` 的類別會成為 factory，而標記有 `@Singleton`（來自 `jakarta.inject` 或 `javax.inject`）的類別則會成為 single。你可以保持這些類別不變，逐一遷移各個 Gradle 模組。請參閱 [JSR-330 註解](/docs/reference/koin-android/jsr330)。

## 多模組專案 {id="multi-module-projects"}

每個 Gradle 模組宣告自己的 Koin 模組，而應用程式模組在 `startKoin` 中載入所有這些模組。不需要配置元件階層，也不需要用於跨模組存取的 `@EntryPoint`：`:feature:home` 中的定義可以使用應用程式載入的任何定義。

搭配註解時，請在每個功能模組類別上加上 `@Module`、`@ComponentScan` 與 `@Configuration` 標籤。應用程式模組中的 `@KoinApplication` 無需手動列出即可自動找到它們。

模組組織、可見性與功能模組已在[多模組應用程式](/docs/reference/koin-android/multi-module)中詳細說明。

## 常見模式 {id="common-patterns"}

### 輔助注入 (Assisted injection) {id="assisted-injection"}

Hilt 的 `@AssistedInject` 與 `@AssistedFactory` 會轉變為注入參數。呼叫端在執行時傳入其值：

**編譯器外掛程式 DSL**
```kotlin
class UserDetailViewModel(
    @InjectedParam private val userId: String,
    private val repository: UserRepository,
) : ViewModel()

val appModule = module {
    viewModel<UserDetailViewModel>()
}
```

**註解**
```kotlin
@KoinViewModel
class UserDetailViewModel(
    @InjectedParam private val userId: String,
    private val repository: UserRepository,
) : ViewModel()
```

**建構函式 / 傳統 DSL**
```kotlin
class UserDetailViewModel(
    private val userId: String,
    private val repository: UserRepository,
) : ViewModel()

val appModule = module {
    viewModel { (userId: String) -> UserDetailViewModel(userId, get()) }
}
```

```kotlin
val viewModel: UserDetailViewModel by viewModel { parametersOf("user-42") }
```

請參閱[注入參數](/docs/reference/koin-core/injection-parameters)。

### Lazy 與 Provider {id="lazy-and-provider"}

- `dagger.Lazy<T>`：使用 Kotlin 的 `Lazy<T>` 建構函式參數，或在 Android 入口點中使用 `by inject()`（請參閱[注入](/docs/reference/koin-core/injection)）。
- `Provider<T>`：若要在每次呼叫時都從自有類別建立新的執行個體，請使用[進階模式](/docs/reference/koin-core/advanced-patterns)中的 provider 模式。

### WorkManager {id="workmanager"}

`@HiltWorker` worker 會成為 `worker` 定義，而 `HiltWorkerFactory` 在 `startKoin` 中會改用 `workManagerFactory()`。請參閱 [WorkManager](/docs/reference/koin-android/workmanager)。

## 檢查表 {id="checklist"}

- [ ] Gradle：移除 Hilt 外掛程式、`hilt-android` 與 `hilt-compiler`。新增 Koin，若有使用則一併新增編譯器外掛程式。如果沒有其他工具需要，請移除 kapt。
- [ ] Application：移除 `@HiltAndroidApp`，在 `onCreate()` 中透過 `androidContext()` 啟動 Koin。
- [ ] 模組：將 `@Module` / `@InstallIn` / `@Provides` / `@Binds` 轉換為 Koin 模組。
- [ ] ViewModel：移除 `@HiltViewModel`，宣告它們，並使用 `by viewModel()` / `koinViewModel()`。
- [ ] 入口點：移除 `@AndroidEntryPoint`，在 Android 元件中使用 `by inject()`。將自有類別的 `@Inject` 欄位移至建構函式參數。僅在 Koin 無法建立的架構類別中將 `@EntryPoint` 替換為 `KoinComponent`。
- [ ] 限定詞：保留自訂 `@Qualifier` 註解（註解風格）或改用 `named()`。
- [ ] Worker：替換 `@HiltWorker` 與 `HiltWorkerFactory`。
- [ ] 測試：移除 `@HiltAndroidTest`、`HiltAndroidRule` 以及 Hilt 測試執行器，改用 `KoinTestRule`。
- [ ] 組建：搭配編譯器外掛程式時，組建成功即代表相依圖完整。若未使用，請新增 [verify()](/docs/reference/koin-test/verify) 測試。
- [ ] 執行：啟動應用程式與測試套件。

## 疑難排解 {id="troubleshooting"}

### NoDefinitionFoundException {id="nodefinitionfoundexception"}

Koin 找不到所請求型別的定義。請檢查宣告該型別的模組是否已在 `startKoin` 中載入（或透過 `@Configuration` 找到），並確認所請求的型別與已宣告或繫結的型別相符。原本只有 `@Inject constructor` 且由 Hilt 注入的類別也需要 Koin 定義，除非 `@ComponentScan` 透過其 JSR-330 註解自動納入該類別。

### 同一型別有兩個定義導致取得錯誤的執行個體 {id="wrong-instance-with-two-definitions-of-the-same-type"}

在 Hilt 中，缺少限定詞會導致組建錯誤。而在 Koin 中，最後載入的定義會覆蓋先前的定義，除非你在啟動 Koin 時設定了 `allowOverride(false)`。請在兩個定義以及注入點都加上[限定詞](/docs/reference/koin-core/qualifiers)。

### 循環相依 {id="circular-dependency"}

兩個類別互相相依。請進行重構以打破循環，或使用 `Lazy<T>` 參數將其中一方設為延遲載入。編譯器外掛程式會在組建期回報循環相依。更多資訊請參閱[疑難排解](/docs/reference/koin-core/troubleshooting)。

## 相關內容 {id="related"}

- [Koin 與 Hilt 比較](/docs/intro/koin-vs-hilt)：這兩種架構有何不同。
- [JSR-330 註解](/docs/reference/koin-android/jsr330)：在遷移期間保留 `@Inject` 與 `@Singleton`。
- [在 Android 上啟動 Koin](/docs/reference/koin-android/start)：`startKoin`、`androidContext()` 與日誌記錄。
- [Android 作用域](/docs/reference/koin-android/scope)：Activity、Fragment 與 ViewModel 作用域。
- [單元測試](/docs/reference/koin-test/testing)：替換 Hilt 測試規則。
- [編譯期安全性](/docs/reference/koin-compiler/compile-safety)：編譯器外掛程式檢查的項目。