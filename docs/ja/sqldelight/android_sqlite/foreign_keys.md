{% if multiplatform %}
## Android SQLite {id="android-sqlite"}
{% else %}
# 外部キー
{% endif %}

Android SQLiteドライバーの `onOpen` コールバックを通じて、外部キー制約を有効にすることができます。

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
