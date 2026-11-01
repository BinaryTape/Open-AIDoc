---
title: Ktor의 격리된 컨텍스트
---

# Ktor의 격리된 컨텍스트

이 페이지에서는 Koin을 글로벌 컨텍스트(Global Context)에 등록하지 않고 단일 Ktor 애플리케이션을 위해 시작하는 `KoinIsolated` 플러그인을 다룹니다. 이렇게 하면 각 애플리케이션이 고유한 컨테이너를 갖게 됩니다. 격리된 컨텍스트의 개념과 사용 시점에 대한 설명은 [Context Isolation](/docs/reference/koin-core/context-isolation)을 참고하세요. 일반적인 `Koin` 플러그인에 대한 설명은 [Koin for Ktor](/docs/reference/koin-ktor/ktor)에 나와 있습니다.

## KoinIsolated 설치 {id="installing-koinisolated"}

`Koin` 대신 `KoinIsolated`를 설치합니다. 설정 블록은 동일합니다:

**Compiler Plugin DSL**
```kotlin
import org.koin.ktor.plugin.KoinIsolated

fun Application.module() {
    install(KoinIsolated) {
        slf4jLogger()
        modules(appModule)
    }
}
```

**Annotations**
```kotlin
import org.koin.ktor.plugin.KoinIsolated
import org.koin.plugin.module.dsl.withConfiguration

fun Application.module() {
    install(KoinIsolated) {
        slf4jLogger()
        withConfiguration<KoinUserApplication>()
    }
}
```

**Constructor / Classic DSL**
```kotlin
import org.koin.ktor.plugin.KoinIsolated

fun Application.module() {
    install(KoinIsolated) {
        slf4jLogger()
        modules(appModule)
    }
}
```

## Koin과 비교하여 달라지는 점 {id="what-changes-compared-to-koin"}

| | `install(Koin)` | `install(KoinIsolated)` |
|---|---|---|
| 글로벌 컨텍스트에 등록 여부 | 예 | 아니요 |
| `Application`, `Route`, `Routing`, `ApplicationCall`에서의 `inject()` / `get()` | 예 | 예 (해당 애플리케이션의 인스턴스로부터) |
| 요청 스코프(Request scope) 및 `call.scope` | 예 | 예 |
| 수명 주기 이벤트(Lifecycle events), `ApplicationStopping` 시 종료 | 예 | 예 |
| Ktor DI로의 `bridge { }` | 예 | Koin 4.2에서는 적용되지 않음 |
| `KoinComponent` 클래스, `KoinPlatform.getKoin()` | 이 인스턴스를 참조함 | 이 인스턴스를 참조하지 못함 |

Ktor 확장 함수는 애플리케이션 어트리뷰트(attributes)에 저장된 Koin 인스턴스를 읽으므로 라우트(route)에서의 주입은 동일하게 작동합니다:

```kotlin
fun Application.module() {
    install(KoinIsolated) {
        modules(appModule)
    }

    val userService by inject<UserService>()
    val koin = getKoin() // 이 애플리케이션의 Koin 인스턴스

    routing {
        get("/users/{id}") {
            val logger = call.scope.get<RequestLogger>()
            call.respond(userService.getUser(call.parameters["id"]!!))
        }
    }
}
```

:::warning
Ktor 리시버 외부의 코드는 격리된 인스턴스에 접근할 수 없습니다. `KoinComponent`를 구현하는 클래스나 `KoinPlatform.getKoin()` 호출은 글로벌 컨텍스트를 사용하므로 "KoinApplication has not been started" 오류와 함께 실패합니다. 클래스의 의존성은 격리된 모듈에 선언하고 생성자 파라미터를 통해 전달하세요. 직접 의존성을 가져와야 하는 상호 운용(interop) 진입점의 경우, [Context Isolation](/docs/reference/koin-core/context-isolation)에 나온 대로 `getKoin()`을 오버라이드하세요.
:::

## 하나의 JVM 내 여러 서버 {id="several-servers-in-one-jvm"}

각 임베디드 서버는 고유한 컨테이너를 가집니다:

```kotlin
fun main() {
    val userServer = embeddedServer(Netty, port = 8080) {
        install(KoinIsolated) { modules(userServiceModule) }
        userRouting()
    }

    val orderServer = embeddedServer(Netty, port = 8081) {
        install(KoinIsolated) { modules(orderServiceModule) }
        orderRouting()
    }

    userServer.start(wait = false)
    orderServer.start(wait = true)
}
```

`install(Koin)`을 사용할 경우 플러그인이 시작되기 전에 실행 중인 글로벌 인스턴스를 중지하므로, 두 번째 서버가 첫 번째 서버의 글로벌 Koin을 중지하게 됩니다.

## 테스트 {id="tests"}

`KoinIsolated`를 설치하는 각 `testApplication`은 고유한 컨테이너를 가지므로, 테스트가 글로벌 컨텍스트를 통해 상태를 공유하지 않고 병렬로 실행될 수 있습니다. 테스트 설정 방법은 [Ktor Testing](/docs/reference/koin-ktor/ktor-testing)에서 다룹니다.

## 글로벌 컨텍스트를 유지해야 하는 경우 {id="when-to-keep-the-global-context"}

프로세스 내에서 하나의 Ktor 애플리케이션만 실행되고 해당 프로세스의 다른 진입점(예: `main()`에서 시작된 스케줄링 작업)이 동일한 컨테이너를 사용해야 하거나, Ktor DI 브리지가 필요한 경우에는 `install(Koin)`을 계속 사용하세요.

## 관련 문서 {id="related"}

- [Context Isolation](/docs/reference/koin-core/context-isolation): 격리된 컨텍스트 개념 및 커스텀 `KoinComponent`.
- [Koin for Ktor](/docs/reference/koin-ktor/ktor): `Koin` 플러그인 및 라우트에서의 주입.
- [Ktor Testing](/docs/reference/koin-ktor/ktor-testing): Koin을 사용한 Ktor 애플리케이션 테스트.
- [Ktor DI Bridge](/docs/reference/koin-ktor/ktor-bridge): Ktor DI와 의존성 공유.