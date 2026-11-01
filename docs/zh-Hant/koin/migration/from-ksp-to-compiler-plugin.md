---
title: 從 KSP 遷移至編譯器外掛程式
---

# 從 KSP 遷移至編譯器外掛程式

本指南將引導你將 Koin Annotations 專案從 KSP 處理器（`koin-ksp-compiler`）遷移至 Koin 編譯器外掛程式（Compiler Plugin）。帶有註解的類別維持不變：僅需變更 Gradle 配置、啟動 Koin 的方式以及少數匯入陳述式。若想了解編譯器外掛程式是什麼及其運作方式，請參閱 [Koin Compiler Plugin](/docs/intro/koin-compiler-plugin)。

## 變更內容 {id="what-changes"}

| 項目 | KSP 處理器 | 編譯器外掛程式 |
|--------|---------------|-----------------|
| 處理方式 | KSP，編譯前的獨立步驟 | 在 Kotlin K2 編譯器內部 |
| 產生的檔案 | 在 `build/generated/ksp` 中可見 | 無，程式碼直接在編譯器中產生 |
| KMP 設定 | 每個目標需要一個 KSP 配置 | 所有目標共用一個外掛程式 |
| `koin-annotations` 版本 | 獨立版本（`koin-ksp`） | 與 `koin-core` 版本相同 |
| 啟動 Koin | `modules(AppModule().module)` | `startKoin<MyApp>()` |
| 編譯期檢查 | `KOIN_CONFIG_CHECK` 選項 | 預設啟用，涵蓋完整依賴圖與呼叫點 |
| 狀態 | 已棄用 | 積極開發中 |

## 需求 {id="requirements"}

- Kotlin 2.3.20 或更高版本（K2 編譯器）。
- Gradle 8 或更高版本。
- Koin 4.2 或更高版本。

## 步驟 1：更新 Kotlin {id="step-1-update-kotlin"}

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "2.3.20"
}
```

## 步驟 2：更新 Version Catalog {id="step-2-update-the-version-catalog"}

遷移前（KSP）：

```toml
[versions]
koin = "4.0.0"
koin-ksp = "2.0.0"
ksp = "2.0.0-1.0.22"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin-ksp" }
koin-ksp-compiler = { module = "io.insert-koin:koin-ksp-compiler", version.ref = "koin-ksp" }

[plugins]
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
```

遷移後（編譯器外掛程式）：

```toml
[versions]
koin = "4.2.0"
koin-plugin = "1.2.1"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }

[plugins]
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

`koin-annotations` 現在是 Koin 主專案的一部分，並使用與 `koin-core` 相同的版本。請在 [Compiler Plugin Setup](/docs/setup/compiler-plugin) 中確認最新外掛程式版本。

## 步驟 3：更新組建組態 {id="step-3-update-the-build-configuration"}

遷移前（KSP）：

```kotlin
plugins {
    alias(libs.plugins.ksp)
}

dependencies {
    implementation(libs.koin.core)
    implementation(libs.koin.annotations)
    ksp(libs.koin.ksp.compiler)
}

ksp {
    arg("KOIN_CONFIG_CHECK", "true")
}
```

遷移後（編譯器外掛程式）：

```kotlin
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(libs.koin.core)
    implementation(libs.koin.annotations)
}

// 選填
koinCompiler {
    userLogs = true // 記錄偵測到的組件
}
```

移除 `ksp { }` 區塊：編譯期檢查現在預設啟用。所有外掛程式選項請參閱 [Compiler Plugin Options](/docs/reference/koin-annotations/options)。

### Kotlin Multiplatform {id="kotlin-multiplatform"}

使用 KSP 時，每個目標都需要自己的處理器配置：

```kotlin
dependencies {
    add("kspAndroid", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosX64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosArm64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosSimulatorArm64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
}
```

使用編譯器外掛程式時，只需在共用模組中套用一次外掛程式，並移除所有 `ksp...` 項目：

```kotlin
// shared/build.gradle.kts
plugins {
    kotlin("multiplatform")
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

## 步驟 4：更新 Koin 的啟動方式 {id="step-4-update-how-koin-starts"}

KSP 會為每個 `@Module` 類別產生一個 `.module` 擴充。編譯器外掛程式則沒有此擴充：你需要宣告一個 `@KoinApplication` 類別，並透過型別化 API 來啟動。

遷移前（KSP）：

```kotlin
import org.koin.ksp.generated.*

@Module
@ComponentScan("com.myapp")
class AppModule

fun main() {
    startKoin {
        modules(AppModule().module)
    }
}
```

遷移後（編譯器外掛程式）：

```kotlin
import org.koin.plugin.module.dsl.startKoin

@Module
@ComponentScan("com.myapp")
class AppModule

@KoinApplication(modules = [AppModule::class])
class MyApp

fun main() {
    startKoin<MyApp>()
}
```

在 Android 上，可在 Lambda 運算式中傳入一般選項：

```kotlin
@KoinApplication(modules = [AppModule::class])
class MyApp

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin<MyApp> {
            androidContext(this@MyApplication)
        }
    }
}
```

其他型別化 API 包括現有 `startKoin { }` 或測試規則內的 `koinApplication<T>()`、`koinConfiguration<T>()` 與 `withConfiguration<T>()`。若要載入單一模組類別，請在一般的 `startKoin { }` 內使用 `module<AppModule>()`。請參閱 [Starting Koin](/docs/reference/koin-core/starting-koin)。

## 步驟 5：更新匯入項目 {id="step-5-update-imports"}

`@KoinViewModel` 已移至核心註解套件：

```kotlin
// 遷移前 (KSP)
import org.koin.android.annotation.KoinViewModel

