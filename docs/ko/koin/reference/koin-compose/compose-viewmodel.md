---
title: Compose에서의 ViewModel
---

# Compose에서의 ViewModel

이 페이지에서는 ViewModel을 가져오는 Compose 함수인 `koinViewModel()`, `sharedKoinViewModel()`, `koinActivityViewModel()`에 대해 다룹니다. 파라미터, `SavedStateHandle` 또는 ViewModel 스코프와 함께 모듈에서 ViewModel을 선언하는 방법은 모든 플랫폼에서 동일합니다. 자세한 내용은 [ViewModel](/docs/reference/koin-core/viewmodel)을 참고하세요.

`io.insert-koin:koin-compose-viewmodel-navigation`에 있는 `sharedKoinViewModel()`을 제외하고, 이 페이지의 모든 함수는 `io.insert-koin:koin-compose-viewmodel`에 포함되어 있습니다. 패키지에 대한 자세한 내용은 [Koin for Compose](/docs/reference/koin-compose/compose)를 참고하세요.

## koinViewModel {id="koinviewmodel"}

```kotlin
import org.koin.compose.viewmodel.koinViewModel

@Composable
fun UserScreen(viewModel: UserViewModel = koinViewModel()) {
    val state by viewModel.state.collectAsState()
    // ...
}
```

`koinViewModel()`은 현재 `ViewModelStoreOwner`(`LocalViewModelStoreOwner`)에서 ViewModel을 가져오며, 최초 호출 시 Koin을 통해 생성합니다. 이 인스턴스는 해당 소유자(Activity, Fragment 또는 탐색 대상(navigation destination))의 수명 주기 동안 유지됩니다.

기본 파라미터(default parameter)로 선언하면 테스트 코드나 Preview에서 자체 인스턴스를 전달할 수 있어 Composable의 테스트 용이성을 유지할 수 있습니다.

`koinViewModel()`은 Composable 함수입니다. `onClick`과 같은 콜백 내부가 아닌, Composable 본문에서 호출해야 합니다.

### 파라미터 {id="parameters"}

| 파라미터 | 기본값 | 용도 |
|-----------|---------|-----|
| `qualifier` | `null` | [이름이 지정된(named)](/docs/reference/koin-core/qualifiers) ViewModel 정의 선택 |
| `viewModelStoreOwner` | `LocalViewModelStoreOwner.current` | 다른 소유자(owner)에 ViewModel 저장 |
| `key` | `null` | 한 소유자 내에서 동일한 클래스의 인스턴스를 여러 개 유지 |
| `extras` | 소유자의 Extras | `SavedStateHandle`을 생성하는 데 사용되는 `CreationExtras` |
| `scope` | `currentKoinScope()` | ViewModel을 확인(resolve)하는 데 사용되는 Koin 스코프 |
| `parameters` | `null` | [주입된 파라미터](/docs/reference/koin-core/injection-parameters)를 반환하는 람다 |

### 파라미터 전달 {id="passing-parameters"}

```kotlin
@Composable
fun DetailScreen(itemId: String) {
    val viewModel = koinViewModel<DetailViewModel> { parametersOf(itemId) }
}
```

파라미터는 ViewModel이 생성될 때만 사용됩니다. 동일한 소유자가 이미 `DetailViewModel`을 보유하고 있다면, 다른 `itemId`를 전달하더라도 기존 인스턴스가 반환됩니다. 한 소유자가 값마다 하나의 ViewModel을 유지해야 하는 경우, `key`를 추가하세요:

```kotlin
@Composable
fun DetailScreen(itemId: String) {
    val viewModel = koinViewModel<DetailViewModel>(key = itemId) {
        parametersOf(itemId)
    }
}
```

Navigation Compose를 사용하면 각 대상마다 고유한 소유자가 있으므로 백 스택(back stack)에 있는 화면에 대해 `key`를 지정할 필요가 없습니다.

## Navigation Compose와 함께 사용하기 {id="with-navigation-compose"}

`composable { }` 대상(destination) 내부에서 현재 `ViewModelStoreOwner`는 `NavBackStackEntry`입니다. `koinViewModel()`은 대상마다 하나의 ViewModel을 생성하며, 해당 대상이 백 스택에서 제거(pop)될 때 지워집니다. ViewModel의 `SavedStateHandle`은 탐색 인수를 보유합니다:

```kotlin
@Serializable
data class DetailRoute(val itemId: String)

class DetailViewModel(handle: SavedStateHandle) : ViewModel() {
    val itemId: String = handle.toRoute<DetailRoute>().itemId
}

NavHost(navController, startDestination = HomeRoute) {
    composable<DetailRoute> {
        DetailScreen(viewModel = koinViewModel())
    }
}
```

