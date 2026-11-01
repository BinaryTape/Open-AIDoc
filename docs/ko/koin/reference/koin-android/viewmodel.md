---
title: Android ViewModel
---

# Android ViewModel

이 페이지에서는 Activity나 Fragment에서 ViewModel을 가져오기 위한 Android API인 `by viewModel()`, `activityViewModel()`, 네비게이션 그래프(Navigation graph) ViewModel 및 Java API에 대해 다룹니다. ViewModel을 선언하고, 파라미터를 전달하며, `SavedStateHandle`을 사용하는 방법은 모든 플랫폼에서 동일합니다. 자세한 내용은 [ViewModel](/docs/reference/koin-core/viewmodel)을 참고하세요. Compose의 경우 [ViewModel in Compose](/docs/reference/koin-compose/compose-viewmodel)를 참고하세요.

ViewModel을 선언할 때 어떤 스타일(`viewModel<UserViewModel>()`, `@KoinViewModel`, `viewModelOf(::UserViewModel)`)을 사용하든 아래의 검색(retrieval) 코드는 동일합니다.

## Activity에서 사용하기 {id="in-an-activity"}

```kotlin
import org.koin.androidx.viewmodel.ext.android.viewModel
import org.koin.androidx.viewmodel.ext.android.getViewModel

class UserActivity : AppCompatActivity() {

    private val viewModel: UserViewModel by viewModel()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel.loadUser()

        // 함수 내부에서 즉시 가져오는(eager) 대안
        val sameViewModel: UserViewModel = getViewModel()
    }
}
```

`by viewModel()`은 지연(lazy) 초기화됩니다. 즉, ViewModel에 처음 접근할 때 생성되거나 검색됩니다. 두 함수 모두 Activity의 `ViewModelStore`를 거치므로, 화면 회전(rotation) 후에도 동일한 인스턴스를 다시 가져옵니다. 절대로 `by inject()`나 `get()`으로 ViewModel을 가져오지 마세요. 그렇게 하면 매번 관리되지 않는 새로운 인스턴스가 생성됩니다.

이 함수들은 메인 스레드(`@MainThread`)에서 실행됩니다. 프로퍼티는 `onCreate()` 내부 또는 그 이후에 읽어야 합니다.

## Fragment에서 사용하기 {id="in-a-fragment"}

```kotlin
import org.koin.androidx.viewmodel.ext.android.activityViewModel
import org.koin.androidx.viewmodel.ext.android.viewModel

class UserDetailFragment : Fragment() {

    // 이 Fragment가 소유함
    private val detailViewModel: UserDetailViewModel by viewModel()

    // 호스트 Activity가 소유하며, 해당 Activity 및 다른 Fragment들과 공유됨
    private val userViewModel: UserViewModel by activityViewModel()
}
```

| 함수 | ViewModel의 소유자(Owner) | Eager 버전 |
|----------|------------------------|---------------|
| `by viewModel()` | 해당 Fragment | `getViewModel()` |
| `by activityViewModel()` | 호스트 Activity | `getActivityViewModel()` |

### Fragment 간 공유 {id="sharing-between-fragments"}

동일한 클래스에 대해 `activityViewModel()`을 사용하는 Fragment들은 동일한 인스턴스를 가져오며, `by viewModel()`을 사용하는 Activity도 마찬가지입니다.

```kotlin
class WeatherActivity : AppCompatActivity() {
    private val weatherViewModel: WeatherViewModel by viewModel()
}

class WeatherHeaderFragment : Fragment() {
    private val weatherViewModel: WeatherViewModel by activityViewModel()
}

class WeatherListFragment : Fragment() {
    private val weatherViewModel: WeatherViewModel by activityViewModel()
}
```

### 다른 소유자 지정하기 {id="another-owner"}

`viewModel()`은 `ownerProducer`를 인자로 받습니다. 이를 사용하여 동일한 부모를 가진 자식 Fragment 간에 ViewModel을 공유할 수 있습니다.

```kotlin
class ChildFragment : Fragment() {
    private val parentViewModel: ParentViewModel by viewModel(ownerProducer = { requireParentFragment() })
}
```

## 파라미터 및 한정자(qualifier) {id="parameters-and-qualifiers"}

`parametersOf` 람다를 사용하여 ViewModel에 값을 전달하고, 한정자(qualifier)를 사용하여 정의를 선택할 수 있습니다.

```kotlin
class ItemActivity : AppCompatActivity() {

    private val itemId: String by lazy { intent.getStringExtra("ITEM_ID").orEmpty() }

    private val viewModel: ItemViewModel by viewModel { parametersOf(itemId) }
    private val draftViewModel: EditorViewModel by viewModel(qualifier = named("draft"))
}
```

ViewModel 측에서 파라미터를 선언하는 방법(`@InjectedParam`, `params.get()`)은 [ViewModel](/docs/reference/koin-core/viewmodel)에 설명되어 있습니다. 파라미터는 ViewModel이 처음 생성될 때만 사용됩니다. 화면 회전 후에는 스토어에서 ViewModel을 다시 가져오므로 새로운 파라미터는 무시됩니다.

한정자를 사용하면 Koin은 고유한 키 아래에 ViewModel을 저장합니다. 동일한 클래스에 서로 다른 두 한정자를 지정하면 동일한 소유자 내에서 두 개의 개별 인스턴스가 생성됩니다.

