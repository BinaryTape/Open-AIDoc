[//]: # (title: 改善編譯時間的小技巧)

<show-structure depth="1"/>

Kotlin/Native 編譯器不斷收到改進其效能的更新。透過使用最新的 Kotlin/Native 編譯器和正確設定的建置環境，您可以顯著縮短具有 Kotlin/Native 目標的專案編譯時間。

請閱讀以下關於如何加速 Kotlin/Native 編譯過程的小技巧。

## 一般建議 {id="general-recommendations"}

### 使用最新版本的 Kotlin {id="use-the-latest-version-of-kotlin"}

透過這種方式，您始終可以獲得最新的效能改善。最新的 Kotlin 版本是 %kotlinVersion%。

### 避免建立巨大的類別 {id="avoid-creating-huge-classes"}

嘗試避免建立在執行期間需要很長時間來編譯和載入的巨大類別。

### 在建置之間保留下載和快取的組件 {id="preserve-downloaded-and-cached-components-between-builds"}

編譯專案時，Kotlin/Native 會下載所需的組件，並將其部分工作結果快取到 `$USER_HOME/.konan` 目錄中。編譯器會在後續編譯中使用此目錄，從而縮短完成時間。

在容器（例如 Docker）中或使用持續整合系統進行建置時，編譯器可能必須為每次建置從頭開始建立 `~/.konan` 目錄。為了避免此步驟，請設定您的環境以在建置之間保留 `~/.konan`。例如，使用 `konan.data.dir` Gradle 屬性重新定義其位置。

或者，您可以使用 `-Xkonan-data-dir` 編譯器選項，透過 `cinterop` 和 `konanc` 工具來設定目錄的自訂路徑。

## Gradle 設定 {id="gradle-configuration"}

由於需要下載相依性、建立快取以及執行額外步驟，使用 Gradle 進行的第一次編譯通常比後續編譯花費更多時間。您應該至少建置專案兩次，以獲得實際編譯時間的準確讀數。

以下是設定 Gradle 以獲得更好編譯效能的一些建議。

### 增加 Gradle 堆積大小 {id="increase-gradle-heap-size"}

要增加 [Gradle 堆積大小](https://docs.gradle.org/current/userguide/performance.html#adjust_the_daemons_heap_size)，請將 `org.gradle.jvmargs=-Xmx3g` 新增到您的 `gradle.properties` 檔案中。

如果您使用 [並行建置](https://docs.gradle.org/current/userguide/performance.html#parallel_execution)，您可能需要使用 `org.gradle.workers.max` 屬性或 `--max-workers` 命令列選項來選擇正確的背景工作執行緒數量。預設值為 CPU 處理器數量。

### 僅建置必要的二進位檔 {id="build-only-necessary-binaries"}

除非確實需要，否則請勿執行建置整個專案的 Gradle 任務，例如 `build` 或 `assemble`。這些任務會多次建置相同的程式碼，進而增加編譯時間。在典型情況下，例如從 IntelliJ IDEA 執行測試或從 Xcode 啟動應用程式，Kotlin 工具會避免執行不必要的任務。

如果您有非典型情況或組建組態，您可能需要自己選擇任務：

* `linkDebug*`。要在開發期間執行您的程式碼，您通常只需要一個二進位檔，因此執行對應的 `linkDebug*` 任務就足夠了。
* `embedAndSignAppleFrameworkForXcode`。由於 iOS 模擬器和裝置具有不同的處理器架構，通常的做法是將 Kotlin/Native 二進位檔作為通用 (fat) framework 分發。

  然而，在本機開發期間，僅為您正在使用的平台建置 `.framework` 檔案會更快。要建置特定平台的架構，請使用 [embedAndSignAppleFrameworkForXcode](https://kotlinlang.org/docs/multiplatform/multiplatform-direct-integration.html#connect-the-framework-to-your-project) 任務。

### 僅針對必要的目標進行建置 {id="build-only-for-necessary-targets"}

與上述建議類似，請勿一次為所有原生平台建置二進位檔。例如，編譯 [XCFramework](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html#build-xcframeworks)（使用 `*XCFramework` 任務）會為所有目標建置相同的程式碼，這比為單個目標建置花費的時間成比例增加。

如果您確實需要 XCFramework 進行設定，則可以減少目標數量。例如，如果您不在基於 Intel 的 Mac 上的 iOS 模擬器上執行此專案，則不需要 `iosX64`。

> 不同目標的二進位檔是使用 `linkDebug*$Target` 和 `linkRelease*$Target` Gradle 任務建置的。您可以透過使用 `--scan` 選項執行 Gradle 建置，在建置日誌或 [Gradle 建置掃描](https://docs.gradle.org/current/userguide/build_scans.html) 中查看已執行的任務。
>
{style="tip"}

### 不要建置不必要的 release 二進位檔 {id="don-t-build-unnecessary-release-binaries"}

Kotlin/Native 支援兩種建置模式：[debug 和 release](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html#declare-binaries)。Release 模式經過高度最佳化，這需要很多時間：編譯 release 二進位檔所花費的時間比 debug 二進位檔多出一個數量級。

除了實際發布外，所有這些最佳化在典型的開發週期中可能都是不必要的。如果您在開發過程中使用名稱中包含 `Release` 的任務，請考慮將其替換為 `Debug`。同樣地，您可以執行例如 `assembleSharedDebugXCFramework` 來代替 `assembleXCFramework`。

> Release 二進位檔是使用 `linkRelease*` Gradle 任務建置的。您可以透過使用 `--scan` 選項執行 Gradle 建置，在建置日誌或 [Gradle 建置掃描](https://docs.gradle.org/current/userguide/build_scans.html) 中檢查它們。
>
{style="tip"}

### 啟用 release 二進位檔的快取 {id="enable-caches-for-release-binaries"}
<primary-label ref="experimental-opt-in"/>

預設情況下，Kotlin/Native 會在連結時間最佳化 (link-time optimization, LTO) 模式下編譯 release 二進位檔：所有模組都會一起編譯和最佳化。這使 release 二進位檔在執行階段更快，但會顯著增加編譯時間。

如果您希望優先考慮更快的編譯速度而不是某些編譯器最佳化，可以在 release 模式下啟用快取。要啟用快取，請將以下兩個選項新增到您的 `gradle.properties` 檔案中：

```properties
# 啟用編譯器在 release 模式下使用快取
kotlin.native.binary.enableReleaseBinaryCache=true
# 讓 Kotlin Gradle 外掛程式使用 `-Xauto-cache-from` 和相關選項呼叫編譯器
kotlin.internal.native.enableReleaseBinaryCache=true
```

> 此功能目前正在積極開發中，因此執行階段效能仍有改進空間。效能改進計畫在即將推出的 Kotlin 版本中提供。
> 
{style="warning"}

### 縮小 release 二進位檔的大小 {id="reduce-the-size-of-release-binaries"}
<primary-label ref="experimental-opt-in"/>

要縮小 release 二進位檔的大小並改善建置時間，請嘗試 [啟用二進位檔選項](native-binary-options.md#how-to-enable) `smallBinary`。

這會有效地將 `-Oz` 設定為編譯器在 LLVM 編譯階段的預設最佳化引數。此選項仍處於 [實驗階段](components-stability.md#stability-levels-explained)，且在某些情況下可能會影響執行階段效能。

### 不要使用傳遞性匯出 (transitive export) {id="don-t-use-transitive-export"}

在許多情況下，使用 [`transitiveExport = true`](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html#export-dependencies-to-binaries) 會停用無效程式碼刪除，因此編譯器必須處理大量未使用的程式碼。這會增加編譯時間。相反地，應明確使用 `export` 方法來匯出所需的專案和相依性。

### 不要過度匯出模組 {id="don-t-export-modules-too-much"}

嘗試避免不必要的 [模組匯出](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html#export-dependencies-to-binaries)。每個匯出的模組都會對編譯時間和二進位檔大小產生負面影響。

### 使用 Gradle 建置快取 {id="use-gradle-build-caching"}

啟用 Gradle [建置快取](https://docs.gradle.org/current/userguide/build_cache.html) 功能：

* **本機建置快取**：對於本機快取，請將 `org.gradle.caching=true` 新增到您的 `gradle.properties` 檔案中，或在命令列中使用 `--build-cache` 選項執行建置。
* **遠端建置快取**：了解如何為持續整合環境 [設定遠端建置快取](https://docs.gradle.org/current/userguide/build_cache.html#sec:build_cache_configure_remote)。

### 使用 Gradle 設定快取 {id="use-gradle-configuration-cache"}

Gradle [設定快取](https://docs.gradle.org/current/userguide/configuration_cache.html) 透過快取設定階段的結果來提高建置效能。它還允許在單個專案中並行執行獨立任務，並隱含地啟用 `org.gradle.parallel` 屬性，允許不同專案之間的任務 [並行執行](https://docs.gradle.org/current/userguide/performance.html#sec:enable_parallel_execution)。

要使用 Gradle 設定快取，請將 `org.gradle.configuration-cache=true` 屬性新增到您的 `gradle.properties` 檔案中。

> 設定快取還允許並行執行 `link*` 任務，這可能會使機器負擔沈重，特別是在具有大量 CPU 核心的情況下。此問題將在 [KT-70915](https://youtrack.jetbrains.com/issue/KT-70915) 中修復。
>
{style="note"}

### 啟用先前停用的功能 {id="enable-previously-disabled-features"}

您過去可能停用過某些 Kotlin/Native 功能以避開建置問題。例如：

* `kotlin.native.disableCompilerDaemon=true` 會停用 [Gradle daemon](https://docs.gradle.org/current/userguide/gradle_daemon.html)。
* `disableNativeCache` 會停用 [編譯快取](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#binaries)。

最初需要這些變通方法的問題可能已經修復。如果您的 `gradle.properties` 檔案或 Gradle 建置檔案包含這些行，請將其移除並檢查建置是否成功完成。

### 嘗試 klib 構件的增量編譯 {id="try-incremental-compilation-of-klib-artifacts"}
<primary-label ref="beta"/>

使用增量編譯，如果專案模組產生的 `klib` 構件僅有一部分發生變更，則只有該 `klib` 的一部分會被進一步重新編譯為二進位檔。

此功能目前處於 [Beta 階段](components-stability.md#stability-levels-explained)。要啟用它，請將以下選項新增到您的 `gradle.properties` 檔案中：

```properties
kotlin.incremental.native=true
```

如果您遇到任何問題，請在 [YouTrack 中建立問題](https://kotl.in/issue)。

## Windows 設定 {id="windows-configuration"}

Windows 安全性可能會降低 Kotlin/Native 編譯器的速度。您可以透過將 `.konan` 目錄（預設位於 `%\USERPROFILE%`）新增到 Windows 安全性排除項中來避免這種情況。了解如何 [將排除項新增至 Windows 安全性](https://support.microsoft.com/en-us/windows/add-an-exclusion-to-windows-security-811816c0-4dfd-af4a-47e4-c301afe13b26)。

## LLVM 設定 {id="llvm-configuration"}
<primary-label ref="advanced"/>

如果上述技巧無助於改善編譯時間，請考慮 [自訂 LLVM 後端](native-llvm-passes.md)。