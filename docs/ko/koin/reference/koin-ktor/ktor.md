---
title: Ktor용 Koin
---

# Ktor용 Koin

이 페이지에서는 Ktor 서버 애플리케이션에 Koin을 추가하는 방법을 설명합니다. `Koin` 플러그인 설치, 라우트에서의 의존성 주입, 기능 함수(feature functions)에서 모듈 로드, 그리고 Koin 수명 주기(lifecycle) 이벤트 수신 방법을 다룹니다. 먼저 [정의(definitions)](/docs/reference/koin-core/definitions) 및 [모듈(modules)](/docs/reference/koin-core/modules)을 선언하는 방법을 숙지하는 것이 좋습니다. 단계별 프로젝트 튜토리얼은 [Ktor 튜토리얼](/docs/quickstart/ktor)을 참고하세요.

## 설정 {id="setup"}

```kotlin
// build.gradle.kts
dependencies {
    implementation(platform(libs.koin.bom))
    implementation(libs.koin.ktor)
    implementation(libs.koin.logger.slf4j) // 선택 사항, SLF4J 로거
}
```

카탈로그 항목 및 버전은 [Gradle 설정](/docs/setup/gradle)에서 확인할 수 있습니다. `koin-ktor` 플러그인은 Ktor 3를 대상으로 합니다.

## Koin 플러그인 설치 {id="installing-the-koin-plugin"}

애플리케이션 모듈에 `Koin`을 설치합니다. 구성 블록은 `startKoin { }`과 동일합니다:

**Compiler Plugin DSL**
```kotlin
import org.koin.ktor.plugin.Koin
import org.koin.logger.slf4jLogger

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserService>()
}

fun Application.module() {
    install(Koin) {
        slf4jLogger()
        modules(appModule)
    }
}
```

**어노테이션**
```kotlin
import org.koin.ktor.plugin.Koin
import org.koin.logger.slf4jLogger
import org.koin.plugin.module.dsl.withConfiguration

@Module
@ComponentScan("com.example")
@Configuration
class AppModule

@KoinApplication
object KoinUserApplication

fun Application.module() {
    install(Koin) {
        slf4jLogger()
        withConfiguration<KoinUserApplication>()
    }
}
```

`withConfiguration<T>()`는 `@KoinApplication` 클래스에 의해 조합된 모듈을 로드합니다.

**생성자 / 클래식 DSL**
```kotlin
import org.koin.ktor.plugin.Koin
import org.koin.logger.slf4jLogger

val appModule = module {
    singleOf(::UserRepositoryImpl) bind UserRepository::class
    singleOf(::UserService)
}

fun Application.module() {
    install(Koin) {
        slf4jLogger()
        modules(appModule)
    }
}
```

플러그인이 수행하는 작업:

- **전역 시작**: `startKoin`과 마찬가지로 전역 컨텍스트에서 Koin을 시작합니다. 이미 전역 Koin 인스턴스가 실행 중인 경우(예: Ktor 자동 리로드 후), 플러그인이 이를 먼저 중지합니다. Koin을 전역 컨텍스트에 두지 않으려면 [`KoinIsolated`](/docs/reference/koin-ktor/ktor-isolated)를 사용하세요.
- **즉시 인스턴스화(Eager instances)**: `createdAtStart`로 표시된 정의는 플러그인 설치 시점에 생성됩니다.
- **요청 스코프(Request scope)**: 각 호출마다 Koin 스코프를 엽니다. 자세한 내용은 [요청 스코프](/docs/reference/koin-ktor/ktor-scopes)를 참고하세요.
- **종료**: Ktor에서 `ApplicationStopping`이 발생하면 플러그인이 Koin 인스턴스를 닫습니다.

구성 블록의 로깅, 프로퍼티 및 기타 옵션에 대한 설명은 [Koin 시작하기](/docs/reference/koin-core/starting-koin)를 참고하세요.

## 의존성 주입하기 {id="injecting-dependencies"}

`inject()`(지연 주입) 및 `get()`(즉시 주입)은 `Application`, `Route`, `Routing`, `ApplicationCall`에 제공되는 `org.koin.ktor.ext`의 확장 함수입니다:

```kotlin
import org.koin.ktor.ext.inject

fun Application.module() {
    install(Koin) { modules(appModule) }

    val userService by inject<UserService>()

    routing {
        get("/users") {
            call.respond(userService.getAllUsers())
        }
    }
}
```

라우트 확장 함수에서 사용:

