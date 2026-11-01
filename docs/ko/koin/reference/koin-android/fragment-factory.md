---
title: Fragment Factory
---

# Fragment Factory

기본적으로 Android는 기본 생성자(empty constructor)를 사용하여 Fragment를 생성하므로, `by inject()`를 통해 의존성을 주입합니다([Android 진입점](/docs/reference/koin-android/entry-points) 참고). AndroidX의 [FragmentFactory](https://developer.android.com/reference/kotlin/androidx/fragment/app/FragmentFactory)를 사용하면 Koin이 직접 Fragment를 생성하고 해당 생성자에 의존성을 전달합니다. 이 페이지에서는 설정 방법, `fragment` 정의, 그리고 Activity 스코프에서 Fragment를 사용하는 방법을 다룹니다.

`fragment` 정의는 `io.insert-koin:koin-android`의 일부입니다. 다른 아티팩트는 필요하지 않습니다.

## 설정 {id="setup"}

`startKoin`에서 Koin의 Fragment Factory를 활성화합니다:

```kotlin
import org.koin.androidx.fragment.koin.fragmentFactory

startKoin {
    androidContext(this@MainApplication)
    fragmentFactory()
    modules(appModule)
}
```

그런 다음 이러한 Fragment를 호스팅하는 각 Activity의 `super.onCreate()` 호출 전에 팩토리를 설정합니다:

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

`super.onCreate()`는 화면 회전이나 프로세스 종료(process death) 후 Fragment를 복원합니다. 팩토리는 그보다 먼저 설정되어 있어야 합니다. 그렇지 않으면 Android가 기본 팩토리를 사용하게 되어 기본 생성자가 없는 Fragment에서 오류가 발생합니다.

## Fragment 선언하기 {id="declaring-a-fragment"}

**컴파일러 플러그인 DSL**
컴파일러 플러그인 DSL에는 `fragment<T>()` 함수가 없습니다. 동일한 모듈에서 클래식 DSL인 `fragment { }` 또는 생성자 DSL인 `fragmentOf()`를 사용하세요:

```kotlin
class UserFragment(private val repository: UserRepository) : Fragment()

val uiModule = module {
    single<UserRepository>()
    fragmentOf(::UserFragment)
}
```

**어노테이션**
Fragment 전용 어노테이션은 없습니다. 어노테이션이 지정된 클래스와 함께 DSL 모듈에 Fragment를 선언하세요([DSL 레퍼런스](/docs/reference/koin-core/dsl) 참고):

```kotlin
val uiModule = module {
    fragmentOf(::UserFragment)
}
```

**생성자 / 클래식 DSL**
```kotlin
import org.koin.androidx.fragment.dsl.fragment
import org.koin.androidx.fragment.dsl.fragmentOf

class UserFragment(private val repository: UserRepository) : Fragment()

val uiModule = module {
    singleOf(::UserRepository)
    fragmentOf(::UserFragment)

    // 또는 생성자 호출을 직접 작성
    fragment { UserFragment(get()) }
}
```

`fragment` 정의는 `factory`입니다. 즉, 트랜잭션마다 새로운 Fragment 인스턴스가 생성됩니다. Fragment 클래스와 일치하는 정의가 없으면 Koin 팩토리는 기본 AndroidX 동작으로 대체(fallback)됩니다.

## Fragment 추가하기 {id="adding-a-fragment"}

`FragmentTransaction`에서 구체화된(reified) `replace` 확장 함수를 사용합니다:

```kotlin
import org.koin.androidx.fragment.android.replace

supportFragmentManager.beginTransaction()
    .replace<UserFragment>(R.id.container)
    .commit()
```

인자(arguments)와 태그를 함께 사용하는 경우:

```kotlin
supportFragmentManager.beginTransaction()
    .replace<UserFragment>(
        containerViewId = R.id.container,
        args = bundleOf("USER_ID" to "42"),
        tag = "user",
    )
    .commit()
```

인스턴스별 값은 생성자가 아닌 `args`를 통해 전달하세요. Android는 팩토리를 통해 Fragment를 재생성하며, 오직 인자(arguments)만이 복원됩니다.

## Activity 스코프의 Fragment {id="fragments-from-an-activity-scope"}

Fragment에 해당 Fragment가 속한 Activity 스코프의 인스턴스를 제공하려면, 스코프 내부에 Fragment를 선언하고 `setupKoinFragmentFactory()`에 해당 스코프를 전달합니다:

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

스코프를 지정하면 팩토리는 해당 스코프에서 Fragment를 먼저 조회한 다음, 루트 스코프에서 조회합니다. 이 경우에는 `startKoin`에서 `fragmentFactory()`를 호출할 필요가 없습니다. 해당 옵션은 인자 없이 호출하는 `setupKoinFragmentFactory()`에서 사용되는 전역 팩토리만 선언하기 때문입니다. Activity 스코프는 [Android 스코프](/docs/reference/koin-android/scope)에서 다룹니다.

## 관련 문서 {id="related"}

- [Android 진입점](/docs/reference/koin-android/entry-points): `by inject()`를 사용하여 Fragment에 주입하기.
- [Android 스코프](/docs/reference/koin-android/scope): Activity 및 Fragment 스코프.
- [정의 (Definitions)](/docs/reference/koin-core/definitions): `factory` 및 기타 정의 유형.
- [AndroidX Fragment 가이드](https://developer.android.com/guide/fragments): Fragment API.