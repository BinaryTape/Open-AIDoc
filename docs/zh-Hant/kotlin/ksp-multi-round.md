[//]: # (title: 多輪處理)

<web-summary>了解 KSP 如何在多個輪次中執行處理器，以及處理器如何將符號延遲到後續輪次中處理。</web-summary>

KSP 會分輪次執行處理器。在每一輪中，處理器都可以使用先前輪次產生的原始碼檔案。

若要將符號延遲至下一輪處理，請從 `SymbolProcessor.process()` 以 `List<KSAnnotated>` 的形式回傳它們。KSP 會在下一輪將這些符號再次傳遞給處理器。

若要延遲無效的符號，可以使用 `KSAnnotated.validate()` 進行篩選，例如：

```kotlin
override fun process(resolver: Resolver): List<KSAnnotated> {
    val symbols = resolver.getSymbolsWithAnnotation("com.example.annotation.Builder")
    val result = symbols.filter { !it.validate() }.toList()
    symbols
        .filter { it is KSClassDeclaration && it.validate() }
        .forEach { it.accept(BuilderVisitor(), Unit) }
    return result
}
```

> 在 KSP 存儲庫中查看[多輪處理](https://github.com/google/ksp/blob/main/examples/playground/processors/src/main/kotlin/BuilderProcessor.kt)的完整範例。
>
{style="note"}

當整個輪次都沒有產生任何新檔案時，多輪處理即告結束。如果仍有延遲的符號未被處理，KSP 會針對每個留有未處理延遲符號的處理器記錄一則錯誤。

## 將符號延遲至下一輪 {id="defer-symbols-to-the-next-round"}

當需要來自其他處理器的額外資訊時，處理器可以將符號延遲至後續輪次。處理器可以在多個輪次中持續延遲某個符號，直到取得所需資訊為止。一旦資訊齊全，處理器便可著手處理該符號。

僅在下列情況下延遲符號：

* 必須取得額外資訊後才能處理該符號。
* 該符號來自原始碼。

    > 請勿延遲來自 classpath 的符號。KSP 會自動將其篩選排除。
    >
    {style="note"}

例如，為帶有註解的類別產生 builder 的處理器可能需要將所有建構函式參數型別解析為具體型別。在第一輪中，其中一個參數型別可能無法解析。在後續輪次中，由於期間產生的檔案，該型別可能會變得可解析。屆時處理器便能處理該類別。

## 驗證符號 {id="validate-symbols"}

驗證有助於你判斷是否應將符號延遲至後續輪次。處理器應定義正確處理符號所需的資訊。

> 驗證通常需要進行型別解析，這可能會耗費較多資源。請僅檢查處理該符號所需的資訊。
>
{style="tip"}

預設的驗證行為可能不適用於所有使用案例。若要自訂驗證，請使用 `KSValidateVisitor` 並提供一個 `predicate` Lambda 來選取要驗證的符號。

實作自訂驗證時，請使用 `KSType.isError` 來判斷型別是否有效。若 `isError` 為 `true`，代表 KSP 無法解析該型別。你可以利用此資訊來決定是否將處理延遲至後續輪次。

## 存取檔案與符號 {id="accessing-files-and-symbols"}

新產生的檔案與既有檔案皆可透過 `Resolver` 存取。

KSP 提供了兩個用於存取檔案的 API：

* `Resolver.getAllFiles()` 會傳回先前既有檔案與新產生檔案的清單。
* `Resolver.getNewFiles()` 僅傳回上一輪產生的檔案。

請使用 `Resolver.getSymbolsWithAnnotation()` 作為取得相關符號的主要入口點。

在每一輪中，`Resolver.getSymbolsWithAnnotation()` 僅傳回來自新產生檔案的符號，以及上一輪延遲處理的符號。這有助於避免不必要的重複處理。

## 處理器具現化 {id="processor-instantiation"}

KSP 僅會建立一次處理器執行個體。你可以在處理器執行個體中儲存資訊，並在多個輪次中重複使用。

然而，並非所有 KSP 符號都可以在各輪次之間重複使用。當處理器產生新檔案時，符號解析的結果可能會發生變化，進而影響先前已解析符號的有效性。

> 請僅使用當前輪次中傳遞給處理器的 `Resolver` 執行個體。請勿儲存 `Resolver` 並跨輪次重複使用。
>
{style="note"}

## 錯誤與例外處理 {id="error-and-exception-handling"}

### 錯誤 {id="errors"}

處理器可透過呼叫 `KSPLogger.error()` 來回報錯誤。

當處理器回報錯誤時，KSP 會呼叫 `SymbolProcessor.onError()` 而不是 `SymbolProcessor.finish()`。處理作業會在當前輪次完成後停止。

其他處理器在該輪次中仍會繼續正常處理。KSP 僅會在所有處理器完成當前輪次後才處理錯誤。

### 例外 {id="exceptions"}

KSP 會區分由 KSP 擲出的例外與由處理器擲出的例外。這兩種類型都會立即終止處理程序，並透過 `KSPLogger` 記錄為錯誤。

若遇到由 KSP 擲出的例外，請向 KSP 開發人員回報以進行調查。請在 [KSP 問題追蹤器](https://github.com/google/ksp/issues)中建立問題。

在發生錯誤或例外的該輪次結束時，KSP 會對所有處理器呼叫 `SymbolProcessor.onError()`。`SymbolProcessor` 提供了 `onError()` 的預設無操作 (no-op) 實作。覆寫此方法以實作自訂的錯誤處理邏輯。

## 另請參閱 {id="see-also"}

* 了解當原始碼變更時，KSP 如何[決定要重新處理哪些檔案](ksp-incremental.md)。
* 了解 KSP 如何為 Kotlin 程式碼建模，以及[何時解析型別](ksp-kotlin-model.md#when-to-resolve-types)。