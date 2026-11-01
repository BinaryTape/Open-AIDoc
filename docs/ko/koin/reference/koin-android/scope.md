---
title: Android 스코프
---

# Android 스코프

Android 스코프(Scope)는 단일 컴포넌트(Activity, Fragment, Service 또는 ViewModel)와 동일한 수명 동안 인스턴스를 유지하고 컴포넌트와 함께 종료합니다. 이 페이지에서는 스코프 아키타입(archetype), `ScopeActivity`, `ScopeFragment`, `AndroidScopeComponent`, retained 스코프 및 Service 스코프와 같은 Android 스코프 API를 다룹니다. 스코프의 개념, `scoped`, 링킹(linking) 및 전반적인 종료에 대한 설명은 [Scopes](/docs/reference/koin-core/scopes)를 참조하세요.

## 스코프 수명 주기 {id="scope-lifetimes"}

| 스코프 | 열리는 시점 | 닫히는 시점 | 화면 회전 시 유지 여부 |
|-------|--------|--------|-------------------|
| `activityScope` | Activity에서 최초 접근 시 | Activity의 `ON_DESTROY` | 아니요 |
| `activityRetainedScope` | Activity에서 최초 접근 시 | Activity 종료 시 (ViewModel 기반) | 예 |
| `fragmentScope` | Fragment에서 최초 접근 시 | Fragment의 `ON_DESTROY` | 아니요 |
| Service 스코프 | `Service.onCreate()` | `Service.onDestroy()` | 해당 없음 |
| `viewModelScope` | ViewModel 생성 시 | ViewModel 클리어 시 | 예 |

`single`은 앱 전체의 수명 동안 유지되므로, 위 모든 스코프의 가장 바깥 레벨에 해당합니다.

## Scoped 정의 선언하기 {id="declaring-scoped-definitions"}

Android에는 컴포넌트 타입당 하나의 스코프 아키타입이 있습니다. 아키타입은 스코프가 있는 모든 Activity(또는 Fragment)에서 사용할 수 있는 스코프 선언이므로, 클래스마다 스코프를 따로 작성할 필요가 없습니다.

**컴파일러 플러그인 DSL**
```kotlin
import org.koin.androidx.scope.dsl.activityRetainedScope
import org.koin.androidx.scope.dsl.activityScope
import org.koin.androidx.scope.dsl.fragmentScope

val screenModule = module {
    activityScope {
        scoped<ScreenNavigator>()
    }
    activityRetainedScope {
        scoped<FormState>()
    }
    fragmentScope {
        scoped<DetailPresenter>()
    }
}
```

**애노테이션**
```kotlin
import org.koin.android.annotation.ActivityRetainedScope
import org.koin.android.annotation.ActivityScope
import org.koin.android.annotation.FragmentScope

@ActivityScope
class ScreenNavigator(private val activity: Activity)

@ActivityRetainedScope
class FormState

@FragmentScope
class DetailPresenter(private val repository: UserRepository)
```

**생성자 / 클래식 DSL**
```kotlin
import org.koin.androidx.scope.dsl.activityRetainedScope
import org.koin.androidx.scope.dsl.activityScope
import org.koin.androidx.scope.dsl.fragmentScope

val screenModule = module {
    activityScope {
        scopedOf(::ScreenNavigator)
    }
    activityRetainedScope {
        scopedOf(::FormState)
    }
    fragmentScope {
        scopedOf(::DetailPresenter)
    }
}
```

정의를 특정 단일 Activity 클래스로 제한하려면, 대신 타입 기반 스코프를 선언하세요(DSL에서는 `scope<UserActivity> { }`, 애노테이션에서는 `@Scoped`와 함께 `@Scope(UserActivity::class)` 사용). Koin은 타입 기반 스코프를 먼저 확인한 후 아키타입을 확인합니다. 타입 기반 스코프에 대한 설명은 [Scopes](/docs/reference/koin-core/scopes)를 참조하세요.

## Activity 스코프 {id="activity-scope"}

`ScopeActivity`를 상속받거나, `AndroidScopeComponent`를 구현하고 `activityScope()`를 사용해 스코프를 생성합니다.

```kotlin
import org.koin.androidx.scope.ScopeActivity

class UserActivity : ScopeActivity() {

    private val navigator: ScreenNavigator by inject()
}
```

```kotlin
import org.koin.android.scope.AndroidScopeComponent
import org.koin.androidx.scope.activityScope

class UserActivity : AppCompatActivity(), AndroidScopeComponent {

    override val scope: Scope by activityScope()

    private val navigator: ScreenNavigator by inject()
}
```

