---
title: Compose에서의 스코프
---

# Compose에서의 스코프

이 페이지에서는 UI 트리의 일부에 대해 Koin 스코프(scope)를 여는 Compose 함수인 `KoinScope`, `KoinNavigationScope`, `UnboundKoinScope`, 그리고 Android용 `KoinActivityScope`와 `KoinFragmentScope`를 다룹니다. 이러한 블록 내부에서는 `koinInject()` 및 `koinViewModel()`이 해당 스코프에서 의존성을 해결(resolve)합니다. 스코프의 동작 방식과 선언 방법은 [Scopes](/docs/reference/koin-core/scopes)에서 확인할 수 있습니다.

이 페이지에 있는 대부분의 함수에는 `@KoinExperimentalAPI`가 지정되어 있습니다. `@OptIn(KoinExperimentalAPI::class)`를 사용하여 활성화하세요.

## KoinScope {id="koinscope"}

`KoinScope`는 스코프를 가져오거나 생성하여 하위 컴포저블에 제공하고, 해당 컴포저블이 컴포지션(composition)을 벗어날 때 스코프를 닫습니다.

스코프 선언:

**Compiler Plugin DSL**
```kotlin
class FeatureScope

val featureModule = module {
    scope<FeatureScope> {
        scoped<FeatureCache>()
        scoped<FeatureRepository>()
    }
}
```

**Annotations**
```kotlin
class FeatureScope

@Scope(FeatureScope::class)
class FeatureCache

@Scope(FeatureScope::class)
class FeatureRepository(private val cache: FeatureCache)
```

**Constructor / Classic DSL**
```kotlin
class FeatureScope

val featureModule = module {
    scope<FeatureScope> {
        scopedOf(::FeatureCache)
        scopedOf(::FeatureRepository)
    }
}
```

Compose에서 스코프 열기:

```kotlin
import org.koin.compose.scope.KoinScope

@Composable
fun FeatureScreen() {
    KoinScope<FeatureScope>(scopeID = "feature") {
        FeatureContent()
    }
}

@Composable
fun FeatureContent() {
    val repository = koinInject<FeatureRepository>() // FeatureScope로부터 주입됨
}
```

`KoinScope`에는 세 가지 형태가 있습니다:

| 형태 | 스코프 |
|------|-------|
| `KoinScope<T>(scopeID) { }` | 해당 ID를 가지며 타입 `T`로 한정(qualify)된 스코프를 가져오거나 생성 |
| `KoinScope(scopeID, scopeQualifier) { }` | 해당 ID와 한정자(qualifier)를 가진 스코프를 가져오거나 생성 |
| `KoinScope(scopeDefinition = { createScope(...) }) { }` | `Koin` 인스턴스에서 실행되는 람다가 반환하는 스코프 |

스코프는 컴포저블이 잊혀지거나(컴포지션을 벗어남) 폐기(abandoned)될 때 닫힙니다. 루트 스코프는 닫히지 않습니다.

### 다중 화면 플로우 {id="multi-screen-flows"}

체크아웃과 같은 플로우의 화면 간에 스코프가 지정된 객체를 공유하려면 `NavHost` 상위에 `KoinScope`를 배치합니다:

```kotlin
@Composable
fun CheckoutFlow() {
    KoinScope<CheckoutFlowScope>(scopeID = "checkout") {
        NavHost(navController, startDestination = CartRoute) {
            composable<CartRoute> { CartScreen() }
            composable<PaymentRoute> { PaymentScreen() }
        }
    }
}

@Composable
fun PaymentScreen() {
    val state = koinInject<CheckoutState>() // CartScreen과 동일한 CheckoutState
}
```

이 스코프는 `CheckoutFlow`가 컴포지션을 벗어날 때 닫힙니다.

:::note
스코프 내에 선언된 `viewModel`은 여전히 현재 `ViewModelStoreOwner`에 저장됩니다. `NavHost` 내부에서는 각 대상(destination)마다 고유한 ViewModel 인스턴스를 갖게 됩니다. 화면 간에 상태를 공유하려면 `CheckoutState`와 같은 `scoped` 객체를 사용하거나, `sharedKoinViewModel()`을 사용하세요 ([ViewModel in Compose](/docs/reference/koin-compose/compose-viewmodel) 참조).
:::

## rememberKoinScope {id="rememberkoinscope"}

`rememberKoinScope(scope)`는 직접 생성한 스코프를 하위 요소에 제공하지 않고 컴포지션에 바인딩합니다. 이 스코프는 컴포저블이 컴포지션을 벗어날 때 닫힙니다:

```kotlin
@Composable
fun FeatureScreen() {
    val koin = getKoin()
    val scope = rememberKoinScope(remember { koin.createScope<FeatureScope>("feature") })
    val repository = koinInject<FeatureRepository>(scope = scope)
}
```

## KoinNavigationScope {id="koinnavigationscope"}

`KoinNavigationScope`는 Navigation Compose 대상(destination)마다 하나의 스코프를 엽니다. `io.insert-koin:koin-compose-viewmodel-navigation`에 포함되어 있습니다.

`navigationScope { }`를 사용하여 정의를 선언합니다. 이는 `NavBackStackEntry`로 한정된 스코프를 생성합니다:

