---
title: Android
---

# Android

이 튜토리얼에서는 목록에서 선택한 사용자에게 인사말을 건네는 Android 앱을 만들어 봅니다. Koin 모듈을 선언하는 방법, Activity에서 프레젠터(Presenter)를 주입받는 방법, `Application` 클래스에서 Koin을 시작하는 방법을 배웁니다. 약 10분 정도 소요되며 Android Studio가 필요합니다.

이 튜토리얼은 Compiler Plugin DSL을 사용합니다. 어노테이션을 사용하는 동일한 앱은 [Android & Annotations](/docs/quickstart/android-annotations)를 참고하세요. 스타일을 비교해 보려면 [Choosing your style](/docs/intro/choosing-your-style)을 확인하세요. 프레젠터 대신 ViewModel을 사용하여 동일한 앱을 구축하는 방법은 [Android ViewModel](/docs/quickstart/android-viewmodel) 튜토리얼을 참고하세요.

## 코드 가져오기 {id="get-the-code"}

전체 샘플 코드는 [koin-getting-started/android](https://github.com/InsertKoinIO/koin-getting-started/tree/main/android)에 있습니다. 저장소를 클론한 후 Android Studio에서 `android` 폴더를 엽니다.

## Gradle 설정 {id="gradle-setup"}

이 샘플은 Koin Compiler Plugin을 적용하고 `koin-android`를 추가합니다. 버전은 버전 카탈로그(version catalog)에서 관리됩니다.

```toml
# gradle/libs.versions.toml
[versions]
# Kotlin, Android Gradle Plugin and AndroidX entries omitted
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

Compiler Plugin을 사용하려면 Kotlin 2.3.20 이상 버전이 필요합니다. 최신 버전 및 BOM에 대해서는 [Gradle setup](/docs/setup/gradle)을 참고하세요. 플러그인 옵션은 [Compiler Plugin setup](/docs/setup/compiler-plugin)을 확인하세요.

## 애플리케이션 구조 {id="the-application"}

Activity는 프레젠터에 인사말을 요청합니다. 프레젠터는 `UserRepository`에서 데이터를 읽어오는 `UserService`를 사용합니다.

```
User -> UserRepository -> UserService -> UserPresenter -> MainActivity
```

## 사용자 데이터 작성하기 {id="let-s-write-the-user-data"}

데이터 클래스와 기본 사용자 목록부터 시작합니다.

```kotlin
data class User(val name: String, val email: String)

val DEFAULT_USER = User("Alice", "alice@example.com")

val DEFAULT_USERS = listOf(
    DEFAULT_USER,
    User("Bob", "bob@example.com"),
    User("Charlie", "charlie@example.com")
)
```

이 사용자 목록은 리포지토리가 저장할 데이터입니다.

## 리포지토리 작성하기 {id="let-s-write-the-repository"}

리포지토리는 메모리에 사용자를 보관하고 이름으로 사용자를 찾습니다.

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

`UserRepositoryImpl`은 의존성이 없으므로, Koin은 추가 정보 없이도 이를 생성할 수 있습니다.

## 서비스 작성하기 {id="let-s-write-the-service"}

`UserService`는 생성될 때 사용자를 불러오고 인사말을 준비합니다.

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

`UserServiceImpl`은 `UserRepository`에 의존합니다. Koin은 생성자를 통해 이를 전달합니다.

## Koin 모듈 선언하기 {id="let-s-declare-the-koin-module"}

모듈은 Koin이 생성할 컴포넌트를 선언하는 곳입니다([Core Concepts](/docs/intro/core-concepts) 참고). 두 컴포넌트를 싱글톤(singleton)으로 선언하고 각각의 인터페이스에 바인딩합니다.

```kotlin
import org.koin.dsl.bind
import org.koin.dsl.module
import org.koin.plugin.module.dsl.single

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
}
```

이제 `UserService`를 요청하는 모든 컴포넌트는 동일한 `UserServiceImpl` 인스턴스를 받게 됩니다. `single`과 `bind`에 대한 자세한 내용은 [Definitions](/docs/reference/koin-core/definitions)를 참고하세요.

## 프레젠터 작성하기 {id="let-s-write-the-presenter"}

프레젠터는 이름을 받아 인사말로 변환합니다.

```kotlin
class UserPresenter(
    private val userService: UserService
) {

    fun sayHello(name: String): String {
        val user = userService.getUserOrNull(name)
        val message = userService.prepareHelloMessage(user)
        return "[UserPresenter] $message"
    }
}
```

매 요청마다 새로운 인스턴스가 생성되고 Koin이 이에 대한 참조를 유지하지 않도록 `factory`로 선언합니다.

```kotlin
import org.koin.plugin.module.dsl.factory

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
    factory<UserPresenter>()
}
```

`factory`로 생성된 프레젠터는 이를 사용하는 Activity보다 더 오래 살아남을 수 없으므로, Activity 메모리 누수(leak)를 방지할 수 있습니다.

## Activity에 프레젠터 주입하기 {id="let-s-inject-the-presenter-in-the-activity"}

`MainActivity`에서 프레젠터를 가져오려면 `by inject()` 위임 프로퍼티를 사용합니다.

```kotlin
import org.koin.android.ext.android.inject

class MainActivity : AppCompatActivity() {

    private val presenter: UserPresenter by inject()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_simple)

        val nameInput = findViewById<EditText>(R.id.nameInput)
        val sayHelloButton = findViewById<Button>(R.id.sayHelloButton)
        val textField = findViewById<TextView>(R.id.text)

        sayHelloButton.setOnClickListener {
            val userName = nameInput.text.toString().trim().ifEmpty { "Alice" }
            textField.text = presenter.sayHello(userName)
        }
    }
}
```

`by inject()`는 프레젠터를 처음 사용할 때 지연(lazy) 방식으로 의존성을 해결합니다. 이를 지원하는 다른 Android 컴포넌트 목록은 [Android Entry Points](/docs/reference/koin-android/entry-points)에서 확인할 수 있습니다.

## Koin 시작하기 {id="let-s-start-koin"}

`Application` 클래스에서 Koin을 시작하고, 해당 클래스를 `AndroidManifest.xml`에 등록합니다.

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

`androidContext()`는 Android `Context`를 정의에서 사용할 수 있도록 제공하며, `androidLogger()`는 Koin 로그를 Logcat으로 출력합니다. 앱을 실행하고 이름을 입력한 뒤 버튼을 탭하여 인사말을 확인해 보세요. 다른 옵션에 대해서는 [Starting Koin on Android](/docs/reference/koin-android/start)를 참고하세요.

## 다음 단계 {id="next-steps"}

- [Core Concepts](/docs/intro/core-concepts): 모듈, 정의, 의존성 주입의 기본 개념
- [Android ViewModel](/docs/quickstart/android-viewmodel): ViewModel을 사용한 동일한 앱 구현
- [Android Entry Points](/docs/reference/koin-android/entry-points): Fragment, Service, BroadcastReceiver 등에서의 의존성 주입
- [Instrumented testing](/docs/reference/koin-android/instrumented-testing): Koin을 활용한 Android 앱 계측 테스트
- [Tooling](/docs/tooling): Koin용 IDE 플러그인 및 모니터링 도구