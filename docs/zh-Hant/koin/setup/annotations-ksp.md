---
title: KSP 註解設定 (已棄用)
---

# KSP 註解設定

:::warning
**已棄用**：基於 KSP 的註解處理方式已棄用。請為所有新專案遷移至 [Koin 編譯器外掛程式](/docs/setup/compiler-plugin)。
:::

:::info
**您的註解保持不變** — 只有組建設定有所變動。請參閱下方的[遷移指南](#migration-to-compiler-plugin)。
:::

## 為什麼要遷移？

| 面向 | KSP 註解 | 編譯器外掛程式 |
|--------|-----------------|-----------------|
| **產生的檔案** | 在 build/ 中可見 | 無 |
| **組建速度** | ⚠️ 較慢 | 較快 |
| **KMP 設定** | ⚠️ 複雜 | 簡單 |
| **未來支援** | ⚠️ 已棄用 | ✅ 主動開發中 |
| **您的程式碼** | ⚠️ 使用產生的擴充套件 | 使用 Kotlin 編譯器外掛程式專用 API |

## 何時使用 KSP (暫時)

僅在以下情況下使用 KSP：
- 受限於 Kotlin 1.x (建議升級)
- 處於遷移中期且尚無法切換
- 有特定的 KSP 需求

## 目前的 KSP 設定 (參考)

如果您必須使用 KSP，設定如下：

### Gradle 設定

```kotlin
// build.gradle.kts
plugins {
    id("com.google.devtools.ksp") version "$ksp_version"
}

dependencies {
    implementation(platform("io.insert-koin:koin-bom:$koin_version"))
    implementation("io.insert-koin:koin-core")
    implementation("io.insert-koin:koin-annotations:$koin_ksp_version")
    ksp("io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
}
```

### 版本相容性

| Koin 註解 | KSP 版本 | Kotlin 版本 |
|------------------|-------------|----------------|
| 1.4 | 1.9 | 1.9 |
| 2.0 | 2.0 | 2.0 |
| 2.1/2.2 | 2.1/2.2 | 2.1/2.2 |
| 2.3 | 2.3 | 獨立 (Independant) |

### 基本用法

```kotlin
@Single
class MyComponent

@Module
class MyModule

// 匯入產生的擴充套件
import org.koin.ksp.generated.*

fun main() {
    startKoin {
        modules(MyModule().module)
    }
}
```

### KSP 選項

```kotlin
// build.gradle.kts
ksp {
    arg("KOIN_CONFIG_CHECK", "true")  // 啟用編譯期驗證
}
```

:::note
此基於 KSP 的編譯期檢查將被 **Koin 編譯器外掛程式** 中的原生編譯期安全性所取代。請參閱 [編譯器外掛程式](/docs/setup/compiler-plugin)。
:::

### KMP 設定 (複雜)

```kotlin
// shared/build.gradle.kts
plugins {
    id("com.google.devtools.ksp")
}

kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation("io.insert-koin:koin-core:$koin_version")
            implementation("io.insert-koin:koin-annotations:$koin_ksp_version")
        }
    }
}

dependencies {
    // 需要各平台的 KSP 配置
    add("kspAndroid", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosX64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosArm64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosSimulatorArm64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
}
```

## 遷移至 Koin 編譯器外掛程式

### 步驟 1：更新 Kotlin

確保您使用的是 Kotlin 2.3.20+：

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "2.3.20-Beta1" // 或更早版本
}
```

### 步驟 2：移除 KSP

移除 KSP 外掛程式與相依性：

```kotlin
// 移除這些：
plugins {
    // id("com.google.devtools.ksp")  // 移除
}

dependencies {
    // ksp("io.insert-koin:koin-ksp-compiler:...")  // 移除
}
```

### 步驟 3：加入編譯器外掛程式

請參閱 **[編譯器外掛程式設定指南](/docs/setup/compiler-plugin)** 以獲取詳細說明。

### 步驟 4：保留您的程式碼

**您的註解完全保持不變 👍**

```kotlin
// 這部分程式碼不需要變動！
@Singleton
class MyService(val repository: MyRepository)

@Factory
class MyRepository

@KoinViewModel
class MyViewModel(val service: MyService)

@Module
@ComponentScan("com.myapp")
class AppModule
```

### 步驟 5：更新 Koin 啟動設定

使用編譯器外掛程式後，**不使用任何產生的程式碼**。請將產生的擴充套件替換為型別化 API：

**之前 (KSP)：**
```kotlin
import org.koin.ksp.generated.*

startKoin {
    modules(AppModule().module)  // 使用產生的擴充套件
}
```

**之後 (編譯器外掛程式)：**
```kotlin
@KoinApplication
@ComponentScan("com.myapp")
class MyApp

// 使用型別化 API - 無需產生的程式碼！
startKoin<MyApp>()

// 或配合配置使用
startKoin<MyApp> {
    androidContext(this@MyApplication)
}
```

可用的型別化 API：
- `startKoin<T>()` - 以應用程式 T 全域啟動 Koin
- `koinApplication<T>()` - 使用 T 建立獨立的 KoinApplication
- `koinConfiguration<T>()` - 從 T 建立 KoinConfiguration (用於 Compose KoinApplication、Ktor 等)

其中 `T` 是標註有 `@KoinApplication` 的類別。

### 步驟 6：清理

刪除產生的檔案：

```bash
rm -rf build/generated/ksp
```

重建您的專案。

### 保持不變的部分

| 註解 | 狀態 |
|------------|--------|
| `@Singleton` / `@Single` | ✅ 相同 |
| `@Factory` | ✅ 相同 |
| `@Scoped` | ✅ 相同 |
| `@KoinViewModel` | ✅ 相同 |
| `@KoinWorker` | ✅ 相同 |
| `@Named` | ✅ 相同 |
| `@InjectedParam` | ✅ 相同 |
| `@Property` | ✅ 相同 |
| `@Module` | ✅ 相同 |
| `@ComponentScan` | ✅ 相同 |
| `@Configuration` | ✅ 相同 |

### 變更的部分

| 面向 | KSP | 編譯器外掛程式 |
|--------|-----|-----------------|
| 組建外掛程式 | `com.google.devtools.ksp` | `io.insert-koin.compiler.plugin` |
| 相依性 | `ksp()` 配置 | 不需要 |
| 產生的檔案 | 在 `build/` 中可見 | 無 |
| Koin 啟動 | `modules(AppModule().module)` | `startKoin<MyApp>()` |
| KMP 設定 | 各平台 KSP | 只需外掛程式 |

## 時程表

:::warning
KSP 註解將在未來的 Koin 版本中移除。我們建議儘快遷移。
:::

## 協助

如果您在遷移過程中遇到問題：
- 檢查 [疑難排解](/docs/reference/koin-core/troubleshooting)
- 在 [Slack](https://kotlinlang.slack.com/messages/koin/) 上詢問
- 在 [GitHub](https://github.com/InsertKoinIO/koin) 上提交問題 (issue)

## 下一步

- **[遷移指南](/docs/migration/from-ksp-to-compiler-plugin)** - 遷移至編譯器外掛程式的逐步指南
- **[編譯器外掛程式設定](/docs/setup/compiler-plugin)** - 完整的設定指南