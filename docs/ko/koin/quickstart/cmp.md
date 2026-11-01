---
title: Compose Multiplatform
---

# Compose Multiplatform

이 튜토리얼에서는 메트로폴리탄 미술관(The Metropolitan Museum of Art)의 예술품 목록을 표시하고 상세 정보를 보여주는 Android 및 iOS용 Compose Multiplatform 앱을 빌드합니다. `commonMain`에서 Koin 모듈을 공유하는 방법, 플랫폼별 정의를 제공하는 방법, 컴포저블(composable)에 ViewModel을 주입하는 방법, 그리고 두 플랫폼 모두에서 Koin을 시작하는 방법을 배웁니다. 약 20분이 소요되며 Android Studio와 iOS용 Xcode가 필요합니다.

이 튜토리얼은 Compiler Plugin DSL을 사용합니다. 어노테이션을 사용하는 동일한 앱을 보려면 [Compose Multiplatform & Annotations](/docs/quickstart/compose-multiplatform-annotations)를 참조하세요. 스타일을 비교하려면 [Choosing your style](/docs/intro/choosing-your-style)을 참조하세요.

## 코드 가져오기 {id="get-the-code"}

전체 샘플 코드는 [koin-getting-started/compose](https://github.com/InsertKoinIO/koin-getting-started/tree/main/compose)에 있습니다. 리포지토리를 클론하고 Android Studio에서 `compose` 폴더를 엽니다. 공유 코드는 `composeApp` Gradle 모듈에 있으며, iOS 앱은 `iosApp`에 있습니다.

## Gradle 설정 {id="gradle-setup"}

이 샘플은 Koin Compiler Plugin을 적용하고 `commonMain`에 `koin-core` 및 `koin-compose-viewmodel-navigation`을 추가합니다. 버전은 버전 카탈로그에서 관리됩니다.

```toml
# gradle/libs.versions.toml
[versions]
# Kotlin, Compose Multiplatform, Ktor, navigation 및 Coil 항목은 생략됨
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-compose-viewmodel-navigation = { module = "io.insert-koin:koin-compose-viewmodel-navigation", version.ref = "koin" }

[plugins]
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

```kotlin
// composeApp/build.gradle.kts
plugins {
    alias(libs.plugins.kotlin.multiplatform)
    alias(libs.plugins.android.application)
    alias(libs.plugins.compose.multiplatform)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.koin.compiler)
    alias(libs.plugins.kotlin.serialization)
}

kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation(libs.koin.core)
            implementation(libs.koin.compose.viewmodel.navigation)
            ...
        }
    }
}
```

Compiler Plugin은 Kotlin 2.3.20 이상이 필요하며 모든 타깃에서 실행됩니다. 최신 버전 정보는 [Gradle setup](/docs/setup/gradle)을 참조하세요. 멀티플랫폼 프로젝트 레이아웃에 대해서는 [KMP setup](/docs/reference/koin-core/kmp-setup)을 참조하세요.

## 애플리케이션 구성 {id="the-application"}

이 앱은 원격 API에서 예술품 목록을 가져와 메모리에 캐시하고, 목록 화면과 상세 화면에 표시합니다.

```
MuseumApi -> MuseumStorage -> MuseumRepository -> ListViewModel / DetailViewModel -> Compose UI
```

HTTP 통신에는 Ktor를, 데이터 스트림에는 Kotlin Flow를, 라우팅에는 Navigation Compose를 사용합니다. 제목에 별도의 언급이 없는 한 이 튜토리얼의 모든 코드는 `commonMain`에 작성됩니다.

## 데이터 레이어 작성하기 {id="let-s-write-the-data-layer"}

`MuseumObject` 데이터 클래스는 API 응답을 매핑합니다.

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

`MuseumApi`는 Ktor의 `HttpClient`를 사용하여 목록을 가져옵니다.

```kotlin
interface MuseumApi {
    suspend fun getData(): List<MuseumObject>
}

class KtorMuseumApi(private val client: HttpClient) : MuseumApi {
    companion object {
        private const val API_URL =
            "https://raw.githubusercontent.com/Kotlin/KMP-App-Template/main/list.json"
    }

