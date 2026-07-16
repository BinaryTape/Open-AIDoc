## API

如果您想在单个事务下执行多个语句，请使用 `transaction` 函数。

```kotlin
val players = listOf<Player>()
database.playerQueries.transaction {
  players.forEach { player ->
    database.playerQueries.insert(
      player_number = player.number,
      full_name = player.fullName
    )
  }
}
```

要从事务中返回值，请使用 `transactionWithResult` 函数。

```kotlin
val players: `List<Player>` = database.playerQueries.transactionWithResult {
  database.playerQueries.selectAll().executeAsList()
}
```

## 回滚

如果事务中的任何位置发生异常，事务都将回滚。您可以在事务内部的任何位置手动回滚事务，但如果您的事务返回一个值，则需要为该事务指定一个要返回的值。

```kotlin
database.playerQueries.transaction {
  players.forEach { player ->
    if (player.number == 0) rollback()
    database.playerQueries.insert(
      player_number = player.number,
      full_name = player.fullName
    )
  }
}
```

```kotlin
val numberInserted: Int = database.playerQueries.transactionWithResult {
  players.forEach { player ->
    if (player.number == 0) rollback(0)
    database.playerQueries.insert(
      player_number = player.number,
      full_name = player.fullName
    )
  }
  players.size
}
```

## 回调

您可以注册在事务完成或回滚后触发的回调：

```kotlin
database.playerQueries.transaction {
  afterRollback { log("No players were inserted.") }
  afterCommit { log("${players.size} players were inserted.") }

  players.forEach { player ->
    database.playerQueries.insert(
      player_number = player.number,
      full_name = player.fullName
    )
  }
}