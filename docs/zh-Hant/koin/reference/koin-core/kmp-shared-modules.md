---
title: KMP 共享模式
---

# KMP 共享模式

本頁介紹如何在 Kotlin Multiplatform 專案中宣告因平台而異的定義：包含 `expect`/`actual` 的平台模組、`expect`/`actual` 類別，以及每個平台各有一個實作的介面。本文假設你的專案已依照 [KMP 設定](/docs/reference/koin-core/kmp-setup)完成配置。有關 `expect`/`actual` 的 Kotlin 規則，請參閱 [Kotlin 文件](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)。

## 組織共享模組 {id="organizing-shared-modules"}

將所有不依賴特定平台的內容放入 `commonMain` 模組中，可按分層或按功能劃分，並使用 `includes()` 將它們組合起來：

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

[模組](/docs/reference/koin-core/modules)中介紹了模組組合的詳細說明。本頁其餘部分將針對 `platformModule()` 進行說明：即因平台而異的部分。

## 平台模組 {id="platform-module"}

在 `commonMain` 中使用 `expect` 宣告模組，並為每個平台撰寫一個 `actual`。每個平台模組宣告各自的類別：

**編譯器外掛程式 DSL**
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

**註解**
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

每個 `actual` 模組都會掃描自己的原始碼集，因此只會找到該平台的類別。`@Singleton` 會將該類別繫結至其超型別，因此 `PlatformComponent` 會解析為該平台類別。在通用模組中使用 `@Module(includes = [PlatformModule::class])` 即可引入 `PlatformModule`。

**建構函式 / 經典 DSL**
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

當不同平台的實作需要不同的建構函式參數時，請使用此模式。通用程式碼僅相依於 `PlatformComponent` 介面，而各平台可以自由注入各自需要的相依項（此處以 Android 上的 `Context` 為例）。在 Android 上，一旦在啟動時設定了 `androidContext()`，`Context` 便會解析完成（請參閱 [KMP 設定](/docs/reference/koin-core/kmp-setup)）。

### 平台程式庫 {id="platform-libraries"}

平台驅動程式與引擎（SQLDelight、Ktor 用戶端引擎、設定）是透過函式呼叫建構的。請在平台模組中使用 Lambda 來宣告它們：

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

通用模組隨後便可在無須得知具體平台的情況下基於它們進行建構：`single { AppDatabase(get()) }`、`single { HttpClient(get<HttpClientEngine>()) }`。關於宣告非自身擁有的類別之其他方式，請參閱[定義](/docs/reference/koin-core/definitions)。

## expect/actual 類別 {id="expect-actual-class"}

當類別在所有平台上具有相同的建構函式時，只需在通用程式碼中宣告一次，並讓各個平台進行實作即可：

**編譯器外掛程式 DSL**
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

**註解**
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

你也可以透過通用 `@Module` 類別的提供者函式來宣告 `expect` 類別：

```kotlin
// commonMain
@Module
class NativeModule {
    @Factory
    fun nativeComponent(): NativeComponent = NativeComponent()
}
```

**建構函式 / 經典 DSL**
```kotlin
// commonMain
expect class NativeComponent() {
    fun getInfo(): String
}

val nativeComponentModule = module {
    singleOf(::NativeComponent)
}
```

`actual` 類別與其他標籤頁中的實作相同。

`expect` 類別對所有平台共用同一套建構函式規格。若某個平台需要額外的相依項（例如 Android 的 `Context`），你將無法僅將其新增至該單一平台。此時請改用搭配介面的[平台模組](#platform-module)模式，或是使用平台包裝函式（請參閱 [KMP 平台整合](/docs/reference/koin-mp/kmp)）。

## 僅存在於單一平台的組建 {id="components-on-one-platform-only"}

平台模組可以宣告僅存在於單一平台、在其他平台上不存在的類別。其他平台則保留一個空白模組：

**編譯器外掛程式 DSL**
```kotlin
// androidMain
actual fun platformModule(): Module = module {
    single<NotificationHelper>()
}

// iosMain
actual fun platformModule(): Module = module { }
```

**註解**
```kotlin
// androidMain
@Module
@ComponentScan("com.example.app.android")
actual class PlatformModule

// iosMain: nothing to declare
@Module
actual class PlatformModule
```

**建構函式 / 經典 DSL**
```kotlin
// androidMain
actual fun platformModule(): Module = module {
    singleOf(::NotificationHelper)
}

// iosMain
actual fun platformModule(): Module = module { }
```

這樣一來，便只有 Android 程式碼可以使用 `NotificationHelper`。通用程式碼無法參照它，因為該類別並不存在於 `commonMain` 中。

## 選擇模式 {id="choosing-a-pattern"}

| 情況 | 模式 |
|-----------|---------|
| 每個平台上的建構函式皆相同 | `expect`/`actual` 類別 |
| 每個平台的建構函式參數皆不同 | 通用程式碼中的介面，實作於平台模組 |
| 透過函式建構的平台程式庫（驅動程式、引擎） | 平台模組中的 Lambda |
| 僅存在於單一平台的類別 | 平台模組，其他平台保持空白 |
| 共享程式碼需要 Android `Context` | 平台包裝函式，請參閱 [KMP 平台整合](/docs/reference/koin-mp/kmp) |

## 限制 {id="limits"}

- **手動佈線 (Manual wiring)**：如果提供者函式接收 Koin 的 `Scope` 並自行呼叫 `scope.get()`，該呼叫屬於動態呼叫，不受[編譯期安全性](/docs/reference/koin-compiler/compile-safety)保障。建議優先使用建構函式參數。
- **測試**：共享模組可在 `commonTest` 中進行測試。請參閱[測試](/docs/reference/koin-test/testing)。

## 相關內容 {id="related"}

- [KMP 設定](/docs/reference/koin-core/kmp-setup)：相依性與共享的 `initKoin` 函式。
- [KMP 平台整合](/docs/reference/koin-mp/kmp)：共享程式碼中的 Android Context、Swift 互通性、桌面端與 Web。
- [模組](/docs/reference/koin-core/modules)：`includes()`、`@Module`、`@ComponentScan`、`@Configuration`。
- [定義](/docs/reference/koin-core/definitions)：繫結、提供者函式、非自身擁有的類別。
- [ViewModel](/docs/reference/koin-core/viewmodel)：在 `commonMain` 中宣告的 ViewModel。