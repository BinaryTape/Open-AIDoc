## API

若要在單一交易中執行多個陳述式，請使用 `transaction` 函式。

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

若要從交易傳回值，請使用 `transactionWithResult` 函式。

```kotlin
val players: `List<Player>` = database.playerQueries.transactionWithResult {
  database.playerQueries.selectAll().executeAsList()
}
```

## 回復

如果在交易中的任何位置發生例外，交易將會回復。您可以在交易內的任何地方手動回復交易，但如果您的交易會傳回值，則需要為交易指定一個傳回值。

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

## 回呼

您可以註冊在交易完成或回復後執行的回呼（Callbacks）：

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