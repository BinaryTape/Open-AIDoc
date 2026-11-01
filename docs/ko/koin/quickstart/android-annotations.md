---
title: Android & Annotations
---

# Android & Annotations

이 튜토리얼에서는 목록에서 선택한 사용자에게 인사말을 건네는 Android 앱을 빌드합니다. 클래스에 어노테이션을 지정하고, 이를 모듈로 스캔하며, ViewModel에 자체 스코프 종속성(scoped dependency)을 부여하고, `@KoinApplication` 클래스에서 Koin을 시작하는 방법을 알아봅니다. 약 10분이 소요되며 Android Studio가 필요합니다.

이 튜토리얼은 어노테이션을 사용합니다. Compiler Plugin DSL을 사용한 동일한 앱에 대해서는 [Android](/docs/quickstart/android) 및 [Android ViewModel](/docs/quickstart/android-viewmodel)을 참고하세요. 스타일을 비교하려면 [Choosing your style](/docs/intro/choosing-your-style)을 참조하세요.

## 코드 가져오기 {id="get-the-code"}

전체 샘플 코드는 [koin-getting-started/android-annotations](https://github.com/InsertKoinIO/koin-getting-started/tree/main/android-annotations)에 있습니다. 저장소를 복제(clone)하고 Android Studio에서 `android-annotations` 폴더를 엽니다.

## Gradle 설정 {id="gradle-setup"}

이 샘플은 Koin Compiler Plugin을 적용하고 `koin-android` 및 `koin-annotations`를 추가합니다. 버전은 버전 카탈로그(version catalog)에서 관리됩니다.

```toml
# gradle/libs.versions.toml
[versions]
# Kotlin, Android Gradle Plugin 및 AndroidX 항목 생략
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-android = { module = "io.insert-koin:koin-android", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }
koin-test-junit4 = { module = "io.insert-koin:koin-test-junit4", version.ref = "koin" }

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
    implementation(libs.koin.annotations)

    testImplementation(libs.koin.test.junit4)
}
```

Compiler Plugin은 어노테이션을 처리하며 Kotlin 2.3.20 이상이 필요합니다. `koin-annotations`는 Koin 버전을 공유합니다. 컴파일 타임 안전성(Compile-time safety)은 기본적으로 활성화되어 있습니다. 자세한 내용은 [Gradle setup](/docs/setup/gradle) 및 [Compiler Plugin setup](/docs/setup/compiler-plugin)을 참조하세요.

## 애플리케이션 구조 {id="the-application"}

Activity는 ViewModel에 인사말을 요청합니다. ViewModel은 `UserRepository`에서 데이터를 읽어오는 `UserService`를 사용하며, 자신의 수명 주기에 스코프가 지정된 `UserPresenter`를 소유합니다.

```
User -> UserRepository -> UserService -> UserViewModel (+ UserPresenter) -> MainActivity
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

이 사용자들은 리포지토리에 저장되는 데이터입니다.

## 리포지토리 작성하기 {id="let-s-write-the-repository"}

리포지토리는 메모리에 사용자를 유지합니다. 구현체에 `@Singleton` 어노테이션을 추가합니다.

```kotlin
import org.koin.core.annotation.Singleton

interface UserRepository {
    fun findUserOrNull(name: String): User?
    fun addUsers(users: List<User>)
}

@Singleton
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

Koin은 `UserRepositoryImpl`을 상위 타입에 바인딩하므로, `UserRepository`를 요청하면 이 인스턴스를 가져옵니다. `@Singleton`은 `@Single`과 동일합니다([Definitions](/docs/reference/koin-core/definitions) 참조).

## 서비스 작성하기 {id="let-s-write-the-service"}

`UserService`는 생성될 때 사용자를 로드하고 인사말 메시지를 준비합니다.

```kotlin
interface UserService {
    fun getUserOrNull(name: String = DEFAULT_USER.name): User?
    fun loadUsers()
    fun prepareHelloMessage(user: User?): String
}

@Singleton
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

Compiler Plugin이 생성자를 확인하여 `UserRepository` 인스턴스를 자동으로 전달합니다.

## Presenter와 ViewModel 작성하기 {id="let-s-write-the-presenter-and-the-viewmodel"}

Presenter는 인사말의 서식을 지정합니다. 각 ViewModel이 자체 인스턴스를 갖도록 `@ViewModelScope` 어노테이션을 추가합니다.

```kotlin
import org.koin.core.annotation.ViewModelScope

@ViewModelScope
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

ViewModel에는 `@KoinViewModel`과 스코프가 지정된 Presenter를 주입받을 수 있도록 `@ViewModelScope` 어노테이션을 추가합니다.

```kotlin
import org.koin.core.annotation.KoinViewModel
import org.koin.core.annotation.ViewModelScope

@ViewModelScope
@KoinViewModel
class UserViewModel(
    private val userService: UserService,
    private val userPresenter: UserPresenter
) : ViewModel() {

    fun sayHello(name: String): String {
        val user = userService.getUserOrNull(name)
        val message = userService.prepareHelloMessage(user)
        return "[UserViewModel] $message"
    }
}
```

Presenter는 ViewModel과 동일한 수명 주기를 가지며, ViewModel이 지워질(cleared) 때 함께 해제됩니다. ViewModel 스코프에 대한 설명은 [ViewModel](/docs/reference/koin-core/viewmodel)을, 일반적인 스코프에 대한 설명은 [Scopes](/docs/reference/koin-core/scopes)를 참조하세요.

## Koin 모듈 선언하기 {id="let-s-declare-the-koin-module"}

모듈은 정의(definitions)를 그룹화합니다([Core Concepts](/docs/intro/core-concepts) 참조). 샘플 패키지를 스캔하는 모듈 클래스를 선언합니다.

```kotlin
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.Configuration
import org.koin.core.annotation.Module

@Module
@ComponentScan("org.koin.sample")
@Configuration
class AppModule
```

`@ComponentScan`은 `org.koin.sample` 및 그 하위 패키지에 있는 어노테이션이 달린 모든 클래스를 등록합니다. `@Configuration`은 `@KoinApplication` 진입점에서 이 모듈을 탐색할 수 있도록 만듭니다. 두 어노테이션 모두 [Modules](/docs/reference/koin-core/modules)에 설명되어 있습니다.

## Activity에 ViewModel 주입하기 {id="let-s-inject-the-viewmodel-in-the-activity"}

`MainActivity`에서 `by viewModel()` 델리게이트를 사용합니다.

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

`by viewModel()`은 ViewModel 팩토리를 대신 생성하고 인스턴스를 Activity 수명 주기에 바인딩합니다. 다른 델리게이트들은 [Android ViewModel](/docs/reference/koin-android/viewmodel)을 참고하세요.

## Koin 시작하기 {id="let-s-start-koin"}

`Application` 클래스에 `@KoinApplication` 어노테이션을 달고, 타입이 지정된 `startKoin<T>()`를 사용하여 Koin을 시작합니다. `AndroidManifest.xml`에 해당 클래스를 등록하세요.

```kotlin
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.annotation.KoinApplication
import org.koin.core.annotation.KoinViewModelScopeApi
import org.koin.core.logger.Level
import org.koin.core.option.viewModelScopeFactory
import org.koin.plugin.module.dsl.startKoin

@OptIn(KoinViewModelScopeApi::class)
@KoinApplication
class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin<MainApplication> {
            androidContext(this@MainApplication)
            androidLogger(level = Level.DEBUG)
            options(viewModelScopeFactory())
        }
    }
}
```

`startKoin<MainApplication>`은 모든 `@Configuration` 모듈을 로드하므로 `modules()`를 직접 호출하지 않아도 됩니다. `viewModelScopeFactory()`는 `@ViewModelScope`에 필요한 각 ViewModel용 스코프를 생성하도록 Koin에 지시합니다. 이는 opt-in API입니다(`@KoinViewModelScopeApi`). 다른 옵션에 대해서는 [Starting Koin on Android](/docs/reference/koin-android/start)를 참조하세요.

## 빌드 타임에 그래프 검증하기 {id="let-s-check-the-graph-at-build-time"}

프로젝트를 빌드합니다. Compiler Plugin이 전체 그래프를 검증합니다. 종속성이 누락되었거나 한정자(qualifier)가 일치하지 않는 경우, 또는 선언되지 않은 ViewModel에 대해 `by viewModel()`을 호출하면 해당 파일과 줄 번호를 표시하며 빌드가 실패합니다.

앱을 실행하고 이름을 입력한 다음 버튼을 눌러 인사말을 확인해 보세요. 플러그인이 확인하는 항목은 [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety)에 나열되어 있습니다.

## 다음 단계 {id="next-steps"}

- [Core Concepts](/docs/intro/core-concepts): 모듈, 정의 및 주입의 기반이 되는 멘탈 모델.
- [Android scopes](/docs/reference/koin-android/scope): Android에서의 Activity, Fragment 및 ViewModel 스코프.
- [Annotations Reference](/docs/reference/koin-annotations/annotations-inventory): 모든 어노테이션 및 해당 파라미터.
- [Instrumented testing](/docs/reference/koin-android/instrumented-testing): Koin을 사용하여 Android 앱 테스트하기.
- [Tooling](/docs/tooling): Koin을 위한 IDE 플러그인 및 모니터링 도구.