---
title: ViewModel
---

# ViewModel

이 페이지에서는 AndroidX ViewModel을 지원하는 모든 플랫폼(Android, iOS, 데스크톱, 웹)의 Koin 모듈에서 ViewModel을 선언하는 방법을 다룹니다. 이 문서는 독자가 [정의(definitions)](/docs/reference/koin-core/definitions)에 대해 알고 있다고 가정합니다. ViewModel을 가져오는 방법은 각 플랫폼별 문서를 참조하세요. Activity 또는 Fragment에서의 `by viewModel()`은 [Android ViewModel](/docs/reference/koin-android/viewmodel), `koinViewModel()`은 [Compose에서의 ViewModel](/docs/reference/koin-compose/compose-viewmodel)을 확인하세요.

## 의존성 {id="dependencies"}

선언 DSL은 멀티플랫폼 아티팩트인 `koin-core-viewmodel`에 포함되어 있습니다:

```kotlin
// build.gradle.kts, commonMain
implementation("io.insert-koin:koin-core-viewmodel")
```

주입 API는 플랫폼 아티팩트인 `io.insert-koin:koin-android`(`koin-core-viewmodel` 포함) 및 `io.insert-koin:koin-compose-viewmodel`과 함께 제공됩니다. 버전은 BOM을 통해 관리됩니다. 자세한 내용은 [Gradle 설정](/docs/setup/gradle)을 참조하세요.

## ViewModel 선언하기 {id="declaring-a-viewmodel"}

**컴파일러 플러그인 DSL**
```kotlin
import org.koin.dsl.module
import org.koin.plugin.module.dsl.viewModel

class UserViewModel(private val repository: UserRepository) : ViewModel()

val appModule = module {
    viewModel<UserViewModel>()
}
```

**어노테이션**
```kotlin
import org.koin.core.annotation.KoinViewModel

@KoinViewModel
class UserViewModel(private val repository: UserRepository) : ViewModel()
```

컴파일러 플러그인을 사용하면 `@KoinViewModel`은 `org.koin.core.annotation`에 위치하며 공통(common) 코드에서 동작합니다. 이전 KSP 프로세서는 `org.koin.android.annotation.KoinViewModel`을 사용했습니다.

**생성자 / 클래식 DSL**
```kotlin
import org.koin.dsl.module
import org.koin.core.module.dsl.viewModelOf
import org.koin.core.module.dsl.viewModel

val appModule = module {
    viewModelOf(::UserViewModel)

    // 또는 생성자 호출을 직접 작성하는 방식
    viewModel { UserViewModel(get()) }
}
```

`viewModel` 정의는 `factory`와 마찬가지로 요청 시마다 새 인스턴스를 생성합니다. 플랫폼의 `ViewModelStore`(Activity, Fragment, 네비게이션 엔트리)가 이 인스턴스를 보관하므로, 동일한 소유자(owner)는 Android의 구성 변경(configuration change) 전반에서 동일한 ViewModel을 다시 받게 됩니다. ViewModel을 `single`로 선언하지 마세요. 모든 화면에서 공유되며 절대 정리(clear)되지 않습니다.

## 파라미터 전달하기 {id="passing-parameters"}

ViewModel은 종종 항목 ID(item id)와 같이 런타임에만 알 수 있는 값을 필요로 합니다. 이때는 생성자 파라미터에 주입된 파라미터(injected parameter) 표시를 합니다:

**컴파일러 플러그인 DSL**
```kotlin
class DetailViewModel(
    @InjectedParam val itemId: String,
    private val repository: DetailRepository,
) : ViewModel()

val appModule = module {
    viewModel<DetailViewModel>()
}
```

**어노테이션**
```kotlin
@KoinViewModel
class DetailViewModel(
    @InjectedParam val itemId: String,
    private val repository: DetailRepository,
) : ViewModel()
```

**생성자 / 클래식 DSL**
```kotlin
val appModule = module {
    viewModel { params ->
        DetailViewModel(itemId = params.get(), repository = get())
    }
}
```

`viewModelOf(::DetailViewModel)`도 동작합니다. 호출자가 전달한 값에서 타입별로 파라미터를 읽어옵니다.

선언 방식과 관계없이, 호출자는 `parametersOf`를 사용하여 값을 전달합니다:

```kotlin
// Android
val viewModel: DetailViewModel by viewModel { parametersOf("item_123") }

// Compose
val viewModel = koinViewModel<DetailViewModel> { parametersOf("item_123") }
```

파라미터는 ViewModel이 생성될 때 한 번만 읽힙니다. 동일한 소유자가 다른 값으로 다시 요청하더라도 기존 인스턴스를 반환받습니다. 파라미터에 대한 자세한 내용은 [주입된 파라미터(Injected Parameters)](/docs/reference/koin-core/injection-parameters)를 참조하세요.

