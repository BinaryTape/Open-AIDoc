{% if multiplatform %}
## Android SQLite {id="android-sqlite"}
{% else %}
# 외래 키 (Foreign Keys)
{% endif %}

Android SQLite 드라이버의 `onOpen` 콜백을 통해 외래 키 제약 조건(foreign key constraints)을 활성화할 수 있습니다.

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
