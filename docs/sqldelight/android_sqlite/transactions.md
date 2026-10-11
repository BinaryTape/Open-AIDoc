{% include 'common/transactions.md' %}
## 大型查询的一致性 {id="consistency-of-large-queries"}

使用 `AndroidSqliteDriver` 时，查询结果是通过大小有限的 `CursorWindow`（默认 2 MB）读取的。当结果无法完全容纳在一个窗口中时，`AndroidSqliteDriver` 会再次执行该语句以填充下一个窗口。在事务外部执行的查询可能会观察到其他线程在窗口切换之间提交的更改，从而从数据库返回不一致的行。

为了确保大型查询读取到单一且一致的快照，请在事务内部执行该查询。

```kotlin
val players: List<Player> = database.playerQueries.transactionWithResult {
  database.playerQueries.selectAll().executeAsList()
}
```

使用事务意味着其他写入者需要等待，直到该事务结束。

在 `AndroidSqliteDriver`（API 28+）上设置更大的 `windowSizeBytes` 可以避免创建额外的窗口。

!!! info
    避免使用带有 `RETURNING` 子句且结果可能无法容纳在一个窗口中的 `INSERT`、`UPDATE` 或 `DELETE` 语句。该语句会针对每个额外的窗口再次执行，因此其更改会被应用多次。事务无法防止这种情况发生。