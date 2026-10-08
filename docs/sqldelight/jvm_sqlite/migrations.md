{% include 'common/migrations.md' %}

如果您正在使用 `JdbcSqliteDriver`，可以在创建驱动程序时传入架构和回调。
它使用 `PRAGMA user_version` 在数据库中存储架构的当前版本。

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
