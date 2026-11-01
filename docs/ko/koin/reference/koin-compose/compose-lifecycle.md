---
title: 수명 주기 및 상태
---

# 수명 주기 및 상태 (Lifecycle and State)

이 페이지에서는 Koin으로 주입된 객체가 Compose 수명 주기(lifecycle) 내에서 어떻게 동작하는지 설명합니다. 리컴포지션(recomposition) 시 어떤 일이 발생하는지, Composable이 컴포지션(composition)을 벗어날 때 각 Koin API가 무엇을 해제하는지, 그리고 주입 호출을 어디에 배치해야 하는지 다룹니다. 이 문서는 독자가 `koinInject()` 및 `koinViewModel()`([Compose용 Koin](/docs/reference/koin-compose/compose) 참조)과 [Compose 수명 주기](https://developer.android.com/develop/ui/compose/lifecycle)를 이미 알고 있다고 가정합니다.

## 리컴포지션 (Recomposition) {id="recomposition"}

`koinInject()`는 의존성을 한 번 확인(resolve)하고 한정자(qualifier), 스코프(scope), 매개변수(parameters)를 키로 사용하여 `remember`로 유지합니다.

```kotlin
@Composable
fun UserScreen(userId: String) {
    val repository = koinInject<UserRepository>() // 한 번만 확인됨
    val presenter = koinInject<UserPresenter> { parametersOf(userId) } // userId가 변경되면 다시 확인됨
}
```

동일한 키로 리컴포지션이 발생하면 동일한 객체를 얻습니다. 키가 변경되면(새로운 `userId`) Koin은 다시 확인을 수행합니다. `single`의 경우 동일한 인스턴스를 반환하고, `factory`의 경우 새 인스턴스를 생성합니다.

`koinViewModel()`은 `remember`를 사용하지 않습니다. ViewModel은 `ViewModelStoreOwner`에 저장되며 리컴포지션 및 Android 구성 변경(configuration changes) 시에도 유지됩니다. 해당 매개변수는 생성 시에만 사용됩니다([Compose에서의 ViewModel](/docs/reference/koin-compose/compose-viewmodel) 참조).

두 함수 모두 Composable 함수이므로 `remember { }`, `LaunchedEffect` 또는 `onClick` 람다 내부에서 호출할 수 없습니다. Composable 본문에서 호출하고 그 결과를 람다 내부에서 사용하세요.

```kotlin
@Composable
fun SaveButton() {
    val repository = koinInject<UserRepository>()

    Button(onClick = { repository.save() }) {
        Text("Save")
    }
}
```

## 해제되는 대상과 시점 {id="what-is-released-and-when"}

| API | 리컴포지션 시 | Composable이 컴포지션을 벗어날 때 |
|-----|------------------|--------------------------------------------|
| `koinInject()` | 키가 변경되지 않으면 동일한 객체 유지 | 참조가 제거됨. Koin은 `single` 또는 `scoped` 인스턴스를 유지함 |
| `koinViewModel()` | 동일한 ViewModel 유지 | 아무것도 해제되지 않음. ViewModel은 해당 `ViewModelStoreOwner`와 함께 소멸(cleared)됨 |
| `KoinApplication` | 동일한 Koin 인스턴스 유지 | Koin은 계속 실행됨. 컴포지션이 중단(abandoned)된 경우에만 중지됨 |
| `KoinScope`, `rememberKoinScope` | 동일한 스코프 유지 | 스코프가 닫힘(closed) |
| `KoinNavigationScope` | 동일한 스코프 유지 | 스코프가 유지됨. 컴포지션이 중단된 경우에만 닫힘 |
| `UnboundKoinScope` | 동일한 스코프 유지 | 아무것도 해제되지 않음. 사용자가 직접 스코프를 닫아야 함 |
| `rememberKoinModules` | 모듈이 한 번 로드됨 | `unloadOnForgotten`을 설정한 경우에만 모듈이 언로드됨 |

자세한 내용: [Compose에서의 스코프](/docs/reference/koin-compose/compose-scopes), [동적 모듈](/docs/reference/koin-compose/compose-modules).

## 주입 위치 {id="where-to-inject"}

화면(screen) 레벨에서 주입하고 하위로는 일반 데이터와 람다를 전달하세요. 이렇게 하면 자식 Composable이 Koin에 의존하지 않게 되며, 미리보기(preview)와 테스트에 Koin 인스턴스가 필요하지 않습니다.

```kotlin
@Composable
fun UserListScreen(viewModel: UserListViewModel = koinViewModel()) {
    val users by viewModel.users.collectAsState()
    UserList(users = users, onDelete = viewModel::delete)
}

@Composable
fun UserList(users: List<User>, onDelete: (User) -> Unit) {
    LazyColumn {
        items(users) { user -> UserCard(user, onDelete) }
    }
}
```

`LazyColumn` 아이템 내부에서 `koinInject()`를 호출하는 것은 피하세요. 각 아이템마다 자체적인 확인(resolution)과 `remember`가 실행됩니다. 상위 컴포넌트에서 한 번만 주입하고 객체나 람다를 전달하세요.

### 매개변수로 전달할 것인가, 주입할 것인가? {id="pass-as-a-parameter-or-inject"}

| 매개변수로 전달 | Koin으로 주입 |
|---------------------|------------------|
| 변경되는 값: ID, 검색 쿼리, 선택 상태 | 수명이 긴 서비스: 리포지토리, 유스케이스 |
| 내비게이션 인수 | 인프라: 데이터베이스, HTTP 클라이언트 |
| 부모가 이미 가지고 있는 데이터 | ViewModel |

```kotlin
@Composable
fun UserProfile(
    userId: String,                              // 변경되는 값: 매개변수로 전달
    repository: UserRepository = koinInject()   // 서비스: 주입
) {
    var user by remember { mutableStateOf<User?>(null) }

    LaunchedEffect(userId) {
        user = repository.getUser(userId)
    }

    user?.let { ProfileContent(it) }
}
```

## 주입된 객체와 안정성 (Stability) {id="injected-objects-and-stability"}

Koin은 Compose가 타입을 바라보는 방식을 변경하지 않습니다. `UserRepository` 또는 `UserViewModel` 타입의 Composable 매개변수는 다른 일반 클래스와 마찬가지로 Compose 컴파일러 규칙에 따라 안정(stable) 또는 불안정(unstable)으로 판단됩니다. Composable에서 건너뛰기(skipping)가 중요하다면 주입된 객체 대신 안정적인 값(상태, 원시 타입, 람다)을 전달하세요.

## 부수 효과 (Side effects) {id="side-effects"}

주입된 객체는 일반적인 Kotlin 객체입니다. 다른 값과 마찬가지로 `LaunchedEffect`, `DisposableEffect`, 또는 `SideEffect`에서 사용할 수 있습니다. 먼저 Composable 본문에서 이를 확인(resolve)하세요.

```kotlin
@Composable
fun EventScreen() {
    val eventBus = koinInject<EventBus>()

    DisposableEffect(eventBus) {
        val listener = eventBus.subscribe { event -> /* ... */ }
        onDispose { eventBus.unsubscribe(listener) }
    }
}
```

## 관련 문서 {id="related"}

- [Compose용 Koin](/docs/reference/koin-compose/compose): `koinInject()` 및 Koin 시작하기.
- [Compose에서의 ViewModel](/docs/reference/koin-compose/compose-viewmodel): ViewModel 소유자(owner) 및 매개변수.
- [Compose에서의 스코프](/docs/reference/koin-compose/compose-scopes): UI 트리에 바인딩된 스코프.
- [동적 모듈](/docs/reference/koin-compose/compose-modules): Composable과 함께 모듈 로드 및 언로드하기.
- [Compose 테스트](/docs/reference/koin-compose/compose-testing): 미리보기(previews) 및 UI 테스트.