---
title: 스코프 (Scopes)
---

# 스코프 (Scopes)

스코프는 `factory`보다는 오래 유지되고 `single`보다는 짧게 유지되는 인스턴스를 위한 컨테이너입니다. 이 문서에서는 스코프 및 scoped 정의 선언, 스코프 인스턴스 생성 및 종료, 스코프 연결(linking), 스코프 아키타입(scope archetype)에 대해 다룹니다. [definitions](/docs/reference/koin-core/definitions)에 대해 이미 알고 있다고 가정합니다.

이 문서를 바탕으로 다양한 플랫폼 API가 구축되어 있습니다: [Android Scopes](/docs/reference/koin-android/scope) (`ScopeActivity`, `AndroidScopeComponent`, `activityScope()`), [Scopes in Compose](/docs/reference/koin-compose/compose-scopes) 및 [Ktor Request Scopes](/docs/reference/koin-ktor/ktor-scopes).

## 스코프의 동작 원리 {id="how-scopes-work"}

스코프는 두 가지 부분으로 구성됩니다:

- **스코프 선언(Scope declaration)**: 한정자(qualifier, 타입 또는 이름)로 식별되는 모듈 내의 섹션입니다. 스코프에 속하는 정의들을 나열합니다.
- **스코프 인스턴스(Scope instance)**: 선언을 바탕으로 런타임에 고유한 스코프 ID를 가지고 생성됩니다. 각 스코프 인스턴스는 닫을 때까지 모든 `scoped` 정의의 자체 복사본을 유지합니다.

| 정의 | 인스턴스 |
|------------|----------|
| `single` | 전체 컨테이너에 대해 하나 |
| `factory` | 매 요청마다 새로 생성 |
| `scoped` | 스코프 인스턴스당 하나, 스코프 인스턴스가 닫힐 때 해제됨 |

여러 객체가 제한된 시간(로그인 세션, 결제 흐름, 화면 등) 동안 동일한 인스턴스를 공유해야 하고, 그 이후에는 해당 인스턴스를 해제해야 할 때 스코프를 사용하세요.

## 스코프 선언하기 {id="declaring-a-scope"}

**Compiler Plugin DSL**
```kotlin
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

val sessionModule = module {
    // scope identified by a type
    scope<UserSession> {
        scoped<SessionData>()
        scoped<CartRepository>()
        factory<CheckoutPresenter>()
    }

    // scope identified by a name
    scope(named("checkout")) {
        scoped<CheckoutNavigator>()
    }
}
```

**Annotations**
어떤 스코프에 속하는지 지정하기 위해 클래스에 `@Scope`를 추가하고, scoped 정의로 선언하기 위해 `@Scoped`를 추가합니다. 두 애너테이션 모두 필요합니다:

```kotlin
@Scope(UserSession::class)
@Scoped
class SessionData

@Scope(UserSession::class)
@Scoped
class CartRepository(private val sessionData: SessionData)

// scope identified by a name
@Scope(name = "checkout")
@Scoped
class CheckoutNavigator
```

`@Scope(UserSession::class)`는 `scope<UserSession> { }`와 동일하며, `@Scope(name = "checkout")`는 `scope(named("checkout")) { }`와 동일합니다. 두 애너테이션 모두 `@Module` 클래스의 함수에서도 작동합니다.

**Constructor / Classic DSL**
```kotlin
import org.koin.dsl.module
import org.koin.core.module.dsl.*

val sessionModule = module {
    scope<UserSession> {
        scopedOf(::SessionData)
        scopedOf(::CartRepository)
        factoryOf(::CheckoutPresenter)
    }

    scope(named("checkout")) {
        scoped { CheckoutNavigator() }
    }
}
```

스코프 섹션 내부의 `factory`는 매 요청마다 새 인스턴스를 생성하지만, 해당 스코프의 scoped 인스턴스에 의존할 수 있습니다.

스코프가 특정 클래스(`UserSession`, `MainActivity` 등)에 묶여 있을 때는 스코프 한정자로 타입을 사용하세요. 적합한 클래스가 없을 때는 이름을 사용하세요. `scope(named<MyQualifier>())`는 타입 한정자를 받습니다.

## 스코프 생성 및 종료하기 {id="creating-and-closing-a-scope"}

ID와 스코프 한정자를 사용하여 `Koin` 인스턴스로부터 스코프 인스턴스를 생성합니다. 이는 일반적으로 생명주기가 시작되고 끝나는 진입점(로그인 및 로그아웃 화면, 요청 핸들러 등)에서 발생합니다:

```kotlin
val koin = KoinPlatform.getKoin()

// on login
val scope = koin.createScope<UserSession>(userId)
val cart: CartRepository = scope.get()

// on logout
koin.getScopeOrNull(userId)?.close()
```

