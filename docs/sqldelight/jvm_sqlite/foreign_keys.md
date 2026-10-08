{% if multiplatform %}
## JVM SQLite {id="jvm-sqlite"}
{% else %}
# 外键
{% endif %}
您可以通过将设置传递给驱动程序的属性，来启用 JVM SQLite 驱动程序的外键约束。

```kotlin
JdbcSqliteDriver(
  url = "...", 
  properties = Properties().apply { put("foreign_keys", "true") }
)
```
