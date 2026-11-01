---
title: 設定
---

# 設定

本節說明為了使用 Koin 需要在 Gradle 建置中加入哪些內容。請在下方選擇你的平台，然後依照 [Gradle 設定](/docs/setup/gradle) 的連結章節進行操作。如果你尚未選擇宣告樣式，請先閱讀 [選擇你的樣式](/docs/intro/choosing-your-style)：這決定了你是否還需要編譯器外掛程式 (Compiler Plugin)。

## 安裝項目 {id="what-to-install"}

| 平台 | 構件 (Artifacts) | 設定 |
|----------|-----------|-------|
| Kotlin/JVM | `koin-core` | [Kotlin/JVM](/docs/setup/gradle#kotlin) |
| Android | `koin-android` | [Android](/docs/setup/gradle#android) |
| 搭配 Jetpack Compose 的 Android | `koin-android`, `koin-compose`, `koin-compose-viewmodel` | [Jetpack Compose](/docs/setup/gradle#compose-android) |
| Compose Multiplatform | `koin-compose`, `koin-compose-viewmodel` | [Compose Multiplatform](/docs/setup/gradle#compose) |
| Kotlin Multiplatform | `commonMain` 中的 `koin-core` | [Kotlin Multiplatform](/docs/setup/gradle#kotlin-multiplatform) |
| Ktor | `koin-ktor`, `koin-logger-slf4j` | [Ktor](/docs/setup/gradle#ktor) |
| 測試 | `koin-test`、`koin-test-junit4` 或 `koin-test-junit5` | [測試](/docs/setup/gradle#testing) |

## 建議設定 {id="recommended-setup"}

對於新專案：

1. **Koin BOM**：匯入 `io.insert-koin:koin-bom` 並宣告不帶版本的 Koin 構件，以確保它們版本始終相容匹配。請參閱 [Gradle 設定](/docs/setup/gradle)。
2. **Koin 編譯器外掛程式**：套用 Gradle 外掛程式 `io.insert-koin.compiler.plugin` 以取得具備編譯期檢查的 Compiler Plugin DSL 或註解。這需要 Kotlin 2.3.20 或更新版本。請參閱 [編譯器外掛程式設定](/docs/setup/compiler-plugin)。

若你僅使用 Constructor DSL 或 Classic DSL，步驟 1 就足夠了。但仍建議執行步驟 2：它能為這些定義加入編譯期檢查。

:::warning
KSP 處理器 `koin-ksp-compiler` 已棄用。其設定僅保留在 [KSP 處理器設定](/docs/setup/annotations-ksp) 中供現有專案參考。新專案請使用編譯器外掛程式。
:::

## 版本 {id="versions"}

| 組建 | 目前版本 | Kotlin |
|-----------|-----------------|----------|
| Koin（所有程式庫，包含 `koin-annotations`） | 4.2.2 | 以 2.3.20 建置 |
| Koin 編譯器外掛程式 | 1.2.1 | 已在 2.3.20、2.4.0、2.4.10、2.4.20 上驗證（需要 Koin 4.2.0+） |

最新發佈版本：

- Koin: [![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-core?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-core)
- Koin Compiler Plugin: [![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-compiler-plugin?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-compiler-plugin)

較舊的 Koin 系列版本：

| Koin | Kotlin | 編譯器外掛程式 |
|------|--------|-----------------|
| 4.2.x | 2.3.20+ | 是 |
| 4.1.x | 2.1+ | 否，僅支援 KSP 處理器 |
| 4.0.x | 1.9+ | 否，僅支援 KSP 處理器 |
| 3.5.x | 1.8+ | 否 |

版本之間的變更與升級方式請參閱 [版本發佈](/docs/support/releases)。

## 相關內容 {id="related"}

- [Gradle 設定](/docs/setup/gradle)：BOM 與所有 Koin 構件。
- [編譯器外掛程式設定](/docs/setup/compiler-plugin)：安裝與設定外掛程式。
- [選擇你的樣式](/docs/intro/choosing-your-style)：各樣式需要哪些配置。
- [教學](/docs/quickstart/kotlin)：在各平台上建置第一個應用程式。
- [版本發佈](/docs/support/releases)：版本與升級說明。