---
title: Android Jetpack Compose
---

# Android Jetpack Compose

이 튜토리얼에서는 목록에서 선택한 사용자에게 인사말을 표시하는 Jetpack Compose UI 기반의 Android 앱을 만들어 봅니다. Koin 모듈에서 ViewModel을 선언하고, `koinViewModel()`을 사용해 컴포저블(composable)에 주입하며, `Application` 클래스에서 Koin을 시작하는 방법을 배웁니다. 약 10분 정도 소요되며 Android Studio가 필요합니다.

이 튜토리얼은 Compiler Plugin DSL을 사용합니다. 어노테이션(annotation)을 사용하는 Android 앱에 대해서는 [Android & Annotations](/docs/quickstart/android-annotations)를 참조하세요. 각 스타일을 비교하려면 [Choosing your style](/docs/intro/choosing-your-style)을 확인하세요.

## 코드 가져오기 {id="get-the-code"}

전체 샘플 코드는 [koin-getting-started/android-compose](https://github.com/InsertKoinIO/koin-getting-started/tree/main/android-compose)에 있습니다. 저장소를 클론하고 Android Studio에서 `android-compose` 폴더를 엽니다.

## Gradle 설정 {id="gradle-setup"}

이 샘플은 Koin Compiler Plugin을 적용하고 `koin-android` 및 `koin-androidx-compose`를 추가합니다. 버전은 버전 카탈로그(version catalog)에서 관리됩니다:

```toml
# gradle/libs.versions.toml
[versions]
# Kotlin, Android Gradle Plugin, AndroidX and Compose entries omitted
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-android = { module = "io.insert-koin:koin-android", version.ref = "koin" }
koin-androidx-compose = { module = "io.insert-koin:koin-androidx-compose", version.ref = "koin" }
koin-test-junit4 = { module = "io.insert-koin:koin-test-junit4", version.ref = "koin" }
koin-android-test = { module = "io.insert-koin:koin-android-test", version.ref = "koin" }

[plugins]
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

```kotlin
// app/build.gradle.kts
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.koin.compiler)
}

android {
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.koin.android)
    implementation(libs.koin.androidx-compose)

    // Compose BOM, ui, material3, activity-compose, lifecycle-viewmodel-compose
    implementation(platform(libs.compose.bom))
    ...

    testImplementation(libs.koin.test.junit4)
    testImplementation(libs.koin.android.test)
}
```

Compiler Plugin을 사용하려면 Kotlin 2.3.20 이상이 필요합니다. 최신 버전과 BOM에 대한 내용은 [Gradle setup](/docs/setup/gradle)을 참조하세요. 플러그인 옵션에 대해서는 [Compiler Plugin setup](/docs/setup/compiler-plugin)을 참조하세요.

## 애플리케이션 구조 {id="the-application"}

메인 화면은 ViewModel에 인사말 메시지를 요청합니다. ViewModel은 `UserRepository`에서 데이터를 읽어오는 `UserService`를 사용합니다:

```
User -> UserRepository -> UserService -> UserViewModel -> MainScreen
```

## 사용자 데이터 작성하기 {id="let-s-write-the-user-data"}

데이터 클래스와 기본 사용자 목록을 정의하는 것부터 시작합니다:

```kotlin
data class User(val name: String, val email: String)

val DEFAULT_USER = User("Alice", "alice@example.com")

val DEFAULT_USERS = listOf(
    DEFAULT_USER,
    User("Bob", "bob@example.com"),
    User("Charlie", "charlie@example.com")
)
```

이 사용자들은 리포지토리가 저장할 데이터입니다.

## 리포지토리 작성하기 {id="let-s-write-the-repository"}

리포지토리는 사용자를 메모리에 보관하고 이름으로 사용자를 찾습니다:

```kotlin
interface UserRepository {
    fun findUserOrNull(name: String): User?
    fun addUsers(users: List<User>)
}

class UserRepositoryImpl : UserRepository {

    private val _users = arrayListOf<User>()

    override fun findUserOrNull(name: String): User? {
        return _users.firstOrNull { it.name == name }
    }

    override fun addUsers(users: List<User>) {
        _users.addAll(users)
    }
}
```

`UserRepositoryImpl`은 의존성이 없으므로, Koin이 추가 정보 없이도 인스턴스를 생성할 수 있습니다.

## 서비스 작성하기 {id="let-s-write-the-service"}

`UserService`는 생성될 때 사용자 목록을 로드하고 인사말 메시지를 준비합니다:

```kotlin
interface UserService {
    fun getUserOrNull(name: String = DEFAULT_USER.name): User?
    fun loadUsers()
    fun prepareHelloMessage(user: User?): String
}

