---
title: Android ViewModel
---

# Android ViewModel

本頁面介紹在 Activity 或 Fragment 中檢索 ViewModel 的 Android API：`by viewModel()`、`activityViewModel()`、導航圖（navigation graph）ViewModel 以及 Java API。如何在各個平台上宣告 ViewModel、傳遞參數以及使用 `SavedStateHandle` 均相同：請參閱 [ViewModel](/docs/reference/koin-core/viewmodel)。關於 Compose，請參閱 [ViewModel in Compose](/docs/reference/koin-compose/compose-viewmodel)。

無論你使用哪種風格宣告 ViewModel（`viewModel<UserViewModel>()`、`@KoinViewModel` 或 `viewModelOf(::UserViewModel)`），下方的取得程式碼都完全相同。

## 在 Activity 中 {id="in-an-activity"}

```kotlin
import org.koin.androidx.viewmodel.ext.android.viewModel
import org.koin.androidx.viewmodel.ext.android.getViewModel

class UserActivity : AppCompatActivity() {

    private val viewModel: UserViewModel by viewModel()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel.loadUser()

        // 積極載入替代方案，位於函式內部
        val sameViewModel: UserViewModel = getViewModel()
    }
}
```

`by viewModel()` 是延遲載入（lazy）的：ViewModel 會在首次存取時建立或取得。這兩個函式都會透過 Activity 的 `ViewModelStore`，因此在旋轉螢幕後，你仍會取回相同的執行個體。切勿使用 `by inject()` 或 `get()` 來檢索 ViewModel：這會導致每次都取得不受管理的新執行個體。

這些函式都在主執行緒（`@MainThread`）上執行。請在 `onCreate()` 中或之後讀取該屬性。

## 在 Fragment 中 {id="in-a-fragment"}

```kotlin
import org.koin.androidx.viewmodel.ext.android.activityViewModel
import org.koin.androidx.viewmodel.ext.android.viewModel

class UserDetailFragment : Fragment() {

    // 由此 Fragment 所擁有
    private val detailViewModel: UserDetailViewModel by viewModel()

    // 由宿主 Activity 所擁有，並與該 Activity 及其其他 Fragment 共享
    private val userViewModel: UserViewModel by activityViewModel()
}
```

| 函式 | ViewModel 的擁有者 | 積極載入版本 |
|----------|------------------------|---------------|
| `by viewModel()` | 此 Fragment | `getViewModel()` |
| `by activityViewModel()` | 宿主 Activity | `getActivityViewModel()` |

### 在 Fragment 之間共享 {id="sharing-between-fragments"}

對同一個類別使用 `activityViewModel()` 的多個 Fragment 都會取得相同的執行個體，使用 `by viewModel()` 的 Activity 也是如此：

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

### 其他擁有者 {id="another-owner"}

`viewModel()` 接受 `ownerProducer`。使用它可在同一個父 Fragment 的子 Fragment 之間共享 ViewModel：

```kotlin
class ChildFragment : Fragment() {
    private val parentViewModel: ParentViewModel by viewModel(ownerProducer = { requireParentFragment() })
}
```

## 參數與限定詞 {id="parameters-and-qualifiers"}

透過 `parametersOf` 的 Lambda 運算式將值傳遞給 ViewModel，並使用限定詞挑選定義：

```kotlin
class ItemActivity : AppCompatActivity() {

    private val itemId: String by lazy { intent.getStringExtra("ITEM_ID").orEmpty() }

    private val viewModel: ItemViewModel by viewModel { parametersOf(itemId) }
    private val draftViewModel: EditorViewModel by viewModel(qualifier = named("draft"))
}
```

如何在 ViewModel 端宣告參數（`@InjectedParam`、`params.get()`）已在 [ViewModel](/docs/reference/koin-core/viewmodel) 中說明。參數僅在首次建立 ViewModel 時使用：在螢幕旋轉後，ViewModel 會從 store 中檢索出來，而新的參數會被忽略。

使用限定詞時，Koin 會將 ViewModel 存儲在專屬的鍵值下。在同一個擁有者中，對同一個類別使用兩個限定詞將產生兩個獨立的執行個體。

## SavedStateHandle {id="savedstatehandle"}

