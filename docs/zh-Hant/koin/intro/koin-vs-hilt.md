---
title: Koin vs Hilt
---

# Koin vs Hilt

本頁面針對熟悉其中一種並希望了解另一種的 Android 開發人員，對 Koin 與 Hilt（以及 Hilt 所基於構建的 Dagger）進行比較。內容涵蓋各個架構如何建置相依圖、程式碼外觀，以及各自的優勢所在。若要將專案從 Hilt 遷移至 Koin，請參閱 [Migrating from Hilt](/docs/reference/koin-android/hilt-migration)。

下方的 Koin 範例使用註解，因為這種方式最接近 Hilt。相同的定義也可以使用 Koin DSL 來撰寫（請參閱 [Choosing your style](/docs/intro/choosing-your-style)）。

## 各自如何建置相依圖 {id="how-each-one-builds-the-graph"}

**Hilt** 在建置期透過註解處理（KSP 或 kapt）將相依圖產生為 Java 原始碼。當應用程式編譯時，每個繫結 (binding)、組建 (component) 與作用域 (scope) 都已被確定。在執行階段，應用程式直接呼叫產生的工廠，無需查找。

**Koin** 則將相依圖保存在執行階段容器中。定義會在 Koin 啟動時註冊，並在請求時依型別解析執行個體。配合 [Koin Compiler Plugin](/docs/intro/koin-compiler-plugin)，在 `startKoin` 組裝的相依圖也會在建置期進行檢查，並且該外掛程式會產生建構函式連線程式碼。若沒有此外掛程式，缺失的定義會在執行階段或[驗證測試](/docs/reference/koin-test/verify)中被發現。

這項差異解釋了以下大多數的權衡取捨。

## 一覽表 {id="at-a-glance"}

| 方面 | Koin | Hilt |
|--------|------|------|
| 相依圖建置 | 於執行階段建置，使用 Compiler Plugin 時可在建置期檢查 | 於建置期產生程式碼 |
| 缺少繫結的偵測時機 | 使用 Compiler Plugin 時為建置期，否則於執行階段或測試中偵測 | 一律在建置期偵測 |
| 建置工具 | Kotlin 編譯器外掛程式，若搭配 Constructor 或 Classic DSL 則為可選 | KSP 或 kapt、Hilt Gradle 外掛程式 |
| 支援平台 | Kotlin Multiplatform：Android、iOS、桌面、Web、JVM 伺服器 | Android（僅 Dagger 可獨立運行於 JVM） |
| 支援語言 | Kotlin | Java 與 Kotlin |
| 於執行階段載入或卸載模組 | 支援（`loadKoinModules`、`unloadKoinModules`、延遲載入模組） | 不支援 |
| 組建階層結構 | 根容器加上您宣告的作用域，搭配 Android 作用域原型 | 標準組建的固定階層結構（`SingletonComponent`、`ActivityComponent` 等） |
| Android 入口點 | 在任何 Activity 或 Fragment 中使用 `by inject()`、`by viewModel()` | 在每個類別加上 `@AndroidEntryPoint` |
| Jetpack 整合 | 透過 Koin 程式庫整合 ViewModel、WorkManager、Navigation、Compose | 透過 AndroidX Hilt 程式庫整合 ViewModel、WorkManager、Navigation、Compose |

## Hilt 的優勢所在 {id="where-hilt-is-stronger"}

- **建置期擁有完整相依圖**：Hilt 會產生整個相依圖，因此每次建置時都會驗證每個模組與作用域的每個繫結。Koin Compiler Plugin 雖然會在入口點驗證相依圖，但對於在執行階段載入的模組以及單獨的程式庫模組則無法納入檢視。
- **無執行階段查找開銷**：直接呼叫產生的工廠。Koin 則透過其容器解析每個請求，這會在每次解析時產生查找開銷，並在啟動時需要執行註冊作業。
- **Java 支援**：Dagger 和 Hilt 適用於 Java 程式碼庫。Koin 的 API 則是專為 Kotlin 設計。
- **生態系統與官方指導**：Hilt 是 Android 官方指南中推薦記載的相依注入程式庫，且許多 AndroidX 程式庫與範例都會優先提供 Hilt 整合支援。
- **詳細的錯誤訊息**：Dagger 的錯誤會顯示從入口點到遺失繫結的完整路徑。

## Koin 的優勢所在 {id="where-koin-is-stronger"}

- **Kotlin Multiplatform**：相同的模組可執行於 Android、iOS、桌面、Web 以及 Ktor 伺服器。Hilt 則僅支援 Android。
- **執行階段彈性**：模組可以在啟動後載入、卸載或在背景載入，非常適合功能旗標 (feature flags)、動態功能 (dynamic features) 與外掛程式架構。
- **較少設定**：無需註解處理器、無需產生原始碼、無需標註 `@AndroidEntryPoint`。使用 Constructor 或 Classic DSL 時，建置外掛程式是選用的。
- **更少的宣告程式碼**：建構函式不需要標註 `@Inject`，且介面會直接繫結到其實作，無需額外建立獨立的 `@Binds` 模組。
- **可自由選擇風格**：可使用 DSL 或註解，兩者亦可混用。