```kotlin
import org.koin.module.dsl.navigationScope

val appModule = module {
    navigationScope {
        scoped<ScreenStateHolder>()
        viewModel<ScreenViewModel>()
    }
}
```

어노테이션이나 Constructor DSL을 사용하는 경우, DSL 모듈에서 동일한 `navigationScope { }` 블록을 사용합니다 (Constructor DSL의 경우 `scopedOf(::ScreenStateHolder)` 사용). 이 스코프를 위한 별도의 어노테이션은 제공되지 않습니다.

각 대상을 감싸줍니다:

```kotlin
NavHost(navController, startDestination = ListRoute) {
    composable<ListRoute> { entry ->
        KoinNavigationScope(entry) {
            ListScreen() // 자체 ScreenStateHolder
        }
    }
    composable<DetailRoute> { entry ->
        KoinNavigationScope(entry) {
            DetailScreen() // 또 다른 ScreenStateHolder
        }
    }
}
```

스코프 ID는 `NavBackStackEntry.id`입니다. 대상이 컴포지션을 벗어나더라도 스코프가 닫히지 않으므로, 백스택에 엔트리가 남아 있는 동안 유지됩니다. 컴포지션이 폐기(abandoned)된 경우에만 스코프가 닫힙니다.

:::warning
`KoinNavigationScope`는 컴포지션의 Koin이 아닌 전역 Koin 인스턴스(`KoinPlatform.getKoin()`)에 스코프를 생성합니다. 따라서 `KoinIsolatedContext` 내부에서는 작동하지 않습니다.
:::

## UnboundKoinScope {id="unboundkoinscope"}

`UnboundKoinScope`는 사용자가 직접 관리하는 스코프를 제공합니다. Koin은 이 스코프를 자동으로 닫지 않습니다:

```kotlin
@OptIn(KoinDelicateAPI::class, KoinExperimentalAPI::class)
@Composable
fun SessionArea(sessionScope: Scope) {
    UnboundKoinScope(scope = sessionScope) {
        SessionContent()
    }
}
```

로그인 시 열리는 사용자 세션이나 여러 컴포지션 루트에서 공유되는 스코프처럼, 스코프 수명 주기가 UI 트리를 따르지 않을 때 사용합니다. 이 API는 `@KoinDelicateAPI`로 표시되어 있습니다. 직접 `scope.close()`를 호출해야 하며, 그렇지 않으면 스코프와 해당 인스턴스가 메모리에 유지됩니다.

## Android 스코프 {id="android-scopes"}

이러한 함수들은 `io.insert-koin:koin-androidx-compose`(`KoinActivityScope`, `KoinFragmentScope`) 및 `koin-compose`의 Android 타깃(`koinActivityInject`)에 포함되어 있습니다. Activity나 Fragment는 반드시 `AndroidScopeComponent`를 구현해야 합니다. Activity 및 Fragment 스코프 선언에 대한 내용은 [Android Scopes](/docs/reference/koin-android/scope)에서 다룹니다.

```kotlin
class MainActivity : ComponentActivity(), AndroidScopeComponent {
    override val scope: Scope by activityScope()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            KoinActivityScope {
                MainScreen()
            }
        }
    }
}

@Composable
fun MainScreen() {
    val presenter = koinInject<MainPresenter>() // Activity 스코프에서 주입됨
}
```

`KoinFragmentScope { }`는 Fragment가 호스팅하는 `ComposeView`에서 동일한 역할을 수행합니다.

`koinActivityInject()`는 감싸는 블록 없이도 깊이에 상관없이 Activity 스코프에서 의존성을 주입받습니다:

```kotlin
@Composable
fun DeepNestedScreen() {
    val session: SessionManager = koinActivityInject()
}
```

`LocalActivity`가 `AndroidScopeComponent`를 구현하지 않은 경우 실패합니다.

## 비교 {id="comparison"}

| API | 스코프 수명 주기 | 종료 주체 |
|-----|----------------|-----------|
| `KoinScope` | 컴포저블 | Koin, 컴포저블이 컴포지션을 벗어날 때 |
| `rememberKoinScope` | 컴포저블 | Koin, 컴포저블이 컴포지션을 벗어날 때 |
| `KoinNavigationScope` | 백스택 엔트리 | Koin, 컴포지션이 폐기(abandoned)될 때만 |
| `UnboundKoinScope` | 사용자 정의 | 사용자 직접 종료 |
| `KoinActivityScope` | Activity | Activity 스코프 (`activityScope()`) |
| `KoinFragmentScope` | Fragment | Fragment 스코프 (`fragmentScope()`) |

## 관련 문서 {id="related"}

- [Scopes](/docs/reference/koin-core/scopes): 스코프 선언, 연결 및 종료.
- [Android Scopes](/docs/reference/koin-android/scope): Activity, Fragment 및 ViewModel 스코프.
- [ViewModel in Compose](/docs/reference/koin-compose/compose-viewmodel): 네비게이션 그래프 전반에서 ViewModel 공유.
- [Lifecycle and State](/docs/reference/koin-compose/compose-lifecycle): 각 Compose API가 언제 무엇을 해제하는지 설명.
- [Dynamic Modules](/docs/reference/koin-compose/compose-modules): 컴포저블을 통해 모듈 로드.