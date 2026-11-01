---
title: 進階模式
---

# 進階模式

本頁介紹超越「每個定義對應一個類別」的模式：實作集合、泛型型別、執行時期物件的提供者，以及裝飾器。本文假設你已了解[定義](/docs/reference/koin-core/definitions)與[限定詞](/docs/reference/koin-core/qualifiers)。關於來自程式庫的類別（Retrofit、Room、OkHttp），請參閱[你不擁有的類別](/docs/reference/koin-core/definitions#classes-you-dont-own)。

## 相依性集合 {id="collections-of-dependencies"}

若要注入某個介面的所有實作，請將每個實作繫結至該介面，並請求一個 `List`：

**編譯器外掛程式 DSL**
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

**註解**
```kotlin
interface PaymentProcessor {
    fun process(amount: Double): Boolean
}

// 自動繫結至 PaymentProcessor
@Singleton
class CreditCardProcessor : PaymentProcessor { ... }

@Singleton
class PayPalProcessor : PaymentProcessor { ... }

@Singleton
class PaymentManager(private val processors: List<PaymentProcessor>)
```

**建構函式 / 傳統 DSL**
```kotlin
val paymentModule = module {
    singleOf(::CreditCardProcessor) bind PaymentProcessor::class
    singleOf(::PayPalProcessor) bind PaymentProcessor::class
    single { PaymentManager(getAll()) }
}
```

`List<T>` 參數會透過 `getAll<T>()` 解析：包含型別本身或其繫結型別之一為 `T` 的每個定義（無論是否帶限定詞）。在建構函式之外，可在 `Scope` 或 `getKoin()` 上呼叫 `getAll<PaymentProcessor>()`。

需注意的行為：

- **空清單**：若沒有任何項目繫結至 `T`，則清單為空。這不會引發錯誤，編譯器外掛程式也不會針對 `List<T>` 參數回報缺少相依性。
- **無保證順序**：請勿依賴清單的順序。如果順序重要，請自行排序，例如透過介面上的 `priority` 屬性。
- **僅限目前作用域**：從作用域執行個體呼叫時，`getAll` 會傳回該作用域及其連結作用域（包含根作用域）的定義。
- **單一查閱**：`get<PaymentProcessor>()` 仍僅傳回繫結定義中的其中一個（最後載入的那一個）。若要指定挑選某一個，請為每個定義加上[限定詞](/docs/reference/koin-core/qualifiers)。
- **嚴格覆寫**：在 `allowOverride(false)` 的情況下，若在兩個不同的模組中繫結同一個介面且未加上限定詞，會在啟動時因 `DefinitionOverrideException` 失敗。請為每個繫結加上限定詞。

當你同時需要清單與特定實作時，請結合繫結與限定詞。使用編譯器外掛程式 DSL 與註解時，請在類別上標註 `@Named`：

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

## 泛型型別 {id="generic-types"}

Koin 透過類別與限定詞來識別定義。型別引數會被抹除：`Repository<User>` 與 `Repository<Product>` 具有相同的索引鍵 `Repository`。同一個泛型類別的兩個定義會互相覆寫，且編譯器外掛程式會將它們視為同一個進行驗證。

```kotlin
// 無法運作：第二個定義會覆寫第一個定義
val repositoryModule = module {
    single<Repository<User>> { UserRepository() }
    single<Repository<Product>> { ProductRepository() }
}
```

請改用以下其中一種方式：

- **具體型別**：直接注入 `UserRepository` 與 `ProductRepository`。每個類別本身就是獨立的索引鍵。
- **限定詞**：保留泛型介面，並使用限定詞來區分不同的定義。

**編譯器外掛程式 DSL**
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

**註解**
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

**建構函式 / 傳統 DSL**
```kotlin
val repositoryModule = module {
    single<Repository<User>>(named<User>()) { UserRepository() }
    single<Repository<Product>>(named<Product>()) { ProductRepository() }
    single { UserService(get(named<User>())) }
}
```

`named<User>()` 是從 `User` 類別建置的型別限定詞。`@Qualifier(User::class)` 是其註解形式。

## 提供者模式 {id="provider-pattern"}

某些物件所需的數值僅在執行時期存在：標題、回呼函式、使用者的選擇。與其每次都從 Koin 解析它們，不如注入一個負責建立它們的提供者類別：

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

如同宣告任何類別一樣宣告 `DialogProvider`（`factory<DialogProvider>()`、`@Factory` 或 `factoryOf(::DialogProvider)`）。提供者從 Koin 取得其相依性，建立的物件則從呼叫端取得其執行時期數值。

對於在呼叫點已知且建構函式所需的數值，[注入參數](/docs/reference/koin-core/injection-parameters)是較簡單的選擇。若執行個體建立成本高昂且非隨時需要，請注入 `Lazy<T>`：請參閱[建構函式參數](/docs/reference/koin-core/definitions#constructor-parameters)。

## 裝飾器模式 {id="decorator-pattern"}

裝飾器會包裝一個實作以增加行為（記錄日誌、快取、速率限制），並公開相同的介面。Koin 沒有專門的 decorator 關鍵字：請將內部實作註冊在其本身的型別下，並將介面繫結至外層裝飾器。

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

**編譯器外掛程式 DSL**
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

**註解**
```kotlin
@Module
class NotificationModule {

    @Singleton
    fun notifications(push: PushNotificationService, logger: Logger): NotificationService =
        LoggingNotificationService(push, logger)
}
```

使用 `@Singleton(binds = [])` 宣告 `PushNotificationService`，這樣它就不會同時被繫結至 `NotificationService`。

**建構函式 / 傳統 DSL**
```kotlin
val notificationModule = module {
    singleOf(::Logger)
    singleOf(::PushNotificationService)
    single<NotificationService> {
        LoggingNotificationService(delegate = get<PushNotificationService>(), logger = get())
    }
}
```

使用端請求 `NotificationService` 並取得裝飾後的執行個體。若要疊加多個裝飾器，請在同一個函式中將它們巢狀組合：`RateLimitedNotificationService(LoggingNotificationService(push, logger), limiter)`。

內部實作絕不可同時繫結至該介面。否則將有兩個定義對應到 `NotificationService`，且其中一個會覆寫另一個。

## 相關內容 {id="related"}

- [定義](/docs/reference/koin-core/definitions)：定義型別、繫結、你不擁有的類別。
- [限定詞](/docs/reference/koin-core/qualifiers)：`named()`、型別限定詞與 `@Named`。
- [注入參數](/docs/reference/koin-core/injection-parameters)：解析時傳遞的執行時期數值。
- [注入](/docs/reference/koin-core/injection)：建構函式之外的 `get()`、`getAll()`、`inject()`。
- [疑難排解](/docs/reference/koin-core/troubleshooting)：覆寫與遺失定義錯誤。