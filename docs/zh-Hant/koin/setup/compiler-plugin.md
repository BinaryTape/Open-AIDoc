---
title: 編譯器外掛程式設定
---

# 編譯器外掛程式設定

本頁面介紹如何安裝 Koin Compiler Plugin，這是一個支援 Compiler Plugin DSL 與註解背後的 Kotlin 編譯器外掛程式。內容涵蓋單模組、多模組與 Kotlin Multiplatform 組建、主要選項以及設定問題。若要了解此外掛程式的功能，請參閱 [Koin Compiler Plugin](/docs/intro/koin-compiler-plugin)。Koin 程式庫本身列於 [Gradle Setup](/docs/setup/gradle)。

## 需求 {id="requirements"}

- Kotlin 2.3.20 或更新版本（K2 編譯器）。
- Koin 4.2.0 或更新版本。
- Gradle 8 或更新版本。

目前版本：

- Koin：[![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-core?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-core)
- Koin Compiler Plugin：[![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-compiler-plugin?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-compiler-plugin)

此外掛程式擁有自己的版本，與 Koin 分開。`koin-annotations` 則遵循 Koin 的版本。

## 安裝 {id="install"}

### 1. 宣告外掛程式 {id="1-declare-the-plugin"}

在 `gradle/libs.versions.toml` 中：

```toml
[versions]
koin = "4.2.2"
koin-plugin = "1.2.1"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }

[plugins]
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

若你使用 [Koin BOM](/docs/setup/gradle#koin-bom)，請自程式庫中移除 `version.ref`。該外掛程式不屬於 BOM 的一部分，並保留其自己的版本。

### 2. 外掛儲存庫 {id="2-plugin-repositories"}

此外掛程式已發佈至 Maven Central 與 Gradle Plugin Portal。在 `settings.gradle.kts` 中：

```kotlin
pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}
```

### 3. 套用外掛程式 {id="3-apply-the-plugin"}

在每個宣告 Koin 定義的 Gradle 模組之 `build.gradle.kts` 中：

```kotlin
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(libs.koin.core)          // 或 koin-android, koin-ktor, ...
    implementation(libs.koin.annotations)   // 用於註解，以及 DSL 風格中的 @Named 或 @InjectedParam
}
```

Compiler Plugin DSL（`single<T>()`、`factory<T>()`、`viewModel<T>()`）隨附於 Koin 程式庫中的 `org.koin.plugin.module.dsl` 套件。僅當你使用註解（包含 DSL 風格的參數註解）時，才需要 `koin-annotations`。

:::tip
`@KoinViewModel` 與 `@KoinWorker` 需要在類別路徑中包含其執行階段程式庫：`koin-core-viewmodel`（包含在 `koin-android` 與 `koin-compose-viewmodel` 中）以及 `koin-androidx-workmanager`。若缺少其中任一項，組建將會失敗，並顯示指出該構件名稱的錯誤。
:::

### 4. 檢查是否正常運作 {id="4-check-that-it-works"}

為單次組建開啟外掛程式記錄：

```kotlin
koinCompiler {
    userLogs = true
}
```

組建輸出會列出外掛程式偵測到的每個定義。檢查完成後請再次將其關閉。接著按照 [Starting Koin](/docs/reference/koin-core/starting-koin) 中的說明，使用 `startKoin { }`，或是針對註解使用 `startKoin<MyApp>()` 來啟動 Koin。

## 多模組專案 {id="multi-module-projects"}

在每個宣告定義的 Gradle 模組中套用此外掛程式，而不僅僅是在 app 模組中：

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
// app/build.gradle.kts
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(project(":feature"))
    implementation(libs.koin.android)
    implementation(libs.koin.annotations)
}
```

每個使用此外掛程式編譯的模組都會攜帶有關其定義的元資料。app 模組會讀取該元資料，以便在 `startKoin` 時檢查完整的關係圖。未套用此外掛程式的程式庫模組對這些檢查而言是隱形的。關於如何跨 Gradle 模組組合模組（`includes`、`@Configuration`），請參閱 [Modules](/docs/reference/koin-core/modules) 與 [Multi-Module Android Apps](/docs/reference/koin-android/multi-module)。

## Kotlin Multiplatform {id="kotlin-multiplatform"}

在共用模組（shared module）上套用一次此外掛程式，並將程式庫新增至 `commonMain`。不需要針對各個目標分別設定：