在 ViewModel 建構函式中新增 `SavedStateHandle` 參數，Koin 便會提供它。相關宣告已在 [ViewModel](/docs/reference/koin-core/viewmodel) 中說明。在 Android 上，handle 是從擁有者的 `CreationExtras` 建構而成：它包含 Activity intent 的 extras 或 Fragment 的引數。若你需要其他 extras，請將 `extrasProducer` 傳遞給 `viewModel()`。

舊版 Koin 中的 `stateViewModel()` 函式已被移除。請改用 `viewModel()`。

## Navigation 圖 ViewModel {id="navigation-graph-viewmodel"}

使用 `io.insert-koin:koin-androidx-navigation` 構件，將 ViewModel 的作用域限定在 Navigation 元件圖中：

```kotlin
import org.koin.androidx.navigation.koinNavGraphViewModel

class CheckoutStepFragment : Fragment() {
    private val checkoutViewModel: CheckoutViewModel by koinNavGraphViewModel(R.id.checkout_graph)
}
```

該 ViewModel 由 `R.id.checkout_graph` 的返回堆疊項目（back stack entry）所擁有：

- 建立：當該導航圖中的任一 Fragment 首次讀取此屬性時。
- 共享：該導航圖中請求該 ViewModel 的每個 Fragment 都會取得相同的執行個體。
- 清除：當該導航圖從返回堆疊中彈出時。

`koinNavGraphViewModel()` 接受與 `viewModel()` 相同的 `qualifier`、`extrasProducer` 和 `parameters` 引數。關於 Navigation Compose，請參閱 [ViewModel in Compose](/docs/reference/koin-compose/compose-viewmodel)。

## ViewModel 與 Android 作用域 {id="viewmodels-and-android-scopes"}

當 Activity 或 Fragment 具有 Koin 作用域（`ScopeActivity`、`AndroidScopeComponent`）時，`by viewModel()` 會從該作用域解析 ViewModel。這樣一來，ViewModel 就能接收限定於該 Activity 作用域的相依性。

:::warning
請勿將 Activity 作用域或 Fragment 作用域的執行個體注入到 ViewModel 中。ViewModel 在螢幕旋轉後仍能存活，但 Activity 作用域則否：ViewModel 會保留對已關閉物件的參照，從而導致舊的 Activity 發生記憶體洩漏。對於生命週期與 ViewModel 相同的執行個體，請使用 ViewModel 作用域（請參閱 [Android Scopes](/docs/reference/koin-android/scope#viewmodel-scope)）。
:::

## 底層 API {id="lower-level-api"}

`viewModelForClass()` 接受 `KClass` 而非具體化型別。當類別只能在執行時期得知時，請使用此函式：

```kotlin
val viewModel: UserViewModel by viewModelForClass(
    clazz = UserViewModel::class,
    owner = this,
    key = "user_42",
    parameters = { parametersOf("42") },
)
```

`key` 讓您可以在同一個擁有者中保留相同類別的多個執行個體。與 `viewModel()` 不同的是，它起始於空的 `CreationExtras`：如果 ViewModel 需要 `SavedStateHandle`，請傳入 `state` 引數。

## Java {id="java"}

新增 `io.insert-koin:koin-android-compat` 構件並使用 `ViewModelCompat` 的 static 方法：

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

`SharedViewModelCompat` 可以從 Fragment 取得宿主 Activity 的 ViewModel，而 `ScopeCompat` 則從指定的作用域中進行解析。`ViewModelCompat` 和 `SharedViewModelCompat` 始終從根作用域解析，絕不會從 Activity 作用域解析。

## 相關內容 {id="related"}

- [ViewModel](/docs/reference/koin-core/viewmodel)：在所有平台上宣告 ViewModel、參數與 `SavedStateHandle`。
- [Android Scopes](/docs/reference/koin-android/scope)：Activity、Fragment 與 ViewModel 作用域。
- [Android Entry Points](/docs/reference/koin-android/entry-points)：在 Activity 與 Fragment 中注入其他相依性。
- [ViewModel in Compose](/docs/reference/koin-compose/compose-viewmodel)：Composable 中的 `koinViewModel()`。
- [Unit Testing](/docs/reference/koin-test/testing)：使用 Koin 測試 ViewModel。