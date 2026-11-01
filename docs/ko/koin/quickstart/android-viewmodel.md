---
title: Android ViewModel
---

# Android ViewModel

이 튜토리얼에서는 목록에서 선택한 사용자에게 인사말을 건네는 Android 앱을 빌드합니다. Koin 모듈에서 ViewModel을 선언하고, Activity에 주입하며, `Application` 클래스에서 Koin을 시작하는 방법을 배웁니다. 약 10분 정도 소요되며 Android Studio가 필요합니다.

이 튜토리얼은 컴파일러 플러그인 DSL(Compiler Plugin DSL)을 사용합니다. 어노테이션(Annotation)을 사용한 동일한 앱에 대해서는 [Android & Annotations](/docs/quickstart/android-annotations)를 참조하세요. 스타일을 비교하려면 [Choosing your style](/docs/intro/choosing-your-style)을 참조하세요.

## 코드 가져오기 {id="get-the-code"}

전체 샘플 코드는 [koin-getting-started/android](https://github.com/InsertKoinIO/koin-getting-started/tree/main/android)에 있습니다. 레포지토리를 클론(clone)하고 Android Studio에서 `android` 폴더를 여세요.

## Gradle 설정 {id="gradle-setup"}

이 샘플은 Koin 컴파일러 플러그인을 적용하고 ViewModel 지원을 포함하는 `koin-android`를 추가합니다. 버전은 버전 카탈로그(Version Catalog)에서 관리합니다:

```toml
# gradle/libs.versions.toml
[versions]
# Kotlin, Android Gradle Plugin 및 AndroidX 항목 생략됨
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-android = { module = "io.insert-koin:koin-android", version.ref = "koin" }
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
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(libs.android.appcompat)
    implementation(libs.koin.android)

    testImplementation(libs.koin.test.junit4)
    testImplementation(libs.koin.android.test)
}
```

컴파일러 플러그인은 Kotlin 2.3.20 이상이 필요합니다. 최신 버전 및 BOM에 대해서는 [Gradle setup](/docs/setup/gradle)을 참조하세요. 플러그인 옵션에 대해서는 [Compiler Plugin setup](/docs/setup/compiler-plugin)을 참조하세요.

## 애플리케이션 구조 {id="the-application"}

Activity는 ViewModel에 인사말을 요청합니다. ViewModel은 `UserRepository`에서 데이터를 읽어오는 `UserService`를 사용합니다:

```
User -> UserRepository -> UserService -> UserViewModel -> MainActivity
```

## 사용자 데이터 작성하기 {id="let-s-write-the-user-data"}

데이터 클래스와 기본 사용자 목록을 작성하는 것으로 시작합니다:

```kotlin
data class User(val name: String, val email: String)

val DEFAULT_USER = User("Alice", "alice@example.com")

val DEFAULT_USERS = listOf(
    DEFAULT_USER,
    User("Bob", "bob@example.com"),
    User("Charlie", "charlie@example.com")
)
```

이 사용자 객체들이 레포지토리에 저장될 데이터입니다.

## 레포지토리 작성하기 {id="let-s-write-the-repository"}

레포지토리는 사용자를 메모리에 보관하고 이름으로 사용자를 찾습니다:

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

`UserRepositoryImpl`은 의존성이 없으므로 Koin이 추가 정보 없이도 인스턴스를 생성할 수 있습니다.

## 서비스 작성하기 {id="let-s-write-the-service"}

`UserService`는 생성될 때 사용자를 로드하고 인사말 메시지를 준비합니다:

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

`UserServiceImpl`은 `UserRepository`에 의존합니다. Koin이 생성자를 통해 이를 전달합니다.

## Koin 모듈 선언하기 {id="let-s-declare-the-koin-module"}

모듈은 Koin이 생성할 컴포넌트를 선언하는 곳입니다([Core Concepts](/docs/intro/core-concepts) 참조). 두 컴포넌트를 싱글톤(singleton)으로 선언하고 각각의 인터페이스에 바인딩합니다:

```kotlin
import org.koin.dsl.bind
import org.koin.dsl.module
import org.koin.plugin.module.dsl.single

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
}
```

이제 `UserService`를 요청하는 모든 컴포넌트는 동일한 `UserServiceImpl` 인스턴스를 받게 됩니다. `single`과 `bind`에 대한 자세한 내용은 [Definitions](/docs/reference/koin-core/definitions)를 참조하세요.

## ViewModel 작성하기 {id="let-s-write-the-viewmodel"}

ViewModel은 이름을 인사말로 변환합니다:

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

`viewModel`을 사용하여 이를 선언합니다:

```kotlin
import org.koin.plugin.module.dsl.viewModel

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
    viewModel<UserViewModel>()
}
```

이제 Android ViewModel 메커니즘이 이 인스턴스를 소유합니다. 즉, 구성 변경(configuration changes) 시에도 유지되며 소유자(owner)가 소멸될 때 함께 정리됩니다. 파라미터 및 `SavedStateHandle`에 대한 내용은 [ViewModel](/docs/reference/koin-core/viewmodel)을 참조하세요.

## Activity에 ViewModel 주입하기 {id="let-s-inject-the-viewmodel-in-the-activity"}

`MainActivity`에서 `by viewModel()` 대리자(delegate)를 사용합니다:

```kotlin
import org.koin.androidx.viewmodel.ext.android.viewModel

class MainActivity : AppCompatActivity() {

    private val viewModel: UserViewModel by viewModel()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_simple)

        val nameInput = findViewById<EditText>(R.id.nameInput)
        val sayHelloButton = findViewById<Button>(R.id.sayHelloButton)
        val textField = findViewById<TextView>(R.id.text)

        sayHelloButton.setOnClickListener {
            val userName = nameInput.text.toString().trim().ifEmpty { "Alice" }
            textField.text = viewModel.sayHello(userName)
        }
    }
}
```

`by viewModel()`은 자동으로 ViewModel 팩토리를 생성하고 인스턴스를 Activity의 생명주기(lifecycle)에 바인딩합니다. Fragment를 위한 `activityViewModel()`과 같은 다른 대리자에 대해서는 [Android ViewModel](/docs/reference/koin-android/viewmodel)을 참조하세요.

## Koin 시작하기 {id="let-s-start-koin"}

`Application` 클래스에서 Koin을 시작하고, `AndroidManifest.xml`에 해당 클래스를 등록합니다:

```kotlin
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.context.startKoin
import org.koin.core.logger.Level

class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidLogger(Level.DEBUG)
            androidContext(this@MainApplication)
            modules(appModule)
        }
    }
}
```

`androidContext()`는 정의(definitions)에서 Android `Context`를 사용할 수 있도록 해주며, `androidLogger()`는 Koin 로그를 Logcat으로 전송합니다. 앱을 실행하고 이름을 입력한 뒤 버튼을 탭하여 인사말을 확인해 보세요. 기타 옵션에 대해서는 [Starting Koin on Android](/docs/reference/koin-android/start)를 참조하세요.

## 다음 단계 {id="next-steps"}

- [Core Concepts](/docs/intro/core-concepts): 모듈, 정의(definition), 주입(injection)의 기본 개념.
- [Android ViewModel](/docs/reference/koin-android/viewmodel): 모든 ViewModel 대리자, 공유 ViewModel 및 내비게이션 그래프.
- [Android Jetpack Compose](/docs/quickstart/android-compose): Compose UI로 작성된 동일한 앱.
- [Instrumented testing](/docs/reference/koin-android/instrumented-testing): Koin을 사용한 Android 앱 테스트.
- [Tooling](/docs/tooling): Koin을 위한 IDE 플러그인 및 모니터링 도구.