```kotlin
// shared/build.gradle.kts
plugins {
    alias(libs.plugins.kotlin.multiplatform)
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

專案結構請參閱 [Kotlin Multiplatform Setup](/docs/reference/koin-core/kmp-setup)。

## 選項 {id="options"}

`koinCompiler` 區塊用於設定此外掛程式。預設值適用於大多數專案：

```kotlin
koinCompiler {
    compileSafety = true      // 在組建時期驗證圖形
    skipDefaultValues = true  // 使用 Kotlin 預設值而不是進行注入
    userLogs = false          // 記錄偵測到的定義
}
```

每個選項（包括 `strictSafety`、`unsafeDslChecks`、`logSeverity` 與 `debugLogs`）均在 [Compiler Plugin Options](/docs/reference/koin-annotations/options) 中說明。

## Kotlin 版本相容性 {id="kotlin-version-compatibility"}

每個外掛程式版本都會在一系列 Kotlin 版本上進行驗證：

| Kotlin | Koin Compiler Plugin |
|--------|----------------------|
| 2.3.20, 2.4.0, 2.4.10 | 1.2.0+ |
| 2.4.20 | 1.2.1+ |

若使用的 Kotlin 版本未列於清單中，外掛程式會印出警告訊息，且組建仍會繼續執行。

:::warning
在 Kotlin 2.4.20 上，外掛程式 1.2.0 會在 IR 產生期間因 `NoSuchMethodError` 而失敗。請使用 1.2.1 或更新版本。
:::

## 疑難排解 {id="troubleshooting"}

### 找不到外掛程式 {id="plugin-not-found"}

Gradle 無法解析 `io.insert-koin.compiler.plugin`。請檢查 `settings.gradle.kts` 中的 `pluginManagement.repositories` 是否包含 `mavenCentral()` 與 `gradlePluginPortal()`。

### 執行階段發生 NotImplementedError {id="notimplementederror-at-runtime"}

`single<T>()`、`factory<T>()` 與 `create(::T)` 是由外掛程式替換的占位符號。若未將外掛程式套用至包含它們的 Gradle 模組，程式碼雖然可以編譯，但在建立模組時會擲回 `NotImplementedError`。請將此外掛程式套用至該模組。

### 錯誤的匯入 {id="wrong-imports"}

Compiler Plugin DSL 與 Constructor DSL 在不同的套件中擁有相同名稱的函式：

```kotlin
// Compiler Plugin DSL
import org.koin.plugin.module.dsl.*

// Constructor DSL: singleOf, factoryOf, viewModelOf
import org.koin.core.module.dsl.*

// 兩者皆有
import org.koin.dsl.module
```

### 重構後出現過期結果 {id="stale-results-after-a-refactor"}

與其他 Kotlin IR 外掛程式（例如 Compose 編譯器）類似，Koin Compiler Plugin 在增量編譯時可能會產生過期的結果。常見現象：

- 出現不應出現的編譯安全錯誤，或是在移除定義後未顯示任何錯誤。
- 重構後在執行階段發生 `NoSuchMethodError` 或 `ClassNotFoundException`。

通常發生在以下變更之後：

- 修改類別上的註解（從 `@Singleton` 變更為 `@Factory`、新增或移除 `@Named`）。
- 在 `@ComponentScan` 掃描的套件之間移動類別。
- 變更模組的 `includes` 或 `@Configuration` 標籤。
- 在另一個模組所相依的程式庫模組中新增或移除定義。

請執行清理組建：`./gradlew clean build`，或在 Android Studio 中點選 Build > Clean Project，接著點選 Build > Rebuild Project。

對於 `module { }` Lambda 運算式內部的變更，外掛程式會為包含入口點（`startKoin`、`koinApplication`、`@KoinApplication`）的模組開啟 `strictSafety`。它會在每次組建這些模組時重新執行完整的圖形檢查。請參閱 [`strictSafety`](/docs/reference/koin-annotations/options)。

### 回報跨模組缺少相依性 {id="missing-dependency-reported-across-modules"}

若程式庫模組確實宣告了某個相依項，但外掛程式卻回報缺少該相依項：

1. 同樣地將外掛程式套用至該程式庫模組。若沒有外掛程式，該程式庫將不會攜帶任何元資料。
2. 確保在組建使用該程式庫的模組之前，該程式庫已經完成組建。通常 `implementation(project(":lib"))` 會自動處理此順序。
3. 首次將外掛程式新增至程式庫後，請執行一次清理組建。
4. 請使用外掛程式 1.2.1 或更新版本。早期版本遺漏了相距兩個或更多 `implementation` 層級的定義，且會跨模組合併 `@Named` 提供者。若你先前因為錯誤的 `KOIN-D001` 報錯而關閉了 `compileSafety`，請重新將其開啟。

## 遷移至 Compiler Plugin {id="moving-to-the-compiler-plugin"}

- **從 Constructor 或 Classic DSL**：套用外掛程式。你現有的 `singleOf(::T)` 定義與 `get()` 呼叫無須任何修改即可在組建時期進行檢查。接著你可以逐個模組將其替換為 `single<T>()`。請參閱 [Choosing your style](/docs/intro/choosing-your-style)。
- **從 KSP 處理器**：移除 KSP 與 `koin-ksp-compiler`，套用外掛程式，並將產生的 `.module` 擴充功能替換為 `startKoin<MyApp>()`。你的註解將維持不變。請參閱 [Migrating from KSP](/docs/migration/from-ksp-to-compiler-plugin)。

## 相關內容 {id="related"}

- [Koin Compiler Plugin](/docs/intro/koin-compiler-plugin)：外掛程式的功能與運作原理。
- [Compiler Plugin Options](/docs/reference/koin-annotations/options)：所有 Gradle 選項。
- [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety)：所有檢查項目與錯誤代碼。
- [Gradle Setup](/docs/setup/gradle)：Koin 程式庫與 BOM。
- [Starting Koin](/docs/reference/koin-core/starting-koin)：型別化的啟動 API，例如 `startKoin<MyApp>()`。