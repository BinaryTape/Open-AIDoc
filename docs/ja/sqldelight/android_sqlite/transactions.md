{% include 'common/transactions.md' %}
## 大規模クエリの一貫性 {id="consistency-of-large-queries"}

`AndroidSqliteDriver` を使用する場合、クエリ結果は制限されたサイズ（デフォルトで 2 MB）の `CursorWindow` を介して読み取られます。結果が1つのウィンドウに収まらない場合、`AndroidSqliteDriver` は次のウィンドウを埋めるためにステートメントを再実行します。トランザクション外で実行されたクエリは、ウィンドウの処理間に別のスレッドによってコミットされた変更を検知する可能性があり、データベースから一貫性のない行を返すことがあります。

大規模なクエリが単一の一貫したスナップショットを読み取ることを保証するには、トランザクション内でクエリを実行してください。

```kotlin
val players: List<Player> = database.playerQueries.transactionWithResult {
  database.playerQueries.selectAll().executeAsList()
}
```

トランザクションを使用すると、他の書き込み処理はそのトランザクションが終了するまで待機することになります。

`AndroidSqliteDriver`（API 28以降）でより大きな `windowSizeBytes` を設定することで、追加ウィンドウの作成を回避できます。

!!! info
    結果が1つのウィンドウに収まらない可能性がある、`RETURNING` 句を含む `INSERT`、`UPDATE`、または `DELETE` ステートメントの使用は避けてください。追加のウィンドウごとにステートメントが再実行されるため、変更が複数回適用されてしまいます。トランザクションを使用してもこれを防ぐことはできません。