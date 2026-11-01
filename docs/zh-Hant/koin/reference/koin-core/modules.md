---
title: 模組
---

# 模組

模組會依功能或分層將相關的定義分組。本頁面涵蓋如何宣告模組、組合模組、掃描套件中的註解類別、跨 Gradle 模組探索模組，以及模組載入的順序。有關模組內部的定義，請參閱 [Definitions](/docs/reference/koin-core/definitions)。

## 宣告模組 {id="declare-a-module"}

**Compiler Plugin DSL**
```kotlin
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

val networkModule = module {
    single<ApiClient>()
    single<TokenManager>()
}

val dataModule = module {
    single<Database>()
    single<UserRepository>()
}
```

**Annotations**
```kotlin
@Module
@ComponentScan("com.myapp.network")
class NetworkModule

@Module
@ComponentScan("com.myapp.data")
class DataModule
```

`@Module` 類別會收集由 `@ComponentScan` 找到的註解類別，以及在其中宣告的提供者函式（請參閱 [Classes you don't own](/docs/reference/koin-core/definitions#classes-you-dont-own)）。

**Constructor / Classic DSL**
```kotlin
import org.koin.dsl.module
import org.koin.core.module.dsl.*

val networkModule = module {
    singleOf(::ApiClient)
    singleOf(::TokenManager)
}

val dataModule = module {
    singleOf(::Database)
    singleOf(::UserRepository)
}
```

定義可以相依於另一個模組中的定義。Koin 會跨所有已載入的模組進行解析，因此 `dataModule` 中的 `UserRepository` 可以使用 `networkModule` 中的 `ApiClient`，而不需要在模組之間進行任何匯入。兩個模組都必須載入，請參閱 [Starting Koin](/docs/reference/koin-core/starting-koin)。

## 使用 `includes()` 組合模組 {id="module-composition-with-includes"}

模組可以包含其他模組。載入父模組時會載入整個樹狀結構：

**Compiler Plugin DSL**
```kotlin
val networkModule = module {
    single<ApiClient>()
}

val storageModule = module {
    single<Database>()
}

val dataModule = module {
    includes(networkModule, storageModule)
    single<UserRepository>()
}

startKoin {
    modules(dataModule)
}
```

**Annotations**
```kotlin
@Module
class NetworkModule

@Module
class StorageModule

@Module(includes = [NetworkModule::class, StorageModule::class])
@ComponentScan("com.myapp.data")
class DataModule

@KoinApplication(modules = [DataModule::class])
class MyApp
```

**Constructor / Classic DSL**
```kotlin
val networkModule = module {
    singleOf(::ApiClient)
}

val storageModule = module {
    singleOf(::Database)
}

val dataModule = module {
    includes(networkModule, storageModule)
    singleOf(::UserRepository)
}

startKoin {
    modules(dataModule)
}
```

與其在 `startKoin` 中使用冗長的扁平清單，不如建議使用以單一根模組為基礎的 `includes()` 樹狀結構。這樣模組的結構就能遵循程式碼的結構，且啟動呼叫也能保持簡潔。

Koin 會將樹狀結構扁平化，並且即使有多個父模組包含同一個模組，也只會載入每個模組一次：

```kotlin
val commonModule = module {
    single<Logger>()
}

val featureAModule = module {
    includes(commonModule)
    single<FeatureA>()
}

val featureBModule = module {
    includes(commonModule)
    single<FeatureB>()
}

val appModule = module {
    includes(featureAModule, featureBModule) // commonModule 僅載入一次
}
```

### 多模組專案中的可見性 {id="visibility-in-multi-module-projects"}

在 Gradle 多模組專案中，每個功能建議公開一個 public 模組，並將其他模組維持為 `private` 或 `internal`：

```kotlin
// Gradle 模組 "feature-user"
private val userDataModule = module {
    single<UserDao>()
    single<UserCache>()
}

val userFeatureModule = module {
    includes(userDataModule)
    viewModel<UserViewModel>()
}
```

app 模組會載入 `userFeatureModule`，且永遠不會看到內部模組。有關拆分為多個 Gradle 模組的完整 Android 應用程式配置，請參閱 [Multi-Module Apps](/docs/reference/koin-android/multi-module)。

## 使用 @ComponentScan 掃描套件 {id="scan-packages-with-componentscan"}

`@ComponentScan` 僅適用於註解。它會收集套件及其子套件中所有帶有註解的類別和頂層函式：

```kotlin
@Module
@ComponentScan
class AppModule // 掃描 AppModule 所在的套件

@Module
@ComponentScan("com.myapp.features")
class FeatureModule

@Module
@ComponentScan("com.myapp.data", "com.myapp.network")
class InfraModule
```

若未指定值，它會掃描帶有該註解類別所在的套件。此掃描支援跨 Gradle 模組：位於相同套件但來自另一個 Gradle 模組的類別也會被找到。

若使用 DSL 風格，您需要自己在模組中列出各個定義。若要混合使用兩者，可以在啟動區塊中將 DSL 模組與帶註解的模組並列引入（請參閱 [Typed startup with @KoinApplication](/docs/reference/koin-core/starting-koin#typed-startup-with-koinapplication)）。

## 使用 @Configuration 自動探索 {id="auto-discovery-with-configuration"}

`@Configuration` 用於標記 `@Module`，以便 `@KoinApplication` 無需將其列出即可找到它。該模組可以位於 classpath 上的任何 Gradle 模組中：

```kotlin
// Gradle 模組 "feature-user"
@Module
@Configuration
@ComponentScan("com.myapp.feature.user")
class UserFeatureModule

// Gradle 模組 "app"
@KoinApplication
class MyApp

fun main() {
    startKoin<MyApp>() // 載入 UserFeatureModule
}
```

如此一來，新增功能只需新增 Gradle 相依性，無需修改應用程式的模組清單。代價是已載入的模組清單不再集中寫在同一個地方。如果您希望明確列出，請改為在 `@KoinApplication(modules = [...])` 中列出模組。

`@Configuration` 接受標籤，因此您可以針對不同環境或 flavor 載入不同的模組。規則請參閱 [Configuration labels](/docs/reference/koin-core/starting-koin#configuration-labels)。

`@Configuration` 僅適用於註解，且需要搭配型別化啟動 (`startKoin<MyApp>()`) 的 `@KoinApplication`。

## 載入順序與覆寫 {id="load-order-and-overrides"}

當兩個已載入的模組宣告相同型別時，最後載入的模組具有優先權。在 DSL 啟動區塊中，即為 `modules(...)` 的順序：

```kotlin
startKoin {
    modules(productionModule, debugModule) // debugModule 的 ApiService 生效
}
```

使用 `@KoinApplication` 時，Compiler Plugin 會依照以下順序建置模組清單：

1. 它從您的程式碼和相依項中探索到的 `@Configuration` 模組。
2. 在 `@KoinApplication(modules = [...])` 中列出的模組（依宣告順序）。

因此，您應用程式中的模組會覆寫程式庫的預設值：

```kotlin
// 在程式庫中
@Module
@Configuration
class CoreModule {
    @Singleton
    fun feature(): Feature = DefaultFeature()
}

// 在應用程式中
@Module
class AppModule {
    @Singleton
    fun feature(): Feature = AppFeature()
}

@KoinApplication(modules = [AppModule::class])
class MyApp // get<Feature>() 回傳 AppFeature
```

在明確清單中，`modules = [A::class, B::class, C::class]` 會依序載入 A、B、C，且每個模組的 `includes` 會保持與其分組。同時被明確列出並被 `@Configuration` 探索到的模組只會載入一次，位置為其在明確清單中的位置。若要控制多個 `@Configuration` 模組之間的順序，請將它們明確列出。

若要讓意外的覆寫在啟動時拋出錯誤，請使用 `allowOverride(false)`。覆寫單一預設定義的規則請參閱 [Overriding a definition](/docs/reference/koin-core/definitions#overriding-a-definition)。

## Eager 模組 {id="eager-modules"}

將整個模組標記為在 Koin 啟動時建立其所有 `single` 定義：

**Compiler Plugin DSL**
```kotlin
val coreModule = module(createdAtStart = true) {
    single<ConfigManager>()
    single<CrashReporter>()
}
```

**Annotations**
```kotlin
@Module(createdAtStart = true)
@ComponentScan("com.myapp.core")
class CoreModule
```

**Constructor / Classic DSL**
```kotlin
val coreModule = module(createdAtStart = true) {
    singleOf(::ConfigManager)
    singleOf(::CrashReporter)
}
```

每個 eager 定義都會增加啟動時間。有關各個定義的旗標及其開銷，請參閱 [Eager creation](/docs/reference/koin-core/definitions#eager-creation)。

## 參數化模組 {id="parameterized-modules"}

DSL 模組是一個值，因此函式可以根據引數來建置它：

**Compiler Plugin DSL**
```kotlin
fun loggingModule(debug: Boolean) = module {
    if (debug) {
        single<DebugLogger>() bind Logger::class
    } else {
        single<ReleaseLogger>() bind Logger::class
    }
}

startKoin {
    modules(loggingModule(debug = BuildConfig.DEBUG))
}
```

**Annotations**
`@Module` 類別不接受引數。在這種情況下，請使用 DSL 模組，或是透過 [設定標籤 (configuration labels)](/docs/reference/koin-core/starting-koin#configuration-labels) 為每個變體選擇對應的 `@Module`。

**Constructor / Classic DSL**
```kotlin
fun loggingModule(debug: Boolean) = module {
    single<Logger> {
        if (debug) DebugLogger() else ReleaseLogger()
    }
}

startKoin {
    modules(loggingModule(debug = BuildConfig.DEBUG))
}
```

相同的構想也可以用來替換實作：保持 `repositoryModule` 不變，並在旁邊載入 `localDatasourceModule` 或 `remoteDatasourceModule`（兩者各宣告一個 `Datasource`）。條件式模組清單是在執行階段解析的，因此 Compiler Plugin 無法在建置時期驗證每種組合。

## 相關內容 {id="related"}

- [Definitions](/docs/reference/koin-core/definitions)：模組內部包含的內容。
- [Starting Koin](/docs/reference/koin-core/starting-koin)：載入模組、型別化啟動與設定標籤。
- [Lazy Modules](/docs/reference/koin-core/lazy-modules)：在背景載入模組。
- [KMP Shared Modules](/docs/reference/koin-core/kmp-shared-modules)：在平台之間共享模組。
- [Multi-Module Apps](/docs/reference/koin-android/multi-module)：在 Android 上跨 Gradle 模組組織模組。
- [Annotations Reference](/docs/reference/koin-annotations/annotations-inventory)：`@Module`、`@ComponentScan` 與 `@Configuration` 的所有參數。