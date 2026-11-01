---
title: Android ViewModel
---

# Android ViewModel

本页介绍了在 Activity 或 Fragment 中检索 ViewModel 的 Android API：`by viewModel()`、`activityViewModel()`、导航图 ViewModel 以及 Java API。声明 ViewModel、向其传递形参以及使用 `SavedStateHandle` 的方式在所有平台上都是相同的：请参阅 [ViewModel](/docs/reference/koin-core/viewmodel)。关于 Compose，请参阅 [ViewModel in Compose](/docs/reference/koin-compose/compose-viewmodel)。

无论你使用哪种风格来声明 ViewModel（`viewModel<UserViewModel>()`、`@KoinViewModel` 还是 `viewModelOf(::UserViewModel)`），下文中的检索代码都完全相同。

## 在 Activity 中 {id="in-an-activity"}

```kotlin
import org.koin.androidx.viewmodel.ext.android.viewModel
import org.koin.androidx.viewmodel.ext.android.getViewModel

class UserActivity : AppCompatActivity() {

    private val viewModel: UserViewModel by viewModel()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel.loadUser()

        // 预加载的替代方案，在函数内部使用
        val sameViewModel: UserViewModel = getViewModel()
    }
}
```

`by viewModel()` 是延迟加载的：ViewModel 会在首次访问时创建或检索。这两个函数都通过 Activity 的 `ViewModelStore` 进行处理，因此在屏幕旋转后，你将重新获取到相同的实例。切勿使用 `by inject()` 或 `get()` 检索 ViewModel：否则你每次都会获得一个新的、不受管理的实例。

这些函数在主线程（`@MainThread`）上运行。请在 `onCreate()` 中或之后读取该属性。

## 在 Fragment 中 {id="in-a-fragment"}

```kotlin
import org.koin.androidx.viewmodel.ext.android.activityViewModel
import org.koin.androidx.viewmodel.ext.android.viewModel

class UserDetailFragment : Fragment() {

    // 由此 Fragment 所有
    private val detailViewModel: UserDetailViewModel by viewModel()

    // 由宿主 Activity 所有，并与其及其他 Fragment 共享
    private val userViewModel: UserViewModel by activityViewModel()
}
```

| 函数 | ViewModel 的所有者 | 预加载版本 |
|----------|------------------------|---------------|
| `by viewModel()` | 该 Fragment | `getViewModel()` |
| `by activityViewModel()` | 宿主 Activity | `getActivityViewModel()` |

### 在 Fragment 之间共享 {id="sharing-between-fragments"}

针对同一个类使用 `activityViewModel()` 的多个 Fragment 会获取到相同的实例，使用 `by viewModel()` 的 Activity 也是如此：

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

### 其他所有者 {id="another-owner"}

`viewModel()` 接收一个 `ownerProducer`。可使用它在同一父级下的子 Fragment 之间共享 ViewModel：

```kotlin
class ChildFragment : Fragment() {
    private val parentViewModel: ParentViewModel by viewModel(ownerProducer = { requireParentFragment() })
}
```

## 形参与限定符 {id="parameters-and-qualifiers"}

使用 `parametersOf` lambda 为 ViewModel 传递值，并使用限定符选择对应的定义：

```kotlin
class ItemActivity : AppCompatActivity() {

    private val itemId: String by lazy { intent.getStringExtra("ITEM_ID").orEmpty() }

    private val viewModel: ItemViewModel by viewModel { parametersOf(itemId) }
    private val draftViewModel: EditorViewModel by viewModel(qualifier = named("draft"))
}
```

关于如何在 ViewModel 端声明形参（`@InjectedParam`、`params.get()`），请参阅 [ViewModel](/docs/reference/koin-core/viewmodel)。形参仅在首次创建 ViewModel 时使用：在屏幕旋转后，ViewModel 将从存储中检索，新的形参将被忽略。

使用限定符时，Koin 会将 ViewModel 存储在各自的键下。在同一个所有者中，对同一个类使用两个限定符将生成两个独立的实例。

## SavedStateHandle {id="savedstatehandle"}