scoped 클래스 자체(`CartRepository`, `SessionData`)는 다른 정의와 마찬가지로 생성자 주입(constructor injection)을 사용합니다.

| 함수 | 동작 |
|----------|----------|
| `createScope<T>(scopeId)` | 타입 한정자 `T`에 대한 스코프 인스턴스를 생성합니다 |
| `createScope(scopeId, qualifier)` | 임의의 한정자(예: `named("checkout")`)에 대한 스코프 인스턴스를 생성합니다 |
| `getOrCreateScope(scopeId, qualifier)` | 해당 ID를 가진 열려 있는 스코프를 반환하거나, 없으면 새로 생성합니다 |
| `getScope(scopeId)` | 열려 있는 스코프를 반환합니다. 없는 경우 `ScopeNotCreatedException`("No scope found for id '...'")을 던집니다 |
| `getScopeOrNull(scopeId)` | 열려 있는 스코프를 반환하거나, `null`을 반환합니다 |
| `deleteScope(scopeId)` | 레지스트리에서 스코프 인스턴스를 제거합니다 |

스코프 ID는 열려 있는 스코프들 사이에서 고유해야 합니다. 동일한 선언의 두 스코프 인스턴스는 서로 다른 인스턴스를 보유합니다:

```kotlin
val first = getKoin().createScope<UserSession>("user_1")
val second = getKoin().createScope<UserSession>("user_2")

first.get<SessionData>() !== second.get<SessionData>() // true
```

`scope.close()`를 호출하면 다음과 같은 작업이 수행됩니다:

1. Koin이 각 scoped 인스턴스의 `onClose` 콜백을 호출한 다음 인스턴스를 해제합니다.
2. 스코프가 레지스트리에서 제거됩니다.
3. 이후 해당 스코프에서 호출되는 모든 `get()`은 `ClosedScopeException`("Scope '...' is closed")을 던집니다. 확실하지 않다면 `scope.closed`를 확인하세요.

```kotlin
val sessionModule = module {
    scope<UserSession> {
        scoped<SessionData>() onClose { it?.clear() }
    }
}
```

스코프 자체가 닫힐 때 코드를 실행하려면 `scope.registerCallback()`을 사용하여 `ScopeCallback`을 등록하세요.

:::warning
직접 수동으로 생성한 스코프는 닫을 때까지 열린 상태로 유지됩니다. 스코프가 보유한 모든 인스턴스는 메모리에 남아 있게 됩니다. 생명주기가 끝날 때(로그아웃, 흐름 종료 등) 스코프를 닫아주어야 합니다. Android에서는 `activityScope()` 및 `fragmentScope()`가 스코프를 자동으로 닫아줍니다. 자세한 내용은 [Android Scopes](/docs/reference/koin-android/scope)를 참고하세요.
:::

## 스코프 컴포넌트 {id="scope-components"}

스코프의 생명주기를 소유하는 클래스는 `KoinScopeComponent`를 구현할 수 있습니다. 그러면 해당 클래스의 `get()` 및 `inject()` 호출이 자체 스코프에서 의존성을 해결(resolve)합니다. 이는 스코프 소유자만을 위한 고급 패턴입니다. 스코프 내부의 정의들은 여전히 생성자를 통해 의존성을 전달받습니다.

```kotlin
class UserSession : KoinScopeComponent {
    override val scope: Scope by lazy { createScope(this) }

    // resolved from the UserSession scope
    val cart: CartRepository by inject()

    fun close() {
        scope.close()
    }
}
```

`createScope(this)`는 클래스 타입을 스코프 한정자로 사용하고, 클래스 이름과 해시코드로 구성된 ID를 사용하며, `this`를 스코프 소스(scope source)로 사용합니다. `newScope()`와 `getOrCreateScope()`는 동일한 목적을 위한 지연 대리자(lazy delegate)입니다: `override val scope by newScope()`.

## 스코프 내부에서의 의존성 해결 {id="resolution-inside-a-scope"}

스코프 인스턴스에서 Koin은 다음 순서로 정의를 찾습니다:

1. 해당 스코프(또는 해당 스코프의 아키타입, 아래 참조)의 정의.
2. 스코프 소스(scope source).
3. 연결된 스코프들(순서대로). 모든 `single` 및 `factory` 정의가 포함된 루트 스코프(root scope)는 항상 마지막에 연결됩니다.

따라서 scoped 클래스는 싱글톤 및 동일한 스코프의 다른 scoped 클래스에 의존할 수 있습니다:

**Compiler Plugin DSL**
```kotlin
class CartRepository(
    private val api: ApiService,        // single, from the root scope
    private val sessionData: SessionData // scoped, from the same scope
)

val sessionModule = module {
    single<ApiService>()
    scope<UserSession> {
        scoped<SessionData>()
        scoped<CartRepository>()
    }
}
```