스코프가 있으면 Activity 내의 `inject()`, `get()`, `viewModel()`은 Activity 스코프에서 먼저 의존성을 해결(resolve)한 다음, 루트 스코프에서 해결합니다. 이 스코프는 Activity의 `ON_DESTROY` 수명 주기 이벤트에서 닫히므로, `onDestroy()` 코드가 실행되는 시점에는 이미 닫혀 있습니다.

Activity는 자체 스코프의 소스(source)입니다. 스코프가 지정된 정의는 `Activity` 또는 `Context`를 요청하여 현재 Activity를 주입받을 수 있습니다.

```kotlin
@ActivityScope
class ScreenNavigator(private val activity: Activity) {
    fun openSettings() = activity.startActivity(Intent(activity, SettingsActivity::class.java))
}
```

`activityScope()`(위임 프로퍼티, `org.koin.androidx.scope` 패키지)와 `activityScope { }`(모듈 DSL, `org.koin.androidx.scope.dsl` 패키지)는 이름이 동일합니다. 컴파일러가 잘못된 것을 임포트하지 않았는지 확인하세요.

### Retained Activity 스코프 {id="retained-activity-scope"}

`activityRetainedScope()`는 구성 변경(configuration change)이 발생해도 동일한 스코프를 유지합니다. Koin은 이 스코프를 Activity의 ViewModel에 저장하고 해당 ViewModel이 클리어될 때(즉, Activity가 완전히 종료될 때) 스코프를 닫습니다.

```kotlin
import org.koin.androidx.scope.RetainedScopeActivity

class FormActivity : RetainedScopeActivity() {

    private val formState: FormState by inject()
}
```

또는 `AndroidScopeComponent`를 사용하는 경우: `override val scope: Scope by activityRetainedScope()`.

retained 스코프의 정의는 Activity 인스턴스보다 오래 유지됩니다. 따라서 Activity, 뷰(View) 또는 Fragment에 대한 참조를 유지해서는 안 됩니다. retained 스코프에는 소스가 없으므로, 여기서 `Context`를 요청하면 `Application`으로 해결됩니다.

## Fragment 스코프 {id="fragment-scope"}

`ScopeFragment`를 상속받거나, `AndroidScopeComponent`를 구현하고 `fragmentScope()`를 사용합니다.

```kotlin
import org.koin.androidx.scope.ScopeFragment

class DetailFragment : ScopeFragment() {

    private val presenter: DetailPresenter by inject()

    // 부모 Activity 스코프에서 해결됨
    private val navigator: ScreenNavigator by inject()
}
```

```kotlin
import org.koin.androidx.scope.fragmentScope

class DetailFragment : Fragment(), AndroidScopeComponent {

    override val scope: Scope by fragmentScope()
}
```

Fragment 스코프는 호스트 Activity 스코프에 연결되어 있으므로, Activity 스코프가 지정된 인스턴스를 참조할 수 있습니다. 이는 호스트 Activity에 스코프(`ScopeActivity` 또는 `AndroidScopeComponent`)가 있는 경우에만 동작합니다. 그렇지 않은 경우 연결이 생략되며 Koin에 로그가 기록됩니다. 의도적으로 연결을 생략하려면 `fragmentScope(useParentActivityScope = false)`를 전달하세요.

:::warning
Fragment 스코프는 뷰(View) 수명 주기가 아닌 Fragment 수명 주기(`ON_DESTROY`)를 따릅니다. 뷰 또는 바인딩을 보유하는 스코프 인스턴스는 `onDestroyView()` 이후에도 Fragment가 완전히 파괴될 때까지 이를 유지합니다. 뷰 참조는 `onDestroyView()`에서 해제해야 합니다.
:::

## Service 스코프 {id="service-scope"}

`ScopeService`를 상속받습니다. 이 스코프는 `onCreate()`에서 열리고 `onDestroy()`에서 닫힙니다. Service에는 아키타입이 없으므로 Service 클래스에 대한 타입 기반 스코프를 선언해야 합니다.

**컴파일러 플러그인 DSL**
```kotlin
val playerModule = module {
    scope<MusicService> {
        scoped<PlaybackSession>()
    }
}
```

**애노테이션**
```kotlin
@Scope(MusicService::class)
@Scoped
class PlaybackSession
```

