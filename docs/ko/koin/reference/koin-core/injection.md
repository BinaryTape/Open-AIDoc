---
title: 주입
---

# 주입

대부분의 클래스는 생성자를 통해 의존성을 전달받으며, Koin이 이를 채워줍니다([생성자 파라미터](/docs/reference/koin-core/definitions#constructor-parameters) 참고). 하지만 안드로이드 `Activity`, `main()` 함수, 프레임워크가 직접 생성하는 클래스 같은 일부 코드는 그렇게 할 수 없습니다. 이 페이지에서는 이러한 코드에서 Koin으로부터 인스턴스를 가져오는 함수들인 `get()`, `inject()`, 이들의 널 허용(nullable) 변형, 그리고 `getAll()`에 대해 다룹니다.

## 생성자 주입 우선 {id="constructor-injection-first"}

이 페이지에서 다루는 함수들은 Koin이 직접 클래스를 생성할 수 없는 경우에만 사용하세요.

```kotlin
// Koin이 이 클래스를 생성합니다. 의존성은 생성자를 통해 주입됩니다.
class UserService(
    private val repository: UserRepository,
    private val validator: UserValidator,
)

// Android가 이 클래스를 생성합니다. inject()를 사용하여 의존성을 가져옵니다.
class UserActivity : AppCompatActivity() {
    private val userService: UserService by inject()
}
```

생성자 파라미터가 있는 클래스는 Koin 컨테이너 없이도 테스트 대역(fake)을 전달하여 테스트할 수 있습니다. 반면 `get()`을 호출하는 클래스는 테스트 시 실행 중인 컨테이너가 필요합니다. 기본 파라미터 값에서 `get()`을 호출하지 마세요(`class UserService(val repository: UserRepository = get())`). 대신 모듈에 클래스를 선언하세요.

## 지연(Lazy) 및 즉시(Eager) 조회 {id="lazy-and-eager-retrieval"}

조회 코드는 스타일에 관계없이 동일합니다.

```kotlin
class UserActivity : AppCompatActivity() {

    // 지연(lazy): 프로퍼티에 처음 접근할 때 의존성이 해결(resolve)됩니다.
    private val userService: UserService by inject()

    // 즉시(eager): 프로퍼티가 초기화되는 시점에 즉시 해결됩니다.
    private val analytics: Analytics = get()
}
```

| 함수 | 반환값 | 해결 시점 |
|------|--------|-----------|
| `by inject<T>()` | 프로퍼티 위임(property delegate)으로 사용되는 `Lazy<T>` | 최초 접근 시 |
| `get<T>()` | `T` | 즉시 |

프로퍼티에는 `by inject()`를 사용하세요. Koin이 모든 준비를 마치기 전에 클래스가 생성될 수 있으며(`Activity` 필드는 `onCreate()` 이전에 초기화됨), 사용되지 않는 인스턴스는 절대 생성되지 않습니다. 함수 본문 내부처럼 값이 즉시 필요한 경우에는 `get()`을 사용하세요.

`inject()`는 Kotlin의 `LazyThreadSafetyMode`인 `mode` 파라미터를 받습니다. JVM에서의 기본값은 `SYNCHRONIZED`입니다.

## get()과 inject()를 사용할 수 있는 위치 {id="where-get-and-inject-are-available"}

다음 위치에서 `get()` 및 `by inject()`를 호출할 수 있습니다.

- Android 클래스: 별도의 인터페이스 없이 `Activity`, `Fragment`, `Service` 및 기타 `ComponentCallbacks`에서 사용할 수 있습니다. [Android 진입점](/docs/reference/koin-android/entry-points)을 참고하세요.
- `KoinComponent`를 구현하는 모든 클래스. [KoinComponent](/docs/reference/koin-core/koin-component)를 참고하세요.
- `Koin` 인스턴스: `KoinPlatform.getKoin().get<UserService>()`는 전역 컨테이너를 사용하고, `koinApp.koin.get<UserService>()`는 격리된 컨테이너를 사용합니다.
- 정의(Definition) 내부(Classic DSL): `get()`, `inject()`, `getOrNull()`, `injectOrNull()`, `getAll()`은 현재 스코프에서 의존성을 해결합니다.

플랫폼 API도 고유한 이름을 통해 동일한 규칙을 따릅니다.

- Compose: `koinInject()` 및 `koinViewModel()`. [Koin for Compose](/docs/reference/koin-compose/compose)를 참고하세요.
- Android ViewModel: `by viewModel()` 및 `by activityViewModel()`. [Android ViewModel](/docs/reference/koin-android/viewmodel)을 참고하세요.
- Ktor: `Application`, `Route`, `ApplicationCall` 내의 `by inject()`. [Koin for Ktor](/docs/reference/koin-ktor/ktor)를 참고하세요.

## 선택적 의존성 {id="optional-dependencies"}

정의가 누락될 가능성이 있는 경우, 널 허용 변형을 사용하세요. 이 함수들은 `NoDefinitionFoundException`을 던지는 대신 `null`을 반환합니다.

```kotlin
val koin = KoinPlatform.getKoin()

val tracker: Tracker? = koin.getOrNull()
val crashReporter: CrashReporter? by koin.injectOrNull()
```

`getOrNull()`과 `injectOrNull()`은 `Koin`, `Scope`, 그리고 정의 내부에서 제공됩니다. `KoinComponent` 인터페이스는 `get()`과 `inject()`만 제공하므로, 해당 위치에서는 `getKoin().getOrNull<T>()`를 호출하세요.

생성자 파라미터의 경우 널 허용 타입(`tracker: Tracker?`)으로 선언하면 정의가 없을 때 Koin이 `null`을 전달합니다. [생성자 파라미터](/docs/reference/koin-core/definitions#constructor-parameters)를 참고하세요.

라이브러리 등에서 Koin 자체가 시작되지 않았을 가능성이 있는 경우, `KoinPlatform.getKoinOrNull()`은 예외를 던지는 대신 `null`을 반환합니다.

## 특정 타입의 모든 인스턴스 {id="all-instances-of-a-type"}

`getAll<T>()`는 모든 정의에 걸쳐 `T` 타입에 바인딩된 모든 인스턴스를 반환합니다.

```kotlin
val koin = KoinPlatform.getKoin()

val interceptors: List<Interceptor> = koin.getAll()
```

반환되는 리스트에는 한정자(qualifier) 유무와 관계없이 메인 타입 또는 바인딩된 타입이 `T`인 각 정의가 포함됩니다. 일치하는 정의가 없으면 빈 리스트가 됩니다. 생성자 파라미터에서도 `List<Interceptor>` 파라미터가 동일하게 동작합니다. 컬렉션 패턴은 [고급 패턴](/docs/reference/koin-core/advanced-patterns)에서 다룹니다.

## 호출부의 한정자와 파라미터 {id="qualifiers-and-parameters-at-the-call-site"}

모든 조회 함수는 한정자와 파라미터 블록을 전달받을 수 있습니다.

```kotlin
val localDb: Database by inject(named("local"))

val presenter: UserPresenter = get { parametersOf(userId) }

val detail: DetailPresenter = get(named("compact")) { parametersOf(itemId) }
```

- 한정자(Qualifier): 동일한 타입의 여러 정의 중 하나를 선택합니다. [한정자](/docs/reference/koin-core/qualifiers)를 참고하세요.
- 파라미터(Parameters): 호출자만 알고 있는 값으로, 정의에 전달됩니다. [주입 파라미터](/docs/reference/koin-core/injection-parameters)를 참고하세요.

`by inject()`를 사용할 경우 파라미터 블록은 프로퍼티에 처음 접근할 때 실행되므로, 객체 생성 후에 설정된 프로퍼티도 읽을 수 있습니다.

## 의존성 해결에 실패하는 경우 {id="when-resolution-fails"}

해당 타입 및 한정자와 일치하는 정의가 없으면 `get()`은 `NoDefinitionFoundException`을 발생시킵니다. `by inject()`의 경우, 프로퍼티가 선언된 시점이 아니라 해당 프로퍼티에 처음 접근할 때 예외가 발생합니다. Compiler Plugin을 사용하면 빌드 시점에 시작 호출(start call)의 그래프를 기준으로 `get()` 및 `inject()` 호출을 검증할 수도 있습니다.

자주 발생하는 오류와 Koin 메시지를 읽는 방법은 [문제 해결](/docs/reference/koin-core/troubleshooting)을 참고하세요.

## 관련 문서 {id="related"}

- [정의](/docs/reference/koin-core/definitions): 생성자 주입 및 파라미터가 해결되는 방식.
- [KoinComponent](/docs/reference/koin-core/koin-component): 모든 클래스에 `get()` 및 `inject()`에 대한 접근 권한 부여.
- [Android 진입점](/docs/reference/koin-android/entry-points): Activity, Fragment, Service, Receiver, View에서의 주입.
- [Koin for Compose](/docs/reference/koin-compose/compose): `koinInject()` 및 기타 Compose API.
- [스코프](/docs/reference/koin-core/scopes): 루트 컨테이너 대신 특정 스코프에서 인스턴스 가져오기.