**Annotations**
```kotlin
@Singleton
class ApiService

@Scope(UserSession::class)
@Scoped
class SessionData

@Scope(UserSession::class)
@Scoped
class CartRepository(
    private val api: ApiService,         // single, from the root scope
    private val sessionData: SessionData // scoped, from the same scope
)
```

**Constructor / Classic DSL**
```kotlin
val sessionModule = module {
    singleOf(::ApiService)
    scope<UserSession> {
        scopedOf(::SessionData)
        scopedOf(::CartRepository)
    }
}
```

그 반대는 동작하지 않습니다. `single`은 `scoped` 정의에 의존할 수 없으며, 루트 스코프에서 `get<SessionData>()`를 호출하면 `NoDefinitionFoundException`이 발생하며 실패합니다. scoped 인스턴스는 해당 스코프 인스턴스에서 의존성을 해결해야 합니다.

### 스코프 소스 (Scope source) {id="scope-source"}

스코프 소스는 스코프를 생성한 객체로, `createScope(scopeId, qualifier, source)`에서 `source`로 전달됩니다. scoped 정의는 다른 의존성과 마찬가지로 타입으로 스코프 소스를 요청할 수 있습니다:

```kotlin
class SessionLogger(private val session: UserSession)

val sessionModule = module {
    scope<UserSession> {
        scoped<SessionLogger>() // receives the UserSession that created the scope
    }
}
```

소스는 한정자가 없는(unqualified) 요청에 대해서만 해결되며, 스코프가 닫힐 때 해제됩니다.

### 스코프 주입하기 {id="injecting-the-scope"}

scoped 정의는 나중에 추가 인스턴스를 해결하거나 스코프를 닫기 위해 `Scope` 자체를 생성자 파라미터로 받을 수 있습니다.

### Koin 외부에서 생성된 인스턴스 {id="instances-created-outside-koin"}

`scope.declare(instance)`를 사용하면 모듈에 정의하지 않고도 이미 가지고 있는 객체를 단일 스코프 인스턴스에 추가할 수 있습니다:

```kotlin
val scope = getKoin().createScope<UserSession>(userId)
scope.declare(UserProfile(userId, name))
```

## 다른 스코프에서 해결하기 {id="resolving-from-another-scope"}

### 스코프 연결하기 (Linking scopes) {id="linking-scopes"}

`linkTo`는 의존성 해결 체인(resolution chain)에 다른 스코프를 추가합니다. 연결된 스코프는 현재 스코프 다음으로 검색됩니다:

```kotlin
val sessionScope = getKoin().createScope<UserSession>(userId)
val checkoutScope = getKoin().createScope("checkout_$userId", named("checkout"))

checkoutScope.linkTo(sessionScope)

// resolved from checkoutScope first, then sessionScope, then root
val cart: CartRepository = checkoutScope.get()
```

`unlink(scope)`는 연결을 제거합니다. 루트 스코프는 다른 어떤 스코프에도 연결할 수 없습니다.

### 스코프 ID 지정하기 {id="pointing-at-a-scope-id"}

애너테이션을 사용할 때 `@ScopeId`는 지정된 ID 또는 지정된 타입을 가진 스코프 인스턴스로부터 하나의 생성자 파라미터를 해결합니다:

```kotlin
@Factory
class OrderSummary(
    @ScopeId(name = "checkout_main") val navigator: CheckoutNavigator
)

@Factory
class CartBadge(
    @ScopeId(UserSession::class) val cart: CartRepository
)
```

`@ScopeId(name = "checkout_main")`은 DSL의 `getScope("checkout_main").get<CheckoutNavigator>()`와 동일합니다. 타입을 사용하는 경우 스코프 ID는 정규화된 클래스 이름(`"com.example.UserSession"`)이 됩니다. 정의가 해결될 때 이 ID를 가진 스코프 인스턴스가 반드시 존재해야 하며, 그렇지 않으면 `getScope()`가 `ScopeNotCreatedException`을 던집니다.

## 스코프 아키타입 (Scope archetypes) {id="scope-archetypes"}

타입으로 선언된 스코프(`scope<MainActivity>`)는 해당 타입에만 적용됩니다. **스코프 아키타입(scope archetype)**은 특정 종류의 모든 컴포넌트(모든 ViewModel, 모든 Activity, 모든 Fragment)가 공유하는 일반화된 스코프 선언입니다. 정의를 한 번만 선언해 두면 각 컴포넌트가 자체 스코프 인스턴스를 갖게 됩니다.

