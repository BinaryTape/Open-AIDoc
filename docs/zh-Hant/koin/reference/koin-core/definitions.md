---
title: 定義
---

# 定義

定義會告訴 Koin 如何建立某個型別，以及該執行個體應保留多久。本頁面涵蓋定義型別、介面繫結、建構函式參數的解析方式，以及非自有的類別之定義。本文假設你已經了解什麼是模組（請參閱[核心概念](/docs/intro/core-concepts)）。

程式碼範例提供三種分頁標籤：Compiler Plugin DSL、Annotations、Constructor / Classic DSL。請選擇你偏好的方式，該選擇將套用至所有頁面。若你不確定該使用哪種風格，請閱讀[選擇你的風格](/docs/intro/choosing-your-style)。

## 定義型別 {id="definition-types"}

| 型別 | 執行個體 | 一般用途 |
|------|----------|-------------|
| `single` | 單一執行個體，在 Koin 容器的生命週期內持續保留 | Repository、API 用戶端、資料庫 |
| `factory` | 每次被請求時建立新的執行個體 | Presenter、使用案例、短期的物件 |
| `scoped` | 每個作用域單一執行個體，當作用域關閉時釋放 | 繫結至 Activity、工作階段 (session)、請求的物件 |
| `viewModel` | 由 ViewModel 生命週期管理 | ViewModel（Android 與 Compose Multiplatform） |
| `worker` | 由 WorkManager 建立 | Android `ListenableWorker` |

宣告方式：

**Compiler Plugin DSL**
```kotlin
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

val appModule = module {
    single<Database>()
    single<UserRepository>()
    factory<UserPresenter>()
    viewModel<UserViewModel>()
}
```

**Annotations**
```kotlin
@Singleton
class Database

@Singleton
class UserRepository(private val database: Database)

@Factory
class UserPresenter(private val repository: UserRepository)

@KoinViewModel
class UserViewModel(private val repository: UserRepository) : ViewModel()
```

`@Singleton` 與 `@Single` 是等價的。建議優先使用 JSR-330 名稱 `@Singleton`。

**Constructor / Classic DSL**
```kotlin
import org.koin.dsl.module
import org.koin.core.module.dsl.*

val appModule = module {
    singleOf(::Database)
    singleOf(::UserRepository)
    factoryOf(::UserPresenter)
    viewModelOf(::UserViewModel)
}
```

你也可以自己撰寫建構函式呼叫，為每個相依性使用 `get()`：

```kotlin
val appModule = module {
    single { Database() }
    single { UserRepository(get()) }
    factory { UserPresenter(get()) }
    viewModel { UserViewModel(get()) }
}
```

使用 Compiler Plugin DSL 與註解時，你完全不需要撰寫 `get()`。[Koin 編譯器外掛程式](/docs/intro/koin-compiler-plugin)會讀取建構函式並為你產生呼叫，隨後在建置階段檢查是否已宣告每個相依性。

`single` 與 `factory` 如上所述。`scoped` 需要宣告作用域：請參閱[作用域](/docs/reference/koin-core/scopes)。`viewModel` 有其專屬頁面：請參閱 [ViewModel](/docs/reference/koin-core/viewmodel)。`worker` 則在 [WorkManager](/docs/reference/koin-android/workmanager) 中介紹。

### Single 還是 factory？ {id="single-or-factory"}

當物件沒有個別呼叫者專屬的狀態，且建立成本較高（如資料庫、HTTP 用戶端）時，請使用 `single`。當每個呼叫者需要自己的執行個體，或是物件持有的狀態不得共用時，請使用 `factory`。如果某個執行個體的存活時間應比 factory 長，但比整個應用程式短，則你需要[作用域](/docs/reference/koin-core/scopes)。

## 介面繫結 {id="interface-binding"}

多數情況下，取用端相依於介面，而非實作。將實作繫結至介面：

**Compiler Plugin DSL**
```kotlin
val dataModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class

    // several types at once
    single<MyServiceImpl>() binds arrayOf(ServiceA::class, ServiceB::class)
}
```

