---
title: 註解參考指南
---

# 註解參考指南

本頁列出了所有 Koin 註解，包含其所屬套件、可放置的位置、參數以及範例。每個條目均附有連結，指向說明該概念的頁面。若要設定註解，請參閱[編譯器外掛程式設定](/docs/setup/compiler-plugin)。若要將註解與 DSL 進行比較，請參閱[選擇你的風格](/docs/intro/choosing-your-style)。

這些註解來自 `io.insert-koin:koin-annotations` 構件（版本與 Koin 相同）。Koin 編譯器外掛程式會在建置時期讀取它們並產生定義。大多數註解位於 `org.koin.core.annotation`，僅限 Android 的註解則位於 `org.koin.android.annotation`。

## 速查一覽 {id="at-a-glance"}

| 註解 | 套件 | 宣告內容 |
|------------|---------|----------|
| [`@Singleton` / `@Single`](#singleton--single) | `org.koin.core.annotation` | 一個 `single` 定義 |
| [`@Factory`](#factory) | `org.koin.core.annotation` | 一個 `factory` 定義 |
| [`@Scoped`](#scoped) | `org.koin.core.annotation` | 一個 `scoped` 定義 |
| [`@KoinViewModel`](#koinviewmodel) | `org.koin.core.annotation` | 一個 `viewModel` 定義 |
| [`@KoinWorker`](#koinworker) | `org.koin.android.annotation` | 一個 WorkManager `worker` 定義 |
| [`@Scope`](#scope) | `org.koin.core.annotation` | 定義所屬的作用域 |
| [`@ViewModelScope`](#viewmodelscope) | `org.koin.core.annotation` | ViewModel 作用域內的定義 |
| [`@ActivityScope`](#activityscope) | `org.koin.android.annotation` | Activity 作用域內的定義 |
| [`@ActivityRetainedScope`](#activityretainedscope) | `org.koin.android.annotation` | 保留型 Activity 作用域內的定義 |
| [`@FragmentScope`](#fragmentscope) | `org.koin.android.annotation` | Fragment 作用域內的定義 |
| [`@ScopeId`](#scopeid) | `org.koin.core.annotation` | 從給定作用域解析的參數 |
| [`@Named`](#named) | `org.koin.core.annotation` | 字串限定詞 |
| [`@Qualifier`](#qualifier) | `org.koin.core.annotation` | 型別或字串限定詞 |
| [`@InjectedParam`](#injectedparam) | `org.koin.core.annotation` | 由呼叫方傳遞的參數 |
| [`@Property`](#property) | `org.koin.core.annotation` | 從 Koin 屬性讀取的參數 |
| [`@PropertyValue`](#propertyvalue) | `org.koin.core.annotation` | 屬性的預設值 |
| [`@Provided`](#provided) | `org.koin.core.annotation` | 在受檢查圖譜之外提供的型別 |
| [`@Module`](#module) | `org.koin.core.annotation` | 模組類別 |
| [`@ComponentScan`](#componentscan) | `org.koin.core.annotation` | 要掃描以尋找定義的套件 |
| [`@Configuration`](#configuration) | `org.koin.core.annotation` | 模組的配置標籤 |
| [`@KoinApplication`](#koinapplication) | `org.koin.core.annotation` | 應用程式入口點 |
| [`@Monitor`](#monitor) | `org.koin.core.annotation` | 由 Kotzilla SDK 追蹤的函式 |

## 定義 (Definitions) {id="definitions"}

定義註解可放置於類別上（Koin 會呼叫其建構函式）或函式上（Koin 會呼叫頂層函式或 `@Module` 類別內部的函式）。建構函式與函式參數會從容器中解析。關於每種參數型別的解析方式，請參閱：[定義](/docs/reference/koin-core/definitions#constructor-parameters)。

當 `binds` 為空時，該定義會繫結到其自身類別及其所有超型別。若只想繫結特定型別，請在 `binds` 中列出。

### @Singleton / @Single {id="singleton-single"}

目標：`CLASS`, `FUNCTION`

| 參數 | 型別 | 預設值 | 說明 |
|-----------|------|---------|-------------|
| `binds` | `Array<KClass<*>>` | `[]` | 要繫結的型別。為空時繫結所有超型別 |
| `createdAtStart` | `Boolean` | `false` | 在 Koin 啟動時建立執行個體 |

```kotlin
@Singleton(binds = [UserRepository::class])
class UserRepositoryImpl(private val api: ApiService) : UserRepository
```

`@Singleton` 與 `@Single` 是等價的；建議優先使用符合 JSR-330 名稱的 `@Singleton`。在容器的生命週期內僅會保留一個執行個體。概念說明：[定義](/docs/reference/koin-core/definitions)。

### @Factory {id="factory"}

目標：`CLASS`, `FUNCTION`

| 參數 | 型別 | 預設值 | 說明 |
|-----------|------|---------|-------------|
| `binds` | `Array<KClass<*>>` | `[]` | 要繫結的型別。為空時繫結所有超型別 |

```kotlin
@Factory
class UserPresenter(private val repository: UserRepository)
```

每次請求時都會建立一個新的執行個體。概念說明：[定義](/docs/reference/koin-core/definitions)。

### @Scoped {id="scoped"}

目標：`CLASS`, `FUNCTION`

| 參數 | 型別 | 預設值 | 說明 |
|-----------|------|---------|-------------|
| `binds` | `Array<KClass<*>>` | `[]` | 要繫結的型別。為空時繫結所有超型別 |

```kotlin
@Scope(UserSession::class)
@Scoped
class SessionCache(private val repository: UserRepository)
```

每個作用域一個執行個體，當作用域關閉時釋放。請與 `@Scope` 或作用域原型（`@ViewModelScope`、`@ActivityScope` 等）搭配使用。概念說明：[作用域](/docs/reference/koin-core/scopes)。

### @KoinViewModel {id="koinviewmodel"}

目標：`CLASS`, `FUNCTION`

| 參數 | 型別 | 預設值 | 說明 |
|-----------|------|---------|-------------|
| `binds` | `Array<KClass<*>>` | `[]` | 要繫結的型別。為空時繫結所有超型別 |

```kotlin
@KoinViewModel
class UserViewModel(private val repository: UserRepository) : ViewModel()
```

適用於 Android 與 Compose Multiplatform 目標。類別路徑中必須包含 `io.insert-koin:koin-core-viewmodel`（否則組建將失敗並顯示 `KOIN-A001`）。概念說明：[ViewModel](/docs/reference/koin-core/viewmodel)。

:::note
使用編譯器外掛程式時，`@KoinViewModel` 位於 `org.koin.core.annotation`。KSP 處理器過去使用的是 `org.koin.android.annotation.KoinViewModel`：移轉時請記得更新匯入路徑（請參閱[從 KSP 移轉](/docs/migration/from-ksp-to-compiler-plugin)）。
:::

### @KoinWorker {id="koinworker"}

套件：`org.koin.android.annotation`（僅限 Android）。目標：`CLASS`, `FUNCTION`

| 參數 | 型別 | 預設值 | 說明 |
|-----------|------|---------|-------------|
| `binds` | `Array<KClass<*>>` | `[]` | 要繫結的型別 |

```kotlin
@KoinWorker
class SyncWorker(
    context: Context,
    params: WorkerParameters,
    private val repository: UserRepository,
) : CoroutineWorker(context, params)
```

需要依賴 `io.insert-koin:koin-android-workmanager`（否則組建將失敗並顯示 `KOIN-A002`）。概念說明：[WorkManager](/docs/reference/koin-android/workmanager)。

## 作用域 (Scopes) {id="scopes"}

### @Scope {id="scope"}

目標：`CLASS`, `FUNCTION`

| 參數 | 型別 | 預設值 | 說明 |
|-----------|------|---------|-------------|
| `value` | `KClass<*>` | `Unit::class` | 作用域型別 |
| `name` | `String` | `""` | 作用域名稱（取代型別） |

```kotlin
@Scope(UserSession::class)
class SessionCache(private val repository: UserRepository)

@Scope(name = "checkout")
class CheckoutState
```

將定義置於給定的作用域中。單獨使用時，`@Scope` 會宣告一個 `scoped` 定義。若要選擇其他類型或設定 `binds`，請額外加上 `@Scoped`、`@Factory` 或 `@KoinViewModel`。概念說明：[作用域](/docs/reference/koin-core/scopes)。

### @ViewModelScope {id="viewmodelscope"}

目標：`CLASS`, `FUNCTION`。無參數。

```kotlin
@ViewModelScope
class UserSessionCache(private val repository: UserRepository)
```

在 ViewModel 的作用域中宣告一個作用域定義，它會隨 ViewModel 建立，並在 ViewModel 清除時關閉。概念說明：[作用域](/docs/reference/koin-core/scopes)。

### @ActivityScope {id="activityscope"}

套件：`org.koin.android.annotation`（僅限 Android）。目標：`CLASS`, `FUNCTION`。無參數。

```kotlin
@ActivityScope
class ScreenTracker(private val analytics: Analytics)
```

在 Activity 作用域中宣告一個作用域定義。Activity 必須提供該作用域（請參閱 [Android 作用域](/docs/reference/koin-android/scope)）。

### @ActivityRetainedScope {id="activityretainedscope"}

套件：`org.koin.android.annotation`（僅限 Android）。目標：`CLASS`, `FUNCTION`。無參數。

```kotlin
@ActivityRetainedScope
class FormState
```

在保留型 Activity 作用域中宣告一個作用域定義，該作用域在組態變更時仍會保留。請參閱 [Android 作用域](/docs/reference/koin-android/scope)。

### @FragmentScope {id="fragmentscope"}

套件：`org.koin.android.annotation`（僅限 Android）。目標：`CLASS`, `FUNCTION`。無參數。

```kotlin
@FragmentScope
class ListAdapterFactory
```

在 Fragment 作用域中宣告一個作用域定義。請參閱 [Android 作用域](/docs/reference/koin-android/scope)。

### @ScopeId {id="scopeid"}

目標：`VALUE_PARAMETER`

| 參數 | 型別 | 預設值 | 說明 |
|-----------|------|---------|-------------|
| `value` | `KClass<*>` | `Unit::class` | 作用域型別。作用域 ID 為該類別的完整類名 |
| `name` | `String` | `""` | 作用域 ID |

```kotlin
@Factory
class ProfileService(@ScopeId(name = "user_session") val session: UserSession)
```

從具有該 ID 的作用域解析參數，而非從當前作用域解析（產生的程式碼類似 `getScope("user_session").get()`）。編譯期安全不會檢查此項目，因為該作用域僅在執行階段存在。概念說明：[作用域](/docs/reference/koin-core/scopes)。

## 限定詞 (Qualifiers) {id="qualifiers"}

### @Named {id="named"}

目標：`CLASS`, `FUNCTION`, `VALUE_PARAMETER`

| 參數 | 型別 | 預設值 | 說明 |
|-----------|------|---------|-------------|
| `value` | `String` | `""` | 字串限定詞 |
| `type` | `KClass<*>` | `Unit::class` | 型別限定詞。搭配編譯器外掛程式時，請改用 `@Qualifier(Type::class)` |

```kotlin
@Singleton
@Named("local")
class LocalDatabase : Database

@Singleton
class UserRepository(@Named("local") private val database: Database)
```

定義上與參數上相同的字串會將兩者連結起來。`jakarta.inject.Named` 與 `javax.inject.Named` 的解析方式完全相同。概念說明：[限定詞](/docs/reference/koin-core/qualifiers)。

### @Qualifier {id="qualifier"}

目標：`CLASS`, `FUNCTION`, `VALUE_PARAMETER`

| 參數 | 型別 | 預設值 | 說明 |
|-----------|------|---------|-------------|
| `value` | `KClass<*>` | `Unit::class` | 型別限定詞 |
| `name` | `String` | `""` | 字串限定詞 |

```kotlin
@Singleton
@Qualifier(Remote::class)
class RemoteDataSource : DataSource

@Singleton
class UserRepository(@Qualifier(Remote::class) private val source: DataSource)
```

`@Qualifier` 也可用於標記自訂的限定詞註解。任何標有 `@Qualifier` 或 `@Named`（或 `jakarta.inject.Qualifier`、`javax.inject.Qualifier`）的註解類別都會成為限定詞：

```kotlin
@Qualifier
annotation class IoDispatcher

@Singleton
@IoDispatcher
fun ioDispatcher(): CoroutineDispatcher = Dispatchers.IO
```

不帶引數的自訂限定詞是針對該註解類別的型別限定詞。若帶有字串或列舉引數（例如 `@Dispatcher(AppDispatchers.IO)`），該引數值即為限定詞。概念說明：[限定詞](/docs/reference/koin-core/qualifiers)。

## 參數 (Parameters) {id="parameters"}

### @InjectedParam {id="injectedparam"}

目標：`VALUE_PARAMETER`。無參數。

```kotlin
@Factory
class UserPresenter(@InjectedParam val userId: String, private val repository: UserRepository)

// 呼叫方
val presenter: UserPresenter = get { parametersOf("user-42") }
```

該值來自呼叫點的 `parametersOf(...)`，而非來自容器。編譯期安全會檢查呼叫點傳遞的值數量與型別是否正確（`KOIN-D005`、`KOIN-D006`）。概念說明：[注入參數](/docs/reference/koin-core/injection-parameters)。

### @Property {id="property"}

目標：`VALUE_PARAMETER`

| 參數 | 型別 | 預設值 | 說明 |
|-----------|------|---------|-------------|
| `value` | `String` | 必填 | 屬性索引鍵 |

```kotlin
@Factory
class ApiClient(@Property("api_url") val url: String)
```

使用 `getProperty("api_url")` 解析參數。如果存在具有相同索引鍵的 `@PropertyValue`，它將作為備援值。如果沒有備援值，組建會顯示警告 `KOIN-P001`，且必須在啟動時設定該屬性。概念說明：[屬性](/docs/reference/koin-core/starting-koin#properties)。

### @PropertyValue {id="propertyvalue"}

目標：`FIELD`

| 參數 | 型別 | 預設值 | 說明 |
|-----------|------|---------|-------------|
| `value` | `String` | 必填 | 屬性索引鍵 |

```kotlin
@PropertyValue("api_url")
val defaultApiUrl = "https://api.example.com"

@Factory
class ApiClient(@Property("api_url") val url: String)
```

宣告當未設定該屬性時所使用的預設值（產生的程式碼類似 `getProperty("api_url", defaultApiUrl)`）。

### @Provided {id="provided"}

目標：`CLASS`, `FUNCTION`, `VALUE_PARAMETER`。無參數。

```kotlin
@Singleton
class AnalyticsService(@Provided val firebase: FirebaseAnalytics)
```

告知編譯期安全機制：該型別在執行階段可用，但無其可見的宣告（例如平台物件、SDK、稍後載入的模組）。標記於類別時，會略過該型別的所有使用；標記於參數時，僅略過該參數。執行階段的解析行為保持不變。常見的 Android 型別（`Context`、`Activity`、`Fragment`、`SavedStateHandle`、`WorkerParameters` 等）不需要標記此註解。概念說明：[編譯期安全](/docs/reference/koin-compiler/compile-safety#external-types-provided)。

## 模組與應用程式 {id="modules-and-application"}

### @Module {id="module"}

目標：`CLASS`

| 參數 | 型別 | 預設值 | 說明 |
|-----------|------|---------|-------------|
| `includes` | `Array<KClass<*>>` | `[]` | 要包含的其他 `@Module` 類別 |
| `createdAtStart` | `Boolean` | `false` | 在 Koin 啟動時建立模組的 `single` 定義 |

```kotlin
@Module(includes = [NetworkModule::class])
class DataModule {

    @Singleton
    fun database(context: Context): AppDatabase =
        Room.databaseBuilder(context, AppDatabase::class.java, "app-db").build()
}
```

將各項定義進行分組：包含類別內帶有註解的函式，以及由 `@ComponentScan` 尋找到的帶有註解的類別。概念說明：[模組](/docs/reference/koin-core/modules)。

### @ComponentScan {id="componentscan"}

目標：`CLASS`, `FIELD`

| 參數 | 型別 | 預設值 | 說明 |
|-----------|------|---------|-------------|
| `value` | `vararg String` | 空 | 要掃描的套件。為空時掃描標記註解之類別所在的套件 |

```kotlin
@Module
@ComponentScan("com.myapp.data", "com.myapp.domain")
class AppModule
```

將指定套件及其子套件中所有帶有註解的類別和頂層函式新增到模組中，支援跨 Gradle 模組。概念說明：[模組](/docs/reference/koin-core/modules)。

:::note
編譯器外掛程式會配對套件名稱及其子套件。不支援 KSP 處理器的萬用字元模式（`com.example.**`、`com.*.service`）：請直接列出套件名稱。
:::

### @Configuration {id="configuration"}

目標：`CLASS`, `FIELD`

| 參數 | 型別 | 預設值 | 說明 |
|-----------|------|---------|-------------|
| `value` | `vararg String` | 空 | 配置標籤。為空時代表 `"default"` |

```kotlin
@Module
@ComponentScan
@Configuration
class CoreModule            // 標籤為 "default"

@Module
@Configuration("default", "test")
class FakeDataModule        // 標籤為 "default" 與 "test"
```

`@KoinApplication` 會載入所有帶有其指定配置標籤之一的模組，包含來自其他 Gradle 模組的模組，無需明確列出它們。`@Configuration("default")` 等同於 `@Configuration`。概念說明：[模組](/docs/reference/koin-core/modules)。

### @KoinApplication {id="koinapplication"}

目標：`CLASS`

| 參數 | 型別 | 預設值 | 說明 |
|-----------|------|---------|-------------|
| `configurations` | `Array<String>` | `[]` | 要載入的配置標籤。為空時載入 `"default"` |
| `modules` | `Array<KClass<*>>` | `[Unit::class]` (無) | 額外要載入的 `@Module` 類別 |

```kotlin
@KoinApplication(modules = [AppModule::class])
object MyApp

fun main() {
    startKoin<MyApp> {
        printLogger()
    }
}
```

標記進入點。使用 `startKoin<MyApp>()`、`koinApplication<MyApp>()` 或 `koinConfiguration<MyApp>()`（套件為 `org.koin.plugin.module.dsl`）啟動它。編譯期安全會在此處檢查完整的相依圖譜。來自 `@Configuration` 的模組會先載入，接著依序載入 `modules` 清單，因此在覆寫時以明確指定的清單優先。概念說明：[啟動 Koin](/docs/reference/koin-core/starting-koin)。

## 監控 (Monitoring) {id="monitoring"}

### @Monitor {id="monitor"}

目標：`CLASS`, `FUNCTION`。無參數。

```kotlin
@Monitor
class UserService(private val repository: UserRepository) {
    fun findUser(id: String): User? = repository.findById(id)
}
```

編譯器外掛程式會使用 Kotzilla SDK 追蹤包裝函式主體（或該類別的每個 public 函式）。這需要在類別路徑中包含 Kotzilla SDK（`io.kotzilla:kotzilla-core`）。如果未包含，組建會顯示警告 `KOIN-M001` 且不會追蹤任何內容。設定方式與收集的資料：[Monitor](/docs/tooling/monitor)。

## JSR-330 註解 {id="jsr-330-annotations"}

編譯器外掛程式也能讀取 `jakarta.inject` 與 `javax.inject` 註解：`@Singleton`、`@Named`、`@Inject` 與 `@Qualifier`。請參閱 [JSR-330](/docs/reference/koin-android/jsr330)。

## 已移除的註解 {id="removed-annotations"}

`@ExternalDefinition`、`@MetaDefinition`、`@MetaModule` 與 `@MetaApplication`（套件 `org.koin.meta.annotations`）過去是由 KSP 處理器產生供其內部使用的。編譯器外掛程式不再使用它們，你也不需要手動撰寫它們。

## 相關內容 {id="related"}

- [定義](/docs/reference/koin-core/definitions)：定義型別、繫結、建構函式參數。
- [模組](/docs/reference/koin-core/modules)：`@Module`、`@ComponentScan` 與 `@Configuration` 的實際應用。
- [編譯期安全](/docs/reference/koin-compiler/compile-safety)：外掛程式根據這些註解所檢查的項目。
- [編譯器外掛程式選項](/docs/reference/koin-annotations/options)：該外掛程式的 Gradle 選項。
- [DSL 參考指南](/docs/reference/koin-core/dsl)：每個註解對應的 DSL 等價寫法。