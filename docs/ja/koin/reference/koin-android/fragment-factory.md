---
title: Fragment Factory
---

# Fragment Factory

デフォルトでは、Androidは空のコンストラクタを使用してFragmentを生成するため、`by inject()` を使用して依存関係を注入します（[Android Entry Points](/docs/reference/koin-android/entry-points) を参照）。AndroidXの [FragmentFactory](https://developer.android.com/reference/kotlin/androidx/fragment/app/FragmentFactory) を使用すると、Koin自体がFragmentを生成し、そのコンストラクタに依存関係を渡すようになります。このページでは、セットアップ、`fragment` 定義、およびActivityスコープからのFragmentについて説明します。

`fragment` 定義は `io.insert-koin:koin-android` に含まれています。他のアーティファクトは不要です。

## セットアップ {id="setup"}

`startKoin` でKoinのFragment Factoryを有効にします:

```kotlin
import org.koin.androidx.fragment.koin.fragmentFactory

startKoin {
    androidContext(this@MainApplication)
    fragmentFactory()
    modules(appModule)
}
```

次に、これらのFragmentをホストする各Activityの `super.onCreate()` の前で、ファクトリを設定します:

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

`super.onCreate()` は、画面回転やプロセスキル（process death）後にFragmentを復元します。その前にファクトリを設定しておく必要があります。設定されていない場合、Androidはデフォルトのファクトリを使用するため、空のコンストラクタを持たないFragmentで失敗します。

## Fragmentの宣言 {id="declaring-a-fragment"}

**Compiler Plugin DSL**
Compiler Plugin DSLには `fragment<T>()` 関数がありません。同じモジュール内でClassic DSLの `fragment { }` またはConstructor DSLの `fragmentOf()` を使用してください:

```kotlin
class UserFragment(private val repository: UserRepository) : Fragment()

val uiModule = module {
    single<UserRepository>()
    fragmentOf(::UserFragment)
}
```

**Annotations**
Fragment用のアノテーションはありません。アノテーションを付けたクラスと並べて、DSLモジュール内でFragmentを宣言してください（[DSL Reference](/docs/reference/koin-core/dsl) を参照）:

```kotlin
val uiModule = module {
    fragmentOf(::UserFragment)
}
```

**Constructor / Classic DSL**
```kotlin
import org.koin.androidx.fragment.dsl.fragment
import org.koin.androidx.fragment.dsl.fragmentOf

class UserFragment(private val repository: UserRepository) : Fragment()

val uiModule = module {
    singleOf(::UserRepository)
    fragmentOf(::UserFragment)

    // またはコンストラクタ呼び出しを記述
    fragment { UserFragment(get()) }
}
```

`fragment` 定義は `factory` です。トランザクションごとに新しいFragmentインスタンスが取得されます。Fragmentクラスに一致する定義がない場合、KoinファクトリはデフォルトのAndroidXの動作にフォールバックします。

## Fragmentの追加 {id="adding-a-fragment"}

`FragmentTransaction` のreified拡張関数 `replace` を使用します:

```kotlin
import org.koin.androidx.fragment.android.replace

supportFragmentManager.beginTransaction()
    .replace<UserFragment>(R.id.container)
    .commit()
```

引数（arguments）とタグを指定する場合:

```kotlin
supportFragmentManager.beginTransaction()
    .replace<UserFragment>(
        containerViewId = R.id.container,
        args = bundleOf("USER_ID" to "42"),
        tag = "user",
    )
    .commit()
```

インスタンスごとの値はコンストラクタではなく `args` で渡してください。Androidはファクトリを通じてFragmentを再生成し、引数（arguments）のみが復元されます。

## ActivityスコープからのFragment {id="fragments-from-an-activity-scope"}

ActivityスコープのインスタンスをFragmentに渡すには、スコープ内でFragmentを宣言し、そのスコープを `setupKoinFragmentFactory()` に渡します:

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

スコープを指定すると、ファクトリはそのスコープからFragmentを解決し、その後にルートスコープから解決します。この場合、`startKoin` 内で `fragmentFactory()` を呼び出す必要はありません。そのオプションは引数なしの `setupKoinFragmentFactory()` で使用されるグローバルファクトリを宣言するだけです。Activityスコープの詳細については [Android Scopes](/docs/reference/koin-android/scope) を参照してください。

## 関連情報 {id="related"}

- [Android Entry Points](/docs/reference/koin-android/entry-points): `by inject()` によるFragmentへの注入。
- [Android Scopes](/docs/reference/koin-android/scope): ActivityおよびFragmentのスコープ。
- [Definitions](/docs/reference/koin-core/definitions): `factory` およびその他の定義タイプ。
- [AndroidX Fragments guide](https://developer.android.com/guide/fragments): Fragment APIのガイド。