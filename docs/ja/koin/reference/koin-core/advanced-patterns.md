---
title: 高度なパターン
---

# 高度なパターン (Advanced Patterns)

このページでは、1つの定義につき1つのクラスという構成を超えたパターンを扱います。実装のコレクション、ジェネリック型、ランタイムオブジェクト用のプロバイダ、そしてデコレータなどです。ここでは、[定義](/docs/reference/koin-core/definitions)および[修飾子（Qualifiers）](/docs/reference/koin-core/qualifiers)を理解していることを前提としています。ライブラリ（Retrofit、Room、OkHttpなど）のクラスについては、[独自に所有していないクラス](/docs/reference/koin-core/definitions#classes-you-dont-own)を参照してください。

## 依存関係のコレクション (Collections of dependencies) {id="collections-of-dependencies"}

インターフェースのすべての実装を注入するには、それぞれをそのインターフェースにバインドし、`List` を要求します。

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

// PaymentProcessor に自動的にバインドされます
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

`List<T>` パラメータは `getAll<T>()` を使って解決されます。これにより、修飾子の有無にかかわらず、その型またはバインドされた型の1つが `T` であるすべての定義が取得されます。コンストラクタの外部では、`Scope` または `getKoin()` 上で `getAll<PaymentProcessor>()` を呼び出します。

知っておくべき動作：

- **空のリスト**: `T` にバインドされているものが何もない場合、リストは空になります。エラーは発生せず、Compiler Plugin も `List<T>` パラメータに対する依存関係の欠落を報告しません。
- **順序なし**: リストの順序には依存しないでください。順序が重要な場合は、インターフェースに `priority` プロパティを持たせるなどしてソートしてください。
- **現在のスコープのみ**: スコープインスタンスから呼び出した場合、`getAll` はそのスコープおよびルートを含むリンクされたスコープの定義を返します。
- **単一の検索**: `get<PaymentProcessor>()` は、依然としてバインドされた定義のうち1つ（最後にロードされたもの）のみを返します。いずれかを選択したい場合は、それぞれに[修飾子](/docs/reference/koin-core/qualifiers)を付与してください。
- **厳格なオーバーライド**: `allowOverride(false)` の場合、修飾子なしで同じインターフェースを2つの異なるモジュールでバインドすると、起動時に `DefinitionOverrideException` で失敗します。それぞれのバインディングに修飾子を付与してください。

リストと特定の実装の両方が必要な場合は、バインディングと修飾子を組み合わせます。Compiler Plugin DSL とアノテーションを使用する場合は、クラスに `@Named` を付与します。

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

## ジェネリック型 (Generic types) {id="generic-types"}

Koin はクラスと修飾子によって定義を識別します。型引数は消去（Type Erasure）されるため、`Repository<User>` と `Repository<Product>` は同じキー `Repository` として扱われます。同じジェネリッククラスの2つの定義は互いをオーバーライドし、Compiler Plugin もそれらを同一のものとして検証します。

```kotlin
// 動作しません: 2番目の定義が最初の定義をオーバーライドします
val repositoryModule = module {
    single<Repository<User>> { UserRepository() }
    single<Repository<Product>> { ProductRepository() }
}
```

代わりに以下のいずれかを使用してください。

- **具象型**: `UserRepository` と `ProductRepository` を直接注入します。各クラスがそれぞれ固有のキーになります。
- **修飾子**: ジェネリックインターフェースを維持したまま、修飾子によって定義を区別します。

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

`named<User>()` は `User` クラスから構築された型修飾子です。`@Qualifier(User::class)` はそのアノテーション形式です。

## プロバイダパターン (Provider pattern) {id="provider-pattern"}

一部のオブジェクトは、タイトル、コールバック、ユーザーの選択など、実行時にのみ存在する値を必要とします。これらを毎回 Koin から解決する代わりに、それらを生成するプロバイダクラスを注入します。

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

`DialogProvider` は他の通常のクラスと同様に宣言します（`factory<DialogProvider>()`、`@Factory`、または `factoryOf(::DialogProvider)`）。プロバイダは Koin から依存関係を取得し、生成されたオブジェクトは呼び出し元からランタイム値を受け取ります。

呼び出し側で値が判明しており、それがコンストラクタで必要な場合は、[注入パラメータ (Injected Parameters)](/docs/reference/koin-core/injection-parameters) を使用する方がシンプルです。生成コストが高く、常に必要とは限らないインスタンスには `Lazy<T>` を注入します。[コンストラクタパラメータ](/docs/reference/koin-core/definitions#constructor-parameters)を参照してください。

## デコレータパターン (Decorator pattern) {id="decorator-pattern"}

デコレータは、同じインターフェースを公開しながら、振る舞い（ロギング、キャッシング、レート制限など）を追加するために実装をラップします。Koin にはデコレータ用のキーワードはありません。内部の実装をそれ自体の型で登録し、外側のデコレータにインターフェースをバインドします。

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

`PushNotificationService` を `@Singleton(binds = [])` で宣言し、`NotificationService` にもバインドされてしまわないようにします。

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

コンシューマ（利用者）は `NotificationService` を要求し、デコレートされたインスタンスを受け取ります。複数のデコレータを重ねる場合は、同じ関数内でそれらをネストさせます：`RateLimitedNotificationService(LoggingNotificationService(push, logger), limiter)`。

内部の実装もそのインターフェースにバインドしてはいけません。そうすると、2つの定義が `NotificationService` に該当してしまい、一方がもう一方をオーバーライドしてしまいます。

## 関連情報 {id="related"}

- [Definitions（定義）](/docs/reference/koin-core/definitions): 定義タイプ、バインディング、独自に所有していないクラス。
- [Qualifiers（修飾子）](/docs/reference/koin-core/qualifiers): `named()`、型修飾子、および `@Named`。
- [Injected Parameters（注入パラメータ）](/docs/reference/koin-core/injection-parameters): 解決時に渡されるランタイム値。
- [Injection（注入）](/docs/reference/koin-core/injection): コンストラクタ外部での `get()`、`getAll()`、`inject()`。
- [Troubleshooting（トラブルシューティング）](/docs/reference/koin-core/troubleshooting): オーバーライドや定義不足に関するエラー。