[//]: # (title: 自訂編譯器外掛程式)

> Kotlin 編譯器外掛程式 API 目前並不穩定，且在每個版本中都會引入重大變更（breaking changes）。
> 
{style="warning"}

編譯器外掛程式會在編譯過程中介入，在程式碼編譯時進行分析或修改，而不需要修改編譯器本身。例如，它們可以為程式碼加上註解或產生新程式碼，使其與其他架構或 API 相容。

在建立自己的自訂編譯器外掛程式之前，請先查看[可用編譯器外掛程式清單](compiler-plugins-overview.md)，確認是否已有符合你使用案例的外掛程式。

你也可以檢查是否能使用 [Kotlin Symbol Processing (KSP) API](https://kotlinlang.org/docs/ksp-overview.html) 或外部 linter（例如 [Android lint](https://developer.android.com/studio/write/lint)）來達成你的目標。

如果你_仍然_找不到符合需求的方案，則可以建立自訂編譯器外掛程式。請注意，Kotlin 編譯器外掛程式 API **並不穩定**。由於每個新的編譯器版本都會引入重大變更，因此你需要投入大量持續的精力來維護它。

### Kotlin 編譯器與編譯器外掛程式 {id="the-kotlin-compiler-and-compiler-plugins"}

<p></p> <!-- workaround for MRK057: Paragraph can only contain inline elements-->
<list columns="2">
    <li>
        <p></p>
        <br/>
        <img src="compiler-stages.svg" width="400" alt="Kotlin compiler stages"/>
    </li>
    <li>
        <p>Kotlin 編譯器會：</p>
        <ol>
            <li>剖析原始碼並將其轉換為結構化語法樹。</li>
            <li>透過確定程式碼的含義、解析名稱、檢查型別並強制執行可見性規則，來分析並解析程式碼。</li>
            <li>產生中介表示式 (Intermediate Representation, IR)，這是一種充當原始碼與機器碼之間橋樑的資料結構。</li>
            <li>逐步將 IR 降階 (lower) 為更簡單的形式。</li>
            <li>將降階後的 IR 轉譯為特定目標的輸出，例如 JVM 位元組碼、JavaScript 或原生機器碼。</li>
        </ol>
    </li>
</list>

外掛程式可以透過前端 API 影響編譯器的初始階段，從而改變編譯器解析程式碼的方式。
例如，外掛程式可以新增註解、引入沒有主體的新方法，或變更可見性修飾詞。這些變更在 IDE 中是可見的。

外掛程式也可以透過後端 API 影響後續階段，修改宣告的行為。這些變更會出現在編譯完成後產生的二進位檔中。

在實務中，編譯器外掛程式會影響從分析與解析到程式碼產生的各個階段，涵蓋前端與後端。例如，前端部分產生宣告，而後端部分則為這些宣告新增主體。

![Kotlin compiler stages with plugins](compiler-stages-with-plugins.svg){width=650}

[Kotlin 序列化外掛程式](https://github.com/Kotlin/kotlinx.serialization) 就是一個很好的例子。該外掛程式的前端部分會新增一個伴生物件與序列化器函式，並進行檢查以防止名稱衝突。後端部分則透過 `KSerializer` 物件來實作所需的序列化行為。

### Kotlin 編譯器外掛程式範本 {id="kotlin-compiler-plugin-template"}

若要開始撰寫自訂編譯器外掛程式，你可以使用 [Kotlin 編譯器外掛程式範本](https://github.com/Kotlin/compiler-plugin-template)。
接著註冊來自前端與後端外掛程式 API 的擴充點。

> 目前，你只能使用 [Gradle](gradle.md) 開發自訂編譯器外掛程式。
> 
{style="note"}

### 前端外掛程式 API {id="frontend-plugin-api"}

前端外掛程式 API（也稱為前端中介表示式，FIR）具有以下專門的擴充點來自訂解析行為：

| 擴充點名稱                                                                                                                                                                                   | 說明                                                                                     |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| [`FirAdditionalCheckersExtension`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/checkers/src/org/jetbrains/kotlin/fir/analysis/extensions/FirAdditionalCheckersExtension.kt) | 新增自訂編譯器檢查器。                                                                   |
| [`FirDeclarationGenerationExtension`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/providers/src/org/jetbrains/kotlin/fir/extensions/FirDeclarationGenerationExtension.kt)   | 產生新宣告。                                                                             |
| [`FirExtensionSessionComponent`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/tree/src/org/jetbrains/kotlin/fir/extensions/FirExtensionSessionComponent.kt)                  | 在 `FirSession` 中註冊自訂組件，以供外掛程式的其他部分使用。                             |
| [`FirFunctionTypeKindExtension`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/tree/src/org/jetbrains/kotlin/fir/extensions/FirFunctionTypeKindExtension.kt)                  | 定義新的函式型別系列。                                                                   |
| [`FirMetadataSerializerPlugin`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/fir-serialization/src/org/jetbrains/kotlin/fir/serialization/FirMetadataSerializerPlugin.kt)    | 讀取並寫入資訊至宣告元資料。                                                             |
| [`FirStatusTransformerExtension`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/resolve/src/org/jetbrains/kotlin/fir/extensions/FirStatusTransformerExtension.kt)             | 修改宣告狀態屬性，例如可見性或模態 (modality)。                                          |
| [`FirSupertypeGenerationExtension`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/resolve/src/org/jetbrains/kotlin/fir/extensions/FirSupertypeGenerationExtension.kt)         | 為現有類別新增超型別。                                                                   |
| [`FirTypeAttributeExtension`]( https://github.com/JetBrains/kotlin/blob/master/compiler/fir/tree/src/org/jetbrains/kotlin/fir/extensions/FirTypeAttributeExtension.kt)                       | 根據型別註解為特定型別新增特殊屬性。                                                     |

#### IDE 整合 {id="ide-integration"}

解析的變更會影響 IDE 的行為（例如程式碼高亮與建議），因此確保外掛程式與 IDE 相容至關重要。每個版本的 IntelliJ IDEA 和 Android Studio 都包含一個 Kotlin 編譯器的開發版本。此版本專為 IDE 所設計，與已發布的 Kotlin 編譯器在二進位層面上並不相容。
因此，當你更新 IDE 時，也需要更新編譯器外掛程式以保持其正常運作。基於這個原因，社群外掛程式預設不會載入。

為了確保你的自訂編譯器外掛程式能與不同的 IDE 版本搭配運作，請針對每個 IDE 版本進行測試並修正發現的任何問題。

如果有適用於 Kotlin 編譯器外掛程式的 devkit，支援多個 IDE 版本可能會變得更加容易。如果你對此功能感興趣，請在我們的[問題追蹤器](https://youtrack.jetbrains.com/issue/KT-82617)中分享你的回饋。

### 後端外掛程式 API {id="backend-plugin-api"}

> 在不降低 IDE 或偵錯工具效能的情況下正確開發後端外掛程式相當困難，因此在進行變更時請務必謹慎且保守。
> 
{style="warning"}

後端外掛程式 API（也稱為 IR）只有一個擴充點：[`IrGenerationExtension`](https://github.com/JetBrains/kotlin/blob/master/compiler/ir/backend.common/src/org/jetbrains/kotlin/backend/common/extensions/IrGenerationExtension.kt)。
使用此擴充點並覆寫 `generate()` 函式，即可為前端已產生的宣告新增主體，或修改現有的宣告主體。

透過此擴充點所做的變更**不會**由編譯器進行檢查。你必須確保你的變更在此階段不會破壞編譯器的預期。例如，你可能會不小心引入無效型別、不正確的函式參照，或是超出正確作用域的參照。

#### 探索後端外掛程式程式碼 {id="explore-backend-plugin-code"}

你可以瀏覽 Kotlin 序列化外掛程式程式碼，了解後端外掛程式編譯器程式碼在實務中的外觀。
例如，[`SerializableCompanionIrGenerator.kt`](https://github.com/JetBrains/kotlin/blob/master/plugins/kotlinx-serialization/kotlinx-serialization.backend/src/org/jetbrains/kotlinx/serialization/compiler/backend/ir/SerializerIrGenerator.kt)
為關鍵的序列化器成員填補缺失的主體。其中一個例子是 [`generateChildSerializersGetter()`](https://github.com/JetBrains/kotlin/blob/9cfa558902abc13d245c825717026af63ef82dd2/plugins/kotlinx-serialization/kotlinx-serialization.backend/src/org/jetbrains/kotlinx/serialization/compiler/backend/ir/SerializerIrGenerator.kt#L242)
函式，它會收集 `KSerializer` 運算式清單並將它們以陣列形式傳回。

#### 檢查後端外掛程式程式碼中的問題 {id="check-your-backend-plugin-code-for-problems"}

你可以透過三種方式檢查後端外掛程式程式碼中的問題：

1. **驗證 IR**

    建構 IR 樹並啟用 `Xverify-ir` 編譯器選項。此選項會對編譯速度造成效能影響，因此請僅在測試期間使用。

2. **傾印並比較 IR 輸出**

    使用 `-Xphases-to-dump-before=ExternalPackageParentPatcherLowering` 編譯器選項在 IR 降階編譯階段之後建立傾印檔。對於 JVM 後端，可以使用 `-Xdump-directory=<your-file-directory>` 編譯器選項設定傾印目錄。手動撰寫預期的程式碼，產生另一個傾印檔，並比較兩者以確認是否存在差異。

3. **偵錯編譯器程式碼**

    在 `convertToIr.kt` 檔案中，於 `convertToIrAndActualize()` 函式內新增中斷點，並以偵錯模式執行編譯器，以在編譯期間取得更詳細的資訊。

### 測試你的外掛程式 {id="test-your-plugin"}

實作外掛程式後，請徹底進行測試。[Kotlin 編譯器外掛程式範本](https://github.com/Kotlin/compiler-plugin-template) 已經設定為使用 [Kotlin 編譯器測試架構](https://github.com/JetBrains/kotlin/blob/master/compiler/test-infrastructure/ReadMe.md)。
你可以在以下目錄中新增測試：

* `compiler-plugin/testData`
* `compiler-plugin/testData/box`：用於程式碼產生測試
* `compiler-plugin/testData/diagnostics`：用於診斷測試

當測試執行時，架構會：

1. 剖析測試原始碼檔案。例如 [`anotherBoxTest.kt`](https://github.com/Kotlin/compiler-plugin-template/blob/master/compiler-plugin/testData/box/anotherBoxTest.kt)
2. 為每個檔案建構 FIR 與 IR。
3. 將這些內容寫入為文字傾印檔。例如 [`anotherBoxTest.fir.txt`](https://github.com/Kotlin/compiler-plugin-template/blob/master/compiler-plugin/testData/box/anotherBoxTest.fir.txt) 與 [`anotherBoxTest.fir.ir.txt`](https://github.com/Kotlin/compiler-plugin-template/blob/master/compiler-plugin/testData/box/anotherBoxTest.fir.ir.txt)。
4. 如果先前已建立過相應檔案，則將這些檔案與之進行比較。

你可以使用這些檔案來檢查產生的 diff 中是否有任何未預期的變更。如果沒有問題，新的傾印檔就會成為你最新的 _golden_ 檔案：一個經過核准且受信任的基準來源，可用於與未來的變更進行比較。

### 取得協助 {id="get-help"}

如果你在開發自訂編譯器外掛程式時遇到問題，歡迎在 [Kotlin Slack](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up) 的 [#compiler](https://slack-chats.kotlinlang.org/c/compiler) 頻道中尋求協助。我們無法保證一定能解決問題，但只要能力所及，我們都會盡力協助。