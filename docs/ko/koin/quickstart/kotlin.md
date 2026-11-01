---
title: Kotlin
---

# Kotlin

이 튜토리얼에서는 사용자 목록을 불러오고 인사말을 출력하는 Kotlin 콘솔 앱을 빌드합니다. Koin 모듈을 선언하고, 인터페이스에 구현체를 바인딩하며, Koin을 시작하는 방법을 배웁니다. 약 10분 정도 소요되며 JDK 17 및 Gradle이 필요합니다.

이 튜토리얼은 Compiler Plugin DSL을 사용합니다. 어노테이션(Annotation)을 사용하는 동일한 앱에 대해서는 [Kotlin & Annotations](/docs/quickstart/kotlin-annotations)를 참고하세요. 각 스타일을 비교하려면 [Choosing your style](/docs/intro/choosing-your-style)을 확인하세요.

## 코드 가져오기 {id="get-the-code"}

전체 샘플 코드는 [koin-getting-started/kotlin](https://github.com/InsertKoinIO/koin-getting-started/tree/main/kotlin)에 있습니다. 저장소를 클론(clone)하고 `kotlin` 폴더에서 실행하세요:

```bash
./gradlew run
```

## Gradle 설정 {id="gradle-setup"}

이 샘플은 Koin Compiler Plugin을 적용하고 `koin-core`를 추가합니다. 버전 관리는 버전 카탈로그(Version Catalog)를 사용합니다:

```toml
# gradle/libs.versions.toml
[versions]
kotlin = "<KOTLIN_VERSION>"
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-test = { module = "io.insert-koin:koin-test", version.ref = "koin" }
koin-test-junit4 = { module = "io.insert-koin:koin-test-junit4", version.ref = "koin" }

[plugins]
kotlin-jvm = { id = "org.jetbrains.kotlin.jvm", version.ref = "kotlin" }
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

```kotlin
// app/build.gradle.kts
plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.koin.compiler)
    application
}

dependencies {
    implementation(libs.koin.core)

    testImplementation(libs.koin.test)
    testImplementation(libs.koin.test.junit4)
}
```

Compiler Plugin을 사용하려면 Kotlin 2.3.20 이상이 필요합니다. 최신 버전 및 BOM에 대해서는 [Gradle setup](/docs/setup/gradle)을 참고하세요. 플러그인 옵션에 대해서는 [Compiler Plugin setup](/docs/setup/compiler-plugin)을 참고하세요.

## 애플리케이션 구조 {id="the-application"}

이 앱은 세 개의 컴포넌트를 연결합니다. `UserApplication`은 `UserService`에 사용자를 요청하고, `UserService`는 `UserRepository`에서 데이터를 읽어옵니다:

```
User -> UserRepository -> UserService -> UserApplication
```

## 사용자 데이터 작성하기 {id="let-s-write-the-user-data"}

데이터 클래스와 기본 사용자 목록부터 시작합니다:

```kotlin
data class User(val name: String, val email: String)

val DEFAULT_USER = User("Alice", "alice@example.com")

val DEFAULT_USERS = listOf(
    DEFAULT_USER,
    User("Bob", "bob@example.com"),
    User("Charlie", "charlie@example.com")
)
```

이 사용자 데이터는 리포지토리가 저장할 데이터입니다.

## 리포지토리 작성하기 {id="let-s-write-the-repository"}

리포지토리는 사용자를 메모리에 유지하고 이름으로 사용자를 찾습니다:

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

`UserRepositoryImpl`은 의존성이 없으므로, Koin이 별도의 추가 정보 없이 생성할 수 있습니다.

## Koin 모듈 선언하기 {id="let-s-declare-the-koin-module"}

모듈은 Koin이 생성할 컴포넌트를 선언하는 곳입니다([Core Concepts](/docs/intro/core-concepts) 참고). `UserRepositoryImpl`을 싱글톤으로 선언하고 `UserRepository`로 바인딩하여 사용할 수 있도록 합니다:

```kotlin
import org.koin.dsl.bind
import org.koin.dsl.module
import org.koin.plugin.module.dsl.single

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
}
```

이제 `UserRepository`를 요청하는 모든 컴포넌트는 동일한 `UserRepositoryImpl` 인스턴스를 받게 됩니다. `single`과 `bind`에 대한 자세한 내용은 [Definitions](/docs/reference/koin-core/definitions)에 설명되어 있습니다.

## 서비스 작성하기 {id="let-s-write-the-service"}

`UserService`는 사용자를 불러오고 인사말을 준비합니다:

```kotlin
interface UserService {
    fun getUserOrNull(name: String = DEFAULT_USER.name): User?
    fun loadUsers()
    fun prepareHelloMessage(user: User?): String
}

class UserServiceImpl(
    private val userRepository: UserRepository
) : UserService {

    override fun getUserOrNull(name: String): User? = userRepository.findUserOrNull(name)

    override fun loadUsers() {
        userRepository.addUsers(DEFAULT_USERS)
    }

    override fun prepareHelloMessage(user: User?): String {
        return user?.let { "Hello '${user.name}' (${user.email})!" } ?: "User not found"
    }
}
```

이를 모듈에 추가합니다:

```kotlin
val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
}
```

`UserServiceImpl`은 생성자에서 `UserRepository`를 받습니다. Compiler Plugin이 이 생성자를 분석하여 `UserRepositoryImpl` 인스턴스를 자동으로 전달해 줍니다.

## 애플리케이션 클래스 작성하기 {id="let-s-write-the-application-class"}

`UserApplication`은 생성자를 통해 `UserService`를 주입받고, 사용자를 불러온 뒤 인사말을 출력합니다:

```kotlin
class UserApplication(
    private val userService: UserService
) {

    init {
        userService.loadUsers()
    }

    fun sayHello(name: String) {
        val user = userService.getUserOrNull(name)
        val message = userService.prepareHelloMessage(user)
        println(message)
    }
}
```

이 클래스 역시 모듈에 선언합니다:

```kotlin
val appModule = module {
    single<UserApplication>()
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
}
```

이제 세 개의 컴포넌트가 모두 모듈에 등록되었습니다. 플러그인은 빌드 시점에 각 생성자 매개변수에 대한 정의가 존재하는지 검사합니다.

## Koin 시작하기 {id="let-s-start-koin"}

`main()`에서 모듈과 함께 Koin을 시작한 다음 컨테이너에서 `UserApplication`을 가져옵니다:

```kotlin
import org.koin.core.context.startKoin
import org.koin.mp.KoinPlatform

fun main() {
    startKoin {
        modules(appModule)
    }

    val userApplication = KoinPlatform.getKoin().get<UserApplication>()
    userApplication.sayHello("Alice")
}
```

`./gradlew run`을 실행하면 앱이 `Hello 'Alice' (alice@example.com)!`을 출력합니다. `startKoin` 및 관련 옵션은 [Starting Koin](/docs/reference/koin-core/starting-koin)에서 다룹니다.

## 다음 단계 {id="next-steps"}

- [Core Concepts](/docs/intro/core-concepts): 모듈, 정의(definition), 주입의 기반이 되는 핵심 개념.
- [Definitions](/docs/reference/koin-core/definitions): 모든 정의 유형 및 바인딩 옵션.
- [JUnit Tests](/docs/quickstart/junit-test): Koin Test를 사용하여 동일한 앱 테스트하기.
- [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety): Compiler Plugin이 의존성 그래프에서 검사하는 항목.
- [Tooling](/docs/tooling): Koin을 위한 IDE 플러그인 및 모니터링 도구.