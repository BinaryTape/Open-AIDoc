---
title: 應用程式、配置與模組 
---

## 使用 @KoinApplication 進行應用程式引導 {id="application-bootstrap-with-koinapplication"}

使用 `@KoinApplication` 來定義您的應用程式入口點：

```kotlin
@KoinApplication(modules = [MyModule::class])
class MyApp
```

使用強型別 API 啟動 Koin：

```kotlin
fun main() {
    startKoin<MyApp>()

    // 或使用配置
    startKoin<MyApp> {
        printLogger()
    }
}
```

### 可用的強型別 API {id="available-typed-apis"}

| API | 描述 |
|-----|-------------|
| `startKoin<T>()` | 全域啟動 Koin |
| `startKoin<T> { }` | 使用配置區塊啟動 |
| `koinApplication<T>()` | 建立隔離的 KoinApplication |
| `koinConfiguration<T>()` | 建立配置（適用於 Compose, Ktor） |
| `module<T>()` | 載入單一 `@Module` 類別 |
| `modules(A::class, B::class)` | 載入多個 `@Module` 類別 |

### 載入個別模組 {id="loading-individual-modules"}

使用 `module<T>()` 或 `modules(vararg KClass)` 直接載入 `@Module` 類別，無需使用 `@KoinApplication`：

```kotlin
startKoin {
    module<NetworkModule>()
    modules(DataModule::class, CacheModule::class)
}
```

這對於測試或混合註解模組與 DSL 配置時非常有用：

```kotlin
// 在測試中 — 僅載入您需要的模組
@get:Rule
val koinTestRule = KoinTestRule.create {
    module<NetworkModule>()
}
```

:::info
`module<T>()` 與 `modules(vararg KClass)` 是虛設常式函式，編譯器外掛程式會攔截並在編譯時進行轉換。它們需要套用 Koin 編譯器外掛程式。
:::

### @KoinApplication 參數 {id="koinapplication-parameters"}

- `modules`：要包含的模組類別陣列
- `configurations`：要載入的配置標籤陣列

```kotlin
@KoinApplication(
    modules = [CoreModule::class],
    configurations = ["production"]
)
class ProdApp
```

:::info
當未指定任何配置時，標記為 `@Configuration`（預設標籤）的模組將自動載入。
:::

### 模組載入順序與覆寫 {id="module-load-order-and-overrides"}

Koin 在執行期採用 **後者勝出 (last-wins)** 原則：當兩個模組定義了相同的型別時，最後載入的模組具有優先權。編譯器外掛程式會按以下順序從 `@KoinApplication` 組合模組清單：

1.  **自動探索的 `@Configuration` 模組**（本機 + 相依項 JAR 檔） — 最先載入
2.  **明確的 `@KoinApplication(modules = [A, B, C])`** — 最後載入，**依宣告順序**

因此，應用程式層級的覆寫一律勝過相依項預設值：

```kotlin
// 在相依性函式庫模組中
@Module @Configuration
class CoreModule {
    @Singleton fun feature(): Feature = DefaultFeature()
}

// 在您的應用程式模組中
@Module
class AppModule {
    @Singleton fun feature(): Feature = AppFeature()  // 自訂覆寫
}

@KoinApplication(modules = [AppModule::class])
class MyApp
// 載入順序：CoreModule (DefaultFeature) → AppModule (AppFeature 勝出)
// 執行期 get<Feature>() 回傳 AppFeature。
```

在明確列出的清單中，宣告順序會被保留 — 因此 `@KoinApplication(modules = [A, B, C])` 會依序載入 A、B、接著 C，而 C 會在三者中勝出。每個項目的 `@Module(includes = [...])` 鏈會與該項目保持群組化。

如果一個模組同時出現在明確清單中且也被 `@Configuration` 探索到，它只會載入一次 — 位於其 **明確指定的位置** — 因此 `modules = [...]` 中的宣告順序始終控制著覆寫優先權。

:::tip
如果您需要在多個 `@Configuration` 模組之間指定特定的載入順序（而非類別路徑掃描順序），請在 `@KoinApplication(modules = [Core::class, Feature::class, App::class])` 中明確列出它們 — 明確清單會遵循宣告順序。
:::

## 使用 @Configuration 進行配置管理 {id="configuration-management-with-configuration"}

`@Configuration` 註解允許您將模組組織到不同的配置（環境、變體等）中。這對於按部署環境或功能集組織模組非常有用。