```kotlin
fun Route.customerRoutes() {
    val customerService by inject<CustomerService>()

    get("/customers/{id}") {
        val id = call.parameters["id"] ?: return@get call.respond(HttpStatusCode.BadRequest)
        call.respond(customerService.getCustomer(id))
    }
}
```

핸들러 내부에서는 call로부터 의존성을 조회합니다:

```kotlin
get("/users/{id}") {
    val userService = call.get<UserService>()
    call.respond(userService.getUser(call.parameters["id"]!!))
}
```

네 가지 수신 객체(receiver) 모두 `Application`에 저장된 Koin 인스턴스(`Koin`을 사용한 전역 인스턴스 또는 `KoinIsolated`를 사용한 격리된 인스턴스)에서 의존성을 조회합니다. 코어 함수와 마찬가지로 `qualifier` 및 `parameters`를 전달받을 수 있습니다([의존성 주입](/docs/reference/koin-core/injection) 참고). `getProperty(key)` 및 `getProperty(key, defaultValue)` 또한 동일한 수신 객체에서 Koin 프로퍼티를 읽어옵니다.

## 기능 함수에서 모듈 로드하기 {id="loading-modules-from-feature-functions"}

플러그인이 설치되고 나면, 기능 함수(feature function)에서 자체 정의를 추가할 수 있습니다:

```kotlin
import org.koin.ktor.plugin.koinModule
import org.koin.ktor.plugin.koinModules

fun Application.customerFeature() {
    koinModule {
        singleOf(::CustomerRepository)
        singleOf(::CustomerService)
    }

    routing { customerRoutes() }
}

fun Application.orderFeature() {
    koinModules(orderDataModule, orderServiceModule)

    routing { orderRoutes() }
}

fun Application.module() {
    install(Koin) {
        slf4jLogger()
        modules(coreModule)
    }
    customerFeature()
    orderFeature()
}
```

`koinModule { }`은 인라인으로 모듈을 선언하며, `koinModules(...)`는 기존 `Module` 값들을 로드합니다. 두 함수 모두 `install(Koin)`이 먼저 호출되지 않았다면 "Koin plugin is not installed properly" 오류와 함께 실패합니다.

## 수명 주기 이벤트 {id="lifecycle-events"}

플러그인은 애플리케이션 모니터에서 세 가지 이벤트를 발생시킵니다:

| 이벤트 | 발생 시점 |
|-------|--------|
| `KoinApplicationStarted` | 플러그인이 설치되고 Koin이 시작될 때 |
| `KoinApplicationStopPreparing` | `ApplicationStopping` 발생 시, Koin이 닫히기 전 |
| `KoinApplicationStopped` | Koin이 닫힌 후 |

```kotlin
fun Application.module() {
    monitor.subscribe(KoinApplicationStarted) { koinApp ->
        log.info("Koin started")
    }
    monitor.subscribe(KoinApplicationStopped) {
        log.info("Koin stopped")
    }

    install(Koin) {
        slf4jLogger()
        modules(appModule)
    }
}
```

`KoinApplicationStarted`는 `install(Koin)` 중에 발생합니다. 플러그인을 설치하기 전에 구독해야 하며, 그렇지 않으면 핸들러가 실행되지 않습니다. 각 핸들러는 `KoinApplication`을 전달받습니다.

## Ktor 자체 DI {id="ktor-s-own-di"}

Ktor 3.4에는 내장 의존성 주입 플러그인이 포함되어 있습니다. Koin은 양방향으로 이 플러그인과 의존성을 공유할 수 있습니다. 자세한 내용은 [Ktor DI Bridge](/docs/reference/koin-ktor/ktor-bridge)를 참고하세요.

## 관련 문서 {id="related"}

- [요청 스코프(Request Scopes)](/docs/reference/koin-ktor/ktor-scopes): 단일 HTTP 호출 동안 유지되는 인스턴스.
- [Ktor DI Bridge](/docs/reference/koin-ktor/ktor-bridge): Koin과 Ktor DI 간의 상호 의존성 해결.
- [Ktor에서의 격리된 컨텍스트(Isolated Context in Ktor)](/docs/reference/koin-ktor/ktor-isolated): 전역 컨텍스트 없이 Koin 사용하기.
- [Ktor 테스팅](/docs/reference/koin-ktor/ktor-testing): Koin을 사용한 라우트 테스트.
- [Ktor 튜토리얼](/docs/quickstart/ktor) 및 [어노테이션 기반 Ktor 튜토리얼](/docs/quickstart/ktor-annotations): Koin을 사용하여 단계별로 Ktor 앱 구축하기.