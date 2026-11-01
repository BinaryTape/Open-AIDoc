---
title: Ktor DI 브리지
---

# Ktor DI 브리지

Ktor 3.4부터 자체 의존성 주입(Dependency Injection) 플러그인(`dependencies { provide<T> { } }` 및 `by dependencies`)을 제공합니다. 이 페이지에서는 Koin 플러그인의 `bridge { }` 옵션을 사용하여 단방향 또는 양방향으로 Ktor DI와 Koin을 연결하는 방법을 설명합니다. 시작하기 전에 [Ktor용 Koin](/docs/reference/koin-ktor/ktor)에 설명된 대로 Koin 플러그인이 설치되어 있어야 합니다.

브리지 기능은 Koin 4.2부터 지원되며, 관련 함수들은 `@KoinExperimentalAPI`로 표시되어 있습니다.

## 브리지 구성하기 {id="configuring-the-bridge"}

```kotlin
fun Application.module() {
    install(Koin) {
        slf4jLogger()
        bridge {
            ktorToKoin()
            koinToKtor()
        }
        modules(appModule)
    }

    dependencies {
        provide<KtorSpecificService> { KtorSpecificServiceImpl() }
    }
}
```

| 옵션 | 동작 |
|--------|--------|
| `ktorToKoin()` | Ktor의 `by dependencies`를 통해 Koin 정의를 확인할 수 있습니다 |
| `koinToKtor()` | Koin의 `get()`, `inject()` 및 생성자 주입을 통해 Ktor DI 의존성을 확인할 수 있습니다 |

사용하려는 방향의 옵션만 활성화하세요.

## Ktor에서 Koin 의존성 확인하기 {id="ktor-resolving-from-koin"}

`ktorToKoin()`을 사용하면, 플러그인이 Koin을 백엔드로 사용하는 의존성 맵과 함께 Ktor의 `DI` 플러그인을 설치합니다.

```kotlin
fun Application.module() {
    install(Koin) {
        bridge { ktorToKoin() }
        modules(module {
            single<HelloService> { HelloServiceImpl() }
        })
    }

    routing {
        get("/hello") {
            val helloService: HelloService by dependencies // Koin에 선언됨
            call.respondText(helloService.sayHello())
        }
    }
}
```

이름이 지정된 Ktor 의존성 키는 동일한 값을 가진 Koin의 `named()` 한정자(qualifier)로 매핑됩니다.

## Koin에서 Ktor DI 의존성 확인하기 {id="koin-resolving-from-ktor-di"}

`koinToKtor()`를 사용하면 Koin에 의존성 확인 확장이 추가됩니다. 즉, 특정 타입에 대한 Koin 정의가 없으면 Koin이 Ktor DI에 해당 의존성을 요청합니다.

```kotlin
fun Application.module() {
    install(Koin) {
        bridge { koinToKtor() }
        modules(appModule)
    }

    dependencies {
        provide<DatabaseConnection> { DatabaseConnectionImpl() }
    }

    routing {
        get("/data") {
            val database: DatabaseConnection by inject() // Ktor DI에 선언됨
            call.respondText(database.query())
        }
    }
}
```

Koin 정의는 Ktor DI 타입을 생성자 파라미터로 받을 수도 있습니다. Koin 한정자는 의존성 이름으로 Ktor에 전달됩니다. Ktor DI에도 해당 의존성이 없으면 Koin이 경고 로그를 남기고, 정의 누락 시와 동일하게 의존성 확인이 실패합니다.

## 인프라스트럭처와 애플리케이션 코드 분리하기 {id="splitting-infrastructure-and-application-code"}

일반적인 분리 방식은 프레임워크 수준의 객체는 Ktor DI에 유지하고, 애플리케이션 클래스는 Koin에 유지하면서 `koinToKtor()`만 사용하는 것입니다.

```kotlin
fun Application.module() {
    // Ktor DI: 인프라스트럭처
    val database = Database(environment.config)
    dependencies {
        provide<Database> { database }
        provide<ApplicationConfig> { environment.config }
    }

    // Koin: 애플리케이션 클래스
    install(Koin) {
        slf4jLogger()
        bridge { koinToKtor() }
        modules(appModule)
    }
}

val appModule = module {
    singleOf(::CustomerRepository) // Ktor DI로부터 Database를 전달받음
    singleOf(::CustomerService)
}
```

## 제한 사항 {id="limits"}

- **컴파일 타임 검사**: Koin 컴파일러 플러그인은 Ktor DI 선언을 인식하지 못합니다. 컴파일 타임 안전성 검사에서 Ktor DI 타입을 누락된 것으로 보고하는 경우, [컴파일 타임 안전성](/docs/reference/koin-compiler/compile-safety)에 설명된 대로 해당 타입을 `@Provided`로 표시하세요.
- **KoinIsolated**: Koin 4.2에서 `KoinIsolated` 플러그인은 `bridge { }` 블록을 허용하지만 실제로 적용하지는 않습니다. 브리지가 필요한 경우에는 `install(Koin)`을 사용하세요.
- **실험적 기능(Experimental)**: 브리지 API는 향후 릴리스에서 변경될 수 있습니다.

## 관련 문서 {id="related"}

- [Ktor용 Koin](/docs/reference/koin-ktor/ktor): 플러그인 설치 및 라우트에서의 주입.
- [Ktor의 격리된 컨텍스트](/docs/reference/koin-ktor/ktor-isolated): 글로벌 컨텍스트 외부에서의 Koin 사용.
- [요청 스코프](/docs/reference/koin-ktor/ktor-scopes): 호출별(per-call) 인스턴스.
- [Ktor 의존성 주입](https://ktor.io/docs/server-dependency-injection.html): Ktor 자체 DI 플러그인.