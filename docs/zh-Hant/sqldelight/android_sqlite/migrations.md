{% include 'common/migrations.md' %}

如果你正在使用 `AndroidSqliteDriver`，可以在建立驅動程式時傳入這些回呼：

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
