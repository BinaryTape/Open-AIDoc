---
title: Ktor & 어노테이션
---

# Ktor & 어노테이션

이 튜토리얼에서는 목록에서 선택된 사용자에게 인사를 건네는 `/hello` 엔드포인트가 포함된 Ktor 웹 앱을 빌드합니다. 클래스에 어노테이션을 추가하고, 이를 모듈로 스캔한 다음, `@KoinApplication` 객체로부터 Koin Ktor 플러그인에 로드하는 방법을 배웁니다. 약 10분이 소요되며 JDK 17 및 Gradle이 필요합니다.

이 튜토리얼은 어노테이션을 사용합니다. Compiler Plugin DSL을 사용한 동일한 앱은 [Ktor](/docs/quickstart/ktor)를 참고하세요. 스타일을 비교하려면 [스타일 선택하기](/docs/intro/choosing-your-style)를 참고하세요.

## 코드 가져오기 {id="get-the-code"}

전체 샘플 코드는 [koin-getting-started/ktor-annotations](https://github.com/InsertKoinIO/koin-getting-started/tree/main/ktor-annotations)에서 확인할 수 있습니다. 리포지토리를 클론하고 `ktor-annotations` 폴더에서 `app` 모듈을 실행하세요.

## Gradle 설정 {id="gradle-setup"}

이 샘플은 Koin Compiler Plugin을 적용하고 `koin-ktor`, `koin-annotations`, `koin-logger-slf4j`를 추가합니다. 버전은 버전 카탈로그(version catalog)에서 관리됩니다.

```toml
# gradle/libs.versions.toml
[versions]
# Kotlin, Ktor and Logback entries omitted
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-ktor = { module = "io.insert-koin:koin-ktor", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }
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
    implementation(libs.koin.annotations)
    implementation(libs.koin.logger.slf4j)

    testImplementation(libs.ktor.test)
    testImplementation(libs.koin.test)
    testImplementation(libs.koin.test.junit4)
}
```

Compiler Plugin은 어노테이션을 처리하며 Kotlin 2.3.20 이상이 필요합니다. `koin-annotations`는 Koin 버전을 공유합니다. 자세한 내용은 [Gradle setup](/docs/setup/gradle) 및 [Compiler Plugin setup](/docs/setup/compiler-plugin)을 참고하세요.

## 애플리케이션 {id="the-application"}

`/hello` 라우트는 `UserService`에 사용자를 요청하고, `UserService`는 `UserRepository`로부터 읽어옵니다.

```
User -> UserRepository -> UserService -> /hello route
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

이 사용자들은 리포지토리가 저장할 데이터입니다.

## 리포지토리 작성하기 {id="let-s-write-the-repository"}

리포지토리는 사용자를 메모리에 유지합니다. 구현체에 `@Singleton` 어노테이션을 지정합니다.

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

Koin은 `UserRepositoryImpl`을 상위 타입에 바인딩하므로, `UserRepository`를 요청하면 이 인스턴스를 가져옵니다. `@Singleton`은 `org.koin.core.annotation`에서 제공되며 `@Single`과 동일합니다([Definitions](/docs/reference/koin-core/definitions) 참고).

## 서비스 작성하기 {id="let-s-write-the-service"}

`UserService`는 사용자를 로드하고 인사 메시지를 준비합니다. 이 역시 `@Singleton`입니다.

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

Compiler Plugin이 생성자를 읽고 `UserRepository` 인스턴스를 자동으로 전달합니다.

## Koin 모듈 선언하기 {id="let-s-declare-the-koin-module"}

모듈은 정의(definitions)들을 그룹화합니다([Core Concepts](/docs/intro/core-concepts) 참고). 샘플 패키지를 스캔하는 모듈 클래스를 선언합니다.

```kotlin
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.Configuration
import org.koin.core.annotation.Module

@Module
@ComponentScan("org.koin.sample")
@Configuration
class AppModule
```

`@ComponentScan`은 `org.koin.sample` 및 그 하위 패키지에 있는 모든 어노테이션 지정 클래스를 등록합니다. `@Configuration`은 모듈을 `@KoinApplication` 진입점(entry point)에서 검색할 수 있도록 해줍니다. 둘 다 [Modules](/docs/reference/koin-core/modules)에 설명되어 있습니다.

## Koin 설치 및 라우트 작성하기 {id="let-s-install-koin-and-write-the-route"}

`@KoinApplication` 객체를 선언합니다. `Koin` 플러그인을 설치하고 `withConfiguration<T>()`로 구성을 로드한 다음, `/hello` 라우트에서 `UserService`를 주입합니다.

```kotlin
import org.koin.core.annotation.KoinApplication
import org.koin.ktor.ext.inject
import org.koin.ktor.plugin.Koin
import org.koin.logger.slf4jLogger
import org.koin.plugin.module.dsl.withConfiguration

@KoinApplication
object KoinUserApplication

fun Application.main() {
    install(Koin) {
        slf4jLogger()
        withConfiguration<KoinUserApplication>()
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

`withConfiguration<KoinUserApplication>()`은 모든 `@Configuration` 모듈을 로드하므로 `modules()`를 호출할 필요가 없으며, 플러그인이 빌드 시점에 전체 그래프를 검증합니다. `slf4jLogger()`는 Koin 로그를 SLF4J로 전송합니다. Ktor 전용 API에 대한 자세한 내용은 [Koin for Ktor](/docs/reference/koin-ktor/ktor)를 참고하세요.

## 서버 시작하기 {id="let-s-start-the-server"}

애플리케이션 모듈을 실행하는 임베디드 Netty 서버를 시작합니다.

```kotlin
fun main(args: Array<String>) {
    embeddedServer(Netty, port = 8080) {
        main()
    }.start(wait = true)
}
```

앱을 실행한 후 다음 URL에 접속해 보세요.

- `http://localhost:8080/hello`: 기본 사용자인 Alice에게 인사를 건넵니다.
- `http://localhost:8080/hello?name=Bob`: Bob에게 인사를 건넵니다.

## 다음 단계 {id="next-steps"}

- [Core Concepts](/docs/intro/core-concepts): 모듈, 정의 및 주입의 기반이 되는 멘탈 모델.
- [Koin for Ktor](/docs/reference/koin-ktor/ktor): 설치 옵션, 라우트에서의 주입 및 Ktor 이벤트.
- [Annotations Reference](/docs/reference/koin-annotations/annotations-inventory): 모든 어노테이션과 파라미터.
- [Ktor testing](/docs/reference/koin-ktor/ktor-testing): `testApplication` 및 Koin을 사용하여 라우트 테스트하기.
- [Tooling](/docs/tooling): Koin을 위한 IDE 플러그인 및 모니터링 도구.