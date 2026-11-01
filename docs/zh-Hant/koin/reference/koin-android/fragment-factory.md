---
title: Fragment 工廠
---

# Fragment 工廠

預設情況下，Android 會使用空建構函式建立 Fragment，因此你會使用 `by inject()` 注入相依性（參閱 [Android 入口點](/docs/reference/koin-android/entry-points)）。透過 AndroidX 的 [FragmentFactory](https://developer.android.com/reference/kotlin/androidx/fragment/app/FragmentFactory)，Koin 會自行建立 Fragment 並將相依性傳遞至其建構函式。本頁面涵蓋設定方式、`fragment` 定義，以及來自 Activity 作用域的 Fragment。

`fragment` 定義包含在 `io.insert-koin:koin-android` 中，不需要額外的構件。

## 設定 {id="setup"}

在 `startKoin` 中啟用 Koin 的 Fragment 工廠：

```kotlin
import org.koin.androidx.fragment.koin.fragmentFactory

startKoin {
    androidContext(this@MainApplication)
    fragmentFactory()
    modules(appModule)
}
```

接著在託管這些 Fragment 的每個 Activity 中，於 `super.onCreate()` 之前進行安裝：

```kotlin
import org.koin.androidx.fragment.android.setupKoinFragmentFactory

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        setupKoinFragmentFactory()
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }
}
```

`super.onCreate()` 會在螢幕旋轉或行程終止（process death）後還原 Fragment。工廠必須在此之前就緒，否則 Android 會使用預設工廠，並在沒有空建構函式的 Fragment 上執行失敗。

## 宣告 Fragment {id="declaring-a-fragment"}

**編譯器外掛程式 DSL**
編譯器外掛程式 DSL 沒有 `fragment<T>()` 函式。請在同一個模組中使用傳統 DSL（Classic DSL）`fragment { }` 或建構函式 DSL（Constructor DSL）`fragmentOf()`：

```kotlin
class UserFragment(private val repository: UserRepository) : Fragment()

val uiModule = module {
    single<UserRepository>()
    fragmentOf(::UserFragment)
}
```

**註解**
目前沒有 Fragment 專屬的註解。請在 DSL 模組中宣告 Fragment，並與你的已註解類別並列（參閱 [DSL 參考](/docs/reference/koin-core/dsl)）：

```kotlin
val uiModule = module {
    fragmentOf(::UserFragment)
}
```

**建構函式 / 傳統 DSL**
```kotlin
import org.koin.androidx.fragment.dsl.fragment
import org.koin.androidx.fragment.dsl.fragmentOf

class UserFragment(private val repository: UserRepository) : Fragment()

val uiModule = module {
    singleOf(::UserRepository)
    fragmentOf(::UserFragment)

    // or write the constructor call
    fragment { UserFragment(get()) }
}
```

`fragment` 定義屬於 `factory`：每一次交易（transaction）都會取得一個新的 Fragment 執行個體。如果沒有與 Fragment 類別相符的定義，Koin 工廠將回退至預設的 AndroidX 行為。

## 新增 Fragment {id="adding-a-fragment"}

在 `FragmentTransaction` 上使用具體化（reified）的 `replace` 擴充函式：

```kotlin
import org.koin.androidx.fragment.android.replace

supportFragmentManager.beginTransaction()
    .replace<UserFragment>(R.id.container)
    .commit()
```

帶有引數與標籤（tag）：

```kotlin
supportFragmentManager.beginTransaction()
    .replace<UserFragment>(
        containerViewId = R.id.container,
        args = bundleOf("USER_ID" to "42"),
        tag = "user",
    )
    .commit()
```

請在 `args` 中傳遞每個執行個體的專屬數值，而非透過建構函式傳遞：Android 會透過工廠重新建立 Fragment，且僅會還原引數。

## 來自 Activity 作用域的 Fragment {id="fragments-from-an-activity-scope"}

若要為 Fragment 提供來自其 Activity 作用域的執行個體，請在該作用域內宣告 Fragment，並將該作用域傳遞給 `setupKoinFragmentFactory()`：

```kotlin
val checkoutModule = module {
    scope<CheckoutActivity> {
        scopedOf(::CheckoutSession)
        fragmentOf(::PaymentFragment)
    }
}
```

```kotlin
class CheckoutActivity : ScopeActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        setupKoinFragmentFactory(scope)
        super.onCreate(savedInstanceState)
    }
}
```

配合作用域使用時，工廠會先從該作用域解析 Fragment，接著再從根作用域解析。在這種情況下，不需要在 `startKoin` 中呼叫 `fragmentFactory()`：該選項僅用於宣告無引數呼叫 `setupKoinFragmentFactory()` 時所使用的全域工廠。關於 Activity 作用域的說明，請參閱 [Android 作用域](/docs/reference/koin-android/scope)。

## 相關內容 {id="related"}

- [Android 入口點](/docs/reference/koin-android/entry-points)：在 Fragment 中使用 `by inject()` 進行注入。
- [Android 作用域](/docs/reference/koin-android/scope)：Activity 與 Fragment 作用域。
- [定義](/docs/reference/koin-core/definitions)：`factory` 與其他定義型別。
- [AndroidX Fragment 指南](https://developer.android.com/guide/fragments)：Fragment API。