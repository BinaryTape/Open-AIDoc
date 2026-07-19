[//]: # (title: Kotlin 元件的穩定性)

Kotlin 語言與工具集被劃分為許多元件，例如 JVM、JS 與 Native 目標的編譯器、標準程式庫 (Standard Library)、各種隨附工具等等。
這些元件中有許多已正式發布為 **穩定 (Stable)**，這意味著它們遵循 [「舒適更新 (Comfortable Updates)」與「保持語言現代化 (Keeping the Language Modern)」的原則](kotlin-evolution-principles.md)，以回溯相容的方式進行演進。

遵循「回饋循環 (Feedback Loop)」原則，我們提早發布許多內容供社群試用，因此部分元件尚未以 **穩定 (Stable)** 狀態發布。
其中有些處於非常早期階段，有些則較為成熟。
我們根據每個元件演進的速度以及使用者採用時承擔的風險程度，將其標記為 **實驗性 (Experimental)**、**Alpha** 或 **Beta**。

## 穩定性層級說明

以下是這些穩定性層級及其含義的快速指南：

**實驗性 (Experimental)** 意味著「僅在玩具專案中嘗試」：
* 我們正在測試一個想法及其可行性。我們希望一些使用者嘗試並分享他們的回饋。其範圍極小，且該功能隨時可能變更或消失。我們不保證穩定性或相容性。

**Alpha** 意味著「我們正在測試這是否應達到生產就緒狀態」：
* 我們打算將此轉化為產品，並正在驗證其使用者價值與市場契合度，以塑造其最終形態。功能集仍未完成，預期會有重大變更 (breaking changes)。如果假設不成立，我們可能會大幅變更或停止該功能。

**Beta** 意味著「您可以使用它，我們將盡力為您減少遷移問題」：
* 它已接近完成，目前使用者回饋尤為重要。
* 儘管如此，它尚未 100% 完成，因此仍有可能發生變更（包括基於您自身回饋的變更）。
* 請提前留意棄用警告，以獲得最佳的更新體驗。

我們將 *實驗性 (Experimental)*、*Alpha* 和 *Beta* 統稱為 **預備穩定 (pre-stable)** 層級。

<a name="stable"/>

**穩定 (Stable)** 意味著「即使在最保守的情境下也可以使用」：
* 它已完成。我們將根據嚴格的 [回溯相容性規則](https://kotlinfoundation.org/language-committee-guidelines/) 對其進行演進。

請注意，穩定性層級並未說明元件多久會發布為穩定版。同樣地，它們也不代表元件在發布前會發生多少變更。它們僅說明元件變更的速度，以及使用者面臨更新問題的風險程度。

## Kotlin 元件的 GitHub 徽章

[Kotlin GitHub 組織](https://github.com/Kotlin) 託管了不同的 Kotlin 相關專案。
其中一些是我們全職開發的，而另一些則是副專案。

每個 Kotlin 專案都有兩個描述其穩定性與支援狀態的 GitHub 徽章：

* **穩定性 (Stability)** 狀態：這顯示了每個專案演進的速度，以及使用者採用時承擔的風險。
  穩定性狀態與 [Kotlin 語言特性及其元件的穩定性層級](#stability-levels-explained) 完全一致：
    * ![Experimental stability level](https://kotl.in/badges/experimental.svg){type="joined"} 代表 **實驗性 (Experimental)**
    * ![Alpha stability level](https://kotl.in/badges/alpha.svg){type="joined"} 代表 **Alpha**
    * ![Beta stability level](https://kotl.in/badges/beta.svg){type="joined"} 代表 **Beta**
    * ![Stable stability level](https://kotl.in/badges/stable.svg){type="joined"} 代表 **穩定 (Stable)**

* **支援 (Support)** 狀態：這顯示了我們維護專案並協助使用者解決問題的承諾。
  支援層級對於所有 JetBrains 產品都是統一的。  
  [詳情請參閱 JetBrains 開源文件](https://github.com/JetBrains#jetbrains-on-github)。

## 子元件的穩定性

一個穩定的元件可能包含實驗性的子元件，例如：
* 穩定的編譯器可能包含實驗性功能；
* 穩定的 API 可能包含實驗性的類別或函式；
* 穩定的命令列工具可能包含實驗性選項。

我們確保會精確地記錄哪些子元件不是 **穩定 (Stable)** 的。
我們也會盡力在可能的情況下提醒使用者，並要求明確啟用 (opt-in) 它們，以避免意外使用尚未以穩定版發布的功能。

## Kotlin 元件的當前穩定性

> 預設情況下，所有新元件均具備實驗性 (Experimental) 狀態。
>
{style="note"}

### Kotlin 編譯器

| **元件**                                                            | **狀態** | **自該版本起的狀態** | **備註** |
|---------------------------------------------------------------------|------------|--------------------------|--------------|
| Kotlin/JVM                                                          | 穩定 (Stable) | 1.0.0                    |              |
| Kotlin/Native                                                       | 穩定 (Stable) | 1.9.0                    |              |
| Kotlin/JS                                                           | 穩定 (Stable) | 1.3.0                    |              |
| Kotlin/Wasm                                                         | Beta       | 2.2.20                   |              |
| [Analysis API](https://kotlin.github.io/analysis-api/index_md.html) | 穩定 (Stable) |                          |              |

### 核心編譯器外掛程式

| **元件**                                         | **狀態**   | **自該版本起的狀態** | **備註** |
|--------------------------------------------------|--------------|--------------------------|--------------|
| [All-open](all-open-plugin.md)                   | 穩定 (Stable) | 1.3.0                    |              |
| [No-arg](no-arg-plugin.md)                       | 穩定 (Stable) | 1.3.0                    |              |
| [SAM-with-receiver](sam-with-receiver-plugin.md) | 穩定 (Stable) | 1.3.0                    |              |
| [kapt](kapt.md)                                  | 穩定 (Stable) | 1.3.0                    |              |
| [Lombok](lombok.md)                              | Alpha        | 2.3.20                   |              |
| [Power-assert](power-assert.md)                  | 實驗性 (Experimental) | 2.0.0                    |              |

### Kotlin 程式庫

| **元件**                      | **狀態** | **自該版本起的狀態** | **備註** |
|-------------------------------|------------|--------------------------|--------------|
| kotlin-stdlib (JVM)           | 穩定 (Stable) | 1.0.0                    |              |
| kotlinx-coroutines            | 穩定 (Stable) | 1.3.0                    |              |
| kotlinx-serialization         | 穩定 (Stable) | 1.0.0                    |              |
| kotlin-metadata-jvm           | 穩定 (Stable) | 2.0.0                    |              |
| kotlin-reflect (JVM)          | Beta       | 1.0.0                    |              |
| kotlinx-datetime              | Alpha      | 0.2.0                    |              |
| kotlinx-io                    | Alpha      | 0.2.0                    |              |
| kotlinx-collections-immutable | Alpha      | 0.3.5                    |              |

### Kotlin Multiplatform

| **元件**                                       | **狀態** | **自該版本起的狀態** | **備註**                                                                                                                         |
|------------------------------------------------|------------|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Kotlin Multiplatform                           | 穩定 (Stable) | 1.9.20                   |                                                                                                                                      |
| 適用於 Android Studio 的 Kotlin Multiplatform 外掛程式 | Beta       | 0.8.0                    | [與語言分開建立版本](https://kotlinlang.org/docs/multiplatform/multiplatform-plugin-releases.html) |

### Kotlin/Native

| **元件**                                     | **狀態** | **自該版本起的狀態** | **備註**                                                                                                                  |
|----------------------------------------------|------------|--------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| Kotlin/Native Runtime                        | 穩定 (Stable) | 1.9.20                   |                                                                                                                               |
| Kotlin/Native 與 C 及 Objective-C 的互通性       | Beta       | 1.3.0                    | [C 與 Objective-C 程式庫匯入的穩定性](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import) |
| klib 二進位檔                                  | 穩定 (Stable) | 1.9.20                   | 不包括 cinterop klib，見下方                                                                                       |
| cinterop klib 二進位檔                         | Beta       | 1.3.0                    | [C 與 Objective-C 程式庫匯入的穩定性](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import) |
| CocoaPods 整合                               | 穩定 (Stable) | 1.9.20                   |                                                                                                                               |

有關不同目標支援層級的更多資訊，請參閱 [](native-target-support.md)。

### 建置工具

| **元件**                                            | **狀態** | **自該版本起的狀態** | **備註**                                                                                                          |
|---------------------------------------------------|------------|--------------------------|-------------------------------------------------------------------------------------------------------------------|
| [Kotlin Gradle 外掛程式](gradle-configure-project.md) | 穩定 (Stable) | 1.1.1                    | [Kotlin Multiplatform Gradle 外掛程式](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#id-and-version) 自 Kotlin 1.9.20 起已穩定。 |
| [Kotlin Maven 外掛程式](maven-configure-project.md)   | 穩定 (Stable) | 1.0.0                    |                                                                                                                   |

### 語言工具

| **元件**                              | **狀態**   | **自該版本起的狀態** | **備註**                                   |
|---------------------------------------|--------------|--------------------------|------------------------------------------------|
| 指令碼語法與語意                       | Alpha        | 1.2.0                    |                                                |
| 指令碼內嵌與擴充 API                   | Beta         | 1.5.0                    |                                                |
| 指令碼 IDE 支援                       | Beta         |                          | 自 IntelliJ IDEA 2023.1 及更高版本起可用 |
| CLI 指令碼                             | Alpha        | 1.2.0                    |                                                |

## 語言特性與設計提案

有關語言特性與新的設計提案，請參閱 [](kotlin-language-features-and-proposals.md)。