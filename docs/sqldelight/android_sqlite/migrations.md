{% include 'common/migrations.md' %}

如果您正在使用 `AndroidSqliteDriver`，可以在驱动程序创建期间传入这些回调：

```kotlin
val driver: SqlDriver = AndroidSqliteDriver(
    schema = Database.Schema,
    context = context,
    name = "test.db",
    callback = AndroidSqliteDriver.Callback(
        schema = Database.Schema,
        AfterVersion(3) { driver -> driver.execute(null, "INSERT INTO test (value) VALUES('hello')", 0) },
    )
)
```