## SavedStateHandle {id="savedstatehandle"}

ViewModel 생성자에 `SavedStateHandle` 파라미터를 추가하면 Koin이 이를 제공합니다. 선언 방법은 [ViewModel](/docs/reference/koin-core/viewmodel)에서 다룹니다. Android에서 핸들은 소유자의 `CreationExtras`로부터 빌드되며, Activity 인텐트의 extras 또는 Fragment의 arguments를 포함합니다. 다른 extras가 필요한 경우 `viewModel()`에 `extrasProducer`를 전달하세요.

이전 Koin 버전의 `stateViewModel()` 함수는 제거되었습니다. `viewModel()`을 사용하세요.

## 네비게이션 그래프 ViewModel {id="navigation-graph-viewmodel"}

`io.insert-koin:koin-androidx-navigation` 아티팩트를 사용하면 Navigation 컴포넌트 그래프에 ViewModel의 스코프를 지정할 수 있습니다.

```kotlin
import org.koin.androidx.navigation.koinNavGraphViewModel

class CheckoutStepFragment : Fragment() {
    private val checkoutViewModel: CheckoutViewModel by koinNavGraphViewModel(R.id.checkout_graph)
}
```

ViewModel은 `R.id.checkout_graph`의 백 스택 엔트리(back stack entry)에 의해 소유됩니다.

- 생성: 그래프의 Fragment가 프로퍼티를 처음 읽을 때 생성됩니다.
- 공유: 그래프 내에서 해당 ViewModel을 요청하는 모든 Fragment가 동일한 인스턴스를 가져옵니다.
- 정리(Cleared): 그래프가 백 스택에서 pop될 때 정리됩니다.

`koinNavGraphViewModel()`은 `viewModel()`과 동일하게 `qualifier`, `extrasProducer`, `parameters` 인자를 받습니다. Navigation Compose의 경우 [ViewModel in Compose](/docs/reference/koin-compose/compose-viewmodel)를 참고하세요.

## ViewModel과 Android 스코프 {id="viewmodels-and-android-scopes"}

Activity나 Fragment에 Koin 스코프(`ScopeActivity`, `AndroidScopeComponent`)가 있는 경우, `by viewModel()`은 해당 스코프에서 ViewModel을 해석(resolve)합니다. 그러면 ViewModel은 Activity 스코프가 지정된 의존성을 주입받을 수 있습니다.

:::warning
Activity 스코프 또는 Fragment 스코프의 인스턴스를 ViewModel에 주입하지 마세요. ViewModel은 화면 회전 시에도 유지되지만, Activity 스코프는 유지되지 않습니다. 이로 인해 ViewModel이 이미 닫힌 객체에 대한 참조를 유지하게 되어 이전 Activity의 메모리 누수(leak)가 발생합니다. ViewModel과 동일한 수명 주기를 갖는 인스턴스의 경우 ViewModel 스코프를 사용하세요([Android Scopes](/docs/reference/koin-android/scope#viewmodel-scope) 참고).
:::

## 하위 수준(Lower-level) API {id="lower-level-api"}

`viewModelForClass()`는 구체화된 타입(reified type) 대신 `KClass`를 인자로 받습니다. 런타임에만 클래스를 알 수 있는 경우에 사용하세요.

```kotlin
val viewModel: UserViewModel by viewModelForClass(
    clazz = UserViewModel::class,
    owner = this,
    key = "user_42",
    parameters = { parametersOf("42") },
)
```

`key`를 사용하면 한 소유자 내에 동일한 클래스의 인스턴스를 여러 개 유지할 수 있습니다. `viewModel()`과 달리 빈 `CreationExtras`로 시작하므로, ViewModel에 `SavedStateHandle`이 필요한 경우 `state` 인자를 전달해야 합니다.

## Java {id="java"}

`io.insert-koin:koin-android-compat` 아티팩트를 추가하고 `ViewModelCompat`의 정적 함수를 사용하세요.

```java
import kotlin.Lazy;
import org.koin.android.compat.ViewModelCompat;

public class UserJavaActivity extends AppCompatActivity {

    private final Lazy<UserViewModel> viewModel =
        ViewModelCompat.viewModel(this, UserViewModel.class);

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        UserViewModel vm = ViewModelCompat.getViewModel(this, UserViewModel.class);
    }
}
```

`SharedViewModelCompat`은 Fragment에서 호스트 Activity의 ViewModel을 제공하며, `ScopeCompat`은 주어진 스코프에서 해석합니다. `ViewModelCompat`과 `SharedViewModelCompat`은 항상 루트(root) 스코프에서 해석하며, Activity 스코프에서는 절대 해석하지 않습니다.

## 관련 문서 {id="related"}

- [ViewModel](/docs/reference/koin-core/viewmodel): 모든 플랫폼에서 ViewModel, 파라미터 및 `SavedStateHandle` 선언하기.
- [Android Scopes](/docs/reference/koin-android/scope): Activity, Fragment 및 ViewModel 스코프.
- [Android Entry Points](/docs/reference/koin-android/entry-points): Activity 및 Fragment에 다른 의존성 주입하기.
- [ViewModel in Compose](/docs/reference/koin-compose/compose-viewmodel): Composable에서 `koinViewModel()` 사용하기.
- [Unit Testing](/docs/reference/koin-test/testing): Koin으로 ViewModel 테스트하기.