{% include 'common/migrations.md' %}

`JdbcSqliteDriver`를 사용하는 경우, 드라이버를 생성할 때 스키마와 콜백을 전달할 수 있습니다.
데이터베이스에 현재 스키마 버전을 저장하기 위해 `PRAGMA user_version`을 사용합니다.

```kotlin
val driver: SqlDriver = JdbcSqliteDriver(
    url = "jdbc:sqlite:test.db",
    properties = Properties(),
    schema = Database.Schema,
    callbacks = arrayOf(
        AfterVersion(3) { driver -> driver.execute(null, "INSERT INTO test (value) VALUES('hello')", 0) }
    )
)
```