将 `SavedStateHandle` 形参添加到 ViewModel 构造函数中，Koin 就会提供它。具体声明方法在 [ViewModel](/docs/reference/koin-core/viewmodel) 中进行了说明。在 Android 上，该 handle 基于所有者的 `CreationExtras` 构建：它包含 Activity intent extra 或 Fragment 实参。如果你需要其他 extra，请向 `viewModel()` 传递 `extrasProducer`。

旧版 Koin 中的 `stateViewModel()` 函数已被移除。请使用 `viewModel()`。

## 导航图 ViewModel {id="navigation-graph-viewmodel"}

借助 `io.insert-koin:koin-androidx-navigation` 工件，可以将 ViewModel 的作用域限定为 Navigation 组件的图（Navigation graph）：

```kotlin
import org.koin.androidx.navigation.koinNavGraphViewModel

class CheckoutStepFragment : Fragment() {
    private val checkoutViewModel: CheckoutViewModel by koinNavGraphViewModel(R.id.checkout_graph)
}
```

ViewModel 由 `R.id.checkout_graph` 的返回栈条目所有：

- 创建：图中的某个 Fragment 首次读取该属性时。
- 共享：图中请求该属性的每个 Fragment 都会获得相同的实例。
- 清除：当该图从返回栈中弹出时。

`koinNavGraphViewModel()` 接受与 `viewModel()` 相同的 `qualifier`、`extrasProducer` 和 `parameters` 实参。关于 Navigation Compose，请参阅 [ViewModel in Compose](/docs/reference/koin-compose/compose-viewmodel)。

## ViewModel 与 Android 作用域 {id="viewmodels-and-android-scopes"}

当 Activity 或 Fragment 拥有 Koin 作用域（`ScopeActivity`、`AndroidScopeComponent`）时，`by viewModel()` 会从该作用域解析 ViewModel。随后，ViewModel 即可接收作用域限定为该 Activity 的依赖项。

:::warning
不要将 Activity 作用域或 Fragment 作用域的实例注入到 ViewModel 中。ViewModel 在屏幕旋转后依然存在，而 Activity 作用域则不会：这会导致 ViewModel 保留对已关闭对象的引用，从而导致旧 Activity 内存泄漏。对于生命周期与 ViewModel 相同的实例，请使用 ViewModel 作用域（请参阅 [Android Scopes](/docs/reference/koin-android/scope#viewmodel-scope)）。
:::

## 底层 API {id="lower-level-api"}

`viewModelForClass()` 接受 `KClass` 而非具体化类型。当只能在运行时获知该类时，可使用此方法：

```kotlin
val viewModel: UserViewModel by viewModelForClass(
    clazz = UserViewModel::class,
    owner = this,
    key = "user_42",
    parameters = { parametersOf("42") },
)
```

`key` 允许你在同一个所有者中保留同一类的多个实例。与 `viewModel()` 不同，它是从空的 `CreationExtras` 开始的：如果 ViewModel 需要 `SavedStateHandle`，请传递 `state` 实参。

## Java {id="java"}

添加 `io.insert-koin:koin-android-compat` 工件并使用 `ViewModelCompat` 的静态方法：

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

`SharedViewModelCompat` 用于从 Fragment 获取宿主 Activity 的 ViewModel，而 `ScopeCompat` 则从给定的作用域中进行解析。`ViewModelCompat` 和 `SharedViewModelCompat` 始终从根作用域进行解析，绝不会从 Activity 作用域中解析。

## 相关内容 {id="related"}

- [ViewModel](/docs/reference/koin-core/viewmodel)：在所有平台上声明 ViewModel、形参及 `SavedStateHandle`。
- [Android Scopes](/docs/reference/koin-android/scope)：Activity、Fragment 和 ViewModel 作用域。
- [Android Entry Points](/docs/reference/koin-android/entry-points)：在 Activity 和 Fragment 中注入其他依赖项。
- [ViewModel in Compose](/docs/reference/koin-compose/compose-viewmodel)：Composable 中的 `koinViewModel()`。
- [Unit Testing](/docs/reference/koin-test/testing)：使用 Koin 测试 ViewModel。