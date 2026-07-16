---
title: Compose Multiplatform - 공유 UI
---

> 이 튜토리얼에서는 메트로폴리탄 미술관 컬렉션(The Metropolitan Museum of Art Collection) API의 박물관 미술품을 표시하는 Compose Multiplatform 애플리케이션을 살펴봅니다. 공유 UI와 함께 Android 및 iOS 플랫폼 전반에서 의존성 주입(dependency injection)을 위해 Koin을 사용합니다.
> 튜토리얼을 완료하는 데 약 __20분__ 정도 소요됩니다.

:::note
업데이트 - 2024-11-12
:::

:::tip
이 튜토리얼의 **어노테이션 버전(annotations version)**을 찾고 계신가요? 컴파일 타임 검증과 자동 모듈 탐색을 위해 Koin 어노테이션을 사용하는 [Compose Multiplatform & Annotations](./compose-multiplatform-annotations.md)를 확인해 보세요.
:::

## 코드 가져오기

:::info
[GitHub에서 소스 코드를 확인할 수 있습니다](https://github.com/InsertKoinIO/koin-getting-started/tree/main/compose)
:::

## 애플리케이션 개요

이 애플리케이션은 원격 API에서 박물관 미술품 객체를 가져와 목록에 표시합니다. 사용자는 항목을 탭하여 상세 정보를 볼 수 있습니다:

`MuseumAPI -> MuseumStorage -> MuseumRepository -> ViewModels -> Compose UI`

**사용된 기술:**
- 공유 UI를 위한 Compose Multiplatform (Android & iOS)
- HTTP 네트워킹을 위한 Ktor
- 의존성 주입을 위한 Koin
- 비동기 작업을 위한 Kotlin Coroutines & Flow
- 라우팅을 위한 Navigation Compose

## 데이터 레이어 (The Data Layer)

> 모든 공통/공유 코드는 `composeApp` Gradle 프로젝트에 위치합니다.

### MuseumObject 모델

박물관 미술품 객체 데이터 클래스입니다:

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

메트로폴리탄 미술관 API에서 데이터를 가져오기 위한 API 인터페이스를 생성합니다:

```kotlin
interface MuseumApi {
    suspend fun getData(): List<MuseumObject>
}

class KtorMuseumApi(private val client: HttpClient) : MuseumApi {
    private companion object {
        const val API_URL = "https://raw.githubusercontent.com/Kotlin/KMP-App-Template/main/list.json"
    }

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

박물관 객체를 로컬에 캐싱하기 위한 스토리지 인터페이스를 생성합니다:

```kotlin
interface MuseumStorage {
    suspend fun saveObjects(newObjects: List<MuseumObject>)
    fun getObjectById(objectId: Int): Flow<MuseumObject?>
    fun getObjects(): Flow<List<MuseumObject>>
}

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

리포지토리(Repository)는 API와 스토리지 사이를 조율합니다:

```kotlin
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

## 공유 Koin 모듈

Koin 모듈을 선언하려면 `module` 함수를 사용하세요. 더 나은 구조를 위해 의존성을 별도의 모듈로 구성합니다.

:::info
이 튜토리얼은 컴파일 타임에 오토 와이어링(auto-wiring)을 제공하는 **Koin 컴파일러 플러그인 DSL**(`single<T>()`, `viewModel<T>()`)을 사용합니다. 설정 방법은 [컴파일러 플러그인 설정](/docs/setup/compiler-plugin)을 참조하세요.
:::

### 데이터 모듈 (Data Module)

```kotlin
val dataModule = module {
    // Ktor용 HttpClient
    single { create(::buildClient) }

    // API, Storage, Repository
    single<KtorMuseumApi>() bind MuseumApi::class
    single<InMemoryMuseumStorage>() bind MuseumStorage::class
    single<MuseumRepository>() withOptions { createdAtStart() }
}

private fun buildClient(): HttpClient {
    val json = Json { ignoreUnknownKeys = true }
    return HttpClient {
        install(ContentNegotiation) {
            json(json, contentType = ContentType.Any)
        }
    }
}
```

### ViewModel 모듈

두 개의 화면을 위한 ViewModel을 생성해 보겠습니다:

```kotlin
// 목록 화면 ViewModel
class ListViewModel(museumRepository: MuseumRepository) : ViewModel() {
    val objects: StateFlow<List<MuseumObject>> =
        museumRepository.getObjects()
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}

// 상세 화면 ViewModel
class DetailViewModel(private val museumRepository: MuseumRepository) : ViewModel() {
    fun getObject(objectId: Int): StateFlow<MuseumObject?> {
        return museumRepository.getObjectById(objectId)
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)
    }
}
```

ViewModel 모듈에 이를 선언합니다:

```kotlin
val viewModelModule = module {
    viewModel<ListViewModel>()
    viewModel<DetailViewModel>()
}
```

### 플랫폼별 모듈 (Platform-Specific Module)

플랫폼별 컴포넌트(Android vs iOS)를 위한 모듈입니다:

```kotlin
val nativeComponentModule = module {
    single<NativeComponent>()
}
```

### 메인 앱 모듈 (Main App Module)

모든 모듈을 결합합니다:

```kotlin
val appModule = module {
    includes(dataModule, viewModelModule, nativeComponentModule)
}
```

:::note
Koin 모듈이 잘 구성되었으며, `initKoin()` 함수를 사용하여 Android와 iOS 양측에서 초기화할 수 있습니다.
:::

## 네이티브 컴포넌트

플랫폼별 정보(Android vs iOS)를 위해 expect/actual 패턴을 사용합니다:

```kotlin
// commonMain
interface NativeComponent {
    fun getInfo(): String
}

// androidMain
class NativeComponent {
    fun getInfo(): String = "Android ${android.os.Build.VERSION.SDK_INT}"
}

// iosMain
class NativeComponent {
    fun getInfo(): String = "iOS ${UIDevice.currentDevice.systemVersion}"
}
```

## Compose에서 ViewModel 주입하기

> 모든 공통 Compose 앱은 `composeApp` Gradle 모듈의 `commonMain`에 위치합니다.

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
`koinViewModel()` 함수는 ViewModel 인스턴스를 가져와 Compose 생명주기(lifecycle)에 바인딩합니다.
:::

## Koin 시작하기

`initKoin()` 함수로 Koin을 초기화합니다:

```kotlin
fun initKoin(configuration: KoinAppDeclaration? = null) {
    startKoin {
        includes(configuration)
        modules(appModule)
    }

    val platformInfo = KoinPlatform.getKoin().get<NativeComponent>().getInfo()
    println("Running on: $platformInfo")
}
```

### Android 설정

Android에서는 메인 Activity 또는 Application 클래스에서 Koin을 초기화합니다:

```kotlin
// Android 진입점(entry point)에서 호출
initKoin()
```

### iOS 설정

> 모든 iOS 앱은 `iosApp` 폴더에 위치합니다.

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