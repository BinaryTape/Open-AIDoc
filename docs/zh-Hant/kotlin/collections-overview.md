[//]: # (title: 集合概覽)

Kotlin 標準函式庫提供了一套全面的工具來處理集合。集合是一組與你正在解決的問題相關、且通常會一起處理的項目群組。集合通常包含相同型別或其子型別的元素。集合中的物件稱為_元素_（elements）或_項目_（items）。

集合 API 是泛型的，因此你可以將相同的函式與介面用於內建型別以及使用者自訂型別。`kotlin.collections` 套件包含集合介面及相關函式。

Kotlin 提供三種主要的集合型別：

* [_List_](collection-types.md#list) 是一種有序集合。它支援透過索引存取，且可以包含重複元素。例如，你可以使用 list 來儲存電話號碼的數字。
* [_Set_](collection-types.md#set) 是唯一元素的集合。它不保證反覆運算順序，但特定實作可以保留插入順序或保持元素排序。例如，你可以使用 set 來儲存彩券上的號碼。
* [_Map_](collection-types.md#map)（或 _dictionary_）是一組鍵值對。每個鍵都是唯一的，並且對應到一個值。例如，你可以使用 map 將員工識別碼與其職位建立關聯。

Kotlin 還提供了 [`ArrayDeque`](collection-types.md#arraydeque)。它是一個雙端佇列，你可以將其用作佇列或堆疊。

> 陣列不是集合的一種型別。請在[何時使用陣列](arrays.md#when-to-use-arrays)中了解如何在陣列與集合之間進行選擇。
>
{style="note"}

若要了解有關 `List`、`Set` 和 `Map` 的資訊，請閱讀相應的章節，或觀看 Kotlin 技術傳教士 Sebastian Aigner 的影片：

<video src="https://www.youtube.com/v/F8jj7e-_jFA" title="Kotlin Collections Overview"/>

## 唯讀與可變集合 {id="read-only-and-mutable-collections"}

每種主要集合型別都有一個唯讀介面（例如 `List`）以及對應的可變介面（例如 `MutableList`）。唯讀介面提供存取元素的操作，而可變介面則新增了用於新增、移除和更新元素的操作。

當呼叫端不需要修改集合時，建議優先使用唯讀介面。這能讓你的意圖在 API 中更明確，並防止透過該介面發生非預期的修改。相較之下，不可變集合在建立後不允許你變更其元素。如需不可變與持久化實作，請使用 [`kotlinx-collections-immutable`](https://kotlinlang.org/api/kotlinx.collections.immutable/) 程式庫。

這些介面構成以下階層結構：

![集合介面階層結構](collections-diagram.png){width="500"}

[`Collection<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-collection/index.html) 是 `List` 和 `Set` 的共用超介面。它提供檢查集合大小等操作。`Collection` 繼承自 `Iterable<T>` 介面，該介面支援對元素進行反覆運算。`Map` 並未繼承 `Collection`。

你可以將 `Collection` 用作適用於不同集合型別之函式的參數。對於特定型別的操作，請使用繼承自 `Collection` 的介面，例如 [`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html) 或 [`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/index.html)。