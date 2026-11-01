---
title: Android ライブラリの統合
---

# Android ライブラリの統合

このページでは、大半の Android アプリで使用されるライブラリ（OkHttp を組み合わせた Retrofit、Room、JSON シリアライザー）およびレイヤードアプリケーション構造に対応する完全な Koin のセットアップ方法を説明します。ライブラリのクラスはビルダーから生成されるため、プロバイダー関数（provider function）を使って宣言します。その仕組み（`create(::function)` やアノテーション付き関数）については [Definitions（定義）](/docs/reference/koin-core/definitions#classes-you-dont-own) で解説しています。このページでは Android 向けのセットアップのみを取り上げます。

## Retrofit と OkHttp {id="retrofit-and-okhttp"}

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

`OkHttpClient` と `Retrofit` は `single` として宣言します。それぞれがコネクションプールとスレッドプールを保持するため、複数インスタンスを生成するとリソースの浪費につながります。`BuildConfig.API_URL` はビルドタイプごとに定義する `buildConfigField` です。`Json` インスタンスは次のセクションから取得します。

## JSON シリアライゼーション {id="json-serialization"}

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

同様のパターンは Gson（`single { create(::gson) }` と `fun gson(): Gson = GsonBuilder().create()`）や Moshi にも適用できます。共有インスタンスを 1 つにすることで、シリアライザーの設定を一元管理できます。

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

データベースは `single` として宣言します。`RoomDatabase` のインスタンス生成はコストが高く、Room のドキュメントでもプロセスごとにデータベースにつき 1 つのインスタンスとすることが求められています。ここでの `Context` は起動時に `androidContext()` によって提供される `Application` です（[Android での Koin の起動](/docs/reference/koin-android/start) を参照）。DAO は軽量であり、Room は呼び出しごとに同じインスタンスを返すため、`single` と `factory` のどちらでも動作します。

## WorkManager {id="workmanager"}

Worker は専用の `WorkerFactory` を通じて依存関係を取得します。セットアップと `worker` 定義については [WorkManager](/docs/reference/koin-android/workmanager) を参照してください。

## レイヤードアーキテクチャ {id="layered-architecture"}

典型的な Android アプリは、データレイヤー（ネットワーク、データベース、リポジトリ）、ドメインレイヤー（ユースケース）、UI レイヤー（ViewModel）で構成されます。各レイヤーはそのライフタイムに応じた定義タイプを使用します。

| レイヤー | クラス | 定義 |
|-------|---------|------------|
| データ | `OkHttpClient`、`Retrofit`、`AppDatabase`、データソース、リポジトリ | `single` |
| ドメイン | ユースケース（状態を持たないもの） | `factory` |
| UI | ViewModel | `viewModel` |

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

ViewModel はユースケースに依存し、ユースケースは `UserRepository` インターフェースに依存しており、`UserRepositoryImpl` の存在を知っているのはデータモジュールのみです。テスト時にデータソースを差し替えるには、`UserRepository` のバインディングをオーバーライドします（[単体テスト（Unit Testing）](/docs/reference/koin-test/testing) を参照）。各レイヤーが別個の Gradle モジュールに分割されている場合は、[マルチモジュールアプリ（Multi-Module Apps）](/docs/reference/koin-android/multi-module) を参照してください。

## 関連情報 {id="related"}

- [Definitions（定義）](/docs/reference/koin-core/definitions): 定義タイプ、インターフェースのバインディング、プロバイダー関数。
- [Starting Koin on Android（Android での Koin の起動）](/docs/reference/koin-android/start): `androidContext()` と定義内での Android Context。
- [Android ViewModel](/docs/reference/koin-android/viewmodel): Activity や Fragment での ViewModel の取得。
- [WorkManager](/docs/reference/koin-android/workmanager): Worker でのコンストラクタインジェクション。
- [Multi-Module Apps（マルチモジュールアプリ）](/docs/reference/koin-android/multi-module): Gradle モジュールごとに 1 つの Koin モジュールを使用する方法。