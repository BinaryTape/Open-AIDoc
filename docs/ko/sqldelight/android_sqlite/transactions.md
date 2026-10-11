{% include 'common/transactions.md' %}
## 대용량 쿼리의 일관성 {id="consistency-of-large-queries"}

`AndroidSqliteDriver`를 사용할 때 쿼리 결과는 제한된 크기(기본 2MB)의 `CursorWindow`를 통해 읽힙니다. 결과가 한 윈도우에 모두 들어가지 않으면 `AndroidSqliteDriver`는 다음 윈도우를 채우기 위해 구문을 다시 실행합니다. 트랜잭션 외부에서 실행된 쿼리는 윈도우 사이에 다른 스레드에서 커밋된 변경 사항을 볼 수 있어, 데이터베이스에서 일관되지 않은 행(row)을 반환할 수 있습니다.

대용량 쿼리가 일관된 단일 스냅샷을 읽도록 보장하려면 트랜잭션 내부에서 실행하세요.

```kotlin
val players: List<Player> = database.playerQueries.transactionWithResult {
  database.playerQueries.selectAll().executeAsList()
}
```

트랜잭션을 사용하면 트랜잭션이 종료될 때까지 다른 쓰기 작업(writer)이 대기합니다.

`AndroidSqliteDriver`(API 28 이상)에서 더 큰 `windowSizeBytes`를 설정하면 추가 윈도우 생성을 방지할 수 있습니다.

!!! info
    결과가 한 윈도우에 들어가지 않을 수 있는 `RETURNING` 절이 포함된 `INSERT`, `UPDATE` 또는 `DELETE` 구문은 피하세요. 추가 윈도우마다 해당 구문이 다시 실행되므로 변경 사항이 두 번 이상 적용됩니다. 트랜잭션으로도 이를 방지할 수 없습니다.