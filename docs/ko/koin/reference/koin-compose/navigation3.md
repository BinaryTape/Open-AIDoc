---
title: Navigation 3
---

# Navigation 3

이 페이지에서는 Koin 모듈에서 [Navigation 3](https://developer.android.com/guide/navigation/navigation-3) 엔트리를 선언하고 이를 `NavDisplay`에 전달하는 방법을 설명합니다. 각 피처(feature) 모듈은 자체 화면을 제공하며, 앱은 단일 엔트리 프로바이더(entry provider)로 이를 모두 수집합니다. 이 문서는 독자가 Navigation 3의 기본 사항(백스택, `NavDisplay`, `NavEntry`)과 [ViewModel in Compose](/docs/reference/koin-compose/compose-viewmodel)에 대해 이미 알고 있다고 가정합니다.

이 페이지의 모든 API에는 `@KoinExperimentalAPI`가 지정되어 있습니다.

## 설정 {id="setup"}

```kotlin
// shared/build.gradle.kts 또는 Android의 app/build.gradle.kts
plugins {
    kotlin("plugin.serialization")
}

commonMain.dependencies {
    implementation("io.insert-koin:koin-compose-navigation3:$koin_version")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-core:$serialization_version")
}
```

`koin-compose-navigation3`은 Android, iOS, JVM 데스크톱, JS 및 Wasm을 지원합니다.

## 엔트리 선언 {id="declaring-entries"}

경로(Route)는 `@Serializable` 클래스입니다:

```kotlin
@Serializable data object HomeRoute
@Serializable data class DetailRoute(val itemId: String)
```

모듈에서 경로당 하나의 `navigation<T> { }`를 선언하세요. 람다는 경로를 전달받는 Composable입니다:

```kotlin
import org.koin.dsl.navigation3.navigation

val homeModule = module {
    viewModel<HomeViewModel>()

    navigation<HomeRoute> {
        HomeScreen(viewModel = koinViewModel())
    }
}

val detailModule = module {
    viewModel<DetailViewModel>()

    navigation<DetailRoute> { route ->
        DetailScreen(viewModel = koinViewModel { parametersOf(route.itemId) })
    }
}
```

각 `navigation<T>`는 경로 타입으로 한정(qualified)된 정의로 저장됩니다. 람다는 Koin `Scope`를 수신 객체(receiver)로 하여 실행되므로 내부에서 `get<T>()`뿐만 아니라 `koinViewModel()`과 같은 Composable 함수도 호출할 수 있습니다.

## 엔트리 프로바이더 빌드 {id="building-the-entry-provider"}

`koinEntryProvider()`는 현재 스코프의 모든 `navigation<T>` 엔트리를 수집하여 `NavDisplay`를 위한 단일 프로바이더로 만듭니다:

```kotlin
import org.koin.compose.navigation3.koinEntryProvider

@Composable
fun App() {
    val backStack = remember { mutableStateListOf<Any>(HomeRoute) }

    NavDisplay(
        backStack = backStack,
        onBack = { backStack.removeLastOrNull() },
        entryProvider = koinEntryProvider()
    )
}
```

`rememberNavBackStack()`을 사용하는 경우 경로는 `NavKey`를 구현해야 합니다. 백스택 타입과 일치하도록 `koinEntryProvider<NavKey>()`를 사용하세요.

### Android Activity에서 사용하기 {id="from-an-android-activity"}

Android에서는 `ComponentCallbacks`의 두 가지 확장 함수를 통해 Activity 또는 Fragment 스코프에서 프로바이더를 빌드할 수 있습니다:

| 함수 | 동작 |
|----------|----------|
| `entryProvider<T>()` | 지연 대리자(Lazy delegate): `val provider by entryProvider<Any>()` |
| `getEntryProvider<T>()` | 프로바이더를 즉시 빌드 |

이들은 컴포넌트의 Koin 스코프로부터 인스턴스를 해석(resolve)합니다. 컴포넌트가 `AndroidScopeComponent`를 구현한 경우에는 Activity 스코프에서, 그렇지 않은 경우에는 루트(root) 스코프에서 해석합니다.

## 스코프 내의 엔트리 {id="entries-in-a-scope"}

화면에 특정 스코프와 생명주기를 같이하는 객체가 필요한 경우, 스코프 내부에서 엔트리를 선언하세요. `activityRetainedScope`를 사용하면 구성 변경(configuration changes) 시에도 유지됩니다:

```kotlin
class Navigator(start: Any) {
    val backStack = mutableStateListOf(start)
    fun goTo(route: Any) { backStack.add(route) }
    fun goBack() { backStack.removeLastOrNull() }
}

val appModule = module {
    activityRetainedScope {
        scoped { Navigator(start = ConversationList) }

        navigation<ConversationList> {
            val navigator = get<Navigator>()
            ConversationListScreen(onClick = { navigator.goTo(ConversationDetail(it)) })
        }

        navigation<ConversationDetail> { route ->
            ConversationDetailScreen(conversationId = route.id)
        }
    }
}

class MainActivity : ComponentActivity(), AndroidScopeComponent {
    override val scope: Scope by activityRetainedScope()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val navigator: Navigator = get()
            NavDisplay(
                backStack = navigator.backStack,
                onBack = { navigator.goBack() },
                entryProvider = getEntryProvider()
            )
        }
    }
}
```

`getEntryProvider()`는 Activity 스코프에서 엔트리를 읽어옵니다. 스코프 내에 선언된 엔트리는 해당 스코프 내에서만 접근할 수 있습니다. `activityRetainedScope`에 대한 자세한 내용은 [Android Scopes](/docs/reference/koin-android/scope)를 참고하세요.

## 엔트리를 위한 ViewModel {id="viewmodels-for-an-entry"}

ViewModel의 스코프를 엔트리로 한정하려면 `NavDisplay`에 ViewModel 스토어 데코레이터를 추가하세요. 데코레이터가 없으면 `koinViewModel()`은 Activity의 스토어를 사용하므로 동일한 경로의 모든 엔트리가 하나의 인스턴스를 공유하게 됩니다:

```kotlin
NavDisplay(
    backStack = backStack,
    onBack = { backStack.removeLastOrNull() },
    entryDecorators = listOf(
        rememberSaveableStateHolderNavEntryDecorator(),
        rememberViewModelStoreNavEntryDecorator()
    ),
    entryProvider = koinEntryProvider()
)
```

경로 또는 경로의 프로퍼티를 매개변수로 전달하세요:

**컴파일러 플러그인 DSL**
```kotlin
class DetailViewModel(
    @InjectedParam val route: DetailRoute,
    private val repository: ItemRepository
) : ViewModel()

val detailModule = module {
    viewModel<DetailViewModel>()

    navigation<DetailRoute> { route ->
        DetailScreen(viewModel = koinViewModel { parametersOf(route) })
    }
}
```

**어노테이션**
```kotlin
@KoinViewModel
class DetailViewModel(
    @InjectedParam val route: DetailRoute,
    private val repository: ItemRepository
) : ViewModel()

// navigation<T> 엔트리는 DSL 모듈에서 선언됩니다
val detailModule = module {
    navigation<DetailRoute> { route ->
        DetailScreen(viewModel = koinViewModel { parametersOf(route) })
    }
}
```

**생성자 / 기본 DSL**
```kotlin
class DetailViewModel(
    val route: DetailRoute,
    private val repository: ItemRepository
) : ViewModel()

val detailModule = module {
    viewModelOf(::DetailViewModel) // route는 parametersOf(route)에서 전달됩니다

    navigation<DetailRoute> { route ->
        DetailScreen(viewModel = koinViewModel { parametersOf(route) })
    }
}
```

## 엔트리 메타데이터 {id="entry-metadata"}

`navigation<T>`는 `NavEntry`로 전달되는 `metadata` 맵을 지원합니다. 엔트리별 전환 효과(transition)나 목록-세부정보(list-detail)와 같은 씬 전략(scene strategy)을 지정하는 데 사용하세요:

```kotlin
val conversationModule = module {
    navigation<ConversationList>(metadata = ListDetailSceneStrategy.listPane()) {
        ConversationListScreen()
    }

    navigation<ConversationDetail>(metadata = ListDetailSceneStrategy.detailPane()) { route ->
        ConversationDetailScreen(route.id)
    }

    navigation<ModalRoute>(
        metadata = NavDisplay.transitionSpec {
            slideInVertically(initialOffsetY = { it }) togetherWith ExitTransition.KeepUntilTransitionsFinished
        }
    ) {
        ModalScreen()
    }
}
```

그런 다음 해당 씬 전략을 `NavDisplay`에 전달합니다 (`sceneStrategy = rememberListDetailSceneStrategy()`). 메타데이터 키는 Koin이 아닌 Navigation 3 및 adaptive 라이브러리에서 제공됩니다.

## Navigation 2와의 차이점 {id="from-navigation-2"}

| Navigation 2 | Koin을 사용하는 Navigation 3 |
|--------------|------------------------|
| `NavHost { composable(...) }` 내의 문자열 또는 타입 세이프 경로 | `@Serializable` 경로 클래스 |
| `NavHost` 내의 `composable<Route> { ... }` | Koin 모듈 내의 `navigation<Route> { ... }` |
| `NavHost(navController, startDestination)` | `NavDisplay(backStack, entryProvider = koinEntryProvider())` |
| `SavedStateHandle`에서 인수를 읽어옴 | 람다로 전달되는 경로 객체 |

## API 요약 {id="api-summary"}

| API | 패키지 | 용도 |
|-----|---------|---------|
| `Module.navigation<T>(metadata) { }` | `org.koin.dsl.navigation3` | 모듈에 엔트리 선언 |
| `ScopeDSL.navigation<T>(metadata) { }` | `org.koin.dsl.navigation3` | 스코프에 엔트리 선언 |
| `koinEntryProvider<T>(scope)` | `org.koin.compose.navigation3` | 현재 Compose 스코프에서 엔트리 프로바이더 생성 |
| `entryProvider<T>()`, `getEntryProvider<T>()` | `org.koin.androidx.compose.navigation3` | Activity 또는 Fragment(Android)에서 엔트리 프로바이더 생성 |

## 관련 문서 {id="related"}

- [ViewModel in Compose](/docs/reference/koin-compose/compose-viewmodel): `koinViewModel()` 및 해당 소유자(owner).
- [Android Scopes](/docs/reference/koin-android/scope): `activityRetainedScope` 및 Activity 스코프.
- [Injected Parameters](/docs/reference/koin-core/injection-parameters): `parametersOf` 및 `@InjectedParam`.
- [Koin for Compose](/docs/reference/koin-compose/compose): 패키지 구성 및 Koin 시작하기.
- [Navigation 3 레시피](https://github.com/android/nav3-recipes): Navigation 3에 대한 Google 공식 샘플 코드.