[//]: # (title: Kotlin %kotlinEapVersion% 的新功能)

<primary-label ref="eap"/>

<show-structure depth="1"/>

<web-summary>閱讀 Kotlin 早期體驗預覽版（Early Access Preview）版本資訊，並在最新實驗性 Kotlin 功能正式發佈前搶先試用。</web-summary>

_[發佈日期：%kotlinEapReleaseDate%](eap.md#build-details)_

> 本文件並未涵蓋早期體驗預覽版（Early Access Preview, EAP）的所有功能，
> 但重點介紹了一些重大改進。
>
> 請在 [GitHub 變更記錄](https://github.com/JetBrains/kotlin/releases/tag/v%kotlinEapVersion%) 中查看完整的變更清單。
>
{style="note"}

Kotlin %kotlinEapVersion% 已發佈！以下是此 EAP 版本的詳細資訊：

* **語言**：[`only-syntax` 模式下穩定的基於名稱解構、未使用的傳回值檢查器以及改進的編譯期常數](#stable-language-features)。
* **標準程式庫**：[用於簡化 `if` 運算式常見模式的全新實驗性函式](#new-functions-for-simplifying-common-patterns-with-if-expressions)，以及[對 Unicode 字碼點的實驗性支援](#support-for-unicode-code-points)。
* **Kotlin/JVM**：[支援 Java 28](#kotlin-jvm)。
* **Kotlin/Native**：[Apple 目標預設啟用增量編譯](#incremental-compilation-enabled-by-default-on-apple-targets)，以及 [Swift 匯出進入 Beta 版並提供全新 DSL](#swift-export-goes-beta-with-a-new-gradle-dsl)。
* **Kotlin Multiplatform**：[Kotlin Multiplatform 的全新實驗性編譯架構](#new-experimental-compilation-scheme-for-kotlin-multiplatform)，以及[多平台程式庫的全新發佈格式](#new-publication-format-for-kotlin-multiplatform-libraries)。
* **Kotlin/JS**：[支援 `es2020` 目標](#kotlin-js)。
* **Kotlin 編譯器**：[`klib` 編譯期間更一致的內嵌函式行為](#consistent-cross-module-function-inlining-during-klib-compilation)。

> 有關 Kotlin 發佈週期的資訊，請參閱 [Kotlin 發佈流程](releases.md)。
>
{style="tip"}

## 更新至 Kotlin %kotlinEapVersion% {id="update-to-kotlin-kotlineapversion"}

最新版本的 Kotlin 已包含在最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)
和 [Android Studio](https://developer.android.com/studio) 中。

若要更新至新的 Kotlin 版本，請確保你的 IDE 已更新至最新版本，並在建置指令碼中[將 Kotlin 版本更改](releases.md#update-to-a-new-kotlin-version)為 %kotlinEapVersion%。

## 語言 {id="language"}

Kotlin %kotlinEapVersion% 穩定了早期版本中引入的多項語言特性。它還引入了實驗性的 companion 擴充與區塊，以及完整值類別（full value classes）。

### 穩定語言特性 {id="stable-language-features"}

<secondary-label ref="language"/>

Kotlin 2.3.0−2.4.0 以 [Experimental](components-stability.md#stability-levels-explained) 形式引入了一些語言特性。
我們很高興地宣布，以下語言特性在此版本中已達到 [Stable](components-stability.md#stability-levels-explained) 狀態：

* [改進的編譯期常數](whatsnew24.md#improved-compile-time-constants)。

* 用於為可選參數產生基於版本的多載的 [`@IntroducedAt` 註解](whatsnew24.md#new-introducedat-annotation-to-generate-version-based-overloads-for-optional-parameters)。

* [未使用的傳回值檢查器](whatsnew23.md#unused-return-value-checker)，現在預設啟用。

* `only-syntax` 模式下的[基於名稱解構](destructuring-declarations.md#name-based-destructuring)，現在為預設設定。

  在此模式下，「舊」解構語法 `val (x, y)` 保持其基於位置的行為，而「新」語法 `(val x, val y)` 則執行基於名稱的解構。你可以在此影片中找到該功能的概述：

  <video src="https://www.youtube.com/v/He8J34KHEY4" title="Kotlin 的基於名稱解構"/>

### Companion 擴充與區塊 {id="companion-extensions-and-blocks"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin %kotlinEapVersion% 引入了 companion 擴充與 companion 區塊。

以往，若要宣告可透過型別名稱存取的擴充、函式和屬性，該型別必須具有 companion object。Companion 擴充與區塊移除了這項限制，並允許你：

* 透過在頂層擴充加上 `companion` 修飾詞來宣告 companion 擴充，即使其擴充的型別沒有 companion object。
* 在類別或介面內的 `companion {}` 區塊中宣告函式和屬性，而無需建立物件執行個體。在支援靜態成員的平台上，編譯器會將這些宣告產生為靜態成員。因此，在 JVM 上你不需要為它們標註 `@JvmStatic`。

以下是將 `UnitX` 宣告為 companion 擴充並在 companion 區塊中宣告 `Zero` 的範例：

```kotlin
// 宣告 UnitX 為 companion 擴充
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

若要進一步了解其設計，請參閱該特性的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0449-companions-block-extension.md)。你也可以在我們的[部落格文章](https://blog.jetbrains.com/kotlin/2026/09/the-companions-to-come/)中閱讀有關此特性的內容。

Companion 擴充與區塊處於 [Experimental](components-stability.md#stability-levels-explained) 階段。若要啟用，請在組建檔案中新增以下編譯器選項：

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

歡迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-11968) 中提供你的回饋。

### 完整值類別 {id="full-value-classes"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

在 Kotlin %kotlinEapVersion% 之前，[內嵌值類別](inline-classes.md)允許你圍繞單個值建立自訂包裝型別。如果你的型別需要多個屬性，則必須使用常規類別或資料類別。但對於這些類別，包含相同資料的兩個執行個體仍然可以透過其參照來區分，即使這種區分對該型別沒有任何意義。這可能會限制執行時最佳化，並讓程式碼不必要地依賴是否保留了相同的物件參照。

Kotlin %kotlinEapVersion% 引入了實驗性的完整值類別（full value classes），讓你可以定義屬性共同構成值且個別執行個體的識別（identity）無關緊要的型別。例如，你可以宣告一個完整值類別 `Complex` 來表示具有實部與虛部屬性的複數：

```kotlin
value class Complex(val real: Double, val imaginary: Double)
```

編譯器會自動為完整值類別產生 `equals()`、`hashCode()` 和 `toString()` 函式，類似於資料類別。但是：

* 沒有 `componentN()` 函式。相反地，你可以使用[基於名稱的解構](destructuring-declarations.md#name-based-destructuring)。你無需手動啟用。
* 沒有 `copy()` 函式。未來你可以改用 `copy vars`。若要了解更多，請參閱 [KT-44653](https://youtrack.jetbrains.com/issue/KT-44653)。

若要進一步了解與資料類別相比的差異，請參閱 KEEP 中關於[繼承](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0454-better-immutability-value-classes-MFVC.md#mfvc-and-inheritance)的章節。

#### 抽象值類別 {id="abstract-value-classes"}

完整值類別可以是抽象的。與[介面](interfaces.md)不同，它們可以定義每個子類別在建構期間都會執行的初始化邏輯。

例如，`OrderedInterval` 值類別接受 `start` 和 `end` 作為建構函式參數。`IntInterval` 
值類別則將這些值儲存在其 `start` 和 `end` 屬性中。

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

若要了解更多，請參閱 KEEP 中關於[繼承](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0454-better-immutability-value-classes-MFVC.md#mfvc-and-inheritance)的章節。

#### 值物件 {id="value-objects"}

完整值類別可以不包含任何屬性。這些被稱為「值物件」（_value objects_），非常適合用來表示僅有單一可能值且無識別的型別，例如狀態或語彙基元 (tokens)。例如：

```kotlin
sealed interface UserResponse

value class UserFound(val user: User) : UserResponse
value object UserUnknown : UserResponse
```

若要了解更多，請參閱 KEEP 中關於[值物件](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0454-better-immutability-value-classes-MFVC.md#value-objects)的章節。

#### 如何啟用 {id="how-to-enable"}

此功能處於 [Experimental](components-stability.md#stability-levels-explained) 階段。若要啟用，請在組建檔案中新增以下編譯器選項：

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

#### 內嵌值類別宣告的變更 {id="changes-to-inline-value-class-declarations"}

有了這些新的值類別，`value class` 不再必然表示內嵌。內嵌值類別具有外部可觀察的內嵌表示法，而其他值類別則不會以相同方式公開其執行階段表示法。這種區別對於 Spring 和序列化程式庫至關重要，因為它們處理內嵌值類別的方式有所不同。

為了明確區分，未來編譯器將要求透過 `inline` 修飾詞和 `@JvmInline value class` 宣告來明確宣告內嵌值類別。單純的 `value class` 宣告將不再被視為內嵌。

我們計劃進行階段性遷移來變更此行為：

* Kotlin 2.5.20 將對未標記的單一欄位值類別發出警告。
* Kotlin 2.6.0 或 2.7.0 將把此警告提升為錯誤。

你可以使用 `-Xinline-value-class-migration=warning` 和 `-Xinline-value-class-migration=strict` 編譯器選項，讓程式碼提早為此變更做好準備。

若要了解更多，請參閱 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0468-inline-value-classes.md#migration)。

##### 讓你的程式庫類別為遷移至值類別做好準備 {id="prepare-your-library-s-classes-for-migration-to-value-classes"}

作為程式庫作者，你可以使用 `@WillBecomeValue` 註解讓程式庫的一般類別為未來遷移至完整值類別做好準備。當使用者的程式碼依賴物件識別（例如透過參照相等性 `===`、同步處理或 identity hash code）時，編譯器會發出警告。這些警告為使用者提供了在遷移類別之前更新程式碼的時間。

該註解處於 [Experimental](components-stability.md#stability-levels-explained) 階段，需要使用 `@OptIn(ExperimentalValueClassApi::class)` 進行選擇加入。你的程式庫使用者在使用加註的類別時不需要此選擇加入。

若要了解更多，請參閱 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0470-will-become-value.md)。

### 改進結構類別的相等性比較檢查 {id="improved-checks-for-equality-comparisons-on-structural-classes"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin %kotlinEapVersion% 針對涉及資料類別、資料物件、final 值類別和列舉類別（統稱為「結構類別」/_structural classes_）的相等性比較引入了額外分析。

編譯器對這些類別使用嚴格的相等性檢查，根據運算元的已知型別報告使用 `==` 永遠傳回 `false` 或使用 `!=` 永遠傳回 `true` 的比較。這些檢查有助於發現類似於將向量與點進行比較的錯誤，即使這兩個類別具有相同的屬性：

```kotlin
data class Point(val x: Double, val y: Double) {
    companion object {
        val ZERO: Point = Point(0.0, 0.0)
    }
}

data class Vector(val x: Double, val y: Double)

fun normalize(v: Vector) {
    if (v == Point.ZERO) {
        // 診斷：此比較永遠為 false。
        // 正在將 Vector 與 Point 進行比較。
    }
    // ...
}
```

編譯器還可以利用相等性檢查對右手邊的運算元進行智慧轉型。

若要啟用此功能，請在組建檔案中新增以下編譯器選項：

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

若要進一步了解，請參閱該特性的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0456-equals.md)。

## 標準程式庫 {id="standard-library"}

在此版本中，Kotlin 標準程式庫提供了簡化 `if` 運算式的全新實驗性函式，以及對 Unicode 字碼點的實驗性支援。

### 用於簡化 `if` 運算式常見模式的全新函式 {id="new-functions-for-simplifying-common-patterns-with-if-expressions"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin %kotlinEapVersion% 引入了新的標準程式庫函式，讓你在傳回 `Boolean` 值之前先檢查該值，或根據該值傳回可為 null 的結果。

以往，這些模式需要帶有 `else` 分支的明確 `if` 運算式。現在你可以使用以下函式簡化它們：

* `onTrue()` 在 `Boolean` 值為 `true` 時執行指定的程式碼區塊，並傳回原始 Boolean 值。
* `onFalse()` 在 `Boolean` 值為 `false` 時執行指定的程式碼區塊，並傳回原始 Boolean 值。
* `ifOrNull()` 在 `Boolean` 值為 `true` 時執行指定的程式碼區塊並傳回其結果。如果值為 `false`，則函式不執行該區塊並直接傳回 `null`。

這些函式處於 [Experimental](components-stability.md#stability-levels-explained) 階段，需要使用 `@OptIn(ExperimentalStdlibApi::class)` 註解或 `-opt-in=kotlin.ExperimentalStdlibApi` 編譯器選項進行選擇加入。

以下是一個範例：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val tags = mutableSetOf("kotlin", "jvm")

    // 當 add() 傳回 true 時，使用 onTrue() 函式輸出訊息
    val added = tags.add("wasm").onTrue {
        println("Tag added")
    }
    println(added)
    // Tag added
    // true

    // 當 remove() 傳回 false 時，使用 onFalse() 函式輸出訊息
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

歡迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-6938) 中提供你的回饋。

### 支援 Unicode 字碼點 {id="support-for-unicode-code-points"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin %kotlinEapVersion% 引入了 `CodePoint` 內嵌值類別以及 `kotlin.text.unicode` 套件中的相關 API。這讓你可以跨平台處理 Unicode 字碼點。

`Char` 代表一個 UTF-16 碼元 (code unit)。然而，某些 Unicode 字碼點需要兩個 `Char` 值，也就是所謂的代理對（surrogate pair）。當程式將字串作為 `Char` 值進行反覆運算時，會將代理對的每一半作為獨立元素處理。

`CodePoint` 值類別代表一個 Unicode 字碼點，並使用 `Int` 作為其底層型別來儲存其整數值。它提供了存取各項屬性的途徑，例如表示該字碼點所需的 UTF-16 碼元數量、其 Unicode 類別，以及它是否為字母、數字或空白字元。

新 API 讓你可以計數和反覆運算字碼點、轉換大小寫，以及在文字中附加、插入、取代或刪除它們。你還可以比較字碼點、執行算術運算、建立範圍以及雙向遍歷文字。文字 API 仍繼續使用 UTF-16 碼元位移量表示位置。

這些 API 處於 [Experimental](components-stability.md#stability-levels-explained) 階段，需要使用 `@OptIn(ExperimentalUnicodeApi::class)` 註解或 `-opt-in=kotlin.text.unicode.ExperimentalUnicodeApi` 編譯器選項進行選擇加入。

若要進一步了解，請參閱該特性的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/stdlib/KEEP-0400-unicode-codepoints.md)。

## Kotlin/JVM {id="kotlin-jvm"}
<secondary-label ref="jvm"/>

從 Kotlin %kotlinEapVersion% 開始，編譯器可以產生包含 Java 28 位元組碼的類別。

## Kotlin/Native {id="kotlin-native"}

Kotlin %kotlinEapVersion% 在 Apple 目標上預設啟用增量編譯，並透過全新的 Gradle DSL 將 Swift 匯出提升為 Beta 版。

### Apple 目標預設啟用增量編譯 {id="incremental-compilation-enabled-by-default-on-apple-targets"}

<secondary-label ref="native"/>

從 Kotlin %kotlinEapVersion% 開始，在 Apple 目標上預設啟用 `klib` 構件的增量編譯。

有了增量編譯，如果專案模組產生的 `klib` 構件只有一部分發生變更，則只有受影響的 `klib` 部分會被重新編譯為二進位檔。

此最佳化最早於 [Kotlin 1.9.20](whatsnew1920.md#incremental-compilation-of-klib-artifacts) 中引入，並已證實在某些情況下能大幅縮短 Debug 組建的編譯時間。

新的預設設定僅適用於 Apple 目標。Windows（[MinGW 工具鏈](https://www.mingw-w64.org/)）不支援增量編譯。而對於 Linux，仍需要透過以下方式選擇加入：

```properties
kotlin.incremental.native=true
```

請注意，在某些情況下，此最佳化可能會對全新的完整組建 (clean build) 帶來效能代價。若要解決此問題，你可以嘗試全新的[二進位選項](native-binary-options.md#how-to-enable)，該選項專為在全新組建上執行特殊編譯模式而設計。該選項處於 [Experimental](components-stability.md#stability-levels-explained) 階段，選擇加入方式如下：

```properties
kotlin.native.binary.batchedCacheBuild=true
```

如果你在增量編譯中遇到非預期的問題，可以在 `gradle.properties` 檔案中設定以下選項以手動停用：

```properties
kotlin.incremental.native=false
```

請在 [YouTrack](https://kotl.in/issue) 中回報任何問題。

有關縮短編譯時間的更多技巧，請參閱我們的[文件](native-improving-compilation-time.md)。

### Swift 匯出進入 Beta 版並提供全新 Gradle DSL {id="swift-export-goes-beta-with-a-new-gradle-dsl"}

<primary-label ref="beta"/>
<secondary-label ref="native"/>

在 Kotlin %kotlinEapVersion% 中，Swift 匯出晉升為 [Beta](components-stability.md#stability-levels-explained) 版，並獲得了更符合人體工學的 Gradle DSL。全新的 DSL 減少了重複並提高了設定的重複使用性，讓你可以更輕鬆地將 Kotlin 程式碼公開給 Swift。

主要變更如下：

| 功能 | 之前 | 之後 |
|---|---|---|
| 入口點 | `swiftExport {}` | `export { swift {} }` |
| 收合規則屬性 | `flattenPackage = "com.example.sandbox"` | `rootPackage = "com.example.sandbox"` |
| 匯出宣告的相依性 | `export(project(":subproject")) {}` | 自動匯出；無需明確呼叫 `export()` |
| 覆寫相依性設定 | `export(libs.utils) {}` | `xcodeIntegration { configure(libs.utils) {} }` |
| 編譯器引數 | `configure { freeCompilerArgs.add("-Xexpect-actual-classes") }` | 已移除 |

以下是使用全新 Swift 匯出 DSL 的完整組建組態：

```kotlin
// subproject/build.gradle.kts
kotlin {

    iosArm64()
    iosSimulatorArm64()

    // 當將 ":subproject" 作為 ":shared" 的相依性匯出時，
    // 會使用此設定
    export {
        swift {
            // 設定根模組名稱
            moduleName = "Subproject"

            // 設定收合規則
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

            // 設定收合規則
            // 從產生的 Swift 程式碼中移除套件前綴
            rootPackage = "com.example.sandbox"

            // 為此模組啟用 Xcode 整合
            xcodeIntegration {
                // 設定外部模組匯出
                configure(libs.utils) {
                    // 可選：覆寫匯出的模組名稱
                    moduleName = "Utils"
                    // 可選：覆寫匯出相依性的收合規則
                    rootPackage = "com.example.utils"
                }
            }
        }
    }

    sourceSets {
        commonMain {
            dependencies {
                // 這些相依性會自動
                // 包含在 Swift 匯出中
                api(project(":subproject"))
                api(libs.utils)
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Full DSL example"}

此外，Swift 匯出設定現在是可發佈的：如果程式庫作者提供了選項覆寫，Gradle 會在 Swift 匯出期間自動取用並套用這些設定。

如果你遇到任何問題，請在 [YouTrack](https://kotl.in/issue) 中回報，或者[取得邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw)並加入 [#swift-export](https://kotlinlang.slack.com/archives/C073GUW6WN9) Slack 頻道。

## Kotlin Multiplatform {id="kotlin-multiplatform"}

Kotlin %kotlinEapVersion% 為 Kotlin Multiplatform 引入了全新的實驗性編譯架構，以及可大幅縮減已發佈多平台程式庫大小的全新發佈格式。

### Kotlin Multiplatform 的全新實驗性編譯架構 {id="new-experimental-compilation-scheme-for-kotlin-multiplatform"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="multiplatform"/>

Kotlin %kotlinEapVersion% 為 Kotlin Multiplatform (KMP) 引入了全新的實驗性編譯架構，使編譯器處理通用原始碼集（common source sets）的方式與 IDE 更加一致。此變更可防止通用程式碼意外解析為特定平台的宣告、提升多載解析與型別推論的一致性，並讓我們能夠為通用原始碼集實作增量編譯。在我們的[部落格文章](https://blog.jetbrains.com/kotlin/2026/09/a-more-reliable-compilation-scheme-for-kotlin-multiplatform-modules/)中進一步了解 KMP 分離編譯以及如何試用它。

### Kotlin Multiplatform 程式庫的全新發佈格式 {id="new-publication-format-for-kotlin-multiplatform-libraries"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="multiplatform"/>

Kotlin %kotlinEapVersion% 為 Kotlin Multiplatform 程式庫引入了一種全新的發佈格式，可大幅縮減已發佈程式庫的大小。新格式將平台構件（JVM 和 Android 除外）發佈為單一 `.kar` 封存檔，這是一個額外使用 XZ 壓縮的 ZIP 封存檔。

這項變更解決了 Maven Central 最近引入的[發佈大小限制](https://central.sonatype.org/publish/maven-central-publishing-limits/)。採用新格式後，新增目標不再需要建立新檔案，因此發佈大小不會增加太多。在某些情況下，整體的發佈大小甚至比先前僅有單一目標時還要小。例如，對於 [cryptography-kotlin](https://github.com/whyoleg/cryptography-kotlin) 程式庫，整個多模組專案的發佈構件集從 7539 個檔案、91 MB 減少到 1036 個檔案、23 MB。

若要為特定模組啟用新格式，請在該模組的建置指令碼中進行設定：

```kotlin
kotlin {
    publishing {
        publicationFormat.set(KotlinPublicationFormat.KOTLIN_ARCHIVE)
    }
}
```

或者，若要為專案中的所有模組啟用該格式，請在 `gradle.properties` 檔案中新增以下屬性：

```properties
kotlin.publicationFormat=KOTLIN_ARCHIVE
```

雖然以新格式發佈仍處於 [Experimental](components-stability.md#stability-levels-explained) 階段，但所有專案都已能使用此類構件。此變更僅與程式庫作者相關，不會影響終端應用程式的開發人員。

請在 [YouTrack](https://kotl.in/issue) 中分享你的回饋並回報任何問題。

## Kotlin/JS {id="kotlin-js"}
<secondary-label ref="js"/>

Kotlin %kotlinEapVersion% 為 Kotlin/JS 編譯器與 Gradle 外掛程式新增了 `es2020` 目標。以前僅提供 `es5` 和 `es2015` 目標，且對較新 JavaScript 功能（例如 `BigInt`）的支援必須在鎖定 ES2015 目標時單獨啟用。透過以 ES2020 為目標，你可以直接使用最高支援至 ECMAScript 2020 的所有 JavaScript 功能（包括 `BigInt`），而無需額外設定。

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

Kotlin %kotlinEapVersion% 進一步改進了 `klib` 編譯期間的函式內嵌，並提升了型別推論效能。

### klib 編譯期間一致的跨模組函式內嵌 {id="consistent-cross-module-function-inlining-during-klib-compilation"}

<secondary-label ref="compiler"/>

Kotlin 2.4.0 在 `klib` 編譯期間為 Kotlin/Native、Kotlin/JS 和 Kotlin/Wasm 啟用了[一致的模組內函式內嵌](whatsnew24.md#consistent-intra-module-function-inlining-during-klib-compilation)。跨不同 Kotlin 平台之函式內嵌的一致性，使得提供相容性保證變得更加容易。

Kotlin 2.4.0 還引入了在 `klib` 編譯期間啟用**跨模組**內嵌的功能，確保專案中的所有 inline 函式都能一致地被內嵌。Kotlin %kotlinEapVersion% 預設啟用了跨模組內嵌。

如果你在此功能中遇到非預期的問題，可以使用以下命令列編譯器選項將其停用：

```bash
-Xklib-ir-inliner=disabled
```

請在 [YouTrack](https://kotl.in/issue) 中分享你的回饋並回報任何問題。

### 改進型別推論效能 {id="improved-type-inference-performance"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="compiler"/>

Kotlin %kotlinEapVersion% 透過減少型別推論期間產生的條件約束數量來提升編譯器效能。以往，複雜的泛型程式碼可能會產生過多的約束，導致編譯或 IDE 分析無回應。這項變更可能會影響某些邊緣情況下的型別推論，尤其是涉及 builder 推論或具有異常邊界的複雜平台型別。因此，編譯器可能會推論出不同的型別、選擇不同的多載或回報不同的診斷資訊。這些差異均屬於該改進的可預期結果。

此功能預設啟用。若要恢復先前的型別推論行為，請使用 `-XXLanguage:-EliminateSecondKindIncorporation` 選項。

歡迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-85879) 中提供你的回饋。

## 重大變更與棄用 {id="breaking-changes-and-deprecations"}

Kotlin %kotlinEapVersion% 引入了一項錯誤回報，作為將執行 Kotlin 編譯器所需的最低 JDK 版本從 JDK 8 提高到 JDK 17 的下一步。我們調高最低所需的 JDK 是為了加快開發速度，並讓編譯器能夠使用需要較新 Java 版本的新程式庫。JDK 17 具有較長的支援週期，有助於我們保持與較新版本 Gradle 和 Maven 的相容性。你可以使用 `-Xallow-pre-17-runtime-jdk` 編譯器選項來退出此錯誤提示。當 JDK 17 成為強制要求時，該選項將在 Kotlin 2.5.20 或 2.6.0 中被移除。

如果你在升級專案時遇到困難，請在 [YouTrack](https://kotl.in/issue) 上分享你的經驗，或直接在 Kotlin Slack 上聯絡開發人員。[取得邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw)並加入 [#compiler](https://kotlinlang.slack.com/archives/C7L3JB43G) 頻道。