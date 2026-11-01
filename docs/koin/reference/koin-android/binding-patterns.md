---
title: Android 库集成
---

# Android 库集成

本页面提供了大多数 Android 应用所用库的完整 Koin 设置：Retrofit 与 OkHttp、Room 以及 JSON 序列化器，随后展示了分层应用结构。库的类由 Builder 构建生成，因此它们是通过提供程序函数（provider functions）声明的。其工作原理（`create(::function)`、注解函数）在[定义](/docs/reference/koin-core/definitions#classes-you-dont-own)中进行了说明；本页仅展示 Android 相关的配置。

## Retrofit 与 OkHttp {id="retrofit-and-okhttp"}

```kotlin
interface ApiService {
    @GET("users/{id}")
    suspend fun getUser(@Path("id") id: String): User
}
```

**编译器插件 DSL**
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

**注解**
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

**构造函数 / 经典 DSL**
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

将 `OkHttpClient` 与 `Retrofit` 声明为 `single`：它们各自持有连接池和线程池，重复创建会造成资源浪费。`BuildConfig.API_URL` 是针对每个构建类型定义的 `buildConfigField`。`Json` 实例则来自下一节。

## JSON 序列化 {id="json-serialization"}

**编译器插件 DSL**
```kotlin
fun json(): Json = Json {
    ignoreUnknownKeys = true
    explicitNulls = false
}

val serializationModule = module {
    single { create(::json) }
}
```

**注解**
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

**构造函数 / 经典 DSL**
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

相同的模式也适用于 Gson（结合 `fun gson(): Gson = GsonBuilder().create()` 使用 `single { create(::gson) }`）或 Moshi。通过单个共享实例，可以将序列化器的配置集中在一处。

## Room {id="room"}

```kotlin
@Database(entities = [User::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
}
```

**编译器插件 DSL**
```kotlin
fun appDatabase(context: Context): AppDatabase =
    Room.databaseBuilder(context, AppDatabase::class.java, "app-database").build()

fun userDao(database: AppDatabase): UserDao = database.userDao()

val databaseModule = module {
    single { create(::appDatabase) }
    single { create(::userDao) }
}
```

**注解**
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

**构造函数 / 经典 DSL**
```kotlin
val databaseModule = module {
    single {
        Room.databaseBuilder(androidContext(), AppDatabase::class.java, "app-database").build()
    }
    single { get<AppDatabase>().userDao() }
}
```

将数据库声明为 `single`：`RoomDatabase` 实例开销很大，而且 Room 文档要求在一个进程中每个数据库只保留一个实例。此处的 `Context` 为 `Application`，在启动时通过 `androidContext()` 提供（请参阅[在 Android 上启动 Koin](/docs/reference/koin-android/start)）。DAO 开销较小，并且 Room 在每次调用时都会返回相同的实例，因此使用 `single` 或 `factory` 均可。

## WorkManager {id="workmanager"}

Worker 通过专用的 `WorkerFactory` 获取其依赖项。相关设置和 `worker` 定义请参阅 [WorkManager](/docs/reference/koin-android/workmanager)。

## 分层架构 {id="layered-architecture"}

一个典型的 Android 应用包含数据层（网络、数据库、仓库）、领域层（用例）和 UI 层（ViewModel）。每一层都使用与其生命周期相匹配的定义类型：

| 层级 | 类 | 定义 |
|---|---|---|
| 数据层 | `OkHttpClient`、`Retrofit`、`AppDatabase`、数据源、仓库 | `single` |
| 领域层 | 无状态的用例 | `factory` |
| UI 层 | ViewModel | `viewModel` |

**编译器插件 DSL**
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

**注解**
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

**构造函数 / 经典 DSL**
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

ViewModel 依赖于用例，用例依赖于 `UserRepository` 接口，并且只有数据模块感知 `UserRepositoryImpl`。若要在测试中替换数据源，请重写 `UserRepository` 绑定（请参阅[单元测试](/docs/reference/koin-test/testing)）。当各个层分别位于各自的 Gradle 模块中时，请参阅[多模块应用](/docs/reference/koin-android/multi-module)。

## 相关内容 {id="related"}

- [定义](/docs/reference/koin-core/definitions)：定义类型、接口绑定以及提供程序函数。
- [在 Android 上启动 Koin](/docs/reference/koin-android/start)：`androidContext()` 以及定义中的 Android Context。
- [Android ViewModel](/docs/reference/koin-android/viewmodel)：在 Activity 和 Fragment 中检索 ViewModel。
- [WorkManager](/docs/reference/koin-android/workmanager)：Worker 中的构造函数注入。
- [多模块应用](/docs/reference/koin-android/multi-module)：每个 Gradle 模块对应一个 Koin 模块。