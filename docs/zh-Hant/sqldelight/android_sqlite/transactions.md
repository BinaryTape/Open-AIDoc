{% include 'common/transactions.md' %}
## 大型查詢的一致性 {id="consistency-of-large-queries"}

使用 `AndroidSqliteDriver` 時，查詢結果是透過大小有限的 `CursorWindow` 讀取的（預設為 2 MB）。當結果無法容納在單一視窗中時，`AndroidSqliteDriver` 會再次執行該陳述式以填滿下一個視窗。若在交易之外執行查詢，可能會在不同視窗讀取之間觀察到其他執行緒所提交的變更，進而從資料庫傳回不一致的資料列。

為確保大型查詢讀取到單一且一致的快照，請在交易中執行該查詢。

```kotlin
val players: List<Player> = database.playerQueries.transactionWithResult {
  database.playerQueries.selectAll().executeAsList()
}
```

使用交易意味著其他寫入者必須等待至交易結束為止。

在 `AndroidSqliteDriver`（API 28+）上設定較大的 `windowSizeBytes` 可以避免建立額外的視窗。

!!! info
    請避免使用帶有 `RETURNING` 子句且結果可能無法容納在單一視窗中的 `INSERT`、`UPDATE` 或 `DELETE` 陳述式。該陳述式會為每個額外的視窗再次執行，因此其變更會被套用多次。交易無法防止此情況發生。