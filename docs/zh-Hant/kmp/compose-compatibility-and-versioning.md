[//]: # (title: 相容性與版本)

Compose Multiplatform 的發佈與 Kotlin 及 Jetpack Compose 的發佈是分開的。本頁面包含有關 Compose Multiplatform 發佈、Compose 發佈週期以及組件相容性的資訊。
有關支援的 IDE 版本詳細資訊，請參閱[建議的 IDE 與程式碼編輯器](recommended-ides.md)。

由於 Compose Multiplatform 是建構於 Kotlin Multiplatform 之上，因此也會受到 [Kotlin Multiplatform 相容性指南](multiplatform-compatibility-guide.md)中列出的 Kotlin Multiplatform Gradle 外掛程式、Gradle、Android Gradle 外掛程式以及 Xcode 版本相容性的影響。

## 支援的平台 {id="supported-platforms"}

Compose Multiplatform %org.jetbrains.compose% 支援以下平台：

| 平台 | 最低版本 |
|----------|------------------------------------------------------------------------------------------------------|
| Android  | Android 5.0 (API level 21)                                                                           |
| iOS      | iOS 14                                                                                               |
| macOS    | macOS 13 arm64                                                                                       |
| Windows  | Windows 10 (x86-64, arm64)                                                                           |
| Linux    | Ubuntu 20.04 (x86-64, arm64)                                                                         |
| Web      | 支援 [WasmGC](https://kotlinlang.org/docs/wasm-configuration.html#browser-versions) 的瀏覽器 |

> 所有 Compose Multiplatform 發佈版本僅支援 64 位元平台。 
> 
{style="note"}

## Kotlin 相容性 {id="kotlin-compatibility"}

最新版本的 Compose Multiplatform 始終與最新版本的 Kotlin 相容。
無需手動對齊它們的版本。
請記住，使用任一產品的早期體驗計劃 (EAP) 版本仍可能不穩定。

Compose Multiplatform 要求套用的 Compose 編譯器 Gradle 外掛程式版本必須與 Kotlin Multiplatform 外掛程式版本一致。
詳情請參閱 [undefined](compose-compiler.md#migrating-a-compose-multiplatform-project)。

從 Compose Multiplatform 1.8.0 開始，UI 架構已完全遷移至 K2 編譯器。
若要使用最新的 Compose Multiplatform 發佈版本：

 * 專案請使用至少 Kotlin 2.1.0 版本，
 * 僅在以至少 Kotlin 2.1.0 編譯的情況下，才依賴於以 Compose Multiplatform 為基礎的程式庫，
 * 對於針對支援快速發展平台（如 iOS 和 Web）的專案，請升級至 Kotlin **2.2.20**。
 
作為在所有相依性更新之前的回溯相容性問題規避方法，您可以透過在 Gradle 組建檔案中使用 [`disableNativeCache`](multiplatform-dsl-reference.md#binaries) DSL 來關閉 Gradle 快取。
這將確保與舊程式庫的相容性，但會增加編譯時間。

## Compose Multiplatform 桌面版發佈的限制 {id="limitations-of-compose-multiplatform-for-desktop-releases"}

由於 [Skia](https://skia.org/) 繫結中使用的記憶體管理方案，Compose Multiplatform 桌面版僅支援 JDK 11 或更高版本。

此外：
* 由於 [`jpackage`](https://docs.oracle.com/en/java/javase/17/docs/specs/man/jpackage.html) 的限制，打包原生發行版本僅支援 JDK 17 或更高版本。
* 在 macOS 上切換鍵盤配置時，OpenJDK 11.0.12 存在一個已知[問題](https://github.com/JetBrains/compose-multiplatform/issues/940)。
  此問題在 OpenJDK 11.0.15 中無法重現。

## Jetpack Compose 與 Compose Multiplatform 發佈週期 {id="jetpack-compose-and-compose-multiplatform-release-cycles"}

Compose Multiplatform 與由 Google 開發的 Android 架構 [Jetpack Compose](https://developer.android.com/jetpack/compose) 共用大量程式碼。我們將 Compose Multiplatform 的發佈週期與 Jetpack Compose 的發佈週期保持一致，以便對通用程式碼進行適當的測試和穩定化處理。

當 Jetpack Compose 的新版本發佈時，我們：

1. 使用該發佈提交作為下一個 [Compose Multiplatform](https://github.com/JetBrains/androidx) 版本的基礎。
2. 增加對新平台特性的支援。
3. 穩定所有平台。
4. 發佈 Compose Multiplatform 的新版本。

Compose Multiplatform 的發佈與 Jetpack Compose 發佈之間的間隔通常為 1–3 個月。

### Compose Multiplatform 的開發版本 {id="development-versions-of-compose-multiplatform"}

Compose Multiplatform 編譯器外掛程式的開發版本（例如 `1.8.2+dev2544`）是在沒有固定時程的情況下組建的，用於測試正式發佈版本之間的更新。

這些組建無法在 [Maven Central](https://central.sonatype.com/) 中取得。
若要存取它們，請將此行加入到您的存儲庫清單中：

```kotlin
maven("https://redirector.kotlinlang.org/maven/compose-dev")
```

### 使用的 Jetpack Compose 構件 {id="jetpack-compose-artifacts-used"}

當您為 Android 建置應用程式時，Compose Multiplatform 會使用 Google 發佈的構件。

下表列出了各個版本的 Compose Multiplatform 所使用的 Jetpack Compose 構件版本：

| Compose Multiplatform 版本 | Jetpack Compose 版本 |
|-----------------------------------------------------------------------------------|-------------------------|
| [1.12.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.12.1) | 1.12.1                  |
| [1.11.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.11.1) | 1.11.2                  |
| [1.10.3](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.10.3) | 1.10.5                  |
| [1.9.3](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.9.3)   | 1.9.4                   |
| [1.8.2](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.8.2)   | 1.8.2                   |
| [1.7.3](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.7.3)   | 1.7.6                   |
| [1.7.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.7.1)   | 1.7.5                   |
| [1.7.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.7.0)   | 1.7.1                   |
| [1.6.11](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.6.11) | 1.6.7                   |
| [1.6.10](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.6.10) | 1.6.7                   |
| [1.6.2](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.6.2)   | 1.6.4                   |
| [1.6.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.6.1)   | 1.6.3                   |
| [1.6.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.6.0)   | 1.6.1                   |
| [1.5.12](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.5.12) | 1.5.4                   |
| [1.5.11](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.5.11) | 1.5.4                   |
| [1.5.10](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.5.10) | 1.5.4                   |
| [1.5.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.5.1)   | 1.5.0                   |
| [1.5.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.5.0)   | 1.5.0                   |
| [1.4.3](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.4.3)   | 1.4.3                   |
| [1.4.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.4.1)   | 1.4.3                   |
| [1.4.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.4.0)   | 1.4.0                   |
| [1.3.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.3.1)   | 1.3.3                   |
| [1.3.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.3.0)   | 1.3.3                   |
| [1.2.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.2.1)   | 1.2.1                   |
| [1.2.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.2.0)   | 1.2.1                   |
| [1.1.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.1.1)   | 1.1.0                   |
| [1.1.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.1.0)   | 1.1.0                   |
| [1.0.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.0.1)   | 1.1.0-beta02            |
| [1.0.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.0.0)   | 1.1.0-beta02            |