class UserServiceImpl(
    private val userRepository: UserRepository
) : UserService {

    init {
        loadUsers()
    }

    override fun getUserOrNull(name: String): User? = userRepository.findUserOrNull(name)

    override fun loadUsers() {
        userRepository.addUsers(DEFAULT_USERS)
    }

    override fun prepareHelloMessage(user: User?): String {
        return user?.let { "Hello '${user.name}' (${user.email})!" } ?: "User not found"
    }
}
```

`UserServiceImpl`은 `UserRepository`에 의존합니다. Koin은 생성자를 통해 이를 주입합니다.

## ViewModel 작성하기 {id="let-s-write-the-viewmodel"}

ViewModel은 이름을 받아 인사말로 변환합니다:

```kotlin
class UserViewModel(
    private val userService: UserService
) : ViewModel() {

    fun sayHello(name: String): String {
        val user = userService.getUserOrNull(name)
        val message = userService.prepareHelloMessage(user)
        return "[UserViewModel] $message"
    }
}
```

다른 컴포넌트와 마찬가지로 생성자를 통해 `UserService`를 전달받습니다.

## Koin 모듈 선언하기 {id="let-s-declare-the-koin-module"}

모듈은 Koin이 생성할 컴포넌트를 선언하는 곳입니다([Core Concepts](/docs/intro/core-concepts) 참조). 리포지토리와 서비스를 각각의 인터페이스에 바인딩된 싱글톤으로 선언하고, ViewModel은 `viewModel`을 사용해 선언합니다:

```kotlin
import org.koin.dsl.bind
import org.koin.dsl.module
import org.koin.plugin.module.dsl.single
import org.koin.plugin.module.dsl.viewModel

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
    viewModel<UserViewModel>()
}
```

Compiler Plugin은 각 생성자를 읽어 빌드 타임에 모든 의존성이 선언되어 있는지 검사합니다. 정의 타입에 대한 자세한 내용은 [Definitions](/docs/reference/koin-core/definitions)를 참조하세요.

## 컴포저블에서 ViewModel 주입하기 {id="let-s-inject-the-viewmodel-in-a-composable"}

`ComponentActivity`에서 Compose 콘텐츠를 설정하고, `MainScreen`의 기본 매개변수로 `koinViewModel()`을 사용해 ViewModel을 가져옵니다:

```kotlin
import org.koin.androidx.compose.koinViewModel

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                MainScreen()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    viewModel: UserViewModel = koinViewModel()
) {
    var nameInput by remember { mutableStateOf("") }
    var greetingMessage by remember { mutableStateOf("") }

    Scaffold(
        topBar = { TopAppBar(title = { Text("Koin Sample") }) }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            OutlinedTextField(
                value = nameInput,
                onValueChange = { nameInput = it },
                label = { Text("Enter name") },
                modifier = Modifier.fillMaxWidth()
            )

            Button(
                onClick = {
                    val userName = nameInput.trim().ifEmpty { "Alice" }
                    greetingMessage = viewModel.sayHello(userName)
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Say Hello")
            }

            if (greetingMessage.isNotEmpty()) {
                Text(
                    text = greetingMessage,
                    style = MaterialTheme.typography.bodyLarge,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}
```

`koinViewModel()`은 Koin에서 ViewModel을 가져와 가장 가까운 `ViewModelStoreOwner`(여기서는 Activity)에 연결합니다. 기본 매개변수로 지정해 두면 프리뷰나 테스트 시 다른 인스턴스를 전달할 수 있습니다. `koinInject()`와 같은 기타 Compose API는 [Compose ViewModel](/docs/reference/koin-compose/compose-viewmodel) 및 [Koin for Compose](/docs/reference/koin-compose/compose)에서 확인할 수 있습니다.

## Koin 시작하기 {id="let-s-start-koin"}

`Application` 클래스에서 Koin을 시작하고, 이 클래스를 `AndroidManifest.xml`에 등록합니다:

```kotlin
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.startKoin

class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidContext(this@MainApplication)
            modules(appModule)
        }
    }
}
```

`androidContext()`는 정의에서 Android `Context`를 사용할 수 있도록 제공합니다. 앱을 실행하고 이름을 입력한 뒤 버튼을 탭하여 인사말 메시지를 확인해 보세요. 기타 옵션은 [Starting Koin on Android](/docs/reference/koin-android/start)를 참조하세요.

## 다음 단계 {id="next-steps"}

- [Core Concepts](/docs/intro/core-concepts): 모듈, 정의, 주입의 기본 개념을 알아봅니다.
- [Koin for Compose](/docs/reference/koin-compose/compose): `koinInject()`, `KoinApplication` 및 Compose 설정을 살펴봅니다.
- [Compose Multiplatform](/docs/quickstart/cmp): Compose UI와 Koin 모듈을 iOS와 공유하는 방법을 배웁니다.
- [Compose testing](/docs/reference/koin-compose/compose-testing): Koin을 사용하는 컴포저블을 테스트하는 방법을 알아봅니다.
- [Tooling](/docs/tooling): Koin을 위한 IDE 플러그인과 모니터링 도구를 확인합니다.