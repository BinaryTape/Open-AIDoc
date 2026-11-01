---
title: Ktor 테스팅
---

# Ktor 테스팅

이 페이지에서는 Koin을 사용하는 Ktor 서버 테스팅을 다룹니다: `testApplication`으로 라우트 실행하기, 정의(definition)를 테스트 모듈로 교체하기, 그리고 테스트 간 격리하기 등입니다. [Ktor에 Koin 설치하기](/docs/reference/koin-ktor/ktor) 방법을 이미 알고 있다고 가정합니다. HTTP 계층이 없는 일반 클래스의 테스트는 [단위 테스팅(Unit Testing)](/docs/reference/koin-test/testing) 기법을 사용하세요.

## 의존성 설정 {id="dependencies"}

```kotlin
dependencies {
    testImplementation("io.ktor:ktor-server-test-host")
    testImplementation("io.insert-koin:koin-test")
    testImplementation("io.insert-koin:koin-test-junit4") // 또는 koin-test-junit5
}
```

## testApplication으로 라우트 실행 {id="run-routes-with-testapplication"}

`install(Koin)`은 프로덕션 환경과 마찬가지로 `testApplication` 내부에서도 동작합니다. 테스트 모듈과 함께 설치한 후 라우트를 추가하세요:

**Compiler Plugin DSL**
```kotlin
class UserRoutesTest {

    @Test
    fun `returns a user`() = testApplication {
        application {
            install(Koin) {
                modules(appModule, testModule)
            }
            configureRouting()
        }

        val response = client.get("/users/1")
        assertEquals(HttpStatusCode.OK, response.status)
    }
}
```

**Annotations**
```kotlin
import org.koin.plugin.module.dsl.withConfiguration

class UserRoutesTest {

    @Test
    fun `returns a user`() = testApplication {
        application {
            install(Koin) {
                withConfiguration<MyApp>()
                modules(testModule)
            }
            configureRouting()
        }

        val response = client.get("/users/1")
        assertEquals(HttpStatusCode.OK, response.status)
    }
}
```

**Constructor / Classic DSL**
```kotlin
class UserRoutesTest {

    @Test
    fun `returns a user`() = testApplication {
        application {
            install(Koin) {
                modules(appModule, testModule)
            }
            configureRouting()
        }

        val response = client.get("/users/1")
        assertEquals(HttpStatusCode.OK, response.status)
    }
}
```

```kotlin
val testModule = module {
    single<UserRepository> { InMemoryUserRepository(User("1", "Alice")) }
}
```