// 遷移後 (編譯器外掛程式)
import org.koin.core.annotation.KoinViewModel
```

移除所有 `import org.koin.ksp.generated.*`。

## 步驟 6：清理並重新建置 {id="step-6-clean-and-rebuild"}

刪除 KSP 產生的檔案，然後重新建置：

```bash
rm -rf build/generated/ksp
./gradlew clean build
```

首次建置將執行完整的編譯期檢查。KSP 過去未回報的缺失定義現在會導致建置失敗：錯誤訊息與 `@Provided` 的使用方式請參閱 [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety)。

## 維持不變的內容 {id="what-stays-the-same"}

你帶有註解的類別不需要變更：

```kotlin
@Singleton
class UserRepository(private val database: Database)

@Factory
class GetUserUseCase(private val repository: UserRepository)

@KoinViewModel
class UserViewModel(private val useCase: GetUserUseCase) : ViewModel()
```

所有註解均列於 [Annotations Reference](/docs/reference/koin-annotations/annotations-inventory) 中。

## 遷移後可使用的功能 {id="what-you-can-use-after-migrating"}

以下功能需要編譯器外掛程式支援：

- 頂層函式：`@Singleton fun database(): Database` 會如同類別一樣被 `@ComponentScan` 發現（請參閱 [Definitions](/docs/reference/koin-core/definitions#classes-you-dont-own)）。
- 模組探索：在任何 Gradle 模組中標記為 `@Configuration` 的模組，都會被 `@KoinApplication` 自動載入，無需手動列出。
- 配置標籤：搭配 `@Configuration("test")` 與 `@KoinApplication(configurations = ["test"])`，只會載入帶有該標籤的模組（請參閱 [Modules](/docs/reference/koin-core/modules)）。
- 編譯器外掛程式 DSL：若你也有使用 DSL 模組，可將其切換為編譯器外掛程式 DSL：

| 建構函式 / 傳統 DSL | 編譯器外掛程式 DSL |
|---------------------------|---------------------|
| `singleOf(::MyService)` | `single<MyService>()` |
| `factoryOf(::MyRepository)` | `factory<MyRepository>()` |
| `viewModelOf(::MyViewModel)` | `viewModel<MyViewModel>()` |
| `scopedOf(::MyScoped)` | `scoped<MyScoped>()` |
| `workerOf(::MyWorker)` | `worker<MyWorker>()` |
| `single { build(get()) }` | `single { create(::build) }` |

編譯器外掛程式 DSL 位於 `org.koin.plugin.module.dsl`。建構函式 DSL 仍保留在 `org.koin.core.module.dsl`，傳統 DSL 則在 `org.koin.dsl`。兩者均可繼續運作並會受到外掛程式的檢查：你無需對其進行遷移。

## 疑難排解 {id="troubleshooting"}

### 移除 KSP 後建置失敗 {id="the-build-fails-after-removing-ksp"}

過期且殘留的生成程式碼仍在 Classpath 中。請執行 `./gradlew clean`、刪除 `build/generated/ksp`、清除 IDE 快取（Invalidate Caches），然後重新建置。

### 未偵測到帶有註解的類別 {id="annotated-classes-are-not-detected"}

啟用外掛程式記錄以查看找到了哪些類別：

```kotlin
koinCompiler {
    userLogs = true
}
```

檢查 `@ComponentScan` 中的套件是否與你的類別套件相符。

### 執行階段缺少相依性 {id="a-dependency-is-missing-at-runtime"}

- 檢查該模組是否列在 `@KoinApplication(modules = [...])` 中，或標記為 `@Configuration`。
- 檢查 `@ComponentScan` 套件。
- 對於在 Koin 外部建立的型別，請將其標記為 `@Provided`（請參閱 [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety)）。

## 檢查表 {id="checklist"}

- [ ] 將 Kotlin 更新至 2.3.20 或更高版本
- [ ] 將 Koin 更新至 4.2.0 或更高版本
- [ ] 移除 KSP 外掛程式
- [ ] 移除 `koin-ksp-compiler` 相依項與 `ksp { }` 區塊
- [ ] `koin-annotations` 改用 Koin 主要版本（`io.insert-koin:koin-annotations:$koin_version`）
- [ ] 套用 Koin 編譯器外掛程式（`io.insert-koin.compiler.plugin`）
- [ ] 將 `@KoinViewModel` 匯入變更為 `org.koin.core.annotation`
- [ ] 建立一個 `@KoinApplication` 類別，並將 `modules(X().module)` 替換為 `startKoin<MyApp>()`
- [ ] 移除 `import org.koin.ksp.generated.*`
- [ ] 選用：將 DSL 模組切換為 `org.koin.plugin.module.dsl.*` 與 `single<X>()`
- [ ] 清理並重新建置（`rm -rf build/generated/ksp && ./gradlew clean build`）

## 相關內容 {id="related"}

- [Compiler Plugin Setup](/docs/setup/compiler-plugin)：安裝外掛程式並選擇其版本。
- [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety)：外掛程式檢查的項目及其錯誤代碼。
- [Starting Koin](/docs/reference/koin-core/starting-koin)：`startKoin<T>()` 與其他型別化 API。
- [Compiler Plugin Options](/docs/reference/koin-annotations/options)：完整的 Gradle 選項。
- [KSP Processor Setup](/docs/setup/annotations-ksp)：已棄用的 KSP 設定，供參考。