---
title: 編譯器外掛程式設定
---

# Koin 編譯器外掛程式設定

對於所有新的 Kotlin 2.x 專案，建議使用 **Koin 編譯器外掛程式 (Koin Compiler Plugin)**。它提供了自動裝配 (auto-wiring)、編譯時期安全性以及更簡潔的 DSL 語法。

## 什麼是編譯器外掛程式？

Koin 編譯器外掛程式是一個**原生 Kotlin 編譯器外掛程式 (K2)**，它具備以下功能：

- 自動偵測建構函式相依性
- 提供編譯時期分析
- 同時支援 DSL 和註解 (Annotations)
- 不會產生任何可見檔案

請參閱 [Koin 編譯器外掛程式簡介](/docs/setup/compiler-plugin) 以了解功能與優點的詳細資訊。

## 系統需求

- **Kotlin 2.3+** (K2 編譯器)
- **Gradle 8.x+**

## 設定

### 步驟 1：將 Koin 新增至版本目錄

首先，檢查最新版本：
- Koin：[![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-core?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-core)
- Koin 編譯器外掛程式：[![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-compiler-plugin?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-compiler-plugin)

接著，在您的 `gradle/libs.versions.toml` 中：

```toml
[versions]
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }

[plugins]
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

### 步驟 2：配置設定

在您的 `settings.gradle.kts` 中：

```kotlin
pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}
```

### 步驟 3：套用外掛程式

在您模組的 `build.gradle.kts` 中：

```kotlin
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(libs.koin.core)
    implementation(libs.koin.annotations)  // 用於註解支援
}
```

## 完整範例

### gradle/libs.versions.toml

```toml
[versions]
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }

[plugins]
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

### settings.gradle.kts

```kotlin
pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}
```

### build.gradle.kts

```kotlin
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(libs.koin.core)
    implementation(libs.koin.annotations)
}
```

## 使用編譯器外掛程式

### DSL 風格

從編譯器外掛程式套件匯入：

```kotlin
import org.koin.plugin.module.dsl.*
import org.koin.dsl.module

val appModule = module {
    single<Database>()
    single<ApiClient>()
    single<UserRepository>()
    viewModel<UserViewModel>()
}
```

:::info
編譯器外掛程式 DSL 位於套件 **`org.koin.plugin.module.dsl`** 中。傳統 DSL 仍保留在 `org.koin.dsl`。
:::

### 註解風格

在您的類別上使用註解：

```kotlin
@Singleton
class Database

@Singleton
class ApiClient

@Singleton
class UserRepository(
    private val database: Database,
    private val apiClient: ApiClient
)

@KoinViewModel
class UserViewModel(private val repository: UserRepository) : ViewModel()

@Module
@ComponentScan("com.myapp")
class AppModule
```

### 使用註解啟動 Koin

搭配編譯器外掛程式，使用強型別 API 來啟動 Koin — **無需產生任何程式碼**：

```kotlin
@KoinApplication
@ComponentScan("com.myapp")
class MyApp

// 使用強型別 API 啟動 Koin
startKoin<MyApp>()

// 或使用額外的配置
startKoin<MyApp> {
    androidContext(this@MyApplication)
    printLogger()
}
```

**可用的強型別 API：**

| API | 說明 |
|-----|-------------|
| `startKoin<T>()` | 使用應用程式 T 全域啟動 Koin |
| `startKoin<T> { }` | 使用應用程式 T 和配置區塊啟動 Koin |
| `koinApplication<T>()` | 使用 T 建立隔離的 KoinApplication |
| `koinConfiguration<T>()` | 從 T 建立 KoinConfiguration (用於 Compose KoinApplication、Ktor 等) |

其中 `T` 是標註有 `@KoinApplication` 的類別。

## 配置選項

在您的 `build.gradle.kts` 中配置編譯器外掛程式：

```kotlin
koinCompiler {
    userLogs = true
    debugLogs = false
    dslSafetyChecks = true
}
```

