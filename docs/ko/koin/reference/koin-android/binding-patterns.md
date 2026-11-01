---
title: Android 라이브러리 연동
---

# Android 라이브러리 연동

이 페이지에서는 대부분의 Android 앱에서 사용하는 라이브러리인 Retrofit과 OkHttp, Room, JSON 직렬화 라이브러리의 완전한 Koin 설정 방법과 계층형 앱 아키텍처 구성을 설명합니다. 외부 라이브러리 클래스는 빌더를 통해 생성되므로 프로바이더 함수(provider function)로 선언합니다. 이 동작 원리(`create(::function)`, 어노테이션이 지정된 함수)는 [정의(Definitions)](/docs/reference/koin-core/definitions#classes-you-dont-own)에 설명되어 있으며, 이 페이지에서는 Android 환경의 설정 방법만을 다룹니다.

## Retrofit 및 OkHttp {id="retrofit-and-okhttp"}

```kotlin
interface ApiService {
    @GET("users/{id}")
    suspend fun getUser(@Path("id") id: String): User
}
```

**컴파일러 플러그인 DSL**
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

**어노테이션**
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

**생성자 / 클래식 DSL**
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

`OkHttpClient`와 `Retrofit`은 `single`로 선언합니다. 각각 연결 풀(connection pool)과 스레드 풀(thread pool)을 유지하므로, 여러 인스턴스를 생성하면 자원이 낭비됩니다. `BuildConfig.API_URL`은 빌드 타입별로 정의하는 `buildConfigField`입니다. `Json` 인스턴스는 다음 섹션에서 가져옵니다.

## JSON 직렬화 {id="json-serialization"}

**컴파일러 플러그인 DSL**
```kotlin
fun json(): Json = Json {
    ignoreUnknownKeys = true
    explicitNulls = false
}

val serializationModule = module {
    single { create(::json) }
}
```

**어노테이션**
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

**생성자 / 클래식 DSL**
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

동일한 패턴이 Gson(`fun gson(): Gson = GsonBuilder().create()`과 함께 `single { create(::gson) }`)이나 Moshi에도 적용됩니다. 하나의 공유 인스턴스를 사용하면 직렬화기(serializer) 설정을 한 곳에서 관리할 수 있습니다.

## Room {id="room"}

```kotlin
@Database(entities = [User::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
}
```

**컴파일러 플러그인 DSL**
```kotlin
fun appDatabase(context: Context): AppDatabase =
    Room.databaseBuilder(context, AppDatabase::class.java, "app-database").build()

fun userDao(database: AppDatabase): UserDao = database.userDao()

val databaseModule = module {
    single { create(::appDatabase) }
    single { create(::userDao) }
}
```

**어노테이션**
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

**생성자 / 클래식 DSL**
```kotlin
val databaseModule = module {
    single {
        Room.databaseBuilder(androidContext(), AppDatabase::class.java, "app-database").build()
    }
    single { get<AppDatabase>().userDao() }
}
```

데이터베이스는 `single`로 선언합니다. `RoomDatabase` 인스턴스는 생성 비용이 크며, Room 문서에서도 프로세스당 데이터베이스 인스턴스를 하나만 유지하도록 권장합니다. 여기서 `Context`는 시작 시 `androidContext()`에 의해 제공되는 `Application`입니다([Android에서 Koin 시작하기](/docs/reference/koin-android/start) 참조). DAO는 생성 비용이 적고 Room이 호출할 때마다 동일한 인스턴스를 반환하므로 `single`과 `factory` 둘 다 사용할 수 있습니다.

## WorkManager {id="workmanager"}

Worker는 전용 `WorkerFactory`를 통해 의존성을 주입받습니다. 설정 방법과 `worker` 정의는 [WorkManager](/docs/reference/koin-android/workmanager)에서 확인할 수 있습니다.

## 계층형 아키텍처 {id="layered-architecture"}

일반적인 Android 앱은 데이터 계층(네트워크, 데이터베이스, 리포지토리), 도메인 계층(유스케이스), UI 계층(ViewModel)으로 구성됩니다. 각 계층은 해당 생명주기에 맞는 정의 타입을 사용합니다.

| 계층 | 클래스 | 정의 |
|-------|---------|------------|
| 데이터 | `OkHttpClient`, `Retrofit`, `AppDatabase`, 데이터 소스, 리포지토리 | `single` |
| 도메인 | 상태를 가지지 않는 유스케이스 | `factory` |
| UI | ViewModel | `viewModel` |

**컴파일러 플러그인 DSL**
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

**어노테이션**
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

**생성자 / 클래식 DSL**
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

ViewModel은 유스케이스에 의존하고, 유스케이스는 `UserRepository` 인터페이스에 의존하며, 데이터 모듈만이 `UserRepositoryImpl`을 알고 있습니다. 테스트에서 데이터 소스를 교체하려면 `UserRepository` 바인딩을 재정의(override)하면 됩니다([단위 테스트](/docs/reference/koin-test/testing) 참조). 각 계층이 별도의 Gradle 모듈로 분리되어 있는 경우는 [멀티 모듈 앱](/docs/reference/koin-android/multi-module)을 참조하세요.

## 관련 문서 {id="related"}

- [정의(Definitions)](/docs/reference/koin-core/definitions): 정의 타입, 인터페이스 바인딩 및 프로바이더 함수.
- [Android에서 Koin 시작하기](/docs/reference/koin-android/start): 정의에서의 `androidContext()` 및 Android Context 사용.
- [Android ViewModel](/docs/reference/koin-android/viewmodel): Activity 및 Fragment에서 ViewModel 조회.
- [WorkManager](/docs/reference/koin-android/workmanager): Worker에서의 생성자 주입.
- [멀티 모듈 앱](/docs/reference/koin-android/multi-module): Gradle 모듈당 하나의 Koin 모듈 구성.