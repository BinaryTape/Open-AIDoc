---
title: KMP 共有パターン
---

# KMP 共有パターン

このページでは、Kotlin Multiplatformプロジェクトにおいてプラットフォームごとに異なる定義を宣言する方法について説明します。これには、`expect`/`actual` を使用したプラットフォームモジュール、`expect`/`actual` クラス、プラットフォームごとに1つの実装を持つインターフェースが含まれます。プロジェクトが [KMP Setup](/docs/reference/koin-core/kmp-setup) に従ってセットアップされていることを前提としています。`expect`/`actual` に関するKotlinのルールについては、[Kotlin ドキュメント](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)を参照してください。

## 共有モジュールの整理 {id="organizing-shared-modules"}

プラットフォームに依存しないものはすべて `commonMain` モジュールに配置し、レイヤー別または機能別に分割して、`includes()` で組み立てます。

```kotlin
// commonMain
val dataModule = module {
    single<ApiClient>()
    single<UserRepository>()
}

val domainModule = module {
    factory<GetUserUseCase>()
}

val appModule = module {
    includes(dataModule, domainModule, platformModule())
}
```

モジュールの構成については [Modules](/docs/reference/koin-core/modules) で説明されています。このページの残りの部分では、プラットフォームごとに異なる部分である `platformModule()` について解説します。

## プラットフォームモジュール {id="platform-module"}

`commonMain` で `expect` を使ってモジュールを宣言し、プラットフォームごとに1つの `actual` を記述します。各プラットフォームモジュールはそれぞれのクラスを宣言します。

**Compiler Plugin DSL**
```kotlin
// commonMain
interface PlatformComponent {
    fun getInfo(): String
}

expect fun platformModule(): Module
```

```kotlin
// androidMain
class AndroidComponent(private val context: Context) : PlatformComponent {
    override fun getInfo() = "Android ${context.packageName}"
}

actual fun platformModule(): Module = module {
    single<AndroidComponent>() bind PlatformComponent::class
}
```

```kotlin
// iosMain
class IOSComponent : PlatformComponent {
    override fun getInfo() = "iOS"
}

actual fun platformModule(): Module = module {
    single<IOSComponent>() bind PlatformComponent::class
}
```

**Annotations**
```kotlin
// commonMain
interface PlatformComponent {
    fun getInfo(): String
}

@Module
expect class PlatformModule
```

```kotlin
// androidMain
@Module
@ComponentScan
actual class PlatformModule

@Singleton
class AndroidComponent(private val context: Context) : PlatformComponent {
    override fun getInfo() = "Android ${context.packageName}"
}
```

```kotlin
// iosMain
@Module
@ComponentScan
actual class PlatformModule

@Singleton
class IOSComponent : PlatformComponent {
    override fun getInfo() = "iOS"
}
```

各 `actual` モジュールは自身のソースセットをスキャンするため、そのプラットフォームのクラスのみを検出します。`@Singleton` はクラスをそのスーパータイプにバインドするため、`PlatformComponent` はプラットフォームのクラスへと解決されます。共通モジュールから `PlatformModule` を含めるには、`@Module(includes = [PlatformModule::class])` を使用します。

**Constructor / Classic DSL**
```kotlin
// commonMain
interface PlatformComponent {
    fun getInfo(): String
}

expect fun platformModule(): Module
```

```kotlin
// androidMain
actual fun platformModule(): Module = module {
    singleOf(::AndroidComponent) bind PlatformComponent::class
}
```

```kotlin
// iosMain
actual fun platformModule(): Module = module {
    singleOf(::IOSComponent) bind PlatformComponent::class
}
```

プラットフォームの実装で異なるコンストラクタパラメータが必要な場合は、このパターンを使用します。共通コードは `PlatformComponent` インターフェースにのみ依存し、各プラットフォームは必要なもの（ここではAndroidの `Context`）を自由に注入できます。Androidでは、起動時に `androidContext()` が設定されると `Context` が解決されます（[KMP Setup](/docs/reference/koin-core/kmp-setup) を参照）。

### プラットフォームライブラリ {id="platform-libraries"}

プラットフォームのドライバやエンジン（SQLDelight、Ktorクライアントエンジン、設定など）は、関数呼び出しによって構築されます。プラットフォームモジュール内でラムダを使用してこれらを宣言します。

```kotlin
// androidMain
actual fun platformModule(): Module = module {
    single<SqlDriver> { AndroidSqliteDriver(AppDatabase.Schema, androidContext(), "app.db") }
    single<HttpClientEngine> { OkHttp.create() }
}

// iosMain
actual fun platformModule(): Module = module {
    single<SqlDriver> { NativeSqliteDriver(AppDatabase.Schema, "app.db") }
    single<HttpClientEngine> { Darwin.create() }
}
```

これにより、共通モジュールはプラットフォームを意識することなく、それらを基盤として構築できます: `single { AppDatabase(get()) }`、`single { HttpClient(get<HttpClientEngine>()) }`。自身が所有していないクラスを宣言するその他の方法については、[Definitions](/docs/reference/koin-core/definitions) を参照してください。

