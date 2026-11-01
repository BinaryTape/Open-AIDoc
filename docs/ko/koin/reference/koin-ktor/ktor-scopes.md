---
title: 요청 스코프 (Request Scopes)
---

# 요청 스코프 (Request Scopes)

이 페이지에서는 Koin Ktor 플러그인의 요청 스코프(request scope)를 다룹니다. 요청 스코프는 각 HTTP 호출마다 열리고 응답이 전송될 때 닫히는 Koin 스코프입니다. 요청 로거(request logger)나 현재 사용자와 같이 요청별 상태를 유지하는 객체에 사용합니다. 스코프가 일반적으로 어떻게 동작하는지는 [Scopes](/docs/reference/koin-core/scopes)에 설명되어 있습니다. [Koin for Ktor](/docs/reference/koin-ktor/ktor)에 설명된 대로 플러그인이 설치되어 있어야 합니다.

## 요청 스코프 정의 선언하기 {id="declaring-request-scoped-definitions"}

**Compiler Plugin DSL**
```kotlin
import org.koin.module.requestScope

val appModule = module {
    single<UserRepository>() // shared by all requests

    requestScope {
        scoped<RequestLogger>()
        scoped<UserSessionHandler>()
    }
}
```

**어노테이션(Annotations)**
```kotlin
import org.koin.ktor.plugin.RequestScope

@Scope(RequestScope::class)
class RequestLogger(private val call: ApplicationCall)

@Scope(RequestScope::class)
class UserSessionHandler(private val call: ApplicationCall)
```

`requestScope { }`는 `RequestScope` 타입으로 한정(qualified)된 스코프이므로, `@Scope(RequestScope::class)`도 동일한 스코프를 대상으로 지정합니다.

**Constructor / Classic DSL**
```kotlin
import org.koin.module.requestScope

val appModule = module {
    singleOf(::UserRepository) // shared by all requests

    requestScope {
        scopedOf(::RequestLogger)
        scopedOf(::UserSessionHandler)
    }
}
```

## 핸들러에서 해결하기 (Resolving in a handler) {id="resolving-in-a-handler"}

`call.scope`는 현재 호출의 요청 스코프입니다:

```kotlin
routing {
    get("/users/{id}") {
        val logger = call.scope.get<RequestLogger>()
        val userService = call.get<UserService>()

        logger.log("Fetching user")
        call.respond(userService.getUser(call.parameters["id"]!!))
    }
}
```

단일 호출 내에서는 모든 `call.scope.get<RequestLogger>()`가 동일한 인스턴스를 반환합니다. 다음 호출에서는 새로운 인스턴스를 가져옵니다. 요청 스코프는 루트 스코프로 폴백(fall back)되므로, 요청 스코프 정의는 싱글톤(singleton)에 의존할 수 있습니다.

예를 들어 `Koin`이나 `KoinIsolated`가 모두 설치되지 않아 호출에 스코프가 없는 경우, `call.scope`는 "Koin Request Scope is not ready" 예외를 던집니다.

## ApplicationCall 주입하기 {id="injecting-the-applicationcall"}

호출(call)은 해당 요청 스코프의 소스(source)이므로, 요청 스코프 클래스는 별도로 선언하지 않고도 생성자 파라미터로 `ApplicationCall`을 받을 수 있습니다:

```kotlin
class RequestLogger(private val call: ApplicationCall) {
    fun log(message: String) {
        println("[${call.request.httpMethod.value} ${call.request.path()}] $message")
    }
}

class UserSessionHandler(private val call: ApplicationCall) {
    fun userId(): String? = call.request.headers["X-User-ID"]
}
```

스코프 소스에 대한 설명은 [Scopes](/docs/reference/koin-core/scopes)에 나와 있습니다. `ApplicationCall`은 요청 스코프 내에서만 사용할 수 있으며, `single`에서는 받을 수 없습니다.

## 수명 주기 (Lifecycle) {id="lifecycle"}

| 단계 | 시점 |
|------|------|
| 스코프 생성됨 (Scope created) | 라우팅 이전, Ktor `CallSetup` |
| 스코프 ID (Scope id) | `request_` 뒤에 고유 카운터가 붙음 |
| 스코프 닫힘 (Scope closed) | 응답이 전송된 후, Ktor `ResponseSent` |

스코프가 닫히면 해당 스코프의 모든 인스턴스가 폐기됩니다. 정리 코드를 실행하려면 정의에 `onClose`를 추가하세요:

```kotlin
requestScope {
    scoped { RequestMetrics() } onClose { metrics ->
        metrics?.recordDuration()
    }
}
```

`onClose`는 인스턴스를 널 허용(nullable) 값으로 전달받습니다. `onCreate` 콜백은 제공되지 않으므로, 초기화 작업은 생성자 또는 정의 람다 내에서 실행하세요. 콜백에 관한 자세한 내용은 [Definitions](/docs/reference/koin-core/definitions)를 참조하세요.

## 주의사항 (Pitfalls) {id="pitfalls"}

- **싱글톤 내의 요청 객체**: 요청 스코프 클래스를 `single`에 주입하지 마세요. 싱글톤은 한 번만 생성되므로 첫 번째 요청의 인스턴스를 계속 유지하게 됩니다. 요청 스코프 객체는 핸들러의 `call.scope`에서 해결하거나 인자로 전달하세요.
- **백그라운드 작업**: 핸들러에서 시작되어 호출 수명보다 오래 지속되는 코루틴은 응답이 전송된 후에 `call.scope`를 사용해서는 안 됩니다. 그 시점에는 이미 스코프가 닫혀 있습니다.

## 관련 문서 {id="related"}

- [Scopes](/docs/reference/koin-core/scopes): 스코프 개념, 스코프 소스, 링킹(linking).
- [Koin for Ktor](/docs/reference/koin-ktor/ktor): 플러그인 설치 및 라우트에서의 주입.
- [Definitions](/docs/reference/koin-core/definitions): `onClose` 및 기타 정의 옵션.
- [Ktor Testing](/docs/reference/koin-ktor/ktor-testing): 요청 스코프를 사용하는 라우트 테스트.