    override suspend fun getData(): List<MuseumObject> {
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

`MuseumStorage`는 객체들을 `MutableStateFlow`에 캐시합니다.

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

`MuseumRepository`는 생성될 때 API를 호출하여 스토리지를 새로고침합니다.

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

각 클래스는 필요한 의존성을 생성자를 통해 주입받으므로 Koin이 이들을 모두 연결(wire)할 수 있습니다.

## 데이터 모듈 선언하기 {id="let-s-declare-the-data-module"}

모듈은 Koin이 생성할 컴포넌트를 선언하는 곳입니다([Core Concepts](/docs/intro/core-concepts) 참조). `dataModule`에 데이터 레이어를 선언합니다.

```kotlin
import org.koin.core.module.dsl.createdAtStart
import org.koin.core.module.dsl.withOptions
import org.koin.dsl.bind
import org.koin.dsl.module
import org.koin.plugin.module.dsl.create
import org.koin.plugin.module.dsl.single

val dataModule = module {
    single { create(::buildClient) }
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

`create(::buildClient)`를 사용하면 여기의 `HttpClient`처럼 직접 소유하지 않은 클래스에 대해 Koin이 빌더 함수를 호출하도록 할 수 있습니다. `createdAtStart()`는 Koin이 시작될 때 `MuseumRepository`를 즉시 생성하므로 데이터 가져오기가 바로 시작됩니다. 두 가지 모두 [Definitions](/docs/reference/koin-core/definitions)에 자세히 설명되어 있습니다.

## ViewModel 작성하기 {id="let-s-write-the-viewmodels"}

목록 화면과 상세 화면에는 각각 ViewModel이 필요합니다.

```kotlin
class ListViewModel(museumRepository: MuseumRepository) : ViewModel() {
    val objects: StateFlow<List<MuseumObject>> =
        museumRepository.getObjects()
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}

class DetailViewModel(private val museumRepository: MuseumRepository) : ViewModel() {
    fun getObject(objectId: Int): Flow<MuseumObject?> =
        museumRepository.getObjectById(objectId)
}
```

`viewModelModule`에 이를 선언합니다.

```kotlin
import org.koin.plugin.module.dsl.viewModel

val viewModelModule = module {
    viewModel<ListViewModel>()
    viewModel<DetailViewModel>()
}
```

Koin은 멀티플랫폼 ViewModel API를 통해 각 ViewModel을 생성하므로 Android와 iOS 모두에서 동일한 선언이 동작합니다. [ViewModel](/docs/reference/koin-core/viewmodel)을 참조하세요.

## 플랫폼별 정의 추가하기 {id="let-s-add-platform-specific-definitions"}

이 샘플에서는 플랫폼마다 서로 다른 구현을 제공하는 두 가지 방법을 보여줍니다. 첫 번째 방법은 공유 모듈에 한 번 선언하는 `expect` 클래스입니다.

```kotlin
// commonMain
expect class NativeComponent() {
    fun getInfo(): String
}

val nativeComponentModule = module {
    single<NativeComponent>()
}
```

```kotlin
// androidMain
actual class NativeComponent actual constructor() {
    actual fun getInfo(): String = "Android OS"
}
```

```kotlin
// nativeMain
actual class NativeComponent actual constructor() {
    actual fun getInfo(): String = "iOS"
}
```

두 번째 방법은 `expect` 모듈 함수입니다. 각 플랫폼은 공유 인터페이스의 구현체를 바인딩하여 고유한 모듈을 반환합니다.

```kotlin
// commonMain
interface PlatformComponent {
    fun getInfo(): String
}

expect fun platformModule(): Module
```

```kotlin
// androidMain
class AndroidComponent() : PlatformComponent {
    override fun getInfo(): String = "Android OS"
}

actual fun platformModule(): Module = module {
    single<AndroidComponent>() bind PlatformComponent::class
}
```

```kotlin
// iosMain
class IOSComponent() : PlatformComponent {
    override fun getInfo(): String = "iOS OS"
}

actual fun platformModule(): Module = module {
    single<IOSComponent>() bind PlatformComponent::class
}
```

공유 코드는 `NativeComponent`나 `PlatformComponent`를 요청하고 각 플랫폼에 맞는 구현체를 얻습니다. 이러한 패턴은 [KMP shared modules](/docs/reference/koin-core/kmp-shared-modules)에서 다룹니다.

## 모듈 결합하기 {id="let-s-assemble-the-modules"}

`includes()`를 사용하여 모든 모듈을 `appModule`에 모읍니다.

```kotlin
val appModule = module {
    includes(dataModule, viewModelModule, nativeComponentModule, platformModule())
}
```

이제 시작 시 단 하나의 모듈만 로드하면 다른 모듈도 함께 로드됩니다. [Modules](/docs/reference/koin-core/modules)를 참조하세요.

## Compose에서 ViewModel 주입하기 {id="let-s-inject-the-viewmodels-in-compose"}

각 화면은 `koinViewModel()`을 기본 파라미터로 사용하여 ViewModel을 가져옵니다.

```kotlin
import org.koin.compose.viewmodel.koinViewModel

@Composable
fun ListScreen(
    viewModel: ListViewModel = koinViewModel(),
    navigateToDetails: (objectId: Int) -> Unit
) {
    val objects by viewModel.objects.collectAsStateWithLifecycle()
    ...
}

@Composable
fun DetailScreen(
    objectId: Int,
    viewModel: DetailViewModel = koinViewModel(),
    navigateBack: () -> Unit,
) {
    val obj by viewModel.getObject(objectId).collectAsStateWithLifecycle(initialValue = null)
    ...
}
```

`App` 컴포저블은 두 화면 간의 내비게이션을 설정합니다.

```kotlin
@Serializable
object ListDestination

@Serializable
data class DetailDestination(val objectId: Int)

@Composable
fun App() {
    MaterialTheme(
        colorScheme = if (isSystemInDarkTheme()) darkColorScheme() else lightColorScheme()
    ) {
        Surface {
            val navController: NavHostController = rememberNavController()
            NavHost(navController = navController, startDestination = ListDestination) {
                composable<ListDestination> {
                    ListScreen(navigateToDetails = { objectId ->
                        navController.navigate(DetailDestination(objectId))
                    })
                }
                composable<DetailDestination> { backStackEntry ->
                    DetailScreen(
                        objectId = backStackEntry.toRoute<DetailDestination>().objectId,
                        navigateBack = { navController.popBackStack() }
                    )
                }
            }
        }
    }
}
```

`NavHost` 목적지 내부에서 `koinViewModel()`은 ViewModel을 해당 내비게이션 엔트리에 바인딩하므로, 각 화면은 고유한 인스턴스를 유지합니다. [Compose ViewModel](/docs/reference/koin-compose/compose-viewmodel)을 참조하세요.

## Koin 시작하기 {id="let-s-start-koin"}

두 플랫폼 모두에서 호출하는 공유 함수 `initKoin()`을 작성합니다. 플랫폼별 설정을 위한 선택적 configuration을 파라미터로 받습니다.

```kotlin
import org.koin.core.context.startKoin
import org.koin.dsl.KoinAppDeclaration
import org.koin.dsl.includes

fun initKoin(configuration: KoinAppDeclaration? = null) {
    startKoin {
        includes(configuration)
        modules(appModule)
        printLogger(Level.DEBUG)
    }
}
```

Android에서는 `Application` 클래스에서 이를 호출하고 Android context를 전달합니다.

```kotlin
// androidMain
class MuseumApp : Application() {
    override fun onCreate() {
        super.onCreate()
        initKoin {
            androidContext(this@MuseumApp)
        }
    }
}
```

iOS에서는 SwiftUI 앱 진입점에서 이를 호출합니다. Kotlin은 `initKoin()`을 `doInitKoin()`으로 export합니다.

```swift
// iosApp
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

iOS 뷰 컨트롤러(view controller)는 동일한 `App` 컴포저블을 호스팅합니다.

```kotlin
// iosMain
fun MainViewController() = ComposeUIViewController { App() }
```

Android Studio에서 Android 앱을 실행하거나 Xcode에서 iOS 앱을 실행하면 예술품 목록이 표시됩니다. 다른 시작 옵션에 대해서는 [Starting Koin](/docs/reference/koin-core/starting-koin)을 참조하세요.

## 다음 단계 {id="next-steps"}

- [Core Concepts](/docs/intro/core-concepts): 모듈, 정의 및 주입의 기본 개념
- [KMP setup](/docs/reference/koin-core/kmp-setup): Kotlin Multiplatform을 위한 프로젝트 레이아웃 및 Koin 의존성
- [Koin for Compose](/docs/reference/koin-compose/compose): `KoinApplication`, `koinInject()` 및 Compose 설정
- [Compose testing](/docs/reference/koin-compose/compose-testing): Koin을 사용하는 컴포저블 테스트
- [Tooling](/docs/tooling): Koin용 IDE 플러그인 및 모니터링 도구