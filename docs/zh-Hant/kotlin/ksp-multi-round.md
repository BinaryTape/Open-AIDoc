[//]: # (title: 多輪處理)

KSP 支援**多輪處理** (multiple round processing)，即透過多個輪次處理檔案。這意味著後續輪次會將先前輪次的輸出作為額外輸入。

## 對處理器的變更

若要使用多輪處理，`SymbolProcessor.process()` 函式需要針對無效符號（invalid symbols）傳回一個延遲符號（deferred symbols）清單 (`List<KSAnnotated>`)。請使用 `KSAnnotated.validate()` 來篩選無效符號，以便將其延遲至下一輪。

以下範例程式碼顯示如何透過驗證檢查來延遲無效符號：

```kotlin
override fun process(resolver: Resolver): `List<KSAnnotated>` {
    val symbols = resolver.getSymbolsWithAnnotation("com.example.annotation.Builder")
    val result = symbols.filter { !it.validate() }
    symbols
        .filter { it is KSClassDeclaration && it.validate() }
        .map { it.accept(BuilderVisitor(), Unit) }
    return result
}
```

## 多輪行為

### 將符號延遲至下一輪

處理器可以將特定符號的處理延遲到下一輪。當符號被延遲時，處理器是在等待其他處理器提供額外資訊。它可以根據需要持續延遲該符號多個輪次。一旦其他處理器提供了所需資訊，該處理器便可處理該延遲符號。處理器應僅延遲缺乏必要資訊的無效符號。因此，處理器**不應**延遲來自類別路徑（classpath）的符號，KSP 也會過濾掉任何非來自原始碼的延遲符號。

例如，為一個被註解的類別建立 builder 的處理器，可能要求其建構函式的所有參數型別都是有效的（解析為具體型別）。在第一輪中，其中一個參數型別無法解析。接著在第二輪中，由於第一輪產生的檔案，該型別變得可以解析了。

### 驗證符號

判斷符號是否應延遲的一個便捷方法是透過驗證。處理器應了解哪些資訊是正確處理符號所必需的。
請注意，驗證通常需要進行解析，這可能會產生很大開銷，因此我們建議僅檢查必要的內容。延續先前的範例，builder 處理器的理想驗證僅需檢查被註解符號之建構函式的所有已解析參數型別是否包含 `isError == false`。

KSP 提供了一個預設的驗證工具。如需更多資訊，請參閱[進階](#advanced)章節。

### 終止條件

當一整輪處理未產生任何新檔案時，多輪處理即告終止。如果在滿足終止條件時仍存在未處理的延遲符號，KSP 會為每個擁有未處理延遲符號的處理器記錄一條錯誤訊息。

### 每一輪可存取的檔案

新產生的檔案與現有檔案均可透過 `Resolver` 存取。KSP 提供了兩個用於存取檔案的 API：`Resolver.getAllFiles()` 和 `Resolver.getNewFiles()`。`getAllFiles()` 傳回現有檔案與新產生檔案的合併清單，而 `getNewFiles()` 僅傳回新產生的檔案。

### getSymbolsAnnotatedWith() 的變更

為了避免對符號進行不必要的重複處理，`getSymbolsAnnotatedWith()` 僅傳回在新產生檔案中找到的符號，以及來自上一輪的延遲符號。

### 處理器具現化

處理器執行個體僅會建立一次，這意味著您可以在處理器物件中儲存資訊，供後續輪次使用。

### 跨輪次資訊的一致性

所有 KSP 符號都無法在多個輪次之間重複使用，因為解析結果可能會根據前一輪產生的內容而改變。然而，由於 KSP 不允許修改現有程式碼，某些資訊（例如符號名稱的字串值）仍應是可重複使用的。
總結來說，處理器可以儲存來自先前輪次的資訊，但需要記住這些資訊在未來的輪次中可能會失效。

### 錯誤與例外處理

當發生錯誤（由處理器呼叫 `KSPLogger.error()` 定義）或例外時，處理將在當前輪次完成後停止。所有處理器都將呼叫 `onError()` 方法，且**不會**呼叫 `finish()` 方法。

請注意，即使發生了錯誤，其他處理器在該輪次中仍會繼續正常處理。這意味著錯誤處理發生在該輪次處理完成之後。

發生例外時，KSP 會嘗試區分來自 KSP 的例外與來自處理器的例外。例外將導致處理立即終止，並在 KSPLogger 中記錄為錯誤。來自 KSP 的例外應回報給 KSP 開發者以進行進一步調查。在發生例外或錯誤的輪次結束時，所有處理器都將叫用 `onError()` 函式以執行各自的錯誤處理。

KSP 在 `SymbolProcessor` 介面中為 `onError()` 提供了一個預設的無操作（no-op）實作。您可以覆寫此方法來提供您自己的錯誤處理邏輯。

## 進階

### 預設的驗證行為

KSP 提供的預設驗證邏輯會驗證被驗證符號之封閉作用域（enclosing scope）內所有直接可到達的符號。
預設驗證會檢查封閉作用域中的參考是否可解析為具體型別，但不會遞迴地進入被參考的型別執行驗證。

### 編寫您自己的驗證邏輯

預設的驗證行為可能並不適用於所有情況。您可以參考 `KSValidateVisitor` 並透過提供自訂的 `predicate` lambda 來編寫自己的驗證邏輯，該 lambda 隨後會由 `KSValidateVisitor` 用於篩選需要檢查的符號。