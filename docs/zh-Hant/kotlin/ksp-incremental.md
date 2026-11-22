[//]: # (title: 增量處理)

<web-summary>了解 KSP 中的增量處理如何運作，以及它如何減少建置時間。</web-summary>

KSP 支援增量處理。它僅在檔案的一或多個相依性發生變更時，才會重新處理該檔案。這可避免不必要的重複處理，進而縮短編譯時間。

增量處理預設為啟用。您可以在進行疑難排解或強制完整重新組建時將其停用。若要停用增量處理，請在 `gradle.properties` 檔案中新增以下內容：

```properties
ksp.incremental=false
```

## Dirty 檔案 {id="dirty-files"}

_dirty_ 檔案是指 KSP 需要重新處理的檔案。如果開發人員直接修改了某個檔案，或者其他 dirty 檔案中的變更間接影響了該檔案，該檔案就會變成 dirty 狀態。

為了判斷哪些原始程式碼處於 dirty 狀態，KSP 依賴處理器將產生的輸出與其對應的輸入原始程式碼建立關聯。當變更發生時，KSP 會利用這些關聯來識別必須重新處理的原始程式碼。

KSP 要求處理器僅宣告一組最小的_根原始程式碼（root sources）_。處理器將它們作為進入點來遍歷程式碼結構。

根原始程式碼是指其符號直接取自以下任一方法的原始碼檔案：

* `Resolver.getAllFiles()`
* `Resolver.getSymbolsWithAnnotation()`
* `Resolver.getClassDeclarationByName()`
* `Resolver.getDeclarationsFromPackage()`

處理器可以透過解析來自根原始程式碼的資訊，從其他原始碼檔案中取得額外的符號。KSP 會自動追蹤這些相依性。

產生輸出時，處理器必須宣告對該輸出有所貢獻的根原始程式碼。KSP 會使用這些根原始程式碼及其被追蹤的相依性，來判斷何時需要重新產生該輸出。

> 使用 `CodeGenerator` 介面建立輸出檔案，並將輸入與輸出建立關聯。若要了解更多資訊，
> 請參閱 [KSP 原始碼中的 `CodeGenerator.kt`](https://github.com/google/ksp/blob/main/api/src/main/kotlin/com/google/devtools/ksp/processing/CodeGenerator.kt)。
>
{style="tip"}

### 聚合（Aggregating）與隔離（Isolating）輸出 {id="aggregating-and-isolating-outputs"}

KSP 將產生的輸出分為兩種類型：聚合與隔離。

> 與 Gradle 註解處理不同，KSP 的分類適用於個別輸出，
> 而非整個處理器。
>
{style="note"}

<deflist collapsible="true">
<def title="Aggregating">

聚合輸出可能會受到任何原始碼檔案中變更的影響。
例如，收集所有帶有特定註解之符號的輸出。

任何輸入變更（包括刪除檔案）都會觸發所有聚合輸出的重新組建，並重新處理所有對應已註冊、新增或修改的原始碼檔案。

</def>
<def title="Isolating">

隔離輸出僅相依於其指定的原始程式碼。例如，為實作特定介面而產生的類別即為隔離輸出。

對明確指定以外的原始程式碼進行變更，不會影響該輸出。多個原始碼檔案可以與單一輸出建立關聯。

</def>
</deflist>

### Dirty 狀態傳播 {id="dirtiness-propagation"}

當檔案變成 dirty 狀態時，KSP 會透過以下方式傳播 dirty 狀態：

* **解析追蹤（Resolution tracing）**：當處理器解析型別參照時，KSP 會在包含該參照的檔案與可能影響結果的每個檔案之間記錄相依性。如果這些檔案中的任何一個發生變更，包含該參照的檔案就會變成 dirty 狀態。這同時適用於顯式與隱式型別解析。

  處理器只能透過解析型別從一個檔案移動到另一個檔案，因此這些是 KSP 唯一需要追蹤的跨檔案相依性。

* **共享輸出（Shared outputs）**：如果某個 dirty 檔案對某個產生的輸出有所貢獻，則對同一輸出有所貢獻的所有其他檔案也會變成 dirty 狀態。這會根據共享輸出將相關檔案分組為等價類別（equivalence classes）。

KSP 會反覆套用這兩條規則，直到不再出現新的 dirty 檔案為止。例如，透過解析追蹤變成 dirty 的檔案，可能會透過共享輸出使其他檔案變成 dirty。接著，那些檔案又可能透過解析追蹤使更多檔案變成 dirty。

## 實作細節 {id="implementation"}

相依性由輸入檔案與輸出檔案之間的多對多關係決定。

KSP 使用以下規則來確定要重新處理的檔案：

* 如果輸入檔案發生變更，該檔案一定會被重新處理，因為變更可能會為處理器引入新資訊。
* 如果變更的輸入檔案與某個輸出相關聯，KSP 也會重新處理與該輸出相關聯的所有其他輸入檔案。這是因為處理器可能需要所有輸入才能重新產生該輸出。
  KSP 會重複此過程，直到不再出現新的 dirty 檔案為止。
* 除非符合前述規則之一，否則 KSP 不會重新處理未與任何聚合輸出關聯且未變更的輸入檔案。這樣的檔案不會對任何輸出產生影響。

例如，考慮具有以下結構的專案，其中 `sourceA` 與 `sourceB` 彼此獨立，且 `outputA` 是隔離的：

```text
.
├── src
│   ├── sourceA.kt
│   └── sourceB.kt
└── generated
    ├── outputA
    └── outputB
```

處理器：

* 讀取 `sourceA` 並產生 `outputA`。
* 讀取 `sourceB` 並產生 `outputB`。

如果 `sourceA` 變更：
* 若 `outputB` 是聚合輸出，KSP 會重新處理 `sourceA` 與 `sourceB`。
* 若 `outputB` 是隔離輸出，KSP 僅會重新處理 `sourceA`。

如果新增了 `sourceC`：
* 若 `outputB` 是聚合輸出，KSP 會重新處理 `sourceC` 與 `sourceB`。
* 若 `outputB` 是隔離輸出，KSP 僅會重新處理 `sourceC`。

如果 `sourceA` 被移除：
* 若 `outputB` 是聚合輸出，KSP 會重新處理 `sourceB`。
* 若 `outputB` 是隔離輸出，KSP 不需要重新處理任何檔案。

如果 `sourceB` 被移除，無論哪種情況，KSP 都不需要重新處理任何檔案，因為 `sourceB` 是 `outputB` 的唯一原始程式碼來源。

## 處理器範例 {id="example-processor"}

以下專案包含類別 `A` 與 `B`，其中 `A` 繼承自 `B`：

```kotlin
// A.kt
@Interesting
class A : B()

// B.kt
open class B

// Example1Processor.kt
class Example1Processor(private val codeGenerator: CodeGenerator) : SymbolProcessor {
    override fun process(resolver: Resolver): List<KSAnnotated> {
        val declA = resolver.getSymbolsWithAnnotation("Interesting")
            .firstOrNull() as? KSClassDeclaration
            // 在後續輪次中，如果沒有發現新的帶有註解的符號，則提早返回
            ?: return emptyList()
        val declB = declA.superTypes.first().resolve().declaration
        // 不需要 B.kt，因為它可以被 KSP 推導為相依項
        val dependencies = Dependencies(aggregating = true, declA.containingFile!!)
        // outputForA.kt
        val outputName = "outputFor${declA.simpleName.asString()}"
        // outputForA 相依於 A.kt 和 B.kt
        val output = codeGenerator.createNewFile(dependencies, "com.example", outputName, "kt")
        output.write("// $declA : $declB\n".toByteArray())
        output.close()
        return emptyList()
    }
    // ...
}
```

為了產生 `outputForA`，處理器會執行以下步驟：

1. 透過呼叫 `Resolver.getSymbolsWithAnnotation()` 取得 `A`。
2. 透過解析 `A` 的 `superTypes` 中的超型別參照來取得 `B`。

KSP 透過解析追蹤來追蹤此關聯，並自動將 `B` 記錄為 `A` 的相依項。因此，您不需要明確將 `B.kt` 宣告為 `outputForA` 的相依項。

## 回報錯誤 {id="reporting-bugs"}

如果您遇到僅在啟用增量處理時才會發生的錯誤，請在 [KSP GitHub 存儲庫](https://github.com/google/ksp/issues) 中建立問題並附加相關的記錄檔。

若要收集記錄檔並將其附加至問題：

1. 在 `gradle.properties` 檔案中新增以下內容，以擷取增量處理記錄：

   ```properties
   ksp.incremental.log=true
   ```

2. 執行一次成功完成的清理建置。
3. 將產生的記錄檔複製到其他位置以進行儲存：

   * `build/kspCaches/<source set>/logs/kspDirtySet.log`
   * `build/kspCaches/<source set>/logs/kspSourceToOutputs.log`

4. 修改觸發問題的原始碼檔案，並再次執行建置。
5. 將成功建置以及重現問題之建置的記錄檔附加到 GitHub 問題中。

### 將符號相依圖視覺化 {id="visualizing-the-symbol-dependency-graph"}

為了協助對增量處理進行偵錯，KSP 可以產生 Graphviz DOT 檔案，將從指定符號開始的符號相依圖視覺化。

啟用增量記錄，並指定要作為視覺化圖形起點之符號的[完全限定名稱](packages.md#package-headers)：

```properties
ksp.incremental.log=true
ksp.incremental.log.graph.origin=<fully-qualified-name>
```

如果您從命令列使用 KSP，請新增以下選項：

```bash
-incremental-log=true -incremental-log-graph-origin=<fully-qualified-name>
```

KSP 會將圖形寫入至 `kspLookupGraphOrigin.dot` 檔案中，該檔案位於與其他增量處理記錄相同的 `logs` 目錄下。

## 相關內容 {id="see-also"}

* 了解處理器如何[宣告其輸出的相依性](ksp-quickstart.md#create-and-register-a-processor)。
* 了解 KSP 如何[在多個輪次中執行處理器](ksp-multi-round.md)。
* 了解 [KSP 如何為 Kotlin 程式碼建立模型](ksp-kotlin-model.md)以及何時進行型別解析。
* 了解如何[從命令列執行 KSP](ksp-command-line.md)（無需使用適用於 Gradle 的 KSP 外掛程式）。