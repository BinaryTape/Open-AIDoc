---
title: Kotlin & 어노테이션
---

# Kotlin & 어노테이션

이 튜토리얼에서는 사용자 목록을 불러와 인사말을 출력하는 Kotlin 콘솔 앱을 빌드합니다. 클래스에 어노테이션을 추가하고, 이를 모듈로 스캔하며, `@KoinApplication` 객체에서 Koin을 시작하는 방법을 배웁니다. 약 10분 정도 소요되며 JDK 17 및 Gradle이 필요합니다.

이 튜토리얼은 어노테이션을 사용합니다. Compiler Plugin DSL을 사용한 동일한 앱은 [Kotlin](/docs/quickstart/kotlin) 문서를 참고하세요. 두 스타일을 비교해 보려면 [스타일 선택하기(Choosing your style)](/docs/intro/choosing-your-style)를 참고하세요.

## 코드 가져오기 {id="get-the-code"}

전체 샘플 코드는 [koin-getting-started/kotlin-annotations](https://github.com/InsertKoinIO/koin-getting-started/tree/main/kotlin-annotations)에 있습니다. 리포지토리를 클론하고 `kotlin-annotations` 폴더에서 실행하세요:

```bash
./gradlew run
```

## Gradle 설정 {id="gradle-setup"}

이 샘플은 Koin Compiler Plugin을 적용하고 `koin-core` 및 `koin-annotations` 의존성을 추가합니다. 버전 관리는 버전 카탈로그(version catalog)를 사용합니다:

```toml
# gradle/libs.versions.toml
[versions]
kotlin = "<KOTLIN_VERSION>"
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }
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
    implementation(libs.koin.annotations)

    testImplementation(libs.koin.test)
    testImplementation(libs.koin.test.junit4)
}
```

Compiler Plugin은 어노테이션을 처리하며 Kotlin 2.3.20 이상이 필요합니다. `koin-annotations`는 Koin 버전과 동일한 버전을 사용합니다. 자세한 내용은 [Gradle 설정](/docs/setup/gradle) 및 [Compiler Plugin 설정](/docs/setup/compiler-plugin)을 참고하세요.

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

이 사용자들이 리포지토리에 저장될 데이터입니다.

## 리포지토리 작성하기 {id="let-s-write-the-repository"}

리포지토리는 메모리에 사용자를 유지합니다. 구현체에 `@Singleton` 어노테이션을 붙여 싱글톤으로 선언합니다:

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

Koin은 `UserRepositoryImpl`을 상위 타입에 바인딩하므로, `UserRepository`를 요청하면 이 인스턴스를 가져옵니다. `@Singleton`은 `org.koin.core.annotation` 패키지에서 제공되며 `@Single`과 동일합니다([정의(Definitions)](/docs/reference/koin-core/definitions) 참조).

## 서비스 작성하기 {id="let-s-write-the-service"}

`UserService`는 사용자를 불러오고 인사말을 준비합니다. 이 클래스 역시 `@Singleton`으로 선언합니다:

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

    override fun getUserOrNull(name: String): User? = userRepository.findUserOrNull(name)

    override fun loadUsers() {
        userRepository.addUsers(DEFAULT_USERS)
    }

    override fun prepareHelloMessage(user: User?): String {
        return user?.let { "Hello '${user.name}' (${user.email})!" } ?: "User not found"
    }
}
```

Compiler Plugin이 생성자를 분석하여 `UserRepository` 인스턴스를 알아서 전달해 줍니다.

## 애플리케이션 클래스 작성하기 {id="let-s-write-the-application-class"}

`UserApplication`은 생성자를 통해 `UserService`를 주입받아 사용자를 불러오고 인사말을 출력합니다:

```kotlin
@Singleton
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

이제 세 컴포넌트 모두에 어노테이션을 추가했습니다. 다음으로 이들을 모듈로 묶어보겠습니다.

## Koin 모듈 선언하기 {id="let-s-declare-the-koin-module"}

모듈은 정의들을 그룹화합니다([핵심 개념(Core Concepts)](/docs/intro/core-concepts) 참조). 샘플 패키지를 스캔하는 모듈 클래스를 선언합니다:

```kotlin
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.Configuration
import org.koin.core.annotation.Module

@Module
@ComponentScan("org.koin.sample")
@Configuration
class AppModule
```

`@ComponentScan`은 `org.koin.sample` 및 하위 패키지에 있는 어노테이션이 달린 모든 클래스를 등록합니다. `@Configuration`은 이 모듈을 `@KoinApplication` 진입점에서 감지할 수 있도록 만듭니다. 두 어노테이션에 대한 자세한 내용은 [모듈(Modules)](/docs/reference/koin-core/modules)을 참고하세요.

## Koin 시작하기 {id="let-s-start-koin"}

`@KoinApplication` 객체를 선언하고 타입 지정 함수인 `startKoin<T>()`로 Koin을 시작합니다:

```kotlin
import org.koin.core.annotation.KoinApplication
import org.koin.mp.KoinPlatform
import org.koin.plugin.module.dsl.startKoin

@KoinApplication
object KoinUserApplication

fun main() {
    startKoin<KoinUserApplication>()

    val userApplication = KoinPlatform.getKoin().get<UserApplication>()
    userApplication.sayHello("Alice")
}
```

`startKoin<KoinUserApplication>()`은 모든 `@Configuration` 모듈을 로드하므로 직접 `modules()`를 호출하지 않아도 됩니다. 플러그인이 빌드 타임에 전체 의존성 그래프를 검증하며, `./gradlew run`을 실행하면 `Hello 'Alice' (alice@example.com)!`이 출력됩니다. 다른 옵션에 대해서는 [Koin 시작하기(Starting Koin)](/docs/reference/koin-core/starting-koin) 문서를 참고하세요.

## 다음 단계 {id="next-steps"}

- [핵심 개념(Core Concepts)](/docs/intro/core-concepts): 모듈, 정의, 주입의 멘탈 모델
- [모듈(Modules)](/docs/reference/koin-core/modules): `@Module`, `@ComponentScan`, `@Configuration` 및 모듈 포함(include)
- [어노테이션 레퍼런스(Annotations Reference)](/docs/reference/koin-annotations/annotations-inventory): 모든 어노테이션과 파라미터 상세 정보
- [테스팅(Testing)](/docs/reference/koin-test/testing): Koin Test를 활용한 테스트 작성
- [도구(Tooling)](/docs/tooling): Koin용 IDE 플러그인 및 모니터링 도구