**Compiler Plugin DSL**
```kotlin
val appModule = module {
    viewModelScope {
        scoped<UserCache>()
        viewModel<UserViewModel>()
    }

    // Android only, koin-android
    activityScope {
        scoped<ActivityPresenter>()
    }
    fragmentScope {
        scoped<FragmentPresenter>()
    }
}
```

**Annotations**
아키타입 애너테이션은 `@Scope`와 `@Scoped`를 대체합니다:

```kotlin
import org.koin.core.annotation.ViewModelScope
import org.koin.android.annotation.ActivityScope
import org.koin.android.annotation.FragmentScope

@ViewModelScope
class UserCache(private val api: ApiService)

@ActivityScope
class ActivityPresenter

@FragmentScope
class FragmentPresenter
```

아키타입 애너테이션은 `@Module` 클래스의 함수에서도 작동합니다.

**Constructor / Classic DSL**
```kotlin
val appModule = module {
    viewModelScope {
        scopedOf(::UserCache)
        viewModelOf(::UserViewModel)
    }

    // Android only, koin-android
    activityScope {
        scopedOf(::ActivityPresenter)
    }
    fragmentScope {
        scopedOf(::FragmentPresenter)
    }
}
```

| 아키타입 | DSL | 애너테이션 | 닫히는 시점 | 플랫폼 |
|-----------|-----|------------|-------------|----------|
| ViewModel | `viewModelScope { }` | `@ViewModelScope` | ViewModel이 클리어될 때 (cleared) | 전체 (`koin-core-viewmodel`) |
| Activity | `activityScope { }` | `@ActivityScope` | Activity가 소멸될 때 (destroyed) | Android |
| Activity retained | `activityRetainedScope { }` | `@ActivityRetainedScope` | Activity가 종료될 때 (finishes, 구성 변경 시 유지됨) | Android |
| Fragment | `fragmentScope { }` | `@FragmentScope` | Fragment가 소멸될 때 (destroyed) | Android |

아키타입은 정의만을 선언합니다. 컴포넌트는 런타임에 자체 스코프 인스턴스를 엽니다. Android의 경우 [Android Scopes](/docs/reference/koin-android/scope)에 설명된 `activityScope()` 및 `fragmentScope()` 대리자를 사용합니다.

ViewModel 아키타입은 Koin이 각 ViewModel에 대한 스코프를 생성할 수 있도록 시작 시 `viewModelScopeFactory()` 옵션이 필요합니다. 이는 `@KoinViewModelScopeApi` 및 `@KoinExperimentalAPI`로 표시되어 있습니다:

```kotlin
startKoin {
    options(viewModelScopeFactory())
    modules(appModule)
}
```

생성자에서 scoped 의존성을 받는 ViewModel은 `viewModelScope { }` 내부에 선언해야 합니다. ViewModel에 대한 자세한 내용은 [ViewModel](/docs/reference/koin-core/viewmodel)을 참고하세요.

:::tip
닫히지 않은 스코프는 보유한 인스턴스를 계속 메모리에 유지합니다. 실제 사용자 세션에서 열려 있는 스코프와 누수된 인스턴스를 확인하려면 [Production Monitoring](/docs/tooling/production-monitoring)을 참고하세요.
:::

## 제한 사항 {id="limits"}

- **수동 생명주기 관리**: 아키타입 및 플랫폼 헬퍼 외부에서는 스코프를 직접 생성하고 닫아야 합니다. Koin은 누락된 `close()`를 감지하지 못합니다.
- **루트에서의 접근 불가**: `single` 정의 및 루트 스코프는 `scoped` 정의를 참조할 수 없습니다.
- **종료 후 재사용 불가**: 한 번 닫힌 스코프 인스턴스는 다시 열 수 없습니다. 새로운 ID로 새 인스턴스를 생성해야 합니다.
- **고유 ID**: 이미 열려 있는 스코프의 ID로 스코프를 생성하면 실패합니다. 스코프가 이미 존재할 수 있는 경우에는 `getOrCreateScope`를 사용하세요.

## 관련 문서 {id="related"}

- [Android Scopes](/docs/reference/koin-android/scope): `ScopeActivity`, `AndroidScopeComponent`, `activityScope()` 및 `fragmentScope()`.
- [Scopes in Compose](/docs/reference/koin-compose/compose-scopes): `KoinScope`, `rememberKoinScope` 및 내비게이션 스코프.
- [Ktor Request Scopes](/docs/reference/koin-ktor/ktor-scopes): HTTP 요청당 하나의 스코프.
- [ViewModel](/docs/reference/koin-core/viewmodel): ViewModel 선언 및 ViewModel 스코프.
- [Definitions](/docs/reference/koin-core/definitions): `single`, `factory`, `scoped` 및 `onClose`.
- [DSL Reference](/docs/reference/koin-core/dsl): 모든 스코프 DSL 키워드.