**Annotations**
```kotlin
@Singleton
class UserRepositoryImpl(private val database: Database) : UserRepository
```

繫結是自動的：Koin 會將類別繫結至其所有超型別。若只要繫結其中的部分型別，請將它們列出：

```kotlin
@Singleton(binds = [UserRepository::class])
class UserRepositoryImpl(private val database: Database) : UserRepository, Closeable
```

**Constructor / Classic DSL**
```kotlin
val dataModule = module {
    singleOf(::UserRepositoryImpl) bind UserRepository::class

    // or declare the interface type directly
    single<UserRepository> { UserRepositoryImpl(get()) }
}
```

取用端隨後請求 `UserRepository`，即可取得 `UserRepositoryImpl` 的執行個體。當有兩個定義繫結至同一個型別時，你需要一個[限定詞](/docs/reference/koin-core/qualifiers)來區分它們。

## 建構函式參數 {id="constructor-parameters"}

Koin 會從容器中解析每個建構函式參數。參數型別決定了解析的方式：

| 參數 | 解析為 | 詳細資訊 |
|-----------|-------------|--------|
| `repository: UserRepository` | `UserRepository` 定義。若缺失則失敗 | |
| `logger: Logger?` | 若定義存在則解析該定義，否則為 `null` | |
| `heavy: Lazy<HeavyService>` | 在首次存取 `heavy.value` 時建立 | [注入](/docs/reference/koin-core/injection) |
| `loggers: List<Logger>` | 所有繫結至 `Logger` 的定義 | [進階模式](/docs/reference/koin-core/advanced-patterns#collections-of-dependencies) |
| `@Named("local") db: Database` | 帶有該限定詞的定義 | [限定詞](/docs/reference/koin-core/qualifiers) |
| `@InjectedParam userId: String` | 呼叫者在解析時傳入的值 | [注入參數](/docs/reference/koin-core/injection-parameters) |
| `@Property("api_url") url: String` | Koin 屬性 | [啟動 Koin](/docs/reference/koin-core/starting-koin#properties) |

使用 Compiler Plugin DSL 與註解時，僅需根據建構函式簽章即可運作：

**Compiler Plugin DSL**
```kotlin
class SyncService(
    private val repository: UserRepository,
    private val analytics: Analytics?,
    private val uploader: Lazy<Uploader>,
)

val appModule = module {
    single<SyncService>()
}
```

**Annotations**
```kotlin
@Singleton
class SyncService(
    private val repository: UserRepository,
    private val analytics: Analytics?,
    private val uploader: Lazy<Uploader>,
)
```

**Constructor / Classic DSL**
`singleOf(::SyncService)` 會透過 `get()` 解析每個參數。對於可為 null、lazy 或清單 (list) 參數，請使用相符的函式自行撰寫呼叫：

```kotlin
val appModule = module {
    single {
        SyncService(
            repository = get(),
            analytics = getOrNull(),
            uploader = inject(),
        )
    }
}
```

`getAll()` 會傳回 `List`，`getProperty("key")` 會讀取屬性，而 `params.get()` 則會讀取注入的參數。

## 非自有的類別 {id="classes-you-don-t-own"}

來自程式庫（Room、Retrofit、OkHttp）的類別無法加上註解，且通常由 builder 建立。請使用由 Koin 解析其參數的函式來宣告它們：

**Compiler Plugin DSL**
```kotlin
import org.koin.plugin.module.dsl.create

fun database(context: Context): AppDatabase =
    Room.databaseBuilder(context, AppDatabase::class.java, "app-db").build()

fun topicDao(db: AppDatabase): TopicDao = db.topicDao()

val databaseModule = module {
    single { create(::database) }
    single { create(::topicDao) }
}
```

`create(::function)` 會像建構函式一樣解析函式參數，並享有相同的編譯期檢查。函式及其參數上的限定詞註解也能正常運作。

**Annotations**
為頂層函式加上註解。`@ComponentScan` 會像尋找類別一樣找到它：

```kotlin
@Singleton
fun database(context: Context): AppDatabase =
    Room.databaseBuilder(context, AppDatabase::class.java, "app-db").build()

@Singleton
fun topicDao(db: AppDatabase): TopicDao = db.topicDao()
```

或者將 provider 函式組織在 `@Module` 類別中：

```kotlin
@Module
class DatabaseModule {

    @Singleton
    fun database(context: Context): AppDatabase =
        Room.databaseBuilder(context, AppDatabase::class.java, "app-db").build()

    @Singleton
    fun topicDao(db: AppDatabase): TopicDao = db.topicDao()
}
```

**Constructor / Classic DSL**
```kotlin
val databaseModule = module {
    single {
        Room.databaseBuilder(androidContext(), AppDatabase::class.java, "app-db").build()
    }
    single { get<AppDatabase>().topicDao() }
}
```

有關在 Android 上完整的 Retrofit、Room 與序列化設定，請參閱 [Android 程式庫整合](/docs/reference/koin-android/binding-patterns)。

## 預先建立 {id="eager-creation"}

Koin 會在首次有人請求時建立 `single`。若要改為在 Koin 啟動時建立它，請將其標記為 `createdAtStart`：

**Compiler Plugin DSL**
```kotlin
val appModule = module {
    single<ConfigManager>() withOptions {
        createdAtStart()
    }
}
```

**Annotations**
```kotlin
@Singleton(createdAtStart = true)
class ConfigManager
```

**Constructor / Classic DSL**
```kotlin
val appModule = module {
    single(createdAtStart = true) { ConfigManager() }
}
```

預先建立會在啟動 Koin 的執行緒上執行。在 Android 上，這是在 `Application.onCreate()` 期間的主執行緒，因此每個預先建立的定義都會增加應用程式啟動時間。請僅將其保留給在第一個畫面出現前必須存在的物件。若要將工作移出啟動階段，請參閱 [Lazy 模組](/docs/reference/koin-core/lazy-modules)。

## 釋放回呼 {id="release-callback"}

`onClose` 會在執行個體被釋放時執行：對於 `single` 是在 Koin 停止時，對於 `scoped` 則是在其作用域關閉時。

**Compiler Plugin DSL**
```kotlin
val appModule = module {
    single<Database>() onClose { it?.close() }
}
```

**Annotations**
註解沒有 `onClose` 參數。請在 DSL 模組中宣告此定義。

**Constructor / Classic DSL**
```kotlin
val appModule = module {
    single { Database() } onClose { it?.close() }
}
```

`factory` 永遠不會呼叫 `onClose`：因為 Koin 不會保留 factory 執行個體。

## 覆寫定義 {id="overriding-a-definition"}

當兩個模組宣告相同的型別時，最後載入的模組優先：

```kotlin
val prodModule = module {
    single<ApiService> { ProductionApi() }
}

val testModule = module {
    single<ApiService> { FakeApi() }
}

startKoin {
    modules(prodModule, testModule) // ApiService resolves to FakeApi
}
```

這在測試中很有用，但若非刻意為之，則可能是錯誤的根源。若要明確指定覆寫，請在全域停用覆寫功能，並明確標記你想要覆寫的項目：

```kotlin
val testModule = module {
    single<ApiService> { FakeApi() }.override()
}

startKoin {
    allowOverride(false)
    modules(prodModule, testModule)
}
```

使用 `allowOverride(false)` 時，未標記的重複項目會在啟動時失敗。

## 相關內容 {id="related"}

- [模組](/docs/reference/koin-core/modules)：群組定義並使用 `includes()` 組合模組。
- [限定詞](/docs/reference/koin-core/qualifiers)：同一個型別的多個定義。
- [注入](/docs/reference/koin-core/injection)：在建構函式之外擷取執行個體。
- [作用域](/docs/reference/koin-core/scopes)：繫結至生命週期的執行個體。
- [編譯期安全性](/docs/reference/koin-compiler/compile-safety)：編譯器外掛程式在你的定義中檢查的內容。
- [DSL 參考](/docs/reference/koin-core/dsl)與[註解參考](/docs/reference/koin-annotations/annotations-inventory)：每個關鍵字與註解。