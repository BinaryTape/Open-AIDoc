---
title: KSP 處理器設定（已棄用）
---

# KSP 處理器設定（已棄用）

本頁記錄了 `koin-ksp-compiler` 的 Gradle 設定，該工具是用於讀取 Koin 註解的 KSP 處理器。保留此頁面是為了供仍在使用它的專案參考。新專案請使用 [Koin 編譯器外掛程式](/docs/setup/compiler-plugin)。

:::warning
`koin-ksp-compiler` 已棄用，並將在未來的 Koin 版本中移除。註解本身並未被棄用：`koin-annotations` 是 Koin 主專案的一部分，由 Koin 編譯器外掛程式處理。改變的只有處理器。請參閱[從 KSP 遷移至編譯器外掛程式](/docs/migration/from-ksp-to-compiler-plugin)。
:::

## 何時保留 KSP 處理器 {id="when-to-keep-the-ksp-processor"}

僅在以下情況下短期保留：

- **Kotlin 版本**：您的專案尚無法升級至編譯器外掛程式所要求的 Kotlin 2.3.20 或更高版本。
- **遷移進行中**：您需要在能夠切換建置之前交付版本。

與編譯器外掛程式相比，KSP 處理器會產生可見的原始碼檔案，需要為每個 Kotlin Multiplatform 目標進行單獨的 KSP 配置，並使用產生的擴充功能（例如 `AppModule().module`）來啟動 Koin。

## Gradle 設定 {id="gradle-setup"}

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

使用 KSP 時，`koin-annotations` 與 `koin-ksp-compiler` 使用的是 Koin Annotations 版本（`$koin_ksp_version`），而非 Koin 版本。而使用編譯器外掛程式時，`koin-annotations` 會遵循 Koin 版本。

### 版本相容性 {id="version-compatibility"}

| Koin Annotations | KSP | Kotlin |
|------------------|-----|--------|
| 1.4 | 1.9 | 1.9 |
| 2.0 | 2.0 | 2.0 |
| 2.1, 2.2 | 2.1, 2.2 | 2.1, 2.2 |
| 2.3 | 2.3 | 獨立 |

## 使用產生的模組啟動 Koin {id="starting-koin-with-generated-modules"}

KSP 會為每個 `@Module` 類別產生一個 `.module` 擴充功能：

```kotlin
import org.koin.ksp.generated.*

@Single
class MyComponent

@Module
@ComponentScan
class MyModule

fun main() {
    startKoin {
        modules(MyModule().module)
    }
}
```

## 編譯期檢查 {id="compile-time-check"}

KSP 處理器具備專屬的配置檢查功能，可透過 KSP 引數啟用：

```kotlin
// build.gradle.kts
ksp {
    arg("KOIN_CONFIG_CHECK", "true")
}
```

編譯器外掛程式將其取代為對完整圖形以及每個 `get()` 呼叫點的檢查。請參閱[編譯期安全性](/docs/reference/koin-compiler/compile-safety)。

## Kotlin Multiplatform {id="kotlin-multiplatform"}

KSP 需要為每個目標進行一項配置：

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
    add("kspAndroid", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosX64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosArm64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosSimulatorArm64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
}
```

使用編譯器外掛程式時，您只需套用一次外掛程式，並將 `koin-annotations` 新增至 `commonMain`。

## 遷移至編譯器外掛程式 {id="moving-to-the-compiler-plugin"}

遷移過程中會完整保留已標註註解的類別。您只需移除 KSP 和 `koin-ksp-compiler`、套用編譯器外掛程式、刪除產生的原始碼，並將 `modules(MyModule().module)` 替換為 `startKoin<MyApp>()`。詳細逐步指南請參閱[從 KSP 遷移至編譯器外掛程式](/docs/migration/from-ksp-to-compiler-plugin)。

如果遇到問題，可以在 [Kotlin Slack #koin 頻道](https://kotlinlang.slack.com/messages/koin/)提問，或是在 [InsertKoinIO/koin-annotations](https://github.com/InsertKoinIO/koin-annotations) 上回報問題。

## 相關內容 {id="related"}

- [從 KSP 遷移](/docs/migration/from-ksp-to-compiler-plugin)：逐步遷移指南。
- [編譯器外掛程式設定](/docs/setup/compiler-plugin)：安裝替代方案。
- [選擇您的風格](/docs/intro/choosing-your-style)：註解與其他風格。
- [註解參考手冊](/docs/reference/koin-annotations/annotations-inventory)：完整註解清單。