{% include 'common/migrations.md' %}

`JdbcSqliteDriver` を使用している場合は、ドライバーの作成時にスキーマとコールバックを渡すことができます。
データベースに現在のスキーマバージョンを保存するために `PRAGMA user_version` を使用します。

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