Koin이 `SavedStateHandle`을 대신 주입해 주므로 생성자 파라미터로 선언하기만 하면 됩니다. 선언 방식에 대해서는 [ViewModel](/docs/reference/koin-core/viewmodel)을 참고하세요.

:::warning
`koinNavViewModel()`은 `koin-compose-viewmodel-navigation`과 `koin-androidx-compose-navigation` 모두에서 지원 중단(deprecated)되었습니다. 동일한 파라미터를 사용하는 `koinViewModel()`로 대체하세요. 탐색 인수는 동일한 방식으로 `SavedStateHandle`에 전달됩니다.
:::

### 탐색 그래프에서 ViewModel 공유하기 {id="sharing-a-viewmodel-in-a-navigation-graph"}

`sharedKoinViewModel()`은 ViewModel을 상위 그래프(parent graph)의 백 스택 엔트리에 저장합니다. 해당 그래프의 모든 대상은 동일한 인스턴스를 공유받습니다:

```kotlin
import org.koin.compose.viewmodel.sharedKoinViewModel

navigation<BookGraph>(startDestination = BookList) {
    composable<BookList> { entry ->
        val shared = entry.sharedKoinViewModel<BookSharedViewModel>(navController)
        BookListScreen(shared)
    }
    composable<BookDetail> { entry ->
        val shared = entry.sharedKoinViewModel<BookSharedViewModel>(navController)
        BookDetailScreen(shared)
    }
}
```

상위 그래프는 기본적으로 `destination.parent?.route`입니다. 다른 그래프를 대상으로 지정하려면 `navGraphRoute`를 전달하세요. 대상에 상위 그래프가 없는 경우 `sharedKoinViewModel()`은 `koinViewModel()`로 폴백(fallback)됩니다.

## Activity 범위의 ViewModel (Android) {id="activity-wide-viewmodel-android"}

`koinActivityViewModel()`은 현재 `ComponentActivity`에 ViewModel을 저장합니다. 해당 Activity의 모든 Composable은 어떤 탐색 대상에 있든 상관없이 동일한 인스턴스를 가져옵니다:

```kotlin
import org.koin.compose.viewmodel.koinActivityViewModel

@Composable
fun CartBadge() {
    val cart = koinActivityViewModel<CartViewModel>()
}

@Composable
fun CartScreen() {
    val cart = koinActivityViewModel<CartViewModel>() // CartBadge와 동일한 인스턴스
}
```

이 함수는 Android에서만 사용할 수 있으며, `LocalActivity`가 `ComponentActivity`가 아닌 경우 실패합니다. `koinViewModel()`과 동일하게 `qualifier`, `key`, `scope`, `parameters` 인수를 받습니다.

## 스코프가 지정된 의존성 (Scoped dependencies) {id="scoped-dependencies"}

ViewModel은 자체 의존성을 위한 스코프(`viewModelScope { }` 또는 `@ViewModelScope`)를 가질 수 있습니다. Compose 측면에서는 달라지는 것이 없으며, `koinViewModel()`이 ViewModel과 해당 스코프를 함께 생성합니다. 선언 방법은 [ViewModel](/docs/reference/koin-core/viewmodel)에 설명되어 있습니다.

## API 요약 {id="api-summary"}

| API | 인스턴스 소유자 | 패키지 |
|-----|-----------------|--------|
| `koinViewModel()` | `LocalViewModelStoreOwner` (Activity, Fragment, 대상) | `koin-compose-viewmodel` |
| `NavBackStackEntry.sharedKoinViewModel()` | 상위 탐색 그래프 엔트리 | `koin-compose-viewmodel-navigation` |
| `koinActivityViewModel()` | 현재 `ComponentActivity` (Android) | `koin-compose-viewmodel` |
| `koinNavViewModel()` | 지원 중단됨(Deprecated), `koinViewModel()` 사용 | `koin-compose-viewmodel-navigation` |

## 관련 문서 {id="related"}

- [ViewModel](/docs/reference/koin-core/viewmodel): ViewModel, 파라미터, `SavedStateHandle`, ViewModel 스코프 선언.
- [Android ViewModel](/docs/reference/koin-android/viewmodel): Activity 및 Fragment에서의 `by viewModel()`.
- [Navigation 3](/docs/reference/koin-compose/navigation3): Navigation 3 엔트리를 사용하는 ViewModel.
- [Lifecycle and State](/docs/reference/koin-compose/compose-lifecycle): Compose에서의 컴포넌트 수명 주기.
- [Compose Testing](/docs/reference/koin-compose/compose-testing): `koinViewModel()`을 사용하는 Composable 테스트.