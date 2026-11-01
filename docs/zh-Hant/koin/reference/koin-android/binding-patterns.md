---
title: Android 程式庫整合
---

# Android 程式庫整合

本頁提供多數 Android 應用程式所使用之程式庫的完整 Koin 設定：Retrofit 與 OkHttp、Room 以及 JSON 序列化器，接著是分層應用程式架構。程式庫類別來自 builder，因此它們是使用提供者函式宣告的。其運作方式（`create(::function)`、帶註解的函式）已在 [Definitions](/docs/reference/koin-core/definitions#classes-you-dont-own) 中說明；本頁僅展示 Android 的設定。

## Retrofit 與 OkHttp {id="retrofit-and-okhttp"}

```kotlin
interface ApiService {
    @GET("users/{id}")
    suspend fun getUser(@Path("id") id: String): User
}
```

**Compiler Plugin DSL**
```kotlin
import org.koin.plugin.module.dsl.create

fun okHttpClient(): OkHttpClient =
    OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BODY else HttpLoggingInterceptor.Level.NONE
        })
        .build()

fun retrofit(client: OkHttpClient, json: Json): Retrofit =
    Retrofit.Builder()
        .baseUrl(BuildConfig.API_URL)
        .client(client)
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()

fun apiService(retrofit: Retrofit): ApiService = retrofit.create(ApiService::class.java)

val networkModule = module {
    single { create(::okHttpClient) }
    single { create(::retrofit) }
    single { create(::apiService) }
}
```

**Annotations**
```kotlin
@Module
class NetworkModule {

    @Singleton
    fun okHttpClient(): OkHttpClient =
        OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BODY else HttpLoggingInterceptor.Level.NONE
            })
            .build()

    @Singleton
    fun retrofit(client: OkHttpClient, json: Json): Retrofit =
        Retrofit.Builder()
            .baseUrl(BuildConfig.API_URL)
            .client(client)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()

    @Singleton
    fun apiService(retrofit: Retrofit): ApiService = retrofit.create(ApiService::class.java)
}
```

**Constructor / Classic DSL**
```kotlin
val networkModule = module {
    single {
        OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BODY else HttpLoggingInterceptor.Level.NONE
            })
            .build()
    }
    single {
        Retrofit.Builder()
            .baseUrl(BuildConfig.API_URL)
            .client(get())
            .addConverterFactory(get<Json>().asConverterFactory("application/json".toMediaType()))
            .build()
    }
    single { get<Retrofit>().create(ApiService::class.java) }
}
```

將 `OkHttpClient` 與 `Retrofit` 宣告為 `single`：它們各自持有連線池與執行緒池，若建立多個執行個體會造成浪費。`BuildConfig.API_URL` 是你在每個組建類型中定義的 `buildConfigField`。`Json` 執行個體則來自下一節。

## JSON 序列化 {id="json-serialization"}

**Compiler Plugin DSL**
```kotlin
fun json(): Json = Json {
    ignoreUnknownKeys = true
    explicitNulls = false
}

val serializationModule = module {
    single { create(::json) }
}
```

**Annotations**
```kotlin
@Module
class SerializationModule {

    @Singleton
    fun json(): Json = Json {
        ignoreUnknownKeys = true
        explicitNulls = false
    }
}
```

**Constructor / Classic DSL**
```kotlin
val serializationModule = module {
    single {
        Json {
            ignoreUnknownKeys = true
            explicitNulls = false
        }
    }
}
```

相同的模式也適用於 Gson（搭配 `fun gson(): Gson = GsonBuilder().create()` 的 `single { create(::gson) }`）或 Moshi。單一共享執行個體可將序列化器設定集中在同一個地方。

## Room {id="room"}

```kotlin
@Database(entities = [User::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
}
```

**Compiler Plugin DSL**
```kotlin
fun appDatabase(context: Context): AppDatabase =
    Room.databaseBuilder(context, AppDatabase::class.java, "app-database").build()

fun userDao(database: AppDatabase): UserDao = database.userDao()

val databaseModule = module {
    single { create(::appDatabase) }
    single { create(::userDao) }
}
```

**Annotations**
```kotlin
@Module
class DatabaseModule {

    @Singleton
    fun appDatabase(context: Context): AppDatabase =
        Room.databaseBuilder(context, AppDatabase::class.java, "app-database").build()

    @Singleton
    fun userDao(database: AppDatabase): UserDao = database.userDao()
}
```

**Constructor / Classic DSL**
```kotlin
val databaseModule = module {
    single {
        Room.databaseBuilder(androidContext(), AppDatabase::class.java, "app-database").build()
    }
    single { get<AppDatabase>().userDao() }
}
```

將資料庫宣告為 `single`：`RoomDatabase` 執行個體成本高昂，且 Room 文件要求每個處理程序中的每個資料庫僅保留一個執行個體。此處的 `Context` 為 `Application`，在啟動時由 `androidContext()` 提供（請參閱 [在 Android 上啟動 Koin](/docs/reference/koin-android/start)）。DAO 的開銷很小，且 Room 每次呼叫都會傳回相同的執行個體，因此使用 `single` 或 `factory` 皆可。

## WorkManager {id="workmanager"}

Worker 透過專屬的 `WorkerFactory` 取得其相依性。相關設定與 `worker` 定義請參閱 [WorkManager](/docs/reference/koin-android/workmanager)。

## 分層架構 {id="layered-architecture"}

典型的 Android 應用程式包含資料層（網路、資料庫、儲存庫）、領域層（使用案例）以及 UI 層（ViewModel）。每一層都使用與其生命週期相符的定義型別：

| 層 | 類別 | 定義 |
|-------|---------|------------|
| 資料層 | `OkHttpClient`、`Retrofit`、`AppDatabase`、資料來源、儲存庫 | `single` |
| 領域層 | 無狀態的使用案例 | `factory` |
| UI 層 | ViewModel | `viewModel` |

**Compiler Plugin DSL**
```kotlin
val dataModule = module {
    includes(networkModule, databaseModule, serializationModule)
    single<UserRemoteDataSource>()
    single<UserLocalDataSource>()
    single<UserRepositoryImpl>() bind UserRepository::class
}

val domainModule = module {
    factory<GetUserUseCase>()
}

val uiModule = module {
    viewModel<UserViewModel>()
}
```

**Annotations**
```kotlin
@Singleton
class UserRemoteDataSource(private val api: ApiService)

@Singleton
class UserLocalDataSource(private val dao: UserDao)

@Singleton
class UserRepositoryImpl(
    private val remote: UserRemoteDataSource,
    private val local: UserLocalDataSource,
) : UserRepository

@Factory
class GetUserUseCase(private val repository: UserRepository) {
    suspend operator fun invoke(userId: String): User = repository.getUser(userId)
}

@KoinViewModel
class UserViewModel(
    private val getUser: GetUserUseCase,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel()
```

**Constructor / Classic DSL**
```kotlin
val dataModule = module {
    includes(networkModule, databaseModule, serializationModule)
    singleOf(::UserRemoteDataSource)
    singleOf(::UserLocalDataSource)
    singleOf(::UserRepositoryImpl) bind UserRepository::class
}

val domainModule = module {
    factoryOf(::GetUserUseCase)
}

val uiModule = module {
    viewModelOf(::UserViewModel)
}
```

ViewModel 相依於使用案例，使用案例相依於 `UserRepository` 介面，且只有資料模組知道 `UserRepositoryImpl`。若要在測試中替換資料來源，請覆寫 `UserRepository` 繫結（請參閱 [單元測試](/docs/reference/koin-test/testing)）。當各層分別位於各自的 Gradle 模組中時，請參閱 [多模組應用程式](/docs/reference/koin-android/multi-module)。

## 相關內容 {id="related"}

- [Definitions](/docs/reference/koin-core/definitions)：定義型別、介面繫結與提供者函式。
- [Starting Koin on Android](/docs/reference/koin-android/start)：定義中的 `androidContext()` 與 Android Context。
- [Android ViewModel](/docs/reference/koin-android/viewmodel)：在 Activity 與 Fragment 中取得 ViewModel。
- [WorkManager](/docs/reference/koin-android/workmanager)：Worker 中的建構函式注入。
- [Multi-Module Apps](/docs/reference/koin-android/multi-module)：每個 Gradle 模組對應一個 Koin 模組。