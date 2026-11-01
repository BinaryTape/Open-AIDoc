---
title: Android ViewModel
---

# Android ViewModel

このページでは、Activity や Fragment で ViewModel を取得するための Android API（`by viewModel()`、`activityViewModel()`、Navigation グラフの ViewModel、および Java API）について説明します。ViewModel の宣言方法、パラメータの渡し方、`SavedStateHandle` の使用方法については、どのプラットフォームでも共通です。[ViewModel](/docs/reference/koin-core/viewmodel) を参照してください。Compose については、[ViewModel in Compose](/docs/reference/koin-compose/compose-viewmodel) を参照してください。

以下の取得コードは、ViewModel を宣言する際にどのスタイル（`viewModel<UserViewModel>()`、`@KoinViewModel`、または `viewModelOf(::UserViewModel)`）を使用していても同じです。

## Activity 内での利用 {id="in-an-activity"}

```kotlin
import org.koin.androidx.viewmodel.ext.android.viewModel
import org.koin.androidx.viewmodel.ext.android.getViewModel

class UserActivity : AppCompatActivity() {

    private val viewModel: UserViewModel by viewModel()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel.loadUser()

        // 関数内での即時取得（eager）の代替手段
        val sameViewModel: UserViewModel = getViewModel()
    }
}
```

`by viewModel()` は遅延初期化（lazy）されます。ViewModel は初回アクセス時に作成または取得されます。どちらの関数も Activity の `ViewModelStore` を経由するため、画面回転後も同じインスタンスが再取得されます。ViewModel を `by inject()` や `get()` で取得しないでください。毎回管理されていない新しいインスタンスが生成されてしまいます。

これらの関数はメインスレッド（`@MainThread`）で実行されます。プロパティの読み取りは `onCreate()` 内またはその後に行ってください。

## Fragment 内での利用 {id="in-a-fragment"}

```kotlin
import org.koin.androidx.viewmodel.ext.android.activityViewModel
import org.koin.androidx.viewmodel.ext.android.viewModel

class UserDetailFragment : Fragment() {

    // この Fragment がオーナー
    private val detailViewModel: UserDetailViewModel by viewModel()

    // ホストとなる Activity がオーナー（その Activity や他の Fragment と共有される）
    private val userViewModel: UserViewModel by activityViewModel()
}
```

| 関数 | ViewModel のオーナー | 即時（Eager）版 |
|----------|------------------------|---------------|
| `by viewModel()` | この Fragment | `getViewModel()` |
| `by activityViewModel()` | ホスト Activity | `getActivityViewModel()` |

### Fragment 間での共有 {id="sharing-between-fragments"}

同じクラスに対して `activityViewModel()` を使用する複数の Fragment は同じインスタンスを取得し、`by viewModel()` を使用する Activity も同様に同じインスタンスを取得します。

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

### 別のオーナーの指定 {id="another-owner"}

`viewModel()` は `ownerProducer` を受け取ります。これを使用して、同じ親を持つ子 Fragment 間で ViewModel を共有できます。

```kotlin
class ChildFragment : Fragment() {
    private val parentViewModel: ParentViewModel by viewModel(ownerProducer = { requireParentFragment() })
}
```

## パラメータとクォリファイア {id="parameters-and-qualifiers"}

`parametersOf` ラムダを使用して ViewModel に値を渡し、クォリファイア（qualifier）を使用して特定の定義を選択します。

```kotlin
class ItemActivity : AppCompatActivity() {

    private val itemId: String by lazy { intent.getStringExtra("ITEM_ID").orEmpty() }

    private val viewModel: ItemViewModel by viewModel { parametersOf(itemId) }
    private val draftViewModel: EditorViewModel by viewModel(qualifier = named("draft"))
}
```

ViewModel 側でパラメータを宣言する方法（`@InjectedParam`、`params.get()`）は、[ViewModel](/docs/reference/koin-core/viewmodel) に記載されています。パラメータは ViewModel が最初に作成されるときにのみ使用されます。画面回転後はストアから ViewModel が取得されるため、新しいパラメータは無視されます。

クォリファイアを使用すると、Koin はその固有のキーで ViewModel を保存します。同じクラスに2つのクォリファイアを適用すると、同じオーナー内に2つの別々のインスタンスが生成されます。

## SavedStateHandle {id="savedstatehandle"}

