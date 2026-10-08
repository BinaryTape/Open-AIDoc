{% if multiplatform %}
## JVM SQLite {id="jvm-sqlite"}
{% else %}
# 외래 키
{% endif %}
드라이버의 속성(properties)에 설정을 전달하여 JVM SQLite 드라이버에서 외래 키 제약 조건(foreign key constraints)을 활성화할 수 있습니다.

```kotlin
JdbcSqliteDriver(
  url = "...", 
  properties = Properties().apply { put("foreign_keys", "true") }
)
```
