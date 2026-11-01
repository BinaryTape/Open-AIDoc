---
title: Compose Multiplatform 및 어노테이션
---

# Compose Multiplatform & Annotations

이 튜토리얼에서는 메트로폴리탄 미술관(The Metropolitan Museum of Art)의 예술품 목록을 표시하고 세부 정보를 보여주는 Android 및 iOS용 Compose Multiplatform 앱을 빌드합니다. 두 개의 Gradle 모듈에 걸쳐 클래스에 어노테이션을 지정하고, 플랫폼별 정의를 제공하며, 컴포저블(composable)에 ViewModel을 주입하고, 루트 컴포저블에서 Koin을 시작하는 방법을 배웁니다. 약 20분이 소요되며 Android Studio와 iOS용 Xcode가 필요합니다.

이 튜토리얼은 어노테이션을 사용합니다. Compiler Plugin DSL을 사용한 동일한 앱을 보려면 [Compose Multiplatform](/docs/quickstart/cmp)을 참조하세요. 스타일을 비교하려면 [스타일 선택하기](/docs/intro/choosing-your-style)를 참조하세요.

## 코드 가져오기 {id="get-the-code"}

전체 샘플 코드는 [koin-getting-started/compose-annotations](https://github.com/InsertKoinIO/koin-getting-started/tree/main/compose-annotations)에 있습니다. 저장소를 클론하고 Android Studio에서 `compose-annotations` 폴더를 엽니다. 이 프로젝트에는 데이터 레이어를 위한 `data` 모듈과 UI를 위한 `composeApp` 모듈 등 두 개의 Gradle 모듈이 있습니다. iOS 앱은 `iosApp`에 있습니다.

## Gradle 설정 {id="gradle-setup"}

두 Gradle 모듈 모두 Koin 컴파일러 플러그인(Compiler Plugin)을 적용합니다. 버전은 버전 카탈로그(version catalog)에서 관리됩니다.

```toml
# gradle/libs.versions.toml
[versions]
# Kotlin, Compose Multiplatform, Ktor, navigation and Coil entries omitted
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }
koin-compose-viewmodel = { module = "io.insert-koin:koin-compose-viewmodel", version.ref = "koin" }

[plugins]
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

```kotlin
// data/build.gradle.kts
plugins {
    alias(libs.plugins.kotlin.multiplatform)
    alias(libs.plugins.android.library)
    alias(libs.plugins.koin.compiler)
    alias(libs.plugins.kotlin.serialization)
}

kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation(libs.koin.core)
            api(libs.koin.annotations)
            ...
        }
    }
}
```

```kotlin
// composeApp/build.gradle.kts
plugins {
    alias(libs.plugins.kotlin.multiplatform)
    alias(libs.plugins.android.application)
    alias(libs.plugins.compose.multiplatform)
    alias(libs.plugins.koin.compiler)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
}

kotlin {
    sourceSets {
        commonMain.dependencies {
            api(project(":data"))
            implementation(libs.koin.core)
            implementation(libs.koin.compose.viewmodel)
            implementation(libs.koin.annotations)
            ...
        }
    }
}
```

컴파일러 플러그인은 타깃별 개별 설정 없이 모든 타깃에서 어노테이션을 처리합니다. Kotlin 2.3.20 이상이 필요하며, `koin-annotations`는 Koin 버전과 동일한 버전을 공유합니다. 자세한 내용은 [Gradle 설정](/docs/setup/gradle) 및 [Compiler Plugin 설정](/docs/setup/compiler-plugin)을 참조하세요.

## 애플리케이션 구조 {id="the-application"}

이 앱은 원격 API에서 예술품 목록을 가져와 메모리에 캐시한 다음, 목록 화면과 상세 화면에 표시합니다.

```
MuseumApi -> MuseumStorage -> MuseumRepository -> ListViewModel / DetailViewModel -> Compose UI
```

HTTP 통신에는 Ktor를, 데이터 스트림에는 Kotlin Flow를, 라우팅에는 Navigation Compose를 사용합니다. 제목이나 주석에 별도의 언급이 없는 한 코드는 `commonMain`에 작성됩니다.

## 데이터 레이어 작성하기 {id="let-s-write-the-data-layer"}

이 코드는 `data` Gradle 모듈에 작성합니다. `MuseumObject` 데이터 클래스는 API 응답을 매핑합니다.

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

`KtorMuseumApi`는 Ktor의 `HttpClient`를 사용하여 목록을 가져옵니다. 여기에 `@Singleton` 어노테이션을 추가합니다.

```kotlin
import org.koin.core.annotation.Singleton

interface MuseumApi {
    suspend fun getData(): List<MuseumObject>
}

@Singleton
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

`InMemoryMuseumStorage`는 객체들을 `MutableStateFlow`에 캐시합니다.

