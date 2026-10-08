{% if multiplatform %}
## JVM SQLite {id="jvm-sqlite"}
{% else %}
# 外部キー
{% endif %}
JVM SQLiteドライバで外部キー制約を有効にするには、ドライバのプロパティに設定を渡します。

```kotlin
JdbcSqliteDriver(
  url = "...", 
  properties = Properties().apply { put("foreign_keys", "true") }
)
```
