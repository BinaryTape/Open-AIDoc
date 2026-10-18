[//]: # (title: Kotlin 組件的穩定性)

Kotlin 語言和工具集被劃分為許多組件，例如針對 JVM、JS 和 Native 目標的編譯器、標準庫（Standard Library）、各種附帶工具等等。
這些組件中的許多已經正式發佈為 **Stable**，這意味著它們遵循[_舒適升級_與_保持語言現代化_的原則](kotlin-evolution-principles.md)以回溯相容的方式演進。

遵循_回饋循環（Feedback Loop）_原則，我們會提早發佈許多內容供社群試用，
因此許多組件尚未作為 **Stable** 發佈。
其中一些處於非常早期的階段，一些則相對成熟。
我們根據每個組件的演進速度以及使用者採用時所承擔的風險程度，將它們標記為 **Experimental**、**Alpha** 或 **Beta**。

## 穩定性級別說明 {id="stability-levels-explained"}

以下是有關這些穩定性級別及其含義的快速指南：

**Experimental** 意味著「僅在實驗性（toy）專案中試用」：
* 我們只是在測試一個想法及其可行性。我們希望一些使用者能夠試用並分享他們的回饋。
  其範圍是最小限度的，且該功能可能隨時更改或消失。我們不保證穩定性或相容性。

**Alpha** 意味著「我們正在測試這是否應該達到生產就緒（production-ready）狀態」：
* 我們打算將其轉化為產品，並正在驗證其使用者價值和市場適配度以塑造其最終形式。
  功能集仍不完整，預計會有破壞性變更（breaking changes）。如果假設不成立，
  我們可能會大幅更改或中止該功能。

**Beta** 意味著「你可以使用它，我們將盡最大努力為你將遷移問題降至最低」：
* 它幾乎已經完成，現在使用者回饋尤其重要。
* 不過，它尚未 100% 完成，因此仍可能會發生變更（包括根據你自己的回饋進行的變更）。
* 請提前關注棄用警告，以獲得最佳的更新體驗。

我們統稱 _Experimental_、_Alpha_ 和 _Beta_ 為 **pre-stable** 級別。

<a name="stable"/>

**Stable** 意味著「即使在最保守的情境下也可以使用」：
* 它已經完成。我們將根據嚴格的[回溯相容性規則](https://kotlinfoundation.org/language-committee-guidelines/)來對其進行演進。

請注意，穩定性級別並不代表該組件多快會以 Stable 形式發佈。同樣地，它們也不代表組件在發佈前會做多大程度的修改。它們僅表示組件變化的速度，以及使用者面臨更新問題的風險程度。

## Kotlin 組件的 GitHub 徽章 {id="github-badges-for-kotlin-components"}

[Kotlin GitHub 組織](https://github.com/Kotlin)託管著各類與 Kotlin 相關的專案。
其中一些專案我們全職進行開發，而另一些則是附屬專案。

每個 Kotlin 專案都有兩個描述其穩定性與支援狀態的 GitHub 徽章：

* **Stability**（穩定性）狀態。這顯示了每個專案演進的速度，以及使用者採用它時所承擔的風險。
  穩定性狀態與 [Kotlin 語言特性及其組件的穩定性級別](#stability-levels-explained)完全一致：
    * ![Experimental stability level](https://kotl.in/badges/experimental.svg){type="joined"} 代表 **Experimental**
    * ![Alpha stability level](https://kotl.in/badges/alpha.svg){type="joined"} 代表 **Alpha**
    * ![Beta stability level](https://kotl.in/badges/beta.svg){type="joined"} 代表 **Beta**
    * ![Stable stability level](https://kotl.in/badges/stable.svg){type="joined"} 代表 **Stable**

* **Support**（支援）狀態。這表明我們維護專案以及協助使用者解決問題的承諾程度。
  所有 JetBrains 產品的支援級別都是統一的。  
  [詳細資訊請參閱 JetBrains 開源文件](https://github.com/JetBrains#jetbrains-on-github)。

## 子組件的穩定性 {id="stability-of-subcomponents"}

一個穩定的組件可能包含實驗性的子組件，例如：
* 穩定的編譯器可能包含實驗性功能；
* 穩定的 API 可能包含實驗性的類別或函式；
* 穩定的命令列工具可能具有實驗性選項。

我們會確保精確地記錄哪些子組件不是 **Stable**。
我們還會盡最大努力在可能的情況下向使用者發出警告，並要求顯式啟用（opt in）它們，
以避免意外使用未作為穩定版發佈的功能。

## Kotlin 組件目前的穩定性 {id="current-stability-of-kotlin-components"}

> 預設情況下，所有新組件的狀態均為 Experimental。
>
{style="note"}

### Kotlin 編譯器 {id="kotlin-compiler"}

| **組件**                                                            | **狀態** | **起始版本** | **備註** |
|---------------------------------------------------------------------|------------|--------------------------|--------------|
| Kotlin/JVM                                                          | Stable     | 1.0.0                    |              |
| Kotlin/Native                                                       | Stable     | 1.9.0                    |              |
| Kotlin/JS                                                           | Stable     | 1.3.0                    |              |
| Kotlin/Wasm                                                         | Beta       | 2.2.20                   |              |
| [Analysis API](https://kotlin.github.io/analysis-api/index_md.html) | Stable     |                          |              |

### 核心編譯器外掛程式 {id="core-compiler-plugins"}

| **組件**                                         | **狀態**   | **起始版本** | **備註** |
|--------------------------------------------------|--------------|--------------------------|--------------|
| [All-open](all-open-plugin.md)                   | Stable       | 1.3.0                    |              |
| [No-arg](no-arg-plugin.md)                       | Stable       | 1.3.0                    |              |
| [SAM-with-receiver](sam-with-receiver-plugin.md) | Stable       | 1.3.0                    |              |
| [kapt](kapt.md)                                  | Stable       | 1.3.0                    |              |
| [Lombok](lombok.md)                              | Alpha        | 2.3.20                   |              |
| [Power-assert](power-assert.md)                  | Experimental | 2.0.0                    |              |

### Kotlin 程式庫 {id="kotlin-libraries"}

| **組件**                      | **狀態** | **起始版本** | **備註** |
|-------------------------------|------------|--------------------------|--------------|
| kotlin-stdlib (JVM)           | Stable     | 1.0.0                    |              |
| kotlinx-coroutines            | Stable     | 1.3.0                    |              |
| kotlinx-serialization         | Stable     | 1.0.0                    |              |
| kotlin-metadata-jvm           | Stable     | 2.0.0                    |              |
| kotlin-reflect (JVM)          | Beta       | 1.0.0                    |              |
| kotlinx-datetime              | Alpha      | 0.2.0                    |              |
| kotlinx-io                    | Alpha      | 0.2.0                    |              |
| kotlinx-collections-immutable | Alpha      | 0.3.5                    |              |

### Kotlin Multiplatform {id="kotlin-multiplatform"}

| **組件**                        | **狀態** | **起始版本** | **備註**                                                                                                                             |
|---------------------------------|------------|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Kotlin Multiplatform            | Stable     | 1.9.20                   |                                                                                                                                      |
| Kotlin Multiplatform IDE plugin | Stable     | 0.9                      | [與語言版本獨立分開管理](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-plugin-releases.html) |

### Kotlin/Native {id="kotlin-native"}

| **組件**                                     | **狀態** | **起始版本** | **備註**                                                                                                                      |
|----------------------------------------------|------------|--------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| Kotlin/Native Runtime                        | Stable     | 1.9.20                   |                                                                                                                               |
| Kotlin/Native interop with C and Objective-C | Beta       | 1.3.0                    | [C 與 Objective-C 程式庫匯入的穩定性](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import)         |
| klib 二進位檔                                | Stable     | 1.9.20                   | 不包含 cinterop klib，詳見下方說明                                                                                            |
| cinterop klib 二進位檔                       | Beta       | 1.3.0                    | [C 與 Objective-C 程式庫匯入的穩定性](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import)         |
| CocoaPods 整合                               | Stable     | 1.9.20                   |                                                                                                                               |

有關不同目標支援級別的更多資訊，請參閱 [](native-target-support.md)。

### 建置工具 {id="build-tools"}

| **組件**                                            | **狀態** | **起始版本** | **備註**                                                                                                                                                          |
|-----------------------------------------------------|------------|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Kotlin Gradle plugin](gradle-configure-project.md) | Stable     | 1.1.1                    | [Kotlin Multiplatform Gradle plugin](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#id-and-version) 自 Kotlin 1.9.20 起達到穩定狀態。 |
| [Kotlin Maven plugin](maven-configure-project.md)   | Stable     | 1.0.0                    |                                                                                                                                                                   |

### 建置工具 API (BTA) {id="build-tools-api-bta"}

| **組件**      | **狀態** | **起始版本** | **備註** |
|---------------|------------|--------------------------|--------------|
| BTA for JVM   | Beta       | 2.4.20                   |              |
| BTA for JS    | Alpha      | 2.4.20                   |              |
| BTA for Wasm  | Alpha      | 2.4.20                   |              |

> 建置工具 API 目前不支援 Kotlin/Native。
> 
{style="note"}

### 語言工具 {id="language-tools"}

| **組件**                              | **狀態**   | **起始版本** | **備註**                                       |
|---------------------------------------|--------------|--------------------------|------------------------------------------------|
| 指令碼語法與語意                      | Alpha        | 1.2.0                    |                                                |
| 指令碼嵌入與擴充 API                  | Beta         | 1.5.0                    |                                                |
| 指令碼 IDE 支援                       | Beta         |                          | 自 IntelliJ IDEA 2023.1 及更新版本起提供支援   |
| CLI 指令碼                            | Alpha        | 1.2.0                    |                                                |

## 語言特性與設計提案 {id="language-features-and-design-proposals"}

有關語言特性和新設計提案，請參閱 [](kotlin-language-features-and-proposals.md)。