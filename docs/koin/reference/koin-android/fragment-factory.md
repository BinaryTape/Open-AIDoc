---
title: Fragment 工厂
---

# Fragment 工厂

默认情况下，Android 使用其无参构造函数创建 Fragment，因此你需要使用 `by inject()` 注入它们（参见 [Android 入口点](/docs/reference/koin-android/entry-points)）。借助 AndroidX [FragmentFactory](https://developer.android.com/reference/kotlin/androidx/fragment/app/FragmentFactory)，Koin 会自行创建 Fragment 并将依赖项传递给其构造函数。本页涵盖配置方法、`fragment` 定义以及来自 Activity 作用域的 Fragment。

`fragment` 定义是 `io.insert-koin:koin-android` 的一部分。不需要其他构件。

## 配置 {id="setup"}

在 `startKoin` 中启用 Koin 的 Fragment 工厂：

```kotlin
import org.koin.androidx.fragment.koin.fragmentFactory

startKoin {
    androidContext(this@MainApplication)
    fragmentFactory()
    modules(appModule)
}
```

然后，在托管这些 Fragment 的每个 Activity 中，在 `super.onCreate()` 之前安装它：

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

`super.onCreate()` 会在发生屏幕旋转或进程终止后恢复 Fragment。工厂必须在此之前就绪，否则 Android 将使用默认工厂，并在没有空构造函数的 Fragment 上执行失败。

## 声明 Fragment {id="declaring-a-fragment"}

**编译器插件 DSL**
编译器插件 DSL 没有 `fragment<T>()` 函数。请在同一个模块中使用经典 DSL 的 `fragment { }` 或构造函数 DSL 的 `fragmentOf()`：

```kotlin
class UserFragment(private val repository: UserRepository) : Fragment()

val uiModule = module {
    single<UserRepository>()
    fragmentOf(::UserFragment)
}
```

**注解**
不存在针对 Fragment 的注解。请在 DSL 模块中声明该 Fragment，并放置在带注解的类旁边（参见 [DSL 参考](/docs/reference/koin-core/dsl)）：

```kotlin
val uiModule = module {
    fragmentOf(::UserFragment)
}
```

**构造函数 / 经典 DSL**
```kotlin
import org.koin.androidx.fragment.dsl.fragment
import org.koin.androidx.fragment.dsl.fragmentOf

class UserFragment(private val repository: UserRepository) : Fragment()

val uiModule = module {
    singleOf(::UserRepository)
    fragmentOf(::UserFragment)

    // 或者编写构造函数调用
    fragment { UserFragment(get()) }
}
```

`fragment` 定义是一个 `factory`：每个事务都会获取一个新的 Fragment 实例。如果没有与 Fragment 类相匹配的定义，Koin 工厂将回退到默认的 AndroidX 行为。

## 添加 Fragment {id="adding-a-fragment"}

在 `FragmentTransaction` 上使用具体化的 `replace` 扩展：

```kotlin
import org.koin.androidx.fragment.android.replace

supportFragmentManager.beginTransaction()
    .replace<UserFragment>(R.id.container)
    .commit()
```

附带实参与标记：

```kotlin
supportFragmentManager.beginTransaction()
    .replace<UserFragment>(
        containerViewId = R.id.container,
        args = bundleOf("USER_ID" to "42"),
        tag = "user",
    )
    .commit()
```

请在 `args` 中传递每个实例特有的值，而不是在构造函数中传递：Android 会通过工厂重新创建 Fragment，且只有实参会被恢复。

## 来自 Activity 作用域的 Fragment {id="fragments-from-an-activity-scope"}

若要向 Fragment 提供来自其宿主 Activity 作用域的实例，请在该作用域内部声明该 Fragment，并将该作用域传递给 `setupKoinFragmentFactory()`：

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

在指定作用域后，工厂会先从该作用域解析 Fragment，然后再从根作用域解析。在这种情况下，它不需要在 `startKoin` 中调用 `fragmentFactory()`：该选项仅用于声明无实参调用 `setupKoinFragmentFactory()` 时使用的全局工厂。Activity 作用域在 [Android 作用域](/docs/reference/koin-android/scope) 中进行了介绍。

## 相关内容 {id="related"}

- [Android 入口点](/docs/reference/koin-android/entry-points)：在 Fragment 中使用 `by inject()` 进行注入。
- [Android 作用域](/docs/reference/koin-android/scope)：Activity 和 Fragment 作用域。
- [定义](/docs/reference/koin-core/definitions)：`factory` 和其他定义类型。
- [AndroidX Fragment 指南](https://developer.android.com/guide/fragments)：Fragment API。