---
title: Compose Multiplatform 및 어노테이션 - 공유 UI
---

> 이 튜토리얼에서는 Metropolitan Museum of Art Collection API의 박물관 예술품을 표시하는 Compose Multiplatform 애플리케이션을 시연합니다. 공유 UI와 함께 Android 및 iOS 플랫폼 전반에서 의존성 주입(Dependency Injection)을 위해 Koin 어노테이션을 사용합니다.
> 이 튜토리얼을 완료하는 데 약 **20분**이 소요됩니다.

:::note
업데이트 - 2024-11-12
:::

## 코드 가져오기

:::info
[Github에서 소스 코드를 확인할 수 있습니다](https://github.com/InsertKoinIO/koin-getting-started/tree/main/compose-annotations)
:::

## Gradle 설정

먼저, Koin 어노테이션 의존성을 추가합니다:

```kotlin
plugins {
    id("com.google.devtools.ksp") version kspVersion
}

dependencies {
    // Koin for Compose Multiplatform
    implementation("io.insert-koin:koin-core:$koin_version")
    implementation("io.insert-koin:koin-compose-viewmodel:$koin_version")

    // Koin Annotations
    implementation("io.insert-koin:koin-annotations:$koin_annotations_version")
    ksp("io.insert-koin:koin-ksp-compiler:$koin_annotations_version")
}
```

## 애플리케이션 개요

이 애플리케이션은 원격 API에서 박물관 예술품 객체를 가져와 리스트로 표시합니다. 사용자는 항목을 탭하여 상세 정보를 볼 수 있습니다:

`MuseumAPI -> MuseumStorage -> MuseumRepository -> ViewModels -> Compose UI`

**사용된 기술:**
- 공유 UI를 위한 Compose Multiplatform (Android 및 iOS)
- HTTP 네트워킹을 위한 Ktor
- 의존성 주입을 위한 Koin 어노테이션
- 비동기 작업을 위한 Kotlin Coroutines 및 Flow
- 라우팅을 위한 Navigation Compose

## 데이터 레이어 (The Data Layer)

> 모든 공통/공유 코드는 `composeApp` Gradle 프로젝트에 위치합니다.

### MuseumObject 모델

박물관 예술품 객체 데이터 클래스:

```kotlin
@Serializable
data class MuseumObject(
    val objectID: Int,
    val title: String,
    val artistDisplayName: String,
    val medium: String,
    val dimensions: String,
    val objectURL: String,
    val objectDate: String,
    val primaryImage: String,
    val primaryImageSmall: String,
    val repository: String,
    val department: String,
    val creditLine: String,
)
```

### MuseumApi - 네트워크 레이어

데이터를 가져오기 위한 API 인터페이스를 생성합니다:

```kotlin
interface MuseumApi {
    suspend fun getData(): List<MuseumObject>
}

@Single
class KtorMuseumApi(private val client: HttpClient) : MuseumApi {
    override suspend fun getData(): `List<MuseumObject>` {
        return try {
            client.get(API_URL).body()
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            e.printStackTrace()
            emptyList()
        }
    }
}
```

### MuseumStorage - 로컬 캐싱

```kotlin
interface MuseumStorage {
    suspend fun saveObjects(newObjects: List<MuseumObject>)
    fun getObjectById(objectId: Int): Flow<MuseumObject?>
    fun getObjects(): Flow<List<MuseumObject>>
}

@Single
class InMemoryMuseumStorage : MuseumStorage {
    private val storedObjects = MutableStateFlow(emptyList<MuseumObject>())

    override suspend fun saveObjects(newObjects: List<MuseumObject>) {
        storedObjects.value = newObjects
    }

    override fun getObjectById(objectId: Int): Flow<MuseumObject?> {
        return storedObjects.map { objects ->
            objects.find { it.objectID == objectId }
        }
    }

    override fun getObjects(): Flow<List<MuseumObject>> = storedObjects
}
```

### MuseumRepository

레포지토리는 API와 스토리지 사이를 조율합니다:

```kotlin
@Single(createdAtStart = true)
class MuseumRepository(
    private val museumApi: MuseumApi,
    private val museumStorage: MuseumStorage,
) {
    private val scope = CoroutineScope(SupervisorJob())

    init {
        initialize()
    }

    fun initialize() {
        scope.launch {
            refresh()
        }
    }

    suspend fun refresh() {
        museumStorage.saveObjects(museumApi.getData())
    }

    fun getObjects(): Flow<List<MuseumObject>> = museumStorage.getObjects()

    fun getObjectById(objectId: Int): Flow<MuseumObject?> = museumStorage.getObjectById(objectId)
}
```

:::note
`@Single(createdAtStart = true)` 어노테이션은 Koin이 시작될 때 레포지토리가 생성되도록 보장하여, 즉시 데이터 페칭(fetching)을 트리거합니다.
:::

## Koin 모듈

의존성을 별도의 모듈로 구성합니다:

### 데이터 모듈 (Data Module)

```kotlin
@Module
@ComponentScan
class DataModule {

    @Single
    fun providesHttpClient(): HttpClient {
        val json = Json { ignoreUnknownKeys = true }
        return HttpClient {
            install(ContentNegotiation) {
                json(json, contentType = ContentType.Any)
            }
        }
    }
}
```

`@ComponentScan` 어노테이션은 이 패키지 내의 모든 `@Single` 어노테이션이 달린 클래스(MuseumApi, MuseumStorage, MuseumRepository)를 자동으로 검색합니다.

### ViewModel 모듈

두 화면을 위한 ViewModel을 만들어 보겠습니다:

```kotlin
// 리스트 화면 ViewModel
@KoinViewModel
class ListViewModel(museumRepository: MuseumRepository) : ViewModel() {
    val objects: StateFlow<List<MuseumObject>> =
        museumRepository.getObjects()
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}

// 상세 화면 ViewModel
@KoinViewModel
class DetailViewModel(private val museumRepository: MuseumRepository) : ViewModel() {
    fun getObject(objectId: Int): StateFlow<MuseumObject?> {
        return museumRepository.getObjectById(objectId)
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)
    }
}
```

모듈에 이들을 선언합니다:

```kotlin
@ComponentScan
@Module
class ViewModelModule
```

`@KoinViewModel` 어노테이션은 이들을 ViewModel 정의로 자동으로 등록하며, `@ComponentScan`이 이를 검색합니다.

### 플랫폼별 모듈 (Platform-Specific Module)

플랫폼별 컴포넌트(Android vs iOS)의 경우:

```kotlin
@ComponentScan
@Module
class PlatformComponentModule
```

### 메인 앱 모듈 (Main App Module)

모든 모듈을 결합합니다:

```kotlin
@Configuration
@Module(includes = [DataModule::class, ViewModelModule::class, PlatformComponentModule::class])
class AppModule
```

* `@Configuration` - `@KoinApplication`을 통한 자동 모듈 검색을 활성화합니다.
* `@Module(includes = [...])` - 포함할 모듈을 선언합니다.

## Koin Application 객체

`@KoinApplication` 객체를 생성합니다:

```kotlin
@KoinApplication
object KoinApp

fun initKoin(configuration: KoinAppDeclaration? = null) {
    KoinApp.startKoin {
        includes(configuration)
    }

    val platformInfo = KoinPlatform.getKoin().get<PlatformComponent>().getInfo()
    println("Running on: $platformInfo")
}
```

`@KoinApplication` 어노테이션은 모든 모듈을 자동으로 로드하는 `startKoin()` 확장 함수를 생성합니다.

## Compose에서 ViewModel 주입하기

> 모든 공통 Compose 앱 코드는 `composeApp` Gradle 모듈의 `commonMain`에 위치합니다.

ViewModel은 Compose에서 `koinViewModel()`을 사용하여 주입됩니다:

```kotlin
@Composable
fun App() {
    MaterialTheme(
        colorScheme = if (isSystemInDarkTheme()) darkColorScheme() else lightColorScheme()
    ) {
        Surface {
            val navController: NavHostController = rememberNavController()
            NavHost(navController = navController, startDestination = ListDestination) {
                composable<ListDestination> {
                    val vm = koinViewModel<ListViewModel>()
                    ListScreen(viewModel = vm, navigateToDetails = { objectId ->
                        navController.navigate(DetailDestination(objectId))
                    })
                }
                composable<DetailDestination> { backStackEntry ->
                    val vm = koinViewModel<DetailViewModel>()
                    DetailScreen(
                        objectId = backStackEntry.toRoute<DetailDestination>().objectId,
                        viewModel = vm,
                        navigateBack = { navController.popBackStack() }
                    )
                }
            }
        }
    }
}
```

:::info
`koinViewModel()` 함수는 `@KoinViewModel`을 통해 자동으로 등록된 ViewModel 인스턴스를 조회합니다.
:::

## Koin 시작하기

### Android 설정

Android에서 Koin은 메인 진입점에서 초기화됩니다:

```kotlin
// Android 진입점에서 호출
initKoin()
```

### iOS 설정

> 모든 iOS 앱 코드는 `iosApp` 폴더에 위치합니다.

iOS에서는 SwiftUI 앱 진입점에서 Koin을 초기화합니다:

```swift
@main
struct iOSApp: App {
    init() {
        KoinKt.doInitKoin()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

Compose UI는 다음과 같이 시작됩니다:

```kotlin
fun MainViewController() = ComposeUIViewController { App() }
```

## 어노테이션 vs 컴파일러 플러그인 DSL

어노테이션 방식과 컴파일러 플러그인 DSL 방식을 비교하면 다음과 같습니다:

**어노테이션 사용 시 (compose-annotations/):**
```kotlin
@Configuration
@Module(includes = [DataModule::class, ViewModelModule::class])
class AppModule

@Single
class MuseumRepository(api: MuseumApi, storage: MuseumStorage)

@KoinViewModel
class ListViewModel(repository: MuseumRepository) : ViewModel()

// Koin 시작
KoinApp.startKoin()
```

**컴파일러 플러그인 DSL 사용 시 (compose/):**
```kotlin
val appModule = module {
    includes(dataModule, viewModelModule)
}

val dataModule = module {
    single<MuseumRepository>() withOptions { createdAtStart() }
}

val viewModelModule = module {
    viewModel<ListViewModel>()
}

// Koin 시작
startKoin { modules(appModule) }
```

두 방식 모두 동일한 결과를 얻습니다:
- **어노테이션**: KSP를 통한 컴파일 타임 검증, 자동 모듈 검색
- **컴파일러 플러그인 DSL**: 컴파일 타임 자동 연결(Auto-wiring), 더 깔끔한 `single<T>()` 구문