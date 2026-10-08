{% if multiplatform %}
## Native SQLite {id="native-sqlite"}
{% else %}
# 외래 키
{% endif %}

데이터베이스 설정에서 외래 키 제약 조건(foreign key constraints)을 활성화하여 Native SQLite 드라이버에 적용할 수 있습니다.

```kotlin
NativeSqliteDriver(
  schema = Database.Schema,
  onConfiguration = { config: DatabaseConfiguration ->
    config.copy(
      extendedConfig = DatabaseConfiguration.Extended(foreignKeyConstraints = true)
    )
  }
)
```
