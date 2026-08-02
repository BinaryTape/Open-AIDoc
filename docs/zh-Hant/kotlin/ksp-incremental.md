[//]: # (title: 增量處理)

KSP 支援增量處理（incremental processing）：僅當一個或多個相依性發生變更時，KSP 才會重新處理檔案。這可以避免不必要的重新處理，進而縮短編譯時間。

增量處理預設為啟用。您可以在進行疑難排解或需要強制執行完整重新組建時將其停用。若要停用，請在您的 `gradle.properties` 檔案中加入以下行：

```properties
ksp.incremental=false
```

## Dirty 檔案

如果一個檔案是由開發人員直接修改，或者是間接受到其他 dirty 檔案變更的影響，則該檔案被視為 *dirty*（需要重新處理）。

為了確定哪些來源是 dirty 的，KSP 仰賴處理器將產生的輸出與其對應的輸入來源建立關聯。KSP 利用這些關聯來識別發生變更時必須重新處理的來源。

KSP 僅需要一組最小的根來源（root sources）。處理器將這些來源作為導覽程式碼結構的入口點。

根來源是指其符號直接從以下任何方法取得的來源檔案：

* `Resolver.getAllFiles()`
* `Resolver.getSymbolsWithAnnotation()`
* `Resolver.getClassDeclarationByName()`
* `Resolver.getDeclarationsFromPackage()`

處理器可以透過解析來自根來源的資訊，從其他來源檔案取得額外的符號。KSP 會自動追蹤這些相依性。

產生輸出時，處理器必須宣告對該輸出有貢獻的根來源。KSP 使用這些根來源及其被追蹤的相依性來判斷何時需要重新產生輸出。

> 使用 `CodeGenerator` 介面來建立輸出檔案並將輸入與輸出建立關聯。如需更多資訊，請參閱 [原始碼中的 `CodeGenerator.kt`](https://github.com/google/ksp/blob/main/api/src/main/kotlin/com/google/devtools/ksp/processing/CodeGenerator.kt)。
>
{style="tip"}

### 聚合與隔離輸出

KSP 將產生的輸出分為兩種類型：聚合（aggregating）和隔離（isolating）。

> 與 Gradle 註解處理不同，KSP 將分類套用於個別輸出，而不是針對整個處理器。
>
{style="note"}

<deflist collapsible="true">
<def title="聚合">

聚合輸出可能會受到任何來源檔案變更的影響，但移除不影響其他檔案的情況除外。

任何輸入變更都會觸發所有聚合輸出的重新組建，並重新處理所有對應的已註冊、新增或修改的原始碼檔案。

例如，收集具有特定註解之所有符號的輸出即為聚合輸出。

</def>
<def title="隔離">

隔離輸出僅取決於其指定的來源。

對其他來源的變更不會影響該輸出。多個原始碼檔案可以與單個輸出相關聯。

例如，專門為其所實作的介面而產生的類別即為隔離輸出。

</def>
</deflist>

### Dirty 狀態傳播

KSP 透過以下方式傳播 dirty 狀態：

1. 透過 **解析追蹤（resolution tracing）**：型別解析是從一個檔案巡覽到另一個檔案的唯一方式。當處理器解析型別參照（明確或隱式）時，KSP 會考慮包含該參照的檔案與任何定義了影響該解析之符號的檔案之間的相依性。因此，已解析符號的變更可能會將引用檔案標記為 dirty。

2. 透過 **輸入-輸出對應**：如果原始碼檔案發生變更或受到影響，則與其共享產生輸出的所有其他原始碼檔案也會被標記為受影響。這會根據共享的輸出將相關檔案分組為等價類（equivalence classes）。

> 規則 (1) 和 (2) 可能會反覆觸發。例如，規則 (1) 可以觸發規則 (2)，進而再次觸發規則 (1)。
>
{style="tip"}

## 實作

相依性是由輸入和輸出檔案之間的多對多關係決定的。

以下是 KSP 判斷哪些檔案需要重新處理的方式：

* 如果輸入檔案發生變更，它將始終被重新處理。

   **原因：** 如果輸入發生變更，可能會引入新資訊。處理器需要使用該輸入重新執行。

* 如果輸入檔案發生變更且與某個輸出相關聯，則與該相同輸出相關聯的所有其他輸入檔案也將被重新處理。這會反覆發生，直到沒有新的 dirty 檔案為止。

   **原因：** 一個輸出是由一組輸入組成的。處理器可能需要所有輸入才能重新產生該輸出。

* 如果未變更的輸入檔案不與任何聚合輸出相關聯，它就不會被重新處理。

   **原因：** 此檔案無法影響任何輸出，因為它未變更且不與聚合輸出相關聯。除非符合上述規則之一，否則它不會被重新處理。

例如，假設一個專案具有以下結構：

```none
.
├── src
│   ├── sourceA.kt
│   └── sourceB.kt
└── generated
   ├── outputA
   └── outputB
```

處理器：

1. 讀取 `sourceA`。

2. 產生 `outputA`。

3. 讀取 `sourceB`。

4. 產生 `outputB`。

當 `sourceA` 變更時：

* 如果 `outputB` 是聚合的，KSP 會同時重新處理 `sourceA` 和 `sourceB`。

* 如果 `outputB` 是隔離的，KSP 僅重新處理 `sourceA`。

如果新增 `sourceC`：

* 如果 `outputB` 是聚合的，KSP 會重新處理 `sourceC` 和 `sourceB`。

* 如果 `outputB` 是隔離的，KSP 僅重新處理 `sourceC`。

如果移除 `sourceA` 或 `sourceB`，KSP 不需要重新處理任何檔案。

## 處理器範例

以下專案包含類別 `A` 和 `B`，其中 `A` 繼承 `B`：

```kotlin
// A.kt
@Interesting
class A : B()

// B.kt
open class B

// Example1Processor.kt
class Example1Processor : SymbolProcessor {
   override fun process(resolver: Resolver) {
       val declA = resolver.getSymbolsWithAnnotation("Interesting").first() as KSClassDeclaration
       val declB = declA.superTypes.first().resolve().declaration
       // 不需要 B.kt，因為它可以被 KSP 推導為相依性
       val dependencies = Dependencies(aggregating = true, declA.containingFile!!)
       // outputForA.kt
       val outputName = "outputFor${declA.simpleName.asString()}"
       // outputForA 取決於 A.kt 和 B.kt
       val output = codeGenerator.createNewFile(dependencies, "com.example", outputName, "kt")
       output.write("// $declA : $declB
".toByteArray())
       output.close()
   }
   // ...
}
```

為了產生 `outputForA`，處理器：

1. 透過呼叫 `Resolver.getSymbolsWithAnnotation` 取得 A。

2. 透過在 A 上呼叫 `KSClassDeclaration.superTypes` 取得 B。

KSP 透過解析追蹤來追蹤此關係，並自動將 `B` 記錄為 `A` 的相依性。因此，您不需要明確宣告 `B.kt` 為 `outputForA` 的相依性。

## 回報 Bug

如果您遇到僅在啟用增量處理時才發生的任何錯誤，請在 [GitHub 儲存庫](https://github.com/google/ksp/issues) 中建立問題 (issue) 並附上相關的日誌檔案。

1. 在 `gradle.properties` 中加入以下行來啟用增量處理日誌：

   ```properties
   ksp.incremental.log=true
   ```

2. 執行一次成功的乾淨組建（clean build）。

3. 將產生的日誌檔案複製到其他位置以進行儲存：

   * `build/kspCaches/<source set>/logs/kspDirtySet.log`
   * `build/kspCaches/<source set>/logs/kspSourceToOutputs.log`

4. 修改觸發問題的來源檔案，並再次執行組建。

5. 將成功組建的日誌檔案，以及重現問題之組建的日誌檔案，一併附加到 GitHub 問題中。

### 視覺化符號相依圖

為了協助偵錯增量處理，KSP 可以產生一個 Graphviz DOT 檔案，用以視覺化從指定符號開始的符號相依圖。

啟用增量日誌記錄，並指定要作為視覺化圖表起始點之符號的[完全限定名稱](https://kotlinlang.org/docs/packages.html#package-headers)：

```properties
ksp.incremental.log=true
ksp.incremental.log.graph.origin=<fully-qualified-name>
```

如果您是從命令列使用 KSP，請加入以下選項：

```bash
-incremental-log=true -incremental-log.graph.origin=<fully-qualified-name>
```

DOT 檔案會產生在 `logs` 目錄中。