## expect/actual クラス {id="expect-actual-class"}

すべてのプラットフォームでクラスが同じコンストラクタを持つ場合は、共通コードで一度宣言し、各プラットフォームでそれを実装させます。

**Compiler Plugin DSL**
```kotlin
// commonMain
expect class NativeComponent() {
    fun getInfo(): String
}

val nativeComponentModule = module {
    single<NativeComponent>()
}
```

```kotlin
// androidMain
actual class NativeComponent actual constructor() {
    actual fun getInfo() = "Android NativeComponent"
}

// iosMain
actual class NativeComponent actual constructor() {
    actual fun getInfo() = "iOS NativeComponent"
}
```

**Annotations**
```kotlin
// commonMain
@Module
@ComponentScan
class NativeComponentModule

@Singleton
expect class NativeComponent() {
    fun getInfo(): String
}
```

```kotlin
// androidMain
@Singleton
actual class NativeComponent actual constructor() {
    actual fun getInfo() = "Android NativeComponent"
}

// iosMain
@Singleton
actual class NativeComponent actual constructor() {
    actual fun getInfo() = "iOS NativeComponent"
}
```

共通の `@Module` クラスのプロバイダ関数を通じて `expect` クラスを宣言することもできます。

```kotlin
// commonMain
@Module
class NativeModule {
    @Factory
    fun nativeComponent(): NativeComponent = NativeComponent()
}
```

**Constructor / Classic DSL**
```kotlin
// commonMain
expect class NativeComponent() {
    fun getInfo(): String
}

val nativeComponentModule = module {
    singleOf(::NativeComponent)
}
```

`actual` クラスは他のタブと同様です。

`expect` クラスは、すべてのプラットフォームに対して単一のコンストラクタ規約を持ちます。あるプラットフォームで別の依存関係（例えばAndroidの `Context`）が必要な場合、そのプラットフォームにのみ追加することはできません。代わりに、インターフェースを使用した[プラットフォームモジュール](#platform-module)パターン、またはプラットフォームラッパー（[KMP Platform Integration](/docs/reference/koin-mp/kmp) を参照）を使用してください。

## 単一プラットフォームのみのコンポーネント {id="components-on-one-platform-only"}

プラットフォームモジュールは、特定のプラットフォームにのみ存在し、他の場所には存在しないクラスを宣言できます。他のプラットフォームは空のモジュールのままにしておきます。

**Compiler Plugin DSL**
```kotlin
// androidMain
actual fun platformModule(): Module = module {
    single<NotificationHelper>()
}

// iosMain
actual fun platformModule(): Module = module { }
```

**Annotations**
```kotlin
// androidMain
@Module
@ComponentScan("com.example.app.android")
actual class PlatformModule

// iosMain: 宣言なし
@Module
actual class PlatformModule
```

**Constructor / Classic DSL**
```kotlin
// androidMain
actual fun platformModule(): Module = module {
    singleOf(::NotificationHelper)
}

// iosMain
actual fun platformModule(): Module = module { }
```

これにより、Androidのコードのみが `NotificationHelper` を使用できるようになります。このクラスは `commonMain` に存在しないため、共通コードから参照することはできません。

## パターンの選択 {id="choosing-a-pattern"}

| 状況 | パターン |
|-----------|---------|
| すべてのプラットフォームで同じコンストラクタ | `expect`/`actual` クラス |
| プラットフォームごとにコンストラクタパラメータが異なる | 共通コード内のインターフェース、プラットフォームモジュール内の実装 |
| 関数で構築されるプラットフォームライブラリ（ドライバ、エンジン） | プラットフォームモジュール内のラムダ |
| 1つのプラットフォームにのみ存在するクラス | プラットフォームモジュール（他のプラットフォームでは空） |
| 共有コードでAndroidの `Context` が必要 | プラットフォームラッパー（[KMP Platform Integration](/docs/reference/koin-mp/kmp) を参照） |

## 制限事項 {id="limits"}

- **手動での依存関係解決（Manual wiring）**: プロバイダ関数がKoinの `Scope` を受け取り、自身で `scope.get()` を呼び出す場合、その呼び出しは動的となり、[コンパイル時安全性（compile-time safety）](/docs/reference/koin-compiler/compile-safety)の対象外となります。コンストラクタパラメータの使用を推奨します。
- **テスト**: 共有モジュールは `commonTest` でテストできます。[Testing](/docs/reference/koin-test/testing) を参照してください。

## 関連情報 {id="related"}

- [KMP Setup](/docs/reference/koin-core/kmp-setup): 依存関係と共有の `initKoin` 関数。
- [KMP Platform Integration](/docs/reference/koin-mp/kmp): 共有コードでのAndroid Context、Swiftとの相互運用性、デスクトップおよびWeb。
- [Modules](/docs/reference/koin-core/modules): `includes()`、`@Module`、`@ComponentScan`、`@Configuration`。
- [Definitions](/docs/reference/koin-core/definitions): バインディング、プロバイダ関数、自身が所有していないクラス。
- [ViewModel](/docs/reference/koin-core/viewmodel): `commonMain` で宣言されたViewModel。