## SavedStateHandle {id="savedstatehandle"}

생성자에 `SavedStateHandle` 파라미터를 추가하세요. Koin은 별도의 선언 없이 ViewModel의 `CreationExtras`로부터 이를 생성합니다:

**컴파일러 플러그인 DSL**
```kotlin
class ProfileViewModel(
    private val handle: SavedStateHandle,
    private val repository: UserRepository,
) : ViewModel() {
    val userId: String? = handle["userId"]
}

val appModule = module {
    viewModel<ProfileViewModel>()
}
```

**어노테이션**
```kotlin
@KoinViewModel
class ProfileViewModel(
    private val handle: SavedStateHandle,
    private val repository: UserRepository,
) : ViewModel() {
    val userId: String? = handle["userId"]
}
```

**생성자 / 클래식 DSL**
```kotlin
val appModule = module {
    viewModelOf(::ProfileViewModel)

    // 또는: get()이 SavedStateHandle을 해결합니다
    viewModel { ProfileViewModel(get(), get()) }
}
```

Android에서는 네비게이션 인수(navigation arguments)와 Activity extras가 `SavedStateHandle`에 포함됩니다. 반드시 생성자에서만 주입하세요. ViewModel 소유자에게 `SavedStateRegistryOwner`가 없으면 Koin은 "Koin could not create a SavedStateHandle: the ViewModel's CreationExtras has no SavedStateRegistryOwner." 오류와 함께 실패합니다.

## ViewModel 스코프 {id="viewmodel-scope"}

ViewModel은 [스코프(scope)](/docs/reference/koin-core/scopes)를 소유할 수 있습니다. 스코프 내의 의존성은 ViewModel과 함께 생성되고, ViewModel이 정리(cleared)될 때 해제됩니다. `viewModelScope` 아키타입(archetype)을 사용하여 선언하세요:

**컴파일러 플러그인 DSL**
```kotlin
val appModule = module {
    viewModelScope {
        scoped<UserCache>()
        viewModel<UserViewModel>()
    }
}
```

**어노테이션**
```kotlin
@ViewModelScope
class UserCache

@KoinViewModel
@ViewModelScope
class UserViewModel(private val cache: UserCache) : ViewModel()
```

**생성자 / 클래식 DSL**
```kotlin
val appModule = module {
    viewModelScope {
        scopedOf(::UserCache)
        viewModelOf(::UserViewModel)
    }
}
```

시작 시 해당 옵션을 활성화해야 합니다. 그렇지 않으면 ViewModel에 스코프가 할당되지 않습니다:

```kotlin
startKoin {
    options(viewModelScopeFactory())
    modules(appModule)
}
```

`viewModelScope`와 `viewModelScopeFactory()`를 사용하려면 `@KoinViewModelScopeApi` 및 `@KoinExperimentalAPI`에 대한 opt-in이 필요합니다. 생성자에서 스코프가 지정된 의존성(scoped dependencies)을 받는 ViewModel은 반드시 `viewModelScope { }` 내부에서 선언되어야 합니다. 각 ViewModel 인스턴스는 자신만의 `UserCache`를 가지며, 이 캐시는 ViewModel이 정리될 때 닫힙니다(closed).

## 제한 사항 {id="limits"}

- **소유자당 하나의 인스턴스**: 해당 소유자에 대해 ViewModel이 이미 존재하는 경우 주입된 파라미터는 무시됩니다. 두 번째 인스턴스를 가져오려면 다른 키나 소유자를 사용하세요.
- **`single` ViewModel 금지**: 싱글톤 ViewModel은 절대 정리되지 않으며 의존성 메모리 누수를 발생시킵니다.
- **실험적 ViewModel 스코프**: `viewModelScope`는 실험적 기능(experimental)으로 표시되어 있으며 변경될 수 있습니다.

## 관련 문서 {id="related"}

- [Android ViewModel](/docs/reference/koin-android/viewmodel): `by viewModel()`, `activityViewModel()`, 네비게이션 그래프 ViewModel.
- [Compose에서의 ViewModel](/docs/reference/koin-compose/compose-viewmodel): `koinViewModel()` 및 네비게이션 ViewModel.
- [주입된 파라미터(Injected Parameters)](/docs/reference/koin-core/injection-parameters): `parametersOf` 및 `@InjectedParam`.
- [스코프(Scopes)](/docs/reference/koin-core/scopes): 스코프 아키타입 및 스코프 수명 주기.
- [정의(Definitions)](/docs/reference/koin-core/definitions): 기타 정의 유형.