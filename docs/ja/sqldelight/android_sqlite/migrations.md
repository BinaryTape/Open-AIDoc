{% include 'common/migrations.md' %}

`AndroidSqliteDriver` を使用している場合は、ドライバの作成時にこれらのコールバックを渡すことができます。

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