### 基本配置用法 {id="basic-configuration-usage"}

```kotlin
// 將模組放入預設配置中
@Module
@Configuration
class CoreModule
```

:::info
預設配置名為「default」，可以透過 `@Configuration` 或 `@Configuration("default")` 使用
:::

您需要使用 `@KoinApplication` 才能從配置中掃描模組：

```kotlin
// 模組 A
@Module
@Configuration
class ModuleA

// 模組 B
@Module
@Configuration
class ModuleB

// 應用程式模組，掃描所有 @Configuration 模組
@KoinApplication
object MyApp
```

### 多重配置支援 {id="multiple-configuration-support"}

一個模組可以與多個配置相關聯：

```kotlin
// 此模組在 "prod" 和 "test" 配置中皆可用
@Module
@Configuration("prod", "test")
class DatabaseModule {
    @Single
    fun database() = PostgreSQLDatabase()
}

// 此模組在 default、test 和 development 中皆可用
@Module
@Configuration("default", "test", "development") 
class LoggingModule {
    @Single
    fun logger() = Logger()
}
```

### 環境特定的配置 {id="environment-specific-configurations"}

```kotlin
// 僅限開發環境的配置
@Module
@Configuration("development")
class DevDatabaseModule {
    @Single
    fun database() = InMemoryDatabase()
}

// 僅限正式環境的配置  
@Module
@Configuration("production")
class ProdDatabaseModule {
    @Single
    fun database() = PostgreSQLDatabase()
}

// 在多個環境中可用
@Module
@Configuration("default", "production", "development")
class CoreModule {
    @Single
    fun logger() = Logger()
}
```

### 在 @KoinApplication 中使用配置 {id="using-configurations-with-koinapplication"}

預設情況下，`@KoinApplication` 會載入所有預設配置（標記有 `@Configuration` 的模組）。

您也可以在應用程式引導中參考這些配置：

```kotlin
@KoinApplication(configurations = ["default", "production"])
class ProductionApp

@KoinApplication(configurations = ["default", "development"])  
class DevelopmentApp

// 僅載入預設配置（與不帶參數的 @KoinApplication 相同）
@KoinApplication
class SimpleApp
```

:::info
- 空的 `@Configuration` 等同於 `@Configuration("default")`
- 當未指定特定配置時，會自動載入「default」配置
- 模組可以透過在註解中列出多個配置來屬於多個配置
:::

## 使用模組進行組織 {id="organizing-with-modules"}

請務必使用 `@Module` 將您的定義組織在明確的模組中：

## 使用 @Module 的類別模組 {id="class-module-with-module"}

若要宣告模組，請使用 `@Module` 註解標記類別：

```kotlin
@Module
class MyModule
```

在您的 `@KoinApplication` 中參考模組：

```kotlin
@KoinApplication(modules = [MyModule::class])
class MyApp

fun main() {
    startKoin<MyApp>()
}
```

## 使用 @ComponentScan 掃描組建 {id="components-scan-with-componentscan"}

使用 `@ComponentScan` 自動探索帶有註解的組建：

```kotlin
@Module
@ComponentScan
class MyModule
```

這將掃描當前套件及其子套件以尋找帶有註解的組建。明確指定套件：

```kotlin
@Module
@ComponentScan("com.myapp.features")
class FeatureModule
```

:::info
`@ComponentScan` 會針對相同的套件跨所有 Gradle 模組進行遍歷。
:::

## 類別模組中的定義 {id="definitions-in-class-modules"}

若要直接在程式碼中定義定義，您可以使用定義註解來標註函式：

```kotlin
// 給定 
// class MyComponent(val myDependency : MyDependency)

@Module
class MyModule {

  @Single
  fun myComponent(myDependency : MyDependency) = MyComponent(myDependency)
}
```

> **注意**：`@InjectedParam`（用於來自 `startKoin` 的注入參數）和 `@Property`（用於屬性注入）也可用於函式成員。請參閱定義文件以了解有關這些註解的更多詳細資訊。

## 包含模組 {id="including-modules"}

使用 `includes` 屬性來組合模組：

```kotlin
@Module
class ModuleA

@Module(includes = [ModuleA::class])
class ModuleB
```

在您的應用程式中參考根模組：

```kotlin
@KoinApplication(modules = [ModuleB::class])  // 將自動包含 ModuleA
class MyApp

fun main() {
    startKoin<MyApp>()
}
```
