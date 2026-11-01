---
title: Ktor
---

# Ktor

이 튜토리얼에서는 목록에서 선택된 사용자에게 인사를 건네는 `/hello` 엔드포인트를 갖춘 Ktor 웹 앱을 빌드합니다. Koin 모듈을 선언하고, Koin을 Ktor 플러그인으로 설치하며, 애플리케이션에 서비스를 주입(inject)하는 방법을 배웁니다. 약 10분 정도 소요되며 JDK 17과 Gradle이 필요합니다.

이 튜토리얼은 Compiler Plugin DSL을 사용합니다. 어노테이션을 사용하는 동일한 앱에 대해서는 [Ktor & Annotations](/docs/quickstart/ktor-annotations)를 참조하세요. 스타일을 비교하려면 [Choosing your style](/docs/intro/choosing-your-style)을 참조하세요.

## 코드 가져오기 {id="get-the-code"}

전체 샘플 코드는 [koin-getting-started/ktor](https://github.com/InsertKoinIO/koin-getting-started/tree/main/ktor)에 있습니다. 저장소를 클론(clone)하고 `ktor` 폴더에서 실행하세요:

```bash
./gradlew run
```

## Gradle 설정 {id="gradle-setup"}

이 샘플은 Koin 컴파일러 플러그인을 적용하고 `koin-ktor` 및 `koin-logger-slf4j`를 추가합니다. 버전은 버전 카탈로그(version catalog)에서 관리됩니다:

```toml
# gradle/libs.versions.toml
[versions]
# Kotlin, Ktor 및 Logback 항목은 생략됨
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-ktor = { module = "io.insert-koin:koin-ktor", version.ref = "koin" }
koin-logger-slf4j = { module = "io.insert-koin:koin-logger-slf4j", version.ref = "koin" }
koin-test = { module = "io.insert-koin:koin-test", version.ref = "koin" }
koin-test-junit4 = { module = "io.insert-koin:koin-test-junit4", version.ref = "koin" }

[plugins]
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
    implementation(libs.ktor.server)
    implementation(libs.logback)
    implementation(libs.koin.ktor)
    implementation(libs.koin.logger.slf4j)

    testImplementation(libs.ktor.test)
    testImplementation(libs.koin.test)
    testImplementation(libs.koin.test.junit4)
}
```

Compiler Plugin은 Kotlin 2.3.20 이상이 필요합니다. 최신 버전과 BOM에 대한 정보는 [Gradle setup](/docs/setup/gradle)을 참조하세요. 플러그인 옵션은 [Compiler Plugin setup](/docs/setup/compiler-plugin)을 참조하세요.

## 애플리케이션 구조 {id="the-application"}

`/hello` 라우트는 `UserService`에 사용자를 요청하고, `UserService`는 `UserRepository`에서 사용자를 읽어옵니다:

```
User -> UserRepository -> UserService -> /hello route
```

## 사용자 데이터 작성하기 {id="let-s-write-the-user-data"}

데이터 클래스와 기본 사용자 목록 작성부터 시작합니다:

```kotlin
data class User(val name: String, val email: String)

val DEFAULT_USER = User("Alice", "alice@example.com")

val DEFAULT_USERS = listOf(
    DEFAULT_USER,
    User("Bob", "bob@example.com"),
    User("Charlie", "charlie@example.com")
)
```

이 사용자 데이터는 리포지토리에 저장되는 데이터입니다.

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

`UserRepositoryImpl`은 의존성이 없으므로, Koin이 추가 정보 없이 생성할 수 있습니다.

## 서비스 작성하기 {id="let-s-write-the-service"}

`UserService`는 사용자를 불러오고 인사말 메시지를 준비합니다:

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

`UserServiceImpl`은 `UserRepository`에 의존합니다. Koin은 이를 생성자를 통해 전달합니다.

## Koin 모듈 선언하기 {id="let-s-declare-the-koin-module"}

모듈은 Koin이 생성할 컴포넌트를 선언하는 곳입니다([Core Concepts](/docs/intro/core-concepts) 참조). 두 컴포넌트를 모두 싱글톤(singleton)으로 선언하고 해당 인터페이스에 바인딩합니다:

```kotlin
import org.koin.dsl.bind
import org.koin.dsl.module
import org.koin.plugin.module.dsl.single

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
}
```

이제 `UserService`를 요청하는 모든 컴포넌트는 동일한 `UserServiceImpl` 인스턴스를 받게 됩니다. `single`과 `bind`에 대한 설명은 [Definitions](/docs/reference/koin-core/definitions)를 참조하세요.

## Koin 설치 및 라우트 작성하기 {id="let-s-install-koin-and-write-the-route"}

Ktor 애플리케이션에 작성한 모듈과 함께 `Koin` 플러그인을 설치한 다음, `UserService`를 주입하여 `/hello` 라우트에서 사용합니다:

```kotlin
import org.koin.ktor.ext.inject
import org.koin.ktor.plugin.Koin

fun Application.main() {
    install(Koin) {
        modules(appModule)
    }

    val service by inject<UserService>()
    service.loadUsers()

    routing {
        get("/hello") {
            val userName = call.queryParameters["name"] ?: "Alice"
            val user = service.getUserOrNull(userName)
            val message = service.prepareHelloMessage(user)
            call.respondText(message)
        }
    }
}
```

`install(Koin)`은 Ktor 애플리케이션과 함께 Koin을 시작하며, `inject()`는 `Application`, `Route`, `ApplicationCall`에서 사용할 수 있습니다. Koin 로그를 SLF4J로 보내려면 `install(Koin)` 내부에 `slf4jLogger()`를 추가하세요. Ktor 전용 API에 대한 자세한 내용은 [Koin for Ktor](/docs/reference/koin-ktor/ktor)를 참조하세요.

## 서버 시작하기 {id="let-s-start-the-server"}

애플리케이션 모듈을 실행하는 임베디드 Netty 서버를 시작합니다:

```kotlin
fun main(args: Array<String>) {
    embeddedServer(Netty, port = 8080) {
        main()
    }.start(wait = true)
}
```

`./gradlew run`을 실행한 다음, 아래 URL을 엽니다:

- `http://localhost:8080/hello`: 기본 사용자인 Alice에게 인사합니다.
- `http://localhost:8080/hello?name=Bob`: Bob에게 인사합니다.

## 다음 단계 {id="next-steps"}

- [Core Concepts](/docs/intro/core-concepts): 모듈, 정의(definition), 주입의 배경이 되는 개념적 모델.
- [Koin for Ktor](/docs/reference/koin-ktor/ktor): 설치 옵션, 라우트 내 주입 및 Ktor 이벤트.
- [Request Scopes](/docs/reference/koin-ktor/ktor-scopes): 단일 HTTP 요청 동안 유지되는 인스턴스.
- [Ktor testing](/docs/reference/koin-ktor/ktor-testing): `testApplication` 및 Koin을 사용하여 라우트 테스트하기.
- [Tooling](/docs/tooling): Koin용 IDE 플러그인 및 모니터링 도구.