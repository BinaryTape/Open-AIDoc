{% if multiplatform %}
## Android SQLite {id="android-sqlite"}
{% else %}
# 外鍵
{% endif %}

您可以透過驅動程式的 `onOpen` 回呼為 Android SQLite 驅動程式啟用外鍵約束。

```kotlin
AndroidSqliteDriver(
  schema = Database.Schema,
  callback = object : AndroidSqliteDriver.Callback(Database.Schema) {
    override fun onOpen(db: SupportSQLiteDatabase) {
      db.setForeignKeyConstraintsEnabled(true)
    }
  }
)
```