테스트 모듈은 가장 마지막에 로드되므로, 해당 모듈의 `UserRepository`가 프로덕션의 것을 대체합니다([정의(Definitions)](/docs/reference/koin-core/definitions#overriding-a-definition) 참조). 이와 같은 람다 정의는 모든 스타일에서 작동합니다.

라우트는 프로덕션 환경과 마찬가지로 `org.koin.ktor.ext`의 `inject()` 및 `get()`을 통해 의존성을 해결(resolve)합니다. `testApplication`이 종료되면 Ktor가 애플리케이션을 중지하고 Koin 플러그인이 컨테이너를 닫습니다.

## 애플리케이션 모듈 재사용 {id="reuse-your-application-module"}

프로덕션의 `Application.module()`에서 Koin을 설치하는 경우, 테스트에서 이를 호출하고 `koinModules()`로 오버라이드를 추가하세요:

```kotlin
// 프로덕션
fun Application.module() {
    install(Koin) {
        modules(appModule)
    }
    configureRouting()
}

// 테스트
@Test
fun `returns a user`() = testApplication {
    application {
        module()
        koinModules(testModule)
    }

    assertEquals(HttpStatusCode.OK, client.get("/users/1").status)
}
```

`koinModules()`는 `install(Koin)`으로 생성된 컨테이너에 모듈을 로드합니다. Ktor 플러그인은 한 번만 설치할 수 있으므로 테스트에서 두 번째 `install(Koin)`을 호출하면 실패합니다.

`koinModules()`는 `install(Koin)` 이후에 오버라이드를 로드합니다. 설치 시점에 생성되는 정의(예: `createdAtStart` 사용)는 프로덕션 의존성을 유지합니다.

## 테스트 격리 {id="isolate-tests"}

`install(Koin)`은 전역 컨텍스트(global context)에서 Koin을 시작합니다. 컨테이너가 이미 실행 중인 경우 플러그인이 이를 먼저 중지합니다. 순차적으로 실행되는 테스트는 문제없지만, 동시에 실행되는 두 테스트는 전역 컨텍스트를 공유하여 서로에게 영향을 줄 수 있습니다.

애플리케이션이 종료되기 전에 테스트가 실패하더라도 각 테스트 후 Koin을 중지할 수 있도록 `AutoCloseKoinTest`를 상속하세요:

```kotlin
class UserRoutesTest : AutoCloseKoinTest() {
    // 테스트 코드
}
```

병렬 테스트의 경우 대신 `KoinIsolated`를 설치하세요. 각 애플리케이션은 전역 컨텍스트 외부에서 자체 컨테이너를 갖게 됩니다:

```kotlin
@Test
fun `returns a user`() = testApplication {
    application {
        install(KoinIsolated) {
            modules(appModule, testModule)
        }
        configureRouting()
    }

    assertEquals(HttpStatusCode.OK, client.get("/users/1").status)
}
```

`KoinIsolated`를 사용하면 Ktor 확장 함수(`inject()`, `get()`, `call.scope`)를 통해 의존성을 해결합니다. `KoinComponent`나 `GlobalContext.get()`은 격리된 컨테이너를 참조할 수 없습니다. [Ktor의 격리된 컨텍스트(Isolated Context in Ktor)](/docs/reference/koin-ktor/ktor-isolated)를 참조하세요.

## 의존성 모킹(Mocking) {id="mock-a-dependency"}

테스트 모듈에 목(mock)을 배치합니다:

```kotlin
@Test
fun `returns 404 for an unknown user`() = testApplication {
    val repository = mockk<UserRepository> {
        every { findById(any()) } returns null
    }

    application {
        install(Koin) {
            modules(appModule, module { single { repository } })
        }
        configureRouting()
    }

    assertEquals(HttpStatusCode.NotFound, client.get("/users/999").status)
    verify { repository.findById("999") }
}
```

`declareMock`([declareMock을 사용한 모킹](/docs/reference/koin-test/testing#mocking-with-declaremock) 참조) 역시 전역 컨텍스트를 사용하므로 `install(Koin)`과 함께 동작합니다. 단, `KoinIsolated`에서는 작동하지 않습니다.

## 요청 스코프(Request scope) {id="request-scope"}

`requestScope { }`에 선언된 정의는 각 호출마다 생성되며 응답이 전송될 때 닫힙니다([Ktor의 요청 스코프](/docs/reference/koin-ktor/ktor-scopes) 참조). 요청을 통해 이를 테스트하세요:

```kotlin
@Test
fun `each call gets its own request logger`() = testApplication {
    application {
        install(Koin) {
            modules(module {
                requestScope {
                    scoped { RequestLogger() }
                }
            })
        }
        routing {
            get("/id") {
                call.respondText(call.scope.get<RequestLogger>().id)
            }
        }
    }

    val first = client.get("/id").bodyAsText()
    val second = client.get("/id").bodyAsText()
    assertNotEquals(first, second)
}
```

`call.scope`는 호출이 처리되는 동안에만 존재합니다. 라우트 외부에서 요청 스코프 정의를 해결하려고 하면 실패합니다.

## Ktor DI 브리지 {id="ktor-di-bridge"}

[Ktor DI 브리지](/docs/reference/koin-ktor/ktor-bridge)가 활성화되어 있으면, 프로덕션 환경과 동일하게 테스트 애플리케이션에서 Ktor의 `dependencies { }`를 사용하여 테스트 값을 제공합니다. `koinToKtor()`를 통해 Koin 정의가 이를 해결할 수 있습니다:

```kotlin
@Test
fun `uses the Ktor-provided database`() = testApplication {
    application {
        dependencies {
            provide<Database> { InMemoryDatabase() }
        }
        install(Koin) {
            bridge { koinToKtor() }
            modules(appModule)
        }
        configureRouting()
    }

    assertEquals(HttpStatusCode.OK, client.get("/users").status)
}
```

## 구성(Configuration) 검증 {id="check-your-configuration"}

서버를 시작하지 않고 모든 정의의 의존성이 올바르게 선언되었는지 확인하려면 [구성 검증(Verifying your Configuration)](/docs/reference/koin-test/verify)을 참조하세요. 요청 스코프의 `ApplicationCall`과 같이 런타임에 Ktor가 제공하는 타입은 `extraTypes`에 지정합니다.

## 관련 문서 {id="related"}

- [Ktor용 Koin(Koin for Ktor)](/docs/reference/koin-ktor/ktor): 플러그인 설치 및 라우트에서의 주입.
- [Ktor의 격리된 컨텍스트(Isolated Context in Ktor)](/docs/reference/koin-ktor/ktor-isolated): `KoinIsolated` 및 사용 시점.
- [Ktor의 요청 스코프(Request Scopes in Ktor)](/docs/reference/koin-ktor/ktor-scopes): 호출에 바인딩된 정의.
- [단위 테스팅(Unit Testing)](/docs/reference/koin-test/testing): `KoinTest`, 오버라이드 및 `declareMock`.
- [구성 검증(Verifying your Configuration)](/docs/reference/koin-test/verify): 테스트에서 모듈 검증하기.