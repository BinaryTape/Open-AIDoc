---
title: 동적 모듈
---

# 동적 모듈

이 페이지에서는 컴포저블(Composable)이 컴포지션(composition)에 진입할 때 Koin 모듈을 로드하고 컴포지션을 벗어날 때 언로드할 수 있는 `rememberKoinModules`에 대해 다룹니다. 이를 사용하여 특정 기능의 화면이 표시될 때만 해당 기능의 정의(definition)를 로드할 수 있습니다. 먼저 [모듈](/docs/reference/koin-core/modules)을 선언하는 방법을 숙지하고 있어야 합니다.

`rememberKoinModules`는 `io.insert-koin:koin-compose`에 포함되어 있으며 `@KoinExperimentalAPI`로 표시되어 있습니다.

## rememberKoinModules {id="rememberkoinmodules"}

```kotlin
import org.koin.compose.module.rememberKoinModules

val checkoutModule = module {
    factory<CheckoutRepository>()
    viewModel<CheckoutViewModel>()
}

@OptIn(KoinExperimentalAPI::class)
@Composable
fun CheckoutScreen() {
    rememberKoinModules(unloadOnForgotten = true) { listOf(checkoutModule) }

    val viewModel = koinViewModel<CheckoutViewModel>()
}
```

람다는 로드할 모듈 목록을 반환합니다. Koin은 `CheckoutScreen`이 처음 컴포지션될 때 해당 모듈들을 컴포지션의 Koin 인스턴스에 로드합니다. 리컴포지션(Recomposition) 시에는 모듈을 다시 로드하지 않습니다.

해당 정의가 필요한 `koinInject()` 또는 `koinViewModel()` 호출보다 먼저 `rememberKoinModules`를 호출하세요.

## 언로드 {id="unloading"}

기본적으로 컴포저블이 컴포지션을 벗어난 후에도 모듈은 로드된 상태로 유지됩니다. 언로드는 세 가지 파라미터로 제어합니다:

| 파라미터 | 기본값 | 동작 |
|-----------|---------|--------|
| `unloadOnForgotten` | `unloadModules` | 컴포저블이 컴포지션을 벗어날 때 언로드 |
| `unloadOnAbandoned` | `unloadModules` | 컴포지션이 중단(abandoned)될 때 언로드 |
| `unloadModules` | `false` | 위 두 파라미터의 기본값 |

```kotlin
// 두 경우 모두 언로드
rememberKoinModules(unloadModules = true) { listOf(checkoutModule) }
```

언로드하면 정의가 제거되고 해당 `single` 인스턴스가 삭제(drop)됩니다. 해당 인스턴스에 대한 참조를 여전히 보유하고 있는 코드는 이를 계속 유지하지만, Koin은 더 이상 해당 타입을 해결(resolve)할 수 없습니다. 다른 화면에서 여전히 사용 중인 모듈은 언로드하지 마세요.

## 목적지별 로딩 (Loading per destination) {id="loading-per-destination"}

사용자가 특정 목적지로 이동할 때 해당 기능을 로드하려면 네비게이션 목적지(navigation destination)에서 `rememberKoinModules`를 호출하세요:

```kotlin
NavHost(navController, startDestination = HomeRoute) {
    composable<HomeRoute> {
        HomeScreen()
    }
    composable<CheckoutRoute> {
        rememberKoinModules(unloadOnForgotten = true) { listOf(checkoutModule) }
        CheckoutScreen()
    }
}
```

## 모듈 스타일 {id="module-styles"}

**컴파일러 플러그인 DSL**
```kotlin
val checkoutModule = module {
    factory<CheckoutRepository>()
    viewModel<CheckoutViewModel>()
}
```

**어노테이션**
`rememberKoinModules`는 `Module` 값을 받습니다. `@Module` 어노테이션이 달린 클래스는 시작 시 `@KoinApplication`을 통해 로드됩니다([모듈](/docs/reference/koin-core/modules) 참조). 필요할 때 기능을 동적으로 로드하려면 DSL을 사용해 모듈을 선언하세요.

**생성자 / 클래식 DSL**
```kotlin
val checkoutModule = module {
    factoryOf(::CheckoutRepository)
    viewModelOf(::CheckoutViewModel)
}
```

## 제한 사항 {id="limits"}

- **메인 스레드**: 모듈은 컴포지션 도중 동기적으로 로드됩니다. 모듈의 크기가 크면 해당 프레임의 소요 시간이 늘어납니다. 시작 시 백그라운드에서 모듈을 로드하려면 [Lazy 모듈](/docs/reference/koin-core/lazy-modules)을 참조하세요.
- **오버라이드**: 나중에 로드된 모듈이 동일한 타입의 이전 정의보다 우선권을 갖습니다([정의](/docs/reference/koin-core/definitions) 참조). 해당 모듈을 언로드하더라도 이전 정의가 복원되지는 않습니다.
- **미리보기**: `rememberKoinModules`를 사용하려면 실행 중인 Koin 인스턴스가 필요합니다. 프리뷰를 위해서는 `KoinApplicationPreview`를 사용하세요([Compose 테스트](/docs/reference/koin-compose/compose-testing) 참조).

## 관련 항목 {id="related"}

- [모듈](/docs/reference/koin-core/modules): 모듈 선언 및 구성
- [Lazy 모듈](/docs/reference/koin-core/lazy-modules): 시작 시 백그라운드에서 모듈 로드
- [Koin 시작하기](/docs/reference/koin-core/starting-koin): Compose 외부에서 모듈 로드 및 언로드
- [Compose의 스코프](/docs/reference/koin-compose/compose-scopes): 컴포저블에 바인딩된 인스턴스
- [수명 주기 및 상태](/docs/reference/koin-compose/compose-lifecycle): 각 Compose API가 해제하는 대상 및 시점