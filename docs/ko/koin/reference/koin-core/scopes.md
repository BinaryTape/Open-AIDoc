---
title: 스코프 (Scopes)
---

# 스코프 (Scopes)

스코프는 의존성의 수명(lifecycle)을 제어합니다. 이 가이드에서는 스코프를 정의하고 생성하며 관리하는 방법을 다룹니다.

## 스코프 이해하기

| 스코프 종류 | 수명 (Lifecycle) | 예시 |
|------------|-----------|---------|
| **Single** (싱글톤) | 앱 수명 동안 유지 | Database, ApiClient |
| **Factory** | 요청 시마다 생성 | Presenters, Use Cases |
| **Scoped** | 스코프 수명 동안 유지 | Activity 바인딩, Session 바인딩 |

## 스코프를 사용하는 경우

다음과 같은 경우에 스코프를 사용하세요:
- 팩토리보다는 길고 싱글톤보다는 짧은 수명을 가진 인스턴스가 필요할 때
- 특정 컨텍스트(Activity, Fragment, Session) 내에서 상태를 공유해야 할 때
- 컨텍스트가 종료될 때 자동으로 리소스를 정리해야 할 때

## 스코프 정의 (Defining Scoped Definitions)

### DSL

```kotlin
val appModule = module {
    // MyActivity를 위한 스코프
    scope<MyActivity> {
        scoped<Presenter>()
        scoped<Navigator>()
    }

    // 이름이 지정된 스코프 (Named scope)
    scope(named("session")) {
        scoped<SessionData>()
        scoped<UserPreferences>()
    }
}
```

### 어노테이션 (Annotations)

| 어노테이션 | DSL 대응 문구 | 용도 |
|------------|----------------|---------|
| `@Scope` | `scope<T> { }` | 클래스가 속한 스코프를 지정 |
| `@Scoped` | `scoped<T>()` | 스코프 바인딩 정의 |

스코프 클래스는 `@Scoped`와 `@Scope`가 모두 필요합니다:

```kotlin
@Scope(MyActivityScope::class)
@Scoped
class Presenter(private val repository: UserRepository)

@Scope(MyActivityScope::class)
@Scoped
class Navigator
```

또는 일반적인 Android 스코프를 위해 스코프 아키타입 어노테이션을 사용할 수 있습니다 (`@Scoped`가 필요하지 않음):

```kotlin
// ViewModel 스코프
@ViewModelScope
class UserCache

// Activity 스코프
@ActivityScope
class ActivityPresenter

@ActivityRetainedScope
class RetainedPresenter

// Fragment 스코프
@FragmentScope
class FragmentPresenter
```

## 스코프 생성 및 사용

### 수동 스코프 관리

```kotlin
// 스코프 생성
val myScope = getKoin().createScope("my_scope_id", named("session"))

// 스코프에서 인스턴스 가져오기
val sessionData: SessionData = myScope.get()
val prefs: UserPreferences = myScope.get()

// 작업 완료 후 닫기
myScope.close()
```

### Android Activity 스코프

```kotlin
class MyActivity : AppCompatActivity(), AndroidScopeComponent {
    // Activity 수명 주기에 따라 자동으로 스코프를 생성하고 파괴함
    override val scope: Scope by activityScope()

    // 스코프 인스턴스 - Activity 인스턴스당 하나씩 생성됨
    private val presenter: Presenter by inject()

    override fun onDestroy() {
        super.onDestroy()
        // 스코프가 자동으로 닫힘
    }
}
```

### Android Fragment 스코프

```kotlin
class MyFragment : Fragment(), AndroidScopeComponent {
    // Fragment 수명 주기에 따라 자동으로 스코프를 생성하고 파괴함
    override val scope: Scope by fragmentScope()

    private val presenter: Presenter by inject()
}
```

## 스코프 유형 (Scope Types)

### 타입 기반 스코프 (Type-Based Scope)

```kotlin
scope<MyActivity> {
    scoped<ActivityPresenter>()
}
```

