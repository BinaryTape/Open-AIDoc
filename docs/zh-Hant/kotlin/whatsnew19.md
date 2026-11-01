[//]: # (title: Kotlin 1.9.0 的新功能)

<web-summary>閱讀 Kotlin 1.9.0 版本資訊，涵蓋新語言特性、Kotlin Multiplatform、JVM、Native、JS 與 Wasm 的更新，以及對 Gradle 和 Maven 的建置工具支援。</web-summary>

_[發佈日期：2023 年 7 月 6 日](releases.md#release-history)_

Kotlin 1.9.0 現已發佈，適用於 JVM 的 K2 編譯器現已進入 **Beta** 階段。此外，以下是一些主要亮點：

* [全新 Kotlin K2 編譯器更新](#new-kotlin-k2-compiler-updates)
* [列舉類別 values 函式的穩定替代方案](#stable-replacement-of-the-enum-class-values-function)
* [用於開區間範圍的穩定 `..<` 運算子](#stable-operator-for-open-ended-ranges)
* [依名稱取得正規表示式捕獲群組的新通用函式](#new-common-function-to-get-regex-capture-group-by-name)
* [建立父目錄的新路徑公用程式](#new-path-utility-to-create-parent-directories)
* [Kotlin Multiplatform 中 Gradle 組態快取的預覽](#preview-of-the-gradle-configuration-cache)
* [Kotlin Multiplatform 中對 Android 目標支援的變更](#changes-to-android-target-support)
* [Kotlin/Native 中自訂記憶體分配器的預覽](#preview-of-custom-memory-allocator)
* [Kotlin/Native 中的程式庫連結](#library-linkage-in-kotlin-native)
* [Kotlin/Wasm 中與大小相關的最佳化](#size-related-optimizations)

你也可以在此影片中找到這些更新的簡要概覽：

<video src="https://www.youtube.com/v/fvwTZc-dxsM" title="What's new in Kotlin 1.9.0"/>

> 關於 Kotlin 發佈週期的資訊，請參閱 [Kotlin 發佈流程](releases.md)。
>
{style="tip"}

## IDE 支援 {id="ide-support"}

支援 1.9.0 的 Kotlin 外掛程式適用於：

| IDE | 支援的版本 |
|--|--|
| IntelliJ IDEA | 2022.3.x, 2023.1.x |
| Android Studio | Giraffe (223), Hedgehog (231)* |

*Kotlin 1.9.0 外掛程式將包含在即將發佈的 Android Studio Giraffe (223) 與 Hedgehog (231) 中。

Kotlin 1.9.0 外掛程式將包含在即將發佈的 IntelliJ IDEA 2023.2 中。

> 若要下載 Kotlin 產物與相依性，請[配置你的 Gradle 設定](#configure-gradle-settings)以使用 Maven Central 存儲庫。
>
{style="warning"}

## 全新 Kotlin K2 編譯器更新 {id="new-kotlin-k2-compiler-updates"}

JetBrains 的 Kotlin 團隊持續致力於使 K2 編譯器更加穩定，而 1.9.0 版本帶來了進一步的進展。
適用於 JVM 的 K2 編譯器現已進入 **Beta** 階段。

現在也提供了對 Kotlin/Native 與多平台專案的基本支援。

### kapt 編譯器外掛程式與 K2 編譯器的相容性 {id="compatibility-of-the-kapt-compiler-plugin-with-the-k2-compiler"}

你可以在專案中將 [kapt 外掛程式](kapt.md)與 K2 編譯器一起使用，但存在一些限制。
即使將 `languageVersion` 設定為 `2.0`，kapt 編譯器外掛程式仍會使用舊編譯器。

如果你在將 `languageVersion` 設定為 `2.0` 的專案中執行 kapt 編譯器外掛程式，kapt 將自動切換到 `1.9` 並停用特定版本相容性檢查。此行為相當於包含以下指令引數：
* `-Xskip-metadata-version-check`
* `-Xskip-prerelease-check`
* `-Xallow-unstable-dependencies`

這些檢查僅針對 kapt 任務停用。所有其他編譯任務將繼續使用新的 K2 編譯器。

如果你在將 kapt 與 K2 編譯器搭配使用時遇到任何問題，請回報至我們的[問題追蹤器](http://kotl.in/issue)。

### 在專案中試用 K2 編譯器 {id="try-the-k2-compiler-in-your-project"}

從 1.9.0 開始直到 Kotlin 2.0 發佈，你可以透過在 `gradle.properties` 檔案中加入 `kotlin.experimental.tryK2=true` Gradle 屬性來輕鬆測試 K2 編譯器。你也可以執行以下指令：

```shell
./gradlew assemble -Pkotlin.experimental.tryK2=true
```

此 Gradle 屬性會自動將語言版本設定為 2.0，並在建置報告中更新使用 K2 編譯器與當前編譯器編譯的 Kotlin 任務數量：

```none
##### 'kotlin.experimental.tryK2' results (Kotlin/Native not checked) #####
:lib:compileKotlin: 2.0 language version
:app:compileKotlin: 2.0 language version
##### 100% (2/2) tasks have been compiled with Kotlin 2.0 #####
```

### Gradle 建置報告 {id="gradle-build-reports"}

[Gradle 建置報告](gradle-compilation-and-caches.md#build-reports)現在會顯示編譯程式碼時使用的是當前編譯器還是 K2 編譯器。在 Kotlin 1.9.0 中，你可以在 [Gradle build scans](https://scans.gradle.com/) 中看到此資訊：

![Gradle build scan - K1](gradle-build-scan-k1.png){width=700}

![Gradle build scan - K2](gradle-build-scan-k2.png){width=700}

你也可以直接在建置報告中找到專案中使用的 Kotlin 版本：

```none
Task info:
  Kotlin language version: 1.9
```

> 如果你使用 Gradle 8.0，可能會在建置報告中遇到一些問題，特別是在啟用 Gradle 組態快取時。這是一個已知問題，已在 Gradle 8.1 及更高版本中修復。
>
{style="note"}

### 當前 K2 編譯器的限制 {id="current-k2-compiler-limitations"}

在 Gradle 專案中啟用 K2 存在某些限制，在以下情況下可能會影響使用 8.3 以下 Gradle 版本的專案：

* 編譯來自 `buildSrc` 的原始碼。
* 編譯包含建置（included builds）中的 Gradle 外掛程式。
* 編譯其他 Gradle 外掛程式（如果它們用於 Gradle 版本低於 8.3 的專案中）。
* 建置 Gradle 外掛程式相依性。

如果遇到上述任何問題，可以採取以下步驟解決：

* 為 `buildSrc`、任何 Gradle 外掛程式及其相依項設定語言版本：

```kotlin
kotlin {
    compilerOptions {
        languageVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_1_9)
        apiVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_1_9)
    }
}
```

* 當 Gradle 8.3 可用時，將專案中的 Gradle 版本更新至 8.3。

### 留下你對新 K2 編譯器的回饋 {id="leave-your-feedback-on-the-new-k2-compiler"}

我們非常感謝你的任何回饋！

* 直接在 Kotlin 的 Slack 上向 K2 開發者提供回饋——[取得邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)並加入 [#k2-early-adopters](https://kotlinlang.slack.com/archives/C03PK0PE257) 頻道。
* 在[我們的問題追蹤器](https://kotl.in/issue)上回報你在新 K2 編譯器中遇到的任何問題。
* [啟用 **Send usage statistics**（傳送使用統計資料）選項](https://www.jetbrains.com/help/idea/settings-usage-statistics.html)，允許 JetBrains 收集有關 K2 使用情況的匿名資料。

## 語言 {id="language"}

在 Kotlin 1.9.0 中，我們穩定了先前引入的一些新語言特性：
* [列舉類別 values 函式的替代方案](#stable-replacement-of-the-enum-class-values-function)
* [與資料類別對稱的資料物件](#stable-data-objects-for-symmetry-with-data-classes)
* [支援在 inline value 類別中使用帶有主體的次建構函式](#support-for-secondary-constructors-with-bodies-in-inline-value-classes)

### 列舉類別 values 函式的穩定替代方案 {id="stable-replacement-of-the-enum-class-values-function"}

在 1.8.20 中，列舉類別的 `entries` 屬性作為實驗功能引入。`entries` 屬性是合成 `values()` 函式的現代且高效能的替代方案。在 1.9.0 中，`entries` 屬性已進入穩定（Stable）階段。

> `values()` 函式仍然受支援，但我們建議改用 `entries` 屬性。
>
{style="tip"}

```kotlin
enum class Color(val colorName: String, val rgb: String) {
    RED("Red", "#FF0000"),
    ORANGE("Orange", "#FF7F00"),
    YELLOW("Yellow", "#FFFF00")
}

fun findByRgb(rgb: String): Color? = Color.entries.find { it.rgb == rgb }
```
{validate="false"}

關於列舉類別 `entries` 屬性的更多資訊，請參閱 [Kotlin 1.8.20 的新功能](whatsnew1820.md#a-modern-and-performant-replacement-of-the-enum-class-values-function)。

### 與資料類別對稱的穩定資料物件 {id="stable-data-objects-for-symmetry-with-data-classes"}

在 [Kotlin 1.8.20](whatsnew1820.md#preview-of-data-objects-for-symmetry-with-data-classes) 中引入的資料物件（data object）宣告現已進入穩定階段。這包括為了與資料類別對稱而加入的函式：`toString()`、`equals()` 和 `hashCode()`。

此特性在 `sealed` 階層結構（例如 `sealed class` 或 `sealed interface` 階層結構）中特別實用，因為 `data object` 宣告可以方便地與 `data class` 宣告一起使用。在此範例中，將 `EndOfFile` 宣告為 `data object` 而不是普通 `object`，意味著它會自動擁有 `toString()` 函式，而無需手動覆寫。這保持了與隨附資料類別定義的對稱性。

```kotlin
sealed interface ReadResult
data class Number(val number: Int) : ReadResult
data class Text(val text: String) : ReadResult
data object EndOfFile : ReadResult

fun main() {
    println(Number(7)) // Number(number=7)
    println(EndOfFile) // EndOfFile
}
```
{validate="false"}

更多資訊請參閱 [Kotlin 1.8.20 的新功能](whatsnew1820.md#preview-of-data-objects-for-symmetry-with-data-classes)。

### 支援在 inline value 類別中使用帶有主體的次建構函式 {id="support-for-secondary-constructors-with-bodies-in-inline-value-classes"}

從 Kotlin 1.9.0 開始，在 [inline value 類別](inline-classes.md)中使用帶有主體的次建構函式預設可用：

```kotlin
@JvmInline
value class Person(private val fullName: String) {
    // 自 Kotlin 1.4.30 起允許：
    init {
        check(fullName.isNotBlank()) {
            "Full name shouldn't be empty"
        }
    }
    // 自 Kotlin 1.9.0 起預設允許：
    constructor(name: String, lastName: String) : this("$name $lastName") {
        check(lastName.isNotBlank()) {
            "Last name shouldn't be empty"
        }
    }
}
```
{validate="false"}

以前，Kotlin 在 inline 類別中只允許公開的主建構函式。因此，無法封裝底層值或建立表示某些受限值的 inline 類別。

隨著 Kotlin 的發展，這些問題得到了修復。Kotlin 1.4.30 解除了對 `init` 區塊的限制，隨後 Kotlin 1.8.20 預覽了帶有主體的次建構函式。它們現在預設可用。在[這篇 KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/inline-classes.md) 中進一步了解 Kotlin inline 類別的發展。

## Kotlin/JVM {id="kotlin-jvm"}

從 1.9.0 版開始，編譯器可以產生對應於 JVM 20 位元組碼版本的類別。此外，對 `JvmDefault` 註解和舊版 `-Xjvm-default` 模式的棄用仍在繼續。

### 棄用 JvmDefault 註解與舊版 -Xjvm-default 模式 {id="deprecation-of-jvmdefault-annotation-and-legacy-xjvm-default-modes"}

從 Kotlin 1.5 開始，`JvmDefault` 註解的使用已被棄用，轉而使用較新的 `-Xjvm-default` 模式：`all` 和 `all-compatibility`。隨著 Kotlin 1.4 中引入的 `JvmDefaultWithoutCompatibility` 與 Kotlin 1.6 中引入的 `JvmDefaultWithCompatibility`，這些模式為 `DefaultImpls` 類別的產生提供了全面的控制，確保與舊版 Kotlin 程式碼的無縫相容性。

因此在 Kotlin 1.9.0 中，`JvmDefault` 註解不再具有任何意義，並已被標記為棄用且會導致錯誤。它最終將從 Kotlin 中移除。

## Kotlin/Native {id="kotlin-native"}

除了其他改進之外，此版本還對 [Kotlin/Native 記憶體管理器](native-memory-manager.md)進行了進一步的提升，應能增強其強健性與效能：

* [自訂記憶體分配器預覽](#preview-of-custom-memory-allocator)
* [主執行緒上的 Objective-C 或 Swift 物件釋放掛鉤](#objective-c-or-swift-object-deallocation-hook-on-the-main-thread)
* [在 Kotlin/Native 中存取常數值時不會初始化物件](#no-object-initialization-when-accessing-constant-values-in-kotlin-native)
* [能夠為 Kotlin/Native 中的 iOS 模擬器測試設定獨立模式](#ability-to-configure-standalone-mode-for-ios-simulator-tests-in-kotlin-native)
* [Kotlin/Native 中的程式庫連結](#library-linkage-in-kotlin-native)

### 自訂記憶體分配器預覽 {id="preview-of-custom-memory-allocator"}

Kotlin 1.9.0 引入了自訂記憶體分配器的預覽。其分配系統改善了 [Kotlin/Native 記憶體管理器](native-memory-manager.md)的執行時期效能。

Kotlin/Native 目前的物件分配系統使用的是不具備高效垃圾收集功能的通用分配器。為了彌補這點，它在垃圾收集器 (GC) 將所有已分配物件合併到單一清單之前，為其維護執行緒區域的鏈結串列，該清單可在清除（sweeping）期間進行反覆運算。這種方法存在幾項效能缺點：

* 清除順序缺乏記憶體區域性（memory locality），通常會導致分散的記憶體存取模式，進而引發潛在的效能問題。
* 鏈結串列需要為每個物件提供額外的記憶體，增加了記憶體使用量，尤其是在處理許多小型物件時。
* 單一的已分配物件清單使得平行化清除變得困難，當變更執行緒（mutator threads）分配物件的速度快於 GC 執行緒收集它們的速度時，可能會導致記憶體使用量問題。

為了解決這些問題，Kotlin 1.9.0 引入了自訂分配器的預覽。它將系統記憶體劃分為分頁（pages），允許按連續順序進行獨立清除。每次分配都會成為分頁內的記憶體區塊，分頁會追蹤區塊大小。不同的分頁類型針對各種分配大小進行了最佳化。記憶體區塊的連續排列確保能高效反覆運算所有已分配的區塊。

當執行緒分配記憶體時，它會根據分配大小搜尋合適的分頁。執行緒會針對不同大小類別維護一組分頁。通常，給定大小的當前分頁即可容納該分配。如果不行，執行緒會從共享分配空間請求另一個分頁。該分頁可能已可用、需要清除，或者需要先建立。

新的分配器允許同時擁有數個獨立的分配空間，這將使 Kotlin 團隊能夠嘗試不同的分頁配置，以進一步提升效能。

關於新分配器設計的更多資訊，請參閱此 [README](https://github.com/JetBrains/kotlin/blob/master/kotlin-native/runtime/src/alloc/custom/README.md)。

#### 如何啟用 {id="how-to-enable"}

新增 `-Xallocator=custom` 編譯器選項：

```kotlin
kotlin {
    macosX64("native") {
        binaries.executable()

        compilations.configureEach {
            compilerOptions.configure {
                freeCompilerArgs.add("-Xallocator=custom")
            }
        }
    }
}
```
{validate="false"}

#### 留下回饋 {id="leave-feedback"}

歡迎你在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-55364/Implement-custom-allocator-for-Kotlin-Native) 中留下回饋，以協助改進自訂分配器。

### 主執行緒上的 Objective-C 或 Swift 物件釋放掛鉤 {id="objective-c-or-swift-object-deallocation-hook-on-the-main-thread"}

從 Kotlin 1.9.0 開始，如果 Objective-C 或 Swift 物件是在主執行緒傳遞給 Kotlin 的，其物件釋放掛鉤（deallocation hook）就會在主執行緒上呼叫。[Kotlin/Native 記憶體管理器](native-memory-manager.md)先前處理 Objective-C 物件參照的方式可能會導致記憶體洩漏。我們相信這項新行為應該會提升記憶體管理器的強健性。

考慮一個在 Kotlin 程式碼中被參照的 Objective-C 物件，例如當它作為引數傳遞、由函式回傳或從集合中檢索時。在這種情況下，Kotlin 會建立自己的物件來持有對該 Objective-C 物件的參照。當 Kotlin 物件被釋放時，Kotlin/Native 執行階段會呼叫 `objc_release` 函式來釋放該 Objective-C 參照。

以前，Kotlin/Native 記憶體管理器會在特殊的 GC 執行緒上執行 `objc_release`。如果是最後一個物件參照，該物件就會被釋放。當 Objective-C 物件具有自訂釋放掛鉤（例如 Objective-C 中的 `dealloc` 方法或 Swift 中的 `deinit` 區塊），且這些掛鉤期望在特定執行緒上呼叫時，就可能會出現問題。

由於主執行緒上的物件掛鉤通常期望在該執行緒上呼叫，因此 Kotlin/Native 執行階段現在也會在主執行緒上呼叫 `objc_release`。這應該涵蓋了在主執行緒上將 Objective-C 物件傳遞給 Kotlin 並在該處建立對等 Kotlin 物件的情況。這僅在主分派佇列（main dispatch queue）正在處理時有效，常規 UI 應用程式即是如此。當不是主佇列或物件是在非主執行緒上傳遞給 Kotlin 時，`objc_release` 會像以前一樣在特殊的 GC 執行緒上呼叫。

#### 如何選擇退出 {id="how-to-opt-out"}

如果遇到問題，你可以在 `gradle.properties` 檔案中使用以下選項停用此行為：

```none
kotlin.native.binary.objcDisposeOnMain=false
```

歡迎隨時向[我們的問題追蹤器](http://kotl.in/issue)回報此類情況。

### 在 Kotlin/Native 中存取常數值時不會初始化物件 {id="no-object-initialization-when-accessing-constant-values-in-kotlin-native"}

從 Kotlin 1.9.0 開始，Kotlin/Native 後端在存取 `const val` 欄位時不會初始化物件：

```kotlin
object MyObject {
    init {
        println("side effect!")
    }

    const val y = 1
}

fun main() {
    println(MyObject.y) // 起初沒有初始化
    val x = MyObject    // 發生初始化
    println(x.y)
}
```
{validate="false"}

此行為現在與 Kotlin/JVM 統一，後者的實作與 Java 一致，在此情況下永遠不會初始化物件。得益於此變更，你也可以期待 Kotlin/Native 專案獲得一些效能改進。

### 能夠為 Kotlin/Native 中的 iOS 模擬器測試設定獨立模式 {id="ability-to-configure-standalone-mode-for-ios-simulator-tests-in-kotlin-native"}

預設情況下，為 Kotlin/Native 執行 iOS 模擬器測試時，會使用 `--standalone` 旗標以避免手動開機和關閉模擬器。在 1.9.0 中，你現在可以透過 `standalone` 屬性在 Gradle 任務中設定是否使用此旗標。預設情況下會使用 `--standalone` 旗標，因此獨立模式處於啟用狀態。

以下是如何在 `build.gradle.kts` 檔案中停用獨立模式的範例：

```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.targets.native.tasks.KotlinNativeSimulatorTest>().configureEach {
    standalone.set(false)
}
```
{validate="false"}

> 如果停用獨立模式，則必須手動啟動模擬器。若要從命令列啟動模擬器，可以使用以下指令：
>
> ```shell
> /usr/bin/xcrun simctl boot <DeviceId>
>```
>
{style="warning"}

### Kotlin/Native 中的程式庫連結 {id="library-linkage-in-kotlin-native"}

從 Kotlin 1.9.0 開始，Kotlin/Native 編譯器處理 Kotlin 程式庫中的連結問題的方式與 Kotlin/JVM 相同。如果某個第三方 Kotlin 程式庫的作者在另一個第三方 Kotlin 程式庫所使用的實驗性 API 中進行了不相容的變更，你可能會遇到此類問題。

現在，當第三方 Kotlin 程式庫之間發生連結問題時，建置不會在編譯期間失敗。相反地，你只會在執行階段遇到這些錯誤，這與 JVM 上的情況完全相同。

Kotlin/Native 編譯器每次偵測到程式庫連結問題時都會回報警告。你可以在編譯日誌中找到此類警告，例如：

```text
No function found for symbol 'org.samples/MyRemovedClass.doSomething|3657632771909858561[0]'

Can not get instance of singleton 'MyEnumClass.REMOVED_ENTRY': No enum entry found for symbol 'org.samples/MyEnumClass.REMOVED_ENTRY|null[0]'

Function 'getMyRemovedClass' can not be called: Function uses unlinked class symbol 'org.samples/MyRemovedClass|null[0]'
```

你可以在專案中進一步配置甚至停用此行為：

* 如果不想在編譯日誌中看到這些警告，可以使用 `-Xpartial-linkage-loglevel=INFO` 編譯器選項將其抑制。
* 也可以使用 `-Xpartial-linkage-loglevel=ERROR` 將回報的警告嚴重性提高為編譯錯誤。在這種情況下，編譯會失敗，你將在編譯日誌中看到所有錯誤。使用此選項可以更深入地檢查連結問題。
* 如果遇到此功能的非預期問題，你隨時可以使用 `-Xpartial-linkage=disable` 編譯器選項選擇退出。歡迎隨時向[我們的問題追蹤器](https://kotl.in/issue)回報此類情況。

```kotlin
// 透過 Gradle 建置檔案傳遞編譯器選項的範例。
kotlin {
    macosX64("native") {
        binaries.executable()

        compilations.configureEach {
            compilerOptions.configure {
                // 抑制連結警告：
                freeCompilerArgs.add("-Xpartial-linkage-loglevel=INFO")

                // 將連結警告提升為錯誤：
                freeCompilerArgs.add("-Xpartial-linkage-loglevel=ERROR")

                // 完全停用該功能：
                freeCompilerArgs.add("-Xpartial-linkage=disable")
            }
        }
    }
}
```
{validate="false"}

### 用於 C 互通隱式整數轉換的編譯器選項 {id="compiler-option-for-c-interop-implicit-integer-conversions"}

我們引入了一個用於 C 互通的編譯器選項，允許你使用隱式整數轉換。經過仔細考慮，我們引入了這個編譯器選項來防止無意的誤用，因為該功能仍有改進空間，而我們的目標是提供最高品質的 API。

在此程式碼範例中，即使 [`options`](https://developer.apple.com/documentation/foundation/nscalendar/options) 是無正負號型別 `UInt` 且 `0` 是帶正負號的，隱式整數轉換仍允許 `options = 0`。

```kotlin
val today = NSDate()
val tomorrow = NSCalendar.currentCalendar.dateByAddingUnit(
    unit = NSCalendarUnitDay,
    value = 1,
    toDate = today,
    options = 0
)
```
{validate="false"}

若要在原生互通程式庫中使用隱式轉換，請使用 `-XXLanguage:+ImplicitSignedToUnsignedIntegerConversion` 編譯器選項。

你可以在 Gradle 的 `build.gradle.kts` 檔案中對此進行設定：
```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinNativeCompile>().configureEach {
    compilerOptions.freeCompilerArgs.addAll(
        "-XXLanguage:+ImplicitSignedToUnsignedIntegerConversion"
    )
}
```
{validate="false"}

## Kotlin Multiplatform {id="kotlin-multiplatform"}

Kotlin Multiplatform 在 1.9.0 中獲得了一些值得注意的更新，旨在改善你的開發者體驗：

* [對 Android 目標支援的變更](#changes-to-android-target-support)
* [預設啟用新的 Android 原始碼集配置](#new-android-source-set-layout-enabled-by-default)
* [多平台專案中 Gradle 組態快取的預覽](#preview-of-the-gradle-configuration-cache)

### 對 Android 目標支援的變更 {id="changes-to-android-target-support"}

我們持續致力於穩定 Kotlin Multiplatform。重要的一步是為 Android 目標提供一等公民支援。我們很高興地宣布，未來來自 Google 的 Android 團隊將提供自己的 Gradle 外掛程式來支援 Kotlin Multiplatform 中的 Android。

為了為 Google 的這項新解決方案鋪平道路，我們在 1.9.0 中重新命名了當前 Kotlin DSL 中的 `android` 區塊。請在建置指令碼中將所有出現的 `android` 區塊變更為 `androidTarget`。這是一項暫時性的變更，必須為即將推出的 Google DSL 騰出 `android` 名稱。

Google 外掛程式將成為在多平台專案中使用 Android 的首選方式。準備就緒後，我們將提供必要的遷移指引，以便你可以像以前一樣使用簡短的 `android` 名稱。

### 預設啟用新的 Android 原始碼集配置 {id="new-android-source-set-layout-enabled-by-default"}

從 Kotlin 1.9.0 開始，新的 Android 原始碼集配置（source set layout）成為預設值。它取代了先前的目錄命名架構，該架構在多個方面容易引起混淆。新配置具有許多優點：

* 簡化的型別語意——新的 Android 原始碼配置提供了清晰且一致的命名慣例，有助於區分不同類型的原始碼集。
* 改進的原始碼目錄配置——在新的配置下，`SourceDirectories` 的排列更加連貫，使組織程式碼和尋找原始檔變得更容易。
* 清晰的 Gradle 配置命名架構——該架構現在在 `KotlinSourceSets` 與 `AndroidSourceSets` 中更加一致且可預測。

新配置需要 Android Gradle 外掛程式版本 7.0 或更高版本，並在 Android Studio 2022.3 及更高版本中受支援。請參閱我們的[遷移指南](https://kotlinlang.org/docs/multiplatform/multiplatform-android-layout.html)，以在你的 `build.gradle(.kts)` 檔案中進行必要的變更。

### Gradle 組態快取預覽 {id="preview-of-the-gradle-configuration-cache"}

<p id="preview-of-gradle-configuration-cache">Kotlin 1.9.0 支援在多平台程式庫中使用 <a href="https://docs.gradle.org/current/userguide/configuration_cache.html">Gradle 組態快取</a>。如果你是程式庫作者，現在就可以從提升的建置效能中獲益。</p>

Gradle 組態快取透過在後續建置中重複使用組態階段的結果來加速建置流程。該功能自 Gradle 8.1 起已成為穩定功能。若要啟用它，請遵循 [Gradle 文件](https://docs.gradle.org/current/userguide/configuration_cache.html#config_cache:usage)中的指示。

> Kotlin Multiplatform 外掛程式目前仍不支援將 Gradle 組態快取與 Xcode 整合任務或 [Kotlin CocoaPods Gradle 外掛程式](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-dsl-reference.html)一起使用。我們期望在未來的 Kotlin 版本中新增此功能。
>
{style="note"}

## Kotlin/Wasm {id="kotlin-wasm"}

Kotlin 團隊持續嘗試新的 Kotlin/Wasm 目標。此版本引入了幾項效能與[與大小相關的最佳化](#size-related-optimizations)，以及 [JavaScript 互通性的更新](#updates-in-javascript-interop)。

### 與大小相關的最佳化 {id="size-related-optimizations"}

Kotlin 1.9.0 為 WebAssembly (Wasm) 專案帶來了顯著的大小改進。對比兩個 "Hello World" 專案，Kotlin 1.9.0 中 Wasm 的程式碼體積比 Kotlin 1.8.20 縮小了 10 倍以上。

![Kotlin/Wasm 與大小相關的最佳化](wasm-1-9-0-size-improvements.png){width=700}

這些大小最佳化使得在以 Kotlin 程式碼為 Wasm 平台為目標時，資源利用更加高效，效能也獲得提升。

### JavaScript 互通性更新 {id="updates-in-javascript-interop"}

此 Kotlin 更新對 Kotlin/Wasm 中的 Kotlin 與 JavaScript 之間的互通性進行了變更。由於 Kotlin/Wasm 是一項[實驗性](components-stability.md#stability-levels-explained)功能，因此其互通性受到某些限制。

#### 限制 Dynamic 型別 {id="restriction-of-dynamic-types"}

從 1.9.0 版開始，Kotlin 不再支援在 Kotlin/Wasm 中使用 `Dynamic` 型別。現在該型別已被棄用，改用便於 JavaScript 互通的新通用 `JsAny` 型別。

詳細資訊請參閱 [Kotlin/Wasm 與 JavaScript 互通性](wasm-js-interop.md)文件。

#### 限制非 external 型別 {id="restriction-of-non-external-types"}

在與 JavaScript 相互傳遞值時，Kotlin/Wasm 支援特定 Kotlin 靜態型別的轉換。這些受支援的型別包括：

* 基本型別，例如帶正負號的數字、`Boolean` 與 `Char`。
* `String`。
* 函式型別。

其他型別則未經轉換而作為不透明參照傳遞，導致 JavaScript 與 Kotlin 子型別化之間的不一致。

為了解決此問題，Kotlin 將 JavaScript 互通性限制在支援良好的一組型別中。從 Kotlin 1.9.0 開始，Kotlin/Wasm JavaScript 互通性僅支援 external、基本型別、字串和函式型別。此外，還引入了一個名為 `JsReference` 的獨立明確型別，表示可在 JavaScript 互通中使用的 Kotlin/Wasm 物件控制代碼。

詳細資訊請參閱 [Kotlin/Wasm 與 JavaScript 互通性](wasm-js-interop.md)文件。

### Kotlin Playground 中的 Kotlin/Wasm {id="kotlin-wasm-in-kotlin-playground"}

Kotlin Playground 現已支援 Kotlin/Wasm 目標。
你可以撰寫、執行並分享針對 Kotlin/Wasm 的 Kotlin 程式碼。[快去體驗！](https://pl.kotl.in/HDFAvimga)

> 使用 Kotlin/Wasm 需要在瀏覽器中啟用實驗功能。
>
> [進一步了解如何啟用這些功能](wasm-configuration.md)。
>
{style="note"}

```kotlin
import kotlin.time.*
import kotlin.time.measureTime

fun main() {
    println("Hello from Kotlin/Wasm!")
    computeAck(3, 10)
}

tailrec fun ack(m: Int, n: Int): Int = when {
    m == 0 -> n + 1
    n == 0 -> ack(m - 1, 1)
    else -> ack(m - 1, ack(m, n - 1))
}

fun computeAck(m: Int, n: Int) {
    var res = 0
    val t = measureTime {
        res = ack(m, n)
    }
    println()
    println("ack($m, $n) = ${res}")
    println("duration: ${t.inWholeNanoseconds / 1e6} ms")
}
```
{kotlin-runnable="true" id="kotlin-whats-new-1-9-0-kotlin-wasm-playground"}

## Kotlin/JS {id="kotlin-js"}

此版本為 Kotlin/JS 帶來了更新，包括移除舊的 Kotlin/JS 編譯器、棄用 Kotlin/JS Gradle 外掛程式，以及對 ES2015 的實驗性支援：

* [移除舊的 Kotlin/JS 編譯器](#removal-of-the-old-kotlin-js-compiler)
* [棄用 Kotlin/JS Gradle 外掛程式](#deprecation-of-the-kotlin-js-gradle-plugin)
* [棄用 external enum](#deprecation-of-external-enum)
* [對 ES2015 類別與模組的實驗性支援](#experimental-support-for-es2015-classes-and-modules)
* [變更了 JS 生產發行版的預設目的地](#changed-default-destination-of-js-production-distribution)
* [從 stdlib-js 中提取 org.w3c 宣告](#extract-org-w3c-declarations-from-stdlib-js)

> 從 1.9.0 版開始，[部分程式庫連結](#library-linkage-in-kotlin-native)也已針對 Kotlin/JS 啟用。
>
{style="note"}

### 移除舊的 Kotlin/JS 編譯器 {id="removal-of-the-old-kotlin-js-compiler"}

在 Kotlin 1.8.0 中，我們[宣布](whatsnew18.md#stable-js-ir-compiler-backend)基於 IR 的後端已達到[穩定](components-stability.md)階段。從那時起，未指定編譯器將被視為錯誤，而使用舊編譯器會導致警告。

在 Kotlin 1.9.0 中，使用舊後端會導致錯誤。請遷移至 IR 編譯器。

### 棄用 Kotlin/JS Gradle 外掛程式 {id="deprecation-of-the-kotlin-js-gradle-plugin"}

從 Kotlin 1.9.0 開始，`kotlin-js` Gradle 外掛程式已被棄用。我們建議改用包含 `js()` 目標的 `kotlin-multiplatform` Gradle 外掛程式。

Kotlin/JS Gradle 外掛程式的功能實質上與 `kotlin-multiplatform` 外掛程式重複，並在底層共享相同的實作。這種重疊造成了混淆，並增加了 Kotlin 團隊的維護負擔。

遷移指示請參閱我們的 [Kotlin Multiplatform 相容性指南](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#migration-from-kotlin-js-gradle-plugin-to-kotlin-multiplatform-gradle-plugin)。如果發現指南中未涵蓋的任何問題，請回報至我們的[問題追蹤器](http://kotl.in/issue)。

### 棄用 external enum {id="deprecation-of-external-enum"}

在 Kotlin 1.9.0 中，由於像 `entries` 這樣無法存在於 Kotlin 之外的靜態列舉成員問題，external enum 的使用將被棄用。我們建議改用帶有 object 子類別的 external sealed 類別：

```kotlin
// 修改前
external enum class ExternalEnum { A, B }

// 修改後
external sealed class ExternalEnum {
    object A: ExternalEnum
    object B: ExternalEnum
}
```
{validate="false"}

透過改用帶有 object 子類別的 external sealed 類別，你可以在實現類似於 external enum 功能的同時，避免與預設方法相關的問題。

從 Kotlin 1.9.0 開始，external enum 的使用將被標記為棄用。我們鼓勵你更新程式碼，以採用建議的 external sealed 類別實作，從而確保相容性與未來的可維護性。

### 對 ES2015 類別與模組的實驗性支援 {id="experimental-support-for-es2015-classes-and-modules"}

此版本引入了對 ES2015 模組以及產生 ES2015 類別的[實驗性](components-stability.md#stability-levels-explained)支援：
* 模組提供了一種簡化程式碼庫並提高可維護性的方法。
* 類別允許你納入物件導向程式設計 (OOP) 原則，從而產出更簡潔、更直覺的程式碼。

若要啟用這些功能，請相應地更新你的 `build.gradle.kts` 檔案：

```kotlin
// build.gradle.kts
kotlin {
    js(IR) {
        useEsModules() // 啟用 ES2015 模組
        browser()
    }
}

// 啟用 ES2015 類別產生
tasks.withType<KotlinJsCompile>().configureEach {
    kotlinOptions {
        useEsClasses = true
    }
}
```
{validate="false"}

在官方文件中[進一步了解 ES2015 (ECMAScript 2015, ES6)](https://262.ecma-international.org/6.0/)。

### 變更了 JS 生產發行版的預設目的地 {id="changed-default-destination-of-js-production-distribution"}

在 Kotlin 1.9.0 之前，發行版的目標目錄為 `build/distributions`。然而，這是 Gradle 封存檔的共用目錄。為了解決此問題，我們在 Kotlin 1.9.0 中將預設發行版目標目錄變更為：`build/dist/<targetName>/<binaryName>`。

例如，`productionExecutable` 先前位於 `build/distributions`。在 Kotlin 1.9.0 中，它位於 `build/dist/js/productionExecutable`。

> 如果你的既有管線使用了這些建置的產物，請務必更新該目錄。
>
{style="warning"}

### 從 stdlib-js 中提取 org.w3c 宣告 {id="extract-org-w3c-declarations-from-stdlib-js"}

自 Kotlin 1.9.0 起，`stdlib-js` 不再包含 `org.w3c` 宣告。相反地，這些宣告已被移至獨立的 Gradle 相依項中。當你在 `build.gradle.kts` 檔案中加入 Kotlin Multiplatform Gradle 外掛程式時，這些宣告將會像標準函式庫一樣自動包含在你的專案中。

無需任何手動操作或遷移。必要的調整將會自動處理。

## Gradle {id="gradle"}

Kotlin 1.9.0 帶來了新的 Gradle 編譯器選項以及更多內容：

* [移除了 classpath 屬性](#removed-classpath-property)
* [新的編譯器選項](#new-compiler-options)
* [Kotlin/JVM 的專案層級編譯器選項](#project-level-compiler-options-for-kotlin-jvm)
* [Kotlin/Native 模組名稱的編譯器選項](#compiler-option-for-kotlin-native-module-name)
* [官方 Kotlin 程式庫的獨立編譯器外掛程式](#separate-compiler-plugins-for-official-kotlin-libraries)
* [提高最低支援版本](#incremented-minimum-supported-version)
* [kapt 不會在 Gradle 中導致及早任務建立](#kapt-doesn-t-cause-eager-task-creation-in-gradle)
* [程式化設定 JVM 目標驗證模式](#programmatic-configuration-of-the-jvm-target-validation-mode)

### 移除了 classpath 屬性 {id="removed-classpath-property"}

在 Kotlin 1.7.0 中，我們宣布開始對 `KotlinCompile` 任務的 `classpath` 屬性進行棄用週期。在 Kotlin 1.8.0 中，棄用層級已提升為 `ERROR`。在此版本中，我們終於移除了 `classpath` 屬性。所有編譯任務現在都應使用 `libraries` 輸入來取得編譯所需的程式庫清單。

### 新的編譯器選項 {id="new-compiler-options"}

Kotlin Gradle 外掛程式現在為選擇加入（opt-in）與編譯器的漸進模式（progressive mode）提供了新屬性。

* 若要選擇加入新 API，現在可以使用 `optIn` 屬性並傳入字串清單，例如：`optIn.set(listOf(a, b, c))`。
* 若要啟用漸進模式，請使用 `progressiveMode.set(true)`。

### Kotlin/JVM 的專案層級編譯器選項 {id="project-level-compiler-options-for-kotlin-jvm"}

從 Kotlin 1.9.0 開始，在 `kotlin` 配置區塊內提供了一個新的 `compilerOptions` 區塊：

```kotlin
kotlin {
    compilerOptions {
        jvmTarget.set(JVM.Target_11)
    }
}
```
{validate="false"}

這使得設定編譯器選項變得容易得多。但是，需要注意一些重要細節：

* 此設定僅在專案層級有效。
* 對於 Android 外掛程式，此區塊設定的物件與以下內容相同：

```kotlin
android {
    kotlinOptions {}
}
```
{validate="false"}

* `android.kotlinOptions` 與 `kotlin.compilerOptions` 配置區塊會相互覆蓋。建置檔案中最後一個（最下方的）區塊一律生效。
* 如果在專案層級設定了 `moduleName`，傳遞給編譯器時其值可能會改變。`main` 編譯不會發生此情況，但對於其他類型（例如測試原始碼），Kotlin Gradle 外掛程式會加上 `_test` 後綴。
* `tasks.withType<KotlinJvmCompile>().configureEach {}`（或 `tasks.named<KotlinJvmCompile>("compileKotlin") { }`）內部的設定會覆蓋 `kotlin.compilerOptions` 和 `android.kotlinOptions`。

### Kotlin/Native 模組名稱的編譯器選項 {id="compiler-option-for-kotlin-native-module-name"}

Kotlin/Native 的 [`module-name`](compiler-reference.md#module-name-name-native) 編譯器選項現在可在 Kotlin Gradle 外掛程式中輕鬆使用。

此選項為編譯模組指定名稱，也可用於為匯出到 Objective-C 的宣告新增名稱前綴。

你現在可以直接在 Gradle 建置檔案的 `compilerOptions` 區塊中設定模組名稱：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.named<org.jetbrains.kotlin.gradle.tasks.KotlinNativeCompile>("compileKotlinLinuxX64") {
    compilerOptions {
        moduleName.set("my-module-name")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.named("compileKotlinLinuxX64", org.jetbrains.kotlin.gradle.tasks.KotlinNativeCompile.class) {
    compilerOptions {
        moduleName = "my-module-name"
    }
}
```

</tab>
</tabs>

### 官方 Kotlin 程式庫的獨立編譯器外掛程式 {id="separate-compiler-plugins-for-official-kotlin-libraries"}

Kotlin 1.9.0 為其官方程式庫引入了獨立的編譯器外掛程式。在此之前，編譯器外掛程式嵌入在相應的 Gradle 外掛程式中。若編譯器外掛程式所針對編譯的 Kotlin 版本高於 Gradle 建置的 Kotlin 執行階段版本，可能會引發相容性問題。

現在，編譯器外掛程式作為獨立相依項加入，因此你不再會遇到舊版 Gradle 的相容性問題。新方法的另一個主要優勢是，新的編譯器外掛程式可以與其他建置系統（如 [Bazel](https://bazel.build/)）一起使用。

以下是我們目前發佈至 Maven Central 的新編譯器外掛程式清單：

* kotlin-atomicfu-compiler-plugin
* kotlin-allopen-compiler-plugin
* kotlin-lombok-compiler-plugin
* kotlin-noarg-compiler-plugin
* kotlin-sam-with-receiver-compiler-plugin
* kotlinx-serialization-compiler-plugin

每個外掛程式都有其 `-embeddable` 對應項，例如 `kotlin-allopen-compiler-plugin-embeddable` 是專為搭配 `kotlin-compiler-embeddable` 產物（指令碼產物的預設選項）運作而設計的。

Gradle 會將這些外掛程式作為編譯器引數新增。你不需要對現有專案進行任何變更。

### 提高最低支援版本 {id="incremented-minimum-supported-version"}

從 Kotlin 1.9.0 開始，最低支援的 Android Gradle 外掛程式版本為 4.2.2。

請在我們的手冊中查看 [Kotlin Gradle 外掛程式與可用 Gradle 版本的相容性](gradle-configure-project.md#apply-the-plugin)。

### kapt 不會在 Gradle 中導致及早任務建立 {id="kapt-doesn-t-cause-eager-task-creation-in-gradle"}

在 1.9.0 之前，[kapt 編譯器外掛程式](kapt.md)透過請求 Kotlin 編譯任務的已設定執行個體，導致了及早任務建立（eager task creation）。此行為已在 Kotlin 1.9.0 中修復。如果你在 `build.gradle.kts` 檔案中使用預設組態，則你的設定不受此變更影響。

> 如果你使用了自訂組態，你的設定可能會受到不利影響。
> 例如，如果你已使用 Gradle 的 tasks API 修改了 `KotlinJvmCompile` 任務，則必須在建置指令碼中對 `KaptGenerateStubs` 任務進行類似的修改。
>
> 例如，如果你的指令碼對 `KotlinJvmCompile` 任務進行了以下設定：
> ```kotlin
> tasks.named<KotlinJvmCompile>("compileKotlin") { // 你的自訂配置 }
> ```
> {validate="false"}
>
> 在這種情況下，你需要確保將相同的修改包含在 `KaptGenerateStubs` 任務中：
> ```kotlin
> tasks.named<KaptGenerateStubs>("kaptGenerateStubs") { // 你的自訂配置 }
>```
> {validate="false"}
> 
{style="warning"}

更多資訊請參閱我們的 [YouTrack 票證](https://youtrack.jetbrains.com/issue/KT-54468/KAPT-Gradle-plugin-causes-eager-task-creation)。

### 程式化設定 JVM 目標驗證模式 {id="programmatic-configuration-of-the-jvm-target-validation-mode"}

在 Kotlin 1.9.0 之前，調整 Kotlin 與 Java 之間 JVM 目標不相容性偵測的唯一方法，是在 `gradle.properties` 中為整個專案設定 `kotlin.jvm.target.validation.mode=ERROR`。

你現在也可以在 `build.gradle.kts` 檔案中於任務層級對其進行設定：

```kotlin
tasks.named<org.jetbrains.kotlin.gradle.tasks.KotlinJvmCompile>("compileKotlin") {
    jvmTargetValidationMode.set(org.jetbrains.kotlin.gradle.dsl.jvm.JvmTargetValidationMode.WARNING)
}
```
{validate="false"}

## 標準函式庫 {id="standard-library"}

Kotlin 1.9.0 對標準函式庫帶來了一些重大改進：
* [`..<` 運算子](#stable-operator-for-open-ended-ranges)與[時間 API](#stable-time-api)已進入穩定階段。
* [Kotlin/Native 標準函式庫已經過全面審查與更新](#the-kotlin-native-standard-library-s-journey-towards-stabilization)
* [`@Volatile` 註解可在更多平台上使用](#stable-volatile-annotation)
* [新增了依名稱取得正規表示式捕獲群組的**通用**函式](#new-common-function-to-get-regex-capture-group-by-name)
* [引入了 `HexFormat` 類別以格式化和剖析十六進位數](#new-hexformat-class-to-format-and-parse-hexadecimals)

### 用於開區間範圍的穩定 ..< 運算子 {id="stable-operator-for-open-ended-ranges"}

在 [Kotlin 1.7.20](whatsnew1720.md#preview-of-the-operator-for-creating-open-ended-ranges) 中引入並在 1.8.0 中成為穩定版的開區間範圍新 `..<` 運算子，在 1.9.0 中，處理開區間範圍的標準函式庫 API 也達到了穩定階段。

我們的研究表明，新的 `..<` 運算子使宣告開區間範圍時更容易理解。如果使用 [`until`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/until.html) 中置函式，很容易誤以為包含了上限。

以下是使用 `until` 函式的範例：

```kotlin
fun main() {
    for (number in 2 until 10) {
        if (number % 2 == 0) {
            print("$number ")
        }
    }
    // 2 4 6 8
}
```
{validate="false"}

以下是使用新 `..<` 運算子的範例：

```kotlin
fun main() {
    for (number in 2..<10) {
        if (number % 2 == 0) {
            print("$number ")
        }
    }
    // 2 4 6 8
}
```
{validate="false"}

> 從 IntelliJ IDEA 2023.1.1 版本開始，提供了新的程式碼檢查，可在可以使用 `..<` 運算子時進行醒目提示。
>
{style="note"}

關於可以使用此運算子執行的操作的更多資訊，請參閱 [Kotlin 1.7.20 的新功能](whatsnew1720.md#preview-of-the-operator-for-creating-open-ended-ranges)。

### 穩定的時間 API {id="stable-time-api"}

自 1.3.50 起，我們預覽了新的時間測量 API。該 API 的持續時間（duration）部分在 1.6.0 中成為穩定版。在 1.9.0 中，剩餘的時間測量 API 均已達到穩定階段。

舊的時間 API 提供了 `measureTimeMillis` 和 `measureNanoTime` 函式，使用起來不夠直覺。雖然很清楚它們以不同的單位測量時間，但並不明確的是 `measureTimeMillis` 使用[掛鐘時間 (wall clock)](https://en.wikipedia.org/wiki/Elapsed_real_time) 來測量時間，而 `measureNanoTime` 使用單調時間來源（monotonic time source）。新的時間 API 解決了這些以及其他問題，使 API 更加親切易用。

透過新的時間 API，你可以輕鬆地：
* 使用單調時間來源以所需的時間單位測量執行某些程式碼所花費的時間。
* 標記時間點。
* 比較並尋找兩個時間點之間的差異。
* 檢查自特定時間點以來經過了多少時間。
* 檢查當前時間是否已超過特定時間點。

#### 測量程式碼執行時間 {id="measure-code-execution-time"}

若要測量執行程式碼區塊所需的時間，請使用 [`measureTime`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/measure-time.html) inline 函式。

若要測量執行程式碼區塊所需的時間**並**傳回該程式碼區塊的結果，請使用 [`measureTimedValue`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/measure-timed-value.html) inline 函式。

預設情況下，這兩個函式都使用單調時間來源。但是，如果你想使用經過的真實時間來源（elapsed real-time source），也可以做到。例如在 Android 上，預設時間來源 `System.nanoTime()` 僅在裝置處於活動狀態時計算時間。當裝置進入深度睡眠時，它會失去對時間的追蹤。為了在裝置處於深度睡眠時仍能追蹤時間，你可以建立一個改用 [`SystemClock.elapsedRealtimeNanos()`](https://developer.android.com/reference/android/os/SystemClock#elapsedRealtimeNanos()) 的時間來源：

```kotlin
object RealtimeMonotonicTimeSource : AbstractLongTimeSource(DurationUnit.NANOSECONDS) {
    override fun read(): Long = SystemClock.elapsedRealtimeNanos()
}
```
{validate="false"}

#### 標記與測量時間差 {id="mark-and-measure-differences-in-time"}

若要標記特定時間點，請使用 [`TimeSource`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-source/) 介面與 [`markNow()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-source/mark-now.html) 函式來建立 [`TimeMark`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-mark/)。若要測量來自同一時間來源的 `TimeMark` 之間的差異，請使用減法運算子 (`-`)：

```kotlin
import kotlin.time.*

fun main() {
    val timeSource = TimeSource.Monotonic
    val mark1 = timeSource.markNow()
    Thread.sleep(500) // 休眠 0.5 秒。
    val mark2 = timeSource.markNow()

    repeat(4) { n ->
        val mark3 = timeSource.markNow()
        val elapsed1 = mark3 - mark1
        val elapsed2 = mark3 - mark2

        println("Measurement 1.${n + 1}: elapsed1=$elapsed1, elapsed2=$elapsed2, diff=${elapsed1 - elapsed2}")
    }
    // 也可以將時間標記相互比較。
    println(mark2 > mark1) // 這是 true，因為 mark2 的捕獲時間晚於 mark1。
}
```
{kotlin-runnable="true" id="kotlin-whats-new-time-elapsed"}

若要檢查截止期限是否已過或是否已達到逾時，請使用 [`hasPassedNow()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-mark/has-passed-now.html) 和 [`hasNotPassedNow()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-mark/has-not-passed-now.html) 擴充函式：

```kotlin
import kotlin.time.*
import kotlin.time.Duration.Companion.seconds

fun main() {
    val timeSource = TimeSource.Monotonic
    val mark1 = timeSource.markNow()
    val fiveSeconds: Duration = 5.seconds
    val mark2 = mark1 + fiveSeconds

    // 尚未經過 5 秒
    println(mark2.hasPassedNow())
    // false

    // 等待六秒
    Thread.sleep(6000)
    println(mark2.hasPassedNow())
    // true
}
```
{kotlin-runnable="true" id="kotlin-whats-new-time-passednow"}

### Kotlin/Native 標準函式庫邁向穩定之路 {id="the-kotlin-native-standard-library-s-journey-towards-stabilization"}

隨著 Kotlin/Native 標準函式庫的不斷擴展，我們認為現在是進行全面審查的時候了，以確保它符合我們的高標準。作為其中的一部分，我們仔細審查了**每一個**現有的公開簽章。對於每個簽章，我們都考慮了它是否：

* 具有獨特的目的。
* 與其他 Kotlin API 一致。
* 與其在 JVM 上的對應項具有相似的行為。
* 具有未來適應性。

基於這些考量，我們做出了以下決定之一：
* 使其穩定（Stable）。
* 使其進入實驗階段（Experimental）。
* 將其標記為 `private`。
* 修改其行為。
* 將其移至不同位置。
* 棄用它。
* 將其標記為過時（obsolete）。

> 如果現有簽章已被：
> * 移至另一個套件，則該簽章仍存在於原始套件中，但現在已被棄用，棄用層級為：`WARNING`。IntelliJ IDEA 會在程式碼檢查時自動建議替換項目。
> * 棄用，則已被棄用，棄用層級為：`WARNING`。
> * 標記為過時，則你可以繼續使用它，但未來會被替換。
>
{style="note"}

我們不會在此列出審查的所有結果，但以下是一些重點：
* 我們穩定了 Atomics API。
* 我們將 [`kotlinx.cinterop`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlinx.cinterop/) 設為實驗性，現在使用該套件需要不同的選擇加入（opt-in）。更多資訊請參閱[明確的 C 互通性穩定保證](#explicit-c-interoperability-stability-guarantees)。
* 我們將 [`Worker`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.native.concurrent/-worker/) 類別及其相關 API 標記為過時。
* 我們將 [`BitSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.native/-bit-set/) 類別標記為過時。
* 我們將 `kotlin.native.internal` 套件中的所有 `public` API 標記為 `private` 或移至其他套件。

#### 明確的 C 互通性穩定保證 {id="explicit-c-interoperability-stability-guarantees"}

為了保持我們 API 的高品質，我們決定將 [`kotlinx.cinterop`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlinx.cinterop/) 設為實驗性。儘管 `kotlinx.cinterop` 已經過充分的測試與驗證，但在我們滿意並將其設為穩定版之前仍有改進空間。我們建議你使用此 API 進行互通，但儘量將其使用範圍限制在專案的特定區域內。一旦我們開始改進此 API 以使其達到穩定，這將使你的遷移更加容易。

如果你想使用類似 C 的外部 API（例如指標），必須使用 `@OptIn(ExperimentalForeignApi)` 進行選擇加入，否則程式碼將無法編譯。

若要使用 `kotlinx.cinterop` 的其餘部分（涵蓋 Objective-C/Swift 互通性），必須使用 `@OptIn(BetaInteropApi)` 進行選擇加入。如果你嘗試在未選擇加入的情況下使用此 API，程式碼仍可編譯，但編譯器會引發警告，清楚說明你可以預期的行為。

關於這些註解的更多資訊，請參閱我們的 [`Annotations.kt`](https://github.com/JetBrains/kotlin/blob/master/kotlin-native/Interop/Runtime/src/main/kotlin/kotlinx/cinterop/Annotations.kt) 原始碼。

關於作為此審查一部分的**所有**變更的更多資訊，請參閱我們的 [YouTrack 票證](https://youtrack.jetbrains.com/issue/KT-55765)。

歡迎提供任何回饋！你可以直接在該[票證](https://youtrack.jetbrains.com/issue/KT-57728)下留言提供回饋。

### 穩定的 @Volatile 註解 {id="stable-volatile-annotation"}

如果你使用 `@Volatile` 標註 `var` 屬性，則支援欄位將被標記，從而使對此欄位的任何讀取或寫入都是不可分割的（atomic），且寫入始終對其他執行緒可見。

在 1.8.20 之前，[`kotlin.jvm.Volatile` 註解](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-volatile/)在通用標準函式庫中提供。但是，該註解僅在 JVM 上有效。如果你在其他平台上使用它，它會被忽略，從而導致錯誤。

在 1.8.20 中，我們引入了一個實驗性的通用註解 `kotlin.concurrent.Volatile`，你可以在 JVM 和 Kotlin/Native 中進行預覽。

在 1.9.0 中，`kotlin.concurrent.Volatile` 已達到穩定階段。如果你在多平台專案中使用 `kotlin.jvm.Volatile`，我們建議你遷移至 `kotlin.concurrent.Volatile`。

### 依名稱取得正規表示式捕獲群組的新通用函式 {id="new-common-function-to-get-regex-capture-group-by-name"}

在 1.9.0 之前，每個平台都有自己的擴充，用於從正規表示式配對中依名稱取得正規表示式捕獲群組。但是當時沒有通用函式。在 Kotlin 1.8.0 之前不可能有通用函式，因為標準函式庫仍支援 JVM 目標 1.6 和 1.7。

從 Kotlin 1.8.0 開始，標準函式庫以 JVM 目標 1.8 編譯。因此在 1.9.0 中，現在有了一個**通用**的 [`groups`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-match-result/groups.html) 函式，可用於在正規表示式配對中依名稱檢索群組的內容。當你想要存取屬於特定捕獲群組的正規表示式配對結果時，這非常實用。

以下是一個包含三個捕獲群組（`city`、`state` 和 `areaCode`）的正規表示式範例。你可以使用這些群組名稱來存取配對的值：

```kotlin
fun main() {
    val regex = """\b(?<city>[A-Za-z\s]+),\s(?<state>[A-Z]{2}):\s(?<areaCode>[0-9]{3})\b""".toRegex()
    val input = "Coordinates: Austin, TX: 123"
    
    val match = regex.find(input)!!
    println(match.groups["city"]?.value)
    // Austin
    println(match.groups["state"]?.value)
    // TX
    println(match.groups["areaCode"]?.value)
    // 123
}
```
{validate="false"}

### 建立父目錄的新路徑公用程式 {id="new-path-utility-to-create-parent-directories"}

在 1.9.0 中，新增了一個 `createParentDirectories()` 擴充函式，可用於建立包含所有必要父目錄的新檔案。當你向 `createParentDirectories()` 提供檔案路徑時，它會檢查父目錄是否已存在。如果存在，它什麼都不做；但是如果不存在，它會為你建立它們。

`createParentDirectories()` 在複製檔案時特別實用。例如，你可以將它與 `copyToRecursively()` 函式結合使用：

 ```kotlin
sourcePath.copyToRecursively(
    destinationPath.createParentDirectories(), 
    followLinks = false
 )
 ```
{validate="false"}

### 格式化與剖析十六進位數的新 HexFormat 類別 {id="new-hexformat-class-to-format-and-parse-hexadecimals"}

> 新的 `HexFormat` 類別及其相關擴充函式處於[實驗性](components-stability.md#stability-levels-explained)階段，若要使用它們，可以使用 `@OptIn(ExperimentalStdlibApi::class)` 或編譯器引數 `-opt-in=kotlin.ExperimentalStdlibApi` 進行選擇加入。
>
{style="warning"}

在 1.9.0 中，[`HexFormat`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-hex-format/) 類別及其相關擴充函式作為實驗功能提供，允許你在數值與十六進位字串之間進行轉換。具體而言，你可以使用擴充函式在十六進位字串與 `ByteArrays` 或其他數值型別（`Int`、`Short`、`Long`）之間進行轉換。

例如：

```kotlin
println(93.toHexString()) // "0000005d"
```
{validate="false"}

`HexFormat` 類別包含可以使用 `HexFormat{}` 建構器進行設定的格式化選項。

如果你正在處理 `ByteArrays`，你可以透過屬性設定以下選項：

| 選項 | 描述 |
|--|--|
| `upperCase` | 十六進位數字為大寫還是小寫。預設採用小寫。`upperCase = false`。 |
| `bytes.bytesPerLine` | 每行最大位元組數。 |
| `bytes.bytesPerGroup` | 每組最大位元組數。 |
| `bytes.bytesSeparator` | 位元組之間的分隔符號。預設無。 |
| `bytes.bytesPrefix` | 緊接在每個位元組的兩位數十六進位表示形式之前的字串，預設無。 |
| `bytes.bytesSuffix` | 緊接在每個位元組的兩位數十六進位表示形式之後的字串，預設無。 |

例如：

```kotlin
val macAddress = "001b638445e6".hexToByteArray()

// 使用 HexFormat{} 建構器以冒號分隔十六進位字串
println(macAddress.toHexString(HexFormat { bytes.byteSeparator = ":" }))
// "00:1b:63:84:45:e6"

// 使用 HexFormat{} 建構器以：
// * 將十六進位字串轉為大寫
// * 將位元組成對分組
// * 以句點分隔
val threeGroupFormat = HexFormat { upperCase = true; bytes.bytesPerGroup = 2; bytes.groupSeparator = "." }

println(macAddress.toHexString(threeGroupFormat))
// "001B.6384.45E6"
```
{validate="false"}

如果你正在處理數值型別，你可以透過屬性設定以下選項：

| 選項 | 描述 |
|--|--|
| `number.prefix` | 十六進位字串的前綴，預設無。 |
| `number.suffix` | 十六進位字串的後綴，預設無。 |
| `number.removeLeadingZeros` | 是否移除十六進位字串中的前導零。預設不移除前導零。`number.removeLeadingZeros = false`。 |

例如：

```kotlin
// 使用 HexFormat{} 建構器剖析帶有前綴 "0x" 的十六進位數。
println("0x3a".hexToInt(HexFormat { number.prefix = "0x" })) // "58"
```
{validate="false"}

## 文件更新 {id="documentation-updates"}

Kotlin 文件迎來了一些值得注意的變更：
* [Kotlin 導覽](kotlin-tour-welcome.md)——透過包含理論與實務的各個章節學習 Kotlin 程式設計語言的基礎知識。
* [Android 原始碼集配置](https://kotlinlang.org/docs/multiplatform/multiplatform-android-layout.html)——了解新的 Android 原始碼集配置。
* [Kotlin Multiplatform 相容性指南](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html)——了解在開發 Kotlin Multiplatform 專案時可能遇到的不相容變更。
* [Kotlin Wasm](wasm-overview.md)——了解 Kotlin/Wasm 以及如何在你的 Kotlin Multiplatform 專案中使用它。

## 安裝 Kotlin 1.9.0 {id="install-kotlin-1-9-0"}

### 檢查 IDE 版本 {id="check-the-ide-version"}

[IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 2022.3.3 與 2023.1.1 會自動建議將 Kotlin 外掛程式更新至 1.9.0 版本。IntelliJ IDEA 2023.2 將直接內建 Kotlin 1.9.0 外掛程式。

Android Studio Giraffe (223) 與 Hedgehog (231) 將在即將發佈的版本中支援 Kotlin 1.9.0。

新的命令列編譯器可在 [GitHub 發佈頁面](https://github.com/JetBrains/kotlin/releases/tag/v1.9.0)上下載。

### 配置 Gradle 設定 {id="configure-gradle-settings"}

若要下載 Kotlin 產物與相依性，請更新你的 `settings.gradle(.kts)` 檔案以使用 Maven Central 存儲庫：

```kotlin
pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}
```
{validate="false"}

如果未指定存儲庫，Gradle 會使用已停用的 JCenter 存儲庫，這可能會導致 Kotlin 產物出現問題。

## Kotlin 1.9.0 相容性指南 {id="compatibility-guide-for-kotlin-1-9-0"}

Kotlin 1.9.0 是一個特性版本（feature release），因此可能會帶來與針對早期語言版本編寫的程式碼不相容的變更。在 [Kotlin 1.9.0 相容性指南](compatibility-guide-19.md)中尋找這些變更的詳細清單。