```kotlin
interface MuseumStorage {
    suspend fun saveObjects(newObjects: List<MuseumObject>)
    fun getObjectById(objectId: Int): Flow<MuseumObject?>
    fun getObjects(): Flow<List<MuseumObject>>
}

@Singleton
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

`MuseumRepository`는 생성될 때 API로부터 저장소를 새로고침합니다.

```kotlin
@Singleton
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

Koin은 각 클래스를 해당 상위 타입에 바인딩하므로, `KtorMuseumApi`는 `MuseumApi`에 대한 요청을 처리하게 됩니다. 자세한 내용은 [정의(Definitions)](/docs/reference/koin-core/definitions)를 참조하세요.

## 데이터 모듈 선언하기 {id="let-s-declare-the-data-module"}

`HttpClient`는 직접 소유하지 않은 외부 클래스이므로, 모듈 클래스 내의 함수를 통해 제공합니다.

```kotlin
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.Configuration
import org.koin.core.annotation.Module
import org.koin.core.annotation.Singleton

@Module
@Configuration
@ComponentScan("com.jetbrains.kmpapp.data")
class DataModule {

    @Singleton
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

`@ComponentScan`은 data 패키지에서 어노테이션이 달린 클래스들을 등록합니다. `@Configuration`은 `DataModule`이 다른 Gradle 모듈에 위치해 있더라도 앱의 진입점에서 검색할 수 있도록 해줍니다. 자세한 내용은 [모듈(Modules)](/docs/reference/koin-core/modules)을 참조하세요.

## ViewModel 작성하기 {id="let-s-write-the-viewmodels"}

이 코드와 이후의 튜토리얼 내용은 `composeApp` Gradle 모듈에서 진행됩니다. 각 ViewModel에 `@KoinViewModel` 어노테이션을 추가합니다.

```kotlin
import org.koin.core.annotation.KoinViewModel

@KoinViewModel
class ListViewModel(museumRepository: MuseumRepository) : ViewModel() {
    val objects: StateFlow<List<MuseumObject>> =
        museumRepository.getObjects()
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}

@KoinViewModel
class DetailViewModel(private val museumRepository: MuseumRepository) : ViewModel() {
    fun getObject(objectId: Int): Flow<MuseumObject?> =
        museumRepository.getObjectById(objectId)
}
```

`screens` 패키지에 모듈 클래스를 만들어 이들을 스캔합니다.

```kotlin
@ComponentScan
@Module
class ViewModelModule
```

인자 없이 `@ComponentScan`을 사용하면 해당 모듈 클래스가 위치한 패키지와 하위 패키지를 스캔합니다. 자세한 내용은 [ViewModel](/docs/reference/koin-core/viewmodel)을 참조하세요.

## 플랫폼별 정의 추가하기 {id="let-s-add-platform-specific-definitions"}

이 샘플에서는 플랫폼별로 서로 다른 구현을 제공하는 두 가지 방법을 보여줍니다. 첫 번째 방법은 공용 모듈에서 스캔하는 어노테이션이 적용된 `expect` 클래스를 사용하는 것입니다.

```kotlin
// commonMain
@Singleton
expect class NativeComponent() {
    fun getInfo(): String
}

@Module
@ComponentScan
class NativeComponentModule
```

```kotlin
// androidMain
@Singleton
actual class NativeComponent actual constructor() {
    actual fun getInfo(): String = "Android NativeComponent"
}
```

```kotlin
// nativeMain
@Singleton
actual class NativeComponent actual constructor() {
    actual fun getInfo(): String = "iOS NativeComponent"
}
```

두 번째 방법은 `expect` 모듈 클래스를 사용하는 것입니다. 각 플랫폼의 `actual` 모듈이 공유 인터페이스를 구현한 자체 구현체를 스캔합니다.

```kotlin
// commonMain
interface PlatformComponent {
    fun getInfo(): String
}

@Module
expect class PlatformComponentModule
```

```kotlin
// androidMain
@Module
@ComponentScan
actual class PlatformComponentModule

@Singleton
class AndroidPlatformComponent : PlatformComponent {
    override fun getInfo(): String = "Android PlatformComponent"
}
```

```kotlin
// iosMain
@Module
@ComponentScan
actual class PlatformComponentModule

@Singleton
class IOSPlatformComponent : PlatformComponent {
    override fun getInfo(): String = "iOS PlatformComponent"
}
```

플랫폼 클래스는 플랫폼 종속적인 의존성을 가질 수도 있습니다. Android에서는 `AndroidContextWrapper`가 Koin으로부터 Android `Context`를 전달받습니다.

```kotlin
// commonMain
interface ContextWrapper {
    fun getContextInfo(): String
}

