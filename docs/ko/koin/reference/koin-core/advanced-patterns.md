---
title: 고급 패턴
---

# 고급 패턴

이 페이지에서는 정의(definition)당 하나의 클래스를 사용하는 것 이상의 패턴들을 다룹니다: 구현체 컬렉션, 제네릭 타입, 런타임 객체를 위한 프로바이더, 데코레이터. [정의](/docs/reference/koin-core/definitions)와 [한정자(qualifiers)](/docs/reference/koin-core/qualifiers)에 대해 알고 있다고 가정합니다. 라이브러리 클래스(Retrofit, Room, OkHttp)에 대해서는 [직접 소유하지 않은 클래스](/docs/reference/koin-core/definitions#classes-you-dont-own)를 참고하세요.

## 의존성 컬렉션 {id="collections-of-dependencies"}

인터페이스의 모든 구현체를 주입하려면, 각 구현체를 인터페이스에 바인딩하고 `List`로 요청합니다:

**Compiler Plugin DSL**
```kotlin
interface PaymentProcessor {
    fun process(amount: Double): Boolean
}

class CreditCardProcessor : PaymentProcessor { ... }
class PayPalProcessor : PaymentProcessor { ... }

class PaymentManager(private val processors: List<PaymentProcessor>)

val paymentModule = module {
    single<CreditCardProcessor>() bind PaymentProcessor::class
    single<PayPalProcessor>() bind PaymentProcessor::class
    single<PaymentManager>()
}
```

**Annotations**
```kotlin
interface PaymentProcessor {
    fun process(amount: Double): Boolean
}

// PaymentProcessor에 자동으로 바인딩됨
@Singleton
class CreditCardProcessor : PaymentProcessor { ... }

@Singleton
class PayPalProcessor : PaymentProcessor { ... }

@Singleton
class PaymentManager(private val processors: List<PaymentProcessor>)
```

**Constructor / Classic DSL**
```kotlin
val paymentModule = module {
    singleOf(::CreditCardProcessor) bind PaymentProcessor::class
    singleOf(::PayPalProcessor) bind PaymentProcessor::class
    single { PaymentManager(getAll()) }
}
```

`List<T>` 파라미터는 `getAll<T>()`로 확인(resolve)됩니다. 한정자 유무와 관계없이 해당 타입 또는 바인딩된 타입 중 하나가 `T`인 모든 정의를 가져옵니다. 생성자 외부에서는 `Scope`나 `getKoin()`에서 `getAll<PaymentProcessor>()`를 호출하세요.

알아두어야 할 동작:

- **빈 리스트**: `T`에 바인딩된 것이 없으면 리스트는 비어 있습니다. 오류가 발생하지 않으며, 컴파일러 플러그인(Compiler Plugin)도 `List<T>` 파라미터에 대해 누락된 의존성으로 보고하지 않습니다.
- **순서 없음**: 리스트의 순서에 의존하지 마세요. 순서가 중요하다면 인터페이스의 `priority` 프로퍼티 등을 기준으로 정렬하세요.
- **현재 스코프만 해당**: 스코프 인스턴스에서 `getAll`을 호출하면 해당 스코프 및 루트(root)를 포함한 연결된 스코프들의 정의를 반환합니다.
- **단일 조회**: `get<PaymentProcessor>()`는 여전히 바인딩된 정의 중 하나(가장 마지막에 로드된 것)만 반환합니다. 특정 정의를 선택하려면 각각에 [한정자](/docs/reference/koin-core/qualifiers)를 부여하세요.
- **엄격한 오버라이드(Strict override)**: `allowOverride(false)`가 설정된 경우, 서로 다른 두 모듈에서 한정자 없이 동일한 인터페이스를 바인딩하면 시작 시 `DefinitionOverrideException`이 발생하며 실패합니다. 각 바인딩에 한정자를 지정하세요.

리스트와 특정 구현체가 둘 다 필요한 경우 바인딩과 한정자를 함께 사용하세요. Compiler Plugin DSL과 애너테이션 방식에서는 클래스에 `@Named`를 지정합니다:

```kotlin
@Named("creditCard")
class CreditCardProcessor : PaymentProcessor { ... }

@Named("paypal")
class PayPalProcessor : PaymentProcessor { ... }

val paymentModule = module {
    single<CreditCardProcessor>() bind PaymentProcessor::class
    single<PayPalProcessor>() bind PaymentProcessor::class
}

class CheckoutService(
    @Named("creditCard") private val defaultProcessor: PaymentProcessor,
    private val allProcessors: List<PaymentProcessor>,
)
```

## 제네릭 타입 {id="generic-types"}

Koin은 클래스와 한정자로 정의를 식별합니다. 타입 인자는 소거(erased)됩니다. 즉, `Repository<User>`와 `Repository<Product>`는 `Repository`라는 동일한 키가 됩니다. 동일한 제네릭 클래스의 두 정의는 서로를 오버라이드하며, 컴파일러 플러그인은 이를 하나로 검증합니다.

```kotlin
// 동작하지 않음: 두 번째 정의가 첫 번째 정의를 오버라이드함
val repositoryModule = module {
    single<Repository<User>> { UserRepository() }
    single<Repository<Product>> { ProductRepository() }
}
```

대신 다음 방법 중 하나를 사용하세요:

- **구체적인 타입(Concrete types)**: `UserRepository`와 `ProductRepository`를 직접 주입합니다. 각 클래스는 고유한 키를 갖습니다.
- **한정자**: 제네릭 인터페이스를 유지하면서 한정자로 정의를 구분합니다.

**Compiler Plugin DSL**
```kotlin
@Qualifier(User::class)
class UserRepository : Repository<User> { ... }

@Qualifier(Product::class)
class ProductRepository : Repository<Product> { ... }

val repositoryModule = module {
    single<UserRepository>() bind Repository::class
    single<ProductRepository>() bind Repository::class
}

class UserService(@Qualifier(User::class) private val repository: Repository<User>)
```

**Annotations**
```kotlin
@Singleton
@Qualifier(User::class)
class UserRepository : Repository<User> { ... }

@Singleton
@Qualifier(Product::class)
class ProductRepository : Repository<Product> { ... }

@Singleton
class UserService(@Qualifier(User::class) private val repository: Repository<User>)
```

**Constructor / Classic DSL**
```kotlin
val repositoryModule = module {
    single<Repository<User>>(named<User>()) { UserRepository() }
    single<Repository<Product>>(named<Product>()) { ProductRepository() }
    single { UserService(get(named<User>())) }
}
```

`named<User>()`는 `User` 클래스로부터 생성된 타입 한정자입니다. `@Qualifier(User::class)`는 이에 해당하는 애너테이션 형태입니다.

## 프로바이더 패턴 {id="provider-pattern"}

일부 객체는 런타임에만 존재하는 값(제목, 콜백, 사용자 선택 등)이 필요합니다. 매번 Koin에서 이를 확인(resolve)하는 대신, 해당 객체를 생성하는 프로바이더 클래스를 주입하세요:

```kotlin
class DialogProvider(private val context: Context) {

    fun confirmDialog(title: String, onConfirm: () -> Unit): AlertDialog =
        AlertDialog.Builder(context)
            .setTitle(title)
            .setPositiveButton("OK") { _, _ -> onConfirm() }
            .create()
}

class SettingsScreen(private val dialogs: DialogProvider) {
    fun askReset() {
        dialogs.confirmDialog("Reset settings?") { reset() }.show()
    }
}
```

일반 클래스와 마찬가지로 `DialogProvider`를 선언하세요(`factory<DialogProvider>()`, `@Factory`, 또는 `factoryOf(::DialogProvider)`). 프로바이더는 Koin으로부터 의존성을 가져오고, 생성된 객체는 호출자로부터 런타임 값을 받습니다.

호출 시점에 알려져 있고 생성자에서 필요한 값의 경우에는 [주입 파라미터](/docs/reference/koin-core/injection-parameters)가 더 간단한 대안입니다. 비용이 많이 들고 항상 필요하지는 않은 인스턴스의 경우에는 `Lazy<T>`를 주입하세요. [생성자 파라미터](/docs/reference/koin-core/definitions#constructor-parameters)를 참고하세요.

## 데코레이터 패턴 {id="decorator-pattern"}

데코레이터는 동작(로깅, 캐싱, 속도 제한 등)을 추가하기 위해 구현체를 감싸면서 동일한 인터페이스를 외부에 노출합니다. Koin에는 데코레이터 전용 키워드가 없습니다. 내부 구현체를 자체 타입으로 등록하고, 외측 데코레이터에 인터페이스를 바인딩하세요.

```kotlin
interface NotificationService {
    fun send(message: String)
}

class PushNotificationService : NotificationService { ... }

class LoggingNotificationService(
    private val delegate: NotificationService,
    private val logger: Logger,
) : NotificationService {
    override fun send(message: String) {
        logger.log("Sending: $message")
        delegate.send(message)
    }
}
```

**Compiler Plugin DSL**
```kotlin
import org.koin.plugin.module.dsl.create

fun loggingNotifications(
    push: PushNotificationService,
    logger: Logger,
): NotificationService = LoggingNotificationService(push, logger)

val notificationModule = module {
    single<Logger>()
    single<PushNotificationService>()
    single { create(::loggingNotifications) }
}
```

**Annotations**
```kotlin
@Module
class NotificationModule {

    @Singleton
    fun notifications(push: PushNotificationService, logger: Logger): NotificationService =
        LoggingNotificationService(push, logger)
}
```

`PushNotificationService`는 `@Singleton(binds = [])`로 선언하여 `NotificationService`에도 함께 바인딩되지 않도록 합니다.

**Constructor / Classic DSL**
```kotlin
val notificationModule = module {
    singleOf(::Logger)
    singleOf(::PushNotificationService)
    single<NotificationService> {
        LoggingNotificationService(delegate = get<PushNotificationService>(), logger = get())
    }
}
```

사용자(Consumer)는 `NotificationService`를 요청하여 데코레이트된 인스턴스를 받습니다. 여러 데코레이터를 중첩하려면 동일한 함수 내에 다음과 같이 중첩하세요: `RateLimitedNotificationService(LoggingNotificationService(push, logger), limiter)`.

내부 구현체 역시 인터페이스에 바인딩되어서는 안 됩니다. 그렇지 않으면 두 개의 정의가 `NotificationService`에 매칭되어 하나가 다른 하나를 오버라이드하게 됩니다.

## 관련 문서 {id="related"}

- [Definitions](/docs/reference/koin-core/definitions): 정의 타입, 바인딩, 직접 소유하지 않은 클래스.
- [Qualifiers](/docs/reference/koin-core/qualifiers): `named()`, 타입 한정자 및 `@Named`.
- [Injected Parameters](/docs/reference/koin-core/injection-parameters): 확인(resolution) 시 전달되는 런타임 값.
- [Injection](/docs/reference/koin-core/injection): 생성자 외부에서의 `get()`, `getAll()`, `inject()`.
- [Troubleshooting](/docs/reference/koin-core/troubleshooting): 오버라이드 및 누락된 정의 오류.