ViewModel のコンストラクタに `SavedStateHandle` パラメータを追加すると、Koin がそれを提供します。宣言については [ViewModel](/docs/reference/koin-core/viewmodel) で説明されています。Android では、ハンドルはオーナーの `CreationExtras` から構築され、Activity の Intent Extras や Fragment の Arguments が含まれます。他の Extras が必要な場合は、`viewModel()` に `extrasProducer` を渡してください。

古いバージョンの Koin にあった `stateViewModel()` 関数は削除されました。`viewModel()` を使用してください。

## Navigation グラフの ViewModel {id="navigation-graph-viewmodel"}

`io.insert-koin:koin-androidx-navigation` アーティファクトを使用すると、ViewModel のスコープを Navigation コンポーネントのグラフに制限できます。

```kotlin
import org.koin.androidx.navigation.koinNavGraphViewModel

class CheckoutStepFragment : Fragment() {
    private val checkoutViewModel: CheckoutViewModel by koinNavGraphViewModel(R.id.checkout_graph)
}
```

ViewModel は `R.id.checkout_graph` のバックスタックエントリによって所有されます。

- 生成（Created）: グラフ内の Fragment が初めてプロパティを読み取ったとき。
- 共有（Shared）: その ViewModel を要求するグラフ内のすべての Fragment が同じインスタンスを取得。
- 破棄（Cleared）: グラフがバックスタックからポップされたとき。

`koinNavGraphViewModel()` は、`viewModel()` と同じ `qualifier`、`extrasProducer`、`parameters` の引数を受け取ります。Navigation Compose については、[ViewModel in Compose](/docs/reference/koin-compose/compose-viewmodel) を参照してください。

## ViewModel と Android スコープ {id="viewmodels-and-android-scopes"}

Activity や Fragment が Koin スコープ（`ScopeActivity`、`AndroidScopeComponent`）を持っている場合、`by viewModel()` はそのスコープから ViewModel を解決します。これにより、ViewModel は Activity にスコープされた依存関係を受け取ることができます。

:::warning
Activity スコープまたは Fragment スコープのインスタンスを ViewModel にインジェクトしないでください。ViewModel は画面回転後も存続しますが、Activity スコープは破棄されるため、ViewModel が破棄済みのオブジェクトへの参照を保持し続け、古い Activity がリークしてしまいます。ViewModel と同じ生存期間を持つインスタンスが必要な場合は、ViewModel スコープを使用してください（[Android Scopes](/docs/reference/koin-android/scope#viewmodel-scope) を参照）。
:::

## 低レベル API {id="lower-level-api"}

`viewModelForClass()` は、reified 型の代わりに `KClass` を受け取ります。実行時にしかクラスが分からない場合に使用します。

```kotlin
val viewModel: UserViewModel by viewModelForClass(
    clazz = UserViewModel::class,
    owner = this,
    key = "user_42",
    parameters = { parametersOf("42") },
)
```

`key` を使用すると、1つのオーナー内に同じクラスの複数のインスタンスを保持できます。`viewModel()` とは異なり、空の `CreationExtras` から開始されるため、ViewModel で `SavedStateHandle` が必要な場合は `state` 引数を渡してください。

## Java {id="java"}

`io.insert-koin:koin-android-compat` アーティファクトを追加し、`ViewModelCompat` の静的関数を使用します。

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

`SharedViewModelCompat` は Fragment からホスト Activity の ViewModel を取得し、`ScopeCompat` は指定されたスコープから解決します。`ViewModelCompat` と `SharedViewModelCompat` は常にルートスコープから解決され、Activity スコープから解決されることはありません。

## 関連情報 {id="related"}

- [ViewModel](/docs/reference/koin-core/viewmodel): あらゆるプラットフォームでの ViewModel、パラメータ、`SavedStateHandle` の宣言。
- [Android Scopes](/docs/reference/koin-android/scope): Activity、Fragment、および ViewModel のスコープ。
- [Android Entry Points](/docs/reference/koin-android/entry-points): Activity や Fragment でのその他の依存関係のインジェクト。
- [ViewModel in Compose](/docs/reference/koin-compose/compose-viewmodel): Composable 内での `koinViewModel()`。
- [Unit Testing](/docs/reference/koin-test/testing): Koin を使用した ViewModel のテスト。