**생성자 / 클래식 DSL**
```kotlin
val playerModule = module {
    scope<MusicService> {
        scopedOf(::PlaybackSession)
    }
}
```

```kotlin
import org.koin.android.scope.ScopeService

class MusicService : ScopeService() {

    private val session: PlaybackSession by inject()

    override fun onBind(intent: Intent?): IBinder? = null
}
```

Service가 `ScopeService`를 상속받을 수 없는 경우, `AndroidScopeComponent`를 구현하여 `override val scope: Scope by serviceScope()`를 지정하고 `onDestroy()`에서 `destroyServiceScope()`를 호출하세요.

## ViewModel 스코프 {id="viewmodel-scope"}

ViewModel 스코프는 정확히 하나의 ViewModel과 동일한 수명 동안 유지되는 인스턴스를 보유합니다. `viewModelScope { }` 또는 `@ViewModelScope`로 선언합니다. 그런 다음 Koin이 각 ViewModel마다 스코프를 생성하도록 `viewModelScopeFactory()` 옵션을 활성화하거나, `ScopeViewModel`을 상속받으세요.

```kotlin
import org.koin.core.option.viewModelScopeFactory

startKoin {
    androidContext(this@MainApplication)
    options(viewModelScopeFactory())
    modules(appModule)
}
```

선언, 해당 옵션 및 `ScopeViewModel`에 대한 설명은 [Scopes](/docs/reference/koin-core/scopes)를 참조하세요. Android에서는 평소와 같이 `by viewModel()`을 사용하여 ViewModel을 가져옵니다([Android ViewModel](/docs/reference/koin-android/viewmodel) 참조).

`activityScope` 내에서 ViewModel을 `scoped`로 선언하지 마세요. 이는 `ViewModelStore`에 의해 관리되지 않으며 화면 회전 시마다 다시 생성되는 일반 객체가 됩니다. ViewModel은 반드시 `viewModel`로 선언하고 `by viewModel()`로 가져와야 합니다.

## 스코프가 닫히기 전 정리 작업 {id="cleaning-up-before-the-scope-closes"}

`AndroidScopeComponent`에서 `onCloseScope()`를 재정의(override)합니다. Koin은 Activity 또는 Fragment 스코프를 닫기 직전, 스코프 인스턴스들을 아직 사용할 수 있는 상태일 때 이 메서드를 호출합니다.

```kotlin
class UserActivity : ScopeActivity() {

    override fun onCloseScope() {
        get<ScreenNavigator>().clear()
    }
}
```

`onCloseScope()`는 retained 스코프나 Service 스코프에서는 호출되지 않습니다. 개별 정의에 묶인 정리 작업이 필요한 경우, 정의에 `onClose { }`를 사용하세요([Definitions](/docs/reference/koin-core/definitions#release-callback) 참조).

## 제한 사항 {id="limits"}

- 스코프 필수: 스코프가 지정된 정의를 주입받는 클래스는 반드시 스코프를 가지고 있어야 합니다(`ScopeActivity`, `ScopeFragment`, `ScopeService` 또는 `AndroidScopeComponent`). 스코프가 없으면 `inject()`는 루트 스코프에서 의존성을 해결하려고 시도하다가 `NoDefinitionFoundException`을 발생시키며 실패합니다.
- 메인 스레드: Activity 및 Fragment 스코프는 메인 스레드에서 생성해야 합니다(프로퍼티 위임은 `onCreate()` 내부 또는 그 이후에 읽힘).
- 커스텀 스코프: `getKoin().createScope()`로 직접 생성한 스코프는 어떤 수명 주기에도 연결되지 않습니다. 직접 닫아주어야 합니다.

:::tip
실제 사용자 세션에서 스코프 수명 주기와 누수된 인스턴스를 확인하려면 [Production Monitoring](/docs/tooling/production-monitoring)을 참조하세요.
:::

## 관련 항목 {id="related"}

- [Scopes](/docs/reference/koin-core/scopes): 스코프 개념, 링킹, `@Scope` 및 ViewModel 스코프.
- [Android ViewModel](/docs/reference/koin-android/viewmodel): Activity 및 Fragment 스코프를 활용한 ViewModel.
- [Android Entry Points](/docs/reference/koin-android/entry-points): Android 컴포넌트에서의 주입.
- [Fragment Factory](/docs/reference/koin-android/fragment-factory): Activity 스코프에서 Fragment 생성.
- [Android Best Practices](/docs/reference/koin-android/best-practices): Context 및 Activity 누수 방지.