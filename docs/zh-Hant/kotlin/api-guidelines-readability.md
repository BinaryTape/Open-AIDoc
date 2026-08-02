[//]: # (title: 可讀性)

建立具備高可讀性的 API 不僅僅是撰寫簡潔的程式碼。
它需要深思熟慮的設計，以簡化整合與使用。
本節探討如何透過考量組合性的函式庫結構、利用領域特定語言 (DSLs) 進行簡明直觀的設定，以及使用擴充函式與屬性來撰寫清晰且易於維護的程式碼，進而提升 API 的可讀性。

## 優先考量明確的組合性

函式庫通常會提供進階運算子以支援自訂。
例如，某項操作可能允許使用者提供自己的資料結構、網路通道、計時器或生命週期觀察者。
然而，透過額外的函式參數導入這些自訂選項會大幅增加 API 的複雜度。

與其為了自訂而增加更多參數，更有效的方法是設計一個能將不同行為組合在一起的 API。
例如，在協程 Flows API 中，[緩衝與合併 (buffering and conflation)](coroutines-flow-operators.md#concurrent-processing-operators) 都是實作為獨立的函式。
這些函式可以與更基礎的操作（如 [`filter`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/filter.html) 和 [`map`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map.html)）鏈結在一起，而不是讓每個基礎操作都接受參數來控制緩衝與合併。

另一個例子是 [Jetpack Compose 中的 Modifiers API](https://developer.android.com/develop/ui/compose/modifiers)。
這讓 Composable 元件只需接受單一 `Modifier` 參數，即可處理常見的自訂選項，例如內邊距 (padding)、尺寸大小與背景顏色。
這種方法避免了讓每個 Composable 都必須為這些自訂選項接受獨立參數的需求，進而精簡 API 並降低複雜度。

```kotlin
Box(
    modifier = Modifier
        .padding(10.dp)
        .onClick { println("Box clicked!") }
        .fillMaxWidth()
        .fillMaxHeight()
        .verticalScroll(rememberScrollState())
        .horizontalScroll(rememberScrollState())
) {
    // 此處為 Box 內容
}
```

## 使用 DSLs

Kotlin 函式庫可以透過提供建立器 DSL 大幅提升可讀性。
使用 DSL 讓您能簡潔地重複領域特定的資料宣告。
例如，參考以下來自 Ktor 伺服器應用程式的範例：

```kotlin
fun Application.module() {
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
        })
    }
    routing {
        post("/article") {
            call.respond<String>(HttpStatusCode.Created, ...)
        }
        get("/article/list") {
            call.respond<List<CreateArticle>>(...)
        }
        get("/article/{id}") {
            call.respond<Article>(...)
        }
    }
}
```

這會設定一個應用程式，安裝設定為使用 JSON 序列化的 `ContentNegotiation` 外掛程式，並設定路由讓應用程式回應多個 `/article` 端點的請求。

關於建立 DSL 的詳細說明，請參閱 [型別安全建立器](type-safe-builders.md)。
在建立函式庫的背景下，以下幾點值得注意：

* DSL 中使用的函式是建立器函式，它們將帶有接收者的 Lambda 作為最後一個參數。
  這種設計讓這些函式在呼叫時不需要圓括號，使語法更加清晰。
  傳入的 Lambda 可用於配置正在建立的實體。在上述範例中，傳遞給 `routing` 函式的 Lambda 用於配置路由細節。
* 建立類別執行個體的工廠函式名稱應與傳回型別相同，並以大寫字母開頭。
  您可以在上述範例中建立 `Json` 執行個體的部分看到這一點。
  這些函式仍可接受 Lambda 參數進行配置。更多資訊請參閱 [編碼慣例](coding-conventions.md#function-names)。
* 由於在編譯時期無法確保在提供給建立器函式的 Lambda 內已設定必要的屬性，因此我們建議將必要的值作為函式參數傳遞。

使用 DSL 建立物件不僅能提升可讀性，還能改善回溯相容性並簡化文件編寫程序。例如，參考以下函式：

```kotlin
fun Json(prettyPrint: Boolean, isLenient: Boolean): Json
```

此函式可以取代 `Json{}` DSL 建立器。然而，DSL 方法具有顯著優點：

* 使用 DSL 建立器比使用一般函式更容易維持回溯相容性，因為增加新的配置選項只需增加新的屬性（或在其他範例中增加新的函式），這屬於回溯相容的變更，而修改現有函式的參數清單則不然。
* 這也讓建立與維護文件變得更容易。您可以分別在每個屬性宣告處編寫文件，而不需要在同一個地方為函式的所有參數編寫文件。

## 使用擴充函式與屬性

我們建議使用 [擴充函式與屬性](extensions.md) 來提升可讀性。

類別與介面應定義類型的核心概念。
額外的功能與資訊應寫成擴充函式與屬性。
這能讓讀者清楚了解，額外的功能可以實作在核心概念之上，而額外的資訊可以從類型中的資料計算得出。

例如，[`CharSequence`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-char-sequence/) 類型（`String` 亦實作了此類型）僅包含存取其內容最基本的資訊與運算子：

```kotlin
interface CharSequence {
    val length: Int
    operator fun get(index: Int): Char
    fun subSequence(startIndex: Int, endIndex: Int): CharSequence
}
```

通常與字串相關的功能大多被定義為擴充函式，這些函式都可以實作在類型的核心概念與基礎 API 之上：

```kotlin
inline fun CharSequence.isEmpty(): Boolean = length == 0
inline fun CharSequence.isNotEmpty(): Boolean = length > 0

inline fun CharSequence.trimStart(predicate: (Char) -> Boolean): CharSequence {
    for (index in this.indices)
        if (!predicate(this[index]))
           return subSequence(index, length)
    return ""
}
```

考慮將計算屬性與一般方法宣告為擴充。
預設情況下，應僅將常規屬性、覆寫與多載運算子宣告為成員。

## 避免使用布林型別作為引數

考慮以下函式：

```kotlin
fun doWork(optimizeForSpeed: Boolean) { ... }
```

如果您在 API 中提供此函式，它可能會以下列方式被呼叫：

```kotlin
doWork(true)
doWork(optimizeForSpeed=true)
```

在第一次呼叫中，除非您是在啟用了參數提示的 IDE 中閱讀程式碼，否則無法推斷該布林引數的用途。
使用具名引數確實能釐清意圖，但無法強制使用者採用這種風格。
因此，為了提升可讀性，您的程式碼不應使用布林型別作為引數。

另一種做法是，API 可以針對由布林引數控制的任務建立一個獨立的函式。
該函式應具有描述性的名稱以指示其用途。

例如，[`Iterable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/) 介面提供了以下擴充：

```kotlin
fun <T, R> Iterable<T>.map(transform: (T) -> R): List<R>
fun <T, R : Any> Iterable<T>.mapNotNull(
    transform: (T) -> R?
): List<R>
```

而不是使用單一方法：

```kotlin
fun <T, R> Iterable<T>.map(
    includeNullResults: Boolean = true, 
    transform: (T) -> R
): List<R>
```

另一種不錯的方法是使用 `enum` 類別來定義不同的操作模式。
如果有多種操作模式，或者您預期這些模式會隨時間改變，這種方法會很有用。

## 適當地使用數值型別

Kotlin 定義了一組您可以在 API 中使用的數值型別。以下是適當使用它們的方法：

* 將 `Int`、`Long` 與 `Double` 型別作為算術型別。它們代表進行計算的值。
* 避免將算術型別用於非算術實體。例如，如果您將 ID 表示為 `Long`，使用者可能會傾向於比較 ID，並假設它們是按順序分配的。
  這可能會導致不可靠或無意義的結果，或者對可能在未經警告的情況下發生變更的實作產生相依性。
  更好的策略是為 ID 抽象定義一個專門的類別。您可以使用 [內嵌值類別](inline-classes.md) 來建立此類抽象，而不影響效能。請參閱 [`Duration`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) 類別作為範例。
* `Byte`、`Float` 與 `Short` 型別是記憶體佈局型別。它們用於限制儲存值可用的記憶體量，例如在快取中或透過網路傳輸資料時。
  這些型別應僅在底層資料能可靠地放入該型別且不需要計算時才使用。
* 無符號整數型別 `UByte`、`UShort`、`UInt` 與 `ULong` 應被用於利用給定格式中完整的正值範圍。它們適用於需要超出有符號型別範圍的值或與原生程式庫互通的場景。然而，應避免在領域僅需要[非負整數](unsigned-integer-types.md#non-goals)的情況下使用它們。

## 下一步

在指南的下一部分中，您將學習關於一致性的內容。

[前往下一部分](api-guidelines-consistency.md)