@Singleton
class NativeContextComponent(val ctx: ContextWrapper) {
    fun getInfo(): String = "NativeContextComponent with ctx: ${ctx.getContextInfo()}"
}
```

```kotlin
// androidMain
@Singleton
class AndroidContextWrapper(val context: Context) : ContextWrapper {
    override fun getContextInfo(): String = "Android Context: $context"
}
```

```kotlin
// nativeMain
@Singleton
class IOSContextWrapper : ContextWrapper {
    override fun getContextInfo(): String = "iOS Context"
}
```

공통 코드는 인터페이스를 요청하고, 각 플랫폼에 맞는 적절한 구현체를 주입받습니다. 이러한 패턴은 [KMP 공유 모듈](/docs/reference/koin-core/kmp-shared-modules)에서 자세히 다룹니다.

## 모듈 조립하기 {id="let-s-assemble-the-modules"}

포함할 모듈들과 함께 앱 모듈을 선언하고, 진입점 역할을 할 `@KoinApplication` 객체를 선언합니다.

```kotlin
import org.koin.core.annotation.Configuration
import org.koin.core.annotation.KoinApplication
import org.koin.core.annotation.Module

@Module(includes = [ViewModelModule::class, NativeComponentModule::class, PlatformComponentModule::class])
@Configuration
class AppModule

@KoinApplication
object KoinApp
```

`KoinApp`은 모든 `@Configuration` 모듈을 수집합니다. 여기에는 포함된 하위 모듈들을 가진 `AppModule`과 `data` Gradle 모듈의 `DataModule`이 포함됩니다. 컴파일러 플러그인은 빌드 타임에 전체 의존성 그래프를 검증합니다.

## Koin 시작 및 ViewModel 주입하기 {id="let-s-start-koin-and-inject-the-viewmodels"}

루트 컴포저블에서 `KoinApplication`과 `koinConfiguration<KoinApp>()`을 사용하여 Koin을 시작합니다.

```kotlin
import org.koin.compose.KoinApplication
import org.koin.plugin.module.dsl.koinConfiguration

@Serializable
object ListDestination

@Serializable
data class DetailDestination(val objectId: Int)

@Composable
fun App() {
    KoinApplication(configuration = koinConfiguration<KoinApp>()) {
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
}
```

각 화면에서는 `koinViewModel()`을 사용하여 ViewModel을 가져옵니다.

```kotlin
import org.koin.compose.viewmodel.koinViewModel

@Composable
fun ListScreen(navigateToDetails: (objectId: Int) -> Unit) {
    val viewModel = koinViewModel<ListViewModel>()
    val objects by viewModel.objects.collectAsStateWithLifecycle()
    ...
}

@Composable
fun DetailScreen(objectId: Int, navigateBack: () -> Unit) {
    val viewModel = koinViewModel<DetailViewModel>()
    val obj by viewModel.getObject(objectId).collectAsStateWithLifecycle(initialValue = null)
    ...
}
```

`KoinApplication`은 전체 앱에 대해 Koin을 한 번 시작합니다. Android에서는 Android 컨텍스트와 로거도 설정해주며, 이를 통해 `AndroidContextWrapper`가 `Context`를 가져올 수 있게 됩니다. 두 플랫폼 모두 동일한 `App` 컴포저블을 호스팅하므로, Android의 `Application` 클래스나 iOS 앱 코드에 별도의 시작 코드를 작성할 필요가 없습니다.

```kotlin
// iosMain
fun MainViewController() = ComposeUIViewController { App() }
```

Android Studio에서 Android 앱을 실행하거나 Xcode에서 iOS 앱을 실행하면 예술품 목록이 표시됩니다. Compose 외부에서는 `org.koin.plugin.module.dsl`의 `startKoin<KoinApp>()`을 대신 사용하세요. 자세한 내용은 [Compose용 Koin](/docs/reference/koin-compose/compose) 및 [Compose ViewModel](/docs/reference/koin-compose/compose-viewmodel)을 참조하세요.

## 다음 단계 {id="next-steps"}

- [핵심 개념](/docs/intro/core-concepts): 모듈, 정의, 주입의 기반이 되는 멘탈 모델을 알아봅니다.
- [KMP 공유 모듈](/docs/reference/koin-core/kmp-shared-modules): 여러 플랫폼에 걸쳐 Koin 모듈을 공유하고 분리하는 방법을 알아봅니다.
- [어노테이션 레퍼런스](/docs/reference/koin-annotations/annotations-inventory): 모든 어노테이션과 해당 매개변수를 살펴봅니다.
- [Compose 테스팅](/docs/reference/koin-compose/compose-testing): Koin을 사용하는 컴포저블을 테스트하는 방법을 알아봅니다.
- [도구(Tooling)](/docs/tooling): Koin용 IDE 플러그인 및 모니터링 도구를 확인해 보세요.