스코프는 `MyActivity` 타입으로 식별됩니다. 이 스코프는 `MyActivity`에 의해서만 트리거되는 반면, `activityScope`는 범용적인 스코프입니다.

### 이름 지정 스코프 (Named Scope)

```kotlin
scope(named("user_session")) {
    scoped<SessionManager>()
}
```

스코프가 특정 타입에 묶여 있지 않을 때 사용합니다.

### 한정자 기반 스코프 (Qualifier-Based Scope)

```kotlin
scope(named<MyQualifier>()) {
    scoped<ScopedService>()
}
```

## 스코프 아키타입 (Scope Archetypes)

Koin은 일반적인 Android 스코프 패턴을 위한 전용 DSL을 제공합니다. 이러한 아키타입은 ViewModel, Activity, Fragment에 대한 스코프 정의를 간소화합니다.

### ViewModel 스코프

ViewModel의 수명 주기에 바인딩된 의존성을 정의합니다:

```kotlin
val appModule = module {
    viewModelScope {
        scoped<UserCache>()
        scoped<UserRepository>()
        viewModel<UserViewModel>()
    }
}
```

ViewModel은 자동으로 해당 스코프 의존성에 접근할 수 있습니다:

```kotlin
class UserViewModel(
    private val cache: UserCache,      // 이 ViewModel에 스코프됨
    private val repository: UserRepository
) : ViewModel()
```

### Activity 스코프

Activity의 수명 주기에 바인딩된 의존성을 정의합니다:

```kotlin
val appModule = module {
    activityScope {
        scoped<ActivityPresenter>()
        scoped<ActivityNavigator>()
    }
}
```

### Fragment 스코프

Fragment의 수명 주기에 바인딩된 의존성을 정의합니다:

```kotlin
val appModule = module {
    fragmentScope {
        scoped<FragmentPresenter>()
    }
}
```

### 비교

| 아키타입 | DSL | 어노테이션 | 수명 (Lifecycle) |
|-----------|-----|------------|-----------|
| ViewModel | `viewModelScope { }` | `@ViewModelScope` | ViewModel이 clear될 때 |
| Activity | `activityScope { }` | `@ActivityScope` | Activity가 destroy될 때 |
| Activity Retained | `activityRetainedScope { }` | `@ActivityRetainedScope` | Activity가 finish될 때 |
| Fragment | `fragmentScope { }` | `@FragmentScope` | Fragment가 destroy될 때 |

:::info
스코프 아키타입은 Koin 4.0 이상에서 사용할 수 있습니다. 일반적인 Android 컴포넌트에 대해 `scope<T> { }`를 수동으로 정의하는 것보다 더 깔끔한 문법을 제공합니다.
:::

## 스코프 연결 (Scope Linking)

부모 스코프 정의에 접근하기 위해 스코프를 연결합니다:

```kotlin
val appModule = module {
    // Activity 스코프
    scope<MainActivity> {
        scoped<ActivityData>()
    }

    // Activity에 연결된 Fragment 스코프
    scope<UserFragment> {
        scoped<FragmentPresenter>()
    }
}
```

```kotlin
class UserFragment : Fragment(), AndroidScopeComponent {
    override val scope: Scope by fragmentScope()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // 부모 Activity 스코프에 연결
        scope.linkTo((requireActivity() as AndroidScopeComponent).scope)

        // 이제 Fragment와 Activity 스코프 인스턴스 모두에 접근 가능
        val fragmentPresenter: FragmentPresenter by inject()
        val activityData: ActivityData by inject()  // 연결된 스코프에서 가져옴
    }
}
```

## 스코프 소스 (Scope Source)

자신이 속한 스코프를 인지하는 의존성을 주입합니다:

```kotlin
class Presenter(
    val scope: Scope  // Koin에 의해 주입됨
) {
    fun clearScope() {
        scope.close()
    }
}

scope<MyActivity> {
    scoped { Presenter(get()) }  // 스코프가 주입됨
}
```

## 스코프 인스턴스 ID (Scope Instance ID)

각 스코프 인스턴스는 고유한 ID를 가집니다:

