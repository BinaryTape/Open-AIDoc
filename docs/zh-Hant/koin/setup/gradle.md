---
title: Gradle 設定
---

# Gradle 設定

本頁面列出了各個平台以及每個已發佈 Koin 構件的 Gradle 相依性。範例使用 Kotlin DSL (`build.gradle.kts`) 以及版本目錄（version catalog）。若要新增編譯期檢查與編譯器外掛程式 DSL，也請依照 [編譯器外掛程式設定](/docs/setup/compiler-plugin) 進行操作。

## 版本 {id="versions"}

所有 Koin 程式庫（包含 `koin-annotations`）皆共用同一個版本。目前的穩定版本為 4.2.2。

- Koin: [![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-core?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-core)

所有構件均託管於 [Maven Central](https://central.sonatype.com/search?q=io.insert-koin) 的 `io.insert-koin` 群組下。版本歷史記錄與升級說明請參閱 [版本發佈](/docs/support/releases)。

## Koin BOM {id="koin-bom"}

Koin BOM（物料清單，bill of materials）將每個 Koin 程式庫固定在同一個版本。你只需宣告一次 BOM 版本，之後新增 Koin 程式庫時便無需指定版本。當你更新 BOM 時，所有 Koin 程式庫都會同步更新。

在 `gradle/libs.versions.toml` 中：

```toml
[versions]
koin = "4.2.2"

[libraries]
koin-bom = { module = "io.insert-koin:koin-bom", version.ref = "koin" }
koin-core = { module = "io.insert-koin:koin-core" }
koin-android = { module = "io.insert-koin:koin-android" }
koin-compose = { module = "io.insert-koin:koin-compose" }
koin-compose-viewmodel = { module = "io.insert-koin:koin-compose-viewmodel" }
koin-compose-viewmodel-navigation = { module = "io.insert-koin:koin-compose-viewmodel-navigation" }
koin-ktor = { module = "io.insert-koin:koin-ktor" }
koin-logger-slf4j = { module = "io.insert-koin:koin-logger-slf4j" }
koin-annotations = { module = "io.insert-koin:koin-annotations" }
koin-test = { module = "io.insert-koin:koin-test" }
koin-test-junit4 = { module = "io.insert-koin:koin-test-junit4" }
```

在模組的 `build.gradle.kts` 中：

```kotlin
dependencies {
    implementation(platform(libs.koin.bom))
    implementation(libs.koin.android)
}
```

若不使用版本目錄：

```kotlin
dependencies {
    implementation(platform("io.insert-koin:koin-bom:4.2.2"))
    implementation("io.insert-koin:koin-android")
    testImplementation("io.insert-koin:koin-test-junit4")
}
```

在單一相依性上所指定的版本僅會覆寫該相依性的 BOM 版本。除非你需要某個程式庫較新發佈版本中的修正，否則請盡量避免這樣做。

### 不使用 BOM {id="without-the-bom"}

你也可以在每個程式庫上個別指定版本。這也是 [Koin 範例](https://github.com/InsertKoinIO/koin-getting-started) 所採用的方式，且在 Kotlin Multiplatform 原始碼集中也能以相同方式運作：

```toml
[versions]
koin = "4.2.2"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-android = { module = "io.insert-koin:koin-android", version.ref = "koin" }
```

請對所有 Koin 程式庫保持使用單一 `koin` 版本：不支援混合使用不同版本。

## Kotlin/JVM {#kotlin}

```kotlin
dependencies {
    implementation(platform(libs.koin.bom))
    implementation(libs.koin.core)
}
```

接著在 `main` 中啟動 Koin。請參閱 [啟動 Koin](/docs/reference/koin-core/starting-koin) 與 [Kotlin 教學](/docs/quickstart/kotlin)。

## Android {#android}

```kotlin
dependencies {
    implementation(platform(libs.koin.bom))
    implementation(libs.koin.android)
}
```

`koin-android` 包含 `koin-core` 以及 ViewModel 支援。在你的 `Application` 類別中啟動 Koin：請參閱 [在 Android 上啟動 Koin](/docs/reference/koin-android/start)。

選用的 Android 程式庫：

| 構件 | 新增功能 |
|----------|------|
| `koin-androidx-workmanager` | WorkManager 背景工作程式：請參閱 [WorkManager](/docs/reference/koin-android/workmanager) |
| `koin-androidx-navigation` | 作用域限定於 Navigation 圖的 ViewModel（Fragment） |
| `koin-androidx-startup` | 使用 AndroidX App Startup 啟動 Koin |
| `koin-android-compat` | 從 Java 類別進行注入的 Java 幫助程式 |
| `koin-dagger-bridge` | 在遷移期間從 Koin 使用 Dagger 組件 |

## 搭配 Jetpack Compose 的 Android {#compose-android}

```kotlin
dependencies {
    implementation(platform(libs.koin.bom))
    implementation(libs.koin.android)
    implementation(libs.koin.compose)
    implementation(libs.koin.compose.viewmodel)
}
```

`koin-androidx-compose` 是僅限 Android 的構件，透過單一相依性同時引入了 `koin-compose` 與 `koin-compose-viewmodel`。兩種設定方式皆可運作。

若需要導航支援，請新增下列其中之一：

| 構件 | 導航程式庫 |
|----------|--------------------|
| `koin-androidx-compose-navigation` | Navigation Compose 2，僅限 Android |
| `koin-compose-viewmodel-navigation` | Navigation Compose 2，多平台 |
| `koin-compose-navigation3` | Navigation 3：請參閱 [Navigation 3](/docs/reference/koin-compose/navigation3) |

有關 API 的詳細資訊，請參閱 [Koin for Compose](/docs/reference/koin-compose/compose)。

## Compose Multiplatform {#compose}

在共用模組中，將 Compose 程式庫新增至 `commonMain`。在多平台原始碼集中，請使用帶有版本的目錄項目（參閱 [不使用 BOM](#without-the-bom)）：

```kotlin
kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation(libs.koin.core)
            implementation(libs.koin.compose)
            implementation(libs.koin.compose.viewmodel)
            implementation(libs.koin.compose.viewmodel.navigation) // 若你使用 Navigation Compose
        }
    }
}
```

在 Android 上，`koin-compose` 會自動引入 `koin-android`，因此你無需手動新增。請參閱 [Compose Multiplatform 教學](/docs/quickstart/cmp)。

## Kotlin Multiplatform {#kotlin-multiplatform}

在共用模組的 `build.gradle.kts` 中，使用帶有版本的目錄項目（參閱 [不使用 BOM](#without-the-bom)）：

```kotlin
kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation(libs.koin.core)
        }
        androidMain.dependencies {
            implementation(libs.koin.android)
        }
        commonTest.dependencies {
            implementation(libs.koin.test)
        }
    }
}
```

`koin-core` 支援 JVM、Android、Apple 目標平台（iOS、macOS、tvOS、watchOS）、Linux、Windows、JS 與 Wasm（`wasmJs`）。專案結構與特定平台定義請參閱 [Kotlin Multiplatform 設定](/docs/reference/koin-core/kmp-setup)。

## Ktor {#ktor}

```kotlin
dependencies {
    implementation(platform(libs.koin.bom))
    implementation(libs.koin.ktor)
    implementation(libs.koin.logger.slf4j)
}
```

在你的 Ktor 應用程式中安裝 Koin 外掛程式：請參閱 [Koin for Ktor](/docs/reference/koin-ktor/ktor)。

## 測試 {#testing}

```kotlin
dependencies {
    testImplementation(libs.koin.test)
    testImplementation(libs.koin.test.junit4) // 或 koin-test-junit5
}
```

對於 Android 儀器化測試（instrumented tests），請將 `koin-android-test` 新增至 `androidTestImplementation`。請參閱 [在測試中進行注入](/docs/reference/koin-test/testing) 與 [Android 儀器化測試](/docs/reference/koin-android/instrumented-testing)。

## 所有構件 {id="all-artifacts"}

| 構件 | 平台 | 說明 |
|----------|-----------|-------------|
| `koin-bom` | 全部 | 下方所有構件的物料清單（BOM） |
| `koin-core` | 全部 | 容器、DSL、作用域、編譯器外掛程式 DSL |
| `koin-core-coroutines` | 全部 | 延遲模組與背景載入 |
| `koin-core-viewmodel` | 全部 | 適用於 Android 與 Compose Multiplatform 的 ViewModel 定義 |
| `koin-annotations` | 全部 | 用於編譯器外掛程式的註解（`@Singleton`、`@Module`、`@Named`...） |
| `koin-android` | Android | Android context、Activity 與 Fragment API、ViewModel |
| `koin-android-compat` | Android | Java 相容性幫助程式 |
| `koin-androidx-navigation` | Android | 作用域限定於 Navigation 圖的 ViewModel |
| `koin-androidx-workmanager` | Android | WorkManager 整合 |
| `koin-androidx-startup` | Android | AndroidX App Startup 整合 |
| `koin-dagger-bridge` | Android | 從 Koin 存取 Dagger 組件 |
| `koin-compose` | 所有 Compose 目標 | `koinInject()`、`KoinApplication` 與 Compose context |
| `koin-compose-viewmodel` | 所有 Compose 目標 | `koinViewModel()` |
| `koin-compose-viewmodel-navigation` | 所有 Compose 目標 | 作用域限定於 Navigation Compose 返回堆疊項目的 ViewModel |
| `koin-compose-navigation3` | 所有 Compose 目標 | Navigation 3 整合 |
| `koin-androidx-compose` | Android | 適用於 Android 的 `koin-compose` 與 `koin-compose-viewmodel` 組合套件 |
| `koin-androidx-compose-navigation` | Android | 適用於 Android 的 Navigation Compose 2 |
| `koin-ktor` | JVM、JS、Wasm、iOS、macOS（Ktor 伺服器目標） | Ktor 伺服器外掛程式 |
| `koin-logger-slf4j` | JVM | SLF4J 記錄器 |
| `koin-test` | 全部 | 測試 API：`KoinTest`、`verify()` |
| `koin-test-coroutines` | JVM | 延遲模組的驗證 |
| `koin-test-junit4` | JVM | JUnit 4 規則 |
| `koin-test-junit5` | JVM | JUnit 5 擴充套件 |
| `koin-android-test` | Android | 儀器化測試幫助程式 |

Koin 編譯器外掛程式是一個 Gradle 外掛程式，而非程式庫：它有自己的專屬版本。請參閱 [編譯器外掛程式設定](/docs/setup/compiler-plugin)。

## 相關內容 {id="related"}

- [編譯器外掛程式設定](/docs/setup/compiler-plugin)：新增編譯器外掛程式與編譯期檢查。
- [設定](/docs/setup)：各平台所需安裝的內容。
- [啟動 Koin](/docs/reference/koin-core/starting-koin)：在相依性配置就緒後啟動容器。
- [教學](/docs/quickstart/kotlin)：在各平台上建立第一個應用程式。
- [版本發佈](/docs/support/releases)：版本與升級說明。