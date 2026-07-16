---
title: 고급 안드로이드 패턴
---

이 가이드는 Koin을 사용한 안드로이드 전용 고급 의존성 주입(dependency injection) 패턴을 다룹니다.

:::info
플랫폼에 독립적인 패턴(컬렉션, 데코레이터, 제네릭 타입, 순환 의존성)에 대해서는 [정의(Definitions)](/docs/reference/koin-core/definitions) 및 [모듈(Modules)](/docs/reference/koin-core/modules)을 참조하세요.
:::

## 싱글톤에서의 안드로이드 컨텍스트(Context)

### Activity 누수 방지

```kotlin
// ❌ 나쁨 - 싱글톤을 통한 Activity 누수 발생
module {
    single { SomeService(get<Activity>()) }
}

// ✅ 좋음 - Application 컨텍스트 사용
module {
    single { SomeService(androidContext()) }
}

// ✅ 좋음 - Activity에 종속된 의존성에는 scoped 사용
module {
    activityScope {
        scoped { ActivityBoundService() }
    }
}
```

### 컨텍스트 타입

```kotlin
module {
    // Application 컨텍스트 - 싱글톤에 안전함
    single { DatabaseHelper(androidContext()) }

    // Application 인스턴스
    single { AppConfig(androidApplication()) }
}
```

## BuildConfig를 이용한 조건부 바인딩

### 빌드 변리언트(Build Variant)

```kotlin
fun createLogger(): Logger =
    if (BuildConfig.DEBUG) DebugLogger() else ReleaseLogger()

val loggingModule = module {
    single { create(::createLogger) }
}
```

또는 어노테이션 사용 시:

```kotlin
@Module
class LoggingModule {
    @Single
    fun provideLogger(): Logger =
        if (BuildConfig.DEBUG) DebugLogger() else ReleaseLogger()
}
```

### 애널리틱스 토글

```kotlin
fun createAnalyticsService(): AnalyticsService =
    if (BuildConfig.ENABLE_ANALYTICS) GoogleAnalytics() else NoOpAnalytics()

val analyticsModule = module {
    single { create(::createAnalyticsService) }
}
```

### 피처 플래그(Feature Flags)

```kotlin
@Singleton
class PaymentProcessor(
    private val featureFlags: FeatureFlagService,
    private val newProcessor: NewPaymentProcessor,
    private val legacyProcessor: LegacyPaymentProcessor
) {
    fun process(amount: Double) {
        if (featureFlags.isEnabled("new_payment_flow")) {
            newProcessor.process(amount)
        } else {
            legacyProcessor.process(amount)
        }
    }
}
```

## 안드로이드 Dialog 프로바이더

안드로이드 UI 컴포넌트를 위한 팩토리를 생성합니다:

```kotlin
@Factory
class DialogProvider(private val context: Context) {

    fun createConfirmDialog(title: String, onConfirm: () -> Unit): AlertDialog =
        AlertDialog.Builder(context)
            .setTitle(title)
            .setPositiveButton("OK") { _, _ -> onConfirm() }
            .create()

    fun createErrorDialog(message: String): AlertDialog =
        AlertDialog.Builder(context)
            .setTitle("Error")
            .setMessage(message)
            .setPositiveButton("OK", null)
            .create()
}

class MainActivity : AppCompatActivity() {
    private val dialogProvider: DialogProvider by inject()

    fun showConfirmation() {
        dialogProvider.createConfirmDialog("Confirm") { /* action */ }.show()
    }
}
```

## 계층적 스코프(Hierarchical Scopes)

공유 액세스를 위해 안드로이드 스코프를 연결합니다:

```kotlin
val appModule = module {
    single { Database() }

    scope(named("session")) {
        scoped { UserSession() }
    }

    scope(named("shopping")) {
        scoped { ShoppingCart(get()) }
    }
}

// 스코프 생성 및 연결
val sessionScope = getKoin().createScope("user_session", named("session"))
val shoppingScope = getKoin().createScope("cart", named("shopping"))
shoppingScope.linkTo(sessionScope)

// 장바구니는 연결된 스코프에서 UserSession에 접근 가능
val cart = shoppingScope.get<ShoppingCart>()
```

## 동적 피처 레지스트리(Dynamic Feature Registry)

설정을 기반으로 컬렉션을 빌드합니다:

```kotlin
@Singleton
class FeatureRegistry(private val config: AppConfig) : KoinComponent {

    fun getEnabledFeatures(): `List<Feature>` {
        return config.enabledFeatures.mapNotNull { name ->
            getKoin().getOrNull<Feature>(named(name))
        }
    }
}
```

## 흔한 안드로이드 실수(Pitfalls)

### 숨겨진 순환 호출

```kotlin
// ⚠️ Lazy는 순환을 숨기지만 런타임에 무한 루프가 발생합니다
class ServiceA : KoinComponent {
    private val serviceB: ServiceB by inject()
    fun doA() { serviceB.doB() }
}

class ServiceB : KoinComponent {
    private val serviceA: ServiceA by inject()
    fun doB() { serviceA.doA() }  // 무한 루프!
}
```

### ViewModel 스코프 혼동

```kotlin
// ❌ 나쁨 - Activity 스코프 내의 ViewModel은 회전 시 상태를 잃음
module {
    activityScope {
        scoped { UserViewModel(get()) }
    }
}

// ✅ 좋음 - 올바른 생명주기를 위해 viewModel 사용
module {
    viewModel { UserViewModel(get()) }
}
```

### 싱글톤에 Activity 주입

```kotlin
// ❌ 메모리 누수 - 싱글톤 내 Activity 참조
@Singleton
class ImageLoader(private val activity: Activity)

// ✅ Application 컨텍스트 사용
@Singleton
class ImageLoader(private val context: Context)  // androidContext()를 통한 Application 컨텍스트
```

## 다음 단계

- **[안드로이드 스코프](/docs/reference/koin-android/scope)** - 생명주기 인식 스코핑
- **[멀티 모듈 앱](/docs/reference/koin-android/multi-module)** - 안드로이드 모듈 구성
- **[베스트 프랙티스](/docs/reference/koin-android/best-practices)** - 메모리 관리 및 마이그레이션