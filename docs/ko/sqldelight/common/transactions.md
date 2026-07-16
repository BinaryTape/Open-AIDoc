## API

하나의 트랜잭션(transaction) 내에서 여러 구문을 실행하려면 `transaction` 함수를 사용하세요.

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

트랜잭션에서 값을 반환하려면 `transactionWithResult` 함수를 사용하세요.

```kotlin
val players: `List<Player>` = database.playerQueries.transactionWithResult {
  database.playerQueries.selectAll().executeAsList()
}
```

## Rollback

트랜잭션 내부 어디서든 예외가 발생하면 트랜잭션이 롤백(roll back)됩니다. 트랜잭션 내부의 어느 지점에서든 수동으로 트랜잭션을 롤백할 수 있지만, 트랜잭션이 값을 반환하는 경우에는 반환할 값을 직접 지정해야 합니다.

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

## Callbacks

트랜잭션이 완료되거나 롤백된 후에 실행될 콜백(callback)을 등록할 수 있습니다.

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