```kotlin
// 명시적인 ID로 생성
val scope1 = getKoin().createScope("scope_1", named("session"))
val scope2 = getKoin().createScope("scope_2", named("session"))

// 인스턴스는 다르지만 스코프 타입은 동일함
scope1.get<SessionData>() !== scope2.get<SessionData>()
```

## 스코프 인스턴스 접근하기

### 스코프 내부에서

```kotlin
class MyActivity : AppCompatActivity(), AndroidScopeComponent {
    override val scope: Scope by activityScope()

    // 스코프 인스턴스를 직접 주입
    private val presenter: Presenter by inject()
}
```

### 스코프 외부에서

```kotlin
// 스코프를 가져오거나 생성
val myScope = getKoin().getOrCreateScope("my_id", named("session"))

// 인스턴스 가져오기
val session: SessionData = myScope.get()
```

### Compose에서

```kotlin
@Composable
fun MyScreen() {
    // Composable 수명 주기에 바인딩된 스코프 생성
    val scope = rememberKoinScope(named("screen_scope"))

    // 스코프 인스턴스 가져오기
    val presenter: ScreenPresenter = scope.get()
}
```

## 스코프 수명 주기 (Scope Lifecycle)

### 스코프 닫기

스코프가 닫히면:
1. 모든 스코프 인스턴스가 해제됩니다.
2. `onClose` 콜백이 호출됩니다.
3. 스코프를 더 이상 사용할 수 없게 됩니다.

```kotlin
val scope = getKoin().createScope("my_scope", named("session"))

// 스코프 사용
val data: SessionData = scope.get()

// 작업 완료 후 닫기
scope.close()  // SessionData 인스턴스가 해제됨

// 이는 예외를 발생시킵니다.
// scope.get<SessionData>()  // 오류: 스코프가 닫혔습니다.
```

### onClose 콜백

```kotlin
scope(named("session")) {
    scoped {
        SessionData()
    } onClose {
        it?.cleanup()  // 스코프가 닫힐 때 호출됨
    }
}
```

## 공통 패턴

### 세션 스코프 (Session Scope)

```kotlin
val appModule = module {
    scope(named("user_session")) {
        scoped { SessionManager() }
        scoped { UserPreferences(get()) }
        scoped { CartRepository(get()) }
    }
}

// 로그인
fun onLogin(userId: String) {
    val sessionScope = getKoin().createScope(userId, named("user_session"))
    // 이제 세션 인스턴스를 사용할 수 있음
}

// 로그아웃
fun onLogout(userId: String) {
    getKoin().getScopeOrNull(userId)?.close()
    // 세션 인스턴스가 해제됨
}
```

### 기능 스코프 (Feature Scope)

```kotlin
val appModule = module {
    scope(named("checkout")) {
        scoped { CheckoutNavigator() }
        scoped { CheckoutPresenter(get()) }
    }
}

class CheckoutActivity : AppCompatActivity(), AndroidScopeComponent {
    override val scope: Scope by lazy {
        getKoin().createScope("checkout_${hashCode()}", named("checkout"))
    }

    override fun onDestroy() {
        super.onDestroy()
        scope.close()
    }
}
```

## 권장 사항 (Best Practices)

1. **싱글톤은 신중하게 사용하세요** - 진정으로 앱 전역에서 사용되는 의존성에만 사용하세요.
2. **공유 상태를 스코프에 넣으세요** - 여러 컴포넌트가 동일한 인스턴스를 필요로 할 때 사용하세요.
3. **스코프를 명시적으로 닫으세요** - 가비지 컬렉션에 의존하지 마세요.
4. **스코프를 집중된 상태로 유지하세요** - 모든 것을 하나의 스코프에 넣지 마세요.
5. **Android 스코프 컴포넌트를 사용하세요** - 자동 수명 주기 관리를 위해 활용하세요.

## 다음 단계

- **[Android용 Koin](/docs/reference/koin-android/scope)** - Android 전용 스코프
- **[Compose용 Koin](/docs/reference/koin-compose/compose-modules)** - Compose에서의 스코프
- **[권장 사항](/docs/reference/koin-core/scopes)** - 스코프 패턴