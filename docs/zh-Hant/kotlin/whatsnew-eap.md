[//]: # (title: Kotlin %kotlinEapVersion% 的新功能)

<primary-label ref="eap"/>

<show-structure depth="1"/>

<web-summary>閱讀 Kotlin Early Access Preview 版本資訊，並在最新實驗性 Kotlin 功能正式發佈前搶先試用。</web-summary>

_[發佈日期：%kotlinEapReleaseDate%](eap.md#build-details)_

> 本文件並未涵蓋 Early Access Preview (EAP) 版本的全部功能，
> 而是著重介紹一些重大改進。
>
> 完整變更清單請參閱 [GitHub 變更記錄](https://github.com/JetBrains/kotlin/releases/tag/v%kotlinEapVersion%)。
>
{style="note"}

Kotlin %kotlinEapVersion% 現已發佈！以下是此 EAP 版本的重點詳細資訊：

* **語言**：[`only-syntax` 模式下穩定的基於名稱的解構、未使用的傳回值檢查器，以及改進的編譯期常數](#stable-language-features)。
* **標準函式庫**：[用於簡化 `if` 運算式常見模式的新實驗性函式](#new-functions-for-simplifying-common-patterns-with-if-expressions)，以及[對 Unicode 碼位的實驗性支援](#support-for-unicode-code-points)。
* **Kotlin/JVM**：[支援 Java 28](#kotlin-jvm)。
* **Kotlin/Native**：[Swift export 進入 Beta 版並推出全新 DSL](#swift-export-goes-beta-with-a-new-gradle-dsl)。
* **Kotlin Multiplatform**：[適用於 Kotlin Multiplatform 的新實驗性編譯機制](#new-experimental-compilation-scheme-for-kotlin-multiplatform)，以及[多平台程式庫的新發佈格式](#new-publication-format-for-kotlin-multiplatform-libraries)。
* **Kotlin/JS**：[支援 `es2020` 目標](#kotlin-js)。
* **Kotlin 編譯器**：[`klib` 編譯期間更一致的 inline 函式行為](#consistent-cross-module-function-inlining-during-klib-compilation)。

> 有關 Kotlin 發佈週期的詳細資訊，請參閱 [Kotlin 發佈流程](releases.md)。
>
{style="tip"}

## 更新至 Kotlin %kotlinEapVersion% {id="update-to-kotlin-kotlineapversion"}

最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 和 [Android Studio](https://developer.android.com/studio) 已內建最新版本的 Kotlin。

若要更新至新的 Kotlin 版本，請確保您的 IDE 已更新至最新版本，並在建置指令碼中[將 Kotlin 版本變更](releases.md#update-to-a-new-kotlin-version)為 %kotlinEapVersion%。

## 語言 {id="language"}

Kotlin %kotlinEapVersion% 穩定了早期版本中引入的多項語言特性。它還引入了實驗性的 companion 擴充與區塊，以及完整 value class。

### 穩定語言特性 {id="stable-language-features"}

<secondary-label ref="language"/>

Kotlin 2.3.0−2.4.0 引入了幾項[實驗性](components-stability.md#stability-levels-explained)語言特性。
我們很高興地宣佈，以下語言特性在此版本中已達到[穩定 (Stable)](components-stability.md#stability-levels-explained) 狀態：

* [改進的編譯期常數](whatsnew24.md#improved-compile-time-constants)。

* 用於為可選參數產生基於版本之多載的 [`@IntroducedAt` 註解](whatsnew24.md#new-introducedat-annotation-to-generate-version-based-overloads-for-optional-parameters)。

* [未使用的傳回值檢查器](whatsnew23.md#unused-return-value-checker)，現已預設啟用。

* `only-syntax` 模式下的[基於名稱的解構](destructuring-declarations.md#name-based-destructuring)，現已成為預設模式。

  在此模式下，「舊」的解構語法 `val (x, y)` 保持其基於位置的行為，而「新」語法 `(val x, val y)` 則執行基於名稱的解構。您可以在這部影片中找到該功能的概述：

  <video src="https://www.youtube.com/v/He8J34KHEY4" title="Kotlin's Name-Based Destructuring"/>

### Companion 擴充與區塊 {id="companion-extensions-and-blocks"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin %kotlinEapVersion% 引入了 companion 擴充 (companion extension) 與 companion 區塊 (companion block)。

過去，若要宣告能透過型別名稱存取的擴充、函式與屬性，該型別必須具有 companion object。Companion 擴充與區塊移除了這項限制，讓您可以：

* 藉由在最頂層擴充加上 `companion` 修飾詞來宣告 companion 擴充，即使其所擴充的型別沒有 companion object 也能使用。
* 在類別或介面內部的 `companion {}` 區塊中宣告函式與屬性，而無需建立物件執行個體。在支援靜態成員的平台上，編譯器會將這些宣告產生為靜態成員。因此，在 JVM 上您無需使用 `@JvmStatic` 標註它們。

以下範例將 `UnitX` 宣告為 companion 擴充，並在 companion 區塊中宣告 `Zero`：

```kotlin
// 將 UnitX 宣告為 companion 擴充
companion val Vector.UnitX get() = Vector(1.0, 0.0)

data class Vector(val x: Double, val y: Double) {
    companion {
        // 在 companion 區塊中宣告 Zero
        val Zero: Vector get() = Vector(0.0, 0.0)
    }
}

fun main() {
    println(Vector.UnitX)
    // Vector(x=1.0, y=0.0)

    println(Vector.Zero)
    // Vector(x=0.0, y=0.0)
}
```

有關該設計的詳細資訊，請參閱該特性的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0449-companions-block-extension.md)。您也可以在我們的[部落格文章](https://blog.jetbrains.com/kotlin/2026/09/the-companions-to-come/)中了解此特性。

Companion 擴充與區塊為[實驗性功能](components-stability.md#stability-levels-explained)。若要啟用，請在建置檔案中加入以下編譯器選項：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xcompanion-blocks-and-extensions")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xcompanion-blocks-and-extensions</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

歡迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-11968) 中提供您的回饋。

### 完整 value class {id="full-value-classes"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

在 Kotlin %kotlinEapVersion% 之前，[inline value class](inline-classes.md) 允許您圍繞單一值建立自訂包裝型別。如果您的型別需要多個屬性，則必須使用一般類別或資料類別 (data class)。但對於這些類別，即使該區別對該型別沒有意義，包含相同資料的兩個執行個體仍然可以透過其參照進行區分。這可能會限制執行時期的最佳化，並讓程式碼產生不必要的相依性，依賴是否保留了相同的物件參照。

Kotlin %kotlinEapVersion% 引入了實驗性的完整 value class (full value classes)，讓您可以定義由所有屬性共同組成數值、且個別執行個體之同一性 (identity) 並不重要的型別。例如，您可以宣告一個完整 value class `Complex`，透過實部與虛部屬性來表示複數：

```kotlin
value class Complex(val real: Double, val imaginary: Double)
```

編譯器會自動為完整 value class 產生 `equals()`、`hashCode()` 與 `toString()` 函式，類似於資料類別。然而：

* 沒有 `componentN()` 函式。取而代之的是，您可以使用[基於名稱的解構](destructuring-declarations.md#name-based-destructuring)。您無需主動選擇加入 (opt in)。
* 沒有 `copy()` 函式。未來您可以使用 `copy vars` 來替代。更多資訊請參閱 [KT-44653](https://youtrack.jetbrains.com/issue/KT-44653)。

有關與資料類別比較的差異詳情，請參閱 KEEP 中關於[繼承](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0454-better-immutability-value-classes-MFVC.md#mfvc-and-inheritance)的小節。

#### 抽象 value class {id="abstract-value-classes"}

完整 value class 可以是抽象的 (abstract)。與[介面](interfaces.md)不同，它們可以定義每個子類別在建構期間執行的初始化邏輯。

例如，`OrderedInterval` value class 接受 `start` 與 `end` 作為建構函式參數。`IntInterval` value class 則將這些值儲存在其 `start` 與 `end` 屬性中。

```kotlin
sealed value class OrderedInterval<T : Comparable<T>> protected constructor(
    start: T,
    end: T,
) {
    init {
        require(start <= end)
    }
}

value class IntInterval(
    val start: Int,
    val end: Int
) : OrderedInterval<Int>(start, end)
```

更多資訊請參閱 KEEP 中關於[繼承](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0454-better-immutability-value-classes-MFVC.md#mfvc-and-inheritance)的小節。

#### Value object {id="value-objects"}

完整 value class 可以不包含任何屬性。這些被稱為 _value object_，適用於表示只有一個可能值且沒有同一性的型別，例如狀態或權杖 (token)。例如：

```kotlin
sealed interface UserResponse

value class UserFound(val user: User) : UserResponse
value object UserUnknown : UserResponse
```

更多資訊請參閱 KEEP 中關於 [value object](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0454-better-immutability-value-classes-MFVC.md#value-objects) 的小節。

#### 如何啟用 {id="how-to-enable"}

此特性為[實驗性功能](components-stability.md#stability-levels-explained)。若要啟用，請在建置檔案中加入以下編譯器選項：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xfull-value-classes")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xfull-value-classes</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

### 改進結構類別相等性比較的檢查 {id="improved-checks-for-equality-comparisons-on-structural-classes"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin %kotlinEapVersion% 針對涉及資料類別 (data class)、資料物件 (data object)、final value class 與列舉類別 (enum class) 的相等性比較引入了額外的分析，這些類別統稱為 _結構類別 (structural classes)_。

編譯器會對這些類別使用嚴格的相等性檢查，根據運算元的已知型別回報使用 `==` 始終傳回 `false` 或使用 `!=` 始終傳回 `true` 的比較。這些檢查有助於找出將向量與點進行比較這類錯誤，即使兩個類別具有相同的屬性也是如此：

```kotlin
data class Point(val x: Double, val y: Double) {
    companion object {
        val ZERO: Point = Point(0.0, 0.0)
    }
}

data class Vector(val x: Double, val y: Double)

fun normalize(v: Vector) {
    if (v == Point.ZERO) {
        // 診斷訊息：此比較始終為 false。
        // Vector 正在與 Point 進行比較。
    }
    // ...
}
```

編譯器還可以利用相等性檢查對右側運算元進行智慧轉型 (smart-cast)。

若要啟用此功能，請在建置檔案中加入以下編譯器選項：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xstrict-equality-for-structural-classes")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xstrict-equality-for-structural-classes</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

更多資訊請參閱該特性的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0456-equals.md)。

## 標準函式庫 {id="standard-library"}

在此版本中，Kotlin 標準函式庫新增了用於簡化 `if` 運算式的實驗性函式，以及對 Unicode 碼位的實驗性支援。

### 用於簡化 `if` 運算式常見模式的新函式 {id="new-functions-for-simplifying-common-patterns-with-if-expressions"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin %kotlinEapVersion% 引入了新的標準函式庫函式，讓您可以在傳回 `Boolean` 值之前先檢查它，或根據該值傳回可為 null 的結果。

在此之前，這些模式需要帶有 `else` 分支的明確 `if` 運算式。現在您可以使用以下函式加以簡化：

* `onTrue()` 在 `Boolean` 值為 `true` 時執行指定的程式碼區塊，並傳回原始 Boolean 值。
* `onFalse()` 在 `Boolean` 值為 `false` 時執行指定的程式碼區塊，並傳回原始 Boolean 值。
* `ifOrNull()` 在 `Boolean` 值為 `true` 時執行指定的程式碼區塊並傳回其結果。如果值為 `false`，該函式將傳回 `null` 而不執行該區塊。

這些函式為[實驗性功能](components-stability.md#stability-levels-explained)，需要透過 `@OptIn(ExperimentalStdlibApi::class)` 註解或 `-opt-in=kotlin.ExperimentalStdlibApi` 編譯器選項來加入使用。

以下為範例：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val tags = mutableSetOf("kotlin", "jvm")

    // 當 add() 傳回 true 時，使用 onTrue() 函式印出訊息
    val added = tags.add("wasm").onTrue {
        println("Tag added")
    }
    println(added)
    // Tag added
    // true

    // 當 remove() 傳回 false 時，使用 onFalse() 函式印出訊息
    val removed = tags.remove("native").onFalse {
        println("Tag not found")
    }
    println(removed)
    // Tag not found
    // false

    // 當 "wasm" 存在於 tags 中時，使用 ifOrNull() 函式傳回訊息
    val message = ifOrNull("wasm" in tags) {
        "Wasm tag is available"
    }
    println(message)
    // Wasm tag is available
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.5.0-Beta1" validate="false"}

歡迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-6938) 中提供您的回饋。

### 支援 Unicode 碼位 {id="support-for-unicode-code-points"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin %kotlinEapVersion% 引入了 `CodePoint` inline value class 以及 `kotlin.text.unicode` 套件中的相關 API。這讓您可以跨平台處理 Unicode 碼位 (Unicode code points)。

一個 `Char` 代表一個 UTF-16 代碼單元 (code unit)。然而，某些 Unicode 碼位需要兩個 `Char` 值，即所謂的代理對 (surrogate pair)。當程式將字串作為 `Char` 值進行反覆運算時，它會將代理對的每一半作為獨立的元素處理。

`CodePoint` value class 代表一個 Unicode 碼位，並使用 `Int` 作為其底層型別來儲存其整數值。它提供了存取相關屬性的管道，例如表示它所需的 UTF-16 代碼單元數量、其 Unicode 類別，以及它是否為字母、數字或空白字元。

新 API 允許您計算和反覆運算碼位、轉換它們的大小寫，以及在文字中附加、插入、替換或刪除它們。您還可以比較碼位、執行算術運算、建立範圍，並雙向遍歷文字。文字 API 在表示位置時仍繼續使用 UTF-16 代碼單元偏移量。

這些 API 為[實驗性功能](components-stability.md#stability-levels-explained)，需要透過 `@OptIn(ExperimentalUnicodeApi::class)` 註解或 `-opt-in=kotlin.text.unicode.ExperimentalUnicodeApi` 編譯器選項來加入使用。

更多資訊請參閱該特性的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/stdlib/KEEP-0400-unicode-codepoints.md)。

## Kotlin/JVM {id="kotlin-jvm"}
<secondary-label ref="jvm"/>

從 Kotlin %kotlinEapVersion% 開始，編譯器可以產生包含 Java 28 位元組碼 (bytecode) 的類別。

## Kotlin/Native {id="kotlin-native"}

Kotlin %kotlinEapVersion% 將 Swift export 提升至 Beta 版，並帶來了全新的 Gradle DSL。

### Swift export 進入 Beta 版並推出全新 Gradle DSL {id="swift-export-goes-beta-with-a-new-gradle-dsl"}

<primary-label ref="beta"/>
<secondary-label ref="native"/>

在 Kotlin %kotlinEapVersion% 中，Swift export 晉級至 [Beta](components-stability.md#stability-levels-explained) 階段，並獲得了更符合人體工學的 Gradle DSL。新的 DSL 減少了重複並提高了設定的複用性，讓向 Swift 匯出 Kotlin 程式碼變得更加容易。

主要變更如下：

| 特性 | 變更前 | 變更後 |
|---------------------------------|-----------------------------------------------------------------|-------------------------------------------------------|
| 入口點 | `swiftExport {}` | `export { swift {} }` |
| 扁平化規則屬性 | `flattenPackage = "com.example.sandbox"` | `rootPackage = "com.example.sandbox"` |
| 匯出已宣告的相依項 | `export(project(":subproject")) {}` | 自動匯出；無需明確寫出 `export()` |
| 覆寫相依項設定 | `export(libs.utils) {}` | `xcodeIntegration { configure(libs.utils) {} }` |
| 編譯器引數 | `configure { freeCompilerArgs.add("-Xexpect-actual-classes") }` | 已移除 |

以下是使用新 Swift export DSL 的完整組建組態：

```kotlin
// subproject/build.gradle.kts
kotlin {

    iosArm64()
    iosSimulatorArm64()

    // 將 ":subproject" 作為 ":shared" 的相依項
    // 進行匯出時，使用此設定
    export {
        swift {
            // 設定根模組名稱
            moduleName = "Subproject"

            // 設定扁平化規則
            // 從產生的 Swift 程式碼中移除套件前綴
            rootPackage = "com.subproject.library"
        }
    }
}

// shared/build.gradle.kts
kotlin {

    iosArm64()
    iosSimulatorArm64()

    export {
        swift {
            // 設定根模組名稱
            moduleName = "Shared"

            // 設定扁平化規則
            // 從產生的 Swift 程式碼中移除套件前綴
            rootPackage = "com.example.sandbox"

            // 為此模組啟用 Xcode 整合
            xcodeIntegration {
                // 設定外部模組匯出
                configure(libs.utils) {
                    // 可選：覆寫匯出的模組名稱
                    moduleName = "Utils"
                    // 可選：覆寫已匯出相依項的扁平化規則
                    rootPackage = "com.example.utils"
                }
            }
        }
    }

    sourceSets {
        commonMain {
            dependencies {
                // 這些相依項會自動
                // 包含在 Swift export 中
                api(project(":subproject"))
                api(libs.utils)
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="完整 DSL 範例"}

此外，Swift export 設定現在已支援發佈：如果程式庫作者提供了選項覆寫，Gradle 會在 Swift export 期間自動讀取並套用它們。

若遇到任何問題，請在 [YouTrack](https://kotl.in/issue) 中回報，或[獲取邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw)加入 [#swift-export](https://kotlinlang.slack.com/archives/C073GUW6WN9) Slack 頻道。

## Kotlin Multiplatform {id="kotlin-multiplatform"}

Kotlin %kotlinEapVersion% 引入了適用於 Kotlin Multiplatform 的新實驗性編譯機制，以及可顯著減小已發佈多平台程式庫大小的新發佈格式。

### 適用於 Kotlin Multiplatform 的新實驗性編譯機制 {id="new-experimental-compilation-scheme-for-kotlin-multiplatform"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="multiplatform"/>

Kotlin %kotlinEapVersion% 為 Kotlin Multiplatform (KMP) 引入了一種新的實驗性編譯機制，使編譯器在處理共用原始碼集 (common source sets) 時與 IDE 更加一致。這項變更可防止共用程式碼意外解析至特定平台的宣告，提高多載解析與型別推論的一致性，並使我們能夠為共用原始碼集實作累加編譯。若要進一步了解 KMP 獨立編譯以及如何試用，請參閱我們的[部落格文章](https://blog.jetbrains.com/kotlin/2026/09/a-more-reliable-compilation-scheme-for-kotlin-multiplatform-modules/)。

### Kotlin 多平台程式庫的新發佈格式 {id="new-publication-format-for-kotlin-multiplatform-libraries"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="multiplatform"/>

Kotlin %kotlinEapVersion% 引入了適用於 Kotlin 多平台程式庫的新發佈格式，可大幅縮小發佈程式庫的體積。新格式將平台產物（JVM 和 Android 除外）發佈為單一 `.kar` 封存檔，這是一個使用 XZ 進行額外壓縮的 ZIP 封存檔。

這項變更解決了 Maven Central 近期引入的[發佈大小限制](https://central.sonatype.org/publish/maven-central-publishing-limits/)。使用新格式後，新增目標不再需要建立新檔案，因此發佈大小不會大幅增加。在某些情況下，整體的發佈大小甚至比以往單一目標的發佈還要小。例如，對於 [cryptography-kotlin](https://github.com/whyoleg/cryptography-kotlin) 程式庫，整個多模組專案的發佈產物組合從 7539 個檔案、91 MB 降至 1036 個檔案、23 MB。

若要為特定模組啟用新格式，請在該模組的建置指令碼中進行設定：

```kotlin
kotlin {
    publishing {
        publicationFormat.set(KotlinPublicationFormat.KOTLIN_ARCHIVE)
    }
}
```

或者，若要為專案中的所有模組啟用該格式，請在 `gradle.properties` 檔案中加入以下屬性：

```properties
kotlin.publicationFormat=KOTLIN_ARCHIVE
```

雖然以新格式發佈仍處於[實驗性階段](components-stability.md#stability-levels-explained)，但所有專案目前均已支援取用此類產物。這項變更僅與程式庫作者相關，不會影響終端應用程式的開發者。

請在 [YouTrack](https://kotl.in/issue) 分享您的回饋並回報任何問題。

## Kotlin/JS {id="kotlin-js"}
<secondary-label ref="js"/>

Kotlin %kotlinEapVersion% 為 Kotlin/JS 編譯器與 Gradle 外掛程式新增了 `es2020` 目標。此前僅有 `es5` 和 `es2015` 目標可用，若要支援較新的 JavaScript 功能（例如 `BigInt`），必須在以 ES2015 為目標時另外啟用。透過鎖定 ES2020，您無需進行額外設定即可使用 ECMAScript 2020 之前的所有支援 JavaScript 功能，包括 `BigInt`。

若要啟用新目標，請在 `compilerOptions {}` 區塊中將 `target` 設定為 `es2020`：

```kotlin
kotlin {
    js {
        compilerOptions {
            target.set("es2020")
        }
    }
}
```

## Kotlin 編譯器 {id="kotlin-compiler"}

Kotlin %kotlinEapVersion% 對 `klib` 編譯期間的函式 inline 帶來了更多改進，並提升了型別推論的效能。

### klib 編譯期間跨模組函式 inline 行為的一致性 {id="consistent-cross-module-function-inlining-during-klib-compilation"}

<secondary-label ref="compiler"/>

Kotlin 2.4.0 在 `klib` 編譯期間實現了 [Kotlin/Native、Kotlin/JS 與 Kotlin/Wasm 上模組內部函式 inline 行為的一致性](whatsnew24.md#consistent-intra-module-function-inlining-during-klib-compilation)。不同 Kotlin 平台上函式 inline 的一致性使得提供相容性保證變得更加容易。

Kotlin 2.4.0 還引入了在 `klib` 編譯期間啟用**跨模組** inline 的可能性，以確保專案中的所有 inline 函式都能一致地進行 inline 處理。Kotlin %kotlinEapVersion% 已預設啟用跨模組 inline。

如果您在此功能中遇到非預期的問題，可以使用以下命令列編譯器選項將其停用：

```bash
-Xklib-ir-inliner=disabled
```

請在 [YouTrack](https://kotl.in/issue) 分享您的回饋並回報任何問題。

### 改進型別推論效能 {id="improved-type-inference-performance"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="compiler"/>

Kotlin %kotlinEapVersion% 透過減少型別推論期間產生的約束數量來提升編譯器效能。以往，複雜的泛型程式碼可能會產生過多的約束，導致編譯或 IDE 分析無回應。這項變更可能會影響某些邊緣情況下的型別推論，特別是涉及 builder 推論或具有不尋常界限之複雜平台型別的情況。因此，編譯器可能會推論出不同的型別、選取不同的多載，或回報不同的診斷訊息。這些差異可能是此項改進帶來的預期結果。

該功能預設啟用。若要還原先前的型別推論行為，請使用 `-XXLanguage:-EliminateSecondKindIncorporation` 選項。

歡迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-85879) 中提供您的回饋。

## 重大變更與棄用 {id="breaking-changes-and-deprecations"}

作為將執行 Kotlin 編譯器所需的最低 JDK 版本從 JDK 8 提升至 JDK 17 的下一步，Kotlin %kotlinEapVersion% 引入了一項錯誤提示。我們提升最低支援 JDK 版本是為了加速開發，並讓編譯器能夠使用需要較新 Java 版本的新程式庫。JDK 17 擁有較長的支援週期，並有助於我們保持與較新版本 Gradle 及 Maven 的相容性。您可以使用 `-Xallow-pre-17-runtime-jdk` 編譯器選項退出該錯誤。此選項將在 Kotlin 2.5.20 或 2.6.0 中隨 JDK 17 成為強制要求時被移除。

若您在升級專案時遇到困難，請在 [YouTrack](https://kotl.in/issue) 上分享您的經驗，或在 Kotlin Slack 上直接聯繫開發團隊。[獲取邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw)並加入 [#compiler](https://kotlinlang.slack.com/archives/C7L3JB43G) 頻道。