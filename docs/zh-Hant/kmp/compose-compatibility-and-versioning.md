[//]: # (title: 相容性與版本)

Compose Multiplatform 版本的發布與 Kotlin 及 Jetpack Compose 的發布各自獨立。此頁面包含有關 Compose Multiplatform 版本發布、Compose 發布週期以及元件相容性的資訊。
如需所支援 IDE 版本的詳細資訊，請參閱[建議的 IDE 與程式碼編輯器](recommended-ides.md)。

由於 Compose Multiplatform 是建構於 Kotlin Multiplatform 之上，因此它也會受到[Kotlin Multiplatform 相容性指南](multiplatform-compatibility-guide.md)中列出的 Kotlin Multiplatform Gradle 外掛程式、Gradle、Android Gradle Plugin 與 Xcode 版本相容性的影響。

## 支援的平台 {id="supported-platforms"}

Compose Multiplatform %org.jetbrains.compose% 支援以下平台：

| 平台 | 最低版本要求 |
|----------|------------------------------------------------------------------------------------------------------|
| Android  | Android 5.0 (API 層級 21) |
| iOS      | iOS 14                                                                                               |
| macOS    | macOS 13 arm64                                                                                       |
| Windows  | Windows 10 (x86-64, arm64)                                                                           |
| Linux    | Ubuntu 20.04 (x86-64, arm64)                                                                         |
| Web      | 具備 [WasmGC 支援](https://kotlinlang.org/docs/wasm-configuration.html#browser-versions) 的瀏覽器 |

> 所有 Compose Multiplatform 版本僅支援 64 位元平台。
> 
{style="note"}

## Kotlin 相容性 {id="kotlin-compatibility"}

最新的 Compose Multiplatform 始終與最新版本的 Kotlin 相容。
無需手動對齊它們的版本。
請記住，使用任一產品的 EAP 版本可能仍存在不穩定性。

Compose Multiplatform 需要套用與 Kotlin Multiplatform 外掛程式版本相同的 Compose Compiler Gradle 外掛程式。
詳情請參閱[遷移 Compose Multiplatform 專案](compose-compiler.md#migrating-a-compose-multiplatform-project)。

從 Compose Multiplatform 1.8.0 開始，該 UI 架構已完全過渡至 K2 編譯器。
若要使用最新的 Compose Multiplatform 版本：

 * 您的專案請至少使用 Kotlin 2.1.0，
 * 僅在以 Compose Multiplatform 為基礎的程式庫針對至少 Kotlin 2.1.0 進行編譯時才依賴它們，
 * 對於針對支援快速發展的平台（如 iOS 和 Web）的專案，請升級至 Kotlin **2.2.20**。
 
在所有相依性更新完成之前，作為回溯相容性問題的因應措施，您可以在 Gradle 組建檔案中使用 [`disableNativeCache`](multiplatform-dsl-reference.md#binaries) DSL 關閉 Gradle 快取。
這將確保與較舊程式庫的相容性，但會增加編譯時間。

## Compose Multiplatform 桌面版發布的限制 {id="limitations-of-compose-multiplatform-for-desktop-releases"}

由於 [Skia](https://skia.org/) 繫結中使用的記憶體管理配置，Compose Multiplatform 桌面版僅支援 JDK 11 或更新版本。

此外：
* 由於 [`jpackage`](https://docs.oracle.com/en/java/javase/17/docs/specs/man/jpackage.html) 的限制，打包原生發行套件僅支援 JDK 17 或更新版本。
* 在 macOS 上切換鍵盤配置時，OpenJDK 11.0.12 存在一個已知的[問題](https://github.com/JetBrains/compose-multiplatform/issues/940)。
  此問題在 OpenJDK 11.0.15 中無法重現。

## Jetpack Compose 與 Compose Multiplatform 發布週期 {id="jetpack-compose-and-compose-multiplatform-release-cycles"}

Compose Multiplatform 與 Google 開發的 Android [Jetpack Compose](https://developer.android.com/jetpack/compose) 架構共享大量程式碼。我們將 Compose Multiplatform 發布週期與 Jetpack Compose 的發布週期對齊，以確保通用程式碼經過妥善測試與穩定。

當發布新版本的 Jetpack Compose 時，我們會：

1. 使用該發布提交作為下一個 [Compose Multiplatform](https://github.com/JetBrains/androidx) 版本的基礎。
2. 新增對新平台特性的支援。
3. 穩定所有平台。
4. 發布新版本的 Compose Multiplatform。

Compose Multiplatform 發布與 Jetpack Compose 發布之間的時間間隔通常為 1 到 3 個月。

### Compose Multiplatform 開發版本 {id="development-versions-of-compose-multiplatform"}

Compose Multiplatform 編譯器外掛程式的開發版本（例如 `1.8.2+dev2544`）是在沒有固定排程的情況下建構的，用以在正式發布之間測試更新。

這些組建在 [Maven Central](https://central.sonatype.com/) 中不提供。
若要存取它們，請將此行新增至您的存儲庫清單中：

```kotlin
maven("https://redirector.kotlinlang.org/maven/compose-dev")
```

### 使用的 Jetpack Compose 建置產物 {id="jetpack-compose-artifacts-used"}

當您為 Android 建置應用程式時，Compose Multiplatform 會使用 Google 發布的建置產物。

下表列出了每個 Compose Multiplatform 版本使用的 Jetpack Compose 建置產物版本：

| Compose Multiplatform 版本 | Jetpack Compose 版本 |
|-----------------------------------------------------------------------------------|-------------------------|
| [1.12.2](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.12.2) | 1.12.1                  |
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