### 可用選項

| 選項 | 說明 | 預設值 |
|--------|-------------|---------|
| `userLogs` | 啟用元件偵測與 DSL/註解處理的記錄 | `false` |
| `debugLogs` | 啟用外掛程式內部處理的詳細偵錯記錄 | `false` |
| `dslSafetyChecks` | 驗證 Lambda 內部的 `create()` 呼叫是否為唯一指令 | `true` |

:::tip
在開發期間將 `userLogs = true` 設定為啟用，以查看外掛程式偵測並處理了哪些元件。
:::

## 編譯時期安全性 (即將推出)

Koin 編譯器外掛程式將提供**編譯時期相依性驗證** — 在建置時期驗證所有相依性是否可以解析，而不是在執行時期才失敗。

:::note 開發中
適用於 DSL 和註解的編譯時期安全性目前正在開發中。這將透過原生的 Kotlin 編譯器整合來取代基於 KSP 的 `KOIN_CONFIG_CHECK` 選項。
:::

## 多模組專案

對於具有多個 Gradle 模組的專案：

### 程式庫模組

```kotlin
// feature/build.gradle.kts
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(libs.koin.core)
    implementation(libs.koin.annotations)
}
```

```kotlin
// feature/src/main/kotlin/FeatureModule.kt
@Module
@ComponentScan("com.myapp.feature")
class FeatureModule
```

### 應用程式模組

```kotlin
// app/build.gradle.kts
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(project(":feature"))
    implementation(libs.koin.core)
    implementation(libs.koin.annotations)
}
```

```kotlin
// app/src/main/kotlin/MyModule.kt
@Module
@Configuration
class MyModule

// app/src/main/kotlin/MyApp.kt
@KoinApplication
class MyApp

class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin<MyApp>()
    }
}
```

對主應用程式類別使用 `@KoinApplication` 並搭配強型別啟動 API。

## Kotlin 多平台

編譯器外掛程式支援 KMP 專案：

```kotlin
// shared/build.gradle.kts
plugins {
    id("org.jetbrains.kotlin.multiplatform")
    alias(libs.plugins.koin.compiler)
}

kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation(libs.koin.core)
            implementation(libs.koin.annotations)
        }
    }
}
```

## 疑難排解

### 找不到外掛程式

請確保外掛程式已包含在您的外掛程式儲存庫中：

```kotlin
// settings.gradle.kts
pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}
```

### Kotlin 版本不符

編譯器外掛程式需要 Kotlin 2.3.20+。請檢查您的 Kotlin 版本：

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "2.3.20-Beta1"  // 需要 2.3.20+
}
```

### 匯入錯誤

請確保您從正確的套件匯入：

```kotlin
// 編譯器外掛程式 DSL
import org.koin.plugin.module.dsl.*

// 傳統 DSL
import org.koin.dsl.*
```

## 遷移

### 從傳統 DSL 遷移

1. 新增編譯器外掛程式
2. 將匯入更新為 `org.koin.plugin.module.dsl.*`
3. 將 `single { Class(get() ...) }` 或 `singleOf(::Class)` 替換為 `single<Class>()`

請參閱 [從 DSL 遷移至編譯器外掛程式](/docs/migration/from-ksp-to-compiler-plugin)。

### 從 KSP 註解遷移

1. 移除 KSP 外掛程式與相依性
2. 新增 Koin 編譯器外掛程式
3. 將 `startKoin { modules(...) }` 更新為 `startKoin<MyApp>()`
4. **您的註解保持不變！**

請參閱 **[從 KSP 遷移至編譯器外掛程式](/docs/migration/from-ksp-to-compiler-plugin)** 以獲取完整指南。

## 下一步

- **[DSL 參考](/docs/reference/koin-core/modules)** — 完整的 DSL 文件
- **[註解參考](/docs/reference/koin-annotations/modules)** — 完整的註解文件
- **[啟動 Koin](/docs/reference/koin-core/starting-koin)** — 配置您的應用程式