## 程式碼對比 {id="code-side-by-side"}

### 具備相依性的類別 {id="a-class-with-dependencies"}

Koin:

```kotlin
@Singleton
class UserRepositoryImpl(private val api: ApiService) : UserRepository
```

Koin 會將 `UserRepositoryImpl` 繫結至 `UserRepository`，因為它實作了該介面。

Hilt:

```kotlin
@Singleton
class UserRepositoryImpl @Inject constructor(private val api: ApiService) : UserRepository

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    abstract fun bindUserRepository(impl: UserRepositoryImpl): UserRepository
}
```

### 第三方類別 {id="third-party-classes"}

Koin:

```kotlin
@Module
class NetworkModule {
    @Singleton
    fun retrofit(): Retrofit = Retrofit.Builder()
        .baseUrl("https://api.example.com")
        .build()

    @Singleton
    fun apiService(retrofit: Retrofit): ApiService =
        retrofit.create(ApiService::class.java)
}
```

Hilt:

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton
    fun retrofit(): Retrofit = Retrofit.Builder()
        .baseUrl("https://api.example.com")
        .build()

    @Provides
    @Singleton
    fun apiService(retrofit: Retrofit): ApiService =
        retrofit.create(ApiService::class.java)
}
```

兩者非常相似。Koin 不需要 `@InstallIn`，因為模組並未綁定到特定組建；也不需要 `@Provides`，因為函式上的 `@Singleton` 本身就已經宣告了定義。

### ViewModel {id="viewmodel"}

Koin:

```kotlin
@KoinViewModel
class UserViewModel(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel()

// Activity 或 Fragment
val viewModel: UserViewModel by viewModel()

// Compose
val viewModel: UserViewModel = koinViewModel()
```

Hilt:

```kotlin
@HiltViewModel
class UserViewModel @Inject constructor(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel()

// 標註有 @AndroidEntryPoint 的 Activity 或 Fragment
val viewModel: UserViewModel by viewModels()

// Compose
val viewModel: UserViewModel = hiltViewModel()
```

### 多個 Gradle 模組 {id="several-gradle-modules"}

Koin:

```kotlin
// feature-auth
@Module
@ComponentScan
@Configuration
class AuthModule

// app
@KoinApplication
class MyApp
```

Hilt:

```kotlin
// feature-auth
@Module
@InstallIn(SingletonComponent::class)
class AuthModule { ... }

// app
@HiltAndroidApp
class MyApp : Application()
```

兩者都會在類別路徑 (classpath) 上探索功能模組：Koin 透過 `@Configuration`，Hilt 則透過 `@InstallIn`。在 Koin 中，`@ComponentScan` 還會收集該套件中所有帶有註解的類別，因此功能模組通常不需要提供者函式。

## 概念對應 {id="concept-mapping"}

| Hilt | Koin |
|------|------|
| `@HiltAndroidApp` | `@KoinApplication` 搭配 `startKoin<MyApp>()`，或 `startKoin { }` |
| `@AndroidEntryPoint` | 不需要：`by inject()` 與 `by viewModel()` 適用於任何 Activity 或 Fragment |
| `@Inject constructor` | 不需要：建構函式會由 Compiler Plugin 讀取 |
| `@Binds` | 註解為自動處理，DSL 中則使用 `bind` |
| `@Provides` | 函式上的 `@Singleton` 或 `@Factory`，或 DSL 定義 |
| `@InstallIn(SingletonComponent::class)` | `@Configuration` |
| `@HiltViewModel` | `@KoinViewModel` |
| `@Named` | `@Named` |
| `@ActivityScoped`, `@ViewModelScoped` | `@ActivityScope`, `@ViewModelScope` |
| `@AssistedInject` | `@InjectedParam` |

遷移指南提供了完整的對應關係、逐步流程，以及在遷移期間如何同時並行運作這兩個架構：請參閱 [Migrating from Hilt](/docs/reference/koin-android/hilt-migration)。

## 相關資源 {id="related"}

- [Migrating from Hilt](/docs/reference/koin-android/hilt-migration)：逐步遷移專案。
- [JSR-330 Compatibility](/docs/reference/koin-android/jsr330)：保留 `javax.inject` 註解。
- [What is Koin?](/docs/intro/what-is-koin)：Koin 的執行階段與編譯期模型。
- [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety)：Koin 在建置期檢查的項目。
- [Choosing your style](/docs/intro/choosing-your-style)：DSL 或註解。